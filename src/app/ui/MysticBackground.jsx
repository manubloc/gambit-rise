// (hooks no longer needed — the hall stands still)
import { bgHall, rissBoden } from "./livery.js";

// ── The hall behind everything ────────────────────────────────────────────────
// A dark marble board fades out of pure black (the image is embedded, not
// stretched: a soft mask melts its edges into the night, so any screen size
// works). Above it drifts SMOKE — not puffy clouds but slow, wispy trails:
// particles ride a curved flow field and their paths linger and fade on a
// transparent canvas (destination-out), which paints exactly those long
// mystical streaks. The smoke is tinted by the LEAGUE you are climbing.

const LEAGUE_TINTS = [
  { s: [46, 58, 76],  a: [196, 150, 84] },   // I    night & gold
  { s: [56, 48, 70],  a: [172, 122, 188] },  // II   violet haze
  { s: [36, 62, 56],  a: [112, 190, 150] },  // III  fen green
  { s: [44, 54, 42],  a: [150, 176, 118] },  // IV   treeline green
  { s: [60, 44, 60],  a: [200, 112, 140] },  // V    nightrose
  { s: [40, 56, 74],  a: [122, 170, 210] },  // VI   steel
  { s: [64, 54, 36],  a: [220, 172, 92] },   // VII  Sattelweite: amber
  { s: [66, 42, 42],  a: [210, 112, 90] },   // VIII Aschgrund: ember
  { s: [36, 58, 64],  a: [112, 190, 200] },  // IX   Die Wunde: petrol
  { s: [66, 58, 44],  a: [230, 192, 132] },  // X    desert
  { s: [38, 52, 50],  a: [150, 200, 184] },  // XI   Die Kueste: Gischt
  { s: [30, 40, 66],  a: [152, 182, 230] },  // XII  Endloses Meer: deep sea silver
];
// EINE Maske genuegt: das Brett laeuft nach oben ins Schwarz aus. Zwei Masken
// mit "intersect" hatten es fast vollstaendig weggeschnitten - unten kam
// gemessen nur noch Helligkeit 3 an statt der 25 des Bildes.
const MASKE_BRETT = "linear-gradient(180deg, transparent 0%, rgba(0,0,0,.45) 22%, #000 55%, #000 100%)";
const tintFor = (league) => LEAGUE_TINTS[((Math.max(1, league || 1) - 1) % 12)];
/** Der Hauch ueber dem Schwarz: die Kapitelfarbe auf ein Zehntel gedaempft und
 *  in Richtung des Riss-Violetts gezogen. So bleibt jedes Kapitel erkennbar,
 *  ohne dass der Grund je aufhellt. */
const hauchFuer = (league) => {
  const t = tintFor(league)?.s || [30, 20, 50];
  const r = Math.round(t[0] * 0.34 + 22), g = Math.round(t[1] * 0.24 + 8), b = Math.round(t[2] * 0.4 + 34);
  return `rgba(${r}, ${g}, ${b}, .55)`;
};

/** DER SAUM DES RISSES: ein violettes Leuchten laeuft aussen um den Schirm.
 *  Es muss OBEN liegen, nicht im Hintergrund - dort verdecken es die Flaechen
 *  der Oberflaeche, gemessen kam am aeussersten Rand exakt nichts an. Als
 *  eigene Schicht mit hohem zIndex und ohne Mausannahme stoert es nichts und
 *  ist ueberall sichtbar. Es atmet langsam, damit der Rand lebt statt blinkt. */
/** DER BRETTGRUND: das gerissene Schachbrett am unteren Rand. Das Menuegeruest
 *  bekommt ihn ueber MysticBackground; Schirme davor (Anmeldung, Spielstaende)
 *  haben den nicht - deshalb steht er hier auch einzeln zur Verfuegung, mit
 *  genau derselben Platzierung und Maske, damit der Uebergang nahtlos ist. */
export function RiftFloor({ fixed = true }) {
  const mob = typeof window !== "undefined" && window.innerWidth < 900;
  const W = mob ? "168%" : "min(112%, 1400px)";
  return <div aria-hidden style={{ position: fixed ? "fixed" : "absolute", inset: 0, zIndex: 0,
    pointerEvents: "none", overflow: "hidden" }}>
    <img src={bgHall()} alt="" draggable={false} style={{ position: "absolute", left: "50%", bottom: 0,
      width: W, marginLeft: `calc(${W} / -2)`, maxWidth: "none", userSelect: "none",
      WebkitMaskImage: MASKE_BRETT, maskImage: MASKE_BRETT, opacity: 0.85 }} />
  </div>;
}

export function MysticBackground({ league = 1 }) {
  // the ember/smoke canvas is retired — the hall stands still and clear

  const mask = "radial-gradient(ellipse 78% 72% at 50% 66%, #000 38%, rgba(0,0,0,.5) 64%, transparent 92%)";
  // Das Brett steht unten auf: nach OBEN laeuft es ins Schwarz aus, seitlich
  // ebenfalls, unten bleibt es stehen - sonst schwebte es ueber dem Rand.

  const mob = typeof innerWidth !== "undefined" && innerWidth < 640;
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden",
      // SCHWARZ, restlos. Aus der Tiefe steigt nur ein Hauch des Risses -
      // dasselbe Violett wie im Wappen, so schwach, dass es als Ahnung wirkt
      // und nicht als Farbe.
      background: `radial-gradient(120% 90% at 50% 26%, ${hauchFuer(league)} 0%, #000 62%), #000` }}>
      {/* phones: the hall grows and lifts above the bottom menu — the marble
          board in the picture stays in view instead of hiding behind the nav.
          CENTRING WITHOUT transform: the app root carries a CSS `zoom`, and a
          translateX(-50%) on this layer is swallowed by it — the picture then
          hangs off to the right. A negative margin of half its own width does
          the same job and survives the zoom at any viewport width (even when
          the image is wider than the screen, where auto margins would fail). */}
      {(() => {
        const W = mob ? "168%" : "min(112%, 1400px)";
        /* ── DER HINTERGRUND FOLGT DEM KAPITEL ───────────────────────────
           v1.9.1 nahm dafuer die Kapitelboeden ground-01..12. Das war der
           Fehler: das sind GELAENDEKACHELN der Weltkarte - Wiese, Acker,
           Wald, Sand. Deshalb stand im Menue ein beiger Steinboden.

           v1.23.7 (Besitzer: "Mach mal den beigen Hintergrund weg"): es sind
           die riss-Bilder. Schachbrett unten, oben Schwarz, und der Riss
           waechst mit dem Kapitel. Sie wurden vom Vorlader schon immer
           geladen und nie gezeigt. bgHall bleibt der Rueckfall. */
        return <img src={rissBoden(league) || bgHall()} alt="" draggable={false} style={{ position: "absolute", left: "50%", bottom: mob ? "2vh" : 0,
          width: W, marginLeft: `calc(${W} / -2)`, maxWidth: "none", userSelect: "none",
          // Das Brett bringt sein eigenes Violett mit - keine Farbdrehung mehr.
          // Die Maske loest nur noch die Kanten, damit kein Bildrand steht.
          WebkitMaskImage: MASKE_BRETT, maskImage: MASKE_BRETT,
          opacity: 0.85 }} />;
      })()}
      {/* the ceiling of night: melts the image's top edge whatever the viewport */}
      <div style={{ position: "absolute", inset: 0,
        background: "linear-gradient(180deg, #000 0%, rgba(0,0,0,.62) 22%, transparent 46%)" }} />
    </div>
  );
}
