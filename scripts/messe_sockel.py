"""DER SOCKEL JEDER FIGUR, VERMESSEN (v1.17.0)

Besitzerwunsch: das Lebensband gehoert IN den Sockel - als Ring auf der
Vorderseite des Tellers, rot links, dunkel in der Mitte, blau rechts, mit
Goldrand. Dafuer wird jeder Sockel einzeln vermessen: wo seine Unterkante
als Ellipse verlaeuft, wie breit er ist, wie hoch seine Vorderseite steht.
Ergebnis: src/app/ui/board/sockelband.json, in Bildpixeln.

Messung an der Alphamaske:
- unterste deckende Zeile je Spalte = die Bodenkante des Tellers (Bogen)
- Tellerbreite = breiteste Zeile in den unteren 12 % der sichtbaren Figur
- Ellipse: cx = Mitte der Tellerbreite, rx = halbe Breite, ry = Bogentiefe,
  hochgerechnet aus Mitte gegen Rand bei 92 % der Breite
- Plateaukante = von unten hoch, bis die Breite unter 62 % faellt
  (dieselbe Regel wie sockelmass.js)
Aufruf: python3 scripts/messe_sockel.py"""
import json, math, os
from PIL import Image

ORDNER = "src/app/ui/assets/painted"
# ── HANDWERTE: SUCHZONE DES TELLERS (v1.90.21) ──────────────────────────────
# Gesucht wird die breiteste Zeile in den unteren 12 % der Figur. Osric
# (boss-b25, seit v1.90.21 groesser gerechnet) traegt einen Umhang, der NEBEN
# dem Sockel bis knapp ueber den Boden haengt: seine Ecken liegen bei 11,8 %
# und sind breiter als der Teller. Gemessen mit der Regel fuer alle stand er
# am Brett bei 68 % statt 100 % (rx 190,5 statt 129,6). Eine allgemeine
# Regel ("die Aussenspalten muessen bis an den Boden reichen") verschob fuenf
# andere Figuren mit tiefem Tellerbogen (Schatzkammer um 8,5 px) - darum ein
# Handwert wie in messe_tellerkante.py: sein Teller ist breitester Punkt bei
# 4,9 %, die Zone fuer ihn endet bei 7 %.
SUCHZONE = {"boss-b25": 0.07, "boss-b36": 0.08}   # v1.91.0: der neue Osric - sein Mantelsaum haengt bei 12 % und ist breiter als der Teller
# ── HANDWERTE: DER SCHEITEL (v1.91.0) ───────────────────────────────────────
# `oben` ist sonst die erste deckende Zeile. Bei zwei Figuren soll aber etwas
# UEBER die gemeinsame Hoehenlinie ragen duerfen (Besitzer 6.10.2026):
#   gladiator  "seine Kugel auf dem Helm darf ueber die Linie hinausgehen" -
#              der Helm reicht bis y 40, die Kugel steht darueber (ab y 1)
#   boss-b36   Osric: "die Krone darf ueber die 100-%-Marke gehen ... er darf
#              definitiv der Groesste im Spiel sein" - die Zacken stehen ueber
#              y 66; gemessen wird ab dort (96 % am Brett), sichtbar sind 108 %
# Ohne den Handwert hielte die Hoehenklammer (paintedArt.js, mStreck) Kugel und
# Krone fuer den Kopf und druckte die ganze Figur samt Band zusammen.
OBEN_VON_HAND = {"gladiator": 40, "boss-b36": 66}
erg = {}
for f in sorted(os.listdir(ORDNER)):
    if not (f.startswith("painted-") and f.endswith(".webp")): continue
    fid = f[len("painted-"):-len(".webp")]
    im = Image.open(f"{ORDNER}/{f}").convert("RGBA"); W, H = im.size
    a = im.getchannel("A").load()
    boden = [-1] * W
    for x in range(W):
        for y in range(H - 1, -1, -1):
            if a[x, y] > 40: boden[x] = y; break
    bmax = max(boden)
    if bmax < 0: continue
    breite = [0] * H; links = [W] * H; rechts = [-1] * H
    for y in range(H):
        n = 0
        for x in range(W):
            if a[x, y] > 40:
                n += 1
                if x < links[y]: links[y] = x
                if x > rechts[y]: rechts[y] = x
        breite[y] = n
    oben = 0
    while oben < H and breite[oben] == 0: oben += 1
    hoehe = bmax - oben
    tY, tB = bmax, 0
    for y in range(bmax, int(bmax - hoehe * SUCHZONE.get(fid, 0.12)), -1):
        if breite[y] > tB: tB, tY = breite[y], y
    cx = (links[tY] + rechts[tY]) / 2; rx = tB / 2
    mitte = boden[round(cx)]
    rl = boden[round(cx - rx * 0.92)]; rr = boden[round(cx + rx * 0.92)]
    tiefe = max(2, mitte - (rl + rr) / 2)
    ry = tiefe / (1 - math.sqrt(1 - 0.92 ** 2))
    # DER FARBRING: jeder Sockel traegt am Fuss einen farbigen Ring (die
    # Sockelfarbe der Figur), darueber den grauen Teller. Gemessen am
    # Mittelpixel von unten hoch: solange die Farbe gesaettigt ist (Spanne
    # der Kanaele > 46), sind wir im Ring; die ersten dunklen Pixel sind die
    # Schattenkante. Der Ring ist genau die Zone, in die das Band gehoert.
    px = im.load(); x0 = round(cx); ring = 0; y = mitte
    while y > oben and px[x0, y][3] > 40 and max(px[x0, y][:3]) < 60: y -= 1   # Schattenkante
    schatten = mitte - y
    while y > oben and px[x0, y][3] > 40 and (max(px[x0, y][:3]) - min(px[x0, y][:3])) > 46: y -= 1; ring += 1
    ring = max(8, ring)
    erg[fid] = {"W": W, "H": H, "cx": round(cx, 1), "rx": round(rx, 1), "ry": round(ry, 1), "boden": mitte, "ring": ring, "schatten": schatten, "oben": OBEN_VON_HAND.get(fid, oben), **({"obenVonHand": True} if fid in OBEN_VON_HAND else {})}   # oben: erste deckende Zeile = Scheitel der Figur
    print(f"{fid:16} Teller {tB}px breit, Boden y={mitte}, Bogen ry={ry:.1f}, Farbring {ring}px, Schatten {schatten}px")
os.makedirs("src/app/ui/board", exist_ok=True)
json.dump(erg, open(os.environ.get("AUS", "src/app/ui/board/sockelband.json"), "w"), indent=1)
print(f"\n{len(erg)} Sockel vermessen -> src/app/ui/board/sockelband.json")
