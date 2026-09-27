# Spieltest 27.9.2026 — „komplett fehlerfrei spielbar"

**Auftrag (Besitzer, Sprachnachricht 27.9.):** *„… testen, dass es komplett
fehlerfrei spielbar ist … bediene das Menü, versuch verschiedene
Aufstellungen … Funktionieren auch die unterschiedlichen Aufstellungen beim
Gegner in welchen Kapiteln?"*

**Wie getestet wurde:** eine Werkstatt aus sieben Fahrern (je ein Szenario,
Playwright gegen den gebauten Stand unter `dist/` bzw. reines Node gegen
`src/`), jeder Fund von zwei Nachfahrern gegengeprüft. Gefahren wurde der
**Bau v1.87.0** (`dist/version.json`, gebaut 17:48); der Quelltext stand
währenddessen schon auf v1.89.0–v1.89.4. Darum trägt jeder Fund unten den
Vermerk, ob er im Bau, im Quelltext oder in beiden lag — und was daraus
wurde. Rohdaten (Skripte, Logs, 300+ Schirmfotos) lagen unter
`/tmp/claude-0/spieltest/` der Cloud-Sitzung und sind mit ihr fort; das
Fahrskript des Kerns ist als `tools/spieltest-fahrprobe.mjs` eingecheckt.

**Stand beim Schreiben:** fünf der sieben Szenarien fertig (Kern, Schnelles
Spiel, Hofstaat/Aufstellung, Kapitel I–IV, Kapitel V–VIII); **Kapitel IX–XII
und das Restmenü liefen beim Ende der Sitzung noch** und sind hier nicht
enthalten. Die Ergebnisse von Kapitel V–VIII lagen als Rohdaten vor
(`ergebnis-L05s00.json` …), der Fahrer hatte seinen Bericht noch nicht
abgegeben — dort ist nichts Auffälliges protokolliert, aber es fehlt die
Nachprüfung.

## 1. Zahlen

| Szenario | Umfang | Abstürze | Fehlverhalten |
|---|---|---|---|
| Kern (ohne Browser) | **529/529 Stationen**, 2645 Gegner-Aufstellungen aus 5 Spielständen, 872 verschiedene Gegnerreihen; **3174 KI-Gefechte** (1260 Auswahl + 1914 Rest), 177 708 Halbzüge, 2220 Sperren, 728 Umwandlungen; 27 Sonderregel-Prüfungen | 0 | 1 (Fallen) |
| Schnelles Spiel | 14 Proben, 28 Partien (Klassisch, Schach, HP; Gast, Admin, Hotseat), ~192 Klickzüge, Rochade, Umwandlung, Zeitenwender, Sprache, Klang, Zurück-Geste, Neuladen | 0 | 1 (Ereignis-Meldung hängt) + 1 Textfehler |
| Hofstaat & Aufstellung | 12 Proben, 52 Figurenblätter, 13 Stufen gekauft, 6 Fähigkeiten gelernt, 50 Aufstellungs-Setzungen, 10 absichtlich kaputte Aufstellungen, 18 Gefechte aus den Fächern | 0 | 3 (Feier fehlt; dritter Turm; doppelter Held) |
| Kampagne I–IV | 11 Proben, 28 Gefechte, 231 eigene Züge, 4 Siege bis zum Matt, 21 Stationen, ~450 Stationsfenster | **1 (an vier Siegen)** | 1 (kein Tor ins nächste Kapitel) |

Alle Gegner-Aufstellungen aller Kapitel sind damit gebaut und gefahren: ab
Kapitel III rücken Fremde (Sonderfiguren, Monster) auf die freien Plätze,
88 Stationen wechseln ihre Reihe je Versuch, König und Damenplatz bleiben —
genau wie `besetzungsPlan()` es vorhersagt (Teil 1b der Fahrprobe, Kapitel
für Kapitel ausgewertet). Kein einziges Gefecht warf eine Exception, kein
Zustand blieb ohne legalen Zug, keine HP wurde negativ, keine Figur stand
auf einem Loch.

## 2. Bestätigte Funde und was aus ihnen wurde

