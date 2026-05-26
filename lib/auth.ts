import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET;

export function createToken(payload: { id: string; rol: string }): string {
  if (!SECRET) throw new Error("SESSION_SECRET niet ingesteld in .env.local");
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 dagen
  });
  const encoded = Buffer.from(data).toString("base64url");
  const hmac = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${hmac}`;
}

export function verifyToken(token: string | null | undefined): { id: string; rol: string } | null {
  if (!SECRET || !token) return null;
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const encoded = token.slice(0, dot);
    const hmac = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expected, "hex"))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return { id: payload.id, rol: payload.rol };
  } catch {
    return null;
  }
}

/** Haal Bearer token op uit Authorization header */
export function tokenUitHeader(request: Request): string | null {
  const auth = request.headers.get("Authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}
