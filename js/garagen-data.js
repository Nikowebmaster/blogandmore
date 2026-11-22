// Garagen rund um die Schnirchgasse 17 (1030 Wien)
// Gehzeit/-strecke laut Google Maps (Fußweg ab Schnirchgasse 17), Stand 22.11.2026.
// Tagespreise laut Betreiber-Websites, Stand 22.11.2026 (dayMember = günstigerer Tagespreis mit App/Karte) – bei Änderungen hier anpassen.
// live: woher die aktuelle Belegung kommt (Supabase-Funktion "garage-status"), null = keine Live-Daten.

export const HOME = "Schnirchgasse 17, 1030 Wien";

export const GARAGES = [
  {
    name: "Erdbergstraße Hochgarage & Parkplatz", operator: "WIPARK",
    address: "Erdbergstraße 182, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/erdbergstra%C3%9Fe-parkplatz",
    walk: { min: 5, m: 350 },
    day: "12,00 €",
    live: { source: "wipark", code: "ESH" },
  },
  {
    name: "Arkadenhof", operator: "APCOA",
    address: "Würtzlerstraße 20, 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/arkadenhof-wien-apcoa",
    walk: { min: 6, m: 400 },
    day: "bis 11,00 €",
    live: null,
  },
  {
    name: "Tangente U3 Parkplatz", operator: "WIPARK",
    address: "Im Erdberger Mais 3, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/parkplatz-tangente-u3",
    walk: { min: 7, m: 500 },
    day: "12,00 €",
    live: { source: "wipark", code: "U3T" },
  },
  {
    name: "Park + Ride Erdberg", operator: "Best in Parking",
    address: "Safargasse 5, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/park-ride-erdberg",
    walk: { min: 10, m: 700 },
    day: "4,70 €",
    live: { source: "bip", id: "4909" },
  },
  {
    name: "Garage Fiakerplatz", operator: "Best in Parking",
    address: "Fiakerplatz, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/garage-fiakerplatz",
    walk: { min: 12, m: 850 },
    day: "10,00 €", dayMember: "bmove 6,00 €",
    live: { source: "bip", id: "2650" },
  },
  {
    name: "Paragonstraße", operator: "APCOA",
    address: "Guglgasse 7-9 (Einfahrt Paragonstraße), 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/paragonstrasse-wien-apcoa",
    walk: { min: 16, m: 1100 },
    day: "bis 10,00 €",
    live: null,
  },
  {
    name: "Media Quarter Marx Parkgarage", operator: "WIPARK",
    address: "Henneberggasse 2-4, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/media-quarter-marx-garage",
    walk: { min: 21, m: 1500 },
    day: "10,50 €",
    live: { source: "wipark", code: "MQG" },
  },
];
