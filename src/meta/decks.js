/* ── DECKS: DREI AUFSTELLUNGEN JE BRETT UND REGELWERK (v1.15.0) ──────────────
   Uebergabe, Punkt 3: "Drei gespeicherte Aufstellungen je Spieler,
   'Aufstellung I-III', umbenennbar."

   DER TRICK IST DER SPIEGEL. Alles, was bisher eine Aufstellung las - Armee
   bauen (buildArmyForMap), Vorausschau (hasForesight), der Editor, die
   Aufloesung nach einem Verrat - liest profile.loadout.formations[key]. Das
   bleibt so. Die drei Faecher liegen daneben unter profile.loadout.decks[key],
   und das AKTIVE Fach wird nach formations[key] gespiegelt. Ein leeres
   aktives Fach spiegelt nichts: dann greift die Werksaufstellung der Karte,
   wie bisher ohne gespeicherten Plan.

   ALTE SPIELSTAENDE: liegt formations[key] ohne decks[key] vor, ist das Fach
   I mit genau dieser Aufstellung. Nichts geht verloren, nichts wird
   umgeschrieben, bis der Spieler zum ersten Mal wechselt oder speichert.

   Alle Funktionen sind rein: sie geben ein neues Profil zurueck und fassen
   das alte nicht an (test_decks.mjs prueft das). */

export const DECK_ANZAHL = 3;
const NAME_MAX = 24;
const ROEMISCH = ["I", "II", "III"];

const leer = () => ({ aktiv: 0, liste: [null, null, null] });

/** Der Stand der drei Faecher fuer einen Schluessel (formationKey), mit der
 *  Wanderung alter Spielstaende: eine Aufstellung ohne Decks wird Fach I. */
export function deckStand(profile, key) {
  const decks = profile?.loadout?.decks || {};
  const d = decks[key];
  if (d && Array.isArray(d.liste)) {
    const liste = [0, 1, 2].map((i) => (d.liste[i] && typeof d.liste[i] === "object") ? d.liste[i] : null);
    const aktiv = Number.isInteger(d.aktiv) && d.aktiv >= 0 && d.aktiv < DECK_ANZAHL ? d.aktiv : 0;
    return { aktiv, liste };
  }
  const alt = profile?.loadout?.formations?.[key];
  if (Array.isArray(alt)) return { aktiv: 0, liste: [{ formation: alt }, null, null] };
  return leer();
}

/** Der Anzeigename eines Fachs - der eigene, sonst "Aufstellung I". */
export function deckName(profile, key, index, en = false) {
  const s = deckStand(profile, key);
  const eigener = s.liste[index]?.name;
  if (typeof eigener === "string" && eigener.trim()) return eigener;
  return `${en ? "Formation" : "Aufstellung"} ${ROEMISCH[index] || index + 1}`;
}

/* Schreibt einen Stand zurueck und spiegelt das aktive Fach. */
function schreibe(profile, key, stand) {
  const lo = profile.loadout || {};
  const decks = { ...(lo.decks || {}), [key]: stand };
  const formations = { ...(lo.formations || {}) };
  const aktiv = stand.liste[stand.aktiv];
  if (aktiv && Array.isArray(aktiv.formation)) formations[key] = aktiv.formation;
  else delete formations[key];
  return { ...profile, loadout: { ...lo, decks, formations } };
}

/** Wechselt das aktive Fach. Ein Index ausserhalb wird abgewiesen. */
export function mitAktivemDeck(profile, key, index) {
  if (!Number.isInteger(index) || index < 0 || index >= DECK_ANZAHL) return { ...profile };
  const s = deckStand(profile, key);
  return schreibe(profile, key, { aktiv: index, liste: s.liste.map((d) => (d ? { ...d } : null)) });
}

/** Benennt ein Fach um. Leer heisst: zurueck zum Standardnamen. */
export function mitDeckName(profile, key, index, name) {
  if (!Number.isInteger(index) || index < 0 || index >= DECK_ANZAHL) return { ...profile };
  const s = deckStand(profile, key);
  const sauber = String(name || "").trim().slice(0, NAME_MAX);
  const liste = s.liste.map((d, i) => {
    if (i !== index) return d ? { ...d } : null;
    const alt = d ? { ...d } : {};
    if (sauber) alt.name = sauber; else delete alt.name;
    return Object.keys(alt).length ? alt : null;
  });
  return schreibe(profile, key, { aktiv: s.aktiv, liste });
}

/** Speichert eine Aufstellung ins aktive Fach - und spiegelt sie. */
export function mitAufstellung(profile, key, formation) {
  const s = deckStand(profile, key);
  const liste = s.liste.map((d, i) => (i === s.aktiv ? { ...(d || {}), formation } : d ? { ...d } : null));
  return schreibe(profile, key, { aktiv: s.aktiv, liste });
}
