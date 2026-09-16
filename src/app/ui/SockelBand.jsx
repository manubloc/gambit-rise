/* ── DAS BAND IM SOCKEL (v1.17.0) ────────────────────────────────────────────
   Besitzervorlage ("Integrated Status Display"): das Lebensband gehoert IN
   den Sockel der Figur - ein Ring auf der Vorderseite des Tellers, rot links
   (Leben), dunkel in der Mitte, blau rechts (Staerke), in Goldrand gefasst.
   Dieselbe Anzeige im Hofstaat wie auf dem Brett.

   Die Geometrie kommt aus der Messung (scripts/messe_sockel.py ->
   sockelband.json): fuer jedes Gemaelde die Ellipse der Bodenkante (cx, rx,
   ry), der Boden selbst und die Hoehe des gemalten Farbrings. Das Band wird
   in BILDPIXELN gezeichnet - der SVG liegt mit demselben Kasten und
   derselben Ausrichtung ueber dem Bild, also passt es, ohne je etwas am
   lebenden DOM zu raten.

   Semantik wie beim Lebensrohr: die Fuellung von links ist das Leben, von
   rechts die Staerke, das Dunkle dazwischen ist, was zur Hoechststufe fehlt. */
import MASS from "./board/sockelband.json";

export const bandBekannt = (paintedId) => !!(paintedId && MASS[paintedId]);

/* v1.20.1 (Besitzer: "die Koenigin sitzt im Verhaeltnis zu den anderen nicht
   richtig"): die Gemaelde haben nicht denselben unteren Rand - die Dame
   steht mit dem Boden bei y=567, Koenig, Turm, Laeufer bei 555-557. Auf der
   Kachel sass sie damit 1,9 % tiefer als ihre Nachbarn. Diese Funktion gibt
   die Verschiebung in Prozent der Bildhoehe, die JEDE Figur auf die
   gemeinsame Bodenlinie 555 setzt; Ausreisser (Bosse mit anderem Rahmen)
   werden bei +-6 % gekappt. */
export const BODEN_LINIE = 555;
/* v1.23.0 (Besitzer: "die Figuren sind zum Teil sehr unterschiedlich gross,
   nimm den Sockel als Anhaltspunkt"): der Teller ist das Mass. Gemessen:
   Figuren-Teller von 120 bis 204 px halber Breite (Median 136), Monster von
   92 bis 249 (der Hetzer 249, fast doppelt so breit wie ein Springer). Jede
   Figur wird so skaliert, dass ihr Teller die Zielbreite hat, um den Fuss
   herum (transform-origin unten Mitte); das Band sitzt im selben Kasten und
   wandert mit. Der Drache bleibt gross - er ist es. Gekappt bei 0,55 .. 1,35. */
export const ZIEL_RX = 136;
export function sockelSkalierung(paintedId) {
  const m = paintedId && MASS[paintedId];
  if (!m || paintedId === "dragon") return 1;
  return Math.max(0.55, Math.min(1.35, ZIEL_RX / m.rx));   /* der Hetzer (rx 249) braucht 0,55 */
}

export function bodenAusgleichProzent(paintedId) {
  const m = paintedId && MASS[paintedId];
  if (!m) return 0;
  /* v1.23.0: mit der Skalierung um den Fuss herum liegt die Bodenkante bei
     (H - boden) * k ueber der Unterkante; sie soll bei (H - 555) liegen. */
  const k = sockelSkalierung(paintedId);
  const soll = m.H - BODEN_LINIE, ist = (m.H - m.boden) * k;
  return Math.max(-8, Math.min(8, ((ist - soll) / m.H) * 100));
}

/* Punkte auf dem vorderen Halbbogen der Ellipse, von links (theta = pi)
   nach rechts (theta = 2 pi); y waechst nach unten. */
function bogen(m, hoch, tA, tB, n = 18) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = tA + (tB - tA) * (i / n);
    pts.push([m.cx + m.rx * Math.cos(t), (m.boden - m.ry) - m.ry * Math.sin(t) - hoch]);
  }
  return pts;
}
const P = (pts) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
/* ein Bandsegment zwischen zwei Winkeln: unten hin, oben zurueck */
function segment(m, h, tA, tB) {
  const unten = bogen(m, 0, tA, tB), oben = bogen(m, h, tB, tA);
  return P(unten) + " " + P(oben).replace(/^M/, "L") + " Z";
}

/* ausrichtung: "mitte" fuer die Kachel (objectFit contain, mittig), "unten"
   fuer das Brett (objectPosition center bottom) - der SVG muss genau so
   liegen wie sein Bild. */
