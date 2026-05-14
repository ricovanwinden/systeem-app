import { NextRequest } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
};

export async function POST(request: NextRequest) {
  const { gebruikersnaam, wachtwoord } = await request.json();

  if (!gebruikersnaam || !wachtwoord) {
    return Response.json({ error: "Velden ontbreken" }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gebruikers?gebruikersnaam=eq.${encodeURIComponent(gebruikersnaam)}&wachtwoord=eq.${encodeURIComponent(wachtwoord)}&select=*`,
    { headers: supabaseHeaders }
  );

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return Response.json({ error: "Gebruikersnaam of wachtwoord klopt niet." }, { status: 401 });
  }

  const gebruiker = data[0];

  await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/login_log`, {
      method: "POST",
      headers: { ...supabaseHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ gebruiker_id: gebruiker.id, naam: gebruiker.naam }),
    }),
    fetch(`${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${gebruiker.id}`, {
      method: "PATCH",
      headers: { ...supabaseHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ laatste_login: new Date().toISOString() }),
    }),
  ]);

  return Response.json({ gebruiker });
}
