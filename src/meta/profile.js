import { storage } from "../platform/index.js";
import { formationLegalOn, abilityCost } from "./leveling.js";
import { mapById } from "../content/maps.js";

const KEY = "profile";

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
    campaign: { league: 1, cleared: [], unlocked: [], dupes: {} }, // per-league clears; unlocks + duplication stars persist
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
export function ohneDauerfeuer(p) {
  const ab = p?.pieces?.abilities;
  if (!ab) return p;
  let sp = p.sp || 0, geaendert = false;
  const neu = { ...ab };
  for (const [cid, liste] of Object.entries(ab)) {
    if (!Array.isArray(liste) || !liste.includes("ranged_volley")) continue;
    geaendert = true;
    const ohne = liste.filter((a) => a !== "ranged_volley");
    if (cid === "captain") neu[cid] = ohne.includes("ranged_shot") ? ohne : [...ohne, "ranged_shot"];
    else { neu[cid] = ohne; if (DAUERFEUER_ERSTATTUNG[cid]) sp += abilityCost(DAUERFEUER_ERSTATTUNG[cid]); }
  }
  return geaendert ? { ...p, sp, pieces: { ...p.pieces, abilities: neu } } : p;
}
function migrate(p) {
  p = ohneDauerfeuer(p);
  const d = defaultProfile();
  const lo = p.loadout || {};
  const formations = {};
  const gueltig = new Set(["classic", "courtyard", "gauntlet"]);
  /* v1.24.0: gespeicherte Aufstellungen auf die drei verbliebenen Karten
     umrechnen. Die 10er-Aufstellung der Arena zaehlt als Erbe: sie fuellt
     jede 8x8-Karte, die noch keine eigene hat. Das 6x6-Scharmuetzel faellt
     weg (nicht hochrechenbar). */
  for (const [id, f] of Object.entries(lo.formations || {})) {
    if (!gueltig.has(id)) continue;
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
  return {
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
    loadout: { formations, heroCols: { ...((p.loadout || {}).heroCols || {}) }, decks: { ...((p.loadout || {}).decks || {}) } },
    notices: { ...(p.notices || {}) },
    spar: { ...(p.spar || {}) },
    gegnerStil: p.gegnerStil || "farbig",
    campaign: {
      league: (p.campaign && p.campaign.league) || 1,
      dupes: { ...((p.campaign && p.campaign.dupes) || {}) },
      cleared: [...cleared],
      unlocked: [...unlocked],
    },
  };
}
export async function loadProfile() {
  try { const r = await storage.get(KEY, false); if (r && r.value) return migrate(JSON.parse(r.value)); } catch {}
  return defaultProfile();
}
export async function saveProfile(p) {
  try { await storage.set(KEY, JSON.stringify(p), false); } catch {}
}

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
    throw new Error("not a Grand Gambit save file");
  return migrate(data.profile);
}
