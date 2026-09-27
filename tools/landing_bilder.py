#!/usr/bin/env python3
"""Die Bilder der Landingpage, die v1.87.0 neu zeichnet (Besitzer, 27.9.2026).

Drei Aufgaben, alle aus Material, das schon im Repo liegt - kein Bild-API:

  zugbilder   Die vier Zugbilder im Abschnitt "Auch der Springer lernt dazu".
              Besitzer: "beim Weitsprung zeichne bitte auch den normalen Zug
              ein, den der Springer kann, weil so erkennt man gar nicht, was
              der Unterschied ist ... beim Turm hast du sie ja eigentlich
              richtig eingezeichnet."
              GEMESSEN, was schief war: die Bilder trugen die Farben des
              SPIELS (Blau = Gleiten, Gelb = Sprung, Talentfarbe = neu), die
              Legende darunter sagte aber "Blau = gewohnter Zug, Gelb = neu".
              Beim Turm stimmte das zufaellig (er gleitet), beim Springer
              war es verkehrt herum: sein L stand in Gelb ("neu"), der
              Weitsprung in Blau ("gewohnt"). Jetzt gilt in allen vier
              Bildern dieselbe Sprache wie beim Turm: BLAU der gewohnte Zug,
              GRUEN was die Faehigkeit hinzugibt. Die Kacheln werden aus dem
              alten Turmbild abgetastet, damit Stil und Geometrie pixelgenau
              bleiben (484 px, 7x7, Zellen 60 px ab x=22 im Raster 64).

  gefecht     Das Brett unter "Stell dein eigenes Heer auf". Besitzer: "die
              lilanen Hintergruende weg ... die Kontur weg, dass man nur das
              Schachbrett sieht ... der Sockel immer grau oder schwarz, aber
              gleich." Die alte Aufnahme aus dem Spiel trug die violetten
              Felder der Gegnerreihen, die Sockelglut (Gegner schwarz, eigene
              weiss - gegnerstil.js, seit v1.0.83 ohne Wahl) und einen
              Holzrand. Aus dem Spiel selbst kommt das nicht ohne Sockelglut;
              darum wird das Brett neu zusammengesetzt: die leeren Felder
              der Zeilen 3-5 der alten Aufnahme (gemessen: 8 Felder je 144 px,
              x ab 24, y ab 124) fuellen alle acht Zeilen, die Figuren kommen
              aus painted/ mit ihrem eigenen grauen Sockel. Massstab aus der
              Aufnahme: Gegnerkoenig 51..264 px hoch = 213 px fuer 541 px
              Figur -> Kasten 228 px, Unterkante 2 px unter der Feldkante.

  crowd       Sechs Figuren fuer die zweite Reihe des ersten Schirms - genau
              wie die held-*.webp seit v1.78.0: painted/ auf 460 px, seitlich
              auf die Figur beschnitten.

Aufruf: python3 tools/landing_bilder.py [zugbilder|gefecht|crowd|alles]
"""
import sys
from pathlib import Path
from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
LANDING = WURZEL / "public" / "landing"
PAINTED = WURZEL / "src" / "app" / "ui" / "assets" / "painted"


# ── ZUGBILDER ────────────────────────────────────────────────────────────────
ZELLE, RASTER, START = 60, 64, 22          # gemessen im alten Turmbild

def zelle_xy(c, r):
    return START + RASTER * c, START + RASTER * r

def kachel(vorlage, c, r):
    x, y = zelle_xy(c, r)
    return vorlage.crop((x, y, x + ZELLE, y + ZELLE))

def zugbild(vorlage, gewohnt, neu):
    """gewohnt/neu: Mengen von (df, dr) um die Figur; df nach rechts, dr nach oben."""
    bild = vorlage.copy()
    hell, dunkel = kachel(vorlage, 0, 0), kachel(vorlage, 1, 0)
    blau, gruen, mitte = kachel(vorlage, 3, 0), kachel(vorlage, 2, 2), kachel(vorlage, 3, 3)
    # Erst das Innere neu fuellen: in den Fugen neben den blauen Turmzellen
    # lag ein Hauch Blau (Kantenglaettung), der als Saum stehen blieb.
    fuge = vorlage.getpixel((START + ZELLE + 2, START + 30))
    bild.paste(fuge, (START - 4, START - 4, START + 7 * RASTER, START + 7 * RASTER))
    for r in range(7):
        for c in range(7):
            df, dr = c - 3, 3 - r
            if (df, dr) == (0, 0): k = mitte
            elif (df, dr) in neu: k = gruen
            elif (df, dr) in gewohnt: k = blau
            else: k = hell if (c + r) % 2 == 0 else dunkel
            bild.paste(k, zelle_xy(c, r))
    return bild

ZUG_VORLAGE = WURZEL / "archiv" / "ausgemustert" / "v1.87.0" / "zug-rook_diag_step-vorlage.webp"

