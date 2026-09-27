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
| Quellcode | GitHub **manubloc/gambit-rise**, Zweig `main` (das Repo ist **öffentlich**). Der Arbeitszweig dieser Sitzung `claude/friendly-hypatia-c1ncjt` wurde bei jedem Release mitgeschoben und darf gelöscht werden, sobald er mit `main` gleichauf ist (`git ls-remote --heads origin`). Bei einem bestehenden Klon `git fetch --prune`, sonst zeigt `git branch -a` noch drei gelöschte Juli-Zweige |
| Live | <https://gambitrise.com> (Landingpage) · <https://gambitrise.com/spielen/> (App, seit v1.88.0 ohne Riegel) |
| Hosting | Cloudflare Pages, Projekt **grand-gambit** (der alte Name; die Domain zeigt darauf) |
| Online-Halle | Cloudflare Worker **gg-hall** (`worker/wrangler.jsonc`, Durable Object `Hall`), erreichbar unter `duell.gambitrise.com` (Custom Domain im Dashboard *gg-hall → Settings → Domains & Routes*, NICHT in `wrangler.jsonc`; die alte `duell.grandgambit.win` steht laut CHANGELOG v1.41.0 noch daneben). Abnahme: `curl -s https://duell.gambitrise.com/design` muss JSON liefern |
| Play Store | Paket `com.gambitrise.app`, **nicht veröffentlicht** — Stand in `design/PLAYSTORE-BACKLOG.md` |
| Bilder/Klänge | im Repo (`src/app/ui/assets/…`, `public/…`, Archiv unter `archiv/`) — keine externen Dienste nötig |

## 2. Der Deploy-Weg — so geht es ohne Cloud-Sitzung

**Der Push ist der Deploy.** Es gibt keinen Knopf und kein Token, das man
im Chat bräuchte:

1. Änderung auf `main` pushen (nach der eisernen Kette aus `CLAUDE.md`).
2. Cloudflare Pages baut das Projekt **grand-gambit** selbst (Dashboard
   *Workers & Pages → grand-gambit → Settings → Builds*; erwartete Werte laut
   `README.md`: Build-Befehl `npm run build`, Output `dist`, Variable
   `NODE_VERSION=22`), ~2–5 Minuten, dann ist es unter gambitrise.com live.
   Pages-eigen im Repo: `functions/_middleware.js` (301 von grandgambit.win auf
   gambitrise.com) und `public/_headers`.
3. Der Worker **gg-hall** wird ebenso beim Push gebaut: Cloudflare Workers
   Builds, Root `worker/`, Befehl `npx wrangler deploy`, Zweig `main`
   (im Dashboard zu v1.27.3 verifiziert, `DEPLOY-WORKER.md`; seither nicht
   erneut geprüft — bei Zweifel dort nachsehen). Der Worker teilt den Kern
   mit der App (`src/core`): nach einer Regeländerung müssen beide Seiten
   dieselbe Fassung fahren, sonst lehnt die Halle Züge ab.
4. Abnahme: `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/spielen/version.json`
   muss die neue Version zeigen; Marker im Bundle zählen wie in `CLAUDE.md`
   beschrieben. **Aus der Cloud-Sitzung ging das nie** (Domain in der
   Netzwerk-Richtlinie nicht freigegeben) — aus einem lokalen Chat geht es.

Dazu läuft bei jedem Push auf `main` **GitHub Actions `CI`**
(`.github/workflows/ci.yml`: `npm test`, `npm run build`, `build:single`,
`verify-boot`, lädt `dist/` als Artefakt hoch — deployt aber NICHT).
`release-itch.yml` läuft von Hand (workflow_dispatch) **oder bei jedem
gepushten Tag `v*`** — deshalb keine Versions-Tags pushen, solange itch.io
nicht gewollt ist (derzeit gibt es weder lokal noch auf origin Tags). Und es
würde wegen `npm run build` die **Landingpage** statt des Spiels an itch.io
schicken (Audit A65). Braucht `BUTLER_API_KEY` und die Repo-Variablen
`ITCH_GAME`/`ITCH_USER` (Tabelle unten).

### Was der neue Chat braucht

- **Zugriff auf das GitHub-Repo** `manubloc/gambit-rise` mit Schreibrecht auf
  `main` — über den GitHub-Connector von Claude (Repo in den Einstellungen
  freigeben) oder über Claude Code / Claude Desktop in einem lokalen Klon
  (dann pusht `git` mit deinen eigenen Anmeldedaten).
