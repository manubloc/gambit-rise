// ── DIE FREISCHALT-ORDNUNG (v1.0.43, Besitzerentscheid) ─────────────────────
// Das Spiel oeffnet sich in Schritten, nicht auf einmal. Der Besitzer hat die
// Reihenfolge festgelegt:
//
//   1. Kapitel I ist reines Schach. Kein Held, keine Aufstellung, keine
//      Lebenspunkte. Man spielt Schach und lernt das Brett.
//   2. Der Grand Gambit erwacht relativ zuegig (drei geschaffte Stationen).
//      In diesem Moment: Stufe 2, ein sichtbar anderer Auftritt, seine erste
//      Faehigkeit - und er darf frei gesetzt werden. Nur ER, sonst nichts.
//   3. Die hintere Reihe bleibt vorerst, wie sie ist. Sie frei zu stellen
//      wird erst freigeschaltet, wenn die erste fremde Figur beitritt.
//   4. Das Erwachen der Lebenspunkte (Schwelrain, Kapitel II) bringt HP,
//      Angriff und die Talente, die daran haengen.
//
// WARUM HIER UND NICHT VERSTREUT: jede dieser Freigaben braucht drei Dinge -
// eine Bedingung, einen Namen und einen Satz, der sie erklaert. Lagen die
// verstreut, wuerde frueher oder spaeter eine Freigabe aufgehen, ohne dass
// jemand dem Spieler sagt, was er jetzt darf. Genau das ist das Muster, das
// dieses Haus schon mehrfach Zeit gekostet hat: etwas wirkt, aber niemand
// sieht es.
//
// JEDE FREIGABE ERKLAERT SICH EINMAL. Der Merker steht im Spielstand unter
// profile.gesehen; erklaertWas() liefert die Freigaben, die aufgegangen sind,
// aber noch nichts gesagt haben.
import { CHARACTER_LIST } from "../content/index.js";
import { gambitWach, hpWach } from "./leveling.js";
import { CAMPAIGN12 } from "../content/campaign12.gen.js";

/* Die sieben Grundfiguren stehen von Anfang an im Heer - sie "treten" nicht
   "bei". Beitreten heisst: eine Figur, die man sich verdient hat. */
/** Ist schon eine fremde Figur beigetreten? */
/* v1.34.0 (Besitzer, 21./22.9.): "Liga 1, Reihe 5 des Hauptstrangs: einmalige
   Belohnung - ab jetzt darf der Spieler seine Startaufstellung aendern."
   Reihe 5 hat drei Hauptstrang-Stationen; der Sieg an IRGENDEINER genuegt
   (Besitzerentscheid 22.9.). Vorher oeffnete die erste beigetretene Figur
   die Reihe. Die Stationen kommen aus den Kampagnendaten, nicht aus einer
   zweiten Liste. */
export const REIHE_FUENF = CAMPAIGN12.filter((s) => s.league === 1 && s.haupt && s.row === 5).map((s) => s.id);
function reiheFuenfGeschafft(profile) {
  const erledigt = profile?.campaign?.cleared || [];
  return REIHE_FUENF.some((id) => erledigt.includes(id));
}

/* Die Ordnung selbst. Reihenfolge ist Absicht: so tauchen sie auch im
   Spielerbuch und in der Erklaerung auf. */
