import { gezeitenDurchbruch, bannkreisSperrt } from "./buende.js";
import {
  FILES, RANKS, KIND, DIAG, ORTHO, KING_STEPS, KNIGHT_JUMPS, LONG_LEAPS, DIAG_LEAPS,
  fileOf, rankOf, dirOf, startPawnRank, promoRank,
} from "../domain/constants.js";

/* PASSIVE TALENTE - dauerhaft, kein Zauber. Sie kosten nichts, sie werden
   nicht gebucht, und sie ueberleben das geschlossene Buch. Die Liste steht
   hier im Kern, weil der Kern die Chronik (content/abilities.js) nicht
   importieren darf; sie muss mit deren once:false-Eintraegen uebereinstimmen
   - test_zauber.mjs prueft das. */
export const PASSIVE_TALENTE = new Set([
  "pawn_charge", "pawn_early_promo", "knight_longleap", "knight_outrider",
  "rook_diag_step", "gambit_masquerade",   /* v1.37.0: Dauerfeuer ist fort (v1.28.1), Fliegen II/III sind Stufen */
  "lifesteal", "regen", "bulwark",
  /* v1.30.0: die Monsterfaehigkeiten am Treffer - sie wirken von selbst */
  "steinhaut", "widerhall", "unsterblich", "wegelagerei",
  /* v1.31.0: Gift, Aderlass, Schrecken wirken von selbst. Blenden und
     Geistwandel sind Einmal-Faehigkeiten (Stufen zaehlen die Einsaetze). */
  "gift", "aderlass", "schrecken",
]);

/* ── TALENTE, DIE OHNE LEBENSPUNKTE KEINEN SINN ERGEBEN (v1.2.0) ───────────
   Besitzerentscheid: "Wenn man klassisch Schach spielt und nicht HP-Gefecht,
   ist es natuerlich wichtig, dass diese Faehigkeiten nicht genutzt werden
   koennen - dass die dann automatisch gesperrt ist, auch wenn man eine Figur
   haette, die so eine Eigenschaft hat. Man kann natuerlich nicht in irgend
   einer Form den Vorteil daraus schlagen, dass sich die eigene Figur mit
   Leben wieder auffuellt."

   Es sind genau die drei mit der Art "Zaehigkeit": Lebensraub heilt beim
   Schlagen, Regeneration heilt bei jedem Zug, Bollwerk mindert Schaden. In
   einer klassischen Partie gibt es weder Schaden noch Leben - sie wuerden
   entweder nichts tun oder, schlimmer, auf undefinierten Werten rechnen.
   Zugtalente bleiben ausdruecklich erlaubt: ein Sonderzug funktioniert auch
   ohne Lebenspunkte, und der Besitzer will ihn behalten. */
/* v1.31.0: alle neun Monsterfaehigkeiten brauchen Lebenspunkte - im Schach gibt
   es weder Gift noch Blindheit noch einen Geist. */
export const NUR_MIT_LEBEN = new Set(["lifesteal", "regen", "bulwark", "steinhaut", "widerhall", "unsterblich", "wegelagerei",
  "gift", "aderlass", "schrecken", "blenden", "geistwandel"]);

/** Wirkt dieses Talent unter diesen Regeln? In Klassik schweigen die drei
 *  Lebenstalente - unabhaengig davon, ob die Figur sie traegt. */
/* ── WIRKT DIESES TALENT? (erweitert v1.10.8) ─────────────────────────────
   Zwei Gruende, warum ein Talent schweigt:

   1. LEBENSTALENTE IN KLASSIK. Lebensraub und Regeneration brauchen
      Lebenspunkte; ohne sie waeren sie sinnlos (seit v1.2.0).

   2. DER BANNKREIS. Stehen Seherin oder Inquisitor des Gegners im Umkreis
      von zwei Feldern, sind die Talente dieser Figur gesperrt.

   Der zweite Grund braucht den ORT - deshalb nimmt die Funktion jetzt
   Spielstand und Feld entgegen. Beide sind freiwillig: wer sie nicht
   uebergibt, bekommt die alte Antwort, und alle bestehenden Aufrufe bleiben
   gueltig. */
export const talentWirkt = (id, rules, state = null, feld = null, farbe = null) => {
  if (rules === "chess" && NUR_MIT_LEBEN.has(id)) return false;
  if (state && feld != null && farbe && bannkreisSperrt(state, feld, farbe)) return false;
  return true;
};

