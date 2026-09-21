// The Hall (Durable-Object multiplayer core) — protocol tests on the memory store.
import { HallCore, memoryStore } from "./worker/src/logic.mjs";
import { createGame, reduce, moveCommand, legalMoves } from "./src/core/index.js";
import { mapById } from "./src/content/index.js";
import { buildArmyFromFormation } from "./src/meta/index.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  ok  -", name); } else { fail++; console.log(" FAIL -", name); } };

function mkHall(t0 = 1000) {
  const outbox = [];
  const pings = [];   // every notify() the core fired — the web-push mailbox
  let clock = t0;
  const hall = new HallCore({
    store: memoryStore(),
    send: (id, obj) => outbox.push({ ...obj, _to: id }),
    now: () => clock,
    adminToken: "super-secret-admin-token-24chars",
    notify: (id, data) => pings.push({ ...data, _to: id }),
    pushKey: "TEST-VAPID-KEY",
  });
  return { hall, outbox, pings, tick: (ms) => { clock += ms; },
    last: (t, to) => [...outbox].reverse().find((m) => m.t === t && (!to || m._to === to)),
    lastPing: (kind, to) => [...pings].reverse().find((m) => m.kind === kind && (!to || m._to === to)) };
}

// ── hello / identity ─────────────────────────────────────────────────────────
{
  const { hall, outbox, last } = mkHall();
  const me = hall.handle(null, { t: "hello", id: "p1", secret: "L01s09", name: "Ana", score: 200 });
  ok("hello signs the player in and welcomes them", me === "p1" && last("welcome").you.name === "Ana" && last("welcome").online === 1);
  let threw = null;
  try { hall.handle(null, { t: "hello", id: "p1", secret: "WRONG", name: "Eve" }); } catch (e) { threw = e.message; }
  ok("a wrong secret cannot steal an identity", threw === "identity taken");
  threw = null;
  try { hall.handle(null, { t: "queue" }); } catch (e) { threw = e.message; }
  ok("messages before hello are rejected", threw === "hello first");
  ok("names are capped at 20 chars", hall.handle(null, { t: "hello", id: "p9", secret: "x", name: "A".repeat(40) }) === "p9" && hall.player("p9").name.length === 20);
}

// ── matchmaking: score bands widen over time ─────────────────────────────────
{
  const { hall, last, tick } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 1000 });
  hall.handle("a", { t: "queue", maps: ["classic"], army: ["p"] });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"] });
  ok("a 1000-point gap does not match instantly", Object.keys(hall.matches).length === 0 && hall.queue.length === 2);
  tick(80_000); // band grows to 150 + 16*60 = 1110
  hall.handle("b", { t: "dequeue" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"] });
  // b's `since` is fresh, but a has waited: min(since) counts
  ok("waiting widens the band until they match", Object.keys(hall.matches).length === 1);
  const m = last("match", "a");
  ok("both seats get the same match with opposing colors",
    m && last("match", "b") && m.matchId === last("match", "b").matchId && m.youAre !== last("match", "b").youAre);
  ok("each side receives the opponent's army", Array.isArray(last("match", "a").oppArmy) && last("match", "b").oppArmy[0] !== undefined);
}

// ── move relay + result + rating ─────────────────────────────────────────────
{
  const { hall, outbox, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 100 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 100 });
  hall.handle("a", { t: "queue", maps: ["classic"] });
  hall.handle("b", { t: "queue", maps: ["classic"] });
  const mid = last("match", "a").matchId;
  const white = last("match", "a").youAre === "w" ? "a" : "b";
  const black = white === "a" ? "b" : "a";
  hall.handle("a", { t: "cmd", matchId: mid, cmd: { mv: 1 }, n: 1, hash: "h1" });
  const relayed = last("cmd", "b");
  ok("moves relay to the opponent with sequence and hash", relayed && relayed.n === 1 && relayed.hash === "h1");
  hall.handle(white, { t: "result", matchId: mid, winner: "w" });
  ok("the board result rates both players (Elo, zero-sum)",
    hall.player(white).rating === 1016 && hall.player(black).rating === 984 &&
    hall.player(white).wins === 1 && hall.player(black).losses === 1);
  ok("the match parks in the rematch window", hall.matches[mid] === undefined && hall.finished[mid] !== undefined);
  hall.handle(white, { t: "result", matchId: mid, winner: "w" });
  ok("a second result report is ignored", hall.player(white).rating === 1016);
}

// ── resign / disconnect ──────────────────────────────────────────────────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 0 });
  hall.handle("a", { t: "queue", maps: ["classic"] });
  hall.handle("b", { t: "queue", maps: ["classic"] });
  const mid = last("match", "a").matchId;
  hall.handle("a", { t: "resign" });
  ok("resigning informs the opponent and loses the game",
    last("oppResign", "b")?.matchId === mid && hall.player("a").losses === 1 && hall.player("b").wins === 1);
  hall.handle("a", { t: "queue", maps: ["classic"] });
  hall.handle("b", { t: "queue", maps: ["classic"] });
  hall.close("b");
  ok("a dropped connection ends the match for the opponent", last("oppLeft", "a") !== undefined && hall.player("b").losses === 1 && hall.player("a").wins === 1);
}

