// UI CONTRACT TESTS — the layer no logic suite ever touched.
//
// Every bug this file guards against was live in production at some point:
// enemy champions rendered as plain queens, orbs vanished from the enemy's
// rank, digits changed size between one and two figures, the spell star kept
// burning after the spell was spent. These are RENDER truths, so they are
// asserted on the actual server-rendered markup — not on props or intentions.
import { renderToStaticMarkup as html } from "react-dom/server";
import { PieceGlyph, StatTriad, StatOrbBadge, ROHR_STATT_PERLEN } from "./src/app/ui/board/PieceGlyph.jsx";
import { paintedForPiece, paintedFitFor } from "./src/app/ui/board/paintedArt.js";
import { SperrGlyph } from "./src/app/ui/board/SperrGlyph.jsx";
import { stadium, setzFelder, setzeSperre } from "./src/core/rules/sperren.js";
import { BoardView } from "./src/app/ui/board/BoardView.jsx";
import { createGame } from "./src/core/index.js";
import { buildArmyFromFormation } from "./src/meta/index.js";
const einfachesHeer = () => buildArmyFromFormation(() => 1, ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]);
import { ABILITIES, BOSSES } from "./src/content/index.js";
import { ACHIEVEMENTS } from "./src/meta/achievements.js";
import { PIECE_ART, BOSS_ART } from "./src/app/ui/art.generated.js";
import { itemArt } from "./src/app/ui/assets/items/itemArt.js";
import { ITEMS } from "./src/content/index.js";
import { ItemIcon } from "./src/app/ui/ItemIcon.jsx";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { AchievementsScreen } from "./src/app/ui/screens/AchievementsScreen.jsx";
import { GameScreen } from "./src/app/ui/screens/GameScreen.jsx";
import { LeaveMatchAsk, GameIntro } from "./src/app/App.jsx";
import { rissStufe } from "./src/app/ui/RissBoden.jsx";
import { TutorialScreen } from "./src/app/ui/screens/TutorialScreen.jsx";
import { buildStageMatch, withProgressPct } from "./src/meta/index.js";
import { CAMPAIGN, TIME_MODES, timeModeById, clockFor } from "./src/content/index.js";
import { AkademieScreen } from "./src/app/ui/screens/AkademieScreen.jsx";
import { ArmyScreen, GearPanel, MoveDiagram } from "./src/app/ui/screens/ArmyScreen.jsx";
import { CHARACTER_LIST } from "./src/content/index.js";
import { defaultProfile, evaluate } from "./src/meta/index.js";
import { makeT } from "./src/app/i18n/strings.js";

let pass = 0, fail = 0;
const ok = (n, c) => { if (c) { pass++; console.log("  ok  -", n); } else { fail++; console.log(" FAIL -", n); } };

