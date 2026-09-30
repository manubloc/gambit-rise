// GAMBIT — multiplayer server.
// One small Node process: presence, friend lists, score-banded random
// matchmaking, direct challenges (respecting each player's privacy setting)
// and a deterministic move relay with hash checks. State is persisted to
// ./data.json next to this file.
//
//   npm install ws          (once, in the project root)
//   node server/server.mjs  [port]     — default port 8787
//
// Works on any Node host (Railway, Render, fly.io, a VPS, your own machine).
import { WebSocketServer } from "ws";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import { createHash, timingSafeEqual } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const PORT = Number(process.argv[2] || process.env.PORT || 8787);
const FILE = join(dirname(fileURLToPath(import.meta.url)), "data.json");

// ── persistence ──────────────────────────────────────────────────────────────
const db = existsSync(FILE) ? JSON.parse(readFileSync(FILE, "utf8")) : { players: {} };
let saveT = null;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => writeFileSync(FILE, JSON.stringify(db)), 250); };
const player = (id) => db.players[id];

// ── backups: periodic snapshots of data.json with rotation ──────────────────
// Keep everything from the last 2 days, then ONE per day for 14 days.
const BK_DIR = join(dirname(fileURLToPath(import.meta.url)), "backups");
mkdirSync(BK_DIR, { recursive: true });
let lastBackupHash = "";
function backupNow(reason = "interval") {
  const body = JSON.stringify(db);
  const h = createHash("sha256").update(body).digest("hex").slice(0, 12);
  if (h === lastBackupHash && reason === "interval") return null; // unchanged
  lastBackupHash = h;
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const name = `data-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.json`;
  writeFileSync(join(BK_DIR, name), body);
  pruneBackups();
  console.log(`[backup] ${name} (${reason})`);
  return name;
}
function listBackups() {
  return readdirSync(BK_DIR).filter((f) => /^data-\d{8}-\d{6}\.json$/.test(f)).sort().reverse()
    .map((f) => ({ file: f, size: statSync(join(BK_DIR, f)).size }));
}
function pruneBackups() {
  const now = Date.now();
  const seenDay = new Set();
  for (const { file } of listBackups()) {           // newest → oldest
    const m = file.match(/^data-(\d{4})(\d{2})(\d{2})-/);
    const ts = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00Z`).getTime();
    const ageDays = (now - ts) / 864e5;
    const day = file.slice(5, 13);
    if (ageDays <= 2) continue;                      // keep all recent
    if (ageDays <= 14 && !seenDay.has(day)) { seenDay.add(day); continue; }
    unlinkSync(join(BK_DIR, file));
  }
}
setInterval(() => backupNow("interval"), 10 * 60 * 1000).unref?.();
process.on("SIGINT", () => { try { writeFileSync(FILE, JSON.stringify(db)); backupNow("shutdown"); } catch {} process.exit(0); });
process.on("SIGTERM", () => { try { writeFileSync(FILE, JSON.stringify(db)); backupNow("shutdown"); } catch {} process.exit(0); });

// ── admin: token-gated, timing-safe, lockout ─────────────────────────────────
// Enabled ONLY when ADMIN_TOKEN is set and ≥ 24 chars — secure by default.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
const ADMIN_ON = ADMIN_TOKEN.length >= 24;
if (process.env.ADMIN_TOKEN && !ADMIN_ON) console.error("[admin] ADMIN_TOKEN zu kurz (<24 Zeichen) — Admin bleibt AUS.");
const adminHash = ADMIN_ON ? createHash("sha256").update(ADMIN_TOKEN).digest() : null;
const adminFails = new Map(); // ip → { n, until }
function adminCheck(ip, token) {
  const rec = adminFails.get(ip);
  if (rec && rec.until > Date.now()) throw new Error("locked");
  const ok = ADMIN_ON && typeof token === "string" &&
    timingSafeEqual(createHash("sha256").update(token).digest(), adminHash);
  if (!ok) {
    const n = (rec?.n || 0) + 1;
    adminFails.set(ip, { n, until: n >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
    throw new Error("denied");
  }
  adminFails.delete(ip);
}

// ── live state ───────────────────────────────────────────────────────────────
const socks = new Map();   // id → ws
const queue = [];          // { id, since, maps, army, score }
const matches = new Map();   // matchId → { w, b, armyW, armyB, map, n }
const finished = new Map();  // matchId → { w, b, armyW, armyB, map, want:Set, timer } (rematch window)
const challenges = new Map(); // challengeId → { from, to, maps, army }
let seqId = 1;
const BAND = (waited) => 150 + Math.floor(waited / 5000) * 60;

// ── duel rating (Elo, K=32, start 1000) ─────────────────────────────────────
function rate(aId, bId, scoreA) { // scoreA: 1 win, 0 loss, .5 draw
  const A = player(aId), B = player(bId);
  const ra = A.rating ?? 1000, rb = B.rating ?? 1000;
  const ea = 1 / (1 + 10 ** ((rb - ra) / 400));
  const dA = Math.round(32 * (scoreA - ea)), dB = -dA;
  A.rating = ra + dA; B.rating = rb + dB;
  A.wins = (A.wins || 0) + (scoreA === 1 ? 1 : 0); A.losses = (A.losses || 0) + (scoreA === 0 ? 1 : 0); A.draws = (A.draws || 0) + (scoreA === 0.5 ? 1 : 0);
  B.wins = (B.wins || 0) + (scoreA === 0 ? 1 : 0); B.losses = (B.losses || 0) + (scoreA === 1 ? 1 : 0); B.draws = (B.draws || 0) + (scoreA === 0.5 ? 1 : 0);
  save();
  send(aId, { t: "rated", rating: A.rating, delta: dA });
  send(bId, { t: "rated", rating: B.rating, delta: dB });
}
function settle(matchId, m, scoreW) { // rate + park for rematch
  rate(m.w, m.b, scoreW);
  matches.delete(matchId);
  const f = { ...m, want: new Set(), timer: setTimeout(() => finished.delete(matchId), 120000) };
  finished.set(matchId, f);
}

const send = (id, obj) => { const ws = socks.get(id); if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); };
const online = (id) => socks.has(id);

function friendView(id) {
  const p = player(id);
  return (p.friends || []).map((fid) => ({
    id: fid, name: player(fid)?.name || "?", online: online(fid), score: player(fid)?.score || 0,
  }));
}
function pushFriends(id) {
  send(id, { t: "friends", friends: friendView(id), requests: (player(id).pending || []).map((fid) => ({ id: fid, name: player(fid)?.name || "?" })) });
}
const notifyFriends = (id) => { for (const fid of player(id)?.friends || []) if (online(fid)) pushFriends(fid); };

// ── matchmaking ──────────────────────────────────────────────────────────────
function tryMatch() {
  for (let i = 0; i < queue.length; i++) for (let j = i + 1; j < queue.length; j++) {
    const a = queue[i], b = queue[j];
    const waited = Date.now() - Math.min(a.since, b.since);
    if (Math.abs(a.score - b.score) > BAND(waited)) continue;
    const maps = a.maps.filter((m) => b.maps.includes(m));
    if (!maps.length) continue;
    queue.splice(j, 1); queue.splice(i, 1);
    startMatch(a, b, maps[Math.floor(Math.random() * maps.length)]);
    return tryMatch();
  }
}
function startMatch(a, b, map, forceSeats = false) {
  const matchId = "m" + seqId++;
  const seed = (Math.random() * 2 ** 31) | 0;
  const flip = forceSeats ? false : Math.random() < 0.5;
  const [w, bl] = flip ? [b, a] : [a, b];
  matches.set(matchId, { w: w.id, b: bl.id, armyW: w.army, armyB: bl.army, map, n: 0 });
  const base = { t: "match", matchId, seed, map, rules: "hp" };
  send(w.id, { ...base, youAre: "w", opp: { name: player(bl.id).name, score: bl.score }, oppArmy: bl.army });
  send(bl.id, { ...base, youAre: "b", opp: { name: player(w.id).name, score: w.score }, oppArmy: w.army });
}
const dropFromQueue = (id) => { const i = queue.findIndex((q) => q.id === id); if (i >= 0) queue.splice(i, 1); };
function endMatchFor(id, reason) {
  for (const [mid, m] of matches) if (m.w === id || m.b === id) {
    const opp = m.w === id ? m.b : m.w;
    send(opp, { t: reason, matchId: mid });
    settle(mid, m, m.w === id ? 0 : 1); // the one who left/resigned loses
  }
}

// ── protocol ─────────────────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: PORT });
wss.on("connection", (ws, req) => {
  let me = null;
  const ip = req?.socket?.remoteAddress || "?";
  ws.on("message", (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    try { handle(msg); } catch (e) { send(me, { t: "error", error: String(e.message || e) }); }
  });
  ws.on("close", () => {
    if (!me) return;
    socks.delete(me); dropFromQueue(me); endMatchFor(me, "oppLeft"); notifyFriends(me);
  });

  function handle(msg) {
    if (msg.t === "admin") {
      if (!ADMIN_ON) throw new Error("admin disabled");
      adminCheck(ip, msg.token);
      const reply = (payload) => ws.send(JSON.stringify({ t: "admin", cmd: msg.cmd, ...payload }));
      console.log(`[admin] ${msg.cmd} from ${ip}`);
      if (msg.cmd === "stats") {
        const vaults = Object.values(db.vault || {}).reduce((a, v) => a + v.length, 0);
        return reply({ players: Object.keys(db.players).length, online: socks.size,
          matches: matches.size, backups: listBackups().length, vaultSnapshots: vaults });
      }
      if (msg.cmd === "list") return reply({ backups: listBackups() });
      if (msg.cmd === "backupNow") return reply({ created: backupNow("manual") });
      if (msg.cmd === "pull") {
        if (!/^data-\d{8}-\d{6}\.json$/.test(msg.file || "")) throw new Error("bad file");
        return reply({ file: msg.file, data: readFileSync(join(BK_DIR, msg.file), "utf8") });
      }
      if (msg.cmd === "restore") {
        if (!/^data-\d{8}-\d{6}\.json$/.test(msg.file || "")) throw new Error("bad file");
        backupNow("pre-restore");
        const next = JSON.parse(readFileSync(join(BK_DIR, msg.file), "utf8"));
        for (const k of Object.keys(db)) delete db[k];
        Object.assign(db, next);
        save();
        console.log(`[admin] RESTORED ${msg.file} from ${ip}`);
        return reply({ restored: msg.file, players: Object.keys(db.players).length });
      }
      throw new Error("unknown admin cmd");
    }
    if (msg.t === "hello") {
      const { id, secret, name, score, privacy } = msg;
      if (!id || !secret || !name) throw new Error("bad hello");
      const ex = player(id);
      if (ex && ex.secret !== secret) throw new Error("identity taken");
      db.players[id] = { ...(ex || { friends: [], pending: [] }), secret, name: String(name).slice(0, 20), score: score | 0, privacy: privacy === "friends" ? "friends" : "public" };
      save();
      me = id;
      const old = socks.get(id); if (old && old !== ws) old.close();
      socks.set(id, ws);
      send(me, { t: "welcome", you: { id, name: db.players[id].name, score: db.players[id].score, privacy: db.players[id].privacy }, online: socks.size });
      pushFriends(me); notifyFriends(me);
      return;
    }
    if (!me) throw new Error("hello first");
    const p = player(me);

    if (msg.t === "set") { // { privacy?, score?, name? }
      if (msg.privacy) p.privacy = msg.privacy === "friends" ? "friends" : "public";
      if (msg.score != null) p.score = msg.score | 0;
      if (msg.name) p.name = String(msg.name).slice(0, 20);
      save(); return;
    }
    if (msg.t === "friendRequest") {
      const target = db.players[msg.code];
      if (!target) throw new Error("code not found");
      if (msg.code === me) throw new Error("that is you");
      if ((p.friends || []).includes(msg.code)) throw new Error("already friends");
      target.pending = [...new Set([...(target.pending || []), me])];
      save();
      if (online(msg.code)) pushFriends(msg.code);
      send(me, { t: "info", info: "requestSent" });
      return;
    }
    if (msg.t === "friendRespond") {
      const from = msg.id;
      p.pending = (p.pending || []).filter((x) => x !== from);
      if (msg.accept && player(from)) {
        p.friends = [...new Set([...(p.friends || []), from])];
        player(from).friends = [...new Set([...(player(from).friends || []), me])];
      }
      save();
      pushFriends(me); if (online(from)) pushFriends(from);
      return;
    }
    if (msg.t === "unfriend") {
      p.friends = (p.friends || []).filter((x) => x !== msg.id);
      if (player(msg.id)) player(msg.id).friends = (player(msg.id).friends || []).filter((x) => x !== me);
      save(); pushFriends(me); if (online(msg.id)) pushFriends(msg.id);
      return;
    }
    if (msg.t === "queue") {
      dropFromQueue(me);
      queue.push({ id: me, since: Date.now(), maps: msg.maps || ["classic"], army: msg.army, score: p.score });
      tryMatch(); return;
    }
    if (msg.t === "dequeue") { dropFromQueue(me); return; }
    if (msg.t === "vaultPush") {
      // Cloud restore point: the player's own save, bound to id+secret.
      const data = String(msg.save || "");
      if (data.length < 20 || data.length > 250_000) throw new Error("bad size");
      db.vault = db.vault || {};
      const list = db.vault[me] || [];
      const meta = msg.meta && typeof msg.meta === "object"
        ? { league: msg.meta.league | 0, gold: msg.meta.gold | 0 } : {};
      db.vault[me] = [{ ts: Date.now(), ...meta, data }, ...list].slice(0, 5);
      save();
      return send(me, { t: "vault", list: db.vault[me].map(({ data: _d, ...m }) => m) });
    }
    if (msg.t === "vaultList") {
      return send(me, { t: "vault", list: (db.vault?.[me] || []).map(({ data: _d, ...m }) => m) });
    }
    if (msg.t === "vaultPull") {
      const e = (db.vault?.[me] || []).find((x) => x.ts === msg.ts);
      if (!e) throw new Error("not found");
      return send(me, { t: "vaultSave", ts: e.ts, save: e.data });
    }
    if (msg.t === "gift") {
      // Carrier pigeon: 10 gold to an online friend. Friendship + presence
      // checked here; the once-per-league rule lives with the pigeon (client).
      if (!(p.friends || []).includes(msg.to)) throw new Error("not friends");
      if (!online(msg.to)) throw new Error("offline");
      send(msg.to, { t: "gift", from: p.name, gold: 10 });
      send(me, { t: "giftSent", to: msg.to });
      return;
    }
    if (msg.t === "challenge") {
      const target = player(msg.targetId);
      if (!target || !online(msg.targetId)) throw new Error("not online");
      const isFriend = (target.friends || []).includes(me);
      if (target.privacy === "friends" && !isFriend) throw new Error("friends only");
      const challengeId = "c" + seqId++;
      challenges.set(challengeId, { from: me, to: msg.targetId, maps: msg.maps || ["classic"], army: msg.army });
      send(msg.targetId, { t: "challenge", challengeId, from: { id: me, name: p.name, score: p.score } });
      send(me, { t: "info", info: "challengeSent" });
      return;
    }
    if (msg.t === "challengeRespond") {
      const c = challenges.get(msg.challengeId);
      challenges.delete(msg.challengeId);
      if (!c || c.to !== me) return;
      if (!msg.accept) { send(c.from, { t: "challengeDeclined" }); return; }
      const maps = c.maps.filter((m) => (msg.maps || ["classic"]).includes(m));
      startMatch({ id: c.from, army: c.army, score: player(c.from).score },
                 { id: me, army: msg.army, score: p.score },
                 maps[0] || "classic");
      return;
    }
    if (msg.t === "cmd") {
      const m = matches.get(msg.matchId); if (!m) return;
      const opp = m.w === me ? m.b : m.w;
      m.n++;
      send(opp, { t: "cmd", matchId: msg.matchId, cmd: msg.cmd, n: msg.n, hash: msg.hash });
      return;
    }
    if (msg.t === "resign") { endMatchFor(me, "oppResign"); return; }
    if (msg.t === "result") { // board-decided end: {matchId, winner:"w"|"b"|"draw"} — first report counts
      const m = matches.get(msg.matchId);
      if (!m || (m.w !== me && m.b !== me)) return;
      settle(msg.matchId, m, msg.winner === "w" ? 1 : msg.winner === "b" ? 0 : 0.5);
      return;
    }
    if (msg.t === "rematch") {
      const f = finished.get(msg.matchId);
      if (!f || (f.w !== me && f.b !== me)) return;
      f.want.add(me);
      const other = f.w === me ? f.b : f.w;
      if (f.want.has(other)) {
        clearTimeout(f.timer); finished.delete(msg.matchId);
        // seats swap for the rematch
        startMatch({ id: f.b, army: f.armyB, score: player(f.b).score },
                   { id: f.w, army: f.armyW, score: player(f.w).score }, f.map, true);
      } else if (online(other)) {
        send(other, { t: "rematchOffer", matchId: msg.matchId });
      }
      return;
    }
    if (msg.t === "leaderboard") {
      const rows = Object.entries(db.players)
        .map(([id, pl]) => ({ id, name: pl.name, rating: pl.rating ?? 1000, wins: pl.wins || 0, losses: pl.losses || 0, online: online(id) }))
        .sort((a, b) => b.rating - a.rating);
      const rank = rows.findIndex((r) => r.id === me) + 1;
      send(me, { t: "leaderboard", top: rows.slice(0, 20), me: { rank, ...rows[rank - 1] } });
      return;
    }
    if (msg.t === "matchOver") return; // legacy no-op
  }
});

console.log(`Gambit server listening on :${PORT}`);
