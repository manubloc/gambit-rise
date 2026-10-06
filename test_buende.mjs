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

/* 1. ERWACHEN - fuer alle nach demselben Muster. Seit v1.91.0 (Besitzer
   6.10.2026) zaehlt die AUFSTELLUNG, nicht mehr die Stufe: stehen alle
   Figuren des Bundes im Heer, wirkt er; fehlt eine, schlaeft er. */
const erwachen = (id) => {
  const b = BUENDE[id];
  const einer = b.figuren[0];
  ok(`${b.nameDe}: erwacht, wenn alle ${b.figuren.length} in der Aufstellung stehen`, bundErwacht(id, () => true) === true);
  ok(`${b.nameDe}: schlaeft, solange eine Figur (${einer}) nicht aufgestellt ist`, bundErwacht(id, (cid) => cid !== einer) === false);
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
  /* ── v1.90.4 (Audit A34): KEINE HAND AM AUSGANGSZUSTAND ───────────
     `board.slice()` ist eine FLACHE Kopie: die Figuren-Objekte sind
     dieselben. `eins.hasMoved = true` veraenderte damit den Zustand VOR dem
     Geleit und jeden history-Eintrag mit - obwohl reducer.js im Kopf
     "Pure: never mutates state" verspricht. Folge: nach einem Zeitenwender
     zurueck blieb hasMoved stehen, die Rochade war verloren, und ein Replay
     wich ab. */
  {
    const vorher = bau(["geleit"]);
    const turmVorher = vorher.board[30];
    const nach = reduce(vorher, geleitCommand("w", 10, 30)).state;
    ok("A34: der Turm im AUSGANGSzustand bleibt ungezogen",
      turmVorher.hasMoved !== true && vorher.board[30].hasMoved !== true);
    ok("A34: im neuen Zustand ist er gezogen", nach.board[10].hasMoved === true);
    ok("A34: und es sind wirklich zwei verschiedene Objekte",
      nach.board[10] !== turmVorher);
    ok("A34: das Geleit dreht den Zugzaehler weiter",
      nach.moveCount === (vorher.moveCount || 0) + 1);
    ok("A34: und die HP-Remis-Uhr", nach.ohneSchaden === (vorher.ohneSchaden || 0) + 1);
  }
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
  ok("der Bauer traegt seine eigene (v1.14.2)", k("pawn") === "figur-bauer");
  ok("der Gambit traegt seine eigene (v1.14.2)", k("gambit") === "figur-gambit");
}

/* ══ v1.90.10 (Audit A9): DIE BUENDE KOMMEN JETZT WIRKLICH INS GEFECHT ═══
   Bis v1.90.9 wurde `state.buende` von KEINER der neun createGame-Stellen
   gesetzt - state.js:30 ist die einzige Setzstelle und bekam die Liste nie.
   `hat(state, bund)` gab damit immer false zurueck: der Paladin fing nichts
   ab, das Konzil lehnte nichts ab, der Geleit-Knopf erschien nie. Der
   Spieler erweckte die Buende mit Skillpunkten, sah das Fenster "Der Bund
   ist erwacht" - und merkte im Gefecht nichts.

   UND DIESE SUITE HAT ES NICHT GEMERKT, weil sie `buende` von Hand
   injiziert (leer(["geleit"]) und so weiter) - sie prueft die WIRKUNG, nicht
   den WEG dorthin. Genau diese Luecke schliessen die Pruefungen hier: vom
   Spielstand bis in den Zustand, ohne Handanlegen.
   `hat` ist in core/rules/buende.js nicht exportiert (modulintern) - hier
   wird darum dieselbe Frage gestellt, die es stellt. */
