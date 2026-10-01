// THE BIG DRAGON (2x2) — rules pinned down.
import { createGame, legalMoves, applyMove, status } from "./src/core/index.js";
import { chooseMove } from "./src/ai/index.js";
import { makeRng } from "./src/core/ports/rng.js";
import { buildArmyFromFormation, formationLegal, unlockedCharacterIds } from "./src/meta/index.js";
import { mapById, CHARACTERS } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  ok  -", name); } else { fail++; console.log(" FAIL -", name); } };

/* v1.24.0: die Arena ist gestrichen - der Drache wird auf Klassik geprueft.
   Die Feldnummern hingen an W=10; sie werden jetzt aus W gerechnet. */
const map = mapById("classic");
const W = map.w;
const FLY = 2 * W + 2;          // Landeblock (Reihe 2, Linie 2)
const FOE = FLY + 1;            // der Feind unter dem Landeblock
const dform = [...map.defaultFormation]; dform[0] = "dragon"; dform[1] = null;
const mk = (lvl = 5, rules = "hp") => createGame(
  buildArmyFromFormation(() => lvl, dform),
  buildArmyFromFormation(() => 1, map.defaultFormation),
  { map, rules, seed: 11 });

// ── unfolding & the price ────────────────────────────────────────────────────
{
  const g = mk();
  const b = g.board;
  ok("the dragon unfolds at the edge anchor with three wing markers",
    b[0]?.kind === "D" && b[0].big && [1, W, W + 1].every((i) => b[i]?.kind === "D+" && b[i].ref === 0));
  ok("his price is paid: the neighbour and both pawns in front are gone",
    b.filter((p) => p && p.color === "w" && p.kind !== "D" && p.kind !== "D+").length === map.w * 2 - 4);
  ok("wing markers carry no hp of their own", b[1].hp === undefined && b[0].hp > 0);
}

// ── walking ──────────────────────────────────────────────────────────────────
{
  const g = mk();
  const step = legalMoves(g, "w").find((m) => m.special === "dragonStep");
  ok("on foot he shifts the whole block one square", !!step && step.to === W);
  const g2 = applyMove(g, step);
  ok("the block truly moved: old cells free, new block intact",
    g2.board[0] === null && g2.board[1] === null && g2.board[W]?.kind === "D" &&
    [W + 1, 2 * W, 2 * W + 1].every((i) => g2.board[i]?.kind === "D+"));
}

// ── flight: strike, settle, fall back ────────────────────────────────────────
{
  // hand-built: dragon anchor 0, one WEAK foe pawn at 22 → fly to 21 covers it, it dies → settle
  const g = mk(9); // level 9: range 4, atk 8
  g.board[FOE] = { id: 901, kind: "P", color: "b", level: 1, abilities: [], shield: 0, used: {}, hasMoved: true, maxHp: 2, hp: 2, atk: 1 };
  const fly = legalMoves(g, "w").find((m) => m.special === "dragonFly" && m.to === FLY);
  ok("flight may land on foes", !!fly);
  const g2 = applyMove(g, fly);
  ok("all covered foes fell -> he settles on the new block",
    g2.board[FLY]?.kind === "D" && g2.board[0] === null && g2.lastMove.bounced === false && g2.captured.w.includes("P"));
  ok("the wings are spent: once per game", (g2.board[FLY].used || {}).dragon_flight === true &&
    !legalMoves(g2, "w").some((m) => m.special === "dragonFly"));
}
{
  // a TOUGH foe on the landing zone survives → the strike counts, he falls back
  const g = mk(3); // level 3: flight range 2, atk 5
  g.board[FOE] = { id: 902, kind: "R", color: "b", level: 1, abilities: [], shield: 0, used: {}, hasMoved: true, maxHp: 20, hp: 20, atk: 3 };
  const fly = legalMoves(g, "w").find((m) => m.special === "dragonFly" && m.to === FLY);
  const g2 = applyMove(g, fly);
  ok("a survivor throws him back to his take-off block",
    g2.board[0]?.kind === "D" && g2.board[FLY] === null && g2.lastMove.bounced === true);
  ok("the strike still counts (rook bruised) and the wings are spent anyway",
    g2.board[FOE].hp < 20 && (g2.board[0].used || {}).dragon_flight === true);
}

