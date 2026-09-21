// IM Fell English ist ausgezogen: die Erzaehlstimme spricht jetzt Cormorant
// Garamond (theme.js, DS1 §13) - die alte Antiqua war auf kleinen Schirmen
// schwer lesbar. Die Fontsource-Importe hier waeren doppelte Schriftlast.
import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GLOBAL_CSS } from "./ui/theme.js";
import { registerSW } from "virtual:pwa-register";

// ── SAFARI SAFETY NET: older iOS Safari (< 15.4) lacks structuredClone. One
// missing global would crash the whole app on those phones ("won't open").
// A tiny deep-clone fills the gap so every browser boots. ──
if (typeof globalThis.structuredClone !== "function") {
  globalThis.structuredClone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
}

// ── stay fresh without manual cache-clearing: check for a new build when the
// app opens, whenever the tab regains focus, and every 60s. registerType
// "autoUpdate" then swaps the service worker in and reloads the page ONCE —
// a fresh deploy reaches every phone the next time the game is looked at. ──
// no context menu anywhere (right-click / long-press "save image", "copy") —
// the whole app is a closed hall. The ONLY exception is fields the user types
// into, where the normal copy/paste menu must stay.
document.addEventListener("contextmenu", (e) => {
  const t = e.target;
  const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA"
    || t.isContentEditable || t.closest?.("input, textarea, [contenteditable]"));
  if (!editable) e.preventDefault();
});
// and no dragging pictures out of the app
document.addEventListener("dragstart", (e) => {
  const t = e.target;
  const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
  if (!editable) e.preventDefault();
});
// no text selection anywhere except in fields the user types into — this
// catches selection started by mouse drag or keyboard, belt-and-braces with CSS
document.addEventListener("selectstart", (e) => {
  const t = e.target;
  const editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA"
    || t.isContentEditable || t.closest?.("input, textarea, [contenteditable]"));
  if (!editable) e.preventDefault();
});
// every image that ever enters the DOM gets draggable=false + no long-press
// save sheet, so nothing can be pulled out or downloaded, even late-mounted art
const ggLockImg = (img) => { try { img.setAttribute("draggable", "false"); img.style.webkitUserDrag = "none"; img.style.userSelect = "none"; } catch {} };
try {
  for (const im of document.images) ggLockImg(im);
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.tagName === "IMG") ggLockImg(n);
      else if (n.querySelectorAll) { try { for (const im of n.querySelectorAll("img")) ggLockImg(im); } catch {} }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
} catch {}

