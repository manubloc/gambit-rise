import { KIND, VALUE, BASE_HP, BASE_ATK } from "../core/index.js";
import { DEFAULT_BACK_RANK, FLANK_SLOTS } from "../core/index.js";
import { bossById, bossSpec, LEAGUE_BOSSES } from "../content/bosses.js";
import { CHARACTERS, CHARACTER_LIST, KIND_TO_CHAR } from "../content/index.js";
import { difficultyById, mapById, MAPS } from "../content/index.js";
import { ABILITIES, CAMPAIGN } from "../content/index.js";

/* IST DIE ALTE MAGIE ERWACHT? Kapitel I laeuft bis zur Mitte nach reinen
   Schachregeln; Lebenspunkte gibt es erst ab dem Erwachen. Bewusst OHNE
   Rueckgriff auf meta/campaign.js gerechnet - das wuerde einen Importkreis
   schliessen. Dieselbe Schwelle wie hpUnlocked dort: eine HP-Station ist
   ERREICHT, sobald sie selbst geschafft ist oder von einer geschafften
   Station aus offensteht. */
export function hpWach(profile) {
  const erledigt = profile?.campaign?.cleared || [];
  if (!erledigt.length) return false;          // vor dem ersten Sieg schlaeft alles
  const fertig = new Set(erledigt);
  for (const n of CAMPAIGN) {
    if (n.rules === "hp" && fertig.has(n.id)) return true;
    if (fertig.has(n.id) && (n.next || []).some((t) => {
      const z = CAMPAIGN.find((m) => m.id === t);
      return z && z.rules === "hp";
    })) return true;
  }
  return false;
}

/* IST DER GRAND GAMBIT ERWACHT? (v0.81, Besitzerentscheid)
   Die Geschichte beginnt OHNE Helden. Die ersten Gefechte sind schlichtes
   Schach: ein Bauer wie jeder andere, kein eigener Name, kein eigenes
   Gesicht - er taucht auch im Hofstaat nicht auf. Erst wenn drei Stationen
   gefallen sind, merkt dieser eine Bauer, dass er ein anderer sein will:
   er erwacht, hebt sich eine Stufe (und traegt darum ab jetzt Kapuze, Stab
   und Klinge statt der Bauernkutte) - und von da an beginnt die Story um
   ihn. Vorher gibt es ihn schlicht nicht.

   Bewusst an der ZAHL DER GESCHAFFTEN STATIONEN gemessen, nicht an einer
   bestimmten Station: dann bleibt der Moment auch dann heil, wenn die
   Kampagne spaeter umgebaut wird. */
/* ── DER GAMBIT STEHT VON ANFANG AN (v1.0.49, Besitzerentscheid) ───────────
   Bis hierher trat der Held erst nach drei geschafften Stationen auf. Das
   war als Bruch gedacht - aber der Gambit ist die Figur, die auf der KARTE
   die ganze Zeit zu sehen ist, und der Spieler soll vom ersten Zug an
   wissen, welcher seiner Bauern er ist. Ein Held, den man erst kennenlernt,
   nachdem man ihn dreimal aufs Feld geschickt hat, erklaert sich zu spaet.

   Null heisst: er ist da, sobald das Heer steht. Der goldene Ritter zwischen
   den blauen Speertraegern ist damit das Erkennungszeichen, das in v1.0.45
   noch die gruenen Bauern tragen sollten.

   Die Schwelle bleibt als KONSTANTE stehen und wird weiter geprueft - wer
   sie je wieder anheben will, aendert eine Zahl, nicht eine Regel. */
export const GAMBIT_ERWACHT_AB = 0;
export function gambitWach(profile) {
  const erledigt = profile?.campaign?.cleared || [];
  return erledigt.length >= GAMBIT_ERWACHT_AB;
}

// ── XP curves ───────────────────────────────────────────────────────────────
export const charXpForLevel = (n) => (n <= 1 ? 0 : Math.round(40 * Math.pow(n - 1, 1.7)));
export const playerXpForLevel = (n) => (n <= 1 ? 0 : Math.round(60 * Math.pow(n - 1, 1.45)));

function levelForXp(xp, curve) { let n = 1; while (curve(n + 1) <= xp) n++; return n; }
export const charLevelForXp = (xp) => levelForXp(xp || 0, charXpForLevel);
export const playerLevelForXp = (xp) => levelForXp(xp || 0, playerXpForLevel);

function progress(xp, curve) {
  const level = levelForXp(xp || 0, curve);
  const cur = curve(level), next = curve(level + 1);
  return { level, into: (xp || 0) - cur, span: next - cur, pct: ((xp || 0) - cur) / (next - cur) };
}
export const charXpProgress = (xp) => progress(xp, charXpForLevel);
export const spForXpJump = (fromXp, toXp) =>
  SP_PER_PLAYER_LEVEL * Math.max(0, playerLevelForXp(toXp) - playerLevelForXp(fromXp));
export const playerXpProgress = (xp) => progress(xp, playerXpForLevel);

// ── Character resolution ──────────────────────────────────────────────────────
/** Abilities + shields at a level. Shields are passive and come with the level;
 *  ABILITIES are a conscious choice: pass the player's purchased list (`chosen`)
 *  to resolve exactly those (still gated by level). `chosen = null` = full
 *  ladder — used for AI armies and boss previews. */
export function resolveCharacter(char, level, chosen = null) {
  let shield = 0; const abilities = [];
  for (const e of char.ladder) if (e.level <= level) {
    if (e.shield) shield += e.shield;
    if (e.ability && (chosen === null || chosen.includes(e.ability))) abilities.push(e.ability);
  }
  return { abilities, shield };
}
export const chosenAbilities = (profile, charId) => (profile?.pieces?.abilities?.[charId]) || [];
export const characterLevel = (profile, charId) => profile?.pieces?.levels?.[charId] || 1;

