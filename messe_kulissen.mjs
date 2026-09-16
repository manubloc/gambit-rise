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
    p.pieces = p.pieces || {}; p.pieces.abilities = { ...(p.pieces.abilities || {}), amazon: ["ranged_shot", "teleport"], knight: ["knight_longleap", "knight_outrider"] };
    p.codex = p.codex || {}; p.codex.met = [...kinds, ...bosse.map((b) => "X:" + b)];
    p.campaign = p.campaign || {}; p.campaign.bribedBosses = bosse.slice(0, 12);   /* die Haelfte bleibt "begegnet" - fuer die Graustufen-Messung */
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
  ["drache", 1], ["figur-bauer", 1], ["figur-gambit", 1],
];
console.log(`\n== KULISSEN IM LEBENDEN HOFSTAAT (${gemessen.length} Bilder gefunden) ==`);
for (const [name, n] of soll) {
  const da = nachName[name] || [];
  const sichtbar = da.filter((g) => g.w > 40 && g.h > 40 && g.geladen);
  ok(`${name}: ${n} Kachel(n) erwartet, ${da.length} gefunden, ${sichtbar.length} sichtbar und geladen`, da.length === n && sichtbar.length === n);
}
/* ── v1.15.1: KOPFZEILE, STUFE, GRAUSTUFEN, FARBTON ───────────────────────── */
const kopf = await page.evaluate(() => {
  /* gleiche Bauhoehe: der Stufenkreis (oder sein Platzhalter) steht in jeder
     Kachel gleich weit unter der Oberkante, und das Rohr sitzt auf seiner Hoehe */
  const kacheln = [...document.querySelectorAll("[data-kopf]")].map((k) => {
    const t = k.parentElement.getBoundingClientRect().top;
    const st = k.lastElementChild.getBoundingClientRect();
    const rohr = k.querySelector("[data-gg=\"rohr-koerper\"]");
    const rm = rohr ? rohr.getBoundingClientRect() : null;
    return Math.round((st.top - t) * 10) / 10 + (rm ? "|" + Math.round(((rm.top + rm.height / 2) - (st.top + st.height / 2)) * 10) / 10 : "");
  });
  const stufen = [...document.querySelectorAll("[data-stufe]")].map((el) => {
    const c = el.getBoundingClientRect();
    const r = document.createRange(); r.selectNodeContents(el);
    const g = r.getBoundingClientRect();
    /* die Glyphenbox ist die Zeilenbox; die Ziffer selbst sitzt in Georgia
       optisch ein wenig ueber der Mitte der Zeilenbox - gemessen wird die
       Zeilenbox, das ist die ehrliche Groesse, die CSS hergibt */
    return { dx: (g.left + g.width / 2) - (c.left + c.width / 2), dy: (g.top + g.height / 2) - (c.top + c.height / 2) };
  });
  const grau = [...document.querySelectorAll("img[data-kulisse][data-grau=\"1\"]")].map((i) => getComputedStyle(i).filter);
  const farbig = [...document.querySelectorAll("img[data-kulisse][data-grau=\"0\"]")].map((i) => getComputedStyle(i).filter);
  const toene = [...document.querySelectorAll("[data-kulisse-ton]")].length;
  const meisterMitRohr = [...document.querySelectorAll("img[data-kulisse^=\"meister-\"], img[data-kulisse^=\"monster-\"]")]
    .map((i) => !!i.parentElement.querySelector("svg[data-gg=\"sockelband\"]")).filter(Boolean).length;
  const baender = [...document.querySelectorAll("svg[data-gg=\"sockelband\"]")].map((sv) => {
    /* das Band muss auf dem Bild liegen: derselbe Kasten wie sein Bild */
    const img = sv.parentElement.querySelector("img"); const a = sv.getBoundingClientRect(), b = img.getBoundingClientRect();
    return Math.max(Math.abs(a.left - b.left), Math.abs(a.top - b.top), Math.abs(a.width - b.width), Math.abs(a.height - b.height));
  });
  /* v1.20.1: die Bodenlinie jeder Figur, relativ zur Unterkante ihrer Kachel */
  const boden = [...document.querySelectorAll("[data-boden]")].map((w) => {
    const sv = w.querySelector("svg[data-gg=\"sockelband\"]"); if (!sv) return null;
    const vb = sv.viewBox.baseVal; const r = sv.getBoundingClientRect();
    const seg = sv.querySelector("path"); const bb = seg.getBBox();   /* der Goldfuss: sein unterster Punkt ist die Bodenkante */
    const yPx = r.top + (bb.y + bb.height) / vb.height * r.height;
    const kachel = w.closest("[data-kopf]")?.parentElement || w.parentElement;
    return Math.round((kachel.getBoundingClientRect().bottom - yPx) * 10) / 10;
  }).filter((v) => v !== null);
  /* v1.20.2: die Namenszeile sitzt in jeder Kachel gleich weit unter der Oberkante */
  const namen = [...document.querySelectorAll("[data-kopf]")].map((k) => {
    const kachel = k.parentElement; const n = [...kachel.querySelectorAll(".gg-quill")].pop();
    return n ? Math.round(n.getBoundingClientRect().top - kachel.getBoundingClientRect().top) : null;
  }).filter((v) => v !== null);
  const talente = document.querySelectorAll("[data-kopf] [data-talent]").length;
  /* v1.23.0: gleiche Tellerbreite - der Goldfuss jedes Bandes hat auf dem Schirm dieselbe Breite */
  const teller = [...document.querySelectorAll("svg[data-gg=\"sockelband\"]")].map((sv) => {
    const p = sv.querySelector("path"); const bb = p.getBBox(); const vb = sv.viewBox.baseVal; const r = sv.getBoundingClientRect();
    const skala = r.width / vb.width;   /* getBoundingClientRect enthaelt die Skalierung schon */
    return Math.round(bb.width * skala * 10) / 10;
  });
  const abz = [...document.querySelectorAll("svg[data-abzeichen]")].map((a) => { const k = a.closest("[data-kopf]").parentElement; const ra = a.getBoundingClientRect(), rk = k.getBoundingClientRect();
    return [Math.round((ra.top - rk.top) * 10) / 10, Math.round((rk.right - ra.right) * 10) / 10]; });
  const meister = document.querySelectorAll("img[data-kulisse^=\"meister-\"]").length;
  /* v1.23.2: Figurenhoehe - Scheitel des Bildes ueber der Bodenkante, auf dem Schirm */
  const hoehen = [...document.querySelectorAll("[data-boden]")].map((w) => {
    const img = w.querySelector("img"); if (!img) return null; const r = img.getBoundingClientRect();
    const sv = w.querySelector("svg[data-gg=\"sockelband\"]"); if (!sv) return null; const vb = sv.viewBox.baseVal; const sr = sv.getBoundingClientRect();
    const p = sv.querySelector("path"); const bb = p.getBBox(); const bodenPx = sr.top + (bb.y + bb.height) / vb.height * sr.height;
    const st = getComputedStyle(w).getPropertyValue("--skala"); return Math.round((bodenPx - r.top) * 10) / 10;   /* r.top ist der Kastenrand, nicht der Scheitel - reicht als Vergleichsmass, da alle Bilder oben Luft haben */
  }).filter((v) => v !== null);
  const ecken = document.querySelectorAll("[data-ecke]").length;
  return { kacheln, stufen, grau, farbig, toene, meisterMitRohr, baender, boden, namen, talente, teller, abz, meister, hoehen, ecken };
});
const kopfH = [...new Set(kopf.kacheln.map((h) => String(h).split("|")[0]))];
const rohrVersatz = kopf.kacheln.map((h) => String(h).split("|")[1]).filter((x) => x !== undefined).map(Number);
ok(`die Stufe steht in jeder Kachel gleich hoch (${kopf.kacheln.length} Kacheln, ${kopfH.join("/")} px unter der Kante)`, kopf.kacheln.length >= 50 && kopfH.length === 1);
/* v1.17.0: das Band sitzt im Sockel - das Rohr in der Kopfzeile gibt es nur
   noch fuer Figuren ohne Sockelmessung; die Kopfzeilenprobe misst nur noch die Stufe */
