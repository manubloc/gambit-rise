// Display + classification metadata for abilities. The actual MOVE/COMBAT logic
// lives in the engine (rules/moves.js, sim/transitions.js). Adding an ability =
// define it here + handle it there.
//   tag   groups abilities (drives colour + the small visual mark on a piece)
//   live  whether the mechanic is already wired up (false = shown as "bald")
//   once  one-shot per match (otherwise passive/repeatable)
//
// ── DREI SICHTBARKEITSSTUFEN, NICHT ZWEI (v1.0.42, Besitzerbefund) ─────────
// hpOnly war ein Schalter fuer zwei Zustaende, aber es gibt drei. Ausgezaehlt
// in Kapitel I (reines Schach): 20 von 26 Faehigkeiten waren aktiv - darunter
// Scharfschuss und Dauerfeuer, die im Zug DREIFACH verriegelt sind. Der
// Spieler sah also Faehigkeiten auf den Karten, die er nicht benutzen konnte.
//
//   sperre: (nichts)   WIRKT SOFORT - die Gangarten. Sie brauchen keine
//                      Lebenspunkte, sie aendern nur, wie eine Figur zieht.
//   sperre: "riegel"   SICHTBAR, ABER VERRIEGELT - die Karte zeigt sie mit
//                      Schloss und Grund. Der Spieler weiss, dass es sie gibt.
//   sperre: "verborgen" EXISTIERT NOCH NICHT - taucht nirgends auf, bis das
//                      Erwachen sie bringt. Das ist das alte hpOnly.
//
// hpOnly BLEIBT und bedeutet weiter "wirkt nur an Lebenspunkten" - das ist
// eine REGEL, keine Sichtbarkeit. Die sechs hpOnly-Talente sind zugleich
// verborgen; das steht jetzt ausdruecklich da, statt sich aus hpOnly zu
// ergeben.
export const TAGS = {
  move:    { nameDe: "Bewegung",   nameEn: "Movement", color: "#3d9bff" },
  ranged:  { nameDe: "Fernkampf",  nameEn: "Ranged",   color: "#ffb454" },
  blink:   { nameDe: "Sprung",     nameEn: "Blink",    color: "#a78bfa" },
  sustain: { nameDe: "Zähigkeit",  nameEn: "Sustain",  color: "#3ad98a" },
  aoe:     { nameDe: "Fläche",     nameEn: "Area",     color: "#ff8a4c" },
  control: { nameDe: "Kontrolle",  nameEn: "Control",  color: "#ff5d8f" },
  /* v1.25.2: eigene Marke fuer die Goldfaehigkeit der Monster. Ohne sie fiel
     ihre Farbe zufaellig mit dragon_flight2 zusammen - die Probe "alle Talente
     haben eine EIGENE Farbe" hat das gefangen. */
  gold:    { nameDe: "Beute",      nameEn: "Plunder",  color: "#e0b341" },
  dot:     { nameDe: "Zehrung",    nameEn: "Decay",    color: "#7bd14a" },
  promo:   { nameDe: "Krönung",    nameEn: "Promotion", color: "#ffd166" },
  trick:   { nameDe: "List",       nameEn: "Trickery",  color: "#e3c07a" },
};

