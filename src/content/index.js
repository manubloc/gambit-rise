// ── @gambit/content — game data (designer-facing) ───────────────────────────
// Pure data + light helpers. Adding a character or ability is a data edit here
// (plus, for a brand-new movement rule, one handler in core/rules/moves.js).
export { ABILITIES, TAGS, SPERRGRUND, faehigkeitZustand, faehigkeitSichtbar } from "./abilities.js";
export { CHARACTERS, CHARACTER_LIST, KIND_TO_CHAR, CHAR_VON_ART } from "./characters.js";
export { DIFFICULTIES, difficultyById } from "./difficulties.js";
export { CAMPAIGN, nodeById, BRANCHES, campaignTag, CHAPTERS, chapterForRow, chapterTitle } from "./campaign.js";
export { MAPS, mapById, validateMap, inMap, isHole, holeSet, mapIdx, playableCount } from "./maps.js";
export { BOSSES, bossById, LEAGUE_BOSSES, KAPITEL_TROPHAEE, kapitelVonGrossmeister, bossName, bossSpec,
  MITTE_MEISTER, NIE_BESTECHLICH, bestechGrund, istBestechlich, EHEMALIGE_MEISTER, auraText } from "./bosses.js";

export { ITEMS, ITEM_LIST, hasItem, buyItem, itemPrice } from "./items.js";
export { PLACE_EN, placeEn } from "./placeNamesEn.js";
export { VOICES, voiceFor } from "./voices.js";

export { TIME_MODES, timeModeById, timeModeKey, clockFor, BLITZ_ZEITEN, BLITZ_VORGABE, blitzTc, blitzText, blitzSekunden, blitzAufschlag, REGELN_FASSUNG } from "./timeModes.js";
