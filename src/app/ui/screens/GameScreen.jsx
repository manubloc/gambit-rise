import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { mitHeld } from "../namen.js";   /* v1.0.13: {held} in Erzaehltexten */
import { klang, klangVorwaermen, klangEinstellen } from "../klang.js";
import { musikBereich } from "../musik.js";
import { geleitTauschbar } from "../../../core/rules/buende.js";
import { geleitCommand } from "../../../core/sim/commands.js";
import { WHITE, BLACK, createGame, reduce, moveCommand, potionCommand, shiftCommand, status, undo, encodeState, decodeState, HP_REMIS_HALBZUEGE, VALUE,
  SPERR_ARTEN, MAX_SPERREN, setzFelder as sperrFelder, setzeSperre, nimmSperre, sperrenAnzahl } from "../../../core/index.js";
import { difficultyById, mapById, MAPS, campaignTag, chapterForRow, CHARACTERS as CHARACTERS_BY_ID, voiceFor, ITEMS, KIND_TO_CHAR } from "../../../content/index.js";
import { buildArmy, buildAiArmyForMap, buildArmyFromFormation, hasForesight, applyResult, summarizeMatch, mapUnlocked, hpUnlocked, winGold, characterLevel, gambitTier, itemRevealed, clearedCount, SP_VAULT_MIN_CLEARED } from "../../../meta/index.js";
import { chooseMove } from "../../../ai/index.js";
import { T } from "../theme.js";
import { groundArt, livery } from "../livery.js";
import { GoldShineButton } from "../Gilded.jsx";
import { stateHash } from "../../../platform/net.web.js";
import { Button, Panel, Segmented, Chip, FieldLabel, MapChip } from "../primitives.jsx";
import { LeaveMatchAsk } from "../../App.jsx";
import { FELD_KAPITEL, FELD_CLASSIC, FELD_FINALE } from "../board/feldArt.js";
import { BoardView, zugDauerMs } from "../board/BoardView.jsx";
import { CHARACTERS, ABILITIES } from "../../../content/index.js";
import { KampfLeiste } from "../KampfLeiste.jsx";
import { paintedById, paintedForPiece, ENEMY_FILTER } from "../board/paintedArt.js";
import { SkillStar, GoldCoin, SkullIc, BladesIc, LockIc, FlagIc, HourglassIc, ZoomIc, OrbIc } from "../icons.jsx";
import { animAn, schlagArt } from "../anim.js";
import { ItemIcon } from "../ItemIcon.jsx";
import texWear1 from "../assets/tex-wear-1.webp";
import texWear2 from "../assets/tex-wear-2.webp";
import texWear3 from "../assets/tex-wear-3.webp";
import texWear4 from "../assets/tex-wear-4.webp";

// ── THE LAND BLEEDS INTO THE BOARD ──────────────────────────────────────────
// Square tints sampled from each league's world painting: light = the open
// ground, dark = the same landscape's saturated shadow (spring goes mossy
// green, the sea deep blue) — every battle is fought INSIDE its world.
const LEAGUE_BOARD = {
  1: { sqLight: "#d6c79d", sqDark: "#716844" },
  2: { sqLight: "#ac9250", sqDark: "#433d1e" },
  3: { sqLight: "#ca954f", sqDark: "#5d3915" },
  4: { sqLight: "#c2c4a2", sqDark: "#5f6b50" },
  5: { sqLight: "#d2dae7", sqDark: "#687485" },
  6: { sqLight: "#bfbeb9", sqDark: "#696864" },
  7: { sqLight: "#e1bc7b", sqDark: "#896429" },   /* Sattelweite: Steppengras */
  8: { sqLight: "#e59558", sqDark: "#7d3f22" },   /* Aschgrund: roter Fels */
  9: { sqLight: "#ac8b64", sqDark: "#54412c" },   /* Die Wunde: rissige Erde */
  10: { sqLight: "#f8ca79", sqDark: "#a97c40" },
  11: { sqLight: "#b8c2ae", sqDark: "#4a6258" },  /* Die Kueste: Klippengruen */
  12: { sqLight: "#98a6a8", sqDark: "#315360" },  /* Endloses Meer: Wellengrau */
};
/* v1.1.5: DIE OPTIK FOLGT DEM KAMPF, nicht dem Profilstand. Diese drei
   Funktionen bekommen `match` uebergeben und fragten trotzdem das Profil -
   deshalb sah der Besitzer das Meer, sobald die Werkbank sein Profil auf
   Kapitel 12 gesetzt hatte, egal welche Station er auf der Karte anklickte.
   Der Kampf traegt sein Kapitel jetzt selbst (match.league, seit v1.1.5);
   das Profil bleibt Rueckfall fuer Schnellpartien und Duelle, die keine
   Station haben. */
const kapitelVon = (match, profile) => match?.league || profile?.campaign?.league || 1;
const boardPalette = (profile, match = null) => {
  const lg = kapitelVon(match, profile);
  return LEAGUE_BOARD[((lg - 1) % 12) + 1] || LEAGUE_BOARD[1];
};

// The board's material ages with the journey: leagues I–IV play on cared-for
// wood, V–VII on well-used boards, VIII–X on veterans full of scars. Quick
// play, hotseat and pvp keep the pristine one.
const WEAR_TEX = [texWear1, texWear2, texWear3, texWear4];
const texHash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
// Every board has lived its own life: each station deals its finish
// deterministically from a pool that grows rougher with the league — even
// Kronland mixes fresh wood with the odd scarred veteran table.
// classic chess: the chosen Elo sets the bot's search depth
const eloDepth = (elo) => (elo || 1000) < 1000 ? 1 : (elo || 1000) < 1600 ? 2 : 3;

// the painted GROUND under a campaign board, per league world (01 = spring
// meadow). Classic boards keep their bare wood; more worlds follow as their
// paintings arrive.
 // every world carries its own land under the board
const boardGround = (match, profile) => {
  if (!match) return null; // quick play & duels keep their bare tables
  const lg = ((kapitelVon(match, profile) - 1) % 12) + 1;
  return groundArt(lg);
};
const boardTexture = (match, profile) => {
  if (!match) return WEAR_TEX[0];
  if (match.friendly) return WEAR_TEX[0];   // friendlies play on the freshest table in the house
  const lg = kapitelVon(match, profile);   // v1.1.5: Kapitel des Kampfes
  const pool = lg >= 8 ? [1, 2, 3, 3] : lg >= 5 ? [0, 1, 2, 3] : [0, 0, 1, 2, 3];
  return WEAR_TEX[pool[texHash((match.nodeId || "x") + ":" + lg) % pool.length]];
};
import { PieceGlyph, JewelIc } from "../board/PieceGlyph.jsx";
import { StartMark } from "../HubSeals.jsx";

function Tray({ kinds, color }) {
  if (!kinds.length) return <span style={{ color: T.faint, fontSize: 13 }}>—</span>;
  return <span style={{ display: "inline-flex", flexWrap: "wrap", fontSize: 18, lineHeight: 1 }}>
    {kinds.map((k, i) => <span key={i} style={{ width: "1em", height: "1em", display: "inline-grid" }}><PieceGlyph piece={{ kind: k, color, level: 1, abilities: [], used: {}, shield: 0 }} /></span>)}
  </span>;
}

// Total HP and total attack power per side — the at-a-glance force balance.
function forces(board) {
  const f = { w: { hp: 0, atk: 0 }, b: { hp: 0, atk: 0 } };
  for (const p of board) if (p) { const s = f[p.color]; s.hp += p.hp || 0; s.atk += p.atk || 0; }
  return f;
}
// On the server there is no layout to measure, and React rightly warns that a
// layout effect can do nothing there. Same hook in the browser, quiet in SSR.
const useMeasureEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// One breath of air between every HUD piece and the screen edge — the trays,
// the totals and the item buttons all measure from this.
const HUD_PAD = 12;

/* ── v1.24.7 (Besitzer): KEINE BLASEN IM GEFECHT, SONDERN DER HOFWERT ──────
   "Die Bubbles Angriff und Leben will ich nicht sehen. Dafuer in klein den
    Hofwert."
   Die beiden 38-px-Juwelen sassen ueber dem Brett und ueberdeckten im
   Hochformat die obere Reihe (siehe Besitzerfoto: 181/442 lagen auf den
   Figuren). Leben und Angriff stehen ohnehin an jeder Figur im Sockelband -
   die Summe daneben war eine dritte Anzeige derselben Sache. Statt ihrer
   steht jetzt klein der Hofwert der Seite: eine Zahl, die man sonst nirgends
   im Gefecht sieht. */
function ForceBadge({ hp, atk, neon, t, wert }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
      padding: "3px 9px", borderRadius: 999, background: "rgba(10,7,19,.66)",
      border: `1px solid ${neon}55`, font: "700 11px/1 Georgia, serif", letterSpacing: ".04em",
      color: neon, textShadow: "0 1px 3px rgba(0,0,0,.8)" }}>
      <span style={{ font: "600 8.5px/1 Georgia, serif", letterSpacing: ".12em",
        textTransform: "uppercase", opacity: .8 }}>{t("online.score")}</span>
      {wert}
    </span>
  );
}

