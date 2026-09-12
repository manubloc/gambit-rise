// Campaign — a HORIZONTAL illustrated journey, now a full-screen WINDOW onto
import { familyOf } from "../../../core/index.js";
import karteGambit from "../assets/karte-gambit.webp";   /* v1.0.52: Sockel auf die Marke gestaucht */
/* v1.0.86 (Besitzer, zum vierten Mal: "auf der Map immer nur das erste
   Bild"): DIE KARTE KANNTE DEN RANG, NUTZTE IHN ABER NICHT. Der Wanderer
   rechnete gambitTier aus, nahm dann aber stur karteGambit - die Sonder-
   fassung aus v1.0.52, deren Kommentar selbst sagte: "sobald die Rangbilder
   da sind, dasselbe fuer t2-t6 rechnen". Das ist jetzt geschehen: sechs
   Kartenfassungen, je der Rangkoerper auf dem ORIGINALSOCKEL aus v1.0.52,
   damit die Marke weiterhin gedeckt wird und alle sechs auf derselben
   Fusslinie stehen. */
import karteGambitT1 from "../assets/karte-gambit-t1.webp";
import karteGambitT2 from "../assets/karte-gambit-t2.webp";
import karteGambitT3 from "../assets/karte-gambit-t3.webp";
import karteGambitT4 from "../assets/karte-gambit-t4.webp";
import karteGambitT5 from "../assets/karte-gambit-t5.webp";
import karteGambitT6 from "../assets/karte-gambit-t6.webp";
const KARTE_GAMBIT = [karteGambitT1, karteGambitT2, karteGambitT3, karteGambitT4, karteGambitT5, karteGambitT6];
import { klang } from "../klang.js";   /* v0.79: Stationen und Blaetter klingen leise */
// the world: the map IS the screen (100dvh minus the app header), every piece
// of UI floats above it. The Old Watch stands on the left, the crimson LIGA
// keep on the far right; the dotted trail winds through four chapters of
// parchment landscape. The wanderer is the hero — the camera follows him, the
// medallions are waypoints (small), and the node detail lives in a parchment
// panel embedded in the map right where you arrive.
import { useEffect, useMemo, useRef, useState } from "react";
import { CAMPAIGN, nodeById, BRANCHES, campaignTag, mapById, CHARACTERS, CHAPTERS, chapterTitle, itemPrice } from "../../../content/index.js";
import { KapitelIntro, kapitelBildDa } from "../KapitelIntro.jsx";
import { mitHeld } from "../namen.js";   /* v1.0.13: {held} in Erzaehltexten */
import { nodeStatus, nodeInLeague, currentNodeId, nodeBossSpec, leagueRewardMult, advanceLeague, seaAccessible, gateOf, tollCost, effectiveMap, winsNeeded, bossWinsFor, characterLevel, gambitTier } from "../../../meta/index.js";
import { ITEMS, hasItem } from "../../../content/index.js";
import bootUrl from "../assets/wanderer-boot.webp";
import { animAn } from "../anim.js";
import { T } from "../theme.js";
import { Button, Chip } from "../primitives.jsx";
import { GoldShineButton } from "../Gilded.jsx";
import { PieceArt } from "../board/PieceArt.jsx";
import { paintedForPiece, PAINTED, ENEMY_FILTER } from "../board/paintedArt.js";
import { livery } from "../livery.js";
import { ItemIcon } from "../ItemIcon.jsx";
import { ElementIcon, GoldCoin, SkullIc, BladesIc, LockIc, HeartIc, MapPinIc, BackIc, WaveIc, AnchorIc, BoatIc, CheckIc, BoxIc } from "../icons.jsx";
import { StatOrbBadge } from "../board/PieceGlyph.jsx";
import { MAP_BITMAPS12 as MAP_BITMAPS } from "../mapBitmaps12.gen.js";
import { WORLD_MAP, loreText } from "../worldMap.js";
import { useMedia } from "../../App.jsx";
import { voiceFor } from "../../../content/index.js";
import { placeFor } from "../../../meta/index.js";
import { MP, GEO, buildCampaignScenery, themeForLeague, Pine, Leafy, Rock, RidgeCluster, Cloud, Keep, Cottage, Mill, Bridge, Field, Boat, Birds, Mist, Wisp, StoneCircle, Crystal, DeadTree, RuinArch, Cactus, Dune, Grass, SnowDrift, Palm, Wave, Isle, Lighthouse, SiteGlyph, siteTypeFor, WandererArt } from "../mapArt.jsx";

// ── geometry (pixels; shared with previews via mapArt.GEO) ───────────────────
const { STEP, LANE, LEFT, TOPPAD, WMAP, HMAP, nx, ny } = GEO;

// v0.3 map immersion: medallions ~30% smaller (46 → 32), wanderer ~40% larger
// (34×36 → 48×50) — he is the hero, the stations are just waypoints.
const MEDAL = 32, MEDAL_ART = 22, HIT = 44;
// DIE TIEFE DER KARTE: was weiter hinten (oben) liegt, steht kleiner -
// Stationen sacht (86-100%), der Wanderer deutlicher (78-100%).
const tiefeStation = (y, H) => 0.86 + 0.14 * Math.max(0, Math.min(1, y / Math.max(1, H)));
const tiefeWanderer = (y, H) => 0.78 + 0.22 * Math.max(0, Math.min(1, y / Math.max(1, H)));
// parchment palette for the embedded node panel — map-world UI, not app chrome
const PP = { bg: "linear-gradient(170deg, #f4eee0, #ece4cf)", bg2: "#e7dfc9", line: "#c9bfa4",
  ink: MP.ink, dim: "#171310" /* v0.71.10: Fliesstext SCHWARZ - Lesbarkeit (Besitzer) */, chipInk: "#4a4433", green: "#3e7d47" };

const EMPTY_SCENERY = { clouds: [], ridges: [], dunes: [], floors: [], drifts: [], isles: [], mistsBack: [],
  stonesAt: null, ruin: false, crystals: [], rocks: [], grass: [], leafy: [], blossoms: [], cacti: [], fields: [],
  cottages: [], oasis: null, birds: [], farPines: [], pines: [], deadTrees: [], mistsFront: [], waves: [], wisps: [],
  river2: "", riverXAt: () => -999, millAt: { x: -999, y: -999 } };

function useScenery(th) {
  return useMemo(() => {
    if (th.bitmap) return EMPTY_SCENERY; // the painted map IS the scenery
    const n02 = nodeById("n02");
    const millAt = { x: nx(n02) + 44, y: ny(n02) - 52 };
    const sc = buildCampaignScenery(CAMPAIGN.map((n) => ({ x: nx(n), y: ny(n) })), millAt, th);
    return { ...sc, millAt };
  }, [th]);
}

const Swords = ({ c = MP.ivory, size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}><path d="M5 5 L17 17 M19 5 L7 17 M5 5 L8 5 M5 5 L5 8 M19 5 L16 5 M19 5 L19 8 M8.4 15.6 L6 20 M15.6 15.6 L18 20" stroke={c} strokeWidth="1.9" strokeLinecap="round" fill="none" /></svg>
);
const CrownIc = ({ c = "#f2d98c", size = 16 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}><path d="M4 17 L5.2 8.5 L9 12 L12 6.5 L15 12 L18.8 8.5 L20 17 Z" fill={c} /><path d="M5.5 19.5 L18.5 19.5" stroke={c} strokeWidth="2" strokeLinecap="round" /></svg>
);

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const CAM_EASE = "cubic-bezier(.45,.05,.35,1)";

// the name-plate halo borrows each land's own light: spring green, desert
// gold, sea blue ... (indexed by biome 1..10, dark ink stays readable)
// SAMPLED from each painting's open ground (top-luminance band, highlights
// skipped), lifted +12% so the dark ink stays readable on a sheer halo.
const LABEL_TINT = {
  1: "224,208,164",
  2: "178,152,83",
  3: "211,155,82",
  4: "139,150,102",
  5: "220,229,243",
  6: "199,198,194",
  7: "236,196,127",   /* Sattelweite: das alte Steppengold */
  8: "241,155,91",    /* Aschgrund: das alte Canyonrot */
  9: "179,146,104",   /* Die Wunde: das alte Oedlandbraun */
  10: "255,212,127",
  11: "196,214,206",  /* Die Kueste: Gischtgruen */
  12: "228,236,238",  /* Endloses Meer: das alte Meersilber */
};
const labelTint = (league) => LABEL_TINT[((Math.max(1, league) - 1) % 12) + 1] || "248,242,226";

