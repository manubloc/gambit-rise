/* ══════════════════════════════════════════════════════════════════════════
   BILDFOLGE EINES ZUGES  (v1.5.2)

   Der Besitzer sieht beim Ziehen einen Sprung, "kurz bevor sie ankommen, als
   wuerde da ein Bild geladen werden". Vier Messungen haben eine Ursache
   gefunden (die pop-Animation) und beseitigt - der Sprung blieb.

   WARUM DIE BISHERIGEN MESSUNGEN NICHT REICHEN: sie sind Momentaufnahmen.
   Einmal mitten im Flug, einmal danach. Was DAZWISCHEN passiert - genau der
   Augenblick, den der Besitzer beschreibt -, faellt durch.

   Dieses Werkzeug nimmt stattdessen eine FOLGE: zwanzig Messungen ueber die
   Zugdauer, jede mit Position, Groesse, Deckkraft und laufender Animation der
   ziehenden Figur. Nebeneinandergelegt zeigt sie den Sprung, statt ihn
   erschliessen zu lassen.
   ══════════════════════════════════════════════════════════════════════════ */
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const MIME = { ".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",
  ".png":"image/png",".json":"application/json",".jpg":"image/jpeg",".svg":"image/svg+xml",
  ".ico":"image/x-icon",".webm":"audio/webm",".mp3":"audio/mpeg",".woff2":"font/woff2" };
const srv = createServer((q, r) => {
  let p = join("dist", decodeURIComponent(q.url.split("?")[0]));
  if (!existsSync(p) || p.endsWith("/")) p = join("dist", "index.html");
  try { r.writeHead(200, { "Content-Type": MIME[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p)); }
  catch { r.writeHead(404); r.end(); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0, 140)));
const klick = async (w) => page.evaluate((x) => {
  const q = [...document.querySelectorAll("button")].find((t) => (t.textContent || "").includes(x));
  if (q) { q.click(); return true; } return false; }, w);

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);
await klick("Erstellen"); await page.waitForTimeout(800);
await page.locator("input[type=email]").fill("film@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen"); await page.waitForTimeout(2800);
await klick("Neuer Spielstand"); await page.waitForTimeout(2800);
for (let i = 0; i < 8; i++) {
  const w = await page.evaluate(() => {
    const q = [...document.querySelectorAll("button")].find((t) => /Weiter|Los geht|Überspringen|Verstanden|Beginnen/i.test(t.textContent || ""));
    if (!q) return false; q.click(); return true; });
  if (!w) break; await page.waitForTimeout(600);
}
await klick("Schnelles Spiel"); await page.waitForTimeout(1800);
await page.evaluate(() => {
  const q = [...document.querySelectorAll("button")].find((t) => /Losziehen|Spiel starten|Start/i.test(t.textContent || ""));
  q && q.click(); });
await page.waitForTimeout(2800);

/* Einen Zug anstossen und SOFORT anfangen zu messen. */
const lauf = await page.evaluate(async () => {
  const felder = () => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 28 && r.width < 120 && Math.abs(r.width - r.height) < 4;
    });
    if (!alle.length) return [];
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
  };
  const eigene = felder().filter((d) => d.querySelector("img") && d.getBoundingClientRect().top > innerHeight * 0.42);
  let ziel = null;
  for (const d of eigene) {
    d.click(); await new Promise((r) => setTimeout(r, 240));
    const z = felder().find((x) => /ggZielAtem/.test(x.getAttribute("style") || "") || x.querySelector('[style*="ggZielAtem"]'));
    if (z) { ziel = z; break; }
  }
  if (!ziel) return { fehler: "kein Zielfeld gefunden" };

  const proben = [];
  const start = performance.now();
  ziel.click();
  /* 24 Proben ueber 1,2 Sekunden - dicht genug, um einen Sprung von einem
     Rahmen zum naechsten zu sehen. */
  for (let i = 0; i < 24; i++) {
    await new Promise((r) => requestAnimationFrame(r));
    await new Promise((r) => setTimeout(r, 48));
    const t = Math.round(performance.now() - start);
    /* ALLE sichtbaren Figurenbilder mit ihrer Lage - so faellt auf, wenn zwei
       gleichzeitig da sind oder eines verschwindet. */
    const bilder = [...document.querySelectorAll("img")]
      .filter((im) => { const r = im.getBoundingClientRect(); return r.width > 10 && r.top > 100 && r.top < innerHeight - 100; })
      .map((im) => {
        /* ── GEMESSEN WIRD offsetWidth, NICHT getBoundingClientRect ──────
           Der erste Anlauf nahm die Bounding-Box - und die ist bei einem
           GEDREHTEN Element groesser als das Element selbst. Nachgerechnet:
           eine 58x67-Figur, um 5 Grad gedreht, misst als Box 64x72. Genau
           solche Werte hatte ich als "Groessenschwankung von 15 %" gedeutet.

           Es war eine DREHUNG, keine Skalierung. offsetWidth/offsetHeight
           ignorieren jede Transformation und liefern das wahre Mass; die
           Skalierung steht separat in der Matrix. */
        const r = im.getBoundingClientRect(); const cs = getComputedStyle(im);
        const huelle = im.closest("div"); const hs = huelle ? getComputedStyle(huelle) : null;
        const m = cs.transform && cs.transform !== "none" ? cs.transform.match(/matrix\(([-\d.]+)/) : null;
        return { x: Math.round(r.left), y: Math.round(r.top),
          b: im.offsetWidth, h: im.offsetHeight,          // wahres Mass, ohne Drehung
          sk: m ? +(+m[1]).toFixed(3) : 1,                 // Skalierung, falls vorhanden
          op: +(+cs.opacity).toFixed(2),
          anim: (hs && hs.animationName !== "none" ? hs.animationName : "") };
      });
    /* nur die, die sich bewegen oder eine Animation tragen */
    /* Die ZIEHENDE Figur ist die, deren Ort sich von Probe zu Probe aendert.
       Der erste Anlauf filterte nach "hat eine Animation" - das trifft aber
       jede atmende Figur am Brettrand und nie die fliegende. Jetzt wird
       verglichen: was war beim letzten Rahmen an dieser Stelle? */
    proben.push({ t, n: bilder.length, alle: bilder });
  }
  return { proben };
});

