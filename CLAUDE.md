# CLAUDE.md — Gambit Rise

Fantasy-Schach-RPG als PWA. Live: https://gambitrise.com (Cloudflare Pages,
deployt AUTOMATISCH bei jedem Push auf main, ~2–5 min). Der Worker "gg-hall"
(Online-Duelle) deployt ebenfalls automatisch. **Jeder Push auf main geht
direkt zu echten Nutzern.**

Stack: React 18, Vite 5, pure ESM, Node 22.
Die Seite: **/** ist das Schaufenster (Landingpage), **/spielen/** die App.
Der Passwort-Riegel davor (v1.42.0–v1.87.0, ein `prompt()`) ist seit v1.88.0
fort — er sperrte den Besitzer auf dem Handy aus (prompt() liefert in
installierten Seiten stumm null). Die Anmeldung der App ist die Tür.
Play Store: die App ist NICHT veröffentlicht; Paket **com.gambitrise.app**
(neu, die alte Kennung war nie in Gebrauch). Ein neues Paket muss gebaut
werden — Host und Startpfad haben sich geändert.
GitHub-Repo: **manubloc/gambit-rise** (Umbenennung erledigt — `git remote -v`
zeigt die neue Adresse; die alte `manubloc/grand-gambit` leitet bei GitHub
weiter). Cloudflare-Pages-Projekt heißt weiterhin **grand-gambit** (die Domain
gambitrise.com zeigt darauf).

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

- Lokal nötig: Node 22 und **python3 mit Pillow** (`python3 -m pip install
  pillow`) — `npm test` bricht sonst in `test_zauber.mjs` ab (die
  Drachensockel-Farbe wird im Bild gemessen). Die Browser-Proben (drive3,
  pruefe-navigation, pruefe-textfluss, test_layout) lesen den Chromium-Pfad aus
  `PW_CHROMIUM`; ohne die Variable gilt der Pfad des Cloud-Containers. Lokal:
  `npx playwright install chromium` und `PW_CHROMIUM=<Pfad zur chrome-Datei>`.
- `npm test` — volle Batterie. MUSS **31 Suiten / 2640 Prüfungen** melden
  (Stand v1.90.20; der Runner stoppt nach der ersten roten Suite, also
  Suitenzahl prüfen, nicht nur Assertions! **Zählweise seit v1.90.18
  (Audit A74): JEDE Suite der Kette meldet eine RESULT-Zeile** — alle Zeilen
  `RESULT…: N passed` summieren; test_balance meldet zwei, darum stehen im
  Log **32 RESULT-Zeilen für 31 Suiten**. Vorher meldeten pruefe-buttons,
  pruefe-landing und pruefe-bezeichner keine, und wer RESULT-Zeilen zählte,
  zählte an ihnen vorbei. test_net.mjs ist seit v1.90.18 ausgemustert (es
  fuhr den alten Node-Server, nicht die Halle). Die letzte Suite ist
  `tools/pruefe-animation.mjs` mit 132 Prüfungen, ~130 s.) **`tools/pruefe-bezeichner.mjs`**
  läuft direkt hinter `npm run ui` (dort entsteht das Bundle `.uitest.mjs`,
  das die Probe liest) und bricht die Kette, sobald im Bundle ein freier
  Bezeichner auftaucht.
  Das ist die Klasse der Abstürze A3/A4: gültiges JavaScript, das erst beim
  Rendern als ReferenceError hochgeht.
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
  Konsolenfehler als Boot-Versagen). Lokal grün heißt CI grün. Seit v1.90.18
  wartet es, bis React den Ladeschirm `#gg-boot` ERSETZT hat, und nennt die
  Zeit — vorher bestand es auch, wenn React nie aufbaute (der Ladeschirm allein
  hat 4010 Zeichen, geprüft wurde „≥ 1000“).
- `timeout 250 node drive3.mjs` — Kampagnen-Fahrprobe ("== KEINE FEHLER ==").
  Seit v1.90.19 ~10 s statt ~21 s: sie wartet auf Zustände statt auf Uhrzeiten
  (**`tools/warten.mjs`**: `bis()` auf eine DOM-Bedingung, `ruhe()` bis das DOM
  stillsteht, die alte Schlafzeit als Deckel — dieselben Helfer nutzt die
  Navigationsprobe). Und sie prüft, dass der Gegner WIRKLICH antwortet.
- **Die Inhaltsrichtlinie (CSP, v1.90.19, Audit A57):** `tools/csp.mjs` rechnet
  sie an EINER Stelle (Inline-Skripte per sha256 aus der gebauten Datei).
  `tools/seite-bauen.mjs` schreibt sie live als **Report-Only** in
  `dist/_headers`; drive3, die Navigations- und die Duell-Probe schicken sie
  lokal **SCHARF** mit — jede Verletzung ist dort ein Konsolenfehler. `CSP=0`
  schaltet sie in den Proben ab (zum Vergleich). Wer ein neues Fremd-Ziel
  einbaut (Skript, Verbindung, Bild von einer anderen Adresse), trägt es in
  csp.mjs ein, sonst werden die Proben rot. Die Duell-Probe kann die Halle
  NICHT unter der Richtlinie prüfen (routeWebSocket ersetzt WebSocket in der
  Seite) — das prüft die Live-Abnahme mit `new WebSocket(...)` und der Konsole.
- `npm run pruefe:fluss` — Playwright-Textfluss/Popup-Messung.
- `node tools/pruefe-navigation.mjs` — die NAVIGATIONSPROBE (v1.86.0, ~90 s): fährt in
  mehreren Runden **das ganze Haus**, meldet jeden i18n-Schlüssel, der statt
  eines Textes auf dem Schirm steht (v1.90.19), und wertet jeden Konsolenfehler als
  Absturz — Karte mit allen Stationsfenstern, Gefecht (betreten *und* mitten im
  Spiel verlassen, inklusive der Rückfrage „Kampf verlassen?"), alle vier
  Reiter, Schnelles Spiel, Akademie, Online-Duell, die Unterreiter im
  Figuren-Schirm und die Zurück-Geste. `RUNDEN=5` für längere Läufe.
  **Seit v1.90.11 (Audit A15) fährt sie auch den RÜCKBLICK** — vorher tat sie
  es nicht, und dieser Text behauptete trotzdem „das ganze Haus". Der Grund
  war banal: jede Fahrt beginnt mit einem frischen Konto auf Liga 1, und den
  ‹-Knopf gibt es dort gar nicht (`viewLeague > 1`). Der Absturz A3
  (`paintedById` ohne Import) stand deshalb wochenlang im Rückblickfenster,
  während die Kette grün war. Jetzt hebt die Probe den Stand vorher auf
  Liga 3 und fährt: zurückblättern, ›, Rückblickfenster öffnen,
  Freundschaftskampf betreten und verlassen, Weltkarte, „Hierhin reisen".
  Braucht `dist/` mit der App, also **nach `npm run build:app`**
  (oder `npx vite build`).
  **Der Kopf der Datei ist Pflichtlektüre, bevor man sie ändert:** fünf
  Fassungen lang hat sie Dinge als Absturz gemeldet, die keiner waren
  (`about:blank` nach der Zurück-Geste, die ausgeblendete Reiterleiste auf der
  Karte, gesperrte Stationen, „‹ Zurück" mit Winkel, „Fortsetzen" statt
  „Herausforderung starten"). Alle fünf sind dort mit Messung festgehalten.
- `node tools/pruefe-sperrsitz.mjs` — **wo sitzen Mauer, Zaun und Bollwerk
  wirklich?** Fotografiert jede Sperre und sechs Figuren einzeln in ein Feld
  und misst am ALPHAKANAL, wo Kopf, Fuß und Mitte liegen. Prüft zwei Zusagen
  des Besitzers (29.9.): flache Sperren sitzen vertikal mittig, und keine
  Sperre endet mit dem Fuß tiefer als die tiefststehende Figur. Braucht
  python3 mit Pillow (wie test_zauber) — kein zweiter PNG-Leser für dieselbe
  Arbeit. **Warum es sie gibt:** in test_anim stand drei Fassungen lang „die
  Sperren sitzen vertikal mittig im Feld“, geprüft an zwei Zeichenketten im
  Quelltext. Beide standen da, die Probe war grün — und die Mauer saß 23 %
  zu tief. Drei Messfallen sind im Kopf der Datei festgehalten (Schlagschatten
  zählt nicht zur Silhouette, Helligkeit ist nicht Form, und ohne Abstand
  fotografiert man den Nachbarn mit).
- `node tools/pruefe-animation.mjs [ordner]` — **DIE ANIMATIONEN AM ECHTEN
  BRETT** (v1.90.15, letzte Suite der Batterie, ~130 s). Baut
  `tools/anim-pruefstand.jsx` (die echte BoardView, echte Züge aus
  `applyMove`) und schreibt bei zehn Zügen in drei Lagen (Schnelles Spiel
  mit Fugen, Kampagne fugenlos, gedreht als Schwarz) JEDES Bild mit: welche
  Figur wo, wie deckend. Regeln R1–R8 (Opfer bleibt sichtbar, niemand
  doppelt, kein Blinken, kein Ruck bei der Übergabe, Turm fliegt mit, Drache
  als Block …). Legt Bildstreifen je Zug ab (Screencast mit Zeitstempel).
  **Warum:** die Animationskammer zeigt NACHGEBAUTE Bühnen, test_anim liest
  Quelltext — gegen v1.90.14 waren 67 von 132 Prüfungen rot, u. a. flog beim
  HP-Treffer das OPFER statt des Angreifers. Wer BoardView, PieceGlyph oder
  die Keyframes in theme.js anfasst: diese Probe VORHER und NACHHER.
- `node tools/pruefe-landing.mjs` — die Startseite (v1.90.15, zweite Stelle
  der Batterie, **ohne RESULT-Zeile** wie pruefe-bezeichner): angesprochene
  Bilder ↔ vorhandene (keine Waisen), Galerie-Sockel in der Bildmitte
  (python3 + Pillow über `tools/landing_bilder.py galerie-pruefen`), vordere
  Figurenreihe in 13 Fenstergrößen nie breiter als das Fenster.
- **Aufstellungskammer** `?aufstellung` bzw. `?aufstellung=<Station>` (hinter
  dem Werkzeug-Schloss, v1.90.15): jede der 45 Schlüsselstationen, wie sie
  beim ersten Zug steht, mit der BOSSFORMATION im Kopf (v1.90.18) — dasselbe buildStageMatch/createGame wie das
  Gefecht. `node tools/foto-aufstellungen.mjs <ordner>` fotografiert alle
  (braucht `npx vite build`). Die Befunde vom 30.9. (Drache in der Ecke,
  31/32 Bosse auf d8, vier Bestien nie im Spiel, Hetzer auf 101/172
  Besetzungen) stehen im Changelog v1.90.15.
- `node tools/pruefe-figurenmass.mjs` — **wie groß und wo steht jede Figur
  auf dem ECHTEN Brett?** (v1.90.16) Fährt die Aufstellungskammer
  (`?aufstellung=<Station>`) für alle 45 Schlüsselstationen und misst an
  jeder Figur im lebenden DOM Band (Breite, Mitte, Unterkante) und Sockelfuß
  (Alphakanal). Sechs Zusagen: kein Band breiter als das des breitesten
  Offiziers +3 % (der große Drache höchstens doppelt), Band mittig ±2 px,
  Unterkante auf der Offizierslinie — seit v1.90.18 AUCH Bauern und Gambit
  (Z6, ±1,5 px; vorher lagen sie 4,4 px höher, BoardView gibt dem Bauern
  darum einen eigenen Hub `BAUERN_SENKUNG`), Fuß auf
  dem Band ≤ 2 px — und der große Drache steht mit der MASSE seiner
  Silhouette auf der Mitte seiner vier Felder ±1,5 px (Besitzer 30.9.: „ein
  bisschen weiter nach oben … mehr in der Mitte von den vier Feldern"). **Warum es sie gibt:** der Besitzer sah am 30.9. auf vier
  Fotos zu große Monster, eine Dame neben ihrem Band und einen zu großen
  Drachen — keine Probe hatte je eine Figur auf dem echten Brett vermessen.
  Gegen v1.90.15 gefahren: 16 rot, danach 0. `--nur=L07s41,…` für einzelne
  Stationen, `WURZEL=/tmp/rr/dist` gegen einen anderen Bau. Braucht `dist/`
  mit der App (**nach `build:app`**).
- `node tools/pruefe-duell.mjs` — **DAS ONLINE-DUELL VON BEIDEN SEITEN**
  (v1.90.18, Audit A73, ~10 s). Zwei Browser-Kontexte der gebauten App legen
  lokale Konten an, verbinden (MIT Zustimmungsfenster), spielen im Modus
  Klassisch aus der Zufalls-Warteschlange e2-e4/e7-e5 per Klick, geben auf,
  sehen Sieg/Niederlage und Wertung und verlangen Revanche. Die Halle ist die
  ECHTE Logik (`worker/src/logic.mjs`, HallCore mit memoryStore) im
  Probenprozess; Playwrights `routeWebSocket` leitet
  wss://duell.gambitrise.com/ws dorthin um wie die Durable-Object-Huelle.
  **Warum:** ein umbenanntes Protokollfeld blieb in jeder Suite gruen und
  braeche live das Duell (Worker und Seite deployen mit jedem Push).
  Gleich beim ersten Lauf gefunden: „Verbinden“ uebersprang die Zustimmung
  (das Klick-Ereignis landete als `force`), und die Hub-Kachel reichte ihr
  Klick-Ereignis als Partiekennung weiter — beim welcome warf JSON.stringify,
  Rangliste und Tresor wurden nie angefragt. Braucht `dist/` mit der App
  (**nach `build:app`**), `WURZEL=` fuer einen anderen Bau, `ZEIGEN=1`
  schreibt jede Hallen-Nachricht mit.
- `node tools/formationen-messen.mjs 20 --duell --alle` — **macht eine
  Bossformation eine Station leichter?** (v1.90.18) Die Station spielt gegen
  SICH SELBST, einmal in der alten Aufstellung, einmal in der Szene (KI gegen
  KI, Farben abwechselnd); 50 % heißt „gleich stark“. Stand 1.10.: mauer 49,3,
  Leibwache 49,8, vorgeschoben 51,5, leicht 54,7 %. Ohne `--duell` spielt ein
  Spielerheer gegen die Station — das gewinnt die Station fast immer, daran
  lässt sich nichts ablesen. Nicht in der Kette (~80 s); bei jeder Änderung an
  `formiereBoss` (meta/campaign.js) laufen lassen.
- `node test_layout.mjs` — echte Geometrie im Browser. Läuft wieder (v1.86.0:
  die Klang-Loader fehlten), hängt aber NICHT in der Kette: vier Proben
  erwarten ein vertikal zentriertes Brett, was seit dem Talentband nicht mehr
  gilt. Der Kopf der Datei hat die Messwerte — die Erwartung ist eine offene
  Designfrage.

Lange Läufe im Muster
`(timeout 280 cmd > /tmp/x.log 2>&1; echo exit=$? >> /tmp/x.log) & sleep 285; tail /tmp/x.log`
starten, sonst reißen Werkzeug-Zeitlimits den Lauf ab.

## EISERNE KETTE — Pflicht vor JEDEM Push, keine Ausnahmen

1. `npm test` (31 Suiten, Assertionszahl notieren)
2. `npm run build`, dann **`timeout 250 node drive3.mjs` im Auslieferungsstand**
   (seit v1.90.19 — nur hier prüft es Startseite, abmeldenden Dienstarbeiter und
   den CSP-Kopf in `dist/_headers` samt passender Hashes), dann
   **`npm run build:app`**, dann `npm run build:single`

   **Warum `build:app` NACH `build` gehört** (v1.86.0, teuer gelernt):
   `npm run build` schließt `tools/seite-bauen.mjs` ein. Danach liegt unter
   `dist/index.html` die **Landingpage**, die App steckt in `dist/spielen/`.
   Wer dann `drive3.mjs` laufen lässt, bekommt vier Fehler gemeldet, die es
   nicht gibt („Anmeldung nicht möglich | kein Brett | kein Zug | kein
   Talentband"). `build:app` stellt die App an die Wurzel zurück, und die
   Proben greifen wieder. drive3 erkennt seit v1.86.0 BEIDE Stände und prüft im
   Auslieferungsstand zusätzlich Landingpage, den abmeldenden Dienstarbeiter
   und dass KEIN Riegel mehr fragt — der Umzug ist damit unter Aufsicht.
3. `node test_boot.mjs` (3/3) und `node scripts/verify-boot.mjs` (grün)
4. `timeout 250 node drive3.mjs` (keine Fehler),
   `node tools/pruefe-figurenmass.mjs` (0 Befunde) und
   `node tools/pruefe-duell.mjs` (RESULT ohne failed); bei Arbeit an Karte,
   Kampagne oder Navigation zusätzlich `node tools/pruefe-navigation.mjs`
5. REINRAUM: `git clone . /tmp/rr && cp -r node_modules /tmp/rr/` und dort
   Schritte 1–4 wiederholen
6. `git fetch` + Punktprüfung: liegt auf origin ein fremder Commit, Inhalt
   verifizieren (`git diff --stat HEAD FETCH_HEAD`). Es können PARALLELE
   Sessions arbeiten. NIEMALS force-pushen.
7. Push, dann `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/spielen/version.json`
   pollen. **ACHTUNG, gemessen 29.9.: der Egress-Proxy des Containers weist
   gambitrise.com ab** (`curl: (56) CONNECT tunnel failed, response 403`) —
   curl liefert dann eine LEERE Antwort, nicht etwa einen Fehler, und man
   hält den Deploy für kaputt. Das ist eine Netzsperre, kein Deploy-Problem;
   es hilft kein zweiter Befehl (wget, python, Spiegel — alles läuft durch
   denselben Proxy). Ausweg: die Abnahme über **Claude in Chrome** fahren
   (`navigate` auf die Adresse, dann per `javascript_tool`
   `await fetch("/spielen/version.json?x="+Math.random(), {cache:"no-store"}).then(r=>r.text())`;
   dasselbe Fenster zählt auch gleich die Marker im Live-Bundle). Seit v1.90.19
   gehört dazu die CSP-Messung: **NICHT über die Konsole** — gemessen am
   1.10.: `read_console_messages` zeigt die „[Report Only]“-Meldungen des
   Browsers gar nicht (eine absichtliche Verletzung blieb dort unsichtbar).
   Der Weg, der trägt: nach dem Laden der Seite per `javascript_tool`
   `new ReportingObserver(cb, { types: ["csp-violation"], buffered: true })`
   — `buffered` liefert auch die Verstöße, die VOR dem Beobachter beim Laden
   entstanden. Vorher `new WebSocket("wss://duell.gambitrise.com/ws")` öffnen
   und `fetch("https://duell.gambitrise.com/health", {mode: "no-cors"})`
   (ohne no-cors scheitert der Abruf an CORS, `/health` sendet keinen
   CORS-Kopf — die Fassung der Halle liest man, indem man das Fenster direkt
   auf `https://duell.gambitrise.com/health` schickt). Die Köpfe selbst:
   `(await fetch("/spielen/")).headers.get("content-security-policy-report-only")`.
   Abnahme v1.90.19: App und Startseite **0 Verstöße**, Halle per WebSocket
   offen. WebFetch
   braucht eine Freigabe des Besitzers und steht unbeaufsichtigt nicht zur
   Verfügung. Zur Adresse selbst (**mit `/spielen/`** — `version.json` zieht seit v1.42.0 mit der
   App um, `tools/seite-bauen.mjs` Schritt 1; die Wurzel-Adresse
   `/version.json` liefert die Landingpage als HTML, gemessen 27.9.) und
   Marker-Strings im Live-Bundle zählen:
   `grep -o "marker" bundle.js | wc -l` (`grep -c` zählt Zeilen — minifiziert
   ist alles EINE Zeile). Echtes Bundle via `ls -S dist/assets/index-*.js`
   (das erste Ergebnis ohne -S ist oft der 5-KB-Stub). Cloudflare-Hashes
   weichen von lokalen ab — NIE per Hash vergleichen, nur per Marker.

**DIE CI SPERRT DEN DEPLOY NICHT** (Audit A27). Cloudflare Pages baut bei
JEDEM Push auf main und fragt das Ergebnis von `.github/workflows/ci.yml`
nicht ab — ein roter Lauf hält nichts auf. Seit v1.90.11 fährt die CI
immerhin die ganze Kette (vorher fehlten `test_boot.mjs`, `build:app` und
beide Fahrproben), aber sie ist ein Netz UNTER der Handarbeit, kein Tor
davor. Die eiserne Kette bleibt Pflicht der jeweiligen Sitzung.

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
- **Kapitelmeister ≠ Großmeister (seit v1.90.20).** `LEAGUE_BOSSES` ist die
  KLASSE der zwölf Großmeister (Damenplatz, Goldrahmen, nie Gast, nicht
  bestechlich – außer dem Richter). Wem ein gewonnenes Kapitel gehört, steht in
  `KAPITEL_TROPHAEE` (Index = Kapitel − 1); Kapitel I hält der **Drache** (eine
  Figur, `boss: {piece: "dragon", wins: 1}`, kommt mit dem Sieg), dort steht
  `null`. Der Richter (b12) ist Mitte-Boss von Kapitel II. Alte Stände nach
  Kapitel I behalten ihn über den einmaligen Umzug `campaign.meister20`
  (profile.js). Im **klassischen Schach hat der große Drache vier Leben**
  (`DRACHE_LEBEN`, setup.js, über den Schild-Abprall des Schachkerns), sichtbar
  als vier Punkte auf dem Sockel.
- **Bilder rechnen statt malen:** `tools/umfaerben.py` (Farbton drehen, z. B.
  Brandstifter blau, mit Helligkeitsfaktor) und `tools/monster-aufhellen.py`
  (Monsterkörper auf Leuchtdichte 0,24, Sockel/Alpha/Glutaugen bleiben). Beide
  lassen den Alphakanal unberührt – `sockelband.json` gilt danach weiter.
  Danach `python3 scripts/messe_farbe.py` NUR für die geänderten Einträge
  übernehmen (das Skript rundet bei anderen Figuren um eine Stelle anders) und
  die Vorschauen in `public/schau-klein/painted/` nachziehen.
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

## Offene Baustellen (Stand v1.90.20, 1.10.2026)

**Einstieg für jede neue Sitzung: `design/CHAT-EINSTIEG-2026-09-27.md`** (zehn
Minuten, mit dem Startsatz für den Chat), dann **`design/UEBERGABE-2026-09-27.md`** — Stand,
Deploy-Weg (der Push auf `main` IST der Deploy), wo die Geheimnisse liegen
(nur Orte), was offen ist. Darunter: **`design/STAND-2026-09-26.md`**
(technische Punkte T1–T11), **`design/PLAYSTORE-BACKLOG.md`** (Store),
**`design/AUDIT-2026-09-27.md`** (76 Punkte; was gebaut ist, steht in der
Tabelle „STAND DER ABARBEITUNG“ oben — erst dort nachsehen),
**`design/SPIELTEST-2026-09-27.md`**, **`design/FAEHIGKEITEN-2026-09-27.md`**,
**`design/MONSTER-PROMPTS-2026-09-30.md`** (Neuzeichnung der Monster).
Hier nur der Überblick:

- **Beim Besitzer:** die Monster neu
  zeichnen (Prompts; neue Bilder erst messen — Höhe/Sockel-Halbbreite ≥ 3,7 —
  und am Brett zeigen; seit v1.90.20 sind alle Monster per Rechnung heller,
  ein neues Bild sollte mindestens diese Helligkeit tragen) · Play-Abzeichen
  als Datei für die Startseite (A58).
- **Spiel:** „Die Karte erzählt die Geschichte" (Besitzer 27.9.: **später**) ·
  **Ladeschirm-Feinschliff** (subjektiv, braucht Live-Abnahme).
- **Audit offen:** A8-Rest (Befehlsliste in der Halle nachspielen — braucht den
  Kern im Worker und eine Befehlsliste im Live-Duell, Aufwand L) · A9-Rest
  (Bünde im Netz — braucht eine Protokollfassung, sonst entzweien sich alte und
  neue Geräte) · A57-Rest (die CSP steht seit v1.90.19 als Report-Only; scharf
  schalten = in `tools/seite-bauen.mjs` Schritt 5 den Kopf umbenennen, sobald
  die Live-Konsole über einige Tage sauber bleibt) · A22/A26/A27
  (Cloudflare-Dashboard, Besitzer).
- **Technik:** Deploy wiegt 743 MB, davon 692 MB Archiv für die Schaukammer
  (Schalter `OHNE_ARCHIV=1` liegt bereit, Standard unverändert) · `.git` 1 GB.
- **Store:** siehe `design/PLAYSTORE-BACKLOG.md`.

**Erledigt und aus dieser Liste gestrichen** (die alte Fassung stand auf
v1.0.62 und führte längst Gebautes als offen): Sperren kaufen/setzen
(`core/rules/sperren.js`, eigene Suite) · Schaukammer-Platzhalter
(vorschauen vollzählig) · Animationen (`app/ui/anim.js` + `test_anim.mjs`) ·
Onboarding-Treppe (auf Tooltips umgestellt) · HP-Remis (120 Halbzüge in
`core/domain/constants.js`) · erste Aura.

**Die Fallen sind seit v1.90.9 GEBAUT** (Audit A32, Besitzerentscheid vom
29.9.: „Die Fallen können und sollten wir noch bauen"). Vorher gab es nur den
Datentyp und die reine Funktion `loeseFalleAus`, die niemand aufrief — und
`state.fallen` wurde nirgends gefüllt; CLAUDE.md führte sie trotzdem
jahrelang als fertig. Was jetzt steht:
- **Gegenstand:** `baerenfalle` (ab 5 geklärten Stationen, also Kapitel II/III
  — Besitzerwunsch) und `grube` (ab 7, weil sie Schaden macht). Preise stehen
  NUR in `FALLEN_ARTEN`, nicht zweimal.
- **Legen:** dieselbe Setzphase wie die Sperren, dritte und vierte eigene
  Reihe, **eigene Grenze** `MAX_FALLEN = 2` (zwei Mauern und zwei Fallen gehen
  also zusammen). Zurücknehmen wie bei einer Mauer.
- **Auslösen:** in `altern()`, dem gemeinsamen Ausgang JEDES Zuges — sonst
  wäre die Falle beim Drachenschritt, Durchbruch und Blinzeln wirkungslos.
  Nur der **Gegner** löst aus, nur im **HP-Gefecht** (Schaden und Fessel
  brauchen Lebenspunkte). Grube: 2 Schaden, tödlich zählt als Schlag.
  Bärenfalle: `fesselBis` an der Figur, `pieceMoves` bietet dann nichts an.
- **Darstellung:** `FalleGlyph` (liegt flach, unter der Figur); verdeckt sieht
  sie nur, wer sie legte (`falleSichtbar`). **Gemalt gibt es sie noch nicht**
  — die Prompts liegen in `design/BRETT-OBJEKTE.md` (`falle-verdeckt`,
  `falle-ausgeloest`, `baerenfalle-verdeckt`, `baerenfalle-zu`), bis dahin
  zeichnet `FalleVektor`.
