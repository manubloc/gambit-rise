// Illustrated-map art for the Gambit campaign — shared by the screen and
// by SSR previews, so what we test is what ships. Parchment palette, layered
// pines with highlights and shadows, round leafy trees, rocks, ridge clusters
// with snow caps, soft clouds and the two keeps.
import { SCENERY_ART } from "./art.generated.js";

export const MP = {
  paper: "#ece5d2", ink: "#2e2a20", trail: "#8a6f4d", trailDim: "#b3a488",
  medal: "#1d2436", ivory: "#e9e2cf", river: "#a9b6c4", liga: "#8e2f39",
  pineDark: "#3f5540", pine: "#4c6247", pineHi: "#66805c",
  oliveDark: "#5a5f3e", olive: "#67704b", oliveHi: "#828a5f",
  mauveDark: "#4e4763", mauve: "#5c5472", mauveHi: "#746b8c",
  leaf: "#6a7d4e", leafHi: "#87996a", trunk: "#5b4a33",
  ridge: "#8b90a1", ridgeDark: "#6f7488", cap: "#f2eee2", rock: "#9b937f", rockDark: "#7d7663",
  shadow: "rgba(46,42,32,.14)",
};

/** deterministic PRNG (mulberry32) so scenery never flickers between renders */
export function mulberry(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Layered pine: shadow, three fringed tiers with a lit left edge, trunk. */
const Pine_impl = ({ x, y, s = 1, tone = "pine", snow = false, k }) => {
  const dark = MP[tone + "Dark"], mid = MP[tone], hi = MP[tone + "Hi"];
  return (
    <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="26" rx="8.5" ry="2.4" fill={MP.shadow} />
      <path d="M-0.9 25 L0.9 25 L0.9 21 L-0.9 21 Z" fill={MP.trunk} />
      <path d="M0 10 L6.2 22 L3.4 21.2 L4.8 24 L-4.8 24 L-3.4 21.2 L-6.2 22 Z" fill={dark} />
      <path d="M0 4.5 L5 15 L2.7 14.3 L3.9 17 L-3.9 17 L-2.7 14.3 L-5 15 Z" fill={mid} />
      <path d="M0 0 L3.9 9 L2 8.4 L3 11 L-3 11 L-2 8.4 L-3.9 9 Z" fill={mid} />
      <path d="M0 0 L-3.9 9 L-2 8.4 L-2.6 10.4 L-0.4 10.4 L-0.4 4 Z" fill={hi} opacity=".8" />
      <path d="M-0.4 4.5 L-5 15 L-2.7 14.3 L-3.3 16.4 L-0.4 16.4 Z" fill={hi} opacity=".55" />
      {snow && <>
        <path d="M0 0 L2.6 6 L-2.6 6 Z" fill="#f2f4f6" />
        <path d="M-3.4 9.6 L3.4 9.6 L4.4 12 L-4.4 12 Z" fill="#f2f4f6" opacity=".92" />
        <path d="M-4.6 16.2 L4.6 16.2 L5.6 18.6 L-5.6 18.6 Z" fill="#f2f4f6" opacity=".85" />
      </>}
    </g>
  );
};

/** Round leafy tree with two-blob crown and a lit side. */
const Leafy_impl = ({ x, y, s = 1, crown = MP.leaf, hi = MP.leafHi, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="24" rx="8" ry="2.3" fill={MP.shadow} />
    <path d="M-1 24 L1 24 L1 17 L-1 17 Z" fill={MP.trunk} />
    <path d="M0 3 C7 2 11 8 9.5 13.5 C13 17 8 22 3 20.5 C-2 23.5 -9 20 -8 14.5 C-12 9.5 -6 2.5 0 3 Z" fill={crown} />
    <path d="M-1 4.5 C-6 4.5 -9.5 9 -7.8 13.6 C-5.4 11 -3 8 -1 4.5 Z" fill={hi} opacity=".85" />
  </g>
);

const Rock_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="6.5" rx="8" ry="2" fill={MP.shadow} />
    <path d="M-7 6 L-4.5 -1 L0 -4 L5 -2 L7 6 Z" fill={MP.rock} />
    <path d="M0 -4 L5 -2 L7 6 L1.5 6 Z" fill={MP.rockDark} opacity=".8" />
  </g>
);

/** A little mountain cluster: back ridge, front ridge, snow caps, foot haze. */
const RidgeCluster_impl = ({ x, y, s = 1, caps = true, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-30 14 L-18 -10 L-10 0 L-2 -16 L8 -2 L14 -12 L30 14 Z" fill={MP.ridgeDark} opacity=".75" />
    <path d="M-24 14 L-12 -4 L-5 3 L4 -10 L12 2 L22 14 Z" fill={MP.ridge} />
    {caps && <path d="M-2 -16 L1 -9.5 L3.6 -12 L6 -6 L1 -8 L-4.6 -10.6 Z" fill={MP.cap} />}
    {caps && <path d="M-18 -10 L-15.6 -5 L-13.4 -7.2 L-11.6 -2.6 L-15 -5.4 L-19.8 -6.4 Z" fill={MP.cap} opacity=".95" />}
    {caps && <path d="M4 -10 L6 -5.4 L8 -7.4 L9.6 -3.4 L5.4 -5.8 L1.6 -6.8 Z" fill={MP.cap} opacity=".9" />}
    <ellipse cx="0" cy="14" rx="30" ry="3" fill={MP.shadow} />
  </g>
);

const Cloud_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity=".5">
    <path d="M-16 6 C-16 0 -10 -2 -6 0 C-5 -6 4 -7 6 -1 C12 -3 16 2 13 6 Z" fill="#ffffff" />
  </g>
);

const Keep_impl = ({ x, y, s = 1, fill, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="17" rx="23" ry="3" fill={MP.shadow} />
    <path d="M-20 16 L-20 -4 L-16 -4 L-16 -8 L-13 -8 L-13 -4 L-9 -4 L-9 -12 L-6 -12 L-6 -16 L-3 -16 L-3 -12 L0 -12 L0 -16 L3 -16 L3 -12 L6 -12 L6 -4 L9 -4 L9 -8 L13 -8 L13 -4 L16 -4 L16 16 Z" fill={fill} />
    <path d="M-1.6 16 L-1.6 6 Q0 4.4 1.6 6 L1.6 16 Z" fill={MP.paper} opacity=".9" />
    <path d="M-4.5 -16 L-4.5 -22 L1.5 -20 L-4.5 -18.2 Z" fill={fill} />
  </g>
);

/** A cottage: walls, roof, chimney with smoke, door, window. */
const Cottage_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="11" rx="12" ry="2.6" fill={MP.shadow} />
    <path d="M-9 11 L-9 0 L9 0 L9 11 Z" fill="#cbb995" />
    <path d="M9 11 L9 0 L4 0 L4 11 Z" fill="#b6a37e" opacity=".7" />
    <path d="M-11.5 0 L0 -9 L11.5 0 Z" fill="#8a5a44" />
    <path d="M0 -9 L11.5 0 L7.5 0 L-1.8 -7.4 Z" fill="#6f4636" opacity=".8" />
    <path d="M4.5 -8.2 L4.5 -13 L7.3 -13 L7.3 -5.8 Z" fill="#7d7663" />
    <path d="M5.9 -14 C4.6 -16 6.8 -16.6 6.2 -18.4" stroke="#b9b2a0" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".8" />
    <path d="M-2 11 L-2 3.5 L2 3.5 L2 11 Z" fill="#5b4a33" />
    <rect x="-7" y="2.5" width="3.4" height="3.4" fill="#3a4358" />
    <rect x="4" y="2.5" width="3.4" height="3.4" fill="#3a4358" opacity=".9" />
  </g>
);

/** The windmill of the Silver Mill: tower, cap, four sails. */
const Mill_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="17" rx="11" ry="2.6" fill={MP.shadow} />
    <path d="M-7 17 L-4.5 -6 L4.5 -6 L7 17 Z" fill="#b6a37e" />
    <path d="M7 17 L4.5 -6 L1.5 -6 L3.4 17 Z" fill="#9d8a67" opacity=".8" />
    <path d="M-6 -6 L0 -12 L6 -6 Z" fill="#8a5a44" />
    <path d="M-1.4 17 L-1.4 10.5 L1.4 10.5 L1.4 17 Z" fill="#5b4a33" />
    <g stroke="#5b4a33" strokeWidth="1.6" strokeLinecap="round">
      <path d="M0 -8.5 L10 -18.5 M2.4 -16.4 L7.6 -10.6" />
      <path d="M0 -8.5 L-10 -18.5 M-7.6 -10.6 L-2.4 -16.4" />
      <path d="M0 -8.5 L10 1.5 M7.6 -6.4 L2.4 -0.6" />
      <path d="M0 -8.5 L-10 1.5 M-2.4 -0.6 L-7.6 -6.4" />
    </g>
    <circle cx="0" cy="-8.5" r="1.6" fill="#5b4a33" />
  </g>
);