// ── Upgrade economy: XP is a spendable currency ──────────────────────────────
export const MAX_PIECE_LEVEL = 10;
// The hero alone climbs THREE tiers of ten (Stufe I/II/III → level 30). Each
// tier is earned prestige: own portrait + a quiet aura, visible only to the
// player and on the map — never to the opponent.
/* ── v1.24.0: ZWANZIG STUFEN, NICHT SECHZIG (Besitzer, mehrfach) ───────────
   "Ein Gambit soll keine 60 Stufen haben. Es dürfen maximal 20 sein."

   GEMESSEN, warum das nicht nur Kosmetik ist: die Werte skalieren am
   VERHAELTNIS Stufe/Hoechststufe. Der Gambit stand damit auf Stufe 60 bei
   hp 17 / atk 7 - genau da, wo ein Bauer auf Stufe 10 steht. Der Weg dorthin
   kostete ihn aber 328 Fertigkeitspunkte gegen 9 beim Bauern, Faktor 36 fuer
   dasselbe Ziel. Sechzig Stufen waren also kein Vorteil, sondern eine Strafe.

   Mit zwanzig Stufen laeuft dieselbe Kurve in zwanzig Schritten: Stufe 5
   hp 5/atk 2, Stufe 10 hp 9/atk 4, Stufe 20 hp 17/atk 7. Er bleibt der Held
   ueber die Schilde und die sechs Raenge, nicht ueber eine laengere Leiter.

   DIE SECHS RAENGE BLEIBEN ALLE ERREICHBAR: sie haengen nicht mehr an
   Zehnerbloecken, sondern verteilen sich auf die zwanzig Stufen -
   I 1-3, II 4-6, III 7-10, IV 11-13, V 14-16, VI 17-20. Sonst waeren vier
   der sechs Gemaelde (gambit-t3 bis t6) nie zu sehen.

   DIE KOSTEN: vorher 2/3/4/6/8/10 je Rang, was die 328 ergab. Jetzt
   2/2/3/3/4/4 - in Summe 59 SP fuer alle neunzehn Schritte, also rund das
   Sechsfache eines Bauern. Ein Heldenaufschlag, keine Mauer. */
export const GAMBIT_MAX_LEVEL = 20;
export const maxLevelFor = (charId) => (charId === "gambit" ? GAMBIT_MAX_LEVEL : MAX_PIECE_LEVEL);
export const gambitTier = (level) =>
  Math.min(6, Math.max(1, Math.ceil(Math.max(1, level) * 6 / GAMBIT_MAX_LEVEL)));
export const GAMBIT_STEP_COST = [2, 2, 3, 3, 4, 4];
/** SKILL POINTS are the piece currency: earned per player level (and by
 *  claiming achievements), spent deliberately on levels + abilities.
 *  Cost per level step follows the piece's board value. */
export const SP_PER_PLAYER_LEVEL = 3;
export const skillPoints = (profile) => profile?.sp || 0;
export const upgradeCost = (charId, level = null) => {
  if (charId === "gambit" && level != null)
    return GAMBIT_STEP_COST[gambitTier(level + 1) - 1]; // the NEXT step's tier sets the price
  const ch = CHARACTERS[charId];
  const v = Math.min(ch?.costValue ?? (VALUE[ch?.kind] || 100), 1000);
  return v <= 150 ? 1 : v <= 450 ? 2 : v <= 700 ? 3 : 4; // pawn 1 · minor 2 · rook 3 · queen/king 4
};
export const canUpgrade = (profile, charId) => {
  const l = characterLevel(profile, charId);
  return l < maxLevelFor(charId) && skillPoints(profile) >= upgradeCost(charId, l);
};

// ── Star shards: bottled skill points, rationed by league ─────────────────
// Two shards lie in the court's vault per league you have reached; each one
// grinds down into a single skill point. Gold buys them, the road unlocks them.
export const SP_SHARD_GOLD = 45;
export const SP_VAULT_MIN_CLEARED = 3; // the vault opens after the third victory
export const SP_SHARDS_PER_LEAGUE = 2;
export function spShardCap(profile) { return SP_SHARDS_PER_LEAGUE * (profile.campaign?.league || 1); }
export function buySpShard(profile) {
  const bought = profile.spShards || 0;
  if (bought >= spShardCap(profile) || (profile.gold || 0) < SP_SHARD_GOLD) return profile;
  return { ...profile, gold: (profile.gold || 0) - SP_SHARD_GOLD, sp: (profile.sp || 0) + 1, spShards: bought + 1 };
}

export function upgradePiece(profile, charId) {
  const l = characterLevel(profile, charId);
  if (l >= maxLevelFor(charId)) return profile;
  const cost = upgradeCost(charId, l);
  if (skillPoints(profile) < cost) return profile;
  const stats = { ...(profile.stats || {}) };
  stats.upgrades = (stats.upgrades || 0) + 1;
  return { ...profile, sp: profile.sp - cost, stats,
    pieces: { ...(profile.pieces || {}), levels: { ...((profile.pieces || {}).levels || {}), [charId]: l + 1 } } };
}