// how many background images does this markup pull in?
const imgs = (m) => (m.match(/url\(data:image/g) || []).length;
// pull every font-size the markup declares, in order
const fontSizes = (m) => (m.match(/font-size:\s*([^;"]+)/g) || []).map((s) => s.split(":")[1].trim());

const piece = (x = {}) => ({ id: 1, kind: "Q", color: "w", level: 1, abilities: [], used: {}, shield: 0,
  hp: 7, maxHp: 7, atk: 4, ...x });

// ── 1. THE CHAMPION SHOWS HIS FACE ──────────────────────────────────────────
// A master stands in the queen's PLACE; that is formation, not disguise. For a
// while the enemy's champion was painted as a queen and the whole point of
// meeting him — seeing whom you face — was lost.
{
  const boss = piece({ bossId: "b01", color: "b", name: { de: "Ork", en: "Orc" } });
  const own = html(<PieceGlyph piece={boss} pov="b" />);
  const foe = html(<PieceGlyph piece={boss} pov="w" />);
  ok("champion renders identically to both sides (no disguise)", own === foe);

  const bossArt = paintedForPiece(boss);
  const queenArt = paintedForPiece(piece({ kind: "Q" }));
  ok("the champion has his own portrait, not the queen's", bossArt && bossArt !== queenArt);
  ok("the enemy's markup carries that champion portrait", foe.includes(bossArt.slice(0, 60)));

  // and his SIZE is queen-class, as the formation promises
  const fb = paintedFitFor(boss), fq = paintedFitFor(piece({ kind: "Q" }));
  ok("champion is scaled to queen format (within 6%)", Math.abs(fb.h - fq.h) / fq.h < 0.06);
}

/* ── DIE PERLENFASSUNG (bis v1.2.x) ───────────────────────────────────────
   Seit v1.3.0 traegt jede Figur das LEBENSROHR statt zweier Zahlenperlen.
   Die Perlen bleiben als Rueckfall im Code (ROHR_STATT_PERLEN), und die
   Proben darauf bleiben ebenfalls - sie haben Echtes gehalten: dass der
   Gegner seine Kugeln nicht verliert, dass beide dieselbe Schriftgroesse
   tragen, dass die Zahl bei zweistelligen Werten mitschrumpft.

   Sie laufen deshalb NUR, wenn der Schalter auf den Perlen steht. Einfach
   loeschen waere falsch: sobald jemand zurueckschaltet, waere die Fassung
   ungeprueft - und genau diese Luecke hat damals dazu gefuehrt, dass der
   Gegner nackte Zahlen zeigte, ohne dass es jemandem auffiel. */
if (!ROHR_STATT_PERLEN) {
// ── 2. BOTH SIDES WEAR THEIR JEWELS ─────────────────────────────────────────
// The enemy once showed bare numerals: the orb image failed to reach the page
// and nobody noticed, because no test ever looked at the enemy's markup.
{
  const w = html(<StatTriad piece={piece({ color: "w" })} focus={false} />);
  const b = html(<StatTriad piece={piece({ color: "b" })} focus={false} />);
  const kugeln = (h) => (h.match(/<svg/g) || []).length;
  ok("your piece carries two sealed spheres", kugeln(w) >= 2 && w.includes("#e3c07a"));
  ok("the enemy piece carries two sealed spheres", kugeln(b) >= 2 && b.includes("#e3c07a"));
  ok("both sides wear the SAME pair (attack blue, life red)", imgs(w) === imgs(b));
  ok("the values are actually printed", w.includes(">4<") && w.includes(">7<"));
}


// ── DER RUHIGE LOOK (v1.0.62, Besitzer-Grossputz) ───────────────────────────
// "man braucht es nicht mehr in diesem Masse": die eigene Seite traegt GAR
// KEINEN Saum und KEINEN Filter mehr (Originalfarben!), der Gegner einen
// einzigen leisen Lila-Hauch, und die Auswahl bringt KEINE Extra-Pracht -
// der gewaehlte Zustand zeigt sich am Feldring, nicht am Lichtspektakel.
{
  const eigen = html(<PieceGlyph piece={piece({ color: "w" })} />);
  const feind = html(<PieceGlyph piece={piece({ color: "b" })} />);
  const gewaehlt = html(<PieceGlyph piece={{ ...piece({ color: "w" }), selected: true }} />);
  const schatten = (h) => (h.match(/drop-shadow/g) || []).length;
  ok("die eigene Seite traegt nur ihren Schatten (1 Durchgang)", schatten(eigen) === 1);
  ok("die eigene Seite ist UNGEFAERBT (kein brightness/saturate)",
    !/brightness\(1\.[0-9]+\) contrast/.test(eigen) && !eigen.includes("240,214,138"));
  ok("der Gegner traegt genau EINEN leisen Lila-Hauch",
    schatten(feind) === 2 && feind.includes("184,146,255,.38"));
  ok("die Auswahl bringt KEINE Extra-Pracht mehr", schatten(gewaehlt) === schatten(eigen));
  ok("kein Koenigshalo, keine Aura, kein Heldenglanz im Markup",
    ![eigen, feind, gewaehlt].some((h) => h.includes("0 0 16px") || h.includes("0 0 18px")));
}

// ── 3. ONE SIZE OF NUMERAL ──────────────────────────────────────────────────
// "die zahlen überall gleiche größe egal ob ein oder zweistellig"
{
  const svgFsAll = (h) => (h.match(/font-size="([\d.]+)"/g) || []).map((x) => parseFloat(x.match(/[\d.]+/)[0]));
  const one = svgFsAll(html(<StatTriad piece={piece({ atk: 4, hp: 7 })} />));
  const two = svgFsAll(html(<StatTriad piece={piece({ atk: 12, hp: 34 })} />));
  ok("both orbs of a piece share one font size", new Set(one).size === 1);
  ok("double digits shrink a step, but both orbs stay equal", new Set(two).size === 1 && two[0] < one[0]);
  // die Zahl sitzt auf dem BRETT auf derselben Mittellinie wie im Hofstaat
  const mitteBrett = (h) => (h.match(/dominant-baseline="central"/g) || []).length;
  ok("board numerals sit on the same centre line as the court's", mitteBrett(html(<StatTriad piece={piece({ atk: 4, hp: 7 })} />)) >= 2);
}

// ── 4. THE SPELL STAR IS AN HONEST PROMISE ──────────────────────────────────
// One spell per game: the star must mean "you may still act", nothing else.
// the star is a painting now — its data-URL fingerprint is the promise
/* v1.0.42: Der goldene Stern ist fort - die VIOLETTE KUGEL sagt jetzt
   dasselbe in der Sprache der beiden anderen Kugeln. Die Probe sucht darum
   den Farbverlauf der ungespielten Karte (#7c3aed) statt des Sternbildes,
   und prueft zusaetzlich, dass die verbrauchte Kugel STEHEN BLEIBT statt zu
   verschwinden: verschwaende sie, wuesste der Spieler nicht, ob die Figur je
   eine Karte hatte. */
/* ── ZWEI VOELKER AM BRETT (v1.0.45) ──────────────────────────────────────
   Der Besitzer will Freund und Feind am BILD unterscheiden, nicht am
   Farbfilter: eigene Bauern gruen, gegnerische blau, und der Held hebt sich
   von beiden ab. Das steht HIER und nicht in test_kapitel1.mjs, weil
   paintedArt.js Bilddateien einfuehrt - reines node kennt .webp nicht
   (ERR_UNKNOWN_FILE_EXTENSION), esbuild schon. */
{
  const bauer = (color) => paintedForPiece({ kind: "P", color });
  const held = (color) => paintedForPiece({ kind: "P", color, hero: true, level: 2 });
  /* v1.0.49 (Besitzerentscheid): DER GRUENE BAUER IST FORT. In v1.0.45 trug
     die eigene Seite den gruenen Holzbauern, damit man Freund und Feind am
     Bild unterscheidet. Der Besitzer will beidseitig den blauen Speertraeger
     - und die Unterscheidung ueber den HELDEN, der von der ersten Partie an
     in Gold zwischen ihnen steht. Das ist das staerkere Zeichen, weil es
     dieselbe Figur meint, die auch auf der Karte zu sehen ist. */
  ok("beide Seiten tragen jetzt denselben Bauern", bauer("w") === bauer("b"));
  ok("der Held hebt sich von den Bauern ab - auf BEIDEN Seiten",
    !!held("w") && held("w") !== bauer("w") && held("b") !== bauer("b"));
  // DER GAMBIT IST AUCH EIN BAUER (kind "P"). Liefe die Bauernweiche vor
  // seinem Zweig, staende der Held als schlichter Bauer da.
  ok("...und faellt nicht durch die Bauernweiche",
    held("w") !== bauer("w") && held("b") !== bauer("b"));
}

/* ── DIE SPERREN WERDEN AUCH GEZEICHNET (v1.0.46) ─────────────────────────
   Die Regeln dazu gibt es seit v0.90 - gezeichnet wurde nie etwas. Genau die
   Sorte Luecke, die keine Probe meldet, weil die Mechanik-Probe (test_sperren)
   gruen leuchtet und die Oberflaeche nie gefragt wird. Diese hier fragt die
   Oberflaeche. */
{
  const zeig = (art, hp) => html(<SperrGlyph art={art} zustand={stadium({ art, hp })} ruhig />);
  const heil = zeig("mauer", 2), riss = zeig("mauer", 1), schutt = zeig("mauer", 0);
  ok("eine heile Mauer wird ueberhaupt gezeichnet", heil.includes("<img"));
  ok("die drei Zustaende tragen DREI VERSCHIEDENE Bilder",
    heil !== riss && riss !== schutt && heil !== schutt);
  // Die Truemmer liegen flach: deutlich niedriger als die aufrechte Mauer.
  const hoehe = (m) => { const t = m.match(/height:\s*([\d.]+)%/); return t ? +t[1] : null; };
  ok("die Truemmer liegen flach, die Mauer steht aufrecht",
    hoehe(schutt) !== null && hoehe(heil) !== null && hoehe(schutt) < hoehe(heil) * 0.6);
  // Truemmer gehoeren UNTER die Figur, sonst verdecken sie das Brett.
  ok("die Truemmer liegen unter der Figur (zIndex 0)", /z-?index:\s*0/i.test(schutt));
  /* v1.0.63: HIER STAND FRUEHER "eine Art ohne Bilder zeichnet gar nichts".
     Das war richtig, solange niemand eine Sperre setzen konnte - lieber
     nichts als etwas Falsches. Seit man sie fuer Gold KAUFT, ist Nichts das
     Falsche: Zaun und Bollwerk haben noch keine Gemaelde und muessen bis
     dahin als Zeichnung dastehen. Die Probe kehrt sich also um. */
  const zaun = zeig("zaun", 1), bollwerk = zeig("bergfried", 3);
  /* v1.0.89: die Zeichnung ist jetzt nur noch der RUECKFALL - alle drei Arten
     haben Gemaelde. Sie muss aber weiter funktionieren: eine kuenftige vierte
     Sperre traegt anfangs wieder keins. */
  /* v1.0.89: alle drei Arten haben Gemaelde - sie zeichnen jetzt <img>, nicht
     mehr die Ersatz-SVG. Dass die Zeichnung noch funktioniert, prueft die
     erfundene Art zwei Zeilen weiter unten: sie ist der echte Rueckfall. */
  ok("der Zaun traegt jetzt sein Gemaelde", zaun.includes("<img"));
  ok("das Bollwerk ebenso", bollwerk.includes("<img"));
  ok("und beide sehen verschieden aus", zaun !== bollwerk);
  ok("eine erfundene Art zeichnet weiterhin gar nichts", zeig("burgtor", 1) === "");
  ok("und das Bollwerk zeigt bei hp1 ein ANDERES Bild als bei hp2 (v1.0.89)",
    zeig("bergfried", 1) !== zeig("bergfried", 2));
  ok("die Zeichnung kennt auch ihre Truemmer", zeig("zaun", 0) !== zaun);
  // SPARSAM: ein Schatten, nicht neun - dieselbe Lehre wie v1.0.41.
  ok("die Sperre traegt hoechstens einen Unschaerfe-Durchgang",
    (heil.match(/drop-shadow/g) || []).length <= 1);
  ok("auch die Zeichnung bleibt bei einem Schatten",
    (zaun.match(/drop-shadow/g) || []).length <= 1);
}

/* ── DAS SETZEN DER SPERREN, AM GERENDERTEN BRETT (v1.0.63) ───────────────
   Die Mechanik-Probe (test_sperren) prueft die REGEL, diese hier prueft, dass
   das Brett sie auch ZEIGT: leuchtende Felder dort, wo gesetzt werden darf,
   und nirgends sonst. Am lebenden DOM nachgemessen (messe_sperren.mjs), hier
   als Wache gegen das Zurueckrutschen. */
{
  const g = createGame(einfachesHeer(), einfachesHeer(), { rules: "chess" });
  const felder = setzFelder(g, "w");
  /* OHNE `ruhig`: das ruhende Brett (Vorschau, Blatt) schaltet Bewegung ab -
     die Marke traegt dort animation "none". Gemessen wird hier das LEBENDE
     Brett, auf dem gesetzt wird. */
  const mit = html(<BoardView state={g} onMove={() => {}} interactive={false} setzFelder={felder} onSetz={() => {}} />);
  const ohne = html(<BoardView state={g} onMove={() => {}} interactive={false} ruhig />);
  const zaehle = (m) => (m.match(/ggSetzPuls/g) || []).length;
  ok("jedes erlaubte Feld leuchtet", zaehle(mit) === felder.length && felder.length === 2 * g.w);
  ok("ohne Setzphase leuchtet gar nichts", zaehle(ohne) === 0);
  const belegt = { ...g, sperren: setzeSperre(g, felder[0], "mauer", "w", 0) };
  const nachher = html(<BoardView state={belegt} onMove={() => {}} interactive={false}
    setzFelder={setzFelder(belegt, "w")} onSetz={() => {}} />);
  ok("das belegte Feld leuchtet nicht mehr", zaehle(nachher) === felder.length - 1);
  ok("und die Sperre steht dort sichtbar", nachher.includes("mauer-heil") || nachher.includes("<svg"));
}

const star = (m) => m.includes("#7c3aed");
const erloschen = (m) => m.includes("#2f2a3d");
{
  const live = Object.keys(ABILITIES).find((id) => ABILITIES[id].live);
  const passive = Object.keys(ABILITIES).find((id) => !ABILITIES[id].live);
  ok("the content actually holds both a live and a passive talent", !!live && !!passive);

  ok("a piece with an unspent castable talent shows the star",
    star(html(<StatTriad piece={piece({ abilities: [live] })} />)));
  {
    const nachher = html(<StatTriad piece={piece({ abilities: [live], used: { [live]: true } })} />);
    ok("after the one cast the orb goes out", !star(nachher));
    ok("but it stays on the board, merely spent", erloschen(nachher));
  }
  ok("a piece with no talents shows no star",
    !star(html(<StatTriad piece={piece()} />)));
  ok("purely passive gifts promise no act",
    !star(html(<StatTriad piece={piece({ abilities: [passive] })} />)));
}
}   /* Ende der Perlenfassung */

// ── 5. BADGES CARRY THEIR VALUE, DELTAS INCLUDED ────────────────────────────
// "+1" is a value like any other — it must land inside the sphere, centred.
{
  const plain = html(<StatOrbBadge kind="power" v={5} size={24} />);
  const delta = html(<StatOrbBadge kind="life" v="+2" size={24} />);
  ok("a plain badge prints its number", plain.includes(">5<"));
  ok("a delta badge prints its sign and number", delta.includes("+2"));
  // v0.38.1: Siegel-Stil — die Kugel ist gezeichnet (SVG mit Goldrand), kein
  // Bild mehr; die Zahl steht per Grid mittig, keine Versatz-Korrektur noetig.
  ok("both badges are cast as sealed spheres (svg, gold rim)", plain.includes("<svg") && delta.includes("<svg") && plain.includes("#e3c07a"));
  ok("the numeral rides the sphere, white and bold", plain.includes("#ffffff") || plain.includes("rgb(255, 255, 255)"));
  // v0.38.4: die Zahl sitzt GEOMETRISCH mittig (SVG-Text, dominantBaseline
  // central) - als HTML-span schwankte sie mit der Schriftgrundlinie, "+2"
  // sass anders als "5". Fuer JEDEN Wert dieselbe Mitte.
  const mitte = (h) => (h.match(/y="12"[^>]*dominant-baseline="central"|dominant-baseline="central"[^>]*y="12"/) || []).length;
  ok("every value sits on the SAME centre line", mitte(plain) === 1 && mitte(delta) === 1 && mitte(html(<StatOrbBadge kind="power" v={12} size={24} />)) === 1);
  const svgFs = (h) => parseFloat((h.match(/font-size="([\d.]+)"/) || [0, "0"])[1]);
  ok("multi-glyph values shrink a step to stay inside the cavity", svgFs(delta) < svgFs(plain));
}

// ── 6. NO EMPTY RENDERS ─────────────────────────────────────────────────────
// A component that quietly returns nothing is the hardest bug to see.
{
  ok("a piece always renders something", html(<PieceGlyph piece={piece()} />).length > 200);
  ok("a pawn renders too", html(<PieceGlyph piece={piece({ kind: "P", hp: 2, maxHp: 2, atk: 1 })} />).length > 200);
  ok("the hero renders", html(<PieceGlyph piece={piece({ kind: "P", hero: true, tier: 3 })} />).length > 200);
  ok("a nulled piece renders nothing rather than crashing", html(<PieceGlyph piece={null} />) === "");
}

// ── 7. THE ART CONTRACT — every painting fits a square frame ────────────────
// The campaign popup shows champions in a SQUARE frame so they fill its full
// height (the old 84x108 box was width-limited and wasted a quarter of it).
// That only holds while no painting is markedly wider than tall — a future
// wide canvas would spill over the name beside it. Dimensions are read from
// the WebP header on disk, so a new file is checked the moment it lands.
{
  const dims = (file) => {
    const b = readFileSync(file);
    if (b.toString("latin1", 0, 4) !== "RIFF" || b.toString("latin1", 8, 12) !== "WEBP") return null;
    const chunk = b.toString("latin1", 12, 16);
    if (chunk === "VP8X") return { w: b.readUIntLE(24, 3) + 1, h: b.readUIntLE(27, 3) + 1 };
    if (chunk === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {                       // 14 bits each, packed after the 0x2f signature
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    return null;
  };
  const dir = "src/app/ui/assets/painted";
  const files = readdirSync(dir).filter((f) => f.endsWith(".webp"));
  ok("the gallery is on disk and readable", files.length > 30);

  const unreadable = files.filter((f) => !dims(`${dir}/${f}`));
  ok("every painting's header parses", unreadable.length === 0 || console.log("     ", unreadable.join(", ")));

  const tooWide = files.map((f) => ({ f, d: dims(`${dir}/${f}`) })).filter((x) => x.d && x.d.w / x.d.h > 1.1);
  ok("no painting is wider than its frame allows (aspect <= 1.1)",
    tooWide.length === 0 || console.log("     ", tooWide.map((x) => `${x.f} ${x.d.w}x${x.d.h}`).join(", ")));

  // In a height-filling frame only the HEIGHT is ever upscaled — several
  // figures are legitimately narrow (a queen is 198x384). The popup draws at
  // ~139 CSS px, so 280+ rows keep it sharp even on a 2x screen.
  const shallow = files.map((f) => ({ f, d: dims(`${dir}/${f}`) })).filter((x) => x.d && x.d.h < 280);
  ok("every painting has the rows to stay sharp when it fills the frame",
    shallow.length === 0 || console.log("     ", shallow.map((x) => `${x.f} ${x.d.w}x${x.d.h}`).join(", ")));

  // THE TREASURY'S EMBLEMS: one painted medallion per achievement, square (they
  // are cast as discs) and big enough for the 54px rim on a 2x screen.
  const achDir = "src/app/ui/assets/ach";
  const achFiles = readdirSync(achDir).filter((f) => f.endsWith(".webp"));
  const achIds = evaluate({}).items.map((i) => i.id);
  const missing = achIds.filter((id) => !achFiles.includes(`ach-${id}.webp`));
  ok("every achievement has its own painted emblem", missing.length === 0 || console.log("     ", missing.join(", ")));
  // Every emblem may wear TWO liveries since the carved repaint — "ach-x.webp"
  // (classic) and "ach-x.carved.webp". Both must belong to a real deed.
  ok("no emblem is orphaned", achFiles.every((f) => achIds.includes(f.slice(4, -5).replace(/\.carved$/, ""))));
  const badMedal = achFiles.map((f) => ({ f, d: dims(`${achDir}/${f}`) }))
    .filter((x) => !x.d || x.d.w !== x.d.h || x.d.w < 128);
  ok("emblems are square and large enough for a crisp medallion",
    badMedal.length === 0 || console.log("     ", badMedal.map((x) => x.f).join(", ")));
}

// ── 8. THE TREASURY MUST BE READABLE ────────────────────────────────────────
// The gilding once left text at 2.9:1 on its own plates — with unstarted cards
// faded to 62% on top, effectively invisible. Contrast is arithmetic, so it
// can simply be asserted: every colour the screen prints is measured against
// the darkest plate it can sit on.
{
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const lum = (hex) => {
    const h = hex.replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  ok("the contrast maths is sound (white on black is 21:1)", Math.round(ratio("#ffffff", "#000000")) === 21);

  const markup = html(<AchievementsScreen profile={defaultProfile()} t={makeT("de")} initialOpenId="wins" />);
  const PLATE = "#2e2413";                       // the lit half of a card's gradient — the worst case
  const colours = [...new Set((markup.match(/color:\s*(#[0-9a-fA-F]{6})/g) || [])
    .map((c) => c.split(":")[1].trim()))];
  ok("the treasury actually prints text colours", colours.length >= 3);

  const dark = colours.filter((c) => ratio(c, PLATE) < 3);
  // ink on gold BUTTONS is meant to be dark — those sit on a bright pill, not the plate
  const onPlate = dark.filter((c) => ratio(c, "#e8c96a") < 4.5);
  ok("no text colour falls below the readable floor on the plates",
    onPlate.length === 0 || console.log("     ", onPlate.map((c) => `${c} = ${ratio(c, PLATE).toFixed(1)}:1`).join(", ")));

  const faded = (markup.match(/opacity:\s*0?\.\d+/g) || []).map((o) => Number(o.split(":")[1]));
  ok("nothing is faded past legibility", faded.every((o) => o >= 0.55));
}

// ── 9. THE TREASURY LOOKS LIKE TREASURE ─────────────────────────────────────
// Two defects this pins down: half the plates were dimmed to "switched off",
// and the lit ones carried a 3px gold bar down the LEFT edge only, reading as
// a lopsided frame instead of a rim of gold.
{
  const bare = html(<AchievementsScreen profile={defaultProfile()} t={makeT("de")} />);
  const rich = html(<AchievementsScreen
    profile={{ ...defaultProfile(), stats: { wins: 30, checkmates: 12, games: 60, captures: 200 } }}
    t={makeT("de")} />);

  ok("no plate wears a one-sided rim", !bare.includes("inset 3px") && !rich.includes("inset 3px"));

  // Every card must be lit, and lit THE SAME — asserted without naming a
  // colour, so a repaint cannot quietly reintroduce a dim variant.
  // plates are painted in rgba; the gold claim button is a solid gradient
  const grounds = (m) => [...new Set((m.match(/background:linear-gradient\(160deg, rgba[^;"]*/g) || []))];
  ok("all plates share one ground, untouched or earned", grounds(bare).length === 1);
  ok("earned plates use that very same ground", grounds(rich).length === 1 && grounds(rich)[0] === grounds(bare)[0]);
  ok("the treasury actually draws its plates", (bare.match(/background:linear-gradient\(160deg, rgba/g) || []).length >= 14);

  // a waiting purse enlarges its plate and its button
  // DS1 §19.6: die Platten sind kompakter (17/13 statt 19/16, gemessen 84 px
  // Kartenhoehe) - die ABSICHT des Waechters bleibt: belohnbar > geschlossen.
  ok("a claimable plate sits roomier than the rest", rich.includes("padding:17px") && bare.includes("padding:13px"));
  ok("an untouched treasury offers nothing to claim", !bare.includes("padding:19px"));
  ok("the claim button is full width with air above it",
    rich.includes("padding:13px 18px 12px") && rich.includes("margin-top:9px"));

  // THE EMBLEMS ARE SHOWN AS PAINTED. They were greyed and darkened until an
  // achievement was under way, and at that strength you could not make out what
  // the picture showed at all.
  ok("no emblem is greyed or dimmed", !bare.includes("grayscale") && !rich.includes("grayscale"));
  ok("every emblem is drawn at full strength", (bare.match(/<img/g) || []).length >= 14);
  // the rim was tamed on request: quiet gold instead of near-white — it must
  // still be there, just no longer shouting
  ok("the rim is drawn strongly enough to read", bare.includes("2px solid #d9b565"));
  ok("the near-white rim is gone for good", !bare.includes("#f6e4a2") && !bare.includes("#fff6d8"));
}

// ── 10. THE CHRONICLE ───────────────────────────────────────────────────────
// For a player the record is earned page by page. For an admin it is a working
// reference: every figure legible at once, nothing to unlock first. And each
// entry shows BOTH faces — the battle painting and the plain vector sigil.
{
  const t = makeT("de");
  // v0.51: die Chronik wohnt in der AKADEMIE (Besitzer: "Regeln, Figuren und
  // Chronik sind dasselbe") - der Waechter zieht mit um und prueft sie dort.
  const chron = (account) => html(<AkademieScreen profile={defaultProfile()}
    t={t} en={false} account={account} onDone={() => {}} />);
  const player = chron(null);
  const admin = chron({ id: "a", name: "Admin", isAdmin: true });

  const veiled = (m) => (m.match(/>\?\?\?</g) || []).length;
  const named = (m) => CHARACTER_LIST.filter((c) => m.includes(">" + c.nameDe + "<")).length;

  ok("a fresh player's chronicle still keeps its secrets", veiled(player) > 20);
  ok("the admin's chronicle hides nothing", veiled(admin) === 0);
  ok("the admin sees every figure by name", named(admin) === CHARACTER_LIST.length);
  ok("the player does not", named(player) < CHARACTER_LIST.length);

  // both faces, on every row — paintings are <img>, sigils are inline <svg>
  const sigils = (admin.match(/Vektor-Zeichen/g) || []).length;
  const chipMarks = [IC_COIN, IC_SKILL].map((u) => u.slice(40, 104));
  const chips = chipMarks.reduce((n, mark) => n + (admin.split(mark).length - 1), 0);
  const plates = (admin.match(/<img/g) || []).length - chips;
  ok("every chronicle row carries a vector sigil", sigils >= CHARACTER_LIST.length);
  ok("the paintings are there too, one per row", plates >= CHARACTER_LIST.length);
  ok("sigils and paintings pair up one for one", sigils === plates);
}

// ── 11. THE EMPTY MAP MUST STILL DRAW ───────────────────────────────────────
// A painted chapter map brings its own scenery, so the generator hands back an
// EMPTY_SCENERY object instead of computing hills and huts. If that object is
// ever missing one field the map still reaches for, the campaign screen dies
// with "Cannot read properties of undefined (reading 'map')" — which is exactly
// the crash that came in from a phone on 22 July (a sibling of it, in the
// treasury). This path gets hot the moment painted maps arrive, so it is
// checked against the source itself.
{
  const src = readFileSync("src/app/ui/screens/CampaignScreen.jsx", "utf8");
  const block = src.slice(src.indexOf("const EMPTY_SCENERY"), src.indexOf("function useScenery"));
  const declared = new Set([...block.matchAll(/([a-zA-Z0-9_]+):/g)].map((m) => m[1]));
  const used = new Set([...src.matchAll(/scenery\.([a-zA-Z0-9_]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((f) => !declared.has(f));
  ok("the blank scenery declares every field the map draws",
    missing.length === 0 || console.log("     fehlt:", missing.join(", ")));
  ok("the blank scenery is not itself empty", declared.size > 20);
}

// ── 12. NOTHING RENDERS ON A THIN PROFILE ───────────────────────────────────
// Save files from older builds lack fields that newer screens expect. Rendering
// each screen against a profile stripped of its optional parts proves no screen
// assumes more than it is given.
{
  const thin = defaultProfile();
  delete thin.codex; delete thin.records; delete thin.loadout.boosts;
  const t = makeT("de");
  const cases = [
    ["treasury", () => html(<AchievementsScreen profile={thin} t={t} dispatch={() => {}} initialOpenId="wins" />)],
    ["court", () => html(<ArmyScreen profile={thin} dispatch={() => {}} t={t} />)],
    ["chronicle", () => html(<ArmyScreen profile={thin} dispatch={() => {}} t={t} initialTab="chron" />)],
  ];
  for (const [name, fn] of cases) {
    let survived = true;
    try { fn(); } catch (e) { survived = false; console.log("     ", name, "→", e.message); }
    ok(`${name} survives a profile with missing optional parts`, survived);
  }
}

// ── 10. THE SIMPLE PIECES MUST BE READABLE AND COMPLETE ─────────────────────
// The vector set exists for one reason: recognition at a glance. That means a
// shape for EVERY figure (the Gambit borrowed the pawn's for months) and a
// contour on BOTH sides (gold pieces carried none at all and melted into a
// light square).
{
  const kinds = [...new Set(CHARACTER_LIST.map((c) => c.kind))];
  const missing = kinds.filter((k) => !PIECE_ART[k]);
  ok("every figure kind owns a vector shape",
    missing.length === 0 || console.log("     ", missing.join(", ")));
  ok("the Gambit has a silhouette of its own", !!PIECE_ART.GAMBIT);
  ok("and it is not simply the pawn's", PIECE_ART.GAMBIT !== PIECE_ART.P);

  const svg = (p) => html(<PieceGlyph piece={piece(p)} artStyle="svg" />);
  const mine = svg({ color: "w", kind: "N" });
  const foe = svg({ color: "b", kind: "N" });
  const rimOf = (m) => (m.match(/--rim:\s*([^;"]+)/) || [])[1];
  ok("your pieces wear a contour", !!rimOf(mine));
  ok("the enemy's pieces wear one too", !!rimOf(foe));
  ok("the two contours are opposites, not the same tone", rimOf(mine) !== rimOf(foe));
  ok("the contour has real weight", mine.includes("--rimW"));

  // the Gambit must actually render its own shape, not the pawn's
  const gambit = html(<PieceGlyph piece={piece({ color: "w", kind: "P", hero: true })} artStyle="svg" pov="w" />);
  const pawn = html(<PieceGlyph piece={piece({ color: "w", kind: "P" })} artStyle="svg" pov="w" />);
  ok("the Gambit draws its own figure on the board", gambit !== pawn);
}

// ── 11. EVERY MONSTER ITS OWN FACE ──────────────────────────────────────────
// Twenty-five monsters once shared five family silhouettes: in simple mode the
// Warden, the Bulwark, the Cannoneer, the Colossus and Ironfist were the same
// drawing. A campaign of champions cannot have five faces.
{
  const missing = BOSSES.filter((b) => !BOSS_ART[b.id]).map((b) => b.id);
  ok("every monster owns a silhouette of its own",
    missing.length === 0 || console.log("     ", missing.join(", ")));

  const shapes = new Set(BOSSES.map((b) => BOSS_ART[b.id] || BOSS_ART[b.art]));
  ok(`all ${BOSSES.length} monsters look different from one another`, shapes.size === BOSSES.length);

  ok("the family shapes survive as a fallback for anything new",
    ["golem", "beast", "serpent", "wraith", "tyrant"].every((f) => !!BOSS_ART[f]) && !!BOSS_ART._default);

  // each drawing must actually carry the theme variables, or it cannot be
  // recoloured for the enemy and would render as a flat default
  const flat = BOSSES.filter((b) => BOSS_ART[b.id] && !BOSS_ART[b.id].includes("var(--fill")).map((b) => b.id);
  ok("every monster drawing takes the board's colours",
    flat.length === 0 || console.log("     ", flat.join(", ")));
  const noRim = BOSSES.filter((b) => BOSS_ART[b.id] && !BOSS_ART[b.id].includes("var(--rim")).map((b) => b.id);
  ok("and every one of them wears the contour",
    noRim.length === 0 || console.log("     ", noRim.join(", ")));

  // a monster renders its OWN shape on the board, not its family's
  const asBoss = (bossId, art) => html(<PieceGlyph piece={piece({ kind: "X", color: "b", bossId, art })} artStyle="svg" pov="w" />);
  ok("two monsters of one family draw differently", asBoss("b01", "golem") !== asBoss("b06", "golem"));
}

// ── 12. THE RULES MUST BE SAID OUT LOUD ─────────────────────────────────────
// Two orbs decide every exchange, and an attacker springs BACK when the
// defender survives — which reads as a bug to anyone who was never told. The
// briefing must appear before a life battle, and must stay away once waved off.
{
  const hpNode = CAMPAIGN.find((n) => n.rules === "hp");
  ok("the campaign has a life battle to brief for", !!hpNode);
  const t = makeT("de");
  // A campaign station tells its tale FIRST — the briefing waits behind the
  // story card, so a quick life battle (no tale) is where it shows on sight.
  const screen = (prof) => html(<GameScreen profile={prof} dispatch={() => {}} t={t}
    quick={{ mapId: "classic", mode: "hp", difficulty: "easy" }} />);

  const fresh = screen(defaultProfile());
  ok("a life battle explains the blue orb", fresh.includes(t("hpb.atk").slice(0, 30)));
  ok("a life battle explains the red orb", fresh.includes(t("hpb.hp").slice(0, 30)));
  ok("and it explains the rebound", fresh.includes(t("hpb.bounce").slice(0, 40)));
  ok("the briefing offers a way to silence it", fresh.includes(t("hpb.never")));

  const quiet = screen({ ...defaultProfile(), notices: { hpBrief: true } });
  ok("once waved off it stays away", !quiet.includes(t("hpb.bounce").slice(0, 40)));

  // and the same lesson must be readable later, on demand — the academy is a
  // stepper, so every page gets rendered and searched
  const pages = Array.from({ length: 14 }, (_, n) =>
    html(<TutorialScreen t={t} en={false} onDone={() => {}} startAt={n} />)).join("");
  ok("the academy teaches the two orbs", pages.includes("Die zwei Kugeln") && pages.includes("Kampfkraft"));
  ok("the academy teaches the rebound", pages.includes("Rückprall") && pages.includes("ZURÜCK"));
  ok("the academy shows the actual orbs, not a stand-in", pages.includes("data:image/webp"));
}

// ── 13. THE MENU MUST NOT BE A DEAD END ─────────────────────────────────────
// On a wide screen the main rail stays visible during a match, and tapping it
// did nothing whatsoever — the fight simply kept rendering over the tab you
// picked. It asks now, and it must say the TRUTH about the cost: a campaign
// fight is saved, a quick or online game is forfeited.
{
  const t = makeT("de");
  const paused = html(<LeaveMatchAsk t={t} resumable onLeave={() => {}} onStay={() => {}} />);
  const lost = html(<LeaveMatchAsk t={t} resumable={false} onLeave={() => {}} onStay={() => {}} />);

  ok("leaving a campaign fight promises it is saved", paused.includes(t("leave.pause").slice(0, 30)));
  ok("leaving a quick game warns that it is lost", lost.includes(t("leave.quit").slice(0, 30)));
  ok("the two cases do not read the same", paused !== lost);
  ok("both offer a way back to the board", paused.includes(t("leave.stay")) && lost.includes(t("leave.stay")));
  // rendered markup escapes "&" — compare like for like
  const esc = (x) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  ok("the campaign button speaks of pausing", paused.includes(esc(t("leave.pauseGo"))));
  ok("the quick-game button speaks of forfeiting", lost.includes(esc(t("leave.quitGo"))));

  // the warning must exist in both tongues, or an English player gets nothing
  const te = makeT("en");
  ok("the question is asked in English too",
    html(<LeaveMatchAsk t={te} resumable onLeave={() => {}} onStay={() => {}} />).includes(esc(te("leave.pauseGo"))));
}

// ── 14. THE REGISTER READS LIKE A CHRONICLE ─────────────────────────────────
// Three things were asked for repeatedly and kept slipping: the house caption
// belongs UNDER a figure's name (it sat in the tile's top-right corner), every
// tile should carry its bare vector figure in that corner instead, and the
// twenty-five masters should stand in ONE hall rather than five thin rows of
// question marks.
{
  const t = makeT("de");
  const prof = withProgressPct(defaultProfile(), 100, 5);
  const tree = html(<ArmyScreen profile={prof} dispatch={() => {}} t={t} initialTab="tree" />);
  /* ── DIE KACHELN TRAGEN IHRE KULISSEN (v1.14.0) ─────────────────────────
     Das Verzeichnis rendert unter SSR nicht (es wartet auf seine Gemaelde),
     also misst messe_kulissen.mjs im echten Chromium, ob jede Kachel ihr
     Bild traegt. Hier bleibt, was SSR pruefen kann: dass die Listen
     zusammenhalten und die Kachel ueberhaupt danach greift. */
  {
    const { BUENDE } = await import("./src/content/buende.js");
    const { MEISTER_KULISSE, MONSTER_GRUPPE, GROSSMEISTER_IDS } = await import("./src/app/ui/kulissen.js");
    const { KULISSE_URL } = await import("./src/app/ui/KulissenBilder.jsx");
    ok("jeder Grossmeister aus LEAGUE_BOSSES hat einen Kulisseneintrag",
      GROSSMEISTER_IDS.every((id) => MEISTER_KULISSE[id]));
    const gruppen = [...new Set(Object.values(MONSTER_GRUPPE))].map((g) => `monster-${g}`);
    const namen = [...Object.values(MEISTER_KULISSE), ...gruppen, ...Object.keys(BUENDE).map((b) => `bund-${b}`), "drache", "figur-bauer", "figur-gambit"];
    ok(`jeder Kulissenname hat sein Bild (${namen.length})`, namen.every((n) => KULISSE_URL[n]));
    const arm = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
    ok("die Kachel greift nach kulisseFuer({ charId, bossId })", arm.includes("kulisseFuer({ charId: artId, bossId })"));
    ok("und die Monsterkacheln reichen ihre Boss-Id durch", (arm.match(/<Tile key=\{b\.id\} img=\{img\} bossId=\{b\.id\}/g) || []).length === 3);
    /* die globale Einblendregel darf Bilder mit eigener Deckung nicht mehr
       auf 1 festnageln - Messbefund, siehe messe_kulissen.mjs */
    const main = readFileSync("src/app/main.jsx", "utf8");
    ok("die Einblendregel nimmt Bilder mit eigener Deckung aus", main.includes("img[data-gg-loaded]:not([data-gg-still])"));
    const be = readFileSync("src/app/ui/BundErwacht.jsx", "utf8");
    ok("das Bundfenster nimmt seine Kulisse ebenfalls aus", be.includes('data-gg-still=""'));
  }  // ── DER GROSSE DRACHE IM BLATT (Besitzer, v0.72.3) ──────────────────────
  // Er deckt 2x2 und schiebt diesen Block - das Blatt zeigte ihn als Punkt.
  {
    const dia = html(<MoveDiagram kind="D" />);
    const gold = (dia.match(/linear-gradient\(160deg,#e7c877,#b1863c\)/g) || []).length;
    ok("the dragon covers four squares, not one", gold >= 4);
    const blau = (dia.match(/rgba\(74,163,232,\.42\)/g) || []).length;
    ok("and his step reaches beyond the block", blau >= 8);
  }

  ok("the register opens", tree.length > 1000);
  // the chronicle waits for its paintings, so the grid itself is proven in the
  // browser (test_layout); what SSR can prove is the NAMING and the card
  ok("the register knows a single hall for the masters", !!t("tree.masters") && t("tree.masters") !== "tree.masters");
  ok("nothing still says the old house names",
    !tree.includes("Kronenfiguren") && !tree.includes("Schattenwesen"));

  // The tiles themselves need loaded paintings, so their geometry is proven in
  // the browser (test_layout). Here we hold the naming and the corner rule.
  ok("no caption is pinned to a tile corner", !/top:4px;right:6px/.test(tree));
}

// ── 15. THE OPENED PLATE PUTS ITS EMBLEM ON STAGE ───────────────────────────
{
  const t = makeT("de");
  const prof = { ...defaultProfile(), stats: { wins: 30, games: 60 } };
  const open = html(<AchievementsScreen profile={prof} t={t} initialOpenId="wins" />);
  const shut = html(<AchievementsScreen profile={prof} t={t} />);

  ok("opening stands the plate upright (emblem on top)", open.includes("flex-direction:column"));
  ok("the emblem grows when opened", /width:104px/.test(open) && !/width:104px/.test(shut));
  ok("it rises into place", open.includes("ggMedalRise"));
  ok("its ring of light turns", open.includes("ggRingSpin"));
  ok("sparks leave the rim", (open.match(/ggSpark/g) || []).length >= 4);
  ok("each spark rides its own tangent", /--a:\s*\d+deg/.test(open));
  ok("a closed plate stays quiet", !shut.includes("ggSpark") && !shut.includes("ggRingSpin"));
}

// ── 16. THE COURT WARNS WHILE A FIGHT RESTS ─────────────────────────────────
/* ── DIE BUNDTAFEL AUF DEM BLATT (v1.16.0) ─────────────────────────────────
   Besitzerentscheid: die Kachel traegt nur den Namen; Bund, Kapitel, Gruppe
   und Herkunft stehen beim Antippen. Gerendert geprueft. */
{
  const { BundTafel, herkunftsWort } = await import("./src/app/ui/BundTafel.jsx");
  const { BUENDE } = await import("./src/content/buende.js");
  const { LEAGUE_BOSSES } = await import("./src/content/index.js");
  const p0 = defaultProfile();
  const m = html(<BundTafel profile={p0} charId="paladin" en={false} status="eigen" />);
  ok("der Paladin sieht seinen Bund: Krone", m.includes("Bund · Krone") && m.includes('data-bundtafel="bund-krone"'));
  ok("mit der Regel des Bundes", m.includes(BUENDE.krone.regelDe));
  ok("und beiden Mitgliedern samt Stufe", m.includes('data-mitglied="paladin"') && m.includes('data-mitglied="king"') && /data-stufe="\d+"/.test(m));
  ok("und dem Stand: 0 von 2 auf Hoechststufe", m.includes("0 von 2 auf Höchststufe"));
  const pMax = { ...p0, pieces: { ...p0.pieces, levels: { ...(p0.pieces?.levels || {}), paladin: 10, king: 10 } } };
  const m2 = html(<BundTafel profile={pMax} charId="paladin" en={false} />);
  ok("stehen alle auf Zehn, heisst es: erwacht", m2.includes("erwacht"));
  const m3 = html(<BundTafel profile={p0} charId="pawn" en={false} status="eigen" />);
  ok("der Bauer hat keinen Bund - das Blatt sagt es und zeigt trotzdem seine Kulisse", m3.includes("Ohne Bund") && m3.includes('data-bundtafel="figur-bauer"'));
  const m4 = html(<BundTafel profile={p0} charId="dragon" en={false} />);
  ok("der Drache: erbeutetes Ungeheuer, kein Bund", m4.includes("Ungeheuer") && m4.includes('data-bundtafel="drache"'));
  const m5 = html(<BundTafel profile={p0} bossId={LEAGUE_BOSSES[6]} en={false} status="verbuendet" />);
  ok("ein Grossmeister nennt sein Kapitel (VII) und die Herkunft", m5.includes("Großmeister · Kapitel VII") && m5.includes("Verbündet"));
  const m6 = html(<BundTafel profile={p0} bossId="b03" en={false} status="gesichtet" />);
  ok("ein Monster nennt seine Gruppe (Brut) und die Herkunft", m6.includes("Gruppe · Brut") && m6.includes("Gesichtet") && m6.includes('data-bundtafel="monster-brut"'));
  const m7 = html(<BundTafel profile={p0} charId="paladin" en={true} />);
  ok("auf Englisch: Covenant · Crown", m7.includes("Covenant · Crown") && m7.includes(BUENDE.krone.regelEn));
  ok("die Herkunftsworte sind die alten Kachelworte", herkunftsWort("eigen", false) === "Im Hof" && herkunftsWort("begegnet", true) === "Met in battle");
  const arm = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("das Figurenblatt traegt die Tafel", arm.includes('<BundTafel profile={profile} charId={char.id}'));
  ok("und das Monsterblatt auch", arm.includes('<BundTafel profile={profile} bossId={b.id}'));
}

/* ── DAS TALENT-FREISCHALTFENSTER (v1.20.0) ─────────────────────────────────
   Uebergabe, Punkt 4: wie das Bundfenster - Figur links, Zugdiagramm rechts.
   Gerendert geprueft, mit einem Talent, das einen Zug hat, und einem ohne. */
{
  const { AufstiegsFeier } = await import("./src/app/ui/screens/ArmyScreen.jsx");
  const { paintedById } = await import("./src/app/ui/board/paintedArt.js");
  const t = makeT("de");
  const mitZug = html(<AufstiegsFeier art="faehigkeit" bild={paintedById("knight")} charId="knight" kind="N" abId="knight_longleap"
    ab={{ icon: "✦", name: "Sprung", desc: "…" }} chName="Springer" t={t} onClose={() => {}} />);
  ok("das Fenster steht (data-talentfenster)", mitZug.includes('data-talentfenster="knight_longleap"'));
  ok("links die Figur vor ihrer Kulisse", mitZug.includes('data-kulisse="bund-geleit"') && mitZug.includes("<img"));
  /* das Diagramm ist ein Raster aus divs, kein SVG; sein Kennzeichen ist der
     Figurenpunkt im 8-px-Feld - und das grosse Zeichen (44 px) fehlt dann */
  ok("rechts das Zugdiagramm, wenn das Talent einen Zug hat", mitZug.includes("font-size:8px") && !mitZug.includes("font-size:44px"));
  const ohne = html(<AufstiegsFeier art="faehigkeit" bild={paintedById("king")} charId="king" kind="K" abId="__kein_zug__"
    ab={{ icon: "♛", name: "Krone", desc: "…" }} chName="Koenig" t={t} onClose={() => {}} />);
  ok("ohne Zug steht rechts das Zeichen des Talents, gross", ohne.includes("♛") && ohne.includes("font-size:44px"));
}

/* ── DAS STUFEN-ABZEICHEN (v1.21.0) ────────────────────────────────────────
   Drei Ebenen: Form nach Bund, Farbe der Figur, Metall nach Stufe. */
{
  const { StufenAbzeichen, metallFuer } = await import("./src/app/ui/StufenAbzeichen.jsx");
  const { formFuer } = await import("./src/app/ui/kulissen.js");
  ok("Bronze 1-3, Silber 4-6, Gold 7-9, Gold auf Zehn",
    ["bronze","bronze","bronze","silber","silber","silber","gold","gold","gold","gold"].every((m, i) => metallFuer(i + 1, 10) === m));
  ok("der Gambit misst sich an seiner eigenen Hoechststufe", metallFuer(12, 12) === "gold" && metallFuer(4, 12) === "bronze");
  ok("Krone: Medaillon, Geleit: Schild, Konzil: Banner, Schatten: Siegel",
    formFuer({ charId: "king" }) === "medaillon" && formFuer({ charId: "knight" }) === "schild" && formFuer({ charId: "queen" }) === "banner" && formFuer({ charId: "mage" }) === "siegel");
  ok("Grossmeister: Medaillon, Gemaeuer: Schild, Gesindel: Banner, Brut: Siegel, Drache: Siegel",
    formFuer({ bossId: "b12" }) === "medaillon" && formFuer({ bossId: "b01" }) === "schild" && formFuer({ bossId: "b04" }) === "banner" && formFuer({ bossId: "b03" }) === "siegel" && formFuer({ charId: "dragon" }) === "siegel");
  const m = html(<StufenAbzeichen form="medaillon" stufe={10} maxStufe={10} farbe="#05479e" />);
  ok("auf Zehn: goldenes Medaillon mit Lorbeer", m.includes('data-metall="gold"') && m.includes('data-lorbeer="1"') && m.includes("#sa-medaillon") && m.includes("#sa-zier-gold"));
  const sch10 = html(<StufenAbzeichen form="schild" stufe={10} farbe="#9e1d05" />);
  ok("der Lorbeer waechst auch um den Schild", sch10.includes('data-lorbeer="1"'));
  ok("das Innenfeld traegt die Figurenfarbe, kraeftiger gestellt", /--t:#[0-9a-f]{6}/.test(m) && !m.includes("--t:#05479e") && !readFileSync("src/app/ui/abzeichenDefs.js", "utf8").includes('class="ton"'));
  const b = html(<StufenAbzeichen form="schild" stufe={2} farbe="#9e1d05" />);
  ok("auf Zwei: bronzener Schild ohne Lorbeer, mit Hammerschlag", b.includes('data-metall="bronze"') && !b.includes("data-lorbeer") && b.includes("#sa-zier-bronze"));
  const g = html(<StufenAbzeichen form="siegel" stufe={9} farbe="#935a9e" grau />);
  ok("Fremdes ist grau, ohne Metall und Zierat", g.includes('data-metall="grau"') && !g.includes("sa-zier"));
  const arm = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  ok("die Kachel traegt das Abzeichen und der Hofstaat die Zeichnung einmal", arm.includes("<StufenAbzeichen form={formFuer({ charId: artId, bossId })}") && (arm.match(/<AbzeichenDefs \/>/g) || []).length === 1);
}

/* ── DIE VOLLBILD-ANSICHT (v1.22.1) ────────────────────────────────────────
   Kulisse dahinter, Satz lesbar, und vorbereitet fuer "Figur gewonnen". */
{
  const { CharLightbox } = await import("./src/app/ui/screens/ArmyScreen.jsx");
  const { CHARACTERS } = await import("./src/content/index.js");
  const m = html(<CharLightbox char={CHARACTERS.chancellor} en={false} onClose={() => {}} />);
  ok("die Kulisse der Figur steht hinter ihr (Kanzler: Konzil)", m.includes("data-vollbild") && m.includes("bund-konzil"));
  ok("der Satz steht mit 16 px auf der dunklen Platte", m.includes("font-size:16px") && m.includes(CHARACTERS.chancellor.flavorDe));
  const g = html(<CharLightbox char={CHARACTERS.engineer} en={false} onClose={() => {}} titel="Der Techniker hat sich dir angeschlossen"
    aktionen={[{ id: "karte", label: "Zurueck zur Karte" }, { id: "hof", label: "Zum Hofstaat", primary: true }]} />);
  ok("mit Titel und Aktionen wird es der Moment des Gewinnens", g.includes("angeschlossen") && g.includes('data-aktion="karte"') && g.includes('data-aktion="hof"'));
}

/* ── DIE DECKS IM EDITOR (v1.15.0) ─────────────────────────────────────────
   Uebergabe, Punkt 3: drei Aufstellungen je Spieler, "Aufstellung I-III",
   umbenennbar; die Kartenauswahl erst ab Kapitel 5 - davor ist alles 8x8.
   Proben ZUERST geschrieben. */
{
  const t = makeT("de");
  const { mitDeckName, mitAktivemDeck, formationKey } = await import("./src/meta/index.js");
  const frisch = defaultProfile();
  const m1 = html(<ArmyScreen profile={frisch} dispatch={() => {}} t={t} initialTab="formation" />);
  ok("drei Faecher stehen im Editor", (m1.match(/data-deck="\d"/g) || []).length === 3);
  ok("sie heissen Aufstellung I, II, III", m1.includes("Aufstellung I") && m1.includes("Aufstellung II") && m1.includes("Aufstellung III"));
  ok("Fach I ist anfangs aktiv", /data-deck="0"[^>]*data-aktiv="1"/.test(m1));
  ok("vor Kapitel 5 gibt es keine Kartenwahl", !m1.includes(t("army.mapPick")));
  const umbenannt = mitDeckName(mitAktivemDeck(frisch, formationKey("classic", "chess"), 1), formationKey("classic", "chess"), 1, "Sturmreihe");
  const m2 = html(<ArmyScreen profile={umbenannt} dispatch={() => {}} t={t} initialTab="formation" />);
  ok("ein eigener Name steht auf dem Fach", m2.includes("Sturmreihe") && !/Aufstellung II(?!I)/.test(m2));
  ok("und das gewaehlte Fach ist aktiv", /data-deck="1"[^>]*data-aktiv="1"/.test(m2));
  const spaet = { ...frisch, campaign: { ...frisch.campaign, league: 5 } };
  const m3 = html(<ArmyScreen profile={spaet} dispatch={() => {}} t={t} initialTab="formation" />);
  ok("ab Kapitel 5 erscheint die Kartenwahl", m3.includes(t("army.mapPick")));
  const en = makeT("en");
  const m4 = html(<ArmyScreen profile={{ ...frisch, lang: "en" }} dispatch={() => {}} t={en} initialTab="formation" />);
  ok("auf Englisch heissen sie Formation I-III", m4.includes("Formation I") && m4.includes("Formation III"));
}

{
  const t = makeT("de");
  const base = withProgressPct(defaultProfile(), 100, 5);
  const resting = { ...base, pausedMatch: { v: 1, nodeId: "n03", enc: "x", potionsUsed: 0, hourglassUsed: 0 } };
  const withWarn = html(<ArmyScreen profile={resting} dispatch={() => {}} t={t} initialTab="formation" />);
  const without = html(<ArmyScreen profile={base} dispatch={() => {}} t={t} initialTab="formation" />);
  ok("a resting fight is announced in the formation editor", withWarn.includes(t("army.pausedHint").slice(0, 30)));
  ok("with no fight resting the note stays away", !without.includes(t("army.pausedHint").slice(0, 30)));
}

// ── 17. THE FIRST TWO QUESTIONS ─────────────────────────────────────────────
// Piece style and difficulty lived in the profile screen, where a newcomer
// never looks. They are asked once, at the door — and the door must also say
// that nothing is locked in.
{
  const t = makeT("de");
  const intro = html(<GameIntro t={t} dispatch={() => {}} onStart={() => {}} />);
  ok("the door asks which figures you want", intro.includes(t("setup.style").toUpperCase()));
  ok("both piece styles are offered", intro.includes(t("profile.styleSvg")) && intro.includes(t("profile.stylePainted")));
  ok("the door asks how hard it should be", intro.includes(t("setup.diff").toUpperCase()));
  ok("all three difficulties are offered",
    [t("diff.easy"), t("diff.normal"), t("diff.hard")].every((d) => intro.includes(d)));
  ok("it says the campaign climbs on its own", intro.includes(t("setup.diffHint").slice(0, 30)));
  ok("and that both can be changed later", intro.includes(t("setup.lead").slice(0, 30)));
}

// ── 18. FACTS IN THE TREASURY'S OWN WORDS ───────────────────────────────────
// The descriptions must match what the code actually counts. Two were wrong:
// the lightning mate never named its limit, and forgecraft spoke of a "forge"
// the game does not have.
{
  const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
  ok("the lightning mate names its move limit", /40/.test(byId.fast.descDe) && /40/.test(byId.fast.descEn));
  ok("no description invents a forge", !/Schmiede|at the forge/.test(byId.upgrades.descDe + byId.upgrades.descEn));
  ok("forgecraft names the currency it costs", /Skillpunkte|skill points/.test(byId.upgrades.descDe + byId.upgrades.descEn));
  ok("the wayfarer names how many stations exist", /51/.test(byId.stages.descDe));
  ok("every achievement explains itself in both tongues",
    ACHIEVEMENTS.every((a) => a.descDe.length > 40 && a.descEn.length > 40));
  ok("captures make clear whose captures count", /DU|YOU/.test(byId.captures.descDe + byId.captures.descEn));
}

// ── 19. A TAPPED PLATE CATCHES THE LIGHT ────────────────────────────────────
{
  const t = makeT("de");
  const prof = { ...defaultProfile(), stats: { wins: 30, games: 60 } };
  const m = html(<AchievementsScreen profile={prof} t={t} initialOpenId="wins" />);
  ok("the plate carries a sweep of light", m.includes("ggPlateSheen") || m.includes("translateX(-120%)"));
  ok("the emblems are lifted brighter", /brightness\(1\.[23]/.test(m));
}

// ── 17. THE FOUR GAMBITS ────────────────────────────────────────────────────
// A duel is only fair if both sides start on the same budget, so the table of
// clocks is one source of truth for lobby, board and matchmaker.
{
  ok("there are four gambits", TIME_MODES.length === 4);
  ok("every one names itself in both tongues",
    TIME_MODES.every((m) => m.de.name && m.en.name && m.de.blurb && m.en.blurb));
  ok("every one shows its clock at a glance", TIME_MODES.every((m) => m.de.tag && m.en.tag));
  ok("every one carries a colour and a mark", TIME_MODES.every((m) => /^#/.test(m.color) && m.glyph));

  const ids = TIME_MODES.map((m) => m.id);
  ok("the ids are unique", new Set(ids).size === 4);
  ok("exactly one is featured", TIME_MODES.filter((m) => m.featured).length === 1);

  // the clocks must climb: bullet < blitz < rapid < correspondence
  const secs = ["quick", "rush", "prime", "daily"].map((id) => timeModeById(id).base);
  ok("the budgets rise from bullet to correspondence",
    secs.every((v, i) => i === 0 || v > secs[i - 1]));
  ok("the fast formats hand time back", timeModeById("quick").inc > 0 && timeModeById("rush").inc > 0);

  const c = clockFor("rush");
  ok("a clock arrives in the board's own shape", c.type === "total" && c.seconds === 180 && c.inc === 2);
  ok("correspondence is a per-move deadline", clockFor("daily").type === "move");
  ok("an unknown clock falls back rather than crashing", clockFor("nonsense").seconds > 0);
  // correspondence is playable now — its card explains how the format behaves
  ok("correspondence explains itself in both tongues",
    TIME_MODES.some((m) => m.id === "daily" && m.noteDe && m.noteEn));
  ok("no gambit is left merely announced", TIME_MODES.every((m) => !m.pending));
}

// ── 18. THE CHEST IS PAINTED ────────────────────────────────────────────────
// Every item shows its painting wherever it appears — chest, battle HUD, a
// barred path, the academy — because they all pass through ONE component.
{
  const ids = Object.keys(ITEMS);
  const painted = ids.filter((id) => itemArt(id));
  ok(`most of the chest is painted (${painted.length}/${ids.length})`, painted.length >= 12);
  const missing = ids.filter((id) => !itemArt(id));
  ok("what is missing falls back rather than breaking",
    missing.every((id) => html(<ItemIcon id={id} size={22} />).length > 20));
  if (missing.length) console.log("      noch ungemalt:", missing.join(", "));

  const potion = html(<ItemIcon id="potion" size={22} />);
  // (the test bundle inlines assets, so the src is a data URL rather than a
  // hashed filename — what matters is that an IMAGE is drawn, not a glyph)
  ok("a painted item renders as an image", potion.includes("<img") && /src="(data:image|[^"]*\.webp)/.test(potion));
  ok("it is sized as asked", potion.includes("width:22px") && potion.includes("height:22px"));
  ok("and it keeps its aspect", potion.includes("object-fit:contain"));

  // the academy must show the paintings too, not a stray vector
  const t = makeT("de");
  const pages = Array.from({ length: 12 }, (_, n) =>
    html(<TutorialScreen t={t} en={false} onDone={() => {}} startAt={n} />)).join("");
  const imgs = (pages.match(/<img/g) || []).length;
  ok(`the academy shows painted items (${imgs} images drawn)`, imgs >= 2);

  // and its campaign card must match the story as it stands today
  ok("the academy no longer speaks of a League Keep",
    !pages.includes("Ligafeste") && !pages.includes("League Keep"));
  ok("it names the citadel and the grandmaster", pages.includes("Zitadelle") && pages.includes("Großmeister"));
  ok("it teaches the one-spell rule", /pro Partie nur EINE/.test(pages));
  ok("it names the four gambits", ["Quick Gambit", "Rush Gambit", "Prime Gambit", "Classic Gambit"].every((x) => pages.includes(x)));
}

// ── 19. EVERY PIECE OF GEAR OPENS ITS SHEET ─────────────────────────────────
// The sheet reads ITEMS at render time — and a missing import there crashed
import { IC_SPELLSTAR, IC_COIN, IC_SKILL } from "./src/app/ui/assets/icons/iconAssets.js";
// the whole court the moment a row was tapped, while build, smoke and SSR all
// stayed green because nothing ever OPENED it. So each sheet is rendered here.
{
  const t = makeT("de");
  const prof = withProgressPct(defaultProfile(), 100, 5);
  const ids = Object.keys(ITEMS);
  const broken = [];
  for (const id of [...ids, "shard"]) {
    try {
      const m = html(<ArmyScreen profile={prof} dispatch={() => {}} t={t} initialTab="gear" initialGearInfo={id} />);
      if (m.length < 500) broken.push(id + " (leer)");
    } catch (e) { broken.push(id + ": " + e.message.slice(0, 40)); }
  }
  ok(`every sheet opens without crashing (${ids.length + 1})`,
    broken.length === 0 || console.log("     ", broken.join(" | ")));

  const sheet = html(<ArmyScreen profile={prof} dispatch={() => {}} t={t} initialTab="gear" initialGearInfo="bergschluessel" />);
  ok("the sheet shows the painting large", sheet.includes("width:116px"));
  ok("it carries the short line", sheet.includes(ITEMS.bergschluessel.textDe.slice(0, 24)));
  ok("and the longer word beneath", sheet.includes(ITEMS.bergschluessel.loreDe.slice(0, 30)));

  ok("every item has a longer word in both tongues",
    ids.every((id) => ITEMS[id].loreDe && ITEMS[id].loreEn));
  const needsHelper = ["bergschluessel", "kriegsaxt", "donnerpulver", "sternenkompass", "anker", "boat"];
  ok("the pieces that need a companion say so",
    needsHelper.every((id) => /ACHTUNG|NOTE/.test(ITEMS[id].loreDe + ITEMS[id].loreEn)));
  ok("no heart glyph is left in the gear texts",
    ids.every((id) => !/[♥⚔]/.test(ITEMS[id].textDe + ITEMS[id].loreDe)));

  // the shard sits among the wares now, with no pedestal of its own
  const gear = html(<ArmyScreen profile={prof} dispatch={() => {}} t={t} initialTab="gear" />);
  // (a shine elsewhere on the page is fine — what mattered was the shard's OWN
  // gilded plate: its border, its ground and its gold lettering)
  ok("the star shard no longer sits on its own gilded plate",
    !gear.includes("rgba(43, 36, 16, .4)") && !gear.includes("1px solid #8a6d3566"));
  const shardSheet = html(<ArmyScreen profile={prof} dispatch={() => {}} t={t} initialTab="gear" initialGearInfo="shard" />);
  ok("its sheet explains the ration per chapter", /je erreichtem Kapitel/.test(shardSheet));
}

// ── 20. THE MASTERS STAND AS CHESS PIECES ───────────────────────────────────
// They were free-floating creatures with eyes and a mouth — one of them read
// as a smiley. Every one is built on the SAME chess armature now (the queen's
// skirt and collar, since a master takes her square); only the head tells them
// apart. These checks hold that shape.
{
  const bosses = BOSSES.map((b) => BOSS_ART[b.id]).filter(Boolean);
ok("every master has a drawing", bosses.length === BOSSES.length);

  // the shared armature: the queen's skirt and collar, literally the same path
  const SKIRT = "M20 27 L28 27";
  const COLLAR = "M18.4 23 L29.6 23";
  const noStand = BOSSES.filter((b) => !(BOSS_ART[b.id] || "").includes(SKIRT)).map((b) => b.id);
  ok("every master stands on a chess base",
    noStand.length === 0 || console.log("     ", noStand.join(", ")));
  const noCollar = BOSSES.filter((b) => !(BOSS_ART[b.id] || "").includes(COLLAR)).map((b) => b.id);
  ok("and wears the collar of the piece", noCollar.length === 0 || console.log("     ", noCollar.join(", ")));

  // no faces: circles were what made them smile
  const faces = BOSSES.filter((b) => /<circle/.test(BOSS_ART[b.id] || "")).map((b) => b.id);
  ok("none of them has eyes drawn on", faces.length === 0 || console.log("     ", faces.join(", ")));

  // one path each — a silhouette, not an assembly
  const multi = BOSSES.filter((b) => ((BOSS_ART[b.id] || "").match(/<path/g) || []).length !== 1).map((b) => b.id);
  ok("each is a single silhouette", multi.length === 0 || console.log("     ", multi.join(", ")));

  // the heads must actually differ — same skirt means the head carries the identity
  const head = (id) => (BOSS_ART[id] || "").split("M18.4 23")[0];
  const ids = BOSSES.map((b) => b.id);
  const same = [];
  for (let i = 0; i < ids.length; i++)
    for (let j = i + 1; j < ids.length; j++)
      if (head(ids[i]) === head(ids[j])) same.push(`${ids[i]}/${ids[j]}`);
  ok("no two masters share a head", same.length === 0 || console.log("     ", same.join(", ")));

  ok("the queen herself keeps the same stand", (PIECE_ART.Q || "").includes(SKIRT));
}


// ── DER RISSBODEN: WANN REISST ER AUF? ─────────────────────────────────────
// Diese Pruefungen gehoeren HIERHER und nicht in test_saves.mjs: RissBoden.jsx
// importiert zehn .webp-Dateien. Node laedt die nicht von sich aus - die
// Suite starb beim Import, und weil die Kette mit && verbunden ist, fielen
// die fuenf folgenden Suiten stumm mit aus (875 -> 656 Assertions, ohne eine
// einzige Fehlermeldung). Hier buendelt esbuild mit --loader:.webp=dataurl,
// also laeuft der Import.
// ── v1.0.4: DER RISS ENTSTEHT FRUEH UND WAECHST AUS JEDER QUELLE ───────────
{
  const n = (k) => Array.from({ length: k }, (_, i) => "n" + i);
  const st = (c) => rissStufe({ campaign: c });
  ok("frisches Spiel zeigt den ungebrochenen Boden", st({ league: 1, cleared: [], unlocked: [] }) === 1);
  ok("die ersten Stationen lassen den Riss schon aufblitzen",
    st({ league: 1, cleared: n(3), unlocked: [] }) >= 2);
  ok("ein echter Riss steht spaetestens ab Kapitel III",
    st({ league: 3, cleared: [], unlocked: [] }) >= 5);
  ok("die Stufe waechst ueber die Kapitel nie rueckwaerts", (() => {
    let vorher = 0;
    for (const lg of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      for (const k of [0, 25, 50]) {
        const s2 = st({ league: lg, cleared: n(k), unlocked: [] });
        if (s2 < vorher) return false;
        vorher = s2;
      }
    return true;
  })());
  ok("der volle Hofstaat allein reisst den Boden ganz auf",
    st({ league: 1, cleared: [], unlocked: n(27) }) === 10);
  ok("das letzte Kapitel erreicht die letzte Stufe",
    st({ league: 10, cleared: n(50), unlocked: [] }) === 10);
  ok("ohne Profil bleibt es bei Stufe 1", rissStufe(null) === 1);
}



// ── DER NAME IN DER CHRONIK (v1.0.13, Besitzer-Punkt 6) ──────────────────
import { loreText } from "./src/app/ui/worldMap.js";
{
  const t = loreText(9, false, "Manu");
  ok("the chronicle takes the hero's name", t.includes("Manu") && !t.includes("{held}"));
  ok("without a name the chronicle says: Namenloser", loreText(12, false, "").includes("Corvin — und Namenloser"));
  ok("the english chronicle bows too", loreText(1, true, "Ada").includes(", Ada "));
}


// ── DIE KNOPFREGEL (v1.0.16, Besitzer) ──────────────────────────────────────
// "Buttons muessen nicht zweizeilig sein, und der Text darf nie verschwinden."
import { Button as _Btn, Segmented as _Seg } from "./src/app/ui/primitives.jsx";
{
  const h = html(<_Btn>Abgeschlossen</_Btn>);
  ok("a button never shrinks below its longest word", h.includes("min-content"));
  ok("a button wraps instead of clipping", /overflow-wrap:\s*break-word/.test(h) && !/text-overflow/.test(h));
  ok("the side padding survives", /padding:\s*12px 16px/.test(h) && /box-sizing:\s*border-box/.test(h));
  // Ein sehr langes Wort (englische Beschriftungen sind oft laenger)
  const lang = html(<_Btn>Unvergleichlichkeitsbeschriftung</_Btn>);
  ok("even an absurd label keeps hyphenation", /hyphens/.test(lang));
  const seg = html(<_Seg options={[{ value: "a", label: "Aufstellung" }, { value: "b", label: "Figuren" }]} value="a" onChange={() => {}} />);
  const hoehen = [...seg.matchAll(/min-height:\s*(\d+)px/g)].map((m) => +m[1]);
  ok("a switch declares exactly one minimum height per option", hoehen.length === 2);
}


// ── BEIDE SPRACHEN TRAGEN DIESELBEN SCHLUESSEL (v1.0.17, Besitzer) ──────────
// Elf Schluessel fehlten im englischen Block - die ganze Passwort-Karte und
// zwei Weltkarten-Knoepfe. Sie fielen STUMM auf Deutsch zurueck, also stand
// im englischen Spiel "Passwort aendern". Genau das faellt niemandem auf,
// solange es niemand zaehlt.
import { readFileSync as _lies } from "node:fs";
{
  const roh = _lies("src/app/i18n/strings.js", "utf8");
  const schnitt = roh.indexOf("const EN = {");
  const schluessel = (x) => new Set([...x.matchAll(/"([a-zA-Z]+\.[a-zA-Z0-9]+)":/g)].map((m) => m[1]));
  const de = schluessel(roh.slice(0, schnitt)), en = schluessel(roh.slice(schnitt));
  const fehltEn = [...de].filter((k) => !en.has(k));
  const fehltDe = [...en].filter((k) => !de.has(k));
  ok("every german key has an english twin", fehltEn.length === 0);
  if (fehltEn.length) console.log("   ohne Englisch:", fehltEn.slice(0, 12).join(", "));
  ok("and no english key stands alone", fehltDe.length === 0);
  if (fehltDe.length) console.log("   ohne Deutsch:", fehltDe.slice(0, 12).join(", "));
}


// ── KEINE UNSICHTBARE EBENE IM KAMPF (v1.0.25, Besitzer: "es ruckelt") ──────
// Die Halle (MysticBackground) rendert ein 168 % breites Bild MIT CSS-Maske.
// Im Kampf verdeckt das Kapitelgemaelde sie vollstaendig - der Browser rechnete
// sie trotzdem jeden Frame mit. Diese Probe haelt fest, dass die beiden
// Ebenen einander nie ueberlagern.
import { MysticBackground as _MB } from "./src/app/ui/MysticBackground.jsx";
import { BrettHintergrund as _BH } from "./src/app/ui/BrettHintergrund.jsx";
{
  const halle = html(<_MB league={2} />);
  const grund = html(<_BH liga={2} />);
  ok("the hall carries an expensive css mask", /mask-image/.test(halle));
  ok("the board backdrop carries NO mask", !/mask-image/.test(grund));
  ok("and it sits on its own paint layer", /translateZ\(0\)/.test(grund) && /contain:/.test(grund));
  /* v1.0.27 (Besitzer: "die Hintergruende sind immer noch nicht da"): DER
     TEUERSTE FEHLER DIESER REIHE. Das Bild lag im DOM, in voller Groesse,
     mit Deckkraft 1 - und kam nie auf den Schirm: gemessen 0.004 Helligkeit
     statt 0.22. Grund war zIndex -1; der Seitenkoerper traegt Schwarz, und
     ein negativer zIndex malt HINTER den Hintergrund des Stapel-Vorfahren.
     Ein negativer zIndex darf hier nie zurueckkehren. */
  ok("the backdrop is NOT hidden behind the page background",
    !/z-index:\s*-/.test(grund) && /z-index:\s*0/.test(grund));
  // Der Quelltext der App: beide Ebenen haengen am inMatch-Schalter
  const roh = _lies("src/app/App.jsx", "utf8");
  const halleStellen = [...roh.matchAll(/<MysticBackground/g)].length;
  const mitGate = [...roh.matchAll(/!inMatch && <MysticBackground/g)].length;
  ok("every hall render is gated on inMatch", halleStellen > 0 && halleStellen === mitGate);
}


// ── DER KLASSISCHE SATZ FUELLT SEIN FELD (v1.0.26, Besitzer) ────────────────
{
  const glyph = (kind) => html(<PieceGlyph piece={{ kind, color: "w", hp: 0, maxHp: 0, level: 1, abilities: [] }} artStyle="classic" />);
  /* Der AEUSSERE Rahmen misst immer 1em - gemeint ist die Figur darin, also
     der groesste width-Wert im Markup. */
  const groesse = (h) => Math.max(0, ...[...h.matchAll(/width:\s*([0-9.]+)em/g)].map((m) => +m[1]));
  const bauer = groesse(glyph("P")), turm = groesse(glyph("R"));
  ok("the classic pawn fills its square", bauer >= 1.4);
  ok("and stands taller than the rest", bauer > turm);
  /* v1.0.34: der Bauer steht jetzt HOEHER als die uebrigen Figuren - das war
     der ausdrueckliche Wunsch ("Bauern viel groesser, alle anderen minimal
     kleiner"), also misst die Probe genau dieses Verhaeltnis. */
  ok("the rest stepped back a little", turm >= 1.0 && turm < bauer);
  ok("and the pawn now towers over them", bauer - turm >= 0.3);
  /* v1.0.26: die Flug-Fahne muss ANKOMMEN. Stand sie als zweiter
     Funktionsparameter, war sie immer false und das Pop blieb. */
  const ruhig = html(<PieceGlyph piece={{ kind: "R", color: "w", hp: 0, maxHp: 0, level: 1, abilities: [] }} artStyle="classic" fliegt />);
  const normal = html(<PieceGlyph piece={{ kind: "R", color: "w", hp: 0, maxHp: 0, level: 1, abilities: [] }} artStyle="classic" />);
  ok("a flying piece is not told to pop", /animation:\s*none/.test(ruhig) && !/animation:\s*none/.test(normal));
}


// ── DIE RANDWEICHE (v1.0.34, Besitzer) ─────────────────────────────────────
// "Das Zickzack ist doof am Rand, geht gar nicht - dann eher mit Transparenz
// und Schatten." Die gesprungene Kante ist fort. Wichtiger noch: der alte
// Kantenverlauf lag UEBER den Koepfen der hinteren Reihe (gleicher zIndex,
// spaeter im DOM) - genau die Kante, die der Besitzer auf den Figuren sah.
{
  const brett = _lies("src/app/ui/board/BoardView.jsx", "utf8");
  ok("the zigzag fracture is gone", !/viewBox="0 0 100 100"[\s\S]{0,400}path fill="#05070c"/.test(brett));
  ok("the edge veil that cut the heads is gone",
    !/zIndex:\s*3,[\s\S]{0,200}linear-gradient\(180deg, rgba\(5,7,12/.test(brett));
  /* v1.0.48 (Besitzerbefund): DIE RANDWEICHE IST FORT. Sie dunkelte die 28
     Randfelder nach aussen ab - und weil sie AM FELD hing, riss sie an der
     Brettkante hart ab. Genau dort entstand die Stufe, die der Besitzer
     gesehen hat: innen abgedunkelt, direkt daneben der volle Hintergrund.
     Ein Verlauf, der nur bis zur Kante reicht, macht die Kante sichtbarer
     statt weicher.
     An ihrer Stelle liegt ein Schatten NACH AUSSEN unter dem ganzen Brett,
     drei gestaffelte Lagen - das Brett sitzt sichtbar UEBER dem Hintergrund.
     Die Probe haelt beides fest: dass die Weiche wirklich weg ist und dass
     der Schatten wirklich da ist. */
  ok("die Randweiche ist fort", /const randVerlauf = null;/.test(brett));
  ok("und mit ihr die 28 Feldverlaeufe", !/rr === 0\) teile\.push/.test(brett));
  ok("das Brett wirft stattdessen einen Schatten nach aussen",
    /const brettSchatten =/.test(brett) && /boxShadow: brettSchatten/.test(brett));
  ok("der Schatten ist gestaffelt, nicht eine harte Kante",
    (brett.match(/const brettSchatten =[\s\S]{0,220}/)?.[0].match(/rgba\(0,0,0/g) || []).length >= 3);
  ok("im Sparmodus faellt er weg", /gespart\("schatten"\) \? "none"/.test(brett));
  ok("and it costs no css mask any more", !/maskImage: randMaske|WebkitMaskComposite/.test(brett));
  ok("the selected piece gets its own paint layer",
    /willChange: \(!ruhig && \(isSel \|\| isSpy\)\) \? "transform" : "auto"/.test(brett));
  ok("the board fades in once, not 64 times",
    /opacity: artReady \? 1 : 0,\s*\n\s*transition: "opacity 1\.6s/.test(brett));
}



// ── DER ABGEWEHRTE SCHLAG (v1.0.32, Besitzer) ──────────────────────────────
// "Wenn man nicht beim ersten Mal schlaegt, sollte man anders zurueckfliegen,
// und der Angriff sichtbar werden." Die alte Kurve lief symmetrisch hin und
// zurueck - weich, ohne Widerstand. Jetzt: Vorstoss, Aufprall, Rueckschleudern.
{
  const thema = _lies("src/app/ui/theme.js", "utf8");
  const kurve = thema.slice(thema.indexOf("@keyframes ggBounce"));
  const block = kurve.slice(0, kurve.indexOf("}\n") + 400).split("@keyframes")[1] || "";
  ok("the bounce has more than a there-and-back", (block.match(/%\s*\{/g) || []).length >= 5);
  ok("it squashes on impact", /scale\(1\.14,\s*\.88\)/.test(block));
  ok("and is thrown BACK past its own square", /-\.34/.test(block));
  // Der Funke am Beruehrungspunkt
  const brett = _lies("src/app/ui/board/BoardView.jsx", "utf8");
  ok("a spark marks where the strike landed",
    /anim\.bounced && \(\(\) =>/.test(brett) && /ggAufprall .34s/.test(brett));
}


// ── SITZ UND GROESSE AUF DEM BRETT (v1.0.35, Besitzer) ─────────────────────
// "Alle Figuren koennten noch etwas groesser sein, und sie sitzen sehr weit
// unten am Rand." Im laufenden Brett nachgemessen: der Bauer fuellt jetzt
// 133 % der Feldhoehe (vorher 122), der Turm 187 % - eine Figur STEHT auf
// ihrem Feld und waechst nach oben heraus, das ist gewollt. Der Hub hebt sie
// dabei zur Feldmitte, statt sie auf der Kante kleben zu lassen.
{
  const brett = _lies("src/app/ui/board/BoardView.jsx", "utf8");
  const hub = brett.match(/pieceLift = artStyle === "svg" \? "(-?[\d.]+)%" : bigScreen \? "(-?[\d.]+)%" : "(-?[\d.]+)%"/);
  ok("the pieces are lifted off the bottom edge", !!hub && Math.abs(+hub[3]) >= 15);
  const font = brett.match(/kind === "P" \? "([\d.]+)em" : "([\d.]+)em"\);/);
  ok("and every piece grew", !!font && +font[1] >= 1.15 && +font[2] >= 1.35);
}


// ── DER SPARMODUS WIRKT WIRKLICH (v1.0.37, Besitzer) ───────────────────────
// Ein Schalter, der nur im Profil steht und nichts bewegt, waere schlimmer
// als keiner: der Besitzer wuerde damit messen und ein falsches Ergebnis
// bekommen. Diese Probe legt jeden Posten um und sieht im Markup nach.
import { setSparmodus, SPAR_POSTEN, sparsam } from "./src/app/ui/sparmodus.js";
import { BrettHintergrund as _BHG } from "./src/app/ui/BrettHintergrund.jsx";
{
  /* v1.0.48: DREI Posten statt vier. "randweich" ist mit der Randweiche
     selbst gefallen - sie dunkelte die 28 Randfelder ab und riss an der
     Brettkante hart ab, wo der Besitzer eine Stufe sah. Der Schatten, der
     sie ersetzt, haengt am Posten "schatten". */
  ok("three items exist", SPAR_POSTEN.length === 3);
  ok("und randweich ist nicht mehr darunter", !SPAR_POSTEN.includes("randweich"));
  setSparmodus({});
  ok("nothing is saved by default", !sparsam());
  const voll = html(<_BHG liga={2} />);
  ok("the painting is drawn by default", /<img/.test(voll));
  setSparmodus({ gemaelde: true });
  const spar = html(<_BHG liga={2} />);
  ok("and it is GONE when switched off", !/<img/.test(spar));
  ok("the switch reports itself as active", sparsam());
  setSparmodus({});   // fuer alle folgenden Proben zuruecksetzen
  ok("switching back restores it", /<img/.test(html(<_BHG liga={2} />)));
  // Die drei Brett-Posten haengen im BoardView am selben Helfer
  const brett = _lies("src/app/ui/board/BoardView.jsx", "utf8");
  for (const posten of ["schatten", "uebergang"])
    ok(`the board honours "${posten}"`, new RegExp(`gespart\\("${posten}"\\)`).test(brett));
}


// ── DAS BRETT TRAEGT DIE KLEINEN (v1.0.38, BESITZERBEFUND) ─────────────────
// Der Besitzer fand, woran ich vorbeigemessen hatte: klassisches Schach
// laeuft fluessig, mit den GEMALTEN Figuren ruckelt es. Der Grund steckt in
// den Bildern - 576x576 gegen 224x384, also viermal so viele Pixel, auf ein
// 50-px-Feld heruntergerechnet. Beim Antippen waechst die Auswahl auf 1,58,
// und alle 32 Figuren muessen neu abgetastet werden.
import { PAINTED, PAINTED_KLEIN } from "./src/app/ui/board/paintedArt.js";   /* paintedForPiece steht oben schon */
{
  const gross = Object.keys(PAINTED).filter((k) => PAINTED_KLEIN[k]);
  ok("every painted piece owns a small twin", gross.length >= 60);
  ok("and the twins are NOT the same files",
    gross.every((k) => PAINTED[k] !== PAINTED_KLEIN[k]));
  const figur = { kind: "N", color: "w", hero: false, level: 1, abilities: [] };
  ok("the board asks for the small one", paintedForPiece(figur, true) !== paintedForPiece(figur, false));
  ok("everything else still gets the big one",
    Object.values(PAINTED).includes(paintedForPiece(figur, false)));
  // und im Markup: das Brett reicht die Fahne durch
  const brett = _lies("src/app/ui/board/BoardView.jsx", "utf8");
  ok("the board passes the flag on every piece", (brett.match(/<PieceGlyph aufsBrett/g) || []).length >= 3);
}

/* ── DER SOCKEL, RICHTIG GEMESSEN (v1.0.56) ────────────────────────────────
   Der Besitzer meldete dreimal, dass Figuren nebeneinander nicht mittig
   stehen - Laeufer, Schildtraeger, Dame. Meine Messung sagte jedes Mal
   "fast zentriert", weil sie ab Alpha 12 zaehlte und damit den weichen
   Schlagschatten mitnahm; der liegt symmetrisch um die Figur, egal wo der
   Sockel steht. Ab Alpha 60 zaehlt nur das Holz - und dann sind es 9.0 %,
   6.1 % und 3.8 %, genau die drei in genau der Reihenfolge.
   Diese Probe haelt fest, dass die Werte in der Groessenordnung bleiben:
   waere jemand versucht, wieder mit einer weichen Schwelle zu messen,
   faellt die Tabelle sofort auf nahezu Null zusammen. */
{
  /* ── DIE BILDER STEHEN SELBST GERADE (v1.0.62) ───────────────────────────
     Fuenf Runden Code-Verschieberei sind Geschichte: der Sockelfuss sitzt
     jetzt IN JEDEM BILD mittig, und keine Ansicht darf mehr verschieben.
     Diese Proben halten beides fest - die Bilder UND das Verbot. */
  {
    const { sockelVersatz } = await import("./src/app/ui/board/paintedArt.js");
    ok("die Tabelle ist stillgelegt (Vertrag: immer 0)",
      ["bishop", "guardian", "queen", "boss-b04", "gibtsnicht"].every((id) => sockelVersatz(id) === 0));
    const { readFileSync: _rf3 } = await import("node:fs");
    const armee = _rf3("src/app/ui/screens/ArmyScreen.jsx", "utf8");
    const glyph = _rf3("src/app/ui/board/PieceGlyph.jsx", "utf8");
    ok("der Hofstaat verschiebt nicht mehr", !/sockelVersatz\(/.test(armee));
    ok("das Brett verschiebt nicht mehr", !/sockelVersatz\(/.test(glyph) && !/sockelX/.test(glyph));
    const { PngLeser: _x } = {};
    // Stichprobe an den drei alten Suendern: Sockelfuss wirklich mittig?
    const { default: sharp } = await import("sharp").catch(() => ({ default: null }));
    if (sharp) {
      for (const n of ["bishop", "guardian", "queen"]) {
        const { data, info } = await sharp(`src/app/ui/assets/painted/painted-${n}.webp`)
          .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        let unten = -1;
        for (let y = info.height - 1; y >= 0 && unten < 0; y--)
          for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 60) { unten = y; break; }
        let mi = 1e9, ma = -1;
        for (let y = Math.max(0, unten - 4); y <= unten; y++)
          for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 60) { if (x < mi) mi = x; if (x > ma) ma = x; }
        const dx = (mi + ma + 1) / 2 - info.width / 2;
        ok(`der Sockelfuss von ${n} steht mittig (|${dx.toFixed(1)}| < 3px)`, Math.abs(dx) < 3);
      }
    } else ok("sharp fehlt - Sockel-Stichprobe uebersprungen", true);
  }
  const { readFileSync: _rfA } = await import("node:fs");
  const art = _rfA("src/app/ui/board/paintedArt.js", "utf8");
  const y = art.match(/const GAMBIT_TIER_Y = \[([^\]]+)\]/)[1].split(",").map(Number);
  /* v1.0.73: DIESE PROBE HAT SICH UMGEDREHT - bewusst, auf Besitzerbefehl.
     Bis v1.0.72 sollte die Staffel STEIGEN (jeder Rang etwas hoeher). Der
     Besitzer will das Gegenteil: "genau gleich gross wie die Bauern und auch
     genau in der gleichen Position". Also ist die Staffel jetzt FLACH, und
     die Probe haelt genau das fest - sonst kaeme das Wachsen beim naechsten
     Umbau unbemerkt zurueck. */
  ok("die Gambit-Staffel ist flach (kein Rang ragt heraus)", y.every((v) => v === y[0]));
  const hArr = art.match(/const GAMBIT_TIER_H = \[([^\]]+)\]/)[1].split(",").map(Number);
  ok("auch die Hoehenstaffel ist flach", hArr.every((v) => v === hArr[0]));
  ok("und beginnt nahe der Bauernlinie, nicht bei den Offizieren", y[0] > -0.09);
}

/* ── TILE IST EIN PROPS-BAUSTEIN (v1.0.59, nach Live-Absturz) ──────────────
   "ch is not defined" stand auf dem Fehlervorhang des Besitzers: mein
   v1.0.56-Edit hatte in die generische Tile-Kachel Variablen aus champTile
   kopiert (ch, cid), die es dort nie gab. Die Render-Proben fingen es
   nicht, weil die Kacheln erst nach dem Bild-Vorladen erscheinen
   (artReady) - im Server-Rendering laeuft kein Effekt, Tile rendert nie.
   Diese Probe prueft darum die STRUKTUR: innerhalb der Tile-Definition
   duerfen ch und cid nicht vorkommen. */
{
  const { readFileSync: _rf2 } = await import("node:fs");
  const q = _rf2("src/app/ui/screens/ArmyScreen.jsx", "utf8");
  const von = q.indexOf("const Tile = (");
  const bis = q.indexOf("\n  const ", von + 10);
  const tile = q.slice(von, bis);
  ok("Tile existiert und ist abgegrenzt", von > 0 && bis > von);
  ok("Tile greift nicht auf ch zu", !/\bch\./.test(tile));
  ok("Tile greift nicht auf cid zu", !/\bcid\b/.test(tile));
}

/* ── DIE FEHLLISTE RECHNET SICH SELBST (v1.0.64) ───────────────────────────
   Die Schaukammer zeigt seit v1.0.64 einen Reiter "Fehlt noch". Er darf
   nicht von Hand gepflegt sein - eine abgeschriebene Liste steht am Tag des
   ersten neuen Gemaeldes falsch da, und niemandem faellt es auf. Diese
   Probe haelt beides fest: die Liste nennt genau die Arten OHNE Bild, und
   fuer jede davon gibt es wirklich eine Ersatzzeichnung, sonst zeigte der
   Reiter leere Kacheln. */
{
  const { fehlendeSperrBilder, sperrBild, SPERR_ZUSTAENDE } =
    await import("./src/app/ui/board/sperrenArt.js");
  const { hatVektor } = await import("./src/app/ui/board/sperrenVektor.jsx");
  const fehlt = fehlendeSperrBilder();
  /* v1.0.89: alle Gemaelde sind da - die Liste MUSS leer sein. Und sie zaehlt
     je Art nur die Zustaende, die diese Art ueberhaupt hat. */
  ok("die Fehlliste ist leer - alle Sperren sind gemalt", fehlt.length === 0);
  ok("vier Zustaende moeglich (heil, angeschlagen, schwer, Truemmer)", SPERR_ZUSTAENDE.length === 4);
  ok("die Mauer steht NICHT darin - sie ist gemalt",
    !fehlt.some((f) => f.art === "mauer"));
  ok("kein Eintrag hat in Wahrheit doch ein Bild",
    fehlt.every((f) => !sperrBild(f.art, f.zustand)));
  ok("jede Luecke traegt eine Ersatzzeichnung",
    fehlt.every((f) => hatVektor(f.art)));
}

/* ── DREI BESITZERBEFUNDE VOM 10.8. (v1.0.65) ──────────────────────────────
   Alle drei sind STRUKTURPROBEN am Quelltext, weil die Ursachen dort liegen
   und beim naechsten Umbau leicht zurueckfallen. Die Abnahme selbst geschah
   am lebenden DOM (messe_hofstaat.mjs). */
{
  const { readFileSync: _rf3 } = await import("node:fs");
  const q = _rf3("src/app/ui/screens/ArmyScreen.jsx", "utf8");

  /* 1. Ein ueberbreites Bild laesst sich mit auto-Raendern NICHT zentrieren:
        CSS verwirft bei ueberbestimmten Raendern den rechten und macht den
        linken zu null - das Bild haengt rechts ueber. Genau das war der
        Versatz von 7,78 %, den der Besitzer viermal gemeldet hat. */
  const ueberbreit = /width:\s*"1[1-9]\d?%"[^}]*margin:\s*"0 auto/.test(q);
  ok("kein ueberbreites Kachelbild mehr mit auto-Raendern", !ueberbreit);
  /* v1.0.87: die Zentrierung ueber Transform ist ABGESCHAFFT - sie griff nach
     dem Tabwechsel spaeter als der Rand (Besitzer-Screenshot: Bilder um die
     halbe Breite rechts). Jetzt zentriert der Rand allein. */
  ok("die Kachel zentriert ueber den Rand allein, ohne Transform",
    /margin:\s*"0 0 -7px -9%"/.test(q) && !/margin:\s*"0 0 -7px 50%"/.test(q));

  /* v1.0.97: die Werkbank muss ALLE Kapitel der Kampagne anbieten - eine
     feste Liste war bei 10 stehengeblieben, waehrend die Kampagne 12 hat. */
  {
    const ps = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");
    ok("die Werkbank leitet ihre Kapitel aus der Kampagne ab",
      ps.includes("LIGEN_DER_KAMPAGNE") && !ps.includes("{[1,2,3,4,5,6,7,8,9,10].map"));
    const st = readFileSync("src/app/i18n/strings.js", "utf8");
    ok("der Werkbank-Hinweis nennt Kapitel 12 als Vollausbau, in beiden Sprachen",
      st.includes("Kapitel 12 ist der Vollausbau") && st.includes("chapter 12 is the full build"));
  }

  /* v1.1.0: EINE LIVREE. Die Wahl ist fort, DESIGN ist eine Konstante, und
     kein Geraetespeicher und keine Halle darf sie mehr umstellen - genau
     daran hing der falsche Hintergrund. */
  {
    const lv = readFileSync("src/app/ui/livery.js", "utf8");
    ok("die Livree ist eine Konstante", /const DESIGN = "carved"/.test(lv));
    ok("kein Geraetewert kann sie mehr umstellen",
      !/let DESIGN/.test(lv) && lv.includes("localStorage.removeItem(CACHE_KEY)"));
    ok("die Halle liefert nur noch die eine Livree", /fetchHouseDesign\(\)[\s\S]{0,320}return DESIGN;/.test(lv));
    const ps = readFileSync("src/app/ui/screens/ProfileScreen.jsx", "utf8");
    ok("die Design-Wahl steht nicht mehr im Profil",
      !ps.includes("profile.designClassic") && !ps.includes('value: "classic", label'));
    ok("und der Knopf 'fuer alle Spieler' ist fort", !ps.includes("setHouseDesign"));
  }

  /* v1.1.11 (Besitzerauftrag: "Ich wuerde bei allen Texten und Erklaertexten
     die Texte noch ein bisschen reduzieren - dass es nicht ganz so viel
     blabla ist, und in dem Zuge Englisch und Deutsch sauber glattziehen"):
     DIE LEHRTEXTE HABEN EINE OBERGRENZE. Sie erscheinen beim ersten Mal
     mitten im Spiel, und dort liest niemand vier Zeilen. Ausgenommen sind
     drei Texte mit gutem Grund: die Loeschwarnung (rechtlich), die
     Installationsanleitung (jeder Schritt zaehlt) und der Werkbank-Hinweis
     (nur der Admin sieht ihn). */
  {
    const st = readFileSync("src/app/i18n/strings.js", "utf8");
    /* Ausgenommen: Loeschwarnung (rechtlich), Installationsanleitung (jeder
       Schritt zaehlt), Werkbank (nur Admin), Datenschutz (muss praezise sein)
       und der Fehlerbericht-Hinweis (Admin). */
    const AUSNAHMEN = ["profile.delWhat", "profile.installIos", "profile.installHint",
      "profile.devHint", "privacy.body", "profile.reportsHint", "profile.delHalleRest"];
    const paare = [...st.matchAll(/"([a-zA-Z0-9._]+)":\s*"((?:[^"\\]|\\.)*)"/g)];
    const zuLang = paare
      .filter(([, k, v]) => !AUSNAHMEN.includes(k) && v.length > 175)
      .map(([, k, v]) => `${k} (${v.length})`);
    ok("kein Erklaertext ueber 175 Zeichen" + (zuLang.length ? " - zu lang: " + [...new Set(zuLang)].slice(0, 5).join(", ") : ""),
      zuLang.length === 0);
    const lehr = paare.filter(([, k]) => k.startsWith("teach.")).map(([, k, v]) => [k, v.length]);
    const lang = lehr.filter(([, n]) => n > 150);
    ok("kein Lehrtext ueber 150 Zeichen" + (lang.length ? " - " + lang.map(([k, n]) => k + ":" + n).join(", ") : ""),
      lang.length === 0);
    /* beide Sprachen gleich knapp: kein Text darf in einer Sprache doppelt so
       lang sein wie in der anderen - das war der "glattziehen"-Teil. */
    const jeSchluessel = new Map();
    for (const [, k, v] of paare) { const a = jeSchluessel.get(k) || []; a.push(v.length); jeSchluessel.set(k, a); }
    const schief = [...jeSchluessel].filter(([k, n]) => n.length === 2 && !AUSNAHMEN.includes(k)
      && Math.max(...n) > 60 && Math.max(...n) > Math.min(...n) * 1.9).map(([k, n]) => `${k} ${n.join("/")}`);
    ok("beide Sprachen sind aehnlich knapp" + (schief.length ? " - schief: " + schief.slice(0, 4).join(", ") : ""),
      schief.length === 0);
  }

  /* v1.1.12: KEINE DOPPELTE BILDLAST MEHR. Seit v1.1.0 traegt das Haus eine
     Livree; die klassischen Fassungen wurden aber weiter importiert - von
     livery.js ueber pick() und vom Vorlader, der ALLES vorlaedt. Gemessen
     lagen dadurch 3,9 MB im Buendel, die nie gezeigt werden. Diese Probe
     haelt fest, dass keine Datei mit geschnitztem Partner mehr klassisch
     importiert wird. */
  {
    const lv = readFileSync("src/app/ui/livery.js", "utf8");
    ok("livery.js kennt kein pick mehr", !/const pick = /.test(lv) && !/pick\(/.test(lv));
    ok("und keine klassische Fassung mit geschnitztem Partner",
      !/from "\.\/assets\/(bg-hall|board-frame|shield-league|crest-\d|logo|logo-menu|emblem|ground-\d\d)\.webp"/.test(lv));
    const vl = readFileSync("src/app/ui/Vorlader.jsx", "utf8");
    const doppelt = [...vl.matchAll(/from "(\.\/assets\/[^"]+)\.webp"/g)]
      .map((m) => m[1]).filter((f) => !f.endsWith(".carved")
        && existsSync("src/app/ui/" + f + ".carved.webp"));
    ok("der Vorlader laedt keine ueberholte Fassung mehr"
      + (doppelt.length ? " - noch: " + doppelt.slice(0, 4).join(", ") : ""), doppelt.length === 0);
  }

  /* v1.1.15: DIE FIGURENWAHL IST EINE WISCHREIHE (Besitzerwunsch): grosse
     Gemaelde statt 52-px-Bildchen, waagerecht statt scrollende Liste, und mit
     den Talenten, die die Figur lernen KANN. */
  {
    const as = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
    ok("die Wahl ist eine waagerechte Reihe mit Einrasten",
      as.includes('scrollSnapType: "x mandatory"') && as.includes('scrollSnapAlign: "center"'));
    ok("die Figuren stehen gross und wachsen mit dem Schirm",
      as.includes('size={"clamp(64px, 17vw, 88px)"}'));

    ok("und sie zeigen ihre Talente aus der Stufenleiter",
      as.includes("(c.ladder || [])") && as.includes("stufe.ability && ABILITIES[stufe.ability]"));
    ok("die Talente tragen ihre Artfarbe", as.includes("const tg = TAGS[ab.tag];") && as.includes("tg ? tg.color + \"2e\""));
    /* v1.1.17: drei Nachbesserungen nach dem Besitzerbefund "der Slider geht
       gar nicht mehr" und "man weiss ja nicht, wie wo was". */
    ok("die Reihe sagt dem Browser, dass waagerecht gewischt wird",
      as.includes('touchAction: "pan-x"'));
    /* v1.2.1: aus festen Massen wurden mitwachsende (clamp) - die Proben
       pruefen jetzt die Sache, nicht die Zahl. */
    ok("die Karten haben eine feste Mindestbreite und schrumpfen nicht",
      as.includes('flex: "0 0 auto", width: "clamp(118px, 30vw, 150px)"'));
    ok("die Gangart steht in der Karte", as.includes("<MoveDiagram kind={c.kind} moveSpec={c.moveSpec} breite="));
    ok("das funktionslose Mehr ist fort", !as.includes('{t("tree.more")}'));
    /* v1.2.1: die Karte skaliert mit dem Schirm, und ALLES passt darauf. */
    ok("Kartenbreite waechst mit dem Schirm", as.includes('width: "clamp(118px, 30vw, 150px)"'));
    ok("Figur und Gangart skalieren mit",
      as.includes('size={"clamp(64px, 17vw, 88px)"}') && as.includes('breite={"clamp(74px, 20vw, 96px)"}'));
    ok("der Spruch ist fort - er verdraengte die Gangart", !as.includes("{en ? c.flavorEn : c.flavorDe}</span>"));
    ok("der Erklaertext ueber den Plaenen ist fort", !as.includes('{t("army.planHint")}'));
    /* und die Quelle muss wirklich etwas liefern - sonst ist die Reihe leer */
    const { CHARACTER_LIST, ABILITIES } = await import("./src/content/index.js");
    const ohne = CHARACTER_LIST.filter((c) => !(c.ladder || []).some((x) => x.ability && ABILITIES[x.ability]));
    ok(`jede Figur hat Talente in ihrer Leiter (${CHARACTER_LIST.length - ohne.length}/${CHARACTER_LIST.length})`
      + (ohne.length ? " - ohne: " + ohne.slice(0, 4).map((c) => c.id).join(",") : ""), ohne.length === 0);
  }

  /* v1.3.0: DAS LEBENSROHR ersetzt die beiden Zahlenperlen unter jeder
     Figur. Besitzerbefund mit Screenshot: rund siebzig Perlen auf einem
     Brett, bevor ueberhaupt etwas passiert ist. */
  {
    const pg = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
    const lr = readFileSync("src/app/ui/board/LebensRohr.jsx", "utf8");
    ok("das Rohr steht als eigene Komponente", lr.includes("export default function LebensRohr"));
    ok("es ist ein SVG mit gekruemmten Pfaden (CSS kann das nicht)",
      lr.includes("<svg") && lr.includes("const bahn = (px, py, pb, ph)"));
    ok("der Glanz folgt derselben Kruemmung wie das Rohr", lr.includes("const glanzBahn = "));
    ok("die Fuellungen werden am Rohr beschnitten, schliessen also gerade ab",
      lr.includes("clipPath") && lr.includes("<rect x={x0}"));
    ok("die Figur benutzt es statt der Perlen",
      pg.includes("if (ROHR_STATT_PERLEN)") && pg.includes("<LebensRohr lebenAnteil="));
    ok("und es gibt den Schalter zurueck", pg.includes("export const ROHR_STATT_PERLEN"));
    /* v1.3.1 (Besitzerentscheid): GERADE ist die Regel, gekruemmt die
       Ausnahme. Die Kruemmung nimmt die Woelbung des Figurensockels auf - den
       gibt es nur am Brett. */
    ok("gerade ist die Voreinstellung", lr.includes("kruemmung = 0,"));
    ok("nur das Brett bestellt die Kruemmung ausdruecklich",
      pg.includes("kruemmung={ROHR_KRUEMMUNG}"));
    /* und die Zeichenflaeche ist IMMER gleich hoch - sonst saesse das Rohr bei
       einer Figur ohne Talent hoeher als bei einer mit (Besitzerbefund). */
    ok("die Zeichenflaeche haengt nicht davon ab, ob eine Perle da ist",
      lr.includes("const padOben = Math.ceil(pd * 2.1 / 2 + 2);"));
    /* v1.13.2: KEINE TOTE KONSTANTE MEHR. ROHR_HOEHE_VON_ZELLE stand auf
       0,17 und wurde nirgends gelesen, waehrend am Brett fest 0,155 stand.
       Wer die Konstante aenderte, aenderte nichts - eine stille Falle. Diese
       Probe haelt die beiden zusammen: jede exportierte Rohr-Konstante muss
       auch wirklich jemand lesen. */
    {
      const konstanten = [...lr.matchAll(/export const (ROHR_[A-Z_]+|PERLE_[A-Z_]+|REIF_[A-Z_]+)\s*=/g)].map((m) => m[1]);
      const quellen = ["src/app/ui/board/PieceGlyph.jsx", "src/app/ui/screens/ArmyScreen.jsx",
        "src/app/ui/board/LebensRohr.jsx"].map((p) => readFileSync(p, "utf8")).join("\n");
      const tot = konstanten.filter((k) => {
        /* der Export selbst zaehlt nicht als Benutzung - nur Vorkommen
           ausserhalb der Zeile `export const X =`. */
        const treffer = (quellen.match(new RegExp(`\\b${k}\\b`, "g")) || []).length;
        const deklaration = (quellen.match(new RegExp(`export const ${k}\\s*=`, "g")) || []).length;
        return treffer - deklaration === 0;
      });
      ok(`keine tote Rohr-Konstante (${konstanten.length} geprueft)`
        + (tot.length ? " - tot: " + tot.join(", ") : ""), tot.length === 0);
      ok("die Hoehe am Brett kommt aus der Konstante, nicht aus einer nackten Zahl",
        pg.includes("ROHR_HOEHE_VON_ZELLE.toFixed(3)"));
      /* GEGENPROBE: ohne sie koennte die Probe oben bestehen, waehrend
         daneben weiter eine feste Zahl steht und in Wahrheit gewinnt. */
      ok("und daneben steht keine feste Hoehe mehr",
        !/hoehe=\{`\$\{\(0\.\d+\)\.toFixed/.test(pg));
    }
  }

  /* ── JEDES LIVE-BILD BRAUCHT EINE HQ-FASSUNG (v1.4.0) ────────────────────
     Besitzerregel, und sie stand schon laenger: "Mir ist es superwichtig,
     dass alle Figuren, die wir aktiv verwenden, in hoher Qualitaet verfuegbar
     sind und in der Figurenwerkstatt liegen."

     Gemessen bei der Pruefung: 17 von 69 Live-Bildern hatten keine
     HQ-Fassung, darunter ALLE SECHS Gambit-Stufen. Die Rohentwuerfe liegen
     zwar im Archiv, aber die verwendete Fassung wurde nachbearbeitet und nie
     zurueckgesichert - sie ist verloren, und aus 576-px-Freistellungen laesst
     sich keine HQ zurueckgewinnen.

     Diese Probe faengt den naechsten Fall ab, bevor er entsteht. Sie ist
     bewusst eine WARNUNG mit Liste, kein harter Fehler: die bestehende Luecke
     laesst sich nicht rueckwirkend schliessen, und eine Probe, die dauerhaft
     rot steht, wird ignoriert. Wer ein neues Bild einbaut, sieht die Zahl
     steigen. */
  {
    const live = readdirSync("src/app/ui/assets/painted")
      .filter((f) => f.endsWith(".webp") && f.startsWith("painted-"))
      .map((f) => f.slice(8, -5));
    const hq = new Set(readdirSync("archiv/bilder/figuren-hq")
      .filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)));
    const ohne = live.filter((n) => !hq.has(n));
    /* Stand nach dem Nachliefern durch den Besitzer (v1.4.1): von 17 auf 10.
       Die sechs Gambit-Stufen und alle neun Sperren sind eingeordnet - die
       Zuordnung lief ueber Bildvergleich gegen die Live-Fassungen, jede
       einzelne eindeutig (Abstand zum zweitbesten Treffer mindestens 0,02).
       Offen bleiben sieben Boss-Bilder, der Haendler und zwei Bauernstufen. */
    const BEKANNT = 10;
    ok(`nicht MEHR Bilder ohne HQ-Fassung als bekannt (${ohne.length} von ${live.length}${
      ohne.length > BEKANNT ? " - NEU OHNE HQ: " + ohne.slice(0, 6).join(", ") : ""})`,
      ohne.length <= BEKANNT);
  }

  /* v1.4.4: BEIDE Kopfleisten tragen ihren Verlauf. Es gibt zwei in der App -
     die eine hatte ihn seit je, die andere nie, und dort scrollte der Inhalt
     mit harter Kante dahinter durch (Besitzerbefund: "da ist immer so eine
     komische Kante, das sieht super haesslich aus"). */
  {
    const app = readFileSync("src/app/App.jsx", "utf8");
    const verlaeufe = (app.match(/linear-gradient\(180deg, \$\{T\.bg\} 0%/g) || []).length;
    ok(`beide Kopfleisten haben einen Verlauf (${verlaeufe} gefunden)`, verlaeufe >= 2);
  }

  /* v1.5.0: JEDES TALENT FAERBT SEINE ZUSATZFELDER (Besitzerwunsch, "das
     i-Tuepfelchen"). Vorher trugen alle dasselbe Gruen - man sah, DASS ein
     Talent etwas hinzufuegt, nicht WELCHES. */
  {
    const as2 = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
    ok("das Diagramm nimmt eine Talentliste entgegen", as2.includes("talente = null }) {"));
    ok("und merkt sich je Feld, von welchem Talent es stammt",
      as2.includes('reach.set(`${df},${dr}`, "t:" + t)'));
    ok("die Faerbung holt die Farbe des Talents",
      as2.includes('talentFarbe(c.mark.slice(2))'));
    ok("die Figurenkarte reicht ihre Stufenleiter durch",
      as2.includes("talente={(ch.ladder || []).map((x) => x.ability).filter(Boolean)}"));
    /* und die Quelle muss liefern: jedes Talent eine unterscheidbare Farbe */
    const { CHARACTERS: CH } = await import("./src/content/index.js");
    const { talentFarbe } = await import("./src/content/abilities.js");
    const t = (CH.knight.ladder || []).map((x) => x.ability).filter(Boolean);
    const farben = t.map(talentFarbe);
    ok(`der Springer hat ${t.length} Talente mit ${new Set(farben).size} Farben`,
      t.length > 0 && new Set(farben).size === t.length);
  }

  /* v1.6.0: JEDE Figur bekommt ihre Werte, das Rohr ist auf der Hoechststufe
     VOLL, und die Kachel traegt Lila statt Gold. */
  {
    const as3 = readFileSync("src/app/ui/screens/ArmyScreen.jsx", "utf8");
    const pg3 = readFileSync("src/app/ui/board/PieceGlyph.jsx", "utf8");
    /* Der Fehler war: die Werte kamen aus einer Standardaufstellung, und die
       kennt nur sechs Arten. Magier, Barde, Paladin fielen durch. */
    ok("die Werte kommen aus den Grundzahlen, nicht aus einer Aufstellung",
      as3.includes("const hp0 = BASE_HP[ch.kind], atk0 = BASE_ATK[ch.kind]"));
    ok("das Rohr misst sich an der EIGENEN Hoechststufe der Figur",
      pg3.includes("const maxLv = Math.max(2, piece.maxLevel || VOLL_BEI_STUFE)")
      && pg3.includes("const voll = 0.28 + 0.72 * ((stufe - 1) / (maxLv - 1));"));
    ok("der Stufenkreis traegt Lila auf Schwarz", as3.includes('border: "1px solid rgba(167,139,250,.75)"'));
    ok("der Erfahrungsbalken ist fort", !as3.includes("xpAnteil.hat}/{xpAnteil.kosten}"));
    /* und gerechnet: auf der Hoechststufe bleibt kein Schwarz */
    const { rohrAnteile } = await import("./src/app/ui/board/PieceGlyph.jsx");
    const voll = rohrAnteile({ hp: 24, atk: 9, level: 20, maxLevel: 20 });
    const summe = voll.leben + voll.kraft;
    ok(`auf der Hoechststufe ist das Rohr voll (${Math.round(summe * 100)} %)`, summe > 0.995);
    const halb = rohrAnteile({ hp: 14, atk: 6, level: 10, maxLevel: 20 });
    /* v1.18.0 (Besitzer): "auch bei Stufe 1 muss minimal was sichtbar sein" -
       die Fuellung beginnt bei 28 % und laeuft linear bis 100 %. Auf halber
       Stufe (10 von 20) sind das 28 + 72 * 9/19 = 62 %. */
    ok(`auf halber Stufe ist es zu ${Math.round((halb.leben + halb.kraft) * 100)} % voll (28 % Grundfuellung plus die Haelfte des Wegs)`, Math.abs((halb.leben + halb.kraft) - (0.28 + 0.72 * 9 / 19)) < 0.02);
    const eins = rohrAnteile({ hp: 6, atk: 3, level: 1, maxLevel: 10 });
    ok(`auf Stufe 1 ist etwas zu sehen (${Math.round((eins.leben + eins.kraft) * 100)} %, davon Rot ${Math.round(eins.leben * 100)} % und Blau ${Math.round(eins.kraft * 100)} %)`, eins.leben > 0.1 && eins.kraft > 0.1);
  }

  /* v1.9.1: DER MENUEHINTERGRUND FOLGT DEM KAPITEL. Besitzerbefund,
     mehrfach vorgetragen: die zwoelf Kapitelbilder gibt es laengst, aber das
     Menue zeigte immer dieselbe Halle - nur der Farbhauch wechselte.
     v1.23.7: es waren die FALSCHEN Bilder. ground-01..12 sind Gelaendekacheln
     der Weltkarte (Wiese, Acker, Wald, Sand) - daher der beige Grund, den der
     Besitzer sah. Gemeint waren riss-01..10: Schachbrett unten, oben Schwarz,
     der Riss waechst mit dem Kapitel. Die Probe haelt jetzt fest, dass der
     Rissboden genommen wird UND dass die Gelaendekachel nicht zurueckkehrt. */
  {
    const mb = readFileSync("src/app/ui/MysticBackground.jsx", "utf8");
    ok("das Menue nimmt den Rissboden des Kapitels", mb.includes("rissBoden(league)"));
    ok("und nicht mehr die Gelaendekachel der Weltkarte", !/groundArt\s*\(/.test(mb));
    ok("und faellt auf die Halle zurueck, wenn keines da ist", mb.includes("|| bgHall()"));
  }

  /* v1.12.0: DAS ERWACHEN-FENSTER. Besitzerwunsch: "Dann kriegt man
     natuerlich ein Pop-up und der Mechanismus wird erklaert." */
  {
    const be = readFileSync("src/app/ui/BundErwacht.jsx", "utf8");
    const app2 = readFileSync("src/app/App.jsx", "utf8");
    /* Drei Fragen muss es beantworten: WER hat sich verbunden, WAS bewirkt
       das, WARUM. Fehlte eines, waere es entweder eine Regelkarte ohne
       Gesicht oder ein Bild ohne Nutzen. */
    ok("das Fenster zeigt die Figuren des Bundes", be.includes("b.figuren.map"));
    ok("es nennt die Regel", be.includes("{regel}"));
    ok("und erzaehlt die Geschichte", be.includes("{story}"));
    ok("es traegt die Kulisse seines Bundes", be.includes("KULISSE[b.stimmung]"));
    /* EINMAL JE BUND - sonst ginge es bei jedem Start wieder auf. */
    ok("es erscheint nur einmal je Bund", app2.includes("n[`bund_${b.id}`]"));
    ok("und wird beim Schliessen abgehakt", app2.includes('key: `bund_${bundWach}`'));
    /* Es geht VOR den Lehrstunden: der seltenere Moment gewinnt. */
    ok("ein erwachter Bund geht vor den Lehrstunden", app2.includes("&& !teach)\n    ? offenerBund(profile)"));
  }

  /* v1.12.1: DER GELEIT-KNOPF. Besitzerentscheid: erst armieren, dann zwei
     Figuren waehlen, dann tauschen sie. */
  {
    const gs = readFileSync("src/app/ui/screens/GameScreen.jsx", "utf8");
    ok("der Knopf erscheint nur, wenn der Tausch offen ist", gs.includes("geleitOffen && ("));
    ok("er armiert, statt sofort zu tauschen", gs.includes("setGeleitAktiv((v) => !v)"));
    /* Die Wahl laeuft ueber denselben Weg wie das Setzen in der Aufstellung -
       ein eigener Klickweg waere doppelte Arbeit fuer dasselbe. */
    ok("die Wahl nutzt die vorhandenen Feldregler",
      gs.includes("(geleitAktiv ? geleitFelder : null)") && gs.includes("(geleitAktiv ? geleitTipp : null)"));
    ok("zweimal dieselbe Figur nimmt die Wahl zurueck",
      gs.includes("if (geleitWahl === feld) { setGeleitWahl(null); return; }"));
    ok("und nach dem Tausch ist der Knopf wieder aus",
      gs.includes("setGeleitWahl(null); setGeleitAktiv(false);"));
  }

  /* ── DIE VERSION IM PAKET MUSS ZUM NEUESTEN EINTRAG PASSEN (v1.13.2) ────
     GEFUNDEN durch einen Hinweis aus einer Parallelsitzung, und es war ein
     Fehler mit Reichweite: package.json stand auf 1.4.4, waehrend die
     Commits bis 1.13.1 gelaufen waren - NEUN Minor-Versionen lang.

     Die Ursache war eine vergessene Zeile bei v1.4.5. Danach lief jede
     folgende Ersetzung ins Leere, weil sie den falschen Vorgaengerwert
     suchte (sed meldet das nicht, es passiert einfach nichts).

     DAS BETRIFFT DIE AUSLIEFERUNG, nicht nur eine Notiz: vite.config.js
     schreibt version.json aus pkg.version, und daran erkennt die App, ob
     eine neue Fassung bereitsteht. Neun Versionen lang haette kein Geraet
     ein Update angeboten bekommen.

     Diese Probe vergleicht package.json mit dem obersten Eintrag im
     CHANGELOG - der wird bei jeder Fassung von Hand gepflegt und ist damit
     die zuverlaessigere Quelle. */
  {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    const chg = readFileSync("CHANGELOG.md", "utf8");
    const oben = (chg.match(/^## (\d+\.\d+\.\d+)/m) || [])[1];
    ok(`package.json (${pkg.version}) passt zum obersten CHANGELOG-Eintrag (${oben})`,
      oben && pkg.version === oben);
    /* und der Lock muss mitziehen, sonst meldet npm bei jedem Lauf einen
       Unterschied */
    const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
    ok("package-lock traegt dieselbe Version", lock.version === pkg.version);

    /* ── UND DIE EINTRAEGE MUESSEN VORWAERTS LAUFEN (v1.13.2) ──────────────
       Die Probe oben prueft GLEICHHEIT, nicht FORTSCHRITT - und genau da
       ist sie durchgerutscht: bei v1.13.2 wurde package.json auf den
       obersten Eintrag 1.13.1 gezogen, beide stimmten ueberein, die Probe
       war gruen, und ein zweites Bundle ging unter derselben Nummer live.
       Eine wiederholte oder ruecklaeufige Nummer im CHANGELOG ist der
       sichtbare Abdruck dieses Fehlers. */
    const alle = [...chg.matchAll(/^## (\d+\.\d+\.\d+)/gm)].map((m) => m[1]);
    const zahl = (v) => v.split(".").map(Number);
    const groesser = (a, b) => {
      const [x, y] = [zahl(a), zahl(b)];
      for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
      return false;
    };
    ok("das CHANGELOG hat mehr als einen Eintrag", alle.length > 1);

    /* ALTLAST, EINGEFROREN: diese zehn Nummern wurden frueher je zweimal
       (0.49.0 dreimal) vergeben - der sichtbare Abdruck desselben Fehlers,
       lange bevor er benannt war. Die Geschichte wird NICHT umgeschrieben:
       es waren tatsaechlich zwei Pushes unter einer Nummer, und das soll
       lesbar bleiben. Die Liste ist geschlossen - jede NEUE Doppelnummer
       faellt durch. (Gleiche Haltung wie bei der HQ-Luecke im Bildarchiv.) */
    const ALTLAST = new Set(["1.1.8", "1.1.7", "1.0.91", "1.0.38", "1.0.37",
      "1.0.36", "0.50.0", "0.49.0", "0.22.32", "0.22.13"]);
    const doppelt = [...new Set(alle.filter((v, i) => alle.indexOf(v) !== i))];
    const neuDoppelt = doppelt.filter((v) => !ALTLAST.has(v));
    ok(`keine NEUE Doppelnummer im CHANGELOG${neuDoppelt.length ? ` (neu doppelt: ${neuDoppelt.join(", ")})` : ""}`,
      neuDoppelt.length === 0);
    ok(`die Altlast waechst nicht (${doppelt.length} von ${ALTLAST.size})`,
      doppelt.length <= ALTLAST.size);

    const rueck = alle.slice(1)
      .filter((v, i) => !groesser(alle[i], v))
      .filter((v) => !ALTLAST.has(v));
    ok(`die Eintraege laufen streng absteigend${rueck.length ? ` (Bruch bei: ${rueck.join(", ")})` : ""}`,
      rueck.length === 0);
  }

  /* ── WAS DIE PROBEN BRAUCHEN, MUSS DIE CI AUCH HABEN (v1.13.3) ──────────
     test_zauber misst die Sockelfarbe des Drachen mit python3 + Pillow.
     Lokal liegt Pillow herum, auf dem Runner nicht - und so ist npm test
     dort 52 Laeufe lang gescheitert, waehrend hier alles gruen war. Ein
     gruener Lauf auf DIESER Maschine sagt nichts, wenn die CI eine andere
     Ausstattung hat. Diese Probe haelt beide zusammen. */
  {
    const { readdirSync } = await import("node:fs");
    const proben = readdirSync(".").filter((f) => /^test_.*\.mjs$/.test(f));
    const mitPython = proben.filter((f) => readFileSync(f, "utf8").includes("python3"));
    const ci = readFileSync(".github/workflows/ci.yml", "utf8");
    const installiert = /pip install[^\n]*pillow/i.test(ci);
    ok(`wer python3 ruft, bekommt es in der CI auch (${mitPython.join(", ") || "niemand"})`,
      mitPython.length === 0 || installiert);
  }

  /* ── JEDER BUND HAT SEINE EIGENE KULISSE (v1.13.4) ──────────────────────
     Vorher teilten sich zehn Buende vier Stimmungsbilder, drei sahen also
     gleich aus. Diese Probe haelt fest, dass es bei einem Bild je Bund
     bleibt - und dass das Fenster nach der Bund-Id greift, nicht nach der
     Stimmung (sonst faellt es still auf drei Doppelgaenger zurueck). */
  {
    const { readdirSync } = await import("node:fs");
    const { BUENDE } = await import("./src/content/buende.js");
    const ids = Object.keys(BUENDE);
    const da = new Set(readdirSync("src/app/ui/assets/kulissen")
      .filter((f) => f.startsWith("bund-") && f.endsWith(".webp"))
      .map((f) => f.slice(5, -5)));
    const fehlen = ids.filter((id) => !da.has(id));
    ok(`jeder der ${ids.length} Buende hat seine Kulisse${fehlen.length ? ` (fehlen: ${fehlen.join(", ")})` : ""}`,
      fehlen.length === 0);
    const be = readFileSync("src/app/ui/BundErwacht.jsx", "utf8");
    ok("das Bundfenster waehlt nach der Bund-Id, nicht nach der Stimmung",
      be.includes("BILD[b.id]") && !be.includes("BILD[b.stimmung]"));

    /* Dieselbe Haltung wie bei den Figuren: was live liegt, liegt auch in
       hoher Qualitaet im Archiv. Anders als dort ist hier KEINE Luecke
       bekannt - der Satz kam vollstaendig herein, und das soll so bleiben. */
    const live = readdirSync("src/app/ui/assets/kulissen")
      .filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5));
    const hq = new Set(readdirSync("archiv/bilder/kulissen-hq")
      .filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)));
    const ohne = live.filter((n) => !hq.has(n));
    ok(`jede Kulisse liegt als HQ im Archiv (${live.length} Kulissen${ohne.length ? ", ohne HQ: " + ohne.join(", ") : ""})`,
      ohne.length === 0);
  }

  /* 2. Bauer und Grand Gambit tragen in der Aufstellung EIN Mass. */
  ok("kein getrenntes Mass mehr fuer Held und Bauer",
    !/isHero \? "clamp\(26px, 10\.5vw, 86px\)" : "clamp\(24px, 9\.4vw, 76px\)"/.test(q));
  ok("die Bauernreihe misst durchgehend 10,5vw", /height: "clamp\(26px, 10\.5vw, 86px\)"/.test(q));

  /* 3. Das Figurenblatt traegt keine gerahmte Platte mehr - wie das Monster. */
  const kopf = q.slice(q.indexOf("THE DOSSIER HEAD"), q.indexOf("masthead + orbs + ledger"));
  ok("die Platte hat keinen Rahmen mehr", !/border: "1px solid rgba\(227,192,122,\.28\)"/.test(kopf));
  ok("und keinen eigenen Grund", !/linear-gradient\(180deg, rgba\(30,36,54,\.5\)/.test(kopf));
  ok("das Bild steht unten wie im Monsterblatt", /objectPosition: "bottom"/.test(kopf));
}

/* ── BAUER UND GAMBIT, SOCKELGLUT, ZWEI SEHWEISEN (v1.0.66) ────────────────
   Drei Besitzerbefunde, drei Proben - damit keiner davon beim naechsten
   Umbau zurueckfaellt. */
{
  const { paintedFitFor } = await import("./src/app/ui/board/paintedArt.js");
  const bauer = paintedFitFor({ kind: "P" });
  const held  = paintedFitFor({ kind: "P", hero: true, tier: 1 });
  ok("Bauer und Gambit Stufe I sind gleich hoch gezeichnet", bauer.h === held.h);
  ok("und stehen auf derselben Fusslinie", bauer.y === held.y);
  /* v1.0.73 (Besitzer): der Held ist in JEDEM Rang so gross wie ein Bauer und
     steht auf derselben Fusslinie - der Aufstieg zeigt sich am Bild, nicht an
     der Koerpergroesse. v1.0.66 hatte nur Stufe I geradegezogen. */
  for (let t = 1; t <= 6; t++) {
    const r = paintedFitFor({ kind: "P", hero: true, tier: t });
    ok(`Rang ${t}: gleiche Groesse wie der Bauer`, r.h === bauer.h);
    ok(`Rang ${t}: gleiche Fusslinie wie der Bauer`, r.y === bauer.y);
  }
}
{
  const { GEGNER_STILE, setGegnerStil, gegnerStil, glutTon, glutFilter, GLUT_SCHEIN } =
    await import("./src/app/ui/gegnerstil.js");
  /* v1.0.83: nur noch EINE Sehweise - der Besitzer hat die farbige
     Fassung abgeschafft. Alte Profilwerte fallen alle auf schwarzweiss. */
  ok("es gibt nur noch eine Sehweise", GEGNER_STILE.length === 1);
  setGegnerStil("getoent");
  ok("der alte Wert getoent faellt auf schwarzweiss", gegnerStil() === "schwarzweiss");
  setGegnerStil("schwarzweiss");
  ok("ohne Farbe: der Gegner glueht schwarz", glutTon(false) === "schwarz");
  ok("ohne Farbe: die eigene Seite glueht weiss", glutTon(true) === "weiss");
  setGegnerStil("grau");
  ok("der alte Name grau faellt auf schwarzweiss", gegnerStil() === "schwarzweiss");
  setGegnerStil("farbig");
  ok("auch der alte Name farbig faellt auf schwarzweiss", gegnerStil() === "schwarzweiss");
  setGegnerStil("getoent");
  ok("jeder Ton hat einen Schein", ["lila","gold","schwarz","weiss"].every((t) => GLUT_SCHEIN[t]));
  ok("die Gefahr staffelt die Glut",
    glutFilter("lila", 1) !== glutFilter("lila", 0));
}
{
  /* Der Verlauf: dunkel am Boden, Gipfel am Sockelrand, aus bei 19 % - die
     Obergrenze wollte der Besitzer ausdruecklich NICHT hoeher haben. */
  const { readFileSync: _rf3 } = await import("node:fs");
  const q = _rf3("src/app/ui/board/PieceGlyph.jsx", "utf8");
  const v = q.slice(q.indexOf("const SOCKEL_VERLAUF"), q.indexOf("const SOCKEL_VERLAUF") + 320);
  ok("der Verlauf beginnt dunkel am Boden", /rgba\(0,0,0,\.18\) 0%/.test(v));
  ok("sein Gipfel liegt am Sockelrand", /rgba\(0,0,0,1\) 13%/.test(v));
  ok("und er endet weiterhin bei 19 %", /rgba\(0,0,0,0\) 19%/.test(v));
}

/* ── SCHWARZ/WEISS TRAEGT NUR DEN SOCKEL (v1.0.71) ─────────────────────────
   Besitzerbefund: bei Schwarz lief ein "komischer Verlauf" uebers Feld -
   Schein und Bodenschleier der farbigen Fassung liefen mit. Diese Probe
   haelt fest, dass beide Schichten hinter dem nurSockel-Riegel stehen. */
{
  const { readFileSync: _rfSW } = await import("node:fs");
  const q = _rfSW("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("der Riegel existiert und kennt beide Toene",
    q.includes('const nurSockel = ton === "schwarz" || ton === "weiss"'));
  ok("Schein UND Bodenschleier stehen dahinter", (q.match(/\{!nurSockel && !schneide && <span/g) || []).length === 2);
}
/* ── DER SOCKEL IST FORT, DIE FIGUR STEHT IM ROHR (v1.14.1) ────────────────
   Gemessen (messe_rohr.mjs): der Sockel ist 0,3-0,4 Zellen hoch, das Rohr
   0,155 - es konnte ihn nie verschlucken. Jetzt endet das Bild an der
   gemessenen Sockelkante, und das Rohr sitzt mit seiner Mitte darauf. Beide
   lesen dieselbe Quelle (sockelLinieEm), sonst driften sie auseinander. */
{
  const { readFileSync: _rfR } = await import("node:fs");
  const q = _rfR("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("beide Bilder werden an der Sockelkante geschnitten", (q.match(/clipPath: schnitt, WebkitClipPath: schnitt/g) || []).length === 2);
  ok("der Schnitt gilt nur im HP-Gefecht, nicht in Klassik", q.includes("!klassisch && hpMode && piece.maxHp > 0"));
  ok("das Rohr sitzt auf der Sockellinie, nicht auf einer festen Tiefe",
    q.includes("const mitte = sockelLinieEm(piece)") && !q.includes("ROHR_TIEFE_UNTER_FUSS"));
  const { sockelLinieEm } = await import("./src/app/ui/board/PieceGlyph.jsx");
  const l = sockelLinieEm({ kind: "R", charId: "rook", color: "w", atk: 5, maxHp: 10, level: 3 });
  ok(`die Sockellinie liegt im plausiblen Bereich (${l.toFixed(3)} em ueber dem Zellboden)`, l > 0.05 && l < 0.4);
  const r = _rfR("src/app/ui/board/LebensRohr.jsx", "utf8");
  ok("keine tote Tiefen-Konstante mehr im Rohr", !r.includes("export const ROHR_TIEFE_UNTER_FUSS"));
}


/* ── DIE SOCKELKANTE WIRD JE FIGUR GEMESSEN (v1.0.72) ──────────────────────
   Besitzer: "jede Figur einzeln durchpruefen ... nicht die Fuesse oder der
   Rock der Koenigin mitfaerben." Die pure Messfunktion wird hier mit
   synthetischen Profilen geprueft; die echten Bilder misst der Browser. */
{
  const { messeSockelKante, KANTE_FALLBACK, KANTE_MIN, KANTE_MAX } =
    await import("./src/app/ui/board/sockelmass.js");
  const bild = (h, w, breiteJeZeile) => {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) {
      const b = breiteJeZeile(y), links = Math.floor((w - b) / 2);
      for (let x = links; x < links + b; x++) data[(y * w + x) * 4 + 3] = 255;
    }
    return { width: w, height: h, data };
  };
  // Teller: 12 Zeilen Plateau (80), darueber Figur 40 -> Kante = Plateau-Ende
  const a = messeSockelKante(bild(100, 100, (y) => (y >= 88 ? 80 : 40)));
  ok("die Tellerkante wird am Plateau-Ende gefunden (~13 %)", a > 0.11 && a < 0.145);
  // Rock der Koenigin: 95 %-Grenze feuert bei 95 % Rockbreite NICHT -> Hauswert
  const b = messeSockelKante(bild(100, 100, (y) => (y >= 88 ? 80 : 76)));
  ok("ein Rock nahe Tellerbreite loest keine falsche Kante aus", b === KANTE_FALLBACK);
  // Teller-Ende jenseits der Klemme -> auf KANTE_MAX gefangen
  const c = messeSockelKante(bild(100, 100, (y) => (y >= 98 ? 0 : y >= 74 ? 80 : 40)));
  ok("die Klemme haelt Ausreisser bei " + KANTE_MAX * 100 + " %", c === KANTE_MAX);
  // Teller hoeher als die Suchzone -> ehrlicher Hauswert statt Fantasiewert
  const d = messeSockelKante(bild(100, 100, (y) => (y >= 60 ? 80 : 30)));
  ok("jenseits der Zone greift der Hauswert", d === KANTE_FALLBACK);
  // leeres Bild
  ok("ein leeres Bild faellt sicher auf den Hauswert",
    messeSockelKante(bild(100, 100, () => 0)) === KANTE_FALLBACK);
}
{
/* ── ALLE FUESSE AUF EINE LINIE (v1.0.80) ─────────────────────────────────
   Besitzer: "die Figuren sind nicht perfekt ausgemittelt von der Hoehe".
   Gemessen streut der Leerraum unter dem Sockel von 2,1 % bis 6,8 %. */
{
  const { messeFusslinie, HAUSLINIE } = await import("./src/app/ui/board/sockelmass.js");
  const bild = (h, w, fussLeer) => {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h - fussLeer; y++)
      for (let x = 10; x < w - 10; x++) data[(y * w + x) * 4 + 3] = 255;
    return { width: w, height: h, data };
  };
  ok("ein Bild ohne Leerraum meldet 0", messeFusslinie(bild(100, 100, 0)) === 0);
  ok("sieben leere Zeilen melden 7 %", Math.abs(messeFusslinie(bild(100, 100, 7)) - 0.07) < 0.001);
  ok("ein voellig leeres Bild faellt auf die Hauslinie",
    messeFusslinie({ width: 8, height: 8, data: new Uint8ClampedArray(8 * 8 * 4) }) === HAUSLINIE);
  ok("die Hauslinie ist der haeufigste gemessene Wert (3,1 %)", HAUSLINIE === 0.031);
  const { readFileSync: _rfF } = await import("node:fs");
  const pgf = _rfF("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("der Glyph gleicht die Abweichung von der Hauslinie aus",
    pgf.includes("(fussLinie - HAUSLINIE) * fit.h"));
  ok("im Grossformat bleibt der Ausgleich aus", pgf.includes("big ? 0 :"));
}

  const { sockelVerlauf } = await import("./src/app/ui/gegnerstil.js");
  const sw = sockelVerlauf(0.15, true), glut = sockelVerlauf(0.15, false);
  /* v1.0.73: die Faerbung sitzt TIEFER - der Teller behaelt oben seine
     eigene Farbe ("man soll immer noch ein Stueckchen davon sehen"). Bei
     Kante 15 %: voll bis 8,3 %, aus bei 15 % statt vorher 13,8/19,2 %. */
  /* v1.0.76: noch tiefer - "bei manchen Figuren minimal zu hoch". Bei
     Kante 15 %: voll bis 6,3 %, aus bei 12,8 % (statt 8,3 / 15,0). */
  ok("schwarz/weiss: die volle Deckung endet unter der halben Kante",
    sw.includes("rgba(0,0,0,1) 0%") && sw.includes("rgba(0,0,0,1) 6.3%"));
  ok("und der Auslauf endet UNTER dem Tellerrand",
    sw.includes("rgba(0,0,0,0) 12.8%"));
  ok("farbig: die Glut gipfelt jetzt tiefer",
    glut.includes("rgba(0,0,0,.18) 0%") && glut.includes("rgba(0,0,0,1) 5.4%"));
  const { readFileSync: _rfG } = await import("node:fs");
  const pg = _rfG("src/app/ui/board/PieceGlyph.jsx", "utf8");
  /* v1.0.77: die blauen Schild-Perlen sind vom Brett fort (Besitzerwunsch).
     Der Schild selbst bleibt: er wirkt im Kampf und steht im Blatt. */
  ok("keine blauen Schild-Perlen mehr am Brett-Glyph",
    !/piece\.shield > 0 && \(/.test(pg));
  ok("der Schild wirkt weiterhin im Kern",
    (await import("node:fs")).readFileSync("src/core/rules/moves.js", "utf8").includes("shield"));
  /* v1.22.2 (Besitzer): nur noch ein Hauch Grau - "man muss sie klar sehen" */
  ok("die Gegenseite traegt nur einen Hauch Grau (v1.22.2)",
    pg.includes("grayscale(0.22) saturate(0.9) brightness(0.92)"));
  ok("das Atmen liegt NICHT mehr auf derselben Ebene wie die Landung",
    !/ggLandung[^`]*ggAtmen/.test(pg));
  ok("eine hoehere Kante verschiebt beide Formen",
    sockelVerlauf(0.22, true) !== sw && sockelVerlauf(0.22, false) !== glut);
  const { readFileSync: _rfK } = await import("node:fs");
  const q = _rfK("src/app/ui/board/PieceGlyph.jsx", "utf8");
  ok("der Glyph misst je Bild und nutzt den Cache",
    q.includes("holeSockelKante(painting)") && q.includes("sockelKanteAusCache(painting)"));
  ok("die Maske kommt aus sockelVerlauf(kante)", q.includes("sockelVerlauf(sockelKante, nurSockel)"));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
