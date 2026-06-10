import { NextRequest } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET() {
  try {
    if (!SUPABASE_URL || !SERVICE_KEY) return Response.json([], { status: 200 });
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/gedeelde_projecten?select=id,projectnummer,projectnaam,opdrachtgever,datum,werkzaamheden,opgeslagen_door,opgeslagen_op&order=opgeslagen_op.desc&limit=500`,
      { headers: sbHeaders }
    );
    if (!res.ok) return Response.json([], { status: 200 });
    return Response.json(await res.json());
  } catch {
    return Response.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_URL) return Response.json({ error: "SUPABASE_URL niet ingesteld" }, { status: 500 });
    if (!SERVICE_KEY) return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY niet ingesteld" }, { status: 500 });

    const body = await request.json();
    const { projectnummer, projectnaam, opdrachtgever, datum, werkzaamheden, opgeslagen_door, data } = body;

    if (!data) return Response.json({ error: "Geen data" }, { status: 400 });

    const naam = opgeslagen_door || "Onbekend";

    const res = await fetch(`${SUPABASE_URL}/rest/v1/gedeelde_projecten`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "return=representation" },
      body: JSON.stringify({ projectnummer, projectnaam, opdrachtgever, datum, werkzaamheden, opgeslagen_door: naam, data }),
    });

    const resText = await res.text();
    if (!res.ok) {
      return Response.json({ error: `Supabase ${res.status}: ${resText}` }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const cause = e instanceof Error && (e as any).cause instanceof Error ? (e as any).cause.message : "";
    return Response.json({ error: `Crash: ${msg}${cause ? ` (${cause})` : ""}. URL: ${SUPABASE_URL || "LEEG"}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID ontbreekt" }, { status: 400 });

  await fetch(`${SUPABASE_URL}/rest/v1/gedeelde_projecten?id=eq.${id}`, {
    method: "DELETE",
    headers: sbHeaders,
  });
  return Response.json({ ok: true });
}