console.log("\n== A9: DER WEG VOM SPIELSTAND IN DEN KERN ==");
{
  const { hat: hatBund } = await import("./src/core/rules/buende.js");
  const { buendeFuer, meineBuende, heerIds, buildArmyForMap } = await import("./src/meta/index.js");
  const { defaultProfile } = await import("./src/meta/profile.js");
  const { createGame: mkGame, legalMoves: zuege, applyMove: zieh } = await import("./src/core/index.js");
  const { BUND_LISTE } = await import("./src/content/buende.js");
  const { REIHE_FUENF } = await import("./src/meta/index.js");

  const frisch = defaultProfile();
  const heer0 = buildArmyForMap(frisch, mapById("classic"), null, "hp");
  /* v1.91.0: die Werksaufstellung enthaelt Springer, Laeufer und Turm - das
     Geleit STUENDE also beisammen. Es wirkt trotzdem erst, wenn der Spieler
     seine Reihe selbst stellen darf: vorher ist ein Bund keine Entscheidung. */
  ok("v1.91.0: die Werksaufstellung haelt das Geleit beisammen", buendeFuer(frisch, heer0).includes("geleit"));
  ok("v1.91.0: ein frischer Stand hat trotzdem keinen wirkenden Bund (Reihe noch zu)", meineBuende(frisch, heer0).length === 0);
  const offen = { ...frisch, campaign: { ...frisch.campaign, cleared: [REIHE_FUENF[0]] } };
  ok("v1.91.0: ist die hintere Reihe frei, wirkt das Geleit", meineBuende(offen, buildArmyForMap(offen, mapById("classic"), null, "hp")).join() === "geleit");
  ok("v1.91.0: jede Figur eines echten Heeres traegt ihre charId",
    heer0.back.every((s) => s && typeof s.charId === "string") && heerIds(heer0).length === 8);

  const erster = BUND_LISTE[0];
  const liste = buendeFuer(frisch, erster.figuren);
  ok("A9: stehen alle Figuren eines Bundes im Heer, ist er erwacht", liste.includes(erster.id));
  ok("A9: und nur er - nicht gleich alle", liste.length === 1);
  ok("v1.91.0: die Stufe spielt keine Rolle mehr - auch auf Stufe 1 wirkt er",
    buendeFuer({ ...frisch, pieces: { levels: {} } }, erster.figuren).includes(erster.id));

  /* DER WEG IN DEN KERN. Das war der eigentliche Fehler. */
  const g = mkGame(undefined, undefined, { rules: "hp", buende: { w: liste, b: [] } });
  ok("A9: createGame nimmt die Buende an und legt sie je Seite in den Zustand",
    g.buende && Array.isArray(g.buende.w) && g.buende.w.includes(erster.id) && g.buende.b.length === 0);
  ok("A9: und der Kern SIEHT ihn dort - fuer Weiss", hatBund(g, erster.id, "w") === true);
  ok("v1.91.0: aber NICHT fuer den Gegner", hatBund(g, erster.id, "b") === false);
  const flach = mkGame(undefined, undefined, { rules: "hp", buende: liste });
  ok("v1.91.0: eine blanke Liste (alte Aufrufer) gilt weiter fuer beide Seiten", hatBund(flach, erster.id, "w") && hatBund(flach, erster.id, "b"));
  const ohne = mkGame(undefined, undefined, { rules: "hp" });
  ok("A9: ohne Angabe bleibt es beim Nichts - kein Bund aus Versehen", !ohne.buende);
  ok("A9: und der Kern sieht dort auch keinen", hatBund(ohne, erster.id, "w") === false);

  /* Die Liste ueberlebt den Zug. */
  let lauf = g;
  for (let i = 0; i < 3; i++) {
    const z = zuege(lauf, lauf.turn)[0];
    if (!z) break;
    lauf = zieh(lauf, z);
  }
  ok("A9: nach drei Zuegen steht der Bund noch im Zustand", hatBund(lauf, erster.id, "w"));

  /* ── v1.91.0: DER BEFUND VOM 6.10.2026 ────────────────────────────────
     Jede Wirkung sucht ihre Figuren ueber `charId`. Die Specs und makePiece
     trugen das Feld nicht - in einem ECHTEN Heer wirkte kein Bund. Diese
     Probe baut das Heer wie das Spiel und setzt NICHTS von Hand. */
  const { buildArmyFromFormation: baf } = await import("./src/meta/index.js");
  const form = ["rook", "knight", "bishop", "queen", "king", "paladin", "knight", "rook"];
  const heerW = baf(() => 10, form), heerB = baf(() => 10, defaultFormation(mapById("classic")));
  const echt = mkGame(heerW, heerB, { rules: "hp", map: mapById("classic"), buende: { w: buendeFuer(frisch, heerW), b: [] } });
  const kf = echt.board.findIndex((p) => p && p.color === "w" && p.kind === "K");
  const pf = echt.board.findIndex((p) => p && p.color === "w" && p.charId === "paladin");
  ok("v1.91.0: im echten Heer steht der Paladin mit charId neben dem Koenig", pf >= 0 && Math.abs(pf - kf) === 1);
  ok("v1.91.0: und die Krone ist wach, weil beide aufgestellt sind", hatBund(echt, "krone", "w"));
  const { kroneFaengtAb } = await import("./src/core/rules/buende.js");
  ok("v1.91.0: der Paladin faengt den Treffer auf den Koenig ab - ohne Handanlegen", kroneFaengtAb(echt, kf) === pf);
  const ohneBund = mkGame(heerW, heerB, { rules: "hp", map: mapById("classic") });
  ok("v1.91.0: ohne den Bund im Zustand faengt er nichts ab", kroneFaengtAb(ohneBund, kf) === null);

  /* Der Schnappschuss (pausierte Partie) behaelt die Buende. */
  const { encodeState, decodeState } = await import("./src/core/index.js");
  const zurueck = decodeState(encodeState(echt));
  ok("v1.91.0: eine pausierte Partie behaelt ihre Buende", hatBund(zurueck, "krone", "w") && !hatBund(zurueck, "krone", "b"));
}
{
  /* WO SIE NICHT GELTEN: Hotseat, PvP, Fernpartie und Klassik bleiben leer.
     Das ist kein Zustand, den man hier messen kann - es ist eine Bedingung
     im Schirm. Geprueft wird darum, dass sie dasteht UND welche vier Faelle
     sie nennt; ohne sie waere ein Bund, der nur fuer eine Seite wirkt, ein
     Betrug am Gegner. */
  const { readFileSync } = await import("node:fs");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  const stelle = gs.indexOf("const meineBuende = useMemo(");
  ok("A9: der Schirm entscheidet die Buende an EINER Stelle", stelle > 0);
  const bed = stelle > 0 ? gs.slice(stelle, stelle + 520) : "";
  ok("A9: und sie schliesst PvP, Fernpartie, Hotseat und Klassik aus",
    /!pvp/.test(bed) && /!daily/.test(bed) && /!hotseat/.test(bed) && /!classic/.test(bed));
  ok("A9: der Kampagnen-Aufbau reicht sie durch", /seed, buende: meineBuende/.test(gs));
  ok("A9: und das Replay bekommt dieselben", /buende: state\.buende/.test(gs));
  const ses = readFileSync("src/meta/session.js", "utf8");
  ok("A9: summarizeMatch gibt sie an createGame weiter", /buende: opts\.buende/.test(ses));
}

