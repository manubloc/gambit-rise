# Gambit Rise — Einstieg für den neuen Chat (Stand 27.9.2026, v1.89.5)

> Dieses Blatt ist für einen **frischen Chat mit Claude** geschrieben, der
> das Repo über den GitHub-Connector oder einen lokalen Klon sieht. Es sagt
> in zehn Minuten, was das Projekt ist, wie gearbeitet wird, wie deployt
> wird und was offen ist. Die ausführliche Fassung mit allen Belegen ist
> `design/UEBERGABE-2026-09-27.md`; die Regeln stehen in `CLAUDE.md`.

## 0. Der Satz, mit dem der Chat beginnt

Manuel kopiert das in die erste Nachricht:

```
Du übernimmst Gambit Rise (Repo manubloc/gambit-rise, Zweig main).
Lies zuerst CLAUDE.md, dann design/CHAT-EINSTIEG-2026-09-27.md, dann
design/UEBERGABE-2026-09-27.md. Antworte auf Deutsch. Jeder Push auf main
geht live. Vor jedem Push die eiserne Kette aus CLAUDE.md. Beginne mit der
Live-Abnahme: /spielen/version.json muss 1.89.5 zeigen.
```

## 1. Wer und wie

- **Besitzer:** Manuel. Diktiert per Sprachnachricht, arbeitet mobil,
  erwartet, dass dichte Aufgabenlisten **selbständig** abgearbeitet werden.
- **Antworten auf Deutsch.** Jede Antwort endet mit der vollständigen Liste
  offener Punkte.
