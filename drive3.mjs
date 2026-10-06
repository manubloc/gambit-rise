// drive3 — the road test. Serves the built dist/ over HTTP, boots the app in
// headless Chromium and fails on ANY console error or missing login mask.
// Gate line "== KEINE FEHLER ==" is what the push battery greps for.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { wartenAuf } from "./tools/warten.mjs";
import { appRichtlinie, seitenRichtlinie, inlineHashes } from "./tools/csp.mjs";

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

/* v1.90.19 (Audit A57): jede HTML-Seite kommt mit ihrer Inhaltsrichtlinie,
   SCHARF - live steht sie vorerst nur als Report-Only (tools/seite-bauen.mjs).
   Verletzt das Spiel sie, steht ein Konsolenfehler da, und den wertet diese
   Probe als Fehler. CSP=0 schaltet ab. */
const CSP = process.env.CSP === "0" ? null : {
  app: appRichtlinie(await readFile(AUSLIEFERUNG ? "dist/spielen/index.html" : "dist/index.html", "utf8")),
  seite: AUSLIEFERUNG ? seitenRichtlinie(await readFile("dist/index.html", "utf8")) : null,
};
const mitCsp = (pfad, kopf) => {
  if (!CSP) return kopf;
  const app = !AUSLIEFERUNG || pfad.startsWith("/spielen");
  return { ...kopf, "content-security-policy": app ? CSP.app : CSP.seite };
};
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join("dist", p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    const typ = MIME[extname(f)] || "application/octet-stream";
    res.writeHead(200, typ === "text/html" ? mitCsp(p, { "content-type": typ }) : { "content-type": typ }); res.end(b);
  } catch {
    // SPA-Rueckfall: im Auslieferungsstand gehoert er zur App, nicht zur Seite
    const f = AUSLIEFERUNG ? "dist/spielen/index.html" : "dist/index.html";
    const b = await readFile(f);
    res.writeHead(200, mitCsp(AUSLIEFERUNG ? "/spielen/" : p, { "content-type": "text/html" })); res.end(b);
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
/* v1.90.19: eine CSP-Meldung zitiert die verletzte Direktive, und
   connect-src nennt duell.gambitrise.com - ohne den Ausschluss ginge jede
   Verbindungs-Verletzung hier als "erwartet offline" durch. */
const EXPECTED_OFFLINE = (t) => !/Content Security Policy/i.test(t) && (
  /duell\.gambitrise\.com/.test(t)
  || /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED)/.test(t));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });   /* PW_CHROMIUM: lokaler Pfad, sonst der Cloud-Container (v1.89.4) */
const page = await browser.newPage();
page.on("console", (m) => { if (m.type() === "error" && !EXPECTED_OFFLINE(m.text())) errors.push(m.text().slice(0, 160)); });
page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
/* v1.90.19 (Audit A72): gewartet wird auf Zustaende, nicht auf Uhrzeiten -
   siehe tools/warten.mjs. Vorher 13 feste Schlafzeiten. */
