// ── WAS SIEHT DER SPIELER IN KAPITEL I? (v1.0.42) ───────────────────────────
// Zwei Besitzerbefunde in einer Probe:
//
// 1. DREI SICHTBARKEITSSTUFEN. hpOnly war ein Schalter fuer zwei Zustaende,
//    aber es gibt drei. Vor dem Umbau waren 20 von 26 Faehigkeiten in
//    Kapitel I aktiv - darunter Scharfschuss und Dauerfeuer, die im Zug
//    dreifach verriegelt sind. Der Spieler sah also Faehigkeiten auf den
//    Karten, die er nicht benutzen konnte.
//
// 2. DIE STUFE DES ERWACHTEN. Bis v1.0.41 hob das Erwachen nur das BILD -
//    die Stufe blieb bei 1. Der Held soll sich auf dem Feld abheben, ohne
//    dass irgendwo eine Farbe verschoben wird.
//
// Diese Probe ZAEHLT ALLE 26 durch, statt Stichproben zu nehmen: genau so
// ist der alte Fehler entstanden.
import { ABILITIES, faehigkeitZustand, faehigkeitSichtbar, SPERRGRUND } from "./src/content/index.js";
import { defaultProfile, gambitStufe, gambitWach, GAMBIT_ERWACHT_AB,
  GAMBIT_ERWACHT_AUF_STUFE, characterLevel, resolveCharacter,
  FREIGABEN, darfHeldSetzen, darfReiheStellen, erklaertWas, naechsteErklaerung,
  merkeErklaert, merkschluessel, REIHE_FUENF, freigegeben } from "./src/meta/index.js";
import { CHARACTERS } from "./src/content/index.js";

let pass = 0, fail = 0;
const ok = (was, bed) => {
  if (bed) { pass++; console.log("  ok  - " + was); }
  else { fail++; console.log("  FAIL- " + was); }
};

const alle = Object.keys(ABILITIES);
const zustand = (wach) => {
  const z = { wirkt: [], riegel: [], verborgen: [] };
  for (const id of alle) z[faehigkeitZustand(id, wach)].push(id);
  return z;
};

console.log("\n── DIE DREI STUFEN ──");
const vor = zustand(false), nach = zustand(true);

ok("jede der " + alle.length + " Faehigkeiten hat genau einen Zustand",
  vor.wirkt.length + vor.riegel.length + vor.verborgen.length === alle.length);

// KEIN LEERER TOPF: waere einer leer, haette der Umbau nichts getrennt und
// die Probe wuerde trotzdem gruen leuchten. Genau diese Sorte blinde Probe
// hat in diesem Haus schon genug Zeit gekostet.
ok("alle drei Toepfe sind besetzt - die Trennung greift wirklich",
  vor.wirkt.length > 0 && vor.riegel.length > 0 && vor.verborgen.length > 0);

// GANGARTEN WIRKEN SOFORT. Sie brauchen keine Lebenspunkte, sie aendern nur,
// wie eine Figur zieht - der Besitzer hat ausdruecklich darauf bestanden.
const gangarten = alle.filter((id) => ABILITIES[id].tag === "move");
ok("alle " + gangarten.length + " Gangarten wirken schon in Kapitel I",
  gangarten.every((id) => faehigkeitZustand(id, false) === "wirkt"));

// REICHWEITEN-KUENSTE SIND VERRIEGELT, ABER SICHTBAR. Im Zug sind sie
// dreifach gesperrt; sie zu VERSTECKEN waere falsch - der Spieler soll
// wissen, dass es sie gibt und warum sie ruhen.
const fern = alle.filter((id) => ABILITIES[id].tag === "ranged");
ok("die " + fern.length + " Reichweiten-Kuenste sind in Kapitel I verriegelt",
  fern.every((id) => faehigkeitZustand(id, false) === "riegel"));
