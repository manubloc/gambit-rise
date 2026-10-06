# Figuren-Umbau (Besitzerauftrag 6.10.2026) — Plan, Entscheidungen, Fortschritt

**Diese Datei ist der Faden für die Arbeit.** Wer mitten im Umbau neu einsteigt
(auch nach einem Kontextwechsel), liest sie zuerst. Gearbeitet wird auf dem Zweig
`figuren-umbau`; `main` bleibt auslieferbar, bis die ganze eiserne Kette grün ist.

## Auftrag (Besitzer, 6.10., wörtlich zusammengefasst)

- „Freigabe für alle Figuren … alle genau so behalten“ (Osric: Band/Sockel zu groß → Normalsockel).
- In die Kapitel einbauen: **die meisten Figuren in Kapitel I und II**, danach je Kapitel weniger
  und „böser“. **Keine Bestien vor Kapitel III.** Der Drache deutlich später.
- Saubere Züge, HP, Stärke, passende Fähigkeiten für alle neuen Figuren; ausgiebig testen;
  das Grundspiel muss ausgeglichen bleiben; verschiedene Aufstellungen gegen verschiedene Gegner.
- Bünde früh, ab Besitz/Aufstellung statt Höchststufe; Bund im Figuren-Popup bei den Fähigkeiten.
- Flaggenträger komplett weg. Nachtwächter in die Nachtwache. Doppelritter weg.
- Großmeister sind im Ursprung FIGUREN; die alten Großmeister-Bilder werden Bestien (neue Namen).
- Sturm (Amazone, Warlock) extrem spät; Schlinger sehr spät.
- Drache auf der KARTE größer (Brett bleibt), Band auf der Karte richten.
- Am Ende: saubere Übersicht mit Figuren, Zügen, Fähigkeiten.

## Gemessene Befunde vor dem Bau (6.10.)

1. **Die zehn Bünde wirken im echten Spiel gar nicht.** `core/rules/buende.js` sucht Figuren über
   `p.charId`; weder die Heeres-Specs (`meta/leveling.js`) noch `makePiece` setzen das Feld. Die
   Proben sind grün, weil sie `charId` von Hand setzen. → wird im Fundament behoben.
2. Bünde gelten nicht je Seite (`state.buende` ist eine flache Liste).
3. `codec.js` verliert `buende` und die Einmal-Merker beim Pausieren.
4. Gezeiten kann für den Kapitän nicht wirken (er zieht über `moveSpec`, nicht über `slide`).
5. `VALUE.SE` und `FAMILY_BY_KIND.SE` fehlen (Seherin zählt für die KI 0).

## Entscheidungen

### Neue Spielerfiguren (24) — id, Art-Kürzel, Bund
| Bund | Figuren (id / KIND) |
|---|---|
| dorf | farmwife Bäuerin FW · beggar Bettler BG · jester Hofnarr JE |
| werkstatt | smith Schmied SM · craftsman Handwerker CR |
| kontor | scholar Gelehrter SL · taxman Steuereintreiber TX · banker Bankier BK |
| kueche | butcher Metzger BU · cook Koch CK · miller Müller ML |
| kloster | monk Mönch MK · healer Heilerin HL |
| jagd | huntress Jägerin HU · ranger Waldläufer RG · trapper Fallensteller TR |
| turnier | cavalier Ritter CV · fencer Fechter FN · spearman Lanzenträger SP · gladiator Gladiator GL |
| finsternis | executioner Henker EX · samurai Samurai SA · jailer Kerkermeister JL |
| nachtwache (alt) | alchemist, bard, **watchman Nachtwächter NW** (statt standard) |

`standard` (F) wird entfernt; wer ihn besitzt, bekommt `watchman` (Stufe, Sterne, Siege wandern mit;
gelernte Fähigkeiten werden erstattet).

