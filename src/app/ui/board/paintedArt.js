// The gallery: painted piece artworks (user-generated, gold & navy). Explicit
// imports — esbuild-friendly — and a resolver from a live board piece to its
// painting. Pieces without a painting yet fall back to the drawn SVG silently,
// so the set may grow one figure at a time.
import pPawn from "../assets/painted/painted-pawn.webp";
import pHaendler from "../assets/painted/painted-haendler.webp";  // der fahrende Haendler am Stand
/* v1.0.91: DIE SCHATZKAMMER HAT IHR BILD (Besitzerwunsch) - dasselbe Format
   wie Corvo: eine geschnitzte Szene auf rundem Steinsockel, damit die beiden
   als Paar lesbar sind. Corvo verkauft, die Kammer bewahrt. */
import pSchatzkammer from "../assets/painted/painted-schatzkammer.webp";
/* v0.78 (Besitzer): SEIN Original in voller Groesse - 1024x1024, bereits sauber
   freigestellt geliefert (568102 durchsichtige Pixel). Keine Freistellung, keine
   weiche Kante, keine Skalierung von mir; nur VERLUSTFREI nach WebP umkodiert:
   2,28 MB -> 1,51 MB bei nachgemessen NULL Abweichung in RGB und Alpha.
   Die Fassung bis v0.75 war von mir auf 520 px verkleinert und auf dunklen
   Grund plattgerechnet worden - daher der matschige Eindruck. */
import pGambit from "../assets/painted/painted-gambit.webp";
// the risen hero: tier portraits (Stufe II/III) — currently placeholder copies
// of the base painting; the user's generated art replaces these files 1:1
import pPawnT2 from "../assets/painted/painted-pawn-t2.webp";
import pPawnT3 from "../assets/painted/painted-pawn-t3.webp";
import pGambitT2 from "../assets/painted/painted-gambit-t2.webp";
import pGambitT3 from "../assets/painted/painted-gambit-t3.webp";
import pGambitT4 from "../assets/painted/painted-gambit-t4.webp";
import pGambitT5 from "../assets/painted/painted-gambit-t5.webp";
import pGambitT6 from "../assets/painted/painted-gambit-t6.webp";
import pSeeress from "../assets/painted/painted-seeress.webp";
import pKnight from "../assets/painted/painted-knight.webp";
import pBishop from "../assets/painted/painted-bishop.webp";
import pQueen from "../assets/painted/painted-queen.webp";
import pArchbishop from "../assets/painted/painted-archbishop.webp";
import pHawk from "../assets/painted/painted-hawk.webp";
import pAmazon from "../assets/painted/painted-amazon.webp";
import pAssassin from "../assets/painted/painted-assassin.webp";
import pGuardian from "../assets/painted/painted-guardian.webp";
import pCaptain from "../assets/painted/painted-captain.webp";
import pSorceress from "../assets/painted/painted-sorceress.webp";
import pPathfinder from "../assets/painted/painted-pathfinder.webp";
import pRook from "../assets/painted/painted-rook.webp";
import pKing from "../assets/painted/painted-king.webp";
import pChancellor from "../assets/painted/painted-chancellor.webp";
import pDragon from "../assets/painted/painted-dragon.webp";
import pMage from "../assets/painted/painted-mage.webp";
import pAlchemist from "../assets/painted/painted-alchemist.webp";
import pWarlock from "../assets/painted/painted-warlock.webp";
import pPaladin from "../assets/painted/painted-paladin.webp";
import pInquisitor from "../assets/painted/painted-inquisitor.webp";
import pBard from "../assets/painted/painted-bard.webp";
import pEngineer from "../assets/painted/painted-engineer.webp";
import pStandard from "../assets/painted/painted-standard.webp";
import pStrategist from "../assets/painted/painted-strategist.webp";
import bGolem from "../assets/painted/painted-boss-golem.webp";
import bBeast from "../assets/painted/painted-boss-beast.webp";
import bSerpent from "../assets/painted/painted-boss-serpent.webp";
import bWraith from "../assets/painted/painted-boss-wraith.webp";
import bTyrant from "../assets/painted/painted-boss-tyrant.webp";
import bArchenemy from "../assets/painted/painted-boss-archenemy.webp";
import bLeaguemaster from "../assets/painted/painted-boss-leaguemaster.webp";
// every named monster of the road now sits for his own portrait (b01–b22, b24)
import pbb01 from "../assets/painted/painted-boss-b01.webp";
import pbb02 from "../assets/painted/painted-boss-b02.webp";
import pbb03 from "../assets/painted/painted-boss-b03.webp";
import pbb04 from "../assets/painted/painted-boss-b04.webp";
import pbb05 from "../assets/painted/painted-boss-b05.webp";
import pbb06 from "../assets/painted/painted-boss-b06.webp";
import pbb07 from "../assets/painted/painted-boss-b07.webp";
import pbb08 from "../assets/painted/painted-boss-b08.webp";
import pbb09 from "../assets/painted/painted-boss-b09.webp";
import pbb10 from "../assets/painted/painted-boss-b10.webp";
import pbb11 from "../assets/painted/painted-boss-b11.webp";
import pbb12 from "../assets/painted/painted-boss-b12.webp";
import pbb13 from "../assets/painted/painted-boss-b13.webp";
import pbb14 from "../assets/painted/painted-boss-b14.webp";
import pbb15 from "../assets/painted/painted-boss-b15.webp";
import pbb16 from "../assets/painted/painted-boss-b16.webp";
import pbb17 from "../assets/painted/painted-boss-b17.webp";
import pbb18 from "../assets/painted/painted-boss-b18.webp";
import pbb19 from "../assets/painted/painted-boss-b19.webp";
import pbb20 from "../assets/painted/painted-boss-b20.webp";
import pbb21 from "../assets/painted/painted-boss-b21.webp";
import pbb22 from "../assets/painted/painted-boss-b22.webp";
import pbb23 from "../assets/painted/painted-boss-b23.webp";
import pbb24 from "../assets/painted/painted-boss-b24.webp";
import pbb25 from "../assets/painted/painted-boss-b25.webp";

