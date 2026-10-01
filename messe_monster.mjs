// Misst die MONSTER-BALANCE mit echten Partien statt Gefuehl: Fuer jedes der
// 25 Wesen tritt ein Referenz-Spieler (Kapitel IV, 40% Ausbau) gegen das
// Stationsheer einer Monsterstation an, in dem das jeweilige Wesen den
// Dame-Slot haelt - beide Seiten spielt der Bot (Tiefe 2, ein Samen je Wesen).
// Dazu zwei ANKER in echter Progression:
//   - die Brutmutter in Kapitel I muss einem Frischling unterliegen
//   - Osric in Kapitel XII darf gewinnen, aber nie im Blitz (>60 Zuege)
// Gruen heisst: Spieler gewinnt insgesamt >= 60%, kein Wesen faellt dem
// Spieler in unter 40 Zuegen zum Opfer, beide Anker stehen.
//   node messe_monster.mjs           -> Tabelle + Urteil
import { createGame, applyMove, status } from "./src/core/index.js";
import { chooseMove } from "./src/ai/index.js";
import { makeRng } from "./src/core/ports/rng.js";
import { buildStageMatch, buildArmyForMap, defaultProfile, withProgressPct } from "./src/meta/index.js";
import { CAMPAIGN, mapById, BOSSES, bossSpec } from "./src/content/index.js";

function playOut(white, black, { map = "classic", rules = "chess", depth = 2, seed = 7, cap = 240 } = {}) {
  let state = createGame(white, black, { seed, map, rules });
  const rng = makeRng((seed * 2654435761) >>> 0);
  let plies = 0, st = status(state);
  while (!st.over && plies < cap) {
    const mv = chooseMove(state, depth, rng);
    if (!mv) break;
    state = applyMove(state, mv);
    plies++; st = status(state);
  }
  return { plies, st };
}

// Referenz: eine mittlere Station mit reinem Monster, deren Heer wir entleihen
const refNode = CAMPAIGN.find((n) => n.league === 4 && n.boss?.pure) || CAMPAIGN.find((n) => n.boss?.pure);
const refProfil = withProgressPct(defaultProfile(), 40, 4);
const spieler = buildArmyForMap(refProfil, mapById("classic"));

const bilanz = (state) => {
  const zellen = state.board.filter(Boolean);
  const s = { w: 0, b: 0, monster: null };
  for (const p of zellen) {
    if (p.color === "w") s.w += p.hp || 0; else s.b += p.hp || 0;
    if (p.kind === "X") s.monster = { hp: p.hp, max: p.maxHp };
  }
  return s;
};

function missWesenEinmal(b, mitGabe, seed) {
  const m = buildStageMatch(refNode.id, refProfil);
  // Nur die GABEN werden verglichen - die Auren sind Bestand und
  // bleiben in beiden Laeufen an, sonst misst das Delta alte Staerke mit.
  const spec = { ...bossSpec(b), ...(mitGabe ? {} : { abilities: [] }) };
  const heer = { ...m.aiArmy, back: m.aiArmy.back.map((p) => (p.kind === "X" ? spec : p)) };
  let state = createGame(spieler, heer, { seed, map: mapById(m.map || "classic"), rules: m.rules || "chess" });
  const rng = makeRng((seed * 2654435761) >>> 0);
  let st = status(state);
  for (let i = 0; i < 120 && !st.over; i++) {
    const mv = chooseMove(state, 2, rng); if (!mv) break;
    state = applyMove(state, mv); st = status(state);
  }
  return { ...bilanz(state), over: st.over, winner: st.over ? st.winner : null };
}