// The floating pill style shared by ‹ Back and ⚑ Resign (same shape, the
// resign just wears a slightly different tone — exactly as requested).
const pill = (extra) => ({ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
  // DAS LILA GEFECHTSKLEID (Besitzer, v0.69): alles um das Brett traegt
  // das Auswahl-Violett des Menues - Grund T.sel-Verlauf, Goldschrift bleibt.
  background: "linear-gradient(165deg, rgba(46,31,80,.94), rgba(22,14,42,.96))", borderRadius: 999, padding: "8px 13px", fontFamily: "inherit", fontWeight: 800,
  fontSize: 13, boxShadow: "0 3px 10px rgba(0,0,0,.4)", whiteSpace: "nowrap", flex: "0 0 auto",
  backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", ...extra });
/* v1.33.1 (Besitzer: "Aufgeben und Zurueck etwas weniger praesent"): die
   beiden trugen das volle Gefechtskleid - Verlauf, Leuchtkontur, Gluehen,
   fette Schrift - und wogen damit so viel wie das Brett. Jetzt LEISE: fast
   durchsichtiger Grund, zarte Kontur, gedaempfte Schrift, kein Gluehen.
   Man findet sie, sie ziehen den Blick aber nicht mehr vom Brett. Beim
   Aufgeben ist das zugleich ein Schutz; der Bestaetigungsdialog bleibt. */
const leiserKnopf = (extra) => pill({ border: "1px solid rgba(167,139,250,.24)", color: "rgba(226,218,246,.66)",
  background: "rgba(14,10,26,.34)", boxShadow: "none", fontWeight: 600, fontSize: 12, padding: "6px 11px", ...extra });

export function GameScreen({ profile, dispatch, t, match = null, onExit = null, pvp = null, quick = null, onArmy = null, daily = null }) {
  /* ── v1.31.0: DIE ERSTE BEGEGNUNG MIT EINER MONSTERFAEHIGKEIT (Besitzer: "was
     passiert und darstellbar ist, gerne grundsaetzlich mehr andeuten"). Wirkt
     eine der neun Monsterfaehigkeiten zum ALLERERSTEN Mal im Spiel - an wem
     auch immer -, erklaert ein Hinweis ueber dem Brett in einem Satz, was
     geschah. Nicht blockierend: die Partie laeuft weiter; einmal gesehen, nie
     wieder (profile.notices "faeh:<id>"). Die Merker setzt der Kern je Zug. */
  const [erstHinweis, setErstHinweis] = useState(null);
  const erstGesehen = (id) => !!(profile.notices && profile.notices["faeh:" + id]);

  const campaign = !!match;
  const en = profile.lang === "en";
  const hotseat = !pvp && !match && !!quick?.hotseat;   // two players, one device
  const myColor = (daily ? daily.youAre === "b" : pvp && pvp.color === "b") ? BLACK : WHITE;
  const oppColor = myColor === WHITE ? BLACK : WHITE;
  // Match settings are decided BEFORE the match (QuickSetup / campaign node /
  // pvp lobby) — in here they are fixed; the screen is the board, nothing else.
  const difficulty = quick?.difficulty || profile.difficulty || "easy";
  const mapId = quick?.mapId || "classic";
  const mode = quick?.mode || "chess";
  // CLASSIC: pure standard chess — plain level-1 armies, classic art, Elo bot
  const classic = mode === "classic" || (pvp && pvp.rules === "chess");
  // WER SCHACH SPIELT, SOLL SCHACHFIGUREN SEHEN. Der creme/anthrazit-Satz kam
  // bis v0.41 NIRGENDS an: die Livree wurde vor dem Modus geprueft, und die
  // steht per APP_DESIGN auf "carved" - also lag ueberall der geschnitzte
  // Goldsatz, auch im reinen Schach. Nachgewiesen mit tools/pruefe-klassiksatz.mjs.
  // Die Fernpartie zaehlt mit: sie traegt ihr Regelwerk in daily.rules, war
  // aber in `classic` nie enthalten (dort haengen auch Kartenwahl und Suchtiefe
  // dran, die fuer die Fernpartie anders laufen) - darum ein eigenes Merkmal
  // nur fuer die OPTIK.
  const klassikBasis = classic || (daily && (daily.rules || "hp") === "chess");

  const map = daily ? mapById(daily.map) : pvp ? mapById(pvp.mapId) : campaign ? mapById(match.map) : mapById(classic ? "classic" : mapId);
  const rules = daily ? (daily.rules || "hp") : pvp ? (pvp.rules || "hp") : campaign ? match.rules : classic ? "chess" : mode;
  const depth = campaign ? match.depth : classic ? eloDepth(quick?.elo) : difficultyById(difficulty).depth;
  const playerArmy = useMemo(() => buildArmy(profile, map, campaign ? match.excludeId : null, rules, classic), [profile, map]); // eslint-disable-line
  const freshSeed = () => (Date.now() ^ ((Math.random() * 0x7fffffff) | 0)) >>> 0;

  // ── pause & resume (v0.19): a campaign match interrupted mid-fight waits in
  // the profile (compact snapshot via the codec, history dropped) and picks up
  // exactly where it stood — board, potions, clock and burned time-turners.
  const resume = campaign && !pvp && profile.pausedMatch?.v === 1
    && profile.pausedMatch.nodeId === match.nodeId ? profile.pausedMatch : null;
  const [state, setState] = useState(() => {
    if (daily) {
      // THE LONG GAME, REBUILT: the server keeps no board, only the seed, both
      // armies and every command played. Replaying them lands on exactly the
      // position both players last saw — no state was ever serialised.
      const g0 = createGame(daily.armyW, daily.armyB,
        { map: mapById(daily.map), rules: daily.rules || "hp", seed: daily.seed >>> 0 });
      return (daily.moves || []).reduce((st, cmd) => { try { return reduce(st, cmd).state; } catch { return st; } }, g0);
    }
    if (resume) { try { return decodeState(resume.enc); } catch { /* corrupt → fresh */ } }
    if (pvp) {
      const mine = classic ? buildArmyFromFormation(() => 1, mapById("classic").defaultFormation) : playerArmy;
      const white = myColor === WHITE ? mine : pvp.oppArmy;
      const black = myColor === WHITE ? pvp.oppArmy : mine;
      return createGame(white, black, { map, rules, seed: pvp.seed >>> 0 });
    }
    const seed = freshSeed();
    if (hotseat || classic) {
      const side = () => buildArmyFromFormation(() => 1, map.defaultFormation);
      if (hotseat) return createGame(side(), side(), { map, rules, seed });
      const ai = buildArmyFromFormation(() => 1, map.defaultFormation);
      return createGame(side(), ai, { map, rules, seed });
    }
    /* v1.0.22: auch der GEGNER im Klassischen ist der blanke Standardsatz. */
    let ai = campaign ? match.aiArmy : classic ? buildArmyFromFormation(() => 1, map.defaultFormation) : buildAiArmyForMap(difficulty, map, seed);
    // THE GRANDMASTER REDEPLOYS: every attempt at the Keep meets a freshly
    // shuffled back rank — losing means facing a NEW array, and only the
    // Seeress's gaze reveals it before the first horn.
    if (campaign && match.nodeId === "n22" && ai?.back?.length) {
      const arr = [...ai.back]; let sh = seed >>> 0;
      for (let i = arr.length - 1; i > 0; i--) {
        sh = (Math.imul(sh, 1664525) + 1013904223) >>> 0;
        const j = sh % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      ai = { ...ai, back: arr };
    }
    return createGame(playerArmy, ai, { map, rules, seed, potions: rules === "hp" ? { w: profile.items?.potion || 0, b: 0 } : undefined });
  });
  /* v1.31.0: welche Monsterfaehigkeit hat in DIESEM Zug gewirkt? */
  useEffect(() => {
    if (!state || state.rules !== "hp") return;
    const funde = [];
    if (state.steinhaut != null) funde.push("steinhaut");
    if (state.aufstand != null) funde.push("unsterblich");
    if (state.widerhall) funde.push("widerhall");
    if (state.beute && Object.values(state.beute).some((v) => v > 0)) funde.push("wegelagerei");
    if ((state.vergiftet && state.vergiftet.length) || (state.giftWirkt && state.giftWirkt.length)) funde.push("gift");
    if (state.aderlass && state.aderlass.length) funde.push("aderlass");
    if (state.blenden) funde.push("blenden");
    if (state.geistFeld != null) funde.push("geistwandel");
    if (state.schreckFelder && Object.keys(state.schreckFelder).length) funde.push("schrecken");
    const neu = funde.find((id) => ABILITIES[id] && !erstGesehen(id));
    if (!neu) return;
    setErstHinweis(neu);
    dispatch({ type: "SET_NOTICE", key: "faeh:" + neu });
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!erstHinweis) return;
    const t = setTimeout(() => setErstHinweis(null), 9000);
    return () => clearTimeout(t);
  }, [erstHinweis]);
  const [desync, setDesync] = useState(false);
  const [potionArm, setPotionArm] = useState(false);
  /* v1.0.70: der Brett-Effekt des Augenblicks (Trank-Heilglanz). Transient:
     gesetzt beim Einsatz, nach 1,3 s geraeumt - der Glyph startet ihn ueber
     key=id selbst neu, hier lebt nur der Ort. */
  const [brettEffekt, setBrettEffekt] = useState(null);
  /* v1.0.73: DER ZERFALL KLINGT, WENN ER ZU SEHEN IST. Der Kern altert die
     Sperren still (transitions.altern); hier wird nur bemerkt, wenn eine
     Sperre ein STADIUM wechselt (heil -> angeschlagen -> Truemmer) oder ganz
     verschwindet - genau dann broeckelt es hoerbar. Kein Klang je Halbzug,
     sonst knirschte es pausenlos. */
  const sperrStandRef = useRef("");
  const [uhrGlut, setUhrGlut] = useState(0);   // v1.0.70: Sanduhr-Puls an der Uhr
  // THE BOARD BELONGS IN THE MIDDLE OF THE SCREEN — not in the middle of
  // whatever is left over. Measured on a 390x844 phone, the chrome above (back
  // bar + the foe's row) stood 75px tall while your row below took 34, so the
  // board's own centring still left it sitting 20px low. We measure both ends
  // live and hand the difference to the board box as padding, which pushes its
  // free area back into symmetry with the viewport on any device.
  const topChromeRef = useRef(null);
  const botChromeRef = useRef(null);
  const [chrome, setChrome] = useState({ top: 0, bottom: 0 });
  useMeasureEffect(() => {
    const measure = () => {
      const t = topChromeRef.current?.getBoundingClientRect().height || 0;
      const b = botChromeRef.current?.getBoundingClientRect().height || 0;
      setChrome((c) => (Math.abs(c.top - t) < 0.5 && Math.abs(c.bottom - b) < 0.5 ? c : { top: t, bottom: b }));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (topChromeRef.current) ro.observe(topChromeRef.current);
    if (botChromeRef.current) ro.observe(botChromeRef.current);
    return () => ro.disconnect();
  }, []);
  const boardPadTop = Math.max(0, Math.round(chrome.bottom - chrome.top));
  const boardPadBottom = Math.max(0, Math.round(chrome.top - chrome.bottom));

  const potionsUsedRef = useRef(resume?.potionsUsed || 0);
  const hourglassUsedRef = useRef(resume?.hourglassUsed || 0);   // time-turners burned this match

  /* ── DIE SPERREN SETZEN (v1.0.63) ────────────────────────────────────────
     Gekauft wird beim Kraemer, GESETZT hier - vor dem ersten Zug, auf die
     dritte oder vierte eigene Reihe, hoechstens zwei. Danach ist der Vorrat
     verbraucht, ob die Mauer nun haelt oder nicht.
     NICHT ueberall: im Duell (beide Seiten muessten setzen duerfen, und der
     Netzcode traegt die Sperren noch nicht), in der Fernpartie, am geteilten
     Geraet und im REINEN Schach ("Klassisch", das ausdruecklich nichts als
     Schach sein will) bleibt das Brett leer. Und eine fortgesetzte Partie
     hat ihre Sperren laengst stehen. */
  const sperrenErlaubt = !pvp && !daily && !hotseat && !classic && !resume;
  const [vorrat, setVorrat] = useState(() => {
    const v = {};
    if (sperrenErlaubt) for (const art of Object.keys(SPERR_ARTEN)) {
      const n = profile.items?.[art] || 0;
      if (n > 0) v[art] = n;
    }
    return v;
  });
  const [sperrWahl, setSperrWahl] = useState(() => Object.keys(vorrat)[0] || null);
  const [setzen, setSetzen] = useState(() => Object.keys(vorrat).length > 0);
  /* Was am Ende wirklich stand, wird abgerechnet. WICHTIG bei der
     FORTGESETZTEN Partie: dort laeuft keine Setzphase mehr, die Mauern
     stehen aber schon auf dem Brett - ohne diese Zaehlung waere der Vorrat
     nie belastet worden (pausieren, fortsetzen, Mauer geschenkt). */
  const sperrenVerbrauchtRef = useRef((() => {
    const z = {};
    for (const sp of Object.values(state.sperren || {})) if (sp?.von === WHITE) z[sp.art] = (z[sp.art] || 0) + 1;
    return z;
  })());
  const vorratLeer = Object.values(vorrat).every((n) => !n);
  /* Die Felder kommen aus dem Regelwerk, nicht aus dem Schirm: dieselbe
     Wahrheit, die auch der Netzcode spaeter lesen wird. */
  const setzbar = useMemo(() => (setzen && !vorratLeer ? sperrFelder(state, WHITE) : []), [setzen, state, vorratLeer]);
  useEffect(() => {
    const stand = Object.entries(state.sperren || {})
      .map(([i, sp]) => `${i}:${sp?.art}:${sp?.hp}`).sort().join("|");
    const vorher = sperrStandRef.current;
    sperrStandRef.current = stand;
    if (!vorher || vorher === stand || !animAn() || setzen) return;
    /* nur wenn WENIGER Leben oder eine Sperre fort ist - Setzen klingt schon */
    if (stand.length < vorher.length || vorher.split("|").some((e) => e && !stand.includes(e))) {
      /* v1.1.1 (Besitzer: "ein Stein, den man zerstoert, darf anders klingen
         wie ein Holz"): welche Art hat gelitten? Der alte Eintrag traegt sie
         mit (index:art:hp), also faellt sie aus dem Vergleich heraus - kein
         zweiter Zustand, der veralten kann. Zaun = Holz, Mauer und Bollwerk =
         Stein; ohne erkennbare Art bleibt der alte Zerfall. */
      const getroffen = vorher.split("|").filter((e) => e && !stand.includes(e))
        .map((e) => e.split(":")[1]);
      const art = getroffen.includes("zaun") ? "holzbruch"
        : getroffen.some((a) => a === "mauer" || a === "bergfried") ? "steinbruch"
        : "zerfall";
      try { klang(art); } catch {}
    }
  }, [state.sperren]);   // eslint-disable-line

  function setzeOderNimm(i) {
    const steht = state.sperren?.[i];
    if (steht) {
      if (steht.von !== WHITE) return;                 // fremde Mauer bleibt stehen
      setState((s) => ({ ...s, sperren: nimmSperre(s.sperren, i) }));
      setVorrat((v) => ({ ...v, [steht.art]: (v[steht.art] || 0) + 1 }));
      if (!sperrWahl) setSperrWahl(steht.art);
      try { klang("wahl"); } catch {}
      return;
    }
    const art = sperrWahl;
    if (!art || !(vorrat[art] > 0)) return;
    setState((s) => {
      const neu = setzeSperre(s, i, art, WHITE, 0);
      if (neu === s.sperren) return s;                 // Regel sagt nein
      setVorrat((v) => ({ ...v, [art]: v[art] - 1 }));
      return { ...s, sperren: neu };
    });
    /* v1.0.73: eine Sperre wird SATT gesetzt - Stein auf Holz, nicht der
       leichte Waehlen-Tipp. Das Zuruecknehmen bleibt beim Tipp. */
    try { klang("sperrsetzen"); } catch {}
  }
  /* Beim Abschluss der Setzphase steht fest, was das Feld gekostet hat: nur
     was WIRKLICH auf dem Brett steht, wird vom Vorrat abgezogen. Wer nichts
     setzt, zahlt nichts. */
  function setzenFertig() {
    const zaehlung = {};
    for (const s of Object.values(state.sperren || {})) if (s?.von === WHITE) zaehlung[s.art] = (zaehlung[s.art] || 0) + 1;
    sperrenVerbrauchtRef.current = zaehlung;
    setSetzen(false);
  }
  function usePotion(i) {
    setPotionArm(false);
    setState((s) => {
      const r = reduce(s, potionCommand(WHITE, i));
      if (r.state !== s) {
        potionsUsedRef.current++; try { klang("trank"); } catch {}
        /* v1.0.70 (Besitzer): der Lebenstrank LEUCHTET - ein roter Heilglanz
           laeuft einmal durch die getraenkte Figur (Maske im PieceGlyph). */
        if (animAn()) {
          const id = Date.now();
          setBrettEffekt({ at: i, art: "trank", id });
          setTimeout(() => setBrettEffekt((cur) => (cur && cur.id === id ? null : cur)), 1300);
        }
      }
      return r.state;
    });
  }
  const [rated, setRated] = useState(null);          // { rating, delta } after a pvp match
  const [rematch, setRematch] = useState("");        // "" | "wait" | "offer"
  const [banner, setBanner] = useState(null);
  /* ── DER PLATZTAUSCH DES GELEITS (v1.12.1) ───────────────────────────────
     Zwei Zustaende: ob der Knopf armiert ist, und welche Figur bereits
     gewaehlt wurde. Beim zweiten Tippen tauschen sie.

     Warum nicht einfach Zielfelder anzeigen wie bei einem Zug: der Tausch IST
     kein Zug. Wuerde er so aussehen, erwartete man ein Zielfeld - und jede
     Figur, die man antippt, waere ein moegliches Ziel. Der armierte Knopf
     sagt vorher, was gleich passiert. */
  const [geleitAktiv, setGeleitAktiv] = useState(false);
  const [geleitWahl, setGeleitWahl] = useState(null);
  const [intro, setIntro] = useState(() => !resume && !!(match && match.node && (match.node.storyDe || match.node.storyEn)));
  // the life-battle briefing rides just behind the story card, every match,
  // until the player waves it off for good
  const [dailySent, setDailySent] = useState(false);
  /* v0.79: der AUFTRITT. Steht ein Monster oder der Kapitelmeister auf der
     anderen Seite, klingt sein Erscheinen einmal beim Einstieg - der Meister
     mit Glocke und Chor, die Bestie mit Stein und Atem. */
  useEffect(() => {
    if (resume || !match?.boss?.bossId || match.boss.bossId.startsWith("pb_")) return;
    const feierlich = match?.node?.final;
    const t0 = setTimeout(() => { try { klang(feierlich ? "meister" : "bestie"); } catch {} }, 700);
    return () => clearTimeout(t0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /* v0.80: DIE MUSIK DER PARTIE. Kapitelfinale traegt durchweg das
     Meisterthema; sonst beginnt die Partie ruhig und kippt in die
     SPANNUNGSSTUFE, sobald das Kraefteverhaeltnis deutlich auseinanderlaeuft
     (unter 0,72 hinein, ueber 0,90 wieder heraus - die Hysterese verhindert
     Flattern an der Schwelle). Gemessen wird, was zaehlt: im HP-Gefecht die
     Lebenspunkte, im Schach der Figurenwert. */
  const kampfFinale = !!(campaign && match?.node?.final);
  const spannungRef = useRef(false);
  useEffect(() => {
    try { musikBereich(kampfFinale ? "meister" : "kampf"); } catch {}
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (kampfFinale || finished.current) return;
    let mir = 0, ihm = 0;
    for (const p of state.board) {
      if (!p || p.kind === "D+") continue;
      const w = hpMode ? Math.max(1, p.hp || 1) : (VALUE[p.kind] || 300) / 100;
      if (p.color === myColor) mir += w; else ihm += w;
    }
    const q = mir / Math.max(ihm, 0.001);
    const drin = q < 0.72 || q > 1 / 0.72;
    const raus = q > 0.9 && q < 1 / 0.9;
    const eng = drin ? true : raus ? false : spannungRef.current;
    if (eng !== spannungRef.current) {
      spannungRef.current = eng;
      /* v0.88 (Besitzer: "das Gefecht ist viel zu krass"): die Partie
         WECHSELT DAS STUECK NICHT MEHR. Es gibt ein einziges, zurueckhaltendes
         Gefechtsthema - dieselbe gezupfte Sprache, nur etwas draengender im
         Puls. Die Kraeftemessung bleibt stehen (sie kostet nichts und trug
         schon einmal), aber sie schaltet keine Musik mehr um: Hintergrund
         soll Hintergrund bleiben. */
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  const [brief, setBrief] = useState(() => !resume && !profile.notices?.hpBrief);
  // THE SEERESS'S GAZE: with a seer actively fielded, the enemy array lies
  // open BEFORE the first horn — study it, or step back to rearrange.
  // ONLINE the gaze does more: the seer may SWAP own pieces on the spot,
  // while the foe waits behind a notice; the swaps travel with scoutDone so
  // both boards stay identical.
  const armyHasSeer = (a) => !!a?.back?.some((sp) => sp.kind === "SE" || sp.kind === "H"); // seeress (Crown), hawk (Shadow)
  const mySeerOnline = !!pvp && !classic && armyHasSeer(playerArmy);
  const oppSeerOnline = !!pvp && !classic && armyHasSeer(pvp?.oppArmy);
  const foresight = (!!campaign && !resume && !pvp && hasForesight(profile, map, rules)) || mySeerOnline;
  const [scout, setScout] = useState(() => foresight && (!!pvp || !(match && match.node && (match.node.storyDe || match.node.storyEn))));
  const [scoutWaitOpp, setScoutWaitOpp] = useState(() => oppSeerOnline); // the foe reads — we wait
  const scoutSwapsRef = useRef([]);      // [fromIdx, toIdx] pairs the seer performed
  const [scoutSel, setScoutSel] = useState(null);
  function scoutTap(i) {                 // swap two OWN pieces during the online scout
    const pc = state.board[i];
    if (pc && (pc.kind === "D+" || (pc.big && pc.kind === "D"))) { setScoutSel(null); return; } // the block stays put
    if (scoutSel == null) { if (pc && pc.color === myColor) setScoutSel(i); return; }
    if (i === scoutSel) { setScoutSel(null); return; }
    if (!pc || pc.color !== myColor) { setScoutSel(null); return; }
    const a = scoutSel; setScoutSel(null);
    scoutSwapsRef.current.push([a, i]);
    setState((s) => { const b = [...s.board]; [b[a], b[i]] = [b[i], b[a]]; return { ...s, board: b }; });
  }
  function endScout() {
    setScout(false);
    if (pvp) pvp.net.send({ t: "scoutDone", matchId: pvp.matchId, swaps: scoutSwapsRef.current });
  }
  const [thinking, setThinking] = useState(false);
  const finished = useRef(false);
  const warSchach = useRef(false);   /* v0.77: der Schach-Klang nur beim Wechsel, nicht bei jedem Neuzeichnen */
  /* v0.79 (Besitzer): DIE MELDUNGSPLAKETTE. "Du bist am Zug" stand als nackte
     Schrift verloren im Raum - jetzt gibt es EINEN festen Platz fuer alles,
     was das Spiel zu sagen hat: wer dran ist, Schach, Stillstand, und fuer
     ein paar Sekunden das letzte Ereignis ("Laeufer gefallen", "Treffer -
     Turm -3"). Das Ereignis erscheint MIT dem Einschlag, nicht vorher -
     dieselbe Dauerformel wie Animation und Klang. */
  const [ereignis, setEreignis] = useState(null);
  useEffect(() => {
    const lm = state.lastMove;
    if (!lm || finished.current) return;
    const wer = (kind) => {
      const ch = CHARACTERS_BY_ID[KIND_TO_CHAR[kind]];
      return ch ? (en ? ch.nameEn : ch.nameDe) : (en ? "Piece" : "Figur");
    };
    /* v1.1.2 (Besitzeridee): "Man koennte dieses Aufloesen der Perle immer mit
       einem kleinen Ton versehen." Der Zug traegt, welches Talent er
       verbraucht hat (consumes) - genau daran haengt der Klang. Er laeuft
       SOFORT, waehrend die Perle aufstrahlt, und nicht erst mit der Meldung:
       der Ton gehoert zum Verglimmen, nicht zum Text danach. */
    if (lm.consumes) { try { klang("faehigkeit"); } catch {} }
    let text = null;
    /* 4.9.2026 (Besitzerbefund "jemand wollte ihn umwerfen, aber er ist
       nicht gestorben"): DER SCHILD MELDET SICH. Im Schachmodus faengt ein
       Schild den Schlag ab und der Angreifer prallt zurueck - eine Regel, die
       ohne Meldung wie ein Fehler aussah, seit die Schildperlen vom Brett
       sind. Jetzt sagt das Band, was geschah und was bleibt. */
    if (lm.bounced && lm.hitKind) {
      const ziel = state.board[lm.to];   // beim Abprallen steht das Ziel noch auf seinem Feld
      const rest = ziel && typeof ziel.shield === "number" ? ziel.shield : null;
      const name = ziel && ziel.hero ? "Grand Gambit" : wer(lm.hitKind);
      text = en ? `Shield! ${name} blocked the blow${rest != null ? ` — ${rest} left` : ""}`
                : `Schild! ${name} fängt den Schlag ab${rest != null ? ` — noch ${rest}` : ""}`;
    }
    else if ((lm.capture || lm.lethal) && lm.hitKind) text = en ? `${wer(lm.hitKind)} falls` : `${wer(lm.hitKind)} gefallen`;
    else if (lm.damaged && lm.hitKind) text = en ? `Hit — ${wer(lm.hitKind)} −${lm.dmg || 1}` : `Treffer — ${wer(lm.hitKind)} −${lm.dmg || 1}`;
    else if (lm.special === "castle") text = en ? "Castled" : "Rochade";
    else if (lm.promotion) text = en ? "Promoted!" : "Krönung!";
    if (!text) return;
    const dauer = zugDauerMs(lm, myColor, hotseat, state.w);
    const t1 = setTimeout(() => setEreignis(text), dauer);
    const t2 = setTimeout(() => setEreignis(null), dauer + 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.lastMove]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── the stage clock (v0.4): some campaign stages from league 5 carry time
  // pressure — a total budget (bosses) or a per-move limit (hard stages).
  // The clock only runs on YOUR move and pauses for story intro and banner;
  // hitting zero flags the game, chess-style.
  // A DUEL BRINGS ITS OWN CLOCK. Campaign stages carry a timer from the node;
  // an online duel carries the one both players agreed on in the lobby, and
  // there BOTH sides burn time — so the foe's budget is tracked too, and every
  // completed move hands its owner the increment back (Fischer).
  const timer = campaign ? match.timer : (pvp?.clock || null);
  const [clock, setClock] = useState(resume?.clock ?? (timer ? timer.seconds : null));
  const [foeClock, setFoeClock] = useState(timer && pvp ? timer.seconds : null);
  const lastTurn = useRef(state?.turn);
  useEffect(() => {
    if (timer?.type === "move" && state.turn === myColor) setClock(timer.seconds);
  }, [state, timer, myColor]);
  useEffect(() => {
    // the turn changed: whoever just moved gets the increment
    if (!timer || !pvp || state.turn === lastTurn.current) { lastTurn.current = state?.turn; return; }
    const moved = lastTurn.current;
    lastTurn.current = state.turn;
    const inc = timer.inc || 0;
    if (!inc) return;
    if (moved === myColor) setClock((c) => (c == null ? c : c + inc));
    else setFoeClock((c) => (c == null ? c : c + inc));
  }, [state.turn]); // eslint-disable-line
  useEffect(() => {
    // the foe's glass runs while it is his move
    if (!timer || !pvp || banner || state.turn === myColor) return;
    const id = setInterval(() => setFoeClock((c) => (c == null ? c : c - 1)), 1000);
    return () => clearInterval(id);
  }, [timer, pvp, state.turn, myColor, banner]);
  useEffect(() => {
    if (pvp && timer && foeClock != null && foeClock <= 0 && !finished.current) finish("win", "time");
  }, [foeClock]); // eslint-disable-line
  useEffect(() => {
    if (!timer || clock == null || banner || intro || scout || scoutWaitOpp || setzen || state.turn !== myColor) return;
    const id = setInterval(() => setClock((c) => (c == null ? c : c - 1)), 1000);
    return () => clearInterval(id);
  }, [timer, state.turn, myColor, banner, intro, scout, scoutWaitOpp, setzen]); // eslint-disable-line
  useEffect(() => {
    if (timer && clock != null && clock <= 0 && !finished.current) finish("loss", "time");
  }, [clock]); // eslint-disable-line

  function reset(diff, m = map, rl = rules) {
    finished.current = false;
    setBanner(null);
    setThinking(false);
    setClock(timer ? timer.seconds : null);
    const seed = freshSeed();
    if (hotseat) {
      const side = () => buildArmyFromFormation(() => 1, m.defaultFormation);
      setState(createGame(side(), side(), { map: m, rules: rl, seed }));
      return;
    }
    const ai = campaign ? match.aiArmy : classic ? buildArmyFromFormation(() => 1, m.defaultFormation) : buildAiArmyForMap(diff, m, seed);
    setState(createGame(buildArmy(profile, m, campaign ? match.excludeId : null, rl, classic), ai, { map: m, rules: rl, seed }));
  }
  function newGame() { reset(difficulty); }

  // End of game → derive the result purely from the command log (event-sourced).
  function finish(result, reason) {
    if (finished.current) return;
    finished.current = true;
    /* v0.77: der Abpfiff bekommt seinen Klang. Remis bleibt still - weder
       Jubel noch Trauer waeren ehrlich. v0.79: Nach dem Sieg feiert die
       Feier gestaffelt weiter - erst der Hornruf der WERBUNG (wenn ein Held
       beitritt), oder das KAPITELENDE mit Glocke und Blatt. */
    if (result === "win") {
      klang("sieg");
      const beitritt = campaign && match?.boss?.unlocks;
      const kapitelZu = campaign && match?.node?.final;
      if (beitritt) setTimeout(() => { try { klang("werbung"); } catch {} }, 2200);
      else if (kapitelZu) setTimeout(() => { try { klang("kapitelEnde"); } catch {} }, 2300);
    }
    else if (result === "loss") klang("niederlage");
    if (hotseat) {
      setBanner({ result, reason, hotseat: true,
        gained: { gold: 0, sp: 0, xp: 0, levelBefore: 0, levelAfter: 0, newAchievements: [] } });
      return;
    }
    const foe = pvp ? pvp.oppArmy : campaign ? match.aiArmy : classic ? buildArmyFromFormation(() => 1, map.defaultFormation) : buildAiArmyForMap(difficulty, map, state.seed);
    const summary = summarizeMatch(playerArmy, foe, state.seed, state.log, result, myColor, { map, rules });
    summary.hpRules = rules === "hp";
    summary.potionsUsed = potionsUsedRef.current;
    summary.hourglassUsed = hourglassUsedRef.current;
    summary.sperrenGesetzt = sperrenVerbrauchtRef.current;   // v1.0.63: gesetzte Sperren sind verbraucht
    summary.resigned = reason === "resign" && result === "loss";
    // The purse (v0.5): every win pays gold — stages carry their own reward
    // (bosses more, replays half), free play scales with difficulty.
    summary.gold = result !== "win" ? 0
      // REGEL DES BESITZERS (v0.45): jede Station bleibt wiederholbar, aber
      // nur der FREUNDSCHAFTSKAMPF zahlt noch - minimal (15 % Gold; die
      // 25 % XP vergibt advanceCampaign). Jede andere Wiederholung: nichts.
      // Vorher zahlte jede Wiederholung das halbe Gold.
      : campaign ? (match.firstClear ? (match.gold || 0) : match.friendly ? Math.max(3, Math.round((match.gold || 0) * 0.15)) : 0)
      : pvp ? 6
      : winGold(difficulty);
    const { profile: next, gained } = applyResult(profile, summary);
    // every rung climbed this battle becomes a tale: which piece learned what
    const lessons = [];
    for (const cid of Object.keys(summary.charXpGains || {})) {
      const ch = CHARACTERS[cid]; if (!ch) continue;
      const before = characterLevel(profile, cid), after = characterLevel(next, cid);
      if (after <= before) continue;
      const nm = en ? ch.nameEn : ch.nameDe;
      for (const rung of ch.ladder || []) {
        if (rung.level > before && rung.level <= after) {
          if (rung.ability && ABILITIES[rung.ability]) lessons.push({ nm, ab: ABILITIES[rung.ability] });
          else if (rung.shield) lessons.push({ nm, shield: rung.shield });
        }
      }
      if (cid === "gambit" && gambitTier(after) > gambitTier(before))
        lessons.push({ nm, tier: ["I","II","III","IV","V","VI"][gambitTier(after) - 1] || gambitTier(after) });
    }
    if (lessons.length) setNewSkills(lessons);
    if (campaign && next.pausedMatch?.nodeId === match.nodeId) next.pausedMatch = null;
    /* ── EIN MONSTER FAELLT (v1.0.50, Besitzerentscheid) ─────────────────────
       Der Codex kannte bisher nur BEGEGNET (codex.met). Fuer die Bestechen-
       Freigabe braucht es BESIEGT: erst wer ein echtes Monster geschlagen
       hat, erfaehrt, dass Gold und ein Opfer manche von ihnen kaufen koennen.
       Echte Monster tragen eine bXX-Kennung; die Boss-FASSUNG einer
       Hoffigur ("pb_...") zaehlt nicht - sie ist kein Monster, sie ist ein
       Meister. */
    if (result === "win" && campaign && match?.boss?.bossId && !String(match.boss.bossId).startsWith("pb_")) {
      const beaten = new Set(next.codex?.beaten || []);
      if (!beaten.has(match.boss.bossId)) {
        beaten.add(match.boss.bossId);
        next.codex = { ...(next.codex || {}), beaten: [...beaten] };
      }
    }
    // EVERY piece of gear is a battle prize: the first win reveals the draught,
    // the third opens the star vault, the road unveils the rest — each with its
    // own line on the victory banner, consumables landing one-for-free.
    if (campaign && result === "win" && match.firstClear) {
      const after = { ...next, campaign: { ...next.campaign, cleared: [...(next.campaign?.cleared || []), match.nodeId] } };
      const fresh = Object.values(ITEMS).filter((it) => !itemRevealed(profile, it) && itemRevealed(after, it));
      const newItems = fresh.map((it) => ({ id: it.id, free: it.kind === "consumable" }));
      if (clearedCount(profile) < SP_VAULT_MIN_CLEARED && clearedCount(after) >= SP_VAULT_MIN_CLEARED)
        newItems.push({ id: "spvault" });
      for (const it of fresh) if (it.kind === "consumable")
        next.items = { ...(next.items || {}), [it.id]: Math.min(it.max || 9, (next.items?.[it.id] || 0) + 1) };
      if (newItems.length) gained.newItems = newItems;
    }
    dispatch({ type: "REPLACE", profile: next });
    if (campaign && result === "win") {
      dispatch({ type: "RECORD_STAGE", id: match.nodeId, moves: summary.moveCount || 0 });
      dispatch({ type: "CAMPAIGN_CLEAR", id: match.nodeId });
      // A champion beaten but not won over FLEES the map — leave the map a note
      // so it can stage the escape on return (recruits join the court instead).
      if (match.boss && !match.boss.unlocks && match.firstClear) {
        try { sessionStorage.setItem("gg:fled", match.nodeId); } catch {}
      }
    }
    if (pvp && reason !== "resign" && reason !== "left") {
      const winner = result === "draw" ? "draw" : result === "win" ? pvp.color : (pvp.color === "w" ? "b" : "w");
      pvp.net.send({ t: "result", matchId: pvp.matchId, winner });
    }
    setBanner({ result, gained, reason });
  }

  // Advance the simulation with a single command (player or AI move).
  function play(move) {
    setState((s) => {
      const cmd = moveCommand(move);
      const next = reduce(s, cmd).state;
      // DER KLANG FOLGT DEM ERGEBNIS, nicht der Absicht: erst nach dem Zug
      // steht fest, ob nur gesetzt, getroffen oder gestuerzt wurde.
      // v0.79 (Besitzer): DER TREFFER KLINGT BEIM EINSCHLAG, nicht beim
      // Loslassen. Das Schleifen beginnt sofort (es IST der Weg), der Schlag
      // oder Sturz wartet, bis die Gleit-Animation ankommt - dieselbe
      // Dauerformel wie im Brett (zugDauerMs), damit nichts auseinanderlaeuft.
      // Ein Pfeil fliegt sofort: der Schuetze bewegt sich ja nicht.
      try {
        const lm = next.lastMove || {};
        const schuss = lm.special === "shot";
        const einschlag = lm.lethal || (lm.capture && !lm.damaged) ? "fall" : lm.damaged ? "treffer" : null;
        /* v0.81 (Besitzer): WER SPRINGT, SCHLEIFT NICHT. Ein Sprungzug
           (Springer, oder jeder Zug, der nicht auf einer Linie liegt) macht
           beim Abheben KEINEN Laut - gehoert wird nur die Landung, ein
           leises hoelzernes Tock. Deshalb wandert der Sprungklang ans Ende
           der Flugzeit; das Schleifen dagegen IST der Weg und beginnt
           sofort. Dieselbe Unterscheidung wie in der Gleit-Animation. */
        const fF = lm.from % (next.w || 8), fR = Math.floor(lm.from / (next.w || 8));
        const tF = lm.to % (next.w || 8), tR = Math.floor(lm.to / (next.w || 8));
        const dF = Math.abs(tF - fF), dR = Math.abs(tR - fR);
        const springt = !lm.bounced && (lm.kind === "N" || !!(dF && dR && dF !== dR));
        const flug = zugDauerMs(lm, myColor, hotseat, next.w);
        if (schuss) klang("pfeil");
        else if (lm.special === "castle") klang("rochade");
        else if (lm.special === "dragonFly") klang("drachenflug");
        else if (springt) setTimeout(() => { try { klang("sprung"); } catch {} }, flug);
        else klang("zug");
        if (einschlag && !schuss) {
          setTimeout(() => { try {
            klang(einschlag);
            /* v1.0.73: DIE HANDSCHRIFT DES SCHLAGES KLINGT MIT. Die
               Schlagart kommt aus derselben Quelle wie die Animation
               (schlagArt in anim.js) - Bild und Klang koennen also nicht
               auseinanderlaufen. Der Drache speit statt zu schlagen; sein
               drachenflug-Klang bleibt dem Flug, das Feuer kommt hier.
               Leise unter dem Einschlag (Pegel 0,40-0,48), damit die
               vertraute Holz-Ebene fuehrt und die Handschrift nur faerbt. */
            if (animAn()) {
              const art = schlagArt(lm.kind);
              klang(art === "feuer" ? "drachenfeuer" : art);
            }
            if (next.welle) klang("treffer");
          } catch {} }, flug);
        } else if (einschlag) {
          setTimeout(() => { try { klang(einschlag); } catch {} }, 160);   // der Pfeil braucht einen Wimpernschlag
        }
        // ein verbrauchtes Talent klingt nach seiner Seite
        if (lm.consumed && lm.consumed !== "ranged_shot")
          klang(lm.color === myColor ? "talentGold" : "talentRiss");
        if (lm.promotion) klang("kroenung");
      } catch {}
      if (pvp) pvp.net.send({ t: "cmd", matchId: pvp.matchId, cmd, n: next.log.length, hash: stateHash(encodeState(next)) });
      if (daily) {
        // ONE MOVE, THEN THE GAME GOES BACK ON THE SHELF. The command is filed
        // with the server; if this move ended the game, the outcome rides along
        // so the ladder is settled without a second round trip.
        const st = status(next);
        const over = st.mate || st.stale || (next.rules === "hp" && st.kingDown);
        daily.net.send({ t: "daily:move", gameId: daily.gameId, cmd,
          result: over ? { winner: st.stale ? null : (next.turn === WHITE ? "b" : "w"), reason: st.stale ? "draw" : "mate" } : null });
        setDailySent(true);
      }
      return next;
    });
  }

  // Drive the AI and detect terminal positions after every committed state.
  useEffect(() => {
    if (finished.current) return;
    const st = status(state);
    if (st.check && !warSchach.current) { try { klang("schach"); } catch {} }
    warSchach.current = !!st.check;
    if (st.over) {
      if (st.winner === myColor) finish("win", st.result);
      else if (st.winner === oppColor) finish("loss", st.result);
      else finish("draw", st.grund === "ohneSchaden" ? "ohneSchaden" : st.result);
      return;
    }
    if (!pvp && !daily && !hotseat && state.turn === BLACK) {   // no engine in a correspondence game — a human owes the reply
      setThinking(true);
      const id = setTimeout(() => {
        const mv = chooseMove(state, depth);
        setThinking(false);
        if (mv) play(mv);
      }, 1000);   // a clear beat before the foe moves — no rushed jump into its turn
      return () => clearTimeout(id);
    }
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // PvP: the foe's seer finished — mirror their swaps, then play begins.
  useEffect(() => {
    if (!pvp) return;
    return pvp.net.on("scoutDone", (m) => {
      const swaps = Array.isArray(m.swaps) ? m.swaps : [];
      setState((s) => { const b = [...s.board];
        for (const [a, c] of swaps) if (b[a] !== undefined && b[c] !== undefined) [b[a], b[c]] = [b[c], b[a]];
        return { ...s, board: b }; });
      setScoutWaitOpp(false);
    });
  }, [pvp]); // eslint-disable-line

  // PvP: apply the opponent's relayed commands; verify determinism via hashes.
  useEffect(() => {
    if (!pvp) return;
    const u1 = pvp.net.on("cmd", (m) => {
      setState((s) => {
        const next = reduce(s, m.cmd).state;
        if (m.hash && stateHash(encodeState(next)) !== m.hash) setDesync(true);
        return next;
      });
    });
    const u2 = pvp.net.on("oppResign", () => finish("win", "resign"));
    const u3 = pvp.net.on("oppLeft", () => finish("win", "left"));
    const u4 = pvp.net.on("rated", (m) => { setRated(m); dispatch({ type: "SET_ONLINE", online: { rating: m.rating } }); });
    const u5 = pvp.net.on("rematchOffer", () => setRematch((r) => (r === "wait" ? r : "offer")));
    return () => { u1(); u2(); u3(); u4(); u5(); };
  }, [pvp, state.seed]); // eslint-disable-line

  // Undo is no free lunch anymore (v0.19): each take-back burns a
  // Time-turner from the supply chest — bought with gold, capped at 2.
  const hourglassLeft = Math.max(0, (profile.items?.hourglass || 0) - hourglassUsedRef.current);
  function doUndo() {
    if (finished.current || pvp || hourglassLeft <= 0) return;
    setState((s) => {
      let n = undo(s);
      if (n === s) return s;
      if (n.turn === BLACK) { const m = undo(n); if (m !== n) n = m; }
      hourglassUsedRef.current++;
      if (animAn()) setUhrGlut(Date.now());   // v1.0.70: die Uhr pulst golden
      try { klang("zeitenwender"); } catch {}
      return n;
    });
  }
  const [armResign, setArmResign] = useState(false);
  const [zoomMode, setZoomMode] = useState(false); // the field glass: FREE pinch-zoom up to 200%, the fixed board stays the default
  const [zv, setZv] = useState({ z: 1, x: 0, y: 0 });          // zoom view: scale + pan
  const zoomBox = useRef(null);                                 // the clipping window
  const zPtrs = useRef(new Map());                              // active pointers (pinch/pan)
  const zStart = useRef(null);                                  // gesture baseline
  const zDragged = useRef(false);                               // suppress the tap after a pan
  const clampView = (v) => {
    const el = zoomBox.current; const w = el?.clientWidth || 0, h = el?.clientHeight || 0;
    const z = Math.max(1, Math.min(2, v.z));
    const mx = ((z - 1) * w) / 2, my = ((z - 1) * h) / 2;
    return { z, x: Math.max(-mx, Math.min(mx, v.x)), y: Math.max(-my, Math.min(my, v.y)) };
  };
  const zoomDown = (e) => {
    if (!zoomMode) return;
    zPtrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...zPtrs.current.values()];
    zStart.current = { view: zv, pts: pts.map((p) => ({ ...p })) };
    zDragged.current = false;
  };
  const zoomMove = (e) => {
    if (!zoomMode || !zPtrs.current.has(e.pointerId) || !zStart.current) return;
    zPtrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const now = [...zPtrs.current.values()], st = zStart.current;
    if (now.length >= 2 && st.pts.length >= 2) {                 // PINCH: scale around the fingers
      const d0 = Math.hypot(st.pts[0].x - st.pts[1].x, st.pts[0].y - st.pts[1].y) || 1;
      const d1 = Math.hypot(now[0].x - now[1].x, now[0].y - now[1].y);
      const cx0 = (st.pts[0].x + st.pts[1].x) / 2, cy0 = (st.pts[0].y + st.pts[1].y) / 2;
      const cx1 = (now[0].x + now[1].x) / 2, cy1 = (now[0].y + now[1].y) / 2;
      zDragged.current = true;
      setZv(clampView({ z: st.view.z * (d1 / d0), x: st.view.x + (cx1 - cx0), y: st.view.y + (cy1 - cy0) }));
    } else if (now.length === 1 && st.view.z > 1.01) {           // PAN with one finger, once zoomed
      const dx = now[0].x - st.pts[0].x, dy = now[0].y - st.pts[0].y;
      if (Math.abs(dx) + Math.abs(dy) > 7) zDragged.current = true;
      if (zDragged.current) setZv(clampView({ z: st.view.z, x: st.view.x + dx, y: st.view.y + dy }));
    }
  };
  const zoomUp = (e) => {
    zPtrs.current.delete(e.pointerId);
    const pts = [...zPtrs.current.values()];
    zStart.current = pts.length ? { view: zv, pts: pts.map((p) => ({ ...p })) } : null;
  };
  const zoomWheel = (e) => {                                     // desktop: the wheel is the pinch
    if (!zoomMode) return;
    setZv((v) => clampView({ ...v, z: v.z * (e.deltaY < 0 ? 1.12 : 0.9) }));
  };
  const toggleZoom = () => setZoomMode((on) => { const next = !on; if (!next) setZv({ z: 1, x: 0, y: 0 }); return next; });
  const [flyDone, setFlyDone] = useState(() => !!quick); // the opening flight belongs to the JOURNEY: quick play (incl. classic & hotseat) starts on the spot
  const [flyGo, setFlyGo] = useState(false);       // ... and only AFTER the story sheet is acknowledged
  const [newSkills, setNewSkills] = useState([]);  // "X learns Y" — the banner tells every lesson of this battle
  const [inspect, setInspect] = useState(null);    // the tapped piece's dossier: { i, mode: "own" | "spy" }
  // ── THE CODEX: which exotic foes has the player met before? First
  // encounters keep their secrets (no move-reading) and introduce themselves
  // with a tale instead; from the NEXT battle on they are an open book. ──
  const STD_KINDS = useMemo(() => new Set(["P", "N", "B", "R", "Q", "K", "D+"]), []);
  const codexKey = (pc) => (pc.bossId ? "X:" + pc.bossId : pc.kind);
  const [knownAtStart] = useState(() => new Set(profile.codex?.met || []));
  const [metTold, setMetTold] = useState(() => new Set()); // tales told this battle
  const [firstMeet, setFirstMeet] = useState(null);        // the introduction sheet
  useEffect(() => {
    if (!dispatch || !state?.board) return;
    const met = new Set(profile.codex?.met || []);
    let grew = false;
    for (const pc of state.board) if (pc && pc.color === oppColor && !STD_KINDS.has(pc.kind)) {
      const k = codexKey(pc); if (!met.has(k)) { met.add(k); grew = true; }
    }
    if (grew) dispatch({ type: "REPLACE", profile: { ...profile, codex: { ...(profile.codex || {}), met: [...met] } } });
  }, []);
  const introSpots = useMemo(() => {
    if (flyDone || !flyGo || !state?.board) return null;
    const set = new Set();
    state.board.forEach((pc, i) => { if (pc && pc.color === oppColor && !STD_KINDS.has(pc.kind) && !knownAtStart.has(codexKey(pc))) set.add(i); });
    return set.size ? set : null;
  }, [flyDone, flyGo, state]);
  const seerVision = state?.rules === "hp" && state.board.some((pc) => pc && pc.color === myColor && (pc.kind === "SE" || pc.kind === "H") && (pc.level || 1) >= 2);
  const onEnemyTap = (i, allowed) => {
    const pc = state.board[i]; if (!pc || STD_KINDS.has(pc.kind)) return;
    const k = codexKey(pc);
    if (!knownAtStart.has(k) && !metTold.has(k)) {           // a stranger — the hall tells its tale once
      setMetTold((m) => new Set(m).add(k));
      setFirstMeet({ piece: pc, seen: allowed });
    }
  };
  useEffect(() => { if (!intro && !brief && !flyGo) setFlyGo(true); }, [intro, brief]); // the curtain rises once the tale is told and the rules are said
  useEffect(() => { if (!flyGo) return; const id = setTimeout(() => setFlyDone(true), 2000); return () => clearTimeout(id); }, [flyGo]); // one tap arms, the second concedes
  useEffect(() => {
    if (!armResign) return;
    const id = setTimeout(() => setArmResign(false), 3500);
    return () => clearTimeout(id);
  }, [armResign]);
  function resign() {
    if (pvp) pvp.net.send({ t: "resign" });
    if (hotseat) { finish(state.turn === WHITE ? "loss" : "win", "resign"); return; }
    finish("loss", "resign");
  }

  // Leaving mid-fight pauses instead of forfeiting: snapshot into the profile.
  const pauseRef = useRef(null);
  pauseRef.current = { state, clock };
  function pauseNow() {
    if (!campaign || pvp || finished.current) return;
    const cur = pauseRef.current;
    dispatch({ type: "PAUSE_MATCH", data: { v: 1, nodeId: match.nodeId, enc: encodeState(cur.state),
      potionsUsed: potionsUsedRef.current, hourglassUsed: hourglassUsedRef.current, clock: cur.clock } });
  }
  const [fragtRaus, setFragtRaus] = useState(false);
  // Eine LAUFENDE Partie verlaesst man nicht mit einem Fehlgriff - der
  // Ruecken-Knopf fragt genauso nach wie das Menue. Ist die Partie vorbei
  // (das Ergebnis steht), geht es ohne Rueckfrage.
  function leave() { pauseNow(); onExit && onExit(); }
  function leaveAsk() {
    // banner steht, sobald das Ergebnis feststeht - status() ist hier oben
    // noch nicht berechnet, also fragen wir nur den Banner ab.
    if (banner) { leave(); return; }
    setFragtRaus(true);
  }
  useEffect(() => {
    if (!campaign || pvp) return;
    const fn = () => { if (document.visibilityState === "hidden") pauseNow(); };
    document.addEventListener("visibilitychange", fn);
    // AND ON THE WAY OUT: leaving through anything other than the back arrow —
    // the desktop menu, the browser's back gesture — used to drop the fight on
    // the floor. Unmounting now saves it exactly as the arrow does. A finished
    // match is ignored inside pauseNow, so a win is never resurrected.
    return () => { document.removeEventListener("visibilitychange", fn); pauseNow(); };
  }, []); // eslint-disable-line

  const hsFlip = quick?.hotseatFlip !== false;        // optional: keep the board fixed (phone stays in hand)
  const viewColor = hotseat ? (hsFlip ? state.turn : WHITE) : myColor; // the board faces whoever moves
  /* v1.0.63: waehrend die Sperren gesetzt werden, ruht das Spiel - erst
     "Los" gibt das Brett fuer Zuege frei.
     setzPhase heisst: der Balken steht WIRKLICH auf dem Schirm. Liegt noch
     eine Erzaehlkarte oder die HP-Einweisung darueber, leuchten auch die
     Felder nicht - sonst pulsiert das Brett unter einem Fenster, das es
     verdeckt (am lebenden DOM gemessen, v1.0.63). */
  /* GEMESSEN, nicht vermutet: `brief` allein taugt hier nicht als Sperre. Die
     HP-Einweisung ERSCHEINT nur im HP-Gefecht (brief && hpMode); im
     Schach-Modus bleibt das Merkmal ewig wahr, ohne dass je ein Fenster
     stuende - der Setzbalken kam dann nie. */
  const setzPhase = setzen && !intro && !(brief && state.rules === "hp") && !banner && !scout && !scoutWaitOpp;
  const myTurn = (hotseat ? true : state.turn === myColor) && !banner && !scout && !scoutWaitOpp && !setzen && !(daily && dailySent);
  /* Ist der Platztausch gerade moeglich? Nur wenn der Bund erwacht ist, alle
     drei Figuren stehen und er noch nicht verbraucht wurde. */
  const geleitFelder = geleitTauschbar(state, myColor);
  const geleitOffen = !!geleitFelder;
  /* Erst die eine Figur, dann die andere - beim zweiten Tippen tauschen sie.
     Wer dieselbe zweimal tippt, nimmt die Wahl zurueck; das ist der
     erwartete Weg zurueck, ohne einen eigenen Abbrechen-Knopf. */
  const geleitTipp = (feld) => {
    if (!geleitFelder || !geleitFelder.includes(feld)) return;
    if (geleitWahl == null) { setGeleitWahl(feld); try { klang("menue"); } catch {} return; }
    if (geleitWahl === feld) { setGeleitWahl(null); return; }
    try { klang("zeitriss"); } catch {}
    setState((s2) => reduce(s2, geleitCommand(myColor, geleitWahl, feld)).state);
    setGeleitWahl(null); setGeleitAktiv(false);
  };
  const st = status(state);
  const hpMode = state.rules === "hp";
  /* v0.86 (Besitzer): REINES SCHACH IST REINES SCHACH - gleich, auf welchem
     Weg man hineingeraten ist. Zuvor wurde nur die Betriebsart gefragt
     (classic / Tagesraetsel); ein SCHNELLES SPIEL mit Schachregeln fiel
     durchs Raster und zeigte weiter die Faehigkeiten- und Ausruestungs-
     leisten, die es dort gar nicht gibt. Jetzt entscheidet die REGEL der
     laufenden Partie - und die kennt erst der Zustand, darum steht diese
     Zeile hier und nicht oben bei den Betriebsarten. */
  /* v0.87 - EIGENER FEHLER AUS v0.86, sofort behoben: dort habe ich "reines
     Schach" an den REGELN erkannt und daran ALLES aufgehaengt - auch die
     Figurenoptik. Die fruehen Kampagnenstationen laufen aber nach
     Schachregeln, und so standen im Feldzug ploetzlich gewoehnliche
     Turnierfiguren statt der geschnitzten. Das war Unsinn: im Feldzug
     gehoeren IMMER die geschnitzten Figuren aufs Brett.
     Darum jetzt ZWEI getrennte Begriffe:
       klassikOptik - wie sieht das Brett aus? Nur die echte klassische
                      Betriebsart (Schnellspiel "Klassisch", Tagesraetsel,
                      klassisches Online-Duell). NIE die Kampagne.
       schlichteRegeln - gelten Talente und Ausruestung? Daran haengen die
                      Leisten und die Brettmitte, nicht das Aussehen. */
  const schlichteRegeln = state.rules === "chess";
  const klassikOptik = klassikBasis && !campaign;
  /* v0.86 (Besitzer): "bei klassischem Schach ist die Leiste unnoetig". Der
     Modus allein reicht als Bedingung aber nicht - auch im Modus SCHACH hat
     oft keine Figur Faehigkeiten (etwa bevor der Gambit erwacht), und dann
     steht dort eine leere Schublade. Darum entscheidet nicht die Spielart,
     sondern der Inhalt: hat auch nur EINE eigene Figur ein Talent, einen
     Schild oder eine Stufe ueber 1, erscheint die Leiste - sonst gehoert
     der Platz dem Brett. */
  const leisteNoetig = useMemo(() => {
    if (schlichteRegeln) return false;   // ohne Talente keine Talentleiste
    for (const p of state.board) {
      if (!p || p.color !== (hotseat ? state.turn : myColor)) continue;
      if ((p.abilities && p.abilities.length) || p.shield || (p.level || 1) > 1 || p.hero) return true;
    }
    return false;
  }, [state.board, schlichteRegeln, hotseat, state.turn, myColor]);

  // DIE FELDER DES BESITZERS (v0.66): Kampagne traegt den Streifen ihres
  // Kapitels; der Endboss des letzten Kapitels bekommt die Blitz-Kachel auf
  // den dunklen Feldern; klassische Partien wechseln durch drei Streifen
  // (je Partie fest, damit "ein bisschen Aenderung im Spiel ist").
  const classicWurf = useMemo(() => Math.floor(Math.random() * 3), []);
  const { feld, feldDunkel } = useMemo(() => {
    if (campaign) {
      const lg = ((kapitelVon(match, profile) - 1) % 12) + 1;   // v1.1.5: Kapitel des Kampfes
      const fin = lg >= 11 && !!match?.boss;
      return { feld: FELD_KAPITEL[lg - 1], feldDunkel: fin ? FELD_FINALE : null };
    }
    if (!hpMode) return { feld: FELD_CLASSIC[classicWurf], feldDunkel: null };
    return { feld: null, feldDunkel: null };
  }, [campaign, hpMode, classicWurf]);
  // die Streifen vorwaermen, damit das Brett nicht nackt aufwacht
  useEffect(() => { for (const q of [feld, feldDunkel]) if (q) { const im = new Image(); im.src = q; } }, [feld, feldDunkel]);
  const F = hpMode ? forces(state.board) : null;
  /* Stillstand-Warnung: die letzten zehn Zuege vor dem HP-Remis ansagen. */
  const stillstandRest = hpMode ? Math.ceil((HP_REMIS_HALBZUEGE - (state.ohneSchaden || 0)) / 2) : 99;
  const statusText = banner ? "" : st.check ? t("game.check") : stillstandRest <= 10 ? t("game.stillstandIn", { n: Math.max(0, stillstandRest) }) : hotseat ? t(state.turn === WHITE ? "hs.turnWhite" : "hs.turnBlack") : myTurn ? t("game.turnYou") : pvp ? t("online.turnOpp") : t("game.turnAi");
  const clockLbl = clock != null ? `${Math.floor(Math.max(0, clock) / 60)}:${String(Math.max(0, clock) % 60).padStart(2, "0")}` : null;
  const clockHot = clock != null && (timer?.type === "move" ? clock <= 5 : clock <= 30);
  // DIE UHR DARF NICHT ZU UEBERSEHEN SEIN (Besitzer, v0.45): "man vergisst
  // sonst zu ziehen". Drei Stufen: hot (golden, wie gehabt) -> gross ->
  // ALARM: die Uhr waechst deutlich, pulsiert rot und das Brett selbst
  // glimmt im Takt (Innenrand-Schein, keine neuen Elemente auf dem Feld).
  const clockGross = clock != null && (timer?.type === "move" ? clock <= 5 : clock <= 20);
  const clockAlarm = clock != null && (timer?.type === "move" ? clock <= 3 : clock <= 10);
  // in a duel the FOE's glass hangs beside your own, so you can see him burn
  const foeLbl = foeClock != null ? `${Math.floor(Math.max(0, foeClock) / 60)}:${String(Math.max(0, foeClock) % 60).padStart(2, "0")}` : null;

  const [wideMatch, setWideMatch] = useState(typeof window !== "undefined" && window.innerWidth >= 940);
  useEffect(() => {
    const on = () => setWideMatch(window.innerWidth >= 940);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  // Desktop: the board claims every pixel it can get — pills, trays and
  // status move into a slim column beside it. Phones keep the stacked layout.
  const headerBar = (<>
      {/* top bar: ‹ back · context · clock · ⚑ resign — everything floats, nothing scrolls */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: "10px 10px 6px", flex: "0 0 auto" }}>
        {/* KEIN ZURUECK in Online-Partien mit Uhr (Besitzer, v0.61): der
            einzige Ausgang aus einer laufenden Schnellpartie ist Aufgeben -
            wer die Uhr angenommen hat, laeuft nicht einfach vom Tisch. */}
        {onExit && !(pvp && timer) && (
          <button onClick={leaveAsk} style={leiserKnopf()}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>‹</span> {t("common.back")}
          </button>
        )}
        <div style={{ flex: "1 1 130px", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, overflow: "hidden" }}>
          {pvp ? <>
              <Chip color={T.gold} bg={T.sel}><JewelIc kind="power" size={12} /> {pvp.oppName}</Chip>
              <Chip color={T.dim} bg={T.sel}>{pvp.oppScore}</Chip>
              {desync && <Chip color={"#b4636c"} bg={T.sel}>{t("online.desync")}</Chip>}
            </>
            : campaign ? <>
              {/* Stationsname-Pille gestrichen (Besitzer, v0.70.3): die
                  Kampagnenkarte nennt die Station bereits. */}
              {match.boss && <Chip color={match.boss.bossId?.startsWith("pb_") ? T.gold : "#b4636c"} bg={T.sel}>{match.boss.bossId?.startsWith("pb_") ? <JewelIc kind="power" size={12} /> : <SkullIc color="#b4636c" size={12} />} {en ? match.boss.nameEn : match.boss.nameDe}</Chip>}
            </>
            : hotseat ? <Chip color={T.text} bg={T.sel}>{t("quick.hotseat")}</Chip>
            : <Chip color={T.text} bg={T.sel}>{t("game.ai")} · {t("diff." + difficulty)}</Chip>}
        </div>
        {clockLbl && (
          <span className="gg-serif" style={{ ...pill({ cursor: "default",
            border: `1.5px solid ${clockAlarm ? T.danger : T.gold + (clockHot ? "cc" : "55")}`,
            color: clockAlarm ? "#ffd9de" : clockHot ? T.goldBright : T.gold,
            letterSpacing: ".06em", fontSize: clockAlarm ? 23 : clockGross ? 18 : 14, gap: 5 }),
            fontWeight: clockAlarm ? 800 : undefined,
            background: clockAlarm ? "linear-gradient(160deg, rgba(140,28,42,.92), rgba(60,10,18,.94))" : undefined,
            boxShadow: clockAlarm ? `0 0 18px ${T.danger}aa` : undefined,
            animation: clockAlarm ? "ggUhrAlarm .85s ease-in-out infinite" : "none",
            zIndex: 3 }}>{uhrGlut > 0 && <span key={uhrGlut} aria-hidden style={{ position: "absolute",
              inset: -3, borderRadius: 999, border: `2px solid ${T.gold}`, pointerEvents: "none",
              animation: "ggUhrPuls .55s ease-out 3" }} />}<HourglassIc size={clockAlarm ? 19 : clockGross ? 16 : 14}
              color={clockAlarm ? "#ffd9de" : clockHot ? T.goldBright : T.gold} /> {clockLbl}</span>
        )}
        {foeLbl && (
          <span className="gg-serif" title={t("online.foeClock")} style={pill({ cursor: "default",
            border: `1.5px solid ${T.magenta}55`, color: T.magenta, letterSpacing: ".06em", fontSize: 13, gap: 5,
            opacity: state.turn === myColor ? 0.65 : 1 })}>
            <HourglassIc size={13} color={T.magenta} /> {foeLbl}</span>
        )}
        <button onClick={() => setArmResign(true)} disabled={!!banner || !!intro || scout}
          style={leiserKnopf({ opacity: banner || intro || scout ? 0.4 : 1,
            cursor: banner || intro || scout ? "default" : "pointer" })}>
          <FlagIc size={13} /> {t("game.resign")}
        </button>
        {/* DAS AUFGEBEN-POPUP (Besitzer, v0.61): ein echter Dialog mit
            ordentlichen Schaltflaechen statt der Mini-Pille. Online und in
            der klassischen Partie sagt er UNMISSVERSTAENDLICH, dass damit
            die Partie endet. */}
        {armResign && (
          <div onClick={() => setArmResign(false)} style={{ position: "fixed", inset: 0, zIndex: 200, // v0.71.1: ueber der grossen Auswahl-Figur
            display: "grid", placeItems: "center", padding: 18,
            background: "rgba(5,4,10,.72)", backdropFilter: "blur(3px)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 340,
              background: T.panel, border: `1.5px solid ${T.gold}66`, borderRadius: 16,
              padding: "18px 18px 14px", boxShadow: T.shadow }}>
              <div className="gg-serif" style={{ fontSize: 18, color: T.goldBright, letterSpacing: ".05em", marginBottom: 6 }}>
                ⚑ {t("game.resignTitle")}</div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55, marginBottom: 6 }}>{t("game.resignBody")}</div>
              {pvp && <div style={{ fontSize: 12.5, color: T.danger, fontWeight: 800, lineHeight: 1.5, marginBottom: 6 }}>
                {t("game.resignOnline")}</div>}
              {!hpMode && !pvp && <div style={{ fontSize: 12.5, color: T.gold, fontWeight: 700, lineHeight: 1.5, marginBottom: 6 }}>
                {t("game.resignClassic")}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => setArmResign(false)} style={{ flex: 1, padding: "11px 10px", borderRadius: 12,
                  border: `1px solid ${T.line}`, background: T.panel2, color: T.text, fontFamily: "inherit",
                  fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}>{t("game.resignStay")}</button>
                <button onClick={() => { setArmResign(false); resign(); }} style={{ flex: 1, padding: "11px 10px",
                  borderRadius: 12, border: `1.5px solid ${T.danger}`, background: "rgba(180,50,60,.16)",
                  color: "#ffb9c1", fontFamily: "inherit", fontWeight: 900, fontSize: 13.5, cursor: "pointer" }}>
                  ⚑ {t("game.resign")}</button>
              </div>
            </div>
          </div>
        )}
      </div>

</>);
  const enemyStrip = (<>
      {/* enemy strip */}
      {/* THE RIM OF THE FIELD: what the foe has taken sits on the LEFT, close
          to the board; his standing power holds the far RIGHT corner. Same law
          mirrored below for you — so the eye always finds a total in a corner
          and a spoils row by the board. */}
      {/* v1.2.3 (Besitzer: "die Bubbles mit Summen gerne entsprechend die
          unteren wie auch die oberen ganz nah an Brett"): beide Leisten
          ruecken heran. Oben fiel der Rand weg (minHeight 30 -> 26, dazu ein
          negativer Unterrand), unten ebenso - die Zahlen gehoeren zum Brett,
          nicht zum Bildschirmrand. */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: `0 ${HUD_PAD}px`,
        minHeight: 26, marginBottom: -6, flex: "0 0 auto" }}>
        <span data-gg-tray="w"><Tray kinds={state.captured.b} color="w" /></span>
        <div style={{ flex: 1 }} />
        {hpMode && <ForceBadge hp={F.b.hp} atk={F.b.atk} neon={T.magenta} t={t} wert={F.b.hp + F.b.atk} />}
      </div>

</>);
  // Portraetquelle: der Kampagnen-Boss traegt sein gemaltes Bildnis; Hof-
  // figuren-Bosse (pb_) nutzen ihr Figurenportraet. Ohne Boss kein Portraet.
  const gegnerPortraet = (() => {
    if (!campaign || !match?.boss?.bossId) return null;
    const bid = match.boss.bossId;
    try { return paintedById(bid.startsWith("pb_") ? bid.slice(3) : bid); } catch { return null; }
  })();
  const boardBlock = (<>
      {gegnerPortraet && !banner && (
        <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: -4, zIndex: -1,
          display: "grid", justifyItems: "center", pointerEvents: "none" }}>
          <img src={gegnerPortraet} alt="" decoding="async" draggable={false}
            style={{ height: 176, objectFit: "contain", opacity: 0.92, userSelect: "none",
              filter: `${ENEMY_FILTER} drop-shadow(0 6px 14px rgba(0,0,0,.65))`,
              // oben und seitlich ins Dunkel auslaufen - unten schneidet der
              // Brettkasten den Rumpf ab (er malt spaeter im Baum)
              WebkitMaskImage: "radial-gradient(115% 105% at 50% 62%, #000 52%, transparent 90%)",
              maskImage: "radial-gradient(115% 105% at 50% 62%, #000 52%, transparent 90%)" }} />
        </div>
      )}
      {/* THE BOARD — fixed viewport, fills all remaining space, never scrolls */}
      <div ref={zoomBox} onPointerDown={zoomDown} onPointerMove={zoomMove} onPointerUp={zoomUp} onPointerCancel={zoomUp}
        onWheel={zoomWheel} onClickCapture={(e) => { if (zDragged.current) { e.stopPropagation(); e.preventDefault(); zDragged.current = false; } }}
        // the balance rides on the MARGIN, not on padding: the board's own
        // viewport is an absolutely positioned child, and those measure from
        // the padding box — padding here would have been invisible to it.
        // DS1 Phase 12: DAS BRETT BEGINNT FRUEHER. Der Block wuchs bisher ueber
        // die ganze Restflaeche und zentrierte das Brett darin - gemessen lagen
        // 160 px totes Band zwischen Gegnerzeile und Brettoberkante. Ein Deckel
        // auf die Blockhoehe (~eine Brettbreite) statt Oben-Ausrichtung: so
        // rutscht das Brett unter die Gegnerzeile UND die Spielerzeile folgt
        // direkt darunter, waehrend die Zoom-Mathematik (transformOrigin 50 %,
        // Kamera-Anflug) unveraendert um die Blockmitte rechnet. Auf breiten
        // Schirmen ist die Hoehe ohnehin knapper als die Breite - dort greift
        // der Deckel nie und nichts aendert sich.
        style={{ flex: "1 1 auto", minHeight: 0, maxHeight: "calc(110vw + 2px)" /* v0.71.6: Kopf-Reserve ausserhalb der Brettbreite */, position: "relative",
        // BRETT BREITER (Besitzer, v0.46): der Seitenrand faellt von 4 auf 1 px,
        // der Deckel gibt die gewonnene Breite frei. Gemessen bei 390 px:
        // Brettseite 376 -> 382.
        margin: `${2 + boardPadTop}px 1px ${2 + boardPadBottom}px`,
        overflow: zoomMode ? "hidden" : "visible", /* v0.71.7: das ruhende Zoomfenster koepfte den Figuren-Schimmer */ touchAction: zoomMode ? "none" : "auto", cursor: zoomMode && zv.z > 1.01 ? "grab" : undefined }}>
        {/* DER BRETT-ALARM: in den letzten Sekunden glimmt der Innenrand des
            Brettfelds im Takt der Uhr - Licht statt neuer Elemente. */}
        {clockAlarm && <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
          borderRadius: 10, animation: "ggBrettAlarm .85s ease-in-out infinite" }} />}
        <div style={{ width: "100%", height: "100%",
          // v0.73.1 (Besitzer): beim Anwaehlen wuchs kurz der Inhalt und das
          // Brett skalierte mit - der Kasten misst jetzt fest, was drin
          // waechst, waechst ueber ihn hinaus statt ihn zu dehnen.
          contain: "layout size", overflow: "visible",
          display: "grid", placeItems: "center",   // the board rests mid-air: as much sky above as below
          transform: zoomMode ? `translate(${zv.x}px, ${zv.y}px) scale(${zv.z})` : "none",
          transformOrigin: "50% 50%", transition: zPtrs.current.size ? "none" : "transform .18s ease",
          animation: flyGo && !flyDone && !zoomMode ? "ggBoardZoomIn 1.9s cubic-bezier(.2,.85,.25,1) both" : "none", // the STATION rushes up: a clean zoom from map-height to the board, no more flyover
          opacity: flyGo ? 1 : 0.985 }}>
        {erstHinweis && ABILITIES[erstHinweis] && (() => { const ab = ABILITIES[erstHinweis]; const en = profile.lang === "en";
          return <div role="status" onClick={() => setErstHinweis(null)} style={{ position: "absolute", left: "50%", top: 8,
            transform: "translateX(-50%)", zIndex: 30, width: "min(92%, 440px)", padding: "10px 13px", borderRadius: 13, cursor: "pointer",
            background: "radial-gradient(130% 120% at 50% -12%, rgba(124,58,237,.22) 0%, rgba(22,16,34,.95) 50%, rgba(10,8,16,.97) 100%)",
            border: "1px solid rgba(167,139,250,.6)", boxShadow: "0 6px 22px rgba(0,0,0,.55), 0 0 14px rgba(124,58,237,.25)",
            animation: "ggZeichenEin .35s ease-out both" }}>
            <div className="gg-serif" style={{ fontSize: 14.5, color: "#e9dcff", fontWeight: 800, letterSpacing: ".03em", marginBottom: 3 }}>
              <span style={{ marginRight: 7 }}>{ab.icon}</span>{en ? ab.nameEn : ab.nameDe}
              <span style={{ fontWeight: 400, fontSize: 11.5, color: "#a99bc6", marginLeft: 8 }}>{en ? "new" : "neu"}</span></div>
            <div className="gg-serif" style={{ fontSize: 12.5, lineHeight: 1.5, color: "#cfc4e2" }}>{en ? ab.descEn : ab.descDe}</div>
          </div>; })()}
        <BoardView lang={profile.lang} state={state} onMove={play} interactive={myTurn} showCoords={klassikOptik} lastMove={state.lastMove} animateFor={null} hotseat={hotseat} feld={feld} feldDunkel={feldDunkel} ruhig={armResign || !!banner} mattSeite={banner && (banner.reason === "checkmate" || banner.reason === "regicide") ? (banner.result === "win" ? (myColor === "w" ? "b" : "w") : myColor) : null} effekt={brettEffekt}
          flip={viewColor === BLACK} theme={{ ...(map.theme || {}), ...boardPalette(profile, match) }} fitBox pick={scout && pvp ? myColor : potionArm ? WHITE : null}
          onPick={scout && pvp ? scoutTap : usePotion} pov={viewColor}
          /* v1.12.1: im Geleit-Modus dienen dieselben Regler der Figurenwahl.
             setzFelder zeigt die drei Bundfiguren als waehlbar, onSetz nimmt
             die Wahl entgegen - erst die eine, dann die andere, dann tauschen
             sie. Ein eigener Klickweg waere doppelte Arbeit fuer dasselbe. */
          setzFelder={setzPhase ? setzbar : (geleitAktiv ? geleitFelder : null)}
          onSetz={setzPhase ? setzeOderNimm : (geleitAktiv ? geleitTipp : null)}
          knownKinds={knownAtStart} seerVision={seerVision} onEnemyTap={onEnemyTap} introSpot={introSpots} onInspect={setInspect}
          texture={boardTexture(match, profile)} ground={boardGround(match, profile)} artStyle={profile.pieceStyle === "svg" ? "svg" : klassikOptik ? "classic" : livery() === "carved" ? "carved" : "painted"} friendly={!!match?.friendly}
          pulse={classic ? 0.2 : match?.boss
            ? (match.boss.bossId && !match.boss.bossId.startsWith("pb_") ? 0.9 : 0.7)
            : ({ easy: 0.25, normal: 0.4, hard: 0.6 }[(campaign && match?.node?.difficulty) || difficulty] ?? 0.4)} />
        </div>
        {/* v0.50: die EIGENE Figur berichtet jetzt in der KAMPFLEISTE unter dem
            Brett (Figur gross, Talente als goldene Bubbles) - hier schwebt nur
            noch der Spaeher-Blick auf GEGNER ueber dem Feld. */}
        {/* v0.71.8 (Besitzer): das schwebende Namens-/Dossier-Schild ueber dem
            Brett ist FORT - es wurde von den Figuren verdeckt. Die Auskunft
            wohnt jetzt fuer BEIDE Seiten in der Kampfleiste. */}
        {/* DIE LUPE IST FORT (Besitzer, v0.64): der Nahansicht-Knopf
            stoerte - das Feldglas ruht, die Maschinerie bleibt stumm. */}
        {firstMeet && (() => {
          const pc = firstMeet.piece;
          const ch = Object.values(CHARACTERS).find((c) => c.kind === pc.kind);
          const nm = pc.name ? (en ? pc.name.en : pc.name.de) : ch ? (en ? ch.nameEn : ch.nameDe) : pc.kind;
          const tale = ch ? (en ? ch.flavorEn : ch.flavorDe) : t("meet.unknownTale");
          const src = paintedForPiece({ kind: pc.kind, color: "w", hero: false });
          return (
            <div onClick={() => setFirstMeet(null)} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(4,6,10,.72)",
              display: "grid", placeItems: "center", padding: 18 }}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: "min(92vw, 360px)", borderRadius: 16, padding: "16px 16px 14px",
                background: "linear-gradient(178deg, #141a28, #0d1119)", border: "1px solid rgba(233,210,150,.45)",
                boxShadow: "0 18px 50px rgba(0,0,0,.6)", textAlign: "center" }}>
                <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".16em", color: T.gold }}>{t("meet.title")}</div>
                {src && <img src={src} alt="" style={{ height: 110, margin: "10px auto 6px", display: "block", objectFit: "contain",
                  filter: ENEMY_FILTER + " brightness(1.25) drop-shadow(0 4px 8px rgba(0,0,0,.6))" }} />}
                <div className="gg-serif" style={{ fontSize: 19, color: T.goldBright, letterSpacing: ".05em" }}>{nm}</div>
                <div className="gg-serif" style={{ fontSize: 12.5, fontStyle: "italic", color: T.dim, lineHeight: 1.55, margin: "7px 0 4px" }}>{tale}</div>
                <div style={{ fontSize: 11.5, color: firstMeet.seen ? "#b9a8ef" : T.faint, marginTop: 6 }}>
                  {firstMeet.seen ? t("meet.seerNote") : t("meet.secretNote")}</div>
                <button onClick={() => setFirstMeet(null)} style={{ marginTop: 12, width: "100%", padding: "10px 14px", borderRadius: 10,
                  background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)",
                  color: "#17110a", fontWeight: 800, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>{t("meet.ok")}</button>
              </div>
            </div>
          );
        })()}
        {potionArm && <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", zIndex: 4,
          background: "#0d1017ee", border: `1px solid ${T.gold}`, color: T.gold, fontSize: 12.5, fontWeight: 800,
          borderRadius: 999, padding: "6px 14px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}><ItemIcon id="potion" size={14} /> {t("game.potionPick")} · <span onClick={() => setPotionArm(false)} style={{ cursor: "pointer", textDecoration: "underline" }}>{t("online.cancel")}</span></div>}
        {/* ── DIE SETZPHASE (v1.0.63) ─────────────────────────────────────
            Sie sitzt UNTEN am Brett, nicht darueber: oben stehen die Reihen
            des Gegners, unten die eigenen - und genau dort wird gesetzt. Der
            Balken zeigt, was im Bündel liegt, und gibt das Brett erst frei,
            wenn der Spieler es sagt. */}
        {setzPhase && (() => {
          const gesetzt = sperrenAnzahl(state.sperren, WHITE);
          const arten = Object.keys(SPERR_ARTEN).filter((a) => (vorrat[a] || 0) > 0 || state.sperren && Object.values(state.sperren).some((s) => s?.von === WHITE && s.art === a));
          /* GEMESSEN (v1.0.63): als der Balken noch IM Brettkasten hing
             (position:absolute, bottom 6), verdeckte er auf einem 390er
             Telefon 128 px des Bretts - darunter zwei Drittel der dritten
             Reihe, also genau eines der Felder, die man antippen soll. Er
             haengt jetzt am unteren Bildrand, UNTER dem Brett (Brettfuss 610,
             Balkenkopf ~686). */
          return <div style={{ position: "fixed", left: 8, right: 8, bottom: "calc(8px + env(safe-area-inset-bottom))", zIndex: 45,
            background: "linear-gradient(178deg, rgba(20,26,40,.95), rgba(13,17,25,.97))",
            border: `1px solid ${T.gold}66`, borderRadius: 12, padding: "8px 10px 9px",
            boxShadow: "0 10px 26px rgba(0,0,0,.55)" }}>
            <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase",
              color: T.goldBright, textAlign: "center" }}>{t("sperre.title")}</div>
            <div className="gg-serif" style={{ fontSize: 11, color: T.dim, lineHeight: 1.45, textAlign: "center", marginTop: 2 }}>
              {t("sperre.hint", { n: MAX_SPERREN })}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {arten.map((a) => {
                const n = vorrat[a] || 0;
                const an = sperrWahl === a;
                return <button key={a} onClick={() => n > 0 && setSperrWahl(a)} disabled={!n}
                  style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", cursor: n ? "pointer" : "default",
                    borderRadius: 999, padding: "5px 11px 5px 7px", opacity: n ? 1 : 0.4,
                    background: an ? "rgba(240,206,122,.18)" : "#07050d",
                    border: `1.5px solid ${an ? T.gold : `${T.gold}44`}` }}>
                  <ItemIcon id={a} size={20} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: an ? T.goldBright : T.dim }}>
                    {en ? SPERR_ARTEN[a].nameEn : SPERR_ARTEN[a].nameDe} · {n}</span>
                </button>;
              })}
            </div>
            <button onClick={setzenFertig} style={{ marginTop: 9, width: "100%", padding: "9px 14px", borderRadius: 10,
              background: "linear-gradient(165deg, #e0b76c, #b78d43)", border: "1px solid rgba(255,240,200,.5)",
              color: "#17110a", fontWeight: 800, fontSize: 13.5, fontFamily: "inherit", cursor: "pointer" }}>
              {gesetzt ? t("sperre.go") : t("sperre.skip")}</button>
          </div>;
        })()}
        {intro && !banner && <StoryIntro profile={profile} node={match.node} boss={match.boss} t={t} en={profile.lang === "en"} onBegin={() => { setIntro(false); if (foresight) setScout(true); }} timer={timer} />}
        {brief && hpMode && !intro && !banner && <HpBriefing t={t}
          onBegin={() => setBrief(false)}
          onNever={() => { setBrief(false); dispatch({ type: "SET_NOTICE", key: "hpBrief" }); }} />}
        {scout && !intro && !brief && !banner && (
          <div style={{ position: "absolute", left: 10, right: 10, bottom: 12, zIndex: 5,
            background: "rgba(10,13,20,.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(233,210,150,.45)", borderRadius: 14, padding: "12px 14px",
            boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
            <div className="gg-serif" style={{ color: "#e9d296", fontSize: 14, letterSpacing: ".08em", marginBottom: 3 }}>
              <span style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 6 }}><OrbIc size={15} /></span>{t("scout.title")}</div>
            <div style={{ color: "rgba(240,233,216,.8)", fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>
              {pvp ? t("scout.swapHint") : t("scout.hint")}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <GoldShineButton style={{ flex: 1, padding: "10px 12px", fontSize: 13.5, borderRadius: 10 }}
                onClick={endScout}>
                <StartMark size={13} /> {t("story.begin")}
              </GoldShineButton>
              {!pvp && onArmy && <Button variant="subtle" onClick={onArmy} style={{ padding: "10px 12px", fontSize: 12.5 }}>{t("scout.army")}</Button>}
            </div>
          </div>
        )}
        {!scout && scoutWaitOpp && !banner && (
          <div style={{ position: "absolute", left: 10, right: 10, bottom: 12, zIndex: 5,
            background: "rgba(10,13,20,.82)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(233,210,150,.35)", borderRadius: 14, padding: "12px 14px", textAlign: "center",
            boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>
            <div className="gg-serif" style={{ color: "#e9d296", fontSize: 13.5, letterSpacing: ".08em", marginBottom: 3 }}>
              <span style={{ display: "inline-block", verticalAlign: "-3px", marginRight: 6 }}><OrbIc size={15} /></span>{t("scout.oppTitle")}</div>
            <div style={{ color: "rgba(240,233,216,.8)", fontSize: 12, lineHeight: 1.5 }}>{t("scout.oppHint")}</div>
          </div>
        )}
      </div>

</>);
  const yourStrip = (<>
      {/* your strip: badges · status · captured · undo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto",
        marginTop: -6,   /* v1.2.3: naeher ans Brett */
        padding: `2px ${HUD_PAD}px calc(10px + env(safe-area-inset-bottom))` }}>
        {hotseat && <Chip color={state.turn === BLACK ? T.magentaInk : T.limeInk} bg={state.turn === BLACK ? T.magenta : T.lime}>{t(state.turn === WHITE ? "hs.white" : "hs.black")}</Chip>}
        {/* v0.79: DIE MELDUNGSPLAKETTE - ein fester, gefasster Ort fuer die
            Stimme des Spiels. Punkt links: gold = du, violett = Gegner,
            hellgold pulsierend = Schach. Ein frisches Ereignis verdraengt
            den Zugstand fuer ein paar Sekunden. */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
          {(ereignis || statusText) && <div style={{ display: "inline-flex", alignItems: "center", gap: 7, maxWidth: "100%",
            border: `1px solid ${st.check ? T.gold + "aa" : ereignis ? "rgba(240,206,122,.5)" : "rgba(167,139,250,.32)"}`,
            background: "linear-gradient(180deg, rgba(26,18,44,.72), rgba(12,9,22,.8))",
            borderRadius: 999, padding: "4px 12px",
            boxShadow: st.check ? "0 0 12px rgba(240,206,122,.28)" : "inset 0 1px 0 rgba(255,240,200,.05)" }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: 999, flex: "0 0 auto",
              background: st.check || ereignis ? T.goldBright : myTurn || (hotseat && state.turn === WHITE) ? T.gold : "#8b7bd8",
              boxShadow: st.check ? `0 0 8px ${T.goldBright}` : "none" }} />
            <span className="gg-serif" style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: ".04em", minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              color: st.check ? T.goldBright : ereignis ? "#f0e4bc" : "#c9c2ab" }}>{ereignis || statusText}</span>
          </div>}
        </div>
        <span data-gg-tray="b"><Tray kinds={state.captured.w} color="b" /></span>
        {hpMode && <ForceBadge hp={F.w.hp} atk={F.w.atk} neon={T.lime} t={t} wert={F.w.hp + F.w.atk} />}
      </div>
</>);


  // DIE AUSRUESTUNG GANZ UNTEN (Besitzer, v0.69): Trank, Zeitriss und
  // Zeitenwender sind figurunabhaengige Gegenstaende - sie bekommen ihre
  // eigene lila Zeile UNTER der Kampfleiste, am Fuss des Gefechts.
  const ruestungsZeile = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flex: "0 0 auto",
      borderTop: `1px solid ${T.selLine}22`, marginTop: 4, paddingTop: 8,
      padding: "8px 10px calc(8px + env(safe-area-inset-bottom))" }}>
      {/* v0.71.11 (Besitzer): ALLE Knoepfe GLEICH GROSS und quadratisch -
          schwarzer Grund, lila Kontur, das Icon gross und perfekt mittig,
          die ZAHL DARUNTER. Nichts Ungleiches mehr. */}
      {/* v0.73.1 (Besitzer): das Wort faellt - eine feine Linie ordnet den Fuss. */}
      {(() => {
        const kasten = (aktiv, an = true) => ({
          width: 52, height: 56, borderRadius: 12, flex: "0 0 auto", fontFamily: "inherit", cursor: an ? "pointer" : "default",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
          background: aktiv ? "rgba(124,58,237,.28)" : "#07050d",
          border: `1.5px solid ${aktiv ? T.selLine : `${T.selLine}55`}`,
          boxShadow: aktiv ? `0 0 10px ${T.selGlow}` : "none",
          opacity: an ? 1 : 0.45, padding: 0 });
        const zahl = { fontSize: 10.5, fontWeight: 900, color: T.gold, lineHeight: 1 };
        return (<>
          {!pvp && !hotseat && hpMode && (state.potions?.w || 0) > 0 && !banner && (
            <button onClick={() => setPotionArm((a) => !a)} disabled={!myTurn} style={kasten(potionArm, myTurn)}>
              <ItemIcon id="potion" size={22} />
              <span style={zahl}>{state.potions.w}</span>
            </button>
          )}
          {!pvp && !hotseat && hpMode && !banner && ((state.shifts?.w || 0) > 0 || state.shiftArmed === WHITE) && (
            <button onClick={() => { if (state.shiftArmed || !myTurn) return; try { klang("zeitriss"); } catch {} setState((s) => reduce(s, shiftCommand(WHITE)).state); }}
              disabled={!myTurn || state.shiftArmed === WHITE} title={t("game.riftHint")}
              style={kasten(state.shiftArmed === WHITE, myTurn || state.shiftArmed === WHITE)}>
              <span style={{ fontSize: 21, lineHeight: 1, color: "#b3a4e0" }}>⧗</span>
              <span style={zahl}>{state.shiftArmed === WHITE ? "✓" : (state.shifts?.w || 0)}</span>
            </button>
          )}
          {/* ── DER GELEIT-KNOPF (v1.12.1) ───────────────────────────────────
              Besitzerentscheid: "Ich faende es richtig, wenn du Geleit mit
              einem Knopf aktivierbar machst und dann waehle ich eine Figur aus
              und eine zweite und diese tauschen miteinander."

              Er erscheint nur, wenn der Bund erwacht ist, alle drei Figuren
              stehen und der Tausch noch offen ist - sonst waere er ein toter
              Knopf, der Fragen aufwirft.

              Ein Druck ARMIERT nur; die Wahl der zwei Figuren geschieht danach
              auf dem Brett. Das ist derselbe Ablauf wie beim Riss-Sprung, den
              der Spieler schon kennt. */}
          {!pvp && !hotseat && !banner && geleitOffen && (
            <button onClick={() => { if (!myTurn) return; try { klang("menue"); } catch {} setGeleitAktiv((v) => !v); }}
              disabled={!myTurn} title={en ? "Escort: swap two of knight, bishop, rook" : "Geleit: zwei von Springer, Läufer, Turm tauschen"}
              style={kasten(geleitAktiv, myTurn)}>
              <span style={{ fontSize: 19, lineHeight: 1, color: "#b3a4e0" }}>⇄</span>
              <span style={zahl}>{geleitAktiv ? (geleitWahl == null ? "1" : "2") : "1"}</span>
            </button>
          )}
          {!pvp && !hotseat && (profile.items?.hourglass || 0) > 0 && (
            <button onClick={doUndo} disabled={!state.history.length || !!banner || hourglassLeft <= 0} title={t("game.undo")}
              style={kasten(false, !(!state.history.length || banner || hourglassLeft <= 0))}>
              <ItemIcon id="hourglass" size={22} />
              <span style={zahl}>{hourglassLeft}</span>
            </button>
          )}
        </>);
      })()}
    </div>
  );

  // the victory/defeat banner lives at the TOP of the screen tree (not inside
  // the zoomable board), so it always floats OVER every piece and overlay
  // THE GAME GOES BACK ON THE SHELF: after your one move there is nothing more
  // to do here — the card says so plainly and the way back is one tap.
  const dailyDoneEl = daily && dailySent && !banner ? (
    <div style={{ position: "absolute", inset: 0, zIndex: 8, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.8)", backdropFilter: "blur(3px)", padding: 16 }}>
      <div style={{ background: "#efe9da", color: "#2e2a20", borderRadius: 14, padding: "20px 18px 16px",
        maxWidth: 330, width: "100%", textAlign: "center", boxShadow: "0 14px 34px rgba(0,0,0,.5)" }}>
        <div className="gg-serif" style={{ fontSize: 19 }}>{t("daily.moveSent")}</div>
        <div style={{ fontSize: 12.5, color: "#5c5344", lineHeight: 1.5, margin: "9px 0 14px" }}>{t("daily.hint")}</div>
        <button onClick={() => onExit && onExit()} style={{ width: "100%", fontFamily: "inherit", fontWeight: 900,
          fontSize: 14.5, borderRadius: 999, padding: "12px 16px", border: "none", cursor: "pointer",
          background: "linear-gradient(160deg, #c9b8ff, #a78bfa 55%, #7a5ab0)", color: "#17110a" }}>
          {t("daily.title")}
        </button>
      </div>
    </div>
  ) : null;

  const raus = fragtRaus ? <LeaveMatchAsk t={t} resumable={!!match && !pvp && !daily}
    onStay={() => setFragtRaus(false)}
    onLeave={() => { setFragtRaus(false); leave(); }} /> : null;
  const bannerEl = banner ? <ResultBanner banner={banner} t={t} onNew={pvp ? onExit : newGame} campaign={campaign} onExit={onExit} boss={match?.boss || null}
    onSettings={!campaign && !pvp ? onExit : null}
    pvpInfo={pvp ? { rated, rematch, onRematch: () => { pvp.net.send({ t: "rematch", matchId: pvp.matchId }); setRematch("wait"); } } : null}
    unlockName={match?.boss?.unlocks ? (profile.lang === "en" ? CHARACTERS_BY_ID[match.boss.unlocks]?.nameEn : CHARACTERS_BY_ID[match.boss.unlocks]?.nameDe) : null}
    fledName={match?.boss && !match?.boss?.unlocks ? (match.boss.name?.[profile.lang === "en" ? "en" : "de"] || null) : null}
    unlockId={match?.boss?.unlocks || null} en={profile.lang === "en"} onArmy={onArmy} newSkills={newSkills} /> : null;

  if (wideMatch) return (
    <div style={{ position: "relative", overflow: "hidden", flex: "1 1 auto", minHeight: 0, height: "100%", display: "flex" }}>
      <div style={{ flex: "1 1 auto", minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column", padding: "10px 2px 14px 10px" }}>
        {boardBlock}
      </div>
      <aside style={{ width: 272, flex: "0 0 auto", minHeight: 0, display: "flex", flexDirection: "column",
        overflowY: "auto", padding: "2px 6px 6px 0" }}>
        {headerBar}
        {enemyStrip}
        <div style={{ flex: 1, minHeight: 14 }} />
        {/* Die Kampfleiste steht IM FLUSS UNTER der Ausruestungs-Legende: dort
            liegen die freien 371 px (gemessen), und sie bleibt ausserhalb der
            botChrome-Messung, deren Hoehe den tight-Modus fuettert - in-flow
            ZWISCHEN Brett und Legende sank das Brett um 51 px. */}
        {yourStrip}
        {/* v0.86 (Besitzer): IM KLASSISCHEN SCHACH SCHWEIGT DIE LEISTE. Dort
            haben die Figuren keine Talente und keine Sonderzuege - eine Leiste,
            die nichts zu sagen hat, nimmt nur Platz und Aufmerksamkeit. Das
            Brett bekommt den ganzen Blick. */}
        {leisteNoetig && <KampfLeiste state={state} inspect={inspect} en={en} myColor={hotseat ? state.turn : WHITE} banner={!!banner} stil={profile.pieceStyle} />}
        {!schlichteRegeln && ruestungsZeile}
      </aside>
      {dailyDoneEl}
      {bannerEl}{raus}
    </div>
  );

  return (
    <div style={{ position: "relative", overflow: "hidden", flex: "1 1 auto", minHeight: 0, height: "100%",
      display: "flex", flexDirection: "column",
      /* v0.86: im reinen Schach fallen die Leisten weg - dann bliebe unten
         ein grosses Loch und das Brett klebte oben. Also rueckt es in die
         MITTE des freien Raums, wie der Besitzer es wollte. */
      justifyContent: "flex-start" }}>
      {/* v0.87 (Besitzer): die Kopfzeile - Zurueck, Gegner, Aufgeben - gehoert
          an die OBERE KANTE, nicht in die Mitte. In v0.86 hatte ich den
          GANZEN Zweig zentriert, um das Brett mittig zu bekommen; dabei
          wanderte die Kopfzeile mit nach unten. Jetzt bleibt sie oben, und
          nur der Raum DARUNTER wird mittig aufgeteilt. */}
      <div ref={topChromeRef} style={{ flex: "0 0 auto" }}>{headerBar}{enemyStrip}</div>
      {/* Zwei blosse Abstandhalter mit flex:1 haben dem Brett den Platz
          weggenommen - es schrumpfte auf ein Viertel (von der Sonde
          gesehen). Stattdessen traegt ein RAHMEN den freien Raum und
          zentriert das Brett darin; der Brettblock selbst behaelt seine
          eigene Groessenrechnung. */}
      {schlichteRegeln
        ? <div style={{ flex: "1 1 auto", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>{boardBlock}</div>
        : boardBlock}
      <div ref={botChromeRef} style={{ flex: "0 0 auto" }}>{yourStrip}</div>
      {/* v0.86 (Besitzer): IM KLASSISCHEN SCHACH SCHWEIGT DIE LEISTE. Dort
            haben die Figuren keine Talente und keine Sonderzuege - eine Leiste,
            die nichts zu sagen hat, nimmt nur Platz und Aufmerksamkeit. Das
            Brett bekommt den ganzen Blick. */}
        {leisteNoetig && <KampfLeiste state={state} inspect={inspect} en={en} myColor={hotseat ? state.turn : WHITE} banner={!!banner} stil={profile.pieceStyle} />}
      {!schlichteRegeln && ruestungsZeile}
      {dailyDoneEl}
      {bannerEl}{raus}
    </div>
  );
}

// ── Pre-game setup (v0.4): map, mode and difficulty are chosen HERE, before
// the match — inside the match only the board remains. ────────────────────────
export function QuickSetup({ profile, dispatch, t, onStart, initial = null }) {
  const en = profile.lang === "en";
  const hpOpen = hpUnlocked(profile);
  const [mapId, setMapId] = useState(initial?.mapId && mapUnlocked(profile, initial.mapId) ? initial.mapId : "classic");
  const [mode, setMode] = useState(initial?.mode === "hp" && hpOpen ? "hp" : initial?.mode === "classic" ? "classic" : "chess");
  const [elo, setElo] = useState(initial?.elo || profile.classicElo || 1000);
  const [difficulty, setDifficulty] = useState(initial?.difficulty || profile.difficulty || "easy");
  const [foe, setFoe] = useState(initial?.hotseat ? "hotseat" : "ai");
  const [hsTurn, setHsTurn] = useState(initial?.hotseatFlip === false ? "fixed" : "turn");
  const [lockHint, setLockHint] = useState(false); // tap on a locked map explains the lock (no hover on touch)
  useEffect(() => {
    if (!lockHint) return;
    const id = setTimeout(() => setLockHint(false), 3200);
    return () => clearTimeout(id);
  }, [lockHint]);
  return (
    <Panel>
      <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 14, lineHeight: 1.5 }}>{t("quick.hint")}</div>
      <FieldLabel>{t("game.mode")}</FieldLabel>
      <Segmented value={mode} onChange={(m) => (m !== "hp" || hpOpen) && setMode(m)}
        options={[
          { value: "classic", label: t("mode.classic") },
          { value: "chess", label: t("mode.chess") },
          { value: "hp", label: hpOpen ? t("mode.hp") : <><LockIc size={11} /> {t("mode.hp")}</>, disabled: !hpOpen },
        ]} />
      {mode === "classic" && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5, lineHeight: 1.45 }}>{t("quick.classicHint")}</div>}
      <div style={{ height: 12 }} />

      {mode !== "classic" && <><FieldLabel>{t("game.map")}</FieldLabel></>}
      {mode !== "classic" && <div style={{ display: "flex", flexWrap: "nowrap", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 10,
        WebkitOverflowScrolling: "touch", paddingBottom: 4, scrollbarWidth: "thin", minWidth: 0, maxWidth: "100%" }}>
        {MAPS.map((m) => {
          const open = mapUnlocked(profile, m.id);
          return <MapChip key={m.id} on={m.id === mapId} locked={!open} theme={m.theme}
            title={open ? undefined : t("game.unlockHint")}
            onClick={() => open ? setMapId(m.id) : setLockHint(true)}
            label={<>{open ? null : <LockIc size={11} />}{(en ? m.nameEn : m.nameDe)} · {m.w}×{m.h}</>} />;
        })}
      </div>}
      {lockHint && <div style={{ fontSize: 11.5, color: T.gold, margin: "-8px 0 12px" }}><LockIc color={T.gold} size={11} /> {t("game.unlockHint")}</div>}

      {!hpOpen && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5 }}>{t("game.unlockHint")}</div>}
      <div style={{ height: 12 }} />
      <FieldLabel>{t("quick.opponent")}</FieldLabel>
      <Segmented value={foe} onChange={setFoe}
        options={[{ value: "ai", label: t("quick.vsAi") }, { value: "hotseat", label: t("quick.hotseat") }]} />
      {foe === "hotseat" && <>
        <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5, lineHeight: 1.45 }}>{t("quick.hotseatHint")}</div>
        <div style={{ height: 12 }} />
        <FieldLabel>{t("quick.board")}</FieldLabel>
        <Segmented value={hsTurn} onChange={setHsTurn}
          options={[{ value: "turn", label: t("quick.boardTurns") }, { value: "fixed", label: t("quick.boardFixed") }]} />
      </>}
      {foe === "ai" && mode !== "classic" && <>
        <div style={{ height: 12 }} />
        <FieldLabel>{t("game.difficulty")}</FieldLabel>
        <Segmented value={difficulty} onChange={setDifficulty}
          options={[{ value: "easy", label: t("diff.easy") }, { value: "normal", label: t("diff.normal") }, { value: "hard", label: t("diff.hard") }]} />
      </>}
      {foe === "ai" && mode === "classic" && <>
        <div style={{ height: 12 }} />
        <FieldLabel>{t("quick.elo")}</FieldLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input type="range" min={600} max={2200} step={50} value={elo} onChange={(e) => setElo(+e.target.value)}
            style={{ flex: 1, accentColor: T.gold }} aria-label={t("quick.elo")} />
          <input type="number" min={600} max={2200} step={50} value={elo}
            onChange={(e) => setElo(Math.max(600, Math.min(2200, +e.target.value || 1000)))}
            style={{ width: 84, background: T.bg2, border: `1px solid rgba(233,210,150,.5)`, borderRadius: 8,
              color: "#f0d68a", fontWeight: 800, textAlign: "center", padding: "9px 6px", fontFamily: "inherit", fontSize: 15.5,
              WebkitAppearance: "none", MozAppearance: "textfield", appearance: "textfield", outline: "none" }} />
        </div>
        <div style={{ fontSize: 11.5, color: T.faint, marginTop: 5 }}>{t("quick.eloHint")}</div>
      </>}
      <GoldShineButton style={{ width: "100%", padding: "12px 16px", fontSize: 14.5, borderRadius: 12, marginTop: 16 }}
        onClick={() => { dispatch({ type: "SET_DIFFICULTY", difficulty }); if (mode === "classic") dispatch({ type: "SET_CLASSIC_ELO", elo });
          onStart({ mapId: mode === "classic" ? "classic" : mapId, mode, difficulty, elo, hotseat: foe === "hotseat", hotseatFlip: hsTurn === "turn" }); }}>
        <StartMark size={15} /> {t("quick.start")}
      </GoldShineButton>
    </Panel>
  );
}

