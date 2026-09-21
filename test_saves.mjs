// Accounts + save slots: the front door and the career shelf.
import { ensureAccounts, register, login, loginGuest, findAccount, hashPass, normEmail, validEmail, mkAccount,
  changePassword, adminHasDefaultPass, ADMIN_EMAIL, ADMIN_SALT, ADMIN_HASH, currentAccount, clearSession, deleteAccount } from "./src/meta/accounts.js";
import { createSave, listSaves, loadSave, writeSave, deleteSave, renameSave,
  progressPct, withProgressPct, leagueOrder, migrateLegacyInto, fmtPlaytime } from "./src/meta/saves.js";
import { defaultProfile } from "./src/meta/profile.js";
import { storage } from "./src/platform/index.js";
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
  ok("league X at 100% fields every reachable boss", ownedLeagueBosses(everything).length === 23 && everything.stats.leaguesWon === 10);  // v0.38.1: Asra (XI) und Osric (XII) warten hinter Kapitel X
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
ok("full build fields every monster except the last two masters", BOSSES.every((b) => fullOwned.has(b.id) || b.id === "b23" || b.id === "b25"));  // v0.38.1: Erzfeindin und Grossmeister stehen jenseits von Kapitel X
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
  const sv = readFileSync("src/app/ui/screens/SavesScreen.jsx", "utf8");
  ok("ein neuer Spielstand laesst sich nur anlegen, solange es keinen gibt",
    sv.includes("(saves || []).length === 0 && <button onClick={create}"));
  ok("im Spielstandschirm gibt es keinen Loeschknopf mehr", !sv.includes("deleteSave(account.id, sv.id)"));
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
  ok("auch das normale Laden stellt Dauerfeuer um", readFileSync("src/meta/saves.js", "utf8").includes("return ohneDauerfeuer(JSON.parse(r.value))"));
  /* v1.29.0: eine gestrichene Faehigkeit (Blinzeln beim Springer) verschwindet
     samt Stufe, die Punkte kommen ueber denselben Weg zurueck */
  const q = pm.defaultProfile(); q.sp = 10;
  q.pieces = { ...q.pieces, levels: { ...(q.pieces.levels || {}), knight: 9 }, abilities: { knight: ["knight_longleap", "teleport"] }, stufen: { knight: { teleport: 2 } } };
  const q2 = pm.parseSave(pm.serializeSave(q));
  ok("gestrichenes Blinzeln verschwindet beim Springer, Weitsprung bleibt", JSON.stringify(q2.pieces.abilities.knight) === '["knight_longleap"]');
  ok("... samt seiner Stufe, und die Skillpunkte kommen zurueck", !q2.pieces.stufen?.knight?.teleport && q2.sp === 13);
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);

