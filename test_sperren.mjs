// ── Mauern, Zaeune, Fallen (v0.90) ──────────────────────────────────────────
import { createGame, legalMoves, applyMove } from "./src/core/index.js";
import { pieceMoves } from "./src/core/rules/moves.js";
import { buildArmyFromFormation } from "./src/meta/index.js";
import { SPERR_ARTEN, FALLEN_ARTEN, stadium, loeseFalleAus, falleSichtbar,
  MAX_SPERREN, ZERFALL_TAKT, setzReihen, setzFelder, darfSetzen, setzeSperre, nimmSperre,
  sperrenAnzahl, zerfalleSperren } from "./src/core/rules/sperren.js";
import { ITEMS, buyItem } from "./src/content/index.js";
import { applyResult } from "./src/meta/rewards.js";
import { encodeState, decodeState, undo } from "./src/core/index.js";

let pass = 0, fail = 0;
const ok = (was, bed) => { if (bed) { pass++; console.log("  ok  - " + was); } else { fail++; console.log("  FAIL- " + was); } };

const armee = () => buildArmyFromFormation(() => 1, ["rook","knight","bishop","queen","king","bishop","knight","rook"]);
function feld() {
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  const t = g.board.map((p, i) => [p, i]).find(([p]) => p && p.kind === "R" && p.color === "w")[1];
  const b = [...g.board];
  for (let k = 1; k <= 3; k++) b[t + k * W] = null;
  return { g: { ...g, board: b }, t, W, ziel: t + 2 * W };
}

// 1. Eine Mauer haelt den Gleiter auf - und laesst sich schlagen
{
  const { g, t, W, ziel } = feld();
  const s = { ...g, sperren: { [ziel]: { art: "mauer", hp: 2 } } };
  const z = legalMoves(s).filter((m) => m.from === t);
  ok("die Mauer laesst sich angreifen", z.some((m) => m.to === ziel && m.schlag));
  ok("hinter der Mauer geht es nicht weiter", !z.some((m) => m.to === ziel + W));
}

// 2. Der Schlag kostet den Zug, nicht die Figur
{
  const { g, t, ziel } = feld();
  const s = { ...g, sperren: { [ziel]: { art: "mauer", hp: 2 } } };
  const n = applyMove(s, legalMoves(s).find((m) => m.to === ziel && m.schlag));
  ok("die Figur bleibt stehen", !!n.board[t]);
  ok("die Mauer verliert einen Punkt", n.sperren[ziel].hp === 1);
  ok("der Gegner ist am Zug", n.turn === "b");
  ok("sie steht nun angeschlagen", stadium(n.sperren[ziel]) === "angeschlagen");
}

// 3. Drei Stadien, und am Ende ist das Feld frei
{
  const { g, t, ziel } = feld();
  let s = { ...g, sperren: { [ziel]: { art: "bergfried", hp: 3 } } };
  let schlaege = 0;
  while (s.sperren[ziel] && schlaege < 6) {
    const z = legalMoves({ ...s, turn: "w" }).find((m) => m.to === ziel && m.schlag);
    if (!z) break;
    s = applyMove({ ...s, turn: "w" }, z); schlaege++;
  }
  ok("das Bollwerk braucht drei Schlaege", schlaege === 3);
  ok("danach ist das Feld frei", legalMoves({ ...s, turn: "w" }).some((m) => m.from === t && m.to === ziel && !m.schlag));
}

// 4. Jede Sorte haelt, was ihr Preis verspricht
{
  ok("Zaun haelt einen Schlag", SPERR_ARTEN.zaun.hp === 1);
  ok("Mauer haelt zwei", SPERR_ARTEN.mauer.hp === 2);
  ok("Bollwerk haelt drei", SPERR_ARTEN.bergfried.hp === 3);
  ok("teurer heisst haerter", SPERR_ARTEN.zaun.gold < SPERR_ARTEN.mauer.gold
    && SPERR_ARTEN.mauer.gold < SPERR_ARTEN.bergfried.gold);
}

