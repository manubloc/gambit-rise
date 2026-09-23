// Gambit piece art v5 — silhouettes now live as EDITABLE SVG FILES in
// assets/pieces/*.svg (one per figure, linked via data-gg="piece:<KIND>").
// This module only recolors them (CSS variables) and draws the level plinth.
// Workflow: edit the SVG → `npm run art` (runs automatically on build/test).
// No outlines: each piece is a single flat shape (player = antique gold, enemy
// = deep navy with a hairline steel edge for dark-board readability). Negative
// space is cut as real holes (fillRule="evenodd"): the bishop's slit, cross
// visors, lyre strings, binocular lenses, the gear's hub, flask bubbles.
// LEVEL stays carved into the flat plinth: notches, a tier from L5, gold from L9.
import { T } from "../theme.js";
import { PIECE_ART, BOSS_ART, CREST_ART } from "../art.generated.js";

// ── flat plinth with level tiers ─────────────────────────────────────────────
function plinth(fill, rim, detail, level = 1) {
  const parts = [];
  if (level >= 5) parts.push(<path key="tier" d="M13.5 40 L34.5 40 L35.5 37.2 L12.5 37.2 Z"
    fill={fill} stroke={rim || "none"} strokeWidth={rim ? 1 : 0} transform="translate(0,0)" />);
  parts.push(<path key="base" d="M10.5 40 L37.5 40 L39 44.2 L9 44.2 Z" fill={fill}
    stroke={rim || "none"} strokeWidth={rim ? 1 : 0} />);
  if (level >= 9) parts.push(<rect key="gold" x="10.5" y="45.4" width="27" height="1.7" rx="0.85" fill={T.gold} />);
  const n = Math.min(Math.max(level - 1, 0), 6);
  for (let i = 0; i < n; i++) {
    const x = 24 - ((n - 1) * 3.4) / 2 + i * 3.4;
    parts.push(<path key={"n" + i} d={`M${x} 41.4 L${x} 43.1`} stroke={detail} strokeWidth="1.5" strokeLinecap="round" />);
  }
  return parts;
}

// ── registry rendering: recolor the asset files via CSS variables ───────────
const artVars = (fill, rim, detail, accent, rimW) => {
  const v = { "--fill": fill, "--detail": detail, "--accent": accent };
  if (rim) v["--rim"] = rim; // absent ⇒ per-element fallbacks in the SVG apply
  if (rimW) v["--rimW"] = rimW;
  return v;
};
const ArtG = ({ html, style }) => <g style={style} dangerouslySetInnerHTML={{ __html: html || "" }} />;

export function PieceArt({ kind, fill = T.lime, rim = null, detail = "#7a5c26", accent = T.gold, size = "1em", level = 1, art = null, hero = false, rimW = 0, bossId = null }) {
  const boss = kind === "X";
  // EVERY MONSTER ITS OWN SHAPE. For a long while twenty-five monsters shared
  // five family silhouettes — the Warden, the Bulwark, the Cannoneer, the
  // Colossus and Ironfist were literally the same figure. Each now has a
  // drawing of its own; the family shape stays as the fallback for anything
  // new (and for the campaign's own piece-bosses).
  const bossShape = (bossId && BOSS_ART[bossId]) || BOSS_ART[art] || BOSS_ART._default;
  // The Gambit shares the pawn's KIND, so for a long while it also borrowed the
  // pawn's silhouette — the one figure in the game without a shape of its own.
  // It has one now; the crest still rides on top.
  const shape = hero && PIECE_ART.GAMBIT ? PIECE_ART.GAMBIT : PIECE_ART[kind] || PIECE_ART._default;
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden="true">
      {boss
        ? <ArtG html={bossShape} style={artVars(fill, rim, detail, accent, rimW)} />
        : <>
            <ArtG html={shape} style={artVars(fill, rim, detail, accent, rimW)} />
            {plinth(fill, rim, detail, level)}
            {hero && <ArtG html={CREST_ART} style={artVars(fill, rim, detail, accent, rimW)} />}
          </>}
    </svg>
  );
}

// ── ability category marks (+ boss skull) ────────────────────────────────────
function markShape(tag, col) {
  const s = { fill: "none", stroke: col, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (tag) {
    case "move":    return <path d="M3 2.5 L6.5 6 L3 9.5 M7 2.5 L10.5 6 L7 9.5" {...s} />;
    case "ranged":  return <path d="M2 6 L9 6 M6.5 3.5 L9.5 6 L6.5 8.5" {...s} />;
    case "blink":   return <path d="M6 1 L7.1 4.9 L11 6 L7.1 7.1 L6 11 L4.9 7.1 L1 6 L4.9 4.9 Z" fill={col} stroke="none" />;
    case "sustain": return <path d="M6 2 L6 10 M2 6 L10 6" {...s} strokeWidth="2" />;
    case "aoe":     return <><circle cx="6" cy="6" r="4" {...s} /><circle cx="6" cy="6" r="1" fill={col} stroke="none" /></>;
    case "control": return <path d="M8.5 2.5 C4.5 2.5 3.5 6 4 8 M4 8 L2.3 6.6 M4 8 L6 7.2" {...s} />;
    case "promo":   return <path d="M6 1 L7.4 4.4 L11 4.6 L8.2 6.9 L9.2 10.5 L6 8.4 L2.8 10.5 L3.8 6.9 L1 4.6 L4.6 4.4 Z" fill={col} stroke="none" />;
    case "boss":    return <><path d="M6 1.5 C9 1.5 10.6 3.6 10.6 6 C10.6 7.6 9.8 8.8 8.6 9.4 L8.6 11 L3.4 11 L3.4 9.4 C2.2 8.8 1.4 7.6 1.4 6 C1.4 3.6 3 1.5 6 1.5 Z" fill={col} stroke="none" /><circle cx="4.4" cy="5.8" r="1.1" fill="#0c111e" /><circle cx="7.6" cy="5.8" r="1.1" fill="#0c111e" /></>;
    default:        return <circle cx="6" cy="6" r="2.4" fill={col} stroke="none" />;
  }
}

export function CategoryMark({ tag, color, size = "0.2em" }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden="true"
      style={{ display: "block", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.6))" }}>
      {markShape(tag, color)}
    </svg>
  );
}
