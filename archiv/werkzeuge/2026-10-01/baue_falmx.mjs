/* Matrize der fal-Originale: alles, was in der Auftragshistorie liegt, auf
   grellem Grund mit laufender Nummer und - wo der Dateiname ihn verraet -
   dem Namenshinweis. Entwurfswerkzeug, nichts davon geht ins Repo. */
import fs from "node:fs"; import path from "node:path";
const ordner = "/tmp/fal";
const b64 = (p) => { const e = path.extname(p).slice(1).replace("jpg", "jpeg");
  return `data:image/${e};base64,${fs.readFileSync(p).toString("base64")}`; };
const dateien = fs.readdirSync(ordner).sort();
const hinweis = (f) => { const roh = f.replace(/^\d+_[\d-]+_/, "").replace(/\.[a-z]+$/, "");
  const m = roh.match(/(?:^|[_-])(?:carved-|ref-|r-)?((?:boss-)?[a-z]+(?:-[a-z0-9]+)*)$/);
  return m ? m[1].replace(/-light$/, "") : ""; };
const zelle = (f, i) => `<div class="z">
  <div class="k"><img src="${b64(path.join(ordner, f))}" alt=""></div>
  <div class="nr">${String(i).padStart(3, "0")}</div>
  <div class="nm">${hinweis(f) || "—"}</div></div>`;
const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:18px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 14px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.5 Georgia,serif;color:#9a927f;margin-bottom:12px;max-width:1050px}
.gitter{display:grid;grid-template-columns:repeat(10,1fr);gap:7px}
.z{display:flex;flex-direction:column;gap:2px}
.k{position:relative;aspect-ratio:1/1;border-radius:5px;overflow:hidden;background:#ff00b4}
.k img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.nr{font:800 10px/1.1 Georgia,serif;text-align:center;color:#e9cf8a}
.nm{font:600 7.5px/1.15 system-ui,sans-serif;text-align:center;color:#8d8776;word-break:break-all}
</style>
<h1>Die Originale aus der fal-Auftragshistorie — ${dateien.length} Bilder</h1>
<p class="u">Alles, was in der Historie liegt, auf grellem Grund: Pink zeigt, wo eine Datei bereits freigestellt ist (durchlässiger Alphakanal), voll gefüllte Kacheln sind Fassungen MIT Hintergrund — die eignen sich zum sauberen Neu-Freistellen. Unter jedem Bild die laufende Nummer, darunter der Namenshinweis aus dem Dateinamen, sofern er einen trägt. Nenn mir die Nummern und wozu sie gehören.</p>
<div class="gitter">${dateien.map((f, i) => zelle(f, i)).join("")}</div>`;
fs.writeFileSync("/mnt/user-data/outputs/fal-originale.html", HTML);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 1.8 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/fal-originale.html"), { waitUntil: "load" });
await p.waitForTimeout(1500);
await p.screenshot({ path: "/mnt/user-data/outputs/fal-originale.png", fullPage: true });
await b.close();
const mitNamen = dateien.filter((f) => hinweis(f)).length;
console.log("Bilder:", dateien.length, "| davon mit Namenshinweis:", mitNamen);
