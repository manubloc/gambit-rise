/* DIE MATRIZE: jede Figur mit Band und Skalierung genau so, wie das Spiel sie
   zeichnet - transform und Band aus SockelBand.jsx portiert, Masse aus
   sockelband.json. Zu jeder Figur steht ihre Kennung und was sie bekommt,
   damit der Besitzer einzeln nachjustieren kann. Kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const MASS = JSON.parse(fs.readFileSync("src/app/ui/board/sockelband.json", "utf8"));
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const ZIEL_RX = 136, ZIEL_HOEHE = 561, BODEN_LINIE = 555;
const skal = (m, id) => id === "dragon" || !m ? 1 : Math.max(0.55, Math.min(1.35, ZIEL_RX / m.rx));
/* ── ALT: die senkrechte Streckung durfte bis 1,20 und bis 0,85 ───────────── */
const streckAlt = (m, id) => { if (!m || id === "dragon" || m.oben == null) return 1;
  const h = (m.boden - m.oben) * skal(m, id); return Math.max(0.85, Math.min(1.2, ZIEL_HOEHE / h)); };
/* ── NEU (Besitzerregel) ──────────────────────────────────────────────────
   "In dem Moment, wo du ueber 1,1 skalierst, ist es evtl. schon zu viel -
   zumindest dann, wenn in der Breite nichts passiert."

   Also zwei Schranken statt einer:
   1. Gestreckt wird hoechstens auf 1,10 (vorher 1,20).
   2. Ueber 1,00 hinaus NUR, wenn die Figur auch in der Breite gewachsen ist
      (k > 1). Wurde sie schmaler gemacht, bleibt sie in der Hoehe, wie sie
      ist - genau der Fall, der b03 in die Laenge zog.
   3. Nach unten reicht 0,92 statt 0,85 - wer kleiner ist, darf kleiner sein
      (Besitzer zum Warlock: "war ok, dass er kleiner ist").
   Was an Hoehe fehlt, faengt jetzt das Band auf: die Figur sitzt tiefer und
   der untere Teil des Sockels verschwindet dahinter. */
const streck = (m, id) => { if (!m || id === "dragon" || m.oben == null) return 1;
  const k = skal(m, id), roh = ZIEL_HOEHE / ((m.boden - m.oben) * k);
  const obenGrenze = k > 1 ? 1.10 : 1.00;
  return Math.max(0.92, Math.min(obenGrenze, roh)); };
const mitte = (m) => -((m.cx - m.W / 2) / m.W) * 100;
const ausgleich = (m, id) => { const k = skal(m, id) * streck(m, id);
  return Math.max(-8, Math.min(8, (((m.H - m.boden) * k - (m.H - BODEN_LINIE)) / m.H) * 100)); };

const bogen = (m, hoch, tA, tB, n = 18) => { const p = [];
  for (let i = 0; i <= n; i++) { const t = tA + (tB - tA) * (i / n);
    p.push([m.cx + m.rx * Math.cos(t), (m.boden - m.ry) - m.ry * Math.sin(t) - hoch]); } return p; };
const P = (p) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
const seg = (m, h, a, b) => P(bogen(m, 0, a, b)) + " " + P(bogen(m, h, b, a)).replace(/^M/, "L") + " Z";
/* Besitzer: "das Band soll schon immer den Sockel ueberdecken, mein Vorschlag
   war nur, das Band darf hoeher sein als der Sockel." Also wieder von der
   Bodenkante AUFWAERTS - es deckt den gemalten Ring zu und ragt darueber. */
/* Besitzer: "Schatzkammer, Haendler brauchen natuerlich kein Band - das sind
   ja keine Figuren." */
