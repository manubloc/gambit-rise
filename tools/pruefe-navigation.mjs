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

   AUFRUF: node tools/pruefe-navigation.mjs   (RUNDEN=5 fuer laengere Laeufe)
   Vorher `npx vite build` oder `npm run build:app`, damit dist/ die APP
   traegt. Nach `npm run build` liegt dort die Landingpage - dann bricht die
   Probe mit einer Ansage ab, statt sinnlos zu messen.                      */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";

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

const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join(WURZEL, p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
    res.end(b);
  } catch {
    try {
      const b = await readFile(join(WURZEL, "index.html"));
      res.writeHead(200, { "content-type": "text/html" }); res.end(b);
    } catch { res.writeHead(404); res.end(); }
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;
const START = `http://127.0.0.1:${port}/`;

/* Die Halle (duell.gambitrise.com) ist aus der Sandkiste nicht erreichbar.
   GET /design darf still fehlschlagen - livery.js faellt auf APP_DESIGN
   zurueck. Dieses Paar ist das EINZIGE, was die Probe duldet (wie drive3). */
const ERWARTET_OFFLINE = (t) =>
  /duell\.gambitrise\.com/.test(t)
  || /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED|NAME_NOT_RESOLVED|CONNECTION_REFUSED)/.test(t);

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
  return d;
};

/* Nach dem Verlassen wieder hinein. Das Konto liegt im localStorage, also
   fuehrt "Weiterspielen" direkt zurueck in den Hub. */
const wiederHinein = async () => {
  await page.goto(START, { waitUntil: "networkidle" });
  await page.waitForTimeout(1600);
  for (let i = 0; i < 8; i++) {
    if (!(await klick("Weiterspielen|Los geht|Verstanden|Beginnen"))) break;
    await page.waitForTimeout(700);
  }
};

const zurKarte = async () => {
  if (!(await klick("^Kampagne"))) { melde("Knopf 'Kampagne' nicht gefunden"); return false; }
  await page.waitForTimeout(2400);
  if ((await zustand("Kapitelschirm")).tot) return false;
  for (let i = 0; i < 4; i++) {
    if (!(await klick("Weiter zur Karte"))) break;
    await page.waitForTimeout(2200);
  }
  const z = await zustand("Karte");
  if (z.tot || z.draussen) return false;
  const n = await stationen();
  if (n < 4) { melde(`nur ${n} Stationen auf der Karte - sie ist nicht aufgebaut`); return false; }
  return n;
};

