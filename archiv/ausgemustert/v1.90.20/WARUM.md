# Ausgemustert in v1.90.20

## painted-boss-b01 … b25 (+ klein/) — die Monster vor dem Aufhellen

Besitzer, 1.10.2026: „Die Monster dürfen gerne etwas allgemein heller sein, da
man sie zum Teil gar nicht so gut erkennt wie die Figuren. Dieses ‚noch heller‘
beim Brandstifter ist eine gute Grundlage und sollte für alle Monster gelten.“
Gezeigt wurden ihm zwei Stufen (A: so hell wie der Brandstifter „noch heller“,
Körper-Median der Leuchtdichte 0,184; B: eine Stufe heller, 0,24). Seine Wahl
(13:02): „Die Figuren sehen alle in der hellsten Variante auf jeden Fall schon
mal besser aus“ — also **B**.

Gerechnet mit `tools/monster-aufhellen.py` (Ziel 0,24):

    ZIEL=0.24 python3 tools/monster-aufhellen.py rechnen <ordner>

Gehoben wird nur der Körper über der gemessenen Sockelkante (Gammakurve auf
der Leuchtdichte, dunkle Partien stärker als helle), Farbton und Sättigung
bleiben, Glutaugen und Sockel bleiben, der Alphakanal ist unverändert
(gemessen über alle 50 Bilder: Abweichung 0) — `sockelband.json` und alle
Figurenmaße gelten weiter. Eingebaut sind byte-genau die Bilder der Vorschau.

Der Brandstifter (b13) hier ist bereits die blaue Fassung aus v1.90.19; sein
rotes Original liegt unter `../v1.90.19/`.
