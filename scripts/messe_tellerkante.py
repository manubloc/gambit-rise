# -*- coding: utf-8 -*-
"""Misst die OBERE Tellerkante jedes Gemaeldes.

WARUM: messe_sockel.py ermittelt die Tellerhoehe, indem es in der Mittelspalte
von unten nach oben laeuft, solange der Pixel farbig ist. Auf grauem Stein
schlaegt das fehl - dann greift `ring = max(8, ring)`, der Notnagel. Gemessen:
29 von 69 Figuren stehen auf genau diesem Notnagel, darunter Guardian, Hawk,
Dragon und fast alle Bosse. Fuer die gab es nie eine echte Tellerhoehe.

WIE STATT DESSEN: die obere Tellerkante ist eine Ellipse und damit eine
waagerechte Kante quer ueber die ganze Tellerbreite. Statt einer Spalte wird
der senkrechte Helligkeitssprung ENTLANG DIESER ELLIPSE aufsummiert - fuer
jede in Frage kommende Zeile eine Punktzahl. Die Zeile mit der hoechsten
Punktzahl ist die Kante. Das braucht keine Farbe, nur Kontrast, und
funktioniert deshalb auch auf Stein.

Die Figur steht auf dem Teller und verdeckt seine Mitte, deshalb zaehlen nur
die aeusseren Teile des Bogens (|cos t| > 0.35).
"""
import json, math, os, sys
import numpy as np
from PIL import Image

ORDNER = "src/app/ui/assets/painted"

# ── HANDWERTE ────────────────────────────────────────────────────────────────
# Zwei Teller haben keinen eindeutigen Knick, deshalb sind sie von Hand
# gesetzt - nachgemessen am Breitenverlauf, nicht geschaetzt:
#   boss-b02  faellt in ZWEI Stufen (98,6 % bei 30 px, 89,5 % bei 80, erst bei
#             110 auf 78,7 %). Der Automat nahm die erste Stufe bei 64. Die
#             Standflaeche, auf der die Klauen liegen, ist die zweite. An der
#             Kandidatenleiter abgelesen und vom Besitzer bestaetigt: 75.
#             ("75 px ist perfekt.") 100 lief durch die Zehen, 90 lag noch zu
#             hoch am Klauenansatz.
#   gambit-t2 hat denselben Sockel wie gambit-t3 (Profil deckungsgleich: 98 %
#             bei 40, 90 % bei 50, 75 % bei 60), der Automat fand aber einen
#             Scheinknick bei 14. Gesetzt auf 45, wie bei t3 gemessen.
HANDWERTE = {"boss-b02": 75, "gambit-t2": 45}
MASSE = json.load(open("src/app/ui/board/sockelband.json"))

