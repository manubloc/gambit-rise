// drive3 — the road test. Serves the built dist/ over HTTP, boots the app in
// headless Chromium and fails on ANY console error or missing login mask.
// Gate line "== KEINE FEHLER ==" is what the push battery greps for.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json" };
/* ── WELCHEN STAND FAHREN WIR? (v1.86.0) ──────────────────────────────────
   Seit dem Umzug am 23.9. (v1.42.0, tools/seite-bauen.mjs) liegt nach
   "npm run build" unter dist/index.html die LANDINGPAGE, und die App steckt
   in dist/spielen/ hinter dem Riegel. Diese Probe lud aber weiter "/" - sie
   fand dort keine Anmeldemaske und meldete vier Fehler, die es nicht gab
   ("Anmeldung nicht moeglich | kein Brett | kein Zug | kein Talentband").
   Gruen blieb die Kette nur, weil in der Praxis hinterher "npm run build:app"
   lief und den Umzug zurueckdrehte.

   FOLGE, und das war die eigentliche Luecke: NIE hat eine Probe den Stand
   geprueft, der wirklich ausgeliefert wird - nicht den Riegel, nicht die
   Verschiebung nach /spielen/, nicht den Dienstarbeiter an der Wurzel, nicht
   die Landingpage. Also genau die vier Dinge, die jeder Spieler zuerst
   trifft.

   Jetzt erkennt die Probe beides und fuehrt sich entsprechend:
     dist/spielen/index.html da  -> Auslieferungsstand: erst die Landingpage
                                    an "/", dann die App unter "/spielen/",
                                    Riegel inbegriffen.
     nur dist/index.html         -> reiner App-Bau (build:app) wie bisher. */
const AUSLIEFERUNG = existsSync(join("dist", "spielen", "index.html"));
const EINSTIEG = AUSLIEFERUNG ? "/spielen/" : "/";

const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join("dist", p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" }); res.end(b);
  } catch {
    // SPA-Rueckfall: im Auslieferungsstand gehoert er zur App, nicht zur Seite
    const f = AUSLIEFERUNG ? "dist/spielen/index.html" : "dist/index.html";
    const b = await readFile(f);
    res.writeHead(200, { "content-type": "text/html" }); res.end(b);
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const errors = [];
// The Hall (duell.gambitrise.com) is unreachable from this sandbox — the
// boot-time GET /design is DESIGNED to fail silently offline (livery.js
// catches and falls back to APP_DESIGN). Chromium still logs the CORS/network
// line itself; that expected pair is the ONLY thing this gate tolerates.
/* v1.0.63: In einer Sandbox mit vorgeschaltetem Netz-Vermittler meldet
   Chromium denselben Fehlschlag als ERR_TUNNEL_CONNECTION_FAILED statt
   ERR_FAILED - gemessen: die einzige fehlgeschlagene Anfrage ist weiterhin
   GET https://duell.gambitrise.com/design. Ein Tunnelfehler kann ohnehin nur
   bei einer AUSWAERTIGEN Anfrage entstehen; alles Eigene liefert der lokale
   Server dieser Datei (und im Zweifel seine SPA-Rueckfallseite mit 200). */
const EXPECTED_OFFLINE = (t) =>
  /duell\.gambitrise\.com/.test(t)
  || /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED)/.test(t);
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });   /* PW_CHROMIUM: lokaler Pfad, sonst der Cloud-Container (v1.89.4) */
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error" && !EXPECTED_OFFLINE(m.text())) errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
/* ── DER AUSLIEFERUNGSSTAND, ZUERST ───────────────────────────────────────
   Nur wenn dist/ wirklich die Seite traegt. Geprueft wird, was der Besucher
   als Erstes sieht: die Landingpage an der Wurzel, dann die App unter
   /spielen/. v1.88.0: der Riegel (prompt() mit Passwort, v1.42.0-v1.87.0)
   ist fort - der Besitzer war damit auf dem Handy ausgesperrt, weil prompt()
   dort stumm null liefert. Taucht trotzdem ein Dialog auf, ist das jetzt ein
   Fehler: dann ist ein alter Riegel wieder im Bau. Der Horcher bleibt, damit
   die Probe in dem Fall nicht haengt, sondern es meldet. */
