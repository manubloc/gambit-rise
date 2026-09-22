// ── Boss system: data-driven movement, spawning, stats, campaign wiring ──────
import { createGame, legalMovesFrom, reduce, moveCommand, idx, encodeState, decodeState } from "./src/core/index.js";
import { mapById, BOSSES, bossById, bossSpec, CAMPAIGN } from "./src/content/index.js";
import { buildStageMatch, nodeBossSpec } from "./src/meta/index.js";
import { chooseMove } from "./src/ai/index.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  ok  -", name); } else { fail++; console.log("  FAIL-", name); } };

const ch = (k) => ({ kind: k, level: 1, abilities: [], shield: 0 });
const classicBack = ["R", "N", "B", "Q", "K", "B", "N", "R"].map(ch);
function bossGame(boss, opts = {}) {
  const bBack = [...classicBack]; bBack[3] = bossSpec(boss);
  return createGame({ back: classicBack, pawn: ch("P") }, { back: bBack, pawn: ch("P") },
    { map: mapById("classic"), rules: "hp", seed: opts.seed ?? 3 });
}
// place a lone boss mid-board for clean movement checks
function loneBoss(boss) {
  const s = bossGame(boss);
  const b = s.board;
  for (let i = 0; i < b.length; i++) b[i] = null;
  b[idx(4, 4, 8)] = null;
  const tmp = bossGame(boss); // fresh piece instance
  const piece = tmp.board[idx(3, 7, 8)];
  b[idx(4, 4, 8)] = piece;
  b[idx(0, 0, 8)] = { ...tmp.board[idx(4, 0, 8)] }; // white king
  b[idx(7, 7, 8)] = { ...tmp.board[idx(4, 7, 8)] }; // black king
  s.turn = "b";
  return { s, from: idx(4, 4, 8), piece };
}

// 1) stats override
{
  const b = bossById("b06"); // Bollwerk: hp 11 atk 2 (v0.38: Panzer-Gegengewicht, 18->11)
  const s = bossGame(b);
  const p = s.board[idx(3, 7, 8)];
  /* v1.25.5: die Norm ist 24, nicht 28 - ohne die Schilde landet jede eigene
     Figur bei genau 24 Punkten (Besitzerentscheid "alle 24"). Das Bollwerk
     steht damit auf 21/3; vorher 24/4 (v1.25.1) und 11/2 (davor). */
  ok("boss stats come from its definition", p.hp === 21 && p.maxHp === 21 && p.atk === 3);
  ok("boss carries name/art/accent", p.name.de === "Das Bollwerk" && p.art === "golem" && !!p.accent);
}

// 2) leap spec: camel moves from an open square
// v1.0.50: der Hetzer traegt jetzt 8 Kamel-Weiten PLUS 4 gerade
// Einzelschritte (Besitzerbefund: Kamel pur ist farbgebunden und ohne
// Nahzugriff - 50 von 100 Feldern). Die Probe zaehlt beide Gangarten.
{
  const { s, from } = loneBoss(bossById("b02")); // camel (1,3)/(3,1) + ortho-1
  const mv = legalMovesFrom(s, from);
  ok("camel boss has 8 leaps plus 4 steps in the open", mv.length === 12 && mv.every((m) => m.special === "leap"));
  ok("camel leap geometry (3,1)", mv.some((m) => m.to === idx(7, 5, 8)) && mv.some((m) => m.to === idx(1, 3, 8)));
}

// 3) slide range: Kanonier ortho range 3
{
  const { s, from } = loneBoss(bossById("b08"));
  const mv = legalMovesFrom(s, from);
  ok("range-3 slider reaches 3, not 4", mv.some((m) => m.to === idx(4, 1, 8)) && !mv.some((m) => m.to === idx(4, 0, 8)));
  ok("slider stays orthogonal", !mv.some((m) => m.to === idx(5, 5, 8)));
}

