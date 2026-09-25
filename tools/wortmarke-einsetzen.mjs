/* v1.63.0: schreibt die Wortmarke aus src/app/ui/wortmarkeSvg.js in den festen
   Ladeschirm (index.html) und die Landingpage (public/landing.html) - zwischen
   die Marken <!--WORTMARKE--> und <!--/WORTMARKE-->. Beim ersten Lauf ersetzt
   es das dort stehende SVG. Aufruf: node tools/wortmarke-einsetzen.mjs */
import { readFileSync, writeFileSync } from "node:fs";
import { wortmarkeSvg, WORTMARKE_KEYFRAMES } from "../src/app/ui/wortmarkeSvg.js";
const ZIELE = [["index.html", "bw", "min(70vw, 320px)"], ["public/landing.html", "lw", "100%"]];
for (const [datei, id, breite] of ZIELE) {
  let s = readFileSync(datei, "utf8");
  const svg = wortmarkeSvg({ id, breite, animiert: true, blitz: true, verzug: 0.25 });
  const block = `<!--WORTMARKE-->${svg}<!--/WORTMARKE-->`;
  if (s.includes("<!--WORTMARKE-->")) s = s.replace(/<!--WORTMARKE-->[\s\S]*?<!--\/WORTMARKE-->/, block);
  else { const i = s.search(/<svg (class="gg-wm" )?viewBox="0 0 6[24]0 250"/); const j = s.indexOf("</svg>", i) + 6;
    if (i < 0) throw new Error("kein Wortmarken-SVG in " + datei); s = s.slice(0, i) + block + s.slice(j); }
  if (!s.includes("@keyframes ggWmZug")) s = s.replace("@keyframes ggRiseBlitz", WORTMARKE_KEYFRAMES.split("\n").filter((z) => !z.includes("ggRiseBlitz")).join("\n      ") + "\n      @keyframes ggRiseBlitz");
  writeFileSync(datei, s); console.log("eingesetzt:", datei);
}