/** A little arched bridge where the trail crosses water. */
const Bridge_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-13 4 C-8 -4 8 -4 13 4 L13 6.5 C8 -1 -8 -1 -13 6.5 Z" fill="#8a6f4d" />
    <path d="M-12 3 C-7 -3.5 7 -3.5 12 3" stroke="#6e563a" strokeWidth="1.2" fill="none" />
    <path d="M-9.5 1 L-9.5 -3 M-4.8 -0.6 L-4.8 -4.4 M0 -1.2 L0 -5 M4.8 -0.6 L4.8 -4.4 M9.5 1 L9.5 -3" stroke="#6e563a" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M-10.5 -3.4 L10.5 -3.4" stroke="#8a6f4d" strokeWidth="1.6" strokeLinecap="round" />
  </g>
);

/** A tilled field patch: soft rounded plot with furrow lines. */
const Field_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity=".85">
    <ellipse cx="0" cy="0" rx="22" ry="9" fill="#cdb984" />
    <path d="M-17 -4 L17 -4 M-19 0 L19 0 M-17 4 L17 4" stroke="#b5a06c" strokeWidth="1.6" strokeLinecap="round" />
  </g>
);

const Boat_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-7 0 C-4 3 4 3 7 0 L5.5 -1.2 L-5.5 -1.2 Z" fill="#5b4a33" />
    <path d="M0 -1.2 L0 -9 M0 -9 L4.6 -3.2 L0.6 -3.2" stroke="#5b4a33" strokeWidth="1.1" fill="#efe9da" />
  </g>
);

const Birds_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} stroke={MP.ink} strokeWidth="1.1" fill="none" strokeLinecap="round" opacity=".55">
    <path d="M-8 0 C-6.5 -2 -5 -2 -3.5 0 C-2 -2 -0.5 -2 1 0" />
    <path d="M4 -4 C5.2 -5.6 6.4 -5.6 7.6 -4 C8.8 -5.6 10 -5.6 11.2 -4" />
  </g>
);

// ── shared geometry + scenery builder (screen and previews use the same) ─────
export const GEO = (() => {
  const STEP = 104, LANE = 82, LEFT = 150, RIGHT = 190, TOPPAD = 118, BOTPAD = 62, MAXROW = 14;
  const WMAP = LEFT + MAXROW * STEP + RIGHT, HMAP = TOPPAD + 5 * LANE + BOTPAD;
  return { STEP, LANE, LEFT, RIGHT, TOPPAD, BOTPAD, MAXROW, WMAP, HMAP,
    nx: (n) => LEFT + n.row * STEP, ny: (n) => TOPPAD + n.col * LANE + LANE / 2 };
})();

/** Deterministic full scenery for the campaign map. `nodes` are medallion
 *  centers to keep clear; `millAt` marks the Silver Mill. */
