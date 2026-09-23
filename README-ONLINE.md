# Gambit — Online-Duell einrichten

Das Spiel bringt seinen eigenen Multiplayer-Server mit (`server/server.mjs`).

## Starten (lokal testen)
    npm install          # einmalig (installiert u.a. "ws")
    node server/server.mjs 8787

In der App: **Spielen → Online-Duell → Server-Adresse** `ws://<deine-ip>:8787`

## Im Internet hosten
Jeder Node-Host funktioniert (Railway, Render, fly.io, eigener VPS):
Repo hochladen → Startbefehl `node server/server.mjs` → Port aus `$PORT` wird
automatisch übernommen. In der App dann `wss://deine-app.example.com` eintragen
(hinter HTTPS-Proxys immer `wss://`).

## Was der Server kann
- Konten (Freundescode = deine ID, wird beim ersten Verbinden angelegt)
- Freundesliste: Anfragen senden / annehmen / ablehnen, Online-Status
- Privatsphäre: Herausforderungen von **Allen** oder **nur Freunden**
- Zufalls-Matchmaking nach **Gefolgewert** (Band weitet sich beim Warten)
- Direkte Herausforderungen an Online-Freunde
- Zug-Relay mit Determinismus-Hash (Desync-Erkennung), Aufgabe, Disconnect
- Persistenz in `server/data.json`

## Rangliste & Rematch
- Elo-Wertung (Start 1000, K=32) — Sieg/Niederlage/Remis werden serverseitig
  verrechnet (`rated`-Push mit Delta an beide Spieler)
- `leaderboard` liefert die Top 20 nach Elo plus deinen eigenen Rang
- Nach jedem Duell bleibt das Match 2 Minuten für ein **Rematch** offen —
  fordern beide es an, startet die Revanche mit getauschten Farben
