import { createInitialState, defaultArmy, DEFAULT_MAP } from "../domain/setup.js";

/**
 * A GameState is the initial position plus two things that make the engine
 * future-proof:
 *   - `log`  : the ordered list of commands applied (enables replays + netcode).
 *   - `seed` : the RNG seed for this match (reproducible AI / deterministic sim).
 * The board/turn/captured/history/w/h/holes fields come from createInitialState.
 *
 * `opts` is either a numeric seed (back-compat) or { seed, map }.
 */
export function createGame(whiteArmy = defaultArmy(), blackArmy = defaultArmy(), opts) {
  let seed = (Date.now() >>> 0), map = DEFAULT_MAP, rules = "chess";
  if (typeof opts === "number") seed = opts;
  else if (opts && typeof opts === "object") {
    if (opts.seed != null) seed = opts.seed;
    if (opts.map) map = opts.map;
    if (opts.rules) rules = opts.rules;
  }
  const s = createInitialState(whiteArmy, blackArmy, map, rules);
  if (opts && typeof opts === "object" && opts.potions) s.potions = { w: opts.potions.w || 0, b: opts.potions.b || 0 };
  /* ── DIE ERWACHTEN BUENDE (v1.10.1) ──────────────────────────────────────
     Sie stehen als Liste im Spielstand und werden GENAU EINMAL gesetzt - beim
     Aufbau der Partie, aus den Stufen des Profils. Der Kern liest sie nur.

     Das ist Absicht: "ist mein Bund erwacht?" haengt an Stufen, und Stufen
     aendern sich waehrend einer Partie nicht. Die Frage in jedem Zug neu zu
     beantworten waere Arbeit ohne Ertrag - und sie wuerde den Kern zwingen,
     das Profil zu kennen, das ihn nichts angeht. */
  if (opts && typeof opts === "object" && Array.isArray(opts.buende)) s.buende = opts.buende.slice();
  /* Einmal-je-Partie-Buende brauchen ein Gedaechtnis. */
  s.sturmVerbraucht = {};
  s.konzilVerbraucht = {};
  s.geleitVerbraucht = {};
  s.log = [];
  s.seed = seed >>> 0;
  return s;
}
