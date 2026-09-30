// Multiplayer protocol integration test: boots the real server and drives two
// clients through the full lifecycle — register, friendship, privacy-guarded
// challenge, random-queue match, move relay with hashes, resign.
import { spawn } from "child_process";
import WebSocket from "ws";
import { rmSync } from "fs";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };
const PORT = 8791;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function client(hello) {
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}`);
  const inbox = [];
  const waiting = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    const wi = waiting.findIndex((w) => w.t === msg.t);
    if (wi >= 0) waiting.splice(wi, 1)[0].res(msg); else inbox.push(msg);
  });
  const next = (t, timeout = 4000) => {
    const got = inbox.findIndex((m) => m.t === t);
    if (got >= 0) return Promise.resolve(inbox.splice(got, 1)[0]);
    return new Promise((res, rej) => {
      const w = { t, res };
      waiting.push(w);
      setTimeout(() => { const i = waiting.indexOf(w); if (i >= 0) { waiting.splice(i, 1); rej(new Error("timeout waiting " + t)); } }, timeout);
    });
  };
  const send = (o) => ws.send(JSON.stringify(o));
  const ready = new Promise((res) => ws.on("open", () => { send({ t: "hello", ...hello }); res(); }));
  return { ws, send, next, ready };
}

rmSync(new URL("./server/data.json", import.meta.url), { force: true });
const ADMIN_TOKEN = "test-admin-token-1234567890abcd";
const srv = spawn("node", ["server/server.mjs", String(PORT)],
  { stdio: "pipe", env: { ...process.env, ADMIN_TOKEN } });
await new Promise((res) => srv.stdout.on("data", (d) => { if (String(d).includes("listening")) res(); }));

try {
  const A = client({ id: "aaaaaa", secret: "sA", name: "Alice", score: 400, privacy: "public" });
  const B = client({ id: "bbbbbb", secret: "sB", name: "Bob", score: 460, privacy: "friends" });
  await A.ready; await B.ready;
  const [wA, wB] = await Promise.all([A.next("welcome"), B.next("welcome")]);
  ok("both register and get identities back", wA.you.id === "aaaaaa" && wB.you.privacy === "friends");
  await Promise.all([A.next("friends"), B.next("friends")]); // drain the initial pushes

  // privacy: challenging a friends-only player as a stranger must fail
  A.send({ t: "challenge", targetId: "bbbbbb", maps: ["classic"], army: { back: [] } });
  const err = await A.next("error");
  ok("friends-only privacy blocks stranger challenges", /friends/.test(err.error));

  // friendship
  A.send({ t: "friendRequest", code: "bbbbbb" });
  const reqPush = await B.next("friends");
  ok("request lands in Bob's inbox", reqPush.requests.some((r) => r.id === "aaaaaa"));
  B.send({ t: "friendRespond", id: "aaaaaa", accept: true });
  const [fA] = await Promise.all([A.next("friends"), B.next("friends")]);
  ok("both see each other online as friends", fA.friends.some((f) => f.id === "bbbbbb" && f.online));

  // the carrier pigeon: 10 gold flies from Alice to Bob
  A.send({ t: "gift", to: "bbbbbb" });
  const [gotB, ackA] = await Promise.all([B.next("gift"), A.next("giftSent")]);
  ok("pigeon delivers 10 gold with the sender's name", gotB.gold === 10 && gotB.from === "Alice" && ackA.to === "bbbbbb");

  // ── cloud vault: push → list (no payload) → pull (full save) ──
  const fakeSave = JSON.stringify({ gg: "grand-gambit-save", v: 2, profile: { name: "Alice", gold: 123, pieces: {} } });
  A.send({ t: "vaultPush", save: fakeSave, meta: { league: 3, gold: 123 } });
  const vlist = await A.next("vault");
  ok("vault stores a restore point with metadata but strips the payload from the list",
    vlist.list.length === 1 && vlist.list[0].league === 3 && !("data" in vlist.list[0]) && !("save" in vlist.list[0]));
  A.send({ t: "vaultPull", ts: vlist.list[0].ts });
  const pulled = await A.next("vaultSave");
  ok("the owner can pull the exact save back", pulled.save === fakeSave);

  // ── admin: wrong token denied, right token answers, path guard holds ──
  const X = client({ id: "xxxxxx", secret: "sx", name: "Xadmin" });
  await X.ready;
  X.send({ t: "admin", token: "wrong-token-wrong-token-wrong", cmd: "stats" });
  const denied = await X.next("error");
  ok("admin rejects a wrong token", denied.error === "denied");
  X.send({ t: "admin", token: ADMIN_TOKEN, cmd: "stats" });
  const st = await X.next("admin");
  ok("admin stats report players, backups and vault points",
    st.players >= 2 && typeof st.backups === "number" && st.vaultSnapshots === 1);
  X.send({ t: "admin", token: ADMIN_TOKEN, cmd: "backupNow" });
  const bk = await X.next("admin");
  X.send({ t: "admin", token: ADMIN_TOKEN, cmd: "pull", file: "../server.mjs" });
  const guard = await X.next("error");
  ok("a backup can be created and path traversal is refused",
    typeof bk.created === "string" && guard.error === "bad file");

  // now the challenge is allowed
  A.send({ t: "challenge", targetId: "bbbbbb", maps: ["classic", "skirmish"], army: { tag: "A" } });
  const ch = await B.next("challenge");
  ok("friend challenge arrives with score", ch.from.name === "Alice" && ch.from.score === 400);
  B.send({ t: "challengeRespond", challengeId: ch.challengeId, accept: true, maps: ["classic"], army: { tag: "B" } });
  const [mA, mB] = await Promise.all([A.next("match"), B.next("match")]);
  ok("match starts with complementary seats + same seed", mA.youAre !== mB.youAre && mA.seed === mB.seed && mA.map === "classic");
  ok("each receives the opponent's army", mA.oppArmy.tag === "B" && mB.oppArmy.tag === "A");

  // move relay with hash
  A.send({ t: "cmd", matchId: mA.matchId, cmd: { kind: "move", from: 8, to: 16 }, n: 1, hash: "h1" });
  const relayed = await B.next("cmd");
  ok("moves relay with sequence + hash", relayed.cmd.to === 16 && relayed.n === 1 && relayed.hash === "h1");

  // resign ends it for the opponent — and settles the duel rating
  B.send({ t: "resign" });
  await A.next("oppResign");
  const [ratedA, ratedB] = await Promise.all([A.next("rated"), B.next("rated")]);
  ok("resign settles Elo (winner up, loser down)", ratedA.rating > 1000 && ratedB.rating < 1000 && ratedA.delta === -ratedB.delta);

  // leaderboard reflects it
  A.send({ t: "leaderboard" });
  const lb = await A.next("leaderboard");
  ok("leaderboard ranks Alice first with a win", lb.me.rank === 1 && lb.top[0].name === "Alice" && lb.top[0].wins === 1);

  // rematch: both agree → new match with swapped seats
  B.send({ t: "rematch", matchId: mA.matchId });
  await A.next("rematchOffer");
  A.send({ t: "rematch", matchId: mA.matchId });
  const [rA, rB] = await Promise.all([A.next("match"), B.next("match")]);
  ok("rematch starts with swapped seats on the same map", rA.youAre !== mA.youAre && rA.map === mA.map && rA.matchId === rB.matchId);
  A.send({ t: "result", matchId: rA.matchId, winner: "draw" });
  const drawRated = await B.next("rated");
  ok("board-decided draw rates ±0-ish", Math.abs(drawRated.delta) <= 2);

  // random queue: both requeue and get matched by score band
  A.send({ t: "queue", maps: ["classic"], army: { tag: "A2" } });
  B.send({ t: "queue", maps: ["arena", "classic"], army: { tag: "B2" } });
  const [qA, qB] = await Promise.all([A.next("match"), B.next("match")]);
  ok("random queue pairs close scores on a shared map", qA.map === "classic" && qA.matchId === qB.matchId);

  A.ws.close(); 
  const left = await B.next("oppLeft");
  ok("disconnect notifies the opponent", !!left);
  B.ws.close();
} finally {
  srv.kill();
}
await wait(80);
console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
