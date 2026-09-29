/* ── SITZEN DIE SPERREN RICHTIG? ECHTE PIXEL, KEIN QUELLTEXT ───────────────
   Zwei Wuensche des Besitzers, beide am 29.9.2026, beide hier nachgemessen:

   (1) "Mauer und Zaun, die bitte wirklich mittig, vertikal mittig ausrichten
        auf dem Schachfeld. Die sind meines Wissens immer noch so eher nach
        unten orientiert."
   (2) "Das Bollwerk kann auch noch etwas nach oben, mindestens so hoch wie
        auch z. B. die Figuren an ihrem untersten Punkt."

   ER HATTE BEI (1) RECHT - UND EINE PROBE BEHAUPTETE DAS GEGENTEIL. In
   test_anim stand seit v1.2.3 "die Sperren sitzen vertikal mittig im Feld",
   geprueft an den Zeichenketten `top: "50%"` und `translate(-50%, calc(-50%`
   im Quelltext von SperrGlyph.jsx. Beide standen da. Gemessen sass die Mauer
   trotzdem 23,3 % der Feldhoehe zu tief: zentriert war der KASTEN, und
   `alignItems: "flex-end"` schob das Bild darin an die Unterkante.

   Deshalb misst diese Probe PIXEL. Sie rendert jede Sperre und drei Figuren
   in ein weisses Feld, fotografiert jedes Feld einzeln und sucht die oberste
   und unterste Zeile, in der ueberhaupt Farbe liegt. Der Schlagschatten
   faellt dabei heraus (Schwelle 60 von 255) - er ist weich und gehoert nicht
   zur Silhouette. Gegen was geprueft wird:

     - FUSSLINIE: keine Sperre darf mit dem Fuss TIEFER enden als die
       tiefststehende Figur. Das ist Wunsch (2), und er gilt fuer alle Arten,
       nicht nur fuer den Bergfried - kommt neue Kunst dazu, faellt es hier
       auf.
     - MITTE: Arten ohne Hebung (SPERR_HEBUNG in sperrenArt.js) sitzen
       vertikal mittig. Das ist Wunsch (1).

   Lauf: `node tools/pruefe-sperrsitz.mjs` (baut sich sein Buendel selbst;
   Chromium-Pfad aus PW_CHROMIUM wie die anderen Browser-Proben).
   Gegen den Stand von v1.90.6 meldet sie Fehler - eine Probe, die auch ohne
   den Fehler gruen ist, prueft nichts. */
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";

const FELD = 96;          // gross genug, dass ein Pixel nicht ueber alles entscheidet
/* v1.90.7: GEMESSEN WIRD DER ALPHAKANAL, nicht die Helligkeit. Erster
   Versuch war "dunkel genug gegen Weiss" - daran ist der Zaunschutt
   durchgefallen, obwohl das Bild pixelgenau mittig ist: sein helles Holz
   liegt zu nah an Weiss. Eine Probe, die Farbe fuer Form haelt, meldet
   Fehler, die keine sind. Der Alphakanal kennt nur da und nicht da.
   50 statt 0, damit der weiche Schlagschatten (drop-shadow, Alpha um 25)
   nicht als Silhouette zaehlt - er ist kein Teil der Figur. */
const SCHWELLE = 50;      // Alpha: darunter ist es Schlagschatten, nicht Silhouette
const MITTE_TOLERANZ = 3; // Prozent der Feldhoehe
const FUSS_TOLERANZ = 0.5;
const SPERREN = [
  ["mauer", "heil"], ["mauer", "angeschlagen"], ["mauer", "truemmer"],
  ["zaun", "heil"], ["zaun", "truemmer"],
  ["bergfried", "heil"], ["bergfried", "angeschlagen"], ["bergfried", "schwer"], ["bergfried", "truemmer"],
];
const FIGUREN = ["K", "Q", "R", "B", "N", "P"];

/* Welche Arten sind ABSICHTLICH gehoben? sperrenArt.js laesst sich hier nicht
   importieren - es zieht die .webp-Dateien mit, und node kennt die Endung
   nicht (das Buendel unten erledigt das mit esbuild). Darum wird die kleine
   Tabelle aus dem Quelltext gelesen. Das ist KEINE Quelltextprobe: geprueft
   wird weiterhin an Pixeln, der Text sagt nur, wo eine Abweichung von der
   Mitte gewollt ist. */
