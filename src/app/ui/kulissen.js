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
  b12: "meister-richter",       // I    Der Richter
  b10: "meister-doppelritter",  // II   Doppelritter
  b02: "meister-hetzer",        // III  Der Hetzer
  b19: "meister-schattenfuerst",// IV   Schattenfuerst
  b20: "meister-hueter",        // V    Der Hueter
  b16: "meister-blutmagd",      // VI   Die Blutmagd
  b17: "meister-lanzenmeister", // VII  Lanzenmeister
  b18: "meister-eisenfaust",    // VIII Eisenfaust
  b08: "meister-kanonier",      // IX   Kanonier
  b14: "meister-koloss",        // X    Der Koloss
  b23: "meister-asra",          // XI   Asra, die Erzfeindin
  b25: "meister-osric",         // XII  Osric, der Grossmeister
};

/* Die dreizehn uebrigen Monster, nach dem, was sie sind:
   Brut - Getier, Nester, Chitin. Untot - Nebel, Graeber, fahles Licht.
   Gesindel - Gassen, Rauch, Diebesgut. Gemaeuer - Stein, Wehrgang, Fallgitter. */
export const MONSTER_GRUPPE = {
  b03: "brut", b09: "brut", b22: "brut", b15: "brut",           // Brutmutter, Skorpion, Zerreisser, Sturmklaue
  b07: "untot", b11: "untot", b21: "untot", b24: "untot",       // Geist, Fluesterin, Wandlerin, Seuchenkoenig
  b04: "gesindel", b05: "gesindel", b13: "gesindel",            // Schleicher, Streuner, Brandstifter
  b01: "gemaeuer", b06: "gemaeuer",                             // Waechter, Bollwerk
};

/* Liefert den Kulissennamen (ohne Endung) oder null, wenn es keine gibt. */
export function kulisseFuer({ charId = null, bossId = null } = {}) {
  if (bossId) {
    if (MEISTER_KULISSE[bossId]) return MEISTER_KULISSE[bossId];
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
