import { createGame, reduce, moveCommand, legalMoves, legalMovesFrom, applyMove, status, idx, HP_REMIS_HALBZUEGE } from "./src/core/index.js";
import { mapById } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

const spec = (k) => ({ kind: k, level: 1, abilities: [], shield: 0 });
const a8 = { back: ["R", "N", "B", "Q", "K", "B", "N", "R"].map(spec), pawn: spec("P") };
const classic = mapById("classic");

// ── stats are injected only in HP mode ───────────────────────────────────────
const hpGame = createGame(a8, a8, { map: classic, rules: "hp" });
const q = hpGame.board[idx(3, 0, 8)];
ok("HP mode gives the queen hp/maxHp/atk", q.hp === 7 && q.maxHp === 7 && q.atk === 4);
ok("HP mode gives the pawn small stats", hpGame.board[idx(0, 1, 8)].atk === 1);
const chessGame = createGame(a8, a8, { map: classic, rules: "chess" });
ok("chess mode leaves pieces without hp", chessGame.board[idx(3, 0, 8)].hp === undefined);
ok("HP mode has no check restriction (all pseudo legal)", legalMoves(hpGame).length === 20);

// ── controlled combat board ──────────────────────────────────────────────────
const W = (k, x = {}) => ({ id: Math.random(), kind: k, color: "w", level: 1, abilities: [], used: {}, shield: 0, ...x });
const B = (k, x = {}) => ({ id: Math.random(), kind: k, color: "b", level: 1, abilities: [], used: {}, shield: 0, ...x });
function hpState(board) { return { board, w: 8, h: 8, holes: new Set(), rules: "hp", turn: "w", captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 }; }

// queen (atk 4) attacks rook (hp 5) directly above → survives at 1, attacker bumps
let board = new Array(64).fill(null);
board[idx(0, 0, 8)] = W("Q", { hp: 7, maxHp: 7, atk: 4 });
board[idx(0, 1, 8)] = B("R", { hp: 5, maxHp: 5, atk: 3 });
board[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
board[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
let st = hpState(board);
const attack = legalMoves(st).find((m) => m.from === idx(0, 0, 8) && m.to === idx(0, 1, 8));
let r = reduce(st, moveCommand(attack));
ok("a non-lethal hit wounds the target", r.state.board[idx(0, 1, 8)].hp === 1);
ok("a non-lethal attacker bumps (stays put)", r.state.board[idx(0, 0, 8)] && r.state.board[idx(0, 0, 8)].kind === "Q");
ok("a wound emits a 'damaged' event", r.events.some((e) => e.type === "damaged") && !r.events.some((e) => e.type === "captured"));

// now the rook is at 1 hp → the same attack kills and the queen advances
board[idx(0, 1, 8)].hp = 1; st = hpState(board);
r = reduce(st, moveCommand(attack));
ok("a lethal hit removes the target and advances the attacker", r.state.board[idx(0, 1, 8)].kind === "Q" && r.state.board[idx(0, 0, 8)] === null);
ok("a kill emits a 'captured' event", r.events.some((e) => e.type === "captured"));

// ── regicide ends the game ───────────────────────────────────────────────────
let kb = new Array(64).fill(null);
kb[idx(6, 7, 8)] = W("Q", { hp: 7, maxHp: 7, atk: 4 });
kb[idx(7, 7, 8)] = B("K", { hp: 3, maxHp: 10, atk: 3 });
kb[idx(0, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
let ks = hpState(kb);
const kill = legalMoves(ks).find((m) => m.to === idx(7, 7, 8));
let rk = reduce(ks, moveCommand(kill));
ok("killing the king ends the game (regicide)", status(rk.state).result === "regicide" && status(rk.state).winner === "w");
ok("regicide emits gameOver", rk.events.some((e) => e.type === "gameOver"));

// ── chess mode is unchanged: capture is instant ──────────────────────────────
let cb = new Array(64).fill(null);
cb[idx(0, 0, 8)] = W("Q"); cb[idx(0, 1, 8)] = B("R"); cb[idx(7, 7, 8)] = B("K"); cb[idx(7, 0, 8)] = W("K");
let cs = { board: cb, w: 8, h: 8, holes: new Set(), rules: "chess", turn: "w", captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 };
const cap = legalMoves(cs).find((m) => m.from === idx(0, 0, 8) && m.to === idx(0, 1, 8));
let rc = reduce(cs, moveCommand(cap));
ok("chess mode still captures instantly", rc.state.board[idx(0, 1, 8)].kind === "Q" && rc.state.board[idx(0, 0, 8)] === null);

// ── new abilities ────────────────────────────────────────────────────────────
const ab = (k, side, x) => ({ id: Math.random(), kind: k, color: side, level: 1, abilities: [], used: {}, shield: 0, hp: 5, maxHp: 5, atk: 3, ...x });
const kings = (bd) => { bd[idx(7, 7, 8)] = ab("K", "b", { hp: 10, maxHp: 10 }); bd[idx(7, 0, 8)] = ab("K", "w", { hp: 10, maxHp: 10 }); };

// ranged snipe: hits at distance, attacker stays even on kill
let rb = new Array(64).fill(null);
rb[idx(0, 0, 8)] = ab("B", "w", { abilities: ["ranged_shot"], atk: 9 });
rb[idx(0, 3, 8)] = ab("R", "b", { hp: 5, maxHp: 5 });
kings(rb);
let rs = hpState(rb);
const shot = legalMoves(rs).find((m) => m.special === "shot" && m.to === idx(0, 3, 8));
ok("ranged attack is generated at distance", !!shot && shot.noAdvance);
let rr = reduce(rs, moveCommand(shot));
ok("ranged kill removes target but shooter stays put", rr.state.board[idx(0, 3, 8)] === null && rr.state.board[idx(0, 0, 8)].kind === "B");

/* v1.37.0 (Besitzer): LEBENSRAUB nach Stufe - ein Viertel, die Haelfte, drei
   Viertel des Schadens (vorher immer die Haelfte). Schaden hier: 4. */
const raub = (stufe) => {
  const lb = new Array(64).fill(null);
  lb[idx(0, 0, 8)] = ab("Q", "w", { abilities: ["lifesteal"], stufen: { lifesteal: stufe }, hp: 3, maxHp: 9, atk: 4 });
  lb[idx(1, 1, 8)] = ab("R", "b", { hp: 9, maxHp: 9 });
  kings(lb);
  const r = reduce(hpState(lb), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: 1, kind: "Q", color: "w", capture: true, captureKind: "R" }));
  return r.state.board[idx(0, 0, 8)].hp - 3;
};
ok("Lebensraub I heilt ein Viertel des Schadens (1 von 4)", raub(1) === 1);
ok("Lebensraub II die Haelfte (2), III drei Viertel (3)", raub(2) === 2 && raub(3) === 3);

// bulwark reduces incoming damage
let bb = new Array(64).fill(null);
bb[idx(0, 0, 8)] = ab("Q", "w", { atk: 4 });
bb[idx(1, 1, 8)] = ab("R", "b", { hp: 9, maxHp: 9, abilities: ["bulwark"] });
kings(bb);
let br = reduce(hpState(bb), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: 1, kind: "Q", color: "w", capture: true, captureKind: "R" }));
ok("bulwark soaks 1 damage", br.state.board[idx(1, 1, 8)].hp === 6);

/* v1.37.0: REGENERATION nach Stufe - I heilt 1 je ZWEITEM eigenen Zug,
   II 1 je Zug, III 2 je Zug (vorher immer 1 je Zug). */
const zieht = (st, von) => {
  const m = legalMoves(st).find((x) => x.from === von && !x.capture);
  return reduce(st, moveCommand(m)).state;
};
const regenLauf = (stufe, zuege) => {
  const gb = new Array(64).fill(null);
  gb[idx(0, 0, 8)] = ab("R", "w", { abilities: ["regen"], stufen: { regen: stufe }, hp: 4, maxHp: 9 });
  kings(gb);
  let st = hpState(gb);
  for (let n = 0; n < zuege; n++) {
    const meine = [...st.board].findIndex((p) => p && p.kind === "R" && p.color === "w");
    st = zieht({ ...st, turn: "w" }, meine);
  }
  return [...st.board].find((p) => p && p.kind === "R" && p.color === "w").hp - 4;
};
ok("Regeneration I heilt beim ersten Zug noch nicht, beim zweiten 1", regenLauf(1, 1) === 0 && regenLauf(1, 2) === 1);
ok("Regeneration II heilt 1 je Zug, III 2 je Zug", regenLauf(2, 1) === 1 && regenLauf(3, 1) === 2);


