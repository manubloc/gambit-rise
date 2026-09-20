/* ── v1.25.1: DAS PUNKTEBUDGET DER MONSTER (Besitzerentscheid) ─────────────
   "Hauptsache wir haben am Ende die gleiche Logik wie bei den Figuren."

   GEMESSEN, warum das noetig war: jede eigene Figur kommt auf ihrer
   Hoechststufe auf 28 Punkte (Leben + Angriff) - Bauer 21+7, Turm 22+6,
   Springer 15+13, Dame 18+10, Koenig 25+3. Die Monster lagen zwischen 8 und
   23, Median 13. Ein Monster war also im Schnitt halb so stark wie ein Bauer,
   und zwar ohne dass das irgendwo entschieden worden waere.

   v1.25.5, Besitzerentscheid nach der Schildfrage: die Norm ist 24, nicht 28.
   Ohne die Schilde landet naemlich JEDE eigene Figur bei genau 24 Punkten -
   die 28 entstanden nur, weil fast jede zwei Schildsprossen hat, die je
   +2 Leben obendrauf legten. Mit 28 lagen die Monster ueber den Figuren.
   Jetzt tragen alle 25 dieselben 24 Punkte. Die VERTEILUNG bleibt, wie sie
   war: wer dick und langsam gemalt ist, bleibt dick und langsam - der Koloss
   24/4, der Geist 17/11, der Brandstifter 16/12. Gerechnet wurde
   hp_neu = round(28 * hp_alt / (hp_alt + atk_alt)), atk_neu = 28 - hp_neu.
   Alle 25 werden dadurch staerker, keines schwaecher.

   Ihr Gegengewicht bleibt, was der Besitzer dafuer vorgesehen hat: nur fuenf
   Stufen statt zehn, keine Leiter zum Waehlen, kein Bund - dafuer kauft man
   sie und ist schnell am Ziel. */
// ── End bosses ────────────────────────────────────────────────────────────────
// Every boss brings ONE unique piece (kind "X") whose movement the player does
// NOT know in advance — it must be observed. Movement is data-driven via a
// `moveSpec` the engine executes: `leaps` (single jumps), `slides` (rays with
// optional `range`), and `spawn` (create a pawn on an empty adjacent square
// while charges last). Stats trade off for balance: huge HP with tiny reach,
// glass cannons, summoners with almost no HP, and everything between.
// Bosses replace the enemy QUEEN slot, so their side never has queen + boss.

// Symmetric offset helpers.
const sym = (a, b) => { // all sign/swap combinations of (a,b), deduped
  const out = new Set();
  for (const [x, y] of [[a, b], [b, a]])
    for (const sx of [1, -1]) for (const sy of [1, -1]) out.add(`${x * sx},${y * sy}`);
  return [...out].map((s) => s.split(",").map(Number)).filter(([x, y]) => !(x === 0 && y === 0));
};
const ORTHO = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const KING = [...ORTHO, ...DIAG];
const KNIGHT = sym(1, 2);
const CAMEL = sym(1, 3);
const ZEBRA = sym(2, 3);
const RING2 = (() => { const o = []; for (let f = -2; f <= 2; f++) for (let r = -2; r <= 2; r++) if (Math.max(Math.abs(f), Math.abs(r)) === 2) o.push([f, r]); return o; })();

const B = (id, nameDe, nameEn, art, accent, hp, atk, moveSpec, extra = {}) =>
  ({ id, nameDe, nameEn, art, accent, hp, atk, moveSpec, abilities: extra.abilities || [], aura: extra.aura || null, hintDe: extra.hintDe, hintEn: extra.hintEn, flavorDe: extra.flavorDe, flavorEn: extra.flavorEn });

/* ── DIE GABEN DER BESTIEN (v0.38) ────────────────────────────────────────
 * Jedes Wesen traegt seit v0.38 die Gabe seiner FAMILIE - dieselben Regeln,
 * die auch der Hof kennt, von der Engine fuer jede Figur ausgespielt:
 *   golem   -> bulwark   (Stein schluckt den ersten Punkt jedes Schlags)
 *   beast   -> regen     (wildes Fleisch heilt einen Punkt je Zug)
 *   serpent -> lifesteal (Gift trinkt die Haelfte des Schadens als Leben)
 *   wraith  -> teleport  (Schemen blinzeln auf ein nahes leeres Feld)
 *   tyrant  -> je nach Rolle: Panzer oder Zaehigkeit, meist mit Aura
 * BALANCE-GEGENGEWICHTE: bulwark vervielfacht die effektiven HP gegen
 * schwache Angreifer (eff = hp * atk/(atk-1) bei atk>=2) - deshalb sinken
 * die Grund-HP der neuen Panzertraeger. Alle Werte sind ueber
 * messe_monster.mjs simuliert (Feldwirkung je Gabe, Grenzwerte je Kapitel).
 */
