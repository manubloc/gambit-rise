/* Entwurf 4 des Figurenblatts. Aenderungen aus dem Besitzerdiktat:
   - das Sockelband liegt UEBER dem Sockel, rot = Leben, blau = Kraft, wie im Hofstaat
   - die Pfeile mittig in der Hoehe
   - "Verbessern" traegt das ECHTE Zeichen der Fertigkeitspunkte (der Splitter)
   - Angriff und Leben in den Farben des Bandes, mit Schattierung
   - alle Zeichen als abgerundetes Viereck statt Kreis, das Bild etwas kleiner
   - fuenf Zeichen je Reihe, zehn also in zwei Reihen                        */
import fs from "node:fs"; import path from "node:path";
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const SKILL = fs.readFileSync("/tmp/skill.txt", "utf8");
const FAM = { schritt:["#123c2a","#0a2418","#6fe0a8","#c8f5dd"], sprung:["#12314e","#0a1d30","#6fc2f0","#cfeaff"],
  schlag:["#4a1420","#2c0a12","#f07a8a","#ffd9de"], riss:["#321a5e","#1d0e3a","#a78bfa","#e6dcff"],
  leben:["#0f3d33","#08241e","#5ad4b0","#c8f7e8"], geschoss:["#4a3410","#2c1e08","#eec06a","#ffedc4"],
  krone:["#4a3a10","#2c2208","#f0d68a","#fff3cf"],
  /* v-Entwurf 6 (Besitzer): "das Schwert bei Angriff und das Herz von Leben -
     da wuensche ich mir eher das Design von den Faehigkeiten, also Kontur hell
     und innen dunkler." Also derselbe Bau wie jedes Faehigkeitszeichen, nur im
     Rot und Blau des Sockelbandes. */
  bandRot:["#4a1216","#280709","#ff8a80","#ffd9d5"],
  bandBlau:["#12244e","#08122c","#8fb4ff","#d6e4ff"] };
let nr = 0;
/* ── DAS ZEICHEN ALS ABGERUNDETES VIERECK ─────────────────────────────────
   Besitzerwunsch. Gleicher Bau wie bisher: Grund im Farbton, EIN duenner
   Ring, das Zeichen in hellem Strich - nur die Huelle ist jetzt ein Viereck
   mit 28 % Rundung. Das Zeichen selbst sitzt auf 78 % und laeuft nicht mehr
   bis an den Rand. */