ok("...aber sie bleiben SICHTBAR - der Spieler weiss, dass es sie gibt",
  fern.every((id) => faehigkeitSichtbar(id, false)));

// WAS LEBENSPUNKTE BRAUCHT, EXISTIERT VOR DEM ERWACHEN NICHT.
const hp = alle.filter((id) => ABILITIES[id].hpOnly);
ok("alle " + hp.length + " HP-Talente sind vor dem Erwachen verborgen",
  hp.every((id) => faehigkeitZustand(id, false) === "verborgen"));
ok("...und nichts anderes ist verborgen",
  vor.verborgen.length === hp.length);
ok("verborgen heisst wirklich unsichtbar",
  hp.every((id) => !faehigkeitSichtbar(id, false)));

// NACH DEM ERWACHEN FAELLT JEDE SPERRE.
ok("nach dem Erwachen wirkt jede der " + alle.length + " Faehigkeiten",
  nach.wirkt.length === alle.length);

// JEDE SPERRE MUSS SICH ERKLAEREN KOENNEN.
ok("fuer jede Sperrart steht ein Grund bereit, deutsch und englisch",
  ["riegel", "verborgen"].every((k) => SPERRGRUND[k] && SPERRGRUND[k].de && SPERRGRUND[k].en));

// KEINE VERWAISTEN MARKEN: ein Tippfehler in sperre: waere sonst stumm.
ok("keine Faehigkeit traegt eine unbekannte Sperrart",
  alle.every((id) => !ABILITIES[id].sperre || SPERRGRUND[ABILITIES[id].sperre]));

console.log("     Kapitel I: " + vor.wirkt.length + " wirken, "
  + vor.riegel.length + " verriegelt, " + vor.verborgen.length + " verborgen");

console.log("\n── DIE STUFE DES ERWACHTEN ──");
const frisch = defaultProfile();
frisch.campaign = { ...(frisch.campaign || {}), cleared: [] };
const erwacht = defaultProfile();
erwacht.campaign = { ...(erwacht.campaign || {}), cleared:
  Array.from({ length: GAMBIT_ERWACHT_AB }, (_, i) => "st" + i) };

/* v1.34.0 (Besitzer, loest v1.0.49 ab): "Reihe 1 gewoehnliches Schach ohne
   Gambit; nach der ersten Partie erwacht ein Bauer zum Gambit." */
ok("die Schwelle ist der erste Sieg", GAMBIT_ERWACHT_AB === 1);
ok("in der ersten Partie ist der Held noch nicht da", !gambitWach(frisch));
ok("nach dem ersten Sieg ist er da", gambitWach(erwacht));
ok("er steht beim Erwachen auf Stufe " + GAMBIT_ERWACHT_AUF_STUFE, gambitStufe(erwacht) === GAMBIT_ERWACHT_AUF_STUFE);

// DER SPRUNG IST EINE UNTERGRENZE, KEINE FESTSETZUNG: wer sich schon
// hochgearbeitet hat, faellt nicht auf 2 zurueck.
const weit = defaultProfile();
weit.campaign = { ...(weit.campaign || {}), cleared: erwacht.campaign.cleared };
weit.pieces = { ...(weit.pieces || {}), levels: { ...(weit.pieces?.levels || {}), gambit: 7 } };
ok("ein weiter gestiegener Held faellt NICHT auf die Startstufe zurueck",
  gambitStufe(weit) === 7 && characterLevel(weit, "gambit") === 7);

console.log("\n── DIE ERSTE FAEHIGKEIT ──");
// Der Besitzer will, dass man den Bruch SIEHT, nicht nur am Bild: der
// Erwachte schlaegt geradeaus, was kein Bauer darf. Also muss die Sprosse,
// auf die das Erwachen hebt, eine FAEHIGKEIT tragen - kein Schild.
const sprosse2 = CHARACTERS.gambit.ladder.find((r) => r.level === GAMBIT_ERWACHT_AUF_STUFE);
ok("die Sprosse des Erwachens traegt eine Faehigkeit, kein Schild",
  !!sprosse2 && !!sprosse2.ability);
