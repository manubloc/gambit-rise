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
# ── R: Abstrich, Bogen, Bein - alles in geraden Zuegen (v1.69.0, Besitzer:
#    "versuch das Rise wirklich eher zickzackartig zu zeichnen") ────────────
S.append(strich([g((402,104),(388,150)), g((388,150),(374,186)), g((374,186),(364,214))],
                [(0,2),(.3,16),(.72,11),(1,2)]))
S.append(strich([g((400,108),(448,100)), g((448,100),(462,132)), g((462,132),(426,150)), g((426,150),(408,152))],
                [(0,2.5),(.35,10.5),(.7,8),(1,3)]))
S.append(strich([g((410,150),(438,168)), g((438,168),(452,192)), g((452,192),(486,208)), g((486,208),(596,252))],
                [(0,3),(.28,12),(.6,7),(1,.8)]))
# ── i ───────────────────────────────────────────────────────────────────────
S.append(strich([g((494,208),(502,180)), g((502,180),(512,154))], [(0,2.5),(.5,9.5),(1,2)]))
PUNKT='<circle cx="518" cy="136" r="4.2"/>'
# ── s: hinauf, scharf zurueck, hinab, Haken ─────────────────────────────────
S.append(strich([g((520,206),(542,168)), g((542,168),(524,168)), g((524,168),(544,190)), g((544,190),(520,202))],
                [(0,2),(.26,8),(.5,3.5),(.78,7.5),(1,2)]))
# ── e: Balken, Spitze, Bauch, hinaus ────────────────────────────────────────
S.append(strich([g((566,188),(604,180)), g((604,180),(588,164)), g((588,164),(564,184)),
                 g((564,184),(584,206)), g((584,206),(622,188))],
                [(0,2),(.2,4.5),(.42,8.5),(.72,8),(1,1.2)]))
# ── Ausstrich ───────────────────────────────────────────────────────────────
S.append(strich([g((620,192),(646,176)), g((646,176),(670,150))], [(0,3),(.4,4),(1,.8)]))
print(json.dumps({"pfade":S,"punkt":PUNKT}))
