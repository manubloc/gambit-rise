// drive3 — the road test. Serves the built dist/ over HTTP, boots the app in
// headless Chromium and fails on ANY console error or missing login mask.
// Gate line "== KEINE FEHLER ==" is what the push battery greps for.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join("dist", p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(b);
  } catch {
    const b = await readFile("dist/index.html");            // SPA fallback
    res.writeHead(200, { "content-type": "text/html" }); res.end(b);
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const errors = [];
// The Hall (duell.grandgambit.win) is unreachable from this sandbox — the
// boot-time GET /design is DESIGNED to fail silently offline (livery.js
// catches and falls back to APP_DESIGN). Chromium still logs the CORS/network
// line itself; that expected pair is the ONLY thing this gate tolerates.
/* v1.0.63: In einer Sandbox mit vorgeschaltetem Netz-Vermittler meldet
   Chromium denselben Fehlschlag als ERR_TUNNEL_CONNECTION_FAILED statt
   ERR_FAILED - gemessen: die einzige fehlgeschlagene Anfrage ist weiterhin
   GET https://duell.grandgambit.win/design. Ein Tunnelfehler kann ohnehin nur
   bei einer AUSWAERTIGEN Anfrage entstehen; alles Eigene liefert der lokale
   Server dieser Datei (und im Zweifel seine SPA-Rueckfallseite mit 200). */
const EXPECTED_OFFLINE = (t) =>
  /duell\.grandgambit\.win/.test(t)
  || /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED)/.test(t);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error" && !EXPECTED_OFFLINE(m.text())) errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const hasLogin = await page.locator("input").count() > 0 || (await page.textContent("body"))?.includes("Spielstand");
if (!hasLogin) errors.push("Login-/Startmaske nicht gefunden");
{
  /* v1.0.92: liegt das Talentband UNTER dem Brett oder dahinter? Der
     Besitzer sah es halb verdeckt - hier wird es gemessen, nicht geglaubt. */
  /* eine eigene Figur anklicken, damit das Band ueberhaupt erscheint */
  await page.evaluate(() => {
    const felder = [...document.querySelectorAll("button")].filter((b) => b.querySelector("img,svg"));
    const unten = felder.filter((b) => b.getBoundingClientRect().top > innerHeight * 0.5);
    (unten[Math.floor(unten.length / 2)] || felder[0])?.click();
  });
  await page.waitForTimeout(700);
  const m = await page.evaluate(() => {
    const band = document.querySelector(".gg-talentband");
    if (!band) return { band: false };
    const b = band.getBoundingClientRect();
    const felder = [...document.querySelectorAll("button,div")]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 180 && Math.abs(r.width - r.height) < r.width * 0.25);
    if (!felder.length) return { band: true, brett: false };
    const brett = felder.sort((x, y) => y.width - x.width)[0];
    return { band: true, brett: true, ueberlappung: +(brett.bottom - b.top).toFixed(1),
      bandOben: +b.top.toFixed(1), brettUnten: +brett.bottom.toFixed(1) };
  });
  if (m.band && m.brett) {
    console.log(`   Talentband: Brett endet bei ${m.brettUnten}, Band beginnt bei ${m.bandOben} -> Ueberlappung ${m.ueberlappung} px`);
    if (m.ueberlappung > 1) console.log("   WARNUNG: das Band liegt noch unter dem Brett");
  } else console.log("   Talentband: nicht sichtbar (keine Figur mit Talenten gewaehlt)");
}
await browser.close(); srv.close();

if (errors.length) { console.log("FEHLER:", errors.join(" | ")); process.exit(1); }
console.log("== KEINE FEHLER ==");
