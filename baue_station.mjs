/* Entwurfswerkzeug fuer das Stationsfenster - kein Spielcode. Nutzt dieselben
   Zeichen wie baue_entwurf.mjs, damit beide Blaetter dieselbe Sprache sprechen. */
import fs from "node:fs";
import path from "node:path";
const b64 = (p, typ) => `data:${typ};base64,${fs.readFileSync(p).toString("base64")}`;
const FAM = {
  schritt: ["#123c2a", "#0a2418", "#6fe0a8", "#c8f5dd"], sprung: ["#12314e", "#0a1d30", "#6fc2f0", "#cfeaff"],
  schlag: ["#4a1420", "#2c0a12", "#f07a8a", "#ffd9de"], geschoss: ["#4a3410", "#2c1e08", "#eec06a", "#ffedc4"],
  riss: ["#321a5e", "#1d0e3a", "#a78bfa", "#e6dcff"], leben: ["#0f3d33", "#08241e", "#5ad4b0", "#c8f7e8"],
  krone: ["#4a3a10", "#2c2208", "#f0d68a", "#fff3cf"],
};
let nr = 0;
const zeichen = (fam, inner, size = 22, gefuellt = false) => {
  const [grund, tief, ring, strich] = FAM[fam]; const id = "s" + (++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto">
    <defs><radialGradient id="${id}" cx="50%" cy="32%" r="75%"><stop offset="0%" stop-color="${grund}"/><stop offset="100%" stop-color="${tief}"/></radialGradient></defs>
    <circle cx="12" cy="12" r="11" fill="url(#${id})"/><circle cx="12" cy="12" r="11" fill="none" stroke="${ring}" stroke-width="1" opacity=".85"/>
    <g fill="${gefuellt ? strich : "none"}" stroke="${strich}" stroke-width="${gefuellt ? 0.9 : 1.5}" stroke-linecap="round" stroke-linejoin="round" color="${strich}">${inner}</g></svg>`;
};
const KLINGE = `<path d="M12 2.8l2.2 5.6v5.8H9.8V8.4z"/><path d="M7.2 14.2h9.6v1.7H7.2z"/><path d="M11 15.9h2v3.3h-2z"/><circle cx="12" cy="20.3" r="1.4"/>`;
const HERZ = `<path d="M12 20.2c-4.2-3.3-7.4-5.9-7.4-9.4A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.4c0 3.5-3.2 6.1-7.4 9.4z"/>`;
const AB = {
  pull: ["geschoss", `<path d="M6 6l7 7"/><path d="M13 13c2 2 4 2 5 .5s0-3.5-2-3"/><path d="M6 6v3M6 6h3"/>`],
  blast: ["schlag", `<circle cx="12" cy="12" r="2.4"/><path d="M12 5v2.4M12 16.6V19M5 12h2.4M16.6 12H19M7 7l1.7 1.7M17 7l-1.7 1.7M7 17l1.7-1.7M17 17l-1.7-1.7"/>`],
  chain: ["schlag", `<path d="M6 7l4 3-2 3 5 2-1 4" transform="translate(1 -1)"/><path d="M13 18l-1.6-1 .3-1.9"/>`],
  bulwark: ["leben", `<path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z"/><path d="M12 8v7" opacity=".7"/>`],
};
/* ── Marken fuer Brett, Regelwerk, Haerte und Lohn ────────────────────────
   Bewusst KEINE runden Medaillons: die Kreise gehoeren den Faehigkeiten und
   den Werten. Was die Partie beschreibt, traegt ein schlichtes Strichzeichen
   in der Marke - gleiche Handschrift, andere Rolle. */
const strich = (d, farbe, size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${farbe}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:0 0 auto">${d}</svg>`;
const MK = {
  brett: strich(`<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h16M12 4v16"/><path d="M4 4h4v4H4zM12 12h4v4h-4z" fill="${"currentColor"}" opacity=".5"/>`, "#cfc9b4"),
  regel: strich(`<path d="M7 20V9l5-5 5 5v11"/><path d="M7 20h10"/><path d="M10 20v-5h4v5"/>`, "#cfc9b4"),
  hart: strich(`<path d="M12 4l7 3v5c0 5-3 7.5-7 8.5C8 19.5 5 17 5 12V7z"/><path d="M12 9v4"/><circle cx="12" cy="15.6" r=".9" fill="#ffd9de" stroke="none"/>`, "#f07a8a"),
  xp: strich(`<path d="M12 4l2.3 5.1 5.7.6-4.3 3.8 1.2 5.5L12 16.2 7.1 19l1.2-5.5L4 9.7l5.7-.6z"/>`, "#e9cf8a"),
  gold: strich(`<ellipse cx="12" cy="8" rx="7" ry="3"/><path d="M5 8v8c0 1.7 3.1 3 7 3s7-1.3 7-3V8"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/>`, "#e9cf8a"),
};
const eckSvg = () => `<svg viewBox="0 0 16 16" width="10" height="10">
  <path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/>
  <path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/>
  <circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = ["ol", "or", "ur", "ul"].map((w) => `<div class="ecke ${w}">${eckSvg()}</div>`).join("");

let html = fs.readFileSync("entwurf_station.html", "utf8");
html = html
  .replaceAll("FONT_CORM_I", b64("public/fonts/cormorant-500i.woff2", "font/woff2"))
  .replaceAll("FONT_CORM", b64("public/fonts/cormorant-600.woff2", "font/woff2"))
  .replaceAll("KUL_richter", b64("src/app/ui/assets/kulissen/meister-richter.webp", "image/webp"))
  .replaceAll("KUL_gesindel", b64("src/app/ui/assets/kulissen/monster-gesindel.webp", "image/webp"))
  .replaceAll("FIG_richter", b64("src/app/ui/assets/painted/painted-boss-b12.webp", "image/webp"))
  .replaceAll("FIG_gegner", b64("src/app/ui/assets/painted/painted-boss-b02.webp", "image/webp"))
  .replaceAll("ECKEN", ecken)
  .replaceAll("IC_angriff", zeichen("schlag", KLINGE, 22, true))
  .replaceAll("IC_leben", zeichen("leben", HERZ, 22, true));
for (const [k, v] of Object.entries(MK)) html = html.replaceAll("MK_" + k, v);
for (const [k, [fam, g]] of Object.entries(AB)) {
  while (html.includes("IC_" + k)) html = html.replace("IC_" + k, zeichen(fam, g, 20));
}
fs.writeFileSync("/mnt/user-data/outputs/entwurf-stationsfenster.html", html);

const { chromium } = await import("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 840, height: 1100 }, deviceScaleFactor: 2.5 });
const page = await ctx.newPage();
await page.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-stationsfenster.html"), { waitUntil: "load" });
await page.waitForTimeout(600);
await page.screenshot({ path: "/mnt/user-data/outputs/entwurf-stationsfenster.png", fullPage: true });
const m = await page.evaluate(() => [...document.querySelectorAll(".blatt")].map((b) => Math.round(b.getBoundingClientRect().height)));
console.log("Blatthoehen:", JSON.stringify(m));
await browser.close();
