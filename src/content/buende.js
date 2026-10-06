/* ══════════════════════════════════════════════════════════════════════════
   DIE BUENDE  (v1.9.0)

   Besitzeridee, in seinen Worten: "Ich fände noch so was cool, dass es
   manche Figuren gibt, die einen Partner- oder Gruppenbonus bekommen. Wenn
   man diese Figuren gleichzeitig in seine Aufstellung nimmt, dann bekommt
   man irgendeinen Bonus."

   ACHTZEHN BUENDE (seit v1.91.0; vorher zehn), 47 FIGUREN, JEDE GENAU EINMAL.
   Draussen bleiben nur Bauer,
   Gambit und der Drache - die Grundlage und das Monster. Der Drache
   bleibt ausdruecklich allein ("Der Drache muss aber allein bleiben").

   EIN BUND WIRKT, SOBALD ALLE SEINE FIGUREN IN DER AUFSTELLUNG STEHEN
   (v1.91.0, Besitzerentscheid 6.10.2026). Bis v1.90.36 brauchte es dafuer
   die Hoechststufe aller Mitglieder - "dann hat man mehr den Drang, an die
   Figuren zu kommen", sagt der Besitzer, wenn der Bund schon mit dem Besitz
   wirkt. Der Preis bleibt: jedes Mitglied kostet einen Platz in der Reihe.

   JEDE REGEL IST EIN SATZ. Der Besitzer hat einen ersten Entwurf verworfen,
   weil er zu verschachtelt war: "Es soll immer einfache Dinge sein, die
   dadurch ermoeglicht werden."
   ══════════════════════════════════════════════════════════════════════════ */

