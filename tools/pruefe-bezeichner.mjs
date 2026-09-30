/* ── FREIE BEZEICHNER IM BUNDLE (Audit 27.9.2026, Punkt A16) ─────────────────
   Zwei Render-Abstuerze standen unbemerkt im ausgelieferten Bundle: ein
   `profile`, das ResultBanner nie bekam, und ein `paintedById`, das
   CampaignScreen nie importierte. esbuild und vite melden so etwas nicht -
   ein unaufgeloester Name ist gueltiges JavaScript, der ReferenceError kommt
   erst beim Rendern, und nur, wenn eine Probe den Zweig faehrt.

   Dieses Werkzeug liest ein ES-Modul-Bundle (Standard: .uitest.mjs, das
   `npm run ui` baut - es enthaelt die ganze App) mit acorn, fuehrt eine
   Scope-Analyse (Hoisting, Bloecke, Klassen, Muster, catch) und meldet jeden
   Bezeichner, der weder deklariert noch ein Browser-/Node-Global ist.

   Aufruf:  npm run ui  (oder nur den esbuild-Teil davon), dann
            node tools/pruefe-bezeichner.mjs [bundle.mjs]
   Ausgang: 0 wenn nur bekannte Namen (Liste BEKANNT unten) uebrig sind,
            1 bei jedem anderen freien Namen - der ist mit hoher Wahr-
            scheinlichkeit ein Absturz der Klasse A3/A4.

   SEIT v1.89.9 IN `npm test` EINGEHAENGT, direkt hinter `npm run ui` - dort
   liegt der esbuild-Vorlauf, den die Probe braucht (.uitest.mjs). Sie gibt
   KEINE RESULT-Zeile aus, die Zaehlung der Kette (28 Suiten / 2078
   Pruefungen) bleibt also unveraendert; sie bricht die Kette nur, wenn ein
   unbekannter freier Name auftaucht.
   `Buffer`, `setImmediate` und `clearImmediate` stehen seit v1.89.9 in der
   Globals-Liste: es sind echte Node-Globals (gebuendelte Abhaengigkeiten
   nutzen sie), die Liste kannte sie nur nicht - `Buffer` allein liess die
   Probe scheitern.
   Bekannte Namen sind KEINE Fehler: `bundKrone` ist mit typeof geschuetzt,
   `__APP_VERSION__`/`__GG_VERSION__` setzt vite per define (im esbuild-
   Bundle fehlen sie, im Spiel nicht). */
import { readFileSync, existsSync } from "node:fs";
import * as acorn from "acorn";

const BUNDLE = process.argv[2] || ".uitest.mjs";
if (!existsSync(BUNDLE)) { console.error(`kein Bundle unter ${BUNDLE} - erst \`npm run ui\` (baut .uitest.mjs)`); process.exit(2); }
const BEKANNT = new Set(["bundKrone", "__APP_VERSION__", "__GG_VERSION__"]);
const src = readFileSync(BUNDLE, "utf8");
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "module" });
const BROWSER = new Set(`window document navigator location history localStorage sessionStorage indexedDB console setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame requestIdleCallback cancelIdleCallback fetch Request Response Headers URL URLSearchParams Blob File FileReader FormData WebSocket XMLHttpRequest Image Audio AudioContext webkitAudioContext OscillatorNode GainNode Event CustomEvent EventTarget MouseEvent KeyboardEvent TouchEvent PointerEvent HTMLElement HTMLImageElement HTMLCanvasElement Element Node Text DocumentFragment Range Selection getComputedStyle matchMedia screen devicePixelRatio innerWidth innerHeight scrollTo scrollBy alert confirm prompt open close postMessage MessageChannel MessagePort BroadcastChannel structuredClone queueMicrotask crypto performance Intl JSON Math Date Number String Boolean Object Array Function Symbol Map Set WeakMap WeakSet WeakRef Promise Proxy Reflect RegExp Error TypeError RangeError SyntaxError ReferenceError EvalError URIError AggregateError ArrayBuffer SharedArrayBuffer DataView Uint8Array Uint8ClampedArray Int8Array Uint16Array Int16Array Uint32Array Int32Array Float32Array Float64Array BigInt BigInt64Array BigUint64Array TextEncoder TextDecoder atob btoa encodeURIComponent decodeURIComponent encodeURI decodeURI escape unescape parseInt parseFloat isNaN isFinite NaN Infinity undefined globalThis self top parent frames Worker ServiceWorker ServiceWorkerRegistration Notification caches AbortController AbortSignal ResizeObserver IntersectionObserver MutationObserver PerformanceObserver DOMParser XMLSerializer CSS CSSStyleSheet FontFace ImageBitmap createImageBitmap OffscreenCanvas Path2D DOMMatrix DOMRect DOMPoint MediaQueryList SpeechSynthesisUtterance speechSynthesis TouchList Touch DragEvent ClipboardEvent ClipboardItem navigator visualViewport onerror onunhandledrejection reportError module require process Deno Bun global __dirname Buffer setImmediate clearImmediate eval arguments MessageEvent CloseEvent ErrorEvent PromiseRejectionEvent StorageEvent HashChangeEvent PopStateEvent PageTransitionEvent BeforeUnloadEvent Iterator AsyncIterator FinalizationRegistry Atomics WebAssembly import Vibration WakeLock TransitionEvent AnimationEvent SVGElement HTMLInputElement HTMLButtonElement HTMLVideoElement HTMLAudioElement HTMLMediaElement MediaSource MediaStream HTMLTextAreaElement HTMLSelectElement HTMLAnchorElement wheelEvent WheelEvent InputEvent FocusEvent UIEvent CompositionEvent ScreenOrientation Screen`.split(/\s+/));

