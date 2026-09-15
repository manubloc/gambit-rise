/* ── DIE ZEHN BUENDE, EINER NACH DEM ANDEREN (v1.14.0) ───────────────────────
   Bis hierher lagen die Bundproben verstreut: das Erwachen in test_features,
   die Wirkung in test_combat, das Fenster in test_ui. Der Besitzer wollte
   sie ALLE noch einmal, jeden Bund fuer sich, testgetrieben.

   Jeder Bund bekommt hier denselben Vierklang:
     1. ERWACHEN  - nur wenn ALLE Figuren auf Hoechststufe stehen
     2. WIRKUNG   - im Gefecht, nicht nur als Funktionsaufruf
     3. GEGENPROBE - ohne den Bund bleibt die Wirkung aus
     4. KULISSE   - jede Figur des Bundes traegt sein Bild auf der Kachel

   Die Proben sind ZUERST geschrieben worden und dann erst der Code fuer die
   Kulissen (Punkt 4) - beim ersten Lauf standen zehn davon rot. */
import { readdirSync } from "node:fs";

let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) { passed++; console.log(`ok - ${name}`); } else { failed++; console.log(`FAIL - ${name}`); } };

const { BUENDE, bundErwacht, bundVon } = await import("./src/content/buende.js");
const { createGame, applyMove, reduce } = await import("./src/core/index.js");
const { legalMovesFrom } = await import("./src/core/sim/transitions.js");
const { geleitCommand } = await import("./src/core/sim/commands.js");
const { talentWirkt } = await import("./src/core/rules/moves.js");
const { geleitTauschbar, schildwachtDeckt } = await import("./src/core/rules/buende.js");
const { evaluate } = await import("./src/ai/evaluate.js");
const { buildArmyFromFormation, defaultFormation } = await import("./src/meta/index.js");
const { mapById, CHARACTERS } = await import("./src/content/index.js");
const { kulisseFuer } = await import("./src/app/ui/kulissen.js").catch(() => ({ kulisseFuer: null }));

const w = 8;
const fig = (kind, charId, color, hp, atk = 6) =>
  ({ kind, charId, color, hp, maxHp: hp, atk, abilities: [], level: 10, shield: 0 });
const leer = (buende) => {
  const ar = () => buildArmyFromFormation(() => 10, defaultFormation(mapById("classic")));
  const g = createGame(ar(), ar(), { rules: "hp", map: mapById("classic"), buende });
  for (let i = 0; i < 64; i++) g.board[i] = null;
  g.board[7 * w + 7] = fig("K", "king", "b", 20, 5);
  g.board[7 * w + 0] = fig("K", "king", "w", 20, 5);
  return g;
};
const wo = (g, charId) => g.board.findIndex((p) => p && p.charId === charId);
const zug = (g, von, nach) => applyMove(g, legalMovesFrom(g, von).find((m) => m.to === nach));

/* 1. ERWACHEN - fuer alle zehn nach demselben Muster. Die Stufe kommt aus
   einer Funktion, wie im Spiel; alle auf 10 weckt, eine auf 9 nicht. */
const erwachen = (id) => {
  const b = BUENDE[id];
  const alle = () => 10, max = () => 10;
  const einer = b.figuren[0];
  const fastAlle = (cid) => (cid === einer ? 9 : 10);
  ok(`${b.nameDe}: erwacht, wenn alle ${b.figuren.length} auf Hoechststufe stehen`, bundErwacht(id, alle, max) === true);
  ok(`${b.nameDe}: schlaeft, solange eine Figur (${einer}) eine Stufe darunter steht`, bundErwacht(id, fastAlle, max) === false);
};
/* 4. KULISSE - jede Figur des Bundes bekommt das Bild ihres Bundes. */
const kulissen = new Set(readdirSync("src/app/ui/assets/kulissen").filter((f) => f.endsWith(".webp")));
const kulisse = (id) => {
  const b = BUENDE[id];
  ok(`${b.nameDe}: die Kulisse bund-${id}.webp liegt vor`, kulissen.has(`bund-${id}.webp`));
  const treffer = b.figuren.filter((cid) => {
    const k = kulisseFuer ? kulisseFuer({ charId: cid }) : null;
    return typeof k === "string" && k.includes(`bund-${id}`);
  });
  ok(`${b.nameDe}: alle ${b.figuren.length} Figuren tragen sie (${treffer.length} von ${b.figuren.length})`,
    treffer.length === b.figuren.length);
};

