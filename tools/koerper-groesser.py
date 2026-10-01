"""DEN KOERPER GROESSER RECHNEN, DER SOCKEL BLEIBT PIXELGLEICH (v1.90.23)

Am Brett zaehlt allein Hoehe : Sockel-Halbbreite (paintedArt.js zieht jeden
Teller auf 136 px). Ein Monster, das flach und breit auf einem breiten Teller
steht, wirkt deshalb klein. Statt neu zu malen: der Koerper samt Fuessen wird
um den Standpunkt vergroessert, der Sockel bleibt wie gemalt.
Erprobt an Osric (v1.90.21/22: 77 % -> 99,6 % am Brett).

DREI SCHICHTEN auf einem 2x-Freisteller (freistellen.py <roh> <aus> 1070 1152):
  E  hinten : was hinter dem Teller verschwindet, im ZIEL nach unten bis hinter
              die Tellerkante verlaengert - sonst klafft Luft, weil der
              vergroesserte Saum nach oben wandert.
  S  Mitte  : der Sockel wie gemalt. Wo die Fuesse auf der Tellerflaeche
              standen, wird die Flaeche zeilenweise aus ihren Nachbarn ergaenzt.
  K  vorne  : der Koerper samt Fuessen, um s vergroessert um (CX, YA).
Getrennt wird je Fussspalte an der KONTAKTLINIE (letzte dunkle Zeile vor der
hellen Tellerflaeche), damit der Kontaktschatten an den Fuessen bleibt.

GEMESSEN wird selbst (alles im 2x-Bild, ueberschreibbar):
  - Sockel: breiteste Zeile der unteren --zone (12 %) -> CX, RX
  - Wandoberkante YTC: von dort aufwaerts, solange beide Kanten auf der
    Tellerbreite bleiben (Knick wie messe_tellerkante.py, oder ein Sprung
    nach aussen - Umhang, Schild, Fluegel)
  - Bodenbogen ry_b wie messe_sockel.py; die Tellerflaeche ist flacher als der
    Boden: RY = --ry-faktor x ry_b (Osric: 37 bei ry_b 65 -> 0,57)
  - Standlinie YA = YTC + 0,2 RY
Die FUSSSPALTEN gibt man von Hand (--fuesse 290-474,646-808): eine Automatik
hat bei Osric den Schlagschatten zwischen den Fuessen nicht von den Sohlen
unterschieden (beide 12-20 px tief). Das Diagnosebild (--diag) zeigt
Ellipsen, Wand, Standlinie und Fussspalten ueber dem Bild - erst ansehen, dann
rechnen.

GROESSE: --ziel 0.95 rechnet s so, dass die Figur am Brett 95 % der
Offiziershoehe steht (Hoehe 561 bei Teller 136); oder --s direkt.

Danach Spielmass wie freistellen.py: 535 hoch, 576 Leinwand, 3,5 % Luft unten,
mittig nach dem SOCKEL (nicht nach dem Umriss).

FALLEN (an Osric bezahlt):
  - Haengt etwas NEBEN dem Sockel bis knapp ueber den Boden, irren drei
    Messungen danach (messe_sockel SUCHZONE, messe_tellerkante HANDWERTE,
    sockelmass.js kanteVonHand) - siehe CLAUDE.md.
  - `teller` ist der Abstand der beiden Ellipsenmitten (Boden - ry - YTC).
  - Zu flache RY laesst helle Tellerecken in den Koerper fallen; sie wandern
    beim Vergroessern als graue Splitter neben den Sockel.

Aufruf:
  python3 tools/koerper-groesser.py <hr.png> <aus.png> --ziel 0.95 \\
      [--fuesse a-b,c-d] [--diag diag.png] [--cx --rx --ytc --ry --ya]
"""
import argparse, json, math
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ap = argparse.ArgumentParser()
ap.add_argument("eingang"); ap.add_argument("aus")
ap.add_argument("--ziel", type=float); ap.add_argument("--s", type=float)
ap.add_argument("--zone", type=float, default=0.12)
ap.add_argument("--ry-faktor", type=float, default=0.57)
ap.add_argument("--cx", type=float); ap.add_argument("--rx", type=float)
ap.add_argument("--ytc", type=float); ap.add_argument("--ry", type=float); ap.add_argument("--ya", type=float)
ap.add_argument("--fuesse", default="")
ap.add_argument("--diag")
ap.add_argument("--nur-messen", action="store_true")
arg = ap.parse_args()

