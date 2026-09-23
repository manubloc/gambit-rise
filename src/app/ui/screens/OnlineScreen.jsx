// Online duel lobby — connect to a Gambit server, manage your friend
// list and privacy, then find an evenly-matched foe: random matchmaking pairs
// players by retinue score, or challenge an online friend directly.
import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "../theme.js";
import { rollTag } from "../namen.js";
import { crestArt } from "../livery.js";
import { LaurelIc, PigeonIc, CloudIc, BladesIc, DiceIc, TrophyIc } from "../icons.jsx";
import { JewelIc } from "../board/PieceGlyph.jsx";
import { Button, Chip, Panel, Segmented, PanelTitle } from "../primitives.jsx";
import { retinueScore, mapUnlocked, buildArmy, buildArmyFromFormation, listSaves, fmtPlaytime } from "../../../meta/index.js";
import { MAPS, mapById, TIME_MODES, timeModeById, clockFor } from "../../../content/index.js";
import { SERVER_URL } from "../../config.js";
import { hasItem } from "../../../content/index.js";
import { serializeSave, parseSave, getAdminToken } from "../../../meta/index.js";
import { useMedia } from "../../App.jsx";


// ── the herald's book: roll a name worthy of the halls ────────────────────────
// Two patterns, one promise: the same name never falls twice in a session.
// (1) "Vorname Beiname" — Maera Salzherz   (2) "EhernerFalke IX" — fused seal.
// The figures a player sees on their own profile, mirrored to the Hall so the
// admin can survey everyone. Same numbers, nothing private.
export function buildStats(profile, playtimeSec) {
  const st = profile.stats || {};
  return {
    games: st.games || 0, wins: st.wins || 0, losses: st.losses || 0, draws: st.draws || 0,
    league: profile.campaign?.league || 1,
    stagesCleared: st.stagesCleared || 0, bossKills: st.bossKills || 0,
    xp: profile.xpEarned || 0, playtimeSec: playtimeSec || 0,
  };
}
// one small mark per gambit — bolt, clock, shield, crown
function ModeGlyph({ glyph, color }) {
  const p = { fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  return <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    {glyph === "bolt" && <path d="M13 2 L5 13.5 L11 13.5 L10 22 L19 10 L13 10 Z" fill={color} stroke="none" />}
    {glyph === "clock" && <><circle cx="12" cy="13" r="8.2" {...p} /><path d="M12 8.6 L12 13 L15.2 14.8" {...p} /><path d="M9 2.6 L15 2.6" {...p} /></>}
    {glyph === "shield" && <path d="M12 2.6 L20 5.6 C20 13.4 16.6 19 12 21.4 C7.4 19 4 13.4 4 5.6 Z" {...p} />}
    {glyph === "crown" && <path d="M3.5 8 L7 13 L12 4.6 L17 13 L20.5 8 L19 19.4 L5 19.4 Z" {...p} />}
  </svg>;
}

export function OnlineScreen({ profile, dispatch, t, net, account, onDaily = null, oeffneDaily = null }) {
  const en = profile.lang === "en";
  const o = profile.online || {};
  const score = useMemo(() => retinueScore(profile), [profile]);
  const myMaps = useMemo(() => MAPS.filter((m) => mapUnlocked(profile, m.id)).map((m) => m.id), [profile]);
  const armyFor = (mapId) => buildArmy(profile, mapById(mapId));
  // classic online: pure standard chess — the plain level-1 side, mate rules
  const [duelMode, setDuelMode] = useState("duel"); // duel | classic
  // THE FOUR GAMBITS: how long a duel is given. The choice travels with the
  // queue entry, so two players only meet when they asked for the same clock.
  const [timeMode, setTimeMode] = useState("rush");
  // the correspondence shelf: games that wait for you, however long that takes
  const [daily, setDaily] = useState([]);
  const [duelMapChoice, setDuelMapChoice] = useState("random"); // "random" | a map id from myMaps
  const classicSide = () => buildArmyFromFormation(() => 1, mapById("classic").defaultFormation);
  const queueMaps = () => {
    if (duelMode === "classic") return ["classic"];
    if (duelMapChoice !== "random" && myMaps.includes(duelMapChoice)) return [duelMapChoice];
    return myMaps;
  };
  // One saved formation per candidate map, keyed by map id — so whichever map
  // the matchmaker (or a friend's client) actually settles on, the army sent
  // to battle is the one you arranged FOR that exact board, never a mismatch.
  const armiesFor = (maps) => duelMode === "classic"
    ? { classic: classicSide() }
    : Object.fromEntries(maps.map((m) => [m, armyFor(m)]));
  const queueArmies = () => armiesFor(queueMaps());
  const queueArmy = () => { const maps = queueMaps(); return queueArmies()[maps[0]]; }; // legacy single-army fallback

  const [server, setServer] = useState(SERVER_URL || o.server || "");
  const name = profile.name || "Spieler " + (o.id || "").slice(0, 4);
  const [tagDraft, setTagDraft] = useState(profile.name || rollTag(en));
  const [conn, setConn] = useState(net.open ? "on" : "off"); // off | busy | on | fail
  const [waitSec, setWaitSec] = useState(0);
  const [onlineN, setOnlineN] = useState(0);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searching, setSearching] = useState(false);
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [challenge, setChallenge] = useState(null); // incoming {challengeId, from}
  const [lb, setLb] = useState(null);
  const noteT = useRef(null);
  const flash = (msg) => { setNote(msg); clearTimeout(noteT.current); noteT.current = setTimeout(() => setNote(""), 3200); };

  // ── THE BELL: web push for correspondence games. The Hall hands its VAPID
  // key in the welcome; the browser subscribes; from then on a closed app is
  // knocked on the moment it is your move. ──────────────────────────────────
  const [pushKey, setPushKey] = useState(null);           // applicationServerKey from the Hall
  const [pushMode, setPushMode] = useState("idle");       // idle | unsupported | denied | off | on | busy
  const pushSupported = typeof window !== "undefined" && "Notification" in window
    && "serviceWorker" in navigator && "PushManager" in window;
  const b64uToU8 = (s) => { const q = s.replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(q + "=".repeat((4 - (q.length % 4)) % 4));
    const out = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i); return out; };
  const syncPush = async () => {
    // silent housekeeping on every connect: push endpoints rotate, the Hall
    // must always hold the CURRENT address — never asks, never nags
    if (!pushSupported) { setPushMode("unsupported"); return; }
    if (Notification.permission === "denied") { setPushMode("denied"); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") { net.send({ t: "push:subscribe", sub: sub.toJSON() }); setPushMode("on"); }
      else setPushMode("off");
    } catch { setPushMode("off"); }
  };
  const enablePush = async () => {
    if (!pushKey || !pushSupported || pushMode === "busy") return;
    setPushMode("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushMode(perm === "denied" ? "denied" : "off"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription())
        || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64uToU8(pushKey) }));
      net.send({ t: "push:subscribe", sub: sub.toJSON() });
      setPushMode("on"); flash(t("push.enabled"));
    } catch { setPushMode("off"); flash(t("push.fail")); }
  };
  const disablePush = async () => {
    if (pushMode === "busy") return;
    setPushMode("busy");
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch {}
    net.send({ t: "push:off" }); setPushMode("off");
  };
  const pushRow = (mt) => {
    if (!pushKey || conn !== "on") return null;
    const bell = (c) => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flex: "0 0 auto" }}>
        <path d="M12 3c-3.2 0-5.2 2.4-5.2 5.4 0 3.8-1.3 5.3-2.3 6.3-.4.4-.1 1.3.6 1.3h13.8c.7 0 1-.9.6-1.3-1-1-2.3-2.5-2.3-6.3C17.2 5.4 15.2 3 12 3Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round"/>
        <path d="M10 18.6a2.1 2.1 0 0 0 4 0" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    );
    if (pushMode === "unsupported") return (
      <div style={{ marginTop: mt, fontSize: 11, color: T.faint, lineHeight: 1.45 }}>{t("push.unsupported")}</div>);
    if (pushMode === "denied") return (
      <div style={{ marginTop: mt, fontSize: 11, color: T.faint, lineHeight: 1.45 }}>{t("push.denied")}</div>);
    if (pushMode === "on") return (
      <div style={{ marginTop: mt, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#c9b8ff" }}>
        {bell("#a78bfa")}<span style={{ flex: 1 }}>{t("push.on")}</span>
        <button onClick={disablePush} style={{ fontFamily: "inherit", fontSize: 11, color: T.faint, background: "none",
          border: "1px solid rgba(120,130,160,.35)", borderRadius: 8, padding: "3px 9px", cursor: "pointer" }}>{t("push.offBtn")}</button>
      </div>);
    return (
      <button onClick={enablePush} disabled={pushMode === "busy"}
        style={{ marginTop: mt, display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left",
          fontFamily: "inherit", cursor: "pointer", padding: "10px 12px", borderRadius: 12,
          background: "linear-gradient(150deg, rgba(167,139,250,.14), rgba(12,16,26,.85) 62%)",
          border: "1.5px solid rgba(167,139,250,.55)", color: "#e6ddff", fontSize: 12.5,
          opacity: pushMode === "busy" ? 0.6 : 1 }}>
        {bell("#a78bfa")}<span>{t("push.cta")}</span>
      </button>);
  };

  useEffect(() => {
    const subs = [
      net.on("welcome", (m) => { setConn("on"); setOnlineN(m.online || 0); net.send({ t: "daily:list" });
        /* v1.27.2: hat der Server den Namen angepasst, weil ein anderer Spieler
           ihn schon traegt, gilt SEIN Name - sonst zeigte das Geraet einen
           Namen, den online jemand anderes fuehrt. */
        if (m.you?.nameAngepasst && m.you?.name && m.you.name !== profile.name)
          dispatch({ type: "REPLACE", profile: { ...profile, name: m.you.name } });
        // aus dem Hauptmenue gewaehlte Partie sofort oeffnen
        if (oeffneDaily?.current) { const g = oeffneDaily.current; oeffneDaily.current = null; net.send({ t: "daily:open", gameId: g }); }
        if (m.push) { setPushKey(m.push); syncPush(); } }),
      net.on("push:ok", (m) => setPushMode(m.on ? "on" : "off")),
      net.on("friends", (m) => { setFriends(m.friends || []); setRequests(m.requests || []); }),
      net.on("challenge", (m) => setChallenge(m)),
      net.on("challengeDeclined", () => flash(t("online.decline"))),
      net.on("info", (m) => flash(m.info === "requestSent" ? t("online.requestSent") : t("online.challengeSent"))),
      net.on("error", (m) => flash(t("online.err", { e: m.error }))),
      net.on("match", () => { setSearching(false); setChallenge(null); }),
      net.on("daily:list", (m) => {
        const gs = m.games || [];
        setDaily(gs);
        // fuers Hauptmenue merken: wer ist dran, gegen wen, wie lange noch
        try {
          localStorage.setItem("gambit:u::daily:v1", JSON.stringify(gs.filter((g) => !g.done).map((g) => ({
            gameId: g.gameId, opp: g.opp?.name || "?", yourTurn: !!g.yourTurn, deadline: g.deadline || 0,
          }))));
        } catch { /* voller Speicher: dann eben ohne Abkuerzung */ }
      }),
      net.on("daily:new", () => { setSearching(false); net.send({ t: "daily:list" }); flash(t("daily.opened")); }),
      net.on("daily:turn", () => net.send({ t: "daily:list" })),
      net.on("daily:ok", () => net.send({ t: "daily:list" })),
      net.on("daily:over", (m) => { net.send({ t: "daily:list" }); flash(m.lost ? t("daily.lost") : t("daily.won")); }),
      net.on("leaderboard", (m) => setLb(m)),
      net.on("vault", (m) => setVault(m.list || [])),
      net.on("admin", (m) => { if (m.cmd === "dump") setUsers(Array.isArray(m.players) ? m.players : Object.values(m.players || {})); }),
      net.on("vaultSave", (m) => {
        try {
          const prof = parseSave(m.save);
          if (confirm(t("online.vaultConfirm"))) dispatch({ type: "REPLACE", profile: prof });
        } catch { flash(t("profile.saveBad")); }
      }),
      net.on("giftSent", () => { dispatch({ type: "SET_ONLINE", online: { ...(profile.online || {}), giftLeague: profile.campaign?.league || 1 } }); flash(t("online.giftSent")); }),
      net.on("gift", (m) => flash(t("online.giftGot", { name: m.from }))),
      net.on("welcome", () => net.send({ t: "leaderboard" })),
      net.on("welcome", () => net.send({ t: "vaultList" })),
      net.on("close", () => { setConn("off"); setSearching(false); }),
    ];
    return () => subs.forEach((u) => u());
  }, [net]); // eslint-disable-line

  // elapsed timer for the matchmaking queue
  useEffect(() => {
    if (!searching) { setWaitSec(0); return; }
    const id = setInterval(() => setWaitSec((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [searching]);

  // it should just work: connect automatically the moment this screen opens
  useEffect(() => { if (conn === "off" && server && o.tagSet) connect(); }, []); // eslint-disable-line

  // keep the server informed when score/privacy change while connected
  useEffect(() => { if (net.open) net.send({ t: "set", score }); }, [score]); // eslint-disable-line

  const [askConsent, setAskConsent] = useState(false);
  const [vault, setVault] = useState(null);
  const [myPlaytime, setMyPlaytime] = useState(0);
  const [users, setUsers] = useState(null);          // admin: the whole roster
  // total playtime across this account's save slots (mirrored for the admin)
  useEffect(() => { let ok = true; (async () => {
    try { if (!account?.id) return; const list = await listSaves(account.id); const tot = (list || []).reduce((a, s) => a + (s.playtimeSec || 0), 0); if (ok) setMyPlaytime(tot); } catch {}
  })(); return () => { ok = false; }; }, [account?.id]);
  // keep the Hall's mirror of my stats fresh while connected
  useEffect(() => {
    if (conn !== "on" || !net.open) return;
    try { net.send({ t: "set", stats: buildStats(profile, myPlaytime) }); } catch {}
  }, [conn, profile, myPlaytime]);
  async function connect(force = false) {
    if (!server) return;
    if (!force && !profile.notices?.online) { setAskConsent(true); return; }
    setConn("busy");
    dispatch({ type: "SET_ONLINE", online: { ...o, server } });
    try {
      await net.connect(server, { id: o.id, secret: o.secret, name, score, privacy: o.privacy || "public", stats: buildStats(profile, myPlaytime), lang: en ? "en" : "de" });
    } catch { setConn("fail"); }
  }
  function setPrivacy(privacy) {
    dispatch({ type: "SET_ONLINE", online: { ...o, privacy } });
    if (net.open) net.send({ t: "set", privacy });
  }
  function findRandom() {
    if (searching) { net.send({ t: "dequeue" }); setSearching(false); return; }
    net.send({ t: "queue", maps: queueMaps(), army: queueArmy(), armies: queueArmies(), mode: duelMode, tc: timeMode });
    setSearching(true);
  }
  const challengeFriend = (f) => { const maps = queueMaps(); net.send({ t: "challenge", targetId: f.id, maps, army: duelMode === "classic" ? classicSide() : armyFor(maps[0]), armies: armiesFor(maps), mode: duelMode, tc: timeMode }); };

  const Line = ({ children }) => <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>{children}</div>;
  const input = { flex: 1, minWidth: 120, background: T.bg2, border: `1px solid ${T.line}`, color: T.text,
    borderRadius: T.radiusSm, padding: "10px 12px", fontSize: 16, fontFamily: "inherit" };

  const wideOn = useMedia("(min-width: 980px)");
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: wideOn ? "1.1fr 1fr" : "1fr", alignItems: "start" }}>
      {/* DER KUERZESTE WEG: laufende Fernpartien stehen GANZ OBEN, noch vor
          Suche und Freundesliste - wer dran ist, soll mit einem Griff hinein. */}
      {daily.some((g) => !g.done) && <Panel style={{ gridColumn: "1 / -1" }}>
  {daily.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div className="gg-serif" style={{ fontSize: 12, letterSpacing: ".12em", color: T.gold, marginBottom: 6 }}>
                      {t("daily.title").toUpperCase()}
                    </div>
                    <div style={{ display: "grid", gap: 6 }}>
                      {daily.map((g) => {
                        const days = Math.max(0, Math.ceil((g.deadline - Date.now()) / 86400000));
                        const mine = g.yourTurn && !g.done;
                        return (
                          <button key={g.gameId} onClick={() => onDaily && onDaily(g.gameId)}
                            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                              fontFamily: "inherit", cursor: "pointer", padding: "10px 12px", borderRadius: 12,
                              background: mine ? "linear-gradient(150deg, rgba(167,139,250,.26), rgba(12,16,26,.9) 62%)"
                                : "linear-gradient(150deg, rgba(30,36,54,.5), rgba(10,12,20,.75))",
                              border: `1.5px solid ${mine ? "#a78bfa" : "rgba(120,130,160,.28)"}`,
                              opacity: g.done ? 0.6 : 1 }}>
                            <span aria-hidden style={{ width: 9, height: 9, borderRadius: "50%", flex: "0 0 auto",
                              background: mine ? "#a78bfa" : "rgba(150,160,190,.5)",
                              boxShadow: mine ? "0 0 8px #a78bfa" : "none" }} />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: T.text }}>{g.opp.name}</span>
                              <span style={{ display: "block", fontSize: 11.5, color: mine ? "#c9b8ff" : T.dim, marginTop: 1 }}>
                                {g.done ? t("daily.done") : mine ? t("daily.yourTurn") : t("daily.waiting")}
                                {!g.done && ` · ${t("daily.left", { d: days + (en ? (days === 1 ? " day" : " days") : (days === 1 ? " Tag" : " Tage")) })}`}
                              </span>
                            </span>
                            <span style={{ fontSize: 11.5, color: T.faint, whiteSpace: "nowrap" }}>{g.moves} ×</span>
                          </button>
                        );
                      })}
                    </div>
                    {pushRow(8)}
                    <div style={{ fontSize: 11, color: T.faint, marginTop: 6, lineHeight: 1.45 }}>{t("daily.hint")}</div>
                  </div>
                )}
      </Panel>}
      <Panel>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="gg-serif" style={{ fontSize: 18, color: T.gold, letterSpacing: ".05em", marginBottom: 4 }}>{t("online.title")}</div>
            <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 10 }}>{t("online.sub")}</div>
          </div>
          {/* the crest of the keep watches over every online bout */}
          <img src={crestArt(3)} alt="" aria-hidden style={{ width: 52, height: 62, objectFit: "contain", flex: "0 0 auto",
            marginTop: -2, filter: "drop-shadow(0 3px 7px rgba(0,0,0,.5))" }} />
        </div>
        {!o.tagSet ? (
          <div style={{ padding: "12px 13px", background: T.panel2, border: `1.5px solid ${T.gold}88`, borderRadius: T.radiusSm }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: T.gold, marginBottom: 4 }}>{t("online.tagTitle")}</div>
            <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.5, marginBottom: 10 }}>{t("online.tagBody")}</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input value={tagDraft} maxLength={24} onChange={(e) => setTagDraft(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: T.bg2, color: T.text, border: `1px solid ${T.line}`,
                  borderRadius: 10, padding: "9px 11px", fontFamily: "inherit", fontSize: 14 }} />
              <Button variant="subtle" title={t("online.tagRoll")} onClick={() => setTagDraft(rollTag(en))}
                style={{ padding: "7px 13px", display: "inline-grid", placeItems: "center" }}><DiceIc size={18} /></Button>
            </div>
            <Button variant="primary" disabled={!tagDraft.trim()} onClick={() => {
              dispatch({ type: "SET_NAME", name: tagDraft.trim() });
              dispatch({ type: "SET_ONLINE", online: { tagSet: true } });
            }}>{t("online.tagOk")}</Button>
          </div>
        ) : conn !== "on" ? (
          <div style={{ display: "grid", gap: 10 }}>
            {askConsent && (
              <div style={{ padding: "11px 12px", background: T.panel2, border: `1.5px solid ${T.gold}88`, borderRadius: T.radiusSm }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: T.gold, marginBottom: 5 }}><PigeonIc size={13} /> {t("online.consentTitle")}</div>
                <div style={{ fontSize: 12.5, color: T.dim, lineHeight: 1.55, marginBottom: 10 }}>{t("online.consentBody")}{" "}
                  <a href="./privacy.html" target="_blank" rel="noreferrer" style={{ color: T.gold }}>{t("privacy.link")}</a></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <Button variant="primary" onClick={() => { setAskConsent(false); dispatch({ type: "SET_NOTICE", key: "online" }); connect(true); }}>{t("online.consentOk")}</Button>
                  <Button variant="subtle" onClick={() => setAskConsent(false)}>{t("online.cancel")}</Button>
                </div>
              </div>
            )}
            {conn === "busy" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 6px" }}>
                <span style={{ width: 22, height: 22, border: `2.5px solid ${T.line}`, borderTopColor: T.gold,
                  borderRadius: "50%", animation: "spin .9s linear infinite" }} />
                <span style={{ fontSize: 14, color: T.dim }}>{t("online.connecting")}</span>
              </div>
            )}
            {conn !== "busy" && !server && (
              <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.55 }}>{t("online.noServer")}</div>
            )}
            {/* v1.0.82 (Besitzerbefund "wofuer braucht es dieses Menue?" -
                der Bildschirm war schlicht LEER): getrennt, aber weder am
                Laden noch fehlgeschlagen - dieser Fall zeigte NICHTS. Kein
                Knopf, keine Meldung, nur die Kopfkarte im Nichts. Wer "Beim
                Start verbinden: von Hand" gewaehlt hat oder dessen Verbindung
                still abriss, landete genau hier. Jetzt steht da, was Sache
                ist, und ein Knopf, der es tut. */}
            {conn === "off" && server && !askConsent && (
              <>
                <div style={{ fontSize: 13, color: T.dim, lineHeight: 1.55 }}>
                  {en ? "Not connected to the duel hall." : "Nicht mit der Duell-Halle verbunden."}</div>
                <Button variant="primary" onClick={connect}>{t("online.connect")}</Button>
              </>
            )}
            {conn === "fail" && server && (
              <>
                <div style={{ fontSize: 13.5, color: T.danger }}>{t("online.unreachable")}</div>
                <Button variant="primary" onClick={connect}>{t("online.retry")}</Button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <Line>
              <Chip color={T.limeInk} bg={T.lime}>{t("online.connected")}</Chip>
              <Chip color={T.text} bg={T.panel2}>{t("online.players", { n: onlineN })}</Chip>
              <Chip color={T.gold} bg={T.panel2}>{t("online.score")}: {score}</Chip>
              <span style={{ flex: 1 }} />
              <Button variant="subtle" onClick={() => net.close()} style={{ padding: "7px 12px", fontSize: 12.5 }}>{t("online.disconnect")}</Button>
            </Line>
                        {!searching ? (<>
              <Segmented value={duelMode} onChange={(m) => { if (searching) { net.send({ t: "dequeue" }); setSearching(false); } setDuelMode(m); }}
                options={[{ value: "duel", label: t("online.duel") }, { value: "classic", label: t("mode.classic") }]} />

              {/* THE FOUR GAMBITS, as cards: name, clock and one line on what
                  the format asks of you. Rush stands a little taller — that is
                  where most duels are actually played. */}
              <div style={{ display: "grid", gap: 7, marginTop: 10 }}>
                {TIME_MODES.map((m) => {
                  const txt = en ? m.en : m.de;
                  const on = timeMode === m.id;
                  return (
                    <button key={m.id} disabled={m.pending}
                      onClick={() => { if (m.pending) return; if (searching) { net.send({ t: "dequeue" }); setSearching(false); } setTimeMode(m.id); }}
                      style={{ textAlign: "left", fontFamily: "inherit", cursor: m.pending ? "default" : "pointer",
                        display: "flex", alignItems: "flex-start", gap: 11, width: "100%",
                        padding: m.featured ? "13px 13px" : "11px 13px", borderRadius: 13,
                        background: on ? `linear-gradient(150deg, ${m.color}2e, rgba(12,16,26,.9) 62%)`
                          : "linear-gradient(150deg, rgba(30,36,54,.5), rgba(10,12,20,.75))",
                        border: `1.5px solid ${on ? m.color : "rgba(120,130,160,.28)"}`,
                        boxShadow: on ? `0 0 16px ${m.color}44` : "none",
                        opacity: m.pending ? 0.62 : 1 }}>
                      <span aria-hidden style={{ width: 30, height: 30, flex: "0 0 auto", borderRadius: "50%",
                        display: "grid", placeItems: "center", background: `${m.color}22`, border: `1px solid ${m.color}77` }}>
                        <ModeGlyph glyph={m.glyph} color={m.color} />
                      </span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                          <span className="gg-serif" style={{ fontSize: m.featured ? 15.5 : 14.5, color: on ? "#fdf6e2" : T.text,
                            letterSpacing: ".03em" }}>{txt.name}</span>
                          <span style={{ fontSize: 11.5, fontWeight: 800, color: m.color, whiteSpace: "nowrap" }}>{txt.tag}</span>
                        </span>
                        <span style={{ display: "block", fontSize: 11.5, lineHeight: 1.45, color: T.dim, marginTop: 3 }}>
                          {txt.blurb}
                        </span>
                        {on && (en ? (m.warnEn || m.noteEn) : (m.warnDe || m.noteDe)) && (
                          <span style={{ display: "block", fontSize: 11, color: m.color, marginTop: 4 }}>
                            {en ? (m.warnEn || m.noteEn) : (m.warnDe || m.noteDe)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
              {duelMode === "duel" && myMaps.length > 1 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11.5, color: T.faint, marginBottom: 5 }}>{t("online.mapChoice")}</div>
                  <Segmented value={duelMapChoice} onChange={setDuelMapChoice}
                    options={[{ value: "random", label: t("online.mapRandom") },
                      ...myMaps.map((m) => ({ value: m, label: en ? mapById(m).nameEn : mapById(m).nameDe }))]} />
                </div>
              )}
              <div style={{ fontSize: 11.5, color: T.dim, margin: "8px 2px 0", lineHeight: 1.5 }}>
                {duelMode === "classic" ? t("online.infoClassic") :
                  duelMapChoice === "random" ? t("online.infoRandomMap") :
                  t("online.infoFixedMap", { map: en ? mapById(duelMapChoice).nameEn : mapById(duelMapChoice).nameDe })}
              </div>
              {/* THE CORRESPONDENCE SHELF: every long game you have running,
                  the ones waiting on YOU first. This list is the whole point of
                  the format — it is what you come back to, days later. */}

              {daily.length === 0 && timeMode === "daily" && pushRow(10)}

              <div style={{ height: 8 }} />
              <Button variant="primary" onClick={findRandom} style={{ padding: "14px", fontSize: 15.5 }}>
                <JewelIc kind="power" size={13} /> {t("online.random")}
              </Button>
            </>) : (
              <div style={{ display: "grid", placeItems: "center", gap: 10, padding: "18px 10px 14px",
                background: T.panel2, borderRadius: T.radius, border: `1px solid ${T.gold}44` }}>
                <div style={{ position: "relative", width: 74, height: 74, display: "grid", placeItems: "center" }}>
                  <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2.5px solid ${T.gold}`,
                    animation: "queuePulse 1.6s ease-in-out infinite" }} />
                  <span style={{ position: "absolute", inset: 10, borderRadius: "50%", border: `2px solid ${T.gold}88`,
                    animation: "queuePulse 1.6s ease-in-out .35s infinite" }} />
                  <span className="gg-serif" style={{ fontSize: 20, color: T.gold, fontWeight: 700 }}>
                    {Math.floor(waitSec / 60)}:{String(waitSec % 60).padStart(2, "0")}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: T.gold, textAlign: "center" }}>{t("online.searching")}</div>
                <div style={{ fontSize: 11.5, color: T.faint }}>{t("online.band", { n: 150 + Math.floor(waitSec / 5) * 60 })}</div>
                {onlineN <= 1 && <div style={{ fontSize: 11.5, color: T.faint, textAlign: "center", maxWidth: 240 }}>{t("online.noOneHint")}</div>}
                <Button variant="subtle" onClick={findRandom} style={{ padding: "8px 18px" }}>{t("online.cancel")}</Button>
              </div>
            )}
                      {/* EINSTELLUNGEN ANS ENDE: erst spielen, dann verwalten - der
                Spielmodus (Gambit/Klassisch) steht jetzt ganz oben. */}
{/* v1.0.82 (Besitzer: "die Buttons laenger, so dass nur einzeilig"): das
                Etikett stand NEBEN der Schiene und nahm ihr die Breite -
                "Nur Freunden" brach dreizeilig um. Jetzt steht es DARUEBER
                und die Schiene laeuft ueber die volle Breite. */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 6, width: "100%" }}>{t("online.privacy")}:</div>
              <Segmented value={o.privacy || "public"} onChange={setPrivacy}
                options={[{ value: "public", label: t("online.public") }, { value: "friends", label: t("online.friendsOnly") }]} />
            </div>
            {/* KEIN ZWANG: die Halle steht beim Start von selbst offen - wer
                das nicht will, stellt es hier ab und verbindet wieder von Hand. */}
            {/* v1.0.82 (Besitzer: "die Buttons laenger, so dass nur einzeilig"): das
                Etikett stand NEBEN der Schiene und nahm ihr die Breite -
                "Nur Freunden" brach dreizeilig um. Jetzt steht es DARUEBER
                und die Schiene laeuft ueber die volle Breite. */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 6, width: "100%" }}>{en ? "Connect on start" : "Beim Start verbinden"}:</div>
              <Segmented value={o.autoConnect === false ? "off" : "on"}
                onChange={(v) => dispatch({ type: "SET_ONLINE", online: { ...o, autoConnect: v !== "off" } })}
                options={[{ value: "on", label: en ? "automatic" : "automatisch" }, { value: "off", label: en ? "manual" : "von Hand" }]} />
            </div>
</div>
        )}
        {note && <div style={{ marginTop: 8, fontSize: 12.5, color: T.gold }}>{note}</div>}
      </Panel>

      {conn === "on" && (
        <Panel>
          <div className="gg-serif" style={{ fontSize: 15.5, color: T.text, letterSpacing: ".05em", marginBottom: 8 }}>{t("online.friends")}</div>
          <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 8 }}>
            {t("online.myCode")}: <b style={{ color: T.gold, letterSpacing: ".08em" }}>{o.id}</b>
            {/* DEN CODE VERSCHICKEN: teilen, wo das Geraet es kann - sonst in
                die Zwischenablage. So kommt ein Freund mit einem Griff herein. */}
            <Button variant="subtle" style={{ padding: "5px 10px", fontSize: 12, marginLeft: 8 }}
              onClick={async () => {
                const text = en
                  ? `Play me at Gambit! My friend code: ${o.id} — https://gambitrise.com`
                  : `Spiel mit mir Gambit! Mein Freundescode: ${o.id} — https://gambitrise.com`;
                try {
                  if (navigator.share) { await navigator.share({ title: "Gambit", text }); return; }
                  await navigator.clipboard.writeText(text);
                  flash(en ? "Invitation copied" : "Einladung kopiert");
                } catch { /* abgebrochen oder verboten: dann eben von Hand */ }
              }}>{en ? "Share" : "Teilen"}</Button>
          </div>
          <Line>
            <input style={input} value={code} onChange={(e) => setCode(e.target.value.trim())} placeholder={t("online.codePh")} maxLength={12} />
            <Button variant="subtle" onClick={() => { if (code) { net.send({ t: "friendRequest", code }); setCode(""); } }}
              style={{ padding: "9px 14px" }}>{t("online.send")}</Button>
          </Line>
          {requests.length > 0 && <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: T.dim, marginBottom: 6 }}>{t("online.requests")}</div>
            {requests.map((r) => (
              <Line key={r.id}>
                <span style={{ fontSize: 13.5, flex: 1 }}>{r.name} <span style={{ color: T.faint }}>({r.id})</span></span>
                <Button variant="primary" style={{ padding: "6px 11px", fontSize: 12.5 }}
                  onClick={() => net.send({ t: "friendRespond", id: r.id, accept: true })}>{t("online.accept")}</Button>
                <Button variant="subtle" style={{ padding: "6px 11px", fontSize: 12.5 }}
                  onClick={() => net.send({ t: "friendRespond", id: r.id, accept: false })}>{t("online.decline")}</Button>
              </Line>
            ))}
          </div>}
          <div style={{ marginTop: 10, display: "grid", gap: 7 }}>
            {friends.length === 0 && <div style={{ fontSize: 12.5, color: T.faint }}>—</div>}
            {friends.map((f) => (
              <Line key={f.id}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.online ? T.green : T.faint }} />
                <span style={{ fontSize: 13.5, flex: 1 }}>{f.name} <span style={{ color: T.faint, fontSize: 11.5 }}>{f.online ? f.score : t("online.offline")}</span></span>
                {f.online && hasItem(profile, "brieftaube") && (
                  (profile.online?.giftLeague || 0) === (profile.campaign?.league || 1)
                    ? <span style={{ fontSize: 11, color: T.faint }}><PigeonIc color={T.faint} size={12} /> ✓</span>
                    : <Button variant="subtle" style={{ padding: "6px 9px", fontSize: 12.5 }} title={t("online.gift")}
                        onClick={() => { net.send({ t: "gift", to: f.id }); }}><PigeonIc color={T.limeInk} size={14} /></Button>
                )}
                {f.online && <Button variant="subtle" style={{ padding: "6px 11px", fontSize: 12.5 }}
                  onClick={() => challengeFriend(f)}><JewelIc kind="power" size={12} /> {t("online.challenge")}</Button>}
              </Line>
            ))}
          </div>
        </Panel>
      )}

      {conn === "on" && account?.isAdmin && (<>
        <Panel>
          <PanelTitle><CloudIc size={13} /> {t("online.vaultTitle")}</PanelTitle>
          <div style={{ fontSize: 12, color: T.dim, margin: "2px 0 10px" }}>{t("online.vaultHint")}</div>
          <Button variant="subtle" style={{ width: "100%", marginBottom: 8 }} onClick={() => {
            net.send({ t: "vaultPush", save: serializeSave(profile),
              meta: { league: profile.campaign?.league || 1, gold: profile.gold || 0 } });
            flash(t("online.vaultSaved"));
          }}>⬆ {t("online.vaultNow")}</Button>
          {(vault || []).length > 0 && <div style={{ display: "grid", gap: 6 }}>
            {vault.map((e) => (
              <div key={e.ts} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 10px",
                background: T.panel2, borderRadius: T.radiusSm, border: `1px solid ${T.line}` }}>
                <span style={{ fontSize: 12.5, flex: 1 }}>
                  <b>{new Date(e.ts).toLocaleString(undefined, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</b>
                  <span style={{ color: T.faint, fontSize: 11.5 }}> · {t("profile.rpMeta", { league: e.league, gold: e.gold })}</span>
                </span>
                <Button variant="subtle" style={{ padding: "5px 10px", fontSize: 12 }}
                  onClick={() => net.send({ t: "vaultPull", ts: e.ts })}>↩</Button>
              </div>
            ))}
          </div>}
        </Panel>

        <Panel>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div className="gg-serif" style={{ fontSize: 15.5, color: T.text, letterSpacing: ".05em", flex: 1, display: "flex", alignItems: "center", gap: 7 }}><TrophyIc size={16} color={"#d9b264"} /> {t("online.leaderboard")}</div>
            <Button variant="subtle" style={{ padding: "6px 11px", fontSize: 12 }} onClick={() => net.send({ t: "leaderboard" })}>{t("online.refresh")}</Button>
          </div>
          {!lb ? <div style={{ fontSize: 12.5, color: T.faint }}>—</div> : <>
            <div style={{ display: "grid", gap: 5 }}>
              {lb.top.map((r, i) => {
                const isMe = r.id === o.id;
                return (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 9px",
                    borderRadius: T.radiusSm, background: isMe ? T.lime + "1e" : "transparent",
                    border: isMe ? `1px solid ${T.lime}66` : "1px solid transparent" }}>
                    <span style={{ width: 24, textAlign: "center", fontSize: 13 }}>{i < 3 ? <LaurelIc rank={i + 1} size={16} /> : <span style={{ color: T.faint, fontWeight: 800 }}>{i + 1}</span>}</span>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.online ? T.green : T.faint, flex: "none" }} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: isMe ? 800 : 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                    <span style={{ fontSize: 11.5, color: T.dim }}>{r.wins}/{r.losses}</span>
                    <span style={{ fontWeight: 900, color: T.gold, fontSize: 13.5, width: 44, textAlign: "right" }}>{r.rating}</span>
                  </div>
                );
              })}
            </div>
            {lb.me && lb.me.rank > 20 && (
              <div style={{ marginTop: 7, fontSize: 12.5, color: T.dim }}>
                #{lb.me.rank} · {lb.me.name} · <b style={{ color: T.gold }}>{lb.me.rating}</b>
              </div>
            )}
          </>}
        </Panel>

        <Panel>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <div className="gg-serif" style={{ fontSize: 15.5, color: T.text, letterSpacing: ".05em", flex: 1 }}>
              {en ? "Users" : "Nutzer"}{users ? ` · ${users.length}` : ""}</div>
            <Button variant="subtle" style={{ padding: "6px 11px", fontSize: 12 }}
              onClick={() => { const tok = getAdminToken(); if (!tok) { flash(en ? "No admin token set (Profile → Reports)" : "Kein Admin-Token gesetzt (Profil → Fehlerberichte)"); return; } net.send({ t: "admin", cmd: "dump", token: tok }); }}>
              {users ? t("online.refresh") : (en ? "Load" : "Laden")}</Button>
          </div>
          <div style={{ fontSize: 11.5, color: T.faint, margin: "-2px 0 9px", lineHeight: 1.45 }}>
            {en ? "Everyone who has gone online. Offline-only players stay on their own device."
                : "Alle, die online waren. Reine Offline-Spieler bleiben auf ihrem Gerät."}</div>
          {!users ? <div style={{ fontSize: 12.5, color: T.faint }}>—</div>
            : users.length === 0 ? <div style={{ fontSize: 12.5, color: T.faint }}>{en ? "No users yet." : "Noch keine Nutzer."}</div>
            : <div style={{ display: "grid", gap: 6 }}>
              {[...users].sort((a, b) => (b.seen || 0) - (a.seen || 0)).map((u) => {
                const st = u.stats || {};
                return (
                  <div key={u.id} style={{ padding: "8px 10px", background: T.panel2, borderRadius: T.radiusSm, border: `1px solid ${T.line}` }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 800, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                      {u.rating != null && <span style={{ fontWeight: 900, color: T.gold, fontSize: 13 }}>ELO {u.rating}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: T.dim, marginTop: 3, display: "flex", flexWrap: "wrap", gap: "2px 9px" }}>
                      <span>{en ? "Chapter" : "Kapitel"} {st.league || 1}</span>
                      <span>· {fmtPlaytime(st.playtimeSec || 0)}</span>
                      <span>· {st.games || 0} {en ? "games" : "Spiele"}</span>
                      <span>· {u.wins}/{u.losses}/{u.draws} {en ? "duels" : "Duelle"}</span>
                      {st.stagesCleared ? <span>· {st.stagesCleared} {en ? "stages" : "Etappen"}</span> : null}
                      {u.seen ? <span style={{ color: T.faint }}>· {new Date(u.seen).toLocaleDateString(en ? "en" : "de", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span> : null}
                    </div>
                  </div>
                );
              })}
            </div>}
        </Panel>
      </>)}

      {challenge && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "grid", placeItems: "center", background: "rgba(8,10,14,.7)", padding: 16 }}>
          <Panel style={{ maxWidth: 340, width: "100%" }}>
            <div className="gg-serif" style={{ fontSize: 17, color: T.gold, marginBottom: 6 }}>
              <JewelIc kind="power" size={13} /> {t("online.challengeFrom", { name: challenge.from.name })}
            </div>
            <div style={{ fontSize: 12.5, color: T.dim, marginBottom: 12 }}>{t("online.score")}: {challenge.from.score}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Button variant="primary" onClick={() => {
                net.send({ t: "challengeRespond", challengeId: challenge.challengeId, accept: true, maps: myMaps, army: challenge.mode === "classic" ? classicSide() : armyFor(myMaps[0]), armies: challenge.mode === "classic" ? { classic: classicSide() } : armiesFor(myMaps) });
                setChallenge(null);
              }}>{t("online.accept")}</Button>
              <Button variant="subtle" onClick={() => {
                net.send({ t: "challengeRespond", challengeId: challenge.challengeId, accept: false });
                setChallenge(null);
              }}>{t("online.decline")}</Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
