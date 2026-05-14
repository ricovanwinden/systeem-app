"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [gebruikersnaam, setGebruikersnaam] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [laden, setLaden] = useState(false);

  async function inloggen() {
    setLaden(true);
    setFout("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gebruikersnaam, wachtwoord }),
    });

    const data = await res.json();

    if (!res.ok) {
      setFout(data.error ?? "Inloggen mislukt.");
      setLaden(false);
      return;
    }

    const gebruiker = data.gebruiker;
    localStorage.setItem("gebruiker", JSON.stringify(gebruiker));

    if (gebruiker.rol === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }

    setLaden(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔥</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>VanWinden Techniek</div>
          <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Inloggen om verder te gaan</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Gebruikersnaam</label>
          <input
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            value={gebruikersnaam}
            onChange={e => setGebruikersnaam(e.target.value)}
            placeholder="jouw gebruikersnaam"
            onKeyDown={e => e.key === "Enter" && inloggen()}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Wachtwoord</label>
          <input
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }}
            type="password"
            value={wachtwoord}
            onChange={e => setWachtwoord(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && inloggen()}
          />
        </div>

        {fout && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", color: "#991b1b", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            ⚠️ {fout}
          </div>
        )}

        <button
          onClick={inloggen}
          disabled={laden}
          style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: laden ? "not-allowed" : "pointer", opacity: laden ? 0.7 : 1 }}
        >
          {laden ? "Inloggen..." : "Inloggen"}
        </button>
      </div>
    </div>
  );
}
