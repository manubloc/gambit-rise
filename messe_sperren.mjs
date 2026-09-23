// ── LIVE-MESSUNG DER SETZPHASE (v1.0.63) ───────────────────────────────────
// Quelltext lesen taeuscht; gemessen wird am lebenden DOM. Diese Datei baut
// ein Konto, legt Sperren in den Vorrat, startet eine schnelle Partie und
// misst: Balken da? Felder markiert? Setzen sichtbar? Los gibt frei?
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try { const f = join("dist", p === "/" ? "index.html" : p.slice(1)); const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(b); }
  catch { const b = await readFile("dist/index.html"); res.writeHead(200, { "content-type": "text/html" }); res.end(b); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error" && !/duell\.gambitrise|ERR_TUNNEL|ERR_FAILED/.test(m.text())) fehler.push(m.text().slice(0, 160)); });
const zeig = (s) => console.log(s);

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

// ── Konto anlegen (oertlich, ohne Halle) ───────────────────────────────────
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Erstellen/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("messer@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Konto erstellen/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(2500);
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Neuer Spielstand/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(2500);
const wegKlicken = async () => { for (let n = 0; n < 8; n++) {
  const hit = await page.evaluate(() => {
    /* "Los geht's" heisst im Kampf der SETZ-Knopf - der darf hier nicht
       mitgeklickt werden, sonst misst die Probe eine Phase, die sie selbst
       gerade geschlossen hat. Erkennungszeichen: er steht IM Setzbalken. */
    const b = [...document.querySelectorAll("button")].find((x) => {
      const t = x.textContent.trim();
      if (!["Los geht's", "Verstanden", "Weiter"].includes(t)) return false;
      return !/Sperren setzen/i.test(x.parentElement?.textContent || "");
    });
    if (b) { b.click(); return true; } return false; });
  if (!hit) return; await page.waitForTimeout(800);
} };
await wegKlicken();

// ── Sperren in den Vorrat legen und neu laden ──────────────────────────────
await page.evaluate(() => {
  /* Der Vorrat wandert in BEIDE Ablagen: das lebende Profil und den
     Spielstand-Punkt, aus dem "Weiterspielen" liest - sonst ueberschreibt
     der Spielstand die Aenderung sofort wieder. */
  const patch = (roh) => { const p = JSON.parse(roh); p.gold = 2000; p.items = { ...(p.items || {}), mauer: 2, zaun: 1 }; return JSON.stringify(p); };
  for (const k of Object.keys(localStorage)) {
    if (k === "gambit:u::profile" || /^gambit:u::save:/.test(k)) {
      const v = localStorage.getItem(k);
      try { const o = JSON.parse(v); if (o && typeof o === "object" && "items" in o) localStorage.setItem(k, patch(v)); } catch {}
    }
  }
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Weiterspielen/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(2500);
await wegKlicken();

// ── Schnelles Spiel ────────────────────────────────────────────────────────
console.log("KEYS:", await page.evaluate(() => Object.keys(localStorage).map(k=>k+" ("+(localStorage.getItem(k)||"").length+")")));
console.log("PROFIL:", await page.evaluate(() => { const p = JSON.parse(localStorage.getItem("gambit:u::profile")||"{}"); return { items: p.items, gold: p.gold }; }));
console.log("VOR START:", await page.evaluate(() => [...document.querySelectorAll("button")].map(b=>b.textContent.trim().slice(0,30)).slice(0,16)));
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Anpassen/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(1500);
console.log("ANPASSEN:", await page.evaluate(() => [...document.querySelectorAll("button")].map(b=>b.textContent.trim().slice(0,26)).slice(0,30)));
for (const w of ["HP-Gefecht", "Arena · 10×10", "Gegen die KI"]) {
  await page.evaluate((t) => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === t); b && b.click(); }, w);
  await page.waitForTimeout(500);
}
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => /Partie starten/.test(x.textContent)); b && b.click(); });
await page.waitForTimeout(4000);
console.log("NACH SOFORT:", await page.evaluate(() => [...document.querySelectorAll("button")].map(b=>b.textContent.trim().slice(0,30)).slice(0,16)), "zellen", await page.locator("[data-zelle]").count());
await wegKlicken();
await page.waitForTimeout(1500);
console.log("NACH DIALOGEN:", await page.evaluate(() => [...document.querySelectorAll("button")].map(b=>b.textContent.trim().slice(0,30)).slice(0,16)), "zellen", await page.locator("[data-zelle]").count());

