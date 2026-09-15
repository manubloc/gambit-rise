// ── SITZT DAS LEBENSROHR RICHTIG AUF DEM SOCKEL? ────────────────────────────
//
// WARUM ES DIESE MESSUNG GIBT (Uebergabe v1.13.1, offener Befund 2):
// Alle Masse des Rohrs stammen aus einer Bildstrecke auf 150-px-Zellen. Im
// Spiel ist eine Zelle 38 bis 48 px breit. Die Breite wurde auf em umgestellt
// (1 em = Zellbreite), aber NIE im laufenden Gefecht nachgemessen. Der
// Besitzer hat schon einmal "viel zu klein" gemeldet - damals wegen einer
// festen Pixelkonstante (EM_PX = 40), die es nicht geben kann. Diese Messung
// ist die Gegenprobe, die seither fehlte.
//
// WAS SIE VERGLEICHT, je Figur am echten Brett:
//   1. Rohrbreite gegen SOCKELBREITE          - soll ROHR_BREITE_VOM_SOCKEL (1,12)
//   2. Rohrhoehe  gegen ZELLBREITE            - soll ROHR_HOEHE_VON_ZELLE (0,155)
//   3. Rohroberkante gegen SOCKELOBERKANTE    - deckt das Rohr den Sockel?
//   4. Rohrunterkante gegen FIGURENFUSS       - taucht es zu tief?
//
// WIE DER SOCKEL GEMESSEN WIRD, und das ist die GRENZE DIESER MESSUNG:
// Der Sockel steckt IM BILD, nicht im DOM - er ist kein Element, das man
// abfragen kann. Das Bild wird deshalb im Browser auf eine Leinwand gelegt
// und Zeile fuer Zeile auf Deckkraft gelesen. Als Sockel gilt: von der
// untersten sichtbaren Zeile aufwaerts der zusammenhaengende Streifen, in dem
// die Zeilenbreite mindestens SOCKEL_SCHWELLE der breitesten Bodenzeile
// haelt. Das ist eine ANNAHME, keine Wahrheit - bei einer Figur mit weitem
// Gewand (Hexerin, Barde) kann der Saum als Sockel durchgehen. Wer eine Zahl
// hier liest, muss diese Annahme mitlesen. Fuer den Zweck reicht sie: es geht
// um Groessenordnung und um die Frage, ob der Sockel unten rausschaut.
//
// GEGENPROBE EINGEBAUT: das Rohr wird fuer die Bildmessung kurz ausgeblendet.
// Ohne das misst man den Sockel MIT dem Rohr darueber und bekommt einen
// Scheinbefund - das Rohr deckt genau die Zeilen ab, um die es geht.
//
// AUFRUF:  npm run build && node messe_rohr.mjs
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";

const SOCKEL_SCHWELLE = 0.85;   // Anteil der breitesten Bodenzeile, siehe Kopf
const ALPHA_SCHWELLE = 24;      // ab hier gilt ein Pixel als sichtbar

/* Die Sollwerte kommen AUS DER QUELLE, nicht aus dem Gedaechtnis - sonst
   misst man gegen eine Zahl, die im Bauteil laengst anders steht. */
const lrQuelle = readFileSync("src/app/ui/board/LebensRohr.jsx", "utf8");
const konst = (name) => {
  const m = lrQuelle.match(new RegExp(`export const ${name} = ([0-9.]+)`));
  if (!m) { console.log(`  ! Konstante ${name} nicht gefunden - Bauteil umgebaut?`); return NaN; }
  return parseFloat(m[1]);
};
const SOLL_BREITE_VOM_SOCKEL = konst("ROHR_BREITE_VOM_SOCKEL");
const SOLL_HOEHE_VON_ZELLE = konst("ROHR_HOEHE_VON_ZELLE");
const pgQuelle = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
const sockelFaktor = parseFloat((pgQuelle.match(/ROHR_BREITE_VOM_SOCKEL \* ([0-9.]+)/) || [])[1] || "NaN");

