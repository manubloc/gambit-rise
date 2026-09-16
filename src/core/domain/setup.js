import { FILES, RANKS, WHITE, BLACK, KIND, idx, BASE_HP, BASE_ATK, SHIELD_HP, werteBeiStufe } from "./constants.js";
import { familyOf, crownHp, shadowAtk, shadowRifts } from "../rules/families.js";
import { emptyBoard, makePiece } from "./board.js";

// Default 10-wide back rank. Indices 2 and 7 are the "flank" slots that new
// unlocked characters can occupy (knights by default).
export const DEFAULT_BACK_RANK = [
  KIND.ROOK, KIND.KNIGHT, KIND.KNIGHT, KIND.BISHOP, KIND.QUEEN,
  KIND.KING, KIND.BISHOP, KIND.KNIGHT, KIND.KNIGHT, KIND.ROOK,
];
export const FLANK_SLOTS = [2, 7];

/** A plain level-1 army (no abilities, no shields). Progression enriches this. */
export function defaultArmy() {
  return {
    back: DEFAULT_BACK_RANK.map((kind) => ({ kind, level: 1, abilities: [], shield: 0 })),
    pawn: { kind: KIND.PAWN, level: 1, abilities: [], shield: 0 },
  };
}

// Default map = the classic 10×10 GAMBIT board (back ranks at the edges).
export const DEFAULT_MAP = {
  w: FILES, h: RANKS, holes: [],
  back: { whiteBack: 0, blackBack: RANKS - 1, whitePawn: 1, blackPawn: RANKS - 2 },
};

function placeBack(board, rank, color, specs, w, holes) {
  for (let f = 0; f < w; f++) {
    const i = idx(f, rank, w);
    if (holes.has(i) || !specs[f]) continue;       // null spec = the dragon's wing slot
    board[i] = makePiece({ ...specs[f], color });
  }
}
function placePawns(board, rank, color, spec, w, holes, hero = null) {
  // hero: { col, spec } — ONE pawn of this side is the Grand Gambit: own spec
  // (level/abilities/shield) and a `hero` flag the renderer and AI can read.
  // If his chosen file is a hole, he steps to the nearest open square.
  let heroCol = -1;
  if (hero) {
    const open = [];
    for (let f = 0; f < w; f++) if (!holes.has(idx(f, rank, w))) open.push(f);
    if (open.length) heroCol = open.reduce((a, b) => Math.abs(b - hero.col) < Math.abs(a - hero.col) ? b : a);
  }
  for (let f = 0; f < w; f++) {
    const i = idx(f, rank, w);
    if (holes.has(i)) continue;
    board[i] = f === heroCol ? makePiece({ ...hero.spec, color, hero: true }) : makePiece({ ...spec, color });
  }
}

/**
 * Build the initial game state from two armies on a given map. Armies are fully
 * resolved specs (kind/level/abilities/shield); the back rank length must equal
 * the map width. The engine never reads progression rules.
 */
