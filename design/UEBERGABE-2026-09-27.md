# Übergabe aus der Cloud-Sitzung — 27.9.2026

> **Wofür dieses Blatt da ist.** Besitzer: *„Ich möchte raus aus dieser
> Cloud-Sitzung und das wieder ganz normal in einen Chat übertragen. Alles,
> was du in dieser Sitzung erstellt und gemacht hast, muss sauber dokumentiert
> sein, und die Tokens und Freigaben müssen sauber übergeben werden, damit ich
> aus dem Chat heraus weiter deployen kann."*
>
> Dieses Blatt ist der Einstieg für die nächste Sitzung — egal ob Chat,
> Claude-Desktop oder Claude Code im lokalen Ordner. `CLAUDE.md` gilt
> unverändert (eiserne Kette vor jedem Push, Antworten auf Deutsch, Diagnose
> durch Messung). **Kein Schlüssel, kein Token, kein Passwort steht in diesem
> oder irgendeinem anderen Blatt** — hier steht nur, WO sie liegen.

**Stand am Ende der Sitzung (27.9.2026, abends):** v1.89.0 (alle
UI-Wünsche vom 27.9.) ist auf `main` gepusht; v1.89.1 (der Scharfschuss der
Sonderfiguren, Zugbild-Probe als 28. Suite) v1.89.2 und v1.89.3 (Hofreihe auf
dem Handy, zwei Runden nach Besitzer-Fotos) folgen in derselben Sitzung —
siehe `CHANGELOG.md` und `git log`. Was danach noch offen ist, steht in
Abschnitt 5. Die Live-Abnahme (`version.json` pollen) konnte aus der
Cloud-Sitzung nie laufen und ist der erste Schritt im neuen Chat.

---

## 1. Wo alles steht

| Was | Wo |
|---|---|
| Quellcode | GitHub **manubloc/gambit-rise**, Zweig `main` (Arbeitszweig dieser Sitzung: `claude/friendly-hypatia-c1ncjt`, steht auf demselben Commit) |
| Live | <https://gambitrise.com> (Landingpage) · <https://gambitrise.com/spielen/> (App, seit v1.88.0 ohne Riegel) |
| Hosting | Cloudflare Pages, Projekt **grand-gambit** (der alte Name; die Domain zeigt darauf) |
| Online-Halle | Cloudflare Worker **gg-hall** (`worker/wrangler.jsonc`, Durable Object `Hall`) |
| Play Store | Paket `com.gambitrise.app`, **nicht veröffentlicht** — Stand in `design/PLAYSTORE-BACKLOG.md` |
| Bilder/Klänge | im Repo (`src/app/ui/assets/…`, `public/…`, Archiv unter `archiv/`) — keine externen Dienste nötig |

## 2. Der Deploy-Weg — so geht es ohne Cloud-Sitzung

**Der Push ist der Deploy.** Es gibt keinen Knopf und kein Token, das man
im Chat bräuchte:

1. Änderung auf `main` pushen (nach der eisernen Kette aus `CLAUDE.md`).
2. Cloudflare Pages baut das Projekt **grand-gambit** selbst (Build-Befehl und
   Ausgabeordner `dist/` stehen im Cloudflare-Dashboard unter *Workers &
   Pages → grand-gambit → Settings → Builds*), ~2–5 Minuten, dann ist es
   unter gambitrise.com live.
3. Der Worker **gg-hall** wird ebenso beim Push gebaut (Cloudflare ist an das
   Repo gekoppelt; Einstellungen unter *Workers & Pages → gg-hall → Settings*).
4. Abnahme: `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/version.json`
   muss die neue Version zeigen; Marker im Bundle zählen wie in `CLAUDE.md`
   beschrieben. **Aus der Cloud-Sitzung ging das nie** (Domain in der
   Netzwerk-Richtlinie nicht freigegeben) — aus einem lokalen Chat geht es.

Dazu läuft bei jedem Push auf `main` **GitHub Actions `CI`**
(`.github/workflows/ci.yml`: `npm test`, `npm run build`, `build:single`,
`verify-boot`, lädt `dist/` als Artefakt hoch — deployt aber NICHT).
`release-itch.yml` läuft nur von Hand (itch.io).

