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

/* ── v1.26.0: JEDES MONSTER HAT EINEN AUFSTIEGSPLAN (Besitzerentscheid) ────
   "Ich moechte die Bedienung des Monsterfensters genau gleich - und
    dementsprechend musst du diese zwei Faehigkeiten auf die fuenf Stufen
    verteilen."
   Bisher standen die Faehigkeiten eines Monsters fest und waren von Anfang an
   da; eine Leiter gab es nicht. Jetzt traegt jedes Monster denselben Plan wie
   eine eigene Figur, nur kuerzer: fuenf Stufen, die erste Faehigkeit auf
   Stufe 2, die zweite auf Stufe 4. Hat ein Monster heute nur eine (das ist
   bei allen so, bis die neun Monstertalente im Kern wirken), bekommt die
   zweite Sprosse vorerst nichts - der Platz steht schon, damit das Fenster
   und die Bedienung sich nicht mehr aendern muessen, wenn die Talente kommen.
   Das Feld `abilities` bleibt bestehen: es ist das, was das Monster auf
   Hoechststufe kann, und daraus wird der Plan abgeleitet. */
/* ── v1.32.0: DIE MONSTER TRAGEN IHREN EIGENEN SATZ (Besitzer, nach Tabelle
   freigegeben). Die vier Familiengaben (Bollwerk, Regeneration, Lebensraub,
   Blinzeln) bleiben den Figuren; die Monster tragen nur noch die neun
   Monsterfaehigkeiten. Wie viele, folgt der Beweglichkeit (Felder von d4 auf
   leerem Brett; wer Brut legt, eine Stufe tiefer):
     gewoehnliche Monster: 16 Felder 1 - 12..14 Felder 2 - 8 Felder 3 -
                           Bollwerk (4 Felder) 4
     Kapitelmeister:       I-IV 3 - V-VIII 4 - IX-XII 5 (duerfen verschieden
                           stark sein, vom Ausgleich ausgenommen)
   BRUT (Besitzer: "5 Bauern ist zuviel"): Seuchenkoenig 3 (vorher 5),
   Brutmutter 2 (vorher 4), Fluesterin 1 (vorher 2). Gestaffelt, weil die drei
   gleich ziehen (Koenigsschritt + Brut) und sich NUR in der Zahl der Bauern
   unterscheiden - jedes Monster braucht einen eigenen Zug (test_boss). Die
   Wandlerin springt anders und bleibt bei 2.
   GEMESSEN (npm run balance, reife Heere) und danach DREI getauscht: Geist,
   Wandlerin und Sturmklaue lagen mit der Tabelle bei 72-73 %. Der Geistwandel
   war der Grund - ohne ihn 50/52 %, mit ihm 68/73 %: ein zweiter Koerper ist
   bei einem Monster, das 16 Felder weit springt, zu viel wert (auch ein Geist
   mit 1 Leben und einfachem Angriff brachte noch ~10 Punkte). Er bleibt bei
   den langsameren Schemen (Schleicher, Fluesterin) und den Meistern.
     Geist: Geistwandel -> Blenden (46 %)
     Wandlerin: Geistwandel -> Schrecken (54-59 %)
     Sturmklaue: Blenden, Widerhall -> Blenden, Wegelagerei (52 %)
   Die ZAHL der Faehigkeiten folgt weiter der Beweglichkeit.
   DIE LEITER verteilt die Faehigkeiten ueber die fuenf Monsterstufen:
     1 -> Stufe 2 | 2 -> 2, 4 | 3 -> 2, 3, 4 | 4 -> 2..5 | 5 -> 1..5 */
const MONSTER_SPROSSEN = { 1: [2], 2: [2, 4], 3: [2, 3, 4], 4: [2, 3, 4, 5], 5: [1, 2, 3, 4, 5] };
export const monsterSprossen = (n) => MONSTER_SPROSSEN[Math.max(1, Math.min(5, n))] || [];
const bossLadder = (abilities) => (abilities.length ? monsterSprossen(abilities.length) : [])
  .map((level, i) => (abilities[i] ? { level, ability: abilities[i] } : null)).filter(Boolean);
