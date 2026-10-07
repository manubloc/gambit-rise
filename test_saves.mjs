// Accounts + save slots: the front door and the career shelf.
import { ensureAccounts, register, login, loginGuest, findAccount, hashPass, normEmail, validEmail, mkAccount,
  changePassword, adminHasDefaultPass, ADMIN_EMAIL, ADMIN_SALT, ADMIN_HASH, currentAccount, clearSession, deleteAccount } from "./src/meta/accounts.js";
import { createSave, listSaves, loadSave, writeSave, deleteSave, renameSave,
  progressPct, withProgressPct, leagueOrder, migrateLegacyInto, fmtPlaytime,
  merkeStand, vergissStand, sichereStandSofort } from "./src/meta/saves.js";
import { defaultProfile } from "./src/meta/profile.js";
import { storage } from "./src/platform/index.js";
import { hashPin, verifyPin } from "./src/platform/crypto.web.js";
import { CHARACTERS, BOSSES, ITEMS } from "./src/content/index.js";
import { ownedLeagueBosses } from "./src/meta/leveling.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log("  ok  -", name); } else { fail++; console.log(" FAIL -", name); } };

// ── accounts ─────────────────────────────────────────────────────────────────
const seeded = await ensureAccounts();
ok("first boot seeds exactly the built-in admin", seeded.length === 1 && seeded[0].email === ADMIN_EMAIL && seeded[0].isAdmin);
/* v1.0.40: Das Admin-Wort steht NICHT mehr im Programm - nur Salz und
   Pruefwert. Diese Proben brauchen es aber, um sich anzumelden. Sie setzen
   deshalb ein EIGENES Testwort auf das Konto und pruefen daran dieselben
   Regeln; das echte Wort bleibt draussen, wo es hingehoert. */
/* ── BESTANDSGERAETE WERDEN UMGESTELLT (v1.0.48) ───────────────────────────
   v1.0.47 tauschte das Admin-Wort NUR im Quelltext. ensureAccounts() legt das
   Konto aber ausschliesslich beim allerersten Start an - auf jedem Geraet,
   das schon gespielt hatte, blieb das alte Wort im Speicher stehen. Der
   Besitzer kam nicht mehr hinein, und die Luecke blieb genau dort offen, wo
   sie zaehlt. Diese Probe haelt fest, dass Bestandsdaten mitwandern. */
{
  const { storage: st } = await import("./src/platform/index.js");
  const ALT_SALT = "ef7b15bc3be6c31d516d6675";
  const ALT_HASH = "b8f147ece9132b5ba07b5105420a2e27cba628f9a1d5b679ddb9515b6091ee28";

  // FALL 1: ein Geraet aus der v1.0.39/40-Zeit
  await st.set("accounts:v1", JSON.stringify([{ id: "a1", email: ADMIN_EMAIL, name: "Admin",
    isAdmin: true, salt: ALT_SALT, passHash: ALT_HASH }]), false);
  let nach = await ensureAccounts();
  let a = nach.find((x) => x.email === ADMIN_EMAIL);
  ok("ein Bestandskonto mit dem verbrannten Paar wird umgestellt",
    a.salt === ADMIN_SALT && a.passHash === ADMIN_HASH);

  // FALL 2: ein noch aelteres Geraet - eigenes Salz, aber das Klartextwort
  const altSalz = "irgendeinaltessalz01";
  await st.set("accounts:v1", JSON.stringify([{ id: "a2", email: ADMIN_EMAIL, name: "Admin",
    isAdmin: true, salt: altSalz, passHash: await hashPass("gambit-admin", altSalz) }]), false);
  nach = await ensureAccounts();
  a = nach.find((x) => x.email === ADMIN_EMAIL);
  ok("auch das alte Klartextwort mit eigenem Salz wird erkannt und ersetzt",
    a.salt === ADMIN_SALT && a.passHash === ADMIN_HASH);

  // FALL 3: wer sein Wort SELBST geaendert hat, bleibt unangetastet.
  const eigen = "meineigenessalz99";
  const eigenHash = await hashPass("mein-eigenes-wort", eigen);
  await st.set("accounts:v1", JSON.stringify([{ id: "a3", email: ADMIN_EMAIL, name: "Admin",
    isAdmin: true, salt: eigen, passHash: eigenHash }]), false);
  nach = await ensureAccounts();
  a = nach.find((x) => x.email === ADMIN_EMAIL);
  ok("ein selbst gesetztes Wort wird NICHT ueberschrieben",
    a.salt === eigen && a.passHash === eigenHash);

  await st.delete("accounts:v1", false);
}

/* ── EIN LEERZEICHEN SPERRTE DIE TUER (v1.0.51) ────────────────────────────
   Der Besitzer kam DREIMAL nicht in seine eigenen Bereiche. Wort und
   Pruefwert stimmten bei jeder Nachrechnung - der Fehler lag im Weg dorthin:
   wer ein 22-stelliges Zufallswort vom Telefon einfuegt, bringt fast immer
   ein Leerzeichen oder einen Zeilenumbruch mit. Ein einziges unsichtbares
   Zeichen macht aus dem richtigen Wort einen falschen Hash.
   Eine Passwortpruefung, die daran scheitert, ist nicht sicherer - nur
   unbrauchbar. Beide Tueren trimmen jetzt. */
{
  const { storage: st2 } = await import("./src/platform/index.js");
  await st2.delete("accounts:v1", false);
  const salz = "probesalz4711";
  const wort = "Ein-Wort-Mit-22-Zeich";
  await st2.set("accounts:v1", JSON.stringify([{ id: "t1", email: "trimtest@example.com",
    name: "Trim", salt: salz, passHash: await hashPass(wort, salz) }]), false);
  let gut = 0;
  for (const versuch of [wort, wort + " ", " " + wort, wort + "\n", "  " + wort + "  "]) {
    try { await login("trimtest@example.com", versuch); gut++; } catch {}
  }
  ok("das Wort oeffnet auch mit Leerzeichen und Umbruch am Rand", gut === 5);
  let falschAb = false;
  try { await login("trimtest@example.com", wort + "x"); } catch { falschAb = true; }
  ok("ein wirklich falsches Wort bleibt draussen", falschAb);
  await st2.delete("accounts:v1", false);
}

/* ── DIE ANLEGE-TUER TRIMMTE NICHT (v1.90.3, Audit A6) ─────────────────────
   Die Probe darueber sichert nur die ANMELDUNG. Gemessen im Audit: wer sein
   Wort beim ANLEGEN mit Leerzeichen einfuegte, war nach der ersten Abmeldung
   endgueltig ausgesperrt - mkAccount hashte roh, login getrimmt, die beiden
   trafen sich nie. Jetzt trimmen beide, und ein Bestandskonto mit rohem Hash
   kommt ueber den zweiten Versuch weiterhin hinein. */
{
  const { storage: st3 } = await import("./src/platform/index.js");
  const am = await import("./src/meta/accounts.js");
  await st3.delete("accounts:v1", false);
  await am.register("neu@example.com", "geheim123 ");     // Leerzeichen am Rand
  let ohne = false, mit = false;
  try { await am.login("neu@example.com", "geheim123"); ohne = true; } catch {}
  try { await am.login("neu@example.com", "geheim123 "); mit = true; } catch {}
  ok("ein beim Anlegen eingefuegtes Wort oeffnet auch ohne das Leerzeichen", ohne);
  ok("... und mit dem Leerzeichen ebenso", mit);
  let fremd = false;
  try { await am.login("neu@example.com", "geheim124"); } catch { fremd = true; }
  ok("... ein anderes Wort bleibt draussen", fremd);
  /* Bestandskonto: Hash ueber das ROHE Wort, wie ihn Faassungen vor v1.90.3 anlegten */
  const salz2 = "altsalz99", altWort = "Altes-Wort ";
  await st3.set("accounts:v1", JSON.stringify([{ id: "t9", email: "alt@example.com",
    name: "Alt", salt: salz2, passHash: await hashPass(altWort, salz2) }]), false);
  let altOk = false;
  try { await am.login("alt@example.com", altWort); altOk = true; } catch {}
  ok("ein Bestandskonto mit rohem Hash kommt weiterhin hinein", altOk);
  await st3.delete("accounts:v1", false);
}

const TESTWORT = "probe-wort-2026";
{
  const liste = await ensureAccounts();
  const a = liste.find((x) => x.email === ADMIN_EMAIL);
  ok("the shipped admin carries a check value, not a password", !!a.passHash && a.salt === ADMIN_SALT && a.passHash === ADMIN_HASH);
  ok("the default-password warning fires while it is untouched", (await adminHasDefaultPass()) === true);
  // Testwort setzen, indem Salz und Pruefwert direkt ersetzt werden
  a.salt = "probe-salz"; a.passHash = await hashPass(TESTWORT, "probe-salz");
  await storage.set("accounts:v1", JSON.stringify(liste), false);   /* wie writeList: JSON-Text, nicht Objekt */
}
const adm = await login(ADMIN_EMAIL, TESTWORT);
ok("admin signs in", adm.isAdmin === true);
ok("and once the word is his own, the warning stops", (await adminHasDefaultPass()) === false);
await changePassword(adm.id, TESTWORT, "neues-passwort");
ok("changing it again works", await login(ADMIN_EMAIL, "neues-passwort").then((x) => !!x, () => false));
ok("and the old password no longer works", await login(ADMIN_EMAIL, TESTWORT).then(() => false, (e) => e.message === "wrong-pass"));

