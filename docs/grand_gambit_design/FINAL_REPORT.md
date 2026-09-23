# Gambit — Design System 1.0 · Abschlussbericht
Stand: 29. Juli 2026 · Branch `feature/design-system-v1` · **nicht deployt, `main` unberührt**

## 1 · Ausgangszustand
`main` @ `1aaa021` (v0.41.2) = Produktion (grandgambit.win/version.json gegengeprüft). 761/0/18 Tests grün, Build grün, Working Tree sauber. Vollständige Baseline in BASELINE.md, 25 Vorher-Fotos (2 Viewports + Live).

## 2 · Designstrategie
„Premium Stylized Dark Fantasy Board Game" auf dem BESTAND aufgebaut: die vorhandene Sprache (Schwarz/Violett/Gold, Riss, Gilded, Glanzläufe) wurde nicht ersetzt, sondern semantisch geschärft — **Gold = Handlung, Violett = Auswahl, dunkle Flächen = Bühne, Lesbarkeit maschinell erzwungen.** Zwei Ebenen respektiert: Match maximal funktional (Intensität 0), Meta atmosphärisch. Figuren, Wappen, Karten, Login-Artwork: unantastbar behandelt, kein Asset ersetzt oder überschrieben.

## 3 · Wichtigste visuelle Änderungen (alle gemessen, VISUAL_AUDIT.md)
Auswahl violett statt gold (Schnelles Spiel: 4 Goldflächen → 0) · Hub beginnt oben (Lücke 67→22 px), ein Glanzlauf statt drei · Brett rückt an die Gegnerzeile (totes Band 160→2 px, Brett +10 px), Spielerzeile direkt darunter · Schatzkammer kompakt (Hero 200→175, Platte 90→84, Dauerglühen 14→0, 7 statt 6 Ruhmestaten sichtbar) · Hofstaat-Vorrede 2 Zeilen + „Mehr" · Reward-Rahmen nur bei wartender Belohnung · echte Markenschriften (Cinzel-Wortmarke/-Titel, Cormorant-Erzählstimme).

## 4 · Wichtigste UX-Änderungen
Berührziele ≥44 px (Buttons) bzw. ≥36 px (Segmente/Chips) · lange Optionsnamen brechen um statt abgeschnitten zu werden · „dominant" heißt wieder etwas: ein Sheen-CTA je Bereich · sichtbarer violetter Tastaturfokus · disabled einheitlich (gedimmt, kein Schein) · prefers-reduced-motion respektiert.

## 5 · Technische Änderungen
`theme.js`: semantische Tokens (`sel/selLine/selInk/selGlow`, `warn/info`, `disOpacity`, `touch`, `radiusLg`, `SPACING`, `T.mo`-Motion-Uhr, `display`/`quill`-Schriftrollen) — Architektur (mutierbares T, zwei Livreen) unangetastet, classic behält seine Identität (nur der Lesbarkeitsfix faint 3,51→4,61:1). `primitives.jsx`/`Gilded.jsx` migriert. Fonts selbst subsettet (fonttools), OFL beigelegt, im Precache. IM-Fell-Importe entfernt (Doppel-Last; Paket/Lockfile unberührt). Keine neuen Dependencies. Keine Logik-, Regel-, Netz- oder Speicheränderungen.

## 6–8 · Tokens, Komponenten, Screens
Siehe DESIGN_TOKENS.md, COMPONENTS.md, SCREEN_SPECIFICATIONS.md. Migrierte Screens: **5 direkt** (Hub, Schnelles Spiel, Match, Hofstaat, Schatzkammer) **+ Vererbung** über Segmented/Button/Chip auf Online, Profil, Hofstaat-Reiter, Spielaufbau. Neue interne Seite: Musterkammer (`?galerie`, 10 Abschnitte, Scroll + Schriftladen numerisch belegt).

