/* ── JEDE FIGUR AUF DEM ECHTEN BRETT VERMESSEN (v1.90.16) ─────────────────────
   Besitzer, 30.9.2026, mit vier Bildschirmfotos aus der Aufstellungskammer:
   "diese Monster ... die sind doch viel zu gross ... du siehst es ja auch am
   Lebensband von diesen Monstern ... die Dame wieder nicht mittig ... das
   Staerke- und Lebensband bei der Koenigin nicht sauber ausgemittelt ... der
   Drache ist auch nicht sauber positioniert ... bei irgendeiner Figur das
   Band nicht sauber in der Hoehe."

   Diese Probe faehrt die Aufstellungskammer (?aufstellung=<Station>) fuer
   alle Schluesselstationen (45 seit v1.90.16 - die Brutmutter kam dazu) und misst an JEDER Figur im lebenden DOM:
     - Bandbreite (rohr-koerper) im Verhaeltnis zur Zelle,
     - Bandmitte gegen Zellmitte (px),
     - Bandunterkante gegen Zellunterkante (px),
     - Mitte des Sockelfusses (Bild) gegen Zellmitte.
   Jede Figur (am Bildnamen erkannt) wird gegen den MEDIAN der gewoehnlichen
   Figuren gehalten. Zusagen:
     Z1  kein Band ist breiter als das des breitesten gewoehnlichen
         Offiziers (+3 %) - Monster "viel zu gross"; der grosse Drache
         hoechstens doppelt so breit (er steht auf vier Feldern)
     Z2  jedes Band sitzt mittig (|Versatz| <= 2 px bei ~57-px-Zellen)
     Z4  die gemalte Figur steht auf ihrem Band: Fussmitte (Alphakanal,
         Canvas) gegen Bandmitte <= 2 px - die Dame stand bis v1.90.15 um
         ~6 px neben ihrem mittigen Band (Messtabelle veraltet, v1.90.8)
     Z3  jede Bandunterkante liegt auf der Linie ihrer Klasse (+-2 px):
         Bauern und Gambit auf der Bauernlinie, alle anderen auf der
         Offizierslinie - ausser dem grossen Drachen, fuer den gilt:
     Z5  (Besitzer, 30.9. 22:32) die Massenmitte seiner Silhouette liegt auf
         der Mitte seines 2x2-Blocks (+-1,5 px)

   Braucht dist/ mit der App (npx vite build). Aufruf:
     node tools/pruefe-figurenmass.mjs [--alle]   (--alle: jede Figur ausgeben) */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { CAMPAIGN } from "../src/content/index.js";

const WURZEL = process.env.WURZEL || "dist";   /* WURZEL=/tmp/rr/dist: gegen einen anderen Stand messen */
if (!existsSync(join(WURZEL, "index.html"))) { console.error("dist/ fehlt - erst npx vite build"); process.exit(1); }
const ALLE = process.argv.includes("--alle");
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".json": "application/json", ".woff2": "font/woff2", ".mp3": "audio/mpeg", ".webmanifest": "application/manifest+json" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  let b = null, f = join(WURZEL, p === "/" ? "index.html" : p.slice(1));
  try { b = await readFile(f); } catch { f = join(WURZEL, "index.html"); b = await readFile(f); }
  res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(b);
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 500, height: 760 }, deviceScaleFactor: 1, serviceWorkers: "block" });
await ctx.addInitScript(() => { try { sessionStorage.setItem("gg:werkzeug:offen", "1"); } catch {} });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e.message).slice(0, 140)));

/* Der FUSS der gemalten Figur, am Alphakanal gemessen (Canvas, gleiche
   Quelle): Mitte der untersten fuenf deckenden Zeilen als Anteil der
   Bildbreite. Damit sieht die Probe, was der Besitzer an der Dame sah - die
   Figur stand neben ihrem eigenen Band, obwohl das Band mittig sass. */
const FUSS = `(async () => {
  const cache = window.__fuss || (window.__fuss = {});
  for (const img of document.querySelectorAll("[data-aufstellung-brett] img")) {
    const src = img.currentSrc || img.src;
    if (cache[src] != null || !img.naturalWidth) continue;
    const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const g = c.getContext("2d"); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let unten = -1;
    for (let y = c.height - 1; y >= 0 && unten < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 60) { unten = y; break; }
    let l = Infinity, r = -Infinity;
    for (let y = Math.max(0, unten - 4); y <= unten; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 60) { l = Math.min(l, x); r = Math.max(r, x); }
    /* dazu die MASSENMITTE der Silhouette (senkrecht, Anteil der Bildhoehe) -
       fuer den grossen Drachen, dessen Regel seit dem 30.9. "mittig in den
       vier Feldern" lautet (Z5) */
    let summe = 0, anzahl = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 60) { summe += y; anzahl++; }
    cache[src] = { fuss: r >= l ? (l + r) / 2 / c.width : 0.5, masse: anzahl ? summe / anzahl / c.height : 0.5 };
  }
  return true;
})()`;

