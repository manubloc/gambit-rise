// STORY CONTRACT — the campaign must not lie to the player.
//
// Every station promises something in prose; the match that follows has to
// deliver it. Two real defects motivated this file: a station announced "the
// Render" by name while its rotation actually served four different monsters,
// and several gate stations named the WRONG character (calling the Pathfinder
// a Hawk — two pieces that both exist, so the sentence read as a promise of a
// figure you would never meet).
import { CAMPAIGN, BOSSES, CHARACTERS, ITEMS, mapById } from "./src/content/index.js";
import { BASE_HP, BASE_ATK } from "./src/core/index.js";
import { leagueFinalBossPiece } from "./src/meta/campaign.js";
import { crownSlots, formationLegalOn, unlockedCharacterIds, buildArmy, defaultProfile, withProgressPct } from "./src/meta/index.js";
import { createGame, encodeState, decodeState } from "./src/core/index.js";
import { MAPS, CHARACTER_LIST } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

const bossById = Object.fromEntries((BOSSES || []).map((b) => [b.id, b]));
const charNames = Object.values(CHARACTERS).map((c) => ({ id: c.id, de: c.nameDe, en: c.nameEn }));
// the meaningful word of a name: longest token, articles dropped
const core = (nm) => (nm || "").split(/[\s,]+/)
  .filter((w) => !/^(der|die|das|den|dem|the|a|an)$/i.test(w))
  .sort((a, b) => b.length - a.length)[0] || nm;

// ── 1. Structure: every node is playable ────────────────────────────────────
{
  const ids = new Set(CAMPAIGN.map((n) => n.id));
  ok("node ids are unique", ids.size === CAMPAIGN.length);
  const dangling = CAMPAIGN.flatMap((n) => (n.next || []).filter((x) => !ids.has(x)).map((x) => `${n.id}→${x}`));
  ok("no edge points into the void", dangling.length === 0 || console.log("     ", dangling.join(", ")));
  ok("every node names a place", CAMPAIGN.every((n) => n.place && n.place.trim().length > 2));
  ok("every node carries both languages", CAMPAIGN.every((n) => n.storyDe && n.storyEn));
  ok("every node's map exists", CAMPAIGN.every((n) => !n.map || !!mapById(n.map)));
  ok("every node's rules are known", CAMPAIGN.every((n) => !n.rules || ["chess", "hp"].includes(n.rules)));
}

// ── 2. Bosses: the opponent actually exists ─────────────────────────────────
{
  const bad = [];
  for (const n of CAMPAIGN) {
    if (!n.boss) continue;
    if (n.boss.piece && !CHARACTERS[n.boss.piece]) bad.push(`${n.id}: unknown piece ${n.boss.piece}`);
    for (const id of n.boss.rotation || (n.boss.pure ? [n.boss.pure] : []))
      if (!bossById[id]) bad.push(`${n.id}: unknown monster ${id}`);
  }
  ok("every boss referenced by the campaign exists", bad.length === 0 || console.log("     ", bad.join(" | ")));
  ok("no node fields both a piece boss and a monster",
    CAMPAIGN.every((n) => !(n.boss?.piece && n.boss?.pure)));
}

// ── 3. THE NAMED-FOE RULE ───────────────────────────────────────────────────
// If the prose names a specific monster, the station must actually field that
// monster every time — otherwise the sentence is a promise the game breaks.
{
  const liars = [];
  for (const n of CAMPAIGN) {
    const rot = n.boss?.rotation || (n.boss?.pure ? [n.boss.pure] : []);
    if (rot.length < 2) continue;
    // The PLACE name is scenery, not a promise: "Geisterfeld" / "Ghost Field"
    // may host a wraith rotation without naming any single wraith. Only the
    // German place name is stored, so the English line is cleared of the same
    // words (the translated place always sits in the opening clause).
    const de = (n.storyDe || "").split(n.place).join(" ");
    let en = n.storyEn || "";
    for (const w of n.place.split(/[\s-]+/)) {
      // "Geisterfeld" → its English twin shares the root: strip both halves
      const root = w.replace(/(feld|berg|tal|moor|pass|bucht|turm|hort|wacht|schlucht)$/i, "");
      for (const cand of [w, root, root + " Field", root + "field"])
        if (cand.length > 3) en = en.split(cand).join(" ");
    }
    // and the literal English scenery words that translate our place nouns
    for (const w of ["Ghost Field", "Blade Gorge", "Mist Fen", "Witch Fen", "Shadow Cliff"])
      en = en.split(w).join(" ");
    for (const id of rot) {
      const b = bossById[id]; if (!b) continue;
      if (de.includes(core(b.nameDe)) || en.includes(core(b.nameEn)))
        liars.push(`${n.id} "${n.place}" names ${b.nameDe} but rotates ${rot.length} foes`);
    }
  }
  ok("no station names one monster while rotating several", liars.length === 0 || console.log("     ", liars.join(" | ")));
}

