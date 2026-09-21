// ── DIE ANIMATIONEN HALTEN WORT (v1.0.67) ───────────────────────────────────
// Der Besitzer will die Animationen testgetrieben: was das Register
// verspricht, muss die Kammer vorfuehren, der Schalter muss ueberall
// dieselbe Stelle stellen, und die Schlagarten muessen jede Figurenart
// abdecken. Diese Suite prueft das Modul und die Deckung der Bauteile -
// die Strukturproben am gerenderten Baum liegen in test_ui.jsx.
import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log("  ok  -", name); }
  else { fail++; console.log("  not ok -", name); }
};

/* localStorage-Attrappe VOR dem Modulimport - anim.js liest beim Laden. */
const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};

const { ANIMATIONEN, animById, animAn, setAnimAn, schlagArt, SCHLAG_ARTEN } =
  await import("./src/app/ui/anim.js");

console.log("\n== test_anim: das Register ==");
ok("das Register traegt dreizehn Bewegungen", ANIMATIONEN.length === 13);
ok("jede hat Kennung, Namen, Bereich und Beschreibung",
  ANIMATIONEN.every((a) => a.id && a.name && a.bereich && a.was && a.was.length > 30));
ok("keine Kennung doppelt", new Set(ANIMATIONEN.map((a) => a.id)).size === ANIMATIONEN.length);
ok("die drei Bereiche sind brett, belohnung, figuren",
  [...new Set(ANIMATIONEN.map((a) => a.bereich))].sort().join(",") === "belohnung,brett,figuren");
ok("animById findet den Schweif", animById("schweif")?.name === "Zugschweif");
ok("animById kennt Erfundenes nicht", animById("quatsch") === null);
const PFLICHT = ["schweif", "einschlag", "feuer", "atmen", "schach", "matt", "stufe", "muenzen", "beute", "glanz", "trank", "sanduhr", "faehigkeit"];
ok("alle vom Besitzer verlangten Bewegungen stehen darin",
  PFLICHT.every((id) => animById(id)));

console.log("\n== test_anim: der Schalter ==");
ok("an ist der Alltag", animAn() === true);
setAnimAn(false);
ok("aus wirkt sofort", animAn() === false);
ok("und liegt im Geraetespeicher", speicher.get("gg:anim") === "0");
setAnimAn(true);
ok("an kommt zurueck", animAn() === true && speicher.get("gg:anim") === "1");

console.log("\n== test_anim: die Schlagarten ==");
const KINDS = ["P", "N", "B", "R", "A", "C", "Q", "K", "D", "X", "G", "H"];
ok("jede Figurenart hat eine Schlagart", KINDS.every((k) => SCHLAG_ARTEN.includes(schlagArt(k))));
ok("der Schildtraeger STOESST (Besitzerbild)", schlagArt("P") === "stoss" && schlagArt("G") === "stoss");
ok("der Drache traegt das Feuer", schlagArt("D") === "feuer");
/* v1.1.1 (Besitzerentscheid): DIE UNTERSCHEIDUNG IST ABGESCHAFFT. "Wenn man
   eine Figur schlaegt, wuerde ich immer den Ton nehmen, den man auch beim
   Bauern hat, und da keine Unterscheidung machen." Wo hier vorher stand, dass
   die Dame bannt und der Turm wuchtet, steht jetzt das Gegenteil: alle
   gleich, nur der Drache atmet Feuer. */
ok("die Dame schlaegt wie jeder andere (stoss)", schlagArt("Q") === "stoss");
ok("auch Turm und Springer - EIN Schlagton fuer alle",
  ["R", "N", "B", "K", "C", "H", "A", "G", "X"].every((k) => schlagArt(k) === "stoss"));
ok("Unbekanntes faellt sicher auf stoss", schlagArt("?") === "stoss");

console.log("\n== test_anim: Kammer und Spiel decken das Register ==");
const kammer = readFileSync("src/app/ui/AnimKammerScreen.jsx", "utf8");
ok("die Kammer fuehrt JEDE Registerbewegung vor (case je id)",
  ANIMATIONEN.every((a) => kammer.includes(`case "${a.id}"`)));