/* ── DIE SAAT: gerechnet, nicht eingetragen ───────────────────────────────
   Welche Liga und welche geschaffte Station die Arena oeffnen, steht in der
   Kampagne - und die aendert sich. Hier wird beides zur Laufzeit gesucht:
   die erste Arena-Station und ihre Vorgaenger. Die GEGENPROBE laeuft gleich
   mit: ohne die geschaffte Station muss die Arena ZU bleiben. Ohne sie
   koennte die Impfung wirkungslos sein, waehrend die Tuer aus einem ganz
   anderen Grund offensteht - und die Messung meldete trotzdem Erfolg. */
const { CAMPAIGN } = await import("./src/content/index.js");
const { hpUnlocked, mapUnlocked } = await import("./src/meta/campaign.js");
const arena = CAMPAIGN.find((n) => n.map === "arena");
if (!arena) { console.log("  ABBRUCH: keine Arena-Station in der Kampagne."); process.exit(1); }
const saat = { liga: arena.league,
  cleared: CAMPAIGN.filter((n) => (n.next || []).includes(arena.id)).map((n) => n.id) };
const mitSaat = { v: 2, campaign: { league: saat.liga, cleared: saat.cleared } };
const ohneSaat = { v: 2, campaign: { league: saat.liga, cleared: [] } };
console.log(`  SAAT: Liga ${saat.liga}, geschafft ${JSON.stringify(saat.cleared)} (Ziel ${arena.id})`);
console.log(`  PROBE   mit Saat: HP ${hpUnlocked(mitSaat)}, Arena ${mapUnlocked(mitSaat, "arena")}`);
console.log(`  GEGENPROBE ohne:  HP ${hpUnlocked(ohneSaat)}, Arena ${mapUnlocked(ohneSaat, "arena")}`);
if (!mapUnlocked(mitSaat, "arena") || mapUnlocked(ohneSaat, "arena")) {
  console.log("  ABBRUCH: die Saat oeffnet die Arena nicht (oder sie war nie zu). Messung waere wertlos.");
  process.exit(1);
}

const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp",
  ".png":"image/png", ".json":"application/json", ".jpg":"image/jpeg", ".svg":"image/svg+xml",
  ".ico":"image/x-icon", ".webm":"audio/webm", ".mp3":"audio/mpeg", ".woff2":"font/woff2" };
const srv = createServer((q, r) => {
  let p = join("dist", decodeURIComponent(q.url.split("?")[0]));
  if (!existsSync(p) || p.endsWith("/")) p = join("dist", "index.html");
  try { r.writeHead(200, { "Content-Type": MIME[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p)); }
  catch { r.writeHead(404); r.end(); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0, 140)));
const klick = async (wort) => { await page.evaluate((w) => {
  const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes(w));
  b && b.click(); }, wort); };

/* Anmelden wie messe_animation - ohne Konto kommt man nie ans Brett. Das war
   der stille Fehler in drive3: die Fahrprobe stand die ganze Zeit auf der
   Anmeldemaske und meldete deshalb "kein Brett". */
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);
await klick("Erstellen"); await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("rohr@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen"); await page.waitForTimeout(2600);
await klick("Neuer Spielstand"); await page.waitForTimeout(2600);

/* ── DIE SPERRE, UND WARUM DAS ROHR NIE GEMESSEN WURDE ────────────────────
   Auf einem frischen Konto ist "HP-Gefecht" im Schnellen Spiel abgeschaltet
   und jede Karte ausser Klassik 8x8 zu. hpUnlocked/mapUnlocked haengen an der
   Kampagne: eine Station mit rules="hp" bzw. map="arena" muss erreichbar
   sein. Arena-Stationen gibt es NUR in Liga 7 bis 12, und nodeInLeague
   vergleicht die Liga exakt.

   Folge: drive3, messe_animation und jedes andere Werkzeug, das bei null
   anfaengt, landet zwangslaeufig in Klassik 8x8 - und dort setzt BoardView
   die Werte gar nicht erst (`piece.maxHp > 0`). KEIN automatisches Werkzeug
   hat je ein Lebensrohr zu Gesicht bekommen. Das ist der Grund, aus dem der
   offene Befund 2 offen ist; es war kein Versaeumnis, sondern eine Wand.

   DESHALB WIRD HIER GEIMPFT, nicht gespielt: die Stationen bis zur Arena zu
   erspielen dauert Stunden und misst nichts. Der Spielstand bekommt die Liga
   und GENAU EINE geschaffte Vorgaengerstation - das Mindeste, das die Tuer
   oeffnet. Die IDs werden aus der Kampagne GERECHNET, nicht eingetragen:
   sonst zeigt das Werkzeug beim naechsten Umbau der Karte ins Leere. */
