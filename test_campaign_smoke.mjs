// ── CAMPAIGN SMOKE: every node, many seeds, full games, end-to-end summary ──
// Guards against move-time crashes and dragon-node setup failures by driving
// each stage through the real engine + reward pipeline. Engine-level coverage:
// if a node's board, moves, dragon unfolding, capture events or match summary
// throw, this fails loudly.
import { CAMPAIGN, mapById } from "./src/content/index.js";
import { buildStageMatch, effectiveMap } from "./src/meta/campaign.js";
import { createGame, applyMove, legalMoves, status } from "./src/core/index.js";
import { buildArmyForMap, withProgressPct, defaultProfile, summarizeMatch, applyResult, itemRevealed, hpWach } from "./src/meta/index.js";
import { ITEMS } from "./src/content/items.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; } else { fail++; console.log("  FAIL - " + name); } };

const profile = withProgressPct(defaultProfile(), 100, 10);
const SEEDS = [1, 42, 777, 9001, 31337];

let crashed = [];
let dragonNodes = 0, dragonOk = 0;
for (const node of CAMPAIGN) {
  for (const seed of SEEDS) {
    try {
      const m = buildStageMatch(node.id, profile);
      const map = mapById(m.map);
      const wArmy = buildArmyForMap(profile, map, m.excludeId, m.rules);
      let g = createGame(wArmy, m.aiArmy, { map, rules: m.rules, seed });
      // dragon nodes: the 2x2 block must unfold with valid wing refs
      const big = g.board.filter((x) => x && x.big && x.kind === "D").length;
      if (big && seed === SEEDS[0]) {
        dragonNodes++;
        const badWings = g.board.filter((x) => x && x.kind === "D+" && (x.ref == null || !g.board[x.ref])).length;
        if (badWings === 0) dragonOk++;
      }
      const log = [];
      for (let i = 0; i < 120; i++) {
        const st = status(g); if (st.over) break;
        const lm = legalMoves(g); if (!lm.length) break;
        const mv = lm[(i * 17 + seed) % lm.length];
        log.push({ from: mv.from, to: mv.to, ...(mv.special ? { special: mv.special } : {}), ...(mv.promotion ? { promotion: mv.promotion } : {}) });
        g = applyMove(g, mv);
      }
      const st = status(g);
      const result = st.winner === "w" ? "win" : st.winner === "b" ? "loss" : "draw";
      const sum = summarizeMatch(wArmy, m.aiArmy, seed, log, result, "w", { map, rules: m.rules });
      applyResult(profile, sum); // reward pipeline must not throw either
    } catch (e) {
      crashed.push(`${node.id} seed=${seed}: ${e.message}`);
    }
  }
}
ok(`all ${CAMPAIGN.length} campaign nodes play out over ${SEEDS.length} seeds without crashing`, crashed.length === 0);
if (crashed.length) crashed.slice(0, 8).forEach((c) => console.log("    " + c));
ok("every dragon node unfolds its 2x2 block with valid wing refs", dragonNodes > 0 && dragonOk === dragonNodes);

// ── the classic board rules the realm (8x8 majority, classic the largest) ──
{
  const eff = {};
  for (const n of CAMPAIGN) { const m = effectiveMap(n, 5); eff[m] = (eff[m] || 0) + 1; }
  const x8 = (eff.classic || 0) + (eff.courtyard || 0) + (eff.gauntlet || 0);
  ok("8x8 boards carry a clear majority of stations", x8 / CAMPAIGN.length >= 0.6);
  ok("classic alone is the single largest board", Object.entries(eff).every(([k, v]) => k === "classic" || v <= eff.classic));
}
// ── the look back: a mastered league replays as an honest friendly ──
{
  const p5 = withProgressPct(defaultProfile(), 60, 5);
  /* v1.0.20: Die Rueckschau braucht eine BLUTENDE Station. Kapitel I ist seit
     der Schachschule durchgehend rules:"chess" - dort steht jede Figur auf
     Stufe 1, egal aus welcher Liga man zurueckblickt, und ein Vergleich
     "frueher schwaecher als heute" kann gar nichts zeigen. */
  /* v1.1.2: die Station skaliert jetzt nach IHREM Kapitel, nicht nach dem
     Spielerstand. "Heute" ist damit fuer eine alte Station schon die alte
     Skalierung - der Vergleich braucht also einen Rueckblick auf eine noch
     FRUEHERE Liga als die der Station selbst. Vorher verglich die Probe
     Stationsliga gegen Profilliga; das war genau das Verhalten, das der
     Besitzer als Fehler gemeldet hat. */
  const rueckNode = CAMPAIGN.find((n) => n.rules === "hp" && !n.boss && n.league === 3);
  const RUECK = rueckNode.id;
  const look = buildStageMatch(RUECK, p5, 1);
  ok("look-back match is a friendly with no first-clear and no timer",
    look.friendly === true && look.firstClear === false && look.timer == null);
  const now = buildStageMatch(RUECK, p5);
  const maxL = (m) => Math.max(...m.aiArmy.back.filter((s) => s).map((s) => s.level));
  ok("look-back foes scale to the OLD league (weaker than today)", maxL(look) < maxL(now));
  ok("look-back never dangles a recruit reward", !look.boss || look.boss.unlocks == null);
}

