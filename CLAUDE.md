# Projektnotizen für Claude

Persönliche Website von Niko (Wien, Österreich). Kommunikation mit Niko **auf Deutsch**, einfach erklärt (kein Entwickler).

## Überblick
- **Hosting:** GitHub Pages, Repo `Nikowebmaster/blogandmore`, Branch `main`, Ordner `/` → https://nikowebmaster.github.io/blogandmore/
- **Technik:** reines HTML/CSS/JavaScript (ES-Module), kein Build-Schritt, keine npm-Pakete.
- **Datenbank & Login:** Supabase (Region Frankfurt), Projekt `ewkwfotyuvotlfjcnjcq`. Zugangsdaten (nur URL + publishable Key, öffentlich) in `js/config.js`. Der Secret Key gehört **nie** ins Repo.
- **Kontaktformular:** Formspree (`FORM_ENDPOINT` in `js/config.js`).
- **Supabase wach halten:** GitHub Action `.github/workflows/supabase-keepalive.yml` (alle 3 Tage).

## Seiten
| Datei | Inhalt |
|---|---|
| `index.html` | Startseite: oben **Dashboard** mit Widgets (`js/dashboard.js`; Wetter Wien 6 Tage via Open-Meteo inkl. Sonnenauf-/-untergang, ohne API-Key, 30 min Cache; Garagen-Widget mit Daten in `js/garagen-data.js`, Live-Belegung über Edge Function `garage-status`; Tagespreise wöchentlich per GitHub Action `garage-prices.yml` → `data/garage-prices.json`, Auslese-Regeln in `tools/price-parsers.mjs`), darunter Blog (Kategorien links bzw. Dropdown am Handy) + Kontaktformular |
| `blog.html` | Blog-Übersicht, `?kategorie=…`, Einzelbeitrag `?post=<id>` |
| `ueber-mich.html` | Visitenkarte |
| `aktivitys.html` | Projekt AkTivitys |
| `aktivitys_test.html` | AkTivitys-Prototyp: Kartenstapel mit Wischen (`js/aktivitys-proto.js`, Daten `js/aktivitys-data.js`, CSS `aktivitys-proto.css`) |
| `fahrzeugdaten.html` | **Versteckt** (nirgends verlinkt, noindex): BMW-Fahrzeugdaten, kaskadierte Auswahl + Admin-Verwaltung (`js/fahrzeugdaten.js`) |
| `login.html` | Login mit Username (intern `username@mitglieder.voehr.com`), unterstützt `?next=<seite>.html` |
| `mitglieder.html` | Mitgliederbereich: Beiträge, Profil; Admin: Mitglieder anlegen/entfernen |
| `offenlegung.html`, `datenschutz.html` | Rechtliches (Österreich) |

Gemeinsames JS: `js/main.js` (Menü, AkTivitys-Hervorhebung, Kategorie-Dropdown, Kontaktformular), `js/supabase.js` (Client, Helfer `esc`, `getCurrentMember`), `js/blog.js`, `js/members.js`. Styles: `style.css`.

## Datenbank (Supabase)
- SQL-Dateien in `supabase/` – Niko führt sie selbst im SQL Editor aus (Claude hat keinen DB-Admin-Zugang).
- Blog: `profiles`, `categories`, `posts`, View `posts_public`; Rechte in `schema.sql` + `grants.sql` (neue Supabase-Projekte vergeben Tabellenrechte nicht automatisch → immer explizite `grant`s).
- Fahrzeugdaten: `vehicles`, `vehicle_attributes` (frei erweiterbare Felder), `vehicle_values`, `vehicle_extras`, Funktion `save_vehicle`. Schreiben nur Admin (`is_admin()`).
- Edge Function `manage-members` (Mitglieder anlegen/löschen, nur Admin).
- Admin-Konto: Username `niko`. Passwörter tippt Niko immer selbst ein.
- Datenänderungen über die Website-Oberfläche/den angemeldeten Browser sind ok, wenn Niko darum bittet. **Werte, die Niko selbst eingetragen hat, nicht überschreiben** – bei Abweichungen nachfragen.

## Gestaltung & Inhalte
- Farben: Grautöne im Hintergrund, Dunkelblau `#12305a` für Elemente, Text schwarz/weiß.
- „AkTivitys“: A und T weiß mit roter Kontur – passiert automatisch per `brandify()` in `js/main.js`.
- Nachname wird auf der Website **nicht** gezeigt (nur „Niko“). Ausnahme: Offenlegung (Medieninhaber) und Datenschutz (Verantwortlicher) – gesetzlich vorgeschrieben, auf Nikos Wunsch so belassen.
- Blog-Kategorien: Autos, Investment, Fitness, AkTivitys (`CATEGORIES` in `js/config.js` + Tabelle `categories`).

## Arbeitsweise
1. Vor Änderungen `git pull`.
2. Änderungen lokal testen: Dev-Server `website` aus `.claude/launch.json` (startet `tools/serve.ps1`, Port 8080; `.claude/` ist nicht im Repo – bei Bedarf neu anlegen), Desktop **und** Handy-Ansicht (375 px) prüfen.
3. Danach committen und pushen (Git-Pfad: `C:\Program Files\Git\cmd\git.exe`; Push-Anmeldung ist gespeichert).
4. Nur eigene, geänderte Dateien committen – keine fremden lokalen Änderungen mitnehmen, ohne zu fragen.
