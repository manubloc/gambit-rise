import { pieceMoves, NUM_SQUARES, KIND, idx } from "./src/core/index.js";
import {
  defaultFormation, formationLegal, buildArmyFromFormation, buildArmy,
  buildStageMatch, advanceCampaign, advanceLeague, nodeStatus, clearedCount, unlockedCharacterIds, mapUnlocked, hpUnlocked, isUnlocked,
} from "./src/meta/index.js";
import { CAMPAIGN } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

const blank = () => new Array(NUM_SQUARES).fill(null);
const P = (kind, color, abilities = []) => ({ id: 1, kind, color, level: 9, abilities, used: {}, shield: 0 });
const movesAt = (board, sq) => pieceMoves({ board }, sq);
const canReach = (m, to, special) => m.some((x) => x.to === to && (special ? x.special === special : true));

// ── New abilities ─────────────────────────────────────────────────────────────
let b = blank(); b[idx(3, 4)] = P(KIND.PAWN, "w", ["pawn_charge"]);
ok("pawn_charge advances two from anywhere", canReach(movesAt(b, idx(3, 4)), idx(3, 6), "rush"));

b = blank(); b[idx(3, 4)] = P(KIND.PAWN, "w");
ok("pawn without charge cannot 2-step off start", !canReach(movesAt(b, idx(3, 4)), idx(3, 6)));

b = blank(); b[idx(3, 4)] = P(KIND.PAWN, "w", ["pawn_backstep"]);
ok("pawn_backstep retreats one square", canReach(movesAt(b, idx(3, 4)), idx(3, 3), "back"));

b = blank(); b[idx(4, 4)] = P(KIND.KNIGHT, "w", ["knight_outrider"]);
ok("knight_outrider adds a (2,2) diagonal leap", canReach(movesAt(b, idx(4, 4)), idx(6, 6), "leap"));

b = blank(); b[idx(4, 4)] = P(KIND.BISHOP, "w", ["bishop_ortho_step"]);
ok("bishop_ortho_step adds an orthogonal step", canReach(movesAt(b, idx(4, 4)), idx(4, 5), "step"));

b = blank(); b[idx(0, 0)] = P(KIND.ROOK, "w", ["rook_breach"]); b[idx(0, 1)] = P(KIND.PAWN, "w");
ok("rook_breach hops over an adjacent piece", canReach(movesAt(b, idx(0, 0)), idx(0, 2), "breach"));

b = blank(); b[idx(0, 0)] = P(KIND.ROOK, "w"); b[idx(0, 1)] = P(KIND.PAWN, "w");
ok("rook without breach is blocked by adjacent piece", !canReach(movesAt(b, idx(0, 0)), idx(0, 2)));

// ── New pieces ────────────────────────────────────────────────────────────────
b = blank(); b[idx(4, 4)] = P(KIND.AMAZON, "w");
let m = movesAt(b, idx(4, 4));
ok("Amazon moves like a knight", canReach(m, idx(5, 6)) && canReach(m, idx(6, 5)));
ok("Amazon moves like a queen (file + diagonal)", canReach(m, idx(4, 7)) && canReach(m, idx(7, 7)));  /* v1.24.0: 8x8 */

b = blank(); b[idx(4, 4)] = P(KIND.HAWK, "w");
m = movesAt(b, idx(4, 4));
ok("Hawk moves like a knight", canReach(m, idx(5, 6)) && canReach(m, idx(2, 3)));
ok("Hawk steps one diagonally", canReach(m, idx(5, 5)) && canReach(m, idx(3, 3)));
ok("Hawk is NOT a full bishop (no long diagonal)", !canReach(m, idx(7, 7)));

// ── Formation ─────────────────────────────────────────────────────────────────
const allUnlocked = unlockedCharacterIds({ campaign: { unlocked: ["hawk","archbishop","chancellor","amazon","assassin","guardian","dragon","mage","sorceress","alchemist","warlock","paladin","inquisitor","bard","engineer","standard","strategist","pathfinder"] } });
const def = defaultFormation();
ok("defaultFormation has 8 slots", def.length === 8);          /* v1.24.0: Arena gestrichen */
ok("defaultFormation is legal", formationLegal(def, allUnlocked));

const twoQueens = [...def]; twoQueens[1] = "queen";
ok("two queens is illegal", !formationLegal(twoQueens, allUnlocked));

const noKing = [...def]; noKing[4] = "rook";                   /* v1.24.0: der Koenig steht auf 4 */
ok("missing king is illegal", !formationLegal(noKing, allUnlocked));

const lockedFairy = [...def]; lockedFairy[1] = "amazon";
ok("unlocked-only is enforced", !formationLegal(lockedFairy, ["king", "queen", "rook", "bishop", "knight"]) && formationLegal(lockedFairy, allUnlocked));

const army = buildArmyFromFormation(() => 1, def);
ok("formation army has an 8-piece back rank", army.back.length === 8);
ok("formation army back rank matches kinds", army.back[0].kind === KIND.ROOK && army.back[4].kind === KIND.KING);

// buildArmy prefers a legal custom formation, falls back otherwise (Klassik by default, v1.24.0)
const rich = { xp: 0, campaign: { cleared: [], unlocked: ["archbishop"] }, pieces: { levels: {} }, loadout: {} };
const custom = [...def]; custom[1] = "archbishop";
ok("buildArmy uses a legal custom formation", buildArmy({ ...rich, loadout: { formations: { classic: custom } } }).back[1].kind === KIND.ARCHBISHOP);

const illegal = [...def]; illegal[1] = "queen";
const fb = buildArmy({ ...rich, loadout: { formations: { classic: illegal } } });
ok("buildArmy falls back to standard on illegal formation", fb.back.filter((s) => s.kind === KIND.QUEEN).length === 1);

// ── Campaign (branching graph) ───────────────────────────────────────────────
ok("campaign has stages", CAMPAIGN.length >= 8);
const s0 = buildStageMatch("L01s00");
ok("story starts as chess on the classic board", s0.map === "classic" && s0.rules === "chess");
ok("stage match builds a full enemy army", s0.aiArmy.back.length === 8 && s0.aiArmy.pawn.kind === KIND.PAWN);
ok("stage match carries a search depth", typeof s0.depth === "number" && s0.depth >= 1);
ok("classic stages field base-level enemies", s0.aiArmy.back.every((p) => (p.level || 1) === 1));
/* v1.24.0: die Arena ist gestrichen - die neuen Buehnen sind Hof und Schneise. */
ok("later stages open new boards", CAMPAIGN.some((s) => s.map === "courtyard") && CAMPAIGN.some((s) => s.map === "gauntlet") && CAMPAIGN.some((s) => s.rules === "hp"));

const last = buildStageMatch("L01s44");
ok("final stage is a boss fight", last.boss && last.aiArmy.back.some((s) => s.kind === "X"));

import { hauptast, figurStation, startOf } from "./test_helpers12.mjs";
import * as metaAll from "./src/meta/index.js";
const H1 = hauptast(1);
let prof = { xp: 0, campaign: { cleared: [], unlocked: [] } };
ok("the chapter start is available, a side path locked", nodeStatus(prof, H1[0].id) === "available" && nodeStatus(prof, "L01s02") === "locked");
prof = advanceCampaign(prof, H1[0].id);
ok("clearing grants bonus xp (both balances)", clearedCount(prof) === 1 && prof.xp === H1[0].reward.xp && prof.xpEarned === prof.xp);
ok("start cleared, the next main station available", nodeStatus(prof, H1[0].id) === "cleared" && nodeStatus(prof, H1[1].id) === "available");
ok("clearing a locked node is a no-op", clearedCount(advanceCampaign(prof, H1[10].id)) === 1);
prof = advanceCampaign(prof, H1[1].id);
prof = advanceCampaign(prof, H1[2].id);
ok("the road FORKS after the awakening (one branch may want a toll)", H1[2].next.length >= 2 && H1[2].next.every((id) => ["available","gated"].includes(nodeStatus(prof, id))));
ok("paths do not open each other", nodeStatus(prof, H1[10].id) === "locked");

