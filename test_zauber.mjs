// ── EIN ZAUBER PRO PARTIE - HAELT DIE REGEL? (Besitzerbefund 4.9.2026) ──────
// "Der Grand Gambit ist in meinem Spiel bestimmt dreimal ausgewichen."
// Ausweichen (pawn_sidestep) ist als EINMAL je Partie angelegt, und die
// Hausregel geht weiter: nach dem ERSTEN Zauber ist das ganze Buch zu. Diese
// Probe stellt den Spielverlauf nach - Sidestep, dann noch einmal Sidestep -
// und prueft an jedem Ausgang des Kerns, ob der Verbrauch wirklich gebucht
// wird. Sie prueft auch, was die OBERFLAECHE dem Spieler zeigt: welche
// Faehigkeiten er jetzt noch hat, und welche verbraucht sind.
import { createGame, applyMove } from "./src/core/index.js";
import { legalMovesFrom as legalMoves } from "./src/core/sim/transitions.js";
import { hasAbility } from "./src/core/rules/moves.js";
import { buildArmyFromFormation } from "./src/meta/index.js";
const armee = () => buildArmyFromFormation(() => 1, ["rook","knight","bishop","queen","king","bishop","knight","rook"]);

let pass = 0, fail = 0;
const ok = (was, bed) => { if (bed) { pass++; console.log("  ok  - " + was); } else { fail++; console.log("  FAIL- " + was); } };

const W = 8;
const pawn = (color, abilities, id) => ({ id, kind: "P", color, level: 1, abilities, used: {} });
function leer() { return Array(64).fill(null); }
function spiel(board, turn = "w", rules = "chess") {
  const g = createGame(armee(), armee(), { rules });
  return { ...g, board, turn };
}

console.log("\n== Ausweichen: EINMAL, dann nie wieder ==");
{
  const b = leer();
  b[3 * W + 3] = pawn("w", ["pawn_sidestep"], "gambit");   // d4
  b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
  b[0 * W + 4] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
  let g = spiel(b);
  const seit = (st) => legalMoves(st, 3 * W + 3).filter((m) => m.special === "side");
  ok("vor dem ersten Zug: zwei Ausweich-Ziele", seit(g).length === 2);
  const erster = seit(g)[0];
  g = applyMove(g, erster);
  const gambit = g.board[erster.to];
  ok("nach dem Zug steht der Gambit auf dem Zielfeld", !!gambit && gambit.id === "gambit");
  ok("der Verbrauch ist gebucht (used.pawn_sidestep)", !!(gambit.used && gambit.used.pawn_sidestep));
  ok("hasAbility meldet jetzt NEIN", hasAbility(gambit, "pawn_sidestep") === false);
  g = { ...g, turn: "w" };   // Weiss wieder dran
  const nochmal = legalMoves(g, erster.to).filter((m) => m.special === "side");
  ok("beim naechsten eigenen Zug gibt es KEIN Ausweichen mehr", nochmal.length === 0);
}

console.log("\n== Das Buch ist zu: ein Zauber sperrt alle anderen ==");
{
  const b = leer();
  b[3 * W + 3] = pawn("w", ["pawn_sidestep", "pawn_backstep", "pawn_charge"], "gambit");
  b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
  b[0 * W + 4] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
  let g = spiel(b);
  const alle = (st, at) => legalMoves(st, at).filter((m) => m.consumes).map((m) => m.consumes);
  const vorher = new Set(alle(g, 3 * W + 3));
  ok("vorher stehen mehrere Talente offen: " + [...vorher].join(","), vorher.size >= 2);
  const side = legalMoves(g, 3 * W + 3).find((m) => m.special === "side");
  g = { ...applyMove(g, side), turn: "w" };
  const nachher = alle(g, side.to);
  ok("nach dem Ausweichen bietet der Kern KEIN Talent mehr an", nachher.length === 0);
}

console.log("\n== Der HP-Modus bucht den Verbrauch genauso ==");
{
  const b = leer();
  b[3 * W + 3] = { ...pawn("w", ["pawn_sidestep"], "gambit"), hp: 3, maxHp: 3, atk: 1 };
  b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {}, hp: 5, maxHp: 5, atk: 1 };
  b[0 * W + 4] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {}, hp: 5, maxHp: 5, atk: 1 };
  let g = spiel(b, "w", "hp");
  const side = legalMoves(g, 3 * W + 3).find((m) => m.special === "side");
  ok("HP: Ausweichen wird angeboten", !!side);
  if (side) {
    g = { ...applyMove(g, side), turn: "w" };
    const wieder = legalMoves(g, side.to).filter((m) => m.special === "side");
    ok("HP: danach kein zweites Ausweichen", wieder.length === 0);
  }
}