// Scope-Analyse
const scopes = [];
const free = new Map();
function declare(name, scope) { scope.add(name); }
function push() { scopes.push(new Set()); }
function pop() { scopes.pop(); }
function resolved(name) { for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].has(name)) return true; return false; }

// 1. Hoisting: sammle Deklarationen je Funktions-/Block-Scope vorab
function collectPattern(p, scope) {
  if (!p) return;
  switch (p.type) {
    case "Identifier": declare(p.name, scope); break;
    case "ObjectPattern": for (const pr of p.properties) collectPattern(pr.type === "RestElement" ? pr.argument : pr.value, scope); break;
    case "ArrayPattern": for (const e of p.elements) collectPattern(e, scope); break;
    case "RestElement": collectPattern(p.argument, scope); break;
    case "AssignmentPattern": collectPattern(p.left, scope); break;
  }
}
function hoistInto(node, scope, isFn) {
  // var + function declarations hoisten in Funktions-Scope; let/const/class in Block
  const walk = (n, blockLevel) => {
    if (!n || typeof n.type !== "string") return;
    switch (n.type) {
      case "VariableDeclaration":
        if (n.kind === "var" ? isFn || blockLevel : blockLevel) for (const d of n.declarations) collectPattern(d.id, scope);
        break;
      case "FunctionDeclaration": if (blockLevel) declare(n.id.name, scope); return;
      case "ClassDeclaration": if (blockLevel) declare(n.id.name, scope); return;
      case "FunctionExpression": case "ArrowFunctionExpression": return;
    }
    // var-Hoisting durch verschachtelte Bloecke
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (k === "type" || k === "start" || k === "end") continue;
      if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && walkVar(c));
      else if (v && typeof v.type === "string") walkVar(v);
    }
    function walkVar(c) {
      if (c.type === "VariableDeclaration" && c.kind === "var" && isFn) for (const d of c.declarations) collectPattern(d.id, scope);
      if (["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression", "ClassDeclaration", "ClassExpression"].includes(c.type)) return;
      if (["BlockStatement", "SwitchStatement", "ForStatement", "ForInStatement", "ForOfStatement", "IfStatement", "TryStatement", "CatchClause", "WhileStatement", "DoWhileStatement", "LabeledStatement", "SwitchCase"].includes(c.type)) {
        for (const k of Object.keys(c)) { const v = c[k]; if (Array.isArray(v)) v.forEach((x) => x && typeof x.type === "string" && walkVar(x)); else if (v && typeof v.type === "string") walkVar(v); }
      }
    }
  };
  const body = node.body || [];
  for (const st of Array.isArray(body) ? body : [body]) walk(st, true);
}

