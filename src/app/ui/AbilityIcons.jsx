// ── DIE FÄHIGKEITS-ZEICHEN ──────────────────────────────────────────────────
// Jede Fähigkeit trägt ihr eigenes rundes Medaillon: eine Farbe nach ihrem
// WESEN, ein Zeichen nach ihrer WIRKUNG. Die Familien und ihre Farben:
//
//   SCHRITT   (grün)     — zusätzliche Wege: Ausweichen, Rückzug, Wachschritt …
//   SPRUNG    (himmel)   — über Felder hinweg: Weitsprung, Hofsprung, Schwingen
//   SCHLAG    (rot)      — Angriff und Durchbruch: Stoßschlag, Sturmlauf …
//   GESCHOSS  (bernstein)— Wirkung auf Entfernung: Scharfschuss, Dauerfeuer, Haken
//   RISS      (violett)  — was die Regeln bricht: Blinzeln, Phase, Maskerade …
//   LEBEN     (smaragd)  — Kraft des Leibes: Regeneration, Lebensraub, Bollwerk
//   KRONE     (gold)     — die Würde selbst: Frühe Krönung, Königsflucht
//
// Alle Medaillons teilen den Bau: dunkler Grund im Farbton, EIN dünner heller
// Ring (nie ein Wulst), das Zeichen in hellem Strich. Die Wappen sind mit der
// Hand gesetzt — jede Linie gehört zu genau einer Fähigkeit.
import { T } from "./theme.js";

/* v1.13.1: die Familienfarben werden auch ausserhalb gebraucht - das
   Erwachen-Fenster faerbt seine Regelbox in der Farbe der Faehigkeit. */
export const FAMILIE = {
  schritt:  { grund: "#123c2a", tief: "#0a2418", ring: "#6fe0a8", strich: "#c8f5dd" },
  sprung:   { grund: "#12314e", tief: "#0a1d30", ring: "#6fc2f0", strich: "#cfeaff" },
  schlag:   { grund: "#4a1420", tief: "#2c0a12", ring: "#f07a8a", strich: "#ffd9de" },
  geschoss: { grund: "#4a3410", tief: "#2c1e08", ring: "#eec06a", strich: "#ffedc4" },
  riss:     { grund: "#321a5e", tief: "#1d0e3a", ring: "#a78bfa", strich: "#e6dcff" },
  leben:    { grund: "#0f3d33", tief: "#08241e", ring: "#5ad4b0", strich: "#c8f7e8" },
  krone:    { grund: "#4a3a10", tief: "#2c2208", ring: "#f0d68a", strich: "#fff3cf" },
};

// Fähigkeit -> [Familie, Zeichenpfad]. Die Pfade leben in einem 24er-Raster,
// Mittelpunkt 12/12; stroke-basiert, damit sie in jeder Größe fein bleiben.
/* ── DIE ZEHN BUENDE (v1.12.1) ────────────────────────────────────────────
   Besitzerwunsch: "Die Faehigkeiten von jedem Bund brauchen ein Symbol wie
   auch die anderen Faehigkeitssymbole haben."

   Sie liegen in derselben Tabelle wie die Talente und nutzen dieselben
   Familienfarben - ein Bundsymbol soll wie ein Talentsymbol aussehen, nur
   fuer etwas Groesseres stehen. Jedes zeigt das DING, nach dem der Bund
   heisst, nicht seine Wirkung: eine Krone, ein Rat, eine Spur. Die Wirkung
   steht daneben in Worten. */
