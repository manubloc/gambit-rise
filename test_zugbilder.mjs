/* ── ZUGBILDER GEGEN DEN KERN (v1.89.1) ──────────────────────────────────────
   Fuer jede Bewegungs-Faehigkeit: was zeigt das Zugbild (ABILITY_MOVE in
   src/content/zugbilder.js), und was erzeugt der Kern (rules/moves.js,
   pieceMoves mit hasAbility) auf einem 8x8-Brett mit der Figur in der Mitte
   (d4 = Feld 3,3)?

   Zwei Lagen je Faehigkeit:
     leer     - nur die Figur (und die zwei Koenige in den Ecken)
     umringt  - alle acht Nachbarfelder von GEGNERN besetzt (fuer Phase,
                Durchbruch, Stossschlag, die ein besetztes Feld brauchen)
   Dazu je Stufe I-III (piece.stufen), weil Sturmlauf und Fliegen mit der
   Stufe wachsen.

   Der Vergleich: Zugbild-Muster (Menge der [df,dr]) gegen die Kern-Zusatz-
   felder (Zuege MIT der Faehigkeit minus Zuege OHNE sie, plus alle Zuege mit
   special/consumes der Faehigkeit). Gleich = ok; sonst wird die Differenz
   ausgegeben.

   WARUM ES DIESE PROBE GIBT (Besitzer, 27.9.: "Zugvarianten ... sauber
   darstellst und kontrollierst, ob die alle stimmen. Das muss sauber sein"):
   Der erste Lauf fand, dass zehn Sonderfiguren mit moveSpec ihren erlernten
   Scharfschuss nie abfeuern konnten - moves.js kehrte fuer sie vor dem
   Schuss-Block zurueck (Abschnitt 5). Und dass die Legende "Gruen: neue
   Felder" bei Phase, Durchbruch, Stossschlag die Unwahrheit sagte (Abschnitt
   3, seither mit `hinweis` unter dem Raster). */
import { readFileSync } from "node:fs";
import { pieceMoves } from "./src/core/rules/moves.js";
import { ABILITIES } from "./src/content/abilities.js";
import { CHARACTERS } from "./src/content/characters.js";
import { ABILITY_MOVE, zugbildLegende } from "./src/content/zugbilder.js";

let pass = 0, fail = 0;
const ok = (was, bed) => { if (bed) { pass++; console.log("  ok  - " + was); } else { fail++; console.log("  FAIL- " + was); } };

const W = 8, H = 8, MF = 3, MR = 3, MITTE = MR * W + MF;
const key = ([df, dr]) => `${df},${dr}`;
const sortKeys = (arr) => [...arr].sort((a, b) => { const [x1, y1] = a.split(",").map(Number), [x2, y2] = b.split(",").map(Number); return x1 - x2 || y1 - y2; });
let lfd = 0;
const mk = (kind, color, abilities = [], extra = {}) => ({ id: kind + color + (++lfd), kind, color, level: 20, abilities, used: {}, hp: 9, maxHp: 9, atk: 3, shield: 0, ...extra });
const state = (board, rules = "hp") => ({ board, w: W, h: H, holes: new Set(), rules, turn: "w",
  captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 });
function brett(figur, lage) {
  const b = Array(W * H).fill(null);
  b[MITTE] = figur;
  if (figur.kind !== "K") b[0] = mk("K", "w");
  b[W * H - 1] = mk("K", "b");
  if (lage === "umringt") {
    for (const [df, dr] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]])
      b[(MR + dr) * W + MF + df] = mk("P", "b", [], { hasMoved: true });
  }
  return b;
}
const deltas = (moves) => moves.map((z) => key([z.to % W - MF, ((z.to / W) | 0) - MR]));

/* Welche Art traegt die Faehigkeit im Kern? (moves.js, die hasAbility-Zweige) */
const ART = {
  pawn_sidestep: "P", pawn_forward_capture: "P", pawn_charge: "P", pawn_backstep: "P", pawn_early_promo: "P",
  knight_longleap: "N", knight_outrider: "N",
  bishop_hop: "B", bishop_ortho_step: "B",
  rook_diag_step: "R", rook_breach: "R",
  queen_knightleap: "Q", king_dash: "K",
  teleport: "Q", ranged_shot: "R", dragon_flight: "D",
};
/* Bewegungs-Faehigkeiten laut Kern = alle, die in moves.js per hasAbility
   abgefragt werden (Fliegen ueber abilities.includes) - gemessen im Quelltext. */