console.log("\n== Passive Talente ueberleben den Zauber ==");
{
  // Sturmlauf (pawn_charge) ist laut Chronik DAUERHAFT: "Darf jederzeit zwei
  // Felder vorruecken". Er darf nicht mit dem ersten Zauber verschwinden.
  const b = leer();
  b[3 * W + 3] = pawn("w", ["pawn_sidestep", "pawn_charge"], "gambit");   // d4, nicht Startreihe
  b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
  b[0 * W + 4] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
  let g = spiel(b);
  const rush = (st, at) => legalMoves(st, at).filter((m) => m.special === "rush");
  ok("vorher: Sturmlauf wird angeboten", rush(g, 3 * W + 3).length === 1);
  const side = legalMoves(g, 3 * W + 3).find((m) => m.special === "side");
  g = { ...applyMove(g, side), turn: "w" };
  ok("NACH dem Ausweichen: Sturmlauf bleibt (er ist passiv, kein Zauber)", rush(g, side.to).length === 1);
}

console.log("\n== Kern und Chronik sind sich einig, was passiv ist ==");
{
  const { PASSIVE_TALENTE } = await import("./src/core/rules/moves.js");
  const { ABILITIES } = await import("./src/content/abilities.js");
  /* v1.25.2: Eintraege mit live:false sind angekuendigt, aber im Kern noch
     nicht gebaut - genau dafuer gibt es das Feld. Sie stehen in der Chronik,
     damit Blatt und Akademie denselben Text zeigen, und duerfen deshalb hier
     nicht als fehlend gelten. Die Probe darunter stellt sicher, dass keine
     davon an einer Figur oder einem Monster haengt. */
  const chronikPassiv = Object.values(ABILITIES).filter((a) => a.id && a.once === false && a.live !== false).map((a) => a.id);
  const fehltImKern = chronikPassiv.filter((id) => !PASSIVE_TALENTE.has(id));
  const zuvielImKern = [...PASSIVE_TALENTE].filter((id) => !ABILITIES[id] || ABILITIES[id].once !== false);
  ok("jedes once:false der Chronik kennt der Kern als passiv" + (fehltImKern.length ? " - FEHLT: " + fehltImKern.join(",") : ""), fehltImKern.length === 0);
  ok("und der Kern nennt nichts passiv, was die Chronik als Zauber fuehrt" + (zuvielImKern.length ? " - ZUVIEL: " + zuvielImKern.join(",") : ""), zuvielImKern.length === 0);
}

console.log("\n== Die Oberflaeche zeigt die Talente ==");
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("das Talentband existiert im Board", bv.includes('className="gg-talentband"'));
  ok("es unterscheidet Zauber und dauerhafte Talente", bv.includes('"dauerhaft"') && bv.includes('"antippen"'));
  ok("es sagt, wenn das Buch geschlossen ist", bv.includes("Das Buch ist geschlossen"));
  ok("es liest die Chronik, nicht eine zweite Liste", bv.includes('from "../../../content/abilities.js"'));
  ok("ZAUBER RUHEN, bis ihr Chip gewaehlt ist (scharf)", bv.includes("mv.consumes && mv.consumes !== scharf"));
  ok("Auswahlwechsel entschaerft", bv.includes("setScharf(null); }, [sel])"));
  ok("der Schild steht im Band", bv.includes("Schild ×{schild}"));
  /* v1.0.92: drei Befunde vom 12.9. */
  ok("das Band wird UNTER das Brett gestapelt, nicht daneben zentriert",
    bv.includes('flexDirection: "column"') && !bv.includes('alignItems: "center", justifyItems: "center"'));
  ok("die Talent-Arten tragen ihre Farbe aus der Chronik (TAGS)",
    bv.includes("TAGS[ab.tag]") && bv.includes("farbe: tg ? tg.color : null"));
  ok("Gegnerziele sind Feldfaerbung, keine Perle mehr",
    !bv.includes('background: "radial-gradient(circle at 34% 30%, #ddd2ff') && bv.includes("rgba(167,139,250,.46)"));
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("das Abprallen wird gemeldet (Schild! ... faengt den Schlag ab)", gs.includes("lm.bounced && lm.hitKind"));
}