ok("emails are normalized", normEmail("  Ana@Mail.DE ") === "ana@mail.de");
ok("email validation accepts real addresses and the admin alias", validEmail("a@b.de") && validEmail(ADMIN_EMAIL) && !validEmail("nope"));
const ana = await register("ana@mail.de", "geheim99", "Ana");
ok("registration signs the player in", (await currentAccount())?.id === ana.id && !ana.isAdmin);
ok("duplicate registration is rejected", await register("ana@mail.de", "xxxxxx").then(() => false, (e) => e.message === "exists"));
ok("weak passwords are rejected", await register("b@c.de", "123").then(() => false, (e) => e.message === "weak-pass"));
ok("wrong password is rejected", await login("ana@mail.de", "falsch!").then(() => false, (e) => e.message === "wrong-pass"));
const guest = await loginGuest();
ok("guest entry needs no credentials and is reused", guest.provider === "guest" && (await loginGuest()).id === guest.id);
const h1 = await hashPass("pass", "salt"), h2 = await hashPass("pass", "other");
ok("password hashes are salted", h1 !== h2 && h1.length === 64);

// ── save slots ───────────────────────────────────────────────────────────────
const A = ana.id;
const s1 = await createSave(A, "Erste Reise");
ok("a fresh slot starts at 0% with a default profile", s1.pct === 0 && s1.playtimeSec === 0 && s1.league === 1);
const prof = await loadSave(A, s1.id);
prof.campaign.cleared = ["L01s00", "L01s01", "L01s03"];
const upd = await writeSave(A, s1.id, prof, 125);
ok("writes document progress and accumulate playtime", upd.clearedCount === 3 && upd.playtimeSec === 125 && upd.pct > 0);
await writeSave(A, s1.id, prof, 55);
ok("playtime keeps adding up", (await listSaves(A))[0].playtimeSec === 180);
const s2 = await createSave(A, null);
ok("slots auto-name and list newest-first", (await listSaves(A))[0].id === s2.id && /2/.test(s2.name));
await renameSave(A, s2.id, "Zweite Reise");
ok("renaming sticks", (await listSaves(A)).find((x) => x.id === s2.id).name === "Zweite Reise");
await deleteSave(A, s2.id);
ok("deleting removes slot and payload", (await listSaves(A)).length === 1 && (await loadSave(A, s2.id)) === null);
ok("playtime formats like a game", fmtPlaytime(45) === "0 min" && fmtPlaytime(3720) === "1 h 02 min");

// ── progress dial (the admin control) ────────────────────────────────────────
import { CAMPAIGN as CSaves } from "./src/content/index.js";
const N1 = CSaves.filter((n) => n.league === 1).length;
const order = leagueOrder(1);
ok("journey order covers the whole chapter once, main spine first", order.length === N1 && new Set(order).size === N1 && order[0] === "L01s00");
const full = withProgressPct(defaultProfile(), 100);
ok("100% clears every site of the chapter", full.campaign.cleared.length === N1 && progressPct(full) === 100);
ok("100% unlocks the bosses along the way", full.campaign.unlocked.length >= 2 && full.gold > 500);
const half = withProgressPct(defaultProfile(), 50);
ok("50% clears the first half in journey order", half.campaign.cleared.length === Math.round(N1 / 2) && half.campaign.cleared[0] === "L01s00");
const zero = withProgressPct({ ...full, name: "Keep" }, 0);
ok("0% resets progress but keeps the identity", zero.campaign.cleared.length === 0 && zero.gold === 0 && zero.name === "Keep");

// ── legacy migration ─────────────────────────────────────────────────────────
await storage.set("profile", JSON.stringify({ ...defaultProfile(), gold: 777 }), false);
const mig = await migrateLegacyInto(A);
ok("the pre-account profile becomes an imported slot", mig && (await loadSave(A, mig.id)).gold === 777);
ok("migration runs only once", (await migrateLegacyInto(A)) === null);
/* ── v1.90.4 (Audit A52): DER GAST ERBT NICHTS ───────────────────
   Die Uebernahme lief fuer JEDES Konto. Der Gast bekam den Altstand - und
   loginGuest raeumt beim naechsten Gast-Einstieg alle Gast-Staende: der
   Fortschritt war fort UND der Merker gesetzt, der Altstand also fuer immer
   verloren. Geprueft mit frischem Merker und frischem Altstand. */
{
  await storage.delete("saves:migrated", false);
  await storage.set("profile", JSON.stringify({ ...defaultProfile(), gold: 4242 }), false);
  const gast = await mkAccount("a52gast@test.de", "wort1234");
  const versuch = await migrateLegacyInto(gast.id, "guest");
  ok("A52: ein Gast bekommt den Altstand NICHT", versuch === null);
  ok("A52: und er liegt noch da - der Merker wurde nicht gesetzt",
    !!(await storage.get("profile", false))?.value && !(await storage.get("saves:migrated", false))?.value);
  const echt = await mkAccount("a52echt@test.de", "wort1234");
  const geerbt = await migrateLegacyInto(echt.id, "local");
  ok("A52: ein richtiges Konto bekommt ihn danach immer noch",
    geerbt && (await loadSave(echt.id, geerbt.id)).gold === 4242);
}

// ── records + leaderboards (v0.17) ───────────────────────────────────────────
const { recordStage, totalBestMoves, fmtMs } = await import("./src/meta/records.js");
const { mergeBoard } = await import("./src/meta/leaderboard.js");
{
  let p = { ...defaultProfile() };
  p = recordStage(p, { id: "L01s00", moves: 24, now: 1000 });
  ok("first victory starts the run clock and logs the moves", p.records.runStartAt === 1000 && p.records.moves.L01s00 === 24 && p.records.wins === 1);
  p.campaign.cleared = ["L01s00"];
  p = recordStage(p, { id: "L01s00", moves: 30, now: 2000 });
  ok("worse move counts never overwrite the best", p.records.moves.L01s00 === 24 && p.records.wins === 2);
  p = recordStage(p, { id: "L01s00", moves: 18, now: 3000 });
  ok("better move counts do", p.records.moves.L01s00 === 18);
  p.campaign.cleared = leagueOrder(1).filter((id) => id !== "L01s44");
  p = recordStage(p, { id: "L01s44", moves: 40, now: 61000 });
  ok("felling the throne stops the run clock", p.records.fastestRunMs === 60000 && fmtMs(60000) === "1 min 00 s");
  const again = recordStage(p, { id: "L01s44", moves: 33, now: 990000 });
  ok("later throne replays keep the first run time", again.records.fastestRunMs === 60000);
  p.campaign.cleared = ["L01s00", "L01s01"];
  p.records.moves = { L01s00: 18, L01s01: 22, x99: 5 };
  const tb = totalBestMoves(p);
  ok("total best moves sums only cleared league stages", tb.sum === 40 && tb.stages === 2);
}
{
  let b = mergeBoard("progress", [], { uid: "a", name: "Ana", value: 40, at: 10 });
  b = mergeBoard("progress", b, { uid: "b", name: "Ben", value: 70, at: 20 });
  ok("progress sorts high-to-low", b[0].uid === "b" && b[1].uid === "a");
  b = mergeBoard("progress", b, { uid: "a", name: "Ana", value: 90, at: 30 });
  ok("resubmitting replaces your own entry", b.length === 2 && b[0].uid === "a" && b[0].value === 90);
  let f = mergeBoard("fastrun", [], { uid: "a", name: "Ana", value: 5000, at: 10 });
  f = mergeBoard("fastrun", f, { uid: "b", name: "Ben", value: 3000, at: 20 });
  ok("fastest run sorts low-to-high", f[0].uid === "b");
  const many = Array.from({ length: 60 }, (_, i) => ({ uid: "u" + i, name: "P" + i, value: i, at: i }));
  let m = [];
  for (const e of many) m = mergeBoard("moves", m, e);
  ok("boards cap at the top 50", m.length === 50 && m[0].value === 0);
}

await clearSession();

// ── v0.19 pause & resume: the codec round-trips a mid-fight snapshot ─────────
{
  const { createGame, reduce, moveCommand, encodeState, decodeState } = await import("./src/core/index.js");
  const { buildAiArmyForMap, buildArmyFromFormation } = await import("./src/meta/index.js");
  const { mapById } = await import("./src/content/index.js");
  const map = mapById("classic");
  const mine = buildArmyFromFormation(() => 1, map.defaultFormation);
  const foe = buildAiArmyForMap("easy", map, 7);
  let st = createGame(mine, foe, { map, rules: "hp", seed: 7, potions: { w: 2, b: 0 } });
  const mv = (await import("./src/core/index.js")).pieceMoves ? null : null;
  // play the first legal pawn-ish move via the move generator on the sim
  const { status } = await import("./src/core/index.js");
  const legal = (await import("./src/core/index.js")).legalMoves ? (await import("./src/core/index.js")).legalMoves(st) : null;
  if (legal && legal.length) st = reduce(st, moveCommand(legal[0])).state;
  const back = decodeState(encodeState(st));
  ok("pause codec keeps the turn", back.turn === st.turn);
  ok("pause codec keeps the log", (back.log || []).length === (st.log || []).length);
  ok("pause codec keeps the potions", back.potions?.w === st.potions?.w);
  ok("pause codec keeps the board", JSON.stringify(back.board) === JSON.stringify(st.board));
}

