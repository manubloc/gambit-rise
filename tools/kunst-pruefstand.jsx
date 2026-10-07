/* ── DER PRUEFSTAND DER KUENSTE (v1.94.0) ─────────────────────────────────────
   Der ECHTE Spielschirm (GameScreen) an einer Schach-Station des ersten
   Kapitels, mit einem Hof, der seine erste Kunst gelernt hat: Baeuerin
   (Feldarbeit), Hofnarr (Platztausch), Schmied (Standhieb), Spaeher
   (Uebersprung). tools/pruefe-kunst.mjs faehrt daran: Karte antippen, Feld
   antippen, wirkt es?   [?en=1] */
import { createRoot } from "react-dom/client";
import { useReducer } from "react";
import { GLOBAL_CSS } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { GameScreen } from "../src/app/ui/screens/GameScreen.jsx";
import { makeT } from "../src/app/i18n/strings.js";
import { defaultProfile } from "../src/meta/profile.js";
import { buildStageMatch } from "../src/meta/campaign.js";
import { CAMPAIGN } from "../src/content/index.js";

const en = new URLSearchParams(location.search).get("en") === "1";
const d = defaultProfile();
const profil = { ...d, lang: en ? "en" : "de", name: "Probe",
  notices: { ...(d.notices || {}), hpBrief: true, privacy: true },
  campaign: { ...d.campaign, unlocked: ["farmwife", "jester", "smith", "hawk"] },
  pieces: { ...(d.pieces || {}), levels: { farmwife: 2, jester: 2, smith: 2, hawk: 2 },
    abilities: { farmwife: ["feldarbeit"], jester: ["platztausch"], smith: ["standhieb"], hawk: ["uebersprung"] } },
  loadout: { ...(d.loadout || {}), formations: { classic: ["farmwife", "jester", "smith", "queen", "king", "hawk", "knight", "rook"] } } };

let match = null;
for (const n of CAMPAIGN) {
  if (!String(n.id).startsWith("L01")) continue;
  try { const m = buildStageMatch(n.id, profil); if (m && m.rules === "chess") { match = { ...m, node: { ...m.node, storyDe: "", storyEn: "" } }; break; } } catch { /* naechste */ }
}
if (!match) throw new Error("keine Schach-Station in Kapitel I gefunden");
document.documentElement.setAttribute("data-station", match.nodeId);

function reducer(p, a) {
  if (a.type === "REPLACE") return a.profile;
  if (a.type === "SET_NOTICE") return { ...p, notices: { ...(p.notices || {}), [a.key]: true } };
  if (a.type === "PAUSE_MATCH") return { ...p, pausedMatch: a.data || null };
  return p;
}
function Stand() {
  const [p, dispatch] = useReducer(reducer, profil);
  return <div id="schirm" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#07050d", color: "#e8e4d8" }}>
    <GameScreen profile={p} dispatch={dispatch} t={makeT(p.lang)} match={match} quick={null} onExit={() => {}} />
  </div>;
}
const st = document.createElement("style"); st.textContent = GLOBAL_CSS; document.head.appendChild(st);
setAnimAn(false);
document.body.style.margin = "0";
const w = document.createElement("div"); w.id = "ziel"; document.body.appendChild(w);
createRoot(w).render(<Stand />);
