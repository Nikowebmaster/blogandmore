// AkTivitys-Prototyp: Kartenstapel mit Wischfunktion
// links = ablehnen · rechts = dabei · nach unten = mehr davon
import { CARDS, MORE } from "./aktivitys-data.js";

const deck = document.getElementById("deck");
const stats = document.getElementById("proto-stats");
const THRESHOLD = 110;           // ab so vielen Pixeln zählt ein Wisch
const VISIBLE = 3;               // so viele Karten sind im Stapel sichtbar

let queue = [];
let result = { like: [], nope: [], more: [] };
let busy = false;
const usedMore = new Set();

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function start() {
  queue = CARDS.map((c) => ({ ...c }));
  result = { like: [], nope: [], more: [] };
  usedMore.clear();
  render();
}

// ---------- Darstellung ----------
function cardHtml(c) {
  return `
    <div class="pcard-img" style="background: linear-gradient(135deg, ${c.colors[0]}, ${c.colors[1]})">
      <span class="pcard-icon" aria-hidden="true">${c.icon}</span>
      <span class="pcard-activity">${esc(c.activity)}</span>
      <span class="pcard-when">🕒 ${esc(c.when)}</span>
      ${c.extra ? '<span class="pcard-new">Mehr davon</span>' : ""}
    </div>
    <ul class="pcard-info">
      <li><strong>Name:</strong> ${esc(c.name)}</li>
      <li><strong>Alter:</strong> ${esc(c.age)}</li>
      <li><strong>Kurztext:</strong> ${esc(c.text)}</li>
      <li><strong>Ort:</strong> ${esc(c.place)}</li>
    </ul>
    <div class="pcard-actions">
      <button class="pbtn nope" data-act="nope" aria-label="Ablehnen" title="Ablehnen (←)">✕</button>
      <button class="pbtn more" data-act="more" aria-label="Mehr davon" title="Mehr davon (↓)">⬇</button>
      <button class="pbtn like" data-act="like" aria-label="Dabei" title="Dabei (→)">♥</button>
    </div>
    <div class="stamp stamp-like">DABEI!</div>
    <div class="stamp stamp-nope">NEIN</div>
    <div class="stamp stamp-more">MEHR DAVON</div>`;
}

function render() {
  deck.innerHTML = "";
  updateStats();

  if (!queue.length) return renderEnd();

  // hinterste Karte zuerst, damit die oberste im DOM zuletzt kommt
  const shown = queue.slice(0, VISIBLE);
  shown.slice().reverse().forEach((c, i) => {
    const depth = shown.length - 1 - i; // 0 = oberste Karte
    const el = document.createElement("article");
    el.className = "pcard";
    el.style.setProperty("--depth", depth);
    el.setAttribute("aria-hidden", depth === 0 ? "false" : "true");
    el.innerHTML = cardHtml(c);
    if (depth === 0) {
      el.classList.add("top", "enter");
      attachDrag(el);
    }
    deck.append(el);
  });
}

function renderEnd() {
  const list = (arr) => arr.length
    ? `<ul>${arr.map((c) => `<li>${c.icon} ${esc(c.activity)} mit ${esc(c.name)} – ${esc(c.when)}</li>`).join("")}</ul>`
    : '<p class="muted">– keine –</p>';
  deck.innerHTML = `
    <div class="proto-end">
      <div class="proto-end-icon">🎉</div>
      <h3>Alle Karten angesehen!</h3>
      <h4>Hier bist du dabei:</h4>
      ${list(result.like)}
      <button class="btn" id="restart">Nochmal von vorne</button>
    </div>`;
  document.getElementById("restart").addEventListener("click", start);
}

function updateStats() {
  stats.innerHTML =
    `<span>♥ Dabei: <strong>${result.like.length}</strong></span>` +
    `<span>✕ Abgelehnt: <strong>${result.nope.length}</strong></span>` +
    `<span>⬇ Mehr davon: <strong>${result.more.length}</strong></span>`;
}