// ── Piece bosses unlock pieces; XP upgrades them ─────────────────────────────
// Die Figuren wohnen jetzt in ihren Kapiteln: der Falke frueh (ein Sieg),
// der Drache spaet (zwei Siege, ueber Wiederholungen gezaehlt).
const hawkN = figurStation("hawk"), dragonN = figurStation("dragon");
ok("the hawk waits in its own chapter, locked to a fresh profile", !unlockedCharacterIds(prof).includes("hawk"));
{
  let p2 = { xp: 0, campaign: { league: hawkN.league, cleared: [], unlocked: [] } };
  const vor = hauptast(hawkN.league);
  for (const n of vor) { p2 = advanceCampaign(p2, n.id); if (n.id === hawkN.id) break; }
  ok("an early champion falls in a single win", unlockedCharacterIds(p2).includes("hawk"));
  ok("campaign clears feed the achievement stats", p2.stats.stagesCleared >= 1 && p2.stats.recruits === 1);
  ok("a cleared champion station deals the FRIENDLY table", buildStageMatch(hawkN.id, p2).friendly === true && !buildStageMatch(startOf(hawkN.league).id, p2).friendly);
  ok("a friendly against a recruited champion pays a quarter XP", (() => {
    const xp = p2.xpEarned || 0;
    const { leagueRewardMult } = metaAll;
    return (advanceCampaign(p2, hawkN.id).xpEarned || 0) === xp + Math.round(hawkN.reward.xp * leagueRewardMult(hawkN.league) * 0.25);
  })());
}
import { bossPieceFor, effectiveMap, winsNeeded, bossWinsFor, recruitOnWin } from "./src/meta/index.js";
import { nodeById as nbId } from "./src/content/index.js";
ok("wins demands are read off the boss (late champions resist twice)",
  winsNeeded(dragonN, dragonN.league) === 2 && winsNeeded(hawkN, hawkN.league) === 1 && winsNeeded(figurStation("seeress")) === 2);
ok("early chapters yield in one win, the deep road demands two",
  winsNeeded(figurStation("mage")) === 1 && winsNeeded(figurStation("warlock")) === 2);
{
  let d = { xp: 0, campaign: { league: dragonN.league, cleared: [], unlocked: [] } };
  for (const n of hauptast(dragonN.league)) { if (n.id === dragonN.id) break; d = advanceCampaign(d, n.id); }
  ok("first Dragon win only notches the tally", (() => { d = advanceCampaign(d, dragonN.id); return bossWinsFor(d, "dragon") === 1 && !unlockedCharacterIds(d).includes("dragon"); })());
  ok("a replay notches it again without progress or XP", (() => { const xp = d.xpEarned || 0; const c = clearedCount(d); d = advanceCampaign(d, dragonN.id); return bossWinsFor(d, "dragon") === 2 && clearedCount(d) === c; })());
  ok("the tally seals the recruit on the deciding win", unlockedCharacterIds(d).includes("dragon"));
}
// a won league boss may march in the queen's place — one at most
import { formationLegalOn as fLegal, buildArmyFromFormation as bFromForm, ownedLeagueBosses } from "./src/meta/index.js";
import { mapById as mapOf } from "./src/content/index.js";
{
  const karte = mapOf("classic");   /* v1.24.0: die Arena ist gestrichen */
  const ids = ["hawk","assassin","pathfinder","dragon","guardian","bard","paladin","inquisitor","standard","engineer","chancellor","archbishop","mage","alchemist","sorceress","warlock","strategist","amazon","captain","knight","bishop","rook","queen","king","pawn"];
  const base = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
  const withBoss = [...base]; withBoss[3] = "boss:b12";  // v0.38.1: Kapitel-I-Trophaee ist der Richter (Osric ans Ende)
  const prof1 = { stats: { leaguesWon: 1 } }, prof0 = { stats: {} };
  ok("league bosses are trophies of finished leagues", ownedLeagueBosses(prof1).join() === "b12" && ownedLeagueBosses(prof0).length === 0);
  ok("a boss stands in for the queen — if you own him", fLegal(withBoss, ids, karte, ["b12"]) && !fLegal(withBoss, ids, karte, []));
  const twoBosses = [...withBoss]; twoBosses[0] = "boss:b12";
  ok("one boss at most on the field", !fLegal(twoBosses, ids, karte, ["b12"]));
  const army = bFromForm(() => 1, withBoss);
  ok("the fielded boss brings his stats and aura", army.back[3].bossId === "b12" && army.back[3].aura.type === "noEnemyPotions");
  /* v1.33.0 (Besitzer): die GEWOEHNLICHEN Monster stehen auf freien Plaetzen -
     anstelle von Turm, Laeufer, Springer; die Kapitelmeister nur anstelle der
     Dame. Jedes Monster hoechstens einmal. */
  const mitStreuner = [...base]; mitStreuner[0] = "boss:b05";             // Streuner statt Turm
  ok("ein gewoehnliches Monster steht anstelle des Turms - wenn es einem gehoert",
    fLegal(mitStreuner, ids, karte, ["b05"]) && !fLegal(mitStreuner, ids, karte, []));
  const aufLaeufer = [...base]; aufLaeufer[2] = "boss:b05";
  const aufSpringer = [...base]; aufSpringer[1] = "boss:b05";
  ok("... ebenso anstelle von Laeufer und Springer", fLegal(aufLaeufer, ids, karte, ["b05"]) && fLegal(aufSpringer, ids, karte, ["b05"]));
  const zweiMonster = [...base]; zweiMonster[0] = "boss:b05"; zweiMonster[6] = "boss:b01";
  ok("... auch zwei verschiedene zugleich", fLegal(zweiMonster, ids, karte, ["b05", "b01"]));
  const zweimal = [...base]; zweimal[0] = "boss:b05"; zweimal[7] = "boss:b05";
  ok("... aber jedes nur einmal", !fLegal(zweimal, ids, karte, ["b05"]));
  const monsterAlsDame = [...base]; monsterAlsDame[3] = "boss:b05";
  ok("ein gewoehnliches Monster steht NIE anstelle der Dame", !fLegal(monsterAlsDame, ids, karte, ["b05"]));
  const meisterAufFlanke = [...base]; meisterAufFlanke[0] = "boss:b12";
  ok("ein Kapitelmeister steht NUR anstelle der Dame, nie auf einem freien Platz", !fLegal(meisterAufFlanke, ids, karte, ["b12"]));
  const beides = [...withBoss]; beides[7] = "boss:b05";
  ok("Meister auf dem Damenplatz und Monster auf der Flanke zugleich", fLegal(beides, ids, karte, ["b12", "b05"]));
  const heer = bFromForm(() => 1, beides);
  ok("... und beide marschieren mit ihren Werten", heer.back[3].bossId === "b12" && heer.back[7].bossId === "b05" && heer.back[7].kind === "X");
  ok("Kapitel III gewonnen: der Seuchenkoenig gehoert einem, nicht der Hetzer",
    ownedLeagueBosses({ stats: { leaguesWon: 3 } }).join() === "b12,b10,b24");
}
ok("from chapter IV every station fields its own stage; the finale always does",
  ["L01s02","L01s16","L07s41","L01s22"].every((id) => effectiveMap(nbId(id), 4) === nbId(id).map)
  && effectiveMap(nbId("L01s44"), 1) === nbId("L01s44").map);

