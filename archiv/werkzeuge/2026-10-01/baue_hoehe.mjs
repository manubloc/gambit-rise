/* Zwei Maßstäbe im Vergleich: heute der TELLER, rechts die FIGURENHOEHE.
   Entwurfswerkzeug, kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const M = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const ZIEL_RX = 136, ZIEL_HOEHE = 561, BODEN = 555;
/* ALT: der Teller bestimmt die Groesse, die Hoehe wird nachgestreckt (gekappt) */
const kAlt = (m) => Math.max(0.55, Math.min(1.35, ZIEL_RX / m.rx));
const stAlt = (m) => m.oben == null ? 1 : Math.max(0.92, Math.min(1.10, ZIEL_HOEHE / ((m.boden - m.oben) * kAlt(m))));
/* NEU: die FIGURENHOEHE bestimmt die Groesse - ein Faktor, keine Streckung.
   Der Teller dient nur noch zum Ausrichten (Mitte und Bodenlinie). */
const kNeu = (m) => m.oben == null ? 1 : ZIEL_HOEHE / (m.boden - m.oben);
const mitte = (m) => -((m.cx - m.W / 2) / m.W) * 100;
const aus = (m, ges) => Math.max(-9, Math.min(9, (((m.H - m.boden) * ges - (m.H - BODEN)) / m.H) * 100));

const ids = Object.keys(M).filter((id) => M[id] && M[id].rx && M[id].oben != null
  && fs.existsSync("src/app/ui/assets/painted/painted-" + id + ".webp"));
const WER = ["assassin", "warlock", "pawn", "knight", "queen", "rook", "king", "boss-b22", "boss-b02", "dragon", "gambit", "amazon"];

const zelle = (id, art) => { const m = M[id];
  const ges = art === "alt" ? kAlt(m) * stAlt(m) : kNeu(m);
  const sy = art === "alt" ? kAlt(m) * stAlt(m) : kNeu(m);
  const sx = art === "alt" ? kAlt(m) : kNeu(m);
  const h = Math.round((m.boden - m.oben) * sy);
  return `<div class="k">
    <div class="innen" style="transform:translate(${mitte(m).toFixed(2)}%, ${aus(m, ges).toFixed(2)}%) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})">
      <img src="P_${id}" alt=""></div>
    <div class="linie"></div>
    <div class="tag">×${sx.toFixed(2)} · H ${h}</div></div>`; };

const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:22px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 14px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.55 Georgia,serif;color:#9a927f;margin-bottom:14px;max-width:1100px}
h2{font:600 11px/1.3 Georgia,serif;letter-spacing:.12em;text-transform:uppercase;color:#c9b26a;margin:16px 0 7px}
.reihe{display:grid;grid-template-columns:repeat(12,1fr);gap:8px}
.k{position:relative;aspect-ratio:1/1;border-radius:9px;overflow:hidden;
  background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.9),rgba(10,7,19,.99));border:1px solid rgba(233,207,138,.2)}
.innen{position:absolute;inset:0;transform-origin:50% 100%}
.innen img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}
.linie{position:absolute;left:0;right:0;top:96.35%;height:1px;background:rgba(111,194,240,.5);z-index:5}
.tag{position:absolute;left:0;right:0;bottom:0;z-index:6;text-align:center;padding:2px;
  font:600 7.5px/1.2 Georgia,serif;color:#cbbf9a;background:rgba(6,4,12,.78)}
.nm{display:grid;grid-template-columns:repeat(12,1fr);gap:8px;margin-top:4px}
.nm span{font:700 8.5px/1.2 system-ui,sans-serif;text-align:center;word-break:break-all}
</style>
<h1>Der Maßstab: Teller gegen Figurenhöhe</h1>
<p class="u">Gemessen am heutigen Stand: die gezeigten Figurenhöhen streuen von <b>344</b> px (boss-b22) bis <b>561</b> (Dame) — 63 % Unterschied, weil der TELLER das Maß ist und die Streckung bei 1,10 gekappt wird. Der Attentäter hat mit rx 168 den breitesten Teller aller Figuren, bekommt dadurch den kleinsten Faktor 0,890 — und wirkt trotzdem groß, weil sein Körper schlank ist. Unten dieselben Figuren, wenn die FIGURENHÖHE das Maß ist: ein Faktor, keine Streckung, der Teller dient nur noch zum Ausrichten.</p>
<h2>Heute · Teller auf 136 px, Höhe nachgestreckt und gekappt</h2>
<div class="reihe">${WER.map((id) => zelle(id, "alt")).join("")}</div>
<div class="nm">${WER.map((id) => `<span>${id}</span>`).join("")}</div>
<h2>Neu · Figurenhöhe auf 561 px, Teller nur zum Ausrichten</h2>
<div class="reihe">${WER.map((id) => zelle(id, "neu")).join("")}</div>
<div class="nm">${WER.map((id) => `<span>${id}</span>`).join("")}</div>`;

let html = HTML;
for (const id of WER) html = html.replaceAll(`src="P_${id}"`, `src="${b64("src/app/ui/assets/painted/painted-" + id + ".webp", "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/massstab-teller-hoehe.html", html);
const hAlt = ids.map((id) => Math.round((M[id].boden - M[id].oben) * kAlt(M[id]) * stAlt(M[id])));
const hNeu = ids.map((id) => Math.round((M[id].boden - M[id].oben) * kNeu(M[id])));
const sp = (a) => `${Math.min(...a)} bis ${Math.max(...a)} (${Math.round((Math.max(...a) / Math.min(...a) - 1) * 100)} %)`;
console.log("Hoehen heute:", sp(hAlt), "| neu:", sp(hNeu));
const bAlt = ids.map((id) => Math.round(M[id].rx * 2 * kAlt(M[id])));
const bNeu = ids.map((id) => Math.round(M[id].rx * 2 * kNeu(M[id])));
console.log("Tellerbreiten heute:", sp(bAlt), "| neu:", sp(bNeu));
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1320, height: 560 }, deviceScaleFactor: 2.5 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/massstab-teller-hoehe.html"), { waitUntil: "load" });
await p.waitForTimeout(600);
await p.screenshot({ path: "/mnt/user-data/outputs/massstab-teller-hoehe.png", fullPage: true });
await b.close();
