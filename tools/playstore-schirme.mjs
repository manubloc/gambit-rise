// ── STORE-SCHIRME ───────────────────────────────────────────────────────────
// Fotografiert die App fuer den Play Store: sieben Motive, deutsch und
// englisch, jeweils als Rohbild. Das Gestell (Ueberschrift, Rahmen,
// Hintergrund) und die drei Play-Formate baut danach
// tools/playstore_gestell.py aus diesen Rohbildern.
//
// v1.84.0, Besitzer: "das wäre das nächste große Ding auch, dass du mir
// ordentlich Bilder generierst, ähnlich wie Screenshots als Tablet und Ding,
// dass ich das alles parat habe für den Play Store."
//
// VORAUSSETZUNG: `npm run build:app` - dist/ traegt dann die App an der
// Wurzel. Nach `npm run build` liegt dort die Landingpage, und der Lauf
// bricht mit einer Ansage ab, statt sieben Bilder der Landingpage zu machen.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const ZIEL = "design/playstore/roh";
await mkdir(ZIEL, { recursive: true });

if (!existsSync("dist/index.html")) { console.error("dist/index.html fehlt - erst `npm run build:app`"); process.exit(1); }
if (readFileSync("dist/index.html", "utf8").includes("landing")) {
  console.error("dist/ traegt die Landingpage. Erst `npm run build:app` laufen lassen (nicht `npm run build`).");
  process.exit(1);
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".json": "application/json",
  ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".mp3": "audio/mpeg", ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/" || !extname(p)) p = "/index.html";
  try {
    const buf = await readFile(join("dist", p));
    res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" });
    res.end(buf);
  } catch { res.writeHead(404); res.end("nope"); }
});
await new Promise((r) => server.listen(4331, r));

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});