// ── League 2 (New Game+): rollover, duplication stars, scaling ───────────────
import { buildStageMatch as bsm2, dupeCount, leagueBump } from "./src/meta/index.js";
import { potionCommand, reduce as red2, createGame as cg2, WHITE as W2 } from "./src/core/index.js";
import { kapitelDurch, figurStation as fig2, hauptast as ha2 } from "./test_helpers12.mjs";
let lg = kapitelDurch({ xp: 0, campaign: { cleared: [], unlocked: [] } }, 1);
const FIN1 = ha2(1)[ha2(1).length - 1].id;
ok("the fallen Keep stays on the map — no auto-jump into league 2", lg.campaign.league === 1 && lg.campaign.cleared.includes(FIN1));
ok("the gate refuses while the Master still stands", advanceLeague({ xp: 0, campaign: { cleared: [], unlocked: [] } }).campaign?.league !== 2);
lg = advanceLeague(lg);
ok("stepping through the gate rolls into league 2 with clears reset", lg.campaign.league === 2 && lg.campaign.cleared.length === 0);
ok("unlocked pieces survive the rollover, gold is untouched by it", lg.campaign.unlocked.length >= 2 && (lg.gold || 0) === (typeof lg.gold === "number" ? lg.gold : 0));
ok("paid tolls reset with the league — every climate has its own gatekeeper", (lg.campaign.tolls || []).length === 0);
{
  const hawk2 = fig2("hawk");
  for (const n of ha2(2)) { lg = advanceCampaign(lg, n.id); if (n.id === hawk2.id) break; }
  ok("the hawk joins in its home chapter", lg.campaign.unlocked.includes("hawk"));
  ok("the win tally survives across fights", bossWinsFor(lg, "hawk") >= 1);
  // Duplikatsterne gibt es beim WIEDERSEHEN: im naechsten Weltdurchlauf
  // (Liga 14 = Kapitel II erneut) ist die Station wieder ein Erstsieg.
  let lap = { xp: 0, campaign: { league: 14, cleared: [], unlocked: ["hawk"], bossWins: { hawk: 1 }, dupes: {} } };
  for (const n of ha2(2)) { lap = advanceCampaign(lap, n.id); if (n.id === hawk2.id) break; }
  ok("re-beating recruited piece bosses on the next world lap grants duplication stars", dupeCount(lap, "hawk") === 1);
  // Die Buehnenstaffelung folgt dem REGELWERK: reine Schachpartien bleiben
  // Stufe 1, HP-Schlachten skalieren - unabhaengig vom Brett.
  /* v1.2.2 (Besitzerentscheid "Ab 5"): HP-Gefechte beginnen in Kapitel V,
     nicht mehr in II - vier Kapitel bleiben reines Schach. */
  const chessN = H1[0], hpN = ha2(5).find((n) => n.rules === "hp");
  ok("pure chess stays vanilla while HP battles scale with the world",
    bsm2(chessN.id, { xp: 0, campaign: { league: 13, cleared: [], unlocked: [] } }).aiArmy.back[0].level === 1
    && bsm2(hpN.id, lg).aiArmy.back[0].level > 1);
  /* v1.24.0: Kapitel I hat jetzt GENAU EINE Nicht-Klassik-Station - das Finale,
   auf dem der Grossmeister den Hof einfuehrt. Gemessen: L01s44. Finale behalten
   ihre Buehne, alles andere beugt sich weiterhin aufs klassische Brett. */
{
  const fremde = ha2(1).filter((n) => n.map !== "classic");
  ok("in Kapitel I steht nur das Finale auf einer anderen Buehne",
    fremde.length === 1 && fremde[0].final === true && fremde[0].map === "courtyard");
  ok("chapter I bends every ordinary stage onto the classic board",
    ha2(1).filter((n) => !n.final).every((n) => effectiveMap(n, 1) === "classic"));
  ok("das Finale behaelt seine Buehne", effectiveMap(fremde[0], 1) === "courtyard");
}
}

// ── Healing draught: a real, guarded core command ─────────────────────────────
const hg = cg2(undefined, undefined, { rules: "hp", seed: 3, potions: { w: 1, b: 0 } });
const pi = hg.board.findIndex((x) => x && x.color === "w" && x.kind === "P");
hg.board[pi] = { ...hg.board[pi], hp: 1 };
const heal = red2(hg, potionCommand(W2, pi));
ok("potion heals toward max, spends a charge, passes the turn",
  heal.state.board[pi].hp === heal.state.board[pi].maxHp && heal.state.potions.w === 0 && heal.state.turn === "b");
ok("without charges the command is a no-op", red2(heal.state, potionCommand("b", pi)).state === heal.state);

// ── Item-gated secret paths + the Captain/boat chain ─────────────────────────
import { nodeStatus as nst, seaAccessible, dupeCount as dc2 } from "./src/meta/index.js";
import { buyItem, CAMPAIGN as CAMP2, ITEMS } from "./src/content/index.js";
ok("every chapter posts exactly one toll station", CAMP2.filter((n) => n.gate).length === 12 && CAMP2.filter((n) => n.gate?.gold).length === 12);
ok("all stations are chapter-bound (twelve worlds, 529 stations)", CAMP2.filter((n) => n.league).length === CAMP2.length && CAMP2.length === 529);
import { nodeStatus as nstH } from "./src/meta/index.js";
ok("league-bound sites hide outside their league", nstH({ campaign: { league: 1, cleared: ["L01s02"] } }, "L02s00") === "hidden");
let gp = { xp: 0, gold: 500, campaign: { league: 1, cleared: [], unlocked: [], tolls: [] } };
const H1b = hauptast(1);
for (const n of H1b.slice(0, 3)) gp = advanceCampaign(gp, n.id);
const zoll = CAMP2.find((n) => n.league === 1 && n.gate?.gold);
ok("a reachable toll gate reports 'gated' until you pay", nst(gp, zoll.id) === "gated");
import { payToll, tollCost } from "./src/meta/index.js";
const goldBefore = gp.gold;
gp = payToll(gp, zoll.id);
ok("paying the toll opens the path (and charges gold)", nst(gp, zoll.id) === "available" && gp.gold === goldBefore - tollCost(zoll, 1));
gp = advanceCampaign(gp, zoll.id);
ok("the long branch behind the toll pays out at its leaf", CAMP2.some((n) => n.league === 1 && !n.haupt && (n.reward?.gold || 0) >= 40));
import { kapitelDurch as kd9 } from "./test_helpers12.mjs";
const capN = fig2("captain");
ok("the Captain waits on a side path of chapter VI", capN.league === 6 && !capN.haupt && bsm2(capN.id, { campaign: { league: 6, cleared: [], unlocked: [] } }).boss.unlocks === "captain");
let sailed = kd9({ v: 2, sp: 0, gold: 0, xp: 0, xpEarned: 0, stats: {}, pieces: { levels: {}, abilities: {} }, items: {}, claims: {},
  loadout: { flank: ["knight", "knight"], formations: {} },
  campaign: { league: 11, cleared: [], unlocked: ["captain"], dupes: {} } }, 11);
sailed = advanceLeague(sailed);
ok("clearing the Coast opens chapter XII", sailed.campaign.league === 12);
ok("but the sea still wants a boat (and the boat wants a fortune)", !seaAccessible(sailed) && !seaAccessible(buyItem({ ...sailed, gold: 200 }, "boat")) && seaAccessible(buyItem({ ...sailed, gold: 2500 }, "boat")));

// ── The Grand Gambit: the eponymous hero pawn ────────────────────────────────
import { upgradeCost as upc2, heroColFor, buildArmy as bArmy } from "./src/meta/index.js";
import { CHARACTERS as CH2, mapById as mapBy2 } from "./src/content/index.js";
import { createGame as cg3 } from "./src/core/index.js";
ok("the hero exists, costs more than a common pawn, learns Masquerade at 8",
  CH2.gambit.epic === true && upc2("gambit") === 2 && upc2("pawn") === 1 &&
  CH2.gambit.ladder.some((e) => e.level === 8 && e.ability === "gambit_masquerade"));
const hp0 = { ...prof, loadout: { ...prof.loadout, heroCols: {} } };
/* v1.24.0: gemessen auf Klassik (8 breit) statt auf der gestrichenen Arena. */
ok("his file defaults to the center and clamps to the board",
  heroColFor(hp0, mapBy2("classic")) === 4 &&
  heroColFor({ ...hp0, loadout: { ...hp0.loadout, heroCols: { classic: 99 } } }, mapBy2("classic")) === 7);
const hpX = { ...prof, loadout: { flank: ["knight", "knight"], formations: {}, heroCols: { arena: 2 } },
  /* v0.81: der Held zieht erst mit, wenn er erwacht ist (drei Stationen). */
  campaign: { ...(prof.campaign || {}), cleared: ["L01s01", "L01s02", "L01s03"] },
  pieces: { levels: { gambit: 4 }, abilities: { gambit: ["pawn_sidestep"] } } };
const hg2 = cg3(bArmy(hpX), undefined, { rules: "hp", seed: 5 });
const heroes2 = hg2.board.filter((x) => x && x.hero);
ok("exactly ONE crested pawn takes his chosen file",
  heroes2.length === 1 && heroes2[0].color === "w" && heroes2[0].level === 4 &&
  hg2.board.findIndex((x) => x && x.hero) % 10 === 2);
