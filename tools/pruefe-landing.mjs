/* ── DIE STARTSEITE, GEMESSEN (v1.90.15) ───────────────────────────────────────
   Besitzer, 30.9.2026: "Auch auf der Landingpage habe ich jetzt wieder
   gesehen, das ist immer noch nicht perfekt ... von den Positionen der
   Figuren."

   Vier Zusagen, die diese Probe haelt (ohne RESULT-Zeile wie
   pruefe-bezeichner - sie bricht die Kette, wenn eine faellt):

   1. Jede Datei, die landing.html unter /landing/ anspricht, gibt es.
   2. Jede Datei in public/landing/ wird auch angesprochen. 19 Bilder
      (850 KB) lagen verwaist herum und zogen bei jedem Bau mit an die Wurzel.
   3. Die Galerie-Bilder tragen ihren Sockel in der Bildmitte (+-1,5 %) -
      gemessen am Alphakanal von tools/landing_bilder.py (python3 + Pillow,
      wie test_zauber). Vorher standen Kapitaen und Schatten bis zu 11 px neben
      der Kartenmitte.
   4. Die VORDERE Figurenreihe des ersten Schirms passt in jedes Fenster. Bei
      600x900 ragten beide Tuerme je 69 px hinaus, bei 768x1024 je 36 px. Die
      hintere Reihe darf auf dem Handy ueberstehen - Kanzler und Kapitaen
      "noch weiter raus" war ein ausdruecklicher Besitzerwunsch (v1.89.3).

   Aufruf: node tools/pruefe-landing.mjs */
import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright-core";

const WURZEL = "public";
const html = await readFile(join(WURZEL, "landing.html"), "utf8");
let fehler = 0;
const ok = (n, c, info = "") => { console.log(c ? "  ok  -" : " FAIL -", n, c ? "" : info); if (!c) fehler++; };

/* 1 + 2: angesprochen <-> vorhanden */
const genannt = new Set([...html.matchAll(/\/landing\/([A-Za-z0-9_.-]+)/g)].map((m) => m[1]));
const da = new Set((await readdir(join(WURZEL, "landing"))).filter((f) => !f.startsWith(".")));
const fehlt = [...genannt].filter((f) => !da.has(f));
const verwaist = [...da].filter((f) => !genannt.has(f));
ok(`alle ${genannt.size} angesprochenen Bilder gibt es`, fehlt.length === 0, fehlt.join(", "));
ok(`keine verwaisten Bilder in public/landing/ (${da.size} Dateien)`, verwaist.length === 0, verwaist.join(", "));

/* 3: Galerie-Sockel in der Bildmitte */
try {
  const aus = execFileSync("python3", ["tools/landing_bilder.py", "galerie-pruefen"], { encoding: "utf8" });
  const n = (aus.match(/mittig/g) || []).length;
  ok(`Galerie: ${n} Sockel in der Bildmitte`, n >= 12);
} catch (e) {
  ok("Galerie: Sockel in der Bildmitte", false, String(e.stdout || e.message).trim().split("\n").pop()
    + (/No module named|not found|ENOENT/.test(String(e.stderr || e.message)) ? "  (python3 mit Pillow fehlt: python3 -m pip install pillow)" : ""));
}

/* 4: die vordere Reihe passt ins Fenster */
const MIME = { ".html": "text/html", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".css": "text/css", ".js": "text/javascript" };
const srv = createServer(async (req, res) => {
  let p = req.url.split("?")[0]; if (p === "/") p = "/landing.html";
  let buf = null; try { buf = await readFile(join(WURZEL, p.slice(1))); } catch {}
  if (buf) { res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" }); res.end(buf); }
  else { res.writeHead(404); res.end(); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
for (const [w, h] of [[360, 780], [390, 844], [430, 932], [600, 900], [700, 1000], [768, 1024], [820, 1180], [900, 1200], [1024, 768], [1024, 1366], [1280, 800], [1440, 900], [1920, 1080]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "load" });
  const m = await page.evaluate(() => {
    const vorn = [...document.querySelectorAll(".hofreihe:not(.hinten) img")].filter((i) => getComputedStyle(i).display !== "none")
      .map((i) => i.getBoundingClientRect()).filter((r) => r.width > 0);
    return { n: vorn.length, links: Math.min(...vorn.map((r) => r.left)), rechts: Math.max(...vorn.map((r) => r.right)) };
  });
  ok(`${w}x${h}: die vordere Reihe (${m.n} Figuren) passt ins Fenster (${Math.round(m.links)} bis ${Math.round(m.rechts)} px)`,
    m.n >= 5 && m.links >= -1 && m.rechts <= w + 1);
  await page.close();
}
await browser.close(); srv.close();
if (fehler) { console.error(`\npruefe-landing: ${fehler} Zusage(n) gebrochen`); process.exit(1); }
console.log("\npruefe-landing: alle Zusagen gehalten");