### Bünde: Regel „ab Aufstellung“
- Ein Bund wirkt, sobald ALLE seine Figuren in der gespielten Aufstellung stehen (Stufe egal).
- Bünde gelten je Seite; der Gegner bekommt (vorerst) keine.
- Freigabe „bünde“: erst ab der ersten geworbenen Figur (sonst wäre Geleit in Partie 1 wach).
- Gaben der neuen Bünde (je ein Satz):
  - dorf: Jeder eigene Bauer, der die Partie überlebt, bringt 2 Gold. (Auszahlung, kein Kern)
  - werkstatt: Eine Sperre je Partie ist gratis. (Setzphase, kein Kern)
  - kontor: Jeder Sieg bringt ein Viertel mehr Gold. (Auszahlung)
  - kueche: Alle drei starten mit einem Leben mehr. (HP; `bundAufbau` in createGame)
  - kloster: Bauern neben Mönch oder Heilerin nehmen 1 Schaden weniger. (HP; soak)
  - jagd: Wer eine der drei schlägt, ist einen Zug gefesselt. (HP; fesselBis am Angreifer)
  - turnier: Die vier treffen mit +1 Angriff. (HP; `bundAufbau`)
  - finsternis: Was einer der drei schlägt, steht nicht wieder auf (kein Unsterblich, kein
    Geistwandel, keine Sturm-Rückkehr). (HP)

### Neue Fähigkeiten (passiv, Art „gold“, kein Kern-Effekt, Auszahlung in rewards.js)
- `almosen` (Bettler, geschenkt ab Stufe 1): 1 Gold je eigenem Zug, Deckel 20/30/40 je Partie
  (Stufe I–III), bleibt auch bei Niederlage.
- `zins` (Bankier): +10/20/30 % Gold bei Sieg.
- `zehnt` (Steuereintreiber): +4/8/12 Gold bei Sieg (mal Kapitel-Faktor).
- `studium` (Gelehrter): +15/30/45 % Erfahrung (→ schneller Fähigkeitspunkte).

### Großmeister (LEAGUE_BOSSES neu, 14) und Kapitelmeister
| Kap. | id | Name | Stufe |
|---|---|---|---|
| I | b26 | Zahir, der Pfauenfürst | unberührt |
| II | b27 | Corvan, der Schwarze Ritter | unberührt |
| III | b24 | Malrik, der Seuchenkönig (bleibt, neuer Name) | — |
| IV | b28 | Isolde, die Dornenkönigin | unberührt |
| V | b29 | Halvar, der Gezeitenkönig | unberührt |
| VI | b30 | Seraphine, die Maskenfürstin | gezeichnet |
| VII | b31 | Yorrik, der Winterkönig | gezeichnet |
| VIII | b32 | Cassian, der Intrigant | gezeichnet |
| IX | b33 | Veyl, der Schattenfürst | gezeichnet |
| X | b34 | Brakk, der Koloss | verdorben |
| XI | b35 | Asra, die Erzfeindin | verdorben |
| XII | b36 | Osric, der Großmeister | verdorben |
| Mitte VI | b37 | Morwen, die Rabenmutter | ohne Kapitel |
| Mitte IX | b38 | Thalor, der Hüter | ohne Kapitel |

- Alte Großmeister werden **Bestien** (ohne Aura): b12 Richter, b08 Kanonier, b16 Blutmagd,
  b17 Lanzenmeister, b18 Eisenfaust (Namen bleiben); umbenannt: b19 → Der Hornschatten,
  b20 → Der Waldschrat, b14 → Der Rissbrocken, b23 → Der Strahlengötze, b25 → Der Steinkönig.
- **b10 Doppelritter wird entfernt** (Wanderung: Erstattung, Aufstellungen bereinigt).
- Neue Bestien: b39 Schlinger, b40 Weberin, b41 Harpyie, b42 Grabhüter, b43 Donnerkrähe.
- Wer ein Kapitel schon gewonnen hat, behält den alten Meister als Bestie (→ `bribedBosses`)
  und bekommt den neuen Großmeister dazu (Trophäen sind stellungsbezogen).
