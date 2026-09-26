#!/usr/bin/env python3
"""Baut die Google-Play-Grafiken aus denselben Teilen wie der erste Schirm
der Landingpage: Rissboden, Figurenreihe, Wortmarke.

v1.81.0, Besitzer: "vielleicht kannst du aus dem dann auch noch schon
beispielhaft ein Bild ableiten fuer den Google Play Store."

Play verlangt die Feature-Grafik in 1024x500 (JPG oder 24-Bit-PNG, KEINE
Durchsicht). Sie wird auf dem Handy stark beschnitten - Play zeigt oft nur
die mittleren rund 60 % -, deshalb steht alles Wichtige in der Mitte.
"""
import sys
from PIL import Image, ImageFilter

WURZEL = "public/landing"
# Die Reihe wie auf der Landingpage: --h ist die Hoehe im Verhaeltnis zum
# Koenig, --b dunkelt die hinteren Figuren ab.
# v1.83.0: dieselbe Aufstellung wie auf der Landingpage - aussen die Laeufer,
# die Pferde eine Reihe dahinter ZWISCHEN Laeufer und Dame. Die vierte Zahl
# hebt eine Figur an (Anteil der Reihenhoehe); zusammen mit kleinerer Hoehe
# und gedaempfter Helligkeit steht sie damit sichtbar in zweiter Reihe.
REIHE = [
    ("held-pawn.webp",   0.54, 0.38, 0.110),
    ("held-rook.webp",   0.70, 0.54, 0.082),
    ("held-bishop.webp", 0.87, 0.92, 0.000),
    ("held-knight.webp", 0.76, 0.68, 0.100),
    ("held-queen.webp",  0.96, 1.00, 0.000),
    ("held-king.webp",   1.00, 1.00, 0.000),
    ("held-knight.webp", 0.76, 0.68, 0.100),
    ("held-bishop.webp", 0.87, 0.92, 0.000),
    ("held-rook.webp",   0.70, 0.54, 0.082),
    ("held-pawn.webp",   0.54, 0.38, 0.110),
]
# Wer vor wem steht - die Mitte zuletzt, damit sie oben liegt.
ORDNUNG = [0, 9, 1, 8, 3, 6, 2, 7, 4, 5]


def boden(b, h, stelle=0.62):
    """Der Rissboden, deckend zugeschnitten (wie object-fit: cover)."""
    im = Image.open(f"{WURZEL}/menue-boden.webp").convert("RGB")
    s = max(b / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - b) // 2
    y = round((im.height - h) * stelle)
    return im.crop((x, y, x + b, y + h))


def dunkeln(im, oben=0.62):
    """Oben ins Schwarz auslaufen lassen - wie die Maske auf der Seite."""
    b, h = im.size
    schleier = Image.new("L", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        # 1 = ganz schwarz oben, 0 = unberuehrt unten
        v = max(0.0, min(1.0, (oben - t) / max(1e-6, oben)))
        schleier.putpixel((0, y), int(255 * (v ** 0.85)))
    schleier = schleier.resize((b, h))
    return Image.composite(Image.new("RGB", (b, h), (4, 5, 11)), im, schleier)


def figurenreihe(hoehe, ueberlappung=0.075):
    """Die Figuren nebeneinander, Fuesse auf einer Linie, mit Tiefe."""
    teile, hebung = [], []
    for datei, f, hell, y in REIHE:
        im = Image.open(f"{WURZEL}/{datei}").convert("RGBA")
        z = round(hoehe * f)
        im = im.resize((round(im.width * z / im.height), z), Image.LANCZOS)
        if hell < 1.0:
            a = im.split()[3]
            im = Image.merge("RGBA", [c.point(lambda v: int(v * hell)) for c in im.split()[:3]] + [a])
        teile.append(im)
        hebung.append(round(hoehe * y))
    schritt = [t.width - round(hoehe * ueberlappung * 2) for t in teile]
    breite = sum(schritt) + round(hoehe * ueberlappung * 2)
    platte = Image.new("RGBA", (breite, hoehe + max(hebung)), (0, 0, 0, 0))
    x = [0]
    for s in schritt[:-1]:
        x.append(x[-1] + s)
    fussline = hoehe + max(hebung)
    for i in ORDNUNG:
        platte.alpha_composite(teile[i], (x[i], fussline - teile[i].height - hebung[i]))
    return platte


def feature(pfad, b=1024, h=500, lang="de"):
    bild = dunkeln(boden(b, h, 0.84), oben=0.66)
    reihe = figurenreihe(round(h * 0.60))
    s = min(1.0, (b * 0.98) / reihe.width)
    if s < 1.0:
        reihe = reihe.resize((round(reihe.width * s), round(reihe.height * s)), Image.LANCZOS)
    # v1.82.0 (Besitzer: "ich habe das Gefuehl, der Hintergrund scheint jetzt
    # noch bei den Figuren durch ... schneid das untere Fuenftel, Sechstel
    # noch ab"): KEIN weiches Auslaufen mehr - das hat die Figuren nach unten
    # durchsichtig gemacht, und der violette Boden schien durch die Koenigin.
    # Stattdessen ein harter Schnitt an der Unterkante, wie auf der Seite.
    bild = bild.convert("RGBA")
    bild.alpha_composite(reihe, ((b - reihe.width) // 2, h - round(reihe.height * 0.83)))

    marke = Image.open(f"{WURZEL}/wortmarke.webp").convert("RGBA")
    mb = round(b * 0.46)
    marke = marke.resize((mb, round(marke.height * mb / marke.width)), Image.LANCZOS)
    schatten = Image.new("RGBA", bild.size, (0, 0, 0, 0))
    schatten.alpha_composite(marke, ((b - mb) // 2, round(h * 0.12) + 6))
    bild.alpha_composite(schatten.filter(ImageFilter.GaussianBlur(14)))
    bild.alpha_composite(marke, ((b - mb) // 2, round(h * 0.12)))
    bild.convert("RGB").save(pfad, "PNG", optimize=True)
    return pfad


if __name__ == "__main__":
    ziel = sys.argv[1] if len(sys.argv) > 1 else "design/playstore/feature-1024x500-de.png"
    print(feature(ziel))
