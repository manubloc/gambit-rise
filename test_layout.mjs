// LAYOUT TEST — the only suite that measures REAL geometry.
//
// STAND 26.9.2026 (v1.86.0) — WARUM DIESE SUITE NICHT IN DER KETTE HAENGT:
// Sie lag verwaist da, in keinem npm-Skript, und war nicht mehr lauffaehig
// (die Loader fuer .webm/.mp3 fehlten, 53 esbuild-Fehler). Das ist jetzt
// behoben, sie laeuft und misst wieder: 12 Proben gruen, VIER rot, und zwar
// ueberall dieselbe - "the board rests vertically centred":
//     iPhone 390x844   off by 256px
//     Android 360x800  off by 252px
//     large phone      off by 290px
//     tablet 768x1024  off by  44px
// Das ist KEIN Befund gegen die App, sondern eine offene DESIGNFRAGE. Die
// Erwartung stammt aus der Zeit, als das Brett nachweislich falsch sass (437px
// unter dem Himmel, 47px ueber dem Boden - siehe unten). Seither liegt unter
// dem Brett bewusst das Talentband (v1.55.0; drive3 messt es 6px darunter) und
// darueber die Kampfleiste - ein vertikal zentriertes Brett kann es damit auf
// einem Telefon gar nicht mehr geben. Auf dem Tablet, wo Platz ist, sind es
// nur noch 44px.
// ZU ENTSCHEIDEN (Besitzer): soll das Brett auf Telefonen zentriert sitzen -
// dann ist das Layout zu aendern - oder gilt "Brett oben, Band darunter"? Dann
// bekommt diese Probe eine neue Erwartung und darf in die Kette. Bis dahin
// laeuft sie von Hand: node test_layout.mjs
//
// SSR tests can prove what renders; they cannot prove where it lands. This one
// mounts the live match screen in headless Chromium at real device sizes and
// measures the board's distance to the top and bottom of the viewport. It
// exists because the board sat 437px below the sky and 47px above the floor
// for weeks while every other suite stayed green.
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const DIR = "/tmp/gg-layout";
await mkdir(DIR, { recursive: true });
/* v1.86.0: DIE LOADER FUER KLANG FEHLTEN. Diese Suite lag verwaist da - in
   keinem npm-Skript eingetragen - und war nicht mehr lauffaehig: seit die
   Klaenge als .webm/.mp3 dazugekommen sind, brach esbuild mit "No loader is
   configured for .webm files" ab (53 Fehler). Wer sie aufrief, sah einen
   Haufen esbuild-Ausgabe und legte sie beiseite. Dasselbe hatte "npm run
   preview" erwischt. Jetzt tragen beide dieselbe Loader-Liste wie smoke
   und ui. */
