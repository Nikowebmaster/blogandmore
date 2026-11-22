// Garagen rund um die Schnirchgasse 17 (1030 Wien)
// Gehzeit/-strecke laut Google Maps (Fußweg ab Schnirchgasse 17), Stand 22.11.2026.
// Tagespreise laut Betreiber-Websites, Stand 22.11.2026 (dayNote = Hinweis zum Tarif, z. B. "bmove") – bei Änderungen hier anpassen.
// priceSource: wo der Tagespreis wöchentlich automatisch ausgelesen wird (tools/update-garage-prices.mjs → data/garage-prices.json).
// live: woher die aktuelle Belegung kommt (Supabase-Funktion "garage-status"), null = keine Live-Daten.

export const HOME = "Schnirchgasse 17, 1030 Wien";

export const GARAGES = [
  {
    id: "wipark-erdbergstrasse",
    name: "Erdbergstraße Hochgarage & Parkplatz", operator: "WIPARK",
    address: "Erdbergstraße 182, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/erdbergstra%C3%9Fe-parkplatz",
    walk: { min: 5, m: 350 },
    day: "12,00 €",
    priceSource: { type: "wipark", code: "ESH" },
    live: { source: "wipark", code: "ESH" },
  },
  {
    id: "apcoa-arkadenhof",
    name: "Arkadenhof", operator: "APCOA",
    address: "Würtzlerstraße 20, 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/arkadenhof-wien-apcoa",
    walk: { min: 6, m: 400 },
    day: "11,00 €",
    priceSource: { type: "apcoa" },
    live: null,
  },
  {
    id: "wipark-tangente-u3",
    name: "Tangente U3 Parkplatz", operator: "WIPARK",
    address: "Im Erdberger Mais 3, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/parkplatz-tangente-u3",
    walk: { min: 7, m: 500 },
    day: "12,00 €",
    priceSource: { type: "wipark", code: "U3T" },
    live: { source: "wipark", code: "U3T" },
  },
  {
    id: "bip-park-ride-erdberg",
    name: "Park + Ride Erdberg", operator: "Best in Parking",
    address: "Safargasse 5, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/park-ride-erdberg",
    walk: { min: 10, m: 700 },
    day: "4,70 €",
    priceSource: { type: "bip", row: "0 - 24 Stunden", column: "normal" },
    live: { source: "bip", id: "4909" },
  },
  {
    id: "bip-fiakerplatz",
    name: "Garage Fiakerplatz", operator: "Best in Parking",
    address: "Fiakerplatz, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/garage-fiakerplatz",
    walk: { min: 12, m: 850 },
    day: "6,00 €", dayNote: "bmove",
    priceSource: { type: "bip", row: "Tageshöchsttarif für den 1. Tag", column: "bmove" },
    live: { source: "bip", id: "2650" },
  },
  {
    id: "apcoa-paragonstrasse",
    name: "Paragonstraße", operator: "APCOA",
    address: "Guglgasse 7-9 (Einfahrt Paragonstraße), 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/paragonstrasse-wien-apcoa",
    walk: { min: 16, m: 1100 },
    day: "10,00 €",
    priceSource: { type: "apcoa" },
    live: null,
  },
  {
    id: "wipark-media-quarter-marx",
    name: "Media Quarter Marx Parkgarage", operator: "WIPARK",
    address: "Henneberggasse 2-4, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/media-quarter-marx-garage",
    walk: { min: 21, m: 1500 },
    day: "10,50 €",
    priceSource: { type: "wipark", code: "MQG" },
    live: { source: "wipark", code: "MQG" },
  },
];