### Was der neue Chat braucht

- **Zugriff auf das GitHub-Repo** `manubloc/gambit-rise` mit Schreibrecht auf
  `main` — über den GitHub-Connector von Claude (Repo in den Einstellungen
  freigeben) oder über Claude Code / Claude Desktop in einem lokalen Klon
  (dann pusht `git` mit deinen eigenen Anmeldedaten).
- **Sonst nichts.** Kein Cloudflare-Token, kein Bild-API-Schlüssel, kein
  Play-Console-Zugang. Die Cloud-Sitzung hatte ebenfalls nur den
  GitHub-Zugriff (über die Claude-GitHub-App) und einen Netz-Proxy, der
  gambitrise.com nicht durchließ.
- Für die Live-Messung nach `CLAUDE.md` (Playwright gegen die Live-Seite)
  braucht der Rechner Chromium; lokal ist das `npx playwright install chromium`.

### Wo die Geheimnisse liegen (nur Orte, nie Werte)

| Name | Wo er liegt | Wozu | Stand |
|---|---|---|---|
| `BUTLER_API_KEY` | GitHub → Repo → Settings → Secrets | itch.io-Release (`release-itch.yml`) | nur bei Bedarf |
| `ADMIN_TOKEN` | Cloudflare → Worker gg-hall → Settings → Variables (Secret; gesetzt mit `npx wrangler secret put ADMIN_TOKEN`) | Admin-Aufrufe an die Halle: `scripts/admin.mjs` (stats, backup, pull …) und das Fehlerberichte-Feld im Profil des Admins (`src/meta/reports.js`) | in Gebrauch |
| `GH_TOKEN` + `SITE_REPO` | nur in der Umgebung dessen, der `scripts/deploy-pages.mjs` aufruft | **Altweg** GitHub-Pages-Deploy aus der Zeit vor Cloudflare — heute nicht nötig, Push auf `main` genügt | ruhend |
| `GAMBIT_ZUGANG` | Cloudflare → Pages grand-gambit → Build-Variablen | Passwort des alten Riegels | **seit v1.88.0 ohne Wirkung — darf gelöscht werden** |
| Signaturschlüssel der Android-Hülle | beim Besitzer (Passwortmanager) — `design/PWABUILDER.md`, Abschnitt 5 | Store-Updates der Hülle | entsteht beim Bauen der `.aab` |
| Google-Play-Fingerabdrücke | `public/.well-known/assetlinks.json` (öffentlich, das ist so gewollt) | TWA-Verknüpfung | zwei alte Einträge, gegen die Console abzugleichen (S5) |

Im Repo selbst liegt nichts davon — geprüft am 26.9. (T5: die Klartext-
Adressen aus `UEBERGABE.md` sind entfernt; `ADMIN_EMAILS` in `config.js` und
die Pflichtadresse in `privacy.html` bleiben bewusst).

## 3. Was in dieser Sitzung entstanden ist (26.–27.9.2026)

