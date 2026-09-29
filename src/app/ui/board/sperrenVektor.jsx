// ── SPERREN, GEZEICHNET STATT GEMALT ────────────────────────────────────────
// Gemalt gibt es bislang nur die Mauer (v1.0.46, drei Zustaende). Zaun und
// Bollwerk warten auf ihre Bilder - und bis dahin waeren sie UNSICHTBAR
// gewesen: SperrGlyph gibt bei fehlendem Bild null zurueck, was fuer eine
// blosse Regel richtig war, fuer eine gekaufte Ware aber nicht. Wer 40 Gold
// fuer einen Zaun zahlt, muss ihn sehen.
//
// Also dieselbe Hand wie bei den schlichten Figuren-Zeichnungen: mattes
// bemaltes Holz, flache Facetten, kein Glanz, kein Metall. Drei Zustaende je
// Art, dieselben drei Worte wie in stadium(): heil, angeschlagen, truemmer.
//
// Diese Zeichnung ist ausserdem das Ladenbild: im Vorrat des Hofstaats zeigt
// jede Sperre genau das, was auf dem Brett stehen wird (siehe ItemIcon).

/* Die Farben stammen aus der Holz-/Steinpalette des Bretts, nicht aus dem
   Goldkanon: eine Sperre gehoert niemandem, sie steht nur im Weg. */
const HOLZ = "#8a6a3e", HOLZ_D = "#5e4526", HOLZ_H = "#a98453";
const STEIN = "#8d8577", STEIN_D = "#5c564b", STEIN_H = "#a9a291";

/* Jede Art in drei Zustaenden. Ein Eintrag ist blosses SVG-Innenleben im
   Kaesten 0 0 32 32 - so wie ICON_ART es fuer die Gegenstaende haelt. */
