// ── THE TALE OF THE RIFT ─────────────────────────────────────────────────────
// One court, once. Then the first Grandmaster opened a rift to win a war he
// could not win — and the shadow has been calling ever since. The court
// shattered: some fled to guard what they knew, some liked what they heard.
// Every champion carries ONE sentence of this tale. Read along the campaign,
// the herald lines add up to the whole story; the answers only come to those
// who have beaten them. Heralds speak in the third person (the epic voice);
// after defeat, the figures address the Wanderer directly.
//
// Keyed by character id (champions) or boss id (b23 archenemy, b25 master).

export const VOICES = {
  // ── the shadow-drawn (Schatten) ────────────────────────────────────────────
  hawk: {
    heraldDe: "Man sagt, der Späher war der Erste, der den Riss am Himmel sah — und der Erste, der beschloss, niemandem davon zu erzählen.",
    heraldEn: "They say the Hawk was the first to see the rift in the sky — and the first to decide to tell no one.",
    afterDe: "Du hast schärfere Augen als ich, {held}. Dann sieh auch das: der Riss wächst, während wir hier reden.",
    afterEn: "Your eyes are sharper than mine, {held}. Then see this too: the rift grows while we stand here talking.",
  },
  assassin: {
    heraldDe: "Der Attentäter nahm keinen Auftrag mehr an, seit der Schatten ihm einen besseren gab: warten.",
    heraldEn: "The Assassin took no more contracts once the shadow offered him a better one: to wait.",
    afterDe: "Zweimal geschlagen — gut. Dann warte ich eben an deiner Seite weiter.",
    afterEn: "Beaten twice — fine. Then I shall keep waiting at your side.",
  },
  pathfinder: {
    heraldDe: "Der Pfadfinder kartierte jeden Weg des Reiches, bis er einen fand, der auf keine Karte gehört.",
    heraldEn: "The Pathfinder charted every road of the realm — until he found one that belongs on no map.",
    afterDe: "Nimm meine Karte, {held}. Aber versprich mir, den einen Weg darauf niemals zu gehen.",
    afterEn: "Take my map, {held}. But promise me you will never walk the one road on it.",
  },
  dragon: {
    heraldDe: "Der Drache schwor einst der Krone die Treue; der Riss fragte nicht nach Schwüren, nur nach Feuer.",
    heraldEn: "The Dragon once swore fealty to the Crown; the rift never asked for oaths, only for fire.",
    afterDe: "Drei Siege forderte mein Stolz von dir. Dein Feuer brennt heller als meines — führe mich.",
    afterEn: "My pride demanded three victories of you. Your fire burns brighter than mine — lead me.",
  },
  sorceress: {
    heraldDe: "Die Hexerin sah im Orakel das Ende dieser Geschichte — und beschloss, jedem einzelnen Kapitel im Weg zu stehen.",
    heraldEn: "The Sorceress saw the end of this tale in her orb — and resolved to stand in the way of every single chapter.",
    afterDe: "Ich habe dich kommen sehen, {held}. Ich wollte nur wissen, wie es sich anfühlt.",
    afterEn: "I saw you coming, {held}. I only wanted to know how it would feel.",
  },
  alchemist: {
    heraldDe: "Die Alchemistin destillierte einen einzigen Tropfen des Schattens — und verkauft seither an beide Seiten.",
    heraldEn: "The Alchemist distilled a single drop of the shadow — and has been selling to both sides ever since.",
    afterDe: "Ein Tropfen für dich, umsonst. Der zweite kostet — so bleibt es ehrlich zwischen uns.",
    afterEn: "One drop for you, free. The second has a price — that keeps us honest.",
  },
  warlock: {
    heraldDe: "Der Hexenmeister bat den Riss nie um Macht; er stellte Bedingungen, und der Riss unterschrieb.",
    heraldEn: "The Warlock never begged the rift for power; he set terms, and the rift signed.",
    afterDe: "Mein Vertrag hat eine Klausel für Stärkere. Glückwunsch, {held} — du bist sie.",
    afterEn: "My contract holds a clause for the stronger. Congratulations, {held} — that clause is you.",
  },
  amazon: {
    heraldDe: "Die Amazone focht auf jeder Seite dieses Krieges; nur eine hat sie nie betrogen — die eigene Klinge.",
    heraldEn: "The Amazon has fought on every side of this war; only one has never betrayed her — her own blade.",
    afterDe: "Meine Klinge wählt dich, {held}. Enttäusche sie nicht.",
    afterEn: "My blade chooses you, {held}. Do not disappoint it.",
  },
  strategist: {
    heraldDe: "Der Stratege hat diesen Feldzug längst zu Ende gedacht — er wartet nur noch darauf, dass die Welt nachzieht.",
    heraldEn: "The Strategist finished this campaign in his head long ago — he is merely waiting for the world to catch up.",
    afterDe: "Interessant. Diesen Zug hatte ich nicht. Noch einmal von vorn — diesmal an deiner Seite.",
    afterEn: "Interesting. That move I did not have. Once more from the top — this time at your side.",
  },
  captain: {
    heraldDe: "Der Kapitän segelte als Einziger bis an den Rand des Endlosen Meeres; was er dort sah, ließ ihn umkehren — und schweigen.",
    heraldEn: "The Captain alone sailed to the edge of the Endless Sea; what he saw there turned him back — and struck him silent.",
    afterDe: "Also gut, {held}. Ich setze noch einmal Segel dorthin — aber diesmal steuerst du.",
    afterEn: "Very well, {held}. I will set sail for it once more — but this time, you steer.",
  },

  // ── the crown-loyal (Krone) ────────────────────────────────────────────────
  seeress: {
    heraldDe: "Die Hellseherin verließ den Hof eine Stunde, bevor er zerbrach — sie hatte es kommen sehen und niemand hatte gefragt.",
    heraldEn: "The Seeress left the court an hour before it shattered — she had seen it coming, and no one had asked.",
    afterDe: "Frag mich, {held}. Du bist der Erste seit dem Riss, dessen Züge ich nicht zu Ende sehe — deshalb folge ich dir.",
    afterEn: "Ask me, {held}. You are the first since the rift whose moves I cannot see to their end — that is why I follow you.",
  },
  mage: {
    heraldDe: "Der Magier versiegelte den ersten Spalt mit bloßer Hand — und zählt seither die Tage, bis das Siegel zu singen beginnt.",
    heraldEn: "The Mage sealed the first crack with his bare hand — and has counted the days ever since, waiting for the seal to sing.",
    afterDe: "Das Siegel hält noch, {held}. Frag mich nicht, wie lange.",
    afterEn: "The seal still holds, {held}. Do not ask me for how long.",
  },
  guardian: {
    heraldDe: "Der Wächter verließ seinen Posten nie — als der Hof zerbrach, trug er ihn einfach mit sich fort.",
    heraldEn: "The Guardian never abandoned his post — when the court shattered, he simply carried it with him.",
    afterDe: "Mein Posten ist jetzt dort, wo du stehst.",
    afterEn: "My post is now wherever you stand.",
  },
  bard: {
    heraldDe: "Der Barde sammelt die verstreuten Strophen des alten Liedes; in der letzten, heißt es, steht der Name des Verräters.",
    heraldEn: "The Bard gathers the scattered verses of the old song; the last one, they say, holds the traitor's name.",
    afterDe: "Für dich, {held}, schreibe ich die letzte Strophe um.",
    afterEn: "For you, {held}, I shall rewrite the final verse.",
  },
  paladin: {
    heraldDe: "Der Paladin jagt nicht den Schatten — er jagt die Stelle, an der ein Eid zum ersten Mal riss.",
    heraldEn: "The Paladin does not hunt the shadow — he hunts the place where an oath first tore.",
    afterDe: "Den Riss in meinem Eid hast du nicht verbreitert, {held}. Das genügt mir.",
    afterEn: "You did not widen the tear in my oath, {held}. That is enough for me.",
  },
  inquisitor: {
    heraldDe: "Der Inquisitor verhörte hundert Abtrünnige; die letzte Antwort stellte ihm die Fragen zurück.",
    heraldEn: "The Inquisitor questioned a hundred renegades; the final answer handed the questions back to him.",
    afterDe: "Keine weiteren Fragen. Dein Schwert hat geantwortet.",
    afterEn: "No further questions. Your sword has answered.",
  },
  archbishop: {
    heraldDe: "Der Erzbischof predigt noch immer das Licht — nur brennen seine Kerzen neuerdings ein wenig blau.",
    heraldEn: "The Archbishop still preaches the light — only his candles have lately begun to burn a little blue.",
    afterDe: "Dann trage du das Licht weiter, {held}. Meine Arme sind müde geworden.",
    afterEn: "Then you carry the light onward, {held}. My arms have grown weary.",
  },
  chancellor: {
    heraldDe: "Der Kanzler führt Buch über jeden Zoll des Reiches — und über eine einzige Schuld, die niemand tilgen kann.",
    heraldEn: "The Chancellor keeps ledgers on every toll of the realm — and on one single debt no one can repay.",
    afterDe: "Ich verbuche dich als Gewinn, {held}. Zum ersten Mal seit Jahren stimmt meine Bilanz.",
    afterEn: "I book you as profit, {held}. For the first time in years, my ledger balances.",
  },
  engineer: {
    heraldDe: "Der Ingenieur baute die Tore zwischen den Kapiteln — und weiß als Einziger, wohin sie sich wirklich öffnen.",
    heraldEn: "The Engineer built the gates between the chapters — and alone knows where they truly open.",
    afterDe: "Die Tore öffnen sich für dich, {held}. Frag nicht, womit ich sie geölt habe.",
    afterEn: "The gates will open for you, {held}. Do not ask what I oiled them with.",
  },
  standard: {
    heraldDe: "Die Standarte trägt das alte Banner des ungeteilten Hofes; wer ihr folgt, folgt einer Erinnerung.",
    heraldEn: "The Standard bears the old banner of the undivided court; whoever follows it follows a memory.",
    afterDe: "Das Banner erkennt seinen Träger, wenn es ihn sieht. Heb es auf, {held}.",
    afterEn: "The banner knows its bearer on sight. Pick it up, {held}.",
  },

  // ── what came THROUGH: the rift's own ─────────────────────────────────────
  // Sentinels the other side forgot, strays of a foreign fauna (the rift
  // itself murmurs through the beasts), and renegades of the old court who
  // walked in willingly. Ten of them hold league gates — and pay the rent.
  b01: {
    heraldDe: "Der Wächter stand auf der anderen Seite des Risses Wache — bis eines Tages niemand mehr kam, um ihn abzulösen.",
    heraldEn: "The Warden stood guard on the far side of the rift — until one day no one came to relieve him.",
    afterDe: "Ablösung … endlich. Halte du die Laterne, {held}. Ich habe lange genug gestanden.",
    afterEn: "Relief … at last. You hold the lantern now, {held}. I have stood long enough.",
  },
  b02: {
    heraldDe: "Der Hetzer sprang durch den Riss, weil drüben etwas hinter ihm her war — es ist ihm gefolgt.",
    heraldEn: "The Harrier leapt through the rift because something over there was chasing him — and it followed.",
    afterDe: "…es rennt noch… lauf, {held}… es rennt IMMER noch…",
    afterEn: "…it still runs… run, {held}… it is STILL running…",
  },
  b03: {
    heraldDe: "Die Brutmutter legt ihre Gelege dorthin, wo der Riss am wärmsten flüstert.",
    heraldEn: "The Broodmother lays her clutches wherever the rift whispers warmest.",
    afterDe: "…meine Kinder… sie sollen nicht hören, was ich hören musste. Nimm die Wärme fort, {held}.",
    afterEn: "…my children… they must not hear what I had to hear. Take the warmth away, {held}.",
  },
  b04: {
    heraldDe: "Der Schleicher war einmal jemandes Schatten; wessen, das weiß er selbst nicht mehr.",
    heraldEn: "The Prowler was once somebody's shadow; whose, it no longer remembers.",
    afterDe: "Dein Schatten sitzt fest an deinen Fersen, {held}. Beneidenswert. Halt ihn gut fest.",
    afterEn: "Your shadow sits tight at your heels, {held}. Enviable. Hold on to it.",
  },
  b05: {
    heraldDe: "Der Streuner trägt die Streifen beider Welten — und findet in keiner mehr eine Herde.",
    heraldEn: "The Stray wears the stripes of both worlds — and finds a herd in neither.",
    afterDe: "…Herde…? …du riechst nicht nach Riss, {held}… gut… gut…",
    afterEn: "…herd…? …you do not smell of rift, {held}… good… good…",
  },
  b06: {
    heraldDe: "Das Bollwerk wurde gebaut, um etwas drinnen zu halten; niemand sagte ihm je, was.",
    heraldEn: "The Bulwark was built to keep something in; no one ever told it what.",
    afterDe: "Wenn du das Tor öffnest, {held} — schau nicht, was ich all die Jahre gehalten habe.",
    afterEn: "If you open the gate, {held} — do not look at what I held all those years.",
  },
  b07: {
    heraldDe: "Der Geist erinnert sich an den Tag, an dem der Riss aufging — er stand zu nah.",
    heraldEn: "The Ghost remembers the day the rift opened — it stood too close.",
    afterDe: "Endlich sieht mich jemand an, statt hindurch. Danke, {held}. Mehr wollte ich nie.",
    afterEn: "At last someone looks AT me instead of through me. Thank you, {held}. That is all I ever wanted.",
  },
  b08: {
    heraldDe: "Der Kanonier hütet das Tor des neunten Kapitels und zahlt die Miete pünktlich — er hat gelernt, wohin man besser nicht zielt.",
    heraldEn: "The Cannoneer keeps the ninth chapter's gate and pays his rent on time — he has learned where one had better not aim.",
    afterDe: "Nimm die Lunte, {held}. Und wenn du je ans Meer kommst: ziele auf gar nichts.",
    afterEn: "Take the fuse, {held}. And should you ever reach the sea: aim at nothing at all.",
  },
  b09: {
    heraldDe: "Der Skorpion nistete im ersten Spalt, als er noch handbreit war; er wuchs mit ihm.",
    heraldEn: "The Scorpion nested in the first crack when it was but a hand's width; it grew as the crack grew.",
    afterDe: "…der Spalt war einmal mein Zuhause, {held}… jetzt ist er nur noch hungrig…",
    afterEn: "…the crack was my home once, {held}… now it is merely hungry…",
  },
  b10: {
    heraldDe: "Der Doppelritter hütet das Tor des dritten Kapitels — zwei Leiber, ein Eid, und keiner von beiden erinnert sich, wem er galt.",
    heraldEn: "The Twin Knight keeps the third chapter's gate — two bodies, one oath, and neither remembers to whom it was sworn.",
    afterDe: "Wir erinnern uns jetzt, {held}: Der Eid galt dem, der uns schlägt. Er galt dir.",
    afterEn: "We remember now, {held}: the oath was to whoever bests us. It was to you.",
  },
  b11: {
    heraldDe: "Die Flüsterin übersetzt, was der Riss murmelt — und lässt bei jedem Satz ein Wort aus.",
    heraldEn: "The Whisperer translates what the rift murmurs — and leaves one word out of every sentence.",
    afterDe: "Das ausgelassene Wort, {held}? Es ist immer dasselbe: dein Name.",
    afterEn: "The word I leave out, {held}? It is always the same one: your name.",
  },
  b12: {
    heraldDe: "Der Richter hütet das Tor des zweiten Kapitels und spricht Recht im Namen eines Hofes, den es nicht mehr gibt.",
    heraldEn: "The Judge keeps the second chapter's gate, passing sentence in the name of a court that no longer exists.",
    afterDe: "Das Urteil lautet: schuldig — ich, des Wartens. Die Waage gehört dir, {held}.",
    afterEn: "The verdict: guilty — I, of waiting. The scales are yours, {held}.",
  },
  b13: {
    heraldDe: "Der Brandstifter glaubt, man könne den Riss ausbrennen; bisher brannte nur alles andere.",
    heraldEn: "The Firestarter believes the rift can be burned out; so far only everything else has burned.",
    afterDe: "Feuer war die falsche Antwort, {held}. Aber sag selbst: Es war eine SCHÖNE falsche Antwort.",
    afterEn: "Fire was the wrong answer, {held}. But admit it: it was a BEAUTIFUL wrong answer.",
  },
  b14: {
    heraldDe: "Der Koloss hütet das Tor des zehnten Kapitels — er ist der Deckel auf dem Brunnen, und der Brunnen ist das Meer.",
    heraldEn: "The Colossus keeps the tenth chapter's gate — he is the lid upon the well, and the well is the sea.",
    afterDe: "Ich hebe mich beiseite, {held}. Was im Brunnen wohnt, gehört jetzt zu deiner Wache.",
    afterEn: "I move aside, {held}. What lives in the well is your watch now.",
  },
  b15: {
    heraldDe: "Die Sturmklaue nistet im Gewitter über dem Riss und trägt Nachrichten, die niemand abgeschickt hat.",
    heraldEn: "The Stormclaw nests in the thunder above the rift, carrying messages no one ever sent.",
    afterDe: "Eine Nachricht für dich, {held} — ungezeichnet, wie immer: ‚Komm nicht ans Meer.'",
    afterEn: "A message for you, {held} — unsigned, as always: 'Do not come to the sea.'",
  },
  b16: {
    heraldDe: "Die Blutmagd hütet das Tor des sechsten Kapitels; sie schenkt aus einem Kelch, der nie geleert und nie gefüllt wird.",
    heraldEn: "The Bloodmaid keeps the sixth chapter's gate, pouring from a chalice never emptied and never filled.",
    afterDe: "Der Kelch bleibt hier, {held}. Manche Gaben soll man verlieren dürfen.",
    afterEn: "The chalice stays here, {held}. Some gifts one should be allowed to lose.",
  },
  b17: {
    heraldDe: "Der Lanzenmeister hütet das Tor des siebten Kapitels und reitet Turnier um Turnier gegen einen Gegner, den nur er sieht.",
    heraldEn: "The Lancemaster keeps the seventh chapter's gate, riding tilt after tilt against a foe only he can see.",
    afterDe: "Du hast ihn auch gesehen, im letzten Gang — nicht wahr, {held}? Dann war es kein Wahn.",
    afterEn: "You saw him too, in the final pass — didn't you, {held}? Then it was no madness.",
  },
  b18: {
    heraldDe: "Eisenfaust hütet das Tor des achten Kapitels; die Faust ballte sich am Tag des Risses und ging nie wieder auf.",
    heraldEn: "Ironfist keeps the eighth chapter's gate; the fist clenched on the day of the rift and never opened again.",
    afterDe: "Sieh, {held} … sie öffnet sich. Was Jahre in ihr lag, gebe ich dir: einen Schlüssel.",
    afterEn: "Look, {held} … it opens. What lay inside for years, I give to you: a key.",
  },
  b19: {
    heraldDe: "Der Schattenfürst hütet das Tor des vierten Kapitels — halb Mensch, halb das, was der Riss aus Menschen macht.",
    heraldEn: "The Shadowlord keeps the fourth chapter's gate — half a man, half what the rift makes of men.",
    afterDe: "Merke dir meine Hälften gut, {held}. Der Riss zeigt dir gerade deine eigene Wahl.",
    afterEn: "Mark my halves well, {held}. The rift is showing you your own choice.",
  },
  b20: {
    heraldDe: "Der Hüter hütet das Tor des fünften Kapitels und trägt Schlüssel zu Türen, die längst niemand mehr findet.",
    heraldEn: "The Keeper keeps the fifth chapter's gate, carrying keys to doors no one can find anymore.",
    afterDe: "Nimm den Ring, {held}. Ein Schlüssel darunter passt ans Meer — ich habe nie gewagt, ihn zu prüfen.",
    afterEn: "Take the ring, {held}. One key on it fits the sea — I never dared to try it.",
  },
  b21: {
    heraldDe: "Die Wandlerin kam als etwas anderes durch den Riss und probiert seither Gestalten an wie Gewänder.",
    heraldEn: "The Shifter came through the rift as something else and has been trying on shapes like garments ever since.",
    afterDe: "Deine Gestalt behalte ich nicht, {held} — sie sitzt zu schwer. Wie trägst du das nur?",
    afterEn: "I shall not keep your shape, {held} — it sits too heavy. How do you carry it?",
  },
  b22: {
    heraldDe: "Der Zerreißer riss sich als Erstes von der Kette los, die der Riss ihm anlegte — das Reißen hat er behalten.",
    heraldEn: "The Render first tore free of the chain the rift had laid on him — the tearing, he kept.",
    afterDe: "…keine Kette mehr… deine Hand riecht nicht nach Kette, {held}… gut. Dann geh voran.",
    afterEn: "…no more chain… your hand does not smell of chains, {held}… good. Then walk ahead.",
  },
  b24: {
    heraldDe: "Der Seuchenkönig ist der Atem des Meeres, der zu früh an Land ging — was er berührt, erinnert sich an den Riss.",
    heraldEn: "The Plaguelord is the sea's breath come ashore too soon — whatever he touches remembers the rift.",
    afterDe: "Huste mich aus, {held}, und merke dir den Geschmack: So schmeckt das Meer, das dich erwartet.",
    afterEn: "Cough me out, {held}, and remember the taste: this is how the sea that awaits you tastes.",
  },

  // ── the two who hold the tale together ─────────────────────────────────────
  b23: {
    heraldDe: "Sie war die erste Klinge der Krone, ehe der Riss ihren Namen flüsterte — jetzt flüstert Asra ihn zurück.",
    heraldEn: "She was the Crown's first blade before the rift whispered her name — now Asra whispers it back.",
    afterDe: "Du hörst ihn inzwischen auch, nicht wahr, {held}? … Bis zum nächsten Brett.",
    afterEn: "You hear it too by now, don't you, {held}? … Until the next board.",
  },
  b25: {
    heraldDe: "Er öffnete den Riss, um einen Krieg zu gewinnen — jetzt hütet Osric das letzte Tor und zahlt die Miete in fremden Niederlagen.",
    heraldEn: "He opened the rift to win a war — now Osric keeps the last gate and pays the rent in other people's defeats.",
    afterDe: "Das Tor gehört dir, {held}. Was dahinter wartet, hat mir nie gehört.",
    afterEn: "The gate is yours, {held}. What waits beyond it was never mine.",
  },
};

/** the voice of a match's boss: piece bosses by character id, monsters by boss id */
export function voiceFor(boss) {
  if (!boss) return null;
  const id = boss.bossId?.startsWith("pb_") ? boss.bossId.slice(3) : boss.bossId;
  return VOICES[id] || null;
}
