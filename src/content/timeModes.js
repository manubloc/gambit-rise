// ── ZWEI SPIELARTEN IM NETZ (v1.92.0, Besitzer 6.10.2026) ────────────────────
//
// "Ich wuerde maximal zwei Spielmodi beim Online haben ... 30 Sekunden bis 5
//  Minuten, alle in einen Topf - wer schnell spielen will, darf schnell
//  spielen ... und die andere waere diese Langzeitvariante, wo man sich 24
//  Stunden oder so Zeit nehmen darf."
//
// Bis v1.91.2 gab es vier Uhren (Quick 1 min, Rush 3 min, Prime 10 min, Classic
// ueber Tage), und zwei Spieler trafen sich nur, wenn sie DIESELBE gewaehlt
// hatten - vier duenne Warteschlangen statt einer vollen.
//
// Jetzt:
//   blitz   EIN Topf. Jeder waehlt SEINE Bedenkzeit zwischen 30 Sekunden und
//           5 Minuten und spielt mit ihr - der Gegner mit seiner. Wer schnell
//           spielen will, zwingt niemanden dazu. Die Kennung auf der Leitung
//           ist "b<Sekunden>" (b30 ... b300).
//   daily   die Fernpartie: bis zu drei Tage je Zug (unveraendert; die Halle
//           erinnert am letzten Tag und entscheidet nach Fristablauf).
//
// Diese Tabelle lesen die Lobby (Karten), die Uhr im Gefecht und - als Regel,
// nicht als Import - die Halle (worker/src/logic.mjs: normTc, tcKlasse).

/** Die waehlbaren Bedenkzeiten des schnellen Spiels, in Sekunden. */
export const BLITZ_ZEITEN = [30, 60, 120, 180, 300];
/* v1.93.0 (Besitzer 7.10.: "es gibt nur zwei Modi, und der eine geht einfach bis
   5 Minuten, Punkt - nicht von bis"): die Lobby bietet keine Auswahl mehr an,
   jeder spielt das kurze Gambit mit fuenf Minuten. Die uebrigen Stufen bleiben
   LESBAR - Geraete mit der Fassung 1.92 schicken sie noch, und die Halle haelt
   laufende Partien damit. */
export const BLITZ_VORGABE = 300;
/** Fischer-Aufschlag je Zug: wer unter zwei Minuten waehlt, bekommt eine Sekunde zurueck, sonst zwei. */
export const blitzAufschlag = (sekunden) => (sekunden < 120 ? 1 : 2);
export const blitzTc = (sekunden = BLITZ_VORGABE) => "b" + (BLITZ_ZEITEN.includes(sekunden) ? sekunden : BLITZ_VORGABE);
export const blitzText = (sekunden, en = false) => (sekunden < 60 ? `${sekunden} s` : `${sekunden / 60} ${en ? "min" : "Min"}`);

export const TIME_MODES = [
  {
    id: "blitz",
    de: { name: "Kurzes Gambit", tag: "bis 5 Min",
      blurb: "Eine Partie am Stück: jeder hat fünf Minuten Bedenkzeit für das ganze Spiel." },
    en: { name: "Short Gambit", tag: "up to 5 min",
      blurb: "One game in one sitting: each side has five minutes on the clock for the whole game." },
    base: BLITZ_VORGABE, inc: blitzAufschlag(BLITZ_VORGABE), color: "#e5a13d", glyph: "bolt", featured: true,
  },
  {
    id: "daily",
    de: { name: "Langes Gambit", tag: "bis 3 Tage je Zug",
      blurb: "Die Fernpartie: zieh, wann du Zeit hast. Für jeden Zug hast du bis zu drei Tage." },
    en: { name: "Long Gambit", tag: "up to 3 days a move",
      blurb: "The correspondence game: move when you have a moment. Up to three days for every move." },
    base: 86400, inc: 0, perMove: true, color: "#a78bfa", glyph: "crown",
    // Both legs of the format stand: the game lives on the server (seed, both
    // armies, every command — it outlasts both players closing the app), and
    // Web Push knocks on the closed app when it is your move.
    noteDe: "Deine Fernpartien warten auf dem Server und stehen in der Lobby unter Fernpartien. Erlaube die Benachrichtigung, dann meldet sich das Spiel, sobald du am Zug bist. Wer drei Tage nicht zieht, verliert auf Zeit.",
    noteEn: "Your correspondence games wait on the server and appear in the lobby. Allow the notification and the game will call the moment it is your move. Three days without a move loses on time.",
  },
];

/* Die alten Kennungen kommen noch von Geraeten, die die neue Fassung nicht
   geladen haben, und aus laufenden Partien der Halle. */
const ALT = { quick: 60, rush: 180, prime: 300 };
/** Sekunden einer Blitz-Kennung ("b120", aber auch die alten "quick"/"rush"/"prime"); null bei "daily". */
export function blitzSekunden(tc) {
  if (tc === "daily") return null;
  if (ALT[tc]) return ALT[tc];
  const m = /^b(\d{1,3})$/.exec(String(tc || ""));
  const n = m ? Number(m[1]) : BLITZ_VORGABE;
  return Math.max(BLITZ_ZEITEN[0], Math.min(BLITZ_ZEITEN[BLITZ_ZEITEN.length - 1], n));
}
export const timeModeById = (id) => (id === "daily" ? TIME_MODES[1] : TIME_MODES[0]);

/** In welchem Topf wartet diese Kennung? Zwei Spieler treffen sich nur im selben. */
export const timeModeKey = (tc) => (tc === "daily" ? "daily" : "blitz");

/** Die Uhr einer Partie, wie der Zeitnehmer des Bretts sie versteht. `tcGegner`
 *  ist die Kennung der anderen Seite - im schnellen Spiel hat jede ihre eigene
 *  Zeit; fehlt sie (alte Halle, Fernpartie), gilt die eigene fuer beide. */
export function clockFor(tc, tcGegner = null) {
  if (tc === "daily") return { type: "move", seconds: TIME_MODES[1].base, inc: 0 };
  const ich = blitzSekunden(tc), er = tcGegner && tcGegner !== "daily" ? blitzSekunden(tcGegner) : ich;
  return { type: "total", seconds: ich, inc: blitzAufschlag(ich), foeSeconds: er, foeInc: blitzAufschlag(er) };
}