// Pre-battle story card for campaign stages: chapter, place, a line of lore,
// and the boss you are about to face. The stage clock (if any) is announced
// here — it starts ticking only once you step in.
// THE FIRST LESSON OF THE HP RULES. Two orbs decide every exchange and the
// game never said what they mean — worst of all the bounce, where an attacker
// springs back to its own square because the defender still stands. That looks
// like a bug until someone explains it. Shown before every life battle until
// the player says "enough".
function HpBriefing({ t, onBegin, onNever }) {
  const Row = ({ orb, text }) => (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start", margin: "10px 0" }}>
      <span style={{ flex: "0 0 auto", marginTop: 1 }}>{orb}</span>
      <span style={{ fontSize: 13, lineHeight: 1.5, textAlign: "left" }}>{text}</span>
    </div>);
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.78)", backdropFilter: "blur(2px)", borderRadius: 12, padding: 14, zIndex: 6 }}>
      <div style={{ background: "#efe9da", color: "#2e2a20", borderRadius: 14, padding: "18px 18px 14px",
        maxWidth: 350, width: "100%", boxShadow: "0 14px 34px rgba(0,0,0,.5)", border: "1px solid #c9bfa4" }}>
        <div className="gg-serif" style={{ fontSize: 20, letterSpacing: ".03em", textAlign: "center" }}>{t("hpb.title")}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "9px 0 4px" }}>
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
          <span style={{ width: 6, height: 6, background: "#8a6f4d", transform: "rotate(45deg)" }} />
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5, textAlign: "center", color: "#5c5344" }}>{t("hpb.lead")}</div>
        {/* v1.25.4: die Werteerklaerung zeigt die Zahlen in den Farben des
            Sockelbandes statt als Perlen - dieselbe Sprache wie am Brett. */}
        <Row orb={<span style={{ font: "800 22px/1 Georgia, serif", color: "#b6cdff" }}>3</span>} text={t("hpb.atk")} />
        <Row orb={<span style={{ font: "800 22px/1 Georgia, serif", color: "#ffb3aa" }}>5</span>} text={t("hpb.hp")} />
        <div style={{ borderTop: "1px solid #d8cfb8", margin: "6px 0 0", paddingTop: 9, fontSize: 13, lineHeight: 1.5 }}>
          {t("hpb.bounce")}
        </div>
        <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.5, color: "#5c5344" }}>{t("hpb.star")}</div>
        <button onClick={onBegin} style={{ width: "100%", marginTop: 14, fontFamily: "inherit", fontWeight: 900,
          fontSize: 14.5, borderRadius: 999, padding: "12px 18px", border: "1px solid rgba(255,240,200,.5)", cursor: "pointer",
          background: "linear-gradient(160deg, #f0d68a, #d9b565 55%, #b08c44)", color: "#17110a",
          boxShadow: "0 0 14px rgba(217,181,101,.5)" }}>{t("hpb.ok")}</button>
        <button onClick={onNever} style={{ width: "100%", marginTop: 7, fontFamily: "inherit", fontWeight: 700,
          fontSize: 12.5, borderRadius: 999, padding: "8px 14px", border: "1px solid #c9bfa4",
          background: "transparent", color: "#6b6152", cursor: "pointer" }}>{t("hpb.never")}</button>
      </div>
    </div>
  );
}