// ── the CLASSIC set: frozen copies of the original standard pieces. The
// campaign's standard figures may be repainted (human setting), but classic
// chess mode keeps these forever. ──
import cPawn from "../assets/painted/classic-pawn.webp";
import cKnight from "../assets/painted/classic-knight.webp";
import cBishop from "../assets/painted/classic-bishop.webp";
import cRook from "../assets/painted/classic-rook.webp";
import cQueen from "../assets/painted/classic-queen.webp";
import cKing from "../assets/painted/classic-king.webp";
export const CLASSIC_PAINTED = { P: cPawn, N: cKnight, B: cBishop, R: cRook, Q: cQueen, K: cKing };

// ── DAS KLASSISCHE SPIEL HAT SEINEN EIGENEN SATZ (v0.40) ────────────────────
// Sechs Figuren, geschnitzt in derselben Formensprache wie der Hof, aber
// schmucklos und in zwei Farben: cremegrau und dunkelgrau. Der dunkle Satz
// ist aus DENSELBEN Dateien abgeleitet, es sind also dieselben Figuren -
// deshalb braucht das klassische Brett auch keinen Farbfilter fuer die
// Gegenseite mehr, und weder Riss- noch Goldschein.
import kPawnH from "../assets/klassik/pawn-hell.webp";
import kKnightH from "../assets/klassik/knight-hell.webp";
import kBishopH from "../assets/klassik/bishop-hell.webp";
import kRookH from "../assets/klassik/rook-hell.webp";
import kQueenH from "../assets/klassik/queen-hell.webp";
import kKingH from "../assets/klassik/king-hell.webp";
import kPawnD from "../assets/klassik/pawn-dunkel.webp";
import kKnightD from "../assets/klassik/knight-dunkel.webp";
import kBishopD from "../assets/klassik/bishop-dunkel.webp";
import kRookD from "../assets/klassik/rook-dunkel.webp";
import kQueenD from "../assets/klassik/queen-dunkel.webp";
import kKingD from "../assets/klassik/king-dunkel.webp";

/* ── DIE KLEINEN FUERS BRETT (v1.0.38, Besitzerbefund) ─────────────────────
   Der Besitzer hat den Unterschied gefunden, an dem ich vorbeigemessen
   hatte: klassisches Schach laeuft fluessig, mit den GEMALTEN Figuren
   ruckelt es. Nachgemessen - und der Befund ist eindeutig:

     klassische Figur   224x384 px  =  0,086 Megapixel
     gemalte Figur      576x576 px  =  0,332 Megapixel   (viermal so viel)

   Auf einem 50-px-Feld heisst das eine Verkleinerung um Faktor NEUN. Solange
   nichts passiert, haelt der Browser das Ergebnis fest; sobald sich der
   Massstab aendert - und genau das tut er beim ANTIPPEN, wo die Auswahl auf
   1,58 waechst - muss er alle 32 Figuren neu abtasten. Daher das Ruckeln
   beim Klicken, und daher nur bei den gemalten.

   Also traegt das Brett ab jetzt 192-px-Fassungen: bei dreifacher
   Pixeldichte sind das 150 echte Pixel auf einem 50-px-Feld, also reichlich
   Reserve - aber ein Neuntel der Flaeche. Die grossen Bilder bleiben, wo man
   sie WIRKLICH gross sieht: Hofstaat, Popup, Zoom, Schaukammer. */
