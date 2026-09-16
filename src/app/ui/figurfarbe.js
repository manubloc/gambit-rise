/* ── DIE FARBE JEDER FIGUR (v1.19.0) ──────────────────────────────────────────
   Gemessen am Gemaelde (scripts/messe_farbe.py -> figurfarbe.json): der
   volleste Farbtonsektor der gesaettigten Pixel oberhalb des Sockels, ohne
   Hauttoene und Schatten. Der Koenig ist blau, der Springer rot, der Magier
   violett, der Drache gruen. Getragen vom Stufen-Medaillon und, leise, von
   der Kulisse (Besitzerwunsch: "dann sieht der Hintergrund nicht immer so
   aufgesetzt aus"). */
import FARBE from "./board/figurfarbe.json";

export const figurFarbe = (paintedId) => (paintedId && FARBE[paintedId]) || null;

/* hell/dunkel abgeleitet, fuer Rand und Kern des Medaillons */
export function hellDunkel(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.max(0, Math.min(255, Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
