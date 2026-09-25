/* ═══ DIE WORTMARKE "GAMBIT Rise" - EINE QUELLE (v1.63.0) ══════════════════
   Besitzer 25.9. mit Vorlagebild: "genau das ist jetzt das Logo, was ich
   formen moechte ... Rise verfeinern, ein Blitz im Hintergrund, der auch
   hinter das Gambit geht ... es ist wichtig, dass es eine statische Form
   gibt und natuerlich eine animierte."

   Diese Datei ist die EINZIGE Quelle der Marke. Aus ihr zeichnen:
     * WortmarkeRise.jsx (Anmeldeschirm, Vorlader) - als React-Bauteil,
     * tools/wortmarke-einsetzen.mjs den festen Ladeschirm (index.html) und
       die Landingpage,
     * tools/wortmarke-export.mjs die Dateien fuer Store und Presse
       (statisches SVG, animiertes SVG, PNG).
   Die Blitzform ist einmal errechnet (Mittelpunktverschiebung, fester
   Zufallssamen) und hier als Pfad abgelegt - sie sieht bei jedem Laden
   gleich aus.

   wortmarkeSvg(praefix, { breite, animiert, blitz, verzug })
     praefix   - macht die ids eindeutig, falls zwei Marken auf einer Seite stehen
     animiert  - Blitz zuckt, Aeste flackern, Rise glimmt, Stern funkelt
     blitz     - beim Erscheinen flammt die Marke einmal hell auf
     verzug    - Sekunden bis zu diesem Aufflammen                            */

