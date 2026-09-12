/* ── DIE ANIMATIONEN DES SPIELS (v1.0.67, Besitzerauftrag) ──────────────────
 *
 * "Macht bitte einen sauberen Vorschlag durch das ganze Spiel hinweg, wo man
 *  ueberall sinnvoll Animationen platzieren kann - und setzt alles autonom
 *  um. Wichtig ist bloss, dass es am Ende die Moeglichkeit gibt, die
 *  Animationen an- und auszuschalten."
 *
 * DIESES MODUL IST DIE EINE LISTE. Jede Bewegung, die das Spiel zeigt, steht
 * hier im Register - mit Ort und Zweck. Die Animationskammer (?animkammer,
 * hinter dem Torschloss) liest das Register und fuehrt jede einzeln vor; die
 * Proben in test_anim.mjs pruefen, dass Register, Kammer und Schalter
 * zusammenpassen. Was hier nicht steht, existiert nicht - und was hier
 * steht, laesst sich mit EINEM Schalter abstellen.
 *
 * DER SCHALTER: an ist der Alltag. Aus ist fuer zwei Faelle - ein Geraet,
 * das ruckelt, und ein Besitzer, der Ruhe will. Er liegt im Geraetespeicher
 * (wie das Torschloss), nicht im Profil: ob ein Geraet Animationen schafft,
 * ist eine Eigenschaft des GERAETS. Wer im Betriebssystem "Bewegung
 * reduzieren" gewaehlt hat, startet mit aus - die Wahl in Kammer oder Profil
 * sticht danach.
 *
 * DASSELBE MUSTER WIE SPARMODUS UND GEGNERSTIL: Modul-Singleton, beim Start
 * gelesen, zur Zeichenzeit abgefragt. Kein Prop durch zwanzig Ebenen.
 */

const SCHLUESSEL = "gg:anim";

let an = true;
try {
  const g = localStorage.getItem(SCHLUESSEL);
  if (g === "0") an = false;
  else if (g == null && typeof matchMedia !== "undefined"
    && matchMedia("(prefers-reduced-motion: reduce)").matches) an = false;
} catch {}

export function animAn() { return an; }
export function setAnimAn(neu) {
  an = !!neu;
  try { localStorage.setItem(SCHLUESSEL, an ? "1" : "0"); } catch {}
}

/* ── DAS REGISTER ───────────────────────────────────────────────────────────
 * bereich: brett | belohnung | figuren
 * ausloeser: was die Kammer beschreibt und die Vorfuehrung nachstellt. */