export function createInitialState(whiteArmy = defaultArmy(), blackArmy = defaultArmy(), map = DEFAULT_MAP, rules = "chess") {
  const w = map.w, h = map.h;
  const holes = new Set((map.holes || []).map(([f, r]) => idx(f, r, w)));
  const board = emptyBoard(w * h);
  placeBack(board, map.back.whiteBack, WHITE, whiteArmy.back, w, holes);
  placePawns(board, map.back.whitePawn, WHITE, whiteArmy.pawn, w, holes, whiteArmy.hero || null);
  placePawns(board, map.back.blackPawn, BLACK, blackArmy.pawn, w, holes, blackArmy.hero || null);
  placeBack(board, map.back.blackBack, BLACK, blackArmy.back, w, holes);

  // ── THE BIG DRAGON unfolds: a spec with `big` claims a 2x2 block. The
  // anchor sits on the lower-left of the block; the neighbouring column's
  // piece and BOTH pawns in front make way (that is his price). If terrain
  // (holes/edges) forbids the block, he stays a humble 1x1 legacy dragon. ──
  for (let i = 0; i < board.length; i++) {
    const pc = board[i];
    if (!pc || pc.kind !== "D" || !pc.big || pc._unfolded) continue;
    const f = i % w, r = (i / w) | 0;
    const fn = f < w - 1 ? f + 1 : f - 1;                       // neighbour column, inward
    const rp = pc.color === WHITE ? r + 1 : r - 1;              // pawn rank in front
    const fa = Math.min(f, fn), ra = Math.min(r, rp);
    const a = idx(fa, ra, w);
    const cells = [a, a + 1, a + w, a + w + 1];
    const ok = fa >= 0 && fa <= w - 2 && ra >= 0 && ra <= h - 2 && cells.every((c) => !holes.has(c));
    if (!ok) { pc.big = false; continue; }
    for (const c of cells) if (c !== i) board[c] = null;        // the price: neighbour + two pawns
    board[i] = null;
    pc._unfolded = true;
    board[a] = pc;
    for (const c of cells) if (c !== a) board[c] = { kind: "D+", color: pc.color, ref: a };
  }

  // HP ruleset: give every piece hit points + attack power. A progression
  // "shield" charge folds into +max HP, so leveled pieces are simply tankier.
  const rifts = { w: 0, b: 0 };
  if (rules === "hp") {
    for (const p of board) {
      if (!p || p.kind === "D+") continue;  // wing markers share the dragon's life, not their own
      const lvl = p.level || 1;
      // the crowned head hardens FASTER: +2 HP per level (others +1) — a
      // leveled court must besiege the king, not burst him
      /* ── JEDE FIGUR WAECHST NACH IHRER EIGENEN ANLAGE (v1.7.0) ──────────
         Besitzerentscheid nach einer Messung ueber alle 27 Figuren: auf
         Stufe 1 liegen ihre Profile 36 Prozentpunkte auseinander, auf
         Hoechststufe nur noch 15. Die Figuren GLICHEN SICH AN, statt
         ausgepraegter zu werden.

         Der Grund war die feste Staffelung: jede bekam +1 Leben je Stufe,
         gleich viel fuer alle. Bei einem Bauern mit 2 Grundleben wiegt das
         schwer (Verdreifachung), bei einem Koenig mit 10 kaum. Nach neun
         Stufen war der Unterschied eingeebnet.

         Jetzt waechst jede Figur RELATIV zu ihrer Anlage: wer viel Leben hat,
         gewinnt mehr Leben dazu; wer stark angreift, mehr Angriff. Der Faktor
         ist so gewaehlt, dass die Gesamtstaerke ungefaehr bleibt wie bisher -
         es verschiebt sich die VERTEILUNG, nicht das Niveau. Ein Attentaeter
         wird damit spuerbar zum Angreifer, ein Waechter zum Fels. */
      const basisHp = p.baseHp ?? (BASE_HP[p.kind] || 1);
      const basisAtk = p.baseAtk ?? (BASE_ATK[p.kind] || 1);
      /* der gekroente Kopf haertet weiter schneller - er soll belagert, nicht
         aufgebrochen werden */
      const koenigsBonus = p.kind === KIND.KING ? 1.6 : 1;
      /* GEMESSEN UND JUSTIERT: mit 0,16 sank das mittlere Leben von 13,9 auf
         11,3 und der Angriff stieg - die Gefechte waeren spuerbar schneller
         geworden, ohne dass das jemand entschieden haette. Mit 0,22/0,20
         bleibt das Niveau (14,0 Leben, 7,6 Angriff im Mittel), und die Spanne
         der Profile waechst trotzdem von 15 auf 43 Prozentpunkte. Genau das
         war das Ziel: andere VERTEILUNG, gleiches Niveau. */
      /* v1.22.0: das ZIELPROFIL loest das relative Wachstum ab - jede Art
         laeuft linear von ihrem Grundwert auf ihr Ziel (ZIEL_PROFIL in
         constants.js). Eine Rechnung fuer Kern und Hofstaat: werteBeiStufe. */
      void koenigsBonus;
      const w = werteBeiStufe(p.kind, lvl, { baseHp: basisHp, baseAtk: basisAtk, maxLevel: p.maxLevel || undefined });
      p.maxHp = w.hp + (p.shield || 0) * SHIELD_HP;
      p.hp = p.maxHp;
      p.atk = w.atk;
      p.shield = 0;

    }
    /* ── JEDE FIGUR MERKT SICH IHR STARTFELD (v1.11.1) ──────────────────
       Gebraucht wird es bisher nur vom Sturm - die Amazone kehrt dorthin
       zurueck, statt zu fallen. Es kostet nichts und beantwortet eine Frage,
       die sonst niemand mehr beantworten kann: wo stand diese Figur am
       Anfang?

       Die Schleife darueber laeuft mit `for (const p of board)` und hat
       keinen Index - deshalb hier eine eigene, statt sie umzubauen. */
    for (let i = 0; i < board.length; i++) if (board[i]) board[i].startFeld = i;

    // ── the two houses: commitment pays ───────────────────────────────────────
    // crown kin harden together (4+ → +1 HP); shadows sharpen (4+ → +1 atk)
    // and bank time rifts (2/4/6 → 1/2/3). The crown's shield wall is LIVING —
    // it is read off the board at strike time, not stored here.
    for (const color of ["w", "b"]) {
      const kin = { crown: 0, shadow: 0 };
      for (const p of board) if (p && p.color === color) { const f = familyOf(p); if (f) kin[f] += 1; }
      const hpB = crownHp(kin.crown), atkB = shadowAtk(kin.shadow);
      for (const p of board) if (p && p.color === color) {
        const f = familyOf(p);
        if (f === "crown" && hpB) { p.maxHp += hpB; p.hp += hpB; }
        if (f === "shadow" && atkB) p.atk += atkB;
      }
      rifts[color] = shadowRifts(kin.shadow);
    }
    // ── boss auras: a fielded boss bends the WHOLE match, not just his square ─
    for (const color of ["w", "b"]) {
      for (const p of board) if (p && p.color === color && p.aura) {
        const a = p.aura;
        if (a.type === "courtHp") for (const q of board) if (q && q.color === color && q !== p) { q.maxHp += a.n || 1; q.hp += a.n || 1; }
        if (a.type === "courtAtk") for (const q of board) if (q && q.color === color && q !== p) q.atk += a.n || 1;
        if (a.type === "grant") for (const q of board) if (q && q.color === color && q !== p && !q.abilities.includes(a.id)) q.abilities = [...q.abilities, a.id];
      }
    }
  }

  return {
    board,
    w, h, holes,                // board geometry for this match (holes = blocked indices)
    rules,                      // "chess" (instant capture, checkmate) or "hp" (damage, regicide)
    turn: WHITE,
    potions: { w: 0, b: 0 },
    shifts: rifts,              // Time Rifts (magic circle): spend one to keep the turn after your next move
    shiftArmed: null,           // color that armed a rift for its upcoming move
    captured: { w: [], b: [] }, // piece kinds captured BY each color
    history: [],                // previous states, for undo
    lastMove: null,
    moveCount: 0,
    ohneSchaden: 0,           // Halbzuege ohne Schaden (HP-Remis)
  };
}
