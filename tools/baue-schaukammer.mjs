// Legt die Bilder des Hauses als KOPIE unter public/schau/ ab und schreibt
// ein Verzeichnis dazu. So kennt kein Buendler diese Dateien - die
// Schaukammer holt sie zur Laufzeit. (Ein frueherer Versuch band sie ein:
// die Einzeldatei wuchs auf 119 MB.)
import { readdir, mkdir, copyFile, writeFile, rm } from "node:fs/promises";
import { join, extname } from "node:path";

const QUELLE = "src/app/ui/assets";
const ZIEL = "dist/schau";
const ARTEN = new Set([".webp", ".jpg", ".png", ".svg"]);

/* ── DER SCHALTER FUERS GEWICHT (v1.86.0) ─────────────────────────────────
   GEMESSEN am 26.9.2026: dist/ wog nach "npm run build" 743 MB. Davon waren
   692 MB Archiv-Kopien - bildarchiv 617 MB, klangarchiv 43 MB, schau 32 MB.
   Der SPIELER laedt davon nichts: sein Buendel ist 1,4 MB Javascript und
   24 MB Bilder. Die 692 MB dienen allein der Schaukammer, und sie gehen bei
   JEDEM Push nach Cloudflare - das ist der Grund, warum Deploys dauern.

   Der Standard bleibt, wie er war: alles wird kopiert, damit die Kammer live
   vollstaendig ist. Wer schnell bauen will (jede Probe, jeder Zwischenstand),
   setzt OHNE_ARCHIV=1 - dann bleiben die drei grossen Ordner weg und der Bau
   ist in Sekunden statt Minuten fertig:

     OHNE_ARCHIV=1 npm run build:app

   Die Kammer selbst ueberlebt das: sie zeigt 200-px-Vorschauen (die aus
   public/ kommen) und laedt ein Original erst auf Knopfdruck.             */
const OHNE_ARCHIV = process.env.OHNE_ARCHIV === "1";
if (OHNE_ARCHIV) console.log("Schaukammer: OHNE_ARCHIV=1 - die drei grossen Archivordner bleiben weg");

async function sammle(ordner, unter = "") {
  const out = [];
  for (const e of await readdir(join(ordner, unter), { withFileTypes: true })) {
    const rel = unter ? `${unter}/${e.name}` : e.name;
    if (e.isDirectory()) { if (!["audio", "klang"].includes(e.name)) out.push(...await sammle(ordner, rel)); }
    else if (ARTEN.has(extname(e.name).toLowerCase())) out.push(rel);
  }
  return out;
}

await rm(ZIEL, { recursive: true, force: true });
const dateien = (await sammle(QUELLE)).sort();
if (!OHNE_ARCHIV) {
  for (const rel of dateien) {
    const zielPfad = join(ZIEL, rel);
    await mkdir(zielPfad.slice(0, zielPfad.lastIndexOf("/")), { recursive: true });
    await copyFile(join(QUELLE, rel), zielPfad);
  }
}
/* ── WAS WIRD WIRKLICH GEZOGEN? (v1.0.55, Besitzerwunsch) ──────────────────
   Der Besitzer wollte in der Kammer aufraeumen - und was er archivierte oder
   loeschte, war beim naechsten Bau wieder da. Kein Wunder: diese Liste
   entsteht bei JEDEM Bau frisch aus dem Dateisystem, und was auf seinem
   Geraet stand, war nur eine Notiz im Browserspeicher. Loeschen konnte gar
   nicht wirken.
   Statt eines Loeschens, das nichts loescht, sagt die Kammer jetzt die
   Wahrheit: welche Datei der Quelltext WIRKLICH importiert. Alles andere ist
   Beiwerk - und was gar nicht mehr gebraucht wird, gehoert ins Archiv
   (archiv/ausgemustert/), nicht in eine Liste zum Wegklicken. */