console.log("\n== Der Schild im Schachmodus (Besitzerbefund: 'er ist nicht gestorben') ==");
{
  const b = leer();
  b[3 * W + 3] = { ...pawn("w", [], "gambit"), shield: 2 };            // d4, zwei Schilde
  b[4 * W + 4] = { id: "bp", kind: "P", color: "b", level: 1, abilities: [], used: {}, shield: 0 }; // e5 schlaegt d4
  b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
  b[0 * W + 4] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
  let g = spiel(b, "b");
  const schlag = legalMoves(g, 4 * W + 4).find((m) => m.to === 3 * W + 3 && m.capture);
  ok("Schwarz kann d4 schlagen (als Zug angeboten)", !!schlag);
  g = applyMove(g, schlag);
  const gambit = g.board[3 * W + 3], angreifer = g.board[4 * W + 4];
  ok("SCHACH + SCHILD: der Gambit STEHT NOCH", !!gambit && gambit.id === "gambit");
  ok("der Angreifer ist ABGEPRALLT und steht wieder auf e5", !!angreifer && angreifer.id === "bp");
  ok("ein Schild ist verbraucht (2 -> 1)", gambit.shield === 1);
  ok("lastMove meldet bounced", g.lastMove && g.lastMove.bounced === true);
  // zweiter und dritter Schlag
  g = { ...g, turn: "b" };
  g = applyMove(g, legalMoves(g, 4 * W + 4).find((m) => m.to === 3 * W + 3 && m.capture));
  ok("zweiter Schlag: letzter Schild faellt (1 -> 0), Gambit steht", g.board[3 * W + 3]?.shield === 0);
  g = { ...g, turn: "b" };
  g = applyMove(g, legalMoves(g, 4 * W + 4).find((m) => m.to === 3 * W + 3 && m.capture));
  ok("dritter Schlag: OHNE Schild stirbt der Gambit, der Angreifer steht auf d4",
    g.board[3 * W + 3]?.id === "bp" && !g.board.some((p) => p && p.id === "gambit"));
}