/* ══ v1.90.10 (Audit A33, Rest): DIE BUNDWIRKUNGEN KENNEN DEN KOENIG ════
   Solange die Buende nie wirkten (A9), war das ohne Folgen. Seit v1.90.10
   ist es scharf: Geleit und Faehrte laufen NICHT durch legalMoves und
   gingen damit an jeder Koenigssicherheit vorbei. Das Audit hat gemessen,
   dass ein Geleit IM Schach angenommen wurde und die Partie danach in einem
   Zustand stand, den weder Kern noch Oberflaeche kennen. */
console.log("\n== A33: GELEIT UND FAEHRTE ENTBLOESSEN DEN KOENIG NICHT ==");
{
  const { reduce: red } = await import("./src/core/index.js");
  const { geleitCommand: gc } = await import("./src/core/sim/commands.js");
  const { inCheck } = await import("./src/core/rules/attacks.js");
  /* Brett 8x8 unter MATT-Regeln. Weisser Koenig auf e1 (Reihe 0), davor in
     Reihe 1 der TURM des Bundes als einzige Deckung; ein schwarzer Turm
     zielt die Spalte hinab. Nimmt das Geleit die Deckung weg, steht der
     Koenig im Schach - genau das soll nicht angenommen werden. */
  const bau = (mitGegner) => {
    const g = leer(["geleit"]);
    const b = g.board.map(() => null);
    const spalte = 4;
    b[0 * w + spalte] = fig("K", "king", "w", 20, 5);
    b[1 * w + spalte] = fig("R", "rook", "w", 12);        // die Deckung
    b[3 * w + 1] = fig("N", "knight", "w", 12);
    b[3 * w + 2] = fig("B", "bishop", "w", 12);
    b[7 * w + 0] = fig("K", "king", "b", 20, 5);
    if (mitGegner) b[7 * w + spalte] = fig("R", "rookFoe", "b", 12);
    return { ...g, board: b, rules: "chess", turn: "w" };
  };
  const drin = bau(true);
  const tTurm = wo(drin, "rook"), tSpringer = wo(drin, "knight");
  ok("A33: der Aufbau steht (Turm und Springer des Bundes gefunden)", tTurm >= 0 && tSpringer >= 0);
  /* ── EIN BEFUND, DER DEN AUDIT KORRIGIERT ─────────────────────────
     Die Empfehlung zu A33 lautet: "GELEIT ablehnen, wenn inCheck vorher
     ODER NACHHER". Der zweite Fall ist nicht konstruierbar, und zwar aus
     einem einfachen Grund: ein TAUSCH macht kein Feld leer. Zieht der
     deckende Turm weg, steht an seiner Stelle der Springer - und fuer eine
     gleitende Linie ist es gleich, WELCHE Figur davor steht. Ein Geleit
     kann den eigenen Koenig also nur dann ins Schach stellen, wenn eine der
     beiden getauschten Figuren der KOENIG selbst ist, und der gehoert dem
     Geleit-Bund nicht (Springer, Laeufer, Turm).
     Die Probe haelt darum genau das fest: der Tausch geht durch, UND der
     Koenig steht danach nicht im Schach. Der zweite Riegel im Reducer bleibt
     trotzdem stehen - ein kuenftiger Bund mit Koenig oder Dame waere sonst
     die naechste Luecke, und er kostet nichts. */
  const versuch = red(drin, gc("w", tTurm, tSpringer));
  ok("A33: hier faellt kein Feld leer - der Tausch geht durch", versuch.state !== drin);
  ok("A33: und der Koenig steht danach NICHT im Schach (darum ging er durch)",
    inCheck(versuch.state, "w") === false);
  const frei = bau(false);
  const fTurm = wo(frei, "rook"), fSpringer = wo(frei, "knight");
  const geht = red(frei, gc("w", fTurm, fSpringer));
  ok("A33: ohne Schachgefahr tauschen sie weiterhin", geht.state !== frei);
  /* Und aus dem Schach heraus gar nicht - auch wenn der Tausch selbst
     unschaedlich waere. */
  const imSchach = bau(true);
  imSchach.board[1 * w + 4] = null;                        // Deckung entfernt -> Schach steht
  const raus = red(imSchach, gc("w", wo(imSchach, "knight"), wo(imSchach, "bishop")));
  ok("A33: und aus dem Schach heraus gibt es gar kein Geleit", raus.state === imSchach);
}
{
  /* Der Faehrten-Nachzug kennt jetzt Loecher und Sperren (A38) und nimmt
     sich zurueck, wenn er den Koenig entbloesst (A33). */
  const { readFileSync } = await import("node:fs");
  const tr = readFileSync("src/core/sim/transitions.js", "utf8");
  ok("A38: der Nachzug fragt nach Loechern", /ns\.holes\.has\(zf\)/.test(tr));
  ok("A38: und nach Sperren", /versperrt\(\{ sperren: ns\.sperren \}, zf\)/.test(tr));
  ok("A33: und er nimmt sich zurueck, wenn er den Koenig entbloesst",
    /inCheck\(ns, ns\.lastMove\.color\)/.test(tr));
}


