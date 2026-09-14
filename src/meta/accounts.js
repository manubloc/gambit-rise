// Accounts — the front door of the game.
//
// Two modes, one API:
//   • LOCAL (always available, offline-first): accounts live on this device,
//     passwords stored as salted SHA-256. Includes the built-in admin and the
//     one-tap guest. This is what runs today.
//   • CLOUD (activates itself when VITE_SUPABASE_URL/KEY are configured):
//     Supabase Auth takes over e-mail + Google sign-in; local mode remains the
//     fallback and the guest path. See cloudAuth.js.
//
// The built-in admin: email "admin". The initial password was rotated in
// v1.0.47 after the previous one leaked into the (public) commit history
// of v1.0.39 — see the note below. The new password exists ONLY as
// SALT + HASH here; it was generated with crypto.randomBytes and was never
// written to any file, commit, or chat log. Only the owner has it.
// Change it again after first sign-in (Profile → account) if you'd rather
// pick your own. Admin unlocks the progress controls on the save screen.
import { storage } from "../platform/index.js";

const KEY = "accounts:v1";
const SKEY = "session:v1";
export const ADMIN_EMAIL = "admin";
/* ── KEIN PASSWORT IM PROGRAMM (v1.0.40) ──────────────────────────────────
   In v1.0.39 stand das Admin-Wort hier im KLARTEXT. Das war falsch: dieses
   Verzeichnis liegt auf GitHub, und ein Wort, das dort steht, ist kein
   Geheimnis mehr - ganz gleich, wie gut es sonst gewaehlt ist. Der Besitzer
   hat zu Recht widersprochen.
   Jetzt liegen hier nur SALZ und PRUEFWERT. Aus ihnen laesst sich das Wort
   nicht zurueckrechnen; das Admin-Konto wird damit angelegt, ohne dass der
   Klartext das Programm je beruehrt. */
export const ADMIN_SALT = "5fa05adb9883ad2177fdf8b6d3c7cb1a";
export const ADMIN_HASH = "2b1c8a3a8c5c89405bdc05dfa6ce98fe98e53c8a1f940cb890037a35d188c852";

const rid = (n) => Array.from({ length: n }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]).join("");