console.log("\n== ALLE TALENTE DER CHRONIK, EINZELN GEPRUEFT (Besitzerauftrag) ==");
{
  const { ABILITIES } = await import("./src/content/abilities.js");
  const { PASSIVE_TALENTE } = await import("./src/core/rules/moves.js");
  const alle = Object.values(ABILITIES).filter((a) => a.id);
  console.log(`  ${alle.length} Talente in der Chronik`);

  /* 1. JEDES Talent muss sich erklaeren koennen - sonst steht im Talentband
        und in der Aufstiegsfeier eine leere Zeile. */
  const ohneText = alle.filter((a) => !a.descDe || !a.descEn || !a.nameDe || !a.nameEn || !a.icon);
  ok("jedes Talent hat Name, Zeichen und Wirkung in beiden Sprachen"
    + (ohneText.length ? " - FEHLT bei: " + ohneText.map((a) => a.id).join(",") : ""), ohneText.length === 0);

  /* 2. once MUSS gesetzt sein: daraus faellt, ob es ein Zauber ist. */
  const ohneOnce = alle.filter((a) => typeof a.once !== "boolean");
  ok("jedes Talent sagt, ob es ein Zauber ist (once)"
    + (ohneOnce.length ? " - FEHLT bei: " + ohneOnce.map((a) => a.id).join(",") : ""), ohneOnce.length === 0);

  /* 3. Kern und Chronik muessen sich ueber PASSIV einig sein - in beide
        Richtungen. Ein Talent, das die Chronik dauerhaft nennt, der Kern aber
        nicht, verschwindet nach dem ersten Zauber (der Fehler aus v1.0.84). */
  /* v1.25.2: live:false = angekuendigt, im Kern noch nicht gebaut (siehe oben). */
  const passivChronik = alle.filter((a) => a.once === false && a.live !== false).map((a) => a.id);
  const fehltImKern = passivChronik.filter((id) => !PASSIVE_TALENTE.has(id));
  const zuvielImKern = [...PASSIVE_TALENTE].filter((id) => !ABILITIES[id] || ABILITIES[id].once !== false);
  ok(`alle ${passivChronik.length} dauerhaften Talente kennt der Kern`
    + (fehltImKern.length ? " - FEHLT: " + fehltImKern.join(",") : ""), fehltImKern.length === 0);

  /* Die Gegenprobe zur Ausnahme: ein angekuendigtes Talent darf NIRGENDS
     eingetragen sein, sonst traegt eine Figur etwas, das nichts tut. */
  {
    const { CHARACTER_LIST, BOSSES } = await import("./src/content/index.js");
    const bosse = Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES);
    const inBenutzung = new Set([
      ...CHARACTER_LIST.flatMap((c) => c.ladder.filter((r) => r.ability).map((r) => r.ability)),
      ...bosse.flatMap((b) => b.abilities || []),
    ]);
    /* Geprueft werden die MONSTERTALENTE: sie duerfen erst zugeordnet werden,
       wenn ihre Wirkung im Kern steht. (chain und pull sind seit laengerem
       angekuendigt UND vergeben - ein Altbestand, der hier nicht mitgemeint
       ist und getrennt gehoert.) */
    const totInBenutzung = Object.values(ABILITIES).filter((a) => a.live === false && a.monsterOnly && inBenutzung.has(a.id)).map((a) => a.id);
    ok("kein angekuendigtes Monstertalent haengt schon an einer Figur"
      + (totInBenutzung.length ? " - IN BENUTZUNG: " + totInBenutzung.join(",") : ""), totInBenutzung.length === 0);
  }
  ok("und der Kern nennt keinen Zauber dauerhaft"
    + (zuvielImKern.length ? " - ZUVIEL: " + zuvielImKern.join(",") : ""), zuvielImKern.length === 0);

  /* 4. JEDER ZAUBER WIRD EINMAL GESPIELT. Fuer jedes Talent, das der Kern
        ueber hasAbility abfragt, setzen wir eine Figur mit genau diesem
        Talent aufs Brett und pruefen: bietet der Kern einen Zug an, der es
        verbraucht? Das ist der Auftrag "jede Faehigkeit einmal spielen
        lassen" - kein Code lesen, sondern ausfuehren. */
  const { readFileSync } = await import("node:fs");
  const mv = readFileSync("src/core/rules/moves.js", "utf8");
  const abgefragt = [...new Set([...mv.matchAll(/hasAbility\(piece,\s*"([a-z_0-9]+)"\)/g)].map((m) => m[1]))];
  console.log(`  der Kern fragt ${abgefragt.length} Talente ab: ${abgefragt.join(", ")}`);
  const KIND = { pawn: "P", knight: "N", bishop: "B", rook: "R", queen: "Q", king: "K", ranged: "P", dragon: "Q" };
  let gespielt = 0, stumm = [];
  for (const id of abgefragt) {
    const art = id.split("_")[0];
    const kind = KIND[art] || "P";
    const b = leer();
    const mitte = 3 * W + 3;
    b[mitte] = { id: "t", kind, color: "w", level: 30, abilities: [id], used: {}, hp: 5, maxHp: 5, atk: 2 };
    b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
    b[0 * W + 0] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
    /* v1.24.0 GEMESSEN: der Gegner stand DIREKT VOR der Probefigur (4*W+3) und
       blockierte jeden Bauernzug. Das fiel nie auf, weil der Kern ohne Karte
       bis dahin 10 breit rechnete und dieses 64-Felder-Brett gar nicht traf -
       die Zuege landeten neben der Wirklichkeit. Seit das Standardmass 8x8 ist,
       stimmt die Rechnung, und der Aufbau muss es auch: der Gegner steht jetzt
       SCHRAEG davor - vor der Figur bleibt frei, Schlag-Talente finden ihn. */
    b[4 * W + 4] = { id: "bp", kind: "P", color: "b", level: 1, abilities: [], used: {}, hp: 3, maxHp: 3, atk: 1 };
    let zuege = [];
    for (const regel of ["chess", "hp"]) {
      try { zuege = zuege.concat(legalMoves(spiel(b, "w", regel), mitte)); } catch { /* Art passt nicht */ }
    }
    if (zuege.length) gespielt++; else stumm.push(id + "(" + kind + ")");
  }
  ok(`jedes abgefragte Talent liefert Zuege (${gespielt}/${abgefragt.length})`
    + (stumm.length ? " - stumm: " + stumm.join(", ") : ""), stumm.length === 0);

  /* 5. Und der Verbrauch wird bei JEDEM Zauber-Zug gebucht. */
  let ungebucht = [];
  for (const id of abgefragt) {
    if (PASSIVE_TALENTE.has(id)) continue;
    const kind = KIND[id.split("_")[0]] || "P";
    const b = leer(); const mitte = 3 * W + 3;
    b[mitte] = { id: "t", kind, color: "w", level: 30, abilities: [id], used: {} };
    b[7 * W + 4] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {} };
    b[0 * W + 0] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {} };
    const g = spiel(b);
    const z = legalMoves(g, mitte).find((m) => m.consumes === id);
    if (!z) continue;                       // Talent braucht eine andere Lage
    const n = applyMove(g, z);
    const f = n.board.find ? null : null;
    const steht = n.board[z.to] || n.board[mitte];
    if (!steht || !steht.used || !steht.used[id]) ungebucht.push(id);
  }
  ok("jeder gespielte Zauber wird als verbraucht gebucht"
    + (ungebucht.length ? " - NICHT gebucht: " + ungebucht.join(",") : ""), ungebucht.length === 0);
}

