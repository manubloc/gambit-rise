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
    <svg viewBox="0 0 620 230" width={breite} style={{ display: "block", overflow: "visible" }}
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
          <stop offset="0%" stopColor="#f6f0ff" /><stop offset="26%" stopColor="#cbb2ff" />
          <stop offset="58%" stopColor="#8b5cf6" /><stop offset="82%" stopColor="#4c1d95" />
          <stop offset="100%" stopColor="#1a0b33" />
        </linearGradient>
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

      {/* v1.54.0 (Besitzer): "das Rise kleiner und nach rechts unten - wenn
          man das Gambit mittig ausrichtet, das Rise leicht rechts versetzt
          unten ... beim Ladescreen nicht zeichnen, sondern wie ein Blitz:
          ein Aufleuchten des ganzen Begriffes, nur sehr schnell, kurz, hell."
          Rise steht jetzt kleiner unter der rechten Haelfte von GAMBIT und
          ragt mit den Oberlaengen leicht hinein. Mit `blitz` flammt es beim
          Erscheinen zweimal kurz weiss auf - kein Nachzeichnen mehr. */}
      <g style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontStyle: "italic", fontWeight: 600, fontSize: 104,
        ...(blitz ? { opacity: 0, animation: `ggRiseBlitz .95s ease-out ${verzug}s forwards` } : null) }}>
        {/* der Schein liegt DARUNTER und ist lila - darueber bleibt der Verlauf sichtbar */}
        <text x="448" y="196" textAnchor="middle" fill="#7c3aed" opacity=".75" filter={`url(#${g("schein")})`}>Rise</text>
        <text x="448" y="196" textAnchor="middle" fill={`url(#${g("lila")})`}>Rise</text>
      </g>
    </svg>
  );
}