function visit(n, parent, key) {
  if (!n || typeof n.type !== "string") return;
  switch (n.type) {
    case "Program": push(); hoistInto(n, scopes[scopes.length - 1], true); n.body.forEach((c) => visit(c, n)); pop(); return;
    case "ImportDeclaration": for (const s of n.specifiers) declare(s.local.name, scopes[0]); return;
    case "ExportNamedDeclaration": if (n.declaration) visit(n.declaration, n); return;
    case "ExportDefaultDeclaration": visit(n.declaration, n); return;
    case "FunctionDeclaration": case "FunctionExpression": case "ArrowFunctionExpression": {
      push(); const sc = scopes[scopes.length - 1];
      if (n.type === "FunctionExpression" && n.id) declare(n.id.name, sc);
      for (const p of n.params) collectPattern(p, sc);
      for (const p of n.params) visitPatternDefaults(p);
      if (n.body.type === "BlockStatement") { hoistInto(n.body, sc, true); n.body.body.forEach((c) => visit(c, n.body)); }
      else visit(n.body, n);
      pop(); return;
    }
    case "ClassDeclaration": case "ClassExpression":
      if (n.superClass) visit(n.superClass, n);
      push(); if (n.type === "ClassExpression" && n.id) declare(n.id.name, scopes[scopes.length - 1]);
      visit(n.body, n); pop(); return;
    case "BlockStatement": case "StaticBlock": push(); hoistInto(n, scopes[scopes.length - 1], false); n.body.forEach((c) => visit(c, n)); pop(); return;
    case "SwitchStatement": visit(n.discriminant, n); push(); { const sc = scopes[scopes.length - 1]; for (const c of n.cases) for (const st of c.consequent) { if (st.type === "VariableDeclaration" && st.kind !== "var") for (const d of st.declarations) collectPattern(d.id, sc); if (st.type === "FunctionDeclaration" || st.type === "ClassDeclaration") declare(st.id.name, sc); } }
      n.cases.forEach((c) => { if (c.test) visit(c.test, c); c.consequent.forEach((s) => visit(s, c)); }); pop(); return;
    case "ForStatement": case "ForInStatement": case "ForOfStatement": {
      push(); const sc = scopes[scopes.length - 1];
      const init = n.init || n.left;
      if (init && init.type === "VariableDeclaration") for (const d of init.declarations) collectPattern(d.id, sc);
      for (const k of ["init", "left", "right", "test", "update", "body"]) if (n[k]) visit(n[k], n);
      pop(); return;
    }
    case "CatchClause": push(); if (n.param) collectPattern(n.param, scopes[scopes.length - 1]); hoistInto(n.body, scopes[scopes.length - 1], false); n.body.body.forEach((c) => visit(c, n.body)); pop(); return;
    case "VariableDeclarator": visitPatternDefaults(n.id); if (n.init) visit(n.init, n); return;
    case "MemberExpression": visit(n.object, n); if (n.computed) visit(n.property, n); return;
    case "Property": if (n.computed) visit(n.key, n); if (n.value) { if (parent && parent.type === "ObjectPattern") visitPatternDefaults(n.value); else visit(n.value, n); } return;
    case "MethodDefinition": case "PropertyDefinition": if (n.computed) visit(n.key, n); if (n.value) visit(n.value, n); return;
    case "LabeledStatement": visit(n.body, n); return;
    case "BreakStatement": case "ContinueStatement": return;
    case "MetaProperty": return;
    case "Identifier":
      if (!resolved(n.name) && !BROWSER.has(n.name)) { const e = free.get(n.name) || []; e.push(n.start); free.set(n.name, e); }
      return;
    case "AssignmentExpression": if (n.left.type === "Identifier") { if (!resolved(n.left.name) && !BROWSER.has(n.left.name)) { const e = free.get(n.left.name) || []; e.push(n.start); free.set(n.left.name, e); } } else if (n.left.type.endsWith("Pattern")) visitPatternDefaults(n.left, true); else visit(n.left, n); visit(n.right, n); return;
  }
  for (const k of Object.keys(n)) {
    if (k === "type" || k === "start" || k === "end" || k === "loc") continue;
    const v = n[k];
    if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === "string" && visit(c, n, k));
    else if (v && typeof v.type === "string") visit(v, n, k);
  }
}
function visitPatternDefaults(p, assign = false) {
  if (!p) return;
  switch (p.type) {
    case "Identifier": if (assign) visit(p); break;
    case "ObjectPattern": for (const pr of p.properties) { if (pr.type === "RestElement") visitPatternDefaults(pr.argument, assign); else { if (pr.computed) visit(pr.key); visitPatternDefaults(pr.value, assign); } } break;
    case "ArrayPattern": for (const e of p.elements) visitPatternDefaults(e, assign); break;
    case "RestElement": visitPatternDefaults(p.argument, assign); break;
    case "AssignmentPattern": visitPatternDefaults(p.left, assign); visit(p.right); break;
    default: visit(p);
  }
}
visit(ast, null);
const lineOf = (pos) => src.slice(0, pos).split("\n").length;
let fremd = 0;
for (const [name, poss] of [...free.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const ctx = src.slice(Math.max(0, poss[0] - 50), poss[0] + 40).replace(/\n/g, " ");
  const bekannt = BEKANNT.has(name);
  if (!bekannt) fremd++;
  console.log(`${bekannt ? "  bekannt " : "  FREI    "}${name}\t${poss.length}x\tZeile ${lineOf(poss[0])}\t${ctx}`);
}
console.log(`--- ${free.size} freie Namen, davon ${fremd} unbekannt (${BUNDLE})`);
/* v1.90.18 (Audit A74): RESULT-Zeile wie jede Suite - eine Pruefung */
console.log(`RESULT pruefe-bezeichner: ${fremd ? 0 : 1} passed, ${fremd ? 1 : 0} failed`);
process.exit(fremd ? 1 : 0);
