"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const secties = [
  {
    icon: "🚀",
    titel: "Snel starten",
    inhoud: [
      {
        vraag: "Hoe begin ik een nieuwe inspectie?",
        antwoord: `Druk op het ＋ knopje rechtsboven om een nieuw project te starten. Vul daarna de projectgegevens in op het tabblad "Info": opdrachtgever, projectnummer, datum en jouw naam als monteur.\n\nTip: neem een foto van de werkbon en druk op 📷 Foto uploaden op het tabblad Werkbon — de app vult alle velden automatisch in via AI.`,
      },
      {
        vraag: "Welke tabbladen gebruik ik?",
        antwoord: `De app heeft tabbladen voor elk systeem dat je controleert:\n\n• Info — Algemene projectgegevens\n• Brandmeld — Accuberekening, geluidsdruk, systeembeschikbaarheid en checklist\n• Gasdetectie — Noodstroom berekening en checklist\n• Ventilatie — Ventilatormetingen, stroomafname, draaiuren en checklist\n• Beheer BMI — Logboek / beheer\n• Notities — Vrije aantekeningen en foto's\n• Werkbon — Foto scannen met AI\n\nJe kunt tabbladen aan- en uitzetten via het instellingen-icoontje ⚙️ in de header.`,
      },
    ],
  },
  {
    icon: "📷",
    titel: "Werkbon scannen",
    inhoud: [
      {
        vraag: "Hoe scan ik een werkbon?",
        antwoord: `Ga naar het tabblad Werkbon en druk op 📷 Foto uploaden. Maak een foto van de papieren werkbon of kies een foto uit je galerij.\n\nDe AI leest de werkbon en vult automatisch in:\n• Opdrachtgever en projectnaam\n• Projectnummer en WO-nummer\n• Datum en monteursnaam\n• Type werkzaamheden en systeemcode\n• Doormeldinformatie en bijzonderheden\n\nControleer altijd de ingevulde gegevens — de AI kan soms iets verkeerd lezen.`,
      },
      {
        vraag: "Mijn foto wordt niet herkend, wat nu?",
        antwoord: `Zorg voor een scherpe, goed belichte foto zonder schaduw. Foto's in HEIC-formaat (standaard iPhone) werken niet — ga naar Instellingen → Camera → Formaten → kies "Meest compatibel" zodat je telefoon JPEG maakt.\n\nAls scannen mislukt, vul je de gegevens gewoon handmatig in op het Info tabblad.`,
      },
    ],
  },
  {
    icon: "🔥",
    titel: "Brandmeldinstallatie",
    inhoud: [
      {
        vraag: "Hoe werkt de accuberekening?",
        antwoord: `Vul de ruststroom (mA), alarmstroom (mA) en het onderhoudscontract (12 of 24 maanden) in. De app berekent automatisch de benodigde accucapaciteit.\n\nDe kleur geeft de status aan:\n• Groen — accu voldoet\n• Rood — accu te zwak of te oud (≥ 4 jaar)\n\nVul ook de huidige capaciteit in om te zien of vervanging nodig is.`,
      },
      {
        vraag: "Wat is systeembeschikbaarheid?",
        antwoord: `De systeembeschikbaarheid laat zien hoe betrouwbaar de brandmeldinstallatie het afgelopen jaar is geweest. De eis volgens NEN 2535 is ≥ 99,7%.\n\nVul de storingen in (datum, uitvalduur in uren en omschrijving). De app berekent:\n\nBeschikbaarheid = (8760 - totale uitval in uren) ÷ 8760 × 100%\n\nGroen = voldoet aan 99,7%. Rood = niet behaald.`,
      },
      {
        vraag: "Hoe gebruik ik de checklist?",
        antwoord: `Loop de checklistvragen door en geef elk punt de status Ja, Nee of N.v.t. Gebruik het opmerkingenveld voor toelichting.\n\nDe checklist is gebaseerd op de officiële onderhoudseisen. Zorg dat alle punten zijn beantwoord voor een complete rapportage.`,
      },
    ],
  },
  {
    icon: "💨",
    titel: "Ventilatie",
    inhoud: [
      {
        vraag: "Hoe registreer ik ventilatormetingen?",
        antwoord: `Gebruik het kopje Ventilatoren om per ventilator de afmetingen en metingen in te vullen. Druk op + Ventilator om een extra rij toe te voegen.\n\nVoor elke ventilator kun je meerdere metingen invullen — de app berekent automatisch het gemiddelde.`,
      },
      {
        vraag: "Hoe vul ik draaiuren in?",
        antwoord: `Bij het kopje Draaiuren frequentieregelaars kun je per frequentieregelaar (AV1, AV2, etc.) de vorige en huidige tellerstand invullen.\n\nDe app berekent automatisch het verschil (aantal gedraaide uren in de afgelopen periode).`,
      },
      {
        vraag: "Wat zijn stroommetingen?",
        antwoord: `Vul bij Stroommetingen de gemeten stroomwaarden in voor de afvoer- en stuwdrukventilatoren (in Ampère). Deze waarden worden automatisch overgenomen in de ventilatie-checklist bij de relevante checkpunten.`,
      },
    ],
  },
  {
    icon: "💾",
    titel: "Opslaan en delen",
    inhoud: [
      {
        vraag: "Wat is het verschil tussen 💾 en ☁️?",
        antwoord: `💾 Opslaan — Slaat het project op je eigen apparaat op (lokale opslag). Alleen jij ziet het, ook zonder internet.\n\n☁️ Delen — Stuurt het project naar de cloud zodat alle collega's het kunnen openen via hun telefoon of computer. Handig voor overdracht of samenwerking.\n\nBelangrijk: foto's worden niet meegestuurd bij delen om de upload klein te houden.`,
      },
      {
        vraag: "Hoe open ik een project van een collega?",
        antwoord: `Druk op 📁 en ga naar het tabblad Gedeeld. Je ziet hier alle projecten die collega's hebben gedeeld, gesorteerd op datum.\n\nZoek op naam of opdrachtgever en druk op Openen om het project te laden.`,
      },
      {
        vraag: "Hoe download of print ik een rapport?",
        antwoord: `⬇️ Download — Slaat het project op als JSON-bestand op je apparaat. Handig als back-up.\n\n🖨️ Afdrukken — Opent het afdrukvenster van je browser. Zorg dat je "Achtergronden afdrukken" aanzet voor het beste resultaat.`,
      },
    ],
  },
  {
    icon: "🔑",
    titel: "Installateurscodes",
    inhoud: [
      {
        vraag: "Wat is het sleutel-icoontje 🔑?",
        antwoord: `Het 🔑 knopje opent een overzicht van standaard installateurscodes voor veelvoorkomende systemen. Dit is een handig naslagwerk als je ter plaatse snel een code nodig hebt.\n\nDruk nogmaals op 🔑 om het overzicht te sluiten.`,
      },
    ],
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [openSectie, setOpenSectie] = useState<number | null>(0);
  const [openVraag, setOpenVraag] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#111827", borderBottom: "1px solid #1f2937", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,0.08)", color: "#d1d5db", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>← Terug</button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>❓ Gebruikershandleiding</div>
          <div style={{ color: "#64748b", fontSize: 12 }}>Van Winden Techniek — Systeem App</div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 20px" }}>

        {/* Intro */}
        <div style={{ background: "#1e293b", borderRadius: 14, padding: "20px 22px", marginBottom: 24, border: "1px solid #334155" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Welkom in de Systeem App</div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>
            Met deze app vul je onderhoudsinspecties in voor brandmeld-, gasdetectie- en ventilatiesystemen.
            Scan je werkbon met de camera, vul de metingen in en sla het project lokaal op of deel het met je collega's.
          </div>
        </div>

        {/* Secties */}
        {secties.map((sectie, si) => (
          <div key={si} style={{ marginBottom: 12 }}>
            <button
              onClick={() => setOpenSectie(openSectie === si ? null : si)}
              style={{ width: "100%", background: openSectie === si ? "#1e3a5f" : "#1e293b", border: `1.5px solid ${openSectie === si ? "#3b82f6" : "#334155"}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" as const }}
            >
              <span style={{ fontSize: 22 }}>{sectie.icon}</span>
              <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15, flex: 1 }}>{sectie.titel}</span>
              <span style={{ color: "#64748b", fontSize: 16 }}>{openSectie === si ? "▲" : "▼"}</span>
            </button>

            {openSectie === si && (
              <div style={{ background: "#1e293b", border: "1.5px solid #334155", borderTop: "none", borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
                {sectie.inhoud.map((item, qi) => {
                  const key = `${si}-${qi}`;
                  const open = openVraag === key;
                  return (
                    <div key={qi} style={{ borderTop: qi > 0 ? "1px solid #334155" : "none" }}>
                      <button
                        onClick={() => setOpenVraag(open ? null : key)}
                        style={{ width: "100%", background: "none", border: "none", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", textAlign: "left" as const }}
                      >
                        <span style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, flexShrink: 0, marginTop: 1 }}>{open ? "▼" : "▶"}</span>
                        <span style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 14 }}>{item.vraag}</span>
                      </button>
                      {open && (
                        <div style={{ padding: "0 18px 16px 42px" }}>
                          {item.antwoord.split("\n").map((regel, ri) => (
                            regel === "" ? <div key={ri} style={{ height: 8 }} /> :
                            <div key={ri} style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7 }}>{regel}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div style={{ textAlign: "center" as const, marginTop: 32, color: "#374151", fontSize: 12 }}>
          Vragen of aanpassingen? Neem contact op met de beheerder.
        </div>
      </div>
    </div>
  );
}