// ── Abilities are bought deliberately: save up, then choose ──────────────────
export const abilityCost = (reqLevel) => Math.ceil(reqLevel / 2); // L3→2 · L5→3 · L7→4 · L9→5 SP
export function canUnlockAbility(profile, charId, abilityId) {
  const ch = CHARACTERS[charId];
  const rung = ch?.ladder.find((e) => e.ability === abilityId);
  if (!rung) return false;
  // Talente, die nur an Lebenspunkten wirken, schlafen bis zum Erwachen der
  // alten Magie - sonst verbrennt ein Spieler in der Schachhaelfte von
  // Kapitel I Sternenstaub fuer eine Wirkung, die es noch nicht gibt.
  if (ABILITIES[abilityId]?.hpOnly && !hpWach(profile)) return false;
  if (chosenAbilities(profile, charId).includes(abilityId)) return false;
  if (characterLevel(profile, charId) < rung.level) return false;
  return skillPoints(profile) >= abilityCost(rung.level);
}
export function unlockAbility(profile, charId, abilityId) {
  if (!canUnlockAbility(profile, charId, abilityId)) return profile;
  const rung = CHARACTERS[charId].ladder.find((e) => e.ability === abilityId);
  const pieces = profile.pieces || {};
  const abilities = { ...(pieces.abilities || {}) };
  abilities[charId] = [...(abilities[charId] || []), abilityId];
  const stats = { ...(profile.stats || {}) };
  stats.abilitiesUnlocked = (stats.abilitiesUnlocked || 0) + 1;
  return { ...profile, sp: profile.sp - abilityCost(rung.level), stats, pieces: { ...pieces, abilities } };
}
/** Vergessen kostet einen VERGESSENSTRANK (Händler, steigender Preis) —
 *  nicht mehr die alte 15-Gold-Gebühr. Der Trank wird verbraucht, jede
 *  ausgegebene ✦ kehrt zurück. RESPEC_GOLD bleibt exportiert (historisch). */
export const RESPEC_GOLD = 15;
export function respecPiece(profile, charId) {
  const list = chosenAbilities(profile, charId);
  const trank = profile?.items?.vergessenstrank || 0;
  if (!list.length || trank < 1) return profile;
  const ch = CHARACTERS[charId];
  const refund = list.reduce((a, id) => a + abilityCost(ch.ladder.find((e) => e.ability === id)?.level || 1), 0);
  const abilities = { ...((profile.pieces || {}).abilities || {}) };
  delete abilities[charId];
  return { ...profile, items: { ...(profile.items || {}), vergessenstrank: trank - 1 },
    sp: (profile.sp || 0) + refund,
    pieces: { ...(profile.pieces || {}), abilities } };
}

/** The next ladder entry above `level` (for "next reward" UI), or null. */
export function nextReward(char, level) {
  for (const e of char.ladder) if (e.level > level) return e;
  return null;
}

// ── Unlocks ───────────────────────────────────────────────────────────────────
// New pieces are unlocked ONLY by defeating their end boss on the campaign map.
export const isUnlocked = (char, profile) =>
  char.unlock.type === "start" || (profile?.campaign?.unlocked || []).includes(char.id);
export const unlockedCharacterIds = (profile) => CHARACTER_LIST.filter((c) => isUnlocked(c, profile)).map((c) => c.id);

// ── Army building ─────────────────────────────────────────────────────────────
/** Build an army from a level lookup and a flank assignment ([slot2, slot7]). */
export function buildArmyFrom(levelOf, flank = ["knight", "knight"], chosenOf = null, boostOf = null) {
  const back = DEFAULT_BACK_RANK.map((kind, f) => {
    let charId = KIND_TO_CHAR[kind];
    const slot = FLANK_SLOTS.indexOf(f);
    if (slot >= 0 && flank[slot]) charId = flank[slot];
    const char = CHARACTERS[charId];
    const level = Math.max(1, levelOf(charId) || 1);
    const { abilities, shield } = resolveCharacter(char, level, chosenOf ? chosenOf(charId) : null);
    return { kind: char.kind, level, abilities, shield, ...boostSpec(char, boostOf && boostOf(charId)), ...(char.moveSpec ? { moveSpec: char.moveSpec } : {}), ...(char.big ? { big: true } : {}) };
  });
  const pl = Math.max(1, levelOf("pawn") || 1);
  const pr = resolveCharacter(CHARACTERS.pawn, pl, chosenOf ? chosenOf("pawn") : null);
  return { back, pawn: { kind: KIND.PAWN, level: pl, tier: pawnTier(pl), abilities: pr.abilities, shield: pr.shield, ...boostSpec(CHARACTERS.pawn, boostOf && boostOf("pawn")) } };
}

/** League duplication: extra recruit copies harden a piece (+1 HP each, +1 ATK at ★2). */
export const dupeCount = (profile, charId) => (profile?.campaign?.dupes?.[charId]) || 0;
function boostSpec(char, dupes) {
  const d = Math.min(dupes || 0, 2);
  if (!d) return {};
  return { baseHp: (BASE_HP[char.kind] || 1) + d, baseAtk: (BASE_ATK[char.kind] || 1) + (d >= 2 ? 1 : 0) };
}

// ── Formation (custom back rank) ──────────────────────────────────────────────
const BACK_SIZE = DEFAULT_BACK_RANK.length; // 8 (v1.24.3)
// The fixed-count heavy pieces every legal formation must contain (positionable,
// but not multipliable — this keeps material balanced without a points budget).
export const FORMATION_REQUIRED = { king: 1, queen: 1 };   /* v1.23.1: der Laeufer ist keine Pflicht mehr (Besitzer) */
// The remaining slots are "flex": a knight or any unlocked flank-eligible fairy.
/* v1.23.1: der Laeufer ist keine Pflicht mehr, also frei besetzbar wie Turm und Springer */
export const FORMATION_FLEX = new Set([...CHARACTER_LIST.filter((c) => c.flank).map((c) => c.id), "bishop"]);
export const FORMATION_FLEX_COUNT = BACK_SIZE - Object.values(FORMATION_REQUIRED).reduce((a, b) => a + b, 0); // 4

