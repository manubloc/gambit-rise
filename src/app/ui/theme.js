// Design tokens — GAMBIT. Deep royal navy, antique gold, ivory text.
// The player is GOLD (gold plays the role of white); the enemy is the dark
// navy side rimmed in steel. Elegance over flash: serif brandmarks, diamond
// flourishes, crisp 1px lines. (Token keys kept stable: `lime` = player/primary
// accent, `magenta` = enemy accent.)
// TWO LIVERIES, ONE TOKEN SET. The app now dresses in either of two designs:
// the CLASSIC deep-navy night it has always worn, or the CARVED daylight that
// matches the painted stone piece set — lighter slate, stone-coloured panels,
// the same antique gold. Every component keeps reading `T.bg`, `T.panel`, … at
// render time, so switching is a single in-place palette swap plus a re-render;
// no component knows two designs exist. Classic stays the default: the old
// design is a promise, not a leftover.
const CLASSIC = {
  bg: "#000000", bg2: "#0a0710", panel: "#140f24", panel2: "#1c1533", line: "#2f2450",
  text: "#f0e9d8", dim: "#a9a48e",
  // faint lag bei 3,51:1 auf der Tafel - unter dem lesbaren Minimum. Derselbe
  // Ton, 18 % angehoben: 4,61:1. (Gleiche Kur wie carved in v0.31.0 bekam.)
  faint: "#837e6f",
  lime: "#d1ad55", limeDim: "#b08f3a", limeInk: "#17110a",          // player / primary accent (gold)
  magenta: "#8fa0c0", magentaDim: "#66748f", magentaInk: "#10141d", // enemy accent (steel navy)
  gold: "#eac96b", danger: "#d5495a", green: "#58c98b", blue: "#8fa0c0",
  goldBright: "#f6e9a4",
  // DER RISS: die violette Stimme des Spiels. `rift` traegt Flaechen,
  // `riftInk` die Schrift darauf, `riftGlow` den Schein. Gemessen auf
  // Schwarz: rift 4,96:1, riftLine 7,72:1, riftBright 11,38:1 - deshalb
  // steht auf violetten Flaechen WEISSE Schrift, nie dunkle.
  rift: "#7c3aed", riftDeep: "#5b21b6", riftLine: "#a78bfa", riftBright: "#c4b5fd",
  riftInk: "#f7f3ff", riftGlow: "rgba(139,92,246,.55)",
  shadow: "0 10px 28px rgba(0,0,0,.55)",
  // How see-through the floating chrome (header card, dock) is, as a hex
  // alpha appended to `panel`, plus its backdrop blur. Classic stays nearly
  // solid: on the deep navy night a translucent bar just reads as muddy.
  glass: "ec", glassBlur: "12px",
  // The login screen used to hardwire these three. That was invisible while
  // classic was the only livery, and wrong the moment carved arrived: the
  // fields stayed night-navy on a daylight app. Classic keeps the exact old
  // values, so switching to classic is still byte-for-byte the old screen.
  // NOTE: the social buttons (Google, Apple, Discord) are deliberately NOT
  // tokenised - their colours are brand requirements, not our palette.
  // The ENTRY STRETCH - login and save picking - stays black in both liveries:
  // the title art sits on it and the whole opening reads as one dark curtain.
  // Only what comes AFTER logging in wears the lightened carved stone. Classic
  // keeps its exact former values here (login was #000, saves inherited T.bg).
  input: "#0b0813", loginBg: "#000", savesBg: "#000", errText: "#e08f8f",
  radius: 14, radiusSm: 10, radiusLg: 20,
  sqLight: "#2c3a5c", sqDark: "#1b2540", grid: "#0a0e18",
  serif: `Georgia, 'Palatino Linotype', 'Times New Roman', serif`,
  // ── DESIGNSYSTEM 1.0: semantische Ergaenzungen ────────────────────────────
  // AUSWAHL IST VIOLETT, AKTION IST GOLD. Bis v0.41 faerbten Segmented,
  // MapChip und Schwierigkeitswahl ihre Selektion goldfarben - im Schnellen
  // Spiel standen dadurch vier Goldflaechen gleichzeitig, Aktion und Auswahl
  // waren nicht zu unterscheiden. Diese drei Tokens sind die eine Quelle fuer
  // jeden gewaehlten Zustand: tiefe violette Flaeche, violette Kontur, helle
  // Schrift. Gemessen: selInk auf sel(ueber bg2) 12,9:1, riftBright 9,4:1.
  sel: "#241639", selLine: "#a78bfa", selInk: "#f5f1fd",
  selGlow: "rgba(124,58,237,.30)",
  // Statusstimmen, die bisher fehlten (danger/green existieren):
  warn: "#d8a441", info: "#7fa4d6",
  // EIN disabled fuer alle: gedimmt, ohne Glanz, ohne Schein.
  disOpacity: 0.45,
  // Beruehrziele: nichts Interaktives unter 44 px Hoehe (Auftrag §10.8).
  touch: 44,
  // ── MOTION-TOKENS: eine Uhr fuer das ganze Haus ───────────────────────────
  // Druck ~120ms, Wechsel ~220ms, Fuellen ~450ms, Glanzlauf-Zyklus 11s mit
  // gestaffelten Slots (Gilded.useShineDelay), Umgebungsglut 5-7s.
  mo: { press: "120ms", fast: "160ms", norm: "220ms", slow: "280ms",
    fill: "450ms", pop: "180ms", sheen: "11s", ambient: "5.5s",
    ease: "cubic-bezier(.25,.7,.3,1)", easeOut: "cubic-bezier(.2,.85,.3,1)" },
  // Schriftrollen (TYPOGRAPHY.md): display = Cinzel (Wortmarke, grosse Titel),
  // serif = Georgia-Stapel (mittlere Titel), quill = Cormorant (Erzaehlstimme),
  // Fliesstext = System-Sans (fuellt die Inter-Rolle ohne Ladekosten).
  display: `'Cinzel', Georgia, 'Times New Roman', serif`,
  quill: `'Cormorant Garamond', 'IM Fell English', Georgia, serif`,
};
// The carved liveries' stone: everything one to two steps lighter and warmer,
// as if the whole app were cut from the same slate as the figures. Accents,
// radii and type stay identical so nothing jumps when switching.
const CARVED = { ...CLASSIC,
  // Zurueck auf das Blau - v0.33.0 hatte daraus Pergament gemacht, das war zu
  // weit. Gemeint war: dasselbe Blau, nur luftiger. Deshalb hier drei gezielte
  // Aenderungen gegen den Stand davor:
  //   1. GRUND dunkler (#202b40 -> #151d2c), damit das Schachbrett im
  //      Hintergrund darin verschwinden kann statt darauf zu liegen.
  //   2. TAFELN eine Stufe heller (#2c3a57 -> #35456a), damit sie sich vom
  //      dunkleren Grund weiter abheben als vorher.
  //   3. TAFELN leicht durchscheinend (Alpha e8 = 91 %), damit das Brett
  //      darunter zu ahnen ist. Die Kontraste sind gegen die GEMISCHTE Farbe
  //      gerechnet, nicht gegen die reine - sonst luegt die Rechnung.
  //   5. SCHWARZ als Grund und DER RISS als zweite Stimme. Das Introbild und
  //      das Wappen geben die Sprache vor: tiefes Schwarz, aus dem violettes
  //      Licht bricht. Die Tafeln bleiben ablesbar, verlieren aber ihr Blau
  //      zugunsten eines sehr dunklen Violett-Anteils.
  //   6. DIE VORLAGEN DES BESITZERS (design/vorlagen/ds1-vorlage-*.png,
  //      29. Juli): Grundton #0B0E14 statt reinem Schwarz, Tafeln #15121E /
  //      #1D1730, Schrift waermer (#F1E7C6 / #A89E8A), Violett heller
  //      (#7A3CFF / Glow #B07CFF), Statusfarben kraeftiger. Der Eintritt
  //      (Login/Spielstaende) bleibt per loginBg/savesBg tiefschwarz.
  bg: "#0b0e14", bg2: "#15121e", panel: "#1d1730e8", panel2: "#261d3ee8", line: "#38295e",
  text: "#f1e7c6", dim: "#a89e8a", faint: "#c0b8a4",
  rift: "#7a3cff", riftDeep: "#5a24cc", riftLine: "#b07cff", riftBright: "#cdb2ff",
  riftGlow: "rgba(122,60,255,.55)",
  warn: "#ffc857", green: "#3ccb7a",
  //   4. GOLD eine Stufe heller. Auf der blauen Tafel wirkte das alte Gold
  //      stumpf - Ueberschriften wie "DEINE SCHATZKAMMER" lasen sich fast
  //      dunkel. Gemessen gegen die effektive Tafelfarbe #324164 steigt der
  //      Kontrast von 6,29:1 auf 7,26:1 (gold) und 8,24:1 auf 9,07:1 (hell);
  //      der Akzent lime von 4,73:1 auf 5,85:1.
  gold: "#e6c35c", goldBright: "#f6e6ac", lime: "#d4af37", limeDim: "#b78a21",
  magenta: "#9fb0d0", magentaDim: "#76849f",
  shadow: "0 10px 24px rgba(0,0,0,.45)",
  glass: "d9", glassBlur: "18px",
  sqLight: "#41527a", sqDark: "#2d3d60", grid: "#1a2440",
  input: "#0b0813", loginBg: "#000", savesBg: "#000", errText: "#e8a6a6",
};
/** Die Abstandsleiter des Hauses - jeder neue Abstand greift eine Sprosse. */
export const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
/** DER EINE GOLDVERLAUF fuer Handlungen - aus der Vorlage des Besitzers
 *  (Gold Primaer #D4AF37 -> Gold Dunkel #B78A21). Vorher lag dieser Verlauf
 *  als Literal in acht Dateien in drei Varianten. */
