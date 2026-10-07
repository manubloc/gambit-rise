# Fähigkeiten, die auch im Schach wirken (v1.94.0, 7.10.2026)

## Auftrag des Besitzers

> „Die Fähigkeiten, die eine Figur individuell für sich hat, sollten immer als erste
> kommen … und keine Bezüge auf HP oder Gesundheit haben, weil man hat ja noch gar
> keine HP-Kämpfe.“

> „Die erste Fähigkeit kann man ab Stufe 1 mit einem Skillpunkt erlernen. … Nur die
> dritte oder vierte darf eine reine HP-Fähigkeit sein. Wenn eine Figur nur zwei
> Fähigkeiten hat, dann hat diese keine reine HP-Fähigkeit.“ — alle 19 auf einmal,
> der Gegner nutzt sie von Anfang an.

## Gemessen vor dem Umbau

- Kapitel I: 45 Schach-Stationen, 0 HP. Kapitel II: 27 Schach, 15 HP.
- Von den 19 Figuren der Kapitel I/II begannen 13 mit einer Fähigkeit, die unter
  Schachregeln verborgen ist. Die Bäuerin trug vier – keine wirkte im Schach.
- **Der Heeresbau gab im Schach gar nichts Gelerntes aufs Brett** (`chosenOf = null`
  bei Stufe 1): auch Zins, Zehnt und Studium zahlten nach einer Schach-Station nie aus,
  und kein gelerntes Zugtalent der sechs Schachfiguren zog je mit.

## Was jetzt gilt

1. **Leiterregel** (test_zugbilder, Abschnitt 7): Sprosse 1 und 2 jeder Figur wirken im
   Schach (`wirktImSchach`); zwei Sprossen heißt keine reine HP; Sonderfiguren lernen die
   erste Sprosse auf Stufe 1 (zwei Sprossen 1/5, drei 1/4/7, vier 1/3/6/9).
2. **Im Schach der Kampagne trägt das Heer, was gelernt ist und ohne Lebenspunkte
   auskommt** (`buildArmyForMap(…, schachKunst)`). Die Stärke bleibt Stufe 1. Klassisch,
   Online-Schach und Fernpartie sind unverändert.
3. **Der Gegner** baut im Schach wie bisher auf Stufe 1 mit der ganzen Leiter bis Stufe 1 –
   das ist jetzt die erste Kunst jeder Sonderfigur.
4. **Die sechs Schachfiguren behalten ihre Stufen** (erste Sprosse auf 3). Abweichung von
   „ab Stufe 1“, bewusst: sonst trüge jeder gegnerische Springer der ersten Stationen den
   Weitsprung, und Kapitel I wäre vom ersten Zug an kein Schach mehr.

## Die fünfzehn neuen Fähigkeiten

| Kennung | Name | Wirkung | Art |
|---|---|---|---|
| feldarbeit | Feldarbeit | schiebt einen eigenen Bauern daneben ein Feld vor | Zauber |
| platztausch | Platztausch | tauscht mit einer eigenen Figur (nicht König) | Zauber |
| deckung | Deckung | tauscht mit dem eigenen König in ≤ 2 Feldern | Zauber |
| standhieb | Standhieb | schlägt einen Nachbarn, ohne das Feld zu verlassen | Zauber |
| zaunbau | Zaunbau | stellt einen Zaun auf ein freies Nachbarfeld | Zauber |
| lanzengang | Lanzengang | 2–3 Felder gerade, freie Bahn, Schlag am Ende (II: 2×) | Zauber |
| faehrte | Fährte | bis 3 Felder gerade, durch eigene Figuren (II: 2×) | Zauber |
| wegstoss | Wegstoßen | stößt einen gegnerischen Nachbarn ein Feld weg | Zauber |
| heimkehr | Heimkehr | auf ein freies Feld der eigenen Grundreihe (II: 2×) | Zauber |
| pirsch | Pirsch | einmal wie ein Springer (II: 2×) | Zauber |
| uebersprung | Übersprung | über einen Nachbarn auf das Feld dahinter (II: 2×) | Zauber |
| fessel | Fessel | Gegner in ≤ 2 Feldern setzt einen Zug aus | Zauber |
| lazarett | Lazarett | ein geschlagener eigener Bauer kehrt zurück | Zauber |
| schlachtbank | Schlachtbank | nach einem Schlag bleibt auf dem verlassenen Feld ein Zaun | dauerhaft |
| mahlgeld | Mahlgeld | 2/3/4 Gold je geschlagenem gegnerischen Bauern | dauerhaft |