// ── rematch: seats swap ──────────────────────────────────────────────────────
{
  const { hall, last, tick } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 0 });
  hall.handle("a", { t: "queue", maps: ["classic"] });
  hall.handle("b", { t: "queue", maps: ["classic"] });
  const m1 = last("match", "a");
  const w1 = m1.youAre === "w" ? "a" : "b";
  hall.handle(w1, { t: "result", matchId: m1.matchId, winner: "draw" });
  hall.handle("a", { t: "rematch", matchId: m1.matchId });
  ok("the first rematch wish notifies the other side", last("rematchOffer", "b")?.matchId === m1.matchId);
  hall.handle("b", { t: "rematch", matchId: m1.matchId });
  const m2 = last("match", "a");
  ok("both wishes start a rematch with swapped seats", m2.matchId !== m1.matchId && m2.youAre !== m1.youAre);
  // window expiry
  const w2 = m2.youAre === "w" ? "a" : "b";
  hall.handle(w2, { t: "result", matchId: m2.matchId, winner: "draw" });
  tick(130_000);
  hall.handle("a", { t: "rematch", matchId: m2.matchId });
  ok("the rematch window expires after two minutes", last("match", "a").matchId === m2.matchId);
}

// ── friends, gifts, challenge privacy ────────────────────────────────────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 0, privacy: "friends" });
  let threw = null;
  try { hall.handle("a", { t: "challenge", targetId: "b" }); } catch (e) { threw = e.message; }
  ok("friends-only players cannot be challenged by strangers", threw === "friends only");
  try { hall.handle("a", { t: "gift", to: "b" }); } catch (e) { threw = e.message; }
  ok("gifts require friendship", threw === "not friends");
  hall.handle("a", { t: "friendRequest", code: "b" });
  hall.handle("b", { t: "friendRespond", id: "a", accept: true });
  ok("accepting links both friend lists", hall.player("a").friends.includes("b") && hall.player("b").friends.includes("a"));
  hall.handle("a", { t: "gift", to: "b" });
  ok("the carrier pigeon lands (10 gold)", last("gift", "b")?.gold === 10 && last("giftSent", "a")?.to === "b");
  hall.handle("a", { t: "challenge", targetId: "b" });
  const ch = last("challenge", "b");
  hall.handle("b", { t: "challengeRespond", challengeId: ch.challengeId, accept: true, maps: ["classic"] });
  ok("an accepted friend challenge starts a match", last("match", "a") !== undefined && last("match", "b") !== undefined);
}

// ── vault ────────────────────────────────────────────────────────────────────
{
  const { hall, last, tick } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  let threw = null;
  try { hall.handle("a", { t: "vaultPush", save: "tiny" }); } catch (e) { threw = e.message; }
  ok("undersized vault pushes are rejected", threw === "bad size");
  for (let i = 0; i < 7; i++) { hall.handle("a", { t: "vaultPush", save: "x".repeat(30) + i, meta: { league: i, gold: i * 10 } }); tick(10); }
  const list = last("vault", "a").list;
  ok("the vault keeps the newest five snapshots, metadata only", list.length === 5 && list[0].league === 6 && list[0].data === undefined);
  hall.handle("a", { t: "vaultPull", ts: list[0].ts });
  ok("pulling returns the full save", last("vaultSave", "a").save.endsWith("6"));
}

// ── leaderboard + admin ──────────────────────────────────────────────────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 0 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 0 });
  hall.player("b").rating = 1200; hall.savePlayer({ ...hall.player("b"), rating: 1200 });
  hall.handle("a", { t: "leaderboard" });
  const lb = last("leaderboard", "a");
  ok("the duel leaderboard sorts by rating and ranks me", lb.top[0].id === "b" && lb.me.rank === 2);
  let threw = null;
  try { hall.handle("a", { t: "admin", cmd: "stats", token: "wrong-token-wrong-token-wrong" }); } catch (e) { threw = e.message; }
  ok("wrong admin tokens are denied", threw === "denied");
  hall.handle("a", { t: "admin", cmd: "stats", token: "super-secret-admin-token-24chars" });
  ok("the right token reads stats", last("admin", "a").players === 2);
  hall.handle("a", { t: "set", stats: { games: 12, wins: 7, league: 3, playtimeSec: 3600, secret: "leak", evil: 9 } });
  hall.handle("a", { t: "admin", cmd: "dump", token: "super-secret-admin-token-24chars" });
  const dmp = last("admin", "a");
  const rowA = dmp.players.find((r) => r.id === "a");
  ok("admin dump lists players with their mirrored stats", !!rowA && rowA.stats.games === 12 && rowA.stats.league === 3 && rowA.stats.playtimeSec === 3600);
  ok("admin dump never leaks secrets or junk fields", dmp.players.every((r) => r.secret === undefined) && rowA.stats.secret === undefined && rowA.stats.evil === undefined);
  for (let i = 0; i < 5; i++) { try { hall.handle("a", { t: "admin", cmd: "stats", token: "nope-nope-nope-nope-nope-" }, "1.2.3.4"); } catch {} }
  try { hall.handle("a", { t: "admin", cmd: "stats", token: "super-secret-admin-token-24chars" }, "1.2.3.4"); } catch (e) { threw = e.message; }
  ok("five failures lock the source out", threw === "locked");
}


