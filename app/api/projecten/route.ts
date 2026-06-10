import { NextRequest } from "next/server";

function getSupabaseHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return Response.json([], { status: 200 });
    const res = await fetch(
      `${url}/rest/v1/gedeelde_projecten?select=id,projectnummer,projectnaam,opdrachtgever,datum,werkzaamheden,opgeslagen_door,opgeslagen_op&order=opgeslagen_op.desc&limit=500`,
      { headers: getSupabaseHeaders(key) }
    );
    if (!res.ok) return Response.json([], { status: 200 });
    return Response.json(await res.json());
  } catch {
    return Response.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) return Response.json({ error: "SUPABASE_URL niet ingesteld" }, { status: 500 });
  if (!key) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY niet ingesteld" }, { status: 500 });

  let body: any;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Ongeldige JSON in request body" }, { status: 400 });
  }

  const { projectnummer, projectnaam, opdrachtgever, datum, werkzaamheden, opgeslagen_door, data } = body ?? {};
  if (!data) return Response.json({ error: "Geen data ontvangen" }, { status: 400 });

  let bodyStr: string;
  try {
    bodyStr = JSON.stringify({
      projectnummer: projectnummer ?? null,
      projectnaam: projectnaam ?? null,
      opdrachtgever: opdrachtgever ?? null,
      datum: datum ?? null,
      werkzaamheden: werkzaamheden ?? null,
      opgeslagen_door: opgeslagen_door || "Onbekend",
      data,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Data kon niet worden omgezet naar JSON: ${msg}` }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/gedeelde_projecten`, {
      method: "POST",
      headers: { ...getSupabaseHeaders(key), Prefer: "return=representation" },
      body: bodyStr,
    });
    const resText = await res.text();
    if (!res.ok) {
      return Response.json({ error: `Supabase ${res.status}: ${resText.slice(0, 300)}` }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = e instanceof Error && (e as any).cause instanceof Error
      ? (e as any).cause.message : "";
    return Response.json({
      error: `Verbindingsfout: ${msg}${cause ? ` (${cause})` : ""}. URL: ${url}`,
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ error: "Niet geconfigureerd" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID ontbreekt" }, { status: 400 });

  await fetch(`${url}/rest/v1/gedeelde_projecten?id=eq.${id}`, {
    method: "DELETE",
    headers: getSupabaseHeaders(key),
  });
  return Response.json({ ok: true });
}
