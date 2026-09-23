// GAMBIT — Web Push, from first principles.
//
// A correspondence game only breathes if the absent player LEARNS that a move
// fell. The browser's push channel needs two cryptographic courtesies, both
// built here on nothing but WebCrypto (so the same file runs in the Worker and
// under Node for the tests):
//
//   VAPID (RFC 8292)  — the Hall signs a short ES256 token so the push service
//                       knows who is knocking. The key pair is generated ONCE
//                       and kept in the Hall's own storage: no dashboard, no
//                       secret to provision, nothing to forget on redeploy.
//   aes128gcm (RFC 8291/8188) — the message body is end-to-end encrypted for
//                       the one browser that subscribed; the push service
//                       relays bytes it cannot read.
//
// The encryption is PROVEN in test_worker.mjs: an independent decryptor,
// written there straight from the RFC's prose (its own ECDH + HKDF chain, not
// this file's), recovers the plaintext byte for byte and checks every header
// field — salt, record size, key id. A shared bug would have to be made twice.

const te = new TextEncoder();

// ── base64url, both directions, no padding ───────────────────────────────────
export const b64u = (buf) => {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
export const unb64u = (s) => {
  const t = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
  const pad = t + "=".repeat((4 - (t.length % 4)) % 4);
  const raw = atob(pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};
const cat = (...parts) => {
  const n = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
};

const subtle = () => globalThis.crypto.subtle;

// ── VAPID key pair: born once, kept forever ──────────────────────────────────
/** Generate a fresh VAPID pair. Returns JWKs for storage plus the raw
 *  uncompressed public point (base64url) that browsers want as
 *  applicationServerKey. */
export async function generateVapid() {
  const kp = await subtle().generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const privateJwk = await subtle().exportKey("jwk", kp.privateKey);
  const publicJwk = await subtle().exportKey("jwk", kp.publicKey);
  const raw = new Uint8Array(await subtle().exportKey("raw", kp.publicKey)); // 65 bytes, 0x04 …
  return { privateJwk, publicJwk, publicKey: b64u(raw) };
}

// ── the door pass: a signed ES256 token for the push service ─────────────────
/** Build the Authorization header (RFC 8292 "vapid" scheme) for one endpoint.
 *  WebCrypto's ECDSA emits the raw r||s form — exactly what JWS wants. */
export async function vapidAuth(endpoint, vapid, { subject = "https://grandgambit.win", nowSec = Math.floor(Date.now() / 1000) } = {}) {
  const aud = new URL(endpoint).origin;
  const header = b64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64u(te.encode(JSON.stringify({ aud, exp: nowSec + 12 * 3600, sub: subject })));
  const signingInput = `${header}.${claims}`;
  const key = await subtle().importKey("jwk", vapid.privateJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await subtle().sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(signingInput));
  return `vapid t=${signingInput}.${b64u(sig)}, k=${vapid.publicKey}`;
}

// ── RFC 8291: encrypt one payload for one subscription ───────────────────────
const hmac = async (keyBytes, data) => {
  const k = await subtle().importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await subtle().sign("HMAC", k, data));
};

/** aes128gcm body for `plaintext` (Uint8Array), addressed to the browser that
 *  handed out p256dh/auth. `testing` may inject a fixed salt and sender key
 *  pair so the RFC vector can be reproduced bit for bit. */
export async function encryptPayload({ p256dh, auth }, plaintext, testing = null) {
  const uaPublic = unb64u(p256dh);                      // 65-byte uncompressed point
  const authSecret = unb64u(auth);                      // 16 bytes
  if (uaPublic.length !== 65 || uaPublic[0] !== 4) throw new Error("bad p256dh");
  if (authSecret.length !== 16) throw new Error("bad auth");

  // the sender's one-night key pair
  let asPrivateKey, asPublic;
  if (testing?.asJwk) {
    asPrivateKey = await subtle().importKey("jwk", testing.asJwk, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
    asPublic = unb64u(testing.asJwk.publicRaw);
  } else {
    const kp = await subtle().generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    asPrivateKey = kp.privateKey;
    asPublic = new Uint8Array(await subtle().exportKey("raw", kp.publicKey));
  }
  const salt = testing?.salt ? unb64u(testing.salt) : globalThis.crypto.getRandomValues(new Uint8Array(16));

  // ECDH → shared secret
  const uaKey = await subtle().importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const ecdhSecret = new Uint8Array(await subtle().deriveBits({ name: "ECDH", public: uaKey }, asPrivateKey, 256));

  // HKDF by hand, exactly as the RFC spells it
  const prkKey = await hmac(authSecret, ecdhSecret);
  const keyInfo = cat(te.encode("WebPush: info"), new Uint8Array([0]), uaPublic, asPublic);
  const ikm = (await hmac(prkKey, cat(keyInfo, new Uint8Array([1])))).slice(0, 32);
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, cat(te.encode("Content-Encoding: aes128gcm"), new Uint8Array([0, 1])))).slice(0, 16);
  const nonce = (await hmac(prk, cat(te.encode("Content-Encoding: nonce"), new Uint8Array([0, 1])))).slice(0, 12);

  // one record: plaintext, the 0x02 delimiter, AES-128-GCM
  const aesKey = await subtle().importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const sealed = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv: nonce }, aesKey, cat(plaintext, new Uint8Array([2]))));

  // header: salt(16) | rs=4096 (uint32 BE) | idlen=65 | as_public(65)
  const header = cat(salt, new Uint8Array([0, 0, 16, 0]), new Uint8Array([65]), asPublic);
  return cat(header, sealed);
}

