/* v1.63.0: eigenstaendige Logodateien - SVG statisch und animiert, mit
   eingebetteten Schriften (Cinzel, Great Vibes, beide OFL), und PNG-Fassungen. */
import { readFileSync, writeFileSync } from "node:fs";
import { wortmarkeSvg, WORTMARKE_KEYFRAMES } from "../src/app/ui/wortmarkeSvg.js";
const b64 = (f) => readFileSync("public/fonts/" + f).toString("base64");
const FONTS = `@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${b64("cinzel-600.woff2")}) format('woff2')}` +
  `@font-face{font-family:'Great Vibes';src:url(data:font/woff2;base64,${b64("great-vibes-400.woff2")}) format('woff2')}`;
for (const [name, animiert] of [["gambit-rise", false], ["gambit-rise-animiert", true]]) {
  let svg = wortmarkeSvg({ id: "gr", breite: "1280", animiert, blitz: animiert, verzug: 0.2 });
  svg = svg.replace('<svg class="gg-wm"', '<svg xmlns="http://www.w3.org/2000/svg" class="gg-wm"').replace("<defs>", `<defs><style>${FONTS}${animiert ? WORTMARKE_KEYFRAMES : ""}</style>`);
  writeFileSync(`design/logo/${name}.svg`, svg); console.log(name + ".svg");
}
