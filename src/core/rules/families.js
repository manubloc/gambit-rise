// ── The TWO houses ────────────────────────────────────────────────────────────
// Every recruitable champion serves one of two sides; classic pieces and the
// Gambit stay unaligned. You may always mix freely — but the more you
// commit to one side, the stronger its gift grows:
//
//   crown  — the CROWN: order, law and light.
//            2+ fielded → SHIELD WALL: a crown piece standing orthogonally
//            beside crown kin takes 1 less damage (min 1)
//            4+ → every crown piece +1 max HP
//            6+ → the wall soaks 2
//            (the wall is LIVING: it weakens as the court falls)
//
//   shadow — the SHADOWS: night, hunger and stolen time.
//            2+ fielded → 1 TIME RIFT per match (your next move keeps the turn)
//            4+ → every shadow piece +1 attack, and a 2nd rift
//            6+ → a 3rd rift
//
// Family derives from the piece KIND so the core stays self-contained.
export const FAMILY_BY_KIND = {
  // the Crown — shields, banners, law and light-benders
  G: "crown", J: "crown", U: "crown", I: "crown", F: "crown",
  T: "crown", C: "crown", A: "crown", V: "crown", E: "crown",
  // the Shadows — killers, beasts and moonlit alchemy
  H: "shadow", S: "shadow", O: "shadow", D: "shadow", M: "shadow",
  L: "shadow", Z: "shadow", W: "shadow", Y: "shadow",
};

export const familyOf = (kindOrPiece) =>
  FAMILY_BY_KIND[(kindOrPiece && kindOrPiece.kind) || kindOrPiece] || null;

/** Crown ladder: wall soak for n fielded crown pieces (0 · 1 · 2). */
export const crownWallSoak = (n) => (n >= 6 ? 2 : n >= 2 ? 1 : 0);
/** Crown ladder: bonus max HP per crown piece. */
export const crownHp = (n) => (n >= 4 ? 1 : 0);
/** Shadow ladder: time rifts banked for the match. */
export const shadowRifts = (n) => (n >= 6 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0);
/** Shadow ladder: bonus attack per shadow piece. */
export const shadowAtk = (n) => (n >= 4 ? 1 : 0);

/** Count living family members of `color` on a board. */
export function familyCount(board, color, fam) {
  let n = 0;
  for (const p of board) if (p && p.color === color && familyOf(p) === fam) n += 1;
  return n;
}
