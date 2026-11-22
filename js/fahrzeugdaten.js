// Fahrzeugdaten: kaskadierte Auswahl + Verwaltung (nur Admin)
import { getClient, getCurrentMember, esc, notConfiguredHtml } from "./supabase.js";

const LEVELS = [
  { key: "brand", label: "Marke" },
  { key: "model", label: "Modell" },
  { key: "body", label: "Karosserieform" },
  { key: "engine", label: "Motor" },
  { key: "drivetrain", label: "Antriebsart" },
];

// Erklärungen, die beim Darüberfahren (bzw. Antippen) an Feldern erscheinen
const ATTR_HINTS = [
  { match: /\(real\)/i, text: "Mit realistischer, guter Ausstattung" },
];
const hintFor = (name) => ATTR_HINTS.find((h) => h.match.test(name))?.text;
const hintHtml = (name) => {
  const t = hintFor(name);
  return t ? ` <span class="fz-hint" tabindex="0" role="note" aria-label="${esc(t)}" data-tip="${esc(t)}">i</span>` : "";
};

const $ = (id) => document.getElementById(id);
const collator = new Intl.Collator("de", { numeric: true, sensitivity: "base" });

let sb = null;
let isAdmin = false;
let vehicles = [];          // [{id, brand, model, ...}]
let attrs = [];             // [{id, name, unit, sort}]
let values = new Map();     // vehicleId → Map(attrId → value)
let extras = [];
const selection = {};       // aktuelle Auswahl je Ebene

async function start() {
  sb = await getClient().catch(() => null);
  if (!sb) {
    $("fz-loading").outerHTML = notConfiguredHtml;
    return;
  }
  const member = await getCurrentMember().catch(() => null);
  isAdmin = member?.profile.role === "admin";
  buildSelects();
  await loadAll();
  $("fz-loading").remove();
  if (isAdmin) initAdmin(); else $("fz-login-hint").classList.remove("hidden");
}

async function loadAll() {
  const [v, a, val, ex] = await Promise.all([
    sb.from("vehicles").select("*"),
    sb.from("vehicle_attributes").select("*").order("sort").order("name"),
    sb.from("vehicle_values").select("*"),
    sb.from("vehicle_extras").select("*").order("sort"),
  ]);
  const err = v.error || a.error || val.error || ex.error;
  if (err) {
    $("fz-select-panel").innerHTML = `<p class="notice">Daten konnten nicht geladen werden: ${esc(err.message)}</p>`;
    return;
  }
  vehicles = v.data;
  attrs = a.data;
  extras = ex.data;
  values = new Map();
  for (const row of val.data) {
    if (!values.has(row.vehicle_id)) values.set(row.vehicle_id, new Map());
    values.get(row.vehicle_id).set(row.attribute_id, row.value);
  }
  refreshSelects();
  renderExtras();
  if (isAdmin) { renderAttrFields(); renderAttrList(); renderAll(); fillDatalists(); }
}

// ---------- Kaskadierte Auswahl ----------
function buildSelects() {
  $("fz-selects").innerHTML = LEVELS.map((l, i) => `
    <label>${i + 1}. ${l.label}
      <select data-level="${i}" disabled><option value="">– bitte wählen –</option></select>
    </label>`).join("");
  $("fz-selects").querySelectorAll("select").forEach((s) =>
    s.addEventListener("change", () => choose(Number(s.dataset.level), s.value)));
}

// Varianten, die zu den Auswahlen bis (exklusive) Ebene n passen
const matching = (n) => vehicles.filter((v) => LEVELS.slice(0, n).every((l) => v[l.key] === selection[l.key]));

function choose(level, value) {
  selection[LEVELS[level].key] = value || undefined;
  for (let i = level + 1; i < LEVELS.length; i++) delete selection[LEVELS[i].key];
  refreshSelects();
}