const zeichen = (fam, inner, size = 26) => { const [g,t,r,st] = FAM[fam]; const id = "v"+(++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto">
  <defs><radialGradient id="${id}" cx="50%" cy="28%" r="82%"><stop offset="0%" stop-color="${g}"/><stop offset="100%" stop-color="${t}"/></radialGradient>
  <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="url(#${id})"/>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="url(#${id}g)"/>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="none" stroke="${r}" stroke-width="1" opacity=".85"/>
  <g transform="translate(12 12) scale(.78) translate(-12 -12)" fill="none" stroke="${st}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" color="${st}">${inner}</g></svg>`; };
/* Die WERTZEICHEN tragen die Farben des Bandes - dasselbe Rot, dasselbe Blau,
   mit derselben Woelbung (oben hell, unten tief) und einem Schlagschatten
   unter dem Bild. */
const wertZeichen = (art, inner, size = 26) => { const id = "w"+(++nr);
  const [o, m, u, ring] = art === "rot" ? ["#ff8a80", "#e5322c", "#7a0e0e", "#ff9b92"] : ["#8fb4ff", "#2d63e6", "#0d2a7a", "#9dbcff"];
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o}"/><stop offset=".38" stop-color="${m}"/><stop offset="1" stop-color="${u}"/></linearGradient>
  <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <filter id="${id}s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy=".7" stdDeviation=".6" flood-color="#2a0505" flood-opacity=".7"/></filter></defs>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="url(#${id})"/>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="url(#${id}g)"/>
  <rect x="1" y="1" width="22" height="22" rx="6.2" fill="none" stroke="${ring}" stroke-width=".9" opacity=".75"/>
  <g transform="translate(12 12) scale(.62) translate(-12 -12)" fill="#fff" filter="url(#${id}s)" opacity=".94">${inner}</g></svg>`; };
/* als STRICH gezeichnet, nicht gefuellt - wie die Faehigkeiten */
const KLINGE_STRICH = `<path d="M12 3.2l2.1 3.6v7.4H9.9V6.8z"/><path d="M7.4 14.2h9.2"/><path d="M12 14.2v4.3"/><path d="M10.3 18.5h3.4"/>`;
const HERZ_STRICH = `<path d="M12 19.4c-3.8-3-6.7-5.4-6.7-8.5A3.7 3.7 0 0 1 12 8.2a3.7 3.7 0 0 1 6.7 2.7c0 3.1-2.9 5.5-6.7 8.5z"/>`;
const KLINGE = `<path d="M12 2.8l2.2 5.6v5.8H9.8V8.4z"/><path d="M7.2 14.2h9.6v1.7H7.2z"/><path d="M11 15.9h2v3.3h-2z"/><circle cx="12" cy="20.3" r="1.4"/>`;
const HERZ = `<path d="M12 20.2c-4.2-3.3-7.4-5.9-7.4-9.4A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.4c0 3.5-3.2 6.1-7.4 9.4z"/>`;
const AB = [["sprung",`<path d="M5 16c2-7 12-7 14 0"/><path d="M16.6 13.4L19 16l-3.4.6"/><path d="M8 17h1M11 17h1"/>`],
  ["schritt",`<path d="M7 17l4-4 2 2 4-6"/><path d="M14 9h3v3"/>`],
  ["riss",`<circle cx="8" cy="12" r="2.6"/><circle cx="16.5" cy="9" r="1.7" opacity=".7"/><path d="M11 11l3-1.4" stroke-dasharray="1.6 1.8"/>`],
  ["leben",`<path d="M12 17c-3-2.4-5.5-4.4-5.5-7A3 3 0 0 1 12 8a3 3 0 0 1 5.5 2c0 2.6-2.5 4.6-5.5 7z"/>`],
  ["leben",`<path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z"/><path d="M12 8v7" opacity=".7"/>`],
  ["geschoss",`<path d="M5 19L17 7"/><path d="M13.5 7H17v3.5"/><path d="M7 13l4 4"/>`],
  ["schlag",`<circle cx="12" cy="12" r="2.4"/><path d="M12 5v2.4M12 16.6V19M5 12h2.4M16.6 12H19M7 7l1.7 1.7M17 7l-1.7 1.7M7 17l1.7-1.7M17 17l-1.7-1.7"/>`],
  ["krone",`<path d="M5 16h14"/><path d="M5 16l1.5-7 3.5 4L12 7l2 6 3.5-4L19 16"/>`],
  ["riss",`<circle cx="12" cy="12" r="7" stroke-dasharray="3 2"/><path d="M9 9l6 6M15 9l-6 6"/>`],
  ["sprung",`<path d="M4 13c2-2 4-2 6 0s4 2 6 0 4-2 4 0"/><path d="M4 17c2-2 4-2 6 0s4 2 6 0 4-2 4 0"/><path d="M12 5v5"/>`]];
const leer = () => `<span style="width:26px;height:26px;border-radius:7px;border:1px dashed rgba(233,207,138,.32);background:rgba(8,5,14,.4);display:block"></span>`;
const reihe = (gelernt, gesamt) => { let s = "", n = 0;
  const feld = () => n < gelernt ? zeichen(AB[n][0], AB[n][1], 26) : leer();
  let raus = "";
  for (let r = 0; r < Math.ceil(gesamt / 5); r++) { let z = "";
    for (let i = 0; i < Math.min(5, gesamt - r * 5); i++) { z += feld(); n++; }
    raus += `<div class="zeichen">${z}</div>`; }
  return raus; };
/* das Zugbild */
const spr = new Set(["1,2","2,1","2,-1","1,-2","-1,-2","-2,-1","-2,1","-1,2"]);
let gitter = "";
for (let r = 3; r >= -3; r--) for (let f = -3; f <= 3; f++) {
  const ich = !f && !r, s = spr.has(`${f},${r}`), hell = (f + r + 100) % 2 === 0;
  gitter += `<i style="${ich ? "background:linear-gradient(160deg,#e7c877,#b1863c);box-shadow:0 0 5px rgba(231,200,119,.7)"
    : s ? "background:rgba(233,197,63,.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)"
    : hell ? "background:rgba(255,255,255,.05)" : "background:rgba(255,255,255,.02)"}"></i>`; }
/* ── DAS ECHTE SOCKELBAND ──────────────────────────────────────────────────
   Besitzer: "das Band ist ja voll daneben, mach das bitte einfach genau
   gleich wie auch in der Uebersicht."

   Mein Nachbau war eine geratene Ellipse - er konnte gar nicht sitzen. Das
   Spiel zeichnet das Band in BILDPIXELN aus scripts/messe_sockel.py ->
   sockelband.json: fuer jedes Gemaelde die Ellipse seiner Bodenkante (cx, rx,
   ry, boden). Hier ist genau diese Rechnung portiert, mit denselben Massen,
   demselben viewBox (576x576) und derselben Ausrichtung wie das Bild - damit
   liegt es exakt so wie im Hofstaat. Springer: cx 286,5 rx 129 ry 24,7
   boden 557. Dame: cx 327,5 rx 137 ry 28 boden 567. */
const MASS = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const bogen = (m, hoch, tA, tB, n = 18) => {
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = tA + (tB - tA) * (i / n);
    pts.push([m.cx + m.rx * Math.cos(t), (m.boden - m.ry) - m.ry * Math.sin(t) - hoch]); }
  return pts; };
