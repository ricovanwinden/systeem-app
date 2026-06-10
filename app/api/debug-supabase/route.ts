export async function GET() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const info: Record<string, any> = {
    url_set: !!url,
    key_set: !!key,
    url_value: url ? url.slice(0, 40) + "..." : "LEEG",
    key_length: key?.length ?? 0,
    key_prefix: key ? key.slice(0, 20) : "LEEG",
    node_version: process.version,
  };

  if (!url || !key) {
    return Response.json({ error: "Env vars ontbreken", info });
  }

  try {
    const res = await fetch(
      `${url}/rest/v1/gedeelde_projecten?select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );
    const body = await res.text();
    info.supabase_status = res.status;
    info.supabase_ok = res.ok;
    info.supabase_body_start = body.slice(0, 100);
    return Response.json({ ok: res.ok, info });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const name = e instanceof Error ? e.name : "unknown";
    const cause = e instanceof Error && (e as any).cause ? String((e as any).cause) : "";
    const stack = e instanceof Error ? (e.stack ?? "").slice(0, 300) : "";
    return Response.json({ error: true, name, msg, cause, stack, info }, { status: 500 });
  }
}
