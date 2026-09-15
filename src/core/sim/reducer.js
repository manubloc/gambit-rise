import { other } from "../domain/constants.js";
import { inCheck } from "../rules/attacks.js";
import { applyMove, status } from "./transitions.js";
import { COMMAND } from "./commands.js";
import { geleitTauschbar } from "../rules/buende.js";
import { Ev } from "./events.js";

/**
 * The single entry point for advancing a game.
 *   reduce(state, command) -> { state, events }
 * Pure: never mutates `state`. Appends the command to `state.log` on the new
 * state so the whole match can be replayed or sent online.
 */
export function reduce(state, command) {
  switch (command.type) {
    case COMMAND.MOVE: {
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
      const next = { ...state, board,
        potions: { ...state.potions, [command.color]: left - 1 },
        turn: other(state.turn),
        lastMove: null,
        log: (state.log || []).concat([command]) };
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
      brett[a] = zwei; brett[b] = eins;
      eins.hasMoved = true; zwei.hasMoved = true;
      const next = { ...state, board: brett,
        geleitVerbraucht: { ...(state.geleitVerbraucht || {}), [command.color]: true },
        turn: command.color === "w" ? "b" : "w",
        lastMove: { from: a, to: b, color: command.color, geleit: true },
        log: (state.log || []).concat([command]) };
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
