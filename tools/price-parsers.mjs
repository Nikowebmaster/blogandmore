// Auslesen der Tagespreise aus den Betreiber-Seiten (läuft im Browser und in Node).
// Rückgabe jeweils als Zahl in Euro oder null, wenn nichts gefunden wurde.

const toNumber = (s) => {
  if (s == null) return null;
  const n = Number(String(s).replace(/EUR|€/gi, "").replace(/\s|&nbsp;/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** WIPARK-Schnittstelle (JSON-Liste) → Tagespauschale für das Garagenkürzel */
export function parseWipark(list, code) {
  const g = Array.isArray(list) ? list.find((x) => x.kuerzel === code) : null;
  return g && g.pricePerDayAvailable !== false ? toNumber(g.pricePerDay) : null;
}

/**
 * Best in Parking (HTML der Garagenseite) → Preis aus der Zeile `rowLabel`.
 * column: "normal" oder "bmove"
 */
export function parseBestInParking(html, rowLabel, column = "normal") {
  const flat = String(html).replace(/\s+/g, " ");
  const i = flat.indexOf(rowLabel);
  if (i < 0) return null;
  const rest = flat.slice(i, i + 3000);
  const attr = column === "bmove" ? "data-garage-detail-order-price-bmove" : "data-garage-detail-order-price";
  const m = rest.match(new RegExp(`${attr}="([^"]*)"`));
  return m ? toNumber(m[1]) : null;
}

/** APCOA (HTML der Standortseite) → Wert bei „pro Tag“ (z. B. „bis € 10,00“) */
export function parseApcoa(html) {
  const flat = String(html).replace(/\s+/g, " ");
  const m = flat.match(/pro Tag[\s\S]{0,400}?(?:&euro;|€)(?:&nbsp;|\s| )*(\d+(?:,\d{1,2})?)/);
  return m ? toNumber(m[1]) : null;
}

/** 12 → "12,00 €" */
export const formatEuro = (n) => n.toFixed(2).replace(".", ",") + " €";
