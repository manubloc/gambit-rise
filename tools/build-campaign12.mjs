// Baut aus dem vom Besitzer gepflegten Stationsstand die neue Kampagne:
// ZWOELF Liga-Graphen statt des einen 51-Knoten-Graphen, der bisher in jeder
// Liga wiederverwendet wurde.
//
//   Eingabe   tools/stationen.json  (Export des Stationspruefers, gepflegt)
//   Ausgabe   src/content/campaign12.gen.js   die Knoten aller zwoelf Ligen
//             src/app/ui/mapBitmaps12.gen.js  Stationspositionen je Karte
//
// Entscheidungen, wie vom Besitzer vorgegeben:
//   - Hauptast traegt die Story: die vier Kapitelphasen liegen auf seinen
//     Vierteln, die Schluesselfiguren stehen dort, die letzte Station ist der
//     Liga-Endboss.
//   - Nebenaeste sind Belohnungswege: je laenger der Ast, desto groesser die
//     Belohnung am Blatt. Kurze Aeste zahlen Trank-Niveau (Gold/XP), lange
//     tragen vereinzelt eine Figur - aber weniger Schluesselfiguren als der
//     Hauptast.
//   - Kuerzere Hauptaeste sind schwerer: Schwierigkeit und Boss-Stufe
//     skalieren mit der inversen Hauptastlaenge.
//   - Keine Minispiele vorerst; jede Station ist eine Partie.
//
// 15 der 20 Schluesselfiguren liegen auf Hauptaesten, 5 auf langen Nebenaesten.
import { readFileSync, writeFileSync } from "node:fs";
import { PLACE_NAMES } from "../src/content/placeNames.js";

const ROH = JSON.parse(readFileSync("tools/stationen.json", "utf8"));
const KAP = ROH.kapitel || ROH;

// Slot -> Datei, Name, roemische Zahl. VII/VIII getauscht wie angesagt,
// XI neu benannt (das Meer ist jetzt XII), XII uebernimmt "Endloses Meer".
const SLOTS = [
  ["687", "Kronland", "I"], ["688", "Kornmark", "II"], ["689", "Eichwald", "III"],
  ["690", "Krummholz", "IV"], ["691", "Grauwacht", "V"], ["692", "Wolkenjoch", "VI"],
  ["693", "Sattelweite", "VII"], ["694", "Aschgrund", "VIII"], ["696", "Die Wunde", "IX"],
  ["698", "Sonnenschlund", "X"], ["700", "Die K\u00fcste", "XI"], ["707", "Endloses Meer", "XII"],
];

// Liga-Endbosse: I-XI wie gehabt, XII ist der Grossmeister in seiner Blitzfeste.
const ENDBOSS = ["b12","b10","b02","b19","b20","b16","b17","b18","b08","b14","b23","b25"]; // v0.38.1: Osric ans Ende (war faelschlich Kapitel-I-Finale)
// Zwischen-Monster fuer die Mitte des Hauptastes, je Liga eine kleine Rotation.
const MITTE = [["b01","b03"],["b02","b11"],["b24","b05"],["b09","b13"],["b22","b04"],
  ["b21","b07"],["b15","b06"],["b01","b09"],["b13","b22"],["b05","b24"],["b07","b21"],["b15","b04"]];
// Schluesselfiguren: [liga, anteilImHauptast 0..1] bzw. Nebenast-Pool je Liga.
const HAUPTFIGUR = {
  1:[["mage",.62],["paladin",.86]],   /* v0.77: beide Werbungen liegen HINTER dem Erwachen - die Schachhaelfte kommt ohne neue Figuren aus */ 2:[["hawk",.55]], 3:[["alchemist",.55]],
  4:[["sorceress",.55]], 5:[["guardian",.55]], 6:[["assassin",.55]],
  7:[["dragon",.55]], 8:[["warlock",.55]], 9:[["inquisitor",.55]],
  10:[["archbishop",.42],["engineer",.75]], 11:[["chancellor",.42],["standard",.75]],
  12:[["seeress",.5]],
};
const NEBENFIGUR = { 2:"bard", 4:"pathfinder", 6:"captain", 8:"amazon", 10:"strategist" };