const MESSEN = `(() => {
  const brett = document.querySelector("[data-aufstellung-brett]");
  let grid = null, best = 0;
  for (const el of brett.querySelectorAll("div")) {
    const r = el.getBoundingClientRect();
    if (r.width < 200 || Math.abs(r.width - r.height) > 8 || el.children.length < 30) continue;
    if (r.width * r.height > best) { best = r.width * r.height; grid = el; }
  }
  const zw = grid.getBoundingClientRect().width / 8;
  const zellen = [...grid.children].filter((c) => { const w = c.getBoundingClientRect().width; return w > zw * 0.8 && w < zw * 1.2; });
  const aus = [];
  const name = (img) => { const m = (img.currentSrc || img.src).match(/painted-(.+)-[A-Za-z0-9_-]{8}\\.webp/); return m ? m[1] : "?"; };
  /* Das Band ist ein SVG im Bildraster des Gemaeldes (SockelBand.jsx); sein
     sichtbarer Koerper sind die Pfade ausserhalb von <defs>. */
  const bandRect = (wurzel) => {
    const svg = wurzel.querySelector('[data-gg="sockelband"]');
    if (!svg) return null;
    let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
    for (const el of svg.querySelectorAll("path, ellipse")) {
      if (el.closest("defs")) continue;
      const q = el.getBoundingClientRect(); if (q.width < 1) continue;
      l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom);
    }
    return r > l ? { left: l, top: t, right: r, bottom: b, width: r - l } : null;
  };
  for (const z of zellen) {
    const img = z.querySelector("img");
    if (!img) continue;
    const zr = z.getBoundingClientRect(), ir = img.getBoundingClientRect();
    const rr = bandRect(z);
    const fuss = ir.left + ir.width * ((window.__fuss || {})[img.currentSrc || img.src]?.fuss ?? 0.5);
    aus.push({ id: name(img), zelle: Math.round(zr.width * 10) / 10,
      fussZuBand: rr ? +(fuss - (rr.left + rr.width / 2)).toFixed(1) : null,
      bildMitte: +(ir.left + ir.width / 2 - (zr.left + zr.width / 2)).toFixed(1),
      bildBreite: +(ir.width / zr.width).toFixed(3), bildHoehe: +(ir.height / zr.height).toFixed(3),
      band: rr ? { breite: +(rr.width / zr.width).toFixed(3), mitte: +(rr.left + rr.width / 2 - (zr.left + zr.width / 2)).toFixed(1),
        unten: +(zr.bottom - rr.bottom).toFixed(1) } : null });
  }
  /* der grosse Drache sitzt nicht in einer Zelle, sondern im 2x2-Kasten ueber dem Raster */
  for (const k of grid.querySelectorAll(":scope > div")) {
    const r = k.getBoundingClientRect();
    if (r.width < zw * 1.6) continue;
    const img = k.querySelector("img"); if (!img) continue;
    const ir = img.getBoundingClientRect(); const rr = bandRect(k);
    const masse = (window.__fuss || {})[img.currentSrc || img.src]?.masse;
    aus.push({ id: "DRACHE-2x2:" + name(img), zelle: Math.round(r.width / 2 * 10) / 10, bildMitte: +(ir.left + ir.width / 2 - (r.left + r.width / 2)).toFixed(1),
      masseZuBlock: masse != null ? +(ir.top + ir.height * masse - (r.top + r.height / 2)).toFixed(1) : null,
      bildBreite: +(ir.width / (r.width / 2)).toFixed(3), bildHoehe: +(ir.height / (r.height / 2)).toFixed(3),
      band: rr ? { breite: +(rr.width / (r.width / 2)).toFixed(3), mitte: +(rr.left + rr.width / 2 - (r.left + r.width / 2)).toFixed(1), unten: +(r.bottom - rr.bottom).toFixed(1) } : null });
  }
  return aus;
})()`;

const NUR = (process.argv.find((a) => a.startsWith("--nur=")) || "").slice(6).split(",").filter(Boolean);
const stationen = CAMPAIGN.filter((n) => n.boss || n.final).map((n) => n.id).filter((id) => !NUR.length || NUR.includes(id));
const jeFigur = {};
for (const id of stationen) {
  await page.goto(`http://127.0.0.1:${port}/?aufstellung=${id}`, { waitUntil: "load" });
  await page.waitForSelector("[data-aufstellung-brett] img", { timeout: 15000 });
  await page.waitForTimeout(1600);   // Sockelmessung im Canvas + artReady
  await page.evaluate(FUSS);
  const liste = await page.evaluate(MESSEN);
  for (const e of liste) (jeFigur[e.id] ||= []).push({ ...e, station: id });
}
await browser.close(); srv.close();

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
/* Zwei Klassen mit eigenem Mass, beides gewollt: BAUERN (und der Gambit, der
   ein Bauer ist) stehen kleiner (BoardView: 1,17 statt 1,37 em). Alle anderen
   werden gegen die gewoehnlichen OFFIZIERE gehalten. */
