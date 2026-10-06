import { FILES, NUM_SQUARES, fileOf, rankOf } from "./constants.js";

let _id = 1;
export const newId = () => _id++;

/**
 * A piece carries its character LEVEL, its unlocked ABILITIES (ids) and its
 * remaining SHIELD charges. `used` tracks one-shot abilities spent this game.
 * @param {{kind:string,color:string,level?:number,abilities?:string[],shield?:number}} spec
 */
export function makePiece(spec) {
  const spawn = spec.spawn ?? spec.moveSpec?.spawn; // budget may live on the moveSpec
  return {
    id: newId(),
    kind: spec.kind,
    color: spec.color,
    level: spec.level ?? 1,
    abilities: spec.abilities ? [...spec.abilities] : [],
    shield: spec.shield ?? 0,
    ...(spec.hero ? { hero: true } : {}),
    /* v1.0.62: DER RANG KOMMT JETZT AN. heroSpec und die Bauern-Specs setzen
       tier, aber diese Fabrik hat es bis heute verworfen - am Brett stand
       darum immer Rang 1. Ein Feld, das die Bildwahl (paintedRoh) und die
       Groessenstaffel (paintedFitFor) gleichermassen speist. */
    ...(spec.tier ? { tier: spec.tier } : {}),
    ...(spec.big ? { big: true } : {}),   // the 2x2 dragon
    /* v1.91.0: WER IST DIESE FIGUR? Die Buende (core/rules/buende.js) suchen
       ihre Mitglieder ueber `charId` - aber weder die Heeres-Specs noch diese
       Fabrik trugen das Feld. Gemessen am 6.10.2026: von den Figuren eines
       echten Heeres hatte KEINE eine `charId`; der Paladin stand neben dem
       Koenig, der Koenig nahm den vollen Treffer. Alle zehn Buende waren im
       Spiel stumm, und die Proben merkten es nicht, weil sie `charId` von
       Hand setzten. Art (`kind`) reicht nicht: Bauer und Gambit teilen "P". */
    ...(spec.charId ? { charId: spec.charId } : {}),
    /* v1.28.0: die Stufen der Zauber (Faehigkeit -> 1..3), aus dem Profil */
    ...(spec.stufen && Object.keys(spec.stufen).length ? { stufen: { ...spec.stufen } } : {}),
    used: {},
    hasMoved: false,
    // Optional extensions (bosses & special units) — copied verbatim when given.
    ...(spec.moveSpec ? { moveSpec: spec.moveSpec } : {}),
    ...(spec.aura ? { aura: spec.aura } : {}),
    ...(spec.bossId ? { bossId: spec.bossId } : {}),
    ...(spawn ? { spawnLeft: spawn.max ?? spawn } : {}),
    ...(spec.hp != null ? { baseHp: spec.hp } : {}),
    ...(spec.atk != null ? { baseAtk: spec.atk } : {}),
    ...(spec.art ? { art: spec.art } : {}),
    ...(spec.accent ? { accent: spec.accent } : {}),
    ...(spec.name ? { name: spec.name } : {}),
    ...(spec.bossId ? { bossId: spec.bossId } : {}),
  };
}

export const emptyBoard = (n = NUM_SQUARES) => new Array(n).fill(null);

export function clonePiece(p) {
  return p && { ...p, abilities: [...(p.abilities || [])], used: { ...(p.used || {}) } }; // wing markers travel lean
}
export function cloneBoard(board) {
  return board.map(clonePiece);
}

export function findKing(board, color, w = FILES) {
  for (let i = 0; i < board.length; i++) {
    const p = board[i];
    if (p && p.color === color && p.kind === "K") return { i, f: fileOf(i, w), r: rankOf(i, w) };
  }
  return null;
}
