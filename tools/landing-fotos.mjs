/* ── DIE BILDER DER STARTSEITE, AUS DEM ECHTEN SPIEL (v1.90.25) ───────────────
   Baut tools/landing-pruefstand.jsx (SockelBand, HofKachel, MoveDiagram und
   BoardView - dieselben Bauteile wie das Spiel) und fotografiert daraus alles,
   was die Startseite an Figuren, Karten und Brettern zeigt. Danach schneidet
   tools/landing_bilder.py zu (Aufgabe "fotos").

     node tools/landing-fotos.mjs [figuren|karten|zugbilder|bretter|alles] [--roh=<ordner>]

   WARUM: Besitzer 3.10.2026 - "wir killen den grauen Sockel ... ueberall das
   Band in schwarz ... und [die Bretter] genau so, wie es im Spiel aussieht.
   Das ist mir sehr wichtig." Vorher kamen die Figuren roh aus painted/ (grauer
   gemalter Teller, kein Band) und die Bretter aus einer Montage, in der jede
   Figur im selben 228-px-Kasten stand. Wer BoardView, PieceGlyph, SockelBand
   oder ein Gemaelde aendert, das die Startseite zeigt: dieses Skript neu
   laufen lassen, sonst zeigt die Startseite ein anderes Spiel.

   Braucht python3 mit Pillow (wie test_zauber) und Chromium (PW_CHROMIUM). */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const WAS = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "alles";
const ROH = (process.argv.find((a) => a.startsWith("--roh=")) || "--roh=/tmp/gg-landing").slice(6);
const DIR = "/tmp/gg-landingprobe";
await mkdir(DIR, { recursive: true }); await mkdir(ROH, { recursive: true });
execFileSync("npx", ["esbuild", "tools/landing-pruefstand.jsx", "--bundle", "--jsx=automatic",
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

let fehler = 0;
async function foto(abfrage, datei, { dpr = 1, durchsichtig = false, breite = 700, hoehe = 900 } = {}) {
  const page = await browser.newPage({ viewport: { width: breite, height: hoehe }, deviceScaleFactor: dpr });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?${abfrage}`, { waitUntil: "load" });
  await page.waitForSelector("#ziel", { timeout: 20000 });
  /* Bilder und Schriften muessen stehen, bevor fotografiert wird */
  await page.evaluate(async () => {
    await document.fonts.ready;
    const bilder = [...document.images];
    await Promise.all(bilder.map((i) => (i.complete && i.naturalWidth ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  await page.waitForTimeout(durchsichtig ? 250 : 3600);   // artReady blendet Gemaelde bis zu 3 s ein
  const z = page.locator("#ziel");
  const fertig = await z.getAttribute("data-fertig");
  const info = { reihe: await z.getAttribute("data-reihe"), regeln: await z.getAttribute("data-regeln") };
  if (fertig !== "1" || errs.length) { fehler++; console.log("FEHLER", abfrage, await z.getAttribute("data-fehler"), errs.join(" | ")); }
  await z.screenshot({ path: `${ROH}/${datei}`, omitBackground: durchsichtig });
  console.log("foto", datei, info.regeln ? `(${info.regeln}; Grundreihe ${info.reihe})` : "");
  await page.close();
}

/* ── WAS DIE STARTSEITE ZEIGT ───────────────────────────────────────────────
   Erste Reihe und die beiden Reihen dahinter (held-*): Gemaelde mit Band. */
const FIGUREN = ["pawn", "rook", "bishop", "knight", "queen", "king",
  "paladin", "guardian", "archbishop", "amazon", "captain", "chancellor", "mage", "hawk",
  /* v1.93.2 (Besitzer 7.10.: "mehr Figuren in dem Hintergrundbild am Anfang"):
     die dritte Reihe des ersten Schirms - Figuren aus dem Umbau v1.91.0. Der
     Waechter (boss-b01) ist mit der Galerie gegangen. */
  "smith", "jester", "huntress", "monk", "samurai", "sorceress", "cavalier", "fencer", "farmwife", "executioner", "cook", "healer"];
/* Die Karten "Neue Figuren, neue Zuege" und die Springerkarte: jede zeigt die
   GRUNDGANGART (dritter Eintrag = gelernte Talente, hier leer). Was die
   Faehigkeiten des Springers hinzugeben, zeigen die vier Zugbilder daneben -
   in denselben Farben, darum bleibt die Karte beim L. */
const KARTEN = [["captain", "auf-kapitaen", ""], ["chancellor", "auf-kanzler", ""], ["amazon", "auf-amazone", ""],
  ["dragon", "auf-drache", ""], ["knight", "auf-springer6", ""]];
/* Die vier Zugbilder daneben: Art der Figur und die Faehigkeit */
const ZUGBILDER = [["N", "knight_longleap"], ["N", "knight_outrider"], ["R", "rook_diag_step"], ["K", "king_dash"]];
/* Die Bretter. Jede Zugfolge wird gegen den Kern gespielt (legalMovesFrom,
   applyMove) - ein Zug, den es nicht gibt, bricht das Foto ab. */
const BRETTER = JSON.parse(await readFile("tools/landing-bretter.json", "utf8"));

if (WAS === "figuren" || WAS === "alles")
  for (const f of FIGUREN) await foto(`figur=${f}`, `figur-${f}.png`, { durchsichtig: true });
if (WAS === "karten" || WAS === "alles")
  for (const [id, datei, gelernt] of KARTEN) await foto(`karte=${id}&gelernt=${gelernt}`, `${datei}.png`, { dpr: 3 });
if (WAS === "zugbilder" || WAS === "alles")
  for (const [art, ab] of ZUGBILDER) await foto(`zug=${art}&extra=${ab}`, `zug-${ab}.png`, { dpr: 2 });
if (WAS === "bretter" || WAS === "alles")
  for (const [datei, b] of Object.entries(BRETTER))
    await foto(`brett=${b.station}&zuege=${(b.zuege || []).join(",")}&heer=${(b.heer || []).join(",")}&stand=${b.stand ?? 50}&breite=560`, `${datei}.png`, { dpr: 2, breite: 640, hoehe: 760 });
await browser.close(); srv.close();
if (fehler) { console.log(`${fehler} Foto(s) fehlgeschlagen`); process.exit(1); }
if (!process.argv.includes("--nur-fotos"))
  execFileSync("python3", ["tools/landing_bilder.py", "fotos", ROH, WAS], { stdio: "inherit" });
