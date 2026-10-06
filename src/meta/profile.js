import { formationLegalOn, abilityCost, maxLevelFor, bossUpgradeCost } from "./leveling.js";
import { mapById } from "../content/maps.js";
import { CHARACTERS } from "../content/characters.js";
import { bossById, LEAGUE_BOSSES } from "../content/bosses.js";
import { CAMPAIGN12 } from "../content/campaign12.gen.js";


export function emptyStats() {
  return { games: 0, wins: 0, losses: 0, draws: 0, captures: 0, promotions: 0, checkmates: 0, winStreak: 0, bestStreak: 0, flawlessQueenWins: 0, fastWins: 0 };
}
const rid = (n) => Array.from({ length: n }, () => "abcdefghjkmnpqrstuvwxyz23456789"[Math.floor(Math.random() * 31)]).join("");

export function defaultProfile() {
  return {
    v: 2, name: "", lang: "de", pin: null,
    xp: 0,            // spendable balance (upgrades cost XP)
    xpEarned: 0,      // lifetime earnings (player level, achievements)
    pieces: { levels: {} },              // purchased per-piece levels (default 1)
    loadout: { formations: {} },         // per-map formations, keyed by map id
    notices: {},                          // seen one-time notices (privacy, online consent)
    spar: {},                             // v1.0.37: abgeschaltete Zeichenposten (Sparmodus)
    gegnerStil: "farbig",                 // v1.0.50: farbig | grau | getoent (Sicht auf die Gegnerseite)
    gold: 0,
    sp: 0,
    claims: {},
    items: { potion: 0 },
    campaign: { league: 1, cleared: [], unlocked: [], dupes: {}, meister20: true, figuren91: true }, // figuren91: v1.91.0, siehe figurenUmbau; per-league clears; unlocks + duplication stars persist; meister20: v1.90.20, siehe migrate
    online: { id: rid(6), secret: rid(18), privacy: "public", server: "" }, // multiplayer identity
    difficulty: "easy",
    stats: emptyStats(),
  };
}
/* ── DIE ALTE ZEHNERREIHE WIRD ACHT (v1.24.0) ─────────────────────────────
   Mit dem Wegfall der Arena liegen in gespeicherten Profilen noch
   10er-Aufstellungen. Sie sind nicht verloren: die 10er-Reihe ist die
   Achterreihe PLUS die beiden zusaetzlichen Flankenspringer (Plaetze 2 und
   7). Wer sie herausnimmt, bekommt genau die Achterreihe zurueck - und
   Koenig und Dame landen von selbst auf ihren neuen Feldern 4 und 3
   (vorher 5 und 4), weil beide links von sich je einen Platz verlieren.

   Wird die Aufstellung dabei ungueltig - zwei Amazonen, die vorher auf
   verschiedenen Plaetzen standen und jetzt beide bleiben, oder eine dritte
   Figur derselben Art unter der neuen Zweier-Grenze -, dann gibt es NULL
   zurueck; der Aufrufer nimmt dann die Grundstellung der Karte. Lieber eine
   saubere Grundstellung als eine kaputte Erinnerung. */
const ALTE_FLANKEN = [2, 7];      // die beiden Extra-Plaetze der 10er-Reihe
export function formationAufAcht(formation, unlockedIds = null, map = null) {
  if (!Array.isArray(formation)) return null;
  let acht = null;
  if (formation.length === 8) acht = [...formation];
  else if (formation.length === 10) acht = formation.filter((_, i) => !ALTE_FLANKEN.includes(i));
  else return null;               // 6er-Scharmuetzel laesst sich nicht hochrechnen
  if (unlockedIds && map && !formationLegalOn(acht, unlockedIds, map)) return null;
  return acht;
}

/* ── v1.28.1: DAUERFEUER IST AUS ALLEN AUFSTIEGSPLAENEN (Besitzer: "keine
   Figur darf starke Faehigkeiten dauerhaft haben"). Es war ein dauerhafter
   Fernschuss. Wer es schon gelernt hatte, verliert nichts:
     - der Kapitaen hatte keinen anderen Fernschuss - er bekommt Scharfschuss
       an dieselbe Stelle (Stufe 6);
     - Magier, Warlock und Techniker haben Scharfschuss ohnehin - bei ihnen
       faellt Dauerfeuer weg, und die Skillpunkte kommen zurueck (so viel,
       wie die Sprosse gekostet hatte: Stufe 7, 9, 8). */