// ── classic mode: classic meets classic, duel meets duel ─────────────────────
{
  const { hall, last } = mkHall();
  const c1 = hall.handle(null, { t: "hello", id: "L01s22", secret: "L01s09", name: "C1", score: 100 });
  const c2 = hall.handle(null, { t: "hello", id: "L01s23", secret: "s2", name: "C2", score: 100 });
  const d1 = hall.handle(null, { t: "hello", id: "L01s30", secret: "s3", name: "D1", score: 100 });
  hall.handle(c1, { t: "queue", maps: ["classic"], army: ["k"], mode: "classic" });
  hall.handle(d1, { t: "queue", maps: ["classic"], army: ["k"] });
  ok("a classic seeker never pairs with a duelist", Object.keys(hall.matches).length === 0);
  hall.handle(c2, { t: "queue", maps: ["classic"], army: ["k"], mode: "classic" });
  const mids = Object.keys(hall.matches);
  ok("two classic seekers pair up", mids.length === 1 && hall.matches[mids[0]].mode === "classic");
  const m = last("match");
  ok("a classic room plays mate rules", !!m && m.rules === "chess" && m.mode === "classic");
}


// ── per-map armies: the match uses the formation saved for the map that was
// actually picked, never the one saved for some other candidate map ─────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "L01s41", secret: "s", name: "E1", score: 0 });
  hall.handle(null, { t: "hello", id: "L01s42", secret: "s", name: "E2", score: 0 });
  // e1 only has "gauntlet" in common with e2; both bring per-map armies plus
  // a legacy single .army that must NOT be used once a map-specific one exists.
  hall.handle("L01s41", { t: "queue", maps: ["arena", "gauntlet"], army: ["ARENA_ARMY_E1"],
    armies: { arena: ["ARENA_ARMY_E1"], gauntlet: ["GAUNTLET_ARMY_E1"] } });
  hall.handle("L01s42", { t: "queue", maps: ["gauntlet"], army: ["GAUNTLET_ARMY_E2"],
    armies: { gauntlet: ["GAUNTLET_ARMY_E2"] } });
  const mids = Object.keys(hall.matches);
  ok("players with only one map in common are matched on it", mids.length === 1 && hall.matches[mids[0]].map === "gauntlet");
  const m = hall.matches[mids[0]];
  const bothArmies = [m.armyW, m.armyB].map((a) => a[0]);
  ok("the match uses each side's GAUNTLET army, not their arena one",
    bothArmies.includes("GAUNTLET_ARMY_E1") && bothArmies.includes("GAUNTLET_ARMY_E2"));
  const msgs = ["L01s41", "L01s42"].map((id) => last("match", id));
  ok("oppArmy shown to each side is also the map-correct one", msgs.every((mm) => mm.oppArmy[0] === "GAUNTLET_ARMY_E1" || mm.oppArmy[0] === "GAUNTLET_ARMY_E2"));
}

