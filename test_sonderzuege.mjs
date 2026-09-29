// ── SONDERZUEGE: ROCHADE & EN PASSANT ───────────────────────────────────────
// Suite 20 der eisernen Kette. Prueft die beiden Sonderzuege gegen die echte
// Engine: Angebot, Verweigerung (gezogen / blockiert / bedroht / verspaetet)
// und Ausfuehrung (Turmsprung, Bauernverschwinden).
import { createGame } from "./src/core/sim/state.js";
import { legalMoves, legalMovesFrom, applyMove, status, cloneState } from "./src/core/sim/transitions.js";
import { reduce } from "./src/core/sim/reducer.js";
import { moveCommand, resignCommand } from "./src/core/sim/commands.js";

let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) { passed++; console.log("  ok  - " + name); }
  else { failed++; console.log("  FAIL - " + name); } };

// LAYOUT-AGNOSTISCH (Lehre v0.49): das Hausbrett ist 10x10, nicht 8x8 -
// alle Koordinaten werden aus dem Brett GESCANNT, nichts wird geraten.
const g0 = createGame();
const W = g0.w ?? 8, H = g0.h ?? 8;
const ix = (f, r) => r * W + f;
const suche = (g, kind, color) => g.board.findIndex((p) => p && p.kind === kind && p.color === color);
const kIdx = suche(g0, "K", "w");
const kF = kIdx % W, kR = (kIdx / W) | 0;
const bkR = (suche(g0, "K", "b") / W) | 0;
const dir = bkR > kR ? 1 : -1;              // weisse Laufrichtung
const wPawnR = (suche(g0, "P", "w") / W) | 0;
const bPawnR = (suche(g0, "P", "b") / W) | 0;
const fernR = dir > 0 ? H - 1 : 0;          // fernste Reihe aus weisser Sicht

// ── Rochade kurz: erst blockiert, dann frei ─────────────────────────────────
const cast = (g) => legalMoves(g, "w").filter((m) => m.special === "castle");
ok("mit voller Grundreihe keine Rochade", cast(g0).length === 0);

const g1 = structuredClone(g0);
for (let f = kF + 1; f < W - 1; f++) g1.board[ix(f, kR)] = null;   // kurze Seite raeumen
const kurz = cast(g1);
ok("kurze Rochade wird angeboten, wenn die Gasse frei ist", kurz.length === 1);
ok("sie fuehrt den Koenig ZWEI Felder zum Turm", kurz[0] && kurz[0].to === ix(kF + 2, kR));

const g2 = structuredClone(g1);
g2.board[kIdx].hasMoved = true;
ok("ein gezogener Koenig rochiert nie wieder", cast(g2).length === 0);

const g3 = structuredClone(g1);
g3.board[ix(W - 1, kR)].hasMoved = true;
ok("ein gezogener Turm traegt keine Rochade mehr", cast(g3).length === 0);

// Kreuzfeld bedroht: gegnerischer Turm zielt die geraeumte Gasse hinab
const g4 = structuredClone(g1);
const kreuzF = kF + 1;
for (let r = 0; r < H; r++) if (r !== kR) g4.board[ix(kreuzF, r)] = null;
g4.board[ix(kreuzF, fernR)] = { id: 999, kind: "R", color: "b", level: 1, abilities: [], shield: 0, used: {} };
ok("ueber ein bedrohtes Kreuzfeld geht keine Rochade", cast(g4).length === 0);

// Ausfuehrung: Turm springt auf die Innenseite
const g5 = applyMove(g1, kurz[0]);
ok("nach der Rochade steht der Koenig auf seinem neuen Feld", g5.board[ix(kF + 2, kR)]?.kind === "K");
ok("und der Turm auf der Innenseite des Koenigs", g5.board[ix(kF + 1, kR)]?.kind === "R");
ok("die Ecke ist leer", !g5.board[ix(W - 1, kR)]);
ok("beide Rochade-Zeugen sind im lastMove notiert", g5.lastMove.special === "castle" && g5.lastMove.rookTo === ix(kF + 1, kR));