// ── KAPITEL I IST DIE SCHULE DES SCHACHS (v1.0.20) ───────────────────────────
// Der Besitzer wollte das erste Kapitel GANZ ohne Lebenspunkte: erst lernt man
// die Figuren und ihre Gangarten, erst danach lernt man sie bluten. Das
// Erwachen sitzt seither auf halbem Weg durch Kapitel II.
{
  const k1 = CAMPAIGN.filter((n) => n.league === 1);
  const k2 = CAMPAIGN.filter((n) => n.league === 2);
  const haupt2 = k2.filter((n) => n.haupt);

  ok("Kapitel I ist von Anfang bis Ende reines Schach", k1.every((n) => n.rules === "chess"));
  ok("Kapitel I traegt mindestens 20 Schachstationen", k1.length >= 20);
  ok("Schach gibt es nur in den ersten beiden Kapiteln",
    CAMPAIGN.every((n) => n.rules !== "chess" || n.league <= 2));
  ok("ab Kapitel III blutet jede Station", CAMPAIGN.filter((n) => n.league >= 3).every((n) => n.rules === "hp"));

  const ersteHp = haupt2.findIndex((n) => n.rules === "hp");
  ok("die Schachhaelfte reicht bis zur Mitte von Kapitel II",
    ersteHp >= Math.floor(haupt2.length * 0.35) && ersteHp <= Math.ceil(haupt2.length * 0.65));
  ok("ab dem Erwachen bleibt es bei HP", haupt2.slice(ersteHp).every((n) => n.rules === "hp"));
  ok("das Erwachen traegt seine Geschichte", /erwacht/.test(haupt2[ersteHp].storyDe || ""));
  ok("in der Schachschule wechseln die Karten",
    new Set(k1.filter((n) => n.haupt).map((n) => n.map)).size >= 4);
  /* v1.0.20: Die Schachschule WIRBT SEHR WOHL FIGUREN AN - das ist ihr Zweck.
     Der Besitzer will, dass Kapitel I neue Figuren und neue Gangarten
     schenkt, waehrend die Lebenspunkte noch schlafen. Frueher stand hier das
     Gegenteil, weil die Schachhaelfte nur ein kurzes Vorspiel war. */
  ok("die Schachschule schenkt neue Figuren", k1.some((n) => n.boss?.piece));
  ok("aber keine Figur kostet dort Lebenspunkte",
    k1.every((n) => n.rules === "chess"));
}

// ── Was ohne Lebenspunkte nichts tut, ist vorher nicht zu haben ──────────────
{
  const frisch = defaultProfile();
  ok("der Lebenstrank ist am Anfang nicht einmal sichtbar", !itemRevealed(frisch, ITEMS.potion));
  ok("die alte Magie schlaeft am Anfang", !hpWach(frisch));
  /* v1.0.20: Kapitel I weckt nichts mehr - der Weg fuehrt bis in die Mitte
     von Kapitel II, dort erst faellt der erste Schaden. */
  const bis = CAMPAIGN.filter((n) => (n.league === 1 || (n.league === 2 && n.rules === "chess")) && n.haupt).map((n) => n.id);
  const nurK1 = CAMPAIGN.filter((n) => n.league === 1).map((n) => n.id);
  ok("ganz Kapitel I weckt die alte Magie NICHT",
    !hpWach({ ...frisch, campaign: { ...frisch.campaign, league: 1, cleared: nurK1 } }));
  const weit = { ...frisch, campaign: { ...frisch.campaign, league: 2, cleared: bis, unlocked: bis } };
  ok("nach der Schachhaelfte von Kapitel II erwacht sie", hpWach(weit));
  ok("und der Trank steht im Laden", itemRevealed(weit, ITEMS.potion));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