const dialoge = [];
if (AUSLIEFERUNG) {
  page.on("dialog", async (d) => {
    dialoge.push(`${d.type()}: ${d.message().slice(0, 60)}`);
    try { await d.dismiss(); } catch {}
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const seite = await page.evaluate(() => ({
    titel: document.title || "",
    zeichen: (document.body.innerText || "").trim().length,
    store: /play\.google\.com/.test(document.body.innerHTML),
    spielen: [...document.querySelectorAll("a")].some((a) => /\/spielen\/?$/.test(a.getAttribute("href") || "")),
    eingaben: document.querySelectorAll("input").length,
  }));
  if (seite.zeichen < 200) errors.push(`Landingpage fast leer (${seite.zeichen} Zeichen)`);
  if (!/Gambit/i.test(seite.titel)) errors.push(`Landingpage ohne Titel: "${seite.titel}"`);
  if (!seite.store) errors.push("Landingpage ohne Verweis auf den Play Store");
  if (!seite.spielen) errors.push("Landingpage ohne Weg nach /spielen/");
  if (!errors.length) console.log(`   Landingpage steht: "${seite.titel.slice(0, 40)}", ${seite.zeichen} Zeichen`);

  /* Der Dienstarbeiter an der Wurzel MUSS der abmeldende sein (v1.42.0),
     sonst bedient ein alter Zwischenspeicher die Startseite. */
  try {
    const sw = await (await fetch(`http://127.0.0.1:${port}/sw.js`)).text();
    if (!/unregister\(\)/.test(sw)) errors.push("sw.js an der Wurzel meldet sich nicht ab");
    else console.log("   sw.js an der Wurzel raeumt auf");
  } catch { errors.push("sw.js an der Wurzel fehlt"); }
}

await page.goto(`http://127.0.0.1:${port}${EINSTIEG}`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
if (AUSLIEFERUNG) {
  await page.waitForTimeout(1500);
  const versteckt = await page.evaluate(() => document.documentElement.style.visibility === "hidden");
  if (dialoge.length) errors.push(`ein Riegel fragt wieder (${dialoge.join(" | ")}) - v1.88.0 hat ihn entfernt`);
  else if (versteckt) errors.push("die App unter /spielen/ bleibt versteckt (visibility hidden)");
  else console.log(`   kein Riegel: App steht direkt unter ${EINSTIEG}`);
}
const hasLogin = await page.locator("input").count() > 0 || (await page.textContent("body"))?.includes("Spielstand");
if (!hasLogin) errors.push("Login-/Startmaske nicht gefunden");
/* ── AB HIER WIRD WIRKLICH GESPIELT (v1.1.13) ─────────────────────────────
   Bis v1.1.12 endete diese Fahrprobe an der Anmeldemaske. Sie meldete
   trotzdem "KEINE FEHLER", und das war schlimmer als gar keine Probe: dreimal
   hat sie eine Messung als "nicht sichtbar" gemeldet, weil gar kein Brett da
   war, und einmal habe ich das faelschlich mit einer Spielregel erklaert
   (v1.0.92 -> v1.0.96). Eine Probe, die nur den Vorhof sieht, macht blind
   statt sicher.

   Der Weg ans Brett steht in messe_animation.mjs: Konto anlegen, Spielstand
   anlegen, den mehrseitigen Willkommensschirm durchklicken, schnelles Spiel
   starten. Hier derselbe Weg, danach echte Messungen im Gefecht. */
const klick = async (wort) => page.evaluate((w) => {
  const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").includes(w));
  if (b) { b.click(); return true; }
  return false;
}, wort);

await klick("Erstellen"); await page.waitForTimeout(700);
try {
  await page.locator("input[type=email]").fill("fahrprobe@probe.local");
  await page.locator("input[type=password]").fill("Probe12345!");
  await klick("Konto erstellen"); await page.waitForTimeout(2600);
  await klick("Neuer Spielstand"); await page.waitForTimeout(2600);
} catch { errors.push("Anmeldung nicht moeglich"); }
for (let i = 0; i < 8; i++) {
  const w = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Weiter|Los geht|Überspringen|Skip|Verstanden|Beginnen/i.test(x.textContent || ""));
    if (!b) return false; b.click(); return true;
  });
  if (!w) break;
  await page.waitForTimeout(600);
}
await klick("Schnelles Spiel"); await page.waitForTimeout(1900);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /Losziehen|Spiel starten|Start/i.test(x.textContent || ""));
  b && b.click();
});
await page.waitForTimeout(2800);

