// GAMBIT — the Hall: multiplayer protocol core.
//
// A faithful port of server/server.mjs with the runtime cut away: no sockets,
// no filesystem, no timers. Everything the protocol needs comes injected:
//
//   store  — persistence:   getPlayer/putPlayer/playerIds, kvGet/kvSet,
//                            vaultList/vaultPush/vaultGet,
//                            pushPut/pushList/pushDelete/pushClear (web push)
//   send   — delivery:      send(playerId, obj)
//   now    — the clock      (injectable for tests)
//
// The Durable Object adapter (index.mjs) backs the store with SQLite and the
// sends with hibernatable WebSockets; the test suite backs both with Maps.
// Live state (queue, matches, challenges, rematch windows) is persisted as
// small KV blobs on every change, so a hibernated Hall wakes up mid-match
// without losing anything.

const BAND = (waited) => 150 + Math.floor(waited / 5000) * 60;
const REMATCH_MS = 120000;

// A player may mirror the same figures they see on their own profile so the
// admin can survey everyone at a glance. Whitelisted, clamped, numbers only —
// never trust the wire.
const STAT_KEYS = ["games", "wins", "losses", "draws", "league", "playtimeSec", "stagesCleared", "bossKills", "xp"];
function cleanStats(s) {
  if (!s || typeof s !== "object") return null;
  const out = {};
  for (const k of STAT_KEYS) {
    const v = s[k];
    if (typeof v === "number" && isFinite(v)) out[k] = Math.max(0, Math.min(v | 0, 2e9));
  }
  return Object.keys(out).length ? out : null;
}

// A correspondence player owes a move within three days; miss it and the game
// is lost on time. Long enough for a holiday weekend, short enough that a game
// cannot rot forever.
const DAILY_MS = 3 * 24 * 60 * 60 * 1000;
// One day before the deadline the absent player gets a last tap on the
// shoulder — enough to save a game over a busy weekend.
const REMIND_MS = 24 * 60 * 60 * 1000;

const normName = (n) => String(n || "").trim().toLowerCase().replace(/\s+/g, " ");

export class HallCore {
  constructor({ store, send, now = () => Date.now(), adminToken = "", notify = () => {}, pushKey = null }) {
    this.store = store; this.send = send; this.now = now;
    // the second voice: `send` reaches an OPEN socket, `notify` reaches a
    // CLOSED app — the adapter turns it into a Web Push. Injected like `send`,
    // so the tests can listen in without any crypto or network.
    this.notify = notify;
    // the VAPID applicationServerKey the browser needs to subscribe; the
    // adapter fills it in once its key pair is loaded
    this.pushKey = pushKey || null;
    this.adminToken = String(adminToken || "");
    this.adminOn = this.adminToken.length >= 24;
    this.online = new Map();          // playerId → true (presence; sockets live in the adapter)
    this.adminFails = new Map();      // ip → { n, until } (best effort; resets on hibernation)
  }

  // ── live blobs (survive hibernation via KV) ────────────────────────────────
  _blob(key, fallback) { const v = this.store.kvGet(key); return v ? JSON.parse(v) : fallback; }
  _put(key, val) { this.store.kvSet(key, JSON.stringify(val)); }
  get queue() { return this._blob("queue", []); }
  set queue(v) { this._put("queue", v); }
  get matches() { return this._blob("matches", {}); }
  set matches(v) { this._put("matches", v); }
  get challenges() { return this._blob("challenges", {}); }
  set challenges(v) { this._put("challenges", v); }
  get finished() { return this._blob("finished", {}); }   // matchId → {…, want:[], until}
  set finished(v) { this._put("finished", v); }
  // ── CORRESPONDENCE (Classic Gambit) ────────────────────────────────────────
  // A live match is a relay between two open sockets: close one and the game is
  // over. A daily game must outlive both players closing the app, so it is kept
  // HERE in full — seed, both armies and the ordered list of commands. The board
  // is deterministic (same seed + same commands = same position), so a returning
  // player replays the list instead of the server having to understand chess.
  get daily() { return this._blob("daily", {}); }
  set daily(v) { this._put("daily", v); }
  nextId(prefix) { const n = (Number(this.store.kvGet("seq")) || 0) + 1; this.store.kvSet("seq", String(n)); return prefix + n; }