execFileSync("npx", ["esbuild", "board_harness.jsx", "--bundle", "--jsx=automatic",
  `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
  "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl",
  "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`,
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#0c111e;font-family:system-ui}#root{height:100%}</style><div id="root"></div><script src="app.js"></script>`);

const srv = createServer(async (req, res) => {
  const f = DIR + (req.url === "/" ? "/index.html" : req.url.split("?")[0]);
  try { const b = await readFile(f); res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html" }); res.end(b); }
  catch { res.writeHead(404); res.end(""); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

const PROBE = `(() => {
  let b = null, best = 0;
  for (const el of document.querySelectorAll("div")) {
    const r = el.getBoundingClientRect();
    if (r.width < 120 || Math.abs(r.width - r.height) > 6 || el.children.length < 20) continue;
    if (r.width * r.height > best) { best = r.width * r.height; b = el; }
  }
  if (!b) return null;
  const r = b.getBoundingClientRect();
  return { above: Math.round(r.top), below: Math.round(innerHeight - r.bottom), size: Math.round(r.width),
    wide: Math.round(innerWidth - r.width) };
})()`;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [w, h, name] of [[390, 844, "iPhone"], [360, 800, "Android"], [414, 896, "large phone"], [768, 1024, "tablet"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e).slice(0, 100)));
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2600);
  const m = await page.evaluate(PROBE);
  ok(`${name} ${w}x${h}: the match screen renders a board`, !!m && m.size > 100);
  if (m) {
    const off = Math.abs(m.above - m.below);
    ok(`${name}: the board rests vertically centred (off by ${off}px)`, off <= 8);
    ok(`${name}: the board fills its width sensibly`, m.size > w * 0.8);
  }
  ok(`${name}: no script errors`, errs.length === 0 || console.log("     ", errs[0]));
  await page.close();
}

// ── THE REGISTER: captions, corner sigils, one hall ──────────────────────────
// Proven here rather than in SSR because the chronicle waits for its paintings
// before it draws a single tile. Three things were asked for and kept slipping:
// the house caption belongs UNDER the name, the tile's corner belongs to the
// piece's own vector figure, and the masters belong in one hall.
{
  execFileSync("npx", ["esbuild", "layout_harness.jsx", "--bundle", "--jsx=automatic",
    `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
    "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
  const page = await browser.newPage({ viewport: { width: 430, height: 900 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const txt = document.body.innerText;
    // a tile = a box holding an <img> or <svg> and a name line
    const tiles = [...document.querySelectorAll("div")].filter((d) => {
      const b = d.getBoundingClientRect();
      return b.width > 60 && b.width < 190 && b.height > 70 && d.querySelector("svg,img");
    });
    let withSigil = 0, captionBelow = 0, captionRight = 0;
    for (const tl of tiles) {
      const box = tl.getBoundingClientRect();
      const svg = tl.querySelector(":scope > span > svg");
      if (svg) {
        const s = svg.getBoundingClientRect();
        if (s.top - box.top < box.height * 0.35 && box.right - s.right < box.width * 0.35) withSigil++;
      }
      const lines = [...tl.querySelectorAll("div")].filter((d) => d.children.length === 0 && d.innerText.trim());
      if (lines.length >= 2) {
        const a = lines[0].getBoundingClientRect(), b2 = lines[1].getBoundingClientRect();
        if (b2.top >= a.bottom - 1) captionBelow++; else captionRight++;
      }
    }
    return { tiles: tiles.length, withSigil, captionBelow, captionRight,
      masters: /MEISTER & GROSSMEISTER/i.test(txt),
      oldHeads: ["Golems", "Bestien", "Schlangen", "Schemen", "Tyrannen"].filter((h) => new RegExp("^" + h + "$", "m").test(txt)) };
  });
  ok(`the register draws its tiles (${r.tiles})`, r.tiles > 15);
  ok(`tiles carry a vector figure in the corner (${r.withSigil})`, r.withSigil > 10);
  ok(`captions sit UNDER the name, never beside it (${r.captionBelow} below / ${r.captionRight} beside)`, r.captionRight === 0 && r.captionBelow > 0);
  ok("the masters stand in one hall", r.masters);
  ok("the five family headings are gone", r.oldHeads.length === 0 || console.log("     ", r.oldHeads.join(", ")));
  await page.close();
}


// ── NO TAG EVER SITS BESIDE A NAME ──────────────────────────────────────────
// Asked for repeatedly, and geometry is the only honest answer: for every
// figure name on screen, nothing small may share its line to the right within
// the same card. Checked across all four rooms of the court and in the opened
// figure sheet.
{
  execFileSync("npx", ["esbuild", "court_harness.jsx", "--bundle", "--jsx=automatic",
    `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
    "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
  const page = await browser.newPage({ viewport: { width: 430, height: 1100 } });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const SCAN = `(() => {
    const out = [];
    for (const el of document.querySelectorAll("div,span")) {
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 14) continue;
      const txt = el.textContent.trim();
      // a NAME is a leaf of real text — not a whole tile, and not the "???"
      // placeholder a tile shows for a figure you have never met
      if (!txt || txt.length > 40 || el.children.length > 1) continue;
      if (/^[?\s]+$/.test(txt)) continue;
      // a NAME carries letters and more than a syllable — this rules out the
      // numerals inside the value orbs, whose labels are MEANT to sit beside
      // them ("3 Angriffsstärke"), and arrows or other marks
      if (!/[A-Za-z\u00C0-\u024F]{3}/.test(txt)) continue;
      const r = el.getBoundingClientRect(); if (!r.height) continue;
      // the card this name belongs to: the nearest ancestor under 260px wide
      let card = el.parentElement, hops = 0;
      while (card && hops < 5 && card.getBoundingClientRect().width > 260) { card = card.parentElement; hops++; }
      if (!card) continue;
      for (const o of card.querySelectorAll("div,span")) {
        // a caption may itself hold a small mark beside its text (the house
        // diamond) — skipping every element with children was the hole that let
        // "Läufer Freie Figur" through for weeks
        if (o === el || o.contains(el) || el.contains(o) || o.children.length > 2) continue;
        if (parseFloat(getComputedStyle(o).fontSize) > 12.5) continue;
        const t2 = o.textContent.trim(); if (!t2 || t2.length > 30 || /^[?\s]+$/.test(t2)) continue;
        const b = o.getBoundingClientRect(); if (!b.height) continue;
        if (Math.abs(b.top - r.top) < r.height * 0.6 && b.left >= r.right - 6)
          out.push(txt.slice(0, 20) + " ← " + t2.slice(0, 20));
      }
    }
    return out;
  })()`;

  for (const room of ["tree", "formation", "gear", "chron"]) {
    await page.evaluate((x) => document.getElementById("tab-" + x)?.click(), room);
    await page.waitForTimeout(1500);
    const hits = await page.evaluate(SCAN);
    ok(`${room}: no caption sits beside a name`, hits.length === 0 || console.log("     ", hits.slice(0, 4).join(" | ")));
  }
  // and inside the opened figure sheet
  await page.evaluate(() => document.getElementById("tab-tree")?.click());
  await page.waitForTimeout(1500);
  const opened = await page.evaluate(() => {
    const t = [...document.querySelectorAll("div")].filter((d) => { const b = d.getBoundingClientRect();
      return b.width > 60 && b.width < 190 && b.height > 70 && d.querySelector("img"); });
    const h = t.find((d) => !/\?\?\?/.test(d.textContent));
    if (h) { h.click(); return true; } return false;
  });
  await page.waitForTimeout(900);
  ok("a figure sheet opens on tap", opened);
  const sheetHits = await page.evaluate(SCAN);
  ok("the opened sheet keeps its caption under the name",
    sheetHits.length === 0 || console.log("     ", sheetHits.slice(0, 4).join(" | ")));

  // THE LINE BREAK, MEASURED DIRECTLY. Name and house were both inline-flex for
  // weeks, so they flowed onto ONE line ("Läufer Freie Figur") — a pairing the
  // scan above missed because the house line carries a small mark of its own.
  // This looks straight at the two boxes instead.
  const sheets = [];
  for (let i = 0; i < 5; i++) {
    const opened2 = await page.evaluate((n) => {
      const t = [...document.querySelectorAll("div")].filter((d) => { const b = d.getBoundingClientRect();
        return b.width > 60 && b.width < 190 && b.height > 70 && d.querySelector("img"); });
      const list = t.filter((d) => !/\?\?\?/.test(d.textContent));
      if (list[n]) { list[n].click(); return true; } return false;
    }, i);
    if (!opened2) break;
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      for (const el of document.querySelectorAll("div.gg-serif")) {
        if (Math.round(parseFloat(getComputedStyle(el).fontSize)) !== 17) continue;
        const nx = el.nextElementSibling; if (!nx) continue;
        const a = el.getBoundingClientRect(), b = nx.getBoundingClientRect();
        if (!a.height || !b.height) continue;
        return { name: el.textContent.trim().slice(0, 16), below: b.top >= a.bottom - 1 };
      }
      return null;
    });
    if (m) sheets.push(m);
    await page.evaluate(() => { const c = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "close"); c && c.click(); });
    await page.waitForTimeout(300);
  }
  ok(`figure sheets were opened and measured (${sheets.length})`, sheets.length >= 3);
  const beside = sheets.filter((x) => !x.below).map((x) => x.name);
  ok("every sheet breaks the line before its house",
    beside.length === 0 || console.log("     ", beside.join(", ")));

  // AND NEVER A QUESTION MARK WHERE A FIGURE BELONGS
  await page.evaluate(() => document.getElementById("tab-tree")?.click());
  await page.waitForTimeout(2500);
  const art = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll("div")].filter((d) => { const b = d.getBoundingClientRect();
      return b.width > 60 && b.width < 190 && b.height > 70 && (d.querySelector("img") || d.querySelector("svg")); });
    let empty = 0;
    for (const t of tiles) {
      const hasArt = t.querySelector("img") || t.querySelector("svg");
      const lone = t.innerText.split("\n").some((l) => l.trim() === "?");
      if (!hasArt || lone) empty++;
    }
    return { tiles: tiles.length, empty };
  });
  ok(`every tile carries a figure, none a question mark (${art.tiles} tiles)`, art.tiles > 20 && art.empty === 0);
  await page.close();
}

await browser.close(); srv.close();
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
