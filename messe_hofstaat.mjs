// ── LIVE-MESSUNG DES FIGUREN-REITERS (v1.0.65) ──────────────────────────────
// Vier Besitzerbefunde, vier Messungen - am lebenden DOM, nicht am Quelltext:
//   1. Sind Bauer und Gambit in der Aufstellung gleich gross und gleich hoch?
//   2. Sitzen die Figuren im Hofstaat wirklich mittig in ihrer Kachel?
//   3./4. Wie sehen Figurenblatt und Monsterblatt im Kopf aus (Rahmen? Masse?)
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
page.on("console", (m) => { if (m.type() === "error" && !/duell\.gambitrise|ERR_TUNNEL|ERR_FAILED/.test(m.text())) fehler.push(m.text().slice(0, 160)); });

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

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await klick("Erstellen");
await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("messer@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen");
await page.waitForTimeout(2500);
await klick("Neuer Spielstand");
await page.waitForTimeout(2500);
await wegKlicken();

/* Alle Figuren freischalten, damit der Hofstaat voll ist und die Blaetter
   aufgehen. Beide Ablagen patchen (Profil UND Spielstand-Punkt). */
await page.evaluate(() => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.gold = 9000; p.sp = 60;
    p.unlocked = ["gambit", "pawn", "knight", "bishop", "rook", "queen", "king"];
    /* v1.0.84-Messung: der Gambit auf Rang II (Level 15) - zeigt der Hofstaat
       dann wirklich gambit-t2? Das ist die Frage, die dreimal "behoben"
       wurde, ohne je am lebenden DOM geprueft zu werden. */
    p.pieces = p.pieces || {}; p.pieces.levels = p.pieces.levels || {};
    p.pieces.levels.gambit = 15;
    p.cleared = p.cleared || {};
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    if (k === "gambit:u::profile" || /^gambit:u::save:/.test(k)) {
      try { const o = JSON.parse(localStorage.getItem(k));
        if (o && typeof o === "object" && "gold" in o) localStorage.setItem(k, patch(localStorage.getItem(k)));
      } catch {}
    }
  }
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await klick("Weiterspielen");
await page.waitForTimeout(2500);
await wegKlicken();

/* In den Hofstaat. Welcher Weg dorthin fuehrt, wird GEZEIGT statt geraten. */
console.log("KNOEPFE:", await page.evaluate(() => [...document.querySelectorAll("button")]
  .map((b) => b.textContent.trim().slice(0, 22)).filter(Boolean).slice(0, 30)));
/* STOLPERSTEIN: der Dock-Knopf "Figuren" fuehrt in die AKADEMIE (Spielweise,
   Chronik), nicht in den Hofstaat. Der Hofstaat liegt unter "Lager"; dort
   heisst der erste Reiter noch einmal "Figuren". Erst Lager, dann Reiter. */
await klick("^Lager$");
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Figuren");
  (b[b.length - 1] || b[0])?.click();
});
await page.waitForTimeout(1800);
console.log("NACH KLICK:", await page.evaluate(() => [...document.querySelectorAll("button")]
  .map((b) => b.textContent.trim().slice(0, 22)).filter(Boolean).slice(0, 30)));
console.log("KACHEL-KANDIDATEN:", await page.evaluate(() => {
  const o = [];
  for (const d of document.querySelectorAll("div")) {
    const cs = getComputedStyle(d); const r = d.getBoundingClientRect();
    if (cs.borderRadius.startsWith("11") && d.querySelector("img") && r.width > 40 && r.width < 200)
      o.push(Math.round(r.width) + "px " + (d.textContent || "").trim().slice(0, 12));
  }
  return o.slice(0, 12);
}));

// ── 1. AUFSTELLUNG: Bauer gegen Held ────────────────────────────────────────
const aufstellung = await page.evaluate(() => {
  const bilder = [...document.querySelectorAll("img")].filter((i) => {
    const r = i.getBoundingClientRect();
    return r.width > 12 && r.height > 12 && /pawn|gambit/.test(i.src);
  });
  return bilder.slice(0, 12).map((i) => {
    const r = i.getBoundingClientRect();
    return { art: /gambit/.test(i.src) ? "gambit" : "pawn",
      b: Math.round(r.width), h: Math.round(r.height),
      unten: Math.round(r.bottom), oben: Math.round(r.top) };
  });
});
console.log("\n── 2. AUFSTELLUNG (Bauer gegen Held) ──");
for (const a of aufstellung)
  console.log(`  ${a.art.padEnd(7)} ${a.b}x${a.h}  Oberkante ${a.oben}  Unterkante ${a.unten}`);
