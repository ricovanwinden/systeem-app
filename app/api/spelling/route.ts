import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { tekst } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY niet ingesteld" }, { status: 500 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Verbeter de spelling en grammatica van de onderstaande Nederlandse tekst. Behoud de opmaak, regeleinden en inhoud exact. Geef ALLEEN de verbeterde tekst terug, geen uitleg of commentaar.\n\n${tekst}`,
      }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try { detail = JSON.parse(body)?.error?.message ?? body; } catch {}
    return Response.json({ error: `API fout ${res.status}: ${detail}` }, { status: res.status });
  }

  const data = await res.json();
  return Response.json({ tekst: data.content?.[0]?.text ?? tekst });
}