  player(id) { return this.store.getPlayer(id); }
  /* ── v1.27.2 (Besitzer): DER NAME IST ONLINE EINDEUTIG ─────────────────────
     "Auf jeden Fall muss der Server pruefen, denn er muss online eindeutig
      sein." Bisher uebernahmen hello und set jeden Namen ungeprueft - zwei
     Spieler konnten gleich heissen. Jetzt prueft der Server gegen ALLE
     Spieler, die er kennt; Gross-/Kleinschreibung und doppelte Leerzeichen
     zaehlen nicht (dieselbe Regel wie auf dem Geraet, accounts.js normName). */
  nameVergeben(name, ausserId = null) {
    const n = normName(name);
    if (!n) return false;
    const alle = this.store.dumpPlayers ? this.store.dumpPlayers() : {};
    return Object.values(alle).some((q) => q && q.id !== ausserId && normName(q.name) === n);
  }
  freierName(name, ausserId = null) {
    const basis = String(name || "").trim().slice(0, 17) || "Spieler";
    if (!this.nameVergeben(basis, ausserId)) return basis;
    for (let i = 2; i < 999; i++) { const k = `${basis} ${i}`; if (!this.nameVergeben(k, ausserId)) return k; }
    return `${basis} ${this.now() % 1000}`;
  }
  savePlayer(p) { this.store.putPlayer(p); }
  isOnline(id) { return this.online.has(id); }

  /* ── DAS VERGESSEN (v1.0.5) ──────────────────────────────────────────────
     Loescht einen Spieler restlos aus der Halle: seine Zeile, seine
     Tresor-Staende, seine Push-Adressen - und seinen Namen aus den
     Freundes- und Anfragelisten ALLER anderen, damit dort kein "?" ohne
     Traeger zurueckbleibt. Laufende Verbindungen und Partien werden wie
     bei einem Weggang geschlossen. Aufgerufen vom /vergiss-Endpunkt, der
     id UND secret prueft - hier wird nicht mehr gefragt. */
  forget(id) {
    if (!id) return;
    this.close(id);
    for (const anderer of this.store.playerIds()) {
      if (anderer === id) continue;
      const q = this.player(anderer);
      if (!q) continue;
      const inFriends = (q.friends || []).includes(id);
      const inPending = (q.pending || []).includes(id);
      if (!inFriends && !inPending) continue;
      q.friends = (q.friends || []).filter((x) => x !== id);
      q.pending = (q.pending || []).filter((x) => x !== id);
      this.savePlayer(q);
      this.pushFriends(anderer);
    }
    this.store.pushClear(id);
    this.store.vaultClear(id);
    this.store.deletePlayer(id);
  }

  // ── presence ───────────────────────────────────────────────────────────────
  connect(id) { this.online.set(id, true); }
  close(id) {
    if (!id) return;
    this.online.delete(id);
    this.dropFromQueue(id);
    this.endMatchFor(id, "oppLeft");   // live matches only — daily games sleep on
    this.notifyFriends(id);
  }

  // ── friends ────────────────────────────────────────────────────────────────
  friendView(id) {
    const p = this.player(id);
    return (p?.friends || []).map((fid) => {
      const f = this.player(fid);
      return { id: fid, name: f?.name || "?", online: this.isOnline(fid), score: f?.score || 0 };
    });
  }
  pushFriends(id) {
    const p = this.player(id); if (!p) return;
    this.send(id, { t: "friends", friends: this.friendView(id),
      requests: (p.pending || []).map((fid) => ({ id: fid, name: this.player(fid)?.name || "?" })) });
  }
  notifyFriends(id) { for (const fid of this.player(id)?.friends || []) if (this.isOnline(fid)) this.pushFriends(fid); }

  // ── rating (Elo, K=32, start 1000) ─────────────────────────────────────────
  rate(aId, bId, scoreA) {
    const A = this.player(aId), B = this.player(bId);
    const ra = A.rating ?? 1000, rb = B.rating ?? 1000;
    const ea = 1 / (1 + 10 ** ((rb - ra) / 400));
    const dA = Math.round(32 * (scoreA - ea)), dB = -dA;
    A.rating = ra + dA; B.rating = rb + dB;
    A.wins = (A.wins || 0) + (scoreA === 1 ? 1 : 0); A.losses = (A.losses || 0) + (scoreA === 0 ? 1 : 0); A.draws = (A.draws || 0) + (scoreA === 0.5 ? 1 : 0);
    B.wins = (B.wins || 0) + (scoreA === 0 ? 1 : 0); B.losses = (B.losses || 0) + (scoreA === 1 ? 1 : 0); B.draws = (B.draws || 0) + (scoreA === 0.5 ? 1 : 0);
    this.savePlayer(A); this.savePlayer(B);
    this.send(aId, { t: "rated", rating: A.rating, delta: dA });
    this.send(bId, { t: "rated", rating: B.rating, delta: dB });
  }
  settle(matchId, m, scoreW) {
    this.rate(m.w, m.b, scoreW);
    const ms = this.matches; delete ms[matchId]; this.matches = ms;
    const fin = this.finished;
    fin[matchId] = { ...m, want: [], until: this.now() + REMATCH_MS };
    this.finished = fin;
  }
  sweepFinished() {   // lazy expiry replaces the Node timers
    const fin = this.finished; let dirty = false;
    for (const [mid, f] of Object.entries(fin)) if (f.until <= this.now()) { delete fin[mid]; dirty = true; }
    if (dirty) this.finished = fin;
  }