export function buildCampaignScenery(nodes, millAt, th = LEAGUE_THEMES[2]) {
  const { WMAP, HMAP, TOPPAD, LEFT, STEP, LANE } = GEO;
  const r = mulberry(20260704);
  const clear = (x, y, m = 56) => nodes.every((p) => Math.abs(p.x - x) > m || Math.abs(p.y - y) > m)
    && (!millAt || Math.abs(millAt.x - x) > 46 || Math.abs(millAt.y - y) > 46);
  const scatter = (count, tries, gen) => {
    const out = []; let g = 0;
    while (out.length < count && g++ < tries) { const it = gen(); if (it) out.push(it); }
    return out;
  };
  const cottages = scatter(th.settle ? 7 : 0, 400, () => {
    const x = LEFT - 40 + r() * (WMAP * 0.72), y = TOPPAD + 4 + r() * (HMAP - TOPPAD - 78);
    return clear(x, y, 62) ? { x, y, s: 0.85 + r() * 0.45 } : null;
  });
  const fields = cottages.slice(0, 4).map((c, i) => ({
    x: c.x + (i % 2 ? 34 : -36), y: c.y + 16 + r() * 6, s: 0.8 + r() * 0.4 }));
  const treeGen = (smin, smax) => () => {
    const x = 20 + r() * (WMAP - 40), y = TOPPAD - 26 + r() * (HMAP - TOPPAD - 30);
    if (!clear(x, y)) return null;
    if (cottages.some((c) => Math.abs(c.x - x) < 34 && Math.abs(c.y - y) < 34)) return null;
    const f = x / WMAP;
    const tone = th.tones[f < 0.34 ? 0 : f < 0.68 ? 1 : 2];
    return { x, y, s: smin + r() * (smax - smin), tone, snow: !!th.snow };
  };
  const farPines = scatter(th.far ?? 0, 1700, treeGen(0.45, 0.7));   // distant tree line fills the gaps
  // REAL woods: most trees grow in groves around shared centers — with a dark
  // forest-floor blob underneath, each cluster reads as one mystical wood the
  // trail cuts through, instead of lonely trees on a green lawn.
  const groveCenters = scatter(Math.max(0, Math.round((th.pines ?? 0) / 22)), 900, () => {
    const x = 40 + r() * (WMAP - 80), y = TOPPAD - 10 + r() * (HMAP - TOPPAD - 40);
    return clear(x, y, 66) ? { x, y, rx: 46 + r() * 46, ry: 20 + r() * 16 } : null;
  });
  const floors = groveCenters.map((g) => ({ ...g, o: 0.16 + r() * 0.08 }));
  const pines = [];
  const gen = treeGen(0.8, 1.65);
  for (const g of groveCenters) {
    const n = 12 + Math.floor(r() * 10);
    for (let i = 0; i < n && pines.length < (th.pines ?? 0); i++) {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.6);
      const x = g.x + Math.cos(a) * g.rx * d, y = g.y + Math.sin(a) * g.ry * d + 4;
      if (!clear(x, y, 34)) continue;
      const t = gen(); if (!t) continue;
      pines.push({ ...t, x, y, s: t.s * (1.05 - d * 0.35) });
    }
  }
  // a few loners between the woods keep it organic
  for (const t of scatter(Math.round((th.pines ?? 0) * 0.22), 900, gen)) pines.push(t);
  pines.sort((a, b) => a.y - b.y); // painters order: back rows behind front rows
  const [leafyN, leafyCrown, leafyHi] = th.leafy || [0];
  const leafy = scatter(leafyN, 400, () => {
    const x = 20 + r() * (WMAP * 0.5), y = TOPPAD - 10 + r() * (HMAP - TOPPAD - 40);
    return clear(x, y) ? { x, y, s: 0.8 + r() * 0.6, crown: leafyCrown || undefined, hi: leafyHi || undefined } : null;
  });
  const blossoms = scatter(th.blossoms ?? 0, 400, () => {
    const x = 20 + r() * (WMAP - 60), y = TOPPAD - 10 + r() * (HMAP - TOPPAD - 40);
    return clear(x, y) ? { x, y, s: 0.7 + r() * 0.55, crown: "#e8a8c0", hi: "#f5cede" } : null;
  });
  const rocks = scatter(th.rocks ?? 10, Math.max(300, (th.rocks ?? 10) * 30), () => {
    const x = 30 + r() * (WMAP - 60), y = TOPPAD + r() * (HMAP - TOPPAD - 50);
    return clear(x, y) ? { x, y, s: 0.7 + r() * 0.7 } : null;
  });
  const ridgeBase = [[1.4, 0.35, 0.85], [4.6, 2.5, 1], [6.3, 0.3, 0.9], [8.6, 4.6, 1.05], [10.4, 2.55, 1.1], [12.4, 0.5, 1.25], [13.4, 3.9, 0.95]];
  const ridgeMore = [[2.6, 4.5, 0.9], [3.5, 1.4, 0.8], [7.5, 2.2, 0.95], [9.6, 0.4, 1], [11.5, 4.4, 1.05], [5.5, 4.2, 0.85], [12.9, 2.2, 0.9], [0.6, 2.4, 0.8]];
  const rm = th.ridges ?? 1;
  const ridgeList = rm <= 0 ? [] : rm >= 2 ? [...ridgeBase, ...ridgeMore.slice(0, Math.round((rm - 1) * 5))] : ridgeBase.slice(0, Math.round(ridgeBase.length * rm) || 1);
  const ridges = ridgeList
    .map(([a, b, s]) => ({ x: LEFT + a * STEP, y: TOPPAD + b * LANE, s, caps: th.caps !== false }))
    .filter((m) => nodes.every((n) => Math.abs(n.x - m.x) > 62 || Math.abs(n.y - m.y) > 60));
  const clouds = Array.from({ length: 6 }, (_, i) => ({ x: 140 + i * (WMAP - 280) / 5 + r() * 60, y: 20 + r() * 16, s: 0.9 + r() * 0.7 }));
  const birds = Array.from({ length: th.birds ?? 3 }, () => ({ x: 200 + r() * (WMAP - 400), y: 34 + r() * 22, s: 0.9 + r() * 0.5 }));
  // ── mystic layer ──
  const my = th.mystic || {};
  const mistsBack = scatter(Math.ceil((my.mists ?? 0) * 0.55), 60, () => ({ x: 120 + r() * (WMAP - 240), y: TOPPAD + 30 + r() * (HMAP - TOPPAD - 110), s: 1.05 + r() * 1.0, o: 0.3 + r() * 0.14 }));
  const mistsFront = scatter(Math.floor((my.mists ?? 0) * 0.45), 60, () => ({ x: 120 + r() * (WMAP - 240), y: TOPPAD + 60 + r() * (HMAP - TOPPAD - 130), s: 1.2 + r() * 1.2, o: 0.22 + r() * 0.12 }));
  const wisps = scatter(my.wisps ?? 0, 200, () => {
    const x = WMAP * 0.28 + r() * (WMAP * 0.68), y = TOPPAD + 16 + r() * (HMAP - TOPPAD - 70);
    return clear(x, y, 40) ? { x, y, s: 0.8 + r() * 0.7 } : null;
  });
  const crystals = scatter(my.crystals ?? 0, 200, () => {
    const x = WMAP * 0.64 + r() * (WMAP * 0.33), y = TOPPAD + 8 + r() * (HMAP - TOPPAD - 70);
    return clear(x, y) ? { x, y, s: 0.8 + r() * 0.7 } : null;
  });
  const deadN = th.dead ?? my.dead ?? 0;
  const deadTrees = scatter(deadN, Math.max(260, deadN * 30), () => {
    const wide = (th.dead ?? 0) > 0;
    const x = wide ? 30 + r() * (WMAP - 60) : WMAP * 0.78 + r() * (WMAP * 0.2);
    const y = TOPPAD - 10 + r() * (HMAP - TOPPAD - 50);
    return clear(x, y) ? { x, y, s: 0.8 + r() * 0.6 } : null;
  });
  const stonesAt = { x: WMAP * 0.455, y: TOPPAD + 4.62 * LANE };
  // the north river winds down between chapters II and III
  const rx = LEFT + 7.45 * STEP;
  const river2 = `M${rx + 10} 0 C ${rx - 26} ${HMAP * 0.28}, ${rx + 34} ${HMAP * 0.55}, ${rx - 6} ${HMAP * 0.78} S ${rx + 6} ${HMAP - 30}, ${rx - 12} ${HMAP - 26}`;
  const riverXAt = (y) => { // rough x of river2 at height y (for bridges)
    const t = y / HMAP;
    return rx + 10 + (t < 0.28 ? (t / 0.28) * -22 : t < 0.55 ? -12 + ((t - 0.28) / 0.27) * 30 : t < 0.78 ? 18 + ((t - 0.55) / 0.23) * -34 : -16);
  };
  const cacti = scatter(th.cacti ?? 0, 500, () => {
    const x = 30 + r() * (WMAP - 60), y = TOPPAD + r() * (HMAP - TOPPAD - 50);
    return clear(x, y) ? { x, y, s: 0.8 + r() * 0.7 } : null;
  });
  const dunes = scatter(th.dunes ?? 0, 300, () => {
    const x = 60 + r() * (WMAP - 120), y = TOPPAD + 20 + r() * (HMAP - TOPPAD - 90);
    return clear(x, y, 70) ? { x, y, s: 0.8 + r() * 0.8 } : null;
  });
  const drifts = scatter(th.drifts ?? 0, 300, () => {
    const x = 40 + r() * (WMAP - 80), y = TOPPAD + 14 + r() * (HMAP - TOPPAD - 70);
    return clear(x, y, 64) ? { x, y, s: 0.75 + r() * 0.7 } : null;
  });
  const grass = scatter(th.grass ?? 0, 600, () => {
    const x = 24 + r() * (WMAP - 48), y = TOPPAD + r() * (HMAP - TOPPAD - 40);
    return clear(x, y, 40) ? { x, y, s: 0.9 + r() * 0.8 } : null;
  });
  const waves = Array.from({ length: th.waves ?? 0 }, () => ({
    x: 40 + r() * (WMAP - 80), y: TOPPAD - 20 + r() * (HMAP - TOPPAD - 20), s: 0.8 + r() * 0.9 }));
  const isles = scatter(th.isles ?? 0, 400, () => {
    const x = 60 + r() * (WMAP - 120), y = TOPPAD + r() * (HMAP - TOPPAD - 60);
    return clear(x, y, 88) ? { x, y, s: 0.5 + r() * 0.5 } : null;
  });
  const oasis = th.oasis ? { x: LEFT + 7.2 * STEP, y: TOPPAD + 3.55 * LANE } : null;
  return { pines, farPines, floors, leafy, blossoms, rocks, ridges, clouds, cottages, fields, birds, river2, riverXAt,
    mistsBack, mistsFront, wisps, crystals, deadTrees, stonesAt: (my.stones ? stonesAt : null), ruin: !!my.ruin,
    cacti, dunes, drifts, grass, waves, isles, oasis };
}

