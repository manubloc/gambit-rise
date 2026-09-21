> **Stand v1.27.3 — so wird heute ausgerollt:** der Worker `gg-hall` ist in
> Cloudflare mit dem GitHub-Repository verbunden (Workers Builds). **Jeder Push
> auf `main` rollt ihn automatisch aus** — die Handschritte unten braucht es
> nur noch fuer eine Neueinrichtung. (Im Changelog zu v1.27.2 stand faelschlich,
> er muesse von Hand ausgerollt werden; nachgesehen im Dashboard: die Fassung
> v1.27.2 war 25 Minuten nach dem Push live, und /name-frei antwortete.)

# Multiplayer live schalten — Cloudflare Durable Objects (0 € Fixkosten)

Der Spielserver ist als Cloudflare Worker mit einem SQLite-Durable-Object
("Hall") portiert: WebSocket-Hibernation (kostet im Leerlauf nichts),
Spieler/Ratings/Vault in eingebautem SQLite, überlebt Deploys und Schlaf.
SQLite-DOs laufen im **Workers Free Plan**.

## Deploy (5 Minuten)
    cd worker
    npx wrangler login          # einmalig, öffnet den Browser
    npx wrangler deploy

Die Ausgabe zeigt die URL, z. B. `https://gg-hall.<dein-subaccount>.workers.dev`.

## Spiel verbinden
In `src/app/config.js`:

    export const SERVER_URL = "wss://gg-hall.<dein-subaccount>.workers.dev/ws";

Committen → Cloudflare Pages deployt → der Online-Tab verbindet sich.

## Optional
* **Eigene Domain:** Worker → Settings → Domains & Routes →
  `pvp.grandgambit.win` hinzufügen, dann `SERVER_URL` entsprechend.
* **Admin-Kommandos** (stats/dump über die Online-Konsole):
      npx wrangler secret put ADMIN_TOKEN     # ≥ 24 Zeichen!
* **Health-Check:** `https://…workers.dev/health` → `{"ok":true,"online":n}`

## Was gleich blieb
Das Protokoll ist 1:1 das des alten Node-Servers (`server/server.mjs` bleibt
als Referenz liegen) — Client und Online-Screen brauchten keine Änderung.
Matchmaking-Bänder, Elo (K=32), Rematch-Fenster (2 min, Seitenwechsel),
Vault (5 Snapshots), Freunde/Geschenke/Privatsphäre: alles identisch, jetzt
mit 29 eigenen Protokoll-Tests (`node test_worker.mjs`).

## Web-Push (Fernpartien)
Der Worker erzeugt sein VAPID-Schluesselpaar SELBST beim ersten Start und
legt es in seinen eigenen Speicher — kein Secret, kein Dashboard-Schritt,
nichts geht bei einem Redeploy verloren. Der oeffentliche Schluessel reist im
`welcome` zum Browser; die Glocke in der Online-Lobby abonniert damit.

* Zug gegen geschlossene App → verschluesselte Nachricht (RFC 8291) an alle
  registrierten Geraete des Spielers (max. 5, aelteste faellt raus)
* 24 h vor Fristablauf erinnert ein Durable-Object-Alarm den Saeumigen —
  der Hall weckt sich dafuer selbst, auch wenn niemand verbunden ist
* Tote Postfaecher (410/404) werden automatisch vergessen
* Protokoll: `push:subscribe` / `push:off`; Texte de/en je nach `hello.lang`
