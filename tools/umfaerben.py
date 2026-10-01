"""Brandstifter umfaerben (Besitzerentscheid 30.9.: faerben statt neu malen).

Dreht NUR die roten Flaechen (Koerper + roter Sockelstreifen) auf einen
Zielton. Der Stein des Sockels (Farbton ~30 Grad, Saettigung < 0.35) und die
Transparenz bleiben unberuehrt - der Alphakanal wird nicht angefasst, darum
stimmt sockelband.json danach unveraendert. Die gluehenden Augen bleiben
wahlweise Glut-orange (Feuer), damit der Name weiter stimmt.

Helligkeit: ein reiner Farbtondreh von Dunkelrot nach Blau macht die Figur
wahrgenommen DUNKLER (Blau traegt nur 7 % der Leuchtdichte). Darum wird V so
nachgezogen, dass die Leuchtdichte (Rec. 709) je Pixel gleich bleibt.
"""
import sys
import numpy as np
from PIL import Image


def rgb_to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    h = np.zeros_like(mx)
    m = d > 1e-6
    rm = m & (mx == r); gm = m & (mx == g) & ~rm; bm = m & ~rm & ~gm
    h[rm] = ((g - b)[rm] / d[rm]) % 6
    h[gm] = ((b - r)[gm] / d[gm]) + 2
    h[bm] = ((r - g)[bm] / d[bm]) + 4
    h = h / 6.0
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def hsv_to_rgb(h, s, v):
    i = np.floor(h * 6).astype(int) % 6
    f = h * 6 - np.floor(h * 6)
    p = v * (1 - s); q = v * (1 - f * s); t = v * (1 - (1 - f) * s)
    out = np.zeros(h.shape + (3,))
    for k, (R, G, B) in enumerate([(v, t, p), (q, v, p), (p, v, t), (p, q, v), (t, p, v), (v, p, q)]):
        m = i == k
        out[..., 0][m] = R[m]; out[..., 1][m] = G[m]; out[..., 2][m] = B[m]
    return out


def lum(rgb):
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def umfaerben(src, dst, ziel_grad, augen_bleiben=True, saett=1.0):
    im = Image.open(src).convert("RGBA")
    a = np.asarray(im).astype(np.float64) / 255.0
    rgb = a[..., :3]; alpha = a[..., 3]
    h, s, v = rgb_to_hsv(rgb)
    hg = h * 360.0
    # Rotanteil: Farbton um 0 Grad (340..28), weich ausgeblendet bis 36
    abst = np.minimum(np.abs(hg - 0), 360 - np.abs(hg - 0))  # Abstand zu Rot
    w_h = np.clip((36 - abst) / 8.0, 0, 1)
    w_s = np.clip((s - 0.30) / 0.10, 0, 1)                    # Stein bleibt
    w = w_h * w_s
    if augen_bleiben:
        glut = (v > 0.80) & (s > 0.55)
        w = np.where(glut, 0, w)
    # Farbton drehen (relativ, damit Schattierungen erhalten bleiben)
    dreh = ziel_grad / 360.0
    h2 = (h + dreh) % 1.0
    s2 = np.clip(s * saett, 0, 1)
    neu = hsv_to_rgb(h2, s2, v)
    # Leuchtdichte je Pixel angleichen
    y0 = lum(rgb); y1 = lum(neu)
    k = np.where(y1 > 1e-4, y0 / np.maximum(y1, 1e-4), 1.0)
    neu = np.clip(neu * np.clip(k, 0.5, 3.0)[..., None], 0, 1)
    out = rgb * (1 - w[..., None]) + neu * w[..., None]
    res = np.concatenate([out, alpha[..., None]], -1)
    Image.fromarray((res * 255 + 0.5).astype(np.uint8), "RGBA").save(dst, lossless=False, quality=92, method=6)
    return float((w > 0.5).mean())


if __name__ == "__main__":
    src, dst, grad = sys.argv[1], sys.argv[2], float(sys.argv[3])
    augen = (sys.argv[4] if len(sys.argv) > 4 else "1") == "1"
    satt = float(sys.argv[5]) if len(sys.argv) > 5 else 1.0
    print(dst, "umgefaerbt:", round(100 * umfaerben(src, dst, grad, augen, satt), 1), "%")
