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
ok("hard AI pieces carry shields", someShield);
console.log("      (hard pawn:", JSON.stringify(hard.pawn) + ")");

// Default player army is plain level 1
const a0 = buildArmy({ pieces: { levels: {} }, loadout: { flank: ["knight", "knight"] } });
ok("fresh player army has no shields", a0.back.every((s) => s.shield === 0) && a0.pawn.shield === 0);

// Abilities are a deliberate purchase now: level alone gives shields, not skills
const lvlOnly = buildArmy({ pieces: { levels: { pawn: 5 } }, loadout: { flank: ["knight", "knight"] } });
ok("level 5 pawn has its shield but NO auto ability", lvlOnly.pawn.shield >= 1 && lvlOnly.pawn.abilities.length === 0);
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
ok("die Schilde reichen bis zur Zwanzig: 11 auf Stufe 20", resolveCharacter(CHARACTERS.gambit, 20, null).shield === 11 && resolveCharacter(CHARACTERS.gambit, 10, null).shield === 3);
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
ok("der Held fuehrt die Armee von der ERSTEN Partie an",
  !!buildArmyForMap({ pieces: { levels: { gambit: 15 } }, campaign: { cleared: [] } }, mapById("arena")).hero);
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
/* v1.2.2 (Besitzerentscheid "Ab 5"): der Riss beisst nicht mehr in Kapitel
   II, sondern in der Mitte von Kapitel V. Vier volle Kapitel bleiben reines
   Schach, damit man Figuren und Gangarten lernt, bevor Trefferpunkte
   dazukommen. */
ok("and the rift bites in chapter V, not before",
  CAMPX.find((n) => n.rules === "hp").league === 5);
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
    // GRAND GAMBIT bonus XP: survives the battle → survival bonus in the summary
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
    ok("Grand Gambit earns survival bonus XP when he lives", (sum.charXpGains.gambit || 0) > 12);
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
  const arena = MAPS.find((m) => m.id === "arena");
  const basis = ["rook","knight","knight","bishop","queen","king","bishop","knight","knight","rook"];
  ok("die Grundstellung der Arena bleibt erlaubt (vier Springer!)",
    L.formationLegalOn(basis, alle, arena, []));
  const einHabicht = [...basis]; einHabicht[1] = "hawk";
  ok("EINE rekrutierte Figur ist erlaubt", L.formationLegalOn(einHabicht, alle, arena, []));
  const zweiHabichte = [...basis]; zweiHabichte[1] = "hawk"; zweiHabichte[8] = "hawk";
  ok("ZWEI derselben rekrutierten Figur sind verboten", !L.formationLegalOn(zweiHabichte, alle, arena, []));
  const zweiVerschieden = [...basis]; zweiVerschieden[1] = "hawk"; zweiVerschieden[8] = "amazon";
  ok("zwei VERSCHIEDENE rekrutierte sind erlaubt", L.formationLegalOn(zweiVerschieden, alle, arena, []));
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

console.log("\n== VIER KAPITEL REINES SCHACH (Besitzerentscheid v1.2.2) ==");
{
  const { CAMPAIGN12 } = await import("./src/content/campaign12.gen.js");
  const { hpWach } = await import("./src/meta/leveling.js");
  const { faehigkeitZustand } = await import("./src/content/abilities.js");

  const vor5 = CAMPAIGN12.filter((n) => n.league < 5 && n.rules === "hp");
  ok(`kein HP-Gefecht vor Kapitel 5 (${vor5.length} gefunden)`, vor5.length === 0);
  const inKap5 = CAMPAIGN12.filter((n) => n.league === 5 && n.rules === "hp");
  ok(`Kapitel 5 traegt den ersten Schaden (${inKap5.length} HP-Stationen)`, inKap5.length > 0);
  const schach = CAMPAIGN12.filter((n) => n.league <= 4).length;
  ok(`vier volle Kapitel Schach (${schach} Stationen)`, schach > 150);

  /* Die Lebenstalente folgen der Kampagne - sie erwachen mit dem ersten
     HP-Gefecht. Keine zweite Regel noetig, aber geprueft gehoert es: */
  const alle = (bis) => CAMPAIGN12.filter((n) => n.league <= bis).map((n) => n.id);
  const nach = (bis) => ({ campaign: { league: bis, cleared: alle(bis) } });
  ok("nach Kapitel 4 schlafen die Lebenstalente",
    !hpWach(nach(4)) && ["lifesteal", "regen", "bulwark"]
      .every((id) => faehigkeitZustand(id, hpWach(nach(4))) === "verborgen"));
  ok("nach Kapitel 5 wirken sie",
    hpWach(nach(5)) && ["lifesteal", "regen", "bulwark"]
      .every((id) => faehigkeitZustand(id, hpWach(nach(5))) === "wirkt"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
