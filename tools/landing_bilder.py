#!/usr/bin/env python3
"""Die Bilder der Landingpage zuschneiden (v1.87.0, neu gefasst in v1.90.25).

SEIT v1.90.25 KOMMT JEDES BILD MIT FIGUREN AUS DEM ECHTEN SPIEL. Besitzer,
3.10.2026: "Wir killen den grauen Sockel ... ueberall das Band, in schwarz ...
Also auch auf dem Schachbrett, da hast du ja gar nicht die Baender drauf, und
die Positionen und Groessen der Figuren sind auch nicht so wie im Spiel ...
wirklich genau das bringen, wie es im Spiel aussieht. Das ist mir tatsaechlich
sehr wichtig."

Bis v1.90.24 setzte dieses Skript drei Dinge selbst zusammen - und alle drei
sahen anders aus als das Spiel:
  gefecht    das Brett aus rohen Gemaelden, jede Figur im selben 228-px-Kasten
             auf ihrem gemalten grauen Teller (kein Band, falsche Groessen:
             das Spiel skaliert nach Tellerbreite und stellt auf eine Linie)
  crowd      die Figuren des ersten Schirms, roh aus painted/ (grauer Teller)
  zugbilder  die vier Zugbilder aus Kacheln einer alten Aufnahme, in einer
             eigenen Farbsprache (Blau = gewohnt, Gruen = neu), waehrend die
             Karte daneben und das Spiel Gelb fuer den Sprung zeigen
Diese drei Aufgaben sind GESTRICHEN. An ihre Stelle tritt

  fotos <ordner> [was]   schneidet zu, was tools/landing-fotos.mjs aus dem
             Pruefstand (echte SockelBand, HofKachel, MoveDiagram, BoardView)
             fotografiert hat: Figuren mit schwarzem Band fuer den ersten
             Schirm (held-*) und die Galerie (gal-*), die Karten (auf-*), die
             Zugbilder (zug-*) und die Bretter. Aufruf ueber das Fotoskript:
                 node tools/landing-fotos.mjs

  galerie     Die Galerie-Kacheln: Sockel in die Bildmitte (v1.90.15);
              "galerie-pruefen" misst nur und scheitert bei Abweichung.

Aufruf: python3 tools/landing_bilder.py [fotos <ordner> [was]|galerie|galerie-pruefen]
"""
import sys
from pathlib import Path
from PIL import Image

WURZEL = Path(__file__).resolve().parent.parent
LANDING = WURZEL / "public" / "landing"
PAINTED = WURZEL / "src" / "app" / "ui" / "assets" / "painted"


# ── FOTOS AUS DEM PRUEFSTAND ZUSCHNEIDEN (v1.90.25) ─────────────────────────
# Die Figur kommt als 576 x 636 px mit durchsichtigem Grund: das Gemaelde in
# seinem 576er Kasten, darueber das Band. Das Band haengt bis zu 3 px unter den
# Kasten (gemessen: Paladin 579, Dame 577) - darum 580 statt 576.
HELDEN = ["pawn", "rook", "bishop", "knight", "queen", "king",
          "paladin", "guardian", "archbishop", "amazon", "captain", "chancellor", "mage", "hawk",
          "smith", "jester", "huntress", "monk", "samurai", "sorceress", "cavalier", "fencer",
          "farmwife", "executioner", "cook", "healer"]
HELDEN_BREITE = {"pawn": 248, "rook": 308, "bishop": 229, "knight": 267, "queen": 245, "king": 271}
# Galerie: Dateiname der Kachel -> Gemaelde. Der Drache ist seit v1.90.25 fort
# (Besitzer: "mach den Drachen raus, der ist in der Stelle unangebracht"), an
# seiner Stelle steht der Spaeher.
GALERIE = {}   # v1.93.2: die Galerie der Startseite ist fort (Besitzer 7.10.: "die Figuren, wo nur
               # Name etc. steht, das kann weg") - geblieben sind die Karten mit Zugbild.
KARTEN = ["auf-kapitaen", "auf-kanzler", "auf-amazone", "auf-drache", "auf-springer6"]
ZUEGE = ["zug-knight_longleap", "zug-knight_outrider", "zug-rook_diag_step", "zug-king_dash"]
BRETTER = ["gefecht-gemischt", "brett-kronland", "brett-wolkenjoch"]

def _sichtbar(im, schwelle=20):
    return im.split()[3].point(lambda v: 255 if v > schwelle else 0).getbbox()

