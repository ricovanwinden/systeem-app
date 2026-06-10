"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gebruikersnaam, wachtwoord }),
      });
      const data = await res.json();
      if (!res.ok) { setFout(data.error || "Inloggen mislukt."); return; }
      localStorage.setItem("gebruiker", JSON.stringify(data.gebruiker));
      localStorage.setItem("sessionToken", data.sessionToken);
      router.push("/");
    } catch {
      setFout("Verbindingsfout. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: 20 }}>
      <div style={{ background: "#1e293b", borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center" as const, marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 18 }}>Beheer inloggen</div>
          <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Van Winden Techniek</div>
        </div>
        <form onSubmit={login}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Gebruikersnaam</label>
            <input
              autoComplete="username"
              value={gebruikersnaam}
              onChange={e => setGebruikersnaam(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
              placeholder="gebruikersnaam"
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Wachtwoord</label>
            <input
              type="password"
              autoComplete="current-password"
              value={wachtwoord}
              onChange={e => setWachtwoord(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
              placeholder="••••••••"
            />
          </div>
          {fout && <div style={{ marginBottom: 14, padding: "8px 12px", borderRadius: 8, background: "#450a0a", color: "#fca5a5", fontSize: 13 }}>{fout}</div>}
          <button
            type="submit"
            disabled={bezig}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: bezig ? "#334155" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", fontWeight: 700, fontSize: 15, cursor: bezig ? "not-allowed" : "pointer" }}
          >
            {bezig ? "Bezig..." : "Inloggen"}
          </button>
        </form>
        <div style={{ textAlign: "center" as const, marginTop: 20 }}>
          <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer" }}>← Terug naar app</button>
        </div>
      </div>
    </div>
  );
}