const DAUERFEUER_ERSTATTUNG = { mage: 7, warlock: 9, engineer: 8 };
/* v1.29.0: gestrichene Faehigkeiten (Beweglichkeitsregel) - Figur -> Faehigkeit
   -> Stufe der alten Sprosse, damit dieselbe Erstattung greift. */
const GESTRICHEN = { knight: { teleport: 6, lifesteal: 8 }, bishop: { ranged_shot: 4, teleport: 7 }, rook: { ranged_shot: 4, bulwark: 6 },
  archbishop: { ranged_shot: 4 }, chancellor: { ranged_shot: 4 }, hawk: { knight_outrider: 5 }, amazon: { queen_knightleap: 3 } };
/* v1.32.0: die MONSTER geben ihre Familiengabe ab (sie stand auf Sprosse 2) -
   sie tragen jetzt nur die neun Monsterfaehigkeiten. Gefuehrt unter "X:<id>",
   derselben Schreibweise wie ihre Lernliste. Der Koloss (b14) hatte keine. */
const MONSTER_GABE_ALT = { b01: "bulwark", b02: "regen", b03: "lifesteal", b04: "teleport", b05: "regen", b06: "bulwark",
  b07: "teleport", b08: "bulwark", b09: "lifesteal", b10: "regen", b11: "teleport", b12: "bulwark", b13: "lifesteal",
  b15: "regen", b16: "lifesteal", b17: "regen", b18: "bulwark", b19: "teleport", b20: "bulwark", b21: "teleport",
  b22: "regen", b23: "regen", b24: "lifesteal", b25: "bulwark" };
for (const [b, gabe] of Object.entries(MONSTER_GABE_ALT)) GESTRICHEN["X:" + b] = { [gabe]: 2 };
/* v1.32.0: auch die AUFSTUFUNGEN einer gestrichenen Faehigkeit kommen zurueck.
   Vorher gab der Weg nur den Lernpreis zurueck und loeschte die Stufen - wer
   etwa Blinzeln beim Springer auf II gebracht hatte, verlor diese Punkte.
   Gerechnet wie upgradeAbility (leveling.js, stufeBenoetigt): Stufe n braucht
   Sprosse + 2*(n-1) bei einer Figur, + (n-1) bei einem Monster. */
const aufstufungsPreis = (cid, sprosse, stufe) => {
  let sp = 0;
  for (let n = 2; n <= (stufe || 1); n++) sp += abilityCost(sprosse + (cid.startsWith("X:") ? 1 : 2) * (n - 1));
  return sp;
};
/* v1.33.2: KEINE FIGUR UEBER IHRER HOECHSTSTUFE (Besitzer: "Gambit-Stufe
   ueber 20 in Altstaenden kappen"). Fruehere Fassungen liessen den Gambit in
   drei Rangstufen zu je zehn bis 30 steigen; seit GAMBIT_MAX_LEVEL = 20
   standen alte Staende darueber - Siegelstufe, Leiter und Knopf rechneten mit
   einer Stufe, die es nicht mehr gibt. Gilt fuer jede Figur (maxLevelFor);
   Monster ("X:...") haben ihre eigene Grenze und bleiben unberuehrt.
   OHNE Erstattung: die Stufen darueber wurden zu anderen Preisen gekauft, und
   ein neuer Erstattungsweg waere ungeprueft (Besitzer: im Zweifel weglassen). */
export function stufenGekappt(p) {
  const lv = p?.pieces?.levels;
  if (!lv || typeof lv !== "object") return p;
  let geaendert = false; const neu = { ...lv };
  for (const [id, l] of Object.entries(lv)) {
    if (id.startsWith("X:") || typeof l !== "number") continue;
    const max = maxLevelFor(id);
    if (l > max) { neu[id] = max; geaendert = true; }
  }
  return geaendert ? { ...p, pieces: { ...p.pieces, levels: neu } } : p;
}