ok("und zwar den Vorwaertsschlag - das eine, was ein Bauer nie darf",
  sprosse2.ability === "pawn_forward_capture");
const beimErwachen = resolveCharacter(CHARACTERS.gambit, GAMBIT_ERWACHT_AUF_STUFE, null);
ok("der Erwachte traegt sie auch wirklich im Heer",
  (beimErwachen.abilities || []).includes("pawn_forward_capture"));

console.log("\n── DIE FREISCHALT-ORDNUNG ──");
const zu = defaultProfile();
zu.campaign = { ...(zu.campaign || {}), cleared: [] };
/* Die Heldenspalte geht mit dem Helden auf - nach dem ersten Sieg. Die HINTERE
   REIHE haengt seit v1.34.0 an Liga 1, Reihe 5 des Hauptstrangs. */
ok("vor dem ersten Sieg ist die Heldenspalte zu", !darfHeldSetzen(zu));
ok("in Kapitel I ist die hintere Reihe zu", !darfReiheStellen(zu));

ok("mit dem Erwachen geht die Heldenspalte auf", darfHeldSetzen(erwacht));
ok("die hintere Reihe bleibt trotzdem zu", !darfReiheStellen(erwacht));

// v1.34.0: DIE REIHE IST DIE BELOHNUNG VON LIGA 1, REIHE 5 DES HAUPTSTRANGS -
// irgendeine der drei Stationen genuegt (Besitzer 22.9.). Eine Figur allein
// oeffnet sie nicht mehr.
ok("Reihe 5 hat drei Hauptstrang-Stationen", REIHE_FUENF.length === 3);
const mitFigur = { ...erwacht, campaign: { ...erwacht.campaign, unlocked: ["archbishop"] } };
ok("eine beigetretene Figur allein oeffnet die Reihe nicht", !darfReiheStellen(mitFigur));
ok("jede der drei Stationen oeffnet sie", REIHE_FUENF.every((id) =>
  darfReiheStellen({ ...erwacht, campaign: { ...erwacht.campaign, cleared: [...erwacht.campaign.cleared, id] } })));

// JEDE FREIGABE ERKLAERT SICH EINMAL - und dann nie wieder.
const offen = erklaertWas(erwacht);
ok("beim Erwachen wartet genau eine Erklaerung", offen.length === 1 && offen[0].id === "held");
ok("jede Freigabe bringt Titel und Text in beiden Sprachen mit",
  FREIGABEN.every((f) => f.titelDe && f.titelEn && f.textDe && f.textEn));
const gemerkt = merkeErklaert(erwacht, "held");
ok("nach dem Erklaeren schweigt sie", !erklaertWas(gemerkt).some((f) => f.id === "held"));
ok("das Merken laesst den alten Spielstand unberuehrt",
  !(erwacht.notices && erwacht.notices[merkschluessel("held")]));

// DERSELBE TOPF WIE DIE LEHRSTUNDEN. Ein zweiter Merker daneben waere eine
// zweite Wahrheit - und faellt erst auf, wenn ein alter Spielstand auftaucht.
ok("der Merker liegt in profile.notices, wo auch die Lehrstunden liegen",
  !!gemerkt.notices && !!gemerkt.notices[merkschluessel("held")]);
ok("und traegt sein eigenes Praefix, damit nichts kollidiert",
  merkschluessel("held").startsWith("frei:"));

