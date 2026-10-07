/* ── DIE KUENSTE AM ECHTEN SPIELSCHIRM (v1.94.0, ~15 s) ───────────────────────
   Besitzer 7.10.2026: die erste Faehigkeit jeder Figur muss im Schach wirken -
   Kapitel I hat 45 Schach-Stationen und keine einzige HP-Station. Der Kern ist
   in test_zugbilder (Abschnitt 7) geprueft; diese Probe prueft den WEG DES
   SPIELERS am echten GameScreen einer Schach-Station von Kapitel I:

     K1  die Figur zeigt ihre gelernte Kunst als Karte ("antippen")
     K2  ihre Felder erscheinen ERST, wenn die Karte scharf ist - mit Stern
     K3  ein Tipp auf das Feld wirkt sie (auch wenn dort eine EIGENE Figur
         steht: der Tipp darf nicht einfach die Auswahl wechseln)
     K4  danach ist die Karte "eingesetzt", der Gegner antwortet
     K5  kein Seitenfehler

   WARUM ES SIE GIBT: bis v1.93.2 baute der Heeresbau das Schachheer mit
   `chosenOf = null` auf Stufe 1 - gelernte Faehigkeiten kamen im Schach nie am
   Brett an, und keine Probe fuhr eine Schach-Station mit einer Sonderfigur.

   Aufruf: node tools/pruefe-kunst.mjs [fotoordner] */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const AUS = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "";
const DIR = "/tmp/gg-kunst";
await mkdir(DIR, { recursive: true }); if (AUS) await mkdir(AUS, { recursive: true });
execFileSync("npx", ["esbuild", "tools/kunst-pruefstand.jsx", "--bundle", "--jsx=automatic",
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
const ok = (name, gut, mehr = "") => { if (gut) pass++; else fail++; console.log(`  ${gut ? "ok " : "not ok"} - ${name}${gut || !mehr ? "" : " (" + mehr + ")"}`); };

const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, serviceWorkers: "block" });
const page = await ctx.newPage();
const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 200)));
await page.route(/duell\.gambitrise\.com/, (r) => r.abort());
await page.goto(`http://127.0.0.1:${srv.address().port}/`, { waitUntil: "load" });
await page.waitForSelector("[data-zelle]", { timeout: 30000 });
const fensterZu = async () => { for (let k = 0; k < 6; k++) {
  const da = await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /^(Los geht|Verstanden|Weiter|Beginnen|Kampf beginnen|Zum Kampf|Fertig|Ohne Sperren|Los)\b/i.test((x.textContent || "").trim()));
    if (!b) return false; b.click(); return true; });
  if (!da) break; await page.waitForTimeout(350); } };
await fensterZu(); await page.waitForTimeout(2600); await fensterZu();
const foto = async (n) => { if (AUS) await page.screenshot({ path: `${AUS}/${n}.png` }); };
const tipp = (i) => page.evaluate((i) => { const e = document.querySelector(`[data-zelle="${i}"]`); e && e.click(); }, i);
const figur = (i) => page.evaluate((i) => document.querySelector(`[data-zelle="${i}"]`)?.getAttribute("data-figur") || null, i);
const ziele = () => page.evaluate(() => [...document.querySelectorAll("[data-zielart]")].map((e) => +e.closest("[data-zelle]").getAttribute("data-zelle")).sort((a, b) => a - b));
const sterne = () => page.evaluate(() => [...document.querySelectorAll("[data-zielstern]")].map((e) => [+e.closest("[data-zelle]").getAttribute("data-zelle"), e.getAttribute("data-zielstern")]));
const karten = () => page.evaluate(() => [...document.querySelectorAll("[data-kampfleiste] button")].map((b) => (b.textContent || "").replace(/\s+/g, " ").trim()));
const karte = (wort) => page.evaluate((wort) => { const b = [...document.querySelectorAll("[data-kampfleiste] button")].find((x) => (x.textContent || "").toUpperCase().includes(wort.toUpperCase())); if (b) b.click(); return !!b; }, wort);
/* Der Gegner hat geantwortet, sobald IRGENDEINE eigene Figur wieder Ziele zeigt.
   Nicht eine bestimmte: der Springer auf g1 kann gefesselt, gebunden oder
   verstellt sein (gemessen 7.10.: ein Lauf unter Last blieb daran haengen). */
const amZug = async () => { for (let k = 0; k < 120; k++) { await page.waitForTimeout(200);
  const eigene = await page.evaluate(() => [...document.querySelectorAll('[data-figur^="w:"]')].map((e) => +e.getAttribute("data-zelle")));
  for (const i of eigene) { await tipp(i); const z = await ziele(); await tipp(i); if (z.length) return true; } } return false; };

console.log(`Station ${await page.evaluate(() => document.documentElement.getAttribute("data-station"))}, Schachregeln`);
ok("Aufstellung: Baeuerin a1, Hofnarr b1, Schmied c1, Spaeher f1 stehen am Brett",
  (await figur(0)) === "w:farmwife" && (await figur(1)) === "w:jester" && (await figur(2)) === "w:smith" && (await figur(5)) === "w:hawk", [await figur(0), await figur(1), await figur(2), await figur(5)].join());