/* ══ v1.91.0: DIE ACHT NEUEN BUENDE (Besitzer 6.10.) ═══════════════════════════
   Derselbe Vierklang. Fuenf wirken am Brett (Kueche, Turnier, Kloster, Jagd,
   Finsternis), drei neben dem Kampf: Dorf und Kontor zahlen aus (zubrot.js),
   die Werkstatt stellt einen Zaun (Setzphase im Kampfschirm). */
const { zubrot } = await import("./src/meta/index.js");
const heerMit = (ids) => {
  const f = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  const frei = [0, 1, 2, 5, 6, 7];
  ids.forEach((id, i) => { f[frei[i]] = id; });
  return buildArmyFromFormation(() => 10, f);
};
const partieMit = (ids, buende) => createGame(heerMit(ids), heerMit([]), { rules: "hp", map: mapById("classic"), buende: { w: buende, b: [] } });

console.log("\n== KUECHE (Metzger · Koch · Mueller) ==");
{
  erwachen("kueche");
  const ids = ["butcher", "cook", "miller"];
  const mit = partieMit(ids, ["kueche"]), ohne = partieMit(ids, []);
  const hp = (g, id) => g.board[wo(g, id)].maxHp;
  ok("WIRKUNG: alle drei starten mit einem Leben mehr", ids.every((id) => hp(mit, id) === hp(ohne, id) + 1 && mit.board[wo(mit, id)].hp === hp(mit, id)));
  ok("... und nur sie - der Koenig nicht", mit.board[wo(mit, "king")].maxHp === ohne.board[wo(ohne, "king")].maxHp);
  const schach = createGame(heerMit(ids), heerMit([]), { rules: "chess", map: mapById("classic"), buende: { w: ["kueche"], b: [] } });
  ok("GEGENPROBE: im reinen Schach gibt es keine Leben zu verschenken", schach.board[wo(schach, "cook")].maxHp === createGame(heerMit(ids), heerMit([]), { rules: "chess", map: mapById("classic") }).board[wo(schach, "cook")].maxHp);
  kulisse("kueche");
}