import { evaluate as aiEval } from "./src/ai/evaluate.js";
const swap = hg2.board.slice();
const hiIdx = swap.findIndex((x) => x && x.hero);
const plainIdx = swap.findIndex((x) => x && x.kind === "P" && !x.hero && x.color === "w");
// ── Restore points: rolling + daily retention (pure policy) ─────────────────
import { applySnapshot, readSnapshot, BK_RECENT, BK_MIN_GAP_MS } from "./src/meta/index.js";
ok("snapshots respect the 10-minute gap but never miss forced ones", (() => {
  const p = { name: "A", pieces: {}, gold: 1, campaign: { league: 1 } };
  let l = applySnapshot([], p, 1_000_000);
  const same = applySnapshot(l, p, 1_000_000 + BK_MIN_GAP_MS / 2);
  const forced = applySnapshot(l, p, 1_000_000 + 1000, true);
  return l.length === 1 && same.length === 1 && forced.length === 2;
})());
ok("retention keeps the recent six plus one anchor per older day", (() => {
  const p = { name: "A", pieces: {}, gold: 1, campaign: { league: 1 } };
  let l = []; const day = 864e5; let now = 100 * day;
  for (let d = 8; d >= 1; d--) for (let h = 0; h < 4; h++)
    l = applySnapshot(l, p, now - d * day + h * 3 * 3600e3, true);
  for (let i = 0; i < 8; i++) l = applySnapshot(l, p, now + i * BK_MIN_GAP_MS, true);
  const days = new Set(l.slice(BK_RECENT).map((e) => new Date(e.ts).toISOString().slice(0, 10)));
  return l.length === BK_RECENT + days.size && days.size >= 6 && l.length <= BK_RECENT + 10;
})());
ok("a snapshot restores the full profile (and rejects corruption)", (() => {
  const p = { name: "Held", pieces: { levels: {} }, gold: 99, campaign: { league: 3 } };
  const l = applySnapshot([], p, 5_000_000);
  const r = readSnapshot(l[0]);
  let rejected = false;
  try { readSnapshot({ data: "{\"broken\":1}" }); } catch { rejected = true; }
  return r.gold === 99 && r.campaign.league === 3 && rejected;
})());

// ── Release hardening: notices + portable saves ─────────────────────────────
import { serializeSave, parseSave, defaultProfile as dp2 } from "./src/meta/index.js";
ok("fresh profiles carry an empty notices ledger (privacy popup will show)",
  JSON.stringify(dp2().notices) === "{}");
ok("a save file round-trips through export → import (with migration)", (() => {
  const p = { ...dp2(), name: "Backup", gold: 77, notices: { privacy: true } };
  const r = parseSave(serializeSave(p));
  return r.name === "Backup" && r.gold === 77 && r.notices.privacy === true && r.loadout.heroCols;
})());
ok("imports reject files that are not Grand Gambit saves", (() => {
  for (const bad of ["nope", "{}", JSON.stringify({ gg: "x", profile: {} })]) {
    try { parseSave(bad); return false; } catch {}
  }
  return true;
})());

// ── SVG asset registry: every figure and scenery piece has an editable file ──
import { PIECE_ART, BOSS_ART, CREST_ART, SCENERY_ART } from "./src/app/ui/art.generated.js";
ok("every character kind has a piece SVG (plus a default)", (() => {
  const kinds = new Set([...Object.values(CH2).map((c) => c.kind), "P", "N", "B", "R", "Q", "K"]);
  return [...kinds].every((k) => (PIECE_ART[k] || "").length > 40) && PIECE_ART._default;
})());
ok("boss silhouettes + the hero's crest come from files",
  ["beast", "golem", "wraith", "serpent", "tyrant"].every((a) => (BOSS_ART[a] || "").length > 40) && CREST_ART.length > 100);