// 5. Fallen: die Grube schlaegt, die Baerenfalle fesselt
{
  const f = { 12: { art: "grube", von: "w" } };
  const { fallen, wirkung } = loeseFalleAus(f, 12);
  ok("die Grube macht Schaden", wirkung.schaden === FALLEN_ARTEN.grube.schaden);
  ok("sie liegt danach offen", fallen[12].offen === true);
  ok("und schnappt nicht zweimal", loeseFalleAus(fallen, 12).wirkung === null);

  const b = { 20: { art: "baerenfalle", von: "b" } };
  const w2 = loeseFalleAus(b, 20).wirkung;
  ok("die Baerenfalle fesselt statt zu schlagen", w2.fessel === 1 && !w2.schaden);
}

// 6. Eine Falle sieht nur, wer sie legte - bis sie zuschnappt
{
  const heimlich = { art: "grube", von: "w" };
  ok("der Leger sieht seine Falle", falleSichtbar(heimlich, "w"));
  ok("der Gegner sieht sie nicht", !falleSichtbar(heimlich, "b"));
  ok("nach dem Ausloesen sehen sie alle", falleSichtbar({ ...heimlich, offen: true }, "b"));
}

// 7. Ohne Sperren aendert sich am Spiel nichts
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  ok("ein Brett ohne Sperren zieht wie immer", legalMoves(g).length > 0 && !legalMoves(g).some((m) => m.schlag));
}

// ── v1.0.63: KAUFEN, SETZEN, ZERFALLEN ──────────────────────────────────────

// 8. Gesetzt wird nur in der dritten und vierten EIGENEN Reihe
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  ok("Weiss setzt in Reihe 3 und 4", setzReihen(g, "w").join() === "2,3");
  ok("Schwarz spiegelbildlich", setzReihen(g, "b").sort().join() === [g.h - 4, g.h - 3].sort().join());
  ok("die eigene Grundreihe ist tabu", !darfSetzen(g, 0, "w"));
  ok("die Bauernreihe auch", !darfSetzen(g, W, "w"));
  ok("die dritte Reihe geht", darfSetzen(g, 2 * W, "w"));
  ok("die vierte Reihe auch", darfSetzen(g, 3 * W + 4, "w"));
  ok("die Mitte nicht mehr", !darfSetzen(g, 4 * W, "w"));
  ok("Schwarz darf nicht in Weiss' Reihen", !darfSetzen(g, 2 * W, "b"));
  ok("zwei volle Reihen stehen offen", setzFelder(g, "w").length === 2 * W);
}

// 9. Hoechstens zwei je Seite - und das Feld muss frei sein
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  let s = { ...g, sperren: setzeSperre(g, 2 * W, "mauer", "w", 0) };
  s = { ...s, sperren: setzeSperre(s, 2 * W + 1, "zaun", "w", 0) };
  ok("zwei stehen", sperrenAnzahl(s.sperren, "w") === MAX_SPERREN);
  ok("die dritte wird abgewiesen", setzeSperre(s, 2 * W + 2, "zaun", "w", 0) === s.sperren);
  ok("kein zweites Stueck auf dasselbe Feld", setzeSperre({ ...g, sperren: s.sperren }, 2 * W, "zaun", "w", 0) === s.sperren);
  ok("das Gegenueber hat sein eigenes Kontingent", setzeSperre(s, (g.h - 3) * W, "mauer", "b", 0) !== s.sperren);
  ok("zuruecknehmen gibt das Feld frei", !nimmSperre(s.sperren, 2 * W)[2 * W]);
  ok("eine erfundene Art wird nicht gesetzt", setzeSperre(g, 2 * W, "burgtor", "w", 0) === (g.sperren || null));
}

// 10. Der Zerfall: keine Sperre ueberdauert 20 Zuege
{
  const bau = (art) => ({ [5]: { art, hp: SPERR_ARTEN[art].hp, von: "w", bis: ZERFALL_TAKT } });
  for (const art of Object.keys(SPERR_ARTEN)) {
    let sp = bau(art);
    let halbzug = 0;
    while (sp[5] && halbzug < 200) { halbzug++; sp = zerfalleSperren(sp, halbzug); }
    const zuege = halbzug / 2;
    ok(`${art} zerfaellt von selbst (${zuege} Zuege)`, !sp[5] && zuege < 20);
    ok(`${art} haelt so lange, wie sie Punkte hat`, halbzug === SPERR_ARTEN[art].hp * ZERFALL_TAKT);
  }
  const sp = bau("mauer");
  ok("vor dem Takt bleibt alles, wie es ist", zerfalleSperren(sp, ZERFALL_TAKT - 1) === sp);
  ok("nach dem Takt steht sie angeschlagen", stadium(zerfalleSperren(sp, ZERFALL_TAKT)[5]) === "angeschlagen");
  ok("mehrere faellige Takte auf einmal", !zerfalleSperren(sp, 5 * ZERFALL_TAKT)[5]);
}

