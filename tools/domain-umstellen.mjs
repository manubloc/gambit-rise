/* ── DOMAIN UMSTELLEN (v1.40.0) ────────────────────────────────────────────
   Der Besitzer hat gambitrise.com gekauft; grandgambit.win laeuft aus. Die
   Adresse steht an rund 80 Stellen - in index.html, der Landingpage, den
   Rechtstexten, dem Manifest, der TWA, im Worker und in den Fahrproben.
   Statische Dateien koennen keine Konstante lesen, darum macht es dieses
   Werkzeug: EIN Aufruf stellt alles um, und zwar erst dann, wenn die neuen
   Eintraege in Cloudflare stehen (Pages-Domain und die Worker-Route
   duell.gambitrise.com). Vorher wuerde das Online-Duell ins Leere laufen.

   Aufruf:  node tools/domain-umstellen.mjs            (zeigt nur, was sich aendert)
            node tools/domain-umstellen.mjs --machen   (schreibt)
   Zurueck: node tools/domain-umstellen.mjs --zurueck --machen                */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const ALT = "grandgambit.win";
const NEU = "gambitrise.com";
const zurueck = process.argv.includes("--zurueck");
const machen = process.argv.includes("--machen");
const von = zurueck ? NEU : ALT;
const nach = zurueck ? ALT : NEU;

const dateien = execSync("git ls-files", { encoding: "utf8" }).split("\n")
  .filter((p) => p && !p.startsWith("archiv/") && !p.startsWith("server/backups/") && p !== "CHANGELOG.md"
    && !p.startsWith("design/") && p !== "tools/domain-umstellen.mjs");

let dateienGeaendert = 0, stellen = 0;
for (const p of dateien) {
  let s;
  try { s = readFileSync(p, "utf8"); } catch { continue; }
  const n = s.split(von).length - 1;
  if (!n) continue;
  stellen += n; dateienGeaendert++;
  console.log(`${String(n).padStart(3)}  ${p}`);
  if (machen) writeFileSync(p, s.split(von).join(nach));
}
console.log(`\n${machen ? "umgestellt" : "wuerde umstellen"}: ${dateienGeaendert} Dateien, ${stellen} Stellen  (${von} -> ${nach})`);
if (machen) {
  console.log("\nDanach von Hand pruefen:");
  console.log("  - src/app/config.js       SERVER_URL zeigt auf wss://duell." + nach + "/ws");
  console.log("  - public/.well-known/assetlinks.json  liegt auf der NEUEN Domain (Play Store)");
  console.log("  - design/twa-manifest.json  host und alle URLs");
  console.log("  - danach: npm test, npm run build, node drive3.mjs");
}
