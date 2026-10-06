#!/usr/bin/env python3
"""EINE NEUE FIGUR ODER BESTIE INS SPIEL BRINGEN (v1.91.0)

    python3 tools/figuren-einbau.py farmwife beggar boss-b26 ...
    python3 tools/figuren-einbau.py --alle-neuen

Quelle ist IMMER archiv/bilder/figuren-hq/<id>.png - das freigegebene Bild,
576 x 576 RGBA, Figur 535 px hoch, Sockelfuss in der Bildmitte (so liefert es
die Bildwerkstatt dieser Sitzung; wer ein rohes Bild hat, schneidet es erst mit
tools/freistellen.py zu).

Was das Skript tut - und warum es das gibt: bis hierher waren das zehn
Handgriffe je Bild, und jeder davon ist schon einmal vergessen worden.
  1. painted-<id>.webp (576) und klein/painted-<id>.webp (192)
  2. das Mass in sockelband.json - NUR die neuen Eintraege. Ein Gesamtlauf von
     scripts/messe_sockel.py verschiebt elf alte Figuren (CLAUDE.md); darum
     misst es in eine Nebendatei und uebernimmt nur, was neu ist.
  3. `teller` aus scripts/messe_tellerkante.py (kante() + HANDWERTE)
  4. die Farbe in figurfarbe.json - ebenfalls nur die neuen
  5. die Umrisszeichnung assets/pieces/<...>.svg, nachgezogen aus dem
     Alphakanal des Gemaeldes (die Zeichnung ist der Ersatz, wenn das Gemaelde
     fehlt - sie muss es je Art geben, test_ui prueft das)
Danach von Hand: Importe in src/app/ui/board/paintedArt.js, `npm run vorschau`.
"""
import json, os, subprocess, sys, importlib.util
from PIL import Image
import numpy as np
import cv2

HQ = "archiv/bilder/figuren-hq"
GROSS = "src/app/ui/assets/painted"
SB = "src/app/ui/board/sockelband.json"
FF = "src/app/ui/board/figurfarbe.json"

# id -> Art-Kuerzel (nur fuer die Umrisszeichnung der Figuren; Bestien heissen boss-bNN)
ARTEN = {"farmwife": "FW", "beggar": "BG", "jester": "JE", "smith": "SM", "craftsman": "CR", "scholar": "SL",
  "taxman": "TX", "banker": "BK", "butcher": "BU", "cook": "CK", "miller": "ML", "monk": "MK", "healer": "HL",
  "huntress": "HU", "ranger": "RG", "trapper": "TR", "cavalier": "CV", "fencer": "FN", "spearman": "SP",
  "gladiator": "GL", "executioner": "EX", "samurai": "SA", "jailer": "JL", "watchman": "NW"}
NEUE_BESTIEN = ["boss-b%02d" % i for i in range(26, 44)]

def lade(pfad, name):
    spec = importlib.util.spec_from_file_location(name, pfad); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m

def bilder(fid):
    im = Image.open(f"{HQ}/{fid}.png").convert("RGBA")
    assert im.size == (576, 576), f"{fid}: {im.size} statt 576x576"
    im.save(f"{GROSS}/painted-{fid}.webp", "WEBP", quality=92, method=6)
    im.resize((192, 192), Image.LANCZOS).save(f"{GROSS}/klein/painted-{fid}.webp", "WEBP", quality=90, method=6)

STIL = 'fill-rule="evenodd" stroke-width="1" stroke-linejoin="round" stroke-linecap="round" style="fill:var(--fill, #c9a45c);stroke:var(--rim, none);stroke-width:var(--rimW, 1);paint-order:stroke fill"'
# das gemeinsame Schachgeruest der Bestien: Kragen und Rock der Dame, woertlich (test_ui Abschnitt 20)
KRAGEN = "M18.4 23 L29.6 23 C30.5 23.5 30.5 25.2 29.6 25.7 L18.4 25.7 C17.5 25.2 17.5 23.5 18.4 23 Z"
ROCK = "M20 27 L28 27 C29.5 31.2 30.3 35.5 30.7 40 L17.3 40 C17.7 35.5 18.5 31.2 20 27 Z"

