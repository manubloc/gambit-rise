import { other } from "../domain/constants.js";
import { inCheck } from "../rules/attacks.js";
import { applyMove, status } from "./transitions.js";
import { COMMAND } from "./commands.js";
import { geleitTauschbar } from "../rules/buende.js";
import { zerfalleSperren } from "../rules/sperren.js";
import { Ev } from "./events.js";

/**
 * The single entry point for advancing a game.
 *   reduce(state, command) -> { state, events }
 * Pure: never mutates `state`. Appends the command to `state.log` on the new
 * state so the whole match can be replayed or sent online.
 */
/* ── v1.90.4 (Audit A34): EIN HALBZUG IST EIN HALBZUG ───────────────
   TRANK und GELEIT verbrauchen den Zug der Seite - sie setzten `turn` um,
   drehten aber keine der Uhren weiter, die an jedem Halbzug haengen:
   `moveCount`, `ohneSchaden` (die HP-Remis-Uhr, 120 Halbzuege) und der
   Zerfall der Sperren. Beide liefen dadurch einen Halbzug nach: ein Spieler
   konnte eine Mauer ueber ihre Lebenszeit hinaus stehen lassen, indem er
   Traenke trank, und die Remis-Uhr blieb stehen, obwohl kein Schaden fiel.
   Der Trank-Zweig ist LIVE, nicht bloss latent.

   Was hier bewusst NICHT passiert: der ganze `altern()`-Ausgang aus
   transitions.js. Der traegt neben den Uhren die Nachtwacht-Heilung und den
   FAEHRTEN-Nachzug, und der rechnet eine Richtung aus `lastMove.from/to`.
   Bei einem Trank gibt es keine Richtung, beim Geleit sind from und to zwei
   getauschte Felder - die Faehrte wuerde daraus Unsinn machen. Die Uhren
   gehoeren zu jedem Halbzug, die Bundwirkungen zu einem ZUG. */
function halbzugUhren(state, next) {
  next.moveCount = (state.moveCount || 0) + 1;
  next.ohneSchaden = (state.ohneSchaden || 0) + 1;   // Heilen ist kein Schaden
  if (next.sperren) {
    const s = zerfalleSperren(next.sperren, next.moveCount);
    if (s !== next.sperren) next.sperren = s;
  }
  return next;
}

