// Liest die WIRKLICH gerenderten Stile jedes Knopfes und Eingabefeldes im
// laufenden Spiel - nicht den Quelltext, sondern das, was der Browser daraus
// macht. Nur so werden Rahmen sichtbar, die aus mehreren Regeln entstehen.
//
//   node tools/messe-knoepfe.mjs            -> Bericht
//   node tools/messe-knoepfe.mjs --pruefen  -> Ausstieg 1 bei Verstoessen
//
// Verstoss ist: Randbreite ueber 1.5px, ein plastischer Innenschatten
// (heller inset oben ODER dunkler inset), oder ein outline ueber 1.5px.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { chromium } from "playwright-core";

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const srv = createServer(async (req, res) => {
  const p = "dist" + (req.url.split("?")[0] === "/" ? "/index.html" : req.url.split("?")[0]);
  try { const b = await readFile(p); res.writeHead(200, { "content-type": MIME[extname(p)] || "application/octet-stream" }); res.end(b); }
  catch { const b = await readFile("dist/index.html"); res.writeHead(200, { "content-type": "text/html" }); res.end(b); }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 900, height: 1500 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1400);

const klick = (text) => page.evaluate((t) => {
  const alle = [...document.querySelectorAll("button,div,span,a")];
  let a = alle.filter((e) => e.textContent.trim() === t);
  if (!a.length) a = alle.filter((e) => e.textContent.trim().startsWith(t) && e.textContent.trim().length < t.length + 30);
  if (!a.length) a = alle.filter((e) => e.textContent.includes(t) && e.children.length === 0);
  const el = a[a.length - 1]; if (el) { el.click(); return true; } return false;
}, text);

// Anmelden und in einen Spielstand
await page.locator("input").first().fill("admin");
await page.locator("input").nth(1).fill("gambit-admin");
await klick("Anmelden");
await page.waitForTimeout(1200);
// Spielstand direkt im Speicher anlegen - am UI vorbei, deterministisch
const { readFileSync } = await import("node:fs");
const MESSPROF = JSON.parse(readFileSync("/tmp/messprof.json", "utf8"));
await page.evaluate((prof) => {
  const P = "gambit:u::";
  const acc = JSON.parse(localStorage.getItem(P + "session:v1") || "null")?.accountId;
  localStorage.setItem(P + "saves:" + acc, JSON.stringify([{ id: "mess1", name: "Messung",
    createdAt: Date.now(), updatedAt: Date.now(), playtimeSec: 0, league: 3, clearedCount: 1, total: 43, pct: 2 }]));
  localStorage.setItem(P + "save:" + acc + ":mess1", JSON.stringify(prof));
}, MESSPROF);
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1300);
const w = await klick("▶ Weiterspielen") || await klick("Weiterspielen");
console.log("Weiterspielen geklickt:", w);
await page.waitForTimeout(1800);
// Begruessung und alle Hinweisdialoge wegklicken, bis das Hauptmenue steht
for (let i = 0; i < 6; i++) {
  const weg = await page.evaluate(() => {
    const texte = ["Los geht's", "Los geht", "Verstanden", "Alles klar", "Weiter", "OK", "Schließen", "Zustimmen"];
    for (const t of texte) {
      const a = [...document.querySelectorAll("button")].filter((e) => e.textContent.trim().startsWith(t));
      if (a.length) { a[a.length - 1].click(); return t; }
    }
    return null;
  });
  if (!weg) break;
  await page.waitForTimeout(700);
}

const lies = () => page.evaluate(() => {
  const roh = (s) => (s === "none" || !s ? "" : s);
  return [...document.querySelectorAll("button, input, select, textarea")].map((e) => {
    const c = getComputedStyle(e);
    const r = e.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return null;
    return {
      tag: e.tagName.toLowerCase(),
      text: (e.textContent || e.value || e.placeholder || "").trim().slice(0, 26),
      bw: Math.max(parseFloat(c.borderTopWidth) || 0, parseFloat(c.borderLeftWidth) || 0),
      bg: (c.backgroundImage !== "none" ? c.backgroundImage : c.backgroundColor).slice(0, 90),
      bc: c.borderTopColor,
      ow: parseFloat(c.outlineWidth) || 0,
      shadow: roh(c.boxShadow).slice(0, 150),
    };
  }).filter(Boolean);
});