export const ABILITIES = {
  // ── movement (live) ──
  pawn_sidestep:        { id: "pawn_sidestep",        icon: "↔", tag: "move", once: true,  live: true,  nameDe: "Ausweichen",   nameEn: "Sidestep",       descDe: "Darf 1× ein Feld zur Seite ziehen (ohne zu schlagen).", descEn: "Step one square sideways once (no capture)." },
  pawn_forward_capture: { id: "pawn_forward_capture", icon: "⤒", tag: "move", once: true,  live: true,  nameDe: "Stoßschlag",   nameEn: "Forward strike", descDe: "Darf 1× gerade nach vorn schlagen.",                  descEn: "Capture straight forward once." },
  pawn_charge:          { id: "pawn_charge",          icon: "⇈", tag: "move", once: false, live: true,  nameDe: "Sturmlauf",    nameEn: "Charge",         descDe: "Darf jederzeit zwei Felder vorrücken (Weg frei).",    descEn: "Advance two squares anytime (path clear)." },
  pawn_backstep:        { id: "pawn_backstep",        icon: "⇩", tag: "move", once: true,  live: true,  nameDe: "Rückzug",      nameEn: "Backstep",       descDe: "Darf 1× ein Feld zurückziehen.",                      descEn: "Retreat one square once." },
  dragon_flight:        { id: "dragon_flight",        icon: "🜁", tag: "wing",  once: true,  live: true, nameDe: "Fliegen", nameEn: "Flight",
    descDe: "EINMAL pro Partie springt der Drache als ganzer 2×2-Block bis zu 2 Felder weit. Landet er auf Gegnern, trifft er JEDES bedeckte Feld direkt — überleben nicht alle Getroffenen, fällt er auf sein Ursprungsfeld zurück (der Schlag zählt trotzdem).",
    descEn: "ONCE per game the dragon leaps as a full 2×2 block, up to 2 squares. Landing on foes strikes EVERY covered square directly - unless all struck foes fall, he is thrown back to where he took off (the strike still counts)." },
  dragon_flight2:       { id: "dragon_flight2",       icon: "🜁", tag: "wing",  once: false, live: true, nameDe: "Weite Schwingen", nameEn: "Wide wings",
    descDe: "Die Flug-Reichweite wächst auf 3 Felder.", descEn: "Flight range grows to 3 squares." },
  dragon_flight3:       { id: "dragon_flight3",       icon: "🜁", tag: "wing",  once: false, live: true, nameDe: "Sturmschwingen", nameEn: "Storm wings",
    descDe: "Die Flug-Reichweite wächst auf 4 Felder.", descEn: "Flight range grows to 4 squares." },
  pawn_early_promo:     { id: "pawn_early_promo",     icon: "★", tag: "promo", once: false, live: true, nameDe: "Frühe Krönung", nameEn: "Early crown",   descDe: "Wandelt eine Reihe früher um.",                       descEn: "Promotes one rank earlier." },
  knight_longleap:      { id: "knight_longleap",      icon: "⤢", tag: "move", once: false, live: true,  nameDe: "Weitsprung",   nameEn: "Long leap",      descDe: "Zusätzliche, weitere Springer-Sprünge.",              descEn: "Extra, longer knight jumps." },
  knight_outrider:      { id: "knight_outrider",      icon: "◆", tag: "move", once: false, live: true,  nameDe: "Vorreiter",    nameEn: "Outrider",       descDe: "Zusätzliche diagonale Weitsprünge.",                  descEn: "Extra diagonal long jumps." },
  bishop_hop:           { id: "bishop_hop",           icon: "⟿", tag: "move", once: true,  live: true,  nameDe: "Phase",        nameEn: "Phase",          descDe: "Darf 1× über eine angrenzende Figur springen.",       descEn: "Hop over one adjacent piece once." },
  bishop_ortho_step:    { id: "bishop_ortho_step",    icon: "✜", tag: "move", once: true,  live: true,  nameDe: "Wachschritt",  nameEn: "Guard step",     descDe: "Darf 1× ein Feld gerade ziehen.",                     descEn: "Step one square orthogonally once." },
  rook_diag_step:       { id: "rook_diag_step",       icon: "✛", tag: "move", once: false, live: true,  nameDe: "Sturmschritt", nameEn: "Storm step",     descDe: "Darf zusätzlich ein Feld diagonal ziehen.",           descEn: "Also step one square diagonally." },
  rook_breach:          { id: "rook_breach",          icon: "⊕", tag: "move", once: true,  live: true,  nameDe: "Durchbruch",   nameEn: "Breach",         descDe: "Darf 1× über eine angrenzende Figur springen.",       descEn: "Leap over one adjacent piece once." },
  queen_knightleap:     { id: "queen_knightleap",     icon: "✦", tag: "move", once: true,  live: true,  nameDe: "Hofsprung",    nameEn: "Court leap",     descDe: "Darf 1× wie ein Springer ziehen.",                    descEn: "Move like a knight once." },
  king_dash:            { id: "king_dash",            icon: "»", tag: "move", once: true,  live: true,  nameDe: "Königsflucht", nameEn: "King dash",      descDe: "Darf 1× zwei Felder gerade ziehen.",                  descEn: "Move two squares straight once." },

  // ── ranged (live) ──
  ranged_shot:          { id: "ranged_shot",          icon: "➶", tag: "ranged", sperre: "riegel", once: true,  live: true, nameDe: "Scharfschuss", nameEn: "Snipe",        descDe: "Trifft 1× eine Figur in Sichtlinie aus der Ferne — du bleibst stehen.", descEn: "Hit a piece in line of sight from afar once — you stay put." },
  ranged_volley:        { id: "ranged_volley",        icon: "⁂", tag: "ranged", sperre: "riegel", once: false, live: true, nameDe: "Dauerfeuer",   nameEn: "Volley",        descDe: "Darf jederzeit aus der Ferne in Sichtlinie schießen, ohne zu ziehen.", descEn: "May fire from afar in line of sight anytime, without moving." },

  // ── blink (live) ──
  gambit_masquerade:    { id: "gambit_masquerade",    icon: "🎭", tag: "trick", once: false, live: true, nameDe: "Maskerade",    nameEn: "Masquerade",    descDe: "Der Grand Gambit trägt kein Wappen mehr — für den Gegner ist er von jedem Bauern ununterscheidbar.", descEn: "The Grand Gambit sheds his crest — to the enemy he is indistinguishable from any pawn." },
  teleport:             { id: "teleport",             icon: "✸", tag: "blink", once: true,  live: true, nameDe: "Blinzeln",     nameEn: "Blink",         descDe: "Teleportiert 1× auf ein freies Feld in der Nähe.",     descEn: "Teleport to a nearby empty square once." },

  // ── sustain (live) ──
  lifesteal:            { id: "lifesteal",            icon: "❦", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false, live: true, nameDe: "Lebensraub",  nameEn: "Lifesteal",     descDe: "Heilt sich beim Schaden zufügen um die Hälfte des Schadens.", descEn: "Heals for half the damage it deals." },
  regen:                { id: "regen",                icon: "✚", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false, live: true, nameDe: "Regeneration", nameEn: "Regen",        descDe: "Heilt 1 HP, wann immer sie zieht.",                   descEn: "Heals 1 HP whenever it moves." },
  bulwark:              { id: "bulwark",              icon: "⛨", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false, live: true, nameDe: "Bollwerk",     nameEn: "Bulwark",       descDe: "Erleidet 1 Schaden weniger pro Treffer.",             descEn: "Takes 1 less damage per hit." },

  // ── upcoming (shown in the tree, mechanic rolling out) ──
  blast:                { id: "blast",                icon: "✺", tag: "aoe", hpOnly: true, sperre: "verborgen", once: true,  live: true, nameDe: "Schockwelle",  nameEn: "Blast",          descDe: "1× pro Partie: Der erste Nahkampfschlag trifft auch alle Gegner rings um das Ziel — mit halbem Schaden.",   descEn: "Once per battle: your first melee strike also hits every enemy around the target — at half damage." },
  chain:                { id: "chain",                icon: "↯", tag: "aoe", hpOnly: true, sperre: "verborgen", once: true,  live: false, nameDe: "Kettenblitz",  nameEn: "Chain",          descDe: "Schaden springt auf einen weiteren nahen Gegner über.", descEn: "Damage arcs to another nearby enemy." },
  pull:                 { id: "pull",                 icon: "⇲", tag: "control", hpOnly: true, sperre: "verborgen", once: true, live: false, nameDe: "Enterhaken",  nameEn: "Hook",           descDe: "Zieht einen Gegner in Sichtlinie zu dir heran.",      descEn: "Pulls an enemy in line toward you." },

  /* ── v1.25.2: DIE FAEHIGKEITEN DER MONSTER (Besitzerentscheid) ─────────────
     "Die Faehigkeiten, die die Monster haben, sollte grundsaetzlich keine der
      anderen Figuren haben - dass die Monster sich dadurch auszeichnen."

     GEMESSEN, warum es dafuer neue braucht: die vier, die Monster bisher
     tragen, gehoeren alle auch Figuren - Blinzeln bei 15 von 27, Bollwerk bei
     12, Regeneration bei 11, Lebensraub bei 9. Sie den Figuren wegzunehmen
     waere kein Umbau, sondern eine andere Leiter fuer das halbe Spiel. Also
     bekommen die Monster einen eigenen Satz.

     `live: false` heisst: die Wirkung ist noch nicht im Kern gebaut, der
     Eintrag steht aber schon, damit Blatt, Akademie und Karte denselben Text
     zeigen. Die Zuordnung zu den 25 Monstern folgt, sobald die Wirkung
     steht - vorher wuerde man ihnen ihre heutigen, funktionierenden
     Faehigkeiten nehmen und tote eintauschen. */
  gift:                 { id: "gift",                 icon: "☣", tag: "dot", hpOnly: true, sperre: "verborgen", once: false, live: false, monsterOnly: true, nameDe: "Gift",          nameEn: "Venom",          descDe: "Ein Treffer vergiftet: die Figur verliert jede Runde Leben, so viel wie die Stufe des Monsters.", descEn: "A hit poisons: the piece loses life every round, as much as the monster's level." },
  blenden:              { id: "blenden",              icon: "◍", tag: "control", hpOnly: true, sperre: "verborgen", once: false, live: false, monsterOnly: true, nameDe: "Blenden",       nameEn: "Blind",          descDe: "Zieht das Monster, sind alle Gegner im Umkreis von zwei Feldern eine Runde lang blind — sie duerfen nicht ziehen.", descEn: "When the monster moves, every enemy within two squares is blinded for a round — they cannot move." },
  aderlass:             { id: "aderlass",             icon: "🜄", tag: "dot", hpOnly: true, sperre: "verborgen", once: false, live: false, monsterOnly: true, nameDe: "Aderlass",      nameEn: "Bloodletting",   descDe: "Jeder Treffer nimmt der Figur 1 Hoechstleben — bis zum Ende der Partie.", descEn: "Every hit takes 1 maximum life from the piece — until the battle ends." },
  schrecken:            { id: "schrecken",            icon: "◬", tag: "control", hpOnly: true, sperre: "verborgen", once: false, live: false, monsterOnly: true, nameDe: "Schrecken",     nameEn: "Dread",          descDe: "Das Feld, das das Monster verlaesst, bleibt eine Runde unbetretbar.", descEn: "The square the monster leaves stays impassable for a round." },
  wegelagerei:          { id: "wegelagerei",          icon: "⛃", tag: "gold", hpOnly: true, sperre: "verborgen", once: false, live: true, monsterOnly: true, nameDe: "Wegelagerei",   nameEn: "Highway Robbery", descDe: "Jeder Treffer raubt dem Gegner Gold — 2, 4 oder 6 je nach Stufe. Abgerechnet wird nach der Partie.", descEn: "Every hit robs the opponent of gold — 2, 4 or 6 by tier. Settled after the battle." },
  steinhaut:            { id: "steinhaut",            icon: "⬢", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false,  live: true, monsterOnly: true, nameDe: "Steinhaut",     nameEn: "Stoneskin",      descDe: "Die ersten Treffer einer Partie prallen ab — einer auf Stufe I, zwei auf Stufe II.", descEn: "The first hits of a battle glance off — one at tier I, two at tier II." },
  widerhall:            { id: "widerhall",            icon: "↺", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false, live: true, monsterOnly: true, nameDe: "Widerhall",     nameEn: "Echo",           descDe: "Wer das Monster trifft, bekommt einen Teil des Schadens sofort zurück — ein Viertel, auf Stufe II die Hälfte. Das kann den Angreifer fällen.", descEn: "Whoever hits the monster takes part of the damage straight back — a quarter, half at tier II. It can fell the attacker." },
  unsterblich:          { id: "unsterblich",          icon: "✦", tag: "sustain", hpOnly: true, sperre: "verborgen", once: false,  live: true, monsterOnly: true, nameDe: "Unsterblich",   nameEn: "Undying",        descDe: "Einmal je Partie steht das Monster wieder auf — mit einem Viertel seiner Lebenspunkte, auf Stufe II mit der Hälfte.", descEn: "Once per battle the monster rises again — with a quarter of its life, half at tier II." },
  geistwandel:          { id: "geistwandel",          icon: "☁", tag: "sustain", hpOnly: true, sperre: "verborgen", once: true,  live: false, monsterOnly: true, nameDe: "Geistwandel",   nameEn: "Wraithing",      descDe: "Faellt das Monster, kehrt es als Geist zurueck: bleich und durchscheinend, mit 3 Leben und doppeltem Angriff.", descEn: "When the monster falls it returns as a wraith: pale and translucent, with 3 life and double attack." },
};