const movesSrc = readFileSync(new URL("./src/core/rules/moves.js", import.meta.url), "utf8");
const kernAbfragen = [...new Set([...movesSrc.matchAll(/hasAbility\(piece, "([a-z_]+)"\)/g)].map((x) => x[1]))];
if (/abil\.includes\("dragon_flight"\)/.test(movesSrc)) kernAbfragen.push("dragon_flight");

console.log("\n== 1. ZAEHLUNG ==");
const alle = Object.keys(ABILITIES);
console.log(`  Faehigkeiten in abilities.js: ${alle.length}`);
console.log(`  davon vom Kern (moves.js) als Zug abgefragt: ${kernAbfragen.length} -> ${kernAbfragen.join(", ")}`);
console.log(`  Zugbilder in ABILITY_MOVE: ${Object.keys(ABILITY_MOVE).length} -> ${Object.keys(ABILITY_MOVE).join(", ")}`);
const ohneBild = kernAbfragen.filter((id) => !ABILITY_MOVE[id] && id !== "pawn_early_promo");
const ohneKern = Object.keys(ABILITY_MOVE).filter((id) => !kernAbfragen.includes(id));
console.log(`  Kern-Zugfaehigkeiten OHNE Zugbild (bewusst: Blinzeln ist Umkreis, Schuss ist kein Zug): ${ohneBild.join(", ") || "-"}`);
ok("jedes Zugbild hat einen Kern-Zweig" + (ohneKern.length ? " - OHNE KERN: " + ohneKern.join(", ") : ""), ohneKern.length === 0);
ok("jede Faehigkeit im Zugbild existiert in abilities.js", Object.keys(ABILITY_MOVE).every((id) => ABILITIES[id]));
ok("nur Blinzeln und Scharfschuss haben kein Zugbild", ohneBild.length === 2 && ohneBild.includes("teleport") && ohneBild.includes("ranged_shot"));

console.log("\n== 2. ZUGBILD-MUSTER gegen KERN-MUSTER (Figur auf d4, 8x8) ==");
for (const id of Object.keys(ABILITY_MOVE)) {
  if (id === "dragon_flight") continue;   // 2x2-Block, eigener Abschnitt
  const kind = ART[id];
  const bild = new Set(ABILITY_MOVE[id].leaps.map(key));
  const perStufe = {};
  for (const stufe of [1, 2, 3]) {
    const kern = new Set();
    for (const lage of ["leer", "umringt"]) {
      for (const rules of ["hp", "chess"]) {
        const mit = mk(kind, "w", [id], { stufen: { [id]: stufe } });
        const ohne = mk(kind, "w", [], {});
        const zMit = pieceMoves(state(brett(mit, lage), rules), MITTE);
        const zOhne = pieceMoves(state(brett(ohne, lage), rules), MITTE);
        const ohneSet = new Set(deltas(zOhne));
        for (const z of zMit) {
          const k = key([z.to % W - MF, ((z.to / W) | 0) - MR]);
          const eigen = z.consumes === id || (z.special && ["leap", "step", "hop", "breach", "dash", "side", "fcap", "rush", "back", "blink"].includes(z.special) && !ohneSet.has(k));
          if (eigen || !ohneSet.has(k)) kern.add(k);
        }
      }
    }
    perStufe[stufe] = kern;
  }
  const kern1 = perStufe[1];
  const nurBild = sortKeys([...bild].filter((k) => !kern1.has(k)));
  const nurKern = sortKeys([...kern1].filter((k) => !bild.has(k)));
  const st2 = sortKeys([...perStufe[2]].filter((k) => !kern1.has(k)));
  const st3 = sortKeys([...perStufe[3]].filter((k) => !perStufe[2].has(k)));
  ok(`${id} (${kind}): Zugbild ${sortKeys([...bild]).join(" ")} == Kern Stufe I ${sortKeys([...kern1]).join(" ")}`
    + (nurBild.length ? ` | NUR IM BILD: ${nurBild.join(" ")}` : "") + (nurKern.length ? ` | NUR IM KERN: ${nurKern.join(" ")}` : ""),
    nurBild.length === 0 && nurKern.length === 0);
  if (st2.length || st3.length) {
    console.log(`        Stufe II ergaenzt: ${st2.join(" ") || "-"} | Stufe III ergaenzt: ${st3.join(" ") || "-"}  -> das Zugbild zeigt Stufe I, der Hinweis nennt die Stufen`);
    ok(`${id}: waechst mit der Stufe, also traegt das Zugbild einen Hinweis`, !!ABILITY_MOVE[id].hinweis);
  }
}

