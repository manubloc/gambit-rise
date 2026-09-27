// ── KEIN WAHLSCHALTER VERSCHLUCKT SEINEN TEXT ───────────────────────────────
// Forderung des Besitzers (v0.44): auf keinem Schirm darf ein Segment oder
// Kartenchip seinen Namen abschneiden. Dieses Werkzeug bootet dist/ im
// SCHMALEN Viewport (320 px), laeuft durch Schnelles Spiel, Hofstaat-Reiter
// und Profil und misst an JEDEM Knopf: scrollWidth <= clientWidth + 1 und
// scrollHeight <= clientHeight + 1. Ein einziger Ueberlauf faellt die Kette.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".json": "application/json",
  ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/" || !extname(p)) p = "/index.html";
  try { const b = await readFile(join("dist", p));
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" }); res.end(b);
  } catch { res.writeHead(404); res.end("nope"); }
});
await new Promise((r) => server.listen(4336, r));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",   /* PW_CHROMIUM: lokaler Pfad (v1.89.4) */ args: ["--no-sandbox"] });
let gesamtFunde = 0, gemessen = 0;
for (const [vw, vh] of [[320, 690], [412, 915], [1280, 860]]) {
const page = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
await page.goto("http://127.0.0.1:4336/", { waitUntil: "load" });
await page.waitForTimeout(1400);
const klick = async (text) => {
  const l = page.getByText(text, { exact: false }).first();
  if (await l.count()) { await l.click({ timeout: 4000, force: true }).catch(() => {}); await page.waitForTimeout(850); return true; }
  return false;
};
/* v1.0.17: DER EINSTIEG WURDE REPARIERT. Das Werkzeug klickte "Als Gast
   spielen" - diesen Weg gibt es seit v0.92 nicht mehr, also blieb es am
   Anmeldeschirm stehen und mass dort ein paar Knoepfe statt der ganzen App.
   Es meldete trotzdem "sauber": ein blindes Werkzeug, das gruen leuchtet,
   ist schlimmer als gar keins. Jetzt legt es sich selbst ein Konto an. */
/* Erst muss der VORLADER fort sein (v1.0.12): er liegt mit zIndex 200 ueber
   allem, bis jedes Bild und jeder Klang geholt ist. Wer vorher klickt, klickt
   gegen den Ladeschirm - genau daran scheiterte der erste Reparaturversuch. */
/* ZWEI FALLEN, an denen die Reparaturversuche scheiterten:
   (a) Die Wartebedingung griff, BEVOR React den Vorlader gezeichnet hatte -
       "kein Ladetext da" war beim ersten Poll trivial wahr. Also lief das
       Werkzeug sofort weiter und klickte gegen einen Ladeschirm, der erst
       danach erschien. Deshalb wird auf sein ERSCHEINEN und dann auf sein
       Verschwinden gewartet.
   (b) Maus-Klicks kamen an den Knoepfen nicht an - auch mit force. Der
       JS-Klick auf dem Element selbst traegt zuverlaessig. */
const LADETEXT = /Riss \u00f6ffnet sich|Riss ist offen|rift is opening|rift is open/i;
const warteVorlader = async () => {
  await page.waitForFunction((q) => new RegExp(q.s, q.f).test(document.body.innerText),
    { s: LADETEXT.source, f: LADETEXT.flags }, { timeout: 12000 }).catch(() => {});
  await page.waitForFunction((q) => !new RegExp(q.s, q.f).test(document.body.innerText),
    { s: LADETEXT.source, f: LADETEXT.flags }, { timeout: 120000 })
    .catch(() => console.log("  !! der Vorlader ging nicht fort"));
  await page.waitForTimeout(800);
};
const jsKlick = async (muster) => page.evaluate((q) => {
  const re = new RegExp(q, "i");
  const b = [...document.querySelectorAll("button")].find((x) => x.offsetParent && re.test(x.innerText || ""));
  if (b) { b.click(); return true; }
  return false;
}, muster);

await warteVorlader();
const konto = `fluss${Date.now()}@example.com`;
await jsKlick("Noch kein Konto|No account yet");
await page.waitForTimeout(600);
{
  const felder = page.locator("input");
  if (await felder.count() >= 2) {
    await felder.nth(0).fill(konto).catch(() => {});
    await felder.nth(1).fill("fluss-probe-2026").catch(() => {});
    await page.waitForTimeout(250);
    await jsKlick("^Konto erstellen$|^Create account$");
    await page.waitForTimeout(1500);
  }
}
/* Nach dem Anlegen startet die App NEU - der Vorlader laeuft ein zweites Mal. */
await warteVorlader();
/* v1.0.18: DER EINSTIEG BEKOMMT DREI ANLAEUFE. Ein Durchgang genuegte nicht
   zuverlaessig: je nach Ladezeit stand mal das Willkommensblatt, mal die
   Spielstandliste, mal schon der Hub - und ein einzelner fester Ablauf traf
   nicht immer. Statt die Zeiten hochzudrehen (was jeden Lauf verlangsamt)
   wird geprueft und wiederholt, bis die Fussleiste steht. */
const einstieg = async () => {
  for (const t of ["Los geht's", "Weiter", "Verstanden", "\u00dcbernehmen", "Uebernehmen"]) { await jsKlick(t); await page.waitForTimeout(450); }
  await jsKlick("Neuer Spielstand|New save");
  await page.waitForTimeout(900);
  for (const t of ["Los geht's", "Weiter", "\u00dcbernehmen", "Verstanden", "Weiterspielen|Continue"]) { await jsKlick(t); await page.waitForTimeout(550); }
  await page.waitForTimeout(900);
  return page.evaluate(() => /SPIELEN|PLAY/i.test(document.body.innerText) && document.querySelectorAll("button").length > 3);
};
for (let versuch = 1; versuch <= 3; versuch++) {
  if (await einstieg()) break;
  if (versuch < 3) { await warteVorlader(); await page.waitForTimeout(600); }
}
/* DIE LEBENDPROBE: steht die App wirklich? Fruehere Laeufe massen am
   Anmeldeschirm weiter und meldeten null Funde. Ohne die Fussleiste
   (SPIELEN/FIGUREN/LAGER/PROFIL) ist der Lauf WERTLOS und sagt das laut. */
/* v1.0.18: die App traegt kein <main> mehr - der alte Selektor "main button"
   fand NIE einen Knopf, also mass das Werkzeug jedesmal null und meldete das
   als "sauber". Jetzt zaehlen alle Knoepfe des Dokuments. */
const drin = await page.evaluate(() =>
  /SPIELEN|PLAY/i.test(document.body.innerText) && document.querySelectorAll("button").length > 3);
if (!drin) {
  console.log(`  !! ${vw}px: die App steht NICHT - der Einstieg hat nicht getragen.`);
  gesamtFunde++;
}

/* v1.0.18: DIE LEBENDPROBE GILT VOR JEDER MESSUNG, nicht nur am Anfang.
   Faellt die App zwischendrin heraus (Abmeldung, Absturz), sind alle
   folgenden Funde Phantome - dann wird der Lauf laut ungueltig statt
   Zahlen zu liefern, die niemand nachpruefen kann. */
let ausgestiegen = false;
const stehtNoch = async () => page.evaluate(() =>
  /SPIELEN|PLAY|FIGUREN|PIECES/i.test(document.body.innerText) && document.querySelectorAll("button").length > 3);

const messe = (wo) => page.evaluate((ort) => {
  const raus = [];

  /* v1.0.28 (Besitzer): DIE POPUPS WERDEN MITGEMESSEN. Bisher sah das
     Werkzeug nur Knoepfe - die Blaetter mit ihren Fliesstexten, die auf dem
     Telefon am ehesten brechen, blieben unbesehen. Geprueft wird dreierlei:
     (a) laeuft Text ueber seinen Kasten hinaus (abgeschnitten statt
         umgebrochen)?
     (b) muss man im Blatt SCROLLEN, um alles zu lesen? Der Besitzer will,
         dass der Inhalt hineinpasst, statt scrollbar zu sein.
     (c) steht ein Blatt ueber den Schirmrand hinaus?
     Ein Blatt erkennen wir am selben Merkmal wie die Ebenen-Regel oben:
     fest positioniert mit zIndex >= 20. */
  /* v1.0.29: EIN WERKZEUG, DAS NICHTS SIEHT, FINDET AUCH NICHTS. Genau daran
     war die Knopfmessung blind gewesen; die Blattmessung soll denselben
     Fehler nicht wiederholen. Darum meldet jeder Ort, WIE VIELE Blaetter er
     ueberhaupt vor sich hatte. */
  const blaetter = [...document.querySelectorAll("div")].filter((d) => {
    const o = getComputedStyle(d);
    if (o.position !== "fixed" || (parseInt(o.zIndex, 10) || 0) < 20) return false;
    const r = d.getBoundingClientRect();
    return r.width > 120 && r.height > 80;   // echte Blaetter, keine Marker
  });
  /* Die Zaehlung ist DIAGNOSE, kein Fund: sie meldet sich nur, wenn ein
     Blatt-Ort angesteuert wurde und dort NICHTS stand - dann lief die
     Messung ins Leere und ihr "sauber" waere wertlos. */
  if (/^blatt-/.test(ort) && blaetter.length === 0) raus.push({ ort, text: "__LEER__", wOver: 0, hOver: 0, diagnose: true });
  for (const blatt of blaetter) {
    const br = blatt.getBoundingClientRect();
    if (br.bottom > innerHeight + 2 || br.top < -2)
      raus.push({ ort, text: "BLATT RAGT HINAUS: " + (blatt.innerText || "").replace(/\s+/g, " ").slice(0, 28),
        wOver: 0, hOver: Math.round(Math.max(br.bottom - innerHeight, -br.top)) });
    /* Scrollen im Blatt: nur melden, wenn es WIRKLICH scrollt (der Kasten
       traegt overflow auto/scroll UND hat mehr Inhalt als Platz). */
    for (const k of [blatt, ...blatt.querySelectorAll("div")]) {
      const o = getComputedStyle(k);
      if (!/auto|scroll/.test(o.overflowY)) continue;
      const ueber = k.scrollHeight - k.clientHeight;
      if (ueber > 8 && k.clientHeight > 60)
        raus.push({ ort, text: "BLATT MUSS SCROLLEN: " + (k.innerText || "").replace(/\s+/g, " ").slice(0, 26),
          wOver: 0, hOver: ueber });
    }
    // Fliesstext, der aus seinem Kasten laeuft
    for (const e of blatt.querySelectorAll("p,span,div,h1,h2,h3")) {
      if (e.children.length) continue;               // nur Blaetter des Baums
      const t = (e.textContent || "").trim();
      if (t.length < 4) continue;
      const wOver = e.scrollWidth - e.clientWidth, hOver = e.scrollHeight - e.clientHeight;
      const o = getComputedStyle(e);
      if (o.overflow === "visible") continue;        // laeuft ueber, wird aber gezeigt
      if (wOver > 1 || hOver > 1)
        raus.push({ ort, text: "TEXT VERSCHLUCKT: " + t.slice(0, 30), wOver, hOver });
    }
  }

  for (const b of document.querySelectorAll("button")) {   /* v1.0.18: kein <main> mehr */
    const r = b.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const wOver = b.scrollWidth - b.clientWidth, hOver = b.scrollHeight - b.clientHeight;
    if (wOver > 1 || hOver > 1) raus.push({ ort, text: (b.innerText || "").replace(/\s+/g, " ").slice(0, 34), wOver, hOver });
    // auch abgeschnittene Innen-Spans (ellipsis) zaehlen als verschluckt -
    // AUSSER dort, wo der Schnitt Absicht ist (Namen auf Kacheln: title-Attr)
    for (const e of b.querySelectorAll("span,div")) {
      const cs = getComputedStyle(e);
      if (cs.textOverflow === "ellipsis" && e.scrollWidth - e.clientWidth > 1 && !e.closest("[data-schnitt-ok]"))
        raus.push({ ort, text: "ELLIPSIS: " + (e.textContent || "").slice(0, 30), wOver: e.scrollWidth - e.clientWidth, hOver: 0 });
    }
  }
  // DER DAUERAUFTRAG DES BESITZERS: "nie Elemente uebereinander". Jedes
  // sichtbare Knopf-Paar wird auf Ueberdeckung geprueft (Vorfahr-Verhaeltnisse
  // ausgenommen - Knoepfe in Knoepfen gibt es ohnehin nicht).
  // Erste Fassung schlug bei Inhalt-unterm-Dock in SCROLL-MITTE an - das ist
  // aber legitim (Glasleiste, man scrollt weiter). Die echte Regel: Inhalt
  // gegen Inhalt IMMER; Inhalt gegen Dock erst, nachdem main ans ENDE
  // gescrollt wurde - dort garantiert das Bodenpolster die Freiheit.
  document.querySelector("main")?.scrollTo(0, 9e6);
  // getBoundingClientRect ignoriert CLIPPING: ein aus main herausgescrollter
  // Knopf "ueberlappte" numerisch die Kopfleiste (gemessen: top -1125, real
  // unsichtbar). Wir rechnen deshalb das SICHTBARE Rechteck - mit jedem
  // overflow-schneidenden Vorfahren verschnitten.
  const sichtbar = (el) => {
    let r = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (o.overflow !== "visible" || o.overflowY !== "visible" || o.overflowX !== "visible") {
        const ar = a.getBoundingClientRect();
        r = { left: Math.max(r.left, ar.left), top: Math.max(r.top, ar.top),
          right: Math.min(r.right, ar.right), bottom: Math.min(r.bottom, ar.bottom) };
        if (r.right - r.left <= 0 || r.bottom - r.top <= 0) return null;
      }
    }
    return { ...r, width: r.right - r.left, height: r.bottom - r.top };
  };
  /* v1.0.18: EIN OVERLAY DARF DECKEN - dafuer ist es da. Der erste ehrliche
     Lauf meldete "Simpel x Partie starten": das Willkommensblatt lag noch
     ueber dem Hub, und das ist keine Panne, sondern der Sinn eines Blattes.
     Gemessen wird deshalb nur INNERHALB einer Ebene: alles, was in einem
     fest positionierten Kasten sitzt, gehoert zur Overlay-Ebene, der Rest
     zur Seite. Ebenen gegeneinander sagen nichts aus. */
  const ebene = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (o.position === "fixed" && (parseInt(o.zIndex, 10) || 0) >= 20) return "overlay";
    }
    return "seite";
  };
  const kn = [...document.querySelectorAll("button")]
    .map((b) => ({ b, r: sichtbar(b), dock: !!b.closest("nav, aside"), eb: ebene(b) }))
    .filter((x) => x.r && x.r.width > 8 && x.r.height > 8 && x.r.bottom > 0 && x.r.top < innerHeight && x.b.offsetParent !== null);
  for (let i = 0; i < kn.length; i++) for (let j = i + 1; j < kn.length; j++) {
    const A = kn[i], B = kn[j];
    if (A.dock && B.dock) continue;
    if (A.eb !== B.eb) continue;   // v1.0.18: Ebene gegen Ebene sagt nichts
    if (A.b.contains(B.b) || B.b.contains(A.b)) continue;
    const w = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
    const h = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
    if (w > 3 && h > 3) raus.push({ ort, text: "UEBERDECKT: '" + (A.b.innerText || "?").slice(0, 18) + "' x '" + (B.b.innerText || "?").slice(0, 18) + "'", wOver: Math.round(w), hOver: Math.round(h) });
  }
  document.querySelector("main")?.scrollTo(0, 0);
  return raus;
}, wo);

