// Dashboard-Widgets auf der Startseite
// Wetter: Open-Meteo (https://open-meteo.com) – kostenlos, ohne API-Schlüssel, Lizenz CC BY 4.0

const WEATHER = {
  place: "Wien",
  lat: 48.2085,
  lon: 16.3721,
  days: 5,
  cacheMinutes: 30,
};

const WEATHER_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER.lat}&longitude=${WEATHER.lon}` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_probability_max,precipitation_sum` +
  `&timezone=Europe%2FVienna&forecast_days=${WEATHER.days}`;

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
  const key = "weather-cache-v1";
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
    box.innerHTML = d.time.map((iso, i) => {
      const [, icon, text] = wmo(d.weather_code[i]);
      const sunH = d.sunshine_duration[i] / 3600;
      const rain = d.precipitation_probability_max[i] ?? 0;
      const mm = d.precipitation_sum[i] ?? 0;
      return `
        <div class="wday${i === 0 ? " today" : ""}">
          <div class="wday-name">${dayLabel(iso, i)}</div>
          <div class="wday-icon" title="${text}" aria-label="${text}">${icon}</div>
          <div class="wday-temp"><strong>${Math.round(d.temperature_2m_max[i])}°</strong> <span class="muted">${Math.round(d.temperature_2m_min[i])}°</span></div>
          <div class="wmetric sun" title="Sonnenstunden">
            <span class="wlabel">☀ Sonne</span>
            <span class="wbar"><span style="width:${Math.min(100, (sunH / 10) * 100)}%"></span></span>
            <span class="wval">${num(sunH)} h</span>
          </div>
          <div class="wmetric rain" title="Regenwahrscheinlichkeit${mm ? `, ca. ${num(mm)} mm` : ""}">
            <span class="wlabel">💧 Regen</span>
            <span class="wbar"><span style="width:${rain}%"></span></span>
            <span class="wval">${rain} %</span>
          </div>
        </div>`;
    }).join("");
    const time = new Date(t).toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" });
    foot.innerHTML = `${WEATHER.place} · Stand ${time} · Daten: <a href="https://open-meteo.com/" rel="noopener">Open-Meteo.com</a> (CC BY 4.0)`;
  } catch (e) {
    box.innerHTML = '<p class="notice">Wetterdaten sind gerade nicht erreichbar. Bitte später neu laden.</p>';
  }
}

renderWeather();
