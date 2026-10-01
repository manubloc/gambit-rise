# Ausgemustert in v1.90.21

## painted-boss-b25 (+ klein/) — Osric vor der Neufassung

Besitzer, 1.10.2026: Osric „bunter machen und seinen Umhang optimieren, dass er
hinten durchgeht" — Grunddesign, Messmethoden und ungefähr gleiche Größe wie die
anderen Figuren sollen bleiben.

Erzeugt mit fal.ai (`nano-banana/edit`, Freigabe des Besitzers in der Sitzung),
zwei Varianten. Der Besitzer wählte A2 (lila Umhang, steingrauer Körper,
knochenweiße Krone) und dann: „natürlich noch größer, Sockel muss aber genau
gleich bleiben" — aus zwei gezeigten Stufen „A2 noch größer ist perfekt".

Gerechnet in drei Schichten auf dem 2x-Freisteller: Körper samt Füßen um 1,32
vergrößert um den Standpunkt der Füße, der Sockel pixelgleich darunter, die
Tellerfläche unter den alten Füßen zeilenweise aus ihren Nachbarn ergänzt, der
Umhang hinter dem Teller nach unten verlängert. Danach wie `tools/freistellen.py`
auf 535 px Höhe in 576 px Leinwand, mittig nach dem Sockel.

Gemessen: am Brett 99,6 % der Offiziershöhe (vorher 77 %), Sockel `rx` 130.
Der Umhang hängt neben dem Sockel bis knapp über den Boden; dafür tragen
`scripts/messe_sockel.py` (`SUCHZONE`), `scripts/messe_tellerkante.py`
(`HANDWERTE`, teller 49) und `sockelmass.js` (`kanteVonHand`, 0,12) je einen
Handwert mit Begründung.

Die leuchtende Krone ist KEIN Teil des Bildes: sie liegt als eigene Ebene
darüber (`src/app/ui/assets/glanz/`, `KronenGlut.jsx`).
