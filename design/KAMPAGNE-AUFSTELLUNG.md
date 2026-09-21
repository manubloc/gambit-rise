# Aufstellung, Großmeister und wechselnde Gegner — Entscheidungen des Besitzers (21.9.2026)

Gültig, noch nicht gebaut (außer wo vermerkt).

## Feste Krone
- **König und Dame stehen immer fest** — beim Spieler wie beim Gegner. Alles andere darf wandern.
- Der König trägt in der Aufstellung **keine Kontur** und einen gedämpften Grund: nicht anklickbar. Der Damenplatz trägt die **laufende lila Kontur** der Großmeister. *(gebaut in v1.28.5)*

## Großmeister
- Die **zwölf Kapitelmeister** sind die Großmeister (`KAPITELMEISTER` in campaign.js): Richter, Doppelritter, Seuchenkönig, Schattenfürst, Hüter, Blutmagd, Lanzenmeister, Eisenfaust, Kanonier, Koloss, Asra, Osric. *(v1.28.4)*
- Nur sie stehen **anstelle der Dame**. 3–5 Fähigkeiten, dürfen verschieden stark sein, ausgenommen vom Beweglichkeitsausgleich.
- Die **13 anderen Monster** sind gewöhnliche Monster: sie folgen der Beweglichkeitsregel (mit etwas mehr Spielraum als Figuren) und sind **auf den freien Plätzen** einsetzbar — anstelle von Turm, Läufer oder Springer.
- **Jede Figur außer Turm, Läufer und Springer nur einmal je Aufstellung.** Turm, Läufer, Springer kommen paarweise.

## Beweglichkeit gegen Fähigkeiten und Angriff (Figuren)
- 24 Punkte bleiben für alle. Die **Aufteilung** folgt der Beweglichkeit: wer springt, hat viel Leben und wenig Stärke (Springer, Amazone, Kanzler, Erzbischof, Späher: 8–9 Stärke); Läufer, Turm 10–11; träge Figuren 13–16.
- Fähigkeiten: sehr beweglich **2**, mittel **3**, träge **4–5**. Gestrichene Fähigkeiten verschwinden sauber aus dem Spielstand; Skillpunkte nur über den geprüften Dauerfeuer-Weg zurück, sonst keine Rückgabe (Besitzer: keine Fehler durch solche Mechanismen; es wird noch nicht echt gespielt).

## Kampagne
- **Reihe 1 (Liga 1):** gewöhnliches Schach, ohne Gambit.
- **Nach der ersten Partie erwacht ein Bauer zum Gambit.** Er bekommt beim Erwachen **Sturmlauf**: Stufe I zwei Felder jederzeit, II drei Felder, III vier Felder. Sein Platz in der Aufstellung ist wählbar (gibt es schon).
- **Reihen 2–5:** klassisch.
- **Liga 1, Reihe 5 des Hauptstrangs:** Belohnung *einmalig* — der Spieler darf ab jetzt seine Startaufstellung ändern, für den Rest des Spiels.
- **Der Gegner ändert seine Aufstellung erst ab Kapitel 3, und nicht bei jedem Level.** Solche Stationen tragen ein Label **„wechselnde Aufstellung"** (Arbeitsname; Symbol: zwei gekreuzte Pfeile in der Stationskarte).
- **Bei Verlust oder Neustart kommen keine neuen Figuren oder Monster hinzu:** die Figuren einer Station sind immer dieselben. Bei einer Station mit wechselnder Aufstellung ändert sich nur, *wo* sie auf den freien Plätzen stehen — König und Dame fest.
- Besetzung einer Station: der Generator legt die Figuren fest (klassisch vor Kapitel 3; ab Kapitel 3 an ausgewählten Stationen ein bis drei der Plätze Turm/Läufer/Springer durch Sonderfiguren oder gewöhnliche Monster ersetzt, aus derselben Stärkeklasse des Balance-Tests, jede nur einmal).

## Jede Figur gibt es nur einmal (Nachtrag 21.9., Besitzer: „super wichtig")
- **Einzigartigkeit:** Außer Bauer, König, Dame, Turm, Läufer und Springer existiert jede Figur und jedes Monster **genau einmal** in der Welt. Was in meinem Hof steht (freigeschaltete Figur, gekauftes Monster), kann der Gegner **nie** aufstellen — an keiner Station.
- **Erstauftritt nur auf dem Damenplatz:** Eine Figur oder ein Monster tritt zum ersten Mal immer als Boss auf, auf dem Damenplatz der Gegnerreihe. So sind die 20 Figurenstationen und die Monsterstationen heute schon gebaut.
- **Nach der Flucht:** Habe ich sie getroffen, aber nicht bekommen (verloren; Monster nicht gekauft), ist sie „geflüchtet" — und darf an einer späteren Station wieder auftreten, dann auch **auf einem freien Platz** der Gegnerreihe.
- **Folge für die Besetzung einer Station:** Kandidaten für die freien Plätze sind nur Figuren und gewöhnliche Monster, die der Spieler **schon getroffen** hat und **nicht besitzt**. Die Auswahl ist je Station fest (Keim aus Station und Kandidatenmenge) und ändert sich nur, wenn sich der Besitz ändert — nie durch Verlust oder Neustart.
- **Neu im Spielstand:** eine Liste der getroffenen Figuren und Monster (gesetzt beim Betreten der Station, unabhängig vom Ausgang).
- **Offene Kante:** ein Kapitelfinale, dessen Meister ich schon besitze. Vorschlag: der Meister bleibt an seinem Finale stehen — es ist eine Erinnerung an den Kampf, keine neue Begegnung. Sonst müsste ein Fremder dort stehen.

## Reihenfolge des Baus
1. Figuren: Fähigkeiten und Angriffsstärke umverteilen (Tabelle vor dem Push, Balance-Test als Schranke: alle Nicht-Großmeister 40–60 %, Partielänge nahe 56).
2. Monsterfähigkeiten im Kern; Monster einstufen (Großmeister 3–5, gewöhnliche nach Beweglichkeit); gewöhnliche Monster auf freie Plätze.
3. Kampagne: Reihe 1 ohne Gambit, Sturmlauf beim Erwachen, Belohnung Reihe 5, wechselnde Aufstellungen ab Kapitel 3 mit Label.