// Lange Rochade: die andere Seite raeumen
const gl = structuredClone(g0);
for (let f = 1; f < kF; f++) gl.board[ix(f, kR)] = null;
const lang = cast(gl);
ok("die LANGE Rochade wird angeboten, wenn ihre Gasse frei ist", lang.length === 1 && lang[0].to === ix(kF - 2, kR));
const gl2 = applyMove(gl, lang[0]);
ok("lange Rochade: Turm springt auf die Innenseite", gl2.board[ix(kF - 1, kR)]?.kind === "R" && !gl2.board[ix(0, kR)]);

// ── En passant ──────────────────────────────────────────────────────────────
// Weisser Bauer vier Reihen vor (zwei Doppelschritte simuliert per Chirurgie),
// schwarzer Nachbar zieht Doppelschritt vorbei - genau EINEN Zug lang darf
// im Vorbeigehen geschlagen werden.
const g6 = structuredClone(g0);
const pF = 3, startR = wPawnR;                       // ein weisser Bauer
const epR = bPawnR - 2 * dir;                        // die Reihe NEBEN dem schwarzen Doppelschritt-Ziel
const wp = g6.board[ix(pF, startR)];
g6.board[ix(pF, startR)] = null; wp.hasMoved = true; g6.board[ix(pF, epR)] = wp;
// der schwarze Nachbarbauer macht den Doppelschritt
const bStart = bPawnR, bF = pF + 1;
const doppel = legalMoves({ ...g6, turn: "b" }, "b").find((m) => m.from === ix(bF, bStart) && m.double);
ok("der schwarze Doppelschritt existiert", !!doppel);
const g7 = applyMove({ ...g6, turn: "b" }, doppel);
const ep = legalMoves(g7, "w").filter((m) => m.special === "enpassant");
ok("direkt danach bietet sich EN PASSANT genau einmal an", ep.length === 1);
ok("Ziel ist das UEBERSPRUNGENE Feld", ep[0] && ep[0].to === ix(bF, epR + dir));
const g8 = applyMove(g7, ep[0]);
ok("der Schlaeger steht auf dem uebersprungenen Feld", g8.board[ix(bF, epR + dir)]?.color === "w");
ok("der ueberholte Bauer ist fort", !g8.board[ix(bF, epR)]);
ok("der Schlag zaehlt als Schlag", g8.lastMove.capture === true && g8.captured.w.includes("P"));
// eine Runde spaeter ist das Fenster zu
const g9 = structuredClone(g7);
g9.lastMove = { ...g9.lastMove, double: false };
ok("einen Zug spaeter ist das Fenster geschlossen", legalMoves(g9, "w").filter((m) => m.special === "enpassant").length === 0);

/* ── v1.90.4 (Audit A14): BRETT UND KI MUESSEN DASSELBE ERLAUBEN ───────
   legalMoves trug die beiden Rochade-Riegel (nicht aus dem Schach, nicht
   ueber ein bedrohtes Kreuzfeld), legalMovesFrom nicht - und das BRETT
   zeichnet seine Punkte aus legalMovesFrom. Gemessen hat das Audit
   (skeptiker.mjs S1/S2): Weiss im Schach -> legalMoves 0, legalMovesFrom 1,
   und der Reducer nahm den Zug an. Geprueft wird ab jetzt BEIDES. */
{
  /* Weiss im Schach: gegnerischer Turm auf der Koenigsspalte. */
  const gs = structuredClone(g1);
  for (let r = 0; r < H; r++) if (r !== kR) gs.board[ix(kF, r)] = null;
  gs.board[ix(kF, fernR)] = { id: 991, kind: "R", color: "b", level: 1, abilities: [], shield: 0, used: {} };
  gs.turn = "w";
  const vonKI = legalMoves(gs, "w").filter((m) => m.special === "castle");
  const vomBrett = legalMovesFrom(gs, kIdx).filter((m) => m.special === "castle");
  ok("A14: die KI rochiert nicht aus dem Schach", vonKI.length === 0);
  ok("A14: und das Brett bietet es jetzt auch nicht mehr an", vomBrett.length === 0);
}
{
  /* Kreuzfeld bedroht - derselbe Aufbau wie g4 oben, nun beidseitig. */
  const gk = structuredClone(g1);
  const kreuz = kF + 1;
  for (let r = 0; r < H; r++) if (r !== kR) gk.board[ix(kreuz, r)] = null;
  gk.board[ix(kreuz, fernR)] = { id: 992, kind: "R", color: "b", level: 1, abilities: [], shield: 0, used: {} };
  gk.turn = "w";
  ok("A14: die KI rochiert nicht ueber ein bedrohtes Kreuzfeld",
    legalMoves(gk, "w").filter((m) => m.special === "castle").length === 0);
  ok("A14: und das Brett bietet es nicht mehr an",
    legalMovesFrom(gk, kIdx).filter((m) => m.special === "castle").length === 0);
}
{
  /* Die Gegenprobe: ist alles in Ordnung, bieten BEIDE dieselbe Rochade an. */
  const gf = structuredClone(g1); gf.turn = "w";
  const a = legalMoves(gf, "w").filter((m) => m.special === "castle");
  const b = legalMovesFrom(gf, kIdx).filter((m) => m.special === "castle");
  ok("A14: im freien Fall bieten beide dieselbe Rochade an",
    a.length === 1 && b.length === 1 && a[0].to === b[0].to);
  ok("A14: und legalMovesFrom liefert nur Zuege DIESER Figur",
    legalMovesFrom(gf, kIdx).every((m) => m.from === kIdx));
}

