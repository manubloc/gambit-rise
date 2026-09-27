/* ── DAS BRETTCHEN (v1.89.0) ─────────────────────────────────────────────────
   Besitzer: "bei der Spielweise vielleicht sogar visuell noch versuchen zu
   arbeiten mit diesen Schachfelddarstellungen, das finde ich eigentlich
   relativ cool." Ein kleines Brett aus der eigenen Hand - dieselben dunklen
   Felder wie das Zugbild der Schachschule, Figuren als Vektor-Zeichen
   (PieceArt, kein Foto), goldene Punkte fuer Ziele, rote Ringe fuer
   bedrohte oder geschlagene Felder, Pfeile fuer den Zug und blasse Geister
   fuer den Stand danach. Koordinaten: x nach rechts, y nach unten, (0,0)
   oben links. Nichts davon kommt von aussen - das war die Bedingung. */
import { PieceArt } from "./board/PieceArt.jsx";

const EIGEN = { fill: "#c9a45c", rim: "#f0dfae", detail: "#59421a" };
const FREMD = { fill: "#5b4a7a", rim: "#c4b5fd", detail: "#241a3a" };

export function Brettchen({ n = 5, w = 170, figuren = [], ziele = [], schlaege = [], pfeile = [], geister = [] }) {
  const C = 30, cell = w / n;
  const mitte = (v) => v * C + C / 2;
  const feld = (x, y) => ((x + y) % 2 === 0 ? "#20283e" : "#161d30");
  return (
    <div style={{ position: "relative", width: w, height: w, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${n * C} ${n * C}`} width={w} height={w} style={{ borderRadius: 10, display: "block" }}>
        <defs>
          <marker id="gg-pfeil" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#e9cf8a" />
          </marker>
        </defs>
        {Array.from({ length: n * n }).map((_, i) => {
          const x = i % n, y = Math.floor(i / n);
          return <rect key={i} x={x * C} y={y * C} width={C} height={C} fill={feld(x, y)} />;
        })}
        {ziele.map(([x, y], i) => <circle key={"z" + i} cx={mitte(x)} cy={mitte(y)} r={5.5} fill="#c9a45c" opacity=".9" />)}
        {schlaege.map(([x, y], i) => <circle key={"s" + i} cx={mitte(x)} cy={mitte(y)} r={9} fill="none" stroke="#c25b66" strokeWidth="2.2" />)}
        {pfeile.map(([x1, y1, x2, y2, art], i) => {
          /* der Pfeil endet vor der Feldmitte, damit die Spitze nicht in der Figur steckt */
          const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1;
          const ex = mitte(x2) - (dx / l) * 9, ey = mitte(y2) - (dy / l) * 9;
          return <line key={"p" + i} x1={mitte(x1)} y1={mitte(y1)} x2={ex} y2={ey} stroke="#e9cf8a" strokeWidth="2.4"
            strokeLinecap="round" strokeDasharray={art === "gestrichelt" ? "4 4" : undefined} markerEnd="url(#gg-pfeil)" opacity=".92" />;
        })}
      </svg>
      {geister.map((g, i) => <div key={"g" + i} style={{ position: "absolute", left: g.x * cell + 3, top: g.y * cell + 2,
        width: cell - 6, height: cell - 6, opacity: .38 }}>
        <PieceArt kind={g.kind} {...(g.dunkel ? FREMD : EIGEN)} size="100%" level={1} />
      </div>)}
      {figuren.map((f, i) => <div key={"f" + i} style={{ position: "absolute", left: f.x * cell + 3, top: f.y * cell + 2,
        width: cell - 6, height: cell - 6 }}>
        <PieceArt kind={f.kind} {...(f.dunkel ? FREMD : EIGEN)} size="100%" level={1} hero={!!f.held} />
      </div>)}
    </div>
  );
}
