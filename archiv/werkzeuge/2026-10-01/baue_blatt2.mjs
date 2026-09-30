/* Entwurf 2 des Figurenblatts (Besitzer): Figur LINKS mit dem Titel DARUNTER,
   rechts daneben Grundzuege und Faehigkeiten, der Hintergrund ueber BEIDE
   Spalten. Dazu die Werte und - beim Stufenschritt - was dazukommt.
   Kein Spielcode, nur Entwurf. */
import fs from "node:fs"; import path from "node:path";
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const FAM = { schritt:["#123c2a","#0a2418","#6fe0a8","#c8f5dd"], sprung:["#12314e","#0a1d30","#6fc2f0","#cfeaff"],
  schlag:["#4a1420","#2c0a12","#f07a8a","#ffd9de"], riss:["#321a5e","#1d0e3a","#a78bfa","#e6dcff"],
  leben:["#0f3d33","#08241e","#5ad4b0","#c8f7e8"], geschoss:["#4a3410","#2c1e08","#eec06a","#ffedc4"] };
let nr = 0;
const zeichen = (fam, inner, size = 26, voll = false) => { const [g,t,r,st] = FAM[fam]; const id = "q"+(++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto"><defs><radialGradient id="${id}" cx="50%" cy="32%" r="75%"><stop offset="0%" stop-color="${g}"/><stop offset="100%" stop-color="${t}"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#${id})"/><circle cx="12" cy="12" r="11" fill="none" stroke="${r}" stroke-width="1" opacity=".85"/><g fill="${voll?st:"none"}" stroke="${st}" stroke-width="${voll?0.9:1.5}" stroke-linecap="round" stroke-linejoin="round" color="${st}">${inner}</g></svg>`; };
const KLINGE = `<path d="M12 2.8l2.2 5.6v5.8H9.8V8.4z"/><path d="M7.2 14.2h9.6v1.7H7.2z"/><path d="M11 15.9h2v3.3h-2z"/><circle cx="12" cy="20.3" r="1.4"/>`;
const HERZ = `<path d="M12 20.2c-4.2-3.3-7.4-5.9-7.4-9.4A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.4c0 3.5-3.2 6.1-7.4 9.4z"/>`;
const AB = {
  longleap:["sprung",`<path d="M5 16c2-7 12-7 14 0"/><path d="M16.6 13.4L19 16l-3.4.6"/><path d="M8 17h1M11 17h1"/>`],
  outrider:["schritt",`<path d="M7 17l4-4 2 2 4-6"/><path d="M14 9h3v3"/>`],
  teleport:["riss",`<circle cx="8" cy="12" r="2.6"/><circle cx="16.5" cy="9" r="1.7" opacity=".7"/><path d="M11 11l3-1.4" stroke-dasharray="1.6 1.8"/>`],
  lifesteal:["leben",`<path d="M12 17c-3-2.4-5.5-4.4-5.5-7A3 3 0 0 1 12 8a3 3 0 0 1 5.5 2c0 2.6-2.5 4.6-5.5 7z"/>`],
  bulwark:["leben",`<path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z"/><path d="M12 8v7" opacity=".7"/>`],
};
const spr = new Set(["1,2","2,1","2,-1","1,-2","-1,-2","-2,-1","-2,1","-1,2"]);
let gitter = "";
for (let r = 3; r >= -3; r--) for (let f = -3; f <= 3; f++) {
  const ich = !f && !r, s = spr.has(`${f},${r}`), hell = (f + r + 100) % 2 === 0;
  gitter += `<i style="${ich ? "background:linear-gradient(160deg,#e7c877,#b1863c);box-shadow:0 0 5px rgba(231,200,119,.7)"
    : s ? "background:rgba(233,197,63,.5);box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)"
    : hell ? "background:rgba(255,255,255,.05)" : "background:rgba(255,255,255,.02)"}"></i>`;
}
const eck = `<svg viewBox="0 0 16 16" width="10" height="10"><path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = [[0,"top:3px;left:3px"],[90,"top:3px;right:3px"],[180,"bottom:3px;right:3px"],[270,"bottom:3px;left:3px"]]
  .map(([d,p]) => `<div style="position:absolute;${p};transform:rotate(${d}deg);z-index:-1;line-height:0;opacity:.85">${eck}</div>`).join("");
/* Das Sockelband in der Farbe der Figur - Leben voll, Kraft darunter */
const band = (leben, kraft, ton) => `<svg viewBox="0 0 100 9" width="100%" height="9" style="display:block">
  <rect x="0" y="0" width="100" height="4" rx="2" fill="rgba(6,4,12,.8)"/>
  <rect x="0" y="0" width="${leben}" height="4" rx="2" fill="${ton}"/>
  <rect x="0" y="5.5" width="100" height="3" rx="1.5" fill="rgba(6,4,12,.8)"/>
  <rect x="0" y="5.5" width="${kraft}" height="3" rx="1.5" fill="#e9cf8a" opacity=".8"/></svg>`;

const TON = "#d64b3c";   // die gemessene Figurenfarbe des Springers
const HTML = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"Cormorant";src:url(FONT_I) format("woff2");font-weight:500;font-style:italic}
:root{--gold:#e9cf8a;--ink:#f0e9d8;--dim:#a9a48e;--faint:#837e6f;--linie:#2f2450;--riss:#a78bfa;--rissHell:#c4b5fd}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07050c;padding:26px;font-family:system-ui,sans-serif;color:var(--ink)}
.reihen{display:flex;gap:24px;align-items:flex-start}
.marke{font:600 12px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:9px}
.marke small{display:block;letter-spacing:0;text-transform:none;font-weight:400;color:var(--faint);font-size:11px;margin-top:3px}
.blatt{width:370px;border-radius:20px;border:1px solid var(--riss);overflow:hidden;position:relative;
  box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 26px rgba(139,92,246,.45);
  background:radial-gradient(130% 110% at 50% -10%,rgba(124,58,237,.26) 0%,rgba(26,16,44,.97) 46%,rgba(8,5,14,.99) 100%)}
.rumpf{padding:13px 16px 16px;display:flex;flex-direction:column;gap:10px}
.x{position:absolute;top:9px;right:9px;z-index:6;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;
  background:rgba(10,13,20,.72);border:1px solid var(--riss);color:var(--rissHell);font-size:12px}
.buehne{position:relative;isolation:isolate;border-radius:14px;overflow:hidden;padding:12px;
  border:1px solid rgba(233,207,138,.26);background:linear-gradient(180deg,rgba(20,13,36,.9),rgba(10,7,19,.96))}
.buehne .kul{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 38%;opacity:.66;z-index:-2}
.buehne .sch{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(8,5,14,.55) 0%,rgba(8,5,14,.2) 42%,rgba(8,5,14,.55) 100%)}
.zwei{display:flex;gap:12px;align-items:flex-end}
.links{flex:0 0 auto;width:148px;display:flex;flex-direction:column;gap:6px}
.figur{width:148px;height:150px;position:relative}
.figur img{width:100%;height:100%;object-fit:contain;object-position:bottom;
  filter:drop-shadow(0 0 12px COLOR_GLOW) drop-shadow(0 3px 5px rgba(0,0,0,.55))}
.titel{text-align:center}
.titel .n{font:500 italic 20px/1.1 "Cormorant",Georgia,serif;color:#f3ecd2;text-shadow:0 1px 6px rgba(0,0,0,.9)}
.titel .h{font:600 9px/1 Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#cbbf9a;margin-top:4px;text-shadow:0 1px 5px rgba(0,0,0,.9)}
.rechts{flex:0 0 auto;width:154px;display:flex;flex-direction:column;gap:8px}
.gitter{display:grid;grid-template-columns:repeat(7,1fr);gap:1.5px;padding:4px;border-radius:8px;
  background:rgba(8,12,22,.55);border:1px solid rgba(255,255,255,.07)}
.gitter i{aspect-ratio:1;border-radius:3px;display:block}
.zeichen{display:flex;justify-content:space-between;align-items:center}
.zeichen .leer{width:26px;height:26px;border-radius:50%;border:1px dashed rgba(233,207,138,.32);background:rgba(8,5,14,.4)}
.satz{font:italic 11.5px/1.4 Georgia,serif;color:#cec7ab;margin-top:9px;text-align:center;text-shadow:0 1px 5px rgba(0,0,0,.9)}
.werte{display:flex;gap:10px}
.wert{flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:7px 10px;border-radius:11px;
  background:rgba(16,11,30,.72);border:1px solid var(--linie)}
.wert .z{font:800 17px/1 Georgia,serif;color:var(--ink)}
.wert .w{font:600 9px/1 Georgia,serif;letter-spacing:.11em;text-transform:uppercase;color:var(--faint);margin-top:3px}
.wert .plus{font:800 11px/1 Georgia,serif;color:#5ad4b0;margin-left:2px}
.leiter{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:12px;background:#1c1533;border:1px solid var(--linie)}
.leiter .t{flex:1;font-size:12.5px;color:#b9b295;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gewinn{display:inline-flex;align-items:center;gap:4px;font:800 12px/1 Georgia,serif}
.knopf{padding:9px 15px;border-radius:10px;font:800 13px/1 system-ui,sans-serif;
  background:linear-gradient(172deg,rgba(40,24,72,.97),rgba(14,9,28,.99));color:var(--rissHell);
  border:1px solid var(--riss);box-shadow:0 0 12px rgba(139,92,246,.4);text-shadow:0 0 8px rgba(196,181,253,.8)}
.sprossen{display:flex;gap:4px}
.sprossen i{flex:1;height:5px;border-radius:3px;background:#1c1533;border:1px solid var(--linie);display:block}
.sprossen i.v{background:linear-gradient(90deg,#d1ad55,#eac96b);border:none;box-shadow:0 0 6px rgba(234,201,107,.4)}
</style>
<div class="marke">Entwurf 2 · der Kopf, wie du ihn beschrieben hast
  <small>Figur links, der Name DARUNTER — rechts daneben Grundzüge und Fähigkeiten. Der Hintergrund läuft über beide Spalten. Der Schimmer hinter der Figur trägt jetzt ihre eigene Farbe.</small></div>
<div class="reihen">
<div class="blatt"><div class="x">✕</div><div class="rumpf">
  <div class="buehne">
    <img class="kul" src="KUL" alt=""><div class="sch"></div>${ecken}
    <div class="zwei">
      <div class="links">
        <div class="figur"><img src="FIG" alt=""></div>
        <div style="padding:0 6px">BAND</div>
        <div class="titel"><div class="n">Springer</div><div class="h">Freie Figur · Stufe 5</div></div>
      </div>
      <div class="rechts">
        <div class="gitter">GITTER</div>
        <div class="zeichen">IC_longleap IC_outrider <span class="leer"></span><span class="leer"></span><span class="leer"></span></div>
      </div>
    </div>
    <div class="satz">„Reitet Winkel, die keine Mauer je bedacht hat.“</div>
  </div>
  <div class="werte">
    <div class="wert">IC_angriff<div><div class="z">4</div><div class="w">Angriff</div></div></div>
    <div class="wert">IC_leben<div><div class="z">7</div><div class="w">Leben</div></div></div>
  </div>
  <div class="leiter">
    <div class="t">Stufe 5 → 6
      <span class="gewinn" style="color:#5ad4b0">GL_herz +1</span>
      <span class="gewinn" style="color:#f07a8a">GL_klinge +1</span></div>
    <div class="knopf">Verbessern · 2 ✧</div>
  </div>
  <div class="sprossen"><i class="v"></i><i class="v"></i><i class="v"></i><i class="v"></i><i class="v"></i><i></i><i></i><i></i><i></i><i></i></div>
</div></div>

<div style="width:370px">
  <div class="marke" style="margin-bottom:12px">Warum so
    <small>• Der Name steht unter der Figur, wie auf der Kachel — dasselbe Bild, dieselbe Ordnung.<br>
    • Rechts wächst von oben nach unten, was die Figur KANN: erst wie sie zieht, dann was sie gelernt hat. Fünf Plätze, leere bleiben als Ring stehen — man sieht, wie viel noch kommt.<br>
    • Das Sockelband liegt unter der Figur, in ihrer Farbe: oben das Leben, darunter schmaler die Kraft.<br>
    • Die Werte stehen als eigener Streifen darunter, und die Leiter zeigt mit denselben Zeichen, was der nächste Schritt bringt: +1 Leben, +1 Angriff.<br>
    • Der Schimmer hinter der Figur ist nicht mehr violett für alle, sondern der Ton der Figur — hier das Rot des Springers.</small></div>
</div>
</div>`;

/* REIHENFOLGE IST WICHTIG, und das habe ich mir selbst eingebrockt: kurze
   Platzhalter wie FIG oder BAND kommen auch IM BASE64 eines Bildes vor. Wer
   erst das Bild einsetzt und dann die kurzen Marken ersetzt, zerschneidet die
   Bilddaten - gerendert kam ein 30-px-Fetzen statt der Kulisse. Also erst
   alles Kurze, die Bilder ganz zuletzt. */
let html = HTML
  .replaceAll("GITTER", gitter)
  .replaceAll("BAND", band(70, 55, TON))
  .replaceAll("COLOR_GLOW", TON + "88")
  .replaceAll("GL_herz", `<svg width="13" height="13" viewBox="0 0 24 24"><path d="${HERZ.match(/d="([^"]+)"/)[1]}" fill="#5ad4b0"/></svg>`)
  .replaceAll("GL_klinge", `<svg width="13" height="13" viewBox="0 0 24 24" fill="#f07a8a">${KLINGE}</svg>`)
  .replaceAll("IC_angriff", zeichen("schlag", KLINGE, 26, true))
  .replaceAll("IC_leben", zeichen("leben", HERZ, 26, true));
for (const [k,[f,g]] of Object.entries(AB)) while (html.includes("IC_"+k)) html = html.replace("IC_"+k, zeichen(f,g,26));
html = html
  .replaceAll("FONT_I", b64("public/fonts/cormorant-500i.woff2", "font/woff2"))
  .replaceAll('src="KUL"', 'src="' + b64("src/app/ui/assets/kulissen/bund-geleit.webp", "image/webp") + '"')
  .replaceAll('src="FIG"', 'src="' + b64("src/app/ui/assets/painted/painted-knight.webp", "image/webp") + '"');
fs.writeFileSync("/mnt/user-data/outputs/entwurf-figurenblatt-2.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 830, height: 700 }, deviceScaleFactor: 3 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-figurenblatt-2.html"), { waitUntil: "load" });
await p.waitForTimeout(500);
await p.screenshot({ path: "/mnt/user-data/outputs/entwurf-figurenblatt-2.png", fullPage: true });
const m = await p.evaluate(() => { const l = document.querySelector(".links").getBoundingClientRect(), r = document.querySelector(".rechts").getBoundingClientRect();
  return { links: Math.round(l.height), rechts: Math.round(r.height), gleicheKante: Math.abs(l.bottom - r.bottom) < 1 }; });
console.log("gemessen:", JSON.stringify(m));
await b.close();
