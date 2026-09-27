// ── DIE LEHREN ──────────────────────────────────────────────────────────────
// EIN Datensatz fuer alles Erklaeren (Auftrag des Besitzers, v0.50): die
// Akademie liest ihn heute, die Erstbesuch-Popups der Menues lesen ihn als
// naechster Ausbauschritt - so laufen Kurz- und Langfassung nie auseinander.
// Jede Lehre: { id, titel, kurz (ein Satz fuers Popup), text (Akademie) }.
// Deutsch zuerst; en traegt die knappe Uebersetzung.
//
// v1.89.0 (Besitzer: "versuch die Texte wirklich kurz zu halten ... es sind
// noch alte Bilder drin"): jede Lehre auf zwei, drei Saetze gekuerzt und auf
// den heutigen Stand gebracht - keine "Kugeln" mehr (seit v1.25.4 stehen
// Zahlen am Sockel), kein 10x10-Hausbrett (seit v1.24.3 fort), die richtige
// Kapitelzahl (zwoelf), das Talentband statt einer "Energie-Kugel". Die Lehren
// rochade, enpassant, umwandlung und ziel tragen in der Akademie ein
// gezeichnetes Brettchen (AkademieScreen.jsx).

export const LEHREN = {
  de: {
    regeln: [
      { id: "ziel", titel: "Das Ziel", kurz: "Setze den gegnerischen König matt.",
        text: "Gewonnen hat, wer den gegnerischen König MATT setzt: Er steht im Schach, und kein Zug rettet ihn. Steht dein König im Schach, musst du ihn retten — ziehen, blocken oder den Angreifer schlagen. Kein Schach, aber auch kein Zug: PATT, unentschieden." },
      { id: "zugrecht", titel: "Das Zugrecht", kurz: "Weiß beginnt, danach wird abgewechselt.",
        text: "Weiß beginnt, dann zieht immer abwechselnd genau eine Figur. Geschlagen wird, indem du auf das Feld einer Gegnerfigur ziehst. Eigene Figuren blockieren — nur der Springer springt über alles hinweg." },
      { id: "rochade", titel: "Die Rochade", kurz: "König und Turm ziehen einmal gemeinsam — wenn beide noch nie gezogen haben.",
        text: "Einmal pro Partie ziehen König und Turm GEMEINSAM: der König zwei Felder zum Turm, der Turm springt auf seine Innenseite. Nur wenn beide noch nie gezogen haben, die Gasse frei ist und der König weder im Schach steht noch über ein bedrohtes Feld zieht. Im Spiel: König antippen, das leuchtende Feld zwei Schritte daneben wählen." },
      { id: "enpassant", titel: "En passant", kurz: "Ein vorbeigezogener Bauern-Doppelschritt darf sofort im Vorbeigehen geschlagen werden.",
        text: "Zieht ein gegnerischer Bauer per DOPPELSCHRITT direkt neben deinen Bauern, darfst du ihn im Vorbeigehen schlagen: schräg auf das übersprungene Feld — er verschwindet. Nur im nächsten Zug, danach ist das Fenster zu. (Im HP-Gefecht gibt es kein Vorbeiziehen.)" },
      { id: "umwandlung", titel: "Die Umwandlung", kurz: "Ein Bauer, der die letzte Reihe erreicht, wird zur Dame.",
        text: "Erreicht ein Bauer die letzte Reihe, wird er zur Dame — im HP-Gefecht mit ihren Werten. Aus dem kleinsten Soldaten wird die stärkste Figur." },
    ],
    figuren: [
      { id: "koenig", sym: "♔", titel: "König", text: "Ein Feld in jede Richtung. Fällt er, ist die Partie vorbei. Einmal pro Spiel beherrscht er die Rochade." },
      { id: "dame", sym: "♕", titel: "Dame", text: "Beliebig weit gerade UND schräg — die stärkste Figur auf dem Brett." },
      { id: "turm", sym: "♖", titel: "Turm", text: "Beliebig weit gerade. Auf offenen Linien trägt er ganze Endspiele — und er ist der Partner der Rochade." },
      { id: "laeufer", sym: "♗", titel: "Läufer", text: "Beliebig weit schräg, sein Leben lang auf seiner Feldfarbe. Zu zweit decken sie das ganze Brett." },
      { id: "springer", sym: "♘", titel: "Springer", text: "Im Winkel: zwei vor, eins zur Seite — als Einziger ÜBER andere Figuren hinweg." },
      { id: "bauer", sym: "♙", titel: "Bauer", text: "Ein Feld vor, aus der Grundstellung zwei. Er schlägt nur schräg. Am Ende des Weges wartet die Umwandlung." },
      { id: "haus", sym: "✦", titel: "Die Hausfiguren", text: "Der KANZLER zieht wie Turm und Springer, der ERZBISCHOF wie Läufer und Springer, der SPÄHER springt und schleicht schräg, die AMAZONE vereint Dame und Springer. Der DRACHE füllt 2×2 Felder und fliegt einmal pro Partie. Der GAMBIT ist dein Held in der Bauernreihe — er sammelt Erfahrung und lernt Fähigkeiten." },
    ],
    spielweise: [
      { id: "hp", titel: "Das HP-Gefecht", kurz: "Figuren haben Lebenspunkte — geschlagen wird über Schaden.",
        text: "Im HP-GEFECHT trägt jede Figur zwei Zahlen am Sockel: ROT ihr Leben, BLAU ihre Stärke. Ein Angriff macht Schaden — hält der Gegner stand, springt deine Figur zurück; erst bei null fällt er. Gewonnen hat, wer den gegnerischen König fällt." },
      { id: "energie", titel: "Talente & Zauber", kurz: "Fähigkeiten stehen im Talentband — jede Figur wirkt pro Partie nur EINEN Zauber.",
        text: "Im Hofstaat lernen Figuren FÄHIGKEITEN. Im Gefecht liegt das TALENTBAND unter dem Brett: Kachel antippen, dann das leuchtende Feld wählen. Jeder Zauber wirkt pro Partie nur einmal — der erste Einsatz schließt das Buch. Gangarten wie Sturmschritt oder Weitsprung wirken dauerhaft." },
      { id: "ausruestung", titel: "Händler & Vorräte", kurz: "Tränke, Zeitenwender, Mauern und Schlüssel — der Einsatz kostet den Zug.",
        text: "Beim HÄNDLER gibt es Lebenstränke, Zeitenwender, Mauern für die eigene dritte Reihe und Schlüssel für verschlossene Wege. Jeder Einsatz im Gefecht kostet deinen Zug — Vorrat ist Tempo." },
      { id: "kampagne", titel: "Kampagne & Kapitel", kurz: "Zwölf Kapitel, verzweigte Pfade — Siege rekrutieren Gefährten.",
        text: "Die KAMPAGNE führt durch zwölf Kapitel mit verzweigten Pfaden. Besiegte Herausforderer treten deinem Hofstaat bei, am Ende jedes Kapitels wartet ein MEISTER. Geräumte Stationen bleiben bespielbar — nur der Freundschaftskampf zahlt noch." },
      { id: "hofwert", titel: "Der Hofwert", kurz: "Eine Zahl für die Stärke deines Hofes — online entscheidet sie, wer gegen dich antritt.",
        text: "Der HOFWERT ist eine Zahl für die Stärke deines Hofes: jede geräumte Station, jedes Kapitel, jeder Gefährte, jede Stufe und jede Fähigkeit zählt hinein. Online suchst du Gegner mit ähnlichem Hofwert — ein junger Hof trifft keinen Veteranen." },
    ],
  },
  en: {
    regeln: [
      { id: "ziel", titel: "The goal", kurz: "Checkmate the enemy king.",
        text: "You win by CHECKMATE: the enemy king is in check and no move saves him. If your own king is in check you must answer it — move, block, or capture the attacker. No check but no move either: STALEMATE, a draw." },
      { id: "zugrecht", titel: "Taking turns", kurz: "White begins; players alternate single moves.",
        text: "White moves first, then players alternate one move each. You capture by moving onto an enemy piece's square. Your own pieces block you — only the knight jumps over." },
      { id: "rochade", titel: "Castling", kurz: "King and rook move together once — if neither has ever moved.",
        text: "Once per game king and rook move TOGETHER: the king two squares toward the rook, the rook jumps to his inner side. Only while neither has ever moved, the lane is clear and the king neither stands in check nor crosses an attacked square. In play: tap the king, pick the glowing square two steps over." },
      { id: "enpassant", titel: "En passant", kurz: "A pawn double-step passing you may be captured in passing.",
        text: "If an enemy pawn DOUBLE-STEPS right past your pawn, you may capture it in passing: move diagonally onto the skipped square and it vanishes. Only on your very next move. (No en passant in HP duels.)" },
      { id: "umwandlung", titel: "Promotion", kurz: "A pawn reaching the last rank becomes a queen.",
        text: "A pawn reaching the last rank becomes a queen — in HP duels with her stats too. The smallest soldier turns into the strongest piece." },
    ],
    figuren: [
      { id: "koenig", sym: "♔", titel: "King", text: "One square any direction. Lose him, lose the game — and once per match he commands castling." },
      { id: "dame", sym: "♕", titel: "Queen", text: "Any distance, straight AND diagonal — the strongest piece." },
      { id: "turm", sym: "♖", titel: "Rook", text: "Any distance straight. Castling's partner." },
      { id: "laeufer", sym: "♗", titel: "Bishop", text: "Any distance diagonally; forever bound to one square colour." },
      { id: "springer", sym: "♘", titel: "Knight", text: "Two forward, one aside — the only piece that jumps." },
      { id: "bauer", sym: "♙", titel: "Pawn", text: "One forward (two from the start), captures only diagonally. Promotion waits at the far end." },
      { id: "haus", sym: "✦", titel: "House pieces", text: "The CHANCELLOR moves as rook+knight, the ARCHBISHOP as bishop+knight, the HAWK jumps and sidles, the AMAZON unites queen and knight, the 2×2 DRAGON flies once per game — and the GAMBIT is your hero in the pawn row, levelling and learning as you play." },
    ],
    spielweise: [
      { id: "hp", titel: "HP duels", kurz: "Pieces carry hit points — capturing is damage.",
        text: "In HP DUELS every piece shows two numbers on its plinth: RED its life, BLUE its strength. An attack deals damage — if the defender holds, your piece springs back; only at zero does it fall. You win by felling the enemy king." },
      { id: "energie", titel: "Talents & spells", kurz: "Abilities live on the talent band — each piece casts only ONE spell per match.",
        text: "Pieces learn ABILITIES in the court. In battle the TALENT BAND sits below the board: tap a tile, then pick the glowing square. Each spell works once per match — the first use closes the book. Gaits like storm step or long leap are always on." },
      { id: "ausruestung", titel: "Merchant & supplies", kurz: "Potions, time-turners, walls and keys — each use costs your turn.",
        text: "The MERCHANT sells life potions, time-turners, walls for your own third rank and keys for barred paths. Every use in battle costs your turn — supplies are tempo." },
      { id: "kampagne", titel: "Campaign & chapters", kurz: "Twelve chapters, branching paths — victories recruit companions.",
        text: "The CAMPAIGN crosses twelve chapters on branching paths. Beaten challengers join your court; a MASTER waits at the end of every chapter. Cleared stations stay playable — only the friendly match still pays." },
      { id: "hofwert", titel: "Court value", kurz: "One number for your court's strength — online it decides who faces you.",
        text: "The COURT VALUE is one number for your court's strength: every cleared station, chapter, companion, level and ability counts. Online you are paired with courts of similar value — a young court never meets a veteran." },
    ],
  },
};