const B = (id, nameDe, nameEn, art, accent, hp, atk, moveSpec, extra = {}) =>
  ({ id, nameDe, nameEn, art, accent, hp, atk, moveSpec, abilities: extra.abilities || [],
     ladder: bossLadder(extra.abilities || []),
     aura: extra.aura || null, hintDe: extra.hintDe, hintEn: extra.hintEn, flavorDe: extra.flavorDe, flavorEn: extra.flavorEn });

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
  B("b01", "Der Wächter",      "The Warden",      "golem",   "#8fb4ff", 20, 4, { slides: KING, range: 1 }, { flavorDe: "Er stand schon Wache, als die Mauer noch ein Wall aus Erde war — und blieb, als alle gingen.", flavorEn: "He stood guard when the wall was still a bank of earth — and stayed when everyone left.", abilities: ["steinhaut", "schrecken", "widerhall"] }),  // 12->9: Panzer-Gegengewicht
  /* v1.0.50 (Besitzerbefund, per Abdeckungsanalyse bestaetigt): Der Hetzer
     sprang NUR Kamel-Weiten (1,3). Die sind farbgebunden - er erreichte 50
     von 100 Feldern und konnte eine ANGRENZENDE Figur niemals schlagen. Ein
     Jaeger, der nichts Nahes fangen kann, und ein Boss, dem man auf der
     falschen Feldfarbe einfach entgeht. Dazu kommt der gerade Einzelschritt:
     jetzt deckt er das ganze Brett, und die Weite bleibt sein Wesen. */
  B("b02", "Der Hetzer",       "The Harrier",     "beast",   "#ffb454",  17, 7, { leaps: [...CAMEL, ...ORTHO] }, { flavorDe: "Was er einmal wittert, holt er ein; kein Umweg ist ihm zu weit, kein Fels zu steil.", flavorEn: "What he scents once he runs down; no detour is too far, no rock too steep.", abilities: ["blenden", "aderlass"] }),  // 9->7: heilt fortan
  B("b03", "Die Brutmutter",   "The Broodmother", "serpent", "#3ad98a",  21, 3, { slides: KING, range: 1, spawn: { max: 2 } }, { flavorDe: "Sie zählt ihre Brut nicht — sie zählt, was von den Eindringlingen übrig bleibt.", flavorEn: "She does not count her brood — she counts what is left of the intruders.", abilities: ["gift", "unsterblich"] }),  // atk 1: trinkt kaum
  B("b04", "Der Schleicher",   "The Prowler",     "wraith",  "#a78bfa",  17, 7, { slides: DIAG, range: 2, leaps: ORTHO }, { flavorDe: "Man hört ihn nie kommen; man merkt nur irgendwann, dass die Tür offen steht.", flavorEn: "You never hear him come; you only notice, at some point, that the door stands open.", abilities: ["geistwandel", "schrecken"] }),
  B("b05", "Der Streuner",     "The Stray",       "beast",   "#ff8a4c",  17, 7, { leaps: ZEBRA }, { flavorDe: "Er gehört niemandem und keinem Ort — er folgt dem Riss wie andere dem Wasser.", flavorEn: "He belongs to no one and no place — he follows the rift as others follow water.", abilities: ["blenden", "gift", "wegelagerei"] }),  // 9->8
  /* v1.0.50: Das Bollwerk schob sich NUR diagonal - farbgebunden, 50 von 100
     Feldern, und eine gerade angrenzende Figur war fuer immer unerreichbar.
     Ausgerechnet eine MAUER, die nicht geradeaus kann. Jetzt schiebt sie
     sich orthogonal: volles Brett, langsamster Boss bleibt sie trotzdem -
     und der Waechter (b01, alle acht Richtungen) bleibt klar der andere. */
  B("b06", "Das Bollwerk",     "The Bulwark",     "golem",   "#9aa5b7", 21, 3, { slides: ORTHO, range: 1 }, { flavorDe: "Man baute es, um etwas fernzuhalten. Niemand weiß mehr, was — es selbst weiß es noch.", flavorEn: "It was built to keep something out. No one remembers what — it still does.", abilities: ["steinhaut", "widerhall", "unsterblich", "schrecken"] }),  // 18->11: Kapitel-I-Grenze (12 Schlaege atk-2)
  B("b07", "Der Geist",        "The Ghost",       "wraith",  "#7dd3fc",  15, 9, { leaps: RING2 }, { flavorDe: "Er ist der Rest eines Eides, der nicht sterben durfte, ehe er erfüllt war.", flavorEn: "He is the remnant of an oath that was not allowed to die before it was kept.", abilities: ["blenden"] }),  // Glaskanone, jetzt fluechtig
  B("b08", "Kanonier", "Cannoneer", "golem", "#a3adb8", 16, 8, { slides: ORTHO, range: 3 }, { flavorDe: "Er zählt bis drei und die Mauer fällt; er hat nie weiter zählen müssen.", flavorEn: "He counts to three and the wall falls; he has never needed to count further.", abilities: ["wegelagerei", "steinhaut"] }),
  B("b09", "Skorpion",         "Scorpion",        "serpent", "#c9a24a",  16, 8, { leaps: [...sym(2, 2), ...ORTHO] }, { flavorDe: "Sein Stich schmerzt nicht sofort — das ist das Heimtückische daran.", flavorEn: "His sting does not hurt at once — that is the treachery of it.", abilities: ["gift", "aderlass", "schrecken"] }),
  /* b10 (Doppelritter) ist mit v1.91.0 gestrichen (Besitzer 6.10.2026: "Der Doppelritter muss weg.
     Ersetze ihn durch den schwarzen Ritter"). Die Kennung wird NIE neu vergeben - alte Spielstaende
     fuehren sie; die Wanderung in meta/profile.js raeumt sie aus und erstattet. */
  B("b11", "Die Flüsterin",    "The Whisperer",   "wraith",  "#c4b5fd",  20, 4, { slides: KING, range: 1, spawn: { max: 1 } }, { flavorDe: "Sie spricht mit dem Riss, und der Riss antwortet in Dingen, die dann geschehen.", flavorEn: "She speaks with the rift, and the rift replies in things that then come to pass.", abilities: ["geistwandel", "gift"] }),  // spawn 3->2: Blink + Brut kombinierte auf +19 Feldwirkung; HP-Senkung war wirkungslos (sie steht hinten), die Brut ist der Hebel
  B("b12", "Der Richter", "The Judge", "tyrant", "#ffb454", 19, 5, { slides: KING, range: 2 }, { flavorDe: "Sein Urteil ist gefällt, ehe der Fall beginnt — die Verhandlung ist die Vollstreckung.", flavorEn: "His verdict is set before the case begins — the trial is the execution.", abilities: ["schrecken"] }),
  /* b13 bleibt ABSICHTLICH farbgebunden: unbegrenzte Diagonalen sind die
     Laeufer-Verwandtschaft, die jeder Schachspieler kennt und einzuschaetzen
     weiss. Die Bindung ist hier kein Fehler, sondern Lesbarkeit.
     v1.90.19 (Besitzerentscheid 1.10.: "Brandstifter blau"): er und die
     Blutmagd (b16) waren zwei rote Schlangen mit Rueckenkamm, am Brett
     kaum zu unterscheiden; die Blutmagd bleibt blutrot. Das Gemaelde ist per tools/umfaerben.py
     (218 Grad, Glutaugen bleiben, Saettigung 0,85) blau gedreht, der
     Akzent folgt (#ff4d5e -> #4d7cff; v1.90.27: wieder Feuer, #ff5a1f). Die roten Originale liegen in
     archiv/ausgemustert/v1.90.19/.
     v1.90.20 (Besitzer: "noch heller" ist die Grundlage): die umgefaerbten
     Flaechen tragen die doppelte Leuchtdichte (umfaerben.py ... 1.0 2.0),
     Figurfarbe nachgemessen #2f439e. */
  B("b13", "Brandstifter",     "Firestarter",     "serpent", "#ff5a1f",  14, 10, { slides: DIAG }, { flavorDe: "Er sammelt keine Beute; er hinterlässt nur Asche, ordentlich verteilt.", flavorEn: "He gathers no spoils; he leaves only ash, evenly spread.", abilities: ["aderlass", "gift"] }),  // scharf, aber glas
  B("b14", "Der Rissbrocken", "The Riftboulder", "golem", "#a855f7", 21, 3, { slides: ORTHO, range: 1, leaps: sym(0, 2) }, { flavorDe: "Er trägt die Rüstung nicht — er ist sie, bis hinunter zum Herzen aus Stein.", flavorEn: "He does not wear the armour — he is it, down to the heart of stone.", abilities: ["steinhaut", "widerhall", "unsterblich"] }),
  B("b15", "Die Sturmklaue",   "The Stormclaw",   "beast",   "#38bdf8",  16, 8, { leaps: [...CAMEL, ...sym(0, 3)] }, { flavorDe: "Sie kommt mit dem Wetter und geht mit ihm; dazwischen liegt der Schaden.", flavorEn: "She comes with the weather and leaves with it; the damage lies between.", abilities: ["blenden", "wegelagerei"] }),
  B("b16", "Die Blutmagd", "The Bloodmaid", "serpent", "#dc2626", 17, 7, { slides: KING, range: 1, leaps: [[0, 2], [0, -2]] }, { flavorDe: "Aus dem Lazarett verschwand erst der Aderlass, dann die Magd. Was der Riss aus ihr machte, windet sich noch immer um sein Werk.", flavorEn: "First the bloodletting vanished from the infirmary, then the maid. What the Rift made of her still coils around its work.", abilities: ["gift", "aderlass", "schrecken"] }),
  B("b17", "Lanzenmeister", "Lancemaster", "tyrant", "#eab308", 19, 5, { leaps: [...sym(0, 2), ...KING] }, { flavorDe: "Zehntausend Stöße, jeden Morgen; der elfte gilt dir.", flavorEn: "Ten thousand thrusts, every morning; the eleventh is for you.", abilities: ["widerhall", "aderlass"] }),
  B("b18", "Eisenfaust", "Ironfist", "golem", "#f97316", 18, 6, { slides: ORTHO }, { flavorDe: "Was seine Faust einmal hält, gehört der Faust — so einfach ist sein Gesetz.", flavorEn: "What his fist once holds belongs to the fist — his law is that simple.", abilities: ["steinhaut", "wegelagerei"] }),
  B("b19", "Der Hornschatten", "The Hornshade", "wraith", "#a78bfa", 16, 8, { leaps: [...sym(2, 2), ...sym(0, 3)] }, { flavorDe: "Sein Reich beginnt, wo die Lampen enden; er hat Geduld mit jedem Docht.", flavorEn: "His realm begins where the lamps end; he has patience with every wick.", abilities: ["geistwandel", "schrecken", "blenden"] }),
  B("b20", "Der Waldschrat", "The Woodwose", "tyrant", "#34d399", 21, 3, { leaps: [...DIAG, ...sym(0, 3)] }, { flavorDe: "Er bewacht keine Tür — er bewacht das Nein, das dahinter wohnt.", flavorEn: "He guards no door — he guards the No that lives behind it.", abilities: ["unsterblich", "widerhall", "steinhaut"] }),
  B("b21", "Die Wandlerin",    "The Shifter",     "wraith",  "#f0abfc",  17, 7, { leaps: RING2, spawn: { max: 2 } }, { flavorDe: "Frag nicht, wie sie wirklich aussieht; sie hat die Antwort selbst vergessen.", flavorEn: "Do not ask what she truly looks like; she has forgotten the answer herself.", abilities: ["schrecken"] }),  // die Wandlerin wandelt
  B("b22", "Der Zerreißer",    "The Render",      "beast",   "#ef4444", 16, 8, { leaps: [...KNIGHT, ...CAMEL] }, { flavorDe: "Man erkennt sein Werk am Rand: nichts ist geschnitten, alles gerissen.", flavorEn: "You know his work by the edges: nothing cut, everything torn.", abilities: ["aderlass"] }),
  B("b23", "Der Strahlengötze", "The Radiant Idol", "tyrant", "#fbbf24", 18, 6, { slides: DIAG, range: 2, leaps: sym(0, 3) }, { flavorDe: "Vom Hof blieb ihr nichts als der Name. Der Riss gab ihr Stacheln dafür — und einen Groll, der durch Rüstungen wächst.", flavorEn: "Nothing of the court is left to her but the name. The Rift gave her thorns in its place — and a grudge that grows through armour.", abilities: ["blenden", "widerhall"] }),
  B("b24", "Malrik, der Seuchenkönig", "Malrik, the Plaguelord",      "serpent", "#84cc16",  20, 4, { slides: KING, range: 1, spawn: { max: 3 } }, { flavorDe: "Wo er hoftritt, keimt es falsch; seine Gefolgschaft wächst ihm aus dem Boden nach.", flavorEn: "Where he treads, things sprout wrong; his following grows after him out of the ground.", abilities: ["gift", "schrecken", "aderlass"] }),
  B("b25", "Der Steinkönig", "The Stone King", "tyrant", "#ffd166", 19, 5, { slides: ORTHO, range: 2, leaps: sym(2, 2) }, { flavorDe: "Er hat nie eine Partie beendet — seine Gegner haben nur aufgehört zu ziehen.", flavorEn: "He has never finished a game — his opponents merely stopped moving.", abilities: ["unsterblich", "widerhall", "schrecken"] }),
  /* ══ v1.91.0: DIE GROSSMEISTER SIND IM URSPRUNG FIGUREN (Besitzer 6.10.2026) ══
     "wichtig ist mir tatsaechlich, dass die Grossmeister ... eher im Ursprung
      eben so aussehen wie Figuren und nicht wie Bestien." Dreizehn neue
     Gestalten; nur der Seuchenkoenig (b24) bleibt ("das Gesicht im Dunkeln
     ist schon in Ordnung"). Je spaeter das Kapitel, desto staerker hat der
     Riss sie verdorben: unberuehrt (I-V), gezeichnet (VI-IX), verdorben
     (X-XII).

     Die ALTEN Bilder bleiben im Spiel - als Bestien, unter neuem Namen und
     OHNE Aura (b19 Hornschatten, b20 Waldschrat, b14 Rissbrocken, b23
     Strahlengoetze, b25 Steinkoenig; Richter, Kanonier, Blutmagd,
     Lanzenmeister und Eisenfaust behalten ihre Namen). Als Bestie steht ein
     Wesen auf einem FREIEN Platz der Reihe statt auf dem Damenplatz - mit den
     alten Meister-Gangarten (Dame-plus-Springer, Turm, Erzbischof) waere das
     eine zweite Dame gewesen. Darum ziehen die fuenf Umbenannten bescheidener,
     und die Zahl der Faehigkeiten folgt bei allen zehn wieder der
     Beweglichkeit, wie bei jeder Bestie. Ihre alten Gangarten und Auren
     tragen jetzt die neuen Grossmeister desselben Namens (Veyl, Thalor,
     Brakk, Asra, Osric). */
  B("b26", "Zahir, der Pfauenfürst", "Zahir, the Peacock Prince", "tyrant", "#1fa58a", 18, 6, { slides: DIAG, range: 3, leaps: ORTHO }, { flavorDe: "Er schlägt sein Rad, und der halbe Hof vergisst, weshalb er gekommen war.", flavorEn: "He spreads his fan, and half the court forgets why it came.", abilities: ["blenden", "schrecken", "wegelagerei"] }),
  B("b27", "Varek, der Schwarze Ritter", "Varek, the Black Knight", "tyrant", "#8a1c2b", 17, 7, { slides: ORTHO, range: 2, leaps: KNIGHT }, { flavorDe: "Niemand hat je sein Gesicht gesehen. Die es beinahe hätten, erinnern sich an zwei rote Lichter.", flavorEn: "Nobody has ever seen his face. Those who nearly did remember two red lights.", aura: { type: "wardAdj" }, abilities: ["steinhaut", "widerhall", "aderlass"] }),
  B("b28", "Isolde, die Dornenkönigin", "Isolde, the Thorn Queen", "tyrant", "#b3202e", 16, 8, { slides: KING, range: 2, leaps: sym(0, 3) }, { flavorDe: "Ihr Garten blüht das ganze Jahr. Gegossen wird er nicht mit Wasser.", flavorEn: "Her garden blooms all year. It is not watered with water.", aura: { type: "grant", id: "lifesteal" }, abilities: ["gift", "aderlass", "schrecken"] }),
  B("b29", "Halvar, der Gezeitenkönig", "Halvar, the Tide King", "tyrant", "#19a3a8", 20, 4, { slides: ORTHO, range: 4, leaps: DIAG }, { flavorDe: "Er herrscht über alles, was die Flut bringt — und nimmt es mit der Ebbe wieder mit.", flavorEn: "He rules all the flood brings — and takes it back with the ebb.", aura: { type: "courtHp", n: 2 }, abilities: ["steinhaut", "widerhall", "schrecken", "wegelagerei"] }),
  B("b30", "Seraphine, die Maskenfürstin", "Seraphine, the Mask Princess", "tyrant", "#7a3fb5", 15, 9, { leaps: [...KNIGHT, ...sym(2, 2)] }, { flavorDe: "Auf ihrem Ball trägt jeder eine Maske. Nur sie trägt keine darunter.", flavorEn: "At her ball everyone wears a mask. Only she wears nothing beneath it.", abilities: ["geistwandel", "blenden", "schrecken", "gift"] }),
  B("b31", "Yorrik, der Winterkönig", "Yorrik, the Winter King", "tyrant", "#7fb6e6", 21, 3, { slides: KING, range: 1, leaps: sym(0, 3) }, { flavorDe: "Sein Reich ist still geworden. Er hält das für Frieden.", flavorEn: "His realm has fallen silent. He takes it for peace.", aura: { type: "grant", id: "bulwark" }, abilities: ["steinhaut", "unsterblich", "schrecken", "widerhall"] }),
  B("b32", "Cassian, der Intrigant", "Cassian, the Schemer", "tyrant", "#c9952b", 17, 7, { slides: DIAG, leaps: ORTHO }, { flavorDe: "Er hat nie eine Schlacht geschlagen. Er hat sie alle gewonnen, bevor sie begannen.", flavorEn: "He has never fought a battle. He won them all before they began.", aura: { type: "courtAtk", n: 1 }, abilities: ["blenden", "wegelagerei", "schrecken", "aderlass"] }),
  B("b33", "Veyl, der Schattenfürst", "Veyl, the Shadowlord", "tyrant", "#6d4bb8", 16, 8, { slides: DIAG, leaps: KNIGHT }, { flavorDe: "Sein Reich beginnt, wo die Lampen enden; er hat Geduld mit jedem Docht.", flavorEn: "His realm begins where the lamps end; he has patience with every wick.", aura: { type: "courtAtk", n: 1 }, abilities: ["geistwandel", "schrecken", "blenden", "aderlass", "gift"] }),
  B("b34", "Brakk, der Koloss", "Brakk, the Colossus", "tyrant", "#8d5fd0", 21, 3, { slides: ORTHO, range: 2, leaps: DIAG }, { flavorDe: "Er war ein Mann, bevor seine Fäuste zu Stein wurden. Er vermisst es nicht.", flavorEn: "He was a man before his fists turned to stone. He does not miss it.", aura: { type: "grant", id: "bulwark" }, abilities: ["steinhaut", "unsterblich", "widerhall", "schrecken", "aderlass"] }),
  B("b35", "Asra, die Erzfeindin", "Asra, the Archenemy", "tyrant", "#e08a2b", 18, 6, { slides: KING, range: 3 }, { flavorDe: "Vom Hof blieb ihr nichts als der Name. Der Riss gab ihr eine Klaue dafür — und einen Groll, der durch Rüstungen wächst.", flavorEn: "Nothing of the court is left to her but the name. The Rift gave her a claw in its place — and a grudge that grows through armour.", abilities: ["unsterblich", "widerhall", "blenden", "schrecken", "geistwandel"] }),
  B("b36", "Osric, der Großmeister", "Osric, the Grandmaster", "tyrant", "#5a2a8a", 19, 5, { slides: KING, range: 4, leaps: KNIGHT }, { flavorDe: "Er hat nie eine Partie beendet — seine Gegner haben nur aufgehört zu ziehen.", flavorEn: "He has never finished a game — his opponents merely stopped moving.", aura: { type: "courtHp", n: 1 }, abilities: ["unsterblich", "widerhall", "schrecken", "blenden", "aderlass"] }),
  B("b37", "Morwen, die Rabenmutter", "Morwen, the Raven Mother", "tyrant", "#4a3a6e", 17, 7, { slides: KING, range: 1, leaps: CAMEL }, { flavorDe: "Jeder Rabe im Land bringt ihr ein Gerücht. Die meisten sind wahr, sobald sie sie weitererzählt.", flavorEn: "Every raven in the land brings her a rumour. Most are true once she has passed them on.", aura: { type: "noEnemyPotions" }, abilities: ["blenden", "schrecken", "gift", "geistwandel"] }),
  B("b38", "Thalor, der Hüter", "Thalor, the Keeper", "tyrant", "#3f9b6b", 21, 3, { slides: KING, range: 1, leaps: sym(2, 2) }, { flavorDe: "Er bewacht keine Tür — er bewacht das Nein, das dahinter wohnt.", flavorEn: "He guards no door — he guards the No that lives behind it.", aura: { type: "courtHp", n: 2 }, abilities: ["unsterblich", "widerhall", "steinhaut", "schrecken"] }),
  /* ── fuenf neue Bestien (freigegeben 6.10.2026) ── */
  B("b39", "Der Schlinger", "The Gulper", "beast", "#6aa84f", 20, 4, { leaps: [...sym(0, 2), ...KNIGHT] }, { flavorDe: "Er kaut nicht. Er hat es nie für nötig gehalten.", flavorEn: "He does not chew. He never saw the need.", abilities: ["aderlass", "unsterblich"] }),
  B("b40", "Die Weberin", "The Weaver", "wraith", "#9a8fb5", 16, 8, { slides: DIAG, range: 3, leaps: [[0, 1], [0, -1]] }, { flavorDe: "Zwischen ihren Händen hängt ein Faden. Am anderen Ende hängst du.", flavorEn: "A thread hangs between her hands. At the other end hang you.", abilities: ["blenden", "gift"] }),
  B("b41", "Die Harpyie", "The Harpy", "beast", "#c9a0a8", 14, 10, { leaps: [...ZEBRA, ...DIAG] }, { flavorDe: "Sie singt nicht. Das Geräusch, das du hörst, sind ihre Krallen auf dem Stein.", flavorEn: "She does not sing. The sound you hear is her claws on the stone.", abilities: ["aderlass", "blenden"] }),
  B("b42", "Der Grabhüter", "The Gravewarden", "wraith", "#4f8f7a", 20, 4, { slides: ORTHO, range: 2 }, { flavorDe: "Er hat jeden hier selbst zur Ruhe gelegt. Er sieht es nicht gern, wenn einer wieder aufsteht — außer ihm.", flavorEn: "He laid everyone here to rest himself. He dislikes seeing anyone rise again — except himself.", abilities: ["unsterblich", "schrecken", "gift"] }),
  B("b43", "Die Donnerkrähe", "The Thundercrow", "beast", "#2fb7e0", 13, 11, { leaps: [...KNIGHT, ...sym(0, 3)] }, { flavorDe: "Erst der Schatten, dann der Schlag, dann das Krächzen — in dieser Reihenfolge.", flavorEn: "First the shadow, then the strike, then the caw — in that order.", abilities: ["blenden", "schrecken"] }),
];