const { bis, ruhe, knopfDa, knopfWeg, brettDa, appDa } = wartenAuf(page);
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
  await bis(() => (document.body.innerText || "").trim().length >= 200, null, 5000);
  const seite = await page.evaluate(() => ({
    titel: document.title || "",
    zeichen: (document.body.innerText || "").trim().length,
    store: /play\.google\.com/.test(document.body.innerHTML),
    spielen: [...document.querySelectorAll("a")].some((a) => /\/spielen\/?$/.test(a.getAttribute("href") || "")),
    eingaben: document.querySelectorAll("input").length,
  }));
  if (seite.zeichen < 200) errors.push(`Landingpage fast leer (${seite.zeichen} Zeichen)`);
  if (!/Gambit/i.test(seite.titel)) errors.push(`Landingpage ohne Titel: "${seite.titel}"`);
  /* v1.90.8 (Audit A30): der Play-Store-Eintrag existiert noch nicht. Diese
     Probe erzwang bis hierher genau den Link, der auf Googles 404-Seite
     fuehrte - eine Probe, die einen Fehler festhaelt. Sie haengt jetzt an
     einem Schalter: erst wenn der Eintrag live ist (STORE_LIVE=1, Schritt S9
     im Store-Backlog), wird wieder scharf geprueft. Solange muss statt
     dessen der Weg ins Spiel da sein - und der wird unten ohnehin geprueft. */
  if (process.env.STORE_LIVE === "1" && !seite.store)
    errors.push("Landingpage ohne Verweis auf den Play Store (STORE_LIVE=1)");
  if (!seite.spielen) errors.push("Landingpage ohne Weg nach /spielen/");
  if (!errors.length) console.log(`   Landingpage steht: "${seite.titel.slice(0, 40)}", ${seite.zeichen} Zeichen`);

  /* Der Dienstarbeiter an der Wurzel MUSS der abmeldende sein (v1.42.0),
     sonst bedient ein alter Zwischenspeicher die Startseite. */
  try {
    const sw = await (await fetch(`http://127.0.0.1:${port}/sw.js`)).text();
    if (!/unregister\(\)/.test(sw)) errors.push("sw.js an der Wurzel meldet sich nicht ab");
    else console.log("   sw.js an der Wurzel raeumt auf");
  } catch { errors.push("sw.js an der Wurzel fehlt"); }

  /* v1.90.19 (A57): traegt dist/_headers die Richtlinie, und passen ihre
     Hashes zu den GEBAUTEN Inline-Skripten? Ein Hash, der nicht passt, hiesse
     live: das Fehlerfang-Skript der App wuerde blockiert, sobald die
     Richtlinie scharf geschaltet ist. */
  try {
    const kopf = await readFile("dist/_headers", "utf8");
    const zeileNach = (pfad) => { const z = kopf.split("\n"); const i = z.findIndex((x) => x.trim() === pfad); return i >= 0 ? (z[i + 1] || "") : ""; };
    const app = zeileNach("/spielen/*"), seite = zeileNach("/");
    const fehlt = [
      ...inlineHashes(await readFile("dist/spielen/index.html", "utf8")).filter((h) => !app.includes(h)).map((h) => "App " + h),
      ...inlineHashes(await readFile("dist/index.html", "utf8")).filter((h) => !seite.includes(h)).map((h) => "Seite " + h),
    ];
    if (!/Content-Security-Policy-Report-Only:/.test(app) || !/Content-Security-Policy-Report-Only:/.test(seite))
      errors.push("dist/_headers ohne Inhaltsrichtlinie fuer /spielen/* oder / (tools/seite-bauen.mjs Schritt 5)");
    else if (fehlt.length) errors.push(`CSP-Hash passt nicht zum gebauten Inline-Skript: ${fehlt.join(", ")}`);
    else console.log("   dist/_headers: Inhaltsrichtlinie (Report-Only) mit passenden Hashes");
  } catch (e) { errors.push("dist/_headers nicht lesbar: " + String(e).slice(0, 80)); }
}

await page.goto(`http://127.0.0.1:${port}${EINSTIEG}`, { waitUntil: "networkidle" });
/* Ein alter Riegel wuerde VOR dem Aufbau fragen (prompt()); der Horcher oben
   faengt ihn, auch wenn die App danach nie aufbaut. */