export function hasAbility(piece, id) {
  // ONE SPELL PER GAME: a piece may KNOW many talents, but may FIRE only one
  // across the whole battle. The first use closes the book — used{} is the
  // ledger, so any prior entry silences every remaining active talent.
  if (!piece.abilities.includes(id)) return false;
  /* 4.9.2026 (Besitzerbefund, per Probe reproduziert): das geschlossene Buch
     sperrte auch die PASSIVEN Talente - der Gambit verlor nach seinem ersten
     Zauber den Sturmlauf, den die Chronik als "jederzeit" verspricht. Ein
     passives Talent ist kein Zauber; es bleibt, egal was das Buch sagt. */
  if (PASSIVE_TALENTE.has(id)) return true;
  /* v1.27.3 (Besitzer): keine Figur - auch Gambit und Koenig - darf starke
     Faehigkeiten dauerhaft haben. */
  /* ── v1.28.0: ZAUBER HABEN STUFEN (Besitzerentscheid, design/FAEHIGKEITEN-
     STUFEN.md). Stufe I: einmal je Partie, II: zweimal, III: dreimal. Das Buch
     bleibt EIN Buch: sobald eine Figur einen ANDEREN Zauber gewirkt hat, ist es
     fuer alle uebrigen zu - wie bisher. Neu ist nur, dass derselbe Zauber so
     oft wirken darf, wie seine Stufe erlaubt. */
  const andererGewirkt = Object.keys(piece.used || {}).some((k) => k !== id && einsaetze(piece, k) > 0);
  if (andererGewirkt) return false;
  return einsaetze(piece, id) < stufeVon(piece, id);
}
/* Wie oft ein Zauber schon gewirkt wurde. Alte Staende buchten `true` - das
   zaehlt als einmal. */
export const einsaetze = (piece, id) => {
  const u = piece && piece.used ? piece.used[id] : undefined;
  return u === true ? 1 : (typeof u === "number" ? u : 0);
};
/* Die Stufe eines Zaubers an dieser Figur (1 bis 3), aus dem Heerplan. */
export const stufeVon = (piece, id) => Math.max(1, Math.min(3, (piece && piece.stufen && piece.stufen[id]) || 1));
/* Wie oft er noch darf. */
export const zauberRest = (piece, id) => Math.max(0, stufeVon(piece, id) - einsaetze(piece, id));
/* Einen Einsatz verbuchen. */
export const verbuche = (piece, id) => { piece.used = piece.used || {}; piece.used[id] = einsaetze(piece, id) + 1; };
// ── Board-shape context ──────────────────────────────────────────────────────
// D carries the dimensions + hole mask for the current match. A hole behaves
// like a wall: nothing lands on it and sliders are blocked by it.
import { versperrt } from "./sperren.js";

const NO_HOLES = new Set();
const dimsOf = (state) => ({ w: state.w ?? FILES, h: state.h ?? RANKS, holes: state.holes ?? NO_HOLES, sperren: state });
const ix = (f, r, D) => r * D.w + f;
const onBoard = (f, r, D) => f >= 0 && f < D.w && r >= 0 && r < D.h && !D.holes.has(r * D.w + f);

function push(moves, from, to, piece, capture, captureKind, extra) {
  moves.push({ from, to, piece: piece.id, kind: piece.kind, color: piece.color, capture, captureKind, ...extra });
}

/* ── v1.90.4 (Audit A10): EINE MAUER IST FUER JEDEN EINE MAUER ──────────
   Bis hierher fragten nur drei Stellen nach der Sperre: step, slide und der
   Bauern-Vorwaertszug. Alles andere - Zugbild-Gleiter, Blinzeln, Koenigs-
   sprint, Durchbruch, Huepfer, Seitschritt, Sturmlauf, Rueckschritt, Brut und
   der ganze Drache - sah nur `board` und landete darum MITTEN AUF der Mauer.
   Und wer auf der Mauer steht, war unschlagbar: step und slide bieten gegen
   ein versperrtes Feld nur `{schlag:true}` an, also einen Schlag gegen die
   MAUER, nie gegen die Figur darauf. Gemessen im Audit (regeln.mjs A1-A5):
   der Kanonier-Gleiter zog durch die Mauer und darauf; stand dort eine Dame,
   bot der Turm nur den Schlag gegen die Sperre an. Die gekaufte Sperre wurde
   so zum Schutzschild des Gegners - bis zu 18 Zuege lang.

   `betretbar` ist ab jetzt DIE eine Frage, die jeder Block stellt.
   `mauerschlag` ist die Antwort fuer die Blocks, die - wie step - gegen die
   Mauer schlagen duerfen; wer nur versetzt (Blinzeln, Brut, Drache), bekommt
   gar nichts angeboten, denn ein Versatz ist kein Angriff. */
function betretbar(D, i) { return !(D.sperren && versperrt(D.sperren, i)); }
function mauerschlag(moves, from, i, piece, extra) {
  push(moves, from, i, piece, false, null, { ...(extra || {}), schlag: true });
}

// Add a single non-sliding target (knight/king style). Skips own pieces + holes.
function step(moves, from, f, r, piece, board, D, extra) {
  if (!onBoard(f, r, D)) return;
  const i0 = ix(f, r, D);
  if (D.sperren && versperrt(D.sperren, i0)) {
    push(moves, from, i0, piece, false, null, { ...(extra || {}), schlag: true });
    return;
  }
  const t = board[ix(f, r, D)];
  if (t && t.color === piece.color) return;
  push(moves, from, ix(f, r, D), piece, !!t, t ? t.kind : null, extra || {});
}

// Slide along directions until blocked (own piece, capture, edge or hole).
/* v1.10.2: slide bekommt den Spielstand, damit es die Buende fragen kann.
   Bisher kannte es nur Brett und Masse - das reichte, solange ein Zug nur von
   Figuren abhing. Die Gezeiten haengen aber daran, ob der Stratege STEHT,
   und das weiss nur der Spielstand. */
