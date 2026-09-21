// GRAND GAMBIT — Cloudflare Worker + Durable Object "Hall".
//
// One Hall coordinates everything: presence, friends, matchmaking, the move
// relay, ratings and the save vault. Clients connect over hibernatable
// WebSockets, so an idle Hall costs nothing; players and live state live in
// the Hall's embedded SQLite and survive both hibernation and deploys.
//
//   npx wrangler deploy          (from the worker/ directory)
//   npx wrangler secret put ADMIN_TOKEN     (optional, ≥ 24 chars)
//
// The game connects to  wss://<worker-host>/ws  — see DEPLOY-WORKER.md.
import { DurableObject } from "cloudflare:workers";
import { HallCore } from "./logic.mjs";
import { generateVapid, deliverPushes, pushText } from "./webpush.mjs";

// kurzer, nicht rueckrechenbarer Fingerabdruck einer IP (FNV-1a, 8 Zeichen)
function kurzHash(v) {
  let h = 0x811c9dc5;
  for (let i = 0; i < v.length; i++) { h ^= v.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.headers.get("Upgrade") === "websocket") {
      const id = env.HALL.idFromName("hall");
      return env.HALL.get(id).fetch(request);
    }
    // health + the error-report endpoints all live in the one Hall
    if (url.pathname === "/health" || url.pathname === "/name-frei" || url.pathname === "/report" || url.pathname === "/reports" || url.pathname === "/design" || url.pathname === "/spielerbuch" || url.pathname === "/vergiss") {
      const id = env.HALL.idFromName("hall");
      return env.HALL.get(id).fetch(request);
    }
    return new Response("Grand Gambit Hall — connect via WebSocket at /ws", {
      status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
  },
};

export class Hall extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, doc TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS vault (owner TEXT NOT NULL, ts INTEGER NOT NULL,
        league INTEGER, gold INTEGER, data TEXT NOT NULL, PRIMARY KEY (owner, ts));
      CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts INTEGER NOT NULL, version TEXT, ua TEXT, url TEXT, kind TEXT,
        message TEXT, stack TEXT, account TEXT, note TEXT, log TEXT);
      CREATE TABLE IF NOT EXISTS push (owner TEXT NOT NULL, endpoint TEXT NOT NULL,
        ts INTEGER NOT NULL, doc TEXT NOT NULL, PRIMARY KEY (owner, endpoint));
    `);
    /* v1.0.3: Nutzer-Feedback traegt eine RUBRIK (Absturz, Balance, ...) und
       bis zu zwei kleine BILDER (DataURLs, clientseitig verkleinert). Die
       Tabelle existiert auf laufenden Hallen schon - also nachtraeglich
       anbauen; scheitert das ALTER (Spalte schon da), ist alles gut. */
    try { this.sql.exec("ALTER TABLE reports ADD COLUMN rubrik TEXT"); } catch {}
    try { this.sql.exec("ALTER TABLE reports ADD COLUMN bilder TEXT"); } catch {}
    const sql = this.sql;
    const store = {
      getPlayer: (id) => {
        const r = [...sql.exec("SELECT doc FROM players WHERE id = ?", id)];
        return r.length ? JSON.parse(r[0].doc) : undefined;
      },
      putPlayer: (p) => { sql.exec("INSERT INTO players (id, doc) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET doc = excluded.doc", p.id, JSON.stringify(p)); },
      playerIds: () => [...sql.exec("SELECT id FROM players")].map((r) => r.id),
      dumpPlayers: () => Object.fromEntries([...sql.exec("SELECT id, doc FROM players")].map((r) => [r.id, JSON.parse(r.doc)])),
      kvGet: (k) => { const r = [...sql.exec("SELECT v FROM kv WHERE k = ?", k)]; return r.length ? r[0].v : null; },
      kvSet: (k, v) => { sql.exec("INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", k, v); },
      vaultPush: (owner, entry, keep) => {
        sql.exec("INSERT OR REPLACE INTO vault (owner, ts, league, gold, data) VALUES (?, ?, ?, ?, ?)",
          owner, entry.ts, entry.league ?? null, entry.gold ?? null, entry.data);
        sql.exec(`DELETE FROM vault WHERE owner = ? AND ts NOT IN
          (SELECT ts FROM vault WHERE owner = ? ORDER BY ts DESC LIMIT ?)`, owner, owner, keep);
      },
      vaultList: (owner) => [...sql.exec("SELECT ts, league, gold FROM vault WHERE owner = ? ORDER BY ts DESC", owner)]
        .map((r) => ({ ts: r.ts, league: r.league ?? 0, gold: r.gold ?? 0 })),
      vaultGet: (owner, ts) => {
        const r = [...sql.exec("SELECT ts, data FROM vault WHERE owner = ? AND ts = ?", owner, ts)];
        return r.length ? { ts: r[0].ts, data: r[0].data } : null;
      },
      vaultCount: () => [...this.sql.exec("SELECT COUNT(*) AS n FROM vault")][0].n,
      // web push: a player may register several devices; the cap keeps the
      // table honest and the oldest address falls off first
      pushPut: (owner, sub, keep = 5) => {
        sql.exec("INSERT OR REPLACE INTO push (owner, endpoint, ts, doc) VALUES (?, ?, ?, ?)",
          owner, sub.endpoint, Date.now(), JSON.stringify(sub));
        sql.exec(`DELETE FROM push WHERE owner = ? AND endpoint NOT IN
          (SELECT endpoint FROM push WHERE owner = ? ORDER BY ts DESC LIMIT ?)`, owner, owner, keep);
      },
      pushList: (owner) => [...sql.exec("SELECT doc FROM push WHERE owner = ?", owner)].map((r) => JSON.parse(r.doc)),
      pushDelete: (owner, endpoint) => { sql.exec("DELETE FROM push WHERE owner = ? AND endpoint = ?", owner, endpoint); },
      pushClear: (owner) => { sql.exec("DELETE FROM push WHERE owner = ?", owner); },
      /* v1.0.5, KONTO-LOESCHUNG: die zwei fehlenden Griffe. */
      deletePlayer: (id) => { sql.exec("DELETE FROM players WHERE id = ?", id); },
      vaultClear: (owner) => { sql.exec("DELETE FROM vault WHERE owner = ?", owner); },
    };
    this.store = store;
    // nudges queue here; kick() drains them AFTER the handler returns, so the
    // synchronous protocol core never waits on crypto or the network
    this.pushJobs = [];
    this.core = new HallCore({
      store,
      send: (id, obj) => this.deliver(id, obj),
      adminToken: env.ADMIN_TOKEN || "",
      notify: (id, data) => { this.pushJobs.push({ id, data }); },
    });
    // The VAPID pair is born ONCE inside this very Hall and kept in its own
    // storage — no dashboard secret, nothing to provision, nothing to lose on
    // a redeploy. blockConcurrencyWhile holds all events until it is ready.
    this.vapid = null;
    this.ctx.blockConcurrencyWhile(async () => {
      let v = null;
      try { v = JSON.parse(store.kvGet("vapid") || "null"); } catch {}
      if (!v?.privateJwk || !v?.publicKey) { v = await generateVapid(); store.kvSet("vapid", JSON.stringify(v)); }
      this.vapid = v;
      this.core.pushKey = v.publicKey;
    });
    // after hibernation: re-seat everyone who is still connected
    for (const ws of this.ctx.getWebSockets()) {
      const att = ws.deserializeAttachment();
      if (att?.id) this.core.online.set(att.id, true);
    }
  }

  // ── the push pump ──────────────────────────────────────────────────────────
  async flushPush() {
    const jobs = this.pushJobs.splice(0);
    for (const { id, data } of jobs) {
      try {
        const subs = this.store.pushList(id);
        if (!subs.length) continue;
        const lang = this.store.getPlayer(id)?.lang || "de";
        const { title, body } = pushText(data.kind, data, lang);
        const payload = { title, body, tag: "gg-" + (data.gameId || "daily"), url: "./" };
        const { gone } = await deliverPushes(subs, payload, this.vapid, {});
        for (const ep of gone) this.store.pushDelete(id, ep);   // dead letter boxes are forgotten
      } catch { /* a failed nudge must never take the Hall down */ }
    }
  }
  /** Fire-and-forget after every entry point: drain nudges, re-arm the alarm. */
  kick() {
    if (this.pushJobs.length) {
      const run = this.flushPush().catch(() => {});
      try { this.ctx.waitUntil(run); } catch { /* runtime without waitUntil: run floats */ }
    }
    this.armAlarm();
  }
  armAlarm() {
    const at = this.core.nextAlarmAt();
    if (at != null && at !== this._alarmAt) {
      this._alarmAt = at;
      try { this.ctx.storage.setAlarm(at); } catch {}
    }
  }
  /** The Hall wakes itself: sweep deadlines & reminders, push, sleep again. */
  async alarm() {
    try { this.core.sweepDaily(); } catch {}
    this._alarmAt = null;
    await this.flushPush().catch(() => {});
    this.armAlarm();
  }

  wsFor(id) {
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.deserializeAttachment()?.id === id) return ws;
    }
    return null;
  }
  deliver(id, obj) {
    const ws = this.wsFor(id);
    if (ws) { try { ws.send(JSON.stringify(obj)); } catch {} }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, online: this.core.online.size }),
        { headers: { "content-type": "application/json" } });
    }
    // ── THE BLACK BOX: crash & error reports pool here so the admin reads them
    //    inside the game. Filing is open to anyone (CORS); reading needs the
    //    admin token. No e-mail, no third-party service — just the Hall. ──
    const cors = {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type",
    };
    if (request.method === "OPTIONS" && (url.pathname === "/report" || url.pathname === "/reports" || url.pathname === "/design" || url.pathname === "/vergiss")) {
      return new Response(null, { status: 204, headers: cors });
    }
    /* ── v1.27.2: IST DER NAME FREI? (Besitzer: "der Server muss pruefen, der
       Name muss online eindeutig sein"). Das Profil fragt hier VOR dem
       Speichern. Offen lesbar wie /design - verraten wird nur frei oder
       nicht, nie, wem ein Name gehoert. */
    if (url.pathname === "/name-frei") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
      const n = url.searchParams.get("n") || "";
      const id = url.searchParams.get("id") || null;
      return new Response(JSON.stringify({ frei: !this.core.nameVergeben(n, id) }),
        { headers: { ...cors, "content-type": "application/json" } });
    }
    // ── THE HOUSE DESIGN: which livery every player gets. Reading is open
    //    (the app asks on boot, pre-login); writing needs the admin token.
    //    Survives deploys and sleep like everything else in the Hall's SQLite.
    if (url.pathname === "/design" && request.method === "GET") {
      const r = [...this.sql.exec("SELECT v FROM kv WHERE k = 'design'")];
      return new Response(JSON.stringify({ design: r.length ? r[0].v : null }),
        { headers: { "content-type": "application/json", ...cors } });
    }
    if (url.pathname === "/design" && request.method === "POST") {
      let b = {}; try { b = await request.json(); } catch {}
      const admin = this.core.adminToken;
      if (!admin || b.token !== admin) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json", ...cors } });
      const design = b.design === "carved" ? "carved" : "classic";
      this.sql.exec("INSERT INTO kv (k, v) VALUES ('design', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", design);
      return new Response(JSON.stringify({ ok: true, design }), { headers: { "content-type": "application/json", ...cors } });
    }
    /* ── DAS VERGESSEN (v1.0.5, Besitzer: "es muss die Moeglichkeit geben,
       ein Konto auch loeschen zu koennen"). Wer loeschen will, weist sich
       mit id UND secret aus - demselben Paar, mit dem er sich in der Halle
       anmeldet. Ein HTTP-Weg statt WebSocket, damit das Loeschen auch fuer
       Staende funktioniert, die gerade nicht verbunden sind. Entfernt wird
       ALLES Persistente: der Spieler, seine Tresor-Staende, seine
       Push-Adressen - und sein Name aus den Freundeslisten der anderen. */
    if (url.pathname === "/vergiss" && request.method === "POST") {
      let b = {}; try { b = await request.json(); } catch {}
      const id = String(b.id || ""), secret = String(b.secret || "");
      const p = id ? this.core.store.getPlayer(id) : undefined;
      if (!p || !secret || p.secret !== secret) {
        return new Response(JSON.stringify({ error: "unauthorized" }),
          { status: 401, headers: { "content-type": "application/json", ...cors } });
      }
      try { this.core.forget(id); } catch {}
      return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", ...cors } });
    }
    if (url.pathname === "/report" && request.method === "POST") {
      let b = {}; try { b = await request.json(); } catch {}
      const clip = (v, n) => (v == null ? null : String(v).slice(0, n));
      try {
        /* Bilder: ein JSON-Array kleiner DataURLs. Der Client verkleinert auf
           ~900 px Kante; die Klammer hier ist die zweite Bremse - zwei Bilder
           zu je ~200 KB base64 passen, mehr wird abgeschnitten (dann fehlt
           schlimmstenfalls das zweite Bild, nie der Bericht). */
        const bilder = Array.isArray(b.bilder)
          ? clip(JSON.stringify(b.bilder.slice(0, 2).map((x) => String(x).slice(0, 300000))), 480000)
          : null;
        this.sql.exec(
          "INSERT INTO reports (ts, version, ua, url, kind, message, stack, account, note, log, rubrik, bilder) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          Date.now(), clip(b.version, 40), clip(b.ua, 240), clip(b.url, 200), clip(b.kind, 20),
          clip(b.message, 400), clip(b.stack, 1600), clip(b.account, 120), clip(b.note, 1000),
          clip(typeof b.log === "string" ? b.log : JSON.stringify(b.log || []), 4000),
          clip(b.rubrik, 30), bilder);
        // keep the table bounded: newest 500 reports
        this.sql.exec("DELETE FROM reports WHERE id NOT IN (SELECT id FROM reports ORDER BY id DESC LIMIT 500)");
      } catch {}
      return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", ...cors } });
    }
    if (url.pathname === "/reports" && request.method === "GET") {
      const token = url.searchParams.get("token") || "";
      const admin = this.core.adminToken;
      if (!admin || token !== admin) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json", ...cors } });
      const limit = Math.min(200, Math.max(1, parseInt(url.searchParams.get("limit") || "100", 10) || 100));
      const rows = [...this.sql.exec("SELECT * FROM reports ORDER BY id DESC LIMIT ?", limit)].map((r) => ({
        ...r, log: (() => { try { return JSON.parse(r.log || "[]"); } catch { return []; } })(),
        bilder: (() => { try { return JSON.parse(r.bilder || "null"); } catch { return null; } })(),
        created_at: new Date(r.ts).toISOString(),
      }));
      return new Response(JSON.stringify({ rows }), { headers: { "content-type": "application/json", ...cors } });
    }
    // ── DAS SPIELERBUCH (Besitzer, v0.73) ────────────────────────────────
    // Wer spielt, wie weit ist er, woher kommt er - und ein paar Zahlen ueber
    // das Spiel im Ganzen. Nur mit Admin-Wort.
    if (url.pathname === "/spielerbuch" && request.method === "GET") {
      const token = url.searchParams.get("token") || "";
      const admin = this.core.adminToken;
      if (!admin || token !== admin) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "content-type": "application/json", ...cors } });
      const jetzt = Date.now();
      const alle = Object.values(this.core.store.dumpPlayers());
      const spieler = alle.map((p) => {
        const truhe = this.core.store.vaultList ? (this.core.store.vaultList(p.id) || []) : [];
        const best = truhe[0] || null;
        return {
          id: p.id, name: p.name || "—", punkte: p.score || 0, wertung: p.rating ?? null,
          sprache: p.lang || "de", privat: p.privacy || "public",
          zuletzt: p.seen || null, beigetreten: p.created || null,
          online: this.core.isOnline ? this.core.isOnline(p.id) : false,
          kapitel: best?.league ?? null, gold: best?.gold ?? null, staende: truhe.length,
          freunde: (p.friends || []).length,
          siege: p.stats?.wins ?? null, partien: p.stats?.games ?? null,
          land: p.land || null, region: p.region || null, stadt: p.stadt || null, geraet: p.ipHash || null,
        };
      }).sort((a, b) => (b.zuletzt || 0) - (a.zuletzt || 0));
      const tag = 864e5;
      const laender = {};
      for (const s2 of spieler) if (s2.land) laender[s2.land] = (laender[s2.land] || 0) + 1;
      const zahlen = {
        spieler: spieler.length,
        online: spieler.filter((x) => x.online).length,
        aktiv24h: spieler.filter((x) => x.zuletzt && jetzt - x.zuletzt < tag).length,
        aktiv7t: spieler.filter((x) => x.zuletzt && jetzt - x.zuletzt < 7 * tag).length,
        mitFortschritt: spieler.filter((x) => (x.kapitel || 0) > 1).length,
        kapitelSchnitt: (() => { const v = spieler.map((x) => x.kapitel).filter(Boolean); return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null; })(),
        partienGesamt: spieler.reduce((a, x) => a + (x.partien || 0), 0),
        laender,
      };
      return new Response(JSON.stringify({ zahlen, spieler }), { headers: { "content-type": "application/json", ...cors } });
    }
    if (request.headers.get("Upgrade") !== "websocket") return new Response("expected websocket", { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    // hibernatable accept: the Hall sleeps between moves, connections stay up
    this.ctx.acceptWebSocket(server);
    // v0.73 (Besitzer): DATENSPARSAME HERKUNFT fuers Spielerbuch - Land und
    // Region kommen von Cloudflare, die IP wird NUR GEHASHT gemerkt (kurzer
    // Fingerabdruck zum Zaehlen von Geraeten, nicht rueckrechenbar).
    const cf = request.cf || {};
    server.serializeAttachment({ id: null, ip: request.headers.get("cf-connecting-ip") || "?",
      herkunft: { land: cf.country || null, region: cf.region || null, stadt: cf.city || null, knoten: cf.colo || null } });
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, raw) {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    const att = ws.deserializeAttachment() || {};
    // hello: seat the identity BEFORE handling — the welcome (and friend
    // pushes) are delivered by id, so the socket must already carry it.
    const preSeat = msg.t === "hello" && msg.id && att.id !== msg.id;
    if (preSeat) ws.serializeAttachment({ ...att, id: msg.id });
    if (msg && msg.t === "hello") msg.__herkunft = { ...(att.herkunft || {}), ipHash: kurzHash(att.ip || "") };
    try {
      const id = this.core.handle(att.id, msg, att.ip || "?");
      if (id && id !== att.id) ws.serializeAttachment({ ...att, id });
    } catch (e) {
      if (preSeat) ws.serializeAttachment(att); // a rejected hello must not hijack the seat
      try { ws.send(JSON.stringify({ t: "error", error: String(e.message || e) })); } catch {}
    } finally {
      this.kick();   // nudges born in this handler leave the house now
    }
  }

  webSocketClose(ws) {
    const att = ws.deserializeAttachment();
    // "identity taken" reconnects: only drop presence if no OTHER socket holds this id
    if (att?.id) {
      const others = this.ctx.getWebSockets().filter((o) => o !== ws && o.deserializeAttachment()?.id === att.id);
      if (!others.length) this.core.close(att.id);
    }
  }
  webSocketError(ws) { this.webSocketClose(ws); }
}
