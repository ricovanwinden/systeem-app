import { NextRequest } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gedeelde_projecten?select=id,projectnummer,projectnaam,opdrachtgever,datum,werkzaamheden,opgeslagen_door,opgeslagen_op&order=opgeslagen_op.desc&limit=500`,
    { headers: sbHeaders }
  );
  if (!res.ok) return Response.json([], { status: 200 });
  return Response.json(await res.json());
}

export async function POST(request: NextRequest) {
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
    console.error("Supabase fout:", res.status, resText);
    return Response.json({ error: `Supabase ${res.status}: ${resText}` }, { status: 500 });
  }
  return Response.json({ ok: true });
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