export const FREIGABEN = [
  {
    id: "held",
    wenn: gambitWach,
    titelDe: "Der Grand Gambit erwacht",
    titelEn: "The Grand Gambit awakens",
    /* v1.0.50: "Kapuze, Stab und Klinge" beschrieb das ALTE Erwachten-Bild.
       Seit v1.0.49 tritt er in Gold an - der Text folgt dem Bild. */
    textDe: "Einer deiner Bauern will ein anderer sein. Von nun an tritt er "
      + "in Gold an — er stürmt zwei Felder vor, wann immer der Weg frei ist, "
      + "und er schlägt geradeaus, was kein Bauer kann. "
      + "Vor jeder Partie darfst du entscheiden, in welcher Spalte er antritt.",
    textEn: "One of your pawns wants to be someone else. From now on he "
      + "stands in gold — he charges two squares whenever the path is clear, "
      + "and he strikes straight ahead, which no pawn can do. Before each match you may choose the file he stands in.",
  },
  {
    id: "hinterereihe",
    wenn: reiheFuenfGeschafft,
    titelDe: "Die hintere Reihe öffnet sich",
    titelEn: "The back rank opens",
    textDe: "Du hast die fünfte Reihe bezwungen. Zum Lohn darfst du ab jetzt die "
      + "hintere Reihe frei aufstellen — jede Figur auf jede Position, für jedes "
      + "Brett getrennt.",
    textEn: "You have conquered the fifth row. As your reward you may now arrange "
      + "the back rank freely — any figure in any position, saved per board.",
  },
  {
    /* v1.0.50 (Besitzerentscheid): BESTECHEN WILL VERDIENT SEIN. Der Knopf
       stand bisher von Anfang an im Monsterbaum - fuer einen Spieler, der
       noch nie ein Monster gesehen hat, ein Raetsel ohne Kontext. Jetzt:
       erst wer ein echtes Monster BESIEGT hat (codex.beaten, geschrieben im
       GameScreen), bekommt es erklaert und darf es tun. */
    id: "bestechen",
    wenn: (p) => (p?.codex?.beaten || []).length > 0,
    titelDe: "Gold öffnet Mäuler",
    titelEn: "Gold opens mouths",
    textDe: "Du hast ein Monster bezwungen — und manche von ihnen haben es "
      + "gesehen. Nicht jedes Untier kämpft aus Treue. Im Verzeichnis kannst "
      + "du begegnete Monster mit viel Gold und dem Opfer einer Kronfigur an "
      + "deinen Hof holen. Tyrannen und die Namhaften sind unbestechlich.",
    textEn: "You have felled a monster — and some of them saw it happen. Not "
      + "every beast fights out of loyalty. In the codex you may bring "
      + "monsters you have met to your court, for a great deal of gold and "
      + "the sacrifice of a crown piece. Tyrants and the named are beyond "
      + "corruption.",
  },
  {
    id: "leben",
    wenn: hpWach,
    titelDe: "Das Erwachen",
    titelEn: "The Awakening",
    textDe: "Figuren fallen nicht mehr auf den ersten Schlag. Sie tragen "
      + "Lebenspunkte und Angriff — und Talente, die es ohne sie nicht geben "
      + "konnte.",
    textEn: "Figures no longer fall to the first blow. They carry hit points "
      + "and attack — and talents that could not exist without them.",
  },
];

/** Ist diese Freigabe offen? */
export function freigegeben(profile, id) {
  const f = FREIGABEN.find((x) => x.id === id);
  return !!f && !!f.wenn(profile);
}

/** Darf der Held frei gesetzt werden? */
export const darfHeldSetzen = (profile) => freigegeben(profile, "held");

/** Darf die hintere Reihe frei aufgestellt werden? */
export const darfReiheStellen = (profile) => freigegeben(profile, "hinterereihe");

/* DERSELBE MERKER WIE DIE LEHRSTUNDEN. Das Spiel hat mit profile.notices und
   SET_NOTICE laengst einen Topf fuer "das wurde einmal gesagt". Ein zweiter
   daneben waere eine zweite Wahrheit - und die eine Sorte Fehler, die man
   erst merkt, wenn ein Spielstand aus der alten Zeit auftaucht. Also
   dieselbe Schublade, nur mit eigenem Praefix. */
export const merkschluessel = (id) => "frei:" + id;

/** Welche Freigaben sind offen, haben sich aber noch nicht erklaert?
 *  In der Reihenfolge der Ordnung - gehen zwei zugleich auf, kommt die
 *  fruehere zuerst. */
export function erklaertWas(profile) {
  const n = profile?.notices || {};
  return FREIGABEN.filter((f) => f.wenn(profile) && !n[merkschluessel(f.id)]);
}

/** Die naechste, die etwas zu sagen hat - oder null. */
export const naechsteErklaerung = (profile) => erklaertWas(profile)[0] || null;

/** Merkt, dass eine Freigabe erklaert wurde. Gibt ein NEUES Profil zurueck -
 *  der Speicher haelt JSON-Strings, keine Objekte, also nie am Original
 *  herumschreiben. */
export function merkeErklaert(profile, id) {
  return { ...profile,
    notices: { ...(profile?.notices || {}), [merkschluessel(id)]: true } };
}
