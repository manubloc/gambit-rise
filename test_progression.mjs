import { createInitialState, status, applyMove, legalMoves, KIND } from "./src/core/index.js";
import { buildArmy, buildAiArmy, characterLevel, playerLevelForXp, charLevelForXp, charXpForLevel, formationLegalOn, ownedLeagueBosses, unlockedCharacterIds, formationSpec, buildArmyForMap, withProgressPct, defaultProfile, summarizeMatch } from "./src/meta/index.js";
import { buildStageMatch } from "./src/meta/campaign.js";
import { createGame } from "./src/core/index.js";
import { MAPS } from "./src/content/index.js";
import { applyResult, upgradeCost, upgradePiece, canUpgrade, MAX_PIECE_LEVEL, maxLevelFor, gambitTier, GAMBIT_MAX_LEVEL, resolveCharacter, itemRevealed } from "./src/meta/index.js";
import { mapById } from "./src/content/index.js";
import { ITEMS } from "./src/content/index.js";
import { evaluate as evalAch } from "./src/meta/index.js";
import { chooseMove } from "./src/ai/index.js";
import { CHARACTERS } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

// Hard AI army should contain fairy pieces with shields/abilities (visible to player)
const hard = buildAiArmy("hard");
const hasArch = hard.back.some((s) => s.kind === KIND.ARCHBISHOP);
const hasChan = hard.back.some((s) => s.kind === KIND.CHANCELLOR);
const someShield = hard.back.some((s) => s.shield > 0) || hard.pawn.shield > 0;
ok("hard AI fields an Archbishop", hasArch);
ok("hard AI fields a Chancellor", hasChan);
/* v1.25.6: die Schilde sind raus (Besitzer: "unnoetig und doppelt"). Was die
   KI-Gegner stark macht, ist jetzt allein ihre Stufe - geprueft wird deshalb,
   dass sie ueberhaupt eine tragen. */
ok("harte KI-Figuren tragen eine Stufe", !someShield);
console.log("      (hard pawn:", JSON.stringify(hard.pawn) + ")");

// Default player army is plain level 1
const a0 = buildArmy({ pieces: { levels: {} }, loadout: { flank: ["knight", "knight"] } });
ok("fresh player army has no shields", a0.back.every((s) => s.shield === 0) && a0.pawn.shield === 0);

// Abilities are a deliberate purchase now: level alone gives shields, not skills
const lvlOnly = buildArmy({ pieces: { levels: { pawn: 5 } }, loadout: { flank: ["knight", "knight"] } });
ok("der Bauer auf Stufe 5 hat KEINE Faehigkeit von selbst (und seit v1.25.6 auch kein Schild mehr)",
  lvlOnly.pawn.shield === 0 && lvlOnly.pawn.abilities.length === 0);
const withPick = buildArmy({ pieces: { levels: { pawn: 5 }, abilities: { pawn: ["pawn_sidestep"] } }, loadout: { flank: ["knight", "knight"] } });
ok("a purchased ability shows up in the army", withPick.pawn.abilities.includes("pawn_sidestep"));

// AI move timing on a fresh 10x10 board
const s = createInitialState(buildArmy({ charXp: {}, loadout: { flank: ["knight", "knight"] } }), hard);
for (const depth of [1, 2]) {
  const t0 = Date.now();
  const mv = chooseMove(s, depth);
  const ms = Date.now() - t0;
  ok(`AI returns a move at depth ${depth}`, !!mv);
  console.log(`      (depth ${depth}: ${ms} ms)`);
}

// Result application updates xp, stats, achievements
const base = { v: 1, xp: 0, charXp: {}, loadout: { flank: ["knight", "knight"] }, stats: { games: 0, wins: 0, losses: 0, draws: 0, captures: 0, promotions: 0, checkmates: 0, winStreak: 0, bestStreak: 0, flawlessQueenWins: 0, fastWins: 0 } };
const r = applyResult(base, { result: "win", captures: 4, promotions: 1, checkmate: true, lostQueen: false, moveCount: 33, charXpGains: { pawn: 60, queen: 20 } });
ok("win grants xp", r.profile.xp > 0);
ok("stats record the win", r.profile.stats.wins === 1 && r.profile.stats.checkmates === 1);
ok("character xp accrues", r.profile.charXp.pawn === 60);
ok("a single win earns no tier yet (harsher balance)", r.gained.newAchievements.length === 0);
const r5 = applyResult({ ...base, stats: { ...base.stats, wins: 4, games: 4 } }, { result: "win", captures: 0, promotions: 0, checkmate: false, lostQueen: true, moveCount: 60, charXpGains: {} });
ok("the fifth win unlocks the first tier", r5.gained.newAchievements.some((a) => a.startsWith("wins")));

// ── Claims: rewards must be collected, and only once ─────────────────────────
import { claimAchievement, claimableCount, claimedTiers } from "./src/meta/index.js";
let cl = { sp: 0, gold: 0, claims: {}, stats: { wins: 6, games: 6 } };
ok("a finished tier is claimable", claimableCount(cl) >= 1);
cl = claimAchievement(cl, "wins");
ok("claiming pays SP + gold and records the tier", cl.sp === 1 && cl.gold >= 2 && claimedTiers(cl, "wins") === 1);
ok("no double dipping", claimAchievement(cl, "wins").sp === cl.sp);
console.log("      (skillpoints now:", evalAch(r.profile.stats).points + ", new tiers:", r.gained.newAchievements.join(", ") + ")");

