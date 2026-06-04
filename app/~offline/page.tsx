"use client";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const [proberen, setProberen] = useState(false);

  useEffect(() => {
    // Zodra internet terug is, ga automatisch terug
    const handler = () => { window.location.href = "/"; };
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
  }, []);

  function opnieuw() {
    setProberen(true);
    setTimeout(() => {
      window.location.href = "/";
    }, 300);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: 24,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 24,
        padding: "40px 36px",
        maxWidth: 380,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📡</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", marginBottom: 8 }}>
          Geen internet
        </div>
        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 28, lineHeight: 1.6 }}>
          Je bent offline. De app wordt geladen zodra je weer verbinding hebt.
          <br /><br />
          <span style={{ fontSize: 13, color: "#94a3b8" }}>
            Tip: als de app eerder is geopend, probeer dan opnieuw — de app slaat alles lokaal op en werkt ook zonder internet.
          </span>
        </div>
        <button
          onClick={opnieuw}
          disabled={proberen}
          style={{
            width: "100%",
            padding: "13px",
            background: proberen ? "#94a3b8" : "linear-gradient(135deg, #0f172a, #1e3a5f)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: proberen ? "not-allowed" : "pointer",
          }}
        >
          {proberen ? "Verbinden..." : "Opnieuw proberen"}
        </button>
      </div>
    </div>
  );
}