/** The standard back rank expressed as character ids (the default formation). */
export const defaultFormation = () => DEFAULT_BACK_RANK.map((k) => KIND_TO_CHAR[k]);

export function formationCounts(formation) {
  const c = {};
  for (const id of formation || []) if (id != null) c[id] = (c[id] || 0) + 1;
  return c;
}

/** Legal if it uses only unlocked back-rank pieces, has exactly the required
 *  heavy-piece counts, and fills the rest from the flex pool. */
export function formationLegal(formation, unlockedIds) {
  if (!Array.isArray(formation) || formation.length !== BACK_SIZE) return false;
  const unlocked = new Set(unlockedIds);
  // THE BIG DRAGON: only at the very edge; the slot beside him stays EMPTY
  // (null) — his wing claims it. One dragon per army.
  const dLeft = formation[0] === "dragon", dRight = formation[BACK_SIZE - 1] === "dragon";
  const wingIdx = dLeft ? 1 : dRight ? BACK_SIZE - 2 : -1;
  if (formation.includes("dragon") && !dLeft && !dRight) return false;
  if (dLeft && dRight) return false;
  let flex = 0;
  for (let i = 0; i < formation.length; i++) {
    const id = formation[i];
    if (id == null) { if (i !== wingIdx) return false; continue; }  // only the wing slot may be empty
    const ch = CHARACTERS[id];
    if (!ch || ch.kind === KIND.PAWN || !unlocked.has(id)) return false;
    if (FORMATION_REQUIRED[id] === undefined) {
      if (!FORMATION_FLEX.has(id)) return false;
      flex++;
    }
  }
  if (wingIdx >= 0 && formation[wingIdx] != null) return false;
  // the crown keeps its squares here too (same law, fixed 10-wide rank)
  const cs10 = crownSlots(BACK_SIZE);
  if (formation[cs10.king] !== "king" || formation[cs10.queen] !== "queen") return false;
  const c = formationCounts(formation);
  for (const [id, n] of Object.entries(FORMATION_REQUIRED)) if ((c[id] || 0) !== n) return false;
  return flex === FORMATION_FLEX_COUNT - (wingIdx >= 0 ? 1 : 0);
}

/** Build an army from an explicit back-rank formation (array of character ids). */
// ── League bosses in YOUR ranks ──────────────────────────────────────────────
// Beating a league wins you its boss. A formation entry "boss:bXX" fields him
// in place of the queen — one boss at most; his AURA then serves YOUR side.
export const ownedLeagueBosses = (profile) => {
  const won = LEAGUE_BOSSES.slice(0, Math.min(LEAGUE_BOSSES.length, profile?.stats?.leaguesWon || 0));
  // monsters BOUGHT with gold and a crown sacrifice fight for you too
  const bribed = profile?.campaign?.bribedBosses || [];
  return [...new Set([...won, ...bribed])];
};
export const isBossEntry = (id) => typeof id === "string" && id.startsWith("boss:");
export const bossEntryId = (id) => (isBossEntry(id) ? id.slice(5) : null);

// ── DAS STUFENWERK DER BESTIEN (v0.38.2) ────────────────────────────────────
// EIN Gesetz fuer alle Familien: fuenf Raenge, jeder Rang +1 Leben, Rang 3
// und 5 je +1 Angriffskraft. Die Kosten steigen UEBERPROPORTIONAL (3, 5, 7,
// 9 Skillpunkte) - die Bestien lernen langsamer als der Hof, dafuer wiegt
// jeder Rang schwerer. Gespeichert unter pieces.bossLevels[bXX].
export const BOSS_MAX_LEVEL = 5;
export const bossLevelOf = (profile, bossId) => Math.max(1, Math.min(BOSS_MAX_LEVEL, profile?.pieces?.bossLevels?.[bossId] || 1));
export const bossUpgradeCost = (level) => 1 + 2 * level;   // 2->3, 3->5, 4->7, 5->9
/* ── DAS ZIELPROFIL JEDER MONSTERART (v1.23.0, Besitzer) ─────────────────────
   "Alle Figuren, die man spielen kann und die gegen einen spielen, sollten in
   maximalster Form alle Sachen abdecken." Gemessen vorher: 25 Monster
   zwischen 19 und 39 % Blau, Budgets 14 bis 29 - dieselbe Enge wie bei den
   Figuren vor v1.22.0. Jetzt dasselbe Budget wie jede Figur (24 auf der
   Hoechststufe 5), verteilt von Bollwerk bis Klinge:
     Bollwerk  - Koloss, Hueter, Bollwerk, Waechter
     Standhaft - Brutmutter, Lanzenmeister, Osric, Richter, Seuchenkoenig
     Ausgewogen- Doppelritter, Eisenfaust, Asra, Wandlerin, Blutmagd, Kanonier
     Klinge    - Fluesterin, Schleicher, Streuner, Hetzer, Schattenfuerst,
                 Skorpion, Sturmklaue, Zerreisser, Brandstifter, Geist
   Das Wachstum laeuft linear vom Grundwert zum Ziel. */
