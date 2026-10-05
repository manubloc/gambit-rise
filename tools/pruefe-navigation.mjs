/* ── DIE NAVIGATIONSPROBE ──────────────────────────────────────────────────
   Besitzer (26.9.2026): "ich moechte, dass keine Fehler auftreten, wenn ich
   in der Map hin und her gehe, wenn ich auch in die Kapitel zurueckgehe und
   es gibt viele Dinge, die einfach getestet werden muessen, weil auch dort
   ist es manchmal wieder abgestuerzt."

   WARUM EINE EIGENE PROBE: drive3 fuehrt an EINEN Ort (ein Gefecht) und
   messt dort. Abstuerze beim Hin- und Hergehen entstehen aber nicht an einem
   Ort, sondern im UEBERGANG - beim Aufraeumen eines Schirms, waehrend eine
   Zeitschaltung noch laeuft, oder wenn Verlauf und Zustand auseinanderlaufen.
   Das findet nur, wer die Wege WIEDERHOLT faehrt.

   WAS DIESE PROBE BEIM SCHAERFEN GELERNT HAT (wichtig, sonst baut man sie
   wieder falsch): Die zweite Zurueck-Geste im Hub VERLAESST die App - das ist
   gewollt ("wer schon ganz oben steht, darf die App verlassen", App.jsx).
   Die erste Fassung wertete das entstehende about:blank als "weisser Schirm"
   und meldete danach sechs Folgefehler, die es nicht gab. GEMESSEN: Verlauf 3,
   ggTiefe 2 auf der Karte -> 0 im Hub, null Konsolenfehler. Deshalb prueft
   die Probe jetzt IMMER zuerst die Adresse: wer die App verlassen hat, ist
   nicht abgestuerzt, sondern draussen - dann wird neu geladen und
   weitergefahren. Eine Probe, die Erwartetes als Fehler meldet, wird
   ignoriert und ist dann wertlos.

   SEIT v1.90.11 (Audit A15) FAEHRT SIE AUCH DEN RUECKBLICK. Vorher tat sie
   es nicht, behauptete im Kopf aber "das ganze Haus" - und CLAUDE.md hat es
   uebernommen. Der Grund war banal: jede Fahrt beginnt mit einem frischen
   Konto auf Liga 1, und der ‹-Knopf existiert dort gar nicht. Der Absturz A3
   (paintedById ohne Import) stand deshalb wochenlang im Rueckblickfenster,
   waehrend die Kette gruen war. Jetzt wird der Stand vor der ersten Runde
   auf Liga 3 gehoben.

   AUFRUF: node tools/pruefe-navigation.mjs   (RUNDEN=5 fuer laengere Laeufe)
   Vorher `npx vite build` oder `npm run build:app`, damit dist/ die APP
   traegt. Nach `npm run build` liegt dort die Landingpage - dann bricht die
   Probe mit einer Ansage ab, statt sinnlos zu messen.                      */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { wartenAuf } from "./warten.mjs";
import { appRichtlinie } from "./csp.mjs";

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".woff": "font/woff",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon", ".txt": "text/plain",
};
const WURZEL = process.env.WURZEL || "dist";
const RUNDEN = Number(process.env.RUNDEN || 3);

if (!existsSync(join(WURZEL, "index.html"))) {
  console.error(`${WURZEL}/index.html fehlt - erst 'npx vite build' laufen lassen`);
  process.exit(1);
}

/* v1.90.19 (Audit A57): die Seite kommt mit der Inhaltsrichtlinie der App,
   SCHARF (nicht Report-Only) - jede Verletzung ist ein Konsolenfehler und
   damit ein Befund dieser Probe. Die Richtlinie rechnet tools/csp.mjs, wie
   beim Bau. CSP=0 schaltet sie ab (zum Vergleich). */
/* Schluessel-Praefixe aus strings.js - fuer die Probe "Schluessel statt Text" */
const SCHLUESSEL_MUSTER = (() => {
  const roh = readFileSync("src/app/i18n/strings.js", "utf8");
  const pre = [...new Set([...roh.matchAll(/"([a-zA-Z]+)\.[a-zA-Z0-9_]+":/g)].map((m) => m[1]))];
  /* Praefix, Punkt, Kleinbuchstabe ohne Leerzeichen - in Fliesstext kommt
     das nicht vor ("gambitrise.com" hat kein Praefix aus der Liste). */
  return `\\b(?:${pre.join("|")})\\.[a-z][a-zA-Z0-9_]*\\b`;
})();
const CSP = process.env.CSP === "0" ? null : appRichtlinie(await readFile(join(WURZEL, "index.html"), "utf8"));
const html = (kopf) => (CSP ? { ...kopf, "content-security-policy": CSP } : kopf);
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join(WURZEL, p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    const typ = MIME[extname(f)] || "application/octet-stream";
    res.writeHead(200, typ === "text/html" ? html({ "content-type": typ }) : { "content-type": typ });
    res.end(b);
  } catch {
    try {
      const b = await readFile(join(WURZEL, "index.html"));
      res.writeHead(200, html({ "content-type": "text/html" })); res.end(b);
    } catch { res.writeHead(404); res.end(); }
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const START = `http://127.0.0.1:${port}/`;

/* Die Halle (duell.gambitrise.com) ist aus der Sandkiste nicht erreichbar.
   GET /design darf still fehlschlagen - livery.js faellt auf APP_DESIGN
   zurueck. Dieses Paar ist das EINZIGE, was die Probe duldet (wie drive3). */
/* Eine CSP-Meldung zitiert die verletzte Direktive - und connect-src nennt
   duell.gambitrise.com. Ohne den Ausschluss ginge jede Verbindungs-
   Verletzung als "erwartet offline" durch. */
const ERWARTET_OFFLINE = (t) => !/Content Security Policy/i.test(t) && (
  /duell\.gambitrise\.com/.test(t)
  || /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED|NAME_NOT_RESOLVED|CONNECTION_REFUSED)/.test(t));

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();

