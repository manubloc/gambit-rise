#!/usr/bin/env python3
"""DIE MONSTER HELLER (v1.90.20, Besitzerwunsch 1.10.2026)

"Die Monster duerfen gerne etwas allgemein heller sein, da man sie zum Teil
gar nicht so gut erkennt wie die Figuren. Dieses 'noch heller' beim
Brandstifter ist eine gute Grundlage und sollte fuer alle Monster gelten."

DIE REGEL, GEMESSEN STATT GESCHAETZT
  Zielwert ist die mittlere Helligkeit (Median der Leuchtdichte, Rec. 709)
  des KOERPERS des Brandstifters in der Fassung "noch heller" - also aller
  deckenden Pixel oberhalb des Sockels. Jedes Monster, dessen Koerper
  dunkler ist, wird auf diesen Wert gehoben; wer schon heller ist, bleibt,
  wie er ist. Gehoben wird mit einer Gammakurve auf der Leuchtdichte
  (Y' = Y ** g, g so, dass der Median genau auf dem Ziel landet): dunkle
  Partien steigen stark, helle kaum - die Glutaugen und Lichter laufen also
  nicht in Weiss aus. Farbton und Saettigung bleiben (RGB wird je Pixel mit
  Y'/Y skaliert, gedeckelt bei 1).

  NICHT angefasst werden: der Sockel (unterhalb der gemessenen Sockelkante
  aus sockelband.json, mit weichem Uebergang von 10 px), der Alphakanal
  (sockelband.json und alle Masse bleiben gueltig) und die Glutaugen.

GEWAEHLT (Besitzer 1.10., 13:02): Stufe B, Ziel 0,24 - "in der hellsten
Variante sehen sie auf jeden Fall besser aus". Eingebaut in v1.90.20; der
Brandstifter traegt seither selbst den Median 0,24, ein erneuter Lauf mit dem
Standardziel aendert also nichts mehr (gewollt: die Regel ist idempotent).

AUFRUF
  python3 tools/monster-aufhellen.py messen
  python3 tools/monster-aufhellen.py rechnen <zielordner>     (schreibt groß + klein/)
  python3 tools/monster-aufhellen.py einbauen                 (ueberschreibt src/.../painted)
"""
import json, os, sys
import numpy as np
from PIL import Image

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GEMAELDE = os.path.join(WURZEL, "src/app/ui/assets/painted")
MASS = json.load(open(os.path.join(WURZEL, "src/app/ui/board/sockelband.json")))
ZIEL_ID = "boss-b13"          # der Brandstifter in "noch heller" (v1.90.20)
MONSTER = [f"boss-b{n:02d}" for n in range(1, 26)]
MAX_GAMMA_HUB = 0.42          # g nie unter 0.42 - sonst kippen Schatten in Grau


def lum(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def koerper_maske(fid, H, W):
    """1 ueber dem Sockel, 0 im Sockel, weicher Uebergang (10 px bei 576)."""
    m = MASS.get(fid)
    kante = (m["boden"] - 2 * m["ry"] - 6) / m["H"] if m else 0.80
    y = np.arange(H)[:, None] / H
    weich = 10 / 576
    w = np.clip((kante - y) / weich, 0, 1)
    return np.repeat(w, W, axis=1)


def koerper_median(fid, a):
    rgb = a[..., :3]; al = a[..., 3]
    k = koerper_maske(fid, *al.shape)
    sel = (al > 0.78) & (k > 0.99)
    return float(np.median(lum(rgb)[sel])) if sel.any() else None


def lade(pfad):
    return np.asarray(Image.open(pfad).convert("RGBA")).astype(np.float64) / 255.0


def hebe(fid, a, ziel):
    med = koerper_median(fid, a)
    if med is None or med >= ziel:
        return a, med, 1.0
    g = max(MAX_GAMMA_HUB, np.log(ziel) / np.log(max(med, 1e-3)))
    rgb = a[..., :3]; al = a[..., 3]
    y = np.clip(lum(rgb), 1e-4, 1)
    y2 = y ** g
    k = koerper_maske(fid, *al.shape)
    # Glutaugen (sehr hell UND satt) bleiben, wie sie sind
    mx = rgb.max(-1); mn = rgb.min(-1); s = np.where(mx > 1e-6, (mx - mn) / np.maximum(mx, 1e-6), 0)
    glut = (mx > 0.80) & (s > 0.55)
    faktor = np.where(glut, 1.0, y2 / y)
    neu = np.clip(rgb * faktor[..., None], 0, 1)
    out = rgb * (1 - k[..., None]) + neu * k[..., None]
    return np.concatenate([out, al[..., None]], -1), med, g


def speichere(a, pfad):
    os.makedirs(os.path.dirname(pfad), exist_ok=True)
    Image.fromarray((a * 255 + 0.5).astype(np.uint8), "RGBA").save(pfad, lossless=False, quality=92, method=6)


def ziel_wert():
    """Ziel ist der Brandstifter "noch heller". ZIEL=0.24 setzt ihn von aussen
    (fuer Vorschauen einer hellere Stufe)."""
    if os.environ.get("ZIEL"):
        return float(os.environ["ZIEL"])
    return koerper_median(ZIEL_ID, lade(os.path.join(GEMAELDE, f"painted-{ZIEL_ID}.webp")))


def main():
    art = sys.argv[1] if len(sys.argv) > 1 else "messen"
    ziel = ziel_wert()
    print(f"Ziel (Koerper-Median {ZIEL_ID}, 'noch heller'): {ziel:.3f}")
    for fid in MONSTER:
        quelle = os.path.join(GEMAELDE, f"painted-{fid}.webp")
        if not os.path.exists(quelle):
            continue
        a = lade(quelle)
        neu, med, g = hebe(fid, a, ziel)
        nachher = koerper_median(fid, neu)
        print(f"  {fid:10} vorher {med:.3f}  nachher {nachher:.3f}  gamma {g:.2f}{'  (bleibt)' if g == 1.0 else ''}")
        if art in ("rechnen", "einbauen"):
            if g == 1.0:
                continue
            ordner = GEMAELDE if art == "einbauen" else sys.argv[2]
            speichere(neu, os.path.join(ordner, f"painted-{fid}.webp"))
            kq = os.path.join(GEMAELDE, "klein", f"painted-{fid}.webp")
            kneu, _, _ = hebe(fid, lade(kq), ziel)
            speichere(kneu, os.path.join(ordner, "klein", f"painted-{fid}.webp"))


if __name__ == "__main__":
    main()
