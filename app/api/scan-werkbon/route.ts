import { NextRequest } from "next/server";

export const runtime = "edge";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { base64, mediaType } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY niet ingesteld in .env.local" }, { status: 500 });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
          {
            type: "text",
            text: `Lees deze werkbon zorgvuldig en geef ALLEEN een JSON object terug, geen andere tekst.

Het JSON object moet deze velden bevatten:
{
  "opdrachtgever": "naam van het bedrijf/opdrachtgever",
  "projectnaam": "naam van het project of locatie",
  "projectnummer": "projectcode of werkopdrachtnummer",
  "datum": "datum in YYYY-MM-DD formaat",
  "monteur": "naam van de monteur of uitvoerder",
  "werkzaamheden": "type werkzaamheden",
  "doormeldgegevens": [
    { "label": "veldnaam", "waarde": "waarde" }
  ],
  "extraGegevens": [
    { "label": "veldnaam", "waarde": "waarde" }
  ],
  "waarschuwingen": ["tekst van de waarschuwing"],
  "meldingen": ["tekst van de melding"]
}

Voor "doormeldgegevens": zoek specifiek naar doormeldinformatie zoals IP-adres, poort, accountnummer, klantnummer, alarmcentrale, meldkamer, doormelding, SIA, CID, polling, receiver, transmitter, AMS, telefoonnummer doormelding, etc.

Voor "extraGegevens": voeg ALLE overige informatie toe die op de werkbon staat maar niet in de bovenstaande velden past. Denk aan: adres, postcode, contactpersoon, telefoonnummer, referentienummer, omschrijving werkzaamheden, materialen, opmerkingen, handtekening, factuuradres, etc.

Voor "waarschuwingen": zoek naar alle opmerkingen, aandachtspunten of notities op de werkbon die beginnen met "let op", "attentie", "belangrijk", "opgelet", "waarschuwing", "LET OP", "!!" of vergelijkbare waarschuwingsteksten. Geef elke waarschuwing als losse string terug. Als er geen zijn, gebruik dan een lege array [].

Voor "meldingen": zoek naar instructies die aangeven dat iets gemeld of doorgegeven moet worden aan een persoon of afdeling. Denk aan zinnen zoals "melden bij", "doorgeven aan", "contact opnemen met", "bijzonderheden melden", "storingen melden bij", "altijd bellen naar", etc. Geef elke melding als losse string inclusief de naam/contactpersoon. Als er geen zijn, gebruik dan een lege array [].

Als een veld niet gevonden wordt gebruik dan een lege string of lege array [].`,
          },
        ],
      }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    let detail = body;
    try { detail = JSON.parse(body)?.error?.message ?? body; } catch {}
    return Response.json({ error: `API fout ${res.status}: ${detail}` }, { status: res.status });
  }

  const data = await res.json();
  const tekst = data.content?.[0]?.text ?? "";

  // Zoek het JSON object in de tekst, ook als het model extra tekst toevoegt
  const match = tekst.match(/\{[\s\S]*\}/);
  if (!match) {
    return Response.json({ error: "Geen JSON gevonden in response", raw: tekst }, { status: 500 });
  }

  try {
    return Response.json(JSON.parse(match[0]));
  } catch {
    return Response.json({ error: "Kon geen JSON parsen", raw: tekst }, { status: 500 });
  }
}