## 9 · Unveränderte Bereiche (geprüft, begründet)
Login (§19.1 strukturell erfüllt), Kampagnenkarte (Pergament-Ausnahme, Kontrast 9,9:1 in Suite verdrahtet), Figurendetail (erbt Tokens), Dock (§18 bereits konform: violette Aktivfläche, Goldzeichen), Brett-Renderpfad, alle Spiel-/Wirtschafts-/Netzlogik.

## 10–11 · Assets
Erzeugt: **0 Bilder** (kein Bedarf nachgewiesen, §21.3); 3 woff2-Schriften + 2 OFL-Lizenzen (91 KB). Verworfen: Hallen-/Gewölbe-/Menü-Backdrops und Eck-Ornamente — Prompts im IMAGE_GENERATION_MANIFEST.md hinterlegt, falls später gewünscht. Asset-Register: 368 Bestandsassets, alle „behalten".

## 12 · Animationen
Erhalten und systematisiert: Glanzlauf-Zyklus auf `T.mo.sheen` (11 s, sichtbarer Lauf ≈1,2 s), alle Sheens linear (kein Stocken), gestaffelte Slots, Plate-Sheen/Funkenlauf/Kamera-Anflug unangetastet, Dauerglühen aus Listen entfernt, reduced-motion stoppt alles.

## 13–15 · Tests, Build, Performance
**791/0/19** (`npm test`, Summenprüfung; neue Suite test_kontrast mit 30 Prüfungen — **neues Soll: 791/19**). Build + build:single grün, Boot 3/3, drive3 KEINE FEHLER, messe-hub/knoepfe/karten/lage + pruefe-klassiksatz SAUBER. **Reinraum** (frischer Klon des Feature-Branches): ci → 791/0/19 → build → single → boot 3/3 → drive3 grün. Ein Wächter bewusst nachgezogen (test_ui: Schatzkammer-Polster 19/16→17/13, Absicht bleibt geprüft). Precache 2770→**2533 KiB** (−237 netto trotz +91 KB Schriften). Keine neuen Compositing-Dauerläufer.

## 16–17 · Accessibility, Lokalisierung
Fokus sichtbar, aria-pressed auf Segmenten, Touch-Mindestmaße, Kontraste maschinell ≥4,5:1 (Text) / ≥3:1 (Konturen/Status), reduced-motion. Keine Texte hardcodiert; neuer Schlüssel `tree.more` in de+en; lange deutsche Proben in der Galerie; beide Sprachen durch die bestehenden Suiten gedeckt.

## 18 · Screenshots
`screenshots/before/` (25), `after/` (24), `comparisons/` (8 Gegenüberstellungen). PIL-geprüft: kein Nachher-Foto leer. Hinweis: die Bildansicht der Sitzung fiel aus (§0a-Muster) — alle Belege numerisch; **Sichtprüfung der comparisons/ durch den Besitzer erwünscht.**

## 19–20 · Restprobleme & DS 1.1
KNOWN_ISSUES.md: produktseitige Altpunkte (Händler, Sprachknopf, Online-Rauswurf, Worker-Deploy, Anthrazit-Sichtfrage) unverändert offen und dieser Migration nicht zugerechnet. Nice-to-haves: SPACING in Bestandscode beim Anfassen, Restfarben GameScreen/ArmyScreen auf Tokens, Galerie um HUD-Bausteine, tabular-Ziffern im HUD.

## 21–25 · Verwaltung
Feature-Branch `feature/design-system-v1` · letzter stabiler Commit: siehe git log (Checkpoint 5) · Backup `backup/pre-design-system-v1-20260729-0724` (= 1aaa021) · Rollback: ROLLBACK.md (vollständig = nichts tun/Branch löschen; phasenweise = revert der atomaren Checkpoints; Übernahme = Merge + v0.42.0 + Kette 791/19). **Es wurde nicht deployt und nicht auf main gearbeitet; Produktion läuft unverändert auf v0.41.2.**