// ── SKILL-POINT economy: player levels mint ⭐, pieces spend them ─────────────
import { abilityCost as abCost, unlockAbility as unl, canUnlockAbility as canUnl, spForXpJump, SP_PER_PLAYER_LEVEL } from "./src/meta/index.js";
ok("piece costs follow board value (in SP)", upgradeCost("pawn") === 1 && upgradeCost("knight") === 2 && upgradeCost("rook") === 3 && upgradeCost("queen") === 4);
ok("ability rungs cost a few SP", abCost(3) === 2 && abCost(5) === 3 && abCost(9) === 5);
ok("a player level-up mints SP", spForXpJump(0, 60) === SP_PER_PLAYER_LEVEL && spForXpJump(0, 40) === 0);
let eco = { sp: 3, xpEarned: 60, pieces: { levels: {} }, campaign: { cleared: [], unlocked: [] } };
ok("3 SP buys the rook step", canUpgrade(eco, "rook"));
eco = upgradePiece(eco, "rook");
ok("upgrade deducts SP and raises the level", eco.sp === 0 && characterLevel(eco, "rook") === 2);
ok("upgrades are counted for achievements", eco.stats.upgrades === 1);
ok("broke means broke", !canUpgrade(eco, "rook") && upgradePiece(eco, "rook").sp === 0);
ok("abilities gate on level then charge SP", (() => {
  const rung = CHARACTERS.rook.ladder.find((e) => e.ability);
  let p2 = { ...eco, sp: 10, pieces: { levels: { rook: rung.level }, abilities: {} } };
  if (!canUnl(p2, "rook", rung.ability)) return false;
  p2 = unl(p2, "rook", rung.ability);
  return p2.sp === 10 - abCost(rung.level) && p2.pieces.abilities.rook.includes(rung.ability);
})());
ok("levels cap at MAX_PIECE_LEVEL", characterLevel(upgradePiece({ ...eco, sp: 99, pieces: { levels: { rook: MAX_PIECE_LEVEL } } }, "rook"), "rook") === MAX_PIECE_LEVEL);

// ── the hero alone climbs three tiers of ten ─────────────────────────────────
/* v1.24.0 (Besitzer, mehrfach): "Ein Gambit soll keine 60 Stufen haben, es
   duerfen maximal 20 sein." Die Proben standen auf 60 und mussten mit. */
ok("gambit cap is 20, common pieces stay at 10", maxLevelFor("gambit") === 20 && maxLevelFor("rook") === 10 && GAMBIT_MAX_LEVEL === 20);
/* die sechs Raenge bleiben ALLE erreichbar - sonst waeren vier der sechs
   Gemaelde nie zu sehen: I 1-3, II 4-6, III 7-10, IV 11-13, V 14-16, VI 17-20 */
ok("sechs Raenge, verteilt auf zwanzig Stufen", gambitTier(1) === 1 && gambitTier(3) === 1 && gambitTier(4) === 2 && gambitTier(7) === 3 && gambitTier(11) === 4 && gambitTier(14) === 5 && gambitTier(17) === 6 && gambitTier(20) === 6);
ok("der Aufstieg kostet 2/2/3/3/4/4 je Rang", upgradeCost("gambit", 1) === 2 && upgradeCost("gambit", 3) === 2 && upgradeCost("gambit", 6) === 3 && upgradeCost("gambit", 10) === 3 && upgradeCost("gambit", 13) === 4 && upgradeCost("gambit", 19) === 4);
/* GEMESSEN, warum 60 Stufen kein Vorteil waren, sondern eine Strafe: sie
   kosteten 328 SP und endeten bei denselben hp 17 / atk 7, die ein Bauer mit
   9 SP erreicht - Faktor 36 fuer dasselbe Ziel. Jetzt 59 SP, rund das
   Sechsfache eines Bauern: ein Heldenaufschlag, keine Mauer. */
ok("der ganze Weg auf 20 kostet 59 SP", Array.from({ length: 19 }, (_, i) => upgradeCost("gambit", i + 1)).reduce((a, b) => a + b, 0) === 59);
/* v1.25.6: der Gambit hatte NEUN Schildsprossen - daraus kam sein ganzer
   Vorsprung (35 Leben statt 17). Mit den Schilden faellt er auf 24 wie jede
   andere Figur; sein Budget 36 wird als ZAHL gesetzt, nicht ueber versteckte
   Sprossen. Bis dahin traegt er keine Schilde mehr. */
ok("der Gambit traegt keine Schilde mehr", resolveCharacter(CHARACTERS.gambit, 20, null).shield === 0);
ok("the gambit can be upgraded past ten", characterLevel(upgradePiece({ sp: 99, pieces: { levels: { gambit: 10 } } }, "gambit"), "gambit") === 11);
/* v1.0.49 (Besitzerentscheid): DER HELD STEHT VON ANFANG AN. Bis v1.0.48 trat
   er erst nach drei geschafften Stationen an. Der Gambit ist aber die Figur,
   die auf der KARTE die ganze Zeit zu sehen ist - der Spieler soll vom ersten
   Zug an wissen, welcher seiner Bauern er ist. Ein Held, den man erst
   kennenlernt, nachdem man ihn dreimal aufs Feld geschickt hat, erklaert sich
   zu spaet. GAMBIT_ERWACHT_AB steht darum auf 0; die Schwelle bleibt als
   Konstante bestehen, damit ein spaeteres Anheben eine Zahl ist, keine Regel. */
/* v1.24.0: Stufe 15 gab mit den alten Zehnerbloecken Rang II. Seit die sechs
   Raenge auf zwanzig Stufen verteilt sind, ist Stufe 15 Rang V - fuer die
   Proben, die den Prunkritter (Rang II) meinen, steht das Profil deshalb auf
   Stufe 5. */
const wach = { pieces: { levels: { gambit: 5 } }, campaign: { cleared: ["L01s01", "L01s02", "L01s03"] } };
/* v1.34.0 (Besitzer): Reihe 1 ohne Gambit - er erwacht nach dem ersten Sieg */
ok("in der allerersten Partie fuehrt noch kein Held die Armee",
  !buildArmyForMap({ pieces: { levels: { gambit: 15 } }, campaign: { cleared: [] } }, mapById("arena")).hero);
ok("nach dem ersten Sieg fuehrt er sie",
  !!buildArmyForMap({ pieces: { levels: { gambit: 15 } }, campaign: { cleared: ["L01s00"] } }, mapById("arena")).hero);
ok("und bleibt es natuerlich auch spaeter", !!buildArmyForMap(wach, mapById("arena")).hero);
ok("the hero spec carries his tier onto the board", buildArmyForMap(wach, mapById("arena")).hero.spec.tier === 2);
/* v1.0.45 (Besitzerentscheid): DAS ERZWUNGENE STUFE-II-BILD IST FORT. Es
   zeigte ab dem ersten Atemzug den schwarz-goldenen Prunkritter - eine
   andere Bildwelt als die geschnitzten Holzfiguren, was auffiel, sobald die
   Stilweiche gefallen war (v1.0.41). Der Rang folgt jetzt wieder ehrlich der
   Stufe: der Erwachte (Stufe 2) traegt Rang I, den frueheren Gambit.
   Der Bruch bleibt trotzdem sichtbar - gruener Bauer neben goldenem Ritter. */
