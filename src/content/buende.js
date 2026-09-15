/* ══════════════════════════════════════════════════════════════════════════
   DIE BUENDE  (v1.9.0)

   Besitzeridee, in seinen Worten: "Ich fände noch so was cool, dass es
   manche Figuren gibt, die einen Partner- oder Gruppenbonus bekommen. Wenn
   man diese Figuren gleichzeitig in seine Aufstellung nimmt, dann bekommt
   man irgendeinen Bonus."

   ZEHN BUENDE, 23 FIGUREN, JEDE GENAU EINMAL. Draussen bleiben nur Bauer,
   Grand Gambit und der Drache - die Grundlage und das Monster. Der Drache
   bleibt ausdruecklich allein ("Der Drache muss aber allein bleiben").

   JEDER BUND WIRKT ERST, WENN ALLE SEINE FIGUREN AUF HOECHSTSTUFE STEHEN.
   Das ist der Kern des Entwurfs: ein Bund ist kein Geschenk fuer die
   Aufstellung, sondern der Lohn dafuer, zwei oder drei Figuren ganz
   ausgebaut zu haben - und das kostet Skillpunkte, die woanders fehlen.

   JEDE REGEL IST EIN SATZ. Der Besitzer hat einen ersten Entwurf verworfen,
   weil er zu verschachtelt war: "Es soll immer einfache Dinge sein, die
   dadurch ermoeglicht werden."
   ══════════════════════════════════════════════════════════════════════════ */

export const BUENDE = {
  krone: {
    id: "krone",
    stimmung: "hof",
    nameDe: "Krone", nameEn: "Crown",
    /* Die Dame gehoert dazu - GEFUNDEN beim Abgleich gegen den Bestand: sie
       war als "Traegerin" gedacht wie der Koenig, stand damit aber in keinem
       Bund und waere als einzige Figur uebrig geblieben. Der Hof ist zu
       dritt: der Koenig, die ihn beraet, und der sich vor ihn stellt. */
    figuren: ["paladin", "king", "queen"],
    /* NUR NEBENAN (Besitzer ausdruecklich): "Das gilt nur, wenn er neben dem
       Koenig auch steht. Der darf nicht irgendwo stehen." Ein Leibwaechter,
       der quer ueber dem Brett schuetzt, waere keiner. */
    nachbarschaft: true,
    regelDe: "Steht der Paladin direkt neben dem König, fängt er einen Treffer für ihn ab.",
    regelEn: "Standing beside the king, the paladin takes one hit for him.",
    storyDe: "Er schwor keinen Eid. Er stellte sich nur immer dorthin, wo der Schlag ankam.",
    storyEn: "He swore no oath. He simply always stood where the blow would land.",
  },
  konzil: {
    id: "konzil",
    stimmung: "hof",
    nameDe: "Konzil", nameEn: "Council",
    figuren: ["archbishop", "chancellor"],
    regelDe: "Der König darf einmal je Partie einen gegnerischen Schlag ablehnen.",
    regelEn: "Once per match the king may refuse an enemy strike.",
    storyDe: "Der eine hält den Glauben, der andere die Kasse. Sie verachten sich — und regieren gemeinsam, weil keiner ohne den anderen kann.",
  },
  geleit: {
    id: "geleit",
    stimmung: "hof",
    nameDe: "Geleit", nameEn: "Escort",
    figuren: ["knight", "bishop", "rook"],
    regelDe: "Einmal je Partie tauschen zwei von ihnen die Plätze.",
    regelEn: "Once per match two of them swap places.",
    storyDe: "Die drei, die schon da waren, als es noch kein Reich gab.",
  },
  faehrte: {
    id: "faehrte",
    stimmung: "wildnis",
    nameDe: "Fährte", nameEn: "Trail",
    figuren: ["hawk", "pathfinder"],
    regelDe: "Zieht einer von beiden, rückt der andere ein Feld nach.",
    regelEn: "When one of them moves, the other follows one square.",
    storyDe: "Einer liest die Spur, einer geht sie. Getrennt sind sie nur halb so weit gekommen.",
  },
  schatten: {
    id: "schatten",
    stimmung: "riss",
    nameDe: "Schatten", nameEn: "Shadow",
    figuren: ["assassin", "sorceress", "mage"],
    /* Der Besitzer hat die Regel selbst geschaerft: nicht dauerhaft
       unsichtbar, sondern nur solange die beiden STILLSTEHEN. "In dem
       Moment, wo man ihn bewegt, zeigt man den Attentaeter." Das macht aus
       einer Faehigkeit, die einfach laeuft, eine Entscheidung in jedem Zug. */
    regelDe: "Der Attentäter ist unsichtbar — bis du Hexerin oder Magier ziehst. Dann zeigt er sich für einen Zug.",
    regelEn: "The assassin is unseen — until you move the sorceress or mage. Then he shows for one turn.",
    storyDe: "Solange die beiden stillhalten, hält auch die Dunkelheit. Wer sie ruft, verrät ihn.",
  },
  schildwacht: {
    id: "schildwacht",
    stimmung: "schmiede",
    nameDe: "Schildwacht", nameEn: "Shieldwatch",
    figuren: ["engineer", "guardian"],
    /* Auch hier eine Ortsbedingung (Besitzer): "Die muessten in dem Moment
       aber auch in einer Reihe stehen - das kann vertikal wie horizontal
       sein, je nachdem wie die halt stehen." */
    reihe: true,
    regelDe: "Stehen beide in derselben Reihe oder Linie, tragen alle eigenen Figuren dort einen Schild.",
    regelEn: "Sharing a rank or file, they shield every friendly piece on it.",
    storyDe: "Der eine baut, der andere hält. Zwischen ihnen steht niemand ungedeckt.",
  },
  gezeiten: {
    id: "gezeiten",
    stimmung: "wildnis",
    nameDe: "Gezeiten", nameEn: "Tides",
    figuren: ["captain", "strategist"],
    regelDe: "Der Kapitän zieht durch besetzte Felder hindurch.",
    regelEn: "The captain moves through occupied squares.",
    storyDe: "Ein Kapitän ohne Lotsen läuft auf Grund. Mit Lotsen kommt er überall durch.",
  },
  bannkreis: {
    id: "bannkreis",
    stimmung: "riss",
    nameDe: "Bannkreis", nameEn: "Warding",
    figuren: ["seeress", "inquisitor"],
    regelDe: "Gegnerische Talente im Umkreis von zwei Feldern um die beiden sind gesperrt.",
    regelEn: "Enemy talents within two squares of either are sealed.",
    storyDe: "Sie sieht, was kommt. Er verbietet es. Zusammen sind sie eine Wand, durch die kein Zauber geht.",
  },
  sturm: {
    id: "sturm",
    stimmung: "schmiede",
    nameDe: "Sturm", nameEn: "Storm",
    figuren: ["amazon", "warlock"],
    /* GEMESSEN UND GEAENDERT: der erste Entwurf gab der Amazone einen
       zusaetzlichen Fernkampfschuss. Sie hat aber mit 24 Leben und 14 Angriff
       die staerksten Werte im Spiel - mehr Feuerkraft haette den Bund
       erdrueckend gemacht. Der Rueckruf wirkt EINMAL und macht sie nicht
       staerker, sondern schwerer loszuwerden. */
    regelDe: "Wird die Amazone geschlagen, kehrt sie einmal je Partie auf ihr Startfeld zurück.",
    regelEn: "Struck down, the amazon returns once per match to her starting square.",
    storyDe: "Sie fiel. Er rief. Sie stand wieder auf, und niemand sprach je darüber.",
  },
  trinklied: {
    id: "trinklied",
    stimmung: "schmiede",
    nameDe: "Trinklied", nameEn: "Drinking Song",
    figuren: ["alchemist", "bard", "standard"],
    regelDe: "Der Alchemist heilt zu Beginn deines Zuges eine angrenzende eigene Figur um einen Punkt.",
    regelEn: "At the start of your turn the alchemist heals one adjacent friendly piece by one.",
    storyDe: "Drei, die abends zusammensitzen, während der Hof schläft. Am Morgen ist jeder wieder heil.",
  },
};