function refreshSelects() {
  const selects = $("fz-selects").querySelectorAll("select");
  for (let i = 0; i < LEVELS.length; i++) {
    const key = LEVELS[i].key;
    const sel = selects[i];
    const prevChosen = i === 0 || selection[LEVELS[i - 1].key];
    if (!prevChosen) {
      sel.innerHTML = '<option value="">– bitte wählen –</option>';
      sel.disabled = true;
      continue;
    }
    const opts = [...new Set(matching(i).map((v) => v[key]))].sort(collator.compare);
    // Auswahl verwerfen, falls nicht mehr vorhanden; bei nur einer Möglichkeit automatisch wählen
    if (selection[key] && !opts.includes(selection[key])) delete selection[key];
    if (!selection[key] && opts.length === 1) selection[key] = opts[0];
    sel.innerHTML = '<option value="">– bitte wählen –</option>' +
      opts.map((o) => `<option ${o === selection[key] ? "selected" : ""}>${esc(o)}</option>`).join("");
    sel.disabled = opts.length === 0;
  }
  renderResult();
}

function selectedVehicle() {
  if (!LEVELS.every((l) => selection[l.key])) return null;
  return matching(LEVELS.length)[0] ?? null;
}

const fmt = (val, unit) => (val === undefined || val === "" ? '<span class="muted">–</span>' : `${esc(val)}${unit ? " " + esc(unit) : ""}`);

function renderResult() {
  const v = selectedVehicle();
  $("fz-result").classList.toggle("hidden", !v);
  if (!v) return;
  $("fz-result-title").textContent = `${v.brand} ${v.model} · ${v.body} · ${v.engine} · ${v.drivetrain}`;
  const vals = values.get(v.id) ?? new Map();
  $("fz-result-body").innerHTML = attrs.map((a) =>
    `<tr><th scope="row">${esc(a.name)}${hintHtml(a.name)}</th><td>${fmt(vals.get(a.id), a.unit)}</td></tr>`).join("");
  const btn = $("fz-edit-current");
  btn.classList.toggle("hidden", !isAdmin);
  btn.onclick = () => editVehicle(v.id);
}

function renderExtras() {
  $("fz-extras").classList.toggle("hidden", !extras.length);
  $("fz-extras-body").innerHTML = extras.map((e) =>
    `<tr><th scope="row">${esc(e.label)}</th><td>${fmt(e.value, e.unit)}</td></tr>`).join("");
}

function showVehicle(id) {
  const v = vehicles.find((x) => x.id === id);
  if (!v) return;
  LEVELS.forEach((l) => (selection[l.key] = v[l.key]));
  refreshSelects();
  $("fz-result").scrollIntoView({ behavior: "smooth" });
}

// ---------- Verwaltung ----------
function initAdmin() {
  $("fz-admin").classList.remove("hidden");
  $("fz-key-fields").innerHTML = LEVELS.map((l) => `
    <label>${l.label}
      <input type="text" name="${l.key}" required maxlength="80" list="dl-${l.key}">
      <datalist id="dl-${l.key}"></datalist>
    </label>`).join("");
  fillDatalists();
  renderAttrFields();
  renderAttrList();
  renderAll();

  const form = $("fz-form");
  form.addEventListener("submit", (e) => { e.preventDefault(); saveVehicle(false); });
  $("fz-save-copy").addEventListener("click", () => saveVehicle(true));
  $("fz-reset").addEventListener("click", resetForm);
  $("fz-attr-form").addEventListener("submit", addAttribute);
}

function fillDatalists() {
  for (const l of LEVELS) {
    const dl = $("dl-" + l.key);
    if (!dl) continue;
    const opts = [...new Set(vehicles.map((v) => v[l.key]))].sort(collator.compare);
    dl.innerHTML = opts.map((o) => `<option value="${esc(o)}">`).join("");
  }
}

