/* Entwurfswerkzeug: die Kachel des Hofstaats mit der GEMESSENEN Geometrie
   (119x179, Polster 10/7/9, Kopfzeile 21, Name bei 153,1) - um zu sehen, wie
   viele Faehigkeitszeichen links wirklich gut aussehen. Kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const FAM = { schritt:["#123c2a","#0a2418","#6fe0a8","#c8f5dd"], sprung:["#12314e","#0a1d30","#6fc2f0","#cfeaff"],
  schlag:["#4a1420","#2c0a12","#f07a8a","#ffd9de"], geschoss:["#4a3410","#2c1e08","#eec06a","#ffedc4"],
  riss:["#321a5e","#1d0e3a","#a78bfa","#e6dcff"], leben:["#0f3d33","#08241e","#5ad4b0","#c8f7e8"], krone:["#4a3a10","#2c2208","#f0d68a","#fff3cf"] };
let nr = 0;
const zeichen = (fam, inner, size) => { const [g,t,r,st] = FAM[fam]; const id = "k"+(++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block"><defs><radialGradient id="${id}" cx="50%" cy="32%" r="75%"><stop offset="0%" stop-color="${g}"/><stop offset="100%" stop-color="${t}"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#${id})"/><circle cx="12" cy="12" r="11" fill="none" stroke="${r}" stroke-width="1" opacity=".85"/><g fill="none" stroke="${st}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" color="${st}">${inner}</g></svg>`; };
const AB = [
  ["sprung", `<path d="M5 16c2-7 12-7 14 0"/><path d="M16.6 13.4L19 16l-3.4.6"/><path d="M8 17h1M11 17h1"/>`],
  ["schritt", `<path d="M7 17l4-4 2 2 4-6"/><path d="M14 9h3v3"/>`],
  ["riss", `<circle cx="8" cy="12" r="2.6"/><circle cx="16.5" cy="9" r="1.7" opacity=".7"/><path d="M11 11l3-1.4" stroke-dasharray="1.6 1.8"/>`],
  ["leben", `<path d="M12 17c-3-2.4-5.5-4.4-5.5-7A3 3 0 0 1 12 8a3 3 0 0 1 5.5 2c0 2.6-2.5 4.6-5.5 7z"/>`],
  ["leben", `<path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z"/><path d="M12 8v7" opacity=".7"/>`],
  ["geschoss", `<path d="M5 19L17 7"/><path d="M13.5 7H17v3.5"/><path d="M7 13l4 4"/>`],
];
const eck = `<svg viewBox="0 0 16 16" width="10" height="10"><path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = [["ol",0],["or",90],["ur",180],["ul",270]].map(([w,d],i) =>
  `<div style="position:absolute;${i<2?"top:2px":"bottom:2px"};${i===0||i===3?"left:2px":"right:2px"};transform:rotate(${d}deg);z-index:-1;line-height:0;opacity:.85">${eck}</div>`).join("");
const abzeichen = (stufe) => `<svg width="36" height="36" viewBox="0 0 64 64" style="position:absolute;top:7px;right:7px;z-index:2"><defs><radialGradient id="ab${stufe}" cx="50%" cy="30%" r="76%"><stop offset="0%" stop-color="#f3d68d"/><stop offset="60%" stop-color="#c79a3e"/><stop offset="100%" stop-color="#7e5a1c"/></radialGradient></defs><circle cx="32" cy="32" r="26" fill="url(#ab${stufe})" stroke="#f6e2a8" stroke-width="2"/><circle cx="32" cy="32" r="20" fill="#2a1d0a" opacity=".55"/><text x="32" y="40" text-anchor="middle" font-size="22" font-weight="800" font-family="Georgia,serif" fill="#f7d76c">${stufe}</text></svg>`;

const kachel = (n, name, mehr = 0, gr = 21) => `
<div style="position:relative;width:119px;height:179px;border-radius:11px;overflow:hidden;isolation:isolate;
  border:1px solid rgba(233,207,138,.3);padding:10px 7px 9px;display:flex;flex-direction:column;
  background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.95),rgba(12,8,22,.98))">
  <img src="KUL" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.62;z-index:-2">
  <div style="position:absolute;inset:0;z-index:-2;background:linear-gradient(180deg,rgba(8,5,14,.55) 0%,rgba(8,5,14,.15) 45%,rgba(8,5,14,.7) 100%)"></div>
  ${ecken}
  ${abzeichen(n + 2)}
  <div style="position:absolute;left:7px;top:7px;display:flex;flex-direction:column;gap:3px;z-index:2">
    ${Array.from({ length: n }, (_, i) => `<span style="width:${gr}px;height:${gr}px;display:grid;place-items:center;border-radius:6px;background:rgba(12,8,22,.78);border:1px solid rgba(233,207,138,.45)">${zeichen(AB[i % 6][0], AB[i % 6][1], gr - 6)}</span>`).join("")}
    ${mehr ? `<span style="width:${gr}px;height:${gr}px;display:grid;place-items:center;border-radius:6px;background:rgba(12,8,22,.78);border:1px solid rgba(233,207,138,.3);font:700 10px/1 Georgia,serif;color:#e9cf8a">+${mehr}</span>` : ""}
  </div>
  <img src="FIG" alt="" style="position:absolute;left:0;right:0;bottom:24px;top:28px;width:100%;height:127px;object-fit:contain;object-position:bottom;z-index:1">
  <div style="position:absolute;left:0;right:0;top:153px;height:16px;text-align:center;font:500 italic 13px/16px 'Cormorant',Georgia,serif;color:#f0e8cc;z-index:2;text-shadow:0 1px 5px rgba(0,0,0,.9)">${name}</div>
</div>`;

const HTML = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"Cormorant";src:url(FONT) format("woff2");font-weight:500;font-style:italic}
body{background:#07050c;margin:0;padding:26px;font-family:system-ui,sans-serif;color:#f0e9d8}
.marke{font:600 12px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:8px}
.marke small{display:block;letter-spacing:0;text-transform:none;font-weight:400;color:#837e6f;font-size:11px;margin-top:3px}
.reihe{display:flex;gap:16px;align-items:flex-start;margin-bottom:22px}
.fall{display:flex;flex-direction:column;gap:7px;align-items:center}
.unter{font:600 10px/1.3 Georgia,serif;letter-spacing:.06em;color:#a9a48e;text-align:center}
</style>
<div class="marke">Wie viele Zeichen die Kachel trägt<small>Gemessen: Kachel 119 × 179, die Spalte beginnt bei y 7, der Name bei y 153 — 146 px frei.</small></div>
<div class="reihe">
  <div class="fall">${kachel(2, "Springer")}<div class="unter">2 — der Normalfall<br>50 px Luft</div></div>
  <div class="fall">${kachel(4, "Turm")}<div class="unter">4<br>53 px Luft</div></div>
  <div class="fall">${kachel(5, "Erzbischof")}<div class="unter"><b style="color:#e9cf8a">5 — dein Vorschlag</b><br>29 px Luft</div></div>
  <div class="fall">${kachel(6, "Dame")}<div class="unter">6 — das Höchste, was passt<br>5 px Luft, klebt am Namen</div></div>
  <div class="fall">${kachel(5, "Dame", 5)}<div class="unter">5 + „+5"<br>nichts verschwindet stumm</div></div>
</div>
<div class="marke">Dieselbe Reihe mit 19 px statt 21<small>Kleiner heißt nicht mehr Platz für mehr: auch bei 19 px passen nur sechs.</small></div>
<div class="reihe">
  <div class="fall">${kachel(5, "Erzbischof", 0, 19)}<div class="unter">5 zu 19 px<br>41 px Luft</div></div>
  <div class="fall">${kachel(6, "Dame", 0, 19)}<div class="unter">6 zu 19 px<br>17 px Luft</div></div>
  <div class="fall">${kachel(5, "Dame", 5, 19)}<div class="unter">5 + „+5" zu 19 px</div></div>
</div>`;

let html = HTML.replaceAll("FONT", b64("public/fonts/cormorant-500i.woff2", "font/woff2"))
  .replaceAll("KUL", b64("src/app/ui/assets/kulissen/bund-geleit.webp", "image/webp"))
  .replaceAll("FIG", b64("src/app/ui/assets/painted/painted-knight.webp", "image/webp"));
fs.writeFileSync("/mnt/user-data/outputs/entwurf-kachel-zeichen.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 800, height: 700 }, deviceScaleFactor: 3 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-kachel-zeichen.html"), { waitUntil: "load" });
await p.waitForTimeout(500);
await p.screenshot({ path: "/mnt/user-data/outputs/entwurf-kachel-zeichen.png", fullPage: true });
await b.close();