// ── mystic layer ─────────────────────────────────────────────────────────────
/** A soft bank of mist drifting over the ground. */
const Mist_impl = ({ x, y, s = 1, o = 0.32, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx="-26" cy="2" rx="34" ry="6.5" fill="#ffffff" />
    <ellipse cx="14" cy="-2" rx="42" ry="7.5" fill="#ffffff" />
    <ellipse cx="46" cy="3" rx="30" ry="5.5" fill="#ffffff" />
  </g>
);

/** A will-o'-wisp: glowing mote with halo. */
const Wisp_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="0" r="5.4" fill="#e8d28f" opacity=".18" />
    <circle cx="0" cy="0" r="2.6" fill="#eddc9f" opacity=".45" />
    <circle cx="0" cy="0" r="1.15" fill="#f6ecc4" />
  </g>
);

/** A ring of standing stones. */
const StoneCircle_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="26" ry="5" fill={MP.shadow} />
    {[[-20, 4, 5, 11], [-10, -1, 4.6, 13], [1, -3, 5, 14], [12, 0, 4.4, 12], [21, 5, 4.6, 10]].map(([mx, my, w, h], i) => (
      <path key={i} d={`M${mx - w / 2} ${my + h} L${mx - w / 2 + 0.6} ${my} L${mx} ${my - 2.4} L${mx + w / 2 - 0.4} ${my + 0.6} L${mx + w / 2} ${my + h} Z`}
        fill={i % 2 ? MP.rockDark : MP.rock} />
    ))}
  </g>
);

/** Amethyst crystal cluster for the high mystic reaches. */
const Crystal_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="8" rx="9" ry="2.2" fill={MP.shadow} />
    <path d="M-5.5 8 L-7 -2 L-3.5 -6 L-1.5 8 Z" fill="#8a76b8" />
    <path d="M-1.5 8 L-1 -9 L3 -12 L4.5 8 Z" fill="#a892d6" />
    <path d="M3 -12 L4.5 8 L1.6 8 L1.2 -8.4 Z" fill="#7c68aa" opacity=".85" />
    <path d="M4.5 8 L5 -1 L8 -3.6 L8.6 8 Z" fill="#9d89c9" />
  </g>
);

/** A bare, gnarled ghost tree for the ashen approach to the League. */
const DeadTree_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="24" rx="7.5" ry="2.2" fill={MP.shadow} />
    <path d="M-1 24 L-0.4 12 L-5.5 6 L-4.2 5 L-0.2 9.6 L0.2 2 L-3 -2.4 L-1.8 -3.4 L0.6 -0.4 L1.2 -6 L2.6 -6 L2 1.4 L5.4 -1.6 L6.4 -0.4 L2.2 3.6 L1.6 10.4 L6 7 L6.9 8.2 L1.4 13 L1.8 24 Z"
      fill="#5a4a52" />
  </g>
);

/** A crumbled arch for forsaken places. */
const RuinArch_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="13" rx="17" ry="3" fill={MP.shadow} />
    <path d="M-13 13 L-13 -4 C-13 -10 -6 -13 0 -13 C4 -13 8 -11.6 10.6 -9 L8 -6.6 C6 -8.6 3 -9.7 0 -9.7 C-4.6 -9.7 -9.6 -7.4 -9.6 -3.6 L-9.6 13 Z"
      fill={MP.rock} />
    <path d="M6 13 L6 2 L9.4 2 L9.4 13 Z" fill={MP.rockDark} />
    <path d="M12 11 L15.5 9.4 L16.4 13 L12.4 13 Z" fill={MP.rockDark} opacity=".9" />
    <path d="M-13 -1.6 L-9.6 -1.6 M-13 4.6 L-9.6 4.6" stroke={MP.rockDark} strokeWidth="1" opacity=".7" />
  </g>
);

