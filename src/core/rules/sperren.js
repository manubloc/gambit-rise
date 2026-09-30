// ── WAS AUF DEM FELD STEHT UND NICHT ZIEHT ──────────────────────────────────
// Mauern, Zaeune und Fallen (v0.90, Besitzerentwurf). Sie sind KEINE Figuren:
// sie ziehen nicht, sie schlagen nicht, sie zaehlen nicht zum Material. Sie
// besetzen ein Feld und aendern, was dort moeglich ist.
//
// DIE ENTSCHEIDUNGEN, die dieser Datei zugrunde liegen:
//
//  1. EINE SPERRE KOSTET ZUEGE, NICHT FIGUREN. Wer gegen sie schlaegt, bleibt
//     stehen - der Zug ist fort, die Figur unversehrt. Genau das ist der
//     Nachteil, den der Besitzer wollte: nicht das Zerschlagen selbst, der
//     verlorene Zug.
//  2. DREI STADIEN. Jede Sperre bricht sichtbar: heil, angeschlagen,
//     Truemmer. Darum traegt sie Lebenspunkte und keinen blossen Schalter.
//  3. WER SPRINGT, KOMMT DARUEBER. Der Springer (und jeder Sprungzug) setzt
//     ueber eine Mauer hinweg - er landet nur nicht darauf. Gleitende Figuren
//     hingegen halten davor an, wie an jeder Wand.
//  4. FALLEN SIEHT NUR, WER SIE LEGTE. Sie liegen still, bis jemand
//     hineinzieht; danach sind sie fuer alle sichtbar (die Grube bleibt).
//  5. (v1.0.63) SIE STEHEN VORN, NICHT DAHEIM. Gesetzt wird ausschliesslich
//     in der dritten und vierten Reihe der EIGENEN Seite - also vor der
//     Bauernreihe, nicht dahinter. Eine Sperre soll den Vormarsch des Gegners
//     stoeren, nicht den eigenen Koenig einmauern.
//  6. (v1.0.63) ZWEI, NICHT MEHR. Wer beliebig viele setzen darf, spielt
//     kein Schach mehr, sondern Belagerung. Zwei je Seite sind eine
//     Entscheidung; die dritte waere nur noch Gewohnheit.
//  7. (v1.0.63) NICHTS HAELT EWIG. Jede Sperre broeckelt VON SELBST: alle
//     ZERFALL_TAKT Halbzuege verliert sie einen Punkt, ganz ohne Schlag.
//     Selbst das Bollwerk ist damit nach 18 Zuegen fort - keine Sperre
//     ueberdauert 20 Zuege. Das ist die Bedingung, unter der der Besitzer
//     sie ueberhaupt wollte: ein VERZOEGERN, kein zweites Brett.

/* v1.90.16 (Audit A37): die Rueckfaelle fuer ein Brett ohne w/h standen hier
   noch auf 10 - aus der Zeit vor dem 8x8-Umbau. Jeder Spielstand traegt w/h;
   fehlen sie doch einmal, gilt das Brett, das es heute gibt. */
import { FILES, RANKS } from "../domain/constants.js";

/** Die Sorten. Preis und Haerte gehoeren zusammen: was laenger haelt, kostet
 *  mehr - und kostet den Gegner mehr Zuege. */
export const SPERR_ARTEN = {
  // Der Zaun: billig, schnell fort. Ein Zug Aufenthalt, mehr nicht.
  zaun:      { hp: 1, gold: 40,  nameDe: "Zaun",        nameEn: "Fence",
               beschreibungDe: "Hält einen einzigen Schlag auf. Billig und schnell wieder fort." },
  // Die Mauer: das Rueckgrat. Zwei Schlaege, also zwei verlorene Zuege.
  mauer:     { hp: 2, gold: 110, nameDe: "Mauer",       nameEn: "Wall",
               beschreibungDe: "Zwei Schläge, bis sie fällt — zwei Züge, die dem Gegner fehlen." },
  // Der Bergfried: teuer und zaeh. Drei Zuege sind eine halbe Partie.
  bergfried: { hp: 3, gold: 240, nameDe: "Bollwerk",    nameEn: "Bulwark",
               beschreibungDe: "Drei Schläge. Wer hier durchwill, verliert eine halbe Eröffnung." },
};

/** Fallen wirken anders: sie halten niemanden auf, sie strafen das Betreten. */
export const FALLEN_ARTEN = {
  // Die Spitzgrube: fester Schaden, sofort.
  grube:     { schaden: 2, gold: 90,  nameDe: "Spitzgrube", nameEn: "Pit trap",
               beschreibungDe: "Wer hineintritt, nimmt 2 Schaden. Danach liegt sie offen." },
  // Die Baerenfalle: kein Schaden, aber die Figur steht fest - ein Zug fort.
  baerenfalle: { fessel: 1, gold: 130, nameDe: "Bärenfalle", nameEn: "Bear trap",
               beschreibungDe: "Kein Schaden — die Figur sitzt fest und setzt einen Zug aus." },
};

