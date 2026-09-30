# Ausgemustert in v1.90.18 (Audit A68)

**`deploy-pages.mjs`** (vorher `scripts/`, Aufruf `npm run deploy:site`):
baute das Spiel und schob `dist/` per `git push --force` in ein GitHub-Pages-
Repo — mit dem Token in der Push-Adresse und in einer curl-Befehlszeile (sichtbar
in der Prozessliste). Seit dem Umzug auf Cloudflare Pages ist der Push auf `main`
der Deploy; das Skript brauchte niemand mehr, es konnte aber mit gesetztem
`GH_TOKEN`/`SITE_REPO` jederzeit ein fremdes Repo überschreiben. Der npm-Befehl
`deploy:site` ist gestrichen; die Datei liegt hier nur noch zum Nachlesen.

**`server.mjs`** (vorher `server/`) **und `test_net.mjs`** (Audit A60): der alte
Node-Mehrspielerserver aus der Zeit vor Cloudflare. Live läuft seit Monaten die
Halle als Worker (`worker/src/logic.mjs`, „a faithful port of server/server.mjs"),
und `test_worker.mjs` prüft deren Protokoll vollständig (Freundschaft, Taube,
Tresor, Herausforderung, Relais, Aufgeben mit Wertung, Rangliste, Revanche,
Warteschlange, Abbruch). `test_net.mjs` fuhr dagegen den ALTEN Server — eine
grüne Suite über Code, der nirgends läuft; und der alte Server trug noch die
Relais-Lücke, die in der Halle mit A1 geschlossen wurde. Beide sind aus der
Kette und aus dem Baum; die Anleitungen zeigen auf `DEPLOY-WORKER.md`.
