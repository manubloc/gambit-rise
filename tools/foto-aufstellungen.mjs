/* ── FOTO DER AUFSTELLUNGEN (v1.90.15, Besitzerauftrag 30.9.2026) ─────────────
   Fotografiert jede Station aus der Aufstellungskammer (?aufstellung=<id>)
   so, wie sie beim ERSTEN Zug steht - mit dem echten Brett, dem
   Kapitelstreifen und dem Kapitelgemaelde. Genommen werden:
     - alle 44 Schluesselstationen (Boss-Stationen, darunter 12 Finale)
     - je Kapitel III-XII die am staerksten BESETZTE gewoehnliche Station,
       denn Monster auf freien Plaetzen gibt es NUR dort (an Boss- und
       Finalstationen ist die Besetzung absichtlich aus, besetzung.js)
   Braucht dist/ mit der App (npx vite build).

   AUFRUF:  node tools/foto-aufstellungen.mjs [zielordner]
   Die Tuer der Werkzeuge oeffnet ein sessionStorage-Schluessel - das ist
   eine Bequemlichkeitssperre der Oberflaeche, kein Schutz; hier lokal gesetzt. */
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { CAMPAIGN } from "../src/content/index.js";
import { buildStageMatch, defaultProfile, withProgressPct } from "../src/meta/index.js";

const ZIEL = process.argv[2] || "aufstellungen";
const WURZEL = "dist";
if (!existsSync(join(WURZEL, "index.html"))) { console.error("dist/ fehlt - erst npx vite build"); process.exit(1); }

/* Welche Stationen? */
const schluessel = CAMPAIGN.filter((n) => n.boss || n.final);
const besetzt = [];
for (let lg = 3; lg <= 12; lg++) {
  let beste = null;
  for (const n of CAMPAIGN) {
    if (n.league !== lg || n.boss || n.final || n.gate) continue;
    let m; try { m = buildStageMatch(n.id, withProgressPct(defaultProfile(), 50, lg)); } catch { continue; }
    const k = (m.besetzung?.eintraege || []).filter(Boolean).length;
    if (k && (!beste || k > beste.k)) beste = { n, k };
  }
  if (beste) besetzt.push(beste.n);
}
const alle = [...schluessel, ...besetzt].sort((a, b) => (a.league - b.league) || a.id.localeCompare(b.id));
console.log(`${schluessel.length} Schluesselstationen + ${besetzt.length} besetzte = ${alle.length} Fotos`);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp",
  ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".ico": "image/x-icon" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try { const f = join(WURZEL, p === "/" ? "index.html" : p.slice(1)); const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(b); }
  catch { const b = await readFile(join(WURZEL, "index.html")); res.writeHead(200, { "content-type": "text/html" }); res.end(b); }
});
await new Promise((r) => srv.listen(4391, r));

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 500, height: 760 }, deviceScaleFactor: 2, serviceWorkers: "block" });
await ctx.addInitScript(() => { try { sessionStorage.setItem("gg:werkzeug:offen", "1"); } catch {} });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e.message).slice(0, 160)));
await mkdir(ZIEL, { recursive: true });

const index = [];
for (const n of alle) {
  await page.goto(`http://localhost:4391/?aufstellung=${n.id}`, { waitUntil: "networkidle" });
  /* Bilder abwarten: das Brett ist erst fertig, wenn jedes Figurenbild geladen ist. */
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(900);
  const kopf = await page.evaluate(() => (document.querySelector("[data-aufstellung-kopf]")?.innerText || "").replace(/\n/g, " | "));
  const datei = `${n.id}.png`;
  await page.screenshot({ path: join(ZIEL, datei), fullPage: false });
  index.push({ id: n.id, liga: n.league, ort: n.place, final: !!n.final, boss: !!n.boss, kopf, datei });
  process.stdout.write(".");
}
await writeFile(join(ZIEL, "index.json"), JSON.stringify(index, null, 1));
await browser.close(); srv.close();
console.log(`\n${index.length} Fotos in ${ZIEL}/`);
if (fehler.length) { console.log(`SEITENFEHLER (${fehler.length}):`); [...new Set(fehler)].forEach((f) => console.log("  ", f)); process.exit(1); }
console.log("== KEINE SEITENFEHLER ==");