// ── the dial hands over a completionist's save (v0.22.13) ────────────────────
{
  const { CHARACTERS, BOSSES, ITEMS } = await import("./src/content/index.js");
  const { isUnlocked, ownedLeagueBosses } = await import("./src/meta/leveling.js");
  const everything = withProgressPct(defaultProfile(), 100, 10);
  ok("league X at 100% recruits every character", Object.values(CHARACTERS).every((c) => isUnlocked(c, everything)));
  ok("league X at 100% has met every monster", BOSSES.every((b) => (everything.codex?.met || []).includes("X:" + b.id)));
  ok("league X at 100% fields every reachable boss", ownedLeagueBosses(everything).length === 40 && everything.stats.leaguesWon === 10);  // v1.91.0: 42 Bosse, Asra (XI) und Osric (XII) warten hinter Kapitel X
  ok("league X at 100% fills the whole chest", Object.keys(ITEMS).every((id) => (everything.items || {})[id] >= 1));
  const mid = withProgressPct(defaultProfile(), 40, 5);
  ok("mid-journey counts earlier leagues as mastered", mid.stats.leaguesWon === 4 && mid.campaign.unlocked.length >= 8 && (mid.campaign.bribedBosses || []).length === 0);
}


// ── workbench full build: 100% at league X leaves nothing dark ──────────────
const COURT_T = ["gambit","pawn","knight","bishop","rook","queen","king"];
const fullB = withProgressPct(defaultProfile(), 100, 10);
const fullUn = new Set(fullB.campaign.unlocked), fullMet = new Set(fullB.codex.met);
ok("full build recruits every character", Object.keys(CHARACTERS).every((id) => fullUn.has(id) || COURT_T.includes(id)));
ok("full build meets every monster in the codex", BOSSES.every((b) => fullMet.has("X:" + b.id)));
const fullOwned = new Set([...ownedLeagueBosses(fullB), ...(fullB.campaign.bribedBosses || [])]);
ok("full build fields every monster except the last two masters", BOSSES.every((b) => fullOwned.has(b.id) || b.id === "b35" || b.id === "b36"));  // v1.91.0: Asra und Osric stehen jenseits von Kapitel X
ok("full build fills the chest", Object.values(ITEMS).every((it) => (fullB.items[it.id] || 0) > 0));
ok("full build counts ten league crowns", fullB.stats.leaguesWon === 10);

// ── v1.0.4: DIE E-MAIL BLEIBT DIE E-MAIL ───────────────────────────────────
// Der Besitzer: "man sollte sich nur noch mit E-Mail einloggen duerfen, und
// die E-Mail darf nie zum Vorschein kommen." Zwei Zusagen, zwei Pruefungen.
{
  const acc = await mkAccount({ email: "Manuel.Frey@Example.COM", pass: "geheim123" });
  ok("das Konto leitet KEINEN Spielnamen aus der E-Mail ab",
    acc.name == null && !String(acc.name || "").includes("manuel"));
  ok("die E-Mail wird normalisiert gespeichert", acc.email === "manuel.frey@example.com");
  const ohnePass = await mkAccount({ email: "b@c.de", pass: null, name: "Herold" });
  ok("ein mitgegebener Name bleibt unangetastet", ohnePass.name === "Herold");
}
{
  // Anmelden ohne @ muss an der FORM scheitern, nicht erst an der Suche.
  let wort = null;
  try { await login("manuel", "geheim123"); } catch (e) { wort = e.message; }
  ok("Anmelden ohne E-Mail-Form wird als solches abgewiesen", wort === "invalid-email");
  let wort2 = null;
  try { await login("niemand@example.com", "geheim123"); } catch (e) { wort2 = e.message; }
  ok("eine unbekannte, aber gueltige Adresse meldet 'kein Konto'", wort2 === "not-found");
}

// ── v1.0.5: DAS KONTO FAELLT GANZ ODER GAR NICHT ───────────────────────────
{
  await clearSession();
  const acc = await register("weg@example.com", "geheim123");
  await createSave(acc.id, "Stand A");
  await createSave(acc.id, "Stand B");
  ok("zwei Staende liegen vor der Loeschung vor", (await listSaves(acc.id)).length === 2);
  let wort = null;
  try { await deleteAccount(acc.id, "FALSCH"); } catch (e) { wort = e.message; }
  ok("mit falschem Passwort bleibt alles stehen", wort === "wrong-pass" && (await listSaves(acc.id)).length === 2);
  const r = await deleteAccount(acc.id, "geheim123");
  ok("mit richtigem Passwort meldet die Loeschung ok", r.ok === true);
  ok("die Staende des Kontos sind fort", (await listSaves(acc.id)).length === 0);
  const list = await ensureAccounts();
  ok("das Konto selbst ist aus der Liste", !list.find((a) => a.id === acc.id));
  ok("die Sitzung ist beendet", (await currentAccount()) === null);
  let admin = null;
  const adm = findAccount(list, ADMIN_EMAIL);
  try { await deleteAccount(adm.id, "neues-passwort"); } catch (e) { admin = e.message; }   /* v1.0.40: das Wort steht nicht mehr im Programm */
  ok("das eingebaute admin-Konto ist unloeschbar", admin === "admin-locked" && !!findAccount(await ensureAccounts(), ADMIN_EMAIL));
}

/* ── v1.90.16 (Audit A47): KEINE KOPIEN DES STANDS NACH DER KONTOLOESCHUNG ──
   privacy.html verspricht "alle Spielstaende dieses Kontos auf deinem
   Geraet". Liegen blieben: Wiederherstellungspunkte mit seinem Stand, der
   Spiegel "profile" und die Fernpartien-Liste. Die Sicherung eines ANDEREN
   Kontos bleibt dabei unberuehrt. */
{
  const { takeRestorePoint, listRestorePoints, ohneKonto } = await import("./src/meta/backups.js");
  await clearSession();
  const acc = await register("spur@example.com", "geheim123");
  const st = await createSave(acc.id, "Stand S");
  const prof = { ...defaultProfile(), name: "Spurenleger", online: { id: "on-spur-1", secret: "x" } };
  await writeSave(acc.id, st.id, prof);
  await takeRestorePoint(prof, { force: true, acc: acc.id });
  const fremd = { ...defaultProfile(), name: "Andere", online: { id: "on-fremd-9", secret: "y" } };
  await takeRestorePoint(fremd, { force: true, acc: "konto-fremd" });
  await storage.set("saves:migrated", "1", false);
  await storage.set("profile", JSON.stringify(prof), false);
  const alle = async () => { const r = await storage.get("gambit:restorepoints", false); return r?.value ? JSON.parse(r.value) : []; };
  const vorher = await alle();
  ok("A47: vor der Loeschung liegen beide Sicherungen", vorher.length >= 2 && (await listRestorePoints(acc.id)).length >= 1);
  await deleteAccount(acc.id, "geheim123");
  const nachher = await alle();
  const hat = (id) => nachher.some((e) => { try { return JSON.parse(e.data).online?.id === id; } catch { return false; } });
  ok("A47: die Sicherung des geloeschten Kontos ist fort", !hat("on-spur-1"));
  ok("A47: die Sicherung eines anderen Kontos bleibt", hat("on-fremd-9"));
  ok("A47: der Spiegel 'profile' ist fort", !(await storage.get("profile", false))?.value);
  ok("A47: ohneKonto erkennt auch den unveraenderten Stand ohne Online-Kennung",
    ohneKonto([{ data: "S1" }, { data: "S2" }], { staende: ["S1"] }).length === 1);
}

/* v1.26.8 (Besitzer: "Ich kann mich am Computer nicht als Admin anmelden"):
   ohne https fehlt crypto.subtle, und die Anmeldung scheiterte stumm. Die
   eigene Rechnung muss bitgenau denselben Pruefwert liefern wie der Browser -
   sonst passte kein gespeichertes Passwort mehr. */
{
  const acc = await import("./src/meta/accounts.js");
  const d = new TextEncoder().encode("5fa05adb9883ad2177fdf8b6d3c7cb1a\u0000irgendein-wort");
  const buf = await crypto.subtle.digest("SHA-256", d);
  const echt = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  ok("die eigene SHA-256-Rechnung stimmt bitgenau mit der des Browsers", acc._sha256Hex(d) === echt);
  const merk = globalThis.crypto.subtle;
  Object.defineProperty(globalThis.crypto, "subtle", { value: undefined, configurable: true });
  let h = null; try { h = await acc.hashPass("irgendein-wort", "5fa05adb9883ad2177fdf8b6d3c7cb1a"); } catch { h = "FEHLER"; }
  Object.defineProperty(globalThis.crypto, "subtle", { value: merk, configurable: true });
  ok("ohne crypto.subtle (kein https) rechnet die Anmeldung trotzdem richtig", h === echt);
}

