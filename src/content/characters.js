/* ── v1.29.0: FAEHIGKEITEN NACH BEWEGLICHKEIT (Besitzer, design/KAMPAGNE-
   AUFSTELLUNG.md). Wer stark zieht, traegt wenig: sehr bewegliche Figuren
   2 Faehigkeiten, mittlere 3, traege 4. Dame und Kapitelmeister sind
   ausgenommen. Die Bewegungsfaehigkeiten sind an die Art gebunden (moves.js),
   deshalb tragen Sonderfiguren nur die sechs allgemeinen: Scharfschuss,
   Blinzeln, Schockwelle, Lebensraub, Regeneration, Bollwerk. Zwei TOTE
   Faehigkeiten dabei gefunden und entfernt: Vorreiter beim Spaeher (wirkt nur
   bei Springern) und Hofsprung bei der Amazone (wirkt nur bei der Dame). */
/* ── v1.25.6: DIE SCHILDE SIND RAUS (Besitzerentscheid) ────────────────────
   "Schild ist also immer Leben. Aber das gibt es doch mit jeder Stufe. Ich
    glaub Schild ist unnoetig und doppelt."

   GEMESSEN, dass er recht hat: OHNE Schilde landet jede eigene Figur auf
   genau 24 Punkten - Alchemist 18+6, Amazone 9+15, Attentaeter 4+20,
   Bauer 17+7, Springer 11+13, Turm 18+6, Dame 14+10. Die Grundwerte aus den
   Stufen ergeben die Summe von sich aus. Die frueheren 28 entstanden nur
   daraus, dass fast jede Figur ZWEI Schildsprossen hatte, die je +2 Leben
   obendrauf legten - ein zweiter Weg zum selben Ziel.

   Deshalb sind alle Schildsprossen aus den Aufstiegsplaenen entfernt. Weil
   `shield` damit ueberall 0 ist, verschwinden die Schilde von selbst aus
   Anzeige, Lehrtexten, Bannern und aus der KI-Bewertung - ohne dass an
   vierzehn Stellen einzeln gerechnet werden muesste.

   NEBENWIRKUNG, die ein Gewinn ist: der Koenig ist kein Sonderfall mehr. Er
   war die EINZIGE Figur ohne Schilde und landete deshalb bei 24 statt 28 -
   daher sein unsichtbarer blauer Balken. Jetzt stimmt er mit allen ueberein.
*/
import { KIND } from "../core/index.js";