// 4) spawn: Brutmutter creates a pawn, budget counts down
{
  const { s, from } = loneBoss(bossById("b03"));
  const spawns = legalMovesFrom(s, from).filter((m) => m.special === "spawn");
  ok("spawner offers spawn moves on empty neighbors", spawns.length === 8);
  const out = reduce(s, moveCommand(spawns[0]));
  const ns = out.state;
  const pawn = ns.board[spawns[0].to];
  ok("spawn creates an enemy pawn with HP stats", pawn && pawn.kind === "P" && pawn.color === "b" && pawn.hp === 2);
  ok("spawner stays put and spends a charge", ns.board[from].kind === "X" && ns.board[from].spawnLeft === bossById("b03").moveSpec.spawn.max - 1);   /* v1.32.0: aus der Definition, nicht fest - die Brutmutter hat jetzt 2 */
  ok("spawn costs the turn", ns.turn === "w");
}

// 5) campaign wiring
{
  ok("at least 25 bosses exist", BOSSES.length >= 25);
  ok("every boss has a unique move spec", new Set(BOSSES.map((b) => JSON.stringify(b.moveSpec))).size === BOSSES.length);
  const bossStages = CAMPAIGN.filter((st) => st.boss);
  // v0.77: Die ERWACHENS-Station wandert mit der Schachhaelfte von Kapitel I -
  // darum wird sie gesucht statt eingetippt.
  /* v1.0.20: das Erwachen sitzt seit Kapitel-I-ohne-HP in Kapitel II. Gesucht
   wird deshalb, was es AUSMACHT - die erste Hauptast-Station mit wechselndem
   Monster - statt einer Kapitelnummer, die wieder wandern kann. */
/* Das Erwachen wird an seiner ERZAEHLUNG erkannt, nicht an Kapitel oder
   Kennung: es ist die eine Station, auf der die alte Magie erwacht. */
const ERWACHEN = CAMPAIGN.find((st) => /erwacht|magic wakes/.test(st.storyDe || "")).id;
  ok("the twelve chapters field 44 boss stages", bossStages.length === 44);
  ok("20 of them are recruitable piece bosses, one per key figure", bossStages.filter((st) => st.boss.piece).length === 20
    && new Set(bossStages.filter((st) => st.boss.piece).map((st) => st.boss.piece)).size === 20);
  ok("every pure boss resolves", bossStages.filter((st) => st.boss.pure).every((st) => bossById(st.boss.pure)));
  const m = buildStageMatch(ERWACHEN);
  ok("boss replaces the enemy queen", m.aiArmy.back.some((sp) => sp.kind === "X") && !m.aiArmy.back.some((sp) => sp.kind === "Q"));
  ok("stage match exposes the boss for the UI", m.boss && m.boss.bossId === "b01");
  const pm = buildStageMatch("L06s12", { campaign: { league: 6 } }); // der Attentaeter wohnt in Kapitel VI
  ok("piece boss fields its own kind with boosted stats", pm.aiArmy.back.some((sp) => sp.kind === "S" && sp.hp >= 8)
    && buildStageMatch("L06s12", { campaign: { league: 6 } }).boss.unlocks === "assassin");
  ok("a stubborn champion resists until his last demanded win (the Dragon wants two)",
    buildStageMatch("L07s41", { campaign: { league: 7 } }).boss.unlocks === null
    && buildStageMatch("L07s41", { campaign: { league: 7, bossWins: { dragon: 1 } } }).boss.unlocks === "dragon");
  ok("the awakening rotates its monster with the world laps", (() => {
    const a = buildStageMatch(ERWACHEN, { campaign: { league: 1 } });
    const b = buildStageMatch(ERWACHEN, { campaign: { league: 13 } });
    return a.boss.bossId === "b01" && b.boss.bossId === "b03" && a.boss.unlocks === null;
  })());
  // monster stations rotate their champion by league — the whole bestiary marches
  const nA5 = (id) => CAMPAIGN.find((n) => n.id === id);
  ok("each chapter ends at its own fixed master", nodeBossSpec(nA5("L01s44"), 1).bossId === "b12"  // v0.38.1: Osric ans Ende, Kapitel I endet beim Richter
    && nA5("L05s16").boss.rotation[0] === "b22" && nodeBossSpec(nA5("L05s16"), 5).bossId === "b22"
    && nodeBossSpec(nA5("L05s16"), 17).bossId === "b04");
  ok("every rotated monster resolves to a real boss", [ERWACHEN,"L05s16"].every((id) =>
    (nA5(id).boss.rotation || []).every((b) => bossById(b))));
}