import k_pPawn from "../assets/painted/klein/painted-pawn.webp";
import k_pHaendler from "../assets/painted/klein/painted-haendler.webp";
import k_pSchatzkammer from "../assets/painted/klein/painted-schatzkammer.webp";
import k_pGambit from "../assets/painted/klein/painted-gambit.webp";
import k_pPawnT2 from "../assets/painted/klein/painted-pawn-t2.webp";
import k_pPawnT3 from "../assets/painted/klein/painted-pawn-t3.webp";
import k_pGambitT2 from "../assets/painted/klein/painted-gambit-t2.webp";
import k_pGambitT3 from "../assets/painted/klein/painted-gambit-t3.webp";
import k_pGambitT4 from "../assets/painted/klein/painted-gambit-t4.webp";
import k_pGambitT5 from "../assets/painted/klein/painted-gambit-t5.webp";
import k_pGambitT6 from "../assets/painted/klein/painted-gambit-t6.webp";
import k_pSeeress from "../assets/painted/klein/painted-seeress.webp";
import k_pKnight from "../assets/painted/klein/painted-knight.webp";
import k_pBishop from "../assets/painted/klein/painted-bishop.webp";
import k_pQueen from "../assets/painted/klein/painted-queen.webp";
import k_pArchbishop from "../assets/painted/klein/painted-archbishop.webp";
import k_pHawk from "../assets/painted/klein/painted-hawk.webp";
import k_pAmazon from "../assets/painted/klein/painted-amazon.webp";
import k_pAssassin from "../assets/painted/klein/painted-assassin.webp";
import k_pGuardian from "../assets/painted/klein/painted-guardian.webp";
import k_pCaptain from "../assets/painted/klein/painted-captain.webp";
import k_pSorceress from "../assets/painted/klein/painted-sorceress.webp";
import k_pPathfinder from "../assets/painted/klein/painted-pathfinder.webp";
import k_pRook from "../assets/painted/klein/painted-rook.webp";
import k_pKing from "../assets/painted/klein/painted-king.webp";
import k_pChancellor from "../assets/painted/klein/painted-chancellor.webp";
import k_pDragon from "../assets/painted/klein/painted-dragon.webp";
import k_pMage from "../assets/painted/klein/painted-mage.webp";
import k_pAlchemist from "../assets/painted/klein/painted-alchemist.webp";
import k_pWarlock from "../assets/painted/klein/painted-warlock.webp";
import k_pPaladin from "../assets/painted/klein/painted-paladin.webp";
import k_pInquisitor from "../assets/painted/klein/painted-inquisitor.webp";
import k_pBard from "../assets/painted/klein/painted-bard.webp";
import k_pEngineer from "../assets/painted/klein/painted-engineer.webp";
import k_pStandard from "../assets/painted/klein/painted-standard.webp";
import k_pStrategist from "../assets/painted/klein/painted-strategist.webp";
import k_bGolem from "../assets/painted/klein/painted-boss-golem.webp";
import k_bBeast from "../assets/painted/klein/painted-boss-beast.webp";
import k_bSerpent from "../assets/painted/klein/painted-boss-serpent.webp";
import k_bWraith from "../assets/painted/klein/painted-boss-wraith.webp";
import k_bTyrant from "../assets/painted/klein/painted-boss-tyrant.webp";
import k_bArchenemy from "../assets/painted/klein/painted-boss-archenemy.webp";
import k_bLeaguemaster from "../assets/painted/klein/painted-boss-leaguemaster.webp";
import k_pbb01 from "../assets/painted/klein/painted-boss-b01.webp";
import k_pbb02 from "../assets/painted/klein/painted-boss-b02.webp";
import k_pbb03 from "../assets/painted/klein/painted-boss-b03.webp";
import k_pbb04 from "../assets/painted/klein/painted-boss-b04.webp";
import k_pbb05 from "../assets/painted/klein/painted-boss-b05.webp";
import k_pbb06 from "../assets/painted/klein/painted-boss-b06.webp";
import k_pbb07 from "../assets/painted/klein/painted-boss-b07.webp";
import k_pbb08 from "../assets/painted/klein/painted-boss-b08.webp";
import k_pbb09 from "../assets/painted/klein/painted-boss-b09.webp";
import k_pbb10 from "../assets/painted/klein/painted-boss-b10.webp";
import k_pbb11 from "../assets/painted/klein/painted-boss-b11.webp";
import k_pbb12 from "../assets/painted/klein/painted-boss-b12.webp";
import k_pbb13 from "../assets/painted/klein/painted-boss-b13.webp";
import k_pbb14 from "../assets/painted/klein/painted-boss-b14.webp";
import k_pbb15 from "../assets/painted/klein/painted-boss-b15.webp";
import k_pbb16 from "../assets/painted/klein/painted-boss-b16.webp";
import k_pbb17 from "../assets/painted/klein/painted-boss-b17.webp";
import k_pbb18 from "../assets/painted/klein/painted-boss-b18.webp";
import k_pbb19 from "../assets/painted/klein/painted-boss-b19.webp";
import k_pbb20 from "../assets/painted/klein/painted-boss-b20.webp";
import k_pbb21 from "../assets/painted/klein/painted-boss-b21.webp";
import k_pbb22 from "../assets/painted/klein/painted-boss-b22.webp";
import k_pbb23 from "../assets/painted/klein/painted-boss-b23.webp";
import k_pbb24 from "../assets/painted/klein/painted-boss-b24.webp";
import k_pbb25 from "../assets/painted/klein/painted-boss-b25.webp";

const KLASSIK_HELL = { P: kPawnH, N: kKnightH, B: kBishopH, R: kRookH, Q: kQueenH, K: kKingH };
const KLASSIK_DUNKEL = { P: kPawnD, N: kKnightD, B: kBishopD, R: kRookD, Q: kQueenD, K: kKingD };
/** Die klassische Figur nach Art und SEITE - weiss traegt Creme, schwarz Grau. */
export const klassikFor = (piece) =>
  (piece?.color === "w" ? KLASSIK_HELL : KLASSIK_DUNKEL)[piece?.kind] || null;

export const PAINTED_KLEIN = { "pawn": k_pPawn, "pawn-t2": k_pPawnT2, "pawn-t3": k_pPawnT3, "haendler": k_pHaendler, "schatzkammer": k_pSchatzkammer, "gambit": k_pGambit, "gambit-t2": k_pGambitT2, "gambit-t3": k_pGambitT3, "gambit-t4": k_pGambitT4, "gambit-t5": k_pGambitT5, "gambit-t6": k_pGambitT6, "seeress": k_pSeeress, "knight": k_pKnight, "bishop": k_pBishop, "queen": k_pQueen, "archbishop": k_pArchbishop, "hawk": k_pHawk, "amazon": k_pAmazon, "assassin": k_pAssassin, "guardian": k_pGuardian, "captain": k_pCaptain, "sorceress": k_pSorceress, "pathfinder": k_pPathfinder, "rook": k_pRook, "king": k_pKing, "chancellor": k_pChancellor, "dragon": k_pDragon, "mage": k_pMage, "alchemist": k_pAlchemist, "warlock": k_pWarlock, "paladin": k_pPaladin, "inquisitor": k_pInquisitor, "bard": k_pBard, "engineer": k_pEngineer, "standard": k_pStandard, "strategist": k_pStrategist, "boss-golem": k_bGolem, "boss-beast": k_bBeast, "boss-serpent": k_bSerpent, "boss-wraith": k_bWraith, "boss-tyrant": k_bTyrant, "boss-archenemy": k_bArchenemy, "boss-leaguemaster": k_bLeaguemaster, "boss-b01": k_pbb01, "boss-b02": k_pbb02, "boss-b03": k_pbb03, "boss-b04": k_pbb04, "boss-b05": k_pbb05, "boss-b06": k_pbb06, "boss-b07": k_pbb07, "boss-b08": k_pbb08, "boss-b09": k_pbb09, "boss-b10": k_pbb10, "boss-b11": k_pbb11, "boss-b12": k_pbb12, "boss-b13": k_pbb13, "boss-b14": k_pbb14, "boss-b15": k_pbb15, "boss-b16": k_pbb16, "boss-b17": k_pbb17, "boss-b18": k_pbb18, "boss-b19": k_pbb19, "boss-b20": k_pbb20, "boss-b21": k_pbb21, "boss-b22": k_pbb22, "boss-b23": k_pbb23, "boss-b24": k_pbb24, "boss-b25": k_pbb25 };

