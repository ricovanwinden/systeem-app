import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken, tokenUitHeader } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

function checkAdmin(request: NextRequest): boolean {
  const payload = verifyToken(tokenUitHeader(request));
  return payload?.rol === "admin";
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "Geen toegang" }, { status: 403 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gebruikers?select=id,naam,gebruikersnaam,rol,laatste_login,aangemaakt_op&order=aangemaakt_op.desc`,
    { headers: supabaseHeaders }
  );
  return Response.json(await res.json());
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { naam, gebruikersnaam, wachtwoord } = await request.json();

  if (!naam || !gebruikersnaam || !wachtwoord) {
    return Response.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  // Wachtwoord hashen voor opslag
  const hash = await bcrypt.hash(wachtwoord, 10);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/gebruikers`, {
    method: "POST",
    headers: { ...supabaseHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ naam, gebruikersnaam, wachtwoord: hash, rol: "monteur" }),
  });

  if (!res.ok) {
    return Response.json({ error: "Kon gebruiker niet toevoegen" }, { status: 500 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "Geen toegang" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return Response.json({ error: "ID ontbreekt" }, { status: 400 });

  await fetch(`${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${id}`, {
    method: "DELETE",
    headers: supabaseHeaders,
  });

  return Response.json({ ok: true });
}