await page.evaluate(({ liga, cleared }) => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.campaign = { ...(p.campaign || {}), league: liga, cleared };
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    if (!/:profile$|:save:/.test(k)) continue;
    try { localStorage.setItem(k, patch(localStorage.getItem(k))); } catch {}
  }
}, saat);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);
for (let i = 0; i < 8; i++) {
  const weiter = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Weiter|Los geht|Überspringen|Skip|Verstanden|Beginnen/i.test(x.textContent || ""));
    if (!b) return false; b.click(); return true;
  });
  if (!weiter) break;
  await page.waitForTimeout(650);
}
await page.waitForTimeout(600);
await klick("Schnelles Spiel"); await page.waitForTimeout(1900);
/* HIER LAG DER ERSTE FEHLVERSUCH, und er ist lehrreich: die Fahrprobe und
   messe_animation klicken nur "Schnelles Spiel" und starten - das landet in
   der VOREINSTELLUNG Klassisch auf Klassik 8x8. Dort gibt es ueberhaupt keine
   Rohre: BoardView setzt die Werte nur bei `piece.maxHp > 0`, und in Klassik
   ist maxHp null. Die Messung meldete "0 Rohre" und haette ohne die
   Lagepruefung oben stillschweigend Unsinn gerechnet.
   ARENA 10x10, nicht 8x8: das ist das Brett des Spiels, und es hat die
   KLEINSTEN Zellen - der Fall, ueber den der Besitzer geklagt hat. */
const waehle = async (wort) => {
  const ok = await page.evaluate((w) => {
    const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === w);
    if (!b) return false; b.click(); return true;
  }, wort);
  if (!ok) console.log(`  ! Knopf "${wort}" nicht gefunden - Menue umgebaut?`);
  await page.waitForTimeout(700);
  return ok;
};
await waehle("HP-Gefecht");
await waehle("Arena · 10×10");
await waehle("Partie starten");
await page.waitForTimeout(3200);

const lage = await page.evaluate(() => ({
  zellen: document.querySelectorAll("[data-zelle]").length,
  rohre: document.querySelectorAll('[data-gg="rohr"]').length,
  text: document.body.innerText.slice(0, 120).replace(/\n/g, " | "),
}));
console.log(`  WO STEHEN WIR: ${lage.zellen} Zellen, ${lage.rohre} Rohre | ${lage.text}`);
if (!lage.zellen || !lage.rohre) {
  console.log("\n  ABBRUCH: kein Brett oder keine Rohre. Die Messung sagt hier NICHTS aus.");
  console.log("  (Das ist der Fall, den drive3 einmal als 'kein Brett im Gefecht' meldete.)");
  await browser.close(); srv.close(); process.exit(1);
}

