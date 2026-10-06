import { WHITE, replay, createGame, other } from "../core/index.js";
import { CHAR_VON_ART as KIND_TO_CHAR } from "../content/index.js";   /* v1.91.0: alle Arten, nicht nur die zehn der Standardreihe */

// XP a player character earns from a match (event-sourced, see below).
const PARTICIPATION = 12, CAP_XP = 10, PROMO_XP = 15;
// The Gambit is bold: he earns EXTRA when he strikes, and extra again for
// surviving the whole battle on the board. These teach an aggressive, present
// commander — the heart of his risk/reward.
const HERO_CAP_XP = 8, HERO_SURVIVE_XP = 14;

/** Start a session, pre-seeding participation XP for the player's deployed characters. */
export function newSession(playerColor = WHITE, playerArmy = null) {
  const charXpGains = {};
  if (playerArmy) {
    const present = new Set(["pawn"]);
    for (const spec of playerArmy.back) { if (!spec) continue; const id = spec.bossId ? null : (spec.charId || KIND_TO_CHAR[spec.kind]); if (id) present.add(id); }
    if (playerArmy.hero) present.add("gambit"); // the commander always fights
    present.forEach((id) => { charXpGains[id] = PARTICIPATION; });
  }
  return { playerColor, captures: 0, promotions: 0, lostQueen: false, checkmate: false, moveCount: 0, eigeneZuege: 0, charXpGains, heroFell: false, heroCaptures: 0 };
}

/** Fold a batch of core events into the session. */
export function applyEvents(session, events) {
  for (const e of events) {
    switch (e.type) {
      case "moved":
        session.moveCount++;
        if (e.color === session.playerColor) session.eigeneZuege = (session.eigeneZuege || 0) + 1;   /* v1.91.0: fuer das Almosen (zubrot.js) */
        break;
      case "captured":
        if (e.by === session.playerColor) {
          session.captures++;
          const id = KIND_TO_CHAR[e.byKind];
          if (id) session.charXpGains[id] = (session.charXpGains[id] || 0) + CAP_XP;
          // the Gambit's own strikes pay a bold-commander bonus
          if (e.byHero) { session.charXpGains.gambit = (session.charXpGains.gambit || 0) + HERO_CAP_XP; session.heroCaptures++; }
        } else {
          if (e.kind === "Q") session.lostQueen = true; // our queen was taken
          if (e.heroVictim) session.heroFell = true;    // our commander was struck down
        }
        break;
      case "promoted":
        if (e.color === session.playerColor) {
          session.promotions++;
          session.charXpGains.pawn = (session.charXpGains.pawn || 0) + PROMO_XP;
        }
        break;
      case "gameOver":
        if (e.result === "checkmate") session.checkmate = true;
        break;
    }
  }
  return session;
}

/** The summary consumed by rewards.applyResult. */
export function summarize(session, result) {
  // the commander who stayed on the board to the end earns his survival bonus
  if (!session.heroFell) session.charXpGains.gambit = (session.charXpGains.gambit || 0) + HERO_SURVIVE_XP;
  return {
    result,
    captures: session.captures,
    promotions: session.promotions,
    checkmate: result === "win" && session.checkmate,
    lostQueen: session.lostQueen,
    moveCount: session.moveCount,
    eigeneZuege: session.eigeneZuege || 0,
    heroCaptures: session.heroCaptures,
    heroSurvived: !session.heroFell,
    charXpGains: session.charXpGains,
  };
}

/**
 * One-call match summary: replay the command log to get the full event stream,
 * then fold it. Pure and idempotent — safe to call once at game end regardless
 * of how the UI re-rendered during play.
 */
export function summarizeMatch(playerArmy, aiArmy, seed, log, result, playerColor = WHITE, opts = {}) {
  /* ── v1.90.10 (Audit A9): DAS REPLAY BRAUCHT DIESELBEN BUENDE ────────
     Diese Zusammenfassung spielt die Befehlsliste NOCH EINMAL nach, um an
     den Ereignisstrom zu kommen. Solange `state.buende` nirgends gesetzt war,
     fiel das nicht auf - jetzt schon: wirkt im Gefecht ein Paladin, der beim
     Nachspielen fehlt, laufen die beiden Zustaende auseinander, und die
     Belohnung faellt fuer eine Partie aus, die es so nie gab. Der Aufrufer
     gibt darum mit, mit welchen Buenden gespielt wurde. */
  const { events, state: ende } = replay(createGame(playerArmy, aiArmy,
    { seed, map: opts.map, rules: opts.rules, buende: opts.buende }), log);
  const session = applyEvents(newSession(playerColor, playerArmy), events);
  /* v1.30.0: WEGELAGEREI - was jede Seite geraubt hat, steht im Endzustand;
     die Zusammenfassung traegt den Saldo aus Sicht des Spielers. */
  const beute = (ende && ende.beute) || {};
  /* v1.91.0: wie viele eigene Bauern am Ende noch stehen (Bund Dorf, zubrot.js) */
  let bauernUebrig = 0;
  for (const f of (ende && ende.board) || []) if (f && f.kind === "P" && f.color === playerColor) bauernUebrig++;
  return { ...summarize(session, result), bauernUebrig, beute: (beute[playerColor] || 0) - (beute[other(playerColor)] || 0) };
}
