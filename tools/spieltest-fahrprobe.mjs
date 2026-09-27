/* ── KERN-FAHRPROBE ALLER GEGNER-AUFSTELLUNGEN (ohne Browser) ─────────────────
   Auftrag Manuel 27.9.2026: "Funktionieren auch die unterschiedlichen
   Aufstellungen beim Gegner in welchen Kapiteln?"

   Teil 1: fuer ALLE 529 Stationen die Gegner-Aufstellung so bauen, wie die App
           es tut (App.jsx:587 buildStageMatch(id, profile) -> match.aiArmy;
           GameScreen.jsx:198/230/242 buildArmy + createGame), mit mehreren
           Spielstaenden (Besetzung ab Kapitel III haengt an codex.met /
           campaign.unlocked, "wechselnd" am Versuch = stats.games), und das
           Brett pruefen: alle Figuren drauf, genau ein Koenig je Seite,
           Drache/2x2 regelkonform, keine doppelte Belegung, kein Loch belegt.
   Teil 2: je Station x Spieler-Aufstellung (Standardheer / Heldenheer /
           Bestienheer) x Seed ein volles Gefecht KI gegen KI bis zum Ende oder
           MAX_HALBZUEGE, jede Exception, jeden Zustand ohne legale Zuege ohne
           Spielende, negative HP, Figuren auf Loechern, verwaiste Drachen-
           schwingen festhalten. Sperren/Fallen werden auf HP-Stationen bei
           Seed 2 vor dem ersten Zug gesetzt (wie GameScreen: setzeSperre).

   Aufruf (aus dem Repo-Wurzelverzeichnis, v1.89.4 - das Skript des Spieltests
   vom 27.9., Importe relativ zu tools/):
            timeout 600 node tools/spieltest-fahrprobe.mjs        (Standard: Auswahl)
            AUSWAHL=alle timeout 3000 node tools/spieltest-fahrprobe.mjs
            AUSWAHL=kurz SEEDS=1 node tools/spieltest-fahrprobe.mjs   (Rauchprobe)
            SEEDS=2 TIEFE_W=1 SHARD=0/4 ...
   Ergebnis: Zeilen "bericht-*.json" bzw. die Zusammenfassung am Ende
   ("fehler []" heisst: keine Exception, kein Zustand ohne Zug, keine negative
   HP). Nicht in npm test - Laufzeit Minuten bis Stunden.                        */
import { CAMPAIGN, mapById } from "../src/content/index.js";
import { CHARACTERS, CHARACTER_LIST } from "../src/content/characters.js";
import { BOSSES, LEAGUE_BOSSES } from "../src/content/bosses.js";
import { buildStageMatch } from "../src/meta/campaign.js";
import { buildArmyForMap, formationLegalOn, unlockedCharacterIds, ownedLeagueBosses } from "../src/meta/leveling.js";
import { defaultProfile } from "../src/meta/profile.js";
import { withProgressPct } from "../src/meta/saves.js";
import { besetzungsPlan } from "../src/meta/besetzung.js";
import { createGame, reduce, moveCommand, status, legalMoves, makeRng, findKing, WHITE, BLACK,
  setzeSperre, setzFelder, HP_REMIS_HALBZUEGE } from "../src/core/index.js";
import { chooseMove } from "../src/ai/index.js";
import { writeFileSync, mkdirSync } from "node:fs";

const ORDNER = process.env.ORDNER || "/tmp/gambit-spieltest";   // Berichte und Protokolle (JSON) landen hier, nie im Repo
mkdirSync(ORDNER, { recursive: true });
const AUSWAHL = process.env.AUSWAHL || "auswahl";      // "alle" | "auswahl" | "kurz"
const SEEDS = Number(process.env.SEEDS || 2);
const MAX_HALBZUEGE = Number(process.env.MAX_HALBZUEGE || 300);
const TIEFE_W = Number(process.env.TIEFE_W || 1);       // Spieler-KI (Weiss) - der Gegner spielt match.depth wie die App
const NUR = process.env.NUR ? process.env.NUR.split(",") : null;

const t0 = Date.now();
const log = (...a) => console.log(((Date.now() - t0) / 1000).toFixed(1).padStart(7) + "s", ...a);

/* ── SPIELSTAENDE ─────────────────────────────────────────────────────────────
   Gegner-Seite ("Sammler"): hat ALLES getroffen (codex.met: jede Figurenart,
   jedes Monster), besitzt aber nur die Startfiguren -> maximale Besetzung der
   freien Plaetze ab Kapitel III. Spieler-Seite ("Vollausbau"): Liga 12 mit
   100 % -> alle Figuren rekrutiert, alle Meister gewonnen, alle gewoehnlichen
   Monster bestochen; damit sind Helden- und Bestienheer legal. */
