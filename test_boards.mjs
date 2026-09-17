import { createGame, legalMoves, status, reduce, moveCommand, pieceMoves, idx, fileOf, rankOf, KIND } from "./src/core/index.js";
import { mapById } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

const spec = (k) => ({ kind: k, level: 1, abilities: [], shield: 0 });
const army = (kinds) => ({ back: kinds.map(spec), pawn: spec("P") });

// ── Classic 8×8 plays exactly like real chess ────────────────────────────────
const classic = mapById("classic");
const a8 = army(classic.defaultFormation.map((id) => ({
  rook: "R", knight: "N", bishop: "B", queen: "Q", king: "K",
}[id])));
let s = createGame(a8, a8, { map: classic });
ok("classic board has 64 squares", s.board.length === 64);
ok("classic board reports 8×8", s.w === 8 && s.h === 8);
ok("classic opening has exactly 20 legal moves", legalMoves(s).length === 20);
ok("classic pawn e2 can double to e4", legalMoves(s).some((m) => m.from === idx(4, 1, 8) && m.to === idx(4, 3, 8)));
const r = reduce(s, moveCommand(legalMoves(s)[0]));
ok("classic match advances via reduce", r.state.moveCount === 1 && r.events.length >= 1);

// ── A hole blocks movement like a wall ───────────────────────────────────────
const board = new Array(64).fill(null);
board[idx(0, 0, 8)] = { id: 1, kind: "R", color: "w", level: 1, abilities: [], used: {}, shield: 0 };
const holed = { board, w: 8, h: 8, holes: new Set([idx(4, 0, 8)]), turn: "w", captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0 };
const filesOnRank0 = pieceMoves(holed, idx(0, 0, 8)).filter((m) => rankOf(m.to, 8) === 0).map((m) => fileOf(m.to, 8)).sort((x, y) => x - y);
ok("rook is stopped before a hole", JSON.stringify(filesOnRank0) === JSON.stringify([1, 2, 3]));
ok("no move ever lands on a hole", !pieceMoves(holed, idx(0, 0, 8)).some((m) => m.to === idx(4, 0, 8)));

/* ── Die Maschine bleibt massunabhaengig (v1.24.0) ─────────────────────────
   Das 6x6-Scharmuetzel ist als KARTE gestrichen (Besitzerentscheid), aber die
   Eigenschaft, die es hier bewies, gilt weiter: die Maschine rechnet auf jeder
   Breite. Deshalb steht hier jetzt ein 6x6-Brett von Hand statt aus dem
   Katalog - gestrichen ist die Karte, nicht die Faehigkeit. */
const sk = { id: "adhoc6", w: 6, h: 6, holes: [],
  back: { whiteBack: 0, blackBack: 5, whitePawn: 1, blackPawn: 4 },
  defaultFormation: ["rook", "knight", "queen", "king", "bishop", "knight"] };
const a6 = army(sk.defaultFormation.map((id) => ({ rook: "R", knight: "N", bishop: "B", queen: "Q", king: "K" }[id])));
let s6 = createGame(a6, a6, { map: sk });
ok("a 6x6 board has 36 squares", s6.board.length === 36);
ok("a 6x6 board has legal opening moves", legalMoves(s6).length > 0);
ok("a 6x6 board is not over at the start", status(s6).over === false);

// ── Shaped board (courtyard, 4 center holes) ─────────────────────────────────
const yard = mapById("courtyard");
const ay = army(yard.defaultFormation.map((id) => ({ rook: "R", knight: "N", bishop: "B", queen: "Q", king: "K" }[id])));
let sy = createGame(ay, ay, { map: yard });
ok("courtyard board has 64 squares", sy.board.length === 64);
ok("courtyard center holes are empty", [[3, 3], [4, 3], [3, 4], [4, 4]].every(([f, rr]) => sy.board[idx(f, rr, 8)] === null));
ok("courtyard has legal opening moves", legalMoves(sy).length > 0);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