- **Messen statt vermuten.** Sichtbares wird am lebenden DOM gemessen
  (Playwright, `CLAUDE.md` „Live-Messung"), Regeln werden mit Proben belegt.
- **Commits auf Deutsch**, ausführlich, mit der echten Ursache. Autor
  `git -c user.name="Claude" -c user.email="noreply@anthropic.com"`.
- **Nie** Schlüssel, Tokens, Passwörter in Dateien oder Commits. Das Repo
  ist **öffentlich**.
- Generierte Bilder erst zeigen, dann einbauen. Keine Bild-APIs ohne
  Freigabe.

## 2. Das Projekt in zehn Zeilen

Gambit Rise ist ein Fantasy-Schach-RPG als PWA (React 18, Vite 5, reines
ESM, Node 22). Kern: `src/core` (Regeln, Simulation, KI), Meta: `src/meta`
(Profil, Kampagne, Leveling, Spielstände), Inhalte: `src/content`
(Figuren, Fähigkeiten, zwölf Kapitel mit 529 Stationen), App: `src/app`
(Schirme, Theme, i18n DE/EN). Landingpage `public/landing.html` liegt live
unter `/`, die App unter `/spielen/` (kein Passwortriegel mehr seit
v1.88.0). Online-Duelle laufen über den Cloudflare-Worker `worker/`
(gg-hall, `duell.gambitrise.com`), der denselben Kern importiert. Cloud-
Anmeldung über Supabase. Deutsche Begriffe im Spiel (Kapitel, Riss, Halle,
Hofstaat, Meister). Gold gehört allein dem Helden, eigene Bauern grün,
Gegner riss-violett.

## 3. Wo alles steht

| Was | Wo |
|---|---|
| Quellcode | GitHub `manubloc/gambit-rise`, Zweig `main` (öffentlich) |
| Live | <https://gambitrise.com> · App <https://gambitrise.com/spielen/> · Halle `duell.gambitrise.com` |
| Hosting | Cloudflare Pages, Projekt **grand-gambit** (alter Name, Domain zeigt darauf) · Worker **gg-hall** |
| Play Store | Paket `com.gambitrise.app`, **nicht veröffentlicht** — `design/PLAYSTORE-BACKLOG.md` |
| Regeln der Arbeit | `CLAUDE.md` |
| Übergabe mit Belegen | `design/UEBERGABE-2026-09-27.md` (Deploy, Geheimnis-Orte, alles vom 27.9.) |
| Berichte vom 27.9. | `design/AUDIT-2026-09-27.md` (76 Punkte) · `design/SPIELTEST-2026-09-27.md` · `design/FAEHIGKEITEN-2026-09-27.md` |
| Vortag | `design/STAND-2026-09-26.md` (T1–T11) |
| Changelog | `CHANGELOG.md` (jede Fassung mit Ursache) |

## 4. Deploy = Push

1. Eiserne Kette (`CLAUDE.md`): `npm test` (**28 Suiten / 2386 Prüfungen**),
   `npm run build`, `npm run build:app`, `npm run build:single`,
   `node test_boot.mjs`, `node scripts/verify-boot.mjs`,
   `timeout 250 node drive3.mjs`, Reinraum-Klon, `git fetch` +
   Punktprüfung.
2. Version in `package.json` hochzählen, Changelog-Eintrag mit Ursache.
3. `git push origin main`. Cloudflare baut Pages **und** Worker in 2–5 min.
4. Abnahme: `curl -sL -H "Cache-Control: no-cache" https://gambitrise.com/spielen/version.json`.
5. **Nie force-pushen, nie Tags `v*` pushen** (der itch.io-Workflow feuert
   darauf und würde die Landingpage statt des Spiels schicken).

**Lokal nötig:** Node 22, `python3` mit Pillow (`npm test` misst
Sockelfarben im Bild), Chromium für die Browser-Proben
(`npx playwright install chromium`, Pfad der `chrome`-Datei in
`PW_CHROMIUM`). Sonst nichts — kein Token, kein Schlüssel.

**Geheimnisse (nur Orte):** alle in `design/UEBERGABE-2026-09-27.md`,
Abschnitt 2. Kurz: `ADMIN_TOKEN` und die Supabase-Variablen liegen im
Cloudflare-Dashboard und bleiben; `GAMBIT_ZUGANG` darf gelöscht werden;
`BUTLER_API_KEY`/`ITCH_*` nur für itch.io; der Android-Signaturschlüssel
liegt beim Besitzer und **nie** im Repo.

## 5. Was am 27.9. passiert ist (Kurzfassung)

| Fassung | Inhalt |
|---|---|
| 1.87.0 | Landingpage nach Besitzer-Blick |
| 1.88.0 | Passwortriegel vor `/spielen/` fort (sperrte den Besitzer auf dem Handy aus) |
| 1.89.0 | Sechzehn UI-Wünsche (Popups, Aufstellung mit Zweiergrenze, Gefecht, Akademie, Profil) + zwei Render-Abstürze aus dem Audit + Ereignis-Hänger |
| 1.89.1 | Scharfschuss der zehn Sonderfiguren feuerte seit v0.38 nie; Zugbild-Probe als 28. Suite |
| 1.89.2 / 1.89.3 | Hofreihe der Landingpage auf dem Handy (zwei Runden nach Fotos) |
| 1.89.4 | Übergabe nach Prüfung (30 Befunde), Proben laufen lokal (`PW_CHROMIUM`) |
| 1.89.5 | **Tor zum nächsten Kapitel wurde nie gerendert** (alte Kennung `n22`); **Aufstiegsfeier nie gerendert** — beide behoben und gemessen |

## 6. Was offen ist — in dieser Reihenfolge

1. ~~**Live-Abnahme** von v1.89.5~~ — **erledigt 27.9. abends** (Chrome des
   Besitzers): `/spielen/version.json` zeigt 1.89.5, gebaut 20:25 UTC; sechs
   Marker im Live-Bundle gleich dem lokalen Bau; `duell.gambitrise.com/design`
   liefert JSON. Die Wurzel `/version.json` liefert die Landingpage — die
   Adresse in den Blättern war seit v1.42.0 falsch und ist berichtigt.
2. **Abnahme durch Manuel auf dem Handy:** Hofreihe der Landingpage,
   Klang-Knacken (Warmhalter ist eine Hypothese), Leuchtkontur der
   gewählten Talent-Kachel, Schnellkurs-Tafeln, Zugbild-Legenden,
   Profil-Look, Kapitel-Tor und Aufstiegsfeier.
3. **Entscheidung Halle:** das öffentliche Audit nennt die Lücken des
   Workers (A1/A2/A8/A21/A22/A56) mit Zeile. Drei billige Riegel stehen in
   `UEBERGABE` 5c; nicht gebaut, weil der Worker beim Push deployt.
4. **Spieltest zu Ende fahren:** Kapitel IX–XII und Restmenü
   (`SPIELTEST` Abschnitt 4); Kette Sieg → Banner → Tor in einem Lauf.
5. **Besitzerentscheid, nicht gebaut:** Fallen ohne Wirkung (A32), Bünde
   wirken nie (A9), weißer Schirm ohne Ausweg (A5/A45), `trim()` beim
   Anlegen (A6), SQLite der Halle wächst (A7), Rochade aus dem Schach (A14),
   Rest im Audit-Fragebogen. Kleinkram aus dem Spieltest: S8, S9.
6. **Geparkt vom Besitzer:** Info-Knopf in der Aufstellung · Reiter
   „Spielen" → „Hauptmenü" · „Die Karte erzählt die Geschichte" · neue
   Fähigkeiten aus `FAEHIGKEITEN` Abschnitt 4 auswählen.
7. **Store:** `.aab` mit `com.gambitrise.app` außerhalb des Klons bauen,
   Datensicherheit mit Standort, 12 Tester / 14 Tage
   (`design/PLAYSTORE-BACKLOG.md`; Bogen und Anleitung als Artefakte in
   `UEBERGABE` Abschnitt 3).
8. **Technik:** T7 Brett-Zentrierung, T10 Archiv aus der Git-Historie,
   T11 ArmyScreen/GameScreen entflechten, `tools/pruefe-bezeichner.mjs` in
   die Kette, doppelter `position`-Schlüssel in `App.jsx`, Zweig
   `claude/friendly-hypatia-c1ncjt` löschen.

## 7. Die ersten fünf Handgriffe

1. `git log --oneline -5` — beginnt mit `v1.89.5`. Bei bestehendem Klon
   `git fetch --prune`.
2. `npm ci && npm test` — 28 Suiten.
3. `curl -sL https://gambitrise.com/spielen/version.json` — 1.89.5.
4. `CLAUDE.md` und `design/UEBERGABE-2026-09-27.md` lesen.
5. Mit Manuel die Punkte 2 und 3 aus Abschnitt 6 klären, dann arbeiten.