- **Sonst nichts.** Kein Cloudflare-Token, kein Bild-API-Schlüssel, kein
  Play-Console-Zugang. Die Cloud-Sitzung hatte ebenfalls nur den
  GitHub-Zugriff (über die Claude-GitHub-App) und einen Netz-Proxy, der
  gambitrise.com nicht durchließ.
- **Node 22 und python3 mit Pillow** (`python3 -m pip install pillow`):
  `npm test` bricht sonst in `test_zauber.mjs` ab (Sockelfarbe des Drachen
  wird im Bild gemessen); `npm run build` läuft auch ohne Pillow (Vorschauen
  kommen dann unverändert aus `public/`).
- Für die Browser-Proben der Kette (drive3, pruefe-navigation,
  pruefe-textfluss, test_layout) und die Live-Messung braucht der Rechner
  Chromium: `npx playwright install chromium`, dann den Pfad der
  `chrome`-Datei in `PW_CHROMIUM` setzen — ohne die Variable nehmen die Proben
  den Pfad des Cloud-Containers (`/opt/pw-browsers/…`), den es lokal nicht gibt.

### Wo die Geheimnisse liegen (nur Orte, nie Werte)

| Name | Wo er liegt | Wozu | Stand |
|---|---|---|---|
| `BUTLER_API_KEY` | GitHub → Repo → Settings → Secrets | itch.io-Release (`release-itch.yml`) | nur bei Bedarf |
| `ADMIN_TOKEN` | Cloudflare → Worker gg-hall → Settings → Variables (Secret; gesetzt mit `npx wrangler secret put ADMIN_TOKEN`) | Halle (Worker): Fehlerberichte-Feld im Profil des Admins (`src/meta/reports.js`, `GET /reports?token=`), Spielerbuch (`/spielerbuch?token=`), Schreiben von `/design`; per WebSocket kennt der Worker nur `stats` und `dump` (`worker/src/logic.mjs`). `scripts/admin.mjs` ist die Konsole des ALTEN Node-Servers `server/server.mjs` — `backup/pull/restore` gibt es in der Halle nicht. Der Token wandert als URL-Parameter (Audit A56: besser `Authorization: Bearer`) | in Gebrauch |
| `GH_TOKEN` + `SITE_REPO` | nur in der Umgebung dessen, der `scripts/deploy-pages.mjs` aufruft | **Altweg** GitHub-Pages-Deploy aus der Zeit vor Cloudflare — heute nicht nötig, Push auf `main` genügt | ruhend |
| `GAMBIT_ZUGANG` | Cloudflare → Pages grand-gambit → Settings → Environment variables | Passwort des alten Riegels | **seit v1.88.0 ohne Wirkung — darf gelöscht werden.** Der Vorgabewert des Riegels stand ohnehin im Bauskript und in der Git-Historie (vor v1.88.0); ein eigener Wert im Dashboard war nie ein Geheimnis von Gewicht |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_KEY` | Cloudflare → Pages grand-gambit → Settings → Environment variables (Production) — Anleitung `SUPABASE-SETUP.md` Abschnitt 3 | Cloud-Anmeldung (E-Mail, Google) über Supabase (`src/meta/cloudAuth.js`), Bestenliste und geteilter Speicher (`src/platform/storage.web.js`); der anon-Key ist per Design öffentlich, der Wert steht trotzdem nur dort | **in Gebrauch — NICHT löschen** (Google-Anmeldung live seit v1.64.0). Das Supabase-Projekt selbst (Dashboard, Provider, E-Mail-Bestätigung) liegt beim Besitzer |
| `ITCH_GAME` + `ITCH_USER` | GitHub → Repo → Settings → Variables | Ziel des itch.io-Release (`release-itch.yml`; der Datei-Kopf und `RELEASE-ANLEITUNG.md` nennen noch das veraltete `ITCH_TARGET`) | nur bei Bedarf |
| Signaturschlüssel der Android-Hülle (`*.keystore`, `signing-key-info.txt`) | beim Besitzer (Passwortmanager) — `design/PWABUILDER.md`, Abschnitt 5 | Store-Updates der Hülle | entsteht beim Bauen der `.aab`. **NIE ins Repo** (öffentlich!): `design/twa-manifest.json` erwartet ihn unter `./gg-upload.keystore` — deshalb immer außerhalb des Klons bauen (so steht es in `PWABUILDER.md` und `PLAYSTORE.md`); `.gitignore` sperrt `*.keystore`, `*.jks`, `signing-key-info.txt`, `*.aab` seit dem 27.9. (Audit A28) |
| Google-Play-Fingerabdrücke | `public/.well-known/assetlinks.json` (öffentlich, das ist so gewollt) | TWA-Verknüpfung | zwei alte Einträge, gegen die Console abzugleichen (S5) |

Im Repo selbst liegt nichts davon — geprüft am 26.9. und 27.9. (grep nach
Token-Mustern, E-Mails und Session-URLs über alle getrackten Textdateien
inklusive `archiv/`: nur Code-Zitate, Platzhalter und Testwerte; keine
`.env`, `.keystore`, `.pem` getrackt. T5: die Klartext-Adressen aus dem alten
`UEBERGABE.md` sind entfernt; `ADMIN_EMAILS` in `config.js` und die
Pflichtadresse in `privacy.html` bleiben bewusst). Der Vorgabewert des alten
Riegels stand bis zum 27.9. im CHANGELOG-Eintrag 1.42.0 und bleibt in der
Git-Historie — ohne Wirkung seit v1.88.0, kein Grund für ein History-Rewrite.

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
| 1.89.4 | Die Übergabe nach der Prüfung (30 bestätigte Befunde): Proben lesen `PW_CHROMIUM`, `.gitignore` sperrt Schlüsseldateien, Blätter berichtigt, Fahrskript des Spieltests eingecheckt | `CHANGELOG.md` |
| 1.89.5 | **Zwei Spieltest-Funde:** das Tor zum nächsten Kapitel wurde nie gerendert (hing an der alten Kennung `n22`) — nach dem Meister ging es nicht weiter; die Aufstiegsfeier wurde seit v1.0.75 nie gerendert. Beide im Browser vor/nach gemessen | `CHANGELOG.md`, `design/SPIELTEST-2026-09-27.md` |

Dazu die Berichte, die in dieser Sitzung geschrieben wurden:

- `design/AUDIT-2026-09-27.md` — das Challenging des ganzen Projekts (sechs
  Linsen, jede vom Skeptiker geprüft), mit Fragebogen am Ende. Achtung: das
  Repo ist öffentlich, der Bericht nennt die Lücken der Halle mit Zeile
  (siehe 5c, erster Punkt).
- `design/SPIELTEST-2026-09-27.md` — der Spieltest: Kern-Fahrprobe über alle
  529 Stationen (3174 KI-Partien, 0 Abstürze; das Fahrskript liegt als
  `tools/spieltest-fahrprobe.mjs` bei) und Browser-Szenarien; bestätigte
  Abstürze mit Ursache. **Wichtigster Befund (= Audit A32):** die Fallen
  (Spitzgrube, Bärenfalle) lösen im Kern nie aus. Nicht behoben
  (Regeländerung, erst mit dem Besitzer klären). Die Browser-Szenarien fuhren
  gegen den Bau v1.87.0 — Aufstellungs-Funde wie „dritter Turm wählbar" sind
  seit v1.89.0 behoben und gegen v1.89.1 nachgemessen (0 Funde).
- `design/FAEHIGKEITEN-2026-09-27.md` — alle Fähigkeiten exportiert, Zugbilder
  gegen den Kern geprüft, Ideen für neue.
- `design/PLAYSTORE-BACKLOG.md` — die Store-Liste (S1–S14), am 27.9. nachgeführt.
- `design/STAND-2026-09-26.md` — Übergabe vom Vortag mit T1–T11.

Artefakte (haltbare Links, weil Datei-Karten im Handy-Chat verloren gehen):

- Store-Einreichung, Bogen zum Abhaken: <https://claude.ai/artifact/DgHAE4AGzxi2yaCEYbtq9a>
- Android-Paket bauen (PWABuilder, Fassung 2 mit dem Paket-Hinweis): <https://claude.ai/artifact/TNKNcaNVnJiwGYQ6oWeydU>

Beide Artefakte sind privat (nur dieses Konto) und enthalten keine Schlüssel.
Sie stammen aus der Zeit VOR v1.88.0 und sprechen noch vom Passwortriegel —
den gibt es nicht mehr; die Aufgabe „Kommt eine Passwortabfrage?" ist damit
umgekehrt: kommt eine, ist etwas anderes kaputt (Start-URL `/spielen/`).

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

Dazu aus dem Spieltest gebaut (v1.89.5): das Tor zum nächsten Kapitel und
die Aufstiegsfeier — siehe `design/SPIELTEST-2026-09-27.md`, Abschnitt 3.

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

- **A32 Fallen lösen nie aus** (Spieltest und Audit): `loeseFalleAus`
  (`src/core/rules/sperren.js:99`) wird in `src/core/sim/transitions.js:6`
  importiert, aber in `src/` nirgends aufgerufen (nur `test_sperren.mjs`) —
  Spitzgrube und Bärenfalle sind im Gefecht wirkungslos. Regeländerung,
  deshalb erst mit dem Besitzer klären.
- **Zuerst entscheiden (öffentliches Repo):** das Audit beschreibt die
  Lücken der Halle (A1/A2/A8/A21/A22/A56) mit Datei und Zeile — wer es liest,
  kann sie nutzen. Die drei billigen Riegel wären: Teilnehmerprüfung aus
  `result` auch in `cmd` und `scoutDone` (`worker/src/logic.mjs`),
  `friendRespond` nur bei offener Anfrage, `result` nur als Niederlage/Remis
  der meldenden Seite; dazu je eine Probe in `test_worker.mjs`. Der Worker
  deployt beim Push — darum nicht ohne den Besitzer.
- **A1/A2 Online-Halle:** der Worker leitet Züge weiter, ohne sie gegen den
  Kern zu prüfen (Relay + Reducer ohne Validierung). Spielt nur eine Rolle,
  wenn ein Duell-Gegner manipuliert.
- **A5** unlesbarer oder fehlender Spielstand = weißer Schirm ohne Ausweg
  (kein Abmelde-Knopf, keine Meldung; `saves.js`, `App.jsx`) · **A45** nur
  eine Fehlergrenze an der Wurzel (`main.jsx`) — ein Render-Fehler in einem
  Schirm ersetzt das ganze Haus · **A6** `trim()` beim Anlegen des Kontos
  fehlt · **A7** die SQLite der Halle wächst ohne Grenze · **A8** der Worker
  glaubt dem Client das Duell-Ergebnis.
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
- Die Commit-Nachrichten dieser Sitzungen tragen `Claude-Session:`-Zeilen
  (Links, die nur der Kontoinhaber öffnen kann). Wer das im öffentlichen Repo
  nicht will, setzt in `CLAUDE.md` unter „Zusammenarbeit" eine Regel „Commits
  ohne Claude-Session-Zeile" — bestehende bleiben (kein History-Rewrite).

Technik (aus `design/STAND-2026-09-26.md`): T6 erledigt (Zweige gelöscht), T9
(Domain in der Cloud-Umgebung freigeben — mit dem Wechsel in den Chat
gegenstandslos), T10 (Archiv aus der Git-Historie, nur bewusst), T11
(ArmyScreen/GameScreen entflechten), T7 (Layout-Erwartung „Brett zentriert").

Store: `design/PLAYSTORE-BACKLOG.md`, S1–S14. Beim Besitzer: `.aab` mit Paket
`com.gambitrise.app` neu bauen und hochladen, Datensicherheit mit Standort,
12 Tester / 14 Tage.

## 6. Erste Schritte im neuen Chat

0. Zuerst die Live-Abnahme nachholen, die aus der Cloud nie ging:
   `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/spielen/version.json`
   muss die Fassung aus `package.json` auf `main` zeigen. Zeigt sie eine
   ältere, im Cloudflare-Dashboard unter *grand-gambit → Deployments*
   nachsehen, ob der Bau durchlief.
1. Repo klonen bzw. den Connector auf `manubloc/gambit-rise` richten;
   `git log --oneline -5` muss mit `v1.89.5 …` beginnen (bei einem
   bestehenden Klon vorher `git fetch --prune`).
2. `npm ci`, dann `npm test` — es müssen **28 Suiten** laufen (Zahl der
   Prüfungen steht in `CLAUDE.md`).
3. `CLAUDE.md` lesen (Kette, Fallen, Live-Messung), dann dieses Blatt,
   dann die drei Berichte vom 27.9.
4. Vor dem ersten Push: `GAMBIT_ZUGANG` im Cloudflare-Dashboard löschen
   (ohne Wirkung, nur Ordnung).
5. Bei jedem Release: Version in `package.json` hochzählen, Changelog-Zeile
   mit Ursache, eiserne Kette, Push auf `main`, `version.json` live pollen.
