import { other, WHITE, BLACK, BASE_HP, BASE_ATK, HP_REMIS_HALBZUEGE } from "../domain/constants.js";
import { cloneBoard, findKing } from "../domain/board.js";
import { pseudoMoves, pieceMoves, talentWirkt, verbuche, zauberRest, stufeVon } from "../rules/moves.js";
import { kroneFaengtAb, schildwachtDeckt, nachtwacheHeilt, faehrteFolgt, konzilLehntAb, sturmRuftZurueck, hinterstenBauern } from "../rules/buende.js";
import { inCheck } from "../rules/attacks.js";
import { schlageSperre, loeseFalleAus, zerfalleSperren } from "../rules/sperren.js";
import { familyOf, familyCount, crownWallSoak } from "../rules/families.js";

export function cloneState(state) {
  return {
    board: cloneBoard(state.board),
    w: state.w, h: state.h, holes: state.holes, // board geometry is immutable per match → shared by ref
    /* v0.90: Sperren und Fallen VERAENDERN sich im Lauf der Partie (eine
       Mauer broeckelt, eine Falle schnappt zu) - anders als die Brettform.
       Sie muessen darum mitkopiert werden; ohne diese Zeile verschwand eine
       Mauer schon beim ersten Schlag, statt zu broeckeln. */
    ...(state.sperren ? { sperren: state.sperren } : {}),
    ...(state.fallen ? { fallen: state.fallen } : {}),
    /* ── DIE BUENDE UEBERLEBEN JEDEN ZUG (v1.10.3) ───────────────────────
       GEFUNDEN beim ersten Trinklied-Versuch: die Heilung griff nie, und der
       Grund lag nicht bei ihr - cloneState kopierte das Feld `buende` nicht
       mit. Nach dem ersten Zug war es undefined, und jede Bundregel prallte
       an einer leeren Liste ab.

       Es wird als REFERENZ weitergereicht, nicht kopiert: die Liste steht
       beim Aufbau der Partie fest und aendert sich nie. Das Gedaechtnis der
       Einmal-Buende dagegen MUSS kopiert werden, sonst wuerde ein Zug den
       Verbrauch eines anderen sehen. */
    ...(state.buende ? { buende: state.buende } : {}),
    sturmVerbraucht: { ...(state.sturmVerbraucht || {}) },
    konzilVerbraucht: { ...(state.konzilVerbraucht || {}) },
    /* v1.30.0: die Beute der Wegelagerei - einzeln kopiert, wie alles hier
       (die Falle aus v1.10.3: ein neues Feld ohne diese Zeile verschwindet
       mit dem naechsten Zug). */
    ...(state.beute ? { beute: { ...state.beute } } : {}),
    /* v1.31.0: die Felder des Schreckens - einzeln kopiert; abgelaufene fallen weg */
    ...(state.schreckFelder ? { schreckFelder: Object.fromEntries(Object.entries(state.schreckFelder)
      .filter(([, v]) => v && v.bis >= (state.moveCount || 0))) } : {}),
    geleitVerbraucht: { ...(state.geleitVerbraucht || {}) },
    rules: state.rules,
    turn: state.turn,
    captured: { w: [...state.captured.w], b: [...state.captured.b] },
    potions: state.potions, // carried through every move; the POTION command replaces it immutably
    shifts: state.shifts,       // Time Rifts (magic circle) — the SHIFT command replaces it immutably
    shiftArmed: state.shiftArmed ?? null,
    history: state.history, // shared by reference; only real moves push to it
    lastMove: state.lastMove,
    moveCount: state.moveCount,
    ohneSchaden: state.ohneSchaden || 0,
    log: state.log,
    seed: state.seed,
  };
}

/* v1.0.63: DER STILLE ZERFALL. Jeder Halbzug laesst die stehenden Sperren
   altern (siehe ZERFALL_TAKT in rules/sperren.js). Er haengt an jedem Ausgang
   von applyMove, nicht an einem davon - eine Mauer, die nur beim gewoehnlichen
   Zug broeckelt, waere beim Drachenschritt unsterblich.
   Steht nichts an, kommt DASSELBE Verzeichnis zurueck: die KI-Suche laeuft
   millionenfach hier durch und darf dabei nichts kopieren. */
