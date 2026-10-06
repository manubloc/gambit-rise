// ── THE OVERWORLD PAINTING ───────────────────────────────────────────────────
// One vertical journey, ten climates, bottom to top — spring to the Endless
// Sea. Anchors were MEASURED on the painting (percent of width/height): the
// pale corridor that winds through the middle third is the road itself.
import worldUrl from "./assets/weltkarte.webp";

export const WORLD_MAP = {
  url: worldUrl,
  w: 1672, h: 941,   // v0.39: die neue Weltkarte liegt quer im Verhaeltnis 16:9
  // league → [x%, y%] along the corridor; L11 sits on the lighthouse isle
  // Die zwoelf Welten auf der neuen Querkarte - mit dem Ankerwerkzeug
  // gesetzt, nicht geschaetzt: der Weg steigt von Kronland links unten
  // ueber das Gebirge zur Endfestung rechts oben.
  anchors: {
    1: [14.63, 94.72],
    2: [18.85, 80.36],
    3: [24.57, 71.33],
    4: [27.86, 56.59],
    5: [30.65, 44.64],
    6: [36.44, 35.62],
    7: [45.74, 32.31],
    8: [55.9, 34.6],
    9: [66.42, 41.85],
    10: [75.43, 37.53],
    11: [80.08, 26.34],
    12: [85.37, 16.3],
  },
};

