// Gemeinsame Helfer: Supabase-Verbindung, Anmeldung, Formatierung
import { SUPABASE_URL, SUPABASE_ANON_KEY, MEMBER_EMAIL_DOMAIN, CATEGORIES } from "./config.js";

const CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const isConfigured =
  !SUPABASE_URL.includes("DEIN-PROJEKT") && !SUPABASE_ANON_KEY.includes("DEIN_");

let clientPromise = null;

/** Liefert den Supabase-Client (nur eine Instanz pro Seite) oder null, wenn noch nicht eingerichtet. */
export function getClient() {
  if (!isConfigured) return Promise.resolve(null);
  clientPromise ??= import(CDN).then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  return clientPromise;
}

/** Username → interne Login-Adresse. Eine echte E-Mail-Adresse wird unverändert verwendet. */
export const usernameToEmail = (u) => {
  const v = u.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${MEMBER_EMAIL_DOMAIN}`;
};

/** Aktuelle Sitzung + Profil (oder null). */
export async function getCurrentMember() {
  const sb = await getClient();
  if (!sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", session.user.id).single();
  return profile ? { user: session.user, profile } : null;
}

export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("de-AT", { day: "2-digit", month: "long", year: "numeric" });

/** HTML-Sonderzeichen entschärfen (Schutz vor eingeschleustem Code). */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Text in Absätze umwandeln (Leerzeile = neuer Absatz). */
export const paragraphs = (text) =>
  String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

export const notConfiguredHtml =
  '<p class="notice">Der Blog ist noch nicht mit der Datenbank verbunden (Supabase-Zugangsdaten in <code>js/config.js</code> fehlen).</p>';
