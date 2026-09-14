import {
  WHITE, BLACK, KIND, idx, emptyBoard, makePiece,
  createGame, legalMoves, legalMovesFrom,
  reduce, moveCommand, resignCommand, EVENT,
  encodeState, decodeState, replay,
  applyMove,
} from "./src/core/index.js";
import { buildArmyFromFormation, defaultFormation } from "./src/meta/index.js";
import { mapById } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  ok  -", name); } else { fail++; console.log(" FAIL -", name); } };
const has = (events, type) => events.find((e) => e.type === type);

// 1) createGame wraps a playable state with a command log + seed
const g = createGame();
ok("createGame has legal moves", legalMoves(g).length > 0);
ok("createGame starts with empty log", Array.isArray(g.log) && g.log.length === 0);
ok("createGame carries a seed", typeof g.seed === "number");

// 2) reduce(MOVE) emits 'moved', flips turn, records the command
const first = legalMoves(g)[0];
const r1 = reduce(g, moveCommand(first));
ok("reduce emits a 'moved' event", !!has(r1.events, EVENT.MOVED));
ok("reduce flips the turn", r1.state.turn === BLACK);
ok("reduce appends the command to the log", r1.state.log.length === 1 && r1.state.log[0].type === "MOVE");

// 3) Capture emits a 'captured' event with attacker + victim kinds
function base(extra) { return { board: emptyBoard(), turn: WHITE, captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1, ...extra }; }
const capState = base();
capState.board[idx(0, 0)] = makePiece({ kind: KIND.ROOK, color: WHITE });
capState.board[idx(0, 4)] = makePiece({ kind: KIND.PAWN, color: BLACK });
capState.board[idx(9, 9)] = makePiece({ kind: KIND.KING, color: WHITE });
capState.board[idx(5, 9)] = makePiece({ kind: KIND.KING, color: BLACK });
const capMove = legalMovesFrom(capState, idx(0, 0)).find((m) => m.to === idx(0, 4));
const rc = reduce(capState, moveCommand(capMove));
const capEv = has(rc.events, EVENT.CAPTURED);
ok("capture emits 'captured'", !!capEv);
ok("captured event names attacker (R) and victim (P)", capEv && capEv.byKind === "R" && capEv.kind === "P");

// 4) Shield bounce emits 'shieldAbsorbed' and NOT 'captured'
const shState = base();
shState.board[idx(0, 0)] = makePiece({ kind: KIND.ROOK, color: WHITE });
shState.board[idx(0, 4)] = makePiece({ kind: KIND.PAWN, color: BLACK, shield: 1 });
shState.board[idx(9, 9)] = makePiece({ kind: KIND.KING, color: WHITE });
shState.board[idx(5, 9)] = makePiece({ kind: KIND.KING, color: BLACK });
const shMove = legalMovesFrom(shState, idx(0, 0)).find((m) => m.to === idx(0, 4));
const rs = reduce(shState, moveCommand(shMove));
ok("shield hit emits 'shieldAbsorbed'", !!has(rs.events, EVENT.SHIELD_ABSORBED));
ok("shield hit does NOT emit 'captured'", !has(rs.events, EVENT.CAPTURED));

// 5) A mating move emits 'gameOver' (checkmate, winner white)
const mate = base();
mate.board[idx(2, 2)] = makePiece({ kind: KIND.KING, color: WHITE });
mate.board[idx(1, 5)] = makePiece({ kind: KIND.QUEEN, color: WHITE });
mate.board[idx(0, 0)] = makePiece({ kind: KIND.KING, color: BLACK });
const mateMove = legalMovesFrom(mate, idx(1, 5)).find((m) => m.to === idx(1, 1));
ok("mating move is available", !!mateMove);
const rm = reduce(mate, moveCommand(mateMove));
const over = has(rm.events, EVENT.GAME_OVER);
ok("mate emits 'gameOver'", !!over);
ok("gameOver reports checkmate for white", over && over.result === "checkmate" && over.winner === WHITE);

// 6) Resign command ends the game for the other side
const rr = reduce(g, resignCommand(WHITE));
const ro = has(rr.events, EVENT.GAME_OVER);
ok("resign emits 'gameOver' won by black", ro && ro.result === "resign" && ro.winner === BLACK);

