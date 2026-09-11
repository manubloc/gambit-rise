import { T, GOLD_CTA } from "./theme.js";


export function Button({ variant = "primary", disabled, style, children, ...p }) {
  // DS1: Beruehrziel mindestens T.touch hoch; disabled ist EIN Zustand fuer
  // alle - gedimmt (T.disOpacity), ohne Glow, ohne Zeiger. Uebergaenge laufen
  // auf der Hausuhr (T.mo), nicht auf verstreuten Literalen.
  /* v1.0.16 (Besitzer, GLOBALE KNOPFREGEL): "Buttons muessen nicht zweizeilig
     sein, und der Text darf nie verschwinden - lieber in der Breite wachsen."
     Drei Regeln, hier EINMAL gesetzt statt an hundert Aufrufstellen:
       1. minWidth: "min-content" - der Knopf ist NIE schmaler als sein
          laengstes Wort samt Polster. Genau das fehlte: im Karten-Popup
          teilte er sich die Zeile mit einem Text, wurde zu schmal und schnitt
          seine Schrift ab ("Abgeschlosse").
       2. Umbruch statt Abschneiden - bricht das Wort doch, dann mit
          Silbentrennung, und die Zeilenhoehe traegt zwei Zeilen sauber.
       3. Das Polster links und rechts (16 px) bleibt in jedem Fall stehen;
          es ist Teil der min-content-Breite, kann also nicht aufgezehrt
          werden. Wichtig fuer Uebersetzungen: englische und deutsche
          Beschriftungen sind selten gleich lang. */
  const base = { border: "none", borderRadius: T.radiusSm, padding: "12px 16px", minHeight: T.touch,
    fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: disabled ? "default" : "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    minWidth: "min-content", maxWidth: "100%", boxSizing: "border-box",
    whiteSpace: "normal", lineHeight: 1.25, overflowWrap: "break-word",
    hyphens: "auto", WebkitHyphens: "auto", textAlign: "center",
    opacity: disabled ? T.disOpacity : 1, transition: `filter ${T.mo.fast} ${T.mo.ease}`, WebkitTapHighlightColor: "transparent" };
  const variants = {
    // clean gold for the CTA, quiet dark for the rest — the marble wash is gone
    primary: { background: GOLD_CTA,
      color: T.limeInk, border: "1px solid rgba(255,240,200,.5)", boxShadow: "0 2px 12px rgba(212,175,55,.28)" },
    // Sekundaer nach Vorlage: duenne goldene Kontur statt grauer Linie
    ghost: { background: "transparent", color: T.text, border: "1px solid rgba(212,175,55,.4)" },
    danger: { background: "transparent", color: T.danger, border: `1px solid ${T.danger}55` },
    // DER RISS: fuer alles, was aus ihm kommt - Herausforderungen, Bestien,
    // Freischaltungen. Weisse Schrift, weil dunkle auf Violett nur 4,42:1
    // erreicht, weisse dagegen 5,70:1.
    rift: { background: `linear-gradient(160deg, ${T.rift}, ${T.riftDeep})`,
      color: T.riftInk, border: `1px solid ${T.riftLine}`, boxShadow: `0 0 14px ${T.riftGlow}` },
    // ruhiger dunkler Knopf: EINE duenne Linie, kein zweiter Rahmen darunter
    subtle: { background: `linear-gradient(172deg, ${T.panel2}, ${T.panel})`,
      color: T.text, border: `1px solid ${T.line}` },
  };
  const v = { ...variants[variant] };
  if (disabled) delete v.boxShadow; // kein Schein an totem Griff
  return <button disabled={disabled} style={{ ...base, ...v, ...style }} {...p}>{children}</button>;
}

/** Jeder Bereich traegt denselben sanften blauen Verlauf: oben in der Mitte
 *  am hellsten, nach unten und aussen ruhig auslaufend - so wie die
 *  Schatzkammer. Eine duenne Linie fasst ihn, kein plastischer Rahmen. */
export const PANEL_WASH = () =>
  `radial-gradient(125% 135% at 50% -10%, ${T.panel2} 0%, ${T.panel} 52%, ${T.bg2} 100%)`;