let funde = [];
// Schnelles Spiel (Konfiguration)
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim() === "Anpassen"); b?.click(); });
await page.waitForTimeout(1100);
if (!await stehtNoch()) { ausgestiegen = "schnelles-spiel"; }
funde.push(...await messe("schnelles-spiel"));
await page.evaluate(() => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").includes("Zur\u00fcck")); b?.click(); });
await page.waitForTimeout(800);
// Hofstaat: alle vier Reiter
// Das Dock heisst mobil <nav>, breit <aside> - wir greifen per BESCHRIFTUNG,
// nicht per Index, damit derselbe Lauf beide Layouts traegt.
// ERSTBESUCH-HERALDS (v0.51) stellen jeden Raum einmal vor - der Waechter
// bestaetigt sie wie ein Mensch (Hauptknopf), sonst laege der Schleier
// ueber allen Messungen.
const abraeumen = async () => { for (let i = 0; i < 6; i++) {
  const g = await page.evaluate(() => {
    const sch = [...document.querySelectorAll("div")].find((d) => { const cs = getComputedStyle(d);
      return cs.position === "fixed" && cs.zIndex === "60" && d.getBoundingClientRect().width > 300; });
    if (!sch) return false;
    /* v1.0.18: KEIN BLINDER GRIFF MEHR. Fand der Aufraeumer keinen bekannten
       Bestaetigungstext, klickte er einfach den LETZTEN Knopf des Blattes -
       und traf damit gelegentlich "Abmelden". Der Lauf mass danach den
       Anmeldeschirm und meldete Funde, die es gar nicht gibt: einmal 7,
       beim naechsten Mal 0. Ein Werkzeug, das wackelt, ist so wertlos wie
       ein blindes. Jetzt gilt eine Sperrliste, und ohne Treffer wird das
       Blatt lieber stehen gelassen als aufs Geratewohl geklickt. */
    const TABU = /Abmelden|Sign out|L\u00f6schen|Delete|Zur\u00fccksetzen|Reset|Konto|Account|Verlassen|Aufgeben/i;
    const kn = [...sch.querySelectorAll("button")]
      .filter((b) => b.getBoundingClientRect().height > 30 && !TABU.test(b.innerText || ""));
    const ziel = kn.find((b) => /Los geht|Weiter|Verstanden|Got it|Start|\u00dcbernehmen/.test(b.innerText));
    if (!ziel) return false;
    ziel.click();
    return true; });
  if (!g) break; await page.waitForTimeout(650); } };
const dock = async (name) => { await page.evaluate((n) => {
  const bs = [...document.querySelectorAll("nav button, aside button")];
  const z = bs.find((b) => (b.innerText || "").replace(/\s+/g, " ").trim().toLowerCase().includes(n));
  z?.click(); }, name); await page.waitForTimeout(1050); await abraeumen(); };
await abraeumen();
await dock("hofstaat");
for (const reiter of ["Hofstaat", "Aufstellung", "Ausr\u00fcstung", "Chronik"]) {
  await page.evaluate((r) => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim() === r); b?.click(); }, reiter);
  await page.waitForTimeout(700);
  if (!await stehtNoch()) ausgestiegen = ausgestiegen || ("hofstaat-" + reiter);
  funde.push(...await messe("hofstaat-" + reiter));
}
/* v1.0.28 (Besitzer): DIE BLAETTER SELBST AUFSCHLAGEN. Ein Blatt, das nie
   geoeffnet wird, kann auch nicht brechen - bisher mass das Werkzeug nur,
   was ohnehin auf dem Schirm stand. Jetzt wird eine Figurenkachel im
   Hofstaat angetippt und die Kampagnenkarte samt Stations-Blatt geoeffnet;
   genau dort sitzen die langen Fliesstexte. */
{
  /* v1.0.29: ERST DER HEROLD, DANN DIE KACHEL. Beim ERSTEN Betreten eines
     Menues legt sich das Willkommensblatt (zIndex 60) ueber alles - der
     Kachel-Klick lief bisher dagegen, und die Messung fand null Blaetter.
     Das Herold-Blatt ist aber selbst voller Fliesstext und genau die Sorte,
     die auf schmalen Schirmen bricht: es wird also GEMESSEN, bevor es
     weggeraeumt wird. */
  await dock("figuren");
  await page.waitForTimeout(1100);
  const herold = await page.evaluate(() => [...document.querySelectorAll("div")].some((d) => {
    const o = getComputedStyle(d);
    return o.position === "fixed" && (parseInt(o.zIndex, 10) || 0) >= 20 && d.getBoundingClientRect().height > 200;
  }));
  if (herold) {
    if (await stehtNoch()) funde.push(...await messe("blatt-herold"));
    await abraeumen();
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(600);
  }
  // (a) Figuren-Blatt im Hofstaat
  await page.evaluate((r) => { const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim() === r); b?.click(); }, "Hofstaat");
  await page.waitForTimeout(900);
  const auf = await page.evaluate(() => {
    const k = [...document.querySelectorAll("div[role=button], button")]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 60 && r.height > 60; });
    if (!k.length) return false;
    k[Math.min(2, k.length - 1)].click(); return true;
  });
  if (auf) {
    await page.waitForTimeout(950);
    if (await stehtNoch()) funde.push(...await messe("blatt-figur"));
    await abraeumen();
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}
{
  // (b) Stations-Blatt auf der Kampagnenkarte
  await dock("spielen");
  await page.waitForTimeout(900);
  const karte = await jsKlick("Kampagne|Weiterspielen|Campaign|Zur Karte");
  await page.waitForTimeout(1400);
  const station = await page.evaluate(() => {
    const p = [...document.querySelectorAll("[data-station], circle, button")]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 14 && r.width < 90 && r.height > 14 && r.height < 90; });
    if (!p.length) return false;
    p[0].dispatchEvent(new MouseEvent("click", { bubbles: true })); return true;
  });
  if (karte && station) {
    await page.waitForTimeout(1100);
    if (await stehtNoch()) funde.push(...await messe("blatt-station"));
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(500);
  }
}