// ── biome pieces for the later leagues ───────────────────────────────────────
const Cactus_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="20" rx="6.5" ry="2" fill={MP.shadow} />
    <path d="M-2 20 L-2 2 C-2 -1 2 -1 2 2 L2 20 Z" fill="#5f7a4a" />
    <path d="M-2 9 L-6.5 9 L-6.5 3.5 C-6.5 1.4 -3.8 1.4 -3.8 3.5 L-3.8 6.4 L-2 6.4 Z" fill="#54703f" />
    <path d="M2 12 L6.5 12 L6.5 6 C6.5 3.9 3.8 3.9 3.8 6 L3.8 9.4 L2 9.4 Z" fill="#54703f" />
    <path d="M0 2 L0 18" stroke="#48603a" strokeWidth="0.9" opacity=".7" />
  </g>
);
const Dune_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 8 C-20 -6 6 -8 34 6 L34 10 L-34 10 Z" fill="#d9b877" />
    <path d="M-34 8 C-18 -3 2 -6 18 -2 C6 0 -10 3 -34 9 Z" fill="#e7cd93" opacity=".9" />
  </g>
);
const Grass_impl = ({ x, y, s = 1, c = "#a99b5e", k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} stroke={c} strokeWidth="1.2" strokeLinecap="round" fill="none">
    <path d="M0 0 C-0.5 -3 -0.5 -5 0 -7 M-2.6 0 C-3.4 -2.4 -3.6 -4 -3.2 -5.6 M2.6 0 C3.4 -2.4 3.6 -4 3.2 -5.6" />
  </g>
);
const SnowDrift_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-22 4 C-14 -4 12 -5 22 3 L22 6 L-22 6 Z" fill="#f4f6f8" />
    <path d="M-22 4 C-12 -2 4 -4 14 -1 C4 0 -8 2 -22 5 Z" fill="#ffffff" opacity=".85" />
  </g>
);
const Palm_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="22" rx="7" ry="2" fill={MP.shadow} />
    <path d="M-1 22 C0 14 1.5 8 4 2 L5.8 2.8 C3.4 8.6 2.2 14.6 1.6 22 Z" fill="#8a6f4d" />
    <path d="M5 2 C10 -1 15 -1 18.5 2 C13.5 1.6 9.5 2.6 6.4 4.6 Z M5 2 C7 -3 10.5 -5.5 15 -5.5 C11 -3 8 -0.8 6 2 Z M4.6 2 C1 -2 -3.6 -3 -8 -1 C-3.4 -0.6 0.4 0.8 3.2 3.4 Z M4.8 1.6 C3.6 -3.4 0.8 -6.6 -3.6 -7.6 C-0.4 -4.6 1.8 -1.6 3 2 Z" fill="#5f8a52" />
    <circle cx="4.2" cy="3.6" r="1.3" fill="#7a5c26" /><circle cx="6.4" cy="4.4" r="1.3" fill="#7a5c26" />
  </g>
);
const Wave_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} stroke="#e8f1f5" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55">
    <path d="M-10 0 C-7 -3 -3 -3 0 0 C3 -3 7 -3 10 0" />
  </g>
);
const Isle_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="4" rx="33" ry="12" fill="#3f6f86" opacity=".5" />
    <ellipse cx="0" cy="0" rx="30" ry="10.5" fill="#e2cf9b" />
    <ellipse cx="-4" cy="-1.5" rx="22" ry="7" fill="#8fae6b" opacity=".85" />
  </g>
);
const Lighthouse_impl = ({ x, y, s = 1, k }) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="18" rx="12" ry="2.6" fill={MP.shadow} />
    <path d="M-6 18 L-3.6 -8 L3.6 -8 L6 18 Z" fill="#e9e2cf" />
    <path d="M-5.2 9 L5.2 9 L5.6 13 L-5.6 13 Z M-4.4 0 L4.4 0 L4.8 4 L-4.8 4 Z" fill="#8e2f39" />
    <path d="M-3.6 -8 L-3.6 -13 L3.6 -13 L3.6 -8 Z" fill="#2e3a50" />
    <path d="M0 -13 L-5 -16.5 L5 -16.5 Z" fill="#8e2f39" />
    <circle cx="0" cy="-10.5" r="1.7" fill="#f2d98c" />
    <path d="M5 -10.5 L14 -6.5 M5 -10.5 L14 -14.5" stroke="#f2d98c" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
  </g>
);

