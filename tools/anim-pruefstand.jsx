/* ── DER ANIMATIONS-PRUEFSTAND (v1.90.15, Besitzerauftrag 30.9.2026) ───────────
   "dass man nochmal die Animation alle sauber geprueft hat, weil da sind
    immer wieder Fehler zu erkennen"

   Die Animationskammer (?animkammer) fuehrt jede Bewegung auf einer
   NACHGEBAUTEN Buehne vor. Hier laeuft dagegen die ECHTE BoardView mit
   echten Zuegen aus dem Kern (applyMove) - genau so, wie GameScreen sie
   bekommt: `state` und `state.lastMove`. Jede Szene stellt eine Stellung
   auf, zieht EINEN Zug und laesst die Probe (tools/pruefe-animation.mjs)
   jedes Bild mitschreiben.

   Die Szene sagt ausserdem, WER am Zug beteiligt ist (Angreifer und Opfer
   mit Feld und Bild), damit die Probe am lebenden DOM zaehlen kann, wo
   welche Figur in welchem Bild sichtbar war. */
import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import { BoardView, zugDauerMs } from "../src/app/ui/board/BoardView.jsx";
import { GLOBAL_CSS, T } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { createGame, applyMove, legalMovesFrom, defaultArmy, cloneState } from "../src/core/index.js";
import { FELD_KAPITEL } from "../src/app/ui/board/feldArt.js";

/* Drei Lagen des Bretts: ohne Kapitelbrett (Schnelles Spiel, Fugen und
   Saum), mit Kapitelbrett (Kampagne, fugenlos) und gedreht (Online-Duell
   als Schwarz). ?feld=1 bzw. ?dreh=1. */
const Q = new URLSearchParams(location.search);
const MIT_FELD = Q.get("feld") === "1", GEDREHT = Q.get("dreh") === "1";
const POV = GEDREHT ? "b" : "w";

setAnimAn(true);
const style = document.createElement("style");
style.textContent = GLOBAL_CSS;
document.head.appendChild(style);
document.body.style.background = T.bg;

const W = 8;
const sq = (n) => (n.charCodeAt(0) - 97) + (Number(n.slice(1)) - 1) * W;

/** Stellung bauen: vom Grundaufbau aus Figuren versetzen, damit HP-Werte,
 *  Kennungen und alles andere echt aus createGame stammen. */
function aufbau(rules, weissArmee = defaultArmy()) {
  return createGame(weissArmee, defaultArmy(), { seed: 7, rules });
}
function setze(s, von, nach) { const b = s.board; b[sq(nach)] = b[sq(von)]; b[sq(von)] = null; }
function leere(s, ...felder) { for (const f of felder) s.board[sq(f)] = null; }
function zugVon(s, von, nach, pruef = () => true) {
  const m = legalMovesFrom(s, sq(von)).find((x) => x.to === sq(nach) && pruef(x));
  if (!m) throw new Error(`kein Zug ${von}-${nach} (${legalMovesFrom(s, sq(von)).map((x) => x.to + (x.special ? ":" + x.special : "")).join(",")})`);
  return m;
}

/* Jede Szene raeumt das Brett bis auf die Koenige und die Beteiligten - dann
   traegt jede Rolle ein EIGENES Bild, und die Probe kann sie am Bild erkennen.
   (Auf vollem Brett teilen sich acht Bauern dieselbe Quelle.) */
function nur(s, ...felder) {
  const bleibt = new Set(["e1", "e8", ...felder].map(sq));
  for (let i = 0; i < s.board.length; i++) if (!bleibt.has(i)) s.board[i] = null;
}