const mass = await page.evaluate(async ({ SOCKEL_SCHWELLE, ALPHA_SCHWELLE }) => {
  const rohre = [...document.querySelectorAll('[data-gg="rohr"]')];
  const proben = [];
  /* ERST ALLE ROHRE MESSEN, DANN AUSBLENDEN - in dieser Reihenfolge, sonst
     hat man beim Ausblenden keine Kaesten mehr. */
  for (const svg of rohre.slice(0, 40)) {
    const zelle = svg.closest("[data-zelle]");
    if (!zelle) continue;
    const img = zelle.querySelector("img");
    if (!img || !img.naturalWidth) continue;
    /* DER PFAD, NICHT DAS SVG. Der SVG-Kasten reserviert Platz fuer die
       Perle und ist 2,2-mal so hoch wie das Rohr - das war der erste
       Scheinbefund dieser Messung (gemeldet: Hoehe/Zelle 0,341 statt 0,155,
       also "120 % zu hoch", und nichts davon stimmte). */
    const koerper = svg.querySelector('[data-gg="rohr-koerper"]');
    if (!koerper) continue;
    proben.push({ svg, img, zelle,
      rohr: koerper.getBoundingClientRect(), svgKasten: svg.getBoundingClientRect(),
      zr: zelle.getBoundingClientRect(), ir: img.getBoundingClientRect(),
      quelle: (img.getAttribute("src") || "").split("/").pop().split("?")[0] });
  }
  /* GEGENPROBE: Rohre fort, damit die Bildmessung den Sockel sieht und nicht
     das Rohr darueber. */
  for (const p of proben) p.svg.style.visibility = "hidden";
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const ergebnis = [];
  for (const p of proben) {
    const { img } = p;
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    let d;
    try { d = ctx.getImageData(0, 0, c.width, c.height).data; }
    catch { ergebnis.push({ fehler: "Leinwand gesperrt (fremde Quelle)", quelle: p.quelle }); continue; }

    /* je Zeile: linkester und rechtester sichtbarer Punkt */
    const zeile = [];
    for (let y = 0; y < c.height; y++) {
      let l = -1, r = -1;
      for (let x = 0; x < c.width; x++) {
        if (d[(y * c.width + x) * 4 + 3] > ALPHA_SCHWELLE) { if (l < 0) l = x; r = x; }
      }
      zeile.push(l < 0 ? null : { l, r, b: r - l + 1 });
    }
    const sichtbar = zeile.map((z, y) => (z ? y : -1)).filter((y) => y >= 0);
    if (!sichtbar.length) { ergebnis.push({ fehler: "Bild ist leer", quelle: p.quelle }); continue; }
    const oben = sichtbar[0], fuss = sichtbar[sichtbar.length - 1];

    /* SOCKEL: die BREITESTE Zeile im unteren Fuenftel, dann von dort nach
       oben, solange die Breite haelt.
       ZWEITER SCHEINBEFUND, hier gelernt: zuerst stand der Anker auf den
       UNTERSTEN Zeilen. Steht eine Figur auf einer schmalen Spitze oder
       liegt unten ein Streupixel, ist die unterste Zeile duenn - und der
       "Sockel" schrumpfte darauf zusammen. Gemeldet wurden 2,9 px Sockel
       beim Bauern, was offensichtlich Unsinn ist. Das untere Fuenftel als
       Suchfeld ist stabil: der Sockel liegt immer darin. */
    const hoeheInhalt = fuss - oben + 1;
    const unteresFuenftel = sichtbar.filter((y) => y >= fuss - Math.max(2, Math.round(hoeheInhalt * 0.20)));
    const bodenBreite = Math.max(...unteresFuenftel.map((y) => zeile[y].b));
    const ankerY = unteresFuenftel.find((y) => zeile[y].b === bodenBreite);
    let sockelOben = ankerY;
    for (let y = ankerY; y >= oben; y--) {
      if (!zeile[y] || zeile[y].b < bodenBreite * SOCKEL_SCHWELLE) break;
      sockelOben = y;
    }
    const sockelBreiteBild = bodenBreite;

    /* Bildpunkte -> Bildschirmpunkte. Das Bild fuellt seinen Kasten (width/
       height 100 %), also ist der Massstab das Verhaeltnis der Kaesten. */
    const sx = p.ir.width / c.width, sy = p.ir.height / c.height;
    ergebnis.push({
      quelle: p.quelle,
      zelle: p.zr.width,
      rohrBreite: p.rohr.width, rohrHoehe: p.rohr.height,
      kastenHoehe: p.svgKasten.height,
      rohrOben: p.rohr.top, rohrUnten: p.rohr.bottom,
      sockelBreite: sockelBreiteBild * sx,
      sockelOben: p.ir.top + sockelOben * sy,
      fuss: p.ir.top + (fuss + 1) * sy,
    });
  }
  for (const p of proben) p.svg.style.visibility = "";
  return ergebnis;
}, { SOCKEL_SCHWELLE, ALPHA_SCHWELLE });