// 7) Snapshot round-trips (encode -> decode preserves legal move count)
const enc = encodeState(r1.state);
const dec = decodeState(enc);
ok("snapshot round-trip preserves legal moves", legalMoves(dec).length === legalMoves(r1.state).length);

// 8) Replay reconstructs an identical board from the command log
const moves = legalMoves(g);
let live = g;
for (const m of [moves[0], null]) { if (m) live = reduce(live, moveCommand(m)).state; }
// play a couple more deterministic plies
for (let k = 0; k < 2; k++) { const mv = legalMoves(live)[0]; if (mv) live = reduce(live, moveCommand(mv)).state; }
const rebuilt = replay(createGame(undefined, undefined, g.seed), live.log).state;
ok("replay reproduces move count", rebuilt.moveCount === live.moveCount);
// piece `id`s are UI-only and assigned from a global counter, so ignore them;
// the game logic addresses squares by index, so position+kind is what must match.
const sig = (b) => JSON.stringify(b.map((p) => p && { k: p.kind, c: p.color, l: p.level, s: p.shield, a: p.abilities, u: p.used, m: p.hasMoved }));
ok("replay reproduces the board exactly", sig(rebuilt.board) === sig(live.board));

console.log("\n== DIE DREI SCHACH-SONDERZUEGE (v1.8.0) ==");
{
  const ar2 = () => buildArmyFromFormation(() => 1, defaultFormation(mapById("classic")));
  const ix2 = (f, r) => r * 8 + f;

  /* ROCHADE. Wichtig beim Pruefen: die Grundreihe dieses Spiels ist NICHT die
     klassische - sie lautet R N N B Q K B N, der Koenig steht auf Feld 5 und
     der einzige Turm auf 0. Ein erster Anlauf erwartete auf Feld 7 einen Turm
     (dort steht ein Springer) und meldete faelschlich "Rochade fehlt". */
  {
    const g = createGame(ar2(), ar2(), { rules: "chess", map: mapById("classic") });
    const kf = g.board.findIndex((p) => p && p.kind === "K" && p.color === "w");
    const tf = [...Array(8).keys()].filter((f) => g.board[f] && g.board[f].kind === "R");
    for (const t of tf) { const [a2, b2] = [Math.min(kf, t), Math.max(kf, t)];
      for (let i = a2 + 1; i < b2; i++) g.board[i] = null; }
    const roch = legalMovesFrom(g, kf).filter((m2) => m2.special === "castle");
    ok(`die Rochade ist moeglich, wenn der Weg frei ist (${roch.length} Seite)`, roch.length >= 1);
  }

  /* EN PASSANT haengt am lastMove: nur direkt nach einem gegnerischen
     Doppelschritt - deshalb muss die Probe erst einen spielen. */
  {
    let g = createGame(ar2(), ar2(), { rules: "chess", map: mapById("classic") });
    g.board[ix2(4, 4)] = g.board[ix2(4, 1)]; g.board[ix2(4, 1)] = null;
    g.turn = "b";
    const dop = legalMovesFrom(g, ix2(3, 6)).find((m2) => m2.to === ix2(3, 4));
    ok("ein Bauer darf zwei Felder ziehen", !!dop && !!dop.double);
    if (dop) {
      g = applyMove(g, dop);
      const ep = legalMovesFrom(g, ix2(4, 4)).find((m2) => m2.special === "enpassant");
      ok("und wird danach en passant schlagbar", !!ep);
    }
  }

  /* UMWANDLUNG auf der letzten Reihe. */
  {
    const g = createGame(ar2(), ar2(), { rules: "chess", map: mapById("classic") });
    g.board[ix2(0, 6)] = g.board[ix2(0, 1)]; g.board[ix2(0, 1)] = null; g.board[ix2(0, 7)] = null;
    const um = legalMovesFrom(g, ix2(0, 6)).filter((m2) => m2.promotion);
    ok(`ein Bauer wandelt sich auf der letzten Reihe (${um.length} Ziele)`, um.length >= 1);
  }
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
