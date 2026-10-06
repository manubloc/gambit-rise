/* ── DIE UEBERSICHT FOTOGRAFIEREN (v1.91.0) ────────────────────────────────────
   Baut tools/uebersicht-pruefstand.jsx (HofKachel, MoveDiagram, die echten
   Leitern, Werte und Fundorte) und legt je Bund, fuer die Grossmeister und die
   Bestien ein Bild ab.

     node tools/uebersicht-fotos.mjs [ordner] [--nur=bund:dorf,bosse:meister:1]

   Haengt nicht in der Kette - es ist das Werkzeug, mit dem der Besitzer nach
   einer Aenderung an Figuren, Bestien oder Buenden die ganze Sammlung auf
   einen Blick bekommt. Braucht Chromium (PW_CHROMIUM). */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
import { BUENDE } from "../src/content/buende.js";

const AUS = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "/tmp/gg-uebersicht";
const NUR = (process.argv.find((a) => a.startsWith("--nur=")) || "").slice(6).split(",").filter(Boolean);
const DIR = "/tmp/gg-uebersichtprobe";
await mkdir(DIR, { recursive: true }); await mkdir(AUS, { recursive: true });
execFileSync("npx", ["esbuild", "tools/uebersicht-pruefstand.jsx", "--bundle", "--jsx=automatic",
  `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
  "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl",
  "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`, `<!doctype html><meta charset="utf-8"><script src="app.js" defer></script>`);
const TYP = { ".js": "text/javascript", ".html": "text/html", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = createServer(async (req, res) => {
  const pfad = decodeURIComponent(req.url.split("?")[0]);
  for (const f of [DIR + (pfad === "/" ? "/index.html" : pfad), path.resolve("public") + pfad]) {
    try { const b = await readFile(f); res.writeHead(200, { "content-type": TYP[path.extname(f)] || "application/octet-stream" }); res.end(b); return; } catch {}
  }
  res.writeHead(404); res.end("");
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });

/* Reihenfolge: so, wie man die Figuren im Spiel bekommt - die fruehen Buende zuerst */
const BUND_FOLGE = ["geleit", "krone", "konzil", "dorf", "werkstatt", "kontor", "kueche", "kloster", "jagd", "faehrte", "nachtwache", "turnier",
  "schatten", "schildwacht", "finsternis", "gezeiten", "bannkreis", "sturm"].filter((id) => BUENDE[id]);
for (const id of Object.keys(BUENDE)) if (!BUND_FOLGE.includes(id)) BUND_FOLGE.push(id);
const LAGEN = [
  ...BUND_FOLGE.map((id, i) => [`bund=${id}`, `${String(i + 1).padStart(2, "0")}-bund-${id}`, `bund:${id}`]),
  ["bund=ohne", `${String(BUND_FOLGE.length + 1).padStart(2, "0")}-ohne-bund`, "bund:ohne"],
  ["bosse=meister&teil=1", "30-grossmeister-1", "bosse:meister:1"], ["bosse=meister&teil=2", "31-grossmeister-2", "bosse:meister:2"],
  ["bosse=bestien&teil=1", "40-bestien-1", "bosse:bestien:1"], ["bosse=bestien&teil=2", "41-bestien-2", "bosse:bestien:2"], ["bosse=bestien&teil=3", "42-bestien-3", "bosse:bestien:3"],
];
let fehler = 0;
for (const [abfrage, datei, kennung] of LAGEN) {
  if (NUR.length && !NUR.includes(kennung)) continue;
  const page = await browser.newPage({ viewport: { width: 1300, height: 4600 }, deviceScaleFactor: 2 });   /* hoch genug fuer das laengste Blatt:
     bei 1000 px Hoehe blieben die untersten Karten ohne Figur (gemessen 6.10.: Morwen, Thalor, Steinkoenig -
     Bilder weit unter dem Fenster blendet der Browser nicht ein) */
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?${abfrage}`, { waitUntil: "load" });
  await page.waitForSelector("#ziel", { timeout: 20000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((i) => (i.complete && i.naturalWidth ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(3600);   // artReady blendet Gemaelde bis zu 3 s ein
  const z = page.locator("#ziel");
  if ((await z.getAttribute("data-fertig")) !== "1" || errs.length) { fehler++; console.log("FEHLER", abfrage, await z.getAttribute("data-fehler"), errs.join(" | ")); }
  await z.screenshot({ path: `${AUS}/${datei}.png` });
  console.log("foto", datei);
  await page.close();
}
await browser.close(); srv.close();
if (fehler) { console.log(`${fehler} Foto(s) fehlgeschlagen`); process.exit(1); }
console.log(`fertig: ${AUS}`);
