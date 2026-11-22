// Garagen rund um die Schnirchgasse 17 (1030 Wien)
// Gehzeit/-strecke laut Google Maps (Fußweg ab Schnirchgasse 17), Stand 22.11.2026.
// Preise laut Betreiber-Websites, Stand 22.11.2026 – bei Änderungen hier anpassen.
// live: woher die aktuelle Belegung kommt (Supabase-Funktion "garage-status"), null = keine Live-Daten.

export const HOME = "Schnirchgasse 17, 1030 Wien";

export const GARAGES = [
  {
    name: "Erdbergstraße Hochgarage & Parkplatz", operator: "WIPARK",
    address: "Erdbergstraße 182, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/erdbergstra%C3%9Fe-parkplatz",
    walk: { min: 5, m: 350 },
    prices: [
      { label: "Tag", value: "12,00 €" },
      { label: "Stunde", value: "3,00 €" },
      { label: "WIPcard", value: "nicht akzeptiert" },
    ],
    live: { source: "wipark", code: "ESH" },
  },
  {
    name: "Arkadenhof", operator: "APCOA",
    address: "Würtzlerstraße 20, 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/arkadenhof-wien-apcoa",
    walk: { min: 6, m: 400 },
    prices: [
      { label: "Tag", value: "bis 11,00 €" },
    ],
    live: null,
  },
  {
    name: "Tangente U3 Parkplatz", operator: "WIPARK",
    address: "Im Erdberger Mais 3, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/parkplatz-tangente-u3",
    walk: { min: 7, m: 500 },
    prices: [
      { label: "Tag", value: "12,00 €" },
      { label: "Stunde", value: "3,80 €" },
      { label: "WIPcard", value: "3,04 €/h · Abend 6,08 €" },
    ],
    live: { source: "wipark", code: "U3T" },
  },
  {
    name: "Park + Ride Erdberg", operator: "Best in Parking",
    address: "Safargasse 5, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/park-ride-erdberg",
    walk: { min: 10, m: 700 },
    prices: [
      { label: "0–24 h", value: "4,70 €" },
      { label: "bmove", value: "4,70 €" },
    ],
    live: { source: "bip", id: "4909" },
  },
  {
    name: "Garage Fiakerplatz", operator: "Best in Parking",
    address: "Fiakerplatz, 1030 Wien",
    url: "https://www.bestinparking.com/de/at/garage/garage-fiakerplatz",
    walk: { min: 12, m: 850 },
    prices: [
      { label: "Tag", value: "10,00 €" },
      { label: "bmove", value: "6,00 €" },
      { label: "Stunde", value: "3,50 € (bmove 2,00 €)" },
    ],
    live: { source: "bip", id: "2650" },
  },
  {
    name: "Paragonstraße", operator: "APCOA",
    address: "Guglgasse 7-9 (Einfahrt Paragonstraße), 1030 Wien",
    url: "https://www.apcoa.at/kurzparken/standorte/wien/paragonstrasse-wien-apcoa",
    walk: { min: 16, m: 1100 },
    prices: [
      { label: "Tag", value: "bis 10,00 €" },
      { label: "Stunde", value: "ab 3,50 €" },
      { label: "APCOA FLOW", value: "per App möglich" },
    ],
    live: null,
  },
  {
    name: "Media Quarter Marx Parkgarage", operator: "WIPARK",
    address: "Henneberggasse 2-4, 1030 Wien",
    url: "https://www.wipark.at/standorte/3-bezirk/media-quarter-marx-garage",
    walk: { min: 21, m: 1500 },
    prices: [
      { label: "Tag", value: "10,50 €" },
      { label: "Stunde", value: "3,50 €" },
      { label: "WIPcard", value: "2,80 €/h · Abend 5,60 €" },
    ],
    live: { source: "wipark", code: "MQG" },
  },
];