const mess = async () => page.evaluate(() => {
  const zellen = [...document.querySelectorAll("[data-zelle]")];
  const marken = zellen.filter((z) => [...z.querySelectorAll("div")].some((c) => (c.style.animation || "").includes("ggSetzPuls")));
  const alle = [...document.querySelectorAll("div")];
  const kopf = alle.find((d) => (d.textContent || "").trim() === "Sperren setzen");
  const balkenEl = kopf ? kopf.parentElement : null;
  const balken = balkenEl ? balkenEl.getBoundingClientRect() : null;
  const brett = zellen.length ? (() => {
    const r = zellen.map((z) => z.getBoundingClientRect());
    return { oben: Math.round(Math.min(...r.map((x) => x.top))), unten: Math.round(Math.max(...r.map((x) => x.bottom))) };
  })() : null;
  const sperrGlyph = zellen.filter((z) => z.querySelector("svg[viewBox='0 0 32 32']") || z.querySelector("img[src*='mauer-']"));
  return {
    zellen: zellen.length,
    marken: marken.map((z) => +z.dataset.zelle).sort((a, b) => a - b),
    balken: balken ? { b: Math.round(balken.width), h: Math.round(balken.height), oben: Math.round(balken.top), unten: Math.round(balken.bottom) } : null,
    brett,
    verdeckt: balken && brett ? Math.max(0, brett.unten - balken.top) : 0,
    glyphen: sperrGlyph.map((z) => +z.dataset.zelle),
    knopf: [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).find((t) => /Los geht's|Ohne Sperren|Begin/.test(t)) || null,
  };
});
const a = await mess();
console.log("MESSUNG 1 (Setzphase):", JSON.stringify(a));
if (a.marken.length) { await page.evaluate((i) => document.querySelector(`[data-zelle="${i}"]`).click(), a.marken[3]); await page.waitForTimeout(800); }
const b = await mess();
console.log("MESSUNG 2 (eine gesetzt):", JSON.stringify(b));
if (b.glyphen.length) { await page.evaluate((i) => document.querySelector(`[data-zelle="${i}"]`).click(), b.glyphen[0]); await page.waitForTimeout(800); }
const c = await mess();
console.log("MESSUNG 3 (zurueckgenommen):", JSON.stringify(c));
if (a.marken.length) { await page.evaluate((i) => document.querySelector(`[data-zelle="${i}"]`).click(), a.marken[3]); await page.waitForTimeout(700); }
await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((q) => /Los geht's|Ohne Sperren|Begin/.test(q.textContent)); if (x) x.click(); });
await page.waitForTimeout(1000);
const d = await mess();
console.log("MESSUNG 4 (nach Los):", JSON.stringify(d));
// Haelt die Sperre wirklich? Der Bauer davor darf NICHT durchlaufen.
const ziele = async (feld) => {
  await page.evaluate(() => document.querySelector('[data-zelle="99999"]'));
  await page.evaluate((i) => document.querySelector(`[data-zelle="${i}"]`)?.click(), feld);
  await page.waitForTimeout(400);
  return page.evaluate(() => [...document.querySelectorAll("[data-zelle]")]
    .filter((z) => [...z.querySelectorAll("div")].some((c) => /border-radius:\s*50%/.test(c.getAttribute("style") || "")))
    .map((z) => +z.dataset.zelle).sort((a, b) => a - b));
};
console.log("BAUER VOR DER SPERRE (Feld 11, Sperre auf 19):", JSON.stringify(await ziele(11)));
console.log("BAUER OHNE SPERRE (Feld 12):", JSON.stringify(await ziele(12)));
console.log(fehler.length ? "FEHLER: " + fehler.slice(0, 3).join(" | ") : "== KEINE FEHLER ==");
await browser.close(); srv.close();
