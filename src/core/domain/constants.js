// Board geometry. Change FILES/RANKS to resize — the whole engine is size-agnostic.
/* v1.24.0: DAS BRETT IST 8x8 (Besitzerentscheid, siehe content/maps.js).
   Die Maschine bleibt massunabhaengig - w/h kommen aus der Karte; diese
   beiden Zahlen sind nur noch der Standard, wenn keine Karte danebensteht. */
export const FILES = 8;
export const RANKS = 8;
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

/* ── DAS ZIELPROFIL JEDER FIGUR AUF DER HOECHSTSTUFE (v1.22.0) ────────────────
   Besitzerentscheid: "Die sind alle viel zu nah beieinander. Es darf welche
   geben mit ganz viel Leben und kaum Angriff, und welche mit ganz viel
   Angriff, die auf einen Schlag kaputt sind - 5 Leben und 19 Angriff ist
   absolut valide. Je variantenreicher, desto spannender."

   Gemessen vorher (relatives Wachstum 0,22/0,20): Blauanteil 16 % (Koenig)
   bis 55 % (Attentaeter) - der Attentaeter mit 9 Leben ueberlebte zwei
   Treffer. Jetzt hat jede Art ein ZIEL [Leben, Angriff] auf der
   Hoechststufe; das Wachstum laeuft linear vom Grundwert dorthin, sodass das
   Profil auf jeder Stufe schon zu erkennen ist. Das Budget (Leben + Angriff)
   bleibt je Rang etwa, wo es war - es verschiebt sich die VERTEILUNG.

   Rollen: Bollwerk 13-25 % Blau (Koenig, Drache, Schildtraeger, Paladin,
   Flaggentraeger, Alchemist, Turm) - Standhaft 30-40 % (Bauer, Barde,
   Techniker, Seherin, Erzbischof, Kapitaen) - Ausgewogen 42-56 % (Stratege,
   Laeufer, Dame, Kanzler, Inquisitor, Springer, Kundschafter) - Klinge
   63-82 % (Hexerin, Spaeher, Amazone, Magier, Warlock, Attentaeter).
   Der Attentaeter faellt auf einen Schlag - er ist im Schatten unsichtbar. */
/* v1.22.2 (Besitzer, Klarstellung): JEDE FIGUR HAT DASSELBE BUDGET. "Wir
   vergeben immer 100 Punkte, egal welcher Figur, und teilen sie auf - mal
   80/20, mal 50/50, hoechstens 90/10." Das Budget ist hier 24 (Leben +
   Angriff auf der Hoechststufe); nur der DRACHE hat das Doppelte, 48, weil er
   vier Felder einnimmt und langsam ist - eine Mauer. Die Verhaeltnisse aus
   v1.22.0 sind erhalten, die Budgets angeglichen: vorher streuten sie von 10
   (Bauer) bis 46 (Koenig). */
export const BUDGET_HOECHSTSTUFE = 24;
export const BUDGET_DRACHE = 48;
/* v1.29.0 (Besitzer): "bei Figuren, die springen koennen, ist eine sehr hohe
   Angriffsstaerke zu gefaehrlich." Springer 11/13 -> 16/8, Kanzler 12/12 ->
   15/9, Spaeher 9/15 -> 15/9, Amazone 9/15 -> 18/6. Nachgemessen mit reifen Heeren (tools/balance.mjs
   reif): Vesna 15/9 -> 17/7, Erzbischof 15/9 -> 17/7. Die Summe bleibt 24. */
export const ZIEL_PROFIL = {
  K: [21, 3], D: [41, 7], G: [20, 4], F: [19, 5], U: [18, 6], L: [18, 6], R: [18, 6], P: [17, 7], J: [16, 8], T: [16, 8], SE: [17, 7], A: [17, 7], V: [14, 10], Y: [14, 10], B: [14, 10], Q: [14, 10], C: [15, 9], I: [13, 11], N: [16, 8], O: [10, 14], Z: [9, 15], H: [15, 9], M: [18, 6], E: [8, 16], W: [5, 19], S: [4, 20],
};
export const HOECHSTSTUFE = 10;

/* Leben und Angriff einer Art auf einer Stufe - EINE Rechnung fuer Kern,
   Hofstaat und Blatt. Extra-Grundwerte (Dupes) verschieben das Ziel mit. */
/* `punkte`: das Gesamtmass, das die Figur auf ihrer Hoechststufe erreichen
   soll (v1.25.7). Ohne Angabe bleibt es beim Grundprofil - das ergibt seit dem
   Wegfall der Schilde bei jeder normalen Figur genau NORM_PUNKTE. Der Held
   bekommt HELD_PUNKTE hereingereicht: sein Vorsprung ist damit EINE ZAHL an
   EINER Stelle, statt wie frueher in neun Schildsprossen versteckt zu sein.
   Skaliert wird das ZIEL, nicht der Startwert - die Kurve bleibt also ihre,
   nur das Ende liegt hoeher, und die Verteilung zwischen Leben und Angriff
   bleibt unveraendert. */
export function werteBeiStufe(kind, lvl, { baseHp = null, baseAtk = null, maxLevel = HOECHSTSTUFE, punkte = null } = {}) {
  const b0 = BASE_HP[kind] || 1, a0 = BASE_ATK[kind] || 1;
  const basisHp = baseHp ?? b0, basisAtk = baseAtk ?? a0;
  const ziel = ZIEL_PROFIL[kind];
  const t = (Math.max(1, lvl) - 1) / Math.max(1, maxLevel - 1);
  if (!ziel) return { hp: Math.round(basisHp + (lvl - 1) * 0.22 * basisHp), atk: Math.round(basisAtk + (lvl - 1) * 0.20 * basisAtk) };
  let zielHp = ziel[0] + (basisHp - b0), zielAtk = ziel[1] + (basisAtk - a0);
  if (punkte && zielHp + zielAtk > 0) {
    /* GEMESSEN: beim Helden ergibt 17/7 mal 1,5 genau 25,5 und 10,5 - beide
       runden auf und die Summe waere 37 statt 36. Deshalb wird das Leben
       gerundet und der Angriff als REST gebildet: so trifft das Ziel immer
       auf den Punkt, und Rot und Blau beruehren sich auf der Hoechststufe. */
    const f = punkte / (zielHp + zielAtk);
    zielHp = Math.round(zielHp * f);
    zielAtk = punkte - zielHp;
  }
  return { hp: Math.max(1, Math.round(basisHp + t * (zielHp - basisHp))), atk: Math.max(1, Math.round(basisAtk + t * (zielAtk - basisAtk))) };
}
/* HP-Remis: bleiben so viele HALBZUEGE ohne jeden Schaden, endet die Partie
   unentschieden. 120 Halbzuege = 60 Zuege je Seite. Zaehler springt auf 0,
   sobald Schaden faellt, jemand stirbt oder ein Boss nachschafft. */
export const HP_REMIS_HALBZUEGE = 120;
/* ── v1.25.6: DIE PUNKTENORM (Besitzerentscheid "alle 24, Gambit 36,
   Drache 48") ──────────────────────────────────────────────────────────────
   Jede Figur erreicht auf ihrer Hoechststufe dieselbe Summe aus Leben und
   Angriff - nur anders verteilt. Der Held darf mehr, weil er der Held ist;
   der Drache, weil er vier Felder einnimmt und sein Grundprofil ihn ohnehin
   dorthin bringt. */
export const NORM_PUNKTE = 24;
export const HELD_PUNKTE = 36;
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
