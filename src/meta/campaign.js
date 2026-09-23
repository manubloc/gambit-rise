// ── Campaign progression (meta) — BRANCHING GRAPH ────────────────────────────
// Progress lives on the profile as campaign: { cleared: [nodeIds], unlocked:
// [charIds] }. A node is AVAILABLE when any predecessor is cleared (the start
// node always is). Clearing a piece-boss node unlocks that piece — the only way
// to gain new pieces. XP is a spendable currency for upgrades (leveling.js).
import { PLACE_NAMES } from "../content/placeNames.js";
import { placeEn } from "../content/placeNamesEn.js";
import { CAMPAIGN, nodeById, difficultyById, mapById, bossById, bossSpec, CHARACTERS, leagueBossId } from "../content/index.js";
import { buildArmyFromFormation, resolveCharacter, spForXpJump, isUnlocked, monsterStufen } from "./leveling.js";
import { hasItem } from "../content/items.js";
import { BASE_HP, BASE_ATK } from "../core/index.js";
import { besetzungsPlan, besetzungFuer, gegnerAufstellung } from "./besetzung.js";
import { GAST_STATIONEN } from "./gast.js";   /* v1.46.0 */

export const campaignLength = (profile = null) =>
  profile ? CAMPAIGN.filter((n) => nodeInLeague(n, profile.campaign?.league)).length : CAMPAIGN.length;
export const clearedIds = (profile) => profile?.campaign?.cleared || [];
export const clearedCount = (profile) => clearedIds(profile).length;

/** Progressive supply chest: an item shows up in the shop only once the
 *  journey has reached it — by league, and within its league by stages
 *  cleared. Before that it sits in the chest as a veiled mystery. */
export function itemRevealed(profile, item) {
  // Was nur unter HP-Regeln wirkt, existiert vor dem Erwachen nicht einmal
  // als Gedanke: Kapitel I ist bis zur Mitte reines Schach, und ein
  // Lebenstrank ohne Lebenspunkte waere eine Luege im Laden.
  if (item.needsHp && !hpUnlocked(profile)) return false;
  const lg = profile?.campaign?.league || 1;
  const min = item.minLeague || 1;
  if (lg > min) return true;
  if (lg < min) return false;
  return clearedCount(profile) >= (item.minCleared || 0);
}

// reverse edges, computed once
const PREDS = (() => {
  const m = {};
  for (const n of CAMPAIGN) for (const t of n.next) (m[t] = m[t] || []).push(n.id);
  return m;
})();
export const predsOf = (id) => PREDS[id] || [];

export const leagueNo = (league) => ((Math.max(1, league || 1) - 1) % 12) + 1;
/** League-bound sites (the combo paths) only exist in their own climate. */
export const nodeInLeague = (node, league) => !node.league || node.league === leagueNo(league);
/** Gates come as "item", { item, piece } or { gold } (a toll) — normalize. */
export const gateOf = (node) => !node?.gate ? null
  : typeof node.gate === "string" ? { item: node.gate, piece: null, gold: null }
  : { item: node.gate.item || null, piece: node.gate.piece || null, gold: node.gate.gold || null };
export const gateSatisfied = (profile, node) => {
  const g = gateOf(node);
  if (!g) return true;
  if (g.gold) return (profile?.campaign?.tolls || []).includes(node.id);
  if (!hasItem(profile, g.item)) return false;
  if (g.piece && !isUnlocked(CHARACTERS[g.piece], profile)) return false;
  return true;
};

/** Gold a stage pays on a FIRST clear — the deeper the road and the bigger
 *  the boss, the heavier the purse. End bosses simply carry more gold.
 *  Scales with the league; replays pay half (handled by the caller). */
export const stageGold = (node, league = 1) =>
  Math.round((5 + 2 * (node.row || 0) + (node.boss ? 6 : 0) + (node.boss?.pure ? 6 : 0) + (node.reward?.gold || 0)) * leagueRewardMult(league));