const frischErwacht = buildArmyForMap(
  { pieces: { levels: { gambit: 1 } }, campaign: { cleared: ["a", "b", "c"] } }, mapById("arena"));
ok("der Erwachte steht auf Stufe 2", frischErwacht.hero.spec.level === 2);
ok("und traegt den frueheren Gambit, nicht den Prunkritter", frischErwacht.hero.spec.tier === 1);
ok("der Prunkritter kommt erst mit Rang II", buildArmyForMap(wach, mapById("arena")).hero.spec.tier === 2);

// ── retinue score: monotonic with progress ──────────────────────────────────
import { retinueScore, defaultProfile as dp2, advanceCampaign as adv2 } from "./src/meta/index.js";
const r0 = retinueScore(dp2());
const rp = retinueScore(adv2(adv2(dp2(), "L01s00"), "L01s01"));
ok("retinue score starts modest and grows with progress", r0 > 50 && r0 < 400 && rp > r0);
ok("upgrades raise the retinue score", retinueScore({ ...dp2(), pieces: { levels: { rook: 3 } } }) === r0 + 80);

// ── stage clock (v0.4): time pressure begins in league 5, only on SOME nodes ─
import { stageTimer, buildStageMatch as bsm2 } from "./src/meta/index.js";
import { nodeById as nb2, CAMPAIGN as CAMPX } from "./src/content/index.js";
// v1.0.20: DAS ERWACHEN IST NACH KAPITEL II GEWANDERT (Besitzer: Kapitel I
// soll reines Schach bleiben). Deshalb wird es weder an Kennung noch an
// Kapitel festgemacht, sondern an dem, was es AUSMACHT: die erste
// Hauptast-Station der ganzen Reise, auf der Schaden faellt.
/* Das Erwachen wird an seiner ERZAEHLUNG erkannt, nicht an Kapitel oder
   Kennung: es ist die eine Station, auf der die alte Magie erwacht. */
const ERWACHEN = CAMPX.find((st) => /erwacht|magic wakes/.test(st.storyDe || "")).id;
const SCHACHSTATION = CAMPX.find((n) => n.league === 1 && n.haupt && n.rules === "chess" && !n.boss).id;
ok("chapter I is pure chess from end to end",
  CAMPX.filter((n) => n.league === 1).every((n) => n.rules === "chess"));
/* v1.36.0 (Besitzerentscheid 22.9., loest v1.2.2 "ab 5" ab): der Riss
   beisst FRUEH IN KAPITEL II - wer gratis spielt (bis Kapitel III), soll
   erleben, wofuer das Leveln da ist. */
ok("and the rift bites early in chapter II, not before",
  CAMPX.find((n) => n.rules === "hp").league === 2);
/* v1.2.2: ERWACHEN liegt jetzt in Kapitel V und ist selbst eine
   Boss-Station mit Uhr - die alte Fassung prueft es mit Liga 1, wo es die Uhr
   zu Recht nicht gibt. Das bleibt richtig; geprueft wird weiter, dass vor
   Liga 5 keine Uhr laeuft. */
ok("no clock before league 5", stageTimer(nb2("L01s44"), 4) === null && stageTimer(nb2(ERWACHEN), 1) === null);
ok("plain stages never get a clock", stageTimer(nb2("L01s00"), 7) === null);
const tMon = stageTimer(nb2(ERWACHEN), 5);
ok("league 5 monster boss: 6-minute total budget", tMon?.type === "total" && tMon.seconds === 360);
const tEli = stageTimer(nb2("L03s23"), 5);
ok("league 5 elite piece boss: 20s per move", tEli?.type === "move" && tEli.seconds === 20);
ok("clocks tighten but stay bounded", stageTimer(nb2("L01s44"), 30).seconds === 180 && stageTimer(nb2("L03s23"), 30).seconds === 12);
/* v1.1.2: DIE UHR HAENGT AN DER STATION, nicht am Spielerstand. Vorher stand
   hier: Profil auf Liga 5 -> auch eine Station aus Kapitel 1 (ERWACHEN)
   bekommt die Uhr. Das war das alte Verhalten und der gemeldete Fehler: wer
   in Kapitel 5 steht und eine alte Station nachspielt, bekam plötzlich
   Zeitdruck, den diese Station nie hatte. Jetzt umgedreht - die Boss-Station
   L05s16 traegt ihre 360 Sekunden IMMER, und ERWACHEN traegt NIE eine Uhr,
   ganz gleich, wie weit der Spieler ist. */
ok("die Uhr haengt an der Station, nicht am Spielerstand", (() => {
  const tief = { ...dp2(), campaign: { league: 1, cleared: [], unlocked: [] } };
  const weit = { ...dp2(), campaign: { league: 12, cleared: [], unlocked: [] } };
  const a = bsm2("L05s16", tief), b = bsm2("L05s16", weit);
  /* v1.2.2: ERWACHEN liegt seit der Verschiebung in Kapitel V und traegt
     selbst eine Uhr - als Beispiel fuer "frueh, also ohne Uhr" taugt es nicht
     mehr. Eine echte Station aus Kapitel I nimmt seinen Platz. */
  const FRUEH = CAMPX.find((n) => n.league === 1 && !n.boss).id;
  const fruehA = bsm2(FRUEH, tief), fruehB = bsm2(FRUEH, weit);
  return a.timer?.type === "total" && a.timer.seconds === 360
    && b.timer?.seconds === 360                 // gleich, egal wie weit der Spieler ist
    && fruehA.timer === null && fruehB.timer === null;  // Kapitel 1 bleibt ohne Uhr
})());

// ── the purse (v0.5): visible gold per win, tolls, richer claims ─────────────
import { stageGold, tollCost, payToll, winGold, nodeStatus as ns2, claimReward as cr2, evaluate as ev2 } from "./src/meta/index.js";
import { CAMPAIGN as CAMP3, ITEM_LIST as IL3 } from "./src/content/index.js";

