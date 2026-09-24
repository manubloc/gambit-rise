# Offene Punkte (Stand 23.9.2026, nach v1.39.2)

Nach jeder Fassung hier nachführen: erledigte Punkte streichen, neue Besitzerwünsche eintragen.

## Spiel
4. **Aufstellungskarte mit Slider** — Besitzer 17.9.: „für die Aufstellung mit dem Slider brauchen wir so eine Art Kartendesign … erst einen Vorschlag, bevor du irgendwas machst, basierend auf dem, wie es aktuell grob umgesetzt ist, aber mit dem neuen Design." Vorschlag liegt vor: design/vorschlag-aufstellungskarten-2026-09-23.png — wartet auf Freigabe. (Die vierte Schwierigkeit „sehr schwer" ist seit v1.48.0 da.)
5. ~~Fremde Monster: Leiter schreibgeschützt~~ — erledigt v1.50.0.
6. ~~Dunkles Stationsfenster~~ — erledigt v1.49.0.
7. **Freistellung einzelner Monsterbilder** (u. a. boss-b22, boss-b25, boss-b14) — der Besitzer nennt Nummern aus `/mnt/user-data/outputs/fal-originale.html`.
8. **Bezahlschranke:** gratis bis Kapitel III (Entscheid 22.9.), im Code noch nicht gebaut.

## Umbenennung und Domain (Auftrag 23.9.)
9. **Umzug auf gambitrise.com — Cloudflare und Code sind fertig (v1.41.x).** gambitrise.com und duell.gambitrise.com sind aktiv, die alten Adressen laufen parallel weiter. Wortmarke und Vorschaubild sind neu. OFFEN: (a) Google Search Console — neue Eigenschaft anlegen und bestätigen, dafür muss der Besitzer im Browser bei Google angemeldet sein; (b) Play Console — Name, Beschreibungen, Grafiken, Links, danach neuer Build mit neuem Host; (c) Entscheidung, ob gambitrise.com bis zum Ablauf weiterleitet. (alt:) Im Code ist alles vorbereitet: `tools/domain-umstellen.mjs` stellt 42 Stellen in 22 Dateien in einem Zug um. Erst laufen lassen, wenn Pages-Domain und Worker-Route `duell.gambitrise.com` stehen. Danach: Play-Store-Build mit neuem Host, `assetlinks.json` auf der neuen Domain, Search-Console-Eigenschaft. Die alte Domain läuft aus (Besitzerentscheid) — solange sie lebt, sollte sie weiterleiten, sonst brechen die installierte App und alle Verweise mit ihrem Ablauf.
10. **GitHub-Repo umbenennen** auf `gambit-rise` — muss der Besitzer tun, mein Zugriffsschlüssel hat keine Verwaltungsrechte. Danach `git remote set-url` in der Arbeitskopie.
11. (alt) Alles auf **gambitrise.com** umstellen, Spiel und Inhalte heißen nur noch **Gambit** (nicht mehr Grand Gambit). Plan steht: `design/UMBENENNUNG-GAMBIT.md`. Wartet auf drei Entscheidungen (Name der Heldenfigur, Weiterleitung der alten Domain, Umbenennung des Repos) und auf die Cloudflare-Schritte des Besitzers.

## Play Console (Stand 23.9.)
- Erledigt: App angelegt (com.gambitrise.app), Store-Texte, Datenschutzlink, Werbung, Werbe-ID, Behörden-App, Zielgruppe 13+, Finanz- und Gesundheitsfunktionen, Anmeldedaten (Gastzugang → nicht zugangsbeschränkt).
- Altersfreigaben: vollständig ausgefüllt — Besitzer drückt „Speichern" und bestätigt die Zusammenfassung.
- Datensicherheit: Antwortbogen in design/PLAYSTORE.md (aus dem Code erhoben). Noch einzutragen.
- Uploads (nur Besitzer): App-Symbol design/playstore-icon-512.png, Feature-Grafik, Screenshots, später das Paket.
- Paket bauen (PWABuilder aus https://gambitrise.com/spielen/), Fingerabdrücke in public/.well-known/assetlinks.json.
- Bei Vollversion: im Altersfragebogen „digitale Käufe" auf Ja.

## Erledigt (zur Nachverfolgung)
- Bezahlschranke: gratis bis Kapitel III, danach nur mit profile.voll (v1.47.0).
- Gastzugang mit eingefrorenem Schaustand (v1.46.0).
- Hofwert ohne Knopf-Optik und näher am Brett, Zugmeldung oben mittig zwischen Zurück und Aufgeben, Brett in Kapitel I und II auf gleicher Höhe (v1.40.0).
- Umbenennung auf „Gambit" in 177 Stellen (v1.40.0).
- Felder aller Kapitel: ganze Kachel mit Rand, quadratisch eingepasst (v1.39.2).
- Abgeschnittene Köpfe der gegnerischen Reihe: gemessen 27 px Luft, erledigt mit v1.39.0.
- Hofwert des Gegners wird nicht mehr verdeckt (v1.39.0).
- Fähigkeiten doppelt im Gefecht (v1.38.0).