// belt and braces for INSTALLED apps: the moment a new service worker takes
// control, reload exactly once — even if the plugin's own hook were missed
if ("serviceWorker" in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return; reloaded = true; window.location.reload();
  });
}
registerSW({
  immediate: true,
  onRegisteredSW(_url, r) {
    if (!r) return;
    // THE STUCK-UPDATE ESCAPE: we watched a fresh worker sit in `waiting`
    // forever on a live tab — reload after reload kept serving the old build
    // ("I refresh and nothing changes"). The generated sw has no SKIP_WAITING
    // listener, so messaging it is futile. When a worker is stuck waiting we
    // unregister ONCE and reload: the new sw.js registers fresh, activates
    // immediately (skipWaiting + clientsClaim) and takes over. A session flag
    // guards against reload loops.
    const kick = () => {
      if (!r.waiting || sessionStorage.getItem("gg-sw-kick")) return;
      sessionStorage.setItem("gg-sw-kick", "1");
      r.unregister().then(() => window.location.reload()).catch(() => {});
    };
    if (r.waiting) setTimeout(kick, 1500);     // stuck from a previous visit
    r.addEventListener("updatefound", () => {
      const w = r.installing;
      if (!w) return;
      w.addEventListener("statechange", () => {
        // freshly installed but not activating? give it a grace period, then kick
        if (w.state === "installed" && navigator.serviceWorker.controller) setTimeout(kick, 3000);
      });
    });
    const check = () => r.update().catch(() => {});
    check();                                   // once right away
    setInterval(check, 60_000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
    // installed PWAs often resume from the back-forward cache — visibility
    // events can be swallowed there, pageshow is the reliable hook
    window.addEventListener("pageshow", (e) => { if (e.persisted) check(); });
    window.addEventListener("focus", check);
  },
});

const style = document.createElement("style");
style.textContent = GLOBAL_CSS + `
  /* every image ARRIVES: pictures that still have to travel fade in with a
     soft rise; cached ones appear instantly (no flicker mid-battle). The
     fade NEVER hides an image for good — a safety timer always reveals it. */
  img[data-gg-loading] { opacity: 0; }
  /* v1.14.0 (Messbefund): "both" haelt die Deckung nach dem Einblenden
     dauerhaft auf 1 und ueberschreibt damit jede Inline-Deckung. Die
     Kulissen im Bundfenster und auf den Kacheln sollen gedaempft liegen
     (42 %) und lagen deshalb bei 100 % - gemessen im lebenden DOM. Bilder,
     die ihre eigene Deckung tragen, nehmen sich mit data-gg-still heraus. */
  img[data-gg-loaded]:not([data-gg-still]) { animation: ggImgIn .45s ease both; }
  @keyframes ggImgIn { from { opacity: 0; transform: scale(.985); } to { opacity: 1; transform: none; } }
  /* v0.80: der Riss-Stern eines Fernangriffs - schnell aufbersten, lange
     nachglimmen, mit leichter Drehung im Verloeschen. */
  /* v0.82: solange ein Blatt (Popup) offen ist, weicht das Installations-
     Banner - sonst liegt es ueber dem Blattkopf. */
  html[data-gg-popup="1"] .gg-install-banner { display: none !important; }
  /* v0.98: die langsame Fahrt ueber das Kapitelbild - kaum merklich, aber
     genug, damit das Bild lebt statt zu stehen. */
  /* v1.0.2: die Regler tragen die Hausfarbe - violette Bahn, violette Kugel. */
  .gg-regler { -webkit-appearance: none; appearance: none; height: 26px; background: transparent; }
  /* v1.0.94 (Besitzer: "wenn ich ganz links bin, moechte ich nur eine Kontur
     sehen und keinen ausgefuellten Balken - es sollte wie ein Fuellstand
     sein"): DIE SCHIENE IST JETZT EIN FUELLSTAND. Sie war immer voll violett,
     egal wo der Griff stand - bei 0 sah man einen vollen Balken und keinen
     leeren. Der Anteil kommt aus --gg-fuell, das ProfileScreen je Regler
     setzt; links davon Farbe, rechts nur eine Kontur. */
  .gg-regler::-webkit-slider-runnable-track { height: 6px; border-radius: 99px;
    border: 1px solid rgba(167,139,250,.42);
    background: linear-gradient(90deg, #7c3aed 0%, #a78bfa var(--gg-fuell, 0%), rgba(167,139,250,.10) var(--gg-fuell, 0%), rgba(167,139,250,.10) 100%); }
  .gg-regler::-moz-range-track { height: 6px; border-radius: 99px;
    border: 1px solid rgba(167,139,250,.42);
    background: linear-gradient(90deg, #7c3aed 0%, #a78bfa var(--gg-fuell, 0%), rgba(167,139,250,.10) var(--gg-fuell, 0%), rgba(167,139,250,.10) 100%); }
  .gg-regler::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; margin-top: -7px;
    border-radius: 50%; background: radial-gradient(circle at 35% 30%, #e9defd, #a78bfa 60%, #6d28d9);
    /* v1.0.94: die goldene/helle Aussenkontur am Griff ist fort - der
       Besitzer wollte nur EINE Kontur, nicht zwei uebereinander. */
    border: none; box-shadow: 0 0 8px rgba(139,92,246,.55); cursor: pointer; }
  .gg-regler::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #e9defd, #a78bfa 60%, #6d28d9);
    /* v1.0.94: die goldene/helle Aussenkontur am Griff ist fort - der
       Besitzer wollte nur EINE Kontur, nicht zwei uebereinander. */
    border: none; box-shadow: 0 0 8px rgba(139,92,246,.55); cursor: pointer; }
  @keyframes ggKenBurns {
    from { transform: scale(1.06) translate3d(-1.2%, 1%, 0); }
    to   { transform: scale(1.16) translate3d(1.2%, -1.4%, 0); }
  }
  /* v1.0.3: die QUERFAHRT des Kapitel-Einstiegs. Start und Ziel kommen als
     gemessene Pixel aus dem Intro (CSS-Variablen), der Zoom bleibt bei
     1,07 - genug Leben, keine Unschaerfe. */
  @keyframes ggKenBurnsFahrt {
    from { transform: translate3d(var(--kbVon, 0px), 0.6%, 0) scale(1.0); }
    to   { transform: translate3d(var(--kbBis, 0px), -0.6%, 0) scale(1.07); }
  }
  @media (prefers-reduced-motion: reduce) {
    @keyframes ggKenBurns { from,to { transform: scale(1.06); } }
    @keyframes ggKenBurnsFahrt { from,to { transform: translate3d(calc((var(--kbVon,0px) + var(--kbBis,0px)) / 2), 0, 0) scale(1.03); } }
  }
  /* v1.30.0: das Zeichen einer Monsterfaehigkeit steigt ueber dem Feld auf und
     verblasst - nur opacity und transform, keine Layoutarbeit */
  /* v1.31.0: das Schreckfeld atmet - nur opacity */
  @keyframes ggSchreckAtmet { 0%, 100% { opacity: .75; } 50% { opacity: 1; } }
  @keyframes ggZeichenEin { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
  @keyframes ggZeichenSteigt { 0% { opacity: 0; transform: translate(-50%, -30%) scale(.85); }
    18% { opacity: 1; transform: translate(-50%, -60%) scale(1.05); }
    70% { opacity: 1; transform: translate(-50%, -95%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -125%) scale(1); } }
  @keyframes ggRissStern {
    0%   { opacity: 0; transform: scale(.22) rotate(-14deg); }
    7%   { opacity: 1; transform: scale(1.22) rotate(0deg); }
    16%  { opacity: .96; transform: scale(.92) rotate(4deg); }
    55%  { opacity: .5; transform: scale(1.0) rotate(10deg); }
    100% { opacity: 0; transform: scale(1.08) rotate(16deg); }
  }
`;
document.head.appendChild(style);

// tag every <img> the moment it enters the DOM: still loading → gently hidden
// until its load/error fires. Every step is guarded so a quirk on ANY browser
// (Safari included) can never stop the app from booting.
const ggMarkImg = (img) => {
  try {
    if (img.dataset.ggLoaded != null || img.dataset.ggLoading != null) return;
    if (img.complete && img.naturalWidth > 0) return; // cached: show instantly, no dance
    img.dataset.ggLoading = "";
    const done = () => { try { delete img.dataset.ggLoading; img.dataset.ggLoaded = ""; } catch {} };
    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", done, { once: true }); // broken images must never stay invisible
    setTimeout(done, 4000); // hard safety net: reveal no matter what
  } catch {}
};
try {
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) {
      if (n.nodeType !== 1) continue;
      if (n.tagName === "IMG") ggMarkImg(n);
      else if (n.querySelectorAll) { try { for (const im of n.querySelectorAll("img")) ggMarkImg(im); } catch {} }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });
} catch {}

