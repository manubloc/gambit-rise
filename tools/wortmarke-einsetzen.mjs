// Setzt die Wortmarke aus der EINEN Quelle (src/app/ui/wortmarkeSvg.js) in
// den festen Ladeschirm (index.html) und die Landingpage ein - zwischen die
// HTML-Marken WORTMARKE und /WORTMARKE, dazu ihre Schrittfolgen zwischen den
// CSS-Kommentaren WM-KF und /WM-KF. Laeuft bei jedem Bau (npm run build),
// also bleibt alles gleich, egal wo die Marke geaendert wird. v1.63.0
import { readFileSync, writeFileSync } from "node:fs";
import { wortmarkeSvg, WORTMARKE_KEYFRAMES } from "../src/app/ui/wortmarkeSvg.js";
const ziele = [
  ["index.html", "b", "min(70vw, 320px)"],
  ["public/landing.html", "l", "100%"],
];
for (const [datei, praefix, breite] of ziele) {
  let s = readFileSync(datei, "utf8");
  const svg = wortmarkeSvg(praefix, { breite, animiert: true, blitz: true, verzug: 0.35 });
  if (s.includes("<!--WORTMARKE-->")) {
    s = s.replace(/<!--WORTMARKE-->[\s\S]*?<!--\/WORTMARKE-->/, `<!--WORTMARKE-->${svg}<!--/WORTMARKE-->`);
  } else {
    const a = s.indexOf('<svg viewBox="0 0 620 250"'); const e = s.indexOf("</svg>", a) + 6;
    if (a < 0) throw new Error("Keine Wortmarke gefunden in " + datei);
    s = s.slice(0, a) + `<!--WORTMARKE-->${svg}<!--/WORTMARKE-->` + s.slice(e);
  }
  if (s.includes("/*WM-KF*/")) {
    s = s.replace(/\/\*WM-KF\*\/[\s\S]*?\/\*\/WM-KF\*\//, `/*WM-KF*/${WORTMARKE_KEYFRAMES}/*/WM-KF*/`);
  } else {
    // alte Schrittfolgen der Marke ersetzen
    s = s.replace(/@keyframes ggRiseGlimm \{[\s\S]*?\} \} @keyframes ggSternFunkeln \{[\s\S]*?\} \}\n?/, "");
    s = s.replace(/@keyframes ggRiseBlitz \{[\s\S]*?100% \{ opacity: 1; filter: brightness\(1\); \} \}/, `/*WM-KF*/${WORTMARKE_KEYFRAMES}/*/WM-KF*/`);
  }
  writeFileSync(datei, s);
  console.log(datei, "gesetzt,", (s.match(/ggBlitzZucken/g) || []).length, "Blitz-Verweise");
}