console.log("\n== TURNIER (Ritter · Fechter · Lanzentraeger · Gladiator) ==");
{
  erwachen("turnier");
  const ids = ["cavalier", "fencer", "spearman", "gladiator"];
  const mit = partieMit(ids, ["turnier"]), ohne = partieMit(ids, []);
  ok("WIRKUNG: die vier treffen mit +1 Angriff", ids.every((id) => mit.board[wo(mit, id)].atk === ohne.board[wo(ohne, id)].atk + 1));
  ok("GEGENPROBE: der Bund gilt je Seite - der Gegner bekommt nichts", (() => {
    const g = createGame(heerMit([]), heerMit(ids), { rules: "hp", map: mapById("classic"), buende: { w: ["turnier"], b: [] } });
    const sw = g.board.find((p) => p && p.charId === "fencer" && p.color === "b");
    return sw.atk === ohne.board[wo(ohne, "fencer")].atk;
  })());
  kulisse("turnier");
}

console.log("\n== KLOSTER (Moench · Heilerin) ==");
{
  erwachen("kloster");
  const bau = (buende) => {
    const g = leer({ w: buende, b: [] });
    g.board[3 * w + 3] = fig("P", "pawn", "w", 6, 2);
    g.board[3 * w + 4] = fig("MK", "monk", "w", 12);
    g.board[0 * w + 5] = fig("HL", "healer", "w", 12);
    g.board[5 * w + 3] = fig("R", "rook", "b", 12, 3);
    g.turn = "b";
    return g;
  };
  const mit = zug(bau(["kloster"]), 5 * w + 3, 3 * w + 3), ohne = zug(bau([]), 5 * w + 3, 3 * w + 3);
  ok("WIRKUNG: der Bauer neben dem Moench nimmt 1 Schaden weniger", mit.board[3 * w + 3].hp === ohne.board[3 * w + 3].hp + 1);
  const fern = bau(["kloster"]); fern.board[3 * w + 4] = null; fern.board[0 * w + 6] = fig("MK", "monk", "w", 12);
  ok("GEGENPROBE: steht keiner von beiden daneben, trifft der Schlag voll", zug(fern, 5 * w + 3, 3 * w + 3).board[3 * w + 3].hp === ohne.board[3 * w + 3].hp);
  kulisse("kloster");
}

console.log("\n== JAGD (Jaegerin · Waldlaeufer · Fallensteller) ==");
{
  erwachen("jagd");
  const bau = (buende) => {
    const g = leer({ w: buende, b: [] });
    g.board[3 * w + 3] = fig("HU", "huntress", "w", 1);
    g.board[0 * w + 5] = fig("RG", "ranger", "w", 12);
    g.board[0 * w + 6] = fig("TR", "trapper", "w", 12);
    g.board[5 * w + 3] = fig("R", "rook", "b", 12, 7);
    g.turn = "b";
    return g;
  };
  const weiter = (g) => { const k = wo(g, "king"); return applyMove(g, legalMovesFrom(g, g.board.findIndex((p) => p && p.kind === "K" && p.color === "w"))[0]); };
  const mit = weiter(zug(bau(["jagd"]), 5 * w + 3, 3 * w + 3));
  ok("WIRKUNG: wer die Jaegerin schlaegt, hat im naechsten Zug keinen Zug mit dieser Figur", mit.turn === "b" && mit.board[3 * w + 3]?.kind === "R" && legalMovesFrom(mit, 3 * w + 3).length === 0);
  const ohne = weiter(zug(bau([]), 5 * w + 3, 3 * w + 3));
  ok("GEGENPROBE: ohne Bund zieht der Turm frei weiter", legalMovesFrom(ohne, 3 * w + 3).length > 0);
  const koenig = bau(["jagd"]); koenig.board[5 * w + 3] = null; koenig.board[7 * w + 7] = null; koenig.board[4 * w + 4] = fig("K", "king", "b", 20, 7);
  const k2 = weiter(zug(koenig, 4 * w + 4, 3 * w + 3));
  ok("der Koenig wird nie gefesselt (sonst waere es ein Patt aus dem Nichts)", legalMovesFrom(k2, 3 * w + 3).length > 0);
  kulisse("jagd");
}