// ---------- Wischen per Maus / Finger ----------
function attachDrag(el) {
  let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;

  el.addEventListener("pointerdown", (e) => {
    if (busy || e.target.closest("button")) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY; dx = dy = 0;
    el.setPointerCapture(e.pointerId);
    el.classList.remove("enter", "snap");
    el.classList.add("dragging");
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    dy = Math.max(-40, e.clientY - startY); // nach oben kaum beweglich
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.07}deg)`;
    showStamp(el, direction(dx, dy), Math.min(1, Math.max(Math.abs(dx), dy) / THRESHOLD));
  });

  const end = () => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("dragging");
    const dir = direction(dx, dy);
    const dist = dir === "more" ? dy : Math.abs(dx);
    if (dir && dist > THRESHOLD) {
      fling(el, dir, dx, dy);
    } else {
      // zurückfedern
      el.classList.add("snap");
      el.style.transform = "";
      showStamp(el, null, 0);
    }
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);

  el.querySelectorAll("[data-act]").forEach((b) =>
    b.addEventListener("click", () => buttonSwipe(el, b.dataset.act)));
}

function direction(dx, dy) {
  if (dy > 30 && dy > Math.abs(dx)) return "more";
  if (dx > 20) return "like";
  if (dx < -20) return "nope";
  return null;
}

function showStamp(el, dir, strength) {
  for (const d of ["like", "nope", "more"]) {
    const s = el.querySelector(".stamp-" + d);
    s.style.opacity = d === dir ? strength : 0;
  }
  el.dataset.dir = dir || "";
}

// Button: Karte erst kurz anheben, dann wegwerfen
function buttonSwipe(el, dir) {
  if (busy) return;
  el.classList.remove("enter");
  showStamp(el, dir, 1);
  const btn = el.querySelector(`[data-act="${dir}"]`);
  btn.classList.add("pop");
  const pre = { like: [40, -10], nope: [-40, -10], more: [0, 30] }[dir];
  fling(el, dir, pre[0], pre[1]);
}

// ---------- Wegfliegen ----------
function fling(el, dir, dx, dy) {
  busy = true;
  const card = queue[0];
  const w = window.innerWidth;
  const h = window.innerHeight;
  const target = {
    like: `translate(${w}px, ${dy - 80}px) rotate(35deg)`,
    nope: `translate(${-w}px, ${dy - 80}px) rotate(-35deg)`,
    more: `translate(${dx}px, ${h}px) rotate(${dx * 0.05}deg) scale(.85)`,
  }[dir];

  el.classList.add("fly", "fly-" + dir);
  el.style.transform = target;
  burst(dir);

  // nächste Karte rückt sofort nach
  deck.querySelectorAll(".pcard:not(.top)").forEach((c) =>
    c.style.setProperty("--depth", Number(c.style.getPropertyValue("--depth")) - 1));

  setTimeout(() => {
    result[dir].push(card);
    queue.shift();
    if (dir === "more") addMoreOf(card);
    busy = false;
    render();
  }, 420);
}

// „Mehr davon“: passende Karte etwas weiter hinten einreihen
function addMoreOf(card) {
  const extra = MORE[card.activity];
  if (!extra || usedMore.has(card.activity)) return;
  usedMore.add(card.activity);
  const newCard = { ...card, ...extra, extra: true };
  queue.splice(Math.min(2, queue.length), 0, newCard);
}

// ---------- Effekt: kleine Symbole fliegen aus der Mitte ----------
function burst(dir) {
  const symbols = { like: ["♥", "✨", "♥", "🎉"], nope: ["✕", "💨"], more: ["⬇", "✨", "➕"] }[dir];
  const layer = document.createElement("div");
  layer.className = "burst burst-" + dir;
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("span");
    p.textContent = symbols[i % symbols.length];
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
    const dist = 80 + Math.random() * 70;
    p.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
    p.style.setProperty("--y", `${Math.sin(angle) * dist}px`);
    p.style.animationDelay = `${Math.random() * 60}ms`;
    layer.append(p);
  }
  deck.append(layer);
  setTimeout(() => layer.remove(), 900);
}

// ---------- Tastatur ----------
document.addEventListener("keydown", (e) => {
  const top = deck.querySelector(".pcard.top");
  if (!top || ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
  const dir = { ArrowLeft: "nope", ArrowRight: "like", ArrowDown: "more" }[e.key];
  if (dir) { e.preventDefault(); buttonSwipe(top, dir); }
});

start();