| Fassung | Inhalt | Wo nachlesen |
|---|---|---|
| 1.86.0 | Proben sehen den Auslieferungsstand (drive3 beide Stände), **Navigationsprobe** `tools/pruefe-navigation.mjs`, `OHNE_ARCHIV=1`-Bau (51 statt 743 MB), 238 Streu-Artefakte fort, Barrel-Verstöße, Doku-Drift | `CHANGELOG.md`, `design/AUDIT-2026-09-26.md`, `design/ANALYSE-2026-09-26.md` |
| — | 219 einzigartige Bilder aus den Juli-Zweigen gerettet, bevor die Zweige gelöscht wurden | `archiv/ausgemustert/zweige-juli-2026/LIESMICH.md` |
| 1.87.0 | Landingpage nach dem Blick des Besitzers: Länderband fort, Bretter ohne Lila und Glut, Zugbilder in einer Sprache, Crowd hinter der ersten Reihe | `CHANGELOG.md`, `tools/landing_bilder.py` |
| 1.88.0 | Der Riegel vor `/spielen/` ist fort (prompt() sperrte den Besitzer auf dem Handy aus) | `CHANGELOG.md`, `tools/seite-bauen.mjs` Schritt 3 |
| 1.89.0 | Die UI-Wünsche vom 27.9. (sechzehn Punkte, jeder vorher und nachher am DOM gemessen) plus zwei Render-Abstürze aus dem Audit (`ResultBanner` ohne `profile`, `CampaignScreen` ohne `paintedById`) und der Ereignis-Hänger im Gefecht | `CHANGELOG.md` |
| 1.89.1 | Der Scharfschuss der zehn Sonderfiguren mit eigener Gangart feuerte seit v0.38 nie (frühes `return` in `rules/moves.js`); Zugbilder gegen den Kern als 28. Suite `test_zugbilder.mjs`; ehrliche Legenden unter sechs Zugbildern | `CHANGELOG.md`, `design/FAEHIGKEITEN-2026-09-27.md` Abschnitt 3 |
| 1.89.2 | Hofreihe der Landingpage auf dem Handy (Besitzer-Foto): Springer 48–50 % statt 23 % sichtbar, Türme als Randfiguren der hinteren Reihe, Läufer bündig am Rand — Handy-Werte `--hs/--ys/--bs` in `public/landing.html`, alpha-genau gemessen | `CHANGELOG.md` |
| 1.89.3 | Zweite Runde Hofreihe (nur Handy): Läufer, Springer, Turm je einmal, Erzbischof raus, Kanzler und Kapitän außen, Turm höher, Amazone dahinter — Klassen `handy-weg/handy-da/handy-o1..o5` in `public/landing.html` | `CHANGELOG.md` |

Dazu die Berichte, die in dieser Sitzung geschrieben wurden:

- `design/AUDIT-2026-09-27.md` — das Challenging des ganzen Projekts (sechs
  Linsen, jede vom Skeptiker geprüft), mit Fragebogen am Ende.
- `design/SPIELTEST-2026-09-27.md` — der Spieltest: Kern-Fahrprobe über alle
  529 Stationen (3174 KI-Partien, 0 Abstürze) und Browser-Szenarien;
  bestätigte Abstürze mit Ursache. **Wichtigster Befund:** die Fallen
  (Spitzgrube, Bärenfalle) lösen im Kern nie aus — `loeseFalleAus` wird
  importiert, aber nirgends aufgerufen. Nicht behoben (Regeländerung, erst
  mit dem Besitzer klären).
- `design/FAEHIGKEITEN-2026-09-27.md` — alle Fähigkeiten exportiert, Zugbilder
  gegen den Kern geprüft, Ideen für neue.
- `design/PLAYSTORE-BACKLOG.md` — die Store-Liste (S1–S14), am 27.9. nachgeführt.
- `design/STAND-2026-09-26.md` — Übergabe vom Vortag mit T1–T11.

Artefakte (haltbare Links, weil Datei-Karten im Handy-Chat verloren gehen):

- Store-Einreichung, Bogen zum Abhaken: <https://claude.ai/artifact/DgHAE4AGzxi2yaCEYbtq9a>
- Android-Paket bauen (PWABuilder, Fassung 2 mit dem Paket-Hinweis): <https://claude.ai/artifact/TNKNcaNVnJiwGYQ6oWeydU>

## 4. Werkzeuge, die es vorher nicht gab

| Werkzeug | Zweck | Aufruf |
|---|---|---|
| `tools/pruefe-navigation.mjs` | fährt das ganze Haus (Karte, Gefecht, Reiter, Zurück-Geste) und wertet jeden Konsolenfehler als Absturz | nach `npm run build:app`: `node tools/pruefe-navigation.mjs` (`RUNDEN=5`) |
| `tools/landing_bilder.py` | Zugbilder, Gefechtsbretter und Crowd-Figuren der Landingpage aus Repo-Material | `python3 tools/landing_bilder.py [zugbilder|gefecht|crowd|alles]` |
| `OHNE_ARCHIV=1 npm run build` | Bau ohne die drei Archivordner (51 MB, Sekunden) — für Zwischenstände, nie für einen Release | — |
| `drive3.mjs` (erweitert) | erkennt Auslieferungsstand und App-Bau; prüft Landingpage, Dienstarbeiter und dass kein Riegel fragt | `timeout 250 node drive3.mjs` |
| `test_zugbilder.mjs` | 28. Suite: jedes Zugbild gegen den Kern, alle Sonderfiguren mit ihren Fähigkeiten, Drache je Stufe | läuft in `npm test` |
| `tools/pruefe-bezeichner.mjs` | freie Bezeichner im Bundle (die Klasse der Abstürze A3/A4) | nach `npm run ui`: `node tools/pruefe-bezeichner.mjs` |
| `src/content/zugbilder.js` | die Zugbild-Tabelle `ABILITY_MOVE` mit `hinweis`-Texten, importierbar (vorher unexportiert in ArmyScreen.jsx) | — |