// THE BLACK BOX: every runtime error lands in a small ring buffer so the admin
// can read what went wrong — no e-mail, no server, just the device's own log
// (surfaced in the Admin area). Every storage touch is guarded.
const ERRLOG = "gg_errlog";
const logErr = (kind, msg, stack) => {
  try {
    const list = JSON.parse(localStorage.getItem(ERRLOG) || "[]");
    list.push({ t: new Date().toISOString(), kind, msg: String(msg).slice(0, 300), stack: String(stack || "").slice(0, 600),
      ua: navigator.userAgent.slice(0, 160), ver: (typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "?"), url: location.pathname });
    localStorage.setItem(ERRLOG, JSON.stringify(list.slice(-25)));
  } catch {}
};
try {
  window.addEventListener("error", (e) => logErr("error", e.message || e.error, e.error?.stack));
  window.addEventListener("unhandledrejection", (e) => logErr("promise", e.reason?.message || e.reason, e.reason?.stack));
} catch {}

// Last line of defense: a runtime crash shows a readable card instead of a
// silent white screen (the #gg-boot note only covers the very first load).
class Boundary extends Component {
  constructor(p) { super(p); this.state = { err: null, sent: false }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) {
    logErr("crash", err?.message || err, err?.stack);
    // file it into the app's own black box so the admin can read it later
    import("../meta/index.js").then((m) => m.fileReport({ err })).catch(() => {});
  }
  render() {
    if (!this.state.err) return this.props.children;
    const ghost = { fontFamily: "inherit", fontWeight: 700, fontSize: 13, padding: "9px 16px", borderRadius: 10,
      border: "1px solid #3a4258", background: "transparent", color: "#aab2c8", cursor: "pointer" };
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0c111e",
        color: "#e8e4d8", fontFamily: "Georgia, serif", padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 380 }}>
          <div style={{ fontSize: 20, letterSpacing: 3, color: "#c9a45c" }}>GRAND GAMBIT</div>
          <div style={{ fontSize: 13.5, color: "#8b90a3", margin: "10px 0 16px", lineHeight: 1.5 }}>
            Da ist etwas schiefgelaufen. Dein Spielstand ist sicher — einmal neu laden hilft meistens.
            Der Fehler wurde automatisch vermerkt und hilft uns, die Ursache zu finden.</div>
          <button onClick={() => location.reload()} style={{ fontFamily: "inherit", fontWeight: 700, fontSize: 14,
            padding: "10px 22px", borderRadius: 10, border: "1px solid #c9a45c", background: "#c9a45c",
            color: "#17110a", cursor: "pointer" }}>Neu laden</button>
          <div style={{ fontSize: 10.5, color: "#5b617a", marginTop: 14, wordBreak: "break-all" }}>
            {String(this.state.err?.message || this.state.err)}</div>
        </div>
      </div>
    );
  }
}

import Vorlader from "./ui/Vorlader.jsx";   /* v1.0.12: Erstlade-Schirm */
createRoot(document.getElementById("root")).render(
  <StrictMode><Boundary>
    <App />
    <Vorlader />
  </Boundary></StrictMode>
);