const held = aufstellung.find((a) => a.art === "gambit");
const bauer = aufstellung.find((a) => a.art === "pawn");
const gleich = held && bauer && held.h === bauer.h && held.unten === bauer.unten;
console.log("  gleich gross UND gleich hoch:", gleich ? "JA" : "NEIN"
  + (held && bauer ? ` (Hoehe ${bauer.h} gegen ${held.h}, Unterkante ${bauer.unten} gegen ${held.unten})` : ""));

/* ── v1.0.66: DER KASTEN IST NICHT DIE FIGUR ────────────────────────────────
   Genau hier hat v1.0.65 danebengegriffen. Die Kaesten waren gleich gross
   (121x121, beide gemessen), und der Besitzer sah trotzdem einen groesseren
   Gambit - weil die FIGUR im Kasten von einem eigenen Hoehenfaktor gezeichnet
   wird (paintedFitFor in paintedArt.js). Die Aufstellung zeigt das rohe
   Gemaelde und war darum immer schon gleich; das BRETT wendet den Faktor an.
   Also wird der Faktor hier mitgemessen - er ist die Zahl, die der Besitzer
   auf dem Brett sieht. */
const faktoren = await page.evaluate(async () => {
  try {
    const m = window.__ggFit;
    return m ? { bauer: m.P, held: m.HERO } : null;
  } catch { return null; }
});
console.log("\n── 2e. ZEIGT DER HOFSTAAT DEN RANG? (Gambit auf Level 15 = Rang II) ──");
{
  const bilder = await page.evaluate(() => [...document.querySelectorAll("img")]
    .filter((i) => i.getBoundingClientRect().width > 30 && /gambit/.test(i.src))
    .map((i) => i.src.split("/").pop().slice(0, 40)));
  const uniq = [...new Set(bilder)];
  console.log("  Gambit-Bilder auf der Seite:", uniq.join(" | ") || "KEINE");
  console.log("  Rangbild (t2) dabei:", uniq.some((u) => /gambit-t2/.test(u)) ? "JA" : "NEIN - zeigt noch Rang I");
}
console.log("\n── 2d. STEHEN ALLE FUESSE AUF EINER LINIE? (v1.0.80) ──");
{
  const fuesse = await page.evaluate(() => {
    const aus = [];
    for (const im of document.querySelectorAll("img")) {
      const r = im.getBoundingClientRect();
      if (r.width < 30 || !/painted/.test(im.src)) continue;
      const w = 96, h = Math.max(24, Math.round((im.naturalHeight / im.naturalWidth) * 96));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(im, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      let leer = 0;
      for (let y = h - 1; y >= 0; y--) {
        let voll = false;
        for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 130) { voll = true; break; }
        if (voll) { leer = (h - 1 - y) / h; break; }
      }
      /* wo sitzt der Fuss WIRKLICH auf dem Schirm? */
      const stil = getComputedStyle(im.parentElement);
      const m = stil.transform.match(/matrix\(([^)]+)\)/);
      const ty = m ? Number(m[1].split(",")[5]) : 0;
      aus.push({ name: (im.src.split("/").pop().split(".")[0] || "?").replace("painted-", ""),
        leerProzent: +(leer * 100).toFixed(1), unten: Math.round(r.bottom), ty: +ty.toFixed(1) });
    }
    return aus;
  });
  const gesehen = new Map();
  for (const f of fuesse) if (!gesehen.has(f.name)) gesehen.set(f.name, f);
  const liste = [...gesehen.values()];
  for (const f of liste.slice(0, 10))
    console.log(`  ${f.name.padEnd(12)} Leerraum ${String(f.leerProzent).padStart(4)} %  Versatz ${String(f.ty).padStart(6)} px`);
  const versaetze = liste.map((f) => f.ty);
  const spanne = Math.max(...versaetze) - Math.min(...versaetze);
  console.log(`  ${liste.length} Bilder · Leerraum-Spanne ${(Math.max(...liste.map(f=>f.leerProzent)) - Math.min(...liste.map(f=>f.leerProzent))).toFixed(1)} %`);
  console.log(`  Ausgleich wirkt: Versatz-Spanne ${spanne.toFixed(1)} px (0 = kein Ausgleich sichtbar)`);
}
console.log("\n── 2c. DIE SOCKELKANTE JE FIGUR (v1.0.72, echte Bilder) ──");
{
  /* Dieselbe Messlogik wie sockelmass.js, hier UNABHAENGIG nachgebaut und
     auf die echten, geladenen Gemaelde angewandt - eine zweite Quelle, die
     die erste kontrolliert. */
  const kanten = await page.evaluate(() => {
    const mess = (im) => {
      const w = 96, h = Math.max(24, Math.round((im.naturalHeight / im.naturalWidth) * 96));
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.drawImage(im, 0, 0, w, h);
      const d = g.getImageData(0, 0, w, h).data;
      const breite = [];
      for (let y = 0; y < h; y++) {
        let l = -1, r = -1;
        for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 130) { if (l < 0) l = x; r = x; }
        breite[y] = l < 0 ? 0 : r - l + 1;
      }
      const zone = Math.max(3, Math.round(h * 0.25));
      let sb = 0, boden = -1;
      for (let y = h - 1; y >= h - zone && y >= 0; y--) { if (breite[y] > 0 && boden < 0) boden = y; if (breite[y] > sb) sb = breite[y]; }
      if (boden < 0 || sb < w * 0.1) return null;
      let drin = false;
      for (let y = boden; y >= boden - zone && y >= 0; y--) {
        if (!drin) { if (breite[y] >= sb * 0.97) drin = true; continue; }
        if (breite[y] < sb * 0.95)
          return Math.min(0.24, Math.max(0.06, (boden - y + 1) / h + (h - 1 - boden) / h));
      }
      return null;
    };
    const aus = []; const gesehenSrc = new Set(); const debug = [];
    for (const im of document.querySelectorAll("img")) {
      const r = im.getBoundingClientRect();
      if (r.width > 20) debug.push(Math.round(r.width) + ":" + im.src.split("/").pop().slice(0, 28));
      if (r.width > 20 && /painted/.test(im.src) && !gesehenSrc.has(im.src)) {
        gesehenSrc.add(im.src);
        const roh = im.src.split("/").pop().split(".")[0];
        const name = (roh.match(/painted-([a-z]+)/) || [null, roh])[1];
        try { aus.push({ name, kante: mess(im) }); } catch { aus.push({ name, kante: "FEHLER" }); }
      }
    }
    return { aus, debug: debug.slice(0, 10) };
  });
  console.log("  (Bilder auf der Seite:", kanten.debug.join(" | ") + ")");
  const gesehen = new Set();
  let gut = 0, fallback = 0;
  for (const k of kanten.aus) {
    if (gesehen.has(k.name)) continue; gesehen.add(k.name);
    const wert = k.kante == null ? "Hauswert 12 %" : (k.kante * 100).toFixed(1) + " %";
    console.log(`  ${k.name.padEnd(10)} Kante ${wert}`);
    if (k.kante == null) fallback++; else if (k.kante >= 0.06 && k.kante <= 0.24) gut++;
  }
  console.log(`  vermessen: ${gesehen.size} Figurenbilder, ${gut} in den Grenzen, ${fallback} auf Hauswert`);
}
console.log("\n── 2b. DER HOEHENFAKTOR (was das BRETT zeichnet) ──");
console.log(faktoren
  ? `  Bauer ${faktoren.bauer}  Gambit I ${faktoren.held}  gleich: ${faktoren.bauer === faktoren.held ? "JA" : "NEIN"}`
  : "  (nicht ausgelesen - die Probe in test_ui haelt den Gleichstand fest:\n"
    + "   paintedFitFor P gegen hero/tier 1)");

