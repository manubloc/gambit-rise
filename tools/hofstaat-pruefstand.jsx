/* ── DER PRUEFSTAND DES HOFSTAATS (v1.92.2) ───────────────────────────────────
   Der echte Figuren-Schirm (ArmyScreen, Reiter Verzeichnis) mit einem weit
   gespielten Stand - fuer tools/pruefe-hofzoom.mjs: Zoom mit zwei Fingern,
   Blatt oeffnen und wieder herauszoomen, Wisch-Wink. */
import { createRoot } from "react-dom/client";
import { useReducer } from "react";
import { GLOBAL_CSS } from "../src/app/ui/theme.js";
import { ArmyScreen } from "../src/app/ui/screens/ArmyScreen.jsx";
import { makeT } from "../src/app/i18n/strings.js";
import { defaultProfile } from "../src/meta/profile.js";
import { withProgressPct } from "../src/meta/saves.js";

const profil = { ...withProgressPct({ ...defaultProfile(), lang: "de", name: "Probe" }, 70, 8), lang: "de" };
function reducer(p, a) { return a.type === "REPLACE" ? a.profile : p; }
function Stand() {
  const [p, dispatch] = useReducer(reducer, profil);
  return <div id="rolle" style={{ position: "fixed", inset: 0, overflowY: "auto", background: "#07050d", color: "#e8e4d8", padding: "0 10px" }}>
    <ArmyScreen profile={p} dispatch={dispatch} t={makeT(p.lang)} initialTab="tree" />
  </div>;
}
const st = document.createElement("style"); st.textContent = GLOBAL_CSS; document.head.appendChild(st);
document.body.style.margin = "0";
const w = document.createElement("div"); w.id = "ziel"; document.body.appendChild(w);
createRoot(w).render(<Stand />);