export const BOSS_BUDGET = 24;
export const ZIEL_PROFIL_BOSS = {
  b14: [21, 3], b20: [20, 4], b06: [20, 4], b01: [19, 5],
  b03: [17, 7], b17: [17, 7], b25: [16, 8], b12: [16, 8], b24: [16, 8],
  b10: [13, 11], b18: [12, 12], b23: [12, 12], b21: [13, 11], b16: [11, 13], b08: [10, 14],
  b11: [8, 16], b04: [8, 16], b05: [9, 15], b02: [7, 17], b19: [7, 17], b09: [6, 18], b15: [6, 18], b22: [5, 19], b13: [5, 19], b07: [4, 20],
};
/* ── v1.26.1: DAS MONSTER WAECHST IN SEINE WERTE HINEIN ────────────────────
   Besitzer: "Warum haben die Monster schon von Beginn an so viel Leben? Das
   macht keinen Sinn."

   GEFUNDEN: diese Funktion ADDIERTE auf die Werte aus bosses.js - die sind
   aber seit v1.25.5 die Werte der HOECHSTSTUFE (24 Punkte, wie bei jeder
   eigenen Figur). Ein Monster stand damit auf Stufe 1 schon voll da und wuchs
   darueber hinaus. Bei einer eigenen Figur ist es umgekehrt: werteBeiStufe
   rechnet vom Verhaeltnis Stufe zu Hoechststufe herunter.

   JETZT GENAUSO: die Datenwerte sind das Ziel, und das Monster waechst von
   START_ANTEIL auf 100 % ueber seine fuenf Stufen. Gerundet wird erst das
   Leben, dann der Angriff als Rest - sonst ergeben zwei Aufrundungen 25
   statt der beschlossenen 24. */
const START_ANTEIL = 0.4;   // Stufe 1 traegt 40 % des Punktebudgets
export function bossSpecLeveled(b, level) {
  const spec = bossSpec(b);
  const l = Math.max(1, Math.min(BOSS_MAX_LEVEL, level || 1));
  const ziel = ZIEL_PROFIL_BOSS[b.id];
  const vollHp = ziel ? ziel[0] : spec.hp;
  const vollAtk = ziel ? ziel[1] : spec.atk;
  const t = (l - 1) / Math.max(1, BOSS_MAX_LEVEL - 1);
  const anteil = START_ANTEIL + (1 - START_ANTEIL) * t;
  const ganz = Math.max(1, Math.round((vollHp + vollAtk) * anteil));
  const hp = Math.max(1, Math.round(ganz * vollHp / Math.max(1, vollHp + vollAtk)));
  const atk = Math.max(1, ganz - hp);
  return { ...spec, level: l, hp, maxHp: hp, atk };
}

export function upgradeBoss(profile, bossId) {
  const owned = new Set([...ownedLeagueBosses(profile), ...(profile.campaign?.bribedBosses || [])]);
  if (!owned.has(bossId)) return profile;
  const lvl = bossLevelOf(profile, bossId);
  if (lvl >= BOSS_MAX_LEVEL) return profile;
  const cost = bossUpgradeCost(lvl + 1);
  if ((profile.sp || 0) < cost) return profile;
  const pieces = { ...(profile.pieces || {}) };
  pieces.bossLevels = { ...(pieces.bossLevels || {}), [bossId]: lvl + 1 };
  return { ...profile, sp: profile.sp - cost, pieces };
}

/* v1.0.62 (Besitzer): DIE BAUERN HABEN JETZT DREI GESICHTER. Stufe 1 die
   Muetze ohne Waffe, Stufe 2 der Wanderstab, Stufe 3 der Speer - drei
   handgefuehrte GPT-Bilder in Gruen. Die Staffel haengt am Bauern-Level:
   1-2 -> Stufe 1, 3-4 -> Stufe 2, ab 5 -> Stufe 3. */
export const pawnTier = (level) => (level >= 5 ? 3 : level >= 3 ? 2 : 1);

export function buildArmyFromFormation(levelOf, formation, chosenOf = null, boostOf = null) {
  // (null slots — the dragon's wing — become empty back-rank squares)
  const back = formation.map((id) => {
    if (id == null) return null;                   // the dragon's wing: an open square
    if (isBossEntry(id)) {
      const b = bossById(bossEntryId(id));
      if (b) return bossSpecLeveled(b, levelOf("X:" + b.id));  // der Boss marschiert mit seinem RANG
    }
    const ch = CHARACTERS[id];
    const level = Math.max(1, levelOf(id) || 1);
    const { abilities, shield } = resolveCharacter(ch, level, chosenOf ? chosenOf(id) : null);
    return { kind: ch.kind, level, abilities, shield, ...boostSpec(ch, boostOf && boostOf(id)), ...(ch.moveSpec ? { moveSpec: ch.moveSpec } : {}), ...(ch.big ? { big: true } : {}) };
  });
  const pl = Math.max(1, levelOf("pawn") || 1);
  const pr = resolveCharacter(CHARACTERS.pawn, pl, chosenOf ? chosenOf("pawn") : null);
  return { back, pawn: { kind: KIND.PAWN, level: pl, tier: pawnTier(pl), abilities: pr.abilities, shield: pr.shield, ...boostSpec(CHARACTERS.pawn, boostOf && boostOf("pawn")) } };
}

// ── Map-aware formation & army ────────────────────────────────────────────────
/* v1.24.3: Arena und Scharmuetzel sind gestrichen (Besitzerentscheid
   "Tabula Rasa" vom 16.9.) - die Standardkarte ist Klassik, 8x8. */
const STANDARDKARTE = () => mapById("classic");
/** THE CROWN SITS STILL. King and queen always occupy the same two squares —
 *  centre-right for the king, his consort to his left — on every board width.
 *  Wandering royals made each map feel like a new game; a fixed pair is what
 *  makes a formation readable at a glance. A league boss standing in for the
 *  queen inherits her square exactly. Matches every shipped default: w10 → 5/4,
 *  w8 → 4/3 (the chess standard), w6 → 3/2. */
export const crownSlots = (size) => ({ king: Math.floor(size / 2), queen: Math.floor(size / 2) - 1 });