A = np.array(Image.open(arg.eingang).convert("RGBA")).astype(np.float32)
H, W = A.shape[:2]
al = A[:, :, 3]
Lum = 0.3 * A[:, :, 0] + 0.59 * A[:, :, 1] + 0.11 * A[:, :, 2]
deck = al > 130

# ── Messen ────────────────────────────────────────────────────────────────
zeilen = np.where((al > 40).any(axis=1))[0]
oben, bmax = int(zeilen[0]), int(zeilen[-1])
hoehe = bmax - oben
breite = np.zeros(H); links = np.full(H, -1); rechts = np.full(H, -1)
for y in range(H):
    xs = np.where(deck[y])[0]
    if len(xs):
        links[y], rechts[y] = xs[0], xs[-1]; breite[y] = xs[-1] - xs[0] + 1
tY = max(range(bmax, int(bmax - hoehe * arg.zone), -1), key=lambda y: breite[y])
CX = arg.cx if arg.cx is not None else (links[tY] + rechts[tY]) / 2
RX = arg.rx if arg.rx is not None else breite[tY] / 2
# Bodenbogen wie messe_sockel.py
def boden_an(x):
    c = np.where(al[:, int(round(x))] > 40)[0]
    return c[-1] if len(c) else bmax
mitte = boden_an(CX)
tiefe = max(2, mitte - (boden_an(CX - RX * 0.92) + boden_an(CX + RX * 0.92)) / 2)
ry_b = tiefe / (1 - math.sqrt(1 - 0.92 ** 2))
# Wandoberkante: aufwaerts ab der breitesten Zeile
if arg.ytc is not None:
    YTC = arg.ytc
else:
    w0 = breite[tY]; ytc = tY
    for y in range(tY, max(oben, tY - 400), -1):
        if links[y] < 0: break
        aussen = (links[y] < links[tY] - 4) or (rechts[y] > rechts[tY] + 4)
        fall = (breite[y + 1] - breite[y - 2]) / 3.0 if y - 2 > 0 else 0
        if aussen or (w0 - breite[y]) > w0 * 0.02 or fall > w0 * 0.004 * 3:
            break
        ytc = y
    YTC = float(ytc)
RY = arg.ry if arg.ry is not None else arg.ry_faktor * ry_b
YA = arg.ya if arg.ya is not None else YTC + 0.2 * RY
fuesse = [tuple(int(v) for v in t.split("-")) for t in arg.fuesse.split(",") if t]

mass = dict(oben=oben, boden=int(mitte), cx=round(float(CX), 1), rx=round(float(RX), 1),
            ry_boden=round(float(ry_b), 1), ytc=round(float(YTC), 1), ry=round(float(RY), 1),
            ya=round(float(YA), 1), fuesse=fuesse)
brett_heute = 136 * (mitte - oben) / (561 * RX)
mass["brett_heute"] = round(brett_heute * 100, 1)

if arg.s:
    s = arg.s
elif arg.ziel:
    s = (arg.ziel * 561 * RX / 136 - (mitte - YA)) / (YA - oben)
else:
    s = 1.0
mass["s"] = round(float(s), 3)

def bogen(x, yc=None):
    yc = YTC if yc is None else yc
    w = np.sqrt(np.clip(1 - ((x - CX) / RX) ** 2, 0, 1))
    return yc - RY * w, yc + RY * w

