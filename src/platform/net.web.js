// Thin WebSocket client for the Gambit multiplayer server.
// JSON messages in/out, tiny event bus, no auto-reconnect (the UI owns that).
export function createNet() {
  let ws = null;
  const handlers = new Map(); // type → Set<fn>
  const emit = (type, msg) => { for (const fn of handlers.get(type) || []) fn(msg); };
  return {
    connect(url, hello) {
      return new Promise((resolve, reject) => {
        try { ws = new WebSocket(url); } catch (e) { reject(e); return; }
        ws.onopen = () => { ws.send(JSON.stringify({ t: "hello", ...hello })); };
        ws.onmessage = (ev) => {
          let msg; try { msg = JSON.parse(ev.data); } catch { return; }
          if (msg.t === "welcome") resolve(msg);
          emit(msg.t, msg); emit("*", msg);
        };
        ws.onerror = () => reject(new Error("connect failed"));
        ws.onclose = () => emit("close", {});
      });
    },
    send(obj) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(obj)); },
    on(type, fn) { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); return () => handlers.get(type).delete(fn); },
    close() { try { ws && ws.close(); } catch {} ws = null; },
    get open() { return !!ws && ws.readyState === 1; },
  };
}

/** djb2 hash of the encoded state — cheap desync detector. */
export function stateHash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
