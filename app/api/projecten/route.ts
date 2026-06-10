import { NextRequest } from "next/server";
import { verifyToken, tokenUitHeader } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export async function GET(request: NextRequest) {
  const payload = verifyToken(tokenUitHeader(request));
  if (!payload) return Response.json({ error: "Niet ingelogd" }, { status: 401 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gedeelde_projecten?select=id,projectnummer,projectnaam,opdrachtgever,datum,werkzaamheden,opgeslagen_door,opgeslagen_op&order=opgeslagen_op.desc&limit=500`,
    { headers: sbHeaders }
  );
  return Response.json(await res.json());
}

export async function POST(request: NextRequest) {
  const payload = verifyToken(tokenUitHeader(request));
  if (!payload) return Response.json({ error: "Niet ingelogd" }, { status: 401 });

  const body = await request.json();
  const { projectnummer, projectnaam, opdrachtgever, datum, werkzaamheden, data } = body;

  if (!data) return Response.json({ error: "Geen data" }, { status: 400 });

  // Haal naam op uit gebruikerstabel
  const userRes = await fetch(
    `${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${payload.id}&select=naam`,
    { headers: sbHeaders }
  );
  const users = await userRes.json();
  const naam = users[0]?.naam ?? "Onbekend";

  const res = await fetch(`${SUPABASE_URL}/rest/v1/gedeelde_projecten`, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "return=representation" },
    body: JSON.stringify({ projectnummer, projectnaam, opdrachtgever, datum, werkzaamheden, opgeslagen_door: naam, data }),
  });

  if (!res.ok) return Response.json({ error: "Opslaan mislukt" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const payload = verifyToken(tokenUitHeader(request));
  if (!payload) return Response.json({ error: "Niet ingelogd" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID ontbreekt" }, { status: 400 });

  // Admin mag alles verwijderen, monteur alleen eigen
  let url = `${SUPABASE_URL}/rest/v1/gedeelde_projecten?id=eq.${id}`;
  if (payload.rol !== "admin") {
    const userRes = await fetch(
      `${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${payload.id}&select=naam`,
      { headers: sbHeaders }
    );
    const users = await userRes.json();
    const naam = users[0]?.naam ?? "";
    url += `&opgeslagen_door=eq.${encodeURIComponent(naam)}`;
  }

  await fetch(url, { method: "DELETE", headers: sbHeaders });
  return Response.json({ ok: true });
}
