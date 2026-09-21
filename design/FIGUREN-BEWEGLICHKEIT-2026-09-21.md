# Figuren nach Beweglichkeit — Umverteilung (v1.29.0, vom Besitzer freigegeben)

Regel des Besitzers: 24 Punkte für alle; wer springt, schlägt schwach; wer stark zieht, trägt wenig. Dame und Kapitelmeister ausgenommen.

| Figur | Felder | Leben/Stärke vorher → nachher | Fähigkeiten vorher → nachher | reifes Heer |
|---|---|---|---|---|
| Springer | 8 + springt | 11/13 → **16/8** | 4 → **2** (Weitsprung, Vorreiter) | 53 % |
| Läufer | 13 | 14/10 | 4 → **2** (Phase, Wachschritt) | 60 % |
| Turm | 14 | 18/6 | 4 → **2** (Sturmschritt, Durchbruch) | 54 % |
| Kanzler | 22 + springt | 12/12 → **15/9** | 3 → **2** (Sturmschritt, Durchbruch) | 51 % |
| Erzbischof | 21 + springt | 15/9 → **17/7** | 3 → **2** (Phase, Wachschritt) | 60 % |
| Amazone | 35 + springt | 9/15 → **18/6** | 3 → **2** (Scharfschuss, Blinzeln) — Hofsprung war tot | 55 % |
| Späher | 24 + springt | 9/15 → **15/9** | 3 → **2** (Blinzeln, Scharfschuss) — Vorreiter war tot | 54 % |
| Vesna | 16 | 15/9 → **17/7** | 2 → **2** (Blinzeln, Scharfschuss) | **75 %** |
| Hexerin | springt | 9/15 | 3 (Blinzeln, Scharfschuss, Lebensraub) | 57 % |
| Barde | | 16/8 | 3 (Regeneration, Bollwerk, Blinzeln) | 41 % |
| Kundschafter | | 10/14 | 2 → **3** (+ Bollwerk) | 46 % |
| Stratege | | 14/10 | 2 → **3** (+ Bollwerk) | 40 % |
| Kapitän | | 14/10 | 2 → **3** (+ Bollwerk) | 48 % |
| Magier | | 8/16 | 2 → **4** (+ Schockwelle, Lebensraub) | 53 % |
| Warlock | | 5/19 | 2 → **4** (+ Blinzeln, Schockwelle) | 52 % |
| Inquisitor | | 13/11 | 2 → **4** (+ Lebensraub, Schockwelle) | 50 % |
| Paladin | | 18/6 | 2 → **4** (+ Lebensraub, Blinzeln) | 48 % |
| Alchemist | | 18/6 | 2 → **4** (+ Bollwerk, Scharfschuss) | 46 % |
| Schildträger | | 20/4 | 2 → **4** (+ Lebensraub, Blinzeln) | 43 % |
| Flaggenträger | | 19/5 | 2 → **4** (+ Blinzeln, Lebensraub) | 41 % |
| Techniker | | 16/8 | 1 → **4** (+ Bollwerk, Schockwelle, Blinzeln) | 37 % |
| Attentäter | | 4/20 | 2 → **4** (+ Scharfschuss, Schockwelle) | 36 % |

Bewegungsfähigkeiten sind an die Art gebunden (moves.js); Sonderfiguren tragen deshalb nur die sechs allgemeinen. **Zwei tote Fähigkeiten gefunden:** Vorreiter beim Späher (wirkt nur bei Springern), Hofsprung bei der Amazone (nur bei der Dame). Gestrichene Fähigkeiten verschwinden samt Stufe aus dem Spielstand; Skillpunkte kommen über den geprüften Dauerfeuer-Weg zurück.

## Der Test, der zählt: reife Heere

Der Lauf mit Stufe-1-Heeren (bisher) misst das Frühspiel: eine Stufe-10-Figur unter Anfängern räumt immer ab (Springer 78 %, 22 Halbzüge). Das ist Sache der Kampagnenstufen, nicht der Figuren. Mit dem **Rest beider Heere auf Höchststufe** (`node .balance.mjs reif`) — dem echten Spätspiel — liegen 21 von 22 Figuren zwischen 36 und 60 %, und **jede Partie dauert 49–67 Halbzüge, die Grundlinie ist 56**: ein Spiel wie beim Schach. Vorher (alte Leitern, reif): Vesna 76, Erzbischof 64, Amazone 62 über der Linie.

**Vesna bleibt bei 75 %** — unabhängig von Angriff und Fähigkeiten. Ihre Stärke steckt im Zug: alle acht Richtungen, zwei Felder weit, also eine kurze Dame (16 Felder), die anders als Läufer und Turm nie blockiert wird. Sie ist die letzte Belohnung des Spiels (Kapitel XII). **Entscheidung des Besitzers: so lassen** — stark, aber Partielänge 53, kein Überrennen.
