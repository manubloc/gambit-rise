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
def strich(kurven, prof, n=46):
    """kurven: Liste von 4-Punkt-Beziers, aneinandergehaengt."""
    L=[]; 
    for k,kv in enumerate(kurven):
        for i in range(n+1):
            t=i/n
            if k>0 and i==0: continue
            tt=(k+t)/len(kurven)
            L.append((bez(kv,t), dbez(kv,t), breite(prof,tt)))
    o=[]; u=[]
    for (x,y),(dx,dy),w in L:
        m=math.hypot(dx,dy) or 1; nx,ny=-dy/m, dx/m
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
S.append(strich([[(468,96),(451,129),(436,159),(414,200)]], [(0,.3),(.22,9),(.55,7),(.85,3),(1,.25)]))
S.append(strich([[(466,99),(503,95),(512,122),(479,132)],
                 [(479,132),(471,135),(464,132),(458,129)]], [(0,1.3),(.35,7),(.75,4),(1,.9)]))
S.append(strich([[(458,129),(469,151),(484,171),(509,205)]], [(0,.9),(.3,6.4),(.7,5),(1,.25)]))
# v1.74.0 (Besitzer): die Mini-Auslaeufer an den R-Spitzen sind wieder fort.
# ── ise: deutlich kleiner als das R, rechts oben (Besitzer: "dürfte etwas
#    kleiner sein") ─────────────────────────────────────────────────────────
S.append(strich([[(514,212),(516,199),(520,184),(527,169)]], [(0,.6),(.5,6.5),(1,.6)]))
PUNKT='<circle cx="531" cy="150" r="3.4"/>'
# v1.72.0 (Besitzer: "das e und das s etwas mit kantig"): gerade Zuege mit
# scharfen Ecken. Das s ist ein liegendes Z: Kopfbalken nach links, Diagonale
# hinab, Fussbalken nach links. Das e: Mittelbalken, Schleife darueber, Bauch.
S.append(strich([g((562,169),(538,175)), g((538,175),(560,191)), g((560,191),(534,199))],
                [(0,.5),(.24,5.4),(.55,4.6),(.82,5.2),(1,.5)]))
S.append(strich([g((568,191),(597,184)), g((597,184),(600,172)), g((600,172),(582,169)),
                 g((582,169),(570,184)), g((570,184),(580,199)), g((580,199),(606,191))],
                [(0,.5),(.2,4.2),(.45,6.2),(.75,5.8),(1,.4)]))
print(json.dumps({"pfade":S,"punkt":PUNKT}))
