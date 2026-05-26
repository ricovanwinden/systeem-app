import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/auth";

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

  // Zoek gebruiker op naam — wachtwoord NOOIT in de URL zetten
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/gebruikers?gebruikersnaam=eq.${encodeURIComponent(gebruikersnaam)}&select=*`,
    { headers: supabaseHeaders }
  );

  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) {
    return Response.json({ error: "Gebruikersnaam of wachtwoord klopt niet." }, { status: 401 });
  }

  const gebruiker = data[0];

  // Wachtwoord vergelijken — met automatische migratie van plain-text naar bcrypt
  let wachtwoordKlopt = false;

  if (gebruiker.wachtwoord?.startsWith("$2")) {
    // Bcrypt hash — veilig vergelijken
    wachtwoordKlopt = await bcrypt.compare(wachtwoord, gebruiker.wachtwoord);
  } else {
    // Oud plain-text wachtwoord — vergelijk en upgrade meteen naar bcrypt
    wachtwoordKlopt = wachtwoord === gebruiker.wachtwoord;
    if (wachtwoordKlopt) {
      const hash = await bcrypt.hash(wachtwoord, 10);
      await fetch(`${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${gebruiker.id}`, {
        method: "PATCH",
        headers: { ...supabaseHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ wachtwoord: hash }),
      });
    }
  }

  if (!wachtwoordKlopt) {
    return Response.json({ error: "Gebruikersnaam of wachtwoord klopt niet." }, { status: 401 });
  }

  // Login loggen + laatste login bijwerken
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

  // Session token aanmaken
  const sessionToken = createToken({ id: gebruiker.id, rol: gebruiker.rol });

  // Wachtwoord NIET terugsturen naar de browser
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { wachtwoord: _w, ...gebruikerZonderWachtwoord } = gebruiker;

  return Response.json({ gebruiker: gebruikerZonderWachtwoord, sessionToken });
}
