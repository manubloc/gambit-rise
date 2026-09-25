/* DIE WORTMARKE "GAMBIT Rise" ALS REACT-BAUTEIL
   Seit v1.63.0 zeichnet das Bauteil nicht mehr selbst: die Marke kommt aus
   der EINEN Quelle wortmarkeSvg.js - dieselbe, aus der der feste Ladeschirm,
   die Landingpage und die Store-Dateien entstehen. So koennen die Stellen
   nicht mehr auseinanderlaufen.
     breite    - CSS-Breite der Marke
     blitz     - beim Erscheinen flammt sie einmal hell auf (Ladeschirm)
     verzug    - Sekunden bis zu diesem Aufflammen
     animiert  - Blitz zuckt, Aeste flackern, Rise glimmt, Stern funkelt
                 (Standard an; aus fuer eine ruhige, statische Marke)          */
import { useId } from "react";
import { wortmarkeSvg } from "./wortmarkeSvg.js";

export function WortmarkeRise({ breite = "min(78vw, 420px)", blitz = false, verzug = 0, animiert = true }) {
  const id = "wm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return <div style={{ width: breite, margin: "0 auto" }}
    dangerouslySetInnerHTML={{ __html: wortmarkeSvg(id, { breite: "100%", animiert, blitz, verzug }) }} />;
}