/* ── Feldarbeit: die Baeuerin schiebt den Bauern auf a2 ein Feld vor ── */
await tipp(0); await page.waitForTimeout(150);
let k = await karten();
ok("K1 Baeuerin gewaehlt: ihre Karte Feldarbeit ist da und laesst sich antippen", k.some((t) => /FELDARBEIT/i.test(t) && /antippen/.test(t)), k.join(" | "));
const vorher = await ziele();
ok("K2 ohne scharfe Karte zeigt das Brett kein Feld der Kunst (der Bauer auf a2 ist kein Ziel)", !vorher.includes(8), vorher.join());
await karte("Feldarbeit"); await page.waitForTimeout(150); await foto("1-feldarbeit-scharf");
let s = await sterne();
ok("K2 Karte scharf: a2 und b2 tragen den Stern der Feldarbeit", s.filter(([, t]) => t === "feldarbeit").map(([i]) => i).sort().join() === "8,9", JSON.stringify(s));
await tipp(8); await page.waitForTimeout(400); await foto("2-feldarbeit-gewirkt");
ok("K3 Tipp auf den EIGENEN Bauern wirkt die Kunst: er steht auf a3, die Baeuerin bleibt auf a1",
  (await figur(16)) === "w:pawn" && (await figur(8)) === null && (await figur(0)) === "w:farmwife", [await figur(16), await figur(8), await figur(0)].join());
ok("K4 der Gegner antwortet", await amZug());
await tipp(0); await page.waitForTimeout(150); k = await karten();
ok("K4 die Karte ist eingesetzt", k.some((t) => /FELDARBEIT/i.test(t) && /eingesetzt/.test(t)), k.join(" | "));

/* ── Platztausch: der Hofnarr tauscht mit der Dame ── */
await tipp(1); await page.waitForTimeout(150); await karte("Platztausch"); await page.waitForTimeout(150);
s = await sterne();
ok("K2 Platztausch scharf: jede eigene Figur ausser dem Koenig ist ein Ziel (14), der Koenig nicht",
  s.filter(([, t]) => t === "platztausch").length === 14 && !s.some(([i]) => i === 4), String(s.length));
await foto("3-platztausch-scharf");
await tipp(3); await page.waitForTimeout(400);
ok("K3 Hofnarr und Dame haben die Plaetze getauscht", (await figur(3)) === "w:jester" && (await figur(1)) === "w:queen", [await figur(3), await figur(1)].join());
ok("K4 der Gegner antwortet", await amZug());

/* ── Uebersprung: der Spaeher springt ueber den Bauern vor ihm ── */
await tipp(5); await page.waitForTimeout(150); await karte(/** de */ "bersprung"); await page.waitForTimeout(150);
s = await sterne();
const hin = s.filter(([, t]) => t === "uebersprung").map(([i]) => i);
ok("K2 Uebersprung scharf: mindestens das Feld hinter dem eigenen Bauern (f3)", hin.includes(21), hin.join());
await tipp(21); await page.waitForTimeout(400); await foto("4-uebersprung-gewirkt");
ok("K3 der Spaeher steht auf f3", (await figur(21)) === "w:hawk" && (await figur(5)) === null);

/* ── Der Schmied: Standhieb ohne Nachbarn bietet nichts an ── */
await amZug();
await tipp(2); await page.waitForTimeout(150); await karte("Standhieb"); await page.waitForTimeout(150);
/* Der Gegner zieht nicht in jedem Lauf gleich (gemessen 7.10.: im Klon stand
   nach drei Zuegen eine Figur neben dem Schmied, die Probe verlangte "kein
   Stern" und wurde rot). Geprueft wird darum die REGEL: ein Stern nur auf
   einem Nachbarfeld, auf dem ein Gegner steht, der nicht der Koenig ist. */
{
  const st = (await sterne()).filter(([, t]) => t === "standhieb").map(([i]) => i);
  const wo = await page.evaluate(() => { const z = [...document.querySelectorAll('[data-figur="w:smith"]')][0]; return z ? +z.getAttribute("data-zelle") : -1; });
  let sauber = wo >= 0;
  for (const i of st) { const f = await figur(i);
    if (!(f && f.startsWith("b:") && f !== "b:K" && f !== "b:king" && Math.max(Math.abs(i % 8 - wo % 8), Math.abs(Math.floor(i / 8) - Math.floor(wo / 8))) === 1)) sauber = false; }
  ok(`Standhieb scharf: Sterne nur auf gegnerischen Nachbarn, nie auf dem Koenig (${st.length} Feld${st.length === 1 ? "" : "er"}) - und nichts stuerzt ab`, sauber, st.join());
}
ok("K5 keine Seitenfehler", errs.length === 0, errs.join(" | "));

await browser.close(); srv.close();
console.log(`\nRESULT pruefe-kunst: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
