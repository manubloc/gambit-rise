# Umbau-Plan v0.3 (vom Nutzer beauftragt, Umsetzung im nächsten Arbeitsblock)

## A) Map-Immersion (zuerst, danach Deploy) — ✅ UMGESETZT (v0.3.0)
Umsetzung: Shell lockt in Kampagnen-Ansicht auf 100dvh (App.jsx `immersive`),
Karte = Cover-Fit-Viewport ohne Seiten-Scroll; Zurück-Pille/Liga-Abzeichen/Zoom
schweben oben; Medaillons 46→32 px, Wanderer 34×36→48×50; Node-Detail als
Pergament-Panel in Viewport-Koordinaten am Node verankert (gleitet mit Kamera/
Zoom, ✕ zum Einklappen); Meer-Sperre als zentriertes Overlay. 228 Tests grün.
Referenzbild lag bei Umsetzung nicht vor — Feintuning (Offsets/Look) nach
Sichtung gern nachziehen.
1. Kampagne füllt den Screen: kein Seiten-Scroll mehr um die Karte herum —
   Karte = fester Viewport (100dvh minus Kopfleiste), UI-Elemente schweben darüber.
2. Stations-Medaillons ~30% kleiner; Gambit-Wanderfigur ~40% größer
   (er ist der Held, nicht die Felder).
3. Level-/Node-Detail NICHT als Karte unterhalb, sondern eingebettetes Panel
   IN der Map (Pergament-Overlay nahe dem Node, Ankunft = Teil der Welt).
4. Nutzer liefert Referenzbild — vor Umsetzung ansehen.

## B) Gefolge → 3 Reiter — ✅ UMGESETZT (v0.4.0)
Aufstellung (Brett+Heldenposition) · Ausrüstung (Shop) · Charaktere (Level+Fähigkeiten).
Kein Endlos-Scroll mehr.

## C) Währungs-SVGs + zentrale Ressourcen-Leiste — ✅ UMGESETZT (v0.5.0)

Gezeichneter Skillpunkt-Stern + geprägte Goldmünze (icons.jsx) ersetzen die Emojis in Schatzkammer, Hofstaat-Guthaben, Banner, Claim-Buttons und Karten-Medaillons. Guthaben sichtbar in Hofstaat + Schatzkammer-Kopf.
Eigene gezeichnete Icons (assets/icons, Muster wie Items): gold (Münze mit ♟-Prägung),
skillpunkt (Stern/Siegel), xp (aufsteigender Funke). Überall wo gekauft wird:
fixe Leiste oben mit aktuellen Beständen; jeder Preis mit Icon.

## D) Schwierigkeitsgrad beim ersten Start
Wahl Leicht/Mittel/Schwer im Willkommens-Flow, jederzeit im Profil änderbar.
Elo-Anzeige als ehrliche RANGE (kalibriert über klassische Partien):
Leicht ≈ 600–900 · Mittel ≈ 1000–1300 · Schwer ≈ 1400–1700.
Technik: KI-Stufen (Suchtiefe/Fehlerrate) an diese Bänder koppeln; Offline-
Performance-Rating aus Ergebnissen gegen bekannte KI-Stärke ableitbar.

## E) Konten & Online (eigener Block danach)
- Identität = E-MAIL (unique, daran hängt alles). Login: Google OAuth + E-Mail
  (Magic Link). Empfehlung: Supabase Auth (EU-Region, AVV, kostenlos) statt
  Eigenbau — kompatibel mit Play-Store-Login später.
- Nickname/Gamertag = öffentlich, unique, NACHTRÄGLICH änderbar, per Würfel
  generierbar aus Schach-Wortlisten (z. B. "EiserneDame", "NebelLaeufer42");
  Kollisionsprüfung serverseitig; bei E-Mail-Registrierung automatisch zugewiesen.
- Freundescode bleibt zusätzlich; Suche über Nickname.
- Bestehende id/secret-Gastprofile: "Konto verknüpfen"-Migration.
- Datenschutz: weiterhin KEINE Cookies nötig (Token in localStorage) → kein
  Cookie-Banner; privacy.html um Auth-Abschnitt (Supabase als Auftrags-
  verarbeiter, Art. 28) erweitern, Online-Consent-Text anpassen.

## F) Nutzerbatch v0.4 — ✅ UMGESETZT (v0.4.0)
- Brett: Ganzzahl-Kacheln (keine Verzerrung), Klassik-Farben überall, Mini-Koordinaten, Desktop volle Höhe
- Spiel-Immersion: kein Scrollen, Brett fest, ‹ Zurück + ⚑ Aufgeben als schwebende Pillen
- Schnellspiel-Setup vorgelagert (Karte/Modus/Schwierigkeit vor Start)
- Zeitdruck ab Liga 5 (pure Bosse: Gesamtzeit · Elite-Bosse bump≥2: Zug-Limit) — stageTimer() in meta
- Spiel-Intro beim ersten Start (Pergament-Karte)

