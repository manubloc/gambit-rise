/* ── v1.43.0: DIE WORTMARKE „GAMBIT Rise" ──────────────────────────────────
   Besitzer (23.9.2026): „das Gambit die Buchstaben näher zusammen … das Rise
   sollte evtl. sogar in dem leuchtenden Lila, größer, wie ein Logo … schon
   unter Gambit, aber es darf auch minimal von unten über das Gambit
   überlappen … das Gambit darf auch etwas mehr glänzen und erhaben wirken …
   und das Rise von sehr hell leuchtend lila bis schon fast dunkel. Noch
   cooler wäre, wenn beim Ladescreen das Rise gezeichnet wird, als wäre es
   eine Handschrift."

   Aufbau (ein SVG, damit Ladeschirm und Anmeldeschirm dasselbe zeigen):
     GAMBIT  Cinzel, eng gesperrt (.02em statt .13em), Goldverlauf, darüber
             ein Glanzstreifen und eine dunkle Fußlinie - das gibt die
             erhabene, geprägte Wirkung.
     Rise    Cormorant kursiv, deutlich größer, von sehr hellem Lila über
             Violett bis fast Schwarz, mit Schein. Es sitzt UNTER dem Wort
             und ragt mit seinen Oberlängen leicht darüber.
   BLITZ (seit v1.54.0, statt des frueheren Nachzeichnens): mit `blitz`
   flammt Rise beim Erscheinen zweimal kurz weiss auf, wie ein Blitz. Ohne
   `blitz` steht die Marke sofort fertig da.                                 */
import { useId } from "react";

export function WortmarkeRise({ breite = "min(78vw, 420px)", blitz = false, verzug = 0 }) {
  const id = useId().replace(/:/g, "");
  const g = (n) => `${n}-${id}`;
  return (
    <svg viewBox="0 0 620 250" width={breite} style={{ display: "block", overflow: "visible" }}
      role="img" aria-label="Gambit Rise">
      <defs>
        <linearGradient id={g("gold")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3cf" /><stop offset="38%" stopColor="#f2d98c" />
          <stop offset="62%" stopColor="#d4af37" /><stop offset="100%" stopColor="#8a6a1f" />
        </linearGradient>
        <linearGradient id={g("glanz")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity=".12" />
          <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g("lila")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbf7ff" /><stop offset="30%" stopColor="#d9c6ff" />
          <stop offset="58%" stopColor="#8b5cf6" /><stop offset="82%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1a0b33" />
        </linearGradient>
        <linearGradient id={g("schwung")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c4a8ff" stopOpacity="0" /><stop offset="35%" stopColor="#e9ddff" />
          <stop offset="80%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
        <filter id={g("sternschein")} x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" /></filter>
        <filter id={g("schein")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>

      {/* GAMBIT - eng, golden, mit Glanz und dunkler Fusslinie */}
      <g style={{ fontFamily: "'Cinzel', Georgia, serif", fontWeight: 600, fontSize: 108, letterSpacing: "2" }}>
        <text x="310" y="112" textAnchor="middle" fill="#120b22" opacity=".85" transform="translate(0,3)">GAMBIT</text>
        <text x="310" y="112" textAnchor="middle" fill={`url(#${g("gold")})`}
          style={{ filter: "drop-shadow(0 2px 10px rgba(0,0,0,.8))" }}>GAMBIT</text>
        <text x="310" y="112" textAnchor="middle" fill={`url(#${g("glanz")})`}>GAMBIT</text>
      </g>

      {/* v1.59.0 (Besitzer, mit Vorlagebild): "diese Schrift moeglichst so wie
          in dem Bild positionieren und auch so zeichnen ... leuchtendes Lila,
          vielleicht animiert, so dass es glimmt, und der kleine Stern ueber
          dem e darf leuchten und bitzeln". Rise in einer kalligrafischen
          Schreibschrift (Great Vibes, OFL), rechts unter GAMBIT, mit den
          Oberlaengen im Wort; darunter ein Schwung, ueber dem e ein Stern.
          Aussen der Blitz beim Laden (einmal), innen das Glimmen (immer). */}
      <g style={blitz ? { opacity: 0, animation: `ggRiseBlitz .95s ease-out ${verzug}s forwards` } : undefined}>
        <g style={{ animation: `ggRiseGlimm 3.8s ease-in-out ${blitz ? verzug + 1 : 0}s infinite` }}>
          <g style={{ fontFamily: "'Great Vibes', 'Cormorant Garamond', Georgia, serif", fontWeight: 400, fontSize: 150 }}>
            <text x="452" y="205" textAnchor="middle" fill="#7c3aed" opacity=".8" filter={`url(#${g("schein")})`}>Rise</text>
            <text x="452" y="205" textAnchor="middle" fill={`url(#${g("lila")})`}>Rise</text>
          </g>
          <path d="M 318 214 C 372 240, 470 240, 596 176" fill="none" stroke={`url(#${g("schwung")})`} strokeWidth="3.2" strokeLinecap="round" />
        </g>
        <g transform="translate(560,128)">
          <g style={{ transformOrigin: "0 0", transformBox: "fill-box", animation: "ggSternFunkeln 3.2s ease-in-out infinite" }}>
            <path d="M0,-16 C2,-4 4,-2 16,0 C4,2 2,4 0,16 C-2,4 -4,2 -16,0 C-4,-2 -2,-4 0,-16Z" fill="#fff" filter={`url(#${g("sternschein")})`} />
            <path d="M0,-16 C2,-4 4,-2 16,0 C4,2 2,4 0,16 C-2,4 -4,2 -16,0 C-4,-2 -2,-4 0,-16Z" fill="#fffaf0" />
          </g>
        </g>
      </g>
    </svg>
  );
}
