// AUDIT: full self-play games — the bot plays BOTH sides to the end.
// Checks: no exceptions, only legal moves, games terminate, results sane.
import { createGame, applyMove, legalMoves, status } from "./src/core/index.js";
import { chooseMove } from "./src/ai/index.js";
import { makeRng } from "./src/core/ports/rng.js";
import { buildAiArmyForMap } from "./src/meta/index.js";
import { MAPS } from "./src/content/index.js";

const rows = [];
function playOne(label, mkState, depth, maxPly = 320) {
  const t0 = Date.now();
  try {
    let state = mkState();
    let ply = 0;
    while (ply < maxPly) {
      const st = status(state);
      if (st.over) return rows.push({ label, ok: true, plies: ply, result: st.result || st.winner || "over", ms: Date.now() - t0 });
      const legal = legalMoves(state);
      if (!legal.length) return rows.push({ label, ok: true, plies: ply, result: "no-moves(" + (st.check ? "mate" : "stale") + ")", ms: Date.now() - t0 });
      const mv = chooseMove(state, depth, makeRng(1234 + ply));
      if (!mv) return rows.push({ label, ok: true, plies: ply, result: "bot-pass", ms: Date.now() - t0 });
      const found = legal.some((m) => m.from === mv.from && m.to === mv.to);
      if (!found) return rows.push({ label, ok: false, plies: ply, result: "ILLEGAL " + mv.from + ">" + mv.to, ms: Date.now() - t0 });
      state = applyMove(state, mv).state ?? applyMove(state, mv);
      ply++;
    }
    return rows.push({ label, ok: true, plies: ply, result: "max-ply", ms: Date.now() - t0 });
  } catch (e) {
    return rows.push({ label, ok: false, plies: -1, result: "EXCEPTION " + (e && e.message), ms: Date.now() - t0 });
  }
}
// applyMove may return state or {state} — normalize by probing once
const probe = createGame();
const r = applyMove(probe, legalMoves(probe)[0]);
const wrapped = r && r.state && r.state.board;
function step(state, mv) { const out = applyMove(state, mv); return wrapped ? out.state : out; }

// re-run with correct stepper
rows.length = 0;
function playOne2(label, mkState, depth, maxPly = 320) {
  const t0 = Date.now();
  try {
    let state = mkState(); let ply = 0;
    while (ply < maxPly) {
      const st = status(state);
      if (st.over) { rows.push({ label, ok: true, plies: ply, result: String(st.result || st.winner || "over"), ms: Date.now() - t0 }); return; }
      const legal = legalMoves(state);
      if (!legal.length) { rows.push({ label, ok: true, plies: ply, result: st.check ? "mate" : "stalemate", ms: Date.now() - t0 }); return; }
      const mv = chooseMove(state, depth, makeRng(99 + ply));
      if (!mv) { rows.push({ label, ok: true, plies: ply, result: "bot-pass", ms: Date.now() - t0 }); return; }
      if (!legal.some((m) => m.from === mv.from && m.to === mv.to)) { rows.push({ label, ok: false, plies: ply, result: "ILLEGAL", ms: Date.now() - t0 }); return; }
      state = step(state, mv); ply++;
    }
    rows.push({ label, ok: true, plies: maxPly, result: "max-ply", ms: Date.now() - t0 });
  } catch (e) { rows.push({ label, ok: false, plies: -1, result: "EXCEPTION " + (e && e.message), ms: Date.now() - t0 }); }
}

const N_CLASSIC = +(process.env.N_CLASSIC || 4);
for (let g = 0; g < N_CLASSIC; g++) playOne2("klassik-d2", () => createGame(undefined, undefined, { seed: 11 + g }), 2, 150);
if (process.env.D3) for (let g = 0; g < 2; g++) playOne2("klassik-d3", () => createGame(undefined, undefined, { seed: 31 + g }), 3, 44);
// HP mode on real campaign maps: bot armies both sides
const hpMaps = process.env.HP ? MAPS.slice(0, 2) : []; // HP is a MODE (opts.rules), any map hosts it
for (const m of hpMaps) for (let g = 0; g < 2; g++)
  playOne2("hp-" + m.id, () => createGame(buildAiArmyForMap("normal", m, g), buildAiArmyForMap("normal", m, g + 5), { map: m, rules: "hp", seed: 7 + g }), 2, +(process.env.MAXPLY || 220));

const bad = rows.filter((r) => !r.ok);
const byLabel = {};
for (const r of rows) { (byLabel[r.label] ??= []).push(r); }
for (const [k, v] of Object.entries(byLabel)) {
  const res = {}; v.forEach((r) => res[r.result.split(" ")[0]] = (res[r.result.split(" ")[0]] || 0) + 1);
  console.log(k.padEnd(16), "games:", v.length, "| avg plies:", Math.round(v.reduce((a, r) => a + r.plies, 0) / v.length),
    "| avg ms:", Math.round(v.reduce((a, r) => a + r.ms, 0) / v.length), "|", JSON.stringify(res));
}
console.log("\nRESULT:", rows.length - bad.length, "passed,", bad.length, "failed");
if (bad.length) bad.slice(0, 5).forEach((r) => console.log("  FAIL", r.label, r.result));