// ── ONE CLOCK ONLY EVER MEETS ITS OWN ───────────────────────────────────────
// A bullet player pulled into a rapid game would lose on time through no fault
// of their own — the matchmaker must keep the formats apart, and must tell the
// board which clock was agreed.
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 500 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 500 });
  hall.handle("a", { t: "queue", maps: ["classic"], army: ["p"], tc: "quick" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"], tc: "prime" });
  ok("a bullet player is not thrown into a rapid game", Object.keys(hall.matches).length === 0);

  hall.handle("b", { t: "dequeue" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"], tc: "quick" });
  ok("two players on the same clock are paired", Object.keys(hall.matches).length === 1);
  const ma = last("match", "a"), mb = last("match", "b");
  ok("the match names that clock", ma && ma.tc === "quick");
  ok("both sides are told the same clock", ma && mb && ma.tc === mb.tc);
}

// ── CORRESPONDENCE: THE GAME THAT SURVIVES GOING OFFLINE ────────────────────
// This is the whole point of Classic Gambit: a live match dies when a socket
// closes, a daily game must not. It is filed with seed, both armies and the
// ordered commands, so a returning player replays it exactly.
{
  const { hall, last, tick } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 500 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 500 });
  hall.handle("a", { t: "queue", maps: ["classic"], army: ["p"], tc: "daily" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"], tc: "daily" });

  ok("a daily pairing opens no live seat", Object.keys(hall.matches).length === 0);
  const nw = last("daily:new", "a");
  ok("both players are told a game was filed", !!nw && !!last("daily:new", "b"));
  const gid = nw.gameId;

  hall.handle("a", { t: "daily:list" });
  const list = last("daily:list", "a");
  ok("the shelf lists the game", list && list.games.length === 1 && list.games[0].gameId === gid);
  const mine = list.games[0];
  ok("it says whose move it is", mine.yourTurn === (mine.youAre === "w"));
  ok("it names the opponent", mine.opp.name === "Bo");
  ok("it carries a deadline in the future", mine.deadline > 0);

  // THE DISCONNECT that would kill a live match
  hall.close("a"); hall.close("b");
  ok("closing both sockets does NOT end the game", !hall.daily[gid].done);

  // the player to move returns and plays
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 500 });
  const g0 = hall.daily[gid];
  const mover = g0.turn === "w" ? g0.w : g0.b;
  const other = mover === g0.w ? g0.b : g0.w;
  hall.handle(mover, { t: "daily:open", gameId: gid });
  const opened = last("daily:game", mover);
  ok("opening returns everything needed to rebuild the board",
    opened && opened.game.seed != null && opened.game.armyW && opened.game.armyB && Array.isArray(opened.game.moves));

  hall.handle(mover, { t: "daily:move", gameId: gid, cmd: { t: "move", from: 8, to: 16 } });
  ok("the move is filed", hall.daily[gid].moves.length === 1);
  ok("and the turn passes", hall.daily[gid].turn !== g0.turn);
  ok("the mover is acknowledged", !!last("daily:ok", mover));

  // the WRONG player may not move
  const before = hall.daily[gid].moves.length;
  hall.handle(mover, { t: "daily:move", gameId: gid, cmd: { t: "move", from: 9, to: 17 } });
  ok("nobody may move twice in a row", hall.daily[gid].moves.length === before);
  hall.handle("zz", { t: "daily:move", gameId: gid, cmd: { t: "move", from: 9, to: 17 } });
  ok("a stranger cannot touch the game", hall.daily[gid].moves.length === before);

  // the deadline decides an abandoned game
  tick(4 * 24 * 60 * 60 * 1000);
  hall.handle(mover, { t: "daily:list" });
  ok("a game left past its deadline is decided", !!hall.daily[gid].done);
  ok("and it is decided against whoever owed the move", hall.daily[gid].done.reason === "time");
  ok("both players are told", !!last("daily:over", mover) && !!last("daily:over", other));
}

// ── correspondence: resigning ───────────────────────────────────────────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "A", score: 100 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "B", score: 100 });
  hall.handle("a", { t: "queue", maps: ["classic"], army: ["p"], tc: "daily" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: ["q"], tc: "daily" });
  const gid = last("daily:new", "a").gameId;
  hall.handle("a", { t: "daily:resign", gameId: gid });
  ok("resigning ends a daily game", !!hall.daily[gid].done && hall.daily[gid].done.reason === "resign");
  ok("the winner is the other side", hall.daily[gid].done.winner === (hall.daily[gid].w === "a" ? "b" : "w"));
  ok("a finished game accepts no further moves", (() => {
    const n = hall.daily[gid].moves.length;
    hall.handle("b", { t: "daily:move", gameId: gid, cmd: { t: "move", from: 8, to: 16 } });
    return hall.daily[gid].moves.length === n;
  })());
}

// ── THE LONG GAME, PLAYED FOR REAL ──────────────────────────────────────────
// Not a mock: four half-moves are played through the actual rules engine, on
// four different days, with BOTH players offline in between. What is stored is
// only seed + armies + commands, so the proof that matters is that each side,
// rebuilding independently, lands on the identical position.
{
  const { hall, last, tick } = mkHall();
  const army = () => buildArmyFromFormation(() => 1, mapById("classic").defaultFormation);
  const rebuild = (g) => {
    let st = createGame(g.armyW, g.armyB, { map: mapById(g.map), rules: g.rules, seed: g.seed >>> 0 });
    for (const c of g.moves) st = reduce(st, c).state;
    return st;
  };
  const sig = (st) => st.board.map((p) => p && p.kind + p.color + (p.hp ?? "")).join(",");

  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 500 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 500 });
  hall.handle("a", { t: "queue", maps: ["classic"], army: army(), tc: "daily" });
  hall.handle("b", { t: "queue", maps: ["classic"], army: army(), tc: "daily" });
  const gid = last("daily:new", "a").gameId;
  hall.close("a"); hall.close("b");

  let played = 0;
  for (let i = 0; i < 4; i++) {
    tick(20 * 60 * 60 * 1000);                       // a day (nearly) passes
    const rec = hall.daily[gid];
    const who = rec.turn === "w" ? rec.w : rec.b;
    hall.handle(null, { t: "hello", id: who, secret: "s", name: who, score: 500 });
    hall.handle(who, { t: "daily:open", gameId: gid });
    const g = last("daily:game", who).game;
    const st = rebuild(g);
    const mv = legalMoves(st)[0];
    if (!mv) break;
    hall.handle(who, { t: "daily:move", gameId: gid, cmd: moveCommand(mv) });
    hall.close(who);                                  // and away again
    played++;
  }
  ok("four half-moves are played across four days offline", played === 4);
  ok("the server holds exactly those commands", hall.daily[gid].moves.length === 4);
  ok("the game is still open", !hall.daily[gid].done);

  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 500 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 500 });
  hall.handle("a", { t: "daily:open", gameId: gid });
  hall.handle("b", { t: "daily:open", gameId: gid });
  const sa = rebuild(last("daily:game", "a").game);
  const sb = rebuild(last("daily:game", "b").game);
  ok("both players rebuild the IDENTICAL position", sig(sa) === sig(sb));
  ok("and agree whose move it is", sa.turn === sb.turn);
  ok("the position really moved on from the start", sig(sa) !== sig(rebuild({ ...last("daily:game", "a").game, moves: [] })));
}