const P = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const segment = (m, h, tA, tB) => P(bogen(m, 0, tA, tB)) + " " + P(bogen(m, h, tB, tA)).replace(/^M/, "L") + " Z";
/* ── DIE VIER ZUSTAENDE DES BANDES (Besitzeridee) ──────────────────────────
   "Lassen wir alle Sockel so mit dem Band, und wenn man kein HP hat, dann ist
   es schwarz. Wichtig ist nur, dass man oben und unten immer dieses leicht
   beigefarbene sieht. Und wenn man dann ohne HP und Staerke spielt, dann
   faerben wir das Band in hellgrau und dunkelgrau fuer Gegner."
   Die Goldfassung bleibt in JEDEM Zustand stehen - sie ist das Beige. */
const BAND_ART = {
  werte:  { a: ["#ff8a80", "#e5322c", "#7a0e0e"], b: ["#8fb4ff", "#2d63e6", "#0d2a7a"] },
  leer:   { a: null, b: null },
  eigen:  { a: ["#f2ece0", "#cdc6b6", "#7c766a"], b: ["#f2ece0", "#cdc6b6", "#7c766a"] },
  gegner: { a: ["#6e6e78", "#3a3a44", "#141418"], b: ["#6e6e78", "#3a3a44", "#141418"] },
};
const band = (paintedId, leben, kraft, art = "werte") => {
  const m = MASS[paintedId]; const id = "sb" + paintedId + art;
  const F = BAND_ART[art];
  if (art === "leer") { leben = 0; kraft = 0; }
  if (art === "eigen" || art === "gegner") { leben = 0.5; kraft = 0.5; }
  const h = Math.round(m.rx * 2 * 0.17), rand = Math.max(2, h * 0.13);
  const tL = Math.PI, tR = 2 * Math.PI;
  const a = tL + (tR - tL) * leben, b = tR - (tR - tL) * kraft;
  const mA = Math.min(a, b), mB = Math.max(a, b);
  const u = (k) => `${id}-${k}`;
  return `<svg viewBox="0 0 ${m.W} ${m.H}" preserveAspectRatio="xMidYMax meet" data-gg="sockelband"
    style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:2">
    <defs>
      ${F.a ? `<linearGradient id="${u("rot")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${F.a[0]}"/><stop offset=".35" stop-color="${F.a[1]}"/><stop offset="1" stop-color="${F.a[2]}"/></linearGradient>` : ""}
      ${F.b ? `<linearGradient id="${u("blau")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${F.b[0]}"/><stop offset=".35" stop-color="${F.b[1]}"/><stop offset="1" stop-color="${F.b[2]}"/></linearGradient>` : ""}
      <linearGradient id="${u("dunkel")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a44"/><stop offset=".4" stop-color="#15151b"/><stop offset="1" stop-color="#050507"/></linearGradient>
      <linearGradient id="${u("gold")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#c99a45"/><stop offset="1" stop-color="#6e4e1c"/></linearGradient>
      <linearGradient id="${u("rund")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
      <linearGradient id="${u("glanz")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".22" stop-color="#000" stop-opacity=".12"/><stop offset=".3" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset=".82" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
    </defs>
    <path d="${segment(m, h + rand, tL, tR)}" fill="url(#${u("gold")})"/>
    ${a > tL ? `<path d="${segment(m, h, tL, a)}" fill="url(#${u("rot")})"/>` : ""}
    ${mB > mA ? `<path d="${segment(m, h, mA, mB)}" fill="url(#${u("dunkel")})"/>` : ""}
    ${b < tR ? `<path d="${segment(m, h, b, tR)}" fill="url(#${u("blau")})"/>` : ""}
    <path d="${segment(m, h, tL, tR)}" fill="url(#${u("glanz")})"/>
    <path d="${segment(m, h, tL, tR)}" fill="url(#${u("rund")})"/>
    <path d="${P(bogen(m, h, tL, tR))}" fill="none" stroke="url(#${u("gold")})" stroke-width="${rand}"/>
    <path d="${P(bogen(m, rand * 0.5, tL, tR))}" fill="none" stroke="#5a3d12" stroke-width="${rand * 0.6}" opacity=".7"/>
  </svg>`; };