if arg.diag:
    D = Image.fromarray(A.clip(0, 255).astype(np.uint8), "RGBA")
    grund = Image.new("RGBA", D.size, (70, 48, 120, 255)); grund.alpha_composite(D)
    d = ImageDraw.Draw(grund)
    for x0, x1 in fuesse:
        d.rectangle([x0, YTC - RY - 40, x1, YTC + RY], outline=(0, 255, 255, 255), width=2)
    pts_h = [(x, bogen(x)[0]) for x in np.linspace(CX - RX, CX + RX, 80)]
    pts_v = [(x, bogen(x)[1]) for x in np.linspace(CX - RX, CX + RX, 80)]
    d.line(pts_h, fill=(255, 220, 0, 255), width=2); d.line(pts_v, fill=(255, 120, 0, 255), width=2)
    d.line([(CX - RX, 0), (CX - RX, H)], fill=(255, 60, 60, 255)); d.line([(CX + RX, 0), (CX + RX, H)], fill=(255, 60, 60, 255))
    d.line([(0, YTC), (W, YTC)], fill=(255, 255, 255, 180)); d.line([(0, YA), (W, YA)], fill=(0, 255, 0, 255))
    d.line([(CX, 0), (CX, H)], fill=(255, 255, 255, 120))
    grund.convert("RGB").save(arg.diag)

print(json.dumps(mass))
if arg.nur_messen:
    raise SystemExit

# ── Schichten ─────────────────────────────────────────────────────────────
ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
innen = np.abs(xs - CX) <= RX
y_hinten, y_vorne = bogen(xs)
sockel = (innen & (ys >= y_hinten)) | (ys >= YTC + 2)

kontakt = np.full(W, -1.0)
for x0, x1 in fuesse:
    gefunden = {}
    for x in range(x0, x1 + 1):
        yh = bogen(x)[0]; b = yh
        for y in range(int(yh) + 1, int(bogen(x)[1])):
            if Lum[y, x] < 66 and Lum[y + 1:y + 9, x].mean() >= 70 and al[y, x] > 130:
                b = y
        if b > yh + 3:
            gefunden[x] = b
    # Luecken aus den Nachbarspalten DESSELBEN Fusses fuellen - einzelne
    # Spalten ohne Treffer machten am Waechter (brauner Teller, kein dunkler
    # Kontaktschatten) senkrechte Streifen; ohne jeden Treffer gilt die
    # Standlinie YA.
    xs_f = np.arange(x0, x1 + 1)
    if len(gefunden) >= 3:
        gx = np.array(sorted(gefunden)); gy = np.array([gefunden[x] for x in gx], float)
        werte = np.interp(xs_f, gx, gy)
    else:
        werte = np.full(len(xs_f), YA)
    werte = ndimage.median_filter(werte, size=9)
    kontakt[x0:x1 + 1] = np.maximum(werte, bogen(xs_f)[0] + 4)
loch = innen & (ys >= y_hinten) & (ys <= kontakt[None, :]) & (al > 0)

koerper = (~sockel | loch) & (al > 0)
B = A.copy(); B[~koerper] = 0
S = A.copy(); S[~sockel] = 0
flaeche = innen & (ys >= y_hinten) & (ys <= y_vorne + 3)
for y in range(int(YTC - RY) - 1, int(YTC + RY) + 5):
    zl = loch[y]
    if not zl.any(): continue
    gx = np.where(flaeche[y] & ~zl & (S[y, :, 3] > 200))[0]
    if len(gx) < 2: continue
    lx = np.where(zl)[0]
    for k in range(3):
        S[y, lx, k] = np.interp(lx, gx, S[y, gx, k])
    S[y, lx, 3] = 255

def vm(Q):
    P = Q.copy(); P[:, :, :3] *= P[:, :, 3:4] / 255.0
    return P