// ═════════════════════════ WEB PUSH — the knock on the closed app ═══════════
import { generateVapid, vapidAuth, encryptPayload, sendPush, deliverPushes, pushText, b64u, unb64u }
  from "./worker/src/webpush.mjs";

const subtle = globalThis.crypto.subtle;
const te2 = new TextEncoder();
const cat2 = (...parts) => { const n = parts.reduce((a, p) => a + p.length, 0); const out = new Uint8Array(n); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out; };
const hmac2 = async (key, data) => { const k = await subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return new Uint8Array(await subtle.sign("HMAC", k, data)); };

// ── VAPID: a self-made pair really signs a token the push service can check ──
{
  const vapid = await generateVapid();
  const rawPub = unb64u(vapid.publicKey);
  ok("vapid public key is a 65-byte uncompressed P-256 point", rawPub.length === 65 && rawPub[0] === 4);
  const auth = await vapidAuth("https://fcm.googleapis.com/fcm/send/abc123", vapid, { nowSec: 1_700_000_000 });
  ok("authorization header carries the vapid scheme and the key", /^vapid t=[^,]+, k=/.test(auth) && auth.endsWith(vapid.publicKey));
  const token = auth.slice("vapid t=".length, auth.indexOf(", k="));
  const [h, c, s] = token.split(".");
  const header = JSON.parse(Buffer.from(h, "base64url").toString());
  const claims = JSON.parse(Buffer.from(c, "base64url").toString());
  ok("token claims: ES256, audience is the endpoint ORIGIN, exp in the future", header.alg === "ES256" && claims.aud === "https://fcm.googleapis.com" && claims.exp === 1_700_000_000 + 12 * 3600);
  const verifyKey = await subtle.importKey("jwk", vapid.publicJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const good = await subtle.verify({ name: "ECDSA", hash: "SHA-256" }, verifyKey, unb64u(s), te2.encode(`${h}.${c}`));
  ok("the ES256 signature verifies against the public key", good === true);
}

// ── RFC 8291: an INDEPENDENT decryptor (built here from the RFC's prose, not
//    from webpush.mjs) recovers the plaintext byte for byte ─────────────────
{
  // the browser's side of the handshake, played by the test
  const ua = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const uaPubRaw = new Uint8Array(await subtle.exportKey("raw", ua.publicKey));
  const authSecret = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const sub = { p256dh: b64u(uaPubRaw), auth: b64u(authSecret) };
  // a FIXED sender pair + salt so the run is reproducible
  const as = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asJwk = { ...(await subtle.exportKey("jwk", as.privateKey)), publicRaw: b64u(new Uint8Array(await subtle.exportKey("raw", as.publicKey))) };
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const plain = te2.encode("When I grow up, I want to be a watermelon");
  const body = await encryptPayload(sub, plain, { asJwk, salt: b64u(salt) });

  // header anatomy straight from RFC 8188: salt(16) | rs(4) | idlen(1) | keyid
  const rs = (body[16] << 24 | body[17] << 16 | body[18] << 8 | body[19]) >>> 0;
  const idlen = body[20];
  const asPubFromHeader = body.slice(21, 21 + idlen);
  ok("record header: our salt, rs=4096, a 65-byte sender key id", body.slice(0, 16).join() === salt.join() && rs === 4096 && idlen === 65 && asPubFromHeader.join() === unb64u(asJwk.publicRaw).join());

  // now decrypt with NOTHING but the RFC text: ECDH, the two-step HKDF, AES-GCM
  const asPubKey = await subtle.importKey("raw", asPubFromHeader, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdh = new Uint8Array(await subtle.deriveBits({ name: "ECDH", public: asPubKey }, ua.privateKey, 256));
  const prkKey = await hmac2(authSecret, ecdh);
  const keyInfo = cat2(te2.encode("WebPush: info"), new Uint8Array([0]), uaPubRaw, asPubFromHeader);
  const ikm = (await hmac2(prkKey, cat2(keyInfo, new Uint8Array([1])))).slice(0, 32);
  const prk = await hmac2(body.slice(0, 16), ikm);
  const cek = (await hmac2(prk, cat2(te2.encode("Content-Encoding: aes128gcm"), new Uint8Array([0, 1])))).slice(0, 16);
  const nonce = (await hmac2(prk, cat2(te2.encode("Content-Encoding: nonce"), new Uint8Array([0, 1])))).slice(0, 12);
  const aes = await subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]);
  const opened = new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: nonce }, aes, body.slice(21 + idlen)));
  ok("the last record ends with the 0x02 delimiter", opened[opened.length - 1] === 2);
  ok("the independent decryptor recovers the plaintext byte for byte",
    new TextDecoder().decode(opened.slice(0, -1)) === "When I grow up, I want to be a watermelon");
  let tampered = false;
  try { const bad = body.slice(); bad[bad.length - 1] ^= 1; await subtle.decrypt({ name: "AES-GCM", iv: nonce }, aes, bad.slice(21 + idlen)); tampered = true; } catch {}
  ok("a flipped ciphertext bit is rejected by the GCM tag", tampered === false);
}

