// GEGENPROBE zur Monster-Balance: Die Feldwirkung in der Sim ist klein -
// das darf heissen "die Bots erreichen die Wesen selten", aber NIE "die
// Gaben feuern nicht". Hier zieht jede Gabe einmal an einer echten
// kind-X-Figur: Panzer schluckt, Gift trinkt, Fleisch heilt, Schemen blinzelt.
import { reduce, moveCommand, legalMovesFrom, idx } from "./src/core/index.js";
let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) { passed++; console.log("  ok  - " + name); } else { failed++; console.log("  FAIL- " + name); } };
const fig = (k, side, x) => ({ id: Math.floor(Math.random() * 1e9), kind: k, color: side, level: 1, abilities: [], used: {}, shield: 0, hp: 5, maxHp: 5, atk: 3, ...x });
const kings = (b) => { b[idx(7, 7, 8)] = fig("K", "w", {}); b[idx(0, 7, 8)] = fig("K", "b", {}); };
const hpState = (board) => ({ board, w: 8, h: 8, holes: new Set(), rules: "hp", turn: "w", potions: { w: 0, b: 0 }, shifts: { w: 0, b: 0 }, shiftArmed: null, captured: { w: [], b: [] }, history: [], lastMove: null, moveCount: 0, log: [], seed: 1 });

// 1) BULWARK am Monster: ein atk-3-Schlag kostet nur 2
let b1 = new Array(64).fill(null);
b1[idx(0, 0, 8)] = fig("Q", "w", { atk: 3 });
b1[idx(1, 1, 8)] = fig("X", "b", { abilities: ["bulwark"], hp: 9, maxHp: 9, moveSpec: { slides: [[1, 0], [-1, 0], [0, 1], [0, -1]], range: 1 } });
kings(b1);
let r1 = reduce(hpState(b1), moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: b1[idx(0, 0, 8)].id, kind: "Q", color: "w", capture: true, captureKind: "X" }));
ok("Panzer am Wesen: atk 3 trifft fuer 2 (9 -> 7)", r1.state.board[idx(1, 1, 8)].hp === 7);

// 2) LIFESTEAL vom Monster: v1.37.0 nach Stufe - hier Stufe II, also die Haelfte von 4
let b2 = new Array(64).fill(null);
b2[idx(0, 0, 8)] = fig("X", "b", { abilities: ["lifesteal"], stufen: { lifesteal: 2 }, hp: 3, maxHp: 9, atk: 4, moveSpec: { slides: [[1, 1]], range: 2 } });
b2[idx(1, 1, 8)] = fig("R", "w", { hp: 9, maxHp: 9 });
kings(b2);
let s2 = { ...hpState(b2), turn: "b" };
let r2 = reduce(s2, moveCommand({ from: idx(0, 0, 8), to: idx(1, 1, 8), piece: b2[idx(0, 0, 8)].id, kind: "X", color: "b", capture: true, captureKind: "R" }));
ok("Gift trinkt: Wesen heilt von 3 auf 5 beim Schlag", r2.state.board[idx(0, 0, 8)].hp === 5);

// 3) REGEN am Monster: v1.37.0 nach Stufe - hier Stufe II, also 1 je Zug
let b3 = new Array(64).fill(null);
b3[idx(0, 0, 8)] = fig("X", "b", { abilities: ["regen"], stufen: { regen: 2 }, hp: 4, maxHp: 9, moveSpec: { slides: [[1, 0]], range: 1 } });
kings(b3);
let s3 = { ...hpState(b3), turn: "b" };
let r3 = reduce(s3, moveCommand({ from: idx(0, 0, 8), to: idx(1, 0, 8), piece: b3[idx(0, 0, 8)].id, kind: "X", color: "b", capture: false, captureKind: null }));
ok("Fleisch heilt: nach dem Zug 4 -> 5", r3.state.board[idx(1, 0, 8)].hp === 5);

// 4) TELEPORT am Monster: der Blink erscheint in den legalen Zuegen
let b4 = new Array(64).fill(null);
b4[idx(3, 3, 8)] = fig("X", "b", { abilities: ["teleport"], moveSpec: { slides: [[1, 0], [-1, 0]], range: 1 } });
kings(b4);
let s4 = { ...hpState(b4), turn: "b" };
const zuege = legalMovesFrom(s4, idx(3, 3, 8));
ok("Schemen blinzelt: blink-Zug im Angebot", zuege.some((m) => m.special === "blink"));

// 5) DAS STUFENWERK: ueberproportionale Kosten, ein Gesetz fuer alle
import("./src/meta/leveling.js").then(({ bossUpgradeCost, bossSpecLeveled, upgradeBoss, BOSS_MAX_LEVEL }) => {
  import("./src/content/index.js").then(({ bossById }) => {
    const k = [2, 3, 4, 5].map(bossUpgradeCost);
    ok("Bestien lernen teuer: Kosten 5,7,9,11 steigen ueberproportional", k.join(",") === "5,7,9,11" && (k[1] - k[0]) === 2);
    const b = bossById("b01");
    const l5 = bossSpecLeveled(b, 5);
    /* v1.23.0: Rang 5 erreicht das ZIELPROFIL der Art (Waechter 19/5, ein
       Bollwerk), nicht mehr pauschal +4/+2 - siehe ZIEL_PROFIL_BOSS. */
    ok("Rang 5 erreicht das Zielprofil des Waechters: 19 Leben, 5 Angriff", l5.hp === 19 && l5.atk === 5 && l5.maxHp === l5.hp);
    const prof = { sp: 20, pieces: {}, campaign: { bribedBosses: ["b01"] }, stats: {} };
    const p1 = upgradeBoss(prof, "b01");
    ok("ein bestochenes Wesen steigt im Rang und zahlt", p1.pieces.bossLevels.b01 === 2 && p1.sp === 20 - bossUpgradeCost(2));
    const fremd = upgradeBoss({ sp: 20, pieces: {}, campaign: {}, stats: {} }, "b01");
    ok("ein fremdes Wesen lernt nicht", !fremd.pieces?.bossLevels?.b01);
    console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
    if (failed) process.exit(1);
  });
});
if (failed) process.exit(1);
