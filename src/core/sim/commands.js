/**
 * Commands are the only way to advance the simulation. They are serializable
 * intents — exactly what you record for a replay, send across the wire for
 * online play, or hand to a server for authoritative validation.
 */
export const COMMAND = {
  MOVE: "MOVE",
  RESIGN: "RESIGN",
  POTION: "POTION",
  SHIFT: "SHIFT",
  /* v1.11.2: der Platztausch des GELEITS. Er braucht einen eigenen Befehl,
     weil er kein Zug ist: keine Figur bewegt sich auf ein Zielfeld, zwei
     tauschen. Als Zug getarnt waere er im Verlauf nicht wiederzufinden und
     in der Wiederholung nicht nachzuspielen. */
  GELEIT: "GELEIT",
};

/** Wrap a chosen move (from legalMoves/legalMovesFrom) as a MOVE command. */
export const moveCommand = (move) => ({ type: COMMAND.MOVE, move });

/** Spend one healing draught: +2 HP (up to max) on an own piece; ends the turn. */
export const potionCommand = (color, target) => ({ type: COMMAND.POTION, color, target });

/** Arm a Time Rift (magic circle): your NEXT move keeps the turn. Free action. */
export const shiftCommand = (color) => ({ type: COMMAND.SHIFT, color });
/** Der Spieler waehlt zwei der drei - Springer, Laeufer, Turm - und sie tauschen. */
export const geleitCommand = (color, a, b) => ({ type: COMMAND.GELEIT, color, a, b });

/** `color` resigns; the other side wins. */
export const resignCommand = (color) => ({ type: COMMAND.RESIGN, color });