## G) UX-Review-Batch + Gold-Ökonomie — ✅ UMGESETZT (v0.5.0)

Hofstaat/Schatzkammer-Renames, pompöse Schatzkammer (Goldrahmen, Glanz-Sweep, Gradient-Serifen), Gold pro Sieg sichtbar im Banner (Etappen-Beutel, Endboss-Aufschlag, Replays halb, Schnellspiel 4/7/11), Zollwege Nebelfähre + Zollbrücke (Zoll pro Liga, Schatz > Zoll), Claims 80 % der Stufenpunkte, Aufgeben-Confirm, Intro-CTA → Kampagne, Online „Bald verfügbar", Aufstellungs-Locks, Hub-Stationszeile + Balken, Lock-Tap-Hinweis, Level-Leiste, zentrierte Match-Chips. Ökonomie-Invariante als Test (Liga 1: 1015 vs. 845).

## H) Map-Immersion II + Hofstaat-Feinschliff — ✅ UMGESETZT (v0.6.0)

Ort-Silhouetten (SiteGlyph ×10) hinter den Medaillons, Wanderer tritt ein (tiefer + Schatten), Kampagne full-viewport (Header/Sidebar/Dock aus), heraldische Hub-Embleme, Hofstaat: kein Gold-Rahmen, Flavor für alle 26 Figuren, Vorschau der nächsten 2 Fähigkeiten, hellere Fließtexte, größenadaptive Währungs-Icons.

## I) Feinschliff-Batch v0.7 — ✅ UMGESETZT (v0.7.0)

Aufstellung: Brett → Slots → Kartenstreifen außerhalb (einzeilig scrollbar, ohne Brett-Icons; auch QuickSetup). Währung v3 (Ordensstern + Kronenmünze), feine Serifen-Zahlen, Münze auf Kauf-Buttons. Karte: Plattform-Sockel statt Kreise, Wanderer tiefer, Lila entfernt, dunkler Nebel bei fx + 3,4·STEP. Hub-Kacheln mit gedimmtem Shine-Sweep (global ggShine/ggPulse in theme.js).

## J) Liga I Bitmap-Welt — ✅ UMGESETZT (v0.8.0)

Frühlings-Artwork (assets/liga1.jpg, 1600px, inline gebundelt via assetsInlineLimit) als SVG-<image>; L1_POS-Tabelle in mapL1.js (Lichtungs-Zentroiden, Hungarian + Kuration); th.bitmap steuert Szenerie-Skip/Koordinaten-Override/HM=748. Pipeline für weitere Ligen: Lichtungen detektieren (V>0.76, S<0.34), Matching, POS-Tabelle.

## K) Liga-I-Vollbesiedlung + Kamera/Sockel — ✅ UMGESETZT (v0.9.0)

w1 Wildererlager (n02→w1, Sackgasse, col4/row1), w2 Kristallgarten (d2→w2→n21, warlock, col1/row12.5); L1_POS +2; SiteGlyph crystal; Dais fillOpacity .42-.46; Desktop-Zoomstufen 0.9/1.2/1.55 mit zentrierter Letterbox.

## L) Jahreszeiten-Bitmaps II–IV + Glow-Stationen — ✅ UMGESETZT (v0.10.0)

mapBitmaps.js (Registry url/h/pos ×4), Themes sommer/herbst/winter mit bitmap-Key; Detektion je Saison kalibriert (Winter V>0.865/S<0.10), Snap-Backbone-Matching; bei bm: Glow-Pad statt Dais+SiteGlyph, Icon soft, WandererArt (painterly) auf allen Kampagnenkarten; assetsInlineLimit 400KB.

## M) Karten-Reduktion + Glas-Overlays — ✅ UMGESETZT (v0.11.0)

Trails + order-Nummern nur noch prozedural; bm: keine Icons/☠, ✓ zart mittig, Gate-Badge soft; WandererArt v2 (fließende Silhouette, strokeOpacity .28); Banner/Ribbons/Panel mit backdrop-blur (7-11px) + rgba-Pergament; HUD #0d1017b8/blur 9.

## N) Federschrift + Wanderer v3 + Glas II — ✅ UMGESETZT (v0.12.0)

@fontsource/im-fell-english (400 + italic, via main.jsx, als data-URL gebündelt), .gg-quill in theme.js; Ortslabels 12.5px quill mit weichem Papier-Halo, Ribbons ohne ElementIcon, Kapitel-Banner quill; Panel blur 16/radius 18/Schatten 0 0 30, HUD blur 13; WandererArt v3 (Kragen-Silhouette, Aura 24.5/21, Shade r .8).

