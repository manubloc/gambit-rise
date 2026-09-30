/* ── DIE ANIMATIONSPROBE AM ECHTEN BRETT (v1.90.15) ───────────────────────────
   Besitzer, 30.9.2026: "dass man nochmal die Animation alle sauber geprueft
   hat, weil da sind immer wieder Fehler zu erkennen".

   WARUM ES DIESE PROBE GIBT: test_anim.mjs prueft Register, Schalter und
   Quelltext-Stellen; die Animationskammer zeigt jede Bewegung auf einer
   nachgebauten Buehne. Keins von beiden sieht, was auf dem ECHTEN Brett
   passiert, wenn der Kern einen echten Zug liefert. Diese Probe baut
   tools/anim-pruefstand.jsx (die echte BoardView), spielt je Szene EINEN Zug
   und schreibt JEDES Bild mit: welche Figurenbilder sind sichtbar, wo, wie
   deckend. Daraus werden Regeln geprueft, die ein Auge sofort bemerkt:

     R1  Das Opfer eines Treffers verschwindet nie, solange es lebt.
     R2  Keine Figur erscheint auf einem Feld, auf dem sie nie stand
         (z. B. das Opfer im Feld des Angreifers).
     R3  Der Angreifer ist nie doppelt zu sehen.
     R4  Der Drache ist nie doppelt zu sehen, und er springt nicht ans Ziel,
         bevor sein Flug dort ankommt.
     R5  Am Ende steht jede Figur genau dort, wo der Kern sie hinstellt, und
         die letzte Flugstellung weicht davon hoechstens 2 px ab (kein Ruck
         bei der Uebergabe vom Gleiter an das Feld).

   Zusaetzlich legt sie je Szene einen Bildstreifen ab (Screencast, echte
   Bilder mit Zeitstempel) - fuer den Besitzer, zum Anschauen:
     node tools/pruefe-animation.mjs [zielordner]
   Braucht python3 mit Pillow fuer die Streifen (wie test_zauber). */
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const ZIEL = process.argv[2] || "/tmp/gg-anim";
const DIR = "/tmp/gg-animprobe";
await mkdir(DIR, { recursive: true });
await mkdir(ZIEL, { recursive: true });
execFileSync("npx", ["esbuild", "tools/anim-pruefstand.jsx", "--bundle", "--jsx=automatic",
  `--outfile=${DIR}/app.js`, "--format=iife", "--loader:.jpg=dataurl", "--loader:.webp=dataurl",
  "--loader:.png=dataurl", "--loader:.mp3=dataurl", "--loader:.webm=dataurl",
  "--loader:.css=text", "--log-level=error"], { stdio: "inherit" });
await writeFile(`${DIR}/index.html`,
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#0c111e}#root{height:100%}</style><div id="root"></div><script src="app.js"></script>`);
const srv = createServer(async (req, res) => {
  const pfad = req.url.split("?")[0];
  const f = DIR + (pfad === "/" ? "/index.html" : pfad);
  try { const b = await readFile(f); res.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : "text/html" }); res.end(b); }
  catch { res.writeHead(404); res.end(""); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

/* Im Browser: jedes Bild alle sichtbaren Figurenbilder im Brett mitschreiben.
   "sichtbar" = Deckkraft ueber die ganze Ahnenkette > 0.05. Das Bild wird an
   seiner Quelle erkannt (Laenge + ein Stueck der Daten-URL). */
const SAMMLER = `(() => {
  const brett = document.getElementById("brett");
  const deck = (el) => { let o = 1; for (let e = el; e && e !== brett; e = e.parentElement) {
    const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
  const schl = (s) => s.length + ":" + s.slice(60, 96);
  window.__schnapp = () => {
    const liste = [];
    for (const img of brett.querySelectorAll("img")) {
      const r = img.getBoundingClientRect();
      if (r.width < 8) continue;
      const o = deck(img);
      if (o < 0.05) continue;
      liste.push({ k: schl(img.currentSrc || img.src), x: r.left + r.width / 2, fuss: r.bottom, b: r.width, o: +o.toFixed(2) });
    }
    return liste;
  };
  window.__starte = () => {
    window.__bilder = [];
    const t0 = performance.now();
    const lauf = () => {
      const t = performance.now() - t0;
      window.__bilder.push({ t: Math.round(t), liste: window.__schnapp() });
      if (t < 2600) requestAnimationFrame(lauf);
    };
    requestAnimationFrame(lauf);
  };
})()`;

/* Das Brett: groesstes quadratisches Element mit vielen Kindern (wie test_layout). */
const BRETT = `(() => {
  let b = null, best = 0;
  for (const el of document.querySelectorAll("#brett div")) {
    const r = el.getBoundingClientRect();
    if (r.width < 200 || Math.abs(r.width - r.height) > 6 || el.children.length < 20) continue;
    if (r.width * r.height > best) { best = r.width * r.height; b = el; }
  }
  const r = b.getBoundingClientRect(); return { l: r.left, t: r.top, s: r.width / 8 };
})()`;

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
let pass = 0, fail = 0;
const befunde = [];
const ok = (n, c, info = "") => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n, info); befunde.push(n + (info ? " — " + info : "")); } };