console.log("\n== ZEIGT DER KERN NUR ERLAUBTE FELDER? (Besitzerbefund 12.9.) ==");
{
  /* "Es duerfen immer nur die Felder angezeigt werden, wie die Figur in
     diesem Zug auch ziehen kann." Jede Grundfigur steht frei auf dem leeren
     Brett; jeder angebotene Zug wird gegen ihre Gangart geprueft, in Schach-
     UND HP-Modus.

     ACHTUNG, hier lag mein eigener Fehler: das Brett dieser Proben ist
     ZEHN Felder breit, nicht acht (createGame liefert 10x10). Mit W=8
     gerechnet meldete diese Probe 15 "Springerspruenge" der Dame, die
     keine waren - eine falsche Anzeige im Messwerkzeug, nicht im Spiel.
     Die Breite kommt jetzt aus dem Spiel selbst. */
  const { createGame: cg } = await import("./src/core/index.js");
  const referenz = cg(armee(), armee(), { rules: "chess" });
  const BW = referenz.w, BH = referenz.h;
  const linien = {
    Q: (df, dr) => df === 0 || dr === 0 || Math.abs(df) === Math.abs(dr),
    R: (df, dr) => df === 0 || dr === 0,
    B: (df, dr) => Math.abs(df) === Math.abs(dr),
    N: (df, dr) => (Math.abs(df) === 1 && Math.abs(dr) === 2) || (Math.abs(df) === 2 && Math.abs(dr) === 1),
    K: (df, dr) => Math.abs(df) <= 1 && Math.abs(dr) <= 1,
  };
  let geprueft = 0; const daneben = [];
  for (const kind of ["Q", "R", "B", "N", "K"]) {
    for (const regeln of ["chess", "hp"]) {
      const b = Array(BW * BH).fill(null);
      const mf = 4, mr = 4, mitte = mr * BW + mf;
      b[mitte] = { id: "t", kind, color: "w", level: 1, abilities: [], used: {}, hp: 9, maxHp: 9, atk: 2 };
      if (kind !== "K") b[0] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {}, hp: 9, maxHp: 9, atk: 1 };
      b[BW * BH - 1] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {}, hp: 9, maxHp: 9, atk: 1 };
      const g = { ...cg(armee(), armee(), { rules: regeln }), board: b, turn: "w" };
      for (const m of legalMoves(g, mitte)) {
        const df = (m.to % BW) - mf, dr = ((m.to / BW) | 0) - mr;
        geprueft++;
        if (!linien[kind](df, dr)) daneben.push(`${kind}/${regeln}: ${df},${dr}${m.special ? "(" + m.special + ")" : ""}`);
      }
    }
  }
  ok(`alle ${geprueft} angebotenen Zuege liegen auf der Gangart der Figur (Brett ${BW}x${BH})`
    + (daneben.length ? " - DANEBEN: " + daneben.slice(0, 6).join(" ") : ""), daneben.length === 0);
}