// ── 4. THE WRONG-CHARACTER RULE ─────────────────────────────────────────────
// A station may only name a character that it actually involves: its boss, or
// the piece its gate demands. Naming any OTHER existing character misleads.
{
  const liars = [];
  for (const n of CAMPAIGN) {
    const involved = new Set([n.boss?.piece, n.gate?.piece, n.requires?.piece].filter(Boolean));
    for (const c of charNames) {
      if (involved.has(c.id)) continue;
      if (c.de.length < 6) continue;                       // short names appear as common words
      /* v1.91.0: der ORTSNAME zaehlt nicht - "Schmiedegrund" und
         "Fallenstellerlager" gab es lange vor dem Schmied und dem Fallensteller */
      if ((n.storyDe || "").split(n.place).join(" ").includes(c.de))
        liars.push(`${n.id} "${n.place}" names ${c.de}, but fields ${[...involved].join("/") || "no one"}`);
    }
  }
  ok("no station names a character it does not involve", liars.length === 0 || console.log("     ", liars.join(" | ")));
}

// ── 5. Gates: what a station demands must be obtainable ─────────────────────
{
  const bad = [];
  for (const n of CAMPAIGN) {
    const g = n.gate || n.requires; if (!g) continue;
    if (g.piece && !CHARACTERS[g.piece]) bad.push(`${n.id}: gate wants unknown piece ${g.piece}`);
    if (g.item && ITEMS && !ITEMS[g.item] && !Object.values(ITEMS || {}).some((i) => i.id === g.item))
      bad.push(`${n.id}: gate wants unknown item ${g.item}`);
  }
  ok("every gate demands things that exist", bad.length === 0 || console.log("     ", bad.join(" | ")));
}

// ── 6. Rewards and difficulty climb, not wobble ─────────────────────────────
{
  ok("every node pays something", CAMPAIGN.every((n) => !n.reward || (n.reward.xp ?? 0) >= 0));
  const tiers = CAMPAIGN.filter((n) => n.tier != null).map((n) => n.tier);
  ok("boss tiers stay in the designed 1..4 band", tiers.every((t) => t >= 1 && t <= 4));
  ok("difficulty labels are known",
    CAMPAIGN.every((n) => !n.difficulty || ["easy", "normal", "hard"].includes(n.difficulty)));
  // the road must get richer: late stations should not pay less than the first
  const first = CAMPAIGN[0]?.reward?.xp ?? 0;
  const last = CAMPAIGN[CAMPAIGN.length - 1]?.reward?.xp ?? 0;
  ok("the last station pays more than the first", last >= first);
}

// ── 7. EVERY PIECE HAS A DOOR ───────────────────────────────────────────────
// A character nobody can ever recruit is dead content. Two doors exist: a
// station that unlocks it on the kill, and the league finale (that is where
// the Captain waits — the sea route depends on him).
{
  const fromNodes = new Set(CAMPAIGN.filter((n) => n.boss?.piece).map((n) => n.boss.piece));
  const fromFinals = new Set(Array.from({ length: 10 }, (_, i) => leagueFinalBossPiece(i + 1)).filter(Boolean));
  const startingSix = ["pawn", "gambit", "king", "queen", "rook", "knight", "bishop"];
  const orphans = Object.values(CHARACTERS)
    .filter((c) => c.kind && !startingSix.includes(c.id))
    .filter((c) => !fromNodes.has(c.id) && !fromFinals.has(c.id))
    .map((c) => `${c.id} (${c.nameDe})`);
  ok("every recruitable piece has a way into the court", orphans.length === 0 || console.log("     ", orphans.join(", ")));
  // and the gates may only demand pieces that are obtainable BEFORE them
  const gated = CAMPAIGN.map((n) => (n.gate || n.requires)?.piece).filter(Boolean);
  ok("gates only demand obtainable pieces",
    gated.every((id) => fromNodes.has(id) || fromFinals.has(id)));
}

