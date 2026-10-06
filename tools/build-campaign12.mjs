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
/* v1.28.4 (Besitzer): der SEUCHENKOENIG ist "vom Begriff her" ein Grossmeister
   und tauscht mit dem Hetzer - er ist jetzt der Meister von Kapitel III, der
   Hetzer steht dort und in Kapitel X unterwegs. Asra war schon Meisterin von
   Kapitel XI. Die zwoelf Kapitelmeister sind die Grossmeister des Spiels. */
/* ── v1.91.0 (Besitzerauftrag 6.10.2026): DIE KAMPAGNE WIRD NEU BESETZT ───────
   "in den ersten beiden Kapiteln sollten schon die meisten Figuren dazukommen
    ... je weiter hinten in den Kapiteln, desto weniger Figuren und desto
    boeser die Figuren. D.h. am Anfang auch noch keine Bestien - die kommen
    erst in Kapitel 3 zum Vorschein. Und auch der Drache kann deutlich
    spaeter kommen."
   Vier Tabellen tragen das jetzt (vorher: HAUPTFIGUR, NEBENFIGUR, MITTE und
   drei Sonderfaelle):
     ENDBOSS        je Kapitel der Grossmeister am Ende - seit v1.91.0 im
                    Ursprung FIGUREN (content/bosses.js); Kapitel I hat wieder
                    einen Meister (Zahir), der Drache ist keiner mehr
     FIGUREN        je Kapitel, was man dort gewinnt: [id, Ort]. Ort ist ein
                    Anteil am Hauptast (0..1) oder "neben" (Blatt eines
                    Seitenwegs); ein dritter Eintrag setzt die noetigen Siege
     BESTIEN        je Kapitel die Bestien am Hauptast: [id, Anteil]
     MITTE_MEISTER  die beiden Grossmeister ohne Kapitel
   Jede Station traegt hoechstens EINEN Boss. Faellt ein Anteil auf eine
   schon vergebene Station, rueckt der Spaetere zur naechsten freien vor -
   so verschwindet nichts stumm (genau das war der Fehler beim ersten
   Erwachen, v1.0.20). Am Ende zaehlt das Skript nach und bricht ab, wenn
   eine Figur oder Bestie keinen Platz bekam. */
/* v1.91.1: DIE MEISTER STEHEN IN IHRER LANDSCHAFT. Der Winterkoenig hielt das
   Tor der Sattelweite (VII), der Gezeitenkoenig das der Schneelande (V) - die
   Kulisse des Meisters widersprach dem Brett seines Kapitels. Jetzt: Yorrik im
   Winter (V), Thalor mit seinen Schluesseln an den Paessen des Archivs (VI, so
   erzaehlt es die Chronik seit je), Seraphines Ball am Turnierhof (VII); Halvar
   sitzt als Meister ohne Kapitel an der Kueste (XI), Morwen ueber dem
   Aschgrund (VIII). */
const ENDBOSS = ["b26","b27","b24","b28","b31","b38","b30","b32","b33","b34","b35","b36"];
const MEISTER_FIGUR = {};   // v1.91.0: kein Kapitel hat mehr eine Figur als Meister (bis v1.90.36: I der Drache)
/* DIE BRUTMUTTER VOR DEM DRACHEN (v1.90.16): in Kapitel VII zwei Schritte vor
   der Drachenhalle - erst das Gelege, dann der geschluepfte Drache. Seit
   v1.91.0 wohnt der Drache wieder dort: wer die Halle nimmt, gewinnt ihn. */
const DRACHENHALLE = { liga: 7, anteil: 0.55, figur: "dragon",
  storyDe: "Der Hort ist nicht leer. Sein Bewohner ist jung, gierig und zu Hause - ein Drache auf vier Feldern.",
  storyEn: "The hoard is not empty. Its keeper is young, greedy and at home - a dragon on four squares." };
const BRUT = { liga: 7, schritte: 2, boss: "b03",
  storyDe: "Hier ist es warm - zu warm. Die Brutmutter hütet ein Gelege, das noch niemand schlüpfen sah. Noch nicht.",
  storyEn: "It is warm here - too warm. The Broodmother tends a clutch that no one has seen hatch. Not yet." };
/* Das Erwachen (erste HP-Station, Kapitel II) stellt seit v1.91.0 eine FIGUR:
   die Heilerin. Vorher stand dort der Hetzer - aber vor Kapitel III soll es
   keine Bestie geben, und eine Heilerin ist die richtige Gestalt fuer die
   Station, an der Figuren zum ersten Mal bluten. */
