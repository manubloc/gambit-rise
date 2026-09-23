/* Alle Ungeheuer: links im Gemaelde-Kasten, rechts genau so, wie sie auf einem
   Schachfeld stehen - dieselbe Rechnung wie das Brett (Teller auf 136, Streckung
   hoechstens 1,10, Ausrichtung auf den Teller) samt Sockelband und Feldkante.
   Entwurfswerkzeug, kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const M = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const ZR = 136, ZH = 561, BODEN = 555, BAND = 46, HEB = 4;
const k = (m) => Math.max(0.55, Math.min(1.35, ZR / m.rx));
const st = (m) => m.oben == null ? 1 : Math.max(0.92, Math.min(1.10, ZH / ((m.boden - m.oben) * k(m))));
const mitte = (m) => -((m.cx - m.W / 2) / m.W) * 100;
const bogen = (m, hoch, tA, tB, n = 18) => { const p = [];
  for (let i = 0; i <= n; i++) { const t = tA + (tB - tA) * (i / n);
    p.push([m.cx + m.rx * Math.cos(t), (m.boden - m.ry) - m.ry * Math.sin(t) - hoch]); } return p; };
const P = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const seg = (m, h, a, b, fuss) => P(bogen(m, fuss, a, b)) + " " + P(bogen(m, h, b, a)).replace(/^M/, "L") + " Z";
/* das Band wie im Spiel: Oberkante auf der Standflaeche, feste Hoehe nach unten */
const band = (id, tag) => { const m = M[id]; if (!m || !m.teller) return "";
  const ges = k(m) * st(m), kopf = m.teller, hoehe = Math.max(8, Math.round(BAND / Math.max(0.2, ges)));
  const fuss = kopf - hoehe, rand = Math.max(2, hoehe * 0.13);
  const tL = Math.PI, tR = 2 * Math.PI, u = (x) => `${tag}-${x}`;
  return `<svg viewBox="0 0 ${m.W} ${m.H}" preserveAspectRatio="xMidYMax meet" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:2">
  <defs><linearGradient id="${u("g")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#c99a45"/><stop offset="1" stop-color="#6e4e1c"/></linearGradient>
  <linearGradient id="${u("d")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a44"/><stop offset=".4" stop-color="#15151b"/><stop offset="1" stop-color="#050507"/></linearGradient>
  <linearGradient id="${u("k")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>
  <path d="${seg(m, kopf + rand, tL, tR, fuss - rand)}" fill="url(#${u("g")})"/>
  <path d="${seg(m, kopf, tL, tR, fuss)}" fill="url(#${u("d")})"/>
  <path d="${seg(m, kopf, tL, tR, fuss)}" fill="url(#${u("k")})"/>
  <path d="${P(bogen(m, kopf, tL, tR))}" fill="none" stroke="url(#${u("g")})" stroke-width="${rand}"/></svg>`; };

const ids = Object.keys(M).filter((id) => /^boss-b\d+$/.test(id) || ["dragon", "boss-archenemy"].includes(id))
  .filter((id) => fs.existsSync("src/app/ui/assets/painted/painted-" + id + ".webp")).sort();

const zelle = (id) => { const m = M[id]; const kk = k(m), s = st(m), ges = kk * s;
  const aus = Math.max(-9, Math.min(9, (((m.H - m.boden) * ges - (m.H - BODEN)) / m.H) * 100)) - HEB;
  const h = Math.round((m.boden - m.oben) * ges);
  const gek = Math.abs(s - 1.10) < 1e-9;
  return `<div class="z">
    <div class="feld"><div class="innen" style="translate:${mitte(m).toFixed(2)}% ${aus.toFixed(2)}%;scale:${kk.toFixed(3)} ${ges.toFixed(3)}">
      <img src="P_${id}" alt="">${band(id, "b" + id)}</div></div>
    <div class="nm">${id.replace("boss-", "")}</div>
    <div class="za">×${kk.toFixed(2)} · ↕${s.toFixed(2)}${gek ? "<b> gekappt</b>" : ""} · H ${h}</div></div>`; };

const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:22px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 14px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.55 Georgia,serif;color:#9a927f;margin-bottom:16px;max-width:1100px}
.gitter{display:grid;grid-template-columns:repeat(9,1fr);gap:10px}
.z{display:flex;flex-direction:column;gap:3px}
/* das Feld exakt wie im Spiel: 65 px Kante, die Figur ragt darueber hinaus */
.feld{position:relative;aspect-ratio:1/1;background:repeating-conic-gradient(#1a1a1f 0% 25%, #d9d5cc 0% 50%) 0 0/200% 200%;
  border:1px solid rgba(233,207,138,.18);overflow:visible;border-radius:2px}
.innen{position:absolute;inset:0;transform-origin:50% 100%}
.innen img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}
.nm{font:700 9.5px/1.2 system-ui,sans-serif;text-align:center;word-break:break-all}
.za{font:400 8px/1.3 Georgia,serif;color:#8d8776;text-align:center}
.za b{color:#e08a84;font-weight:600}
</style>
<h1>Alle Ungeheuer, wie sie auf dem Schachfeld stehen</h1>
<p class="u">Gezeichnet mit genau der Regel, die jetzt gilt: Teller auf ${ZR} px Breite, Streckung höchstens <b>1,10</b>, Ausrichtung auf den Teller, gemeinsame Bodenlinie ${BODEN}, Sockelband mit der Oberkante auf der gemessenen Standfläche. Der Hintergrund ist ein Schachfeld in Originalgröße — die Figuren ragen bewusst darüber hinaus, so stehen sie auch im Spiel. „gekappt" heißt: die Streckung liegt an der Grenze 1,10, die Figur bleibt also niedriger als die Zielhöhe 561 — weil ihr Gemälde flach und breit gemalt ist.</p>
<div class="gitter">${ids.map(zelle).join("")}</div>`;

let html = HTML;
for (const id of ids) html = html.replaceAll(`src="P_${id}"`, `src="${b64("src/app/ui/assets/painted/painted-" + id + ".webp", "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/monster-auf-feld.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 2.5 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/monster-auf-feld.html"), { waitUntil: "load" });
await p.waitForTimeout(700);
await p.screenshot({ path: "/mnt/user-data/outputs/monster-auf-feld.png", fullPage: true });
await b.close();
console.log("Ungeheuer:", ids.length, "| gekappt:", ids.filter((id) => Math.abs(st(M[id]) - 1.10) < 1e-9).length);