  // ── matchmaking ────────────────────────────────────────────────────────────
  dropFromQueue(id) { const q = this.queue; const i = q.findIndex((x) => x.id === id); if (i >= 0) { q.splice(i, 1); this.queue = q; } }
  tryMatch() {
    const q = this.queue;
    for (let i = 0; i < q.length; i++) for (let j = i + 1; j < q.length; j++) {
      const a = q[i], b = q[j];
      const waited = this.now() - Math.min(a.since, b.since);
      if (Math.abs(a.score - b.score) > BAND(waited)) continue;
      if ((a.mode || "duel") !== (b.mode || "duel")) continue; // classic meets classic, duel meets duel
      if ((a.tc || "rush") !== (b.tc || "rush")) continue;      // and one clock only ever meets its own
      const maps = a.maps.filter((m) => b.maps.includes(m));
      if (!maps.length) continue;
      q.splice(j, 1); q.splice(i, 1); this.queue = q;
      this.startMatch(a, b, maps[Math.floor(Math.random() * maps.length)]);
      return this.tryMatch();
    }
  }
  startMatch(a, b, map, forceSeats = false) {
    const matchId = this.nextId("m");
    const seed = (Math.random() * 2 ** 31) | 0;
    const flip = forceSeats ? false : Math.random() < 0.5;
    const [w, bl] = flip ? [b, a] : [a, b];
    const ms = this.matches;
    const mode = a.mode || "duel";
    // Each side may have queued a formation PER candidate map (armies dict);
    // resolve to the one for the map actually chosen, so a match on "gauntlet"
    // never accidentally uses the arrangement someone saved for "arena".
    const armyOf = (side) => (side.armies && side.armies[map]) || side.army;
    const armyW = armyOf(w), armyB = armyOf(bl);
    const tcPick = a.tc || b.tc || "rush";
    if (tcPick === "daily") {
      // CORRESPONDENCE: no live seat is opened at all. The game is filed, both
      // players are told it exists, and it waits — days if it must.
      const gid = this.nextId("d");
      const g = this.daily;
      g[gid] = { id: gid, w: w.id, b: bl.id, armyW, armyB, map, seed,
        rules: mode === "classic" ? "chess" : "hp", mode,
        moves: [], turn: "w", createdAt: this.now(), lastAt: this.now(),
        deadline: this.now() + DAILY_MS, done: null };
      this.daily = g;
      for (const side of [w, bl]) this.send(side.id, { t: "daily:new", gameId: gid });
      // white owes the first move; if he slipped away in the very moment the
      // pairing landed, the push brings him back
      if (!this.isOnline(w.id)) this.notify(w.id, { kind: "new", gameId: gid, opp: this.player(bl.id)?.name || "?" });
      return gid;
    }
    ms[matchId] = { w: w.id, b: bl.id, armyW, armyB, map, n: 0, mode };
    this.matches = ms;
    // classic rooms play pure mate chess; duels keep the HP arena
    // the clock both sides asked for travels with the match, so neither can
    // start on a different budget than the other
    const tc = a.tc || b.tc || "rush";
    const base = { t: "match", matchId, seed, map, rules: mode === "classic" ? "chess" : "hp", mode, tc };
    this.send(w.id, { ...base, youAre: "w", opp: { name: this.player(bl.id).name, score: bl.score }, oppArmy: armyB });
    this.send(bl.id, { ...base, youAre: "b", opp: { name: this.player(w.id).name, score: w.score }, oppArmy: armyW });
    return matchId;
  }
  // ── correspondence: the long game ──────────────────────────────────────────
  /** Anyone who touches the shelf first also sweeps it: a game whose deadline
   *  has passed is decided against whoever owed the move. */
  sweepDaily() {
    const g = this.daily; let changed = false;
    for (const rec of Object.values(g)) {
      if (rec.done) continue;
      if (rec.deadline <= this.now()) {
        const loser = rec.turn === "w" ? rec.w : rec.b;
        rec.done = { winner: rec.turn === "w" ? "b" : "w", reason: "time" };
        rec.lastAt = this.now(); changed = true;
        this.rateDaily(rec);
        for (const pid of [rec.w, rec.b]) {
          const lost = pid === loser;
          this.send(pid, { t: "daily:over", gameId: rec.id, winner: rec.done.winner, reason: "time", lost });
          if (!this.isOnline(pid)) this.notify(pid, { kind: "over", gameId: rec.id,
            opp: this.player(pid === rec.w ? rec.b : rec.w)?.name || "?", won: !lost, reason: "time" });
        }
        continue;
      }
      // the last-day reminder: fires ONCE per owed move, aimed only at the
      // player who is actually holding the game up — and only if he is away
      if (!rec.reminded && rec.deadline - this.now() <= REMIND_MS) {
        rec.reminded = true; changed = true;
        const owe = rec.turn === "w" ? rec.w : rec.b;
        if (!this.isOnline(owe)) this.notify(owe, { kind: "deadline", gameId: rec.id,
          opp: this.player(rec.turn === "w" ? rec.b : rec.w)?.name || "?",
          hours: Math.max(1, Math.round((rec.deadline - this.now()) / 3600000)) });
      }
    }
    if (changed) this.daily = g;
  }
  /** When must the Hall wake itself, even with every socket closed? The
   *  earliest of any open game's T-24h reminder mark or its deadline. The
   *  adapter turns this into a Durable Object alarm; null means sleep on. */
  nextAlarmAt() {
    let at = null;
    for (const rec of Object.values(this.daily)) {
      if (rec.done) continue;
      const t = rec.reminded ? rec.deadline : rec.deadline - REMIND_MS;
      if (at == null || t < at) at = t;
    }
    return at;
  }
  rateDaily(rec) {
    // reuse the ladder the live duels use: 1 = white won, 0 = black won
    const score = rec.done.winner === "w" ? 1 : rec.done.winner === "b" ? 0 : 0.5;
    try { this.settle(rec.id, { w: rec.w, b: rec.b, mode: rec.mode }, score); } catch { /* rating is a courtesy, never a blocker */ }
  }
  dailyFor(id) {
    this.sweepDaily();
    const out = [];
    for (const rec of Object.values(this.daily)) {
      if (rec.w !== id && rec.b !== id) continue;
      const mySide = rec.w === id ? "w" : "b";
      const oppId = rec.w === id ? rec.b : rec.w;
      out.push({ gameId: rec.id, youAre: mySide, yourTurn: !rec.done && rec.turn === mySide,
        opp: { name: this.player(oppId)?.name || "?", online: this.isOnline(oppId) },
        moves: rec.moves.length, deadline: rec.deadline, lastAt: rec.lastAt,
        done: rec.done, map: rec.map, rules: rec.rules, mode: rec.mode });
    }
    out.sort((x, y) => (y.yourTurn ? 1 : 0) - (x.yourTurn ? 1 : 0) || y.lastAt - x.lastAt);
    return out;
  }

