import { createRoot } from "react-dom/client";
import { BoardView } from "/home/claude/grand-gambit/src/app/ui/board/BoardView.jsx";
import { createGame } from "/home/claude/grand-gambit/src/core/index.js";
import { buildArmyFromFormation } from "/home/claude/grand-gambit/src/meta/index.js";
import { mapById } from "/home/claude/grand-gambit/src/content/index.js";
const K = mapById("classic");
const a = buildArmyFromFormation(() => 5, K.defaultFormation, () => [], null, () => ({}));
let g = createGame(a, a, { rules: "hp", map: K, seed: 3 });
const b = g.board;
const f = (x, y) => y * 8 + x;
// Figuren an Ort und Stelle markieren
b[f(1, 1)].giftRunden = 2; b[f(1, 1)].giftN = 2;            // weisser Bauer b2 vergiftet
b[f(4, 6)].blindBis = 99; b[f(3, 6)].blindBis = 99;          // schwarze Bauern e7, d7 geblendet
b[f(6, 7)].geist = true;                                      // schwarzer Springer g8 als Geist
b[f(1, 0)].geist = true;                                      // weisser Springer b1 als Geist
b[f(2, 4)] = null;
g = { ...g, moveCount: 3, schreckFelder: { [f(3, 3)]: { farbe: "b", bis: 99 }, [f(5, 4)]: { farbe: "w", bis: 99 } } };
createRoot(document.getElementById("r")).render(<div style={{ width: 460 }}><BoardView state={g} lastMove={null} interactive={false} ruhig maxPx={460} /></div>);
