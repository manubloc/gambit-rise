/* ══════════════════════════════════════════════════════════════════════════
   DIE WIRKUNG DER BUENDE  (v1.10.0)

   Die Datengrundlage steht in content/buende.js - hier wird sie zu Regeln.

   WARUM DAS EINE EIGENE DATEI IST: der Kern soll nichts von Buenden wissen
   muessen. Er fragt an zwei, drei Stellen nach ("faengt jemand diesen
   Treffer ab?", "darf diese Figur durch besetzte Felder?") und bekommt eine
   Antwort. Wer spaeter einen Bund aendert, aendert hier - nicht in
   transitions.js, wo jeder Eingriff das ganze Regelwerk beruehrt.

   DIE BUENDE STEHEN IM SPIELSTAND als state.buende (Liste von Kennungen).
   Gesetzt wird sie beim Aufbau der Partie, aus den Stufen des Profils; der
   Kern liest sie nur. So bleibt der Kern rein und die Frage "ist mein Bund
   erwacht?" wird genau einmal beantwortet, nicht in jedem Zug neu.
   ══════════════════════════════════════════════════════════════════════════ */

import { KIND, WHITE } from "../domain/constants.js";

/** Liegen zwei Felder nebeneinander (auch diagonal)? */
function nebenan(a, b, w) {
  const df = Math.abs((a % w) - (b % w));
  const dr = Math.abs(Math.floor(a / w) - Math.floor(b / w));
  return df <= 1 && dr <= 1 && (df || dr);
}

/** Teilen sich zwei Felder eine Reihe oder eine Linie? */
function gleicheReihe(a, b, w) {
  return (a % w) === (b % w) || Math.floor(a / w) === Math.floor(b / w);
}

const hat = (state, bund) => !!(state && state.buende && state.buende.includes(bund));

/** Findet die eigene Figur einer Art; null, wenn sie nicht (mehr) steht. */
function finde(state, farbe, charId) {
  for (let i = 0; i < state.board.length; i++) {
    const p = state.board[i];
    if (p && p.color === farbe && p.charId === charId) return i;
  }
  return null;
}

/* ── KRONE: der Paladin faengt einen Treffer ab ───────────────────────────
   NUR NEBENAN (Besitzer ausdruecklich): "Das gilt nur, wenn er neben dem
   Koenig auch steht. Der darf nicht irgendwo stehen." Ein Leibwaechter, der
   quer ueber dem Brett schuetzt, waere keiner.

   Gibt das Feld des Paladins zurueck, wenn er einspringt - sonst null. */
export function kroneFaengtAb(state, zielFeld) {
  if (!hat(state, "krone")) return null;
  const opfer = state.board[zielFeld];
  if (!opfer || opfer.kind !== KIND.KING) return null;
  const pf = finde(state, opfer.color, "paladin");
  if (pf == null) return null;
  if (!nebenan(pf, zielFeld, state.w)) return null;
  /* Ein Paladin, der selbst am Ende ist, kann niemanden mehr decken. */
  const pal = state.board[pf];
  if (pal.hp != null && pal.hp <= 0) return null;
  return pf;
}

/* ── SCHILDWACHT: Schild fuer die gemeinsame Reihe ────────────────────────
   Auch hier eine Ortsbedingung (Besitzer): "Die muessten in dem Moment aber
   auch in einer Reihe stehen - das kann vertikal wie horizontal sein, je
   nachdem wie die halt stehen." */
export function schildwachtDeckt(state, feld) {
  if (!hat(state, "schildwacht")) return false;
  const p = state.board[feld];
  if (!p) return false;
  const tf = finde(state, p.color, "engineer");
  const gf = finde(state, p.color, "guardian");
  if (tf == null || gf == null) return false;
  if (!gleicheReihe(tf, gf, state.w)) return false;
  /* gedeckt ist, wer auf DERSELBEN Reihe oder Linie steht wie die beiden */
  return gleicheReihe(feld, tf, state.w) && gleicheReihe(feld, gf, state.w);
}

/* ── GEZEITEN: der Kapitaen zieht durch besetzte Felder ───────────────────
   "Ein Kapitaen ohne Lotsen laeuft auf Grund. Mit Lotsen kommt er ueberall
   durch." Der Stratege muss dafuer stehen - faellt er, endet die Fahrt. */
