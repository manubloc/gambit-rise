// GAMBIT brand — the animated launch splash (golden king in a ring,
// flanked by a warrior and a knight over a perspective board) and the serif
// wordmark used in the app header, both vectorized after the official sheets.
import { useEffect, useState } from "react";
import { T } from "./theme.js";
import { logoMenuArt } from "./livery.js";
import { PieceArt } from "./board/PieceArt.jsx";

const GOLD = "#c9a45c", GOLD_HI = "#e3c07a", GOLD_DK = "#a8863f", NAVY = "#000";
import introUrl from "./assets/intro-riss.webp";

// ── the ring emblem ──────────────────────────────────────────────────────────
export function Emblem({ size = 250, animate = true }) {
  const a = (name, dur, delay) => animate ? { animation: `${name} ${dur}s cubic-bezier(.2,.7,.2,1) ${delay}s both` } : {};
  return (
    <svg viewBox="0 0 220 200" width={size} height={size * 200 / 220} style={{ display: "block", overflow: "visible" }}>
      {/* ring */}
      <g style={a("splashRing", 0.9, 0.05)}>
        <circle cx="110" cy="92" r="72" fill="none" stroke={GOLD} strokeWidth="2.6"
          strokeDasharray="358 95" strokeDashoffset="-134" strokeLinecap="round" />
      </g>
      {/* perspective board — edges converge on a shared vanishing line */}
      <g style={a("splashSide", 0.8, 0.55)}>
        {(() => {
          const rows = [133, 144.5, 158];                 // three horizontals → two ranks
          const half = (y) => 40 + (y - rows[0]) * (66 - 40) / (rows[2] - rows[0]);
          const X = (y, f) => 110 + (f * 2 - 1) * half(y); // f ∈ [0..1] across the board
          const cells = [];
          for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) continue;
            const yT = rows[r], yB = rows[r + 1], f0 = c / 8, f1 = (c + 1) / 8;
            cells.push(<path key={r + "-" + c} fill={GOLD_DK} opacity={0.6 - r * 0.16}
              d={`M${X(yT, f0).toFixed(1)} ${yT} L${X(yT, f1).toFixed(1)} ${yT} L${X(yB, f1).toFixed(1)} ${yB} L${X(yB, f0).toFixed(1)} ${yB} Z`} />);
          }
          const frame = `M${X(rows[0], 0).toFixed(1)} ${rows[0]} L${X(rows[0], 1).toFixed(1)} ${rows[0]} L${X(rows[2], 1).toFixed(1)} ${rows[2]} L${X(rows[2], 0).toFixed(1)} ${rows[2]} Z`;
          return <>{cells}<path d={frame} fill="none" stroke={GOLD_DK} strokeWidth="1.3" opacity=".75" />
            <path d={`M${X(rows[1], 0).toFixed(1)} ${rows[1]} L${X(rows[1], 1).toFixed(1)} ${rows[1]}`} stroke={GOLD_DK} strokeWidth="0.8" opacity=".5" /></>;
        })()}
      </g>
      {/* the three figures — the actual in-game silhouettes, scaled up */}
      <g style={a("splashSide", 0.8, 0.5)}>
        <svg x="30" y="74" width="58" height="58" viewBox="0 0 48 46">{PieceArt({ kind: "P", fill: GOLD_DK, rim: null, detail: "#6b5426", level: 1 }).props.children}</svg>
      </g>
      <g style={a("splashSide", 0.8, 0.62)}>
        <svg x="126" y="64" width="70" height="70" viewBox="0 0 48 46">{PieceArt({ kind: "N", fill: GOLD_DK, rim: null, detail: "#6b5426", level: 1 }).props.children}</svg>
      </g>
      <g style={a("splashPiece", 0.95, 0.28)}>
        <svg x="64" y="38" width="94" height="94" viewBox="0 0 48 46">{PieceArt({ kind: "K", fill: GOLD, rim: GOLD_HI, detail: "#6b5426", level: 1 }).props.children}</svg>
      </g>

    </svg>
  );
}

// ── wordmark ─────────────────────────────────────────────────────────────────
export function Wordmark({ scale = 1, animate = false }) {
  const a = (name, dur, delay) => animate ? { animation: `${name} ${dur}s ease ${delay}s both` } : {};
  return (
    <div className="gg-display" style={{ color: GOLD, lineHeight: 1, userSelect: "none" }}>
      <div style={{ fontSize: 13 * scale, letterSpacing: ".42em", textIndent: ".42em", textAlign: "center",
        color: GOLD_HI, ...a("splashText", 0.9, 0.75) }}>GRAND</div>
      <div style={{ fontSize: 26 * scale, letterSpacing: ".18em", textIndent: ".18em", textAlign: "center",
        fontWeight: 600, marginTop: 2 * scale, ...a("splashText", 0.9, 0.85) }}>GAMBIT</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 * scale, marginTop: 5 * scale, ...a("splashRule", 0.7, 1.1) }}>
        <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD})` }} />
        <span style={{ width: 5 * scale, height: 5 * scale, background: GOLD, transform: "rotate(45deg)" }} />
        <span style={{ flex: 1, height: 1, background: `linear-gradient(270deg, transparent, ${GOLD})` }} />
      </div>
    </div>
  );
}

// ── launch splash ────────────────────────────────────────────────────────────
export function Splash({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2450);
    const t2 = setTimeout(onDone, 2950);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div onClick={onDone} style={{ position: "fixed", inset: 0, zIndex: 99, background: "#000",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
      cursor: "pointer", overflow: "hidden", ...(out ? { animation: "splashOut .5s ease both" } : {}) }}>
      {/* Der Riss oeffnet sich: das Introbild fuellt den Schirm, seine Raender
          verlaufen ins Schwarz der App, damit kein Kasten entsteht. Darueber
          steht die Wortmarke. */}
      <img src={introUrl} alt="" draggable={false} style={{ position: "absolute", inset: 0,
        width: "100%", height: "100%", objectFit: "cover", opacity: 0.92,
        animation: "ggRiftOpen 2.6s ease-out both",
        WebkitMaskImage: "radial-gradient(ellipse 82% 76% at 50% 52%, #000 46%, rgba(0,0,0,.55) 72%, transparent 96%)",
        maskImage: "radial-gradient(ellipse 82% 76% at 50% 52%, #000 46%, rgba(0,0,0,.55) 72%, transparent 96%)" }} />
      <img src={logoMenuArt()} alt="Gambit" style={{ width: min(0.72), display: "block",
        position: "relative", marginTop: "42vh", filter: "drop-shadow(0 4px 18px rgba(0,0,0,.9))" }} />
    </div>
  );
}
const min = (f) => Math.round(Math.min(typeof window !== "undefined" ? window.innerWidth : 380, 460) * f);
