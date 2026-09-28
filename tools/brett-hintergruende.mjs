// ── DIE ZWOELF BRETT-HINTERGRUENDE ZEIGEN ───────────────────────────────────
// Besitzer am 28.9.2026: "grundsaetzlich moechte ich auch mal nochmal sehen
// wie du jetzt jedes kapitel die spielfelder designt hast mit hintergrund
// gebe das bitte raus. in bildern."
//
// WIE DAS BILD ENTSTEHT - und warum es echt ist: der Lauf spielt die App
// wirklich an, geht in eine Partie und laesst das Brett rendern. Danach wird
// NUR die Quelle des Hintergrundbildes durchgetauscht - genau das, was die App
// selbst tut, wenn ein anderes Kapitel dran ist (App.jsx:735 gibt
// BrettHintergrund die Liga). Brett, Figuren, Schleier und Zugleiste sind also
// echtes App-Rendering, kein Montage-Bild.
//
// VORAUSSETZUNG: `npm run build:app` - dist/ traegt die App an der Wurzel.
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { existsSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const ZIEL = "design/brett-hintergruende";
await mkdir(ZIEL, { recursive: true });

if (!existsSync("dist/index.html")) { console.error("dist/index.html fehlt - erst `npm run build:app`"); process.exit(1); }
if (existsSync("dist/spielen")) { console.error("dist/ traegt die Landingpage. Erst `npm run build:app`."); process.exit(1); }

/* Gleiche Tabelle wie BrettHintergrund.jsx und KapitelIntro.jsx, dazu die
   Namen aus LEAGUE_THEMES (mapArt.jsx). */
const KAPITEL = [
  ["01-kronland", "Kronland"], ["02-kornmark", "Kornmark"], ["03-eichwald", "Eichwald"],
  ["04-krummholz", "Krummholz"], ["05-grauwacht", "Grauwacht"], ["06-wolkenjoch", "Wolkenjoch"],
  ["07-sattelweite", "Sattelweite"], ["08-aschgrund", "Aschgrund"], ["09-wunde", "Die Wunde"],
  ["10-sonnenschlund", "Sonnenschlund"], ["11-kueste", "Die Küste"], ["12-meer", "Endloses Meer"],
];

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
await new Promise((r) => server.listen(4332, r));

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3, serviceWorkers: "block" });
const page = await ctx.newPage();
const warte = (ms) => page.waitForTimeout(ms);
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

const KONTO = { mail: `brett-${Math.random().toString(36).slice(2, 8)}@gambitrise.test`,
  pass: Math.random().toString(36).slice(2, 12) + "A7" };

await page.goto("http://127.0.0.1:4332/", { waitUntil: "load" });
await warte(1500);
await knopf("Noch kein Konto?", 700);
await page.fill('input[type="email"]', KONTO.mail);
await page.fill('input[type="password"]', KONTO.pass);
await knopf("Konto erstellen", 2600);

/* Auftakt: Name steht vorbefuellt, Stil auf Detailreich, dann Start. */
for (let i = 0; i < 12; i++) {
  const auftakt = await page.evaluate(() => {
    const feld = [...document.querySelectorAll("input")].find((x) => /^Dein Name$/i.test(x.placeholder || ""));
    if (!feld) return false;
    [...document.querySelectorAll("button")].find((x) => /^Detailreich$/i.test((x.innerText || "").trim()))?.click();
    return true;
  });
  if (auftakt) {
    await warte(400);
    await page.evaluate(() => [...document.querySelectorAll("button")]
      .find((x) => /^Los geht's$/i.test((x.innerText || "").trim()) && !x.disabled)?.click());
    await warte(1400);
    continue;
  }
  const weg = await page.evaluate(() => {
    for (const w of ["Los geht's", "Verstanden", "Alle Vorstellungen überspringen"]) {
      const b = [...document.querySelectorAll("button")].find((x) => (x.innerText || "").trim() === w);
      if (b) { b.click(); return w; }
    }
    return null;
  });
  if (!weg) break;
  await warte(900);
}
await warte(800);
/* "Weiter zur Karte" im Kapitel-Intro */
await page.evaluate(() => {
  const R = ["SPIELEN", "FIGUREN", "LAGER", "PROFIL"];
  const b = [...document.querySelectorAll("button")].find((x) => {
    const s = (x.innerText || "").replace(/\s+/g, " ").trim();
    return s && !R.includes(s.toUpperCase()) && s !== "✕";
  });
  b?.click();
});
await warte(2600);

/* In eine Partie: Reiter SPIELEN -> Sofort spielen */
const reiter = async (name) => {
  await page.evaluate((n) => [...document.querySelectorAll("button")].reverse()
    .find((x) => (x.innerText || "").replace(/\s+/g, " ").trim().toUpperCase().includes(n))?.click(), name);
  await warte(1500);
};
await reiter("SPIELEN");
await warte(1200);
await page.evaluate(() => [...document.querySelectorAll("button")]
  .find((x) => /^Sofort spielen$/i.test((x.innerText || "").trim()))?.click());
await warte(3600);

const dabei = await page.evaluate(() => !!document.querySelector('img[src*="/brett/"]'));
if (!dabei) { console.error("kein Brett-Hintergrund im DOM - steht die Partie?"); }

/* DIE FELDER GEHOEREN DAZU (Besitzer, 28.9.: "es gibt doch auch fuer jedes
   Kapitel noch gesondert eigene Schachfeldertexturen bzw. Bilder ... in der
   entsprechenden Farbe"). Stimmt: FELD_KAPITEL (src/app/ui/board/feldArt.js)
   haelt je Kapitel EINEN Streifen - links das helle Feld, rechts das dunkle.
   Er liegt aber nur in der KAMPAGNE an; eine schnelle Partie nimmt einen der
   drei klassischen Streifen. Darum wird hier neben dem Gemaelde auch der
   Streifen durchgetauscht - dieselbe Datei, die die Kampagne im jeweiligen
   Kapitel legt. */
const streifen = {};
for (const d of readdirSync("dist/assets")) {
  const m = /^feld-k(\d\d)-[^.]+\.webp$/.exec(d);
  if (m) streifen[Number(m[1])] = `/assets/${d}`;
}
if (Object.keys(streifen).length !== 12) console.log("ACHTUNG: nur", Object.keys(streifen).length, "Kapitel-Streifen gefunden");

for (let i = 0; i < KAPITEL.length; i++) {
  const [datei, name] = KAPITEL[i];
  await page.evaluate(async ([d, feld]) => {
    const img = document.querySelector('img[src*="/brett/"]');
    if (img) {
      img.src = `./brett/${d}.webp`;
      if (img.decode) { try { await img.decode(); } catch { /* egal */ } }
    }
    if (feld) {
      /* jede Zelle traegt ihren Streifen als inline-background - nur die
         Adresse tauschen, Ausschnitt und Groesse bleiben stehen. */
      for (const el of document.querySelectorAll('[style*="/assets/feld-"]')) {
        el.style.backgroundImage = el.style.backgroundImage.replace(/url\(("|')?[^)"']*\/assets\/feld-[^)"']*("|')?\)/, `url("${feld}")`);
      }
    }
  }, [datei, streifen[i + 1]]);
  await warte(1400);
  await page.screenshot({ path: `${ZIEL}/${datei}.png` });
  console.log("fotografiert:", datei, "-", name, streifen[i + 1] ? "(mit Kapitel-Feldern)" : "(ohne Felder!)");
}

await browser.close();
server.close();
console.log("fertig:", KAPITEL.length, "Bilder in", ZIEL);