/** Tolls scale with the league — every climate has its own gatekeeper. */
export const tollCost = (node, league = 1) => {
  const g = gateOf(node);
  return g?.gold ? Math.round(g.gold * leagueRewardMult(league)) : 0;
};
/** Pay a toll gate: gold changes hands, the path opens (for this league). */
export function payToll(profile, id) {
  const node = nodeById(id);
  const g = gateOf(node);
  if (!g?.gold) return profile;
  const paid = profile.campaign?.tolls || [];
  if (paid.includes(id)) return profile;
  const cost = tollCost(node, profile.campaign?.league || 1);
  if ((profile.gold || 0) < cost) return profile;
  return { ...profile, gold: (profile.gold || 0) - cost,
    campaign: { ...(profile.campaign || {}), tolls: [...paid, id] } };
}

export function nodeStatus(profile, id) {
  const node = nodeById(id);
  if (!node) return "hidden"; // eine Station, die es nicht gibt, existiert nicht
  if (!nodeInLeague(node, profile?.campaign?.league)) return "hidden";
  /* v1.46.0: DER GAST SIEHT KAPITEL I, SPIELT ABER NUR VIER STATIONEN.
     Der Rest bleibt sichtbar und verschlossen - so sieht man, dass es
     weitergeht, und weiss, wofuer sich ein Konto lohnt. */
  if (profile?.gast && !GAST_STATIONEN.includes(id)) {
    return (profile?.campaign?.cleared || []).includes(id) ? "cleared" : "locked";
  }
  const cleared = new Set(clearedIds(profile));
  if (cleared.has(id)) return "cleared";
  const preds = predsOf(id);
  const reached = preds.length === 0 || preds.some((p) => cleared.has(p));
  if (!reached) return "locked";
  if (!gateSatisfied(profile, node)) return "gated"; // reachable, but the path wants its key (and companion)
  return "available";
}
/** The "front line": first available node in map order (for default selection). */
export function currentNodeId(profile) {
  for (const n of CAMPAIGN) if (nodeStatus(profile, n.id) === "available") return n.id;
  return CAMPAIGN[CAMPAIGN.length - 1].id;
}

/** Quick-play unlocks ride on campaign reach (available or cleared). */
const reachableUses = (profile, pred) =>
  CAMPAIGN.some((n) => pred(n) && ["available", "cleared", "gated"].includes(nodeStatus(profile, n.id)));
export const mapUnlocked = (profile, mapId) =>
  mapId === "classic" || reachableUses(profile, (n) => n.map === mapId);
export const hpUnlocked = (profile) => reachableUses(profile, (n) => n.rules === "hp");

// ── Boss construction ─────────────────────────────────────────────────────────
// Tier scales piece-boss stats: modest early, fearsome late — but bounded.
const HP_BOOST = [0, 5, 7, 9, 11];
const ATK_BOOST = [0, 0, 1, 1, 2];

/** The boss army-spec for a node: a unique monster or the BOSS VERSION of an
 *  unlockable piece (same movement — fighting it teaches you the piece). */
export function nodeBossSpec(node, league = 1) {
  node = { ...node, boss: effectiveNodeBoss(node, league) };  // the Hoard hatches late
  if (!node.boss) return null;
  if (node.boss.pure) {
    // Monster-Stationen rotieren ihren Champion mit dem Weltdurchlauf; der
    // Kapitel-Endboss steht seit den zwoelf Graphen direkt am Knoten.
    const rot = node.boss.rotation;
    // Die Rotation zaehlt den WELTDURCHLAUF: erste Runde stellt den ersten
    // Champion, die zweite Weltrunde den naechsten - nicht das Kapitel.
    const lap = Math.floor((Math.max(1, league) - 1) / 12);
    const pid = rot ? rot[lap % rot.length] : node.boss.pure;
    return bossSpec(bossById(pid) || bossById(node.boss.pure));
  }
  const ch = CHARACTERS[node.boss.piece];
  const tier = node.tier || 1;
  const { abilities } = resolveCharacter(ch, 1 + tier); // a taste of its ladder
  return {
    kind: ch.kind, level: 1, abilities, shield: 0,
    hp: (BASE_HP[ch.kind] || 3) + HP_BOOST[tier],
    atk: Math.min(6, (BASE_ATK[ch.kind] || 2) + ATK_BOOST[tier]),
    ...(ch.moveSpec ? { moveSpec: ch.moveSpec } : {}),
    ...(ch.big ? { big: true } : {}), // the Dragon of the Hoard spreads across his 2x2 block like any dragon
    name: { de: ch.nameDe, en: ch.nameEn }, bossId: "pb_" + ch.id, accent: "#c9a45c",
  };
}

