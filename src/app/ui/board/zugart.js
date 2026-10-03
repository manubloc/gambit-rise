/* ── WELCHE ART VON ZUG IST DAS ZIEL? (v1.90.24) ─────────────────────────────
   Besitzer, 3.10.2026, nach den ersten Partien in der Store-App: "wenn man auf
   die Figuren drueckt ... habe ich das Gefuehl, die Zuege sind nicht genau die,
   die man koennen sollte ... manchmal sieht man so einen kleinen Stern in dem
   Feld, was bedeutet das? ... diese Faerbungen - ob ich springen oder ziehen
   kann oder Fernangriff -, dass man die auf das Spielfeld uebertraegt."

   GEMESSEN am Kern (rules/moves.js), nicht vermutet:
   - Die Zuege selbst stimmen. Der Kapitaen bietet auf leerem Brett 16 Felder
     (Stufe 1), der Spaeher 12; mit Scharfschuss kommen Schuesse dazu, mit Blinzeln 23 Felder -
     aber nur, solange die Talentkarte scharf ist.
   - DER STERN WAR FALSCH VERGEBEN. Er stand an jedem Ziel mit `special`. Das
     Feld `special` tragen aber auch ganz gewoehnliche Zuege: jeder Einzel-
     schritt einer Figur mit eigenem Zugmuster (`special: "leap"` - die vier
     Diagonalschritte des Kapitaens), jeder Schritt des grossen Drachen
     (`dragonStep`), die Rochade, das En-passant. Die Kampfleiste sagt aber
     "tippe ein ✦-Feld" - der Stern soll TALENT heissen und nichts sonst.
   - Alle Ziele trugen dasselbe Gold. Ob ein Feld erlaufen, uebersprungen oder
     nur durch ein Talent erreicht wird, war nicht zu sehen.

   Diese Datei entscheidet es an EINER Stelle, ohne den Kern anzufassen (ein
   neues Feld am Zug ginge durch Protokoll und Spielstaende):
     zug    - Schritt oder Gleiten auf einer Linie          -> Blau
     sprung - ueber Figuren hinweg auf ein festes Feld      -> Gelb
     talent - das Feld kommt aus einer Faehigkeit           -> Farbe ihres
              Zeichens (iconFarbe), dazu der Stern ✦
   Blau und Gelb sind genau die Farben des Zugbilds im Hofstaat ("Blau:
   Gleiten · Gelb: Sprung"). Ein SCHLAG bleibt rot mit Ring - das hat der
   Besitzer in v1.0.74 so entschieden und es gilt weiter. */
export const ZUG_TON = { zug: "74,163,232", sprung: "233,197,63", schlag: "244,90,90", fremd: "168,124,255" };

/* Welche Faehigkeit steckt hinter einem Zug? Einmal-Talente nennen sich selbst
   (`consumes`). Dauerhafte Gangarten tun das nicht - sie sind an `special` und
   an der Geometrie zu erkennen (moves.js: rush = Sturmlauf, dragonFly =
   Fliegen, "step" ohne consumes = Schraegschritt des Turms, "leap" mit
   `weitsprung` = die beiden Springer-Talente). */
function talentVon(mv, df, dr) {
  if (mv.consumes) return mv.consumes;
  switch (mv.special) {
    case "rush": return "pawn_charge";
    case "dragonFly": return "dragon_flight";
    case "step": return "rook_diag_step";
    case "leap": return mv.weitsprung ? (df === 2 && dr === 2 ? "knight_outrider" : "knight_longleap") : null;
    default: return null;
  }
}

/** { typ: "zug" | "sprung" | "talent", talent: Kennung | null } fuer einen Zug
 *  auf einem Brett der Breite w. */
export function zugArt(mv, w) {
  if (!mv || !(w > 0)) return { typ: "zug", talent: null };
  const df = Math.abs((mv.to % w) - (mv.from % w));
  const dr = Math.abs(Math.floor(mv.to / w) - Math.floor(mv.from / w));
  const talent = talentVon(mv, df, dr);
  if (talent) return { typ: "talent", talent };
  const aufLinie = df === 0 || dr === 0 || df === dr;
  const weit = Math.max(df, dr) > 1;
  /* Ein "Sprung" ueber EIN Feld ist ein Schritt (so haelt es auch das Zugbild,
     v1.62.0); ein Ziel abseits jeder Linie ist immer gesprungen (Springer-L). */
  if (!aufLinie || (mv.special === "leap" && weit)) return { typ: "sprung", talent: null };
  return { typ: "zug", talent: null };
}

/** "#rrggbb" / "#rgb" / "rgb(a)(…)" -> "r,g,b" fuer rgba(). */
export function rgbTripel(farbe) {
  if (typeof farbe === "string" && farbe[0] === "#") {
    let h = farbe.slice(1);
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h.slice(0, 6), 16);
    if (Number.isFinite(n)) return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }
  const m = typeof farbe === "string" && farbe.match(/rgba?\(([^)]+)\)/);
  if (m) return m[1].split(",").slice(0, 3).map((x) => x.trim()).join(",");
  return "167,139,250";
}
