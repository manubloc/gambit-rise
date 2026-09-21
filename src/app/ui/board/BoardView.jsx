import { useMemo, useState, useEffect, useLayoutEffect, useRef } from "react";
import { klang } from "../klang.js";
// useLayoutEffect on the client (fires before paint → no flicker), plain
// useEffect on the server (no SSR warning; the board never animates there).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { T } from "../theme.js";
import { FILES, RANKS, idx, legalMovesFrom, inCheck, findKing } from "../../../core/index.js";
import { gespart } from "../sparmodus.js";
import { SperrGlyph } from "./SperrGlyph.jsx";
import { animAn, schlagArt } from "../anim.js";
import { ABILITIES, TAGS } from "../../../content/abilities.js";
import { PASSIVE_TALENTE } from "../../../core/rules/moves.js";
import { stadium } from "../../../core/rules/sperren.js";
import { PieceGlyph, StatTriad } from "./PieceGlyph.jsx";
import { BrettRahmen, lageAusBrett } from "./BrettRahmen.jsx";
import { PieceArt } from "./PieceArt.jsx";
import { boardFrame, livery } from "../livery.js";

// THE MOVE MARKERS WEAR THE ARMY'S METAL: your own moves are struck in the
// same gold as the buttons and the jewels, a foe's (read by a seer) in the
// polished steel his pieces wear. Shape still carries the meaning — a filled
// bead is a step, a ring is a strike — but the metal says WHOSE move it is.
const MOVE_METAL = {
  gold: {
    face: "radial-gradient(circle at 33% 27%, #fff6d8, #f0d68a 40%, #c9a45c 72%, #8a6a2e)",
    ring: "radial-gradient(circle, transparent 55%, #fff6d8 56%, #f0d68a 63%, #c9a45c 78%, #7d5f28 100%)",
    rim: "#5d451c", glow: "rgba(240,214,138,.55)",
  },
  steel: {
    face: "radial-gradient(circle at 33% 27%, #ffffff, #e2e9ef 40%, #a9b6c2 72%, #6d7885)",
    ring: "radial-gradient(circle, transparent 55%, #ffffff 56%, #dfe7ee 63%, #a9b6c2 78%, #5f6a76 100%)",
    rim: "#232a33", glow: "rgba(206,220,233,.5)",
  },
};