/* ── VIER STIMMUNGEN STATT 24 HINTERGRUENDEN (v1.9.1) ─────────────────────
   Jeder Bund traegt eine von vier Kulissen, und jede Figur erbt sie von
   ihrem Bund. Der Besitzer wollte es so: "Ich finde es gut, wenn es nicht zu
   viele Hintergruende sind, aber ein paar unterschiedliche."

   Vier statt 24 hat zwei Vorteile: das Buendel bleibt schlank (156 KB fuer
   alle vier statt weit ueber einem Megabyte), und die Zugehoerigkeit wird
   SICHTBAR - wer die Karten nebeneinander sieht, erkennt die Bruder- und
   Schwesternschaften, ohne ein Zeichen lesen zu muessen. */
export const STIMMUNGEN = ["hof", "wildnis", "riss", "schmiede"];
const _ZU_STIMMUNG = new Map();
for (const b of Object.values(BUENDE)) for (const f of b.figuren) _ZU_STIMMUNG.set(f, b.id);

/** Welche Kulisse traegt diese Figur? Ueber ihren Bund; sonst der Hof. */
export function stimmungVon(charId) {
  const b = BUENDE[_ZU_STIMMUNG.get(charId)];
  return b ? b.stimmung : "hof";
}

export const BUND_LISTE = Object.values(BUENDE);

/** Zu welchem Bund gehoert eine Figur? Null, wenn sie in keinem steht. */
const _ZU = new Map();
for (const b of BUND_LISTE) for (const f of b.figuren) _ZU.set(f, b.id);
export const bundVon = (charId) => _ZU.get(charId) || null;

/**
 * Ist der Bund erwacht? Nur wenn ALLE seine Figuren auf Hoechststufe stehen.
 * @param stufeVon  (charId) => Stufe
 * @param maxVon    (charId) => Hoechststufe dieser Figur
 */
export function bundErwacht(bundId, stufeVon, maxVon) {
  const b = BUENDE[bundId];
  if (!b) return false;
  return b.figuren.every((f) => (stufeVon(f) || 0) >= (maxVon(f) || 10));
}

/** Alle erwachten Buende - fuer die Anzeige und fuer den Kern. */
export function erwachteBuende(stufeVon, maxVon) {
  return BUND_LISTE.filter((b) => bundErwacht(b.id, stufeVon, maxVon)).map((b) => b.id);
}