PAD_O = max(40, int((s - 1) * YA) + 40)
PAD_S = max(60, int((s - 1) * W / 2) + 60)
Hn, Wn = H + PAD_O, W + 2 * PAD_S
def skaliere(Q):
    g = np.array(Image.fromarray(vm(Q).clip(0, 255).astype(np.uint8), "RGBA")
                 .resize((round(W * s), round(H * s)), Image.LANCZOS)).astype(np.float32)
    leer = np.zeros((Hn, Wn, 4), np.float32)
    ox = int(round(CX + PAD_S - CX * s)); oy = int(round(YA + PAD_O - YA * s))
    a0, b0 = max(0, oy), max(0, ox); a1, b1 = min(Hn, oy + g.shape[0]), min(Wn, ox + g.shape[1])
    leer[a0:a1, b0:b1] = g[a0 - oy:a1 - oy, b0 - ox:b1 - ox]
    return leer
def setze(Q):
    leer = np.zeros((Hn, Wn, 4), np.float32); leer[PAD_O:PAD_O + H, PAD_S:PAD_S + W] = vm(Q); return leer
K = skaliere(B); L2 = setze(S)
E = np.zeros_like(K)
for xz in range(int(CX + PAD_S - RX) - 1, int(CX + PAD_S + RX) + 2):
    # Nur wo der Koerper im ORIGINAL bis an die hintere Tellerkante reichte
    # (Osrics Umhang). Zwischen den Beinen des Waechters ist dort Luft - die
    # Verlaengerung malte einen Kasten in Koerperfarbe hinein (gemessen).
    xq = int(round(CX + (xz - PAD_S - CX) / s))
    if not (0 <= xq < W): continue
    yq = int(bogen(xq)[0]) - 3
    if yq < 0 or B[yq, xq, 3] < 200: continue
    yh = int(np.floor(bogen(xz - PAD_S, YTC + PAD_O)[0]))
    voll = np.where(K[:yh + 1, xz, 3] > 200)[0]
    if len(voll) == 0 or voll[-1] >= yh: continue
    yl = voll[-1]; farbe = K[yl, xz] / max(K[yl, xz, 3], 1) * 255.0
    E[yl:yh + 4, xz, :3] = farbe[:3]; E[yl:yh + 4, xz, 3] = 255
E = vm(E)
def ueber(u, o):
    ao = o[:, :, 3:4] / 255.0; e = np.empty_like(u)
    e[:, :, :3] = o[:, :, :3] + u[:, :, :3] * (1 - ao); e[:, :, 3:4] = o[:, :, 3:4] + u[:, :, 3:4] * (1 - ao)
    return e
C = ueber(ueber(E, L2), K)
a = C[:, :, 3:4]
C = np.concatenate([np.where(a > 0, C[:, :, :3] / np.maximum(a, 1e-3) * 255.0, 0), a], axis=2).clip(0, 255).astype(np.uint8)
voll = Image.fromarray(C, "RGBA"); voll.save(arg.aus.replace(".png", "-voll.png"))

# ── Spielmass ─────────────────────────────────────────────────────────────
yy, xx = np.where(C[:, :, 3] > 60)
box = (xx.min(), yy.min(), xx.max() + 1, yy.max() + 1)
frei = voll.crop(box); f = 535 / frei.height
frei = frei.resize((round(frei.width * f), 535), Image.LANCZOS)
cx_frei = (CX + PAD_S - box[0]) * f
L = 576; unten = L - round(L * 0.035)
blatt = Image.new("RGBA", (L, L), (0, 0, 0, 0))
li = int(round(L / 2 - cx_frei))
if li < 0 or li + frei.width > L:
    print("WARNUNG: Umriss ragt aus der Leinwand", li, frei.width)
blatt.paste(frei, (li, unten - frei.height), frei)
blatt.save(arg.aus)
rx_neu = RX * f
print(json.dumps({"aus": arg.aus, "faktor": round(f, 4), "rx_576": round(rx_neu, 1),
                  "brett_neu": round(min(1.35, 136 / rx_neu) * 535 / 561 * 100, 1)}))