export function reduce(state, command) {
  switch (command.type) {
    case COMMAND.MOVE: {
      /* ── v1.90.3 (Audit A2): DER REDUCER PRUEFT DEN ZUG, EHE ER IHN TUT ──
         Bis hierher war der einzige Riegel "wenn applyMove nichts aendert,
         war der Zug illegal". Gemessen hat das Audit, was damit durchkam:
         eine FREMDE Figur bei eigenem Zugrecht, Turm a1 x Koenig e8 mit
         status "ongoing", `to: 999` (das Brett wuchs auf 1000 Felder) und
         ein {type:"MOVE"} ganz ohne `move` warf beim Lesen von `from`. Im
         Netzspiel rechnet der ehrliche Client denselben Befehl nach - die
         Hash-Pruefung schlaegt also NICHT an, weil beide Seiten dasselbe
         Falsche rechnen. Die Pruefung gehoert deshalb hierher, in den Kern,
         und nicht in den Schirm.
         Was hier NICHT geprueft wird: ob der Zug nach allen Regeln legal
         ist. Das waere legalMoves(state) je Befehl - teuer im Verlauf einer
         Partie und in der Kampagne unnoetig. Die Einlasskontrolle klemmt
         das, was das Brett zerreisst: Unform, Felder ausserhalb, fremde
         Figuren, leere Felder und den Fluegelmarker. */
      const z = command.move;
      if (!z || typeof z !== "object") return { state, events: [] };
      const felder = Array.isArray(state.board) ? state.board.length : 0;
      const ganz = (n) => Number.isInteger(n) && n >= 0 && n < felder;
      if (!ganz(z.from) || !ganz(z.to)) return { state, events: [] };
      const zieht = state.board[z.from];
      if (!zieht || zieht.color !== state.turn) return { state, events: [] };
      if (zieht.kind === "D+") return { state, events: [] };   // der Fluegelmarker zieht nie selbst
      /* v1.90.4 (Audit A39): eine beendete Partie nimmt keinen Zug mehr an.
         POTION, GELEIT und SHIFT pruefen das seit jeher, MOVE nicht - und
         weil cloneState `over` nicht mitkopierte, loeschte der Zug das
         Ergebnis auch gleich. Gemessen: nach RESIGN wurde MOVE angenommen
         und `over` war danach fort. */
      if (state.over) return { state, events: [] };
      const next = applyMove(state, command.move, { record: true });
      if (next === state) return { state, events: [] }; // illegal/no-op guard
      next.log = (state.log || []).concat([command]);

      const events = [];
      const lm = next.lastMove;
      events.push(Ev.moved(lm.color, lm.kind, lm.from, lm.to, lm.special));
      if (lm.bounced) events.push(Ev.shieldAbsorbed(lm.hitColor, lm.hitKind, lm.to, lm.color));
      else if (lm.damaged) events.push(Ev.damaged(lm.color, lm.hitColor, lm.hitKind, lm.to, lm.dmg, lm.targetHpAfter));
      else if (lm.capture) events.push(Ev.captured(lm.color, lm.kind, lm.captured, lm.to, lm.byHero, lm.hitHero));
      if (lm.promotion) events.push(Ev.promoted(lm.color, lm.to, lm.promotion));

      const sideToMove = next.turn;
      if (state.rules !== "hp" && inCheck(next, sideToMove)) events.push(Ev.check(sideToMove));

      const st = status(next);
      if (st.over) events.push(Ev.gameOver(st.result, st.winner));
      return { state: next, events };
    }

    case COMMAND.POTION: {
      // Guards: HP rules only, right side to move, charges left, own hurt piece.
      if (state.rules !== "hp" || state.over) return { state, events: [] };
      if (command.color !== state.turn) return { state, events: [] };
      // a hostile "noEnemyPotions" aura on the board forbids your draughts
      const judged = state.board.some((p) => p && p.color !== command.color && p.aura && p.aura.type === "noEnemyPotions");
      if (judged) return { state, events: [] };
      const left = (state.potions && state.potions[command.color]) || 0;
      if (left <= 0) return { state, events: [] };
      const piece = state.board[command.target];
      if (!piece || piece.color !== command.color) return { state, events: [] };
      if ((piece.hp ?? 1) >= (piece.maxHp ?? piece.hp ?? 1)) return { state, events: [] };
      const board = state.board.slice();
      const healedHp = Math.min(piece.maxHp, (piece.hp ?? 1) + 2);
      board[command.target] = { ...piece, hp: healedHp };
      const next = halbzugUhren(state, { ...state, board,
        potions: { ...state.potions, [command.color]: left - 1 },
        turn: other(state.turn),
        lastMove: null,
        log: (state.log || []).concat([command]) });
      return { state: next, events: [Ev.healed(command.color, piece.kind, command.target, healedHp)] };
    }

    /* ── DER PLATZTAUSCH DES GELEITS (v1.11.2) ───────────────────────────
       Besitzerentscheid: "Ich faende es richtig, wenn du Geleit mit einem
       Knopf aktivierbar machst und dann waehle ich eine Figur aus und eine
       zweite und diese tauschen miteinander."

       Ein eigener Befehl, kein Zug: es bewegt sich keine Figur auf ein
       Zielfeld, zwei tauschen. Der Tausch verbraucht den Zug der Seite -
       sonst waere er geschenkt.

       Geprueft wird streng: beide Felder muessen zu den drei Figuren des
       Bundes gehoeren, beide muessen der ziehenden Seite gehoeren, und sie
       muessen verschieden sein. Wer den Befehl von aussen schickt, soll damit
       nichts erzwingen koennen, was die Anzeige nicht anbietet. */
    case COMMAND.GELEIT: {
      if (state.over) return { state, events: [] };
      if (command.color !== state.turn) return { state, events: [] };
      const erlaubt = geleitTauschbar(state, command.color);
      if (!erlaubt) return { state, events: [] };
      const { a, b } = command;
      if (a == null || b == null || a === b) return { state, events: [] };
      if (!erlaubt.includes(a) || !erlaubt.includes(b)) return { state, events: [] };
      const brett = state.board.slice();
      const eins = brett[a], zwei = brett[b];
      if (!eins || !zwei) return { state, events: [] };
      /* ── v1.90.4 (Audit A34): KEINE HAND AM AUSGANGSZUSTAND ──────────
         `board.slice()` ist eine FLACHE Kopie: die Figuren-Objekte sind
         dieselben. `eins.hasMoved = true` veraenderte damit den Zustand VOR
         dem Geleit und jeden Eintrag in `history` mit - obwohl der Kopf
         dieser Datei "Pure: never mutates state" verspricht. Gemessen (Audit
         C5): hasMoved am Original-Turm nach dem Geleit true. Folge: nach
         einem Zeitenwender zurueck blieb hasMoved stehen und die Rochade war
         verloren; ein Replay wich ab. */
      brett[a] = { ...zwei, hasMoved: true };
      brett[b] = { ...eins, hasMoved: true };
      const next = halbzugUhren(state, { ...state, board: brett,
        geleitVerbraucht: { ...(state.geleitVerbraucht || {}), [command.color]: true },
        turn: command.color === "w" ? "b" : "w",
        lastMove: { from: a, to: b, color: command.color, geleit: true },
        log: (state.log || []).concat([command]) });
      return { state: next, events: [{ type: "geleit", von: a, nach: b }] };
    }

    case COMMAND.SHIFT: {
      // Guards: HP rules only, right side to move, rifts left, none armed yet.
      if (state.rules !== "hp" || state.over) return { state, events: [] };
      if (command.color !== state.turn) return { state, events: [] };
      if (state.shiftArmed) return { state, events: [] };
      const rifts = (state.shifts && state.shifts[command.color]) || 0;
      if (rifts <= 0) return { state, events: [] };
      const next = { ...state,
        shifts: { ...state.shifts, [command.color]: rifts - 1 },
        shiftArmed: command.color,
        log: (state.log || []).concat([command]) };
      return { state: next, events: [] };
    }

    case COMMAND.RESIGN: {
      const winner = other(command.color);
      const next = { ...state, log: (state.log || []).concat([command]), over: { result: "resign", winner } };
      return { state: next, events: [Ev.gameOver("resign", winner)] };
    }

    default:
      return { state, events: [] };
  }
}
