import { spForXpJump, playerLevelForXp } from "./leveling.js";
import { completedSet } from "./achievements.js";

const XP = { win: 18, draw: 7, loss: 3, perCapture: 1, checkmate: 8, promotion: 5 };
const GOLD = { win: 2, draw: 1, loss: 0 };
/** Free-play purse per win, scaled by the difficulty you dared. */
export const winGold = (difficulty) => ({ easy: 4, normal: 7, hard: 11 }[difficulty] || 4);

/**
 * Apply a finished match to the profile. Pure: returns a new profile plus a
 * `gained` summary for the result banner.
 * @param {object} summary { result, captures, promotions, checkmate, lostQueen, moveCount, charXpGains }
 */
export function applyResult(profile, summary) {
  const p = structuredClone(profile);
  const levelBefore = playerLevelForXp(p.xpEarned || p.xp);

  // Resigning forfeits the purse entirely: no XP, no gold, no piece XP —
  // the loss still counts, but points must be fought for, not conceded.
  const gain = summary.resigned ? 0
    : (summary.result === "win" ? XP.win : summary.result === "draw" ? XP.draw : XP.loss)
    + (summary.captures || 0) * XP.perCapture
    + (summary.checkmate ? XP.checkmate : 0)
    + (summary.promotions || 0) * XP.promotion;
  const beforeXp = p.xpEarned || 0;
  p.xpEarned = (p.xpEarned || 0) + gain;

  p.charXp = p.charXp || {};
  if (!summary.resigned) for (const [id, xp] of Object.entries(summary.charXpGains || {})) p.charXp[id] = (p.charXp[id] || 0) + xp;

  const st = p.stats;
  st.games++;
  if (summary.result === "win") st.wins++; else if (summary.result === "loss") st.losses++; else st.draws++;
  st.captures += summary.captures || 0;
  st.promotions += summary.promotions || 0;
  if (summary.checkmate) st.checkmates++;
  if (summary.result === "win") { st.winStreak = (st.winStreak || 0) + 1; st.bestStreak = Math.max(st.bestStreak || 0, st.winStreak); }
  else st.winStreak = 0;
  if (summary.result === "win" && !summary.lostQueen) st.flawlessQueenWins = (st.flawlessQueenWins || 0) + 1;
  if (summary.result === "win" && (summary.moveCount || 999) <= 40) st.fastWins = (st.fastWins || 0) + 1;
  if (summary.result === "win" && summary.hpRules) st.hpWins = (st.hpWins || 0) + 1;
  st.xpEarned = p.xpEarned;
  const spGain = spForXpJump(beforeXp, p.xpEarned);
  p.sp = (p.sp || 0) + spGain;
  p.xp = p.xpEarned; // legacy mirror: XP is no longer spendable
  const goldGain = summary.resigned ? 0 : (GOLD[summary.result] || 0) + (summary.result === "win" ? (summary.gold || 0) : 0);
  /* v1.30.0: WEGELAGEREI - Geraubtes wechselt den Besitzer. Wer aufgibt,
     verliert die EIGENE Beute, das ihm Geraubte bleibt aber fort. Nie unter 0. */
  const raub = Number(summary.beute) || 0;
  const vorGold = (p.gold || 0) + goldGain;
  p.gold = Math.max(0, vorGold + (summary.resigned ? Math.min(0, raub) : raub));
  const beuteEcht = p.gold - vorGold;
  const sperrenGesetzt = summary.sperrenGesetzt || null;
  if (summary.potionsUsed || summary.hourglassUsed || sperrenGesetzt) {
    const items = { ...(p.items || {}) };
    if (summary.potionsUsed) items.potion = Math.max(0, (items.potion || 0) - summary.potionsUsed);
    if (summary.hourglassUsed) items.hourglass = Math.max(0, (items.hourglass || 0) - summary.hourglassUsed);
    /* v1.0.63: eine gesetzte Sperre ist fort - ob sie hielt oder fiel. Der
       Vorrat schrumpft um das, was WIRKLICH auf dem Brett stand (der
       Kampfschirm zaehlt beim Abschluss der Setzphase, nicht beim Kauf). */
    if (sperrenGesetzt) for (const [art, n] of Object.entries(sperrenGesetzt))
      if (n > 0) items[art] = Math.max(0, (items[art] || 0) - n);
    p.items = items;
  }

  const before = completedSet(profile.stats), after = completedSet(st);
  const newAchievements = [...after].filter((k) => !before.has(k));

  return { profile: p, gained: { gold: goldGain, beute: beuteEcht, sp: spGain, xp: p.xp - profile.xp, levelBefore, levelAfter: playerLevelForXp(p.xpEarned), newAchievements } };
}
