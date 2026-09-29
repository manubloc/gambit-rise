import {
  WHITE, BLACK, KIND, idx, emptyBoard, makePiece,
  createGame, legalMoves, legalMovesFrom,
  reduce, moveCommand, resignCommand, EVENT,
  encodeState, decodeState, replay,
  applyMove, status,
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

/* ── v1.90.3 (Audit A2): DIE EINLASSKONTROLLE DES REDUCERS ────────────────
   Gemessen hat das Audit, was ohne sie durchkam: eine fremde Figur bei
   eigenem Zugrecht, Turm x Koenig mit status "ongoing", `to: 999` (das Brett
   wuchs auf 1000 Felder) und ein MOVE ganz ohne `move` (Absturz beim Lesen
   von `from`). Im Netzspiel faellt so etwas nicht auf, weil der ehrliche
   Client denselben Befehl nachrechnet - die Hash-Pruefung sieht dasselbe
   Falsche auf beiden Seiten. */
{
  const karte = mapById("classic");
  const heer = buildArmyFromFormation(() => 1, karte.defaultFormation);
  const g = createGame(heer, heer, { map: karte, rules: "chess", seed: 7 });
  const gleich = (a, b) => JSON.stringify(a.board) === JSON.stringify(b.board) && a.turn === b.turn;

  const ohne = reduce(g, { type: "MOVE" });
  ok("ein Zugbefehl ohne Zug aendert nichts und stuerzt nicht ab", gleich(ohne.state, g));

  const weit = reduce(g, moveCommand({ from: 8, to: 999 }));
  ok("ein Ziel ausserhalb des Bretts wird abgewiesen",
    gleich(weit.state, g) && weit.state.board.length === g.board.length);

  const negativ = reduce(g, moveCommand({ from: -1, to: 16 }));
  ok("ein Startfeld ausserhalb des Bretts wird abgewiesen", gleich(negativ.state, g));

  /* eine Figur der Gegenseite ziehen, obwohl Weiss am Zug ist */
  const schwarzFeld = g.board.findIndex((p) => p && p.color === BLACK);
  const fremd = reduce(g, moveCommand({ from: schwarzFeld, to: schwarzFeld - 8 }));
  ok("eine fremde Figur laesst sich nicht ziehen", gleich(fremd.state, g));

  const leer = g.board.findIndex((p, i) => !p && i > 20);
  const nichts = reduce(g, moveCommand({ from: leer, to: leer + 1 }));
  ok("ein leeres Feld zieht nicht", gleich(nichts.state, g));

  /* und ein ganz normaler Zug geht weiterhin durch */
  const eigen = g.board.findIndex((p) => p && p.color === WHITE && p.kind === KIND.PAWN);
  const zuege = legalMovesFrom(g, eigen);
  if (zuege.length) {
    const echt = reduce(g, moveCommand(zuege[0]));
    ok("ein gueltiger Zug geht weiterhin durch", !gleich(echt.state, g));
  }
}

/* ── v1.90.4 (Audit A33): OHNE KOENIG IST DIE PARTIE AUS ───────────────
   Der HP-Zweig kannte den Koenigsverlust, der Schach-Zweig nicht: die Partie
   lief als "ongoing" weiter, weil inCheck ohne Koenig false liefert - kein
   Banner, kein Ende, die KI zog weiter. */
{
  const g = createGame();
  const k = g.board.findIndex((p) => p && p.kind === KIND.KING && p.color === BLACK);
  ok("A33: vor dem Eingriff steht die Partie normal", status(g).result === "ongoing" && k >= 0);
  const ohne = { ...g, board: g.board.slice() };
  ohne.board[k] = null;
  const st = status(ohne);
  ok("A33: ohne schwarzen Koenig ist die Partie aus", st.over === true && st.result === "regicide");
  ok("A33: und Weiss hat gewonnen", st.winner === WHITE);
  const ohneW = { ...g, board: g.board.slice() };
  ohneW.board[g.board.findIndex((p) => p && p.kind === KIND.KING && p.color === WHITE)] = null;
  ok("A33: andersherum genauso", status(ohneW).result === "regicide" && status(ohneW).winner === BLACK);
}

/* ── v1.90.4 (Audit A13): DER VERTRAG VON status() ─────────────────
   In GameScreen stand `st.mate || st.stale || st.kingDown` - drei Felder, die
   status() NIE geliefert hat. Eine Suche ueber das ganze Repo traf nur diese
   eine Zeile, also war der Ausdruck immer false: eine gewonnene Tagespartie
   wurde nicht gemeldet, sondern erst nach Fristablauf als Zeitverlust des
   anderen gewertet - ein Patt sogar als Zeitverlust dessen, der am Zug war.
   Diese Probe haelt fest, WAS status() sagt, damit ein Leser es nachschlagen
   kann statt zu raten. Die Klasse selbst - ein Feld lesen, das es nicht
   gibt - faengt zusaetzlich die Suche unten ab. */
{
  const g0 = createGame(undefined, undefined, { rules: "chess" });
  const W = g0.w, H = g0.h, ix2 = (f, r) => r * W + f;
  const fig = (id, kind, color) => ({ id, kind, color, level: 1, abilities: [], used: {}, hasMoved: true });
  const matt = g0.board.map(() => null);
  matt[ix2(0, H - 1)] = fig(1, "K", "b");
  matt[ix2(1, H - 3)] = fig(2, "Q", "w");
  matt[ix2(7, H - 1)] = fig(3, "R", "w");
  matt[ix2(4, 0)] = fig(4, "K", "w");
  const sm = status({ ...g0, board: matt, turn: "b" });
  ok("A13: Matt heisst over/result/winner - nicht 'mate'",
    sm.over === true && sm.result === "checkmate" && sm.winner === WHITE);
  ok("A13: und status() erfindet kein Feld 'mate' oder 'kingDown'",
    !("mate" in sm) && !("stale" in sm) && !("kingDown" in sm));
  const patt = g0.board.map(() => null);
  patt[ix2(0, H - 1)] = fig(1, "K", "b");
  patt[ix2(2, H - 2)] = fig(2, "Q", "w");
  patt[ix2(4, 0)] = fig(4, "K", "w");
  const sp = status({ ...g0, board: patt, turn: "b" });
  ok("A13: Patt heisst result 'stalemate' und winner null",
    sp.over === true && sp.result === "stalemate" && sp.winner === null);
  /* Und genau so muss die Tagespartie es melden: winner aus st.winner,
     reason aus st.result. Vorher stand dort eine Umrechnung des Zugrechts,
     die beim Patt den Falschen zum Verlierer machte. */
  const melde = (st) => (st.over ? { winner: st.winner ?? null, reason: st.result } : null);
  ok("A13: der Bericht der Tagespartie nennt beim Matt den Sieger",
    JSON.stringify(melde(sm)) === JSON.stringify({ winner: "w", reason: "checkmate" }));
  ok("A13: und beim Patt niemanden", JSON.stringify(melde(sp)) === JSON.stringify({ winner: null, reason: "stalemate" }));
  ok("A13: eine laufende Partie meldet nichts", melde(status(createGame())) === null);
}

/* ── v1.90.4 (Audit A13, die KLASSE): KEIN ERFUNDENES STATUSFELD ──────
   Das eigentliche Uebel war nicht die eine Zeile, sondern dass niemand sie
   bemerkt hat: gueltiges JavaScript, das stumm `undefined` liest. Dieselbe
   Klasse wie die Abstuerze A3/A4, gegen die seit v1.89.9
   tools/pruefe-bezeichner.mjs laeuft - nur eine Stufe subtiler, weil hier
   kein ReferenceError fliegt. Die Suche haelt die drei Namen fern. */
{
  const { readdirSync, readFileSync, statSync } = await import("node:fs");
  const { join } = await import("node:path");
  const treffer = [];
  const lauf = (dir) => {
    for (const n of readdirSync(dir)) {
      const pfad = join(dir, n);
      if (statSync(pfad).isDirectory()) { lauf(pfad); continue; }
      if (!/\.(js|jsx|mjs)$/.test(n)) continue;
      const txt = readFileSync(pfad, "utf8");
      for (const m of txt.matchAll(/\b(?:st|status|zustand)\s*\.\s*(mate|stale|kingDown)\b/g))
        treffer.push(pfad + ": " + m[0]);
    }
  };
  lauf("src");
  lauf("worker/src");
  if (treffer.length) console.log("     gefunden:", treffer.join(" | "));
  ok("A13: niemand liest mehr st.mate, st.stale oder st.kingDown", treffer.length === 0);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
