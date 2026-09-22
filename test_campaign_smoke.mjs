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
  /* v1.13.0: die drei 8x8-Karten teilen sich die fruehen Kapitel fast
     gleichmaessig - welche davon die meisten Stationen hat, ist Zufall der
     Verteilung und sagt nichts ueber das Spiel. Was zaehlt: KEINE
     Nicht-8x8-Karte darf so haeufig sein wie eine 8x8. */
  const grossteAcht = Math.max(eff.classic || 0, eff.courtyard || 0, eff.gauntlet || 0);
  ok("keine Sonderkarte kommt so oft wie die 8x8-Bretter",
    (eff.skirmish || 0) < grossteAcht && (eff.arena || 0) < grossteAcht);
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
  /* v1.2.2: HP-Gefechte beginnen in Kapitel V. Die Probe nimmt eine Station
     von dort und blickt auf eine FRUEHERE Liga zurueck - der Vergleich
     braucht beides, sonst skaliert nichts unterschiedlich. */
  const rueckNode = CAMPAIGN.find((n) => n.rules === "hp" && !n.boss && n.league === 5);
  const RUECK = rueckNode.id;
  const look = buildStageMatch(RUECK, p5, 2);
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
  /* ── DER SCHADEN ERWACHT IN KAPITEL II (v1.36.0, Besitzerentscheid 22.9.) ─
     Loest v1.2.2 "Ab 5" ab: "Wir hatten mal gesagt, dass man auch in der
     kostenlosen Version schon HP-Gefechte testen kann - sonst hat man gar
     keinen Mehrwert, die Figuren zu leveln." Gratis ist bis Kapitel III.
     Kapitel I Schach; in Kapitel II erwacht der Schaden frueh im Hauptast,
     die Seitenwege bleiben Schach; ab III Hauptast HP, Seitenwege im Wechsel. */
  const ersteHp = haupt2.findIndex((n) => n.rules === "hp");
  ok("der Schaden erwacht frueh im Hauptast von Kapitel II",
    ersteHp >= 1 && ersteHp <= Math.ceil(haupt2.length * 0.35));
  ok("ab dem Erwachen bleibt der Hauptast bei HP", haupt2.slice(ersteHp).every((n) => n.rules === "hp"));
  ok("das Erwachen traegt seine Geschichte", /erwacht/.test((haupt2[ersteHp] || {}).storyDe || ""));
  ok("Schach bleibt bis zum Ende als Seitenweg", CAMPAIGN.some((n) => n.league >= 10 && !n.haupt && n.rules === "chess"));
  ok("ab Kapitel III blutet jede Station des Hauptasts", CAMPAIGN.filter((n) => n.league >= 3 && n.haupt).every((n) => n.rules === "hp"));
  /* v1.13.0: DREI Karten, nicht mehr vier. Besitzerentscheid: die ersten
     Kapitel bleiben bei 8x8, damit dieselbe Aufstellung ueberall passt.
     Klassik, Hof und Schneise sind alle drei 8x8 - sie unterscheiden sich in
     Loechern und Sperren, nicht im Mass. Die Abwechslung bleibt also, nur
     ohne dass der Spieler umdenken muss. */
  /* v1.24.0: Arena und Scharmuetzel sind gestrichen, und die drei Karten
     kommen jetzt NACH UND NACH: Kapitel I ist reines Klassik, erst sein
     Grossmeister zeigt den Hof. Gemessen: genau eine Nicht-Klassik-Station in
     Kapitel I, und die ist das Finale. */
  const k1Karten = new Set(k1.filter((n) => n.haupt).map((n) => n.map));
  ok("die Schachschule spielt Klassik - nur ihr Finale zeigt den Hof",
    [...k1Karten].sort().join(",") === "classic,courtyard" &&
    k1.filter((n) => n.map !== "classic").every((n) => n.final === true));
  ok("ueber die ersten drei Kapitel kommen alle drei Buehnen vor",
    new Set(CAMPAIGN.filter((n) => n.league <= 3).map((n) => n.map)).size === 3);
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
  /* v1.2.2: der Weg fuehrt jetzt bis in die Mitte von Kapitel V, dort erst
     faellt der erste Schaden (vorher Kapitel II). */
  const bis = CAMPAIGN.filter((n) => (n.league <= 4 || (n.league === 5 && n.rules === "chess")) && n.haupt).map((n) => n.id);
  const nurK1 = CAMPAIGN.filter((n) => n.league === 1).map((n) => n.id);
  ok("ganz Kapitel I weckt die alte Magie NICHT",
    !hpWach({ ...frisch, campaign: { ...frisch.campaign, league: 1, cleared: nurK1 } }));
  const weit = { ...frisch, campaign: { ...frisch.campaign, league: 5, cleared: bis, unlocked: bis } };
  ok("nach der Schachhaelfte von Kapitel V erwacht sie", hpWach(weit));
  ok("und der Trank steht im Laden", itemRevealed(weit, ITEMS.potion));
}