/* v1.34.0: SPROSSEN, DIE JETZT GESCHENKT SIND. Der Gambit lernte Sturmlauf
   bisher auf Stufe 5 fuer Punkte; seit dem Erwachen bekommt er ihn umsonst.
   Wer ihn gelernt hat, bekommt den damaligen Lernpreis zurueck - einmal: der
   Eintrag verlaesst die Lernliste, danach greift nichts mehr. Die AUFSTUFUNG
   bleibt, die Faehigkeit ist ja weiter da. Die Zahl ist die ALTE Sprosse (5),
   weil der Preis an ihr hing. */
const JETZT_GESCHENKT = { gambit: { pawn_charge: 5 } };
export function geschenkteErstattet(p) {
  const ab = p?.pieces?.abilities;
  if (!ab) return p;
  let sp = p.sp || 0, geaendert = false; const neu = { ...ab };
  for (const [cid, alt] of Object.entries(JETZT_GESCHENKT)) {
    const liste = ab[cid];
    if (!Array.isArray(liste)) continue;
    for (const [a, sprosse] of Object.entries(alt)) if (liste.includes(a)) {
      neu[cid] = (neu[cid] || liste).filter((x) => x !== a); sp += abilityCost(sprosse); geaendert = true;
    }
  }
  return geaendert ? { ...p, sp, pieces: { ...p.pieces, abilities: neu } } : p;
}

/* v1.37.0: FLIEGEN IST EINE FAEHIGKEIT MIT STUFEN. Der Drache lernte die
   Reichweite bisher als zwei weitere Sprossen (dragon_flight2/3). Wer sie
   gelernt hat, hat sie bezahlt - sie werden zur STUFE, nicht erstattet und
   nicht verschenkt. Einmalig: danach stehen sie nicht mehr in der Liste. */
export function fliegenZusammengelegt(p) {
  const liste = p?.pieces?.abilities?.dragon;
  if (!Array.isArray(liste) || !liste.some((a) => a === "dragon_flight2" || a === "dragon_flight3")) return p;
  const stufe = liste.includes("dragon_flight3") ? 3 : 2;
  const ohne = liste.filter((a) => a !== "dragon_flight2" && a !== "dragon_flight3");
  if (!ohne.includes("dragon_flight")) ohne.push("dragon_flight");
  const stufen = { ...(p.pieces.stufen || {}) };
  stufen.dragon = { ...(stufen.dragon || {}), dragon_flight: Math.max(stufe, (stufen.dragon || {}).dragon_flight || 1) };
  return { ...p, pieces: { ...p.pieces, abilities: { ...p.pieces.abilities, dragon: ohne }, stufen } };
}

/* ── v1.91.0: DER FIGUREN-UMBAU ZIEHT ALTE STAENDE NACH (Besitzer 6.10.) ──────
   Einmalig (Merkzeichen campaign.figuren91; neue Staende tragen es von Anfang
   an). Was sich fuer einen alten Stand aendert, und was er dafuer bekommt:

   1. DER FLAGGENTRAEGER IST FORT. An seiner Stelle steht der Nachtwaechter -
      dieselbe Gangart, dieselbe Leiter. Alles wandert mit: Besitz, Sterne,
      Siege, Stufe, Gelerntes, Aufstellungen.
   2. DER DOPPELRITTER (b10) IST FORT. Kapitel II haelt jetzt Varek; wer das
      Kapitel gewonnen hat, bekommt ihn ueber die Trophaeenliste von selbst.
      Was in den Doppelritter gesteckt wurde, kommt zurueck: Raenge und
      Gelerntes als Skillpunkte, ein Bestechpreis (1800) als Gold. In den
      Aufstellungen tritt die Dame an seinen Platz.
   3. DIE ALTEN GROSSMEISTER SIND BESTIEN. Wer ihr Kapitel gewonnen hat,
      BEHAELT sie (als bestochen gefuehrt) und bekommt den neuen Grossmeister
      dazu. Eine Aufstellung, die einen von ihnen fuehrt, bleibt gueltig
      (ownedLeagueBosses fuehrt die Bestochenen mit).
   4. GELERNTES, DAS ES NICHT MEHR GIBT. Die herabgestuften Meister tragen
      andere Faehigkeiten. Was ein Monster gelernt hat und nicht mehr auf
      seiner Leiter steht, kommt als Skillpunkte zurueck (2 je Faehigkeit,
      3 je weiterer Stufe - mehr hat keine Monstersprosse je gekostet).
   5. DIE NEUEN FRUEHEN FIGUREN. 24 Figuren stehen jetzt an Stationen, die ein
      alter Stand laengst hinter sich hat. Er bekommt jede Figur, deren
      Station er geklaert hat oder die in einem Kapitel liegt, das er schon
      verlassen hat - sonst kaeme er nie mehr an sie heran.
   6. Ein pausiertes Gefecht faellt weg: sein Brett kann Figuren tragen, die
      es nicht mehr gibt. */