const OHNE_BAND = new Set(["schatzkammer", "haendler", "standard"]);
const band = (id, leben, kraft) => { const m = MASS[id]; if (!m || OHNE_BAND.has(id)) return "";
  const h = Math.round(m.rx * 2 * 0.17), rand = Math.max(2, h * 0.13);
  const tL = Math.PI, tR = 2 * Math.PI, a = tL + (tR - tL) * leben, b = tR - (tR - tL) * kraft;
  const mA = Math.min(a, b), mB = Math.max(a, b), u = (k) => `${id}-${k}`;
  return `<svg viewBox="0 0 ${m.W} ${m.H}" preserveAspectRatio="xMidYMax meet" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;z-index:2">
  <defs>
    <linearGradient id="${u("r")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a80"/><stop offset=".35" stop-color="#e5322c"/><stop offset="1" stop-color="#7a0e0e"/></linearGradient>
    <linearGradient id="${u("b")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fb4ff"/><stop offset=".35" stop-color="#2d63e6"/><stop offset="1" stop-color="#0d2a7a"/></linearGradient>
    <linearGradient id="${u("d")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a44"/><stop offset=".4" stop-color="#15151b"/><stop offset="1" stop-color="#050507"/></linearGradient>
    <linearGradient id="${u("g")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a6"/><stop offset=".5" stop-color="#c99a45"/><stop offset="1" stop-color="#6e4e1c"/></linearGradient>
    <linearGradient id="${u("k")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${u("gl")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".22" stop-color="#000" stop-opacity=".12"/><stop offset=".3" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".04"/><stop offset=".82" stop-color="#000" stop-opacity=".04"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient>
  </defs>
  <path d="${seg(m, h + rand, tL, tR)}" fill="url(#${u("g")})"/>
  ${a > tL ? `<path d="${seg(m, h, tL, a)}" fill="url(#${u("r")})"/>` : ""}
  ${mB > mA ? `<path d="${seg(m, h, mA, mB)}" fill="url(#${u("d")})"/>` : ""}
  ${b < tR ? `<path d="${seg(m, h, b, tR)}" fill="url(#${u("b")})"/>` : ""}
  <path d="${seg(m, h, tL, tR)}" fill="url(#${u("gl")})"/><path d="${seg(m, h, tL, tR)}" fill="url(#${u("k")})"/>
  <path d="${P(bogen(m, h, tL, tR))}" fill="none" stroke="url(#${u("g")})" stroke-width="${rand}"/>
  <path d="${P(bogen(m, rand * .5, tL, tR))}" fill="none" stroke="#5a3d12" stroke-width="${rand * .6}" opacity=".7"/></svg>`; };

/* welche Gemaelde gibt es, und welches Mass gehoert dazu */
const dateien = fs.readdirSync("src/app/ui/assets/painted").filter((f) => f.startsWith("painted-") && f.endsWith(".webp"));
const zellen = [];
for (const f of dateien) {
  const id = f.replace(/^painted-|\.webp$/g, "");
  const m = MASS[id]; if (!m) { zellen.push({ id, fehlt: true }); continue; }
  const k = skal(m, id), st = streck(m, id);
  const kopf = null;
  const alt = streckAlt(m, id);
  zellen.push({ id, m, k, st, alt, mitte: mitte(m), aus: ausgleich(m, id), datei: f,
    hoehe: Math.round((m.boden - (m.oben ?? 0)) * k * st),
    hoeheAlt: Math.round((m.boden - (m.oben ?? 0)) * k * alt) });
}
zellen.sort((a, b) => (a.fehlt ? 1 : 0) - (b.fehlt ? 1 : 0) || a.id.localeCompare(b.id));

const zelle = (z) => z.fehlt
  ? `<div class="z fehlt"><div class="kasten">kein Maß</div><div class="nm">${z.id}</div></div>`
  : `<div class="z">
    <div class="kasten">
      <div class="innen" style="transform:translate(${z.mitte.toFixed(2)}%, ${z.aus.toFixed(2)}%) scale(${z.k.toFixed(3)}, ${(z.k * z.st).toFixed(3)})">
        <img src="P_${z.datei}" alt="">${band(z.id, .72, .55)}
      </div>
      <div class="linie"></div>
    </div>
    <div class="nm">${z.id}</div>
    <div class="zahlen">rx ${z.m.rx.toFixed(0)} · ×${z.k.toFixed(2)} · ↕${z.st.toFixed(2)}${Math.abs(z.st - z.alt) > .005 ? `<span class="war"> (war ${z.alt.toFixed(2)})</span>` : ""}<br>H ${z.hoehe}${z.hoehe !== z.hoeheAlt ? `<span class="war"> statt ${z.hoeheAlt}</span>` : ""} · ↔${z.mitte.toFixed(1)}%</div>
  </div>`;