await appDa(12000);
if (AUSLIEFERUNG) {
  await ruhe(1500);
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

await klick("Erstellen"); await bis(() => !!document.querySelector("input[type=email]"), null, 5000);
try {
  await page.locator("input[type=email]").fill("fahrprobe@probe.local");
  await page.locator("input[type=password]").fill("Probe12345!");
  /* Nach dem Anlegen verschwindet die Anmeldemaske (das Pruefwort braucht
     PBKDF2, 120 000 Runden - darum nicht sofort). */
  await klick("Konto erstellen"); await bis(() => !document.querySelector("input[type=email]"), null, 10000); await ruhe(2600, 400);
  if (await klick("Neuer Spielstand")) { await knopfWeg("Neuer Spielstand", 6000); await ruhe(2600, 400); }
} catch { errors.push("Anmeldung nicht moeglich"); }
for (let i = 0; i < 8; i++) {
  const w = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => /Weiter|Los geht|Überspringen|Skip|Verstanden|Beginnen/i.test(x.textContent || ""));
    if (!b) return false; b.click(); return true;
  });
  if (!w) break;
  await ruhe(1500, 250);
}
await klick("Schnelles Spiel"); await knopfDa("Losziehen|Spiel starten|Start", 6000);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => /Losziehen|Spiel starten|Start/i.test(x.textContent || ""));
  b && b.click();
});
await brettDa(10000);
await ruhe(2800, 400);

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
    /* v1.90.19 (A72): statt 260 ms und 1400 ms zu schlafen, wird gemessen.
       Zielfelder: bis zu 1 s nachsehen. Danach die BESETZUNG des Bretts als
       Zeichenkette - sie muss sich zweimal aendern und jeweils 300 ms stehen:
       einmal durch den eigenen Zug, einmal durch die Antwort. Das traegt,
       weil die KI erst 1000 ms nach dem eigenen Zug antwortet
       (GameScreen.jsx, "a clear beat before the foe moves"). Vorher schrieb
       die Probe "der Gegner hat geantwortet", ohne es je nachzusehen. */
    const warte = (ms) => new Promise((r) => setTimeout(r, ms));
    const besetzung = () => felder().map((d) => (d.querySelector("img,svg") ? "x" : ".")).join("");
    const neueRuhe = async (alt, max) => {
      let s = besetzung(), seit = performance.now();
      const t0 = performance.now();
      while (performance.now() - t0 < max) {
        await warte(100);
        const n = besetzung();
        if (n !== s) { s = n; seit = performance.now(); }
        else if (s !== alt && performance.now() - seit >= 300) return s;
      }
      return null;
    };
    const eigene = felder().filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
    for (const d of eigene) {
      d.click();
      let ziel = null;
      for (let i = 0; i < 10 && !ziel; i++) {
        await warte(100);
        ziel = felder().find((z) => /ggZielAtem/.test(z.getAttribute("style") || "") || z.querySelector('[style*="ggZielAtem"]'));
      }
      if (ziel) {
        const vorher = besetzung();
        ziel.click();
        const nachMeinem = await neueRuhe(vorher, 4000);
        if (!nachMeinem) return { gezogen: false };
        const nachSeinem = await neueRuhe(nachMeinem, 8000);
        return { gezogen: true, geantwortet: !!nachSeinem };
      }
    }
    return { gezogen: false, keinZiel: true };
  });
  if (zug.keinZiel) errors.push("kein Zug im Gefecht moeglich (keine Zielfelder gefunden)");
  else if (!zug.gezogen) errors.push("ein Zielfeld war da, aber der Zug kam nicht auf dem Brett an");
  else if (!zug.geantwortet) errors.push("ein Zug gespielt, aber der Gegner hat binnen 8 s nicht geantwortet");
  else console.log("   ein Zug gespielt, der Gegner hat geantwortet");

  /* 3. DIE KAMPFLEISTE zeigt die gewaehlte Figur, liegt NEBEN oder UNTER dem
     Brett, nie darauf - und das Brett ruehrt sich beim Anwaehlen nicht.
     v1.92.1: bis hierher mass diese Stelle die Zeile "noch keine Talente", die
     BoardView unter das Brett haengte (v1.0.92). Die Zeile ist im Gefecht fort
     (sie lag auf dem Hofwert), ihr Satz steht in der Leiste. Geblieben ist,
     worum es ging: nichts darf hinter oder auf dem Brett liegen. Neu: das Brett
     wird vor und nach dem Anwaehlen gemessen - der Besitzerbefund vom 6.10.
     (848 -> 762 px) am ausgelieferten Stand. tools/pruefe-brettruhe.mjs prueft
     dasselbe gruendlich, diese Stelle prueft es in der ECHTEN App. */
  const messeBand = async () => page.evaluate(async () => {
    const zellen = [...document.querySelectorAll("[data-zelle]")];
    const huelle = () => { let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
      for (const z of zellen) { const q = z.getBoundingClientRect(); l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); }
      return { l, t, r, b }; };
    const vorher = huelle();
    /* abwaehlen, dann eine eigene Figur der vorderen Reihe waehlen */
    const eigene = zellen.filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > (vorher.t + vorher.b) / 2);
    if (eigene.length) { eigene[Math.floor(eigene.length / 2)].click(); await new Promise((r) => setTimeout(r, 450)); }
    const nachher = huelle();
    const le = document.querySelector("[data-kampfleiste]");
    if (!le) return { da: false };
    const r = le.getBoundingClientRect();
    const quer = Math.min(r.right, nachher.r) - Math.max(r.left, nachher.l), hoch = Math.min(r.bottom, nachher.b) - Math.max(r.top, nachher.t);
    return { da: true, bauart: le.getAttribute("data-kampfleiste"), figur: !!le.querySelector("img,svg"),
      ueberlappung: +(Math.min(quer, hoch)).toFixed(1),
      ruck: +Math.max(Math.abs(vorher.l - nachher.l), Math.abs(vorher.t - nachher.t), Math.abs(vorher.r - nachher.r), Math.abs(vorher.b - nachher.b)).toFixed(2),
      breite: Math.round(nachher.r - nachher.l) };
  });
  let band = await messeBand();
  if (!band.da || !band.figur || band.ueberlappung > 1 || band.ruck > 0.5) {
    await ruhe(1500, 300);                    // Zuganimation auslaufen lassen
    const zweit = await messeBand();
    if (zweit.da && zweit.figur && zweit.ueberlappung <= 1 && zweit.ruck <= 0.5) band = zweit;
  }
  if (!band.da) errors.push("Kampfleiste fehlt im Gefecht");
  else if (!band.figur) errors.push("Kampfleiste zeigt die gewaehlte Figur nicht");
  else if (band.ueberlappung > 1) errors.push(`Kampfleiste liegt ${band.ueberlappung} px auf dem Brett`);
  else if (band.ruck > 0.5) errors.push(`das Brett bewegt sich beim Anwaehlen einer Figur um ${band.ruck} px (es muss stehen bleiben)`);
  else console.log(`   Kampfleiste (${band.bauart}) zeigt die Figur, frei vom Brett; Brett ${band.breite} px, steht beim Anwaehlen still`);
}

await browser.close(); srv.close();

if (errors.length) { console.log("FEHLER:", errors.join(" | ")); process.exit(1); }
console.log("== KEINE FEHLER ==");