const ALTE_TROPHAEE = [null, "b10", "b24", "b19", "b20", "b16", "b17", "b18", "b08", "b14", "b23", "b25"];
const tausche = (liste, von, nach) => (Array.isArray(liste) ? liste.map((e) => (e === von ? nach : e)) : liste);
const umhaengen = (obj, von, nach, wie = (a, b) => (b == null ? a : (typeof a === "number" && typeof b === "number" ? Math.max(a, b) : b))) => {
  if (!obj || typeof obj !== "object" || !(von in obj)) return obj;
  const neu = { ...obj }; neu[nach] = wie(neu[von], neu[nach]); delete neu[von]; return neu;
};
export function figurenUmbau(p) {
  const camp = (p?.campaign && typeof p.campaign === "object") ? p.campaign : {};
  if (camp.figuren91 === true) return p;
  let gold = p.gold || 0, sp = p.sp || 0;
  const pieces = { ...(p.pieces || {}) };
  const c = { ...camp };

  /* 1. Flaggentraeger -> Nachtwaechter */
  const unlocked = new Set(tausche(c.unlocked || [], "standard", "watchman"));
  c.dupes = umhaengen(c.dupes || {}, "standard", "watchman");
  if (c.bossWins) c.bossWins = umhaengen(c.bossWins, "standard", "watchman");
  for (const fach of ["levels", "abilities", "stufen"]) if (pieces[fach]) pieces[fach] = umhaengen(pieces[fach], "standard", "watchman");

  /* 2. Doppelritter */
  const bestochen = new Set(c.bribedBosses || []);
  if (bestochen.delete("b10")) gold += 1800;
  const rang = pieces.bossLevels?.b10 || 1;
  for (let l = 2; l <= rang; l++) sp += bossUpgradeCost(l);
  if (pieces.bossLevels && "b10" in pieces.bossLevels) { pieces.bossLevels = { ...pieces.bossLevels }; delete pieces.bossLevels.b10; }

  /* 3. alte Meister gewonnener Kapitel bleiben als Bestien */
  const gewonnen = Math.min(12, (p.stats && p.stats.leaguesWon) || 0);
  for (const id of ALTE_TROPHAEE.slice(0, gewonnen)) if (id && id !== "b10" && !LEAGUE_BOSSES.includes(id) && bossById(id)) bestochen.add(id);

  /* 4. Gelerntes, das nicht mehr auf der Leiter steht (nur Monster) */
  if (pieces.abilities) {
    const ab = { ...pieces.abilities }, st = { ...(pieces.stufen || {}) };
    for (const [cid, liste] of Object.entries(ab)) {
      if (!cid.startsWith("X:") || !Array.isArray(liste)) continue;
      const leiter = new Set((bossById(cid.slice(2))?.ladder || []).map((e) => e.ability));
      const bleibt = liste.filter((a) => leiter.has(a));
      for (const a of liste) if (!leiter.has(a)) sp += 2 + 3 * Math.max(0, ((st[cid] || {})[a] || 1) - 1);
      if (bleibt.length !== liste.length) {
        if (leiter.size) ab[cid] = bleibt; else delete ab[cid];
        if (st[cid]) { const s2 = {}; for (const [a, n] of Object.entries(st[cid])) if (leiter.has(a)) s2[a] = n; if (leiter.size) st[cid] = s2; else delete st[cid]; }
      }
    }
    pieces.abilities = ab; if (pieces.stufen) pieces.stufen = st;
  }

  /* 5. Figuren hinter dem Spieler */
  const liga = Math.max(1, c.league || 1);
  const klar = new Set(Array.isArray(c.cleared) ? c.cleared : []);
  const gespielt = liga > 1 || klar.size > 0;
  if (gespielt) for (const n of CAMPAIGN12) {
    const figur = n.boss && n.boss.piece;
    if (!figur || !CHARACTERS[figur]) continue;
    if (n.league < Math.min(liga, 13) || (n.league === ((liga - 1) % 12) + 1 && klar.has(n.id)) || liga > 12) unlocked.add(figur);
  }

  /* Aufstellungen und Faecher */
  /* Die herabgestuften Meister duerfen als Bestien nur noch auf freie Plaetze
     (formationLegalOn) - wer einen von ihnen auf dem DAMENPLATZ stehen hatte,
     bekommt dort die Dame zurueck, sonst waere die ganze Aufstellung ungueltig
     und fiele auf die Grundstellung. */
  const ersetze = (f) => {
    if (!Array.isArray(f)) return f;
    const dame = Math.floor(f.length / 2) - 1;
    return f.map((e, i) => {
      if (e === "standard") return "watchman";
      if (typeof e !== "string" || !e.startsWith("boss:")) return e;
      const id = e.slice(5);
      if (!bossById(id)) return "queen";
      return i === dame && !LEAGUE_BOSSES.includes(id) ? "queen" : e;
    });
  };
  const lo = { ...(p.loadout || {}) };
  if (lo.formations) lo.formations = Object.fromEntries(Object.entries(lo.formations).map(([k, f]) => [k, ersetze(f)]));
  if (Array.isArray(lo.formation)) lo.formation = ersetze(lo.formation);
  if (lo.decks) lo.decks = Object.fromEntries(Object.entries(lo.decks).map(([k, d]) => [k, tiefErsetzt(d, ersetze)]));
  if (c.besetzung) { c.besetzung = {}; }   // die Gegnerbesetzung wird neu gewuerfelt (sie kann den Flaggentraeger fuehren)

  let codex = p.codex;
  if (codex && typeof codex === "object") {
    const raus = (l) => (Array.isArray(l) ? l.filter((e) => e !== "X:b10" && e !== "b10") : l);
    codex = { ...codex, met: raus(codex.met), beaten: raus(codex.beaten) };
  }
  let charXp = p.charXp;
  if (charXp && "standard" in charXp) charXp = umhaengen(charXp, "standard", "watchman");

  const aus = { ...p, gold, sp, pieces, loadout: lo, pausedMatch: null,
    campaign: { ...c, unlocked: [...unlocked], ...(bestochen.size || c.bribedBosses ? { bribedBosses: [...bestochen] } : {}), figuren91: true } };
  if (codex) aus.codex = codex;
  if (charXp) aus.charXp = charXp;
  return aus;
}
/* ein Fach (decks.js) haelt Aufstellungen in einer kleinen Schachtelung -
   jede Liste darin, die wie eine Grundreihe aussieht, wird umgeschrieben */
