// ── THE LIVERY ──────────────────────────────────────────────────────────────
// One switch dresses the whole app: CLASSIC (the deep-navy night with its
// original paintings) or CARVED (the painted-stone world of the new piece set).
// Both liveries ship complete — the classic files were restored from history
// byte for byte, so choosing classic is really the old app, not a repaint.
//
// WHO DECIDES. The design is GLOBAL: `APP_DESIGN` in config.js is what every
// player gets, and shipping a change of it is a one-line deploy. A signed-in
// ADMIN can override it live from the profile workbench to preview either
// livery; ordinary players have no design setting at all — they only choose
// between "detailed" and "simple" pieces, and "detailed" silently follows the
// house design.
//
// Every asset with two faces lives here as a pair plus a getter. Components
// call the getter at render time; setLivery swaps palette (theme), insignia
// (live bindings) and piece gallery (paintedArt) in one stroke.
import { setDesign as setThemeDesign } from "./theme.js";
import { applyInsigniaDesign } from "./assets/icons/iconAssets.js";
import { setPieceStyle } from "./board/paintedArt.js";
import { APP_DESIGN, HALL_HTTP } from "../config.js";

import hallK from "./assets/bg-hall.carved.webp";
import frameK from "./assets/board-frame.carved.webp";
import shieldK from "./assets/shield-league.carved.webp";
import crest1K from "./assets/crest-1.carved.webp";
import crest2K from "./assets/crest-2.carved.webp";
import crest3K from "./assets/crest-3.carved.webp";
import logoK from "./assets/logo.carved.webp";
import logoMenuK from "./assets/logo-menu.carved.webp";
import emblemK from "./assets/emblem.carved.webp";
import emblemRiss from "./assets/emblem-riss.webp";

import g01K from "./assets/ground-01.carved.webp";
import g02K from "./assets/ground-02.carved.webp";
import g03K from "./assets/ground-03.carved.webp";
import g04K from "./assets/ground-04.carved.webp";
import g05K from "./assets/ground-05.carved.webp";
import g06K from "./assets/ground-06.carved.webp";
import g07K from "./assets/ground-07.carved.webp";
import g08K from "./assets/ground-08.carved.webp";
import g09K from "./assets/ground-09.carved.webp";
import g10K from "./assets/ground-10.carved.webp";

/* ── EINE LIVREE (v1.1.0, Besitzerentscheid) ────────────────────────────────
   "Ich moechte eigentlich nur das geschnitzt-helle Design bei dem App-Design.
   Das andere kannst du alles loeschen. Ich moechte die App jetzt mal
   glattziehen, ich will sie demnaechst live bringen."

   DAS HAUS TRAEGT GESCHNITZT HELL, PUNKT. Vorher war die Livree veraenderlich:
   APP_DESIGN gab den Grundton, ein Wert im Geraetespeicher (gg-house-design)
   durfte ihn ueberschreiben, und die Halle konnte ihn per Abfrage umstellen.
   Genau daran hing der falsche Hintergrund, den der Besitzer zweimal gemeldet
   hat: stand im Speicher noch "classic", lieferte bgHall() die dunkle
   Fassung - auf einem Geraet, das nie wieder umgestellt wurde, fuer immer.
   Jetzt ist DESIGN eine Konstante. Der alte Speicherwert wird beim Start
   GELOESCHT, damit kein Geraet an ihm haengen bleibt.

   Die klassischen Bilddateien bleiben vorerst im Baum - sie kosten nichts,
   weil sie niemand mehr importiert, und ein zweiter Durchgang kann sie in
   Ruhe raeumen. Was WEG ist, ist die Wahl. */
const CACHE_KEY = "gg-house-design";
try { localStorage.removeItem(CACHE_KEY); } catch {}
const DESIGN = "carved";

/** Bleibt als Eingang erhalten, damit die Aufrufer unveraendert bleiben -
 *  aber die Livree steht fest und laesst sich nicht mehr umstellen. */
export function setLivery() {
  setThemeDesign(DESIGN);
  applyInsigniaDesign(DESIGN);
  setPieceStyle(DESIGN);
}
export const livery = () => DESIGN;