const theme = readFileSync("src/app/ui/theme.js", "utf8");
for (const kf of ["ggAtmen", "ggStoss", "ggKlinge", "ggWucht", "ggBann", "ggFeuer", "ggFunken",
  "ggZielGlut", "ggSchachPuls", "ggKoenigFall", "ggStufenStern", "ggMuenzFall", "ggAuftritt", "ggGlanzLauf",
  "ggTrankLauf", "ggUhrPuls", "ggSprossePuls"])
  ok(`Keyframe ${kf} existiert im Theme`, theme.includes(`@keyframes ${kf}`));
{
  /* Die Ruckel-Lehre je BLOCK pruefen, nicht ueber Blockgrenzen hinweg -
     die erste Fassung dieser Probe lief in fremde Keyframes hinein
     (ggSetzPuls traegt zu Recht box-shadow) und schlug falsch an. */
  const MEINE = ["ggAtmen", "ggStoss", "ggKlinge", "ggWucht", "ggBann", "ggFeuer", "ggFunken",
    "ggZielGlut", "ggSchachPuls", "ggKoenigFall", "ggStufenStern", "ggMuenzFall", "ggAuftritt", "ggGlanzLauf",
    "ggTrankLauf", "ggUhrPuls", "ggSprossePuls"];
  const bloecke = theme.split("@keyframes ").slice(1);
  const suender = MEINE.filter((n) => {
    const b = bloecke.find((x) => x.startsWith(n + " "));
    return !b || /width:|height:|box-shadow:/.test(b.split("@keyframes")[0].split("\n").slice(0, 6).join("\n"));
  });
  ok("die Keyframes halten die Ruckel-Lehre: kein width/height/box-shadow im Takt", suender.length === 0);
}
const orte = {
  "BoardView nutzt den Schalter": ["src/app/ui/board/BoardView.jsx", "animAn()"],
  "BoardView kennt die Schlagarten": ["src/app/ui/board/BoardView.jsx", "schlagArt("],
  "PieceGlyph atmet": ["src/app/ui/board/PieceGlyph.jsx", "ggAtmen"],
  "PieceGlyph feiert die Stufe": ["src/app/ui/board/PieceGlyph.jsx", "ggStufenStern"],
  "GameScreen laesst Muenzen fallen": ["src/app/ui/screens/GameScreen.jsx", "ggMuenzFall"],
  "GameScreen reicht die Mattseite": ["src/app/ui/screens/GameScreen.jsx", "mattSeite="],
  "ArmyScreen glaenzt beim Verbessern": ["src/app/ui/screens/ArmyScreen.jsx", "ggGlanzLauf"],
  "das Profil traegt den Schalter": ["src/app/ui/screens/ProfileScreen.jsx", "setAnimAn"],
  "die App kennt die Kammer": ["src/app/App.jsx", "animkammer"],
  "die Verwaltung im Profil verlinkt die Kammer": ["src/app/ui/screens/ProfileScreen.jsx", '["?animkammer", "Die Animationskammer"'],
  "der Trank-Heilglanz ist auf das Gemaelde maskiert": ["src/app/ui/board/PieceGlyph.jsx", "WebkitMaskImage: `url(${painting})`"],
  "GameScreen setzt den Trank-Effekt": ["src/app/ui/screens/GameScreen.jsx", '"trank"'],
  "die Uhr pulst beim Zeitenwender": ["src/app/ui/screens/GameScreen.jsx", "ggUhrPuls"],
  "das Board reicht den Effekt an den Glyph": ["src/app/ui/board/BoardView.jsx", "effekt={effekt && effekt.at === i"],
  "die Faehigkeit faerbt den Glanz violett": ["src/app/ui/screens/ArmyScreen.jsx", "rgba(196,181,253"],
  "die erwachte Sprosse pulst": ["src/app/ui/screens/ArmyScreen.jsx", "ggSprossePuls"],
};
for (const [name, [datei, marke]] of Object.entries(orte))
  ok(name, readFileSync(datei, "utf8").includes(marke));

console.log("\n== test_anim: die Klaenge zu den Bildern (v1.0.73) ==");
{
  const NEU = ["muenzregen", "stoss", "klinge", "wucht", "bann", "drachenfeuer",
    "koenigsfall", "faehigkeit", "zerfall", "sperrsetzen", "glanz"];
  const kl = readFileSync("src/app/ui/klang.js", "utf8");
  const wk = readFileSync("src/app/ui/KlangWerkstattScreen.jsx", "utf8");
  const { existsSync } = await import("node:fs");
  for (const n of NEU) {
    ok(`${n}: Datei liegt im Klangordner`, existsSync(`src/app/ui/assets/klang/${n}.webm`));
    ok(`${n}: in klang.js registriert`, new RegExp(`\\n  ${n}: \\[`).test(kl));
    ok(`${n}: hat einen Pegel`, new RegExp(`${n}: 0\\.`).test(kl));
    ok(`${n}: in der Klangwerkstatt hoerbar`, wk.includes(`["${n}",`));
  }
  const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("die Schlagart klingt aus DERSELBEN Quelle wie das Bild",
    gs.includes("schlagArt(lm.kind)") && gs.includes('import { animAn, schlagArt }'));
  ok("der Muenzregen haengt am Gold des Banners", gs.includes('klang("muenzregen")'));
  ok("der Koenigsfall haengt am Matt", gs.includes('klang("koenigsfall")'));
  ok("der Zerfall klingt nur bei sichtbarer Aenderung", gs.includes("sperrStandRef"));
  const as = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("Faehigkeit und blosse Stufe klingen verschieden",
    as.includes('klang(sprosse ? "faehigkeit" : "glanz")'));
}

