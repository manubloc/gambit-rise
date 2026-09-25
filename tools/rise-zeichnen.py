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
def breite(prof, t):
    # prof: Liste (t, w) - linear dazwischen
    for i in range(len(prof)-1):
        t0,w0=prof[i]; t1,w1=prof[i+1]
        if t0<=t<=t1:
            f=0 if t1==t0 else (t-t0)/(t1-t0)
            return w0+(w1-w0)*f
    return prof[-1][1]
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

S=[]
# ── R: Abstrich, Bogen, Bein ────────────────────────────────────────────────
S.append(strich([[(400,106),(384,140),(374,176),(366,212)]], [(0,2),(.35,15),(.8,11),(1,2.5)]))
S.append(strich([[(399,110),(452,98),(470,142),(414,154)]], [(0,2.5),(.45,10),(1,3)]))
S.append(strich([[(412,152),(440,158),(444,186),(474,204)],
                 [(474,204),(508,222),(546,238),(596,252)]], [(0,3),(.3,11),(.62,7),(1,1)]))
# ── i ───────────────────────────────────────────────────────────────────────
S.append(strich([[(496,206),(494,188),(500,170),(510,156)]], [(0,2.5),(.5,8.5),(1,2.5)]))
PUNKT='<circle cx="516" cy="138" r="4.4"/>'
# ── s: Aufstrich, Ruecken, Bauch ────────────────────────────────────────────
S.append(strich([[(528,206),(534,190),(540,176),(548,164)],
                 [(548,164),(536,158),(524,168),(530,178)],
                 [(530,178),(538,186),(552,190),(546,202)],
                 [(546,202),(540,210),(528,208),(524,200)]], [(0,2),(.22,8),(.5,5),(.78,8),(1,2)]))
# ── e: kleine Schleife, dann hinaus ─────────────────────────────────────────
S.append(strich([[(560,192),(572,186),(588,186),(590,178)],
                 [(590,178),(592,168),(572,166),(566,178)],
                 [(566,178),(560,190),(566,206),(582,206)],
                 [(582,206),(594,206),(604,198),(612,188)]], [(0,2),(.2,6),(.45,8.5),(.8,7),(1,1.5)]))
# ── Ausstrich nach rechts ───────────────────────────────────────────────────
S.append(strich([[(606,192),(626,186),(644,174),(658,158)]], [(0,3),(.4,4.5),(1,.8)]))
print(json.dumps({"pfade":S,"punkt":PUNKT}))
