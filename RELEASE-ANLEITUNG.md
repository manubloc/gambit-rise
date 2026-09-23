# GAMBIT — Release-Anleitung

Vom Repo zum öffentlichen Browsergame in ~30 Minuten, danach itch.io und
Google Play mit minimalem Mehraufwand. Alles hier ist bereits vorbereitet —
du füllst nur noch Platzhalter und klickst dich durch die Anbieter-Dashboards.

---

## 0) Einmalig: Platzhalter füllen (5 Min, WICHTIG)

| Datei | Was eintragen |
|---|---|
| `public/privacy.html` | Name, Adresse, E-Mail (Impressum + Verantwortlicher), Datum, Hoster. Alle Stellen sind rot markiert (`[…]`). |
| `LICENSE` | Deinen Namen. |
| `package.json → version` | Passt (0.2.0). Bei jedem Release erhöhen + `CHANGELOG.md` ergänzen. |

> Impressum & Datenschutzerklärung sind in Deutschland Pflicht, sobald das
> Spiel öffentlich erreichbar ist — deshalb zuerst.

## 1) Git & GitHub (10 Min)

Dein privates Repo + Node-.gitignore war der richtige Start. Zwei Dinge:

1. **Unsere `.gitignore` verwenden** (liegt im Projekt): Sie ergänzt das
   Node-Template um projektspezifische Einträge (`dist-single`,
   `server/data.json`, Build-Zwischendateien `.sf-*.js`, `.smoke.mjs`, `.pl.mjs`).
   Einfach die Datei aus diesem Paket committen — sie ersetzt/ergänzt deine.
2. Erster Push:

```bash
cd gambit
git init            # falls im Ordner noch nicht geschehen
git add -A
git commit -m "Gambit 0.2.0 — erster öffentlicher Release-Stand"
git branch -M main
git remote add origin git@github.com:DEINNAME/grand-gambit.git
git push -u origin main
```

Ab dem Push läuft automatisch **CI** (`.github/workflows/ci.yml`):
220 Tests → beide Builds → Sandbox-Boot-Prüfung der Single-Datei.
Grüner Haken = releasefähig.

## 2) Browser-Launch: Cloudflare Pages (10 Min)

1. https://dash.cloudflare.com → **Workers & Pages → Create → Pages →
   Connect to Git** → dein Repo wählen.
2. Build-Einstellungen:
   - Framework preset: **Vite** (oder None)
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Deploy klicken. Nach ~1 Min ist das Spiel unter
   `https://<projekt>.pages.dev` live — inklusive Service Worker,
   Icons, Security-Headern (`public/_headers`) und Datenschutz-Seite
   (`…/privacy.html`).
4. **Eigene Domain:** Pages-Projekt → Custom domains → z. B.
   `spiel.deinedomain.de`. Ab jetzt gilt: `git push` = neuer Release,
   jeder Branch bekommt automatisch eine Preview-URL.

*Fallback ohne Cloudflare:* `npm run build` und den Inhalt von `dist/`
per FTP auf deinen Webspace laden — funktioniert identisch, nur ohne
Auto-Deploy.

## 3) itch.io (später, 15 Min)

1. itch.io-Konto → **Create new project** → Kind: *HTML* →
   „This file will be played in the browser" ✓.
   Viewport: 480 × 800 (Mobile-Format) oder Fullscreen aktivieren.