/** Fuer Flaechen, die dem Riss gehoeren: derselbe Verlauf, aber der Schimmer
 *  oben ist das violette Licht selbst. */
export const RIFT_WASH = () =>
  `radial-gradient(125% 140% at 50% -12%, rgba(124,58,237,.34) 0%, rgba(91,33,182,.16) 46%, ${T.bg} 100%)`;
export function Panel({ style, children, ...p }) {
  return <div style={{ background: PANEL_WASH(), border: `1px solid ${T.line}`, borderRadius: T.radius, padding: 16, ...style }} {...p}>{children}</div>;
}

/** The one panel headline: serif, gold, led by the brand diamond — so every
 *  screen speaks in the campaign's voice instead of bold sans shouting. */
export function PanelTitle({ children, tag, style }) {
  // Auf schmalen Schirmen darf die Zeile NIE breiter als ihr Panel werden:
  // der Titel schrumpft mit Auslassungspunkten, das Abzeichen bleibt stehen.
  /* v1.0.14 (Besitzer): LUFT UNTER DEM TITEL. Ueberschrift und der Kasten
     darunter klebten aneinander; 9 px Grundabstand trennen sie, ohne dass
     jede Aufrufstelle einzeln nachgebessert werden muss. Wer es enger
     braucht, ueberschreibt marginBottom weiterhin per style. */
  return <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0, maxWidth: "100%",
    marginBottom: 9, ...style }}>
    <span aria-hidden style={{ width: 5, height: 5, background: T.gold, transform: "rotate(45deg)", flex: "0 0 auto" }} />
    <span className="gg-serif" style={{ fontSize: 15.5, letterSpacing: ".07em", color: T.goldBright,
      minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{children}</span>
    {tag && <span style={{ color: T.gold, fontSize: 11, fontWeight: 800, flex: "0 0 auto" }}>· {tag}</span>}
  </div>;
}

/** The one field caption: a quiet serif eyebrow — used above every picker
 *  (map, mode, opponent, difficulty) across the whole app. */
export function FieldLabel({ children, style }) {
  return <div className="gg-serif" style={{ fontSize: 11.5, letterSpacing: ".14em", color: T.dim,
    textTransform: "uppercase", margin: "0 2px 6px", ...style }}>{children}</div>;
}

/** The one map chip: a rectangular card with the board swatch — same shape,
 *  same gold, in quick play and in the court's formation editor. */
/* ── DIE KARTENMINIATUR (v1.0.87, Besitzer: "pro Karte eine kleine
   Visualisierung") ─────────────────────────────────────────────────────────
   Zeichnet das ECHTE Brett: w x h Felder in den Farben der Karte, Loecher
   ausgespart. Ein 6x6 sieht anders aus als ein 10x10, ein Hof mit vier
   Loechern in der Mitte anders als ein Spiessrutenlauf. */
export function MapMini({ w = 8, h = 8, holes = [], theme, on = false, size = 44 }) {
  const loch = new Set((holes || []).map(([f, r]) => r * w + f));
  const cell = Math.max(2, Math.floor(size / Math.max(w, h)));
  return <span aria-hidden style={{ display: "inline-grid", gridTemplateColumns: `repeat(${w}, ${cell}px)`,
    gridAutoRows: `${cell}px`, borderRadius: 4, overflow: "hidden", flex: "0 0 auto",
    border: `1px solid ${on ? T.selLine + "aa" : T.line}`, boxShadow: on ? `0 0 8px ${T.selGlow}` : "none" }}>
    {Array.from({ length: w * h }).map((_, k) => {
      const f = k % w, r = Math.floor(k / w);
      const hole = loch.has(k);
      return <span key={k} style={{ width: cell, height: cell,
        background: hole ? "transparent" : ((f + r) % 2 === 0 ? theme.sqLight : theme.sqDark),
        outline: hole ? `1px dashed ${T.line}` : "none", outlineOffset: -1 }} />;
    })}
  </span>;
}

export function MapChip({ on, locked, theme, label, onClick, title, mini = null, stapel = false }) {
  /* v1.0.87: mit `mini` (ein MapMini) und `stapel` steht die Miniatur ueber
     dem Namen - fuer das Raster ohne Scrollbalken in der Aufstellung. */
  if (stapel) return <button onClick={onClick} title={title}
    style={{ cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11, borderRadius: 10,
      padding: "8px 4px 6px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      border: on ? `1px solid ${T.selLine}` : `1px solid ${T.line}`,
      background: on ? `linear-gradient(165deg, ${T.sel}, #1a1030)` : T.panel2,
      boxShadow: on ? `0 0 10px ${T.selGlow}` : "none",
      transition: `background ${T.mo.norm} ${T.mo.ease}`,
      color: on ? T.selInk : locked ? T.faint : T.text, opacity: locked ? T.disOpacity + 0.1 : 1 }}>
    {mini}
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, lineHeight: 1.15, textAlign: "center" }}>{label}</span>
  </button>;
  return <button onClick={onClick} title={title}
    style={{ cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12.5, borderRadius: 10,
      padding: "8px 11px", whiteSpace: "nowrap", flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 8,
      border: on ? `1px solid ${T.selLine}` : `1px solid ${T.line}`,
      background: on ? `linear-gradient(165deg, ${T.sel}, #1a1030)` : T.panel2,
      boxShadow: on ? `0 0 10px ${T.selGlow}` : "none", minHeight: Math.max(36, T.touch - 8),
      transition: `background ${T.mo.norm} ${T.mo.ease}`,
      color: on ? T.selInk : locked ? T.faint : T.text, opacity: locked ? T.disOpacity + 0.1 : 1 }}>
    <span aria-hidden style={{ display: "inline-grid", gridTemplateColumns: "repeat(4, 4.5px)", borderRadius: 3,
      overflow: "hidden", flex: "0 0 auto", border: `1px solid ${on ? T.selLine + "66" : T.line}` }}>
      {Array.from({ length: 16 }).map((_, k) => (
        <span key={k} style={{ width: 4.5, height: 4.5,
          background: ((k + Math.floor(k / 4)) % 2 === 0) ? theme.sqLight : theme.sqDark }} />
      ))}
    </span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>{label}</span>
  </button>;
}