function slide(moves, from, f0, r0, dirs, piece, board, D, state) {
  for (const [df, dr] of dirs) {
    let f = f0 + df, r = r0 + dr;
    while (onBoard(f, r, D)) {
      const i = ix(f, r, D);
      /* v0.90: EINE SPERRE HAELT DEN GLEITER AUF - wie jede Wand. Aber sie
         ist zerstoerbar: der Zug DORTHIN bleibt erlaubt und wird zum SCHLAG
         gegen die Sperre (die Figur ruehrt sich nicht, der Zug ist fort). */
      if (D.sperren && versperrt(D.sperren, i)) {
        push(moves, from, i, piece, false, null, { schlag: true });
        break;
      }
      const t = board[i];
      /* ── GEZEITEN: der Kapitaen zieht durch (v1.10.2) ────────────────────
         "Ein Kapitaen ohne Lotsen laeuft auf Grund. Mit Lotsen kommt er
         ueberall durch." Steht der Stratege auf dem Brett, endet der Zug des
         Kapitaens nicht an einer Figur - er umschifft sie.

         NUR DIE EIGENEN (Besitzerentscheid nach dem ersten Bau): "Ich faende
         auch ok, dass der Kapitaen natuerlich auch gerne nur seine eigenen
         umschiffen kann und nicht Gegner, dann ist es auch nicht ganz so
         stark."

         Er hat in beidem recht. Es ist SCHWAECHER - ein Kapitaen, der durch
         feindliche Linien gleitet, waere kaum aufzuhalten gewesen. Und es ist
         SCHLUESSIGER: ein Lotse kennt die eigene Flotte und weiss, wie man
         zwischen ihr hindurchkommt; fremde Schiffe stehen ihm genauso im Weg
         wie jedem anderen.

         An einem Gegner endet der Zug also weiterhin - mit Schlag, wie
         ueblich. */
      const lotse = gezeitenDurchbruch(state, piece);
      if (t && t.color === piece.color) { if (!lotse) break; f += df; r += dr; continue; }
      push(moves, from, i, piece, !!t, t ? t.kind : null, {});
      if (t) break;
      f += df; r += dr;
    }
  }
}

function pawnMoves(moves, from, f, r, piece, board, D, state) {
  const dir = dirOf(piece.color);
  const early = hasAbility(piece, "pawn_early_promo");
  const promoR = promoRank(piece.color, D.h);
  const startR = startPawnRank(piece.color, D.h);
  /* v1.37.0: FRUEHE KROENUNG nach Stufe - eine oder zwei Reihen frueher */
  const frueh = early ? Math.min(2, stufeVon(piece, "pawn_early_promo")) : 0;
  const isPromo = (rr) => rr === promoR || (frueh >= 1 && rr === promoR - dir) || (frueh >= 2 && rr === promoR - 2 * dir);

  const fwd = r + dir;
  if (onBoard(f, fwd, D) && D.sperren && versperrt(D.sperren, ix(f, fwd, D))) {
    push(moves, from, ix(f, fwd, D), piece, false, null, { schlag: true });   // Bauern schlagen die Mauer geradeaus
  } else if (onBoard(f, fwd, D) && !board[ix(f, fwd, D)]) {
    push(moves, from, ix(f, fwd, D), piece, false, null, isPromo(fwd) ? { promotion: KIND.QUEEN } : {});
    const r2 = r + 2 * dir;
    /* v1.0.63: der DOPPELSCHRITT muss die Sperre ebenso sehen. Bisher pruefte
       er nur `board` - und weil die Sperren genau in der dritten und vierten
       Reihe stehen duerfen, waere der Doppelschritt des Bauern MITTEN IN die
       eigene Mauer gelaufen (sein Ziel ist die dritte Reihe). Das fiel nicht
       auf, solange nie jemand eine Sperre setzen konnte. */
    if (r === startR && onBoard(f, r2, D) && !board[ix(f, r2, D)]
        && !(D.sperren && versperrt(D.sperren, ix(f, r2, D))))
      push(moves, from, ix(f, r2, D), piece, false, null, { double: true });
  }
  // diagonal captures
  for (const df of [-1, 1]) {
    const cf = f + df, cr = fwd;
    if (!onBoard(cf, cr, D)) continue;
    const t = board[ix(cf, cr, D)];
    if (t && t.color !== piece.color)
      push(moves, from, ix(cf, cr, D), piece, true, t.kind, isPromo(cr) ? { promotion: KIND.QUEEN } : {});
  }
  // ── EN PASSANT (v0.49): stand der Nachbar-Bauer des Gegners im LETZTEN Zug
  // per Doppelschritt neben uns, darf er im Vorbeigehen geschlagen werden -
  // Zug auf das UEBERSPRUNGENE Feld, der Bauer verschwindet von seinem.
  // Nur ausserhalb des HP-Modus: dort gibt es kein "Vorbeiziehen", Schlagen
  // ist Schaden auf dem Zielfeld.
  if (state && state.rules !== "hp") {
    const lm = state.lastMove;
    if (lm && lm.kind === KIND.PAWN && lm.double && !lm.capture) {
      const lf = fileOf(lm.to, D.w), lr = rankOf(lm.to, D.w);
      if (lr === r && Math.abs(lf - f) === 1) {
        const ziel = ix(lf, r + dir, D);
        if (onBoard(lf, r + dir, D) && !board[ziel])
          push(moves, from, ziel, piece, true, KIND.PAWN, { special: "enpassant", epCapture: lm.to });
      }
    }
  }

  // ABILITY: forward capture (once)
  if (hasAbility(piece, "pawn_forward_capture") && onBoard(f, fwd, D)) {
    const t = board[ix(f, fwd, D)];
    if (t && t.color !== piece.color)
      push(moves, from, ix(f, fwd, D), piece, true, t.kind, { special: "fcap", consumes: "pawn_forward_capture", ...(isPromo(fwd) ? { promotion: KIND.QUEEN } : {}) });
  }
  // ABILITY: sidestep (once, non-capturing)
  if (hasAbility(piece, "pawn_sidestep")) {
    for (const df of [-1, 1]) {
      const sf = f + df;
      if (!onBoard(sf, r, D)) continue;
      const si = ix(sf, r, D);
      if (!betretbar(D, si)) { mauerschlag(moves, from, si, piece, { special: "side", consumes: "pawn_sidestep" }); continue; }
      if (!board[si]) push(moves, from, si, piece, false, null, { special: "side", consumes: "pawn_sidestep" });
    }
  }
  /* ABILITY: charge (passive) — v1.34.0: STAERKESTUFEN (Besitzer): Stufe I
     bis zu zwei Felder jederzeit, II bis zu drei, III bis zu vier; der Weg
     muss frei sein, geschlagen wird nicht. Zwei Felder von der Startreihe
     gibt es ohnehin - die entfallen hier. BEHOBEN: landet der Lauf auf der
     letzten Reihe, wandelt er sich um wie jeder Bauernzug (vorher blieb ein
     Bauer auf der gegnerischen Grundreihe stehen). */
  if (hasAbility(piece, "pawn_charge")) {
    const weit = 1 + Math.max(1, Math.min(3, stufeVon(piece, "pawn_charge")));
    for (let d = 1; d <= weit; d++) {
      const rr = r + d * dir;
      if (!onBoard(f, rr, D)) break;
      const ri = ix(f, rr, D);
      /* Die Mauer haelt den Sturmlauf auf wie jede Figur - der Schlag gegen
         sie bleibt erlaubt, danach ist der Lauf zu Ende. */
      if (!betretbar(D, ri)) { if (d >= 2 && !(d === 2 && r === startR)) mauerschlag(moves, from, ri, piece, { special: "rush" }); break; }
      if (board[ri]) break;
      if (d < 2 || (d === 2 && r === startR)) continue;
      push(moves, from, ix(f, rr, D), piece, false, null, { special: "rush", ...(isPromo(rr) ? { promotion: KIND.QUEEN } : {}) });
      if (isPromo(rr)) break;
    }
  }
  // ABILITY: backstep (once, non-capturing) — retreat one square
  if (hasAbility(piece, "pawn_backstep")) {
    const br = r - dir;
    if (onBoard(f, br, D)) {
      const bi = ix(f, br, D);
      if (!betretbar(D, bi)) mauerschlag(moves, from, bi, piece, { special: "back", consumes: "pawn_backstep" });
      else if (!board[bi]) push(moves, from, bi, piece, false, null, { special: "back", consumes: "pawn_backstep" });
    }
  }
}