/* ── KRONE: der Paladin faengt den Treffer ab ─────────────────────────── */
console.log("\n== KRONE (Paladin · Koenig) ==");
{
  erwachen("krone");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[3 * w + 4] = fig("K", "king", "w", 20, 5);
    g.board[3 * w + 5] = fig("U", "paladin", "w", 18);
    g.board[4 * w + 4] = fig("R", "rook", "b", 12, 7);
    g.board[7 * w + 0] = null;
    g.turn = "b";
    return g;
  };
  const mit = zug(bau(["krone"]), 4 * w + 4, 3 * w + 4);
  ok("WIRKUNG: der Koenig bleibt unverletzt, der Paladin daneben blutet",
    mit.board[3 * w + 4].hp === 20 && mit.board[3 * w + 5].hp < 18);
  const ohne = zug(bau([]), 4 * w + 4, 3 * w + 4);
  ok("GEGENPROBE: ohne Bund trifft es den Koenig selbst",
    ohne.board[3 * w + 4].hp < 20 && ohne.board[3 * w + 5].hp === 18);
  kulisse("krone");
}

/* ── KONZIL: der Rat lehnt einen Schlag auf den Koenig ab ─────────────── */
console.log("\n== KONZIL (Erzbischof · Kanzler · Dame) ==");
{
  erwachen("konzil");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[3 * w + 4] = fig("K", "king", "w", 20);
    g.board[7 * w + 0] = null;
    g.board[0] = fig("E", "archbishop", "w", 15);
    g.board[1] = fig("Z", "chancellor", "w", 15);
    g.board[2] = fig("Q", "queen", "w", 15);
    g.board[4 * w + 4] = fig("R", "rook", "b", 12, 7);
    g.turn = "b";
    return g;
  };
  const mit = zug(bau(["konzil"]), 4 * w + 4, 3 * w + 4);
  ok("WIRKUNG: das Konzil lehnt den Schlag ab, der Koenig bleibt heil", mit.board[3 * w + 4].hp === 20);
  ok("und es ist danach verbraucht - einmal je Partie", mit.konzilVerbraucht?.w === true);
  const ohne = zug(bau([]), 4 * w + 4, 3 * w + 4);
  ok("GEGENPROBE: ohne Bund trifft der Schlag", ohne.board[3 * w + 4].hp < 20);
  kulisse("konzil");
}

/* ── GELEIT: zwei der drei tauschen die Plaetze, ein Zug, einmal ─────── */
console.log("\n== GELEIT (Springer · Laeufer · Turm) ==");
{
  erwachen("geleit");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[10] = fig("N", "knight", "w", 12);
    g.board[20] = fig("B", "bishop", "w", 12);
    g.board[30] = fig("R", "rook", "w", 12);
    g.turn = "w";
    return g;
  };
  const r = reduce(bau(["geleit"]), geleitCommand("w", 10, 30));
  ok("WIRKUNG: Springer und Turm tauschen die Plaetze",
    wo(r.state, "knight") === 30 && wo(r.state, "rook") === 10);
  ok("der Tausch kostet den Zug", r.state.turn === "b");
  const r2 = reduce(r.state, geleitCommand("w", 10, 20));
  ok("ein zweiter Tausch wird abgelehnt", wo(r2.state, "knight") === 30);
  ok("GEGENPROBE: ohne Bund ist kein Tausch offen", geleitTauschbar(bau([]), "w") === null);
  const g3 = bau(["geleit"]); g3.board[30] = null;
  ok("und ohne den Turm auch mit Bund nicht", geleitTauschbar(g3, "w") === null);
  kulisse("geleit");
}

/* ── FAEHRTE: zieht einer, rueckt der andere nach ─────────────────────── */
console.log("\n== FAEHRTE (Spaeher · Kundschafter) ==");
{
  erwachen("faehrte");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[2 * w + 2] = fig("H", "hawk", "w", 9);
    g.board[5 * w + 5] = fig("P", "pathfinder", "w", 9);
    g.turn = "w";
    return g;
  };
  const mit = zug(bau(["faehrte"]), 2 * w + 2, 3 * w + 3);
  ok("WIRKUNG: der Kundschafter rueckt in dieselbe Richtung nach", wo(mit, "pathfinder") === 6 * w + 6);
  const ohne = zug(bau([]), 2 * w + 2, 3 * w + 3);
  ok("GEGENPROBE: ohne Bund bleibt er stehen", wo(ohne, "pathfinder") === 5 * w + 5);
  kulisse("faehrte");
}