const ERWACHEN_FIGUR = "healer";
const FIGUREN = {
  1: [["farmwife", .14], ["beggar", "neben"], ["jester", .32], ["smith", .5], ["craftsman", "neben"], ["mage", .68],
      ["scholar", "neben"], ["taxman", "neben"], ["banker", .86], ["paladin", "neben"]],
  2: [["hawk", .4], ["cook", .55], ["monk", .7], ["huntress", .85],
      ["bard", "neben"], ["butcher", "neben"], ["miller", "neben"], ["ranger", "neben"], ["trapper", "neben"]],   // + die Heilerin am Erwachen
  3: [["alchemist", .55], ["fencer", .8], ["watchman", "neben"], ["cavalier", "neben"], ["spearman", "neben"]],
  4: [["sorceress", .55], ["gladiator", .8], ["pathfinder", "neben"], ["guardian", "neben"]],
  5: [["executioner", .55], ["jailer", "neben"], ["engineer", "neben"]],
  6: [["assassin", .55], ["samurai", .82], ["captain", "neben"]],
  7: [["strategist", "neben"]],                      // + der Drache in seiner Halle
  8: [["inquisitor", .55]],
  9: [["chancellor", .55]],
  10: [["archbishop", .55]],
  11: [["warlock", .55]],                             // der Bund Sturm kommt zuletzt: Warlock XI, Amazone XII
  12: [["amazon", .4], ["seeress", .72]],
};
const BESTIEN = {
  3: [["b02", .14], ["b04", .3], ["b01", .42]],
  4: [["b09", .3], ["b12", .68]],
  5: [["b22", .3], ["b40", .42], ["b42", .76]],
  6: [["b21", .3], ["b08", .42], ["b41", .7]],                      // v1.91.1: der Kanonier; die Blutmagd liest ihren Ritus im Aschgrund (VIII)
  7: [["b15", .3], ["b17", .76]],                      // + die Brutmutter vor der Drachenhalle
  8: [["b06", .3], ["b16", .42], ["b13", .76]],
  9: [["b18", .24], ["b19", .4], ["b43", .7]],                     // v1.91.1: Eisenfaust haelt die Wache an der Wunde (IX)
  10: [["b05", .3], ["b20", .42], ["b14", .76]],
  11: [["b07", .3], ["b23", .42], ["b39", .76]],      // der Schlinger: "ein Monster, das sehr spaet erscheinen sollte"
  12: [["b11", .2], ["b25", .56]],
};
const MITTE_MEISTER = { 8: ["b37", .62], 11: ["b29", .62] };   // Morwen ueber dem Aschgrund, Halvar an der Kueste

const PHASEN = [
  ["Der Weg beginnt bei", "The road begins at"],
  ["Der Pfad f\u00fchrt weiter \u00fcber", "The path leads on across"],
  ["Die Pr\u00fcfung wartet bei", "The trial waits at"],
  ["Der letzte Anstieg: ", "The final ascent: "],
];
const AST_DE = ["Ein Seitenpfad zweigt ab nach", "Abseits des Weges liegt", "Ein stiller Umweg f\u00fchrt zu"];
const AST_EN = ["A side path branches toward", "Off the road lies", "A quiet detour leads to"];
/* ── DIE KARTEN KOMMEN NACH UND NACH (v1.13.0) ───────────────────────────
   Besitzerentscheid nach einem Blick auf die Kampagne: "Ich glaub, wir
   sollten die Karten echt erst nach und nach sehr spaet freischalten und
   vorerst nur im 8x8 bleiben."

   GEMESSEN, was vorher war: alle fuenf Karten liefen ab Kapitel 1 reihum
   (MAPS[i % 5]). Ein Spieler sah in den ersten Stationen fuenf verschiedene
   Bretter, bevor er eines verstanden hatte - und die Aufstellung, die er sich
   zurechtgelegt hatte, passte auf dem naechsten schon nicht mehr.

   JETZT BLEIBT ES LANGE BEI 8x8. Klassik, Hof und Schneise sind alle drei
   8x8 - sie unterscheiden sich in Loechern und Sperren, nicht im Mass.
   Dadurch gilt dieselbe Aufstellung ueberall, und das Menue braucht keine
   Kartenauswahl.

   SCHARMUETZEL (6x6) kommt ab Kapitel 6, ARENA (10x10) ab Kapitel 8 - erst
   dann aendert sich das Mass, und erst dann muss der Spieler umdenken. */