const eck = `<svg viewBox="0 0 16 16" width="10" height="10"><path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = [[0,"top:3px;left:3px"],[90,"top:3px;right:3px"],[180,"bottom:3px;right:3px"],[270,"bottom:3px;left:3px"]]
  .map(([d,p]) => `<div style="position:absolute;${p};transform:rotate(${d}deg);z-index:-1;line-height:0;opacity:.85">${eck}</div>`).join("");
const pfeil = (l) => `<svg width="13" height="30" viewBox="0 0 10 24" fill="none" stroke="#b79dff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block;filter:drop-shadow(0 0 5px rgba(139,92,246,.7))"><path d="${l ? "M7.5 2L2.5 12l5 10" : "M2.5 2l5 10-5 10"}"/></svg>`;
const abz = (stufe, id) => `<svg width="34" height="34" viewBox="0 0 64 64" style="display:block;flex:0 0 auto"><defs><radialGradient id="ab${id}" cx="50%" cy="30%" r="76%"><stop offset="0%" stop-color="#f3d68d"/><stop offset="60%" stop-color="#c79a3e"/><stop offset="100%" stop-color="#7e5a1c"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#ab${id})" stroke="#f6e2a8" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="#2a1d0a" opacity=".5"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="800" font-family="Georgia,serif" fill="#ffd27a">${stufe}</text></svg>`;
const pips = (n) => `<div class="pips">${Array.from({length:10},(_,i)=>`<i class="${i<n?"v":""}"></i>`).join("")}</div>`;

