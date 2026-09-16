// Board geometry. Change FILES/RANKS to resize — the whole engine is size-agnostic.
export const FILES = 10;
export const RANKS = 10;
export const NUM_SQUARES = FILES * RANKS;

export const WHITE = "w";
export const BLACK = "b";
export const other = (c) => (c === WHITE ? BLACK : WHITE);

// Piece kinds (single-letter codes used everywhere).
export const KIND = {
  PAWN: "P", KNIGHT: "N", BISHOP: "B", ROOK: "R",
  QUEEN: "Q", KING: "K", CHANCELLOR: "C", ARCHBISHOP: "A",
  HAWK: "H",
  BOSS: "X",
  ASSASSIN: "S", GUARDIAN: "G", DRAGON: "D", MAGE: "E", SORCERESS: "Z",
  ALCHEMIST: "L", WARLOCK: "W", PALADIN: "U", INQUISITOR: "I", BARD: "J",
  SEERESS: "SE",   // two-char kind: the single letters are all spoken for
  ENGINEER: "T", STANDARD: "F", STRATEGIST: "Y", PATHFINDER: "O", AMAZON: "M", CAPTAIN: "V" };

// Movement vectors.
export const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
export const ORTHO = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export const KING_STEPS = [...DIAG, ...ORTHO];
export const KNIGHT_JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
// Extra jumps granted by the knight "long leap" ability.
export const LONG_LEAPS = [[1, 3], [3, 1], [-1, 3], [-3, 1], [1, -3], [3, -1], [-1, -3], [-3, -1]];
// Diagonal long jumps granted by the knight "outrider" ability.
export const DIAG_LEAPS = [[2, 2], [2, -2], [-2, 2], [-2, -2]];

// Material values used by the AI. Fairy pieces are worth more.
export const VALUE = { P: 100, N: 320, B: 330, H: 380, R: 500, A: 700, C: 800, Q: 900, M: 1150, K: 20000, X: 850, S: 430, G: 380, D: 840, E: 360, Z: 470, L: 330, W: 450, U: 560, I: 470, J: 300, T: 440, F: 340, Y: 480, O: 360, V: 560, };
export const SHIELD_VALUE = 70; // each shield charge is worth ~this to the AI

// ── HP ruleset stats ──────────────────────────────────────────────────────────
// Base hit points and attack power per kind, used only when a match runs with
// rules="hp". With 1 HP everywhere the game would be ordinary chess; these give
// bigger pieces staying power so capturing becomes attrition. The king is tanky
// because killing it wins the game (regicide).
/* v1.18.0 (Besitzer): der Drache ist ein Koloss - mehr Leben, weniger
   Angriff, "weil er ja eh schon flaechig angreift". D: 6/4 -> 10/2. */
export const BASE_HP = { P: 2, N: 3, B: 3, H: 3, R: 5, A: 5, C: 6, Q: 7, M: 8, K: 10, X: 10, S: 3, G: 6, D: 10, E: 3, Z: 3, L: 4, W: 4, U: 6, I: 5, J: 4, T: 5, F: 5, Y: 4, O: 3, V: 4, SE: 3, };
export const BASE_ATK = { P: 1, N: 2, B: 2, H: 2, R: 3, A: 3, C: 4, Q: 4, M: 5, K: 3, X: 3, S: 4, G: 2, D: 2, E: 3, Z: 3, L: 2, W: 4, U: 3, I: 3, J: 2, T: 3, F: 2, Y: 2, O: 2, V: 2, SE: 2, };
/* HP-Remis: bleiben so viele HALBZUEGE ohne jeden Schaden, endet die Partie
   unentschieden. 120 Halbzuege = 60 Zuege je Seite. Zaehler springt auf 0,
   sobald Schaden faellt, jemand stirbt oder ein Boss nachschafft. */
export const HP_REMIS_HALBZUEGE = 120;
export const SHIELD_HP = 2; // in HP mode a progression "shield" charge becomes +2 max HP

// Index <-> coordinate helpers. Width/height default to the 10×10 board, but a
// map can override them per match — pass w/h to work on any board size.
export const idx = (f, r, w = FILES) => r * w + f;
export const fileOf = (i, w = FILES) => i % w;
export const rankOf = (i, w = FILES) => (i / w) | 0;
export const inBounds = (f, r, w = FILES, h = RANKS) => f >= 0 && f < w && r >= 0 && r < h;

// Pawn orientation. White moves toward higher ranks.
export const dirOf = (color) => (color === WHITE ? 1 : -1);
export const startPawnRank = (color, h = RANKS) => (color === WHITE ? 1 : h - 2);
export const promoRank = (color, h = RANKS) => (color === WHITE ? h - 1 : 0);