/* ── v1.28.0: WIE VIELE STUFEN EIN ZAUBER HAT (design/FAEHIGKEITEN-STUFEN.md)
   Stufe I: einmal je Partie, II: zweimal, III: dreimal. KEIN Zauber wird
   dauerhaft (Besitzer: "keine Figur, auch Gambit und Koenig, darf starke
   Faehigkeiten dauerhaft haben"). Maechtige Zauber enden bei II. Was nicht
   hier steht, hat eine Stufe; die Staerke-Stufen der Dauerfaehigkeiten
   (Lebensraub, Bollwerk ...) folgen gesondert. */
export const ZAUBER_STUFEN = {
  pawn_sidestep: 3, pawn_forward_capture: 3, pawn_backstep: 3, bishop_ortho_step: 3, king_dash: 3, ranged_shot: 3,
  bishop_hop: 2, rook_breach: 2, queen_knightleap: 2, teleport: 2, blast: 2,
};
/* ── v1.30.0: STAERKE-STUFEN. Was von selbst wirkt, waechst in seiner Staerke,
   nicht in der Haeufigkeit. Je Stufe ein kurzer Text - die Leiter zeigt ihn
   statt "N x je Partie". Die Zahl der Eintraege IST die Zahl der Stufen. */
export const STAERKE_STUFEN = {
  steinhaut:   { de: ["der erste Treffer prallt ab", "die ersten zwei Treffer prallen ab"],
                 en: ["the first hit glances off", "the first two hits glance off"] },
  widerhall:   { de: ["ein Viertel kommt zurück", "die Hälfte kommt zurück"],
                 en: ["a quarter comes back", "half comes back"] },
  unsterblich: { de: ["steht auf mit einem Viertel Leben", "steht auf mit der Hälfte"],
                 en: ["rises with a quarter of its life", "rises with half its life"] },
  wegelagerei: { de: ["2 Gold je Treffer", "4 Gold je Treffer", "6 Gold je Treffer"],
                 en: ["2 gold per hit", "4 gold per hit", "6 gold per hit"] },
};
export const maxStufe = (id) => ZAUBER_STUFEN[id] || (STAERKE_STUFEN[id] ? STAERKE_STUFEN[id].de.length : 1);
export const stufenText = (id, n, en = false) => (STAERKE_STUFEN[id]
  ? STAERKE_STUFEN[id][en ? "en" : "de"][Math.max(1, n) - 1]
  : (en ? `${n}× per battle` : `${n}× je Partie`));

