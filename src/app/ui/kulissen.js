/* ── WER TRAEGT WELCHE KULISSE (v1.14.0) ──────────────────────────────────────
   Besitzerentscheid aus der Bundsitzung: jede Figur traegt die Kulisse ihres
   Bundes, jeder Grossmeister seine eigene, die uebrigen Monster in vier
   Gruppen, der Drache allein. Bauer und Gambit haben keinen Bund, tragen
   aber seit v1.14.2 eigene Kulissen.

   Diese Datei kennt nur NAMEN, keine Bilder - so laesst sie sich in node
   pruefen (test_buende.mjs). Die Bilder haengen in KulissenBilder.jsx dran. */
import { bundVon } from "../../content/buende.js";
import { LEAGUE_BOSSES } from "../../content/index.js";

/* Die zwoelf Grossmeister, in Kapitelfolge - dieselbe Reihenfolge wie
   LEAGUE_BOSSES. Eine Probe haelt beide Listen aneinander. */
export const MEISTER_KULISSE = {
  /* v1.91.0: vierzehn Grossmeister. Acht tragen neue Kulissen (Besitzer
     6.10.2026: "erfinde noch fuer jeden Meister einen Hintergrund"); Veyl,
     Brakk, Asra, Osric und Thalor uebernehmen die ihrer Vorgaenger - sie sind
     genau fuer diese Gestalten gemalt. */
  b26: "meister-zahir",          // I    Zahir, der Pfauenfuerst - Palastgarten
  b27: "meister-varek",         // II   Varek, der Schwarze Ritter - Turnierplatz bei Nacht
  b24: "meister-hetzer",         // III  Malrik, der Seuchenkoenig (der naechtliche Marktplatz; der Dateiname blieb)
  b28: "meister-isolde",         // IV   Isolde, die Dornenkoenigin - Rosengarten
  b29: "meister-halvar",         // Mitte XI  Halvar, der Gezeitenkoenig - versunkener Thronsaal
  b30: "meister-seraphine",      // VII  Seraphine, die Maskenfuerstin - Ballsaal
  b31: "meister-yorrik",         // V    Yorrik, der Winterkoenig - gefrorene Thronhalle
  b32: "meister-cassian",        // VIII Cassian, der Intrigant - geheime Ratskammer
  b33: "meister-schattenfuerst", // IX   Veyl, der Schattenfuerst
  b34: "meister-koloss",         // X    Brakk, der Koloss
  b35: "meister-asra",           // XI   Asra, die Erzfeindin
  b36: "meister-osric",          // XII  Osric, der Grossmeister
  b37: "meister-morwen",         // Mitte VIII  Morwen, die Rabenmutter - Glockenturm
  b38: "meister-hueter",         // VI   Thalor, der Hueter
};

/* Die Bestien, nach dem, was sie sind:
   Brut - Getier, Nester, Chitin. Untot - Nebel, Graeber, fahles Licht.
   Gesindel - Gassen, Rauch, Diebesgut. Gemaeuer - Stein, Wehrgang, Fallgitter. */
export const MONSTER_GRUPPE = {
  b03: "brut", b09: "brut", b22: "brut", b15: "brut", b02: "brut", // Brutmutter, Skorpion, Zerreisser, Sturmklaue, Hetzer (v1.33.0)
  b07: "untot", b11: "untot", b21: "untot",                    // Geist, Fluesterin, Wandlerin
  b04: "gesindel", b05: "gesindel", b13: "gesindel",            // Schleicher, Streuner, Brandstifter
  b01: "gemaeuer", b06: "gemaeuer",                             // Waechter, Bollwerk
  /* v1.91.0: die zehn frueheren Grossmeister und die fuenf neuen Bestien */
  b12: "gesindel", b17: "gesindel", b08: "gemaeuer", b18: "gemaeuer", b14: "gemaeuer", b25: "gemaeuer",
  b16: "brut", b20: "brut", b23: "brut", b19: "untot",
  b39: "brut", b41: "brut", b43: "gesindel", b40: "untot", b42: "untot",
};
/* v1.91.0 (Besitzer 6.10.2026: "die Hintergruende bei den Bestien duerfen
   schon auch noch ein bisschen variieren"): fuenf fruehere Grossmeister
   behalten als Bestie die Kulisse, die fuer sie gemalt wurde. */
export const EIGENE_KULISSE = {
  b12: "meister-richter", b08: "meister-kanonier", b16: "meister-blutmagd", b17: "meister-lanzenmeister", b18: "meister-eisenfaust",
};

/* Liefert den Kulissennamen (ohne Endung) oder null, wenn es keine gibt. */
export function kulisseFuer({ charId = null, bossId = null } = {}) {
  if (bossId) {
    if (MEISTER_KULISSE[bossId]) return MEISTER_KULISSE[bossId];
    if (EIGENE_KULISSE[bossId]) return EIGENE_KULISSE[bossId];
    if (MONSTER_GRUPPE[bossId]) return `monster-${MONSTER_GRUPPE[bossId]}`;
    return null;
  }
  if (charId === "dragon") return "drache";
  /* v1.14.2: Bauer und Gambit haben keinen Bund, aber jetzt eigene Kulissen -
     der Besitzer hat sie nachgeliefert (Acker mit Feldrain, Wegkreuz mit
     Laterne). Damit traegt jede Figur im Hofstaat ein Bild. */
  if (charId === "pawn") return "figur-bauer";
  if (charId === "gambit") return "figur-gambit";
  const bund = charId ? bundVon(charId) : null;
  return bund ? `bund-${bund}` : null;
}

/* Fuer die Probe: jeder Grossmeister aus LEAGUE_BOSSES hat einen Eintrag. */
export const GROSSMEISTER_IDS = LEAGUE_BOSSES;

/* ── DIE FORM DES STUFEN-ABZEICHENS (v1.21.0) ─────────────────────────────────
   Nach dem Wesen des Bundes: Medaillon fuer den Hof und die, die ein Kapitel
   halten; Schild fuer Kaempfer und Mauer; Banner fuer Rat, Weg und See -
   das Gesindel klaut sie; Siegel fuer das Arkane und das, was nicht
   menschlich ist. */
const FORM_BUND = { krone: "medaillon", nachtwache: "medaillon", geleit: "schild", schildwacht: "schild", sturm: "schild",
  konzil: "banner", faehrte: "banner", gezeiten: "banner", schatten: "siegel", bannkreis: "siegel",
  /* v1.91.0: Buerger tragen das Medaillon, Streiter den Schild, Jagd und Kontor das Banner, das Finstere das Siegel */
  dorf: "medaillon", kueche: "medaillon", kloster: "medaillon", werkstatt: "schild", turnier: "schild",
  kontor: "banner", jagd: "banner", finsternis: "siegel" };
const FORM_GRUPPE = { gemaeuer: "schild", gesindel: "banner", brut: "siegel", untot: "siegel" };
export function formFuer({ charId = null, bossId = null } = {}) {
  if (bossId) return MEISTER_KULISSE[bossId] ? "medaillon" : FORM_GRUPPE[MONSTER_GRUPPE[bossId]] || "siegel";
  if (charId === "dragon") return "siegel";
  const bund = charId ? bundVon(charId) : null;
  return (bund && FORM_BUND[bund]) || "medaillon";   // Bauer, Gambit: Medaillon
}