// 11. Am lebenden Brett: sie altert mit jedem Halbzug und der Schlag zaehlt mit
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  let s = { ...g, sperren: setzeSperre(g, 3 * W + 1, "mauer", "w", 0) };
  for (let n = 0; n < ZERFALL_TAKT; n++) {
    const z = legalMoves(s).find((m) => !m.schlag && !m.capture);
    s = applyMove(s, z, { record: true });
  }
  ok("nach zwoelf Halbzuegen hat die Mauer Risse", stadium(s.sperren[3 * W + 1]) === "angeschlagen");
  ok("der Zugzaehler laeuft mit", s.moveCount === ZERFALL_TAKT);
}

// 12. Der Schlag gegen die Sperre kostet einen Halbzug - und laesst sich zuruecknehmen
{
  const { g, t, ziel } = feld();
  const s = { ...g, sperren: { [ziel]: { art: "mauer", hp: 2, von: "b", bis: 999 } } };
  const n = applyMove(s, legalMoves(s).find((m) => m.to === ziel && m.schlag), { record: true });
  ok("der Schlag dreht den Zugzaehler weiter", n.moveCount === s.moveCount + 1);
  const zurueck = undo(n);
  ok("die Historie traegt einen ZUSTAND, kein Zugobjekt", Array.isArray(zurueck.board) && !!zurueck.board[t]);
  ok("und die Mauer steht wieder heil", zurueck.sperren[ziel].hp === 2);
}

// 13. Der Bauer laeuft nicht durch die eigene Mauer
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  const bauer = W + 3;                      // Weisser Bauer, Reihe 2
  const s = { ...g, sperren: setzeSperre(g, 3 * W + 3, "zaun", "w", 0) };
  const z = legalMoves(s).filter((m) => m.from === bauer);
  ok("der Einzelschritt bleibt", z.some((m) => m.to === 2 * W + 3));
  ok("der Doppelschritt in die eigene Sperre entfaellt", !z.some((m) => m.to === 3 * W + 3 && !m.schlag));
}

// 14. Der Schnappschuss vergisst die Sperren nicht mehr
{
  const g = createGame(armee(), armee(), { rules: "chess" });
  const W = g.w;
  const s = { ...g, sperren: setzeSperre(g, 2 * W + 2, "bergfried", "w", 0) };
  const zurueck = decodeState(encodeState(s));
  ok("die gesetzte Sperre ueberlebt das Pausieren", zurueck.sperren?.[2 * W + 2]?.art === "bergfried");
  ok("ohne Sperren bleibt der Schnappschuss schlank", !("sperren" in JSON.parse(encodeState(g))));
}

// 15. Der Kraemer fuehrt sie - zum Preis des Regelwerks
{
  for (const art of Object.keys(SPERR_ARTEN)) {
    ok(`${art} liegt im Buendel`, ITEMS[art]?.sperre === art && ITEMS[art].kind === "consumable");
    ok(`${art} kostet, was das Regelwerk sagt`, ITEMS[art].gold === SPERR_ARTEN[art].gold);
  }
  const arm = { gold: 30, items: {} };
  ok("ohne Gold kein Zaun", buyItem(arm, "zaun") === arm);
  const reich = buyItem({ gold: 500, items: {} }, "mauer");
  ok("gekauft wird abgezogen", reich.gold === 500 - SPERR_ARTEN.mauer.gold && reich.items.mauer === 1);
}

