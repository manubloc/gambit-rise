/* ── v1.35.0: WIE VIEL STAERKER MACHT DIE BESETZUNG EINE STATION? ──────────
   Spielt dasselbe Stationsheer MIT Besetzung (ein Stand, der allen begegnet
   ist und niemanden besitzt - die volle Besetzung) gegen sich selbst OHNE
   Besetzung, gleiche Stufen, Farben im Wechsel, 10 Partien je Station.
   Ziel: das besetzte Heer nahe 50 %, Partien nahe der Grundlinie (56).
   Stand 22.9.2026: 1 Platz 47 %, 2 Plaetze 50 %, 3 Plaetze 42 % (17
   Stationen), 45-58 Halbzuege.
   Aufruf: npm run besetzung            (alle drei Groessen, je 6 Stationen)
           npm run besetzung -- 3 40    (nur 3 Plaetze, bis 40 Stationen) */
import { createGame, applyMove, status, makeRng } from "../src/core/index.js";
import { chooseMove } from "../src/ai/index.js";
import { buildStageMatch } from "../src/meta/campaign.js";
import { besetzungsPlan } from "../src/meta/besetzung.js";
import { CAMPAIGN12 } from "../src/content/campaign12.gen.js";
import { CHARACTER_LIST } from "../src/content/index.js";
import { BOSSES, LEAGUE_BOSSES } from "../src/content/bosses.js";
import { mapById } from "../src/content/maps.js";
const G = new Set(["pawn", "gambit", "king", "queen", "rook", "bishop", "knight", "dragon"]);
// ein Stand, der allen begegnet ist und niemanden besitzt - die staerkste Besetzung
const alle = { stats: { games: 0 }, codex: { met: [...CHARACTER_LIST.filter((c) => !G.has(c.id)).map((c) => c.kind), ...BOSSES.filter((b) => !LEAGUE_BOSSES.includes(b.id)).map((b) => "X:" + b.id)] }, campaign: { unlocked: [], bribedBosses: [] } };
function partie(a, b, map, keim) {
  let g = createGame(a, b, { rules: "hp", map, seed: keim }); const r = makeRng(keim);
  for (let n = 0; n < 160; n++) { const st = status(g); if (st.over) return [st.winner || null, n]; const m = chooseMove(g, 1, r); if (!m) return [null, n]; g = applyMove(g, m); }
  return [null, 160];
}
for (const k of (process.argv[2] ? [Number(process.argv[2])] : [1, 2, 3])) {
  const stationen = CAMPAIGN12.filter((n) => n.rules === "hp" && besetzungsPlan(n).k === k && !besetzungsPlan(n).wechselnd).slice(0, Number(process.argv[3] || 6));
  let s = 0, n = 0, u = 0, z = 0, zk = 0;
  for (const st of stationen) {
    const mit = buildStageMatch(st.id, alle), ohne = buildStageMatch(st.id, null);
    const map = mapById(mit.map);
    for (let i = 0; i < 10; i++) {
      const mitWeiss = i % 2 === 0;
      const [w, zuege] = partie(mitWeiss ? mit.aiArmy : ohne.aiArmy, mitWeiss ? ohne.aiArmy : mit.aiArmy, map, 500 + i * 31 + st.id.length);
      n++; z += zuege;
      if (!w) u++; else if ((w === "w") === mitWeiss) s++;
    }
    zk += 1;
    if (process.argv[2]) console.log("  ", st.id, "L" + st.league, (mit.besetzung?.eintraege || []).join(","), "| Aufstellung", mit.aiArmy.back.map((sp) => sp ? (sp.bossId || sp.kind) : "-").join(" "));
  }
  console.log(`${k} Platz/Plaetze besetzt: ${stationen.length} Stationen, ${n} Partien - das besetzte Heer gewinnt ${Math.round(100 * s / n)} %, offen ${Math.round(100 * u / n)} %, Partie ${Math.round(z / n)} Halbzuege`);
}
