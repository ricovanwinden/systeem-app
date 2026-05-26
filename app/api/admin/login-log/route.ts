import { NextRequest } from "next/server";
import { verifyToken, tokenUitHeader } from "@/lib/auth";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const payload = verifyToken(tokenUitHeader(request));
  if (payload?.rol !== "admin") {
    return Response.json({ error: "Geen toegang" }, { status: 403 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/login_log?select=*&order=ingelogd_op.desc&limit=50`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    }
  );
  return Response.json(await res.json());
}
