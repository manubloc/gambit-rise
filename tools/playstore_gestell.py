#!/usr/bin/env python3
"""Baut aus den Rohbildern (tools/playstore-schirme.mjs) die Store-Bilder in
den drei Play-Formaten: Ueberschrift, Rahmen, Hallengrund.

v1.84.0, Besitzer: "dass du mir ordentlich Bilder generierst, ähnlich wie
Screenshots als Tablet und Ding, dass ich das alles parat habe für den Play
Store. Gerne als Tipp, dass ich es nachher einfach nur hochladen muss."

Die Schrift kommt aus public/fonts - dieselbe Cinzel, die die App traegt.
Play nimmt PNG oder JPEG; hier PNG, weil das Repo die verlustfreie Quelle
haelt. Fuer die Uebergabe aufs Handy baut das Paketskript JPEG daraus.
"""
import os
import sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROH = "design/playstore/roh"
SCHRIFT = "/tmp/schrift"
FORMATE = [("handy", 1080, 1920), ("tablet7", 1200, 1920), ("tablet10", 1600, 2560)]

TEXTE = {
    "de": {
        # OFFEN: ein Brett MIT Lebenspunkten braucht einen Spielstand ab
        # Kapitel III (hpWach: league > 2) - ein Gast steht immer in Kapitel I.
        # Bis dahin nennt die Ueberschrift, was das Bild wirklich zeigt.
        "1-gefecht":    ("Deine Figuren lernen dazu", "Stufen, Talente und Sonderzüge — direkt unter dem Brett"),
        "2-klassik":    ("Klassisches Schach", "Volle Regeln, ruhiges Brett, wählbare Stärke"),
        "3-hofstaat":   ("Über 50 Figuren", "Helden und Bestien — jede mit eigener Kunst und eigenem Zug"),
        "4-karte":      ("Jede Figur eine Leiter", "Stufen, Zugbild und Fähigkeiten auf einer Karte"),
        "5-aufstellung":("Stell dein eigenes Heer auf", "Jede Partie beginnt mit deiner Aufstellung"),
        "6-kampagne":   ("Zwölf Kapitel, eine Welt", "Verzweigte Pfade, Meister an jedem Kapitelende"),
        "7-lager":      ("Jede Tat zählt", "Ruhmestaten bringen Gold und Skillpunkte"),
        "8-halle":      ("Deine Partie, deine Regeln", "Kampagne, schnelles Spiel oder Online-Duell"),
    },
    "en": {
        "1-gefecht":    ("Your pieces level up", "Levels, talents and special moves — right under the board"),
        "2-klassik":    ("Classic chess", "Full rules, a quiet board, any strength you like"),
        "3-hofstaat":   ("Over 50 pieces", "Heroes and beasts — each with its own art and moves"),
        "4-karte":      ("Every piece a ladder", "Levels, move chart and abilities on one card"),
        "5-aufstellung":("Field your own army", "Every match starts with your line-up"),
        "6-kampagne":   ("Twelve chapters, one world", "Branching paths and a master at every end"),
        "7-lager":      ("Every deed counts", "Feats pay out gold and skill points"),
        "8-halle":      ("Your match, your rules", "Campaign, quick play or an online duel"),
    },
}
REIHENFOLGE = ["1-gefecht", "2-klassik", "3-hofstaat", "4-karte",
               "5-aufstellung", "6-kampagne", "7-lager", "8-halle"]


def schrift(name, groesse):
    return ImageFont.truetype(os.path.join(SCHRIFT, name + ".ttf"), groesse)