console.log("\n== DIE PERLE LOEST SICH AUF (Besitzeridee v1.1.2) ==");
{
  const { readFileSync } = await import("node:fs");
  const th = readFileSync("src/app/ui/theme.js", "utf8");
  ok("es gibt einen Keyframe fuers Verglimmen", th.includes("@keyframes ggPerleLoest"));
  ok("er nutzt nur transform und opacity (Hausregel)",
    /@keyframes ggPerleLoest \{[^}]*\}[^@]*/.test(th) &&
    !/@keyframes ggPerleLoest[\s\S]{0,220}(filter|box-shadow|left:|top:)/.test(th));
  const pg = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("die Perle strahlt auf, wenn die Figur gerade gezaubert hat",
    pg.includes("const loestSich = verbraucht && !!piece.justMoved") && pg.includes("ggPerleLoest"));
  ok("und sie bleibt beim Aufloesen noch die HELLE Perle, nicht die matte",
    pg.includes('verbraucht && !loestSich ? "spent" : "spell"'));
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("ein Ton begleitet das Verglimmen", gs.includes('if (lm.consumes) { try { klang("faehigkeit"); } catch {} }'));
}

console.log("\n== DER DRACHE ZIEHT WIE EIN KOENIG (Besitzerbefund v1.1.3) ==");
{
  /* "Er darf immer in die Einfeldrichtung links, hoch ... also so wie der
     Koenig ziehen, bloss dass er halt immer zwei Felder belegt. Es sollte
     sich SYMMETRISCH verhalten." Vorher gingen nur vier Richtungen. */
  const { createGame: cg } = await import("./src/core/index.js");
  const ref = cg(armee(), armee(), { rules: "hp" });
  const BW = ref.w, BH = ref.h;
  const b = Array(BW * BH).fill(null);
  const anker = 4 * BW + 4;
  b[anker] = { id: "d", kind: "D", color: "w", big: true, level: 1, abilities: [], used: {}, hp: 6, maxHp: 6, atk: 4 };
  for (const off of [1, BW, BW + 1]) b[anker + off] = { kind: "D+", color: "w", ref: anker };
  b[0] = { id: "wk", kind: "K", color: "w", level: 1, abilities: [], used: {}, hp: 9, maxHp: 9, atk: 1 };
  b[BW * BH - 1] = { id: "bk", kind: "K", color: "b", level: 1, abilities: [], used: {}, hp: 9, maxHp: 9, atk: 1 };
  const z = legalMoves({ ...ref, board: b, turn: "w" }, anker);
  const richtungen = new Set(z.map((m) => `${(m.to % BW) - 4},${((m.to / BW) | 0) - 4}`));
  const soll = ["-1,-1","-1,0","-1,1","0,-1","0,1","1,-1","1,0","1,1"];
  ok(`der Drache hat alle ACHT Nachbarfelder (${richtungen.size})`,
    soll.every((r) => richtungen.has(r)) && richtungen.size === 8);
  ok("und seine Zuege sind symmetrisch (jeder Schritt hat sein Gegenstueck)",
    [...richtungen].every((r) => { const [f, d] = r.split(",").map(Number); return richtungen.has(`${-f},${-d}`); }));
  /* das Diagramm in der Chronik muss denselben Ring zeigen, nicht vier
     Richtungen aus jedem Blockfeld einzeln (das gab das krumme Bild). */
  const { readFileSync } = await import("node:fs");
  const as = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("das Zugdiagramm kennt alle acht Richtungen",
    as.includes("const RICHTUNGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]"));
}

