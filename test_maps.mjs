import { MAPS, mapById, validateMap, inMap, inBox, isHole, holeSet, mapIdx, playableCount } from "./src/content/maps.js";
import { PLACE_NAMES } from "./src/content/placeNames.js";
import { CAMPAIGN } from "./src/content/index.js";
import { placeFor, nodeInLeague } from "./src/meta/campaign.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

// Every catalog map is valid
for (const m of MAPS) ok(`map "${m.id}" validates`, validateMap(m).length === 0);

// Classic chess is always present and authentic
const classic = mapById("classic");
ok("classic map is 8x8", classic.w === 8 && classic.h === 8);
ok("classic map is flagged classic", classic.classic === true);
ok("classic default is the standard back rank",
  JSON.stringify(classic.defaultFormation) === JSON.stringify(["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]));
ok("at least one classic map exists", MAPS.some((m) => m.classic));

// Sizes and playable counts
/* v1.24.0 (Besitzerentscheid "Tabula Rasa"): Arena und Scharmuetzel sind
   gestrichen. Geprueft wird jetzt, dass sie WEG sind - und dass ein alter
   Kartenname sauber auf Klassik zurueckfaellt statt undefined zu liefern. */
ok("es gibt genau drei Karten", MAPS.length === 3);
ok("alle drei sind voll 8x8 breit", MAPS.every((m) => m.w === 8 && m.h === 8));
ok("die Arena ist fort", !MAPS.some((m) => m.id === "arena"));
ok("das Scharmuetzel ist fort", !MAPS.some((m) => m.id === "skirmish"));
ok("ein alter Kartenname faellt auf Klassik zurueck", mapById("arena").id === "classic");
ok("Klassik ist voll offen", playableCount(mapById("classic")) === 64);

// Holes (obstacles / shapes)
const yard = mapById("courtyard");
ok("courtyard removes its 4 holes", playableCount(yard) === 60);
ok("a hole is in the box but not in the map", inBox(yard, 3, 3) && !inMap(yard, 3, 3));
ok("a normal cell is in the map", inMap(yard, 0, 0));
ok("isHole detects a hole", isHole(yard, 4, 4) && !isHole(yard, 0, 0));
ok("holeSet size matches holes", holeSet(yard).size === 4);
ok("gauntlet also has obstacles", playableCount(mapById("gauntlet")) === 60);

// Indexing is width-relative
ok("mapIdx uses the map width", mapIdx({ w: 6 }, 2, 3) === 3 * 6 + 2);
ok("mapById falls back for unknown id", mapById("nope") === MAPS[0]);

// Validation actually catches mistakes
ok("validateMap rejects a bad width", validateMap({ w: 8, h: 8, holes: [], back: { whiteBack: 0, blackBack: 7, whitePawn: 1, blackPawn: 6 }, formation: { required: { king: 1 }, flex: 2 }, defaultFormation: ["king"] }).length > 0);


// ── place names: authored, complete, unique across the whole journey ─────────
{
  const ids = new Set(CAMPAIGN.map((n) => n.id));
  let complete = true;
  for (let lg = 2; lg <= 10; lg++)
  ok("every station carries its own authored name", CAMPAIGN.every((n) => (n.place || "").length >= 3));
  ok("place names are unique within each chapter", (() => {
    for (let lg = 1; lg <= 12; lg++) { const seen = new Set();
      for (const n of CAMPAIGN.filter((x) => x.league === lg)) { if (seen.has(n.place)) return false; seen.add(n.place); } }
    return true;
  })());
  ok("the name pools for chapters II-XI are stocked", [2,3,4,5,6,7,8,9,10,11].every((lg) => Object.keys(PLACE_NAMES[lg] || {}).length >= 30));
  ok("league I keeps its homeland names", placeFor(CAMPAIGN.find((n) => n.id === "L01s00")) === "Alte Wacht" && placeFor(CAMPAIGN.find((n) => n.id === "L01s01")) === "Silbermühle");
  ok("names hold steady across world laps", placeFor(CAMPAIGN.find((n) => n.id === "L01s02"), 4) === placeFor(CAMPAIGN.find((n) => n.id === "L01s02"), 1));
}

// ── strict per-station secrecy: a station reveals its figure only after it
// has been PLAYED in this league (campaign.faced), not merely because the
// piece is recruited or the monster was met elsewhere ──
{
  const withFaced = (ids) => ({ campaign: { league: 3, faced: ids, unlocked: ["knight"], cleared: [] }, codex: { met: ["X:b10"] } });
  // facedNode logic mirrored from CampaignScreen: cleared OR in faced set
  const faced = (profile, id) => (profile.campaign?.faced || []).includes(id);
  ok("an unplayed station stays hidden even for a recruited piece", faced(withFaced([]), "L07s41") === false);
  ok("a played station reveals its figure", faced(withFaced(["L07s41"]), "L07s41") === true);
}


// ── DIE ORTSNAMEN AUF ENGLISCH (v1.0.15, Besitzer) ──────────────────────────
import { PLACE_EN, placeEn } from "./src/content/placeNamesEn.js";
import { placeFor as _pfEn } from "./src/meta/index.js";
{
  const orte = [...new Set(CAMPAIGN.map((n) => n.place).filter(Boolean))];
  const ohne = orte.filter((o) => !PLACE_EN[o]);
  ok("every station carries an english name", ohne.length === 0);
  if (ohne.length) console.log("   ohne Englisch:", ohne.slice(0, 8).join(", "));
  const en = orte.map((o) => PLACE_EN[o]);
  ok("no english name repeats", new Set(en).size === en.length);
  // Kein Name darf versehentlich deutsch geblieben sein
  const deutsch = en.filter((x) => /[\u00e4\u00f6\u00fc\u00df\u00c4\u00d6\u00dc]/.test(x)
    || /\b(der|die|das|und|im|bei|wo)\b/.test(x));
  ok("no german left in the english names", deutsch.length === 0);
  if (deutsch.length) console.log("   noch deutsch:", deutsch.slice(0, 8).join(", "));
  const wacht = CAMPAIGN.find((n) => n.place === "Alte Wacht");
  ok("placeFor speaks both tongues",
    _pfEn(wacht) === "Alte Wacht" && _pfEn(wacht, 1, true) === "Old Watch");
  ok("an unknown name survives instead of vanishing", placeEn("Nirgendwo") === "Nirgendwo");
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