/* ── v1.90.4 (Audit A35): ZWEI FELDER BRAUCHEN AUCH PLATZ ─────────────
   Geprueft wurde nur, ob das ZIELFELD auf dem Brett liegt. Stand der Koenig
   zwei Felder vom Turm, landete er nach der Rochade AUF dem eigenen Turm -
   der wanderte zu den geschlagenen Figuren (Audit-Messung B1). Heute
   unerreichbar, weil formationLegalOn den Koenig festnagelt; ein kuenftiger
   Mischer oder ein eingelesenes Profil koennte ihn aber dorthin stellen. */
{
  const gn = structuredClone(g0);
  for (let f = 0; f < W; f++) gn.board[ix(f, kR)] = null;
  /* Turm in der Ecke, Koenig zwei Felder daneben - Abstand 2, nicht 3. */
  gn.board[ix(0, kR)] = { id: 993, kind: "R", color: "w", level: 1, abilities: [], shield: 0, used: {} };
  gn.board[ix(2, kR)] = { id: 994, kind: "K", color: "w", level: 1, abilities: [], shield: 0, used: {} };
  gn.turn = "w";
  const z = legalMoves(gn, "w").filter((m) => m.special === "castle");
  ok("A35: bei Abstand 2 gibt es keine Rochade mehr", z.length === 0);
  const weit = structuredClone(gn);
  weit.board[ix(2, kR)] = null;
  weit.board[ix(3, kR)] = { id: 994, kind: "K", color: "w", level: 1, abilities: [], shield: 0, used: {} };
  weit.turn = "w";
  const zz = legalMoves(weit, "w").filter((m) => m.special === "castle" && m.to === ix(1, kR));
  ok("A35: bei Abstand 3 geht sie weiterhin", zz.length === 1);
  const nach = applyMove(weit, zz[0]);
  ok("A35: und der eigene Turm ueberlebt sie",
    nach.captured.w.length === 0 && nach.board.filter((p) => p && p.kind === "R" && p.color === "w").length === 1);
}

/* ── v1.90.4 (Audit A39): DAS ERGEBNIS UEBERLEBT DEN NAECHSTEN BEFEHL ──
   cloneState kopierte `over` nicht, und MOVE prueste es nicht - anders als
   POTION, GELEIT und SHIFT. Gemessen: nach RESIGN wurde ein MOVE angenommen
   UND das Ergebnis war danach fort. */
{
  const gr = createGame();
  const nachAufgabe = reduce(gr, resignCommand("w")).state;
  ok("A39: Aufgeben setzt das Ergebnis", !!nachAufgabe.over);
  ok("A39: und status() nennt es", status(nachAufgabe).over === true);
  const einZug = legalMoves(gr, "w")[0];
  const danach = reduce(nachAufgabe, moveCommand(einZug));
  ok("A39: ein Zug nach dem Aufgeben wird abgewiesen", danach.state === nachAufgabe);
  ok("A39: das Ergebnis steht immer noch da", !!danach.state.over);
  /* Und cloneState traegt es jetzt mit - das war der eigentliche Verlust. */
  ok("A39: ein Zustandsabbild verliert das Ergebnis nicht",
    !!cloneState(nachAufgabe).over);
}

console.log(`RESULT: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