export const bossById = (id) => BOSSES.find((b) => b.id === id) || null;

/** The twelve GRANDMASTERS (v1.90.20: see below - no longer identical with
 *  the chapter finals). Beating a chapter wins you its master (KAPITEL_TROPHAEE):
 *  he may then march for YOU, in place of the queen (one boss at most). Every
 *  grandmaster carries an AURA that bends the whole match, not just his square. */
// v0.38.1: OSRIC GEHOERT ANS ENDE. Die Liste begann mit b25 - der
// Grossmeister stand als Finale von KAPITEL I, waehrend Kapitel XII mit
// Asra endete, die dort zusaetzlich als Station stand (Doppelung). Jetzt:
// aufsteigend, die Erzfeindin als vorletztes Finale, Osric EINMAL - im
// letzten Kapitel, in der letzten Festung.
/* v1.33.0: KAPITEL III GEHOERT DEM SEUCHENKOENIG (b24), nicht dem Hetzer (b02).
   v1.28.4 hat das in der Kampagne umgestellt (KAPITELMEISTER, campaign.js) -
   diese Liste blieb stehen. Sie entscheidet, wem ein Meister nach einem
   gewonnenen Kapitel GEHOERT, den Grossmeister-Rahmen, die Bundtafel und die
   Kulissen: wer Kapitel III gewann, bekam den Hetzer. Eine Probe (test_boss)
   haelt beide Listen jetzt aneinander. */