export const PAINTED = {
  haendler: pHaendler, schatzkammer: pSchatzkammer, pawn: pPawn, "pawn-t2": pPawnT2, "pawn-t3": pPawnT3, gambit: pGambit, "gambit-t2": pGambitT2, "gambit-t3": pGambitT3, "gambit-t4": pGambitT4, "gambit-t5": pGambitT5, "gambit-t6": pGambitT6, seeress: pSeeress, knight: pKnight, bishop: pBishop, queen: pQueen,
  archbishop: pArchbishop, hawk: pHawk, amazon: pAmazon, assassin: pAssassin, guardian: pGuardian,
  captain: pCaptain, pathfinder: pPathfinder, sorceress: pSorceress,
  rook: pRook, king: pKing, chancellor: pChancellor, dragon: pDragon, mage: pMage,
  alchemist: pAlchemist, warlock: pWarlock, paladin: pPaladin, inquisitor: pInquisitor,
  bard: pBard, engineer: pEngineer, standard: pStandard, strategist: pStrategist,
  "boss-golem": bGolem, "boss-beast": bBeast, "boss-serpent": bSerpent, "boss-wraith": bWraith,
  "boss-tyrant": bTyrant, "boss-archenemy": bArchenemy, "boss-leaguemaster": bLeaguemaster,
  "boss-b01": pbb01, "boss-b02": pbb02, "boss-b03": pbb03, "boss-b04": pbb04, "boss-b05": pbb05, "boss-b06": pbb06, "boss-b07": pbb07, "boss-b08": pbb08,
  "boss-b09": pbb09, "boss-b10": pbb10, "boss-b11": pbb11, "boss-b12": pbb12, "boss-b13": pbb13, "boss-b14": pbb14, "boss-b15": pbb15, "boss-b16": pbb16,
  "boss-b17": pbb17, "boss-b18": pbb18, "boss-b19": pbb19, "boss-b20": pbb20, "boss-b21": pbb21, "boss-b22": pbb22, "boss-b23": pbb23, "boss-b24": pbb24, "boss-b25": pbb25,
};

// ── the active piece style ──────────────────────────────────────────────────
// The carved set has to replace the gallery EVERYWHERE, not just on the board:
// the court, the chronicle, the unlock pop-ups and the army list all reach for
// a painting by id, from a dozen call sites. Rather than thread a style flag
// through all of them, the gallery itself knows which set is in play. App.jsx
// sets this once from the profile; every lookup below then answers in the
// chosen style, and falls back to the painting whenever no carving exists.
let STIL = "painted";
/* v1.0.41: DIE STILWEICHE IST FORT. Es gibt nur noch EINEN geschnitzten
   Satz; setPieceStyle bleibt als Nulloperation stehen, damit livery.js und
   die Spielstaende nicht anfassen muss, wer sie noch aufruft. */
export function setPieceStyle() { STIL = "painted"; }
export function pieceStyle() { return STIL; }

/* ── DER SCHLICHTE STIL, DURCHGEZOGEN (v0.83, Besitzerentscheid) ───────────
   Wer im Profil auf "Simpel" stellt, will ihn UEBERALL: auf dem Brett, im
   Hofstaat, im Lager, in jeder Karte. Bisher wirkte die Wahl nur auf dem
   Brett, alles andere blieb gemalt - ein Zwitter. Dieser Schalter ist die
   eine Wahrheit; App.jsx stellt ihn nach dem Profil, alle Ansichten fragen
   ihn. Der HAENDLER bleibt bewusst gemalt: er ist keine Spielfigur, sondern
   ein Bild. */
let SCHLICHT = false;
export function setSchlicht(an) { SCHLICHT = !!an; }
export function schlichtAn() { return SCHLICHT; }

// kind letter -> character id (pawn wins the shared "P"; the hero flag decides gambit)
const KIND2ID = {
  P: "pawn", N: "knight", B: "bishop", R: "rook", Q: "queen", K: "king",
  A: "archbishop", C: "chancellor", H: "hawk", M: "amazon", V: "captain", S: "assassin", SE: "seeress",
  G: "guardian", D: "dragon", E: "mage", Z: "sorceress", L: "alchemist", W: "warlock",
  U: "paladin", I: "inquisitor", J: "bard", T: "engineer", F: "standard", Y: "strategist", O: "pathfinder",
};

/** Painting for a live board piece — or null when the gallery has none yet. */
/** v1.0.38: Dasselbe Bild in klein - fuers Brett. Findet sich keine kleine
 *  Fassung (etwa bei geschnitzten Stilen), bleibt die grosse; ein fehlendes
 *  Bild waere schlimmer als ein zu grosses. */
export function kleinFuerBrett(quelle) {
  if (!quelle) return quelle;
  for (const [schluessel, gross] of Object.entries(PAINTED))
    if (gross === quelle) return PAINTED_KLEIN[schluessel] || quelle;
  return quelle;
}

export function paintedForPiece(piece, fuersBrett = false) {
  const roh = paintedRoh(piece);
  return fuersBrett ? kleinFuerBrett(roh) : roh;
}

/* ── EIN VOLK, EIN HELD (v1.0.49, Besitzerentscheid) ───────────────────────
   v1.0.45 gab der eigenen Seite gruene Holzbauern und dem Gegner die blauen
   Speertraeger. Der Besitzer hat es am Geraet gesehen und sich anders
   entschieden: BEIDE Seiten tragen den blauen Soldaten. Was Freund von Feind
   trennt, bleibt der Saum - und der HELD, der als einziger heraussticht.

   Das ist das staerkere Zeichen: ein goldener Ritter zwischen acht blauen
   Soldaten liest sich auf einen Blick, und es meint dieselbe Figur, die auch
   auf der Karte zu sehen ist. Zwei Voelker haetten die Aufmerksamkeit auf
   die Bauernreihe gezogen, wo sie nicht hingehoert. */

