// Läuft auf allen Seiten: Menü, Jahr im Footer, Login-Link, Kontaktformular
import { FORM_ENDPOINT } from "./config.js";
import { getCurrentMember } from "./supabase.js";

// ===== Markenzeichen: in "AkTivitys" A und T weiß auf rot =====
// Läuft über alle Texte der Seite – auch über Inhalte, die später geladen werden (z. B. Blog-Beiträge).
const BRAND = /AkTivitys/gi;
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "OPTION", "SELECT", "TITLE", "NOSCRIPT"]);

function brandify(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement;
      if (!p || SKIP.has(p.tagName) || p.closest(".brand, [contenteditable]")) return NodeFilter.FILTER_REJECT;
      BRAND.lastIndex = 0;
      return BRAND.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    BRAND.lastIndex = 0;
    for (const m of text.matchAll(BRAND)) {
      frag.append(text.slice(last, m.index));
      const w = m[0];
      const brand = document.createElement("span");
      brand.className = "brand";
      brand.innerHTML = `<span class="brand-at">${w[0]}</span>${w[1]}<span class="brand-at">${w[2]}</span>${w.slice(3)}`;
      frag.append(brand);
      last = m.index + w.length;
    }
    frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

brandify(document.body);
new MutationObserver((changes) => {
  for (const c of changes) c.addedNodes.forEach((n) => {
    if (n.nodeType === Node.ELEMENT_NODE) brandify(n);
    else if (n.nodeType === Node.TEXT_NODE && n.parentElement) brandify(n.parentElement);
  });
}).observe(document.body, { childList: true, subtree: true });

// Jahr im Footer
document.querySelectorAll(".year").forEach((el) => (el.textContent = new Date().getFullYear()));

// Mobiles Menü
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

// Login-Link → "Mein Bereich", wenn angemeldet
const authLink = document.getElementById("auth-link");
if (authLink) {
  getCurrentMember()
    .then((m) => {
      if (m) {
        authLink.textContent = "Mein Bereich";
        authLink.href = "mitglieder.html";
      }
    })
    .catch(() => {});
}

// Kontaktformular
const form = document.getElementById("contact-form");
if (form) {
  const status = form.querySelector(".form-status");
  const button = form.querySelector("button[type=submit]");
  const setStatus = (text, type) => {
    status.textContent = text;
    status.className = "form-status " + (type || "");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      setStatus("Bitte alle Felder ausfüllen, eine gültige E-Mail angeben und der Datenschutzerklärung zustimmen.", "err");
      form.reportValidity();
      return;
    }
    if (FORM_ENDPOINT.includes("DEINE_FORM_ID")) {
      setStatus("Das Formular ist noch nicht eingerichtet (Formspree-ID fehlt).", "err");
      return;
    }
    button.disabled = true;
    setStatus("Wird gesendet …");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        setStatus("Danke! Deine Nachricht wurde gesendet.", "ok");
      } else {
        setStatus("Senden fehlgeschlagen. Bitte später erneut versuchen.", "err");
      }
    } catch {
      setStatus("Keine Verbindung. Bitte später erneut versuchen.", "err");
    } finally {
      button.disabled = false;
    }
  });
}
