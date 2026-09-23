import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body><div id='w'></div></body></html>",
  { url: "https://gambitrise.com/", pretendToBeVisual: true });
Object.defineProperty(global,"navigator",{value:dom.window.navigator,configurable:true});
global.window = dom.window; global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element; global.Node = dom.window.Node;
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.cancelAnimationFrame = clearTimeout;
const daten = {
  "/schaukammer.json": JSON.parse(readFileSync("dist/schaukammer.json", "utf8")),
  "/bildarchiv/zuordnung.json": JSON.parse(readFileSync("archiv/bilder/zuordnung.json", "utf8")),
  "/bildarchiv/bestand.json": JSON.parse(readFileSync("archiv/bilder/bestand.json", "utf8")),
};
global.fetch = async (u) => ({ json: async () => { if (!(u in daten)) throw new Error("404 " + u); return daten[u]; } });
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { SchaukammerScreen } = await import("./src/app/ui/SchaukammerScreen.jsx");
global.IS_REACT_ACT_ENVIRONMENT = false;
const root = createRoot(document.getElementById("w"));
root.render(React.createElement(SchaukammerScreen));
await new Promise((r) => setTimeout(r, 800));
const html = document.getElementById("w").innerHTML;
console.log("LAENGE", html.length);
console.log("KACHELN", (html.match(/loading="lazy"/g) || []).length);
console.log("SCHILDER HQ", (html.match(/>HQ /g) || []).length,
            "| HQ?", (html.match(/>HQ\?</g) || []).length,
            "| kein HQ", (html.match(/kein HQ</g) || []).length);
console.log("TEXT", document.getElementById("w").textContent.replace(/\s+/g, " ").slice(0, 420));
process.stdout.write("---HTML---\n" + html);
