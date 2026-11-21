// Supabase Edge Function "manage-members"
// Nur für Admins: Mitglieder anlegen ("create") und löschen ("delete").
// Läuft auf dem Server von Supabase – der geheime service_role-Key verlässt nie den Server.
import { createClient } from "npm:@supabase/supabase-js@2";

const MEMBER_EMAIL_DOMAIN = Deno.env.get("MEMBER_EMAIL_DOMAIN") ?? "mitglieder.voehr.com";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Wer ruft auf? Muss angemeldet und Admin sein.
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Nicht angemeldet." }, 401);

    const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (me?.role !== "admin") return json({ error: "Keine Berechtigung." }, 403);

    const body = await req.json();

    // ----- Mitglied löschen -----
    if (body.action === "delete") {
      if (!body.id) return json({ error: "Keine Mitglieds-ID angegeben." }, 400);
      if (body.id === user.id) return json({ error: "Du kannst dein eigenes Konto nicht löschen." }, 400);
      const { error } = await admin.auth.admin.deleteUser(body.id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }

    // ----- Mitglied anlegen -----
    const username = String(body.username ?? "").trim().toLowerCase();
    const first_name = String(body.first_name ?? "").trim();
    const last_name = String(body.last_name ?? "").trim();
    const password = String(body.password ?? "");
    const about = String(body.about ?? "").trim() || null;
    const city = String(body.city ?? "").trim() || null;
    const birth_date = body.birth_date || null;

    if (!/^[a-z0-9_.-]{3,30}$/.test(username))
      return json({ error: "Username: 3–30 Zeichen, nur Buchstaben a–z, Ziffern, Punkt, Bindestrich, Unterstrich." }, 400);
    if (!first_name || !last_name) return json({ error: "Vor- und Nachname sind Pflichtfelder." }, 400);
    if (password.length < 8) return json({ error: "Das Passwort muss mindestens 8 Zeichen haben." }, 400);

    const { data: taken } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
    if (taken) return json({ error: "Dieser Username ist schon vergeben." }, 400);

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: `${username}@${MEMBER_EMAIL_DOMAIN}`,
      password,
      email_confirm: true,
    });
    if (createError || !created.user) return json({ error: createError?.message ?? "Anlegen fehlgeschlagen." }, 400);

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id, username, first_name, last_name, about, city, birth_date, role: "member",
    });
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id); // aufräumen
      return json({ error: profileError.message }, 400);
    }

    return json({ ok: true, username });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
