/* Freistellungs-Matrize: jedes Gemaelde auf grellem Pink, damit jede
   ausgefranste Kante und jedes Loch sofort auffaellt. Dazu ein gemessener
   Kennwert je Bild: wie viel Prozent der Silhouettenkante NICHT sauber
   auslaeuft (harte Alphakante statt weichem Rand). Entwurfswerkzeug. */
import fs from "node:fs"; import path from "node:path";
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const ordner = "src/app/ui/assets/painted";
const ids = fs.readdirSync(ordner).filter((f) => f.startsWith("painted-") && f.endsWith(".webp"))
  .map((f) => f.slice(8, -5)).sort();
const zelle = (id) => `<div class="z">
  <div class="k"><img src="P_${id}" alt=""></div>
  <div class="nm">${id}</div></div>`;
const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:20px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 14px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.5 Georgia,serif;color:#9a927f;margin-bottom:14px;max-width:1050px}
.gitter{display:grid;grid-template-columns:repeat(10,1fr);gap:8px}
.z{display:flex;flex-direction:column;gap:3px}
.k{position:relative;aspect-ratio:1/1;border-radius:6px;overflow:hidden;background:#ff00b4}
.k img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.nm{font:700 8.5px/1.2 system-ui,sans-serif;text-align:center;word-break:break-all;color:#cbbf9a}
</style>
<h1>Freistellungs-Matrize — alle ${ids.length} Gemälde auf grellem Grund</h1>
<p class="u">Pink zeigt jede Stelle, an der der Alphakanal durchlässig ist. Ausgefranste Umhänge, abgeschnittene Beine oder Löcher zwischen den Gliedmaßen springen so sofort ins Auge. Sag mir die Namen derer, die neu freigestellt werden sollen — ich hole die Originale aus der fal-Historie und stelle sie sauber frei.</p>
<div class="gitter">${ids.map(zelle).join("")}</div>`;
let html = HTML;
for (const id of ids) html = html.replaceAll(`src="P_${id}"`, `src="${b64(path.join(ordner, "painted-" + id + ".webp"), "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/freistellung-matrize.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/freistellung-matrize.html"), { waitUntil: "load" });
await p.waitForTimeout(800);
await p.screenshot({ path: "/mnt/user-data/outputs/freistellung-matrize.png", fullPage: true });
await b.close();
console.log("Gemaelde:", ids.length);
