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

**Stand beim Schreiben:** v1.88.0 live auf `main`. Die UI-Wünsche vom
27.9. (Abschnitt 5) laufen als v1.89.0. *(Dieser Absatz wird am Ende der
Sitzung nachgeführt.)*

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
| 1.89.0 | Die UI-Wünsche vom 27.9. — siehe Abschnitt 5 | `CHANGELOG.md` |

Dazu die Berichte, die in dieser Sitzung geschrieben wurden:

- `design/AUDIT-2026-09-27.md` — das Challenging des ganzen Projekts (sechs
  Linsen, jede vom Skeptiker geprüft), mit Fragebogen am Ende.
- `design/SPIELTEST-2026-09-27.md` — der Spieltest: Kern-Fahrprobe über alle
  Stationen und sechs Browser-Szenarien; bestätigte Abstürze mit Ursache.
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

## 5. Offene Punkte (Stand beim Schreiben — am Ende nachgeführt)

Aus der Sprachnachricht vom 27.9. (Reihenfolge = Bearbeitung):

- [x] Online-Duell-Kachel: „Als Gast nicht nutzbar" und der Verbindungsstand lagen übereinander (gemessen 56,8 × 12 px) — der Stand rückt beim Gast eine Zeile tiefer.
- [x] Hinweis-Popups mittig, Hintergrund im Glas-Blur, Leuchtkontur läuft ums Fenster (sie lief bisher um den ganzen Schirm).
- [x] Klang-Knacken beim Drücken von Knöpfen: Warmhalter im Klangpfad (`src/app/ui/klang.js`) — **Hypothese, auf dem Handy zu bestätigen**.
- [ ] Aufstellung: Standardfiguren höchstens so oft wie im Grundsatz (2 Türme, 2 Springer, 2 Läufer, 1 Dame).
- [ ] Gefecht: „Du bist am Zug" ohne Kachel und Punkt, in Lila; gesperrte Fähigkeit als mittiger Text statt Lila-Kasten; Schloss selbst gezeichnet; Talent-Kacheln lila, gewählt animiert leuchtend.
- [ ] Fähigkeiten-Zeichen überall als abgerundete Vierecke.
- [ ] Hofstaat-Slider: Eckverzierungen der nicht gewählten Karten lila.
- [ ] Fähigkeiten exportieren + Ideen + Zugbilder gegen den Kern prüfen (Test).
- [ ] Zurück-Knöpfe auf Schnelles Spiel und Akademie weg, Chronik ganz nach oben; kein Scrollen ohne Überlauf.
- [ ] Akademie glattziehen (Schnellkurs, Spielweise mit Brettdiagrammen, zwei Kacheln nebeneinander, Kulisse).
- [ ] Profil im Lila-Look; „Darstellung & Leistung" raus; Feedback-Rubriken kürzen; Punkte vor Überschriften weg.
- Geparkt (Besitzer): Info-Knopf in der Aufstellung · Reiter „Spielen" in „Hauptmenü" umbenennen · „Die Karte erzählt die Geschichte" (großer Brocken, später).

Technik (aus `design/STAND-2026-09-26.md`): T6 erledigt (Zweige gelöscht), T9
(Domain in der Cloud-Umgebung freigeben — mit dem Wechsel in den Chat
gegenstandslos), T10 (Archiv aus der Git-Historie, nur bewusst), T11
(ArmyScreen/GameScreen entflechten), T7 (Layout-Erwartung „Brett zentriert").

Store: `design/PLAYSTORE-BACKLOG.md`, S1–S14. Beim Besitzer: `.aab` mit Paket
`com.gambitrise.app` neu bauen und hochladen, Datensicherheit mit Standort,
12 Tester / 14 Tage.

## 6. Erste Schritte im neuen Chat

1. Repo klonen bzw. den Connector auf `manubloc/gambit-rise` richten;
   `git log --oneline -5` muss mit `v1.8x.0 …` beginnen.
2. `npm ci`, dann `npm test` — es müssen **27 Suiten** laufen (Zahl der
   Prüfungen steht in `CLAUDE.md`).
3. `CLAUDE.md` lesen (Kette, Fallen, Live-Messung), dann dieses Blatt,
   dann die drei Berichte vom 27.9.
4. Vor dem ersten Push: `GAMBIT_ZUGANG` im Cloudflare-Dashboard löschen
   (ohne Wirkung, nur Ordnung).
5. Bei jedem Release: Version in `package.json` hochzählen, Changelog-Zeile
   mit Ursache, eiserne Kette, Push auf `main`, `version.json` live pollen.
