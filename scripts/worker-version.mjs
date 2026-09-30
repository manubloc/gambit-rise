/* ── DIE HALLE NENNT IHRE FASSUNG (v1.90.18) ──────────────────────────────────
   /health der Halle (worker/src/index.mjs) antwortete nur { ok, online } - ob
   der Worker nach einem Push wirklich neu deployt war, liess sich von aussen
   nicht sehen (offener Punkt "Worker-Version in /health"). Der Worker bindet
   nichts ausserhalb seines Ordners ein; darum schreibt dieses Skript die
   Fassung aus package.json nach worker/src/version.mjs. Es laeuft mit
   `npm run art`, also vor jedem Test und jedem Bau; test_worker prueft, dass
   beide Zahlen gleich sind. Geschrieben wird nur, wenn sich etwas aendert. */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
const v = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const ziel = new URL("../worker/src/version.mjs", import.meta.url);
const text = `// von scripts/worker-version.mjs geschrieben - nicht von Hand aendern\nexport const HALLE_VERSION = ${JSON.stringify(v)};\n`;
if (!existsSync(ziel) || readFileSync(ziel, "utf8") !== text) writeFileSync(ziel, text);
