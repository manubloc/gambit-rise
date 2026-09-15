import { VALUE, SHIELD_VALUE, FILES, RANKS, fileOf, rankOf } from "../core/index.js";
import { schattenVerbirgt } from "../core/rules/buende.js";

/** Static evaluation from `color`'s perspective. In HP mode a piece's worth
 *  scales with its remaining HP (so wounding the enemy king pulls the AI in). */
export function evaluate(state, color) {
  const hp = state.rules === "hp";
  let score = 0;
  const b = state.board;
  const W = state.w ?? FILES, H = state.h ?? RANKS;
  for (let i = 0; i < b.length; i++) {
    const p = b[i];
    if (!p || p.kind === "D+") continue;   // dragon wing markers carry no worth of their own
    /* ── DER VERBORGENE ATTENTAETER ZAEHLT NICHT (v1.10.6) ────────────────
       Der Schatten macht ihn unsichtbar, solange Hexerin und Magier
       stillstehen. "Unsichtbar" muss dabei fuer den GEGNER gelten, nicht nur
       fuer die Anzeige - sonst waere es ein Trick, der allein den Menschen
       taeuscht und gegen die KI wirkungslos bliebe.

       Deshalb faellt er hier aus der Bewertung: die KI rechnet ihn weder als
       Bedrohung noch als Beute ein und sucht sich andere Ziele. Treffen kann
       sie ihn trotzdem, wenn ein Zug ohnehin auf sein Feld fuehrt - Tarnung
       ist keine Unverwundbarkeit. */
    if (schattenVerbirgt(state, p)) continue;
    let v = (VALUE[p.kind] || 0) + (p.hero ? 140 : 0);
    if (hp) v *= p.maxHp ? p.hp / p.maxHp : 1;
    else if (p.kind !== "K") v += p.shield * SHIELD_VALUE;
    const f = fileOf(i, W), r = rankOf(i, W);
    v += 10 - (Math.abs(f - (W - 1) / 2) + Math.abs(r - (H - 1) / 2)); // mild center pull
    score += p.color === color ? v : -v;
  }
  return score;
}

export const MATE = 100000;
/* ── DER VERBORGENE ATTENTAETER IST FUER DIE KI WERTLOS (v1.10.6) ─────────
   Der Schatten macht ihn unsichtbar, solange Hexerin und Magier stillstehen.
   "Unsichtbar" muss dabei fuer den GEGNER gelten, nicht fuer die Anzeige -
   sonst waere es ein Trick, der nur den Menschen taeuscht.

   Deshalb greift es hier, an der Bewertung: ein Schlag gegen ihn ist der KI
   nichts wert, sie sucht sich also andere Ziele. Sie kann ihn weiterhin
   zufaellig treffen, wenn ein Zug ohnehin auf sein Feld fuehrt - das ist
   richtig so. Tarnung heisst nicht Unverwundbarkeit.

   Der Spielstand wird durchgereicht, weil die Frage von den Buenden abhaengt
   und davon, ob im letzten Zug eine der beiden gezogen hat. */
export const captureValue = (m, state) => {
  if (!m.capture) return 0;
  if (state && m.to != null) {
    const ziel = state.board[m.to];
    if (ziel && schattenVerbirgt(state, ziel)) return 0;
  }
  return VALUE[m.captureKind] || 0;
};
/** Search captures first → far better alpha-beta pruning. */
export const order = (moves) => moves.slice().sort((a, b) => captureValue(b) - captureValue(a));