console.log("\n== 3. BEDINGUNGEN, DIE DAS BILD NICHT ZEIGEN KANN - der Hinweis sagt sie ==");
{
  /* Phase / Durchbruch: nur wenn das Nachbarfeld BESETZT ist */
  for (const [id, kind, spec] of [["bishop_hop", "B", "hop"], ["rook_breach", "R", "breach"]]) {
    const leer = pieceMoves(state(brett(mk(kind, "w", [id]), "leer")), MITTE).filter((z) => z.special === spec).length;
    const voll = pieceMoves(state(brett(mk(kind, "w", [id]), "umringt")), MITTE).filter((z) => z.special === spec).length;
    ok(`${id}: auf leerem Brett ${leer} Zuege, umringt ${voll} -> braucht ein BESETZTES Nachbarfeld`, leer === 0 && voll === 4);
    ok(`${id}: der Hinweis unter dem Raster sagt das`, /angrenzende Figur/.test(ABILITY_MOVE[id].hinweis?.de || ""));
  }
  /* Koenigsflucht: nur wenn das Zwischenfeld LEER ist */
  {
    const leer = pieceMoves(state(brett(mk("K", "w", ["king_dash"]), "leer")), MITTE).filter((z) => z.special === "dash").length;
    const voll = pieceMoves(state(brett(mk("K", "w", ["king_dash"]), "umringt")), MITTE).filter((z) => z.special === "dash").length;
    ok(`king_dash: leer ${leer} Zuege, umringt ${voll} -> braucht ein LEERES Zwischenfeld`, leer === 4 && voll === 0);
    ok("king_dash: der Hinweis unter dem Raster sagt das", /Zwischenfeld frei/.test(ABILITY_MOVE.king_dash.hinweis?.de || ""));
  }
  /* Stossschlag: nur wenn VOR dem Bauern ein Gegner steht - das Bildfeld [0,1] ist sonst der normale Schritt */
  {
    const leer = pieceMoves(state(brett(mk("P", "w", ["pawn_forward_capture"]), "leer")), MITTE).filter((z) => z.special === "fcap").length;
    const voll = pieceMoves(state(brett(mk("P", "w", ["pawn_forward_capture"]), "umringt")), MITTE).filter((z) => z.special === "fcap").length;
    ok(`pawn_forward_capture: leer ${leer}, Gegner davor ${voll} -> gleiches Feld wie der Grundschritt, nur als SCHLAG`, leer === 0 && voll === 1);
    ok("pawn_forward_capture: der Hinweis unter dem Raster sagt das", /Schlag/.test(ABILITY_MOVE.pawn_forward_capture.hinweis?.de || ""));
  }
  /* Sturmlauf: Weg muss frei sein, kein Schlag; von der Grundreihe zaehlt Feld 2 als normaler Doppelschritt */
  {
    const p = mk("P", "w", ["pawn_charge"], { stufen: { pawn_charge: 3 } });
    const b = brett(p, "leer"); b[(MR + 2) * W + MF] = mk("P", "b");
    const rush = pieceMoves(state(b), MITTE).filter((z) => z.special === "rush").length;
    ok(`pawn_charge III mit Gegner auf +2: ${rush} Laufzuege -> der Lauf bricht am ersten Hindernis, schlaegt nie`, rush === 0);
    const b2 = Array(W * H).fill(null); const start = 1 * W + MF;
    b2[start] = mk("P", "w", ["pawn_charge"], { stufen: { pawn_charge: 1 } }); b2[0] = mk("K", "w"); b2[W * H - 1] = mk("K", "b");
    const z = pieceMoves(state(b2), start);
    ok(`pawn_charge I von der Grundreihe: ${z.filter((x) => x.special === "rush").length} Laufzuege, ${z.filter((x) => x.double).length} Doppelschritt -> Feld +2 ist dort der Doppelschritt`,
      z.filter((x) => x.special === "rush").length === 0 && z.filter((x) => x.double).length === 1);
    ok("pawn_charge: der Hinweis nennt die Stufen und den freien Weg", /Stufe I.*frei/.test(ABILITY_MOVE.pawn_charge.hinweis?.de || ""));
  }
  /* Blinzeln (teleport): 24 Felder im Umkreis 2, nur LEERE - hat KEIN Zugbild */
  {
    const z = pieceMoves(state(brett(mk("Q", "w", ["teleport"]), "leer")), MITTE).filter((x) => x.special === "blink");
    ok(`teleport: ${z.length} Blinzel-Ziele auf leerem Brett (Umkreis 2, nur leere Felder)`, z.length === 24);
  }
  /* Scharfschuss: Distanz 2-3 in Sichtlinie, Figur bleibt stehen - hat KEIN Zugbild (ist auch kein Zug) */
  {
    const b = brett(mk("R", "w", ["ranged_shot"]), "leer"); b[(MR + 2) * W + MF] = mk("N", "b"); b[MR * W + MF + 3] = mk("N", "b");
    const z = pieceMoves(state(b), MITTE).filter((x) => x.special === "shot");
    ok(`ranged_shot: ${z.length} Schuesse (Distanz 2 und 3), noAdvance`, z.length === 2 && z.every((x) => x.noAdvance));
  }
  /* Die Legende: Hinweis zuerst, dann der Satz ueber die gruenen Felder; drive3 darf keine Quelltextspur sehen */
  {
    const de = zugbildLegende(ABILITY_MOVE.bishop_hop, false), en = zugbildLegende(ABILITY_MOVE.bishop_hop, true);
    ok("Legende DE: Hinweis vor dem Gruen-Satz", de.startsWith("nur über") && de.endsWith("durch diese Fähigkeit"));
    ok("Legende EN: Hinweis vor dem Gruen-Satz", en.startsWith("only over") && en.endsWith("ability adds"));
    ok("Legende ohne Hinweis bleibt der alte Satz", zugbildLegende(ABILITY_MOVE.pawn_sidestep, false) === "Grün: neue Felder durch diese Fähigkeit");
    const spuren = ["/*", "*/", "v1.", "style={{", "=>", "px)", "em)", "Besitzer:"];
    const alleTexte = Object.values(ABILITY_MOVE).flatMap((s) => s.hinweis ? [s.hinweis.de, s.hinweis.en] : []);
    ok(`kein Hinweis traegt eine Quelltextspur (${alleTexte.length} Texte)`, alleTexte.every((t) => !spuren.some((s) => t.includes(s))));
  }
}