function paintedRoh(piece) {
  if (!piece) return null;
  if (piece.bossId) {
    if (piece.bossId.startsWith("pb_")) return PAINTED[piece.bossId.slice(3)] || null;
    // dedicated portrait first (painted-boss-<id>.webp), then the two named
    // finals, then the boss's art family (golem/beast/serpent/wraith/tyrant)
    return PAINTED["boss-" + piece.bossId]
      || (piece.bossId === "b23" ? PAINTED["boss-archenemy"] : null)
      || (piece.bossId === "b25" ? PAINTED["boss-leaguemaster"] : null)
      || PAINTED["boss-" + (piece.art || "")] || null;
  }
  if (piece.hero) {
    /* v1.0.49: DER HELD TRAEGT VORERST IMMER SEIN ERSTES GESICHT.
       Die Raenge II-VI liegen als schwarz-goldene Prunkritter vor - eine
       andere Bildwelt als die geschnitzten Holzfiguren, was seit dem Fall
       der Stilweiche (v1.0.41) auffaellt. Bis die gelben Fassungen gezeichnet
       sind, bekommt jeder Rang denselben goldenen Ritter: lieber einheitlich
       als stilgebrochen. Die Groesse unterscheidet die Raenge weiterhin
       (GAMBIT_TIER_H in paintedFitFor).
       Sobald die Bilder da sind, hier wieder auf PAINTED["gambit-t"+gt]
       umstellen - die Schluessel existieren bereits.
       v1.0.62: SIE SIND DA. Die handgefuehrte Reihe des Besitzers traegt
       alle sechs Raenge in einer Bildwelt - der Rang schaltet das Bild. */
    /* v1.0.84 (Besitzer, vierte Meldung: "immer noch nicht ueberall"):
       DER RANG DARF NICHT NUR AUS piece.tier KOMMEN. Bis hierher las diese
       Stelle ausschliesslich tier - und wer paintedForPiece mit level statt
       tier aufrief (die Hofstaat-Kachel tat genau das, Zeile 1630, ebenso
       die Vorladeliste), bekam still Rang I. Der Riegel aus v1.0.83 war
       richtig, aber er heilte nur den Weg, nicht die Quelle.
       Jetzt rechnet die Bildwahl den Rang notfalls SELBST aus dem Level -
       eine Stelle, die nicht mehr vergessen werden kann. */
    const gt = Math.min(6, Math.max(1,
      piece.tier || (piece.level ? Math.min(6, Math.floor((Math.max(1, piece.level) - 1) / 10) + 1) : 1)));
    return (gt >= 2 && PAINTED["gambit-t" + gt]) || PAINTED.gambit || null;
  }
  const id = KIND2ID[piece.kind];
  /* v1.0.49 (Besitzerentscheid): DER GRUENE BAUER IST FORT. In v1.0.45 trug
     die eigene Seite den gruenen Holzbauern aus dem Zweitsatz, damit man
     Freund und Feind am Bild unterscheidet. Der Besitzer will stattdessen
     beidseitig den blauen Speertraeger - und die Unterscheidung ueber den
     HELDEN: der Gambit steht in Gold zwischen ihnen, von der ersten Partie
     an. Das ist das staerkere Zeichen, weil es dieselbe Figur meint, die
     auch auf der Karte zu sehen ist.
     v1.0.62: die Bauern tragen nun ihre eigene Stufenreihe (gruen, mit
     Muetze/Stab/Speer) - der tier waehlt das Bild, beidseitig. */
  if (piece.kind === "P" && (piece.tier || 1) >= 2)
    return PAINTED["pawn-t" + Math.min(3, piece.tier)] || PAINTED[id] || null;
  return id ? PAINTED[id] || null : null;
}

/** Painting by character id — for the court's character cards. */
export const paintedById = (id) => PAINTED[id] || null;
/* v1.17.0: der Weg zurueck - von der URL zur Id, damit das Sockelband weiss,
   welches Gemaelde (und damit welche Sockelmessung) vor ihm liegt. */
const URL_ZU_ID = new Map([...Object.entries(PAINTED), ...Object.entries(PAINTED_KLEIN)].map(([k, v]) => [v, k]));   // gross UND klein (Brett, 1/3-Mass, gleiches Verhaeltnis)
export const paintedIdOf = (url) => (url && URL_ZU_ID.get(url)) || null;

// ── Base-width normalisation ────────────────────────────────────────────────
// Every painting is 1024x1024, but each figure fills a different share of it,
// so at one font size their FEET (the base that rests on the square) came out
// wildly different sizes AND heights — the rook read as a giant, the queen and
// bishop hung low. So instead of levelling only WIDTH (which shrank broad
// figures out of proportion), each painting is fitted to a uniform BOX: `h`
// scales it to one figure height (broad figures capped in width so they don't
// sprawl into the neighbours), and `y` lifts or drops the foot onto one shared
// baseline with a little air beneath. The pawn (already smaller via its font),
// the gambit and the big dragon keep their own size on purpose. MEASURED from
// each painting's alpha bounding box.
const PAINTED_FIT = {
  "pawn": { h: 1.0625, y: -0.06, x: 0 },
  /* v1.0.66 (Besitzer, dritter Anlauf - und DIESMAL die richtige Zahl):
     "der Grand Gambit ist immer noch groesser als die Bauern".
     v1.0.65 hat die KAESTEN gleich gemacht (beide 121x121, gemessen) - und
     genau darum blieb der Befund stehen: die Figur wird nicht vom Kasten
     gezeichnet, sondern von diesem Hoehenfaktor. Der Bauer stand auf 0.8977,
     der Gambit auf GAMBIT_TIER_H[0] = 1.0625 - der Held war 18 % hoeher
     GEZEICHNET, bei gleich grossem Kasten. Kein Auge sieht den Kasten, jedes
     sieht die Figur.
     Die Gemaelde erlauben den Gleichstand: painted-pawn und painted-gambit
     messen beide 92,9 % Figurenhoehe und 3,5 % Fussabstand (Alphaschwelle 12),
     unterscheiden sich also nur in der Breite. Derselbe Faktor heisst hier
     also wirklich dieselbe Groesse - und derselbe y-Versatz (-0.06) setzt
     beide auf dieselbe Fusslinie. Die Raenge II-VI wachsen weiter, das bleibt
     die Auszeichnung des Aufstiegs. */
  "gambit": { h: 0.94, y: -0.144, x: 0 },
  "knight": { h: 1.0498, y: -0.1427, x: 0 },
  "bishop": { h: 1.0616, y: -0.1396, x: 0 },
  "queen": { h: 1.1329, y: -0.1377, x: 0 },
  "rook": { h: 1.0485, y: -0.1262, x: 0 },
  "king": { h: 1.126, y: -0.1359, x: 0 },
  "chancellor": { h: 1.0393, y: -0.1456, x: 0 },
  "archbishop": { h: 1.0509, y: -0.1293, x: 0 },
  "amazon": { h: 1.053, y: -0.1293, x: 0 },
  "hawk": { h: 1.1044, y: -0.121, x: 0 },
  "seeress": { h: 1.0552, y: -0.1293, x: 0 },
  "assassin": { h: 1.0404, y: -0.1338, x: 0 },
  "guardian": { h: 1.0748, y: -0.1356, x: 0 },
  "captain": { h: 1.0488, y: -0.1417, x: 0 },
  "sorceress": { h: 1.0498, y: -0.1379, x: 0 },
  "pathfinder": { h: 1.0704, y: -0.1289, x: 0 },
  "mage": { h: 1.0456, y: -0.138, x: 0 },
  "alchemist": { h: 1.0332, y: -0.1513, x: 0 },
  "warlock": { h: 1.0425, y: -0.1439, x: 0 },
  "paladin": { h: 1.0562, y: -0.1378, x: 0 },
  "inquisitor": { h: 1.0605, y: -0.1378, x: 0 },
  "bard": { h: 1.066, y: -0.1444, x: 0 },
  "engineer": { h: 1.0584, y: -0.133, x: 0 },
  "standard": { h: 1.0446, y: -0.1295, x: 0 },
  "strategist": { h: 1.052, y: -0.1398, x: 0 },
  "dragon": { h: 1.0, y: 0.0, x: 0 },
};
/** Per-figure { h, y }: box-fit height scale + baseline shift (em). Default
 *  { h:1, y:0 } for bosses, big pieces and unknown ids. Mirrors
 *  paintedForPiece's id resolution. */