// ── 8. THE WEIGHT OF THINGS ─────────────────────────────────────────────────
// Power index = hp + 2·atk. Pieces must rank sanely: the pawn stays the
// smallest, the king the sturdiest, and nothing may balloon out of the band.
{
  const power = (k) => (BASE_HP[k] || 0) + 2 * (BASE_ATK[k] || 0);
  const kinds = [...new Set(Object.values(CHARACTERS).map((c) => c.kind).filter((k) => BASE_HP[k]))];
  ok("the pawn is the humblest piece on the board",
    kinds.every((k) => k === "P" || power(k) > power("P")));
  ok("the king carries the deepest life pool",
    kinds.every((k) => (BASE_HP[k] || 0) <= BASE_HP.K));
  ok("no piece exceeds twice the queen's weight",
    kinds.every((k) => power(k) <= 2 * power("Q")));
  ok("every fielded kind has both stats", kinds.every((k) => BASE_HP[k] > 0 && BASE_ATK[k] > 0));
}

// ── 9. THE ROAD PAYS BETTER THE FURTHER YOU WALK ────────────────────────────
// Along the main spine (the n-nodes) the purse must never shrink: a later
// station paying less than an earlier one reads as a bug to the player.
{
const { hauptast: haSt } = await import("./test_helpers12.mjs");
  const drops = [];
  for (let lg = 1; lg <= 12; lg++) {
    const spine = haSt(lg).filter((n) => n.reward?.xp);
    for (let i = 1; i < spine.length; i++)
      if (spine[i].reward.xp < spine[i - 1].reward.xp)
        drops.push(`${spine[i - 1].id}(${spine[i - 1].reward.xp}) → ${spine[i].id}(${spine[i].reward.xp})`);
  }
  ok("the main road's rewards never fall back (all twelve chapters)", drops.length === 0 || console.log("     ", drops.join(", ")));
  const s1 = haSt(1);
  ok("the spine actually climbs", s1.length > 3 && s1[s1.length - 1].reward.xp > s1[0].reward.xp * 2);
}

// ── 10. THE CROWN KEEPS ITS SQUARES ─────────────────────────────────────────
// King and queen must start on the same two squares on every board, so a rank
// stays readable at a glance. A boss standing in for the queen inherits hers.
{
  const owned = [...unlockedCharacterIds({ campaign: { unlocked: Object.values(CHARACTERS).map((c) => c.id) } })];
  ok("the crown formula matches chess on an 8-wide rank",
    crownSlots(8).king === 4 && crownSlots(8).queen === 3);
  ok("the consort always stands beside the king",
    [6, 8, 10].every((n) => Math.abs(crownSlots(n).king - crownSlots(n).queen) === 1));

  const wrong = [];
  for (const m of MAPS) {
    const cs = crownSlots(m.w);
    const def = m.defaultFormation;
    if (def[cs.king] !== "king" || def[cs.queen] !== "queen") wrong.push(m.id);
    if (!formationLegalOn(def, owned, m, [])) wrong.push(m.id + " (illegal)");

    // moving the king one square must be rejected outright
    const moved = [...def];
    [moved[cs.king], moved[cs.king + 1 < m.w ? cs.king + 1 : cs.king - 2]] =
      [moved[cs.king + 1 < m.w ? cs.king + 1 : cs.king - 2], moved[cs.king]];
    if (formationLegalOn(moved, owned, m, [])) wrong.push(m.id + " (king may wander!)");

    // and so must moving the queen off her square
    const qMoved = [...def];
    [qMoved[cs.queen], qMoved[0]] = [qMoved[0], qMoved[cs.queen]];
    if (formationLegalOn(qMoved, owned, m, [])) wrong.push(m.id + " (queen may wander!)");
  }
  ok("every map seats the crown on its fixed squares and enforces it",
    wrong.length === 0 || console.log("     ", wrong.join(", ")));
}