function tiefErsetzt(x, ersetze) {
  if (Array.isArray(x)) return x.some((e) => e && typeof e === "object") ? x.map((e) => tiefErsetzt(e, ersetze)) : ersetze(x);
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, tiefErsetzt(v, ersetze)]));
  return x;
}

export function ohneDauerfeuer(p) {
  p = stufenGekappt(p);   /* v1.33.2: beide Ladewege laufen hier durch */
  p = geschenkteErstattet(p);   /* v1.34.0 */
  p = fliegenZusammengelegt(p); /* v1.37.0 */
  const ab = p?.pieces?.abilities;
  if (!ab) return p;
  let sp = p.sp || 0, geaendert = false;
  const neu = { ...ab };
  const stufen = { ...(p.pieces.stufen || {}) };
  for (const [cid, liste] of Object.entries(ab)) {
    if (!Array.isArray(liste)) continue;
    const weg = GESTRICHEN[cid] || {};
    if (!liste.includes("ranged_volley") && !liste.some((a) => weg[a])) continue;
    geaendert = true;
    let ohne = liste.filter((a) => a !== "ranged_volley");
    if (liste.includes("ranged_volley")) {
      if (cid === "captain") ohne = ohne.includes("ranged_shot") ? ohne : [...ohne, "ranged_shot"];
      else if (DAUERFEUER_ERSTATTUNG[cid]) sp += abilityCost(DAUERFEUER_ERSTATTUNG[cid]);
    }
    for (const a of ohne) if (weg[a]) sp += abilityCost(weg[a]) + aufstufungsPreis(cid, weg[a], stufen[cid]?.[a]);
    ohne = ohne.filter((a) => !weg[a]);
    neu[cid] = ohne;
    if (stufen[cid]) { const st = { ...stufen[cid] }; for (const a of Object.keys(st)) if (weg[a]) delete st[a]; stufen[cid] = st; }
  }
  return geaendert ? { ...p, sp, pieces: { ...p.pieces, abilities: neu, stufen } } : p;
}
/* ── v1.90.18 (Audit A40): DIE MIGRATION LAEUFT AUF JEDEM LADEWEG ─────────────
   Bis v1.90.17 lief `migrate` nur beim Einlesen einer Sicherungsdatei
   (parseSave) - das normale Laden (saves.js loadSave) und die Uebernahme
   alter Staende (migrateLegacyInto) gingen daran vorbei; jeder Konsument
   musste darum selbst mit alten Formen rechnen.
   BEVOR sie auf jedem Weg laufen durfte, musste sie IDEMPOTENT werden - und
   dabei fiel ein echter Fehler auf, gemessen an einem heutigen Stand:
   `campaign` wurde aus vier Feldern NEU gebaut. Wer eine Sicherungsdatei
   zurueckspielte, verlor bribedBosses (gekaufte Monster), bossWins, tolls
   (bezahlte Maut), faced und besetzung; und von den Aufstellungen ueberlebte
   nur "classic" - "classic#chess" (der Schach-Plan) fiel weg. Jetzt bleibt
   jedes Feld stehen, die Migration ergaenzt und formt nur um. */