const PHASEN = [
  ["Der Weg beginnt bei", "The road begins at"],
  ["Der Pfad f\u00fchrt weiter \u00fcber", "The path leads on across"],
  ["Die Pr\u00fcfung wartet bei", "The trial waits at"],
  ["Der letzte Anstieg: ", "The final ascent: "],
];
const AST_DE = ["Ein Seitenpfad zweigt ab nach", "Abseits des Weges liegt", "Ein stiller Umweg f\u00fchrt zu"];
const AST_EN = ["A side path branches toward", "Off the road lies", "A quiet detour leads to"];
const MAPS = ["classic", "skirmish", "courtyard", "gauntlet", "arena"];

// KAPITEL I IST DIE SCHULE DES SCHACHS (Besitzerwunsch, v0.77): die erste
// HAELFTE des Hauptastes wird auf WECHSELNDEN Karten nach reinen Schachregeln
// gespielt - keine Lebenspunkte, keine Traenke, alles dreht sich um Zuege und
// die Zug-Faehigkeiten der Leiter. Erst in der MITTE des Kapitels erwacht die
// alte Magie; ab dieser Station gilt HP, und erst dann kennt der Hof den
// Lebenstrank (der Laden zeigt ihn vorher nicht, siehe meta/campaign.js).
// Nebenaeste folgen ihrem Ankerpunkt am Hauptast - ein Abstecher aus der
// Schachhaelfte bleibt Schach.
/* v1.0.20 (Besitzer): DAS ERWACHEN RUECKT NACH KAPITEL II.
   Bisher fiel der erste Schaden schon auf halber Strecke durch Kapitel I -
   also mitten in der Stunde, in der man ueberhaupt erst begreift, dass die
   Figuren anders ziehen als im Schach. Zwei neue Sachen auf einmal sind eine
   zu viel. Kapitel I ist jetzt REINES SCHACH: neue Figuren, neue Gangarten,
   sonst nichts. Der Riss beisst erst auf halbem Weg durch Kapitel II - und
   trifft dann auf jemanden, der das Brett schon liest. */
/* ── DER SCHADEN KOMMT SPAET (v1.2.2, Besitzerentscheid) ───────────────────
   "Ich moechte moeglichst lange nur klassisches Schach, dass die Figuren
   keine HP-Werte haben, vielleicht sogar die kompletten ersten drei Kapitel.
   Man sollte den Spieler ganz langsam an dieses HP heranfuehren - ich wuerde
   das vielleicht sogar erst im fuenften Kapitel erlauben." Auf Rueckfrage:
   "Ab 5."

   Vorher fiel der erste Schaden auf halbem Weg durch Kapitel II. Gemessen
   waren damit 100 der ersten 161 Stationen HP-Gefechte - wer die Grundzuege
   noch lernte, rechnete schon mit Trefferpunkten. Jetzt beginnt der Schaden
   in der Mitte von Kapitel V: vier volle Kapitel Schach, in denen Figuren,
   Gangarten und Talente wachsen, und erst dann die zweite Ebene.

   Die beiden Zahlen sind der ganze Schalter - die Kampagne wird daraus neu
   gebaut (node tools/build-campaign12.mjs). */
const HP_AB_LIGA = 5;          // in diesem Kapitel faellt der erste Schaden
const HP_AB_ANTEIL = 0.5;      // und zwar ab der Haelfte seines Hauptasts

