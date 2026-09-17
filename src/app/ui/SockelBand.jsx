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

/* v1.23.2 (Besitzer, mit Screenshot): "der Turm muss groesser werden, aber
   nicht der Sockel; der Gambit fast identisch wie der Bauer; der Laeufer
   minimal kleiner; die Dame weiter nach links". Gemessen, nach der
   Tellerskalierung: Turm 461 px hoch, Bauer 561, Laeufer 601, Gambit 603 -
   und die Dame steht mit ihrem Teller 39,5 px rechts der Bildmitte. Der
   Teller ist das Mass fuer die Breite (sockelSkalierung); die FIGUR wird
   zusaetzlich auf die Hoehe des Bauern gezogen, nur senkrecht, vom Fuss aus
   (bis +-20 %, sonst verzerrt es), und jede Figur wird auf ihren Teller
   zentriert. */
export const ZIEL_HOEHE = 561;   // der Bauer, die Vorlage des Besitzers
/* v1.23.9: die Bandhoehe, in Bildschirmpixeln eines unskalierten Bildes -
   46 entspricht genau den 17 % der Tellerbreite, die vorher galten und dem
   Besitzer gefielen, nur jetzt fuer jede Figur gleich. */
export const BAND_HOCH = 46;
export function figurStreckung(paintedId) {
  const m = paintedId && MASS[paintedId];
  if (!m || paintedId === "dragon" || m.oben == null) return 1;
  const h = (m.boden - m.oben) * sockelSkalierung(paintedId);
  return Math.max(0.85, Math.min(1.2, ZIEL_HOEHE / h));
}
export function tellerMitteProzent(paintedId) {
  const m = paintedId && MASS[paintedId];
  if (!m) return 0;
  return -((m.cx - m.W / 2) / m.W) * 100;   // negativ = nach links
}

