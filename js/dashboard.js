// Dashboard-Widgets auf der Startseite
// Wetter: Open-Meteo (https://open-meteo.com) – kostenlos, ohne API-Schlüssel, Lizenz CC BY 4.0

const WEATHER = {
  place: "Wien",
  lat: 48.2085,
  lon: 16.3721,
  days: 5,          // angezeigte Tage
  fetchDays: 8,     // geladene Tage (3 mehr, damit die Autowasch-Regel auch für den 5. Tag prüfen kann)
  cacheMinutes: 30,
};

// Autowasch-Regel: Tag ohne Regen, mind. 3 Sonnenstunden, und die nächsten 3 Tage ebenfalls ohne Regen.
// „Kein Regen“ = Regenwahrscheinlichkeit unter 30 % UND weniger als 0,5 mm Niederschlag.
const CARWASH = { minSunHours: 3, dryDaysAfter: 3, maxRainProbability: 30, maxRainMm: 0.5 };

const isDry = (d, i) =>
  (d.precipitation_probability_max[i] ?? 100) < CARWASH.maxRainProbability &&
  (d.precipitation_sum[i] ?? 99) < CARWASH.maxRainMm;

function carWashOk(d, i) {
  if (i + CARWASH.dryDaysAfter >= d.time.length) return false; // zu wenig Vorhersage-Tage
  if (!isDry(d, i) || d.sunshine_duration[i] / 3600 < CARWASH.minSunHours) return false;
  for (let k = 1; k <= CARWASH.dryDaysAfter; k++) if (!isDry(d, i + k)) return false;
  return true;
}

const CAR_SVG = `<svg class="car-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 11l1.6-4.3A2 2 0 0 1 8.5 5.4h7a2 2 0 0 1 1.9 1.3L19 11h.5A1.5 1.5 0 0 1 21 12.5V17a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-4.5A1.5 1.5 0 0 1 4.5 11H5zm2.2 0h9.6l-1.2-3.3a.5.5 0 0 0-.5-.3H8.9a.5.5 0 0 0-.5.3L7.2 11zM7 15.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5zm10 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"/></svg>`;

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER.lat}&longitude=${WEATHER.lon}` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_probability_max,precipitation_sum` +
  `&timezone=Europe%2FVienna&forecast_days=${WEATHER.fetchDays}`;

// WMO-Wettercodes → Symbol + Text
const WMO = [
  [[0], "☀️", "Sonnig"],
  [[1], "🌤️", "Überwiegend sonnig"],
  [[2], "⛅", "Teilweise bewölkt"],
  [[3], "☁️", "Bedeckt"],
  [[45, 48], "🌫️", "Nebel"],
  [[51, 53, 55, 56, 57], "🌦️", "Nieselregen"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "🌧️", "Regen"],
  [[71, 73, 75, 77, 85, 86], "🌨️", "Schnee"],
  [[95, 96, 99], "⛈️", "Gewitter"],
];
const wmo = (code) => WMO.find(([codes]) => codes.includes(code)) ?? [[], "🌡️", "–"];

const num = (n, digits = 1) => n.toLocaleString("de-AT", { minimumFractionDigits: digits, maximumFractionDigits: digits });

function dayLabel(iso, i) {
  if (i === 0) return "Heute";
  if (i === 1) return "Morgen";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("de-AT", { weekday: "short" }).replace(".", "") +
    " " + d.toLocaleDateString("de-AT", { day: "numeric", month: "numeric" });
}

async function loadWeather() {
  const key = "weather-cache-v2";
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.t < WEATHER.cacheMinutes * 60000) return cached;
  } catch {}
  const res = await fetch(WEATHER_URL);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const entry = { t: Date.now(), data };
  try { localStorage.setItem(key, JSON.stringify(entry)); } catch {}
  return entry;
}

async function renderWeather() {
  const box = document.getElementById("weather-days");
  const foot = document.getElementById("weather-foot");
  if (!box) return;
  try {
    const { t, data } = await loadWeather();
    const d = data.daily;
    box.innerHTML = d.time.slice(0, WEATHER.days).map((iso, i) => {
      const [, icon, text] = wmo(d.weather_code[i]);
      const sunH = d.sunshine_duration[i] / 3600;
      const rain = d.precipitation_probability_max[i] ?? 0;
      const mm = d.precipitation_sum[i] ?? 0;
      return `
        <div class="wday${i === 0 ? " today" : ""}">
          <div class="wday-top">
            <span class="wday-name">${dayLabel(iso, i)}</span>
            <span class="wday-icon" title="${text}" aria-label="${text}">${icon}</span>
            <span class="wday-temp"><strong>${Math.round(d.temperature_2m_max[i])}°</strong> <span class="muted">${Math.round(d.temperature_2m_min[i])}°</span></span>
          </div>
          <div class="wmetric sun" title="Sonnenstunden">
            <span class="wlabel" aria-label="Sonne">☀</span>
            <span class="wbar"><span style="width:${Math.min(100, (sunH / 10) * 100)}%"></span></span>
            <span class="wval">${num(sunH)} h</span>
          </div>
          <div class="wmetric rain" title="Regenwahrscheinlichkeit${mm ? `, ca. ${num(mm)} mm` : ""}">
            <span class="wlabel" aria-label="Regen">💧</span>
            <span class="wbar"><span style="width:${rain}%"></span></span>
            <span class="wval">${rain} %</span>
          </div>
          ${carWashOk(d, i) ? `<div class="carwash" title="Kein Regen, mind. ${CARWASH.minSunHours} h Sonne und die nächsten ${CARWASH.dryDaysAfter} Tage trocken">${CAR_SVG}<span>Autowaschen möglich</span></div>` : ""}
        </div>`;
    }).join("");
    const time = new Date(t).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    foot.innerHTML = `${WEATHER.place} · Stand ${time} · Daten: <a href="https://open-meteo.com/" rel="noopener">Open-Meteo.com</a> (CC BY 4.0)`;
  } catch (e) {
    box.innerHTML = '<p class="notice">Wetterdaten sind gerade nicht erreichbar. Bitte später neu laden.</p>';
  }
}