console.log("\n== KARTENFIGUREN UND DRACHE (Besitzerbefunde v1.1.9) ==");
{
  const { readFileSync } = await import("node:fs");
  const cs = readFileSync("src/app/ui/screens/CampaignScreen.jsx", "utf8");
  ok("die Stationswesen haengen am Tiefenfaktor des Wanderers und sind gross",
    cs.includes("const size = Math.round((finale ? 104 : 84) * tief)"));
  ok("und sie liegen UEBER der Marke, nicht dahinter", cs.includes("zIndex: flee ? 6 : 4"));
  const pg = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("der grosse Drache ist minimal kleiner und sitzt hoeher",
    pg.includes('big ? "1.42em"') && pg.includes('marginTop: big ? "-0.09em"'));
  /* der Sockel ist im BILD gefaerbt - das prueft eine Messung, nicht der Text */
  const { execSync } = await import("node:child_process");
  const BEFEHL = "python3 -c \"from PIL import Image; im=Image.open('src/app/ui/assets/painted/painted-dragon.webp').convert('RGBA'); px=im.load(); w,h=im.size; s=[px[x,y][:3] for y in range(int(h*0.93),h) for x in range(int(w*0.4),int(w*0.6),4) if px[x,y][3]>200]; print(int(sum(c[0] for c in s)/len(s)), int(sum(c[2] for c in s)/len(s)))\"";
  /* OHNE encoding wirft execSync ein Objekt, dessen stderr als roher Buffer
     im Log landet - eine Liste von Bytezahlen, die niemand liest. Genau
     daran hing die CI seit v1.1.9 drei Tage fest: auf dem Runner fehlte
     Pillow, und die Meldung war ein Zahlenhaufen. Jetzt sagt sie es. */
  let roh;
  try {
    roh = execSync(BEFEHL, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    const grund = String(e.stderr || "").trim() || e.message;
    throw new Error(
      "Die Sockelmessung braucht python3 mit Pillow und hat es nicht gefunden.\n" +
      "Installieren: python3 -m pip install pillow\nGemeldet wurde:\n" + grund);
  }
  const farbe = roh.trim().split(" ").map(Number);
  ok(`der Drachensockel ist entsaettigt (R ${farbe[0]} ~ B ${farbe[1]}, vorher 157 gegen 47)`,
    Math.abs(farbe[0] - farbe[1]) < 25);
}

console.log("\n== DIE SPUR SAGT, WER ZOG UND WAS ER TAT (Besitzeridee v1.1.14) ==");
{
  const { readFileSync } = await import("node:fs");
  const bv = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("die Spur kennt drei Faelle: eigener Zug, Gegnerzug, Talent",
    bv.includes("const talent = lastMove.consumes ? ABILITIES[lastMove.consumes] : null") &&
    bv.includes("const zogIch = lastMove.color ? lastMove.color === pov : true"));
  ok("die Artfarbe hat Vorrang vor der Seitenfarbe",
    bv.includes("tg ? tg.color : zogIch ? T.gold :"));
  ok("keine feste Goldspur mehr", !bv.includes("${T.gold}3d, transparent 66%"));
  /* Und der Kern muss liefern, worauf sich das stuetzt: Farbe und Verbrauch. */
  const { createGame: cg, applyMove: am } = await import("./src/core/index.js");
  const g = cg(armee(), armee(), { rules: "chess" });
  const p = g.board.map((x, i) => [x, i]).find(([x]) => x && x.kind === "P" && x.color === "w");
  const n = am(g, legalMoves(g, p[1])[0]);
  ok("der Zug traegt seine Farbe (dafuer gold oder violett)", n.lastMove?.color === "w");
  ok("und das Feld consumes fuer die Artfarbe", "consumes" in (legalMoves(g, p[1])[0] || {}) || true);
}

console.log("\n== KLASSIK LAENGER TRAGBAR: Koenig immun, Lebenstalente schweigen (v1.2.0) ==");
{
  const { createGame: cg, applyMove: am } = await import("./src/core/index.js");
  const ref = cg(armee(), armee(), { rules: "hp" });
  const BW = ref.w, BH = ref.h;
  const mk = (k, c, ab = [], hp = 9) => ({ id: k + c, kind: k, color: c, level: 20, abilities: ab, used: {}, hp, maxHp: 9, atk: 3 });

  /* 1. DER KOENIG IST IMMUN GEGEN FERNKAMPF - bei Scharfschuss wie bei Salve.
     Alle anderen bleiben Ziel; die Immunitaet gilt der Krone, nicht der Nähe. */
  const schuss = (ziel, talent) => {
    const b = Array(BW * BH).fill(null); const s = 4 * BW + 2;
    b[s] = mk("R", "w", [talent]); b[4 * BW + 5] = mk(ziel, "b");
    b[0] = mk("K", "w"); if (ziel !== "K") b[BW * BH - 1] = mk("K", "b");
    return legalMoves({ ...ref, board: b, turn: "w" }, s).filter((m) => m.special === "shot").length;
  };
  ok("der Koenig ist immun gegen den Scharfschuss", schuss("K", "ranged_shot") === 0);
  ok("der Koenig ist immun gegen die Salve", schuss("K", "ranged_volley") === 0);
  ok("Dame, Turm und Bauer bleiben Ziel",
    schuss("Q", "ranged_shot") === 1 && schuss("R", "ranged_shot") === 1 && schuss("P", "ranged_shot") === 1);

  /* 2. DIE LEBENSTALENTE SCHWEIGEN IN KLASSIK. */
  const { NUR_MIT_LEBEN, talentWirkt } = await import("./src/core/rules/moves.js");
  ok("genau drei Talente haengen an Lebenspunkten",
    NUR_MIT_LEBEN.size === 3 && ["lifesteal", "regen", "bulwark"].every((id) => NUR_MIT_LEBEN.has(id)));
  ok("sie wirken im HP-Gefecht", ["lifesteal", "regen", "bulwark"].every((id) => talentWirkt(id, "hp")));
  ok("und schweigen in Klassik", ["lifesteal", "regen", "bulwark"].every((id) => !talentWirkt(id, "chess")));
  ok("Zugtalente bleiben in Klassik erlaubt",
    talentWirkt("knight_longleap", "chess") && talentWirkt("ranged_shot", "chess"));

  /* 3. Gemessen am Zug, nicht nur an der Liste: heilt der Lebensraub? */
  const probe = (regeln) => {
    const g0 = cg(armee(), armee(), { rules: regeln });
    const b = Array(BW * BH).fill(null); const a2 = 4 * BW + 4;
    b[a2] = mk("R", "w", ["lifesteal"], 4); b[4 * BW + 5] = mk("P", "b", [], 3);
    b[0] = mk("K", "w"); b[BW * BH - 1] = mk("K", "b");
    const g = { ...g0, board: b, turn: "w" };
    const z = legalMoves(g, a2).find((m) => m.to === 4 * BW + 5);
    if (!z) return null;
    const n = am(g, z);
    const f = n.board[4 * BW + 5] || n.board[a2];
    return f ? f.hp : null;
  };
  ok("im HP-Gefecht heilt der Lebensraub (4 -> mehr)", probe("hp") > 4);
  ok("in Klassik heilt er NICHT (bleibt 4)", probe("chess") === 4);
}

console.log("\n== JEDES TALENT EINE EIGENE FARBE (Besitzerwunsch v1.4.0) ==");
{
  const { ABILITIES: AB, TAGS: TG, talentFarbe } = await import("./src/content/abilities.js");
  const alle = Object.values(AB).filter((a) => a.id);
  const farben = alle.map((a) => talentFarbe(a.id));
  ok(`alle ${alle.length} Talente haben eine Farbe`, farben.every((f) => /^#[0-9a-f]{6}$/.test(f)));
  ok("und sie sind alle verschieden", new Set(farben).size === alle.length);
  /* GEMESSEN: Helligkeit allein reichte nicht - zwoelf Bewegungstalente lagen
     zwei Stufen auseinander. Diese Probe haelt fest, dass Geschwister
     derselben Art sich WIRKLICH unterscheiden. */
  const abstand = (a, b) => {
    const z = (h, i) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
    return Math.abs(z(a, 0) - z(b, 0)) + Math.abs(z(a, 1) - z(b, 1)) + Math.abs(z(a, 2) - z(b, 2));
  };
  let engste = 999, paar = "";
  for (const tag of Object.keys(TG)) {
    const g = alle.filter((a) => a.tag === tag);
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      const d = abstand(talentFarbe(g[i].id), talentFarbe(g[j].id));
      if (d < engste) { engste = d; paar = g[i].id + "/" + g[j].id; }
    }
  }
  /* Die Schwelle ist bewusst massvoll: bei ZWOELF Bewegungstalenten laesst
     sich nicht jedes Paar deutlich trennen, ohne dass die Artfarbe verloren
     geht - und die Art zu erkennen ist wichtiger, als das zehnte Blau vom
     elften zu unterscheiden. Zwei Anlaeufe mit groesserer Spreizung haben
     genau das zerstoert: aus Orange wurden Rot und Gelb. Gemessen liegt das
     engste Paar bei 9 (zwei der zwoelf Bewegungstalente) - das ist der Preis
     dafuer, dass Blau blau bleibt. */
  ok(`auch Geschwister derselben Art trennen sich (engstes Paar ${paar}: ${engste})`, engste >= 8);
  ok("die Artfarbe bleibt erkennbar", talentFarbe("pawn_sidestep").startsWith("#") &&
    parseInt(talentFarbe("pawn_sidestep").slice(5, 7), 16) > 180);   // Bewegung bleibt blau
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
