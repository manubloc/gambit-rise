# Gambit — Übergabe (Stand 3. August 2026, v0.75.2 live)

Für einen frischen Chat. Alles Nötige steht hier; das Repo liegt im Container
unter `/home/claude/repo`.

---

## 1. Das Wichtigste zuerst

- **Repo:** `github.com/manubloc/grand-gambit` · **Live:** `grandgambit.win`
- **Aktuell live:** v0.75.2 · Kette **812 Prüfungen / 0 Fehler / 20 Suiten**
- **Besitzer:** Manuel — spricht Deutsch, oft über Sprachaufnahmen, arbeitet
  mobil und am PC im **selben** Chat. Er will autonome Arbeitsblöcke ohne
  Rückfragen, aber ehrliche Fehlermeldungen.
- **Cloudflare Pages** deployt bei Push auf `main` automatisch (~3 min).
- **NEU UND WICHTIG:** Der Worker `gg-hall` ist ebenfalls **git-verbunden**
  (Root `/worker`, Deploy `npx wrangler deploy`, Branch `main`) und deployt
  **automatisch mit jedem Push**. Die alte Regel „Worker-Deploy nur durch
  Manuel" ist überholt — im Cloudflare-Dashboard verifiziert.

### Zugänge

- **GitHub-PAT:** steht **nicht** in dieser Datei (GitHubs Push-Schutz lehnt
  Secrets im Repo ab — richtig so). Manuel nennt ihn im Chat oder erstellt einen
  neuen unter *Settings → Developer settings → Personal access tokens* mit
  Schreibrecht auf `manubloc/grand-gambit`. Nach der Sitzung widerrufen.
  Push: `git push "https://x-access-token:${PAT}@github.com/manubloc/grand-gambit.git" main`
- **Commit-Identität:** `git -c user.name="Claude" -c user.email="noreply@anthropic.com"`
- **FAL-Key** (Bilder): liegt nicht hier — Manuel reicht ihn im Chat durch
  (zuletzt wegen Quoten-403 ungeprüft).
- **ElevenLabs:** Manuel hat einen Token erstellt und im alten Chat geteilt — er
  soll ihn **rotieren** und den neuen im neuen Chat nennen. Er hat
  `api.elevenlabs.io` **bereits freigegeben**, die Freigabe greift aber erst in
  einer **neuen Sitzung** (im alten Container weiterhin `host_not_allowed`).
  → **Im neuen Chat zuerst `curl -sI https://api.elevenlabs.io` prüfen.**
