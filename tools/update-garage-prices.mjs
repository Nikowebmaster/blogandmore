// Aktualisiert die Tagespreise der Garagen in data/garage-prices.json.
// Läuft wöchentlich über GitHub Actions (.github/workflows/garage-prices.yml), Node 20+.
// Schlägt ein einzelner Abruf fehl, bleibt der bisherige Preis erhalten.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { GARAGES } from "../js/garagen-data.js";
import { parseWipark, parseBestInParking, parseApcoa, formatEuro } from "./price-parsers.mjs";

const OUT = new URL("../data/garage-prices.json", import.meta.url);
const WIPARK_URL =
  "https://www.wipark.at/api/jsonws/wienit_wip.garage/get-articles-by-structure-equipment-district-price" +
  "/group-id/583342/class-name-id/20401/ddm-structure-key/GARAGEBASESTRUCTURE/status/0/start/0" +
  "/number-of-elements/30/equipment/0/district/0/price-start/0/price-end/0/filter-type/0" +
  "/search-lat/48.1935/search-long/16.4075/check-availability/false";
const HEADERS = { "User-Agent": "Mozilla/5.0 (private dashboard; weekly price check)" };

async function get(url, type = "text") {
  const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} bei ${url}`);
  return type === "json" ? res.json() : res.text();
}

let previous = { prices: {} };
try { previous = JSON.parse(await readFile(OUT, "utf8")); } catch {}

const prices = { ...previous.prices };
const errors = [];
let wiparkList = null;

for (const g of GARAGES) {
  const src = g.priceSource;
  if (!src) continue;
  try {
    let value = null;
    if (src.type === "wipark") {
      wiparkList ??= await get(WIPARK_URL, "json");
      value = parseWipark(wiparkList, src.code);
    } else if (src.type === "bip") {
      value = parseBestInParking(await get(g.url), src.row, src.column);
    } else if (src.type === "apcoa") {
      value = parseApcoa(await get(g.url));
    }
    if (value == null) throw new Error("Preis auf der Seite nicht gefunden");
    prices[g.id] = formatEuro(value);
    console.log(`✔ ${g.name}: ${prices[g.id]}`);
  } catch (e) {
    errors.push(`${g.name}: ${e.message}`);
    console.warn(`✖ ${g.name}: ${e.message} – behalte ${prices[g.id] ?? "(kein Wert)"}`);
  }
}

const changed = JSON.stringify(prices) !== JSON.stringify(previous.prices);
const out = {
  // Datum nur ändern, wenn wenigstens ein Preis erfolgreich geprüft wurde
  updatedAt: errors.length < GARAGES.length ? new Date().toISOString() : previous.updatedAt ?? null,
  prices,
  errors,
};
await mkdir(new URL("../data/", import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(changed ? "Preise geändert." : "Keine Preisänderung.");
