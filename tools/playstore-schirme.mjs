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
import { readFile, mkdir, writeFile } from "node:fs/promises";
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

const geometrie = {};

for (const sprache of ["de", "en"]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const foto = async (n) => {
    await page.screenshot({ path: `${ZIEL}/${sprache}-${n}.png` });
    try { geometrie[`${sprache}-${n}`] = await eckenMessen(); } catch { /* Messung ist Kuer */ }
  };
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

  /* v1.90.0, ZWEI BESITZERFUNDE AN EINER STELLE (28.9.):
     (1) "Da hast du Online-Duell als Gast nicht nutzbar ... da steht da
         hinten dran irgendwas anderes." Gemessen: die alten Store-Bilder
         entstanden VOR v1.89.0, als Gasthinweis und Verbindungsstand noch
         auf demselben Slot lagen - im heutigen Bau liegen sie 17 px
         auseinander (nachgemessen). Das Bild war alt, nicht der Code.
     (2) "logge dich einfach mit was anderem ein" - als GAST steht die
         Online-Kachel ausgegraut da. Der Lauf legt jetzt ein oertliches
         Konto an; damit ist die Kachel in voller Farbe und anklickbar.
     Das Passwort wird bei jedem Lauf frisch gewuerfelt und steht nirgends
     in einer Datei - das Konto lebt nur im Speicher dieses Browsers. */
  const KONTO = { mail: `store-${Math.random().toString(36).slice(2, 8)}@gambitrise.test`,
    pass: Math.random().toString(36).slice(2, 12) + "A7" };
  const SPIELERNAME = "Gambit";

  /** Fuehrt vom frischen Schirm bis in die Halle - Auftakt und Popups.
      GEMESSEN im ersten Lauf: das Namensfeld kommt VORBEFUELLT (v1.0.6 legt
      einen Namen hinein), und eine Schleife, die nur "Detailreich" drueckt,
      kommt nie zum Startknopf - der Auftakt stand im fertigen Bild. Der
      Auftakt wird deshalb in EINEM Durchgang erledigt: Name, Stil, Start. */
  const einstieg = async () => {
    for (let i = 0; i < 12; i++) {
      const imAuftakt = await page.evaluate((n) => {
        const feld = [...document.querySelectorAll("input")].find((x) =>
          /^(Dein Name|Your name)$/i.test(x.placeholder || ""));
        if (!feld) return false;
        if (!feld.value.trim()) {
          const setzer = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setzer.call(feld, n);
          feld.dispatchEvent(new Event("input", { bubbles: true }));
        }
        const txt = (x) => (x.innerText || "").replace(/\s+/g, " ").trim();
        const stil = [...document.querySelectorAll("button")].find((x) => /^(Detailreich|Detailed)$/i.test(txt(x)));
        stil?.click();
        return true;
      }, SPIELERNAME);
      if (imAuftakt) {
        await warte(500);
        await page.evaluate(() => {
          const txt = (x) => (x.innerText || "").replace(/\s+/g, " ").trim();
          const los = [...document.querySelectorAll("button")].find((x) =>
            /^(Los geht's|Let's begin)$/i.test(txt(x)) && !x.disabled);
          los?.click();
        });
        await warte(1400);
        continue;
      }
      const weg = await page.evaluate(() => {
        const txt = (x) => (x.innerText || "").replace(/\s+/g, " ").trim();
        for (const w of ["Los geht's", "Verstanden", "Alle Vorstellungen \u00fcberspringen",
          "Got it", "Let's go", "Skip all"]) {
          const b = [...document.querySelectorAll("button")].find((x) => txt(x) === w);
          if (b) { b.click(); return w; }
        }
        return null;
      });
      if (!weg) break;
      await warte(900);
    }
  };

  const kontoStart = async () => {
    await page.goto("http://127.0.0.1:4331/", { waitUntil: "load" });
    await warte(1500);
    const anmeldung = await page.evaluate(() => !!document.querySelector('input[type="email"]'));
    if (anmeldung) {
      if (sprache === "en") await knopf("EN", 900);
      /* in den Anlege-Modus: "Noch kein Konto? Erstellen" / "No account yet?" */
      await knopf(sprache === "de" ? "Noch kein Konto?" : "No account yet?", 700);
      await page.fill('input[type="email"]', KONTO.mail);
      await page.fill('input[type="password"]', KONTO.pass);
      await knopf(sprache === "de" ? "Konto erstellen" : "Create account", 2600);
    }
    await warte(900);
    await einstieg();
    await warte(900);
    await weiter(2600);                 // "Weiter zur Karte \u203a" im Kapitel-Intro
    await aufraeumen();
    /* Sprachprobe: der EN-Lauf war bis v1.90.0 auf Deutsch (LoginScreen bekam
       initialLang nie). Lieber laut scheitern als acht falsche Bilder. */
    const deutsch = await page.evaluate(() => /Kampagne|Schnelles Spiel/.test(document.body.innerText || ""));
    if (sprache === "en" && deutsch) console.log("ACHTUNG: englischer Lauf zeigt deutsche Texte");
  };

  /* DIE ECKEN MESSEN, NICHT RATEN (Besitzer 28.9.: "mach doch da die Rundung
     so, dass sie tangential zu den inneren Menuelementen ist"). Fuer jede
     Ecke des Schirms wird das naechstgelegene gerundete Element gesucht; aus
     seinem Abstand zum Rand und seinem eigenen Radius folgt der Radius, bei
     dem der Rahmen parallel um es herumlaeuft: r = Abstand + eigener Radius.
     Das Gestell (tools/playstore_gestell.py) rechnet das auf die Bildbreite
     hoch. */
  const eckenMessen = () => page.evaluate(() => {
    const W = innerWidth, H = innerHeight;
    const kandidaten = [];
    for (const e of document.querySelectorAll("div, button, section, header, nav, img")) {
      const r = e.getBoundingClientRect();
      if (r.width < 48 || r.height < 26) continue;
      if (r.width > W - 6 && r.height > H - 6) continue;     // der Schirm selbst
      const cs = getComputedStyle(e);
      if (cs.visibility === "hidden" || cs.opacity === "0") continue;
      const rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (rad < 2) continue;
      const sichtbar = parseFloat(cs.borderTopWidth) > 0
        || (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)")
        || cs.backgroundImage !== "none" || e.tagName === "IMG";
      if (!sichtbar) continue;
      kandidaten.push({ l: r.left, t: r.top, re: r.right, b: r.bottom,
        rad: Math.min(rad, r.width / 2, r.height / 2) });
    }
    const ecke = (rechts, unten) => {
      let best = null;
      for (const k of kandidaten) {
        const dx = rechts ? W - k.re : k.l;
        const dy = unten ? H - k.b : k.t;
        if (dx < -1 || dy < -1 || dx > 90 || dy > 220) continue;
        const d = dx + dy;
        if (!best || d < best.d) best = { d, abstand: Math.min(dx, dy), rad: k.rad };
      }
      return best ? Math.round(best.abstand + best.rad) : null;
    };
    const vier = [ecke(false, false), ecke(true, false), ecke(false, true), ecke(true, true)]
      .filter((x) => x != null);
    return { breite: W, hoehe: H, ecken: vier,
      radius: vier.length ? Math.round(vier.reduce((a, b) => a + b, 0) / vier.length) : null };
  });

  /* WARUM DIE BRETTER ZULETZT KOMMEN: nach dem Aufgeben steht der
     Ergebnisschirm ("AUFGEGEBEN - Verloren") im Weg, und er bietet keinen Weg
     zurueck in die Halle - nur "Neue Partie" und "Einstellungen". Im ersten
     Anlauf trugen deshalb drei Bilder diesen Schirm statt des Motivs. Jetzt
     fotografiere ich erst alle Menueschirme und gehe fuer jedes Brett in
     einen FRISCHEN Gast-Durchlauf, aus dem ich nicht mehr heraus muss. */

  await kontoStart();
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
  await kontoStart();
  await partie("hp");
  let n = await felder();
  if (n < 16) console.log(sprache, "kein Brett (HP):", n);
  const klassik = await page.evaluate(() => /nur Schach|only chess/i.test(document.body.innerText || ""));
  if (klassik) console.log(sprache, "ACHTUNG: HP-Bild zeigt ein klassisches Brett");
  await figurWaehlen(); await warte(1000);
  await foto("1-gefecht");

  await kontoStart();
  await partie("klassisch");
  n = await felder();
  if (n < 16) console.log(sprache, "kein Brett (klassisch):", n);
  await foto("2-klassik");

  console.log(sprache, "fertig");
  await ctx.close();
}
await browser.close();
server.close();
await writeFile(`${ZIEL}/geometrie.json`, JSON.stringify(geometrie, null, 1));
console.log("Eckenmass geschrieben:", Object.keys(geometrie).length, "Bilder");