/** All pseudo-legal moves for the piece at sqIndex (ignores king safety). */
export function pieceMoves(state, sqIndex) {
  const board = state.board;
  const piece = board[sqIndex];
  if (!piece) return [];
  /* ── v1.90.9 (Audit A32): WER IN DER BAERENFALLE SITZT, ZIEHT NICHT ────
     Die Falle macht keinen Schaden - sie kostet den Zug DIESER Figur. Der
     Marker sitzt an der Figur und nicht am Feld: sie schleppt das Eisen ja
     mit, und ein Marker am Feld waere beim naechsten Schritt verloren.
     Hier, ganz vorn, weil es fuer JEDE Gangart gilt - Zugbild, Sprung,
     Blinzeln und Drache eingeschlossen. */
  if (piece.fesselBis != null && piece.fesselBis > (state.moveCount || 0)) return [];
  const D = dimsOf(state);
  const f = fileOf(sqIndex, D.w), r = rankOf(sqIndex, D.w), from = sqIndex, moves = [];

  switch (piece.kind) {
    case KIND.PAWN: pawnMoves(moves, from, f, r, piece, board, D, state); break;
    case KIND.KNIGHT: for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D); break;
    case KIND.KING: {
      for (const [df, dr] of KING_STEPS) step(moves, from, f + df, r + dr, piece, board, D);
      // ROCHADE (v0.49): Koenig ungezogen, Turm ungezogen in seiner Ecke der
      // Heimreihe, dazwischen frei - dann zieht der Koenig ZWEI Felder zum
      // Turm und der Turm springt auf die Innenseite. Die Sicherheit von
      // Stand- und Kreuzfeld prueft legalMoves (attacks.js importiert dieses
      // Modul - ein Gegenimport waere ein Zyklus). Funktioniert auf jedem
      // Brett, dessen Ecke ein ungezogener eigener Turm hueten.
      if (!piece.hasMoved && !piece.moveSpec) {
        for (const [rf, richtung] of [[D.w - 1, 1], [0, -1]]) {
          if (D.holes.size && D.holes.has(ix(rf, r, D))) continue;
          const turm = board[ix(rf, r, D)];
          if (!turm || turm.kind !== KIND.ROOK || turm.color !== piece.color || turm.hasMoved) continue;
          let frei = true;
          for (let ff = Math.min(f, rf) + 1; ff < Math.max(f, rf); ff++)
            if (!onBoard(ff, r, D) || board[ix(ff, r, D)]) { frei = false; break; }
          if (!frei) continue;
          const zf = f + 2 * richtung;
          if (!onBoard(zf, r, D)) continue;
          /* ── v1.90.4 (Audit A35): ZWEI FELDER BRAUCHEN AUCH PLATZ ───────
             Geprueft wurde nur, ob das Zielfeld auf dem Brett liegt - nicht,
             ob der Koenig damit auf oder ueber seinen eigenen Turm rutscht.
             Steht der Koenig auf c1 und der Turm auf a1, landete er nach der
             Rochade AUF a1: b1 und c1 leer, der eigene Turm bei den
             geschlagenen Figuren (Audit-Messung B1). Heute unerreichbar, weil
             formationLegalOn den Koenig festnagelt - aber jede kuenftige
             Mischaufstellung oder ein eingelesenes Profil koennte ihn dorthin
             stellen, und dann verschwindet stumm ein Turm. Der Abstand muss
             mindestens drei Felder betragen, damit Ziel- UND Kreuzfeld
             zwischen Koenig und Turm liegen. */
          if (Math.abs(rf - f) < 3) continue;
          push(moves, from, ix(zf, r, D), piece, false, null,
            { special: "castle", rookFrom: ix(rf, r, D), rookTo: ix(f + richtung, r, D), cross: ix(f + richtung, r, D) });
        }
      }
      break;
    }
    case KIND.BISHOP: slide(moves, from, f, r, DIAG, piece, board, D, state); break;
    case KIND.ROOK: slide(moves, from, f, r, ORTHO, piece, board, D, state); break;
    case KIND.QUEEN: slide(moves, from, f, r, KING_STEPS, piece, board, D, state); break;
    case KIND.CHANCELLOR:
      slide(moves, from, f, r, ORTHO, piece, board, D, state);
      for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D);
      break;
    case KIND.ARCHBISHOP:
      slide(moves, from, f, r, DIAG, piece, board, D, state);
      for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D);
      break;
    case KIND.HAWK: // knight + one diagonal step (nimble flank skirmisher)
      for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D);
      for (const [df, dr] of DIAG) step(moves, from, f + df, r + dr, piece, board, D);
      break;
    case KIND.AMAZON: // queen + knight (the super-piece)
      slide(moves, from, f, r, KING_STEPS, piece, board, D, state);
      for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D);
      break;
  }

  // ── Ability-granted moves ────────────────────────────────────────────────
  /* ── v1.90.4 (Audit A12): WELCHER SPRUNG DARF SCHACH BIETEN? ────────
     In pseudoMoves steht eine Bremse: im Schach zielt ein `leap` nie auf den
     Koenig ("Extended-leap abilities kept smother-mating the boxed-in
     starting king in 2-3 moves"). Gemeint waren die TALENTE. Nur trugen die
     Zugbilder der Sonderfiguren und Monster (moveSpec.leaps) dasselbe
     Etikett - fuenf Sonderfiguren und neun Monster konnten im Schach
     deshalb NIE Schach bieten oder den Koenig schlagen, und der Koenig
     durfte gefahrlos in ihre Reichweite ziehen. Gemessen (Audit E2): Geist
     e3, schwarzer Koenig e5 -> inCheck false, obwohl ein Zug auf das
     Koenigsfeld existiert. 81 Schach-Stationen ab Liga 3 sind mit solchen
     Figuren besetzbar.

     WARUM EIN ZUSATZFELD statt eines neuen `special`-Namens: `special:
     "leap"` wird an drei weiteren Stellen gelesen - der Halbschaden aus der
     Ferne (transitions.js `afar`), die Reichweiten-Anzeige im
     Figuren-Schirm und drei Proben. Ein umbenanntes Etikett haette dort
     stumm die Wirkung geaendert, allen voran den Halbschaden. `weitsprung`
     markiert darum NUR, was die Bremse angeht.

     Und warum alle DREI Talente, obwohl der Audit nur die beiden
     Springer-Talente nennt: die Bremse bremst heute auch den Damen-Sprung,
     und ob die Dame im Schach mit Sprung matt setzen darf, ist eine
     Balance-Frage - kein Fehler. Sie bleibt, wie sie war. Frei wird allein
     das, was ein Zugbild IST: die normale Gangart einer Figur, kein
     Zusatz. */
  if (piece.kind === KIND.KNIGHT && hasAbility(piece, "knight_longleap"))
    for (const [df, dr] of LONG_LEAPS) step(moves, from, f + df, r + dr, piece, board, D, { special: "leap", weitsprung: true });

  if (piece.kind === KIND.KNIGHT && hasAbility(piece, "knight_outrider"))
    for (const [df, dr] of DIAG_LEAPS) step(moves, from, f + df, r + dr, piece, board, D, { special: "leap", weitsprung: true });

  if ((piece.kind === KIND.ROOK || piece.kind === KIND.CHANCELLOR) && hasAbility(piece, "rook_diag_step"))
    for (const [df, dr] of DIAG) step(moves, from, f + df, r + dr, piece, board, D, { special: "step" });

  if ((piece.kind === KIND.ROOK || piece.kind === KIND.CHANCELLOR) && hasAbility(piece, "rook_breach"))
    for (const [df, dr] of ORTHO) {
      const af = f + df, ar = r + dr, lf = f + 2 * df, lr = r + 2 * dr;
      if (onBoard(lf, lr, D) && board[ix(af, ar, D)]) { // adjacent orthogonal occupied → breach over it
        const li = ix(lf, lr, D);
        if (!betretbar(D, li)) { mauerschlag(moves, from, li, piece, { special: "breach", consumes: "rook_breach" }); continue; }
        const land = board[li];
        if (!land || land.color !== piece.color)
          push(moves, from, li, piece, !!land, land ? land.kind : null, { special: "breach", consumes: "rook_breach" });
      }
    }

  if (piece.kind === KIND.QUEEN && hasAbility(piece, "queen_knightleap"))
    for (const [df, dr] of KNIGHT_JUMPS) step(moves, from, f + df, r + dr, piece, board, D, { special: "leap", weitsprung: true, consumes: "queen_knightleap" });

  if (piece.kind === KIND.KING && hasAbility(piece, "king_dash"))
    for (const [df, dr] of ORTHO) {
      const mf = f + df, mr = r + dr, lf = f + 2 * df, lr = r + 2 * dr;
      if (onBoard(mf, mr, D) && onBoard(lf, lr, D) && !board[ix(mf, mr, D)]) {
        /* Ueber eine Mauer sprintet niemand: das Zwischenfeld muss frei sein
           UND unversperrt, sonst gibt es die Richtung gar nicht. */
        if (!betretbar(D, ix(mf, mr, D))) continue;
        const li = ix(lf, lr, D);
        if (!betretbar(D, li)) { mauerschlag(moves, from, li, piece, { special: "dash", consumes: "king_dash" }); continue; }
        const land = board[li];
        if (!land || land.color !== piece.color)
          push(moves, from, li, piece, !!land, land ? land.kind : null, { special: "dash", consumes: "king_dash" });
      }
    }

  if ((piece.kind === KIND.BISHOP || piece.kind === KIND.ARCHBISHOP) && hasAbility(piece, "bishop_hop"))
    for (const [df, dr] of DIAG) {
      const af = f + df, ar = r + dr, lf = f + 2 * df, lr = r + 2 * dr;
      if (onBoard(lf, lr, D) && board[ix(af, ar, D)]) { // adjacent diagonal occupied → hop over it
        const li = ix(lf, lr, D);
        if (!betretbar(D, li)) { mauerschlag(moves, from, li, piece, { special: "hop", consumes: "bishop_hop" }); continue; }
        const land = board[li];
        if (!land || land.color !== piece.color)
          push(moves, from, li, piece, !!land, land ? land.kind : null, { special: "hop", consumes: "bishop_hop" });
      }
    }

  if ((piece.kind === KIND.BISHOP || piece.kind === KIND.ARCHBISHOP) && hasAbility(piece, "bishop_ortho_step"))
    for (const [df, dr] of ORTHO) step(moves, from, f + df, r + dr, piece, board, D, { special: "step", consumes: "bishop_ortho_step" });

  if (piece.big && piece.kind === "D") { bigDragonMoves(moves, from, piece, board, { ...D, rules: state.rules }); return moves; }
  if (piece.kind === "D+") return moves; // wing markers never move themselves

  // ── data-driven movement (bosses / special units): a moveSpec on the piece
  // REPLACES its normal movement. Leaps are single jumps; slides are rays with
  // an optional max range; `spawn` lets the piece create a pawn on an empty
  // adjacent square instead of moving (while charges last).
  if (piece.moveSpec) {
    const sp = piece.moveSpec;
    for (const [df, dr] of sp.leaps || []) step(moves, from, f + df, r + dr, piece, board, D, { special: "leap" });
    const R = sp.range || 99;
    for (const [df, dr] of sp.slides || []) {
      for (let k = 1; k <= R; k++) {
        const nf = f + df * k, nr = r + dr * k;
        if (!onBoard(nf, nr, D)) break;
        const ni = ix(nf, nr, D);
        /* wie slide: die Mauer beendet den Strahl, der Schlag gegen sie
           bleibt der letzte angebotene Zug in dieser Richtung. */
        if (!betretbar(D, ni)) { mauerschlag(moves, from, ni, piece, {}); break; }
        const t = board[ni];
        if (!t) { push(moves, from, ni, piece, false, null, {}); continue; }
        if (t.color !== piece.color) push(moves, from, ni, piece, true, t.kind, {});
        break;
      }
    }
    if (sp.spawn && (piece.spawnLeft || 0) > 0) {
      for (const [df, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nf = f + df, nr = r + dr;
        if (!onBoard(nf, nr, D)) continue;
        /* Brut setzt eine NEUE Figur - das ist kein Angriff, also gibt es
           gegen die Mauer auch keinen Schlag, nur kein Feld. */
        if (!betretbar(D, ix(nf, nr, D))) continue;
        if (!board[ix(nf, nr, D)]) push(moves, from, ix(nf, nr, D), piece, false, null, { special: "spawn" });
      }
    }
    /* v1.89.1 (gemessen, test_zugbilder.mjs Abschnitt 5): hier stand seit
       v0.38 ein fruehes `return moves`, davor ein zweiter Blinzel-Block als
       Notnagel ("ein Zugbild-Traeger konnte nie blinken"). Der Notnagel
       heilte nur das Blinzeln - der SCHARFSCHUSS unten blieb fuer jede Figur
       mit moveSpec unerreichbar. Zehn Sonderfiguren (Kapitaen, Attentaeter,
       Magier, Hexerin, Vesna, Alchemist, Warlock, Inquisitor, Techniker,
       Stratege) tragen ihn auf der Leiter und bekamen nie einen Schuss:
       Kapitaen mit Gegner auf Distanz 2 -> 0 Schuesse, derselbe Kapitaen ohne
       moveSpec-Feld -> 1 Schuss. Kein return mehr, kein Duplikat mehr:
       Schuss und Blinzeln gelten unten fuer alle Figuren gleich. */
  }

  // ── ranged attack: hit the first enemy in line of sight (you stay put) ──
  /* v1.0.23 (Besitzer, ZWEITER RIEGEL): der Schuss ist eine HP-Kunst und darf
     im Schach nicht einmal ANGEBOTEN werden. Der erste Riegel sitzt im
     Heeresbau (Schach traegt leere Faehigkeitslisten) - aber sollte je eine
     Figur durch einen fremden Fehler doch mit ranged_shot in eine Schach-
     partie geraten, boete dieser Block ihr einen Schlag aus der Ferne an:
     Matt, ohne dass eine Deckung hilft. Genau die Sorge des Besitzers.
     Darum haengt der Schuss jetzt zusaetzlich am Regelwerk selbst - wie das
     En-passant oben, nur andersherum. */
  if (!(state && state.rules === "chess") && hasAbility(piece, "ranged_shot")) {   /* v1.37.0: Dauerfeuer ist seit v1.28.1 fort */
    const consume = "ranged_shot";
    /* v0.79 (Besitzer): Reichweite 2-3 Felder statt 2-4. Der Fernangriff soll
       sich von einer weit ziehenden Figur unterscheiden - kurz, wertig,
       ueber Koepfe hinweg, aber kein Ersatz fuer eine Laufbahn. */
    const MAXR = 3;
    for (const [df, dr] of KING_STEPS) {
      let af = f + df, ar = r + dr, dist = 1;
      while (dist <= MAXR && onBoard(af, ar, D)) {
        const t = board[ix(af, ar, D)];
        if (t) {
          /* ── DER KOENIG IST IMMUN GEGEN FERNKAMPF (v1.2.0, Besitzerentscheid)
             "Es ist superwichtig, dass wir grundsaetzlich sagen: der Koenig ist
             immun gegen Fernkampf. Das bedeutet, ein Fernkampf hilft einem
             nicht, den Koenig schachmatt zu setzen oder ihm zu schaden. Dann
             ist das ein bisschen entkraeftet, und man kann das klassische
             Schachspiel wirklich laenger im Spiel tragen."

             Der Gedanke dahinter ist gut: ein Schuss ueber das halbe Brett,
             der den Koenig bedroht, macht jede Deckung sinnlos - man kann sich
             gegen ihn nicht stellen, weil er durch keine Linie zu sperren ist
             (der Schuss haelt am ersten Stueck, aber das Schachgebot entsteht
             aus der Distanz). Damit waere Schach kein Schach mehr. Die Immunitaet
             kostet den Fernkampf nichts von seinem Wert gegen alle anderen
             Figuren, nimmt ihm aber die Macht, die Partie zu entscheiden.

             Der Schuss BRICHT trotzdem am Koenig: er deckt weiter, was hinter
             ihm steht - sonst waere er ein Loch in der eigenen Linie. */
          if (t.color !== piece.color && dist >= 2 && t.kind !== KIND.KING)
            push(moves, from, ix(af, ar, D), piece, true, t.kind, { special: "shot", noAdvance: true, ...(consume ? { consumes: consume } : {}) });
          break; // a shot stops at the first piece it meets
        }
        af += df; ar += dr; dist++;
      }
    }
  }

  // ── teleport: blink to a nearby empty square ──
  if (hasAbility(piece, "teleport")) {
    const R = 2;
    for (let dr = -R; dr <= R; dr++) for (let df = -R; df <= R; df++) {
      if (df === 0 && dr === 0) continue;
      const tf = f + df, tr = r + dr;
      if (onBoard(tf, tr, D) && betretbar(D, ix(tf, tr, D)) && !board[ix(tf, tr, D)])
        push(moves, from, ix(tf, tr, D), piece, false, null, { special: "blink", consumes: "teleport" });
    }
  }

  return moves;
}

