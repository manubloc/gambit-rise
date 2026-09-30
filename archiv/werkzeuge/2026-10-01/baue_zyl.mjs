/* Vergleich: das Band nach der alten Regel (17 % der Tellerbreite) gegen das
   Band nach der GEMESSENEN Tellerhoehe. Entwurfswerkzeug, kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const MASS = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const ZYL = JSON.parse(fs.readFileSync("/tmp/zyl.json", "utf8"));
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const bogen = (m, hoch, tA, tB, n = 20) => { const p = [];
  for (let i = 0; i <= n; i++) { const t = tA + (tB - tA) * (i / n);
    p.push([m.cx + m.rx * Math.cos(t), (m.boden - m.ry) - m.ry * Math.sin(t) - hoch]); } return p; };
const P = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const seg = (m, h, a, b) => P(bogen(m, 0, a, b)) + " " + P(bogen(m, h, b, a)).replace(/^M/, "L") + " Z";
/* ALT: 17 % der Tellerbreite. NEU: die gemessene Hoehe des gemalten Tellers
   plus 4 px, mindestens aber 10 % der Tellerbreite, damit er auf flachen
   Sockeln nicht zum Strich wird. */
const hoeheAlt = (m) => Math.round(m.rx * 2 * 0.17);
const hoeheNeu = (m, id) => Math.max((ZYL[id]?.zylinder ?? 0) + 4, Math.round(m.rx * 2 * 0.10));
const band = (id, h, tag) => { const m = MASS[id];
  const rand = Math.max(2, h * 0.13), tL = Math.PI, tR = 2 * Math.PI;
  const a = tL + (tR - tL) * .72, b = tR - (tR - tL) * .55;
  const mA = Math.min(a, b), mB = Math.max(a, b), u = (k) => `${id}${tag}-${k}`;
  return `<svg viewBox="0 0 ${m.W} ${m.H}" preserveAspectRatio="xMidYMax meet" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:2">
  <defs>
    <linearGradient id="${u("r")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a80"/><stop offset=".35" stop-color="#e5322c"/><stop offset="1" stop-color="#7a0e0e"/></linearGradient>
    <linearGradient id="${u("b")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4ff"/><stop offset=".35" stop-color="#2d63e6"/><stop offset="1" stop-color="#0d2a7a"/></linearGradient>
    <linearGradient id="${u("d")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a44"/><stop offset=".4" stop-color="#15151b"/><stop offset="1" stop-color="#050507"/></linearGradient>
    <linearGradient id="${u("g")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#c99a45"/><stop offset="1" stop-color="#6e4e1c"/></linearGradient>
    <linearGradient id="${u("k")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
  </defs>
  <path d="${seg(m, h + rand, tL, tR)}" fill="url(#${u("g")})"/>
  <path d="${seg(m, h, tL, a)}" fill="url(#${u("r")})"/>
  ${mB > mA ? `<path d="${seg(m, h, mA, mB)}" fill="url(#${u("d")})"/>` : ""}
  <path d="${seg(m, h, b, tR)}" fill="url(#${u("b")})"/>
  <path d="${seg(m, h, tL, tR)}" fill="url(#${u("k")})"/>
  <path d="${P(bogen(m, h, tL, tR))}" fill="none" stroke="url(#${u("g")})" stroke-width="${rand}"/></svg>`; };

const WER = ["engineer", "knight", "boss-b01", "boss-b22", "guardian", "pawn"];
const zelle = (id) => { const m = MASS[id]; const z = ZYL[id]?.zylinder ?? 0;
  return `<div class="paar">
  <div class="zwei">
    ${["alt", "neu"].map((w) => `<div class="k">
      <img src="P_${id}" alt="">
      ${band(id, w === "alt" ? hoeheAlt(m) : hoeheNeu(m, id), w)}
      <div class="tag">${w === "alt" ? "heute · " + hoeheAlt(m) + " px" : "neu · " + hoeheNeu(m, id) + " px"}</div>
    </div>`).join("")}
  </div>
  <div class="nm">${id}<span>gemalter Teller ${z} px hoch</span></div></div>`; };

const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:24px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 15px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.5 Georgia,serif;color:#837e6f;margin-bottom:18px;max-width:980px}
.gitter{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.paar{display:flex;flex-direction:column;gap:6px}
.zwei{display:flex;gap:8px}
.k{position:relative;flex:1;aspect-ratio:1/1;border-radius:11px;overflow:hidden;
  background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.9),rgba(10,7,19,.99));border:1px solid rgba(233,207,138,.22)}
.k img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}
.tag{position:absolute;left:0;right:0;bottom:0;z-index:6;text-align:center;padding:3px;
  font:600 8.5px/1.2 Georgia,serif;letter-spacing:.06em;color:#cbbf9a;background:rgba(6,4,12,.75)}
.nm{font:700 11px/1.3 system-ui,sans-serif;text-align:center}
.nm span{display:block;font:400 9px/1.3 Georgia,serif;color:#8d8776;margin-top:2px}
</style>
<h1>Das Band nach der gemalten Tellerhöhe statt nach der Tellerbreite</h1>
<p class="u">Links jeweils wie heute — 17 % der Tellerbreite, unabhängig davon, wie hoch der gemalte Teller wirklich ist. Rechts die gemessene Höhe des gemalten Tellers plus 4 px, mindestens 10 % der Breite. Der Engineer war dein Beispiel: sein Teller ist 35 px hoch, das Band 46 — es ragte 11 px darüber und lief deshalb oben nicht in den Sockel über.</p>
<div class="gitter">${WER.map(zelle).join("")}</div>`;

let html = HTML;
for (const id of WER) html = html.replaceAll(`src="P_${id}"`, `src="${b64("src/app/ui/assets/painted/painted-" + id + ".webp", "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/band-tellerhoehe.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2.5 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/band-tellerhoehe.html"), { waitUntil: "load" });
await p.waitForTimeout(600);
await p.screenshot({ path: "/mnt/user-data/outputs/band-tellerhoehe.png", fullPage: true });
await b.close();
console.log("fertig");
