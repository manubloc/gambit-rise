// ── DIE LEHREN ──────────────────────────────────────────────────────────────
// EIN Datensatz fuer alles Erklaeren (Auftrag des Besitzers, v0.50): die
// Akademie liest ihn heute, die Erstbesuch-Popups der Menues lesen ihn als
// naechster Ausbauschritt - so laufen Kurz- und Langfassung nie auseinander.
// Jede Lehre: { id, titel, kurz (ein Satz fuers Popup), text (Akademie) }.
// Deutsch zuerst; en traegt die knappe Uebersetzung.

export const LEHREN = {
  de: {
    regeln: [
      { id: "ziel", titel: "Das Ziel", kurz: "Setze den gegnerischen König matt.",
        text: "Gewonnen hat, wer den gegnerischen König MATT setzt: Er steht im Schach und kein Zug rettet ihn. Steht dein König im Schach, MUSST du es abwehren — ziehen, blocken oder den Angreifer schlagen. Gibt es keinen legalen Zug, aber auch kein Schach, ist es PATT: unentschieden." },
      { id: "zugrecht", titel: "Das Zugrecht", kurz: "Weiß beginnt, danach wird abgewechselt.",
        text: "Weiß zieht zuerst, dann immer abwechselnd genau ein Zug. Geschlagen wird, indem du auf das Feld einer gegnerischen Figur ziehst — sie verlässt das Brett. Eigene Figuren blockieren dich, über sie hinweg zieht nur der Springer." },
      { id: "rochade", titel: "Die Rochade", kurz: "König und Turm ziehen einmal gemeinsam — wenn beide noch nie gezogen haben.",
        text: "Einmal pro Partie dürfen König und Turm GEMEINSAM ziehen: der König zwei Felder zum Turm, der Turm springt auf seine Innenseite. Bedingungen: beide haben noch NIE gezogen, die Gasse dazwischen ist frei, der König steht nicht im Schach und überquert kein bedrohtes Feld. Tippe im Spiel den König an — steht die Rochade offen, leuchtet das Feld zwei Schritte zur Seite." },
      { id: "enpassant", titel: "En passant", kurz: "Ein vorbeigezogener Bauern-Doppelschritt darf sofort im Vorbeigehen geschlagen werden.",
        text: "Zieht ein gegnerischer Bauer per DOPPELSCHRITT direkt neben deinen Bauern, darfst du ihn IM VORBEIGEHEN schlagen: Du ziehst schräg auf das übersprungene Feld, und er verschwindet von seinem. Das Fenster ist genau EINEN Zug offen — danach ist die Gelegenheit vorbei. (Im HP-Modus gibt es kein Vorbeiziehen — dort ist Schlagen Schaden auf dem Zielfeld.)" },
      { id: "umwandlung", titel: "Die Umwandlung", kurz: "Ein Bauer, der die letzte Reihe erreicht, wird zur Dame.",
        text: "Erreicht ein Bauer die LETZTE Reihe, wird er befördert: Er verwandelt sich in eine Dame. Im HP-Modus übernimmt er dabei auch ihre Werte — aus dem kleinsten Soldaten wird die stärkste Figur." },
      { id: "hausbrett", titel: "Das Hausbrett", kurz: "Gespielt wird auch auf 10×10 — und manche Karten haben Löcher.",
        text: "Neben dem klassischen 8×8 spielt Gambit auf dem 10×10-HAUSBRETT und auf Karten mit LÖCHERN: Ein Loch ist wie eine Mauer — nichts landet darauf, Läufer, Türme und Dame werden davon gestoppt. Die Grundregeln bleiben dieselben." },
    ],
    figuren: [
      { id: "koenig", sym: "♔", titel: "König", text: "Ein Feld in jede Richtung. Er ist die Partie: Fällt er, ist sie vorbei. Einmal pro Spiel beherrscht er die Rochade." },
      { id: "dame", sym: "♕", titel: "Dame", text: "Beliebig weit gerade UND schräg — die stärkste Figur auf dem Brett." },
      { id: "turm", sym: "♖", titel: "Turm", text: "Beliebig weit gerade. Zwei Türme auf offenen Linien tragen ganze Endspiele — und er ist der Partner der Rochade." },
      { id: "laeufer", sym: "♗", titel: "Läufer", text: "Beliebig weit schräg. Er bleibt sein Leben lang auf seiner Feldfarbe — zu zweit decken sie das ganze Brett." },
      { id: "springer", sym: "♘", titel: "Springer", text: "Im Winkel: zwei vor, eins zur Seite — und als Einziger ÜBER andere Figuren hinweg. In vollen Stellungen ist er Gold wert." },
      { id: "bauer", sym: "♙", titel: "Bauer", text: "Ein Feld vor, aus der Grundstellung zwei (Doppelschritt). Er schlägt nur SCHRÄG. Am Ende des Weges wartet die Umwandlung — und wer den Doppelschritt eines Nachbarn erlebt, kennt En passant." },
      { id: "haus", sym: "✦", titel: "Die Hausfiguren", text: "Der Hof stellt eigene Gestalten: der KANZLER zieht wie Turm und Springer zugleich, der ERZBISCHOF wie Läufer und Springer, der FALKE springt und schleicht schräg, die AMAZONE vereint Dame und Springer. Der DRACHE füllt 2×2 Felder und fliegt einmal pro Partie. Und der GAMBIT ist dein Held in der Bauernreihe — er sammelt Erfahrung, lernt Fähigkeiten und wächst mit dir." },
    ],
    spielweise: [
      { id: "hp", titel: "Der HP-Modus", kurz: "Figuren haben Lebenspunkte — geschlagen wird über Schaden.",
        text: "Im HP-GEFECHT trägt jede Figur LEBENSPUNKTE (rote Kugel) und Angriffskraft. Schlagen heißt Schaden: Erst wenn die Lebenspunkte fallen, fällt die Figur — starke Figuren stecken mehrere Treffer weg. Es gibt keinen Schachzwang: Gewonnen hat, wer den gegnerischen König FÄLLT. Schilde fangen je einen Treffer ab." },
      { id: "energie", titel: "Energie & Fähigkeiten", kurz: "Fähigkeiten kosten Energie — und jede Figur wirkt nur EINEN Zauber pro Partie.",
        text: "Figuren lernen im Hofstaat FÄHIGKEITEN — Sprünge, Schüsse, Blinzeln, Heilung. Im Kampf zahlt die blaue ENERGIE-Kugel dafür. Die wichtigste Regel: Jede Figur wirkt pro Partie nur EINEN aktiven Zauber — der erste Einsatz schließt das Buch. Wähle den Moment." },
      { id: "ausruestung", titel: "Ausrüstung & Vorräte", kurz: "Tränke und Gegenstände helfen im Kampf — der Einsatz kostet den Zug.",
        text: "In der Schatzkammer gekaufte AUSRÜSTUNG begleitet dich in den Kampf: Ein Lebenstrank heilt eine Figur um 2 Lebenspunkte, weitere Gegenstände enthüllt die Reise. Jeder Einsatz kostet deinen Zug — Vorrat ist Tempo." },
      { id: "kampagne", titel: "Kampagne & Kapitel", kurz: "Elf Kapitel, verzweigte Pfade — Siege rekrutieren Gefährten.",
        text: "Die KAMPAGNE führt durch zwölf Kapitel mit verzweigten Pfaden und Geheimwegen. Siege über Herausforderer REKRUTIEREN sie in deinen Hofstaat. Geräumte Stationen bleiben bespielbar, aber nur der FREUNDSCHAFTSKAMPF zahlt noch (+15 % Gold, +25 % Erfahrung) — alles andere ist Übung." },
      { id: "hofwert", titel: "Der Hofwert", kurz: "Eine Zahl für die Stärke deines Hofes — online entscheidet sie, wer gegen dich antritt.",
        text: "Der HOFWERT ist die eine Zahl für die Stärke deines Hofes. Er wächst mit allem, was dich stärker macht: jeder geräumten Station (+100), jedem erreichten Kapitel (+200), jedem rekrutierten Gefährten (nach seinem Figurenwert), jeder gekauften Stufe (+40), jedem Duplikat-Stern (+30) und jeder gelernten Fähigkeit (+15).\n\nONLINE ist er dein Schild und dein Maß: Die Zufallssuche stellt dir Gegner mit ÄHNLICHEM Hofwert gegenüber — das Suchband beginnt bei ±150 und weitet sich beim Warten alle fünf Sekunden um 60, bis jemand gefunden ist. So trifft ein junger Hof keinen Veteranen, und dein Fortschritt im Feldzug zählt auch im Duell." },
    ],
  },
  en: {
    regeln: [
      { id: "ziel", titel: "The goal", kurz: "Checkmate the enemy king.",
        text: "You win by CHECKMATE: the enemy king is in check and no move saves him. If your own king is in check you MUST answer it — move, block, or capture the attacker. No legal move but no check either is STALEMATE: a draw." },
      { id: "zugrecht", titel: "Taking turns", kurz: "White begins; players alternate single moves.",
        text: "White moves first, then players alternate one move each. You capture by moving onto an enemy piece's square — it leaves the board. Your own pieces block you; only the knight jumps over." },
      { id: "rochade", titel: "Castling", kurz: "King and rook move together once — if neither has ever moved.",
        text: "Once per game king and rook move TOGETHER: the king two squares toward the rook, the rook jumps to his inner side. Conditions: neither has EVER moved, the lane between is empty, the king is not in check and crosses no attacked square. Tap your king in a match — if castling is open, the square two steps over lights up." },
      { id: "enpassant", titel: "En passant", kurz: "A pawn double-step passing you may be captured in passing.",
        text: "If an enemy pawn DOUBLE-STEPS right past your pawn, you may capture it IN PASSING: move diagonally onto the skipped square and it vanishes from its own. The window is exactly ONE move. (No en passant in HP mode — there, capturing is damage on the target square.)" },
      { id: "umwandlung", titel: "Promotion", kurz: "A pawn reaching the last rank becomes a queen.",
        text: "A pawn reaching the LAST rank is promoted to a queen. In HP mode it adopts her stats too — the smallest soldier becomes the strongest piece." },
      { id: "hausbrett", titel: "The house board", kurz: "Matches also run on 10×10 — and some maps have holes.",
        text: "Beyond classic 8×8, Gambit plays on the 10×10 HOUSE BOARD and on maps with HOLES: a hole acts like a wall — nothing lands on it and sliders stop at it. The core rules stay the same." },
    ],
    figuren: [
      { id: "koenig", sym: "♔", titel: "King", text: "One square any direction. He IS the game — and once per match he commands castling." },
      { id: "dame", sym: "♕", titel: "Queen", text: "Any distance, straight AND diagonal — the strongest piece." },
      { id: "turm", sym: "♖", titel: "Rook", text: "Any distance straight. Castling's partner." },
      { id: "laeufer", sym: "♗", titel: "Bishop", text: "Any distance diagonally; forever bound to one square colour." },
      { id: "springer", sym: "♘", titel: "Knight", text: "Two forward, one aside — the only piece that jumps." },
      { id: "bauer", sym: "♙", titel: "Pawn", text: "One forward (two from the start), captures only diagonally. Promotion waits at the far end; en passant punishes careless double-steps." },
      { id: "haus", sym: "✦", titel: "House pieces", text: "The CHANCELLOR moves as rook+knight, the ARCHBISHOP as bishop+knight, the HAWK jumps and sidles, the AMAZON unites queen and knight, the 2×2 DRAGON flies once per game — and the GAMBIT is your hero in the pawn row, levelling and learning as you play." },
    ],
    spielweise: [
      { id: "hp", titel: "HP mode", kurz: "Pieces carry hit points — capturing is damage.",
        text: "In HP DUELS every piece carries HIT POINTS (red orb) and attack. Capturing is damage: a piece only falls when its HP does. No check rule — you win by felling the enemy KING. Shields absorb one hit each." },
      { id: "energie", titel: "Energy & abilities", kurz: "Abilities cost energy — and each piece casts only ONE spell per match.",
        text: "Pieces learn ABILITIES in the court; the blue ENERGY orb pays for them in battle. The key rule: each piece casts only ONE active spell per match — the first use closes the book." },
      { id: "ausruestung", titel: "Gear & supplies", kurz: "Potions and items help in battle — using one costs your turn.",
        text: "Gear from the treasury travels with you: a life potion heals a piece by 2 HP; more items reveal themselves along the journey. Every use costs your turn." },
      { id: "kampagne", titel: "Campaign & chapters", kurz: "Eleven chapters, branching paths — victories recruit companions.",
        text: "The CAMPAIGN crosses twelve chapters on branching paths. Beating challengers RECRUITS them. Cleared sites stay playable, but only the FRIENDLY MATCH still pays (+15% gold, +25% XP)." },
      { id: "hofwert", titel: "Court value", kurz: "One number for your court's strength — online it decides who faces you.",
        text: "The COURT VALUE is the one number for your court's strength. It grows with every cleared station, chapter, companion, level and ability.\n\nOnline it is your shield: search pairs you with opponents of similar court value, so a young court never meets a veteran." },
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