renderWeather();

// =====================================================================
// Garagen-Widget: Belegung über die Supabase-Funktion "garage-status"
// =====================================================================
import { GARAGES, HOME } from "./garagen-data.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const GARAGE_URL = `${SUPABASE_URL}/functions/v1/garage-status`;
const PIN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;

const escG = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hm = (date) => date.toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
const mapsLink = (g) =>
  `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(HOME)}&destination=${encodeURIComponent(g.address)}&travelmode=walking`;
const walkText = (w) => `${w.min} min · ${w.m >= 1000 ? num(w.m / 1000) + " km" : w.m + " m"}`;

// Live-Status je Garage: { state: "free" | "full" | "unknown", text, time }
function liveStatus(g, data) {
  if (!g.live) return { state: "unknown", text: "keine Live-Daten" };
  if (!data) return { state: "unknown", text: "Live-Daten nicht erreichbar" };

  if (g.live.source === "wipark") {
    const w = data.wipark?.[g.live.code];
    const time = data.fetchedAt ? `abgerufen ${hm(new Date(data.fetchedAt))}` : "";
    if (!w || (w.free == null && w.statusFree == null)) return { state: "unknown", text: "keine Live-Daten" };
    if (typeof w.free === "number") return w.free > 0
      ? { state: "free", text: `${w.free} Plätze frei`, time }
      : { state: "full", text: "besetzt", time };
    return w.statusFree ? { state: "free", text: "Plätze frei", time } : { state: "full", text: "besetzt", time };
  }

  if (g.live.source === "bip") {
    const b = data.bip?.[g.live.id];
    if (!b || !b.status) return { state: "unknown", text: "keine Live-Daten" };
    const time = b.timestamp ? `Stand ${hm(new Date(b.timestamp * 1000))}` : "";
    if (b.status === "vacant") return { state: "free", text: "Plätze frei", time };
    return { state: "full", text: "besetzt", time };
  }
  return { state: "unknown", text: "keine Live-Daten" };
}

async function loadGarageData() {
  const res = await fetch(GARAGE_URL, { headers: { apikey: SUPABASE_ANON_KEY } });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

async function renderGarages() {
  const list = document.getElementById("garage-list");
  const foot = document.getElementById("garage-foot");
  if (!list) return;

  let data = null;
  try { data = await loadGarageData(); } catch { data = null; }

  const order = { free: 0, unknown: 1, full: 2 };
  const rows = GARAGES
    .map((g) => ({ g, s: liveStatus(g, data) }))
    .sort((a, b) => order[a.s.state] - order[b.s.state] || a.g.walk.m - b.g.walk.m);

  list.innerHTML = rows.map(({ g, s }) => `
    <li class="garage g-${s.state}">
      <div class="g-main">
        <div class="g-name"><a href="${escG(g.url)}" rel="noopener" target="_blank">${escG(g.name)}</a> <span class="g-op">${escG(g.operator)}</span></div>
        <div class="g-status"><span class="g-dot" aria-hidden="true"></span>${escG(s.text)}${s.time ? ` <span class="muted">· ${escG(s.time)}</span>` : ""}</div>
        <div class="g-prices">${g.prices.map((p) => `<span><b>${escG(p.label)}:</b> ${escG(p.value)}</span>`).join("")}</div>
      </div>
      <div class="g-side">
        <span class="g-walk" title="Fußweg ab ${escG(HOME)} laut Google Maps">🚶 ${walkText(g.walk)}</span>
        <a class="g-map" href="${mapsLink(g)}" target="_blank" rel="noopener" title="Fußweg in Google Maps öffnen" aria-label="Fußweg zu ${escG(g.name)} in Google Maps öffnen">${PIN_SVG}</a>
      </div>
    </li>`).join("");

  foot.innerHTML = data
    ? `Freie Garagen zuerst, dann nach Entfernung · aktualisiert ${hm(new Date())} · Preise lt. Betreiber, Stand 22.11.2026`
    : `Live-Belegung gerade nicht erreichbar – sortiert nach Entfernung · Preise lt. Betreiber, Stand 22.11.2026`;
}

renderGarages();
setInterval(renderGarages, 2 * 60 * 1000); // alle 2 Minuten neu laden