/** Resolve a node id into a ready-to-play match spec. The boss replaces the
 *  enemy QUEEN slot (the king always stays on the board). */
/** THE DRAGON COMES LATER: his 2x2 form is a new machine, so the Hoard only
 *  holds him from League II on. In League I the warm nest belongs to the
 *  BROODMOTHER — the ancient heart has not hatched yet. */

/** The station's name in the given league — unique across the whole journey.
 *  League I uses the homeland names from CAMPAIGN; II–XI draw from PLACE_NAMES,
 *  each set hand-written from that biome's lore (see content/placeNames.js). */
/** Seit den zwoelf Graphen traegt jede Station ihren festen eigenen Namen -
 *  Weltdurchlaeufe benennen nichts mehr um. */
export function placeFor(node, _lg, en = false) {
  /* v1.0.15 (Besitzer): DIE STATIONEN SPRECHEN ENGLISCH. Der zweite
     Parameter ist historisch (Liga) und wird nicht mehr gebraucht - er
     bleibt in der Signatur, damit die bestehenden Aufrufe stimmen. */
  const de = node?.place || "";
  return en ? placeEn(de) : de;
}

export function effectiveNodeBoss(node, lg) {
  if (node?.id === "a4" && (lg || 1) < 2) return { pure: "b03" };
  return node?.boss;
}

const A4_L1_STORY = {
  de: "Im Drachenhort ist es warm — zu warm. Die Brutmutter hütet hier ein Gelege, das noch niemand schlüpfen sah. Noch nicht.",
  en: "The Dragon Hoard is warm - too warm. The Broodmother tends a clutch here that no one has seen hatch. Not yet.",
};

