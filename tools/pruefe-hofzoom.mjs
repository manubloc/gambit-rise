/* ── DER ZOOM DES HOFSTAATS AM ECHTEN SCHIRM (v1.92.2) ────────────────────────
   Besitzer 6.10.2026: "die Elemente, die auf den Karten sind, sollten sich
   komplett gleich skalieren zu den Karten ... stufenlos reinzoomen ... das
   Padding springt ... das Reinspringen muss sich fluessiger anfuehlen ... man
   kann auch nicht mehr rauszoomen, das darf nicht sein."

     node tools/pruefe-hofzoom.mjs [fotoordner]

   Baut tools/hofstaat-pruefstand.jsx (der echte ArmyScreen, Reiter Verzeichnis)
   und fuehrt ECHTE Zwei-Finger-Gesten aus (CDP Input.dispatchTouchEvent):
     Z1  Abzeichen, Randabstand und Namenszeile behalten bei JEDEM Zoom ihr
         Verhaeltnis zur Karte (vorher dehnte `1fr` die Karte unabhaengig vom
         Inhalt: bei 2,2 stand Inhalt fuer 211 px in einer 370-px-Karte)
     Z2  stufenlos: die Karte waechst je Fingerschritt um wenige Pixel, nie sprunghaft
     Z3  beim Loslassen steht eine ganze Spaltenzahl, die Karten fuellen die Breite
     Z4  ueber die groesste Stufe hinaus oeffnet sich das Blatt der Karte
     Z5  zwei Finger zusammen schliessen das Blatt wieder - und verstellen dabei
         die Uebersicht nicht
     Z6  alle Karten einer Reihe sind gleich hoch, Grossmeister eingeschlossen
     Z7  der Wisch-Wink zeigt sich die ersten drei Male, dann nicht mehr */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";
const AUS = process.argv[2] || null; const DIR = "/tmp/gg-hofprobe"; await mkdir(DIR, { recursive: true }); if (AUS) await mkdir(AUS, { recursive: true });
execFileSync("npx", ["esbuild", "tools/hofstaat-pruefstand.jsx", "--bundle", "--jsx=automatic", `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl", "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl", "--loader:.woff2=dataurl", "--loader:.css=text", "--define:import.meta.env={}", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><script src="app.js" defer></script>`);
const srv = createServer(async (req, res) => { const p = decodeURIComponent(req.url.split("?")[0]);
  for (const f of [DIR + (p === "/" ? "/index.html" : p), path.resolve("public") + p]) { try { const b = await readFile(f); res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".html") ? "text/html" : "application/octet-stream" }); res.end(b); return; } catch {} }
  res.writeHead(404); res.end(""); });
await new Promise((r) => srv.listen(0, r));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
let pass = 0, fail = 0;
const ok = (name, gut) => { gut ? pass++ : fail++; console.log(`  ${gut ? "ok " : "not ok"} - ${name}`); };
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, serviceWorkers: "block" });
const page = await ctx.newPage(); const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 200)));
const laden = async () => { await page.goto(`http://127.0.0.1:${srv.address().port}/`); await page.waitForSelector("[data-hofkachel]", { timeout: 30000 }); await page.waitForTimeout(3800); };
await laden();
const cdp = await ctx.newCDPSession(page);
const tp = (pts) => pts.map(([x, y], i) => ({ x, y, id: i }));
const foto = async (n) => { if (AUS) await page.screenshot({ path: `${AUS}/${n}.png` }); };
const los = () => cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
const kneif = async (d0, d1, schritte = 14, halten = false, jeSchritt = null, cx = 195, cy = 400) => {
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: tp([[cx - d0 / 2, cy], [cx + d0 / 2, cy]]) });
  for (let i = 1; i <= schritte; i++) { const d = d0 + (d1 - d0) * i / schritte;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: tp([[cx - d / 2, cy], [cx + d / 2, cy]]) }); await page.waitForTimeout(30); if (jeSchritt) await jeSchritt(i); }
  if (!halten) await los();
};
const mass = () => page.evaluate(() => { const k = document.querySelector("[data-hofkachel]"); const r = k.getBoundingClientRect(); const a = k.querySelector("[data-stufenabzeichen]").getBoundingClientRect(); const n = k.querySelector(".gg-quill").getBoundingClientRect();
  const hof = document.querySelector("[data-hofuebersicht]"); const reihe = [...k.parentElement.children];
  return { sp: +hof.dataset.hofspalten, w: r.width, breite: hof.clientWidth, abz: a.width / r.width, rand: (r.right - a.right) / r.width, name: n.height / r.width,
    spalten: new Set(reihe.map((e) => Math.round(e.getBoundingClientRect().left))).size, blatt: !!document.querySelector("[data-blatt]"), wink: !!document.querySelector("[data-wischwink]") }; });
