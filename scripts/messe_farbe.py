"""DIE FARBE JEDER FIGUR (v1.19.0)

Besitzerwunsch: das Stufen-Medaillon oben rechts in der vorrangigen Farbe
der Figur, und die Kulisse leicht in dieselbe Richtung getrimmt. Dafuer
braucht jede Figur EINE Farbe. Gemessen am Gemaelde: alle deckenden Pixel
oberhalb des Sockels, davon nur die gesaettigten (Kanalspanne > 60), im
HSV-Raum nach Farbton gebuendelt (24 Sektoren); der volleste Sektor gibt den
Ton, sein Mittel die Farbe. Ergebnis: src/app/ui/board/figurfarbe.json.
Aufruf: python3 scripts/messe_farbe.py"""
import json, os, colorsys
from PIL import Image

ORDNER = "src/app/ui/assets/painted"
mass = json.load(open("src/app/ui/board/sockelband.json"))
erg = {}
for f in sorted(os.listdir(ORDNER)):
    if not (f.startswith("painted-") and f.endswith(".webp")): continue
    fid = f[len("painted-"):-len(".webp")]
    im = Image.open(f"{ORDNER}/{f}").convert("RGBA").resize((144, 144)); px = im.load()
    m = mass.get(fid); sockel = (m["boden"] - 2 * m["ry"] - 6) * 144 / m["H"] if m else 120
    sekt = [[0, 0.0, 0.0, 0.0] for _ in range(24)]
    for y in range(int(sockel)):
        for x in range(144):
            r, g, b, a = px[x, y]
            if a < 200: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if s < 0.30 or v < 0.18: continue   # Hauttoene und Schatten zaehlen nicht
            k = int(h * 24) % 24
            sekt[k][0] += 1; sekt[k][1] += r; sekt[k][2] += g; sekt[k][3] += b
    best = max(sekt, key=lambda q: q[0])
    if best[0] < 30:   # fast farblos (weisser Laeufer, grauer Golem): warmes Neutral
        erg[fid] = "#8a7d66"; print(f"{fid:16} farblos -> Neutral"); continue
    n = best[0]; r, g, b = best[1] / n, best[2] / n, best[3] / n
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    # als Medaillonfarbe etwas satter und mittelhell, damit Gold und Ziffer stehen
    r2, g2, b2 = colorsys.hsv_to_rgb(h, min(1, s * 1.15), 0.62)
    erg[fid] = "#%02x%02x%02x" % (int(r2 * 255), int(g2 * 255), int(b2 * 255))
    print(f"{fid:16} {erg[fid]}  (Sektor {int(h*360):3d} Grad, {n} Pixel)")
json.dump(erg, open("src/app/ui/board/figurfarbe.json", "w"), indent=1)
print(f"\n{len(erg)} Farben -> src/app/ui/board/figurfarbe.json")
