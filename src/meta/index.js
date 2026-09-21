// ── @gambit/meta — progression & profile (the "RPG" layer) ───────────────────
// Depends on @gambit/core (types, replay) and @gambit/content (data).
export {
  charXpForLevel, playerXpForLevel, charLevelForXp, playerLevelForXp,
  charXpProgress, playerXpProgress,
  resolveCharacter, characterLevel, nextReward, chosenAbilities, dupeCount, skillPoints, SP_PER_PLAYER_LEVEL, spForXpJump, heroColFor,
  abilityCost, hpWach, gambitWach, GAMBIT_ERWACHT_AB, gambitStufe, GAMBIT_ERWACHT_AUF_STUFE,
  canUnlockAbility, unlockAbility, respecPiece, RESPEC_GOLD,
  MAX_PIECE_LEVEL, GAMBIT_MAX_LEVEL, maxLevelFor, gambitTier, upgradeCost, canUpgrade, upgradePiece,
  isUnlocked, unlockedCharacterIds,
  buildArmyFrom, buildArmy, buildAiArmy, buildAiArmyScaled, buildArmyForMap, buildAiArmyForMap, hasForesight,
  formationKey, defaultFormation, formationLegal, formationLegalOn, formationSpec, crownSlots, formationCounts, buildArmyFromFormation, ownedLeagueBosses, isBossEntry, bossEntryId,
  FORMATION_REQUIRED, FORMATION_FLEX, FORMATION_FLEX_COUNT,
  stufenVon, faehigkeitsStufe, stufeBenoetigt, canUpgradeAbility, upgradeAbility,
} from "./leveling.js";
export { ACHIEVEMENTS, evaluate, completedSet, claimedTiers, claimReward, claimableCount, claimAchievement } from "./achievements.js";
export { placeFor } from "./campaign.js";
export { applyResult, winGold } from "./rewards.js";
export { emptyStats, defaultProfile, loadProfile, saveProfile, serializeSave, parseSave } from "./profile.js";
export { newSession, applyEvents, summarize, summarizeMatch } from "./session.js";
export {
  campaignLength, clearedCount, clearedIds, nodeStatus, currentNodeId, predsOf, nodeBossSpec, itemRevealed,
  buildStageMatch, advanceCampaign, advanceLeague, mapUnlocked, hpUnlocked, stageTimer, effectiveMap,
  leagueRewardMult, leagueBump, stageGold, effectiveNodeBoss, tollCost, payToll, bossPieceFor, leagueFinalBossPiece, winsNeeded, bossWinsFor, recruitOnWin, seaAccessible, nodeInLeague, gateOf, leagueNo,
} from "./campaign.js";
export { retinueScore, scoreBand } from "./rating.js";
export { applySnapshot, readSnapshot, listRestorePoints, takeRestorePoint, BK_RECENT, BK_DAILY_DAYS, BK_MIN_GAP_MS } from "./backups.js";
export {
  ensureAccounts, register, login, loginGuest, upsertCloudAccount, changePassword, deleteAccount,
  adminHasDefaultPass, currentAccount, setSession, clearSession, findAccount,
  normEmail, validEmail, hashPass, mkAccount, ADMIN_EMAIL, ADMIN_SALT, ADMIN_HASH,
  renameAccount, nameFehler, NAME_MIN, NAME_MAX,
} from "./accounts.js";
export {
  listSaves, createSave, loadSave, writeSave, deleteSave, renameSave,
  progressPct, withProgressPct, leagueOrder, summarize as summarizeSave, migrateLegacyInto, fmtPlaytime,
} from "./saves.js";
export { cloudConfigured, signInWithGoogle, signInWithProvider, signInEmailCloud, signUpEmailCloud, resumeCloudSession, signOutCloud } from "./cloudAuth.js";
export { fileReport, listReports, recentErrors, clearLocalReports, getAdminToken, setAdminToken } from "./reports.js";
export { emptyRecords, recordStage, totalBestMoves, fmtMs } from "./records.js";
export { BOARDS, LB_MAX, mergeBoard, fetchBoard, submitScore } from "./leaderboard.js";

export { SP_SHARD_GOLD, SP_SHARDS_PER_LEAGUE, SP_VAULT_MIN_CLEARED, spShardCap, buySpShard } from "./leveling.js";
export { BOSS_MAX_LEVEL, bossLevelOf, bossUpgradeCost, bossSpecLeveled, ZIEL_PROFIL_BOSS, BOSS_BUDGET, upgradeBoss } from "./leveling.js";

/* v1.0.43: die Freischalt-Ordnung - was wann aufgeht und welcher Satz es
   erklaert. Siehe freigaben.js. */
export { FREIGABEN, freigegeben, darfHeldSetzen, darfReiheStellen,
  erklaertWas, naechsteErklaerung, merkeErklaert, merkschluessel, ersteFigurDa } from "./freigaben.js";
export { DECK_ANZAHL, deckStand, deckName, mitAktivemDeck, mitDeckName, mitAufstellung } from "./decks.js";   /* v1.15.0 */
