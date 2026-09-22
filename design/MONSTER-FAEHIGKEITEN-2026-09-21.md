# Monsterfähigkeiten — Verteilung (v1.32.0)

Freigegeben vom Besitzer nach Tabelle; drei Monster nach dem Balance-Lauf getauscht (unten).

**Regel:** Die Monster tragen nur die neun Monsterfähigkeiten. Die Familiengaben (Bollwerk, Regeneration, Lebensraub, Blinzeln) bleiben den Figuren. Wer eine davon bei einem Monster gelernt oder aufgestuft hatte, bekommt Lernpreis **und** Aufstufung zurück (geprüfter Weg `GESTRICHEN`, `src/meta/profile.js`).

**Wie viele:** Kapitelmeister I–IV drei, V–VIII vier, IX–XII fünf (Großmeister, vom Ausgleich ausgenommen, Auren bleiben). Gewöhnliche Monster nach Beweglichkeit (Felder von d4 auf leerem Brett; wer Brut legt, eine Stufe tiefer): 16 Felder eine, 12–14 zwei, 8 drei, Bollwerk vier.

**Leiter über die fünf Monsterstufen:** 1 → Stufe 2 · 2 → 2, 4 · 3 → 2, 3, 4 · 4 → 2–5 · 5 → 1–5.

**Brut (Besitzer: „5 Bauern ist zu viel"):** Seuchenkönig 5 → 3, Brutmutter 4 → 2, Flüsterin 2 → 1, Wandlerin 2. Gestaffelt, weil die ersten drei gleich ziehen und sich nur in der Brut unterscheiden.

## Kapitelmeister

| Kap. | Meister | Fähigkeiten |
|---|---|---|
| I | Richter | Schrecken, Widerhall, Blenden |
| II | Doppelritter | Wegelagerei, Blenden, Aderlass |
| III | Seuchenkönig | Gift, Schrecken, Aderlass |
| IV | Schattenfürst | Geistwandel, Schrecken, Blenden |
| V | Hüter | Unsterblich, Widerhall, Steinhaut, Schrecken |
| VI | Blutmagd | Gift, Aderlass, Unsterblich, Schrecken |
| VII | Lanzenmeister | Widerhall, Schrecken, Aderlass, Unsterblich |
| VIII | Eisenfaust | Steinhaut, Widerhall, Schrecken, Wegelagerei |
| IX | Kanonier | Wegelagerei, Steinhaut, Schrecken, Blenden, Widerhall |
| X | Koloss | Steinhaut, Unsterblich, Widerhall, Schrecken, Aderlass |
| XI | Asra | Unsterblich, Widerhall, Blenden, Schrecken, Geistwandel |
| XII | Osric | Unsterblich, Widerhall, Schrecken, Blenden, Aderlass |

## Gewöhnliche Monster — Endstand und Messung (reifes Heer, `npm run balance`)

| Monster | Felder | Fähigkeiten | Leben/Angriff | Sieg | Halbzüge |
|---|---|---|---|---|---|
| Geist | 16 | **Blenden** | **16/8** (vorher 4/20) | 59 % | 61 |
| Sturmklaue | 12 | Blenden, **Wegelagerei** | **17/7** (vorher 6/18) | 57 % | 59 |
| Brandstifter | 13 | Aderlass, Gift | 5/19 | 56 % | 57 |
| Hetzer | 12 | Blenden, Aderlass | **18/6** (vorher 7/17) | 55 % | 57 |
| Schleicher | 12 | Geistwandel, Schrecken | 8/16 | 55 % | 60 |
| Wandlerin | 16 + Brut | **Schrecken** | 13/11 | 54 % | 61 |
| Zerreißer | 16 | Aderlass | 5/19 | 52 % | 55 |
| Flüsterin | 8 + Brut | Geistwandel, Gift | 8/16 | ~48 % | 68 |
| Streuner | 8 | Blenden, Gift, Wegelagerei | 9/15 | ~47 % | 61 |
| Brutmutter | 8 + Brut | Gift, Unsterblich | 17/7 | ~47 % | 70 |
| Skorpion | 8 | Gift, Aderlass, Schrecken | 6/18 | ~45 % | 62 |
| Wächter | 8 | Steinhaut, Schrecken, Widerhall | 19/5 | 41 % | 68 |
| Bollwerk | 4 | Steinhaut, Widerhall, Unsterblich, Schrecken | 20/4 | 36 % | 67 |

## Was die Messung verändert hat

Mit der Tabelle lagen **Geist 72 %, Wandlerin 73 %, Sturmklaue 72 %**. Einzeln gemessen:

- **Geistwandel** war der Grund: Geist ohne ihn 50 %, mit ihm 68 %; Wandlerin 52 % / 73 %. Auch ein Geist mit 1 Leben und einfachem Angriff brachte noch rund 10 Punkte — ein zweiter Körper ist bei einem Monster, das 16 Felder weit springt, zu viel wert. Geistwandel bleibt bei den langsameren Schemen (Schleicher, Flüsterin) und den Meistern, seine Zahlen (3 Leben, doppelter Angriff) bleiben. Geist → Blenden, Wandlerin → Schrecken.
- **Sturmklaue:** Blenden und Widerhall trugen beide bei; Widerhall → Wegelagerei (wirkt nicht im Kampf).
- Danach lagen noch **Hetzer 62, Sturmklaue 61, Geist 60** — drei Springer mit 17–20 Angriff aus dem Zielprofil von v1.23.0, das vor der Regel „wer springt, schlägt schwach" entstand. Wie bei den Figuren nur dort umverteilt, wo es nötig war: Springerprofil (Hetzer 18/6 wie die Amazone, Sturmklaue 17/7, Geist 16/8 wie der Springer). 24 Punkte bleiben.

**Falle beim Messen:** ein eigenes Monster trägt nur, was auf seiner **Leiter** steht. Wer im Versuch nur `abilities` ändert, misst ein Monster ohne die neue Fähigkeit. Zielprofile wirken über `ZIEL_PROFIL_BOSS` (leveling.js), nicht über die Werte in bosses.js.

**Figuren:** Vesna 76 % (Besitzerentscheid, bleibt). Läufer 61 % in diesem Lauf (bei der Freigabe 60 %) — nicht verändert; er gewinnt etwas mehr, seit die drei Monster schwächer sind. Beobachten.