// ── knock on the push service's door ─────────────────────────────────────────
/** POST one push. `payload` may be null (a bare wake-up: no body, no
 *  encryption — the service worker shows its stock line). Returns
 *  { ok, status, gone } — `gone` marks a dead subscription to forget. */
export async function sendPush(sub, payload, vapid, { subject, ttl = 259200, fetchFn = globalThis.fetch } = {}) {
  const endpoint = sub?.endpoint;
  if (!endpoint || !/^https:\/\//.test(endpoint)) return { ok: false, status: 0, gone: true };
  const headers = { TTL: String(ttl), Urgency: "normal", Authorization: await vapidAuth(endpoint, vapid, { subject }) };
  let body = null;
  if (payload != null) {
    try {
      body = await encryptPayload({ p256dh: sub.keys?.p256dh, auth: sub.keys?.auth }, te.encode(JSON.stringify(payload)));
      headers["Content-Encoding"] = "aes128gcm";
      headers["Content-Type"] = "application/octet-stream";
    } catch { body = null; /* bad keys → send the bare wake-up instead */ }
  }
  try {
    const res = await fetchFn(endpoint, { method: "POST", headers, body });
    return { ok: res.status >= 200 && res.status < 300, status: res.status, gone: res.status === 404 || res.status === 410 };
  } catch {
    return { ok: false, status: 0, gone: false };
  }
}

// ── fan-out: one nudge, every device ─────────────────────────────────────────
/** Send one payload to every subscription a player registered. Dead endpoints
 *  (404/410) come back in `gone` so the caller can forget them. */
export async function deliverPushes(subs, payload, vapid, opts = {}) {
  let sent = 0; const gone = [];
  for (const sub of subs || []) {
    const r = await sendPush(sub, payload, vapid, opts);
    if (r.ok) sent++;
    if (r.gone && sub?.endpoint) gone.push(sub.endpoint);
  }
  return { sent, gone };
}

// ── human words for one nudge ────────────────────────────────────────────────
/** The Hall stays protocol-only; the ADAPTER asks here for the player's
 *  language and gets a title+body ready to encrypt. Kinds: turn, new,
 *  deadline, over. */
export function pushText(kind, d = {}, lang = "de") {
  const de = lang !== "en";
  const opp = d.opp || "?";
  if (kind === "turn") return de
    ? { title: `Dein Zug gegen ${opp}`, body: "Die Fernpartie wartet auf deine Antwort." }
    : { title: `Your move against ${opp}`, body: "The correspondence game awaits your reply." };
  if (kind === "new") return de
    ? { title: "Fernpartie eröffnet", body: `${opp} erwartet deinen ersten Zug.` }
    : { title: "Correspondence game opened", body: `${opp} awaits your first move.` };
  if (kind === "deadline") {
    const h = d.hours || 24;
    return de
      ? { title: "Frist läuft ab", body: `Noch rund ${h} Std. für deinen Zug gegen ${opp} — sonst geht die Partie auf Zeit verloren.` }
      : { title: "Deadline approaching", body: `About ${h} h left to move against ${opp} — or the game is lost on time.` };
  }
  if (kind === "over") {
    const why = d.reason === "time" ? (de ? " auf Zeit" : " on time")
      : d.reason === "resign" ? (de ? " durch Aufgabe" : " by resignation") : "";
    return d.won
      ? (de ? { title: "Fernpartie gewonnen", body: `Der Sieg gegen ${opp}${why} ist verbucht.` }
            : { title: "Correspondence game won", body: `The win against ${opp}${why} is on the books.` })
      : (de ? { title: "Fernpartie verloren", body: `Die Partie gegen ${opp} ging${why} verloren.` }
            : { title: "Correspondence game lost", body: `The game against ${opp} was lost${why}.` });
  }
  return de ? { title: "Gambit", body: "Es gibt Neuigkeiten in deiner Fernpartie." }
            : { title: "Gambit", body: "News in your correspondence game." };
}