// Profil (Segmente: Figurenstil, Sprache, Schwierigkeit)
await dock("profil");
if (!await stehtNoch()) ausgestiegen = ausgestiegen || "profil";
funde.push(...await messe("profil"));

// Kachel-Namen im Hofstaat duerfen per Bauart mit Ellipse enden (nowrap +
// title) - alles andere nicht. Wir werten NUR echte Ueberlaeufe:
funde = funde.filter((f) => !(f.text.startsWith("ELLIPSIS") && f.ort.startsWith("hofstaat-Hofstaat")));
let anzahl = await page.evaluate(() => /* v1.0.18: die App traegt kein <main> mehr - der alte Selektor fand NIE
     einen Knopf, also mass das Werkzeug jedesmal null. */
  document.querySelectorAll("button").length);
if (ausgestiegen) {
  console.log(`  !! ${vw}px: die App ist bei "${ausgestiegen}" herausgefallen - alle folgenden Funde sind Phantome.`);
  funde = [];              // nichts davon ist verwertbar
  gesamtFunde++; anzahl = 0;   // und der Lauf gilt als gescheitert
}
const leere = funde.filter((f) => f.diagnose);
funde = funde.filter((f) => !f.diagnose);
for (const l of leere) console.log(`  (i) ${vw}px: bei "${l.ort}" stand kein Blatt - dieser Ort wurde nicht gemessen.`);
gemessen += anzahl; gesamtFunde += funde.length;
for (const f of funde) console.log(`  VERSCHLUCKT [${vw}px · ${f.ort}] "${f.text}" +${f.wOver}x${f.hOver}px`);
console.log(`  Viewport ${vw}x${vh}: ${anzahl} Knoepfe zuletzt sichtbar, ${funde.length} Funde`);
await page.close();
}
if (gemessen < 20) { console.log("== TEXTFLUSS NICHT GEMESSEN =="); await browser.close(); server.close(); process.exit(2); }
console.log(`RESULT: ${gesamtFunde === 0 ? 1 : 0} passed, ${gesamtFunde} failed`);
console.log(gesamtFunde === 0 ? "== TEXTFLUSS SAUBER ==" : "== TEXT VERSCHLUCKT ==");
await browser.close(); server.close();
process.exit(gesamtFunde === 0 ? 0 : 1);