const SZENEN = {
  zug() {
    const s = aufbau("chess"); nur(s, "e2");
    return { s, m: zugVon(s, "e2", "e4"), wer: { angreifer: "e2" } };
  },
  gleiten() {
    const s = aufbau("chess"); setze(s, "a1", "a2"); nur(s, "a2");
    return { s, m: zugVon(s, "a2", "a7"), wer: { angreifer: "a2" } };
  },
  schlag() {
    const s = aufbau("chess");
    setze(s, "g1", "e4"); setze(s, "c8", "f6"); nur(s, "e4", "f6");
    return { s, m: zugVon(s, "e4", "f6"), wer: { angreifer: "e4", opfer: "f6" } };
  },
  /* HP, der Treffer toetet NICHT: der Angreifer bleibt stehen, das Opfer
     verliert Leben. Das ist der haeufigste Schlag im Gefecht. */
  hpTreffer() {
    const s = aufbau("hp");
    setze(s, "g1", "e4"); setze(s, "c8", "f6"); nur(s, "e4", "f6");
    const o = s.board[sq("f6")]; o.maxHp = 30; o.hp = 30; o.shield = 0;
    return { s, m: zugVon(s, "e4", "f6"), wer: { angreifer: "e4", opfer: "f6" } };
  },
  hpSchlag() {
    const s = aufbau("hp");
    setze(s, "g1", "e4"); setze(s, "c8", "f6"); nur(s, "e4", "f6");
    const o = s.board[sq("f6")]; o.hp = 1; o.shield = 0;
    return { s, m: zugVon(s, "e4", "f6"), wer: { angreifer: "e4", opfer: "f6" } };
  },
  /* Schild im reinen Schach: der Schlag prallt ab, beide bleiben. */
  schild() {
    const s = aufbau("chess");
    setze(s, "g1", "e4"); setze(s, "c8", "f6"); nur(s, "e4", "f6");
    s.board[sq("f6")].shield = 1;
    return { s, m: zugVon(s, "e4", "f6"), wer: { angreifer: "e4", opfer: "f6" } };
  },
  rochade() {
    const s = aufbau("chess"); nur(s, "h1");
    return { s, m: zugVon(s, "e1", "g1", (x) => x.special === "castle"), wer: { angreifer: "e1", turm: "h1" } };
  },
  enPassant() {
    const s = aufbau("chess");
    setze(s, "e2", "e5"); setze(s, "d7", "d5"); nur(s, "e5", "d5");
    s.lastMove = { from: sq("d7"), to: sq("d5"), color: "b", kind: "P", double: true, capture: false };
    const m = legalMovesFrom(s, sq("e5")).find((x) => x.special === "enpassant");
    if (!m) throw new Error("kein en passant");
    return { s, m, wer: { angreifer: "e5", opfer: "d5" } };
  },
  umwandlung() {
    const s = aufbau("chess");
    setze(s, "a2", "b7"); nur(s, "b7");
    const m = legalMovesFrom(s, sq("b7")).find((x) => x.to === sq("b8"));
    if (!m) throw new Error("keine Umwandlung");
    return { s, m: { ...m, promotion: m.promotion || "Q" }, wer: { angreifer: "b7" } };
  },
  /* Der grosse Drache: 2x2-Block, ein Schritt nach vorn. */
  drache() {
    const a = defaultArmy();
    a.back[0] = { kind: "D", big: true, level: 1, abilities: [], shield: 0 };
    a.back[1] = null;
    const s = aufbau("chess", a);
    const anker = s.board.findIndex((p) => p && p.kind === "D" && p.big);
    const felder = [];
    for (let i = 0; i < s.board.length; i++) { const p = s.board[i]; if (p && (p === s.board[anker] || (p.kind === "D+" && p.ref === anker))) felder.push("abcdefgh"[i % 8] + (((i / 8) | 0) + 1)); }
    nur(s, ...felder);
    const m = legalMovesFrom(s, anker).find((x) => x.special === "dragonStep" && x.to === anker + W);
    if (!m) throw new Error("kein Drachenschritt: " + legalMovesFrom(s, anker).map((x) => x.to + ":" + x.special).join(","));
    return { s, m, wer: { angreifer: "anker:" + anker } };
  },
};

function Buehne() {
  const [st, setSt] = useState(null);
  useEffect(() => {
    window.__szene = (name) => {
      const { s, m, wer } = SZENEN[name]();
      s.turn = s.board[m.from].color;
      const vorher = cloneState ? cloneState(s) : s;
      vorher.lastMove = null;
      setSt(vorher);
      return new Promise((ok) => setTimeout(() => {
        const nach = applyMove(s, m);
        if (window.__vorZug) window.__vorZug();   // die Probe beginnt im selben Takt mitzuschreiben
        window.__zugZeit = performance.timeOrigin + performance.now();   // Uhrzeit fuer den Bildstreifen
        window.__nachher = { lastMove: nach.lastMove, zug: { from: m.from, to: m.to, special: m.special || null },
          dauer: zugDauerMs(nach.lastMove, POV, false, W) };
        setSt(nach);
        ok({ wer, zug: window.__nachher.zug, lastMove: nach.lastMove, dauer: window.__nachher.dauer, zugZeit: window.__zugZeit });
      }, 900));
    };
    window.__bereit = true;
  }, []);
  if (!st) return <div id="leer" />;
  return (
    <div id="brett" style={{ width: 390, margin: "90px auto 0" }}>
      <BoardView lang="de" state={st} onMove={() => {}} interactive={false} lastMove={st.lastMove}
        animateFor={null} hotseat={false} pov={POV} flip={GEDREHT} maxPx={390} artStyle="painted" showLevel
        feld={MIT_FELD ? FELD_KAPITEL[0] : null} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Buehne />);