export const formationSpec = (map) => ({ required: map.formation.required, flex: map.formation.flex, size: map.w });

/** Map-aware legality: required composition + size come from the map. */
export function formationLegalOn(formation, unlockedIds, map, ownedBosses = []) {
  const { required, flex, size } = formationSpec(map);
  if (!Array.isArray(formation) || formation.length !== size) return false;
  // THE BIG DRAGON, map-aware: only at the very edge of THIS board; the slot
  // beside him stays EMPTY (null) — his wing claims it. One dragon per army.
  const dLeft = formation[0] === "dragon", dRight = formation[size - 1] === "dragon";
  const wingIdx = dLeft ? 1 : dRight ? size - 2 : -1;
  if (formation.includes("dragon") && !dLeft && !dRight) return false;
  if (dLeft && dRight) return false;
  if (wingIdx >= 0 && formation[wingIdx] != null) return false;
  const unlocked = new Set(unlockedIds); let flexN = 0, bossN = 0;
  for (let i = 0; i < formation.length; i++) {
    const id = formation[i];
    if (id == null) { if (i !== wingIdx) return false; continue; } // only the wing may be empty
    if (isBossEntry(id)) {                          // a league boss takes the queen's place
      if (!ownedBosses.includes(bossEntryId(id))) return false;
      bossN++; continue;
    }
    const ch = CHARACTERS[id];
    if (!ch || ch.kind === KIND.PAWN || !unlocked.has(id)) return false;
    if (required[id] === undefined) { if (!FORMATION_FLEX.has(id)) return false; flexN++; }
  }
  /* ── EINE JE FIGUR, ZWEI NUR FUER DIE DREI (v1.1.6, Besitzerentscheid) ────
     "Ich glaube, du hast mich da immer falsch verstanden. Man darf das Pferd,
     den Turm und auch den Laeufer immer frei besetzen. Allerdings darf man
     jede Figur, die man neu dazubekommt, nur EINMAL einsetzen. Die einzigen
     Figuren, die man zweimal einsetzen darf, sind Laeufer, Turm und Pferd."

     Bisher gab es dafuer gar keine Regel: die vier freien Plaetze zaehlten
     nur ihre ANZAHL, nicht wer dort steht. Man konnte also vier Amazonen
     aufstellen. Jetzt gilt: die drei alten Offiziere - Laeufer, Turm,
     Springer - duerfen zweimal auf dem Feld stehen, jede rekrutierte Figur
     genau einmal. Der Laeufer bringt seine zwei ohnehin als Pflicht mit;
     Turm und Springer haben sie hier. */
  /* GEMESSEN BEIM EINBAUEN: ein festes Limit von zwei waere falsch gewesen.
     Die Standardaufstellung der 10x10-Arena traegt VIER Springer und zwei
     Tuerme - mit einem Zweier-Deckel haette das Haus seine eigene
     Grundstellung verboten. Die drei alten Offiziere bleiben deshalb frei
     besetzbar ("man darf das Pferd, den Turm und auch den Laeufer immer frei
     besetzen"), und nur die REKRUTIERTEN sind auf eins begrenzt - das ist
     der Teil, der bisher ganz fehlte: man konnte vier Amazonen aufstellen. */
  const FREI_BESETZBAR = new Set(["bishop", "rook", "knight"]);
  /* ── v1.24.3: DIE ZWEIER-GRENZE (Besitzerentscheid zum 8x8-Umbau) ────────
     Auf acht Plaetzen darf man Laeufer, Springer und Turm ZWEIMAL aufstellen -
     wie im Schach. Alles andere bleibt einmalig.
     WARUM DAS VORHER NICHT NUR VERGESSEN WAR, sondern unmoeglich: die alte
     Grundstellung der Arena war zehn Felder breit und trug VIER Springer -
     eine Zweier-Grenze haette die eigene Startaufstellung verboten. Erst mit
     acht Plaetzen ist die Regel ueberhaupt widerspruchsfrei. */
  const HOECHSTZAHL = { bishop: 2, rook: 2, knight: 2 };
  const jeFigur = new Map();
  for (const id of formation) {
    if (id == null || isBossEntry(id) || id === "king" || id === "queen") continue;
    if (FREI_BESETZBAR.has(id)) continue;
    jeFigur.set(id, (jeFigur.get(id) || 0) + 1);
  }
  for (const [id, n] of jeFigur) if (n > (HOECHSTZAHL[id] || 1)) return false;
  if (bossN > 1) return false;                      // one boss at most on the field
  // THE CROWN KEEPS ITS SQUARES: not merely adjacent — fixed. The king may sit
  // nowhere else, and the queen's square holds either the queen or the one
  // league boss standing in for her.
  const cs = crownSlots(size);
  if (formation[cs.king] !== "king") return false;
  if (formation.some((id, i) => id === "king" && i !== cs.king)) return false;
  const qHere = formation[cs.queen];
  if (!(qHere === "queen" || (qHere != null && isBossEntry(qHere)))) return false;
  if (formation.some((id, i) => i !== cs.queen && (id === "queen" || (id != null && isBossEntry(id))))) return false;
  const c = formationCounts(formation.filter((id) => id != null && !isBossEntry(id)));
  for (const [id, n] of Object.entries(required)) {
    const need = id === "queen" ? n - bossN : n;    // the boss stands in for the queen
    if ((c[id] || 0) !== need) return false;
  }
  return flexN === flex - (wingIdx >= 0 ? 1 : 0);   // the wing eats one flex slot
}

/** Build a player army for a specific map. Classic maps use base-level pieces
 *  (no shields/abilities) → authentic chess; other maps honor a saved legal
 *  per-map formation, else the map's default. */