console.log("\n== FINSTERNIS (Henker · Samurai · Kerkermeister) ==");
{
  erwachen("finsternis");
  const bau = (buende) => {
    const g = leer({ w: buende, b: [] });
    /* der Henker zieht hier wie ein Turm - der Bund fragt nach der FIGUR (charId), nicht nach der Gangart */
    g.board[3 * w + 3] = fig("R", "executioner", "w", 6, 9);
    g.board[0 * w + 5] = fig("SA", "samurai", "w", 12);
    g.board[0 * w + 6] = fig("JL", "jailer", "w", 12);
    g.board[5 * w + 3] = { ...fig("N", "knight", "b", 2, 3), abilities: ["unsterblich"], used: {} };
    g.turn = "w";
    return g;
  };
  const o = bau([]), m = bau(["finsternis"]);
  const feld = 5 * w + 3;
  const zo = legalMovesFrom(o, 3 * w + 3).find((x) => x.to === feld), zm = legalMovesFrom(m, 3 * w + 3).find((x) => x.to === feld);
  const nachO = applyMove(o, zo), nachM = applyMove(m, zm);
  const lebt = (g) => g.board.some((p) => p && p.color === "b" && p.kind === "N");
  ok("GEGENPROBE: ohne Bund steht der Unsterbliche wieder auf", !!zo && lebt(nachO));
  ok("WIRKUNG: was der Henker schlaegt, steht nicht wieder auf", !!zm && !lebt(nachM));
  kulisse("finsternis");
}

console.log("\n== DORF (Baeuerin · Bettler · Hofnarr) ==");
{
  erwachen("dorf");
  const z = (buende, extra = {}) => zubrot({ heer: heerMit(["farmwife", "beggar", "jester"]), buende, eigeneZuege: 0, bauernUebrig: 5, result: "win", gold: 40, liga: 1, ...extra });
  ok("WIRKUNG: jeder ueberlebende Bauer bringt 2 Gold", z(["dorf"]).dorf === 10);
  ok("... auch nach einer Niederlage, aber nicht nach dem Aufgeben", z(["dorf"], { result: "loss" }).dorf === 10 && z(["dorf"], { result: "loss", resigned: true }).gold === 0);
  ok("GEGENPROBE: ohne Bund nichts", z([]).dorf === 0);
  kulisse("dorf");
}

console.log("\n== KONTOR (Gelehrter · Steuereintreiber · Bankier) ==");
{
  erwachen("kontor");
  const z = (buende, extra = {}) => zubrot({ heer: heerMit([]), buende, result: "win", gold: 40, liga: 1, ...extra });
  ok("WIRKUNG: jeder Sieg bringt ein Viertel mehr Gold", z(["kontor"]).kontor === 10 && z(["kontor"]).gold === 10);
  ok("GEGENPROBE: ohne Sieg oder ohne Bund nichts", z(["kontor"], { result: "loss" }).kontor === 0 && z([]).kontor === 0);
  kulisse("kontor");
}

console.log("\n== WERKSTATT (Schmied · Handwerker) ==");
{
  erwachen("werkstatt");
  const { readFileSync } = await import("node:fs");
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("WIRKUNG: der Kampfschirm legt einen Zaun in den Vorrat und rechnet ihn nicht ab",
    /includes\("werkstatt"\)\) g\.zaun = 1/.test(gs) && /sperrenVerbrauchtRef\.current = ohneGeschenk\(zaehlung\)/.test(gs) && /\(profile\.items\?\.\[art\] \|\| 0\) \+ \(geschenkt\[art\] \|\| 0\)/.test(gs));
  kulisse("werkstatt");
}