// Liga I hat keinen Block in placeNames - ihre Orte leben in der alten
// 51-Knoten-Kampagne. Liga XII ist neu und bekommt hier ihren Meerespool.
const NAMEN_I = ["Alte Wacht","Silberm\u00fchle","Vergessener Schrein","Nordwacht","Schattenklippe",
  "Wolfspass","Steinernes Tor","Klingenschlucht","Sonnenheiligtum","Alte Sternwarte","Hexenmoor",
  "Nebelmoor","Geisterfeld","Waldfeste","Lindenhain","Kronenstadt","Eisenbollwerk","Grenzwall",
  "Hohes Heiligtum","Ratshalle","Schmiedegrund","Bannerh\u00f6he","Verlassene Ruinen","Sturmfeste",
  "Mondwarte","Kr\u00e4henfels","Furt am Grauen Bach","Zehntscheune","M\u00fchlensteg","Alter Markt",
  "Wachtbaum","Kalkh\u00f6hle","Grenzstein","Jagdrast","Sonnenhang","Talsperre","Brackwasserbr\u00fccke",
  "Steinkreis","Hirtenruh","K\u00f6nigsallee","Pilgerpfad","Rabenstieg","Feldkapelle","Heckenrondell",
  "Torfstich","Gl\u00f6cknerturm"];
const NAMEN_XII = ["Der letzte Steg","Wrack der Morgenr\u00f6te","Mastbruch","Einsame Boje","Riff der Rippen",
  "Gekentertes Gl\u00fcck","Treibholzfeld","Versunkener Wachtturm","Salzfels","Krumme Klippe",
  "Nebelbank","Sturms\u00e4ule","Leuchtfeuerrest","Kap der Stille","Eiserne Untiefe","Sturmauge"];
// Der HAUPTAST schoepft zuerst aus dem Namenspool: die markanten, kuratierten
// Namen liegen vorn und gehoeren auf den Story-Faden. Nebenstationen bekommen
// den Rest; geht der Pool aus, zaehlt ein Suffix hoch. Doppelte Poolnamen
// werden beim Ziehen entschaerft.
const namenFuer = (roman, n, liga, hauptListe) => {
  const pool = (liga === 1 ? NAMEN_I : liga === 12 ? NAMEN_XII
    : Object.values(PLACE_NAMES[String(liga)] || {})).slice();
  const aus = new Array(n);
  const vergeben = new Set();
  let zeiger = 0;
  const zieh = () => {
    let nm = pool.length ? pool[zeiger % pool.length] : "Wegstein";
    const runde = Math.floor(zeiger / Math.max(1, pool.length));
    zeiger++;
    if (runde > 0) nm += " " + (["II", "III", "IV", "V"][runde - 1] || "VI");
    while (vergeben.has(nm)) nm += " \u2032";
    vergeben.add(nm);
    return nm;
  };
  const rang = new Map(hauptListe.map((idx, i) => [idx, i]));
  const reihen = [...hauptListe, ...Array.from({ length: n }, (_, i) => i).filter((i) => !rang.has(i))];
  for (const i of reihen) aus[i] = zieh();
  return aus;
};

const knoten = [];
const bitmaps = {};
let angeschlossen = 0;

