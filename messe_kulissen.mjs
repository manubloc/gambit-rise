import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { createRequire } from "node:module";
const require0 = createRequire(import.meta.url);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".webm": "video/webm", ".mp3": "audio/mpeg" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  const rel = p === "/" ? "index.html" : p.slice(1);
  try {
    const b = await readFile(join("dist", rel));
    res.writeHead(200, { "content-type": MIME[extname(rel)] || "application/octet-stream" });
    res.end(b);
  } catch {
    const b = await readFile("dist/index.html");
    res.writeHead(200, { "content-type": "text/html" }); res.end(b);
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

/* Chromium selber suchen statt eine Ordnernummer festzuschreiben, die genau
   einem Container gehoerte (v1.0.64). */
const chromePfad = process.env.GG_CHROME || (() => {
  try {
    const { readdirSync, existsSync } = require0("node:fs");
    const w = "/opt/pw-browsers";
    if (!existsSync(w)) return null;
    for (const o of readdirSync(w).filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))) {
      const p = join(w, o, "chrome-linux", "chrome");
      if (existsSync(p)) return p;
    }
  } catch {}
  return null;
})();
const browser = await chromium.launch({ ...(chromePfad ? { executablePath: chromePfad } : {}), args: ["--no-sandbox"] });
const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error" && !/duell\.grandgambit|ERR_TUNNEL|ERR_FAILED/.test(m.text())) fehler.push(m.text().slice(0, 160)); });

const klick = async (muster) => page.evaluate((m) => {
  const b = [...document.querySelectorAll("button")].find((x) => new RegExp(m).test(x.textContent));
  if (b) { b.click(); return true; } return false;
}, muster);
const wegKlicken = async () => { for (let n = 0; n < 8; n++) {
  const hit = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      ["Los geht's", "Verstanden", "Weiter"].includes(x.textContent.trim()));
    if (b) { b.click(); return true; } return false; });
  if (!hit) return; await page.waitForTimeout(700);
} };


/* ── LIVE-MESSUNG DER KULISSEN (v1.14.0) ──────────────────────────────────────
   SSR zeigt das Verzeichnis nicht (es wartet auf seine Gemaelde), also wird
   hier im echten Chromium gemessen: traegt jede Kachel im Hofstaat das Bild
   ihres Bundes / Grossmeisters / ihrer Gruppe - sichtbar, mit Breite? */
import { BUENDE } from "./src/content/buende.js";
import { CHARACTER_LIST, BOSSES } from "./src/content/index.js";
import { MEISTER_KULISSE, MONSTER_GRUPPE } from "./src/app/ui/kulissen.js";

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await klick("Erstellen");
await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("kulisse@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen");
await page.waitForTimeout(2500);
await klick("Neuer Spielstand");
await page.waitForTimeout(2500);
await wegKlicken();

const alleChars = CHARACTER_LIST.map((c) => c.id);
const alleKinds = [...new Set(CHARACTER_LIST.map((c) => c.kind))];
const alleBosse = (Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES)).map((b) => b.id);
await page.evaluate(({ chars, kinds, bosse }) => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.gold = 9000; p.sp = 60;
    p.unlocked = chars;
    p.codex = p.codex || {}; p.codex.met = [...kinds, ...bosse.map((b) => "X:" + b)];
    p.campaign = p.campaign || {}; p.campaign.bribedBosses = bosse;
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    if (k === "gambit:u::profile" || /^gambit:u::save:/.test(k)) {
      try { const o = JSON.parse(localStorage.getItem(k));
        if (o && typeof o === "object" && "gold" in o) localStorage.setItem(k, patch(localStorage.getItem(k)));
      } catch {}
    }
  }
}, { chars: alleChars, kinds: alleKinds, bosse: alleBosse });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await klick("Weiterspielen");
await page.waitForTimeout(2500);
await wegKlicken();
await klick("^Lager$");
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Figuren");
  (b[b.length - 1] || b[0])?.click();
});
await page.waitForTimeout(2500);
await wegKlicken();   /* die Vorstellung des Hofstaats wegklicken, sonst verdeckt sie das Bild */
await page.waitForTimeout(600);

/* Gemessen: jedes Kulissenbild mit Name, Breite und ob es geladen ist. */
const gemessen = await page.evaluate(() => [...document.querySelectorAll("img[data-kulisse]")].map((i) => {
  const r = i.getBoundingClientRect();
  return { name: i.dataset.kulisse, w: Math.round(r.width), h: Math.round(r.height),
    geladen: i.complete && i.naturalWidth > 0, deckung: getComputedStyle(i).opacity };
}));
const nachName = {};
for (const g of gemessen) (nachName[g.name] = nachName[g.name] || []).push(g);

let passed = 0, failed = 0;
const ok = (n, c) => { if (c) { passed++; console.log(`  ok  - ${n}`); } else { failed++; console.log(`  FAIL - ${n}`); } };
const soll = [
  ...Object.keys(BUENDE).map((b) => [`bund-${b}`, BUENDE[b].figuren.length]),
  ...Object.values(MEISTER_KULISSE).map((m) => [m, 1]),
  ...[...new Set(Object.values(MONSTER_GRUPPE))].map((g) => [`monster-${g}`, Object.values(MONSTER_GRUPPE).filter((x) => x === g).length]),
  ["drache", 1],
];
console.log(`\n== KULISSEN IM LEBENDEN HOFSTAAT (${gemessen.length} Bilder gefunden) ==`);
for (const [name, n] of soll) {
  const da = nachName[name] || [];
  const sichtbar = da.filter((g) => g.w > 40 && g.h > 40 && g.geladen);
  ok(`${name}: ${n} Kachel(n) erwartet, ${da.length} gefunden, ${sichtbar.length} sichtbar und geladen`, da.length === n && sichtbar.length === n);
}
const deckungen = [...new Set(gemessen.map((g) => g.deckung))];
ok(`die Kulisse liegt gedaempft unter der Figur (Deckung ${deckungen.join("/")})`, deckungen.every((d) => Number(d) <= 0.5));
const masse = gemessen[0] ? `${gemessen[0].w}x${gemessen[0].h}` : "-";
console.log(`  (Kachelmass der ersten Kulisse: ${masse} px)`);
await page.screenshot({ path: "/mnt/user-data/outputs/hofstaat-kulissen.png", fullPage: false });
await page.evaluate(() => document.querySelector('img[data-kulisse="meister-hetzer"]')?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(400);
await page.screenshot({ path: "/mnt/user-data/outputs/hofstaat-kulissen-2.png", fullPage: false });
console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (fehler.length) console.log("SEITENFEHLER:", fehler);
await browser.close(); srv.close();
if (failed || fehler.length) process.exit(1);
