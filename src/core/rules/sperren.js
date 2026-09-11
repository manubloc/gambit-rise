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
  const h = state?.h ?? 10;
  return farbe === "w" ? [2, 3] : [h - 3, h - 4];
}

/** Alle Felder, auf die diese Farbe JETZT setzen duerfte. Leer, wenn ihr
 *  Vorrat auf dem Brett schon voll ist - so muss die Oberflaeche die Regel
 *  nicht zweimal kennen. */
export function setzFelder(state, farbe) {
  const felder = [];
  if (sperrenAnzahl(state?.sperren, farbe) >= MAX_SPERREN) return felder;
  const w = state?.w ?? 10;
  const reihen = setzReihen(state, farbe);
  for (const r of reihen) {
    if (r < 0 || r >= (state?.h ?? 10)) continue;
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
  const w = state?.w ?? 10;
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