// ── league lore: two sentences each, tied to the Tale of the Rift and the
// gatekeeper who holds that league's door ──
export const LEAGUE_LORE = {
  // ── Die Chronik des Risses ──────────────────────────────────────────────────
  // Ein Bogen, drei Gestalten: Corvin, der Gambit ohne Namen. Asra, die
  // zurückkehrte. Vesna, die Namen aufschrieb, die niemand mehr sprechen darf.
  // Alle anderen sind Nebenwirkungen derselben Wunde.
  1: {
    de: "Hier begann alles. König Osric stand vor einer Schlacht, die er nicht gewinnen konnte — und öffnete den Riss. Der Riss gab ihm Diener. Dafür nahm er jedem zuerst den Namen. Seither heißt das Opfer der Krone nur noch: der Gambit. In jener Nacht begann eine junge Seherin ein verbotenes Verzeichnis — jeden Namen, den niemand mehr sprechen darf. Auf diesen Feldern beginnt nun auch dein Weg, {held} — die Chronik hat deinen Namen längst eingetragen.",
    en: "On the home fields of the Kronland King Osric won a war he could not win: he opened the rift and offered it servants instead of soldiers. The rift set a single condition — it takes the name first, then the man. Ever since, the Crown's sacrifice bears one title only: the Gambit. That night a young seeress began a forbidden register — every name no one may speak again. On these same fields your own road begins, {held} — the chronicle has already entered your name.",
  },
  2: {
    de: "Das Korn steht hoch, und niemand erntet es. Am Rand der Felder liegt ein Turnierplatz, auf dem seit dem Riss kein Herold mehr ruft. Varek, der Schwarze Ritter, reitet dort jeden Abend ein, als säße der Hof noch auf den Tribünen. In seinen Schild hat jemand einen Namen geritzt, den kein Wappenbuch kennt: Asra. Er hat ihn überstrichen. Bei Regen kommt er wieder durch. Auch deine Schritte zählt man hier, {held}.",
    en: "The wheat stands tall, and no one harvests it. At the edge of the fields lies a tiltyard where no herald has called since the rift. Varek, the Black Knight, rides in every evening as though the court still sat in the stands. Someone scratched a name into his shield that no roll of arms contains: Asra. He painted over it. In the rain it shows through again. Here your steps are counted too, {held}.",
  },
  3: {
    de: "Im Bernsteinlaub des Eichwalds fault nichts — es verändert sich nur. Malrik, der Seuchenkönig, kam mit dem ersten Nebel vom Meer herauf und blieb, wo die Wurzeln am tiefsten reichen. Was er berührt, wächst weiter, aber falsch. Die Köhler sagen, er suche unter den Eichen nach einem Namen, den der Riss ihm ließ, und finde nur fremde. Unter diesem Schweigen gehst jetzt du, {held}.",
    en: "In the amber leaves of the Eichwald nothing rots — it only changes. Malrik, the Plaguelord, came up from the sea with the first fog and stayed where the roots reach deepest. What he touches keeps growing, but wrongly. The charcoal burners say he searches beneath the oaks for a name the rift left him, and finds only those of others. You walk beneath that silence now, {held}.",
  },
  4: {
    de: "Wo der Eichwald dünner wird, wachsen die Bäume krumm — der Wind erlaubt kein aufrechtes Stehen mehr. Hirten sagen, an der Baumgrenze hört man den Riss zum ersten Mal: nicht als Laut, sondern als Stille zwischen zwei Glockenschlägen. Isolde, die Dornenkönigin, hat dort ihren Garten gepflanzt, wo sonst nichts mehr aufrecht wächst: für jeden, den der Riss nahm, eine Rose ohne Namen. Horch an der Baumgrenze, {held} — die Stille kennt dich schon.",
    en: "Where the Eichwald thins, the trees grow crooked — the wind no longer permits standing upright. Herders say the treeline is where you first hear the rift: not as a sound, but as the silence between two bell strokes. Isolde, the Thorn Queen, planted her garden there, where nothing else grows upright anymore: for everyone the rift took, a rose without a name. Listen at the treeline, {held} — the silence knows you already.",
  },
  5: {
    de: "In einem Winter vor Jahren kam jemand aus dem Riss zurück — barfuß, ohne Namen, mit dem Gedächtnis eines ganzen Hofes. Der Schnee bewahrte die Spur, die Kälte hielt sie still. Yorrik, der Winterkönig, ließ sein Reich darüber gefrieren, damit ihm niemand mehr etwas nimmt — auch diese Spur nicht. Sie endet am Archiv. Die Kälte wird auch deine Spur bewahren, {held}.",
    en: "One winter years ago someone came back out of the rift — barefoot, nameless, carrying a whole court's memory. The snow kept the trail, the cold kept it still. Yorrik, the Winter King, let his realm freeze over it so that nobody could take anything from him again — not even that trail. It ends at the archive. The cold will keep your trail as well, {held}.",
  },
  6: {
    de: "Über diese Pässe floh, was vom Hof übrig war, und verriegelte hinter sich jede Tür. Thalor, der Hüter, trägt die Schlüssel noch — nur eine Tür findet er bis heute: das Archiv der Krone. Dort lag Vesnas verbotenes Verzeichnis, Name um Name, bis zu jenem Winter. Seither bewacht der Hüter ein leeres Regal, so streng wie je. Keine dieser Türen öffnet sich dir freiwillig, {held}.",
    en: "Over these passes fled what remained of the court, bolting every door behind it. Thalor, the Keeper, still carries the keys — only one door he can find to this day: the Crown's archive. There lay Vesna's forbidden register, name upon name, until that winter. Ever since, the Keeper guards an empty shelf, as strictly as ever. None of those doors will open for you willingly, {held}.",
  },
  7: {
    de: "Auf der Sattelweite ritt der Lanzenmeister einst Turniere für den ganzen Hof — und einen letzten Gang für Asra, seine beste Schülerin, am Vorabend ihres Abstiegs. Er reitet ihn noch immer, Gang um Gang, gegen eine Gegnerin, die nur er sieht. Er weiß, dass etwas zurückgekehrt ist. Er weigert sich zu sehen, was. Hinter den Tribünen dauert Seraphines Maskenball an — der Hof tanzt weiter, weil niemand wagt, als Erster die Maske abzunehmen. Vielleicht sieht er in dir den nächsten Gang, {held}.",
    en: "On the Sattelweite the Lancemaster once rode tourneys for the whole court — and one last tilt for Asra, his finest student, on the eve of her descent. He rides it still, tilt after tilt, against an opponent only he can see. He knows something has returned. He refuses to see what. Behind the stands Seraphine's masked ball goes on — the court keeps dancing because nobody dares to be the first to unmask. Perhaps in you he sees the next tilt, {held}.",
  },
  8: {
    de: "Der Aschgrund war der erste Preis: Wo der Riss trank, blieben rissige Erde und totes Geäst. Hier liest die Blutmagd den Ritus — ein Kelch, der nie geleert und nie gefüllt wird, für den letzten Schluck vor dem Abstieg. Asra trank daraus, und sie soll gelächelt haben. Die Blutmagd schenkt seither niemandem mehr nach. Den Ritus hat Cassian, der Intrigant, ersonnen — er hat nie selbst getrunken, und Morwens Raben tragen weiter, wer als Nächster an der Reihe ist. Für dich, {held}, steht der Kelch noch unberührt.",
    en: "The Aschgrund was the first price: where the rift drank, cracked earth and dead boughs remained. Here the Bloodmaid keeps the rite — a chalice never emptied and never filled, for the last sip before the descent. Asra drank from it, and they say she smiled. The Bloodmaid has refilled no cup since. The rite was devised by Cassian, the Schemer — he never drank himself, and Morwen's ravens carry word of whose turn is next. For you, {held}, the chalice stands untouched.",
  },
  9: {
    de: "Die Wunde trägt ihren Namen zu Recht: Hier führt die Treppe hinab, die jeder Gambit zuletzt geht — die Stufen glatt von bloßen Füßen. Am Grund liegt der Riss offen und atmet. Eisenfaust hält seit dem ersten Tag die Wache, die Faust um einen Namen geballt, den er nicht mehr aussprechen kann. Veyl, der Schattenfürst, stieg die Stufen halb hinab und kam halb zurück. Wer hier lauscht, hört den Riss flüstern: Er übt Namen, wie andere Klingen wetzen. Übt er schon deinen, {held}?",
    en: "The Wunde carries its name for a reason: here run the steps every Gambit walks last — worn smooth by bare feet. At the bottom the rift lies open, breathing. Ironfist has stood watch since the first day, his fist clenched around a name he can no longer speak. Veyl, the Shadowlord, went half way down the steps and came half way back. Listen here and you will hear the rift whisper: practising names the way others whet blades. Is it practising yours yet, {held}?",
  },
  10: {
    de: "Der Sonnenschlund verschluckt Spuren, Namen und Absichten; nur die Oase erinnert sich. Hierher kam Vesna, die Seherin, als selbst sie Asras Namen vergessen hatte — denn sie war es, die ihn dem Riss genannt hat, um den Hof zu retten. Das Verzeichnis ist fort; Asra sammelt darin keine Rache, sondern Namen: Sie will jeden einzelnen zurückgeben, und wenn der Hof daran zerbricht. Eines trägt Vesna noch bei sich — den Namen des jungen Gambit, aufgeschrieben vor dem Ritus, gegen jede Regel: Corvin. Über dem Brunnen der Oase liegt Brakk, der Koloss: ein Mann, bevor seine Fäuste zu Stein wurden, und seither der Deckel auf allem, was darunter wohnt. Was die Oase über dich erinnert, {held}, hat sie noch niemandem verraten.",
    en: "The Sonnenschlund swallows tracks, names and intentions; only the oasis remembers. Here came Vesna the seeress when even she had forgotten Asra's name — for it was she who spoke it to the rift, to save the court. The register is gone; Asra collects no revenge in it, only names: she means to give every one of them back, though the court should break on it. One thing Vesna still carries — the young Gambit's name, written down before the rite, against every rule: Corvin. Over the oasis well lies Brakk, the Colossus: a man before his fists turned to stone, and ever since the lid on everything that lives beneath. What the oasis remembers of you, {held}, it has told no one yet.",
  },
  11: {
    de: "Die K\u00fcste ist der letzte Ort mit Namen: Hier enden die Stra\u00dfen, hier beginnen die Listen des Hafenmeisters. Er verzeichnet jede Fracht, die aufs Endlose Meer hinausgeht \u2014 nur eine Zeile l\u00e4sst er seit Jahren frei, gleich oben, f\u00fcr ein Boot, das zur\u00fcckkommen soll. Vesna hat ihm daf\u00fcr einen Namen angeboten. Er hat abgelehnt: Solange die Zeile leer ist, sagt er, ist niemand genommen. Vor der Mole sitzt Halvar, der Gezeitenk\u00f6nig, auf einem Thron, \u00fcber dem seit dem Riss das Wasser steht; und am letzten Kai wartet Asra, die einmal die erste Klinge der Krone war. Deine Zeile, {held}, ist noch nicht geschrieben.",
    en: "The Coast is the last place with names: here the roads end, here the harbourmaster's ledgers begin. He records every cargo that sails out onto the Endless Sea \u2014 only one line he has kept blank for years, right at the top, for a boat that is meant to return. Vesna offered him a name for it. He refused: as long as the line is blank, he says, no one has been taken. Off the mole sits Halvar, the Tide King, on a throne that has stood under water since the rift; and on the last quay waits Asra, once the Crown's first blade. Your line, {held}, is not yet written.",
  },
  12: {
    de: "Das Endlose Meer ist, wohin der Riss ausblutet: Was er nicht behalten will, spült er hier an. Der Kapitän fährt die Habseligkeiten der Genommenen hinaus — Fracht ohne Empfänger, seit Osrics erster Nacht. Irgendwo auf diesem Wasser wartet der alte König als Großmeister: Der Riss holt sich zuletzt den, der ihn geöffnet hat. Und zum ersten Mal steigt ein Gambit mit Namen herab — diesmal weiß der Riss, wen er nimmt. Vielleicht macht genau das den Unterschied. Der Riss kennt jetzt zwei Namen: Corvin — und {held}.",
    en: "The Endless Sea is where the rift bleeds out: what it will not keep, it washes up here. The Captain ferries out the belongings of the taken — cargo with no recipient, since Osric's first night. Somewhere on this water the old king waits as Grandmaster: the rift comes last for the one who opened it. And for the first time a Gambit walks down carrying a name — this time the rift knows whom it takes. Perhaps that is exactly what makes the difference. The rift knows two names now: Corvin — and {held}.",
  },
};

/* v1.0.13 (Besitzer, Punkt 6): DIE CHRONIK KENNT DEN NAMEN. Jeder Kapiteltext
   traegt einen {held}-Platzhalter; hier wird er gegen profile.name getauscht.
   Ohne Namen sagt die Chronik "Namenloser" - im Reich, das Namen frisst, ist
   das kein Notbehelf, sondern die Wahrheit. */
export function loreText(liga, en = false, name = "") {
  const l = LEAGUE_LORE[liga];
  if (!l) return null;
  const wer = (name || "").trim() || (en ? "the Nameless" : "Namenloser");
  return (en ? l.en : l.de).split("{held}").join(wer);
}
