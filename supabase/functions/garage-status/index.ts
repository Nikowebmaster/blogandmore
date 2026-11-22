// Supabase Edge Function "garage-status"
// Holt die aktuelle Belegung ausgewählter Garagen bei den Betreibern und gibt sie gesammelt zurück.
// Öffentlich lesbar (nur öffentliche Betreiberdaten), Ergebnis wird 60 Sekunden zwischengespeichert.
//
// Einrichtung: Dashboard → Edge Functions → Deploy a new function → Via Editor → Name "garage-status",
// diesen Code einfügen, "Verify JWT" AUSSCHALTEN → Deploy.

// WIPARK: Garagen rund um die Schnirchgasse (mit Belegung)
const WIPARK_URL =
  "https://www.wipark.at/api/jsonws/wienit_wip.garage/get-articles-by-structure-equipment-district-price" +
  "/group-id/583342/class-name-id/20401/ddm-structure-key/GARAGEBASESTRUCTURE/status/0/start/0" +
  "/number-of-elements/30/equipment/0/district/0/price-start/0/price-end/0/filter-type/0" +
  "/search-lat/48.1935/search-long/16.4075/check-availability/true";
const WIPARK_CODES = ["ESH", "U3T", "MQG"]; // Erdbergstraße, Tangente U3, Media Quarter Marx

// Best in Parking: Garagen-IDs (Park + Ride Erdberg, Garage Fiakerplatz)
const BIP_IDS = ["4909", "2650"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const UA = { "User-Agent": "Mozilla/5.0 (private dashboard; garage-status)", Accept: "application/json" };

let cache: { t: number; body: string } | null = null;

async function getJson(url: string) {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function collect() {
  const fetchedAt = new Date().toISOString();
  const result: Record<string, unknown> = { fetchedAt, wipark: {}, bip: {} };

  try {
    const list = await getJson(WIPARK_URL) as Array<Record<string, unknown>>;
    const out: Record<string, unknown> = {};
    for (const g of list) {
      const code = String(g.kuerzel ?? "");
      if (!WIPARK_CODES.includes(code)) continue;
      out[code] = {
        free: typeof g.freieKurzparker === "number" ? g.freieKurzparker : null,
        statusFree: typeof g.availabilityStatusFree === "boolean" ? g.availabilityStatusFree : null,
      };
    }
    result.wipark = out;
  } catch (e) {
    result.wiparkError = String(e);
  }

  const bip: Record<string, unknown> = {};
  await Promise.all(BIP_IDS.map(async (id) => {
    try {
      const j = await getJson(`https://www.bestinparking.com/de/api/garages/live/${id}`) as Record<string, unknown>;
      bip[id] = { status: j.status ?? null, timestamp: j.timestamp ?? null };
    } catch (e) {
      bip[id] = { error: String(e) };
    }
  }));
  result.bip = bip;

  return JSON.stringify(result);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (!cache || Date.now() - cache.t > 60_000) {
    cache = { t: Date.now(), body: await collect() };
  }
  return new Response(cache.body, {
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
});