function altern(ns) {
  if (ns.sperren) {
    const s = zerfalleSperren(ns.sperren, ns.moveCount || 0);
    if (s !== ns.sperren) ns.sperren = s;
  }
  /* ── WAS NACH JEDEM ZUG GESCHIEHT (v1.10.3) ──────────────────────────────
     altern() ist der gemeinsame Ausgang JEDES Zuges - Schlag, Gleiten,
     Sonderzug, alle laufen hier durch. Deshalb stehen die Buende hier, die
     nach einem Zug wirken, und nicht an drei verschiedenen Stellen.

     NACHTWACHE heilt die Seite, die GERADE GEZOGEN HAT. Nicht die am Zug
     befindliche: der Alchemist arbeitet, waehrend seine Leute ausruhen, nicht
     waehrend sie kaempfen. */
  /* ── FAEHRTE: der Partner rueckt nach (v1.10.6) ──────────────────────────
     "Zieht einer von beiden, rueckt der andere ein Feld nach." Gemeint ist
     ein Schritt in DIESELBE Richtung, in die der erste gezogen ist - die
     beiden folgen einer Spur, sie laufen nicht auseinander.

     Der Nachzug ist FREIWILLIG in dem Sinne, dass er ausfaellt, wenn das
     Feld besetzt oder vom Brett ist. Er kostet keinen eigenen Zug und
     schlaegt nie: ein Nachruecken, das nebenbei eine Figur nimmt, waere ein
     zweiter Zug in einem - und genau das soll ein Bund nicht sein. */
  if (ns.lastMove && ns.lastMove.to != null) {
    const pf = faehrteFolgt(ns, ns.lastMove.to);
    if (pf != null) {
      const W2 = ns.w;
      const df = Math.sign((ns.lastMove.to % W2) - (ns.lastMove.from % W2));
      const dr = Math.sign(Math.floor(ns.lastMove.to / W2) - Math.floor(ns.lastMove.from / W2));
      const zf = pf + dr * W2 + df;
      const neueSpalte = (pf % W2) + df;
      if (df || dr) {
        if (zf >= 0 && zf < ns.board.length && neueSpalte >= 0 && neueSpalte < W2 && !ns.board[zf]) {
          ns.board[zf] = ns.board[pf];
          ns.board[pf] = null;
          ns.lastMove.bundFaehrte = { von: pf, nach: zf };
        }
      }
    }
  }

  const heiler = ns.lastMove ? ns.lastMove.color : null;
  if (heiler) {
    const zf = nachtwacheHeilt(ns, heiler);
    if (zf != null) {
      const p = ns.board[zf];
      p.hp = Math.min(p.maxHp, p.hp + 1);
      ns.lastMove.bundNachtwache = zf;
    }
  }
  return ns;
}

// In HP mode a promoting piece adopts the new kind's stats.
function repromote(piece, kind) {
  piece.kind = kind;
  if (piece.maxHp != null) { piece.maxHp = BASE_HP[kind] || piece.maxHp; piece.hp = piece.maxHp; piece.atk = BASE_ATK[kind] || piece.atk; }
}

/**
 * Apply a move and return a NEW state (immutable). Pass {record:true} for real
 * moves so undo works; search uses record:false.
 *
 * CHESS rules: capturing removes the target and the attacker advances. A shielded
 * target absorbs one hit (attacker bounces, shield consumed).
 * HP rules: an attack deals the attacker's `atk` as damage. If it kills, the
 * attacker advances onto the square; if the target survives, the attacker stays
 * put (a "bump"). Either way the move costs a turn. Regicide ends the game.
 */