// ── the TWO houses: crown and shadow, plus the boss auras ────────────────────
import { shiftCommand, potionCommand as potCmd, familyOf, crownWallSoak, crownHp, shadowRifts, shadowAtk, encodeState, decodeState } from "./src/core/index.js";
import { bossSpec, bossById } from "./src/content/index.js";
{
  // shadow ladder: 4 fielded shadows → +1 atk each and 2 rifts banked
  const sh4 = { back: ["H", "S", "O", "Z", "K", "B", "N", "R"].map(spec), pawn: spec("P") };
  const g4 = createGame(sh4, a8, { map: classic, rules: "hp" });
  const hawk4 = g4.board[idx(0, 0, 8)];
  const sh1 = { back: ["H", "N", "B", "Q", "K", "B", "N", "R"].map(spec), pawn: spec("P") };
  const hawk1 = createGame(sh1, a8, { map: classic, rules: "hp" }).board[idx(0, 0, 8)];
  ok("shadow ladder: 4 shadows → +1 atk each & 2 rifts", hawk4.atk === hawk1.atk + 1 && g4.shifts.w === 2);
  ok("family helpers agree", familyOf(hawk4) === "shadow" && shadowRifts(2) === 1 && shadowRifts(6) === 3 && shadowAtk(3) === 0 && crownHp(4) === 1 && crownWallSoak(6) === 2);

  // a banked rift keeps the turn exactly once
  const armed = reduce(g4, shiftCommand("w")).state;
  ok("arming a rift spends it without ending the turn", armed.shifts.w === 1 && armed.shiftArmed === "w" && armed.turn === "w");
  const afterMove = reduce(armed, moveCommand(legalMoves(armed)[0])).state;
  ok("the rifted move keeps the turn — exactly once", afterMove.turn === "w" && afterMove.shiftArmed === null);
  ok("rifts survive the codec", decodeState(encodeState(armed)).shifts.w === 1 && decodeState(encodeState(armed)).shiftArmed === "w");

  // crown ladder: 4 crowns → +1 max HP each; the wall soaks 1 while flanked
  const cr4 = { back: ["G", "U", "I", "J", "K", "B", "N", "R"].map(spec), pawn: spec("P") };
  const cg = createGame(cr4, a8, { map: classic, rules: "hp" });
  const guard4 = cg.board[idx(0, 0, 8)];
  const cr1 = { back: ["G", "N", "B", "Q", "K", "B", "N", "R"].map(spec), pawn: spec("P") };
  const guard1 = createGame(cr1, a8, { map: classic, rules: "hp" }).board[idx(0, 0, 8)];
  ok("crown ladder: 4 crowns → +1 max HP each", guard4.maxHp === guard1.maxHp + 1);
  const st0 = { ...cg, board: cg.board.slice(), turn: "b" };
  const bq = { id: 999, kind: "Q", color: "b", level: 1, abilities: [], shield: 0, used: {}, hasMoved: true, maxHp: 7, hp: 7, atk: 4 };
  st0.board[idx(0, 1, 8)] = null; st0.board[idx(1, 1, 8)] = null;
  st0.board[idx(0, 2, 8)] = bq;
  const strike = legalMoves(st0).find((m) => m.from === idx(0, 2, 8) && m.to === idx(0, 0, 8));
  const hitG = reduce(st0, moveCommand(strike)).state.board[idx(0, 0, 8)];
  ok("living shield wall: flanked crown soaks 1 (4 atk → 3 dmg)", hitG && hitG.maxHp - hitG.hp === 3);
  const stL = { ...createGame(cr1, a8, { map: classic, rules: "hp" }) };
  stL.board = stL.board.slice(); stL.turn = "b";
  stL.board[idx(0, 1, 8)] = null; stL.board[idx(0, 2, 8)] = { ...bq };
  const strikeL = legalMoves(stL).find((m) => m.from === idx(0, 2, 8) && m.to === idx(0, 0, 8));
  const lone = reduce(stL, moveCommand(strikeL)).state.board[idx(0, 0, 8)];
  ok("no wall for the lone crown piece: full damage", lone && lone.maxHp - lone.hp === 4);

  // boss auras bend the whole match
  const withBoss = (bid) => {
    const back = ["R", "N", "B", "Q", "K", "B", "N", "R"].map(spec);
    back[3] = { ...bossSpec(bossById(bid)) };
    return createGame({ back, pawn: spec("P") }, a8, { map: classic, rules: "hp" });
  };
  const disc = withBoss("b25"); // courtHp 1
  ok("courtHp aura: the League Master grants his court +1 HP", disc.board[idx(4, 0, 8)].maxHp === 11); // king 10 → 11
  const iron = withBoss("b14"); // grant bulwark
  ok("grant aura: the Colossus makes his court bulwarks", iron.board[idx(0, 0, 8)].abilities.includes("bulwark"));
  const judge = withBoss("b12"); // noEnemyPotions
  const js = { ...judge, potions: { w: 0, b: 1 }, turn: "b", board: judge.board.slice() };
  const hurtIx = js.board.findIndex((p) => p && p.color === "b" && p.kind === "P");
  js.board[hurtIx] = { ...js.board[hurtIx], hp: 1 };
  ok("noEnemyPotions aura: the Judge forbids hostile draughts", reduce(js, potCmd("b", hurtIx)).state === js);
}

// ── v0.25.0: ONE SPELL PER GAME — the single-cast law ────────────────────────
{
  const g = createGame(a8, a8, { map: classic, rules: "hp", seed: 5 });
  ok("energy is gone: no piece carries a well", g.board.filter(Boolean).every((p) => p.maxEn == null && p.en == null && p.enRegen == null));
  ok("hp pieces still carry blood and blade", g.board.filter(Boolean).every((p) => p.kind === "D+" || (p.maxHp > 0 && p.atk != null)));
  const { hasAbility } = await import("./src/core/index.js");
  // a pawn learns TWO talents; a clear lane left, a clear square right
  const pawns = g.board.map((p, j) => (p && p.kind === "P" && p.color === "w" ? j : -1)).filter((j) => j >= 2);
  const pi = pawns[3];
  g.board[pi].abilities = ["ranged_shot", "pawn_sidestep"]; g.board[pi].used = {};
  g.board[pi - 1] = null; // firing lane ...
  g.board[pi - 2] = { kind: "P", color: "b", level: 1, abilities: [], used: {}, shield: 0,
    hp: 2, maxHp: 2, atk: 1 }; // ... target at range 2
  g.board[pi + 1] = null;      // room for the sidestep too
  ok("a fresh book offers every talent", hasAbility(g.board[pi], "ranged_shot") && hasAbility(g.board[pi], "pawn_sidestep"));
  const shots = legalMovesFrom(g, pi).filter((m) => m.consumes === "ranged_shot");
  ok("the shot is offered while the book is open", shots.length > 0);
  const side0 = legalMovesFrom(g, pi).filter((m) => m.consumes === "pawn_sidestep");
  ok("the sidestep is offered alongside it", side0.length > 0);
  if (shots.length) {
    const after = applyMove(g, shots[0]);
    const st2 = after.state ?? after;
    const si = st2.board.findIndex((p) => p && p.kind === "P" && p.color === "w" && p.used && p.used.ranged_shot);
    const shooter = st2.board[si];
    ok("the use is written into the ledger", !!shooter);
    ok("one cast closes the WHOLE book (other talent too)", !hasAbility(shooter, "pawn_sidestep") && !hasAbility(shooter, "ranged_shot"));
    ok("no second shot is offered", legalMovesFrom(st2, si).filter((m) => m.consumes === "ranged_shot").length === 0);
    ok("no sidestep either — spent is spent", legalMovesFrom(st2, si).filter((m) => m.consumes === "pawn_sidestep").length === 0);
    // ANOTHER piece with a talent keeps its own open book
    const oj = st2.board.findIndex((p, j) => p && p.kind === "P" && p.color === "w" && j !== si);
    st2.board[oj].abilities = ["pawn_sidestep"]; st2.board[oj].used = {};
    ok("a sibling piece still holds its spell", hasAbility(st2.board[oj], "pawn_sidestep"));
  }
}

{ // the ledger SURVIVES the game's cloning stream — spent stays spent
  const g = createGame(a8, a8, { map: classic, rules: "hp", seed: 9 });
  const pawns = g.board.map((p, j) => (p && p.kind === "P" && p.color === "w" ? j : -1)).filter((j) => j >= 2);
  const pi = pawns[3];
  g.board[pi].abilities = ["ranged_shot"]; g.board[pi].used = {};
  g.board[pi - 1] = null;
  g.board[pi - 2] = { kind: "P", color: "b", level: 1, abilities: [], used: {}, shield: 0, hp: 2, maxHp: 2, atk: 1 };
  const shot = legalMovesFrom(g, pi).find((m) => m.consumes === "ranged_shot");
  const s1r = applyMove(g, shot); const s1 = s1r.state ?? s1r;
  const s2r = applyMove(s1, legalMoves(s1)[0]); const s2 = s2r.state ?? s2r; // black replies
  const shooter = s2.board.find((p) => p && p.kind === "P" && p.color === "w" && p.used && p.used.ranged_shot);
  ok("two plies later the ledger still reads: spent", !!shooter);
  const { hasAbility } = await import("./src/core/index.js");
  ok("and the book stays closed", shooter && !hasAbility(shooter, "ranged_shot"));
  // a FRESH battle reopens every book
  const g2 = createGame(a8, a8, { map: classic, rules: "hp", seed: 11 });
  ok("a new game deals fresh pages", g2.board.filter(Boolean).every((p) => !p.used || Object.keys(p.used).length === 0));
}


// ── ONE SPELL PER GAME: the book closes after a single cast ──────────────────
{
  const g = createGame(a8, a8, { map: classic, rules: "hp", seed: 7 });
  const from = idx(1, 1, 8);
  g.board[from].abilities = ["pawn_sidestep", "pawn_backstep"];
  g.board[idx(0, 1, 8)] = null;             // clear a2 → sidestep is offered
  g.board[idx(1, 0, 8)] = null;             // clear b1 → backstep is offered too
  const offers = legalMovesFrom(g, from);
  ok("two castable talents offer two special moves", offers.filter((m) => m.consumes).length === 2);
  const side = offers.find((m) => m.consumes === "pawn_sidestep");
  const r1 = applyMove(g, side); const s1 = r1.state ?? r1;
  const cast = s1.board[idx(0, 1, 8)];
  /* v1.28.0: das Buch zaehlt jetzt Einsaetze (Stufen), statt nur "benutzt" zu vermerken */
  ok("the cast is written into the book", cast && cast.used && cast.used.pawn_sidestep === 1);
  const r2 = applyMove(s1, legalMoves(s1)[0]); const s2 = r2.state ?? r2; // black replies
  const after = legalMovesFrom(s2, idx(0, 1, 8));
  ok("after ONE cast every further talent is sealed", after.every((m) => !m.consumes));
  ok("plain chess moves remain", after.length > 0);
}