export const ANIMATIONEN = [
  { id: "schweif",  bereich: "brett", name: "Zugschweif",
    was: "Der goldene Strahl hinter jedem Zug - jetzt kräftiger, mit hellem Kern und kurzem Aufglühen am Ziel." },
  { id: "einschlag", bereich: "brett", name: "Schlagarten",
    was: "Jede Figurenart trifft auf ihre Weise: der Bauer stößt, der Springer landet mit Satz, Läufer und Assassine schlitzen, der Turm rammt, die Wache schiebt, Dame und König richten." },
  { id: "feuer",    bereich: "brett", name: "Drachenfeuer",
    was: "Schlägt der Drache auf Distanz, fährt eine Feuerzunge vom Maul zum Ziel - statt eines stummen Treffers." },
  { id: "atmen",    bereich: "brett", name: "Lebende Aufstellung",
    was: "Jede Figur atmet kaum merklich und versetzt zu ihren Nachbarn - das Brett wirkt belebt, ohne zu zappeln." },
  { id: "schach",   bereich: "brett", name: "Schachpuls",
    was: "Steht der eigene König im Schach, pulst ein roter Saum unter ihm - man übersieht es nicht mehr." },
  { id: "matt",     bereich: "brett", name: "Königsfall",
    was: "Beim Matt kippt der geschlagene König langsam zur Seite, statt einfach zu verschwinden." },
  { id: "stufe",    bereich: "brett", name: "Stufenglanz auf dem Brett",
    was: "Steigt eine Figur mitten im Gefecht auf, birst ein goldener Stern über ihr und die Rangzahl springt ins Auge." },
  { id: "muenzen",  bereich: "belohnung", name: "Münzregen",
    was: "Verdientes Gold fällt als drehende Münzen ins Banner, der Betrag zählt hoch statt einfach dazustehen." },
  { id: "beute",    bereich: "belohnung", name: "Gestaffelte Beute",
    was: "Sieg-Banner und Belohnungszeilen treten nacheinander auf - erst der Titel, dann Erfahrung, Gold, Funde." },
  { id: "glanz",    bereich: "figuren", name: "Verbessern-Glanz",
    was: "Beim Verbessern läuft ein Lichtstreif über das Porträt und ein Sternenstoß feiert die neue Stufe - auch wenn das Bild dasselbe bleibt." },
  { id: "trank",    bereich: "brett", name: "Lebenstrank",
    was: "Beim Einsatz eines Trankes läuft ein roter Heilglanz einmal von unten nach oben DURCH die Figur - maskiert auf ihr eigenes Gemälde, nicht über das Feld." },
  { id: "sanduhr",  bereich: "brett", name: "Zeitenwender",
    was: "Verbrennt eine Sanduhr, pulst die Uhr dreimal golden auf - die zurückgeholte Zeit hat einen Ort." },
  { id: "faehigkeit", bereich: "figuren", name: "Fähigkeitsglanz",
    was: "Bringt die neue Stufe eine Fähigkeit, läuft der Lichtstreif VIOLETT statt gold, und die frisch erwachte Sprosse pulst in der Leiter auf." },
];

export const animById = (id) => ANIMATIONEN.find((a) => a.id === id) || null;

/* ── DIE SCHLAGART JE FIGUR ─────────────────────────────────────────────────
 * "dass jede Figur auf eine andere Art und Weise zieht - ein Schildtraeger,
 *  der schiebt sozusagen." Vier Handschriften reichen, damit es lesbar
 *  bleibt; mehr wuerde zum Ratespiel:
 *   stoss   kurzer gerader Stoss in Zugrichtung (Bauer, Wache, Hauptmann,
 *           Standarte - alles, was mit dem Schild arbeitet)
 *   klinge  ein heller Schlitzbogen (Springer, Laeufer, Assassine, Amazone,
 *           Klingen und Reiter)
 *   wucht   ein satter Rammstoss mit Beben (Turm, Golem, Kanzler - die
 *           Schweren)
 *   bann    ein aufrechter Lichtstoss (Dame, Koenig, Erzbischof, Magier -
 *           die Wuerde schlaegt nicht, sie richtet)
 * Der Drache traegt zusaetzlich das Feuer (eigener Registereintrag). */
/* ── EIN SCHLAG KLINGT WIE EIN SCHLAG (v1.1.1, Besitzerentscheid) ──────────
   "Wenn man eine Figur schlaegt, wuerde ich immer den Ton nehmen, den man
   auch hat, wenn man mit einem Bauern eine Figur schlaegt, und da keine
   Unterscheidung machen. Natuerlich darf das bei einem Fernangriff etwas
   anderes sein, oder wenn man eine Mauer zerstoert."

   Vorher trug jede Figurenart ihren eigenen Schlag - fuenf verschiedene
   Toene, und weil in einer Partie ununterbrochen geschlagen wird, klang das
   Brett unruhig. Jetzt gilt EIN Ton fuer jeden Nahkampf: "stoss", derselbe
   wie beim Bauern. Der Drache behaelt sein Feuer, weil das kein Schlag ist,
   sondern ein Atem - und Fernkampf und Sperren werden ohnehin an anderer
   Stelle geklungen (siehe klang("fern") und die Sperrklaenge unten). */
const SCHLAG = { D: "feuer" };
export function schlagArt(kind) { return SCHLAG[kind] || "stoss"; }
export const SCHLAG_ARTEN = ["stoss", "klinge", "wucht", "bann", "feuer"];
