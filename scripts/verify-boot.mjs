// CI gate: boots the shipped single-file build in a spec-faithful DOM
// (opaque file:// origin — the harshest sandbox) and fails on any error
// or an empty root. Catches what SSR smoke structurally cannot:
// module-vs-classic script issues, storage crashes, effect-phase errors.
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync } from "fs";
const errs = [];
const vc = new VirtualConsole();
vc.on("jsdomError", (e) => errs.push(e.message || String(e)));
const dom = new JSDOM(readFileSync("dist-single/index.html", "utf8"),
  { runScripts: "dangerously", url: "file:///gambit.html", pretendToBeVisual: true, virtualConsole: vc });
if (!dom.window.matchMedia) dom.window.matchMedia = (q) => ({ matches: false, media: q,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
/* v1.90.18 (Audit A72): ABFRAGEN STATT SCHLAFEN. Hier stand ein einziger
   Schlaf von 3,8 s - kam der Aufbau einmal spaeter, meldete das Tor
   "BOOT FAILED" fuer einen gesunden Bau; kam er frueher, wartete es trotzdem.
   Jetzt: alle 200 ms nachsehen (Deckel 15 s). Steht die Wurzel, wartet das Tor
   noch NACHLAUF ms (so lang wie der alte Schlaf, damit spaete Zeitgeber
   weiter erfasst sind), denn Fehler aus der Effektphase kommen nach dem ersten
   Bild - genau die soll dieses Tor fangen. Die Bootzeit steht in der Meldung. */
const NACHLAUF = 3500, DECKEL = 15000, t0 = Date.now();
const wurzel = () => dom.window.document.getElementById("root")?.innerHTML.length ?? 0;
/* Die Wurzel traegt schon im HTML den Ladeschirm (#gg-boot, weit ueber 1000
   Zeichen) - "lang genug" allein hiesse also nichts. Gewartet wird, bis React
   ihn ersetzt hat. */
const gemountet = () => !dom.window.document.querySelector("#root #gg-boot") && wurzel() >= 1000;
while (Date.now() - t0 < DECKEL && !gemountet() && !errs.length) await new Promise((r) => setTimeout(r, 200));
const bootMs = Date.now() - t0;
if (gemountet() && !errs.length) await new Promise((r) => setTimeout(r, NACHLAUF));
const len = wurzel();
if (errs.length || !gemountet()) {
  console.error("BOOT FAILED — root:", len, "nach", bootMs, "ms", errs.slice(0, 2).join(" | "));
  process.exit(1);
}
console.log("boot verified — root renders", len, "chars, zero errors (steht nach", bootMs, "ms)");
/* DAS TOR MUSS SICH AUCH SCHLIESSEN. Der Lauf meldete gruen und lief dann
   ewig weiter: jsdom haelt mit pretendToBeVisual einen Bildtaktgeber und die
   Zeitgeber der Anwendung offen, und Node beendet sich nicht, solange ein
   Zeitgeber laeuft. Ein CI-Tor, das nie zurueckkommt, ist ein haengender Bau
   - jede Sitzung musste es bisher in ein timeout wickeln und den Ausgang aus
   dem Text lesen, statt ihn am Rueckgabewert abzulesen.
   window.close() nimmt jsdom seine Taktgeber, exit(0) macht den Erfolg zur
   Zahl. Der Fehlerweg oben endete schon immer sauber mit exit(1). */
dom.window.close();
process.exit(0);