/* ── v1.90.20: GROSSMEISTER UND KAPITELMEISTER SIND NICHT MEHR DASSELBE ────
   Besitzerentscheid 1.10.: Meister von Kapitel I ist der DRACHE (eine Figur,
   die man mit dem Sieg sofort bekommt), der Richter (b12) haelt Gericht in
   Kapitel II als Mitte-Boss. Damit trennen sich zwei Bedeutungen, die bis
   hierher eine Liste trug:
     LEAGUE_BOSSES     die zwoelf GROSSMEISTER - die Klasse: nur auf dem
                       Damenplatz, Goldrahmen, nie Gast auf freien Feldern,
                       nicht bestechlich. Der Richter bleibt einer (alte
                       Spielstaende fuehren ihn auf dem Damenplatz).
     KAPITEL_TROPHAEE  je Kapitel der Meister, den der Sieg dir GIBT (Index
                       = Kapitel - 1). Kapitel I gibt den Drachen als Figur
                       (campaign.unlocked), darum steht dort null. */
/* v1.91.0: VIERZEHN Grossmeister. Die ersten zwoelf sind die Kapitelmeister
   in Kapitelfolge (ihr Sieg gibt sie dir: KAPITEL_TROPHAEE); Morwen und Thalor
   halten kein Kapitel - sie stehen als Mitte-Boss in VI und IX und lassen
   sich, einmal begegnet, bestechen. */