/* ── SCHATTEN: der Attentaeter ist unsichtbar, bis Hexerin oder Magier zieht */
console.log("\n== SCHATTEN (Attentaeter · Hexerin · Magier) ==");
{
  erwachen("schatten");
  const bau = (buende, lastMove = null) => {
    const g = leer(buende);
    g.board[2 * w + 2] = fig("A", "assassin", "w", 9);
    g.board[5 * w + 5] = fig("W", "sorceress", "w", 9);
    g.lastMove = lastMove;
    return g;
  };
  const sichtbar = evaluate(bau([]), "w");
  const verborgen = evaluate(bau(["schatten"]), "w");
  ok(`WIRKUNG: die KI rechnet den verborgenen Attentaeter nicht ein (${sichtbar} -> ${verborgen})`, verborgen < sichtbar);
  const verraten = evaluate(bau(["schatten"], { color: "w", charId: "sorceress", from: 0, to: 1 }), "w");
  ok("sobald die Hexerin zieht, zaehlt er wieder", verraten === sichtbar);
  ok("GEGENPROBE: ohne Bund ist er von Anfang an sichtbar", sichtbar === evaluate(bau([]), "w"));
  kulisse("schatten");
}

/* ── SCHILDWACHT: Schild fuer ihre Reihe - nur wenn beide darin stehen ── */
console.log("\n== SCHILDWACHT (Techniker · Schildtraeger) ==");
{
  erwachen("schildwacht");
  const brett = (buende, beide = true) => {
    const b = new Array(64).fill(null);
    b[3 * w + 1] = fig("E", "engineer", "w", 12);
    b[beide ? 3 * w + 5 : 6 * w + 5] = fig("G", "guardian", "w", 12);
    b[3 * w + 3] = fig("R", "rook", "w", 12);
    b[6 * w + 3] = fig("B", "bishop", "w", 12);
    return { board: b, w, h: 8, buende };
  };
  ok("WIRKUNG: wer in ihrer Reihe steht, ist gedeckt", !!schildwachtDeckt(brett(["schildwacht"]), 3 * w + 3));
  ok("wer woanders steht, nicht", !schildwachtDeckt(brett(["schildwacht"]), 6 * w + 3));
  ok("und gar nichts, wenn die beiden sich keine Reihe teilen", !schildwachtDeckt(brett(["schildwacht"], false), 3 * w + 3));
  ok("GEGENPROBE: ohne Bund deckt niemand", !schildwachtDeckt(brett([]), 3 * w + 3));
  kulisse("schildwacht");
}

/* ── GEZEITEN: der Kapitaen zieht durch EIGENE Figuren hindurch ───────── */
console.log("\n== GEZEITEN (Kapitaen · Stratege) ==");
{
  erwachen("gezeiten");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[0] = fig("R", "captain", "w", 14);
    g.board[3] = fig("P", "pawn", "w", 8);
    g.board[6] = fig("N", "knight", "b", 9);
    g.board[5 * w + 5] = fig("S", "strategist", "w", 12);
    g.turn = "w";
    return g;
  };
  const spalten = (g) => legalMovesFrom(g, 0).filter((m) => Math.floor(m.to / w) === 0).map((m) => m.to % w).sort((a, b) => a - b);
  const mit = spalten(bau(["gezeiten"]));
  ok(`WIRKUNG: mit Gezeiten zieht er durch den eigenen Bauern (${mit.join(",")})`, mit.includes(4) && mit.includes(5));
  ok("und schlaegt den Gegner dahinter", mit.includes(6));
  ok("aber hinter dem Gegner ist Schluss - er ist kein Geist", !mit.includes(7));
  ok("GEGENPROBE: ohne Bund endet er vor der eigenen Figur", spalten(bau([])).join(",") === "1,2");
  kulisse("gezeiten");
}