let schritt = "Start";
const fehler = [];
const melde = (was) => fehler.push(`[${schritt}] ${was}`);
page.on("console", (m) => {
  if (m.type() !== "error") return;
  const t = m.text();
  if (!ERWARTET_OFFLINE(t)) melde("Konsolenfehler: " + t.slice(0, 180));
});
page.on("pageerror", (e) => melde("Seitenfehler: " + String(e).slice(0, 180)));
/* v1.90.19 (Audit A72): gewartet wird auf Zustaende, nicht auf Uhrzeiten
   (tools/warten.mjs). ruhe(x) mit x = der alten Schlafzeit ist nie langsamer
   als vorher; vor jedem Klick auf etwas, das erst erscheinen muss, steht
   bis()/knopfDa(). */
const { bis, ruhe, knopfDa, knopfWeg, brettDa, appDa } = wartenAuf(page);
const KREUZ = "^✕$|^×$|^Schliessen$|^Schließen$";
const karteDa = (max) => bis(() => [...document.querySelectorAll("button")]
  .map((b) => b.getBoundingClientRect())
  .filter((r) => r.width > 20 && r.width < 46 && Math.abs(r.width - r.height) < 6 && r.top > 40).length >= 4, null, max);

const klick = (muster) => page.evaluate((m) => {
  const re = new RegExp(m, "i");
  const b = [...document.querySelectorAll("button")]
    .filter((x) => x.getBoundingClientRect().width > 0)
    .find((x) => re.test(x.textContent || ""));
  if (b) { b.click(); return (b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34); }
  return null;
}, muster);

const stationen = () => page.evaluate(() => [...document.querySelectorAll("button")]
  .map((b) => b.getBoundingClientRect())
  .filter((r) => r.width > 20 && r.width < 46 && Math.abs(r.width - r.height) < 6 && r.top > 40).length);