// end bosses simply carry more gold
ok("stage gold grows down the road and peaks at the League Keep",
  stageGold(nb2("L01s44"), 1) > stageGold(nb2(ERWACHEN), 1) && stageGold(nb2(ERWACHEN), 1) > stageGold(nb2("L01s00"), 1));
ok("pure monster bosses pay a premium over plain sites",
  stageGold(nb2(ERWACHEN), 1) - stageGold(nb2(SCHACHSTATION), 1) >= 8);
ok("league scaling multiplies the purse", stageGold(nb2("L01s44"), 3) === Math.round(stageGold(nb2("L01s44"), 1) * 2));
ok("quick-play purses scale with difficulty", winGold("easy") < winGold("normal") && winGold("normal") < winGold("hard"));

// tolls: reachable but gated until paid; paying opens the way for this league
import { hauptast as haT } from "./test_helpers12.mjs";
const zollT = CAMP3.find((n) => n.league === 1 && n.gate?.gold);
const vorZoll = haT(1).slice(0, 4).map((n) => n.id); // der Abzweig liegt am Erwachen
const tp0 = { ...dp2(), gold: 500, campaign: { league: 1, cleared: vorZoll, unlocked: [] } };
ok("the toll gate is reachable but wants its toll", ns2(tp0, zollT.id) === "gated");
ok("toll cost scales with the league", tollCost(zollT, 1) === zollT.gate.gold && tollCost(zollT, 3) === zollT.gate.gold * 2);
const tpPoor = payToll({ ...tp0, gold: 10 }, zollT.id);
ok("too little gold: the ferryman does not row", tpPoor.gold === 10 && !(tpPoor.campaign.tolls || []).includes(zollT.id));
const tp1 = payToll(tp0, zollT.id);
ok("paying the toll opens the way and empties the purse accordingly",
  tp1.gold === 500 - zollT.gate.gold && ns2(tp1, zollT.id) === "available");
ok("paying twice is a no-op", payToll(tp1, zollT.id) === tp1);
ok("the branch behind a toll pays more than the toll costs", CAMP3.filter((n) => n.gate?.gold).every((z) => {
  const ast = CAMP3.filter((n) => n.league === z.league && !n.haupt && (n.reward?.gold || 0) > 0);
  return ast.reduce((a, n) => a + n.reward.gold, 0) > z.gate.gold;
}));

// richer claims: gold = max(5, 80% of the tier's points)
const evItems = ev2({ wins: 5 }).items;
const winsIt = evItems.find((i) => i.id === "wins");
ok("claims pay a fatter purse (80% of tier points, min 5)",
  cr2(winsIt, 0).gold === 5 && cr2(winsIt, 5).gold === 160);

// the big invariant: league 1 first-clear income comfortably covers every key
// item AVAILABLE in league 1. Late keys (the boat, minLeague 9) are a life's
// savings by design — they get their own invariant below.
const l1Income = CAMP3.filter((n) => n.league === 1).reduce((a, n) => a + stageGold(n, 1), 0);
const keyCost = IL3.filter((i) => i.kind === "key" && (i.minLeague || 1) <= 1).reduce((a, i) => a + i.gold, 0);
const tolls1 = CAMP3.filter((n) => n.league === 1 && n.gate?.gold).reduce((a, n) => a + tollCost(n, 1), 0);
ok("league 1 income covers its keys plus tolls with room to breathe (" + l1Income + " vs " + (keyCost + tolls1) + ")",
  l1Income > (keyCost + tolls1) * 1.1);

// the boat is EXPENSIVE by design (a story savings goal) — but the income of
// leagues 1..9 must still afford it comfortably before the Endless Sea calls
const boat3 = IL3.find((i) => i.id === "boat");
const income9 = [1,2,3,4,5,6,7,8,9].reduce((a, lg) => a + CAMP3.filter((n) => n.league === lg).reduce((b, n) => b + stageGold(n, lg), 0), 0);
ok("the boat costs serious coin (>= 2000)", boat3.gold >= 2000);
ok("nine leagues of income cover the boat (" + income9 + " vs " + boat3.gold + ")", income9 > boat3.gold * 1.5);


