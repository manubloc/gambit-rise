/* ── BALANCE-DURCHLAUF (v1.28.2) ─────────────────────────────────────────────
   Besitzer: "Keine Figur darf mehr als 60 % ihrer Duelle gewinnen."
   Ein Duell: zwei Heere, in allem gleich, bis auf EINEN Platz der Grundreihe -
   dort steht bei A die gepruefte Figur, bei B ein Gegner. Beide auf ihrer
   Hoechststufe, mit allen Faehigkeiten und jeder Zauberstufe am Anschlag (die
   staerkste Fassung, die ein Spieler bauen kann). Der Rest beider Heere: Stufe
   1, ohne Faehigkeiten. KI gegen KI, Farben abwechselnd. */
import { createGame, applyMove, status, makeRng } from "../src/core/index.js";
import { chooseMove } from "../src/ai/index.js";
import { CHARACTERS, CHARACTER_LIST, mapById } from "../src/content/index.js";
import { buildArmyFromFormation, maxLevelFor, BOSS_MAX_LEVEL } from "../src/meta/index.js";
import { bossById, BOSSES } from "../src/content/bosses.js";
import { maxStufe } from "../src/content/abilities.js";

const KARTE = mapById("classic");
const PLATZ = KARTE.defaultFormation.indexOf("queen");   // der Platz, um den es geht

export let STUFEN_AM_ANSCHLAG = true;
/* v1.28.3: auch ein MONSTER ("X:b01") steht auf dem Damenplatz - so, wie es
   der Spieler einsetzen darf: Hoechststufe 5, beide Faehigkeiten gelernt. */
/* In der Aufstellung heisst ein Monster "boss:b01", im Profil "X:b01" - beide
   Schreibweisen gibt es im Spiel; hier gilt die der Aufstellung. */
const istMonster = (id) => typeof id === "string" && id.startsWith("boss:");
const leiterAb = (id) => istMonster(id)
  ? (bossById(id.slice(5))?.ladder || []).filter((r) => r.ability).map((r) => r.ability)
  : (CHARACTERS[id]?.ladder || []).filter((r) => r.ability).map((r) => r.ability);
export function heer(figur) {
  const form = [...KARTE.defaultFormation]; form[PLATZ] = figur;
  return buildArmyFromFormation(
    (id) => (id === figur || (istMonster(figur) && id === "X:" + figur.slice(5)) ? (istMonster(figur) ? BOSS_MAX_LEVEL : maxLevelFor(id)) : 1), form,
    (id) => (id === figur || (istMonster(figur) && id === "X:" + figur.slice(5)) ? leiterAb(figur) : []), null,
    (id) => ((id === figur || (istMonster(figur) && id === "X:" + figur.slice(5))) && STUFEN_AM_ANSCHLAG ? Object.fromEntries(leiterAb(figur).map((a) => [a, maxStufe(a)])) : {}));
}


export function partie(weiss, schwarz, keim, tiefe = 1, maxZuege = 160) {
  let g = createGame(heer(weiss), heer(schwarz), { rules: "hp", map: KARTE, seed: keim });
  const r = makeRng(keim);   /* Zufall mit Keim - jede Partie ist wiederholbar */
  for (let n = 0; n < maxZuege; n++) {
    const st = status(g);
    if (st.over) { partie.zuege = n; return st.winner || null; }
    const m = chooseMove(g, tiefe, r);
    if (!m) { partie.zuege = n; return null; }
    g = applyMove(g, m);
  }
  partie.zuege = maxZuege; return null;   // zu lang: unentschieden
}

if (process.argv[2] === "zeit") {
  const t = Date.now(); const w = partie("knight", "bishop", 7); console.log("eine Partie:", Date.now() - t, "ms, Sieger:", w);
}