/* ── BERICHT ─────────────────────────────────────────────────────────────── */
const gut = mass.filter((m) => !m.fehler);
await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Verstanden'); b && b.click(); }); await page.waitForTimeout(600);
await page.screenshot({ path: "/mnt/user-data/outputs/brett-rohr.png" }); { const z = await page.evaluate(() => { const r = document.querySelector('[data-gg="rohr"]'); if (!r) return null; const b = r.closest('[data-cell], td, div')?.getBoundingClientRect() || r.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; }); if (z) await page.screenshot({ path: "/mnt/user-data/outputs/brett-rohr-zoom.png", clip: { x: Math.max(0, z.x - 40), y: Math.max(0, z.y - 60), width: 200, height: 160 } }); }
console.log(`\n  ${gut.length} Figuren gemessen, ${mass.length - gut.length} uebersprungen`);
console.log(`  SOLL: Rohr/Sockel = ${SOLL_BREITE_VOM_SOCKEL}, Rohrhoehe/Zelle = ${SOLL_HOEHE_VON_ZELLE}`);
console.log(`  (der Aufruf nimmt ROHR_BREITE_VOM_SOCKEL * ${sockelFaktor} em - das unterstellt einen Sockel von ${sockelFaktor} em)\n`);
const z = (n, k = 1) => (Number.isFinite(n) ? n.toFixed(k) : "?");
console.log("  Bild                        Zelle  Sockel  Rohr   R/S   Hoehe  H/Zelle  Sockel deckt?");
const verh = [], hoehen = [], sockelEm = [];
for (const m of gut.slice(0, 14)) {
  const rs = m.rohrBreite / m.sockelBreite, hz = m.rohrHoehe / m.zelle;
  verh.push(rs); hoehen.push(hz); sockelEm.push(m.sockelBreite / m.zelle);
  const lueckeOben = m.rohrOben - m.sockelOben;   // > 0: Sockel schaut oben raus
  const unterFuss = m.rohrUnten - m.fuss;          // > 0: Rohr steht unter dem Fuss
  console.log(`  ${m.quelle.slice(0, 26).padEnd(26)} ${z(m.zelle)}  ${z(m.sockelBreite)}   ${z(m.rohrBreite)}  ${z(rs, 2)}  ${z(m.rohrHoehe, 2)}   ${z(hz, 3)}   `
    + (lueckeOben > 1 ? `${z(lueckeOben)} px schauen raus` : "gedeckt") + `, Fuss ${unterFuss >= 0 ? "+" : ""}${z(unterFuss)}`);
}
const mittel = (a) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
console.log(`\n  BEFUND`);
console.log(`   Rohr/Sockel   gemessen ${z(mittel(verh), 2)}   soll ${SOLL_BREITE_VOM_SOCKEL}   Abweichung ${z((mittel(verh) / SOLL_BREITE_VOM_SOCKEL - 1) * 100)} %`);
console.log(`   Hoehe/Zelle   gemessen ${z(mittel(hoehen), 3)}  soll ${SOLL_HOEHE_VON_ZELLE}  Abweichung ${z((mittel(hoehen) / SOLL_HOEHE_VON_ZELLE - 1) * 100)} %`);
console.log(`   Sockel/Zelle  gemessen ${z(mittel(sockelEm), 3)}  unterstellt ${sockelFaktor}   Abweichung ${z((mittel(sockelEm) / sockelFaktor - 1) * 100)} %`);
const kasten = gut.map((m) => m.kastenHoehe / m.rohrHoehe);
console.log(`\n   ZUR EINORDNUNG: der SVG-Kasten ist ${z(mittel(kasten), 2)}-mal so hoch wie das Rohr darin.`);
console.log(`   Wer ihn statt des Rohrs misst, bekommt genau diesen Faktor als Scheinbefund.`);
if (fehler.length) console.log(`\n  SEITENFEHLER: ${fehler.slice(0, 3).join(" | ")}`);
await browser.close(); srv.close();