const RISSE = {
  zaun: {
    heil: `
      <path d="M6 12h20v3H6z" fill="${HOLZ}"/>
      <path d="M6 19h20v3H6z" fill="${HOLZ}"/>
      <path d="M6 12h20v1H6z" fill="${HOLZ_H}"/>
      <path d="M7.5 8h3.4v20H7.5zM14.3 8h3.4v20h-3.4zM21.1 8h3.4v20h-3.4z" fill="${HOLZ}"/>
      <path d="M7.5 8h3.4l-1.7 2.2zM14.3 8h3.4l-1.7 2.2zM21.1 8h3.4l-1.7 2.2z" fill="${HOLZ_D}"/>
      <path d="M9.2 8v20M16 8v20M22.8 8v20" stroke="${HOLZ_H}" stroke-width=".7" opacity=".55"/>`,
    angeschlagen: `
      <path d="M6 12h9v3H6z" fill="${HOLZ}"/>
      <path d="M19 19h7v3h-7z" fill="${HOLZ}"/>
      <path d="M6 19h7.5v3H6z" fill="${HOLZ}"/>
      <path d="M7.5 8h3.4v20H7.5z" fill="${HOLZ}"/>
      <path d="M21.1 10.5h3.4V28h-3.4z" fill="${HOLZ}"/>
      <path d="M14.3 14l3.4 1.6-1 12.4h-3.4z" fill="${HOLZ}" opacity=".9"/>
      <path d="M7.5 8h3.4l-1.7 2.2z" fill="${HOLZ_D}"/>
      <path d="M21.1 10.5l1.7 1.6 1.7-1.6z" fill="${HOLZ_D}"/>`,
    truemmer: `
      <path d="M4 25h24l-1.5 3.4H5.5z" fill="${HOLZ_D}" opacity=".55"/>
      <path d="M5 23.4l9.4-1.2.4 2.4-9.4 1.2z" fill="${HOLZ}"/>
      <path d="M17 22.2l10 1.4-.4 2.4-10-1.4z" fill="${HOLZ}"/>
      <path d="M9 26.2l7-.6.2 1.8-7 .6z" fill="${HOLZ_D}"/>`,
  },
  mauer: {
    heil: `
      <path d="M5 10h22v18H5z" fill="${STEIN}"/>
      <path d="M5 10h22v1.6H5z" fill="${STEIN_H}"/>
      <path d="M5 16h22M5 22h22" stroke="${STEIN_D}" stroke-width="1.1"/>
      <path d="M12 10v6M20 10v6M8 16v6M16 16v6M24 16v6M12 22v6M20 22v6" stroke="${STEIN_D}" stroke-width="1.1"/>`,
    angeschlagen: `
      <path d="M5 10h9.5l1.5 4-2 4 2.5 4-1 6H5z" fill="${STEIN}"/>
      <path d="M18.5 13.5H27v14.5h-8.5l1.5-5-2-4.5z" fill="${STEIN}"/>
      <path d="M5 10h9.5l.4 1.6H5z" fill="${STEIN_H}"/>
      <path d="M5 16h9M19.6 22H27M5 22h10" stroke="${STEIN_D}" stroke-width="1.1"/>
      <path d="M9 10v6M12 22v6M23 13.5v4M22 22v6" stroke="${STEIN_D}" stroke-width="1.1"/>`,
    truemmer: `
      <path d="M3 24.6h26l-1.6 3.8H4.6z" fill="${STEIN_D}" opacity=".5"/>
      <path d="M5 22.6l6.4-1.4 1 3.2-6.6 1z" fill="${STEIN}"/>
      <path d="M13.6 23l5.4-1.8 1.6 3-5.4 1.6z" fill="${STEIN_H}" opacity=".85"/>
      <path d="M21.4 22.4l6 1.4-.8 2.8-6-1.4z" fill="${STEIN}"/>
      <path d="M8 26.4l14-.6.2 1.8-14 .6z" fill="${STEIN_D}"/>`,
  },
  bergfried: {
    heil: `
      <path d="M4 12h24v16H4z" fill="${STEIN}"/>
      <path d="M4 6h4v6H4zM11 6h4v6h-4zM18 6h4v6h-4zM25 6h3v6h-3z" fill="${STEIN}"/>
      <path d="M4 6h4v1.4H4zM11 6h4v1.4h-4zM18 6h4v1.4h-4zM25 6h3v1.4h-3z" fill="${STEIN_H}"/>
      <path d="M4 12h24v1.4H4z" fill="${STEIN_H}"/>
      <path d="M4 18h24M4 23h24" stroke="${STEIN_D}" stroke-width="1.1"/>
      <path d="M10 13.4v4.6M18 13.4v4.6M14 18v5M22 18v5M10 23v5M18 23v5" stroke="${STEIN_D}" stroke-width="1.1"/>
      <path d="M13.6 20h4.8v8h-4.8z" fill="${STEIN_D}" opacity=".75"/>`,
    angeschlagen: `
      <path d="M4 12h24v16H4z" fill="${STEIN}"/>
      <path d="M4 6h4v6H4zM18 6h4v6h-4z" fill="${STEIN}"/>
      <path d="M11 8.6h4V12h-4z" fill="${STEIN}" opacity=".85"/>
      <path d="M4 12h24v1.4H4z" fill="${STEIN_H}"/>
      <path d="M22.4 13.4l2.2 4-1.6 3.4 2.4 3.6-1.4 3.6" stroke="${STEIN_D}" stroke-width="1.3" fill="none"/>
      <path d="M4 18h16M4 23h13" stroke="${STEIN_D}" stroke-width="1.1"/>
      <path d="M10 13.4v4.6M14 18v5M8 23v5" stroke="${STEIN_D}" stroke-width="1.1"/>`,
    truemmer: `
      <path d="M2 24h28l-1.6 4H3.6z" fill="${STEIN_D}" opacity=".5"/>
      <path d="M3.4 21.6l7 -2 1.6 4.2-7.2 1.6z" fill="${STEIN}"/>
      <path d="M12.6 22.4l6.4-2.6 2 3.8-6.4 2.2z" fill="${STEIN_H}" opacity=".85"/>
      <path d="M21 21.8l7.4 2-1 3-7.2-1.8z" fill="${STEIN}"/>
      <path d="M6 26.6l19-.8.2 2-19 .8z" fill="${STEIN_D}"/>`,
  },
};

/* ══ DIE FALLEN (v1.90.9, Audit A32) ════════════════════════════
   Gemalt gibt es sie noch nicht - die Prompts liegen in
   design/BRETT-OBJEKTE.md (falle-verdeckt, falle-ausgeloest,
   baerenfalle-verdeckt, baerenfalle-zu), im selben Stilblock wie Mauer und
   Zaun. Bis die Bilder da sind, zeichnet dieselbe Hand.

   ZWEI ZUSTAENDE, nicht drei: eine Falle broeckelt nicht, sie schnappt zu.
   "verdeckt" sieht nur, wer sie legte (falleSichtbar in core/rules/
   sperren.js) - darum darf sie unauffaellig sein, aber nicht unsichtbar:
   der eigene Spieler muss sein Feld wiederfinden.

   SIE LIEGEN FLACH. Anders als Mauer und Zaun stehen sie nicht auf der
   Feldkante, sondern liegen in der Mitte - wie die Truemmer. */
const ERDE = "#7a5a34", ERDE_D = "#4a3620", LAUB = "#4e6b33", LAUB_H = "#6d8a49";
const EISEN = "#6a6a72", EISEN_D = "#3a3a42", EISEN_H = "#9a9aa6";