export const BOSSES = [
  B("b01", "Der Wächter",      "The Warden",      "golem",   "#8fb4ff", 20, 4, { slides: KING, range: 1 }, { flavorDe: "Er stand schon Wache, als die Mauer noch ein Wall aus Erde war — und blieb, als alle gingen.", flavorEn: "He stood guard when the wall was still a bank of earth — and stayed when everyone left.", abilities: ["bulwark"] }),  // 12->9: Panzer-Gegengewicht
  /* v1.0.50 (Besitzerbefund, per Abdeckungsanalyse bestaetigt): Der Hetzer
     sprang NUR Kamel-Weiten (1,3). Die sind farbgebunden - er erreichte 50
     von 100 Feldern und konnte eine ANGRENZENDE Figur niemals schlagen. Ein
     Jaeger, der nichts Nahes fangen kann, und ein Boss, dem man auf der
     falschen Feldfarbe einfach entgeht. Dazu kommt der gerade Einzelschritt:
     jetzt deckt er das ganze Brett, und die Weite bleibt sein Wesen. */
  B("b02", "Der Hetzer",       "The Harrier",     "beast",   "#ffb454",  17, 7, { leaps: [...CAMEL, ...ORTHO] }, { flavorDe: "Was er einmal wittert, holt er ein; kein Umweg ist ihm zu weit, kein Fels zu steil.", flavorEn: "What he scents once he runs down; no detour is too far, no rock too steep.", abilities: ["regen"] }),  // 9->7: heilt fortan
  B("b03", "Die Brutmutter",   "The Broodmother", "serpent", "#3ad98a",  21, 3, { slides: KING, range: 1, spawn: { max: 4 } }, { flavorDe: "Sie zählt ihre Brut nicht — sie zählt, was von den Eindringlingen übrig bleibt.", flavorEn: "She does not count her brood — she counts what is left of the intruders.", abilities: ["lifesteal"] }),  // atk 1: trinkt kaum
  B("b04", "Der Schleicher",   "The Prowler",     "wraith",  "#a78bfa",  17, 7, { slides: DIAG, range: 2, leaps: ORTHO }, { flavorDe: "Man hört ihn nie kommen; man merkt nur irgendwann, dass die Tür offen steht.", flavorEn: "You never hear him come; you only notice, at some point, that the door stands open.", abilities: ["teleport"] }),
  B("b05", "Der Streuner",     "The Prowler",     "beast",   "#ff8a4c",  17, 7, { leaps: ZEBRA }, { flavorDe: "Er gehört niemandem und keinem Ort — er folgt dem Riss wie andere dem Wasser.", flavorEn: "He belongs to no one and no place — he follows the rift as others follow water.", abilities: ["regen"] }),  // 9->8
  /* v1.0.50: Das Bollwerk schob sich NUR diagonal - farbgebunden, 50 von 100
     Feldern, und eine gerade angrenzende Figur war fuer immer unerreichbar.
     Ausgerechnet eine MAUER, die nicht geradeaus kann. Jetzt schiebt sie
     sich orthogonal: volles Brett, langsamster Boss bleibt sie trotzdem -
     und der Waechter (b01, alle acht Richtungen) bleibt klar der andere. */
  B("b06", "Das Bollwerk",     "The Bulwark",     "golem",   "#9aa5b7", 21, 3, { slides: ORTHO, range: 1 }, { flavorDe: "Man baute es, um etwas fernzuhalten. Niemand weiß mehr, was — es selbst weiß es noch.", flavorEn: "It was built to keep something out. No one remembers what — it still does.", abilities: ["bulwark"] }),  // 18->11: Kapitel-I-Grenze (12 Schlaege atk-2)
  B("b07", "Der Geist",        "The Ghost",       "wraith",  "#7dd3fc",  15, 9, { leaps: RING2 }, { flavorDe: "Er ist der Rest eines Eides, der nicht sterben durfte, ehe er erfüllt war.", flavorEn: "He is the remnant of an oath that was not allowed to die before it was kept.", abilities: ["teleport"] }),  // Glaskanone, jetzt fluechtig
  B("b08", "Kanonier",         "Cannoneer",       "golem",   "#ffd166", 16, 8, { slides: ORTHO, range: 3 }, { flavorDe: "Er zählt bis drei und die Mauer fällt; er hat nie weiter zählen müssen.", flavorEn: "He counts to three and the wall falls; he has never needed to count further.", aura: { type: "courtHp", n: 2 }, abilities: ["bulwark"] }),  // 10->9
  B("b09", "Skorpion",         "Scorpion",        "serpent", "#f472b6",  16, 8, { leaps: [...sym(2, 2), ...ORTHO] }, { flavorDe: "Sein Stich schmerzt nicht sofort — das ist das Heimtückische daran.", flavorEn: "His sting does not hurt at once — that is the treachery of it.", abilities: ["lifesteal"] }),
  B("b10", "Doppelritter",     "Twin Knight",     "beast",   "#3d9bff", 19, 5, { leaps: [...KNIGHT, ...KING] }, { flavorDe: "Zwei Köpfe, ein Wille: Wo einer täuscht, beißt der andere.", flavorEn: "Two heads, one will: where one feints, the other bites.", aura: { type: "wardAdj" }, abilities: ["regen"] }),
  B("b11", "Die Flüsterin",    "The Whisperer",   "wraith",  "#c4b5fd",  20, 4, { slides: KING, range: 1, spawn: { max: 2 } }, { flavorDe: "Sie spricht mit dem Riss, und der Riss antwortet in Dingen, die dann geschehen.", flavorEn: "She speaks with the rift, and the rift replies in things that then come to pass.", abilities: ["teleport"] }),  // spawn 3->2: Blink + Brut kombinierte auf +19 Feldwirkung; HP-Senkung war wirkungslos (sie steht hinten), die Brut ist der Hebel
  B("b12", "Der Richter",      "The Judge",       "tyrant",  "#ffb454", 19, 5, { slides: KING, range: 2 }, { flavorDe: "Sein Urteil ist gefällt, ehe der Fall beginnt — die Verhandlung ist die Vollstreckung.", flavorEn: "His verdict is set before the case begins — the trial is the execution.", aura: { type: "noEnemyPotions" }, abilities: ["bulwark"] }),  // 12->11
  /* b13 bleibt ABSICHTLICH farbgebunden: unbegrenzte Diagonalen sind die
     Laeufer-Verwandtschaft, die jeder Schachspieler kennt und einzuschaetzen
     weiss. Die Bindung ist hier kein Fehler, sondern Lesbarkeit. */
  B("b13", "Brandstifter",     "Firestarter",     "serpent", "#ff4d5e",  14, 10, { slides: DIAG }, { flavorDe: "Er sammelt keine Beute; er hinterlässt nur Asche, ordentlich verteilt.", flavorEn: "He gathers no spoils; he leaves only ash, evenly spread.", abilities: ["lifesteal"] }),  // scharf, aber glas
  B("b14", "Der Koloss",       "The Colossus",    "golem",   "#94a3b8", 21, 3, { slides: ORTHO, range: 2, leaps: DIAG }, { flavorDe: "Er trägt die Rüstung nicht — er ist sie, bis hinunter zum Herzen aus Stein.", flavorEn: "He does not wear the armour — he is it, down to the heart of stone.", aura: { type: "grant", id: "bulwark" } }),  // seine AURA ist die Gabe: Eigenpanzer + Panzer-Aura kaskadierte in der Sim (+77 Feldwirkung)
  B("b15", "Die Sturmklaue",   "The Stormclaw",   "beast",   "#38bdf8",  16, 8, { leaps: [...CAMEL, ...sym(0, 3)] }, { flavorDe: "Sie kommt mit dem Wetter und geht mit ihm; dazwischen liegt der Schaden.", flavorEn: "She comes with the weather and leaves with it; the damage lies between.", abilities: ["regen"] }),
  B("b16", "Die Blutmagd",     "The Bloodmaid",   "serpent", "#fb7185", 17, 7, { slides: KING, range: 1, leaps: [[0, 2], [0, -2]] }, { flavorDe: "Aus dem Lazarett verschwand erst der Aderlass, dann die Magd. Was der Riss aus ihr machte, windet sich noch immer um sein Werk.", flavorEn: "First the bloodletting vanished from the infirmary, then the maid. What the Rift made of her still coils around its work.", aura: { type: "grant", id: "lifesteal" }, abilities: ["lifesteal"] }),
  B("b17", "Lanzenmeister",    "Lancemaster",     "tyrant",  "#eab308", 19, 5, { leaps: [...sym(0, 2), ...KING] }, { flavorDe: "Zehntausend Stöße, jeden Morgen; der elfte gilt dir.", flavorEn: "Ten thousand thrusts, every morning; the eleventh is for you.", aura: { type: "wardAdj" }, abilities: ["regen"] }),  // der Feldherr haelt sich
  B("b18", "Eisenfaust",       "Ironfist",        "golem",   "#f97316", 18, 6, { slides: ORTHO }, { flavorDe: "Was seine Faust einmal hält, gehört der Faust — so einfach ist sein Gesetz.", flavorEn: "What his fist once holds belongs to the fist — his law is that simple.", aura: { type: "courtAtk", n: 1 }, abilities: ["bulwark"] }),  // 13->11
  B("b19", "Schattenfürst",    "Shadowlord",      "wraith",  "#a78bfa",  16, 8, { slides: DIAG, leaps: KNIGHT }, { flavorDe: "Sein Reich beginnt, wo die Lampen enden; er hat Geduld mit jedem Docht.", flavorEn: "His realm begins where the lamps end; he has patience with every wick.", aura: { type: "courtAtk", n: 1 }, abilities: ["teleport"] }),
  B("b20", "Der Hüter",        "The Keeper",      "tyrant",  "#34d399", 21, 3, { slides: KING, range: 1, leaps: sym(0, 2) }, { flavorDe: "Er bewacht keine Tür — er bewacht das Nein, das dahinter wohnt.", flavorEn: "He guards no door — he guards the No that lives behind it.", aura: { type: "courtHp", n: 2 }, abilities: ["bulwark"] }),
  B("b21", "Die Wandlerin",    "The Shifter",     "wraith",  "#f0abfc",  17, 7, { leaps: RING2, spawn: { max: 2 } }, { flavorDe: "Frag nicht, wie sie wirklich aussieht; sie hat die Antwort selbst vergessen.", flavorEn: "Do not ask what she truly looks like; she has forgotten the answer herself.", abilities: ["teleport"] }),  // die Wandlerin wandelt
  B("b22", "Der Zerreißer",    "The Render",      "beast",   "#ef4444", 16, 8, { leaps: [...KNIGHT, ...CAMEL] }, { flavorDe: "Man erkennt sein Werk am Rand: nichts ist geschnitten, alles gerissen.", flavorEn: "You know his work by the edges: nothing cut, everything torn.", abilities: ["regen"] }),
  B("b23", "Asra, die Erzfeindin", "Asra, the Archenemy",   "tyrant",  "#fbbf24", 18, 6, { slides: KING, range: 3 }, { flavorDe: "Vom Hof blieb ihr nichts als der Name. Der Riss gab ihr Stacheln dafür — und einen Groll, der durch Rüstungen wächst.", flavorEn: "Nothing of the court is left to her but the name. The Rift gave her thorns in its place — and a grudge that grows through armour.", abilities: ["regen"] }),
  B("b24", "Seuchenkönig",     "Plaguelord",      "serpent", "#84cc16",  20, 4, { slides: KING, range: 1, spawn: { max: 5 } }, { flavorDe: "Wo er hoftritt, keimt es falsch; seine Gefolgschaft wächst ihm aus dem Boden nach.", flavorEn: "Where he treads, things sprout wrong; his following grows after him out of the ground.", abilities: ["lifesteal"] }),
  B("b25", "Osric, der Großmeister", "Osric, the Grandmaster", "tyrant", "#ffd166", 19, 5, { slides: KING, range: 4, leaps: KNIGHT }, { flavorDe: "Er hat nie eine Partie beendet — seine Gegner haben nur aufgehört zu ziehen.", flavorEn: "He has never finished a game — his opponents merely stopped moving.", aura: { type: "courtHp", n: 1 }, abilities: ["bulwark"] }),
];