export const BUND_Z = {
  bund_krone:       ["krone",    <g key="g"><path d="M5 16h14" /><path d="M5 16l1.5-7 3.5 4L12 7l2 6 3.5-4L19 16" /></g>],
  bund_konzil:      ["krone",    <g key="g"><circle cx="12" cy="12" r="6" /><circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" /><circle cx="16.5" cy="14.5" r="1.5" fill="currentColor" stroke="none" /><circle cx="7.5" cy="14.5" r="1.5" fill="currentColor" stroke="none" /></g>],
  bund_geleit:      ["sprung",   <g key="g"><path d="M7 9h10" /><path d="M14 6l3 3-3 3" /><path d="M17 15H7" /><path d="M10 12l-3 3 3 3" /></g>],
  bund_faehrte:     ["schritt",  <g key="g"><path d="M8 18c0-2 1-3 1-5" /><path d="M15 16c0-2 1-3 1-5" /><circle cx="8" cy="19" r="1.2" fill="currentColor" stroke="none" /><circle cx="15" cy="17" r="1.2" fill="currentColor" stroke="none" /><path d="M9 7l2 2 2-2" /></g>],
  bund_schatten:    ["riss",     <g key="g"><path d="M12 5a7 7 0 100 14 7 7 0 010-14z" /><path d="M12 5v14" strokeDasharray="2 2" /></g>],
  bund_schildwacht: ["geschoss", <g key="g"><path d="M12 5l6 2v6c0 3-2.5 5-6 6-3.5-1-6-3-6-6V7z" /><path d="M9 12l2 2 4-4" /></g>],
  bund_gezeiten:    ["sprung",   <g key="g"><path d="M4 13c2-2 4-2 6 0s4 2 6 0 4-2 4 0" /><path d="M4 17c2-2 4-2 6 0s4 2 6 0 4-2 4 0" /><path d="M12 5v5" /></g>],
  bund_bannkreis:   ["riss",     <g key="g"><circle cx="12" cy="12" r="7" strokeDasharray="3 2" /><path d="M9 9l6 6M15 9l-6 6" /></g>],
  bund_sturm:       ["schlag",   <g key="g"><path d="M13 4l-5 8h4l-2 8 6-9h-4z" /></g>],
  bund_nachtwache:  ["leben",    <g key="g"><path d="M16 5a6.5 6.5 0 11-7 9.5A6.5 6.5 0 0016 5z" /><circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" /><circle cx="6.5" cy="11.5" r="0.8" fill="currentColor" stroke="none" /></g>],
};

const Z = {
  // SCHRITT — Pfeile, die Wege zeigen
  pawn_sidestep:       ["schritt", <g key="g"><path d="M12 7v4" /><path d="M6 14h4M18 14h-4" /><path d="M8 12l-2 2 2 2M16 12l2 2-2 2" /></g>],
  pawn_backstep:       ["schritt", <g key="g"><path d="M12 6v8" /><path d="M9 15l3 3 3-3" /><circle cx="12" cy="6" r="1.4" fill="currentColor" stroke="none" /></g>],
  bishop_ortho_step:   ["schritt", <g key="g"><path d="M12 12V6M12 12h6M12 12v6M12 12H6" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></g>],
  rook_diag_step:      ["schritt", <g key="g"><path d="M12 12L7 7M12 12l5-5M12 12l5 5M12 12l-5 5" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /></g>],
  knight_outrider:     ["schritt", <g key="g"><path d="M7 17l4-4 2 2 4-6" /><path d="M14 9h3v3" /></g>],
  king_dash:           ["krone",   <g key="g"><path d="M6 16l4-4-2-2 5-4" /><path d="M13 6h3.5v3.5" /><path d="M9 18h7" /></g>],
  // SPRUNG — Bögen über Hindernisse
  knight_longleap:     ["sprung",  <g key="g"><path d="M5 16c2-7 12-7 14 0" /><path d="M16.6 13.4L19 16l-3.4.6" /><path d="M8 17h1M11 17h1" /></g>],
  queen_knightleap:    ["sprung",  <g key="g"><path d="M6 15c2-6 10-6 12 0" /><path d="M12 6l1 2 2-1-1 2" /><path d="M15.8 12.6L18 15l-3 .6" /></g>],
  dragon_flight:       ["sprung",  <g key="g"><path d="M12 15c-3 0-6-2-7-5 3 0 5 1 7 3 2-2 4-3 7-3-1 3-4 5-7 5z" /><path d="M12 15v3" /></g>],
  dragon_flight2:      ["sprung",  <g key="g"><path d="M12 14c-4 0-7-2-8-5 3 0 6 1 8 3 2-2 5-3 8-3-1 3-4 5-8 5z" /><path d="M12 14v4M9 17l3 2 3-2" /></g>],
  dragon_flight3:      ["sprung",  <g key="g"><path d="M12 13c-4 0-8-2-9-5 4 0 7 1 9 3 2-2 5-3 9-3-1 3-5 5-9 5z" /><path d="M8 17l2-2M12 18v-4M16 17l-2-2" /></g>],
  // SCHLAG — Klingen und Keile
  pawn_forward_capture:["schlag",  <g key="g"><path d="M12 18V9" /><path d="M8.5 12L12 8.5 15.5 12" /><path d="M9 6h6" /></g>],
  pawn_charge:         ["schlag",  <g key="g"><path d="M8 18V8M12 18V6M16 18V8" /><path d="M10 10l2-3 2 3" /></g>],
  rook_breach:         ["schlag",  <g key="g"><path d="M6 9h5M6 13h4M6 17h5" /><path d="M13 12h5M15.5 9.5L18 12l-2.5 2.5" /></g>],
  blast:               ["schlag",  <g key="g"><circle cx="12" cy="12" r="2.4" /><path d="M12 5v2.4M12 16.6V19M5 12h2.4M16.6 12H19M7 7l1.7 1.7M17 7l-1.7 1.7M7 17l1.7-1.7M17 17l-1.7-1.7" /></g>],
  chain:               ["schlag",  <g key="g"><path d="M6 7l4 3-2 3 5 2-1 4" transform="translate(1 -1)" /><path d="M13 18l-1.6-1 .3-1.9" /></g>],
  // GESCHOSS — Pfeil, Salve, Haken
  ranged_shot:         ["geschoss",<g key="g"><path d="M5 19L17 7" /><path d="M13.5 7H17v3.5" /><path d="M7 13l4 4" /></g>],
  ranged_volley:       ["geschoss",<g key="g"><path d="M5 17l7-7M9 19l7-7M13 21l6-6" transform="translate(0 -2)" /><path d="M9.5 10H12v2.5M13.5 12H16v2.5" /></g>],
  pull:                ["geschoss",<g key="g"><path d="M6 6l7 7" /><path d="M13 13c2 2 4 2 5 .5s0-3.5-2-3" /><path d="M6 6v3M6 6h3" /></g>],
  // RISS — was die Regeln bricht
  teleport:            ["riss",    <g key="g"><circle cx="8" cy="12" r="2.6" /><circle cx="16.5" cy="9" r="1.7" opacity=".7" /><path d="M11 11l3-1.4" strokeDasharray="1.6 1.8" /></g>],
  bishop_hop:          ["riss",    <g key="g"><path d="M5 16h3M16 16h3" /><path d="M9.5 16c.5-4 4.5-4 5 0" strokeDasharray="1.8 1.8" /><circle cx="12" cy="9.6" r="1.3" fill="currentColor" stroke="none" /></g>],
  gambit_masquerade:   ["riss",    <g key="g"><path d="M6 9c0 5 2.5 7 6 8 3.5-1 6-3 6-8-2-1.4-4-1.4-6 0-2-1.4-4-1.4-6 0z" /><path d="M9 12h1.6M13.4 12H15" /></g>],
  pawn_early_promo:    ["krone",   <g key="g"><path d="M6 15l1.5-6 3 3L12 7l1.5 5 3-3L18 15z" /><path d="M7 17.5h10" /></g>],
  // LEBEN — Kraft des Leibes
  regen:               ["leben",   <g key="g"><path d="M12 8v8M8 12h8" /><circle cx="12" cy="12" r="7" opacity=".55" /></g>],
  lifesteal:           ["leben",   <g key="g"><path d="M12 17c-3-2.4-5.5-4.4-5.5-7A3 3 0 0 1 12 8a3 3 0 0 1 5.5 2c0 2.6-2.5 4.6-5.5 7z" /><path d="M15.5 5.5L18 3" opacity=".8" /></g>],
  bulwark:             ["leben",   <g key="g"><path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z" /><path d="M12 8v7" opacity=".7" /></g>],
};

/** Das runde Zeichen einer Fähigkeit. Unbekannte Kennungen tragen das Zeichen
 *  des Risses — besser ein ehrliches Fragezeichen in Violett als ein Loch. */
/* ── v1.26.6 (Besitzer): DIE FELDFARBE IST DIE SYMBOLFARBE ──────────────────
   "Wenn ich Faehigkeiten erlerne, werden die oben in der Felduebersicht
    angezeigt - da bitte die Felder gemaess dem Icon faerben, wie du die
    Faehigkeit eingefaerbt hast."
   GEFUNDEN, warum sie nicht passten: das Symbol nahm seine Farbe aus der
   Familienpalette hier (FAMILIE[...]), das Zugbild aber talentFarbe() aus
   abilities.js - zwei Quellen, zwei Farben fuer dieselbe Faehigkeit. Jetzt
   fragt das Zugbild HIER nach, und zwar nach dem Ring des Symbols: das ist
   die leuchtende Kante, die man am Zeichen als seine Farbe liest. */
export function iconFarbe(id) {
  const [famName] = Z[id] || BUND_Z[id] || ["riss"];
  const f = FAMILIE[famName] || FAMILIE.riss;
  return (f && f.ring) || "#a78bfa";
}

export function AbilityIcon({ id, size = 30 }) {
  const [famName, glyph] = Z[id] || BUND_Z[id] || ["riss", <text key="t" x="12" y="16" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none">?</text>];
  const f = FAMILIE[famName];
  const rid = "abi-" + id;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "block", flex: "0 0 auto" }}>
      <defs>
        <radialGradient id={rid} cx="50%" cy="32%" r="75%">
          <stop offset="0%" stopColor={f.grund} />
          <stop offset="100%" stopColor={f.tief} />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${rid})`} />
      <circle cx="12" cy="12" r="11" fill="none" stroke={f.ring} strokeWidth="1" opacity=".85" />
      <g fill="none" stroke={f.strich} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" color={f.strich}>
        {glyph}
      </g>
    </svg>
  );
}

/** Die Familienfarbe einer Fähigkeit — für Ränder oder Texte daneben. */
export function abilityTint(id) {
  const [famName] = Z[id] || ["riss"];
  return FAMILIE[famName].ring;
}