SLOTS.forEach(([key, name, roman], si) => {
  const liga = si + 1;
  const v = KAP[key];
  const pk = v.punkte.map(p => ({ x: p[0], y: p[1] }));
  const kanten = v.kanten.map(e => [e[0], e[1]]);

  // Lose Punkte an den naechsten Nachbarn anschliessen - der gepflegte Stand
  // hatte in Sattelweite drei davon; ohne Anschluss gaebe es sie im Spiel nicht.
  // Anschluss loser Punkte NUR an Punkte, die schon im Netz haengen - sonst
  // verbinden sich lose Punkte untereinander und bilden eine eigene Insel
  // ohne Weg dorthin (genau das passierte in Sattelweite: 54-56-57).
  const hatKante = new Set(kanten.flat());
  const imNetz = new Set(hatKante);
  pk.forEach((p, i) => {
    if (hatKante.has(i) || pk.length < 2) return;
    let best = -1, bd = 1e18;
    pk.forEach((q, j) => {
      if (j === i || !imNetz.has(j)) return;
      const d = (p.x - q.x) ** 2 + ((p.y - q.y) * 1.4) ** 2;
      if (d < bd) { bd = d; best = j; }
    });
    kanten.push([Math.min(i, best), Math.max(i, best)]);
    hatKante.add(i); angeschlossen++;
  });

  const nb = {};
  kanten.forEach(([u, w]) => { (nb[u] = nb[u] || []).push(w); (nb[w] = nb[w] || []).push(u); });

  const haupt = v.hauptast.filter(i => pk[i]);
  const start = haupt[0];
  const dist = { [start]: 0 };
  const q = [start];
  while (q.length) {
    const u = q.shift();
    for (const w of nb[u] || []) if (dist[w] === undefined) { dist[w] = dist[u] + 1; q.push(w); }
  }
  const rangH = new Map(haupt.map((id, i) => [id, i]));

  // Aeste aus den Nummern des Pruefers: "7.1", "7.1.2" -> Gruppe "7.1".
  const astVon = {}, astLen = {};
  Object.entries(v.nummern || {}).forEach(([idx, nr]) => {
    const t = String(nr).split(".");
    if (t.length < 2) return;
    const g = t[0] + "." + t[1];
    astVon[idx] = g; astLen[g] = (astLen[g] || 0) + 1;
  });

  const namen = namenFuer(roman, pk.length, liga, haupt);
  const H = haupt.length;
  const schwer = Math.max(0, Math.round((30 - H) / 8));   // kurzer Hauptast = schwerer
  let hpAb = liga === HP_AB_LIGA ? Math.round(H * HP_AB_ANTEIL) : 0;  // Hauptast-Rang, ab dem HP gilt

  const figuren = (HAUPTFIGUR[liga] || []).map(([f, a]) => [haupt[Math.min(H - 1, Math.round(a * (H - 1)))], f]);
  const figAt = Object.fromEntries(figuren);
  const mitteAt = haupt[Math.round(0.3 * (H - 1))];
  /* v1.0.20: DAS ERWACHEN BRAUCHT EINE FREIE STATION. Faellt der berechnete
     Rang auf eine, die schon eine Figur oder den Mitte-Boss traegt, gewinnt
     dort der andere Boss und das Erwachen verschwindet spurlos - genau das
     passierte beim ersten Anlauf. Also weicht es nach hinten aus, bis eine
     Station frei ist. */
  if (hpAb) {
    while (hpAb < H - 2 && (figAt[haupt[hpAb]] || haupt[hpAb] === mitteAt)) hpAb++;
  }
  const nebenPool = NEBENFIGUR[liga] ? [NEBENFIGUR[liga]] : [];
  // Die Nebenfigur sitzt GENAU EINMAL: am tiefsten Punkt des laengsten Asts.
  const astNachLen = Object.entries(astLen).sort((a, b) => b[1] - a[1]);
  // Notfalls tut es auch ein kuerzerer Ast - die Figur MUSS vergeben werden,
  // sonst ist sie im ganzen Spiel nicht freischaltbar.
  const figurAst = nebenPool.length && astNachLen.length
    ? (astNachLen.find(a => a[1] >= 4) || astNachLen[0])[0] : null;
  // Zoll: der laengste Nebenast jedes Kapitels beginnt mit einer Mautstation.
  const zollAst = astNachLen.length ? astNachLen[0][0] : null;
  let figurBlatt = -1;
  if (figurAst) {
    // Das echte Blatt ist der Punkt mit der GROESSTEN Wegdistanz im Ast -
    // die Nummerntiefe taugt nicht, weil mehrere Punkte Tiefe drei haben
    // und der erste davon mitten im Ast liegen kann.
    let tief = -1;
    Object.entries(astVon).forEach(([idx, g]) => {
      if (g !== figurAst) return;
      const d = dist[Number(idx)] ?? -1;
      if (d > tief) { tief = d; figurBlatt = Number(idx); }
    });
  }

  pk.forEach((p, i) => {
    const id = `L${String(liga).padStart(2, "0")}s${String(i).padStart(2, "0")}`;
    const imHaupt = rangH.has(i);
    const rang = rangH.get(i);
    const nx = (nb[i] || [])
      .filter(w => (dist[w] ?? 1e9) > (dist[i] ?? 1e9) ||
                   ((dist[w] ?? 1e9) === (dist[i] ?? 1e9) && w > i))
      .map(w => `L${String(liga).padStart(2, "0")}s${String(w).padStart(2, "0")}`);

    const ort = namen[i];
    const g = astVon[i];
    const len = g ? astLen[g] : 0;
    // Ankerrang: fuer Hauptaststationen ihr eigener Rang, fuer Nebenaeste der
    // Rang ihres Abzweigs ("7.1" -> Hauptaststation 7). Er treibt die Phase
    // UND (in Kapitel I) die Frage Schach oder HP.
    const ankerRang = imHaupt ? rang : (g ? Number(g.split(".")[0]) - 1 : 0);
    const phase = Math.min(3, Math.floor((ankerRang / Math.max(1, H - 1)) * 4));
    const tiefe = g ? String(v.nummern[i]).split(".").length : 0;
    const blatt = g && !((nb[i] || []).some(w => astVon[w] === g && (dist[w] ?? 0) > (dist[i] ?? 0)));

    const n = {
      id, league: liga, place: ort,
      col: Math.round((p.x / v.breite) * 6),
      row: Math.round((1 - p.y / v.hoehe) * 12),
      map: MAPS[(rang ?? i) % MAPS.length],
      chapter: phase + 1,
      haupt: imHaupt || undefined,
      /* Schach gilt in allen Kapiteln VOR dem Erwachen, und im Kapitel des
         Erwachens bis zu dessen Station. */
      rules: (liga < HP_AB_LIGA || (liga === HP_AB_LIGA && ankerRang < hpAb)) ? "chess" : "hp",
      difficulty: imHaupt
        ? (rang < H * 0.3 ? "easy" : rang < H * 0.7 ? "normal" : "hard")
        : (len >= 4 ? "hard" : "normal"),
      bump: Math.min(3, Math.floor((liga - 1) / 4) + schwer),
      next: nx,
      reward: { xp: 30 + 6 * liga + (imHaupt ? 3 * (rang || 0) : 8 * tiefe) },
    };

    if (imHaupt) {
      n.storyDe = `${PHASEN[phase][0]} ${ort}.`;
      n.storyEn = `${PHASEN[phase][1]} ${ort}.`;
      if (rang === H - 1) {                    // Kapitel-Endboss
        n.final = true;                          // schliesst das Kapitel ab
        if (liga === 12) n.place = "Blitzfeste des Grossmeisters";
        n.boss = { pure: ENDBOSS[si] };
        n.tier = Math.min(4, 3 + schwer + (liga >= 11 ? 1 : 0));
        n.difficulty = "hard";
        n.storyDe = `${n.place}: Hier wartet der Meister von Kapitel ${roman}.`;
        n.storyEn = `${n.place}: here waits the master of chapter ${roman}.`;
        n.reward.gold = 20 + 4 * liga;
      } else if (figAt[i]) {
        n.boss = { piece: figAt[i], wins: liga >= 7 ? 2 : 1 };
        n.tier = Math.min(4, 1 + Math.floor(liga / 4) + schwer);
      } else if (liga === HP_AB_LIGA && rang === hpAb) {   // DAS ERWACHEN hat Vorrang
        n.boss = { pure: "b01", rotation: ["b01", "b03", "b02"] };
        n.tier = 1;
        n.storyDe = `${ort}: die alte Magie erwacht - Figuren bluten, Figuren halten stand.`;
        n.storyEn = `${ort}: the old magic wakes - pieces bleed, pieces endure.`;
      } else if (i === mitteAt && liga > 1) {
        n.boss = { pure: MITTE[si][0], rotation: MITTE[si] };
        n.tier = Math.min(4, 1 + Math.floor(liga / 5) + schwer);
      }
    } else {
      const b = AST_DE.length;
      n.storyDe = `${AST_DE[(i + liga) % b]} ${ort}.`;
      n.storyEn = `${AST_EN[(i + liga) % b]} ${ort}.`;
      if (zollAst && g === zollAst && tiefe === 2) {
        // Der Einstieg in den langen Ast kostet Zoll - wer die grosse
        // Belohnung will, zahlt den Faehrmann. Genau ein Tor je Kapitel.
        n.gate = { gold: 15 + 10 * liga };
        n.tagDe = "Zollstation"; n.tagEn = "Toll station";
      }
      if (i === figurBlatt) {                   // die eine Nebenast-Figur
        n.boss = { piece: NEBENFIGUR[liga], wins: 1 };
        n.tier = Math.min(4, 1 + Math.floor(liga / 4));
      } else if (blatt) {                        // Belohnung nach Astlaenge
        if (len >= 4) n.reward.gold = 40 + 8 * liga;
        else if (len >= 2)   n.reward.gold = 22 + 5 * liga;
        else                 n.reward.gold = 10 + 3 * liga;   // Trank-Niveau
      }
    }
    if ((v.leer || []).includes(i)) n.leer = true;
    knoten.push(n);
  });

  bitmaps[`kap${liga}`] = {
    file: `kap-${String(liga).padStart(2, "0")}`,
    w: 1796, h: Math.round((1796 / v.breite) * v.hoehe),
    pos: Object.fromEntries(pk.map((p, i) => [
      `L${String(liga).padStart(2, "0")}s${String(i).padStart(2, "0")}`,
      [Math.round((p.x / v.breite) * 1796), Math.round((p.y / v.breite) * 1796)],
    ])),
  };
});

