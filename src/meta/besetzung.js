/* ── v1.35.0: DIE GEGNERBESETZUNG (Kampagnenumbau, Schritt B) ───────────────
   Besitzerentscheide 21./22.9. (design/KAMPAGNE-AUFSTELLUNG.md, -BAUPLAN):

   - Der Gegner aendert seine Aufstellung erst AB KAPITEL III, und nicht bei
     jedem Level.
   - Auf die freien Plaetze (Turm, Laeufer, Springer) rueckt, wer dem Spieler
     schon BEGEGNET ist (codex.met - gesetzt beim Betreten einer Station,
     unabhaengig vom Ausgang) und ihm NICHT GEHOERT: Sonderfiguren und
     gewoehnliche Monster. Kapitelmeister nie. Jede Figur nur einmal.
   - Die Besetzung einer Station ist FEST. Sie wird beim ersten Betreten
     festgehalten (profile.campaign.besetzung[Station]) und aendert sich nur,
     wenn sich der BESITZ aendert: wer inzwischen dem Spieler gehoert, geht,
     und fuer ihn rueckt der Naechste nach. Nie durch Verlust oder Neustart -
     auch nicht dadurch, dass man anderswo neue Figuren getroffen hat.
   - "WECHSELNDE AUFSTELLUNG" (Label mit gekreuzten Pfeilen): an einem Teil
     der Stationen stehen DIESELBEN Figuren bei jedem Versuch auf anderen
     freien Plaetzen. Koenig und Dame fest.
   - Der Erstauftritt bleibt auf dem Damenplatz (Stationsboss) - wer dort
     steht, rueckt nicht zugleich auf einen freien Platz.

   Alles hier ist rein: dieselbe Station mit demselben Spielstand ergibt
   dieselbe Besetzung. Keine Zufallszahl ohne Keim. */
import { CHARACTER_LIST } from "../content/index.js";
import { BOSSES, LEAGUE_BOSSES } from "../content/bosses.js";
import { ownedLeagueBosses } from "./leveling.js";

