# GAMBIT — Konten-Anleitung (Schritt für Schritt)

Welche Accounts du wann brauchst, was sie kosten, was du bereithalten musst
und wo die Stolperfallen liegen. Reihenfolge = Launch-Reihenfolge.
Grundregel für alle: **eigenes starkes Passwort (Passwortmanager) + 2FA an.**

---

## Phase 0 — Grundlagen (hast du fast alles schon)

### ☐ 0.1 Support-/Impressums-E-Mail
- **Wozu:** steht im Impressum, bei itch.io und im Play Store öffentlich.
- **Tipp:** eigene Adresse/Alias wie `hallo@deinedomain.de` statt privater
  Mail — 10 Min beim Mail-Anbieter deines Hostings.

### ☑ 0.2 GitHub (vorhanden)
- Repo existiert (inzwischen öffentlich). Es fehlt nur der **Fine-grained Token** für den
  Chat-Deploy:
  1. github.com → Profilbild → **Settings**
  2. ganz unten **Developer settings** → **Fine-grained tokens** → *Generate new token*
  3. Name `gambit-deploy`, Expiration **90 days**
  4. Repository access: **Only select repositories** → deine Gambit-Repos
  5. Permissions → Repository: **Contents: Read and write**,
     **Pages: Read and write** (Metadata setzt sich selbst)
  6. *Generate* → Token in den Passwortmanager.
- **Für Route A zusätzlich:** zweites, **öffentliches** Repo
  `grand-gambit-site` anlegen (New repository → Public → ohne README).
  Keine weiteren Klicks — den Rest (Push + Pages aktivieren) übernimmt
  `npm run deploy:site` bzw. ich im Chat.

---

## Phase 1 — Browser-Launch

### ☐ 1.1 Cloudflare (Route B: eigene Domain, empfohlen) — kostenlos, 10 Min
- **Bereithalten:** E-Mail; für die Domain-Anbindung Zugriff auf die
  DNS-Einstellungen deiner bestehenden Domain.
1. dash.cloudflare.com → **Sign up** → E-Mail bestätigen → **2FA aktivieren**
   (My Profile → Authentication).
2. Links **Workers & Pages** → *Create* → **Pages** → **Connect to Git**.
3. GitHub autorisieren → dabei **Only select repositories** → nur dein
   privates Gambit-Repo freigeben.
4. Build command `npm run build` · Output directory `dist` → **Save and Deploy**.
5. Nach ~1 Min läuft `https://<projekt>.pages.dev`.
6. Eigene Domain: im Pages-Projekt **Custom domains** → z. B.
   `spiel.deinedomain.de` → den angezeigten CNAME bei deinem DNS eintragen.
- **Stolperfalle:** Wenn deine Domain NICHT bei Cloudflare liegt, dauert die
  CNAME-Verifizierung manchmal bis zu 1 h — einfach warten, nichts doppelt
  anlegen.
- **Keine neue Domain nötig:** Subdomain deiner vorhandenen Domain reicht
  völlig und wirkt professionell.

*(Route A — GitHub Pages — braucht **kein** neues Konto: nur 0.2.)*

---

## Phase 2 — itch.io (Woche 2–3)

### ☐ 2.1 itch.io — kostenlos, 15 Min
- **Bereithalten:** Support-Mail, Cover-Bild 630×500 (liefert `public/og.png`
  als Basis + `npm run map:svg`).
1. itch.io → **Register** → E-Mail bestätigen → Settings → **Two-factor auth** an.
2. Settings → **Developer** Modus aktivieren ("I want to distribute content").
3. Oben **Upload new project**:
   - Kind of project: **HTML** · „This file will be played in the browser" ✓
   - Viewport: **480 × 800** + „Mobile friendly" ✓ (oder Fullscreen-Button ✓)
   - Erstes ZIP: Inhalt von `dist/` zippen und hochladen.
   - Visibility erst **Draft/Restricted**, öffentlich schalten wenn alles passt.
4. **Butler-Key für Auto-Releases:** Settings → **API keys** → *Generate* →
   im GitHub-Repo unter Settings → Secrets → Actions als `BUTLER_API_KEY`
   speichern; dazu unter Variables `ITCH_USER` (dein itch-Name) und
   `ITCH_GAME` (Projekt-Slug aus der URL). Ab dann veröffentlicht jeder
   Git-Tag `v*` automatisch.