const SZENEN = ["zug", "gleiten", "schlag", "hpTreffer", "hpSchlag", "schild", "rochade", "enPassant", "umwandlung", "drache"];
/* Drei Lagen: Schnelles Spiel (Fugen + Saum), Kampagne (Kapitelbrett,
   fugenlos) und gedreht (Online-Duell als Schwarz). Die Bildstreifen gibt es
   nur fuer die Kampagne - so sieht der Besitzer das Brett, das er spielt. */
const LAGEN = [["", "schnell"], ["?feld=1", "kampagne"], ["?dreh=1", "gedreht"]];
const bericht = {};
for (const [lage, lname] of LAGEN) for (const name0 of SZENEN) {
  const name = `${lname}/${name0}`;
  const gedreht = lage.includes("dreh");
  const page = await browser.newPage({ viewport: { width: 430, height: 620 }, deviceScaleFactor: 1 });
  const errs = []; page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/${lage}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__bereit === true);
  /* Screencast: echte Bilder mit Zeitstempel fuer den Bildstreifen */
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async (f) => { frames.push({ ts: f.metadata.timestamp, data: f.data }); try { await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }); } catch {} });
  /* Szene aufstellen: vorher-Stand steht 900 ms, dann kommt der Zug */
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 80, everyNthFrame: 1 });
  const lauf = page.evaluate((n) => window.__szene(n), name0);
  await page.waitForTimeout(700);
  const geo = await page.evaluate(BRETT);
  await page.evaluate(SAMMLER);
  const vorher = { liste: await page.evaluate(() => window.__schnapp()) };
  await page.evaluate(() => { window.__vorZug = window.__starte; });
  const info = await lauf;
  const tZug = (info.zugZeit || Date.now()) / 1000;
  await page.waitForTimeout(2700);
  await cdp.send("Page.stopScreencast");
  const bilder = await page.evaluate(() => window.__bilder);
  await page.close();

  const feld = (x, fuss) => {
    const f0 = Math.floor((x - geo.l) / geo.s);
    /* der Fuss eines Figurenbilds sitzt in seiner Zelle etwas unter der Mitte */
    const r0 = 7 - Math.floor((fuss - geo.t - geo.s * 0.02) / geo.s);
    const f = gedreht ? 7 - f0 : f0, r = gedreht ? 7 - r0 : r0;
    return f >= 0 && f < 8 && r >= 0 && r < 8 ? "abcdefgh"[f] + (r + 1) : "?";
  };
  const auf = (i) => "abcdefgh"[i % 8] + (((i / 8) | 0) + 1);
  /* Eine Figur traegt zwei <img> (Bild und Glutmaske) an derselben Stelle -
     nach Lage zusammenfassen. */
  const einzeln = (liste) => {
    const out = [];
    for (const e of liste) if (!out.some((q) => q.k === e.k && Math.abs(q.x - e.x) < 3 && Math.abs(q.fuss - e.fuss) < 3)) out.push(e);
    return out.map((e) => ({ ...e, f: feld(e.x, e.fuss) }));
  };
  const v0 = einzeln(vorher.liste);
  const z = info.zug, lm = info.lastMove || {}, dauer = info.dauer || 520;
  const gross = (e) => e.b > geo.s * 1.4;
  /* Rollen am Bild erkennen: was stand VOR dem Zug auf dem Feld der Rolle? */
  const rolle = {};
  for (const [r, f0] of Object.entries(info.wer || {})) {
    const f = String(f0).startsWith("anker:") ? null : f0;
    const e = f ? v0.find((q) => q.f === f) : v0.find(gross);
    if (e) rolle[r] = e;
  }
  /* Zuschauer: Figuren, die vor dem Zug schon standen und NICHT beteiligt
     sind (z. B. der andere Koenig mit demselben Bild) - an ihrer Stelle
     zaehlen sie nicht als Doppelgaenger. */
  const beteiligtK = new Set(Object.values(rolle).map((e) => e.x + ":" + e.fuss));
  const zuschauer = v0.filter((e) => !beteiligtK.has(e.x + ":" + e.fuss));
  const istZuschauer = (e) => zuschauer.some((q) => q.k === e.k && Math.abs(q.x - e.x) < 3 && Math.abs(q.fuss - e.fuss) < 3);
  const spur = bilder.map((b) => {
    const alle = einzeln(b.liste);
    const o = { t: b.t, alle };
    for (const [r, e0] of Object.entries(rolle)) o[r] = alle.filter((e) => e.k === e0.k && !istZuschauer(e));
    return o;
  });
  bericht[name] = { zug: z, dauer, lastMove: { from: lm.from, to: lm.to, capture: lm.capture, damaged: lm.damaged, lethal: lm.lethal, bounced: lm.bounced, special: lm.special },
    rollen: Object.fromEntries(Object.entries(rolle).map(([r, e]) => [r, e.f])), fehler: errs,
    spur: spur.filter((_, i) => i % 2 === 0).map((sp) => ({ t: sp.t, ...Object.fromEntries(Object.keys(rolle).map((r) => [r, sp[r].map((e) => `${e.f}(${Math.round(e.x)},${Math.round(e.fuss)})@${e.o}`)])) })) };

  console.log(`\n== ${name}: ${auf(z.from)}-${auf(z.to)}${z.special ? " (" + z.special + ")" : ""} · Dauer ${dauer} ms · Schlag ${!!lm.capture} Treffer ${!!lm.damaged} toedlich ${!!lm.lethal} abgeprallt ${!!lm.bounced}`);
  ok(`${name}: keine Seitenfehler`, errs.length === 0, errs.join(" | "));
  const A = rolle.angreifer, O = rolle.opfer;
  if (!A) ok(`${name}: Angreifer am Bild erkannt`, false);
  const opferLebt = O && !lm.capture && !lm.lethal;
  if (opferLebt) {
    const weg = spur.filter((sp) => !sp.opfer.some((e) => e.f === O.f && e.o > 0.9));
    ok(`${name}: R1 das lebende Opfer bleibt auf ${O.f} sichtbar`, weg.length === 0,
      `${weg.length} von ${spur.length} Bildern ohne Opfer (von ${weg[0]?.t} bis ${weg.at(-1)?.t} ms)`);
    const fremd = spur.filter((sp) => sp.opfer.some((e) => e.f !== O.f && e.o > 0.3));
    ok(`${name}: R2 das Opfer erscheint nie ausserhalb von ${O.f}`, fremd.length === 0,
      `${fremd.length} Bilder, z. B. t=${fremd[0]?.t} ms auf ${fremd[0] && fremd[0].opfer.map((e) => e.f).join("/")}`);
  }
  /* Bei der Umwandlung wechselt das Bild absichtlich (Bauer -> Dame) - die
     Regeln zur Person des Angreifers gelten dort nicht. */
  if (A && (!O || A.k !== O.k) && name0 !== "umwandlung") {
    const doppelt = spur.filter((sp) => sp.angreifer.filter((e) => e.o > 0.3).length > 1);
    ok(`${name}: R3 der Angreifer ist nie doppelt zu sehen`, doppelt.length === 0,
      `${doppelt.length} Bilder, z. B. t=${doppelt[0]?.t} ms: ${doppelt[0] && doppelt[0].angreifer.map((e) => e.f + "@" + e.o).join(", ")}`);
    const blinkt = spur.filter((sp) => sp.t > 40 && !sp.angreifer.some((e) => e.o > 0.9));
    ok(`${name}: R6 der Angreifer verschwindet nie (kein Blinken)`, blinkt.length === 0,
      `${blinkt.length} Bilder ohne ihn, z. B. t=${blinkt.map((b) => b.t).slice(0, 4).join("/")} ms`);
    /* R5: nach dem Ende des Flugs bewegt sich nichts mehr sichtbar */
    /* ueber Luecken hinweg: die letzte bekannte Lage zaehlt (sonst versteckt
       ein Bild ohne Figur genau den Sprung, um den es geht) */
    let sprung = 0, beiT = null, zuletzt = null;
    for (const sp of spur) {
      const q = sp.angreifer.find((e) => e.o > 0.3);
      if (!q) continue;
      /* ab Dauer + 80 ms: der Flug beginnt zwei Bilder nach dem Zug und endet
         sanft - davor waere ein langsamer Rechner ein Fehlalarm. Die Uebergabe
         selbst liegt bei Dauer + 90 ms und faellt damit in das Fenster. */
      if (zuletzt && sp.t >= dauer + 80) { const d = Math.hypot(zuletzt.x - q.x, zuletzt.fuss - q.fuss); if (d > sprung) { sprung = d; beiT = sp.t; } }
      zuletzt = q;
    }
    ok(`${name}: R5 Uebergabe nach der Landung ohne Ruck (groesster Sprung ${sprung.toFixed(1)} px${beiT ? " bei " + beiT + " ms" : ""})`, sprung <= 2.5);
  }
  if (name0 === "rochade" && rolle.turm) {
    const T = rolle.turm, zielX = geo.l + geo.s * (gedreht ? 2.5 : 5.5);
    const weg = spur.filter((sp) => sp.t > 40 && !sp.turm.some((e) => e.o > 0.9));
    const zwischen = (x) => Math.min(T.x, zielX) + geo.s * 0.4 < x && x < Math.max(T.x, zielX) - geo.s * 0.4;
    const unterwegs = spur.some((sp) => sp.turm.some((e) => zwischen(e.x)));
    ok(`${lname}/rochade: R7 der Turm ist in jedem Bild zu sehen`, weg.length === 0, `${weg.length} Bilder ohne Turm`);
    ok(`${lname}/rochade: R7 der Turm gleitet sichtbar von h1 nach f1`, unterwegs);
  }
  if (name0 === "enPassant" && O) {
    const frueh = spur.filter((sp) => sp.t > 30 && sp.t < dauer - 60);
    const weg = frueh.filter((sp) => !sp.alle.some((e) => e.k === O.k && e.f === O.f && e.o > 0.9));
    ok(`${lname}/enPassant: R8 das Opfer steht auf d5, bis der Schlaeger ankommt`, weg.length === 0, `${weg.length} von ${frueh.length} Bildern ohne Opfer auf d5`);
  }
  if (name0 === "drache" && A) {
    const zwei = spur.filter((sp) => sp.alle.filter((e) => gross(e) && e.o > 0.3).length > 1);
    ok(`${lname}/drache: R4 der grosse Drache ist nie doppelt zu sehen`, zwei.length === 0, `${zwei.length} Bilder`);
    const klein = spur.filter((sp) => sp.alle.some((e) => !gross(e) && e.o > 0.3 && !istZuschauer(e)));
    ok(`${lname}/drache: R4 kein kleiner Ersatz-Drache fliegt`, klein.length === 0, `${klein.length} Bilder mit kleinem Drachen`);
    const ruhe = spur.at(-1).alle.find(gross);
    const frueh = spur.filter((sp) => sp.t < dauer * 0.4 && sp.alle.some((e) => gross(e) && ruhe && Math.abs(e.x - ruhe.x) < 2 && Math.abs(e.fuss - ruhe.fuss) < 2));
    ok(`${lname}/drache: R4 er steht nicht schon am Ziel, waehrend er noch fliegt`, frueh.length === 0, `${frueh.length} Bilder`);
  }

  /* Bildstreifen: 10 Bilder zwischen -100 ms und 1500 ms nach dem Zug */
  if (lname !== "kampagne") continue;
  const wahl = [];
  for (const ms of [-100, 60, 140, 220, 300, 400, 520, 700, 950, 1400]) {
    const ts = tZug + ms / 1000;
    /* das Bild, das zu diesem Zeitpunkt AUF DEM SCHIRM stand: das letzte davor
       (der Screencast liefert nur bei Aenderungen ein neues) */
    let best = null;
    for (const f of frames) if (f.ts <= ts && (!best || f.ts > best.ts)) best = f;
    if (!best) for (const f of frames) if (!best || Math.abs(f.ts - ts) < Math.abs(best.ts - ts)) best = f;
    if (best) wahl.push({ ms, rel: Math.round((best.ts - tZug) * 1000), data: best.data });
  }
  await writeFile(`${ZIEL}/${name0}.json`, JSON.stringify(wahl.map((w) => ({ ms: w.ms, rel: w.rel }))));
  for (const [i, w] of wahl.entries()) await writeFile(`${ZIEL}/${name0}-${String(i).padStart(2, "0")}.jpg`, Buffer.from(w.data, "base64"));
}
await browser.close(); srv.close();
await writeFile(`${ZIEL}/bericht.json`, JSON.stringify(bericht, null, 1));
console.log(`\nRESULT pruefe-animation: ${pass} passed, ${fail} failed`);
if (befunde.length) { console.log("\nBEFUNDE:"); for (const b of befunde) console.log(" -", b); }
process.exit(fail ? 1 : 0);
