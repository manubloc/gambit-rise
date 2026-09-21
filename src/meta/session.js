import { WHITE, replay, createGame, other } from "../core/index.js";
import { KIND_TO_CHAR } from "../content/index.js";

// XP a player character earns from a match (event-sourced, see below).
const PARTICIPATION = 12, CAP_XP = 10, PROMO_XP = 15;
// The Grand Gambit is bold: he earns EXTRA when he strikes, and extra again for
// surviving the whole battle on the board. These teach an aggressive, present
// commander — the heart of his risk/reward.
const HERO_CAP_XP = 8, HERO_SURVIVE_XP = 14;

/** Start a session, pre-seeding participation XP for the player's deployed characters. */
export function newSession(playerColor = WHITE, playerArmy = null) {
  const charXpGains = {};
  if (playerArmy) {
    const present = new Set(["pawn"]);
    for (const spec of playerArmy.back) { const id = KIND_TO_CHAR[spec.kind]; if (id) present.add(id); }
    if (playerArmy.hero) present.add("gambit"); // the commander always fights
    present.forEach((id) => { charXpGains[id] = PARTICIPATION; });
  }
  return { playerColor, captures: 0, promotions: 0, lostQueen: false, checkmate: false, moveCount: 0, charXpGains, heroFell: false, heroCaptures: 0 };
}

/** Fold a batch of core events into the session. */
export function applyEvents(session, events) {
  for (const e of events) {
    switch (e.type) {
      case "moved":
        session.moveCount++;
        break;
      case "captured":
        if (e.by === session.playerColor) {
          session.captures++;
          const id = KIND_TO_CHAR[e.byKind];
          if (id) session.charXpGains[id] = (session.charXpGains[id] || 0) + CAP_XP;
          // the Grand Gambit's own strikes pay a bold-commander bonus
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
  const { events, state: ende } = replay(createGame(playerArmy, aiArmy, { seed, map: opts.map, rules: opts.rules }), log);
  const session = applyEvents(newSession(playerColor, playerArmy), events);
  /* v1.30.0: WEGELAGEREI - was jede Seite geraubt hat, steht im Endzustand;
     die Zusammenfassung traegt den Saldo aus Sicht des Spielers. */
  const beute = (ende && ende.beute) || {};
  return { ...summarize(session, result), beute: (beute[playerColor] || 0) - (beute[other(playerColor)] || 0) };
}