export const LEAGUE_BOSSES = ["b26", "b27", "b24", "b28", "b29", "b30", "b31", "b32", "b33", "b34", "b35", "b36", "b37", "b38"];
export const KAPITEL_TROPHAEE = ["b26", "b27", "b24", "b28", "b29", "b30", "b31", "b32", "b33", "b34", "b35", "b36"];
/** Grossmeister ohne eigenes Kapitel: in welchem stehen sie als Mitte-Boss? */
export const MITTE_MEISTER = { b37: 6, b38: 9 };
/** In welchem Kapitel steht dieser Grossmeister? (Bundtafel, Hofstaat) */
export const kapitelVonGrossmeister = (id) => {
  const i = KAPITEL_TROPHAEE.indexOf(id);
  if (i >= 0) return i + 1;
  return MITTE_MEISTER[id] || null;
};
/* ── v1.91.0: WER LAESST SICH BESTECHEN? Die Regel stand dreimal im Haus
   (ArmyScreen Kachel, ArmyScreen Blatt, saves.js) und widersprach sich schon:
   die Kachel liess sieben Kapitelmeister vorab kaufen, das Blatt nannte sie
   "Trophaee". Jetzt EINE Antwort mit Grund:
     "trophaee"  ein Kapitelmeister - er gehoert dir mit dem Sieg, nicht gegen Gold
     null        alle Bestien und die beiden Grossmeister ohne Kapitel */
export const NIE_BESTECHLICH = ["b35", "b36"];   // Asra und Osric (bis v1.90.36: b23, b25)
export const bestechGrund = (id) =>
  (NIE_BESTECHLICH.includes(id) ? "nie" : KAPITEL_TROPHAEE.includes(id) ? "trophaee" : null);
export const istBestechlich = (id) => bestechGrund(id) === null;
/* Die zehn Bestien, die bis v1.90.36 Grossmeister waren - die Wanderung
   (meta/profile.js) und die Aufstellung muessen sie kennen: wer sie auf dem
   Damenplatz stehen hatte, findet dort wieder die Dame. */
export const EHEMALIGE_MEISTER = ["b12", "b08", "b16", "b17", "b18", "b19", "b20", "b14", "b23", "b25"];
export const bossName = (b, en) => (en ? b.nameEn : b.nameDe);

/** Army-spec entry for a boss piece (drops into a back-rank slot). */
export function bossSpec(b) {
  return { kind: "X", level: 1, abilities: b.abilities || [], shield: 0,
    hp: b.hp, atk: b.atk, moveSpec: b.moveSpec, art: b.art, accent: b.accent,
    aura: b.aura || null, name: { de: b.nameDe, en: b.nameEn }, bossId: b.id };
}