// ── the ten league worlds ─────────────────────────────────────────────────────
// Same journey, ten climates: the four seasons, then up into scree and snow,
// down through badlands, steppe and canyon into the great desert — and, with
// a Captain and a boat, out onto the Endless Sea.
const TONES = {
  spring: ["spring", "spring", "olive"], summer: ["pine", "olive", "mauve"],
  autumn: ["rust", "rust", "olive"], winter: ["winter", "winter", "winter"],
  alpine: ["winter", "pine", "winter"], dry: ["dry", "dry", "dry"],
};
export const LEAGUE_THEMES = [
  null,
  { id: "fruehling", nameDe: "Kronland", bitmap: "kap1", paper: "#e9ecd8", wash: [["0%","#6f9a5c",.3],["45%","#9ab86f",.2],["100%","#7aa06a",.24]], tones: TONES.spring, pines: 120, far: 70, leafy: [14, "#8fbf6f", "#b8dd93"], blossoms: 12, river: "#a9c2cf", mystic: { mists: 4, wisps: 8 }, settle: true, ridges: 1, caps: true, birds: 4 },
  { id: "sommer", nameDe: "Kornmark", bitmap: "kap2", paper: "#ece5d2", wash: [["0%","#5f7a52",.28],["45%","#c9b68a",.24],["100%","#8e2f39",.2]], tones: TONES.summer, pines: 150, far: 85, leafy: [15, null, null], river: "#a9b6c4", mystic: { mists: 6, wisps: 12, crystals: 7, dead: 9, stones: true, ruin: true }, settle: true, ridges: 1, caps: true, birds: 3 },
  { id: "herbst", nameDe: "Eichwald", bitmap: "kap3", paper: "#ecdfc4", wash: [["0%","#a86a2e",.26],["45%","#c98a3a",.22],["100%","#7a3a2a",.26]], tones: TONES.autumn, pines: 130, far: 75, leafy: [18, "#c07a2a", "#e0a54e"], river: "#a9b6c4", mystic: { mists: 8, wisps: 10 }, settle: true, ridges: 1, caps: true, birds: 5 },
  { id: "krummholz", nameDe: "Krummholz", bitmap: "kap4", paper: "#e9e8da", wash: [["0%","#7f9066",.26],["45%","#a8ab84",.2],["100%","#5c6b56",.26]], tones: TONES.alpine, pines: 100, far: 55, leafy: [8, "#8a9a5e", "#b3bd84"], rocks: 22, river: "#b9c6c8", mystic: { mists: 8, wisps: 6 }, settle: true, ridges: 2, caps: true, birds: 3 },
  { id: "winter", nameDe: "Grauwacht", bitmap: "kap5", paper: "#eef1f4", wash: [["0%","#8fa7bd",.22],["45%","#c9d6e2",.18],["100%","#6d84a3",.26]], tones: TONES.winter, snow: true, pines: 130, far: 75, leafy: [0], drifts: 14, river: "#d7e5ee", frozen: true, mystic: { mists: 9, wisps: 8 }, settle: true, ridges: 1.2, caps: true, birds: 2 },
  { id: "hochgebirge", nameDe: "Wolkenjoch", bitmap: "kap6", paper: "#e4e3dc", wash: [["0%","#7d8593",.24],["45%","#9aa2ae",.2],["100%","#5d6675",.28]], tones: TONES.alpine, snow: true, pines: 60, far: 40, leafy: [0], rocks: 34, drifts: 10, river: "#c4d6e0", mystic: { mists: 10 }, settle: false, ridges: 3, caps: true, birds: 2 },
  { id: "steppe", nameDe: "Sattelweite", bitmap: "kap7", paper: "#eadfb8", wash: [["0%","#b09a52",.24],["45%","#c9ae62",.2],["100%","#8a6f3a",.26]], tones: TONES.dry, pines: 0, far: 0, leafy: [8, "#a9964e", "#c7b46a"], dead: 16, grass: 34, rocks: 12, river: "#b7c0b2", mystic: { wisps: 5 }, settle: true, ridges: 0.8, caps: false, birds: 4 },
  { id: "canyon", nameDe: "Aschgrund", bitmap: "kap8", paper: "#e6cdb0", wash: [["0%","#b0603a",.26],["45%","#c97a4a",.22],["100%","#8a3a2a",.3]], tones: TONES.dry, pines: 0, far: 0, leafy: [0], cacti: 10, rocks: 30, dead: 6, river: null, mystic: {}, settle: false, ridges: 2.6, caps: false, birds: 2 },
  { id: "oedland", nameDe: "Die Wunde", bitmap: "kap9", paper: "#e0dbc9", wash: [["0%","#8a7f66",.26],["45%","#a3947a",.2],["100%","#6e6250",.28]], tones: TONES.dry, pines: 0, far: 0, leafy: [0], dead: 18, rocks: 40, river: null, mystic: { mists: 5 }, settle: false, ridges: 2.2, caps: false, birds: 1 },
  { id: "wueste", nameDe: "Sonnenschlund", bitmap: "kap10", paper: "#ecd9ac", wash: [["0%","#d9a95c",.26],["45%","#e8c377",.2],["100%","#b0763a",.3]], tones: TONES.dry, pines: 0, far: 0, leafy: [0], cacti: 16, dunes: 12, rocks: 10, river: null, oasis: true, mystic: {}, settle: false, ridges: 1.2, caps: false, birds: 2 },
  { id: "kueste", nameDe: "Die Küste", bitmap: "kap11", paper: "#dfe4d8", wash: [["0%","#6f8a7a",.26],["45%","#4f7a92",.24],["100%","#2e6a8a",.3]], tones: TONES.summer, pines: 40, far: 30, leafy: [10, "#7fa06a", "#a8c48a"], rocks: 18, waves: 10, river: "#8fb4c4", mystic: { mists: 5 }, settle: true, ridges: 0.8, caps: false, birds: 8 },
  { id: "meer", nameDe: "Endloses Meer", bitmap: "kap12", paper: "#5e93ad", wash: [["0%","#2e6a8a",.4],["45%","#3f7fa0",.3],["100%","#1e4a66",.45]], sea: true, tones: TONES.summer, pines: 0, far: 0, leafy: [0], waves: 26, isles: 6, river: null, mystic: { mists: 6 }, settle: false, ridges: 0, caps: false, birds: 6 },
];
export const themeForLeague = (league) => LEAGUE_THEMES[((Math.max(1, league) - 1) % 12) + 1];

// extra pine tone palettes
Object.assign(MP, {
  springDark: "#4e7a45", spring: "#5d8f52", springHi: "#7cae6d",
  rustDark: "#7a4a2e", rust: "#94582f", rustHi: "#b4753f",
  winterDark: "#2e4a40", winter: "#3a5a4d", winterHi: "#557a68",
  dryDark: "#6e6238", dry: "#847647", dryHi: "#a2925c",
});


// ── registry rendering ───────────────────────────────────────────────────────
// Every scenery piece now lives as an editable file in assets/scenery/<name>.svg
// (linked via data-gg="scenery:<name>"). The wrappers below only position,
// scale and recolor (CSS variables). The *_impl functions above are kept as
// drawing reference — the game no longer calls them.
const Scn = (name, { x, y, s = 1, k, o }, vars = null, extra = null) => (
  <g key={k} transform={`translate(${x} ${y}) scale(${s})`} opacity={o} style={vars || undefined}>
    <g dangerouslySetInnerHTML={{ __html: SCENERY_ART[name] || "" }} />
    {extra}
  </g>
);
export const Pine = (p) => Scn("pine", p, {
  "--c1": MP[(p.tone || "pine") + "Dark"], "--c2": MP[p.tone || "pine"], "--c3": MP[(p.tone || "pine") + "Hi"] },
  p.snow ? <g dangerouslySetInnerHTML={{ __html: SCENERY_ART["pine-snow"] || "" }} /> : null);
export const Leafy = (p) => Scn("leafy", p, { ...(p.crown ? { "--crown": p.crown } : {}), ...(p.hi ? { "--hi": p.hi } : {}) });
export const Rock = (p) => Scn("rock", p);
export const RidgeCluster = (p) => Scn("ridge", p, { "--caps": p.caps === false ? "none" : "inline" });
export const Cloud = (p) => Scn("cloud", p);
export const Keep = (p) => Scn("keep", p, { "--fill": p.fill || MP.medal });
export const Cottage = (p) => Scn("cottage", p);
export const Mill = (p) => Scn("mill", p);
export const Bridge = (p) => Scn("bridge", p);
export const Field = (p) => Scn("field", p);
export const Boat = (p) => Scn("boat", p);
export const Birds = (p) => Scn("birds", p);
export const Mist = (p) => Scn("mist", { ...p, o: p.o ?? 0.32 });
export const Wisp = (p) => Scn("wisp", p);
export const StoneCircle = (p) => Scn("stonecircle", p);
export const Crystal = (p) => Scn("crystal", p);
export const DeadTree = (p) => Scn("deadtree", p);
export const RuinArch = (p) => Scn("ruinarch", p);
export const Cactus = (p) => Scn("cactus", p);
export const Dune = (p) => Scn("dune", p);
export const Grass = (p) => Scn("grass", p, p.c ? { "--c": p.c } : null);
export const SnowDrift = (p) => Scn("snowdrift", p);
export const Palm = (p) => Scn("palm", p);
export const Wave = (p) => Scn("wave", p);
export const Isle = (p) => Scn("isle", p);
export const Lighthouse = (p) => Scn("lighthouse", p);

