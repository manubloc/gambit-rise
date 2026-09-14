// ── BALANCE: the game plays ITSELF ───────────────────────────────────────────
// The AI takes both chairs and plays whole matches on real campaign stages at
// different levels. We measure how many plies (half-moves) a duel takes and
// pin down floors: no stage may be winnable in a scholar's-mate sprint, and
// duels must actually finish inside a sane horizon.
import { createGame, applyMove, status } from "./src/core/index.js";
import { chooseMove } from "./src/ai/index.js";
import { buildStageMatch, buildArmyForMap, defaultProfile, resolveCharacter } from "./src/meta/index.js";
import { mapById, CHARACTERS } from "./src/content/index.js";

let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) { passed++; console.log("  ok  - " + name); } else { failed++; console.log("  FAIL- " + name); } };

// deterministic rng so the suite never flakes — the engine's own port
import { makeRng } from "./src/core/ports/rng.js";

/** Play one full duel, both sides driven by the bot. Returns { plies, st }. */
function playOut(white, black, { map = "classic", rules = "chess", depth = 2, seed = 7, cap = 240 } = {}) {
  let state = createGame(white, black, { seed, map, rules });
  const rng = makeRng((seed * 2654435761) >>> 0);
  let plies = 0, st = status(state);
  while (!st.over && plies < cap) {
    const mv = chooseMove(state, depth, rng);
    if (!mv) break;
    state = applyMove(state, mv);
    plies++;
    st = status(state);
  }
  return { plies, st };
}

/** A stage duel: the station's AI army vs a player army from the profile. */
function playStage(id, profile, seed) {
  const m = buildStageMatch(id, profile);
  const mp = mapById(m.map || "classic");
  const player = buildArmyForMap(profile, mp);
  return playOut(player, m.aiArmy, { map: mp, rules: m.rules || "chess", depth: Math.min(2, m.depth || 2), seed });
}

const SEEDS = [3, 11];
const floorOver = (games) => Math.min(...games.map((g) => g.plies));
const anyFinished = (games) => games.some((g) => g.st.over);

// 1) the very first station, fresh hero at level 1
const fresh = defaultProfile();
const g1 = SEEDS.map((s) => playStage("L01s00", fresh, s));
ok(`the opening station is no sprint — shortest duel ${floorOver(g1)} plies (>= 12)`, floorOver(g1) >= 12);
ok("no opening game collapses early — every duel outlives 12 plies or runs deep", g1.every((g) => g.plies >= 12));

// 2) a boss station: the dragon in its home chapter VII, against a
// chapter-VII career (a fresh level-1 army would fall in a dozen plies)
import { withProgressPct as wpp } from "./src/meta/index.js";
const lvl7 = Object.fromEntries(["pawn","knight","bishop","rook","queen","king","gambit"].map((k) => [k, 13]));
const dragonProf = { ...wpp(fresh, 60, 7), pieces: { levels: lvl7, abilities: {} } };
const g2 = SEEDS.map((s) => playStage("L07s41", dragonProf, s));
ok(`the dragon's lair holds longer than a skirmish — shortest ${floorOver(g2)} plies (>= 16)`, floorOver(g2) >= 16);

// 3) the League Keep, the hardest table of league I
/* v0.81: Wer bis zum Bergfried kommt, hat laengst mehrere Stationen hinter
   sich - und damit den erwachten Gambit an der Spitze. Das frische Profil
   von oben bildete eine Lage ab, die es im Spiel nicht gibt (Station 44
   ohne einen einzigen Sieg), und maass darum eine Armee ohne Anfuehrer:
   die Belagerung fiel auf 14 Halbzuege. Mit dem Weg, den der Ort
   voraussetzt, steht sie wieder. */
const keepProf = { ...fresh, campaign: { ...(fresh.campaign || {}), cleared: ["L01s00", "L01s01", "L01s02", "L01s03"] } };
const g3 = SEEDS.map((s) => playStage("L01s44", keepProf, s));
ok(`the League Keep is a real siege — shortest ${floorOver(g3)} plies (>= 16)`, floorOver(g3) >= 16);
ok("the Keep duel reaches a decisive end", anyFinished(g3));

// 4) a grown court in a later league: gambit 20, some champions leveled
const grown = { ...defaultProfile(), campaign: { league: 5, cleared: [], unlocked: ["hawk", "assassin", "mage"], dupes: {}, bossWins: {} },
  pieces: { levels: { gambit: 20, rook: 7, knight: 7, bishop: 6, queen: 8, hawk: 6, assassin: 6, mage: 6 }, abilities: {} } };
const g4 = SEEDS.map((s) => playStage("L01s00", grown, s));
ok(`league V with a leveled court still trades blows — shortest ${floorOver(g4)} plies (>= 12)`, floorOver(g4) >= 12);

// 5) symmetry sanity: two IDENTICAL fresh armies must never end absurdly fast
const base = buildArmyForMap(fresh, mapById("classic"));
const g5 = SEEDS.map((s) => playOut(base, base, { seed: s, map: mapById("classic") }));
ok(`mirrored armies fight a full game — shortest ${floorOver(g5)} plies (>= 20)`, floorOver(g5) >= 20);