// ── sendPush: headers, encoding, and the 410 funeral ─────────────────────────
{
  const vapid = await generateVapid();
  const ua = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const sub = { endpoint: "https://push.example.com/box/1",
    keys: { p256dh: b64u(new Uint8Array(await subtle.exportKey("raw", ua.publicKey))), auth: b64u(globalThis.crypto.getRandomValues(new Uint8Array(16))) } };
  let seen = null;
  const fetch201 = async (url, init) => { seen = { url, init }; return { status: 201 }; };
  const r1 = await sendPush(sub, { title: "x" }, vapid, { fetchFn: fetch201 });
  ok("a payload push is ok on 201 and aes128gcm-encoded with a vapid pass",
    r1.ok && !r1.gone && seen.url === sub.endpoint
    && seen.init.headers["Content-Encoding"] === "aes128gcm"
    && /^vapid t=/.test(seen.init.headers.Authorization)
    && seen.init.body instanceof Uint8Array && seen.init.body.length > 86);
  const r2 = await sendPush(sub, null, vapid, { fetchFn: fetch201 });
  ok("a bare wake-up carries no body and no content-encoding", r2.ok && seen.init.body === null && !("Content-Encoding" in seen.init.headers));
  const r3 = await sendPush(sub, { title: "x" }, vapid, { fetchFn: async () => ({ status: 410 }) });
  ok("410 marks the subscription as gone", !r3.ok && r3.gone === true);
  const r4 = await sendPush({ endpoint: "http://insecure" }, null, vapid, { fetchFn: fetch201 });
  ok("a non-https endpoint is buried before any network call", !r4.ok && r4.gone === true);
  const two = [sub, { ...sub, endpoint: "https://push.example.com/box/dead" }];
  const seq = [{ status: 201 }, { status: 410 }]; let i = 0;
  const { sent, gone } = await deliverPushes(two, { title: "x" }, vapid, { fetchFn: async () => seq[i++] });
  ok("deliverPushes fans out and returns the dead endpoint", sent === 1 && gone.length === 1 && gone[0].endsWith("/dead"));
}

// ── pushText: words in both tongues for every kind ───────────────────────────
{
  const kinds = ["turn", "new", "deadline", "over"];
  let good = true;
  for (const k of kinds) for (const lang of ["de", "en"]) {
    const { title, body } = pushText(k, { opp: "Bo", hours: 5, won: true, reason: "time" }, lang);
    if (!title || !body) good = false;
  }
  ok("every kind yields a title and body in de and en", good);
  ok("the turn nudge names the opponent", pushText("turn", { opp: "Bo" }, "de").title.includes("Bo") && pushText("turn", { opp: "Bo" }, "en").title.includes("Bo"));
  ok("a lost game on time says so", pushText("over", { opp: "Bo", won: false, reason: "time" }, "de").body.includes("auf Zeit"));
}

// ── the Hall speaks push: key in the welcome, subscribe, off ─────────────────
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 100, lang: "en" });
  ok("welcome hands the browser the vapid key", last("welcome", "a").push === "TEST-VAPID-KEY");
  ok("hello remembers the player's language", hall.player("a").lang === "en");
  hall.handle("a", { t: "push:subscribe", sub: { endpoint: "https://push.example.com/a1", keys: { p256dh: "P", auth: "A" } } });
  ok("push:subscribe files the address and answers on:true", hall.store.pushList("a").length === 1 && last("push:ok", "a").on === true);
  hall.handle("a", { t: "push:subscribe", sub: { endpoint: "https://push.example.com/a2", keys: { p256dh: "P", auth: "A" } } });
  ok("a second device lives alongside the first", hall.store.pushList("a").length === 2);
  for (let i = 3; i <= 7; i++) hall.handle("a", { t: "push:subscribe", sub: { endpoint: "https://push.example.com/a" + i, keys: { p256dh: "P", auth: "A" } } });
  ok("the cap keeps five devices, oldest falls off", hall.store.pushList("a").length === 5 && !hall.store.pushList("a").some((s) => s.endpoint.endsWith("/a1")));
  let threw = null;
  try { hall.handle("a", { t: "push:subscribe", sub: { endpoint: "http://plain.example.com/x", keys: { p256dh: "P", auth: "A" } } }); } catch (e) { threw = e.message; }
  ok("an insecure endpoint is refused", threw === "bad endpoint");
  threw = null;
  try { hall.handle("a", { t: "push:subscribe", sub: { endpoint: "https://ok.example.com/x", keys: { p256dh: "P" } } }); } catch (e) { threw = e.message; }
  ok("missing keys are refused", threw === "bad keys");
  hall.handle("a", { t: "push:off" });
  ok("push:off clears every device and answers on:false", hall.store.pushList("a").length === 0 && last("push:ok", "a").on === false);
}