export function buildStageMatch(id, profile = null, leagueOverride = null) {
  const node = nodeById(id);
  // THE PLAYER'S OWN DIAL: a campaign-wide difficulty offset shifts each
  // station's built-in level up or down (-1 gentler … 0 as designed … +1
  // harder). It never drops below easy nor past hard. Set under Profile.
  const TIERS = ["easy", "normal", "hard"];
  const off = { gentle: -1, normal: 0, brutal: 1 }[profile?.campDifficulty || "normal"] ?? 0;
  const baseIdx = Math.max(0, TIERS.indexOf(node.difficulty));
  const tunedTier = TIERS[Math.max(0, Math.min(TIERS.length - 1, baseIdx + off))];
  const d = difficultyById(tunedTier);
  // LOOKING BACK (leagueOverride): a mastered league replays as it WAS — maps,
  // foes and bosses scale to that old league, and every station is a friendly:
  // no first-clear, no progression, just the road walked once more.
  const looking = leagueOverride != null;
  /* ── DAS KAPITEL GEHOERT DER STATION (v1.1.2, Besitzerbefund) ─────────────
     "Ich teste ueber die Werkbank Kapitel zwoelf. Jetzt moechte ich zurueck
     in ein anderes Kapitel und dort ein Level starten - und dann startet er
     mir immer das Level von dem, was ich ueber die Werkbank ausgewaehlt
     habe. Liegt es an der Werkbank oder an einem Bug?"

     ES IST EIN BUG, und zwar hier: das Kapitel kam aus dem PROFIL. Solange
     man vorwaerts spielt, stimmen Profilkapitel und Stationskapitel ueberein
     und nichts faellt auf. Weichen sie ab - ueber die Werkbank, oder wenn man
     auf der Karte in ein frueheres Kapitel zurueckblaettert -, dann wurde die
     Station mit den Werten des PROFILKAPITELS gebaut: falsche Karte, falsch
     skalierte Gegner, falscher Meister. Jede Station traegt ihr Kapitel aber
     selbst (node.league, geprueft an CAMPAIGN12: L03s00 -> 3, L12s00 -> 12).
     Sie ist die richtige Quelle; das Profil ist nur noch der Rueckfall, wenn
     eine Station ihr Kapitel nicht kennt. */
  const lgStation = node.league ?? node.liga ?? profile?.campaign?.league ?? 1;
  /* WELTRUNDEN BLEIBEN ERHALTEN. Die Bestien rotieren mit jeder Runde um die
     Welt (Liga 13 ist Kapitel 1 der zweiten Runde), und das haengt zu Recht
     am Spielerstand, nicht an der Station. Die Runde faellt aus der
     Profilliga heraus und wird auf das STATIONSKAPITEL aufgeschlagen: eine
     Station aus Kapitel 3 in der zweiten Runde ist Liga 15 - Kapitel-3-Karte
     und -Skalierung, aber das Monster der zweiten Runde. So bleibt beides
     richtig, was vorher in einer Zahl steckte und sich widersprach. */
  const runde = Math.floor(((profile?.campaign?.league ?? 1) - 1) / 12);
  const lgMap = looking ? leagueOverride : lgStation;
  const lgBestie = looking ? leagueOverride : lgStation + runde * 12;
  const mapId = effectiveMap(node, lgMap);
  const map = mapById(mapId);
  // CLASSIC boards mean classic chess: NO level bumps for the AI either —
  // Strength follows the RULESET: pure chess stays vanilla (level 1), an HP
  // battle scales by difficulty + league even on the classic 8x8 field. This
  // used to key off map.classic, which wrongly kept HP fights on the classic
  // board at level 1 against a leveled player.
  const chess = node.rules === "chess";
  const base = chess ? () => 1 : (cid) => d.levels[cid] || 1;
  const lg = lgMap;
  const boss0 = nodeBossSpec(node, lgBestie);   // v1.1.2: Bestien nach Weltrunde, Karte nach Station
  const recruitId = bossPieceFor(node, lg);
  /* v1.35.0: DIE GEGNERBESETZUNG (Schritt B, besetzung.js). Ab Kapitel III
     ruecken begegnete, nicht eigene Figuren und Monster auf freie Plaetze;
     an Stationen mit wechselnder Aufstellung stehen sie bei jedem Versuch
     anders. Nicht beim Rueckblick (looking) und nicht ohne Spielstand. Wer
     schon auf dem Damenplatz steht (Stationsboss), rueckt nicht nach. */
  const plan = besetzungsPlan(node);
  const besetzung = profile && !looking
    ? besetzungFuer(node, profile, node.formation || map.defaultFormation, [boss0?.bossId ? "boss:" + boss0.bossId : null, recruitId].filter(Boolean)) : null;
  const formation = profile && !looking
    ? gegnerAufstellung(node, node.formation || map.defaultFormation, besetzung, profile?.stats?.games || 0)
    : (node.formation || map.defaultFormation);
  /* wer einen freien Platz einnimmt, erbt dessen Stufe - die Schwierigkeit
     kennt Stufen nur fuer die Grundfiguren, sonst stuende ein Fremder auf
     Stufe 1 neben einem Springer auf 3 (gemessen: das besetzte Heer war so
     SCHWAECHER als das klassische) */
  const platzStufe = Math.max(base("rook"), base("bishop"), base("knight"));
  const gesetzt = new Set((besetzung?.eintraege || []).filter((e) => e && !e.startsWith("boss:")));
  const aiArmy = buildArmyFromFormation((cid) => chess ? 1 : (gesetzt.has(cid) ? platzStufe : base(cid)) + (node.bump || 0) + leagueBump(lgMap), formation);
  /* ein Monster auf einem freien Platz waechst in seinen Faehigkeiten mit der
     Liga wie der Stationsboss (I in 1-4, II in 5-8, III ab 9) */
  aiArmy.back = aiArmy.back.map((sp) => (sp && sp.bossId ? { ...sp, stufen: monsterStufen(sp.abilities || [], lg >= 9 ? 3 : lg >= 5 ? 2 : 1) } : sp));
  const boss1 = boss0 && lg > 1 ? { ...boss0, hp: boss0.hp + 2 * (lg - 1), atk: boss0.atk + (lg - 1) } : boss0;
  /* v1.30.0: die eigenen Faehigkeiten des Monsters wachsen mit der Liga:
     Stufe I in Liga 1-4, II in 5-8, III ab Liga 9 */
  const boss = boss1 && { ...boss1, stufen: monsterStufen(boss1.abilities, lg >= 9 ? 3 : lg >= 5 ? 2 : 1) };
  let bossInfo = null;
  if (boss) {
    let qi = formation.indexOf("queen");
    if (qi === -1) qi = Math.max(0, Math.floor(formation.length / 2) - 1);
    // Ein GROSSER Drache entfaltet sich beim Aufbau auf die Nachbarspalte
    // einwaerts und raeumt sie leer - stuende dort der Koenig, waere die
    // Partie vor dem ersten Zug verloren. Also einen Slot waehlen, dessen
    // Entfaltung den Koenig verschont.
    if (boss.kind === "D") {
      const w2 = formation.length;
      const ki = aiArmy.back.findIndex((sp) => sp.kind === "K");
      const inward = (q) => (q < w2 - 1 ? q + 1 : q - 1);
      if (qi === ki || inward(qi) === ki)
        for (let j = 0; j < w2; j++) if (j !== ki && inward(j) !== ki) { qi = j; break; }
    }
    aiArmy.back = aiArmy.back.map((spec, j) => (j === qi ? boss : spec));
    bossInfo = { name: boss.name, bossId: boss.bossId, unlocks: looking ? null : recruitOnWin(node, profile),
      art: boss.art || null, accent: boss.accent, kind: boss.kind };
  }
  const turncoat = !!(recruitId && profile && (profile.campaign?.unlocked || []).includes(recruitId));
  return {
    nodeId: id,
    /* v1.35.0: was die Besetzung brauchte - App haelt sie beim Betreten fest */
    besetzung, wechselnd: plan.wechselnd,
    map: mapId, rules: node.rules,
    /* v1.1.5 (Besitzerbefund, nach zwei Fehlversuchen endlich am richtigen
       Ort): DER KAMPF TRAEGT SEIN KAPITEL. "Ich wechsle es ueber die
       Weltkarte, waehle das erste Level aus - und dann erscheint beim Starten
       des Kampfes das Level aus dem Meer."

       Gemessen: buildStageMatch gab KEIN Feld league zurueck. Der
       Spielbildschirm fragt aber an vier Stellen danach - Brettgrund,
       Feldfarben, Kapitelbild - und schreibt jedes Mal
       `match?.league || profile.campaign.league`. Ohne das Feld griff also
       IMMER das Profil: wer ueber die Werkbank in Kapitel 12 stand, sah das
       Meer, egal welche Station er auf der Karte anklickte. Die Regeln und
       Gegner waren seit v1.1.2 richtig - nur die Optik log. Jetzt steht das
       Kapitel im Kampf, und zwar dasselbe, mit dem er gebaut wurde. */
    league: lgMap,
    node: (node.id === "a4" && lg < 2) ? { ...node, storyDe: A4_L1_STORY.de, storyEn: A4_L1_STORY.en } : node,
    boss: bossInfo,
    turncoat, excludeId: turncoat ? recruitId : null,
    // classic boards trade level bumps for a sharper mind in later leagues
    depth: Math.min(3, (node.depth || d.depth) + (map.classic && lg >= 3 ? 1 : 0)),
    aiArmy,
    timer: looking ? null : stageTimer(node, lg),
    gold: stageGold(node, lg),
    firstClear: looking ? false : (profile ? nodeStatus(profile, id) === "available" : true),
    // a FRIENDLY: the station is cleared and one of your own holds the post —
    // a recruited champion, or the fallen Grandmaster in his keep. In the
    // look-back, EVERY station replays as a friendly.
    friendly: looking || (!!profile && nodeStatus(profile, id) === "cleared"
      && (!!bossPieceFor(node, lg) && (profile.campaign?.unlocked || []).includes(bossPieceFor(node, lg)))),
    reward: node.reward || { xp: 0 },
  };
}