// 6) AI plays a boss without crashing; codec roundtrips boss fields
{
  const spawnNode = { id: "spawn_test", map: "arena", rules: "hp", difficulty: "normal", bump: 0, next: [], boss: { pure: "b03" }, tier: 2, reward: { xp: 0 } };
  CAMPAIGN.push(spawnNode);
  const m = buildStageMatch("spawn_test"); // Brutmutter (spawner) via injected node
  CAMPAIGN.pop();
  let st = createGame({ back: classicBack, pawn: ch("P") }, m.aiArmy, { map: mapById(m.map), rules: "hp", seed: 11 });
  for (let i = 0; i < 10 && !st.over; i++) {
    const mv = st.turn === "w" ? legalMovesFrom(st, [...st.board.keys()].find((j) => st.board[j]?.color === "w" && legalMovesFrom(st, j).length))[0] : chooseMove(st, 2);
    if (!mv) break;
    st = reduce(st, moveCommand(mv)).state;
  }
  ok("AI survives 10 plies with a spawner boss", st.moveCount >= 8);
  const round = decodeState(encodeState(st));
  const bi = round.board.findIndex((p) => p && p.kind === "X");
  ok("codec roundtrips boss moveSpec + spawn budget", bi !== -1 && !!round.board[bi].moveSpec && typeof round.board[bi].spawnLeft === "number");
}

// ── JEDE FIGUR ERREICHT IHR BRETT (v1.0.50, Besitzerbefund) ────────────────
// "Sind echt alle Bewegungsmuster von Figuren sinnvoll spielbar? Gerade der
// Hetzer - man erreicht ja am Ende gar nicht alle Felder." Die Analyse gab
// ihm recht, und mehr: der Techniker sass auf einem 2x2-Untergitter fest,
// 25 von 100 Feldern. Vier Muster wurden repariert (Hetzer, Bollwerk,
// Kundschafter, Techniker: gerader Einzelschritt dazu); vier bleiben
// ABSICHTLICH farbgebunden, weil sie die Laeufer-Familie sind - deren
// Bindung ist das aelteste, lesbarste Merkmal des Schachs.
// Die Probe haelt beides fest: kein Muster faellt je unter 50, und nur die
// benannte Laeufer-Familie darf ueberhaupt unter 100 liegen.
{
  const { CHARACTERS } = await import("./src/content/characters.js");
  const W = 10, H = 10;
  const deckung = (spec) => {
    if (!spec) return 100;
    const leaps = spec.leaps || [], slides = spec.slides || [], range = spec.range || 99;
    const seen = new Set([45]); const q = [45];
    while (q.length) {
      const i = q.pop(); const f = i % W, r = (i / W) | 0;
      for (const [dx, dy] of leaps) { const x = f + dx, y = r + dy;
        if (x >= 0 && x < W && y >= 0 && y < H) { const j = y * W + x; if (!seen.has(j)) { seen.add(j); q.push(j); } } }
      for (const [dx, dy] of slides) for (let k = 1; k <= range; k++) {
        const x = f + dx * k, y = r + dy * k;
        if (x < 0 || x >= W || y < 0 || y >= H) break;
        const j = y * W + x; if (!seen.has(j)) { seen.add(j); q.push(j); } }
    }
    return seen.size;
  };
  const laeuferFamilie = new Set(["b13", "assassin", "mage", "warlock"]);
  let alleOk = true, mind50 = true;
  for (const b of BOSSES) {
    const d = deckung(b.moveSpec);
    if (d < 50) mind50 = false;
    if (d < 100 && !laeuferFamilie.has(b.id)) alleOk = false;
  }
  for (const c of Object.values(CHARACTERS)) {
    if (!c.moveSpec) continue;
    const d = deckung(c.moveSpec);
    if (d < 50) mind50 = false;
    if (d < 100 && !laeuferFamilie.has(c.id)) alleOk = false;
  }
  ok("kein Zugmuster laesst je mehr als die halbe Welt unerreichbar", mind50);
  ok("und unter 100 liegt nur die benannte Laeufer-Familie", alleOk);
  ok("der Hetzer erreicht jetzt jedes Feld", deckung(bossById("b02").moveSpec) === 100);
  ok("der Techniker haengt nicht mehr auf dem 2x2-Gitter", deckung(CHARACTERS.engineer.moveSpec) === 100);
}

