/* Prueflblatt: die gemessene obere Tellerkante in JEDES Gemaelde gezeichnet,
   damit man sieht, ob die Messung stimmt - bevor irgendetwas ins Spiel geht.
   Gruen = untere Ellipse (aus sockelband.json, seit je), Rot = neu gemessene
   obere Kante. Kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const MASS = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const NEU = JSON.parse(fs.readFileSync("/tmp/tellerkante.json", "utf8"));
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const bogen = (m, hoch) => { const p = [];
  for (let i = 0; i <= 40; i++) { const t = Math.PI + Math.PI * (i / 40);
    p.push(`${(m.cx + m.rx * Math.cos(t)).toFixed(1)} ${((m.boden - m.ry) - m.ry * Math.sin(t) - hoch).toFixed(1)}`); }
  return "M" + p.join(" L"); };
const linien = (id) => { const m = MASS[id], n = NEU[id]; if (!m || !n) return "";
  return `<svg viewBox="0 0 ${m.W} ${m.H}" preserveAspectRatio="xMidYMax meet" style="position:absolute;inset:0;width:100%;height:100%;z-index:3">
    <path d="${bogen(m, 0)}" fill="none" stroke="#5ad4b0" stroke-width="3" opacity=".95"/>
    <path d="${bogen(m, n.tellerhoehe)}" fill="none" stroke="#ff5a4a" stroke-width="3" opacity=".95"/>
    <path d="${bogen(m, m.ring || 0)}" fill="none" stroke="#6fc2f0" stroke-width="2" stroke-dasharray="7 6" opacity=".8"/></svg>`; };

const ids = ["boss-b02","boss-b08","boss-b09","boss-b20","boss-b21","gambit-t2","gambit-t3"];
const zelle = (id) => { const m = MASS[id], n = NEU[id];
  const weit = Math.abs(n.tellerhoehe - (n.ring_alt || 0)) > 14;
  /* auf den Teller gezoomt: nur das untere Viertel des Bildes, dafuer gross -
     bei Briefmarkengroesse kann man die Kante nicht beurteilen. */
  const zoom = 4.6, yv = (m.boden - m.H * 0.055) / m.H * 100;
  return `<div class="z">
    <div class="k"><div class="lupe" style="transform:scale(${zoom});transform-origin:50% ${yv.toFixed(1)}%">
      ${linien(id)}<img src="P_${id}" alt=""></div></div>
    <div class="nm">${id}</div>
    <div class="za ${weit ? "weit" : ""}">neu <b>${n.tellerhoehe}</b> · alt ${n.ring_alt} · Güte ${n.guete}</div>
  </div>`; };

const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:22px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 15px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.55 Georgia,serif;color:#9a927f;margin-bottom:16px;max-width:1150px}
.leg{display:flex;gap:18px;margin-bottom:16px;font:600 10.5px/1 Georgia,serif;letter-spacing:.05em}
.leg span{display:inline-flex;align-items:center;gap:7px;color:#cbbf9a}
.leg i{width:26px;height:3px;display:block;border-radius:2px}
.gitter{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.z{display:flex;flex-direction:column;gap:4px}
.k{position:relative;aspect-ratio:1/1;border-radius:10px;overflow:hidden;
  background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.9),rgba(10,7,19,.99));border:1px solid rgba(233,207,138,.2)}
.k img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}
.lupe{position:absolute;inset:0}
.nm{font:700 10px/1.2 system-ui,sans-serif;text-align:center;word-break:break-all}
.za{font:400 8.5px/1.3 Georgia,serif;color:#8d8776;text-align:center}
.za.weit{color:#ff8a80}
</style>
<h1>Die sieben Ausreißer, 4,6-fach</h1>
<p class="u">Nichts davon ist im Spiel. Das hier ist nur die Messung, sichtbar gemacht: passt die rote Linie auf die obere Kante des Tellers, stimmt sie. Läuft sie über einen Saum, einen Mantel oder eine Stufe, hat sich der Kantenfinder verlaufen — die betreffende Figur bekommt dann eine Handkorrektur, statt dass ich die Regel nochmal rate. Rot markiert sind die Zahlen, die stark vom alten Wert abweichen; dort lohnt der genaue Blick zuerst.</p>
<div class="leg">
  <span><i style="background:#5ad4b0"></i>untere Ellipse, seit je gemessen</span>
  <span><i style="background:#ff5a4a"></i>neu gemessene obere Kante</span>
  <span><i style="background:#6fc2f0"></i>alter Wert „ring" — 29× nur der Notnagel 8</span>
</div>
<div class="gitter">${ids.map(zelle).join("")}</div>`;

let html = HTML;
for (const id of ids) html = html.replaceAll(`src="P_${id}"`, `src="${b64("src/app/ui/assets/painted/painted-" + id + ".webp", "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/pruefblatt-sieben.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/pruefblatt-sieben.html"), { waitUntil: "load" });
await p.waitForTimeout(900);
await p.screenshot({ path: "/mnt/user-data/outputs/pruefblatt-sieben.png", fullPage: true });
await b.close();
const w = ids.filter((i) => Math.abs(NEU[i].tellerhoehe - (NEU[i].ring_alt || 0)) > 14);
console.log("stark abweichend:", w.length, "->", w.join(", "));