console.log("\n== test_anim: die Aufstiegsfeier (v1.0.75) ==");
{
  const { GAMBIT_STUFEN } = await import("./src/app/ui/board/gambitStufen.js");
  ok("es gibt sechs Stufengeschichten", GAMBIT_STUFEN.length === 6);
  ok("jede traegt Ziffer, Namen und Text",
    GAMBIT_STUFEN.every((g) => g.r && g.name && g.text && g.text.length > 40));
  ok("die sechste ist der Grand Gambit", GAMBIT_STUFEN[5].name.includes("Grand Gambit"));
  const { ABILITIES } = await import("./src/content/abilities.js");
  const alle = Object.values(ABILITIES).filter((a) => a.id);
  ok("jede Faehigkeit kann ihre Wirkung erklaeren (descDe)",
    alle.length > 20 && alle.every((a) => a.descDe && a.descDe.length > 10));
  ok("und auf englisch", alle.every((a) => a.descEn && a.descEn.length > 8));
  const as = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("die Feier existiert als eigene Komponente", as.includes("export function AufstiegsFeier"));
  ok("der Rangwechsel wird am TIER erkannt, nicht am Level",
    as.includes("gambitTier(level + 1) > gambitTier(level)"));
  ok("die Feier zeigt das NEUE Gemaelde", as.includes("tier: neuerRang"));
  /* v1.0.79: das Rangbild muss an ALLEN drei Orten ankommen. */
  ok("Figurenblatt: das Portraet waehlt das Rangbild",
    as.includes('paintedById("gambit-t" + gambitTier(level))'));
  ok("Aufstellung: waehlt das Rangbild",
    as.includes('paintedById("gambit-t" + gambitTier(gLvl))'));
  ok("Kachel: bekommt tier durchgereicht", as.includes("tier={hero ? gambitTier(level) : 0}"));
  const cs = readFileSync("src/app/ui/screens/CampaignScreen.jsx", "utf8");
  ok("Weltkarte: rechnet den Rang selbst", cs.includes('gambitTier(characterLevel(profile, "gambit")'));
  /* v1.0.87: sechs Besitzerbefunde vom 11.9. */
  /* v1.0.90: der Sticky-Verlauf ist WIEDER FORT - er legte sich ueber
     "Abgeschlossen" und brachte eine zweite Flaeche ins Fenster (Besitzer:
     "geht gar nicht"). Dass der Knopf sichtbar bleibt, loest jetzt der
     eingeklappte Erklaertext hinter dem (i) oben. */
  ok("Stationsfenster: kein Sticky-Verlauf mehr", !cs.includes('position: "sticky", bottom: -1'));
  /* v1.0.98: der Knopf steht jetzt IN der Titelzeile, hinter dem Ortsnamen -
     nicht mehr neben dem Kreuz (dort war er bei flex-start nie mittig). */
  ok("Stationsfenster: der Info-Knopf steht hinter dem Titel",
    cs.includes("placeFor(node, league, en) : \"\"}</span>") && cs.indexOf("setInfoAuf") < cs.indexOf('aria-label="Close"'));
  /* v1.1.8: das RUECKBLICKFENSTER zeigt die Gegner jetzt auch. Es gibt zwei
     Stationsfenster; das schlichte fuer den Rueckblick kannte nur Ort, Karte
     und Startknopf - wer ueber die Weltkarte navigierte, sah nie, was an der
     Station wartet. */
  /* v1.26.4: die Perlen sind seit v1.25.4 ueberall weg (Besitzer: "die Bubbles
     will ich nicht sehen, egal wo"). Diese Probe verlangte sie weiter und fiel
     seit v1.25.4 - unbemerkt, weil sie "not ok" schreibt und die Pruefung nur
     nach "FAIL" suchte. Geprueft wird jetzt, dass die Werte noch da sind: als
     Zahlen in den Bandfarben, Blau fuer Staerke, Rot fuer Leben. */
  ok("das Rueckblickfenster zeigt Bild, Namen und Werte des Gegners",
    cs.includes("const bossHier = node?.boss ? nodeBossSpec(node, viewLeague) : null") &&
    cs.includes('color: "#b6cdff" }}>{bossHier.atk}</span>') && cs.includes('color: "#ffb3aa" }}>{bossHier.hp}</span>'));
  ok("Stationsfenster: dritte Lage MITTE bei zu wenig Platz",
    cs.includes("const mittig = platz < MINDEST") && cs.includes('transform: "translateY(-50%)"'));
  ok("Stationsfenster: das Bossbild wird nicht mehr beschnitten", !cs.includes('transform: "scale(1.42)"') && cs.includes('overflow: "visible"'));
  ok("Stationsfenster: der Erklaertext steht hinter einem Info-Knopf", cs.includes("setInfoAuf((v) => !v)"));
  ok("Gefolge-Band ist ein Erfolg mit animiertem Stern", cs.includes("ggErfolgStern"));
  ok("Zugehoerigkeit ohne fuehrenden Trennpunkt", !cs.includes('<span style={{ opacity: .55 }}>·</span> {f === "crown"'));
  const am = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("Hofstaat-Kachel zentriert OHNE Transform", am.includes('margin: "0 0 -7px -9%"') && !am.includes('margin: "0 0 -7px 50%"'));
  ok("Kartenwahl als Raster mit Miniaturen", am.includes("<MapMini w={m.w}") && am.includes('gridTemplateColumns: "repeat(auto-fit, minmax(62px, 1fr))"'));
  ok("Preisknopf: goldene Kontur statt Goldflaeche", am.includes('border: `1.5px solid ${can ? "rgba(233,207,138,.9)"'));
  const pr = readFileSync("src/app/ui/primitives.jsx", "utf8");
  ok("MapMini zeichnet Loecher aus", pr.includes("const loch = new Set((holes || []).map(([f, r]) => r * w + f))"));
  /* v1.0.86: rechnen reichte nicht - die Karte muss den Rang auch ZEIGEN. */
  ok("Weltkarte: waehlt das Kartenbild nach dem Rang", cs.includes("KARTE_GAMBIT[Math.max(0, Math.min(5, gt - 1))]"));
  const { existsSync: _ex } = await import("node:fs");
  ok("alle sechs Kartenfassungen liegen als Datei vor",
    [1,2,3,4,5,6].every((t) => _ex(`src/app/ui/assets/karte-gambit-t${t}.webp`)));
  ok("die Feier schneidet ihr Bild ab, statt in den Text zu wachsen",
    as.includes("height: 150, overflow: \"hidden\"") && as.includes('transformOrigin: "50% 100%"'));
  /* v1.26.6: die Wirkung kommt jetzt aus faehigkeitsText(), damit beim Gambit
     "jederzeit" steht, wo der Kern es erlaubt - sonst derselbe Text. */
  ok("die gekaufte Faehigkeit erklaert ihre Wirkung",
    as.includes("desc: faehigkeitsText(ab, schluessel, en)"));   /* v1.26.7: im gemeinsamen Bauteil Aufstiegsplan */
  const th = readFileSync("src/app/ui/theme.js", "utf8");
  for (const kf of ["ggFeierKranz", "ggFeierKarte", "ggFeierBild"])
    ok(`Keyframe ${kf} existiert`, th.includes(`@keyframes ${kf}`));
  const st = readFileSync("src/app/i18n/strings.js", "utf8");
  for (const k of ["rang.titel", "rang.faehigTitel", "rang.wirkung", "rang.weiter"])
    ok(`Text ${k} steht in beiden Sprachen`, (st.match(new RegExp(`"${k}"`, "g")) || []).length === 2);
}