console.log("\n== ALLE ACHTZEHN ==");
{
  const alle = Object.keys(BUENDE);
  const inBund = alle.flatMap((id) => BUENDE[id].figuren);
  ok("achtzehn Buende, jede Figur in hoechstens einem", alle.length === 18 && new Set(inBund).size === inBund.length);
  const ohneBund = Object.keys(CHARACTERS).filter((id) => !bundVon(id));
  ok(`nur Bauer, Gambit und Drache stehen ausserhalb (ohne Bund: ${ohneBund.join(", ")})`, ohneBund.sort().join() === "dragon,gambit,pawn");
  ok("der Flaggentraeger ist fort, der Nachtwaechter haelt die Nachtwache", !CHARACTERS.standard && BUENDE.nachtwache.figuren.includes("watchman"));
  ok("jeder Bund sagt in einem Satz, was er gibt (de und en)", alle.every((id) => BUENDE[id].regelDe && BUENDE[id].regelEn && BUENDE[id].storyDe));
}


/* ══ v1.91.0: DER ECHTE WEG - JEDER DER ACHTZEHN, VOM SPIELSTAND BIS AUFS BRETT ══
   Besitzer 6.10.: "sind die Buende jetzt wirklich alle aktiv und funktionieren
   auch? Das musst du wirklich sicherstellen."
   Alles oben baut seine Figuren von Hand (fig(...) mit charId) - genau so blieb
   diese Suite gruen, waehrend im Spiel KEIN Bund wirkte: den echten Figuren
   fehlte die Kennung. Hier steht darum nichts von Hand auf dem Brett. Der Weg
   ist der des Spiels: Spielstand -> gespeicherte Aufstellung -> buildArmyForMap
   -> meineBuende -> createGame. Gefragt wird die Regel selbst, an den Figuren,
   die createGame hingestellt hat - und zur Gegenprobe dieselbe Partie ohne Bund. */