// ── 2. HOFSTAAT: sitzt die Figur mittig in ihrer Kachel? ────────────────────
const kacheln = await page.evaluate(() => {
  const out = [];
  for (const img of document.querySelectorAll("img")) {
    /* Die Kachel ist der naechste Vorfahr mit dem Kachelradius (11px) - nicht
       einfach der naechste div: der kann das ganze Raster sein. */
    let kachel = img.parentElement;
    while (kachel && !getComputedStyle(kachel).borderRadius.startsWith("11")) kachel = kachel.parentElement;
    if (!kachel) continue;
    const ri = img.getBoundingClientRect(), rk = kachel.getBoundingClientRect();
    if (ri.width < 30 || rk.width < 40 || rk.width > 220) continue;
    if (!/painted|carved|klein/.test(img.src)) continue;
    const name = (kachel.textContent || "").trim().split("\n")[0].slice(0, 14);
    out.push({ name,
      kachelMitte: +(rk.left + rk.width / 2).toFixed(1),
      bildMitte: +(ri.left + ri.width / 2).toFixed(1),
      versatzPx: +((ri.left + ri.width / 2) - (rk.left + rk.width / 2)).toFixed(1),
      versatzProz: +((((ri.left + ri.width / 2) - (rk.left + rk.width / 2)) / rk.width) * 100).toFixed(2),
      kachelBreite: Math.round(rk.width), bildBreite: Math.round(ri.width) });
  }
  return out.slice(0, 14);
});
console.log("\n── 1. HOFSTAAT-KACHELN (Bildmitte gegen Kachelmitte) ──");
for (const k of kacheln)
  console.log(`  ${k.name.padEnd(14)} Kachel ${k.kachelBreite}px  Bild ${k.bildBreite}px  Versatz ${k.versatzPx > 0 ? "+" : ""}${k.versatzPx}px (${k.versatzProz}%)`);
const schief = kacheln.filter((k) => Math.abs(k.versatzProz) > 0.5);
console.log(`  aus der Mitte (>0,5 %): ${schief.length} von ${kacheln.length}`);