// GEHEN ZWEI ZUGLEICH AUF, KOMMT DIE FRUEHERE ZUERST - sonst stuenden zwei
// Fenster uebereinander oder eines ginge stumm verloren.
/* v1.34.0: die hintere Reihe oeffnet jetzt Reihe 5, nicht mehr eine Figur */
const zweiZugleich = { ...erwacht, campaign: { ...erwacht.campaign, cleared: [...erwacht.campaign.cleared, REIHE_FUENF[0]] } };
const reihenfolge = erklaertWas(zweiZugleich).map((f) => f.id);
ok("mehrere offene Freigaben kommen in der Ordnung der Liste",
  reihenfolge.length >= 2 && reihenfolge[0] === "held");
ok("naechsteErklaerung liefert genau die erste davon",
  naechsteErklaerung(zweiZugleich).id === reihenfolge[0]);
// Bei "zu" ist die Held-Freigabe jetzt offen und ungelesen - also NICHT null.
ok("ist nichts mehr offen, meldet sie null",
  naechsteErklaerung(merkeErklaert(merkeErklaert(zu, "held"), "hinterereihe")) === null);

// ── GOLD OEFFNET MAEULER ERST NACH DEM ERSTEN SIEG (v1.0.50) ───────────────
// Bestechen stand von Anfang an im Monsterbaum - ein Raetsel fuer jeden, der
// noch nie ein Monster gesehen hat. Jetzt ist es eine Freigabe: sie oeffnet
// mit dem ersten BESIEGTEN echten Monster (codex.beaten, geschrieben im
// GameScreen beim Sieg; pb_-Meister zaehlen nicht).
{
  const leer = defaultProfile();
  ok("bestechen ist anfangs zu", !freigegeben(leer, "bestechen"));
  const danach = { ...leer, codex: { beaten: ["b02"] } };
  ok("der erste Monstersieg oeffnet es", freigegeben(danach, "bestechen"));
  const f = FREIGABEN.find((x) => x.id === "bestechen");
  ok("und es traegt Titel und Erklaerung in beiden Sprachen",
    !!f && !!f.titelDe && !!f.titelEn && f.textDe.length > 60 && f.textEn.length > 60);
  ok("die Ordnung selbst: held, hinterereihe, bestechen, leben",
    FREIGABEN.map((x) => x.id).join(",") === "held,hinterereihe,bestechen,leben");
}