const FALLEN_RISSE = {
  grube: {
    verdeckt: `
      <ellipse cx="16" cy="18" rx="12" ry="7" fill="${ERDE_D}" opacity=".45"/>
      <path d="M5 15.5l22 1.6M6.4 20.6l19.4-4.2M8 12.6l16.6 8.4" stroke="${ERDE}" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M9.6 14.2l4.6-1.2.8 2.2-4.8 1z" fill="${LAUB}"/>
      <path d="M18.6 19.6l4.4-1.4 1 2-4.6 1.4z" fill="${LAUB_H}" opacity=".9"/>
      <path d="M13 20.8l3.6-.8.6 1.8-3.8.8z" fill="${LAUB}" opacity=".8"/>`,
    offen: `
      <ellipse cx="16" cy="18" rx="12" ry="7" fill="${ERDE_D}"/>
      <ellipse cx="16" cy="17.4" rx="9.6" ry="5.2" fill="#1a1208"/>
      <path d="M10.6 18.4l1.4-4.6 1.6 4.2zM14.6 19.4l1.4-5.4 1.6 5zM18.6 18.6l1.4-4.4 1.5 4.1z" fill="#c9b184"/>
      <path d="M5.4 15.2l3.6-1.4.8 1.8-3.8 1.4zM23.4 20.2l3.6 1.2-.8 1.8-3.6-1.4z" fill="${ERDE}"/>`,
  },
  baerenfalle: {
    verdeckt: `
      <ellipse cx="16" cy="19" rx="11" ry="6" fill="${ERDE_D}" opacity=".4"/>
      <path d="M8.6 18.6a7.4 7.4 0 0 1 14.8 0" stroke="${EISEN_D}" stroke-width="1.6" fill="none" opacity=".75"/>
      <path d="M9.8 15.6l3.8-1.2.7 2-3.9 1.2z" fill="${LAUB}"/>
      <path d="M17.8 20.4l4.2-1.2.8 1.9-4.3 1.2z" fill="${LAUB_H}" opacity=".9"/>
      <path d="M12.6 21.2l4-.9.5 1.7-4.1.9z" fill="${LAUB}" opacity=".8"/>`,
    offen: `
      <ellipse cx="16" cy="19.6" rx="10" ry="5" fill="${ERDE_D}" opacity=".5"/>
      <circle cx="16" cy="18" r="6.2" fill="none" stroke="${EISEN}" stroke-width="2.4"/>
      <circle cx="16" cy="18" r="6.2" fill="none" stroke="${EISEN_H}" stroke-width=".8" opacity=".6"/>
      <path d="M11.4 15.4l1.6 2.6-1.8 2.4M14.2 13.6l1 3.2-1.2 3M18 13.6l-1 3.2 1.2 3M20.6 15.4l-1.6 2.6 1.8 2.4"
            stroke="${EISEN_D}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M22.4 19.8l4.4 2.6" stroke="${EISEN_D}" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="27.2" cy="22.8" r="1.5" fill="none" stroke="${EISEN_D}" stroke-width="1.2"/>`,
  },
};

/** Gibt es fuer diese Falle eine Zeichnung? */
export const hatFallenVektor = (art) => !!FALLEN_RISSE[art];

/** Eine Falle als Zeichnung. `offen` = zugeschnappt bzw. aufgerissen. */
export function FalleVektor({ art, offen = false, size = 24, fuellt = false, style = null }) {
  const satz = FALLEN_RISSE[art];
  if (!satz) return null;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true"
      width={fuellt ? "100%" : size} height={fuellt ? "100%" : size}
      /* Fallen LIEGEN - mittig, nicht auf der Feldkante wie Mauer und Zaun. */
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.45))", ...style }}
      dangerouslySetInnerHTML={{ __html: offen ? satz.offen : satz.verdeckt }} />
  );
}

/** Gibt es fuer diese Art ueberhaupt eine Zeichnung? */
export const hatVektor = (art) => !!RISSE[art];

/** Die Sperre als Zeichnung. `fuellt` laesst sie das Feld ausfuellen (Brett);
 *  ohne das steht sie in ihrer eigenen Groesse (Laden, Blatt). */
export function SperrVektor({ art, zustand = "heil", size = 24, fuellt = false, style = null }) {
  const satz = RISSE[art];
  if (!satz) return null;
  const innen = satz[zustand] || satz.heil;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true"
      width={fuellt ? "100%" : size} height={fuellt ? "100%" : size}
      /* Auf dem Brett steht die Sperre mit dem Fuss auf der Feldkante - genau
         wie die gemalten Fassungen, die ihr Bild unten ausrichten. */
      preserveAspectRatio={fuellt ? "xMidYMax meet" : "xMidYMid meet"}
      style={{ display: "block", filter: "drop-shadow(0 2px 3px rgba(0,0,0,.55))", ...style }}
      dangerouslySetInnerHTML={{ __html: innen }} />
  );
}