console.log("\n== SCHATZKAMMER: Belohnung sichtbar, Muenzregen an der Leiste (v1.1.4) ==");
{
  const ac = readFileSync("src/app/ui/screens/AchievementsScreen.jsx", "utf8");
  ok("die naechste Belohnung steht in der Kachelecke (Gold oben, Skillpunkt darunter)",
    ac.includes("claimReward(it, claimedTiers(profile, it.id))") && ac.includes('top: 9, right: 10'));
  ok("die Kachel ist der Bezug dafuer", /padding: ready \? 17 : 13,[\s\S]{0,200}position: "relative"/.test(ac));
  ok("unter dem Zaehler steht, was noch fehlt", ac.includes("bis zur nächsten Stufe"));
  const th = readFileSync("src/app/ui/theme.js", "utf8");
  ok("es gibt Keyframes fuer Muenzregen und Aufpoppen",
    th.includes("@keyframes ggMuenzeFaellt") && th.includes("@keyframes ggBeutelPop"));
  ok("sie nutzen nur transform und opacity",
    !/@keyframes ggMuenzeFaellt[\s\S]{0,260}(filter|box-shadow|background)/.test(th));
  const ap = readFileSync("src/app/App.jsx", "utf8");
  ok("die Leiste laesst den Regen EINMAL je Belohnung laufen (Schluessel am Zaehler)",
    ap.includes('key={"rgn" + claimable}') && ap.includes("ggMuenzeFaellt"));
  ok("und sie fragt vorher, ob Bewegung erlaubt ist", ap.includes('import { animAn } from "./ui/anim.js"'));
}