// ── the nudges: who is knocked on, and when ──────────────────────────────────
{
  const { hall, pings, lastPing, tick, last } = mkHall(50_000);
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 100 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 100 });
  // a daily challenge between friends-to-be: pair via challenge with tc daily
  hall.handle("a", { t: "challenge", targetId: "b", maps: ["classic"], army: { x: 1 }, mode: "classic", tc: "daily" });
  const ch = last("challenge", "b");
  hall.handle("b", { t: "challengeRespond", challengeId: ch.challengeId, accept: true, maps: ["classic"], army: { x: 1 } });
  const gid = last("daily:new", "a").gameId;
  ok("a daily challenge files a correspondence game, no live match", gid && Object.keys(hall.matches).length === 0);
  ok("both being online, the pairing sent NO push", pings.length === 0);

  const rec0 = hall.daily[gid];
  const whiteId = rec0.w, blackId = rec0.b;
  const oppOf = (id) => (id === "a" ? "b" : "a");
  // black leaves; the pairing already happened, so only moves nudge from here
  hall.close(blackId);
  hall.handle(whiteId, { t: "daily:move", gameId: gid, cmd: { k: "mv", n: 1 } });
  ok("a move against a CLOSED app fires the turn nudge, naming the mover",
    lastPing("turn", blackId) && lastPing("turn", blackId).gameId === gid && lastPing("turn", blackId).opp === hall.player(whiteId).name);
  ok("the game itself is untouched by the nudge", hall.daily[gid].moves.length === 1 && hall.daily[gid].turn !== rec0.turn);

  // black returns and answers while white stays online: no push for white
  hall.connect(blackId);
  const before = pings.length;
  hall.handle(blackId, { t: "daily:move", gameId: gid, cmd: { k: "mv", n: 2 } });
  ok("a move against an OPEN app sends only the socket message", pings.length === before && last("daily:turn", whiteId).moves === 2);

  // the reminder: 24h before the deadline, aimed at whoever owes the move
  const rec1 = hall.daily[gid];
  const owe = rec1.turn === "w" ? rec1.w : rec1.b;
  hall.close(owe);
  tick(2 * 24 * 60 * 60 * 1000 + 60 * 1000);   // into the final day
  hall.sweepDaily();
  ok("the last-day reminder knocks once on the player who owes the move",
    lastPing("deadline", owe) && lastPing("deadline", owe).hours <= 24 && hall.daily[gid].reminded === true);
  const n1 = pings.length;
  hall.sweepDaily();
  ok("the reminder does not repeat", pings.length === n1);

  // the deadline passes: the ower loses on time, both absentees are told
  hall.close(oppOf(owe));
  tick(24 * 60 * 60 * 1000 + 60 * 1000);
  hall.sweepDaily();
  const done = hall.daily[gid].done;
  ok("the game is decided against whoever owed the move", done && done.reason === "time" && done.winner === (rec1.turn === "w" ? "b" : "w"));
  ok("the loser's nudge says lost, the winner's says won",
    lastPing("over", owe) && lastPing("over", owe).won === false && lastPing("over", oppOf(owe)) && lastPing("over", oppOf(owe)).won === true);
  ok("the ladder settled the time loss", last("rated", owe) && last("rated", oppOf(owe)));
}

// ── resign nudge + a fresh move resets the reminder ──────────────────────────
{
  const { hall, lastPing, tick, last } = mkHall(10_000);
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 100 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 100 });
  hall.handle("a", { t: "challenge", targetId: "b", maps: ["classic"], army: {}, mode: "classic", tc: "daily" });
  hall.handle("b", { t: "challengeRespond", challengeId: last("challenge", "b").challengeId, accept: true, maps: ["classic"], army: {} });
  const gid = last("daily:new", "a").gameId;
  const w = hall.daily[gid].w, b = hall.daily[gid].b;
  tick(2 * 24 * 60 * 60 * 1000 + 5000);
  hall.sweepDaily();
  ok("reminder armed on the first owed move", hall.daily[gid].reminded === true);
  hall.handle(w, { t: "daily:move", gameId: gid, cmd: { k: "mv" } });
  ok("a fresh move resets clock AND reminder", hall.daily[gid].reminded === false && hall.daily[gid].deadline > hall.now());
  hall.close(w);
  hall.handle(b, { t: "daily:resign", gameId: gid });
  ok("resigning nudges the absent opponent with the win", lastPing("over", w) && lastPing("over", w).won === true && lastPing("over", w).reason === "resign");
}

