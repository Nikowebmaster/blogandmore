// ===== Einstellungen – hier einmalig eintragen (siehe SETUP.md) =====

// Supabase: Projekt-URL und "anon public" Key
// (Supabase-Dashboard → Project Settings → API). Der anon-Key ist öffentlich und darf hier stehen.
export const SUPABASE_URL = "https://DEIN-PROJEKT.supabase.co";
export const SUPABASE_ANON_KEY = "DEIN_ANON_KEY";

// Interne Login-Adressen der Mitglieder: aus dem Username "max" wird "max@<Domain>".
// Diese Adressen bekommen keine E-Mails, sie dienen nur der Anmeldung.
export const MEMBER_EMAIL_DOMAIN = "mitglieder.voehr.com";

// Kontaktformular: Formspree-Adresse (https://formspree.io)
export const FORM_ENDPOINT = "https://formspree.io/f/xzerjpvk";

// Blog-Kategorien (müssen zu den Einträgen in supabase/schema.sql passen)
export const CATEGORIES = [
  { slug: "autos", name: "Autos" },
  { slug: "investment", name: "Investment" },
  { slug: "fitness", name: "Fitness" },
  { slug: "aktivitys", name: "AkTivitys" },
];