const HEBUNG = (() => {
  const txt = readFileSync("src/app/ui/board/sperrenArt.js", "utf8");
  const block = /export const SPERR_HEBUNG = \{([^}]*)\}/.exec(txt);
  const out = {};
  if (block) for (const m of block[1].matchAll(/(\w+)\s*:\s*([\d.]+)/g)) out[m[1]] = Number(m[2]);
  return out;
})();

const PROBE = ".sperrsitz.jsx", BUENDEL = ".sperrsitz.js";
writeFileSync(PROBE, `import { createRoot } from "react-dom/client";
import { SperrGlyph } from "./src/app/ui/board/SperrGlyph.jsx";
import { PieceGlyph } from "./src/app/ui/board/PieceGlyph.jsx";
const S = ${JSON.stringify(SPERREN)}, F = ${JSON.stringify(FIGUREN)};
const fig = (k) => ({ id: 1, kind: k, color: "w", level: 5, abilities: [], used: {}, hp: 10, maxHp: 10, atk: 4 });
/* ABSTAND IST PFLICHT, nicht Kosmetik: die Sperrkaesten sind absolut
   gesetzt und bis 114 % breit, ragen also ueber ihr Feld hinaus. Ein
   Element-Foto in Playwright nimmt den BILDSCHIRMAUSSCHNITT auf - was vom
   Nachbarfeld hereinragt, liegt mit im Bild. Ohne Abstand mass diese Probe
   Nachbarn mit und meldete Fehler, die keine waren (gemessen: zaun-truemmer
   angeblich 6,3 % aus der Mitte, allein gerendert exakt mittig). */
const Zelle = ({ n, children }) => <div data-zelle={n} style={{ position: "relative",
  width: ${FELD}, height: ${FELD}, background: "transparent", display: "inline-block",
  verticalAlign: "top", fontSize: "${FELD}px", lineHeight: 0, margin: ${FELD} }}>{children}</div>;
createRoot(document.getElementById("root")).render(<div style={{ display: "inline-block" }}>
  {F.map((k) => <Zelle key={"f" + k} n={"figur:" + k}><PieceGlyph piece={fig(k)} showLevel={false} /></Zelle>)}
  {S.map(([a, z]) => <Zelle key={a + z} n={"sperre:" + a + ":" + z}><SperrGlyph art={a} zustand={z} ruhig /></Zelle>)}
</div>);
`);

/* Oberste und unterste Zeile mit Farbe, in Prozent der Feldhoehe.
   GEMESSEN WIRD MIT PILLOW, nicht mit einer neuen Abhaengigkeit: python3 mit
   Pillow steht ohnehin in CLAUDE.md als Voraussetzung (test_zauber misst die
   Drachensockel-Farbe damit). Ein PNG-Leser fuer node waere ein zweites
   Werkzeug fuer dieselbe Arbeit. */
const PYTHON = `
import sys, json
from PIL import Image
im = Image.open(sys.stdin.buffer).convert("RGBA")
W, H = im.size
px = im.load()
def bunt(y):
    for x in range(W):
        if px[x, y][3] > ${SCHWELLE}: return True
    return False
oben = next((y for y in range(H) if bunt(y)), None)
unten = next((y for y in range(H - 1, -1, -1) if bunt(y)), None)
print(json.dumps(None if oben is None else
  {"oben": oben / H * 100, "unten": (unten + 1) / H * 100, "mitte": (oben + unten + 1) / 2 / H * 100}))
`;
function silhouette(buf) {
  const roh = execFileSync("python3", ["-c", PYTHON], { input: buf, encoding: "utf8" });
  return JSON.parse(roh);
}

