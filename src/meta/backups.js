// Rolling local restore points for the player's save.
//
// Why: during development the scariest bug is a migration or import that
// corrupts the profile. These snapshots make every such incident recoverable
// on-device — automatically, without the player doing anything.
//
// Policy (pure, tested):
//   • a new snapshot is taken at most every MIN_GAP_MS (10 min) of change
//   • keep the RECENT most recent snapshots (fine-grained safety net)
//   • plus ONE per calendar day for DAILY_DAYS days (long-range anchors)
//   • forced snapshots (before import/reset/migration) always go through
import { storage } from "../platform/index.js";

const KEY = "gambit:restorepoints";
export const BK_RECENT = 6;
export const BK_DAILY_DAYS = 10;
export const BK_MIN_GAP_MS = 10 * 60 * 1000;

const dayOf = (ts) => new Date(ts).toISOString().slice(0, 10);

/** Pure: apply one snapshot to a list, enforcing gap + retention. */
export function applySnapshot(list, profile, now = Date.now(), force = false) {
  const cur = Array.isArray(list) ? list.slice() : [];
  if (!force && cur.length && now - cur[0].ts < BK_MIN_GAP_MS) return cur;
  const entry = {
    ts: now,
    lvl: profile.xpEarned ?? profile.xp ?? 0,
    gold: profile.gold ?? 0,
    league: profile.campaign?.league ?? 1,
    name: profile.name || "",
    data: JSON.stringify(profile),
  };
  const next = [entry, ...cur];
  // retention: newest RECENT unconditionally; older ones one-per-day
  const keep = next.slice(0, BK_RECENT);
  const seenDays = new Set(keep.map((e) => dayOf(e.ts)));
  for (const e of next.slice(BK_RECENT)) {
    const d = dayOf(e.ts);
    if (seenDays.has(d)) continue;
    if (now - e.ts > BK_DAILY_DAYS * 864e5) continue;
    seenDays.add(d);
    keep.push(e);
  }
  return keep;
}

/** Pure: extract the profile stored in one entry (throws on corruption). */
export function readSnapshot(entry) {
  const p = JSON.parse(entry.data);
  if (!p || typeof p !== "object" || !p.pieces) throw new Error("corrupt snapshot");
  return p;
}

/* ── v1.90.18 (Audit A48): JE KONTO STATT GERAETEWEIT ────────────────────────
   Die Liste lag unter EINEM Schluessel fuer alle Konten eines Geraets,
   inklusive Gast. Der Admin sah darum die Sicherungen fremder Konten und
   konnte sie in das angemeldete zurueckholen; und die sechs juengsten Plaetze
   teilten sich alle Konten - wer viel spielte, schob die Sicherungen der
   anderen hinaus.
   Jetzt traegt jeder Eintrag `acc`, die Aufbewahrung gilt je Konto, und die
   Liste zeigt nur die des Kontos. Der Gast sichert nicht (sein Stand ist beim
   Verlassen ohnehin fort, gast.js). Eintraege von vor dieser Fassung tragen
   kein `acc`; sie zeigt keine Liste mehr und die Aufbewahrung raeumt sie
   nach spaetestens zehn Tagen ab. Ein Schluessel fuer alle bleibt - so muss
   nichts umgezogen werden. */
export const eintraegeVon = (list, acc) => (Array.isArray(list) ? list : []).filter((e) => acc && e.acc === acc);

// ── thin async storage wrappers ──────────────────────────────────────────────
async function alleSicherungen() {
  try { const r = await storage.get(KEY, false); return r?.value ? JSON.parse(r.value) : []; }
  catch { return []; }
}
/** Die Sicherungen EINES Kontos (A48). Ohne Konto: keine. */
export async function listRestorePoints(acc) {
  return eintraegeVon(await alleSicherungen(), acc);
}
/** v1.90.16 (Audit A47): Sicherungen eines geloeschten Kontos entfernen.
 *  Die Liste ist geraeteweit und traegt keine Kontokennung (A48) - erkannt
 *  wird ein Eintrag deshalb an etwas, das nur dieses Konto hatte: seiner
 *  Online-Kennung oder genau dem Stand, der geloescht wurde. Rein, getestet. */
export function ohneKonto(list, { onlineIds = [], staende = [], acc = null } = {}) {
  const ids = new Set(onlineIds.filter(Boolean));
  const blobs = new Set(staende.filter(Boolean));
  return (Array.isArray(list) ? list : []).filter((e) => {
    if (acc && e.acc === acc) return false;   /* v1.90.18: seit A48 traegt jeder Eintrag sein Konto */
    if (blobs.has(e.data)) return false;
    try { const p = JSON.parse(e.data); if (p?.online?.id && ids.has(p.online.id)) return false; } catch {}
    return true;
  });
}
export async function vergissKontoInSicherungen(spuren) {
  try {
    const list = await alleSicherungen();
    const rest = ohneKonto(list, spuren);
    if (rest.length !== list.length) await storage.set(KEY, JSON.stringify(rest), false);
    return list.length - rest.length;
  } catch { return 0; }
}
/** Pure (A48): eine Sicherung fuer `acc` in die Gesamtliste - Abstand und
 *  Aufbewahrung gelten nur innerhalb dieses Kontos. */
export function mitSicherung(list, profile, acc, now = Date.now(), force = false) {
  const alle = Array.isArray(list) ? list : [];
  const meine = eintraegeVon(alle, acc);
  const neu = applySnapshot(meine, profile, now, force);
  if (neu === meine || (neu.length === meine.length && neu[0] === meine[0])) return alle;
  return [...neu.map((e) => ({ ...e, acc })), ...alle.filter((e) => e.acc !== acc)];
}
export async function takeRestorePoint(profile, { force = false, acc = null } = {}) {
  if (!acc || profile?.gast) return null;   /* A48: kein Konto, kein Gast */
  try {
    const list = await alleSicherungen();
    const next = mitSicherung(list, profile, acc, Date.now(), force);
    if (next !== list) await storage.set(KEY, JSON.stringify(next), false);
    return eintraegeVon(next, acc);
  } catch { return null; }
}