const HAUPT = "M-40.0,26.0 L-34.5,27.8 L-29.4,30.7 L-24.0,32.8 L-18.6,34.8 L-13.6,37.8 L-8.1,39.7 L-2.4,40.8 L2.8,43.6 L8.3,45.4 L14.2,46.1 L19.2,49.1 L24.5,51.5 L29.8,54.3 L35.7,55.1 L39.9,59.3 L45.2,61.9 L51.1,61.8 L56.7,63.7 L62.1,65.9 L67.6,68.0 L73.4,67.6 L79.3,68.6 L85.0,70.0 L90.3,72.5 L96.1,72.3 L102.0,72.4 L107.8,73.2 L113.7,72.6 L119.2,74.5 L124.8,75.9 L130.5,77.6 L136.1,79.2 L141.1,82.4 L146.9,83.6 L152.7,84.7 L158.5,84.4 L164.0,86.4 L169.0,89.2 L174.7,90.3 L180.1,92.5 L185.8,93.8 L191.7,93.9 L197.1,95.9 L202.4,98.4 L207.6,100.9 L212.6,103.9 L218.0,106.3 L223.8,107.0 L229.6,108.3 L235.5,107.9 L241.2,109.3 L246.9,110.9 L251.8,114.2 L256.4,117.9 L262.3,118.8 L267.7,121.5 L273.4,122.6 L278.9,124.5 L284.8,124.1 L290.5,125.4 L296.3,126.6 L302.1,125.8 L307.7,127.2 L313.5,127.5 L319.4,126.9 L325.3,127.6 L331.1,126.6 L336.9,125.4 L342.8,125.7 L348.5,127.2 L354.2,128.8 L360.0,129.4 L365.9,129.8 L371.5,131.7 L377.3,132.1 L383.2,132.9 L388.9,134.0 L394.5,136.1 L399.3,139.6 L405.0,141.3 L410.6,143.2 L415.7,146.2 L421.5,147.0 L427.2,148.2 L432.1,151.4 L437.3,154.1 L443.1,155.1 L448.4,157.6 L454.3,158.5 L459.9,160.5 L465.0,163.5 L470.6,165.4 L476.4,164.9 L482.3,165.3 L488.2,165.0 L494.0,166.5 L499.7,167.8 L505.2,169.5 L510.9,170.6 L516.6,171.8 L521.7,174.8 L526.8,177.8 L532.5,179.3 L538.2,180.5 L544.1,181.4 L549.5,183.6 L554.4,187.1 L560.0,189.0 L565.8,190.0 L571.3,192.0 L577.2,191.6 L583.0,192.5 L587.4,196.6 L592.9,199.0 L596.5,203.8 L601.2,207.3 L606.5,209.8 L611.7,212.5 L617.5,213.9 L622.6,216.9 L628.2,218.9 L633.4,221.9 L639.2,223.2 L645.1,223.5 L650.0,226.9 L655.6,229.0 L660.2,232.7 L665.0,236.0";
const AESTE_A = ["M207.6,100.9 L212.5,96.5 L215.7,90.8 L214.1,83.6 L219.5,78.5 L224.3,72.5 L222.0,65.2 L228.6,62.6 L232.4,56.6 L235.6,49.9 L242.1,46.2 L245.5,38.9 L253.6,37.9 L260.9,37.8 L268.1,37.1 L273.0,43.9 L281.4,43.2", "M79.3,68.6 L80.2,73.7 L80.3,78.9 L79.5,84.6 L83.4,88.8 L88.4,92.3 L94.6,92.4 L99.5,97.1 L97.7,103.7 L100.3,108.3 L99.1,113.6 L98.0,118.7 L99.9,123.5 L100.9,128.5 L103.5,132.9 L102.3,138.6 L106.9,142.2", "M191.7,93.9 L196.4,88.7 L200.6,83.2 L207.6,83.9 L214.5,82.4 L221.4,80.4 L227.2,84.7 L234.0,85.6 L238.7,90.6 L243.6,86.0 L245.7,79.7 L252.4,78.6 L257.3,74.0 L255.1,67.1 L259.9,61.8 L258.6,55.3 L261.5,49.4", "M622.6,216.9 L621.7,222.4 L625.3,226.6 L626.9,231.3 L629.3,235.7 L632.4,240.2 L635.6,244.6 L631.6,249.3 L633.3,255.2 L635.5,261.0 L641.7,261.7 L646.2,265.5 L651.9,264.3 L655.3,268.5 L656.2,273.8 L661.5,276.2 L662.8,281.8", "M383.2,132.9 L385.4,128.8 L386.5,124.3 L385.6,119.2 L389.0,115.3 L394.3,115.4 L399.3,113.9 L400.9,108.9 L404.2,104.8 L409.5,104.4 L412.3,99.8 L414.2,95.1 L418.9,93.0 L424.2,93.0 L428.1,96.6 L432.2,92.8 L437.6,93.8", "M262.3,118.8 L263.1,116.4 L264.7,114.4 L267.6,113.8 L268.5,111.0 L269.9,108.5 L272.7,108.4 L275.2,107.3 L276.2,104.7 L279.0,103.4 L280.0,100.5 L282.6,102.2 L285.6,101.2 L287.3,104.0 L290.5,104.1 L293.2,103.2 L295.7,101.8", "M35.7,55.1 L36.7,52.9 L37.4,50.6 L38.9,48.6 L40.8,47.1 L43.4,47.0 L45.1,44.9 L46.5,42.6 L49.2,42.6 L51.6,42.5 L53.9,42.2 L56.3,41.6 L58.1,40.0 L60.8,40.7 L63.1,42.0 L66.1,41.5 L67.3,38.6", "M415.7,146.2 L422.1,147.1 L425.6,152.6 L428.6,157.6 L431.3,162.9 L432.5,168.6 L430.8,174.3 L430.5,180.0 L430.3,185.7 L434.5,190.0 L439.7,193.0 L440.4,199.0 L444.1,203.8 L450.4,203.9 L455.0,208.2 L460.7,206.2 L466.6,207.3"];
const AESTE_B = ["M499.7,167.8 L500.0,170.2 L499.1,172.5 L498.7,175.4 L501.3,176.8 L502.7,179.0 L504.5,181.0 L502.7,183.1 L502.5,185.9 L501.1,188.3 L501.0,191.0 L500.8,193.8 L502.5,196.1 L504.2,198.5 L505.0,201.2 L507.7,202.4 L510.6,202.4", "M354.2,128.8 L356.2,135.5 L353.0,141.7 L349.7,147.3 L345.8,152.5 L352.3,154.7 L356.0,160.5 L359.1,166.2 L361.0,172.4 L364.8,176.7 L366.1,182.3 L366.2,188.6 L371.1,192.3 L372.8,198.7 L373.8,205.2 L381.0,203.5 L386.6,208.4", "M583.0,192.5 L586.2,199.3 L592.8,202.9 L599.1,206.5 L603.4,212.4 L610.3,217.0 L618.5,215.9 L624.3,210.5 L631.4,207.2 L634.4,200.9 L636.7,194.3 L642.0,189.4 L643.5,182.3 L649.1,176.6 L656.9,178.4 L664.2,179.1 L670.3,174.9", "M90.3,72.5 L95.1,76.6 L95.7,82.9 L95.0,88.9 L96.1,94.7 L97.0,101.8 L92.4,107.2 L94.9,113.6 L100.7,117.3 L106.6,113.1 L113.8,113.0 L119.8,116.6 L126.8,117.5 L132.2,121.4 L136.0,127.0 L137.7,133.5 L141.0,139.3", "M141.1,82.4 L143.8,88.4 L146.6,94.5 L151.6,99.2 L158.2,101.1 L165.9,100.7 L170.4,107.0 L176.1,112.0 L175.5,119.6 L177.9,126.4 L180.5,133.0 L183.2,139.7 L187.0,145.8 L188.3,153.8 L184.3,160.9 L179.7,167.6 L172.0,170.2", "M494.0,166.5 L499.1,170.0 L502.5,175.1 L501.3,181.0 L499.6,186.8 L506.0,187.0 L511.9,189.3 L512.3,195.6 L514.8,201.4 L514.6,207.9 L520.2,210.9 L518.1,216.1 L518.4,221.7 L520.9,226.5 L525.1,229.8 L526.0,235.0 L527.9,240.0", "M273.4,122.6 L279.8,118.2 L287.3,120.1 L293.3,115.5 L294.1,107.9 L293.3,101.5 L292.8,95.2 L296.6,89.0 L293.3,82.5 L299.9,83.0 L303.9,77.7 L309.8,76.5 L314.2,72.3 L319.8,76.2 L325.8,73.0 L331.3,76.1 L337.3,74.6", "M158.5,84.4 L160.1,86.5 L160.8,89.1 L162.8,90.8 L164.6,92.7 L167.3,93.4 L169.5,95.1 L169.7,98.0 L171.6,100.2 L175.0,100.1 L177.3,102.6 L176.8,105.9 L178.6,108.7 L181.1,110.4 L184.0,110.1 L186.8,108.9 L189.6,109.9"];
const FEINE = ["M222.0,65.2 L224.6,59.7 L225.8,53.7 L221.7,48.2 L223.7,41.7 L215.8,40.2 L213.3,32.6 L218.3,26.7 L216.6,19.2", "M505.0,201.2 L504.5,202.6 L504.5,204.0 L503.2,204.5 L501.8,204.6 L502.2,206.1 L501.3,207.4 L500.1,208.4 L498.6,208.0", "M102.3,138.6 L103.8,141.2 L106.6,142.3 L109.2,143.6 L111.1,145.8 L113.0,148.4 L115.0,151.0 L118.1,149.7 L121.4,150.4", "M99.5,97.1 L94.9,97.7 L92.3,101.6 L92.7,105.9 L91.9,110.0 L93.1,113.7 L92.4,117.5 L95.2,120.7 L94.4,124.8", "M352.3,154.7 L355.6,156.1 L359.0,157.0 L362.6,157.5 L366.1,156.6 L370.0,156.3 L372.7,159.0 L374.9,162.1 L378.5,163.0", "M243.6,86.0 L248.2,81.5 L247.3,75.1 L253.2,74.7 L258.1,71.4 L255.0,66.7 L252.3,61.7 L254.7,56.6 L255.5,50.9", "M258.6,55.3 L264.0,55.5 L267.1,51.1 L268.9,46.7 L271.0,42.5 L269.7,37.8 L271.9,33.4 L271.9,28.7 L269.5,24.7", "M624.3,210.5 L625.9,206.1 L630.2,204.3 L634.5,204.5 L638.8,204.6 L643.0,203.0 L644.6,198.8 L646.6,195.1 L646.6,190.9", "M641.7,261.7 L643.7,265.7 L640.7,269.1 L638.8,273.1 L641.8,276.4 L642.3,280.0 L641.8,283.7 L640.3,287.4 L642.1,291.0", "M641.7,261.7 L646.1,260.5 L650.6,260.2 L655.7,261.7 L659.5,258.0 L662.5,262.2 L663.0,267.5 L667.9,268.8 L672.7,270.4", "M100.7,117.3 L103.8,121.3 L108.9,121.1 L113.2,117.8 L118.0,120.4 L122.7,121.7 L126.8,119.0 L131.1,117.5 L134.6,114.7", "M385.6,119.2 L387.9,117.8 L388.6,115.2 L389.6,112.6 L392.3,111.9 L392.6,109.4 L391.7,107.0 L390.3,104.3 L392.2,102.0", "M165.9,100.7 L170.0,99.3 L173.5,101.8 L175.6,105.0 L176.7,108.8 L180.2,108.5 L183.5,109.6 L187.1,109.3 L189.9,111.6", "M279.0,103.4 L279.0,105.2 L280.1,106.6 L281.0,108.2 L282.8,108.8 L284.5,109.5 L286.1,108.5 L287.6,109.5 L289.3,109.0", "M512.3,195.6 L508.2,200.0 L502.3,198.8 L500.6,203.9 L500.4,209.2 L500.0,214.1 L496.7,217.8 L498.2,222.3 L498.4,227.1", "M49.2,42.6 L49.4,40.9 L49.6,39.2 L49.6,37.3 L50.6,35.8 L49.9,34.2 L50.1,32.4 L50.4,30.7 L50.5,28.9", "M49.2,42.6 L51.0,42.1 L52.1,43.5 L53.6,44.3 L54.2,45.8 L55.4,44.4 L57.3,44.2 L58.4,45.6 L60.1,46.1", "M279.8,118.2 L282.3,115.4 L286.1,115.6 L289.1,113.9 L292.3,112.7 L294.9,114.9 L297.3,117.5 L300.9,117.8 L303.8,120.0", "M431.3,162.9 L435.8,163.6 L440.3,162.8 L443.1,158.3 L448.4,158.9 L453.4,157.0 L457.4,160.6 L462.6,161.8 L464.0,166.9", "M178.6,108.7 L178.8,110.4 L179.3,112.0 L181.0,112.6 L182.2,113.9 L180.8,115.0 L180.6,116.8 L181.5,118.3 L181.0,120.0", "M176.8,105.9 L177.4,107.7 L177.7,109.6 L178.2,111.4 L179.0,113.1 L178.0,114.9 L177.0,116.6 L176.6,118.8 L178.0,120.5"];
const STERN = "M0,-16 C2,-4 4,-2 16,0 C4,2 2,4 0,16 C-2,4 -4,2 -16,0 C-4,-2 -2,-4 0,-16Z";