export function applyMove(state, move, opts) {
  const record = !!(opts && opts.record);
  const hp = state.rules === "hp";
  const ns = cloneState(state);
  const b = ns.board;
  const piece = b[move.from];
  if (!piece) return state;

  /* ── v0.90: DER SCHLAG GEGEN EINE SPERRE ────────────────────────────────
     Kein Zug im eigentlichen Sinn: die Figur bleibt, wo sie steht, und der
     Zug ist fort. Genau das ist der Preis, den der Besitzer wollte - nicht
     Material, sondern TEMPO. Die Sperre verliert einen Punkt und faellt beim
     letzten. */
  if (move.schlag) {
    const { sperren, gefallen } = schlageSperre(ns.sperren || {}, move.to);
    ns.sperren = sperren;
    ns.turn = piece.color === WHITE ? BLACK : WHITE;
    ns.lastMove = { ...move, schlag: true, gefallen };
    if (typeof bundKrone !== "undefined" && bundKrone != null) ns.lastMove.bundKrone = bundKrone;
    /* v1.0.63: hier stand `ns.ply` - ein Zaehler, den cloneState gar nicht
       mitkopiert und den niemand liest. Der Schlag gegen eine Sperre KOSTET
       den Zug, also muss er auch den Zugzaehler weiterdrehen; sonst alterte
       keine Sperre, waehrend jemand auf sie einschlug, und die Uhr des
       HP-Remis stand still. */
    ns.moveCount = state.moveCount + 1;
    ns.ohneSchaden = (state.ohneSchaden || 0) + 1;   // Schutt ist kein Schaden an Figuren
    /* v1.0.63: hier lag der ZWEITE Fehler dieses Zweigs, und er haette
       abgestuerzt, sobald ein Spieler wirklich eine Sperre haette schlagen
       koennen: in die Historie wanderte der ZUG, waehrend undo() von dort
       einen ZUSTAND zurueckgibt. Der Zeitenwender haette ein Zugobjekt als
       Brett ausgeliefert. Jetzt legt auch dieser Zweig den vorigen Zustand ab
       - wie jeder andere. */
    if (record) ns.history = [...state.history, state];
    return altern(ns);
  }
  // blows aimed at a dragon's WING strike the dragon himself; when the beast
  // falls, all four of his squares clear at once
  let target = b[move.to];
  let dragonAnchor = -1;
  if (target && target.kind === "D+") { dragonAnchor = target.ref; target = b[target.ref]; }
  else if (target && target.big && target.kind === "D") dragonAnchor = move.to;
  const clearDragon = (a) => {
    const W2 = ns.w ?? 10;
    for (const c of [a, a + 1, a + W2, a + W2 + 1]) {
      const oc = b[c];
      if (oc && (c === a || (oc.kind === "D+" && oc.ref === a))) b[c] = null;
    }
  };

  let bounced = false, damaged = false, lethal = false, dmg = 0;
  let angreiferFiel = false;   /* v1.30.0: Widerhall kann den Angreifer faellen */

  // ── spawn: the piece stays put and creates a pawn on an empty adjacent
  // square (bosses with a spawn budget). Costs the turn like any move. ──
  if (move.special === "spawn") {
    let geschaffen = false;
    if ((piece.spawnLeft || 0) > 0 && !target) {
      const pawn = { id: (state.moveCount + 1) * 100000 + move.to, kind: "P", color: piece.color,
        level: 1, abilities: [], shield: 0, used: {}, hasMoved: true };
      if (hp) { pawn.maxHp = BASE_HP.P; pawn.hp = pawn.maxHp; pawn.atk = BASE_ATK.P; }
      b[move.to] = pawn;
      piece.spawnLeft -= 1;
      geschaffen = true;
    }
    if (ns.shiftArmed === piece.color) { ns.turn = piece.color; ns.shiftArmed = null; }
    else ns.turn = other(state.turn);
    ns.lastMove = { consumed: (typeof move !== "undefined" && move && move.consumes) || null, from: move.from, to: move.to, color: piece.color, kind: piece.kind, capture: false, spawned: true, special: "spawn" };
    if (typeof bundKrone !== "undefined" && bundKrone != null) ns.lastMove.bundKrone = bundKrone;
    ns.moveCount = state.moveCount + 1;
    ns.ohneSchaden = geschaffen ? 0 : (state.ohneSchaden || 0) + 1;
    if (record) { ns.history = [...state.history, state]; }
    return altern(ns);
  }


  // ── THE BIG DRAGON moves as a 2x2 block ─────────────────────────────────────
  // dragonStep: one square orthogonally, and he crushes any foe under his
  // leading edge. dragonFly: ONCE per game the block leaps farther. Landing on
  // foes is a direct strike on every covered square; in hp play, SURVIVORS
  // throw him back to where he took off (the strike still counts).
  if (move.special === "dragonStep" || move.special === "dragonFly") {
    const W = ns.w ?? 10;
    const block = (a) => [a, a + 1, a + W, a + W + 1];
    const oldCells = block(move.from), newCells = block(move.to);
    for (const c of oldCells) b[c] = null;                    // lift off
    let settled = true;
    if (move.special === "dragonFly") piece.used = { ...(piece.used || {}), dragon_flight: true };
    const covered = newCells.map((c) => b[c]).filter((oc) => oc && oc.color !== piece.color);
    if (covered.length) {
      if (hp) {
        for (const oc of covered) {
          const before = oc.hp;
          oc.hp = Math.max(0, oc.hp - (oc.shield > 0 ? Math.max(1, piece.atk - 1) : piece.atk));
          if (oc.shield > 0) oc.shield -= 1;
          damaged = damaged || oc.hp < before;
          if (oc.hp <= 0) {
            lethal = true;
            ns.captured[piece.color].push(oc.kind);
            for (const c2 of newCells) if (b[c2] === oc) b[c2] = null;
          }
        }
        settled = newCells.every((c) => !b[c]);               // any survivor throws him back
      } else {
        for (const oc of covered) {
          lethal = true;
          ns.captured[piece.color].push(oc.kind);
          for (const c2 of newCells) if (b[c2] === oc) b[c2] = null;
        }
      }
    }
    const home = settled ? move.to : move.from;
    b[home] = piece;
    for (const c of block(home)) if (c !== home) b[c] = { kind: "D+", color: piece.color, ref: home };
    piece.hasMoved = true;
    if (ns.shiftArmed === piece.color) { ns.turn = piece.color; ns.shiftArmed = null; }
    else ns.turn = other(state.turn);
    ns.lastMove = { consumed: (typeof move !== "undefined" && move && move.consumes) || null, from: move.from, to: settled ? move.to : move.from, color: piece.color, kind: piece.kind,
      capture: lethal, damaged, lethal, special: move.special, bounced: !settled };
    if (typeof bundKrone !== "undefined" && bundKrone != null) ns.lastMove.bundKrone = bundKrone;
    /* v1.10.1: hat der Paladin eingegriffen, merkt der Zug es sich - die
       Anzeige liest den letzten Zug, Ereignislisten gibt es hier nicht. */
    if (typeof bundKrone !== "undefined" && bundKrone != null) ns.lastMove.bundKrone = bundKrone;
    ns.moveCount = state.moveCount + 1;
    ns.ohneSchaden = (damaged || lethal) ? 0 : (state.ohneSchaden || 0) + 1;
    if (record) { ns.history = [...state.history, state]; }
    return altern(ns);
  }

  if (hp) {
    const has = (id) => piece.abilities.includes(id);
    if (target) {
      // the SHIELD WALL: a crown piece flanked orthogonally by crown kin soaks
      // damage — 1 while 2+ crown stand, 2 from 6+. The wall is living: it is
      // read off the CURRENT board, so it crumbles as the court falls.
      const W = state.w || 8, H2 = state.h || 8, ti = move.to, tf = ti % W;
      const flanked = familyOf(target) === "crown" && [
        tf > 0 ? ti - 1 : -1, tf < W - 1 ? ti + 1 : -1, ti - W, ti + W,
      ].some((n) => { const q = n >= 0 && n < W * H2 ? b[n] : null;
        return q && q !== target && q.color === target.color && familyOf(q) === "crown"; });
      const wall = flanked ? crownWallSoak(familyCount(b, target.color, "crown")) : 0;
      // wardAdj aura: allies orthogonally beside their fielded boss stand warded
      const warded = [tf > 0 ? ti - 1 : -1, tf < W - 1 ? ti + 1 : -1, ti - W, ti + W]
        .some((n) => { const q = n >= 0 && n < W * H2 ? b[n] : null;
          return q && q.color === target.color && q.aura && q.aura.type === "wardAdj"; });
      /* v1.2.0: in Klassik schweigen die Lebenstalente (siehe NUR_MIT_LEBEN
         in moves.js) - dort gibt es weder Schaden noch Leben. */
      /* ── DIE SCHILDWACHT DECKT IHRE REIHE (v1.10.1) ─────────────────────
         Techniker und Schildtraeger geben allen eigenen Figuren auf ihrer
         gemeinsamen Reihe oder Linie einen Schild - er zaehlt wie ein
         Bollwerk, also einen Punkt weniger Schaden. */
      /* ── v1.30.0: DIE MONSTERFAEHIGKEITEN AM TREFFER ────────────────────
         Steinhaut, Widerhall, Unsterblich, Wegelagerei. Jede wirkt an JEDEM
         Treffer - am Hauptziel wie an der Schockwelle -, damit eine Regel nie
         vom Weg des Schadens abhaengt. Die Staerke kommt aus der Stufe der
         Faehigkeit (stufeVon; gegnerische Monster: aus ihrer Monsterstufe). */
      const traegt = (q, id, sq) => !!(q && q.abilities && q.abilities.includes(id) && talentWirkt(id, state.rules, state, sq, q.color));
      const steinhautFaengt = (q, sq) => {
        if (!traegt(q, "steinhaut", sq)) return false;
        const n = q.steinhaut || 0;
        if (n >= stufeVon(q, "steinhaut")) return false;   // Stufe I: ein Treffer, II: zwei
        q.steinhaut = n + 1;
        return true;
      };
      const stehtAuf = (q, sq) => {
        /* v1.31.0: GEISTWANDEL - einmal je Partie kehrt es als Geist zurueck:
           3 Leben, doppelter Angriff, bleich (das Brett liest q.geist) */
        if (q && q.hp <= 0 && !q.geist && traegt(q, "geistwandel", sq)
            && !(traegt(q, "unsterblich", sq) && !q.auferstanden)) {   // Unsterblich zuerst, dann der Geist
          q.geist = true; q.hp = 3; q.maxHp = 3; q.atk = (q.atk || 1) * 2;
          ns.geistFeld = sq;
          return true;
        }
        if (!q || q.hp > 0 || q.auferstanden || !traegt(q, "unsterblich", sq)) return false;
        q.hp = Math.max(1, Math.ceil((q.maxHp || 1) * (stufeVon(q, "unsterblich") >= 2 ? 1 / 2 : 1 / 4)));
        q.auferstanden = true;                             // einmal je Partie
        return true;
      };
      const hallZurueck = (q, sq, d) => (d > 0 && traegt(q, "widerhall", sq)
        ? Math.ceil(d * (stufeVon(q, "widerhall") >= 2 ? 1 / 2 : 1 / 4)) : 0);
      let widerhall = 0;
      /* ── v1.31.0: GIFT und ADERLASS - was ein Treffer an der getroffenen Figur
         hinterlaesst. Gift: 1/2/3 Leben nach jedem eigenen Zug, drei Runden
         lang, NIE toedlich (sonst stuerbe ein Koenig mitten im Zug des
         Gegners). Aderlass: 1/2 Hoechstleben weniger, bis zum Partieende. */
      const zehrt = (q, sq, d) => {
        if (!q || d <= 0 || q.hp <= 0) return;
        if (traegt(piece, "gift", move.from)) {
          q.giftN = Math.max(q.giftN || 0, stufeVon(piece, "gift")); q.giftRunden = 3;
          ns.vergiftet = [...(ns.vergiftet || []), sq];
        }
        if (traegt(piece, "aderlass", move.from)) {
          const weg = stufeVon(piece, "aderlass");
          q.maxHp = Math.max(1, (q.maxHp || q.hp) - weg); q.hp = Math.min(q.hp, q.maxHp);
          ns.aderlass = [...(ns.aderlass || []), { at: sq, weg }];
        }
      };
      const raubt = (d) => {
        if (d <= 0 || !traegt(piece, "wegelagerei", move.from)) return;
        const gold = [0, 2, 4, 6][stufeVon(piece, "wegelagerei")] || 2;
        ns.beute = { ...(ns.beute || {}), [piece.color]: ((ns.beute && ns.beute[piece.color]) || 0) + gold };
      };
      const wacht = schildwachtDeckt(state, ti) ? 1 : 0;
      const soak = (target.abilities.includes("bulwark") && talentWirkt("bulwark", state.rules, state, ti, target.color) ? 1 : 0) + wall + (warded ? 1 : 0) + wacht;
      // BALANCE: strikes from afar carry less weight — a leap or a ranged
      // shot lands at HALF force (rounded up); melee keeps its full bite.
      const afar = move.special === "leap" || move.special === "shot" || move.noAdvance;
      const force = afar ? Math.ceil((piece.atk || 1) / 2) : (piece.atk || 1);
      dmg = Math.max(1, force - soak);
      /* ── DER PALADIN SPRINGT EIN (v1.10.1) ──────────────────────────────
         Steht er direkt neben dem Koenig, nimmt er den Treffer statt seiner.
         NUR von nebenan - der Besitzer war da ausdruecklich: "Der darf nicht
         irgendwo stehen."

         Wichtig fuer den Ablauf: der Schaden wandert VOLLSTAENDIG auf den
         Paladin, der Koenig bleibt unberuehrt. Ein halber Uebertrag waere
         schwerer zu erklaeren und im Gefecht nicht ablesbar. */
      let bundKrone = null, bundKonzil = false, bundSturm = null;
      /* ── DAS KONZIL LEHNT AB (v1.10.8) ──────────────────────────────────
         Vor dem Paladin, denn der Rat greift frueher: er verhindert den
         Schlag ueberhaupt, waehrend der Paladin ihn nur umlenkt. */
      if (konzilLehntAb(state, ti)) {
        ns.konzilVerbraucht = { ...(ns.konzilVerbraucht || {}), [target.color]: true };
        bundKonzil = true;
        dmg = 0;
      }
      if (dmg > 0 && steinhautFaengt(target, ti)) { dmg = 0; ns.steinhaut = ti; }   /* v1.30.0 */
      const retter = dmg > 0 ? kroneFaengtAb(state, ti) : null;
      if (retter != null) {
        const pal = b[retter];
        pal.hp -= dmg;
        /* Damit die Anzeige es zeigen kann: der Zug merkt sich, dass der
           Bund gegriffen hat. Ereignislisten gibt es in diesem Kern nicht -
           die Anzeige liest den letzten Zug. */
        bundKrone = retter;
        if (pal.hp <= 0) b[retter] = null;
      } else target.hp -= dmg;
      /* v1.30.0: wer getroffen wurde (Ziel oder Paladin), wirft zurueck; wer
         traf, raubt */
      widerhall += retter != null ? hallZurueck(b[retter], retter, dmg) : hallZurueck(target, ti, dmg);
      raubt(dmg);
      zehrt(retter != null ? b[retter] : target, retter != null ? retter : ti, dmg);   /* v1.31.0 */
      if (move.consumes) verbuche(piece, move.consumes); // v1.28.0: ein Einsatz mehr - die Stufe entscheidet, wie viele
      if (has("lifesteal") && talentWirkt("lifesteal", state.rules, state, move.from, piece.color)) piece.hp = Math.min(piece.maxHp, piece.hp + Math.ceil(dmg / 2));
      /* ── SCHOCKWELLE (v0.79, blast): EINMAL pro Partie trifft der erste
         Nahkampfschlag auch alle GEGNER rings um das Ziel - mit HALBEM
         Schaden (Besitzerregel: eine Flaeche schlaegt nie so hart wie die
         Klinge selbst). Drachenfluegel leiten auf den Drachen um; jeder
         Getroffene zaehlt nur einmal. Nur Nahkampf: ein Schuss aus der
         Ferne traegt keine Welle. ─────────────────────────────────────── */
      const welle = [];
      if (has("blast") && zauberRest(piece, "blast") > 0 && !afar) {   /* v1.28.0: Schockwelle II trifft zweimal */
        verbuche(piece, "blast");
        const wDmg = Math.max(1, Math.ceil(dmg / 2));
        const rund = [ti - W - 1, ti - W, ti - W + 1, ti - 1, ti + 1, ti + W - 1, ti + W, ti + W + 1];
        const getroffen = new Set();
        for (const n of rund) {
          if (n < 0 || n >= W * H2) continue;
          if (Math.abs((n % W) - tf) > 1) continue;          // kein Umlauf ueber den Rand
          let oc = b[n];
          if (!oc || oc.color === piece.color) continue;
          let ocAnker = -1;
          if (oc.kind === "D+") { ocAnker = oc.ref; oc = b[oc.ref]; }
          else if (oc.big && oc.kind === "D") ocAnker = n;
          if (!oc || oc === target || getroffen.has(oc)) continue;
          getroffen.add(oc);
          const ocFeld = ocAnker >= 0 ? ocAnker : n;
          if (steinhautFaengt(oc, ocFeld)) { welle.push({ at: n, kind: oc.kind, dmg: 0, tot: false }); continue; }   /* v1.30.0 */
          oc.hp -= wDmg;
          widerhall += hallZurueck(oc, ocFeld, wDmg);
          raubt(wDmg);
          zehrt(oc, ocFeld, wDmg);   /* v1.31.0 */
          const faellt = oc.hp <= 0 && !stehtAuf(oc, ocFeld);
          welle.push({ at: n, kind: oc.kind, dmg: wDmg, tot: faellt });
          if (faellt) {
            ns.captured[piece.color].push(oc.kind);
            if (ocAnker >= 0) clearDragon(ocAnker); else b[n] = null;
          }
        }
        if (welle.length) damaged = true;
      }
      if (target.hp <= 0 && sturmRuftZurueck(state, target)) {
        /* ── DER STURM: DIE AMAZONE KEHRT ZURUECK (v1.11.1) ─────────────────
           "Sie fiel. Er rief. Sie stand wieder auf, und niemand sprach je
           darueber." Einmal je Partie, und nur solange der Warlock steht.

           EIN BAUER MACHT IHR PLATZ (Besitzeridee, v1.11.2). Der erste
           Entwurf liess sie fallen, wenn ihr Startfeld besetzt war - das
           hing aber vom Zufall ab: dort steht zu Partiebeginn oft eine eigene
           Figur. Eine Regel, die man nicht steuern kann, ist keine Regel,
           sondern Glueck.

           Jetzt hat der Rueckruf einen PREIS, den man kennt und einplanen
           kann: der hinterste eigene Bauer faellt, und sie nimmt seinen
           Platz. Ist kein Bauer mehr da, faellt sie - ein klarer,
           verstehbarer Grund statt einer Zufallsbedingung.

           Der HINTERSTE, weil er am wenigsten Stellung kostet; ein Bauer
           kurz vor der Wandlung waere ein bitterer Preis. */
        const heim = hinterstenBauern(state, target.color);
        if (heim != null) {
          target.hp = Math.max(1, Math.round(target.maxHp / 2));
          ns.captured[other(target.color)].push(b[heim].kind);   // der Bauer faellt
          b[heim] = target;
          b[ti] = null;
          ns.sturmVerbraucht = { ...(ns.sturmVerbraucht || {}), [target.color]: true };
          bundSturm = heim;
          /* der Angreifer rueckt vor, als waere das Feld leer - es ist leer */
          if (!move.noAdvance) { b[move.to] = piece; b[move.from] = null; piece.hasMoved = true; }
          damaged = true;
        } else {
          lethal = true;
          ns.captured[piece.color].push(target.kind);
          if (dragonAnchor >= 0) clearDragon(dragonAnchor);
          if (move.noAdvance) b[move.to] = null;
          else { b[move.to] = piece; b[move.from] = null; piece.hasMoved = true; }
        }
      } else if (target.hp <= 0 && stehtAuf(target, ti)) {
        /* v1.30.0: UNSTERBLICH - es steht wieder auf; der Angreifer bleibt, wo
           er war, wie nach einem Treffer, der nicht toetet */
        damaged = true;
        ns.aufstand = ti;
      } else if (target.hp <= 0) {                 // kill
        lethal = true;
        ns.captured[piece.color].push(target.kind);
        if (dragonAnchor >= 0) clearDragon(dragonAnchor);  // the beast falls: all four squares clear
        if (move.noAdvance) {                      // ranged kill: target gone, shooter stays
          b[move.to] = null;
        } else {                                   // melee kill: attacker advances
          b[move.to] = piece; b[move.from] = null; piece.hasMoved = true;
          if (move.promotion) repromote(piece, move.promotion);
        }
      } else {
        damaged = true;                            // bump / ranged hit: attacker stays, target wounded
      }
      /* v1.30.0: WIDERHALL - der Angreifer bekommt zurueck, was er austeilte,
         anteilig. Er steht jetzt dort, wohin der Schlag ihn gefuehrt hat. Faellt
         er, faellt er wie jede Figur (ein Koenig: Koenigsmord); steht er selbst
         unsterblich wieder auf, bleibt er. */
      if (widerhall > 0) {
        const wo = b.indexOf(piece);
        piece.hp -= widerhall;
        const tot = piece.hp <= 0 && !stehtAuf(piece, wo);
        ns.widerhall = { at: wo, dmg: widerhall, tot };
        if (tot && wo >= 0) {
          angreiferFiel = true;
          ns.captured[other(piece.color)].push(piece.kind);
          if (piece.big) clearDragon(wo); else b[wo] = null;
        }
      }
      if (welle.length) ns.welle = welle;          // fuer Klang und Anzeige
    } else {                                       // quiet move
      b[move.to] = piece; b[move.from] = null; piece.hasMoved = true;
      if (move.consumes) verbuche(piece, move.consumes); // v1.28.0: ein Einsatz mehr - die Stufe entscheidet, wie viele
      if (move.promotion) repromote(piece, move.promotion);
    }
    if (!angreiferFiel && has("regen") && talentWirkt("regen", state.rules, state, move.to, piece.color)) piece.hp = Math.min(piece.maxHp, (piece.hp || 0) + 1);
    /* ── v1.31.0: WAS NACH DEM ZUG WIRKT ────────────────────────────────────
       BLENDEN (Zauber, I: einmal, II: zweimal je Partie): loest von selbst aus,
       wenn das Monster so zieht, dass Gegner im Umkreis von zwei Feldern
       stehen - sie duerfen ihren naechsten Zug nicht ziehen. Der KOENIG wird
       nie geblendet. */
    const stehtNoch = !angreiferFiel && b[move.to] === piece;
    const mt = (id) => talentWirkt(id, state.rules, state, move.to, piece.color);
    if (stehtNoch && has("blenden") && mt("blenden") && zauberRest(piece, "blenden") > 0) {
      const W0 = state.w || 8, tf = move.to % W0, tr = Math.floor(move.to / W0), blind = [];
      for (let i = 0; i < b.length; i++) {
        const q = b[i];
        if (!q || q.color === piece.color || q.kind === "K") continue;
        if (Math.max(Math.abs((i % W0) - tf), Math.abs(Math.floor(i / W0) - tr)) > 2) continue;
        q.blindBis = state.moveCount + 1; blind.push(i);
      }
      if (blind.length) { verbuche(piece, "blenden"); ns.blenden = { at: move.to, felder: blind }; }
    }
    /* SCHRECKEN (I: eine Runde, II: zwei): das verlassene Feld ist fuer Gegner
       unbetretbar. Gilt fuer den Zug des Gegners, der gleich folgt (und bei II
       auch fuer den danach). */
    if (has("schrecken") && mt("schrecken") && move.from !== move.to && b[move.from] == null) {
      ns.schreckFelder = { ...(ns.schreckFelder || {}),
        [move.from]: { farbe: piece.color, bis: state.moveCount + 1 + 2 * (stufeVon(piece, "schrecken") - 1) } };
    }
    /* GIFT WIRKT nach jedem eigenen Zug des Vergifteten: 1/2/3 Leben, nie unter
       1, drei Runden lang. */
    for (let i = 0; i < b.length; i++) {
      const q = b[i];
      if (!q || q.color !== piece.color || !(q.giftRunden > 0)) continue;
      q.hp = Math.max(1, q.hp - (q.giftN || 1));
      q.giftRunden -= 1; if (q.giftRunden <= 0) { q.giftRunden = 0; q.giftN = 0; }
      ns.giftWirkt = [...(ns.giftWirkt || []), i];
    }
  } else {
    if (target && target.shield > 0) {            // chess: shield absorbs the hit
      target.shield -= 1; bounced = true;
      if (move.consumes) verbuche(piece, move.consumes); // v1.28.0: ein Einsatz mehr - die Stufe entscheidet, wie viele
    } else {
      if (target) ns.captured[piece.color].push(target.kind);
      if (dragonAnchor >= 0) clearDragon(dragonAnchor);
      /* Ein Schuss aus der Ferne traegt den Schuetzen NICHT ans Ziel - unter
         HP-Regeln stand das laengst so, im Schach zog er faelschlich auf das
         Feld (und damit vier Felder weit in jede Richtung). */
      if (move.noAdvance) { b[move.to] = null; }
      else { b[move.to] = piece; b[move.from] = null; piece.hasMoved = true; }
      if (move.consumes) verbuche(piece, move.consumes); // v1.28.0: ein Einsatz mehr - die Stufe entscheidet, wie viele
      if (move.promotion) piece.kind = move.promotion;
    }
  }

  // SONDERZUEGE (v0.49) - Rochade: der Turm springt im selben Zug auf die
  // Innenseite des Koenigs. En passant: der ueberholte Bauer verschwindet
  // von SEINEM Feld - das Zielfeld des Schlagzugs war leer, der stille
  // Zweig oben hat den Schlaeger bereits gezogen.
  if (move.special === "castle") {
    const rk = b[move.rookFrom];
    if (rk && rk.kind === "R") { b[move.rookTo] = rk; b[move.rookFrom] = null; rk.hasMoved = true; }
  }
  let epOpfer = null;
  if (move.special === "enpassant") {
    epOpfer = b[move.epCapture] || null;
    if (epOpfer) { ns.captured[piece.color].push(epOpfer.kind); b[move.epCapture] = null; }
  }
  const captured = hp ? lethal : ((!!target && !bounced) || !!epOpfer);
  // an armed TIME RIFT (magic circle) lets this move keep the turn — once
  if (ns.shiftArmed === piece.color) { ns.turn = piece.color; ns.shiftArmed = null; }
  else ns.turn = other(state.turn);
  ns.moveCount = state.moveCount + 1;
  ns.ohneSchaden = (damaged || lethal || captured) ? 0 : (state.ohneSchaden || 0) + 1;
  ns.lastMove = { consumed: (typeof move !== "undefined" && move && move.consumes) || null,
    from: move.from, to: move.to, color: piece.color, kind: move.kind, byHero: !!piece.hero,
    capture: captured, bounced, damaged, dmg, lethal,
    targetHpAfter: hp && target ? Math.max(0, target.hp) : null,
    // Bei EN PASSANT ist das Zielfeld leer (target null), geschlagen wird
    // trotzdem - das Opfer stand auf seinem eigenen Feld (Crash-Befund:
    // "Cannot read properties of null" genau hier).
    captured: captured ? (target ? target.kind : epOpfer ? epOpfer.kind : null) : null,
    hitKind: target ? target.kind : epOpfer ? epOpfer.kind : null,
    hitColor: target ? target.color : epOpfer ? epOpfer.color : null,
    hitHero: target ? !!target.hero : !!(epOpfer && epOpfer.hero),
    special: move.special || null, promotion: move.promotion || null,
    double: !!move.double, epCapture: move.epCapture ?? null,
    rookFrom: move.rookFrom ?? null, rookTo: move.rookTo ?? null,
  };
  if (record) ns.history = state.history.concat([state]);
  return altern(ns);
}