// ── site glyphs (v0.6): every station is a PLACE now — a hamlet, a keep, a
// toll bridge — drawn small above its medallion so the wanderer can walk INTO
// somewhere instead of standing on a dot. Parchment palette, ink outlines. ──
const SG = { wall: "#efe7d2", wall2: "#e4d9bd", roof: "#8a6f4d", roof2: "#6f5a3e",
  dark: "#3a3427", ink: "#2e2a20", gold: "#c9a45c", sw: 1 };

export function SiteGlyph({ type, width = 46 }) {
  const P = {};
  const g = (() => {
    switch (type) {
      case "keep": return <>
        <path d="M8 28 V14 h6 v3 h4 V8 h-2 V4 h2 v2 h2 V4 h2 v2 h2 V4 h2 v4 h-2 v9 h4 v-3 h6 v14 Z" transform="translate(4,0)" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M22 28 v-6 c0-2 1.2-3 2.8-3 c1.6 0 2.8 1 2.8 3 v6 Z" fill={SG.dark} />
        <path d="M12 14 h2 v-2 h-2 Z M34 14 h2 v-2 h-2 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth=".7" />
        <path d="M25 4 V-1 l5 1.6 L25 2.2" fill={SG.gold} stroke={SG.ink} strokeWidth=".7" strokeLinejoin="round" />
      </>;
      case "tower": return <>
        <path d="M18 28 V9 h-2 V5 h2.4 v2 h2.6 V5 h2.6 v2 h2.6 V5 H29 v4 h-2 v19 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M20.6 28 v-5 c0-1.7 1-2.6 2.4-2.6 c1.4 0 2.4.9 2.4 2.6 v5 Z" fill={SG.dark} />
        <path d="M21.5 13.5 h3 v3 h-3 Z" fill={SG.dark} opacity=".8" />
        <path d="M27 5 V0 l4.6 1.5 L27 3" fill={SG.gold} stroke={SG.ink} strokeWidth=".7" strokeLinejoin="round" />
      </>;
      case "village": return <>
        <path d="M6 28 V19 h11 v9 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M4.5 19.5 L11.5 13 L18.5 19.5 Z" fill={SG.roof} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M9.5 28 v-5 h4 v5 Z" fill={SG.dark} />
        <path d="M22 28 V16 h14 v12 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M20 16.5 L29 9 L38 16.5 Z" fill={SG.roof2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M26.5 28 v-6 h5 v6 Z" fill={SG.dark} />
        <path d="M31 12 v-4 h1.8 v4" fill="none" stroke={SG.ink} strokeWidth=".9" />
      </>;
      case "court": return <>
        <path d="M5 28 V15 h3 v2 h4 v-2 h3 v2 h4 v-2 h3 v2 h4 v-2 h3 v2 h4 v-2 h3 v13 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M18.5 28 v-7 c0-2.6 1.6-4 4.5-4 c2.9 0 4.5 1.4 4.5 4 v7 Z" fill={SG.dark} />
        <path d="M3.5 15.5 V8.5 h6 v7 Z M36.5 15.5 V8.5 h6 v7 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M6.5 8.5 v-3 M39.5 8.5 v-3" stroke={SG.ink} strokeWidth=".9" />
        <path d="M6.5 5.5 h4 l-4 1.8 Z" fill={SG.gold} stroke={SG.ink} strokeWidth=".6" />
      </>;
      case "arena": return <>
        <path d="M5 28 C6 17 14 11 23 11 C32 11 40 17 41 28 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M11 28 v-6 a3 3 0 0 1 6 0 v6 Z M20 28 v-7 a3 3 0 0 1 6 0 v7 Z M29 28 v-6 a3 3 0 0 1 6 0 v6 Z" fill={SG.dark} />
        <path d="M8 17 C13 13.5 18 12.4 23 12.4 C28 12.4 33 13.5 38 17" fill="none" stroke={SG.ink} strokeWidth=".8" opacity=".7" />
      </>;
      case "camp": return <>
        <path d="M8 28 L17 13 L26 28 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M14.5 28 L17 21.5 L19.5 28 Z" fill={SG.dark} />
        <path d="M27 28 L33 18.5 L39 28 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M35 18 V6" stroke={SG.ink} strokeWidth="1" />
        <path d="M35 6 h6.5 l-6.5 3 Z" fill={SG.gold} stroke={SG.ink} strokeWidth=".7" strokeLinejoin="round" />
      </>;
      case "palisade": return <>
        <path d="M6 28 V14 l2.6-3.2 L11.2 14 V28 Z M12.4 28 V14 l2.6-3.2 L17.6 14 V28 Z M28.4 28 V14 l2.6-3.2 L33.6 14 V28 Z M34.8 28 V14 l2.6-3.2 L40 14 V28 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M17.6 15 h10.8" stroke={SG.roof} strokeWidth="2.4" />
        <path d="M19 28 h8" stroke={SG.roof} strokeWidth="1.4" strokeDasharray="1.5 2" opacity=".7" />
      </>;
      case "cave": return <>
        <path d="M5 28 C5.5 17 11 10 21 9 C31 8 39 14 41 24 L41 28 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M15 28 v-8 c0-4 3-6.5 7-6.5 c4 0 7 2.5 7 6.5 v8 Z" fill={SG.dark} />
        <path d="M33 27 a2.6 2 0 0 1 5 0 Z" fill={SG.wall} stroke={SG.ink} strokeWidth=".8" />
        <path d="M10 15 l3 2 M31 10.5 l2.4 2" stroke={SG.ink} strokeWidth=".7" opacity=".6" />
      </>;
      case "bridge": return <>
        <path d="M4 24 h38 v4 h-38 Z" fill={SG.wall} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M12 28 a6 6 0 0 1 10 0 Z M26 28 a6 6 0 0 1 10 0 Z" fill={SG.dark} opacity=".85" />
        <path d="M8 24 V13 h6 v11 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M9.5 13 v-2.6 h3 V13" fill="none" stroke={SG.ink} strokeWidth=".8" />
        <path d="M14 20 L36 14.5" stroke={SG.roof2} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="20" r="1.4" fill={SG.gold} stroke={SG.ink} strokeWidth=".6" />
      </>;
      case "crystal": return <>
        <path d="M8 28 l3-4 5 1 6-2 7 3 5-2 3 4 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M19 25 L16 12 L21 7 L24 25 Z" fill="#dfe6ea" stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M21 7 L21.8 25" stroke="#aebcc6" strokeWidth=".8" />
        <path d="M13 26 L11.5 17.5 L15 14 L17 26 Z M26 25.5 L26 15 L29.5 12 L31 25.5 Z" fill="#cfd9df" stroke={SG.ink} strokeWidth=".9" strokeLinejoin="round" />
        <path d="M15 14 L15.8 26 M29.5 12 L30.2 25.5" stroke="#aebcc6" strokeWidth=".7" />
      </>;
      case "ferry": return <>
        <path d="M5 26.5 h20 M8 26.5 v-4 M14 26.5 v-4 M20 26.5 v-4" stroke={SG.roof2} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M5 22.5 h20" stroke={SG.roof} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M27 25 h13 l-2.5 3.5 h-8 Z" fill={SG.wall2} stroke={SG.ink} strokeWidth={SG.sw} strokeLinejoin="round" />
        <path d="M33 25 V13" stroke={SG.ink} strokeWidth="1" />
        <path d="M33 13.5 c4.5 1 6.5 5 6 10 l-6 -1.2 Z" fill={SG.wall} stroke={SG.ink} strokeWidth=".9" strokeLinejoin="round" />
      </>;
      default: return null;
    }
  })();
  return <svg viewBox="-1 -2 48 31" width={width} height={Math.round(width * 31 / 48)} style={{ display: "block", overflow: "visible" }}>{g}</svg>;
}

/** Which kind of place is this station? Story overrides first, then the map. */
export function siteTypeFor(node) {
  if (!node) return "village";
  if (node.id === "n22") return "keep";
  if (node.id === "z1") return "ferry";
  if (node.id === "z2") return "bridge";
  if (node.id === "w2") return "crystal";
  if (node.gate && (typeof node.gate === "string" || node.gate.item)) return "cave";
  if (node.boss?.pure) return "tower";
  return { courtyard: "court", arena: "arena", skirmish: "camp", gauntlet: "palisade", classic: "village" }[node.map] || "village";
}

// ── the wanderer, painted: soft gold washes instead of hard game-piece lines,
// so he belongs to the artwork he walks through. (The in-match piece is untouched.)
// ── the wanderer — the mark's pawn brought onto the parchment: one bold navy
// contour so he pops off the painted ground, lacquered gold with a hard key
// light, the double collar and navy diamond straight from the logo. Built to
// read at 48px: few shapes, strong silhouette.
export function WandererArt({ size = "100%" }) {
  return (
    <svg viewBox="0 0 48 56" width={size} height={size} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id="ggWndGold" x1=".18" y1=".05" x2=".85" y2="1">
          <stop offset="0" stopColor="#fdf2c8" /><stop offset=".38" stopColor="#e3bd72" />
          <stop offset=".72" stopColor="#b58a3f" /><stop offset="1" stopColor="#6d5222" />
        </linearGradient>
        <linearGradient id="ggWndGoldD" x1=".2" y1="0" x2=".9" y2="1">
          <stop offset="0" stopColor="#e9cf92" /><stop offset=".65" stopColor="#96742f" /><stop offset="1" stopColor="#4a3814" />
        </linearGradient>
        <radialGradient id="ggWndSheen" cx=".32" cy=".26" r=".68">
          <stop offset="0" stopColor="#fffdf0" stopOpacity=".95" /><stop offset=".4" stopColor="#fff7dd" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* one continuous navy contour around every part — the logo's dark ground,
          carried along as an outline */}
      <g stroke="#1a2133" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* stepped double base */}
        <path d="M9.6 46.6 Q24 42.4 38.4 46.6 Q40.4 48.9 39.3 50.9 Q24 54.4 8.7 50.9 Q7.6 48.9 9.6 46.6 Z" fill="url(#ggWndGoldD)" />
        <path d="M12.9 42.6 Q24 39.2 35.1 42.6 Q36.8 44.5 35.8 46.2 Q24 49.2 12.2 46.2 Q11.2 44.5 12.9 42.6 Z" fill="url(#ggWndGold)" />
        {/* tapered body flaring into the skirt */}
        <path d="M19.4 25.2 Q24 26.6 28.6 25.2 Q29.4 34.8 33.4 41.8 Q24 44.8 14.6 41.8 Q18.6 34.8 19.4 25.2 Z" fill="url(#ggWndGold)" />
        {/* double collar */}
        <path d="M15.8 21.6 Q24 18.7 32.2 21.6 Q33.3 22.8 32.4 24 Q24 26.8 15.6 24 Q14.7 22.8 15.8 21.6 Z" fill="url(#ggWndGold)" />
        <path d="M17.3 18.3 Q24 15.9 30.7 18.3 Q31.6 19.3 30.8 20.3 Q24 22.6 17.2 20.3 Q16.4 19.3 17.3 18.3 Z" fill="url(#ggWndGoldD)" />
        {/* head sphere */}
        <circle cx="24" cy="10.4" r="7.4" fill="url(#ggWndGold)" />
      </g>
      {/* right-flank form shadow — the lacquer turn */}
      <path d="M28.6 25.2 Q29.4 34.8 33.4 41.8 Q30.6 42.7 27.7 43.1 Q29.6 34.4 27.1 25.5 Z" fill="#3f2f11" opacity=".34" />
      <path d="M28.2 4.4 a7.4 7.4 0 0 1 0 12 a9.4 9.4 0 0 0 0 -12 Z" fill="#3f2f11" opacity=".3" />
      <path d="M34 47.2 Q37.5 48 39.3 50.9 Q32 52.6 24.6 52.8 Q30.6 51 34 47.2 Z" fill="#3f2f11" opacity=".22" />
      {/* the navy diamond with the four-ray star */}
      <path d="M24 29.4 l3.9 5.9 -3.9 5.9 -3.9 -5.9 Z" fill="#0e1424" stroke="#1a2133" strokeWidth=".6" />
      <path d="M24 31.1 l2.8 4.2 -2.8 4.2 -2.8 -4.2 Z" fill="none" stroke="#e8c97e" strokeWidth=".9" />
      <path d="M24 32.6 l.9 2.1 2 .6 -2 .6 -.9 2.1 -.9 -2.1 -2 -.6 2 -.6 Z" fill="#f9edc4" />
      {/* hard key light: head specular + body streak + base rim */}
      <ellipse cx="21" cy="7.4" rx="2.9" ry="1.9" fill="#fffdf0" opacity=".9" transform="rotate(-28 21 7.4)" />
      <path d="M20.6 26.4 Q19.2 34.6 16.6 40.2" fill="none" stroke="#fdf3d2" strokeWidth="2" strokeOpacity=".6" strokeLinecap="round" />
      <path d="M17.5 19 Q24 16.9 30.5 19" fill="none" stroke="#fff4d0" strokeWidth=".9" strokeOpacity=".55" strokeLinecap="round" />
      <path d="M12 43.6 Q23.8 40.6 30 42.2" fill="none" stroke="#fdf3d2" strokeWidth="1" strokeOpacity=".5" strokeLinecap="round" />
      <circle cx="24" cy="10.4" r="7.4" fill="url(#ggWndSheen)" />
    </svg>
  );
}