// ── 1. AUFSTELLUNG: Bauer gegen Held (eigener Reiter!) ─────────────────────
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Aufstellung");
  b && b.click();
});
await page.waitForTimeout(1600);

console.log("\n── 2f. AUFSTELLUNG: sitzt jedes Bild mittig in seiner Zelle - waagerecht UND senkrecht? (v1.0.87) ──");
{
  const mess = await page.evaluate(() => {
    const zellen = [...document.querySelectorAll("button")].filter((b) =>
      /5\s*\/\s*6/.test(b.getAttribute("style") || "") && b.querySelector("img"));
    return zellen.map((b) => {
      const z = b.getBoundingClientRect(), r = b.querySelector("img").getBoundingClientRect();
      return { dx: +(((r.left + r.right) / 2) - ((z.left + z.right) / 2)).toFixed(1),
               dy: +(((r.top + r.bottom) / 2) - ((z.top + z.bottom) / 2)).toFixed(1),
               h: +r.height.toFixed(1), ueber: +Math.max(r.bottom - z.bottom, z.top - r.top, r.right - z.right, z.left - r.left).toFixed(1) };
    });
  });
  const bauern = mess.slice(0, 8), hinten = mess.slice(8, 16);
  const mx = (a, k) => Math.max(...a.map((m) => Math.abs(m[k])));
  console.log(`  ${mess.length} Zellen · Bauern: dx max ${mx(bauern,"dx")} px, dy max ${mx(bauern,"dy")} px, Hoehe ${bauern[0]?.h} px`);
  console.log(`  hintere Reihe: dx max ${mx(hinten,"dx")} px, dy max ${mx(hinten,"dy")} px, Hoehe ${hinten[0]?.h} px, Ueberlauf max ${Math.max(0,...hinten.map(m=>m.ueber))} px`);
  const gut = mess.length === 16 && mx(hinten,"dx") <= 1 && mx(hinten,"dy") <= 1 && Math.abs((bauern[0]?.h||0) - (hinten[0]?.h||0)) <= 1;
  console.log("  Ergebnis:", gut ? "OK - sechzehn Figuren mittig und gleich hoch" : "NICHT mittig oder ungleich");
}

// ── 3./4. DIE BEIDEN BLATTFORMEN ───────────────────────────────────────────
const blatt = async () => page.evaluate(() => {
  /* Die Karte haengt am Schliessknopf - das ist das einzige eindeutige
     Merkmal. Die groesste Grafik zu nehmen griff daneben: das war der
     Hintergrund der Huelle. */
  const zu = document.querySelector('button[aria-label="close"]');
  if (!zu) return null;
  const karte = zu.parentElement;
  const img = karte.querySelector("img");
  if (!img) return null;
  const ri = img.getBoundingClientRect();
  const platte = img.parentElement;
  const cs = getComputedStyle(platte);
  return { bild: Math.round(ri.width) + "x" + Math.round(ri.height),
    platteRahmen: cs.borderTopWidth + " " + cs.borderTopColor,
    platteGrund: cs.backgroundImage === "none" ? cs.backgroundColor : "Verlauf",
    platteRadius: cs.borderRadius,
    schein: getComputedStyle(img).filter.slice(0, 60) };
});
/* Zurueck in den Hofstaat und eine Figur antippen. */
/* ZWEI KNOEPFE HEISSEN "Figuren": der Reiter im Lager und der Dock-Knopf
   unten, der in die Akademie fuehrt. Der Reiter steht im DOM zuerst. */
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Figuren");
  b[0]?.click();
});
await page.waitForTimeout(1500);
await page.evaluate(() => {
  for (const d of document.querySelectorAll("div")) {
    const r = d.getBoundingClientRect();
    if (r.width > 90 && r.width < 140 && d.querySelector("img") && /Läufer|Turm|Dame/.test(d.textContent)) { d.click(); return; }
  }
});
await page.waitForTimeout(1400);
console.log("\n── 3. FIGURENBLATT (Kopf) ──");
console.log("  Schliessknopf da:", await page.evaluate(() => !!document.querySelector('button[aria-label="close"]')));
console.log("  sichtbare Knoepfe:", await page.evaluate(() => [...document.querySelectorAll("button")]
  .map((b) => b.textContent.trim().slice(0, 18)).filter(Boolean).slice(0, 14)));
console.log(" ", JSON.stringify(await blatt(), null, 0));
await page.keyboard.press("Escape");
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => x.getAttribute("aria-label") === "close"); b && b.click(); });
await page.waitForTimeout(800);

console.log("\n── FEHLER AUF DER SEITE ──");
console.log(fehler.length ? fehler.slice(0, 5) : "  keine");
await browser.close(); srv.close();
process.exit(0);
