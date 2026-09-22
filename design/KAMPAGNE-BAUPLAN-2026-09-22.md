# Kampagnenumbau — Bauplan (22.9.2026)

Grundlage: die Besitzerentscheidungen in `KAMPAGNE-AUFSTELLUNG.md`. Heute: 529 Stationen in 12 Ligen (= Kapitel). Ligen 1–4 reines Schach, Liga 5 gemischt, ab Liga 6 nur Lebenspunkte — 328 von 529 (62 %). Das Gegnerheer ist überall das klassische Grundheer, an 44 Stationen mit einer Figur oder einem Monster als Boss auf dem Damenplatz. Der Gambit ist von Beginn an da (`GAMBIT_ERWACHT_AB = 0`), Sturmlauf steht auf Stufe 5 seiner Leiter.

Drei Schritte, jeder für sich lieferbar, jeder mit Proben und Balance-/Partielängenprüfung.

## Schritt A — der Anfang (Liga 1)
1. **Reihe 1 ohne Gambit:** die erste Station (L01s00) spielt mit einem gewöhnlichen Bauern an seiner Stelle. Nach dem ersten Sieg erwacht der Gambit (`GAMBIT_ERWACHT_AB = 1`).
2. **Sturmlauf beim Erwachen:** er bekommt ihn sofort, ohne Skillpunkte, auf Stufe I = zwei Felder; Stufe II drei, III vier (Stärkestufe im Kern). Die Leiter: Sturmlauf wandert von Stufe 5 auf das Erwachen; die übrigen vier bleiben (höchstens fünf). Wer Sturmlauf früher mit Punkten gelernt hat, bekommt den Lernpreis über den geprüften Weg zurück.
3. **Belohnung Liga 1, Reihe 5 des Hauptstrangs:** der erste Sieg an einer Hauptstrang-Station der Reihe 5 (L01s17, L01s20, L01s22) öffnet die hintere Reihe — die Startaufstellung ist ab dann frei, für den Rest des Spiels. Heute öffnet sie sich mit der ersten beigetretenen Figur.

## Schritt B — Einzigartigkeit und Gegnerbesetzung (ab Kapitel III)
1. **Kandidaten** für die freien Plätze eines Gegners: Figuren und gewöhnliche Monster, die der Spieler **getroffen** hat (`codex.met`, gesetzt beim Betreten, unabhängig vom Ausgang — gibt es schon) und **nicht besitzt**. Kapitelmeister nie.
2. **Welche Stationen:** ab Kapitel III trägt ein Teil der Stationen eine Besetzung von ein bis drei Plätzen (Turm/Läufer/Springer), mit dem Kapitel wachsend. Die Auswahl ist je Station fest: Keim aus Stations-ID und der sortierten Kandidatenmenge — sie ändert sich nur, wenn sich der Besitz ändert, nie durch Verlust oder Neustart. Gibt es zu wenige Kandidaten, bleiben die klassischen Figuren stehen.
3. **„Wechselnde Aufstellung"** (Label mit gekreuzten Pfeilen): an einem Teil dieser Stationen stehen dieselben Figuren bei jedem Versuch auf anderen freien Plätzen. König und Dame fest.
4. **Erstauftritt** bleibt wie heute auf dem Damenplatz. Was im eigenen Hof steht, stellt kein Gegner auf.

## Schritt C — Lebenspunkte etwa halb/halb
Heute 62 %. Vorschlag: ab Liga 6 bleibt der **Hauptstrang** Lebenspunkte, die **Seitenwege** wechseln sich ab, klassisch und Lebenspunkte. Rechnung: 132 Seitenstationen mit Lebenspunkten in Ligen 6–12, die Hälfte klassisch → 262 von 529 = 49,5 %.

## Entschieden (Besitzer, 22.9.)
- Reihe 5: der Sieg an **irgendeiner** der drei Hauptstrang-Stationen (L01s17, L01s20, L01s22) öffnet die freie Aufstellung.
- Figurenstation, deren Figur man schon besitzt: **die Figur bleibt stehen**, wie ein Meister an seinem Finale.
- Lebenspunkte halb/halb: ab Liga 6 bleibt der Hauptstrang Lebenspunkte, die **Seitenwege wechseln sich ab**.

## Stand
- **Schritt A gebaut (v1.34.0).** Dabei: Sturmlauf ist eine *geschenkte* Sprosse (Stufe 1, `geschenkt: true`) — gilt ohne Lernen, nicht lern- und nicht vergessbar, aufstufbar (II ab Stufe 3, III ab 5). Der Gambit trägt seine Fähigkeitsstufen jetzt auch im reinen Schach. Behoben: ein Sturmlauf auf die letzte Reihe wandelt sich um.
- **Schritt B gebaut (v1.35.0)**, `src/meta/besetzung.js`. Verteilung: besetzte Stationen von 19 % (Kapitel III) bis gut die Hälfte (ab IX), ein bis drei Plätze; wechselnde Aufstellung in jedem Kapitel ab III (etwa jede vierte Station). Die Besetzung wird beim Betreten je Platz festgehalten (`campaign.besetzung`), auch ein leerer Platz bleibt leer. Jeder Ersatz kommt aus der **Stärkeklasse** der Figur, deren Platz er nimmt (± 6 Punkte, Werte aus `npm run balance`). Gemessen mit `npm run besetzung` (besetztes gegen klassisches Heer derselben Station): 1 Platz 47 %, 2 Plätze 50 %, 3 Plätze 42 %, 45–58 Halbzüge. Ohne Stärkeklasse und ohne Stufenerbe waren es 25–43 % — der Ersatz stand dort auf Stufe 1 neben einem Springer auf 3.
- **Schritt C neu gefasst und gebaut (v1.36.0), Besitzerentscheid 22.9.** Statt „halb/halb": die Lebenspunkte kommen **früh**, damit man den Wert des Levelns schon in der Gratisversion erlebt. **Gratis ist bis Kapitel III.** Kapitel I reines Schach (Figuren kennenlernen); in Kapitel II erwacht der Schaden früh im Hauptstrang (L02s07, Reihe 3, mit dem Wächter), die Seitenwege bleiben Schach; ab Kapitel III Hauptstrang Lebenspunkte, die Seitenwege wechseln sich als ganze Wege ab. Gesamt 370 von 529 = 70 % (vorher 62 %, aber erst ab Liga 5). Löst den Entscheid aus v1.2.2 („ab 5") ab. Schalter: `HP_AB_LIGA`, `HP_AB_ANTEIL` in `tools/build-campaign12.mjs`.
- Eine Bezahlschranke gibt es im Code noch nicht; die Grenze „gratis bis Kapitel III" ist hier festgehalten, nicht gebaut.