// ── v0.19: resigning forfeits everything; the chest reveals itself slowly ────
{
  const p0 = { ...structuredClone(base), gold: 10, items: { hourglass: 2 } };
  const rr = applyResult(p0, { result: "loss", resigned: true, captures: 3, checkmate: false, promotions: 0, charXpGains: { pawn: 40 }, hourglassUsed: 1 });
  ok("resign grants zero XP", rr.profile.xpEarned === (p0.xpEarned || 0));
  ok("resign grants zero gold", rr.profile.gold === 10);
  ok("resign grants zero piece XP", !(rr.profile.charXp?.pawn > (p0.charXp?.pawn || 0)));
  ok("resign still counts the loss", rr.profile.stats.losses === (base.stats.losses || 0) + 1);
  ok("time-turner burned on resign too", rr.profile.items.hourglass === 1);
  const rl = applyResult(p0, { result: "loss", captures: 3, charXpGains: {} });
  ok("a fought loss still pays a little XP", rl.profile.xpEarned > (p0.xpEarned || 0));
}
{
  const fresh = { campaign: { league: 1, cleared: [] } };
    // GAMBIT bonus XP: survives the battle → survival bonus in the summary
  {
    const p = withProgressPct(defaultProfile(), 30, 1);
    const map = mapById("classic");
    const wArmy = buildArmyForMap(p, map, null, "hp");
    const bArmy = buildArmyForMap(p, map, null, "hp");
    let g = createGame(wArmy, bArmy, { map, rules: "hp", seed: 5 });
    const log = [];
    for (let i = 0; i < 30; i++) {
      const moves = legalMoves(g);
      if (!moves.length) break;
      const caps = moves.filter((m) => g.board[m.to] && g.board[m.to].color !== g.turn);
      const m = caps[0] || moves[(i * 7) % moves.length];
      log.push({ from: m.from, to: m.to, ...(m.special ? { special: m.special } : {}), ...(m.promotion ? { promotion: m.promotion } : {}) });
      g = applyMove(g, m);
      if (g.status?.over) break;
    }
    const sum = summarizeMatch(wArmy, bArmy, 5, log, "win", "w", { map, rules: "hp" });
    ok("Gambit earns survival bonus XP when he lives", (sum.charXpGains.gambit || 0) > 12);
    ok("summary reports heroSurvived", sum.heroSurvived === true);
  }
    // FORMATION carries into battle — even when the fight is re-routed to another
  // board of the same size (early leagues bend everything onto the classic field)
  {
    const p = withProgressPct(defaultProfile(), 100, 5);
    const courtyard = mapById("courtyard");           // 8x8, same size as classic
    const custom = courtyard.defaultFormation.map((id) => id === "rook" ? "knight" : id);
    const p2 = { ...p, loadout: { ...p.loadout, formations: { courtyard: custom } } };
    const army = buildArmyForMap(p2, mapById("classic"), null, "hp");
    const kinds = army.back.filter((s) => s).map((s) => s.kind);
    ok("saved 8x8 formation carries onto the re-routed classic field", !kinds.includes("R"));
    // exact-map save still wins
    const p3 = { ...p, loadout: { ...p.loadout, formations: { classic: courtyard.defaultFormation } } };
    const army3 = buildArmyForMap(p3, mapById("classic"), null, "hp");
    ok("exact-map formation is honoured", army3.back.filter((s) => s).map((s) => s.kind).includes("R"));
  }
    // THE BIG DRAGON: map-aware legality accepts corner+wing, and both sides unfold 2x2
  {
    const p = withProgressPct(defaultProfile(), 100, 10);
    const map = MAPS.find((m) => !m.classic);
    const spec = formationSpec(map);
    const D = map.defaultFormation.slice();
    const flexIdx = D.map((id, i) => spec.required[id] === undefined ? i : -1).filter((i) => i >= 0);
    const f = ["dragon", null, ...D.filter((_, i) => i !== flexIdx[0] && i !== flexIdx[1])];
    ok("dragon corner+wing formation is legal (map-aware)", formationLegalOn(f, unlockedCharacterIds(p), map, ownedLeagueBosses(p)));
    const p3 = { ...p, loadout: { ...p.loadout, formations: { [map.id]: f } } };
    const g = createGame(buildArmyForMap(p3, map), buildArmyForMap(p, map), { map, rules: "hp", seed: 5 });
    ok("player dragon unfolds 2x2 (3 wings)", g.board.filter((x) => x && x.kind === "D+" && x.color === "w").length === 3);
  }
  {
    const p = withProgressPct(defaultProfile(), 40, 2);
    const m = buildStageMatch("L07s41", p);
    ok("hoard boss dragon carries the big flag", !!m.aiArmy.back.find((s) => s && s.kind === "D" && s.big));
  }
  ok("potion veiled at the very start", !itemRevealed(fresh, ITEMS.potion));
  // v0.77: Der Trank kommt NICHT mehr nach dem ersten Sieg - erst wenn die
  // alte Magie erwacht ist, gibt es Lebenspunkte zu heilen.
  ok("potion still veiled after the first win", !itemRevealed({ campaign: { league: 1, cleared: ["L01s00"] } }, ITEMS.potion));
  {
    /* v1.0.20: Der Trank haengt an needsHp - und Kapitel I hat keine
       Lebenspunkte mehr. Das ist kein Fehler, sondern der Sinn der Sache:
       WO NICHTS BLUTET, BRAUCHT NIEMAND EINEN TRANK. Er zeigt sich, sobald
       das Erwachen geschafft ist. */
    const ganzKapitelEins = CAMPX.filter((n) => n.league === 1).map((n) => n.id);
    ok("no potion while chapter I is pure chess",
      !itemRevealed({ campaign: { league: 1, cleared: ganzKapitelEins } }, ITEMS.potion));
    /* v1.2.2: das Erwachen liegt jetzt in Kapitel V, also braucht der Trank
       auch die Kapitel davor - vorher genuegte Kapitel I plus die eine
       Station. Der Sinn bleibt: der Heiltrank zeigt sich, wenn die alte Magie
       erwacht, nicht vorher. */
    const bisErwachen = CAMPX.filter((n) => n.league <= 5).map((n) => n.id);
    ok("potion revealed once the old magic wakes",
      itemRevealed({ campaign: { league: 5, cleared: bisErwachen } }, ITEMS.potion));
  }
  ok("machete veiled at the start", !itemRevealed(fresh, ITEMS.machete));
  const mid = { campaign: { league: 1, cleared: ["L01s00","L01s01","L01s03","L01s22","L01s23"] } };
  ok("machete revealed after 4 stages", itemRevealed(mid, ITEMS.machete));
  ok("mountain key veiled in league 1", !itemRevealed(mid, ITEMS.bergschluessel));
  ok("mountain key revealed in league 5", itemRevealed({ campaign: { league: 5, cleared: [] } }, ITEMS.bergschluessel));
  ok("time-turner revealed after 2 stages", itemRevealed({ campaign: { league: 1, cleared: ["L01s00","L01s01"] } }, ITEMS.hourglass));
}


// ── every station name is spoken once across all ten leagues ─────────────────
import { placeFor as _pf } from "./src/meta/index.js";
import { CAMPAIGN as _cg } from "./src/content/index.js";
{
  let einzig = true;
  for (let lg = 1; lg <= 12; lg++) { const seen = new Set();
    for (const n of _cg.filter((x) => x.league === lg)) { const nm = _pf(n); if (seen.has(nm)) einzig = false; seen.add(nm); } }
  ok("529 stations, no name spoken twice within a chapter", _cg.length === 529 && einzig);
  ok("League I keeps its founding names", _pf(_cg.find((n) => n.id === "L01s00")) === "Alte Wacht");
}