/** Clearing an AVAILABLE node grants bonus XP (spendable + lifetime) and moves
 *  the front line. Every boss victory — replays included — notches the win
 *  tally of its piece; the piece joins once the tally reaches its `wins`
 *  demand (default 1: joins on the first victory). Champions who fall short
 *  of your court flee the map; the tally survives league rollovers. */
export function advanceCampaign(profile, id) {
  const st = nodeStatus(profile, id);
  const node = nodeById(id);
  if (!node) return profile;
  const league = profile.campaign?.league || 1;
  const firstClear = st === "available";
  const bossReplay = !!node.boss && st === "cleared";
  if (!firstClear && !bossReplay) return profile;

  const unlocked = new Set(profile.campaign?.unlocked || []);
  const dupes = { ...(profile.campaign?.dupes || {}) };
  const bossWins = { ...(profile.campaign?.bossWins || {}) };
  const stats = { ...(profile.stats || {}) };
  const bossPiece = node.boss ? bossPieceFor(node, league) : null;
  let joined = false;
  if (bossPiece) {
    bossWins[bossPiece] = (bossWins[bossPiece] || 0) + 1;
    if (unlocked.has(bossPiece)) {
      if (firstClear) dupes[bossPiece] = Math.min(2, (dupes[bossPiece] || 0) + 1);
    } else if (bossWins[bossPiece] >= winsNeeded(node, profile?.campaign?.league || 1)) {
      unlocked.add(bossPiece);
      joined = true;
      stats.recruits = (stats.recruits || 0) + 1;
    }
  }
  if (!firstClear) {
    // a pure replay: only the tally (and a possible late recruit) moves —
    // EXCEPT a friendly match against one of your OWN (a recruited champion,
    // or the fallen Grandmaster holding his keep), which still pays a
    // quarter of the station's XP (gold is halved in applyResult)
    const friendlyXp = ((bossPiece && unlocked.has(bossPiece) && !joined) || nodeById(id)?.final)
      ? Math.round((node.reward?.xp || 0) * leagueRewardMult(league) * 0.25) : 0;
    return { ...profile, stats, xpEarned: (profile.xpEarned || 0) + friendlyXp,
      campaign: { ...(profile.campaign || {}), unlocked: [...unlocked], dupes, bossWins } };
  }

  const mult = leagueRewardMult(league);
  const bonus = Math.round((node.reward?.xp || 0) * mult);
  // NOTE (v0.5): stage gold is granted through applyResult (visible in the
  // result banner) — advanceCampaign only handles progress, XP and recruits.
  stats.stagesCleared = (stats.stagesCleared || 0) + 1;
  if (node.boss) stats.bossKills = (stats.bossKills || 0) + 1;
  const xpEarned = (profile.xpEarned || 0) + bonus;
  stats.xpEarned = xpEarned;
  const spGain = spForXpJump(profile.xpEarned || 0, xpEarned);
  let items = profile.items;
  if (node.grant === "potion") items = { ...(items || {}), potion: Math.min(3, ((items || {}).potion || 0) + 1) };
  const finished = !!nodeById(id)?.final; // der Kapitel-Endboss faellt — die Karte BLEIBT; the
  // gate to the next league opens up in the corner (advanceLeague), no rematch
  if (finished) stats.leaguesWon = (stats.leaguesWon || 0) + 1;
  return {
    ...profile,
    items,
    xp: xpEarned,
    sp: (profile.sp || 0) + spGain,
    xpEarned,
    stats,
    campaign: { league, cleared: [...clearedIds(profile), id], unlocked: [...unlocked], dupes, bossWins, tolls: profile.campaign?.tolls || [] },
  };
}