def kante(fid, m):
    """Sucht die OBERSTE Tellerkante - die Flaeche, auf der die Fuesse stehen.

    Besitzer: "Es geht immer darum, die erste Kante zu finden, diese
    Oberflaeche, wo eigentlich die Fuesse draufstehen. Und das ist auch eine
    Art Ellipse, die aber dann hinter den Fuessen durchgeht."

    DAS WAR MEIN FEHLER in den ersten Anlaeufen: viele Teller tragen unten
    zusaetzlich ein farbiges Zierband. Dessen Kante ist der staerkste
    Helligkeitssprung - und den habe ich genommen. Gebraucht wird aber die
    graue Kante ganz oben.

    DESHALB JETZT KEIN KANTENFINDER MEHR, sondern die Silhouette: solange man
    am Teller ist, stehen linke und rechte Aussenkante genau auf cx-rx und
    cx+rx. Sobald der Koerper beginnt, springt mindestens eine der beiden nach
    innen (Figur schmaler) oder nach aussen (hockender Boss). Die oberste
    Zeile, in der beide noch auf der Tellerbreite liegen, ist die HINTERE
    Kante der Oberflaeche - genau die Ellipse, die hinter den Fuessen
    durchlaeuft. Ihre Mitte liegt ry darunter.
    """
    im = Image.open(os.path.join(ORDNER, "painted-%s.webp" % fid)).convert("RGBA")
    deck = np.asarray(im)[:, :, 3] > 60
    H, W = deck.shape
    cx, rx, ry, boden = m["cx"], m["rx"], m["ry"], m["boden"]
    unten = boden - ry                       # Mitte der unteren Ellipse
    # GEMESSEN, warum der erste Versuch zu frueh abbrach: ich habe links und
    # rechts gegen cx-rx und cx+rx aus der Datei geprueft. Die Mitte dort ist
    # aber um ein bis zwei Pixel verschoben, und schon riss der Lauf. Jetzt
    # zaehlt nur noch die BREITE, gemessen an der Breite in der Startzeile.
    # GEMESSEN: die Teller sind leicht KONISCH, keine Zylinder. Die Breite
    # faellt nach oben langsam ab - beim Gambit-t2 auf 97 % nach 42 px - und
    # erst dort, wo der KOERPER beginnt, knickt sie steil weg (auf 83 % binnen
    # sechs Zeilen). Ein fester Schwellwert trifft deshalb die Stufe statt die
    # Standflaeche. Gesucht wird der KNICK: die erste Zeile, ab der die Breite
    # ueber drei Zeilen hinweg staerker faellt als 0,4 % je Zeile.
    start = int(round(unten))
    w = []
    for k in range(0, 121):
        y = start - k
        if y < 1:
            break
        z = np.where(deck[y])[0]
        w.append((z[-1] - z[0]) / 2.0 if len(z) >= 2 else 0.0)
    if len(w) < 12 or w[0] <= 0:
        return None, 0.0
    w0 = w[0]
    schwelle = w0 * 0.004          # 0,4 % der Tellerbreite je Zeile
    knick = len(w) - 1
    for k in range(3, len(w) - 3):
        fall = (w[k - 1] - w[k + 2]) / 3.0
        if fall > schwelle and (w[k] - w[k + 3]) / 3.0 > schwelle:
            knick = k
            break
    y_hinten = start - knick
    if y_hinten is None:
        return None, 0.0
    # KORREKTUR meiner eigenen Geometrie: die Silhouette ist genau zwischen
    # den MITTEN der beiden Ellipsen am breitesten - dort liegen die
    # Beruehrpunkte x = cx +- rx. Die gefundene Zeile IST also schon die Mitte
    # der oberen Ellipse, es darf kein ry addiert werden. Mit dem falschen
    # Zuschlag kam beim Alchemisten 4 px heraus statt der gemessenen 33.
    y_oben = y_hinten
    hoch = unten - y_oben
    if hoch < 2:
        return None, 0.0
    # Guete: wie weit reicht die Tellerbreite ueber die gefundene Kante hinaus?
    # Je abrupter der Sprung darueber, desto sicherer die Kante.
    # Guete: wie steil der Knick ist - je groesser, desto eindeutiger
    sprung = 0.0
    if knick + 6 < len(w):
        sprung = (w[knick] - w[knick + 6]) / w0 * 100.0
    return int(round(hoch)), round(min(99.9, sprung), 1)

def main():
    erg, ohne = {}, []
    for datei in sorted(os.listdir(ORDNER)):
        if not (datei.startswith("painted-") and datei.endswith(".webp")):
            continue
        fid = datei[len("painted-"):-len(".webp")]
        m = MASSE.get(fid)
        if not m:
            ohne.append(fid); continue
        hoch, punkte = kante(fid, m)
        if hoch is None:
            ohne.append(fid); continue
        hand = HANDWERTE.get(fid)
        erg[fid] = {"tellerhoehe": hand if hand else hoch,
                    "gemessen": hoch, "vonHand": bool(hand),
                    "guete": round(punkte, 1), "ring_alt": m.get("ring")}
        print("%-18s Tellerhoehe %3d px%s (Knick %4.1f %%, alt ring %s)" % (fid, erg[fid]["tellerhoehe"], " HAND" if hand else "     ", punkte, m.get("ring")))
    json.dump(erg, open("/tmp/tellerkante.json", "w"), indent=1)
    # ── und in die Datei, aus der das Spiel liest ────────────────────────────
    pfad = "src/app/ui/board/sockelband.json"
    daten = json.load(open(pfad))
    for fid, v in erg.items():
        if fid in daten:
            daten[fid]["teller"] = v["tellerhoehe"]
            if v["vonHand"]:
                daten[fid]["tellerVonHand"] = True
    json.dump(daten, open(pfad, "w"), indent=1, ensure_ascii=False)
    print("teller in %s geschrieben" % pfad)
    print("\n%d gemessen, %d ohne Mass: %s" % (len(erg), len(ohne), ", ".join(ohne) or "-"))

if __name__ == "__main__":
    main()