const seiten = [];
const sammle = async (name) => { await page.waitForTimeout(800); const l = await lies(); seiten.push([name, l]);

  // v0.39.3: EINE LAUFENDE PARTIE VERLAESST MAN NICHT VERSEHENTLICH.
  // Der Ruecken-Knopf im Spiel muss dieselbe Rueckfrage stellen wie das Menue.
  {
    const q = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
    if (!/leaveAsk/.test(q)) seiten.push(["VERLASSEN", [{ tag: "fehler", text: "Ruecken-Knopf fragt nicht nach", bw: 99, ow: 0, shadow: "" }]]);
    if (/onClick=\{leave\}/.test(q)) seiten.push(["VERLASSEN", [{ tag: "fehler", text: "es gibt noch einen Ausgang ohne Rueckfrage", bw: 99, ow: 0, shadow: "" }]]);
  }
  // DIE ABKUERZUNG ZU DEN FERNPARTIEN muss im Hauptmenue stehen und den
  // Zugstatus zeigen - der Weg ins Spiel soll so kurz wie moeglich sein.
  {
    const a = readFileSync("src/app/App.jsx", "utf8");
    if (!/daily:v1/.test(a)) seiten.push(["ABKUERZUNG", [{ tag: "fehler", text: "Hauptmenue ohne Fernpartien-Abkuerzung", bw: 99, ow: 0, shadow: "" }]]);
    if (!/du bist dran/.test(a)) seiten.push(["ABKUERZUNG", [{ tag: "fehler", text: "Abkuerzung ohne Zugstatus", bw: 99, ow: 0, shadow: "" }]]);
  }


  // v0.39.4: DIE HALLE STEHT OFFEN - ABER NUR MIT EINWILLIGUNG.
  // Die App verbindet beim Start von selbst; das darf NIE ohne vorliegende
  // Zustimmung geschehen (so steht es auch in der Datenschutzerklaerung) und
  // muss abschaltbar bleiben.
  {
    const a = readFileSync("src/app/App.jsx", "utf8");
    if (!/notices\?\.online/.test(a) || !/autoConnect/.test(a))
      seiten.push(["HALLE", [{ tag: "fehler", text: "Startverbindung ohne Einwilligungs- oder Abschaltpruefung", bw: 99, ow: 0, shadow: "" }]]);
    // die Bedingung muss BEIDES verlangen, bevor verbunden wird
    const stelle = a.slice(a.indexOf("stillVerbunden.current = true") - 700, a.indexOf("stillVerbunden.current = true"));
    if (!/notices\?\.online/.test(stelle) || !/autoConnect === false/.test(stelle))
      seiten.push(["HALLE", [{ tag: "fehler", text: "die Startverbindung prueft nicht beides vor dem Verbinden", bw: 99, ow: 0, shadow: "" }]]);
  }


  // v0.39.5: DER GAST FAENGT NEU AN. Der Hinweis im Spielstandsschirm
  // verspricht, dass nichts gesichert wird - dann muss der Einstieg auch
  // wirklich aufraeumen, sonst luegt die Oberflaeche.
  {
    const a = readFileSync("src/meta/accounts.js", "utf8");
    const g = a.slice(a.indexOf("export async function loginGuest"), a.indexOf("export async function loginGuest") + 900);
    if (!/storage\.delete/.test(g))
      seiten.push(["GAST", [{ tag: "fehler", text: "Gast-Einstieg raeumt alte Spielstaende nicht weg", bw: 99, ow: 0, shadow: "" }]]);
    const sv = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");   /* v1.29.1: Hinweis wohnt im Profil */
    if (!/provider === "guest"/.test(sv))
      seiten.push(["GAST", [{ tag: "fehler", text: "kein Gast-Hinweis im Profil", bw: 99, ow: 0, shadow: "" }]]);
  }

  if (process.argv.includes("--halle")) {
    const hb = await page.evaluate(() => [...document.querySelectorAll("img")].filter(x=>x.src.includes("bg-hall")).map(x=>{const r=x.getBoundingClientRect();
      return {y:Math.round(r.top), h:Math.round(r.height), w:Math.round(r.width), op:getComputedStyle(x).opacity};}));
    console.log("   Halle:", JSON.stringify(hb));
  }
  if (process.argv.includes("--bilder")) await page.screenshot({ path: `/tmp/schirm-${name}.png`, fullPage: false });
  console.log(`  ${name}: ${l.length} Elemente`, l.length ? "-> " + l.slice(0, 3).map((e) => e.text || e.tag).join(" / ") : ""); };