export function Bar({ pct = 0, color = T.lime, height = 8, track = "#0009" }) {
  const w = Math.max(0, Math.min(1, pct)) * 100;
  return <div style={{ background: track, borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{ width: w + "%", height: "100%", background: color, borderRadius: 99, transition: `width ${T.mo.fill} ${T.mo.ease}` }} />
  </div>;
}

export function Chip({ children, color = T.dim, bg = T.panel2, style, className }) {
  return <span className={className} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: bg, color, borderRadius: 99, padding: "3px 9px", fontSize: 12, fontWeight: 700, ...style }}>{children}</span>;
}

/** AUSWAHL IST VIOLETT - ENDGUELTIG. Chronik dieser Entscheidung: v0.42
 *  violett (Auftragstext), v0.43 gold (die GPT-Blaetter des Besitzers),
 *  v0.44 wieder violett - der Besitzer hat das Gold LIVE gesehen und
 *  verworfen ("Goldpille in violett geraenderter Schiene - haesslich").
 *  Gewaehlt heisst: tiefe violette Flaeche (T.sel), violette Kontur, helle
 *  Schrift, leiser Schein. Gold gehoert allein den Handlungen (GOLD_CTA).
 *  Bleibt: whiteSpace normal (lange Namen brechen um), Hoehe >= T.touch-8. */