/** Step through the gate: the Grandmaster already yielded, so the next
 *  league begins WITHOUT a rematch — court, tallies and dupes travel along,
 *  clears and paid tolls reset with the new climate. */
export function advanceLeague(profile) {
  const fin = CAMPAIGN.find((n) => n.final && nodeInLeague(n, profile?.campaign?.league));
  if (!fin || nodeStatus(profile, fin.id) !== "cleared") return profile;
  const league = profile.campaign?.league || 1;
  return { ...profile, campaign: { league: league + 1, cleared: [],
    unlocked: [...(profile.campaign?.unlocked || [])], dupes: { ...(profile.campaign?.dupes || {}) },
    bossWins: { ...(profile.campaign?.bossWins || {}) }, tolls: [] } };
}

/** Seit den zwoelf Kapitel-Graphen vergeben die Stationen ihre Figuren
 *  selbst - der Kapitaen sitzt auf einem Seitenpfad in Kapitel VI. Die
 *  Funktion bleibt fuer alte Aufrufer stehen und sagt schlicht: nein. */
export const leagueFinalBossPiece = () => null;
export const bossPieceFor = (node, league) => effectiveNodeBoss(node, league)?.piece || null;

/** Some champions take convincing: `wins` on the boss is how many victories it
 *  takes before the piece joins (default 1). The tally lives on the profile
 *  (campaign.bossWins, per piece) and survives league rollovers — every
 *  victory over that boss counts, replays included. */
