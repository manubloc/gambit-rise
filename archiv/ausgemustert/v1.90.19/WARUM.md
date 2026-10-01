# Ausgemustert in v1.90.19

## painted-boss-b13-rot.webp (+ klein/)

Der rote Brandstifter (b13). Er und die Blutmagd (b16) waren zwei rote
Schlangen mit Rückenkamm und rotem Sockelstreifen, am Brett kaum zu
unterscheiden. Der Besitzer entschied am 30.9.: umfärben statt neu malen,
die eine blutrot (die Blutmagd bleibt), der andere blau oder grün. Am 1.10. fiel die Wahl auf **Blau**.

Das neue Bild ist aus diesem hier gerechnet, nicht neu gemalt:

    python3 tools/umfaerben.py archiv/ausgemustert/v1.90.19/painted-boss-b13-rot.webp \
        src/app/ui/assets/painted/painted-boss-b13.webp 218 1 0.85
    python3 tools/umfaerben.py archiv/ausgemustert/v1.90.19/klein/painted-boss-b13-rot.webp \
        src/app/ui/assets/painted/klein/painted-boss-b13.webp 218 1 0.85

Gedreht werden nur die roten Flächen (Körper und roter Sockelstreifen), um
218 Grad; die glühenden Augen bleiben Glut-orange, die Helligkeit je Pixel
bleibt gleich, der Alphakanal bleibt unberührt (gemessen: Abweichung 0) —
`sockelband.json` gilt darum unverändert. Das gerechnete Bild ist
byte-gleich mit der Vorschau, die der Besitzer gesehen hat.

Der Hochauflösungs-Rohling `archiv/bilder/figuren-hq/boss-b13.png` bleibt
rot: er ist das Original, das Blau ist eine Ableitung davon.