export function bodenAusgleichProzent(paintedId) {
  const m = paintedId && MASS[paintedId];
  if (!m) return 0;
  /* v1.23.0: mit der Skalierung um den Fuss herum liegt die Bodenkante bei
     (H - boden) * k ueber der Unterkante; sie soll bei (H - 555) liegen. */
  const k = sockelSkalierung(paintedId) * figurStreckung(paintedId);   // v1.23.2: senkrecht zaehlt auch die Streckung
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
/* ein Bandsegment zwischen zwei Hoehen und zwei Winkeln: unten hin, oben
   zurueck. `fuss` ist die untere Hoehe - sie darf NEGATIV sein, dann haengt
   das Band unter der gemalten Bodenkante (siehe unten). */
function segment(m, h, tA, tB, fuss = 0) {
  const unten = bogen(m, fuss, tA, tB), oben = bogen(m, h, tB, tA);
  return P(unten) + " " + P(oben).replace(/^M/, "L") + " Z";
}

/* ausrichtung: "mitte" fuer die Kachel (objectFit contain, mittig), "unten"
   fuer das Brett (objectPosition center bottom) - der SVG muss genau so
   liegen wie sein Bild. */
/* Besitzer: "Schatzkammer, Haendler brauchen natuerlich kein Band - das sind
   ja keine Figuren." Dasselbe gilt fuer die Standarte: ein Banner steht auf
   keinem Teller. */
const OHNE_BAND = new Set(["schatzkammer", "haendler", "standard"]);

export function SockelBand({ paintedId, leben = 0, kraft = 0, grau = false, id = "sb", ausrichtung = "mitte" }) {
  const m = MASS[paintedId];
  if (!m || OHNE_BAND.has(paintedId)) return null;
  /* ── BANDHOEHE: DIE GEMESSENE TELLERHOEHE ────────────────────────────────
     Bis v1.23.7 waren es 17 % der Tellerbreite - eine Zahl, die mit dem
     gemalten Teller nichts zu tun hat. Besitzer: "Mir geht es darum, dass die
     Rundung sauber tangential an der Hinterseite uebereinstimmt."

     Das geht nur, wenn die obere Kante des Bandes AUF der Standflaeche liegt,
     auf der die Figur steht. Die ist jetzt fuer alle 69 Gemaelde gemessen
     (scripts/messe_tellerkante.py) und steht als `teller` in
     sockelband.json. Gemessen wird der KNICK im Breitenverlauf: der Teller
     ist leicht konisch und verliert nach oben langsam an Breite, erst wo der
     Koerper beginnt, faellt sie steil ab.

     GEMESSEN, warum die alte Zahl nicht passen konnte: sie stand im Mittel
     20 px ueber dem gemalten Ring - beim Engineer 11, bei boss-b01 48, bei
     der Schatzkammer 84. Der alte Hilfswert `ring` half nicht: er wird ueber
     die FARBSAETTIGUNG einer einzigen Spalte gesucht und faellt auf grauem
     Stein auf seinen Notnagel 8 zurueck - bei 29 der 69 Figuren.

     Zwei Teller haben keinen eindeutigen Knick und sind von Hand gesetzt
     (`tellerVonHand`): boss-b02 auf 75 und gambit-t2 auf 45. */
  /* ── v1.23.9 (Besitzer): DER SOCKEL WIRD NACH UNTEN VERLAENGERT ──────────
     "Du kannst ihn nach unten immer verlaengern. Wichtig ist nur, dass die
     Oberkante sauber erfasst ist. Dann wuerde ich schon versuchen, allen
     Sockeln nach unten hin die gleiche Hoehe zu geben."

     Die Oberkante bleibt also genau auf der gemessenen Standflaeche
     (`teller`), und das Band waechst von dort NACH UNTEN auf eine
     einheitliche Hoehe - notfalls unter die gemalte Bodenkante hinaus, was
     die negative Fusshoehe erlaubt.

     Einheitlich heisst: 17 % der Tellerbreite. Das ist kein Zufallswert,
     sondern die alte Bandhoehe, die dem Besitzer gefiel - und weil die
     Skalierung jeden Teller auf 136 px Breite zieht, sieht dieselbe Prozent-
     zahl auf JEDER Kachel gleich hoch aus. Ein fester Pixelwert waere das
     nicht: der Teller des Hetzers ist mit rx 249 fast doppelt so breit wie
     der eines Springers.

     GEMESSEN: bei 15 der 66 Figuren mit Band steht die Standflaeche HOEHER
     als dieses Band - aber hoechstens um 6 px (Drache 65 gegen 59, Bauer 49
     gegen 44). Deshalb `max`: das Band reicht immer mindestens bis zur
     Bodenkante, steht aber nie ueber der Standflaeche. */
  /* Besitzer, praeziser: "Du nimmst als Mass IMMER die Oberkante ... und nach
     unten tust du nichts aus dem Bild ablesen, sondern machst einfach eine
     feste Pixelanzahl, sodass jeder gleich hoch ist. Ich moechte nicht, dass
     du die Unterkante des Sockels in irgendeiner Weise zu lesen versuchst,
     sondern eine saubere Parallelverschiebung von der oberen gemessenen
     Kontur nach unten."

     Genau so: die untere Kontur ist dieselbe Ellipse wie die obere, nur um
     BAND_HOCH tiefer. Die gemalte Unterkante wird nicht mehr gelesen - das
     Band darf ruhig darunter hinaushaengen, man sieht es nicht.

     BAND_HOCH ist in BILDSCHIRMpixeln gedacht, nicht in Bildpixeln. Deshalb
     wird es durch die Skalierung geteilt: die Kachel zieht jeden Teller auf
     136 px Breite (sockelSkalierung) und die Figur auf Bauernhoehe
     (figurStreckung). Ohne diese Division waere das Band beim Hetzer (rx 249)
     halb so hoch wie beim Springer - gemessen lagen die Hoehen sonst zwischen
     17,2 und 24,8 px. */
  const kopf = Math.round(m.teller || m.rx * 2 * 0.17);      // Oberkante = gemessene Standflaeche
  const massstab = sockelSkalierung(paintedId) * (ausrichtung === "mitte" ? figurStreckung(paintedId) : 1);
  const hoehe = Math.max(8, Math.round(BAND_HOCH / Math.max(0.2, massstab)));
  const fuss = kopf - hoehe;                                  // Parallelverschiebung nach unten
  const h = kopf;
  const rand = Math.max(2, hoehe * 0.13);
  const tL = Math.PI, tR = 2 * Math.PI;
  /* die Anteile laufen ueber den Winkel, nicht ueber x - so bleiben die
     Segmente auf dem Ring gleich lang, egal wie flach die Ellipse steht */
  const a = tL + (tR - tL) * Math.max(0, Math.min(1, leben));
  const b = tR - (tR - tL) * Math.max(0, Math.min(1, kraft));
  const mitteA = Math.min(a, b), mitteB = Math.max(a, b);
  const u = (k) => `${id}-${k}`;
  return <svg viewBox={`0 0 ${m.W} ${m.H}`} preserveAspectRatio={ausrichtung === "unten" ? "xMidYMax meet" : "xMidYMid meet"} aria-hidden data-gg="sockelband" data-bodenlinie={m.boden}
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
      <path d={segment(m, h + rand, tL, tR, fuss - rand)} fill={`url(#${u("gold")})`} />
      {/* die drei Segmente */}
      {a > tL && <path d={segment(m, h, tL, a, fuss)} fill={`url(#${u("rot")})`} />}
      {mitteB > mitteA && <path d={segment(m, h, mitteA, mitteB, fuss)} fill={`url(#${u("dunkel")})`} />}
      {b < tR && <path d={segment(m, h, b, tR, fuss)} fill={`url(#${u("blau")})`} />}
      {/* Glanz oben, Rundung an den Enden */}
      <path d={segment(m, h, tL, tR, fuss)} fill={`url(#${u("glanz")})`} />
      <path d={segment(m, h, tL, tR, fuss)} fill={`url(#${u("rund")})`} />
      {/* Goldfassung: Linien oben und unten, Stege an den Nahtstellen */}
      <path d={P(bogen(m, h, tL, tR))} fill="none" stroke={`url(#${u("gold")})`} strokeWidth={rand} />
      <path d={P(bogen(m, fuss + rand * 0.5, tL, tR))} fill="none" stroke="#5a3d12" strokeWidth={rand * 0.6} opacity=".7" />
      {/* v1.18.0 (Besitzer): KEINE Stege zwischen Rot, Schwarz und Blau -
          die Farben stossen stumpf aneinander, wie in der Vorlage. */}
    </g>
  </svg>;
}