/* v1.26.9 (Besitzer): nur EIN Spielstand, Loeschen nur ueber Profil - und seine
   Google-Adresse ist Admin. */
{
  const { readFileSync } = await import("node:fs");
  /* v1.29.1 (Besitzer): es gibt keinen Spielstandschirm mehr - nach der
     Anmeldung ist man im Spiel, der eine Stand wird geoeffnet oder angelegt. */
  const { existsSync } = await import("node:fs");
  ok("den Spielstandschirm gibt es nicht mehr", !existsSync("src/app/ui/screens/SavesScreen.jsx"));
  const app = readFileSync("src/app/App.jsx", "utf8");
  ok("nach der Anmeldung wird der eine Spielstand geoeffnet oder angelegt",
    app.includes("if (!eintrag) eintrag = await createSave(account.id, null,") && app.includes('dispatch({ type: "HYDRATE", profile: prof })'));
  /* v1.46.0: ein GAST beginnt auf dem eingefrorenen Schaustand.
     v1.90.0: der neue Stand traegt zusaetzlich die an der Anmeldung
     gewaehlte Sprache - vorher ging sie verloren und jeder englische
     Anfaenger stand in einem deutschen Haus. Beides wird geprueft. */
  ok("... und ein Gast auf dem eingefrorenen Schaustand",
    app.includes('account.provider === "guest"') && app.includes("...gastProfil(), lang: anmeldeSprache"));
  ok("... und ein neuer Stand traegt die Sprache der Anmeldung",
    app.includes("...defaultProfile(), lang: anmeldeSprache")
    && app.includes("initialLang={anmeldeSprache}") && app.includes("onLang={setAnmeldeSprache}"));
  {
    const { gastProfil, GAST_STATIONEN, GAST_FIGUREN } = await import("./src/meta/gast.js");
    const { nodeStatus } = await import("./src/meta/campaign.js");
    const { darfReiheStellen } = await import("./src/meta/freigaben.js");
    const g = gastProfil();
    ok("der Gaststand traegt Kapitel I, drei Figuren und kein Erledigtes",
      g.gast === true && g.campaign.league === 1 && g.campaign.cleared.length === 0
      && GAST_FIGUREN.every((f) => g.campaign.unlocked.includes(f)) && GAST_FIGUREN.length === 3);
    ok("er darf die hintere Reihe stellen (sonst kaeme keine der drei Figuren aufs Brett)", darfReiheStellen(g));
    ok("vier Stationen sind seine Grenze", GAST_STATIONEN.length === 4
      && nodeStatus(g, GAST_STATIONEN[0]) === "available"
      && nodeStatus(g, "L01s06") === "locked" && nodeStatus(g, "L01s09") === "locked");
    const app2 = readFileSync("src/app/App.jsx", "utf8");
    /* v1.65.0 (Besitzer 25.9.): das Schnelle Spiel darf der Gast; das Online-
       Duell bleibt sichtbar, aber ausgegraut und ohne Aktion. */
    ok("der Gast sieht das Online-Duell ausgegraut und ohne Aktion, das Schnelle Spiel darf er",
      app2.includes('onGo={profile.gast ? undefined : onOnline}') && app2.includes('"Als Gast nicht nutzbar"')
      && !app2.includes('{!profile.gast && <Card ruhig title={t("hub.quick")}'));
    const log = readFileSync("src/app/ui/screens/LoginScreen.jsx", "utf8");
    ok("der Anmeldeschirm bietet den Gastweg an und sagt, was fehlt",
      log.includes("loginGuest()") && log.includes("Kapitel I, vier Stationen, drei Sonderfiguren"));
  }
  ok("im Profil gibt es keinen Knopf zum Spielstandwechsel", !app.includes("onSwitchSave="));
  ok("der Gast-Hinweis steht jetzt im Profil", readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8").includes('account?.provider === "guest"'));
  const cfg = readFileSync("src/app/config.js", "utf8");
  ok("die Google-Adresse des Besitzers steht in der Admin-Liste", cfg.includes('"frey.manu@gmail.com"'));
  const pf = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");
  ok("der Knopf, der das Loeschen oeffnet, traegt kein Violett mehr", !pf.includes('color: "#b9a4e8" }}>{t("profile.delOpen")}'));
}

/* v1.27.0 (Besitzer): "dass ich meinen Spielernamen anpassen kann". Aenderbar,
   aber eindeutig - kein anderes Konto darf denselben Namen tragen. */
{
  const acc = await import("./src/meta/accounts.js");
  const liste = [{ id: "a1", name: "Manu" }, { id: "a2", name: "Corvin" }];
  ok("zu kurz wird abgelehnt", acc.nameFehler(liste, "x", "a1") === "name-short");
  ok("zu lang wird abgelehnt", acc.nameFehler(liste, "x".repeat(25), "a1") === "name-long");
  ok("ein vergebener Name wird abgelehnt - auch in anderer Schreibweise", acc.nameFehler(liste, "  corVIN ", "a1") === "name-taken");
  ok("der eigene Name darf bleiben", acc.nameFehler(liste, "Manu", "a1") === null);
  ok("ein freier Name geht durch", acc.nameFehler(liste, "Der Graue", "a1") === null);
}

/* v1.27.2: das Profil fragt den SERVER, bevor es einen Namen speichert - und
   speichert nicht, wenn er nicht antwortet (Besitzer: "der Server muss
   pruefen"). */
{
  const { readFileSync } = await import("node:fs");
  const pf2 = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");
  const a = pf2.indexOf("/name-frei?n="), b = pf2.indexOf("renameAccount(account.id");
  ok("das Profil fragt den Server VOR dem Speichern", a > 0 && b > a);
  ok("ohne Antwort des Servers wird nicht gespeichert", pf2.includes('if (!antwort) throw new Error("server-unreachable")'));
  const on = readFileSync("src/app/ui/screens/OnlineScreen.jsx", "utf8");
  ok("einen vom Server angepassten Namen uebernimmt das Geraet", on.includes("m.you?.nameAngepasst"));
}

/* v1.28.1: eine Sicherung bringt die Figuren MIT ihren Faehigkeiten zurueck
   (seit v0.2.0 gingen sie beim Wiederherstellen verloren), und Dauerfeuer ist
   ohne Verlust umgestellt. */
{
  const pm = await import("./src/meta/profile.js");
  const p = pm.defaultProfile(); p.sp = 10;
  p.pieces = { ...p.pieces, levels: { ...(p.pieces.levels || {}), captain: 9, mage: 9, knight: 6 },
    /* v1.29.0: Blinzeln ist beim Springer gestrichen - die Probe nimmt Weitsprung
       (Springer) und Blinzeln beim Magier, der es behaelt */
    abilities: { captain: ["ranged_volley"], mage: ["ranged_shot", "ranged_volley"], knight: ["knight_longleap"] },
    stufen: { mage: { teleport: 2 } }, bossLevels: { b01: 3 } };
  const neu = pm.parseSave(pm.serializeSave(p));
  ok("Wiederherstellen behaelt gelernte Faehigkeiten", JSON.stringify(neu.pieces.abilities.knight) === '["knight_longleap"]');
  ok("... und ihre Stufen und die Monsterstufen", neu.pieces.stufen?.mage?.teleport === 2 && neu.pieces.bossLevels?.b01 === 3);
  ok("der Kapitaen bekommt fuer Dauerfeuer den Scharfschuss", JSON.stringify(neu.pieces.abilities.captain) === '["ranged_shot"]');
  ok("der Magier verliert Dauerfeuer und bekommt die Skillpunkte zurueck",
    JSON.stringify(neu.pieces.abilities.mage) === '["ranged_shot"]' && neu.sp === 14);
  const { CHARACTER_LIST } = await import("./src/content/index.js");
  ok("keine Figur traegt Dauerfeuer mehr im Aufstiegsplan",
    CHARACTER_LIST.every((c) => !c.ladder.some((r) => r.ability === "ranged_volley")));
  const { readFileSync } = await import("node:fs");
  /* v1.90.3: die Zeile in loadSave ist mit Audit A5 umgebaut worden (der
     Fehler wird jetzt gemeldet statt verschluckt) - die Probe haengt sich an
     den Aufruf, nicht mehr an den genauen Wortlaut der alten Zeile. */
  /* v1.90.18 (A40): statt einer Quelltextzeile das VERHALTEN - ein Stand mit
     Dauerfeuer, abgelegt und normal geladen, ist umgestellt. */
  void readFileSync;
  const altStand = await createSave("acc-dauerfeuer", "Alt", p);
  const geladen = await loadSave("acc-dauerfeuer", altStand.id);
  ok("auch das normale Laden stellt Dauerfeuer um", JSON.stringify(geladen.pieces.abilities.captain) === '["ranged_shot"]');
  /* v1.29.0: eine gestrichene Faehigkeit (Blinzeln beim Springer) verschwindet
     samt Stufe, die Punkte kommen ueber denselben Weg zurueck */
  const q = pm.defaultProfile(); q.sp = 10;
  q.pieces = { ...q.pieces, levels: { ...(q.pieces.levels || {}), knight: 9 }, abilities: { knight: ["knight_longleap", "teleport"] }, stufen: { knight: { teleport: 2 } } };
  const q2 = pm.parseSave(pm.serializeSave(q));
  ok("gestrichenes Blinzeln verschwindet beim Springer, Weitsprung bleibt", JSON.stringify(q2.pieces.abilities.knight) === '["knight_longleap"]');
  /* v1.32.0: die Probe erwartete frueher 13 - nur den Lernpreis (Sprosse 6).
     Die Aufstufung auf II (Sprosse 6 + 2 = 8) ging verloren. Jetzt kommt beides. */
  const { abilityCost } = await import("./src/meta/leveling.js");
  ok("... samt seiner Stufe, und die Skillpunkte kommen zurueck - Lernpreis UND Aufstufung",
    !q2.pieces.stufen?.knight?.teleport && q2.sp === 10 + abilityCost(6) + abilityCost(8));

  /* v1.32.0: die MONSTER geben ihre Familiengabe ab. Wer sie gelernt und
     aufgestuft hat, bekommt beides zurueck (Monster: Sprosse 2, Stufe II
     braucht 2 + 1 = 3). Die neuen Faehigkeiten sind danach lernbar. */
  const m = pm.defaultProfile(); m.sp = 5;
  m.pieces = { ...m.pieces, abilities: { "X:b01": ["bulwark"], "X:b07": ["teleport"] }, stufen: { "X:b07": { teleport: 2 } } };
  const m2 = pm.parseSave(pm.serializeSave(m));
  ok("Monster: die alte Familiengabe verschwindet (Waechter: Bollwerk, Geist: Blinzeln)",
    JSON.stringify(m2.pieces.abilities["X:b01"]) === "[]" && JSON.stringify(m2.pieces.abilities["X:b07"]) === "[]");
  ok("... und die Punkte kommen zurueck - Lernpreis, beim Geist auch die Aufstufung",
    m2.sp === 5 + abilityCost(2) + abilityCost(2) + abilityCost(3) && !m2.pieces.stufen?.["X:b07"]?.teleport);
  const m3 = pm.parseSave(pm.serializeSave(m2));
  ok("... und nur einmal - ein zweites Laden erstattet nichts mehr", m3.sp === m2.sp);
}

/* v1.33.2: keine Figur ueber ihrer Hoechststufe - beide Ladewege kappen. */
{
  const pm = await import("./src/meta/profile.js");
  const { GAMBIT_MAX_LEVEL, MAX_PIECE_LEVEL } = await import("./src/meta/leveling.js");
  const a = pm.defaultProfile(); a.sp = 7;
  a.pieces = { ...a.pieces, levels: { ...(a.pieces.levels || {}), gambit: 27, knight: 14, rook: 4, "X:b01": 5 } };
  const b = pm.parseSave(pm.serializeSave(a));
  ok("Altstand: Gambit 27 wird auf " + GAMBIT_MAX_LEVEL + " gekappt, Springer 14 auf " + MAX_PIECE_LEVEL,
    b.pieces.levels.gambit === GAMBIT_MAX_LEVEL && b.pieces.levels.knight === MAX_PIECE_LEVEL);
  ok("... der Rest bleibt, wie er war (Turm 4, Monster 5), und es wird nichts erstattet",
    b.pieces.levels.rook === 4 && b.pieces.levels["X:b01"] === 5 && b.sp === 7);
  const c = pm.ohneDauerfeuer({ pieces: { levels: { gambit: 23 } } });
  ok("... auch der Weg aus dem Speicher (ohneDauerfeuer), selbst ohne gespeicherte Faehigkeiten", c.pieces.levels.gambit === GAMBIT_MAX_LEVEL);
  ok("... und ein zweites Laden aendert nichts mehr", JSON.stringify(pm.parseSave(pm.serializeSave(b)).pieces.levels) === JSON.stringify(b.pieces.levels));
}

/* v1.90.2 (Besitzerentscheid S14): DER AUTOMATISCHE ABSTURZBERICHT IST
   ABSCHALTBAR. Geprueft wird das Verhalten, nicht der Quelltext: mit einem
   Speicher-Ersatz aus/an schalten und sehen, was zurueckkommt. */
{
  const speicher = new Map();
  globalThis.localStorage = {
    getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
    setItem: (k, v) => speicher.set(k, String(v)),
    removeItem: (k) => speicher.delete(k),
  };
  const r = await import("./src/meta/reports.js");
  ok("Absturzberichte sind ab Werk an", r.absturzBerichteAn() === true);
  r.setzeAbsturzBerichte(false);
  ok("... und lassen sich abschalten", r.absturzBerichteAn() === false);
  const abgelegt = await r.fileReport({ err: new Error("Probe") });
  ok("... ein Absturz bleibt dann auf dem Geraet", abgelegt.where === "local");
  ok("... und steht trotzdem im oertlichen Spiegel", JSON.parse(speicher.get("gg_reports_local") || "[]").length === 1);
  r.setzeAbsturzBerichte(true);
  ok("... wieder einschalten geht auch", r.absturzBerichteAn() === true);
  delete globalThis.localStorage;
}

/* v1.90.3 (Audit A5): FEHLT DER BLOB, MUSS ES AUFFALLEN. Vorher verschluckte
   ein leeres catch beides - fehlender und kaputter Stand ergaben stumm null,
   und die App blieb weiss. Jetzt meldet loadSave es auf der Konsole, und die
   App zeigt eine Karte mit zwei Wegen (App.jsx, ladeFehler). */
{
  const { storage: st4 } = await import("./src/platform/index.js");
  const sv = await import("./src/meta/saves.js");
  const meldungen = [];
  const alterFehler = console.error;
  console.error = (...a) => meldungen.push(a.map(String).join(" "));
  const leer = await sv.loadSave("kontoX", "slotX");            // gibt es nicht
  await st4.set("save:kontoY:slotY", "{kein json", false);
  const kaputt = await sv.loadSave("kontoY", "slotY");
  console.error = alterFehler;
  ok("ein fehlender Spielstand liefert null", leer === null);
  ok("... und meldet sich auf der Konsole", meldungen.some((m) => /fehlt im Speicher/.test(m)));
  ok("ein unlesbarer Spielstand liefert null", kaputt === null);
  ok("... und nennt den Grund", meldungen.some((m) => /unlesbar/.test(m)));
  const app = (await import("node:fs")).readFileSync("src/app/App.jsx", "utf8");
  ok("... und die App zeigt statt eines weissen Schirms eine Karte",
    app.includes("if (!prof) { setLadeFehler(eintrag); return; }") && app.includes("if (ladeFehler) {"));
  await st4.delete("save:kontoY:slotY", false);
}

/* ── v1.90.4 (Audit A51): EIN VERSCHLUCKTER SCHREIBFEHLER LUEGT ────────
   storage.set faengt QuotaExceeded ab und liefert null. writeSave sah das
   Ergebnis nie an: der Index bekam sein neues updatedAt, der Blob blieb alt -
   beim naechsten Start fehlte Fortschritt, ohne einen Hinweis. Geprueft wird
   mit einem Speicher, der den BLOB verweigert und den Index durchlaesst. */
{
  const kontoA51 = await mkAccount("a51@test.de", "wort1234");
  const e = await createSave(kontoA51.id, "A51", { ...defaultProfile(), gold: 10 });
  const echt = storage.set.bind(storage);
  let indexGeschrieben = false;
  storage.set = async (k, v, sh) => {
    if (/(^|:)save:[^:]+:[^:]+$/.test(k)) return null;      // der Blob scheitert
    if (/saves:index/.test(k)) indexGeschrieben = true;
    return echt(k, v, sh);
  };
  const r = await writeSave(kontoA51.id, e.id, { ...defaultProfile(), gold: 999 });
  storage.set = echt;
  ok("A51: ein gescheiterter Schreibvorgang meldet null statt Erfolg", r === null);
  ok("A51: und der Index behauptet keinen Fortschritt, den der Stand nicht hat", indexGeschrieben === false);
  const nachher = await loadSave(kontoA51.id, e.id);
  ok("A51: der alte Stand ist unveraendert erhalten", nachher && nachher.gold === 10);
}

/* ── v1.90.4 (Audit A51, Gegenprobe) ─────────────────────────── */
{
  const konto = await mkAccount("a51b@test.de", "wort1234");
  const e = await createSave(konto.id, "A51b", { ...defaultProfile(), gold: 10 });
  const r = await writeSave(konto.id, e.id, { ...defaultProfile(), gold: 42 });
  ok("A51: der normale Schreibvorgang liefert weiterhin den Listeneintrag", !!r && r.id === e.id);
  ok("A51: und der Stand traegt den neuen Wert", (await loadSave(konto.id, e.id)).gold === 42);
}

/* ── v1.90.4 (Audit A53): EIN PIN, DER NICHT PRUEFBAR IST, IST NICHT FALSCH
   Ein starker Datensatz entsteht nur mit crypto.subtle - also unter https.
   Wird dasselbe Spiel danach ueber http, im LAN oder als Einzeldatei
   geoeffnet, fehlt subtle. Bis v1.90.3 lieferte verifyPin dann stumm false:
   JEDE richtige PIN galt als falsch, der Riegel ging nie wieder auf.
   Geprueft wird mit abgeschaltetem crypto.subtle. */
const ohneSubtle = (() => {
  const urspr = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const echt = globalThis.crypto;
  return {
    an: () => Object.defineProperty(globalThis, "crypto",
      { value: { getRandomValues: (a) => echt.getRandomValues(a) }, configurable: true, writable: true }),
    aus: () => Object.defineProperty(globalThis, "crypto", urspr),
  };
})();
{
  const satz = await hashPin("1234");
  ok("A53: unter https entsteht ein STARKER Datensatz", !satz.weak);
  ok("A53: und die richtige PIN oeffnet ihn", (await verifyPin("1234", satz)) === true);
  ok("A53: eine falsche bleibt falsch", (await verifyPin("9999", satz)) === false);
  /* dieselbe Umgebung wie eine Einzeldatei auf manchen Telefonen:
     getRandomValues ja, subtle nein. In Node 22 ist globalThis.crypto
     schreibgeschuetzt, darum ueber den Eigenschafts-Beschreiber. */
  ohneSubtle.an();
  let grund = null, ergebnis = null;
  try { ergebnis = await verifyPin("1234", satz); } catch (e) { grund = e.grund; }
  ohneSubtle.aus();
  ok("A53: ohne subtle gibt es kein stummes 'falsch' mehr", ergebnis === null);
  ok("A53: sondern einen erkennbaren Grund", grund === "keinSubtle");
  ok("A53: und danach greift die Pruefung wieder ganz normal", (await verifyPin("1234", satz)) === true);
}
{
  /* Der SCHWACHE Datensatz (ohne subtle angelegt) bleibt ueberall pruefbar -
     sonst haette der neue Riegel den Rueckfall mit erschlagen. */
  ohneSubtle.an();
  const schwach = await hashPin("1234");
  const auf = await verifyPin("1234", schwach);
  const zu = await verifyPin("4321", schwach);
  ohneSubtle.aus();
  ok("A53: ohne subtle entsteht der als schwach GEKENNZEICHNETE Datensatz", schwach.weak === true);
  ok("A53: der bleibt pruefbar - richtig auf, falsch zu", auf === true && zu === false);
  ok("A53: und auch mit subtle laesst er sich weiterhin oeffnen", (await verifyPin("1234", schwach)) === true);
}

/* ── v1.90.7 (Audit A18): EINE KAPUTTE KONTENLISTE WIRD NICHT NEU GESAET ──
   readList lieferte fuer "leer" und fuer "unlesbar" dasselbe null, und
   ensureAccounts hat daraufhin eine frische Liste mit nur dem Admin
   geschrieben - der kaputte Wert war damit UEBERSCHRIEBEN und alle
   oertlichen Konten endgueltig fort. Der Spieler las "Kein Konto mit dieser
   E-Mail". Geprueft mit einem echten kaputten Wert im Speicher. */
{
  const vorherige = await ensureAccounts();
  ok("A18: vor dem Eingriff gibt es Konten", vorherige.length > 0);
  await storage.set("accounts:v1", "{kaputt", false);
  let gefangen = null;
  try { await ensureAccounts(); } catch (e) { gefangen = e; }
  ok("A18: die kaputte Liste wird gemeldet statt verschluckt", !!gefangen && gefangen.kaputt === true);
  const nachher = (await storage.get("accounts:v1", false))?.value;
  ok("A18: und NICHT ueberschrieben - der Rohwert steht noch da", nachher === "{kaputt");
  ok("A18: er liegt zusaetzlich unter einem Zeitstempel zum Retten",
    !!gefangen.gesichertUnter && /^accounts:v1:kaputt:\d+$/.test(gefangen.gesichertUnter)
    && (await storage.get(gefangen.gesichertUnter, false))?.value === "{kaputt");
  /* Eine Liste, die gar keine ist, zaehlt auch als kaputt. */
  await storage.set("accounts:v1", '{"a":1}', false);
  let zweiter = null;
  try { await ensureAccounts(); } catch (e) { zweiter = e; }
  ok("A18: auch gueltiges JSON, das keine Liste ist, gilt als kaputt", !!zweiter && zweiter.kaputt === true);
  /* Aufraeumen: die echte Liste zurueck, sonst stolpern spaetere Proben. */
  await storage.set("accounts:v1", JSON.stringify(vorherige), false);
  const wieder = await ensureAccounts();
  ok("A18: mit heiler Liste laeuft alles weiter wie zuvor", wieder.length === vorherige.length);
  /* Und der LEERE Speicher saet weiterhin - das war nie der Fehler. */
  await storage.delete("accounts:v1", false);
  const frisch = await ensureAccounts();
  ok("A18: ein LEERER Speicher saet weiterhin den Admin", frisch.length === 1 && frisch[0].isAdmin);
  await storage.set("accounts:v1", JSON.stringify(vorherige), false);
}

/* ── v1.90.11 (Audit A17): ZWEI FENSTER, EIN SPIELSTAND ────────────────
   Bis v1.90.10 las `writeSave` den Index, tauschte die eigene Zeile aus und
   schrieb blind zurueck. Das aeltere Fenster ueberschrieb damit alles, was
   das juengere seither erspielt hatte - lautlos, alle 30 Sekunden.

   GEGENGEPRUEFT: gegen v1.90.10 bricht dieser Block schon beim IMPORT ab,
   `merkeStand` gab es nicht. Und ohne den Riegel liefert der zweite Schreib-
   vorgang den Eintrag statt `{fremd:true}`, und `gold` steht danach auf dem
   ALTEN Wert - genau der Verlust, um den es geht.

   Zwei Fenster werden hier so gespielt, wie es der Speicher sieht: dieselbe
   Kontokennung, derselbe Stand, aber ein Merker, der nach dem Oeffnen nicht
   mehr nachgezogen wird (`vergissStand` = "dieses Fenster hat gerade erst
   geoeffnet und weiss vom anderen nichts"). */
{
  const konto = await mkAccount("a17@test.de", "wort1234");
  const e = await createSave(konto.id, "A17", { ...defaultProfile(), gold: 10 });

  /* Fenster A oeffnet den Stand - und setzt seinen Merker darauf. */
  merkeStand(konto.id, e);
  const nachA = await writeSave(konto.id, e.id, { ...defaultProfile(), gold: 100 });
  ok("A17: das erste Fenster schreibt ganz normal", !!nachA && nachA.id === e.id);

  /* Fenster B hat denselben Stand geoeffnet, BEVOR A schrieb: sein Merker
     steht noch auf dem alten updatedAt. So sieht das zweite Fenster aus. */
  const alt = (await listSaves(konto.id)).find((x) => x.id === e.id);
  merkeStand(konto.id, { id: e.id, updatedAt: (alt.updatedAt || 0) - 1000 });
  const nachB = await writeSave(konto.id, e.id, { ...defaultProfile(), gold: 7 });
  ok("A17: das zweite Fenster schreibt NICHT, sondern meldet den fremden Stand",
    !!nachB && nachB.fremd === true && !nachB.id);
  ok("A17: und der juengere Fortschritt steht unveraendert im Speicher",
    (await loadSave(konto.id, e.id)).gold === 100);
  ok("A17: die Meldung traegt den fremden Eintrag mit, damit die App ihn zeigen kann",
    !!nachB.eintrag && nachB.eintrag.id === e.id);

  /* Nach dem Neuladen setzt B auf dem echten Stand auf und darf wieder. */
  const jetzt = (await listSaves(konto.id)).find((x) => x.id === e.id);
  merkeStand(konto.id, jetzt);
  const nachC = await writeSave(konto.id, e.id, { ...defaultProfile(), gold: 250 });
  ok("A17: wer neu aufsetzt, schreibt wieder", !!nachC && nachC.id === e.id
    && (await loadSave(konto.id, e.id)).gold === 250);

  /* Der GAST-Teilfall: das andere Fenster hat den Stand geloescht. Bisher kam
     dasselbe `null` wie bei einem Speicherfehler zurueck, und App.jsx
     verschluckte es - das Fenster sicherte ab da still gar nichts mehr. */
  await deleteSave(konto.id, e.id);
  const nachWeg = await writeSave(konto.id, e.id, { ...defaultProfile(), gold: 1 });
  ok("A17: ein geloeschter Stand meldet sich als 'weg', nicht als stilles null",
    !!nachWeg && nachWeg.weg === true);

  /* Ohne Merker - etwa in einer Probe, die direkt schreibt - gilt der erste
     Schreibvorgang als Uebernahme. Sonst waeren alle aelteren Proben rot. */
  const e2 = await createSave(konto.id, "A17b", { ...defaultProfile(), gold: 5 });
  vergissStand(konto.id, e2.id);
  const ohne = await writeSave(konto.id, e2.id, { ...defaultProfile(), gold: 55 });
  ok("A17: ohne Merker gilt der erste Schreibvorgang als Uebernahme",
    !!ohne && ohne.id === e2.id && (await loadSave(konto.id, e2.id)).gold === 55);

  /* Und die App verschluckt die beiden Meldungen nicht mehr. */
  const app = await import("node:fs").then((fs) => fs.readFileSync("src/app/App.jsx", "utf8"));
  ok("A17: App.jsx merkt sich beim Oeffnen, auf welchem Stand es aufsetzt",
    app.includes("merkeStand(account.id, eintrag)"));
  ok("A17: und wertet das Ergebnis jeder Sicherung aus, statt es zu verwerfen",
    app.includes("const nachSicherung = (e) =>") && app.includes("setFremdesFenster(e.weg ? \"weg\" : \"fremd\")")
    && !app.includes("writeSave(account.id, slot.id, profile, add).then((e) => e &&"));
  ok("A17: es gibt eine Karte, die es dem Spieler sagt",
    app.includes("if (fremdesFenster) {") && /anderen Fenster gespielt/.test(app));
}

/* ── v1.90.11 (Audit A19): DAS GEFECHT UEBERLEBT DAS ENTLADEN ──────────
   Bis v1.90.10 lag ein laufendes Gefecht nur im React-Zustand. `pauseNow`
   schickte PAUSE_MATCH los; geschrieben wurde erst im Persist-Effekt NACH
   dem naechsten Commit - und den gibt es beim Entladen der Seite nicht mehr.
   Jeder Push auf main schiebt binnen Minuten einen frischen Dienstarbeiter
   nach, der sofort neu lud: Bosskampf weg, auf jedem offenen Geraet.

   Hier wird der eine Weg geprueft, der ohne `await` auskommt, und die drei
   Stellen, die ihn benutzen bzw. das Neuladen aufschieben.
   GEGENGEPRUEFT: gegen v1.90.10 gibt es `sichereStandSofort` nicht - der
   Block bricht beim Import ab; und alle Quelltext-Pruefungen sind rot. */
{
  const konto = await mkAccount("a19@test.de", "wort1234");
  const e = await createSave(konto.id, "A19", { ...defaultProfile(), gold: 10 });
  merkeStand(konto.id, e);

  /* Der entscheidende Punkt: KEIN await davor. Was vor dem ersten await
     passiert, passiert noch im pagehide-Handler selbst. */
  const laufend = { ...defaultProfile(), gold: 10, pausedMatch: { v: 1, nodeId: "L02s03", enc: "XYZ" } };
  const r = sichereStandSofort(konto.id, e.id, laufend);
  ok("A19: die Sofortsicherung meldet Erfolg", r === true);
  const roh = (await storage.get(`save:${konto.id}:${e.id}`, false))?.value;
  ok("A19: und der Stand steht SCHON im Speicher, ohne dass jemand gewartet hat",
    !!roh && JSON.parse(roh).pausedMatch?.nodeId === "L02s03");
  ok("A19: er ist ueber den normalen Weg wieder lesbar",
    (await loadSave(konto.id, e.id))?.pausedMatch?.enc === "XYZ");
  ok("A19: ohne Konto, Stand oder Profil passiert gar nichts",
    sichereStandSofort(null, e.id, laufend) === false
    && sichereStandSofort(konto.id, null, laufend) === false
    && sichereStandSofort(konto.id, e.id, null) === false);
  /* Und sie stoert den Zwei-Fenster-Riegel aus A17 nicht: der Index blieb
     unberuehrt, also darf das normale Schreiben danach weiterlaufen. */
  const danach = await writeSave(konto.id, e.id, { ...laufend, gold: 44 });
  ok("A19: der normale Schreibweg laeuft danach weiter (A17-Riegel bleibt zu)",
    !!danach && danach.id === e.id);

  const fs = await import("node:fs");
  const gs = fs.readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  const app = fs.readFileSync("src/app/App.jsx", "utf8");
  const main = fs.readFileSync("src/app/main.jsx", "utf8");

  ok("A19: pauseNow reicht den Pausenstand sofort nach draussen",
    /dispatch\(\{ type: "PAUSE_MATCH", data \}\);/.test(gs) && gs.includes("if (onGefechtSichern) onGefechtSichern(data);"));
  ok("A19: und haengt auch an pagehide, nicht nur an visibilitychange",
    gs.includes('window.addEventListener("pagehide", weg)') && gs.includes('window.removeEventListener("pagehide", weg)'));
  ok("A19: App.jsx schreibt den Pausenstand ohne Umweg ueber den Persist-Effekt",
    app.includes("const sichereGefecht = (pausedMatch) =>") && app.includes("sichereStandSofort(account.id, slot.id,"));
  ok("A19: und reicht ihn an JEDEN GameScreen durch",
    (app.match(/onGefechtSichern=\{sichereGefecht\}/g) || []).length === (app.match(/<GameScreen /g) || []).length);
  ok("A19: GameScreen setzt die Gefecht-Fahne, solange kein Ergebnis steht",
    gs.includes('document.documentElement.dataset.imGefecht = "1"')
    && gs.includes("delete document.documentElement.dataset.imGefecht"));
  ok("A19: main.jsx laedt nicht neu, solange die Fahne steht",
    main.includes("function ladeNeu(fn)") && main.includes("ladeNeu(() => window.location.reload())")
    && !/controllerchange", \(\) => \{\n    if \(reloaded\) return; reloaded = true; window\.location\.reload\(\);/.test(main));
  ok("A19: und holt das Neuladen nach, sobald sie faellt",
    main.includes('attributeFilter: ["data-im-gefecht"]') && main.includes("if (nachholen && !imGefecht())"));
  ok("A19: auch der Umweg ueber unregister wartet das Gefecht ab",
    main.includes("r.unregister().then(() => ladeNeu(() => window.location.reload()))"));
  ok("A19: und die Absturzkarte behauptet nicht mehr, der Spielstand sei sicher",
    !main.includes("Dein Spielstand ist sicher") && main.includes("bis zur letzten Sicherung erhalten"));
}

/* ── v1.90.18 (Audit A48): WIEDERHERSTELLUNGSPUNKTE JE KONTO ──────────────────
   Vorher: EINE Liste fuer alle Konten des Geraets, inklusive Gast. Der Admin
   sah fremde Staende, und die sechs juengsten Plaetze teilten sich alle. */
{
  const { mitSicherung, eintraegeVon, takeRestorePoint, listRestorePoints } = await import("./src/meta/backups.js");
  const pA = { ...defaultProfile(), name: "A" }, pB = { ...defaultProfile(), name: "B" };
  let l = [];
  for (let k = 0; k < 9; k++) l = mitSicherung(l, pA, "konto-a", 1e12 + k * 7e5, true);
  l = mitSicherung(l, pB, "konto-b", 1e12 + 99e5, true);
  for (let k = 0; k < 9; k++) l = mitSicherung(l, pA, "konto-a", 1e12 + 1e7 + k * 7e5, true);
  ok("A48: ein fleissiges Konto schiebt die Sicherung eines anderen nicht hinaus", eintraegeVon(l, "konto-b").length === 1);
  ok("A48: jedes Konto sieht nur seine eigenen", eintraegeVon(l, "konto-a").every((e) => JSON.parse(e.data).name === "A"));
  ok("A48: der Gast sichert nicht", (await takeRestorePoint({ ...defaultProfile(), gast: true }, { force: true, acc: "gast-1" })) === null
    && (await listRestorePoints("gast-1")).length === 0);
  ok("A48: ohne Konto keine Liste", (await listRestorePoints()).length === 0);
}

/* ── v1.90.18 (Audit A49): PBKDF2 FUER LOKALE PASSWOERTER ────────────────────── */
{
  const am = await import("./src/meta/accounts.js");
  const { storage: sp } = await import("./src/platform/index.js");
  await am.clearSession();
  const neu = await am.register("stark@example.com", "geheim123");
  ok("A49: ein neues Konto bekommt einen PBKDF2-Pruefwert", am.istStarkerPruefwert(neu.passHash));
  let rein = false; try { await am.login("stark@example.com", "geheim123"); rein = true; } catch {}
  let falsch = false; try { await am.login("stark@example.com", "geheim124"); } catch (e) { falsch = e.message === "wrong-pass"; }
  ok("A49: das richtige Wort oeffnet, ein falsches nicht", rein && falsch);
  /* ein Bestandskonto mit altem SHA-256-Wert */
  const liste = JSON.parse((await sp.get("accounts:v1", false))?.value || "[]");
  const alt = liste.find((a) => a.email === "stark@example.com");
  alt.passHash = await am.hashPass("geheim123", alt.salt);
  await sp.set("accounts:v1", JSON.stringify(liste), false);
  await am.login("stark@example.com", "geheim123");
  const nachher = JSON.parse((await sp.get("accounts:v1", false))?.value || "[]").find((a) => a.email === "stark@example.com");
  ok("A49: ein alter Pruefwert oeffnet weiter und wird beim Anmelden still umgeschrieben", am.istStarkerPruefwert(nachher.passHash));
}

/* ── v1.90.18 (Audit A54): DER GEWAEHLTE STAND WIRD GEOEFFNET ────────────────── */
{
  const { standZumOeffnen, listSaves: ls, createSave: cs } = await import("./src/meta/saves.js");
  await cs("acc-zwei", "Erste Karriere"); await new Promise((r) => setTimeout(r, 5));
  const zweite = await cs("acc-zwei", "Zweite Karriere");
  const liste = await ls("acc-zwei");
  const erste = liste.find((s) => s.name === "Erste Karriere");
  ok("A54: ohne Wahl oeffnet der juengste", standZumOeffnen(liste, null).id === zweite.id);
  ok("A54: mit Wahl der gewaehlte - auch wenn er aelter ist", standZumOeffnen(liste, erste.id).id === erste.id);
  ok("A54: eine Wahl, die es nicht mehr gibt, faellt auf den juengsten zurueck", standZumOeffnen(liste, "weg").id === zweite.id);
}

/* ── v1.90.18 (Audit A40): DIE MIGRATION AUF JEDEM LADEWEG ───────────────────
   Gemessen vor dem Umbau: parseSave (Sicherungsdatei zurueckspielen) baute
   `campaign` aus vier Feldern neu - bribedBosses, bossWins, tolls, faced und
   besetzung waren danach fort, und von den Aufstellungen nur "classic" uebrig
   ("classic#chess" weg). Jetzt: nichts faellt weg, die Migration ist
   idempotent, und normales Laden wie die Altstand-Uebernahme laufen durch sie. */
{
  const M = await import("./src/meta/index.js");
  const p = M.withProgressPct(M.defaultProfile(), 50, 5);
  p.campaign = { ...p.campaign, bribedBosses: ["b02"], bossWins: { L05s16: 1 }, tolls: ["L05s09"], faced: ["b02"], besetzung: { L05s01: ["boss:b02"] } };
  const reihe = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
  p.loadout = { ...p.loadout, formations: { classic: reihe, "classic#chess": reihe } };
  const r = M.parseSave(M.serializeSave(p));
  ok("A40: eine Sicherungsdatei behaelt jedes Kampagnenfeld (gekaufte Monster, Maut, Siege, Besetzung)",
    ["bribedBosses", "bossWins", "tolls", "faced", "besetzung"].every((k) => JSON.stringify(r.campaign[k]) === JSON.stringify(p.campaign[k])));
  ok("A40: ... und den Schach-Plan (classic#chess)", Array.isArray(r.loadout.formations["classic#chess"]));
  const einmal = M.migrateProfile(p), zweimal = M.migrateProfile(einmal);
  ok("A40: die Migration ist idempotent", JSON.stringify(einmal) === JSON.stringify(zweimal));
  /* v1.90.20: DER NEUE MEISTER VON KAPITEL I. Ein Stand von VOR dieser Fassung,
     der Kapitel I schon gewonnen hatte, besass den Richter (Trophaee I) und
     fuehrte ihn vielleicht auf dem Damenplatz. Er behaelt ihn (als bestochenen
     Grossmeister) und bekommt den Drachen - einmalig (meister20). Ein Stand,
     der Kapitel I noch nicht gewann, bekommt nichts geschenkt. */
  {
    const alt = { stats: { leaguesWon: 2 }, campaign: { league: 3, unlocked: ["mage"] },
      loadout: { formations: { classic: ["rook", "knight", "bishop", "boss:b12", "king", "bishop", "knight", "rook"] } } };
    const neu = M.migrateProfile(alt);
    ok("v1.90.20: ein alter Stand nach Kapitel I behaelt den Richter und bekommt den Drachen",
      M.ownedLeagueBosses(neu).includes("b12") && neu.campaign.unlocked.includes("dragon") && neu.campaign.meister20 === true);
    /* v1.91.0: der Richter ist eine Bestie und darf nur noch auf freie Plaetze -
       auf dem Damenplatz steht nach dem Umbau wieder die Dame, die Aufstellung
       bleibt dadurch gueltig statt auf die Grundstellung zu fallen */
    ok("v1.91.0: ... seine Aufstellung bleibt gueltig - auf dem Damenplatz steht wieder die Dame",
      neu.loadout.formations.classic[3] === "queen" && M.formationLegalOn(neu.loadout.formations.classic, M.unlockedCharacterIds(neu), (await import("./src/content/index.js")).mapById("classic"), M.ownedLeagueBosses(neu)));
    const zweit = M.migrateProfile(neu);
    ok("v1.90.20: der Umzug laeuft nur einmal", JSON.stringify(zweit.campaign.bribedBosses) === JSON.stringify(neu.campaign.bribedBosses));
    const frueh = M.migrateProfile({ stats: { leaguesWon: 0 }, campaign: { league: 1, unlocked: [] } });
    ok("v1.90.20: wer Kapitel I noch nicht gewann, bekommt nichts geschenkt",
      !frueh.campaign.unlocked.includes("dragon") && !(frueh.campaign.bribedBosses || []).includes("b12"));
    const spaeter = M.migrateProfile({ ...frueh, stats: { leaguesWon: 1 } });
    ok("v1.90.20: ... und ein spaeterer Sieg laeuft ueber die neuen Regeln (kein Richter)",
      !(spaeter.campaign.bribedBosses || []).includes("b12"));
  }
  /* ein v1-Stand (vor den Konten): Zahl statt Liste in cleared, charXp */
  const v1 = { gold: 5, xp: 600, charXp: { knight: 200 }, campaign: { league: 1, cleared: 2 } };
  const s1 = await createSave("acc-v1", "v1", v1);
  const g1 = await loadSave("acc-v1", s1.id);
  ok("A40: das normale Laden bringt einen v1-Stand auf den heutigen Plan", g1.v === 2 && Array.isArray(g1.campaign.cleared)
    && g1.campaign.unlocked.includes("knight") && g1.pieces.levels.knight > 1 && g1.sp === 10);
}


/* ── v1.91.0: DER FIGUREN-UMBAU ZIEHT ALTE STAENDE NACH (figuren91) ──────────── */
{
  const M = await import("./src/meta/index.js");
  const { mapById } = await import("./src/content/index.js");
  const alt = { name: "alt", gold: 100, sp: 5, stats: { leaguesWon: 4 },
    pieces: { levels: { standard: 6 }, abilities: { standard: ["bulwark"], "X:b10": ["wegelagerei", "blenden"], "X:b19": ["gibtesnicht"] },
      stufen: { "X:b10": { blenden: 2 } }, bossLevels: { b10: 3 } },
    loadout: { formations: { classic: ["rook", "standard", "bishop", "boss:b10", "king", "bishop", "knight", "rook"] },
      decks: { classic: { aktiv: 0, liste: [{ formation: ["rook", "standard", "bishop", "boss:b19", "king", "bishop", "knight", "rook"], name: "A" }, null, null] } } },
    campaign: { league: 5, cleared: ["L05s00", "L05s04"], unlocked: ["standard", "mage", "dragon"], dupes: { standard: 1 },
      bribedBosses: ["b10", "b02"], meister20: true, bossWins: { standard: 1 } },
    pausedMatch: { v: 1, nodeId: "L05s01" } };
  const neu = M.migrateProfile(alt);
  const un = neu.campaign.unlocked;
  ok("figuren91: der Flaggentraeger wird der Nachtwaechter - Besitz, Stufe, Sterne, Siege, Gelerntes",
    un.includes("watchman") && !un.includes("standard") && neu.pieces.levels.watchman === 6 && neu.campaign.dupes.watchman === 1
    && neu.campaign.bossWins.watchman === 1 && neu.pieces.abilities.watchman.join() === "bulwark" && !("standard" in neu.pieces.levels));
  ok("figuren91: der Doppelritter kommt zurueck - 1800 Gold, Raenge (5+7) und Gelerntes (2 + 2+3) als Punkte",
    neu.gold === 1900 && neu.sp === 5 + 12 + 2 + 5 + 2 && !(neu.campaign.bribedBosses || []).includes("b10") && !("b10" in (neu.pieces.bossLevels || {})));
  ok("figuren91: wer Kapitel IV gewann, behaelt den alten Meister als Bestie (b19) und bekommt die vier neuen Grossmeister",
    M.ownedLeagueBosses(neu).join() === "b26,b27,b24,b28,b02,b19");
  ok("figuren91: Gelerntes, das nicht mehr auf der Leiter steht, ist fort (und erstattet)", (neu.pieces.abilities["X:b19"] || []).length === 0);
  ok("figuren91: die Aufstellung - Nachtwaechter statt Flaggentraeger, Dame statt Doppelritter",
    neu.loadout.formations.classic.join() === "rook,watchman,bishop,queen,king,bishop,knight,rook");
  ok("figuren91: ... auch in den Faechern; eine Bestie auf dem Damenplatz weicht der Dame",
    neu.loadout.decks.classic.liste[0].formation.join() === "rook,watchman,bishop,queen,king,bishop,knight,rook" && neu.loadout.decks.classic.liste[0].name === "A");
  ok("figuren91: ... und sie ist gueltig",
    M.formationLegalOn(neu.loadout.formations.classic, M.unlockedCharacterIds(neu), mapById("classic"), M.ownedLeagueBosses(neu)));
  ok("figuren91: die Figuren der Kapitel hinter dem Spieler kommen nach (I-IV ganz, V nur Geklaertes)",
    ["farmwife", "beggar", "banker", "healer", "huntress", "fencer", "gladiator"].every((id) => un.includes(id))
    && un.includes("jailer") && !un.includes("executioner") && !un.includes("samurai"));
  ok("figuren91: ein pausiertes Gefecht faellt weg, das Merkzeichen steht", neu.pausedMatch === null && neu.campaign.figuren91 === true);
  ok("figuren91: einmalig - ein zweiter Lauf aendert nichts", JSON.stringify(M.migrateProfile(neu)) === JSON.stringify(neu));
  const frisch = M.migrateProfile({ name: "neu" });
  ok("figuren91: ein frischer Stand bekommt nichts geschenkt", frisch.campaign.unlocked.length === 0 && frisch.gold === 0 && frisch.campaign.figuren91 === true);
  ok("figuren91: neue Staende und der Regler tragen das Merkzeichen von Anfang an",
    M.defaultProfile().campaign.figuren91 === true && M.withProgressPct(M.defaultProfile(), 50, 3).campaign.figuren91 === true);
  /* Schutz: eine Aufstellung mit Kennungen, die es nicht mehr gibt, baut trotzdem ein Heer */
  const heer = M.buildArmyFromFormation(() => 1, ["rook", "standard", "bishop", "boss:b10", "king", "bishop", "knight", "rook"]);
  ok("figuren91: unbekannte Kennungen stuerzen den Heeresbau nicht (Springer und Dame stehen ein)",
    heer.back[1].kind === "N" && heer.back[3].kind === "Q");
}

/* ── v1.94.0: DIE NEUEN LEITERN ZIEHEN GELERNTES NACH (kunst94) ───────────────── */
{
  const M = await import("./src/meta/index.js");
  const { faehigkeitenUmbau } = await import("./src/meta/profile.js");
  const alt = { name: "alt", gold: 0, sp: 1,
    pieces: { levels: { farmwife: 6, hawk: 3, beggar: 9, knight: 6 },
      abilities: { farmwife: ["regen", "bulwark"], hawk: ["teleport", "ranged_shot"], beggar: ["regen", "bulwark", "teleport"], knight: ["knight_longleap"], "X:b02": ["gift"] },
      stufen: { farmwife: { bulwark: 2, regen: 2 }, hawk: { ranged_shot: 3 } } },
    campaign: { league: 3, cleared: [], unlocked: ["farmwife", "hawk", "beggar"], dupes: {}, meister20: true, figuren91: true } };
  const neu = faehigkeitenUmbau(alt), ab = neu.pieces.abilities, st = neu.pieces.stufen;
  ok("kunst94: was nicht mehr auf der Leiter steht, ist verlernt (Bollwerk der Baeuerin, Schuss des Spaehers) - der Rest bleibt",
    ab.farmwife.join() === "regen" && !("hawk" in ab) && ab.beggar.join() === "regen,bulwark,teleport" && ab.knight.join() === "knight_longleap" && ab["X:b02"].join() === "gift");
  ok("kunst94: was jetzt eine hoehere Stufe verlangt, als die Figur hat, ebenso (Blinzeln des Spaehers: Stufe 5, er hat 3)", !("hawk" in ab));
  ok("kunst94: erstattet 2 je Faehigkeit und 3 je weiterer Stufe - Bollwerk II (5) + Blinzeln (2) + Schuss III (8) = 15 Punkte",
    neu.sp === 1 + 5 + 2 + 8, `sp ${neu.sp}`);
  ok("kunst94: die Stufen des Verlernten sind fort, die des Behaltenen bleiben", st.farmwife.regen === 2 && !("bulwark" in st.farmwife) && !("hawk" in st));
  ok("kunst94: einmalig - der zweite Lauf aendert nichts, und ein neuer Stand traegt das Merkzeichen",
    faehigkeitenUmbau(neu) === neu && neu.campaign.kunst94 === true && defaultProfile().campaign.kunst94 === true);
  ok("kunst94: laeuft auf dem normalen Ladeweg (migrateProfile)", M.migrateProfile(alt).campaign.kunst94 === true && !("hawk" in M.migrateProfile(alt).pieces.abilities));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);