// ── DIE MENUE-LEHREN ────────────────────────────────────────────────────────
// Erstbesuch-Popups (Besitzer, v0.51): "Alle Info-Texte aus den Menues raus -
// beim ersten Klick auf einen Menuepunkt erklaert ein Popup mit Ueberspringen-
// Knopf, was hier wohnt." Eigener Export, damit die App sie ohne Umbau der
// LEHREN-Struktur lesen kann; gleiche Bauart { titel, kurz, text }.
export const MENUE_LEHREN = {
  de: {
    play: { titel: "Spielen", kurz: "Dein Weg aufs Brett.",
      text: "Hier beginnt alles: die KAMPAGNE erzählt deine Reise durch zwölf Kapitel, das SCHNELLE SPIEL wirft dich sofort auf ein Brett deiner Wahl, und im ONLINE-DUELL wartet ein echter Gegner. Die Akademie darunter erklärt Schach und alles, was dieses Spiel darüber hinaus kann." },
    army: { titel: "Hofstaat", kurz: "Deine Figuren, deine Aufstellung.",
      text: "Dein Hof versammelt alle Figuren, die dir folgen. Im STAMMBAUM verteilst du Erfahrungspunkte und schaltest Fähigkeiten frei, in der AUFSTELLUNG bestimmst du, wer aufs Brett zieht, und unter AUSRÜSTUNG rüstest du deine Kämpfer. Je stärker der Hof, desto höher dein HOFWERT — und der entscheidet online über faire Paarungen." },
    ach: { titel: "Schatzkammer", kurz: "Gold wird zu Stärke.",
      text: "Hier gibst du dein erspieltes Gold aus: Tränke für HP-Gefechte, Sanduhren für einen zurückgenommenen Zug, Truhen und mehr. Alles Gekaufte liegt danach im Hofstaat unter Ausrüstung bereit — und die Ruhmeshalle deiner Taten wohnt gleich mit hier." },
    profile: { titel: "Profil", kurz: "Konto, Spielstände, Einstellungen.",
      text: "Hier wohnen deine Spielstände, dein Konto für Online-Duelle, Sprache, Musik und die Darstellung der Brettfiguren. Auch das Neuladen der App nach einem Update findest du hier." },
  },
  en: {
    play: { titel: "Play", kurz: "Your way onto the board.",
      text: "Everything starts here: the CAMPAIGN tells your journey through twelve chapters, QUICK PLAY drops you onto any board at once, and an ONLINE DUEL brings a real opponent. The Academy below teaches chess and everything this game adds on top." },
    army: { titel: "Court", kurz: "Your pieces, your formation.",
      text: "Your court gathers every piece that follows you. In the TREE you spend experience and unlock talents, FORMATION decides who takes the board, and GEAR equips your fighters. The stronger the court, the higher your COURT VALUE — and online, that value drives fair matchmaking." },
    ach: { titel: "Treasury", kurz: "Gold becomes strength.",
      text: "Spend your earned gold here: potions for HP battles, hourglasses to take back a move, chests and more. Everything you buy waits in your court under Gear — and your Hall of Fame lives right here too." },
    profile: { titel: "Profile", kurz: "Account, saves, settings.",
      text: "Your save slots live here, plus your account for online duels, language, music and the board-piece style. Reloading the app after an update is here too." },
  },
};