- **Cloudflare:** Konto `frey.manu@gmail.com`, Account-ID
  `73af6b7e9469b4f0ac2577e7c9e5ac18`. `ADMIN_TOKEN` liegt als Worker-Secret
  (Wert unbekannt — Manuel tippt ihn selbst ein, nie erfragen).
  **Achtung:** `duell.grandgambit.win` steht **nicht** auf der Container-
  Freigabeliste; curl von dort liefert einen Proxy-403 („Host not in
  allowlist") — das ist **nicht** Cloudflare. Prüfung nur im Browser.

---

## 2. Die eiserne Kette (vor JEDEM Push, keine Ausnahme)

```
npm test                        # Soll: 812 / 0 Fehler / 20 Suiten
npm run build
npm run build:single
node test_boot.mjs              # 3/3
node drive3.mjs                 # == KEINE FEHLER ==
node tools/pruefe-textfluss.mjs # bei UI-Arbeit
# Reinraum:
rm -rf /tmp/rein && git clone /home/claude/repo /tmp/rein
cd /tmp/rein && npm ci && npm test && npm run build && npm run build:single \
  && node test_boot.mjs && node drive3.mjs
# dann Push, dann live prüfen
```

Prüfungen summieren:
`grep "^RESULT" /tmp/t.log | awk -F'[ ,]+' '{p+=$2;f+=$4} END {print p,f,NR}'`

**Zeitdeckel:** Kette + Reinraum in EINEM Aufruf sprengt oft das Limit — teilen.

**Live-Verifikation:** `version.json` pollen (alle 26 s, meist 2–4 Runden), dann
`curl -sL -o DATEI "https://grandgambit.win/?cb=$RANDOM$RANDOM"`, Bundle-Pfad
grepen, **Marker-Strings** suchen (nie Hash-Vergleich — Cloudflare-Hashes
weichen ab). Bilder: Byte-Vergleich Quelle ↔ `grandgambit.win/assets/<hash>.webp`.

---

## 3. Was in dieser Sitzung entstand (v0.71.0 – v0.75.2)

**Brett & Gefecht**
- Ganze Kacheln je Feld (keine Hash-Fenster), Fugen 0, Goldrahmen fällt bei
  Besitzer-Feldern, Brett auf volle Breite (376 px auf 390er-Schirm).
- **Ein** effektiver Gap für Layout + Kasten + Animation — heilte den
  Animationsversatz und den schwarzen Rand rechts/unten (war derselbe Fehler).
- Schweif als weicher Gold-Verlauf statt Kreisreihe.
- Riss-Blitze: die Figur des **letzten Zuges** zuckt einmal und glimmt aus
  (2,6 s; Gegner violett, eigene gold), ruht bei offenem Dialog.
- Leuchtstil („Glow") **komplett entfernt** — überall dieselbe Kunst; eigene
  Figuren heller (1,10/1,10), Gegner dieselbe Kunst nur dunkler (0,94/1,12).
- Bosse am Brett 1,14em (der Wächter war kaum zu erkennen).
- Kampfleiste ohne Panel: freigestellte Figur 108 px, Name winzig-serif mittig
  darüber, Kugeln 24 px darunter; dient **beiden Seiten** mit Nebelregel
  (fremdes Talent „???" bis zum ersten Einsatz); Chip zeigt das zuletzt
  verbrauchte Talent (`lastMove.consumed`, additiv im Kern).
- Ausrüstung: gleiche Quadrate 52×56, schwarz mit lila Kontur, Zahl darunter;
  das Wort ersetzt durch eine feine Trennlinie.
- Brett-Sprung beim Anwählen behoben (`contain: layout size`).

**Karten & Menü**
- Weltkarte: gleiche `frameH` wie die Kapitelkarte, **nur quer** scrollbar, lila
  Leuchtkontur, keine Überschrift, Overlay unter dem Dock (zIndex 8).
- Popup: Startknopf **immer golden** (der alte Riss-Zweig verriet
  Geheimnis-Stationen), Fließtext schwarz (#171310), Kugeln unter der Figur,
  Porträtbox schmal mit 1,42-Zuschnitt.
- Menü: Pfeile entfernt, Emblem führt ins Spielen-Menü, Hallen-Stand rechts oben
  in der Online-Kachel (online = leuchtend lila).
- **Lager** (4. Menütür) = Schatzkammer + **Händler** (aus dem Hofstaat
  umgezogen); **Hofstaat heißt jetzt Figuren** (en: Pieces).
- Vier Raum-Zeichen als SVG in den Segmented-Knöpfen (`src/app/ui/RaumIcons.jsx`).
- Erledigt-Haken lila statt grün.

**Verwaltung & Veröffentlichung**
- **Spielerbuch** (`?spielerbuch`): alle Spieler mit Fortschritt, online-Status,
  Suche, Statistiken, Länderverteilung. Worker-Endpunkt `/spielerbuch?token=`.
  Herkunft **datensparsam**: Land/Region/Stadt von Cloudflare, IP **nur als
  FNV-1a-Kurzhash**. Läuft live (im Browser verifiziert, 14 Spieler sichtbar).
- **Verwaltungs-Block im Profil** (nur für Admins) mit allen Türen.
- **Landingpage neu** (`public/landing.html`) mit echtem Spielmaterial:
  komponiertes Klassik-Brett, sechs Freisteller, drei Chronik-Blätter mit
  CSS-Zugdiagrammen, vier Modus-Karten, Weltkarte. Bilder in `public/landing/`.
- **Datenschutz** (Stand 3.8.) um Herkunft/IP-Hash/Spielerbuch ergänzt;
  **Nutzungsbedingungen** um virtuelle Inhalte, App-Stores, Fairness.
- **Alle Icons ring-zentriert neu** aus dem freigestellten Emblem (die
  Sternzacke hatte die Motivmitte verzogen) — Favicon, .ico, .svg, 16–512,
  Apple, maskable; App-Icons und Favicon teilen jetzt EIN Motiv.
- Drachenblatt korrigiert: goldener 2×2-Block + echte Schrittfelder, Flug auf
  jedes Feld im Umkreis (+2 Prüfungen → 812).

**Klang (v0.75.0 – v0.75.2)**
- Manuels fünf Aufnahmen waren je ~62 s lang (Werkzeug lieferte Bänder); Takes
  automatisch per Onset-Erkennung geschnitten und normiert.
- Live sind: `waehlen`, `treffer`, `fall`, `gesperrt` (aus tap-select-3, hit-3,
  capture-kill-2, denied-2) in `src/app/ui/assets/klang/*.webm`.
  **Der Setz-Klang ist bewusst stumm** (leere Liste, im Abspieler abgefangen) —
  keiner der Takes gefiel.
- Klangschicht: `src/app/ui/klang.js` (ein AudioContext, Variantenstreuung
  ±4 %), eigener Schalter im Profil, getrennt von der Musik.
- **Falle:** neue Asset-Endungen brauchen esbuild-Loader in **jedem** Skript
  (`--loader:.webm=dataurl`) — sonst stiller Suitenverlust.
- Kandidaten liegen noch: `/mnt/user-data/outputs/klang/` (aus den Aufnahmen)
  und `/mnt/user-data/outputs/klang-synth/` (synthetisiert per Modalsynthese —
  Klangfarben nach Korrektur bei 320–800 Hz, also holzig).

---

## 4. Offene Punkte (Prioritäten oben)

1. **ElevenLabs-Klänge** — Domain freigegeben, im neuen Chat prüfen und die
   Klänge aus `design/KLANG-PROMPTS.md` erzeugen. Zuerst der **Setz-Klang**
   (fehlt komplett), dann Sieg/Niederlage/Schach, dann Stufenaufstieg/Gold,
   dann Riss-Klänge. **Immer „one single sound, no repetitions" in den Prompt**,
   sonst kommen wieder 62-Sekunden-Bänder.
2. **HP-Remis-Regel** (60 Züge ohne Schaden = Remis) — Engine-Bau. Audit-Befund:
   KI-Selbstspiel erreicht bei 240 Halbzügen in der Hälfte der Fälle kein Ende;
   die „normale" KI-Armee trug 102 HP gegen 55 des Spielers.
3. **Kampagnen-Mix** — Zensus: **527 HP-Stationen gegen 2 Schach-Stationen**.
   Manuel will klassisches Schach im Vordergrund; **seine Quote fehlt noch**
   (z. B. „Kapitel 1–3: 70 % Schach"). Danach Generator neu laufen lassen.
4. **Play-Store-Verpackung** (TWA/Bubblewrap) — er will bald veröffentlichen.
5. Medaillon-Icons für Fähigkeitskarten; frischer Gambit-Satz
   (`/tmp/gambit-frisch.py`, wartet auf FAL-Quote); Zerreißer b22 (Kandidaten in
   `/mnt/user-data/outputs/`).
6. Altlast: Admin-Passwort in `accounts.js`; **GitHub-PAT nach der Sitzung
   rotieren**.

---

## 5. Fallen, die Zeit gekostet haben

1. **App.jsx hat ZWEI Rückgaben** (breit/mobil) — Einbauten in **beide**.
   GameScreen ebenso (KampfLeiste + Ausrüstungszeile je 2×).
2. **Nie `python3 -c` mit `${}`** — Shell-Ersetzung schreibt still leere Werte.
   Nur Heredoc `python3 - <<'PY'`. `.replace` trifft ALLE Vorkommen → mit
   `assert count==1` absichern.
3. **Zeilenkommentar-Falle:** `// Kommentar` mitten in eine JS-Zeile eingefügt
   frisst den Rest der Zeile (kostete diese Sitzung einen Build). `/* */` nutzen.
4. **Geteilter Container:** Eine Altsitzung committet **sporadisch fertige
   Arbeit** in denselben Ordner (diese Sitzung 4×: v0.65.0, v0.73.1, v0.75.0,
   v0.75.2). Manuel glaubt, keinen Parallelchat zu haben (Handy + PC im selben
   Chat) — Ursache ungeklärt. **Vor jedem Push `git ls-remote` gegen den lokalen
   HEAD**; fremde Commits **verifizieren und adoptieren**, nicht doppeln.
5. **Vor dem Ersetzen prüfen, ob es das Ding schon gibt.** Ein Händlerbild wurde
   zusätzlich eingebaut, obwohl `paintedById("haendler")` längst existierte —
   zwei Händler auf einer Seite. Manuel war zu Recht verärgert.
6. `import.meta.glob` ist verboten (esbuild) — explizite Importe erzeugen.
7. Nicht-UTF-8-Bytes in GameScreen/leveling/moves.js → beim Lesen
   `errors='replace'`; `sed`-Ausgaben können daran scheitern.
8. **Messen statt raten:** PIL/numpy für Bilder, Playwright-Sonden für UI,
   soundfile/numpy für Klang. Nie „ist behoben" ohne Beleg sagen.

### Sonden (in /tmp — gehen bei Container-Neustart verloren, neu bauen)

`schau-hub2.mjs` (Hub, Menü, Lager-Icons), `schau-leiste2.mjs` (Kampfleiste,
Deckung, Blitze), `schau-aufgeben.mjs` (Felder: Fuge, Brettbreite, Ränder),
`schau-buch.mjs` (Spielerbuch), `messe-boden.mjs`.
Gastweg in den Sonden: „Als Gast spielen" → „I" → Heralds
(`/Los geht|Weiter|Verstanden|Got it/i`, **nie** `/Start/i`) → ✕ → SPIELEN.
Brett: `[data-zelle]`, belegte Zelle = `children.length > 2`.

---

## 6. Wichtige Pfade

```
src/app/ui/board/      BoardView.jsx (feld, eGap, ruhig, justMoved)
                       PieceGlyph.jsx (tonung, Blitze, Bossgröße)
                       carvedArt.js, feldArt.js, paintedArt.js
src/app/ui/            KampfLeiste.jsx, RaumIcons.jsx, klang.js,
                       AdminPortal.jsx (?admin), SpielerbuchScreen.jsx,
                       WerkstattScreen.jsx (?werkstatt), primitives.jsx
src/app/ui/screens/    GameScreen.jsx, CampaignScreen.jsx, ArmyScreen.jsx
                       (MoveDiagram + GearPanel exportiert), AchievementsScreen.jsx
worker/src/            index.mjs (Routen-Gate ~Z.24, /spielerbuch, kurzHash),
                       logic.mjs (hello: land/region/stadt/ipHash)
public/                landing.html, privacy.html, terms.html, landing/*, icons/*
design/                KLANG-PROMPTS.md, KARTEN-PROMPTS.md
```

**Design-Grundsätze:** erwachsen und würdevoll (nicht niedlich), deutsche
Begriffe (Kapitel, Riss, Halle, Meister/Großmeister), nichts wird erzwungen
(Ton, Online, alles abschaltbar), Gold = eigene Seite, Violett = Riss.
Vor Bildgenerierung immer fragen (API-Budget), Prompts auf Englisch.
Visuelles vor dem Commit zeigen (`present_files`).