export function Segmented({ options, value, onChange }) {
  return <div role="group" style={{ display: "flex", gap: 4, background: T.bg2, padding: 4, borderRadius: T.radiusSm, border: `1px solid ${T.line}` }}>
    {options.map((o) => {
      const on = value === o.value;
      return <button key={o.value} disabled={o.disabled} aria-pressed={on} onClick={() => !o.disabled && onChange(o.value)} style={{ flex: 1,
        border: on ? `1px solid ${T.selLine}` : "1px solid transparent", borderRadius: 8, padding: "8px 4px",
        /* v1.0.1: Zeichen und Wort stehen nebeneinander - ohne diese Zeile
           haengt der Text an der Oberkante statt in der Mitte. */
        /* v1.0.16: EINE minHeight (die doppelte Angabe war ein Versehen) und
           ein Deckel von ZWEI Zeilen - drei Zeilen in einer Schiene sind nie
           richtig. Passt es dann noch nicht, schrumpft die Schrift eine Spur,
           statt eine dritte Zeile aufzumachen. */
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        minHeight: Math.max(36, T.touch - 8), fontSize: "clamp(11px, 3.1vw, 12.5px)",
        fontWeight: 700, fontFamily: "inherit", minWidth: 0,
        // 320-px-Beweis (pruefe-textfluss): "Aufstellung" ist als EINZELWORT
        // breiter als ein Viertel der Schiene - Umbruch allein rettet nichts.
        // Silbentrennung (lang="de" steht am Dokument) + schmalere Polster.
        cursor: o.disabled ? "default" : "pointer", whiteSpace: "normal", lineHeight: 1.25,
        overflowWrap: "break-word", hyphens: "auto", WebkitHyphens: "auto",
        opacity: o.disabled ? T.disOpacity : 1, position: "relative", overflow: "hidden",
        background: on ? `linear-gradient(165deg, ${T.sel}, #1a1030)` : "transparent",
        boxShadow: on ? `0 0 10px ${T.selGlow}` : "none",
        transition: `background ${T.mo.norm} ${T.mo.ease}, color ${T.mo.norm} ${T.mo.ease}`,
        color: on ? T.selInk : T.dim }}>
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center",
          justifyContent: "center", gap: 5 }}>
          {/* v0.74.1 (Besitzer): Raum-Zeichen im violetten Knopf - es nimmt die
              Knopffarbe an (currentColor), also hell wenn gewaehlt. */}
          {o.icon ? <span style={{ display: "inline-flex", flex: "0 0 auto" }}>{o.icon}</span> : null}
          {o.label}</span>
      </button>;
    })}
  </div>;
}

/** Der Schalter der Vorlage: dunkle Bahn im Aus, violette Bahn mit
 *  cremefarbenem Knauf im An. Beruehrflaeche >= T.touch breit. */
export function Toggle({ on, onChange, label = null, disabled = false }) {
  return <button onClick={() => !disabled && onChange(!on)} aria-pressed={!!on} disabled={disabled}
    style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "none", border: "none",
      cursor: disabled ? "default" : "pointer", fontFamily: "inherit", padding: 4,
      minHeight: T.touch, opacity: disabled ? T.disOpacity : 1 }}>
    <span aria-hidden style={{ width: 46, height: 26, borderRadius: 999, position: "relative", flex: "0 0 auto",
      background: on ? `linear-gradient(90deg, ${T.riftDeep}, ${T.rift})` : "#211d2e",
      border: `1px solid ${on ? T.riftLine : T.line}`,
      boxShadow: on ? `0 0 10px ${T.riftGlow}` : "inset 0 1px 2px rgba(0,0,0,.5)",
      transition: `background ${T.mo.norm} ${T.mo.ease}` }}>
      <span style={{ position: "absolute", top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: "50%",
        background: on ? "#f4e9c8" : "#8d8798", boxShadow: "0 1px 3px rgba(0,0,0,.5)",
        transition: `left ${T.mo.norm} ${T.mo.easeOut}` }} />
    </span>
    {label && <span style={{ fontSize: 13.5, fontWeight: 700, color: T.text }}>{label}</span>}
  </button>;
}

export function Shields({ n, size = 7 }) {
  if (!n) return null;
  return <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
    {Array.from({ length: n }).map((_, i) => <span key={i} style={{ width: size, height: size, borderRadius: "50%", background: T.blue, boxShadow: `0 0 4px ${T.blue}` }} />)}
  </span>;
}

export function Stat({ label, value, color = T.text }) {
  return <div style={{ textAlign: "center" }}>
    <div className="gg-serif" style={{ fontSize: 22, fontWeight: 700, letterSpacing: ".02em", color }}>{value}</div>
    <div style={{ fontSize: 11, color: T.faint, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
  </div>;
}
