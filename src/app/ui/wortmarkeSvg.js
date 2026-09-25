/* ═══ DIE WORTMARKE AUS EINER QUELLE (v1.63.0) ══════════════════════════════
   Besitzer (25.9., mit Vorlagebild): "genau das ist das Logo, das ich formen
   moechte ... Rise mit einem Blitz im Hintergrund, der auch hinter das GAMBIT
   geht ... vielleicht sogar animiert ... es ist wichtig, dass es eine
   statische Form gibt und natuerlich eine animierte Form."
   Dieses Modul erzeugt das SVG als Zeichenkette. Die App zeigt es an
   (WortmarkeRise), tools/wortmarke-einsetzen.mjs schreibt dieselbe Fassung in
   den festen Ladeschirm (index.html) und die Landingpage - drei Stellen, eine
   Quelle. Ohne Schriften im SVG selbst: Cinzel, Great Vibes und Cormorant
   laedt die jeweilige Seite.
     animiert: der Blitz zuckt beim Erscheinen ein und flackert danach in
               Abstaenden; Rise glimmt, der Stern funkelt.
     blitz:    Rise erscheint mit einem hellen Aufleuchten (Ladeschirme).
     statisch: alles steht still - fuer Store-Grafiken und Druck. */

// DER BLITZ wird erzeugt, nicht gezeichnet: Mittelpunktverschiebung - die
// Strecke wird wiederholt halbiert und die Mitte quer zur Richtung zufaellig
// versetzt, mit jeder Stufe feiner. So entstehen viele kleine, unregelmaessige
// Knicke wie bei einem echten Blitz. Fester Startwert: ueberall derselbe.
function zufall(saat) { let a = saat >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function strecke(x1, y1, x2, y2, versatz, stufen, r) {
  let pts = [[x1, y1], [x2, y2]];
  for (let s = 0; s < stufen; s++) {
    const neu = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1;
      const v = (r() * 2 - 1) * versatz;
      neu.push([(ax + bx) / 2 - (dy / l) * v, (ay + by) / 2 + (dx / l) * v], pts[i]);
    }
    pts = neu; versatz *= 0.52;
  }
  return pts;
}
const pfad = (pts) => "M " + pts.map(([x, y]) => x.toFixed(1) + " " + y.toFixed(1)).join(" L ");
const R = zufall(20260925);
const HAUPT = strecke(636, 196, 0, -40, 40, 7, R);   // mitten durch GAMBIT, hinter Rise hindurch
const STRAHL = pfad(HAUPT);
// Aeste: an einigen Punkten des Hauptstrahls, schraeg abzweigend, kuerzer
const AESTE = [0.12, 0.27, 0.41, 0.55, 0.7, 0.83].map((t, k) => {
  const [x, y] = HAUPT[Math.floor(t * (HAUPT.length - 1))];
  const winkel = (k % 2 ? 1 : -1) * (0.32 + R() * 0.34) + Math.atan2(-40 - 196, 0 - 636);   // nah an der Hauptrichtung
  const laenge = 45 + R() * 60;
  return pfad(strecke(x, y, x + Math.cos(winkel) * laenge, y + Math.sin(winkel) * laenge, 16, 5, R));
});
const STERN = "M0,-16 C2,-4 4,-2 16,0 C4,2 2,4 0,16 C-2,4 -4,2 -16,0 C-4,-2 -2,-4 0,-16Z";

export const WORTMARKE_KEYFRAMES =
  "@keyframes ggRiseBlitz { 0% { opacity: 0; filter: brightness(1); } 7% { opacity: 1; filter: brightness(3.4) drop-shadow(0 0 14px #fff); } 16% { filter: brightness(1.3); } 23% { filter: brightness(2.6) drop-shadow(0 0 10px #f4eaff); } 40% { filter: brightness(1.05); } 100% { opacity: 1; filter: brightness(1); } }\n" +
  "@keyframes ggRiseGlimm { 0%,100% { filter: brightness(1) drop-shadow(0 0 0 rgba(0,0,0,0)); } 50% { filter: brightness(1.18) drop-shadow(0 0 8px rgba(167,139,250,.55)); } }\n" +
  "@keyframes ggSternFunkeln { 0%,62%,100% { transform: scale(.72) rotate(0deg); opacity: .75; } 70% { transform: scale(1.25) rotate(20deg); opacity: 1; } 78% { transform: scale(.85) rotate(35deg); opacity: .9; } 84% { transform: scale(1.12) rotate(45deg); opacity: 1; } }\n" +
  "@keyframes ggWmZug { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }\n" +
  "@keyframes ggWmFlacker { 0%,58%,100% { opacity: 1; } 60% { opacity: .25; } 62% { opacity: 1; } 64% { opacity: .5; } 67% { opacity: 1; } }\n" +
  "@keyframes ggWmSchein { 0%,58%,100% { opacity: .85; } 60% { opacity: .3; } 62% { opacity: 1; } 67% { opacity: .9; } }\n" +
  "@media (prefers-reduced-motion: reduce) { .gg-wm * { animation: none !important; opacity: 1 !important; } }";