// ── Zugriff ─────────────────────────────────────────────────────────────────
// Sperren und Fallen liegen als schlichte Verzeichnisse am Zustand, damit
// Klonen und Speichern nichts Besonderes lernen muessen.

export const sperrenVon = (state) => state.sperren || null;
export const sperreAuf = (state, i) => (state.sperren ? state.sperren[i] : undefined);
export const fallenVon = (state) => state.fallen || null;
export const falleAuf = (state, i) => (state.fallen ? state.fallen[i] : undefined);

/** Steht dort etwas, das den Weg versperrt? */
export function versperrt(state, i) {
  const s = sperreAuf(state, i);
  return !!(s && s.hp > 0);
}

/** In welchem der drei Stadien steht die Sperre? Fuer das Bild auf dem Brett. */
export function stadium(sperre) {
  if (!sperre || sperre.hp <= 0) return "truemmer";
  const voll = SPERR_ARTEN[sperre.art]?.hp || 1;
  if (sperre.hp >= voll) return "heil";
  /* v1.0.89: DAS BOLLWERK ZEIGT JEDEN SCHLAG. Der Besitzer hat vier Gemaelde
     geliefert - heil, angeschlagen, schwer beschaedigt, Truemmer. Bei drei
     Trefferpunkten gab es bisher nur EIN Schadensbild fuer hp 2 UND hp 1;
     wer zweimal zuschlug, sah keinen Unterschied. Jetzt traegt hp 1 bei
     dreipunktigen Sperren sein eigenes Bild. Zaun (1) und Mauer (2) bleiben
     unberuehrt: dort gibt es dieses Stadium gar nicht. */
  if (voll >= 3 && sperre.hp === 1) return "schwer";
  return "angeschlagen";
}

/** Einen Schlag gegen eine Sperre fuehren. Gibt das neue Verzeichnis zurueck
 *  (oder dasselbe, wenn dort nichts stand). */
export function schlageSperre(sperren, i) {
  const s = sperren && sperren[i];
  if (!s || s.hp <= 0) return { sperren, gefallen: false };
  const neu = { ...sperren };
  if (s.hp <= 1) { delete neu[i]; return { sperren: neu, gefallen: true }; }
  neu[i] = { ...s, hp: s.hp - 1 };
  return { sperren: neu, gefallen: false };
}

/** Eine Falle ausloesen. Liefert die Wirkung und das bereinigte Verzeichnis:
 *  die Falle bleibt liegen, ist aber ab jetzt offen (und wirkt nicht erneut). */
export function loeseFalleAus(fallen, i) {
  const f = fallen && fallen[i];
  if (!f || f.offen) return { fallen, wirkung: null };
  const art = FALLEN_ARTEN[f.art] || FALLEN_ARTEN.grube;
  const neu = { ...fallen, [i]: { ...f, offen: true } };
  return { fallen: neu, wirkung: { art: f.art, schaden: art.schaden || 0, fessel: art.fessel || 0 } };
}

/** Sieht diese Seite die Falle? Nur wer sie gelegt hat - bis sie zuschnappt. */
export function falleSichtbar(falle, fuerFarbe) {
  if (!falle) return false;
  return falle.offen || falle.von === fuerFarbe;
}

// ── KAUFEN, SETZEN, ZERFALLEN (v1.0.63) ─────────────────────────────────────
// Bis hierher konnte eine Sperre nur DASTEHEN - wer sie hinstellte, sagte
// niemand. Ab hier gehoert sie dem Spieler: gekauft beim Kraemer (siehe
// content/items.js, die Preise stehen oben in SPERR_ARTEN), gesetzt vor dem
// ersten Zug, und von da an im stillen Zerfall.

/** Wie viele Sperren eine Seite gleichzeitig auf dem Brett haben darf. */
export const MAX_SPERREN = 2;

/** Halbzuege je Lebenspunkt. Zwoelf Halbzuege sind sechs volle Zuege: der
 *  Zaun (1) haelt sechs, die Mauer (2) zwoelf, das Bollwerk (3) achtzehn -
 *  keine ueberdauert die zwanzig Zuege, die der Besitzer als Grenze zog. */
export const ZERFALL_TAKT = 12;