const ruhe = await mass(); await foto("1-ruhe");
ok(`Ruhe: ${ruhe.spalten} Spalten, die Karten fuellen die Breite (${(ruhe.w * ruhe.spalten + 7 * ruhe.w / 96 * (ruhe.spalten - 1)).toFixed(1)} von ${ruhe.breite} px)`,
  Number.isInteger(ruhe.sp) && Math.abs(ruhe.w * ruhe.spalten + 7 * ruhe.w / 96 * (ruhe.spalten - 1) - ruhe.breite) < 1.5);
const weg = []; await kneif(120, 250, 26, true, async () => weg.push(await mass())); await foto("2-mitten");
const abw = (f) => Math.max(...weg.map((m) => Math.abs(m[f] - ruhe[f])));
ok(`Z1 Abzeichen (${ruhe.abz.toFixed(3)} der Kartenbreite) und sein Randabstand (${ruhe.rand.toFixed(3)}) bleiben bei jedem Zoom gleich (groesste Abweichung ${abw("abz").toFixed(4)} / ${abw("rand").toFixed(4)})`, abw("abz") < 0.004 && abw("rand") < 0.012);
ok(`Z1 die Namenszeile waechst mit der Karte (Verhaeltnis ${ruhe.name.toFixed(3)}, groesste Abweichung ${abw("name").toFixed(4)})`, abw("name") < 0.015);
const schritte = weg.map((m, i) => m.w - (i ? weg[i - 1].w : ruhe.w));
ok(`Z2 stufenlos: ${weg.length} Fingerschritte von ${ruhe.w.toFixed(0)} auf ${weg[weg.length - 1].w.toFixed(0)} px, groesster Schritt ${Math.max(...schritte).toFixed(1)} px, keiner rueckwaerts`, Math.min(...schritte) > 0 && Math.max(...schritte) < 12 && weg[weg.length - 1].w > ruhe.w * 1.6);
await los(); await page.waitForTimeout(450); const nach = await mass(); await foto("3-losgelassen");
ok(`Z3 losgelassen: ${nach.sp} Spalten, die Karten fuellen die Breite (${(nach.w * nach.spalten + 7 * nach.w / 96 * (nach.spalten - 1)).toFixed(1)} von ${nach.breite} px)`,
  Number.isInteger(nach.sp) && nach.sp === nach.spalten && Math.abs(nach.w * nach.spalten + 7 * nach.w / 96 * (nach.spalten - 1) - nach.breite) < 1.5);