## 5. Offene Punkte (Stand am Ende der Sitzung)

### 5a. Die Sprachnachrichten vom 27.9. — alles gebaut (v1.89.0 / v1.89.1)

- [x] Online-Duell-Kachel: „Als Gast nicht nutzbar" und der Verbindungsstand lagen übereinander (gemessen 56,8 × 12 px) — der Stand rückt beim Gast eine Zeile tiefer.
- [x] Hinweis-Popups mittig, Hintergrund im Glas-Blur, Leuchtkontur läuft ums Fenster (sie lief bisher um den ganzen Schirm).
- [x] Klang-Knacken beim Drücken von Knöpfen: Warmhalter im Klangpfad (`src/app/ui/klang.js`) — **Hypothese, auf dem Handy zu bestätigen**; wenn es weiter knackt, ist die nächste Spur der erste Ton nach `resume()` auf Android-Chrome.
- [x] Aufstellung: Standardfiguren höchstens zweimal (`HOECHSTZAHL_JE_FIGUR` in `src/meta/leveling.js`), Hinweis in klein, Karte im Wischband gesperrt.
- [x] Gefecht: „Du bist am Zug" ohne Kachel und Punkt in Lila; gesperrte Fähigkeit als mittiger Text; Schloss selbst gezeichnet (`LockIc`); Talent-Kacheln lila, gewählt mit Leuchtkontur.
- [x] Fähigkeiten-Zeichen überall als abgerundete Vierecke.
- [x] Hofstaat-Slider: Eckverzierungen der nicht gewählten Karten lila.
- [x] Fähigkeiten exportiert (`design/FAEHIGKEITEN-2026-09-27.md`), Ideen für neue (Abschnitt 4 dort), Zugbilder gegen den Kern als Suite — **Fund: der Scharfschuss der Sonderfiguren feuerte nie** (v1.89.1).
- [x] Zurück-Knöpfe auf Schnelles Spiel und Akademie weg, Chronik ganz nach oben; kein Scrollen ohne Überlauf (beide `<main>`-Polster).
- [x] Akademie: Schnellkurs neu (acht Tafeln, selbst gezeichnet), Spielweise mit Brettchen (`src/app/ui/Brettchen.jsx`), Chronik-Kacheln zwei nebeneinander, nur Begegnetes, Kulisse dahinter.
- [x] Profil im Lila-Look; „Darstellung & Leistung" raus; Feedback auf vier Rubriken; keine Punkte vor Überschriften.

**Was der Besitzer selbst abnehmen muss (Sichtbares, Handy):** das Knacken
(Hypothese), die Leuchtkontur der gewählten Talent-Kachel, die neuen
Schnellkurs-Tafeln, die Legenden unter den Zugbildern, der Profil-Look.

### 5b. Geparkt vom Besitzer