// Each character is a "card". `ladder` lists the reward at each level (>=2);
// level 1 is the base. A reward is { shield:+n } and/or { ability:"id" }.
// More powerful pieces get more abilities (pawn 4 … queen 10).
export const CHARACTERS = {
  pawn: {
    id: "pawn", kind: KIND.PAWN, glyph: "♟", nameDe: "Bauer", nameEn: "Pawn",
flavorDe: "Der erste Schritt jeder Schlacht — und öfter, als Lieder es zugeben, ihr letzter.", flavorEn: "The first step of every battle — and, more often than songs admit, its last.",
    unlock: { type: "start" }, flank: false,
    ladder: [
      { level: 3, ability: "pawn_sidestep" },
      { level: 5, ability: "pawn_charge" },
      { level: 6, ability: "pawn_forward_capture" },
      { level: 8, ability: "pawn_early_promo" },
    ],
  },
  gambit: {
    id: "gambit", kind: KIND.PAWN, glyph: "♟", nameDe: "Grand Gambit", nameEn: "Grand Gambit",
flavorDe: "Geboren, geopfert zu werden — entschlossen, es nicht zu bleiben.", flavorEn: "Born to be sacrificed — determined not to stay that way.",
    unlock: { type: "start" }, flank: false, epic: true, costValue: 380,
    // The pawn the whole tale is named after: raised to be offered — and to
    // walk further than anyone expects. Richer ladder than any common pawn.
    /* v1.0.43 (Besitzerentscheid): DIE ZWEITE SPROSSE TRAEGT JETZT DEN
       VORWAERTSSCHLAG. Der Held springt mit dem Erwachen auf Stufe 2 - und
       genau in diesem Moment soll man sehen, dass er kein Bauer mehr ist:
       nicht nur am Bild, sondern daran, was er KANN. Geradeaus schlagen ist
       das eine, was ein Bauer nie darf; das ist der sichtbarste Bruch, den
       eine Sprosse hergibt. Das Schild von Sprosse 2 rutscht dafuer auf 4,
       wo vorher der Vorwaertsschlag stand - die Leiter behaelt also ihre
       Summe, nur die Reihenfolge dreht sich. */
    ladder: [
      /* v1.34.0 (Besitzer): "nach der ersten Partie erwacht ein Bauer zum
         Gambit und bekommt SOFORT Sturmlauf (Stufe I 2 Felder, II 3, III 4)".
         Die Sprosse ist GESCHENKT: sie kostet nichts, wird nicht gelernt und
         ist nicht vergessbar - aufstufen laesst sie sich wie jede andere.
         Vorher stand sie auf Stufe 5 und kostete Punkte; wer sie so gelernt
         hat, bekommt den Preis zurueck (profile.js, geschenkteErstattet). */
      { level: 1, ability: "pawn_charge", geschenkt: true },
      { level: 2, ability: "pawn_forward_capture" },
      { level: 3, ability: "pawn_sidestep" },
      /* v1.26.5 (Besitzer): "mach beim Gambit auch nur 5 Faehigkeiten, grundsaetzlich
         nicht mehr als 5." Blinzeln faellt - es ist die staerkste der sechs
         und steckt ohnehin bei 15 anderen Figuren; der Held wird dadurch
         unverwechselbarer statt schwaecher, weil Stossschlag und Ausweichen
         bei ihm jetzt dauerhaft wirken. */
      { level: 8, ability: "gambit_masquerade" },
      { level: 9, ability: "pawn_early_promo" },
    ],
  },
  knight: {
    id: "knight", kind: KIND.KNIGHT, glyph: "♞", nameDe: "Springer", nameEn: "Knight",
flavorDe: "Reitet Winkel, die keine Mauer je bedacht hat.", flavorEn: "Rides angles no wall was ever built for.",
    unlock: { type: "start" }, flank: true,
    ladder: [{ level: 3, ability: "knight_longleap" }, { level: 6, ability: "knight_outrider" }],
  },
  bishop: {
    id: "bishop", kind: KIND.BISHOP, glyph: "♝", nameDe: "Läufer", nameEn: "Bishop",
flavorDe: "Sieht die Welt nur schräg — und trifft sie deshalb umso genauer.", flavorEn: "Sees the world only aslant — and strikes it all the truer.",
    unlock: { type: "start" }, flank: false,
    ladder: [{ level: 3, ability: "bishop_hop" }, { level: 6, ability: "bishop_ortho_step" }],
  },
  rook: {
    id: "rook", kind: KIND.ROOK, glyph: "♜", nameDe: "Turm", nameEn: "Rook", flank: true,
flavorDe: "Eine wandernde Festung mit schlechter Laune.", flavorEn: "A walking fortress in a foul mood.",
    unlock: { type: "start" },
    ladder: [{ level: 3, ability: "rook_diag_step" }, { level: 6, ability: "rook_breach" }],
  },
  queen: {
    id: "queen", kind: KIND.QUEEN, glyph: "♛", nameDe: "Dame", nameEn: "Queen",
flavorDe: "Der Hof flüstert, sie führe den König. Der Hof flüstert leise.", flavorEn: "The court whispers she commands the king. The court whispers quietly.",
    unlock: { type: "start" }, flank: false,
    ladder: [
      { level: 3, ability: "queen_knightleap" },
      { level: 4, ability: "ranged_shot" },
      { level: 5, ability: "teleport" },
    ],
  },
  king: {
    id: "king", kind: KIND.KING, glyph: "♚", nameDe: "König", nameEn: "King",
flavorDe: "Fällt er, fällt alles — also fällt er nicht.", flavorEn: "If he falls, everything falls — so he does not.",
    unlock: { type: "start" }, flank: false,
    // Kings never get shields (keeps chess-mode check/mate logic clean).
    ladder: [
      { level: 2, ability: "king_dash" },
      { level: 3, ability: "teleport" },
      { level: 4, ability: "bulwark" },
      { level: 5, ability: "regen" },
    ],
  },
  archbishop: {
    id: "archbishop", kind: KIND.ARCHBISHOP, glyph: null, nameDe: "Erzbischof", nameEn: "Archbishop",
flavorDe: "Predigt Vergebung und nimmt die Beichte gleich selbst ab.", flavorEn: "Preaches forgiveness and hears the confession himself.",
    unlock: { type: "boss" }, flank: true,
    ladder: [{ level: 3, ability: "bishop_hop" }, { level: 6, ability: "bishop_ortho_step" }],
  },
  chancellor: {
    id: "chancellor", kind: KIND.CHANCELLOR, glyph: null, nameDe: "Kanzler", nameEn: "Chancellor",
flavorDe: "Verwaltet das Reich — und im Exil seine Rache.", flavorEn: "Administers the realm — and, in exile, his revenge.",
    unlock: { type: "boss" }, flank: true,
    ladder: [{ level: 3, ability: "rook_diag_step" }, { level: 6, ability: "rook_breach" }],
  },
  hawk: {
    id: "hawk", kind: KIND.HAWK, glyph: null, nameDe: "Späher", nameEn: "Hawk",
flavorDe: "Kein Pfad, den er nicht zweimal gegangen wäre, bevor du ihn einmal siehst.", flavorEn: "No path he hasn't walked twice before you see it once.",
    unlock: { type: "boss" }, flank: true,
    ladder: [{ level: 3, ability: "teleport" }, { level: 6, ability: "ranged_shot" }],
  },
  amazon: {
    id: "amazon", kind: KIND.AMAZON, glyph: null, nameDe: "Amazone", nameEn: "Amazon",
flavorDe: "Niemand fordert sie zweimal heraus.", flavorEn: "Nobody challenges her twice.",
    unlock: { type: "boss" }, flank: true,
    ladder: [{ level: 3, ability: "ranged_shot" }, { level: 6, ability: "teleport" }],
  },

  // ── Boss-unlocked specialists (movement is data-driven via moveSpec) ────────
  captain: {
    id: "captain", kind: KIND.CAPTAIN, glyph: "⚓", nameDe: "Kapitän", nameEn: "Captain",
flavorDe: "Hält Kurs, wo die Karten enden.", flavorEn: "Holds course where the maps end.",
    unlock: { type: "boss" }, flank: true,
    // Sea legs: strides three straight, steps one diagonal — and can hook foes in.
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1]], range: 3, leaps: [[1,1],[1,-1],[-1,1],[-1,-1]] },
    ladder: [{ level: 3, ability: "ranged_shot" }, { level: 6, ability: "blast" }, { level: 9, ability: "bulwark" }],
  },
  assassin: {
    id: "assassin", kind: KIND.ASSASSIN, glyph: "🗡", nameDe: "Attentäter", nameEn: "Assassin",
flavorDe: "Rechnet in Schritten, zahlt in Stille.", flavorEn: "Counts in steps, pays in silence.",
    unlock: { type: "boss" }, flank: true,
    /* Attentaeter, Magier und Warlock bleiben ABSICHTLICH farbgebunden: sie
       sind die Laeufer-Familie dieses Spiels, und die Bindung an eine
       Feldfarbe ist deren aeltestes, lesbarstes Merkmal. Ihre Kuenste
       (Teleport, Fernschuss) oeffnen die andere Farbe spaeter ohnehin. */
    moveSpec: { leaps: [[1,1],[1,-1],[-1,1],[-1,-1],[2,2],[2,-2],[-2,2],[-2,-2]] },
    ladder: [{ level: 3, ability: "teleport" }, { level: 5, ability: "lifesteal" }, { level: 7, ability: "ranged_shot" }, { level: 9, ability: "blast" }],
  },
  guardian: {
    id: "guardian", kind: KIND.GUARDIAN, glyph: "🛡", nameDe: "Schildträger", nameEn: "Guardian",
flavorDe: "Sein Schild hat mehr Schlachten gesehen als mancher General.", flavorEn: "His shield has seen more battles than most generals.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1]], range: 2 },
    ladder: [{ level: 3, ability: "bulwark" }, { level: 5, ability: "regen" }, { level: 7, ability: "lifesteal" }, { level: 9, ability: "teleport" }],
  },
  dragon: {
    id: "dragon", kind: KIND.DRAGON, glyph: "🐉", nameDe: "Drache", nameEn: "Dragon",
flavorDe: "Jung, gierig und fest überzeugt, dass alles Gold ihm gehört.", flavorEn: "Young, greedy, and firmly convinced all gold is his.",
    // THE BIG ONE: he claims a 2x2 block on the board. Deploying him costs
    // the neighbouring piece and both pawns in front. On foot he shifts the
    // whole block one square (forward, sideways or back) and crushes a foe
    // caught under his leading edge — and once per game, the wings carry him.
    unlock: { type: "boss" }, flank: true, big: true, costValue: 860,
    ladder: [
      { level: 3, ability: "dragon_flight" },
      /* v1.37.0: Fliegen II und III sind STUFEN derselben Faehigkeit (aufstufen
         ab Stufe 5 und 7), keine eigenen Sprossen mehr. Wer sie gelernt hatte,
         behaelt sie als Stufe (profile.js, fliegenZusammengelegt). */
    ],
  },
  mage: {
    id: "mage", kind: KIND.MAGE, glyph: "✨", nameDe: "Magier", nameEn: "Mage",
flavorDe: "Dreißig Jahre Studium — jetzt kommt die Prüfung.", flavorEn: "Thirty years of study — now comes the exam.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,1],[1,-1],[-1,1],[-1,-1]], range: 2 },
    ladder: [{ level: 3, ability: "ranged_shot" }, { level: 5, ability: "teleport" }, { level: 7, ability: "blast" }, { level: 9, ability: "lifesteal" }],
  },
  sorceress: {
    id: "sorceress", kind: KIND.SORCERESS, glyph: "🔮", nameDe: "Hexerin", nameEn: "Sorceress",
flavorDe: "Der Sturm fragt sie um Erlaubnis.", flavorEn: "The storm asks her permission.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { leaps: [[-2,-2],[-1,-2],[0,-2],[1,-2],[2,-2],[-2,-1],[2,-1],[-2,0],[2,0],[-2,1],[2,1],[-2,2],[-1,2],[0,2],[1,2],[2,2]] },
    ladder: [{ level: 3, ability: "teleport" }, { level: 6, ability: "ranged_shot" }, { level: 9, ability: "lifesteal" }],
  },
  seeress: {
    id: "seeress", kind: KIND.SEERESS, glyph: null, nameDe: "Vesna, die Seherin", nameEn: "Vesna the Seeress",
flavorDe: "Sie hat das Ende jeder Partie gesehen — sie spielt nur mit, um zu erfahren, wie es sich anfühlt.", flavorEn: "She has seen the end of every game - she only plays to learn how it feels.",
    // the CROWN's seer: her gift is the foresight itself (see hasForesight) —
    // the shadow's counterpart is the hawk. On the board she is a gentle
    // mystic: queen-lines, two squares of reach.
    unlock: { type: "boss" }, flank: true, costValue: 420,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], range: 2 },
    ladder: [{ level: 3, ability: "teleport" }, { level: 6, ability: "ranged_shot" }],
  },
  alchemist: {
    id: "alchemist", kind: KIND.ALCHEMIST, glyph: "⚗", nameDe: "Alchemist", nameEn: "Alchemist",
flavorDe: "Hat den Pass gesprengt. Aus Versehen. Zweimal.", flavorEn: "Blew up the pass. By accident. Twice.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], range: 1, leaps: [[0,2],[0,-2],[2,0],[-2,0]] },
    ladder: [{ level: 3, ability: "regen" }, { level: 5, ability: "lifesteal" }, { level: 7, ability: "bulwark" }, { level: 9, ability: "ranged_shot" }],
  },
  warlock: {
    id: "warlock", kind: KIND.WARLOCK, glyph: "🜏", nameDe: "Warlock", nameEn: "Warlock",
flavorDe: "Sein Preis war hoch. Er verrät nicht, wofür.", flavorEn: "His price was steep. He won't say for what.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,1],[1,-1],[-1,1],[-1,-1]], range: 3 },
    ladder: [{ level: 3, ability: "lifesteal" }, { level: 5, ability: "ranged_shot" }, { level: 7, ability: "teleport" }, { level: 9, ability: "blast" }],
  },
  paladin: {
    id: "paladin", kind: KIND.PALADIN, glyph: "⚔", nameDe: "Paladin", nameEn: "Paladin",
flavorDe: "Sein Eid wiegt schwerer als seine Rüstung.", flavorEn: "His oath weighs more than his armor.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1]], range: 2, leaps: [[1,1],[1,-1],[-1,1],[-1,-1]] },
    ladder: [{ level: 3, ability: "bulwark" }, { level: 5, ability: "regen" }, { level: 7, ability: "lifesteal" }, { level: 9, ability: "teleport" }],
  },
  inquisitor: {
    id: "inquisitor", kind: KIND.INQUISITOR, glyph: "✠", nameDe: "Inquisitor", nameEn: "Inquisitor",
flavorDe: "Stellt eine Frage. Nur eine.", flavorEn: "Asks one question. Only one.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1]], range: 3 },
    ladder: [{ level: 3, ability: "ranged_shot" }, { level: 5, ability: "bulwark" }, { level: 7, ability: "lifesteal" }, { level: 9, ability: "blast" }],
  },
  bard: {
    id: "bard", kind: KIND.BARD, glyph: "🎵", nameDe: "Barde", nameEn: "Bard",
flavorDe: "Singt von deinen Siegen — die Gage verhandelt er vorher.", flavorEn: "Sings of your victories — the fee is agreed beforehand.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]], range: 1, leaps: [[2,2],[2,-2],[-2,2],[-2,-2]] },
    ladder: [{ level: 3, ability: "regen" }, { level: 6, ability: "bulwark" }, { level: 9, ability: "teleport" }],
  },
  engineer: {
    id: "engineer", kind: KIND.ENGINEER, glyph: "⚙", nameDe: "Techniker", nameEn: "Engineer",
flavorDe: "Repariert alles außer seinen Ruf.", flavorEn: "Fixes everything except his reputation.",
    unlock: { type: "boss" }, flank: true,
    /* v1.0.50: DER SCHLIMMSTE FALL der Abdeckungsanalyse. Nur gerade und
       diagonale ZWEIERspruenge - das haelt ihn auf einem 2x2-Untergitter
       fest: 25 von 100 Feldern, drei Viertel des Bretts fuer immer
       unerreichbar. Der gerade Einzelschritt loest das Gitter auf. */
    moveSpec: { leaps: [[0,2],[0,-2],[2,0],[-2,0],[2,2],[2,-2],[-2,2],[-2,-2],[1,0],[-1,0],[0,1],[0,-1]] },
    ladder: [{ level: 3, ability: "ranged_shot" }, { level: 5, ability: "bulwark" }, { level: 7, ability: "blast" }, { level: 9, ability: "teleport" }],
  },
  standard: {
    id: "standard", kind: KIND.STANDARD, glyph: "🚩", nameDe: "Flaggenträger", nameEn: "Standard Bearer",
flavorDe: "Wo sein Banner steht, weicht keiner.", flavorEn: "Where his banner stands, nobody yields.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { leaps: [[1,0],[-1,0],[0,1],[0,-1],[0,2],[0,-2],[2,0],[-2,0]] },
    ladder: [{ level: 3, ability: "bulwark" }, { level: 5, ability: "regen" }, { level: 7, ability: "teleport" }, { level: 9, ability: "lifesteal" }],
  },
  strategist: {
    id: "strategist", kind: KIND.STRATEGIST, glyph: "🧭", nameDe: "Stratege", nameEn: "Strategist",
flavorDe: "Hat diese Partie schon gestern gewonnen.", flavorEn: "Won this game yesterday.",
    unlock: { type: "boss" }, flank: true,
    moveSpec: { slides: [[1,0],[-1,0],[0,1],[0,-1]], range: 2, leaps: [[2,2],[2,-2],[-2,2],[-2,-2]] },
    ladder: [{ level: 3, ability: "teleport" }, { level: 6, ability: "ranged_shot" }, { level: 9, ability: "bulwark" }],
  },
  pathfinder: {
    id: "pathfinder", kind: KIND.PATHFINDER, glyph: "🧿", nameDe: "Kundschafter", nameEn: "Pathfinder",
flavorDe: "Kennt den Weg. Auch den, den es nicht gibt.", flavorEn: "Knows the way. Even the one that doesn't exist.",
    unlock: { type: "boss" }, flank: true,
    /* v1.0.50: dieselbe Kamel-Falle wie beim Hetzer - 50 von 100 Feldern, kein
       Nahzugriff. Fuer eine SPIELERfigur doppelt aergerlich. Der gerade
       Einzelschritt kommt dazu; die Kamel-Weite bleibt sein Kennzeichen. */
    moveSpec: { leaps: [[1,3],[3,1],[-1,3],[-3,1],[1,-3],[3,-1],[-1,-3],[-3,-1],[1,0],[-1,0],[0,1],[0,-1]] },
    ladder: [{ level: 3, ability: "regen" }, { level: 6, ability: "teleport" }, { level: 9, ability: "bulwark" }],
  },
};

export const CHARACTER_LIST = Object.values(CHARACTERS);
// Standard back-rank slots map a kind to its character id.
export const KIND_TO_CHAR = { P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king", A: "archbishop", C: "chancellor", H: "hawk", M: "amazon" };
