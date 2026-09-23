// ── PRUEFE: KARTE NACH DEM KAPITEL-EINSTIEG ────────────────────────────────
// v1.0.3. Der Versatz-Fehler bestand darin, dass der vp-Mess-Effect beim
// ersten Mount (Intro aktiv, vpRef leer) frueh zurueckkehrte, BEVOR er
// ResizeObserver oder resize-Listener registrierte - und mit Deps []
// nie wieder lief. Diese Sonde beweist das Gegenteil am echten Bauteil:
//   1. Waehrend des Einstiegs ist KEIN Observer angehaengt.
//   2. Nach "Weiter zur Karte" ist GENAU der Kartenbereich beobachtet.
// Faellt jemand auf Deps [] zurueck, faellt die Sonde.
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='w'></div></body></html>",
  { url: "https://gambitrise.com/", pretendToBeVisual: true });
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.window = dom.window; global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement; global.Element = dom.window.Element;
global.Node = dom.window.Node; global.localStorage = dom.window.localStorage;
/* Node bringt einen eigenen Event-Konstruktor mit - jsdom nimmt nur seinen. */
global.Event = dom.window.Event; global.CustomEvent = dom.window.CustomEvent;
global.MouseEvent = dom.window.MouseEvent;
global.requestAnimationFrame = (f) => setTimeout(f, 0);
global.cancelAnimationFrame = clearTimeout;
global.matchMedia = window.matchMedia = (q) => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });

const beobachtet = [];
global.ResizeObserver = window.ResizeObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { beobachtet.push(el); }
  disconnect() {}
};
global.Audio = window.Audio = class { play() { return Promise.resolve(); } pause() {} };
global.fetch = async () => ({ ok: false, json: async () => ({}) });

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { CampaignScreen } = await import("../src/app/ui/screens/CampaignScreen.jsx");
global.IS_REACT_ACT_ENVIRONMENT = false;

const profil = {
  lang: "de", gesehen: {}, notices: { worldSeen: true },
  campaign: { league: 1, unlocked: [], faced: [], cleared: [] },
  stats: {}, settings: {},
};
let fehler = 0;
const pruefe = (wahr, wort) => { console.log((wahr ? "  ok    " : "  FEHLT ") + wort); if (!wahr) fehler++; };

const root = createRoot(document.getElementById("w"));
root.render(React.createElement(CampaignScreen, {
  profile: profil, dispatch: () => {}, t: (k) => k,
  onStart: () => {}, onBack: () => {}, onOpenTree: () => {},
}));
await new Promise((r) => setTimeout(r, 250));

const introDa = !!document.querySelector("img[src^='/kapitel/']");
pruefe(introDa, "der Einstieg steht (Kapitelbild im Baum)");
pruefe(beobachtet.length === 0, `waehrend des Einstiegs haengt kein Observer (${beobachtet.length})`);

// Weiter zur Karte - der Knopf sperrt die ersten 700 ms, also warten
await new Promise((r) => setTimeout(r, 760));
const knopf = [...document.querySelectorAll("button")].find((b) => /Weiter zur Karte/.test(b.textContent));
pruefe(!!knopf, "der Weiter-Knopf ist da");
knopf && knopf.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
await new Promise((r) => setTimeout(r, 250));

pruefe(!document.querySelector("img[src^='/kapitel/']"), "der Einstieg ist geschlossen");
pruefe(beobachtet.length >= 1, `jetzt wird gemessen: ${beobachtet.length} Element(e) beobachtet`);
const inBaum = beobachtet.some((el) => document.body.contains(el));
pruefe(inBaum, "das beobachtete Element steht im Kartenbaum");

console.log(fehler ? `\n${fehler} PRUEFUNG(EN) GESCHEITERT` : "\nKEINE FEHLER");
process.exit(fehler ? 1 : 0);