2. Erstes Upload manuell: `npm run build`, `dist/` als ZIP hochladen.
3. **Automatisch ab dann:** Repo-Einstellungen →
   - Secret `BUTLER_API_KEY` (itch.io → Settings → API keys)
   - Variablen `ITCH_USER` (dein itch-Name) und `ITCH_GAME` (Projekt-Slug)
   Dann veröffentlicht jeder Git-Tag `v*` (oder der Workflow-Button
   „Release to itch.io") automatisch.
4. Seiten-Assets: Cover 630×500 + Screenshots — Material liefern
   `public/og.png` und `npm run map:svg` (Liga-Poster).

> Spielstände liegen auf itch in der Browser-Sandbox — deshalb gibt es im
> Profil jetzt **Spielstand exportieren/importieren**. Weise in der
> itch-Beschreibung kurz darauf hin.

## 4) Google Play (Monat 2–3, TWA-Weg)

Voraussetzungen sind mit diesem Paket erfüllt (installierbare PWA:
Service Worker + maskable Icons ✓, HTTPS über Pages ✓, Privacy-URL ✓).

1. Play-Console-Konto (25 $ einmalig).
2. `npx @bubblewrap/cli init --manifest https://DEINE-DOMAIN/manifest.webmanifest`
   → beantwortet Fragen, erzeugt Android-Projekt + Signing-Key
   (**Key sicher aufbewahren!**).
3. `npx @bubblewrap/cli build` → `app-release-signed.aab` hochladen.
4. Digital Asset Links: Bubblewrap zeigt dir die `assetlinks.json` —
   nach `public/.well-known/assetlinks.json` legen, pushen, fertig
   (dann verschwindet die Browser-Leiste in der App).
5. Store-Eintrag: Privacy-URL = `https://DEINE-DOMAIN/privacy.html`,
   Data-Safety-Formular: „keine Daten erhoben" (Online-Modus erst
   angeben, wenn er live geht).

Der große Vorteil des TWA-Wegs: **App-Updates = Web-Deploy.** Kein neues
APK nötig, solange sich nur Spielinhalte ändern.

## 5) Release-Routine (jedes Update)

```bash
# 1. version in package.json erhöhen, CHANGELOG.md ergänzen
# 2.
git add -A && git commit -m "v0.3.0 — …" && git tag v0.3.0
git push && git push --tags
```
→ CI testet, Pages deployt die Website, der Tag veröffentlicht auf itch.

## Deploy direkt aus dem Claude-Chat (dein Schnell-Loop)

Die Sandbox im Chat darf mit github.com sprechen — damit geht der komplette
Loop „bauen → pushen → live" in einer Chat-Nachricht. Einmalige Vorbereitung:

**1. Token erstellen (5 Min):** GitHub → Settings → Developer settings →
**Fine-grained personal access tokens** → Generate new token.
- Repository access: **Only select repositories** → deine 1–2 Gambit-Repos
- Permissions (Repository): **Contents: Read and write**,
  **Pages: Read and write**, **Workflows: Read and write** (nur falls ich
  Workflow-Dateien pushen soll), Metadata: Read (automatisch)
- Expiration: 90 Tage. Token sicher ablegen (Passwortmanager).

**2. Route wählen:**
- **Route A — GitHub Pages (null Dashboards, sofort):** Ein zweites,
  **öffentliches** Repo `grand-gambit-site` anlegen (leer). Dorthin pusht
  `npm run deploy:site` nur den gebauten Spielordner (dein Quellcode bleibt
  im privaten Repo). Live-URL: `https://DEINNAME.github.io/grand-gambit-site/`.
- **Route B — Cloudflare Pages (eigene Domain, unlimitiert):** Einmalig im
  CF-Dashboard „Connect to Git" mit dem privaten Repo (Build `npm run build`,
  Output `dist`) — danach ist jeder Push automatisch ein Deploy. Beide Routen
  können parallel laufen.

**3. Der Loop danach (jede weitere Version):** Im Chat den Token nennen →
Claude baut, pusht, prüft die Live-URL und meldet die Version. Lokal geht
dasselbe mit:

```bash
GH_TOKEN=… SITE_REPO=deinname/grand-gambit-site npm run deploy:site
```

