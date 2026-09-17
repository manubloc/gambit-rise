/* Baut aus entwurf_blatt.html ein eigenstaendiges Blatt (Bilder und Schriften
   eingebettet) und rendert es im echten Chromium. Nur ein Entwurfswerkzeug -
   kein Spielcode. */
import fs from "node:fs";
import path from "node:path";
const b64 = (p, typ) => `data:${typ};base64,${fs.readFileSync(p).toString("base64")}`;

const FAM = {
  schritt: ["#123c2a", "#0a2418", "#6fe0a8", "#c8f5dd"],
  sprung: ["#12314e", "#0a1d30", "#6fc2f0", "#cfeaff"],
  schlag: ["#4a1420", "#2c0a12", "#f07a8a", "#ffd9de"],
  riss: ["#321a5e", "#1d0e3a", "#a78bfa", "#e6dcff"],
  leben: ["#0f3d33", "#08241e", "#5ad4b0", "#c8f7e8"],
};
let nr = 0;
/* Dasselbe Medaillon wie AbilityIcon: runder Grund im Farbton, EIN duenner
   Ring, das Zeichen in hellem Strich. */
const zeichen = (fam, inner, size = 22, gefuellt = false) => {
  const [grund, tief, ring, strich] = FAM[fam]; const id = "z" + (++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto">
    <defs><radialGradient id="${id}" cx="50%" cy="32%" r="75%">
      <stop offset="0%" stop-color="${grund}"/><stop offset="100%" stop-color="${tief}"/></radialGradient></defs>
    <circle cx="12" cy="12" r="11" fill="url(#${id})"/>
    <circle cx="12" cy="12" r="11" fill="none" stroke="${ring}" stroke-width="1" opacity=".85"/>
    <g fill="${gefuellt ? strich : "none"}" stroke="${strich}" stroke-width="${gefuellt ? 0.9 : 1.5}"
       stroke-linecap="round" stroke-linejoin="round" color="${strich}">${inner}</g></svg>`;
};

/* ── die fuenf Springer-Faehigkeiten, Pfade aus AbilityIcons.jsx ───────── */
const AB = {
  longleap: ["sprung", `<path d="M5 16c2-7 12-7 14 0"/><path d="M16.6 13.4L19 16l-3.4.6"/><path d="M8 17h1M11 17h1"/>`],
  outrider: ["schritt", `<path d="M7 17l4-4 2 2 4-6"/><path d="M14 9h3v3"/>`],
  teleport: ["riss", `<circle cx="8" cy="12" r="2.6"/><circle cx="16.5" cy="9" r="1.7" opacity=".7"/><path d="M11 11l3-1.4" stroke-dasharray="1.6 1.8"/>`],
  lifesteal: ["leben", `<path d="M12 17c-3-2.4-5.5-4.4-5.5-7A3 3 0 0 1 12 8a3 3 0 0 1 5.5 2c0 2.6-2.5 4.6-5.5 7z"/><path d="M15.5 5.5L18 3" opacity=".8"/>`],
  bulwark: ["leben", `<path d="M12 5l6 2v5c0 4-2.6 6-6 7-3.4-1-6-3-6-7V7z"/><path d="M12 8v7" opacity=".7"/>`],
  geleit: ["sprung", `<path d="M7 9h10"/><path d="M14 6l3 3-3 3"/><path d="M17 15H7"/><path d="M10 12l-3 3 3 3"/>`],
};

/* ── DIE ZWEI NEUEN WERTZEICHEN ────────────────────────────────────────────
   Besitzer: "Vielleicht erfindest du einfach auch Symbole dafuer ... fuer
   Angriffsstaerke und fuer Herz, halt fuer HP" - in derselben Sprache wie die
   Faehigkeiten. Gleicher Bau (runder Grund, ein duenner Ring), gleiche
   Familienfarben: die KLINGE in Schlag-Rot, das HERZ in Leben-Gruen.
   Unterschied mit Absicht: ein Wert ist GEFUELLT, eine Faehigkeit ist
   gestrichelt gezeichnet - so verwechselt man das Herz des Lebenswerts nie
   mit dem Herz des Lebensraubs. */
/* GEMESSEN AM BILD: bei 26 px war die erste Klinge ein Stecknadelkopf - das
   Zeichen muss den Kreis fuellen wie die Faehigkeitszeichen es tun. */
const KLINGE = `<path d="M12 2.8l2.2 5.6v5.8H9.8V8.4z"/><path d="M7.2 14.2h9.6v1.7H7.2z"/><path d="M11 15.9h2v3.3h-2z"/><circle cx="12" cy="20.3" r="1.4"/>`;
const HERZ = `<path d="M12 20.2c-4.2-3.3-7.4-5.9-7.4-9.4A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.4c0 3.5-3.2 6.1-7.4 9.4z"/>`;

/* ── das Zugbild des Springers, 7x7 ───────────────────────────────────── */
const springerFelder = new Set(["1,2", "2,1", "2,-1", "1,-2", "-1,-2", "-2,-1", "-2,1", "-1,2"]);
const zugbild = (extraFarbe = null) => {
  let s = "";
  for (let r = 3; r >= -3; r--) for (let f = -3; f <= 3; f++) {
    const ich = f === 0 && r === 0;
    const sprung = springerFelder.has(`${f},${r}`);
    /* Blatt B hat Weitsprung und Vorreiter gelernt - die Zusatzfelder in der
       Farbe ihrer Faehigkeit, wie MoveDiagram es mit talentFarbe() macht. */
    const weit = extraFarbe && (Math.abs(f) + Math.abs(r) === 4) && Math.abs(f) !== Math.abs(r) && !sprung;
    const diag = extraFarbe && Math.abs(f) === 2 && Math.abs(r) === 2;
    const hell = (f + r + 100) % 2 === 0;
    const klasse = ich ? "z-ich" : sprung ? "z-sprung" : hell ? "z-hell" : "z-dunkel";
    const stil = weit ? ' style="background:#6fc2f0d0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)"'
      : diag ? ' style="background:#6fe0a8d0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)"' : "";
    s += `<i class="${klasse}"${stil}></i>`;
  }
  return s;
};

/* ── die Eckverzierung, genau wie in v1.23.4 auf der Kachel ────────────── */
const eckSvg = () => `<svg viewBox="0 0 16 16" width="14" height="14">
  <path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width="0.85" stroke-linecap="round"/>
  <path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/>
  <path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/>
  <circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = ["ol", "or", "ur", "ul"].map((w) => `<div class="ecke ${w}">${eckSvg()}</div>`).join("");

/* ── DREI FASSUNGEN DES ANGRIFFSZEICHENS ──────────────────────────────────
   Gemessen am gerenderten Blatt: die erste Klinge las sich bei 26 px wie ein
   Stoepsel - Blatt zu breit, Griff zu kurz. Deshalb drei Fassungen zur Wahl,
   statt eine zu setzen und zu hoffen. */
const ANGRIFF_WAHL = {
  "K1 · Schwert aufrecht": `<path d="M12 2.6c.9 1.6 1.4 3.4 1.4 5.2v6.2h-2.8V7.8c0-1.8.5-3.6 1.4-5.2z"/><path d="M6.8 14.5h10.4v1.7H6.8z"/><path d="M11.1 16.2h1.8v3h-1.8z"/><circle cx="12" cy="20.3" r="1.3"/>`,
  "K2 · Klinge schräg": `<g transform="translate(12 12) scale(.78) translate(-12 -12)"><path d="M20.2 3.2l-.9 4.3-7.7 7.7-1.7-1.7 7.7-7.7z"/><path d="M9.6 13.9l2.4 2.4-1.3 1.3-2.4-2.4z"/><path d="M7.3 17.1l1.7 1.7-2.6 2.2-1.3-1.3z"/></g>`,
  "K3 · zwei Klingen": `<g transform="translate(12 12) scale(.84) translate(-12 -12)"><path d="M4.6 4.6l1.2-.2 9.4 9.4-1 1zM19.4 4.6l-1.2-.2-9.4 9.4 1 1z"/><path d="M14.4 15.2l1.6-1.6 3.4 3.4-1.6 1.6zM9.6 15.2L8 13.6l-3.4 3.4 1.6 1.6z"/></g>`,
};
const HERZ_WAHL = {
  "H1 · voll": HERZ,
  "H2 · voll mit Ader": HERZ + `<path d="M12 11.2v6.4" stroke="#0f3d33" stroke-width="1.1" fill="none" opacity=".55"/>`,
};
const wahlFeld = (name, inner, fam) => `<div style="display:flex;align-items:center;gap:12px;padding:9px 13px;border-radius:12px;background:rgba(16,11,30,.7);border:1px solid var(--linie)">
  ${zeichen(fam, inner, 26, true)}${zeichen(fam, inner, 78, true)}
  <div style="font:600 11px/1.3 Georgia,serif;letter-spacing:.06em;color:#cbbf9a">${name}</div></div>`;
const wahl = [...Object.entries(ANGRIFF_WAHL).map(([n, g]) => wahlFeld(n, g, "schlag")),
              ...Object.entries(HERZ_WAHL).map(([n, g]) => wahlFeld(n, g, "leben"))].join("");

let html = fs.readFileSync("entwurf_blatt.html", "utf8");
html = html
  .replaceAll("FONT_CORM_I", b64("public/fonts/cormorant-500i.woff2", "font/woff2"))
  .replaceAll("FONT_CORM", b64("public/fonts/cormorant-600.woff2", "font/woff2"))
  .replaceAll("FONT_CINZ", b64("public/fonts/cinzel-600.woff2", "font/woff2"))
  .replaceAll("KULISSE", b64("src/app/ui/assets/kulissen/bund-geleit.webp", "image/webp"))
  .replaceAll("LAEUFER", b64("src/app/ui/assets/painted/painted-bishop.webp", "image/webp"))
  .replaceAll("TURM", b64("src/app/ui/assets/painted/painted-rook.webp", "image/webp"))
  .replaceAll("FIGUR", b64("src/app/ui/assets/painted/painted-knight.webp", "image/webp"))
  .replaceAll("ZUGBILD9", zugbild("ja"))
  .replaceAll("ZUGBILD", zugbild())
  .replaceAll("SPROSSEN10", Array.from({ length: 10 }, () => '<i class="voll"></i>').join(""))
  .replaceAll("ECKEN", ecken)
  .replaceAll("WAHL", wahl)
  .replaceAll("GL_herz", `<svg width="13" height="13" viewBox="0 0 24 24" style="display:block"><path d="${"M12 20.2c-4.2-3.3-7.4-5.9-7.4-9.4A4.1 4.1 0 0 1 12 8.4a4.1 4.1 0 0 1 7.4 2.4c0 3.5-3.2 6.1-7.4 9.4z"}" fill="#5ad4b0"/></svg>`)
  .replaceAll("IC_angriff", zeichen("schlag", KLINGE, 26, true))
  .replaceAll("IC_leben", zeichen("leben", HERZ, 26, true));
for (const [k, [fam, g]] of Object.entries(AB)) {
  while (html.includes("IC_" + k)) html = html.replace("IC_" + k, zeichen(fam, g, 22));
}
fs.writeFileSync("/mnt/user-data/outputs/entwurf-figurenblatt.html", html);

/* rendern */
const { chromium } = await import("playwright-core");
const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const ctx = await browser.newContext({ viewport: { width: 860, height: 1400 }, deviceScaleFactor: 2.5 });
const page = await ctx.newPage();
await page.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-figurenblatt.html"), { waitUntil: "load" });
await page.waitForTimeout(700);
const h = await page.evaluate(() => document.body.scrollHeight);
await page.setViewportSize({ width: 860, height: Math.min(h + 20, 4000) });
await page.waitForTimeout(300);
await page.screenshot({ path: "/mnt/user-data/outputs/entwurf-figurenblatt.png", fullPage: true });
/* gemessen: passt die rechte Spalte wirklich auf die Hoehe der Figur? */
const mass = await page.evaluate(() => [...document.querySelectorAll(".reihe")].map((r) => {
  const f = r.querySelector(".figurplatz").getBoundingClientRect();
  const c = r.querySelector(".rechts").getBoundingClientRect();
  const b = r.closest(".buehne").getBoundingClientRect();
  return { figur: Math.round(f.height), rechts: Math.round(c.height), breiteInnen: Math.round(b.width),
    gleicheUnterkante: Math.abs(f.bottom - c.bottom) < 1 };
}));
console.log("gemessen:", JSON.stringify(mass));
await browser.close();
