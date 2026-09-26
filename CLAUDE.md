# CLAUDE.md — Gambit Rise

Fantasy-Schach-RPG als PWA. Live: https://gambitrise.com (Cloudflare Pages,
deployt AUTOMATISCH bei jedem Push auf main, ~2–5 min). Der Worker "gg-hall"
(Online-Duelle) deployt ebenfalls automatisch. **Jeder Push auf main geht
direkt zu echten Nutzern.**

Stack: React 18, Vite 5, pure ESM, Node 22.
Die Seite: **/** ist das Schaufenster (Landingpage), **/spielen/** die App
hinter einem Riegel (Passwort, beim Bau über GAMBIT_ZUGANG).
Play Store: die App ist NICHT veröffentlicht; Paket **com.gambitrise.app**
(neu, die alte Kennung war nie in Gebrauch). Ein neues Paket muss gebaut
werden — Host und Startpfad haben sich geändert.
Cloudflare-Projekt heißt weiterhin **grand-gambit**, das GitHub-Repo soll auf
**gambit-rise** umbenannt werden (nur der Besitzer darf das).

## Zusammenarbeit

- Antworten auf DEUTSCH. Der Besitzer (Manuel) diktiert per Sprachnachricht,
  arbeitet mobil, erwartet autonomes Abarbeiten dichter Aufgabenlisten.
- Jede Antwort endet mit der vollständigen Liste offener Punkte.
- Ehrliche Fehlerberichte statt sicherer Behauptungen. Diagnose durch
  MESSUNG, nicht durch Vermutung (siehe Live-Messung unten).
- Commits auf Deutsch, ausführlich, benennen die ECHTE Ursache, nicht nur
  das Symptom. Autor: `git -c user.name="Claude" -c user.email="noreply@anthropic.com"`.
- Generierte Bilder IMMER erst dem Besitzer zeigen, bevor sie eingebaut
  werden. KEINE Bild-API-Aufrufe (fal.ai etc.) ohne ausdrückliche Freigabe.
- Niemals Schlüssel, Tokens oder Passwörter in Dateien, Logs oder Commits.

## Befehle

- `npm test` — volle Batterie. MUSS **27 Suiten / 1993 Prüfungen** melden
  (Stand v1.86.0; der Runner stoppt nach der ersten roten Suite, also
  Suitenzahl prüfen, nicht nur Assertions!).
- `npm run ui` — nur die UI-Proben (test_ui.jsx läuft NIE direkt mit node;
  braucht esbuild-Vorlauf).
- `npm run build` — Spielfassung + Schaukammer-Scan (Zeile
  "vorschauen: N/N" muss vollzählig sein) + Umzug auf `/` und `/spielen/`.
- **`OHNE_ARCHIV=1 npm run build`** — derselbe Bau, aber ohne die drei großen
  Archivordner. **Gemessen: 51 MB statt 743 MB**, und in Sekunden statt Minuten
  fertig. Für jeden Zwischenstand und jede Probe der richtige Weg; für einen
  echten Release **ohne** den Schalter bauen, sonst fehlen der Schaukammer live
  die Originale (der Vorschau-Zähler sagt dann „übersprungen" statt N/N).
- `npm run build:single` — Ein-Datei-Fassung (~49 MB).
- `node test_boot.mjs` — Boot-Proben (3/3).
- `node scripts/verify-boot.mjs` — DAS CI-SKRIPT (JSDOM; wertet jeden
  Konsolenfehler als Boot-Versagen). Lokal grün heißt CI grün.
- `timeout 250 node drive3.mjs` — Kampagnen-Fahrprobe ("== KEINE FEHLER ==").
- `npm run pruefe:fluss` — Playwright-Textfluss/Popup-Messung.
- `node tools/pruefe-navigation.mjs` — die NAVIGATIONSPROBE (v1.86.0): fährt in
  mehreren Runden **das ganze Haus** und wertet jeden Konsolenfehler als
  Absturz — Karte mit allen Stationsfenstern, Gefecht (betreten *und* mitten im
  Spiel verlassen, inklusive der Rückfrage „Kampf verlassen?"), alle vier
  Reiter, Schnelles Spiel, Akademie, Online-Duell, die Unterreiter im
  Figuren-Schirm und die Zurück-Geste. `RUNDEN=5` für längere Läufe.
  Braucht `dist/` mit der App, also **nach `npm run build:app`**
  (oder `npx vite build`).
  **Der Kopf der Datei ist Pflichtlektüre, bevor man sie ändert:** fünf
  Fassungen lang hat sie Dinge als Absturz gemeldet, die keiner waren
  (`about:blank` nach der Zurück-Geste, die ausgeblendete Reiterleiste auf der
  Karte, gesperrte Stationen, „‹ Zurück" mit Winkel, „Fortsetzen" statt
  „Herausforderung starten"). Alle fünf sind dort mit Messung festgehalten.
- `node test_layout.mjs` — echte Geometrie im Browser. Läuft wieder (v1.86.0:
  die Klang-Loader fehlten), hängt aber NICHT in der Kette: vier Proben
  erwarten ein vertikal zentriertes Brett, was seit dem Talentband nicht mehr
  gilt. Der Kopf der Datei hat die Messwerte — die Erwartung ist eine offene
  Designfrage.

Lange Läufe im Muster
`(timeout 280 cmd > /tmp/x.log 2>&1; echo exit=$? >> /tmp/x.log) & sleep 285; tail /tmp/x.log`
starten, sonst reißen Werkzeug-Zeitlimits den Lauf ab.

## EISERNE KETTE — Pflicht vor JEDEM Push, keine Ausnahmen

1. `npm test` (27 Suiten, Assertionszahl notieren)
2. `npm run build`, dann **`npm run build:app`**, dann `npm run build:single`

   **Warum `build:app` NACH `build` gehört** (v1.86.0, teuer gelernt):
   `npm run build` schließt `tools/seite-bauen.mjs` ein. Danach liegt unter
   `dist/index.html` die **Landingpage**, die App steckt in `dist/spielen/`.
   Wer dann `drive3.mjs` laufen lässt, bekommt vier Fehler gemeldet, die es
   nicht gibt („Anmeldung nicht möglich | kein Brett | kein Zug | kein
   Talentband"). `build:app` stellt die App an die Wurzel zurück, und die
   Proben greifen wieder. drive3 erkennt seit v1.86.0 BEIDE Stände und prüft im
   Auslieferungsstand zusätzlich Landingpage, Riegel und den abmeldenden
   Dienstarbeiter — der Umzug ist damit erstmals unter Aufsicht.
3. `node test_boot.mjs` (3/3) und `node scripts/verify-boot.mjs` (grün)
4. `timeout 250 node drive3.mjs` (keine Fehler); bei Arbeit an Karte,
   Kampagne oder Navigation zusätzlich `node tools/pruefe-navigation.mjs`
5. REINRAUM: `git clone . /tmp/rr && cp -r node_modules /tmp/rr/` und dort
   Schritte 1–4 wiederholen
6. `git fetch` + Punktprüfung: liegt auf origin ein fremder Commit, Inhalt
   verifizieren (`git diff --stat HEAD FETCH_HEAD`). Es können PARALLELE
   Sessions arbeiten. NIEMALS force-pushen.
7. Push, dann `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/version.json`
   pollen und Marker-Strings im Live-Bundle zählen:
   `grep -o "marker" bundle.js | wc -l` (`grep -c` zählt Zeilen — minifiziert
   ist alles EINE Zeile). Echtes Bundle via `ls -S dist/assets/index-*.js`
   (das erste Ergebnis ohne -S ist oft der 5-KB-Stub). Cloudflare-Hashes
   weichen von lokalen ab — NIE per Hash vergleichen, nur per Marker.

Versionsnummer in package.json bei jedem inhaltlichen Release erhöhen;
Changelog-Zeile deutsch, benennt die Ursache.

## Live-Messung (das Abnahmewerkzeug für alles Sichtbare)

Quelltext lesen hat wiederholt getäuscht; gemessen wird am lebenden DOM
(getBoundingClientRect + computedStyle) per Playwright:

- `playwright-core` mit executablePath
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, `--no-sandbox`,
  Context mit `serviceWorkers: "block"` (sonst lädt der Service Worker die
  Seite mitten im Login neu).
- Einstieg: Login-Formular (Konto "admin"), dann "Weiterspielen" bzw.
  "Neuer Spielstand". Auftaktfenster per DOM-Klick schließen — die Knöpfe
  heißen "Los geht's" (Datenschutz, Intro) und "Verstanden" (Freigaben),
  NIE "Start".
- Reiterwechsel: `locator('button').filter({ hasText: "FIGUREN" }).last()`,
  danach 4 s warten (artReady lädt Bilder bis zu 3 s vor).

## Technische Fallen (alle schon einmal teuer bezahlt)

- JSX-Kommentare `{/* … */}` brauchen die schließende Klammer; vor jedem
  Commit betroffene Dateien mit
  `npx esbuild <datei> --loader:.jsx=jsx --outfile=/tmp/x.js` prüfen.
- Der Storage hält JSON-STRINGS: `storage.set(KEY, JSON.stringify(x), false)`.
- Bilder: painted/ 576 px, Figurenhöhe 535 px, ~3,5 % Luft unten,
  Kleinfassungen 192 px in painted/klein/ IMMER mitziehen. Sockelfuß
  (unterste 5 Zeilen, Alpha > 60) sitzt exakt in der Bildmitte — Ausrichtung
  passiert IN den Bildern, nie per CSS-Transform (v1.0.62-Proben erzwingen
  das). Freistellen über `tools/freistellen.py` (Greenscreen #00FF66;
  Magenta nur bei grünlastigen Motiven wie Meer/Boot; GPT-Bilder kommen oft
  mit ECHTER Transparenz — Alpha ≥ 150 härten, nie über RGB flatten).
- `piece.tier` steuert Rangbilder (gambit-t2…t6, pawn-t2/t3) und wird von
  makePiece durchgereicht — bei neuen Figurenfeldern dort ergänzen.
- Ausgemusterte Assets nach `archiv/ausgemustert/vX.Y.Z/`, Bild-Rohlinge
  nach `archiv/bilder/…` (die Schaukammer zeigt Repo-Bilder automatisch,
  ungenutzte mit Abzeichen).

## Design-Prinzipien

- Deutsche Begriffe im Spiel (Kapitel, Riss, Halle, Hofstaat, Meister …).
- GOLD gehört allein dem Helden (auch der Sockelstreifen); eigene Bauern
  GRÜN, Gegnerseite RISS-VIOLETT (lila Sockel-Glut, Stil "getoent" ist der
  Standard; die Stil-Auswahl sieht nur der Admin).
- Stil: "geschnitzt, vereinfacht" — mattes bemaltes Holz, flache Facetten,
  kein Glanz, kein Metall, keine 3D-Render-Glätte.
- Ruhe im Licht: eigene Figuren tragen Originalfarben ohne Filter; keine
  Auswahl-Lichtspektakel.
- Alles Optionale abschaltbar (Klang, Online).

## Offene Baustellen (Stand v1.86.0)

Die vollständige, gepflegte Liste steht in **`design/STAND-2026-09-26.md`**
(technische Punkte als T1–T11) und **`design/PLAYSTORE-BACKLOG.md`** (alles zur
Store-Einreichung). Hier nur der Überblick:

- **Spiel:** Brett-Hintergrund je Liga · „Die Karte erzählt die Geschichte" ·
  Name beim Anlegen verlangen · Ladeschirm (Komet/Funken näher an die Kontur) ·
  Installationsknopf aus dem Profilfuß.
- **Technik:** Deploy wiegt 743 MB, davon 692 MB Archiv für die Schaukammer
  (Schalter `OHNE_ARCHIV=1` liegt bereit, Standard unverändert) · `.git` 1 GB ·
  Layout-Erwartung „Brett zentriert" zu klären.
- **Store:** siehe `design/PLAYSTORE-BACKLOG.md`.

**Erledigt und aus dieser Liste gestrichen** (die alte Fassung stand auf
v1.0.62 und führte längst Gebautes als offen): Sperren kaufen/setzen
(`core/rules/sperren.js`, eigene Suite) · Fallen (Spitzgrube, Bärenfalle) ·
Schaukammer-Platzhalter (vorschauen vollzählig) · Animationen
(`app/ui/anim.js` + `test_anim.mjs`) · Onboarding-Treppe (auf Tooltips
umgestellt) · HP-Remis (120 Halbzüge in `core/domain/constants.js`) ·
erste Aura.