export function gezeitenDurchbruch(state, piece) {
  if (!hat(state, "gezeiten")) return false;
  if (!piece || piece.charId !== "captain") return false;
  return finde(state, piece.color, "strategist") != null;
}

/* ── SCHATTEN: der Attentaeter ist unsichtbar ─────────────────────────────
   Der Besitzer hat die Regel selbst geschaerft: nicht dauerhaft, sondern nur
   solange Hexerin und Magier STILLSTEHEN. "In dem Moment, wo man ihn bewegt,
   zeigt man den Attentaeter." Das macht aus einer Faehigkeit, die einfach
   laeuft, eine Entscheidung in jedem Zug.

   `verraten` merkt sich, wann zuletzt eine der beiden gezogen hat. */
export function schattenVerbirgt(state, piece) {
  if (!hat(state, "schatten")) return false;
  if (!piece || piece.charId !== "assassin") return false;
  /* Steht ueberhaupt noch eine der beiden? */
  const hexe = finde(state, piece.color, "sorceress");
  const magier = finde(state, piece.color, "mage");
  if (hexe == null && magier == null) return false;
  /* Wurde eine von ihnen im letzten Zug bewegt? Dann ist er sichtbar. */
  const lm = state.lastMove;
  if (lm && lm.color === piece.color && (lm.charId === "sorceress" || lm.charId === "mage")) return false;
  return true;
}

/* ── NACHTWACHE: der Alchemist heilt ───────────────────────────────────────
   Gibt das Feld zurueck, das geheilt werden soll - oder null. Gewaehlt wird
   die angrenzende eigene Figur mit dem GROESSTEN Fehlbetrag; eine
   vollstaendig heile Figur wird nie gewaehlt. */
export function nachtwacheHeilt(state, farbe) {
  if (!hat(state, "nachtwache")) return null;
  const af = finde(state, farbe, "alchemist");
  if (af == null) return null;
  let bestes = null, fehlt = 0;
  for (let i = 0; i < state.board.length; i++) {
    const p = state.board[i];
    if (!p || p.color !== farbe || i === af) continue;
    if (!nebenan(af, i, state.w)) continue;
    if (p.hp == null || p.maxHp == null) continue;
    const f = p.maxHp - p.hp;
    if (f > fehlt) { fehlt = f; bestes = i; }
  }
  return bestes;
}

/* ── STURM: die Amazone kehrt zurueck ─────────────────────────────────────
   GEMESSEN UND GEAENDERT: der erste Entwurf gab ihr einen zusaetzlichen
   Fernkampfschuss. Sie hat aber mit 24 Leben und 14 Angriff die staerksten
   Werte im Spiel - mehr Feuerkraft haette den Bund erdrueckend gemacht. Der
   Rueckruf wirkt EINMAL und macht sie nicht staerker, sondern schwerer
   loszuwerden. */
export function sturmRuftZurueck(state, piece) {
  if (!hat(state, "sturm")) return false;
  if (!piece || piece.charId !== "amazon") return false;
  if (state.sturmVerbraucht && state.sturmVerbraucht[piece.color]) return false;
  return finde(state, piece.color, "warlock") != null;
}

/* ── BANNKREIS: gegnerische Talente sind gesperrt ─────────────────────────
   Zwei Felder Umkreis um Seherin ODER Inquisitor. */
export function bannkreisSperrt(state, feld, farbe) {
  if (!hat(state, "bannkreis")) return false;
  const gegner = farbe === WHITE ? "b" : WHITE;
  for (const id of ["seeress", "inquisitor"]) {
    const f = finde(state, gegner, id);
    if (f == null) continue;
    const df = Math.abs((f % state.w) - (feld % state.w));
    const dr = Math.abs(Math.floor(f / state.w) - Math.floor(feld / state.w));
    if (df <= 2 && dr <= 2) return true;
  }
  return false;
}

/* ── FAEHRTE: der andere rueckt nach ──────────────────────────────────────
   Gibt das Feld der Figur zurueck, die nachziehen darf - und das Zielfeld,
   auf das sie einen Schritt tut. Null, wenn nichts moeglich ist. */
export function faehrteFolgt(state, gezogen) {
  if (!hat(state, "faehrte")) return null;
  const p = state.board[gezogen];
  if (!p) return null;
  const partner = p.charId === "hawk" ? "pathfinder" : p.charId === "pathfinder" ? "hawk" : null;
  if (!partner) return null;
  const pf = finde(state, p.color, partner);
  if (pf == null) return null;
  return pf;
}