function StoryIntro({ node, boss, t, en, onBegin, timer = null, profile = null }) {
  const ch = chapterForRow(node.row || 0);
  const roman = ["I", "II", "III", "IV"][ch.n - 1];
  return (
    <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
      background: "rgba(8,10,14,.74)", backdropFilter: "blur(2px)", borderRadius: 12, padding: 14, zIndex: 5 }}>
      <div style={{ background: "#efe9da", color: "#2e2a20", borderRadius: 14, padding: "18px 18px 16px",
        maxWidth: 340, width: "100%", boxShadow: "0 14px 34px rgba(0,0,0,.5)", border: "1px solid #c9bfa4", textAlign: "center" }}>
        <div className="gg-serif" style={{ fontSize: 10.5, letterSpacing: ".22em", color: "#8a6f4d" }}>
          {t("story.chapter", { r: roman }).toUpperCase()} · {(en ? ch.titleEn : ch.titleDe).toUpperCase()}
        </div>
        <div className="gg-serif" style={{ fontSize: 23, letterSpacing: ".04em", marginTop: 6 }}>{node.place}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 10px" }}>
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
          <span style={{ width: 6, height: 6, background: "#8a6f4d", transform: "rotate(45deg)" }} />
          <span style={{ flex: 1, height: 1, background: "#c9bfa4" }} />
        </div>
        <div className="gg-serif" style={{ fontSize: 13.5, fontStyle: "italic", lineHeight: 1.55 }}>
          {en ? node.storyEn : node.storyDe}
        </div>
        {boss && <div style={{ marginTop: 12, fontSize: 12.5, fontWeight: 800, color: "#8e2f39" }}>
          {boss.bossId?.startsWith("pb_") ? <JewelIc kind="power" size={12} /> : <SkullIc size={12} />} {boss.name[en ? "en" : "de"]}
        </div>}
        {boss && voiceFor(boss) && <div className="gg-serif" style={{ marginTop: 7, fontSize: 12.5, fontStyle: "italic",
          lineHeight: 1.55, color: "#5c5140" }}>
          {mitHeld(voiceFor(boss)[en ? "heraldEn" : "heraldDe"], profile)}
        </div>}
        {timer && <div style={{ marginTop: 8, fontSize: 12.5, fontWeight: 800, color: "#8a6f4d" }}>
          <HourglassIc size={13} color="#8a6f4d" /> {timer.type === "total"
            ? `${Math.round(timer.seconds / 60)} min`
            : `${timer.seconds}s ${en ? "per move" : "pro Zug"}`}
        </div>}
        <button onClick={onBegin} style={{ marginTop: 14, width: "100%", padding: "11px 14px", borderRadius: 10,
          background: "#1d2436", color: "#e9e2cf", fontWeight: 800, fontSize: 14.5, border: "none",
          fontFamily: "inherit", cursor: "pointer", letterSpacing: ".04em" }}>{t("story.begin")} ›</button>
      </div>
    </div>
  );
}