export const bossById = (id) => BOSSES.find((b) => b.id === id) || null;

/** The ten LEAGUE BOSSES — the finale of each league (I–X). Beating a league
 *  wins you its boss: he may then march for YOU, in place of the queen (one
 *  boss at most). Every league boss carries an AURA that bends the whole
 *  match, not just his square. */
// v0.38.1: OSRIC GEHOERT ANS ENDE. Die Liste begann mit b25 - der
// Grossmeister stand als Finale von KAPITEL I, waehrend Kapitel XII mit
// Asra endete, die dort zusaetzlich als Station stand (Doppelung). Jetzt:
// aufsteigend, die Erzfeindin als vorletztes Finale, Osric EINMAL - im
// letzten Kapitel, in der letzten Festung.
export const LEAGUE_BOSSES = ["b12", "b10", "b02", "b19", "b20", "b16", "b17", "b18", "b08", "b14", "b23", "b25"];
export const leagueBossId = (league) => LEAGUE_BOSSES[(((league || 1) - 1) % 12)];
export const bossName = (b, en) => (en ? b.nameEn : b.nameDe);

/** Army-spec entry for a boss piece (drops into a back-rank slot). */
export function bossSpec(b) {
  return { kind: "X", level: 1, abilities: b.abilities || [], shield: 0,
    hp: b.hp, atk: b.atk, moveSpec: b.moveSpec, art: b.art, accent: b.accent,
    aura: b.aura || null, name: { de: b.nameDe, en: b.nameEn }, bossId: b.id };
}