if (process.argv[2] === "probe") {
  const { CHARACTER_LIST } = await import("../src/content/index.js");
  console.log("Figuren:", CHARACTER_LIST.map((c) => c.id + ":" + c.kind).join(" "));
  let w = 0, s = 0, u = 0; const t = Date.now();
  for (let k = 1; k <= 20; k++) { const r = partie("knight", "bishop", k * 7919); if (r === "w") w++; else if (r === "b") s++; else u++; }
  console.log(`20 Partien Springer (weiss) gegen Laeufer: weiss ${w}, schwarz ${s}, offen ${u} - ${Date.now() - t} ms`);
}

/* ── DER DURCHLAUF: jede Figur gegen jede andere ───────────────────────────
   Ohne Bauer, Gambit (steht in der Bauernreihe) und Koenig (ist der Koenig);
   der Drache belegt vier Felder und passt nicht auf den einen Platz - er wird
   gesondert geprueft. Je Paar 8 Partien, 4 je Farbe, feste Keime. */
export function durchlauf({ proPaar = 8, tiefe = 1, figuren = null } = {}) {
  const AUS = new Set(["pawn", "gambit", "king", "dragon"]);
  figuren = figuren || CHARACTER_LIST.map((c) => c.id).filter((id) => !AUS.has(id));
  const bilanz = Object.fromEntries(figuren.map((f) => [f, { s: 0, n: 0, u: 0, z: 0 }]));
  for (let i = 0; i < figuren.length; i++) for (let j = i + 1; j < figuren.length; j++) {
    const a = figuren[i], b = figuren[j];
    for (let k = 0; k < proPaar; k++) {
      const aWeiss = k % 2 === 0;
      const r = partie(aWeiss ? a : b, aWeiss ? b : a, 1000 + i * 97 + j * 13 + k, tiefe);
      const sieger = r === "w" ? (aWeiss ? a : b) : r === "b" ? (aWeiss ? b : a) : null;
      bilanz[a].z += partie.zuege; bilanz[b].z += partie.zuege;
      if (!sieger) { bilanz[a].u++; bilanz[b].u++; continue; }
      const verlierer = sieger === a ? b : a;
      bilanz[sieger].s++; bilanz[sieger].n++; bilanz[verlierer].n++;
    }
  }
  return figuren.map((f) => ({ f, ...bilanz[f], quote: bilanz[f].n ? bilanz[f].s / bilanz[f].n : 0.5,
      zuege: Math.round(bilanz[f].z / Math.max(1, bilanz[f].n + bilanz[f].u)) }))
    .sort((x, y) => y.quote - x.quote);
}

if (process.argv[2] === "lauf") {
  const t = Date.now();
  const erg = durchlauf({ proPaar: Number(process.argv[3] || 8), tiefe: Number(process.argv[4] || 1) });
  const fs = await import("node:fs");
  fs.writeFileSync(`/tmp/balance-t${process.argv[4] || 1}.json`, JSON.stringify(erg));
  console.log(`fertig in ${Math.round((Date.now() - t) / 1000)} s`);
  for (const e of erg) console.log(`${(CHARACTERS[e.f]?.nameDe || e.f).padEnd(16)} ${(e.quote * 100).toFixed(0).padStart(3)} %  (${e.s}/${e.n}, offen ${e.u})`);
}

if (process.argv[2] === "stufen") {
  STUFEN_AM_ANSCHLAG = false; const ohne = durchlauf({ proPaar: 8 });
  STUFEN_AM_ANSCHLAG = true; const mit = durchlauf({ proPaar: 8 });
  const q = (l, f) => Math.round(l.find((e) => e.f === f).quote * 100);
  const zeilen = mit.map((e) => ({ f: e.f, ohne: q(ohne, e.f), mit: q(mit, e.f) })).map((z) => ({ ...z, d: z.mit - z.ohne }))
    .sort((a, b) => b.d - a.d);
  for (const z of zeilen) console.log(`${(CHARACTERS[z.f]?.nameDe || z.f).padEnd(16)} Stufe I ${String(z.ohne).padStart(3)} %  ->  Anschlag ${String(z.mit).padStart(3)} %   (${z.d >= 0 ? "+" : ""}${z.d})`);
}