| # | Fund | Wo gemessen | Ursache (Datei) | Stand |
|---|---|---|---|---|
| S1 | **Absturz nach jedem Sieg an einer Boss-/Meister-Station** („profile is not defined", Fehlerschirm, Sieg verloren, keine Rekrutierung) | Bau v1.87.0, Kampagne P8/P9 | `GameScreen.jsx`: `ResultBanner` nutzte `profile`, bekam es nie (Audit A4) | **behoben v1.89.0** |
| S2 | **Nach dem Meister kein Weg ins nächste Kapitel** — kein Knopf „Weiter — Kapitel II", Weltkarte mit Schlössern, Hub sagt „Nächster Halt: Der letzte Steg" | Bau und Quelltext, Kampagne P10; nachgemessen | `CampaignScreen.jsx`: Tor hing an `nodeStatus(profile, "n22")`, einer Kennung des alten 51-Knoten-Graphen; `nodeStatus` lieferte „hidden" | **behoben v1.89.5** — gemessen: Knopf da, Tipp führt in Kapitel II |
| S3 | **Aufstiegsfeier erscheint nie** (weder Rangsprung des Gambit noch „Erlernen") | Bau und Quelltext, Aufstellung P02b; nachgemessen | `ArmyScreen.jsx`: `setFeier` gesetzt, `AufstiegsFeier` nirgends gerendert — seit v1.0.75 | **behoben v1.89.5** — gemessen: Fenster „STUFE ERREICHT" / „NEUE FÄHIGKEIT" |
| S4 | **Fallen (Spitzgrube, Bärenfalle) lösen nie aus** — 0 von 3174 Gefechten, obwohl 2220 Mal gelegt | Kern, Sonderregel 3 | `src/core/sim/transitions.js:6` importiert `loeseFalleAus`, ruft es nie auf (Audit A32) | **offen — Besitzerentscheid** (Regeländerung; CLAUDE.md führte es fälschlich als erledigt, berichtigt) |
| S5 | **Ereignis-Meldung bleibt hängen** („Läufer gefallen" noch nach 8 s, im Aufgeben-Banner und zu Beginn der neuen Partie) | Bau v1.87.0, Schnell p13 | `GameScreen.jsx`: Effekt räumte beide Timer, `setEreignis(null)` fehlte bei leerem Text | **behoben v1.89.0** |
| S6 | Dritter Turm wählbar und als gültig gespeichert; doppelter Held wählbar | Bau v1.87.0, Aufstellung P03 | `ArmyScreen.jsx` Slider ohne Zweiergrenze | **behoben v1.89.0** (`hoechstzahl()`), gegen v1.89.1 nachgemessen: 0 Funde |
| S7 | Rückblick auf frühere Kapitel stürzt ab | Audit A3 (Spieltest erreichte den Zweig nicht) | `CampaignScreen.jsx`: `paintedById` nicht importiert | **behoben v1.89.0** |
| S8 | Reglerbeschriftung „Musik"/„Soundeffekte" bleibt im englischen Profil deutsch | Schnell p08 | `ProfileScreen.jsx`, fest verdrahtet | offen (klein) |
| S9 | Hub bei 100 % eines Kapitels: „Nächster Halt: Der letzte Steg" (Rückfall von `currentNodeId` auf die letzte Station von Kapitel XII) | Kampagne P10 | `src/meta/campaign.js` `currentNodeId` | offen (klein; mit dem Tor aus S2 nur noch bis zum Tipp sichtbar) |

## 3. Beobachtungen ohne Fehlerwert (Design, kein Fund)

- Im Gefecht ist die Reiterleiste auf dem Telefon ausgeblendet — Sprache
  oder Reiter mitten im Spiel wechseln geht nur über Aufgeben (Absicht seit
  dem Immersiv-Layout).
- Zeitenwender gibt es im Schnellen Spiel nur im HP-Gefecht (Klassisch und
  Schach laufen mit `rules=chess`) — Absicht.
- Die Lehr-Hinweise („Verstanden") liegen als Glasfenster über allem, auch
  über einem geöffneten Figurenblatt, bis man tippt.
- Ein Aufstellungs-Fach lässt sich nicht löschen, nur zurückbauen; leerer
  Name fällt auf „Aufstellung I–III" zurück.
- Zieht der Drache von links nach rechts um, wird der geräumte Platz 0 ein
  Springer, nicht wieder der Turm.
- Die Zurück-Geste im Gefecht pausiert stumm (ohne die Rückfrage des
  Knopfes) — konsistent, Zustand bleibt erhalten.
- „Krönung!" erscheint nicht, wenn im selben Zug geschlagen wurde
  („Turm gefallen" hat Vorrang).
- Gegner-Aufstellung im **Schnellen Spiel** hängt an Stufe und Saat
  (`buildAiArmyForMap`), nicht am Kapitel; in der **Kampagne** ab Kapitel III
  an Codex-Begegnungen und Versuchszähler.

## 4. Was noch aussteht

- Kapitel IX–XII (Drache, Bestien im eigenen Heer, Kapitelintro, Stand nach
  dem letzten Sieg, Rotation/Gate-Stationen) und das Restmenü (Anmeldung,
  Profil-Einstellungen, Akademie, Online-Duell offline, Schaukammer,
  Tablet/Desktop-Breiten) — die Fahrer liefen beim Ende der Sitzung noch.
  Wer es nachholt: `tools/pruefe-navigation.mjs` fährt das Haus,
  `tools/spieltest-fahrprobe.mjs` den Kern; Browser-Szenarien mit
  Playwright nach dem Muster in `CLAUDE.md` (Live-Messung).
- Der Sieg an einer Meister-Station bis zum Kapitelwechsel im Browser
  (P9) konnte im Bau v1.87.0 wegen S1 nicht zu Ende gefahren werden; im
  Quelltext ist S1 behoben und das Tor (S2) nachgemessen — die Kette
  Sieg → Banner → Karte → Tor als Ganzes ist noch nicht in einem Lauf
  gemessen.
