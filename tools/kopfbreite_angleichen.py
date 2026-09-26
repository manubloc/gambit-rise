#!/usr/bin/env python3
"""Gleicht die Breite im OBEREN Teil einer Figur an - Sockel unberuehrt.

v1.80.0, Besitzerwunsch: "Warum hat der Gambit so einen breiten Kopf? Kannst
du bitte nur im oberen Teil, also der Sockel muss unberuehrt sein, aber
kannst du bitte versuchen, diese beiden ein bisschen anzugleichen ... vermess
bitte nochmal alle Stufen des Gambits und gleiche sie mit dem Bauern an. Von
der Breite, aber wichtig, den Sockel komplett in Ruhe lassen."

BAUART: zeilenweise waagerechte Skalierung um die Bildmitte. Der Faktor
laeuft von sZiel an der Figuroberkante ueber eine weiche Rampe auf exakt 1,0
und bleibt dort - unterhalb der Rampe wird KEIN Pixel angefasst, der
Sockelfuss bleibt also Byte fuer Byte, wie er war (die v1.0.62-Proben
verlangen, dass er exakt mittig sitzt).

Interpoliert wird mit VORMULTIPLIZIERTEM Alpha. Ohne das zieht die
Interpolation die Farbe durchsichtiger Randpixel (oft Schwarz) in die Figur
und es entsteht ein dunkler Saum.
"""
import sys
import numpy as np
from PIL import Image

# Das Band, an dem die Kopfbreite gemessen wird: 6 bis 18 % der Figurenhoehe.
# Darueber liegt die Kappe, darunter beginnt der Hals.
BAND = (0.06, 0.18)
RAMPE_ENDE = 0.42          # ab hier ist der Faktor 1,0 - lange vor dem Sockel


def maske(im):
    return np.array(im.split()[3]) > 60


def figurband(im):
    """(y0, hoehe) der Figur im Bild."""
    m = maske(im)
    ys = np.where(m.any(1))[0]
    return int(ys[0]), int(ys[-1] - ys[0] + 1)


def kopfbreite(im):
    """Mittlere Breite im Kopfband - das Mass, das angeglichen wird."""
    m = maske(im)
    y0, h = figurband(im)
    werte = []
    for f in np.arange(BAND[0], BAND[1] + 1e-9, 0.02):
        y = min(m.shape[0] - 1, int(y0 + h * f))
        xs = np.where(m[y])[0]
        if len(xs):
            werte.append(xs[-1] - xs[0] + 1)
    return float(np.mean(werte)) if werte else 0.0


def glatt(t):
    """smoothstep - kein Knick am Anfang und am Ende der Rampe."""
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def angleichen(pfad, ziel, ziel_datei=None, deckel=0.80):
    im = Image.open(pfad).convert("RGBA")
    y0, h = figurband(im)
    ist = kopfbreite(im)
    if ist <= 0:
        return None
    s_ziel = max(deckel, min(1 / deckel, ziel / ist))
    if abs(s_ziel - 1) < 0.005:
        return dict(datei=pfad, ist=ist, faktor=1.0, neu=ist, unveraendert=True)

    a = np.asarray(im, dtype=np.float64) / 255.0
    alpha = a[:, :, 3:4]
    vor = np.concatenate([a[:, :, :3] * alpha, alpha], axis=2)   # vormultipliziert
    H, W = vor.shape[:2]
    mitte = (W - 1) / 2.0
    xs = np.arange(W, dtype=np.float64)
    ziel_bild = vor.copy()

    ende = y0 + h * RAMPE_ENDE
    for y in range(H):
        if y > ende:
            break                                   # Sockelbereich: unberuehrt
        t = (y - y0) / (ende - y0) if ende > y0 else 1.0
        s = 1.0 + (s_ziel - 1.0) * (1.0 - glatt(t))
        if abs(s - 1.0) < 1e-4:
            continue
        quelle = mitte + (xs - mitte) / s
        for k in range(4):
            ziel_bild[y, :, k] = np.interp(quelle, xs, vor[y, :, k], left=0.0, right=0.0)

    na = ziel_bild[:, :, 3:4]
    rgb = np.divide(ziel_bild[:, :, :3], np.maximum(na, 1e-6))
    aus = np.concatenate([np.clip(rgb, 0, 1), np.clip(na, 0, 1)], axis=2)
    neu = Image.fromarray((aus * 255 + 0.5).astype(np.uint8), "RGBA")
    if ziel_datei:
        neu.save(ziel_datei, "WEBP", quality=92, method=6, lossless=False)
    return dict(datei=pfad, ist=ist, faktor=s_ziel, neu=kopfbreite(neu), bild=neu)


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(p, round(kopfbreite(Image.open(p).convert("RGBA")), 1))
