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
import { wortmarkeSvg } from "./wortmarkeSvg.js";

/* v1.63.0: das SVG kommt aus wortmarkeSvg.js - EINE Quelle fuer App,
   festen Ladeschirm und Landingpage (tools/wortmarke-einsetzen.mjs).
   `statisch` haelt alles still (Store-Grafiken, reduzierte Bewegung). */
export function WortmarkeRise({ breite = "min(78vw, 420px)", blitz = false, verzug = 0, statisch = false }) {
  const id = "wm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return <div style={{ width: breite, lineHeight: 0 }}
    dangerouslySetInnerHTML={{ __html: wortmarkeSvg({ id, breite: "100%", animiert: !statisch, blitz, verzug }) }} />;
}