// Bosses measured per portrait: every master stands queen-tall (effective
// 1.082) whatever share of the canvas the painting fills; y offsets the foot
// gap so the base stays planted when the scale grows.
const BOSS_FIT = { "archenemy": { h: 1.102, y: 0.001, x: 0 }, "b01": { h: 1.11, y: 0.001, x: 0 }, "b02": { h: 1.10, y: 0.001, x: 0.0 }, "b03": { h: 1.305, y: 0.024, x: 0 }, "b04": { h: 1.507, y: 0.049, x: 0 }, "b05": { h: 1.308, y: 0.03, x: 0 }, "b06": { h: 1.383, y: 0.038, x: 0 }, "b07": { h: 1.345, y: 0.037, x: 0 }, "b08": { h: 1.399, y: 0.048, x: 0 }, "b09": { h: 1.166, y: 0.006, x: 0 }, "b10": { h: 1.471, y: 0.049, x: 0 }, "b11": { h: 1.294, y: 0.027, x: 0 }, "b12": { h: 1.248, y: 0.021, x: 0 }, "b13": { h: 1.314, y: 0.028, x: 0 }, "b14": { h: 1.147, y: 0.003, x: 0 }, "b15": { h: 1.132, y: 0.002, x: 0 }, "b16": { h: 1.147, y: 0.003, x: 0 }, "b17": { h: 1.096, y: 0.001, x: 0 }, "b18": { h: 1.23, y: 0.01, x: 0 }, "b19": { h: 1.182, y: 0.005, x: 0 }, "b20": { h: 1.147, y: 0.004, x: 0 }, "b21": { h: 1.132, y: 0.0, x: 0 }, "b22": { h: 1.085, y: 0.0, x: 0 }, "b23": { h: 1.089, y: 0.0, x: 0 }, "b24": { h: 1.361, y: 0.029, x: 0 }, "b25": { h: 1.188, y: 0.012, x: 0 }, "beast": { h: 1.099, y: 0.001, x: 0 }, "golem": { h: 1.099, y: 0.001, x: 0 }, "leaguemaster": { h: 1.091, y: 0.0, x: 0 }, "serpent": { h: 1.099, y: 0.001, x: 0 }, "tyrant": { h: 1.102, y: 0.001, x: 0 }, "wraith": { h: 1.096, y: 0.001, x: 0 } };
// A piece serving as a boss (pb_*) wears its own portrait, raised to the
// same queen-tall stature.
const PIECE_BOSS_FIT = { "alchemist": { h: 1.1, y: 0.0, x: 0 }, "amazon": { h: 1.121, y: 0.003, x: 0 }, "archbishop": { h: 1.119, y: 0.003, x: 0 }, "assassin": { h: 1.108, y: 0.002, x: 0 }, "bard": { h: 1.135, y: 0.001, x: 0 }, "bishop": { h: 1.131, y: 0.002, x: 0 }, "captain": { h: 1.117, y: 0.002, x: 0 }, "chancellor": { h: 1.107, y: 0.001, x: 0 }, "engineer": { h: 1.127, y: 0.003, x: 0 }, "gambit": { h: 1.116, y: 0.001, x: 0 }, "guardian": { h: 1.145, y: 0.003, x: 0 }, "hawk": { h: 1.176, y: 0.006, x: 0 }, "inquisitor": { h: 1.129, y: 0.002, x: 0 }, "king": { h: 1.126, y: 0.002, x: 0 }, "knight": { h: 1.118, y: 0.001, x: 0 }, "mage": { h: 1.114, y: 0.002, x: 0 }, "paladin": { h: 1.125, y: 0.002, x: 0 }, "pathfinder": { h: 1.14, y: 0.004, x: 0 }, "pawn": { h: 1.12, y: 0.001, x: 0 }, "queen": { h: 1.133, y: 0.002, x: 0 }, "rook": { h: 1.153, y: 0.003, x: 0 }, "seeress": { h: 1.124, y: 0.003, x: 0 }, "sorceress": { h: 1.118, y: 0.002, x: 0 }, "standard": { h: 1.112, y: 0.003, x: 0 }, "strategist": { h: 1.12, y: 0.002, x: 0 }, "warlock": { h: 1.11, y: 0.001, x: 0 } };

