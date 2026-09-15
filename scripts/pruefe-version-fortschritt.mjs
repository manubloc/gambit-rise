#!/usr/bin/env node
/* ── DER TORWAECHTER VOR DEM PUSH (v1.13.2) ────────────────────────────────
   Eine Probe im Testlauf kann nur sehen, was IM Arbeitsverzeichnis steht.
   Sie kann package.json gegen das CHANGELOG halten, und sie kann sehen, ob
   die Eintraege vorwaerts laufen. Was sie NICHT sehen kann: ob diese Nummer
   schon einmal ausgeliefert wurde.

   Genau das ist bei v1.13.2 passiert. package.json und CHANGELOG standen
   beide auf 1.13.1, die Probe war gruen - und trotzdem ging ein zweites,
   anderes Bundle unter der Nummer 1.13.1 live. Die Versionsanzeige im
   Profil vergleicht Server- gegen Geraeteversion; zwei verschiedene Builds
   mit derselben Nummer kann sie nicht auseinanderhalten.

   Dieser Waechter vergleicht deshalb gegen origin/main - also gegen das,
   was tatsaechlich draussen ist. Er laeuft VOR dem Push. Gibt es nichts zu
   pushen (HEAD gleich origin/main, Baum sauber), schweigt er.

   Er faellt absichtlich laut aus, wenn er origin/main nicht lesen kann:
   ein Waechter, der bei Unklarheit durchwinkt, ist der Fehler von vorhin
   in neuer Form. */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const lauf = (b) => execSync(b, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const raus = (n, s) => { console.log(`${n ? "✗" : "✓"} ${s}`); if (n) process.exitCode = 1; };

const zahl = (v) => v.split(".").map(Number);
const groesser = (a, b) => {
  const [x, y] = [zahl(a), zahl(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

const hier = JSON.parse(readFileSync("package.json", "utf8")).version;

let dort, kopf, fern, schmutz;
try {
  dort = JSON.parse(lauf("git show origin/main:package.json")).version;
  kopf = lauf("git rev-parse HEAD");
  fern = lauf("git rev-parse origin/main");
  schmutz = lauf("git status --porcelain").length > 0;
} catch (e) {
  raus(true, `origin/main nicht lesbar - der Waechter kann nicht urteilen: ${e.message.split("\n")[0]}`);
  console.log("  (git fetch origin main, dann erneut)");
  process.exit(1);
}

if (kopf === fern && !schmutz) {
  raus(false, `nichts zu pushen - HEAD steht auf origin/main (${hier})`);
  process.exit(0);
}

raus(!groesser(hier, dort),
  groesser(hier, dort)
    ? `die Version waechst: ${dort} (origin/main) → ${hier} (hier)`
    : `die Version waechst NICHT: origin/main traegt ${dort}, hier steht ${hier} - hochzaehlen, sonst geht ein zweites Bundle unter derselben Nummer live`);