console.log("\n== BRETTRAND: Sperren mittig, Band praesent, Summen nah (v1.2.3) ==");
{
  const sg = readFileSync("src/app/ui/board/SperrGlyph.jsx", "utf8");
  ok("die Sperren sitzen vertikal mittig im Feld",
    sg.includes('top: "50%"') && sg.includes("translate(-50%, calc(-50%") && !sg.includes("bottom: `${sitz.unten * 100}%`"));
  const bv2 = readFileSync("src/app/ui/board/BoardView.jsx", "utf8");
  ok("das Talentband ist praesenter (groessere Schrift, Kontur, Schatten)",
    bv2.includes("fontSize: 12.5") && bv2.includes("0 3px 14px rgba(0,0,0,.5)"));
  ok("auch die leere Zeile traegt das volle Band",
    bv2.includes("padding: \"10px 12px\", marginTop: 8, borderRadius: 12"));
  ok("die Chips sind groesser und antippbar", bv2.includes('gap: 5, padding: "5px 11px"'));
  const gs2 = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
  ok("die Summenleisten ruecken ans Brett",
    gs2.includes("minHeight: 26, marginBottom: -6") && gs2.includes("marginTop: -6,"));
}

console.log("\n== KEIN GROESSENSPRUNG BEIM ZIEHEN (v1.4.9) ==");
{
  const pg2 = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
  const th = readFileSync("src/app/ui/theme.js", "utf8");
  /* GEMESSEN ueber vier Runden: der "kurze Versatz" des Besitzers war kein
     Versatz der Position (0,1 px), sondern ein Sprung der GROESSE - die
     ankommende Figur startete bei scale(.6) und wuchs auf 1. */
  ok("auf dem Brett erscheint eine Figur ohne Groessensprung",
    pg2.includes('aufsBrett ? "ggSanft'));
  ok("ggSanft aendert nur Deckkraft und Hoehe, nie die Groesse",
    /@keyframes ggSanft \{[^}]*opacity[^}]*translateY[^}]*\}/.test(th)
    && !/@keyframes ggSanft \{[^}]*scale/.test(th));
  ok("ausserhalb des Bretts bleibt pop (dort erscheinen Figuren wirklich neu)",
    pg2.includes('"pop .18s ease"'));
}

/* v1.27.1: das Boot wird OHNE transform mittig gesetzt - eine laufende
   Animation auf transform hatte es um die halbe Breite verschoben, der Gambit
   stand neben statt in ihm. Und die Grossmeister-Kachel traegt die laufende
   Kontur des Verbessern-Knopfs, innen gezeichnet. */
{
  const cs2 = readFileSync("src/app/ui/screens/CampaignScreen.jsx", "utf8");
  const i2 = cs2.indexOf("return <img src={bootUrl}");
  const bootZeile = cs2.slice(i2, i2 + 400);
  ok("das Boot sitzt ueber left mittig, nicht ueber transform",
    bootZeile.includes("left: `calc(50% - ${Math.round(bw / 2)}px)`") && !bootZeile.includes('translateX(-50%)'));
  const th2 = readFileSync("src/app/ui/theme.js", "utf8");
  const ar2 = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("Grossmeister-Kacheln tragen die laufende Kontur (innen)",
    th2.includes(".gg-funkenkontur-innen::after") && ar2.includes('className={meister ? "gg-funkenkontur-innen" : undefined}'));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