export function SockelBand({ paintedId, leben = 0, kraft = 0, grau = false, id = "sb", ausrichtung = "mitte" }) {
  const m = MASS[paintedId];
  if (!m) return null;
  /* Bandhoehe: 17 % der Tellerbreite. Die Vorlage hat 26 px Band auf 180 px
     Teller (14 %), aber ihr Teller ist ein hoher Trommelsockel; unsere
     gemalten Teller sind flacher, der Farbring nur 15-25 px. Bei 14 % las
     sich das Band auf der 117-px-Kachel als Strich (gemessen ~8 px) - bei
     17 % steht es wie in der Vorlage. Das Band deckt den gemalten Ring und
     ein Stueck der Trommel darueber. */
  const h = Math.round(m.rx * 2 * 0.17);
  const rand = Math.max(2, h * 0.13);
  const tL = Math.PI, tR = 2 * Math.PI;
  /* die Anteile laufen ueber den Winkel, nicht ueber x - so bleiben die
     Segmente auf dem Ring gleich lang, egal wie flach die Ellipse steht */
  const a = tL + (tR - tL) * Math.max(0, Math.min(1, leben));
  const b = tR - (tR - tL) * Math.max(0, Math.min(1, kraft));
  const mitteA = Math.min(a, b), mitteB = Math.max(a, b);
  const u = (k) => `${id}-${k}`;
  return <svg viewBox={`0 0 ${m.W} ${m.H}`} preserveAspectRatio={ausrichtung === "unten" ? "xMidYMax meet" : "xMidYMid meet"} aria-hidden data-gg="sockelband"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}>
    <defs>
      {/* Farbe: oben hell, unten tief - eine gewoelbte Lackflaeche */}
      <linearGradient id={u("rot")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ff8a80" /><stop offset=".35" stopColor="#e5322c" /><stop offset="1" stopColor="#7a0e0e" />
      </linearGradient>
      <linearGradient id={u("blau")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8fb4ff" /><stop offset=".35" stopColor="#2d63e6" /><stop offset="1" stopColor="#0d2a7a" />
      </linearGradient>
      <linearGradient id={u("dunkel")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3a3a44" /><stop offset=".4" stopColor="#15151b" /><stop offset="1" stopColor="#050507" />
      </linearGradient>
      <linearGradient id={u("gold")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6e2a6" /><stop offset=".5" stopColor="#c99a45" /><stop offset="1" stopColor="#6e4e1c" />
      </linearGradient>
      {/* Rundung: links und rechts dunkler, weil der Ring dort vom Betrachter wegdreht */}
      <linearGradient id={u("rund")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity=".55" /><stop offset=".2" stopColor="#000" stopOpacity="0" />
        <stop offset=".8" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
      </linearGradient>
      {/* v1.18.0 (Besitzer): EINGELASSEN - ein Schatten von der oberen und
          unteren Fassung ins Band hinein, als saesse es in einer Nut des
          Tellers; der Glanz bleibt, aber unter dem Schatten. */}
      <linearGradient id={u("glanz")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity=".62" /><stop offset=".22" stopColor="#000" stopOpacity=".12" />
        <stop offset=".3" stopColor="#fff" stopOpacity=".22" /><stop offset=".5" stopColor="#fff" stopOpacity=".04" />
        <stop offset=".82" stopColor="#000" stopOpacity=".04" /><stop offset="1" stopColor="#000" stopOpacity=".28" />   {/* v1.22.0 (Besitzer): unten weniger Verlauf ins Dunkle */}
      </linearGradient>
      {grau && <filter id={u("grau")}><feColorMatrix type="saturate" values="0" /></filter>}
    </defs>
    <g filter={grau ? `url(#${u("grau")})` : undefined}>
      {/* Goldrand unten (etwas tiefer als das Band, als Fuss) und oben */}
      <path d={segment(m, h + rand, tL, tR)} fill={`url(#${u("gold")})`} />
      {/* die drei Segmente */}
      {a > tL && <path d={segment(m, h, tL, a)} fill={`url(#${u("rot")})`} />}
      {mitteB > mitteA && <path d={segment(m, h, mitteA, mitteB)} fill={`url(#${u("dunkel")})`} />}
      {b < tR && <path d={segment(m, h, b, tR)} fill={`url(#${u("blau")})`} />}
      {/* Glanz oben, Rundung an den Enden */}
      <path d={segment(m, h, tL, tR)} fill={`url(#${u("glanz")})`} />
      <path d={segment(m, h, tL, tR)} fill={`url(#${u("rund")})`} />
      {/* Goldfassung: Linien oben und unten, Stege an den Nahtstellen */}
      <path d={P(bogen(m, h, tL, tR))} fill="none" stroke={`url(#${u("gold")})`} strokeWidth={rand} />
      <path d={P(bogen(m, rand * 0.5, tL, tR))} fill="none" stroke="#5a3d12" strokeWidth={rand * 0.6} opacity=".7" />
      {/* v1.18.0 (Besitzer): KEINE Stege zwischen Rot, Schwarz und Blau -
          die Farben stossen stumpf aneinander, wie in der Vorlage. */}
    </g>
  </svg>;
}