/* ── ZWEI FALLSTRICKE, BEIDE SELBST HINEINGETRETEN (v1.5.3) ───────────────

   ERSTENS: getBoundingClientRect misst bei einem GEDREHTEN Element die
   umschliessende Box, nicht das Element. Nachgerechnet: eine 58x67-Figur, um
   5 Grad gedreht, misst als Box 64x72. Genau solche Werte hatte ich als
   "Groessenschwankung von 15 Prozent" gedeutet - es war eine Drehung.
   Deshalb misst dieses Werkzeug jetzt offsetWidth/offsetHeight (das wahre
   Mass, unabhaengig von jeder Transformation) und liest die Skalierung
   separat aus der Matrix.

   ZWEITENS, und das ist der peinlichere: mit dem wahren Mass stand da
   "Flieger 57x67, ruhende Figuren 67x78" - 15 Prozent Unterschied, wieder
   ein scheinbarer Sprung. Aber pieceFont() gibt einem BAUERN 1,17em und
   jeder anderen Figur 1,37em. Verhaeltnis 0,854; gemessen 0,851. Der Flieger
   war ein Bauer, die ruhenden waren Tuerme und Laeufer. Ich habe zwei
   Figurenarten verglichen.

   MERKE FUER DEN NAECHSTEN LAUF: nur DIESELBE Figur ueber die Zeit
   vergleichen, nie zwei verschiedene. Die Folge muss die ziehende Figur an
   ihrer Kennung festhalten, nicht an ihrer Lage.

   Bisher gesichert: waehrend des Flugs ist die Groesse KONSTANT (57x67 ueber
   alle Rahmen) und die Skalierung ist 1. Im Flug selbst passiert also
   nichts - der Sprung muss im Augenblick des Austauschs liegen.

   ── WAS DIE ERSTE FOLGE ZEIGT (v1.5.2) ───────────────────────────────────
   Die ziehende Figur waehrend ihres Flugs, Rahmen fuer Rahmen:

     151 ms  64x67 @ -1,403
     226 ms  60x71 @  1,400      <- schmaler, hoeher
     294 ms  61x71 @  1,400
     366 ms  69x78 @ -2,413      <- deutlich groesser
     432 ms  65x74 @  1,407
     567 ms  (Flieger verschwindet, Bildzahl faellt von 66 auf 64)

   Die Groesse schwankt also waehrend des gesamten Flugs zwischen 60x67 und
   69x78 - rund 15 %. Ein Teil davon ist gewollt (ggLeapArc laesst die Figur
   auf dem Bogen bis 1,18 wachsen), aber die Schwankung laeuft bis zum
   Schluss durch, und beim Verschwinden des Fliegers uebernimmt die Zelle mit
   ihrer eigenen, festen Groesse. Genau dort liegt der Ruck.

   NAECHSTER SCHRITT: pruefen, ob ggLeapArc bei diesem Zug ueberhaupt laufen
   sollte. Der Bogen gehoert zum SPRINGER (Leap); ein gerader Zug sollte
   gleiten, nicht huepfen. Wenn der Bogen faelschlich auch bei geraden Zuegen
   laeuft, ist das die Ursache - und die Groessenschwankung waere schlicht
   fehl am Platz.

   Die Folge selbst ist ab jetzt das richtige Werkzeug dafuer: sie zeigt, was
   passiert, statt es aus zwei Momentaufnahmen zu erschliessen. */
console.log("\n══ BILDFOLGE EINES ZUGES ══\n");
if (lauf.fehler) { console.log("  " + lauf.fehler); }
else {
  let vorher = null;
  for (const p of lauf.proben) {
    /* Welche Bilder sind NEU oder haben sich bewegt? Das sind die
       interessanten - alles andere steht ohnehin still. */
    const neu = vorher ? p.alle.filter((x) => !vorher.some((v) => v.x === x.x && v.y === x.y && v.b === x.b)) : [];
    const teile = neu.slice(0, 3).map((x) => `${x.b}x${x.h}@${x.x},${x.y} sk${x.sk} op${x.op}${x.anim ? " [" + x.anim + "]" : ""}`);
    /* Sprung markieren: aendert sich eine Groesse um mehr als 3 px zwischen
       zwei Rahmen, ist das der gesuchte Ruck. */
    let mark = "";
    if (vorher && neu[0] && vorher[0]) {
      const db = Math.abs(neu[0].b - vorher[0].b), dy = Math.abs(neu[0].y - vorher[0].y);
      if (db > 3) mark = `  <<< GROESSE ${vorher[0].b} -> ${neu[0].b}`;
      
    }
    console.log(`  ${String(p.t).padStart(4)} ms · ${p.n} Bilder · ${teile.join(" | ") || "-"}${mark}`);
    vorher = p.alle;
  }
}
console.log(fehler.length ? "\n  Seitenfehler: " + fehler.join(" | ") : "\n  keine Seitenfehler");
await b.close(); srv.close();