/* WARUM eine Faehigkeit verriegelt ist - der Spieler soll es lesen koennen,
   nicht raten. Steht hier bei den Daten, damit Karte, Akademie und Blatt
   denselben Satz zeigen. */
export const SPERRGRUND = {
  riegel: {
    de: "Im reinen Schach nicht erlaubt — Reichweiten-Künste ruhen, bis der Riss sie weckt.",
    en: "Not allowed in pure chess — ranged arts rest until the Rift wakes them.",
  },
  verborgen: {
    de: "Braucht Lebenspunkte — kommt mit dem Erwachen.",
    en: "Needs hit points — arrives with the Awakening.",
  },
};

/** Der Zustand EINER Faehigkeit fuer den aktuellen Spielstand:
 *  "wirkt" | "riegel" | "verborgen".
 *  wach = ist das Erwachen durch? (meta/leveling: hpWach) */
/* ── EINE EIGENE FARBE JE TALENT (v1.4.0, Besitzerwunsch) ─────────────────
   "Besser waere sogar, wenn jede Faehigkeit eine eigene Farbe in dieser
   Darstellung bekommt, sodass ich sofort sehe, welche Faehigkeit welche Zuege
   ermoeglicht. Das waere das i-Tuepfelchen."

   Die ARTFARBE allein reicht dafuer nicht: eine Figur traegt oft zwei oder
   drei Talente derselben Art (der Springer hat drei Bewegungstalente), und
   die haetten dann alle dasselbe Blau. Deshalb bekommt jedes Talent eine
   eigene Stufe SEINER Artfarbe - sie bleibt erkennbar blau, orange oder
   gruen, aber die drei Blaus sind unterscheidbar.

   Gerechnet statt gelistet: die Art gibt den Grundton, die Position des
   Talents innerhalb seiner Art verschiebt Helligkeit und Saettigung. So
   bekommt auch ein spaeter ergaenztes Talent automatisch seine Farbe. */
