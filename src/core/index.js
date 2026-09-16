// ── @gambit/core — public API ────────────────────────────────────────────────
// Outer layers import ONLY from here, never from core internals. This barrel is
// the contract; everything below is free to be refactored behind it.

// Domain: geometry, kinds, pieces, board, initial setup
export {
  FILES, RANKS, NUM_SQUARES, WHITE, BLACK, other, KIND,
  idx, fileOf, rankOf, inBounds, dirOf, startPawnRank, promoRank,
  VALUE, SHIELD_VALUE, BASE_HP, BASE_ATK, SHIELD_HP, ZIEL_PROFIL, HOECHSTSTUFE, werteBeiStufe, HP_REMIS_HALBZUEGE,
} from "./domain/constants.js";
export { makePiece, emptyBoard, clonePiece, cloneBoard, findKing, newId } from "./domain/board.js";
export { DEFAULT_BACK_RANK, FLANK_SLOTS, defaultArmy, createInitialState } from "./domain/setup.js";

// Rules: move generation + attack/check detection
export { pieceMoves, pseudoMoves, hasAbility } from "./rules/moves.js";
export { isSquareAttacked, inCheck } from "./rules/attacks.js";
/* v1.0.63: die Sperren treten aus dem Maschinenraum heraus - Laden, Brett und
   Kampfschirm brauchen sie beim Namen (kaufen, setzen, zeichnen). */
export {
  SPERR_ARTEN, FALLEN_ARTEN, MAX_SPERREN, ZERFALL_TAKT,
  stadium, versperrt, sperreAuf, sperrenAnzahl,
  setzReihen, setzFelder, feldFrei, darfSetzen, setzeSperre, nimmSperre, zerfalleSperren,
} from "./rules/sperren.js";

// Simulation: state, transitions, commands, events, reducer
export { createGame } from "./sim/state.js";
export { applyMove, legalMoves, legalMovesFrom, status, undo, cloneState } from "./sim/transitions.js";
export { COMMAND, moveCommand, resignCommand, potionCommand, shiftCommand } from "./sim/commands.js";
export { familyOf, FAMILY_BY_KIND, familyCount, crownWallSoak, crownHp, shadowRifts, shadowAtk } from "./rules/families.js";
export { EVENT, Ev } from "./sim/events.js";
export { reduce } from "./sim/reducer.js";

// Ports: injectable RNG (deterministic when seeded)
export { mulberry32, makeRng, defaultRng } from "./ports/rng.js";

// Serialization: snapshots + replays (save games, netcode, verification)
export { encodeState, decodeState } from "./serialization/codec.js";
export { replay } from "./serialization/replay.js";