export function wortmarkeSvg({ id = "wm", breite = "100%", animiert = true, blitz = false, verzug = 0 } = {}) {
  const g = (n) => `${id}-${n}`;
  const an = (s) => (animiert ? s : "");
  const zug = (dauer, vz) => an(`stroke-dasharray:1;stroke-dashoffset:1;animation:ggWmZug ${dauer}s cubic-bezier(.2,.8,.2,1) ${vz}s forwards;`);
  const strahl = (d, breiteStrich, farbe, extra = "") =>
    `<path d="${d}" pathLength="1" fill="none" stroke="${farbe}" stroke-width="${breiteStrich}" stroke-linecap="round" stroke-linejoin="round" style="${zug(0.42, verzug)}${extra}"/>`;
  const aeste = (b, f, extra = "") => AESTE.map((d, i) =>
    `<path d="${d}" pathLength="1" fill="none" stroke="${f}" stroke-width="${b}" stroke-linecap="round" stroke-linejoin="round" style="${zug(0.3, verzug + 0.18 + i * 0.03)}${extra}"/>`).join("");
  const riseAuf = blitz ? `opacity:0;animation:ggRiseBlitz .95s ease-out ${verzug + 0.2}s forwards` : "";
  return `<svg class="gg-wm" viewBox="0 0 640 250" width="${breite}" style="display:block;overflow:visible" role="img" aria-label="Gambit Rise">
<defs>
<linearGradient id="${g("gold")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff3cf"/><stop offset="38%" stop-color="#f2d98c"/><stop offset="62%" stop-color="#d4af37"/><stop offset="100%" stop-color="#8a6a1f"/></linearGradient>
<linearGradient id="${g("glanz")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity=".85"/><stop offset="42%" stop-color="#ffffff" stop-opacity=".12"/><stop offset="58%" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
<linearGradient id="${g("lila")}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfbff"/><stop offset="28%" stop-color="#e4d6ff"/><stop offset="58%" stop-color="#9f75fa"/><stop offset="84%" stop-color="#5b21b6"/><stop offset="100%" stop-color="#2a0f55"/></linearGradient>
<linearGradient id="${g("schwung")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#c4a8ff" stop-opacity="0"/><stop offset="35%" stop-color="#f1e9ff"/><stop offset="80%" stop-color="#b79bff"/><stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/></linearGradient>
<linearGradient id="${g("strahl")}" gradientUnits="userSpaceOnUse" x1="636" y1="196" x2="0" y2="-40"><stop offset="0%" stop-color="#fff" stop-opacity="0"/><stop offset="12%" stop-color="#fff" stop-opacity="1"/><stop offset="72%" stop-color="#fff" stop-opacity=".9"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="${g("auslauf")}" maskUnits="userSpaceOnUse" x="-40" y="-80" width="720" height="360"><rect x="-40" y="-80" width="720" height="360" fill="url(#${g("strahl")})"/></mask>
<filter id="${g("schein")}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="${g("blitzschein")}" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="${g("blitzweit")}" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="${g("stern")}" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<g mask="url(#${g("auslauf")})" style="${an("animation:ggWmFlacker 5.2s linear " + (verzug + 1.4) + "s infinite")}">
<g filter="url(#${g("blitzweit")})" opacity=".55">${strahl(STRAHL, 30, "#8b5cf6")}</g>
<g filter="url(#${g("blitzschein")})" opacity=".9" style="${an("animation:ggWmSchein 5.2s linear " + (verzug + 1.4) + "s infinite")}">${strahl(STRAHL, 16, "#7c3aed")}${aeste(8, "#7c3aed")}</g>
${strahl(STRAHL, 4.2, "#b692ff")}${aeste(1.8, "#a98bf7")}
${strahl(STRAHL, 1.6, "#ffffff")}${aeste(.8, "#f3ecff")}
</g>
<g style="font-family:'Cinzel',Georgia,serif;font-weight:600;font-size:108px;letter-spacing:2px">
<text x="320" y="112" text-anchor="middle" fill="#120b22" opacity=".85" transform="translate(0,3)">GAMBIT</text>
<text x="320" y="112" text-anchor="middle" fill="url(#${g("gold")})" style="filter:drop-shadow(0 2px 10px rgba(0,0,0,.85))">GAMBIT</text>
<text x="320" y="112" text-anchor="middle" fill="url(#${g("glanz")})">GAMBIT</text>
</g>
<g style="${riseAuf}"><g style="${an("animation:ggRiseGlimm 3.8s ease-in-out " + (verzug + 1.2) + "s infinite")}">
<g style="font-family:'Great Vibes','Cormorant Garamond',Georgia,serif;font-weight:400;font-size:156px">
<text x="470" y="206" text-anchor="middle" fill="#7c3aed" opacity=".85" filter="url(#${g("schein")})">Rise</text>
<text x="470" y="206" text-anchor="middle" fill="url(#${g("lila")})" stroke="#2a0f55" stroke-width=".6" stroke-opacity=".5">Rise</text>
</g>
<path d="M 330 216 C 386 244, 488 244, 616 176" fill="none" stroke="url(#${g("schwung")})" stroke-width="3" stroke-linecap="round"/>
</g>
<g transform="translate(582,126)"><g style="transform-origin:0 0;transform-box:fill-box;${an("animation:ggSternFunkeln 3.2s ease-in-out infinite")}">
<path d="${STERN}" fill="#fff" filter="url(#${g("stern")})"/><path d="${STERN}" fill="#fffaf0"/>
</g></g></g>
</svg>`;
}