export const BUENDE = {
  krone: {
    id: "krone",
    stimmung: "hof",
    nameDe: "Krone", nameEn: "Crown",
    figuren: ["paladin", "king"],
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
    /* Die Dame gehoert in den RAT, nicht zur Leibwache (Besitzerentscheid).
       Ein erster Entwurf hatte sie in die Krone gesetzt - aber dort trug sie
       keine eigene Rolle, sie war nur dabei, damit keine Figur uebrig bleibt.
       Im Konzil ist sie am Platz: der Rat, der dem Koenig in den Arm faellt,
       besteht aus Glauben, Kasse und der, die ihn am laengsten kennt. */
    figuren: ["archbishop", "chancellor", "queen"],
    regelDe: "Der König darf einmal je Partie einen gegnerischen Schlag ablehnen.",
    regelEn: "Once per match the king may refuse an enemy strike.",
    storyDe: "Der eine hält den Glauben, der andere die Kasse, sie hält beide aus. Kein Schlag trifft den König, den dieser Rat nicht gesehen hat.",
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
    regelDe: "Der Kapitän zieht durch eigene Figuren hindurch.",
    regelEn: "The captain moves through friendly pieces.",
    /* KEIN "LOTSE" - den gibt es nicht (Besitzerbefund: "es gibt doch
       ueberhaupt keinen Lotse oder?"). Die Figur heisst STRATEGE. Wer in
       einer Erklaerung einen Namen erfindet, den das Spiel nicht kennt,
       schickt den Spieler auf die Suche nach etwas, das es nirgends gibt. */
    storyDe: "Ein Kapitän allein läuft auf Grund. Der Stratege kennt die eigene Flotte und weiß, wo Platz ist.",
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
  nachtwache: {
    id: "nachtwache",
    stimmung: "schmiede",
    /* HIESS "TRINKLIED" (Besitzerbefund: "vom Naming noch nicht perfekt").
       Er hatte recht - der Name klang nach Kneipe, der Bund aber HEILT.
       "Nachtwache" traegt dieselbe Geschichte (drei, die aufbleiben, waehrend
       der Hof schlaeft), erklaert das Heilen ohne es zu benennen, und es
       passt zu den anderen: Krone, Konzil, Geleit, Faehrte, Schatten,
       Schildwacht, Gezeiten, Bannkreis, Sturm - alles Dinge, keine
       Handlungen. */
    nameDe: "Nachtwache", nameEn: "Night Watch",
    /* v1.91.0 (Besitzer 6.10.2026): "der Nachtwaechter muss natuerlich in den
       Bund Nachtwache" - er nimmt den Platz des gestrichenen Flaggentraegers. */
    figuren: ["alchemist", "bard", "watchman"],
    regelDe: "Der Alchemist heilt zu Beginn deines Zuges eine angrenzende eigene Figur um einen Punkt.",
    regelEn: "At the start of your turn the alchemist heals one adjacent friendly piece by one.",
    storyDe: "Drei, die aufbleiben, während der Hof schläft. Am Morgen ist jeder wieder heil.",
    storyEn: "Three who stay up while the court sleeps. By morning everyone is whole again.",
  },

  /* ══ v1.91.0: ACHT NEUE BUENDE (Besitzer 6.10.2026) ═══════════════════════
     "Also Metzger, Koch und Mueller gehoeren zusammen, Gelehrter,
      Steuereintreiber und Bankier - und mach gerne noch Vorschlaege fuer die
      anderen." Die uebrigen sechs sind am 6.10. vorgeschlagen und mit der
      Gesamtuebersicht freigegeben worden.

     DIE FRUEHEN SECHS SIND FRIEDLICH: Gold, Sperren, ein Leben mehr - nichts,
     was eine Partie allein entscheidet. Dorf, Werkstatt und Kontor wirken auch
     im reinen Schach von Kapitel I (sie zahlen nach der Partie oder in der
     Setzphase); Kueche, Kloster und Jagd brauchen Lebenspunkte und kommen mit
     dem Erwachen in Kapitel II. Turnier und Finsternis sind Kampfbuende.
     Jede Regel bleibt EIN Satz. */
  dorf: {
    id: "dorf",
    stimmung: "wildnis",
    nameDe: "Dorf", nameEn: "Village",
    figuren: ["farmwife", "beggar", "jester"],
    regelDe: "Jeder eigene Bauer, der die Partie überlebt, bringt 2 Gold.",
    regelEn: "Every pawn of yours that survives the match earns 2 gold.",
    storyDe: "Niemand im Dorf fragt, wer gewonnen hat. Man zählt, wer zum Abendbrot wieder da ist.",
    storyEn: "Nobody in the village asks who won. They count who is back for supper.",
  },
  werkstatt: {
    id: "werkstatt",
    stimmung: "schmiede",
    nameDe: "Werkstatt", nameEn: "Workshop",
    figuren: ["smith", "craftsman"],
    regelDe: "Vor jeder Partie setzt du einen Zaun, ohne ihn kaufen zu müssen.",
    regelEn: "Before every match you place one fence without having to buy it.",
    storyDe: "Der eine schlägt das Eisen, der andere setzt den Pfosten. Bis der Feind kommt, steht der Zaun.",
    storyEn: "One strikes the iron, the other sets the post. By the time the enemy comes, the fence stands.",
  },
  kontor: {
    id: "kontor",
    stimmung: "hof",
    nameDe: "Kontor", nameEn: "Counting House",
    figuren: ["scholar", "taxman", "banker"],
    regelDe: "Jeder Sieg bringt ein Viertel mehr Gold.",
    regelEn: "Every win pays a quarter more gold.",
    storyDe: "Einer rechnet, einer treibt ein, einer legt an. Am Ende gehört ihnen der Tisch, an dem gespielt wird.",
    storyEn: "One reckons, one collects, one invests. In the end they own the table the game is played on.",
  },
  kueche: {
    id: "kueche",
    stimmung: "schmiede",
    nameDe: "Küche", nameEn: "Kitchen",
    figuren: ["butcher", "cook", "miller"],
    regelDe: "Alle drei beginnen jede Partie mit einem Leben mehr.",
    regelEn: "All three begin every match with one more life.",
    storyDe: "Mehl, Fleisch und Feuer. Wer bei diesen dreien am Tisch sitzt, steht länger.",
    storyEn: "Flour, meat and fire. Whoever eats at their table stands longer.",
  },
  kloster: {
    id: "kloster",
    stimmung: "hof",
    nameDe: "Kloster", nameEn: "Cloister",
    figuren: ["monk", "healer"],
    regelDe: "Bauern neben Mönch oder Heilerin nehmen bei jedem Treffer einen Schaden weniger.",
    regelEn: "Pawns beside the monk or the healer take one damage less from every hit.",
    storyDe: "Er betet für die Kleinen, sie verbindet sie. Beides hilft — niemand weiß, was mehr.",
    storyEn: "He prays for the small ones, she binds their wounds. Both help — nobody knows which helps more.",
  },
  jagd: {
    id: "jagd",
    stimmung: "wildnis",
    nameDe: "Jagd", nameEn: "Hunt",
    figuren: ["huntress", "ranger", "trapper"],
    regelDe: "Wer eine der drei schlägt, ist seinen nächsten Zug lang gefesselt.",
    regelEn: "Whoever strikes down one of the three is fettered for their next move.",
    storyDe: "Wer einen von ihnen erlegt, steht schon im Eisen des nächsten.",
    storyEn: "Whoever brings one of them down already stands in the next one's iron.",
  },
  turnier: {
    id: "turnier",
    stimmung: "hof",
    nameDe: "Turnier", nameEn: "Tournament",
    figuren: ["cavalier", "fencer", "spearman", "gladiator"],
    regelDe: "Alle vier treffen mit einem Angriff mehr.",
    regelEn: "All four strike with one more attack.",
    storyDe: "Vier, die einander oft genug gegenüberstanden, um zu wissen, wohin der andere schlägt.",
    storyEn: "Four who have faced one another often enough to know where the other will strike.",
  },
  finsternis: {
    id: "finsternis",
    stimmung: "riss",
    nameDe: "Finsternis", nameEn: "Darkness",
    figuren: ["executioner", "samurai", "jailer"],
    regelDe: "Was einer der drei schlägt, steht nicht wieder auf — kein Unsterblich, kein Geist, keine Rückkehr.",
    regelEn: "What one of the three strikes down does not rise again — no undying, no wraith, no return.",
    storyDe: "Der eine schließt ab, der andere vollstreckt, der dritte sieht nach, ob es getan ist.",
    storyEn: "One locks the door, one carries it out, the third makes sure it is done.",
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
 * Ist der Bund erwacht? Seit v1.91.0: sobald ALLE seine Figuren im Heer stehen
 * (Besitzerentscheid 6.10.2026) - die Stufe spielt keine Rolle mehr.
 * @param imHeer  (charId) => steht diese Figur in der Aufstellung?
 */
export function bundErwacht(bundId, imHeer) {
  const b = BUENDE[bundId];
  if (!b) return false;
  return b.figuren.every((f) => !!imHeer(f));
}

/** Alle erwachten Buende - fuer die Anzeige und fuer den Kern. */
export function erwachteBuende(imHeer) {
  return BUND_LISTE.filter((b) => bundErwacht(b.id, imHeer)).map((b) => b.id);
}
