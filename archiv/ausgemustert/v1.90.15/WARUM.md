# Ausgemustert in v1.90.15 (30.9.2026)

## landing/ — Galeriebilder vor der Sockel-Ausrichtung

Die zwölf Kacheln „Was du erspielst" auf der Startseite zeigen jedes Bild
mittig in seiner Karte. Die Bilder waren aber seitlich auf die FIGUR
beschnitten, nicht auf den Sockel — wer eine Lanze, einen Flügel oder eine
Schriftrolle zur Seite hält, stand mit dem Sockel neben der Kartenmitte.
Gemessen (Alphakanal, unterste fünf Zeilen, Alpha > 60): Kapitän 0,448,
Amazone 0,462, Schatten 3 0,608, Schatten 4 0,589 statt 0,5.

Hier liegen die Originale. Die neuen Fassungen in `public/landing/` sind nur
um durchsichtige Spalten ergänzt (`tools/landing_bilder.py galerie`), an der
Figur hat sich nichts geändert.

`gal-guardian-schildtraeger.webp`: stand unter dem Namen „Wächter — Bestie
aus dem Riss", zeigte aber den HELDEN Schildträger (Audit A76). Die Kachel
trägt jetzt die Bestie b01 aus Stein (`gal-waechter.webp`).

## landing-verwaist/ — 19 Bilder, die keine Seite mehr zeigte

`auf-erzbischof`, `auf-laeufer`, `auf-magier`, `auf-springer`, sechs
`fig-*`, sechs `hof-*`, `mon-bestie`, `mon-waechter` und `weltkarte` (die
Seite zeigt `weltkarte-ausschnitt`) — von
keiner Zeile in `public/landing.html` (und keinem Skript) mehr angesprochen,
aber mit jedem Bau an die Wurzel der Seite kopiert. Übrig geblieben aus
früheren Fassungen der Startseite (v1.53–v1.85).