// ── der Vergessenstrank: steigender Preis, Trank statt Goldgebühr ────────────
import { respecPiece as _rp, abilityCost as _ac } from "./src/meta/index.js";
import { buyItem as _bi, itemPrice as _ip } from "./src/content/index.js";
{
  const tr = ITEMS.vergessenstrank;
  ok("the draught exists as an escalating consumable", !!tr && tr.kind === "consumable" && tr.steigend === true);
  ok("first draught costs the base price", _ip({}, tr) === 15);
  ok("each purchase doubles the price", _ip({ itemKaeufe: { vergessenstrank: 1 } }, tr) === 30
    && _ip({ itemKaeufe: { vergessenstrank: 2 } }, tr) === 60
    && _ip({ itemKaeufe: { vergessenstrank: 3 } }, tr) === 120);
  ok("the ceiling holds at 480", _ip({ itemKaeufe: { vergessenstrank: 9 } }, tr) === 480);
  let p = { gold: 200, items: {}, campaign: { league: 1, cleared: ["a","b","c"] } };
  p = _bi(p, "vergessenstrank");
  ok("buying charges the current price and counts the purchase",
    p.gold === 185 && p.items.vergessenstrank === 1 && p.itemKaeufe.vergessenstrank === 1);
  p = _bi(p, "vergessenstrank");
  ok("the second bottle already costs double",
    p.gold === 155 && p.items.vergessenstrank === 2 && p.itemKaeufe.vergessenstrank === 2);
  ok("too little gold buys nothing", _bi({ gold: 10, items: {} }, "vergessenstrank").items?.vergessenstrank == null);
  p = _bi(p, "vergessenstrank");
  ok("the satchel holds three at most", p.items.vergessenstrank === 3 && _bi({ ...p, gold: 999 }, "vergessenstrank").items.vergessenstrank === 3);
  // Respec: nur der Trank zaehlt, Gold hilft nicht mehr
  const rung = CHARACTERS.knight.ladder.find((e) => e.ability);
  const basis = { gold: 999, sp: 0, items: {}, itemKaeufe: { vergessenstrank: 2 },
    pieces: { abilities: { knight: [rung.ability] }, levels: { knight: rung.level } } };
  ok("without a draught, gold alone no longer forgets", _rp(basis, "knight") === basis);
  const mit = { ...basis, items: { vergessenstrank: 1 } };
  const nach = _rp(mit, "knight");
  ok("one draught forgets the knight and refunds every star",
    nach.items.vergessenstrank === 0 && nach.sp === _ac(rung.level)
    && !(nach.pieces.abilities.knight) && nach.gold === 999);
  ok("drinking does not make forgetting cheap again", nach.itemKaeufe.vergessenstrank === 2);
}

// ── der Heldname in den Kampagnentexten (v1.0.13) ────────────────────────
import { VOICES as _vx } from "./src/content/voices.js";
import { mitHeld as _mh, heldName as _hn } from "./src/app/ui/namen.js";
{
  const anreden = Object.values(_vx).filter((v) => (v.afterDe || "").includes("{held}"));
  ok("the figures address the hero by placeholder", anreden.length >= 20);
  ok("no direct vocative 'Wanderer' address remains", !JSON.stringify(_vx).includes(", Wanderer"));
  ok("the name steps into the text", _mh("Gut gemacht, {held}.", { name: "Manuel" }) === "Gut gemacht, Manuel.");
  ok("without a name the old honorific stays", _hn({}) === "Wanderer" && _mh("He, {held}!", null) === "He, Wanderer!");
}

console.log("\n== DER KAMPF TRAEGT SEIN KAPITEL (Besitzerbefund v1.1.5) ==");
{
  /* "Ich wechsle es ueber die Weltkarte, waehle das erste Level aus - und dann
     erscheint beim Starten des Kampfes das Level aus dem Meer." Ursache:
     buildStageMatch gab kein Feld league zurueck, also fiel die ganze Optik
     (Brettgrund, Feldfarben, Kapitelbild) auf das PROFIL zurueck. */
  const bau = (id, liga) => bsm2(id, { ...dp2(), campaign: { league: liga, cleared: [], unlocked: [] } });
  ok("der Kampf kennt sein Kapitel", bau("L03s00", 12).league === 3);
  ok("und zwar unabhaengig vom Profilstand",
    bau("L03s00", 1).league === 3 && bau("L03s00", 12).league === 3 && bau("L12s00", 1).league === 12);
  const { readFileSync } = await import("node:fs");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("die Optik fragt den Kampf, nicht das Profil",
    gs.includes("const kapitelVon = (match, profile) => match?.league") &&
    (gs.match(/profile\?\.campaign\?\.league/g) || []).length === 1);
}

console.log("\n== EINE JE REKRUTIERTE FIGUR, die drei Offiziere frei (v1.1.6) ==");
{
  const L = await import("./src/meta/leveling.js");
  const { MAPS, CHARACTER_LIST } = await import("./src/content/index.js");
  const alle = CHARACTER_LIST.map((c) => c.id);
  /* v1.24.3: Arena und Scharmuetzel sind gestrichen - gespielt wird auf acht
     Plaetzen. Die alte Zehnerreihe trug VIER Springer und war genau der Grund,
     warum eine Zweier-Grenze vorher unmoeglich war. Jetzt die Schachreihe. */
  const brett = MAPS.find((m) => m.id === "classic");
  const basis = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
  ok("die Schachgrundstellung ist erlaubt (je zwei Laeufer, Springer, Tuerme)",
    L.formationLegalOn(basis, alle, brett, []));
  const einHabicht = [...basis]; einHabicht[1] = "hawk";
  ok("EINE rekrutierte Figur ist erlaubt", L.formationLegalOn(einHabicht, alle, brett, []));
  const zweiHabichte = [...basis]; zweiHabichte[1] = "hawk"; zweiHabichte[6] = "hawk";
  ok("ZWEI derselben rekrutierten Figur sind verboten", !L.formationLegalOn(zweiHabichte, alle, brett, []));
  const zweiVerschieden = [...basis]; zweiVerschieden[1] = "hawk"; zweiVerschieden[6] = "amazon";
  ok("zwei VERSCHIEDENE rekrutierte sind erlaubt", L.formationLegalOn(zweiVerschieden, alle, brett, []));
}

