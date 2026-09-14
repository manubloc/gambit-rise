// ── LANDET DIE FIGUR DORT, WO DER GLEITER SIE ABGESETZT HAT? ────────────────
//
// GRENZE DIESER MESSUNG, ehrlich benannt: sie vergleicht den ENDZUSTAND des
// Fluges mit der gelandeten Figur. Ein Sprung, der nur einen Rahmen dauert,
// entgeht ihr - dafuer muesste man die Animationen anhalten. Sie hat aber
// zweimal gezeigt, dass ein zu fruehes Messen selbst taeuscht: bei 170 ms und
// bei 470 ms stand der Bogen ggLeapArc noch bei scale 1.0625 bis 1.18 und
// meldete 4,4 bis 5,1 px "Versatz", der keiner war. Erst ab 1150 ms ist der
// Bogen durch. Wer hier eine Zahl liest, muss diesen Zeitpunkt mitlesen.
// Besitzerbefund, mehrfach: "Der zieht fluessig, und in dem Moment, wo er die
// Figur setzt, ist wie ein Sprung - es ist scheinbar nicht das gleiche Objekt."
// Diese Messung zieht einen Zug, liest die Mitte der fliegenden Figur im
// letzten Rahmen des Fluges und die Mitte der gelandeten Figur danach. Die
// Differenz ist der Sprung, in Pixeln. Sie darf nicht mehr als 1 px sein.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".webp":"image/webp", ".png":"image/png", ".json":"application/json", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".ico":"image/x-icon", ".webm":"audio/webm", ".mp3":"audio/mpeg", ".woff2":"font/woff2" };
const srv = createServer((q,r)=>{ let p=join("dist", decodeURIComponent(q.url.split("?")[0])); if(!existsSync(p)||p.endsWith("/")) p=join("dist","index.html");
  try { r.writeHead(200,{"Content-Type":MIME[extname(p)]||"application/octet-stream"}); r.end(readFileSync(p)); } catch { r.writeHead(404); r.end(); } });
await new Promise(r=>srv.listen(0,r));
const port = srv.address().port;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{width:412,height:915} });
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0,120)));
const klick = async (wort) => { await page.evaluate((w) => {
  const b = [...document.querySelectorAll("button")].find((x) => (x.textContent||"").includes(w));
  b && b.click(); }, wort); };

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil:"networkidle" });
await page.waitForTimeout(1300);
/* anmelden wie messe_hofstaat - ohne Konto kommt man nie ans Brett. Das war
   der stille Fehler in drive3: die Fahrprobe stand die ganze Zeit auf der
   Anmeldemaske und meldete deshalb "kein Brett". */
await klick("Erstellen"); await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("anim@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen"); await page.waitForTimeout(2600);
await klick("Neuer Spielstand"); await page.waitForTimeout(2600);
/* Der Willkommensschirm ist mehrseitig - so lange weiterklicken, bis er fort
   ist (hoechstens 8 Mal, damit die Probe nicht haengt). */
for (let i = 0; i < 8; i++) {
  const weiter = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Weiter|Los geht|Überspringen|Skip|Verstanden|Beginnen/i.test(x.textContent||""));
    if (!b) return false; b.click(); return true;
  });
  if (!weiter) break;
  await page.waitForTimeout(650);
}
await page.waitForTimeout(600);
await klick("Schnelles Spiel"); await page.waitForTimeout(1900);
await page.evaluate(() => { const b=[...document.querySelectorAll("button")].find((x)=>/Losziehen|Spiel starten|Start/i.test(x.textContent||"")); b&&b.click(); });
await page.waitForTimeout(2800);

const wo = await page.evaluate(() => ({ text: document.body.innerText.slice(0,180).replace(/\n/g," | "),
  knoepfe: [...document.querySelectorAll("button")].length,
  quadrate: [...document.querySelectorAll("button")].filter((b)=>{const r=b.getBoundingClientRect(); return r.width>28 && Math.abs(r.width-r.height)<4;}).length,
  divQuadrate: [...document.querySelectorAll("div")].filter((d)=>{const r=d.getBoundingClientRect(); return r.width>28 && r.width<90 && Math.abs(r.width-r.height)<4;}).length,
  mitBild: [...document.querySelectorAll("div")].filter((d)=>{const r=d.getBoundingClientRect(); return r.width>28 && r.width<90 && Math.abs(r.width-r.height)<4 && d.querySelector("img,svg");}).length }));
