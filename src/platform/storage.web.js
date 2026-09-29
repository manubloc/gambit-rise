/**
 * Storage adapter — same get/set/delete/list interface as blocscore.
 *   shared:false → localStorage (per device): used for the local profile.
 *   shared:true  → Supabase (one shared DB): ready for future online/PvP.
 * Configure VITE_SUPABASE_URL / VITE_SUPABASE_KEY to enable the shared backend.
 */
const ENV = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
const URL = ENV.VITE_SUPABASE_URL;
const KEYV = ENV.VITE_SUPABASE_KEY;
const TABLE = "gambit_store";

let _sb = null;
async function sb() {
  if (_sb) return _sb;
  if (!URL || !KEYV) return null;
  const { createClient } = await import(/* @vite-ignore */ "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
  _sb = createClient(URL, KEYV);
  return _sb;
}

// Sandboxed viewers (opaque-origin iframes, some file previews) THROW on the
// mere touch of window.localStorage. Probe defensively; fall back to an
// in-memory map so the game still boots and plays (progress then lives only
// for the session — fine for previews, real installs get persistence).
const memShim = () => {
  const mem = new Map();
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); },
  };
};
/* ── v1.90.7 (Audit A55): WENN NICHTS BLEIBT, MUSS ES JEMAND SAGEN ─────
   Faellt der Speicher auf den Memory-Shim zurueck - in einem WebView mit
   gesperrten Website-Daten, im privaten Fenster mancher Browser -, dann
   melden `register`, `createSave` und `writeSave` weiterhin Erfolg. Ein
   Spieler legt ein Konto an, spielt stundenlang, und beim naechsten Start
   ist alles fort, ohne dass je eine Warnung kam.
   `fluechtig` ist das Merkmal dafuer. Es steht als Eigenschaft am storage,
   damit die Oberflaeche einmalig warnen kann - und es wird HIER gesetzt,
   wo der Rueckfall tatsaechlich passiert, nicht an einer zweiten Stelle
   geraten. */
let fluechtig = false;
const LS = (() => {
  try {
    const l = typeof window !== "undefined" ? window.localStorage : null;
    if (!l) { fluechtig = true; return memShim(); }   // Node/SSR/tests: session-scoped memory
    const probe = "gambit:probe";
    l.setItem(probe, "1"); l.removeItem(probe);
    return l;
  } catch {
    fluechtig = true;
    return memShim();
  }
})();
const pfx = (shared) => (shared ? "gambit:s::" : "gambit:u::");
const lsGet = (k, s) => { try { const v = LS?.getItem(pfx(s) + k); return v == null ? null : { key: k, value: v, shared: s }; } catch { return null; } };
const lsSet = (k, v, s) => { try { LS?.setItem(pfx(s) + k, v); return { key: k, value: v, shared: s }; } catch { return null; } };
const lsDel = (k, s) => { try { LS?.removeItem(pfx(s) + k); } catch {} return { key: k, deleted: true, shared: s }; };

async function sbGet(k) {
  const c = await sb(); if (!c) return lsGet(k, true);
  const { data, error } = await c.from(TABLE).select("value").eq("key", k).maybeSingle();
  if (error) throw new Error("gambit/storage get failed: " + (error.message || "unknown"));
  return data ? { key: k, value: data.value, shared: true } : null;
}
async function sbSet(k, v) {
  const c = await sb(); if (!c) return lsSet(k, v, true);
  const { error } = await c.from(TABLE).upsert({ key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return error ? null : { key: k, value: v, shared: true };
}

const storage = {
  async get(k, shared = false) { return shared ? sbGet(k) : lsGet(k, false); },
  /* v1.90.7 (Audit A55): true, wenn dieses Geraet nichts dauerhaft behaelt. */
  get fluechtig() { return fluechtig; },
  async set(k, v, shared = false) { return shared ? sbSet(k, v) : lsSet(k, v, false); },
  async delete(k, shared = false) { return shared ? (await sb() ? null : lsDel(k, true)) : lsDel(k, false); },
};
export default storage;