console.log("\n== FREIE FASSUNG ODER VOLLE: ein Wert, keine Verzweigung (v1.1.10) ==");
{
  const cfg = await import("./src/app/config.js");
  const { readFileSync } = await import("node:fs");
  ok("es gibt einen Kapiteldeckel", typeof cfg.MAX_KAPITEL === "number" && cfg.MAX_KAPITEL >= 1);
  ok("die volle Fassung reicht bis zwoelf", cfg.MAX_KAPITEL === 12 && cfg.istFreieFassung() === false);
  /* Der Deckel muss dort greifen, wo Kapitel aufgezaehlt werden. */
  const ps = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");
  ok("die Werkbank haelt sich an den Deckel", ps.includes("filter((l) => l <= MAX_KAPITEL)"));
  /* Und er darf keine Verzweigung im Baum sein: eine Suche nach "istFreie"
     soll nur die Konfiguration selbst finden - sonst zieht sich die Trennung
     durch den Code, und man pflegt zwei Spiele. */
  const { execSync } = await import("node:child_process");
  const treffer = execSync("grep -rl 'istFreieFassung' src/ | wc -l").toString().trim();
  ok(`istFreieFassung steht nur in der Konfiguration (${treffer} Datei)`, Number(treffer) <= 1);
}

console.log("\n== KAPITEL I SCHACH, DER SCHADEN ERWACHT IN KAPITEL II (Besitzerentscheid 22.9.) ==");
{
  const { CAMPAIGN12 } = await import("./src/content/campaign12.gen.js");
  const { hpWach } = await import("./src/meta/leveling.js");
  const { faehigkeitZustand } = await import("./src/content/abilities.js");

  const kap1 = CAMPAIGN12.filter((n) => n.league === 1);
  ok(`Kapitel I ist reines Schach (${kap1.length} Stationen) - Figuren kennenlernen`, kap1.every((n) => n.rules === "chess"));
  const kap2 = CAMPAIGN12.filter((n) => n.league === 2);
  const erwachen = CAMPAIGN12.find((n) => /alte Magie erwacht/.test(n.storyDe || ""));
  ok(`das Erwachen liegt frueh im Hauptstrang von Kapitel II (${erwachen && erwachen.id}, Reihe ${erwachen && erwachen.row})`,
    erwachen && erwachen.league === 2 && erwachen.haupt && erwachen.rules === "hp" && erwachen.row <= 4);
  ok("... in Kapitel II spielen die Seitenwege weiter Schach", kap2.filter((n) => !n.haupt).every((n) => n.rules === "chess"));
  ok("... und kein Gefecht vor dem Erwachen blutet", kap2.filter((n) => n.haupt && n.row < erwachen.row).every((n) => n.rules === "chess"));
  const ab3 = CAMPAIGN12.filter((n) => n.league >= 3);
  ok("ab Kapitel III kaempft der Hauptstrang mit Lebenspunkten", ab3.filter((n) => n.haupt).every((n) => n.rules === "hp"));
  ok("... und Schach bleibt als Seitenweg - in jedem Kapitel ab III", [3,4,5,6,7,8,9,10,11,12].every((l) =>
    ab3.some((n) => n.league === l && !n.haupt && n.rules === "chess") || ab3.filter((n) => n.league === l && !n.haupt).length < 2));
  ok("die Gratisstrecke (bis Kapitel III) enthaelt Lebenspunkte-Gefechte", CAMPAIGN12.some((n) => n.league <= 3 && n.rules === "hp"));

  /* Die Lebenstalente folgen der Kampagne - sie erwachen mit dem ersten
     HP-Gefecht. Keine zweite Regel noetig, aber geprueft gehoert es: */
  const alle = (bis) => CAMPAIGN12.filter((n) => n.league <= bis).map((n) => n.id);
  const nach = (bis) => ({ campaign: { league: bis, cleared: alle(bis) } });
  ok("nach Kapitel I schlafen die Lebenstalente",
    !hpWach(nach(1)) && ["lifesteal", "regen", "bulwark"]
      .every((id) => faehigkeitZustand(id, hpWach(nach(1))) === "verborgen"));
  ok("nach Kapitel II wirken sie",
    hpWach(nach(2)) && ["lifesteal", "regen", "bulwark"]
      .every((id) => faehigkeitZustand(id, hpWach(nach(2))) === "wirkt"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
/* ── v1.47.0: DIE SCHRANKE - GRATIS BIS KAPITEL III ──────────────────────── */
{
  const { GRATIS_BIS_LIGA, istVoll, hinterSchranke } = await import("./src/meta/schranke.js");
  const { advanceLeague, nodeStatus } = await import("./src/meta/campaign.js");
  const { CAMPAIGN12 } = await import("./src/content/campaign12.gen.js");
  const finale = (lg) => CAMPAIGN12.find((n) => n.final && n.league === lg).id;
  const stand = (lg) => ({ campaign: { league: lg, cleared: [finale(lg)], unlocked: [], dupes: {} } });
  ok("gratis reicht bis Kapitel III", GRATIS_BIS_LIGA === 3
    && !hinterSchranke({}, 3) && hinterSchranke({}, 4));
  ok("die Vollfassung kennt keine Schranke", !hinterSchranke({ voll: true }, 12) && istVoll({ voll: true }));
  ok("das Finale von Kapitel II fuehrt gratis nach III", advanceLeague(stand(2)).campaign.league === 3);
  ok("das Finale von Kapitel III fuehrt gratis NICHT weiter", advanceLeague(stand(3)).campaign.league === 3);
  ok("... mit Vollfassung schon", advanceLeague({ ...stand(3), voll: true }).campaign.league === 4);
  ok("der geschaffte Stand bleibt unberuehrt - man steht nur vor dem Tor",
    nodeStatus(advanceLeague(stand(3)), finale(3)) === "cleared");
  const { readFileSync } = await import("node:fs");
  const camp = readFileSync("src/app/ui/screens/CampaignScreen.jsx", "utf8");
  ok("vor dem Tor steht eine Tafel, kein Knopf der nichts tut",
    camp.includes('hinterSchranke(profile, league + 1) && (') && camp.includes('t("camp.schranke"'));
}

/* ── v1.48.0: DIE VIERTE STUFE "SEHR SCHWER" ─────────────────────────────── */
{
  const { DIFFICULTIES, difficultyById } = await import("./src/content/difficulties.js");
  const { winGold } = await import("./src/meta/rewards.js");
  const vh = difficultyById("veryhard");
  const h = difficultyById("hard");
  ok("es gibt vier Stufen, die vierte heisst veryhard", DIFFICULTIES.length === 4 && vh.id === "veryhard");
  ok("sie rechnet eine Tiefe weiter als schwer", vh.depth === h.depth + 1);
  ok("ihre Figuren stehen hoeher als bei schwer",
    Object.keys(h.levels).every((k) => (vh.levels[k] || 0) >= h.levels[k]) && vh.levels.queen > h.levels.queen);
  ok("sie zahlt mehr Gold", winGold("veryhard") > winGold("hard"));
  const { readFileSync } = await import("node:fs");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("das Schnellspiel bietet sie an", gs.includes('{ value: "veryhard", label: t("diff.veryhard") }'));
}

/* ── v1.55.0: FREIGABEN GELTEN UEBER DEN KAPITELWECHSEL HINAUS ──────────────
   campaign.cleared wird beim Kapitelwechsel geleert. Die hintere Reihe (und
   mit ihr der Slider der Aufstellung), der Gambit und die Lebenspunkte
   duerfen deshalb nicht allein daran haengen. */
{
  const { darfReiheStellen } = await import("./src/meta/freigaben.js");
  const { gambitWach, hpWach } = await import("./src/meta/leveling.js");
  const frisch = (lg) => ({ campaign: { league: lg, cleared: [] } });
  ok("Kapitel I frisch: Reihe zu, Gambit schlaeft, keine Lebenspunkte",
    !darfReiheStellen(frisch(1)) && !gambitWach(frisch(1)) && !hpWach(frisch(1)));
  ok("Kapitel II frisch: die hintere Reihe bleibt frei (sonst kommt der Slider nie)", darfReiheStellen(frisch(2)));
  ok("Kapitel II frisch: der Gambit bleibt wach", gambitWach(frisch(2)));
  ok("Kapitel III frisch: die Lebenspunkte bleiben wach", hpWach(frisch(3)));
  const { readdirSync, readFileSync } = await import("node:fs");
  const dateien = [];
  const lauf = (d) => { for (const n of readdirSync(d, { withFileTypes: true })) {
    const q = d + "/" + n.name; if (n.isDirectory()) lauf(q); else if (/\.(jsx?|mjs)$/.test(n.name)) dateien.push(q); } };
  lauf("src");
  const absolut = dateien.filter((f) => /["'`]\/(brett|kapitel|bildarchiv|bildarchiv-klein|klangarchiv)\//.test(readFileSync(f, "utf8")));
  ok("die App laedt Brett, Kapitel und Archive RELATIV (sie wohnt unter /spielen/)", absolut.length === 0);
}

/* ── v1.56.0: DAS APP-SYMBOL ─────────────────────────────────────────────────
   Besitzerfoto 24.9.: auf dem Startbildschirm stand das Symbol verkleinert in
   einem weissen Kreis - das Manifest bot kein maskierbares 192er an, Android
   nahm das gerundete "any"-Symbol. */
{
  const { readFileSync } = await import("node:fs");
  const vc = readFileSync("vite.config.js", "utf8");
  ok("das Manifest bietet maskierbare Symbole in 192 UND 512",
    vc.includes('src: "icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable"')
    && vc.includes('src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable"'));
  // PNG-Kopf lesen: Farbtyp 2 = RGB ohne Alpha (randlos), 6 = RGBA
  const farbtyp = (f) => readFileSync(f)[25];
  ok("maskierbare Symbole, Apple-Symbol und Play-Symbol sind randlos und deckend (RGB)",
    ["public/icons/maskable-192.png", "public/icons/maskable-512.png", "public/icons/apple-touch-icon.png", "design/playstore-icon-512.png"]
      .every((f) => farbtyp(f) === 2));
  ok("die any-Symbole tragen durchsichtige Ecken (RGBA) - kein dunkler Grund mehr",
    ["public/icons/icon-192.png", "public/icons/icon-512.png"].every((f) => farbtyp(f) === 6));
  const twa = JSON.parse(readFileSync("design/twa-manifest.json", "utf8"));
  ok("auch das Android-Paket nimmt das randlose Bild", /maskable-512\.png$/.test(twa.maskableIconUrl || ""));
}

/* ── v1.57.0: DER FALLENDE GEIST IST DIE ECHTE FIGUR ────────────────────────
   Besitzerbefund: faellt der Gambit, flog er kurz als gewoehnlicher Bauer vom
   Brett - der Geist kannte nur Art und Farbe. */
{
  const { createGame, applyMove, legalMoves } = await import("./src/core/index.js");
  const st = createGame(undefined, undefined, { seed: 3 });
  const W = st.w || 8; const b = st.board;
  const wp = b.findIndex((p) => p && p.color === "w" && p.kind === "P");
  let erg = null;
  for (const ziel of [wp + W + 1, wp - W + 1]) {
    if (b[ziel]) continue;
    b[ziel] = { ...b.find((p) => p && p.color === "b" && p.kind === "P"), hero: true, charId: "gambit" };
    const mv = legalMoves(st).find((m) => m.from === wp && m.to === ziel);
    if (!mv) { b[ziel] = null; continue; }
    erg = applyMove(st, mv).lastMove.hitPiece; break;
  }
  ok("der Zug kennt die GANZE geschlagene Figur (Gambit bleibt Gambit)", !!erg && erg.hero === true && erg.charId === "gambit");
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("das Brett zeichnet den Geist aus dieser Figur", bv.includes("piece: lastMove.hitPiece ? { ...lastMove.hitPiece }"));
}

/* ── v1.64.0: DIE ANMELDUNG KEHRT INS SPIEL ZURUECK ─────────────────────────
   Besitzer: "mit meinem Google-Konto springt er zurueck auf die Landingpage".
   Die Rueckkehradresse war window.location.origin - die Wurzel ist seit
   v1.42.0 die Landingpage. */
{
  const { readFileSync } = await import("node:fs");
  const ca = readFileSync("src/meta/cloudAuth.js", "utf8");
  ok("die Anmeldung kehrt auf die Seite des Spiels zurueck, nicht an die Wurzel",
    !ca.includes("redirectTo: window.location.origin }") && ca.includes("window.location.pathname.replace("));
  const lp = readFileSync("public/landing.html", "utf8");
  ok("die Landingpage reicht eine ankommende Anmeldung an /spielen/ weiter",
    lp.includes('location.replace("/spielen/" + q + h)') && lp.indexOf("location.replace(\"/spielen/\"") < lp.indexOf("<body"));
}

process.exit(fail ? 1 : 0);