  endMatchFor(id, reason) {
    const ms = this.matches;
    for (const [mid, m] of Object.entries(ms)) if (m.w === id || m.b === id) {
      const opp = m.w === id ? m.b : m.w;
      this.send(opp, { t: reason, matchId: mid });
      this.settle(mid, m, m.w === id ? 0 : 1);
    }
  }

  // ── admin ──────────────────────────────────────────────────────────────────
  adminCheck(ip, token) {
    const rec = this.adminFails.get(ip);
    if (rec && rec.until > this.now()) throw new Error("locked");
    // constant-time compare (no Node crypto in Workers)
    const A = String(token || ""), B = this.adminToken;
    let diff = A.length ^ B.length;
    const L = Math.max(A.length, B.length, 1);
    for (let i = 0; i < L; i++) diff |= (A.charCodeAt(i) || 0) ^ (B.charCodeAt(i) || 0);
    const ok = this.adminOn && diff === 0;
    if (!ok) {
      const n = (rec?.n || 0) + 1;
      this.adminFails.set(ip, { n, until: n >= 5 ? this.now() + 15 * 60 * 1000 : 0 });
      throw new Error("denied");
    }
    this.adminFails.delete(ip);
  }

  // ── the protocol ───────────────────────────────────────────────────────────
  /** Handle one message from `me` (playerId or null before hello).
   *  Returns the (possibly newly assigned) playerId. Throws protocol errors. */
  handle(me, msg, ip = "?") {
    this.sweepFinished();
    if (msg.t === "admin") {
      if (!this.adminOn) throw new Error("admin disabled");
      this.adminCheck(ip, msg.token);
      const reply = (payload) => this.send(me, { t: "admin", cmd: msg.cmd, ...payload });
      if (msg.cmd === "stats") {
        const ids = this.store.playerIds();
        return reply({ players: ids.length, online: this.online.size,
          matches: Object.keys(this.matches).length, vaultSnapshots: this.store.vaultCount() }), me;
      }
      if (msg.cmd === "dump") {
        const all = this.store.dumpPlayers();
        const rows = Object.entries(all).map(([id, p]) => ({
          id, name: p.name || "—", score: p.score || 0, rating: p.rating ?? null,
          wins: p.wins || 0, losses: p.losses || 0, draws: p.draws || 0,
          friends: (p.friends || []).length, seen: p.seen || null, stats: p.stats || null,
        }));
        return reply({ players: rows }), me;
      }
      throw new Error("unknown admin cmd");
    }
    if (msg.t === "hello") {
      const { id, secret, name, score, privacy } = msg;
      if (!id || !secret || !name) throw new Error("bad hello");
      const ex = this.player(id);
      if (ex && ex.secret !== secret) throw new Error("identity taken");
      /* Traegt ein ANDERER Spieler den Namen schon, bekommt dieser Spieler eine
         freie Abwandlung ("Name 2") - abweisen kann der Server ihn beim
         Verbinden nicht, sonst saesse er ausgesperrt. Das welcome meldet es. */
      const gewuenscht = String(name).slice(0, 20);
      const vergeben = this.nameVergeben(gewuenscht, id);
      const endName = vergeben ? (ex && !this.nameVergeben(ex.name, id) ? ex.name : this.freierName(gewuenscht, id)) : gewuenscht;
      this.savePlayer({ ...(ex || { friends: [], pending: [] }), id, secret,
        name: endName, score: score | 0,
        privacy: privacy === "friends" ? "friends" : "public",
        lang: msg.lang === "en" ? "en" : (ex?.lang || "de"),
        seen: this.now(), stats: cleanStats(msg.stats) || ex?.stats || null,
        /* v1.0.3: WANN kam dieses Konto? Beim allerersten hello wird der
           Zeitpunkt festgehalten und nie wieder angefasst - daraus zeichnet
           das Spielerbuch die Beitrittskurve. Bestandskonten von vor diesem
           Deploy tragen kein Datum; das Buch weist sie gesondert aus, statt
           ihnen eines anzudichten. */
        created: ex?.created ?? this.now(),
        // v0.73: grobe Herkunft fuers Spielerbuch (Land/Region/Stadt von
        // Cloudflare, IP nur als kurzer Fingerabdruck - nie im Klartext).
        land: msg.__herkunft?.land || ex?.land || null,
        region: msg.__herkunft?.region || ex?.region || null,
        stadt: msg.__herkunft?.stadt || ex?.stadt || null,
        ipHash: msg.__herkunft?.ipHash || ex?.ipHash || null });
      me = id;
      this.connect(me);
      const p = this.player(me);
      this.send(me, { t: "welcome", you: { id, name: p.name, score: p.score, privacy: p.privacy, nameAngepasst: vergeben },
        online: this.online.size, push: this.pushKey || null });
      this.pushFriends(me); this.notifyFriends(me);
      return me;
    }
    if (!me) throw new Error("hello first");
    const p = this.player(me);

    if (msg.t === "set") {
      if (msg.privacy) p.privacy = msg.privacy === "friends" ? "friends" : "public";
      if (msg.score != null) p.score = msg.score | 0;
      if (msg.name) {
        const n = String(msg.name).slice(0, 20);
        if (this.nameVergeben(n, me)) this.send(me, { t: "nameVergeben", name: n });
        else p.name = n;
      }
      if (msg.stats) p.stats = cleanStats(msg.stats) || p.stats;
      p.seen = this.now();
      this.savePlayer(p); return me;
    }
    if (msg.t === "friendRequest") {
      const target = this.player(msg.code);
      if (!target) throw new Error("code not found");
      if (msg.code === me) throw new Error("that is you");
      if ((p.friends || []).includes(msg.code)) throw new Error("already friends");
      target.pending = [...new Set([...(target.pending || []), me])];
      this.savePlayer(target);
      if (this.isOnline(msg.code)) this.pushFriends(msg.code);
      this.send(me, { t: "info", info: "requestSent" });
      return me;
    }
    if (msg.t === "friendRespond") {
      const from = msg.id;
      p.pending = (p.pending || []).filter((x) => x !== from);
      const other = this.player(from);
      if (msg.accept && other) {
        p.friends = [...new Set([...(p.friends || []), from])];
        other.friends = [...new Set([...(other.friends || []), me])];
        this.savePlayer(other);
      }
      this.savePlayer(p);
      this.pushFriends(me); if (this.isOnline(from)) this.pushFriends(from);
      return me;
    }
    if (msg.t === "unfriend") {
      p.friends = (p.friends || []).filter((x) => x !== msg.id);
      this.savePlayer(p);
      const other = this.player(msg.id);
      if (other) { other.friends = (other.friends || []).filter((x) => x !== me); this.savePlayer(other); }
      this.pushFriends(me); if (this.isOnline(msg.id)) this.pushFriends(msg.id);
      return me;
    }
    if (msg.t === "queue") {
      this.dropFromQueue(me);
      const q = this.queue;
      q.push({ id: me, since: this.now(), maps: msg.maps || ["classic"], army: msg.army, armies: msg.armies || null, score: p.score, mode: msg.mode || "duel", tc: msg.tc || "rush" });
      this.queue = q;
      this.tryMatch(); return me;
    }
    if (msg.t === "dequeue") { this.dropFromQueue(me); return me; }
    if (msg.t === "vaultPush") {
      const data = String(msg.save || "");
      if (data.length < 20 || data.length > 250_000) throw new Error("bad size");
      const meta = msg.meta && typeof msg.meta === "object"
        ? { league: msg.meta.league | 0, gold: msg.meta.gold | 0 } : {};
      this.store.vaultPush(me, { ts: this.now(), ...meta, data }, 5);
      this.send(me, { t: "vault", list: this.store.vaultList(me) });
      return me;
    }
    if (msg.t === "vaultList") { this.send(me, { t: "vault", list: this.store.vaultList(me) }); return me; }
    if (msg.t === "vaultPull") {
      const e = this.store.vaultGet(me, msg.ts);
      if (!e) throw new Error("not found");
      this.send(me, { t: "vaultSave", ts: e.ts, save: e.data });
      return me;
    }
    if (msg.t === "push:subscribe") {
      // one browser hands over its push address; a player may register up to
      // five devices (phone, tablet, desk …), oldest falls off. Never trust
      // the wire: https endpoint, string keys, sane lengths.
      const sub = msg.sub || {};
      const ep = String(sub.endpoint || "");
      const k = sub.keys || {};
      if (!/^https:\/\/./.test(ep) || ep.length > 1000) throw new Error("bad endpoint");
      if (typeof k.p256dh !== "string" || typeof k.auth !== "string" || !k.p256dh || !k.auth
        || k.p256dh.length > 200 || k.auth.length > 60) throw new Error("bad keys");
      this.store.pushPut(me, { endpoint: ep, keys: { p256dh: k.p256dh, auth: k.auth } }, 5);
      this.send(me, { t: "push:ok", on: true });
      return me;
    }
    if (msg.t === "push:off") { this.store.pushClear(me); this.send(me, { t: "push:ok", on: false }); return me; }
    if (msg.t === "gift") {
      if (!(p.friends || []).includes(msg.to)) throw new Error("not friends");
      if (!this.isOnline(msg.to)) throw new Error("offline");
      this.send(msg.to, { t: "gift", from: p.name, gold: 10 });
      this.send(me, { t: "giftSent", to: msg.to });
      return me;
    }
    if (msg.t === "challenge") {
      const target = this.player(msg.targetId);
      if (!target || !this.isOnline(msg.targetId)) throw new Error("not online");
      const isFriend = (target.friends || []).includes(me);
      if (target.privacy === "friends" && !isFriend) throw new Error("friends only");
      const challengeId = this.nextId("c");
      const cs = this.challenges;
      // the clock travels WITH the challenge: without it, a friend asking for a
      // correspondence game would silently land in a rush duel
      cs[challengeId] = { from: me, to: msg.targetId, maps: msg.maps || ["classic"], army: msg.army, armies: msg.armies || null, mode: msg.mode || "duel", tc: msg.tc || "rush" };
      this.challenges = cs;
      this.send(msg.targetId, { t: "challenge", challengeId, mode: msg.mode || "duel", from: { id: me, name: p.name, score: p.score } });
      this.send(me, { t: "info", info: "challengeSent" });
      return me;
    }
    if (msg.t === "challengeRespond") {
      const cs = this.challenges;
      const c = cs[msg.challengeId];
      delete cs[msg.challengeId]; this.challenges = cs;
      if (!c || c.to !== me) return me;
      if (!msg.accept) { this.send(c.from, { t: "challengeDeclined" }); return me; }
      const maps = c.maps.filter((m) => (msg.maps || ["classic"]).includes(m));
      this.startMatch({ id: c.from, army: c.army, armies: c.armies, score: this.player(c.from).score, mode: c.mode, tc: c.tc },
                      { id: me, army: msg.army, armies: msg.armies || null, score: p.score, mode: c.mode, tc: c.tc },
                      maps[0] || "classic");
      return me;
    }
    if (msg.t === "cmd") {
      const ms = this.matches;
      const m = ms[msg.matchId]; if (!m) return me;
      const opp = m.w === me ? m.b : m.w;
      m.n++; this.matches = ms;
      this.send(opp, { t: "cmd", matchId: msg.matchId, cmd: msg.cmd, n: msg.n, hash: msg.hash });
      return me;
    }
    if (msg.t === "scoutDone") {
      // the seer finished reading the board — forward the final swaps so both
      // clients hold the identical position before the first move
      const m = this.matches[msg.matchId]; if (!m) return me;
      const opp = m.w === me ? m.b : m.w;
      this.send(opp, { t: "scoutDone", matchId: msg.matchId, swaps: Array.isArray(msg.swaps) ? msg.swaps.slice(0, 32) : [] });
      return me;
    }
    if (msg.t === "daily:list") { this.send(me, { t: "daily:list", games: this.dailyFor(me) }); return me; }
    if (msg.t === "daily:open") {
      this.sweepDaily();
      const rec = this.daily[msg.gameId];
      if (!rec || (rec.w !== me && rec.b !== me)) return me;
      const oppId = rec.w === me ? rec.b : rec.w;
      this.send(me, { t: "daily:game", game: { gameId: rec.id, youAre: rec.w === me ? "w" : "b",
        seed: rec.seed, map: rec.map, rules: rec.rules, mode: rec.mode,
        armyW: rec.armyW, armyB: rec.armyB, moves: rec.moves, turn: rec.turn,
        deadline: rec.deadline, done: rec.done,
        opp: { name: this.player(oppId)?.name || "?", score: this.player(oppId)?.score || 0 } } });
      return me;
    }
    if (msg.t === "daily:move") {
      this.sweepDaily();
      const g = this.daily; const rec = g[msg.gameId];
      if (!rec || rec.done) return me;
      const mySide = rec.w === me ? "w" : rec.b === me ? "b" : null;
      if (!mySide || rec.turn !== mySide) return me;      // not yours to move
      if (!msg.cmd || typeof msg.cmd !== "object") return me;
      if (rec.moves.length > 600) return me;              // a sane ceiling
      rec.moves.push(msg.cmd);
      rec.turn = mySide === "w" ? "b" : "w";
      rec.lastAt = this.now();
      rec.deadline = this.now() + DAILY_MS;
      rec.reminded = false;                               // a fresh move, a fresh clock, a fresh reminder
      if (msg.result) rec.done = { winner: msg.result.winner || null, reason: msg.result.reason || "end" };
      g[rec.id] = rec; this.daily = g;
      if (rec.done) this.rateDaily(rec);
      const oppId = rec.w === me ? rec.b : rec.w;
      // the nudge: if he is here, he learns at once; if not, the Web Push
      // knocks on his closed app — that is the whole point of the format
      this.send(oppId, { t: "daily:turn", gameId: rec.id, moves: rec.moves.length, done: rec.done });
      if (!this.isOnline(oppId)) this.notify(oppId, rec.done
        ? { kind: "over", gameId: rec.id, opp: p.name, won: rec.done.winner === (rec.w === oppId ? "w" : "b"), reason: rec.done.reason }
        : { kind: "turn", gameId: rec.id, opp: p.name });
      this.send(me, { t: "daily:ok", gameId: rec.id, moves: rec.moves.length, done: rec.done });
      return me;
    }
    if (msg.t === "daily:resign") {
      const g = this.daily; const rec = g[msg.gameId];
      if (!rec || rec.done) return me;
      const mySide = rec.w === me ? "w" : rec.b === me ? "b" : null;
      if (!mySide) return me;
      rec.done = { winner: mySide === "w" ? "b" : "w", reason: "resign" };
      rec.lastAt = this.now(); g[rec.id] = rec; this.daily = g;
      this.rateDaily(rec);
      for (const pid of [rec.w, rec.b]) this.send(pid, { t: "daily:over", gameId: rec.id, winner: rec.done.winner, reason: "resign", lost: pid === me });
      const oppId = rec.w === me ? rec.b : rec.w;
      if (!this.isOnline(oppId)) this.notify(oppId, { kind: "over", gameId: rec.id, opp: p.name, won: true, reason: "resign" });
      return me;
    }
    if (msg.t === "resign") { this.endMatchFor(me, "oppResign"); return me; }
    if (msg.t === "result") {
      const m = this.matches[msg.matchId];
      if (!m || (m.w !== me && m.b !== me)) return me;
      this.settle(msg.matchId, m, msg.winner === "w" ? 1 : msg.winner === "b" ? 0 : 0.5);
      return me;
    }
    if (msg.t === "rematch") {
      const fin = this.finished;
      const f = fin[msg.matchId];
      if (!f || (f.w !== me && f.b !== me)) return me;
      if (!f.want.includes(me)) f.want.push(me);
      const other = f.w === me ? f.b : f.w;
      if (f.want.includes(other)) {
        delete fin[msg.matchId]; this.finished = fin;
        this.startMatch({ id: f.b, army: f.armyB, score: this.player(f.b).score, mode: f.mode },
                        { id: f.w, army: f.armyW, score: this.player(f.w).score, mode: f.mode }, f.map, true);
      } else {
        this.finished = fin;
        if (this.isOnline(other)) this.send(other, { t: "rematchOffer", matchId: msg.matchId });
      }
      return me;
    }
    if (msg.t === "leaderboard") {
      // Only real contenders make the board: anyone who has finished at least
      // one rated duel, plus whoever is online right now. Idle test husks and
      // one-time visitors stay invisible.
      const rows = this.store.playerIds()
        .map((id) => { const pl = this.player(id); return { id, name: pl.name, rating: pl.rating ?? 1000, wins: pl.wins || 0, losses: pl.losses || 0, draws: pl.draws || 0, online: this.isOnline(id) }; })
        .filter((r) => r.wins + r.losses + (r.draws || 0) > 0 || r.online)
        .sort((a, b) => b.rating - a.rating);
      const rank = rows.findIndex((r) => r.id === me) + 1;
      const self = this.player(me);
      const meRow = rank > 0 ? { rank, ...rows[rank - 1] }
        : { rank: null, id: me, name: self?.name || "?", rating: self?.rating ?? 1000, wins: self?.wins || 0, losses: self?.losses || 0, online: true };
      this.send(me, { t: "leaderboard", top: rows.slice(0, 20), me: meRow });
      return me;
    }
    if (msg.t === "matchOver") return me; // legacy no-op
    return me;
  }
}

