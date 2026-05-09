"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SUPABASE_URL = "https://ukpsvzsczqgjoixfugwj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcHN2enNjenFnam9peGZ1Z3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDY1MTEsImV4cCI6MjA5MzkyMjUxMX0.j0XF0T5mzWMOXu0hnxRChT78ix0VK38l6S9PxY5xhPM";

export default function AdminPage() {
  const router = useRouter();
  const [gebruikers, setGebruikers] = useState<any[]>([]);
  const [loginLog, setLoginLog] = useState<any[]>([]);
  const [nieuwNaam, setNieuwNaam] = useState("");
  const [nieuwGebruikersnaam, setNieuwGebruikersnaam] = useState("");
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState("");
  const [melding, setMelding] = useState("");
  const [tab, setTab] = useState<"gebruikers"|"log">("gebruikers");

  useEffect(() => {
    const g = localStorage.getItem("gebruiker");
    if (!g) { router.push("/login"); return; }
    const gebruiker = JSON.parse(g);
    if (gebruiker.rol !== "admin") { router.push("/"); return; }
    laadData();
  }, []);

  async function laadData() {
    const resG = await fetch(`${SUPABASE_URL}/rest/v1/gebruikers?select=*&order=aangemaakt_op.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    setGebruikers(await resG.json());

    const resL = await fetch(`${SUPABASE_URL}/rest/v1/login_log?select=*&order=ingelogd_op.desc&limit=50`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    setLoginLog(await resL.json());
  }

  async function voegToe() {
    if (!nieuwNaam || !nieuwGebruikersnaam || !nieuwWachtwoord) { setMelding("Vul alle velden in."); return; }
    await fetch(`${SUPABASE_URL}/rest/v1/gebruikers`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ naam: nieuwNaam, gebruikersnaam: nieuwGebruikersnaam, wachtwoord: nieuwWachtwoord, rol: "monteur" }),
    });
    setMelding(`✅ ${nieuwNaam} toegevoegd!`);
    setNieuwNaam(""); setNieuwGebruikersnaam(""); setNieuwWachtwoord("");
    laadData();
  }

  async function verwijder(id: string, naam: string) {
    if (!confirm(`Weet je zeker dat je ${naam} wilt verwijderen?`)) return;
    await fetch(`${SUPABASE_URL}/rest/v1/gebruikers?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    laadData();
  }

  const F: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🔧</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Beheer</div>
            <div style={{ color: "#475569", fontSize: 11 }}>VanWinden Techniek</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>← App</button>
          <button onClick={() => { localStorage.removeItem("gebruiker"); router.push("/login"); }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13 }}>Uitloggen</button>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>

        {/* Nieuwe gebruiker */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", marginBottom: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>➕ Nieuwe collega toevoegen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Naam</label><input style={F} value={nieuwNaam} onChange={e => setNieuwNaam(e.target.value)} placeholder="Jan de Vries" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Gebruikersnaam</label><input style={F} value={nieuwGebruikersnaam} onChange={e => setNieuwGebruikersnaam(e.target.value)} placeholder="jan" /></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase" as const }}>Wachtwoord</label><input style={F} value={nieuwWachtwoord} onChange={e => setNieuwWachtwoord(e.target.value)} placeholder="wachtwoord" /></div>
          </div>
          {melding && <div style={{ marginBottom: 12, fontSize: 13, color: melding.startsWith("✅") ? "#065f46" : "#991b1b", fontWeight: 600 }}>{melding}</div>}
          <button onClick={voegToe} style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>Toevoegen</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["gebruikers", "log"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 18px", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: tab === t ? 700 : 400, background: tab === t ? "#0f172a" : "#fff", color: tab === t ? "#fff" : "#64748b" }}>
              {t === "gebruikers" ? "👥 Gebruikers" : "📋 Login geschiedenis"}
            </button>
          ))}
        </div>

        {tab === "gebruikers" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Naam", "Gebruikersnaam", "Rol", "Laatste login", ""].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", background: "#f8fafc", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase" as const, borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gebruikers.map(g => (
                  <tr key={g.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{g.naam}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{g.gebruikersnaam}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: g.rol === "admin" ? "#dbeafe" : "#f0fdf4", color: g.rol === "admin" ? "#1e40af" : "#166534", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{g.rol}</span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 12 }}>
                      {g.laatste_login ? new Date(g.laatste_login).toLocaleString("nl-NL") : "Nog niet ingelogd"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {g.rol !== "admin" && (
                        <button onClick={() => verwijder(g.id, g.naam)} style={{ background: "#fef2f2", color: "#991b1b", border: "1.5px solid #fca5a5", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>Verwijder</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "log" && (
          <div style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Naam", "Ingelogd op"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", background: "#f8fafc", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase" as const, borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loginLog.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{l.naam}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b" }}>{new Date(l.ingelogd_op).toLocaleString("nl-NL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
