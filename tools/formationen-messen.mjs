/* ── WIE STARK IST JEDE BOSSFORMATION? (v1.90.18) ───────────────────────────
   Die vier Szenen (meta/campaign.js, BOSS_FORMATIONEN) stellen den Gegner
   anders auf - die Leibwache zieht die Tuerme an den Boss, "vorgeschoben"
   kostet einen Bauern, "leicht" beide Tuerme. Damit keine Szene eine Station
   leichter macht, als sie gestimmt war, wird hier gemessen: dieselbe Station,
   dasselbe Spielerheer (Kapitel zur Haelfte, alle frueheren gemeistert - wie
   in der Aufstellungskammer), KI gegen KI, einmal in "mauer" (der alten
   Aufstellung) und einmal in jeder anderen Szene. Gezaehlt wird, wie oft die
   STATION gewinnt.

   Aufruf: node tools/formationen-messen.mjs [partienJeSzene=12] [--alle] [--duell]
   Ohne --alle: je Kapitel II-XII eine Boss-Station (die erste).
   --duell ist die aussagekraeftige Messung (siehe unten); ohne sie spielt
   ein Spielerheer gegen die Station, und das gewinnt die Station mit dem
   Stand der Aufstellungskammer fast immer - gemessen 86-100 % in jeder
   Szene, daran laesst sich nichts ablesen. Ergebnis vom 1.10.2026 steht in
   meta/campaign.js bei BOSS_FORMATIONEN. */
import { createGame, applyMove, status, makeRng } from "../src/core/index.js";
import { chooseMove } from "../src/ai/index.js";
import { CAMPAIGN, mapById } from "../src/content/index.js";
import { buildStageMatch, buildArmy, defaultProfile, withProgressPct, BOSS_FORMATIONEN } from "../src/meta/index.js";

const N = Number(process.argv[2]) || 12;
const ALLE = process.argv.includes("--alle");
const MAX = 160;

function partie(nodeId, art, keim) {
  const node = CAMPAIGN.find((n) => n.id === nodeId);
  const profil = withProgressPct(defaultProfile(), 50, node.league);
  const m = buildStageMatch(nodeId, profil, null, { formation: art });
  const map = mapById(m.map);
  let g = createGame(buildArmy(profil, map), m.aiArmy, { seed: keim, map, rules: m.rules });
  const r = makeRng(keim);
  for (let z = 0; z < MAX; z++) {
    const st = status(g);
    if (st.over) return st.winner || null;
    const mv = chooseMove(g, 1, r);
    if (!mv) return null;
    g = applyMove(g, mv);
  }
  return null;
}

/* --duell: die Station gegen SICH SELBST - weiss in "mauer", schwarz in der
   gepruefte Szene, und umgekehrt (Farbvorteil heraus). Das misst die Szene
   allein, unabhaengig davon, wie stark ein Spielerheer gerade ist. 50 % heisst
   "so stark wie die alte Aufstellung". */
const DUELL = process.argv.includes("--duell");
function duell(nodeId, art, keim, artWeiss) {
  const node = CAMPAIGN.find((n) => n.id === nodeId);
  const profil = withProgressPct(defaultProfile(), 50, node.league);
  const a = buildStageMatch(nodeId, profil, null, { formation: art });
  const b = buildStageMatch(nodeId, profil, null, { formation: "mauer" });
  const map = mapById(a.map);
  /* weiss steht unten: die Bauernreihe liegt auf Reihe 2 - dieselbe Beschreibung
     traegt createInitialState fuer beide Seiten */
  let g = createGame(artWeiss ? a.aiArmy : b.aiArmy, artWeiss ? b.aiArmy : a.aiArmy, { seed: keim, map, rules: a.rules });
  const r = makeRng(keim);
  for (let z = 0; z < MAX; z++) {
    const st = status(g);
    if (st.over) { if (!st.winner) return 0.5; return (st.winner === "w") === artWeiss ? 1 : 0; }
    const mv = chooseMove(g, 1, r);
    if (!mv) return 0.5;
    g = applyMove(g, mv);
  }
  return 0.5;
}

let stationen = CAMPAIGN.filter((n) => n.boss && !n.final && n.league >= 2 && n.boss.piece !== "dragon");
if (!ALLE) { const je = {}; stationen = stationen.filter((n) => (je[n.league] ? false : (je[n.league] = true))); }
const summe = Object.fromEntries(Object.keys(BOSS_FORMATIONEN).map((k) => [k, { s: 0, n: 0 }]));
const t0 = Date.now();
for (const n of stationen) {
  const zeile = [];
  for (const art of Object.keys(BOSS_FORMATIONEN)) {
    let s = 0, d = 0;
    for (let k = 0; k < N; k++) {
      if (DUELL) { s += duell(n.id, art, 7001 + k * 131, k % 2 === 0); continue; }
      const w = partie(n.id, art, 7001 + k * 131);
      if (w === "b") s++;
      if (w) d++;
    }
    summe[art].s += s; summe[art].n += N;
    zeile.push(`${art.slice(0, 5)} ${String(Math.round(100 * s / N)).padStart(3)} %`);
  }
  console.log(`${n.id} (${n.rules})`.padEnd(20), zeile.join("   "));
}
console.log("\nStation gewinnt, gesamt:");
for (const [art, v] of Object.entries(summe)) console.log(`  ${art.padEnd(13)} ${(100 * v.s / v.n).toFixed(1)} %  (${v.s}/${v.n})`);
console.log(`\n${Math.round((Date.now() - t0) / 1000)} s`);