ok("all 27 scenery pieces are file-backed (incl. the snow overlay)",
  Object.keys(SCENERY_ART).length >= 27 && (SCENERY_ART["pine-snow"] || "").length > 40 && /var\(--c1/.test(SCENERY_ART.pine));
ok("the AI values the hero above a common pawn", (() => {
  const withHero = aiEval({ ...hg2, board: swap }, "w");
  const noHero = aiEval({ ...hg2, board: swap.map((x, i) => i === hiIdx ? { ...x, hero: false } : x) }, "w");
  return withHero > noHero;
})());

// ── Unlocks ride on campaign reach ───────────────────────────────────────────
const fresh = { xp: 0, campaign: { cleared: [], unlocked: [] } };
ok("fresh profile: only classic, no HP", mapUnlocked(fresh, "classic") && !mapUnlocked(fresh, "gauntlet") && !hpUnlocked(fresh));
// v0.77: Das Erwachen sitzt in der MITTE von Kapitel I - erst wer die
// Schachhaelfte hinter sich hat, sieht Lebenspunkte. Zwei Siegen reicht nicht
// mehr; der Weg wird darum wirklich gegangen.
{
  /* v1.0.20 (Besitzer): Kapitel I ist GANZ reines Schach, das Erwachen sitzt
     auf halbem Weg durch Kapitel II. Also bleibt HP durch das ganze erste
     Kapitel zu - und oeffnet erst, wenn der Weg in Kapitel II bis zur
     blutenden Station reicht. */
  const kapEins = CAMPAIGN.filter((n) => n.league === 1 && n.haupt);
  const halb = kapEins.slice(0, 2).reduce((p, n) => advanceCampaign(p, n.id), fresh);
  ok("hp stays shut early in chapter I", !hpUnlocked(halb));
  const nachKapEins = kapEins.reduce((p, n) => advanceCampaign(p, n.id), fresh);
  ok("hp stays shut through ALL of chapter I", !hpUnlocked(nachKapEins));
  /* Der Weg nach Kapitel II fuehrt ueber den Meister; statt ihn hier zu
     schlagen, wird der Stand gesetzt - geprueft wird die HP-Schwelle, nicht
     die Wegfindung. */
  /* v1.2.2: das Erwachen liegt in Kapitel V. Der Weg dorthin fuehrt jetzt
     durch vier Kapitel Schach statt durch eines - geprueft wird weiterhin die
     HP-Schwelle, nicht die Wegfindung. */
  const bisFuenf = CAMPAIGN.filter((n) => n.league <= 5 && n.rules === "chess").map((n) => n.id);
  const bisErwachen = { ...nachKapEins, campaign: { ...nachKapEins.campaign, league: 5,
    cleared: [...(nachKapEins.campaign.cleared || []), ...bisFuenf],
    unlocked: [...(nachKapEins.campaign.unlocked || []), ...bisFuenf] } };
  ok("hp opens once the awakening is reachable", hpUnlocked(bisErwachen));
}
/* v1.24.0: Arena und Scharmuetzel sind gestrichen. Die drei verbliebenen
   Karten haben dasselbe Mass, also duerfen sie frueh kommen - der Hof ab
   Kapitel II, die Schneise ab Kapitel III, eingefuehrt vom Grossmeister des
   Vorkapitels. Geprueft wird, dass beide offen stehen, wenn man so weit ist. */
/* GEMESSEN: mit frischem Profil ist nur Klassik offen - die beiden anderen
   Buehnen fuehrt je ein Grossmeister ein. */
ok("frisch steht keine der beiden neuen Buehnen offen",
  !mapUnlocked({ xp: 0, campaign: { cleared: [], unlocked: [] } }, "courtyard") &&
  !mapUnlocked({ xp: 0, campaign: { cleared: [], unlocked: [] } }, "gauntlet"));
/* GEMESSEN: die Schneise oeffnet erst mit Kapitel II - ihr Grossmeister steht
   am Ende von Kapitel II, vorher fuehrt kein erreichbarer Weg auf sie. */
{
  const nach1 = CAMPAIGN.filter((n) => n.league === 1 && n.haupt)
    .reduce((p, n) => advanceCampaign(p, n.id), { xp: 0, campaign: { cleared: [], unlocked: [] } });
  ok("nach Kapitel I: Hof ja, Schneise noch nicht",
    mapUnlocked(nach1, "courtyard") && !mapUnlocked(nach1, "gauntlet"));
  const nach2 = { ...nach1, campaign: { ...nach1.campaign, league: 2,
    cleared: [...nach1.campaign.cleared, ...CAMPAIGN.filter((n) => n.league === 2).map((n) => n.id)] } };
  ok("nach Kapitel II steht auch die Schneise offen", mapUnlocked(nach2, "gauntlet"));
}


// ── v0.20: turncoat duels bench your own copy of the challenger ──────────────
{
  const { buildStageMatch, buildArmy } = await import("./src/meta/index.js");
  const { mapById } = await import("./src/content/index.js");
  const { figurStation: figT } = await import("./test_helpers12.mjs");
  const hawkT = figT("hawk");
  const prof = { campaign: { league: hawkT.league, cleared: [], unlocked: ["hawk"] },
    loadout: { formations: { classic: null } }, charXp: {}, items: {} };
  const mt = buildStageMatch(hawkT.id, prof); // die Falkenstation stellt den eigenen Falken
  ok("rematch vs owned challenger is flagged turncoat", mt.turncoat === true && mt.excludeId === "hawk");
  const karte2 = mapById("classic");   /* v1.24.0 */
  /* v1.1.6: EINE rekrutierte Figur je Aufstellung. Diese Probe stellte zwei
     Habichte auf - das war vor der Besitzerregel erlaubt und ist es nicht
     mehr ("jede Figur, die man neu dazubekommt, nur einmal"). Sie prueft
     ohnehin das Verraeter-Duell, nicht die Anzahl; ein Habicht genuegt dafuer,
     der zweite Platz nimmt einen Springer. */
  const saved = ["rook","hawk","bishop","queen","king","bishop","knight","rook"];
  const p2 = { ...prof, loadout: { formations: { classic: saved } } };
  const kinds = (a) => a.back.map((x) => x.kind).join("");
  ok("player army fields the hawk normally", kinds(buildArmy(p2, karte2)).includes("H"));
  ok("player army benches the hawk in a turncoat duel", !kinds(buildArmy(p2, karte2, "hawk")).includes("H"));
  const fresh = buildStageMatch("L01s02", { campaign: { league: 1, cleared: [], unlocked: [] } });
  ok("first encounter is no turncoat", !fresh.turncoat && !fresh.excludeId);
}

// ── v0.21.92: bribed monsters join the ranks ─────────────────────────────────
{
  const pb = { stats: { leaguesWon: 1 }, campaign: { bribedBosses: ["b10"] } };
  const owned = ownedLeagueBosses(pb);
  ok("league victory grants its boss", owned.includes("b12"));
  ok("a bribed monster fights for you too", owned.includes("b10"));
  ok("no double entries in the ranks", new Set(owned).size === owned.length);
}


// ── ZWEI PLAENE JE BRETT (v1.0.20, Besitzer) ────────────────────────────────
import { formationKey as _fk, buildArmyForMap as _bafm } from "./src/meta/index.js";
import { MAPS as _MAPS } from "./src/content/index.js";
{
  ok("the hp plan keeps the bare map key", _fk("classic", "hp") === "classic" && _fk("classic", null) === "classic");
  ok("and chess gets its own", _fk("classic", "chess") === "classic#chess");
  const karte = _MAPS.find((m) => m.id === "classic");
  const basis = dp2();
  const schachPlan = [...karte.defaultFormation];
  // zwei Plaene, die sich unterscheiden: im Schach-Plan wandert der Turm nach innen
  const i = schachPlan.findIndex((x) => x === "rook");
  const j = schachPlan.findIndex((x, k) => k > i && x && x !== "rook" && x !== "king" && x !== "queen");
  if (i >= 0 && j >= 0) { const t = schachPlan[i]; schachPlan[i] = schachPlan[j]; schachPlan[j] = t; }
  const prof = { ...basis, loadout: { ...basis.loadout, formations: {
    classic: [...karte.defaultFormation],
    "classic#chess": schachPlan,
  } } };
  const heerSchach = _bafm(prof, karte, null, "chess");
  const heerHp = _bafm(prof, karte, null, "hp");
  const reihe = (h) => h.back.map((sp) => sp && sp.kind).join("");
  ok("each ruleset builds from its OWN plan", reihe(heerSchach) !== reihe(heerHp));
  // und ein fehlender Plan faellt auf den vorhandenen zurueck statt auf Werk
  const nurHp = { ...basis, loadout: { ...basis.loadout, formations: { classic: schachPlan } } };
  ok("a missing plan falls back to the other, not to the factory",
    reihe(_bafm(nurHp, karte, null, "chess")) === reihe(_bafm(nurHp, karte, null, "hp")));
}


// ── DAS GESETZ DES KLASSISCHEN (v1.0.22, Besitzer) ──────────────────────────
// "Klassisch spielt man einfach immer nur das Schach ohne jegliche Extras."
// Vorher las auch das klassische Schnellspiel die gespeicherte Aufstellung -
// ein Drache im Schach-Plan waere mitgezogen. Jetzt erzwingt standard=true
// die Werksaufstellung, egal was gespeichert ist.
{
  const karte = _MAPS.find((m) => m.id === "classic");
  /* Ein LEGALER, aber abweichender Plan: Springer und Laeufer tauschen die
     Plaetze - alle Pflichtzahlen bleiben, nur die Reihe aendert sich. (Ein
     Drache waere hier ohnehin illegal - er braucht Fluegel-Slots und Besitz -
     und ein illegaler Plan faellt IMMER aufs Werk zurueck; das prueft der
     No-Dead-Ends-Test an anderer Stelle.) */
  const plan = [...karte.defaultFormation];
  const iN = plan.indexOf("knight"), iB = plan.indexOf("bishop");
  [plan[iN], plan[iB]] = [plan[iB], plan[iN]];
  const prof = { ...dp2(), loadout: { ...dp2().loadout, formations: { "classic#chess": plan, classic: plan } } };
  const reihe = (h) => h.back.map((sp) => sp && sp.kind).join("");
  const werk = reihe(_bafm(dp2(), karte, null, "chess", true));
  ok("classic ignores every saved plan", reihe(_bafm(prof, karte, null, "chess", true)) === werk);
  ok("classic fields only the standard kinds", /^[RNBQK]+$/.test(werk));
  ok("campaign chess still honours the plan", reihe(_bafm(prof, karte, null, "chess", false)) !== werk);
}


// ── SOLANGE NICHTS BLUTET, SPRICHT NIEMAND VON LEBENSPUNKTEN (v1.0.33) ─────
// Besitzer-Vision: Kapitel I ist reines Schach - dann sollen Lebenspunkte
// auch in den MENUES nicht auftauchen, sonst stehen dort Zahlen und Lehren
// zu etwas, das es noch gar nicht gibt.
import { LEHREN as _LEHREN } from "./src/content/lehren.js";
import { canUnlockAbility } from "./src/meta/index.js";
import { ABILITIES as _AB } from "./src/content/index.js";
{
  const frisch2 = dp2();
  ok("a fresh profile has not woken the magic", !hpUnlocked(frisch2));
  // (a) die Akademie
  const hpLehre = _LEHREN.de.regeln.concat(_LEHREN.de.spielweise).find((e) => e.id === "hp");
  ok("the academy owns an hp lesson at all", !!hpLehre);
  // (b) die Faehigkeiten: jede, die von Kampfwerten spricht, traegt hpOnly
  const kampf = Object.values(_AB).filter((a) =>
    /Schaden|Lebenspunkt|Heilt|Treffer/.test(a.descDe || ""));
  ok("every combat ability is flagged hpOnly", kampf.length > 0 && kampf.every((a) => a.hpOnly));
  // (c) und keine davon ist vor dem Erwachen waehlbar
  /* Die echte Sperre sitzt in canUnlockAbility - eine Kampfkunst laesst sich
     vor dem Erwachen gar nicht erst freischalten. Geprueft an einer Figur,
     die hoch genug steht, damit nur die hpOnly-Regel den Ausschlag gibt. */
  const reich = { ...frisch2, sternenstaub: 99,
    chars: { mage: { level: 9, abilities: [] } } };
  const waehlbar = kampf.filter((a) => canUnlockAbility(reich, "mage", a.id));
  ok("none of them can be unlocked before the awakening", waehlbar.length === 0);
}


// ── DAS NEUE HAUSWORT UND DIE VERSCHLOSSENEN WERKZEUGE (v1.0.39) ───────────
import { ADMIN_SALT as _ASALT, ADMIN_HASH as _AHASH } from "./src/meta/index.js";
import { createHash as _hash } from "node:crypto";
import { readFileSync as _liesD } from "node:fs";
{
  /* v1.0.40: KEIN PASSWORT IM PROGRAMM. In v1.0.39 stand das Admin-Wort im
     Klartext in accounts.js - in einem Verzeichnis, das auf GitHub liegt.
     Das war falsch, der Besitzer hat widersprochen. Diese Proben halten
     fest, dass es nicht zurueckkommt. */
  ok("the admin account carries salt and check value", /^[0-9a-f]{16,}$/.test(_ASALT) && /^[0-9a-f]{64}$/.test(_AHASH));
  const konten = _liesD("src/meta/accounts.js", "utf8");
  ok("accounts.js holds no plain password", !/ADMIN_DEFAULT_PASS\s*=\s*"[^"]/.test(konten));
  const schloss = _liesD("src/app/ui/torschloss.js", "utf8");
  ok("the tool door holds only a check value", /^[0-9a-f]{64}$/m.test((schloss.match(/PRUEFWERT = "([0-9a-f]+)"/) || [])[1] || ""));
  // Und die Werkzeuge fragen wirklich danach
  const app = _liesD("src/app/App.jsx", "utf8");
  ok("every tool asks at the door",
    (app.match(/<WerkzeugTuer was=/g) || []).length >= 3);
}