/* v1.24.0 (Besitzerentscheid "Tabula Rasa"): Arena und Scharmuetzel sind
   gestrichen. Es bleiben die drei 8x8-Karten - und weil sie alle dasselbe Mass
   haben, duerfen sie frueh kommen: Klassik von Anfang an, der Hof ab Kapitel
   II, die Schneise ab Kapitel III. Der Spieler lernt Loecher und Sperren,
   nicht ein neues Brett. */
const MAPS = ["classic"];
const MAPS_AB = { courtyard: 2, gauntlet: 3 };               // Kapitel der Einfuehrung

/** Welche Karten stehen in diesem Kapitel zur Verfuegung? */
function kartenFuer(kapitel) {
  const l = [...MAPS];
  for (const [id, ab] of Object.entries(MAPS_AB)) if (kapitel >= ab) l.push(id);
  return l;
}

/* ── DER GROSSMEISTER FUEHRT DIE NEUE KARTE EIN (v1.13.0) ─────────────────
   Besitzerwunsch: "Ich faende es besonders interessant, wenn insbesondere die
   Grossmeister die neuen Maps einfuehren. Also nicht, dass es irgendwo in der
   Karte das erste Mal erscheint."

   Er hat recht, und der Grund ist erzaehlerisch: eine neue Kartenform, die
   zwischen zwei gewoehnlichen Stationen auftaucht, wirkt wie ein Zufall. Der
   Grossmeister am ENDE des VORKAPITELS ist der richtige Ort - er zeigt sie
   einmal, man kaempft darauf um etwas, und ab dem naechsten Kapitel gehoert
   sie dazu.

   Deshalb zeigt der Boss von Kapitel 1 den Hof und der von Kapitel 2 die
   Schneise (v1.24.0; vorher Scharmuetzel und Arena). */
const BOSS_ZEIGT = { 1: "courtyard", 2: "gauntlet" };

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
/* ── v1.36.0: DER SCHADEN KOMMT IN KAPITEL II (Besitzerentscheid 22.9.,
   loest v1.2.2 "ab 5" ab) ──────────────────────────────────────────────────
   "Wir hatten doch mal gesagt, dass man auch in der kostenlosen Version
   schon HP-Gefechte testen kann - ansonsten hat man ja gar keinen Mehrwert,
   die Figuren zu leveln. In Kapitel 1 den Fokus auf Figuren, in Kapitel 2
   mehr und mehr auf Faehigkeiten und Leveln." Gratis ist bis Kapitel III.
     Kapitel I   reines Schach - Figuren kennenlernen
     Kapitel II  der Schaden erwacht frueh im Hauptast; ab da Hauptast HP,
                 die Seitenwege bleiben Schach
     ab III      Hauptast HP, die Seitenwege wechseln sich ab (ganze Wege,
                 nicht Station fuer Station) - Schach bleibt als Abwechslung */
