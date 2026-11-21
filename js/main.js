// Läuft auf allen Seiten: Menü, Jahr im Footer, Login-Link, Kontaktformular
import { FORM_ENDPOINT } from "./config.js";
import { getCurrentMember } from "./supabase.js";

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
