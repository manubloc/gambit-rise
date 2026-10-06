/**
 * Snapshot (de)serialization for save games and online sync. We intentionally
 * DROP `history` (the undo stack of past states) — it is large and rebuildable.
 * Replays are reconstructed from the command `log` instead (see replay.js).
 */
const VERSION = 1;

export function encodeState(state) {
  return JSON.stringify({
    v: VERSION,
    board: state.board,
    w: state.w ?? 10, h: state.h ?? 10,
    holes: state.holes ? [...state.holes] : [],
    rules: state.rules ?? "chess",
    turn: state.turn,
    potions: state.potions || { w: 0, b: 0 },
    shifts: state.shifts || { w: 0, b: 0 },
    shiftArmed: state.shiftArmed ?? null,
    captured: state.captured,
    lastMove: state.lastMove,
    moveCount: state.moveCount,
    ohneSchaden: state.ohneSchaden || 0,
    seed: state.seed ?? 0,
    log: state.log ?? [],
    /* v1.0.63: Sperren und Fallen gehoeren in den Schnappschuss. Ohne diese
       zwei Zeilen verlor eine PAUSIERTE Kampagnenpartie beim Fortsetzen jede
       gesetzte Mauer - bezahlt, gesetzt, verschwunden. Nur mitschreiben, was
       da ist: Partien ohne Sperren behalten exakt ihre alte Schnappschussform. */
    ...(state.sperren && Object.keys(state.sperren).length ? { sperren: state.sperren } : {}),
    ...(state.fallen && Object.keys(state.fallen).length ? { fallen: state.fallen } : {}),
    /* v1.91.0: auch die BUENDE und ihr Einmal-Gedaechtnis. Eine pausierte
       Kampagnenpartie setzte ohne Buende fort - der Paladin deckte nicht
       mehr, und die Amazone haette nach dem Fortsetzen ein zweites Mal
       zurueckkehren duerfen. Nur mitschreiben, was da ist. */
    ...(state.buende ? { buende: state.buende } : {}),
    ...(state.sturmVerbraucht && Object.keys(state.sturmVerbraucht).length ? { sturmVerbraucht: state.sturmVerbraucht } : {}),
    ...(state.konzilVerbraucht && Object.keys(state.konzilVerbraucht).length ? { konzilVerbraucht: state.konzilVerbraucht } : {}),
    ...(state.geleitVerbraucht && Object.keys(state.geleitVerbraucht).length ? { geleitVerbraucht: state.geleitVerbraucht } : {}),
    ...(state.beute ? { beute: state.beute } : {}),
  });
}

export function decodeState(json) {
  const o = typeof json === "string" ? JSON.parse(json) : json;
  return {
    board: o.board,
    w: o.w ?? 10, h: o.h ?? 10,
    holes: new Set(o.holes || []),
    rules: o.rules ?? "chess",
    turn: o.turn,
    captured: o.captured || { w: [], b: [] },
    potions: o.potions || { w: 0, b: 0 },
    shifts: o.shifts || { w: 0, b: 0 },
    shiftArmed: o.shiftArmed ?? null,
    history: [], // fresh; undo starts over after a load
    lastMove: o.lastMove || null,
    moveCount: o.moveCount || 0,
    ohneSchaden: o.ohneSchaden || 0,
    seed: o.seed || 0,
    log: o.log || [],
    ...(o.sperren ? { sperren: o.sperren } : {}),
    ...(o.fallen ? { fallen: o.fallen } : {}),
    ...(o.buende ? { buende: o.buende } : {}),
    sturmVerbraucht: o.sturmVerbraucht || {},
    konzilVerbraucht: o.konzilVerbraucht || {},
    geleitVerbraucht: o.geleitVerbraucht || {},
    ...(o.beute ? { beute: o.beute } : {}),
  };
}