def zugbilder():
    # Vorlage ist das ARCHIVIERTE Turmbild aus v1.62.0, nie das eigene Ergebnis
    vorlage = Image.open(ZUG_VORLAGE).convert("RGB")
    # Muster aus src/core/domain/constants.js - dieselben Tabellen wie der Kern
    springer = {(1, 2), (2, 1), (-1, 2), (-2, 1), (1, -2), (2, -1), (-1, -2), (-2, -1)}
    weit = {(1, 3), (3, 1), (-1, 3), (-3, 1), (1, -3), (3, -1), (-1, -3), (-3, -1)}
    vorreiter = {(2, 2), (2, -2), (-2, 2), (-2, -2)}
    turm = {(k * d, 0) for k in (1, 2, 3) for d in (1, -1)} | {(0, k * d) for k in (1, 2, 3) for d in (1, -1)}
    diag = {(1, 1), (1, -1), (-1, 1), (-1, -1)}
    koenig = {(a, b) for a in (-1, 0, 1) for b in (-1, 0, 1)} - {(0, 0)}
    flucht = {(2, 0), (-2, 0), (0, 2), (0, -2)}
    for name, g, n in [("knight_longleap", springer, weit), ("knight_outrider", springer, vorreiter),
                       ("rook_diag_step", turm, diag), ("king_dash", koenig, flucht)]:
        zugbild(vorlage, g, n).save(LANDING / f"zug-{name}.webp", quality=92)
        print("zugbild", name)


# ── GEFECHT ──────────────────────────────────────────────────────────────────
FELD = 144
BRETT_X = 24                               # linke Feldkante in den alten Aufnahmen
KASTEN = 228                               # Figurenkasten (576 px painted -> 228 px)
STREIFEN = 84                              # dunkler Streifen ueber dem Brett fuer die Koepfe

def figur(name):
    im = Image.open(PAINTED / f"painted-{name}.webp").convert("RGBA")
    return im.resize((KASTEN, KASTEN), Image.LANCZOS)

ARCHIV = WURZEL / "archiv" / "ausgemustert" / "v1.87.0"
# Beide Aufnahmen aus v1.53.0/v1.62.0 haben dieselbe Feldbreite und dieselbe
# linke Kante; nur die Oberkante liegt anders (gemessen an den Helligkeits-
# spruengen der Zeilen: Kronland 124, Wolkenjoch 92).
BRETTER = {
    "gefecht-gemischt": (ARCHIV / "gefecht-gemischt-aufnahme.webp", 124),
    "brett-wolkenjoch": (ARCHIV / "brett-wolkenjoch-aufnahme.webp", 92),
}

def gefecht(name="gefecht-gemischt"):
    # Quelle ist die AUSGEMUSTERTE Aufnahme, nie das eigene Ergebnis - sonst
    # stimmen beim zweiten Lauf die gemessenen Feldkanten nicht mehr.
    quelle, oben = BRETTER[name]
    alt = Image.open(quelle).convert("RGB")
    W = 8 * FELD
    brett = Image.new("RGB", (W, STREIFEN + W), alt.getpixel((600, 20)))
    # Leere Felder: gerade Zeilen aus Zeile 2 bzw. 4, ungerade aus Zeile 3 - dort steht keine Figur
    for r in range(8):
        q = (2 if r % 4 == 0 else 4) if r % 2 == 0 else 3
        streifen = alt.crop((BRETT_X, oben + q * FELD, BRETT_X + W, oben + (q + 1) * FELD))
        brett.paste(streifen, (0, STREIFEN + r * FELD))
    aufstellung = [
        ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
        ["pawn"] * 8,
        None, None, None, None,
        ["pawn", "pawn", "pawn", "pawn", "gambit", "pawn", "pawn", "pawn"],
        ["captain", "hawk", "mage", "queen", "king", "paladin", "boss-b01", "rook"],
    ]
    cache = {}
    for r, reihe in enumerate(aufstellung):
        if not reihe: continue
        for c, fig in enumerate(reihe):
            if fig not in cache: cache[fig] = figur(fig)
            f = cache[fig]
            x = c * FELD + (FELD - KASTEN) // 2
            y = STREIFEN + (r + 1) * FELD + 2 - KASTEN
            brett.paste(f, (x, y), f)
    brett.save(LANDING / f"{name}.webp", quality=88)
    print("gefecht", name, brett.size)


# ── CROWD ────────────────────────────────────────────────────────────────────
def crowd():
    for name in ["paladin", "guardian", "archbishop", "amazon", "captain", "chancellor"]:
        im = Image.open(PAINTED / f"painted-{name}.webp").convert("RGBA").resize((460, 460), Image.LANCZOS)
        l, _, r, _ = im.split()[3].getbbox()
        im.crop((l, 0, r, 460)).save(LANDING / f"held-{name}.webp", quality=90)
        print("crowd", name, r - l)


if __name__ == "__main__":
    was = sys.argv[1] if len(sys.argv) > 1 else "alles"
    if was in ("zugbilder", "alles"): zugbilder()
    if was in ("gefecht", "alles"):
        for name in BRETTER: gefecht(name)
    if was in ("crowd", "alles"): crowd()