{
  /* 0. STEHT QUELLTEXT AUF DEM SCHIRM? (v1.1.16, Besitzerbefund mit
     Screenshot: das halbe Brett war von meinem eigenen Kommentar ueberdeckt.)
     URSACHE: ein JSX-Kommentar OHNE geschweifte Klammern. Zwischen
     JSX-Kindern ist /* ... *\/ kein Kommentar, sondern TEXT - React zeigt ihn
     brav an. esbuild meldet nichts, die Proben lesen Quelltext, und drive3
     zaehlte nur Felder. Genau deshalb konnte es durchrutschen, und genau
     deshalb steht diese Probe jetzt VOR allen anderen: sie liest, was auf dem
     Schirm STEHT, und schlaegt bei Code-Resten Alarm. */
  const muell = await page.evaluate(() => {
    const t = document.body.innerText || "";
    const spuren = ["/*", "*/", "v1.", "style={{", "=>", "px)", "em)", "Besitzer:"]
      .filter((m) => t.includes(m));
    return { spuren, probe: t.slice(0, 120).replace(/\n/g, " | ") };
  });
  if (muell.spuren.length) errors.push(`Quelltext auf dem Schirm: ${muell.spuren.join(" ")} | ${muell.probe}`);
  else console.log("   kein Quelltext auf dem Schirm");

  /* 1. STEHT DAS BRETT? Die Felder sind DIVs, nicht Buttons. */
  const brett = await page.evaluate(() => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
    });
    if (!alle.length) return { felder: 0 };
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    const f = alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
    return { felder: f.length, mitFigur: f.filter((d) => d.querySelector("img,svg")).length };
  });
  if (brett.felder < 16) errors.push(`kein Brett im Gefecht (nur ${brett.felder} Felder)`);
  else console.log(`   Brett: ${brett.felder} Felder, ${brett.mitFigur} mit Figur`);

  /* 2. EIN ECHTER ZUG. Eine eigene Figur waehlen, ein Zielfeld antippen. */
  const zug = await page.evaluate(async () => {
    const felder = () => {
      const alle = [...document.querySelectorAll("div")].filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
      });
      const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
      return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
    };
    const eigene = felder().filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
    for (const d of eigene) {
      d.click(); await new Promise((r) => setTimeout(r, 260));
      const ziel = felder().find((z) => /ggZielAtem/.test(z.getAttribute("style") || "") || z.querySelector('[style*="ggZielAtem"]'));
      if (ziel) { ziel.click(); await new Promise((r) => setTimeout(r, 1400)); return true; }
    }
    return false;
  });
  if (!zug) errors.push("kein Zug im Gefecht moeglich (keine Zielfelder gefunden)");
  else console.log("   ein Zug gespielt, der Gegner hat geantwortet");

  /* 3. DAS TALENTBAND liegt UNTER dem Brett, nicht dahinter (v1.0.92). */
  /* ZWEIMAL MESSEN, den besseren Wert nehmen. Ein Lauf meldete 220 px, zwei
     andere 6 px - der Ausreisser fiel mitten in die Antwort des Gegners, wo
     Brett und Band in Bewegung sind. Eine Probe, die bei jedem dritten Lauf
     grundlos Alarm schlaegt, wird ignoriert und ist dann wertlos. */
  const messeBand = async () => page.evaluate(async () => {
    const felder = () => {
      const alle = [...document.querySelectorAll("div")].filter((d) => {
        const r = d.getBoundingClientRect();
        return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
      });
      const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
      return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
    };
    const eigene = felder().filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
    if (eigene.length) { eigene[Math.floor(eigene.length / 2)].click(); await new Promise((r) => setTimeout(r, 450)); }
    /* v1.55.0: die Talent-Zeile ist keine Box mehr (Klasse gg-talentband
       fort), sondern eine ruhige Auskunft mit data-talent-hinweis. Gemessen
       wird wie bisher: sie muss unter dem Brett erscheinen und anschliessen. */
    const b = document.querySelector("[data-talent-hinweis]");
    if (!b) return { da: false };
    const r = b.getBoundingClientRect();
    const unten = Math.max(...felder().map((d) => d.getBoundingClientRect().bottom));
    return { da: true, ueberlappung: +(unten - r.top).toFixed(1) };
  });
  let band = await messeBand();
  if (!band.da || band.ueberlappung > 1 || band.ueberlappung < -60) {
    await page.waitForTimeout(1200);          // Zuganimation auslaufen lassen
    const zweit = await messeBand();
    if (zweit.da && zweit.ueberlappung <= 1 && zweit.ueberlappung >= -60) band = zweit;
  }
  /* ZWEI Schranken, nicht eine. Beim Schaerfen dieser Probe habe ich ihr
     absichtlich einen Fehler untergeschoben (Band 120 px verschoben) - sie
     meldete brav "263 px unter dem Brett" und liess es durch. Ein Band, das
     sich irgendwo unten verliert, ist genauso falsch wie eines dahinter. */
  if (!band.da) errors.push("Talentband erscheint nicht, obwohl eine eigene Figur gewaehlt ist");
  else if (band.ueberlappung > 1) errors.push(`Talentband liegt ${band.ueberlappung} px hinter dem Brett`);
  else if (band.ueberlappung < -60) errors.push(`Talentband haengt ${Math.abs(band.ueberlappung)} px unter dem Brett - es soll daran anschliessen`);
  else console.log(`   Talentband: ${Math.abs(band.ueberlappung)} px unter dem Brett`);
}

await browser.close(); srv.close();

if (errors.length) { console.log("FEHLER:", errors.join(" | ")); process.exit(1); }
console.log("== KEINE FEHLER ==");