const BAUERN = (id) => /^pawn|^gambit/.test(id);
const OFFIZIERE = ["rook", "knight", "bishop", "queen", "king"];
const off = Object.entries(jeFigur).filter(([k]) => OFFIZIERE.includes(k)).flatMap(([, v]) => v).filter((e) => e.band);
const bau = Object.entries(jeFigur).filter(([k]) => BAUERN(k)).flatMap(([, v]) => v).filter((e) => e.band);
const offMax = Math.max(...OFFIZIERE.map((k) => median((jeFigur[k] || []).filter((e) => e.band).map((e) => e.band.breite))).filter((x) => x > 0));
const offUnten = median(off.map((e) => e.band.unten)), bauUnten = median(bau.map((e) => e.band.unten));
console.log(`Offiziere: breitestes Band ${offMax.toFixed(3)} x Zelle, Unterkante ${offUnten} px ueber dem Zellrand`);
console.log(`Bauern:    Unterkante ${bauUnten} px (${(bauUnten - offUnten).toFixed(1)} px hoeher als die Offiziere - eigene Klasse)\n`);
let bruch = 0;
const zeile = (id, v) => {
  const b = v.filter((e) => e.band);
  const breite = median(b.map((e) => e.band.breite)), mitte = median(b.map((e) => e.band.mitte)), unten = median(b.map((e) => e.band.unten));
  const bild = median(v.map((e) => e.bildMitte)), hoehe = median(v.map((e) => e.bildHoehe));
  const gross = id.startsWith("DRACHE-2x2");
  const grenze = gross ? offMax * 2 : offMax * 1.03;
  const linie = BAUERN(id) ? bauUnten : offUnten;
  const fzb = median(v.filter((e) => e.fussZuBand != null).map((e) => e.fussZuBand));
  /* Z5 (Besitzer, 30.9. 22:32): der grosse Drache "ein bisschen weiter nach
     oben ..., dass er mehr in der Mitte von den vier Feldern steht". Fuer ihn
     gilt darum nicht die Offizierslinie (Z3), sondern: die Massenmitte seiner
     Silhouette liegt auf der Blockmitte (+-1,5 px). Gemessen stand sie 4,7 px
     darunter, obwohl sein Umriss oben wie unten 5,7 px Luft hatte - Fluegel
     und Hals sind leicht, der Leib sitzt tief. */
  const masse = median(v.filter((e) => e.masseZuBlock != null).map((e) => e.masseZuBlock));
  const z1 = !b.length || breite <= grenze, z2 = !b.length || Math.abs(mitte) <= 2;
  const z3 = gross || !b.length || Math.abs(unten - linie) <= 2;
  const z5 = !gross || (!Number.isNaN(masse) && Math.abs(masse) <= 1.5);
  const z4 = gross || Number.isNaN(fzb) || Math.abs(fzb) <= 2;
  const gut = z1 && z2 && z3 && z4 && z5;
  if (!gut) bruch++;
  if (!gut || ALLE) console.log(`${gut ? "  ok  " : " FAIL "} ${id.padEnd(20)} n=${String(v.length).padStart(3)}  Band ${b.length ? breite.toFixed(3) : "  -  "} (${b.length ? (breite / offMax * 100).toFixed(0) + "% des breitesten Offiziers" : "-"})  Bandmitte ${b.length ? mitte.toFixed(1) : "-"} px  Unterkante ${b.length ? unten.toFixed(1) : "-"} px  Fuss-Band ${Number.isNaN(fzb) ? "-" : fzb.toFixed(1)} px  Bildhoehe ${hoehe.toFixed(2)}${gross ? `  Masse-Block ${Number.isNaN(masse) ? "-" : masse.toFixed(1)} px` : ""}${!z5 ? "  <- nicht mittig in seinen vier Feldern" : ""}${!z1 ? "  <- zu breit" : ""}${!z2 ? "  <- nicht mittig" : ""}${!z3 ? "  <- Hoehe" : ""}${!z4 ? "  <- Figur neben ihrem Band" : ""}  [${v[0].station}]`);
};
for (const [id, v] of Object.entries(jeFigur).sort()) zeile(id, v);
if (fehler.length) { console.log("Seitenfehler:", fehler.slice(0, 3)); bruch++; }
console.log(`\npruefe-figurenmass: ${Object.keys(jeFigur).length} Figurenarten, ${bruch} ausserhalb des Masses`);
process.exit(bruch ? 1 : 0);