/* ── BANNKREIS: gegnerische Talente im Umkreis von zwei Feldern gesperrt ── */
console.log("\n== BANNKREIS (Seherin · Inquisitor) ==");
{
  erwachen("bannkreis");
  const st = (buende) => {
    const b = new Array(64).fill(null);
    b[4 * w + 4] = fig("Y", "seeress", "b", 9);
    return { board: b, w, h: 8, buende };
  };
  ok("WIRKUNG: zwei Felder von der Seherin schweigt ein Talent", !talentWirkt("bulwark", "hp", st(["bannkreis"]), 6 * w + 4, "w"));
  ok("drei Felder weiter wirkt es", talentWirkt("bulwark", "hp", st(["bannkreis"]), 7 * w + 4, "w"));
  ok("GEGENPROBE: ohne Bund wirkt es auch daneben", talentWirkt("bulwark", "hp", st([]), 6 * w + 4, "w"));
  kulisse("bannkreis");
}

/* ── STURM: die Amazone kehrt zurueck, der hinterste Bauer faellt ─────── */
console.log("\n== STURM (Amazone · Warlock) ==");
{
  erwachen("sturm");
  const bau = (buende, mitBauern = true) => {
    const g = leer(buende);
    g.board[4 * w + 4] = fig("M", "amazon", "w", 3, 14);
    g.board[5 * w + 5] = fig("V", "warlock", "w", 12, 8);
    if (mitBauern) { g.board[1 * w + 2] = fig("P", "pawn", "w", 8, 3); g.board[5 * w + 1] = fig("P", "pawn", "w", 8, 3); }
    g.board[4 * w + 5] = fig("R", "rook", "b", 12, 20);
    g.turn = "b";
    return g;
  };
  const schlag = (g) => zug(g, 4 * w + 5, 4 * w + 4);
  const mit = schlag(bau(["sturm"]));
  ok(`WIRKUNG: sie kehrt auf das Feld des hintersten Bauern zurueck (${wo(mit, "amazon")})`, wo(mit, "amazon") === 1 * w + 2);
  ok("und dieser Bauer faellt dafuer", mit.board.filter((p) => p && p.kind === "P" && p.color === "w").length === 1);
  ok("mit halber Kraft, nicht voll geheilt", mit.board[wo(mit, "amazon")].hp < mit.board[wo(mit, "amazon")].maxHp);
  ok("ohne Bauern faellt sie auch mit Bund", wo(schlag(bau(["sturm"], false)), "amazon") < 0);
  ok("GEGENPROBE: ohne Bund faellt sie, obwohl Bauern da sind", wo(schlag(bau([])), "amazon") < 0);
  kulisse("sturm");
}

/* ── NACHTWACHE: heilt je Zug einen angrenzenden Verwundeten ──────────── */
console.log("\n== NACHTWACHE (Alchemist · Barde · Flaggentraeger) ==");
{
  erwachen("nachtwache");
  const bau = (buende) => {
    const g = leer(buende);
    g.board[3 * w + 3] = fig("L", "alchemist", "w", 12);
    g.board[3 * w + 4] = { ...fig("R", "rook", "w", 12), hp: 5 };
    g.board[0] = fig("N", "knight", "w", 9);
    g.turn = "w";
    return g;
  };
  const mit = applyMove(bau(["nachtwache"]), legalMovesFrom(bau(["nachtwache"]), 0)[0]);
  ok("WIRKUNG: der Alchemist heilt den verwundeten Nachbarn um eins", mit.board[3 * w + 4].hp === 6);
  ok("die Buende ueberleben den Zug im Spielstand", Array.isArray(mit.buende) && mit.buende.includes("nachtwache"));
  const ohne = applyMove(bau([]), legalMovesFrom(bau([]), 0)[0]);
  ok("GEGENPROBE: ohne Bund heilt niemand", ohne.board[3 * w + 4].hp === 5);
  kulisse("nachtwache");
}

/* ── UND WER KEINEN BUND HAT ───────────────────────────────────────────── */
console.log("\n== OHNE BUND: Bauer, Gambit, Drache ==");
{
  const ohne = Object.keys(CHARACTERS).filter((cid) => !bundVon(cid)).sort();
  ok(`genau drei Figuren stehen in keinem Bund (${ohne.join(", ")})`, ohne.join(",") === "dragon,gambit,pawn");
  const k = (cid) => (kulisseFuer ? kulisseFuer({ charId: cid }) : undefined);
  ok("der Drache traegt seine eigene Kulisse", typeof k("dragon") === "string" && k("dragon").includes("drache"));
  ok("Bauer und Gambit tragen keine - sie haben keinen Bund", k("pawn") === null && k("gambit") === null);
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