/** Legal moves. Chess: pseudo moves that don't leave your king in check.
 *  HP: every pseudo move is legal (no check rule — you win by regicide). */
/* ── v1.31.0: BLENDEN und SCHRECKEN beschraenken die Zuege. Eine geblendete
   Figur zieht in ihrem naechsten Zug nicht; ein Schreckfeld des Gegners ist
   nicht betretbar. Bliebe dadurch GAR kein Zug, gilt die Beschraenkung nicht -
   eine Faehigkeit darf nie ein Remis durch Zugnot erzwingen. */
function hpSperren(state, moves) {
  const sf = state.schreckFelder, mc = state.moveCount || 0;
  const gefiltert = moves.filter((m) => {
    const p = state.board[m.from];
    if (p && p.blindBis != null && p.blindBis >= mc) return false;
    const f = sf && sf[m.to];
    if (f && f.bis >= mc && p && f.farbe !== p.color) return false;
    return true;
  });
  return gefiltert.length ? gefiltert : moves;
}
export function legalMoves(state, color = state.turn) {
  const pseudo = pseudoMoves(state, color);
  if (state.rules === "hp") return hpSperren(state, pseudo);
  const out = [];
  const imSchach = inCheck(state, color);
  for (let i = 0; i < pseudo.length; i++) {
    const m = pseudo[i];
    // ROCHADE-SICHERHEIT (v0.49): aus dem Schach heraus gibt es keine
    // Rochade, und das KREUZFELD des Koenigs darf nicht bedroht sein - das
    // Zielfeld prueft die normale Schachprobe darunter ohnehin.
    if (m.special === "castle") {
      if (imSchach) continue;
      // isSquareAttacked zaehlt nur SCHLAG-Zuege - ein LEERES Kreuzfeld ist
      // fuer sie nie bedroht (gemessen: Turm zielte frei darauf, Antwort
      // false). Der ehrliche Test: den Koenig probeweise EINEN Schritt auf
      // das Kreuzfeld stellen und die normale Schachprobe fragen.
      const zwischen = applyMove(state, { from: m.from, to: m.cross });
      if (inCheck(zwischen, color)) continue;
    }
    const ns = applyMove(state, m);
    if (!inCheck(ns, color)) out.push(m);
  }
  return out;
}