const nameVon = (f) => istMonster(f) ? (bossById(f.slice(5))?.nameDe || f) : (CHARACTERS[f]?.nameDe || f);
const zeige = (erg) => { for (const e of erg) console.log(`${nameVon(e.f).padEnd(24)} ${(e.quote * 100).toFixed(0).padStart(3)} %   Partielaenge ${String(e.zuege).padStart(3)} Zuege  (${e.s}/${e.n}, offen ${e.u})`); };
/* v1.28.3 (Besitzer): ZWEI GRUPPEN. Grossmeister = die Dame und die Monster,
   die ihren Platz einnehmen; alle anderen unter sich. */
if (process.argv[2] === "gruppen") {
  const fs = await import("node:fs");
  const monster = (Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES)).map((b) => "boss:" + b.id);
  console.log("== GROSSMEISTER: Dame und die 25 Monster, auf dem Damenplatz ==");
  const g1 = durchlauf({ proPaar: 6, figuren: ["queen", ...monster] }); zeige(g1);
  const AUS = new Set(["pawn", "gambit", "king", "dragon", "queen"]);
  console.log("\n== ALLE ANDEREN FIGUREN unter sich ==");
  const g2 = durchlauf({ proPaar: 8, figuren: CHARACTER_LIST.map((c) => c.id).filter((id) => !AUS.has(id)) }); zeige(g2);
  fs.writeFileSync("/tmp/balance-gruppen.json", JSON.stringify({ grossmeister: g1, andere: g2 }));
}

/* v1.28.3 (Besitzer): "wichtig ist nur, dass man nicht mit einer Figur den
   Koenig ohne weiteres plattmachen kann - es sollte sich immer ein Spiel
   ergeben wie beim Schach." Gemessen als PARTIELAENGE: eine Figur auf
   Hoechststufe gegen ein Heer mit der DAME auf Hoechststufe (heer() hebt die
   Figur auf dem Damenplatz immer auf ihre Hoechststufe) - und als Grundlinie
   zwei Heere, beide Stufe 1. */
export function grundlinie(n = 30) {
  let z = 0, w = 0;
  for (let k = 1; k <= n; k++) {
    const form = [...KARTE.defaultFormation];
    const a = buildArmyFromFormation(() => 1, form, () => [], null, () => ({}));
    let g = createGame(a, a, { rules: "hp", map: KARTE, seed: k * 31 }); const r = makeRng(k * 31);
    let m = 0; for (; m < 200; m++) { const st = status(g); if (st.over) { if (st.winner === "w") w++; break; } const mv = chooseMove(g, 1, r); if (!mv) break; g = applyMove(g, mv); }
    z += m;
  }
  return { zuege: Math.round(z / n), weiss: w };
}
if (process.argv[2] === "allein") {
  const g = grundlinie(30);
  console.log(`GRUNDLINIE - beide Heere Stufe 1: ${g.zuege} Halbzuege, Weiss gewinnt ${g.weiss}/30`);
  const AUS = new Set(["pawn", "gambit", "king", "dragon"]);
  const figuren = CHARACTER_LIST.map((c) => c.id).filter((id) => !AUS.has(id));
  const erg = [];
  for (const f of figuren) {
    let s = 0, z = 0, n = 0;
    for (let k = 0; k < 12; k++) { const aWeiss = k % 2 === 0;
      const r = partie(aWeiss ? f : "queen", aWeiss ? "queen" : f, 500 + k, 1, 200);
      const ich = r === "w" ? aWeiss : r === "b" ? !aWeiss : null;
      if (ich === true) s++; n++; z += partie.zuege; }
    erg.push({ f, s, n, z: Math.round(z / n) });
  }
  erg.sort((a, b) => a.z - b.z);
  console.log("\nEINE FIGUR auf Hoechststufe gegen die DAME auf Hoechststufe, Rest Stufe 1 (12 Partien):");
  for (const e of erg) console.log(`${nameVon(e.f).padEnd(20)} gewinnt ${String(e.s).padStart(2)}/12   nach ${String(e.z).padStart(3)} Halbzuegen`);
}