## O) Gerahmte Welt — ✅ UMGESETZT (v0.13.0)

Rounded Frame (frameX/Y/W/H, Kamera in Frame-Space, radius min(22, frameW/12), Letterbox T.bg zentriert); HUD top/left/right frame+12; Panel fix links unten (left frameX+14, bottom frameY+14, maxHeight frameH−28); Panel-Titel gg-quill 20 + Pfad-Tag an a1/b1/c1/d1/e1; Ribbons-Block entfernt; START-Label entfernt; n01 → „Alte Wacht/Old Watch"; Label-Glow (radial paper c0→73→transparent, blur 4); camp-Button Gold-Glas + ggShine 4.4s; Wanderer translateY −66%.

## P) Voll-Besiedlung aller Welten + HUD-Ruhe — ✅ UMGESETZT (v0.14.0)

w3 Stiller Hain (n02→w3 Sackgasse, col0/row1.2); Vollzuweisungs-Matching (Hungarian Kreise→Knoten + 2-opt mit Kantenlängen-Term), Sommer rechts + Extra-Kreise handkuratiert, Frühling alte Kuration + w3; 4×35 Positionen in mapBitmaps.js; HUD ohne Liga-Badge (nur Zurück + X/Y-Zähler rechts), Zoomstufen entfernt (z = fit×(wide?0.9:1)); Label lineHeight 0.92; 238 Tests.

## Q) Ligen V–X gemalt + Liga-Orte — ✅ UMGESETZT (v0.15.0)

Adaptive Detektion (V − uniform_filter(171) > .045, fill_holes, Formfilter), knotenseitiges Hungarian auf Kandidaten + 2-opt (Kantenlänge+Anker); 6 Assets (356–473 KB, emittiert); 9 league-wilds (s1,s2,u1–u3,o1–o3,r1 mit league-Feld, Sackgassen, 3 piece-Bosse); bm: Labels top 24 (immer unten), Wanderer translate(-50%,-58%); Tests 50 Sites/15 league-bound/40 Boss-Stages/33 piece.

## R) Login + Savegames + Admin — ✅ UMGESETZT (v0.16.0)

accounts.js (lokal, SHA-256+Salt, Admin-Seed admin/gambit-admin, Session), saves.js (Slots-Index + Profile je Slot, playtimeSec, pct, withProgressPct 0–100 in leagueOrder, Legacy-Migration), cloudAuth.js (Supabase Google/Email, aktiv bei VITE_SUPABASE_URL/KEY, ADMIN_EMAILS in config), LoginScreen/SavesScreen (eigene DE/EN-Strings), App-Gate splash→login→saves→hub, Playtime-Ticker 5s/Flush 30s, storage memShim für Node/SSR, smoke-Loader-Fix, test_saves.mjs (27), OG-Meta + og.jpg. Plan E damit teilweise erledigt (Auth-Seite).

## S) Logo, Bestenlisten, Admin-Werkzeuge — ✅ UMGESETZT (v0.17.0)

logo.jpg (640px, 40KB) im LoginScreen mit Radial-Halo; WandererArt v4 nach Logo (Doppelkragen, Rauten-Emblem, Stufen-Sockel); records.js (moves-Bestwerte, runStartAt/fastestRunMs bei n22) + RECORD_STAGE vor CAMPAIGN_CLEAR; leaderboard.js (lb:<board> shared, mergeBoard pure, Top 50, uid-Upsert) + LeaderboardSection als 2. Reiter im Erfolge-Tab (trophyTab in App); Export/Import + RestorePoints admin-only (account-Prop); PIN→Passphrase (4–64 Zeichen, Lock+Profil+i18n); cloudAuth signInWithProvider (google/apple/discord); slot-State wird nach writeSave aktualisiert; smoke +1; Tests 37.

## T) Multiplayer auf Durable Objects — ✅ UMGESETZT (v0.18.0)

worker/ (wrangler.jsonc: gg-hall, new_sqlite_classes [Hall]); logic.mjs = HallCore (store-injiziert: players/kv/vault; Live-State queue/matches/challenges/finished als kv-Blobs → hibernation-fest; lazy Rematch-Expiry statt Timer; konstante-Zeit-Admin-Compare + IP-Lockout); index.mjs = DO-Adapter (acceptWebSocket Hibernation, serializeAttachment {id,ip}, Re-Seat im Konstruktor, wsFor-Scan, /health); test_worker.mjs 29 Tests am memoryStore; DEPLOY-WORKER.md; SERVER_URL-Hinweis. Plan E damit komplett (Auth via Supabase-Hooks + Server via DO).