for (const sprache of ["de", "en"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const foto = (n) => page.screenshot({ path: `${ZIEL}/${sprache}-${n}.png` });
  const warte = (ms) => page.waitForTimeout(ms);

  /** Klickt den ersten Knopf, dessen Beschriftung den Text enthaelt. */
  const knopf = async (text, ms = 900) => {
    const traf = await page.evaluate((t) => {
      const b = [...document.querySelectorAll("button, a")].find((x) =>
        (x.innerText || "").replace(/\s+/g, " ").trim().includes(t));
      if (b) { b.click(); return true; }
      return false;
    }, text);
    await warte(ms);
    return traf;
  };
  /** Schliesst alles, was sich nach einem Schritt vor den Schirm legt. */
  const aufraeumen = async () => {
    for (let i = 0; i < 6; i++) {
      const weg = await page.evaluate(() => {
        const worte = ["Los geht's", "Verstanden", "Alle Vorstellungen überspringen",
          "Got it", "Let's go", "Skip all", "Weiter", "Continue"];
        for (const w of worte) {
          const b = [...document.querySelectorAll("button")].find((x) =>
            (x.innerText || "").replace(/\s+/g, " ").trim() === w);
          if (b) { b.click(); return w; }
        }
        return null;
      });
      if (!weg) break;
      await warte(420);
    }
  };
  /** Wechselt auf einen der vier Reiter unten. */
  const reiter = async (name) => {
    await page.evaluate((n) => {
      const b = [...document.querySelectorAll("button")].reverse().find((x) =>
        (x.innerText || "").replace(/\s+/g, " ").trim().toUpperCase().includes(n));
      b?.click();
    }, name);
    await warte(1500);
    };

  /** Wieviele Brettfelder stehen gerade? So merke ich, ob ich am Brett bin. */
  const felder = () => page.evaluate(() => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 24 && r.width < 90 && Math.abs(r.width - r.height) < 4;
    });
    if (!alle.length) return 0;
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    return alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2).length;
  });
  /** Eine eigene Figur antippen, damit das Talentband aufgeht. */
  const figurWaehlen = () => page.evaluate(() => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 24 && r.width < 90 && Math.abs(r.width - r.height) < 4;
    });
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    const f = alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
    const eigene = f.filter((d) => d.querySelector("img,svg") && d.getBoundingClientRect().top > innerHeight * 0.45);
    eigene[Math.floor(eigene.length / 2)]?.click();
  });
  /* GEMESSEN statt geraten (Diagnoselauf 26.9.): der Gast landet nicht im
     Hub, sondern im KAPITEL-INTRO - dort steht genau ein Knopf, "Weiter zur
     Karte ›". Der Hub kommt erst ueber den Reiter SPIELEN. Und der
     Aufgeben-Dialog bietet "Weiterspielen" und "⚑ Aufgeben", nicht
     "Aufgeben & wechseln"; ein Klick auf "wechseln" ging deshalb ins Leere
     und der Dialog stand in jedem weiteren Bild. */
  const REITER = ["SPIELEN", "FIGUREN", "LAGER", "PROFIL", "PLAY", "PIECES", "STORES", "PROFILE"];
  /** Klickt den ersten Knopf, der kein Reiter ist - sprachunabhaengig. */
  const weiter = async (ms = 2000) => {
    const t = await page.evaluate((r) => {
      const b = [...document.querySelectorAll("button")].find((x) => {
        const s = (x.innerText || "").replace(/\s+/g, " ").trim();
        return s && !r.includes(s.toUpperCase()) && s !== "✕";
      });
      if (!b) return null;
      const s = (b.innerText || "").trim(); b.click(); return s;
    }, REITER);
    await warte(ms);
    return t;
  };
  /** Zum Schnellen Spiel und losziehen. modus: "hp" oder "klassisch". */
  const partie = async (modus) => {
    await reiter("SPIELEN"); await reiter("PLAY");
    await warte(1300); await aufraeumen();
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        /^(Anpassen|Customize)$/i.test((x.innerText || "").trim()));
      b?.click();
    });
    await warte(1700); await aufraeumen();
    await page.evaluate((m) => {
      /* NICHT auf den ganzen Text ankern: die Modusknoepfe sind zweizeilig. */
      const wort = m === "klassisch" ? /^Klassisch|^Classic/i : /HP|Gefecht|Battle/i;
      const b = [...document.querySelectorAll("button")].find((x) => wort.test((x.innerText || "").trim()));
      b?.click();
    }, modus);
    await warte(900);
    /* GEMESSEN am 26.9., nach vier Fehlversuchen mit dem Modusschalter: ein
       GAST kann das HP-Gefecht ueberhaupt nicht waehlen. Im Anpassen-Schirm
       traegt "Schach" den aktiven violetten Rand (rgb(167,...)), "HP-Gefecht"
       reagiert auf einen Klick gar nicht, und von den drei Karten ist nur
       "Klassik · 8×8" frei - "Hof" und "Schneise" stehen gedaempft und mit
       grauem Rand da, also gesperrt. Das ist Spieldesign: die Lebenspunkte
       erwachen erst im Lauf der Kampagne (hpWach: league > 2).
       Ein Store-Bild MIT Lebenspunkten braucht deshalb einen vorbereiteten
       Spielstand ab Kapitel III - kein Klickproblem, eine Freischaltung.
       Bis dahin bleibt es beim klassischen Brett, und die Ueberschrift sagt,
       was zu sehen ist. */
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) =>
        /^(Partie starten|Start match)$/i.test((x.innerText || "").trim()));
      b?.click();
    });
    await warte(3400); await aufraeumen(); await warte(900);
  };

  const gastStart = async () => {
    await page.goto("http://127.0.0.1:4331/", { waitUntil: "load" });
    await warte(1500);
    if (sprache === "en") await knopf("EN", 900);
    await knopf(sprache === "de" ? "Als Gast spielen" : "Play as guest", 1900);
    await page.evaluate(() => {          // gemalte Figuren statt Umrisse
      const b = [...document.querySelectorAll("button")].find((x) =>
        /^(Detailreich|Painted)$/i.test((x.innerText || "").trim()));
      b?.click();
    });
    await warte(600);
    await aufraeumen(); await warte(900); await aufraeumen();
    await weiter(2600);                 // "Weiter zur Karte ›" im Kapitel-Intro
    await aufraeumen();
  };

  /* WARUM DIE BRETTER ZULETZT KOMMEN: nach dem Aufgeben steht der
     Ergebnisschirm ("AUFGEGEBEN - Verloren") im Weg, und er bietet keinen Weg
     zurueck in die Halle - nur "Neue Partie" und "Einstellungen". Im ersten
     Anlauf trugen deshalb drei Bilder diesen Schirm statt des Motivs. Jetzt
     fotografiere ich erst alle Menueschirme und gehe fuer jedes Brett in
     einen FRISCHEN Gast-Durchlauf, aus dem ich nicht mehr heraus muss. */

  await gastStart();
  await foto("6-kampagne");

  await reiter("SPIELEN"); await reiter("PLAY");
  await warte(1500); await aufraeumen();
  await foto("8-halle");

  await reiter("FIGUREN"); await reiter("PIECES");
  await warte(3000); await aufraeumen();
  await foto("3-hofstaat");

  const kachel = await page.evaluate(() => {
    const k = [...document.querySelectorAll("button, [role=button], div")]
      .filter((x) => { const r = x.getBoundingClientRect();
        return x.querySelector("img") && r.width > 70 && r.width < 180 && r.height > 90; });
    const z = k[Math.min(4, k.length - 1)];
    if (!z) return false; z.click(); return true;
  });
  await warte(2000); await aufraeumen();
  if (kachel) await foto("4-karte");

  await knopf(sprache === "de" ? "Zurück" : "Back", 900);
  await warte(800);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      /^(Aufstellung|Formation)$/i.test((x.innerText || "").trim()));
    b?.click();
  });
  await warte(2200); await aufraeumen();
  await foto("5-aufstellung");

  await reiter("LAGER"); await reiter("STORES");
  await warte(2000); await aufraeumen();
  await foto("7-lager");

  /* DAS HP-GEFECHT kommt aus dem SCHNELLEN SPIEL, nicht aus der Kampagne:
     gemessen spielt die Kampagne in Kapitel I klassisch, weil die
     Lebenspunkte erst ab Kapitel III wach sind (hpWach: league > 2). Ein
     Gast steht immer in Kapitel I - das Bild trug dann die Zeile
     "Klassisch - hier zaehlt nur Schach" unter der Ueberschrift "Schach mit
     Lebenspunkten". */
  await gastStart();
  await partie("hp");
  let n = await felder();
  if (n < 16) console.log(sprache, "kein Brett (HP):", n);
  const klassik = await page.evaluate(() => /nur Schach|only chess/i.test(document.body.innerText || ""));
  if (klassik) console.log(sprache, "ACHTUNG: HP-Bild zeigt ein klassisches Brett");
  await figurWaehlen(); await warte(1000);
  await foto("1-gefecht");

  await gastStart();
  await partie("klassisch");
  n = await felder();
  if (n < 16) console.log(sprache, "kein Brett (klassisch):", n);
  await foto("2-klassik");

  console.log(sprache, "fertig");
  await ctx.close();
}
await browser.close();
server.close();
