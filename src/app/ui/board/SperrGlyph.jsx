// ── EINE SPERRE AUF EINEM FELD ──────────────────────────────────────────────
// Zeichnet Zaun, Mauer oder Bollwerk in ihrem jeweiligen Zustand.
//
// DAS VERBLASSEN DER TRUEMMER (Besitzerwunsch): Schutt ist kein Zustand, den
// man behaelt. Er zeigt sich kurz - lange genug, dass man SIEHT, was da eben
// zerbrochen ist - und sinkt dann unter die Figur, die darueber zieht. Wer
// ihn festhielte, verdeckte das Brett.
//
// Der Ablauf: zwei Sekunden voll sichtbar, dann ueber anderthalb Sekunden auf
// ein Fuenftel Deckkraft. Er verschwindet NICHT ganz - eine Narbe bleibt, so
// weiss man auch spaeter noch, wo eine Mauer stand.
//
// EIN ZEITGEBER JE FELD, und er wird beim Abraeumen geloescht. Ein
// vergessener Zeitgeber auf einem Brett mit 64 Feldern ist kein kleiner
// Fehler.
import { useEffect, useRef, useState } from "react";
import { sperrBild, SPERR_SITZ } from "./sperrenArt.js";
import { SperrVektor, hatVektor } from "./sperrenVektor.jsx";

const VOLL_MS = 2000;      // so lange bleibt der Schutt voll sichtbar
const BLASS_MS = 1500;     // so lange dauert das Sinken
const REST = 0.2;          // so viel bleibt als Narbe stehen

export function SperrGlyph({ art, zustand, ruhig = false }) {
  const bild = sperrBild(art, zustand);
  const sitz = SPERR_SITZ[zustand] || SPERR_SITZ.heil;
  const truemmer = zustand === "truemmer";

  /* Verblassen nur fuer Truemmer, und nur wenn sich ueberhaupt etwas bewegen
     darf: im Sparmodus und in ruhigen Brettern (Vorschau, Blatt) steht das
     Bild einfach da. */
  const [blass, setBlass] = useState(false);
  const uhr = useRef(null);
  useEffect(() => {
    if (!truemmer || ruhig) { setBlass(false); return; }
    setBlass(false);
    uhr.current = setTimeout(() => setBlass(true), VOLL_MS);
    return () => { if (uhr.current) clearTimeout(uhr.current); uhr.current = null; };
  }, [truemmer, ruhig, art]);

  /* v1.0.63: FEHLT DAS BILD, ZEICHNET DIE HAND. Bis hierher gab dieser Zweig
     null zurueck - richtig, solange keine Sperre je auf einem echten Brett
     stand. Seit man sie KAUFT, waere das ein bezahltes Nichts: Zaun und
     Bollwerk haben noch keine Gemaelde. Die Zeichnung springt ein, bis sie
     kommen. */
  if (!bild && !hatVektor(art)) return null;

  return (
    <div style={{
      /* v1.2.3 (Besitzer: "Mauer und Zaun und Bollwerk bitte vertikal mittig
         ausrichten, sauber ausrichten"): SIE STANDEN AM UNTEREN RAND. bottom
         2 % setzte sie auf die Feldkante, waehrend die Figuren ihre eigene
         Mitte haben - nebeneinander sah das aus, als wuerden die Sperren
         rutschen. Jetzt sitzen sie mittig im Feld, und der alte Wert dient
         nur noch als feine Verschiebung daraus (unten 0,02 heisst jetzt:
         zwei Prozent unter die Mitte, nicht zwei Prozent ueber den Boden). */
      position: "absolute", left: "50%", top: "50%",
      transform: `translate(-50%, calc(-50% + ${(sitz.unten * -100).toFixed(1)}%))`,
      width: `${sitz.breite * 100}%`, height: `${sitz.hoehe * 100}%`,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      /* Die Truemmer liegen UNTER der Figur (zIndex 0 gegen ihre 2), die
         aufrechten Sperren stehen auf demselben Feld wie sie - dort steht
         ohnehin nie beides zugleich, weil eine heile Mauer den Zug
         aufhaelt. */
      zIndex: truemmer ? 0 : 1,
      pointerEvents: "none",
      opacity: blass ? REST : 1,
      transition: ruhig ? "none" : `opacity ${BLASS_MS}ms ease-out`,
    }}>
      {!bild ? <SperrVektor art={art} zustand={zustand} fuellt /> :
      <img src={bild} alt="" draggable={false} style={{
        maxWidth: "100%", maxHeight: "100%", objectFit: "contain",
        objectPosition: "bottom center",
        /* Ein einziger Schatten - dieselbe Sparsamkeit wie bei den ruhenden
           Figuren seit v1.0.41. Neun Durchgaenge waren dort die gemessene
           Ursache des Ruckelns; eine Sperre steht auf jedem zweiten Feld und
           darf erst recht nicht teuer sein. */
        filter: "drop-shadow(0 2px 3px rgba(0,0,0,.6))",
      }} />}
    </div>
  );
}