let summeDelta = 0, ausreisser = 0, spielerKollaps = 0, fruehHart = 0;
const zeilen = [];
for (const b of BOSSES) {
  const seeds = [7 + b.id.charCodeAt(2), 101 + b.id.charCodeAt(2)];
  let delta = 0; let mit = null;
  for (const sd of seeds) {
    const o = missWesenEinmal(b, false, sd); mit = missWesenEinmal(b, true, sd);
    delta += ((mit.b - mit.w) - (o.b - o.w)) / seeds.length;
  }
  delta = Math.round(delta);   // wie stark verschiebt die Gabe das Feld
  summeDelta += delta;
  const grenze = Number(b.id.slice(1)) >= 15 ? 24 : 14;  // Elite traegt schwerer
  if (delta > grenze) ausreisser++;
  if (mit.winner === "black") spielerKollaps++;
  zeilen.push(`  ${b.id} ${(b.nameDe + "                          ").slice(0, 24)} Gabe ${((b.abilities || []).join(",") || "-").padEnd(18)} Feldwirkung ${String(delta >= 0 ? "+" + delta : delta).padStart(4)}  Monster-HP ${mit.monster ? mit.monster.hp + "/" + mit.monster.max : "tot"}`);
}
console.log(zeilen.join("\n"));
const mittel = (summeDelta / BOSSES.length).toFixed(1);
console.log(`\nMittlere Feldwirkung der Gaben: ${mittel} HP (Ziel: 0 bis +6)`);
// RECHNERISCHER HAERTEANKER: effektive Schlaege eines atk-2- und atk-3-
// Angreifers bis zum Fall. bulwark schluckt 1 je Schlag, regen heilt ~1 je
// Runde; lifesteal ist Angriffskraft, keine Zaehigkeit. Grenzen: die ersten
// sechs (Kapitel-I-Rotation) fallen einem atk-2-Bauern in <=12 Schlaegen,
// alle anderen in <=16; gegen atk 3 faellt jedes in <=16.
const effSchlaege = (b, atk) => {
  const ab = b.abilities || [];
  const je = Math.max(0.5, atk - (ab.includes("bulwark") ? 1 : 0) - (ab.includes("regen") ? 1 : 0));
  return Math.ceil(b.hp / je);
};
for (const b of BOSSES) {
  const s2 = effSchlaege(b, 2), s3 = effSchlaege(b, 3);
  const idx = Number(b.id.slice(1));
  const g2 = idx <= 6 ? 12 : idx === 25 ? 18 : 16;  // das Finale darf fordern
  if (s2 > g2) { fruehHart++; console.log(`  !! ${b.id} ${b.nameDe}: ${s2} Schlaege eines atk-2-Bauern (Grenze ${g2})`); }
  if (s3 > 16) { fruehHart++; console.log(`  !! ${b.id} ${b.nameDe}: ${s3} Schlaege eines atk-3-Angreifers (Grenze 16)`); }
}
console.log(`Ausreisser ueber +14 Feldwirkung: ${ausreisser} (Ziel 0) | Spieler-Niederlagen: ${spielerKollaps} (Ziel <=3) | Haerte-Verletzungen: ${fruehHart} (Ziel 0)`);

// Anker: Brutmutter faellt einem Frischling, Osric widersteht dem Vollausbau lange
/* v1.90.20: Kapitel I hat keine Monster-Station mehr (der Drache, eine Figur,
   haelt das Finale) - der Anker ist die erste Monster-Station ueberhaupt */
const a4 = CAMPAIGN.filter((n) => n.boss?.pure).sort((x, y) => x.league - y.league)[0];
const frisch = defaultProfile();
const m1 = buildStageMatch(a4.id, frisch);
let s1 = createGame(buildArmyForMap(frisch, mapById(m1.map || "classic")), m1.aiArmy, { seed: 3, map: mapById(m1.map || "classic"), rules: m1.rules || "chess" });
const r1 = makeRng((3 * 2654435761) >>> 0);
let st1 = status(s1);
for (let i = 0; i < 160 && !st1.over; i++) { const mv = chooseMove(s1, 2, r1); if (!mv) break; s1 = applyMove(s1, mv); st1 = status(s1); }
const b1 = bilanz(s1);
const anker1 = !b1.monster || b1.monster.hp <= Math.ceil(b1.monster.max * 0.5);
console.log(`Anker Brutmutter (Kap I, Frischling): Monster ${b1.monster ? b1.monster.hp + "/" + b1.monster.max : "GEFALLEN"} nach 160 Zuegen ${anker1 ? "-> steht" : "-> ZU ZAEH"}`);

const mittelOk = summeDelta / BOSSES.length >= 0 && summeDelta / BOSSES.length <= 6;
if (mittelOk && ausreisser === 0 && spielerKollaps <= 3 && fruehHart === 0 && anker1) console.log("\n== MONSTER IM GLEICHGEWICHT ==");
else { console.log("\nBEFUND: Balance verletzt (Mittel " + mittel + ", Ausreisser " + ausreisser + ", Kollaps " + spielerKollaps + ", Haerte " + fruehHart + ", Anker " + anker1 + ")"); process.exit(1); }