// ── on foot he crushes a foe caught under his leading edge ──────────────────
{
  const g = mk(5); // atk 6
  g.board[2 * W] = { id: 903, kind: "P", color: "b", level: 1, abilities: [], shield: 0, used: {}, hasMoved: true, maxHp: 2, hp: 2, atk: 1 };
  const step = legalMoves(g, "w").find((m) => m.special === "dragonStep" && m.to === W);
  ok("he may step onto a foe under his leading edge", !!step);
  const g2 = applyMove(g, step);
  ok("the crushed foe is captured and he settles forward",
    g2.captured.w.includes("P") && g2.board[W]?.kind === "D" && g2.board[0] === null && g2.board[2 * W]?.kind === "D+");
}

// ── damage routes through the wings; death clears all four cells ─────────────
{
  const g = mk(2, "hp");
  const a = 0;
  // an enemy rook shoots the wing marker cell -> the DRAGON bleeds
  g.board[2] = { id: 904, kind: "R", color: "b", level: 9, abilities: [], shield: 0, used: {}, hasMoved: true, maxHp: 20, hp: 20, atk: 99 };
  const hit = legalMoves(g, "b").find((m) => m.to === 1); // wing cell
  ok("foes can target a wing cell", !!hit);
  const g2 = applyMove(g, hit);
  ok("the blow routes to the dragon and his death clears all four squares",
    g2.captured.b.includes("D") && [0, W, W + 1].every((i) => g2.board[i] === null) && g2.board[1]?.kind === "R");
}

// ── formation law ────────────────────────────────────────────────────────────
{
  const owned = [...unlockedCharacterIds({ campaign: { unlocked: Object.keys(CHARACTERS) } })];
  // Der Drache frisst zwei FLEX-Plaetze. Die Krone sitzt auf ihren festen
  // Feldern (v1.24.0: 4/3 auf der Achterreihe), damit diese Faelle allein das
  // DRACHENGESETZ pruefen, nicht die Sitzordnung der Koenigspaare.
  const f1 = ["dragon", null, "rook", "queen", "king", "bishop", "knight", "rook"];
  const f2 = ["rook", "knight", "bishop", "queen", "king", "dragon", "knight", "rook"];
  const f3 = ["dragon", "knight", "rook", "queen", "king", "bishop", "knight", "rook"];
  ok("dragon at the edge with an empty wing is lawful", formationLegal(f1, owned) === true);
  ok("a dragon in the middle is turned away", formationLegal(f2, owned) === false);
  ok("without the empty wing slot he may not deploy", formationLegal(f3, owned) === false);
}

// ── the AI wields him without breaking the board ─────────────────────────────
{
  const dform = ["dragon", null, "rook", "queen", "king", "bishop", "knight", "rook"];
  // one seed is a lottery ticket — the single-cast law reshuffled every game
  // tree, so we assert the TRUTH we care about: his moves stay ON OFFER, a
  // full game ends cleanly, and across a handful of seeds the AI does pick him.
  let dragonMoves = 0, offered = 0, cleanGames = 0, gLast = null;
  for (const seed of [42, 7, 13, 99]) {
    let g = createGame(buildArmyFromFormation(() => 6, dform), buildArmyFromFormation(() => 4, map.defaultFormation), { map, rules: "hp", seed });
    const rng = makeRng(seed);
    let plies = 0;
    while (plies < 80 && !status(g).over) {
      if (legalMoves(g).some((m) => m.special === "dragonStep" || m.special === "dragonFly")) offered++;
      const m = chooseMove(g, 1, rng);
      if (!m) break;
      if (m.special === "dragonStep" || m.special === "dragonFly") dragonMoves++;
      g = applyMove(g, m); plies++;
    }
    gLast = g;
    if (status(g).over === true && plies > 10) cleanGames++;
    if (dragonMoves >= 1 && cleanGames >= 1) break;
  }
  ok("a full AI game with the big dragon ends cleanly", cleanGames >= 1);
  ok("the beast's moves stay on offer throughout", offered > 0);
  ok("the AI actually moved the beast (across seeds)", dragonMoves >= 1);
  ok("wing markers never orphan across a whole game",
    gLast.board.every((p) => !p || p.kind !== "D+" || gLast.board[p.ref]?.kind === "D"));
}