// 16. Was gesetzt wurde, ist nach der Partie fort
{
  const profil = { gold: 0, xp: 0, xpEarned: 0, sp: 0, items: { mauer: 2, zaun: 1, potion: 1 },
    pieces: { levels: {} }, stats: { games: 0, wins: 0, losses: 0, draws: 0, captures: 0, promotions: 0, checkmates: 0, winStreak: 0, bestStreak: 0, flawlessQueenWins: 0, fastWins: 0 },
    campaign: { league: 1, cleared: [], unlocked: [], dupes: {} } };
  const { profile: nachher } = applyResult(profil, { result: "win", moveCount: 30, sperrenGesetzt: { mauer: 1, zaun: 1 } });
  ok("die gesetzte Mauer fehlt im Vorrat", nachher.items.mauer === 1);
  ok("der gesetzte Zaun ebenso", nachher.items.zaun === 0);
  ok("was nicht gesetzt wurde, bleibt liegen", nachher.items.potion === 1);
}

console.log("\n== Die vier Stufen des Bollwerks (v1.0.89) ==");
{
  const { stadium } = await import("./src/core/index.js");
  const B = (art, hp) => stadium({ art, hp });
  ok("Bollwerk hp3 = heil", B("bergfried", 3) === "heil");
  ok("Bollwerk hp2 = angeschlagen", B("bergfried", 2) === "angeschlagen");
  ok("Bollwerk hp1 = schwer (eigenes Bild, v1.0.89)", B("bergfried", 1) === "schwer");
  ok("Bollwerk hp0 = Truemmer", B("bergfried", 0) === "truemmer");
  ok("Mauer hp2 = heil", B("mauer", 2) === "heil");
  ok("Mauer hp1 = angeschlagen (KEIN schwer bei zwei Punkten)", B("mauer", 1) === "angeschlagen");
  ok("Zaun hp1 = heil", B("zaun", 1) === "heil");
  ok("Zaun hp0 = Truemmer", B("zaun", 0) === "truemmer");
  const { existsSync } = await import("node:fs");
  const dateien = ["zaun-heil","zaun-schutt","mauer-heil","mauer-riss","mauer-schutt",
    "bergfried-heil","bergfried-riss","bergfried-riss2","bergfried-schutt"];
  ok("alle neun Sperrbilder liegen als Spielfassung vor",
    dateien.every((d) => existsSync(`src/app/ui/assets/sperren/${d}.webp`)));
  ok("und alle als @gross-Fassung",
    dateien.every((d) => existsSync(`src/app/ui/assets/sperren/${d}@gross.webp`)));
  const { readFileSync } = await import("node:fs");
  const sa = readFileSync("src/app/ui/board/sperrenArt.js", "utf8");
  ok("keine Art steht mehr auf null", !/zaun:\s*null|bergfried:\s*null/.test(sa));
  ok("die Luecken-Liste leitet die Zustaende je Art ab", sa.includes("export function zustaendeVon"));
}

console.log("\n== KLANG: ein Schlag, aber Stein anders als Holz (v1.1.1) ==");
{
  const { readFileSync, existsSync } = await import("node:fs");
  const an = readFileSync("src/app/ui/anim.js", "utf8");
  const { schlagArt } = await import("./src/app/ui/anim.js");
  /* Besitzer: "Wenn man eine Figur schlaegt, immer den Ton, den man auch beim
     Bauern hat - keine Unterscheidung." Nur der Drache behaelt sein Feuer. */
  const arten = ["P","N","B","R","Q","K","C","H","A","G","X"].map((k) => schlagArt(k));
  ok("jeder Nahkampf klingt gleich (stoss)" + (new Set(arten).size > 1 ? " - noch verschieden: " + [...new Set(arten)].join(",") : ""),
    new Set(arten).size === 1 && arten[0] === "stoss");
  ok("der Drache behaelt sein Feuer", schlagArt("D") === "feuer");
  ok("beide Bruch-Klaenge liegen vor",
    existsSync("src/app/ui/assets/klang/holzbruch.webm") && existsSync("src/app/ui/assets/klang/steinbruch.webm"));
  const kl = readFileSync("src/app/ui/klang.js", "utf8");
  ok("sie sind registriert", kl.includes("holzbruch: [holzbruchKlang]") && kl.includes("steinbruch: [steinbruchKlang]"));
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("der Zaun klingt nach Holz, Mauer und Bollwerk nach Stein",
    gs.includes('"holzbruch"') && gs.includes('"steinbruch"') && gs.includes('getroffen.includes("zaun")'));
  ok("der Begrenzer am Ausgang faengt Klick-Spitzen (Attack 0,3 ms, 20:1)",
    kl.includes("presse.attack.value = 0.0003") && kl.includes("presse.ratio.value = 20"));
}