// ── Einstieg ───────────────────────────────────────────────────────────────
schritt = "Einstieg";
await page.goto(START, { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
if (!(await klick("Erstellen"))) melde("Knopf 'Erstellen' nicht gefunden - steckt die App hinter dem Riegel?");
await page.waitForTimeout(900);
try {
  await page.locator("input[type=email]").fill(`nav${Date.now()}@probe.local`);
  await page.locator("input[type=password]").fill("Probe12345!");
  await klick("Konto erstellen");
  await page.waitForTimeout(3000);
} catch { melde("Anmeldung nicht moeglich"); }
for (let i = 0; i < 10; i++) {
  if (!(await klick("Los geht|Verstanden|Beginnen"))) break;
  await page.waitForTimeout(650);
}
await zustand("nach dem Einstieg");
console.log("   Einstieg: im Hub");

// ── Runden ─────────────────────────────────────────────────────────────────
for (let runde = 1; runde <= RUNDEN; runde++) {
  console.log(`\n== RUNDE ${runde} von ${RUNDEN} ==`);

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
    await page.waitForTimeout(1100);
    if ((await zustand(`Stationsfenster ${s + 1}`)).tot) break;
    offen++;
    schritt = `R${runde} Station ${s + 1} schliessen`;
    if (!(await klick("^✕$|^×$|^Schliessen$|^Schließen$"))) {
      melde("Stationsfenster hat keinen Schliessknopf");
      break;
    }
    await page.waitForTimeout(800);
    if ((await zustand(`Karte nach Station ${s + 1}`)).tot) break;
  }
  console.log(`   ${offen} Stationen geoeffnet und geschlossen`);

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
    await page.waitForTimeout(900);
    los = await klick("Herausforderung starten|Losziehen|Spiel starten|Antreten|Fortsetzen|fortsetzen");
    if (!los) {
      await klick("^✕$|^×$|^Schliessen$|^Schließen$");
      await page.waitForTimeout(500);
    }
  }
  if (!los) melde("keine einzige Station laesst sich betreten - der Weg ins Gefecht ist zu");
  {
    if (los) {
      await page.waitForTimeout(3200);
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
            d.click(); await new Promise((r) => setTimeout(r, 260));
            const ziel = felder().find((z) => /ggZielAtem/.test(z.getAttribute("style") || "") || z.querySelector('[style*="ggZielAtem"]'));
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
          await page.waitForTimeout(700);
          const bestaetigt = await klick("Pausieren & wechseln|Pausieren");
          if (!bestaetigt) melde("die Rueckfrage 'Kampf verlassen?' hat keinen Knopf zum Pausieren");
        }
        await page.waitForTimeout(2200);
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
    await page.waitForTimeout(900);
    const z = await zustand("beim Verlassen der Karte");
    if (z.draussen) { await wiederHinein(); break; }
    if (z.tot) break;
  }
  schritt = `R${runde} Reiter`;
  let reiterOk = 0;
  for (const reiter of ["Figuren", "Lager", "Profil", "Spielen"]) {
    if (!(await klick(`^${reiter}$`))) { melde(`Reiter '${reiter}' nicht gefunden`); continue; }
    await page.waitForTimeout(1300);
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
    await page.waitForTimeout(2000);
    if ((await zustand(name)).tot) break;
    // wieder heraus: der Zurueck-Knopf des Unterschirms, sonst die Geste
    if (!(await klick("Zurück|Zurueck"))) await page.goBack().catch(() => {});
    await page.waitForTimeout(1200);
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
    await page.waitForTimeout(1600);
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
      await page.waitForTimeout(1500);
      if ((await zustand(`Figuren-Unterreiter "${wohin}"`)).tot) break;
    }
    console.log(`   Figuren: ${Math.min(reiterZahl, 6)} Unterreiter durchgefahren`);
  } else melde("Reiter 'Figuren' nicht gefunden");

  schritt = `R${runde} Erfolge und Profil`;
  for (const reiter of ["Lager", "Profil", "Spielen"]) {
    if (!(await klick(`^${reiter}$`))) { melde(`Reiter '${reiter}' nicht gefunden`); continue; }
    await page.waitForTimeout(1400);
    if ((await zustand(`Reiter ${reiter} (zweite Fahrt)`)).tot) break;
  }

  // 5. Noch einmal auf die Karte und mit der ZURUECK-GESTE heraus. Eine
  //    Geste: Karte -> Hub. Mehr nicht, denn die zweite verlaesst die App
  //    (gewollt) und macht die Messung blind.
  schritt = `R${runde} Karte + Zurueck-Geste`;
  if (await zurKarte()) {
    await page.goBack().catch(() => {});
    await page.waitForTimeout(1000);
    const z = await zustand("nach der Zurueck-Geste");
    if (z.draussen) { melde("die Zurueck-Geste hat die App von der Karte aus verlassen - erwartet waere der Hub"); await wiederHinein(); }
    else {
      const wo = await page.evaluate(() => (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 40));
      console.log(`   Zurueck-Geste fuehrt in den Hub: "${wo}"`);
    }
  } else await wiederHinein();
}

await browser.close(); srv.close();

if (fehler.length) {
  const gez = {};
  fehler.forEach((f) => { gez[f] = (gez[f] || 0) + 1; });
  console.log(`\nFEHLER (${fehler.length}):`);
  Object.entries(gez).forEach(([f, n]) => console.log(`  ${n}x ${f}`));
  process.exit(1);
}
console.log("\n== KEINE FEHLER ==");