/** The Grand Gambit's chosen file on this map (clamped; default: center). */
export const heroColFor = (profile, map) => {
  const saved = profile?.loadout?.heroCols?.[map.id];
  const mid = Math.floor(map.w / 2);
  const c = saved == null ? mid : saved;
  return Math.max(0, Math.min(map.w - 1, c));
};
/* ── DIE STUFE DES ERWACHTEN (v1.0.42, Besitzerentscheid) ──────────────────
   Bis v1.0.41 hob das Erwachen NUR DAS BILD: tier sprang auf 2 (Kapuze, Stab,
   Klinge), die Stufe blieb bei 1. Zwei Kommentare an dieser Stelle
   widersprachen sich darum jahrelang - der eine versprach "hebt sich eine
   Stufe", der andere begruendete, warum eben nicht.

   Der Besitzer will den Bruch ECHT: wer erwacht, ist kein Bauer mehr, und man
   soll das auf dem Feld sehen, ohne dass irgendwo eine Farbe verschoben wird.
   Also traegt der Held ab dem ersten Atemzug wirklich Stufe II - mit dem
   Schild, das die Leiter auf dieser Sprosse vorsieht. Das gilt AUCH im reinen
   Schach: gerade dort (Kapitel I) soll er sich abheben, und ein Schild ist im
   Schach ein sichtbares, regelkonformes Zeichen.

   Die erste FAEHIGKEIT sitzt auf Sprosse 3 (pawn_sidestep) - der naechste
   sichtbare Schritt nach dem Erwachen. */
export const GAMBIT_ERWACHT_AUF_STUFE = 2;
export function gambitStufe(profile) {
  const roh = Math.max(1, characterLevel(profile, "gambit") || 1);
  return gambitWach(profile) ? Math.max(GAMBIT_ERWACHT_AUF_STUFE, roh) : roh;
}

function heroSpec(profile, chess = false) {
  const ch = CHARACTERS.gambit;
  const level = gambitStufe(profile);
  const { abilities, shield } = resolveCharacter(ch, level, chess ? null : chosenAbilities(profile, "gambit"));
  /* v1.0.45 (Besitzerentscheid): DAS ERZWUNGENE STUFE-II-BILD IST FORT.
     Math.max(2, ...) hiess: der Held trug ab dem ersten Atemzug das Bild von
     Rang II - den schwarz-goldenen Prunkritter. Der stammt aus einer anderen
     Bildwelt als die geschnitzten Holzfiguren und stach heraus wie ein
     Fremdkoerper, sobald die Stilweiche gefallen war (v1.0.41).

     Jetzt folgt der Rang wieder ehrlich der Stufe: Stufe 2 liegt in Rang I,
     also traegt der Erwachte den frueheren Gambit - den gelben Holzritter,
     der zu seinen gruenen Bauern gehoert und sich trotzdem sofort von ihnen
     abhebt. Der Prunkritter kommt ab Stufe 11, wo er hingehoert.

     Sichtbar bleibt der Bruch trotzdem: gruener Bauer neben goldenem Ritter
     ist deutlicher als jedes Farbfilterchen. */
  return { kind: ch.kind, level, abilities, shield, tier: gambitTier(level), ...(ch.big ? { big: true } : {}) };
}

/** Foresight: if the army that will take the field carries a SEER — the
 *  seeress (Crown) or the hawk (Shadow) — the enemy's array lies open
 *  before the first horn. Only ACTIVELY fielded seers count; the default
 *  ranks never do. */
// ONE SEER PER FAMILY: the Crown's Hellseherin and the Shadow's Spaeher (hawk).
const SEERS = ["seeress", "hawk"];
export function hasForesight(profile, map, rules = null) {
  if (!profile || !map || rules === "chess") return false; // pure chess has no seers
  const owned = unlockedCharacterIds(profile);
  const saved = profile?.loadout?.formations?.[formationKey(map.id, rules)] || profile?.loadout?.formations?.[map.id];
  const ok = saved && formationLegalOn(saved, owned, map, ownedLeagueBosses(profile));
  const formation = ok ? saved : map.defaultFormation;
  return SEERS.some((id) => owned.includes(id) && formation.includes(id));
}

/** v1.0.20 (Besitzer): ZWEI PLAENE JE BRETT. Eine Aufstellung fuer das reine
 *  Schach und eine fuer das HP-Gefecht sind wirklich zwei verschiedene Plaene:
 *  im Schach zaehlt die Gangart, im Gefecht zaehlen Lebenspunkte, Reichweite
 *  und Faehigkeiten. Wer beides in denselben Speicher zwingt, baut nach jedem
 *  Wechsel neu. Der Schluessel bleibt fuer HP der blanke Kartenname - so
 *  finden alle alten Spielstaende ihre Aufstellung unveraendert wieder. */
export const formationKey = (mapId, rules) => rules === "chess" ? `${mapId}#chess` : mapId;

/** v1.0.22 (Besitzer, GESETZ DES KLASSISCHEN): "Klassisch" - im Schnellen
 *  Spiel wie in der Klassisch-Halle - ist IMMER das alte Standard-Schach:
 *  die Werksaufstellung der Karte, Stufe 1, keine Faehigkeiten, keine
 *  gespeicherten Plaene. standard=true erzwingt genau das. Der Schach-PLAN
 *  aus der Aufstellung gehoert allein den Schach-Stationen der KAMPAGNE,
 *  wo neue Figuren mit neuen Gangarten ausdruecklich erwuenscht sind. */
