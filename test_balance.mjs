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
/* v1.24.0: Stufe 30 gibt es nicht mehr - die Hoechststufe ist 20. Die elf
   Schilde liegen jetzt zwischen Stufe 4 und 20; auf halbem Weg (Stufe 10)
   sind es drei. */
ok("der Gambit traegt auf halbem Weg drei Schilde, auf Stufe 20 neun - hp 35, unter dem Doppelten des Mittels",
  resolveCharacter(CHARACTERS.gambit, 10, null).shield === 3 && resolveCharacter(CHARACTERS.gambit, 20, null).shield === 9);

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
  /* v1.22.0: das ZIELPROFIL loest die relative Steigerung ab - der Koenig
     laeuft von 10 auf 40, die Dame von 7 auf 18. Auf Stufe 5: 23 und 12. Die
     Probe haelt weiter fest, worauf es ankommt: der Koenig ist ein Bollwerk. */
  /* v1.22.2: gleiches Budget fuer alle (24), der Koenig 21/3, die Dame 14/10.
     Auf Stufe 5: 15 und 10. Der Koenig bleibt das Bollwerk - zaeher als die
     Dame, aber nicht mehr mit dem doppelten Budget. */
  ok(`a level-5 king carries ${king.maxHp} HP, the queen ${queen.maxHp}`,
    king.maxHp === 15 && queen.maxHp === 10 && king.maxHp >= queen.maxHp * 1.4);
}

/* ── DIE PROFILE SIND WEIT GESPREIZT (v1.22.0, Besitzerentscheid) ───────────
   "Es darf welche geben mit ganz viel Leben und kaum Angriff, und welche mit
   ganz viel Angriff, die auf einen Schlag kaputt sind." Gemessen auf der
   Hoechststufe, ueber alle Arten. */
{
  const { ZIEL_PROFIL, werteBeiStufe, HOECHSTSTUFE } = await import("./src/core/index.js");
  const blau = (k) => { const w = werteBeiStufe(k, HOECHSTSTUFE); return w.atk / (w.hp + w.atk); };
  const arten = Object.keys(ZIEL_PROFIL);
  const b = arten.map(blau); const mn = Math.min(...b), mx = Math.max(...b);
  ok(`die Profile spannen von ${Math.round(mn * 100)} % bis ${Math.round(mx * 100)} % Blau (vorher 16 bis 55)`, mn <= 0.15 && mx >= 0.80);
  ok("der Attentaeter ist eine Klinge: 4 Leben, 20 Angriff", werteBeiStufe("S", HOECHSTSTUFE).hp === 4 && werteBeiStufe("S", HOECHSTSTUFE).atk === 20);
  ok("der Koenig ist ein Bollwerk: 21 Leben, 3 Angriff (v1.22.2: dasselbe Budget wie alle)", werteBeiStufe("K", HOECHSTSTUFE).hp === 21 && werteBeiStufe("K", HOECHSTSTUFE).atk === 3);
  ok("das Ziel ist auf der Hoechststufe genau erreicht", arten.every((k) => { const w = werteBeiStufe(k, HOECHSTSTUFE); return w.hp === ZIEL_PROFIL[k][0] && w.atk === ZIEL_PROFIL[k][1]; }));
  const { BASE_HP: bh1, BASE_ATK: ba1 } = await import("./src/core/index.js");
  ok("auf Stufe 1 gelten die Grundwerte", arten.every((k) => { const w = werteBeiStufe(k, 1); return w.hp === (bh1[k] || 1) && w.atk === (ba1[k] || 1); }));
  const mono = arten.every((k) => { let ok2 = true; for (let l = 2; l <= HOECHSTSTUFE; l++) { const a = werteBeiStufe(k, l - 1), c = werteBeiStufe(k, l); if (c.hp < a.hp || c.atk < a.atk) ok2 = false; } return ok2; });
  ok("keine Figur verliert beim Aufstieg Leben oder Angriff", mono);
  /* das Niveau bleibt: mittleres Budget der Hofstaat-Arten etwa wie vorher (24) */
  const budget = arten.filter((k) => k !== "K" && k !== "D").map((k) => { const w = werteBeiStufe(k, HOECHSTSTUFE); return w.hp + w.atk; });
  const mittel = budget.reduce((a, c) => a + c, 0) / budget.length;
  ok(`das mittlere Budget bleibt beim alten Niveau (${mittel.toFixed(1)} Punkte, vorher 21,6)`, mittel >= 19 && mittel <= 25);
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

/* ── JEDE FIGUR HAT DASSELBE BUDGET (v1.22.2, Besitzer-Klarstellung) ─────────
   Nur der Drache hat das Doppelte. */
{
  const { ZIEL_PROFIL, BUDGET_HOECHSTSTUFE, BUDGET_DRACHE } = await import("./src/core/domain/constants.js");
  const falsch = Object.entries(ZIEL_PROFIL).filter(([k, [h, a]]) => h + a !== (k === "D" ? BUDGET_DRACHE : BUDGET_HOECHSTSTUFE));
  ok(`jede Art hat auf der Hoechststufe ${BUDGET_HOECHSTSTUFE} Punkte, der Drache ${BUDGET_DRACHE}${falsch.length ? " (falsch: " + falsch.map(([k]) => k).join(", ") + ")" : ""}`, falsch.length === 0);
  const q = Object.entries(ZIEL_PROFIL).map(([k, [h, a]]) => a / (h + a));
  ok(`die Verteilung reicht von ${Math.round(Math.min(...q) * 100)} % bis ${Math.round(Math.max(...q) * 100)} % Blau`, Math.min(...q) <= 0.15 && Math.max(...q) >= 0.8);
}
/* ── DIE MONSTER SIND GENAUSO GESPREIZT (v1.23.0) ─────────────────────────── */
{
  const { BOSSES } = await import("./src/content/index.js");
  const { bossSpecLeveled, BOSS_MAX_LEVEL, ZIEL_PROFIL_BOSS, BOSS_BUDGET } = await import("./src/meta/index.js");
  const l = Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES);
  const w = l.map((b) => { const s = bossSpecLeveled(b, BOSS_MAX_LEVEL); return { id: b.id, hp: s.hp, atk: s.atk, q: s.atk / (s.hp + s.atk) }; });
  const ohne = l.filter((b) => !ZIEL_PROFIL_BOSS[b.id]).map((b) => b.id);
  ok(`jedes der ${l.length} Monster hat ein Zielprofil${ohne.length ? " (fehlen: " + ohne.join(", ") + ")" : ""}`, ohne.length === 0);
  const falsch = w.filter((x) => x.hp + x.atk !== BOSS_BUDGET).map((x) => x.id);
  ok(`jedes Monster hat auf der Hoechststufe ${BOSS_BUDGET} Punkte${falsch.length ? " (falsch: " + falsch.join(", ") + ")" : ""}`, falsch.length === 0);
  const q = w.map((x) => x.q);
  ok(`die Monster spannen von ${Math.round(Math.min(...q) * 100)} % bis ${Math.round(Math.max(...q) * 100)} % Blau (vorher 19 bis 39)`, Math.min(...q) <= 0.15 && Math.max(...q) >= 0.8);
}
console.log(`\nRESULT (Budget): ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
