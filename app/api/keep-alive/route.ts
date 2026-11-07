export const dynamic = "force-dynamic";

// Wordt dagelijks aangeroepen door Vercel Cron (zie vercel.json), zodat het
// gratis Supabase-project niet na 7 dagen zonder activiteit gepauzeerd wordt.
export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ ok: false }, { status: 503 });

  const res = await fetch(`${url}/rest/v1/gebruikers?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 500 });
}