console.log("\n== DIE KARTEN KOMMEN NACH UND NACH (v1.13.0) ==");
{
  /* CAMPAIGN und mapById sind oben schon importiert - ein zweiter Import
     mit await haette die Datei still abbrechen lassen. */
  const st2 = CAMPAIGN;
  const massVon = (id) => { const m = mapById(id); return m ? `${m.w}x${m.h}` : "?"; };

  /* DIE ERSTEN KAPITEL BLEIBEN BEI 8x8. Besitzerentscheid: "Wir sollten die
     Karten erst nach und nach sehr spaet freischalten und vorerst nur im 8x8
     bleiben, damit die Aufstellung und die Decks, die man baut, immer
     dieselben sind."

     Vorher liefen alle fuenf Karten ab Kapitel 1 reihum - ein Spieler sah in
     den ersten Stationen fuenf verschiedene Bretter, bevor er eines
     verstanden hatte. */
  const frueh = [...new Set(st2.filter((s) => (s.league || 1) <= 4).map((s) => s.map))];
  const masse = [...new Set(frueh.map(massVon))];
  ok(`die ersten vier Kapitel spielen nur auf 8x8 (${masse.join(", ")})`,
    masse.length === 1 && masse[0] === "8x8");

  /* Und die neuen Karten fuehrt der GROSSMEISTER ein - nicht irgendeine
     Station mittendrin. Eine neue Kartenform zwischen zwei gewoehnlichen
     Gefechten wirkt wie ein Zufall. */
  /* v1.24.0: die eingefuehrten Karten sind jetzt Hof (Kapitel I) und Schneise
     (Kapitel II) - Arena und Scharmuetzel sind gestrichen. */
  for (const [karte, kapitel] of [["courtyard", 1], ["gauntlet", 2]]) {
    const erste = st2.find((s) => s.map === karte);
    ok(`${karte} erscheint zuerst in Kapitel ${kapitel}`, erste && erste.league === kapitel);
    ok(`und zwar beim Endboss`, erste && !!erste.boss);
  }
}

/* v1.28.4 (Besitzer): die zwoelf Kapitelmeister sind die Grossmeister; der
   Seuchenkoenig ist einer davon (Kapitel III), Asra bleibt es (Kapitel XI). */
{
  const { KAPITELMEISTER, istKapitelmeister, CAMPAIGN } = await import("./src/content/campaign.js");
  ok("zwoelf Kapitelmeister, je Liga einer", KAPITELMEISTER.length === 12 && new Set(KAPITELMEISTER).size === 12);
  ok("Seuchenkoenig und Asra sind Kapitelmeister", istKapitelmeister("b24") && istKapitelmeister("b23"));
  ok("der Hetzer nicht mehr", !istKapitelmeister("b02"));
  ok("Osric schliesst Kapitel XII", KAPITELMEISTER[11] === "b25");
  ok("ein Kapitelmeister steht nie zugleich unterwegs",
    CAMPAIGN.every((n) => !n.boss?.pure || n.final || !istKapitelmeister(n.boss.pure)));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