Drei Regeln für alle Zauber (rules/moves.js): keine zielt im Schach auf den König
(`weitsprung`-Bremse bzw. König ausgenommen), keine fasst den großen Drachen an, kein Bauer
landet durch fremde Hand auf seiner Krönungsreihe. Der Kern prüft die Lage selbst
(transitions.js) – im Duell kommt der Befehl vom Gegner.

## Gegenüber dem ersten Vorschlag geändert (und warum)

Fünf der vorgeschlagenen Fähigkeiten waren REAKTIONEN (nicht schlagbar, Rückschlag, Lauer,
Asyl, Extrazug). Sie hätten in die Schachprüfung und in die Zugfolge eingegriffen (ein Zug
außer der Reihe, ein Feld, das der Gegner nicht schlagen darf) und wären im verdeckten
Zustand nicht zu sehen. Gebaut sind dafür ZÜGE mit derselben Idee: Schmied → Standhieb,
Paladin → Deckung (tauscht mit dem König), Jägerin → Pirsch, Mönch → Heimkehr, Koch →
Wegstoßen, Ritter → Lanzengang.

## Die Leitern (Stufe in Klammern, „·HP“ = wirkt nur mit Lebenspunkten)

| Figur | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Bauer | Ausweichen (3) | Sturmlauf (5) | Stoßschlag (6) | Frühe Krönung (8) |
| Gambit | Sturmlauf (1) | Stoßschlag (2) | Ausweichen (3) | Maskerade (8) | Frühe Krönung (9) |
| Springer | Weitsprung (3) | Vorreiter (6) |
| Läufer | Phase (3) | Wachschritt (6) |
| Turm | Sturmschritt (3) | Durchbruch (6) |
| Dame | Hofsprung (3) | Blinzeln (4) | Scharfschuss (5) ·HP |
| König | Königsflucht (2) | Blinzeln (3) | Bollwerk (4) ·HP | Regeneration (5) ·HP |
| Erzbischof | Phase (3) | Wachschritt (6) |
| Kanzler | Sturmschritt (3) | Durchbruch (6) |
| Späher | Übersprung (1) | Blinzeln (5) |
| Amazone | Blinzeln (1) | Übersprung (5) |
| Kapitän | Übersprung (1) | Wegstoßen (4) | Scharfschuss (7) ·HP |
| Attentäter | Blinzeln (1) | Pirsch (3) | Lebensraub (6) ·HP | Scharfschuss (9) ·HP |
| Schildträger | Deckung (1) | Blinzeln (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |
| Drache | Fliegen (3) |
| Magier | Blinzeln (1) | Übersprung (3) | Scharfschuss (6) ·HP | Schockwelle (9) ·HP |
| Hexerin | Blinzeln (1) | Platztausch (4) | Scharfschuss (7) ·HP |
| Vesna, die Seherin | Blinzeln (1) | Heimkehr (5) |
| Alchemist | Lazarett (1) | Blinzeln (3) | Regeneration (6) ·HP | Lebensraub (9) ·HP |
| Warlock | Blinzeln (1) | Fessel (3) | Lebensraub (6) ·HP | Scharfschuss (9) ·HP |
| Paladin | Deckung (1) | Blinzeln (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |
| Inquisitor | Fessel (1) | Standhieb (3) | Scharfschuss (6) ·HP | Bollwerk (9) ·HP |
| Barde | Platztausch (1) | Blinzeln (4) | Regeneration (7) ·HP |
| Techniker | Zaunbau (1) | Blinzeln (3) | Scharfschuss (6) ·HP | Bollwerk (9) ·HP |
| Stratege | Blinzeln (1) | Platztausch (4) | Scharfschuss (7) ·HP |
| Kundschafter | Fährte (1) | Blinzeln (4) | Regeneration (7) ·HP |
| Bäuerin | Feldarbeit (1) | Heimkehr (3) | Regeneration (6) ·HP | Schockwelle (9) ·HP |
| Bettler | Almosen (1) | Blinzeln (3) | Regeneration (6) ·HP | Bollwerk (9) ·HP |
| Hofnarr | Platztausch (1) | Blinzeln (4) | Schockwelle (7) ·HP |
| Schmied | Standhieb (1) | Blinzeln (3) | Bollwerk (6) ·HP | Schockwelle (9) ·HP |
| Handwerker | Zaunbau (1) | Blinzeln (3) | Scharfschuss (6) ·HP | Bollwerk (9) ·HP |
| Gelehrter | Studium (1) | Blinzeln (3) | Scharfschuss (6) ·HP | Schockwelle (9) ·HP |
| Steuereintreiber | Zehnt (1) | Fessel (3) | Bollwerk (6) ·HP | Lebensraub (9) ·HP |
| Bankier | Zins (1) | Blinzeln (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |
| Metzger | Schlachtbank (1) | Standhieb (4) | Lebensraub (7) ·HP |
| Koch | Wegstoßen (1) | Heimkehr (3) | Regeneration (6) ·HP | Lebensraub (9) ·HP |
| Müller | Mahlgeld (1) | Blinzeln (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |
| Mönch | Heimkehr (1) | Standhieb (5) |
| Heilerin | Lazarett (1) | Blinzeln (4) | Regeneration (7) ·HP |
| Jägerin | Pirsch (1) | Blinzeln (4) | Scharfschuss (7) ·HP |
| Waldläufer | Fährte (1) | Blinzeln (4) | Scharfschuss (7) ·HP |
| Fallensteller | Fessel (1) | Pirsch (3) | Fallenkunde (5) ·HP | Scharfschuss (9) ·HP |
| Ritter | Lanzengang (1) | Wegstoßen (5) |
| Fechter | Lanzengang (1) | Blinzeln (4) | Lebensraub (7) ·HP |
| Lanzenträger | Lanzengang (1) | Wegstoßen (3) | Bollwerk (6) ·HP | Scharfschuss (9) ·HP |
| Gladiator | Standhieb (1) | Wegstoßen (5) |
| Henker | Standhieb (1) | Fessel (4) | Lebensraub (7) ·HP |
| Samurai | Blinzeln (1) | Lanzengang (5) |
| Kerkermeister | Fessel (1) | Wegstoßen (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |
| Nachtwächter | Deckung (1) | Blinzeln (3) | Bollwerk (6) ·HP | Regeneration (9) ·HP |

## Alte Spielstände

`faehigkeitenUmbau` (meta/profile.js, einmalig `campaign.kunst94`): was nicht mehr auf der
Leiter steht oder jetzt eine höhere Stufe verlangt, als die Figur hat, wird verlernt und
erstattet (2 Punkte je Fähigkeit, 3 je weiterer Stufe).

## Offen

- Die KI bewertet Fessel, Zaun und Platztausch nicht eigens; sie wirkt sie, wenn die Suche
  sie findet.
- Stoß, Tausch und Fessel haben noch keine eigene Animation (die Figur stößt kurz vor).
- Im Online-Duell fehlt weiter der Fassungsabgleich: ein Gerät mit älterer Fassung kennt
  die neuen Züge nicht.
