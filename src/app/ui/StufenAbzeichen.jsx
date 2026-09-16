/* ── DAS STUFEN-ABZEICHEN (v1.21.0) ───────────────────────────────────────────
   Besitzerentscheid (16.09.): drei Ebenen in einem Zeichen.
     FORM   - Zugehoerigkeit: Medaillon (Hof, Grossmeister), Schild (Kaempfer,
              Gemaeuer), Banner (Rat, Weg, See, Gesindel), Siegel (Arkanes,
              Drache, Brut, Untot) - siehe formFuer in kulissen.js
     FARBE  - die Figur: das Innenfeld traegt ihre gemessene Farbe, gebeizt
     METALL - der Fortschritt: Bronze 1-3, Silber 4-6, Gold 7-9, Gold mit
              Lorbeer auf der Hoechststufe. Je Metall ein Zierat.
   Fremdes bleibt grau, ohne Metall.
   Die Zeichnung liegt in abzeichenDefs.js (aus dem abgestimmten Vorschlag),
   einmal als <AbzeichenDefs/> eingehaengt; hier nur <use> und die Ziffer. */
import { ABZEICHEN_DEFS } from "./abzeichenDefs.js";

export function AbzeichenDefs() {
  return <svg width="0" height="0" aria-hidden style={{ position: "absolute" }} dangerouslySetInnerHTML={{ __html: `<defs>${ABZEICHEN_DEFS}</defs>` }} />;
}

export function metallFuer(stufe, maxStufe = 10) {
  if (stufe >= maxStufe) return "gold";
  const t = (stufe - 1) / Math.max(1, maxStufe - 1);   // 0..1 unterhalb der Hoechststufe
  return t < 1 / 3 ? "bronze" : t < 2 / 3 ? "silber" : "gold";
}

const ZIFFER_Y = { medaillon: 38.5, schild: 36.5, banner: 30.5, siegel: 38.5 };
const METALL_VARS = {
  bronze: { "--m": "url(#sa-bronze)", "--md": "url(#sa-bronzeDunkel)" },
  silber: { "--m": "url(#sa-silber)", "--md": "url(#sa-silberDunkel)" },
  gold: { "--m": "url(#sa-gold)", "--md": "url(#sa-goldDunkel)" },
  grau: { "--m": "#6a6660", "--md": "#3a3834" },
};

/* v1.21.2 (Besitzer: "Farben kraeftiger"): die gemessene Figurenfarbe ist
   fuer die Kulisse ausgelegt (mittelhell, Wert 0,62). Im Feld des Abzeichens
   liegt sie unter Beize und Randschatten und wirkt stumpf. Hier wird sie
   satter und heller gestellt: Saettigung x1,3, Helligkeit auf 0,50. */
export function kraeftig(hex) {
  if (!hex || hex[0] !== "#") return hex;
  const n = parseInt(hex.slice(1), 16); let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, sat = 0; const l = (max + min) / 2;
  if (max !== min) { const d = max - min; sat = l > .5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  const s2 = Math.min(1, sat * 1.3), l2 = 0.50;
  const q = l2 < .5 ? l2 * (1 + s2) : l2 + s2 - l2 * s2, pp = 2 * l2 - q;
  const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? pp + (q - pp) * 6 * t : t < .5 ? q : t < 2 / 3 ? pp + (q - pp) * (2 / 3 - t) * 6 : pp; };
  const hx = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${hx(f(h + 1 / 3))}${hx(f(h))}${hx(f(h - 1 / 3))}`;
}

export function StufenAbzeichen({ form = "medaillon", stufe = 1, maxStufe = 10, farbe = "#5b3fa6", grau = false, size = 30, id = "" }) {
  const metall = grau ? "grau" : metallFuer(stufe, maxStufe);
  const hoechst = !grau && stufe >= maxStufe;
  const zier = metall === "grau" ? null : metall === "gold" && (form === "schild" || form === "siegel") ? `sa-zier-gold-${form}` : form === "banner" ? null : `sa-zier-${metall}`;
  const n = String(stufe);
  const gross = n.length > 1 ? 19 : 22;
  return <svg viewBox="0 0 64 64" width={size} height={size} data-stufe={n} data-abzeichen={form} data-metall={metall}
    style={{ ...METALL_VARS[metall], "--t": grau ? "#5a5650" : kraeftig(farbe), "--lorbeer": hoechst ? 1 : 0, overflow: "visible", display: "block" }}>
    {/* der Lorbeer waechst auf der Hoechststufe um JEDE Form (Besitzer:
        "an das Goldene kommen die Blaetter ran") - hinter der Form gezeichnet */}
    {hoechst && <use href="#sa-lorbeer" data-lorbeer="1" />}
    <use href={`#sa-${form}`} />
    {zier && <use href={`#${zier}`} />}
    <text x="32" y={ZIFFER_Y[form] || 38.5} textAnchor="middle" fontSize={gross} fontWeight="800" fontFamily="Georgia, serif"
      fill="url(#sa-elfenbein)" filter="url(#sa-gravur)">{n}</text>
  </svg>;
}