console.log("\n== 4. DER GROSSE DRACHE: Fliegen je Stufe ==");
{
  /* 10x10, Anker auf (4,4): so kappt der Rand erst bei 4 Feldern - auf 8x8
     haette Stufe III (Reichweite 4) am Rand wie Stufe II ausgesehen. */
  const DW = 10;
  for (const stufe of [1, 2, 3]) {
    const b = Array(DW * DW).fill(null);
    const a = 4 * DW + 4;
    const d = mk("D", "w", ["dragon_flight"], { big: true, stufen: { dragon_flight: stufe } });
    b[a] = d; for (const c of [a + 1, a + DW, a + DW + 1]) b[c] = { kind: "D+", color: "w", ref: a };
    b[0] = mk("K", "w"); b[DW * DW - 1] = mk("K", "b");
    const fly = pieceMoves({ ...state(b), w: DW, h: DW }, a).filter((x) => x.special === "dragonFly");
    const maxAbst = Math.max(...fly.map((x) => Math.max(Math.abs(x.to % DW - 4), Math.abs(((x.to / DW) | 0) - 4))));
    ok(`dragon_flight Stufe ${stufe}: ${fly.length} Flugziele (Anker), Reichweite ${maxAbst} - Zugbild zeigt ${ABILITY_MOVE.dragon_flight.leaps.length} Felder (Reichweite 2)`,
      maxAbst === 1 + stufe);
  }
  ok("dragon_flight: der Hinweis nennt die Stufen", /Stufe I.*III/.test(ABILITY_MOVE.dragon_flight.hinweis?.de || ""));
}