await kneif(250, 50, 18); await page.waitForTimeout(450); const klein = await mass(); await foto("4-klein");
ok(`ganz heraus: ${klein.sp} Spalten, Verhaeltnisse unveraendert`, klein.sp >= 5 && Number.isInteger(klein.sp) && Math.abs(klein.abz - ruhe.abz) < 0.004);
await kneif(40, 190, 20); await page.waitForTimeout(450); const eine = await mass(); await foto("5-eine-spalte");
ok(`ganz hinein: eine Spalte (${eine.w.toFixed(0)} px), noch kein Blatt`, eine.sp === 1 && !eine.blatt);
await kneif(100, 340, 16, true); await page.waitForTimeout(150); await foto("6-blatt-geht-auf"); await los(); await page.waitForTimeout(900);
const blatt = await mass(); await foto("7-blatt-mit-wink");
ok("Z4 ueber die groesste Stufe hinaus oeffnet sich das Blatt der Karte unter den Fingern", blatt.blatt);
ok("Z7 beim ersten Oeffnen wischt der Finger ueber das Blatt", blatt.wink);
await kneif(300, 240, 6, true); await foto("8-blatt-wird-kleiner");
const halb = await page.evaluate(() => { const e = document.querySelector("[data-blatt]"); return e ? +e.style.scale : null; });
await los(); await page.waitForTimeout(300);
ok(`Z5 zwei Finger zusammen: das Blatt wird kleiner (scale ${halb}), wer loslaesst, behaelt es`, halb != null && halb < 1 && halb >= 0.8 && (await mass()).blatt);
await kneif(300, 150, 10); await page.waitForTimeout(450); const zu = await mass();
ok(`Z5 weiter zusammen: das Blatt schliesst sich, die Uebersicht steht wie vorher (${zu.sp} Spalten)`, !zu.blatt && zu.sp === blatt.sp);
/* Z7: noch zweimal oeffnen, beim vierten Mal kein Wink mehr */
const winke = [];
for (let i = 0; i < 3; i++) { await page.evaluate(() => document.querySelector("[data-hofkachel]").click()); await page.waitForTimeout(400); winke.push((await mass()).wink);
  await page.evaluate(() => { const b = document.querySelector("[data-blatt]"); b && b.parentElement.click(); }); await page.waitForTimeout(300); }
ok(`Z7 der Wink kommt dreimal und dann nicht mehr (2., 3., 4. Oeffnen: ${winke.join(", ")})`, winke[0] && winke[1] && !winke[2]);
/* Z6: frisch geladen, drei Spalten - jede Reihe gleich hoch, Namen auf einer Linie */
await page.evaluate(() => localStorage.removeItem("gg:hofspalten")); await laden();
const z6 = await page.evaluate(() => { let schlimm = 0, wer = "", zier = 0, rang = document.querySelectorAll("[data-rang]").length;
  for (const g of document.querySelectorAll("[data-hofraster]")) { const reihen = {};
    for (const k of g.children) { const r = k.getBoundingClientRect(); const n = k.querySelector(".gg-quill"); if (k.querySelector("[data-zier]")) zier++;
      (reihen[Math.round(r.top)] = reihen[Math.round(r.top)] || []).push({ h: r.height, n: n ? n.getBoundingClientRect().top - r.top : 0, t: n ? n.textContent : "" }); }
    for (const z of Object.values(reihen)) for (const k of z) { const d = Math.max(Math.abs(k.h - z[0].h), Math.abs(k.n - z[0].n)); if (d > schlimm) { schlimm = d; wer = k.t; } } }
  return { schlimm, wer, zier, rang }; });
await page.evaluate(() => { const z = document.querySelector("[data-zier]"); z && z.parentElement.scrollIntoView({ block: "center" }); }); await page.waitForTimeout(3200); await foto("9-grossmeister");
ok(`Z6 alle Karten einer Reihe gleich hoch, Namen auf einer Linie (groesste Abweichung ${z6.schlimm.toFixed(2)} px${z6.schlimm > 0.6 ? " bei " + z6.wer : ""}); ${z6.zier} Grossmeister mit Zier, kein Wort mehr (${z6.rang})`, z6.schlimm <= 0.6 && z6.zier >= 5 && z6.rang === 0);
ok(`keine Seitenfehler (${errs.join(" | ") || "keine"})`, errs.length === 0);
await browser.close(); srv.close();
console.log(`\nRESULT pruefe-hofzoom: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
