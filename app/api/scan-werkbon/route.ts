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
  "opdrachtgever": "naam van het bedrijf of de klant die de opdracht geeft — dit is de OPDRACHTGEVER of KLANT, niet de locatie",
  "projectnaam": "naam of omschrijving van de locatie of het object — bijv. gebouwnaam, straatnaam, winkelcentrum, school, etc. Dit staat vaak bij 'Project', 'Object', 'Locatie' of 'Adres' op de werkbon",
  "projectnummer": "ALLEEN de projectcode die VOOR het WO-nummer staat — bijv. als er staat 'S095001S  WO242131' geef dan 'S095001S'. Staat er geen aparte projectcode, geef dan een lege string.",
  "wonummer": "ALLEEN het WO-nummer — bijv. 'WO242131'. Staat er geen WO-nummer, geef dan een lege string.",
  "datum": "datum in YYYY-MM-DD formaat",
  "monteur": "naam van de monteur of uitvoerder",
  "werkzaamheden": "type werkzaamheden",
  "systeemCode": "de exacte systeemcode zoals gevonden op de werkbon, bijv. O-VG of O-VGB of beheer bmi",
  "doormeldgegevens": [
    { "label": "veldnaam", "waarde": "waarde" }
  ],
  "extraGegevens": [
    { "label": "veldnaam", "waarde": "waarde" }
  ],
  "waarschuwingen": ["tekst van de waarschuwing"],
  "meldingen": ["tekst van de melding"]
}

BELANGRIJK onderscheid opdrachtgever vs projectnaam: "opdrachtgever" is de KLANT of het BEDRIJF dat VanWinden Techniek inhuurt (staat bij 'Klant', 'Opdrachtgever', 'Facturatie'). "projectnaam" is de LOCATIE of het OBJECT waar de werkzaamheden plaatsvinden (staat bij 'Project', 'Object', 'Locatie', 'Adres', 'Omschrijving'). Als op de werkbon één naam staat bij 'Opdrachtgever/Project' combinatie, zet die dan bij opdrachtgever en gebruik de locatie/adres als projectnaam.

Voor "systeemCode": op de werkbon staat bovenaan altijd een regel zoals "Onderhoud O-VG" of "Onderhoud O-VGB" of "Onderhoud O-B" etc. Geef ALLEEN het gedeelte na "Onderhoud" terug, dus enkel de code zelf zoals "O-VG" of "O-VGB". Andere mogelijke waarden zijn: O-G, O-B, O-R, O-O, O-V, O-VB, O-VG, O-VGB, O-RIVG, beheer bmi, rwa. Als er geen code staat, geef dan "".

Voor "doormeldgegevens": zoek specifiek naar doormeldinformatie van alarmsystemen. Denk aan: OMS aansluitnummer, SECONTS aansluitnummer, RMS aansluitnummer, BOLDNET aansluitnummer, en andere alarmcentrale-verbindingsgegevens zoals IP-adres, poort, accountnummer, klantnummer, meldkamer, SIA, CID, polling, receiver, transmitter, telefoonnummer doormelding. Sla GEEN financiële gegevens op zoals IBAN, BTW-nummer of bankrekeningnummers.

Voor "extraGegevens": voeg ALLE overige informatie toe die op de werkbon staat maar niet in de bovenstaande velden past. Denk aan: adres, postcode, contactpersoon, telefoonnummer, referentienummer, omschrijving werkzaamheden, materialen, opmerkingen, handtekening, factuuradres, etc. Zet het WO-nummer (bijv. "WO242131") hier ook in als apart item met label "Werkopdrachtnummer".

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