function profilSammler(games = 0) {
  const p = defaultProfile();
  p.campaign = { league: 12, cleared: [], unlocked: [], dupes: {} };
  p.codex = { met: [...new Set([...CHARACTER_LIST.map((c) => c.kind), ...BOSSES.map((b) => "X:" + b.id)])] };
  p.stats = { ...p.stats, games };
  return p;
}
function profilVollausbau(formation, mapId, hochgestuft) {
  const p = withProgressPct(defaultProfile(), 100, 12);
  p.loadout = { formations: formation ? { [mapId]: formation } : {} };
  if (hochgestuft) {
    const levels = {}, abilities = {};
    for (const c of CHARACTER_LIST) {
      levels[c.id] = c.id === "gambit" ? 20 : 10;
      abilities[c.id] = c.ladder.filter((e) => e.ability).map((e) => e.ability);
    }
    const bossLevels = {};
    for (const b of BOSSES) { bossLevels[b.id] = 5; abilities["X:" + b.id] = [...(b.abilities || [])]; }
    p.pieces = { levels, abilities, bossLevels, stufen: {} };
    p.campaign.dupes = Object.fromEntries(CHARACTER_LIST.map((c) => [c.id, 2]));
  }
  p.items = { ...(p.items || {}), potion: 3 };
  return p;
}
/* die drei Spieler-Aufstellungen (Damenplatz 3, Koenig 4 auf der Achterreihe) */
const AUFSTELLUNGEN = {
  standard: { formation: null, hochgestuft: false },
  helden:   { formation: ["captain", "hawk", "mage", "queen", "king", "seeress", "amazon", "chancellor"], hochgestuft: true },
  bestie:   { formation: ["dragon", null, "boss:b02", "boss:b12", "king", "boss:b05", "guardian", "rook"], hochgestuft: true },
};

/* ── BRETTPRUEFUNG ────────────────────────────────────────────────────────────
   Liefert eine Liste von Befunden (leer = in Ordnung). */
function pruefeBrett(g, laufend) {
  const f = [];
  const w = g.w, h = g.h;
  if (g.board.length !== w * h) f.push(`Brettlaenge ${g.board.length} statt ${w * h}`);
  const koenige = { w: 0, b: 0 }, drachen = [], schwingen = [];
  for (let i = 0; i < g.board.length; i++) {
    const p = g.board[i];
    if (!p) continue;
    if (g.holes.has(i)) f.push(`Feld ${i} ist ein Loch, traegt aber ${p.kind}`);
    if (p.kind === "D+") { schwingen.push(i); continue; }
    if (p.color !== "w" && p.color !== "b") f.push(`Feld ${i}: Farbe ${p.color}`);
    if (p.kind === "K") koenige[p.color]++;
    if (g.rules === "hp") {
      if (typeof p.hp !== "number" || Number.isNaN(p.hp)) f.push(`Feld ${i} ${p.kind}: hp=${p.hp}`);
      else if (p.hp <= 0) f.push(`Feld ${i} ${p.kind} ${p.color}: hp ${p.hp} <= 0, steht aber noch`);
      if (p.maxHp != null && p.hp > p.maxHp + 10) f.push(`Feld ${i} ${p.kind}: hp ${p.hp} > maxHp ${p.maxHp}`);
    }
    if (p.kind === "D" && p.big && p._unfolded) drachen.push(i);
  }
  if (laufend) {
    for (const c of ["w", "b"]) if (koenige[c] !== 1) f.push(`${koenige[c]} Koenige fuer ${c} bei laufendem Spiel`);
  } else {
    for (const c of ["w", "b"]) if (koenige[c] > 1) f.push(`${koenige[c]} Koenige fuer ${c}`);
  }
  for (const i of schwingen) {
    const s = g.board[i];
    const anker = g.board[s.ref];
    if (!anker || anker.kind !== "D" || !anker.big) f.push(`Schwinge auf ${i} zeigt auf ${s.ref} ohne grossen Drachen`);
  }
  for (const a of drachen) {
    const fa = a % w, ra = (a / w) | 0;
    if (fa > w - 2 || ra > h - 2) f.push(`Drache ${a} ragt ueber den Rand`);
    for (const c of [a + 1, a + w, a + w + 1]) {
      const x = g.board[c];
      if (!x || x.kind !== "D+" || x.ref !== a) f.push(`Drache ${a}: Feld ${c} ist keine Schwinge`);
      if (g.holes.has(c)) f.push(`Drache ${a}: Schwinge ${c} liegt auf einem Loch`);
    }
  }
  return f;
}