function renderAttrFields() {
  const box = $("fz-attr-fields");
  if (!box) return;
  // bereits eingetippte Werte beim Neuaufbau behalten
  const keep = Object.fromEntries([...box.querySelectorAll("input")].map((i) => [i.dataset.attr, i.value]));
  box.innerHTML = attrs.map((a) => `
    <label>${esc(a.name)}${hintHtml(a.name)}${a.unit ? ` <span class="muted small">(${esc(a.unit)})</span>` : ""}
      <input type="text" data-attr="${a.id}" maxlength="200" inputmode="decimal" value="${esc(keep[a.id] ?? "")}">
    </label>`).join("");
}

function resetForm() {
  const form = $("fz-form");
  form.reset();
  form.elements.id.value = "";
  $("fz-attr-fields").querySelectorAll("input").forEach((i) => (i.value = ""));
  $("fz-form-title").textContent = "Neue Variante anlegen";
  $("fz-save").textContent = "Speichern";
  $("fz-save-copy").classList.add("hidden");
  setStatus(form, "");
}

function editVehicle(id) {
  const v = vehicles.find((x) => x.id === id);
  if (!v) return;
  const form = $("fz-form");
  form.elements.id.value = v.id;
  LEVELS.forEach((l) => (form.elements[l.key].value = v[l.key]));
  const vals = values.get(v.id) ?? new Map();
  $("fz-attr-fields").querySelectorAll("input").forEach((i) => (i.value = vals.get(Number(i.dataset.attr)) ?? ""));
  $("fz-form-title").textContent = "Variante bearbeiten";
  $("fz-save").textContent = "Änderungen speichern";
  $("fz-save-copy").classList.remove("hidden");
  setStatus(form, "");
  $("fz-form-panel").scrollIntoView({ behavior: "smooth" });
}

async function saveVehicle(asCopy) {
  const form = $("fz-form");
  if (!form.reportValidity()) return;
  const id = asCopy ? null : Number(form.elements.id.value) || null;
  const p_values = {};
  $("fz-attr-fields").querySelectorAll("input").forEach((i) => (p_values[i.dataset.attr] = i.value.trim()));
  setStatus(form, "Wird gespeichert …");
  const { data: newId, error } = await sb.rpc("save_vehicle", {
    p_id: id,
    p_brand: form.elements.brand.value,
    p_model: form.elements.model.value,
    p_body: form.elements.body.value,
    p_engine: form.elements.engine.value,
    p_drivetrain: form.elements.drivetrain.value,
    p_values,
  });
  if (error) {
    const msg = /duplicate|unique/i.test(error.message)
      ? "Diese Kombination aus Marke, Modell, Karosserie, Motor und Antrieb gibt es schon."
      : "Speichern fehlgeschlagen: " + error.message;
    return setStatus(form, msg, "err");
  }
  await loadAll();
  editVehicle(newId);
  setStatus(form, asCopy ? "Als neue Variante gespeichert." : "Gespeichert.", "ok");
  showVehicleQuiet(newId);
}

function showVehicleQuiet(id) {
  const v = vehicles.find((x) => x.id === id);
  if (!v) return;
  LEVELS.forEach((l) => (selection[l.key] = v[l.key]));
  refreshSelects();
}

async function deleteVehicle(id) {
  const v = vehicles.find((x) => x.id === id);
  if (!v || !confirm(`Variante „${v.brand} ${v.model} · ${v.body} · ${v.engine} · ${v.drivetrain}“ samt allen Daten löschen?`)) return;
  const { error } = await sb.from("vehicles").delete().eq("id", id);
  if (error) return alert("Löschen fehlgeschlagen: " + error.message);
  if (Number($("fz-form").elements.id.value) === id) resetForm();
  await loadAll();
}