console.log("\n== DAS KAPITEL GEHOERT DER STATION, nicht dem Profil (v1.1.2) ==");
{
  /* Besitzerbefund: "Ich teste ueber die Werkbank Kapitel zwoelf, gehe zurueck
     in ein anderes Kapitel, starte dort ein Level - und er startet immer das
     Level vom Werkbank-Kapitel." Diese Probe stellt genau das: dieselbe
     Station, zwei verschiedene Profilkapitel. Die Werte MUESSEN gleich sein. */
  const { buildStageMatch } = await import("./src/meta/campaign.js");
  const bau = (liga, id) => buildStageMatch(id, { campaign: { league: liga, cleared: [] }, campDifficulty: "normal" });
  const kern = (m) => JSON.stringify({ map: m.map, rules: m.rules, gold: m.gold,
    stufen: Object.values(m.aiArmy || {}).filter((p) => p && p.level).map((p) => p.level).sort(),
    boss: m.boss?.id || null });
  for (const id of ["L03s00", "L12s00", "L07s00"]) {
    const a = kern(bau(3, id)), b = kern(bau(12, id)), c = kern(bau(1, id));
    ok(`${id} baut sich gleich, egal welches Kapitel im Profil steht`, a === b && b === c);
  }
  /* und der Rueckblick (leagueOverride) darf weiter umskalieren - das ist
     gewollt: eine gemeisterte Liga spielt man, wie sie WAR. */
  const rueck3 = kern(buildStageMatch("L03s00", { campaign: { league: 12, cleared: [] } }, 1));
  const normal = kern(bau(12, "L03s00"));
  ok("der Rueckblick skaliert weiterhin auf die uebergebene Liga", rueck3 !== normal);
}