const blatt = ({ name, haus, satz, stufe, atk, hp, gelernt, gesamt, kul, fig, ton, id, leben, kraft }) => `
<div class="schirm">
  <div class="reiter"><span class="an">Hofstaat</span><span>Aufstellung</span></div>
  <div style="position:relative"><div class="pfeilL">${pfeil(true)}</div><div class="pfeilR">${pfeil(false)}</div>
  <div class="blatt"><div class="rumpf">
    <div class="buehne">
      <img class="kul" src="KUL_${id}" alt=""><div class="sch"></div>${ecken}
      <div class="kopfzeile"><div class="stufenzeile">${pips(stufe)}${abz(stufe, id)}</div></div>
      <div class="zwei">
        <div class="links">
          <div class="figur"><img src="FIG_${id}" alt="" style="filter:drop-shadow(0 0 12px ${ton}88) drop-shadow(0 3px 5px rgba(0,0,0,.55))">
            ${band(id === "k" ? "knight" : "queen", leben, kraft)}</div>
          <div class="titel"><div class="n">${name}</div><div class="h">${haus}</div></div>
        </div>
        <div class="rechts">
          <div class="gitter">${gitter}</div>
          ${reihe(gelernt, gesamt)}
        </div>
      </div>
      <div class="satz">„${satz}“</div>
      <div class="werte">
        <div class="wert">${zeichen("bandRot", KLINGE_STRICH)}<div><div class="z">${atk}</div><div class="w">Angriff</div></div><div class="naechste"><b>+1</b><span>nächste</span></div></div>
        <div class="wert">${zeichen("bandBlau", HERZ_STRICH)}<div><div class="z">${hp}</div><div class="w">Leben</div></div><div class="naechste"><b>+1</b><span>nächste</span></div></div>
      </div>
      <div class="knopf">Verbessern · 2 <img src="${SKILL}" alt="" style="width:17px;height:17px;transform:scale(1.18);filter:drop-shadow(0 0 4px rgba(246,222,150,.55))"></div>
    </div>
  </div></div></div>
  <div class="unterleiste"><span>Spielen</span><span style="color:#c4b5fd">Figuren</span><span>Lager</span><span>Profil</span></div>
</div>`;