// ── the step-forward target sits UNDER his own 2x2 block (a wing square) ──
// the tap handler must let a valid move win over the "wing = dragon" redirect,
// or he can never walk forward. Here we assert the move is legal & lands right.
{
  const dform = ["dragon", null, "rook", "queen", "king", "bishop", "knight", "rook"];
  const g = createGame(buildArmyFromFormation(() => 6, dform), buildArmyFromFormation(() => 4, map.defaultFormation), { map, rules: "hp", seed: 7 });
  const W2 = g.w;
  const anchor = g.board.findIndex((x) => x && x.big && x.kind === "D");
  const fwd = anchor + W2; // one square forward = his own lower-left wing cell
  ok("the dragon's forward square is currently a wing of his own block",
    g.board[fwd]?.kind === "D+" && g.board[fwd].ref === anchor);
  const step = legalMoves(g).find((m) => m.from === anchor && m.to === fwd);
  ok("stepping forward onto that wing square is a legal move", !!step);
  const g2 = applyMove(g, step);
  const newAnchor = g2.board.findIndex((x) => x && x.big && x.kind === "D");
  ok("after the step he has advanced one rank", ((newAnchor / W2) | 0) === ((anchor / W2) | 0) + 1);
}

/* ── v1.90.14 (Audit A36): DER DRACHENBLOCK VERSCHLUCKTE DEN HELDEN ─────
   Beim Entfalten raeumte der Kern seine vier Felder mit
   `for (const c of cells) if (c !== i) board[c] = null;` - ohne zu fragen,
   WAS dort steht. Gemessen im Audit (H1): Aufstellung ["dragon", null, ...]
   mit dem Helden auf Spalte 1 ergab in Reihe 2 `D+ D+ P P P P P P`, KEIN
   HELD. Er war stumm fort, und mit ihm jede byHero-Belohnung der Partie.

   Der Preis bleibt (Nachbar und zwei Bauern weichen) - aber wer nicht
   ersetzbar ist, wird VERSETZT: Held, Koenig, Dame, Meister.
   GEGENGEPRUEFT: gegen v1.90.13 ist die erste Pruefung rot - dort ist der
   Held nach dem Aufbau schlicht nicht mehr auf dem Brett. */
{
  const spec = (k) => ({ kind: k, level: 1, abilities: [], shield: 0 });
  /* Drache auf Spalte 0, Fluegel auf 1 - der Block deckt also die Spalten
     0 und 1 in der Grundreihe UND in der Bauernreihe. Der Held steht auf
     Spalte 1, mitten im Block. */
  const heer = {
    back: [spec("D"), null, spec("B"), spec("Q"), spec("K"), spec("B"), spec("N"), spec("R")],
    pawn: spec("P"),
    hero: { col: 1, spec: { kind: "P", level: 4, abilities: [], shield: 0 } },
  };
  heer.back[0].big = true;
  const g = createGame(heer, undefined, { seed: 36 });
  const W = g.w;
  const held = g.board.find((p) => p && p.hero);
  ok("A36: der Held steht nach dem Aufbau UEBERHAUPT auf dem Brett", !!held);
  if (held) {
    const wo = g.board.indexOf(held);
    const f = wo % W, r = (wo / W) | 0;
    ok("A36: er steht in seiner eigenen Reihe (der Bauernreihe)", r === 1, `Reihe ${r}`);
    ok("A36: und NICHT mehr im Drachenblock (Spalte 0 oder 1)", f >= 2, `Spalte ${f}`);
    ok("A36: er ist auf die NAECHSTE freie Spalte gerueckt", f === 2, `Spalte ${f}`);
    ok("A36: mit seinen eigenen Werten, nicht als gewoehnlicher Bauer", held.level === 4);
  }
  /* Der Drache steht trotzdem, und sein Preis ist bezahlt. */
  const drache = g.board.find((p) => p && p.kind === "D" && p.big);
  ok("A36: der Drache ist entfaltet", !!drache);
  ok("A36: er hat drei Fluegelfelder", g.board.filter((p) => p && p.kind === "D+").length === 3);
  /* Genau EIN Bauer weniger als Spalten - der auf Spalte 0 ist der Preis,
     der auf Spalte 1 war der Held und steht jetzt auf 2. */
  const eigeneBauern = g.board.filter((p) => p && p.kind === "P" && p.color === "w");
  ok("A36: die Bauernreihe hat den Preis bezahlt, aber nicht mehr",
    eigeneBauern.length === W - 2, `${eigeneBauern.length} statt ${W - 2}`);

  /* Und der KOENIG wird ebenso wenig verschluckt. Dafuer steht der Drache
     direkt neben ihm: Spalte 3, Fluegel auf 4 - dort sitzt der Koenig. */
  const heer2 = {
    back: [spec("R"), spec("N"), spec("B"), { ...spec("D"), big: true }, null, spec("B"), spec("N"), spec("R")],
    pawn: spec("P"),
    hero: { col: 7, spec: { kind: "P", level: 1, abilities: [], shield: 0 } },
  };
  heer2.back[4] = spec("K");
  const g2 = createGame(heer2, undefined, { seed: 37 });
  const koenig = g2.board.find((p) => p && p.kind === "K" && p.color === "w");
  ok("A36: auch der Koenig ueberlebt den Drachenblock", !!koenig);
}

