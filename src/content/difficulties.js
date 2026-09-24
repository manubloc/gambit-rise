// Tunable game/app config. Difficulty defines AI search depth, the AI's
// character levels (so the player faces — and SEES — upgraded enemy pieces),
// and which characters sit in the AI's flank slots.
export const DIFFICULTIES = [
  {
    id: "easy", depth: 1,
    levels: {}, flank: ["knight", "knight"],
  },
  {
    id: "normal", depth: 2,
    levels: { pawn: 3, knight: 3, bishop: 2, rook: 2, queen: 2 },
    flank: ["knight", "knight"],
  },
  {
    id: "hard", depth: 2,
    levels: { pawn: 5, knight: 4, bishop: 4, rook: 4, queen: 4, king: 2, archbishop: 3, chancellor: 3 },
    flank: ["archbishop", "chancellor"], // fairy pieces with abilities + shields
  },
  /* v1.48.0 (Besitzerwunsch): SEHR SCHWER. Eine Suchtiefe mehr als "schwer"
     und hoeher gestufte Figuren. Gemessen auf der Sandbox: Tiefe 3 braucht
     im Schnitt ~200 ms je Zug, hoechstens ~0,4 s (Schach) - auf dem Handy
     rund eine Sekunde. Man sieht die KI nachdenken; fuer diese Stufe passt das. */
  {
    id: "veryhard", depth: 3,
    levels: { pawn: 7, knight: 6, bishop: 6, rook: 6, queen: 6, king: 3, archbishop: 5, chancellor: 5 },
    flank: ["archbishop", "chancellor"],
  },
];
export const difficultyById = (id) => DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1];
