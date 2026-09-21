// ── Campaign — a BRANCHING map to the League ─────────────────────────────────
// The story starts as plain chess. After the awakening the road FORKS into
// three paths — Blades, Magic, Order — each guarded by different end bosses.
// Defeating a PIECE BOSS unlocks that piece for your army (the only way to get
// new pieces; XP merely upgrades what you own). Paths reconverge, so nothing is
// ever lost — but your route decides which pieces join you first.
//
// Node fields: col/row lay out the map (row 0 at the bottom, the League on
// top). `next` lists forward edges. `boss` is either { piece: charId } (unlock
// on kill) or { pure: bossId } (a monster from bosses.js). `tier` scales boss
// stats for balance (1 easy … 4 final).
import { CAMPAIGN12 } from "./campaign12.gen.js";
// Die Kampagne kommt seit v0.35.0 aus dem Generator: ZWOELF Kapitel-Graphen
// mit 529 Stationen, gebaut aus dem im Stationspruefer gepflegten Stand
// (tools/stationen.json, siehe tools/build-campaign12.mjs). Der alte
// 51-Knoten-Graph, der in jedem Kapitel wiederverwendet wurde, ist Geschichte
// - die Historie kennt ihn.
export const CAMPAIGN = CAMPAIGN12;



export const CHAPTERS = [
  { n: 1, fromRow: 0,  toRow: 2,  titleDe: "Der Aufbruch",     titleEn: "The Departure" },
  { n: 2, fromRow: 3,  toRow: 7,  titleDe: "Die drei Pfade",   titleEn: "The Three Paths" },
  { n: 3, fromRow: 8,  toRow: 11, titleDe: "Die Prüfungen",    titleEn: "The Trials" },
  { n: 4, fromRow: 12, toRow: 14, titleDe: "Der Aufstieg",     titleEn: "The Ascent" },
];
export const chapterForRow = (row) => CHAPTERS.find((c) => row >= c.fromRow && row <= c.toRow) || CHAPTERS[0];
// Every league tells its OWN four chapters — the road reads differently in the
// corn of the Kornmark than in the dunes or out on the open sea. Indexed by
// the chapter world (1..10, repeating beyond); falls back to the base titles.
const CHAPTER_TITLES = [
  /* I Kronland   */ [["Der Aufbruch","The Departure"],["Die drei Pfade","The Three Paths"],["Die Prüfungen","The Trials"],["Der Aufstieg","The Ascent"]],
  /* II Kornmark  */ [["Ins hohe Korn","Into the High Corn"],["Wege zwischen den Äckern","Roads Between the Fields"],["Die Zehntwaage","The Tithe Scales"],["Der Erntethron","The Harvest Throne"]],
  /* III Eichwald */ [["Unter das Blätterdach","Under the Canopy"],["Der Nebelscheid","The Mist Divide"],["Ins Dickicht","Into the Thicket"],["Der Herr der Eichen","The Lord of the Oaks"]],
  /* IV Krummholz */ [["Über die Baumgrenze","Above the Treeline"],["Krummholzpfade","Krummholz Trails"],["Die letzte Alm","The Last Pasture"],["Der kahle Kamm","The Bare Crest"]],
  /* V Grauwacht  */ [["Der erste Anstieg","The First Climb"],["Drei kalte Pässe","Three Cold Passes"],["Die Steinprobe","The Trial of Stone"],["Der Sattel des Winds","The Saddle of Winds"]],
  /* VI Wolkenjoch*/ [["Am Fuß der Wand","At the Foot of the Wall"],["Grate und Scharten","Ridges and Notches"],["Die Seilprobe","The Rope Trial"],["Zum Gipfelthron","To the Summit Throne"]],
  /* VII Sattelweite - die Reitertitel gehoeren zur Steppe */ [["Unter weitem Himmel","Under the Wide Sky"],["Die Reiterpfade","The Rider Trails"],["Feuer im Gras","Fire in the Grass"],["Der Khan der Steppe","The Khan of the Steppe"]],
  /* VIII Aschgrund - die Schluchttitel gehoeren zum Canyon */ [["In die Schlucht","Into the Gorge"],["Die drei Klammen","The Three Clefts"],["Echo und Absturz","Echo and Fall"],["Über der Felskante","Above the Rim"]],
  /* IX Die Wunde - die Aschetitel gehoeren zum Oedland */ [["In die Asche","Into the Ash"],["Drei tote Flüsse","Three Dead Rivers"],["Das Knochenfeld","The Bonefield"],["Der Herr der Öde","The Lord of the Waste"]],
  /* X Sonnenschl.*/ [["Der glühende Sand","The Glowing Sand"],["Karawanenwege","Caravan Roads"],["Die Glutprobe","The Ember Trial"],["Der Dünenthron","The Dune Throne"]],
  /* XI Die Kueste - neu geschrieben, das Meer ist jetzt XII */ [["An den Klippen","Along the Cliffs"],["Zwischen Ebbe und Flut","Between the Tides"],["Der Leuchtturmpfad","The Lighthouse Path"],["Der Herr der Häfen","The Lord of the Harbours"]],
  /* XII Endloses Meer - die alten Meertitel */ [["Ablegen","Casting Off"],["Drei Strömungen","Three Currents"],["Die Sturmfahrt","The Storm Passage"],["Der Herr der Wellen","The Lord of the Waves"]],
];
export const chapterTitle = (league, n, en = false) => {
  const world = ((Math.max(1, league) - 1) % 12);
  const set = CHAPTER_TITLES[world] || CHAPTER_TITLES[0];
  const pair = set[Math.max(0, Math.min(3, n - 1))];
  return en ? pair[1] : pair[0];
};

export const nodeById = (id) => CAMPAIGN.find((n) => n.id === id) || null;
/* v1.28.4 (Besitzer): DIE KAPITELMEISTER SIND DIE GROSSMEISTER. Jede Liga endet
   mit einem Monster; wer es besiegt, erhaelt es als Damenersatz - eine neue je
   Kapitel. Nur diese zwoelf sind "Grossmeister": nur auf dem Damenplatz, 3-5
   Faehigkeiten, duerfen verschieden stark sein. Die 13 anderen Monster sind
   gewoehnliche Monster und folgen der Beweglichkeitsregel wie die Figuren. */
export const KAPITELMEISTER = CAMPAIGN.filter((n) => n.final && n.boss?.pure).map((n) => n.boss.pure);
export const istKapitelmeister = (bossId) => KAPITELMEISTER.includes(bossId);

export const BRANCHES = {
  blades: { nameDe: "Pfad der Klingen",  nameEn: "Path of Blades",  icon: "fire" },
  magic:  { nameDe: "Pfad der Magie",    nameEn: "Path of Magic",   icon: "water" },
  order:  { nameDe: "Pfad der Ordnung",  nameEn: "Path of Order",   icon: "order" },
  power:  { nameDe: "Pfad der Macht",    nameEn: "Path of Power",   icon: "power" },
  wisdom: { nameDe: "Pfad der Weisheit", nameEn: "Path of Wisdom",  icon: "wisdom" },
};

import { bossById, bossName } from "./bosses.js";
import { CHARACTERS } from "./characters.js";
export const campaignTag = (node, en) => {
  if (node.tagDe || node.tagEn) return en ? node.tagEn : node.tagDe;
  if (node.boss?.piece) { const c = CHARACTERS[node.boss.piece]; return en ? c.nameEn : c.nameDe; }
  if (node.boss?.pure) { const b = bossById(node.boss.pure); return b ? bossName(b, en) : node.id; }
  return node.place || node.id;
};