/* Aufstellung als Text (Art je Platz der Grundreihe) */
const reiheText = (army) => army.back.map((s) => (s == null ? "·" : s.bossId ? s.bossId : s.kind)).join(" ");

/* ── TEIL 1: ALLE AUFSTELLUNGEN ALLER STATIONEN ──────────────────────────────── */
const befunde = [];
const stationsBefund = (id, art, text, extra = {}) => { befunde.push({ station: id, art, text, ...extra }); log("BEFUND", id, art, text); };

const spielerStandard = profilVollausbau(null, "classic", false);
let aufstellungenGeprueft = 0, stationenGeprueft = 0, besetzteStationen = 0, wechselndeStationen = 0, verschiedeneReihen = 0;
const heerJeStation = new Map();   // id -> Map(reiheText -> {profil, match})
for (const node of CAMPAIGN) {
  if (NUR && !NUR.includes(node.id)) continue;
  stationenGeprueft++;
  const plan = besetzungsPlan(node);
  if (plan.k) besetzteStationen++;
  if (plan.wechselnd) wechselndeStationen++;
  const varianten = new Map();
  const profile = [
    ["sammler0", profilSammler(0)], ["sammler1", profilSammler(1)], ["sammler2", profilSammler(2)],
    ["vollausbau", profilVollausbau(null, "classic", false)],
    ["frisch", (() => { const p = defaultProfile(); p.campaign.league = node.league; return p; })()],
  ];
  for (const [name, prof] of profile) {
    try {
      const m = buildStageMatch(node.id, prof);
      const map = mapById(m.map);
      if (!m.aiArmy || !Array.isArray(m.aiArmy.back) || m.aiArmy.back.length !== map.w)
        stationsBefund(node.id, "aufstellung", `aiArmy.back hat ${m.aiArmy?.back?.length} Plaetze statt ${map.w}`, { profil: name });
      const koenige = m.aiArmy.back.filter((s) => s && s.kind === "K").length;
      if (koenige !== 1) stationsBefund(node.id, "aufstellung", `${koenige} Koenige im Gegnerheer`, { profil: name, reihe: reiheText(m.aiArmy) });
      const bosse = m.aiArmy.back.filter((s) => s && s.bossId);
      const dop = new Set(); for (const b of bosse) { if (dop.has(b.bossId)) stationsBefund(node.id, "aufstellung", `Monster ${b.bossId} doppelt`, { profil: name }); dop.add(b.bossId); }
      if (node.boss && !m.boss) stationsBefund(node.id, "aufstellung", "Station hat boss, Match aber keinen Boss", { profil: name });
      const g = createGame(buildArmyForMap(spielerStandard, map, m.excludeId, m.rules), m.aiArmy, { map, rules: m.rules, seed: 1 });
      const f = pruefeBrett(g, true);
      for (const x of f) stationsBefund(node.id, "brett", x, { profil: name, reihe: reiheText(m.aiArmy) });
      // alle Figuren aus dem Heer stehen (ausser Loch-Felder und Drachenpreis)
      const erwartet = m.aiArmy.back.filter((s) => s != null).length;
      const hinten = map.back.blackBack;
      let steht = 0; for (let x = 0; x < map.w; x++) { const p = g.board[hinten * map.w + x]; if (p && p.kind !== "D+" && p.color === "b") steht++; }
      const drache = m.aiArmy.back.some((s) => s && s.kind === "D" && s.big);
      if (!drache && steht !== erwartet) stationsBefund(node.id, "brett", `${steht} von ${erwartet} Gegnerfiguren auf der Grundreihe`, { profil: name, reihe: reiheText(m.aiArmy) });
      aufstellungenGeprueft++;
      const key = reiheText(m.aiArmy);
      if (!varianten.has(key)) varianten.set(key, { profil: name, match: m });
    } catch (e) {
      stationsBefund(node.id, "absturz-aufbau", String(e && e.stack || e).slice(0, 400), { profil: name });
    }
  }
  verschiedeneReihen += varianten.size;
  heerJeStation.set(node.id, varianten);
}
log(`Teil 1: ${stationenGeprueft} Stationen, ${aufstellungenGeprueft} Aufstellungen gebaut, ${verschiedeneReihen} verschiedene Gegnerreihen; ${besetzteStationen} Stationen mit Besetzung, ${wechselndeStationen} wechselnd; Befunde: ${befunde.length}`);