console.log("\n== 5. SONDERFIGUREN MIT moveSpec: kommen ihre Faehigkeiten im Kern an? ==");
{
  /* v1.89.1: moves.js kehrte fuer Figuren mit moveSpec frueh zurueck (vor
     dem Schuss-Block). Gemessen: Kapitaen (moveSpec) mit ranged_shot und
     Gegner auf Distanz 2 im HP-Gefecht -> 0 Schuesse. Seit dem Fix gilt der
     Schuss fuer alle Figuren gleich. */
  const stumm = [], geprueft = [];
  for (const ch of Object.values(CHARACTERS)) {
    if (!ch.moveSpec) continue;
    for (const rg of ch.ladder) {
      const id = rg.ability;
      if (!kernAbfragen.includes(id)) continue;
      const fig = mk(ch.kind, "w", [id], { moveSpec: ch.moveSpec, charId: ch.id });
      const b = brett(fig, "leer");
      b[(MR + 2) * W + MF] = mk("N", "b"); b[(MR - 2) * W + MF] = mk("N", "b");
      const z = pieceMoves(state(b), MITTE);
      const treffer = z.filter((x) => x.consumes === id || x.special === "shot" || x.special === "blink");
      geprueft.push(`${ch.id}:${id}`);
      if (!treffer.length) stumm.push(`${ch.id}:${id}`);
    }
  }
  console.log(`  geprueft: ${geprueft.join(", ")}`);
  ok(`jede Kern-Zugfaehigkeit einer moveSpec-Figur liefert Zuege (${geprueft.length} Paare)` + (stumm.length ? " - STUMM: " + stumm.join(", ") : ""), stumm.length === 0);
  ok("mindestens zehn Sonderfiguren tragen den Scharfschuss", geprueft.filter((p) => p.endsWith(":ranged_shot")).length >= 10);
  /* Der Kapitaen ausdruecklich: ein Gegner auf Distanz 2, einer auf Distanz 3 in einer anderen Linie, einer auf Distanz 1 (zu nah) */
  {
    const cap = CHARACTERS.captain;
    const fig = mk(cap.kind, "w", ["ranged_shot"], { moveSpec: cap.moveSpec, charId: "captain" });
    const b = brett(fig, "leer");
    b[(MR + 2) * W + MF] = mk("N", "b"); b[MR * W + MF + 3] = mk("N", "b"); b[(MR - 1) * W + MF] = mk("N", "b");
    const z = pieceMoves(state(b), MITTE).filter((x) => x.special === "shot");
    ok(`Kapitaen (moveSpec) mit Scharfschuss: ${z.length} Schuesse (Distanz 2 und 3, nicht 1)`, z.length === 2 && z.every((x) => x.consumes === "ranged_shot" && x.noAdvance));
    const zSchach = pieceMoves(state(b, "chess"), MITTE).filter((x) => x.special === "shot");
    ok("im reinen Schach schiesst auch der Kapitaen nicht (zweiter Riegel)", zSchach.length === 0);
    const zBlink = pieceMoves(state(brett(mk(cap.kind, "w", ["teleport"], { moveSpec: cap.moveSpec }), "leer")), MITTE).filter((x) => x.special === "blink");
    ok(`Kapitaen (moveSpec) mit Blinzeln: ${zBlink.length} Ziele, keins doppelt`, zBlink.length === 24 && new Set(zBlink.map((x) => x.to)).size === 24);
  }
}

console.log("\n== 6. WER TRAEGT WAS (characters.js) ==");
{
  const traeger = {};
  for (const ch of Object.values(CHARACTERS)) for (const rg of ch.ladder) (traeger[rg.ability] ||= []).push(`${ch.id}@${rg.level}`);
  for (const id of alle) console.log(`  ${id.padEnd(22)} ${(ABILITIES[id].tag || "").padEnd(8)} once=${String(!!ABILITIES[id].once).padEnd(5)} bild=${ABILITY_MOVE[id] ? "ja " : "nein"} kern=${kernAbfragen.includes(id) ? "ja " : "nein"} | ${(traeger[id] || []).join(", ") || "(niemand)"}`);
  const falschArt = alle.filter((id) => kernAbfragen.includes(id) && ART[id] && (traeger[id] || []).some((t) => {
    const ch = CHARACTERS[t.split("@")[0]]; return !(ch.kind === ART[id] || (ART[id] === "B" && ch.kind === "A") || (ART[id] === "R" && ch.kind === "C") || ["teleport", "ranged_shot"].includes(id));
  }));
  ok("keine Zugfaehigkeit haengt an einer Figur, deren Art sie im Kern nicht kennt" + (falschArt.length ? " - FALSCHE ART: " + falschArt.join(", ") : ""), falschArt.length === 0);
  const verwaist = Object.keys(ABILITY_MOVE).filter((id) => !(traeger[id] || []).length);
  console.log(`  Zugbilder ohne Traeger in characters.js (verwaist, nicht falsch): ${verwaist.join(", ") || "-"}`);
}

