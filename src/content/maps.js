// ── Maps — boards of varying size AND shape ──────────────────────────────────
// A map is a bounding box (w × h) plus a set of `holes` (blocked cells outside
// the play area). Geometry is derived from `w` exactly like the live engine
// derives it from 10 today — this is the data the engine will read once board
// size moves from a global constant into the match state (see MAPS.md, phase 2).
//
// Indexing is self-contained here (r * w + f) so these helpers work for ANY
// width, previewing the parametric geometry the core will adopt.

export const mapIdx = (map, f, r) => r * map.w + f;
export const inBox = (map, f, r) => f >= 0 && f < map.w && r >= 0 && r < map.h;
export const isHole = (map, f, r) => (map.holes || []).some(([hf, hr]) => hf === f && hr === r);
export const inMap = (map, f, r) => inBox(map, f, r) && !isHole(map, f, r);
export const holeSet = (map) => { const s = new Set(); for (const [f, r] of map.holes || []) s.add(mapIdx(map, f, r)); return s; };
export const playableCount = (map) => map.w * map.h - (map.holes ? map.holes.length : 0);

// Standard chess back rank (used by the 8-wide maps).
// One board look for EVERY map (v0.4): the Klassik palette is the reference —
// maps differ by size and holes, never by square colors.
export const CLASSIC_SQ = { sqLight: "#8a8371", sqDark: "#3a3e49" };

const CHESS_BACK = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
// Full 10-wide GAMBIT back rank (matches DEFAULT_BACK_RANK in core).
const ARENA_BACK = ["rook", "knight", "knight", "bishop", "queen", "king", "bishop", "knight", "knight", "rook"];

/* v1.23.1 (Besitzer): PFLICHT IST NUR DER KOENIG. Der Platz der Dame haelt
   die Dame oder einen gewonnenen Meister ("die Meister duerfen die Dame
   ersetzen, sonst nirgends"); der Laeufer ist keine Pflichtfigur mehr - alle
   uebrigen Plaetze sind frei mit allem besetzbar, was man gesammelt hat. */
export const MAPS = [
  {
    id: "classic", nameDe: "Klassik", nameEn: "Classic", theme: CLASSIC_SQ,
    w: 8, h: 8, holes: [], classic: true,
    back: { whiteBack: 0, blackBack: 7, whitePawn: 1, blackPawn: 6 },
    formation: { required: { king: 1, queen: 1 }, flex: 6 },
    defaultFormation: CHESS_BACK,
  },
  {
    id: "arena", nameDe: "Arena", nameEn: "Arena", theme: CLASSIC_SQ,
    w: 10, h: 10, holes: [], classic: false,
    back: { whiteBack: 0, blackBack: 9, whitePawn: 1, blackPawn: 8 },
    formation: { required: { king: 1, queen: 1 }, flex: 8 },
    defaultFormation: ARENA_BACK,
  },
  {
    id: "skirmish", nameDe: "Scharmützel", nameEn: "Skirmish", theme: CLASSIC_SQ,
    w: 6, h: 6, holes: [], classic: false,
    back: { whiteBack: 0, blackBack: 5, whitePawn: 1, blackPawn: 4 },
    formation: { required: { king: 1, queen: 1 }, flex: 4 },
    defaultFormation: ["rook", "knight", "queen", "king", "bishop", "knight"],
  },
  {
    id: "courtyard", nameDe: "Hof", nameEn: "Courtyard", theme: CLASSIC_SQ,
    w: 8, h: 8, holes: [[3, 3], [4, 3], [3, 4], [4, 4]], classic: false,
    back: { whiteBack: 0, blackBack: 7, whitePawn: 1, blackPawn: 6 },
    formation: { required: { king: 1, queen: 1 }, flex: 6 },
    defaultFormation: CHESS_BACK,
  },
  {
    id: "gauntlet", nameDe: "Schneise", nameEn: "Gauntlet", theme: CLASSIC_SQ,
    w: 8, h: 8, holes: [[2, 3], [2, 4], [5, 3], [5, 4]], classic: false,
    back: { whiteBack: 0, blackBack: 7, whitePawn: 1, blackPawn: 6 },
    formation: { required: { king: 1, queen: 1 }, flex: 6 },
    defaultFormation: CHESS_BACK,
  },
];

export const mapById = (id) => MAPS.find((m) => m.id === id) || MAPS[0];

/** Returns a list of problems (empty array = valid). Used by tests + map authors. */
export function validateMap(m) {
  const errs = [];
  if (m.w < 4 || m.h < 4) errs.push("board too small");
  for (const [f, r] of m.holes || []) if (!inBox(m, f, r)) errs.push(`hole (${f},${r}) out of bounds`);
  if (!Array.isArray(m.defaultFormation) || m.defaultFormation.length !== m.w) errs.push("defaultFormation length must equal width");
  const reqSum = Object.values(m.formation.required).reduce((a, b) => a + b, 0);
  if (reqSum + m.formation.flex !== m.w) errs.push("required + flex must equal width");
  for (const rr of [m.back.whiteBack, m.back.blackBack, m.back.whitePawn, m.back.blackPawn])
    if (rr < 0 || rr >= m.h) errs.push("setup rank out of bounds");
  // setup ranks must not run through holes
  for (let f = 0; f < m.w; f++) {
    if (isHole(m, f, m.back.whiteBack) || isHole(m, f, m.back.blackBack)) errs.push("back rank crosses a hole");
  }
  return errs;
}
