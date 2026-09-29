// Thin WebSocket client for the Gambit multiplayer server.
// JSON messages in/out, tiny event bus.
/* ── v1.90.8 (Audit A25): ER VERSUCHT ES VON SELBST WIEDER ────────────
   Im Kopf stand "no auto-reconnect (the UI owns that)" - und die
   Oberflaeche tat es nirgends. Ein Netzwechsel oder drei Sekunden im
   Hintergrund rissen die Verbindung, und damit war das Duell vorbei: die
   Halle wertete den Abbruch sofort als Niederlage.
   Die Halle haelt die Partie jetzt 30 Sekunden offen (GNADE_MS). Damit das
   etwas nuetzt, muss der Client in dieser Zeit auch wirklich wiederkommen -
   sonst ist die Frist nur eine hoeflichere Art zu verlieren. Er versucht es
   darum selbst, mit wachsendem Abstand, bis die Frist ohnehin um waere.
   `close` wird weiterhin gemeldet, damit die Anzeige Bescheid weiss; nach
   gelungener Rueckkehr kommt `wiederda`. Ein `close()` von Hand beendet die
   Versuche - wer bewusst geht, soll nicht zurueckgeholt werden. */
const VERSUCHE = [700, 1500, 3000, 5000, 8000, 12000];
export function createNet() {
  let ws = null;
  let letzte = null;        // { url, hello } fuer den Wiederanlauf
  let gewollt = false;      // hat jemand von Hand geschlossen?
  let laeuft = null;        // Zeitgeber des naechsten Versuchs
  const handlers = new Map(); // type → Set<fn>
  const emit = (type, msg) => { for (const fn of handlers.get(type) || []) fn(msg); };
  function oeffne(url, hello, aufWiedersehen) {
    return new Promise((resolve, reject) => {
      try { ws = new WebSocket(url); } catch (e) { reject(e); return; }
      ws.onopen = () => { ws.send(JSON.stringify({ t: "hello", ...hello })); };
      ws.onmessage = (ev) => {
        let msg; try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.t === "welcome") resolve(msg);
        emit(msg.t, msg); emit("*", msg);
      };
      ws.onerror = () => reject(new Error("connect failed"));
      ws.onclose = () => { emit("close", {}); aufWiedersehen && aufWiedersehen(); };
    });
  }
  function versuchWieder(stufe = 0) {
    if (gewollt || !letzte || stufe >= VERSUCHE.length) return;
    laeuft = setTimeout(async () => {
      laeuft = null;
      if (gewollt || !letzte) return;
      try {
        await oeffne(letzte.url, letzte.hello, () => versuchWieder(0));
        emit("wiederda", {});
      } catch { versuchWieder(stufe + 1); }
    }, VERSUCHE[stufe]);
  }
  return {
    connect(url, hello) {
      gewollt = false; letzte = { url, hello };
      return oeffne(url, hello, () => versuchWieder(0));
    },
    send(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); },
    on(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); return () => handlers.get(type).delete(fn); },
    close() { gewollt = true; letzte = null;
      if (laeuft) { clearTimeout(laeuft); laeuft = null; }
      try { ws && ws.close(); } catch {} ws = null; },
    get open() { return !!ws && ws.readyState === 1; },
  };
}

/** djb2 hash of the encoded state — cheap desync detector. */
export function stateHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
