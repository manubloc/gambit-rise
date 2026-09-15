/* ── DECKS: DREI AUFSTELLUNGEN JE SPIELER (v1.15.0) ──────────────────────────
   Uebergabe, offener Punkt 3: "Drei gespeicherte Aufstellungen je Spieler,
   'Aufstellung I-III', umbenennbar." Je Brett und Regelwerk (derselbe
   Schluessel wie bisher, formationKey) gibt es drei Faecher; eines ist
   aktiv. Alles, was bisher profile.loadout.formations[key] las - Armee bauen,
   Vorausschau, Editor - liest weiter genau dort: das aktive Deck wird dorthin
   GESPIEGELT. So bricht kein alter Spielstand und kein alter Aufruf.

   Die Proben standen vor dem Code; beim ersten Lauf fehlte das Modul. */
let passed = 0, failed = 0;
const ok = (name, cond) => { if (cond) { passed++; console.log(`ok - ${name}`); } else { failed++; console.log(`FAIL - ${name}`); } };

const D = await import("./src/meta/decks.js").catch(() => null);
const { defaultProfile } = await import("./src/meta/index.js");
const { formationKey } = await import("./src/meta/leveling.js");

console.log("\n== DAS MODUL ==");
ok("src/meta/decks.js existiert", !!D);
if (!D) { console.log(`\nRESULT: ${passed} passed, ${failed} failed`); process.exit(1); }
const { DECK_ANZAHL, deckStand, deckName, mitAktivemDeck, mitDeckName, mitAufstellung } = D;
ok("es gibt genau drei Faecher", DECK_ANZAHL === 3);

const key = formationKey("arena", "hp");
const A = ["a1"], B = ["b1"], C = ["c1"];

console.log("\n== EIN FRISCHES PROFIL ==");
{
  const p = defaultProfile();
  const s = deckStand(p, key);
  ok("Fach I ist aktiv", s.aktiv === 0);
  ok("alle drei Faecher sind leer", s.liste.length === 3 && s.liste.every((d) => d === null));
  ok("die Faecher heissen Aufstellung I, II, III", deckName(p, key, 0, false) === "Aufstellung I"
    && deckName(p, key, 1, false) === "Aufstellung II" && deckName(p, key, 2, false) === "Aufstellung III");
  ok("und auf Englisch Formation I", deckName(p, key, 0, true) === "Formation I");
}

console.log("\n== ALTE SPIELSTAENDE ==");
{
  /* v1.0.20 bis v1.14.x: nur formations[key]. Das wird zu Fach I. */
  const p = defaultProfile();
  p.loadout.formations[key] = A;
  const s = deckStand(p, key);
  ok("eine alte Aufstellung liegt in Fach I", JSON.stringify(s.liste[0]?.formation) === JSON.stringify(A));
  ok("Fach I ist aktiv, II und III leer", s.aktiv === 0 && s.liste[1] === null && s.liste[2] === null);
}

console.log("\n== SPEICHERN, WECHSELN, SPIEGELN ==");
{
  let p = defaultProfile();
  p = mitAufstellung(p, key, A);
  ok("Speichern legt die Aufstellung ins aktive Fach", JSON.stringify(deckStand(p, key).liste[0].formation) === JSON.stringify(A));
  ok("und spiegelt sie nach formations[key] - der alte Leseweg bleibt gueltig",
    JSON.stringify(p.loadout.formations[key]) === JSON.stringify(A));
  p = mitAktivemDeck(p, key, 1);
  ok("Wechsel auf Fach II", deckStand(p, key).aktiv === 1);
  ok("ein leeres Fach spiegelt NICHTS - die Karte faellt auf ihre Werksaufstellung",
    p.loadout.formations[key] === undefined);
  p = mitAufstellung(p, key, B);
  ok("Fach II traegt jetzt B", JSON.stringify(deckStand(p, key).liste[1].formation) === JSON.stringify(B));
  ok("Fach I hat weiter A", JSON.stringify(deckStand(p, key).liste[0].formation) === JSON.stringify(A));
  p = mitAktivemDeck(p, key, 0);
  ok("zurueck auf I: der Spiegel zeigt wieder A", JSON.stringify(p.loadout.formations[key]) === JSON.stringify(A));
  p = mitAktivemDeck(p, key, 2); p = mitAufstellung(p, key, C);
  ok("alle drei belegt", deckStand(p, key).liste.every((d) => d && d.formation));
  ok("ein Index ausserhalb wird abgewiesen", deckStand(mitAktivemDeck(p, key, 7), key).aktiv === 2
    && deckStand(mitAktivemDeck(p, key, -1), key).aktiv === 2);
  /* ein anderes Brett hat seine eigenen Faecher */
  const key2 = formationKey("classic", "chess");
  ok("ein anderes Brett/Regelwerk ist unberuehrt", deckStand(p, key2).liste.every((d) => d === null) && deckStand(p, key2).aktiv === 0);
  ok("das Profil wird nicht an Ort und Stelle veraendert (neues Objekt je Schritt)",
    mitAktivemDeck(p, key, 1) !== p && deckStand(p, key).aktiv === 2);
}

console.log("\n== UMBENENNEN ==");
{
  let p = defaultProfile();
  p = mitDeckName(p, key, 1, "Sturmlauf");
  ok("Fach II heisst jetzt Sturmlauf", deckName(p, key, 1, false) === "Sturmlauf" && deckName(p, key, 1, true) === "Sturmlauf");
  ok("Fach I behaelt seinen Standardnamen", deckName(p, key, 0, false) === "Aufstellung I");
  p = mitDeckName(p, key, 1, "   ");
  ok("ein leerer Name faellt auf den Standard zurueck", deckName(p, key, 1, false) === "Aufstellung II");
  p = mitDeckName(p, key, 1, "x".repeat(80));
  ok("ein Name wird auf 24 Zeichen gekuerzt", deckName(p, key, 1, false).length === 24);
  ok("Umbenennen laesst die Aufstellung in Ruhe", deckStand(p, key).liste[1] === null || deckStand(p, key).liste[1].formation === undefined);
}

console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