/** All pseudo-legal moves for a color. */
export function pseudoMoves(state, color) {
  const out = [], b = state.board;
  const mateRules = state.rules !== "hp";
  for (let i = 0; i < b.length; i++) {
    const p = b[i];
    if (p && p.color === color) {
      const m = pieceMoves(state, i);
      for (let j = 0; j < m.length; j++) {
        // BALANCE (mate rules only): the long leap cannot strike a crowned
        // head. Extended-leap abilities kept smother-mating the boxed-in
        // starting king in 2-3 moves; movement and normal captures stay,
        // but a leap never targets the king and thus never gives check.
        // HP duels are untouched — there the king has hit points and shields.
        /* v1.90.4 (Audit A12): die Bremse gilt fuer die TALENT-Spruenge
           (`weitsprung`), nicht mehr fuer jedes `leap`. Die Zugbilder der
           Sonderfiguren und Monster tragen dasselbe Etikett - sie konnten
           im Schach dadurch nie Schach bieten, und der Koenig durfte
           gefahrlos in ihre Reichweite ziehen. */
        if (mateRules && m[j].weitsprung && b[m[j].to]?.kind === KIND.KING) continue;
        out.push(m[j]);
      }
    }
  }
  return out;
}

// ── THE BIG DRAGON (2x2): one piece, four squares ────────────────────────────
// The anchor is the block's lower-left index; the other three cells carry
// markers { kind: "D+", color, ref: anchor }. Legacy 1x1 dragons (no `big`
// flag) keep their old leap moveSpec untouched.
export const dragonBlock = (a, w) => [a, a + 1, a + w, a + w + 1];
export const dragonAnchorOf = (board, i) => {
  const pc = board[i];
  if (!pc) return -1;
  if (pc.kind === "D+") return pc.ref;
  return pc.big && pc.kind === "D" ? i : -1;
};
function dragonBlockFree(board, holes, w, h, a, self, forColor, allowEnemies, noKing, sperren) {
  const f = a % w, r = (a / w) | 0;
  if (f < 0 || f > w - 2 || r < 0 || r > h - 2) return false;
  for (const c of dragonBlock(a, w)) {
    if (holes && holes.has(c)) return false;
    /* v1.90.4 (Audit A10): eine Mauer ist fuer den Drachen ein Loch. Sein
       Block braucht VIER freie Felder - er setzt sich nicht auf die Sperre
       und traegt sie auch nicht mit sich fort. Einen Schlag gegen die Mauer
       gibt es hier nicht: der Drache zieht als Block, ein Teilschlag waere
       ein Zug, den der Kern nicht abbilden kann. */
    if (sperren && versperrt(sperren, c)) return false;
    const oc = board[c];
    if (!oc) continue;
    if (oc === self || (oc.kind === "D+" && oc.ref !== undefined && board[oc.ref] === self)) continue;
    if (!allowEnemies) return false;
    if (oc.color === self.color) return false;
    if (noKing && oc.kind === "K") return false; // may never smother the king
  }
  return true;
}
function bigDragonMoves(moves, from, piece, board, D) {
  const { w, h, holes, rules } = D;
  // ON FOOT: one square in the four orthogonal directions. He may crush a foe
  // caught under his leading edge (but never smother the king in classic play).
  /* v1.1.3 (Besitzerbefund, sehr deutlich): "Er darf immer in die
     Einfeldrichtung links, hoch, ... also so wie der Koenig ziehen, bloss dass
     er halt immer zwei Felder belegt. Es sollte sich SYMMETRISCH verhalten."

     Vorher gingen nur VIER Richtungen: links, rechts, oben, unten. Die
     Diagonalen fehlten - deshalb sah die Anzeige in der Akademie krumm aus
     und nicht symmetrisch. Jetzt alle ACHT, wie beim Koenig; der Unterschied
     zum Koenig ist allein, dass der Drache mit seinem 2x2-Block zieht und
     darum auch zwei Felder bedroht. */
  const RICHTUNGEN = [-1, 1, -w, w, -w - 1, -w + 1, w - 1, w + 1];
  const f0r = from % w;
  for (const d of RICHTUNGEN) {
    const a2 = from + d;
    /* am Rand nicht ueber die Kante rutschen: der Anker darf hoechstens bis
       Spalte w-2 laufen, weil der Block zwei Felder breit ist. */
    const f2 = a2 % w;
    if (Math.abs(f2 - f0r) > 1) continue;
    if (f2 > w - 2) continue;
    if (dragonBlockFree(board, holes, w, h, a2, piece, piece.color, true, rules !== "hp", D.sperren))
      moves.push({ from, to: a2, special: "dragonStep" });
  }
  // FLIGHT: once per game, range grows with the unlocked wing. Landing on foes
  // is a direct strike on every covered square — survivors throw him back.
  const abil = piece.abilities || [];
  if (abil.includes("dragon_flight") && !(piece.used || {}).dragon_flight) {
    const range = 1 + stufeVon(piece, "dragon_flight");   /* v1.37.0: I zwei, II drei, III vier Felder (war: drei Sprossen) */
    const f0 = from % w, r0 = (from / w) | 0;
    for (let df = -range; df <= range; df++) for (let dr = -range; dr <= range; dr++) {
      if (!df && !dr) continue;
      const a2 = from + df + dr * w;
      const f2 = f0 + df, r2 = r0 + dr;
      if (f2 < 0 || f2 > w - 2 || r2 < 0 || r2 > h - 2) continue;
      if (dragonBlockFree(board, holes, w, h, a2, piece, piece.color, true, rules !== "hp", D.sperren))
        moves.push({ from, to: a2, special: "dragonFly" });
    }
  }
}