export const GOLD_CTA = "linear-gradient(165deg, #e9c95d, #d4af37 48%, #b78a21)";
export const T = { ...CLASSIC };
/** Swap the whole app's livery in place. Called once from App.jsx per render
 *  of a hydrated profile — every T.* read after it sees the chosen design. */
export function setDesign(design) {
  Object.assign(T, design === "carved" ? CARVED : CLASSIC);
}

export const GLOBAL_CSS = `
  /* Desktop: bei 100% Browser-Zoom soll die App nicht verloren wirken —
     große Fenster bekommen eine sanfte eingebaute Vergrößerung. */
  @keyframes ggFade { from { opacity: 0 } to { opacity: 1 } }
  :root { --vhz: 1; }
  @media (min-width: 1440px) { #root { zoom: 1.15; } :root { --vhz: 1.15; } }
  @media (min-width: 1760px) { #root { zoom: 1.3; } :root { --vhz: 1.3; } }
  /* NOTHING in the app is selectable, draggable or downloadable — no text
     selection, no long-press save sheet, no drag-out of art, no image context
     menu. The ONLY exception is fields the user types into (name, password,
     search, import boxes), so copy/paste still works there. */
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent;
      -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;
      -webkit-user-drag: none; user-drag: none; -webkit-touch-callout: none; }
  input, textarea, [contenteditable="true"], [contenteditable=""] {
      -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; user-select: text;
      -webkit-touch-callout: default; }
  /* pull-to-refresh is retired — the app updates itself (v0.21.42); the
     gesture only ever fought the map pan and the board */
  html, body { overscroll-behavior: none; overscroll-behavior-y: none; }
  img, svg, canvas { -webkit-touch-callout: none; -webkit-user-drag: none; user-drag: none; user-select: none; }
  /* number fields render as plain gold boxes — no native spinners */
  input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
  html, body, #root { height: 100%; }
  button, a { -webkit-tap-highlight-color: transparent; }
  /* DIE WURZEL DES PLASTIK-RAHMENS: Ohne eigene Angabe geben Browser jedem
     Knopf und Feld ihren Standardrahmen "2px outset" - eine dicke, dunkle,
     dreidimensional wirkende Kante. Genau die soll nirgends erscheinen.
     Deshalb hier EIN Reset fuer alle Bedienelemente: duenne Kante, flach.
     Eigene Stile im Bauteil ueberschreiben das wie gehabt. */
  button, input, select, textarea {
    border: 1px solid transparent;
    border-radius: ${T.radiusSm}px;
    background-clip: padding-box;
  }
  input, select, textarea { border-color: ${T.line}; background-color: ${T.bg2}; color: ${T.text}; }
  input:focus, select:focus, textarea:focus { border-color: ${T.riftLine}; box-shadow: 0 0 0 3px rgba(124,58,237,.18); outline: none; }
  button:focus:not(:focus-visible), a:focus:not(:focus-visible) { outline: none; }
  /* Tastatur-Fokus ist sichtbar und violett - Fokus ist eine Auswahl. */
  button:focus-visible, a:focus-visible { outline: 2px solid ${T.riftLine}; outline-offset: 2px; }
  /* ── WARUM DER GRUND AM HTML HAENGT UND NICHT AM BODY (v1.23.5) ──────────
     Besitzerbefund, mehrfach und zu Recht: "Du hast es immer noch nicht
     geschafft, diesen Hintergrund im Hauptmenue sichtbar zu machen."

     GEMESSEN, nicht vermutet: das Kapitelbild (ground-01..12) und der
     Rissboden lagen beide im Baum, waren geladen, hatten Deckung 1 - und
     malten NULL Pixel. Dasselbe Band zweimal fotografiert, einmal mit und
     einmal ohne die Ebene: groesster Unterschied 0.

     Die Ursache ist eine Regel des Malens, keine Zeile Spiellogik. Der Grund
     des BODY wandert nur dann auf die Leinwand (und damit unter alles), wenn
     das HTML-Element selbst keinen hat. index.html setzte Schwarz auf BEIDE.
     Damit blieb der Grund des body sein eigener Kasten - und ein eigener
     Kasten des body wird NACH den Ebenen mit negativem z-index gemalt. Beide
     Hintergrundebenen liegen auf z -1. Sie wurden also gemalt und sofort
     wieder zugedeckt, auf jedem Schirm, in jedem Menue.

     Jetzt traegt das HTML den Grund (er wandert auf die Leinwand, unter
     alles), der body traegt keinen. Gegenprobe in messe_kulissen.mjs. */
  html { background: ${T.bg}; }
  body {
    margin: 0; color: ${T.text};
    background: transparent;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased; overflow-x: hidden;
  }
  button:active { transform: scale(.97); }
  .gg-thinbar { scrollbar-width: thin; scrollbar-color: rgba(233,210,150,.28) transparent; }
  .gg-thinbar::-webkit-scrollbar { width: 5px; }
  .gg-thinbar::-webkit-scrollbar-thumb { background: rgba(233,210,150,.28); border: none; border-radius: 99px; }
  ::-webkit-scrollbar { width: 10px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2b3550; border: 2.5px solid ${T.bg}; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: #c9a45c88; }
  ::-webkit-scrollbar-corner { background: transparent; }
  * { scrollbar-width: thin; scrollbar-color: #2b3550 transparent; }
  input { font-family: inherit; }
  /* Die drei Stimmen des Hauses - selbst gebuendelt (OFL, public/fonts),
     91 KB gesamt, im Precache: sie sprechen auch offline. font-display swap
     laesst Georgia sofort stehen, bis die echte Stimme geladen ist. */
  /* v1.43.0: das Rise wird gezeichnet wie mit der Feder, dann laeuft die
     Fuellung nach */
  @keyframes ggRiseBlitz { 0% { opacity: 0; filter: brightness(1); } 7% { opacity: 1; filter: brightness(3.4) drop-shadow(0 0 14px #fff); } 16% { filter: brightness(1.3); } 23% { filter: brightness(2.6) drop-shadow(0 0 10px #f4eaff); } 40% { filter: brightness(1.05); } 100% { opacity: 1; filter: brightness(1); } }
  @font-face { font-family: 'Cinzel'; src: url('/fonts/cinzel-600.woff2') format('woff2');
    font-weight: 600; font-style: normal; font-display: swap; }
  @font-face { font-family: 'Cormorant Garamond'; src: url('/fonts/cormorant-600.woff2') format('woff2');
    font-weight: 600; font-style: normal; font-display: swap; }
  @font-face { font-family: 'Cormorant Garamond'; src: url('/fonts/cormorant-500i.woff2') format('woff2');
    font-weight: 500; font-style: italic; font-display: swap; }
  .gg-serif { font-family: ${T.serif}; }
  /* JEDE GLYPHE PASST IN IHRE ZELLE: die Aufstellungs-Zellen sind bei 320 px
     35 px hoch, feste Figuren-Glyphen 39 - vier Pixel Ueberlauf (gemessen,
     pruefe-textfluss). Wer diese Klasse traegt, skaliert sein SVG hinein. */
  .gg-fit-svg { display: grid; place-items: center; min-width: 0; min-height: 0;
    /* BESTIMMTE SPUREN: mit einer auto-Zeile ist max-height:100% des Kindes
       unbestimmt und wird ignoriert (gemessen: 36-px-Bild in 28,8-px-Huelle
       TROTZ Klasse - das Bild folgte nur seinem Seitenverhaeltnis). 100%-
       Spuren machen den Kasten zur Bezugsgroesse. */
    grid-template-rows: 100%; grid-template-columns: 100%; }
  /* !important mit Absicht: TileArt setzt seine Masse INLINE - eine
     Einpass-Klasse ohne Vorfahrt waere wirkungslos (gemessen: 39-px-Bild in
     28,8-px-Huelle trotz Klasse). Die Klasse ist opt-in; wer sie traegt,
     will genau dieses Verhalten. */
  .gg-fit-svg > svg, .gg-fit-svg > img { max-width: 100% !important; max-height: 100% !important;
    width: auto !important; height: auto !important; object-fit: contain; }
  /* NUR fuer Wortmarke und grosse Titel (>=18px) - nie fuer kleine Etiketten. */
  .gg-display { font-family: ${T.display}; font-weight: 600; }
  /* WER WENIG BEWEGUNG WUENSCHT, BEKOMMT RUHE: Glanzlaeufe, Glut und
     Dauerpulse stehen still; Zustandswechsel bleiben (fast) sofort sichtbar. */
  /* DIE LETZTEN SEKUNDEN: Uhrpuls und Brettglimmen im selben Takt. Bei
     reduzierter Bewegung stehen beide still - die Uhr bleibt dann gross
     und rot, das genuegt als Signal. */
  @keyframes ggUhrAlarm { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.16); } }
  /* v0.71.14: DER RISS ZUCKT - ein greller Schlag, dann langes Ausglimmen.
     Traegt die Figur, die zuletzt gezogen hat. */
  @keyframes ggRissBlitz {
    0%   { filter: brightness(0.94) contrast(1.12) drop-shadow(0 0 1px rgba(150,105,255,.62)) drop-shadow(0 0 2.5px rgba(150,105,255,.31)); }
    6%   { filter: brightness(1.55) contrast(1.2) drop-shadow(0 0 3px rgba(232,220,255,1)) drop-shadow(0 0 9px rgba(168,120,255,.95)) drop-shadow(0 0 20px rgba(124,58,237,.8)); }
    14%  { filter: brightness(1.12) contrast(1.14) drop-shadow(0 0 2px rgba(198,168,255,.8)) drop-shadow(0 0 7px rgba(150,105,255,.6)); }
    22%  { filter: brightness(1.42) contrast(1.18) drop-shadow(0 0 3px rgba(240,232,255,.95)) drop-shadow(0 0 12px rgba(150,105,255,.85)); }
    100% { filter: brightness(0.94) contrast(1.12) drop-shadow(0 0 1px rgba(150,105,255,.62)) drop-shadow(0 0 2.5px rgba(150,105,255,.31)); }
  }
  @keyframes ggGoldBlitz {
    0%   { filter: brightness(1.10) contrast(1.10) drop-shadow(0 0 1px rgba(240,214,138,.5)); }
    8%   { filter: brightness(1.4) contrast(1.14) drop-shadow(0 0 3px rgba(255,246,214,.95)) drop-shadow(0 0 10px rgba(240,214,138,.7)); }
    100% { filter: brightness(1.10) contrast(1.10) drop-shadow(0 0 1px rgba(240,214,138,.5)); }
  }
  @keyframes ggBrettAlarm {
    0%, 100% { box-shadow: inset 0 0 0 0 rgba(214,73,90,0); }
    50% { box-shadow: inset 0 0 34px 6px rgba(214,73,90,.42), inset 0 0 90px rgba(122,60,255,.18); }
  }
  /* Waehrend der Daumen die Karte zieht, ruht das Wetter: jede Animation im
     Rahmen haelt an, damit ALLE Frames dem Zug gehoeren (gemessen 48-62 ms
     Frames beim Ziehen mit laufenden Wolken). */
  .gg-karte-zieht * { animation-play-state: paused !important; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important;
      animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
  }
  /* v1.4.9: das sanfte Erscheinen auf dem Brett - ohne Groessensprung. Nur
     Deckkraft und ein Hauch Hoehe, damit nichts "aufploppt". */
  @keyframes ggSanft { from { opacity: 0; transform: translateY(1.5%); } to { opacity: 1; transform: translateY(0); } }
  /* ── v1.24.9 (Besitzer): DER SCHADENSBLITZ ────────────────────────────────
     "Wenn eine Figur angreift, sieht man ganz kurz in Gelb, um wie viel
      dieser Angriff mich bei der Figur Leben gekostet hat" - und dazu "eine
      zoomartige Zahl, die wirklich gross wird und beim Grosswerden verblasst".
     Zwei Keyframes, beide nur mit opacity und transform, wie es die Regel
     verlangt: ggBlitz laesst das gelbe Stueck im Sockelband ausglimmen,
     ggBlitzZahl laesst die Zahl darueber wachsen und dabei vergehen. */
  @keyframes ggBlitz { 0% { opacity: 1; } 55% { opacity: .85; } 100% { opacity: 0; } }
  @keyframes ggBlitzZahl {
    0%   { opacity: 0;  transform: translate(-50%, 0) scale(.55); }
    18%  { opacity: 1;  transform: translate(-50%, -12%) scale(1.15); }
    100% { opacity: 0;  transform: translate(-50%, -78%) scale(2.35); } }
  @keyframes pop { from { transform: scale(.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  /* v1.0.14: DAS SETZEN AUFS FELD. Kein Erscheinen, sondern ein Ankommen:
     die Figur staucht beim Aufsetzen kurz in die Breite und federt zurueck -
     dieselbe Bewegung, die eine Holzfigur auf dem Brett macht. Der Fuss
     bleibt stehen (transform-origin unten), nur der Koerper gibt nach. */
  /* v1.0.96 (Besitzer, mehrfach: "der zieht fluessig, und in dem Moment, wo
     er die Figur setzt, ist wie ein Sprung - es ist scheinbar nicht das
     gleiche Objekt"): DER SPRUNG STAND IM ERSTEN KEYFRAME. Die Landung begann
     bei translateY(-7%): der Gleiter legt die Figur auf dem Zielfeld ab, im
     naechsten Rahmen erscheint die echte Figur SIEBEN PROZENT HOEHER und
     faellt herunter. Genau dieser Versatz liest sich als zweites Objekt.
     Jetzt beginnt die Landung bei translateY(0) - dort, wo der Gleiter sie
     abgesetzt hat - und federt nur noch in der BREITE aus (Stauchung statt
     Sprung). Die Figur bleibt an ihrem Platz, das Gewicht bleibt spuerbar. */
  @keyframes ggLandung {
    0%   { transform: translateY(0) scale(1.00, 1.00); }
    38%  { transform: translateY(0) scale(1.06, .945); }
    72%  { transform: translateY(0) scale(.985, 1.015); }
    100% { transform: translateY(0) scale(1, 1); }
  }
  /* Der Aufprall des Springers: ein Staubring, der aus dem Feld faehrt. */
  @keyframes ggAufprall {
    from { transform: translate(-50%,-50%) scale(.35); opacity: .55; }
    to   { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
  }
  @keyframes ggGlow { 0%,100% { box-shadow: 0 0 5px rgba(201,164,92,.22); } 50% { box-shadow: 0 0 14px rgba(201,164,92,.5); } }
  /* THE TREASURY'S MEDALLION, once its plate is opened: the ring of light
     turns around the emblem, and sparks fly off TANGENTIALLY from the brightest
     point — each spark rides its own orbit, so they leave the rim sideways
     rather than shooting straight out. */
  /* one sweep of light across a treasury plate, run once when it is tapped */
  /* Der Streifen ist 62 % so breit wie die Platte. translateX rechnet in der
     EIGENEN Breite, also brachte das alte Ziel von 120 % seine linke Kante
     nur auf 0.62*120 = 74 % der Platte - und weil die Animation mit both
     stehen bleibt, lag der Rest des Verlaufs danach fuer immer im letzten
     Viertel. Das war die harte Kante. Damit er vollstaendig hinauslaeuft,
     muss die linke Kante ueber 100 % kommen: 100/62 = 161 %. 175 % gibt Luft. */
  @keyframes ggPlateSheen { from { transform: translateX(-120%); } to { transform: translateX(175%); } }
  /* der Funkenschlag: ein Lichtpunkt wandert die Kontur entlang */
  @keyframes ggFunkenlauf { to { background-position: 200% 0; } }
  .gg-funkenkontur { position: relative; }
  .gg-funkenkontur::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(196,181,253,.15) 30%, rgba(230,220,255,.95) 46%,
      rgba(196,181,253,.6) 54%, rgba(139,92,246,.2) 70%, transparent 100%);
    background-size: 200% 100%; animation: ggFunkenlauf 2.4s linear infinite;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
  /* v1.27.1 (Besitzer): "die Grossmeister-Karten duerfen in der Uebersicht
     auch eine leuchtende, animierte Kontur haben wie der Verbessern-Knopf".
     Dieselbe laufende Kontur - aber INNEN: die Kachel schneidet mit
     overflow hidden alles ab, was ueber ihren Rand ragt, und die
     Knopffassung sitzt mit inset -1px genau dort. Sie waere unsichtbar. */
  /* v1.55.0: dieselbe leuchtende Kontur, aber stehend - fuer die Kachel-
     Uebersicht der Kapitelmeister */
  .gg-kontur-still::after { animation: none !important;
    background: linear-gradient(135deg, rgba(230,220,255,.9), rgba(167,139,250,.55) 35%, rgba(139,92,246,.35) 55%, rgba(230,220,255,.8)) !important; }
  .gg-funkenkontur-innen::after { content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
    background: linear-gradient(90deg, transparent 0%, rgba(196,181,253,.15) 30%, rgba(230,220,255,.95) 46%,
      rgba(196,181,253,.6) 54%, rgba(139,92,246,.2) 70%, transparent 100%);
    background-size: 200% 100%; animation: ggFunkenlauf 2.4s linear infinite;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 6; }
  /* das Siegel am verschlossenen Weg atmet leise */
  /* box-shadow ist eine MAL-Eigenschaft: ihr Puls strich die ganze
     Weltschicht der Karte neu (gemessen). Jetzt fester Schein, Puls per
     Opazitaet - das komponiert, statt zu malen. */
  @keyframes ggGatePuls { 0%, 100% { opacity: .8; } 50% { opacity: 1; } }
  @keyframes ggSaum { 0%, 100% { opacity: .72; } 50% { opacity: 1; } }
  @keyframes ggRiftOpen { from { transform: scale(1.09); opacity: 0; } 40% { opacity: .92; } to { transform: scale(1); opacity: .92; } }
  @keyframes ggRiftPulse { 0%, 100% { box-shadow: 0 0 9px rgba(124,58,237,.35); border-color: rgba(167,139,250,.55); }
    50% { box-shadow: 0 0 20px rgba(139,92,246,.65); border-color: rgba(196,181,253,.95); } }
  @keyframes ggHop { 0% { transform: translateY(0); } 32% { transform: translateY(-13px); } 55% { transform: translateY(0) scale(1.04, .94); } 72% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
  @keyframes ggGlide { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(-1.6deg); } }
  @keyframes ggBob { 0%, 100% { transform: translateY(0) rotate(-0.8deg); } 50% { transform: translateY(-2.5px) rotate(0.8deg); } }
  @keyframes ggRingSpin { to { transform: rotate(360deg); } }
  @keyframes ggSpark {
    0%   { opacity: 0; transform: rotate(var(--a)) translateX(var(--r)) scale(.5); }
    12%  { opacity: 1; }
    100% { opacity: 0; transform: rotate(calc(var(--a) + 46deg)) translateX(calc(var(--r) + 26px)) scale(.2); }
  }
  @keyframes ggMedalRise { from { transform: translateY(6px) scale(.86); } to { transform: none; } }
  @keyframes ggGlint { 0%, 86%, 100% { opacity: 0; } 90% { opacity: .85; } 95% { opacity: 0; } }
  @keyframes rise { from { opacity: 0; } to { opacity: 1; } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 0 2px ${T.danger}; } 50% { box-shadow: 0 0 0 2px ${T.danger}66; } }
  @keyframes hit { 0% { opacity: .8; } 100% { opacity: 0; } }
  @keyframes ggShake { 0%,100% { transform: translateX(0) rotate(0); }
    15% { transform: translateX(-9%) rotate(-5deg); } 30% { transform: translateX(8%) rotate(4deg); }
    45% { transform: translateX(-6%) rotate(-3deg); } 60% { transform: translateX(5%) rotate(2deg); }
    75% { transform: translateX(-3%) rotate(-1deg); } }
  @keyframes ggFallAway {
    0% { transform: translate(0,0) rotate(0) scale(1); opacity: 1; }
    18% { transform: translate(calc(var(--fdir) * 20%), -34%) rotate(calc(var(--fdir) * 130deg)) scale(1.06); opacity: 1; }
    100% { transform: translate(calc(var(--fdir) * 340%), -120%) rotate(calc(var(--fdir) * 900deg)) scale(.12); opacity: 0; } }
  /* the FALLEN fly to their captor's tray: UP off the top (foe took my piece →
     my tray sits below, so it flies down; I took a foe piece → its tray sits up
     top, flies up). --fdir still nudges sideways so pieces don't overlap. */
  @keyframes splashRing { from { transform: scale(.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes splashPiece { from { transform: translateY(26px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes splashSide { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: .92; } }
  @keyframes splashText { from { letter-spacing: .55em; opacity: 0; } to { letter-spacing: .18em; opacity: 1; } }
  @keyframes marbleWave { 0% { opacity: 0; } 35% { opacity: .34; } 100% { opacity: 0; } }
  /* three opening flights — each battle draws one. All of them ride CLOSE
     along the enemy's TWO ranks (screen-filling) and sweep past once before
     settling. A: left→right. B: right→left. C: a glance at your own line,
     then the sweep. */
  @keyframes ggBoardZoomIn { 0% { transform: scale(.22) translateY(2%); filter: blur(2.5px); }
    55% { filter: blur(0); }
    100% { transform: scale(1) translateY(0); filter: blur(0); } }
  @keyframes ggBoardFlyA { 0% { transform: scale(2.7) translateY(16.5%) translateX(16.2%); }
    14% { transform: scale(2.7) translateY(16.5%) translateX(16.2%); }
    62% { transform: scale(2.7) translateY(16.5%) translateX(-16.2%); }
    82% { transform: scale(1.55) translateY(5%) translateX(-3%); }
    100% { transform: scale(1) translateY(0) translateX(0); } }
  @keyframes ggBoardFlyB { 0% { transform: scale(2.7) translateY(16.5%) translateX(-16.2%); }
    14% { transform: scale(2.7) translateY(16.5%) translateX(-16.2%); }
    62% { transform: scale(2.7) translateY(16.5%) translateX(16.2%); }
    82% { transform: scale(1.55) translateY(5%) translateX(3%); }
    100% { transform: scale(1) translateY(0) translateX(0); } }
  @keyframes ggBoardFlyC { 0% { transform: scale(2.2) translateY(-19%) translateX(-8%); }
    16% { transform: scale(2.2) translateY(-19%) translateX(6%); }
    30% { transform: scale(2.7) translateY(16.5%) translateX(16.2%); }
    72% { transform: scale(2.7) translateY(16.5%) translateX(-16.2%); }
    86% { transform: scale(1.5) translateY(4%) translateX(0); }
    100% { transform: scale(1) translateY(0) translateX(0); } }
  @keyframes ggAbilityGlow { 0%, 100% { box-shadow: 0 0 10px rgba(240,206,122,.22); }
    50% { box-shadow: 0 0 22px rgba(240,206,122,.5); } }
  @keyframes ggUpPulse { 0%, 100% { box-shadow: 0 0 10px rgba(124,58,237,.4), 0 0 22px rgba(124,58,237,.18), inset 0 0 10px rgba(124,58,237,.12); }
    50% { box-shadow: 0 0 18px rgba(139,92,246,.65), 0 0 34px rgba(124,58,237,.3), inset 0 0 14px rgba(124,58,237,.2); } }
  @keyframes ggNewPulse { 0%, 100% { box-shadow: inset 0 0 0 2px rgba(240,206,122,.25), 0 0 10px rgba(240,206,122,.15); }
    50% { box-shadow: inset 0 0 0 4.5px rgba(246,233,164,.95), 0 0 30px rgba(240,206,122,.8); } }
  /* v1.0.63: das Atmen der freien Setzfelder. Stein, kein Gold - hier wird
     gebaut, nicht geschlagen; der Puls ist entsprechend flach. */
  @keyframes ggSetzPuls { 0%, 100% { box-shadow: inset 0 0 0 2px rgba(214,203,178,.55), 0 0 8px rgba(214,203,178,.16); }
    50% { box-shadow: inset 0 0 0 3px rgba(238,231,212,.95), 0 0 16px rgba(214,203,178,.42); } }
  @keyframes ggSmokeUp { 0% { transform: translateX(-50%) translateY(6%) scaleY(.92); opacity: .45 }
    50% { transform: translateX(-47%) translateY(-6%) scaleY(1.04); opacity: .8 }
    100% { transform: translateX(-50%) translateY(-14%) scaleY(1.1); opacity: .35 } }
  @keyframes ggFogR { from { transform: translateX(5%) } to { transform: translateX(-6%) } }
  @keyframes ggFogR2 { from { transform: translateX(7%) translateY(1.5%) } to { transform: translateX(-4%) translateY(-1%) } }
  /* drifting clouds over the map's head: layers crossing at different speeds,
     travelling FAR across the sky so blue/sun/dusk keeps opening up between them */
  @keyframes ggCloudA { 0% { transform: translate(-48%, 3%) scale(1.16); }
    50% { transform: translate(4%, -5%) scale(1.34); }
    100% { transform: translate(46%, 4%) scale(1.18); } }
  @keyframes ggCloudB { 0% { transform: translate(44%, -3%) scale(1.32); }
    50% { transform: translate(-10%, 6%) scale(1.14); }
    100% { transform: translate(-46%, -2%) scale(1.3); } }
  @keyframes ggCloudC { 0% { transform: translate(28%, 2%) scale(1.22); }
    100% { transform: translate(-34%, -4%) scale(1.46); } }
  @keyframes ggCloudD { 0% { transform: translate(-38%, -2%) scale(1.2); }
    50% { transform: translate(14%, 5%) scale(1.3); }
    100% { transform: translate(40%, -3%) scale(1.16); } }
  @keyframes ggCloudBreath { 0%,100% { opacity: .58; } 50% { opacity: 1; } }
  @keyframes ggFogA { from { transform: translate(-3.5%, -1.5%) } to { transform: translate(3.5%, 1.5%) } }
  @keyframes ggFogB { from { transform: translate(3%, 1.8%) } to { transform: translate(-3%, -1.8%) } }
  @keyframes ggSweep { from { transform: translate(var(--sx0), var(--sy0)); } to { transform: translate(var(--sx1), var(--sy1)); } }
  @keyframes ggRedeem { from { filter: hue-rotate(185deg) saturate(.5) brightness(.9) drop-shadow(0 3px 6px rgba(0,0,0,.5)); } to { filter: hue-rotate(0deg) saturate(1) brightness(1) drop-shadow(0 3px 6px rgba(0,0,0,.5)); } }
  @keyframes bossFlee { 0% { transform: translateX(-50%) rotate(0deg); opacity: 1; } 18% { transform: translateX(calc(-50% + 14px)) rotate(9deg); opacity: 1; } 100% { transform: translateX(calc(-50% + 340px)) rotate(6deg); opacity: 0; } }
  @keyframes ctaPop { from { opacity: 0; transform: translate(-50%,4px) scale(.92); } to { opacity: 1; transform: translate(-50%,0) scale(1); } }
  @keyframes queuePulse { 0%,100% { transform: scale(1); opacity: .55; } 50% { transform: scale(1.18); opacity: .18; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes arrowFade { 0% { opacity: 0; } 12% { opacity: 1; } 60% { opacity: 1; } 100% { opacity: 0; } }
  /* a plain stride LEANS into the direction of travel mid-way and settles back
     upright on arrival — so the ghost's final frame is IDENTICAL to the real
     piece and the handoff is invisible. The shadow breathes in and out with it. */
  @keyframes ggLean {
    0%   { transform: rotate(0deg); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
    45%  { transform: rotate(var(--tilt, 0deg)); filter: drop-shadow(0 3px 6px rgba(0,0,0,.5)); }
    100% { transform: rotate(0deg); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); } }
  /* a LEAP is a real hop: spring high, grow toward the eye at the apex, land —
     upright the whole way (no lean), the shadow deepens beneath at the peak. */
  @keyframes ggLeapArc {
    0%   { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
    46%  { transform: translateY(-110%) scale(1.18); filter: drop-shadow(0 16px 12px rgba(0,0,0,.42)); }
    100% { transform: translateY(0) scale(1); filter: drop-shadow(0 0 0 rgba(0,0,0,0)); } }
  /* v1.0.32 (Besitzer: "wenn man nicht beim ersten Mal schlaegt, sollte man
     anders zurueckfliegen"): DER ABGEWEHRTE SCHLAG. Bisher lief die Figur
     symmetrisch hin und zurueck - weich, gleichmaessig, ohne Widerstand. Das
     sah aus wie ein Zug, der es sich anders ueberlegt hat, nicht wie ein
     Schlag, der abprallt.
     Jetzt hat die Bewegung drei Teile, die man einzeln spuert:
       1. ein SCHNELLER Vorstoss (bis 24 %),
       2. der AUFPRALL - die Figur staucht sich an ihrem Ziel (28 %),
       3. das ZURUECKSCHLEUDERN ueber den eigenen Stand hinaus (52 %),
          danach pendelt sie in zwei kleiner werdenden Schwingungen aus.
     Das Stauchen laeuft quer zur Stossrichtung, deshalb reicht ein
     gemeinsames scale - der Koerper gibt nach, der Fuss bleibt. */
  @keyframes ggBounce {
    0%   { transform: translate(0,0) scale(1); }
    24%  { transform: translate(var(--bx, 0), var(--by, 0)) scale(1.05); animation-timing-function: cubic-bezier(.9,0,1,.6); }
    28%  { transform: translate(calc(var(--bx, 0) * .94), calc(var(--by, 0) * .94)) scale(1.14, .88); }
    52%  { transform: translate(calc(var(--bx, 0) * -.34), calc(var(--by, 0) * -.34)) scale(.96, 1.05); }
    72%  { transform: translate(calc(var(--bx, 0) * .12), calc(var(--by, 0) * .12)) scale(1.01, .99); }
    88%  { transform: translate(calc(var(--bx, 0) * -.04), calc(var(--by, 0) * -.04)) scale(1); }
    100% { transform: translate(0,0) scale(1); } }
  @keyframes herePulse { 0%,100% { box-shadow: 0 0 0 3px #c9a45c66, 0 0 0 7px #c9a45c22; } 50% { box-shadow: 0 0 0 5px #c9a45c88, 0 0 0 11px #c9a45c1c; } }
  .gg-quill { font-family: ${T.quill}; font-style: italic; font-weight: 500; }
  /* Der Glanz lief bisher mit ease-in-out — und bremste damit AB, WÄHREND das
     Band noch im Bild war: es sah aus, als bliebe der Schimmer bei zwei
     Dritteln stehen und löste sich dort auf. Der Lauf ist jetzt gleichförmig
     (linear auf dem Sweep-Abschnitt, per-Keyframe gesetzt und damit stärker
     als das ease-in-out am Element), und er reicht mit 360% sicher über die
     rechte Kante hinaus. Danach ruht das Band bis zum nächsten Durchgang. */
  @keyframes ggShine { 0% { transform: translateX(-170%) skewX(-18deg); animation-timing-function: linear; } 13% { transform: translateX(360%) skewX(-18deg); } 100% { transform: translateX(360%) skewX(-18deg); } }
  @keyframes ggPulse { 0%,100% { opacity: .35; transform: scale(1); } 50% { opacity: .9; transform: scale(1.12); } }
  @keyframes splashRule { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  @keyframes ggEdgeSweep { 0% { background-position: 230% 0; } 60%, 100% { background-position: -130% 0; } }
  @keyframes splashOut { to { opacity: 0; visibility: hidden; } }

  /* ── v1.0.67: DIE ANIMATIONEN DES SPIELS (Register in anim.js) ──────────
     Alles hier arbeitet NUR mit transform und opacity - die beiden Kanaele,
     die der Grafikkern ohne Neuaufbau der Seite bewegt. Die Ruckel-Lehre aus
     v1.0.37/41 gilt: kein width/height, kein box-shadow im Takt. */
  @keyframes ggAtmen { 0%,100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-1.1%) rotate(.25deg); } }
  @keyframes ggStoss { 0% { transform: translate(0,0); } 45% { transform: translate(var(--sx,0), var(--sy,-7%)); } 100% { transform: translate(0,0); } }
  @keyframes ggKlinge { 0% { opacity: 0; transform: rotate(-38deg) scale(.4); }
    22% { opacity: 1; } 60% { opacity: .85; transform: rotate(24deg) scale(1.06); }
    100% { opacity: 0; transform: rotate(34deg) scale(1.12); } }
  @keyframes ggWucht { 0%,100% { transform: translate(0,0); } 20% { transform: translate(-3.5%,1.5%); }
    40% { transform: translate(3%,-1%); } 60% { transform: translate(-2%,1%); } 80% { transform: translate(1.5%,-.5%); } }
  @keyframes ggBann { 0% { opacity: 0; transform: scaleY(.2); } 30% { opacity: .95; transform: scaleY(1.05); }
    100% { opacity: 0; transform: scaleY(1.25); } }
  @keyframes ggFeuer { 0% { opacity: 0; transform: scaleX(.15); } 25% { opacity: .95; }
    70% { opacity: .8; transform: scaleX(1); } 100% { opacity: 0; transform: scaleX(1.04); } }
  @keyframes ggFunken { 0% { opacity: .95; transform: scale(.3) rotate(0deg); }
    70% { opacity: .55; } 100% { opacity: 0; transform: scale(1.45) rotate(18deg); } }
  @keyframes ggZielGlut { 0% { opacity: 0; transform: scale(.5); } 30% { opacity: .8; }
    100% { opacity: 0; transform: scale(1.6); } }
  @keyframes ggSchachPuls { 0%,100% { opacity: .25; transform: scale(.94); } 50% { opacity: .8; transform: scale(1.04); } }
  /* v1.0.74 (Besitzer: "dass er halt einfach dann so wirklich da liegt und
     umfaellt"): DER KOENIG BLEIBT LIEGEN. Bis v1.0.73 verblasste er am Ende
     auf opacity 0 - er kippte und loeste sich auf, statt zu liegen. Jetzt
     faellt er schwer (kurzes Ueberkippen bei 62 %, dann ein kleiner
     Rueckpraller wie echtes Holz) und BLEIBT bei 92 Grad auf dem Brett -
     volle Deckkraft, kein Verschwinden. Der Fall dauert laenger (Traegheit
     eines schweren Stuecks) und beginnt langsam. */
  @keyframes ggKoenigFall {
    0% { transform: rotate(0deg) translate(0, 0); }
    18% { transform: rotate(9deg) translate(1%, 0); }
    62% { transform: rotate(88deg) translate(15%, 8%); }
    74% { transform: rotate(80deg) translate(14%, 7%); }
    86% { transform: rotate(94deg) translate(16%, 9%); }
    100% { transform: rotate(92deg) translate(16%, 9%); } }
  @keyframes ggStufenStern { 0% { opacity: 0; transform: scale(.2) rotate(0deg); }
    30% { opacity: 1; transform: scale(1.15) rotate(18deg); }
    100% { opacity: 0; transform: scale(1.7) rotate(40deg); } }
  @keyframes ggMuenzFall { 0% { opacity: 0; transform: translateY(-260%) rotateY(0deg); }
    18% { opacity: 1; } 78% { opacity: 1; }
    100% { opacity: 0; transform: translateY(40%) rotateY(720deg); } }
  @keyframes ggMuenzDreh { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
  @keyframes ggAuftritt { 0% { opacity: 0; transform: translateY(9px) scale(.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes ggGlanzLauf { 0% { transform: translateX(-160%) skewX(-16deg); opacity: 0; }
    12% { opacity: .9; } 55% { transform: translateX(240%) skewX(-16deg); opacity: .9; }
    100% { transform: translateX(240%) skewX(-16deg); opacity: 0; } }
  /* v1.0.70: Trank, Sanduhr, Faehigkeit - weiter nur transform+opacity. */
  @keyframes ggTrankLauf { 0% { transform: translateY(115%); opacity: 0; }
    14% { opacity: .95; } 82% { opacity: .9; }
    100% { transform: translateY(-115%); opacity: 0; } }
  @keyframes ggUhrPuls { 0%, 100% { transform: scale(1); opacity: 0; }
    12% { opacity: .9; } 50% { transform: scale(1.55); opacity: .35; }
    88% { opacity: .9; } }
  /* v1.0.74: das ZIELFELD atmet. Sehr ruhig (2,4 s), sehr flach - nur die
     Deckkraft wandert, kein Layout, keine Groesse. Der Besitzer ausdruecklich:
     "sehr langsam, darf nicht stoeren". */
  /* v1.0.75: die AUFSTIEGSFEIER. Der Strahlenkranz dreht sich langsam und
     verglueht, die Karte steigt mit leichtem Ueberschwung auf. transform und
     opacity, sonst nichts. */
  @keyframes ggFeierKranz { 0% { opacity: 0; transform: scale(.4) rotate(0deg); }
    22% { opacity: .95; } 100% { opacity: 0; transform: scale(1.9) rotate(140deg); } }
  @keyframes ggFeierKarte { 0% { opacity: 0; transform: translateY(16px) scale(.9); }
    62% { opacity: 1; transform: translateY(-4px) scale(1.03); }
    100% { opacity: 1; transform: translateY(0) scale(1); } }
  /* v1.0.79: der Ueberschwung bleibt UNTER 1.0 in der Hoehe - er wuchs
     vorher auf 1.12 und schob das Bild aus seinem Kasten in den Text. */
  @keyframes ggFeierBild { 0% { opacity: 0; transform: scale(.62) rotate(-6deg); }
    55% { opacity: 1; transform: scale(1.0) rotate(2deg); }
    100% { opacity: 1; transform: scale(.98) rotate(0deg); } }
  /* v1.0.87: der Erfolgsstern im Stationsfenster - glaenzt und atmet.
     Nur transform und opacity. */
  /* v1.1.2 (Besitzeridee): DIE PERLE LOEST SICH AUF. In dem Moment, wo der
     Zauber wirkt, strahlt die Kugel kurz auf und ist dann fort - erst danach
     zieht die Figur. Nur transform und opacity, wie es die Hausregel fuer
     Keyframes verlangt. */
  /* v1.1.4 (Besitzeridee): DER MUENZREGEN AN DER LEISTE. "Wichtig ist auch,
     dass wir bei der Schatzkammer unten in der Menueleiste anzeigen, falls man
     eine Belohnung bekommen hat - und das darf gerne auch in so einer
     Animation aufpoppen, in Form von kleinen Goldmuenzen, die da runterrasseln."
     Drei Muenzen fallen versetzt, der Zaehler poppt einmal auf. Nur transform
     und opacity. */
  @keyframes ggMuenzeFaellt {
    0%   { transform: translateY(-11px) scale(.6) rotate(-18deg); opacity: 0; }
    22%  { transform: translateY(-4px)  scale(1)  rotate(-6deg);  opacity: 1; }
    66%  { transform: translateY(4px)   scale(1)  rotate(8deg);   opacity: 1; }
    100% { transform: translateY(13px)  scale(.72) rotate(16deg); opacity: 0; }
  }
  @keyframes ggBeutelPop {
    0%   { transform: scale(.4); opacity: 0; }
    48%  { transform: scale(1.28); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes ggPerleLoest {
    0%   { transform: scale(1);    opacity: 1; }
    32%  { transform: scale(1.85); opacity: 1; }
    58%  { transform: scale(2.3);  opacity: .55; }
    100% { transform: scale(2.9);  opacity: 0; }
  }
  @keyframes ggErfolgStern { 0%, 100% { transform: scale(1) rotate(0deg); opacity: .92; }
    50% { transform: scale(1.22) rotate(12deg); opacity: 1; } }
  @keyframes ggZielAtem { 0%, 100% { opacity: .82; } 50% { opacity: 1; } }
  @keyframes ggSprossePuls { 0%, 100% { transform: scale(1); opacity: 1; }
    25% { transform: scale(1.025); opacity: .82; }
    50% { transform: scale(1); opacity: 1; }
    75% { transform: scale(1.02); opacity: .86; } }
`;