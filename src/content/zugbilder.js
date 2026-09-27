/* ── ZUGBILDER DER FAEHIGKEITEN ───────────────────────────────────────────────
   Welche Faehigkeiten AENDERN, wie eine Figur zieht - und welche Felder sie
   hinzufuegen. Nur diese bekommen im Hofstaat, in der Chronik und in der
   Aufstiegsfeier ihr kleines Raster (MoveDiagram in ArmyScreen.jsx); Kampf-
   und Zaehigkeits-Faehigkeiten nicht. Deltas sind [Linie, Reihe] vom Feld der
   Figur aus.

   v1.89.1: aus ArmyScreen.jsx hierher gezogen, damit die Probe
   test_zugbilder.mjs die Tabelle importieren kann statt sie per Regex aus
   dem JSX zu schneiden. Die Probe legt jedes Muster gegen den Kern
   (rules/moves.js) - Zugbild und Regelwerk duerfen nie auseinanderlaufen.

   `hinweis` steht unter dem Raster, wo das Bild allein die Unwahrheit sagen
   wuerde (gemessen am Kern, siehe design/FAEHIGKEITEN-2026-09-27.md, 3.):
   Phase und Durchbruch gehen NUR ueber eine besetzte Nachbarfigur, die
   Koenigsflucht NUR bei freiem Zwischenfeld, der Stossschlag ist ein Schlag
   auf das Feld des Grundschritts, Sturmlauf und Fliegen wachsen mit der
   Stufe. Ohne Hinweis waere "Gruen: neue Felder" fuer diese sechs falsch. */
export const ABILITY_MOVE = {
  knight_longleap: { leaps: [[1, 3], [3, 1], [-1, 3], [-3, 1], [1, -3], [3, -1], [-1, -3], [-3, -1]] },
  knight_outrider: { leaps: [[2, 2], [2, -2], [-2, 2], [-2, -2]] },
  bishop_hop: { leaps: [[2, 2], [2, -2], [-2, 2], [-2, -2]],          // hop over a neighbour
    hinweis: { de: "nur über eine angrenzende Figur hinweg", en: "only over an adjacent piece" } },
  bishop_ortho_step: { leaps: [[1, 0], [-1, 0], [0, 1], [0, -1]] },
  rook_diag_step: { leaps: [[1, 1], [1, -1], [-1, 1], [-1, -1]] },
  rook_breach: { leaps: [[2, 0], [-2, 0], [0, 2], [0, -2]],           // breach over an adjacent piece
    hinweis: { de: "nur über eine angrenzende Figur hinweg", en: "only over an adjacent piece" } },
  queen_knightleap: { leaps: [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]] },
  king_dash: { leaps: [[2, 0], [-2, 0], [0, 2], [0, -2]],
    hinweis: { de: "nur wenn das Zwischenfeld frei ist", en: "only if the square between is empty" } },
  pawn_sidestep: { leaps: [[1, 0], [-1, 0]] },
  pawn_forward_capture: { leaps: [[0, 1]],
    hinweis: { de: "das Feld vor dir · als Schlag, nicht als Schritt", en: "the square ahead · as a capture, not a step" } },
  pawn_charge: { leaps: [[0, 2]],
    hinweis: { de: "Stufe I zwei Felder, II drei, III vier · der Weg muss frei sein", en: "tier I two squares, II three, III four · the path must be clear" } },
  pawn_backstep: { leaps: [[0, -1]] },
  // v0.72.3 (Besitzer-Befund): der GROSSE Drache fliegt auf JEDES Feld im
  // Umkreis seiner Schwinge (so rechnet es die Engine) - nicht nur ueber
  // Achsen und Diagonalen.
  dragon_flight: { leaps: [[-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2], [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2], [0, -2], [0, -1], [0, 1], [0, 2], [1, -2], [1, -1], [1, 0], [1, 1], [1, 2], [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]],
    hinweis: { de: "Stufe I bis zwei Felder, II drei, III vier", en: "tier I up to two squares, II three, III four" } },
};

/* Die Legende unter einem Faehigkeits-Raster: erst der Hinweis (wenn das
   Bild einen braucht), dann der Satz ueber die gruenen Felder. */
export const MOVE_LEGEND_ABILITY = { de: "Grün: neue Felder durch diese Fähigkeit", en: "Green: squares this ability adds" };
export const zugbildLegende = (spec, en) =>
  (spec && spec.hinweis ? (en ? spec.hinweis.en : spec.hinweis.de) + " · " : "") + (en ? MOVE_LEGEND_ABILITY.en : MOVE_LEGEND_ABILITY.de);