/** In-memory store — used by the test suite and handy for local runs. */
export function memoryStore() {
  const players = new Map(), kv = new Map(), vault = new Map(), push = new Map();
  return {
    pushPut: (owner, sub, keep = 5) => {
      const list = [sub, ...(push.get(owner) || []).filter((s) => s.endpoint !== sub.endpoint)].slice(0, keep);
      push.set(owner, list);
    },
    pushList: (owner) => [...(push.get(owner) || [])],
    pushDelete: (owner, endpoint) => push.set(owner, (push.get(owner) || []).filter((s) => s.endpoint !== endpoint)),
    pushClear: (owner) => push.delete(owner),
    getPlayer: (id) => players.get(id) ? JSON.parse(JSON.stringify(players.get(id))) : undefined,
    putPlayer: (p) => players.set(p.id, JSON.parse(JSON.stringify(p))),
    playerIds: () => [...players.keys()],
    deletePlayer: (id) => players.delete(id),          // v1.0.5: das Vergessen
    vaultClear: (owner) => vault.delete(owner),
    dumpPlayers: () => Object.fromEntries(players),
    kvGet: (k) => kv.get(k) ?? null,
    kvSet: (k, v) => kv.set(k, v),
    vaultPush: (owner, entry, keep) => {
      const list = [entry, ...(vault.get(owner) || [])].slice(0, keep);
      vault.set(owner, list);
    },
    vaultList: (owner) => (vault.get(owner) || []).map(({ data: _d, ...m }) => m),
    vaultGet: (owner, ts) => (vault.get(owner) || []).find((x) => x.ts === ts) || null,
    vaultCount: () => [...vault.values()].reduce((a, v) => a + v.length, 0),
  };
}
