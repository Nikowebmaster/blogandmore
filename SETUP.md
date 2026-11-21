# Einrichtung – Blog & Mitgliederbereich

GitHub Pages liefert nur fertige Dateien aus und kann selbst nichts speichern. Deshalb laufen Login, Mitglieder und Blog-Beiträge über **Supabase** (kostenloser Tarif, Server in der EU). Die Website selbst bleibt auf GitHub Pages.

Einmalig zu erledigen (ca. 15 Minuten):

## 1. Supabase-Projekt anlegen
1. Auf <https://supabase.com> ein Konto anlegen (z. B. „Sign in with GitHub“).
2. **New project** → Name z. B. `voehr-website`, Datenbank-Passwort selbst wählen und sicher aufbewahren.
3. **Region: Central EU (Frankfurt)** wählen (wichtig für die DSGVO).

## 2. Datenbank einrichten
1. Links **SQL Editor** → **New query**.
2. Den Inhalt von [`supabase/schema.sql`](supabase/schema.sql) einfügen → **Run**.

## 3. Öffentliche Registrierung abschalten
**Authentication → Sign In / Providers**:
- „Allow new users to sign up“ → **aus**
- Bei **Email**: „Confirm email“ → **aus**

## 4. Dein Admin-Konto anlegen
1. **Authentication → Users → Add user → Create new user**
   - E-Mail: `niko@mitglieder.voehr.com` (das ist nur die interne Login-Adresse; dort kommen keine E-Mails an)
   - Passwort: selbst wählen
   - „Auto Confirm User“ anhaken
2. Im **SQL Editor** den Inhalt von [`supabase/admin-niko.sql`](supabase/admin-niko.sql) ausführen.

Danach meldest du dich auf der Website mit Username **`niko`** und deinem Passwort an.

## 5. Funktion zum Anlegen von Mitgliedern
1. **Edge Functions → Deploy a new function → Via Editor**
2. Name: **`manage-members`** (genau so)
3. Inhalt von [`supabase/functions/manage-members/index.ts`](supabase/functions/manage-members/index.ts) einfügen → **Deploy**.

## 6. Website mit Supabase verbinden
**Project Settings → API** (bzw. „Data API“ und „API Keys“):
- **Project URL** und den **anon / public** Key kopieren
- in [`js/config.js`](js/config.js) bei `SUPABASE_URL` und `SUPABASE_ANON_KEY` eintragen

Der anon-Key ist öffentlich und darf auf der Website stehen. Den **service_role**-Key bitte **nie** in die Website kopieren.

## 7. Kontaktformular (Formspree)
1. Auf <https://formspree.io> ein Konto anlegen und ein Formular erstellen.
2. Die Formular-Adresse (z. B. `https://formspree.io/f/abcdwxyz`) in [`js/config.js`](js/config.js) bei `FORM_ENDPOINT` eintragen.

---

## Bedienung
- **Login:** Menüpunkt „Login“ → Username + Passwort.
- **Beitrag schreiben:** Im Mitgliederbereich Kategorie wählen, Titel und Text eingeben → „Veröffentlichen“. Eine Leerzeile beginnt einen neuen Absatz.
- **Mitglied anlegen (nur Admin):** Im Mitgliederbereich unten das Formular ausfüllen (Vorname, Nachname, Username, Passwort, Über mich, Geburtsdatum, Wohnort). Das Passwort dann persönlich an das Mitglied weitergeben.
- **Mitglied entfernen (nur Admin):** In der Mitgliederliste auf „Entfernen“ klicken. Das löscht auch alle Beiträge dieses Mitglieds.
- **Neue Kategorie:** in `js/config.js` (Liste `CATEGORIES`) **und** in der Datenbank-Tabelle `categories` ergänzen.
