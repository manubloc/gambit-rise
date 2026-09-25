#!/usr/bin/env python3
# Zeichnet den Schriftzug "Rise" als SVG-Pfade (v1.68.0).
# Jeder Strich: Mittellinie (aneinandergehaengte Beziers) + Breitenprofil.
# Ausgabe nach src/app/ui/riseGezeichnet.js:
#   python3 tools/rise-zeichnen.py > /tmp/rise.json
import math, json
def bez(p, t):
    (x0,y0),(x1,y1),(x2,y2),(x3,y3)=p; u=1-t
    return (u*u*u*x0+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3,
            u*u*u*y0+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3)
def dbez(p, t):
    (x0,y0),(x1,y1),(x2,y2),(x3,y3)=p; u=1-t
    return (3*u*u*(x1-x0)+6*u*t*(x2-x1)+3*t*t*(x3-x2),
            3*u*u*(y1-y0)+6*u*t*(y2-y1)+3*t*t*(y3-y2))
FAKTOR = 0.92   # v1.73.0 (Besitzer): duenner - "vor allem bei dem R noch duenner"

def breite(prof, t):
    # prof: Liste (t, w) - linear dazwischen
    for i in range(len(prof)-1):
        t0,w0=prof[i]; t1,w1=prof[i+1]
        if t0<=t<=t1:
            f=0 if t1==t0 else (t-t0)/(t1-t0)
            return (w0+(w1-w0)*f)*FAKTOR
    return prof[-1][1]*FAKTOR
ZACKE = 1.25   # v1.75.0 (Besitzer: "so leicht wellig, so wie du den Blitz an
               # der dicksten Stelle hast - genau so stelle ich mir das vor")
_lauf = [0]

def zacke(t, seed):
    """seitlicher Versatz wie beim Blitz: drei ueberlagerte Wellen, die
       langsame gibt die Welle, die schnellen die kleinen Knicke."""
    return ZACKE * (math.sin(t*8.3 + seed)*0.55
                    + math.sin(t*21.7 + seed*2.1)*0.30
                    + math.sin(t*47.3 + seed*3.7)*0.15)

def strich(kurven, prof, n=46):
    """kurven: Liste von 4-Punkt-Beziers, aneinandergehaengt."""
    L=[]; 
    for k,kv in enumerate(kurven):
        for i in range(n+1):
            t=i/n
            if k>0 and i==0: continue
            tt=(k+t)/len(kurven)
            L.append((bez(kv,t), dbez(kv,t), breite(prof,tt)))
    _lauf[0]+=1; seed=_lauf[0]*1.7
    o=[]; u=[]
    for i,((x,y),(dx,dy),w) in enumerate(L):
        m=math.hypot(dx,dy) or 1; nx,ny=-dy/m, dx/m
        t=i/(len(L)-1) if len(L)>1 else 0
        # die Zacke laeuft mit der Strichstaerke: wo der Zug breit ist, zackt
        # er deutlich; an den Nadelspitzen verlaeuft er ruhig aus
        z=zacke(t, seed) * min(1.0, w/6.0)
        x+=nx*z; y+=ny*z
        o.append((x+nx*w/2, y+ny*w/2)); u.append((x-nx*w/2, y-ny*w/2))
    pts=o+u[::-1]
    d="M "+" L ".join(f"{x:.1f} {y:.1f}" for x,y in pts)+" Z"
    return d

def g(a, b):
    """gerader Zug von a nach b (Kontrollpunkte auf der Linie)"""
    (x0,y0),(x1,y1)=a,b
    return [(x0,y0),(x0+(x1-x0)/3,y0+(y1-y0)/3),(x0+2*(x1-x0)/3,y0+2*(y1-y0)/3),(x1,y1)]

S=[]
# ── R nach der Vorlage: zwei lange Diagonalen mit NADELSPITZEN, dazwischen
#    der Bogen. Glatte Zuege (keine Ecken), aber die Enden laufen auf Null -
#    das macht die Spitzen, nicht ein Knick. (v1.70.0)
#    v1.71.0 (Besitzer): das R ist kleiner (0,84 um die Spitze) und naeher
#    ans i gerueckt; das BEIN setzt jetzt OBEN AM BOGEN an, wo die Feder ihn
#    verlaesst - vorher begann es frei darunter. ────────────────────────────
# v1.73.0 (Besitzer: "das R ist immer noch zu gross"): weitere 0,86 um die
# obere Spitze, und die Zuege duenner (siehe Breitenprofile).
S.append(strich([[(468,96),(452,127),(438,156),(417,195)]], [(0,.3),(.22,9),(.55,7),(.85,3),(1,.25)]))
S.append(strich([[(466,99),(501,95),(510,120),(479,130)],
                 [(479,130),(471,133),(464,130),(459,127)]], [(0,1.3),(.35,7),(.75,4),(1,.9)]))
S.append(strich([[(459,127),(469,148),(483,167),(507,199)]], [(0,.9),(.3,6.4),(.7,5),(1,.25)]))
# v1.75.0 (Besitzer: "so wie der erste kleine Auslaeuferblitz ganz am Anfang -
# so in die Richtung duerftest du auch ganz wenig an den Enden von den
# Buchstaben spielen"): drei WINZIGE Faeden an den Spitzen, kaum laenger als
# die Strichbreite. Die kraeftigen aus v1.73.0 waren zu viel und sind fort.
for a,b in [((417,195),(412,204)), ((507,199),(513,207)), ((468,96),(472,89))]:
    S.append(strich([g(a,b)], [(0,.8),(.5,.5),(1,.15)]))
# ── ise (v1.76.0: noch einmal 12 % groesser - Besitzer): deutlich kleiner als das R, rechts oben (Besitzer: "dürfte etwas
#    kleiner sein") ─────────────────────────────────────────────────────────
S.append(strich([[(514,212),(516,196),(522,178),(530,159)]], [(0,.6),(.5,6.5),(1,.6)]))
PUNKT='<circle cx="536" cy="137" r="3.4"/>'
# v1.72.0 (Besitzer: "das e und das s etwas mit kantig"): gerade Zuege mit
# scharfen Ecken. Das s ist ein liegendes Z: Kopfbalken nach links, Diagonale
# hinab, Fussbalken nach links. Das e: Mittelbalken, Schleife darueber, Bauch.
S.append(strich([g((572,159),(543,167)), g((543,167),(570,186)), g((570,186),(539,196))],
                [(0,.5),(.24,5.4),(.55,4.6),(.82,5.2),(1,.5)]))
S.append(strich([g((579,186),(615,178)), g((615,178),(618,164)), g((618,164),(597,159)),
                 g((597,159),(583,178)), g((583,178),(594,196)), g((594,196),(626,186))],
                [(0,.5),(.2,4.2),(.45,6.2),(.75,5.8),(1,.4)]))
print(json.dumps({"pfade":S,"punkt":PUNKT}))