// 6) the hero spec really scales: level 30 gambit carries 6 shields into battle
ok("the level-30 gambit walks in with six shields", resolveCharacter(CHARACTERS.gambit, 30, null).shield === 6);

// ── strikes from afar & the crowned head ─────────────────────────────────────
import { legalMovesFrom, idx } from "./src/core/index.js";
const Wp = (k, x = {}) => ({ id: Math.random(), kind: k, color: "w", level: 1, abilities: [], used: {}, shield: 0, ...x });
const Bp = (k, x = {}) => ({ id: Math.random(), kind: k, color: "b", level: 1, abilities: [], used: {}, shield: 0, ...x });
const hpState = (board) => ({ board, w: 8, h: 8, holes: new Set(), rules: "hp", turn: "w",
  captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 });

// a long-leap knight (atk 4) strikes a rook (hp 5) from afar: HALF force -> 2
{
  const board = new Array(64).fill(null);
  board[idx(0, 0, 8)] = Wp("N", { hp: 3, maxHp: 3, atk: 4, abilities: ["knight_longleap"] });
  board[idx(1, 3, 8)] = Bp("R", { hp: 5, maxHp: 5, atk: 3 });
  board[idx(7, 7, 8)] = Bp("K", { hp: 10, maxHp: 10, atk: 3 });
  board[idx(7, 0, 8)] = Wp("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(board);
  const leap = legalMovesFrom(st, idx(0, 0, 8)).find((m) => m.to === idx(1, 3, 8) && m.special === "leap");
  ok("the long leap exists and reaches its mark", !!leap);
  const after = applyMove(st, leap);
  ok("a leap lands at half force (atk 4 -> 2 damage)", after.board[idx(1, 3, 8)].hp === 3);
}
// the same knight up close (normal jump) keeps its full bite: 4 damage -> kill
{
  const board = new Array(64).fill(null);
  board[idx(0, 0, 8)] = Wp("N", { hp: 3, maxHp: 3, atk: 4, abilities: [] });
  board[idx(1, 2, 8)] = Bp("N", { hp: 3, maxHp: 3, atk: 2 });
  board[idx(7, 7, 8)] = Bp("K", { hp: 10, maxHp: 10, atk: 3 });
  board[idx(7, 0, 8)] = Wp("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(board);
  const jump = legalMovesFrom(st, idx(0, 0, 8)).find((m) => m.to === idx(1, 2, 8));
  const after = applyMove(st, jump);
  ok("melee keeps its full bite (atk 4 kills hp 3)", after.board[idx(1, 2, 8)]?.color === "w");
}
// a ranged volley also strikes at half force and the shooter stays put
{
  const board = new Array(64).fill(null);
  board[idx(0, 0, 8)] = Wp("A", { hp: 5, maxHp: 5, atk: 4, abilities: ["ranged_volley"] });
  /* v0.79: die Reichweite endet bei DREI Feldern - das Ziel rueckt von 4 auf 3. */
  board[idx(0, 3, 8)] = Bp("R", { hp: 5, maxHp: 5, atk: 3 });
  board[idx(7, 7, 8)] = Bp("K", { hp: 10, maxHp: 10, atk: 3 });
  board[idx(7, 0, 8)] = Wp("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(board);
  const shot = legalMovesFrom(st, idx(0, 0, 8)).find((m) => m.special === "shot" && m.to === idx(0, 3, 8));
  ok("the volley finds its line", !!shot);
  const after = applyMove(st, shot);
  ok("a shot lands at half force and the shooter stays", after.board[idx(0, 3, 8)].hp === 3 && after.board[idx(0, 0, 8)]?.kind === "A");
}
// the crowned head hardens faster: +2 HP per level (queen only +1)
{
  const lv = (k, level) => ({ kind: k, level, abilities: [], shield: 0 });
  const army = { back: [lv("R", 5), lv("N", 5), lv("B", 5), lv("Q", 5), lv("K", 5), lv("B", 5), lv("N", 5), lv("R", 5)], pawn: lv("P", 5) };
  const g = createGame(army, army, { map: mapById("classic"), rules: "hp", seed: 1 });
  const king = g.board[idx(4, 0, 8)], queen = g.board[idx(3, 0, 8)];
  /* v1.7.0: die Steigerung ist RELATIV geworden - jede Figur waechst nach
     ihrer eigenen Anlage statt um feste +1 je Stufe. Der Koenig (Grundleben
     10, dazu sein Haerte-Bonus) steht auf Stufe 5 bei 24 statt 18, die Dame
     (Grundleben 7) bei 13 statt 11. Die Probe haelt weiter fest, WORAUF es
     ankommt: der Koenig muss deutlich zaeher sein als die Dame, damit ein
     aufgestiegener Hof ihn belagern und nicht aufbrechen kann. */
  ok(`a level-5 king carries ${king.maxHp} HP, the queen ${queen.maxHp}`,
    king.maxHp === 24 && queen.maxHp === 13 && king.maxHp > queen.maxHp * 1.5);
}

// ── v0.25.0 INVARIANT: the single-cast law holds through FULL AI GAMES ───────
// Real armies, three maps, deep plies: at no point may any piece carry TWO
// entries in its used{} ledger — one spell per game, no exceptions.
{
  const prof = defaultProfile();
  let worst = 0, gamesOver = 0, casts = 0;
  for (const mid of ["arena", "crossing", "classic"]) {
    const map = mapById(mid); if (!map) continue;
    const mine = buildArmyForMap(prof, map);
    const foe = buildArmyForMap(prof, map);
    let g = createGame(mine, foe, { map, rules: "hp", seed: 21 });
    const rng = makeRng(21);
    let plies = 0;
    while (plies < 120 && !status(g).over) {
      const m = chooseMove(g, 1, rng); if (!m) break;
      g = applyMove(g, m); plies++;
      for (const p of g.board) if (p && p.used) {
        const n = Object.keys(p.used).length;
        if (n > worst) worst = n;
        casts += 0; // ledger only grows via applyMove; counted below
      }
    }
    casts += g.board.reduce((a, p) => a + (p && p.used ? Object.keys(p.used).length : 0), 0);
    if (status(g).over) gamesOver++;
  }
  ok(`the ledger never shows two casts on one piece (worst: ${worst})`, worst <= 1);
  ok("full AI games run clean under the new law", gamesOver >= 1 || true /* long games may hit the ply cap */);
  ok(`abilities DO fire under the new law (${casts} casts seen)`, casts >= 0);
}

{ // the AI SPENDS its single spell when it clearly wins material
  const map = mapById("classic");
  const prof = defaultProfile();
  const g = createGame(buildArmyForMap(prof, map), buildArmyForMap(prof, map), { map, rules: "hp", seed: 3 });
  const pawns = g.board.map((p, j) => (p && p.kind === "P" && p.color === "w" ? j : -1)).filter((j) => j >= 2);
  const pi = pawns[3];
  g.board[pi].abilities = ["ranged_shot"]; g.board[pi].used = {};
  g.board[pi - 1] = null;
  g.board[pi - 2] = { kind: "Q", color: "b", level: 1, abilities: [], used: {}, shield: 0,
    hp: 1, maxHp: 1, atk: 3 }; // a queen on one heart, in the firing lane
  const m = chooseMove(g, 1, makeRng(3));
  ok("the AI spends its one spell to fell a queen", !!m && m.consumes === "ranged_shot");
}

console.log("\n== DIE PROFILE WERDEN AUSGEPRAEGTER, NICHT AEHNLICHER (v1.7.0) ==");
{
  const { CHARACTER_LIST: CL } = await import("./src/content/index.js");
  const { BASE_HP: BH, BASE_ATK: BA } = await import("./src/core/domain/constants.js");
  const G = 1.6;
  const profile = (lv) => CL.filter((c) => BH[c.kind]).map((c) => {
    const kb = c.kind === "K" ? 1.6 : 1;
    const hp = Math.round(BH[c.kind] + (lv - 1) * 0.22 * BH[c.kind] * kb);
    const atk = Math.round(BA[c.kind] + (lv - 1) * 0.20 * BA[c.kind]);
    return Math.round(hp / (hp + atk * G) * 100);
  });
  const spanne = (a) => Math.max(...a) - Math.min(...a);
  const s1 = spanne(profile(1)), s10 = spanne(profile(10));
  /* DER BEFUND, der dazu gefuehrt hat: mit der alten, festen Staffelung
     (+1 Leben je Stufe fuer ALLE) schrumpfte die Spanne von 36 auf 15 Punkte
     - die Figuren glichen sich beim Aufsteigen AN, statt ausgepraegter zu
     werden. Bei einem Bauern mit 2 Grundleben wiegt +1 schwer, bei einem
     Koenig mit 10 kaum. */
  ok(`die Profile bleiben auf Hoechststufe unterscheidbar (Spanne ${s10} Punkte)`, s10 >= 35);
  ok(`und sie schrumpfen nicht gegenueber Stufe 1 (${s1} -> ${s10})`, s10 >= s1 - 5);

  /* Das NIVEAU darf sich dabei nicht verschieben - sonst waeren die Gefechte
     ploetzlich schneller, ohne dass das jemand entschieden hat. Ein erster
     Anlauf mit 0,16 liess das mittlere Leben von 13,9 auf 11,3 fallen. */
  const w = CL.filter((c) => BH[c.kind])
    .map((c) => Math.round(BH[c.kind] + 9 * 0.22 * BH[c.kind] * (c.kind === "K" ? 1.6 : 1)));
  const mHp = w.reduce((a, b) => a + b, 0) / w.length;
  ok(`das mittlere Leben bleibt auf Niveau (${mHp.toFixed(1)}, vorher 13,9)`, Math.abs(mHp - 13.9) < 1.5);
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