/* Ein fester Streuwert (FNV-1a) - derselbe Text gibt immer dieselbe Zahl. */
export function streuwert(text) {
  let x = 2166136261;
  for (let i = 0; i < text.length; i++) { x ^= text.charCodeAt(i); x = Math.imul(x, 16777619); }
  /* Endmischung (murmur3 fmix32): aehnliche Kennungen wie L07s12 und L07s13
     lagen sonst dicht beieinander - Liga 7 hatte keine einzige wechselnde
     Station, Liga 3 achtzehn von 43 */
  x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return x >>> 0;
}
/* Eine feste Mischung einer Liste nach Keim (Fisher-Yates mit LCG). */
function gemischt(liste, keim) {
  const a = [...liste]; let s = keim >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Wer ueberhaupt auf einem freien Platz stehen kann: die Sonderfiguren (ohne
   die Grundfiguren, den Gambit und den Drachen - der braucht seine Schwinge)
   und die gewoehnlichen Monster. In fester Reihenfolge. */
const GRUND = new Set(["pawn", "gambit", "king", "queen", "rook", "bishop", "knight", "dragon"]);
export const BESETZUNGS_VORRAT = [
  ...CHARACTER_LIST.filter((c) => !GRUND.has(c.id)).map((c) => c.id),
  ...BOSSES.filter((b) => !LEAGUE_BOSSES.includes(b.id)).map((b) => "boss:" + b.id),
];
const FREIE_ART = new Set(["rook", "bishop", "knight"]);
const kindVon = (id) => CHARACTER_LIST.find((c) => c.id === id)?.kind;

/** Ist dieser Eintrag dem Spieler begegnet und gehoert ihm nicht? */
export function istKandidat(profile, eintrag) {
  const met = new Set(profile?.codex?.met || []);
  if (eintrag.startsWith("boss:")) {
    const id = eintrag.slice(5);
    if (LEAGUE_BOSSES.includes(id)) return false;
    return met.has("X:" + id) && !ownedLeagueBosses(profile).includes(id);
  }
  const k = kindVon(eintrag);
  return !!k && met.has(k) && !(profile?.campaign?.unlocked || []).includes(eintrag);
}

/** Was eine Station traegt - aus ihrer Kennung, fest. Ab Kapitel III; nicht
 *  an Boss-, Final- und Torstationen (dort gehoert der Auftritt einem). */
export function besetzungsPlan(node) {
  const lg = node?.league || 1;
  if (!node || lg < 3 || node.boss || node.final || node.gate) return { k: 0, wechselnd: false };
  const anteil = Math.min(70, 25 + (lg - 3) * 5);                 // Kapitel III 25 % ... XII 70 %
  const kMax = lg >= 9 ? 3 : lg >= 6 ? 2 : 1;                     // ein bis drei Plaetze, mit dem Kapitel wachsend
  const k = (streuwert(node.id + ":besetzt") % 100) < anteil ? 1 + (streuwert(node.id + ":zahl") % kMax) : 0;
  const wechselnd = (streuwert(node.id + ":wechselnd") % 4) === 0;  // etwa jede vierte Station
  return { k, wechselnd };
}

/* DIE STAERKEKLASSE (Besitzer, Entwurf 21.9.: "aus derselben Staerkeklasse
   des Balance-Tests"). Gemessen: ohne sie war das besetzte Heer SCHWAECHER
   als das klassische - Turm, Springer und Laeufer liegen bei 50/55/61 %, der
   Vorrat im Mittel knapp darunter; bei drei Plaetzen gewann das besetzte Heer
   nur 25 %. Jetzt kommt jeder Ersatz aus der Klasse der Figur, deren Platz er
   nimmt (hoechstens 6 Punkte daneben); findet sich keiner, bleibt die
   klassische Figur. Die Werte stammen aus npm run balance (reife Heere,
   22.9.2026) und sind mit dem naechsten Balance-Lauf nachzuziehen - eine
   Probe prueft, dass jeder Eintrag des Vorrats einen Wert hat. */
export const STAERKE = {
  "seeress": 76,
  "bishop": 61,
  "boss:b07": 59,
  "archbishop": 59,
  "boss:b15": 57,
  "amazon": 56,
  "boss:b13": 56,
  "boss:b02": 55,
  "boss:b04": 55,
  "knight": 55,
  "boss:b21": 54,
  "sorceress": 53,
  "boss:b22": 52,
  "chancellor": 52,
  "hawk": 51,
  "mage": 51,
  "rook": 50,
  "boss:b11": 49,
  "warlock": 49,
  "inquisitor": 48,
  "paladin": 48,
  "boss:b09": 48,
  "boss:b03": 47,
  "captain": 47,
  "boss:b05": 46,
  "pathfinder": 46,
  "alchemist": 45,
  "bard": 45,
  "standard": 44,
  "guardian": 43,
  "strategist": 43,
  "boss:b01": 41,
  "engineer": 37,
  "boss:b06": 36,
  "assassin": 35,
};
export const KLASSEN_BREITE = 6;
const gleicheKlasse = (e, platzFigur) => STAERKE[e] != null && STAERKE[platzFigur] != null
  && Math.abs(STAERKE[e] - STAERKE[platzFigur]) <= KLASSEN_BREITE;

/** Die Besetzung fuer diesen Spielstand, JE PLATZ: plaetze sind feste freie
 *  Plaetze der Station, eintraege[n] steht auf plaetze[n] (oder null: dort
 *  bleibt die klassische Figur). Gespeichert bleibt gespeichert - auch ein
 *  leerer Platz bleibt leer, damit Begegnungen anderswo nichts nachfuellen.
 *  Nur wer dem Spieler inzwischen GEHOERT, geht; fuer ihn rueckt der Naechste
 *  derselben Klasse nach. ausser = wer schon auf dem Damenplatz steht. */
export function besetzungFuer(node, profile, formation, ausser = []) {
  const plan = besetzungsPlan(node);
  if (!plan.k || !Array.isArray(formation)) return null;
  const frei = formation.map((id, i) => (FREIE_ART.has(id) ? i : -1)).filter((i) => i >= 0);
  const plaetze = gemischt(frei, streuwert(node.id + ":plaetze")).slice(0, plan.k);
  const gespeichert = profile?.campaign?.besetzung?.[node.id];
  const fest = Array.isArray(gespeichert) && gespeichert.length === plaetze.length;
  const passt = (e) => istKandidat(profile, e) && !ausser.includes(e);
  const reihe = gemischt(BESETZUNGS_VORRAT, streuwert(node.id + ":vorrat"));
  const vergeben = new Set(fest ? gespeichert.filter((e) => e && passt(e)) : []);
  const eintraege = plaetze.map((i, n) => {
    if (fest) {
      const alt = gespeichert[n];
      if (alt == null) return null;                 // beim Betreten leer - bleibt leer
      if (passt(alt)) return alt;                   // steht weiter da
    }
    const e = reihe.find((c) => passt(c) && !vergeben.has(c) && gleicheKlasse(c, formation[i]));
    if (e) vergeben.add(e);
    return e || null;
  });
  return { plaetze, eintraege, neu: !fest || JSON.stringify(eintraege) !== JSON.stringify(gespeichert) };
}

/** Die Aufstellung des Gegners: die Besetzung auf ihre Plaetze; bei
 *  wechselnder Aufstellung mischt der Versuch alle freien Plaetze neu.
 *  Koenig und Dame (und alles, was keine freie Figur ist) bleiben stehen. */
export function gegnerAufstellung(node, formation, besetzung, versuch = 0) {
  const plan = besetzungsPlan(node);
  const frei = formation.map((id, i) => (FREIE_ART.has(id) ? i : -1)).filter((i) => i >= 0);
  if (!frei.length) return formation;
  const f = [...formation];
  (besetzung?.plaetze || []).forEach((i, n) => { const e = besetzung.eintraege[n]; if (e) f[i] = e; });
  if (plan.wechselnd) {
    const inhalt = frei.map((i) => f[i]);
    const neu = gemischt(inhalt, streuwert(node.id + ":versuch:" + versuch));
    frei.forEach((i, n) => { f[i] = neu[n]; });
  }
  return f;
}