/* ── v1.90.4 (Audit A10): EINE MAUER IST FUER JEDEN EINE MAUER ──────────
   Bis v1.90.3 fragten nur step, slide und der Bauern-Vorwaertszug nach der
   Sperre. Alles andere landete AUF der Mauer - und wer dort stand, war
   unschlagbar, weil gegen ein versperrtes Feld nur der Schlag gegen die
   MAUER angeboten wird, nie gegen die Figur darauf. Die Probe ist bewusst
   nicht auf einzelne Faehigkeiten gemuenzt, sondern auf die REGEL: KEIN
   Pseudozug darf ohne `schlag` auf einem versperrten Feld landen. Sie faengt
   damit auch Zugbilder, die es heute noch gar nicht gibt. */
{
  const alleZuege = (st) => {
    const out = [];
    for (let i = 0; i < st.board.length; i++) {
      const p = st.board[i];
      if (!p || p.color !== st.turn) continue;
      for (const z of pieceMoves(st, i)) out.push(z);
    }
    return out;
  };
  /* Ein Brett voller Sonderkoenner: jede Figur bekommt ALLE Faehigkeiten, die
     ueberhaupt auf einem Feld landen koennen, dazu ein Zugbild mit Gleitern,
     Spruengen und Brut. So sieht die Probe jeden Block auf einmal. */
  const KUENSTE = ["pawn_sidestep", "pawn_charge", "pawn_backstep", "rook_breach",
    "king_dash", "bishop_hop", "queen_knightleap", "rook_diag_step",
    "bishop_ortho_step", "teleport", "pawn_forward_capture"];
  const g0 = createGame(armee(), armee(), { rules: "chess" });
  const brett = g0.board.map((p) => p && ({ ...p, abilities: [...KUENSTE],
    moveSpec: { leaps: [[1, 2], [2, 1], [-1, 2], [2, -1]], slides: [[1, 0], [0, 1], [1, 1], [-1, 1], [-1, 0], [0, -1], [-1, -1], [1, -1]], range: 4, spawn: true },
    spawnLeft: 3 }));
  /* Sperren auf ALLE freien Felder: dann gibt es kein Feld mehr, auf dem ein
     Zug ohne Schlag landen duerfte - ein einziger Durchrutscher faellt auf. */
  const sperren = {};
  for (let i = 0; i < brett.length; i++) if (!brett[i]) sperren[i] = { art: "mauer", hp: 2 };
  const st = { ...g0, board: brett, sperren };
  const z = alleZuege(st);
  ok("A10: das Probenbrett bietet ueberhaupt Zuege an", z.length > 0);
  const durch = z.filter((m) => sperren[m.to] && !m.schlag);
  if (durch.length) console.log("     durchgerutscht:", JSON.stringify(durch.slice(0, 6)));
  ok("A10: kein Zug landet ohne Schlag auf einer Mauer - kein Sonderzug, kein Zugbild, kein Blinzeln",
    durch.length === 0);
}
{
  /* Und die Gegenprobe: OHNE Sperren muessen dieselben Kuenste weiterhin
     Zuege liefern - sonst haette der Riegel sie schlicht totgelegt. */
  const g0 = createGame(armee(), armee(), { rules: "chess" });
  const KUENSTE = ["pawn_sidestep", "pawn_charge", "pawn_backstep", "king_dash", "teleport"];
  const brett = g0.board.map((p) => p && ({ ...p, abilities: [...KUENSTE] }));
  const st = { ...g0, board: brett };
  const mitKunst = legalMoves(st).filter((m) => ["side", "rush", "back", "dash", "blink"].includes(m.special));
  ok("A10: ohne Mauer bleiben Seitschritt, Sturmlauf, Rueckschritt, Sprint und Blinzeln erhalten",
    mitKunst.length > 0);
}
{
  /* Der Drache: sein 2x2-Block darf sich nicht auf eine Mauer setzen. */
  const g0 = createGame(armee(), armee(), { rules: "hp" });
  const W = g0.w;
  const leer = g0.board.map(() => null);
  const drache = { id: 900, kind: "D", color: "w", big: true, hp: 30, maxHp: 30, atk: 9, abilities: [] };
  const anker = 4 * W + 2;
  leer[anker] = drache;
  leer[anker + 1] = { id: 901, kind: "D+", color: "w", ref: anker };
  leer[anker + W] = { id: 902, kind: "D+", color: "w", ref: anker };
  leer[anker + W + 1] = { id: 903, kind: "D+", color: "w", ref: anker };
  leer[0] = { id: 904, kind: "K", color: "w" };
  leer[leer.length - 1] = { id: 905, kind: "K", color: "b" };
  const ohne = { ...g0, board: leer, turn: "w" };
  const frei = pieceMoves(ohne, anker).map((m) => m.to);
  ok("A10: der Drache zieht ohne Mauer", frei.length > 0);
  const ziel = frei.find((t) => t !== anker);
  const mit = { ...ohne, sperren: { [ziel]: { art: "mauer", hp: 2 } } };
  ok("A10: eine Mauer unter dem Drachenblock ist fuer ihn ein Loch - er setzt sich nicht darauf",
    !pieceMoves(mit, anker).some((m) => m.to === ziel));
}

