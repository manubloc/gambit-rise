/* ── EIN FIGURENBILD MIT SEINEM BAND (v1.90.26, Besitzer 3.10.2026) ──────────
   "Wir killen den grauen Sockel ... einfach ueberall das Band hinmachen, in
    schwarz, ohne Lebensbalken. Und das ziehst du ueberall durch."

   Brett, Hofstaat-Kachel und Figurenblatt tragen das Band seit jeher. Rund ein
   Dutzend andere Stellen zeichneten das Gemaelde aber ROH - ein <img> auf dem
   gemalten grauen Teller: die Aufstellungsreihe, die grosse Ansicht, die
   Kampagnenfenster, die Kampfleiste, die Kroenungswahl, die Erstbegegnung, die
   Feiern. Dieselbe Figur stand dort auf Grau und zwei Fingerbreit daneben auf
   Schwarz.

   BandBild ersetzt an diesen Stellen das <img> - mit DEMSELBEN style-Objekt.
   Es teilt es auf: was den KASTEN betrifft (Masse, Raender, Filter, Bewegung,
   Verwandlung) traegt die Huelle, das Bild fuellt sie mit objectFit contain,
   und das Band liegt deckungsgleich darueber (SockelBand rechnet in
   Bildpixeln; sein SVG sitzt mit derselben Ausrichtung im selben Kasten).

   Hat das <img> nur EINE Kante (height: 108), kam die andere aus dem
   Seitenverhaeltnis des Bildes - die Huelle bekommt es als aspectRatio aus der
   Sockelmessung (W : H, meist 576 : 576).

   Wer kein Band hat (Haendler, Schatzkammer, unvermessene Bilder), bleibt ein
   schlichtes <img> - genau wie vorher. */
import { SockelBand, hatBand } from "./SockelBand.jsx";
import { paintedIdOf } from "./board/paintedArt.js";
import MASS from "./board/sockelband.json";

/* Diese Eigenschaften gehoeren dem Bild, nicht dem Kasten. */
const NUR_BILD = ["objectFit", "objectPosition", "userSelect"];

export function BandBild({ src, style = {}, kennung = "x", leben = null, kraft = null, schaden = 0, ...rest }) {
  const pid = paintedIdOf(src);
  if (!hatBand(pid)) return <img src={src} alt="" draggable={false} style={style} {...rest} />;
  const m = MASS[pid];
  const kasten = { ...style };
  for (const k of NUR_BILD) delete kasten[k];
  /* Die fehlende Kante kommt aus dem Bild, wie beim <img> selbst. `width:
     "auto"` zaehlt als fehlend. */
  const fehlt = (v) => v == null || v === "auto";
  if (fehlt(kasten.width) || fehlt(kasten.height)) kasten.aspectRatio = `${m.W} / ${m.H}`;
  if (kasten.width === "auto") delete kasten.width;
  if (kasten.height === "auto") delete kasten.height;
  const unten = /bottom/.test(String(style.objectPosition || ""));
  const mitWerten = leben != null;
  return <span data-bandbild={pid} style={{ position: "relative", display: kasten.display === "block" ? "block" : "inline-block",
    lineHeight: 0, boxSizing: "border-box", ...kasten, ...(kasten.display && kasten.display !== "block" ? { display: "inline-block" } : null) }}>
    <img src={src} alt="" draggable={false} {...rest} style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
      objectFit: "contain", objectPosition: unten ? "center bottom" : "center", userSelect: "none", pointerEvents: "none" }} />
    <SockelBand paintedId={pid} leben={mitWerten ? leben : 0} kraft={mitWerten ? (kraft || 0) : 0} schaden={schaden}
      grau={!mitWerten} ausrichtung={unten ? "unten" : "mitte"} id={`bb-${kennung}-${pid}`} />
  </span>;
}