/** Die Schrittfolgen der animierten Fassung - einmal in jedes Dokument. */
export const WORTMARKE_KEYFRAMES =
  "@keyframes ggRiseBlitz { 0% { opacity: 0; filter: brightness(1); } 7% { opacity: 1; filter: brightness(3.4) drop-shadow(0 0 14px #fff); } 16% { filter: brightness(1.3); } 23% { filter: brightness(2.6) drop-shadow(0 0 10px #f4eaff); } 40% { filter: brightness(1.05); } 100% { opacity: 1; filter: brightness(1); } }"
  + " @keyframes ggRiseGlimm { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.16) drop-shadow(0 0 6px rgba(167,139,250,.5)); } }"
  + " @keyframes ggSternFunkeln { 0%,62%,100% { transform: scale(.72) rotate(0deg); opacity: .75; } 70% { transform: scale(1.25) rotate(20deg); opacity: 1; } 78% { transform: scale(.85) rotate(35deg); opacity: .9; } 84% { transform: scale(1.12) rotate(45deg); opacity: 1; } }"
  + " @keyframes ggBlitzZucken { 0%,100% { opacity: .92; } 3% { opacity: 1; } 5% { opacity: .35; } 7% { opacity: 1; } 10% { opacity: .55; } 13% { opacity: .98; } 45% { opacity: .78; } 70% { opacity: .9; } }"
  + " @keyframes ggAesteA { 0%,100% { opacity: .95; } 30% { opacity: .15; } 55% { opacity: .85; } 80% { opacity: .35; } }"
  + " @keyframes ggAesteB { 0%,100% { opacity: .25; } 35% { opacity: .95; } 62% { opacity: .2; } 85% { opacity: .9; } }";

