/* ── DER PRUEFSTAND DER KAMPFLEISTE (v1.90.34) ────────────────────────────────
   Die echte KampfLeiste in Handybreite: ein Bauer bekommt ALLE lebenden
   Faehigkeiten, damit tools/pruefe-leiste.mjs jede Kachel antippen und messen
   kann, ob ihr Name passt und ob die Kartenreihe dabei stehen bleibt. */
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { GLOBAL_CSS } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { KampfLeiste } from "../src/app/ui/KampfLeiste.jsx";
import { createGame, defaultArmy } from "../src/core/index.js";
import { ABILITIES } from "../src/content/index.js";

const q = new URLSearchParams(location.search);
const en = q.get("en") === "1";
function Stand() {
  const [scharf, setScharf] = useState(null);
  const s = createGame(defaultArmy(), defaultArmy(), { seed: 7, rules: q.get("regeln") || "hp" });
  const i = s.board.findIndex((p) => p && p.color === "w" && (p.kind === "pawn" || p.kind === "p" || p.kind === "P"));
  if (i < 0) throw new Error("kein weisser Bauer gefunden");
  s.board[i] = { ...s.board[i], level: 2, abilities: Object.keys(ABILITIES).filter((k) => ABILITIES[k].live) };
  return <div id="ziel" style={{ width: "100%", background: "#0b0814" }}>
    <KampfLeiste state={s} inspect={{ i }} en={en} myColor="w" scharf={scharf} onScharf={setScharf}
      raum={q.get("raum") || "hoch"} breit={q.get("breit") === "1"} />
  </div>;
}
const st = document.createElement("style"); st.textContent = GLOBAL_CSS; document.head.appendChild(st);
setAnimAn(false);
const w = document.createElement("div"); document.body.style.margin = "0"; document.body.appendChild(w);
createRoot(w).render(<Stand />);
