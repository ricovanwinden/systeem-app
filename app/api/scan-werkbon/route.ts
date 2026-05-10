import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { base64, mediaType } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY niet ingesteld in .env.local" }, { status: 500 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          {
            type: "text",
            text: `Lees deze werkbon en geef ALLEEN een JSON object terug, geen andere tekst, met deze velden:
{
  "opdrachtgever": "naam van het bedrijf/opdrachtgever",
  "projectnaam": "naam van het project",
  "projectnummer": "projectcode of werkopdrachtnummer",
  "datum": "datum in YYYY-MM-DD formaat",
  "monteur": "naam van de monteur/uitvoering door",
  "werkzaamheden": "type werkzaamheden"
}
Als een veld niet gevonden wordt, gebruik dan een lege string.`,
          },
        ],
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
  const tekst = data.content?.[0]?.text ?? "";
  const clean = tekst.replace(/```json|```/g, "").trim();

  try {
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: "Kon geen JSON parsen", raw: tekst }, { status: 500 });
  }
}