// ── Stillstand: 60 Zuege ohne Schaden enden remis ────────────────────────────
{
  const g = createGame(a8, a8, { map: classic, rules: "hp", seed: 3 });
  ok("the standstill counter starts at zero", g.ohneSchaden === 0);
  const still = legalMoves(g).find((m) => !g.board[m.to]);
  const s1 = applyMove(g, still);
  ok("a harmless move raises the counter", s1.ohneSchaden === 1);
  const s2 = applyMove(s1, legalMoves(s1).find((m) => !s1.board[m.to]));
  ok("the counter keeps rising", s2.ohneSchaden === 2);
  ok("HP_REMIS_HALBZUEGE is 120 halfmoves = 60 moves", HP_REMIS_HALBZUEGE === 120);
  ok("shortly before the limit the game runs on", !status({ ...s2, ohneSchaden: HP_REMIS_HALBZUEGE - 1 }).over);
  const ende = status({ ...s2, ohneSchaden: HP_REMIS_HALBZUEGE });
  ok("at the limit the match is a draw", ende.over && ende.result === "draw" && ende.winner === null);
  ok("the draw names its reason", ende.grund === "ohneSchaden");
  const c = createGame(a8, a8, { map: classic, rules: "chess", seed: 3 });
  ok("plain chess ignores the standstill rule", !status({ ...c, ohneSchaden: 999 }).over);
  const roundtrip = decodeState(encodeState({ ...s2, ohneSchaden: 47 }));
  ok("the counter survives save and load", roundtrip.ohneSchaden === 47);
}

// ── every blow resets the standstill counter ─────────────────────────────────
{
  const brett = new Array(64).fill(null);
  brett[idx(0, 0, 8)] = W("Q", { hp: 7, maxHp: 7, atk: 4 });
  brett[idx(0, 1, 8)] = B("R", { hp: 5, maxHp: 5, atk: 3 });
  brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  const vor = { ...hpState(brett), ohneSchaden: 100 };
  const schlag = legalMoves(vor).find((m) => m.from === idx(0, 0, 8) && m.to === idx(0, 1, 8));
  const nach = reduce(vor, moveCommand(schlag)).state;
  ok("a wound resets the standstill counter", nach.ohneSchaden === 0);
  const ruhig = legalMoves(vor).find((m) => !vor.board[m.to]);
  ok("a move that draws no blood does not reset it", reduce(vor, moveCommand(ruhig)).state.ohneSchaden === 101);
}

// ── DER FERNSCHUSS IST EINE HP-KUNST (v1.0.23, Besitzer) ─────────────────────
// Dieser Block bezeugte bis heute das GEGENTEIL: "das Talent bietet im Schach
// einen Schuss an", und das Ziel FIEL - drei Felder weit, ohne dass eine
// Deckung half. Genau die Sorge des Besitzers (Matt aus der Ferne) war also
// einmal gebauter Bestand. Seit v1.0.20 leert der Heeresbau die Listen im
// Schach; der zweite Riegel sperrt den Schuss nun auch in der Zugerzeugung.
{
  const brett = new Array(64).fill(null);
  const schuetze = W("B"); schuetze.abilities = ["ranged_shot"];
  brett[idx(0, 0, 8)] = schuetze;
  brett[idx(0, 3, 8)] = B("R");
  brett[idx(7, 7, 8)] = B("K");
  brett[idx(7, 0, 8)] = W("K");
  const st = { board: brett, w: 8, h: 8, holes: new Set(), rules: "chess", turn: "w",
    captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 };
  ok("im Schach wird KEIN Schuss angeboten - selbst einer verseuchten Figur nicht",
    !legalMoves(st).some((m) => m.special === "shot"));
}
// Die Wirkung des Schusses lebt im HP-Gefecht weiter - derselbe Aufbau dort:
{
  const brett = new Array(64).fill(null);
  const schuetze = W("B", { hp: 5, maxHp: 5, atk: 6 }); schuetze.abilities = ["ranged_shot"];
  brett[idx(0, 0, 8)] = schuetze;
  brett[idx(0, 3, 8)] = B("R", { hp: 3, maxHp: 3, atk: 1 });   // halbe Wucht aus der Ferne: ceil(6/2)=3 - toedlich
  brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(brett);
  const schuss = legalMoves(st).find((m) => m.special === "shot" && m.to === idx(0, 3, 8));
  ok("im HP-Gefecht steht derselbe Schuss bereit", !!schuss);
  const nach = reduce(st, moveCommand(schuss)).state;
  ok("das Ziel faellt", nach.board[idx(0, 3, 8)] === null);
  ok("der Schuetze bleibt stehen", nach.board[idx(0, 0, 8)] && nach.board[idx(0, 0, 8)].kind === "B");
  ok("der Schlag zaehlt als Schlag", nach.captured.w.includes("R"));
}