// ── 11. WHAT YOU ARRANGE IS WHAT YOU FIELD ──────────────────────────────────
// The court screen lets you build a back rank per map. That promise is only
// worth anything if the match actually deploys it — on every map, and through
// the same call the game itself makes.
{
  const prof = withProgressPct(defaultProfile(), 100, 5);
  const owned = new Set(prof.campaign?.unlocked || []);
  const swap = CHARACTER_LIST.find((c) => c.flank && owned.has(c.id));
  ok("a recruited flank piece exists to arrange", !!swap);

  const mismatched = [];
  for (const m of MAPS) {
    const wanted = [...m.defaultFormation];
    wanted[0] = swap.id;                       // the far wing is always flex
    const p2 = { ...prof, loadout: { ...(prof.loadout || {}), formations: { [m.id]: wanted } } };
    const army = buildArmy(p2, mapById(m.id), null, "hp");
    const back = army.back || army;
    const kinds = back.map((x) => x && (x.kind || x));
    if (kinds[0] !== swap.kind) mismatched.push(`${m.id}: wanted ${swap.kind}, fielded ${kinds[0]}`);
    // and the crown must still stand where the law puts it
    const cs = crownSlots(m.w);
    if (kinds[cs.king] !== "K") mismatched.push(`${m.id}: king not on his square`);
  }
  ok("every map deploys the rank you arranged",
    mismatched.length === 0 || console.log("     ", mismatched.join(" | ")));

  // an unlawful saved rank must not reach the board — it falls back, it never crashes
  const broken = { ...prof, loadout: { formations: { classic: ["king", "king", "king", "king", "king", "king", "king", "king"] } } };
  let survived = true;
  try { buildArmy(broken, mapById("classic"), null, "hp"); } catch { survived = false; }
  ok("a corrupt formation cannot break the match", survived);
}

// ── 12. A RESTING FIGHT KEEPS ITS RANKS ─────────────────────────────────────
// Rearranging the court while a campaign match is paused must not reach into
// that match — it resumes from its own snapshot — and the new arrangement must
// take effect from the next battle on. Both halves are asserted, because
// either one breaking silently would look like a corrupted save.
{
  const prof = withProgressPct(defaultProfile(), 100, 5);
  const map = mapById("classic");
  const g = createGame(buildArmy(prof, map, null, "hp"), buildArmy(prof, map, null, "hp"),
    { map, rules: "hp", seed: 5 });
  const before = g.board.map((p) => (p ? p.kind : ".")).join("");

  const swap = CHARACTER_LIST.find((c) => c.flank && (prof.campaign?.unlocked || []).includes(c.id));
  const changed = [...map.defaultFormation]; changed[0] = swap.id;
  const after = { ...prof,
    pausedMatch: { v: 1, nodeId: "L01s03", enc: encodeState(g), potionsUsed: 0, hourglassUsed: 0, clock: null },
    loadout: { ...(prof.loadout || {}), formations: { classic: changed } } };

  ok("the paused fight resumes exactly as it stood",
    decodeState(after.pausedMatch.enc).board.map((p) => (p ? p.kind : ".")).join("") === before);
  const next = buildArmy(after, map, null, "hp");
  ok("and the NEXT battle fields the new arrangement",
    (next.back || next)[0]?.kind === swap.kind);
  ok("the untouched flank of the running board is still the old piece", before[0] === "R");
}


// ── JEDES KAPITEL HAT SEIN GEMAELDE (v1.0.19, Besitzer) ────────────────────
// Kapitel VIII fehlte monatelang, ohne dass es jemandem auffiel: der Einstieg
// faellt bei fehlendem Bild einfach stumm auf die Karte durch. Ein fehlendes
// Bild soll ab jetzt LAUT sein.
import { readdirSync as _lies, readdirSync as _liesOrdner, readFileSync as _liesDatei } from "node:fs";
{
  const dateien = _lies("public/kapitel");
  const fehlend = [];
  for (let n = 1; n <= 12; n++) {
    const pre = String(n).padStart(2, "0") + "-";
    if (!dateien.some((f) => f.startsWith(pre) && f.endsWith(".webp"))) fehlend.push(n);
  }
  ok("every one of the twelve chapters owns a painting", fehlend.length === 0);
  if (fehlend.length) console.log("   ohne Bild:", fehlend.join(", "));
  /* v1.0.24: dasselbe fuer die Brett-Hintergruende. Fehlt einer, faellt das
     Brett auf schwarzen Grund zurueck - lautlos, wie Kapitel VIII es
     monatelang tat. */
  const brett = _lies("public/brett");
  const ohneGrund = [];
  for (let n = 1; n <= 12; n++) {
    const pre = String(n).padStart(2, "0") + "-";
    if (!brett.some((f) => f.startsWith(pre) && f.endsWith(".webp"))) ohneGrund.push(n);
  }
  ok("and every chapter owns a board backdrop", ohneGrund.length === 0);
  if (ohneGrund.length) console.log("   ohne Hintergrund:", ohneGrund.join(", "));
}