const quelltext = [];
async function lies(ordner) {
  for (const e of await readdir(ordner, { withFileTypes: true })) {
    if (e.name === "node_modules") continue;
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) await lies(pfad);
    else if (/\.(js|jsx|ts|tsx|html|css)$/.test(e.name))
      quelltext.push(await (await import("node:fs/promises")).readFile(pfad, "utf8"));
  }
}
await lies("src");
try { quelltext.push(await (await import("node:fs/promises")).readFile("index.html", "utf8")); } catch {}
const alleQuellen = quelltext.join("\n");
const aktiv = dateien.filter((rel) => alleQuellen.includes(rel.split("/").pop()));

await writeFile("dist/schaukammer.json",
  JSON.stringify(dateien.map((r) => `/schau/${r}`), null, 0));
/* Getrennte Datei, damit aeltere Fassungen der Kammer unveraendert weiter
   funktionieren - sie holen sie schlicht nicht ab. */
await writeFile("dist/schaukammer-aktiv.json",
  JSON.stringify(aktiv.map((r) => `/schau/${r}`), null, 0));
console.log(`schaukammer: ${dateien.length} Bilder nach ${ZIEL}, davon ${aktiv.length} im Spiel in Gebrauch`);
if (dateien.length - aktiv.length > 0)
  console.log(`  ${dateien.length - aktiv.length} liegen ungenutzt herum - Kandidaten fuer archiv/ausgemustert/`);

/* VORSCHAUBILDER (v0.96, Besitzerwunsch): die Kammer lud bisher jedes Bild
   in voller Groesse, nur um es als 116-px-Kachel zu zeigen - das dauerte und
   verbrauchte unnoetig Bandbreite. Jetzt legt der Bau neben jedes Bild eine
   VORSCHAU mit 200 px Kantenlaenge; die Kammer zeigt die, und erst beim
   Antippen kommt das Grosse. */
const { execFile } = await import("node:child_process");
const { promisify } = await import("node:util");
const lauf = promisify(execFile);
/* v1.0.3, NACHGEMESSEN UND ERNUECHTERND: diese Vorschauen sind seit v0.96
   LIVE NIE ENTSTANDEN. Der Cloudflare-Bau hat kein PIL, das try/catch hat
   den Fehlschlag stumm geschluckt ("uebersprungen"), und die Kammer fiel
   ueber ihren onError-Zweig auf die vollen Bilder zurueck - 125 KB je
   Kachel statt 7, rund 48 MB fuer einen Blick in die Kammer. Gepruefte
   Belege: /schau-klein/… lieferte 200 mit 11787 Bytes text/html, also den
   SPA-Rueckfall, waehrend /schau/… 125690 Bytes image/webp lieferte.
   Also liegen die Vorschauen jetzt FERTIG im Repo unter public/ und werden
   von Vite mitgenommen. Dieser Schritt rechnet sie nur noch NACH, wenn
   Python da ist - und ueberschreibt das Fertige erst, wenn es geklappt hat.
   Neue Bilder brauchen ein `npm run vorschau`. */
const VZIEL = "dist/schau-klein";
try {
  await rm(VZIEL + ".neu", { recursive: true, force: true });
  await mkdir(VZIEL + ".neu", { recursive: true });
  await lauf("python3", ["tools/baue-vorschau.py", ZIEL, VZIEL + ".neu"]);
  await rm(VZIEL, { recursive: true, force: true });
  await (await import("node:fs/promises")).rename(VZIEL + ".neu", VZIEL);
} catch (e) {
  await rm(VZIEL + ".neu", { recursive: true, force: true });
  console.log("vorschau: nicht nachgerechnet (kein PIL?) - nehme die aus public/:",
    String(e).slice(0, 60));
}

// Dasselbe fuer das MUSIKARCHIV: alle je erzeugten Stuecke liegen unter
// archiv/musik und werden neben das Spiel gelegt, nicht hineingebunden -
// 26 MB im Buendel waeren unvertretbar. Die Klangwerkstatt holt sie zur
// Laufzeit.
const MQ = "archiv/musik", MZ = "dist/klangarchiv";
await rm(MZ, { recursive: true, force: true });
let anzahl = 0;
if (!OHNE_ARCHIV) {
  await mkdir(MZ, { recursive: true });
  for (const e of await readdir(MQ, { withFileTypes: true })) {
    if (!e.isFile()) continue;
    await copyFile(join(MQ, e.name), join(MZ, e.name));
    if (e.name.endsWith(".mp3")) anzahl++;
  }
  console.log(`klangarchiv: ${anzahl} Stuecke nach ${MZ}`);
} else console.log("klangarchiv: uebersprungen (OHNE_ARCHIV)");