// ── Fernangriff reicht 2-3 Felder (v0.79) ────────────────────────────────────
{
  const brett = new Array(64).fill(null);
  const sch = W("R", { hp: 5, maxHp: 5, atk: 3 }); sch.abilities = ["ranged_shot"];   /* v1.37.0: Dauerfeuer ist fort - der Scharfschuss schiesst */
  brett[idx(0, 0, 8)] = sch;
  brett[idx(0, 2, 8)] = B("P", { hp: 2, maxHp: 2, atk: 1 });   // Distanz 2
  brett[idx(1, 0, 8)] = B("N", { hp: 3, maxHp: 3, atk: 2 });   // Distanz 1
  brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(brett);
  const schuesse = legalMoves(st).filter((m) => m.special === "shot" && m.from === idx(0, 0, 8));
  ok("Distanz 2 ist schiessbar", schuesse.some((m) => m.to === idx(0, 2, 8)));
  ok("Distanz 1 ist NICHT schiessbar (dafuer gibt es die Klinge)", !schuesse.some((m) => m.to === idx(1, 0, 8)));
  const weit = new Array(64).fill(null);
  const sch2 = W("R", { hp: 5, maxHp: 5, atk: 3 }); sch2.abilities = ["ranged_volley"];
  weit[idx(0, 0, 8)] = sch2;
  weit[idx(0, 4, 8)] = B("P", { hp: 2, maxHp: 2, atk: 1 });    // Distanz 4
  weit[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  weit[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  ok("Distanz 4 liegt ausser Reichweite",
    !legalMoves(hpState(weit)).some((m) => m.special === "shot" && m.to === idx(0, 4, 8)));
}

// ── Schockwelle: der erste Nahkampfschlag trifft die Runde - halb (v0.79) ────
{
  const brett = new Array(64).fill(null);
  const q = W("Q", { hp: 7, maxHp: 7, atk: 4 }); q.abilities = ["blast"];
  brett[idx(1, 0, 8)] = q;
  brett[idx(1, 1, 8)] = B("R", { hp: 5, maxHp: 5, atk: 3 });   // das Ziel
  brett[idx(0, 1, 8)] = B("P", { hp: 2, maxHp: 2, atk: 1 });   // neben dem Ziel -> Welle toetet (2 Schaden)
  brett[idx(2, 2, 8)] = B("N", { hp: 3, maxHp: 3, atk: 2 });   // diagonal am Ziel -> Welle verwundet
  brett[idx(0, 0, 8)] = W("P", { hp: 2, maxHp: 2, atk: 1 });   // EIGENER Mann daneben -> unberuehrt
  brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(brett);
  const schlag = legalMoves(st).find((m) => m.from === idx(1, 0, 8) && m.to === idx(1, 1, 8));
  const r = reduce(st, moveCommand(schlag));
  const nb = r.state.board;
  ok("das Ziel traegt den vollen Schlag", nb[idx(1, 1, 8)].hp === 1);
  ok("die Welle trifft den Nachbarn mit halber Kraft toedlich", nb[idx(0, 1, 8)] === null);
  ok("die Welle verwundet auch diagonal", nb[idx(2, 2, 8)].hp === 1);
  ok("der eigene Mann bleibt heil", nb[idx(0, 0, 8)] && nb[idx(0, 0, 8)].hp === 2);
  ok("der Wellentote steht im Beutebuch", r.state.captured.w.includes("P"));
  ok("die Welle ist verbraucht", nb[idx(1, 0, 8)].used.blast === 1);   /* v1.28.0: gezaehlt */
  ok("der Zug meldet die Welle", Array.isArray(r.state.welle) && r.state.welle.length === 2);
  // zweiter Schlag: keine Welle mehr
  const zwei = r.state;
  const antwort = legalMoves(zwei).find((m) => !zwei.board[m.to]);
  const s2 = applyMove(zwei, antwort);
  const wieder = legalMoves(s2).find((m) => m.from === idx(1, 0, 8) && m.to === idx(1, 1, 8));
  const r2 = reduce(s2, moveCommand(wieder));
  ok("die zweite Welle bleibt aus", !r2.state.welle && r2.state.board[idx(2, 2, 8)].hp === 1);
}

// ── Schockwelle traegt sich NICHT auf den Fernschuss ─────────────────────────
{
  const brett = new Array(64).fill(null);
  const b1 = W("B", { hp: 3, maxHp: 3, atk: 2 }); b1.abilities = ["blast", "ranged_shot"];   /* v1.37.0: Dauerfeuer ist fort */
  brett[idx(0, 0, 8)] = b1;
  brett[idx(0, 2, 8)] = B("R", { hp: 5, maxHp: 5, atk: 3 });
  brett[idx(1, 2, 8)] = B("P", { hp: 2, maxHp: 2, atk: 1 });
  brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
  brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  const st = hpState(brett);
  const schuss = legalMoves(st).find((m) => m.special === "shot" && m.to === idx(0, 2, 8));
  const r = reduce(st, moveCommand(schuss));
  ok("ein Schuss aus der Ferne traegt keine Welle",
    !r.state.welle && r.state.board[idx(1, 2, 8)].hp === 2 && r.state.board[idx(0, 0, 8)].used.blast !== true);
}

console.log("\n== DIE BUENDE WIRKEN IM GEFECHT (v1.10.1) ==");
{
  const { createGame: cg2, applyMove: am2 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm2 } = await import("./src/core/sim/transitions.js");
  const { buildArmyFromFormation: ba2, defaultFormation: df2 } = await import("./src/meta/index.js");
  const { mapById: mb2 } = await import("./src/content/index.js");
  const w2 = 8;
  const fig2 = (kind, id, c, hp, atk) =>
    ({ kind, charId: id, color: c, hp, maxHp: hp, atk, abilities: [], level: 10, shield: 0 });
  const stellung = (buende) => {
    const ar = () => ba2(() => 10, df2(mb2("classic")));
    const g = cg2(ar(), ar(), { rules: "hp", map: mb2("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    return g;
  };

  /* DER PALADIN NIMMT DEN TREFFER - das ist die Probe, die zaehlt: nicht ob
     die Funktion true sagt, sondern ob im GEFECHT der Koenig unverletzt
     bleibt und der Paladin blutet. */
  {
    const g = stellung(["krone"]);
    g.board[3 * w2 + 4] = fig2("K", "king", "w", 20, 5);
    g.board[3 * w2 + 5] = fig2("U", "paladin", "w", 18, 6);
    g.board[4 * w2 + 4] = fig2("R", "rook", "b", 12, 7);
    g.board[0] = fig2("K", "king", "b", 20, 5);
    g.turn = "b";
    const z = lm2(g, 4 * w2 + 4).find((m3) => m3.to === 3 * w2 + 4);
    const n = am2(g, z);
    ok("der Koenig bleibt unverletzt, wenn der Paladin daneben steht",
      n.board[3 * w2 + 4] && n.board[3 * w2 + 4].hp === 20);
    ok("und der Paladin traegt den Schaden", n.board[3 * w2 + 5].hp < 18);
  }

  /* OHNE BUND trifft es den Koenig - sonst waere die Probe oben wertlos. */
  {
    const g = stellung([]);
    g.board[3 * w2 + 4] = fig2("K", "king", "w", 20, 5);
    g.board[3 * w2 + 5] = fig2("U", "paladin", "w", 18, 6);
    g.board[4 * w2 + 4] = fig2("R", "rook", "b", 12, 7);
    g.board[0] = fig2("K", "king", "b", 20, 5);
    g.turn = "b";
    const z = lm2(g, 4 * w2 + 4).find((m3) => m3.to === 3 * w2 + 4);
    const n = am2(g, z);
    ok("ohne erwachten Bund trifft es den Koenig selbst",
      n.board[3 * w2 + 4].hp < 20 && n.board[3 * w2 + 5].hp === 18);
  }
}

console.log("\n== GEZEITEN: der Kapitaen zieht durch (v1.10.2) ==");
{
  const { createGame: cg3 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm3 } = await import("./src/core/sim/transitions.js");
  const { buildArmyFromFormation: ba3, defaultFormation: df3 } = await import("./src/meta/index.js");
  const { mapById: mb3 } = await import("./src/content/index.js");
  const w3 = 8;
  const stell = (buende) => {
    const ar = () => ba3(() => 10, df3(mb3("classic")));
    const g = cg3(ar(), ar(), { rules: "hp", map: mb3("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    const f = (k, id, c, hp) => ({ kind: k, charId: id, color: c, hp, maxHp: hp, atk: 6, abilities: [], level: 10, shield: 0 });
    g.board[0] = f("R", "captain", "w", 14);      // zieht wie ein Turm
    g.board[3] = f("P", "pawn", "w", 8);          // EIGENE Figur im Weg
    g.board[6] = f("N", "knight", "b", 9);        // Gegner dahinter
    g.board[7 * w3 + 7] = f("K", "king", "b", 20);
    g.board[7 * w3 + 0] = f("K", "king", "w", 20);
    g.board[5 * w3 + 5] = f("S", "strategist", "w", 12);
    g.turn = "w";
    return g;
  };
  const spalten = (g) => lm3(g, 0).filter((m) => Math.floor(m.to / w3) === 0).map((m) => m.to % w3).sort((a, b) => a - b);

  /* Ohne Bund endet der Kapitaen VOR der eigenen Figur - so gleitet jede
     Figur im Schach. */
  ok("ohne Bund endet der Kapitaen vor der eigenen Figur",
    spalten(stell([])).join(",") === "1,2");
  /* Mit Gezeiten zieht er durch die EIGENEN hindurch - aber nicht durch
     Gegner. Besitzerentscheid nach dem ersten Bau: "Ich faende auch ok, dass
     der Kapitaen nur seine eigenen umschiffen kann und nicht Gegner, dann ist
     es auch nicht ganz so stark."

     Beides stimmt: es ist schwaecher (ein Kapitaen, der durch feindliche
     Linien gleitet, waere kaum aufzuhalten) und schluessiger (ein Lotse kennt
     die eigene Flotte, fremde Schiffe stehen ihm im Weg wie jedem anderen). */
  const mit = spalten(stell(["gezeiten"]));
  ok(`mit Gezeiten zieht er durch die eigene Figur (${mit.join(",")})`,
    mit.includes(4) && mit.includes(5));
  ok("und schlaegt den Gegner dahinter", mit.includes(6));
  ok("aber HINTER dem Gegner ist Schluss - er ist kein Geist", !mit.includes(7));
}

console.log("\n== DIE BUENDE UEBERLEBEN JEDEN ZUG (v1.10.3) ==");
{
  const { createGame: cg4, applyMove: am4 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm4 } = await import("./src/core/sim/transitions.js");
  const { buildArmyFromFormation: ba4, defaultFormation: df4 } = await import("./src/meta/index.js");
  const { mapById: mb4 } = await import("./src/content/index.js");
  const w4 = 8;
  const stell = (buende) => {
    const ar = () => ba4(() => 10, df4(mb4("classic")));
    const g = cg4(ar(), ar(), { rules: "hp", map: mb4("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    const f = (k, id, c, hp, max) => ({ kind: k, charId: id, color: c, hp, maxHp: max || hp, atk: 6, abilities: [], level: 10, shield: 0 });
    g.board[3 * w4 + 3] = f("L", "alchemist", "w", 12);
    g.board[3 * w4 + 4] = f("R", "rook", "w", 5, 12);   // verwundet, daneben
    g.board[0] = f("N", "knight", "w", 9);
    g.board[7 * w4 + 7] = f("K", "king", "b", 20);
    g.board[7 * w4 + 0] = f("K", "king", "w", 20);
    g.turn = "w";
    return g;
  };

  /* DIESE PROBE HAT EINEN FEHLER MIT REICHWEITE GEFUNDEN: cloneState kopierte
     das Feld `buende` nicht mit. Nach dem ERSTEN Zug war es undefined, und
     jede Bundregel prallte an einer leeren Liste ab. Die Wirkung war also in
     Einzeltests da und im Spiel weg - der unangenehmste Fehlertyp. */
  {
    const g = stell(["nachtwache"]);
    const n = am4(g, lm4(g, 0)[0]);
    ok("die Buende stehen auch nach einem Zug noch im Spielstand",
      Array.isArray(n.buende) && n.buende.includes("nachtwache"));
    ok("der Alchemist heilt den verwundeten Nachbarn", n.board[3 * w4 + 4].hp === 6);
  }
  /* Gegenprobe: ohne Bund bleibt der Turm verwundet. */
  {
    const g = stell([]);
    const n = am4(g, lm4(g, 0)[0]);
    ok("ohne Bund heilt niemand", n.board[3 * w4 + 4].hp === 5);
  }
}

console.log("\n== FAEHRTE UND SCHATTEN (v1.10.6) ==");
{
  const { createGame: cg5, applyMove: am5 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm5 } = await import("./src/core/sim/transitions.js");
  const { buildArmyFromFormation: ba5, defaultFormation: df5 } = await import("./src/meta/index.js");
  const { mapById: mb5 } = await import("./src/content/index.js");
  const { evaluate: ev5 } = await import("./src/ai/evaluate.js");
  const w5 = 8;
  const f5 = (k, id, c, hp) => ({ kind: k, charId: id, color: c, hp, maxHp: hp, atk: 6, abilities: [], level: 10, shield: 0 });
  const leer = (buende) => {
    const ar = () => ba5(() => 10, df5(mb5("classic")));
    const g = cg5(ar(), ar(), { rules: "hp", map: mb5("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[7 * w5 + 7] = f5("K", "king", "b", 20);
    g.board[7 * w5 + 0] = f5("K", "king", "w", 20);
    return g;
  };

  /* FAEHRTE: der Partner rueckt in DIESELBE Richtung nach - die beiden
     folgen einer Spur, sie laufen nicht auseinander. */
  {
    const bau = (buende) => {
      const g = leer(buende);
      g.board[2 * w5 + 2] = f5("H", "hawk", "w", 9);
      g.board[5 * w5 + 5] = f5("P", "pathfinder", "w", 9);
      g.turn = "w";
      return g;
    };
    const g1 = bau([]);
    const n1 = am5(g1, lm5(g1, 2 * w5 + 2).find((m2) => m2.to === 3 * w5 + 3));
    ok("ohne Bund bleibt der Kundschafter stehen",
      n1.board.findIndex((p) => p && p.charId === "pathfinder") === 5 * w5 + 5);
    const g2 = bau(["faehrte"]);
    const n2 = am5(g2, lm5(g2, 2 * w5 + 2).find((m2) => m2.to === 3 * w5 + 3));
    ok("mit Faehrte rueckt er in dieselbe Richtung nach",
      n2.board.findIndex((p) => p && p.charId === "pathfinder") === 6 * w5 + 6);
  }

  /* SCHATTEN: "unsichtbar" muss fuer die KI gelten, nicht nur fuer die
     Anzeige - sonst waere es ein Trick, der allein den Menschen taeuscht. */
  {
    const bau = (buende, lastMove = null) => {
      const g = leer(buende);
      g.board[2 * w5 + 2] = f5("A", "assassin", "w", 9);
      g.board[5 * w5 + 5] = f5("W", "sorceress", "w", 9);
      g.lastMove = lastMove;
      return g;
    };
    const ohne = ev5(bau([]), "w");
    const mit = ev5(bau(["schatten"]), "w");
    ok(`die KI rechnet den verborgenen Attentaeter nicht ein (${ohne} -> ${mit})`, mit < ohne);
    /* und sie sieht ihn wieder, sobald die Hexerin gezogen hat */
    const verraten = ev5(bau(["schatten"], { color: "w", charId: "sorceress", from: 0, to: 1 }), "w");
    ok("sobald die Hexerin zieht, zaehlt er wieder", verraten === ohne);
  }
}

console.log("\n== BANNKREIS, KONZIL, GELEIT (v1.10.8) ==");
{
  const { createGame: cg6, applyMove: am6 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm6 } = await import("./src/core/sim/transitions.js");
  const { talentWirkt: tw6 } = await import("./src/core/rules/moves.js");
  const { geleitTauschbar: gt6 } = await import("./src/core/rules/buende.js");
  const { buildArmyFromFormation: ba6, defaultFormation: df6 } = await import("./src/meta/index.js");
  const { mapById: mb6 } = await import("./src/content/index.js");
  const w6 = 8;
  const f6 = (k, id, c, hp) => ({ kind: k, charId: id, color: c, hp, maxHp: hp, atk: 7, abilities: [], level: 10, shield: 0 });
  const leer6 = (buende) => {
    const ar = () => ba6(() => 10, df6(mb6("classic")));
    const g = cg6(ar(), ar(), { rules: "hp", map: mb6("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    return g;
  };

  /* BANNKREIS: der Ort entscheidet. talentWirkt() nimmt dafuer jetzt
     Spielstand und Feld entgegen - beide freiwillig, damit alle bestehenden
     Aufrufe gueltig bleiben. */
  {
    const b = new Array(64).fill(null);
    b[4 * w6 + 4] = f6("Y", "seeress", "b", 9);
    const st = { board: b, w: w6, h: 8, buende: ["bannkreis"] };
    ok("im Bannkreis schweigt ein Talent", !tw6("bulwark", "hp", st, 6 * w6 + 4, "w"));
    ok("drei Felder weiter wirkt es", tw6("bulwark", "hp", st, 7 * w6 + 4, "w"));
    ok("der alte Aufruf ohne Ort bleibt gueltig", tw6("bulwark", "hp"));
    ok("und Lebenstalente schweigen weiter in Klassik", !tw6("lifesteal", "chess"));
  }

  /* KONZIL: wirkt AUTOMATISCH beim ersten toedlichen Treffer, nicht auf
     Knopfdruck. Ein Bund, den man selbst ausloesen muss, braucht eine
     Bedienung - und wer sie vergisst, verliert. Der Rat faellt dem Koenig in
     den Arm, wenn es noetig ist. */
  {
    const bau = (buende) => {
      const g = leer6(buende);
      g.board[3 * w6 + 4] = f6("K", "king", "w", 20);
      g.board[0] = f6("E", "archbishop", "w", 15);
      g.board[1] = f6("Z", "chancellor", "w", 15);
      g.board[2] = f6("Q", "queen", "w", 15);
      g.board[4 * w6 + 4] = f6("R", "rook", "b", 12);
      g.board[7 * w6 + 7] = f6("K", "king", "b", 20);
      g.turn = "b";
      return g;
    };
    const ohne = am6(bau([]), lm6(bau([]), 4 * w6 + 4).find((m2) => m2.to === 3 * w6 + 4));
    ok("ohne Bund trifft der Schlag den Koenig", ohne.board[3 * w6 + 4].hp < 20);
    const g = bau(["konzil"]);
    const mit = am6(g, lm6(g, 4 * w6 + 4).find((m2) => m2.to === 3 * w6 + 4));
    ok("das Konzil lehnt den Schlag ab", mit.board[3 * w6 + 4].hp === 20);
    ok("und ist danach verbraucht", mit.konzilVerbraucht && mit.konzilVerbraucht.w === true);
  }

  /* GELEIT: hier ist ein Knopf richtig - der Tausch ist ein ZUG, kein
     Ereignis. Der Spieler waehlt, wann und welche zwei. */
  {
    const g = leer6(["geleit"]);
    g.board[10] = f6("N", "knight", "w", 12);
    g.board[20] = f6("B", "bishop", "w", 12);
    g.board[30] = f6("R", "rook", "w", 12);
    ok("mit allen dreien ist der Tausch offen", (gt6(g, "w") || []).length === 3);
    g.board[30] = null;
    ok("ohne den Turm nicht mehr", gt6(g, "w") === null);
    g.board[30] = f6("R", "rook", "w", 12);
    g.geleitVerbraucht = { w: true };
    ok("und nach dem Tausch ist Schluss", gt6(g, "w") === null);
  }
}

console.log("\n== STURM UND GELEIT (v1.11.2) ==");
{
  const { createGame: cg7, applyMove: am7, reduce: rd7 } = await import("./src/core/index.js");
  const { legalMovesFrom: lm7 } = await import("./src/core/sim/transitions.js");
  const { geleitCommand: gc7 } = await import("./src/core/sim/commands.js");
  const { buildArmyFromFormation: ba7, defaultFormation: df7 } = await import("./src/meta/index.js");
  const { mapById: mb7 } = await import("./src/content/index.js");
  const w7 = 8;
  const f7 = (k, id, c, hp, atk) => ({ kind: k, charId: id, color: c, hp, maxHp: hp, atk, abilities: [], level: 10, shield: 0 });
  const leer7 = (buende) => {
    const ar = () => ba7(() => 10, df7(mb7("classic")));
    const g = cg7(ar(), ar(), { rules: "hp", map: mb7("classic"), buende });
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[7 * w7 + 7] = f7("K", "king", "b", 20, 5);
    g.board[7 * w7 + 0] = f7("K", "king", "w", 20, 5);
    return g;
  };

  /* STURM: EIN BAUER MACHT IHR PLATZ (Besitzeridee). Mein erster Entwurf
     liess sie fallen, wenn ihr Startfeld besetzt war - das hing aber vom
     Zufall ab: dort steht zu Partiebeginn oft eine eigene Figur. Eine Regel,
     die man nicht steuern kann, ist keine Regel, sondern Glueck.

     Jetzt hat der Rueckruf einen Preis, den man kennt: der hinterste eigene
     Bauer faellt, und sie nimmt seinen Platz. */
  {
    const bau = (mitBauern) => {
      const g = leer7(["sturm"]);
      g.board[4 * w7 + 4] = f7("M", "amazon", "w", 3, 14);
      g.board[5 * w7 + 5] = f7("V", "warlock", "w", 12, 8);
      if (mitBauern) { g.board[1 * w7 + 2] = f7("P", "pawn", "w", 8, 3); g.board[5 * w7 + 1] = f7("P", "pawn", "w", 8, 3); }
      g.board[4 * w7 + 5] = f7("R", "rook", "b", 12, 20);
      g.turn = "b";
      return g;
    };
    const schlag = (g) => am7(g, lm7(g, 4 * w7 + 5).find((m2) => m2.to === 4 * w7 + 4));
    const mit = schlag(bau(true));
    const wo = mit.board.findIndex((p) => p && p.charId === "amazon");
    ok(`sie kehrt auf das Feld des hintersten Bauern zurueck (${wo})`, wo === 1 * w7 + 2);
    ok("und dieser Bauer faellt dafuer",
      mit.board.filter((p) => p && p.kind === "P" && p.color === "w").length === 1);
    ok("mit halber Kraft, nicht voll geheilt", mit.board[wo].hp < mit.board[wo].maxHp);
    /* OHNE BAUERN FAELLT SIE - ein klarer, verstehbarer Grund. */
    const ohne = schlag(bau(false));
    ok("ohne Bauern faellt sie", ohne.board.findIndex((p) => p && p.charId === "amazon") < 0);
  }

  /* GELEIT: ein eigener BEFEHL, kein Zug - es bewegt sich keine Figur auf ein
     Zielfeld, zwei tauschen. Der Spieler waehlt beide. */
  {
    const bau = () => {
      const g = leer7(["geleit"]);
      g.board[10] = f7("N", "knight", "w", 12, 6);
      g.board[20] = f7("B", "bishop", "w", 12, 6);
      g.board[30] = f7("R", "rook", "w", 12, 6);
      g.turn = "w";
      return g;
    };
    const r = rd7(bau(), gc7("w", 10, 30));
    ok("zwei der drei tauschen die Plaetze",
      r.state.board.findIndex((p) => p && p.charId === "knight") === 30
      && r.state.board.findIndex((p) => p && p.charId === "rook") === 10);
    ok("der Tausch verbraucht den Zug", r.state.turn === "b");
    const r2 = rd7(r.state, gc7("w", 10, 20));
    ok("ein zweiter Tausch wird abgelehnt",
      r2.state.board.findIndex((p) => p && p.charId === "knight") === 30);
    /* Wer den Befehl von aussen schickt, soll nichts erzwingen koennen, was
       die Anzeige nicht anbietet. */
    const fremd = rd7(bau(), gc7("w", 10, 7 * w7 + 0));
    ok("eine fremde Figur laesst sich nicht eintauschen",
      fremd.state.board.findIndex((p) => p && p.charId === "knight") === 10);
  }
}


// ── v1.30.0: DIE MONSTERFAEHIGKEITEN AM TREFFER - in echten Schlaegen ───────
{
  const { cloneState } = await import("./src/core/sim/transitions.js");
  const brettMit = (ziel, angreifer = { hp: 7, maxHp: 7, atk: 4 }, nachbar = null) => {
    const brett = new Array(64).fill(null);
    brett[idx(1, 0, 8)] = W("Q", angreifer);
    brett[idx(1, 1, 8)] = B("R", ziel);
    if (nachbar) brett[idx(0, 1, 8)] = B("R", nachbar);
    brett[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
    brett[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
    return hpState(brett);
  };
  const schlag = (st) => reduce(st, moveCommand(legalMoves(st).find((m) => m.from === idx(1, 0, 8) && m.to === idx(1, 1, 8)))).state;
  /* nach dem Schlag zieht Schwarz seinen Koenig, damit Weiss erneut schlagen kann */
  const warte = (st) => reduce(st, moveCommand(legalMoves(st).find((m) => m.from === idx(7, 7, 8)))).state;

  // Steinhaut
  let st = schlag(brettMit({ hp: 10, maxHp: 10, atk: 1, abilities: ["steinhaut"], stufen: { steinhaut: 1 } }));
  ok("Steinhaut I: der erste Treffer prallt ab", st.board[idx(1, 1, 8)].hp === 10);
  st = schlag(warte(st));
  ok("Steinhaut I: der zweite trifft", st.board[idx(1, 1, 8)].hp === 6);
  st = schlag(warte(schlag(brettMit({ hp: 10, maxHp: 10, atk: 1, abilities: ["steinhaut"], stufen: { steinhaut: 2 } }))));
  ok("Steinhaut II: zwei Treffer prallen ab", st.board[idx(1, 1, 8)].hp === 10);
  /* in Klassik gibt es keinen Schaden - dort schweigen alle vier (NUR_MIT_LEBEN) */
  const { NUR_MIT_LEBEN, talentWirkt } = await import("./src/core/rules/moves.js");
  ok("in Klassik schweigen alle vier",
    ["steinhaut", "widerhall", "unsterblich", "wegelagerei"].every((a) => NUR_MIT_LEBEN.has(a) && !talentWirkt(a, "chess") && talentWirkt(a, "hp")));

  // Widerhall
  st = schlag(brettMit({ hp: 10, maxHp: 10, atk: 1, abilities: ["widerhall"], stufen: { widerhall: 1 } }));
  ok("Widerhall I: ein Viertel kommt zurueck (4 -> 1)", st.board[idx(1, 0, 8)].hp === 6 && st.board[idx(1, 1, 8)].hp === 6);
  st = schlag(brettMit({ hp: 10, maxHp: 10, atk: 1, abilities: ["widerhall"], stufen: { widerhall: 2 } }));
  ok("Widerhall II: die Haelfte kommt zurueck (4 -> 2)", st.board[idx(1, 0, 8)].hp === 5);
  st = schlag(brettMit({ hp: 10, maxHp: 10, atk: 1, abilities: ["widerhall"], stufen: { widerhall: 2 } }, { hp: 2, maxHp: 7, atk: 4 }));
  ok("Widerhall kann den Angreifer faellen", st.board[idx(1, 0, 8)] === null && st.captured.b.includes("Q"));
  st = schlag(brettMit({ hp: 3, maxHp: 10, atk: 1, abilities: ["widerhall"], stufen: { widerhall: 2 } }, { hp: 1, maxHp: 7, atk: 4 }));
  ok("... auch mit dem Todesstoss: beide fallen", st.board[idx(1, 1, 8)] === null && st.board[idx(1, 0, 8)] === null);

  // Unsterblich
  st = schlag(brettMit({ hp: 3, maxHp: 12, atk: 1, abilities: ["unsterblich"], stufen: { unsterblich: 1 } }));
  ok("Unsterblich I: faellt und steht mit einem Viertel wieder auf (12 -> 3)",
    st.board[idx(1, 1, 8)] && st.board[idx(1, 1, 8)].hp === 3 && st.board[idx(1, 0, 8)] && !st.captured.w.includes("R"));
  st = schlag(warte(st));
  ok("... einmal je Partie: beim zweiten Mal faellt es", st.board[idx(1, 1, 8)] && st.board[idx(1, 1, 8)].kind === "Q");
  st = schlag(brettMit({ hp: 3, maxHp: 12, atk: 1, abilities: ["unsterblich"], stufen: { unsterblich: 2 } }));
  ok("Unsterblich II: mit der Haelfte (12 -> 6)", st.board[idx(1, 1, 8)].hp === 6);

  // Wegelagerei
  const raeuber = (stufe) => brettMit({ hp: 20, maxHp: 20, atk: 1 }, { hp: 7, maxHp: 7, atk: 4, abilities: ["wegelagerei"], stufen: { wegelagerei: stufe } });
  st = schlag(raeuber(2));
  ok("Wegelagerei II: 4 Gold je Treffer", st.beute && st.beute.w === 4);
  st = schlag(warte(st));
  ok("die Beute ueberlebt die folgenden Zuege und waechst (cloneState)", st.beute.w === 8);
  ok("... und eine Kopie des Zustands traegt sie mit", cloneState(st).beute.w === 8);
  ok("Wegelagerei III: 6 Gold", schlag(raeuber(3)).beute.w === 6);

  // Schockwelle trifft auf Steinhaut und Widerhall
  const wq = { hp: 7, maxHp: 7, atk: 4, abilities: ["blast"] };
  st = schlag(brettMit({ hp: 20, maxHp: 20, atk: 1 }, wq, { hp: 5, maxHp: 5, atk: 1, abilities: ["steinhaut"], stufen: { steinhaut: 1 } }));
  ok("die Welle prallt an Steinhaut ab", st.board[idx(0, 1, 8)].hp === 5);
  st = schlag(brettMit({ hp: 20, maxHp: 20, atk: 1 }, wq, { hp: 5, maxHp: 5, atk: 1, abilities: ["widerhall"], stufen: { widerhall: 2 } }));
  ok("die Welle loest Widerhall aus (Welle 2 -> 1 zurueck)", st.board[idx(1, 0, 8)].hp === 6);

  // Monster wachsen in ihre Faehigkeiten hinein
  const { monsterStufen } = await import("./src/meta/leveling.js");
  ok("Monsterstufen nur fuer monstereigene Faehigkeiten",
    JSON.stringify(monsterStufen(["steinhaut", "bulwark", "wegelagerei"], 3)) === '{"steinhaut":2,"wegelagerei":3}');

  // Gold nach der Partie
  const { applyResult } = await import("./src/meta/rewards.js");
  const { defaultProfile } = await import("./src/meta/profile.js");
  const pr = { ...defaultProfile(), gold: 10 };
  const basis = { result: "loss", captures: [], promotions: 0, charXpGains: {}, moveCount: 30 };
  const verlust = applyResult(pr, { ...basis, beute: -6 });
  const ohne = applyResult(pr, basis);
  ok("geraubtes Gold ist nach der Partie fort", verlust.profile.gold === ohne.profile.gold - 6 && verlust.gained.beute === -6);
  ok("nie unter null", applyResult({ ...pr, gold: 2 }, { ...basis, beute: -50 }).profile.gold >= 0);
  const aufg = applyResult(pr, { ...basis, beute: 8, resigned: true });
  ok("wer aufgibt, verliert die eigene Beute", aufg.gained.beute === 0);
}
/* v1.30.0: die Monsterfaehigkeiten sind am Brett SICHTBAR - der Kern setzt die
   Merker nur fuer den einen Zug (sonst stuende das Zeichen bei jedem weiteren
   Zug wieder da), und das Brett liest alle drei. */
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("das Brett zeigt Steinhaut, Aufstehen und Widerhall an",
    bv.includes("state.steinhaut != null") && bv.includes("state.aufstand != null") && bv.includes("state.widerhall && state.widerhall.at >= 0"));
  ok("die Animation dazu existiert", readFileSync("src/app/main.jsx", "utf8").includes("@keyframes ggZeichenSteigt"));
  const { cloneState: klon } = await import("./src/core/sim/transitions.js");
  const kopie = klon({ board: [], steinhaut: 3, aufstand: 4, widerhall: { at: 1, dmg: 2, tot: false }, captured: { w: [], b: [] } });
  ok("die Merker gelten nur fuer den einen Zug", kopie.steinhaut == null && kopie.aufstand == null && kopie.widerhall == null);
}

// ── v1.31.0: DIE FUENF UEBRIGEN MONSTERFAEHIGKEITEN - in echten Zuegen ───────
{
  const { legalMovesFrom } = await import("./src/core/sim/transitions.js");
  /* Weiss: Monster auf b1 greift den schwarzen Turm auf b2 an; Koenige in den Ecken */
  const brett = (angreifer, ziel = { hp: 10, maxHp: 10, atk: 1 }, extra = {}) => {
    const b = new Array(64).fill(null);
    b[idx(1, 0, 8)] = W("Q", { hp: 12, maxHp: 12, atk: 2, ...angreifer });
    b[idx(1, 1, 8)] = B("R", ziel);
    b[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3 });
    b[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
    for (const [k, v] of Object.entries(extra)) b[Number(k)] = v;
    return hpState(b);
  };
  const zug = (st, von, nach) => reduce(st, moveCommand(legalMoves(st).find((m) => m.from === von && m.to === nach))).state;
  const schwarzWartet = (st) => reduce(st, moveCommand(legalMoves(st).find((m) => m.from === idx(7, 7, 8)))).state;
  const T = idx(1, 1, 8), Q = idx(1, 0, 8);

  // GIFT
  let st = zug(brett({ abilities: ["gift"], stufen: { gift: 2 } }), Q, T);
  const tHp = st.board[T].hp;
  ok("Gift: der Treffer vergiftet (2 je Zug, drei Runden)", st.board[T].giftN === 2 && st.board[T].giftRunden === 3 && (st.vergiftet || []).includes(T));
  /* Schwarz zieht - nach SEINEM Zug wirkt das Gift am Turm */
  st = zug(st, T, idx(1, 3, 8));
  ok("Gift wirkt nach dem eigenen Zug des Vergifteten", st.board[idx(1, 3, 8)].hp === tHp - 2 && (st.giftWirkt || []).includes(idx(1, 3, 8)));
  const fast = brett({ abilities: ["gift"], stufen: { gift: 3 } }, { hp: 5, maxHp: 10, atk: 1 });
  st = zug(fast, Q, T);   // 5 - 2 = 3, vergiftet mit 3
  st = zug(st, T, idx(1, 3, 8));
  ok("Gift toetet nie - mindestens ein Leben bleibt", st.board[idx(1, 3, 8)] && st.board[idx(1, 3, 8)].hp === 1);
  {
    let x = zug(brett({ abilities: ["gift"], stufen: { gift: 1 } }, { hp: 20, maxHp: 20, atk: 1 }), Q, T);   // 20 - 2 = 18
    let wo = T, kw = idx(7, 0, 8);
    for (const nach of [idx(1, 3, 8), idx(1, 4, 8), idx(1, 5, 8)]) {
      x = zug(x, wo, nach); wo = nach;
      const kNach = kw === idx(7, 0, 8) ? idx(6, 0, 8) : idx(7, 0, 8); x = zug(x, kw, kNach); kw = kNach;
    }
    ok("Gift endet nach drei Runden (18 -> 15, dann kein Gift mehr)", x.board[wo] && x.board[wo].hp === 15 && !(x.board[wo].giftRunden > 0));
  }

  // ADERLASS
  st = zug(brett({ abilities: ["aderlass"], stufen: { aderlass: 2 } }), Q, T);
  ok("Aderlass II: der Treffer nimmt 2 Hoechstleben", st.board[T].maxHp === 8 && st.board[T].hp <= 8);

  // SCHRECKEN - das verlassene Feld ist fuer Schwarz zu, fuer Weiss nicht
  const schreck = brett({ abilities: ["schrecken"], stufen: { schrecken: 1 } });
  schreck.board[T] = null; schreck.board[idx(0, 0, 8)] = B("R", { hp: 10, maxHp: 10, atk: 1 });   // schwarzer Turm auf a1
  st = zug(schreck, Q, idx(1, 2, 8));   // Monster b1 -> b3, b1 wird Schreckfeld
  ok("Schrecken: das verlassene Feld ist markiert", st.schreckFelder && st.schreckFelder[Q] && st.schreckFelder[Q].farbe === "w");
  ok("... ein Gegner darf es nicht betreten", !legalMoves(st).some((m) => m.from === idx(0, 0, 8) && m.to === Q));
  ok("... aber an ihm vorbeiziehen", legalMoves(st).some((m) => m.from === idx(0, 0, 8) && m.to === idx(2, 0, 8)));
  st = schwarzWartet(st);
  st = zug(st, idx(7, 0, 8), idx(7, 1, 8));
  ok("... nach einer Runde ist es wieder frei", legalMoves(st).some((m) => m.from === idx(0, 0, 8) && m.to === Q));

  // BLENDEN - Gegner im Umkreis 2 duerfen ihren naechsten Zug nicht ziehen; der Koenig nie
  const bl = brett({ abilities: ["blenden"], stufen: { blenden: 1 } }, { hp: 10, maxHp: 10, atk: 1 });
  bl.board[T] = null; bl.board[idx(3, 3, 8)] = B("R", { hp: 10, maxHp: 10, atk: 1 });
  st = zug(bl, Q, idx(2, 1, 8));   // Monster nach c2: Turm auf d4 ist 2 Felder entfernt
  ok("Blenden: der Turm im Umkreis ist geblendet", st.blenden && st.blenden.felder.includes(idx(3, 3, 8)));
  ok("... er darf nicht ziehen, der Koenig schon", !legalMoves(st).some((m) => m.from === idx(3, 3, 8)) && legalMoves(st).some((m) => m.from === idx(7, 7, 8)));
  st = schwarzWartet(st);
  st = zug(st, idx(2, 1, 8), idx(2, 2, 8));   // Monster zieht weiter - Blenden I ist verbraucht
  ok("Blenden I: einmal je Partie", !st.blenden && legalMoves(st).some((m) => m.from === idx(3, 3, 8)));
  /* Blenden darf nie ein Remis durch Zugnot erzwingen */
  const allein = new Array(64).fill(null);
  allein[idx(0, 0, 8)] = W("Q", { hp: 12, maxHp: 12, atk: 2, abilities: ["blenden"], stufen: { blenden: 1 } });
  allein[idx(2, 2, 8)] = B("R", { hp: 10, maxHp: 10, atk: 1 });
  allein[idx(7, 7, 8)] = B("K", { hp: 10, maxHp: 10, atk: 3, blindBis: 99 });   // kuenstlich: auch der Koenig gesperrt
  allein[idx(7, 0, 8)] = W("K", { hp: 10, maxHp: 10, atk: 3 });
  let az = hpState(allein); az = zug(az, idx(0, 0, 8), idx(0, 1, 8));
  ok("bliebe kein Zug, gilt die Sperre nicht", legalMoves(az).length > 0);

  // GEISTWANDEL - faellt, kehrt als Geist zurueck: 3 Leben, doppelter Angriff
  const gw = brett({ atk: 12 }, { hp: 5, maxHp: 10, atk: 2, abilities: ["geistwandel"] });
  st = zug(gw, Q, T);
  ok("Geistwandel: faellt und kehrt als Geist zurueck (3 Leben, Angriff 2 -> 4)",
    st.board[T] && st.board[T].geist === true && st.board[T].hp === 3 && st.board[T].atk === 4 && st.geistFeld === T);
  st = schwarzWartet(st); st = zug(st, Q, T);
  ok("... einmal je Partie: faellt der Geist, ist er fort", !st.board[T] || st.board[T].color === "w");
  const gwU = brett({ atk: 12 }, { hp: 5, maxHp: 12, atk: 2, abilities: ["unsterblich", "geistwandel"], stufen: { unsterblich: 1 } });
  st = zug(gwU, Q, T);
  ok("Unsterblich kommt vor dem Geist", st.board[T] && !st.board[T].geist && st.board[T].auferstanden === true);

  // Klassik: keine der fuenf wirkt
  const { NUR_MIT_LEBEN: NML } = await import("./src/core/rules/moves.js");
  ok("in Klassik schweigen alle fuenf", ["gift", "blenden", "aderlass", "schrecken", "geistwandel"].every((id) => NML.has(id)));
}

/* v1.31.0: was anhaelt, bleibt am Brett sichtbar; der Geist ist nur im BILD bleich */
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("das Brett zeigt Gift, Blindheit und Schreckfeld, solange sie anhalten",
    bv.includes("function Zustaende(") && bv.includes("piece.giftRunden > 0") && bv.includes("piece.blindBis >= mc") && bv.includes("sf.bis >= mc"));
  ok("... und jede Wirkung im Moment (vergiftet, Gift, Aderlass, geblendet, Geist, Schrecken)",
    ["state.vergiftet", "state.giftWirkt", "state.aderlass", "state.blenden", "state.geistFeld", "state.schreckFelder && lm.from"].every((x) => bv.includes(x)));
  const pg = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
  const bild = pg.indexOf('? <img src={painting} alt="" draggable={false} decoding="async"');
  const geist = pg.indexOf("...(piece.geist ? { filter:", bild);
  ok("der Geist ist bleich im Bild - das Band behaelt seine Farbe", bild > 0 && geist > bild && pg.slice(bild, geist).indexOf("}} />") === -1);
}

/* v1.31.0: die ERSTE Begegnung mit jeder der neun Monsterfaehigkeiten erklaert
   sich einmal, ueber dem Brett, ohne die Partie anzuhalten. */
{
  const { readFileSync } = await import("node:fs");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  const NEUN = ["steinhaut", "unsterblich", "widerhall", "wegelagerei", "gift", "aderlass", "blenden", "geistwandel", "schrecken"];
  ok("jede der neun Monsterfaehigkeiten hat ihre Erstbegegnung", NEUN.every((id) => gs.includes('funde.push("' + id + '")')));
  ok("... einmal gesehen, nie wieder (notices faeh:<id>)", gs.includes('dispatch({ type: "SET_NOTICE", key: "faeh:" + neu })'));
  ok("... und der Hinweis haelt die Partie nicht an (kein Modal, verschwindet von selbst)", gs.includes("setTimeout(() => setErstHinweis(null), 9000)") && gs.includes('role="status"'));
  const { ABILITIES } = await import("./src/content/abilities.js");
  ok("alle neun sind live und erklaeren sich mit einem Satz", NEUN.every((id) => ABILITIES[id] && ABILITIES[id].live && ABILITIES[id].descDe && ABILITIES[id].descEn));
}

/* v1.33.1 (Besitzer, mit Screenshots): die Leiste unter dem Brett war kaum
   lesbar, Zurueck/Aufgeben zu praesent, die Hofstaat-Kacheln zeigten vor dem
   Erwachen der Lebenspunkte schon das rote/blaue Band. */
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  /* v1.38.0: es gibt nur noch EINE Leiste - die Zeile fuer eine Figur ohne
     Talente. Die gefuellte ist fort (die Kampfleiste traegt die Talente). */
  /* v1.55.0 (Besitzer: "nur Buttons praesent, Infos zurueckhalten"): die
     Zeile fuer eine Figur ohne Talente ist keine leuchtende Box mehr, sondern
     eine ruhige Auskunft - kein Rahmen, kein Grund, gedaempfte Schrift. Sie
     liegt weiter UEBER dem Brettschatten. */
  const zeile = bv.split('<div data-talent-hinweis="1" style={{').slice(1).map((x) => x.slice(0, 400));
  ok("die Talent-Zeile liegt UEBER dem Brettschatten (position + zIndex)",
    zeile.length === 1 && zeile[0].includes('position: "relative", zIndex: 2'));
  ok("... und ist eine ruhige Auskunft: kein Rahmen, kein Grund, gedaempfte Schrift",
    !zeile[0].includes("border:") && !zeile[0].includes("background:") && zeile[0].includes('color: "rgba(226,218,246,.62)"')
    && !bv.includes('className="gg-talentband"'));
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("Zurueck und Aufgeben sind leise Knoepfe (kein Gluehen, gedaempfte Schrift)",
    (gs.match(/leiserKnopf\(/g) || []).length === 2 && gs.includes('const leiserKnopf = (extra) => pill({') && !gs.includes("boxShadow: `0 0 10px ${T.selGlow}` })}>\n            <span style={{ fontSize: 15"));
  const ar = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("vor dem Erwachen der Lebenspunkte: Kachel und Blatt ohne Werte, grau und hell - wie das Brett",
    ar.includes("if (!hpUnlocked(profile)) return { leben: 0, kraft: 0, ohne: true };")
    && ar.includes("grau={!!(dim || dark || werte.ohne)} hell={!!werte.ohne && !dim && !dark}")
    && ar.includes("{...(werteAn ? band : { leben: 0, kraft: 0 })}"));
}

/* v1.33.1 (Besitzer, mit Screenshots): das Figurenblatt - der Gambit wie jede
   Figur, keine doppelte Stufenanzeige, im Pop-up wischen. */
{
  const { readFileSync } = await import("node:fs");
  const ar = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("der Gambit traegt EINEN Satz unter dem Namen wie jede Figur", ar.includes("satz={en ? char.flavorEn : char.flavorDe}") && !ar.includes('satz={!epic ?'));
  ok("... kein Stufen-Chip mehr neben Verbessern, kein langer Erklaertext", !ar.includes("repeat(gambitTier(level))") && !ar.includes("army.gambitExplain"));
  ok("die Stufenleiste unter der Bundtafel ist fort (die Stufe steht oben)", !ar.includes("the Gambit climbs three tiers of ten"));
  ok("im Pop-up wischen: beide Blaetter hoeren auf die Geste und blaettern durch die Folge der Uebersicht",
    (ar.match(/onTouchStart={wischStart} onTouchEnd={wischEnde}/g) || []).length === 2
    && ar.includes("const blattFolge = [") && ar.includes("blaettern(dx < 0 ? 1 : -1)"));
  ok("... nur ein klarer waagrechter Wisch - Scrollen bleibt Scrollen", ar.includes("Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.6"));
  ok("gewonnene Kapitelmeister stehen im Hofstaat, in Kapitelfolge, danach die gekauften (vorher nirgends)", ar.includes("...LEAGUE_BOSSES.filter(imHof)") && ar.includes("...BOSSES.filter((b) => !LEAGUE_BOSSES.includes(b.id) && imHof(b.id))"));
}

/* ── v1.37.0: BOLLWERK, FRUEHE KROENUNG UND FLIEGEN NACH STUFE ──────────── */
{
  const { maxStufe, ABILITIES } = await import("./src/content/abilities.js");
  const { pieceMoves } = await import("./src/core/rules/moves.js");
  const { CHARACTERS: CH2 } = await import("./src/content/index.js");
  const { fliegenZusammengelegt } = await import("./src/meta/profile.js");
  // Bollwerk: 1 oder 2 Schaden weniger
  const panzer = (stufe) => {
    const b = new Array(64).fill(null);
    b[idx(0, 0, 8)] = ab("Q", "w", { hp: 9, maxHp: 9, atk: 3 });
    b[idx(1, 1, 8)] = ab("R", "b", { abilities: ["bulwark"], stufen: { bulwark: stufe }, hp: 9, maxHp: 9 });
    kings(b);
    const r = reduce(hpState(b), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: 1, kind: "Q", color: "w", capture: true, captureKind: "R" }));
    return 9 - r.state.board[idx(1, 1, 8)].hp;
  };
  ok("Bollwerk I schluckt 1 Schaden (3 -> 2), II schluckt 2 (3 -> 1)", panzer(1) === 2 && panzer(2) === 1);
  ok("... und hat genau zwei Stufen", maxStufe("bulwark") === 2);
  // Fruehe Kroenung: eine oder zwei Reihen frueher
  const kroent = (stufe, feld) => {
    const b = new Array(64).fill(null);
    b[feld] = ab("P", "w", { abilities: ["pawn_early_promo"], stufen: { pawn_early_promo: stufe }, hp: 3, maxHp: 3 });
    kings(b);
    return pieceMoves(hpState(b), feld).some((m) => m.promotion);
  };
  ok("Fruehe Kroenung I wandelt auf der vorletzten Reihe (nicht zwei davor)", kroent(1, idx(3, 5, 8)) && !kroent(1, idx(3, 4, 8)));
  ok("... Stufe II auch zwei Reihen frueher", kroent(2, idx(3, 4, 8)));
  // Fliegen: eine Faehigkeit mit Stufen
  ok("Fliegen II und III stehen nicht mehr als eigene Faehigkeiten", !ABILITIES.dragon_flight2 && !ABILITIES.dragon_flight3 && maxStufe("dragon_flight") === 3);
  ok("... und der Drache traegt nur noch EINE Sprosse dafuer",
    CH2.dragon.ladder.filter((r) => r.ability === "dragon_flight").length === 1 && !CH2.dragon.ladder.some((r) => /dragon_flight[23]/.test(r.ability || "")));
  const alt = { pieces: { abilities: { dragon: ["dragon_flight", "dragon_flight3"] }, stufen: {} } };
  const neuP = fliegenZusammengelegt(alt);
  ok("Altstand: gelerntes Fliegen III wird zur STUFE III (bezahlt bleibt bezahlt)",
    neuP.pieces.stufen.dragon.dragon_flight === 3 && JSON.stringify(neuP.pieces.abilities.dragon) === '["dragon_flight"]');
  ok("... und ein zweites Laden aendert nichts", JSON.stringify(fliegenZusammengelegt(neuP)) === JSON.stringify(neuP));
  ok("Dauerfeuer ist auch aus dem Kern fort", !ABILITIES.ranged_volley);
}

/* ── v1.38.0 (Besitzer): FAEHIGKEITEN NUR NOCH EINMAL, UND DIE LEISTE SCHALTET
   "die Faehigkeiten stehen doppelt (Pillen im Talentband und der Zeichen-
   Slider darunter); die Auswahl am Slider greift nicht sauber." ──────────── */
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  const kl = readFileSync("src/app/ui/KampfLeiste.jsx", "utf8");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("das Talentband traegt keine Faehigkeits-Pillen mehr", !bv.includes("{eintraege.map((e) => {"));
  ok("... und verschwindet ganz, sobald die Figur Talente hat", bv.includes("if (eintraege.length) return null;"));
  ok("... der tote Schild-Chip ist fort (keine Figur und kein Monster traegt einen Schild)", !bv.includes("Schild ×"));
  ok("... die Zeile fuer eine Figur OHNE Talente bleibt", bv.includes("Diese Figur hat noch keine Talente"));
  ok("der scharfe Zauber ist EINE Wahrheit: der Gefechtsschirm haelt sie",
    gs.includes("const [scharf, setScharf] = useState(null);")
    && /<BoardView[^>]*scharf=\{scharf\} onScharf=\{setScharf\}/.test(gs)
    && (gs.match(/<KampfLeiste[^>]*scharf=\{scharf\} onScharf=\{setScharf\}/g) || []).length === 2);
  ok("das Brett nimmt ihn von aussen und haelt ihn sonst selbst",
    bv.includes("scharf: scharfAussen = undefined, onScharf = null") && bv.includes("const scharf = scharfAussen !== undefined ? scharfAussen : scharfIntern;"));
  ok("die Kampfleiste schaltet nur ECHTE Zauber der eigenen Figur am Zug scharf",
    kl.includes("const amZug = !!(pc && eigen && pc.color === state.turn);")
    && kl.includes("const istZauber = (id) => !!ABILITIES[id] && !PASSIVE_TALENTE.has(id);")
    && kl.includes("const schaltbar = (id) => amZug && istZauber(id) && !(pc.used || {})[id];"));
  ok("... ein Tipp schaltet scharf, ein zweiter entschaerft", kl.includes("if (schaltbar(id) && onScharf) onScharf(scharf === id ? null : id);"));
  ok("... und die scharfe Karte zeigt es (violett) samt Hinweis unter der Reihe",
    kl.includes('scharf={scharf === id}') && kl.includes('"1.5px solid #c4b5fd"') && kl.includes("bereit — tippe ein ✦-Feld"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
