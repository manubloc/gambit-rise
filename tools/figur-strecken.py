"""EINE FIGUR UEBER IHREM SOCKEL SENKRECHT STRECKEN (v1.90.25)

Am Brett zaehlt allein Hoehe : Teller-Halbbreite (paintedArt.js zieht jeden
Teller auf 136 px). Soll eine Figur "minimal hoeher" werden (Besitzer 3.10. zum
Hetzer), gibt es zwei Wege:

  tools/koerper-groesser.py  vergroessert den Koerper um den Standpunkt und
      laesst den Sockel pixelgleich. Dafuer muss es Koerper und Tellerflaeche
      TRENNEN - bei Osric ging das, am Waechter und am Hetzer blieben Loecher
      in der Standflaeche und Geisterkanten an den Pfoten (gemessen 3.10.).
  dieses Werkzeug  trennt nichts. Es streckt alle Bildzeilen OBERHALB einer
      waagrechten Linie um einen Faktor; die Linie liegt an der HINTEREN Kante
      der Standflaeche. Darunter (Sockel, Pfoten auf der Flaeche) bleibt jedes
      Pixel, wie es ist; darueber gibt es nur Koerper. An der Linie selbst
      aendert sich nichts, also entsteht keine Naht.

Der Preis: die Figur wird etwas schlanker (bei 8 % kaum zu sehen, ab etwa
15 % sichtbar). Fuer mehr braucht es ein neues Bild.

Eingang: ein FREIGESTELLTES Bild (RGBA, beliebige Groesse - am besten der
2x-Freisteller: freistellen.py <roh> <aus> 1070 1152 ...).
Ausgang: Spielmass wie freistellen.py - 535 hoch, 576 Leinwand, 3,5 % Luft
unten, mittig nach dem Sockelfuss.

  python3 tools/figur-strecken.py <ein.png> <aus.png> --linie <y> --ziel 0.90
  python3 tools/figur-strecken.py <ein.png> <aus.png> --linie <y> --faktor 1.08
  ... --diag <bild.png>   zeichnet Linie und Tellerbreite ueber den Eingang

--linie in Pixeln des Eingangs. Sie gehoert an die hintere Kante der
Standflaeche: dort, wo die Tellerwand oben endet, minus die halbe Bogentiefe.
Erst mit --diag ansehen, dann rechnen."""
import argparse, json
import numpy as np
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument("eingang"); ap.add_argument("aus")
ap.add_argument("--linie", type=float, required=True)
ap.add_argument("--ziel", type=float); ap.add_argument("--faktor", type=float)
ap.add_argument("--diag")
arg = ap.parse_args()

im = Image.open(arg.eingang).convert("RGBA")
A = np.array(im); al = A[:, :, 3]; H, W = al.shape
deck = al > 40
zeilen = np.where(deck.any(axis=1))[0]; oben, boden = int(zeilen[0]), int(zeilen[-1])
breite = deck.sum(axis=1)
# Teller: breiteste Zeile in den unteren 12 % (wie scripts/messe_sockel.py)
zone = range(boden, int(boden - (boden - oben) * 0.12), -1)
ty = max(zone, key=lambda y: breite[y]); xs = np.where(deck[ty])[0]
rx = (xs[-1] - xs[0] + 1) / 2; cx = (xs[0] + xs[-1]) / 2
lin = int(round(arg.linie))
if not (oben < lin < boden): raise SystemExit(f"--linie {lin} liegt nicht in der Figur ({oben}..{boden})")
heute = (boden - oben) * 136 / rx / 561
if arg.faktor: s = arg.faktor
elif arg.ziel: s = (arg.ziel * 561 / 136 * rx - (boden - lin)) / (lin - oben)
else: raise SystemExit("--ziel oder --faktor angeben")
if s < 1: raise SystemExit(f"Faktor {s:.3f} < 1 - die Figur steht schon hoeher als das Ziel ({heute*100:.1f} %)")

if arg.diag:
    d = im.copy(); z = ImageDraw.Draw(d)
    z.line([(0, lin), (W, lin)], fill=(255, 60, 60, 255), width=2)
    z.line([(cx - rx, ty), (cx + rx, ty)], fill=(60, 220, 255, 255), width=2)
    z.line([(cx, 0), (cx, H)], fill=(255, 255, 255, 120), width=1)
    bg = Image.new("RGBA", d.size, (78, 52, 132, 255)); bg.alpha_composite(d); bg.save(arg.diag)

# vormultipliziert strecken, damit an der Silhouette kein dunkler Saum entsteht
P = A.astype(np.float32); P[:, :, :3] *= P[:, :, 3:4] / 255.0
kopf = Image.fromarray(np.clip(P[oben:lin], 0, 255).astype(np.uint8), "RGBA")
neu_h = int(round((lin - oben) * s))
kopf = np.array(kopf.resize((W, neu_h), Image.LANCZOS)).astype(np.float32)
fuss = P[lin:boden + 1]
ganz = np.concatenate([kopf, fuss], axis=0)
a = ganz[:, :, 3:4]
rgb = np.where(a > 0, ganz[:, :, :3] / np.maximum(a, 1e-3) * 255.0, 0)
voll = Image.fromarray(np.concatenate([rgb, a], axis=2).clip(0, 255).astype(np.uint8), "RGBA")

# Spielmass: 535 hoch, 576 Leinwand, 3,5 % Luft, mittig nach dem Sockelfuss
al2 = np.array(voll)[:, :, 3]
yy, xx = np.where(al2 > 60)
frei = voll.crop((xx.min(), yy.min(), xx.max() + 1, yy.max() + 1))
f = 535 / frei.height
frei = frei.resize((round(frei.width * f), 535), Image.LANCZOS)
fa = np.array(frei)[:, :, 3]
fx = np.where((fa[-5:] > 60).any(axis=0))[0]
L = 576; unten = L - round(L * 0.035)
links = int(round(L / 2 - (fx.min() + fx.max()) / 2))
if links < 0 or links + frei.width > L: raise SystemExit(f"der Umriss ragt aus der Leinwand (links {links}, Breite {frei.width})")
blatt = Image.new("RGBA", (L, L), (0, 0, 0, 0)); blatt.paste(frei, (links, unten - frei.height), frei); blatt.save(arg.aus)
neu = (boden - lin + neu_h) * 136 / rx / 561
print(json.dumps({"aus": arg.aus, "faktor": round(s, 4), "linie": lin, "oben": oben, "boden": boden, "rx": rx,
                  "brett_heute": round(heute * 100, 1), "brett_neu": round(neu * 100, 1)}))
