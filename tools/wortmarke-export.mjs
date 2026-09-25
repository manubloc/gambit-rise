// Erzeugt aus der EINEN Quelle die Dateien der Wortmarke fuer Store und Presse
// (design/logo/): statisches SVG, animiertes SVG - beide mit eingebetteten
// Schriften, damit sie ueberall gleich aussehen - und PNG in 2800 px Breite,
// einmal durchsichtig und einmal auf dunklem Grund. v1.63.0
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { wortmarkeSvg, WORTMARKE_KEYFRAMES } from "../src/app/ui/wortmarkeSvg.js";
import { chromium } from "playwright-core";
const b64 = (f) => readFileSync("public/fonts/" + f).toString("base64");
const SCHRIFTEN = `@font-face{font-family:'Cinzel';font-weight:600;src:url(data:font/woff2;base64,${b64("cinzel-600.woff2")}) format('woff2')}`
  + `@font-face{font-family:'Great Vibes';font-weight:400;src:url(data:font/woff2;base64,${b64("great-vibes-400.woff2")}) format('woff2')}`;
mkdirSync("design/logo", { recursive: true });
const eigenstaendig = (animiert) => {
  let s = wortmarkeSvg("gr", { breite: "700", animiert, blitz: false });
  s = s.replace('<svg viewBox="-40 0 700 250"', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 0 700 250" height="250"');
  return s.replace("<defs>", `<defs><style>${SCHRIFTEN}${animiert ? WORTMARKE_KEYFRAMES : ""}</style>`);
};
writeFileSync("design/logo/gambit-rise-logo.svg", eigenstaendig(false));
writeFileSync("design/logo/gambit-rise-logo-animiert.svg", eigenstaendig(true));
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [name, grund] of [["gambit-rise-logo-2800.png", "transparent"], ["gambit-rise-logo-2800-dunkel.png", "#07050d"]]) {
  const page = await browser.newPage({ viewport: { width: 760, height: 290 }, deviceScaleFactor: 4 });
  await page.setContent(`<html><body style="margin:0;background:${grund};padding:20px 30px">${eigenstaendig(false).replace('width="700"', 'width="700"')}</body></html>`);
  await page.waitForTimeout(600);
  await page.screenshot({ path: "design/logo/" + name, omitBackground: grund === "transparent" });
  await page.close();
}
await browser.close();
console.log("design/logo/ geschrieben");