console.log("  WO STEHEN WIR:", JSON.stringify(wo));
const mass = await page.evaluate(async () => {
  /* Die Felder sind DIVs, nicht Buttons (gemessen: 192 quadratische Divs, 96
     mit Figur). Sie liegen im Raster des Bretts - wir nehmen die kleinste
     Sorte, das sind die Felder selbst. */
  const felder = () => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
    });
    const kleinste = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - kleinste) < 2);
  };
  const f = felder();
  if (f.length < 16) return { fehlt: "kein Brett", n: f.length };
  const eigene = f.filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
  let zielEl = null;
  for (const d of eigene) {
    d.click(); await new Promise((r) => setTimeout(r, 280));
    zielEl = felder().find((z) => /ggZielAtem/.test(z.getAttribute("style") || "") || z.querySelector('[style*="ggZielAtem"]'));
    if (zielEl) break;
  }
  if (!zielEl) return { fehlt: "kein Zielfeld" };
  const box = (el) => { const im = el.querySelector("img,svg"); if (!im) return null;
    const r = im.getBoundingClientRect();
    return { x: +(r.left + r.width / 2).toFixed(1), y: +(r.top + r.height / 2).toFixed(1), h: +r.height.toFixed(1) }; };
  zielEl.click();
  /* WICHTIG: erst kurz VOR dem Ende des Fluges messen. Bei 170 ms steckt die
     Figur mitten in ggLeapArc, das bis scale(1.18) geht - ein Vergleich von
     dort aus taeuscht einen Sprung vor, der nur der Bogen ist. Der Flug dauert
     rund 0,5 s; bei 470 ms ist der Bogen zurueck auf scale(1) und die Figur
     steht auf dem Zielfeld. */
  await new Promise((r) => setTimeout(r, 1150));   /* v1.0.96: der Bogen (ggLeapArc, bis scale 1.18) muss GANZ durch sein - bei 470 ms war noch 1.0625 aktiv und taeuschte einen Versatz vor */
  /* die fliegende Figur: sie liegt in einer eigenen Ebene mit zIndex 7 */
  const flieger = [...document.querySelectorAll("div")]
    .filter((d) => getComputedStyle(d).zIndex === "7")
    .map((d) => d.querySelector("img,svg")).filter(Boolean)[0];
  const daten = (el) => { if (!el) return null; const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { x: +(r.left + r.width/2).toFixed(1), y: +(r.top + r.height/2).toFixed(1), h: +r.height.toFixed(1),
      tf: cs.transform.slice(0, 44), anim: cs.animationName };
  };
  const imFlug = daten(flieger);
  /* v1.4.6: MIT HERKUNFT. Die blosse Transform-Kette sagt, DASS skaliert
     wird - nicht, von welchem Element. Jetzt steht Tag, Klasse und Kennung
     dabei, damit die 0,787 einen Namen bekommt. */
  const flugEltern = flieger ? (() => { let e = flieger, kette = [];
    for (let i = 0; i < 5 && e; i++) { const cs = getComputedStyle(e);
      kette.push(cs.transform === "none" ? "-" : cs.transform.slice(0,30)); e = e.parentElement; }
    return kette; })() : null;
  await new Promise((r) => setTimeout(r, 1500));
  const gel = zielEl.querySelector("img,svg");
  const gelEltern = gel ? (() => { let e = gel, kette = [];
    for (let i = 0; i < 5 && e; i++) { const cs = getComputedStyle(e);
      kette.push(cs.transform === "none" ? "-" : cs.transform.slice(0,30)); e = e.parentElement; }
    return kette; })() : null;
  return { imFlug, gelandet: daten(gel), flugEltern, gelEltern };
});

/* ── LIEGT DAS TALENTBAND UNTER DEM BRETT? (Besitzer, mehrfach) ───────────
   Bisher war diese Messung blind: drive3 kam nie ins Spiel. Hier steht sie
   im laufenden Gefecht. */
const band = await page.evaluate(async () => {
  /* eine eigene Figur waehlen - ohne Auswahl gibt es kein Band */
  const felderAlle = () => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const q = d.getBoundingClientRect();
      return q.width > 28 && q.width < 90 && Math.abs(q.width - q.height) < 4;
    });
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
  };
  const eigene = felderAlle().filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
  if (eigene.length) { eigene[Math.floor(eigene.length / 2)].click(); await new Promise((r) => setTimeout(r, 450)); }
  const b = document.querySelector(".gg-talentband");
  if (!b) return { da: false, text: document.body.innerText.slice(0, 90).replace(/\n/g, " | ") };
  const r = b.getBoundingClientRect();
  const felder = [...document.querySelectorAll("div")].filter((d) => {
    const q = d.getBoundingClientRect();
    return q.width > 28 && q.width < 90 && Math.abs(q.width - q.height) < 4;
  });
  if (!felder.length) return { da: true, brett: false };
  const unten = Math.max(...felder.map((d) => d.getBoundingClientRect().bottom));
  return { da: true, brett: true, bandOben: +r.top.toFixed(1), brettUnten: +unten.toFixed(1),
    ueberlappung: +(unten - r.top).toFixed(1), bandHoehe: +r.height.toFixed(1),
    unterKante: +(innerHeight - r.bottom).toFixed(1) };
});
console.log("\n── LIEGT DAS TALENTBAND UNTER DEM BRETT? ──");
if (!band.da) console.log("  kein Band sichtbar |", band.text || "");
else if (!band.brett) console.log("  Band da, aber kein Brett gefunden");
else {
  console.log(`  Brett endet bei ${band.brettUnten} px, Band beginnt bei ${band.bandOben} px`);
  console.log(`  Ueberlappung: ${band.ueberlappung} px · Bandhoehe ${band.bandHoehe} · Luft nach unten ${band.unterKante}`);
  console.log("  Ergebnis:", band.ueberlappung <= 1 ? "OK - Band liegt unter dem Brett" : "VERDECKT - das Band liegt hinter dem Brett");
}