export async function hashPass(pass, salt) {
  const data = new TextEncoder().encode(salt + "\u0000" + pass);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── pure helpers (tested) ────────────────────────────────────────────────────
export const normEmail = (e) => String(e || "").trim().toLowerCase();
export const validEmail = (e) => e === ADMIN_EMAIL || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

export function findAccount(list, email) {
  const e = normEmail(email);
  return (list || []).find((a) => a.email === e) || null;
}

export async function mkAccount({ email, pass, name, provider = "local", isAdmin = false }) {
  const salt = rid(12);
  return {
    /* v1.0.4 (Besitzer): DIE E-MAIL IST NICHT DER NAME IM SPIEL - "im
       Gegenteil sogar, die E-Mail darf nie zum Vorschein kommen." Bisher
       wurde der Kontoname aus dem Teil vor dem @ gebildet und stand dann
       auf dem Spielstandsschirm und im Profil. Das Feld bleibt jetzt LEER;
       den Namen im Spiel vergibt der Spieler selbst (Profil bzw. Halle). */
    id: rid(8), email: normEmail(email), name: name || null,
    salt, passHash: pass != null ? await hashPass(pass, salt) : null,
    provider, isAdmin: !!isAdmin, createdAt: Date.now(),
  };
}

// ── stored list ──────────────────────────────────────────────────────────────
async function readList() {
  try { const r = await storage.get(KEY, false); if (r?.value) return JSON.parse(r.value); } catch {}
  return null;
}
async function writeList(list) { try { await storage.set(KEY, JSON.stringify(list), false); } catch {} }

/* ── DIE ALTEN, VERBRANNTEN WORTE (v1.0.48) ────────────────────────────────
   Beide sind laengst oeffentlich - "gambit-admin" stand bis v1.0.38 als
   Klartext im Programm, das Paar darunter seit v1.0.39 in der Historie.
   Sie stehen hier NICHT als Geheimnis, sondern als Erkennungsmerkmal: nur
   wer noch eines davon traegt, wird umgestellt. */
const VERBRANNT_KLARTEXT = "gambit-admin";
const VERBRANNT_PAARE = [
  { salt: "ef7b15bc3be6c31d516d6675",
    hash: "b8f147ece9132b5ba07b5105420a2e27cba628f9a1d5b679ddb9515b6091ee28" },
];

/** Ensure the account list exists; seed the built-in admin exactly once. */
export async function ensureAccounts() {
  let list = await readList();
  if (!list) {
    list = [{ ...(await mkAccount({ email: ADMIN_EMAIL, pass: null, name: "Admin", isAdmin: true })),
      salt: ADMIN_SALT, passHash: ADMIN_HASH }];   /* v1.0.40: fertiger Pruefwert statt Klartext */
    await writeList(list);
    return list;
  }
  /* ── NACHZUEGLER UMSTELLEN (v1.0.48) ───────────────────────────────────
     HIER LAG DER FEHLER VON v1.0.47. Das neue Admin-Wort wurde nur in den
     QUELLTEXT gesetzt - aber dieser Zweig laeuft ausschliesslich beim
     allerersten Start, wenn noch gar keine Kontenliste existiert. Auf jedem
     Geraet, das schon einmal gespielt hat, liegt die Liste im Speicher, und
     dort stand weiterhin das ALTE Wort. Der Besitzer kam nicht mehr hinein,
     und schlimmer: die Luecke, die der Wechsel schliessen sollte, war auf
     genau den Geraeten offen geblieben, auf denen sie zaehlt.

     Lehre: ein Geheimnis im Quelltext zu tauschen aendert nichts an dem,
     was bereits AUSGELIEFERT und GESPEICHERT ist. Es braucht immer einen
     Weg fuer die Bestandsdaten.

     Wer sein Wort selbst geaendert hat, wird NICHT angefasst - erkennbar
     daran, dass sein Pruefwert zu keinem der verbrannten passt. */
  const adm = findAccount(list, ADMIN_EMAIL);
  if (adm && adm.salt && adm.passHash) {
    let verbrannt = VERBRANNT_PAARE.some((v) => adm.salt === v.salt && adm.passHash === v.hash);
    if (!verbrannt) {
      try { verbrannt = adm.passHash === await hashPass(VERBRANNT_KLARTEXT, adm.salt); } catch {}
    }
    if (verbrannt) {
      adm.salt = ADMIN_SALT;
      adm.passHash = ADMIN_HASH;
      adm.mustChangePass = false;
      await writeList(list);
    }
  }
  return list;
}

/* ── DER NAME MUSS EINMALIG SEIN (v1.4.3, Besitzerfrage) ──────────────────
   "Bei der Namensgebung muss man ja sicherstellen, dass es den Namen nur
   einmal gibt. Machst du da wirklich einen Datenbankabgleich?"

   Die ehrliche Antwort war NEIN: geprueft wurde nur die E-Mail. Zwei Spieler
   konnten denselben Namen tragen - im Hofwert-Vergleich und spaeter beim
   Online-Spiel waere das ein echtes Problem, weil man Gegner am Namen
   erkennt.

   Verglichen wird ohne Ruecksicht auf Gross-/Kleinschreibung und Leerraum,
   damit "Corvin" und "corvin " nicht als zwei Namen durchgehen. */
export const normName = (n) => String(n || "").trim().toLowerCase().replace(/\s+/g, " ");

export function nameVergeben(list, name, ausserId = null) {
  const n = normName(name);
  if (!n) return false;
  return list.some((a) => a && a.id !== ausserId && normName(a.name) === n);
}

/** Ein freier Name aus einem Vorschlag: haengt bei Bedarf eine Zahl an. */
export function freierName(list, vorschlag, ausserId = null) {
  const basis = String(vorschlag || "").trim() || "Spieler";
  if (!nameVergeben(list, basis, ausserId)) return basis;
  for (let i = 2; i < 999; i++) {
    const k = `${basis} ${i}`;
    if (!nameVergeben(list, k, ausserId)) return k;
  }
  return `${basis} ${Date.now() % 10000}`;
}

export async function register(email, pass, name) {
  const e = normEmail(email);
  if (!validEmail(e)) throw new Error("invalid-email");
  if (!pass || pass.length < 6) throw new Error("weak-pass");
  const list = await ensureAccounts();
  if (findAccount(list, e)) throw new Error("exists");
  if (name && nameVergeben(list, name)) throw new Error("name-taken");
  const acc = await mkAccount({ email: e, pass, name });
  list.push(acc); await writeList(list);
  await setSession(acc.id);
  return acc;
}

export async function login(email, pass) {
  /* Nur noch mit E-Mail (Besitzer, v1.0.4). Bisher pruefte allein das
     Anlegen die Form - beim Anmelden ging jede Zeichenkette durch und
     scheiterte erst an der Suche, mit der irrefuehrenden Meldung "kein
     Konto mit dieser E-Mail". Jetzt sagt die Form, was sie ist. Die eine
     Ausnahme bleibt die eingebaute Hintertuer "admin". */
  const e = normEmail(email);
  if (!validEmail(e)) throw new Error("invalid-email");
  const list = await ensureAccounts();
  const acc = findAccount(list, e);
  if (!acc || acc.passHash == null) throw new Error("not-found");
  /* v1.0.51: GETRIMMT - dieselbe Falle wie beim Torschloss. Ein eingefuegtes
     Passwort bringt vom Telefon fast immer ein Leerzeichen mit; niemand
     tippt absichtlich eines an sein Wort. */
  const h = await hashPass((pass || "").trim(), acc.salt);
  if (h !== acc.passHash) throw new Error("wrong-pass");
  await setSession(acc.id);
  return acc;
}

/** DER GAST FAENGT IMMER NEU AN. Bisher lag sein Fortschritt dauerhaft im
 *  Speicher wie bei jedem Konto - der Hinweis "es wird nichts gesichert" war
 *  also unwahr. Jetzt raeumt jeder Gast-Einstieg auf: alte Gast-Spielstaende
 *  und ihr Verzeichnis fallen, bevor die neue Sitzung beginnt. Wer sein Reich
 *  behalten will, legt ein Konto an - genau so steht es im Hinweis. */
export async function loginGuest() {
  const list = await ensureAccounts();
  const alt = list.find((a) => a.provider === "guest");
  if (alt) {
    try {
      // storage.get liefert { value } - nicht den Text selbst
      const r = await storage.get(`saves:${alt.id}`, false);
      for (const s of JSON.parse(r?.value || "[]")) await storage.delete(`save:${alt.id}:${s.id}`, false);
      await storage.delete(`saves:${alt.id}`, false);
    } catch { /* nichts zu raeumen */ }
  }
  let acc = alt;
  if (!acc) {
    acc = await mkAccount({ email: "gast@" + rid(6) + ".local", pass: null, name: "Gast", provider: "guest" });
    list.push(acc); await writeList(list);
  }
  await setSession(acc.id);
  return acc;
}

/** Mirror a cloud (Supabase) identity into the local account list. */
export async function upsertCloudAccount({ email, name, provider, isAdmin }) {
  const list = await ensureAccounts();
  let acc = findAccount(list, email);
  /* v1.4.3: auch ueber Google/Apple darf kein Name doppelt entstehen. Wer
     ueber einen Anbieter kommt, bringt meist seinen Klarnamen mit - und
     "Michael Schmidt" gibt es mehr als einmal. Statt die Anmeldung zu
     verweigern (der Spieler kann nichts dafuer) bekommt er einen freien
     Namen mit Zahl; aendern kann er ihn im Profil. */
  if (!acc) {
    const frei = freierName(list, name || String(email || "").split("@")[0]);
    acc = await mkAccount({ email, pass: null, name: frei, provider }); list.push(acc);
  }
  acc.provider = provider; acc.isAdmin = acc.isAdmin || !!isAdmin;
  await writeList(list); await setSession(acc.id);
  return acc;
}


/* ── DAS KONTO LOESCHEN (v1.0.5, Besitzer: "es muss natuerlich die
   Moeglichkeit geben, ein Konto auch loeschen zu koennen"). Drei Schichten,
   in dieser Reihenfolge:
     1. HALLE: jeder Spielstand traegt seine eigene Online-Kennung
        (profile.online.id/secret). Fuer jede wird /vergiss gerufen - der
        Worker prueft das secret und loescht Spieler, Tresor, Push-Adressen
        und den Namen aus fremden Freundeslisten. Best effort: ist die Halle
        nicht erreichbar, wird das ehrlich zurueckgemeldet statt geschwiegen.
     2. GERAET: alle Spielstaende des Kontos samt Verzeichnis.
     3. KONTO: der Eintrag selbst und die Sitzung.
   Das eingebaute admin-Konto ist ausgenommen - wer es loescht, sperrt sich
   aus den Werkbaenken aus. Ein lokales Konto verlangt sein Passwort. */
export async function deleteAccount(accountId, pass) {
  const list = await ensureAccounts();
  const acc = list.find((a) => a.id === accountId);
  if (!acc) throw new Error("not-found");
  if (acc.email === ADMIN_EMAIL) throw new Error("admin-locked");
  if (acc.passHash != null && (await hashPass(pass || "", acc.salt)) !== acc.passHash) throw new Error("wrong-pass");

  // 1. Die Halle vergisst jede Online-Kennung dieses Kontos.
  let halle = { versucht: 0, geloescht: 0 };
  try {
    const { HALL_HTTP } = await import("../app/config.js");
    const r = await storage.get(`saves:${acc.id}`, false);
    const staende = JSON.parse(r?.value || "[]");
    for (const st of staende) {
      try {
        const sv = await storage.get(`save:${acc.id}:${st.id}`, false);
        const prof = JSON.parse(sv?.value || "null");
        const o = prof?.online;
        if (o?.id && o?.secret && HALL_HTTP) {
          halle.versucht++;
          const res = await fetch(HALL_HTTP + "/vergiss", {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: o.id, secret: o.secret }),
          });
          if (res.ok) halle.geloescht++;
        }
      } catch { /* dieser Stand blockiert die anderen nicht */ }
    }
    // 2. Die Spielstaende und ihr Verzeichnis.
    for (const st of staende) await storage.delete(`save:${acc.id}:${st.id}`, false);
    await storage.delete(`saves:${acc.id}`, false);
  } catch { /* ohne Staende gibt es nichts zu raeumen */ }

  // 3. Das Konto und die Sitzung.
  await writeList(list.filter((a) => a.id !== acc.id));
  await clearSession();
  return { ok: true, halle };
}