export function migrate(p) {
  p = ohneDauerfeuer(p);
  const brauchtUmbau = !(p?.campaign && p.campaign.figuren91 === true);
  const d = defaultProfile();
  const lo = p.loadout || {};
  const formations = {};
  const gueltig = new Set(["classic", "courtyard", "gauntlet"]);
  /* v1.24.0: gespeicherte Aufstellungen auf die drei verbliebenen Karten
     umrechnen. Die 10er-Aufstellung der Arena zaehlt als Erbe: sie fuellt
     jede 8x8-Karte, die noch keine eigene hat. Das 6x6-Scharmuetzel faellt
     weg (nicht hochrechenbar). */
  for (const [id, f] of Object.entries(lo.formations || {})) {
    if (!gueltig.has(String(id).split("#")[0])) continue;   /* v1.90.18: auch "classic#chess" */
    const a = formationAufAcht(f);
    if (a) formations[id] = a;
  }
  const erbe = formationAufAcht((lo.formations || {}).arena || lo.formation || null);
  if (erbe) for (const id of gueltig) if (!formations[id]) formations[id] = erbe;
  // v1 → v2: charXp auto-levels become purchased levels; any piece the player
  // had progressed counts as unlocked; linear campaign progress maps onto the
  // intro nodes of the new branching map.
  /* v1.28.1: DAS FIGURENFACH BLEIBT GANZ. Seit v0.2.0 baute diese Zeile es nur
     aus den Stufen neu - gelernte Faehigkeiten (abilities), Monsterstufen
     (bossLevels), Faehigkeitsstufen (stufen) und alles andere darin gingen
     verloren. Das normale Laden lief nie hier durch, wohl aber das
     Wiederherstellen aus einer Sicherungsdatei und aus dem Online-Tresor:
     wer eine Sicherung zurueckspielte, bekam seine Figuren ohne ihre
     Faehigkeiten zurueck. Jetzt werden nur die Stufen ergaenzt, der Rest
     bleibt. */
  const pieces = { ...((p.pieces && typeof p.pieces === "object") ? p.pieces : {}), levels: { ...((p.pieces && p.pieces.levels) || {}) } };
  const unlocked = new Set((p.campaign && p.campaign.unlocked) || []);
  if (p.charXp) {
    for (const [id, xp] of Object.entries(p.charXp)) {
      if (!xp) continue;
      let lvl = 1; while (Math.round(40 * Math.pow(lvl, 1.7)) <= xp) lvl++;
      pieces.levels[id] = Math.max(pieces.levels[id] || 1, lvl);
      unlocked.add(id);
    }
  }
  let cleared = (p.campaign && p.campaign.cleared) || [];
  if (typeof cleared === "number") cleared = ["n01", "n02", "n03"].slice(0, Math.min(cleared, 3));
  /* ── v1.90.20: DER NEUE MEISTER VON KAPITEL I (Besitzerentscheid 1.10.) ─────
     Kapitel I endet jetzt mit dem Drachen, und wer ihn schlaegt, bekommt ihn
     sofort. Der Richter, der bis hierher dort stand und mit dem Sieg in den
     Hof kam, haelt Gericht in Kapitel II. Wer Kapitel I VOR dieser Fassung
     gewann, verliert dadurch nichts: er behaelt den Richter (als bestochenen
     Grossmeister - ownedLeagueBosses fuehrt bribedBosses mit, eine Aufstellung
     mit "boss:b12" bleibt gueltig) und bekommt den Drachen, denn er hat den
     Meister von Kapitel I ja besiegt. Einmalig: das Merkzeichen meister20
     steht danach im Stand (und in jedem neuen Stand von Anfang an, siehe
     defaultProfile) - spaetere Siege laufen ueber die neuen Regeln. */
  const campIn = (p.campaign && typeof p.campaign === "object") ? p.campaign : {};
  const bestochen = new Set(campIn.bribedBosses || []);
  if (campIn.meister20 !== true && ((p.stats && p.stats.leaguesWon) || 0) >= 1) {
    bestochen.add("b12");
    unlocked.add("dragon");
  }
  const fertig = {
    ...d, ...p,
    v: 2,
    online: { ...d.online, ...(p.online || {}) },
    gold: p.gold || 0,
    sp: p.sp != null ? p.sp : Math.round((p.xp || 0) / 60),
    claims: { ...(p.claims || {}) },
    items: (() => {
      const it = { ...d.items, ...(p.items || {}) };
      if (it.potions != null) { it.potion = (it.potion || 0) + it.potions; delete it.potions; }
      return it;
    })(),
    xpEarned: Math.max(p.xpEarned || 0, p.xp || 0),
    pieces,
    stats: { ...d.stats, ...(p.stats || {}) },
    /* v1.15.0: die drei Faecher (decks) ueberleben das Laden - hier wurde
       loadout neu zusammengesetzt und haette sie stillschweigend verworfen. */
    loadout: { ...lo, formations, heroCols: { ...(lo.heroCols || {}) }, decks: { ...(lo.decks || {}) } },
    notices: { ...(p.notices || {}) },
    spar: { ...(p.spar || {}) },
    gegnerStil: p.gegnerStil || "farbig",
    campaign: {
      ...((p.campaign && typeof p.campaign === "object") ? p.campaign : {}),
      league: (p.campaign && p.campaign.league) || 1,
      dupes: { ...((p.campaign && p.campaign.dupes) || {}) },
      cleared: [...cleared],
      unlocked: [...unlocked],
      ...(bestochen.size ? { bribedBosses: [...bestochen] } : {}),
      meister20: true,
      ...(brauchtUmbau ? {} : { figuren91: true }),
    },
  };
  /* v1.91.0: NACH meister20 - der Umbau liest leaguesWon und die fertige Liste */
  if (brauchtUmbau) delete fertig.campaign.figuren91;
  return figurenUmbau(fertig);
}
/* v1.90.18 (A40): loadProfile und saveProfile sind fort - keiner hatte noch
   einen Aufrufer (App.jsx importierte loadProfile nur, den Spiegel "profile"
   schreibt seit v1.90.16 niemand mehr). Geladen wird ueber saves.js loadSave,
   den alten Spiegel liest nur noch migrateLegacyInto (saves.js, "profile"). */

// ── save export / import ─────────────────────────────────────────────────────
/** Serialize the profile as a portable save file (versioned envelope). */
export function serializeSave(profile) {
  return JSON.stringify({ gg: "grand-gambit-save", v: profile.v || 2,
    exported: new Date().toISOString(), profile }, null, 2);
}
/** Parse + validate a save file. Returns a migrated profile or throws. */
export function parseSave(text) {
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("no valid JSON"); }
  if (!data || data.gg !== "grand-gambit-save" || !data.profile || typeof data.profile !== "object")
    throw new Error("not a Gambit save file");
  return migrate(data.profile);
}
