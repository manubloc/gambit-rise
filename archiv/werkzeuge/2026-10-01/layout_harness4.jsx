import React from "react";
import { createRoot } from "react-dom/client";
import { PlayHub } from "./src/app/App.jsx";
import { GLOBAL_CSS, T } from "./src/app/ui/theme.js";
import { defaultProfile, } from "./src/meta/index.js";
import { makeT } from "./src/app/i18n/strings.js";
const t = makeT("de");
const profile = defaultProfile();
const style = document.createElement("style");
style.textContent = GLOBAL_CSS;
document.head.appendChild(style);
document.body.style.background = T.bg; document.body.style.margin = "0";
document.getElementById("root").style.padding = "14px";
createRoot(document.getElementById("root")).render(
  <PlayHub profile={profile} t={t} onQuick={()=>{}} onCamp={()=>{}} onOnline={()=>{}} onTutorial={()=>{}} />
);