- Info-Knopf in der Aufstellung öffnet das Figuren-Popup („behalten wir es mal so bei").
- Reiter „Spielen" in „Hauptmenü" umbenennen („wir halten erstmal").
- „Die Karte erzählt die Geschichte" (großer Brocken, „später").
- Neue Fähigkeiten aus `design/FAEHIGKEITEN-2026-09-27.md` Abschnitt 4 auswählen — erst dann bauen.

### 5c. Aus Audit und Spieltest — festgestellt, bewusst NICHT gebaut

Alle Nummern beziehen sich auf `design/AUDIT-2026-09-27.md`. Gebaut wurden
nur die zwei bestätigten Render-Abstürze (A3, A4) in v1.89.0.

- **Fallen lösen nie aus** (Spieltest): `loeseFalleAus` in `src/core/rules/`
  wird importiert, aber nie aufgerufen — Spitzgrube und Bärenfalle sind im
  Gefecht wirkungslos. Regeländerung, deshalb erst mit dem Besitzer klären.
- **A1/A2 Online-Halle:** der Worker leitet Züge weiter, ohne sie gegen den
  Kern zu prüfen (Relay + Reducer ohne Validierung). Spielt nur eine Rolle,
  wenn ein Duell-Gegner manipuliert.
- **A5** Weißer Schirm ohne Fehlerschranke um die Reiter (ein Render-Fehler
  in einem Reiter reißt die ganze App) · **A6** `trim()` beim Anlegen des
  Kontos fehlt · **A7** die SQLite der Halle wächst ohne Grenze · **A8** der
  Worker glaubt dem Client das Duell-Ergebnis.
- Mittel, aber spielrelevant: **A9** die Bünde wirken im Gefecht nie
  (kein `createGame`-Aufruf übergibt sie) · **A10** Sperren halten nur
  Schritt, Gleiten und Bauern auf, Sonderzüge landen auf der Mauer ·
  **A11** HP-Umwandlung setzt einen Helden auf Grundwerte zurück · **A13**
  Tagespartie meldet das Ende nie · **A14** Rochade aus dem Schach heraus
  wird angeboten. Alle mit Datei:Zeile im Audit; der Fragebogen am Ende
  sortiert, was Besitzerentscheid ist.
- **A16** ist als Werkzeug gerettet: `tools/pruefe-bezeichner.mjs`
  (Scope-Scan mit acorn über das Bundle `.uitest.mjs`, das `npm run ui`
  baut) meldet jeden Bezeichner ohne Deklaration — genau die Klasse der
  Abstürze A3/A4. Stand v1.89.1: 0 unbekannte Namen. Noch NICHT in
  `npm test` eingehängt (braucht den esbuild-Vorlauf); als Handgriff vor
  jedem Release gedacht, siehe Abschnitt 4.
- Doppelter Schlüssel `position` in einem Style-Objekt in `App.jsx`
  (esbuild-Warnung, harmlos).

Technik (aus `design/STAND-2026-09-26.md`): T6 erledigt (Zweige gelöscht), T9
(Domain in der Cloud-Umgebung freigeben — mit dem Wechsel in den Chat
gegenstandslos), T10 (Archiv aus der Git-Historie, nur bewusst), T11
(ArmyScreen/GameScreen entflechten), T7 (Layout-Erwartung „Brett zentriert").

Store: `design/PLAYSTORE-BACKLOG.md`, S1–S14. Beim Besitzer: `.aab` mit Paket
`com.gambitrise.app` neu bauen und hochladen, Datensicherheit mit Standort,
12 Tester / 14 Tage.

## 6. Erste Schritte im neuen Chat

0. Zuerst die Live-Abnahme nachholen, die aus der Cloud nie ging:
   `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/version.json`
   muss die Fassung aus `package.json` auf `main` zeigen. Zeigt sie eine
   ältere, im Cloudflare-Dashboard unter *grand-gambit → Deployments*
   nachsehen, ob der Bau durchlief.
1. Repo klonen bzw. den Connector auf `manubloc/gambit-rise` richten;
   `git log --oneline -5` muss mit `v1.89.3 …` beginnen.
2. `npm ci`, dann `npm test` — es müssen **28 Suiten** laufen (Zahl der
   Prüfungen steht in `CLAUDE.md`).
3. `CLAUDE.md` lesen (Kette, Fallen, Live-Messung), dann dieses Blatt,
   dann die drei Berichte vom 27.9.
4. Vor dem ersten Push: `GAMBIT_ZUGANG` im Cloudflare-Dashboard löschen
   (ohne Wirkung, nur Ordnung).
5. Bei jedem Release: Version in `package.json` hochzählen, Changelog-Zeile
   mit Ursache, eiserne Kette, Push auf `main`, `version.json` live pollen.