def fotos(roh, was="alles"):
    roh = Path(roh)
    if was in ("figuren", "alles"):
        for name in HELDEN:
            im = Image.open(roh / f"figur-{name}.png").convert("RGBA").crop((0, 0, 576, 580))
            im = im.resize((460, round(580 * 460 / 576)), Image.LANCZOS)
            # Seitlich beschnitten wie seit v1.78.0: auf jedes sichtbare Pixel
            # (Alpha > 0). Die sechs der VORDEREN Reihe behalten dazu die Breite,
            # auf die der erste Schirm eingemessen ist (v1.89.3/v1.90.15): ihre
            # Gemaelde sind seit dem 27.9. neu, der weiche Schattensaum reicht
            # heute weiter (Laeufer 288 statt 229 px) - ohne feste Breite
            # rueckte die Reihe auseinander. Mitte ist die Figur (Alpha > 8).
            if name in HELDEN_BREITE:
                fl, _, fr, _ = _sichtbar(im, 8); mitte = (fl + fr) // 2
                l = mitte - HELDEN_BREITE[name] // 2; r = l + HELDEN_BREITE[name]
            else:
                l, _, r, _ = im.split()[3].getbbox()
            aus = Image.new("RGBA", (r - l, im.height), (0, 0, 0, 0))
            aus.paste(im.crop((max(0, l), 0, min(im.width, r), im.height)), (max(0, -l), 0))
            aus.save(LANDING / f"held-{name}.webp", quality=90)
            print("held", name, r - l, im.height)
        for kachel, name in GALERIE.items():
            im = Image.open(roh / f"figur-{name}.png").convert("RGBA")
            im = im.crop(_sichtbar(im))
            im = im.resize((round(im.width * 300 / im.height), 300), Image.LANCZOS)
            im.save(LANDING / f"gal-{kachel}.webp", quality=90)
            print("gal", kachel, im.size)
        galerie()                          # Sockel in die Bildmitte, wie seit v1.90.15
    if was in ("karten", "alles"):
        for name in KARTEN:
            im = Image.open(roh / f"{name}.png").convert("RGB"); im.save(LANDING / f"{name}.webp", quality=88)
            print("karte", name, im.size)
    if was in ("zugbilder", "alles"):
        for name in ZUEGE:
            im = Image.open(roh / f"{name}.png").convert("RGB"); im.save(LANDING / f"{name}.webp", quality=92)
            print("zugbild", name, im.size)
    if was in ("bretter", "alles"):
        for name in BRETTER:
            im = Image.open(roh / f"{name}.png").convert("RGB"); im.save(LANDING / f"{name}.webp", quality=86)
            print("brett", name, im.size)


# ── GALERIE: DER SOCKEL IN DIE MITTE (v1.90.15) ──────────────────────────────
# Die zwoelf Kacheln "Was du erspielst" zeigen jedes Bild mittig in seiner
# Karte (height 150 px, width auto). Die Bilder sind aber seitlich auf die
# FIGUR beschnitten, nicht auf den Sockel - wer eine Lanze, einen Fluegel oder
# eine Schriftrolle zur Seite haelt, stand deshalb mit dem Sockel neben der
# Kartenmitte. Gemessen (Alphakanal, unterste 5 Zeilen, Alpha > 60): Kapitaen
# 0,448, Amazone 0,462, Schatten 3 0,608, Schatten 4 0,589 - bei 150 px Hoehe
# bis zu 11 px daneben. Dieselbe Regel wie im Spiel ("der Sockelfuss sitzt in
# der Bildmitte", CLAUDE.md): Ausrichtung IM Bild, nicht per CSS. Das Bild
# wird nur um durchsichtige Spalten ergaenzt, nichts an der Figur aendert sich.
GALERIE_TOLERANZ = 0.015

def fussmitte(im):
    a = im.split()[3]; w, h = im.size; px = a.load()
    bb = a.point(lambda v: 255 if v > 60 else 0).getbbox()
    xs = [x for y in range(bb[3] - 5, bb[3]) for x in range(w) if px[x, y] > 60]
    return (min(xs) + max(xs)) / 2, w

# v1.90.15 (Audit A76): die Kachel "Waechter - Bestie aus dem Riss" zeigte den
# HELDEN Schildtraeger (painted-guardian). Der Waechter ist die Bestie b01 -
# seit v1.90.25 kommt die Kachel wie alle anderen aus dem Pruefstand (GALERIE).
def galerie(nur_pruefen=False):
    schief = []
    for pfad in sorted(LANDING.glob("gal-*.webp")):
        im = Image.open(pfad).convert("RGBA")
        fx, w = fussmitte(im)
        lage = fx / w
        if abs(lage - 0.5) <= GALERIE_TOLERANZ:
            print("galerie", pfad.name, f"{lage:.3f}", "mittig"); continue
        if nur_pruefen:
            schief.append(f"{pfad.name} {lage:.3f}"); continue
        rand = int(round(abs(w - 2 * fx)))
        neu = Image.new("RGBA", (w + rand, im.height), (0, 0, 0, 0))
        neu.paste(im, (rand if fx < w / 2 else 0, 0))
        neu.save(pfad, quality=90)
        print("galerie", pfad.name, f"{lage:.3f} -> {fussmitte(neu)[0] / neu.width:.3f}", f"(+{rand} px {'links' if fx < w / 2 else 'rechts'})")
    if schief:
        print("SCHIEF:", ", ".join(schief)); sys.exit(1)


if __name__ == "__main__":
    was = sys.argv[1] if len(sys.argv) > 1 else "galerie-pruefen"
    if was == "galerie-pruefen": galerie(nur_pruefen=True); sys.exit(0)
    if was == "galerie": galerie(); sys.exit(0)
    if was == "fotos":
        if len(sys.argv) < 3: sys.exit("fotos braucht den Ordner mit den Aufnahmen (node tools/landing-fotos.mjs)")
        fotos(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "alles"); sys.exit(0)
    sys.exit(f"unbekannte Aufgabe {was!r} - siehe Kopf der Datei")
