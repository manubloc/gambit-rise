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
FAKTOR = 1.34   # v1.69.0: Rise wirkte neben dem kraeftigen GAMBIT zu duenn

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
#    das macht die Spitzen, nicht ein Knick. (v1.70.0) ─────────────────────
S.append(strich([[(436,96),(408,148),(382,196),(344,272)]], [(0,.4),(.22,15),(.55,12),(.85,5),(1,.3)]))
S.append(strich([[(434,100),(494,94),(510,140),(456,158)],
                 [(456,158),(444,161),(432,158),(422,152)]], [(0,2),(.35,11.5),(.75,6),(1,1)]))
S.append(strich([[(404,176),(444,206),(478,232),(530,274)]], [(0,.8),(.3,10),(.7,8),(1,.3)]))
# ── ise: deutlich kleiner als das R, rechts oben (Besitzer: "dürfte etwas
#    kleiner sein") ─────────────────────────────────────────────────────────
S.append(strich([[(514,212),(516,200),(520,186),(526,172)]], [(0,.6),(.5,6.5),(1,.6)]))
PUNKT='<circle cx="530" cy="154" r="3.4"/>'
S.append(strich([[(550,206),(558,186),(542,176),(536,188)],
                 [(536,188),(532,198),(550,200),(548,210)],
                 [(548,210),(546,218),(536,218),(532,212)]], [(0,.6),(.3,6),(.62,6),(1,.6)]))
S.append(strich([[(566,200),(584,196),(592,186),(582,180)],
                 [(582,180),(570,176),(562,190),(566,202)],
                 [(566,202),(572,214),(588,210),(600,198)]], [(0,.6),(.28,6.5),(.66,6),(1,.4)]))
print(json.dumps({"pfade":S,"punkt":PUNKT}))