/* ── TEIL 2: VOLLE GEFECHTE KI GEGEN KI ─────────────────────────────────────── */
function stationenAuswahl() {
  if (NUR) return CAMPAIGN.filter((n) => NUR.includes(n.id));
  if (AUSWAHL === "alle") return CAMPAIGN;
  if (AUSWAHL === "kurz") return CAMPAIGN.filter((_, i) => i % 40 === 0);
  if (AUSWAHL === "rest") return CAMPAIGN.filter((n, i) => !(n.boss || n.final || i % 3 === 0));   // was "auswahl" ausliess
  return CAMPAIGN.filter((n, i) => n.boss || n.final || i % 3 === 0);
}
const spielerProfile = {};
const zahlen = { spiele: 0, halbzuege: 0, ergebnisse: {}, sperrenGesetzt: 0, fallenAusgeloest: 0, umwandlungen: 0, hpRemis: 0, limit: 0, laengste: 0 };
const spielFehler = [];
function spielFehlerMelde(o) { spielFehler.push(o); log("FEHLER", o.station, o.aufstellung, "seed", o.seed, "hz", o.halbzug, o.text.split("\n")[0]); }

function einGefecht(node, aufName, seed) {
  const gegner = profilSammler(seed);               // Versuch = stats.games -> wechselnde Aufstellung
  const m = buildStageMatch(node.id, gegner);
  const map = mapById(m.map);
  const auf = AUFSTELLUNGEN[aufName];
  const key = aufName + ":" + map.id;
  if (!spielerProfile[key]) spielerProfile[key] = profilVollausbau(auf.formation, map.id, auf.hochgestuft);
  const prof = spielerProfile[key];
  if (auf.formation && !formationLegalOn(auf.formation, unlockedCharacterIds(prof), map, ownedLeagueBosses(prof)))
    throw new Error(`Spieler-Aufstellung ${aufName} ist auf ${map.id} nicht legal`);
  const spieler = buildArmyForMap(prof, map, m.excludeId, m.rules);
  let g = createGame(spieler, m.aiArmy, { map, rules: m.rules, seed, potions: m.rules === "hp" ? { w: prof.items?.potion || 0, b: 0 } : undefined });
  const rngW = makeRng(seed * 7919 + 1), rngB = makeRng(seed * 104729 + 2);
  let sperren = 0, fallen = 0;
  if (m.rules === "hp" && seed % 2 === 0) {
    // wie GameScreen: vor dem ersten Zug setzt Weiss seine Sperren; Fallen liegen als Verzeichnis am Zustand
    const felder = setzFelder(g, WHITE);
    const arten = ["mauer", "bergfried", "zaun"];
    for (let k = 0; k < 2 && felder.length; k++) {
      const i = felder[(seed * 13 + k * 5) % felder.length];
      const neu = setzeSperre(g, i, arten[(seed + k) % 3], WHITE, g.moveCount);
      if (neu !== g.sperren) { g.sperren = neu; sperren++; }
    }
    const frei = setzFelder(g, WHITE).filter((i) => !g.sperren || !g.sperren[i]);
    if (frei.length >= 2) g.fallen = { [frei[0]]: { art: "grube", von: WHITE }, [frei[frei.length - 1]]: { art: "baerenfalle", von: WHITE } };
    const gf = setzFelder(g, BLACK);
    if (gf.length) g.fallen = { ...(g.fallen || {}), [gf[seed % gf.length]]: { art: "grube", von: BLACK } };
  }
  zahlen.sperrenGesetzt += sperren;
  const start = pruefeBrett(g, true);
  if (start.length) throw Object.assign(new Error("Startbrett: " + start.join(" | ")), { halbzug: 0 });
  let hz = 0, ergebnis = null, umw = 0, ausgeloest = 0;
  const fallenVorher = () => Object.values(g.fallen || {}).filter((f) => f.offen).length;
  while (true) {
    let st;
    try { st = status(g); } catch (e) { e.halbzug = hz; throw e; }
    if (st.over) { ergebnis = st; break; }
    if (hz >= MAX_HALBZUEGE) { ergebnis = { result: "limit" }; zahlen.limit++; break; }
    const tiefe = g.turn === BLACK ? m.depth : TIEFE_W;
    let mv;
    try { mv = chooseMove(g, tiefe, g.turn === BLACK ? rngB : rngW); } catch (e) { e.halbzug = hz; throw e; }
    if (!mv) {
      const lm = legalMoves(g, g.turn);
      throw Object.assign(new Error(`KI liefert keinen Zug ohne Spielende (legalMoves=${lm.length}, turn=${g.turn}, status=${JSON.stringify(st)})`), { halbzug: hz });
    }
    const offenVor = fallenVorher();
    let next;
    try { next = reduce(g, moveCommand(mv)).state; } catch (e) { e.halbzug = hz; throw e; }
    if (next === g) throw Object.assign(new Error(`reduce lehnt den KI-Zug ab: ${JSON.stringify(mv)}`), { halbzug: hz });
    if (next.lastMove && next.lastMove.promotion) umw++;
    g = next; hz++;
    ausgeloest += fallenVorher() - offenVor;
    const f = pruefeBrett(g, !status(g).over);
    if (f.length) throw Object.assign(new Error("Brett nach Zug " + JSON.stringify(mv) + ": " + f.join(" | ")), { halbzug: hz });
  }
  zahlen.spiele++; zahlen.halbzuege += hz; zahlen.umwandlungen += umw; zahlen.fallenAusgeloest += ausgeloest;
  if (hz > zahlen.laengste) zahlen.laengste = hz;
  const key2 = ergebnis.result + (ergebnis.grund ? ":" + ergebnis.grund : "") + (ergebnis.winner ? ":" + ergebnis.winner : "");
  zahlen.ergebnisse[key2] = (zahlen.ergebnisse[key2] || 0) + 1;
  if (ergebnis.grund === "ohneSchaden") {
    zahlen.hpRemis++;
    if ((g.ohneSchaden || 0) < HP_REMIS_HALBZUEGE) throw Object.assign(new Error(`HP-Remis bei ohneSchaden=${g.ohneSchaden}`), { halbzug: hz });
  }
  return { hz, ergebnis: key2, reihe: reiheText(m.aiArmy), map: map.id, rules: m.rules, tiefe: m.depth, sperren, fallen: ausgeloest, umw };
}