/* ── DER HELD IST KEIN BAUER MEHR (v1.0.48, Besitzerbefund) ────────────────
   Die alte Staffel begann bei 0.894 - MINIMAL KLEINER als ein Bauer (0.898).
   Das war stimmig, solange der Held erst spaet auftrat und Rang II ihm
   ohnehin sofort ein anderes Bild gab. Seit v1.0.45 traegt der Erwachte
   Rang I, und damit stand er kleiner als die Bauern, die er anfuehrt - der
   Besitzer hat es auf dem Geraet gesehen.

   Die Staffel beginnt jetzt ueber dem Turm (1.049) und steigt bis knapp an
   die Dame (1.133). Wer erwacht, ueberragt seine Reihe vom ersten Atemzug
   an; der Anstieg zwischen den Raengen bleibt spuerbar, wird aber flacher -
   die Groesse hat ihre Arbeit schon getan, das Bild macht den Rest.
   y waechst mit: der Fussversatz haelt den Sockel auf der Standlinie,
   sonst schwebte die Figur mit jeder Stufe hoeher ueber ihrem Feld. */
/* v1.0.57 (Besitzerbefund: "Gambit zu weit oben"). Die Staffel stammte aus
   v1.0.48, als der Held auf Turmgroesse wuchs - ich habe seinen Fussversatz
   damals mit den OFFIZIEREN verrechnet (Turm -0.1262). Er steht aber in der
   BAUERNREIHE, und dort ist der Nachbarwert -0.06. Neben acht Bauern hing er
   darum sichtbar in der Luft.
   Gemessen: der Leerraum unter dem Sockel ist bei Bauer (3.5 %) und Gambit
   (4.3 %) fast gleich - das Bild ist also nicht die Ursache, die Zahl war es.
   Jetzt beginnt die Staffel dicht am Bauern und steigt sanft: wer aufsteigt,
   wird groesser, aber sein Fuss bleibt auf derselben Linie wie der seiner
   Reihe. */
/* v1.0.59 (Besitzer: "noch zu hoch"): Stufe 1 steht jetzt EXAKT auf dem
   Bauernwert (-0.06) - er ist ein Bauer unter Bauern, nur groesser. */
/* v1.0.73 (Besitzer, endgueltig): "Der Grand Gambit ist immer ein bisschen
   hoeher und das sieht doof aus. Der muss genau gleich gross sein wie die
   Bauern und auch genau in der gleichen Position."
   DAS WAR DER REST DES ALTEN FEHLERS. v1.0.66 hat Stufe I auf den Bauernwert
   gezogen - aber der Besitzer spielt laengst mit einem hoeheren Rang, und
   BEIDE Staffeln stiegen weiter: die Hoehe bis 1.1330 (+6,6 % ueber dem
   Bauern) und der y-Versatz bis -0.0950 (der Held wanderte zusaetzlich nach
   oben). Wer Rang IV traegt, ragt sichtbar heraus - genau der Befund.
   Jetzt sind beide Staffeln FLACH auf dem Bauernwert: gleiche Groesse,
   gleiche Fusslinie, in jedem Rang. Der Aufstieg zeigt sich weiterhin am
   BILD (die sechs handgefuehrten Gemaelde), am Goldschein, an der Kontur
   und am Rangstern - nicht mehr an der Koerpergroesse. */
const GAMBIT_TIER_Y = [-0.0600, -0.0600, -0.0600, -0.0600, -0.0600, -0.0600];
/* v1.0.49: NULL. Die Figurenbilder sind seit diesem Stand selbst horizontal
   zentriert (93 Dateien, Restversatz unter einem halben Pixel), also braucht
   das Brett keinen Ausgleich mehr - und, wichtiger, Aufstellung und Hofstaat
   zeigen sie endlich an derselben Stelle. Vorher kannte nur das Brett den
   Versatz; ueberall sonst sass der Laeufer 10 % zu weit links und der Koenig
   4,7 % zu weit rechts. Der Besitzer hat es auf dem Geraet gesehen. */
const GAMBIT_TIER_X = [0, 0, 0, 0, 0, 0];
const GAMBIT_TIER_H = [1.0625, 1.0625, 1.0625, 1.0625, 1.0625, 1.0625];   // v1.0.73: flach, siehe oben

/* v1.0.49: DERSELBE VERSATZ, ABER UEBER DIE ID (Besitzerbefund).
   PAINTED_FIT haelt je Figur ein x - wie weit ihr Inhalt aus der Bildmitte
   sitzt. Das BRETT gleicht das seit jeher aus, der HOFSTAAT nicht: dort
   stand das Bild schlicht zentriert, und die Figuren sassen sichtbar neben
   ihrer Beschriftung. Gemessen ueber 40 Bilder: im Mittel zwar 0, aber mit
   Ausreissern bis 10 % der Breite - genug, um ins Auge zu fallen.
   paintedFitFor braucht ein Spielfigur-Objekt und geht ueber kind; Karten
   kennen aber ihre ID. Darum dieser Zugang. */
/* ── DER SOCKEL IST DER ANKER (v1.0.52) - UND ER WURDE FALSCH GEMESSEN
   (v1.0.56, Besitzerbefund mit Bildern: "schau wie Schildtraeger, Bishop und
   Dame jeweils immer zu weit rechts sind").

   Zwei Fehler lagen uebereinander. Der erste war v1.0.49: PAINTED_FIT.x misst
   die GESAMTE Silhouette, und ein Laeufer mit Mitra und Stab zieht sie zur
   Seite, waehrend sein Sockel gerade steht. Das war in v1.0.52 erkannt.

   Der zweite steckte in der MESSUNG selbst und hat mich drei Anlaeufe
   gekostet: ich zaehlte jedes Pixel ab Alpha 12 als Inhalt. Damit gingen der
   weiche Schlagschatten und der halbtransparente Saum mit ein - und die
   liegen ziemlich symmetrisch um die Figur, egal wo der Sockel wirklich
   steht. Die Messung sagte darum brav "fast zentriert" (Laeufer +0.7 %),
   waehrend der Besitzer auf seinem Geraet einen deutlichen Versatz sah.
   Ab Alpha 60 zaehlt nur noch das HOLZ: Laeufer +9.0 %, Schildtraeger
   +6.1 %, Dame +3.8 % - genau die drei, die er benannt hat, und in genau
   der Reihenfolge.

   Lehre: eine Schwelle ist eine Entscheidung darueber, WAS man misst. Alpha
   12 hat den Schatten zur Figur erklaert, und danach war jede weitere
   Rechnung sauber und trotzdem falsch.

   Gemessen wird die breiteste Zeile im unteren Drittel - der Aequator der
   Sockel-Ellipse. Ihn nimmt das Auge als Standpunkt.

   Das BRETT bleibt bei PAINTED_FIT.x: dort steht jede Figur allein auf ihrem
   Feld. Nur wo Figuren NEBENEINANDER stehen, zaehlt der gemeinsame Fuss. */