export function CampaignScreen({ profile, dispatch, t, onStart, onBack, onOpenTree }) {
  const en = profile.lang === "en";
  const league = profile.campaign?.league || 1;
  /* v0.98: DER EINSTIEG. Betritt man ein Kapitel zum ERSTEN Mal, geht sein
     Land vollflaechig auf, mit einem Wort dazu; ein Druck fuehrt auf die
     Karte. Danach nie wieder - gemerkt wird das im Profil, damit der
     Einstieg ein Ereignis bleibt und keine Huerde wird. */
  const gesehen = profile?.gesehen?.kapitelIntro || [];
  const [intro, setIntro] = useState(
    () => (kapitelBildDa(league) && !gesehen.includes(league) ? league : null));
  useEffect(() => {
    if (kapitelBildDa(league) && !(profile?.gesehen?.kapitelIntro || []).includes(league)) setIntro(league);
  }, [league]); // eslint-disable-line react-hooks/exhaustive-deps
  const introFertig = () => {
    const alt = profile?.gesehen || {};
    dispatch({ type: "REPLACE", profile: { ...profile,
      gesehen: { ...alt, kapitelIntro: [...(alt.kapitelIntro || []), league] } } });
    setIntro(null);
    /* Der Schirm hat waehrend des Einstiegs nichts messen koennen - erst
       jetzt gibt es einen Kartenbereich. Zwei Anlaeufe, weil der erste noch
       im selben Bild liegt und der Browser die Masse dann erst rechnet. */
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event("resize"));
      setTimeout(() => window.dispatchEvent(new Event("resize")), 120);
    });
  };
  // league selector: look back at worlds already mastered — view-only; the
  // journey itself (status, wanderer, panel) always lives in the CURRENT league
  const [viewLeague, setViewLeague] = useState(league);
  const [world, setWorld] = useState(() => !profile?.notices?.worldSeen);
  // (the traveller now opens the current node's panel on tap — see below)
  useEffect(() => { if (world && !profile?.notices?.worldSeen) dispatch({ type: "SET_NOTICE", key: "worldSeen" }); }, [world]); // the overworld: travel between leagues
  const [worldSel, setWorldSel] = useState(null); // tapped league on the painting
  useEffect(() => { setViewLeague(league); }, [league]);
  // Beim Wechsel des angezeigten Kapitels setzt der Wanderer den Fuss auf
  // dessen Boden: seine Station, wenn sie hier liegt, sonst Station 1.
  useEffect(() => {
    const ziel = platzIm(viewLeague);
    setToken((t) => (t.at === ziel || (nodeById(t.at) && nodeInLeague(nodeById(t.at), viewLeague)) ? t : { at: ziel, moving: false }));
    setSel((v) => (nodeById(v) && nodeInLeague(nodeById(v), viewLeague) ? v : ziel));
  }, [viewLeague]);
  const viewing = viewLeague !== league;
  const th = themeForLeague(viewLeague);
  const bmDef = th.bitmap ? MAP_BITMAPS[th.bitmap] : null; // painted league worlds
  const bm = !!bmDef;
  const nx = (n) => (bm && n?.id && bmDef.pos[n.id]) ? bmDef.pos[n.id][0] : GEO.nx(n);
  const ny = (n) => (bm && n?.id && bmDef.pos[n.id]) ? bmDef.pos[n.id][1] : GEO.ny(n);
  const HM = bm ? bmDef.h : HMAP;
  const mult = leagueRewardMult(league);
  const platzIm = (lg) => {
    const cur = currentNodeId(profile);
    const curN = nodeById(cur);
    if (curN && nodeInLeague(curN, lg)) return cur;
    const erste = CAMPAIGN.find((n) => nodeInLeague(n, lg));
    return erste ? erste.id : cur;
  };
  const [sel, setSel] = useState(() => platzIm(league));
  const [token, setToken] = useState(() => ({ at: platzIm(league), moving: false }));
  const [panelOpen, setPanelOpen] = useState(true);
  const [infoAuf, setInfoAuf] = useState(false);   // v1.0.87: Erklaertext hinter dem (i)
  // free panning: a finger (or mouse) drags the window across the world; the
  // camera resumes following the wanderer on his next step
  const [panOff, setPanOff] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const clickSquelch = useRef(false);
  const walkT = useRef(null);
  const [stride, setStride] = useState({ angle: 0, dir: 1 }); // last travel heading — feeds tilt & trail
  // A champion beaten but not recruited FLEES the map to the east — GameScreen
  // leaves his station id behind; we play the escape once, then only ✓ remains.
  const [fleeing, setFleeing] = useState(null);
  useEffect(() => {
    let fledId = null;
    try { fledId = sessionStorage.getItem("gg:fled"); if (fledId) sessionStorage.removeItem("gg:fled"); } catch {}
    if (!fledId || !nodeById(fledId)?.boss) return;
    setFleeing(fledId);
    const tm = setTimeout(() => setFleeing(null), 1600);
    return () => clearTimeout(tm);
  }, []);
  function walkTo(id) {
    const stT = nodeStatus(profile, id);
    if (id === token.at || stT === "locked" || stT === "hidden") return;
    clearTimeout(walkT.current);
    const from = nodeById(token.at), to = nodeById(id);
    if (from && to) {
      const dx = nx(to) - nx(from), dy = ny(to) - ny(from);
      setStride({ angle: Math.atan2(dy, dx) * 180 / Math.PI, dir: dx >= 0 ? 1 : -1 });
    }
    setToken({ at: id, moving: true });
    setPanOff({ x: 0, y: 0 }); // the camera returns to the wanderer
    /* v0.82 (Besitzerwunsch): der Gambit hoppelt ueber die Karte - man hoert
       ihn: Holz, das ueber Stein rutscht. Leise (Pegel 0,4) und nur beim
       echten Vorruecken, nicht beim blossen Umsehen. */
    try { klang("karteSchritt"); } catch {}
    /* Und wenn der Weg in ein NEUES KAPITEL fuehrt, rollt sich die Karte auf:
       ein ferner Hornruf, sobald er drueben ankommt. */
    const vorher = nodeById(token.at), nachher = nodeById(id);
    const neuesKapitel = vorher && nachher && vorher.league !== nachher.league;
    walkT.current = setTimeout(() => {
      setToken({ at: id, moving: false });
      if (neuesKapitel) { try { klang("kapitel"); } catch {} }
    }, 760);
  }
  const scenery = useScenery(th);
  // the viewport: fills the whole screen below the header; we measure it and
  // fit-scale the map so the parchment always covers it (no letterboxing)
  const vpRef = useRef(null);
  // der Welt-Container bekommt einen eigenen Griff: waehrend des Ziehens
  // schreiben wir seine transform DIREKT, ohne React (s. Pointer-Handler)
  const weltRef = useRef(null);
  const [vp, setVp] = useState({ w: 720, h: 560 });
  useEffect(() => {
    const el = vpRef.current;
    /* v1.0.3, DER VERSATZ NACH DEM EINSTIEG - endlich an der Wurzel. Beim
       ersten Mount gibt der Schirm das INTRO zurueck, vpRef ist leer, und
       dieses return verliess den Effect, BEVOR Observer oder resize-Listener
       hingen. Deps waren [] - er lief nie wieder. Die zwei kuenstlichen
       resize-Events aus v1.0.2 verpufften an Listenern, die es nicht gab;
       vp blieb beim Startwert 720x560. Am Telefon (390 breit) heisst das:
       frameX = (720-366)/2 = 177 px nach RECHTS, frameH aus 560 statt ~850
       = Karte klebt OBEN. Jetzt haengt der Effect an [intro]: schliesst der
       Einstieg, laeuft er erneut - diesmal mit echtem Element. */
    if (!el) return;
    const measure = () => { const w = el.clientWidth, h = el.clientHeight; if (w > 0 && h > 0) setVp({ w, h }); };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    window.addEventListener("resize", measure);
    return () => { ro?.disconnect(); window.removeEventListener("resize", measure); };
  }, [intro]);
  const cur = currentNodeId(profile);
  const node = nodeById(sel);
  const status = nodeStatus(profile, sel);
  const boss = node?.boss ? nodeBossSpec(node, league) : null;
  const unlockCh = node?.boss?.piece ? CHARACTERS[node.boss.piece] : null;
  const needWins = winsNeeded(node, league);               // stubborn champions demand several victories
  const haveWins = unlockCh ? Math.min(needWins, bossWinsFor(profile, unlockCh.id)) : 0;
  const canRecruit = !!unlockCh && haveWins + 1 >= needWins;  // the NEXT win seals it
  const known = unlockCh ? (profile.campaign?.unlocked || []).includes(unlockCh.id) : true;
  const golden = !!unlockCh && known;                      // redeemed: only a recruited champion wears gold
  // a station stays OPEN only while a figure still stands there: either the
  // duel is yet to be won, or your OWN recruited champion holds the post —
  // then every rematch is a friendly (a little gold & XP). Fled champions
  // and slain monsters close their station for this league.
  const friendly = status === "cleared" && ((!!unlockCh && known) || sel === "n22");
  const closed = status === "cleared" && !friendly && profile.pausedMatch?.nodeId !== sel;
  const unlockedSet = useMemo(() => new Set(profile.campaign?.unlocked || []), [profile]);
  // who has actually been FACED on a board — a piece by its kind, a monster by
  // "X:"+id. Until then a node keeps its figure hidden: an empty post, a name
  // to earn, no silhouette to spoil what waits.
  const facedSet = useMemo(() => new Set(profile.campaign?.faced || []), [profile]);
  const facedNode = (n) => {
    // STRICT per-station secrecy: whether a figure waits here stays unknown
    // until you have PLAYED at this very station in this league (win or
    // lose) — even a champion of your own court or a monster met elsewhere.
    if (!n?.boss) return true;                       // plain stations: nothing to hide
    if (nodeStatus(profile, n.id) === "cleared") return true; // beaten HERE: of course shown
    return facedSet.has(n.id);
  };
  const edges = useMemo(() => CAMPAIGN.flatMap((a) => a.next.map((tid) => ({ a, b: nodeById(tid) }))), []);

  // camera target = the Grand Gambit's position (he leads, the map follows)
  const camNode = nodeById(token.at) || nodeById(cur);
  const wide = useMedia("(min-width: 900px)");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // the world lives inside a rounded frame; letterbox bars stay dark chrome
  // the frame is FIXED: even margins top and bottom (the dock gets its room on
  // phones); the painting scales and pans INSIDE this steady window
  const padTop = 12;
  // The window matches the MENU on every screen. On desktop that is the header
  // bar and the content column (max 1020, 18px gutters); on phones it is the
  // bottom dock (max 536, 12px gutters).
  const dockPad = (typeof innerWidth !== "undefined" && innerWidth < 900) ? 20 : 16;
  const menuW = wide ? Math.min(vp.w, 1020)
    : Math.min((typeof innerWidth !== "undefined" ? innerWidth : vp.w) - 24, 536);
  const frameW = Math.min(vp.w, menuW);
  const frameH = Math.max(220, vp.h - padTop - dockPad);
  // The painting COVERS the frame at every size — scaled by whichever edge
  // needs more, never less. Rendering it smaller (as the desktop branch once
  // did) left bare backdrop inside the rounded window. Waypoints and wanderers
  // scale with it.
  const zf = Math.max(frameH / HM, frameW / WMAP) * 1.02;
  const frameX = Math.round((vp.w - frameW) / 2);
  /* v0.83: wo genau beginnt der Kartenbereich im Schirm? Die Weltkarte ist
     ein Vollbild-Overlay und rechnet in Schirmkoordinaten - die Kapitelkarte
     dagegen in ihren eigenen. Damit beide EXAKT denselben Kasten belegen,
     merken wir uns die Lage des Kartenbereichs. */
  const [vpTop, setVpTop] = useState(0);
  const [vpLeft, setVpLeft] = useState(0);
  useEffect(() => {
    const messen = () => {
      const el = vpRef.current; if (!el) return;
      const k = el.getBoundingClientRect();
      setVpTop(Math.round(k.top)); setVpLeft(Math.round(k.left));
    };
    messen();
    window.addEventListener("resize", messen);
    const iv = setInterval(messen, 900);
    return () => { window.removeEventListener("resize", messen); clearInterval(iv); };
  }, [intro]); /* v1.0.3: wie beim vp-Effect - nach dem Einstieg neu messen,
                  statt auf das 900-ms-Intervall zu warten. */
  const frameY = padTop; // pinned: same breath above as below
  const camMaxX = Math.max(0, WMAP * zf - frameW), camMaxY = Math.max(0, HM * zf - frameH);
  const camX = clamp((viewing ? 0 : nx(camNode) * zf - frameW * 0.46) + panOff.x, 0, camMaxX);
  const camY = clamp((viewing ? camMaxY * 0.5 : ny(camNode) * zf - frameH * 0.5) + panOff.y, 0, camMaxY);
  // the fog band now floats OVER the top of the map (map itself stays put and
  // fills the frame), so no vertical offset is needed.
  const topInset = 0;
  // fog of war: everything past the frontline stays a blurred rumour until
  // the league's end boss falls — the map never spoils the road ahead
  const frontierX = useMemo(() => {
    let fx = 0;
    for (const n of CAMPAIGN) {
      const st = nodeStatus(profile, n.id);
      if (st === "available" || st === "cleared" || st === "gated") fx = Math.max(fx, nx(n));
    }
    return fx + STEP * 3.4; // the next 4-5 stations stay visible before the dark
  }, [profile]);

  // ── the embedded node panel: parchment overlay near the selected medallion,
  //    projected into viewport coords so text never scales with zoom ─────────
  const seaLock = !viewing && th.sea && !seaAccessible(profile);
  const breit = frameW >= 760;
  // DESKTOP (Besitzer, v0.65): das Popup steht in VOLLER Groesse - breiter,
  // rechts unten - und weicht nach links aus, wenn es den Gambit deckte.
  const panelW = Math.min(breit ? 400 : 352, frameW - 28);
  let panelLeft = 14;
  // DER GAMBIT BLEIBT SICHTBAR: das Panel erscheint auf der Seite, auf der
  // er NICHT steht. Zwei Lehren aus v0.37.1: (1) top braucht frameY, sonst
  // schiesst das Panel UEBER die Karte hinaus; (2) die Seite darf nur von der
  // ZIEL-Kameralage abhaengen (ohne panOff), sonst springt das Panel bei
  // jedem Wisch um und die Karte flackert.
  const tokenNode = nodeById(token.at);
  const camYZiel = clamp(ny(camNode) * zf - frameH * 0.5, 0, camMaxY);
  const tokenScreenY = tokenNode ? ny(tokenNode) * zf - camYZiel : frameH * 0.5;
  // Oben NUR, wenn dort nach Abzug der Knopfleiste wirklich Platz bleibt -
  // sonst schob sich das Panel unter Atlas- und Kapitelknopf und verdeckte sie.
  // Steht die Station im Licht - oder schluckt der Nebel sie noch? Marken
  // duerfen nur zeigen, was man ohnehin sieht.
  const lichtFront = (() => {
    const erreicht = CAMPAIGN.filter((n) => nodeInLeague(n, viewLeague))
      .filter((n) => { const st = nodeStatus(profile, n.id); return st === "cleared" || st === "available"; })
      .map((n) => ny(n));
    return erreicht.length ? Math.min(...erreicht) : HM;
  })();
  const imLicht = (n) => viewing || !bm || ny(n) >= lichtFront - 120;
  const LEISTE = 12 + 40 + 10;   // Abstand + Knopfhoehe + Luft darunter
  const panelOben = tokenScreenY > frameH * 0.52 && (tokenScreenY - 82 - 24 - LEISTE) >= 190;
  const tokenScreenX = tokenNode ? nx(tokenNode) * zf - camX : frameW * 0.5;
  if (breit) {
    const deckt = tokenScreenX > frameW - panelW - 56 &&
      (panelOben ? tokenScreenY < frameH * 0.55 : tokenScreenY > frameH * 0.42);
    panelLeft = deckt ? 14 : frameW - panelW - 14;
  }
  /* v1.0.98 (Besitzer: "ich moechte immer, dass das Popup komplett dargestellt
     wird - in dem Moment, wo es groesser als ein Drittel der Flaeche ist,
     richte es mittig aus und stelle es komplett dar, ohne scrollen"): DREI
     LAGEN STATT ZWEI. Oben und unten bleiben, solange der Platz neben dem
     Wanderer wirklich reicht; sonst tritt die MITTE ein - dort steht das
     Fenster zentriert und nimmt bis zu 86 % der Hoehe, also praktisch alles,
     was es braucht. Ein Bossfenster mit Gemaelde und Geschichte passte in die
     alten Fenster nie: es blieb ein Stummel mit Bildlauf, und der Besitzer
     musste am Bild vorbeiscrollen. Die Schwelle ist gemessen, nicht geraten:
     unter 300 px Platz kann keine Bosskarte (Bild 160 + Text + Knopf) stehen. */
  const platzOben = tokenScreenY - 82 - 24 - LEISTE;
  const platzUnten = frameH - tokenScreenY - 24 - dockPad - 16;
  const platz = panelOben ? platzOben : platzUnten;
  const MINDEST = 300;
  const mittig = platz < MINDEST;
  const panelPos = mittig
    ? { top: "50%", transform: "translateY(-50%)", maxHeight: Math.round(frameH * 0.86), overflowY: "auto" }
    : panelOben
      ? { top: frameY + LEISTE, maxHeight: Math.max(180, platzOben), overflowY: "auto" }
      : { bottom: dockPad + 14, maxHeight: Math.max(180, platzUnten), overflowY: "auto" };
  const showPanel = panelOpen && !viewing && !!node && !token.moving && !seaLock;

  /* Der Einstieg liegt vor dem ganzen Schirm - erst das Land, dann die Karte. */
  if (intro) {
    const wt = themeForLeague(intro);
    const lore = loreText(intro, en, profile?.name);   /* v1.0.13: die Chronik spricht den Helden an */
    return <KapitelIntro liga={intro} titel={en ? wt.nameEn : wt.nameDe}
      text={lore} onWeiter={introFertig} />;
  }

  return (
    <div style={{ position: "relative", overflow: "hidden", flex: "1 1 auto", minHeight: 0, height: "100%" }}>
      {/* the wanderer's window onto the world — a rounded frame; whatever the
          screen shape, chrome stays dark and every control lives INSIDE */}
      <div ref={vpRef} style={{ position: "absolute", inset: 0 }}>
      {/* nichts hier - der Nebel wohnt im transformierten Kartenraum unten */}
      {/* the painted frame: the league's rim colour running light-to-dark
          around the window — the map hangs like a canvas over the chrome */}
      <div aria-hidden style={{ position: "absolute", left: frameX - 3, top: frameY - 3,
        width: frameW + 6, height: frameH + 6, borderRadius: Math.min(24, frameW / 12),
        // OBEN WIE UNTEN (Besitzer, v0.65): der Rahmen lief oben getoent
        // (labelTint) und unten dunkel - der "seltsame Rand oben". Jetzt
        // traegt er ringsum dasselbe ruhige Dunkel wie an der Unterkante.
        background: "rgba(9,11,16,.95)",
        // die Karte traegt die Riss-Kontur des Hauses
        // v0.71.14 (Besitzer): die LEUCHTENDE LILA KONTUR kommt zurueck - sie
        // gefiel ihm; nur der breite Nebelschein bleibt fort.
        border: "1px solid rgba(167,139,250,.62)",
        boxShadow: "0 10px 34px rgba(0,0,0,.5), 0 0 12px rgba(124,58,237,.28)",
        pointerEvents: "none" }} />
      <div
        onPointerDown={(e) => { if (seaLock) return;
          dragRef.current = { id: e.pointerId, px: e.clientX, py: e.clientY, ox: panOff.x, oy: panOff.y, moved: false, el: e.currentTarget }; }}
        onPointerMove={(e) => { const d = dragRef.current; if (!d) return;
          const dx = e.clientX - d.px, dy = e.clientY - d.py;
          if (!d.moved && Math.hypot(dx, dy) > 6) { d.moved = true; clickSquelch.current = true; setDragging(true); try { d.el.setPointerCapture(d.id); } catch {} }
          if (d.moved) {
            // GEMESSEN (messe-fluss, v0.45): setPanOff pro Pointer-Move rendert
            // den ganzen Weltbaum neu - 48,4 ms mittlerer Frame, 77/92 Frames
            // verloren. Waehrend des Zugs schreiben wir die transform DIREKT
            // ans DOM; React erfaehrt die Lage erst beim Loslassen.
            const pan = { x: d.ox - dx, y: d.oy - dy };
            d.pan = pan;
            const zielX = clamp((viewing ? 0 : nx(camNode) * zf - frameW * 0.46) + pan.x, 0, camMaxX);
            const zielY = clamp((viewing ? camMaxY * 0.5 : ny(camNode) * zf - frameH * 0.5) + pan.y, 0, camMaxY);
            if (weltRef.current) weltRef.current.style.transform = `translate3d(${-zielX}px, ${-zielY}px, 0) scale(${zf})`;
          } }}
        onPointerUp={() => { const d = dragRef.current; dragRef.current = null; setDragging(false);
          if (d?.pan) setPanOff(d.pan); }}
        onPointerCancel={() => { const d = dragRef.current; dragRef.current = null; setDragging(false);
          if (d?.pan) setPanOff(d.pan); }}
        onClickCapture={(e) => { if (clickSquelch.current) { clickSquelch.current = false; e.preventDefault(); e.stopPropagation(); } }}
        className={dragging ? "gg-karte-zieht" : undefined}
        style={{ position: "absolute", left: frameX, top: frameY, width: frameW, height: frameH,
        overflow: "hidden", borderRadius: Math.min(22, frameW / 12), background: bm ? "#000" : th.paper,
        boxShadow: "inset 0 0 26px rgba(8,10,14,.45)", touchAction: "none",
        ...(seaLock ? { pointerEvents: "none", filter: "saturate(.55) brightness(.8)" } : {}) }}>
        {/* THE SOFT TOP: the map's own upper edge, blown up and blurred, fills
            the band above where the painting now sits — so the top fades into a
            gradient in the map's OWN colours. Over it drift CLOUDS whose bright-
            ness follows the world: bright meadow air in league 1, near-white in
            summer, then darker and heavier the deeper the road runs. */}
        {bm && bmDef && (() => {
          // cloud tint by world (1..10, repeating). Summer (2) is brightest, then
          // it darkens with the seasons and the wastes beyond.
          const world = ((Math.max(1, viewLeague) - 1) % 12) + 1;
          const CLOUD = {
            1: "236,232,222", 2: "255,255,255", 3: "214,198,176", 4: "222,228,236",
            5: "198,204,214", 6: "150,132,112", 7: "170,158,132", 8: "150,138,120",
            9: "196,168,120", 10: "150,168,186",
          }[world] || "220,214,200";
          const CLOUD_OP = { 1: 0.72, 2: 0.9, 3: 0.6, 4: 0.62, 5: 0.54, 6: 0.4, 7: 0.46, 8: 0.36, 9: 0.5, 10: 0.48 }[world] ?? 0.55;
          const rad = Math.min(22, frameW / 12);
          // fade the WHOLE band out toward its lower edge — a long, gentle mask so
          // the clouds dissolve into the map with no hard cut whatsoever.
          const himmelSicht = Math.max(0, Math.min(1, 1 - camY / Math.max(1, HM * zf * 0.16)));
          const softMask = "linear-gradient(180deg, #000 0%, #000 30%, rgba(0,0,0,.7) 62%, rgba(0,0,0,.28) 84%, transparent 100%)";
          // WOLKEN NUR AM HIMMEL DES BILDES (Besitzer, v0.65): steht die
          // Kamera nicht am oberen Kartenrand, gibt es nichts zu sehen - die
          // Schicht blendet mit dem Hinabziehen aus und erlischt ganz.
          return (
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", zIndex: 5,
            pointerEvents: "none", overflow: "hidden", borderRadius: `${rad}px ${rad}px 0 0`,
            opacity: himmelSicht, display: himmelSicht <= 0.02 ? "none" : undefined,
            WebkitMaskImage: softMask, maskImage: softMask }}>
            {/* the SKY is the base: a full wash of the world's weather — blue +
                sun in green worlds, dusk/purple in the deep. Clouds drift over
                it; the gaps between them reveal this sky. */}
            {/* sky base removed — fully transparent now, no blue wash; only the
                faint terrain hint and the drifting clouds remain over the map */}
            <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
            {/* the faintest hint of terrain colour at the very bottom edge, UNDER
                the sky so it never tints the blue */}
{/* der gespiegelte Blur-Streifen ist fort - er war der seltsame Oberrand. */}
            <div style={{ position: "absolute", inset: 0, background: "transparent" }} />
            {/* drifting cloud PUFFS with real gaps — the sky (blue/sun/dusk)
                stays visible between and behind them. Airy, so blue peeks through. */}
            <div style={{ position: "absolute", inset: "-10% -12%", filter: "blur(10px)",
              opacity: (CLOUD_OP + 0.14) * 0.52, animation: "ggCloudA 31s ease-in-out infinite alternate, ggCloudBreath 14s ease-in-out infinite",
              background: `radial-gradient(20% 30% at 16% 30%, rgba(${CLOUD},.92), transparent 60%), radial-gradient(24% 34% at 54% 20%, rgba(${CLOUD},.78), transparent 62%), radial-gradient(18% 28% at 84% 34%, rgba(${CLOUD},.85), transparent 60%)` }} />
            <div style={{ position: "absolute", inset: "-10% -12%", filter: "blur(12px)",
              opacity: (CLOUD_OP) * 0.5, animation: "ggCloudB 43s ease-in-out infinite alternate, ggCloudBreath 19s ease-in-out infinite",
              background: `radial-gradient(22% 32% at 32% 24%, rgba(${CLOUD},.8), transparent 62%), radial-gradient(20% 30% at 72% 18%, rgba(${CLOUD},.7), transparent 64%)` }} />
            <div style={{ position: "absolute", inset: "-10% -12%", filter: "blur(13px)",
              opacity: (CLOUD_OP + 0.1) * 0.46, animation: "ggCloudC 54s ease-in-out infinite alternate",
              background: `radial-gradient(26% 36% at 46% 16%, rgba(${CLOUD},.55), transparent 66%)` }} />
            <div style={{ position: "absolute", inset: "-10% -12%", filter: "blur(10px)",
              opacity: (CLOUD_OP + 0.08) * 0.46, animation: "ggCloudD 25s ease-in-out infinite alternate, ggCloudBreath 12s ease-in-out infinite",
              background: `radial-gradient(15% 24% at 62% 34%, rgba(${CLOUD},.88), transparent 58%), radial-gradient(13% 22% at 6% 22%, rgba(${CLOUD},.82), transparent 58%)` }} />
          </div>
          );
        })()}
        {/* a gentle dark seat at the very bottom edge so the map meets the dock cleanly */}
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none",
          borderRadius: Math.min(22, frameW / 12),
          background: `radial-gradient(130% 80% at 50% 82%, transparent 60%, rgba(9,11,16,.2) 84%, rgba(7,9,13,.44) 100%)` }} />
        {/* DER NEBEL DER ZUKUNFT liegt als OBERSTE Wetterschicht im Rahmen -
            ueber Karte UND Wolken (Stapel: Karte 2, Wolken 5, Nebel 6,
            Panel 7). Er rechnet die Kartenlage in Schirmprozente um und
            wandert so beim Ziehen exakt mit. Ab knapp ueber der hoechsten
            erreichten Station steigt Schwaerze mit Riss-Schwaden auf; das
            Kartenende bleibt verborgen, der Nebel weicht mit dem Fortschritt
            und faellt im Rueckblick ganz. */}
        {bm && !viewing && (() => {
          const erreicht = CAMPAIGN.filter((n) => nodeInLeague(n, viewLeague))
            .filter((n) => { const st = nodeStatus(profile, n.id); return st === "cleared" || st === "available"; })
            .map((n) => ny(n));
          const front = erreicht.length ? Math.min(...erreicht) : HM * 0.8;
          const sp = (v) => Math.max(-30, Math.min(130, (v * zf - camY) / frameH * 100)).toFixed(2) + "%";
          const klar = front + 60, dicht = front - 480;
          return <>
            <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
              borderRadius: Math.min(22, frameW / 12), overflow: "hidden",
              background: `linear-gradient(180deg, #000 0%, #000 ${sp(dicht)}, rgba(2,1,6,.96) ${sp(dicht + 120)}, rgba(8,5,18,.55) ${sp(front - 140)}, transparent ${sp(klar)})` }} />
{/* v0.71.9 (Besitzer): der lila Schweif am Kartenhimmel ist fort - einfach schwarz. */}
          </>;
        })()}
        <div ref={weltRef} style={{ position: "relative", width: WMAP, height: HM, transformOrigin: "0 0", zIndex: 2,
          transform: `translate3d(${-camX}px, ${-camY}px, 0) scale(${zf})`, willChange: "transform",
          transition: dragging ? "none" : `transform .72s ${CAM_EASE}` }}>
          <svg width={WMAP} height={HM} viewBox={`0 0 ${WMAP} ${HM}`} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0">
                {th.wash.map(([off, col, op], i) => <stop key={i} offset={off} stopColor={col} stopOpacity={op} />)}
              </linearGradient>
            </defs>
            {bm && <image href={bmDef.url} x="0" y="0" width={WMAP} height={HM} preserveAspectRatio="none" />}
            {!bm && <rect width={WMAP} height={HM} fill="url(#wash)" />}
            {/* river along the south + a small lake */}
            {!bm && th.river && <>
              <path d={`M0 ${HM - 34} C ${WMAP * 0.2} ${HM - 52}, ${WMAP * 0.36} ${HM - 16}, ${WMAP * 0.55} ${HM - 34} S ${WMAP * 0.85} ${HM - 18}, ${WMAP} ${HM - 40}`}
                fill="none" stroke={th.river} strokeWidth="10" strokeLinecap="round" opacity={th.frozen ? 0.85 : 0.6}
                strokeDasharray={th.frozen ? "14 6" : "none"} />
              <ellipse cx={WMAP * 0.235} cy={HM - 40} rx="46" ry="13" fill={th.river} opacity={th.frozen ? 0.8 : 0.55} />
            </>}
            {/* chapter dividers */}
            {!bm && CHAPTERS.slice(1).map((c) => {
              const x = LEFT + (c.fromRow - 0.5) * STEP;
              return <path key={"cd" + c.n} d={`M${x} ${TOPPAD - 20} L${x} ${HM - 54}`} stroke={MP.trailDim} strokeWidth="1.4" strokeDasharray="2 7" opacity=".7" />;
            })}
            {/* the north river + crossings */}
            {!bm && th.river && <path d={scenery.river2} fill="none" stroke={th.river} strokeWidth="8" strokeLinecap="round" opacity={th.frozen ? 0.8 : 0.55} strokeDasharray={th.frozen ? "12 6" : "none"} />}
            {scenery.clouds.map((c, i) => Cloud({ ...c, k: "cl" + i }))}
            {scenery.ridges.map((m, i) => RidgeCluster({ ...m, k: "ri" + i }))}
            {scenery.dunes.map((m, i) => Dune({ ...m, k: "du" + i }))}
            {scenery.floors.map((f, i) => <ellipse key={"fl" + i} cx={f.x} cy={f.y + 6} rx={f.rx + 14} ry={f.ry + 7}
              fill={MP.pineDark} opacity={f.o} />)}
            {scenery.drifts.map((m, i) => SnowDrift({ ...m, k: "sd" + i }))}
            {scenery.isles.map((m, i) => Isle({ ...m, k: "is" + i }))}
            {!bm && th.sea && CAMPAIGN.filter((n) => nodeInLeague(n, viewLeague)).map((n, i) => Isle({ x: nx(n), y: ny(n) + 14, s: 1.05, k: "nis" + i }))}
            {scenery.mistsBack.map((m, i) => Mist({ ...m, k: "mb" + i }))}
            {scenery.stonesAt && StoneCircle({ ...scenery.stonesAt, s: 1.05, k: "stones" })}
            {scenery.ruin && RuinArch({ x: nx(nodeById("e1")) - 56, y: ny(nodeById("e1")) + 30, s: 1, k: "ruin" })}
            {scenery.crystals.map((m, i) => Crystal({ ...m, k: "cr" + i }))}
            {scenery.rocks.map((m, i) => Rock({ ...m, k: "ro" + i }))}
            {scenery.grass.map((m, i) => Grass({ ...m, k: "gr" + i }))}
            {scenery.leafy.map((m, i) => Leafy({ ...m, k: "le" + i }))}
            {scenery.blossoms.map((m, i) => Leafy({ ...m, k: "bl" + i }))}
            {scenery.cacti.map((m, i) => Cactus({ ...m, k: "ca" + i }))}
            {th.settle && scenery.fields.map((m, i) => Field({ ...m, k: "fi" + i }))}
            {scenery.cottages.map((m, i) => Cottage({ ...m, k: "co" + i }))}
            {!bm && th.settle && Mill({ ...scenery.millAt, s: 1.05, k: "mill" })}
            {!bm && th.river && !th.sea && Boat({ x: WMAP * 0.235 + 10, y: HM - 42, s: 1, k: "boat" })}
            {scenery.oasis && <>
              <ellipse cx={scenery.oasis.x} cy={scenery.oasis.y + 8} rx="42" ry="12" fill="#7fb3c9" opacity=".8" />
              {Palm({ x: scenery.oasis.x - 30, y: scenery.oasis.y - 10, s: 1, k: "pa1" })}
              {Palm({ x: scenery.oasis.x + 26, y: scenery.oasis.y - 14, s: 0.85, k: "pa2" })}
            </>}
            {scenery.birds.map((m, i) => Birds({ ...m, k: "bi" + i }))}
            {scenery.farPines.map((m, i) => Pine({ ...m, k: "fp" + i }))}
            {scenery.pines.map((m, i) => Pine({ ...m, k: "pi" + i }))}
            {scenery.deadTrees.map((m, i) => DeadTree({ ...m, k: "dt" + i }))}
            {scenery.mistsFront.map((m, i) => Mist({ ...m, k: "mf" + i }))}
            {scenery.waves.map((m, i) => Wave({ ...m, k: "wa" + i }))}
            {scenery.wisps.map((m, i) => Wisp({ ...m, k: "wi" + i }))}
            {!bm && (th.mystic?.wisps || 0) > 0 && [0, 1, 2].map((i) => Wisp({ x: nx(nodeById("n03")) - 34 + i * 30, y: ny(nodeById("n03")) - 40 + (i % 2) * 14, s: 0.9, k: "sw" + i }))}
            {/* dotted trail (procedural leagues only — painted maps have their own roads) */}
            {!bm && edges.map(({ a, b }, i) => {
              const stOf = (id) => (viewing ? "cleared" : nodeStatus(profile, id)); // the look back shows every road walked
              const x1 = nx(a), y1 = ny(a), x2 = nx(b), y2 = ny(b), xm = (x1 + x2) / 2;
              if (stOf(a.id) === "hidden" || stOf(b.id) === "hidden") return null;
              const gated = stOf(b.id) === "gated";
              const done = stOf(a.id) === "cleared" && !gated && stOf(b.id) !== "locked";
              return <path key={"e" + i} d={`M${x1} ${y1} C ${xm} ${y1}, ${xm} ${y2}, ${x2} ${y2}`} fill="none"
                stroke={gated ? "#7a6a94" : done ? MP.trail : MP.trailDim} strokeWidth={gated ? 3.5 : 4.5} strokeLinecap="round"
                strokeDasharray={gated ? "6 6" : "0.5 9.5"} opacity={gated ? 0.5 : done ? 0.95 : 0.62} />;
            })}
            {!bm && th.river && th.settle && [(ny({ col: 0 }) + ny({ col: 2 })) / 2, ny({ col: 2 }), (ny({ col: 4 }) + ny({ col: 2 })) / 2].map((y, i) =>
              Bridge({ x: scenery.riverXAt(y), y, s: 1.05, k: "br" + i }))}
            {!bm && (th.sea ? <>
              {Isle({ x: 62, y: ny({ col: 2 }) + 12, s: 1.15, k: "ki1" })}
              {Lighthouse({ x: 62, y: ny({ col: 2 }) - 4, s: 1.1, k: "k1" })}
            </> : Keep({ x: 62, y: ny({ col: 2 }) - 6, s: 1.15, fill: MP.medal, k: "k1" }))}
            {!bm && (th.sea ? <>
              {Isle({ x: WMAP - 84, y: ny({ col: 2 }) + 16, s: 1.6, k: "ki2" })}
              {Lighthouse({ x: WMAP - 84, y: ny({ col: 2 }) - 8, s: 1.55, k: "k2" })}
            </> : Keep({ x: WMAP - 84, y: ny({ col: 2 }) - 10, s: 1.7, fill: MP.liga, k: "k2" }))}
          </svg>

          {/* Kapitel-Banner auf Karten sind fort (Besitzer, v0.65). */}
          <span aria-hidden style={{ display: "none" }} />
          {/* medallions + labels — small waypoints now; the wanderer is the star */}
          {CAMPAIGN.map((n) => {
            if (!nodeInLeague(n, viewLeague)) return null; // nur das betrachtete Kapitel betritt seine Karte
            const st = viewing ? "available" : nodeStatus(profile, n.id); // a mastered world holds no locks
            const isSel = !viewing && sel === n.id, isCur = !viewing && cur === n.id;
            const pieceCh = n.boss?.piece ? CHARACTERS[n.boss.piece] : null;
            const pure = n.boss?.pure ? nodeBossSpec(n) : null;
            const below = n.col <= 2; // labels toward the free side of the lane
            if (st === "hidden") return null;
            const ringCol = st === "locked" ? "#8d8672" : st === "gated" ? "#a9853f" : st === "cleared" ? "#7c5f3d" : T.gold;
            return (
              <div key={n.id} style={{ position: "absolute", left: nx(n), top: ny(n), transform: `translate(-50%,-50%) scale(${tiefeStation(ny(n), HM)})`, transformOrigin: "center" }}>
                {/* on painted maps every boss stands at his station in person —
                    dark and waiting until beaten, gold once he joined the court;
                    the league finale towers over the road's end */}
                {bm && n.boss && (() => {
                  const spec = nodeBossSpec(n, viewLeague);
                  if (!spec) return null;
                  const faced = viewing || facedNode(n);
                  if (!faced) return null;           // not yet fought: the post stands empty
                  const finale = n.id === "n22";
                  /* v1.1.9 (Besitzer: "die Figuren, die man auf den Maps sieht, da
                     wuerde ich dich bitten, die noch ein bisschen groesser zu machen -
                     die sind zu klein, die sollten schon auch die Groesse haben wie der
                     Grand Gambit, und im besten Falle das Element, auf dem sie stehen,
                     ueberdecken"): GEMESSEN WAR ES DIE HALBE GROESSE. Der Wanderer
                     misst 96 px (mal Kartentiefe), die Stationswesen standen auf 46 -
                     ein Meister sah aus wie eine Spielfigur am Wegrand. Jetzt 84 bzw.
                     104 fuer das Finale, also nah am Gambit, und sie haengen am
                     SELBEN Tiefenfaktor wie er, damit vorn und hinten stimmig bleibt.
                     Dazu ruecken sie tiefer (bottom 12 -> 2) und liegen UEBER der
                     Marke statt dahinter (zIndex 0 -> 4, aber unter dem Wanderer mit
                     5): sie stehen jetzt auf ihrem Medaillon, nicht daneben. */
                  const tief = tiefeWanderer(ny(n), HM);
                  const size = Math.round((finale ? 104 : 84) * tief);
                  const beaten = st === "cleared";
                  const flee = !viewing && fleeing === n.id;
                  // beaten figures leave the map — UNLESS the champion joined
                  // your court: a recruit keeps his post in gold, ready for a
                  // friendly duel; the fled and the slain are gone
                  const joinedHere = n.id === "n22" || (!!n.boss.piece && unlockedSet.has(n.boss.piece));
                  if (beaten && !flee && !joinedHere) return null;
                  const painting = paintedForPiece({ kind: spec.kind, art: spec.art, bossId: spec.bossId });
                  return <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 2,
                    transform: "translateX(-50%)", width: size, height: size, zIndex: flee ? 6 : 4, pointerEvents: "none",
                    animation: flee ? "bossFlee 1.5s ease-in forwards" : "none",
                    opacity: st === "locked" ? 0.55 : 1, filter: st === "locked"
                      ? "grayscale(.65) drop-shadow(0 2px 3px rgba(40,32,16,.3))"
                      : "drop-shadow(0 3px 4px rgba(40,32,16,.42))" }}>
                    {!flee && <div style={{ position: "absolute", left: "50%", bottom: -2, transform: "translateX(-50%)",
                      width: size * 0.62, height: size * 0.16, borderRadius: "50%",
                      background: "radial-gradient(ellipse at center, rgba(46,42,32,.32), transparent 72%)" }} />}
                    {painting
                      ? <img src={painting} alt="" draggable={false} style={{ width: "100%", height: "100%",
                          objectFit: "contain", objectPosition: "bottom",
                          filter: (n.boss.piece ? unlockedSet.has(n.boss.piece) : beaten) ? undefined : ENEMY_FILTER,
                          userSelect: "none", pointerEvents: "none" }} />
                      : <PieceArt kind={spec.kind} art={spec.art} fill="#242d44" rim="#93a0bb" detail="#9aa8c6"
                          accent={spec.accent || T.gold} size="100%" level={1} />}
                  </div>;
                })()}
                {!bm && <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 24, transform: "translateX(-26%)",
                  zIndex: 0, pointerEvents: "none", opacity: st === "locked" ? 0.42 : 0.94,
                  filter: st === "locked" ? "grayscale(.6)" : "none" }}>
                  <SiteGlyph type={siteTypeFor(n)} width={n.id === "n22" ? 54 : 44} />
                </div>}
                <button onClick={() => { try { klang("karteStation"); } catch {} setSel(n.id); setPanelOpen(true); if (!viewing) walkTo(n.id); }}
                  style={{ width: HIT, height: HIT, background: "none", border: "none", padding: 0, cursor: "pointer",
                    position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: st === "locked" ? 0.55 : st === "gated" ? 0.85 : 1 }}>
                  <div style={{ position: "relative", width: MEDAL + 10, height: MEDAL + 9,
                    filter: bm ? "none" : isSel ? `drop-shadow(0 0 5px ${T.gold}aa)` : "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}>
                  {bm && (() => {
                    const glow = st === "cleared" ? "#b8c98a" : st === "gated" ? "#d9a45c" : st === "locked" ? "#8a8474" : "#f2d98c";
                    const on = isCur || isSel;
                    return <div aria-hidden style={{ position: "absolute", left: "50%", bottom: -4, transform: "translateX(-50%)",
                      width: (MEDAL + 10) * (n.id === "n22" ? 2 : 1.55), height: (MEDAL + 10) * (n.id === "n22" ? 1 : 0.8),
                      borderRadius: "50%", pointerEvents: "none",
                      background: `radial-gradient(ellipse at center, ${glow}${on ? "b8" : st === "locked" ? "2e" : "70"} 0%, ${glow}${on ? "66" : "30"} 45%, transparent 72%)`,
                      animation: isCur ? "ggPulse 2.2s ease-in-out infinite" : "none", willChange: isCur ? "transform, opacity" : "auto",
                      transition: "background .4s" }} />;
                  })()}
                  {!bm && <svg viewBox="0 0 44 19" width={MEDAL + 10} height={Math.round((MEDAL + 10) * 19 / 44)}
                    style={{ position: "absolute", left: 0, bottom: 0, display: "block", overflow: "visible" }}>
                    {/* Der Goldring der aktuellen Station steht jetzt STILL:
                        sein ggPulse rasterte das Medaillon-SVG 60x/s neu -
                        SVG-Kinder bekommen keine eigene Schicht. Den Puls
                        traegt die HTML-Marke darueber (eigene Schicht). */}
                    {isCur && <ellipse cx="22" cy="8" rx="21" ry="8.8" fill="none" stroke={T.gold} strokeWidth="1.5"
                      style={{ opacity: 0.55, transformOrigin: "center", transformBox: "fill-box" }} />}
                    <path d="M2.5 8 a19.5 7.2 0 0 0 39 0 l0 3.6 a19.5 7.2 0 0 1 -39 0 Z" fill={MP.medal} fillOpacity=".42" stroke={ringCol} strokeWidth="1" strokeOpacity=".7" />
                    <path d="M2.5 8 a19.5 7.2 0 0 0 39 0 l0 3.6 a19.5 7.2 0 0 1 -39 0 Z" fill="rgba(0,0,0,.14)" />
                    <ellipse cx="22" cy="8" rx="19.5" ry="7.2" fill={MP.medal} fillOpacity=".46" stroke={ringCol} strokeWidth="1.4" strokeOpacity=".85" />
                    <ellipse cx="22" cy="7" rx="14.5" ry="4.6" fill="none" stroke={ringCol} strokeWidth=".7" opacity=".3" />
                  </svg>}
                  {!bm && (() => { const faced = viewing || facedNode(n); return <div style={{ position: "absolute", left: "50%", bottom: 9, transform: "translateX(-50%)",
                    width: MEDAL_ART + 2, height: MEDAL_ART + 2,
                    filter: faced && pieceCh && !unlockedSet.has(pieceCh.id) ? `${ENEMY_FILTER} drop-shadow(0 2px 2px rgba(0,0,0,.35))` : "drop-shadow(0 2px 2px rgba(0,0,0,.35))",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {faced && pieceCh ? <div style={{ width: MEDAL_ART, height: MEDAL_ART }}>
                        <PieceArt kind={pieceCh.kind} fill={MP.ivory} rim="#c9a45c" detail={MP.medal} size="100%" level={1} /></div>
                      : faced && pure ? <div style={{ width: MEDAL_ART, height: MEDAL_ART }}>
                        <PieceArt kind="X" art={pure.art} fill={MP.ivory} rim="#c9a45c" accent={T.danger} size="100%" /></div>
                      : <Swords />}
                  </div>; })()}
                  </div>
                  {/* v1.0.52 (Besitzerbefund): DER HAKEN WAR ZU LEISE. Groesser
                      und in kraeftigerem Lila - er markiert einen Sieg, das
                      darf man sehen. 12 -> 16 px im Buchmodus, das Siegel
                      13 -> 17 px, und der Farbton von #c4a6ff auf das
                      saettigere #b388ff bzw. #7c3aed im Verlauf. */}
                  {st === "cleared" && (bm
                    ? <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-72%)",
                        fontSize: 16, fontWeight: 900, color: "#b388ff", opacity: 1,
                        textShadow: "0 0 9px rgba(124,58,237,1), 0 0 4px rgba(139,92,246,.95), 0 1px 2px rgba(0,0,0,.9)" }}>✓</span>
                    : <span style={{ position: "absolute", top: 1, right: 1, width: 17, height: 17, borderRadius: "50%",
                        background: "linear-gradient(160deg,#b388ff,#5b21b6)", color: "#fdfbff", fontSize: 11, fontWeight: 900,
                        boxShadow: "0 0 11px rgba(124,58,237,.95), 0 1px 3px rgba(0,0,0,.5)", display: "flex", alignItems: "center",
                        justifyContent: "center", border: "1.5px solid #e3d8ff" }}>✓</span>)}
                  {/* DAS SCHLOSS AM WEG: eine verschlossene Station traegt ein
                      deutliches goldenes Siegel - man sieht auf einen Blick, wo
                      es nicht weitergeht; das Antippen erklaert im Panel, was
                      fehlt (Gegenstand, Figur oder Zoll). */}
                  {st === "gated" && imLicht(n) && <span style={{ position: "absolute", top: -3, right: -4, width: 21, height: 21,
                    borderRadius: "50%", display: "grid", placeItems: "center", zIndex: 3,
                    background: "radial-gradient(circle at 38% 30%, #3a2c10 0%, #171008 100%)",
                    border: "1.5px solid #e3c07a",
                    boxShadow: "0 0 8px rgba(240,206,122,.65), 0 1px 3px rgba(0,0,0,.6)",
                    animation: "ggGatePuls 2.6s ease-in-out infinite", willChange: "opacity" }}>
                    <LockIc size={12} color="#f2d98c" /></span>}
                  {/* und darunter, klein, WAS genau fehlt */}
                  {st === "gated" && imLicht(n) && (gateOf(n)?.item || gateOf(n)?.gold) && <span style={{ position: "absolute", bottom: 2, right: 1, fontSize: 11, opacity: bm ? 0.85 : 1,
                    filter: bm ? "none" : "drop-shadow(0 1px 1px rgba(0,0,0,.4))" }}>{gateOf(n)?.item ? <ItemIcon id={gateOf(n).item} size={11} style={{ display: "inline-block", verticalAlign: "-2px" }} /> : <GoldCoin size={11} style={{ verticalAlign: "-2px" }} />}</span>}
                  {!bm && n.boss?.pure && (viewing || facedNode(n)) && st !== "cleared" && st !== "gated" && <span style={{ position: "absolute", bottom: 3, right: 3, width: 13, height: 13,
                    borderRadius: "50%", background: T.danger, display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1.5px solid #efe9da" }}><SkullIc color="#f6f0de" size={8} /></span>}
                </button>
                {/* v1.0.50 (Besitzerbefund): die Namen KLEBTEN an den Bubbles
                    und standen teils schwer lesbar auf dem Gemaelde. Mehr
                    Abstand (+4/+5) und darunter ein kraeftigeres Kissen. */}
                <div style={{ position: "absolute", left: "50%", [bm || below ? "top" : "bottom"]: bm ? 33 : below ? 38 : 63, transform: "translateX(-50%)",
                  width: 96, textAlign: "center", opacity: st === "locked" ? 0.55 : st === "gated" ? 0.85 : 1, pointerEvents: "none" }}>
                  <span style={{ position: "relative", display: "inline-block", padding: "1px 6px" }}>
                    {/* Land: a WHISPER of ground blends the label into a pale
                        surface. The SEA has no pale surface to blend into — a halo
                        there reads as an ugly oval, so we drop it and carry the
                        name on the letters alone (bright ink, dark outline). */}
                    {/* ein weiches helles Kissen unter jedem Namen, damit die
                        Schrift auf jedem Untergrund stehen bleibt */}
                    {!th.sea && <span aria-hidden style={{ position: "absolute", inset: "-11px -24px", borderRadius: "50%",
                      background: "radial-gradient(ellipse at center, rgba(255,250,236,.52) 0%, rgba(255,250,236,.3) 42%, rgba(255,250,236,.11) 66%, transparent 82%)",
                      filter: "blur(5px)", pointerEvents: "none" }} />}
                    <span className="gg-quill" style={{ position: "relative", display: "block", fontSize: 15.5, fontWeight: 700,
                      color: th.sea ? "#fbf6e8" : "#231d10",
                      lineHeight: 0.94, textShadow: th.sea
                        ? "0 1px 2px rgba(6,20,34,.95), 0 0 4px rgba(6,20,34,.85), 0 0 1px rgba(6,20,34,1)"
                        : `0 0 7px rgba(${labelTint(viewLeague)},.95), 0 0 3px rgba(${labelTint(viewLeague)},.9), 0 1px 1px rgba(${labelTint(viewLeague)},.55)` }}>{placeFor(n, viewLeague, en)}</span>
                  </span>
                </div>
              </div>
            );
          })}
          {/* the traveller — the Grand Gambit walks the trail, larger than life.
              ER REIST IMMER MIT (Besitzer, v0.65): auch beim Durchblaettern
              der Kapitel steht er auf Station 1 des betrachteten Bodens. */}
          {(() => {
            // DER WANDERER IST NIE NIRGENDWO: kennt das Spiel seine Station
            // nicht, oder gehoert sie zu einem anderen Kapitel, dann stellt er
            // den Fuss auf Station 1 dieses Kapitels - statt zu verschwinden.
            let tn = nodeById(token.at);
            if (!tn || !nodeInLeague(tn, viewLeague)) {
              tn = CAMPAIGN.find((n) => nodeInLeague(n, viewLeague)) || null;
            }
            if (!tn) return null;
            return <div onClick={(e) => { e.stopPropagation(); try { klang("karteStation"); } catch {} setSel(token.at); setPanelOpen(true); }}
              title="Gambit" style={{ position: "absolute", left: nx(tn), top: ny(tn),
                width: Math.round(96 * tiefeWanderer(ny(tn), HM)), height: Math.round(98 * tiefeWanderer(ny(tn), HM)), zIndex: 5,
              pointerEvents: "auto", cursor: "pointer", transition: `left .72s ${CAM_EASE}, top .72s ${CAM_EASE}, transform .18s ease`,
              /* v1.0.52: -102% liess ihn UEBER dem Marker schweben; -88% setzt den
                 gestauchten Sockel darauf. */
              transform: (bm ? "translate(-50%,-88%) perspective(640px) rotateX(7deg)" : "translate(-98%,-70%)"),
              transformOrigin: "50% 96%", transformStyle: "preserve-3d" }}>

              {/* the wake: a golden streak trailing opposite the heading, fading once he rests */}
              <div aria-hidden style={{ position: "absolute", left: "50%", top: "62%", width: 58, height: 9,
                transformOrigin: "0 50%", transform: `rotate(${stride.angle + 180}deg)`,
                background: "linear-gradient(90deg, rgba(240,214,138,.55), rgba(240,214,138,.18) 55%, rgba(240,214,138,0))",
                borderRadius: 99, filter: "blur(1.6px)", pointerEvents: "none",
                opacity: token.moving ? 0.8 : 0, transition: token.moving ? "opacity .12s ease" : "opacity .55s ease .05s" }} />
              {!(th.sea && hasItem(profile, "boat")) && <div style={{ position: "absolute", left: "50%", bottom: -3, transform: "translateX(-46%)", width: 30, height: 8,
                borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(46,42,32,.34), transparent 72%)" }} />}
              {/* at SEA the Gambit takes to his painted boat: the hull rides in
                  front of the figure, its foam replaces the road shadow */}
              {/* Boot und Figur reisen GEMEINSAM: unterwegs huepft der Gambit
                  ueber Land und gleitet auf See; vor Anker schaukelt das Boot
                  leise. Der Bodenschatten bleibt bewusst am Boden. */}
              <div aria-hidden={false} style={{ position: "absolute", inset: 0,
                animation: token.moving
                  ? (th.sea && hasItem(profile, "boat") ? "ggGlide .9s ease-in-out infinite" : "ggHop .38s ease-in-out infinite")
                  : (th.sea && hasItem(profile, "boat") ? "ggBob 2.8s ease-in-out infinite" : "none") }}>
              {/* v1.0.99 (Besitzer: "das Boot ist an der falschen Stelle und
                  duerfte auch noch groesser sein"): DAS BOOT HING AN EINER
                  FESTEN BREITE. Der Wanderer-Container schrumpft mit der
                  Kartentiefe (96 px mal tiefeWanderer), das Boot stand fest
                  auf 128 px - je weiter hinten die Station lag, desto mehr
                  sprengte es den Rahmen und sass sichtbar neben der Figur
                  statt unter ihr. Jetzt haengt es am SELBEN Tiefenfaktor und
                  misst 1,55 Containerbreiten: es waechst und schrumpft mit
                  dem Gambit und bleibt unter ihm. */}
              {th.sea && hasItem(profile, "boat") && (() => {
                const bw = Math.round(96 * tiefeWanderer(ny(tn), HM) * 1.55);
                return <img src={bootUrl} alt="" draggable={false}
                  style={{ position: "absolute", left: "50%", bottom: -Math.round(bw * 0.07),
                    transform: "translateX(-50%)",
                    width: bw, height: "auto", zIndex: 3, pointerEvents: "none", userSelect: "none",
                    filter: "drop-shadow(0 2px 3px rgba(14,26,38,.45))" }} />;
              })()}
              <div style={{ position: "relative", width: "100%", height: "100%",
                // the risen Gambit glows quietly on the road too (Stufe II/III)
                filter: (() => { const gt = gambitTier(characterLevel(profile, "gambit") || 1);
                  return gt >= 3 ? "drop-shadow(0 2px 3px rgba(46,42,32,.35)) drop-shadow(0 0 6px rgba(240,214,138,.55)) drop-shadow(0 0 13px rgba(240,214,138,.3))"
                    : gt === 2 ? "drop-shadow(0 2px 3px rgba(46,42,32,.35)) drop-shadow(0 0 7px rgba(240,214,138,.45))"
                    : "drop-shadow(0 2px 3px rgba(46,42,32,.35))"; })(),
                /* v1.0.91 (Besitzer, mit Montage geprueft): DER GAMBIT STEHT IM BOOT, nicht
                   darauf. Vorher hob ihn translateY(-9%) HERAUS, sein Sockel schwebte
                   ueber der Bordwand. Jetzt keine Verschiebung: bei den echten
                   Spielmassen (Boot 128 px breit, 37 hoch, Oberkante bei y=11;
                   Figur 48 hoch, bottom -9) verdeckt der Rumpf von sich aus 35 %
                   der Figur - Huefte bei 63 %, Sockel ab 75 %, die Kante liegt also
                   genau dazwischen. Gerechnet, nicht geschaetzt: 22 % hatten 57 %
                   verdeckt und liessen ihn versinken. */
                transform: (""
                  + (token.moving ? ` rotate(${-7 * stride.dir}deg)` : "")) || "none", transition: "transform .3s ease" }}>
                {(() => {
                  // v1.0.41: Es gibt nur noch EINEN Satz - die Livree-Weiche
                  // ist fort. Der Karten-Gambit zeigt seine aktuelle Stufe.
                  const gt = gambitTier(characterLevel(profile, "gambit") || 1);
                  /* v1.0.52 (Besitzerwunsch): AUF DER MARKE STEHEN, nicht
                     daneben. Der Karten-Gambit traegt eine eigene Fassung
                     (karte-gambit.webp): sein Sockel ist auf 1.62 Breite
                     geweitet und auf 1.75 Hoehe gestaucht - aus dem Oval
                     von vorn wird eine flach liegende Scheibe, wie man sie
                     von schraeg oben sieht. Damit deckt sie den runden
                     Stationsmarker, statt danebenzustehen.
                     Reine Bildbearbeitung aus painted-gambit; sobald die
                     Rangbilder da sind, laesst sich dasselbe fuer t2-t6
                     rechnen (tools-Schnipsel im Commit v1.0.52). */
                  const src = KARTE_GAMBIT[Math.max(0, Math.min(5, gt - 1))] || karteGambit;
                  return bm && src
                    ? <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%",
                        objectFit: "contain", objectPosition: "bottom", userSelect: "none", pointerEvents: "none" }} />
                    : <WandererArt size="100%" />;
                })()}
              </div>
              </div>
            </div>;
          })()}
          {!viewing && frontierX < WMAP - 60 && (
            <div style={{ position: "absolute", top: 0, bottom: 0, left: frontierX, right: 0, zIndex: 5,
              pointerEvents: "none", backdropFilter: "blur(3.5px) saturate(.55) brightness(.6)",
              WebkitBackdropFilter: "blur(3.5px) saturate(.55) brightness(.6)",
              background: "linear-gradient(90deg, transparent, rgba(24,20,13,.4) 110px, rgba(24,20,13,.68))",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 80px)",
              maskImage: "linear-gradient(90deg, transparent, #000 80px)" }} />
          )}
        </div>
      </div>
      </div>

      {/* floating chrome: back pill + league badge (left), zoom (right) —
          always INSIDE the rounded map frame, padded off its edge */}
      <div style={{ position: "absolute", top: frameY + 12, left: frameX + 12, right: frameX + 12, zIndex: 8, display: "flex",
        alignItems: "center", gap: 8, pointerEvents: "none" }}>
        {/* league navigation: ‹ back through mastered worlds, › forward again —
            and once the Grandmaster has fallen, the golden gate: Onward. */}

        {/* the atlas button: a small round seal with the field map + waypin,
            hand-drawn — one tap steps out to the world painting */}
        <button onClick={() => setWorld(true)} title={t("camp.zoomOut")}
          style={{ pointerEvents: "auto", cursor: "pointer", width: 40, height: 40, borderRadius: "50%",
            display: "grid", placeItems: "center", background: "rgba(8, 11, 20, .48)",
            /* v1.0.10 (Besitzer): der Uebersichts-Button traegt LILA - dieselbe
               Kontur wie der Hub (178,150,255) samt leisem Riss-Glow. Die
               Kapitel-Pfeile daneben bleiben golden: Gold reist, Lila blickt. */
            border: "1px solid rgba(178,150,255,.62)",
            boxShadow: "0 2px 10px rgba(0,0,0,.35), 0 0 10px rgba(124,58,237,.30)",
            backdropFilter: "blur(10px) saturate(1.1)", WebkitBackdropFilter: "blur(10px) saturate(1.1)" }}>
          <MapPinIc size={21} />
        </button>
        {viewLeague > 1 && (
          <button onClick={() => { setViewLeague(viewLeague - 1); setPanOff({ x: 0, y: 0 }); }} title={ROMAN[viewLeague - 2] || viewLeague - 1}
            style={{ pointerEvents: "auto", cursor: "pointer", width: 40, height: 40, borderRadius: "50%",
              display: "grid", placeItems: "center", background: "rgba(8, 11, 20, .48)",
              border: "1px solid rgba(233, 210, 150, .42)", boxShadow: "0 2px 10px rgba(0,0,0,.35)",
              backdropFilter: "blur(10px) saturate(1.1)", WebkitBackdropFilter: "blur(10px) saturate(1.1)" }}>
            <BackIc size={19} />
          </button>
        )}
        <div style={{ flex: 1 }} />
        {bm && (() => {
          const cur = nodeById(token.at);
          const ch = CHAPTERS.find((c) => cur && cur.row >= c.fromRow && cur.row <= c.toRow) || CHAPTERS[0];
          // the header stays bare: back, forward and the world-map button — the
          // chapter name lives on the map itself, not in the chrome
          return null;
        })()}
        {viewLeague < league && (
          <button onClick={() => { setViewLeague(viewLeague + 1); setPanOff({ x: 0, y: 0 }); }} title={ROMAN[viewLeague] || viewLeague + 1}
            style={{ pointerEvents: "auto", cursor: "pointer", width: 40, height: 40, borderRadius: "50%",
              display: "grid", placeItems: "center", background: "rgba(8, 11, 20, .48)",
              border: "1px solid rgba(233, 210, 150, .42)", boxShadow: "0 2px 10px rgba(0,0,0,.35)",
              backdropFilter: "blur(10px) saturate(1.1)", WebkitBackdropFilter: "blur(10px) saturate(1.1)" }}>
            <span style={{ transform: "scaleX(-1)", display: "grid" }}><BackIc size={19} /></span>
          </button>
        )}
        {!viewing && nodeStatus(profile, "n22") === "cleared" && (
          <button onClick={() => dispatch({ type: "REPLACE", profile: advanceLeague(profile) })} title={t("camp.advance", { r: ROMAN[league] || league + 1 })}
            style={{ pointerEvents: "auto", cursor: "pointer", width: 40, height: 40, borderRadius: "50%",
              display: "grid", placeItems: "center", background: "rgba(8, 11, 20, .48)",
              border: "1px solid rgba(233, 210, 150, .42)", boxShadow: "0 2px 10px rgba(0,0,0,.35)",
              backdropFilter: "blur(10px) saturate(1.1)", WebkitBackdropFilter: "blur(10px) saturate(1.1)" }}>
            <span style={{ transform: "scaleX(-1)", display: "grid" }}><BackIc size={19} /></span>
          </button>
        )}
      </div>

      {/* ── THE OVERWORLD PAINTING: the whole journey on one canvas — the
          measured corridor carries ten anchors, spring at the foot, the
          Endless Sea and its lighthouse at the crown. Reached leagues glow
          with a pale halo on the road (the "brighter gradients"); what lies
          ahead sleeps under mist and lock. Tapping an anchor opens its lore. ── */}
      {world && (() => {
        const ratio = WORLD_MAP.h / WORLD_MAP.w;
        return (
          <div ref={(el) => {
              // open the atlas WHERE YOU ARE: scroll the current league into the middle
              if (!el || el._ggScrolled) return; el._ggScrolled = true;
              requestAnimationFrame(() => {
                const img = el.querySelector("[data-world-frame]");
                if (!img) return;
                const ay = WORLD_MAP.anchors[Math.min(10, Math.max(1, league))][1] / 100;
                el.scrollTop = Math.max(0, img.offsetTop + img.offsetHeight * ay - el.clientHeight / 2);
              });
            }}
            onClick={() => { setWorldSel(null); setWorld(false); }} style={{ position: "fixed", inset: 0, zIndex: 8, /* v0.71.12: UEBER der Karte, UNTER dem Dock (9) - v0.71.9 hatte sie hinter die Karte gelegt */
            // VOLLBILD: der Atlas lag bisher mit inset 0 IM Kartenrahmen und
            // stand deshalb nur im oberen Drittel, unten abgeschnitten. Als
            // fixes Vollbild-Overlay nimmt er den ganzen Schirm - und laesst
            // unten Platz fuer die Menueleiste.
            background: "rgba(4,6,10,.94)",
            overflowY: "hidden", // v0.71.14: die Welt scrollt NUR quer
            display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
            {/* v0.71.14: Ueberschrift und Untertitel der Weltkarte fort - die Ansicht spricht fuer sich. */}
            {/* DIE WELTKARTE NIMMT DEN GANZEN SCHIRM: die alte Bremse von 430px
                stammt von der schmalen Hochkantkarte - die neue liegt quer und
                soll so gross stehen wie die Kapitelkarte. Sie fuellt die
                Breite und begrenzt sich nur an der Hoehe, damit sie nie unter
                die Leiste rutscht. */}
            <div style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch",
              /* v0.83: DERSELBE KASTEN WIE DIE KAPITELKARTE - nicht nur
                 dieselbe Hoehenformel, sondern auch dieselbe Breite und
                 dieselbe Lage im Schirm. Zuvor lag die Welt in einem eigenen
                 Vollbild-Polster (18/104), waehrend ihre Hoehe aus frameH kam,
                 das fuer einen anderen Raum gerechnet ist - daher die
                 wechselnde Skalierung und der Ausreisser ueber den oberen
                 Rand. */
              position: "absolute", left: vpLeft + frameX, top: vpTop + padTop,
              width: frameW, height: frameH,
              /* v1.0.10 (Besitzer): DERSELBE RADIUS wie die Kapitelkarte (Z.402),
                 nicht mehr der harte 14er aus der Vollbild-Zeit. */
              borderRadius: Math.min(22, frameW / 12), background: "rgba(9,11,16,.95)",
              border: "1px solid rgba(167,139,250,.62)",
              boxShadow: "0 10px 34px rgba(0,0,0,.5), 0 0 12px rgba(124,58,237,.28)" }}>
            <div data-world-frame onClick={(e) => e.stopPropagation()} style={{ position: "relative",
              // v0.71.12 (Besitzer): das Querbild klebt oben/unten/links an der
              // Box - volle HOEHE, und nach RECHTS wird gescrollt, je mehr
              // Welt sich oeffnet.
              height: "100%", width: Math.round(frameH * WORLD_MAP.w / WORLD_MAP.h), minWidth: "100%" }}>
              <button onClick={() => { setWorldSel(null); setWorld(false); }} title={t("camp.zoomIn")}
                style={{ position: "absolute", top: 10, left: 10, zIndex: 8, cursor: "pointer",
                  width: 38, height: 38, borderRadius: "50%", display: "grid", placeItems: "center",
                  /* v1.0.10 (Besitzer): Zurueck auf der Weltkarte in LILA,
                     passend zum Rahmen der Karte selbst. */
                  background: "rgba(8, 11, 20, .55)", border: "1px solid rgba(178,150,255,.62)",
                  boxShadow: "0 2px 10px rgba(0,0,0,.4), 0 0 10px rgba(124,58,237,.30)",
                  backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}>
                <BackIc size={20} />
              </button>
              <img src={WORLD_MAP.url} alt="" draggable={false} style={{ display: "block", width: "100%",
                aspectRatio: `${WORLD_MAP.w} / ${WORLD_MAP.h}`, userSelect: "none" }} />
              {/* DAS LICHT DER BEREISTEN WELT: keine Trennlinie mehr, sondern
                  ein weiter RADIUS um jedes erreichte Kapitel. Die Karte ist
                  ueberall dunkel, und um jede besuchte Welt oeffnet sich ein
                  grosser weicher Kreis - das naechste Kapitel liegt im
                  hellsten Licht, die frueheren daemmern nach. So waechst der
                  Ausschnitt Kapitel fuer Kapitel, statt eine Kante zu schieben.
                  Umgesetzt als MASKE ueber einer dunklen Flaeche: wo ein Kreis
                  liegt, wird das Dunkel weggenommen. */}
              {(() => {
                const bis = Math.min(12, league);
                const kreise = [];
                for (let lg = 1; lg <= bis; lg++) {
                  const [ax, ay] = WORLD_MAP.anchors[lg] || [];
                  if (ax == null) continue;
                  // das juengste Kapitel leuchtet am weitesten, aeltere etwas enger
                  const alter = bis - lg;                       // 0 = das neueste
                  // WEITER GEOEFFNET (Besitzer, v0.65): jedes Kapitel zeigt
                  // deutlich mehr Welt - voll erspielt bleibt nur noch ein
                  // leiser schwarzer Saum am Aussenrand.
                  const r = alter === 0 ? 36 : Math.max(27, 33 - alter * 0.8);
                  const kern = alter === 0 ? 0.7 : 0.62;
                  kreise.push(`radial-gradient(${r}% ${r * 1.7}% at ${ax}% ${ay}%, #000 0%, #000 ${Math.round(kern * 100)}%, rgba(0,0,0,.45) 78%, transparent 100%)`);
                }
                if (!kreise.length) return null;
                const maske = kreise.join(", ");
                return <>
                  {/* die Dunkelheit selbst - mit den Kreisen als Loch */}
                  <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none",
                    background: "#05040a",
                    WebkitMaskImage: `linear-gradient(#000 0 0), ${maske}`,
                    maskImage: `linear-gradient(#000 0 0), ${maske}`,
                    WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
                  {/* Die Schwadenschicht ist gefallen: zwei maskierte Flaechen
                      uebereinander liessen das Ziehen ruckeln - und sie liessen
                      Unbereistes erahnen, was es nicht soll. */}
                </>;
              })()}
              {Array.from({ length: 12 }, (_, i) => i + 1).map((lg) => {
                const [ax, ay] = WORLD_MAP.anchors[lg];
                const reachable = lg <= league;
                const here = lg === league;
                return (
                  <div key={lg} onClick={(e) => { e.stopPropagation(); if (reachable) setWorldSel(worldSel === lg ? null : lg); }}
                    style={{ position: "absolute", left: `${ax}%`, top: `${ay}%`, transform: "translate(-50%, -50%)",
                      cursor: reachable ? "pointer" : "default" }}>
                    {/* the brighter gradient: a pale halo where the road passes a mastered world */}
                    {reachable && <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%",
                      width: 96, height: 96, transform: "translate(-50%, -50%)", pointerEvents: "none",
                      background: `radial-gradient(circle, rgba(255,243,196,${here ? ".34" : ".22"}) 0%, rgba(255,243,196,${here ? ".14" : ".08"}) 45%, transparent 70%)` }} />}
                    <div style={{ position: "relative", width: here ? 34 : 28, height: here ? 34 : 28, borderRadius: "50%",
                      display: "grid", placeItems: "center",
                      background: reachable ? "rgba(20,16,8,.72)" : "rgba(10,12,18,.7)",
                      border: here ? "2px solid #f0d68a" : reachable ? "1.5px solid rgba(233,210,150,.75)" : "1.5px solid rgba(150,150,160,.4)",
                      boxShadow: here ? "0 0 14px rgba(240,214,138,.55)" : "0 2px 8px rgba(0,0,0,.5)" }}>
                      <span className="gg-serif" style={{ fontSize: reachable ? 12 : 11, fontWeight: 700,
                        color: reachable ? "#e9d296" : "rgba(200,200,210,.55)" }}>
                        {reachable ? (ROMAN[lg - 1] || lg) : <svg width="11" height="12" viewBox="0 0 14 16" aria-hidden style={{ display: "block" }}>
                          <defs><linearGradient id="ggLockG" x1="0" y1="0" x2="0.6" y2="1">
                            <stop offset="0" stopColor="#f6e096" /><stop offset=".5" stopColor="#d9b264" /><stop offset="1" stopColor="#a97e3c" />
                          </linearGradient></defs>
                          <path d="M4 7 L4 4.6 A3 3 0 0 1 10 4.6 L10 7" fill="none" stroke="url(#ggLockG)" strokeWidth="1.7" strokeLinecap="round" />
                          <rect x="2.4" y="6.8" width="9.2" height="7.6" rx="1.8" fill="url(#ggLockG)" stroke="#7a5c26" strokeWidth="0.9" />
                          <circle cx="7" cy="10.2" r="1.15" fill="#5c4318" />
                          <path d="M7 10.8 L7 12.4" stroke="#5c4318" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>}</span>
                    </div>
                    {here && <div className="gg-serif" style={{ position: "absolute", left: "50%", top: "100%",
                      transform: "translateX(-50%)", marginTop: 3, fontSize: 8.5, letterSpacing: ".14em",
                      color: "#f0d68a", textShadow: "0 1px 3px rgba(0,0,0,.9)", whiteSpace: "nowrap" }}>{t("hub.at").toUpperCase()}</div>}
                  </div>
                );
              })}
              {/* the lore sheet lives INSIDE the painting now: above the tapped
                  anchor, in the veiled dark where there is always room */}
              {worldSel && (() => {
                const wt = themeForLeague(worldSel);
                const lore = loreText(worldSel, profile.lang === "en", profile?.name);
                return (
                  /* v0.83: das Blatt haengt jetzt am SCHIRM, nicht am Bild -
                     fest unten in der Mitte, wo es immer zu sehen ist. */
                  <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: "50%",
                    transform: "translateX(-50%)", width: "min(92vw, 340px)",
                    bottom: "calc(122px + env(safe-area-inset-bottom))", zIndex: 12,
                    borderRadius: 14, border: "1px solid rgba(233,210,150,.4)", background: "rgba(12,15,22,.92)",
                    padding: "12px 13px" }}>
                    <div className="gg-serif" style={{ color: "#e9d296", fontSize: 15, letterSpacing: ".1em" }}>
                      {ROMAN[worldSel - 1]} · {wt.nameDe}</div>
                    <div className="gg-serif" style={{ color: "rgba(240,233,216,.85)", fontSize: 12.5, fontStyle: "italic",
                      lineHeight: 1.6, marginTop: 6 }}>{lore || ""}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
                      <GoldShineButton style={{ flex: 1, padding: "9px 12px", fontSize: 13, borderRadius: 10 }}
                        onClick={() => { setViewLeague(worldSel); setPanOff({ x: 0, y: 0 }); setWorldSel(null); setWorld(false); }}>
                        {worldSel === viewLeague ? t("camp.worldHere") : t("camp.worldTravel")}
                      </GoldShineButton>
                    </div>
                  </div>
                );
              })()}
            </div>
            </div>{/* v0.71.12: Quer-Scroller zu */}

          </div>
        );
      })()}


      {/* embedded node panel — parchment overlay near the medallion; arrival is
          part of the world, not a card below the map */}
      {/* THE LOOK BACK: a mastered league is open ground — tap any station and
          replay it as a FRIENDLY, scaled to that old league. No progression,
          no bookkeeping; just the road, walked once more. */}
      {panelOpen && viewing && !!node && (
        <div key={"vw" + sel} style={{ position: "absolute", left: frameX + panelLeft, width: panelW, ...panelPos,
          zIndex: 7, background: "rgba(240,233,216,.6)", backdropFilter: "blur(16px) saturate(1.15)",
          WebkitBackdropFilter: "blur(16px) saturate(1.15)", border: `1px solid ${PP.line}`, borderRadius: 18, color: PP.ink,
          boxShadow: "0 0 30px rgba(30,25,15,.2)",
          // v0.73.1 (Besitzer): oben wie unten - die Zeilenluft des groesseren
          // Titels wird gekappt statt zusaetzlich gepolstert.
          padding: "9px 13px 13px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="gg-serif" style={{ fontSize: 15.5, fontWeight: 700 }}>{placeFor(node, viewLeague, en)}</span>
            <span style={{ fontSize: 11, color: PP.dim }}>{en ? mapById(effectiveMap(node, viewLeague)).nameEn : mapById(effectiveMap(node, viewLeague)).nameDe}</span>
            <div style={{ flex: 1 }} />
            <button onClick={() => setPanelOpen(false)} aria-label="Close" style={{ background: "none", border: "none",
              cursor: "pointer", color: PP.dim, fontSize: 17, lineHeight: 1, padding: 2 }}>×</button>
          </div>
          <div className="gg-serif" style={{ marginTop: 6, fontSize: 12, fontStyle: "italic", lineHeight: 1.45, color: PP.dim }}>
            {t("camp.lookbackHint")}</div>
          {/* v1.1.8 (Besitzerbefund: "Hast du jetzt alle Popups bei den Maps
              ueberarbeitet, dass ich die Gegner, wenn neue Figuren, gar nicht
              mehr im Popup sehe? Das ist nicht gewollt."): DIE GEGNER FEHLTEN
              HIER IMMER. Es gibt ZWEI Stationsfenster - das gewoehnliche mit
              Bild, Werten und Geschichte, und dieses schlichte fuer den
              Rueckblick, das erscheint, sobald man ueber die Weltkarte in ein
              anderes Kapitel blaettert. Das zweite kannte nur Ort, Karte und
              Startknopf; wer also ueber die Weltkarte navigierte - und genau
              das tut der Besitzer -, sah nie, was an der Station wartet. Jetzt
              stehen Bild, Name und die beiden Werte auch hier, im kleineren
              Mass, weil das Rueckblickfenster schmal bleiben soll. */}
          {(() => {
            const bossHier = node?.boss ? nodeBossSpec(node, viewLeague) : null;
            if (!bossHier) return null;
            const bild = paintedById("boss-" + bossHier.bossId) || paintedById("boss-" + bossHier.art);
            const S = 74;
            return <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 9,
              padding: "8px 10px", borderRadius: 10, background: "rgba(255,250,235,.42)",
              border: `1px solid ${PP.line}` }}>
              {bild && <img src={bild} alt="" draggable={false} style={{ width: S, height: S,
                objectFit: "contain", objectPosition: "bottom", flex: "0 0 auto" }} />}
              <div style={{ minWidth: 0 }}>
                <div className="gg-quill" style={{ fontSize: 15, color: PP.ink, lineHeight: 1.1 }}>
                  {en ? bossHier.nameEn : bossHier.nameDe}</div>
                <div style={{ display: "flex", gap: 7, marginTop: 5 }}>
                  <StatOrbBadge kind="power" v={bossHier.atk} size={24} num={0.52} />
                  <StatOrbBadge kind="life" v={bossHier.hp} size={24} num={0.52} />
                </div>
              </div>
            </div>;
          })()}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="primary" onClick={() => onStart(sel, viewLeague)} style={{ flex: 1,
              background: "rgba(201,164,92,.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,240,200,.55)", boxShadow: "0 0 16px rgba(201,164,92,.3)" }}>
              <BladesIc color={T.limeInk} size={14} /> {t("camp.friendly")}
            </Button>
          </div>
        </div>
      )}
      {showPanel && (
        <div key={sel + (token.at === sel ? "@" : "")} style={{ position: "absolute", left: frameX + panelLeft, width: panelW, ...panelPos,
          zIndex: 7, background: "rgba(240,233,216,.6)", backdropFilter: "blur(16px) saturate(1.15)",
          WebkitBackdropFilter: "blur(16px) saturate(1.15)", border: `1px solid ${PP.line}`, borderRadius: 18, color: PP.ink,
          boxShadow: "0 0 30px rgba(30,25,15,.2)",
          // v0.73.1 (Besitzer): oben wie unten - die Zeilenluft des groesseren
          // Titels wird gekappt statt zusaetzlich gepolstert.
          padding: "9px 13px 13px" }}>
          {(() => {
            const br = { a1: "blades", b1: "magic", c1: "order", d1: "power", e1: "wisdom" }[sel];
            return br ? <div className="gg-quill" style={{ fontSize: 12.5, color: PP.dim, marginBottom: 2 }}>
              {BRANCHES[br][en ? "nameEn" : "nameDe"]}</div> : null;
          })()}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            {/* v1.0.98 (Besitzer: "der Info-Knopf ist nicht sauber mittig
                ausgerichtet - ich finde es besser, wenn du ihn hinter den
                Titel machst, linksbuendig nach dem Titel"): er steht jetzt in
                der Titelzeile, unmittelbar hinter dem Ortsnamen, und laeuft
                mit ihm um. Vorher klebte er neben dem Kreuz und war bei
                alignItems flex-start nie mittig zur Schrift. Die Info gehoert
                zur Station, also gehoert der Knopf zu ihrem Namen. */}
            <div className="gg-quill" style={{ fontSize: 20, color: PP.ink, flex: 1, minWidth: 0, lineHeight: 1.0, marginTop: -1,
              display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ minWidth: 0 }}>{node ? placeFor(node, league, en) : ""}</span>
              {status === "cleared" && (
                <button onClick={() => setInfoAuf((v) => !v)} aria-label="Info" title={t("camp.replayNone")}
                  style={{ width: 20, height: 20, borderRadius: "50%", flex: "0 0 auto",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${infoAuf ? "rgba(90,75,40,.75)" : "rgba(90,75,40,.38)"}`,
                    background: infoAuf ? "rgba(201,164,92,.3)" : "none", color: PP.dim,
                    fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 12,
                    lineHeight: 1, cursor: "pointer", padding: 0 }}>i</button>
              )}
            </div>
            <button onClick={() => setPanelOpen(false)} aria-label="Close" style={{ background: "none", border: "none",
              color: PP.dim, fontSize: 15, cursor: "pointer", padding: "0 0 0 6px", fontFamily: "inherit", lineHeight: 1, flex: "0 0 auto" }}>✕</button>
          </div>
          {(() => { // STRICT secrecy extends to the tale: a boss station's story
            // names its figure — so it stays veiled until you have PLAYED here
            const tell = !node?.boss || status === "cleared" || facedSet.has(sel);
            if (tell && node?.storyDe) return <div className="gg-serif" style={{ fontSize: 12.5, color: PP.dim, marginTop: 4, fontStyle: "italic", lineHeight: 1.45 }}>
              {mitHeld(en ? node.storyEn : node.storyDe, profile)}</div>;
            if (node?.boss) return <div className="gg-serif" style={{ fontSize: 12.5, color: PP.dim, marginTop: 4, fontStyle: "italic", lineHeight: 1.45 }}>
              {t("camp.veiled")}</div>;
            return null; })()}
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 9 }}>
            <Chip className="gg-serif" color={PP.chipInk} bg={PP.bg2}>{mapById(effectiveMap(node, league))[en ? "nameEn" : "nameDe"]}</Chip>
            <Chip className="gg-serif" color={PP.chipInk} bg={PP.bg2}>{t("mode." + node.rules)}</Chip>
            <Chip className="gg-serif" color={PP.chipInk} bg={PP.bg2}>{t("diff." + node.difficulty)}{node.bump ? ` +${node.bump}` : ""}</Chip>
            <Chip className="gg-serif" color={"#3c4a22"} bg={"#d3deb2"}>+{Math.round((node.reward?.xp || 0) * mult * (friendly ? 0.25 : 1))} XP</Chip>
            <Chip className="gg-serif" color={"#17110a"} bg={"#e8c96a"}><GoldCoin size={12} /> +{Math.round((5 + 2 * node.row + (node.boss ? 6 : 0)) * mult / (friendly ? 2 : 1))}</Chip>
          </div>
          {/* v1.1.8 (Besitzerentscheid): DIE FIGUR IST IMMER ZU SEHEN. "Hast du
              jetzt alle Popups bei den Maps ueberarbeitet, dass ich die Gegner,
              wenn neue Figuren, gar nicht mehr in dem Popup sehe? Das ist nicht
              gewollt - ich moechte die auf jeden Fall sehen."

              Die Karte hing bisher an einer Geheimhaltungsregel: sie erschien
              nur bei einer geraeumten oder schon betretenen Station
              (status cleared oder faced). Wer zum ersten Mal vor einem Meister
              stand, sah nichts - genau der Moment, in dem man wissen will,
              was dort wartet. Die Regel bleibt fuer die GESCHICHTE (tell, eine
              Zeile darueber): der Text erzaehlt sich erst, wenn man dem Wesen
              begegnet ist. Das BILD und die Werte stehen jetzt immer da. */}
          {boss && (() => {
            // room for the name and the two value orbs (60px) stays reserved
            const bossArtS = Math.round(Math.max(120, Math.min(160, (panelW - 50) * 0.46))); // v1.0.87: groesser, weil das Bild nicht mehr gezoomt wird
            return (
            /* v1.0.16 (Besitzer): "warum ist ueber dem Hetzer so viel Platz und
               warum geht die Figur nicht bis nach oben?" - weil Bild und Text
               UNTEN buendig standen (flex-end): die kuerzere Textspalte sass am
               Boden, also blieb neben ihr oben Luft. Jetzt spannt sich die
               Karte (stretch), der Text beginnt OBEN, und die Figur waechst in
               die frei gewordene Hoehe. Ihre SPALTENBREITE bleibt unveraendert
               - der Fliesstext darf nicht schmaler werden. */
            <div style={{ display: "flex", alignItems: "stretch", gap: 13, marginTop: 10, padding: "10px 12px",
              background: PP.bg2, borderRadius: 9, border: `1px solid ${PP.line}` }}>
              {/* THE PORTRAIT FILLS ITS HEIGHT: the box used to be 84x108 —
                  taller than wide — so a square painting was WIDTH-limited by
                  `contain` and rendered only 84px tall, wasting a quarter of
                  the frame. Measured across all 70 paintings: at full height
                  the widest figure (a sprawling monster) spans 0.918 of that
                  height, so a SQUARE frame holds every one of them without
                  clipping. Sized off the panel so it breathes on phones too. */}
            <div style={{ flex: "0 0 auto", width: bossArtS, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
              {/* v1.0.16: die Bildbox nimmt die RESTHOEHE der Karte (mindestens
                  ihr altes Quadrat), die Figur steht darin auf dem Sockel. */}
              {/* v1.0.87 (Besitzer: "niemals ein Bild abschneiden"): die Box
                  nahm die Resthoehe (v1.0.16) und SCHNITT AB (overflow hidden).
                  Jetzt ein festes Quadrat, sichtbar bis zum letzten Pixel. */}
              <div style={{ width: bossArtS, height: bossArtS, flex: "0 0 auto", overflow: "visible" }}>
                {(() => {
                  // v0.71.12 (Besitzer): der gewaehlte BRETTSTIL gilt GLOBAL -
                  // steht das Profil auf Leuchtend, traegt auch das Popup-
                  // Portraet die Leuchtkonturen (der Gegner gehoert dem Riss;
                  // erst wenn er zu dir kommt, verliert er sie - golden).
                  const painting = paintedForPiece({ kind: boss.kind, art: boss.art, bossId: boss.bossId });
                  return painting
                    ? <img src={painting} alt="" draggable={false} style={{ width: "100%", height: "100%",
                        // v0.71.14 (Besitzer): NICHT die Box verbreitern - das BILD
                        // beschneiden: die Malerei traegt viel Luft, also 1,42-fach
                        // hineinzoomen und ueberstehendes kappen. Figur gross,
                        // Textspalte bleibt breit.
                        /* v1.0.87 (Besitzer: "niemals ein Bild abschneiden"): der 1,42-
                           Zoom aus v0.71.14 kappte Kopf und Sockel. Jetzt 1:1 in
                           einer groesseren Box - die Figur ist ganz zu sehen. */
                        objectFit: "contain", objectPosition: "bottom",
                        filter: golden ? "drop-shadow(0 2px 2px rgba(40,32,16,.35))" : `${ENEMY_FILTER} drop-shadow(0 2px 2px rgba(40,32,16,.35))`,
                        userSelect: "none", pointerEvents: "none" }} />
                    : <PieceArt kind={boss.kind} art={boss.art} fill={golden ? "#c9a45c" : "#242d44"} rim={golden ? "#f0dfae" : "#93a0bb"}
                        detail={golden ? "#59421a" : "#9aa8c6"} accent={boss.accent || T.gold} size="100%" level={1} />;
                })()}
              </div>
              {/* v0.72.1 (Besitzer): Angriff und Leben stehen UNTER der Figur
                  (kleiner Abstand zum Sockel); Ueberschrift und Fliesstext
                  ruecken dadurch sauber untereinander. */}
              <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}><span style={{ display: "inline-flex", alignItems: "center", gap: 2, filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }}>
                    <StatOrbBadge kind="power" v={boss.atk} size={28} num={0.52} /><StatOrbBadge kind="life" v={boss.hp} size={28} num={0.52} /></span>
              </div>
            </div>
              <div style={{ minWidth: 0, flex: "1 1 auto", paddingBottom: 3 }}>
                <div className="gg-serif" style={{ fontSize: 17, letterSpacing: ".03em", color: PP.ink }}>{boss.name[en ? "en" : "de"]}</div>
                {/* v1.0.87 (Besitzer: "Magier und Kronenfigur fluchten nicht sauber"):
                    vor der Zugehoerigkeit stand ein LEERES Element und dann ein
                    Trennpunkt - der Punkt sass allein vorn und rueckte das Wort
                    ein. Jetzt buendig unter dem Namen, in Kapitaelchen. */}
                <div className="gg-serif" style={{ fontSize: 11.5, color: "#8a6f4d", marginTop: 3, letterSpacing: .6, textTransform: "uppercase" }}>
                  {(() => { const f = familyOf(boss.kind);
                    return f ? (f === "crown" ? (en ? "Crown" : "Kronenfiguren") : (en ? "Shadows" : "Schattenwesen")) : null; })()}
                </div>
                {unlockCh && known && status !== "cleared" && facedSet.has(sel) && <div className="gg-serif" style={{ fontSize: 11.5, color: "#8e2f39", fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>
                  {t("camp.turncoat", { name: unlockCh[en ? "nameEn" : "nameDe"] })}</div>}
                {(() => { const v = voiceFor(boss);   // the saga speaks on the map too
                  return v ? <div className="gg-serif" style={{ fontSize: 11.5, color: "#6b5c44", fontStyle: "italic", marginTop: 5, lineHeight: 1.5 }}>
                    {mitHeld(v[en ? "heraldEn" : "heraldDe"], profile)}</div> : null; })()}
              </div>
            </div>
            );
          })()}
          {/* the aftermath, told on the spot: joined the retinue, fled again (with tally), or simply done */}
          {status === "cleared" && (() => {
            const nm = unlockCh ? unlockCh[en ? "nameEn" : "nameDe"] : null;
            const txt = node.id === "n22" ? t("camp.stKeepFriendly")
              : unlockCh
              ? (known ? t("camp.stFriendly", { name: nm })
                       : t("camp.stFled", { n: bossWinsFor(profile, unlockCh.id), name: nm }))
              : t("camp.stDone");
            /* v1.0.16 (Besitzer): "der Button mit Abgeschlossen und der Text
               auch noch mit Abgeschlossen - einmal reicht." Der HAKEN traegt
               den Zustand, gross und deutlich; der Knopf darunter sagt, was
               man TUN kann ("Nochmal spielen"). */
            /* v1.0.87 (Besitzer: "die gruene Schrift geht gar nicht - imposanter,
               wie ein Erfolg, mit glaenzendem Stern, gern animiert, aber nicht
               mehr Platz"): das Gefolge-Band ist jetzt ein ERFOLG - goldenes
               Pergamentband mit Rand, ein Stern, der glaenzt und atmet
               (ggErfolgStern, nur transform/opacity), Schrift in dunklem
               Gold statt Gruen. Zwei Zeilen wie vorher: gleicher Platz. */
            const erfolg = golden;
            return <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10,
              ...(erfolg ? { padding: "7px 10px", borderRadius: 10,
                background: "linear-gradient(135deg, rgba(233,207,138,.28), rgba(201,164,92,.14))",
                border: "1px solid rgba(201,164,92,.55)", boxShadow: "inset 0 1px 0 rgba(255,244,214,.6)" } : null) }}>
              <span aria-hidden style={{ fontSize: erfolg ? 22 : 19, lineHeight: 1, flex: "0 0 auto",
                color: erfolg ? "#c9a45c" : "#7d8a5a",
                textShadow: erfolg ? "0 0 8px rgba(233,207,138,.9), 0 0 2px #fff6d8" : "none",
                ...(erfolg && animAn() ? { animation: "ggErfolgStern 2.4s ease-in-out infinite", display: "inline-block" } : null) }}>
                {erfolg ? "✦" : "✓"}</span>
              <span className="gg-serif" style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.35,
                color: erfolg ? "#5a4210" : PP.dim, fontWeight: erfolg ? 600 : 400 }}>{txt}</span>
            </div>;
          })()}
          {status === "gated" ? (() => {
            const g = gateOf(node);
            if (g.gold) {
              const cost = tollCost(node, profile.campaign?.league || 1);
              const have = profile.gold || 0;
              const can = have >= cost;
              return <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "9px 11px",
                background: "#c9a45c26", border: "1.5px dashed #a9853f", borderRadius: 9 }}>
                <GoldCoin size={22} />
                <div style={{ flex: 1, fontSize: 12.5 }}>
                  <b>{t("camp.tollNeed", { n: cost })}</b>
                  <div style={{ color: can ? PP.dim : "#8e2f39", fontSize: 11.5 }}>
                    {can ? t("camp.tollHint") : t("camp.tollShort", { have })}
                  </div>
                </div>
                <Button variant={can ? "primary" : "subtle"} disabled={!can}
                  onClick={() => dispatch({ type: "PAY_TOLL", id: node.id })}
                  style={{ padding: "9px 14px", whiteSpace: "nowrap", ...(can ? {} : { background: "#dcd3ba", color: PP.ink }) }}>
                  <GoldCoin size={13} /> {cost} · {t("camp.payToll")}
                </Button>
              </div>;
            }
            const it = ITEMS[g.item];
            const pieceCh2 = g.piece ? CHARACTERS[g.piece] : null;
            const pieceOk = !g.piece || (profile.campaign?.unlocked || []).includes(g.piece);
            const itemOk = hasItem(profile, g.item);
            const can = !itemOk && (profile.gold || 0) >= itemPrice(profile, it);
            return <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "9px 11px",
              background: "#c9a45c22", border: "1.5px dashed #a9853f", borderRadius: 9 }}>
              <ItemIcon id={it.id} size={22} />
              <div style={{ flex: 1, fontSize: 12.5 }}>
                <b>{itemOk ? <><CheckIc size={13} /> </> : ""}{t("camp.gateNeed", { item: en ? it.nameEn : it.nameDe })}</b>
                <div style={{ color: PP.dim, fontSize: 11.5 }}>{en ? it.textEn : it.textDe}</div>
                {pieceCh2 && <div style={{ fontSize: 11.5, marginTop: 3, color: pieceOk ? PP.green : MP.liga, fontWeight: 700 }}>
                  {pieceOk ? <CheckIc size={13} /> : <BoxIc size={13} />} {t("camp.gatePiece", { name: en ? pieceCh2.nameEn : pieceCh2.nameDe })}
                </div>}
              </div>
              {!itemOk && <Button variant={can ? "primary" : "subtle"} disabled={!can}
                onClick={() => dispatch({ type: "BUY_ITEM", id: it.id })}
                style={{ padding: "9px 14px", whiteSpace: "nowrap", ...(can ? {} : { background: "#dcd3ba", color: PP.ink }) }}>
                <GoldCoin size={13} /> {itemPrice(profile, it)} · {t("camp.buyHere")}
              </Button>}
            </div>;
          })() : (
            /* v1.0.16: die Zeile war ein REIHEN-Flex - Knopf (flex 1) und
               Hinweistext teilten sich die Breite, der Knopf wurde zu schmal
               und schnitt seine Schrift ab ("Abgeschlosse"). Jetzt stehen sie
               UNTEREINANDER: der Knopf bekommt die volle Breite. */
            /* v1.0.90 (Besitzer: "der Button ist total daneben, die cremefarbene
               Flaeche geht gar nicht - lieber hart an das Design von davor
               halten"): DER STICKY-VERLAUF IST FORT. Er legte sich ueber
               "Abgeschlossen" und brachte eine zweite Flaeche ins Fenster, die
               dort nichts zu suchen hatte. Der Knopf steht wieder schlicht im
               Fluss, wie vor v1.0.87 - dass er sichtbar bleibt, loest jetzt der
               Info-Knopf OBEN: der Erklaertext ist eingeklappt, das Fenster
               bleibt kurz. */
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              <Button variant={status === "available" || friendly ? "primary" : "subtle"} disabled={status === "locked" || closed}
                onClick={() => onStart(sel)} style={{ flex: 1, position: "relative", overflow: "hidden",
                  // Steht an der Station ein Wesen des Risses, traegt der Knopf
                  // SEIN Licht - violett statt Gold. Gewoehnliche Partien
                  // bleiben golden: Gold ist die Krone, Violett der Riss.
                  // v0.71.10 (Besitzer): der Knopf ist IMMER golden - der alte
                  // Riss-Zweig (violett bei purem Risswesen) verriet obendrein
                  // Geheimnis-Stationen. Gold ist die Krone, Punkt.
                  ...(status === "available" || friendly
                    ? { background: "rgba(201,164,92,.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,240,200,.55)", boxShadow: "0 0 16px rgba(201,164,92,.3)", color: "#17110a" }
                    : { background: "#dcd3ba", color: PP.ink }) }}>
                {status === "available" && <span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "42%",
                  background: "linear-gradient(90deg, transparent, rgba(255,244,210,.28), transparent)",
                  animation: "ggShine 12s ease-in-out 1.8s infinite", pointerEvents: "none" }} />}
                <BladesIc color={T.limeInk} size={14} /> {profile.pausedMatch?.nodeId === sel && status !== "locked" ? t("camp.resume") : status === "cleared" ? (friendly ? t("camp.friendly") : t("camp.replayAgain")) : status === "locked" ? t("camp.locked") : (sel === token.at ? t("camp.startChallenge") : t("camp.play"))}
              </Button>
              {/* KLARHEIT AUF DER KARTE (Besitzer, v0.45): geraeumte Stationen
                  sagen, was eine Wiederholung wert ist - Freundschaftskampf
                  zahlt minimal, alles andere nichts. */}
              {/* v1.0.90: der Erklaertext steht jetzt UNTER dem Knopf, aber nur
                  wenn der Besitzer das (i) oben angetippt hat - ohne eigene
                  Flaeche, in derselben Schrift wie zuvor. */}
              {status === "cleared" && infoAuf && (
                <div style={{ fontSize: 10.5, lineHeight: 1.45, marginTop: 2, color: friendly ? "#4a5a2e" : "#6b6353" }}>
                  {friendly ? t("camp.replayHint") : t("camp.replayNone")}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* the Endless Sea gate — floats over the greyed-out map */}
      {seaLock && (
        <div style={{ position: "absolute", inset: 0, zIndex: 7, display: "grid", placeItems: "center",
          padding: "18px 18px 110px", pointerEvents: "none" }}>
          <div style={{ width: "100%", maxWidth: 400, padding: "16px 14px", background: `linear-gradient(160deg, #14324a, #0c1e30)`,
            border: `1.5px solid #3f7fa0`, borderRadius: T.radius, boxShadow: "0 16px 44px rgba(0,0,0,.55)" }}>
            <div className="gg-serif" style={{ fontSize: 17, color: "#cfe6f2", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8 }}><WaveIc size={18} /> {t("camp.seaLockedTitle")}</div>
            <div style={{ fontSize: 12.5, color: "#9dbdd0", margin: "6px 0 10px", lineHeight: 1.5 }}>{t("camp.seaLockedText")}</div>
            <div style={{ display: "grid", gap: 6, fontSize: 13, color: "#cfe6f2" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {(profile.campaign?.unlocked || []).includes("captain") ? <CheckIc size={15} /> : <BoxIc size={15} />}
                <AnchorIc size={15} /> {t("camp.seaNeedCaptain")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {hasItem(profile, "boat") ? <CheckIc size={15} /> : <BoxIc size={15} />}
                <BoatIc size={15} /> {t("camp.seaNeedBoat")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