- **Stolperfalle:** In der Projektbeschreibung den Hinweis auf
  „Profil → Spielstand exportieren" aufnehmen (itch-Sandbox-Speicher).
- Auszahlungskonto ist für ein Gratis-Spiel **nicht** nötig.

---

## Phase 3 — Google Play (Monat 2–3)

### ☐ 3.1 Google-Konto (falls nicht vorhanden) — kostenlos
- Normales Google-Konto mit **2FA**; am besten ein dediziertes
  Entwickler-Konto statt des privaten.

### ☐ 3.2 Google Play Console — **25 $ einmalig**, 30–60 Min + Wartezeit
- **Bereithalten:** Kreditkarte, **Lichtbildausweis** (Identitätsprüfung!),
  Telefonnummer, Support-Mail, Anschrift.
1. play.google.com/console → **Konto erstellen** → Typ **„Selbst"/Personal**
   (Organisation nur mit Gewerbe/D-U-N-S — dafür entfällt dann Regel 3.3).
2. 25 $ zahlen → Identität verifizieren (Ausweis-Upload; Prüfung dauert
   Stunden bis wenige Tage).
3. **Wichtig zu wissen:** Name und **Anschrift werden im Store öffentlich
   angezeigt** (Entwicklerangaben-Pflicht). Wer das nicht will, nutzt eine
   ladungsfähige Geschäftsadresse.

### ☐ 3.3 Die 12-Tester-Regel FRÜH einplanen ⚠
- Für persönliche Konten (erstellt nach 13.11.2023) gilt: vor dem
  öffentlichen Release ein **geschlossener Test mit mind. 12 Testern, die
  14 Tage durchgehend angemeldet bleiben** — erst danach kannst du
  Produktionszugriff beantragen, und Google bewertet dabei echtes
  Engagement.
- **Konsequenz:** Tester-Rekrutierung (Freunde, Familie, Bouldergym-Community!)
  ~3 Wochen vor Wunsch-Release starten. Das ist der häufigste Zeitfresser.
- Technischer Ablauf (Bubblewrap/TWA, assetlinks, Data-Safety) steht in der
  RELEASE-ANLEITUNG Abschnitt 4.

---

## Phase 4 — Multiplayer-Server (optional, wenn Online live gehen soll)

### ☐ 4.1 Hetzner Cloud (Empfehlung: EU/DSGVO, günstig) — ~4–5 €/Monat
- **Bereithalten:** Zahlungsmittel; ggf. Ausweis (Neukunden-Verifizierung).
1. console.hetzner.cloud → Konto anlegen → 2FA.
2. Neues Projekt → **Server** CX22 (Ubuntu) reicht locker.
3. Danach: Node + `server/server.mjs` + Reverse-Proxy mit TLS (`wss://`),
   `ADMIN_TOKEN` als Umgebungsvariable — Details RELEASE-ANLEITUNG
   („Backups & Admin").
- Alternative ohne eigenen Server: Fly.io (Kreditkarte nötig, Free-Tier
  wackelig für Dauerbetrieb).

---

## Phase 5 — Steam (viel später)

### ☐ 5.1 Steamworks — **100 $ pro Spiel** + Papierkram
- **Bereithalten:** Ausweis, Bankverbindung, Steuerformular (W-8BEN für
  Nicht-US), ~1–2 Wochen Freischaltzeit.
- Erst sinnvoll nach stabilem Browser+Play-Betrieb; Desktop-Verpackung
  (Tauri/Electron) kommt dann als eigener Schritt.

---

## Schnell-Checkliste

| # | Konto | Kosten | Wann |
|---|---|---|---|
| 0.1 | Support-Mail | 0 € | jetzt |
| 0.2 | GitHub-Token + Site-Repo | 0 € | jetzt |
| 1.1 | Cloudflare | 0 € | vor Domain-Launch |
| 2.1 | itch.io (+ Butler-Key) | 0 € | Woche 2–3 |
| 3.2 | Play Console | 25 $ einmalig | ~3 Wochen vor Play-Release |
| 3.3 | 12 Tester organisieren | 0 € (Zeit!) | direkt nach 3.2 |
| 4.1 | Hetzner | ~4 €/Monat | wenn Online-Modus live geht |
| 5.1 | Steamworks | 100 $/Spiel | später |