function renderAll() {
  const box = $("fz-all");
  if (!box) return;
  const sorted = [...vehicles].sort((a, b) =>
    LEVELS.map((l) => collator.compare(a[l.key], b[l.key])).find((c) => c !== 0) ?? 0);
  if (!sorted.length) { box.innerHTML = '<p class="muted">Noch keine Varianten.</p>'; return; }
  box.innerHTML = `<table class="table"><thead><tr>${LEVELS.map((l) => `<th>${l.label}</th>`).join("")}<th></th></tr></thead><tbody>${
    sorted.map((v) => `<tr>${LEVELS.map((l) => `<td>${esc(v[l.key])}</td>`).join("")}
      <td class="actions">
        <button class="link-btn" data-show="${v.id}">Anzeigen</button>
        <button class="link-btn" data-edit="${v.id}">Bearbeiten</button>
        <button class="link-btn danger" data-del="${v.id}">Löschen</button>
      </td></tr>`).join("")
  }</tbody></table>`;
  box.querySelectorAll("[data-show]").forEach((b) => b.addEventListener("click", () => showVehicle(Number(b.dataset.show))));
  box.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editVehicle(Number(b.dataset.edit))));
  box.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteVehicle(Number(b.dataset.del))));
}

// ---------- Felder verwalten ----------
function renderAttrList() {
  const box = $("fz-attr-list");
  if (!box) return;
  box.innerHTML = `<table class="table fz-attr-table"><thead><tr><th>Feld</th><th>Einheit</th><th>Reihenfolge</th><th></th></tr></thead><tbody>${
    attrs.map((a) => `<tr data-id="${a.id}">
      <td><input type="text" class="fz-in" name="name" value="${esc(a.name)}" maxlength="80" aria-label="Feldname"></td>
      <td><input type="text" class="fz-in" name="unit" value="${esc(a.unit ?? "")}" maxlength="20" size="6" aria-label="Einheit"></td>
      <td><input type="number" class="fz-in" name="sort" value="${a.sort}" step="10" style="width:6rem" aria-label="Reihenfolge"></td>
      <td class="actions">
        <button class="link-btn" data-save-attr>Speichern</button>
        <button class="link-btn danger" data-del-attr>Löschen</button>
      </td></tr>`).join("")
  }</tbody></table>`;
  box.querySelectorAll("tr[data-id]").forEach((tr) => {
    const id = Number(tr.dataset.id);
    const get = (n) => tr.querySelector(`[name=${n}]`).value.trim();
    tr.querySelector("[data-save-attr]").addEventListener("click", async () => {
      if (!get("name")) return alert("Der Feldname darf nicht leer sein.");
      const { error } = await sb.from("vehicle_attributes")
        .update({ name: get("name"), unit: get("unit") || null, sort: Number(get("sort")) || 0 }).eq("id", id);
      if (error) return alert(/duplicate|unique/i.test(error.message) ? "Ein Feld mit diesem Namen gibt es schon." : "Speichern fehlgeschlagen: " + error.message);
      await loadAll();
    });
    tr.querySelector("[data-del-attr]").addEventListener("click", async () => {
      const a = attrs.find((x) => x.id === id);
      const used = [...values.values()].filter((m) => m.has(id)).length;
      if (!confirm(`Feld „${a.name}“ löschen?${used ? `\nDamit werden die Werte bei ${used} Variante(n) gelöscht.` : ""}`)) return;
      const { error } = await sb.from("vehicle_attributes").delete().eq("id", id);
      if (error) return alert("Löschen fehlgeschlagen: " + error.message);
      await loadAll();
    });
  });
}

async function addAttribute(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const sort = Math.max(0, ...attrs.map((a) => a.sort)) + 10;
  const { error } = await sb.from("vehicle_attributes").insert({
    name: form.elements.name.value.trim(), unit: form.elements.unit.value.trim() || null, sort,
  });
  if (error) return setStatus(form, /duplicate|unique/i.test(error.message) ? "Ein Feld mit diesem Namen gibt es schon." : "Fehler: " + error.message, "err");
  form.reset();
  setStatus(form, "Feld hinzugefügt – es steht jetzt bei allen Varianten zur Verfügung.", "ok");
  await loadAll();
}

function setStatus(form, text, type = "") {
  const el = form.querySelector(".form-status");
  el.textContent = text;
  el.className = "form-status " + type;
}

// ---------- Start (am Ende, damit alle Funktionen definiert sind) ----------
start();
