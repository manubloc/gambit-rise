/**
 * PIN hashing adapter (web). Prefers PBKDF2/SHA-256 via Web Crypto. Some
 * contexts (notably opening a single-file build from file:// on certain mobile
 * browsers) don't expose crypto.subtle — there we degrade to a non-cryptographic
 * fallback so the optional PIN still works for local testing. Records are tagged
 * so verification always uses the matching scheme.
 *
 * v1.90.4 (Audit A53) — WAS DER RUECKFALL NICHT KANN: er greift nur beim
 * ANLEGEN. Ein PIN, der unter https entstanden ist, traegt einen starken
 * Datensatz (PBKDF2); wird dasselbe Spiel spaeter ohne crypto.subtle
 * geoeffnet - http, LAN, Einzeldatei -, ist dieser Datensatz hier NICHT
 * pruefbar. Frueher hiess das stumm "falsches Passwort" und der Riegel ging
 * nie wieder auf. Heute wirft verifyPin mit grund "keinSubtle", und der
 * Schirm sagt, woran es liegt. Nachtraeglich auf den schwachen Weg
 * ausweichen waere keine Loesung, sondern eine Schwaechung.
 */
const C = globalThis.crypto;
/* Absichtlich eine FUNKTION statt einer Konstanten: so laesst sich der Fall
   "kein subtle" ueberhaupt pruefen (test_saves), und ein Umgebungswechsel
   zur Laufzeit faellt nicht unter den Tisch. */
const subtleVon = () => globalThis.crypto && globalThis.crypto.subtle;
const ITER = 120000;
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

function randomSaltBytes() {
  if (C && C.getRandomValues) return C.getRandomValues(new Uint8Array(16));
  const a = new Uint8Array(16);
  for (let i = 0; i < 16; i++) a[i] = (Math.random() * 256) | 0;
  return a;
}

async function deriveStrong(pin, saltBytes) {
  const subtle = subtleVon();
  const key = await subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await subtle.deriveBits({ name: "PBKDF2", salt: saltBytes, iterations: ITER, hash: "SHA-256" }, key, 256);
  return b64(bits);
}

// Non-cryptographic fallback (FNV-1a). Marked weak; only used without SubtleCrypto.
function deriveWeak(pin, saltStr) {
  let h = 2166136261 >>> 0;
  const s = saltStr + "|" + pin;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return ("0000000" + h.toString(16)).slice(-8);
}

export async function hashPin(pin) {
  const salt = randomSaltBytes();
  const saltStr = b64(salt);
  if (subtleVon()) return { salt: saltStr, hash: await deriveStrong(pin, salt) };
  return { salt: saltStr, hash: deriveWeak(pin, saltStr), weak: true };
}

export async function verifyPin(pin, record) {
  if (!record) return true; // no PIN set
  /* ── v1.90.4 (Audit A53): NICHT "FALSCHE PIN", SONDERN "HIER NICHT PRUEFBAR"
       Ein starker Datensatz (PBKDF2) entsteht nur, wo crypto.subtle da ist -
       also unter https. Wird dasselbe Spiel danach ueber http, im LAN oder
       als Datei geoeffnet, fehlt subtle, und JEDE richtige PIN wurde als
       falsch abgewiesen: ein Riegel ohne Schluessel, ohne dass irgendwo
       stand, warum. Statt eines stummen false gibt es jetzt einen
       erkennbaren Grund, den der Schirm anzeigen kann. Ein PBKDF2-Rueckfall
       auf _sha256Hex kommt NICHT in Frage - er wuerde den starken Datensatz
       nachtraeglich schwaechen. */
  if (!record.weak && !subtleVon()) {
    const e = new Error("PIN nur unter https pruefbar");
    e.grund = "keinSubtle";
    throw e;   // BEWUSST vor dem try: das catch unten macht aus allem false
  }
  try {
    if (record.weak) return deriveWeak(pin, record.salt) === record.hash;
    return (await deriveStrong(pin, fromB64(record.salt))) === record.hash;
  } catch { return false; }
}
