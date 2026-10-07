/* ── BLEIBT DAS BRETT STEHEN? (v1.92.1) ───────────────────────────────────────
   Besitzer 6.10.2026, mit zwei Fotos: "In dem Moment, wo ich eine Figur
   ausgewaehlt habe, wird das Schachbrett kleiner. Das darf nicht passieren ...
   das Schachbrett muss immer komplett statisch in der Groesse bleiben ... teste
   wirklich auch das komplette Spiel einmal so durch."

     node tools/pruefe-brettruhe.mjs [--nur=schach,hp] [--fotos=<ordner>]

   Baut tools/brettruhe-pruefstand.jsx (der ECHTE GameScreen) und faehrt in
   jeder Spielart und in neun Schirmgroessen (vier Fenster nebeneinander, ~4 min): jede eigene Figur antippen, jede
   Karte der Kampfleiste oeffnen, Zuege spielen und die Antwort abwarten, die
   Kroenungswahl oeffnen, aufgeben bis zum Banner. Nach JEDEM Schritt wird das
   Brett am lebenden DOM gemessen (die Huelle aller [data-zelle]).
     B1  das Brett ist nach jedem Schritt so gross und steht dort, wo es am
         Anfang stand (<= 0,5 px)
     B2  das Brett ist so gross, wie der Schirm es hergibt: es fuellt die Breite,
         oder unter ihm bleibt kein ungenutzter Platz ueber der Mindestleiste
     B3  kein Seitenfehler
   WARUM es sie gibt: bis v1.92.0 war die Kampfleiste ohne Auswahl 96 px hoch
   und mit Auswahl 242 - der Brettkasten nimmt den Rest, also schrumpfte das
   Brett auf jedem Geraet, dem die Hoehe knapp ist. Keine Probe mass das Brett
   im laufenden Spiel. */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const NUR = (process.argv.find((a) => a.startsWith("--nur=")) || "").slice(6).split(",").filter(Boolean);
