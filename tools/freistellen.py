"""Greenscreen sauber entfernen und auf Spielmass bringen.

Zwei Lehren stecken hier drin:

1. RGB-ABSTAND TAUGT NICHT. Der erste Versuch verglich jedes Pixel mit der
   Hintergrundfarbe. Am weichen Verlauf blieben Reste, und beim Magenta
   verschwanden halbe Gesichter, weil der Hautton farblich nahe lag.
   Gruen hat dagegen einen sehr eigenen FARBTON (hue): alles, was gruenlich
   UND halbwegs gesaettigt ist, ist Hintergrund - unabhaengig von der
   Helligkeit. Damit fallen auch die dunklen Verlaufsecken.

2. NUR WAS VOM RAND ZUSAMMENHAENGT. Sonst reisst der Filter Loecher in
   Figurteile, die zufaellig in den Farbbereich fallen.

Dazu das Entgruenen: an der Silhouette mischt das Modell etwas Gruen ins
Holz. Diese Pixel werden entsaettigt, statt sie wegzuschneiden - sonst
frisst man die Kante der Figur mit.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def maske_gruen(a):
    """True, wo das Pixel zum gruenen Hintergrund gehoert."""
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    maxv = a.max(axis=2)
    minv = a.min(axis=2)
    saettigung = (maxv - minv) / np.maximum(maxv, 1)
    # gruen dominiert deutlich ueber beide anderen Kanaele
    return (g > r + 18) & (g > b + 18) & (saettigung > 0.22)


def entgruenen(rgb, wo):
    """Gruenstich aus den Randpixeln nehmen, ohne sie zu entfernen."""
    r, g, b = (rgb[:, :, i].astype(int) for i in range(3))
    ueber = wo & (g > (r + b) / 2)
    if ueber.any():
        gedeckelt = np.minimum(g, ((r + b) / 2).astype(int) + 6)
        rgb[:, :, 1] = np.where(ueber, gedeckelt, g).astype(np.uint8)
    return rgb


def maske_magenta(a):
    """True, wo das Pixel zum MAGENTA-Hintergrund (#FF00FF) gehoert.
    v1.90.21: fuer Figuren mit echtem Gruen (Efeu, Moos) - auf Gruen wuerde
    entgruenen() die ganze Figur entfaerben. Magenta heisst: Rot UND Blau
    liegen deutlich ueber Gruen."""
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    maxv = a.max(axis=2)
    minv = a.min(axis=2)
    saettigung = (maxv - minv) / np.maximum(maxv, 1)
    return (r > g + 40) & (b > g + 40) & (saettigung > 0.30)


def entmagenta(rgb, saum):
    """Magentastich NUR im Saum nehmen: die Figur darf Rot und Blau tragen,
    aber am Rand mischt das Modell den Hintergrund hinein."""
    r, g, b = (rgb[:, :, i].astype(int) for i in range(3))
    stich = np.clip(np.minimum(r, b) - g, 0, None)
    wo = saum & (stich > 12)
    rgb[:, :, 0] = np.where(wo, r - (stich * 0.8).astype(int), r).clip(0, 255).astype(np.uint8)
    rgb[:, :, 2] = np.where(wo, b - (stich * 0.8).astype(int), b).clip(0, 255).astype(np.uint8)
    return rgb


def maske_gruen_streng(a):
    """Wie maske_gruen, aber nur KRAEFTIGES Gruen (v1.90.23). Fuer Bilder, in
    denen der Sockel selbst gruenstichig im Schatten liegt: am Hetzer (FLUX
    Kontext, 3.10.) hielt die weite Maske die schattige Sockelwand
    (z. B. 52/75/33) fuer Hintergrund und riss Zacken in den Tellerrand."""
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    maxv = a.max(axis=2)
    minv = a.min(axis=2)
    saettigung = (maxv - minv) / np.maximum(maxv, 1)
    return (g > r + 50) & (g > b + 40) & (saettigung > 0.45)


def kraeftig(a, grund):
    """Unverkennbarer Hintergrund - das Mass, an dem eine TASCHE erkannt wird."""
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    if grund == "magenta":
        return (r > g + 70) & (b > g + 70)
    return (g > r + 70) & (g > b + 40)


def freistellen(pfad_ein, pfad_aus, hoehe=None, leinwand=None, luft=0.035, grund="gruen", extras=()):
    """extras (v1.90.23, sechstes Argument, mit Komma getrennt):
      taschen     - auch EINGESCHLOSSENER Hintergrund faellt (zwischen den
                    Beinen, zwischen Arm und Koerper). Ohne den Schalter gilt
                    die alte Regel "nur was vom Rand zusammenhaengt": an den
                    aufrecht stehenden Monstern blieben sonst farbige Flecken
                    zwischen den Beinen. Eine Tasche zaehlt ab 40 px und nur,
                    wenn sie ueberwiegend aus kraeftigem Hintergrund besteht.
      streng      - nur kraeftiges Gruen ist Hintergrund (maske_gruen_streng).
      sockelmitte - die Figur wird nach dem SOCKELFUSS mittig gesetzt
                    (unterste 5 Zeilen, Alpha > 60), nicht nach dem Umriss.
                    Traegt eine Figur einen Schild an der Seite, sitzt der
                    Umriss mittig und der Sockel daneben."""
    im = Image.open(pfad_ein).convert("RGB")
    a = np.array(im).astype(int)

    if grund == "magenta":
        kandidat = maske_magenta(a)
    else:
        kandidat = maske_gruen_streng(a) if "streng" in extras else maske_gruen(a)
    markiert, anzahl = ndimage.label(kandidat)
    rand = set(markiert[0, :]) | set(markiert[-1, :]) | set(markiert[:, 0]) | set(markiert[:, -1])
    rand.discard(0)
    hintergrund = np.isin(markiert, list(rand))
    if "taschen" in extras and anzahl:
        gross = ndimage.sum(kandidat, markiert, range(1, anzahl + 1))
        stark = ndimage.sum(kraeftig(a, grund) & kandidat, markiert, range(1, anzahl + 1))
        taschen = [i + 1 for i in range(anzahl)
                   if (i + 1) not in rand and gross[i] >= 40 and stark[i] / gross[i] > 0.5]
        hintergrund |= np.isin(markiert, taschen)

    alpha = np.where(hintergrund, 0, 255).astype(np.uint8)
    alpha = np.array(Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3)))

    # Entgruenen auf der GANZEN Figur, nicht nur am Saum: der Greenscreen
    # faerbt auch den Sockel ein (gemessen: 5-6 % der Figurflaeche blieben
    # gruenstichig). Keine Figur dieses Spiels traegt echtes Gruen - was
    # gruen wirkt, ist immer Reflex des Hintergrunds.
    if grund == "magenta":
        innen = alpha > 60
        saum = innen & ~ndimage.binary_erosion(innen, iterations=4)
        rgb = entmagenta(a.astype(np.uint8).copy(), saum)
    else:
        rgb = entgruenen(a.astype(np.uint8).copy(), alpha > 60)

    frei = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    ys, xs = np.where(alpha > 60)
    frei = frei.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    if hoehe:                       # auf einheitliche Figurenhoehe bringen
        breite = round(frei.width * hoehe / frei.height)
        frei = frei.resize((breite, hoehe), Image.LANCZOS)
    if leinwand:                    # mittig auf quadratische Leinwand, Fuss unten
        L = leinwand
        blatt = Image.new("RGBA", (L, L), (0, 0, 0, 0))
        unten = L - round(L * luft)
        links = (L - frei.width) // 2
        if "sockelmitte" in extras:
            al = np.array(frei)[:, :, 3]
            xs = np.where((al[-5:] > 60).any(axis=0))[0]
            links = int(round(L / 2 - (xs.min() + xs.max()) / 2))
            if links < 0 or links + frei.width > L:
                raise SystemExit(f"sockelmitte: der Umriss ragt aus der Leinwand (links {links}, Breite {frei.width})")
        blatt.paste(frei, (links, unten - frei.height), frei)
        frei = blatt

    frei.save(pfad_aus)
    return frei.size


if __name__ == "__main__":
    h = int(sys.argv[3]) if len(sys.argv) > 3 else None
    L = int(sys.argv[4]) if len(sys.argv) > 4 else None
    grund = sys.argv[5] if len(sys.argv) > 5 else "gruen"   # "magenta" fuer gruene Motive
    extras = tuple(sys.argv[6].split(",")) if len(sys.argv) > 6 else ()   # taschen,streng,sockelmitte
    print(sys.argv[2], freistellen(sys.argv[1], sys.argv[2], h, L, grund=grund, extras=extras))
