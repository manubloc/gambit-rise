// ── DER BRETT-HINTERGRUND ───────────────────────────────────────────────────
// Wunsch des Besitzers (v1.0.24): hinter dem Schachbrett liegt das Land, in
// dem gerade gekaempft wird - zwoelf Oelgemaelde, eines je Kapitel, von ihm
// selbst erzeugt nach dem Katalog in design/BRETT-HINTERGRUENDE.md.
//
// Bauart wie beim RissBoden, nur andersherum gedacht: das Bild deckt den
// GANZEN Schirm (der Blick geht ins Land hinein, nicht auf einen Boden), und
// oben wie unten laeuft es in Schwarz aus, damit Kopfzeile, Knoepfe und
// Zugleiste ruhig bleiben. Das Brett steht mittig davor - genau dort ist die
// Bildmitte absichtlich leer gemalt.
//
// WARUM ALS DATEI UND NICHT IM BUENDEL: zwoelf Bilder zu je ~100 KB waeren
// 1,2 MB Buendel-Zuwachs fuer etwas, das immer nur EINMAL sichtbar ist. Sie
// liegen darum wie die Kapitelgemaelde in public/ und werden vom Browser
// geholt, wenn das Kapitel dran ist.
import { useMemo, useState } from "react";
import { gespart } from "./sparmodus.js";

// Die Zuordnung Kapitel -> Datei, gleiche Tabelle wie in KapitelIntro.jsx.
const DATEI = {
  1: "01-kronland", 2: "02-kornmark", 3: "03-eichwald", 4: "04-krummholz",
  5: "05-grauwacht", 6: "06-wolkenjoch", 7: "07-sattelweite", 8: "08-aschgrund",
  9: "09-wunde", 10: "10-sonnenschlund", 11: "11-kueste", 12: "12-meer",
};

/** Das Land hinter dem Brett.
 *
 *  @param liga    Kapitelnummer 1-12. Alles ausserhalb faellt auf Kronland.
 *  @param staerke 0..1 - wie deutlich das Bild stehen darf. Der Besitzer kann
 *                 es spaeter zurueckdrehen, ohne dass hier etwas umgebaut wird.
 */
export function BrettHintergrund({ liga = 1, staerke = 1 }) {
  /* v1.0.37: im Sparmodus bleibt der Grund schwarz - das Bild ist der
     teuerste Einzelposten des Kampfschirms. */
  if (gespart("gemaelde")) return <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0,
    pointerEvents: "none", background: "#05060a" }} />;
  const [geladen, setGeladen] = useState(false);
  const quelle = useMemo(() => {
    const n = Math.min(12, Math.max(1, Math.round(liga || 1)));
    /* v1.55.0: RELATIV, nicht absolut ab der Wurzel. Seit die App unter /spielen/ wohnt
       (v1.42.0), zeigte der absolute Pfad an die Wurzel - dort liegt nur das
       Schaufenster, und alle Brett-Hintergruende fehlten im Spiel (Besitzer:
       "die ganzen schoenen Hintergruende von den Spielfeldern fehlen alle"). */
    return `./brett/${DATEI[n] || DATEI[1]}.webp`;
  }, [liga]);

  return (
    /* v1.0.25: EIGENE GRAFIKSCHICHT. Ohne diese Zeilen liegt das Gemaelde in
       derselben Ebene wie das Brett - und jede Figur, die zieht, zwingt den
       Browser, den ganzen Hintergrund neu zu zeichnen. translateZ(0) hebt ihn
       auf eine eigene Schicht, die einmal gezeichnet und danach nur noch
       darunter gehalten wird; contain sagt zusaetzlich, dass nichts darin
       nach aussen wirkt. Das Bild bewegt sich nie - genau der Fall, fuer den
       diese Schicht gedacht ist. */
    <div aria-hidden style={{
      /* v1.0.27 (Besitzer: "die Hintergruende sind immer noch nicht da"):
         GEMESSEN, NICHT GERATEN. Das Bild lag im DOM, in voller Groesse und
         mit Deckkraft 1 - und kam trotzdem NICHT auf den Schirm: gemessene
         Helligkeit 0.004 statt der 0.22 des Gemaeldes. Ursache war
         zIndex -1. Der Seitenkoerper traegt background:#000, und ein Kind
         mit negativem zIndex wird HINTER den Hintergrund seines
         Stapel-Vorfahren gemalt - also hinter dieses Schwarz. Man sah das
         Bild nie, obwohl alles andere stimmte.
         Jetzt zIndex 0: das Bild steht ueber dem Seitenschwarz, und der
         Inhalt, der im DOM SPAETER kommt, liegt weiterhin darueber. */
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      background: "#05060a", overflow: "hidden",
      transform: "translateZ(0)", willChange: "opacity", contain: "layout paint",
    }}>
      <img
        src={quelle}
        alt=""
        decoding="async"
        onLoad={() => setGeladen(true)}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          /* Erst wenn das Bild wirklich da ist, blendet es auf - ein halb
             geladenes Gemaelde, das ruckartig erscheint, waere schlimmer als
             eine Sekunde Schwarz. */
          opacity: geladen ? staerke : 0,
          transition: "opacity .6s ease",
        }}
      />
      {/* Oben und unten in Schwarz auslaufen: dort sitzen Kopfzeile und
          Zugleiste, und Schrift auf Gemaelde liest sich schlecht. */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(5,6,10,.92) 0%, rgba(5,6,10,.35) 14%,"
          + " rgba(5,6,10,0) 30%, rgba(5,6,10,0) 68%, rgba(5,6,10,.45) 86%, rgba(5,6,10,.95) 100%)",
      }} />
    </div>
  );
}