ok(`kein Rohr mehr in der Kopfzeile, wo ein Sockelband ist (${rohrVersatz.length} Rohre)`, rohrVersatz.length === 0);
const maxDx = Math.max(...kopf.stufen.map((s) => Math.abs(s.dx))), maxDy = Math.max(...kopf.stufen.map((s) => Math.abs(s.dy)));
ok(`die Stufenziffer sitzt mittig im Kreis (${kopf.stufen.length} gemessen, max. Versatz ${maxDx.toFixed(2)}/${maxDy.toFixed(2)} px)`, kopf.stufen.length > 0 && maxDx <= 1 && maxDy <= 1);
ok(`was noch nicht zu einem gehoert, steht in Graustufen (${kopf.grau.length} grau, ${kopf.farbig.length} farbig)`, kopf.grau.length > 0 && kopf.grau.every((f) => /grayscale/.test(f)) && kopf.farbig.every((f) => f === "none"));
ok(`Monster tragen einen Farbschleier im eigenen Ton (${kopf.toene})`, kopf.toene >= 12);
ok(`Grossmeister und Monster tragen das Sockelband wie alle anderen (${kopf.meisterMitRohr})`, kopf.meisterMitRohr >= 25);
ok(`jedes Sockelband liegt deckungsgleich auf seinem Bild (${kopf.baender.length} Baender, max. ${Math.max(...kopf.baender).toFixed(2)} px Abweichung)`, kopf.baender.length >= 30 && kopf.baender.every((d) => d <= 0.5));
{
  const b = kopf.boden; const mn = Math.min(...b), mx = Math.max(...b);
  ok(`alle Figuren stehen auf derselben Bodenlinie (${b.length} gemessen, ${mn}-${mx} px ueber der Kachelkante, Spanne ${(mx - mn).toFixed(1)} px)`, b.length >= 30 && mx - mn <= 2.5);
}
{
  const n = [...new Set(kopf.namen)];
  ok(`die Namenszeile sitzt in jeder Kachel gleich hoch (${kopf.namen.length} Kacheln, ${n.join("/")} px unter der Kante)`, kopf.namen.length >= 50 && n.length === 1);
  ok(`- auch wenn Talente in der Spalte haengen (${kopf.talente} Talentzeichen im Hofstaat)`, kopf.talente >= 2);
}
{
  const t = kopf.teller.filter((w) => w > 0); const mn = Math.min(...t), mx = Math.max(...t);
  ok(`alle Teller sind gleich breit (${t.length} gemessen, ${mn}-${mx} px, Spanne ${(mx - mn).toFixed(1)} px; Drache ausgenommen)`, t.length >= 30 && (mx - mn) <= 14);
  const o = [...new Set(kopf.abz.map((x) => x[0]))], r = [...new Set(kopf.abz.map((x) => x[1]))];
  ok(`das Abzeichen hat ueberall denselben Abstand nach oben und rechts (${o.join("/")} / ${r.join("/")} px)`, o.length === 1 && r.length === 1 && Math.abs(o[0] - r[0]) <= 1);
}
ok(`jede Kachel traegt vier Eckverzierungen (${kopf.ecken} gemessen)`, kopf.ecken >= 52 * 4);
const deckungen = [...new Set(gemessen.map((g) => g.deckung))];
ok(`die Kulisse ist deutlich zu sehen, aber nicht ueber der Figur (Deckung ${deckungen.join("/")})`, deckungen.every((d) => Number(d) >= 0.5 && Number(d) < 1));
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
