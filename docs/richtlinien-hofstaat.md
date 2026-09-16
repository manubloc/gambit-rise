# Richtlinien: Hofstaat, Kachel und Blatt (Stand v1.16.0)

Abgeleitet aus dem Umbau vom 15./16. September (v1.13.4 bis v1.16.0), mit
dem Besitzer abgestimmt. Wer eine Kachel oder ein Blatt anfasst, hält sich
daran - oder ändert zuerst diese Datei.

## 1. Eine Kachel für alle
Figuren, Großmeister, Monster, Drache: dieselbe Kachel, dieselbe Bauweise.
Kopfzeile: links die Talente (bis zu zwei), Mitte das Lebensrohr (4,2 em),
rechts die Stufe (21 px, Ziffer als Flex-Kind, gemessen 0,0 px Versatz).
Darunter die Figur, unten nur der Name. Sonst nichts.

## 2. Die Kachel nennt, das Blatt erklärt
Auf der Kachel steht, was man im Vorbeigehen braucht: Name, Werte, Stufe,
Talente. Bund, Kapitel, Gruppe, Herkunft, Regel, Geschichte - alles erst
beim Antippen, auf dem Blatt, in der Bundtafel.

## 3. Die Kulisse ist das Erkennungszeichen
Jede Figur trägt die Kulisse ihres Bundes, jeder Großmeister seine eigene,
Monster die ihrer Gruppe (Brut, Untot, Gesindel, Gemäuer), Bauer, Gambit und
Drache ihre eigene. Auf der Kachel deutlich (92 %), der Verlauf nur im
unteren Drittel unter dem Namen. Auf dem Blatt kehrt sie als Streifen wieder
(32 %, von links dunkel), nie als Vollbild hinter Text.
Maß: 2:3 hochkant, 512×768 WebP q82 im Spiel, Original 1024×1536 im Archiv
(`archiv/bilder/kulissen-hq`). Keine Kulisse ohne HQ-Original - eine Probe
wacht darüber.

## 4. Farbe sagt, wo man steht
Gold = erreicht (Höchststufe, erwacht, eigene Kachel).
Violett = unterwegs (Stufe, aktives Fach, begegnete Figur).
Grau = fremd (noch nicht eigene Monster: Kulisse UND Figur in Graustufen).
Monster-Kulissen tragen einen Farbschleier im Ton der Figur (`accent`).

## 5. Schrift
Überschriften in Kapitälchen (`gg-serif`, letterSpacing .1em).
Regeln, Geschichten, Zitate in der Serifenstimme, Zitate kursiv in „“.
Namen auf der Kachel in `gg-serif`, Namen auf dem Blatt in `gg-quill`.

## 6. Messen, nicht vermuten
Jede Änderung an Kachel oder Blatt wird im echten Chromium nachgemessen
(`messe_kulissen.mjs`, `messe_rohr.mjs`): Deckung, Ausrichtung, Graustufen,
Versatz. Quelltextvergleiche fangen nicht, was eine globale Regel
überschreibt - das Einblenden hat die Deckung wochenlang auf 100 % gehalten.