- Der Drache: Figur, Station „Drachenhalle“ in Kapitel VII (die Brutmutter zwei Schritte davor).
- Nie bestechlich: b35 Asra, b36 Osric (vorher b23/b25).

### Figuren je Kapitel (44 Figurenstationen)
| Kap. | Figuren |
|---|---|
| I (10) | mage, paladin, farmwife, beggar, jester, smith, craftsman, scholar, taxman, banker |
| II (10) | hawk, bard, butcher, cook, miller, monk, healer, huntress, ranger, trapper |
| III (5) | alchemist, watchman, fencer, cavalier, spearman |
| IV (4) | sorceress, pathfinder, gladiator, guardian |
| V (3) | executioner, jailer, engineer |
| VI (3) | assassin, captain (Nebenast, Pflicht), samurai |
| VII (2) | dragon (Drachenhalle), strategist |
| VIII (2) | inquisitor, archbishop |
| IX (1) | chancellor |
| X (1) | seeress?? → siehe unten |
| XI (1) | warlock |
| XII (2) | amazon, seeress |
(X bekommt den Kanzler, IX den Erzbischof, VIII Inquisitor + Stratege, VII Drache + Techniker —
die endgültige Verteilung steht im Generator `tools/build-campaign12.mjs`, Tabelle FIGUREN.)

### Bestien je Kapitel (erst ab III; 28 Stück, jede mit eigener Station im ersten Durchlauf)
III b02 b04 b01 · IV b09 b12 · V b22 b40 b42 · VI b21 b16 b41 (+ Morwen) · VII b15 b03 b17 ·
VIII b06 b18 b13 · IX b08 b19 b43 (+ Thalor) · X b05 b20 b14 · XI b07 b23 b39 · XII b11 b25.
Das „Erwachen“ (erste HP-Station, Kapitel II) bekommt eine Figur statt des Hetzers.

## Bilder (Scratchpad dieser Sitzung, freigegeben am 6.10.)
`S=/tmp/claude-0/-home-claude-gambit-rise/e7487664-782c-5bb5-a7fa-16ebc0bb45a1/scratchpad`
- Figuren 576 px: siehe Tabelle `QUELLEN` in `tools/figuren-einbau.py` (wird mit dem Einbau angelegt).
- Kulissen 832×1248: `$S/kulissen/<bund>-1.png` (8 Bünde), `$S/kulissen/m/<meister>-1.png` (8).

## Fortschritt (abhaken!)
- [ ] S1 Fundament: charId an den Figuren, Bünde je Seite, Regel „ab Aufstellung“, Freigabe, codec, Gezeiten
- [ ] S2 Figuren: Arten/Werte/Zugbilder/Leitern, Fähigkeiten (4 neue), Bilder, Glyphen, Listen, standard raus
- [ ] S2b Bünde: 8 neue (Inhalt, Kern, Kulissen, Zeichen), Nachtwache neu
- [ ] S3 Bosse: 18 neue Einträge, Umbenennungen, Klassen, b10 raus, Bilder, Kulissen, Stimmen, Chronik
- [ ] S4 Kampagne: Generator (Figuren-/Bestientabellen), Neubau, Drachenhalle
- [ ] S5 Wanderung alter Spielstände + Schutz gegen unbekannte ids
- [ ] S6 Auszahlung (Gold/Erfahrung), Bund-Zeile im Blatt, Drache auf der Karte
- [ ] S7 Balance messen (tools/balance.mjs reif), STAERKE eintragen, nachstellen
- [ ] S8 Proben, eiserne Kette, Reinraum, CLAUDE.md, Changelog, Version, Push, Live-Abnahme
- [ ] S9 Übersicht für den Besitzer (Figuren, Züge, Fähigkeiten)