const HP_AB_LIGA = 2;          // in diesem Kapitel faellt der erste Schaden
const HP_AB_ANTEIL = 0.2;      // und zwar frueh in seinem Hauptast

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

  /* ── v1.91.0: DIE VERGABE AM HAUPTAST ─────────────────────────────────────
     Jede Station traegt hoechstens einen Boss. `nimm` sucht ab dem
     gewuenschten Rang die naechste freie Station (nie der Start, nie das
     Finale) und merkt sie sich. */
  const belegt = new Map();                                  // Punktindex -> { art, id, ... }
  const nimm = (anteil, eintrag) => {
    let r = Math.max(1, Math.min(H - 2, Math.round(anteil * (H - 1))));
    while (r < H - 1 && belegt.has(haupt[r])) r++;
    if (r >= H - 1) { r = Math.max(1, Math.min(H - 2, Math.round(anteil * (H - 1)))); while (r > 0 && belegt.has(haupt[r])) r--; }
    if (r <= 0) throw new Error(`Kapitel ${liga}: kein freier Platz am Hauptast fuer ${eintrag.id}`);
    belegt.set(haupt[r], eintrag); return haupt[r];
  };
  let hpAb = liga === HP_AB_LIGA ? Math.round(H * HP_AB_ANTEIL) : 0;  // Hauptast-Rang, ab dem HP gilt
  if (hpAb) belegt.set(haupt[hpAb], { art: "erwachen", id: ERWACHEN_FIGUR });
  let hallenAt = -1, brutAt = -1;
  if (liga === DRACHENHALLE.liga) {
    hallenAt = nimm(DRACHENHALLE.anteil, { art: "halle", id: DRACHENHALLE.figur });
    /* Die Brutmutter steht AUF DEM WEG zum Drachen: zwei Schritte vor seiner
       Station, rueckwaerts entlang der kuerzesten Wege (dist - 1). Die Liste
       `hauptast` des Kartenpruefers ist keine Weg-Reihenfolge - ein Anteil
       fiele auf das Blatt eines PARALLELEN Zweigs (gemessen, v1.90.16). */
    let u = hallenAt;
    for (let schritt = 0; u != null && schritt < BRUT.schritte; schritt++) {
      u = (nb[u] || []).filter(w => dist[w] === dist[u] - 1)
        .sort((a, b) => (rangH.has(b) - rangH.has(a)) || a - b)[0];
    }
    if (u != null && u !== hallenAt && !belegt.has(u) && rangH.has(u)) { brutAt = u; belegt.set(u, { art: "bestie", id: BRUT.boss, brut: true }); }
    if (brutAt < 0) throw new Error(`Kapitel ${liga}: keine freie Station fuer die Brutmutter vor dem Drachen`);
  }
  if (MITTE_MEISTER[liga]) nimm(MITTE_MEISTER[liga][1], { art: "meister", id: MITTE_MEISTER[liga][0] });
  const nebenFiguren = [];
  for (const [fid, ort, siege] of (FIGUREN[liga] || [])) {
    if (ort === "neben") nebenFiguren.push([fid, siege]);
    else nimm(ort, { art: "figur", id: fid, siege });
  }
  const bestienHier = (BESTIEN[liga] || []).map(([bid]) => bid);
  for (const [bid, anteil] of (BESTIEN[liga] || []))
    nimm(anteil, { art: "bestie", id: bid, rotation: [bid, bestienHier[(bestienHier.indexOf(bid) + 1) % bestienHier.length]] });

  // Die Nebenfiguren sitzen je am tiefsten Punkt eines Seitenwegs - die
  // laengsten Wege zuerst. Reichen die Wege nicht, rueckt der Rest auf den
  // Hauptast (sonst waere die Figur im ganzen Spiel nicht zu gewinnen).
  const astNachLen = Object.entries(astLen).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  // Zoll: der laengste Nebenast jedes Kapitels beginnt mit einer Mautstation.
  const zollAst = astNachLen.length ? astNachLen[0][0] : null;
  /* v1.36.0: die Seitenwege eines Kapitels in fester Folge (Abzweig, dann
     Nummer) - jeder zweite spielt Schach */
  const astFolge = [...new Set(Object.values(astVon))].sort((a, b) => {
    const [a1, a2] = String(a).split(".").map(Number), [b1, b2] = String(b).split(".").map(Number);
    return a1 - b1 || a2 - b2;
  });
  const blattVon = (ast) => {
    // Das echte Blatt ist der Punkt mit der GROESSTEN Wegdistanz im Ast -
    // die Nummerntiefe taugt nicht, weil mehrere Punkte Tiefe drei haben
    // und der erste davon mitten im Ast liegen kann.
    let tief = -1, blatt = -1;
    Object.entries(astVon).forEach(([idx, g]) => {
      if (g !== ast) return;
      const d = dist[Number(idx)] ?? -1;
      if (d > tief) { tief = d; blatt = Number(idx); }
    });
    return blatt;
  };
  const nebenAt = new Map();                                 // Punktindex -> [figur, siege]
  nebenFiguren.forEach(([fid, siege], k) => {
    const ast = astNachLen[k];
    const blatt = ast && ast[1] >= 2 ? blattVon(ast[0]) : -1;
    if (blatt >= 0 && !nebenAt.has(blatt)) nebenAt.set(blatt, [fid, siege]);
    else nimm(0.2 + 0.6 * (k / Math.max(1, nebenFiguren.length)), { art: "figur", id: fid, siege });
  });

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
      /* v1.13.0: aus den Karten, die dieses Kapitel schon kennt - ausser der
         Grossmeister stellt gerade eine neue vor. */
      map: (() => {
        if (rang === H - 1 && BOSS_ZEIGT[liga]) return BOSS_ZEIGT[liga];
        const l = kartenFuer(liga); return l[(rang ?? i) % l.length];
      })(),
      chapter: phase + 1,
      haupt: imHaupt || undefined,
      /* Schach gilt in allen Kapiteln VOR dem Erwachen, und im Kapitel des
         Erwachens bis zu dessen Station. */
      rules: liga < HP_AB_LIGA ? "chess"
        : liga === HP_AB_LIGA ? (imHaupt && ankerRang >= hpAb ? "hp" : "chess")
        : (imHaupt ? "hp" : (astFolge.indexOf(g) % 2 === 0 ? "hp" : "chess")),
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
        n.boss = MEISTER_FIGUR[liga] ? { piece: MEISTER_FIGUR[liga], wins: 1 } : { pure: ENDBOSS[si] };
        n.tier = Math.min(4, 3 + schwer + (liga >= 11 ? 1 : 0));
        n.difficulty = "hard";
        n.storyDe = `${n.place}: Hier wartet der Meister von Kapitel ${roman}.`;
        n.storyEn = `${n.place}: here waits the master of chapter ${roman}.`;
        n.reward.gold = 20 + 4 * liga;
      } else if (belegt.has(i)) {
        const e = belegt.get(i);
        if (e.art === "erwachen") {                          // DAS ERWACHEN - seit v1.91.0 mit einer Figur
          n.boss = { piece: e.id, wins: 1 };
          n.tier = 1;
          /* v1.90.18: ausdruecklich markiert - die erste HP-Schlacht behaelt die
             alte Szene (Bossformationen, meta/campaign.js). */
          n.erwachen = true;
          n.storyDe = `${ort}: die alte Magie erwacht - Figuren bluten, Figuren halten stand.`;
          n.storyEn = `${ort}: the old magic wakes - pieces bleed, pieces endure.`;
        } else if (e.art === "halle") {                      // die Drachenhalle
          n.boss = { piece: e.id, wins: 1 };
          n.tier = Math.min(4, 1 + Math.floor(liga / 4) + schwer);
          n.storyDe = `${ort}: ${DRACHENHALLE.storyDe}`;
          n.storyEn = `${ort}: ${DRACHENHALLE.storyEn}`;
        } else if (e.art === "figur") {
          n.boss = { piece: e.id, wins: e.siege || (liga >= 7 ? 2 : 1) };
          n.tier = Math.min(4, 1 + Math.floor(liga / 4) + schwer);
        } else if (e.art === "meister") {                    // Grossmeister ohne Kapitel
          n.boss = { pure: e.id };
          n.tier = Math.min(4, 2 + Math.floor(liga / 5) + schwer);
        } else {                                             // eine Bestie
          n.boss = e.brut ? { pure: e.id } : { pure: e.id, rotation: e.rotation };
          n.tier = Math.min(4, 1 + Math.floor(liga / 5) + schwer);
          if (e.brut) { n.storyDe = `${ort}: ${BRUT.storyDe}`; n.storyEn = `${ort}: ${BRUT.storyEn}`; }
        }
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
      if (nebenAt.has(i)) {                     // eine Nebenast-Figur
        const [fid, siege] = nebenAt.get(i);
        n.boss = { piece: fid, wins: siege || 1 };
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
/* v1.91.0: NACHZAEHLEN. Jede Figur und jede Bestie der Tabellen muss genau
   eine Station bekommen haben - sonst ist sie im Spiel nicht zu erreichen. */
const sollFig = [...Object.values(FIGUREN).flat().map(e => e[0]), ERWACHEN_FIGUR, DRACHENHALLE.figur];
const fehltFig = sollFig.filter(f => !fig.includes(f));
const purAlle = knoten.filter(n => n.boss?.pure).map(n => n.boss.pure);
const sollBest = [...Object.values(BESTIEN).flat().map(e => e[0]), BRUT.boss, ...Object.values(MITTE_MEISTER).map(e => e[0]), ...ENDBOSS];
const fehltBest = sollBest.filter(b => !purAlle.includes(b));
if (fehltFig.length || fehltBest.length) { console.error("OHNE STATION:", [...fehltFig, ...fehltBest].join(", ")); process.exit(1); }
const vorDrei = knoten.filter(n => n.league < 3 && n.boss?.pure && !ENDBOSS.includes(n.boss.pure));
if (vorDrei.length) { console.error("BESTIE VOR KAPITEL III:", vorDrei.map(n => n.id + "=" + n.boss.pure).join(", ")); process.exit(1); }
const doppelt = fig.filter((f, i) => fig.indexOf(f) !== i);
console.log(`geschrieben: ${knoten.length} Stationen, ${fig.length} Figuren-Stationen, ${knoten.filter(n=>n.boss?.pure).length} Monster-Bosse`);
if (doppelt.length) console.log("DOPPELT VERGEBEN:", [...new Set(doppelt)].join(", "));
console.log(`lose Punkte automatisch angeschlossen: ${angeschlossen}`);