/* ── v1.90.4 (Audit A12): WELCHER SPRUNG DARF SCHACH BIETEN? ─────────
   In pseudoMoves bremst eine Zeile den Sprung auf den Koenig: im Schach zielt
   ein `leap` nie auf die Krone (gegen das Ersticken des eingebauten
   Startkoenigs in 2-3 Zuegen). Gemeint waren die TALENTE - nur trugen die
   ZUGBILDER der Sonderfiguren und Monster dasselbe Etikett. Fuenf
   Sonderfiguren und neun Monster konnten im Schach deshalb nie Schach bieten
   oder den Koenig schlagen, und der Koenig durfte gefahrlos in ihre
   Reichweite ziehen (Audit-Messung E2: Geist e3, schwarzer Koenig e5 ->
   inCheck false, obwohl ein Zug auf das Koenigsfeld existiert). */
{
  const { inCheck } = await import("./src/core/rules/attacks.js");
  const { pseudoMoves } = await import("./src/core/rules/moves.js");
  const W = 8, ixx = (f, r) => r * W + f;
  const grund = (extra) => {
    const b = new Array(64).fill(null);
    b[ixx(0, 0)] = { id: 1, kind: "K", color: "w", level: 1, abilities: [], used: {}, hasMoved: true };
    b[ixx(4, 4)] = { id: 2, kind: "K", color: "b", level: 1, abilities: [], used: {}, hasMoved: true };
    Object.assign(b, extra(b));
    return { board: b, w: W, h: 8, holes: new Set(), rules: "chess", turn: "w",
      captured: { w: [], b: [] }, potions: { w: 0, b: 0 }, moveCount: 0, log: [], seed: 1 };
  };
  /* Ein Zugbild-Traeger mit Sprung (2,1) - er steht so, dass der Sprung genau
     auf dem schwarzen Koenig landet. Die Art ist "X", die echte Monster-Art
     (bosses.js: "Every boss brings ONE unique piece (kind 'X')"): sie hat im
     switch von pieceMoves KEINEN Zweig, also zieht die Figur AUSSCHLIESSLICH
     nach ihrem Zugbild. Mit einer gewoehnlichen Art daneben wuerde die Probe
     nichts messen - die normalen Springerspruenge boten dann ohnehin Schach,
     und der Fehler blieb unsichtbar. Genau so ist er im Haus jahrelang
     unentdeckt geblieben. */
  const zug = grund((b) => { b[ixx(2, 3)] = { id: 3, kind: "X", color: "w", level: 1, abilities: [], used: {},
    hasMoved: true, moveSpec: { leaps: [[2, 1], [-2, -1], [1, 2], [-1, -2]] } }; return b; });
  const trifft = pseudoMoves(zug, "w").some((m) => m.to === ixx(4, 4));
  ok("A12: der Zugbild-Sprung landet auf dem Koenigsfeld", trifft);
  ok("A12: und DAS ist jetzt Schach - der Koenig ist dort nicht mehr sicher",
    inCheck(zug, "b") === true);
  /* Die Gegenprobe: das TALENT bleibt gebremst. Das ist Balance, kein Fehler
     (der Kommentar in moves.js nennt das Ersticken des Startkoenigs). */
  const talent = grund((b) => { b[ixx(2, 3)] = { id: 4, kind: "N", color: "w", level: 1,
    abilities: ["knight_outrider", "knight_longleap"], used: {}, hasMoved: true }; return b; });
  const talentZuege = pseudoMoves(talent, "w");
  ok("A12: das Talent bietet weiterhin Spruenge an", talentZuege.some((m) => m.weitsprung));
  ok("A12: aber keinen auf den Koenig - die Balance-Bremse bleibt",
    !talentZuege.some((m) => m.to === ixx(4, 4) && m.weitsprung));
  /* Im HP-Gefecht war die Bremse nie aktiv und bleibt es nicht. */
  const hp = { ...talent, rules: "hp" };
  ok("A12: im HP-Gefecht darf das Talent den Koenig weiterhin treffen",
    pseudoMoves(hp, "w").some((m) => m.to === ixx(4, 4)));
  /* Und der Halbschaden aus der Ferne haengt weiter am `leap`-Etikett -
     genau darum wurde ein Zusatzfeld genommen und nicht umbenannt. */
  ok("A12: die Talent-Spruenge tragen weiterhin special 'leap' (Halbschaden)",
    talentZuege.filter((m) => m.weitsprung).every((m) => m.special === "leap"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