def umriss(maske, x0, y0, x1, y1, genau=0.012):
    """Aussenkontur einer Maske als SVG-Pfad, eingepasst in den Kasten x0..x1 / y0..y1."""
    ys, xs = np.where(maske); t, b, l, r = ys.min(), ys.max(), xs.min(), xs.max()
    aus = maske[t:b + 1, l:r + 1].astype(np.uint8) * 255
    aus = cv2.morphologyEx(aus, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    kont, _ = cv2.findContours(aus, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    k = max(kont, key=cv2.contourArea)
    k = cv2.approxPolyDP(k, genau * cv2.arcLength(k, True), True)[:, 0, :]
    h, w = aus.shape; f = min((x1 - x0) / w, (y1 - y0) / h)
    ox = (x0 + x1) / 2 - w * f / 2; oy = y1 - h * f
    pkt = [(ox + x * f, oy + y * f) for x, y in k]
    return "M" + " L".join("%.1f %.1f" % p for p in pkt) + " Z"

def zeichnung(fid):
    a = np.array(Image.open(f"{HQ}/{fid}.png").convert("RGBA"))[..., 3] > 120
    if fid.startswith("boss-"):
        ys = np.where(a.any(1))[0]; oben, unten = ys.min(), ys.max()
        kopf = a.copy(); kopf[oben + int((unten - oben) * 0.56):] = False      # Kopf und Schultern
        d = umriss(kopf, 12.5, 2.2, 35.5, 21.6) + " " + KRAGEN + " " + ROCK
        tag, datei = "boss:" + fid[5:], f"assets/pieces/{fid}.svg"
    else:
        d = umriss(a, 9, 2, 39, 40)
        tag, datei = "piece:" + ARTEN[fid], f"assets/pieces/{fid}.svg"
    open(datei, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 0 36 42" data-gg="{tag}">\n'
      f'<!-- nachgezogen aus dem Gemaelde {fid} (tools/figuren-einbau.py) -->\n<path d="{d}" {STIL}></path>\n</svg>\n')

def masse(ids):
    alt = json.load(open(SB))
    neben = "/tmp/_sockel_neben.json"
    subprocess.run(["python3", "scripts/messe_sockel.py"], env={**os.environ, "AUS": neben}, check=True, stdout=subprocess.DEVNULL)
    gemessen = json.load(open(neben))
    for fid in ids: alt[fid] = gemessen[fid]
    json.dump(alt, open(SB, "w"), indent=1, ensure_ascii=False)
    tk = lade("scripts/messe_tellerkante.py", "tk")          # liest die eben geschriebene Datei
    daten = json.load(open(SB))
    for fid in ids:
        hoch, _ = tk.kante(fid, daten[fid]); hand = tk.HANDWERTE.get(fid)
        daten[fid]["teller"] = hand if hand else hoch
        if hand: daten[fid]["tellerVonHand"] = True
        print("  %-14s rx %5.1f  oben %3d  teller %2d%s%s" % (fid, daten[fid]["rx"], daten[fid]["oben"], daten[fid]["teller"],
              " HAND" if hand else "", " (oben von Hand)" if daten[fid].get("obenVonHand") else ""))
    json.dump(daten, open(SB, "w"), indent=1, ensure_ascii=False)

def farben(ids):
    alt = json.load(open(FF)); sicher = open(FF).read()
    subprocess.run(["python3", "scripts/messe_farbe.py"], check=True, stdout=subprocess.DEVNULL)
    neu = json.load(open(FF)); open(FF, "w").write(sicher)
    for fid in ids: alt[fid] = neu[fid]
    json.dump(alt, open(FF, "w"), indent=1)

if __name__ == "__main__":
    ids = sys.argv[1:]
    if ids == ["--alle-neuen"]: ids = list(ARTEN) + NEUE_BESTIEN
    if not ids: sys.exit(__doc__)
    for fid in ids: bilder(fid); zeichnung(fid)
    masse(ids); farben(ids)
    print(f"{len(ids)} Bilder eingebaut. Jetzt: Importe in paintedArt.js, npm run vorschau, npm run art.")
