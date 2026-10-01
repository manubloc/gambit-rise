/* ── v1.90.21: DIE KRONE LEUCHTET (Besitzer, 1.10.) ──────────────────────────
   "Die Krone ... dieses leuchtende Lila, was wir manchmal an der Kontur
   anwenden, einbauen. Evtl. schaffst du das sogar als Animation - also so,
   dass du gar nicht mehr das Bild anpassen musst."

   Das Gemaelde bleibt unberuehrt. Darueber liegt eine DECKUNGSGLEICHE
   Kronenebene (assets/glanz/: dieselben Pixel wie im Bild, nur die Krone -
   alles ueber ihrer geraden Unterkante bei y 108 von 576). Weil sie dieselben
   Pixel traegt, aendert sie die Krone nicht; sichtbar wird nur ihr Licht:

   1. LEUCHTEN: drop-shadow in den Farben der Grossmeister-Kontur
      (.gg-funkenkontur in theme.js: #e6dcff, #a78bfa, #7c3aed), atmend ueber
      die DECKKRAFT (ggKronenAtem) - Deckkraft komponiert, sie malt nicht neu
      (dieselbe Regel wie ggGatePuls: Mal-Eigenschaften im Puls kosteten
      gemessen die ganze Schicht).
   2. FUNKENLAUF: ein heller Streif zieht alle 5,2 s einmal ueber die Krone,
      auf ihre Form beschnitten (Kronenebene als Maske) und per transform
      bewegt (ggKronenFunke).

   Ihr Licht soll nicht ueber die Stirn laufen. Drei Anlaeufe, alle am Brett
   fotografiert: eine CSS-Maske in Prozent schnitt mitten durch die Krone
   (der Kasten misst 68 x 79, das Bild liegt darin unten buendig 68 x 68 -
   Prozent des Kastens sind nicht Prozent des Bildes); eine Ausblendung der
   Unterkante ueber 12 Zeilen liess die Stirn lavendel; eine hoehere
   Ausblendung faerbte die Kronen-Unterkante selbst lila. Geblieben ist eine
   dritte Ebene, die STIRN (siehe unten). Erst stand hier eine
   CSS-Maske in Prozent - gemessen schnitt sie mitten durch die Krone, weil
   der Kasten am Brett 68 x 79 px misst, das Bild darin aber unten buendig
   68 x 68 liegt; Prozent des Kastens sind nicht Prozent des Bildes.
   Am Brett (Kleinfassung) sind die Radien kleiner als im Hofstaat - ein
   px-Schein waere auf einer 50-px-Figur sonst ein Nebel um den ganzen Kopf.
   Bewegung reduziert (theme.js, prefers-reduced-motion): jede Animation
   steht auf ihrem Endzustand - das Leuchten still auf halber Kraft, der
   Funke ausserhalb der Krone. */
import kroneB25 from "../assets/glanz/krone-boss-b25.webp";
import kroneB25Klein from "../assets/glanz/klein/krone-boss-b25.webp";
import stirnB25 from "../assets/glanz/stirn-boss-b25.webp";
import stirnB25Klein from "../assets/glanz/klein/stirn-boss-b25.webp";
import { PAINTED, PAINTED_KLEIN } from "./paintedArt.js";

const KRONEN = new Map([
  [PAINTED["boss-b25"], { src: kroneB25, stirn: stirnB25, klein: false }],
  [PAINTED_KLEIN["boss-b25"], { src: kroneB25Klein, stirn: stirnB25Klein, klein: true }],
]);

/** Die Kronenebene zu einem Gemaelde (URL) - oder null, wenn es keine traegt. */
export const kroneFuer = (painting) => (painting && KRONEN.get(painting)) || null;

const SCHEIN_GROSS = "drop-shadow(0 0 1.1px rgba(205,175,255,1)) drop-shadow(0 0 1.1px rgba(205,175,255,1)) drop-shadow(0 0 4px rgba(167,120,255,1)) drop-shadow(0 0 9px rgba(124,58,237,.8))";
/* Die innerste Schicht ZWEIMAL, in kraeftigem Hellviolett: sie zeichnet die
   Kontur der Zacken nach (das "leuchtende Lila an der Kontur"); die aeusseren
   zwei geben den Schein. Brett-Fassung gemessen: .6/1.6/3.2 px war am
   50-px-Brett nur ein Hauch, eine fast weisse Innenschicht las sich als
   Dunst UEBER der Krone statt als Kontur. */
const SCHEIN_KLEIN = "drop-shadow(0 0 .7px rgba(205,175,255,1)) drop-shadow(0 0 .7px rgba(205,175,255,1)) drop-shadow(0 0 2.4px rgba(167,120,255,1)) drop-shadow(0 0 5px rgba(124,58,237,.9))";

/* bildFilter: der Filter, den das Gemaelde darunter traegt (Hofstaat:
   brightness(1.14) saturate(1.05)) - die Kronenebene muss ihn MITtragen,
   sonst waere die Krone beim Leuchten um diesen Hub dunkler als darunter. */
export function KronenGlut({ painting, objectPosition = "center", bildFilter = "" }) {
  const k = kroneFuer(painting);
  if (!k) return null;
  const box = { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", userSelect: "none" };
  const maskePos = objectPosition === "center bottom" ? "center bottom" : "center";
  return (<>
    {/* data-gg-still: sonst haengt main.jsx jedem geladenen Bild sein
        Einblenden (ggImgIn, "both") an - gemessen: es ueberschrieb das Atmen */}
    <img src={k.src} alt="" aria-hidden draggable={false} decoding="async" data-gg="kronenglut"
      data-gg-still="" className="gg-kronen-atem"
      style={{ ...box, objectFit: "contain", objectPosition,
        filter: (bildFilter ? bildFilter + " " : "") + (k.klein ? SCHEIN_KLEIN : SCHEIN_GROSS) }} />
    {/* DIE STIRN: die Originalpixel direkt unter der Krone, weich auslaufend,
        UEBER dem Leuchten. Unsichtbar (dieselben Pixel wie im Bild), aber sie
        deckt den Schein, der sonst die Stirn lavendel faerbt - ein
        Schlagschatten malt ueberall, wo seine Ebene durchsichtig ist, und
        jede Ausblendung der Kronen-Unterkante faerbte gemessen entweder die
        Stirn oder die Krone selbst. */}
    <img src={k.stirn} alt="" aria-hidden draggable={false} decoding="async" data-gg="kronenstirn"
      data-gg-still="" style={{ ...box, objectFit: "contain", objectPosition, filter: bildFilter || "none" }} />
    <span aria-hidden data-gg="kronenfunke" style={{ ...box, overflow: "hidden",
      WebkitMaskImage: `url(${k.src})`, maskImage: `url(${k.src})`,
      WebkitMaskSize: "contain", maskSize: "contain",
      WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
      WebkitMaskPosition: maskePos, maskPosition: maskePos }}>
      {/* schmal (24 % der Bildbreite, die Krone ist 31 % breit): ein LAUFENDES
          Licht - die erste Fassung mit 60 % liess die ganze Krone auf einmal
          weiss aufblitzen (gemessen am Brett) */}
      <span className="gg-kronen-funke" style={{ position: "absolute", top: 0, bottom: 0, left: "-24%", width: "24%",
        background: "linear-gradient(100deg, rgba(240,232,255,0) 0%, rgba(240,232,255,.55) 50%, rgba(240,232,255,0) 100%)" }} />
    </span>
  </>);
}