// ── v1.90.20: IM KLASSISCHEN SCHACH HAT DER DRACHE VIER LEBEN (Besitzer 1.10.) ──
// Ein Schlag auf irgendeines seiner vier Felder kostet ein Leben, der Angreifer
// bleibt stehen; erst der vierte Schlag nimmt ihn - alle vier Felder auf einmal.
{
  const g = mk(5, "chess");
  const d = g.board[0];
  ok("Schach: der grosse Drache startet mit vier Leben (3 Schilde, lebenMax 4)", d.shield === 3 && d.lebenMax === 4);
  const gh = mk(5, "hp");
  ok("HP-Gefecht: dort gilt sein Leben, nicht die vier Schlaege", gh.board[0].shield === 0 && gh.board[0].lebenMax === undefined);
  // ein schwarzer Turm direkt ueber dem rechten Fluegel (Feld W+1), Weg frei
  let s = mk(5, "chess");
  const ziel = 2 * W + 1;                       // Feld ueber dem Fluegel W+1
  for (let i = 2 * W; i < 3 * W; i++) s.board[i] = null;
  s.board[ziel] = { id: 777, kind: "R", color: "b", level: 1, abilities: [], shield: 0, used: {}, hasMoved: true };
  s.turn = "b";
  const schlaege = [];
  for (let n = 0; n < 4; n++) {
    const hieb = legalMoves(s, "b").find((m) => m.from === ziel && m.to === W + 1);
    if (!hieb) { schlaege.push("kein Zug"); break; }
    s = applyMove(s, hieb);
    const a = s.board[0];
    schlaege.push(a && a.kind === "D" ? `prallt ab (noch ${a.shield + 1})` : "Drache faellt");
    ok(`Schlag ${n + 1}: der Turm bleibt auf seinem Feld, solange der Drache lebt`,
      n < 3 ? (s.board[ziel]?.id === 777 && s.lastMove.bounced === true) : s.board[W + 1]?.id === 777);
    s.turn = "b";
  }
  ok(`vier Schlaege, vier Leben: ${schlaege.join(" · ")}`,
    schlaege.join("|") === "prallt ab (noch 3)|prallt ab (noch 2)|prallt ab (noch 1)|Drache faellt");
  ok("beim vierten Schlag werden alle vier Felder frei (der Turm steht auf dem getroffenen)",
    s.board[0] === null && s.board[1] === null && s.board[W] === null && s.board[W + 1]?.kind === "R");
  ok("und der Drache zaehlt als geschlagen", s.captured.b.includes("D"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
