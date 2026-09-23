# Umbenennung auf „Gambit" und Umzug auf gambitrise.com

Auftrag des Besitzers (23.9.2026): „Ich habe die Domain **gambitrise.com** gekauft. grandgambit gab es schon, gedoppelt. Stell alles um — Landingpage etc. — und entferne Grand Gambit extrem sauber. Wir nennen ihn nur noch **Gambit**, überall, das Spiel selbst und auch die Inhalte. Und natürlich Google Search Console und Play Store."

## Was betroffen ist (gemessen im Repo, ohne Sicherungen und Archiv)

| Muster | Treffer | Wo im Wesentlichen |
|---|---|---|
| `Grand Gambit` | 328 | Oberflächentexte, i18n, Geschichten, Lehren, Kommentare |
| `GRAND GAMBIT` | 43 | Wortmarke (Brand.jsx), Anmeldeschirm, Landingpage |
| `grandgambit.win` | 83 | index.html, landing.html, terms.html, Manifeste, TWA, Worker, Proben |
| `duell.grandgambit.win` | 8 | Spielserver (config.js, Fahrproben) |
| `grand-gambit` | 115 | Repo-Pfade in Kommentaren und Werkzeugen |

Feste Kennungen, die **bleiben**: die Figuren-ID `gambit`, die Speicherschlüssel (`gambit:u::…` — ein Wechsel würde jeden lokalen Spielstand unauffindbar machen) und die Android-Paket-Kennung `win.grandgambit.app` (siehe unten).

## Schritt 1 — Die Marke im Spiel (kann ich allein, eine Fassung)
- Alle sichtbaren Texte: „Grand Gambit" → „Gambit", „GRAND GAMBIT" → „GAMBIT".
- Betroffen: Wortmarke, Anmeldung, Profil, Chronik, Lehrtexte, Geschichten, Bundtexte, Titel und Beschreibungen in `index.html`, `manifest.webmanifest`, `landing.html`, `terms.html`, Benachrichtigungen, E-Mail-Texte des Servers.
- **Zu klären:** die Heldenfigur heißt heute ebenfalls „Grand Gambit". Wird sie schlicht „Gambit", heißen Spiel und Figur gleich. Alternative: die Figur heißt „der Gambit", das Spiel „Gambit".
- Proben: eine Probe, die sicherstellt, dass kein sichtbarer Text mehr „Grand Gambit" enthält.

## Schritt 2 — Die Domain im Code (kann ich allein)
- **Eine Stelle für die Adresse:** neue Konstanten in `src/app/config.js` (`DOMAIN`, `SERVER_URL`), alles andere liest daraus. Heute stehen die Adressen an 83 Stellen verteilt.
- Umzustellen: `canonical`, Open Graph, `manifest.webmanifest`, `landing.html`, `terms.html`, `design/twa-manifest.json`, `public/.well-known/assetlinks.json`, Worker (`webpush.mjs`, VAPID-`subject`), Fahrproben und Messwerkzeuge.
- Spielserver: `wss://duell.grandgambit.win/ws` → `wss://duell.gambitrise.com/ws`. **Erst umstellen, wenn die neue Route steht** (Schritt 3), sonst ist das Online-Duell tot.

## Schritt 3 — Was nur der Besitzer kann (Cloudflare)
1. **gambitrise.com in Cloudflare aufnehmen** (Nameserver umstellen).
2. **Pages:** gambitrise.com als eigene Domain zum Projekt hinzufügen.
3. **Worker `gg-hall`:** Route `duell.gambitrise.com/*` anlegen, DNS-Eintrag dazu.
4. **grandgambit.win behalten** und per Weiterleitungsregel dauerhaft (301) auf gambitrise.com schicken — sonst verlieren alle bestehenden Verweise, Lesezeichen und die Android-App den Boden.

## Schritt 4 — Google Search Console (Besitzer, ich liefere die Vorlagen)
1. Neue Eigenschaft `gambitrise.com` anlegen und bestätigen (DNS-Eintrag).
2. Sitemap der neuen Adresse einreichen.
3. **Adressänderung** von grandgambit.win auf gambitrise.com beantragen. Voraussetzung: beide Eigenschaften bestätigt und die 301-Weiterleitung aktiv.
4. Alte Eigenschaft ein halbes Jahr stehen lassen, damit die Umzugsmeldung wirkt.

## Schritt 5 — Play Store (Besitzer, ich liefere Dateien und Texte)
- **Die Paket-Kennung `win.grandgambit.app` bleibt.** Eine veröffentlichte App kann sie nie wechseln. Sichtbar ist sie fast nirgends.
- Zu ändern: **Name im Store**, Kurz- und Langbeschreibung, Grafiken, Datenschutz- und Impressumslinks auf die neue Adresse.
- **Neuer Build nötig:** die TWA zeigt auf `grandgambit.win`; sie muss auf `gambitrise.com` zeigen. Dazu muss `assetlinks.json` mit **derselben** Paket-Kennung und demselben Fingerabdruck **auf der neuen Domain** liegen.
- Solange die alte Domain weiterleitet, läuft die alte App weiter.

## Reihenfolge
1. Schritt 1 und 2 im Repo (eine Fassung, Adresse hinter einer Konstante, alter Wert bleibt bis zur Umstellung aktiv).
2. Besitzer macht Schritt 3.
3. Ich stelle die Konstante um, deploye, prüfe im Browser: Seite, Manifest, Online-Duell, Benachrichtigungen.
4. Schritt 4 und 5.

## Offen zu entscheiden
- Heißt die Heldenfigur künftig „Gambit" wie das Spiel, oder „der Gambit"?
- Soll `grandgambit.win` dauerhaft weiterleiten (empfohlen) oder auslaufen?
- Soll das GitHub-Repo `grand-gambit` umbenannt werden? (Möglich, aber Pages und Worker hängen daran — dann sind Nacharbeiten an der Verknüpfung nötig.)