console.log("\n== DER ECHTE WEG: Spielstand -> Aufstellung -> Brett ==");
{
  const M = await import("./src/meta/index.js");
  const K = await import("./src/core/rules/buende.js");
  const karte = mapById("classic");
  const voll = M.withProgressPct(M.defaultProfile(), 100, 12);
  const frei = [0, 1, 2, 5, 6, 7];
  const stand = (ids) => {
    const f = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
    ids.filter((id) => id !== "king" && id !== "queen").forEach((id, i) => { f[frei[i]] = id; });
    return { ...voll, loadout: { ...(voll.loadout || {}), formations: { classic: f } } };
  };
  const partie = (profil, mitBund = true) => {
    const heer = M.buildArmyForMap(profil, karte, null, "hp");
    const wach = M.meineBuende(profil, heer);
    const g = createGame(heer, M.buildArmyFromFormation(() => 5, karte.defaultFormation), { rules: "hp", map: karte, buende: { w: mitBund ? wach : [], b: [] } });
    return { heer, wach, g };
  };
  const stueck = (g, id, farbe = "w") => g.board.find((p) => p && p.color === farbe && p.charId === id);
  const feld = (g, id, farbe = "w") => g.board.findIndex((p) => p && p.color === farbe && p.charId === id);
  const feind = (g) => g.board.find((p) => p && p.color === "b" && p.kind === "R");
  /* Was jeder Bund am echten Brett tun muss. true = die Regel greift. */
  const WIRKT = {
    krone: (g) => { const k = feld(g, "king"), pf = feld(g, "paladin"); g.board[k + 1] = g.board[pf]; if (pf !== k + 1) g.board[pf] = null; return K.kroneFaengtAb(g, k) === k + 1; },
    konzil: (g) => K.konzilLehntAb(g, feld(g, "king")) === true,
    geleit: (g) => Array.isArray(K.geleitTauschbar(g, "w")),
    faehrte: (g) => K.faehrteFolgt(g, feld(g, "hawk")) === feld(g, "pathfinder"),
    schatten: (g) => K.schattenVerbirgt(g, stueck(g, "assassin")) === true,
    schildwacht: (g) => K.schildwachtDeckt(g, feld(g, "king")) === true,
    gezeiten: (g) => K.gezeitenDurchbruch(g, stueck(g, "captain")) === true && legalMovesFrom(g, feld(g, "captain")).length > 0,
    bannkreis: (g) => K.bannkreisSperrt(g, feld(g, "seeress") + 8, "b") === true,
    sturm: (g) => K.sturmRuftZurueck(g, stueck(g, "amazon")) === true,
    nachtwache: (g) => { const a = feld(g, "alchemist"); const n = a + 8; g.board[n].hp -= 1; return K.nachtwacheHeilt(g, "w") === n; },
    kloster: (g) => K.klosterDeckt(g, feld(g, "monk") + 8) === true,
    jagd: (g) => K.jagdFesselt(g, stueck(g, "huntress"), feind(g)) === true,
    finsternis: (g) => K.finsternisBannt(g, stueck(g, "executioner")) === true,
  };
  let alleWach = true, alleKennung = true;
  for (const [id, b] of Object.entries(BUENDE)) {
    const profil = stand(b.figuren);
    const { heer, wach, g } = partie(profil);
    const aufBrett = b.figuren.every((f) => !!stueck(g, f));
    if (!aufBrett) alleKennung = false;
    if (!wach.includes(id)) alleWach = false;
    ok(`${b.nameDe}: steht die Aufstellung, ist er wach - und jede seiner Figuren traegt am Brett ihre Kennung`, wach.includes(id) && aufBrett && K.hat(g, id, "w") && !K.hat(g, id, "b"));
    /* eine Figur fehlt: Koenig und Dame kann man nicht herausnehmen, also eine der anderen */
    const raus = b.figuren.find((f) => f !== "king" && f !== "queen");
    const ersatz = raus === "knight" ? ["bishop", "rook"] : raus === "bishop" || raus === "rook" ? null : b.figuren.filter((f) => f !== raus);
    if (ersatz) {
      const ohneEine = ersatz.length === 2 && raus === "knight"
        ? { ...voll, loadout: { ...(voll.loadout || {}), formations: { classic: ["rook", "hawk", "bishop", "queen", "king", "bishop", "mage", "rook"] } } }
        : stand(ersatz);
      ok(`${b.nameDe}: fehlt ${CHARACTERS[raus].nameDe} in der Aufstellung, schlaeft er`, !partie(ohneEine).wach.includes(id));
    }
    if (WIRKT[id]) {
      ok(`${b.nameDe}: die Regel greift an den Figuren, die createGame hingestellt hat`, WIRKT[id](partie(profil).g) === true);
      ok(`${b.nameDe}: GEGENPROBE - dieselbe Partie ohne den Bund, und sie greift nicht`, WIRKT[id](partie(profil, false).g) === false);
    }
  }
  ok("alle achtzehn sind auf dem echten Weg wach geworden", alleWach && alleKennung && Object.keys(BUENDE).length === 18);
  /* Kueche und Turnier wirken beim Aufbau - an den Werten der echten Figuren */
  { const p = stand(BUENDE.kueche.figuren); const mit = partie(p).g, ohne = partie(p, false).g;
    ok("Kueche: Metzger, Koch und Mueller haben am echten Brett ein Leben mehr", BUENDE.kueche.figuren.every((f) => stueck(mit, f).maxHp === stueck(ohne, f).maxHp + 1 && stueck(mit, f).hp === stueck(mit, f).maxHp)); }
  { const p = stand(BUENDE.turnier.figuren); const mit = partie(p).g, ohne = partie(p, false).g;
    ok("Turnier: die vier treffen am echten Brett mit einem Angriff mehr", BUENDE.turnier.figuren.every((f) => stueck(mit, f).atk === stueck(ohne, f).atk + 1)); }
  /* Dorf, Kontor und Werkstatt wirken neben dem Brett - mit den Buenden, die der echte Weg liefert */
  { const p = stand(BUENDE.dorf.figuren); const { heer, wach } = partie(p);
    ok("Dorf: mit den Buenden des echten Heeres bringen acht Bauern 16 Gold", M.zubrot({ heer, buende: wach, bauernUebrig: 8, result: "win", gold: 50, liga: 1 }).dorf === 16); }
  { const p = stand(BUENDE.kontor.figuren); const { heer, wach } = partie(p);
    ok("Kontor: mit den Buenden des echten Heeres bringt ein Sieg ein Viertel mehr", M.zubrot({ heer, buende: wach, result: "win", gold: 48, liga: 1 }).kontor === 12); }
  ok("Werkstatt: der echte Weg liefert den Bund, an dem der Kampfschirm den Zaun festmacht", partie(stand(BUENDE.werkstatt.figuren)).wach.includes("werkstatt"));
  /* vor der Freigabe der hinteren Reihe schlaeft alles - auch das Geleit, dessen drei Figuren jeder von Anfang an hat */
  ok("ein frischer Stand: kein Bund wirkt, bevor die hintere Reihe freigegeben ist", partie(M.defaultProfile()).wach.length === 0);
  const halb = M.withProgressPct(M.defaultProfile(), 60, 1);
  ok("... danach wirkt das Geleit sofort (Springer, Laeufer, Turm stehen in jeder Grundstellung)", partie(halb).wach.join() === "geleit");
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