const HTML = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"Cormorant";src:url(FONT_I) format("woff2");font-weight:500;font-style:italic}
:root{--gold:#e9cf8a;--ink:#f0e9d8;--dim:#a9a48e;--faint:#837e6f;--linie:#2f2450;--riss:#a78bfa;--rissHell:#c4b5fd}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07050c;padding:26px;font-family:system-ui,sans-serif;color:var(--ink)}
.reihen{display:flex;gap:26px;align-items:flex-start}
.marke{font:600 12px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:9px}
.marke small{display:block;letter-spacing:0;text-transform:none;font-weight:400;color:var(--faint);font-size:11px;margin-top:3px}
.schirm{width:390px;display:flex;flex-direction:column;gap:10px}
.reiter{display:flex;gap:6px;padding:5px;border-radius:14px;background:rgba(16,11,30,.8);border:1px solid var(--linie)}
.reiter span{flex:1;text-align:center;padding:8px 6px;border-radius:10px;font:700 11px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}
.reiter span.an{background:linear-gradient(172deg,rgba(60,38,104,.95),rgba(30,19,56,.95));color:var(--rissHell);border:1px solid var(--riss);box-shadow:0 0 10px rgba(139,92,246,.3)}
.blatt{border-radius:20px;border:1px solid var(--riss);overflow:hidden;position:relative;
  box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 26px rgba(139,92,246,.4);
  background:#08050e}
/* v-Entwurf 5 (Besitzer): "da hast du noch einen Hintergrund reingebaut der
   so hell ist, der liegt ueber dem anderen". Richtig - das Blatt trug seinen
   eigenen violetten Verlauf, und das 10-px-Polster liess ihn als hellen
   Rahmen um die Buehne stehen. Jetzt fuellt die Buehne das Blatt ganz aus:
   ein Kasten, EIN Hintergrund. */
.rumpf{padding:0}
.buehne{position:relative;isolation:isolate;border-radius:19px;border-width:0 !important;overflow:hidden;padding:10px 12px 12px;
  border:1px solid rgba(233,207,138,.26);background:linear-gradient(180deg,rgba(20,13,36,.9),rgba(10,7,19,.96))}
.buehne .kul{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 38%;opacity:.66;z-index:-2}
.buehne .sch{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(8,5,14,.6) 0%,rgba(8,5,14,.22) 38%,rgba(8,5,14,.72) 100%)}
/* die Pfeile stehen MITTIG in der Hoehe, nicht mehr oben */
/* v-Entwurf 6 (Besitzer): "diese rechts links als lila und ausserhalb der
   Kachel und sehr flach an den Rand". Sie sitzen jetzt NEBEN dem Blatt, nicht
   darin - schmal, violett, ohne Kasten. */
.pfeilL,.pfeilR{position:absolute;top:50%;transform:translateY(-50%);z-index:4}
.pfeilL{left:-20px} .pfeilR{right:-20px}
.blatt{margin:0 22px}
.schirm{width:434px}
.kopfzeile{display:flex;align-items:center;margin-bottom:6px}
.stufenzeile{margin-left:auto;display:flex;align-items:center;gap:4px}
.pips{display:flex;gap:3px}
.pips i{width:7px;height:5px;border-radius:3px;background:rgba(255,255,255,.12);display:block}
.pips i.v{background:linear-gradient(90deg,#d1ad55,#eac96b);box-shadow:0 0 5px rgba(234,201,107,.5)}
.zwei{display:flex;gap:10px;align-items:flex-end;padding:0 14px}
.links{flex:0 0 auto;width:148px;display:flex;flex-direction:column;gap:5px}
.figur{width:148px;height:150px;position:relative}
.figur img{width:100%;height:100%;object-fit:contain;object-position:bottom}
.titel{text-align:center}
.titel .n{font:500 italic 20px/1.1 "Cormorant",Georgia,serif;color:#f3ecd2;text-shadow:0 1px 6px rgba(0,0,0,.9)}
.titel .h{font:600 9px/1 Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#cbbf9a;margin-top:4px;text-shadow:0 1px 5px rgba(0,0,0,.9)}
.rechts{flex:0 0 auto;width:154px;display:flex;flex-direction:column;gap:6px}
.gitter{display:grid;grid-template-columns:repeat(7,1fr);gap:1.5px;padding:4px;border-radius:8px;background:rgba(8,12,22,.5);border:1px solid rgba(255,255,255,.07)}
.gitter i{aspect-ratio:1;border-radius:3px;display:block}
.zeichen{display:flex;gap:6px}
.satz{font:italic 11.5px/1.4 Georgia,serif;color:#cec7ab;margin:9px 0 10px;text-align:center;text-shadow:0 1px 5px rgba(0,0,0,.9)}
.werte{display:flex;gap:9px}
.wert{flex:1;display:flex;align-items:center;gap:8px;padding:6px 9px;border-radius:11px;background:rgba(10,7,19,.72);border:1px solid var(--linie)}
.wert .z{font:800 17px/1 Georgia,serif;color:var(--ink)}
.wert .w{font:600 8.5px/1 Georgia,serif;letter-spacing:.11em;text-transform:uppercase;color:var(--faint);margin-top:3px}
.naechste{margin-left:auto;text-align:right}
.naechste b{display:block;font:800 12px/1 Georgia,serif;color:var(--rissHell);text-shadow:0 0 7px rgba(167,139,250,.75)}
.naechste span{display:block;font:600 7.5px/1 Georgia,serif;letter-spacing:.09em;text-transform:uppercase;color:#9a8fc0;margin-top:3px}
.knopf{margin-top:9px;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 15px;border-radius:11px;
  font:800 13.5px/1 system-ui,sans-serif;background:linear-gradient(172deg,rgba(40,24,72,.97),rgba(14,9,28,.99));
  color:var(--rissHell);border:1px solid var(--riss);box-shadow:0 0 12px rgba(139,92,246,.4);text-shadow:0 0 8px rgba(196,181,253,.8)}
.unterleiste{display:flex;gap:6px;padding:7px;border-radius:14px;background:rgba(16,11,30,.8);border:1px solid var(--linie);
  font:700 9px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.unterleiste span{flex:1;text-align:center;padding:7px 4px}
</style>
<div class="marke">Entwurf 6 · Pfeile draußen, Wertzeichen im Gewand der Fähigkeiten, der richtige Splitter
  <small>Die Pfeile stehen violett und flach neben dem Blatt. Klinge und Herz sind jetzt heller Strich auf dunklem Grund, im Rot und Blau des Bandes. „Verbessern“ trägt den Kristallsplitter aus der CARVED-Fassung.</small></div>
<div class="reihen">
${blatt({ id: "k", name: "Springer", haus: "Freie Figur", satz: "Reitet Winkel, die keine Mauer je bedacht hat.", stufe: 5, atk: 4, hp: 7, gelernt: 2, gesamt: 5, ton: "#d64b3c", leben: .72, kraft: .55 })}
${blatt({ id: "d", name: "Dame", haus: "Bund · Krone", satz: "Sie geht, wohin sie will, und niemand fragt warum.", stufe: 10, atk: 7, hp: 12, gelernt: 7, gesamt: 10, ton: "#c2416b", leben: .95, kraft: .8 })}
</div>

<div class="marke" style="margin-top:26px">Die vier Zustände des Bandes — dein Vorschlag, gezeichnet
  <small>Jede Figur behält ihren Ring; nur seine Füllung wechselt. Die Goldfassung oben und unten bleibt immer stehen.</small></div>
<div style="display:flex;gap:18px;flex-wrap:wrap">
  ${["werte","leer","eigen","gegner"].map((art, i) => `<div style="width:190px;display:flex;flex-direction:column;gap:6px;align-items:center">
    <div style="position:relative;width:190px;height:192px;border-radius:14px;overflow:hidden;background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.95),rgba(10,7,19,.99))">
      <img src="FIG_k" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom">
      ${band("knight", .72, .55, art)}
    </div>
    <div style="font:600 10px/1.35 Georgia,serif;letter-spacing:.06em;color:#cbbf9a;text-align:center">
      ${["Mit Leben und Kraft<br><span style='color:#837e6f'>rot links, blau rechts</span>",
         "Noch ohne Werte<br><span style='color:#837e6f'>schwarz, Fassung bleibt</span>",
         "Schach ohne Werte · eigene<br><span style='color:#837e6f'>hellgrau</span>",
         "Schach ohne Werte · Gegner<br><span style='color:#837e6f'>dunkelgrau</span>"][i]}</div>
  </div>`).join("")}
</div>`;

let html = HTML.replaceAll("FONT_I", b64("public/fonts/cormorant-500i.woff2", "font/woff2"));
html = html.replaceAll('src="KUL_k"', 'src="' + b64("src/app/ui/assets/kulissen/bund-geleit.webp", "image/webp") + '"')
  .replaceAll('src="KUL_d"', 'src="' + b64("src/app/ui/assets/kulissen/bund-krone.webp", "image/webp") + '"')
  .replaceAll('src="FIG_k"', 'src="' + b64("src/app/ui/assets/painted/painted-knight.webp", "image/webp") + '"')
  .replaceAll('src="FIG_d"', 'src="' + b64("src/app/ui/assets/painted/painted-queen.webp", "image/webp") + '"');
fs.writeFileSync("/mnt/user-data/outputs/entwurf-figurenblatt-6.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 3 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-figurenblatt-6.html"), { waitUntil: "load" });
await p.waitForTimeout(600);
await p.screenshot({ path: "/mnt/user-data/outputs/entwurf-figurenblatt-6.png", fullPage: true });
const m = await p.evaluate(() => [...document.querySelectorAll(".rechts")].map((r) => Math.round(r.getBoundingClientRect().height)));
console.log("rechte Spalten:", JSON.stringify(m));
await b.close();