/* v1.32.0: DIE MONSTER TRAGEN IHREN EIGENEN SATZ (Besitzer, nach Tabelle). */
{
  const { BOSSES, monsterSprossen } = await import("./src/content/bosses.js");
  const { ABILITIES } = await import("./src/content/abilities.js");
  const { KAPITELMEISTER } = await import("./src/content/campaign.js");
  const GABEN = ["bulwark", "regen", "lifesteal", "teleport"];
  ok("kein Monster traegt mehr eine Familiengabe - die bleiben den Figuren",
    BOSSES.every((b) => !b.abilities.some((a) => GABEN.includes(a))));
  ok("jedes Monster traegt nur Monsterfaehigkeiten, jede davon wirkt",
    BOSSES.every((b) => b.abilities.length && b.abilities.every((a) => ABILITIES[a] && ABILITIES[a].monsterOnly && ABILITIES[a].live)));
  const reihe = KAPITELMEISTER.map((id) => BOSSES.find((b) => b.id === id).abilities.length);
  ok("Kapitelmeister: I-IV drei, V-VIII vier, IX-XII fuenf (" + reihe.join(",") + ")",
    JSON.stringify(reihe) === JSON.stringify([3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5]));
  const zahl = (id) => BOSSES.find((b) => b.id === id).abilities.length;
  ok("gewoehnliche Monster nach Beweglichkeit: 16 Felder 1, 12-14 zwei, 8 drei, Bollwerk vier",
    ["b07", "b21", "b22"].every((id) => zahl(id) === 1) && ["b02", "b04", "b15", "b13", "b03", "b11"].every((id) => zahl(id) === 2)
    && ["b01", "b05", "b09"].every((id) => zahl(id) === 3) && zahl("b06") === 4);
  ok("hoechstens fuenf Faehigkeiten, keine doppelt", BOSSES.every((b) => b.abilities.length <= 5 && new Set(b.abilities).size === b.abilities.length));
  ok("die Leiter verteilt sie ueber die fuenf Stufen (1: 2 | 2: 2,4 | 3: 2,3,4 | 4: 2-5 | 5: 1-5)",
    BOSSES.every((b) => JSON.stringify(b.ladder.map((r) => r.level)) === JSON.stringify(monsterSprossen(b.abilities.length))
      && b.ladder.map((r) => r.ability).join() === b.abilities.join()));
  /* v1.32.0: nach dem Balance-Lauf getauscht - Geistwandel war bei den
     schnellsten Springern ein zweiter Koerper zu viel (72-73 %) */
  ok("Geist traegt Blenden, Wandlerin Schrecken, Sturmklaue Blenden + Wegelagerei",
    BOSSES.find((b) => b.id === "b07").abilities.join() === "blenden"
    && BOSSES.find((b) => b.id === "b21").abilities.join() === "schrecken"
    && BOSSES.find((b) => b.id === "b15").abilities.join() === "blenden,wegelagerei");
  const { ZIEL_PROFIL_BOSS, BOSS_BUDGET } = await import("./src/meta/leveling.js");
  ok("wer springt, schlaegt schwach: Hetzer 18/6, Sturmklaue 17/7, Geist 16/8",
    ZIEL_PROFIL_BOSS.b02.join() === "18,6" && ZIEL_PROFIL_BOSS.b15.join() === "17,7" && ZIEL_PROFIL_BOSS.b07.join() === "16,8");
  ok("jedes Monster traegt auf Hoechststufe dieselben 24 Punkte",
    BOSSES.every((b) => ZIEL_PROFIL_BOSS[b.id] && ZIEL_PROFIL_BOSS[b.id][0] + ZIEL_PROFIL_BOSS[b.id][1] === BOSS_BUDGET));
  ok("Brut hoechstens drei Bauern (Seuchenkoenig 3, Brutmutter 2, Fluesterin 1, Wandlerin 2)",
    BOSSES.every((b) => !b.moveSpec.spawn || b.moveSpec.spawn.max <= 3)
    && ["b24:3", "b03:2", "b11:1", "b21:2"].every((x) => { const [id, n] = x.split(":"); return BOSSES.find((b) => b.id === id).moveSpec.spawn.max === +n; }));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