console.log("Start-Body:", (await page.evaluate(() => document.body.innerText.slice(0, 140))).replace(/\n/g, " | "));
await sammle("Start");
/* v0.79: die Menues heissen inzwischen Figuren und Lager (v0.72/74) -
   das Werkzeug lief seither ins Leere. */
for (const [knopf, name] of [["Profil", "Profil"], ["Figuren", "Figuren"], ["Lager", "Lager"], ["Spielen", "Spielen"]]) {
  const ok = await klick(knopf);
  console.log("klick", knopf, ok ? "ok" : "NICHT GEFUNDEN");
  if (ok) await sammle(name);
  if (name === "Figuren") {   /* der Hofstaat heisst seit v0.74.1 Figuren */
    await page.waitForFunction(() => /MEISTER|MASTERS/.test(document.body.innerText), { timeout: 9000 }).catch(() => {});
    await page.waitForTimeout(600);
    // DER MONSTER-KLICK: eine Bestien-Kachel im Verzeichnis muss ihr Popup
    // oeffnen wie jede Figur (der gemeldete Fehler vom 27.07.).
    const popup = await page.evaluate(() => {
      // Die Kacheln der MEISTER-Sektion: klickbare Karten unterhalb der
      // Ueberschrift MEISTER & GROSSMEISTER
      const alle = [...document.querySelectorAll("div")];
      const kopf = alle.find((d) => /MEISTER/.test(d.textContent || "") && d.offsetHeight < 40);
      if (!kopf) return "MEISTER-Kopf fehlt";
      const raster = kopf.nextElementSibling;
      const kachel = raster && [...raster.children].find((d) => d.style.cursor === "pointer");
      if (!kachel) return "keine klickbare Monster-Kachel (Fehler!)";
      kachel.click();
      return "geklickt";
    });
    await page.waitForTimeout(700);
    const offen = await page.evaluate(() => {
      const o = [...document.querySelectorAll("div")].find((d) => d.style.position === "fixed" && (d.textContent || "").length > 10 && d.querySelector("svg"));
      return !!o;
    });
    if (popup !== "geklickt" || !offen) seiten.push(["MONSTERKLICK", [{ tag: "fehler", text: popup + " / Popup " + (offen ? "offen" : "ZU"), bw: 99, ow: 0, shadow: "" }]]);
    else { console.log("   Monster-Popup: offen"); await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "✕"); x && x.click(); }); await page.waitForTimeout(400); }
  }
}

await browser.close(); srv.close();

const funde = [];
const gesehen = new Set();
for (const [seite, liste] of seiten) {
  for (const e of liste) {
    const kennung = seite + "|" + e.tag + "|" + e.text + "|" + e.bw + e.shadow;
    if (gesehen.has(kennung)) continue;
    gesehen.add(kennung);
    const gruende = [];
    if (e.bw > 1.5) gruende.push(`Rand ${e.bw}px (${e.bc})`);
    if (e.ow > 1.5) gruende.push(`Outline ${e.ow}px`);
    if (/inset/.test(e.shadow)) gruende.push(`Innenschatten: ${e.shadow}`);
    if (process.argv.includes("--farben") && e.text) console.log(`   [${seite}] "${e.text}" -> ${e.bg}`);
    if (gruende.length) funde.push(`${seite} · ${e.tag} "${e.text}": ${gruende.join(" | ")}`);
  }
}

console.log(`gemessen: ${seiten.map(([n, l]) => n + " " + l.length).join(", ")}`);
if (funde.length) {
  console.log("BEFUNDE:\n" + funde.map((f) => "  - " + f).join("\n"));
  if (process.argv.includes("--pruefen")) process.exit(1);
} else console.log("== BEDIENELEMENTE SAUBER ==");
