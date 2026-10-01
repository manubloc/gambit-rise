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


def freistellen(pfad_ein, pfad_aus, hoehe=None, leinwand=None, luft=0.035, grund="gruen"):
    im = Image.open(pfad_ein).convert("RGB")
    a = np.array(im).astype(int)

    kandidat = maske_magenta(a) if grund == "magenta" else maske_gruen(a)
    markiert, _ = ndimage.label(kandidat)
    rand = set(markiert[0, :]) | set(markiert[-1, :]) | set(markiert[:, 0]) | set(markiert[:, -1])
    rand.discard(0)
    hintergrund = np.isin(markiert, list(rand))

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
        blatt.paste(frei, ((L - frei.width) // 2, unten - frei.height), frei)
        frei = blatt

    frei.save(pfad_aus)
    return frei.size


if __name__ == "__main__":
    h = int(sys.argv[3]) if len(sys.argv) > 3 else None
    L = int(sys.argv[4]) if len(sys.argv) > 4 else None
    grund = sys.argv[5] if len(sys.argv) > 5 else "gruen"   # "magenta" fuer gruene Motive
    print(sys.argv[2], freistellen(sys.argv[1], sys.argv[2], h, L, grund=grund))