// ── nextAlarmAt: the Hall knows when to wake itself ──────────────────────────
{
  const { hall, tick, last } = mkHall(1_000_000);
  ok("no open games, no alarm", hall.nextAlarmAt() === null);
  hall.handle(null, { t: "hello", id: "a", secret: "s", name: "Ana", score: 100 });
  hall.handle(null, { t: "hello", id: "b", secret: "s", name: "Bo", score: 100 });
  hall.handle("a", { t: "challenge", targetId: "b", maps: ["classic"], army: {}, mode: "classic", tc: "daily" });
  hall.handle("b", { t: "challengeRespond", challengeId: last("challenge", "b").challengeId, accept: true, maps: ["classic"], army: {} });
  const gid = last("daily:new", "a").gameId;
  const rec = hall.daily[gid];
  ok("with a fresh game the alarm aims at the T-24h reminder", hall.nextAlarmAt() === rec.deadline - 24 * 60 * 60 * 1000);
  tick(2 * 24 * 60 * 60 * 1000 + 5000);
  hall.sweepDaily();
  ok("once reminded, the alarm aims at the deadline itself", hall.nextAlarmAt() === hall.daily[gid].deadline);
  tick(24 * 60 * 60 * 1000);
  hall.sweepDaily();
  ok("a finished game asks for no alarm", hall.nextAlarmAt() === null);
}

// ── v1.0.5: DAS VERGESSEN ───────────────────────────────────────────────────
// "Es muss die Moeglichkeit geben, ein Konto auch loeschen zu koennen."
// forget(id) muss ALLES Persistente raeumen - und die Freunde der anderen.
{
  const { hall } = mkHall();
  hall.handle(null, { t: "hello", id: "w1", secret: "s1", name: "Weg", score: 0 });
  hall.handle(null, { t: "hello", id: "w2", secret: "s2", name: "Bleibt", score: 0 });
  // Freundschaft stiften: w2 fragt w1, w1 antwortet mit Annahme
  hall.handle("w2", { t: "friendRequest", code: "w1" });
  hall.handle("w1", { t: "friendRespond", id: "w2", accept: true });
  ok("vor dem Vergessen sind beide Freunde",
    (hall.player("w1").friends || []).includes("w2") && (hall.player("w2").friends || []).includes("w1"));
  // w1 legt eine Cloud-Sicherung und eine Push-Adresse an
  hall.store.vaultPush("w1", { ts: 111, league: 3, gold: 50, data: "{}" }, 5);
  hall.store.pushPut("w1", { endpoint: "https://push/x", keys: {} });
  ok("Tresor und Push liegen vor dem Vergessen vor",
    hall.store.vaultList("w1").length === 1 && hall.store.pushList("w1").length === 1);

  hall.forget("w1");
  ok("der Spieler selbst ist fort", hall.player("w1") === undefined);
  ok("seine Cloud-Staende sind fort", hall.store.vaultList("w1").length === 0);
  ok("seine Push-Adressen sind fort", hall.store.pushList("w1").length === 0);
  ok("er steht in keiner fremden Freundesliste mehr", !(hall.player("w2").friends || []).includes("w1"));
  ok("der andere Spieler bleibt unberuehrt", hall.player("w2").name === "Bleibt");
  // Eine offene ANFRAGE muss ebenso fallen
  hall.handle(null, { t: "hello", id: "w3", secret: "s3", name: "Fragt", score: 0 });
  hall.handle("w3", { t: "friendRequest", code: "w2" });
  hall.forget("w3");
  ok("auch offene Anfragen verschwinden mit", !(hall.player("w2").pending || []).includes("w3"));
}

// ── v1.27.2: DER NAME IST ONLINE EINDEUTIG (Besitzer: "der Server muss pruefen")
{
  const { hall, last } = mkHall();
  hall.handle(null, { t: "hello", id: "p1", secret: "s1", name: "Corvin", score: 100 });
  ok("ein freier Name wird uebernommen", hall.player("p1").name === "Corvin");
  hall.handle(null, { t: "hello", id: "p2", secret: "s2", name: "  corvin ", score: 100 });
  ok("ein vergebener Name - auch anders geschrieben - bekommt eine freie Abwandlung",
    hall.player("p2").name === "corvin 2" || /^corvin \d+$/i.test(hall.player("p2").name));
  ok("und das welcome sagt, dass angepasst wurde", last("welcome", "p2").you.nameAngepasst === true);
  hall.handle(null, { t: "hello", id: "p1", secret: "s1", name: "Corvin", score: 100 });
  ok("der eigene Name bleibt beim erneuten Verbinden", hall.player("p1").name === "Corvin");
  hall.handle("p2", { t: "set", name: "Corvin" });
  ok("umbenennen auf einen vergebenen Namen wird abgelehnt",
    hall.player("p2").name !== "Corvin" && last("nameVergeben", "p2")?.name === "Corvin");
  hall.handle("p2", { t: "set", name: "Der Graue" });
  ok("umbenennen auf einen freien Namen geht", hall.player("p2").name === "Der Graue");
  ok("nameVergeben kennt die eigene Kennung", hall.nameVergeben("Der Graue", "p2") === false && hall.nameVergeben("Der Graue", "p1") === true);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