/** Ask the Hall which livery the house wears; falls back silently offline.
 *  Returns the design so App.jsx can re-render when the answer differs. */
export async function fetchHouseDesign() {
  /* v1.1.0: die Halle entscheidet die Livree nicht mehr. Die Funktion bleibt,
     damit App.jsx unveraendert bleibt, und antwortet immer mit der einen
     Livree - so kann kein Server ein Geraet umfaerben. */
  return DESIGN;
}


/** The admin's hand on the house switch: persists in the Hall for everyone. */
export async function setHouseDesign(design, token) {
  const r = await fetch(HALL_HTTP + "/design", { method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ design, token }) });
  if (!r.ok) throw new Error("unauthorized");
  try { localStorage.setItem(CACHE_KEY, design); } catch {}
  return design;
}
export const bgHall = () => hallK;
export const boardFrame = () => frameK;
export const leagueShield = () => shieldK;
export const crestArt = (n) => [crest1K, crest2K, crest3K][n - 1] || null;

// Das Wappen ist seit v0.36 der RISS IM GOLDRING - dasselbe Zeichen, das als
// App-Symbol und Favicon steht. Es gilt in beiden Livreen.
export const emblemArt = () => emblemRiss;
// Seit v0.36.1 traegt der Eingang das INTROBILD - der Riss oeffnet sich, und
// die Wortmarke steht darunter. Es gilt in beiden Livreen.
import introUrl from "./assets/intro-riss.webp";
export const logoArt = () => introUrl;
export const logoMenuArt = () => logoMenuK;

import g11K from "./assets/ground-11.carved.webp";
import g12K from "./assets/ground-12.carved.webp";
// Die Boeden 7/8/9 drehen mit der Weltdrehung: Sattelweite (VII) spielt auf
// dem alten Steppenboden, Aschgrund (VIII) auf dem Canyonboden, Die Wunde (IX)
// auf dem Oedlandboden. 11 und 12 sind beruhigte Ausschnitte der Kapitelkarten.
const GROUNDS_K = { 1: g01K, 2: g02K, 3: g03K, 4: g04K, 5: g05K, 6: g06K, 7: g08K, 8: g09K, 9: g07K, 10: g10K, 11: g11K, 12: g12K };
export const groundArt = (league) => GROUNDS_K[league] || null;

/* ── DER RISSBODEN (v1.23.7) ──────────────────────────────────────────────
   Besitzer, zum wiederholten Mal und diesmal mit Bild: "Mach mal den beigen
   Hintergrund weg. Dahinter sieht man den Hintergrund, der es sein sollte,
   sowie die anderen, die abhaengig davon kommen, wo man in der Kampagne ist."

   GEFUNDEN: die Bilder, die er meint, heissen riss-01 bis riss-10 - das
   Schachbrett unten, oben Schwarz, und der Riss waechst von einem Glimmen
   (01) bis zur klaffenden Spalte (10). Sie liegen seit jeher im Baum und
   werden vom Vorlader bei JEDEM Start geladen - gezeigt hat sie nie jemand.
   Das Menue trug stattdessen seit v1.9.1 die Kapitelboeden ground-01..12,
   und das sind Gelaendekacheln der Weltkarte: Wiese, Acker, Wald, Sand. Daher
   das Beige.

   Zehn Bilder auf zwoelf Kapitel: die letzten drei Kapitel teilen sich den
   weitesten Riss - weiter aufreissen kann er nicht. */
import r01 from "./assets/riss/riss-01.webp";
import r02 from "./assets/riss/riss-02.webp";
import r03 from "./assets/riss/riss-03.webp";
import r04 from "./assets/riss/riss-04.webp";
import r05 from "./assets/riss/riss-05.webp";
import r06 from "./assets/riss/riss-06.webp";
import r07 from "./assets/riss/riss-07.webp";
import r08 from "./assets/riss/riss-08.webp";
import r09 from "./assets/riss/riss-09.webp";
import r10 from "./assets/riss/riss-10.webp";
const RISSE = [r01, r02, r03, r04, r05, r06, r07, r08, r09, r10];
export const rissBoden = (league) => RISSE[Math.min(RISSE.length, Math.max(1, league || 1)) - 1];