export const winsNeeded = (node, lg = 1) => effectiveNodeBoss(node, lg)?.wins || 1;
export const bossWinsFor = (profile, pieceId) => (profile?.campaign?.bossWins || {})[pieceId] || 0;
/** The recruit THIS victory would seal — null while the champion still resists. */
export function recruitOnWin(node, profile) {
  const pieceId = node?.boss ? bossPieceFor(node, profile?.campaign?.league || 1) : null;
  if (!pieceId || (profile?.campaign?.unlocked || []).includes(pieceId)) return null;
  return bossWinsFor(profile, pieceId) + 1 >= winsNeeded(node, profile?.campaign?.league || 1) ? pieceId : null;
}
export const seaAccessible = (profile) =>
  (profile?.campaign?.unlocked || []).includes("captain") && hasItem(profile, "boat");

/** Rewards & foes both scale with the league you are climbing. */
export const leagueRewardMult = (league) => 1 + 0.5 * ((league || 1) - 1);
export const leagueBump = (league) => 2 * ((league || 1) - 1);

/* v1.24.0: DREI BUEHNEN, EINE NACH DER ANDEREN. Arena und Scharmuetzel sind
   gestrichen (siehe content/maps.js), also ruecken Hof und Schneise nach vorn:
   Kapitel I ist reines Klassik, ab II kommt der Hof dazu, ab III die Schneise.
   Der Grossmeister des Vorkapitels zeigt die neue Buehne jeweils zuerst. */
export function effectiveMap(node, league = 1) {
  if (!node) return "classic";
  if (node.final) return node.map; // das Kapitelfinale behaelt seine Buehne
  const lg = leagueNo(league);
  if (lg >= 3) return node.map;
  const allowed = lg === 1 ? ["classic"] : ["classic", "courtyard"];
  return allowed.includes(node.map) ? node.map : "classic";
}

/** Time pressure (v0.4): from league 5 onward SOME stages carry a clock —
 *  the monster milestones (pure bosses, incl. the Citadel) grant a total
 *  time budget, the elite piece bosses (bump ≥ 2) a per-move limit. Both
 *  tighten each league but stay bounded, so they remain winnable. The clock
 *  is UI-side only (a flagged loss on timeout); the deterministic core stays
 *  untouched. */
export function stageTimer(node, league = 1) {
  const lg = league || 1;
  if (lg < 5 || !node || !node.boss) return null;
  if (node.boss.pure) return { type: "total", seconds: Math.max(180, 360 - 30 * (lg - 5)) };
  if ((node.bump || 0) >= 2) return { type: "move", seconds: Math.max(12, 20 - (lg - 5)) };
  return null;
}