/* ══ DIE FALLEN, JETZT WIRKLICH GEBAUT (v1.90.9, Audit A32) ═══════════
   Bis v1.90.8 gab es nur den Datentyp FALLEN_ARTEN und die reine Funktion
   loeseFalleAus - transitions.js importierte sie, rief sie aber NIRGENDS
   auf, und `state.fallen` wurde an keiner Stelle gefuellt: weder Gegenstand
   noch Setzen noch Wirkung. CLAUDE.md fuehrte sie jahrelang als gebaut.
   Besitzerentscheid vom 29.9.2026: bauen. */
{
  const { legeFalle, nimmFalle, darfFalleLegen, fallenFelder, fallenAnzahl, MAX_FALLEN,
          feldGanzFrei, falleSichtbar } = await import("./src/core/index.js");
  const g = createGame(armee(), armee(), { rules: "hp" });
  const W = g.w;
  const reiheW = 2;                       // dritte Reihe von Weiss (setzReihen)
  const leerFeld = () => {
    const b = [...g.board];
    for (let f = 0; f < W; f++) b[reiheW * W + f] = null;
    return { ...g, board: b };
  };
  const st = leerFeld();
  const ziel = reiheW * W + 3;
  ok("A32: auf der dritten eigenen Reihe darf eine Falle liegen", darfFalleLegen(st, ziel, "w"));
  ok("A32: in der eigenen Grundreihe nicht", !darfFalleLegen(st, 3, "w"));
  ok("A32: und nicht auf einem besetzten Feld", !darfFalleLegen(st, 3 + W, "w"));
  const mitFalle = { ...st, fallen: legeFalle(st, ziel, "baerenfalle", "w") };
  ok("A32: die Falle liegt", mitFalle.fallen[ziel] && mitFalle.fallen[ziel].art === "baerenfalle");
  ok("A32: verdeckt - nur wer sie legte, sieht sie",
    falleSichtbar(mitFalle.fallen[ziel], "w") === true && falleSichtbar(mitFalle.fallen[ziel], "b") === false);
  ok("A32: eine Sperre und eine Falle teilen kein Feld",
    !feldGanzFrei(mitFalle, ziel) && !darfFalleLegen(mitFalle, ziel, "w"));
  /* Die Grenze zaehlt getrennt von den Sperren. */
  let voll = mitFalle;
  voll = { ...voll, fallen: legeFalle(voll, ziel + 1, "grube", "w") };
  ok("A32: zwei Fallen gehen", fallenAnzahl(voll.fallen, "w") === MAX_FALLEN);
  const dritte = legeFalle(voll, ziel + 2, "grube", "w");
  ok("A32: eine dritte nicht", dritte === voll.fallen);
  ok("A32: und es werden keine Felder mehr angeboten", fallenFelder(voll, "w").length === 0);
  ok("A32: zurueckgenommen wird sie wieder frei", nimmFalle(voll.fallen, ziel + 1)[ziel + 1] === undefined);
}
{
  /* DIE WIRKUNG. Das war der eigentliche Punkt: loeseFalleAus wurde nie
     aufgerufen. Geprueft wird am echten Zug, nicht an der Funktion. */
  const { legeFalle } = await import("./src/core/index.js");
  const g0 = createGame(armee(), armee(), { rules: "hp" });
  const W = g0.w, H = g0.h;
  const bau = (art) => {
    const b = g0.board.map(() => null);
    b[4] = { id: 90, kind: "K", color: "w", level: 1, abilities: [], used: {}, hp: 20, maxHp: 20, atk: 5 };
    b[(H - 1) * W + 0] = { id: 91, kind: "K", color: "b", level: 1, abilities: [], used: {}, hp: 20, maxHp: 20, atk: 5 };
    /* Ein schwarzer Turm steht direkt UEBER der Falle und zieht hinein. */
    const falleFeld = 3 * W + 4;
    b[falleFeld + W] = { id: 92, kind: "R", color: "b", level: 5, abilities: [], used: {}, hp: 8, maxHp: 8, atk: 4 };
    const st = { ...g0, board: b, turn: "b" };
    return { st: { ...st, fallen: legeFalle({ ...st, board: b.map((x, i) => (i === falleFeld ? null : x)) }, falleFeld, art, "w") }, falleFeld };
  };
  {
    const { st, falleFeld } = bau("grube");
    ok("A32: die Grube liegt vor dem Zug", !!st.fallen[falleFeld] && !st.fallen[falleFeld].offen);
    const zug = legalMoves(st, "b").find((m) => m.to === falleFeld);
    ok("A32: der Turm darf auf das Feld ziehen - eine Falle sperrt nicht", !!zug);
    const nach = applyMove(st, zug);
    ok("A32: sie schnappt zu und liegt danach offen", nach.fallen[falleFeld].offen === true);
    ok("A32: der Turm hat 2 Leben verloren", nach.board[falleFeld] && nach.board[falleFeld].hp === 6);
    ok("A32: und der Zug ist im lastMove vermerkt",
      nach.lastMove.falle && nach.lastMove.falle.art === "grube" && nach.lastMove.falle.schaden === 2);
    ok("A32: die Remis-Uhr springt auf 0 - Schaden ist Schaden", nach.ohneSchaden === 0);
  }
  {
    const { st, falleFeld } = bau("baerenfalle");
    const zug = legalMoves(st, "b").find((m) => m.to === falleFeld);
    const nach = applyMove(st, zug);
    ok("A32: die Baerenfalle nimmt kein Leben", nach.board[falleFeld].hp === 8);
    ok("A32: aber die Figur sitzt fest", nach.board[falleFeld].fesselBis > nach.moveCount);
    ok("A32: und bietet keinen einzigen Zug an", pieceMoves(nach, falleFeld).length === 0);
    /* Zwei Halbzuege spaeter geht es weiter. */
    const spaeter = { ...nach, moveCount: nach.board[falleFeld].fesselBis };
    ok("A32: nach dem ausgesetzten Zug zieht sie wieder", pieceMoves(spaeter, falleFeld).length > 0);
  }
  {
    /* Ueber die EIGENE Falle laeuft man hinweg. */
    const g = createGame(armee(), armee(), { rules: "hp" });
    const W2 = g.w, H2 = g.h;
    const b = g.board.map(() => null);
    b[4] = { id: 90, kind: "K", color: "w", level: 1, abilities: [], used: {}, hp: 20, maxHp: 20, atk: 5 };
    b[(H2 - 1) * W2] = { id: 91, kind: "K", color: "b", level: 1, abilities: [], used: {}, hp: 20, maxHp: 20, atk: 5 };
    const feld = 2 * W2 + 4;
    b[feld + W2] = { id: 92, kind: "R", color: "w", level: 5, abilities: [], used: {}, hp: 8, maxHp: 8, atk: 4 };
    const st = { ...g, board: b, turn: "w", fallen: { [feld]: { art: "grube", von: "w", offen: false } } };
    const zug = legalMoves(st, "w").find((m) => m.to === feld);
    const nach = applyMove(st, zug);
    ok("A32: die eigene Falle loest nicht aus",
      nach.board[feld].hp === 8 && nach.fallen[feld].offen === false);
  }
  {
    /* Im REINEN SCHACH loest nichts aus - dort gibt es keine Lebenspunkte. */
    const g = createGame(armee(), armee(), { rules: "chess" });
    const W2 = g.w, H2 = g.h;
    const b = g.board.map(() => null);
    b[4] = { id: 90, kind: "K", color: "w", level: 1, abilities: [], used: {} };
    b[(H2 - 1) * W2] = { id: 91, kind: "K", color: "b", level: 1, abilities: [], used: {} };
    const feld = 3 * W2 + 4;
    b[feld + W2] = { id: 92, kind: "R", color: "b", level: 1, abilities: [], used: {} };
    const st = { ...g, board: b, turn: "b", fallen: { [feld]: { art: "grube", von: "w", offen: false } } };
    const zug = legalMoves(st, "b").find((m) => m.to === feld);
    const nach = applyMove(st, zug);
    ok("A32: im reinen Schach schnappt keine Falle zu", nach.fallen[feld].offen === false);
  }
}
{
  /* Und im Laden: beide Fallen sind kaufbar, die Baerenfalle FRUEH
     (Besitzer: "gerne auch schon die Baerenfalle z. B. in einem Kapitel
     2-3 oder so"). */
  const { ITEMS } = await import("./src/content/index.js");
  const { FALLEN_ARTEN } = await import("./src/core/index.js");
  ok("A32: beide Fallen liegen beim Kraemer", !!ITEMS.baerenfalle && !!ITEMS.grube);
  ok("A32: die Baerenfalle kommt frueh - Kapitel II/III", ITEMS.baerenfalle.minCleared <= 6);
  ok("A32: die Spitzgrube spaeter, sie macht Schaden", ITEMS.grube.minCleared > ITEMS.baerenfalle.minCleared);
  ok("A32: die Preise stehen NUR im Regelwerk, nicht zweimal",
    ITEMS.baerenfalle.gold === FALLEN_ARTEN.baerenfalle.gold && ITEMS.grube.gold === FALLEN_ARTEN.grube.gold);
  ok("A32: und jede traegt ihre Art, damit das Bild sie findet",
    ITEMS.baerenfalle.falle === "baerenfalle" && ITEMS.grube.falle === "grube");
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
