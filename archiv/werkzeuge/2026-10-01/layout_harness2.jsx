// Harness for the quick-play setup and a textured board — visual QA at 390px.
import React from "react";
import { createRoot } from "react-dom/client";
import { QuickSetup } from "./src/app/ui/screens/GameScreen.jsx";
import { BoardView } from "./src/app/ui/board/BoardView.jsx";
import { GLOBAL_CSS, T } from "./src/app/ui/theme.js";
import { defaultProfile } from "./src/meta/index.js";
import { makeT } from "./src/app/i18n/strings.js";
import { createGame } from "./src/core/index.js";
import { buildArmyFromFormation, buildAiArmyForMap } from "./src/meta/index.js";
import { mapById, CHARACTERS } from "./src/content/index.js";
import texWear2 from "./src/app/ui/assets/tex-wear-2.webp";

const t = makeT("de");
const profile = defaultProfile();
profile.campaign = { ...(profile.campaign || {}), league: 6, cleared: [], unlocked: Object.keys(CHARACTERS) };

const map = mapById("classic");
const side = () => buildArmyFromFormation(() => 1, map.defaultFormation);
const state = createGame(side(), buildAiArmyForMap("easy", map, 3), { map, rules: "hp", seed: 3 });

const style = document.createElement("style");
style.textContent = GLOBAL_CSS;
document.head.appendChild(style);
document.body.style.background = T.bg;
document.body.style.margin = "0";
const rootEl = document.getElementById("root");
rootEl.style.padding = "14px";

createRoot(rootEl).render(
  <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 16 }}>
    <QuickSetup profile={profile} dispatch={() => {}} t={t} onStart={() => {}} />
    <BoardView state={state} interactive={false} theme={map.theme} maxPx={360} texture={texWear2} artStyle="painted" />
  </div>
);