def grund(b, h):
    """Der Hallengrund: Rissboden unten, nach oben ins Schwarz."""
    g = Image.new("RGB", (b, h), (7, 6, 14))
    boden = Image.open("public/landing/menue-boden.webp").convert("RGB")
    zh = round(h * 0.52)
    s = max(b / boden.width, zh / boden.height)
    z = boden.resize((round(boden.width * s), round(boden.height * s)), Image.LANCZOS)
    z = z.crop(((z.width - b) // 2, z.height - zh, (z.width - b) // 2 + b, z.height))
    maske = Image.new("L", (1, zh))
    for y in range(zh):
        t = y / max(1, zh - 1)
        maske.putpixel((0, y), int(255 * min(1.0, max(0.0, (t - 0.05) / 0.55)) ** 1.2))
    g.paste(z, (0, h - zh), maske.resize((b, zh)))
    # ein violetter Hauch oben
    hauch = Image.new("RGB", (b, h), (7, 6, 14))
    d = ImageDraw.Draw(hauch)
    d.ellipse([-b * 0.3, -h * 0.28, b * 1.3, h * 0.36], fill=(38, 22, 70))
    return Image.blend(g, Image.blend(g, hauch, 0.55).filter(ImageFilter.GaussianBlur(b // 14)), 0.5)


def gerundet(im, r):
    m = Image.new("L", im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    aus = Image.new("RGBA", im.size, (0, 0, 0, 0))
    aus.paste(im, (0, 0), m)
    return aus


def umbruch(d, text, font, breite):
    worte, zeilen, zeile = text.split(), [], ""
    for w in worte:
        probe = (zeile + " " + w).strip()
        if d.textlength(probe, font=font) <= breite:
            zeile = probe
        else:
            if zeile:
                zeilen.append(zeile)
            zeile = w
    if zeile:
        zeilen.append(zeile)
    return zeilen


def bild(roh_pfad, titel, unter, b, h):
    g = grund(b, h).convert("RGBA")
    d = ImageDraw.Draw(g)
    # Ueberschrift
    f1 = schrift("cinzel-600", round(b * 0.052))
    f2 = schrift("cormorant-500i", round(b * 0.038))
    y = round(h * 0.035)
    for z in umbruch(d, titel.upper(), f1, b * 0.88):
        w = d.textlength(z, font=f1)
        d.text(((b - w) / 2 + 2, y + 2), z, font=f1, fill=(0, 0, 0, 180))
        d.text(((b - w) / 2, y), z, font=f1, fill=(240, 214, 148))
        y += round(f1.size * 1.22)
    y += round(h * 0.006)
    for z in umbruch(d, unter, f2, b * 0.84):
        w = d.textlength(z, font=f2)
        d.text(((b - w) / 2, y), z, font=f2, fill=(196, 186, 214))
        y += round(f2.size * 1.2)

    # Der Schirm
    roh = Image.open(roh_pfad).convert("RGB")
    platz_o = y + round(h * 0.028)
    platz_u = h - round(h * 0.035)
    zh = platz_u - platz_o
    zb = round(min(b * 0.84, zh * roh.width / roh.height))
    zh = round(zb * roh.height / roh.width)
    if zh > platz_u - platz_o:
        zh = platz_u - platz_o
        zb = round(zh * roh.width / roh.height)
    s = roh.resize((zb, zh), Image.LANCZOS)
    r = round(zb * 0.045)
    x = (b - zb) // 2
    schatten = Image.new("RGBA", g.size, (0, 0, 0, 0))
    ImageDraw.Draw(schatten).rounded_rectangle([x, platz_o + round(h * 0.004),
                                                x + zb, platz_o + zh + round(h * 0.004)],
                                               r, fill=(0, 0, 0, 190))
    g.alpha_composite(schatten.filter(ImageFilter.GaussianBlur(b // 45)))
    g.alpha_composite(gerundet(s, r), (x, platz_o))
    ImageDraw.Draw(g).rounded_rectangle([x, platz_o, x + zb, platz_o + zh], r,
                                        outline=(150, 122, 210, 150), width=max(2, b // 420))
    return g.convert("RGB")


def lauf(sprachen=("de", "en")):
    for sp in sprachen:
        ziel = f"design/playstore/{sp}"
        os.makedirs(ziel, exist_ok=True)
        for alt in os.listdir(ziel):
            if alt.endswith(".png"):
                os.remove(os.path.join(ziel, alt))
        for i, name in enumerate(REIHENFOLGE, 1):
            roh = f"{ROH}/{sp}-{name}.png"
            if not os.path.exists(roh):
                print("fehlt:", roh)
                continue
            titel, unter = TEXTE[sp][name]
            for kurz, b, h in FORMATE:
                z = f"{ziel}/{kurz}-{b}x{h}-{i}-{name.split('-', 1)[1]}.png"
                bild(roh, titel, unter, b, h).save(z, "PNG", optimize=True)
        print(sp, "fertig:", len(os.listdir(ziel)), "Bilder")


if __name__ == "__main__":
    lauf(tuple(sys.argv[1:]) or ("de", "en"))
