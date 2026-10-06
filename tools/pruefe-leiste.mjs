/* ── DIE KAMPFLEISTE AM ECHTEN BAUTEIL GEMESSEN (v1.90.34) ────────────────────
   Besitzer am Handy, 5.10.2026: "sehr unvorteilhaft, wenn der Name der
   Faehigkeit nicht ganz drauf passt auf die Kachel" (STOSSSCHLAG stand als
   STOSSSCHLA) und "unschoen, wenn die Erklaertexte unterschiedlich lang sind
   und entsprechend das ganze Menue nach unten wandert. Das Menue sollte, egal
   wie lang die Erklaertexte sind, immer auf gleicher Hoehe sein."

     node tools/pruefe-leiste.mjs

   Baut tools/leiste-pruefstand.jsx (ein Bauer mit ALLEN Faehigkeiten) und
   misst in drei Handybreiten, deutsch und englisch:
     L1  kein Kachelname ist breiter als sein Kasten (scrollWidth <= clientWidth)
         und keiner hoeher als zwei Zeilen
     L2  die Kartenreihe steht bei JEDER geoeffneten Faehigkeit auf derselben
         Hoehe wie ohne (|dy| <= 0,5 px)
     L3  kein Erklaertext ist im festen Fenster abgeschnitten */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const DIR = "/tmp/gg-leisteprobe";
await mkdir(DIR, { recursive: true });
execFileSync("npx", ["esbuild", "tools/leiste-pruefstand.jsx", "--bundle", "--jsx=automatic",
  `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
  "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl",
  "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`, `<!doctype html><meta charset="utf-8"><script src="app.js" defer></script>`);
const srv = createServer(async (req, res) => {
  const pfad = decodeURIComponent(req.url.split("?")[0]);
  for (const f of [DIR + (pfad === "/" ? "/index.html" : pfad), path.resolve("public") + pfad]) {
    try { const b = await readFile(f); res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : "application/octet-stream" }); res.end(b); return; } catch {}
  }
  res.writeHead(404); res.end("");
});
await new Promise((r) => srv.listen(0, r));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
let pass = 0, fail = 0;
const ok = (name, gut) => { gut ? pass++ : fail++; console.log(`  ${gut ? "ok " : "not ok"} - ${name}`); };

/* v1.92.1: die Leiste hat zwei Bauarten (KampfLeiste.jsx) - "flach" fuer Geraete,
   denen die Hoehe knapp ist: dort legt sich die Erklaerung UEBER die Karten
   (schmal) oder steht rechts daneben (breit, hier 820 px). Beide werden wie die
   hohe gemessen, dazu L4: die Leiste ist in jeder Lage genau so hoch wie ohne
   offene Karte. */
for (const [raum, breite] of [["hoch", 360], ["hoch", 390], ["hoch", 430], ["flach", 360], ["flach", 390], ["flach", 820]]) for (const en of [0, 1]) {
  const page = await browser.newPage({ viewport: { width: breite, height: 500 } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
  await page.goto(`http://127.0.0.1:${srv.address().port}/?en=${en}&raum=${raum}&breit=${breite >= 640 ? 1 : 0}`, { waitUntil: "load" });
  await page.waitForSelector("#ziel button", { timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
  const lage = `${raum} ${breite}px ${en ? "en" : "de"}`;
  const leisteH = () => page.evaluate(() => document.querySelector("[data-kampfleiste]").getBoundingClientRect().height);
  const hoehe0 = await leisteH(); let hoeheDy = 0;
  const namen = await page.evaluate(() => [...document.querySelectorAll("[data-kachel-name]")].map((e) => {
    const r = document.createRange(); r.selectNodeContents(e); const zeilen = new Set([...r.getClientRects()].map((q) => Math.round(q.top))).size;
    return { t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth, sh: e.scrollHeight, ch: e.clientHeight, zeilen };
  }));
  const eng = namen.filter((n) => n.sw > n.cw || n.sh > n.ch + 0.5 || n.zeilen > 2).map((n) => n.t);
  ok(`L1 ${lage}: alle ${namen.length} Kachelnamen passen (zu eng: ${eng.join(", ") || "keiner"})`, namen.length > 20 && eng.length === 0);
  const reiheOben = () => page.evaluate(() => document.querySelector("#ziel button").getBoundingClientRect().top);
  const ruhe = await reiheOben(); let maxDy = 0, schlimm = "", abgeschnitten = [];
  const n = await page.locator("#ziel button").count();
  for (let k = 0; k < n; k++) {
    await page.evaluate((k) => { const b = document.querySelectorAll("#ziel button")[k]; b.scrollIntoView({ inline: "center", block: "nearest" }); b.click(); }, k);
    await page.waitForTimeout(30);
    const m = await page.evaluate(() => {
      const t = document.querySelector("[data-talent-text]"), f = document.querySelector("[data-talent-fenster]");
      const text = t && t.lastElementChild;
      return { oben: document.querySelector("#ziel button").getBoundingClientRect().top,
        knapp: t ? t.getBoundingClientRect().top < f.getBoundingClientRect().top - 0.5 : false,
        gekappt: text ? text.scrollHeight > text.clientHeight + 0.5 : false, name: t ? t.textContent.slice(0, 24) : "" };
    });
    const dy = Math.abs(m.oben - ruhe); if (dy > maxDy) { maxDy = dy; schlimm = m.name; }
    hoeheDy = Math.max(hoeheDy, Math.abs((await leisteH()) - hoehe0));
    if (m.knapp || m.gekappt) abgeschnitten.push(m.name);
  }
  ok(`L2 ${lage}: die Kartenreihe bleibt bei jeder der ${n} Karten stehen (groesste Abweichung ${maxDy.toFixed(1)} px${maxDy > 0.5 ? " bei " + schlimm : ""})`, maxDy <= 0.5);
  ok(`L3 ${lage}: kein Erklaertext abgeschnitten (${abgeschnitten.join(" | ") || "keiner"})`, abgeschnitten.length === 0);
  ok(`L4 ${lage}: die Leiste bleibt ${hoehe0} px hoch (groesste Abweichung ${hoeheDy.toFixed(1)} px)`, hoeheDy <= 0.5 && hoehe0 === (raum === "flach" ? 108 : 246));
  ok(`${lage}: keine Seitenfehler (${errs.join(" | ") || "keine"})`, errs.length === 0);
  if (breite === 390 && !en && raum === "hoch") { await page.evaluate(() => { const b = document.querySelectorAll("#ziel button"); b[0].scrollIntoView({ inline: "start" }); b[1].click(); }); await page.waitForTimeout(60); await page.screenshot({ path: `${DIR}/leiste.png` }); }
  await page.close();
}
await browser.close(); srv.close();
console.log(`\nRESULT pruefe-leiste: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