const kopf = `// GENERIERT von tools/build-campaign12.mjs - nicht von Hand pflegen.
// Quelle ist tools/stationen.json, der im Stationspruefer gepflegte Stand
// (${ROH.erzeugt || "?"}). Zwoelf Liga-Graphen, ${knoten.length} Stationen.
// Zum Neubau: node tools/build-campaign12.mjs\n`;
writeFileSync("src/content/campaign12.gen.js",
  kopf + "export const CAMPAIGN12 = " + JSON.stringify(knoten, null, 1) + ";\n");

writeFileSync("src/app/ui/mapBitmaps12.gen.js",
  `// GENERIERT von tools/build-campaign12.mjs - Stationspositionen der zwoelf
// Kapitelkarten, umgerechnet auf die 1796er Leinwand des Kampagnenschirms.
` + SLOTS.map(([, , ], i) => `import kap${i + 1}Url from "./assets/kap/kap-${String(i + 1).padStart(2, "0")}.webp";`).join("\n")
  + "\n\nexport const MAP_BITMAPS12 = {\n"
  + Object.entries(bitmaps).map(([k, b], i) =>
      `  ${k}: { url: kap${i + 1}Url, h: ${b.h}, pos: ${JSON.stringify(b.pos)} },`).join("\n")
  + "\n};\n");

const fig = knoten.filter(n => n.boss?.piece).map(n => n.boss.piece);
const doppelt = fig.filter((f, i) => fig.indexOf(f) !== i);
console.log(`geschrieben: ${knoten.length} Stationen, ${fig.length} Figuren-Stationen, ${knoten.filter(n=>n.boss?.pure).length} Monster-Bosse`);
if (doppelt.length) console.log("DOPPELT VERGEBEN:", [...new Set(doppelt)].join(", "));
console.log(`lose Punkte automatisch angeschlossen: ${angeschlossen}`);