**Sicherheit des Tokens:** Nur fine-grained + nur diese Repos + Ablaufdatum.
Wenn du ihn im Chat teilst: danach jederzeit in GitHub widerrufbar
(Settings → Tokens → Revoke) — bei Unbehagen nach dem Setup einfach
rotieren. Niemals dein GitHub-Passwort oder 2FA-Codes teilen; der Token
reicht und kann nichts außerhalb der freigegebenen Repos.

## Backups & Admin (Datensicherheit)

Drei Schutzschichten, damit nie ein Spielstand verloren geht:

**1. Auf dem Gerät (läuft immer):** Das Spiel legt automatisch
Wiederherstellungspunkte im lokalen Speicher an — alle 10 Minuten bei
Änderungen, dazu einen Anker pro Tag (6 aktuelle + bis zu 10 Tages-Punkte),
und erzwungen vor jedem Import. Spieler stellen sie selbst wieder her:
Profil → „Wiederherstellungspunkte".

**2. In der Cloud (sobald der Server läuft):** Verbundene Spieler bekommen
bei jedem Connect automatisch einen Cloud-Punkt (max. 5, je ≤ 250 KB,
an id+secret gebunden). Verwalten unter Online → „Cloud-Sicherung".

**3. Auf dem Server:** `server/backups/` erhält alle 10 Minuten (nur bei
Änderung) sowie bei jedem Shutdown einen Snapshot von `data.json`.
Rotation: alles der letzten 2 Tage, danach 1 Punkt/Tag für 14 Tage.

### Admin-Zugang (sehr bewusst abgesichert)

Der Admin ist **standardmäßig komplett deaktiviert**. Aktivierung nur über
eine Umgebungsvariable mit mindestens 24 Zeichen:

```bash
# Token erzeugen (einmalig, sicher verwahren — z. B. Passwortmanager):
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# Server damit starten:
ADMIN_TOKEN=DEIN_TOKEN node server/server.mjs
```

Schutzmaßnahmen: SHA-256 + timing-sicherer Vergleich, 5 Fehlversuche →
15 Minuten IP-Sperre, jede Admin-Aktion wird geloggt, Dateinamen-Muster
gegen Path-Traversal, `restore` erzeugt vorher automatisch einen
Sicherungspunkt. Im Livebetrieb IMMER über `wss://` (TLS) verbinden.

### Admin-Konsole benutzen

```bash
ADMIN_TOKEN=… node scripts/admin.mjs wss://dein-server stats
ADMIN_TOKEN=… node scripts/admin.mjs wss://dein-server list
ADMIN_TOKEN=… node scripts/admin.mjs wss://dein-server backup
ADMIN_TOKEN=… node scripts/admin.mjs wss://dein-server pull data-20260707-120000.json
ADMIN_TOKEN=… node scripts/admin.mjs wss://dein-server restore data-… --yes
```

Empfehlung zusätzlich: `server/backups/` regelmäßig per `pull` (oder rsync)
auf eine zweite Maschine ziehen — Backups auf demselben Rechner schützen
nicht vor Plattenausfall.

## Was bewusst NOCH nicht dabei ist

- **Multiplayer-Server-Hosting**: `SERVER_URL` ist leer, der Online-Tab
  erklärt das sauber. Wenn du live gehen willst: kleiner Node-Host
  (Fly.io/Hetzner) + `wss://`-Proxy, URL in `src/app/config.js`,
  Abschnitt 4 der Datenschutzerklärung finalisieren.
- **Steam**: erst nach Browser+Play sinnvoll (Tauri/Electron-Hülle,
  Desktop-Polish, 100 $ Steam-Fee).

## Handbuch der mitgelieferten Bausteine

- `assets/README.md` — Figuren & Karte als SVG bearbeiten
- `scripts/verify-boot.mjs` — der Sandbox-Boot-Wächter (läuft in CI)
- `npm run map:svg` — Liga-Karten als Poster-SVG exportieren
- Datenschutz-Popup: erscheint einmalig beim ersten Start; die
  Online-Zustimmung separat vor der ersten Verbindung.