const FOTOS = (process.argv.find((a) => a.startsWith("--fotos=")) || "").slice(8);
const DIR = "/tmp/gg-brettruhe";
await mkdir(DIR, { recursive: true }); if (FOTOS) await mkdir(FOTOS, { recursive: true });
execFileSync("npx", ["esbuild", "tools/brettruhe-pruefstand.jsx", "--bundle", "--jsx=automatic",
  `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
  "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl", "--loader:.woff2=dataurl",
  "--loader:.css=text", "--define:import.meta.env={}", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="app.js" defer></script>`);
const TYP = { ".js": "text/javascript", ".html": "text/html", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml" };
const srv = createServer(async (req, res) => {
  const pfad = decodeURIComponent(req.url.split("?")[0]);
  for (const f of [DIR + (pfad === "/" ? "/index.html" : pfad), path.resolve("public") + pfad]) {
    try { const b = await readFile(f); res.writeHead(200, { "content-type": TYP[path.extname(f)] || "application/octet-stream" }); res.end(b); return; } catch {}
  }
  res.writeHead(404); res.end("");
});
await new Promise((r) => srv.listen(0, r));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
let pass = 0, fail = 0;

const ARTEN = ["schach", "hp", "klassisch", "hotseat", "kampagne", "kroenung"].filter((a) => !NUR.length || NUR.includes(a));
const SCHIRME = [[360, 640], [375, 667], [390, 844], [412, 915], [768, 1024], [850, 1100], [820, 620], [1024, 600], [1280, 800]];

/* Jede Lage ist ein eigenes Fenster; vier laufen nebeneinander (einzeln
   brauchte die Probe eine Viertelstunde). Gemessen wird Geometrie, keine Zeit -
   Last verfaelscht hier nichts. */
async function lageFahren(art, bw, bh) {
  const zeilen = [];
  const ok = (name, gut) => zeilen.push([`  ${gut ? "ok " : "not ok"} - ${name}`, !!gut]);
  const ctx = await browser.newContext({ viewport: { width: bw, height: bh }, hasTouch: bw < 900, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
  await page.route(/duell\.gambitrise\.com/, (r) => r.abort());
  await page.goto(`http://127.0.0.1:${srv.address().port}/?art=${art}`, { waitUntil: "load" });
  const lage = `${art} ${bw}x${bh}`;
  try { await page.waitForSelector("[data-zelle]", { timeout: 30000 }); } catch { ok(`${lage}: Brett da (${errs.join(" | ")})`, false); await ctx.close(); return zeilen; }
  const mass = () => page.evaluate(() => {
    let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
    for (const z of document.querySelectorAll("[data-zelle]")) { const q = z.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
    const le = document.querySelector("[data-kampfleiste]");
    return { l, t, w: r - l, h: b - t, leiste: le ? le.getAttribute("data-kampfleiste") + " " + Math.round(le.getBoundingClientRect().height) : "-" };
  });
  /* Auftaktfenster wegklicken, dann warten, bis das Brett RUHT (der Anflug
     skaliert es fast zwei Sekunden lang). */
  const fensterZu = async () => { for (let k = 0; k < 6; k++) {
    const da = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /^(Los geht|Verstanden|Weiter|Beginnen|Kampf beginnen|Zum Kampf|Fertig|Ohne Sperren|Los)\b/i.test((x.textContent || "").trim()));
      if (!b) return false; b.click(); return true; });
    if (!da) break; await page.waitForTimeout(350); } };
  await fensterZu();
  let alt = null, still = 0;
  /* v1.94.2: ACHT gleiche Messungen (1,2 s) statt vier. Gemessen am 7.10.: unter
     Last stockte der Anflug des Bretts, vier gleiche Werte kamen MITTEN in der
     Skalierung zusammen (610 statt 720 px), und jede spaetere Messung galt als
     "das Brett ist gewachsen" - eine rote Pruefung von 150, allein wiederholt gruen. */
  for (let k = 0; k < 90 && still < 8; k++) { await page.waitForTimeout(150); const m = await mass();
    still = alt && Math.abs(m.w - alt.w) < 0.05 && Math.abs(m.t - alt.t) < 0.05 && Math.abs(m.l - alt.l) < 0.05 ? still + 1 : 0; alt = m; }
  await fensterZu(); await page.waitForTimeout(300);
  const ruhe = await mass();
  let schlimm = 0, wo = "", schritte = 0;
  const pruefe = async (was, warte = 90) => { await page.waitForTimeout(warte); const m = await mass(); schritte++;
    const d = Math.max(Math.abs(m.l - ruhe.l), Math.abs(m.t - ruhe.t), Math.abs(m.w - ruhe.w), Math.abs(m.h - ruhe.h));
    if (d > schlimm) { schlimm = d; wo = `${was}: Brett ${m.w.toFixed(1)} breit ab ${m.t.toFixed(1)} statt ${ruhe.w.toFixed(1)} ab ${ruhe.t.toFixed(1)} (Leiste ${m.leiste})`; }
    if (FOTOS && d > 0.5) await page.screenshot({ path: `${FOTOS}/${art}-${bw}x${bh}-${schritte}.png` }); };
  const zellen = () => page.evaluate(() => { const z = [...document.querySelectorAll("[data-zelle]")].map((e) => ({ i: +e.getAttribute("data-zelle"), t: Math.round(e.getBoundingClientRect().top) }));
    const reihen = [...new Set(z.map((x) => x.t))].sort((a, b) => b - a); return { unten: z.filter((x) => x.t >= reihen[1]).map((x) => x.i), alle: z.sort((a, b) => b.t - a.t).map((x) => x.i) }; });
  const tipp = (i) => page.evaluate((i) => { const e = document.querySelector(`[data-zelle="${i}"]`); e && e.click(); }, i);
  const ziele = () => page.evaluate(() => [...document.querySelectorAll("[data-zielart]")].map((e) => +(e.closest("[data-zelle]") || e).getAttribute("data-zelle")).filter((n) => !Number.isNaN(n)));
  if (FOTOS) await page.screenshot({ path: `${FOTOS}/${art}-${bw}x${bh}-0-ruhe.png` });

  /* 1. jede eigene Figur der beiden unteren Reihen antippen, jede Karte oeffnen */
  const z0 = await zellen();
  let fotoWahl = false;
  for (const i of z0.unten) {
    await tipp(i); await pruefe(`Figur auf Feld ${i} gewaehlt`);
    const n = await page.evaluate(() => document.querySelectorAll("[data-kampfleiste] button").length);
    for (let k = 0; k < n; k++) {
      await page.evaluate((k) => { const b = document.querySelectorAll("[data-kampfleiste] button")[k]; b && b.click(); }, k);
      await pruefe(`Feld ${i}, Karte ${k + 1} geoeffnet`, 50);
      if (FOTOS && !fotoWahl) { fotoWahl = true; await page.screenshot({ path: `${FOTOS}/${art}-${bw}x${bh}-1-karte.png` }); }
      await page.evaluate(() => { const t = document.querySelector("[data-talent-text]"); t && t.click(); });
      await page.evaluate((k) => { const b = document.querySelectorAll("[data-kampfleiste] button")[k]; const scharf = b && /bereit|ready/.test(b.textContent || ""); if (scharf) b.click(); }, k);
      await pruefe(`Feld ${i}, Karte ${k + 1} geschlossen`, 40);
    }
  }
  /* 2. Zuege spielen und die Antwort abwarten */
  let gezogen = 0, gekroent = false;
  for (let runde = 0; runde < (art === "kroenung" ? 1 : 5); runde++) {
    const z = await zellen(); let zug = false;
    for (const i of (art === "kroenung" ? [...z.alle].reverse() : z.alle)) {   // der Bauer vor der Umwandlung steht oben
      await tipp(i); await page.waitForTimeout(40);
      const zi = await ziele(); if (!zi.length) continue;
      await pruefe(`Runde ${runde + 1}: Figur ${i} zeigt Ziele`, 30);
      await tipp(zi[zi.length - 1]); zug = true; gezogen++;
      await pruefe(`Runde ${runde + 1}: gezogen`, 120);
      if (await page.locator("[data-kroenung]").count()) {
        gekroent = true; await pruefe("Kroenungswahl offen", 200);
        if (FOTOS) await page.screenshot({ path: `${FOTOS}/${art}-${bw}x${bh}-2-kroenung.png` });
        await page.evaluate(() => { const b = document.querySelector("[data-kroenung-art]"); b && b.click(); });
        await pruefe("gekroent", 300);
      }
      break;
    }
    if (!zug) break;
    await pruefe(`Runde ${runde + 1}: Antwort des Gegners`, 1500);
  }
  /* 3. aufgeben bis zum Banner */
  let banner = false;
  if (art !== "kroenung") {
    for (let k = 0; k < 3 && !banner; k++) {
      await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Aufgeben|Resign/i.test((x.getAttribute("title") || "") + (x.getAttribute("aria-label") || "") + (x.textContent || ""))); b && b.click(); });
      await pruefe("Aufgeben gedrueckt", 400);
      banner = await page.evaluate(() => /Niederlage|Defeat|verloren|aufgegeben/i.test(document.body.innerText || ""));
    }
    if (banner) { await pruefe("Banner steht", 700); if (FOTOS) await page.screenshot({ path: `${FOTOS}/${art}-${bw}x${bh}-3-banner.png` }); }
  }
  const raum = await page.evaluate(() => { const s = document.getElementById("schirm").getBoundingClientRect(); return { w: s.width, h: s.height }; });
  const breit = bw >= 940;
  ok(`B1 ${lage}: das Brett steht still ueber ${schritte} Schritte, ${gezogen} Zuege${art === "kroenung" ? (gekroent ? ", Kroenung" : ", KEINE Kroenung erreicht") : (banner ? ", Banner" : ", kein Banner erreicht")} (groesste Abweichung ${schlimm.toFixed(2)} px${schlimm > 0.5 ? " - " + wo : ""}; Brett ${ruhe.w.toFixed(0)} px, Leiste ${ruhe.leiste})`,
    schlimm <= 0.5 && schritte > 20 && gezogen > 0 && (art !== "kroenung" || gekroent));
  /* Das groesste Brett, das der Kasten je hergibt: sein Deckel ist 110vw + 2,
     und ueber der hintersten Reihe stehen 1,16 Zellen Luft (BoardView, byH). */
  const { n, fuge } = await page.evaluate(() => { const l = [...new Set([...document.querySelectorAll("[data-zelle]")].map((e) => Math.round(e.getBoundingClientRect().left * 100) / 100))].sort((a, b) => a - b);
    return { n: l.length, fuge: Math.max(0, l[1] - l[0] - document.querySelector("[data-zelle]").getBoundingClientRect().width) }; });
  const zelle = Math.floor(Math.min((raum.w - 2 - (n - 1) * fuge) / n, (1.1 * raum.w + 2 - (n - 1) * fuge) / (n + 1.16)));
  const groesstes = n * zelle + (n - 1) * fuge;
  if (!breit) ok(`B2 ${lage}: das Brett ist so gross, wie der Schirm es hergibt (${ruhe.w.toFixed(0)} px, moeglich ${groesstes}; Leiste ${ruhe.leiste})`,
    ruhe.w >= groesstes - 0.5 || /flach 108$/.test(ruhe.leiste));
  ok(`B3 ${lage}: keine Seitenfehler (${errs.join(" | ") || "keine"})`, errs.length === 0);
  await ctx.close();
  return zeilen;
}
const lagen = []; for (const art of ARTEN) for (const [bw, bh] of SCHIRME) lagen.push([art, bw, bh]);
const ergebnis = new Array(lagen.length); let naechste = 0;
await Promise.all(Array.from({ length: Math.min(4, lagen.length) }, async () => {
  for (;;) { const k = naechste++; if (k >= lagen.length) return;
    try { ergebnis[k] = await lageFahren(...lagen[k]); }
    catch (e) { ergebnis[k] = [[`  not ok - ${lagen[k].join(" ")}: Probe abgebrochen (${String(e.message || e).slice(0, 160)})`, false]]; } }
}));
for (const z of ergebnis) for (const [text, gut] of z) { gut ? pass++ : fail++; console.log(text); }
await browser.close(); srv.close();
console.log(`\nRESULT pruefe-brettruhe: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