// THE FALLEN, in flight: a captured piece doesn't just fade in a rough
// direction — it spins off the board and lands EXACTLY on its captor's tray
// (the very slot where it now shows among the taken). We measure the real
// on-screen tray at flight time (querying [data-gg-tray=<victim colour>]), so
// it lands true whether the layout is portrait, landscape or flipped.
function DeathFlyer({ death, disp, W, H, pov, artStyle }) {
  const ref = useRef(null);
  const d = disp(death.at);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = el.getBoundingClientRect();
    const cx = from.left + from.width / 2, cy = from.top + from.height / 2;
    // aim at the tray that displays a piece of THIS victim's colour; land on
    // its newest (right-most) slot — that's where the capture now sits.
    const tray = typeof document !== "undefined" && document.querySelector(`[data-gg-tray="${death.piece.color}"]`);
    let tx, ty;
    if (tray) {
      const tr = tray.getBoundingClientRect();
      tx = tr.right - Math.min(tr.height, from.width) * 0.5;   // the last glyph's centre
      ty = tr.top + tr.height / 2;
    } else {
      // no tray on screen (rare) — fall off toward the correct corner instead
      tx = cx + from.width * 2.4 * (death.dir || 1);
      ty = cy + from.height * 3.5 * (death.fly || -1);
    }
    const dx = tx - cx, dy = ty - cy;
    const dir = death.dir || 1;
    // shrink toward the little tray glyph so it seems to BECOME the trophy
    const endScale = Math.max(0.16, Math.min(0.4, (from.width ? 22 / from.width : 0.3)));
    const kf = [
      { transform: "translate(0px,0px) rotate(0deg) scale(1)", opacity: 1, offset: 0 },
      // knocked loose: a clear pop UP and a spin before it's flung off
      { transform: `translate(${dx * 0.1}px, ${dy * 0.1 - from.height * 0.62}px) rotate(${dir * 82}deg) scale(1.16)`, opacity: 1, offset: 0.24 },
      { transform: `translate(${dx * 0.58}px, ${dy * 0.48}px) rotate(${dir * 330}deg) scale(.66)`, opacity: 0.92, offset: 0.62 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${dir * 580}deg) scale(${endScale})`, opacity: 0, offset: 1 },
    ];
    // fill "both": BEFORE the delay elapses the first frame holds the victim in
    // place (visible on its square) while the attacker glides in; then it flies.
    const player = el.animate(kf, { duration: 1200, delay: death.holdMs || 0, easing: "cubic-bezier(.34,.06,.6,1)", fill: "both" });
    return () => { try { player.cancel(); } catch {} };
  }, [death.id]); // eslint-disable-line
  return <div ref={ref} style={{ position: "absolute", left: `${d.l}%`, top: `${d.t}%`,
    width: `${100 / W}%`, height: `${100 / H}%`, pointerEvents: "none", zIndex: 8,
    display: "grid", placeItems: "center", willChange: "transform, opacity" }}>
    {/* same lift/size/origin as the cell piece, so while it waits on its square
        it sits exactly where the real piece stood */}
    <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center",
      transform: `translateY(${death.lift || "-10%"})`, transformOrigin: "50% 72%",
      fontSize: death.font || "1.16em",
      filter: "drop-shadow(0 0.09em 0.13em rgba(0,0,0,.6))" }}>
      <PieceGlyph aufsBrett piece={death.piece} showLevel={false} pov={pov} artStyle={artStyle} />
    </div>
  </div>;
}

// Modern game-style HP: one segment per hit point (readable at a glance),
// falling back to a continuous bar when segments would get too tiny.


// hex -> rgba: with a texture underlay the squares go slightly translucent so
// the material (fine scratches, grain) whispers through — a breath, not a print.
const hexA = (hex, a, lift = 0) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.round(v + (255 - v) * lift);   // gently lift toward ivory
  return `rgba(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)},${a})`;
};

import mL0 from "../assets/marble-l0.webp"; import mL1 from "../assets/marble-l1.webp"; import mL2 from "../assets/marble-l2.webp";
import mL3 from "../assets/marble-l3.webp"; import mL4 from "../assets/marble-l4.webp"; import mL5 from "../assets/marble-l5.webp";
import mD0 from "../assets/marble-d0.webp"; import mD1 from "../assets/marble-d1.webp"; import mD2 from "../assets/marble-d2.webp";
import mD3 from "../assets/marble-d3.webp"; import mD4 from "../assets/marble-d4.webp"; import mD5 from "../assets/marble-d5.webp";
import mG0 from "../assets/marble-g0.webp"; import mG1 from "../assets/marble-g1.webp"; import mG2 from "../assets/marble-g2.webp";
import mG3 from "../assets/marble-g3.webp"; import mG4 from "../assets/marble-g4.webp"; import mG5 from "../assets/marble-g5.webp";
// ── dark marble & gold: every square is a real slab cut from the reference
// image; a deterministic hash deals the variants so no two boards feel cloned,
// yet the same match always shows the same stone. ──
const MARBLE_L = [mL0, mL1, mL2, mL3, mL4, mL5];
const MARBLE_D = [mD0, mD1, mD2, mD3, mD4, mD5];
const MARBLE_G = [mG0, mG1, mG2, mG3, mG4, mG5];   // vein glow, same crops as MARBLE_D
const slabIx = (i) => ((i * 2654435761) >>> 8) % 6;
const slab = (i, dark) => (dark ? MARBLE_D : MARBLE_L)[slabIx(i)];
const REDUCED = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── preload: every slab is fetched once BEFORE the board shows itself — tiles
// popping in one by one looked cheap. A small gold rune breathes while the
// stone is carried in, then the finished board fades up in one piece. ──
const BOARD_ART = [...MARBLE_L, ...MARBLE_D, ...MARBLE_G];
let artDone = false, artPromise = null;
export function preloadBoardArt() {
  if (artPromise) return artPromise;
  if (typeof Image === "undefined") { artDone = true; return (artPromise = Promise.resolve()); }
  artPromise = Promise.race([
    Promise.all(BOARD_ART.map((src) => new Promise((res) => {
      const im = new Image();
      im.onload = im.onerror = () => res();
      im.src = src;
    }))),
    new Promise((res) => setTimeout(res, 2500)), // never gate the game on a slow cache
  ]).then(() => { artDone = true; });
  return artPromise;
}
if (typeof window !== "undefined") preloadBoardArt(); // warm the stone while the menus are still open

/* v0.79: DIE EINE DAUERFORMEL. Der Klang eines Treffers gehoert in den Moment,
   in dem die Figur ANKOMMT - also braucht der GameScreen dieselbe Rechnung wie
   die Gleit-Animation hier. Eine Formel, zwei Nutzer, kein Auseinanderlaufen. */
export function zugDauerMs(lastMove, pov, hotseat, w) {
  if (!lastMove || lastMove.from == null || lastMove.to == null) return 0;
  const W = w || 8;
  const foe = !hotseat && lastMove.color !== pov;
  const fF = lastMove.from % W, fR = (lastMove.from / W) | 0;
  const tF = lastMove.to % W, tR = (lastMove.to / W) | 0;
  const dF = Math.abs(tF - fF), dR = Math.abs(tR - fR);
  const leaps = !lastMove.bounced && (lastMove.kind === "N" || !!(dF && dR && dF !== dR));
  return Math.round((leaps ? (foe ? 1.25 : 0.95) : (foe ? 0.9 : 0.52)) * 1000);
}

/* ── v1.31.0: WAS ANHAELT, BLEIBT SICHTBAR (Besitzer: "Dinge, die passieren und
   darstellbar sind, gerne grundsaetzlich mehr andeuten"). Am Feld:
     - ein SCHRECKFELD traegt einen violetten Dunst mit Kreuz, solange es zu ist;
     - eine VERGIFTETE Figur traegt links am Band einen gruenen Tropfen mit der
       Zahl, die sie je Zug verliert;
     - eine GEBLENDETE Figur traegt ein geschlossenes Auge.
   Der Geist ist bleich (PieceGlyph). Alles nur im HP-Gefecht. */
function Zustaende({ piece, feld, state, ruhig, en }) {
  const mc = state.moveCount || 0;
  const sf = state.schreckFelder && state.schreckFelder[feld];
  const schreck = sf && sf.bis >= mc;
  const gift = piece && piece.giftRunden > 0;
  const blind = piece && piece.blindBis != null && piece.blindBis >= mc;
  if (!schreck && !gift && !blind) return null;
  return <>
    {schreck && <span aria-label={en ? "Dread: foes may not enter" : "Schrecken: kein Gegner darf hierher"} style={{ position: "absolute", inset: "6%",
      borderRadius: "22%", pointerEvents: "none", zIndex: 1,
      background: "radial-gradient(circle, rgba(88,40,150,.55) 0%, rgba(40,16,70,.35) 60%, rgba(0,0,0,0) 100%)",
      display: "grid", placeItems: "center", color: "rgba(214,190,255,.75)", fontSize: "clamp(12px, 4vw, 26px)", fontWeight: 800,
      animation: ruhig ? undefined : "ggSchreckAtmet 1.8s ease-in-out infinite" }}>✕</span>}
    {gift && <span aria-label={en ? "Poisoned" : "Vergiftet"} style={{ position: "absolute", left: "3%", bottom: "5%", zIndex: 6, pointerEvents: "none",
      display: "grid", placeItems: "center", width: "clamp(12px, 3.4vw, 20px)", height: "clamp(15px, 4.2vw, 25px)" }}>
      <svg viewBox="0 0 20 25" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <path d="M10 1 C10 1 2 11 2 16 A8 8 0 0 0 18 16 C18 11 10 1 10 1 Z" fill="#3fae4a" stroke="#0e2b12" strokeWidth="1.4" />
        <path d="M6.5 15.5 A4 4 0 0 0 9 19.5" fill="none" stroke="rgba(220,255,210,.8)" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span style={{ position: "relative", marginTop: "30%", fontSize: "clamp(7px, 2vw, 11px)", fontWeight: 900, color: "#f2ffe9",
        textShadow: "0 1px 1px #000" }}>{piece.giftN}</span></span>}
    {blind && <span aria-label={en ? "Blinded: may not move" : "Geblendet: darf nicht ziehen"} style={{ position: "absolute", right: "1%", bottom: "3%",
      zIndex: 6, pointerEvents: "none", width: "clamp(18px, 5vw, 30px)", height: "clamp(18px, 5vw, 30px)", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(34,22,58,.95) 55%, rgba(34,22,58,.6) 100%)", border: "1.5px solid rgba(241,231,255,.8)",
      display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 24 16" width="72%" height="72%">
        <path d="M2 6 Q12 15 22 6" fill="none" stroke="#f1e7ff" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 9.5 L3.5 12.5 M9 11.3 L8.3 14.6 M15 11.3 L15.7 14.6 M19 9.5 L20.5 12.5" stroke="#f1e7ff" strokeWidth="1.5" strokeLinecap="round" />
      </svg></span>}
  </>;
}

export function BoardView({ lang = "de", state, onMove, interactive, lastMove, mattSeite = null, effekt = null, theme = null, maxPx = 520, animateFor = null, flip = false, fitBox = false, feld = null, feldDunkel = null, ruhig = false, pick = null, onPick = null, pov = "w", texture = null, ground = null, artStyle = "painted", showLevel = true, showCoords = false, pulse = 0.4, friendly = false, knownKinds = null, seerVision = false, onEnemyTap = null, introSpot = null, onInspect = null, hotseat = false, setzFelder = null, onSetz = null }) {
  const sqL0 = theme?.sqLight || T.sqLight, sqD0 = theme?.sqDark || T.sqDark;
  // a GROUND painting beneath the field: the squares open further so meadow,
  // stream and path shimmer through — the land itself hosts the battle
  // With a painted GROUND the land itself is the board: squares become pure
  // light/dark veils (no theme colour, no stone) so the meadow stays the star,
  // and the existing bevel layers make each tile read as gently RAISED.
  //
  // TWO LAWS, ONE FOR EACH LIVERY.
  // CLASSIC keeps the organic breath it was designed with: each veil is a
  // radial breath, strong at the heart of the square and fading toward the
  // seams so neighbouring tiles melt into one another over the land.
  // CARVED does the opposite, on purpose. Its grounds carry far more of their
  // own contrast, and a veil that fades out at the seam left the board
  // unreadable — the chess squares dissolved into the texture. So the carved
  // veil covers the WHOLE square evenly and meets its neighbour at a real
  // edge; a hairline seam (dark outside, one light catch inside) then draws
  // the grid the way a carved board would actually part. The ground still
  // shows through — it is calmer art now (tools/calm-grounds.py) — so the
  // squares stay clearly separated without losing the carved surface.
  const carvedBoard = ground && livery() === "carved";
  const sqL = carvedBoard
    ? "rgba(255,255,255,.24)"
    : ground
    ? "radial-gradient(circle at 50% 50%, rgba(255,255,255,.27) 0%, rgba(255,255,255,.20) 52%, rgba(255,255,255,.06) 96%)"
    : texture ? hexA(sqL0, 0.82, 0.34) : sqL0;
  const sqD = carvedBoard
    ? "rgba(0,0,0,.34)"
    : ground
    ? "radial-gradient(circle at 50% 50%, rgba(0,0,0,.37) 0%, rgba(0,0,0,.29) 52%, rgba(0,0,0,.09) 96%)"
    : texture ? hexA(sqD0, 0.84, 0.07) : sqD0;
  const [sel, setSel] = useState(null);
  const [spy, setSpy] = useState(null);        // seer's gaze: an ENEMY square under inspection
  useEffect(() => { setSel(null); setSpy(null); }, [state]); // clear selection whenever the position changes
  useEffect(() => { // the inspect sheet mirrors whatever is currently chosen
    if (!onInspect) return;
    if (sel != null && state.board[sel]) onInspect({ i: sel, mode: "own" });
    else if (spy != null && state.board[spy]) onInspect({ i: spy, mode: "spy" });
    else onInspect(null);
  }, [sel, spy]);
  // WHO may be studied? Standard chessmen always (everyone knows how a rook
  // moves). Exotic foes only once you have MET them before (the codex,
  // knownKinds) — unless a seer with her first gift stands in your ranks
  // (seerVision), which reads even strangers.
  const STD_KINDS = new Set(["P", "N", "B", "R", "Q", "K"]);
  const codexKey = (p) => (p.bossId ? "X:" + p.bossId : p.kind);
  const spyAllowed = (p) => state.rules !== "hp" || STD_KINDS.has(p.kind) || seerVision || !!(knownKinds && knownKinds.has(codexKey(p)));

  // ── the board breathes as ONE: every now and then a golden wave rolls
  // across the dark slabs (never per-tile flicker). The interval is a skewed
  // draw from 2–60s — the stronger the foe (pulse 0..1), the more the draw
  // leans toward the short end; an endboss makes the stone restless. ──
  const [wave, setWave] = useState(null);
  useEffect(() => {
    if (REDUCED) return;
    let alive = true, tm = 0, off = 0;
    const loop = () => {
      const skew = 1 + pulse * 2.6;                       // 1 (uniform) … 3.6 (leans short)
      const iv = (2 + 58 * Math.pow(Math.random(), skew)) * 1000;
      tm = setTimeout(() => {
        if (!alive) return;
        const ang = Math.random() * Math.PI * 2;
        setWave({ id: Date.now(), dx: Math.cos(ang), dy: Math.sin(ang) });
        off = setTimeout(() => alive && setWave(null), 5200); // wave passed — drop the layers
        loop();
      }, iv);
    };
    loop();
    return () => { alive = false; clearTimeout(tm); clearTimeout(off); };
  }, [pulse]); // eslint-disable-line

  // all slabs loaded? until then every square shows its flat colour — the
  // marble layer fades in per square once the preload finishes
  const [artReady, setArtReady] = useState(artDone);
  useEffect(() => {
    if (artReady) return;
    let on = true;
    preloadBoardArt().then(() => { if (on) setArtReady(true); });
    return () => { on = false; };
  }, []); // eslint-disable-line

  // Integer-pixel sizing: fr-tracks round to different pixel widths per column
  // (tiles visibly unequal on some screens), so we measure the available box
  // and hand the grid EXACT pixel cells — every square identical, every time.
  const wrapRef = useRef(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => { const w = el.clientWidth, h = el.clientHeight; if (w > 0) setAvail({ w, h }); };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro?.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  // Move animation for BOTH armies. A ghost of the mover glides from→to, tilting
  // slightly into the direction of travel (like the wanderer on the map). Pieces
  // that LEAP (knights, and any move that isn't a straight line) hop in an arc.
  // On a KILL the fallen piece spins off toward its captor's tray (up top for a
  // foe I took, down low for a piece the foe took from me).
  const [anim, setAnim] = useState(null);
  const [death, setDeath] = useState(null);   // { at, piece, dir, fly, id }
  const animSeq = useRef(0);   // strictly-increasing id: two moves in the same
                               // millisecond must still get distinct keys, or
                               // React recycles the ghost div and it slides in
                               // from the PREVIOUS move's destination.
  // useIsoLayoutEffect: the ghost is armed BEFORE the browser paints, so the
  // real piece is never shown for a frame at its new square before the glide
  // starts (that was the "pops in at the wrong place" clip).
  useIsoLayoutEffect(() => {
    if (!lastMove || lastMove.from === lastMove.to) { setAnim(null); return; }
    // hotseat animates both; otherwise only the side we're told to animate
    if (animateFor && lastMove.color !== animateFor) { setAnim(null); return; }
    const piece = state.board[lastMove.to];
    if (!piece && !lastMove.bounced) { setAnim(null); return; }
    const glider = piece || { kind: lastMove.kind, color: lastMove.color };
    // is this the OPPONENT moving? A foe move (vs AI or online, not hotseat)
    // glides noticeably slower so the eye can clearly follow what it does.
    const foe = !hotseat && lastMove.color !== pov;
    // does this move LEAP? knights always; otherwise any non-straight, non-
    // diagonal hop over distance (a piece that doesn't travel in a line).
    const fF = lastMove.from % W, fR = (lastMove.from / W) | 0;
    const tF = lastMove.to % W, tR = (lastMove.to / W) | 0;
    const dF = Math.abs(tF - fF), dR = Math.abs(tR - fR);
    const leaps = !lastMove.bounced && (glider.kind === "N" || !!(dF && dR && dF !== dR));
    // leaps read slower AND higher — a real jump takes its time in the air.
    // own leap a touch longer than before so the hop feels complete (the foe's
    // is already well-paced), plain glides quick.
    const durS = zugDauerMs(lastMove, pov, hotseat, W) / 1000;
    const animId = ++animSeq.current;
    const a = { from: lastMove.from, to: lastMove.to, piece: glider, phase: 0,
      bounced: !!lastMove.bounced, foe, leaps, dur: durS, id: animId };
    setAnim(a);
    // a struck piece is hurled off toward its captor's tray. It fires on ANY
    // capture — in chess rules a taken piece has capture=true but lethal=false
    // (lethal is the HP-mode "dropped to 0" flag), so keying off lethal alone
    // meant the flight never played in normal games. Never on a blocked hit.
    if ((lastMove.capture || lastMove.lethal) && lastMove.hitKind && !lastMove.bounced) {
      const iWon = lastMove.color === pov;            // did MY side make this capture?
      setDeath({ at: lastMove.to, id: a.id + 100000,
        piece: { kind: lastMove.hitKind, color: lastMove.hitColor || (lastMove.color === "w" ? "b" : "w") },
        dir: (lastMove.color === "w" ? 1 : -1) * (pov === "w" ? 1 : -1),
        // hold the victim in place until the attacker actually arrives, THEN
        // fling it — so you read the strike, not a piece leaving early.
        holdMs: Math.round(durS * 1000),
        lift: pieceLift, font: pieceFont(lastMove.hitKind),
        fly: iWon ? -1 : 1 });   // -1 up (foe's tray up top), +1 down (my tray below)
    }
    // arm the glide: phase 0 paints the ghost at FROM, then the next frame(s)
    // (Riss-Sterne: siehe eigener Effekt unter diesem Block)
    // flip to phase 1 so the CSS transition carries it to TO. A double rAF plus
    // a tiny timeout guarantees the FROM frame is painted first on every device
    // — without it the ghost can appear straight at TO (the "clip onto my
    // piece" glitch).
    let raf2 = 0;
    const raf = requestAnimationFrame(() => { raf2 = requestAnimationFrame(() => {
      setAnim((cur) => (cur && cur.id === a.id ? { ...cur, phase: 1 } : cur));
    }); });
    // the HANDOFF: the instant the glide lands (lean settled to 0, shadow gone)
    // the ghost's final frame equals the real piece exactly — swap right then,
    // in one commit, so nothing blinks. The trail svg lingers a bit longer.
    const tDone = setTimeout(() => {
      setAnim((cur) => (cur && cur.id === a.id ? { ...cur, phase: 2 } : cur));
    }, durS * 1000 + 90);
    const hold = Math.max(durS * 1000 + 650, 1150);   // trail fade-out cover
    const t = setTimeout(() => { setAnim((cur) => (cur && cur.id === a.id ? null : cur)); }, hold);
    // the death flight = hold (until the attacker lands) + 1.2s flight; never cut short
    const tDeath = setTimeout(() => { setDeath((cur) => (cur && cur.id === a.id + 100000 ? null : cur)); }, durS * 1000 + 1500);
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(raf2); clearTimeout(tDone); clearTimeout(t); clearTimeout(tDeath); };
  }, [lastMove, animateFor, hotseat, pov]); // eslint-disable-line

  /* ── v0.80 (Besitzer): DIE RISS-STERNE. Ein Fernangriff braucht ein BILD:
     auf jedem getroffenen Feld birst ein leuchtender violetter Stern auf und
     GLIMMT NACH, damit man auch einen Wimpernschlag spaeter noch sieht, wo
     der Schlag sass. Dasselbe Zeichen tragen die Felder der SCHOCKWELLE -
     dort gestaffelt NACH der Ankunft des Schlaegers (zugDauerMs), beim
     Schuss mit dem Pfeil-Einschlag (160 ms). */
  const [sterne, setSterne] = useState(null);
  useEffect(() => {
    const lm = lastMove;
    if (!lm) { setSterne(null); return; }
    const treffer = [];
    if (lm.special === "shot" && (lm.damaged || lm.capture || lm.lethal))
      treffer.push({ at: lm.to, delay: 160 });
    if (Array.isArray(state.welle) && state.welle.length) {
      const basis = zugDauerMs(lm, pov, hotseat, state.w || FILES) + 60;
      for (const e of state.welle) treffer.push({ at: e.at, delay: basis });
    }
    if (!treffer.length) { setSterne(null); return; }
    setSterne({ id: Date.now(), list: treffer });
    const t = setTimeout(() => setSterne(null),
      Math.max(...treffer.map((e) => e.delay)) + 2600);
    return () => clearTimeout(t);
  }, [lastMove]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── v1.30.0: DIE MONSTERFAEHIGKEITEN SICHTBAR MACHEN. Der Kern merkt sich
     am Zug, wo Steinhaut einen Treffer abprallen liess (state.steinhaut), wo
     ein Unsterblicher wieder aufstand (state.aufstand) und was der Widerhall
     dem Angreifer zurueckgab (state.widerhall). Ohne Zeichen saehe ein
     abgeprallter Treffer aus wie ein Fehler - also steht ueber dem Feld kurz,
     was geschah, im Zeichen der Faehigkeit. */
  const [zeichen, setZeichen] = useState(null);
  useEffect(() => {
    const lm = lastMove;
    if (!lm) { setZeichen(null); return; }
    const en = lang === "en";
    const basis = zugDauerMs(lm, pov, hotseat, state.w || FILES) + 40;
    const list = [];
    if (state.steinhaut != null) list.push({ at: state.steinhaut, text: "⬢ " + (en ? "glances off" : "prallt ab"), farbe: "#c9d4e2", delay: basis });
    if (state.aufstand != null) list.push({ at: state.aufstand, text: "✦ " + (en ? "rises again" : "steht wieder auf"), farbe: "#f3dd8e", delay: basis + 180 });
    if (state.widerhall && state.widerhall.at >= 0) list.push({ at: state.widerhall.at, text: "↺ −" + state.widerhall.dmg, farbe: "#ffb3aa", delay: basis + 240 });
    /* v1.31.0: die fuenf uebrigen */
    for (const at of state.vergiftet || []) list.push({ at, text: "☠ " + (en ? "poisoned" : "vergiftet"), farbe: "#9be08a", delay: basis + 120 });
    for (const at of state.giftWirkt || []) {
      const q = state.board[at];
      /* der Tick hat schon gewirkt - giftN kann danach 0 sein (letzte Runde);
         die Zahl steht dann aus dem Unterschied im Leben nicht fest, also nur das Zeichen */
      list.push({ at, text: q && q.giftN ? "☠ −" + q.giftN : "☠", farbe: "#9be08a", delay: 260 });
    }
    for (const a of state.aderlass || []) list.push({ at: a.at, text: "−" + a.weg + (en ? " max" : " Höchstleben"), farbe: "#e58a8a", delay: basis + 200 });
    if (state.blenden) for (const at of state.blenden.felder) list.push({ at, text: "◉ " + (en ? "blinded" : "geblendet"), farbe: "#f1e7ff", delay: basis + 80 });
    if (state.geistFeld != null) list.push({ at: state.geistFeld, text: "☾ " + (en ? "returns as a ghost" : "kehrt als Geist zurück"), farbe: "#dbe7ff", delay: basis + 180 });
    const sf = state.schreckFelder && lm.from != null ? state.schreckFelder[lm.from] : null;
    if (sf && sf.farbe === lm.color && sf.bis >= (state.moveCount || 0)) list.push({ at: lm.from, text: "✕ " + (en ? "dread" : "Schrecken"), farbe: "#c9a6ff", delay: 120 });
    if (!list.length) { setZeichen(null); return; }
    setZeichen({ id: Date.now(), list });
    const t = setTimeout(() => setZeichen(null), Math.max(...list.map((e) => e.delay)) + 1900);
    return () => clearTimeout(t);
  }, [lastMove]); // eslint-disable-line react-hooks/exhaustive-deps

  const W = state.w ?? FILES, H = state.h ?? RANKS;
  const holes = state.holes; // Set of blocked indices (or undefined)
  const hpMode = state.rules === "hp";

  /* ── ZAUBER ERST AUF WUNSCH (Besitzer, 4.9.2026): "Ich moechte die
     Faehigkeiten nicht am Anfang alle verbrauchen, sondern sie vielleicht
     erst spaeter einsetzen duerfen." Bisher lagen ALLE Zauber-Ziele zwischen
     den normalen Zuegen - wer den Gambit anfasste, sah ein Dutzend Felder,
     und ein Fingertipp aufs falsche verbrannte den einen Zauber der Partie.
     Jetzt zeigt das Brett nur normale und dauerhafte Zuege; ein Zauber
     erscheint erst, wenn sein Chip im Talentband angetippt ist. */
  const [scharf, setScharf] = useState(null);   // id des scharfgeschalteten Zaubers
  useEffect(() => { setScharf(null); }, [sel]);  // Auswahlwechsel entschaerft
  const targets = useMemo(() => {
    const m = new Map();
    if (sel != null) for (const mv of legalMovesFrom(state, sel)) {
      if (mv.consumes && mv.consumes !== scharf) continue;   // Zauber ruhen, bis gewaehlt
      m.set(mv.to, mv);
    }
    return m;
  }, [sel, state, scharf]);
  const spyTargets = useMemo(() => {
    const m = new Set();
    if (spy != null && state.board[spy]) {
      try { for (const mv of legalMovesFrom({ ...state, turn: state.board[spy].color }, spy)) m.add(mv.to); } catch {}
    }
    return m;
  }, [spy, state]);

  const checkSq = useMemo(() => {
    const k = findKing(state.board, state.turn, W);
    return k && inCheck(state, state.turn) ? k.i : -1;
  }, [state]);

  /* v1.0.63: DAS SETZEN DER SPERREN. Vor dem ersten Zug leuchten die
     erlaubten Felder (dritte und vierte eigene Reihe) - ein Tipp setzt, ein
     Tipp auf die eigene Sperre nimmt sie wieder auf. Die Menge kommt fertig
     vom Kampfschirm; das Brett kennt die REGEL nicht, nur die Felder. */
  const setzSet = useMemo(() => new Set(setzFelder || []), [setzFelder]);

  function tap(i) {
    /* Der Setzmodus liegt VOR der Zugsperre: waehrend gesetzt wird, ist noch
       niemand am Zug, das Brett also bewusst nicht "interactive". */
    if (onSetz && (setzSet.has(i) || (setzFelder && state?.sperren?.[i]))) { onSetz(i); return; }
    if (!interactive) return;
    // A selected dragon moving one square forward lands on a square its own 2x2
    // block currently covers (a wing marker). That target must WIN over the
    // "tap a wing = tap the dragon" redirect, or he can never step forward.
    if (sel != null && targets.has(i)) { onMove(targets.get(i)); setSel(null); return; }
    const w0 = state.board[i];
    if (w0 && w0.kind === "D+") i = w0.ref;        // a wing tap is a dragon tap
    if (pick && onPick) { const pc = state.board[i]; if (pc && pc.color === pick) onPick(i); return; }
    if (sel != null && targets.has(i)) { onMove(targets.get(i)); setSel(null); return; }
    const piece = state.board[i];
    if (piece && piece.color === state.turn) { klang("wahl"); setSel(i === sel ? null : i); setSpy(null); }
    else if (piece) {
      if (onEnemyTap) onEnemyTap(i, spyAllowed(piece));      // the hall notices your curiosity (first-meet tales)
      if (spyAllowed(piece)) setSpy(i === spy ? null : i);   // known or seen-through: study its moves
      else setSpy(null);                                     // a stranger keeps its secrets — this time
      setSel(null);
    }
    else { setSel(null); setSpy(null); }
  }

  // ── Shared piece-in-cell geometry ──────────────────────────────────────────
  // The ANIMATED overlay reuses these EXACT values, so the gliding/leaping piece
  // is pixel-identical to the one that finally stands in the cell: same lift,
  // same size, same transform-origin. Previously the ghost sat centred and a
  // size smaller, so on landing the piece visibly jumped up and grew — that was
  // the "drifts too far, then snaps into place" glitch. One source of truth now.
  const bigScreen = typeof innerWidth !== "undefined" && innerWidth >= 640;
  /* v1.0.35 (Besitzer): "alle sitzen sehr weit unten am Rand - minimal
     vertikal eher in die Mitte". Nachgemessen im laufenden Brett: die Figur
     steht mit dem Fuss auf der Feldkante und waechst nach OBEN aus dem Feld
     heraus (der Turm um 75 % der Feldhoehe) - das ist gewollt, denn eine
     Figur STEHT auf ihrem Feld. Sie hing dabei aber zu tief; vier Prozent
     mehr Hub ruecken sie zur Mitte, ohne dass der Fuss den Bezug zum Feld
     verliert. */
  const pieceLift = artStyle === "svg" ? "-4%" : bigScreen ? "-14%" : "-17%";
  /* v1.0.9 (Besitzer): "alle Figuren bitte wieder groesser" - der
     Brett-Umbau hatte sie optisch schrumpfen lassen. +9 % auf beide Stile
     und beide Klassen; gilt fuers Gefecht UND das klassische Schach, denn
     beide zeichnen durch dieses Blatt. */
  /* v1.0.35: "alle Figuren koennten noch etwas groesser sein" - rund 9 %
     drauf, auf beide Stile und beide Klassen. */
  const pieceFont = (kind) => artStyle === "svg"
    ? (kind === "P" ? "1.00em" : "1.19em")
    : (kind === "P" ? "1.17em" : "1.37em");
  const PIECE_ORIGIN = "50% 72%";

  const cells = [];
  for (let rr = 0; rr < H; rr++) {
    const r = flip ? rr : H - 1 - rr;
    for (let ff = 0; ff < W; ff++) {
      const f = flip ? W - 1 - ff : ff;
      const i = idx(f, r, W);
      if (holes && holes.has(i)) { // carved-out void: not part of the play area
        cells.push(<div key={i} style={{ background: "#07090d", boxShadow: "inset 0 1px 6px rgba(0,0,0,.8)" }} />);
        continue;
      }
      let piece = state.board[i];
      const isWing = piece && piece.kind === "D+";
      const isBigAnchor = piece && piece.big && piece.kind === "D";
      if (isWing || isBigAnchor) piece = null;     // drawn by the 2x2 overlay instead
      const dark = (f + r) % 2 === 1;
      const tgt = targets.get(i);
      // whose moves are on show? your own piece, or a foe read by the seer
      const movingPiece = sel != null ? state.board[sel] : null;
      const metal = MOVE_METAL[movingPiece && movingPiece.color !== pov ? "steel" : "gold"];
      const isSel = sel === i;
      const isSpy = spy === i;
      const spyT = spyTargets.has(i);
      const isLast = lastMove && (lastMove.from === i || lastMove.to === i);
      const isHit = hpMode && lastMove && lastMove.to === i && (lastMove.damaged || lastMove.lethal);
      // Tiny coordinates on the rim squares (a–j / 1–10), chess-board style:
      // file letters along the bottom edge, rank numbers along the left edge.
      const coordCol = ground ? (dark ? "rgba(255,247,222,.92)" : "rgba(24,17,7,.88)") : (dark ? sqL : sqD);
      const fileLbl = showCoords && rr === H - 1 ? "abcdefghij"[f] : null;
      const rankLbl = showCoords && ff === 0 ? String(r + 1) : null;
      /* v1.0.34 (Besitzer: "das Schachbrett zum Rand hin transparenter, mit
         Verlauf"): DIE RANDWEICHE SITZT IM FELD, NICHT UEBER IHM. Jedes Feld
         am Brettrand bekommt eine eigene Maske, die genau nach AUSSEN
         ausblendet - oben die oberste Reihe nach oben, links die linke Spalte
         nach links, an den Ecken beides. Weil die Maske am FELD haengt und
         nicht an einer Schicht darueber, bleiben die Figuren unberuehrt: ihre
         Koepfe ragen weiterhin ueber die Kante, ohne in einen Schleier zu
         laufen. Innen (ab 42 %) ist das Feld voll deckend, die Spielflaeche
         bleibt also lesbar. */
      /* v1.0.37 (Besitzer: "beim Anklicken einer Figur ruckelt es jetzt
         immer"): DIE MASKEN WAREN ES. In v1.0.34 bekam jedes der 28
         Randfelder eine eigene CSS-Maske, an den Ecken sogar zwei
         uebereinander. Genau davor hatte ich in v1.0.25 selbst gewarnt -
         Masken sind auf Telefon-Grafikkernen teuer, weil der Browser fuer
         jede eine eigene Ebene aufbaut und bei jedem Neuzeichnen neu
         zusammensetzt. Bei jeder Auswahl geschieht das 28-mal.
         Ein FARBVERLAUF leistet hier dasselbe und kostet fast nichts: der
         Feldton laeuft nach aussen in die Nacht, statt dass eine Maske ihn
         wegschneidet. Sichtbar ist der Unterschied nicht - messbar schon. */
      /* v1.0.48 (Besitzerbefund): DIE RANDWEICHE IST FORT. Sie lief auf den
         28 Randfeldern nach aussen in die Nacht - und weil sie AM FELD hing,
         endete sie an der Brettkante. Genau dort entstand die sichtbare
         Stufe: innerhalb des Bretts abgedunkelt, direkt daneben der volle,
         hellere Hintergrund. Ein Verlauf, der nur bis zur Kante reicht, macht
         die Kante sichtbarer statt weicher.
         Ersetzt durch einen Schatten NACH AUSSEN am ganzen Brett (siehe
         brettSchatten weiter unten): das Brett liegt jetzt sichtbar ueber dem
         Hintergrund, statt in ihn hineinzulaufen. Ein Schatten am Rahmen
         statt 28 Verlaeufe an Feldern ist ausserdem billiger. */
      const randVerlauf = null;
      /* v1.0.46: was auf DIESEM Feld an Sperre steht. Aus dem Zustand gelesen,
         nicht gehalten - so kann sie nicht veralten. */
      const sperreHier = state?.sperren ? state.sperren[i] : null;
      cells.push(
        <div key={i} data-zelle={i} onClick={() => tap(i)} style={{ position: "relative",
          // the flat colour + a soft diagonal light stand INSTANTLY — no loading
          // state at all; the marble whisper fades in per square once every slab
          // is preloaded, so nothing ever pops
          /* Der Feldgrund liegt seit v1.0.34 in EIGENER Schicht (gleich
             darunter), damit die Randmaske ihn allein trifft - haenge sie an
             die Zelle, blendet sie die FIGUR gleich mit aus. */
          background: `${dark ? sqD : sqL}`,
          display: "grid", placeItems: "center", cursor: interactive ? "pointer" : "default" }}>
          {randVerlauf && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
            zIndex: 1, background: randVerlauf }} />}
          {/* ── v1.24.4 (Besitzer): DAS GEGNERFELD IST VIOLETT GETOENT ────────
              "Markiere einfach die Gegnerfelder ... vielleicht machst du es
               noch ein bisschen sanfter und nicht die Kontur, sondern wirklich
               nur die Faerbung des Schachfeldes mit dem Lila. Und wenn man
               dann die Figur anwaehlen wuerde, wuerde die Kontur kommen."
              Also nur eine Toenung, kein Rahmen - die Kontur bleibt dem
              Anwaehlen vorbehalten und hebt sich dadurch deutlich ab. Die
              Gemaelde bleiben unangetastet: wer wem gehoert, sagt das Feld. */}
          {piece && piece.color !== pov && <div aria-hidden data-gegnerfeld="" style={{ position: "absolute", inset: 0,
            pointerEvents: "none", zIndex: 1,
            /* v1.24.5 (Besitzer): "der Farbton Lila ist viel zu wenig, man sieht ja gar
               nichts" - die Toenung lag bei .34 im Kern und wurde durch
               mixBlendMode screen zusaetzlich verduennt. Jetzt kraeftig und
               ohne Mischmodus, aber weiterhin OHNE Kontur. */
            /* v1.24.5b (Besitzer): "etwas zu stark, aber gerne mit minimalem Verlauf
               zum Schachbrettfeld" - also schwaecher und zu den Raendern hin
               auslaufend, damit das Feld darunter noch durchkommt. */
            /* v1.25.8 (Besitzer): "bitte Lila noch mit einem Verlauf ausstatten
               mit harter Kante ins Schwarze am Rand von dem Feld." Also innen
               ein weicher Verlauf, aussen ein klarer Schnitt an der Feldkante
               statt des Auslaufens ins Nichts. */
            background: "radial-gradient(104% 104% at 50% 44%, rgba(150,104,250,.50) 0%, rgba(116,58,220,.38) 58%, rgba(74,34,146,.30) 92%, rgba(28,12,58,.34) 100%)",
            boxShadow: "inset 0 0 0 1px rgba(16,6,34,.55)" }} />}
          {(feld || !ground) && (() => {
            // DIE FELDER DES BESITZERS (v0.66) SIEGEN AUCH UEBER DEM BODEN:
            // seine Kacheln SIND die Felder - der gemalte Grund weicht. liegt ein Kapitel-Streifen an,
            // schneidet sich jede Zelle ihr Fenster aus der richtigen Haelfte
            // (links hell, rechts dunkel) - Hash haelt das Fenster je Zelle
            // fest, der Schleier darueber ist DUENNER als beim Marmor, damit
            // die Malerei traegt. Die Finale-Kachel (feldDunkel) ist ein
            // GANZES Bild und ersetzt nur die dunklen Felder.
            if (feld) {
              // v0.71.2 (Besitzer): KEINE Hash-Fenster mehr - jedes Feld zeigt
              // seine GANZE Kachel, unbeschnitten: helle Haelfte links (0 %),
              // dunkle rechts (100 %), senkrecht mittig. Die Finale-Kachel
              // deckt als Ganzbild.
              const finale = dark && feldDunkel;
              const quelle = finale ? feldDunkel : feld;
              // v0.71.3 (Besitzer: "noch etwas groesser"): sanft hinein - die
              // Kachel fuellt mehr, ihr Eigenrand bleibt als feine Kante.
              // 215 %-Breite, mittig auf der jeweiligen Haelfte verankert.
              // v0.71.4: zurueck zur GANZEN Kachel - der Eigenrand ist dem
              // Besitzer "megageil" und bleibt KOMPLETT drin.
              const groesse = finale ? "cover" : "200% auto";
              const px = finale ? 50 : dark ? 100 : 0;
              const fy = 0.5;
              // ROHDATEN ANEINANDER (Besitzer, v0.67.1): kein Schleier,
              // keine Fase, keine Fuge - die Kacheln stehen Kante an Kante,
              // genau wie geliefert. Nur Freundschaftskaempfe dimmen leicht.
              return <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
                background: `url(${quelle}) ${px}% ${fy * 100}% / ${groesse} no-repeat`,
                opacity: friendly ? 0.55 : 1 }} />;
            }
            if (ground) return null;
            return <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
              background: `linear-gradient(${hexA(dark ? sqD0 : sqL0, dark ? 0.8 : 0.78, friendly ? 0.26 : 0.12)}, ${hexA(dark ? sqD0 : sqL0, dark ? 0.8 : 0.78, friendly ? 0.26 : 0.12)}), url(${slab(i, dark)}) center / cover`,
              /* v1.0.30: Die Felder bleiben VOLL DECKEND. Ein Versuch mit 0.92
                 liess den Grundverlauf durch die Platten schlagen - statt
                 eines Hauchs Landschaft kam ein flaues Rautenmuster heraus.
                 Am Bild gemessen: deutlich schlechter, also zurueckgenommen. */
              /* v1.0.34 (Besitzer: "die Animation am Anfang kann deutlich
                 langsamer sein, dass man auch noch ein bisschen den
                 Hintergrund sieht - und dann kommt das Schachbrett ganz
                 langsam"): 0,6 s waren zu hastig; das Brett stand da, ehe das
                 Auge das Land gesehen hatte, und der Aufbau aller 64 Felder
                 in derselben halben Sekunde war zugleich die Stelle, an der
                 es stockte. Jetzt 1,8 s mit einer halben Sekunde Vorlauf -
                 langsamer heisst hier auch RUHIGER, weil sich die Last ueber
                 mehr Bilder verteilt. */
              /* v1.0.37: die 1,8-s-Blende sass auf JEDEM der 64 Felder - also
                 64 gleichzeitig laufende Uebergaenge, die der Browser einzeln
                 verwaltet. Genau das war das Ruckeln beim Partiestart. Der
                 Uebergang wandert an den Brett-Rahmen (EINE Blende fuer alles,
                 weiter unten); hier bleibt nur noch der Endzustand. */
              opacity: artReady ? (friendly ? 0.4 : 1) : 0 }} />;
          })()}
          {!ground && !feld && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: "inset 2px 2px 0 rgba(255,246,220,.12), inset 6px 6px 7px -5px rgba(255,250,230,.28), inset -2px -2px 0 rgba(0,0,0,.32)" }} />}
          {!ground && !feld && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: "inset 1.5px 1.5px 0 rgba(255,238,200,.14), inset -2px -2px 3px rgba(0,0,0,.42)" }} />}
          {ground && !feld && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
            boxShadow: carvedBoard
              // the parting line: every square owns a real edge again
              ? "inset 0 0 0 1px rgba(10,14,24,.52), inset 1.5px 1.5px 0 rgba(255,248,226,.18), inset -3px -3px 8px -3px rgba(0,0,0,.30)"
              : "inset 4px 4px 10px -4px rgba(255,252,236,.14), inset -4px -4px 10px -4px rgba(0,0,0,.18)" }} />}

          {fileLbl && <span style={{ position: "absolute", right: "5%", bottom: "1%", fontSize: "0.22em", fontWeight: 800,
            color: "#f0d68a", textShadow: "0 0 4px rgba(240,214,138,.55), 0 1px 1px rgba(0,0,0,.9)",
            opacity: 0.95, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>{fileLbl}</span>}
          {rankLbl && <span style={{ position: "absolute", left: "5%", top: "4%", fontSize: "0.22em", fontWeight: 800,
            color: "#f0d68a", textShadow: "0 0 4px rgba(240,214,138,.55), 0 1px 1px rgba(0,0,0,.9)",
            opacity: 0.95, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>{rankLbl}</span>}
          {/* v1.1.14 (Besitzeridee): DIE SPUR SAGT, WER ZOG UND WAS ER TAT.
              "Wenn ich einen Zug ziehe, so leicht gelblich darstellen, beim
              Gegner immer so leicht lila. Und wenn eine Faehigkeit kommt, dann
              die Farbe, was es fuer eine Faehigkeit war - auch angedeutet in
              dem Schweif, den man noch sieht."

              Bisher lag ueber jedem letzten Zug dieselbe goldene Spur, egal ob
              ich zog oder der Gegner, egal ob ein Talent wirkte. Jetzt drei
              Auskuenfte in einer Farbe: GOLD fuer meine Zuege, RISS-VIOLETT
              fuer die des Gegners - und wenn der Zug ein Talent verbraucht
              hat, dessen ARTFARBE aus der Chronik (Bewegung blau, Fernkampf
              orange, Sprung violett, Zaehigkeit gruen ...), dieselbe, die der
              Chip im Talentband traegt. So erkennt man am Brett, was eben
              geschah, ohne die Meldung gelesen zu haben. */}
          {isLast && (() => {
            const talent = lastMove.consumes ? ABILITIES[lastMove.consumes] : null;
            const tg = talent && TAGS[talent.tag];
            const zogIch = lastMove.color ? lastMove.color === pov : true;
            const ton = tg ? tg.color : zogIch ? T.gold : "#a78bfa";
            return <>
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
                background: i === lastMove.to
                  ? `radial-gradient(circle at 50% 52%, ${ton}59, ${ton}14 68%, transparent 78%)`
                  : `radial-gradient(circle at 50% 52%, ${ton}3d, transparent 66%)` }} />
              {i === lastMove.to && <div style={{ position: "absolute", inset: 0,
                boxShadow: `inset 0 0 0 2px ${ton}cc`, pointerEvents: "none" }} />}
            </>;
          })()}
          {isHit && <div key={`hit${lastMove.from}-${lastMove.to}`} style={{ position: "absolute", inset: 0, background: T.danger, animation: "hit .45s ease-out forwards" }} />}
          {isSel && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 3px ${T.gold}`, background: `${T.gold}14` }} />}
          {isSpy && <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 3px #a78bfa", background: "rgba(167,139,250,.1)" }} />}
          {introSpot && introSpot.has(i) && piece && <div style={{ position: "absolute", inset: "4%", borderRadius: 8,
            pointerEvents: "none", animation: "ggNewPulse 1.15s ease-in-out infinite" }} />}
          {/* v1.0.92 (Besitzer: "genau diese Faerbung wuensche ich mir auch
              beim Gegner, anstelle dieser Bubbles"): die Gegnerziele tragen
              jetzt dieselbe Feldfaerbung wie die eigenen - nur in Riss-Violett
              statt Gold, damit man auf einen Blick weiss, WESSEN Reichweite
              man sieht. Die Perle ist fort; sie sass mitten im Feld und
              verdeckte die Figur darunter. */}
          {spyT && <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,.46) 0%, rgba(167,139,250,.30) 62%, rgba(167,139,250,.14) 100%)",
            boxShadow: "inset 0 0 0 2.5px rgba(196,181,253,.85), 0 0 10px rgba(167,139,250,.26)",
            animation: ruhig ? "none" : `ggZielAtem 2.6s ease-in-out ${((i * 37) % 9) * 0.12}s infinite` }} />}
          {checkSq === i && <div style={{ position: "absolute", inset: "8%", borderRadius: 6, animation: "glow 1.1s infinite" }} />}
          {/* v1.0.67: SCHACHPULS (Besitzer: man uebersieht das Schach). Ein
              roter Saum pulst unter dem bedrohten Koenig - transform+opacity,
              zusaetzlich zum stillen glow, der als Fallback bleibt. */}
          {checkSq === i && animAn() && <div aria-hidden style={{ position: "absolute", inset: "4%",
            borderRadius: 8, border: "2.5px solid rgba(255,92,92,.9)", pointerEvents: "none",
            animation: "ggSchachPuls 1.05s ease-in-out infinite" }} />}
          {piece && <div style={{ opacity: anim && anim.phase < 2 && i === anim.to ? 0 : 1, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none",
            transform: `translateY(${pieceLift})` + ((isSel || isSpy) && !piece.big ? (artStyle === "svg" ? " scale(1.4)" : " scale(1.58)") : ""),
            /* v1.0.67: KOENIGSFALL. Beim Matt kippt der geschlagene Koenig
               langsam um seinen Fuss zur Seite, statt einfach hinter dem
               Banner zu verschwinden - das Banner ist durchscheinend, der
               Fall bleibt sichtbar. Nur dieser eine Koenig, nur einmal. */
            ...(animAn() && mattSeite && piece.kind === "K" && piece.color === mattSeite
              ? { animation: "ggKoenigFall 1.8s cubic-bezier(.5,.02,.72,.6) .35s forwards", transformOrigin: "50% 94%", zIndex: 30 }
              : { transformOrigin: PIECE_ORIGIN }),
            // MEASURED, then nailed: this layer's 1em box lives in the piece font
            // (court 1.16em), so it grew WIDER than the square and sat flush to
            // its LEFT edge — every court figure drifted (em-cell)/2 = ~4-5px
            // right while the slimmer pawns stayed true. Pinning the layer to
            // the square (inset 0) makes the flex centre the overflow evenly.
            position: "absolute", inset: 0,
            // v0.71.13 (Besitzer): steht ein Dialog offen, faellt die Auswahl
            // in die Reihe zurueck - sonst ragten Figur UND Kugeln darueber.
            zIndex: (!ruhig && (isSel || isSpy)) ? 40 : rr + 3, // selection floats above ALL rows so its value orbs stay readable; otherwise row-by-row layering
            fontSize: pieceFont(piece.kind),
            // a single combined transition: the settle (scale/lift) is quick, the
            // arriving piece fades in gently so it never "pops" after the glide
            /* v1.0.37: DER ERSTE VERDAECHTIGE FUERS KLICK-RUCKELN. Dieser
               Uebergang haengt an ALLEN 64 Zellen und laeuft genau dann, wenn
               man eine Figur antippt - Auswahl heisst Groesse und Hub aendern.
               Im Sparmodus schaltet er ab: die Auswahl sitzt dann sofort
               statt zu gleiten. */
            transition: gespart("uebergang") ? "none" : "transform .16s ease, opacity .18s ease, filter .45s ease",
            // EVERY FIGURE STANDS SHARP. The opening used to soften the whole
            // board for two seconds to spotlight an unknown foe — but since a
            // champion stands in the QUEEN'S square, the effect read as "only
            // the queen is in focus, everything else is out of focus". The
            // stranger still announces himself with the pulsing ring below.
            filter: gespart("schatten") ? "none" : "drop-shadow(0 0.06em 0.09em rgba(0,0,0,.5))",
            /* v1.0.37 (Besitzer: "beim Anklicken einer Figur ruckelt es jetzt
               immer"): DER SCHATTEN IST DER TEURE TEIL. Jede Figur traegt
               einen drop-shadow - ein echter Filter, den die Grafikeinheit
               rechnen muss. Solange nichts sich bewegt, kostet das einmal;
               waehrend die Auswahl auf 1,58 waechst, muesste er in JEDEM Bild
               neu berechnet werden. willChange sagt dem Browser vorher
               Bescheid, sodass er die Figur samt Schatten EINMAL auf eine
               eigene Ebene legt und danach nur noch verschiebt und skaliert.
               Bewusst NUR fuer die ausgewaehlte Figur: 32 Dauerebenen waeren
               auf schwachen Geraeten teurer als das Problem. */
            willChange: (!ruhig && (isSel || isSpy)) ? "transform" : "auto",
            /* v1.0.14: WER EINEN SCHLAG UEBERSTEHT, WACKELT. Nicht die Zelle,
               die FIGUR - und sie faellt nicht, sie fasst sich wieder. */
            ...(lastMove && lastMove.damaged && !lastMove.lethal && lastMove.to === i && !ruhig
              ? { animation: "ggShake .5s ease-in-out" } : {}) }}><PieceGlyph aufsBrett piece={{ ...piece, selected: isSel || isSpy, justMoved: !!lastMove && lastMove.to === i && !ruhig }} showLevel={showLevel} pov={pov} artStyle={artStyle} effekt={effekt && effekt.at === i ? effekt : null} /></div>}
          {/* v1.0.46: DIE SPERRE AUF DIESEM FELD. Die Regeln dazu gibt es seit
              v0.90, gezeichnet wurde sie nie - sperren.js hing allein an
              transitions.js. stadium() liefert genau die drei Worte, zu denen
              es Bilder gibt. Steht hier VOR der Figur, damit Truemmer unter
              ihr liegen; eine heile Mauer und eine Figur teilen sich ohnehin
              nie ein Feld, weil die Mauer den Zug aufhaelt. */}
          {sperreHier && <SperrGlyph art={sperreHier.art} zustand={stadium(sperreHier)} ruhig={ruhig} />}
          {hpMode && <Zustaende piece={piece} feld={i} state={state} ruhig={ruhig} en={lang === "en"} />}
          {/* v1.0.14 (Besitzer): DER SPRINGER LANDET HOERBAR SICHTBAR - ein
              heller Ring faehrt aus dem Feld, auf dem er aufsetzt. Nur fuer
              den Sprung, sonst wird jedes Ziehen zum Ereignis. */}
          {!ruhig && lastMove && lastMove.to === i && piece && piece.kind === "N" && (
            <span key={`ldg${lastMove.id || lastMove.to}`} aria-hidden style={{ position: "absolute",
              left: "50%", top: "72%", width: "58%", height: "24%", borderRadius: "50%",
              border: "1.5px solid rgba(240,214,138,.6)", pointerEvents: "none", zIndex: 5,
              animation: "ggAufprall .42s ease-out forwards" }} />
          )}
          {/* the value orbs live on the SQUARE, not on the piece: one fixed
              em-basis for every figure, so every strip is the same size and
              sits flush with the square's bottom edge — pawn, rook or queen */}
          {piece && !piece.big && piece.atk != null && piece.maxHp > 0 &&
            <div aria-hidden style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 0,
              display: "flex", justifyContent: "center", pointerEvents: "none",
              zIndex: (!ruhig && (isSel || isSpy)) ? 41 : rr + 4 }}>
              {/* v1.25.4 (Besitzer, mehrfach): "Die Bubbles Angriff und Leben
                  will ich nicht sehen - egal wo, die koennen raus." Auf dem
                  Brett sagt das SOCKELBAND seit v1.24.4 dasselbe, und zwar an
                  der Figur statt darueber: Rot ist das Leben in Punkten, Blau
                  die Staerke. Die Perlen waren die dritte Anzeige derselben
                  Zahl und verdeckten dabei die obere Reihe. */}
            </div>}
          {/* ── v1.0.74: DAS GANZE FELD ZEIGT DAS ZIEL ────────────────────
              Besitzerbefund: "es ist extrem stoerend, dass dieser Punkt
              manchmal von den Figuren verdeckt wird". Genau so ist es - der
              Punkt sass in der Feldmitte, und dort steht bei belegten
              Nachbarfeldern der Fuss der davorstehenden Figur. Jetzt faerbt
              sich das FELD: eine getoente Flaeche mit Innenkontur, die kein
              Figurenfuss verdecken kann, weil sie bis an die Feldkante geht.
              Sie liegt UNTER den Figuren (zIndex 1), damit sie nichts
              zudeckt, und atmet sehr ruhig (ggZielAtem, 2,4 s, nur opacity -
              kein Layout, kein Ruckeln).
              Zwei Toene wie im ganzen Haus: Gold fuer die eigene Seite,
              Riss-Violett, wenn man fremde Zuege liest (Seherin). Ein
              SCHLAG faerbt roeter und traegt zusaetzlich den Ring - der
              Unterschied zwischen "hier hin" und "den da" muss auf einen
              Blick lesbar bleiben. */}
          {tgt && (() => {
            const schlag = !!tgt.capture;
            const eigen = !(movingPiece && movingPiece.color !== pov);
            const ton = schlag ? "244,90,90" : eigen ? "233,207,138" : "168,124,255";
            return <>
              <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
                /* v1.0.76 (Besitzer: "noch zu schwach, man erkennt es fast
                   nicht"): Deckung glatt verdoppelt (.24 -> .52 in der Mitte)
                   und die Innenkontur auf 2,5 px bei voller Deckkraft. Auf
                   dem dunklen Brett traegt erst das. */
                background: `radial-gradient(ellipse at 50% 50%, rgba(${ton},${schlag ? .58 : .52}) 0%, rgba(${ton},${schlag ? .40 : .34}) 62%, rgba(${ton},.18) 100%)`,
                boxShadow: `inset 0 0 0 2.5px rgba(${ton},${schlag ? .95 : .88}), 0 0 10px rgba(${ton},.30)`,
                borderRadius: 3,
                animation: ruhig ? "none" : `ggZielAtem 2.6s ease-in-out ${((i * 37) % 9) * 0.12}s infinite` }} />
              {schlag && <div aria-hidden style={{ position: "absolute", inset: "7%", borderRadius: "50%",
                pointerEvents: "none", zIndex: 1, background: metal.ring,
                boxShadow: `0 0 9px ${metal.glow}, 0 1px 4px rgba(0,0,0,.5)` }} />}
              {tgt.special && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
                zIndex: 1, display: "grid", placeItems: "center", fontSize: "0.42em", color: "#f6e4a2",
                textShadow: "0 0 6px rgba(246,228,162,.9)" }}>✦</div>}
            </>;
          })()}
          {/* v1.0.63: EIN FREIES FELD FUER EINE SPERRE. Kein Zielpunkt aus
              Metall (der gehoert den Zuegen), sondern ein ruhig atmender
              Steinrahmen - man baut hier, man schlaegt nicht. */}
          {setzSet.has(i) && <div aria-hidden style={{ position: "absolute", inset: "6%", borderRadius: 4,
            pointerEvents: "none", boxShadow: "inset 0 0 0 2px rgba(214,203,178,.85), 0 0 10px rgba(214,203,178,.28)",
            background: "rgba(214,203,178,.12)",
            animation: ruhig ? "none" : "ggSetzPuls 1.6s ease-in-out infinite" }} />}
        </div>
      );
    }
  }

  // Integer cell size from the measured box — SSR / first paint fall back to a
  // fluid grid; the client snaps to exact pixels right after mount, so every
  // tile is the same size on every screen (no fr-track rounding drift).
  const GAP0 = 2; // dark seams between the slabs — the board reads as separate stone plates
  // v0.71.4: EIN effektiver Gap fuer ALLES (Besitzer-Fund: bei gap 0 unter
  // seinen Feldern rechnete bw/bh weiter mit Fuge - der Rahmenkasten war
  // 14 px zu gross [schwarzer Streifen rechts+unten] und die Zug-Animation
  // lief versetzt). Layout, Kasten und Animation teilen jetzt dieselbe Zahl.
  const GAP = feld ? 0 : GAP0;
  let cell = 0, tight = false;   // tight = height is the binding constraint
  if (avail.w > 0) {
    // THE FRAME OVERHANG: the gilded rail blooms 2.6 percent past each edge.
    // Without carving that out of the width budget, board+frame overflow the
    // viewport on phones - the page gains sideways scroll and the board reads
    // as shoved off-centre. Dividing by 1.052 keeps rail and all inside.
    // v0.71.5 (Besitzer: "das GESAMTE Brett groesser"): der Sicherheits-
    // teiler schrumpft von 1,052 auf 1,018 - rund +3,3 % Kantenlaenge.
    // v0.71.6 (Besitzer): Teiler faellt GANZ - volle Breite, nur der
    // 1-px-Blockrand bleibt als hauchduenner Schwarzsaum.
    const byW = (Math.min(avail.w, fitBox ? avail.w : maxPx) - (W - 1) * GAP) / W;
    // Reserve HEADROOM above the top rank AND FOOTROOM below the first: a
    // selected piece grows 1.58x from its footpoint, so its head rises almost a
    // full cell over the square — and the value orbs ride a little UNDER the
    // bottom rank. The zoom viewport clips both without this reserve.
    // ... und der Hoehen-Vorhalt wird schlanker (0,78 statt 1,25 Zellen
    // Luft) - die Koepfe der Grundreihe brauchen weniger Reserve als gedacht.
    const byH = fitBox && avail.h > 0 ? (avail.h - (H - 1) * GAP) / (H + 0.62 + 0.16) : Infinity;
    cell = Math.max(8, Math.floor(Math.min(byW, byH)));
    tight = byH <= byW;          // the reserves only need defending when height decides
  }
  const bw = cell ? cell * W + (W - 1) * GAP : null;
  const bh = cell ? cell * H + (H - 1) * GAP : null;
  // Smaller boards → larger cells; glyph stays ~85% of a cell.
  const glyph = cell ? `${Math.round(cell * 0.98)}px` : `min(${(0.98 * 88 / W).toFixed(1)}vw, ${Math.round(0.98 * maxPx / W)}px)`;

  // display coords for the overlay (respect flip)
  const disp = (i) => {
    const f = i % W, r = Math.floor(i / W);
    const c = flip ? W - 1 - f : f, row = flip ? r : H - 1 - r;
    return { x: ((c + 0.5) / W) * 100, y: ((row + 0.5) / H) * 100, l: (c / W) * 100, t: (row / H) * 100 };
  };

  /* ── DAS BRETT SCHWEBT (v1.0.48, Besitzerwunsch) ─────────────────────────
     Statt der alten Randweiche, die nur die 28 Randfelder abdunkelte und an
     der Brettkante hart abriss, liegt jetzt ein Schatten NACH AUSSEN unter
     dem ganzen Brett. Drei gestaffelte Lagen: ein enger, dunkler Kern
     direkt an der Kante, ein mittlerer fuer die Tiefe, ein weiter, weicher
     als Umgebungsschatten. So sitzt das Brett sichtbar UEBER dem
     Hintergrund, statt in ihn hineinzulaufen - und die Kante, die dem
     Besitzer aufgefallen ist, verschwindet, weil nichts mehr innerhalb des
     Bretts abgedunkelt wird.
     Im Sparmodus faellt er weg: drei Schattenlagen sind billiger als 28
     Verlaeufe, aber nicht umsonst. */
  const brettSchatten = gespart("schatten") ? "none"
    : "0 2px 6px rgba(0,0,0,.45), 0 10px 28px rgba(0,0,0,.5), 0 22px 60px rgba(0,0,0,.38)";
  /* ── DAS TALENTBAND (Besitzerauftrag 4.9.2026) ──────────────────────────
     "Man sollte Faehigkeiten bewusst auswaehlen koennen." Bisher standen die
     Zauber-Zuege stumm zwischen den normalen Zielfeldern - der Spieler sah
     ein Feld mehr, wusste aber weder, dass es ein Talent ist, noch dass es
     das Buch schliesst. Jetzt zeigt das Band unter dem Brett bei jeder
     ausgewaehlten Figur: welche Talente sie kennt, welche ein ZAUBER sind
     (einer je Partie - der erste schliesst das Buch), welche dauerhaft
     gelten, und ob das Buch schon zu ist. Die Zauber-Ziele tragen auf dem
     Brett das gleiche Zeichen (✦). */
  const selPiece = sel != null ? state.board[sel] : null;
  const talentBand = (() => {
    /* v1.0.90 (Besitzer: "Faehigkeiten als Button unter dem Schachbrett, und
       erst wenn man die Figur anklickt"): DAS BAND GAB ES SEIT v1.0.85, aber
       der Besitzer hat es nie gesehen - er spielt Klassik, und dort ist jede
       Figur Stufe 1 und hat NULL Faehigkeiten (gemessen: Stufe 1 = 0, Stufe
       20 = 4). Das Band blieb also zu Recht leer, nur wusste das niemand.
       Jetzt sagt es das: bei einer eigenen Figur ohne Talente steht eine
       Zeile, warum nichts da ist - statt stumm zu verschwinden. */
    if (!selPiece) return null;
    const eigene = selPiece.color === state.turn;
    const ohneTalent = !selPiece.abilities || !selPiece.abilities.length;
    if (ohneTalent && (!eigene || !interactive)) return null;
    const zu = Object.keys(selPiece.used || {}).length > 0;
    const en = false;
    const schild = selPiece.shield || 0;
    const eintraege = selPiece.abilities.map((id) => {
      const ab = ABILITIES[id]; if (!ab) return null;
      const passiv = PASSIVE_TALENTE.has(id);
      const verbraucht = !!(selPiece.used || {})[id];
      /* v1.0.92 (Besitzer: "eine farbliche Kennzeichnung, ob passiv, aktiv,
         Fernkampf"): die Chronik fuehrt seit je acht Arten mit eigener Farbe
         (TAGS: Bewegung blau, Fernkampf orange, Sprung violett, Zaehigkeit
         gruen, Flaeche, Kontrolle, Kroenung, List). Das Band traegt sie
         jetzt - so sieht man die Art, bevor man den Namen liest. */
      const tg = TAGS[ab.tag] || null;
      return { id, name: en ? ab.nameEn : ab.nameDe, icon: ab.icon, passiv, verbraucht,
        farbe: tg ? tg.color : null, artName: tg ? (en ? tg.nameEn : tg.nameDe) : null };
    }).filter(Boolean);
    if (!eintraege.length && !schild) {
      /* keine Talente, kein Schild: eine erklaerende Zeile statt Nichts. */
      /* v1.2.3 (Besitzer: "die Faehigkeiten unten bitte immer etwas praesenter
         machen und besser darstellen"): auch die leere Zeile traegt jetzt das
         volle Band - gleiche Hoehe, gleiche Kontur. Vorher war sie blasser und
         duenner als das gefuellte Band, und das Auge las sie als Fehler statt
         als Auskunft. */
      return (
        <div className="gg-talentband" style={{ padding: "10px 12px", marginTop: 8, borderRadius: 12,
          fontSize: 12, lineHeight: 1.4, textAlign: "center", color: "#c3b6e6",
          background: "linear-gradient(180deg, rgba(32,25,54,.94), rgba(17,14,30,.96))",
          border: "1px solid rgba(167,139,250,.38)",
          boxShadow: "0 2px 10px rgba(0,0,0,.45), inset 0 1px 0 rgba(196,181,253,.10)" }}>
          {state.rules === "chess" && (selPiece.level || 1) <= 1
            ? "Klassisch — hier zählt nur Schach. Talente lernen die Figuren im Gambit-Modus."
            : "Diese Figur hat noch keine Talente — im Hofstaat lernt sie welche."}
        </div>
      );
    }
    /* v1.2.3: PRAESENTER. Das Band trug 11,5 px Schrift in einem duennen
       Kasten und verschwand neben dem Brett. Jetzt groessere Chips, mehr Luft,
       eine sichtbare Kontur und ein Schatten, der es vom Grund hebt - es ist
       die Schaltflaeche fuer jeden Zauber, nicht eine Fussnote. */
    return (
      <div className="gg-talentband" style={{ display: "flex", flexWrap: "wrap", gap: 7, alignItems: "center",
        justifyContent: "center", padding: "10px 10px 9px", fontSize: 12.5, lineHeight: 1.35,
        color: "#e4dcff", background: "linear-gradient(180deg, rgba(34,26,58,.96), rgba(18,15,32,.97))",
        border: "1px solid rgba(167,139,250,.5)", borderRadius: 12, marginTop: 8,
        boxShadow: "0 3px 14px rgba(0,0,0,.5), inset 0 1px 0 rgba(196,181,253,.14)" }}>
        {/* DER SCHILD (Besitzerbefund "er ist nicht gestorben"): seit v1.0.77
            sind die blauen Perlen vom Brett - und damit war der Schild
            unsichtbar, obwohl er im Schachmodus jeden Schlag abfaengt. Hier
            steht er wieder, in Worten. */}
        {schild > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
            borderRadius: 999, whiteSpace: "nowrap", background: "rgba(74,163,232,.16)",
            border: "1px solid rgba(74,163,232,.55)", color: "#bfe0ff" }}>
            <span aria-hidden>⛨</span>Schild ×{schild}
            <span style={{ opacity: .7, fontSize: 10 }}>fängt {schild === 1 ? "einen Schlag" : schild + " Schläge"} ab</span>
          </span>
        )}
        {eintraege.map((e) => {
          const aktiv = !e.passiv && scharf === e.id;
          const waehlbar = !e.passiv && !zu && interactive && selPiece.color === state.turn;
          return (
          <span key={e.id} role={waehlbar ? "button" : undefined}
            onClick={waehlbar ? (ev) => { ev.stopPropagation(); setScharf(aktiv ? null : e.id); } : undefined}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
            borderRadius: 999, whiteSpace: "nowrap", cursor: waehlbar ? "pointer" : "default",
            background: zu && !e.passiv ? "rgba(120,120,140,.14)"
              : aktiv ? (e.farbe || "#a78bfa") + "88"
              : e.farbe ? e.farbe + "22" : (e.passiv ? "rgba(233,207,138,.14)" : "rgba(124,58,237,.22)"),
            border: `1px solid ${zu && !e.passiv ? "rgba(140,140,160,.35)"
              : aktiv ? "#fff" : (e.farbe ? e.farbe + "aa" : "rgba(167,139,250,.6)")}`,
            boxShadow: aktiv ? "0 0 10px rgba(167,139,250,.6)" : "none",
            color: e.passiv ? "#f1e3b2" : (zu ? "#9a97ad" : "#e6ddff"),
            textDecoration: e.verbraucht ? "line-through" : "none" }}>
            <span aria-hidden style={{ color: e.farbe || undefined }}>{e.passiv ? "◆" : "✦"}</span>{e.name}
            <span style={{ opacity: .7, fontSize: 10 }}>{e.passiv ? "dauerhaft" : (e.verbraucht ? "eingesetzt" : aktiv ? "bereit — Feld wählen" : "antippen")}</span>
          </span>);
        })}
        {!eintraege.every((e) => e.passiv) && (
          <span style={{ width: "100%", textAlign: "center", fontSize: 10.5, color: zu ? "#b8a7ea" : "#a89ac9", marginTop: 2 }}>
            {zu ? "Das Buch ist geschlossen — ein Zauber je Partie, er ist eingesetzt."
                : scharf ? "Zauber bereit: tippe ein ✦-Feld. Nochmal antippen entschärft."
                : "Ein Zauber je Partie — tippe ein Talent an, um seine Züge zu sehen."}
          </span>
        )}
      </div>
    );
  })();

  const board = (
    /* v1.24.7 (Besitzer): "das Schachbrett ist zu nah an den oberen Buttons,
       etwas mehr Abstand". Die obere Figurenreihe ragt ueber die Brettkante
       hinaus (gemessen 49 px) und stiess deshalb an Zuruecl und Aufgeben.
       12 px Luft oben, ohne die Brettgroesse anzutasten. */
    <div style={{ position: "relative", width: bw ?? `min(100%, ${maxPx}px)`, maxWidth: "100%",
      margin: fitBox ? "12px 0 0" : "12px auto 0", fontSize: glyph,
      borderRadius: 12, boxShadow: brettSchatten }}>
      <div style={{ ...(cell
          ? { width: bw, height: bh, gridTemplateColumns: `repeat(${W}, ${cell}px)`, gridTemplateRows: `repeat(${H}, ${cell}px)` }
          : { aspectRatio: `${W} / ${H}`, gridTemplateColumns: `repeat(${W}, 1fr)`, gridTemplateRows: `repeat(${H}, 1fr)` }),
        display: "grid", gap: GAP, borderRadius: 12, overflow: "visible", position: "relative", // the back rank's heads rise ABOVE the field
        /* v1.0.37: DIE EINE BLENDE. Sie ersetzt die 64 Einzeluebergaenge, die
           beim Partiestart gleichzeitig liefen - der Browser haelt hier eine
           Ebene und schiebt sie auf die Grafikkarte, statt Feld fuer Feld zu
           rechnen. willChange sagt ihm das vorher, damit er die Ebene schon
           bereitlegt und nicht erst beim ersten Bild aufbaut. */
        opacity: artReady ? 1 : 0,
        transition: "opacity 1.6s ease .45s",
        willChange: artReady ? "auto" : "opacity",
        /* v1.0.30 (Besitzer: "Hintergrund und Schachfeld muessen mehr
           zusammenwachsen"): DAS BRETT WAECHST INS BILD - aber nur so weit,
           wie es SPIELBAR bleibt. Drei Wege wurden am Bild ausprobiert und
           gemessen; zwei sind wieder geflogen:
           - Maske ueber dem Brett: schnitt die Eckfelder an, die Platten
             verloren ihre Tiefe. VERWORFEN.
           - Felder auf 0.92 Deckkraft: der Grund schlug durch, aus Stein
             wurde ein flaues Rautenmuster. VERWORFEN.
           Geblieben ist, was traegt: ein weiter, sehr weicher Schein nach
           aussen, der das Brett in die Landschaft bettet, und ein
           Kantenverlauf DARUEBER, der die harte Aussenkante ausfransen
           laesst - beides ohne die Spielflaeche selbst anzutasten. */
        background: "#05070c",
        // Besitzer-Felder bringen ihren eigenen Rand mit (v0.71): keine Fugen,
        // keine Haarlinie obendrauf - nur der Goldrahmen bleibt.
        border: feld ? "none" : `1px solid ${T.line}`,
        /* Der Schein nach aussen: ein tiefer, sehr weicher Schatten in der
           Farbe der Nacht - das Brett steht damit IM Bild statt darauf. Dazu
           innen ein Hauch, der die Kante bricht. */
        boxShadow: "0 0 44px 26px rgba(5,7,12,.62), 0 18px 60px rgba(0,0,0,.55), inset 0 0 22px rgba(5,7,12,.5)",
        /* KEINE Maske auf dem Brett: der erste Versuch legte einen weichen
           Radialverlauf darueber - und schnitt damit die ECKFELDER an,
           waehrend die Steinplatten ihre Tiefe verloren. Am Bild gemessen
           war es schlechter als vorher. Das Einwachsen leistet allein der
           Schein nach aussen; die Spielflaeche bleibt unangetastet. */
        userSelect: "none", touchAction: "manipulation" }}>
        {ground && !feld && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `url(${ground})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        {cells}
        {/* v1.0.30: DIE KANTE FRANST AUS. Ein Verlauf in der Farbe der Nacht
            liegt nur auf den aeussersten Prozenten des Bretts - innen ist er
            vollstaendig durchsichtig, die Spielflaeche bleibt unberuehrt.
            Er nimmt der Aussenkante die Schaerfe, sodass Brett und Gemaelde
            ineinander laufen statt uebereinander zu liegen. */}
        {/* v1.0.34 (Besitzer: "am Kopf der Figuren sieht man die Kante des
            Brettes"): GENAU SO WAR ES, und der Grund lag in den Ebenen. Die
            Zellen tragen zIndex rr+3, die oberste Reihe also 3 - derselbe
            Wert wie dieser Verlauf, der im DOM SPAETER kommt und damit
            gewinnt. Die Koepfe der hinteren Reihe ragen ueber die Brettkante
            hinaus (so ist es gewollt) und liefen deshalb genau in diesen
            Schleier. Er ist ersatzlos fort: die Randweiche macht jetzt jedes
            Randfeld SELBST, hinter seiner Figur. */}
        {/* v1.0.37: HIER blendet das Brett auf - einmal, fuer alle 64 Felder
            zusammen. Eine einzige Ebene, die der Browser auf die Grafikkarte
            legen kann, statt 64 Uebergaengen, die er Feld fuer Feld
            durchrechnet. */}
        {/* v1.0.34 (Besitzer): "Das Zickzack ist doof am Rand. Geht gar
            nicht." - fort damit. Die gesprungene Kante aus v1.0.31 ist
            restlos entfernt; an ihre Stelle tritt echte Transparenz an den
            Randfeldern (siehe unten bei den Zellen) und ein weicher
            Schatten nach aussen. */}
        {/* THE GILDED FRAME: an ornate rail laid around every board so the
            field reads as a mounted plate, not a flat grid. Measured on the
            art: the rail's inner edge sits 2.5% in from the image border, so
            an inset of -2.6% lands that edge right on the board's rim — the
            filigree tips kiss the outer squares, the rest blooms outward.
            No z-index: squares beneath it, pieces (z1+), orbs and selection
            above — the back rank stands IN the frame like a showcase. */}
        {/* DER LEBENDE RAHMEN (v0.39.1): gezeichnet statt gemalt - scharf in
            jeder Groesse, ein paar hundert Byte statt 300 KB, und er ERZAEHLT
            die Partie: ein Glanz wandert an den Leisten entlang, die Ecken
            glimmen, und wer die Oberhand hat, faerbt seine Leiste - fuehrt
            der Gegner, zucken oben Riss-Blitze, je klarer sein Vorsprung,
            desto haeufiger. */}
        {/* v0.71.6: bei Besitzer-Feldern faellt der Goldrahmen ganz - die
            Kacheln tragen ihren eigenen Rand. */}
        {!feld && <div aria-hidden style={{ position: "absolute",
          // v0.71.1: mit Koordinaten rueckt der Goldrahmen weiter nach AUSSEN,
          // damit er Buchstaben und Zahlen nicht ueberdeckt (Besitzer).
          // v0.71.4: bei Besitzer-Feldern ruecken die Goldleisten GANZ nach
          // aussen - nichts ueberlappt die Kacheln; mit Koordinaten ohnehin.
          inset: feld ? "-5.6%" : showCoords ? "-4.8%" : "-2.6%", pointerEvents: "none",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,.45))" }}>
          <BrettRahmen lage={lageAusBrett(state.board, pov)} />
        </div>}
        {/* ── THE BIG DRAGON: one sprite over four squares ── */}
        {state.board.map((pc, a) => {
          if (!pc || !pc.big || pc.kind !== "D") return null;
          const f0 = a % W, r0 = (a / W) | 0;
          const dc = flip ? W - 2 - f0 : f0;
          const dr = flip ? r0 : H - 2 - r0;
          const selHere = sel === a;
          // once the dragon is chosen, let taps fall THROUGH to the squares
          // beneath (his step-forward target sits under his own block), so the
          // move markers stay reachable — a re-tap on him still deselects via
          // the wing cells underneath.
          return (
            <div key={"drg" + a} onClick={selHere ? undefined : () => tap(a)} style={{ position: "absolute", zIndex: 2,
              left: `calc(${(dc / W) * 100}% )`, top: `calc(${(dr / H) * 100}% )`,
              width: `${(2 / W) * 100}%`, height: `${(2 / H) * 100}%`,
              display: "grid", placeItems: "center", cursor: interactive ? "pointer" : "default",
              pointerEvents: selHere ? "none" : "auto",
              borderRadius: 10,
              /* v1.0.62 (Besitzer): der aeussere Auswahl-Schein war "besonders
                 krass" - gestrichen. Der Innenring sagt alles Noetige. */
              boxShadow: selHere ? "inset 0 0 0 3px rgba(240,214,138,.85)" : "none",
              fontSize: `calc(${typeof glyph === "string" ? glyph : glyph + "px"} * 1.88)` }}>
              <PieceGlyph piece={pc} showLevel={showLevel} pov={pov} artStyle={artStyle} focus={selHere} big />
            </div>
          );
        })}

        {/* the material rides on top too: a soft-light wash of the same wood, so
            scratches and grain read across light and dark squares alike */}
        {texture && !ground && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: `url(${texture})`, backgroundSize: "280px 280px", backgroundRepeat: "repeat",
          mixBlendMode: "soft-light", opacity: 0.7 }} />}
        {/* a FRIENDLY table wears its welcome: a warm golden wash, and on each
            vein wave a soft sheen band glides across the polished stone */}
        {friendly && <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(242,217,140,.05), rgba(242,217,140,.11))" }} />}
        {friendly && wave && !REDUCED && artReady && (() => {
          const g = Math.atan2(wave.dx, wave.dy) * 180 / Math.PI;
          return <div key={"fw" + wave.id} aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden", mixBlendMode: "screen" }}>
            <div style={{ position: "absolute", left: "-60%", top: "-60%", width: "220%", height: "220%",
              "--sx0": `${(-wave.dx * 55).toFixed(1)}%`, "--sy0": `${(wave.dy * 55).toFixed(1)}%`,
              "--sx1": `${(wave.dx * 55).toFixed(1)}%`, "--sy1": `${(-wave.dy * 55).toFixed(1)}%`,
              background: `linear-gradient(${g.toFixed(0)}deg, transparent 18%, rgba(242,217,140,.05) 34%, rgba(242,217,140,.13) 50%, rgba(242,217,140,.05) 66%, transparent 82%)`,
              animation: "ggSweep 4.6s ease-in-out both" }} />
          </div>;
        })()}
      </div>
      {lastMove && !anim && lastMove.from !== lastMove.to && (() => {
        const a = disp(lastMove.from), b = disp(lastMove.to);
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* v0.71.4 (Besitzer): kein Kreis-Schweif mehr - ein WEICHER
                VERLAUF zeigt den Zug: breiter zarter Strahl darunter, feiner
                hellerer darueber, beide von durchsichtig (Start) zu Gold
                (Ziel), runde Kappen. */}
            <defs>
              {/* v1.0.67 (Besitzer: "noch ein bisschen kraeftiger"): der
                  Verlauf traegt mehr Gold (0.30/0.72 statt 0.16/0.42), der
                  Strahl ist breiter (4.4/1.8), und ein weisser Kern gibt ihm
                  die Klinge. Am Ziel glueht kurz ein Ring auf (ggZielGlut),
                  damit das Ende des Zuges einen Punkt hat - alles nur
                  opacity und transform, nichts davon kostet Layout. */}
              <linearGradient id="zugschweif" gradientUnits="userSpaceOnUse"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <stop offset="0%" stopColor={T.gold} stopOpacity="0" />
                <stop offset="45%" stopColor={T.gold} stopOpacity="0.30" />
                <stop offset="100%" stopColor={T.gold} stopOpacity="0.72" />
              </linearGradient>
              <linearGradient id="zugschweifKern" gradientUnits="userSpaceOnUse"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <stop offset="0%" stopColor="#fff6dc" stopOpacity="0" />
                <stop offset="60%" stopColor="#fff6dc" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#fff6dc" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#zugschweif)"
              strokeWidth="4.4" strokeLinecap="round" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="url(#zugschweifKern)"
              strokeWidth="1.8" strokeLinecap="round" />
            {animAn() && <circle cx={b.x} cy={b.y} r="3.6" fill="none" stroke={T.gold}
              strokeWidth="1.1" style={{ transformOrigin: `${b.x}px ${b.y}px`,
              animation: "ggZielGlut .7s ease-out forwards" }} />}
          </svg>
        );
      })()}

      {/* ── v1.0.67: DER EINSCHLAG JE FIGUR (Besitzer: "dass jede Figur auf
          eine andere Art und Weise zieht - ein Schildtraeger, der schiebt").
          Ein transientes Overlay am ZIELFELD, nur bei Schlag oder Fernstoss,
          getragen vom selben anim-Zustand wie Gleiter und Schweif - kein
          eigener Takt, kein zusaetzliches Re-Render. Vier Handschriften
          (anim.js: stoss/klinge/wucht/bann) plus das Drachenfeuer. Alles
          transform+opacity; die Ruckel-Lehre aus v1.0.37 gilt. */}
      {animAn() && anim && lastMove && (lastMove.capture || lastMove.lethal) && !lastMove.bounced && (() => {
        const art = schlagArt(anim.piece.kind);
        const zt = disp(lastMove.to), zf = disp(lastMove.from);
        const dx = zt.x - zf.x, dy = zt.y - zf.y;
        const winkel = Math.atan2(dy, dx) * 180 / Math.PI;
        const dauer = Math.max(0.32, anim.dur * 0.6);
        const verz = anim.dur;   // der Einschlag sitzt, WENN der Schlaeger landet
        const feld = { position: "absolute", left: `${zt.l}%`, top: `${zt.t}%`,
          width: `${100 / W}%`, height: `${100 / H}%`, pointerEvents: "none", zIndex: 6 };
        const funken = <span style={{ ...feld, display: "grid", placeItems: "center" }}>
          <span style={{ width: "62%", height: "62%", borderRadius: "50%", opacity: 0,
            background: "radial-gradient(circle, rgba(255,240,200,.9) 0%, rgba(233,207,138,.5) 42%, rgba(233,207,138,0) 70%)",
            animation: `ggFunken ${dauer}s ease-out ${verz}s forwards` }} />
        </span>;
        if (art === "feuer") {
          const laenge = Math.hypot(dx * W, dy * H) / W;   // in Feldbreiten
          return <>
            <span style={{ position: "absolute", left: `${zf.x}%`, top: `${zf.y}%`,
              width: `${(laenge * 100) / W}%`, height: `${52 / H}%`, pointerEvents: "none", zIndex: 6,
              transform: `translateY(-50%) rotate(${winkel}deg)`, transformOrigin: "0 50%" }}>
              <span style={{ position: "absolute", inset: 0, opacity: 0, transformOrigin: "0 50%",
                background: "linear-gradient(90deg, rgba(255,120,40,0) 0%, rgba(255,150,50,.85) 18%, rgba(255,220,120,.95) 55%, rgba(255,240,180,.9) 100%)",
                borderRadius: 999, filter: "blur(1px)",
                animation: `ggFeuer ${Math.max(0.5, anim.dur)}s ease-out ${verz * 0.4}s forwards` }} />
            </span>
            {funken}
          </>;
        }
        if (art === "klinge") return <>
          <span style={{ ...feld, display: "grid", placeItems: "center" }}>
            <span style={{ width: "108%", height: "14%", borderRadius: 999, opacity: 0,
              background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,250,230,.95) 50%, rgba(255,255,255,0) 100%)",
              animation: `ggKlinge ${dauer}s ease-out ${verz}s forwards` }} />
          </span>
          {funken}
        </>;
        if (art === "bann") return <>
          <span style={{ ...feld, display: "grid", placeItems: "end center" }}>
            <span style={{ width: "26%", height: "120%", opacity: 0, transformOrigin: "50% 100%",
              background: "linear-gradient(0deg, rgba(233,207,138,.9) 0%, rgba(255,246,220,.75) 55%, rgba(255,246,220,0) 100%)",
              borderRadius: 999, animation: `ggBann ${dauer + 0.15}s ease-out ${verz}s forwards` }} />
          </span>
          {funken}
        </>;
        /* stoss und wucht: die Richtung des Schlages faehrt in die Karte */
        return <>
          <span style={{ ...feld }}>
            <span style={{ position: "absolute", inset: "8%", borderRadius: 10, opacity: 0,
              border: "2px solid rgba(255,246,220,.8)",
              "--sx": `${(dx ? Math.sign(dx) : 0) * 7}%`, "--sy": `${(dy ? Math.sign(dy) : 0) * 7}%`,
              animation: `${art === "wucht" ? "ggWucht" : "ggStoss"} ${dauer}s ease-out ${verz}s both` }} />
          </span>
          {funken}
        </>;
      })()}
      {/* v1.0.14 (Besitzer): DER TREFFER WIRD SICHTBAR. Hier schuettelte
          bisher ein LEERES Feld ueber der Zelle - eine Animation ohne Koerper,
          man sah also nichts. Der Getroffene wackelt jetzt SELBST (unten in
          der Zelle); hier bleibt nur noch der rote Aufschlag-Ring, damit man
          sieht, WO der Schlag sass, ohne dass die Figur faellt. */}
      {/* v1.0.32 (Besitzer: "der Angriff soll sichtbar werden"): DER FUNKE AM
          AUFPRALL. Bisher blieb ein abgewehrter Schlag stumm - die Figur
          stiess vor, kam zurueck, und nichts sagte, dass da etwas AUFGESCHLAGEN
          ist. Jetzt sitzt am Beruehrungspunkt ein kurzer heller Ring, genau
          fuer die Dauer des Aufpralls. Er liegt zwischen den Figuren, nicht
          darueber, und faengt keine Klicks. */}
      {anim && anim.bounced && (() => {
        const a = disp(anim.from), b = disp(anim.to);
        const x = a.x + (b.x - a.x) * 0.46, y = a.y + (b.y - a.y) * 0.46;
        return <div key={`fnk${anim.id}`} aria-hidden style={{ position: "absolute",
          left: `${x}%`, top: `${y}%`, width: `${100 / W * 0.5}%`, height: `${100 / H * 0.5}%`,
          transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 5,
          borderRadius: "50%", border: "2px solid rgba(255,226,168,.85)",
          boxShadow: "0 0 14px rgba(255,206,120,.7), inset 0 0 8px rgba(255,226,168,.5)",
          animation: "ggAufprall .34s ease-out .1s both" }} />;   /* both: bis zum Einsatz unsichtbar, danach ausgeblendet */
      })()}
      {lastMove && lastMove.damaged && !lastMove.lethal && !anim?.bounced && (() => {
        const s = disp(lastMove.to);
        return <div key={`shk${lastMove.id || lastMove.to}`} aria-hidden style={{ position: "absolute",
          left: `${s.l}%`, top: `${s.t}%`, width: `${100 / W}%`, height: `${100 / H}%`,
          pointerEvents: "none", zIndex: 6, display: "grid", placeItems: "center" }}>
          <span style={{ width: "62%", height: "62%", borderRadius: "50%",
            border: "2px solid rgba(216,72,72,.75)", boxShadow: "0 0 10px rgba(216,72,72,.5)",
            animation: "ggAufprall .5s ease-out forwards" }} />
        </div>;
      })()}

      {anim && (() => {
        // The mover is drawn ONCE, as an overlay that is pixel-identical to the
        // piece that will stand in the cell (same lift, size, origin — see the
        // shared pieceLift/pieceFont above). It sits on its DESTINATION cell and
        // slides in FROM the origin as a transform (FROM-offset -> 0), so it
        // lands EXACTLY on its square: transform 0 IS the cell. A leap arcs, a
        // plain move leans, a blocked strike lunges and returns — every one ends
        // neutral, so when the overlay hands off to the cell nothing shifts,
        // grows or blinks. (The old ghost sat centred and smaller, then jumped.)
        const a = disp(anim.from), b = disp(anim.to);
        const dur = anim.dur || (anim.foe ? 0.9 : 0.52);
        const ease = "cubic-bezier(.34,.72,.28,1)";
        const leapEase = "cubic-bezier(.42,.05,.58,.95)";
        // lean INTO the direction of travel — mid-flight only.
        const dxSign = Math.sign(b.l - a.l);
        const dir = dxSign || (Math.sign(b.t - a.t) || 1);
        const tilt = dir * 7;
        // BASE cell: normal move/leap → destination (slide in from origin);
        // a bounce → origin (lunge toward the foe and spring back).
        const base = anim.bounced ? a : b;
        // offset that plants the piece at FROM while its base cell is TO, in %
        // of one cell (translate(-100%) == exactly one cell). Same disp() maths
        // as the grid, so origin and destination line up to the pixel.
        const txStart = (a.l - b.l) * W, tyStart = (a.t - b.t) * H;
        const bx = (b.l - a.l) * W * 0.42, by = (b.t - a.t) * H * 0.42; // lunge vector
        const glideOn = !anim.bounced && anim.phase >= 1;
        const leapNow = anim.leaps && anim.phase === 1 && !anim.bounced;
        const leanNow = !anim.leaps && anim.phase === 1 && !anim.bounced;
        const bounceNow = anim.bounced && anim.phase === 1;
        return (
          <div key={anim.id} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, animation: "arrowFade 1.05s ease forwards" }}>
              {Array.from({ length: 7 }).map((_, k) => {
                const q = (k + 1) / 8;
                return <circle key={k} cx={a.x + (b.x - a.x) * q} cy={a.y + (b.y - a.y) * q}
                  r={0.7 + q * 1.5} fill={T.gold} opacity={0.10 + q * 0.34} />;
              })}
              <circle cx={b.x} cy={b.y} r="3.1" fill={T.gold} opacity="0.16" />
              <circle cx={b.x} cy={b.y} r="1.5" fill={T.gold} opacity="0.55" />
            </svg>
            {anim.phase < 2 && <div key={`g${anim.id}`} style={{ position: "absolute",
              left: `${base.l}%`, top: `${base.t}%`,
              width: `${100 / W}%`, height: `${100 / H}%`, zIndex: 7,
              // OUTER = board glide. Destination-based, so transform 0 lands the
              // piece dead-centre on its cell. No transition in phase 0 (planted
              // at FROM); phase 1 switches it on and carries it home.
              transform: anim.bounced ? "none" : (glideOn ? "translate(0%,0%)" : `translate(${txStart}%, ${tyStart}%)`),
              transition: anim.bounced ? "none" : (glideOn ? `transform ${dur}s ${anim.leaps ? leapEase : ease}` : "none"),
              display: "grid", placeItems: "center" }}>
              {/* MIDDLE = the hop arc / lean / lunge — all end neutral */}
              <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center",
                ...(leapNow ? { animation: `ggLeapArc ${dur}s cubic-bezier(.4,.12,.5,1) forwards` }
                  : leanNow ? { ["--tilt"]: `${tilt}deg`, animation: `ggLean ${dur}s ${ease} forwards` }
                  : bounceNow ? { ["--bx"]: `${bx}%`, ["--by"]: `${by}%`, animation: `ggBounce ${dur}s ease-in-out forwards` }
                  : {}) }}>
                {/* INNER = the piece, IDENTICAL geometry to the cell version */}
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  transform: `translateY(${pieceLift})`, transformOrigin: PIECE_ORIGIN,
                  fontSize: pieceFont(anim.piece.kind),
                  filter: gespart("schatten") ? "none" : "drop-shadow(0 0.06em 0.09em rgba(0,0,0,.5))" }}>
                  <PieceGlyph aufsBrett piece={anim.piece} showLevel={showLevel} pov={pov} artStyle={artStyle} fliegt />
                </div>
              </div>
            </div>}
          </div>
        );
      })()}

      {/* the FALLEN: spins off and lands exactly on its captor's tray */}
      {death && <DeathFlyer death={death} disp={disp} W={W} H={H} pov={pov} artStyle={artStyle} />}
      {sterne && sterne.list.map((e, i) => {
        const d = disp(e.at);
        return (
          <span key={sterne.id + "-" + i} aria-hidden style={{ position: "absolute",
            left: d.x + "%", top: d.y + "%", width: (118 / W) + "%", height: (118 / H) + "%",
            transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 6 }}>
            <span style={{ position: "absolute", inset: 0, opacity: 0,
              animation: "ggRissStern 2.5s cubic-bezier(.2,.7,.3,1) both",
              animationDelay: e.delay + "ms" }}>
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <radialGradient id={"ggStGl" + i} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#e9defd" stopOpacity=".95" />
                  <stop offset="34%" stopColor="#a78bfa" stopOpacity=".55" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                </radialGradient>
                <circle cx="50" cy="50" r="46" fill={"url(#ggStGl" + i + ")"} />
                {/* der Stern: vier lange, vier kurze Zacken - eine Sternschnuppe im Stand */}
                <path d="M50 6 L55.5 42 L50 50 L44.5 42 Z M94 50 L58 55.5 L50 50 L58 44.5 Z M50 94 L44.5 58 L50 50 L55.5 58 Z M6 50 L42 44.5 L50 50 L42 55.5 Z"
                  fill="#d8ccfb" />
                <path d="M74 26 L54.5 45.5 L50 50 L58 42 Z M74 74 L54.5 54.5 L50 50 L58 58 Z M26 74 L45.5 54.5 L50 50 L42 58 Z M26 26 L45.5 45.5 L50 50 L42 42 Z"
                  fill="#b9a4f7" opacity=".85" />
                <circle cx="50" cy="50" r="6.5" fill="#f2ecff" />
              </svg>
            </span>
          </span>
        );
      })}
      {zeichen && zeichen.list.map((e, i) => {
        const d = disp(e.at);
        return (
          <span key={zeichen.id + "-z" + i} aria-hidden className="gg-serif" style={{ position: "absolute",
            left: d.x + "%", top: d.y + "%", transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 7,
            whiteSpace: "nowrap", fontSize: "clamp(10px, 2.9vw, 15px)", fontWeight: 800, letterSpacing: ".04em",
            color: e.farbe, textShadow: "0 1px 2px #000, 0 0 8px rgba(0,0,0,.85)", opacity: 0,
            animation: "ggZeichenSteigt 1.8s cubic-bezier(.2,.7,.3,1) both", animationDelay: e.delay + "ms" }}>
            {e.text}</span>
        );
      })}
    </div>
  );
  // MEASURED (390x844 phone): this box aligned its content to the END, so on a
  // width-limited board every scrap of spare height piled up ABOVE it — 437px
  // of sky over the board and 47px under it. The reserves are real (a selected
  // piece grows 1.58x and its head clears almost a full cell; the value orbs
  // ride under the bottom rank), so they stay — but as PADDING, with the board
  // centred in what remains. Slack now falls evenly above and below.
  // When HEIGHT is the binding constraint the reserves must be held as padding
  // or a selected piece's head gets clipped. When WIDTH decides — every phone
  // in portrait — there is slack to spare, so the board simply sits centred and
  // the head room comes free. That is the difference between a board resting
  // mid-screen and one shoved against the bottom rail.
  /* v1.0.92 (Besitzer: "das Talentband verschwindet teilweise unter dem
     Schachbrett, und das Brett koennte insgesamt weiter nach oben"): DAS BAND
     LAG IM RASTER NEBEN DEM BRETT. Bei alignItems center legte das Raster
     Brett UND Band beide in die Mitte - also uebereinander, und das Band
     verschwand hinter dem Brett. Jetsch stapelt eine Spalte sie sauber:
     Brett oben, Band darunter. Dazu rueckt das Brett hoeher (Kopfraum von
     0,95 auf 0,45 Zellen), damit unten Platz fuer das Band bleibt - genau
     das Areal, das der Besitzer sich wuenscht. */
  if (fitBox) return <div ref={wrapRef} style={{ position: "absolute", inset: 0, display: "flex",
    flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
    paddingTop: tight && cell ? Math.round(cell * 0.45) : 0,
    paddingBottom: tight && cell ? Math.round(cell * 0.2) : 0, gap: 0 }}>{board}{talentBand}</div>;
  return <div ref={wrapRef} style={{ width: "100%" }}>{board}{talentBand}</div>;
}