function ResultBanner({ banner, t, onNew, campaign = false, onExit = null, onSettings = null, unlockName = null, unlockId = null, fledName = null, en = false, onArmy = null, pvpInfo = null, boss = null, newSkills = [] }) {
  const win = banner.result === "win";
  const color = banner.hotseat ? T.gold : win ? T.lime : banner.result === "draw" ? T.gold : "#b4636c";
  const title = banner.hotseat
    ? (banner.result === "draw" ? t("game.draw") : t(win ? "hs.winWhite" : "hs.winBlack"))
    : win ? t("game.win") : banner.result === "draw" ? t("game.draw") : t("game.lose");
  const sub = campaign && win && unlockName ? t("game.unlocked", { name: unlockName })
    : campaign && win && fledName ? t("camp.fled", { name: fledName })
    : campaign && win ? t("game.stageCleared")
    : banner.reason === "checkmate" ? t("game.checkmate")
    : banner.reason === "regicide" ? t("game.regicide")
    : banner.reason === "time" ? t("game.timeout")
    : banner.reason === "ohneSchaden" ? t("game.stillstandSub")
    : (banner.reason === "stalemate" || banner.reason === "draw") ? t("game.stalemate")
    : t("game.resigned");
  const g = banner.gained;
  const leveled = g.levelAfter > g.levelBefore;
  /* v1.0.67: DAS BANNER TRITT AUF, DIE BEUTE FOLGT GESTAFFELT, DAS GOLD
     ZAEHLT (Besitzer: "wenn man Geld verdient, soll man wirklich SEHEN,
     dass man Geld verdient"). Drei Bausteine, alle hinter dem Schalter:
     - ggAuftritt versetzt Titel, Beutezeile, Stufenmeldung nacheinander
     - ueber der Goldmarke fallen drehende Muenzen (ggMuenzFall, rotateY)
     - der Betrag zaehlt in ~0,9 s hoch statt fertig dazustehen.
     Der Zaehllauf haengt an banner.gained.gold, laeuft also genau einmal. */
  const anAn = animAn();
  const [goldZahl, setGoldZahl] = useState(anAn ? 0 : (g?.gold || 0));
  /* v1.0.73: die Klaenge zum Bild - Muenzregen, wenn Gold faellt; der
     Koenigsfall, wenn ein Koenig kippt. Einmal je Banner (leerer Abhaenger). */
  useEffect(() => {
    if (!anAn) return;
    if (g && g.gold > 0) { const t = setTimeout(() => { try { klang("muenzregen"); } catch {} }, 260); return () => clearTimeout(t); }
  }, []);   // eslint-disable-line
  useEffect(() => {
    if (!anAn) return;
    if (banner && (banner.reason === "checkmate" || banner.reason === "regicide")) {
      const t = setTimeout(() => { try { klang("koenigsfall"); } catch {} }, 420);
      return () => clearTimeout(t);
    }
  }, []);   // eslint-disable-line
  useEffect(() => {
    if (!anAn || !g || !g.gold) { setGoldZahl(g?.gold || 0); return; }
    const start = performance.now(); let raf = 0;
    const tick = (jetzt) => {
      const f = Math.min(1, (jetzt - start) / 900);
      setGoldZahl(Math.round(g.gold * (1 - Math.pow(1 - f, 3))));
      if (f < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [g?.gold, anAn]);   // eslint-disable-line
  const tritt = (nr) => anAn ? { animation: `ggAuftritt .5s ease-out ${(0.12 * nr).toFixed(2)}s both` } : null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", background: "rgba(8,10,14,.72)", backdropFilter: "blur(2px)", padding: 14 }}>
      <Panel style={{ width: "100%", maxWidth: 320, textAlign: "center", borderColor: color + "66",
        ...(anAn ? { animation: "ggAuftritt .45s ease-out both" } : null) }}>
        <div style={{ fontSize: 13, color: T.dim, textTransform: "uppercase", letterSpacing: 1, ...tritt(0) }}>{sub}</div>
        <div style={{ fontSize: 30, fontWeight: 900, color, margin: "4px 0 10px", ...tritt(1) }}>{title}</div>
        {!banner.hotseat && <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: leveled ? 8 : 12, ...tritt(2) }}>
          <Chip color={T.limeInk} bg={T.lime}>+{g.xp} {t("game.rewards")}</Chip>
          {g.sp > 0 && <Chip color={"#17110a"} bg={T.gold}><SkillStar size={12} /> {t("banner.sp", { n: g.sp })}</Chip>}
          {g.gold > 0 && <span style={{ position: "relative", display: "inline-flex" }}>
            <Chip color={"#17110a"} bg={"#e8c96a"}><GoldCoin size={12} /> +{goldZahl}</Chip>
            {anAn && <span aria-hidden style={{ position: "absolute", inset: "-160% -12% 0", overflow: "visible", pointerEvents: "none" }}>
              {[0, 1, 2, 3, 4].map((m) => <span key={m} style={{ position: "absolute",
                left: `${12 + m * 18}%`, top: 0, animation: `ggMuenzFall ${(0.9 + (m % 3) * 0.22).toFixed(2)}s ease-in ${(m * 0.14).toFixed(2)}s both` }}>
                <GoldCoin size={11} /></span>)}
            </span>}
          </span>}
          {/* v1.30.0: WEGELAGEREI - Beute oder Raub, nach der Partie verrechnet */}
          {g.beute ? <Chip color={g.beute > 0 ? "#17110a" : "#ffe3de"} bg={g.beute > 0 ? "#e8c96a" : "#7a2a22"}>
            <GoldCoin size={12} /> {g.beute > 0 ? "+" + g.beute : g.beute} {t("banner.beute." + (g.beute > 0 ? "plus" : "minus"))}</Chip> : null}
          {g.newAchievements.length > 0 && <Chip color={T.gold} bg={T.panel2}>★ {g.newAchievements.length}</Chip>}
        </div>}
        {leveled && <div style={{ color: T.lime, fontWeight: 800, marginBottom: 12, ...tritt(3) }}>
          {anAn && <span aria-hidden style={{ display: "inline-block", marginRight: 6, color: T.gold,
            animation: "ggStufenStern 1.1s ease-out .5s both" }}>✦</span>}
          {t("game.levelup", { n: g.levelAfter })}</div>}
        {g.newItems?.length > 0 && <div style={{ display: "grid", gap: 5, margin: "2px 0 12px" }}>
          {g.newItems.map((ni) => {
            const it = ITEMS[ni.id];
            return <div key={ni.id} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              padding: "7px 10px", borderRadius: 10, fontSize: 12.5, fontWeight: 800,
              background: "linear-gradient(168deg, #2c4f9e 0%, #1b3068 55%, #142450 100%)",
              border: "1px solid #e3c07a", color: "#f6e9a4",
              boxShadow: "0 0 10px rgba(64,110,220,.3)" }}>
              {ni.id === "spvault" ? <SkillStar size={15} /> : <ItemIcon id={ni.id} size={17} />}
              <span>{ni.id === "spvault" ? t("banner.vault")
                : t(ni.free ? "banner.newItemFree" : "banner.newItem", { name: it ? (en ? it.nameEn : it.nameDe) : ni.id })}</span>
            </div>; })}
        </div>}
        {campaign && win && boss && voiceFor(boss) && (
          <div className="gg-serif" style={{ margin: "2px 0 10px", padding: "10px 12px", borderRadius: 12,
            border: "1px solid rgba(233,210,150,.3)", background: "rgba(10,13,20,.55)",
            fontStyle: "italic", fontSize: 12.5, lineHeight: 1.55, color: "rgba(240,233,216,.9)" }}>
            „{mitHeld(voiceFor(boss)[en ? "afterEn" : "afterDe"], profile)}"
            <div style={{ fontStyle: "normal", fontSize: 10.5, letterSpacing: ".14em", color: "#c9a45c", marginTop: 5 }}>
              — {boss.name[en ? "en" : "de"].toUpperCase()}</div>
          </div>
        )}
        {campaign && win && unlockId && (() => {
          const ch = CHARACTERS_BY_ID[unlockId];
          if (!ch) return null;
          const abilities = (ch.ladder || []).filter((r) => r.ability).length;
          const shields = (ch.ladder || []).reduce((a, r) => a + (r.shield || 0), 0);
          const maxLv = (ch.ladder || []).reduce((a, r) => Math.max(a, r.level), 1);
          const pt = paintedById(unlockId);
          return <div style={{ margin: "2px 0 12px", padding: "12px 12px 11px", borderRadius: 12,
            border: "1px solid #8a6d3577", background: "linear-gradient(170deg, rgba(46,37,16,.5), rgba(22,20,14,.4))" }}>
            {/* redeemed: the portrait sheds the enemy blue and turns gold */}
            {pt && <img src={pt} alt="" draggable={false} style={{ width: 84, height: 84, objectFit: "contain",
              filter: "drop-shadow(0 3px 6px rgba(0,0,0,.5))", animation: "ggRedeem 1.5s ease .35s both", userSelect: "none" }} />}
            <div className="gg-serif" style={{ fontSize: 19, letterSpacing: ".05em", color: T.gold, marginTop: 2 }}>
              {en ? ch.nameEn : ch.nameDe}</div>
            {(ch.flavorDe || ch.flavorEn) && <div style={{ fontSize: 12, color: T.dim, fontStyle: "italic", marginTop: 3, lineHeight: 1.45 }}>
              {en ? ch.flavorEn : ch.flavorDe}</div>}
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
              <Chip color={T.gold} bg={T.panel2}>✦ {t("banner.abilities", { n: abilities })}</Chip>
              {shields > 0 && <Chip color={T.gold} bg={T.panel2}>⛨ {t("banner.shields", { n: shields })}</Chip>}
              <Chip color={T.gold} bg={T.panel2}>{t("banner.maxLevel", { n: maxLv })}</Chip>
            </div>
          </div>;
        })()}
        {newSkills.length > 0 && (
          <div style={{ margin: "2px 0 12px", padding: "11px 13px 10px", borderRadius: 12, textAlign: "left",
            border: "1px solid #8a6d3577", background: "linear-gradient(170deg, rgba(46,37,16,.5), rgba(22,20,14,.4))",
            ...tritt(4) }}>
            <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".16em", color: T.gold, textAlign: "center", marginBottom: 7 }}>
              {t("banner.learned")}</div>
            {newSkills.map((l, i) => (
              <div key={i} style={{ padding: "5px 0", borderTop: i ? "1px dashed rgba(233,210,150,.18)" : "none",
                ...tritt(5 + i) }}>
                <div className="gg-serif" style={{ fontSize: 13, color: T.goldBright }}>
                  {l.ab ? t("banner.learnsAbility", { ch: l.nm, ab: en ? l.ab.nameEn : l.ab.nameDe })
                    : l.shield ? t("banner.gainsShield", { ch: l.nm, n: l.shield })
                    : t("banner.gambitTier", { r: l.tier })}
                </div>
                {l.ab && <div style={{ fontSize: 11.5, color: T.dim, lineHeight: 1.45, marginTop: 2 }}>
                  {en ? l.ab.descEn : l.ab.descDe}</div>}
              </div>
            ))}
          </div>
        )}
        {campaign ? (
          win
            ? (unlockId && onArmy
              ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Button variant="primary" onClick={onArmy}>{t("banner.toArmy")} ›</Button>
                  <Button variant="subtle" onClick={onExit}>{t("camp.back")}</Button>
                </div>
              : <Button variant="primary" style={{ width: "100%" }} onClick={onExit}>{t("camp.back")}</Button>)
            : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Button variant="primary" onClick={onNew}>{t("camp.replay")}</Button>
                <Button variant="subtle" onClick={onExit}>{t("common.back")}</Button>
              </div>
        ) : (
          pvpInfo
          ? <div style={{ display: "grid", gap: 8 }}>
              {pvpInfo.rated && <div style={{ fontSize: 13, color: T.gold, textAlign: "center", fontWeight: 800 }}>
                {t("online.rated", { r: pvpInfo.rated.rating, d: (pvpInfo.rated.delta >= 0 ? "+" : "") + pvpInfo.rated.delta })}</div>}
              {pvpInfo.rematch === "offer" && <div style={{ fontSize: 12.5, color: T.green, textAlign: "center" }}><JewelIc kind="power" size={12} /> {t("online.rematchOffer")}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Button variant="primary" disabled={pvpInfo.rematch === "wait"} onClick={pvpInfo.onRematch}>
                  {pvpInfo.rematch === "wait" ? t("online.rematchWait") : <><JewelIc kind="power" size={13} /> {t("online.rematch")}</>}
                </Button>
                <Button variant="subtle" onClick={onNew}>{t("common.back")}</Button>
              </div>
            </div>
          : onSettings
          ? <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button variant="primary" onClick={onNew}>{t("game.newgame")}</Button>
              <Button variant="subtle" onClick={onSettings}>⚙ {t("game.settings")}</Button>
            </div>
          : <Button variant="primary" style={{ width: "100%" }} onClick={onNew}>{t("game.newgame")}</Button>
        )}
      </Panel>
    </div>
  );
}