// Und die BILD-ORIGINALE: sie liegen unter archiv/bilder und werden - wie
// Musik und Schaukammer - neben das Spiel gelegt, nie hineingebunden.
// (Gerettet aus der fal.ai-Auftragshistorie, siehe archiv/bilder/LIESMICH.md)
const BQ = "archiv/bilder", BZ = "dist/bildarchiv";
await rm(BZ, { recursive: true, force: true });
let bilder = 0;
async function kopiereBaum(von, nach) {
  await mkdir(nach, { recursive: true });
  for (const e of await readdir(von, { withFileTypes: true })) {
    if (e.isDirectory()) await kopiereBaum(join(von, e.name), join(nach, e.name));
    else {
      await copyFile(join(von, e.name), join(nach, e.name));
      // nur BILDER zaehlen - Beschreibungen und Zuordnungslisten liegen
      // hier auch, und mitgezaehlt log der Vorschau-Zaehler sieben Stueck.
      if (/\.(png|jpg|jpeg|webp)$/i.test(e.name)) bilder++;
    }
  }
}
if (!OHNE_ARCHIV) {
  await kopiereBaum(BQ, BZ);
  console.log(`bildarchiv: ${bilder} Originale nach ${BZ}`);
} else {
  // ohne Originale auch keine Vorschauen daraus - die Zaehler unten wissen das
  bilder = 0;
  console.log("bildarchiv: uebersprungen (OHNE_ARCHIV)");
}

/* v1.0.3: die Kammer zeigt jetzt neben jeder Spielfassung ihr Original -
   und die Originale sind 1024x1536 PNG, bis 2,5 MB das Stueck. Also
   bekommen auch sie ihre 200-px-Vorschau; das volle Bild kommt erst, wenn
   der Knopf "Original laden" gedrueckt wird. */
const BVZ = "dist/bildarchiv-klein";
try {
  await rm(BVZ + ".neu", { recursive: true, force: true });
  await mkdir(BVZ + ".neu", { recursive: true });
  await lauf("python3", ["tools/baue-vorschau.py", BZ, BVZ + ".neu"]);
  await rm(BVZ, { recursive: true, force: true });
  await (await import("node:fs/promises")).rename(BVZ + ".neu", BVZ);
} catch (e) {
  await rm(BVZ + ".neu", { recursive: true, force: true });
  console.log("bildarchiv-vorschau: nicht nachgerechnet - nehme die aus public/:",
    String(e).slice(0, 60));
}

/* LAUTER ZAEHLER statt stiller Annahme: wenn neben dem Spiel weniger
   Vorschauen liegen als Bilder, sagt der Bau es. Genau diese Meldung hat
   acht Versionen lang gefehlt. */
async function zaehle(ordner) {
  let n = 0;
  for (const e of await readdir(ordner, { withFileTypes: true, recursive: true }))
    if (e.isFile()) n++;
  return n;
}
const vs = await zaehle(VZIEL).catch(() => 0);
const vb = await zaehle(BVZ).catch(() => 0);
if (OHNE_ARCHIV) {
  /* Der Zaehler darf hier NICHT klagen. Die Hausregel lautet "die Zeile
     vorschauen: N/N muss vollzaehlig sein" - mit OHNE_ARCHIV ist sie
     absichtlich leer, und eine Mangelmeldung an dieser Stelle wuerde die
     Regel entwerten und bei jedem schnellen Bau Alarm schlagen. */
  console.log("vorschauen: uebersprungen (OHNE_ARCHIV) - fuer einen Release-Bau ohne den Schalter bauen");
} else {
  console.log(`vorschauen: ${vs}/${dateien.length} Spielfassungen, ${vb}/${bilder} Originale`);
  if (vs < dateien.length) console.log(`  ! ${dateien.length - vs} Vorschauen FEHLEN - "npm run vorschau" laufen lassen`);
}