export function legalMovesFrom(state, sqIndex) {
  const piece = state.board[sqIndex];
  if (!piece || piece.color !== state.turn) return [];
  const pseudo = pieceMoves(state, sqIndex);
  if (state.rules === "hp") {
    /* dieselbe Sperre wie legalMoves - aber gemessen am GANZEN Zugvorrat, damit
       Brett und KI dasselbe erlauben */
    const alle = hpSperren(state, pseudoMoves(state, piece.color));
    return pseudo.filter((m) => alle.some((a) => a.from === m.from && a.to === m.to && (a.special || null) === (m.special || null)));
  }
  return pseudo.filter((m) => !inCheck(applyMove(state, m), piece.color));
}

export function status(state) {
  const color = state.turn;
  if (state.rules === "hp") {
    const wk = findKing(state.board, WHITE, state.w);
    const bk = findKing(state.board, BLACK, state.w);
    if (!wk || !bk) return { over: true, result: "regicide", winner: wk ? WHITE : BLACK, check: false };
    const legal = legalMoves(state, color);
    if (legal.length === 0) return { over: true, result: "draw", winner: null, check: false, grund: "keinZug" };
    /* Stillstand: faellt 120 Halbzuege lang kein Schaden, ist die Partie remis. */
    if ((state.ohneSchaden || 0) >= HP_REMIS_HALBZUEGE)
      return { over: true, result: "draw", winner: null, check: false, grund: "ohneSchaden" };
    return { over: false, result: "ongoing", winner: null, check: false, legalCount: legal.length };
  }
  const legal = legalMoves(state, color);
  const check = inCheck(state, color);
  if (legal.length === 0)
    return check
      ? { over: true, result: "checkmate", winner: other(color), check: true }
      : { over: true, result: "stalemate", winner: null, check: false };
  return { over: false, result: "ongoing", winner: null, check, legalCount: legal.length };
}

export function undo(state) {
  if (!state.history || state.history.length === 0) return state;
  return state.history[state.history.length - 1];
}
