// Rendert die Menuekacheln im echten Bauteil und prueft die Geometrie.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body><div id='w'></div></body></html>",
  { url: "https://gambitrise.com/", pretendToBeVisual: true });
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.window = dom.window; global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement; global.Element = dom.window.Element;
global.Node = dom.window.Node; global.localStorage = dom.window.localStorage;
global.Event = dom.window.Event; global.CustomEvent = dom.window.CustomEvent;
global.MouseEvent = dom.window.MouseEvent;
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.cancelAnimationFrame = clearTimeout;
global.matchMedia = window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
global.ResizeObserver = window.ResizeObserver = class { observe() {} disconnect() {} };
global.fetch = async () => ({ ok: false, json: async () => ({}) });

const React = await import("react");
const { renderToStaticMarkup } = await import("react-dom/server");
const { PlayHub } = await import("./src/app/App.jsx");
const profil = {
  lang: "de", gesehen: {}, notices: { worldSeen: true }, name: "Manuel",
  campaign: { league: 10, cleared: Array.from({ length: 50 }, (_, i) => "n" + i), unlocked: [], dupes: {} },
  stats: {}, settings: {}, items: {},
};
const m = renderToStaticMarkup(React.createElement(PlayHub, {
  profile: profil, t: (k) => k, dispatch: () => {},
  onCamp: () => {}, onQuick: () => {}, onOnline: () => {}, onTutorial: () => {},
}));
console.log("LAENGE", m.length);
console.log("BILDER als <img>:", (m.match(/karte-|data:image/g) || []).length);
console.log("alte Hintergrund-Einbindung 'url(':", (m.match(/background[^"]*url\(/g) || []).length);
const masken = m.match(/[-a-z]*mask-image:[^;"]{0,80}/g) || [];
console.log("Maskenregeln:", masken.length);
for (const x of masken.slice(0, 2)) console.log("   ", x);
const schleier = m.match(/background:linear-gradient\(90deg[^;"]{0,90}/g) || [];
console.log("Textschleier:", schleier.length);
for (const x of schleier.slice(0, 1)) console.log("   ", x);
console.log("Balken (Bar) vorhanden:", /--gg-bildfrei, 217px\)"><div/.test(m) || m.includes("gg-bildfrei"));
console.log("Balken-Polster:", (m.match(/padding-right:var\(--gg-bildfrei[^;"]*/g) || []));
console.log("Variable gesetzt:", (m.match(/--gg-bildfrei:[^;"]*/g) || []));