console.log("\n── STURMLAUF: DAS GESCHENK DES ERWACHENS (v1.34.0) ──");
{
  const { ABILITIES, maxStufe, stufenText } = await import("./src/content/abilities.js");
  const { pieceMoves } = await import("./src/core/rules/moves.js");
  const { canUnlockAbility, canUpgradeAbility, upgradeAbility } = await import("./src/meta/leveling.js");
  const { parseSave, serializeSave } = await import("./src/meta/profile.js");
  const sprosse = CHARACTERS.gambit.ladder.find((e) => e.ability === "pawn_charge");
  ok("Sturmlauf steht beim Gambit als GESCHENKTE Sprosse auf Stufe 1", sprosse && sprosse.level === 1 && sprosse.geschenkt === true);
  ok("... der Gambit traegt hoechstens fuenf Faehigkeiten", CHARACTERS.gambit.ladder.filter((e) => e.ability).length <= 5);
  const wachProfil = { ...erwacht, sp: 50, pieces: { levels: { gambit: 2 } } };
  ok("... er traegt ihn beim Erwachen, ohne ihn gelernt zu haben",
    resolveCharacter(CHARACTERS.gambit, 2, []).abilities.includes("pawn_charge"));
  ok("... lernen laesst er sich nicht (er ist schon da, kostet nichts)", !canUnlockAbility(wachProfil, "gambit", "pawn_charge"));
  ok("... aufstufen schon: Stufe II ab Stufe 3", !canUpgradeAbility(wachProfil, "gambit", "pawn_charge")
    && canUpgradeAbility({ ...wachProfil, pieces: { levels: { gambit: 3 } } }, "gambit", "pawn_charge"));
  const st2 = upgradeAbility({ ...wachProfil, pieces: { levels: { gambit: 3 } } }, "gambit", "pawn_charge");
  ok("... und die Stufe wird gespeichert", st2.pieces.stufen.gambit.pawn_charge === 2 && st2.sp < 50);
  ok("Sturmlauf hat drei Stufen mit Text", maxStufe("pawn_charge") === 3 && /zwei/.test(stufenText("pawn_charge", 1)) && /vier/.test(stufenText("pawn_charge", 3)));
  // Reichweite im Kern: weisser Bauer auf e3 (Feld 20 bei 8x8), Weg frei
  const brett = (stufe, belegt = null) => {
    const board = Array(64).fill(null);
    board[20] = { id: "g", kind: "P", color: "w", abilities: ["pawn_charge"], stufen: { pawn_charge: stufe }, used: {} };
    if (belegt != null) board[belegt] = { id: "x", kind: "P", color: "b", abilities: [], used: {} };
    return { board, w: 8, h: 8, turn: "w", rules: "chess" };
  };
  const ziele = (st) => pieceMoves(st, 20).filter((m) => m.special === "rush").map((m) => m.to).sort((a, b) => a - b);
  ok("Stufe I: bis zu zwei Felder (e5)", JSON.stringify(ziele(brett(1))) === "[36]");
  ok("Stufe II: bis zu drei Felder (e5, e6)", JSON.stringify(ziele(brett(2))) === "[36,44]");
  ok("Stufe III: bis zu vier Felder (e5, e6, e7)", JSON.stringify(ziele(brett(3))) === "[36,44,52]");
  ok("der Weg muss frei sein: eine Figur auf e5 haelt ihn vor ihr an", ziele(brett(3, 36)).length === 0 && JSON.stringify(ziele(brett(3, 44))) === "[36]");
  const promo = brett(3); promo.board[20] = null; promo.board[36] = { id: "g", kind: "P", color: "w", abilities: ["pawn_charge"], stufen: { pawn_charge: 3 }, used: {} };
  const lauf = pieceMoves(promo, 36).filter((m) => m.special === "rush");
  ok("BEHOBEN: ein Lauf auf die letzte Reihe wandelt sich um", lauf.some((m) => m.to === 60 && m.promotion) && !lauf.some((m) => m.to > 63));
  // alte Staende: gelernt fuer Punkte -> Preis zurueck, Stufe bleibt
  const alt = { ...defaultProfile(), sp: 4, pieces: { levels: { gambit: 6 }, abilities: { gambit: ["pawn_forward_capture", "pawn_charge"] }, stufen: { gambit: { pawn_charge: 2 } } } };
  const neu = parseSave(serializeSave(alt));
  const { abilityCost } = await import("./src/meta/leveling.js");
  ok("Altstand: der frueher bezahlte Sturmlauf wird erstattet (Lernpreis der alten Sprosse 5)", neu.sp === 4 + abilityCost(5));
  ok("... er verlaesst die Lernliste, die anderen bleiben, die Aufstufung bleibt",
    JSON.stringify(neu.pieces.abilities.gambit) === '["pawn_forward_capture"]' && neu.pieces.stufen.gambit.pawn_charge === 2);
  ok("... und ein zweites Laden erstattet nichts mehr", parseSave(serializeSave(neu)).sp === neu.sp);
  const { buildArmyForMap } = await import("./src/meta/leveling.js");
  const { mapById } = await import("./src/content/maps.js");
  const imSchach = buildArmyForMap({ pieces: { levels: { gambit: 5 }, stufen: { gambit: { pawn_charge: 3 } } }, campaign: { cleared: ["L01s00"] } }, mapById("classic"), null, "chess");
  ok("auch im reinen Schach traegt der Gambit seine Stufen (vorher bezahlt und ohne Wirkung)", imSchach.hero && imSchach.hero.spec.stufen && imSchach.hero.spec.stufen.pawn_charge === 3);
}

console.log("\nRESULT: " + pass + " passed, " + fail + " failed");
if (fail) process.exit(1);