/** Die beiden Reihen, in die diese Farbe setzen darf: die dritte und vierte
 *  der eigenen Seite (0-basiert 2 und 3, von der eigenen Grundreihe aus).
 *  Weiss steht unten, Schwarz oben - so bauen alle Karten des Spiels. */
export function setzReihen(state, farbe) {
  const h = state?.h ?? RANKS;
  return farbe === "w" ? [2, 3] : [h - 3, h - 4];
}

/** Alle Felder, auf die diese Farbe JETZT setzen duerfte. Leer, wenn ihr
 *  Vorrat auf dem Brett schon voll ist - so muss die Oberflaeche die Regel
 *  nicht zweimal kennen. */
export function setzFelder(state, farbe) {
  const felder = [];
  if (sperrenAnzahl(state?.sperren, farbe) >= MAX_SPERREN) return felder;
  const w = state?.w ?? FILES;
  const reihen = setzReihen(state, farbe);
  for (const r of reihen) {
    if (r < 0 || r >= (state?.h ?? RANKS)) continue;
    for (let f = 0; f < w; f++) {
      const i = r * w + f;
      if (feldFrei(state, i)) felder.push(i);
    }
  }
  return felder;
}

/** Steht dort wirklich nichts? Keine Figur, keine Sperre, kein Loch. */
export function feldFrei(state, i) {
  if (!state || i == null || i < 0 || i >= state.board.length) return false;
  if (state.board[i]) return false;
  if (state.holes && state.holes.has && state.holes.has(i)) return false;
  return !sperreAuf(state, i);
}

/** Wie viele Sperren dieser Farbe stehen gerade? */
export function sperrenAnzahl(sperren, farbe) {
  if (!sperren) return 0;
  let n = 0;
  for (const s of Object.values(sperren)) if (s && s.hp > 0 && s.von === farbe) n++;
  return n;
}

/** Darf diese Farbe hier setzen? Eine einzige Wahrheit fuer Oberflaeche,
 *  Netzcode und Proben. */
export function darfSetzen(state, i, farbe) {
  if (!feldFrei(state, i)) return false;
  if (sperrenAnzahl(state?.sperren, farbe) >= MAX_SPERREN) return false;
  const w = state?.w ?? FILES;
  return setzReihen(state, farbe).includes((i / w) | 0);
}

/** Eine Sperre setzen. Liefert das NEUE Verzeichnis (oder dasselbe, wenn die
 *  Regel es verbietet) - der Aufrufer vergleicht per === , ob es klappte. */
export function setzeSperre(state, i, art, farbe, moveCount = 0) {
  if (!SPERR_ARTEN[art] || !darfSetzen(state, i, farbe)) return state?.sperren || null;
  return { ...(state.sperren || {}), [i]: {
    art, hp: SPERR_ARTEN[art].hp, von: farbe, bis: (moveCount || 0) + ZERFALL_TAKT } };
}

/** Eine Sperre wieder aufnehmen (nur waehrend des Setzens, vor dem ersten
 *  Zug): das Feld wird frei, der Vorrat kehrt zurueck. */
export function nimmSperre(sperren, i) {
  if (!sperren || !sperren[i]) return sperren;
  const neu = { ...sperren };
  delete neu[i];
  return neu;
}

/* ══ DIE FALLEN (v1.90.9, Audit A32) ════════════════════════════

   Bis v1.90.8 gab es von den Fallen NUR den Datentyp oben und die reine
   Funktion loeseFalleAus. transitions.js importierte sie, rief sie aber
   nirgends auf, und `state.fallen` wurde an keiner Stelle gefuellt: weder
   Gegenstand noch Setzen noch Wirkung. CLAUDE.md fuehrte sie trotzdem
   jahrelang als gebaut. Besitzerentscheid vom 29.9.2026: "Die Fallen koennen
   und sollten wir noch bauen."

   WAS EINE FALLE VON EINER SPERRE UNTERSCHEIDET - und warum sie nicht
   dieselben Funktionen benutzen kann:
     - Eine Sperre STEHT sichtbar und haelt auf. Eine Falle LIEGT verborgen
       und straft das Betreten (Entscheidung 4 im Kopf dieser Datei: "Fallen
       sieht nur, wer sie legte").
     - Eine Sperre zerfaellt von selbst (ZERFALL_TAKT). Eine Falle wartet,
       so lange es dauert - sie kostet den Gegner ja nichts, solange er sie
       meidet. Ein Zerfall wuerde bedeuten: aussitzen genuegt.
     - Eine Sperre blockiert das Feld. Eine Falle nicht - sonst waere sie
       sichtbar, sobald jemand daran haengenbleibt.
   Gemeinsam bleibt, WO gesetzt werden darf: dritte und vierte eigene Reihe
   (setzReihen), vor dem ersten Zug. Eine Falle in der eigenen Grundreihe
   waere ein Selbstschuss, eine im gegnerischen Lager kein Hinterhalt mehr.

   NUR IM HP-GEFECHT. Die Spitzgrube macht SCHADEN, und Schaden gibt es im
   reinen Schach nicht - dort haben Figuren keine Lebenspunkte. Dieselbe
   Grenze, die schon fuer die Sperren gilt (GameScreen: sperrenErlaubt
   schliesst "classic" aus). */