const stationKlick = (nr) => page.evaluate((i) => {
  const s = [...document.querySelectorAll("button")]
    .map((b) => ({ b, r: b.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 20 && r.width < 46 && Math.abs(r.width - r.height) < 6 && r.top > 40);
  if (!s.length) return null;
  const z = s[i % s.length];
  z.b.click();
  return Math.round(z.r.left) + "," + Math.round(z.r.top);
}, nr);

/* ── Lebt die App noch? ────────────────────────────────────────────────────
   ZUERST die Adresse. Wer die App verlassen hat (about:blank), ist draussen
   und nicht abgestuerzt - der Aufrufer laedt dann neu. Erst danach zaehlt ein
   leerer Wurzelknoten als das, was der Besitzer "abgestuerzt" nennt. */
const zustand = async (wo) => {
  if (!page.url().startsWith("http")) return { draussen: true };
  let d;
  try {
    d = await page.evaluate(() => {
      const w = document.getElementById("root") || document.body.firstElementChild;
      return {
        knoten: w ? w.childElementCount : 0,
        zeichen: (document.body.innerText || "").trim().length,
        knoepfe: document.querySelectorAll("button").length,
      };
    });
  } catch (e) {
    melde(`Seite antwortet nicht bei ${wo}: ${String(e).slice(0, 90)}`);
    return { tot: true };
  }
  if (d.knoten === 0 || d.zeichen < 12 || d.knoepfe === 0) {
    melde(`weisser Schirm bei ${wo} (Knoten ${d.knoten}, ${d.zeichen} Zeichen, ${d.knoepfe} Knoepfe)`);
    return { tot: true };
  }
  /* v1.90.19 (Audit A75): steht ein SCHLUESSEL statt eines Textes da? makeT
     liefert bei einem fehlenden Schluessel den Schluessel selbst ("camp.boss"),
     und das faellt nur auf, wenn jemand hinsieht. test_ui prueft jedes
     woertliche t("…"); dynamisch gebildete faengt erst diese Probe. */
  const roh = await page.evaluate((re) => (document.body.innerText.match(new RegExp(re, "g")) || []).slice(0, 4), SCHLUESSEL_MUSTER).catch(() => []);
  if (roh.length) melde(`i18n-Schluessel statt Text bei ${wo}: ${roh.join(", ")}`);
  return d;
};

/* Nach dem Verlassen wieder hinein. Das Konto liegt im localStorage, also
   fuehrt "Weiterspielen" direkt zurueck in den Hub. */
const wiederHinein = async () => {
  await page.goto(START, { waitUntil: "networkidle" });
  await appDa(10000); await ruhe(1600, 300);
  for (let i = 0; i < 8; i++) {
    if (!(await klick("Weiterspielen|Los geht|Verstanden|Beginnen"))) break;
    await ruhe(1200, 250);
  }
};

const zurKarte = async () => {
  if (!(await klick("^Kampagne"))) { melde("Knopf 'Kampagne' nicht gefunden"); return false; }
  /* Der Kapitelschirm bietet "Weiter zur Karte", oder die Karte steht gleich. */
  await bis(() => [...document.querySelectorAll("button")].some((b) => /Weiter zur Karte/.test(b.textContent || ""))
    || [...document.querySelectorAll("button")].map((b) => b.getBoundingClientRect())
      .filter((r) => r.width > 20 && r.width < 46 && Math.abs(r.width - r.height) < 6 && r.top > 40).length >= 4, null, 6000);
  if ((await zustand("Kapitelschirm")).tot) return false;
  for (let i = 0; i < 4; i++) {
    if (await karteDa(300)) break;               // die Karte steht schon
    await knopfDa("Weiter zur Karte", 3000);
    if (!(await klick("Weiter zur Karte"))) break;
    await ruhe(2200, 400);
  }
  /* Die Stationen erscheinen nicht auf einen Schlag: im ersten Lauf mit
     bis() zaehlte Runde 2 "17 Stationen", die Runden davor und danach 43.
     Also nach dem ersten Erscheinen noch warten, bis die Karte stillsteht. */
  await karteDa(5000); await ruhe(1500, 300);
  const z = await zustand("Karte");
  if (z.tot || z.draussen) return false;
  const n = await stationen();
  if (n < 4) { melde(`nur ${n} Stationen auf der Karte - sie ist nicht aufgebaut`); return false; }
  return n;
};

// ── Einstieg ───────────────────────────────────────────────────────────────
schritt = "Einstieg";
await page.goto(START, { waitUntil: "networkidle" });
await appDa(12000);
if (!(await klick("Erstellen"))) melde("Knopf 'Erstellen' nicht gefunden - steckt die App hinter dem Riegel?");
await bis(() => !!document.querySelector("input[type=email]"), null, 5000);
try {
  await page.locator("input[type=email]").fill(`nav${Date.now()}@probe.local`);
  await page.locator("input[type=password]").fill("Probe12345!");
  await klick("Konto erstellen");
  await bis(() => !document.querySelector("input[type=email]"), null, 10000);   // PBKDF2 braucht einen Augenblick
  await ruhe(3000, 400);
} catch { melde("Anmeldung nicht moeglich"); }
for (let i = 0; i < 10; i++) {
  if (!(await klick("Los geht|Verstanden|Beginnen"))) break;
  await ruhe(1200, 250);
}
await zustand("nach dem Einstieg");
console.log("   Einstieg: im Hub");

/* ── v1.90.11 (Audit A15): DER RUECKBLICK WURDE NIE GEFAHREN ────────────
   Diese Probe behauptete im Kopf "das ganze Haus", und CLAUDE.md hat es
   uebernommen. Sie faengt aber mit einem frischen Konto an, und ein frisches
   Konto steht auf Liga 1 - dort gibt es den ‹-Knopf gar nicht
   (CampaignScreen.jsx: `viewLeague > 1 && ...`). Der Rueckblick, in dem der
   Absturz A3 wochenlang stand (`paintedById` ohne Import), lag damit
   ausserhalb JEDER Probe: die Kette war gruen, das Fenster stuerzte ab.

   Also wird der Stand hier angehoben - direkt im Speicher, wie es ein
   Spieler nach zwei Kapiteln haette. Das Profil liegt unter
   `gambit:u::save:<konto>:<stand>`; angefasst wird nur die Liga, alles
   andere bleibt, wie die App es angelegt hat. Danach ein Neuladen, damit
   die App den Stand frisch liest. */
schritt = "Rueckblick vorbereiten";
const VOLL = process.env.GEKLAERT === "1" ? await (async () => {
  const c = await import("../src/content/index.js");
  return { stationen: c.CAMPAIGN.map((n) => n.id), figuren: Object.keys(c.CHARACTERS) };
})() : null;
const liga = await page.evaluate((voll) => {
  try {
    const P = "gambit:u::save:";
    const k = Object.keys(localStorage).filter((x) => x.startsWith(P));
    if (!k.length) return { fehler: "kein Spielstand im Speicher" };
    const prof = JSON.parse(localStorage.getItem(k[0]));
    prof.campaign = prof.campaign || {};
    prof.campaign.league = 3;
    /* v1.90.34: GEKLAERT=1 klaert dazu jede Station und gewinnt jede Figur -
       dann zeigen die Stationsfenster ihre LANGE Fassung (Bildnis, Geschichte,
       Gefolge-Kasten, Info-Knopf), und die Fenstermessung unten greift dort,
       wo der Besitzer am 5.10. den Bildlauf fand. Nicht der Standard: die
       Runden brauchen sonst offene Stationen zum Betreten. */
    if (voll) { prof.campaign.cleared = voll.stationen; prof.campaign.unlocked = voll.figuren; }
    localStorage.setItem(k[0], JSON.stringify(prof));
    return { liga: prof.campaign.league, schluessel: k.length };
  } catch (e) { return { fehler: String(e && e.message || e) }; }
}, VOLL);
if (liga.fehler) melde("Rueckblick nicht vorbereitbar: " + liga.fehler);
else {
  await page.reload({ waitUntil: "networkidle" });
  await appDa(10000); await ruhe(2500, 400);
  for (let i = 0; i < 6; i++) { if (!(await klick("Los geht|Verstanden|Beginnen|Weiterspielen"))) break; await ruhe(1200, 250); }
  await zustand("nach dem Anheben auf Liga 3");
  console.log(`   Spielstand steht auf Liga ${liga.liga} - der Rueckblick ist erreichbar`);
}

// ── Runden ─────────────────────────────────────────────────────────────────
/* v1.90.18 (Audit A42): der VERLAUF wird mitgezaehlt. Zwei Zurueck-Hooks
   legten je Partie zwei Eintraege an und nach jedem Zurueck einen weiteren -
   die Probe mass `history` nie. Jetzt: Laenge zu Beginn jeder Runde. */
const verlauf = [];
const fensterMass = [];   // v1.90.34: Hoehen der gemessenen Stationsfenster
for (let runde = 1; runde <= RUNDEN; runde++) {
  console.log(`\n== RUNDE ${runde} von ${RUNDEN} ==`);
  verlauf.push(await page.evaluate(() => history.length).catch(() => null));

  // 1. Hub -> Kampagne -> Kapitelschirm -> Karte
  schritt = `R${runde} Hub->Karte`;
  const anzahl = await zurKarte();
  if (!anzahl) { await wiederHinein(); continue; }
  console.log(`   Karte steht: ${anzahl} Stationen`);

  // 2. Stationen oeffnen und schliessen ("in der Map hin und her gehen")
  schritt = `R${runde} Stationen`;
  let offen = 0;
  for (let s = 0; s < 6; s++) {
    schritt = `R${runde} Station ${s + 1} oeffnen`;
    if (!(await stationKlick(s * 3 + runde))) { melde("keine Station anklickbar"); break; }
    await knopfDa(KREUZ, 3000);
    if ((await zustand(`Stationsfenster ${s + 1}`)).tot) break;
    offen++;
    /* v1.90.34 (Besitzer 5.10.: "immer die Hoehe, die es benoetigt, dass alles
       drauf passt"): das Fenster darf keinen Bildlauf brauchen und muss ganz
       im Schirm stehen - auch mit aufgeklapptem Info-Text. */
    for (const lage of ["zu", "Info auf"]) {
      if (lage === "Info auf" && !(await page.evaluate(() => {
        const f = document.querySelector("[data-stationsfenster]");
        const b = f && [...f.querySelectorAll("button")].find((x) => (x.textContent || "").trim() === "i");
        if (b) b.click(); return !!b; }))) break;
      await ruhe(400, 120);
      const m = await page.evaluate(() => {
        const f = document.querySelector("[data-stationsfenster]"); if (!f) return null;
        const r = f.getBoundingClientRect();
        return { sh: f.scrollHeight, ch: f.clientHeight, oben: Math.round(r.top), unten: Math.round(r.bottom), vh: innerHeight };
      });
      if (!m) { if (lage === "zu") melde("Stationsfenster ohne Kennung data-stationsfenster"); break; }
      fensterMass.push(m.ch);
      if (process.env.FOTO) await page.screenshot({ path: `${process.env.FOTO}/fenster-r${runde}-s${s + 1}-${lage === "zu" ? "zu" : "info"}.png` });
      if (m.sh > m.ch + 1) melde(`Stationsfenster (${lage}) braucht Bildlauf: Inhalt ${m.sh} px in ${m.ch} px`);
      if (m.oben < 0 || m.unten > m.vh) melde(`Stationsfenster (${lage}) ragt aus dem Schirm: ${m.oben}..${m.unten} von ${m.vh}`);
    }
    schritt = `R${runde} Station ${s + 1} schliessen`;
    if (!(await klick(KREUZ))) {
      melde("Stationsfenster hat keinen Schliessknopf");
      break;
    }
    await knopfWeg(KREUZ, 2000); await ruhe(800, 250);
    if ((await zustand(`Karte nach Station ${s + 1}`)).tot) break;
  }
  console.log(`   ${offen} Stationen geoeffnet und geschlossen · ${fensterMass.length} Fensterlagen gemessen (ohne Bildlauf, im Schirm), Hoehen ${Math.min(...fensterMass, 9999)}–${Math.max(...fensterMass, 0)} px`);

  // 3. DER VOLLE SPIELFLUSS: Station -> Gefecht -> zurueck auf die Karte.
  //    Genau das, was der Besitzer als "in die Kapitel zurueckgehen" meint,
  //    und der Weg, auf dem am meisten aufgeraeumt werden muss.
  schritt = `R${runde} Gefecht starten`;
  /* Nicht jede Station ist spielbar: auf der Karte steht nur die erreichbare
     offen, alles andere ist gesperrt (gemessen - die erste Fassung klickte
     Station 1..3 und meldete dreimal "kein Startknopf", was kein Fehler war,
     sondern eine Spielregel). Also der Reihe nach probieren, bis eine Station
     einen Startknopf zeigt.

     UND: ein pausierter Kampf heisst nicht mehr "Herausforderung starten",
     sondern "Fortsetzen". Wer das Wort nicht kennt, meldet ab der zweiten
     Runde "keine Station laesst sich betreten" - vier Runden lang, sauber
     reproduzierbar, und trotzdem kein Fehler der App: sie hat den Kampf beim
     Verlassen gesichert, genau wie ihre Rueckfrage es ansagt. */
  let los = null;
  for (let v = 0; v < 12 && !los; v++) {
    if (!(await stationKlick(v))) break;
    await knopfDa(KREUZ, 2500); await ruhe(900, 250);
    los = await klick("Herausforderung starten|Losziehen|Spiel starten|Antreten|Fortsetzen|fortsetzen");
    if (!los) {
      await klick(KREUZ);
      await knopfWeg(KREUZ, 2000);
    }
  }
  if (!los) melde("keine einzige Station laesst sich betreten - der Weg ins Gefecht ist zu");
  {
    if (los) {
      await brettDa(8000); await ruhe(3200, 400);
      if (!(await zustand("Gefecht")).tot) {
        console.log("   Gefecht betreten");
        // Einen Zug spielen, damit auch Zustand entsteht, der aufgeraeumt
        // werden muss (Auswahl, Animation, Zugverlauf).
        schritt = `R${runde} Zug im Gefecht`;
        await page.evaluate(async () => {
          const felder = () => {
            const alle = [...document.querySelectorAll("div")].filter((d) => {
              const r = d.getBoundingClientRect();
              return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
            });
            if (!alle.length) return [];
            const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
            return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
          };
          const eigene = felder().filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.42);
          for (const d of eigene) {
            d.click();
            let ziel = null;
            for (let i = 0; i < 10 && !ziel; i++) {   // A72: nachsehen statt 260 ms schlafen
              await new Promise((r) => setTimeout(r, 100));
              ziel = felder().find((z) => /ggZielAtem/.test(z.getAttribute("style") || "") || z.querySelector('[style*="ggZielAtem"]'));
            }
            if (ziel) { ziel.click(); await new Promise((r) => setTimeout(r, 1200)); return true; }
          }
          return false;
        });
        await zustand("nach einem Zug");

        // MITTEN IM GEFECHT heraus - der harte Fall fuers Aufraeumen.
        schritt = `R${runde} Gefecht verlassen`;
        /* Der Ausgang heisst "‹ Zurück" - MIT Winkel davor. Ein Muster mit
           ^Anker traf ihn nicht, und die Probe klickte stattdessen
           "Aufgeben": die Partie war weg, die Karte kam nie wieder, und drei
           Runden lang meldete sie "keine Station laesst sich betreten".
           Gemessen, nicht geraten (die Knopfzeile im Gefecht lautet
           "‹ Zurück / Aufgeben / Kampf beginnen ›"). */
        const raus = await klick("Zurück|Zurueck|Verlassen");
        if (!raus) {
          await page.goBack().catch(() => {});  // Zurueck-Geste als zweiter Weg
        } else {
          /* "‹ Zurück" fragt ZURUECK, und das ist gut so: "Kampf verlassen?
             Der Kampf wird gesichert - du kannst ihn spaeter an derselben
             Station fortsetzen." mit den Knoepfen "Pausieren & wechseln" und
             "Zurück zum Kampf". Wer die Rueckfrage nicht beantwortet, bleibt
             im Gefecht - und genau daran hat sich diese Probe drei Fassungen
             lang selbst getaeuscht: sie meldete vier Runden "keine Station
             laesst sich betreten", weil sie das Gefecht nie verlassen hatte. */
          await knopfDa("Pausieren", 2000);
          const bestaetigt = await klick("Pausieren & wechseln|Pausieren");
          if (!bestaetigt) melde("die Rueckfrage 'Kampf verlassen?' hat keinen Knopf zum Pausieren");
        }
        await ruhe(2200, 400);
        const z = await zustand("zurueck nach dem Gefecht");
        if (z.draussen) { await wiederHinein(); }
        else console.log("   Gefecht mitten im Spiel verlassen");
      }
    }
  }

  // 4. Reiter hin und her - Figuren, Lager, Profil und zurueck auf Spielen.
  /* ERST DIE KARTE VERLASSEN: dort ist die Reiterleiste absichtlich
     ausgeblendet (App.jsx: `immersive = inMatch || view === "camp"`). Die
     zweite Fassung dieser Probe suchte die Reiter auf der Karte und meldete
     viermal vier Fehler, die keine waren. */
  schritt = `R${runde} Karte verlassen`;
  for (let i = 0; i < 3; i++) {
    const reiterDa = await page.evaluate(() => [...document.querySelectorAll("button")]
      .some((b) => /^(Figuren|Lager|Profil)$/.test((b.textContent || "").trim())));
    if (reiterDa) break;
    await page.goBack().catch(() => {});
    await ruhe(900, 250);
    const z = await zustand("beim Verlassen der Karte");
    if (z.draussen) { await wiederHinein(); break; }
    if (z.tot) break;
  }
  schritt = `R${runde} Reiter`;
  let reiterOk = 0;
  for (const reiter of ["Figuren", "Lager", "Profil", "Spielen"]) {
    if (!(await klick(`^${reiter}$`))) { melde(`Reiter '${reiter}' nicht gefunden`); continue; }
    await ruhe(1300, 300);
    if ((await zustand(`Reiter ${reiter}`)).tot) break;
    reiterOk++;
  }
  console.log(`   ${reiterOk} Reiter durchgefahren`);

  /* 4b. ALLE UEBRIGEN SCHIRME. Besitzer: "es gibt viele Dinge, die einfach
     getestet werden muessen." Die Runde oben faehrt Karte und Gefecht; hier
     kommt der Rest des Hauses dazu, jeder Schirm hin und zurueck:
       Schnelles Spiel (mit Anpassen) - Die Akademie - Online-Duell -
       die Unterreiter im Figuren-Schirm (Hofstaat, Aufstellung, Ausruestung) -
       Erfolge - Profil.
     Der Figuren-Schirm ist dabei der wichtigste: ArmyScreen.jsx ist mit 3143
     Zeilen und 31 Hooks die groesste Datei des Hauses, also die mit der
     hoechsten Wahrscheinlichkeit fuer einen Fehler beim Aufraeumen. */
  schritt = `R${runde} uebrige Schirme`;
  for (const [knopf, name] of [["Schnelles Spiel", "Schnelles Spiel"],
                               ["Die Akademie", "Akademie"],
                               ["Online-Duell", "Online-Duell"]]) {
    schritt = `R${runde} ${name}`;
    if (!(await klick(`^${knopf}`))) { melde(`Knopf '${knopf}' im Hub nicht gefunden`); continue; }
    await knopfDa("Zurück|Zurueck", 4000); await ruhe(2000, 300);
    if ((await zustand(name)).tot) break;
    // wieder heraus: der Zurueck-Knopf des Unterschirms, sonst die Geste
    if (!(await klick("Zurück|Zurueck"))) await page.goBack().catch(() => {});
    await knopfDa("^Schnelles Spiel", 4000); await ruhe(1200, 250);
    const z = await zustand(`Hub nach ${name}`);
    if (z.draussen) { await wiederHinein(); break; }
    if (z.tot) break;
    console.log(`   ${name}: hin und zurueck`);
  }

  /* Die Unterreiter im Figuren-Schirm. Es sind ZWEI, und das ist richtig, kein
     fehlender Fund: die Leiste traegt nur "Figuren" (tree) und "Aufstellung"
     (formation) - der Haendler-Zweig (gear) steht seit v0.72.2 nicht mehr
     darin, sein Zuhause ist das Lager, und dort faehrt diese Probe ihn
     ohnehin an (ArmyScreen.jsx:3019-3027, nachgesehen am 26.9., nachdem die
     Meldung "2 Unterreiter" nach zu wenig aussah). Gedrueckt wird die oberste
     Knopfzeile der Reihe nach, mit Lebensprobe nach jedem Klick. */
  schritt = `R${runde} Figuren-Unterreiter`;
  if (await klick("^Figuren$")) {
    await ruhe(1600, 300);
    const reiterZahl = await page.evaluate(() => {
      const oben = [...document.querySelectorAll("button")]
        .filter((b) => { const r = b.getBoundingClientRect(); return r.top < 260 && r.width > 40 && r.height > 20 && r.height < 70; });
      return oben.length;
    });
    for (let i = 0; i < Math.min(reiterZahl, 6); i++) {
      const wohin = await page.evaluate((n) => {
        const oben = [...document.querySelectorAll("button")]
          .filter((b) => { const r = b.getBoundingClientRect(); return r.top < 260 && r.width > 40 && r.height > 20 && r.height < 70; });
        if (!oben[n]) return null;
        const t = (oben[n].textContent || "").trim().replace(/\s+/g, " ").slice(0, 20);
        oben[n].click(); return t || `Reiter ${n}`;
      }, i);
      if (!wohin) break;
      await ruhe(1500, 300);
      if ((await zustand(`Figuren-Unterreiter "${wohin}"`)).tot) break;
    }
    console.log(`   Figuren: ${Math.min(reiterZahl, 6)} Unterreiter durchgefahren`);
  } else melde("Reiter 'Figuren' nicht gefunden");

  schritt = `R${runde} Erfolge und Profil`;
  for (const reiter of ["Lager", "Profil", "Spielen"]) {
    if (!(await klick(`^${reiter}$`))) { melde(`Reiter '${reiter}' nicht gefunden`); continue; }
    await ruhe(1400, 300);
    if ((await zustand(`Reiter ${reiter} (zweite Fahrt)`)).tot) break;
  }

  // 5. Noch einmal auf die Karte und mit der ZURUECK-GESTE heraus. Eine
  //    Geste: Karte -> Hub. Mehr nicht, denn die zweite verlaesst die App
  //    (gewollt) und macht die Messung blind.
  schritt = `R${runde} Karte + Zurueck-Geste`;
  if (await zurKarte()) {
    await page.goBack().catch(() => {});
    await ruhe(1000, 250);
    const z = await zustand("nach der Zurueck-Geste");
    if (z.draussen) { melde("die Zurueck-Geste hat die App von der Karte aus verlassen - erwartet waere der Hub"); await wiederHinein(); }
    else {
      const wo = await page.evaluate(() => (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 40));
      console.log(`   Zurueck-Geste fuehrt in den Hub: "${wo}"`);
    }
  } else await wiederHinein();
}

/* ── v1.90.11 (Audit A15): DER RUECKBLICK, EINMAL GANZ DURCH ───────────
   ‹ blaettert in ein frueheres Kapitel. Dort erscheint NICHT das gewoehnliche
   Stationsfenster, sondern ein zweites, schlichtes - das Rueckblickfenster
   (CampaignScreen.jsx um Z. 1180). Genau dort stand A3. Gefahren wird der
   ganze Weg: zurueckblaettern, eine Station antippen, den Freundschaftskampf
   betreten und wieder heraus, dann › nach vorn und ueber die Weltkarte
   zurueck. Jeder Konsolenfehler unterwegs zaehlt wie ueberall in dieser
   Probe als Absturz. */
schritt = "Rueckblick";
console.log("\n== RUECKBLICK (Audit A15) ==");
if ((await stationen()) >= 4 || (await zurKarte())) {
  /* Der ‹-Knopf traegt keinen Text, nur ein Zeichen - er wird ueber seine
     Lage gefunden: runder Knopf oben links im Kartenrahmen, 40x40.
     GEMESSEN, nicht geraten: daneben sitzen der lila Atlas-Knopf (Weltkarte)
     und rechts der ›-Knopf, alle drei gleich gross. Unterschieden wird an
     der x-Lage - der Atlas steht ganz links, ‹ direkt dahinter. */
  const runde40 = async () => page.evaluate(() => [...document.querySelectorAll("button")]
    .map((b, i) => { const r = b.getBoundingClientRect(); return { i, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((b) => b.w >= 36 && b.w <= 44 && b.h >= 36 && b.h <= 44 && b.y < 220)
    .sort((a, b2) => a.x - b2.x));
  const knoepfe = await runde40();
  if (knoepfe.length < 2) melde(`der Rueckblick-Pfeil ist nicht zu finden (${knoepfe.length} runde Knoepfe oben)`);
  else {
    await page.evaluate((i) => { const b = [...document.querySelectorAll("button")][i]; b && b.click(); }, knoepfe[1].i);
    await ruhe(1800, 400);
    const z1 = await zustand("Rueckblick: ein Kapitel zurueck");
    if (!z1.tot && !z1.draussen) {
      console.log("   ein Kapitel zurueckgeblaettert");
      /* › und wieder ‹ - beides SOFORT, solange der Schirm noch im
         Rueckblick steht. Hinter dem Freundschaftskampf baut sich
         CampaignScreen neu auf und steht wieder auf der hoechsten Liga:
         dort gibt es kein › mehr, und die Pruefung uebersprang sich selbst,
         ohne ein Wort zu sagen (gemessen im ersten Lauf). */
      const vor = await runde40();
      if (vor.length < 3) melde(`im Rueckblick fehlt der Vorwaerts-Pfeil (${vor.length} runde Knoepfe statt 3)`);
      else {
        await page.evaluate((i) => { const b = [...document.querySelectorAll("button")][i]; b && b.click(); }, vor[vor.length - 1].i);
        await ruhe(1500, 400);
        if (!(await zustand("Rueckblick: wieder nach vorn")).tot) console.log("   wieder nach vorn geblaettert");
        const zur = await runde40();
        if (zur.length >= 2) {
          await page.evaluate((i) => { const b = [...document.querySelectorAll("button")][i]; b && b.click(); }, zur[1].i);
          await ruhe(1500, 400);
          await zustand("Rueckblick: erneut zurueck");
        }
      }
      /* Stationen im frueheren Kapitel antippen - dort oeffnet das
         Rueckblickfenster. Es hat KEIN Kreuz, es schliesst durch einen
         Klick daneben; also wird nach jedem Fenster auf die Karte getippt. */
      let gesehen = 0, gestartet = false;
      for (let s2 = 0; s2 < 8 && gesehen < 3; s2++) {
        if (!(await stationKlick(s2))) break;
        await ruhe(1000, 300);
        if ((await zustand(`Rueckblickfenster ${s2 + 1}`)).tot) break;
        gesehen++;
        /* Genau EINMAL auch hineingehen: "Freundschaftskampf" ist der einzige
           Knopf des Rueckblickfensters, und er fuehrt in ein echtes Gefecht. */
        if (!gestartet && (await klick("Freundschaftskampf|Friendly"))) {
          gestartet = true;
          await brettDa(8000); await ruhe(3200, 400);
          if (!(await zustand("Freundschaftskampf aus dem Rueckblick")).tot) {
            console.log("   Freundschaftskampf aus dem Rueckblick betreten");
            if (await klick("Zurück|Zurueck|Verlassen")) {
              await knopfDa("Pausieren|Verlassen", 2000);
              await klick("Pausieren & wechseln|Pausieren|Verlassen");
            } else await page.goBack().catch(() => {});
            await ruhe(2200, 400);
            const zr = await zustand("zurueck aus dem Freundschaftskampf");
            if (zr.draussen) { await wiederHinein(); break; }
          }
          /* GEMESSEN (erster Lauf dieser Erweiterung): nach dem Verlassen
             des Freundschaftskampfs steht die Karte oft SCHON da. Wer dann
             blind zurKarte() ruft, sucht den Knopf "Kampagne" im Hub und
             meldet ihn als fehlend - ein Fehler, der keiner ist. Also erst
             nachsehen, ob die Karte da ist. */
          if ((await stationen()) < 4 && !(await zurKarte())) break;
          await ruhe(600, 250);
          continue;
        }
        await page.mouse.click(12, 400);       // daneben tippen schliesst es
        await ruhe(700, 250);
        if ((await zustand(`Karte nach Rueckblickfenster ${s2 + 1}`)).tot) break;
      }
      console.log(`   ${gesehen} Rueckblickfenster geoeffnet${gestartet ? ", eines bespielt" : ""}`);

      /* Ueber die Weltkarte zurueck ins Kapitel. Der Knopf heisst
         "Hierhin reisen" bzw. "Du bist hier - zur Karte" (strings.js:
         camp.worldTravel / camp.worldHere) - GEMESSEN, nachdem ein Muster
         auf "Reisen" ihn nicht traf und der Schritt sich stumm uebersprang.
         Genau diese Stille ist der Befund von A15, also meldet jeder
         ausgefallene Schritt sich ab jetzt laut. */
      if ((await stationen()) < 4 && !(await zurKarte())) melde("nach dem Rueckblick fuehrt kein Weg zurueck auf die Karte");
      else {
        const k3 = await runde40();
        if (!k3.length) melde("der Weltkarten-Knopf ist auf der Karte nicht zu finden");
        else {
          await page.evaluate((i) => { const b = [...document.querySelectorAll("button")][i]; b && b.click(); }, k3[0].i);
          await ruhe(1800, 400);
          const zw = await zustand("Weltkarte");
          if (!zw.tot && !zw.draussen) {
            console.log("   Weltkarte geoeffnet");
            /* Eine erreichte Welt antippen, damit das Lore-Blatt mit dem
               Reiseknopf erscheint. GEMESSEN, nachdem ein blinder Klick in
               die Bildmitte nie traf: die zwoelf Welten sind absolut
               gesetzte Punkte IM Querscroller (CampaignScreen.jsx:1083,
               `left: x%, top: y%, translate(-50%,-50%)`, nur die erreichten
               mit `cursor: pointer`). Sie werden im DOM gesucht und direkt
               angeklickt, statt auf eine Bildschirmstelle zu hoffen. */
            const welten = await page.evaluate(() => {
              const w = [...document.querySelectorAll("div")].filter((d) => {
                const st = d.getAttribute("style") || "";
                return /cursor: ?pointer/.test(st) && /translate\(-50%, ?-50%\)/.test(st) && /left: ?[\d.]+%/.test(st);
              });
              w.forEach((d, i) => d.setAttribute("data-welt", String(i)));
              return w.length;
            });
            if (!welten) melde("auf der Weltkarte ist keine erreichte Welt anklickbar");
            for (let i = 0; i < Math.min(welten, 3); i++) {
              await page.evaluate((n) => { const d = document.querySelector(`[data-welt="${n}"]`); d && d.click(); }, i);
              await bis(() => /Hierhin reisen|Du bist hier|Travel here|You are here/.test(document.body.innerText || ""), null, 900);
              if (await page.evaluate(() => /Hierhin reisen|Du bist hier|Travel here|You are here/.test(document.body.innerText || ""))) break;
            }
            if (!(await klick("Hierhin reisen|Du bist hier|Travel here|You are here")))
              melde("auf der Weltkarte erscheint kein Reiseknopf - das Lore-Blatt oeffnet sich nicht");
            else {
              await ruhe(1800, 400);
              const zr2 = await zustand("nach dem Reisen");
              if (!zr2.tot && !zr2.draussen) console.log("   ueber die Weltkarte gereist");
            }
          }
        }
      }
    }
  }
} else melde("die Karte liess sich fuer den Rueckblick nicht oeffnen");

verlauf.push(await page.evaluate(() => history.length).catch(() => null));
console.log(`\n   Verlauf je Runde: ${verlauf.join(" -> ")}`);
/* GEMESSEN (1.10.2026): mit den zwei Zurueck-Hooks bis v1.90.17 wuchs der
   Verlauf um 8, 8 und 11 Eintraege je Runde, danach um 4, 3 und 4. Der Rest
   ist gewollt: jeder Schritt TIEFER legt einen Eintrag an (damit die
   Zurueck-Geste ihn nehmen kann), ein Schritt zurueck PER KNOPF verbraucht
   keinen - wie auf jeder Webseite. Die Grenze liegt darum bei 6 je Runde:
   sie faengt einen zweiten Hook (Verdopplung), nicht das gewollte Wachstum.
   Chromium deckelt die Laenge bei 50, darum zaehlt das Wachstum. */
const wachstum = verlauf.slice(1).map((v, i) => (v != null && verlauf[i] != null ? v - verlauf[i] : 0));
if (wachstum.slice(1).some((d) => d > 6)) melde(`der Verlauf waechst je Runde um ${wachstum.join(", ")} - legt ein Zurueck-Hook doppelt an?`);

await browser.close(); srv.close();

if (fehler.length) {
  const gez = {};
  fehler.forEach((f) => { gez[f] = (gez[f] || 0) + 1; });
  console.log(`\nFEHLER (${fehler.length}):`);
  Object.entries(gez).forEach(([f, n]) => console.log(`  ${n}x ${f}`));
  process.exit(1);
}
console.log("\n== KEINE FEHLER ==");