let fehler = 0;
try {
  execFileSync("npx", ["esbuild", PROBE, "--bundle", "--jsx=automatic", "--outfile=" + BUENDEL,
    "--loader:.webp=dataurl", "--loader:.png=dataurl", "--loader:.jpg=dataurl",
    "--loader:.mp3=dataurl", "--loader:.webm=dataurl", "--loader:.css=empty"], { stdio: ["ignore", "ignore", "pipe"] });
  /* v1.90.7: DER SCHLAGSCHATTEN WIRD FUER DIE MESSUNG ABGESCHALTET.
     `drop-shadow(0 2px 3px rgba(0,0,0,.6))` haengt an Figuren wie Sperren.
     Er ist 2 px nach unten versetzt und weich - am Rand liegt sein Alpha
     deutlich ueber der Schwelle, er zaehlte also als Silhouette und zog
     jede gemessene Mitte nach unten. Bei den kleinen Truemmern (40 px)
     machte das 7,8 % aus und meldete einen Fehler, den es nicht gibt. Der
     Schatten sagt nichts darueber, WO etwas sitzt - er gehoert nicht in
     diese Messung. */
  const html = `<!doctype html><meta charset="utf-8">`
    + `<style>*{filter:none !important;box-shadow:none !important;text-shadow:none !important}</style>`
    + `<body style="margin:0">`
    + `<div id="root"></div><script type="module">${readFileSync(BUENDEL, "utf8")}</script></body>`;
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"] });
  const seite = await browser.newPage({ deviceScaleFactor: 1 });
  const abstuerze = [];
  seite.on("pageerror", (e) => abstuerze.push(e.message));
  await seite.setContent(html, { waitUntil: "load" });
  await seite.waitForTimeout(2500);
  if (abstuerze.length) { console.error("Absturz beim Rendern:", abstuerze[0]); fehler++; }

  const namen = await seite.evaluate(() => [...document.querySelectorAll("[data-zelle]")].map((e) => e.dataset.zelle));
  const gemessen = new Map();
  for (const n of namen) gemessen.set(n, silhouette(await seite.locator(`[data-zelle="${n}"]`).screenshot({ omitBackground: true })));
  await browser.close();

  const figuren = [...gemessen].filter(([n]) => n.startsWith("figur:"));
  const sperren = [...gemessen].filter(([n]) => n.startsWith("sperre:"));
  if (figuren.length !== FIGUREN.length || sperren.length !== SPERREN.length) {
    console.error(`gerendert: ${figuren.length} Figuren, ${sperren.length} Sperren - erwartet ${FIGUREN.length}/${SPERREN.length}`);
    fehler++;
  }
  const fuesse = figuren.filter(([, m]) => m).map(([, m]) => m.unten);
  if (!fuesse.length) { console.error("keine Figur gerendert - die Fusslinie ist nicht messbar"); fehler++; }
  const FUSSLINIE = Math.max(...fuesse);
  console.log(`Fusslinie der Figuren: ${FUSSLINIE.toFixed(1)} % der Feldhoehe`
    + ` (${figuren.filter(([, m]) => m).map(([n, m]) => n.slice(6) + " " + m.unten.toFixed(1)).join(", ")})\n`);

  console.log("Sperre                    Kopf    Fuss    Mitte   Urteil");
  for (const [n, m] of sperren) {
    const kurz = n.slice(7);
    if (!m) { console.log(`  ${kurz.padEnd(24)} nichts gezeichnet`); fehler++; continue; }
    const art = kurz.split(":")[0];
    const hebung = (HEBUNG[art] || 0) * 100;
    const urteile = [];
    if (m.unten > FUSSLINIE + FUSS_TOLERANZ) { urteile.push(`FUSS ${(m.unten - FUSSLINIE).toFixed(1)}% ZU TIEF`); fehler++; }
    if (!hebung && Math.abs(m.mitte - 50) > MITTE_TOLERANZ) { urteile.push(`MITTE ${(m.mitte - 50).toFixed(1)}% DANEBEN`); fehler++; }
    console.log(`  ${kurz.padEnd(24)}${m.oben.toFixed(1).padStart(5)}%${m.unten.toFixed(1).padStart(8)}%`
      + `${m.mitte.toFixed(1).padStart(8)}%   ${urteile.length ? urteile.join(" | ") : (hebung ? `gehoben um ${hebung.toFixed(1)}%, Fuss ueber der Linie` : "mittig, Fuss ueber der Linie")}`);
  }
} finally {
  for (const d of [PROBE, BUENDEL]) if (existsSync(d)) rmSync(d);
}
if (fehler) { console.log(`\n== ${fehler} FEHLER ==`); process.exit(1); }
console.log("\n== SPERREN SITZEN RICHTIG ==");
