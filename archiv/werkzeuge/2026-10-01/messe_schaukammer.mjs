// ── DIE FEHLLISTE AM LEBENDEN DOM ───────────────────────────────────────────
// Vorbild: messe_sperren.mjs (v1.0.63). Quelltext lesen hat in diesem Haus
// wiederholt getaeuscht - was sichtbar sein soll, wird gemessen.
//
// Gemessen wird der Reiter "Fehlt noch" der Schaukammer (v1.0.64): steht er
// da, zaehlt er sechs, zeigt er sechs Kacheln mit einer echten Zeichnung
// darin (nicht bloss leere Rahmen), und verdeckt er nichts?
//
// Die Tuer: das Torschloss (v1.0.39) merkt sich sein Ja in sessionStorage
// unter "gg:werkzeug:offen". Hier wird die Marke gesetzt, statt ein Passwort
// zu kennen - gemessen wird die Kammer, nicht das Schloss.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { createRequire } from "node:module";
const require0 = createRequire(import.meta.url);

const TYP = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webm": "video/webm", ".mp3": "audio/mpeg" };

const server = createServer(async (req, res) => {
  const pfad = decodeURIComponent(req.url.split("?")[0]);
  /* Der Typ haengt an der DATEI, nicht an der Adresse. "/" hat keine Endung -
     die erste Fassung schickte darum index.html als Bytestrom, und Chromium
     lud die Seite herunter, statt sie zu zeigen ("Download is starting"). */
  const rel = pfad === "/" ? "index.html" : pfad;
  try {
    const datei = await readFile(join("dist", rel));
    res.writeHead(200, { "Content-Type": TYP[extname(rel)] || "application/octet-stream" });
    res.end(datei);
  } catch {
    try {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(await readFile("dist/index.html"));
    } catch { res.writeHead(404); res.end(); }
  }
});
await new Promise((r) => server.listen(8099, r));

/* CHROMIUM SELBER SUCHEN. drive3.mjs und messe_sperren.mjs verdrahten
   "/opt/pw-browsers/chromium-1194/…" fest - das galt genau fuer den Container
   einer Sitzung. Ein anderer bringt eine andere Nummer mit, und die Vorgabe
   von Playwright greift auch nicht immer (playwright-core will je nach Fassung
   die Kopfleiste "chrome-headless-shell", die im Bild fehlt). Also: nimm, was
   da ist - GG_CHROME sticht, sonst der neueste chromium-* Ordner. */
const chromePfad = process.env.GG_CHROME || (() => {
  try {
    const { readdirSync, existsSync } = require0("node:fs");
    const wurzel = "/opt/pw-browsers";
    if (!existsSync(wurzel)) return null;
    const ordner = readdirSync(wurzel).filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]));
    for (const o of ordner) {
      const p = join(wurzel, o, "chrome-linux", "chrome");
      if (existsSync(p)) return p;
    }
  } catch {}
  return null;
})();
const browser = await chromium.launch(
  chromePfad ? { executablePath: chromePfad, args: ["--no-sandbox"] } : { args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
  serviceWorkers: "block" });   // sonst laedt der Dienstarbeiter mitten hinein neu
const page = await ctx.newPage();
await page.addInitScript(() => { try { sessionStorage.setItem("gg:werkzeug:offen", "1"); } catch {} });
await page.goto("http://localhost:8099/?werkstatt", { waitUntil: "load" });
await page.waitForTimeout(2500);

const reiter = page.getByRole("button", { name: /Fehlt noch/ });
const da = await reiter.count();
console.log("Reiter 'Fehlt noch' vorhanden:", da > 0);
if (!da) { console.log("== FEHLER: der Reiter fehlt =="); await browser.close(); server.close(); process.exit(1); }
console.log("Aufschrift:", (await reiter.first().innerText()).replace(/\s+/g, " "));

await reiter.first().click();
await page.waitForTimeout(700);

const mass = await page.evaluate(() => {
  const kacheln = [...document.querySelectorAll("div")].filter((d) =>
    /dashed/.test(getComputedStyle(d).borderTopStyle) && d.querySelector("svg"));
  const r = kacheln.map((k) => {
    const b = k.getBoundingClientRect();
    const svg = k.querySelector("svg").getBoundingClientRect();
    return { text: k.innerText.replace(/\s+/g, " ").trim(),
      breite: Math.round(b.width), hoehe: Math.round(b.height),
      zeichnung: Math.round(svg.width) + "x" + Math.round(svg.height),
      imBild: b.left >= 0 && b.right <= innerWidth };
  });
  return { anzahl: kacheln.length, kacheln: r,
    leer: document.body.innerText.includes("Nichts gefunden.") };
});

console.log("Kacheln:", mass.anzahl);
for (const k of mass.kacheln) console.log("  ·", k.text, "|", k.breite + "x" + k.hoehe,
  "| Zeichnung", k.zeichnung, "| im Bild:", k.imBild);
console.log("'Nichts gefunden' faelschlich sichtbar:", mass.leer);

const gut = mass.anzahl === 6 && !mass.leer &&
  mass.kacheln.every((k) => k.imBild && k.zeichnung !== "0x0");
console.log(gut ? "== KEINE FEHLER ==" : "== FEHLER ==");
await browser.close(); server.close();
process.exit(gut ? 0 : 1);