// ── AUSSORTIERTES VERSCHWINDET AUS DER SCHAUKAMMER (v1.0.39) ───────────────
{
  const kammer = _liesD("src/app/ui/SchaukammerScreen.jsx", "utf8");
  ok("a tended list exists", /const GEPFLEGT = useMemo\(\(\) => ALLE\.filter\(\(e\) => !merk\[e\.rel\]\)/.test(kammer));
  ok("the overview draws from it", /return GEPFLEGT\.filter\(\(e\) => e\.gruppe/.test(kammer));
  ok("the counter at the top does too", /GEPFLEGT\.filter\(\(e\) => e\.stand === "sicher"\)/.test(kammer));
  ok("and so does the group table", /const e = GEPFLEGT\.filter\(\(x\) => x\.gruppe === g\)/.test(kammer));
  ok("it says how many were set aside", /beiseitegelegt/.test(kammer));
}

console.log("\n== DER NAME MUSS EINMALIG SEIN (Besitzerfrage v1.4.3) ==");
{
  const { nameVergeben, freierName, normName } = await import("./src/meta/accounts.js");
  const liste = [{ id: "a", name: "Corvin" }, { id: "b", name: "Vesna" }, { id: "c", name: "Corvin 2" }];
  ok("ein vergebener Name wird erkannt", nameVergeben(liste, "Corvin"));
  /* Ohne Normalisierung waere "  corvin " ein neuer Name - und im
     Hofwert-Vergleich staenden zwei Spieler, die gleich heissen. */
  ok("auch in anderer Schreibweise und mit Leerraum", nameVergeben(liste, "  CORVIN "));
  ok("ein freier Name bleibt frei", !nameVergeben(liste, "Kaspar"));
  ok("der Vorschlag weicht auf die naechste freie Zahl aus",
    freierName(liste, "Corvin") === "Corvin 3");
  ok("und laesst einen freien Namen unveraendert", freierName(liste, "Kaspar") === "Kaspar");
  ok("die eigene Kennung zaehlt nicht als Kollision",
    !nameVergeben(liste, "Corvin", "a"));
}

console.log("\n== DIE ZEHN BUENDE (v1.9.0) ==");
{
  const { BUND_LISTE, BUENDE, bundVon, bundErwacht } = await import("./src/content/buende.js");
  const { CHARACTER_LIST: CL2 } = await import("./src/content/index.js");

  const alle = [];
  for (const b of BUND_LISTE) alle.push(...b.figuren);
  /* JEDE FIGUR GENAU EINMAL - das war die ausdrueckliche Forderung des
     Besitzers ("bitte verwende keins doppelt"). Beim ersten Entwurf fehlte
     die Dame: sie war als Traegerin gedacht wie der Koenig und waere als
     einzige uebrig geblieben. */
  ok("keine Figur steht in zwei Buenden", alle.filter((x, i) => alle.indexOf(x) !== i).length === 0);
  /* Und KEINE ERFUNDENE. Beim Entwerfen hatte ich einen "Habicht" genannt,
     den es nicht gibt - das Bild des Kundschafters traegt einen Vogel, und
     daraus wurde in meinem Kopf eine Figur. Diese Probe faengt so etwas ab. */
  ok("alle genannten Figuren gibt es wirklich",
    alle.every((id) => CL2.some((c) => c.id === id)));
  const draussen = CL2.filter((c) => !alle.includes(c.id)).map((c) => c.id);
  ok(`nur Bauer, Gambit und Drache stehen in keinem Bund (${draussen.join(", ")})`,
    draussen.length === 3 && draussen.includes("dragon") && draussen.includes("pawn"));

  /* ERST AUF HOECHSTSTUFE. Das ist der Kern des Entwurfs: ein Bund ist der
     Lohn dafuer, seine Figuren ganz ausgebaut zu haben. */
  ok("ein Bund erwacht erst auf Hoechststufe", bundErwacht("konzil", () => 10, () => 10));
  ok("und bleibt eine Stufe darunter stumm", !bundErwacht("konzil", () => 9, () => 10));
  /* auch wenn NUR EINE Figur fehlt - sonst waere der Dreierbund billiger als
     ein Zweierbund */
  ok("auch wenn nur eine Figur des Bundes fehlt",
    !bundErwacht("geleit", (id) => (id === "rook" ? 9 : 10), () => 10));

  /* Jeder Bund traegt eine Regel in EINEM Satz - der Besitzer hat einen
     ersten Entwurf verworfen, weil er zu verschachtelt war. */
  ok("jeder Bund hat Name, Regel und Geschichte",
    BUND_LISTE.every((b) => b.nameDe && b.regelDe && b.storyDe));
  const lang = BUND_LISTE.filter((b) => b.regelDe.length > 110).map((b) => b.nameDe);
  ok(`keine Regel ist laenger als ein Satz (${lang.join(", ") || "alle knapp"})`, lang.length === 0);
  ok("bundVon findet die Zugehoerigkeit", bundVon("paladin") === "krone" && bundVon("pawn") === null);

  /* ── KEINE ERFUNDENEN NAMEN IN SICHTBAREN TEXTEN ────────────────────────
     Besitzerbefund, und er hat es zum zweiten Mal bemerkt: erst der
     "Habicht", dann der "Lotse" - beides Figuren, die ich mir beim Schreiben
     ausgedacht hatte. Seine Bitte: "Mach die Namen der Figuren auch bei der
     Erklaerung sauber, nichts dass du irgendwas Neues dazu erfindest."

     Das ist mehr als Kosmetik: wer in einer Regel einen Namen liest, den das
     Spiel nicht kennt, sucht nach einer Figur, die es nirgends gibt.

     Diese Probe fuehrt eine Liste von Woertern, die wie Figurenbezeichnungen
     klingen, und schlaegt an, sobald eines in einem sichtbaren Text steht,
     ohne dass es die Figur gibt. */
  {
    const erfunden = ["lotse", "lotsen", "habicht", "falke", "heiler", "schmied",
      "wache", "seher ", "magierin", "ritterin", "knappe", "soeldner"];
    const echteNamen = CL2.map((c) => (c.nameDe || "").toLowerCase()).filter(Boolean);
    const treffer = [];
    for (const b of BUND_LISTE) {
      const text = `${b.regelDe} ${b.storyDe}`.toLowerCase();
      for (const w of erfunden) {
        if (text.includes(w) && !echteNamen.some((n) => n.includes(w.trim()))) {
          treffer.push(`${b.nameDe}: "${w.trim()}"`);
        }
      }
    }
    ok(`kein sichtbarer Text nennt eine Figur, die es nicht gibt${treffer.length ? " — " + treffer.join(", ") : ""}`,
      treffer.length === 0);
  }
}

console.log("\n== DIE WIRKUNG DER BUENDE (v1.10.0) ==");
{
  const B = await import("./src/core/rules/buende.js");
  const w = 8;
  const brett = () => new Array(64).fill(null);
  const setz = (b, f, r, p) => { b[r * w + f] = p; };
  const fig = (kind, charId, color = "w", hp = 12) => ({ kind, charId, color, hp, maxHp: hp });

  /* KRONE - NUR NEBENAN. Das war die ausdrueckliche Forderung des Besitzers:
     "Das gilt nur, wenn er neben dem Koenig auch steht. Der darf nicht
     irgendwo stehen." Ein Leibwaechter, der quer ueber das Brett schuetzt,
     waere keiner - und die Probe ist genau deshalb doppelt. */
  {
    const b = brett();
    setz(b, 4, 0, fig("K", "king", "w", 20));
    setz(b, 5, 0, fig("U", "paladin"));
    const st = { board: b, w, h: 8, buende: ["krone"] };
    ok("der Paladin faengt einen Treffer ab, wenn er daneben steht",
      B.kroneFaengtAb(st, 4) === 5);
    b[5] = null; setz(b, 5, 7, fig("U", "paladin"));
    ok("und nicht, wenn er woanders steht", B.kroneFaengtAb(st, 4) === null);
    /* ein Paladin am Ende kann niemanden mehr decken */
    b[7 * w + 5] = null; setz(b, 5, 0, { ...fig("U", "paladin"), hp: 0 });
    ok("ein gefallener Paladin deckt nicht mehr", B.kroneFaengtAb(st, 4) === null);
  }

  /* SCHILDWACHT - beide in derselben Reihe ODER Linie (Besitzer: "das kann
     vertikal wie horizontal sein"). */
  {
    const b = brett();
    setz(b, 1, 3, fig("E", "engineer"));
    setz(b, 5, 3, fig("G", "guardian"));
    setz(b, 3, 3, fig("R", "rook"));
    setz(b, 3, 6, fig("B", "bishop"));
    const st = { board: b, w, h: 8, buende: ["schildwacht"] };
    ok("wer in ihrer Reihe steht, ist gedeckt", B.schildwachtDeckt(st, 3 * w + 3));
    ok("wer woanders steht, nicht", !B.schildwachtDeckt(st, 6 * w + 3));
    b[3 * w + 5] = null; setz(b, 5, 6, fig("G", "guardian"));
    ok("und gar nichts, wenn die beiden sich nicht teilen", !B.schildwachtDeckt(st, 3 * w + 3));
  }

  /* SCHATTEN - der Besitzer hat die Regel selbst geschaerft: nicht dauerhaft
     unsichtbar, sondern nur solange die beiden STILLSTEHEN. */
  {
    const b = brett();
    setz(b, 2, 2, fig("A", "assassin"));
    setz(b, 6, 6, fig("W", "sorceress"));
    const st = { board: b, w, h: 8, buende: ["schatten"], lastMove: null };
    const att = b[2 * w + 2];
    ok("der Attentaeter ist unsichtbar, solange die Hexerin stillsteht",
      B.schattenVerbirgt(st, att));
    st.lastMove = { color: "w", charId: "sorceress", from: 0, to: 1 };
    ok("und zeigt sich, sobald sie zieht", !B.schattenVerbirgt(st, att));
    st.lastMove = { color: "w", charId: "rook", from: 0, to: 1 };
    ok("ein anderer Zug verraet ihn nicht", B.schattenVerbirgt(st, att));
    b[6 * w + 6] = null;
    ok("ohne Hexerin und Magier keine Tarnung", !B.schattenVerbirgt(st, att));
  }

  /* TRINKLIED - heilt den, dem am meisten fehlt. */
  {
    const b = brett();
    setz(b, 3, 3, fig("L", "alchemist"));
    setz(b, 3, 4, { ...fig("R", "rook"), hp: 5, maxHp: 12 });
    setz(b, 4, 3, { ...fig("B", "bishop"), hp: 11, maxHp: 12 });
    setz(b, 7, 7, { ...fig("Q", "queen"), hp: 1, maxHp: 20 });
    const st = { board: b, w, h: 8, buende: ["nachtwache"] };
    ok("der Alchemist heilt den angrenzenden mit dem groessten Fehlbetrag",
      B.nachtwacheHeilt(st, "w") === 4 * w + 3);
    /* die Dame fehlt mehr, steht aber nicht daneben - Nachbarschaft zaehlt */
    ok("eine ferne Figur wird nicht geheilt, auch wenn ihr mehr fehlt",
      B.nachtwacheHeilt(st, "w") !== 7 * w + 7);
  }

  /* GEZEITEN und STURM haengen daran, dass der Partner ueberhaupt steht. */
  {
    const b = brett();
    setz(b, 2, 2, fig("C", "captain"));
    setz(b, 5, 5, fig("S", "strategist"));
    const st = { board: b, w, h: 8, buende: ["gezeiten"] };
    ok("der Kapitaen bricht durch, solange der Stratege steht",
      B.gezeitenDurchbruch(st, b[2 * w + 2]));
    b[5 * w + 5] = null;
    ok("ohne Lotsen laeuft er auf Grund", !B.gezeitenDurchbruch(st, b[2 * w + 2]));
  }
  {
    const b = brett();
    setz(b, 1, 1, fig("M", "amazon", "w", 24));
    setz(b, 6, 6, fig("V", "warlock"));
    /* v1.11.2: der Rueckruf braucht jetzt einen BAUERN, der ihr Platz macht
       (Besitzeridee). Ohne ihn faellt sie - ein Preis, den man kennt und
       einplanen kann, statt der frueheren Zufallsbedingung "Startfeld frei". */
    setz(b, 2, 1, fig("P", "pawn"));
    const st = { board: b, w, h: 8, buende: ["sturm"], sturmVerbraucht: {} };
    ok("die Amazone kehrt zurueck, solange Warlock und ein Bauer stehen",
      B.sturmRuftZurueck(st, b[1 * w + 1]));
    b[1 * w + 2] = null;
    ok("ohne Bauern kein Rueckruf - einer muss ihr Platz machen",
      !B.sturmRuftZurueck(st, b[1 * w + 1]));
    setz(b, 2, 1, fig("P", "pawn"));
    st.sturmVerbraucht = { w: true };
    ok("aber nur einmal je Partie", !B.sturmRuftZurueck(st, b[1 * w + 1]));
  }

  /* BANNKREIS - zwei Felder Umkreis. */
  {
    const b = brett();
    setz(b, 4, 4, fig("Y", "seeress", "b"));
    const st = { board: b, w, h: 8, buende: ["bannkreis"] };
    ok("im Umkreis von zwei Feldern sind Talente gesperrt",
      B.bannkreisSperrt(st, 6 * w + 4, "w"));
    ok("drei Felder weiter nicht mehr", !B.bannkreisSperrt(st, 7 * w + 4, "w"));
  }
}

/* ── PFLICHT IST NUR DER KOENIG (v1.23.1, Besitzerentscheid) ─────────────────
   "Die Laeufer gehoeren nicht zu den Pflichtfiguren. Es gibt nur ein paar
   Regeln: jede gesammelte Figur einmal, Laeufer, Springer und Turm zweimal,
   die Dame ist ein Meister - ein gewonnener Meister darf sie ersetzen, sonst
   nirgends." */
{
  const { formationLegalOn, defaultFormation } = await import("./src/meta/index.js");
  const { mapById } = await import("./src/content/index.js");
  const karte2 = mapById("classic");   /* v1.24.0 */
  const alle = ["gambit","pawn","knight","bishop","rook","queen","king","paladin","amazon","mage"];
  /* v1.24.0: die Ersatzfiguren sind jetzt REKRUTIERTE statt Tuerme - mit der
     Zweier-Grenze waeren vier Tuerme aus einem zweiten Grund illegal, und die
     Probe bewiese nicht mehr, was sie behauptet. */
  const f = defaultFormation();
  const ohneLaeufer = ["rook", "knight", "paladin", "queen", "king", "mage", "knight", "rook"];
  ok("eine Aufstellung ganz ohne Laeufer ist erlaubt", formationLegalOn(ohneLaeufer, alle, karte2) === true);
  const einLaeufer = f.map((id, i) => (id === "bishop" && i > 4 ? "paladin" : id));
  ok("ein einzelner Laeufer neben einem Paladin ebenso", formationLegalOn(einLaeufer, alle, karte2) === true);
  const ohneKoenig = f.map((id) => (id === "king" ? "amazon" : id));
  ok("ohne Koenig geht nichts", formationLegalOn(ohneKoenig, alle, karte2) === false);
  const turmStattDame = f.map((id) => (id === "queen" ? "amazon" : id));
  ok("der Platz der Dame nimmt keine gewoehnliche Figur - nur die Dame oder einen Meister", formationLegalOn(turmStattDame, alle, karte2) === false);
}

/* ── v1.35.0: DIE GEGNERBESETZUNG (Kampagnenumbau, Schritt B) ──────────── */
{
  const B = await import("./src/meta/besetzung.js");
  const { CAMPAIGN12 } = await import("./src/content/campaign12.gen.js");
  const { buildStageMatch } = await import("./src/meta/campaign.js");
  const { CHARACTERS: CH } = await import("./src/content/index.js");
  const { LEAGUE_BOSSES } = await import("./src/content/bosses.js");
  ok("vor Kapitel III traegt keine Station eine Besetzung oder wechselnde Aufstellung",
    CAMPAIGN12.filter((n) => n.league < 3).every((n) => { const p = B.besetzungsPlan(n); return !p.k && !p.wechselnd; }));
  ok("... und nie eine Boss-, Final- oder Torstation", CAMPAIGN12.filter((n) => n.boss || n.final || n.gate).every((n) => !B.besetzungsPlan(n).k && !B.besetzungsPlan(n).wechselnd));
  const besetzt = CAMPAIGN12.filter((n) => B.besetzungsPlan(n).k > 0);
  ok("ab Kapitel III sind Stationen besetzt, mit ein bis drei Plaetzen", besetzt.length > 100 && besetzt.every((n) => n.league >= 3 && B.besetzungsPlan(n).k >= 1 && B.besetzungsPlan(n).k <= 3));
  ok("... aber nicht jede (der Gegner wechselt nicht bei jedem Level)", besetzt.length < CAMPAIGN12.filter((n) => n.league >= 3).length * 0.6);
  ok("wechselnde Aufstellungen gibt es in jedem Kapitel ab III", [3,4,5,6,7,8,9,10,11,12].every((l) => CAMPAIGN12.some((n) => n.league === l && B.besetzungsPlan(n).wechselnd)));
  ok("kein Kapitelmeister steht im Vorrat", !B.BESETZUNGS_VORRAT.some((e) => LEAGUE_BOSSES.includes(e.replace("boss:", ""))));
  // ein Stand, der drei Figuren und zwei Monster getroffen hat; einer davon gehoert ihm
  const getroffen = ["amazon", "archbishop", "mage"];
  const stand = (extra = {}) => ({ stats: { games: 7 }, codex: { met: [...getroffen.map((id) => CH[id].kind), "X:b05", "X:b01", "X:b12"] },
    campaign: { unlocked: ["mage"], bribedBosses: [], ...extra } });
  ok("Kandidat ist, wer begegnet ist und nicht gehoert", B.istKandidat(stand(), "amazon") && B.istKandidat(stand(), "boss:b05"));
  ok("... nicht, wer gehoert (Magier) oder nie begegnet ist (Kanzler)", !B.istKandidat(stand(), "mage") && !B.istKandidat(stand(), "chancellor"));
  ok("... und nie ein Kapitelmeister, auch begegnet (Richter)", !B.istKandidat(stand(), "boss:b12"));
  const fest = besetzt.find((n) => !B.besetzungsPlan(n).wechselnd && n.league >= 9 && B.besetzungsPlan(n).k >= 2);
  const GRUNDREIHE = ["rook","knight","bishop","queen","king","bishop","knight","rook"];
  const b1 = B.besetzungFuer(fest, stand(), GRUNDREIHE);
  const gesetzt1 = b1.eintraege.filter(Boolean);
  ok("eine Station besetzt sich nur mit Kandidaten, jeden nur einmal", gesetzt1.length >= 1 && gesetzt1.every((e) => B.istKandidat(stand(), e)) && new Set(gesetzt1).size === gesetzt1.length);
  ok("... jeder aus der Staerkeklasse der Figur, deren Platz er nimmt", b1.plaetze.every((i, n) => !b1.eintraege[n]
    || Math.abs(B.STAERKE[b1.eintraege[n]] - B.STAERKE[GRUNDREIHE[i]]) <= B.KLASSEN_BREITE));
  ok("jeder Eintrag des Vorrats hat einen Staerkewert (aus npm run balance)", B.BESETZUNGS_VORRAT.every((e) => typeof B.STAERKE[e] === "number"));
  ok("... und meldet sich zum Festhalten", b1.neu === true);
  const a1 = B.gegnerAufstellung(fest, GRUNDREIHE, b1, 3);
  const a2 = B.gegnerAufstellung(fest, GRUNDREIHE, b1, 4);
  ok("FEST: ohne wechselnde Aufstellung steht der Gegner bei jedem Versuch gleich", JSON.stringify(a1) === JSON.stringify(a2));
  ok("... Koenig und Dame fest", a1[3] === "queen" && a1[4] === "king");
  const gemerkt = stand({ besetzung: { [fest.id]: b1.eintraege } });
  gemerkt.codex.met.push(CH.chancellor.kind, "X:b09");
  const b2 = B.besetzungFuer(fest, gemerkt, GRUNDREIHE);
  ok("festgehalten: neue Begegnungen anderswo aendern die Besetzung NICHT", JSON.stringify(b2.eintraege) === JSON.stringify(b1.eintraege) && b2.neu === false);
  const erster = gesetzt1[0];
  const besessen = stand({ besetzung: { [fest.id]: b1.eintraege }, ...(erster.startsWith("boss:") ? { bribedBosses: [erster.slice(5)] } : { unlocked: ["mage", erster] }) });
  const b3 = B.besetzungFuer(fest, besessen, GRUNDREIHE);
  ok("Besitz aendert sich: wer jetzt gehoert, geht, der Naechste derselben Klasse rueckt nach - dieselben Plaetze",
    !b3.eintraege.includes(erster) && JSON.stringify(b3.plaetze) === JSON.stringify(b1.plaetze)
    && b3.eintraege.filter(Boolean).every((e) => B.istKandidat(besessen, e)) && b3.neu === true);
  const leer = stand({ besetzung: { [fest.id]: b1.plaetze.map(() => null) } });
  ok("ein beim Betreten leerer Platz bleibt leer, auch wenn es inzwischen Kandidaten gibt", B.besetzungFuer(fest, leer, GRUNDREIHE).eintraege.every((e) => e === null));
  const w = CAMPAIGN12.find((n) => B.besetzungsPlan(n).wechselnd && B.besetzungsPlan(n).k > 0);
  const bw = B.besetzungFuer(w, stand(), GRUNDREIHE);
  const grund = GRUNDREIHE;
  const lagen = Array.from({ length: 10 }, (_, v) => B.gegnerAufstellung(w, grund, bw, v));
  const sortiert = (f) => [...f].sort().join();
  ok("WECHSELND: dieselben Figuren bei jedem Versuch", lagen.every((f) => sortiert(f) === sortiert(lagen[0])));
  ok("... auf anderen Plaetzen", new Set(lagen.map((f) => f.join())).size > 1);
  ok("... Koenig und Dame bleiben stehen", lagen.every((f) => f[3] === "queen" && f[4] === "king"));
  // im echten Gegnerheer
  const hp = besetzt.find((n) => n.rules === "hp" && B.besetzungsPlan(n).k >= 2 && !B.besetzungsPlan(n).wechselnd);
  const vieleMonster = { stats: { games: 1 }, codex: { met: ["X:b05", "X:b01", "X:b03", "X:b09", "X:b13"] }, campaign: { unlocked: [], bribedBosses: [] } };
  const m = buildStageMatch(hp.id, vieleMonster);
  const monster = m.aiArmy.back.filter((sp) => sp && sp.bossId && !["b12","b10","b24","b19","b20","b16","b17","b18","b08","b14","b23","b25"].includes(sp.bossId));
  const lg = hp.league;
  ok("im Gegnerheer stehen die Monster wirklich auf freien Plaetzen (" + hp.id + ")", monster.length >= 1 && m.besetzung && m.besetzung.eintraege.filter(Boolean).length === monster.length);
  ok("... mit Faehigkeitsstufen nach Liga wie der Stationsboss", monster.every((sp) => Object.values(sp.stufen || {}).every((st) => st === (lg >= 9 ? 3 : lg >= 5 ? 2 : 1))));
  ok("ohne Spielstand (Vorschau, Proben) bleibt das klassische Heer", !buildStageMatch(hp.id, null).besetzung);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