/* SHARD=i/n verteilt die Stationen auf mehrere Prozesse (Bericht je Shard) */
const [SHARD_I, SHARD_N] = (process.env.SHARD || "0/1").split("/").map(Number);
const stationen = stationenAuswahl().filter((_, i) => i % SHARD_N === SHARD_I);
const SUFFIX = SHARD_N > 1 ? `-${SHARD_I}` : "";
log(`Teil 2: ${stationen.length} Stationen x ${Object.keys(AUFSTELLUNGEN).length} Aufstellungen x ${SEEDS} Seeds`);
const protokoll = [];
let n = 0;
for (const node of stationen) {
  for (const aufName of Object.keys(AUFSTELLUNGEN)) {
    for (let s = 1; s <= SEEDS; s++) {
      n++;
      try {
        const tg = Date.now();
        const r = einGefecht(node, aufName, s);
        protokoll.push({ station: node.id, aufstellung: aufName, seed: s, ms: Date.now() - tg, ...r });
        if (process.env.LAUT) log(node.id, aufName, s, r.rules, r.map, "T" + r.tiefe, r.hz + "hz", r.ergebnis, ((Date.now() - tg) / 1000).toFixed(1) + "s");
      } catch (e) {
        spielFehlerMelde({ station: node.id, aufstellung: aufName, seed: s, halbzug: e.halbzug ?? null, text: String(e && e.stack || e) });
      }
    }
  }
  if (n % 60 === 0) log(`... ${n} Gefechte, ${zahlen.halbzuege} Halbzuege, Fehler ${spielFehler.length}`);
}

const bericht = {
  auswahl: AUSWAHL, seeds: SEEDS, maxHalbzuege: MAX_HALBZUEGE, tiefeWeiss: TIEFE_W,
  teil1: { stationen: stationenGeprueft, aufstellungen: aufstellungenGeprueft, verschiedeneReihen, besetzteStationen, wechselndeStationen, befunde },
  teil2: { stationen: stationen.length, ...zahlen, fehler: spielFehler },
  dauerSek: (Date.now() - t0) / 1000,
};
writeFileSync(ORDNER + `/bericht${SUFFIX}.json`, JSON.stringify(bericht, null, 1));
writeFileSync(ORDNER + `/protokoll${SUFFIX}.json`, JSON.stringify(protokoll));
log("FERTIG", JSON.stringify({ ...bericht, teil1: { ...bericht.teil1, befunde: bericht.teil1.befunde.length }, teil2: { ...bericht.teil2, fehler: bericht.teil2.fehler.length } }));