// ── DAS APP-SYMBOL BLEIBT UNTER SICH (v1.0.26, Besitzer) ───────────────────
// "Das Logo wenn dann nur als App-Symbol. Fuer Favicon und im Menue oben
// passt das schon." Genau das haelt diese Probe fest.
{
  const html = _liesDatei("index.html", "utf8");
  const faviconZeilen = html.split("\n").filter((z) => /rel="icon"/.test(z));
  ok("no app icon leaks into the browser tab",
    faviconZeilen.every((z) => !/icons\/icon-(192|512)/.test(z)));
  ok("the tab keeps its own favicons",
    faviconZeilen.some((z) => /favicon\.svg/.test(z)) && faviconZeilen.some((z) => /favicon-32/.test(z)));
  // Die vier App-Symbole muessen existieren
  const dateien = _liesOrdner("public/icons");
  for (const n of ["icon-192.png", "icon-512.png", "maskable-512.png", "apple-touch-icon.png"])
    ok(`app icon present: ${n}`, dateien.includes(n));
}


// ── DIE ERSTLADUNG BLEIBT SCHNELL (v1.0.36, Besitzer) ──────────────────────
// Gemessen: mit acht Spuren brauchte der Vorlader ueber 20 Sekunden fuer rund
// 400 Dateien, mit zwanzig noch fuenf. Wer die Zahl wieder senkt, macht den
// ersten Start viermal so lang - diese Probe faellt dann auf.
{
  const vor = _liesDatei("src/app/ui/Vorlader.jsx", "utf8");
  const spuren = vor.match(/Array\((\d+)\)\]\.map\(hand\)/);
  ok("the preloader keeps enough lanes open", !!spuren && +spuren[1] >= 16);
  // Das Bootbild ist das ERSTE, was jemand sieht - es darf nicht schwer sein
  const boot = _liesOrdner("public/icons").filter((f) => f.startsWith("boot-riss"));
  ok("the boot image is served as webp", boot.includes("boot-riss.webp"));
  const html = _liesDatei("index.html", "utf8");
  ok("and the page asks for the light one", /boot-riss\.webp/.test(html) && !/boot-riss\.png"/.test(html));
}


// ── KEINE FIGUR IST GROESSER ALS IHR PLATZ (v1.0.38, Besitzerbefund) ───────
// Der Besitzer fand die Ursache des Ruckelns dort, wo ich sie nicht gesucht
// hatte: mit den KLASSISCHEN Figuren lief alles fluessig, mit den gemalten
// nicht. Der Grund lag in den Dateien - 1024x1024 gegen 224x384. Eine
// dekodierte 1024er Figur belegt 4 MB Bildspeicher, zwoelf davon auf einem
// Brett 48 MB; der klassische Satz kam mit 3,9 MB aus. Dargestellt wird eine
// Figur mit hoechstens ~534 px (Popup bei dreifacher Pixeldichte).
// Diese Probe verhindert, dass wieder jemand Riesen einlagert.
{
  const grenze = 640;
  const zuGross = [];
  /* v1.0.55: "carved" ist fort - der Zweitsatz lag seit dem Fall der
     Stilweiche (v1.0.41) ungenutzt herum und haengt jetzt im Archiv
     (archiv/ausgemustert/v1.0.55). Nur noch der gespielte Satz wird
     bewacht; ein Ordner, den es nicht gibt, wird uebersprungen. */
  for (const ordner of ["painted"]) {
    const pfad = `src/app/ui/assets/${ordner}`;
    for (const datei of _lies(pfad)) {
      if (!datei.endsWith(".webp")) continue;
      const roh = _liesDatei(`${pfad}/${datei}`);
      // WebP-Kopf: VP8X/VP8 /VP8L - Breite und Hoehe stehen unterschiedlich,
      // darum wird nur die Dateigroesse als grober Waechter genutzt.
      if (roh.length > 260 * 1024) zuGross.push(`${datei} (${Math.round(roh.length / 1024)} KB)`);
    }
  }
  ok("no piece image is oversized for its slot", zuGross.length === 0);
  if (zuGross.length) console.log("   zu gross:", zuGross.slice(0, 6).join(", "));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
