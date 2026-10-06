/* ── DER PRUEFSTAND DER BRETTRUHE (v1.92.1) ───────────────────────────────────
   Der ECHTE Spielschirm (GameScreen) in einem Kasten von Schirmgroesse, damit
   tools/pruefe-brettruhe.mjs messen kann, ob das Brett bei allem, was im Spiel
   geschieht, an derselben Stelle und gleich gross bleibt.

     ?art=schach|hp|klassisch|hotseat|kampagne|kroenung   [&en=1]

   "kroenung" setzt eine Kampagnenpartie fort, in der ein weisser Bauer einen
   Zug vor der Umwandlung steht (profile.pausedMatch, derselbe Weg wie eine
   unterbrochene Partie). */
import { createRoot } from "react-dom/client";
import { useReducer } from "react";
import { GLOBAL_CSS } from "../src/app/ui/theme.js";
import { setAnimAn } from "../src/app/ui/anim.js";
import { GameScreen } from "../src/app/ui/screens/GameScreen.jsx";
import { makeT } from "../src/app/i18n/strings.js";
import { defaultProfile } from "../src/meta/profile.js";
import { withProgressPct } from "../src/meta/saves.js";
import { buildStageMatch } from "../src/meta/campaign.js";
import { CAMPAIGN } from "../src/content/index.js";
import { createGame, defaultArmy, legalMovesFrom, encodeState } from "../src/core/index.js";

const q = new URLSearchParams(location.search);
const art = q.get("art") || "schach";
const en = q.get("en") === "1";

let profil = withProgressPct({ ...defaultProfile(), lang: en ? "en" : "de", name: "Probe" }, 60, 3);
profil = { ...profil, lang: en ? "en" : "de",
  notices: { ...(profil.notices || {}), hpBrief: true },
  items: { ...(profil.items || {}), potion: 3, hourglass: 2 } };

/* eine offene, gewoehnliche HP-Station des dritten Kapitels */
function station() {
  const frei = new Set(profil.campaign?.cleared || []);
  for (const n of CAMPAIGN) {
    if (!String(n.id).startsWith("L03") || frei.has(n.id)) continue;
    try { const m = buildStageMatch(n.id, profil); if (m && m.rules === "hp") return m; } catch { /* naechste */ }
  }
  for (const n of CAMPAIGN) { try { const m = buildStageMatch(n.id, profil); if (m) return m; } catch { /* naechste */ } }
  throw new Error("keine Station gefunden");
}

let match = null, quick = null;
if (art === "kampagne" || art === "kroenung") {
  match = station();
  match = { ...match, node: { ...match.node, storyDe: "", storyEn: "" } };   // ohne Erzaehlfenster
  if (art === "kroenung") {
    const s = createGame(defaultArmy(), defaultArmy(), { seed: 7, rules: "hp" });
    const i = s.board.findIndex((p) => p && p.color === "w" && p.kind === "P" && !p.hero);
    let fertig = null;
    for (let j = 0; j < s.board.length && !fertig; j++) {
      if (j === i || (s.board[j] && !(s.board[j].color === "b" && s.board[j].kind === "P"))) continue;   // frei, oder an Stelle eines schwarzen Bauern (dann kroent er schlagend)
      const b = s.board.slice(); b[j] = b[i]; b[i] = null;
      const t = { ...s, board: b };
      try { if (legalMovesFrom(t, j).some((m) => m.promotion)) fertig = t; } catch { /* weiter */ }
    }
    if (!fertig) throw new Error("keine Kroenungsstellung gefunden");
    profil = { ...profil, pausedMatch: { v: 1, nodeId: match.nodeId, enc: encodeState(fertig), potionsUsed: 0, hourglassUsed: 0 } };
  }
} else {
  quick = { n: 1, mapId: "classic", mode: art === "hp" ? "hp" : art === "klassisch" ? "classic" : "chess",
    difficulty: "easy", elo: 800, hotseat: art === "hotseat", hotseatFlip: false };
}

function reducer(p, a) {
  if (a.type === "REPLACE") return a.profile;
  if (a.type === "SET_NOTICE") return { ...p, notices: { ...(p.notices || {}), [a.key]: true } };
  if (a.type === "PAUSE_MATCH") return { ...p, pausedMatch: a.data || null };
  return p;
}
function Stand() {
  const [p, dispatch] = useReducer(reducer, profil);
  return <div id="schirm" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#07050d", color: "#e8e4d8" }}>
    <GameScreen profile={p} dispatch={dispatch} t={makeT(p.lang)} match={match} quick={quick} onExit={() => {}} />
  </div>;
}
const st = document.createElement("style"); st.textContent = GLOBAL_CSS; document.head.appendChild(st);
setAnimAn(false);
document.body.style.margin = "0";
const w = document.createElement("div"); w.id = "ziel"; document.body.appendChild(w);
createRoot(w).render(<Stand />);