const pfade = (liste) => liste.map((d) => `<path d="${d}"/>`).join("");

export function wortmarkeSvg(p = "wm", { breite = "100%", animiert = true, blitz = false, verzug = 0 } = {}) {
  const an = (s) => (animiert ? s : "");
  const einschlag = blitz ? `opacity:0;animation:ggRiseBlitz .95s ease-out ${verzug}s forwards;` : "";
  return `<svg viewBox="-40 0 700 250" width="${breite}" style="display:block;overflow:visible" role="img" aria-label="Gambit Rise">
<defs>
<linearGradient id="${p}gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3cf"/><stop offset=".38" stop-color="#f2d98c"/><stop offset=".62" stop-color="#d4af37"/><stop offset="1" stop-color="#8a6a1f"/></linearGradient>
<linearGradient id="${p}glanz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".42" stop-color="#fff" stop-opacity=".1"/><stop offset=".58" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}lila" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#efe7ff"/><stop offset=".8" stop-color="#c3a6ff"/><stop offset="1" stop-color="#9b6cf7"/></linearGradient>
<linearGradient id="${p}schwung" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".75" stop-color="#c4a8ff"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}bh" gradientUnits="userSpaceOnUse" x1="-40" y1="26" x2="665" y2="236"><stop offset="0" stop-color="#7c3aed" stop-opacity="0"/><stop offset=".15" stop-color="#8b5cf6"/><stop offset=".5" stop-color="#a78bfa"/><stop offset=".85" stop-color="#8b5cf6"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}bk" gradientUnits="userSpaceOnUse" x1="-40" y1="26" x2="665" y2="236"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".18" stop-color="#f3edff"/><stop offset=".5" stop-color="#fff"/><stop offset=".82" stop-color="#f3edff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<filter id="${p}g1" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="${p}g2" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${p}g3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>
<g style="${einschlag}">
<g fill="none" stroke-linecap="round" stroke-linejoin="round" style="${an("animation:ggBlitzZucken 4.2s linear infinite;")}">
<path d="${HAUPT}" stroke="url(#${p}bh)" stroke-width="34" opacity=".55" filter="url(#${p}g1)"/>
<g stroke="url(#${p}bh)" stroke-width="2.4" opacity=".75" filter="url(#${p}g2)"><g style="${an("animation:ggAesteA 2.6s ease-in-out infinite;")}">${pfade(AESTE_A)}</g><g style="${an("animation:ggAesteB 3.1s ease-in-out infinite;")}">${pfade(AESTE_B)}</g></g>
<g stroke="url(#${p}bk)" stroke-width="1"><g style="${an("animation:ggAesteA 2.6s ease-in-out infinite;")}">${pfade(AESTE_A)}</g><g style="${an("animation:ggAesteB 3.1s ease-in-out infinite;")}">${pfade(AESTE_B)}</g></g>
<g stroke="url(#${p}bk)" stroke-width=".7" opacity=".7" style="${an("animation:ggAesteB 2.2s ease-in-out infinite;")}">${pfade(FEINE)}</g>
<path d="${HAUPT}" stroke="url(#${p}bh)" stroke-width="7" filter="url(#${p}g2)"/>
<path d="${HAUPT}" stroke="url(#${p}bk)" stroke-width="2.6"/>
</g></g>
<g style="font-family:'Cinzel',Georgia,serif;font-weight:600;font-size:108px;letter-spacing:2px">
<text x="310" y="112" text-anchor="middle" fill="#120b22" opacity=".85" transform="translate(0,3)">GAMBIT</text>
<text x="310" y="112" text-anchor="middle" fill="url(#${p}gold)">GAMBIT</text>
<text x="310" y="112" text-anchor="middle" fill="url(#${p}glanz)">GAMBIT</text>
</g>
<g style="${einschlag}"><g style="${an("animation:ggRiseGlimm 3.8s ease-in-out infinite;")}">
<g style="font-family:'Great Vibes','Cormorant Garamond',Georgia,serif;font-weight:400;font-size:140px">
<text x="468" y="208" text-anchor="middle" fill="#7c3aed" opacity=".9" filter="url(#${p}g3)">Rise</text>
<text x="468" y="208" text-anchor="middle" fill="url(#${p}lila)">Rise</text>
</g>
<path d="M 360 222 C 430 236, 520 232, 612 190" fill="none" stroke="url(#${p}schwung)" stroke-width="3" stroke-linecap="round"/>
</g>
<g transform="translate(578,146)"><g style="transform-origin:0 0;transform-box:fill-box;${an("animation:ggSternFunkeln 3.2s ease-in-out infinite;")}">
<path d="${STERN}" fill="#fff" filter="url(#${p}g2)"/><path d="${STERN}" fill="#fffaf0" transform="scale(.8)"/>
</g></g></g>
</svg>`;
}