/** Wie viele Fallen eine Seite gleichzeitig auf dem Brett haben darf. Zwei,
 *  wie bei den Sperren - aus demselben Grund (Entscheidung 6 oben: die
 *  dritte waere nur noch Gewohnheit). */
export const MAX_FALLEN = 2;

/** Wie viele Fallen dieser Farbe liegen gerade? Ausgeloeste zaehlen mit:
 *  sie liegen noch da, offen, und das Feld ist verbraucht. */
export function fallenAnzahl(fallen, farbe) {
  if (!fallen) return 0;
  let n = 0;
  for (const f of Object.values(fallen)) if (f && f.von === farbe) n++;
  return n;
}

/** Ist das Feld frei von allem - Figur, Loch, Sperre UND Falle? Zwei Fallen
 *  auf einem Feld waeren eine zu viel, und eine Falle unter einer Mauer
 *  betritt nie jemand. */
export function feldGanzFrei(state, i) {
  if (!feldFrei(state, i)) return false;
  return !falleAuf(state, i);
}

/** Darf diese Farbe hier eine Falle legen? */
export function darfFalleLegen(state, i, farbe) {
  if (!feldGanzFrei(state, i)) return false;
  if (fallenAnzahl(state?.fallen, farbe) >= MAX_FALLEN) return false;
  const w = state?.w ?? FILES;
  return setzReihen(state, farbe).includes((i / w) | 0);
}

/** Alle Felder, auf die diese Farbe JETZT eine Falle legen duerfte. */
export function fallenFelder(state, farbe) {
  const felder = [];
  if (fallenAnzahl(state?.fallen, farbe) >= MAX_FALLEN) return felder;
  const w = state?.w ?? FILES;
  for (const r of setzReihen(state, farbe)) {
    if (r < 0 || r >= (state?.h ?? RANKS)) continue;
    for (let f = 0; f < w; f++) {
      const i = r * w + f;
      if (feldGanzFrei(state, i)) felder.push(i);
    }
  }
  return felder;
}

/** Eine Falle legen. Liefert das NEUE Verzeichnis (oder dasselbe, wenn die
 *  Regel nein sagt) - wie setzeSperre vergleicht der Aufrufer per ===. */
export function legeFalle(state, i, art, farbe) {
  if (!FALLEN_ARTEN[art] || !darfFalleLegen(state, i, farbe)) return state?.fallen || null;
  return { ...(state.fallen || {}), [i]: { art, von: farbe, offen: false } };
}

/** Eine noch nicht ausgeloeste Falle wieder aufnehmen (nur beim Setzen). */
export function nimmFalle(fallen, i) {
  if (!fallen || !fallen[i] || fallen[i].offen) return fallen;
  const neu = { ...fallen };
  delete neu[i];
  return neu;
}

/* Wer die Falle SIEHT, sagt `falleSichtbar` weiter oben - die gibt es seit
   v0.90 und sie tut genau das. Eine zweite Fassung hier waere die zweite
   Wahrheit, vor der der Kopf dieser Datei an drei Stellen warnt. */

/** DER ZERFALL. Nach jedem Halbzug aufgerufen: was faellig ist, verliert
 *  einen Punkt; was leer laeuft, verschwindet. Steht nichts an, kommt das
 *  UNVERAENDERTE Verzeichnis zurueck - die KI-Suche legt diesen Weg
 *  millionenfach zurueck und darf dabei nichts kopieren muessen. */
export function zerfalleSperren(sperren, moveCount) {
  if (!sperren) return sperren;
  let neu = null;
  for (const k of Object.keys(sperren)) {
    const s = sperren[k];
    if (!s || s.bis == null || moveCount < s.bis) continue;
    if (!neu) neu = { ...sperren };
    /* Mehrere Takte auf einmal koennen faellig sein (Ruecknahme per
       Zeitenwender, geladener Spielstand) - darum die Schleife. */
    let hp = s.hp, bis = s.bis;
    while (hp > 0 && moveCount >= bis) { hp--; bis += ZERFALL_TAKT; }
    if (hp > 0) neu[k] = { ...s, hp, bis }; else delete neu[k];
  }
  return neu || sperren;
}