export async function changePassword(accountId, oldPass, newPass) {
  if (!newPass || newPass.length < 6) throw new Error("weak-pass");
  const list = await ensureAccounts();
  const acc = list.find((a) => a.id === accountId);
  if (!acc) throw new Error("not-found");
  if (acc.passHash != null && (await hashPass(oldPass || "", acc.salt)) !== acc.passHash) throw new Error("wrong-pass");
  acc.passHash = await hashPass(newPass, acc.salt);
  acc.mustChangePass = false;
  await writeList(list);
  return acc;
}

/** True while the admin still uses the shipped default password. */
export async function adminHasDefaultPass() {
  const list = await ensureAccounts();
  const adm = findAccount(list, ADMIN_EMAIL);
  if (!adm) return false;
  /* Warnt, solange das MITGELIEFERTE Wort noch gilt - erkennbar daran, dass
     Salz und Pruefwert unveraendert sind. Sobald jemand sein Wort aendert,
     wechselt beides und die Warnung verstummt. */
  return adm.salt === ADMIN_SALT && adm.passHash === ADMIN_HASH;
}

// ── session ──────────────────────────────────────────────────────────────────
export async function setSession(accountId) { try { await storage.set(SKEY, JSON.stringify({ accountId, at: Date.now() }), false); } catch {} }
export async function clearSession() { try { await storage.delete(SKEY, false); } catch {} }
export async function currentAccount() {
  try {
    const r = await storage.get(SKEY, false);
    if (!r?.value) return null;
    const { accountId } = JSON.parse(r.value);
    const list = await ensureAccounts();
    return list.find((a) => a.id === accountId) || null;
  } catch { return null; }
}
