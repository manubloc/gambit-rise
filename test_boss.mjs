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
  /* v1.90.17: Streuner und Schleicher hiessen auf Englisch beide "The
     Prowler", und drei Herolds-Stimmen riefen Monster bei Namen, die sie
     laengst nicht mehr tragen (Springbock, Zebra, Sturmkraehe). Beim Umbenennen
     der Bestien waren nur bosses.js nachgezogen worden, nicht voices.js. */
  ok("every boss has its own English name", new Set(BOSSES.map((b) => b.nameEn)).size === BOSSES.length);
  {
    const { VOICES } = await import("./src/content/voices.js");
    const falsch = BOSSES.filter((b) => VOICES[b.id]).filter((b) => {
      const de = b.nameDe.split(",")[0].replace(/^(Der|Die|Das) /, ""), en = b.nameEn.split(",")[0].replace(/^The /, "");
      return !VOICES[b.id].heraldDe.includes(de) || !VOICES[b.id].heraldEn.includes(en);
    }).map((b) => b.id);
    ok(`every herald names its boss by its current name (wrong: ${falsch.join(", ") || "none"})`, falsch.length === 0);
  }
  /* v1.91.0: beim Herabstufen der alten Meister trugen drei Bestien den Beitext des neuen Grossmeisters weiter */
  ok("every boss has its own flavour line (de and en)", new Set(BOSSES.map((b) => b.flavorDe)).size === BOSSES.length && new Set(BOSSES.map((b) => b.flavorEn)).size === BOSSES.length && BOSSES.every((b) => b.flavorDe && b.flavorEn));
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
  /* v1.90.16: 45 statt 44 - die Brutmutter hat ihre eigene Station in
     Kapitel VII vor dem Drachen bekommen (Besitzerentscheid 30.9.). */
  /* v1.91.0 (Figuren-Umbau, Besitzer 6.10.): 85 statt 45 - 43 Figurenstationen
     (24 neue Figuren, die meisten in Kapitel I und II) und 42 Stationen fuer
     Grossmeister und Bestien. */
  ok("the twelve chapters field 85 boss stages", bossStages.length === 85);
  ok("no beast before chapter III - chapters I and II hold figures and their two grandmasters only",
    bossStages.filter((st) => st.league <= 2 && st.boss.pure).map((st) => st.boss.pure).sort().join() === "b26,b27");
  ok("most figures join early: nine in chapter I, ten in II, seven in III, ever fewer after",
    [1, 2, 3, 4, 5, 6, 7].map((l) => bossStages.filter((st) => st.league === l && st.boss.piece).length).join() === "9,10,7,3,3,3,2");
  /* ... und zwar AUF dem Weg zum Drachen, nicht auf einem Parallelzweig: der
     erste Anlauf setzte sie an das Blatt L07s38 (next = []), der Drache stand
     auf dem anderen Zweig. Geprueft ueber die echten Kanten (next). */
  /* v1.91.0: der Drache huetet seine Halle in Kapitel VII wieder selbst
     (L07s41); die Brutmutter steht weiter auf dem Weg dorthin. */
  ok("... the Broodmother among them, on the path to the chapter VII dragon hall", (() => {
    const brut = bossStages.find((st) => st.boss.pure === "b03");
    const drache = CAMPAIGN.find((st) => st.league === 7 && st.boss && st.boss.piece === "dragon");
    if (!brut || brut.league !== 7 || !drache) return false;
    const seen = new Set([brut.id]); const q = [brut.id];
    while (q.length) { const id = q.shift(); const u = CAMPAIGN.find((st) => st.id === id); for (const w of u?.next || []) if (!seen.has(w)) { seen.add(w); q.push(w); } }
    return seen.has(drache.id) && (brut.next || []).length > 0;
  })());
  /* v1.90.18 (Besitzerentscheid 30.9.): DIE BOSSFORMATIONEN. Bis v1.90.17
     standen 31 von 32 Bossen in derselben Szene. Geprueft wird die Verteilung
     (jede Szene mindestens fuenfmal, nie in Kapitel I, am Finale oder beim
     Drachen), jede Szene am ECHTEN Brett nach createGame - und dass die
     Aufstellung fest ist (zweimal gebaut, zweimal gleich). */
  {
    const { bossFormation, BOSS_FORMATIONEN, withProgressPct, defaultProfile } = await import("./src/meta/index.js");
    const stationen = CAMPAIGN.filter((st) => st.boss && !st.final);
    const zahl = {};
    for (const st of stationen) { const a = bossFormation(st); zahl[a] = (zahl[a] || 0) + 1; }
    ok(`every formation is used at least five times (${JSON.stringify(zahl)})`, Object.keys(BOSS_FORMATIONEN).every((a) => (zahl[a] || 0) >= 5));
    ok("chapter I, the finals and the dragon keep the old scene", CAMPAIGN.filter((st) => st.boss && (st.final || st.league === 1 || st.boss.piece === "dragon")).every((st) => bossFormation(st) === "mauer"));
    const beispiel = (art) => stationen.find((st) => bossFormation(st) === art && st.rules === "hp");
    const brett = (st) => {
      const p = withProgressPct(defaultProfile(), 50, st.league);
      const m = buildStageMatch(st.id, p);
      return { m, g: createGame(undefined, m.aiArmy, { seed: 1, map: mapById(m.map), rules: m.rules }) };
    };
    const reihe = (g, r) => Array.from({ length: 8 }, (_, f) => { const q = g.board[idx(f, r, 8)]; return q ? (q.bossId ? "X" : q.kind) : "."; }).join("");
    { const { m, g } = brett(beispiel("leibwache")); ok(`leibwache: the rooks flank boss and king (${reihe(g, 7)})`, m.bossFormation === "leibwache" && reihe(g, 7) === "NBRXKRBN" && reihe(g, 6) === "PPPPPPPP"); }
    { const { m, g } = brett(beispiel("vorgeschoben")); ok(`vorgeschoben: the boss stands in the pawn rank, his throne empty (${reihe(g, 7)} / ${reihe(g, 6)})`, m.bossFormation === "vorgeschoben" && reihe(g, 7) === "RNB.KBNR" && reihe(g, 6) === "PPPXPPPP"); }
    { const { m, g } = brett(beispiel("leicht")); ok(`leicht: knights instead of rooks (${reihe(g, 7)})`, m.bossFormation === "leicht" && reihe(g, 7) === "NNBXKBNN"); }
    { const { m, g } = brett(stationen.find((st) => bossFormation(st) === "mauer" && st.rules === "hp" && st.boss.pure)); ok(`mauer: the old scene (${reihe(g, 7)})`, m.bossFormation === "mauer" && reihe(g, 7) === "RNBXKBNR"); }
    /* v1.91.0: die Figurenstation der fruehen Kapitel - die Figur auf b8, die Dame bleibt */
    { const { m, g } = brett(stationen.find((st) => st.league === 2 && st.boss.piece)); ok(`chapter II figure station: the figure on the knight's square, the queen stays (${reihe(g, 7)})`, m.bossFormation === "mauer" && reihe(g, 7) === "RXBQKBNR"); }
    const st = beispiel("vorgeschoben");
    ok("the scene is fixed: built twice, identical", JSON.stringify(brett(st).m.aiArmy) === JSON.stringify(brett(st).m.aiArmy));
  }
  /* Die Startseite verspricht "13 Monster, die du besiegen kannst". Bis
     v1.90.15 traten vier davon im ersten Weltdurchlauf nie auf (sie standen
     nur an zweiter Stelle einer Rotation). */
  {
    const { LEAGUE_BOSSES } = await import("./src/content/bosses.js");
    const monster = BOSSES.filter((b) => !LEAGUE_BOSSES.includes(b.id)).map((b) => b.id);
    const erstRunde = new Set(bossStages.filter((st) => st.boss.pure).map((st) => st.boss.pure));
    ok(`every one of the ${monster.length} beasts has a station in the first world lap`, monster.length === 28 && monster.every((id) => erstRunde.has(id)));
    ok("... and so has every one of the 14 grandmasters", LEAGUE_BOSSES.length === 14 && LEAGUE_BOSSES.every((id) => erstRunde.has(id)));
  }
  ok("43 of them are recruitable piece bosses, one per figure", bossStages.filter((st) => st.boss.piece).length === 43
    && new Set(bossStages.filter((st) => st.boss.piece).map((st) => st.boss.piece)).size === 43);
  {
    /* v1.91.0: JEDE Figur ausser den sieben, mit denen man beginnt, hat ihre Station */
    const { CHARACTER_LIST } = await import("./src/content/index.js");
    const start = CHARACTER_LIST.filter((c) => c.unlock?.type === "start").map((c) => c.id);
    const mitStation = new Set(bossStages.filter((st) => st.boss.piece).map((st) => st.boss.piece));
    const ohne = CHARACTER_LIST.map((c) => c.id).filter((id) => !start.includes(id) && !mitStation.has(id));
    ok(`every figure you do not start with can be won somewhere (without: ${ohne.join(", ") || "none"})`, ohne.length === 0);
  }
  ok("every pure boss resolves", bossStages.filter((st) => st.boss.pure).every((st) => bossById(st.boss.pure)));
  const m = buildStageMatch(ERWACHEN);
  /* v1.90.18: mit den Bossformationen kann ein Platz der Reihe leer sein und
     der Boss in der Bauernreihe stehen (front) - beide Reihen zusammen */
  const heerVon = (mm) => [...mm.aiArmy.back, ...(mm.aiArmy.front || [])].filter(Boolean);
  /* v1.91.0: am Erwachen steht eine FIGUR (die Heilerin) - vor Kapitel III gibt es keine Bestie */
  ok("in chapters I and II a figure boss stands BESIDE the queen (in the queen's knight's place), not instead of her",
    heerVon(m).some((sp) => sp.kind === "HL") && heerVon(m).some((sp) => sp.kind === "Q") && heerVon(m).filter((sp) => sp.kind === "N").length === 1 && m.bossFormation === "mauer");
  ok("... so no figure station in chapters I and II fields an army without its queen",
    CAMPAIGN.filter((st) => st.league <= 2 && st.boss?.piece).every((st) => heerVon(buildStageMatch(st.id, { campaign: { league: st.league } })).some((sp) => sp.kind === "Q")));
  ok("stage match exposes the boss for the UI (v1.91.0: the Healer stands where the magic wakes)", m.boss && m.boss.bossId === "pb_healer" && m.boss.unlocks === "healer");
  { const mm = buildStageMatch("L03s06", { campaign: { league: 3 } });
    ok("the first beast waits in chapter III: the Harrier replaces the queen", heerVon(mm).some((sp) => sp.kind === "X") && !heerVon(mm).some((sp) => sp.kind === "Q") && mm.boss.bossId === "b02"); }
  const pm = buildStageMatch("L06s12", { campaign: { league: 6 } }); // der Attentaeter wohnt in Kapitel VI
  /* v1.92.0: der Attentaeter liegt am Hauptweg - er entkommt einmal (boss.unlocks leer) und
     steht wie jede Figur NEBEN der Dame, in jedem Kapitel */
  ok("piece boss fields its own kind with boosted stats, beside the queen", heerVon(pm).some((sp) => sp.kind === "S" && sp.hp >= 8) && heerVon(pm).some((sp) => sp.kind === "Q")
    && buildStageMatch("L06s12", { campaign: { league: 6 } }).boss.unlocks === null
    && buildStageMatch("L06s12", { campaign: { league: 6, bossWins: { assassin: 1 } } }).boss.unlocks === "assassin");
  ok("in every chapter a figure boss stands beside the queen; masters and beasts replace her",
    CAMPAIGN.filter((st) => st.boss?.piece && st.boss.piece !== "dragon").every((st) => heerVon(buildStageMatch(st.id, { campaign: { league: st.league } })).some((sp) => sp.kind === "Q"))
    && CAMPAIGN.filter((st) => st.boss?.pure).every((st) => !heerVon(buildStageMatch(st.id, { campaign: { league: st.league } })).some((sp) => sp.kind === "Q")));
  /* v1.91.0: der Starrkopf der Probe ist der Inquisitor (Kapitel VIII, zwei
     Siege); der Hexenmeister wohnt jetzt in Kapitel XI (Bund Sturm: sehr spaet) */
  ok("a stubborn champion resists until his last demanded win (the Inquisitor wants two)",
    buildStageMatch("L08s18", { campaign: { league: 8 } }).boss.unlocks === null
    && buildStageMatch("L08s18", { campaign: { league: 8, bossWins: { inquisitor: 1 } } }).boss.unlocks === "inquisitor");
  ok("the dragon in his hall in chapter VII joins on the first win",
    buildStageMatch("L07s41", { campaign: { league: 7 } }).boss.unlocks === "dragon");
  ok("the first beast station rotates its monster with the world laps", (() => {
    const a = buildStageMatch("L03s06", { campaign: { league: 3 } });
    const b = buildStageMatch("L03s06", { campaign: { league: 15 } });
    return a.boss.bossId === "b02" && b.boss.bossId === "b04" && a.boss.unlocks === null;
  })());
  // monster stations rotate their champion by league — the whole bestiary marches
  const nA5 = (id) => CAMPAIGN.find((n) => n.id === id);
  ok("each chapter ends at its own fixed master", nodeBossSpec(nA5("L01s44"), 1).bossId === "b26"  // v1.91.0: Kapitel I endet bei Zahir
    && nodeBossSpec(nA5("L02s41"), 2).bossId === "b27"   // Varek, der Schwarze Ritter
    && nodeBossSpec(nA5("L04s24"), 4).bossId === "b12"   // der Richter ist eine Bestie in Kapitel IV
    && nA5("L05s16").boss.rotation[0] === "b22" && nodeBossSpec(nA5("L05s16"), 5).bossId === "b22"
    && nodeBossSpec(nA5("L05s16"), 17).bossId === "b40");
  ok("every rotated monster resolves to a real boss", CAMPAIGN.filter((n) => n.boss?.rotation).length === 27
    && CAMPAIGN.filter((n) => n.boss?.rotation).every((n) => n.boss.rotation.every((b) => bossById(b))));
  {
    /* v1.91.0: eine Rotation fuehrt nie einen Grossmeister und nie eine Bestie
       in ein Kapitel vor III */
    const { LEAGUE_BOSSES } = await import("./src/content/bosses.js");
    ok("no rotation ever fields a grandmaster", CAMPAIGN.filter((n) => n.boss?.rotation).every((n) => n.league >= 3 && n.boss.rotation.every((b) => !LEAGUE_BOSSES.includes(b))));
  }
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
  /* v1.90.20: die Staffel gilt den zwoelf GROSSMEISTERN (LEAGUE_BOSSES) - seit
     der Drache Kapitel I haelt, ist KAPITELMEISTER[0] eine Figur ("figur:dragon") */
  const { LEAGUE_BOSSES: GM } = await import("./src/content/bosses.js");
  const reihe = GM.map((id) => BOSSES.find((b) => b.id === id).abilities.length);
  /* v1.91.0: vierzehn Grossmeister - die zwoelf Kapitelmeister in Kapitelfolge,
     dazu Morwen (Mitte VI) und Thalor (Mitte IX) mit je vier */
  ok("Grossmeister: I-IV drei, V-VIII vier, IX-XII fuenf, Morwen und Thalor vier (" + reihe.join(",") + ")",
    JSON.stringify(reihe) === JSON.stringify([3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4]));
  {
    /* v1.91.0: jeder Grossmeister traegt eine Aura und einen Satz dazu, keine Bestie */
    const { auraText } = await import("./src/content/bosses.js");
    ok("jeder der 14 Grossmeister traegt eine Aura mit einem Satz in beiden Sprachen",
      GM.every((id) => { const b = BOSSES.find((x) => x.id === id); return b.aura && auraText(b.aura, false) && auraText(b.aura, true); }));
    ok("keine Bestie traegt eine Aura", BOSSES.filter((b) => !GM.includes(b.id)).every((b) => !b.aura && auraText(b.aura) === null));
  }
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
  { const { KAPITEL_TROPHAEE } = await import("./src/content/bosses.js");
    /* v1.91.0: die TROPHAEEN je Kapitel sind die Kapitelmeister - alle zwoelf
       sind jetzt Grossmeister (Kapitel I: Zahir, keine Figur mehr) */
    ok("die Trophaeen je Kapitel sind die Kapitelmeister, alle zwoelf Grossmeister",
      JSON.stringify(KAPITEL_TROPHAEE) === JSON.stringify(KAPITELMEISTER)
      && KAPITELMEISTER.length === 12 && KAPITELMEISTER.every((id) => GM.includes(id)) && KAPITELMEISTER[0] === "b26"); }
  ok("Brut hoechstens drei Bauern (Seuchenkoenig 3, Brutmutter 2, Fluesterin 1, Wandlerin 2)",
    BOSSES.every((b) => !b.moveSpec.spawn || b.moveSpec.spawn.max <= 3)
    && ["b24:3", "b03:2", "b11:1", "b21:2"].every((x) => { const [id, n] = x.split(":"); return BOSSES.find((b) => b.id === id).moveSpec.spawn.max === +n; }));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
