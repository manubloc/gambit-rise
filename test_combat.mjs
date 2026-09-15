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

// lifesteal heals the attacker
let lb = new Array(64).fill(null);
lb[idx(0, 0, 8)] = ab("Q", "w", { abilities: ["lifesteal"], hp: 3, maxHp: 9, atk: 4 });
lb[idx(1, 1, 8)] = ab("R", "b", { hp: 9, maxHp: 9 });
kings(lb);
let lr = reduce(hpState(lb), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: 1, kind: "Q", color: "w", capture: true, captureKind: "R" }));
ok("lifesteal heals the attacker on a hit", lr.state.board[idx(0, 0, 8)].hp === 5);

// bulwark reduces incoming damage
let bb = new Array(64).fill(null);
bb[idx(0, 0, 8)] = ab("Q", "w", { atk: 4 });
bb[idx(1, 1, 8)] = ab("R", "b", { hp: 9, maxHp: 9, abilities: ["bulwark"] });
kings(bb);
let br = reduce(hpState(bb), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: 1, kind: "Q", color: "w", capture: true, captureKind: "R" }));
ok("bulwark soaks 1 damage", br.state.board[idx(1, 1, 8)].hp === 6);

// regen heals 1 on moving
let gb = new Array(64).fill(null);
gb[idx(0, 0, 8)] = ab("R", "w", { abilities: ["regen"], hp: 4, maxHp: 9 });
kings(gb);
let gr = reduce(hpState(gb), moveCommand(legalMoves(hpState(gb)).find((m) => m.from === idx(0, 0, 8) && !m.capture)));
ok("regen heals 1 HP when moving", [...gr.state.board].find((p) => p && p.kind === "R" && p.color === "w").hp === 5);


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
  ok("the cast is written into the book", cast && cast.used && cast.used.pawn_sidestep === true);
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
  const sch = W("R", { hp: 5, maxHp: 5, atk: 3 }); sch.abilities = ["ranged_volley"];
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
  ok("die Welle ist verbraucht", nb[idx(1, 0, 8)].used.blast === true);
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
  const b1 = W("B", { hp: 3, maxHp: 3, atk: 2 }); b1.abilities = ["blast", "ranged_volley"];
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

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