console.log("\n── LANDET DIE FIGUR AM SELBEN ORT? ──");
if (mass.fehlt) console.log("  Messung nicht moeglich:", mass.fehlt, mass.n ?? "");
else if (!mass.imFlug || !mass.gelandet) console.log("  unvollstaendig:", JSON.stringify(mass));
else {
  const dx = +(mass.gelandet.x - mass.imFlug.x).toFixed(1);
  const dy = +(mass.gelandet.y - mass.imFlug.y).toFixed(1);
  console.log(`  im Flug (letzter Rahmen): ${mass.imFlug.x}, ${mass.imFlug.y}`);
  console.log(`  gelandet:                 ${mass.gelandet.x}, ${mass.gelandet.y}`);
  console.log(`  SPRUNG: dx ${dx} px, dy ${dy} px`);
  console.log("  Ergebnis:", Math.abs(dx) <= 2 && Math.abs(dy) <= 2 ? "OK - kein sichtbarer Versatz" : "VERSATZ - die Figur springt beim Setzen");
}
/* ── DER GEMESSENE BEFUND (v1.4.5) ────────────────────────────────────────
   Besitzer: "Insbesondere beim Ziehen von den Figuren ist immer dieser kurze
   Versatz manchmal vorhanden, das ist total doof."

   GEMESSEN, und der Versatz ist NICHT die Position: dx -0,1 px, dy -0,7 px -
   das sieht kein Auge. Der Sprung steckt in der GROESSE. Die Transform-Kette
   zeigt im Flug ein matrix(0.787308, ...) - die fliegende Figur ist auf
   78,7 % verkleinert -, und gelandet fehlt dieser Faktor. Die Figur waechst
   also im letzten Moment um ein Viertel.

   Das erklaert auch das "manchmal": es faellt nur auf, wenn man auf die Figur
   schaut statt aufs Zielfeld, und bei grossen Figuren staerker als bei
   kleinen. Wer die Position misst, findet nichts - deshalb lag ich mit
   frueheren Anlaeufen daneben.

   NAECHSTER SCHRITT: die Quelle der 0,787 finden. Sie steht nicht als Zahl im
   Code, wird also gerechnet - vermutlich ein Ausgleich zwischen Zellmass und
   Figurenmass, der nur waehrend des Flugs greift. */
/* ── ZWEITE MESSUNG (v1.4.6): ES IST EINE LAUFENDE ANIMATION ──────────────
   Der erste Lauf zeigte 0,787 auf der dritten Ebene, der zweite 0,905 - der
   Wert AENDERT SICH zwischen zwei Messungen an derselben Stelle. Damit ist
   klar: es ist keine feste Skalierung, sondern eine laufende, und die Figur
   wird ausgetauscht, BEVOR sie bei 1,0 angekommen ist. Der Sprung ist der
   Rest, der noch fehlt.

   AUSGESCHLOSSEN: ggLeapArc. Die geht von scale(1) ueber 1,18 zurueck auf
   scale(1) - sie endet sauber und wird nie kleiner als 1. Die gemessenen
   0,787 bis 0,905 kommen von woanders.

   NAECHSTER SCHRITT: die dritte Ebene benennen. Die Kette gibt bisher nur
   Matrizen aus, keine Elemente - dafuer muss der Messcode Tag und Klasse
   mitschreiben. Erst dann weiss man, WER da skaliert. */
console.log("  Kette mit Herkunft (Flug):");
for (const z of (mass.flugEltern||[])) console.log("     ", z);
console.log("  Kette roh (Flug):  ", JSON.stringify(mass.flugEltern));
console.log("  Transform-Kette gelandet: ", JSON.stringify(mass.gelEltern));
console.log(fehler.length ? "  Seitenfehler: " + fehler.join(" | ") : "  keine Seitenfehler");
await browser.close(); srv.close();