/* (Vorgaenger-Kommentar v1.0.52) ────────────────────
   "Du musst es ueber den Sockel mittig ausrichten." Genau da lag mein
   Fehler: PAINTED_FIT.x misst den Versatz der GESAMTEN Silhouette. Ein
   Laeufer mit Mitra und erhobenem Stab zieht seine Bounding-Box zur Seite,
   waehrend sein Sockel gerade steht - mein Ausgleich schob ihn daraufhin
   erst nach rechts. Ich habe es mit dem Fix schlimmer gemacht als vorher.

   SOCKEL_X misst stattdessen die Mitte der untersten 12 % des Bildinhalts:
   den Standfuss, und der ist es, an dem das Auge Figuren in einer Reihe
   ausrichtet. Gemessen ueber alle 65 Spielfassungen; nur Werte ab 0.6 %
   stehen hier, darunter ist es Rauschen.

   Das BRETT bleibt bei PAINTED_FIT.x - dort sitzt die Figur allein auf
   ihrem Feld, dort stimmt der Silhouetten-Ausgleich, und der Besitzer hat
   daran nie etwas auszusetzen gehabt. Kacheln stehen NEBENEINANDER, und
   nur dort zaehlt der gemeinsame Standfuss. */
/* v1.0.62: DIE TABELLE IST GESCHICHTE - DIE BILDER SELBST SIND GERICHTET.
   Fuenf Runden lang haben wir per Code verschoben, was in Wahrheit die
   BILDER schief trugen: der Sockel sass nicht in der Bildmitte (Laeufer
   -58 px!), die Silhouette schon. Kein Verschiebewert konnte beides
   zentrieren; die Schaukammer sah gut aus, der Reiter schief. Jetzt steht
   der Sockelfuss (unterste 5 Zeilen, Alpha>60) in jedem Bild exakt mittig
   (tools/richten - Leinwand erweitert, nie beschnitten; Kontaktbogen
   gesichtet). sockelVersatz() bleibt als Vertrag bestehen und antwortet 0.*/
const SOCKEL_X = {};

/** Der Sockelversatz einer Figur - fuer alles, was Figuren NEBENEINANDER
 *  zeigt (Hofstaat, Aufstellung, Verzeichnis). */
export const sockelVersatz = (id) => SOCKEL_X[id] || 0;

/** Welchen SOCKEL-Schluessel traegt diese Spielfigur? Folgt derselben
 *  Reihenfolge wie paintedRoh: Boss vor Held vor Figurenart. */
export function kunstId(piece) {
  if (!piece) return "";
  if (piece.bossId) return piece.bossId.startsWith("pb_") ? piece.bossId.slice(3) : "boss-" + piece.bossId;
  if (piece.hero) return "gambit";
  return KIND2ID[piece.kind] || "";
}

export const paintedFitById = (id) => PAINTED_FIT[id] || { h: 1, y: 0, x: 0 };

export function paintedFitFor(piece) {
  if (!piece || piece.big) return { h: 1, y: 0, x: 0 };
  if (piece.bossId) {
    // Same lookup chain as paintedForPiece, so the fit always matches the
    // portrait actually shown.
    if (piece.bossId.startsWith("pb_")) return PIECE_BOSS_FIT[piece.bossId.slice(3)] || { h: 1.113, y: 0, x: 0 };
    return BOSS_FIT[piece.bossId]
      || (piece.bossId === "b23" ? BOSS_FIT["archenemy"] : null)
      || (piece.bossId === "b25" ? BOSS_FIT["leaguemaster"] : null)
      || BOSS_FIT[piece.art || ""] || { h: 1.113, y: 0, x: 0 };
  }
  if (piece.hero) {
    const t = Math.min(6, Math.max(1, piece.tier || 1));
    return { h: GAMBIT_TIER_H[t - 1], y: GAMBIT_TIER_Y[t - 1] || 0, x: GAMBIT_TIER_X[t - 1] || 0 };
  }
  const id = KIND2ID[piece.kind];
  return (id && PAINTED_FIT[id]) || { h: 1, y: 0, x: 0 };
}

/** The enemy fields the same paintings, turned to cold steel by filter. */
/* v1.0.50 (Besitzerwunsch): die Gegnerseite MINIMAL dunkler - 1.02 -> 0.95.
   Zusammen mit dem kraeftigeren Riss-Saum kippt die Lesart: nicht mehr
   "dieselben Figuren, anders gerahmt", sondern "etwas Dunkles traegt
   violettes Licht". */
export const ENEMY_FILTER = "saturate(0.6) brightness(0.95) contrast(1.04)"; // v0.39.6: die Figuren waren zu dunkel zum Erkennen - Helligkeit zurueck ueber 1, die Zugehoerigkeit traegt allein die violette KONTUR

/* v1.0.12 (Besitzer, VORLADER): jede Galerie-Quelle als flache Liste, damit
   der Erstlade-Schirm ALLE Gemaelde vorab in den HTTP-Speicher holt. */
export function alleGemaeldeQuellen() {
  const karten = [PAINTED, CLASSIC_PAINTED, KLASSIK_HELL, KLASSIK_DUNKEL];
  const out = new Set();
  for (const k of karten) for (const v of Object.values(k)) if (typeof v === "string") out.add(v);
  return [...out];
}