const HTML = `<!doctype html><meta charset="utf-8"><style>
body{background:#07050c;margin:0;padding:24px;font-family:system-ui,sans-serif;color:#f0e9d8}
h1{font:600 15px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:#e9cf8a;margin-bottom:4px}
p.u{font:400 12px/1.5 Georgia,serif;color:#837e6f;margin-bottom:18px;max-width:1100px}
.gitter{display:grid;grid-template-columns:repeat(8,1fr);gap:12px}
.z{display:flex;flex-direction:column;gap:5px;align-items:center}
.kasten{position:relative;width:100%;aspect-ratio:1/1;border-radius:11px;overflow:hidden;
  background:radial-gradient(120% 100% at 50% 0%,rgba(46,32,78,.9),rgba(10,7,19,.99));border:1px solid rgba(233,207,138,.22)}
.innen{position:absolute;inset:0;transform-origin:50% 100%}
.innen img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:bottom}
/* die gemeinsame Bodenlinie 555 von 576 - hier liegt sie bei 96,4 % */
.linie{position:absolute;left:0;right:0;top:96.35%;height:1px;background:rgba(111,194,240,.55);z-index:5}
.nm{font:700 10px/1.2 system-ui,sans-serif;color:#f0e9d8;text-align:center;word-break:break-all}
.zahlen{font:400 8.5px/1.35 Georgia,serif;color:#8d8776;text-align:center}
.war{color:#e08a84}
.fehlt .kasten{display:grid;place-items:center;color:#8d8776;font:600 10px Georgia,serif}
</style>
<h1>Matrize 2 — die neue Regel: höchstens 1,10, und nur wenn die Breite mitwuchs</h1>
<p class="u"><b style="color:#e08a84">Rot</b> steht dort, wo sich etwas gegen vorher ändert. Neue Regel: senkrecht höchstens <b>1,10</b> statt 1,20, über 1,00 hinaus nur wenn die Figur auch breiter wurde (k&gt;1), nach unten 0,92 statt 0,85. Schatzkammer und Händler tragen kein Band mehr. Sonst gerechnet wie das Spiel: Tellerbreite auf ${ZIEL_RX}, senkrechte Streckung auf die Höhe des Bauern (${ZIEL_HOEHE}), Ausrichtung auf den Teller, alle auf die gemeinsame Bodenlinie ${BODEN_LINIE} — die blaue Linie. Unter jeder Figur: gemessene Tellerbreite rx, Tellerfaktor ×, senkrechte Streckung ↕, die gezeigte Höhe H in Bildpixeln und die Seitwärtskorrektur ↔. Wo H stark von den anderen abweicht oder ↕ an 0,85 bzw. 1,20 klebt, ist die Kappung erreicht — dort lohnt das Nachjustieren.</p>
<div class="gitter">${zellen.map(zelle).join("")}</div>`;

let html = HTML;
for (const z of zellen) if (!z.fehlt) html = html.replace(`src="P_${z.datei}"`, `src="${b64("src/app/ui/assets/painted/" + z.datei, "image/webp")}"`);
fs.writeFileSync("/mnt/user-data/outputs/matrize-figuren-2.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 2 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/matrize-figuren-2.html"), { waitUntil: "load" });
await p.waitForTimeout(900);
await p.screenshot({ path: "/mnt/user-data/outputs/matrize-figuren-2.png", fullPage: true });
await b.close();
const h = zellen.filter((z) => !z.fehlt).map((z) => z.hoehe).sort((a, b) => a - b);
console.log("Gemaelde:", zellen.length, "| ohne Mass:", zellen.filter((z) => z.fehlt).length);
console.log("gezeigte Hoehen: kleinste", h[0], "groesste", h[h.length - 1], "Median", h[Math.floor(h.length / 2)]);
console.log("an der Kappung ↕:", zellen.filter((z) => !z.fehlt && (z.st <= 0.851 || z.st >= 1.199)).map((z) => z.id).join(", "));