const _FARBEN = new Map();
function _zuHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2;
  if (!d) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
function _ausHsl(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return "#" + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("");
}
export function talentFarbe(id) {
  if (_FARBEN.has(id)) return _FARBEN.get(id);
  const a = ABILITIES[id];
  if (!a) return "#8a84a8";
  const grund = (TAGS[a.tag] && TAGS[a.tag].color) || "#8a84a8";
  /* wie vielte ihrer Art ist sie? */
  const gleiche = Object.values(ABILITIES).filter((x) => x.id && x.tag === a.tag).map((x) => x.id).sort();
  const i = Math.max(0, gleiche.indexOf(id));
  const n = Math.max(1, gleiche.length);
  /* GEMESSEN: Helligkeit allein reicht nicht. Bei zwoelf Bewegungstalenten
     lagen die Farben bei #43abff und #41a4ff - zwei Stufen auseinander, mit
     blossem Auge nicht zu trennen. Deshalb wandert auch der FARBTON: bis zu
     30 Grad um den Grundton herum, plus Helligkeit. Damit bleibt Blau blau,
     aber aus einem Blau werden ein Himmelblau, ein Tuerkis und ein Indigo. */
  const [h0, s0, l0] = _zuHsl(grund);
  /* ZWEITE MESSUNG: 60 Grad Spreizung waren zu viel. Bei den nur ZWEI
     Fernkampftalenten wurde aus Orange einmal Rot (#f82719) und einmal Gelb
     (#f4fb88) - die Art war nicht mehr zu erkennen, und genau das soll die
     Farbe ja leisten. Die Spreizung haengt jetzt an der ANZAHL: zwei
     Geschwister ruecken 20 Grad auseinander, zwoelf bis zu 46. Dafuer traegt
     die Helligkeit mehr, sie veraendert den Farbcharakter nicht. */
  const spanne = Math.min(46, 10 * n);
  const mitte = n === 1 ? 0 : (i / (n - 1)) - 0.5;      // -0,5 .. +0,5
  const h = (h0 + mitte * spanne + 360) % 360;
  /* DRITTE MESSUNG: auch die Helligkeit muss an der Anzahl haengen. Bei zwei
     Geschwistern und fester Spanne wurde aus Orange ein Rotbraun und ein
     blasses Gelb. Jetzt: wenige Geschwister ruecken wenig auseinander. */
  const hSpanne = Math.min(0.30, 0.09 * n);
  const l = Math.max(0.34, Math.min(0.74, l0 + mitte * hSpanne));
  const sa = Math.max(0.5, Math.min(1, s0 - Math.abs(mitte) * 0.08));
  const farbe = _ausHsl(h, sa, l);
  _FARBEN.set(id, farbe);
  return farbe;
}

export function faehigkeitZustand(id, wach) {
  const a = ABILITIES[id];
  if (!a) return "verborgen";
  if (!a.sperre) return "wirkt";
  return wach ? "wirkt" : a.sperre;
}

/** Darf sie auf einer Karte ueberhaupt auftauchen? */
export const faehigkeitSichtbar = (id, wach) => faehigkeitZustand(id, wach) !== "verborgen";