export function buildArmyForMap(profile, map, excludeId = null, rules = null, standard = false) {
  // Combat strength follows the RULESET, not the board: pure CHESS means
  // level-1 vanilla pieces (authentic), but an HP battle — even on the 8x8
  // classic field — brings your leveled pieces, their abilities and dupes.
  const chess = rules === "chess";
  const levelOf = chess ? () => 1 : (id) => id && id.startsWith("X:") ? bossLevelOf(profile, id.slice(2)) : characterLevel(profile, id);
  const chosenOf = chess ? null : (id) => chosenAbilities(profile, id);
  const boostOf = chess ? null : (id) => dupeCount(profile, id);
  // The FIELD is arrangeable on every board — honour a saved legal formation.
  // A battle may be re-routed to a DIFFERENT board of the same size (early
  // leagues bend everything onto the 8x8 classic field), so if this exact map
  // has no saved rank, fall back to any saved formation from a same-width board
  // that is legal here. This keeps your arrangement from silently vanishing.
  const forms = profile?.loadout?.formations || {};
  const legalHere = (f) => f && formationLegalOn(f, unlockedCharacterIds(profile), map, ownedLeagueBosses(profile));
  /* Erst der Plan fuer DIESES Regelwerk; fehlt er, gilt der des anderen -
     eine vorhandene Aufstellung ist immer besser als die Werkseinstellung. */
  let saved = standard ? null : (forms[formationKey(map.id, rules)] || forms[map.id]);
  if (!legalHere(saved)) {
    saved = null;
    for (const [mid, f] of Object.entries(forms)) {
      if (mid === map.id) continue;
      const src = MAPS.find((m) => m.id === mid);
      if (src && src.w === map.w && src.defaultFormation.length === map.defaultFormation.length && legalHere(f)) { saved = f; break; }
    }
  }
  const ok = legalHere(saved);
  let formation = ok ? saved : map.defaultFormation;
  // Turncoat duels (v0.20): fighting the double of a piece you own — your own
  // copy sits the match out, its slot falls back to the map's default rank.
  if (excludeId) formation = formation.map((cid, i) =>
    cid === excludeId ? (map.defaultFormation[i] !== excludeId ? map.defaultFormation[i] : "knight") : cid);
  const army = buildArmyFromFormation(levelOf, formation, chosenOf, boostOf);
  /* v0.81: DER HELD TRITT SPAETER AUF. Vor dem Erwachen (drei geschaffte
     Stationen) fuehrt niemand die Armee an - die Bauernreihe ist eine
     Bauernreihe, und das Spiel ist schlicht Schach. Danach haelt der Gambit
     wie gehabt seine Linie, auch im reinen Schach. */
  if (gambitWach(profile)) army.hero = { col: heroColFor(profile, map), spec: heroSpec(profile, chess) };
  return army;
}

const AI_BUMP = { easy: 0, normal: 1, hard: 2 };

// Varied enemy back ranks per board width — the AI fields a different (often
// wilder) squad each match. Each entry contains exactly one king.
const ENEMY_POOLS = {
  6: [
    ["rook", "knight", "queen", "king", "bishop", "knight"],
    ["knight", "bishop", "queen", "king", "knight", "rook"],
    ["hawk", "bishop", "queen", "king", "hawk", "rook"],
    ["rook", "knight", "archbishop", "king", "bishop", "knight"],
  ],
  8: [
    ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"],
    ["knight", "knight", "bishop", "queen", "king", "bishop", "knight", "knight"],
    ["rook", "hawk", "archbishop", "queen", "king", "archbishop", "hawk", "rook"],
    ["chancellor", "knight", "bishop", "queen", "king", "bishop", "knight", "chancellor"],
    ["rook", "knight", "amazon", "king", "queen", "bishop", "hawk", "rook"],
  ],
  10: [
    ["rook", "knight", "knight", "bishop", "queen", "king", "bishop", "knight", "knight", "rook"],
    ["rook", "knight", "hawk", "archbishop", "queen", "king", "archbishop", "hawk", "knight", "rook"],
    ["rook", "chancellor", "knight", "bishop", "queen", "king", "bishop", "knight", "chancellor", "rook"],
    ["rook", "hawk", "knight", "amazon", "king", "queen", "bishop", "knight", "hawk", "rook"],
    ["knight", "knight", "bishop", "hawk", "queen", "king", "hawk", "bishop", "knight", "knight"],
  ],
};

/** AI army for a specific map. Classic stays standard (pure chess); other maps
 *  draw a varied enemy formation chosen by `seed`, all scaled by difficulty. */
export function buildAiArmyForMap(difficultyId, map, seed = 0) {
  const bump = map.classic ? 0 : (AI_BUMP[difficultyId] ?? 0);
  let formation = map.defaultFormation;
  if (!map.classic) {
    const pool = ENEMY_POOLS[map.w];
    if (pool && pool.length) formation = pool[Math.abs(seed | 0) % pool.length];
  }
  return buildArmyFromFormation(() => 1 + bump, formation);
}

/** Player army. Defaults to the 10×10 Arena (used by the campaign); the app
 *  passes the active map for quick play. */
export const buildArmy = (profile, map = STANDARDKARTE(), excludeId = null, rules = null, standard = false) => buildArmyForMap(profile, map, excludeId, rules, standard);

export const buildAiArmy = (difficultyId) => {
  const d = difficultyById(difficultyId);
  return buildArmyFrom((id) => d.levels[id] || 1, d.flank);
};

/** Like buildAiArmy but raises every enemy level by `bump` and can override the
 *  flank pieces — the campaign uses this to scale up and introduce new pieces. */
export const buildAiArmyScaled = (difficultyId, bump = 0, flank) => {
  const d = difficultyById(difficultyId);
  return buildArmyFrom((id) => (d.levels[id] || 1) + bump, flank || d.flank);
};
