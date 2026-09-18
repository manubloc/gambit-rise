import { useRef, useState, useEffect } from "react";
import LebensRohr, { ROHR_BREITE_VOM_SOCKEL, ROHR_HOEHE_VON_ZELLE, ROHR_KRUEMMUNG } from "./LebensRohr.jsx";
import { SockelBand, bandBekannt } from "../SockelBand.jsx";
import { paintedIdOf } from "./paintedArt.js";
import { ABILITIES, TAGS } from "../../../content/index.js";
import { T } from "../theme.js";
import { PieceArt } from "./PieceArt.jsx";
import { BladesIc } from "../icons.jsx";
import { paintedForPiece, paintedById, paintedFitFor, FIT_GEMESSEN, CLASSIC_PAINTED, klassikFor } from "./paintedArt.js";
import { gegnerStil, gefahrVon, glutTon, glutFilter, GLUT_SCHEIN, sockelVerlauf } from "../gegnerstil.js";
import { holeSockelKante, sockelKanteAusCache, KANTE_FALLBACK,
  holeFusslinie, fusslinieAusCache, HAUSLINIE } from "./sockelmass.js";
import { animAn } from "../anim.js";

/* v1.0.66: DER SOCKELVERLAUF, an einer Stelle. Dunkel am Boden (0,18),
   Gipfel am Sockelrand (1,0 bei 13 %), aus bei 19 % - dieselbe Obergrenze
   wie seit v1.0.62, der Besitzer wollte sie ausdruecklich NICHT hoeher. */
/* v1.0.72: ausser Dienst - der Verlauf kommt jetzt je Figur aus
   sockelVerlauf(kante) mit der GEMESSENEN Kante (sockelmass.js). */
const SOCKEL_VERLAUF_ALT =
  "linear-gradient(0deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.45) 6%, "
  + "rgba(0,0,0,1) 13%, rgba(0,0,0,.55) 16%, rgba(0,0,0,0) 19%)";

// Fixed display order so the emblem row is stable as abilities are gained.
const TAG_ORDER = ["move", "ranged", "blink", "aoe", "control", "sustain", "promo"];

// A piece = a thin neon-OUTLINE silhouette whose glow grows with level, topped by
// a row of category emblems (one per distinct ability category it has — more
// abilities ⇒ more emblems), plus its exact LEVEL, its ATK (HP mode) and shield
// pips (chess mode). Player glows cyan, enemy magenta.

// Little glass orbs of life, resting on the square's lower edge — the figure
// always stands above them. Deep bottle-green glass with a bright specular
// window and a shaded floor, so each bead reads as a tiny sphere. Giants
// (>10 HP) keep a slim glass bar instead.
function HpDots({ hp, max, side = "left", palette = "life" }) {
  const ratio = Math.max(0, Math.min(1, hp / max));
  // life speaks in the old traffic tongue; ENERGY is always the same cold blue
  const [col, deep] = palette === "energy" ? ["#4aa3e8", "#123a66"]
    : ratio > 0.55 ? ["#22a763", "#0a5229"] : ratio > 0.28 ? ["#e8a33f", "#8a5312"] : ["#e6394a", "#7c1622"];
  if (max > 10) {
    // heavyweights: a vertical life column on the LEFT flank, filling bottom-up
    return <span style={{ position: "absolute", bottom: "0.07em", [side]: "-0.012em",
      display: "flex", alignItems: "flex-end", width: "max(3.5px, 0.05em)", height: "0.52em",
      background: "rgba(6,10,16,.7)", borderRadius: 99, overflow: "hidden", pointerEvents: "none",
      boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,.22), inset 0 1px 1px rgba(0,0,0,.5)" }}>
      <span style={{ display: "block", width: "100%", height: `${ratio * 100}%`, borderRadius: 99,
        background: `linear-gradient(0deg, ${deep} 0%, ${col} 62%, rgba(255,255,255,.55) 100%)`,
        boxShadow: `0 0 4px ${col}, 0 0 8px ${col}66`, transition: "height .2s ease" }} />
    </span>;
  }
  const d = Math.min(0.075, 0.5 / Math.ceil(max / 2));
  return <span style={{ position: "absolute", bottom: "0.07em", [side]: "-0.028em",
    display: "grid", gridAutoFlow: "column", gridTemplateRows: `repeat(${Math.ceil(max / 2)}, auto)`,
    gap: "0.024em", pointerEvents: "none",
    filter: "drop-shadow(0 1px 1px rgba(0,0,0,.55))" }}>
    {Array.from({ length: max }).map((_, i) => (
      // ECHTE KUGELN statt flacher Punkte: ein enges Glanzlicht oben links,
      // darunter die volle Farbe, unten der Schattenboden - und aussen ein
      // Schein, der die Perle vom Brett abhebt. Leere Perlen bleiben dunkel,
      // damit der Unterschied auf einen Blick zaehlt.
      <span key={i} style={{ width: `max(4px, ${d}em)`, height: `max(4px, ${d}em)`, borderRadius: "50%",
        background: i < hp
          ? `radial-gradient(circle at 34% 24%, #ffffff 0%, #ffffffcc 9%, ${col} 42%, ${col} 58%, ${deep} 88%, #000 100%)`
          : "radial-gradient(circle at 34% 24%, rgba(255,255,255,.1) 0%, rgba(4,6,10,.9) 62%)",
        boxShadow: i < hp
          ? `inset 0 -0.9px 1.4px ${deep}, inset 0 0.5px 0.8px rgba(255,255,255,.5), 0 0 4px ${col}, 0 0 9px ${col}77`
          : "inset 0 0 0 0.6px rgba(255,255,255,.16)",
        transition: "background .2s ease, box-shadow .2s ease" }} />
    ))}
  </span>;
}


// ── THE STAT TRIAD: three orbs anchored to the BOTTOM-LEFT corner. Life is
// always the corner stone (bottom-left); Power sits ABOVE it; Energy sits to
// the RIGHT of life. They keep a small tangential gap between them. One design,
// three colours, BOTH armies alike. Each orb GROWS with its number (two digits
// need a wider home) and grows again when the piece is pressed (focus). Rims
// run to near-black with a vivid inner colour. Numbers live inside. ──
import "@fontsource/spectral/700.css";
import { ORB_BLUE, ORB_RED } from "../assets/stat/statAssets.js";
const ORB = { power: ORB_BLUE, life: ORB_RED }; // blue = attack, red = life
function numeralStyle(px) {
  return { fontFamily: NUM_FONT, fontWeight: 700, lineHeight: 1, fontSize: px,
    color: "#FCF5E2", WebkitTextStroke: "0.018em #15120D",
    textShadow: "0 0.06em 0 rgba(255,248,226,.26)", fontVariantNumeric: "tabular-nums" };
}

// MEASURED on the artwork (144x144): the sphere's visible mass centres at
// 49.6% / 48.2% of the image — it sits a hair left and noticeably HIGH in its
// box. A numeral centred on the BOX therefore reads ~1.8% too low and 0.4%
// too far right. ORB_TRUE_CENTER pulls it back onto the sphere's real middle,
// so single digits, double digits and "+1" all sit dead centre.
const ORB_TRUE_CENTER = { x: -0.004, y: -0.018 };

const NUM_FONT = "'Spectral', Georgia, serif";

/* v1.0.42: SpellStar ist fort - die violette Kugel sagt dasselbe in der
   Sprache der beiden anderen. */
// TWO JEWELS UNDER EVERY FIGHTER: blue attack left, red life right — the same
// diameter and the same engraved numerals the old strip carried, for both
// sides alike (the figure itself tells friend from foe).
/* ══ DAS LEBENSROHR STATT DER ZAHLENPERLEN (v1.3.0) ═══════════════════════
   Besitzerbefund mit Screenshot: "Ein Screen wie hier ist schon ueberladen."
   Gezaehlt: rund siebzig Perlen auf einem Brett, bevor ueberhaupt etwas
   passiert ist - zwei je Figur, und in der Grundstellung sagen sie achtmal
   dasselbe.

   Das Rohr fasst beide Werte in EIN Bauteil: Rot von links (Leben), Blau von
   rechts (Staerke), dazwischen dunkles Glas fuer das, was zur vollen
   Ausbaustufe fehlt. Das Verhaeltnis zeigt das PROFIL der Figur, die
   Gesamtfuellung ihre STUFE. Aus 70 Anzeigen werden 32, und jede sagt mehr
   als vorher zwei.

   ROHR_STATT_PERLEN ist der Schalter zurueck: eine Konstante, kein Umbau.
   Die Perlen bleiben im Code, bis das Rohr sich am Geraet bewaehrt hat. */
export const ROHR_STATT_PERLEN = true;

/* Das Rohr braucht Pixel, die Figur rechnet in em. Diese Zahl ist die
   Zellbreite in px - sie kommt aus der Schriftgroesse der Zelle, die das
   Brett setzt. 40 ist der Rueckfall fuer Faelle ohne Messung. */
const EM_PX = 40;

/* Die Skalen, an denen die Fuellstaende haengen. Gemessen ueber alle Figuren
   und Stufen 1 bis 20: Leben 2..48, Angriff 1..13. Der Koenig sprengt die
   Lebensskala (48 gegen 28 bei allen anderen) - deshalb wird nicht am
   absoluten Hoechstwert gemessen, sondern am VERHAELTNIS der beiden Werte
   zueinander. Sonst waere auf Stufe 20 jedes Rohr voll und das Profil
   unsichtbar (so war mein erster Anlauf, und der Besitzer hat es sofort
   gesehen: "Du hast das jetzt gerade falsch rum gemacht"). */
/* GEMESSEN statt geraten: bei 3,2 stand der Koenig auf 52 % Rot gegen 42 %
   Blau - fast ausgeglichen, obwohl er 48 Leben und nur 12 Angriff hat. Das
   Gewicht hob den Angriff zu stark an und loeschte damit genau das Profil,
   das sichtbar werden soll. Bei 1,6 traegt der Koenig 67/27 und der
   Attentaeter 38/56 - so unterscheiden sich die Figuren wirklich. */
const KRAFT_GEWICHT = 1.6;   /* v1.24.6: nur noch fuer Altbestand - das Band rechnet in Punkten */
const NORM_PUNKTE = 28;      /* gemessen: jede normale Figur hat auf Hoechststufe 28 Punkte (Leben + Angriff) */
const VOLL_BEI_STUFE = 20;

export function rohrAnteile(piece) {
  const hp = Math.max(0, piece.hp || 0);
  const atk = Math.max(0, piece.atk || 0);
  const summe = hp + atk * KRAFT_GEWICHT;
  if (summe <= 0) return { leben: 0, kraft: 0 };
  /* ── AUF DER HOECHSTEN STUFE IST DAS ROHR VOLL (v1.6.0, Besitzerentscheid)
     "In der letzten Stufe sollte jede Figur kein Schwarz mehr haben, sodass
     man auf der hoechsten Stufe einfach entweder mehr Leben oder mehr Angriff
     hat. So ist dann auch ein Gleichgewicht im ganzen Spiel gegeben."

     Vorher lief die Fuellung gegen 94 % bei Stufe 20 - ein Rest blieb immer,
     und bei Figuren mit niedrigerer Hoechststufe noch mehr. Jetzt gilt die
     EIGENE Hoechststufe der Figur als Massstab: wer ausgereizt ist, ist voll,
     ob das bei 10 oder bei 20 liegt.

     Das ist auch die schluessigere Aussage. Ein voll ausgebauter Bauer und
     eine voll ausgebaute Dame sind beide "fertig" - sie unterscheiden sich
     dann nur noch im VERHAELTNIS von Rot zu Blau, also im Profil. Genau das
     soll das Rohr zeigen. */
  /* ── v1.24.6: PUNKTE, KEINE PROZENTE (Besitzer) ───────────────────────────
     "Du solltest bei diesem Band gar nicht prozentual rechnen. Es gibt bei
      jeder Figur immer irgendwie 100 Punkte, ausser bei Drache und Gambit. Und
      wenn ich 80 Lebenspunkte habe und eine andere Figur greift mit 20 an,
      dann hat die Figur danach noch 60. Wenn das Band 100 breit ist, ziehst du
      es einfach ab - Subtraktion. Die Angriffsstaerke aendert sich nie, der
      blaue Balken bleibt immer fest."

     Also: die Ringbreite IST das Punktebudget der Figur. Rot ist ihr Leben in
     Punkten, Blau ihre Staerke in Punkten, beide am selben Massstab. Schaden
     nimmt Rot weg, Punkt fuer Punkt; Blau bleibt unberuehrt.

     GEMESSEN, was das Budget ist: auf Hoechststufe kommt JEDE normale Figur
     auf 28 Punkte (Leben + Angriff) - Bauer 21+7, Turm 22+6, Springer 15+13,
     Dame 18+10, Koenig 25+3. Der Gambit hat 42, der Drache 54. Deshalb
     `max(28, maxHp + atk)`: auf Hoechststufe genau die eigene Summe, darunter
     der Normmassstab 28 - eine Figur auf halbem Weg fuellt den Ring also nur
     zur Haelfte, und das ist die Aussage.

     Das frueher hier stehende KRAFT_GEWICHT (Blau zaehlte 1,6-fach) faellt
     weg: ein Punkt ist ein Punkt, sonst stimmt die Subtraktion nicht. */
  const maxHp = Math.max(hp, piece.maxHp || hp);
  const budget = Math.max(NORM_PUNKTE, maxHp + atk);
  return { leben: Math.max(0, Math.min(1, hp / budget)), kraft: Math.max(0, Math.min(1, atk / budget)) };
}

/* ── WO DER SOCKEL ANFAENGT, in em ueber dem Zellboden (v1.14.1) ──────────
   Besitzerwunsch seit v1.5.1: "ich will den Sockel nicht mehr sehen". Bis
   hierher hing das Rohr fest 0,085 em unter dem Fuss und war 0,155 em hoch -
   der Sockel ist aber 0,3 bis 0,4 Zellen hoch (gemessen: 5 bis 10 px schauten
   oben heraus bei 38-px-Zellen, bei jeder Figur, messe_rohr.mjs). Ein Rohr,
   das ihn wirklich verschluckt, waere ein Fass.

   Also andersherum: das BILD wird an der gemessenen Sockelkante abgeschnitten
   (clip-path), und das Rohr sitzt mit seiner Mitte genau auf dieser Linie.
   Die Figur steht damit IM Rohr statt auf ihrem Teller - wie in der
   Bildstrecke. Diese Funktion rechnet die Linie aus denselben Groessen, mit
   denen der Glyph seine Figur setzt (Fit, Fusslinie, Sockelkante); Rohr
   (in der Zelle) und Schnitt (im Glyph) lesen dieselbe Quelle. Vor der
   ersten Messung gilt fuer beide der Fallback - sie bleiben deckungsgleich. */
export function sockelLinieEm(piece) {
  const painting = paintedForPiece(piece, true);
  const fit = painting ? paintedFitFor(piece) : { h: 1, y: 0 };
  const kante = (painting && sockelKanteAusCache(painting)) || KANTE_FALLBACK;
  const fuss = (painting && fusslinieAusCache(painting)) ?? HAUSLINIE;
  const ps = piece.bossId ? 1.14 : 0.99;               // pieceSize im HP-Gefecht
  /* v1.24.5c: die gemessene Anpassung liefert y in PROZENT der Figurenhoehe
     (rund 1,3 em), die Handtabelle in em - hier auf em gebracht, und ohne die
     alte Fusslinien-Korrektur, die im gemessenen Fall entfaellt. */
  const yFit = fit.yProzent ? (fit.y || 0) / 100 * 1.3 : (fit.y || 0);
  const ausgleich = FIT_GEMESSEN ? 0 : (fuss - HAUSLINIE) * fit.h * 1.16;
  const y = yFit + ausgleich;                           // positiv = nach unten
  return 0.015 - y + kante * ps * 1.16 * fit.h;         // 0.015 = paddingBottom des Glyphs
}

function StatDuo({ piece, focus, shrink = 1 }) {
  const d = 0.405 * (focus ? 1.4 : 1) * shrink;  // orb diameter in em — a size up, numerals with it
  const gap = d * 0.045;                         // a hair apart — nearly kissing
  /* v1.0.42: DIE KARTE, DIE JEDE FIGUR EINMAL SPIELEN DARF.
     Nur wirkende (live) Talente zaehlen - wer nur passive Gaben traegt, hat
     nichts zu "benutzen" und bekommt darum keine Kugel. Neu ist der zweite
     Zustand: hat die Figur ihre Karte schon gespielt, bleibt die Kugel
     stehen und ERLISCHT, statt einfach zu verschwinden. Verschwinden hiesse:
     der Spieler weiss nicht, ob sie je eine hatte. */
  const kannWirken = (piece.abilities || []).some((id) => ABILITIES[id]?.live);
  const verbraucht = Object.keys(piece.used || {}).length > 0;
  /* v1.1.2 (Besitzeridee): "In dem Moment, wo man eine Faehigkeit einsetzt,
     waere es cool, wenn sich die Zauberkugel komplett in Luft aufloest - kurz
     leuchtet, ausstrahlt, und dann ist sie weg. Und erst danach macht die
     Figur den besonderen Zug."

     Der Augenblick ist erkennbar: `zuletzt` heisst, diese Figur hat gerade
     gezogen. Traegt sie dabei einen frischen Verbrauch, dann war es ein
     Zauber - und die Perle loest sich auf, statt still zu "verbraucht"
     umzuspringen. Das Aufloesen laeuft einmal (both), danach steht die matte
     Perle. Der Klang dazu liegt im Spielbildschirm, wo der Zug bekannt ist. */
  const loestSich = verbraucht && !!piece.justMoved && animAn();
  // EINE KUGEL FUER ALLE (v0.38.6): dieselbe gegossene Siegelkugel wie im
  // Hofstaat - Goldrand, Glanzlicht, Zahl geometrisch mittig. Vorher trug das
  // Brett noch die alte Bildkugel mit optischer Versatz-Korrektur, weshalb die
  // Zahl je nach Wert wanderte.
  const orb = (kind, v) => <span style={{ width: d + "em", height: d + "em", display: "grid", placeItems: "center" }}>
    <StatOrbBadge kind={kind} v={v} size={`${d}em`} num={0.58} />
  </span>;
  /* v1.3.0: das Rohr ersetzt beide Perlen. Es misst sich an der Zellbreite
     (15,5 %: bei 38-48 px Zelle sind das 5,9-7,4 px - unter 6 traegt die
     Glasoptik kaum noch). Die Breite folgt dem gemessenen Sockel.
     v1.13.2: hier stand bis eben "17 %". Das war die gerechnete Zahl aus der
     Bildstrecke, nicht die eingebaute - der Aufruf trug 0,155. Der Kommentar
     log also seit v1.5.1, und zwar gleichlautend an zwei Stellen. */
  if (ROHR_STATT_PERLEN) {
    const { leben, kraft } = rohrAnteile(piece);
    /* GEMESSEN AM GERENDERTEN BRETT (Besitzerbefund "viel zu hoch, der Sockel
       schaut unten raus"): bei bottom -0,02 em sass das Rohr auf der
       Sockeloberkante und liess den Sockelfuss stehen. Es muss TIEFER - so
       tief, dass es den Sockel verschluckt, wie in der Bildstrecke. */
    /* v1.18.0: traegt der Sockel das Band, gibt es kein Rohr mehr */
    if (bandBekannt(paintedIdOf(paintedForPiece(piece, true)))) return null;
    /* v1.14.1: Mitte des Rohrs auf der Sockellinie - siehe sockelLinieEm. */
    const mitte = sockelLinieEm(piece);
    return <span style={{ position: "absolute", bottom: `${(mitte - ROHR_HOEHE_VON_ZELLE / 2).toFixed(4)}em`, left: "50%",
      transform: "translateX(-50%)", zIndex: 3, pointerEvents: "none", lineHeight: 0 }}>
      {/* Die Masse rechnen in em, damit sie mit der Zelle wachsen: die Figur
          ist 1 em breit, der Sockel nimmt davon rund 80 %, das Rohr 112 % des
          Sockels. Die Hoehe sind 15,5 % der Zelle (5,9-7,4 px auf dem
          Telefon) und stehen in ROHR_HOEHE_VON_ZELLE. */}
      <LebensRohr lebenAnteil={leben} kraftAnteil={kraft}
        talentBereit={kannWirken && !verbraucht}
        /* und SCHMALER: 0,80 em Sockelbreite war zu viel, weil die Figur die
           Zelle schon fast fuellt - das Rohr ragte ueber den Rand. */
        /* v1.5.1: in em statt in festen Pixeln - 1 em ist am Brett die
           Zellbreite, also waechst das Rohr mit jedem Brett mit. Breiter und
           hoeher als zuvor (Besitzer: "viel zu klein, muss viel hoeher sein,
           ich will den Sockel nicht mehr sehen"). */
        breite={`${(ROHR_BREITE_VOM_SOCKEL * 0.68).toFixed(3)}em`}
        /* v1.13.2: AUS DER KONSTANTE, nicht mehr fest. Hier stand `0.155`
           als nackte Zahl, waehrend ROHR_HOEHE_VON_ZELLE daneben 0,17 trug
           und von niemandem gelesen wurde. Zwei Zahlen fuer ein Mass, eine
           davon tot - wer die Konstante anfasste, aenderte nichts. Der Wert
           ist derselbe geblieben, nur die Quelle ist jetzt eindeutig. */
        hoehe={`${ROHR_HOEHE_VON_ZELLE.toFixed(3)}em`}
        /* AM BRETT gekruemmt - hier steht die Figur auf ihrem Sockel, und das
           Rohr nimmt dessen Woelbung auf. Ueberall sonst gilt die gerade
           Voreinstellung. */
        kruemmung={ROHR_KRUEMMUNG} />
    </span>;
  }
  return <span style={{ position: "absolute", bottom: "-0.09em", left: "50%", transform: "translateX(-50%)", zIndex: 3,
    display: "inline-flex", gap: gap + "em", pointerEvents: "none" }}>
    {/* v1.0.99 (Besitzer: "diese lila Bubbles fuer die Faehigkeit bitte mittig
        zwischen blauer und roter Bubble, in kleiner allerdings"): DIE
        ZAUBERPERLE SITZT JETZT ZWISCHEN DEN BEIDEN, nicht dahinter, und
        traegt zwei Drittel ihrer Groesse. Hinten in voller Groesse machte sie
        das Trio breiter als das Feld und zog das Auge auf sich, obwohl sie die
        kleinste Auskunft von dreien ist. Sie liegt eine Spur hoeher, damit
        sie in die Kerbe zwischen den grossen Kugeln faellt. */}
    {orb("power", piece.atk)}
    {kannWirken && <span style={{ width: d * 0.66 + "em", height: d * 0.66 + "em",
      display: "grid", placeItems: "center", marginLeft: -(gap * 0.42) + "em", marginRight: -(gap * 0.42) + "em",
      marginBottom: d * 0.16 + "em", zIndex: 1,
      ...(loestSich ? { animation: "ggPerleLoest .52s cubic-bezier(.3,.02,.5,1) both" } : null) }}>
      <StatOrbBadge kind={verbraucht && !loestSich ? "spent" : "spell"} v="" size={`${d * 0.66}em`} num={0.58} />
    </span>}
    {orb("life", piece.hp)}
  </span>;
}

// bare jewel sphere as an ICON — replaces the old sword/heart/bolt glyphs
export function JewelIc({ kind, size = 13 }) {
  return <span aria-hidden style={{ width: size, height: size, display: "inline-block", verticalAlign: "-0.15em",
    backgroundImage: `url(${ORB[kind]})`, backgroundSize: "100% 100%" }} />;
}

// px-based jewel badge for sheets & the court roster — the separately cut orbs.
export function StatOrbBadge({ kind, v, size = 26, num = 0.58 }) {
  // NEU GEGOSSEN (v0.38.1): weg von der geschnitzten Grafik mit versenkter
  // Zahl - hin zum SIEGEL-STIL der Schatzkammer: satte Kugel im Farbverlauf,
  // ein feiner GOLDRAND wie an jedem Wappen des Hauses, Glanzlicht oben, und
  // die Zahl WEISS und fett mit dunklem Kern - endlich klar lesbar.
  const chars = String(v ?? "").length;
  const fs = size * num * (chars >= 3 ? 0.8 : chars === 2 ? 0.9 : 1);
  // ZIFFERN NEU GESETZT (v0.47): Georgia bringt MEDIAEVALZIFFERN mit - 3, 4,
  // 5, 7, 9 haengen unter die Grundlinie, 6 und 8 ragen hoch. In einer Kugel
  // wirkt das wie ein Wackeln, obwohl der Textkasten mittig sitzt (gemessen:
  // Versatz dy = 0). Jetzt der System-Sans mit LINIENDEN, TABELLARISCHEN
  // Ziffern: gleiche Hoehe, gleiche Breite, jede Zahl steht ruhig - und eine
  // Stufe groesser, weil Sans-Ziffern schmaler bauen als Antiqua.
  // DUNKLER GEGOSSEN (v0.38.4): die satten Toene sprangen im Kampf zu sehr
  // an - eine Stufe tiefer, damit die Kugeln zum Brett gehoeren statt es zu
  // uebertoenen. Der Goldrand haelt sie trotzdem klar abgesetzt.
  /* ── DIE DRITTE KUGEL (v1.0.42, Besitzerwunsch): DIE FAEHIGKEIT ──────────
     Jede Figur darf EINE Faehigkeit je Partie einsetzen. Bisher sagte das
     nur ein kleiner goldener Stern zwischen den beiden Kugeln - zu leise
     und in einer anderen Sprache als der Rest.

     Jetzt traegt sie dieselbe gegossene Siegelkugel wie Angriff und Leben,
     nur in Violett: Goldrand wie ueberall, Fuellung von hellem Flieder ueber
     sattes Purpur nach Nachtviolett. Violett ist die Farbe des Risses - und
     der Riss entstand, weil die Figuren zu tun begannen, was Figuren nicht
     tun. Die eine Karte, die jede Figur spielen darf, gehoert also genau in
     diese Farbe.

     VERBRAUCHT heisst: die Fuellung erlischt zu kaltem Grauviolett, der
     Goldrand bleibt matt stehen. Man sieht auf einen Blick, wer seine Karte
     noch hat - dieselbe Form, nur ohne Licht.

     GEMALT WAERE FALSCH GEWESEN: die beiden anderen Kugeln sind kein Bild,
     sondern dieses SVG. Ein gemaltes Drittel daneben haette anderes Licht,
     andere Kanten und eine andere Aufloesung gehabt und sofort als Fremd-
     koerper gewirkt. "Genau gleich wie Angriff und Leben" heisst: dasselbe
     Verfahren. */
  const [c0, c1, c2] = kind === "life"
    ? ["#e0616f", "#a81a2a", "#3d0810"]
    : kind === "spell"
    ? ["#c4b5fd", "#7c3aed", "#2a1052"]
    : kind === "spent"
    ? ["#4a4358", "#2f2a3d", "#16121f"]
    : ["#6aa8d8", "#1f5e9e", "#08203c"];
  const rid = "sob-" + kind + "-" + String(size).replace(/[^a-z0-9]/gi, "");
  const schein = kind === "life"
    ? "drop-shadow(0 0 3px rgba(230,57,74,.7)) drop-shadow(0 1px 1.5px rgba(0,0,0,.55))"
    : kind === "spell"
    ? "drop-shadow(0 0 3px rgba(139,92,246,.75)) drop-shadow(0 1px 1.5px rgba(0,0,0,.55))"
    : kind === "spent"
    ? "drop-shadow(0 1px 1.5px rgba(0,0,0,.55))"   // verbraucht glimmt nicht
    : "drop-shadow(0 0 3px rgba(74,163,232,.7)) drop-shadow(0 1px 1.5px rgba(0,0,0,.55))";
  return <span style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center",
    flex: "0 0 auto", filter: schein }}>
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id={rid} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={c0} /><stop offset="52%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${rid})`} />
      <circle cx="12" cy="12" r="11" fill="none" stroke="#e3c07a" strokeWidth="1.1" opacity=".95" />
      <circle cx="12" cy="12" r="9.9" fill="none" stroke="#6f5526" strokeWidth=".7" opacity=".55" />
      <ellipse cx="9.2" cy="7.4" rx="4.6" ry="3" fill="rgba(255,255,255,.3)" />
      <text x="12" y="12" textAnchor="middle" dominantBaseline="central"
        fontFamily='ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
        fontWeight="800" fontSize={24 * num * (chars >= 3 ? 0.82 : chars === 2 ? 0.94 : 1.06)}
        fill="#ffffff" stroke="rgba(0,0,0,.62)" strokeWidth=".8" paintOrder="stroke"
        style={{ userSelect: "none", fontVariantNumeric: "tabular-nums lining-nums",
          fontFeatureSettings: '"tnum" 1, "lnum" 1' }}>{v}</text>
    </svg>
  </span>;
}

// Exported: the CELL renders this now (BoardView), anchored to the SQUARE —
// not to the piece's own em-box, whose size varies per figure (pawn 0.98em,
// court 1.16em, dragon 1.48em) and silently shifted the orbs up and down.
// Only the 2x2 dragon overlay still draws its own (no cell to sit in).
export function StatTriad({ piece, focus, shrink = 1 }) {
  // the board wears the DUO now: blue attack + red life, spell star between
  return <StatDuo piece={piece} focus={focus} shrink={shrink} />;
}

/* v1.0.26 (BEIM MESSEN GEFUNDEN): "fliegt" stand als ZWEITER Funktions-
   parameter statt im Eigenschaften-Objekt. React reicht dort nichts hinein,
   also war die Fahne IMMER false - die Reparatur des Flug-Ruckelns aus
   v1.0.14 lief seither ins Leere, und die fliegende Figur poppte weiter.
   Jetzt steht sie, wo sie hingehoert. */
/* v1.0.38: "aufsBrett" waehlt die KLEINE Fassung des Gemaeldes. Nur das
   Brett setzt sie - dort steht die Figur auf 50 px und 576 px waeren
   neunfach zu viel. Hofstaat, Popup und Zoom bleiben gross. */
const BRETT_HEBUNG = 0;      // v1.24.5c: die Probe hat ihren Dienst getan - die Hebung liegt in paintedArt (HEBUNG)

export function PieceGlyph({ piece, showLevel = true, pov = "w", artStyle = "painted", focus = false, big = false, fliegt = false, aufsBrett = false, effekt = null }) {
  if (!piece) return null;
  const white = piece.color === "w";
  const neon = white ? T.lime : T.magenta; // badge/frame color per faction
  // Grand Gambit faction colors: the player is antique gold, the enemy deep navy.
  const fill = white ? "#c9a45c" : "#1a2233";
  // A CONTOUR ON BOTH SIDES. Gold pieces used to carry no edge at all, so on a
  // light square they melted into it; the enemy's hairline was too thin to help
  // on a dark one. Now each side wears its OPPOSITE: near-black around the gold
  // (7.8:1 against its own fill, 7.4:1 against a light square) and near-white
  // around the navy (12.4:1 and 6.6:1). The stroke is painted UNDER the fill,
  // so it sharpens the outline without eating any detail.
  const rim = white ? "#1b1408" : "#dbe4f5";
  const rimW = 1.6;
  const detail = white ? "#7a5c26" : "#8fa0bb";
  const accent = piece.accent || T.gold;
  const lvl = piece.level || 1;
  /* v1.0.67: STUFENGLANZ AUF DEM BRETT (Besitzer: der Aufstieg muss auch
     auf dem Schachbrett sichtbar sein, nicht nur im Figurenblatt). Steigt
     der Rang DIESER Figur, waehrend sie auf dem Brett steht, birst einmal
     ein goldener Stern ueber ihr. Gemerkt wird der vorige Rang je Glyph -
     kein globaler Zustand, kein Re-Render der Nachbarn. */
  const rangVorher = useRef(lvl);
  const [stufenStern, setStufenStern] = useState(0);
  useEffect(() => {
    if (lvl > rangVorher.current && animAn() && !big) setStufenStern((n) => n + 1);
    rangVorher.current = lvl;
  }, [lvl, big]);
  const hpMode = piece.atk != null;
  // A master stands in the QUEEN'S PLACE — that is a matter of formation, not
  // of disguise. He shows his true face to both sides: the whole point of
  // meeting a champion is SEEING whom you face.
  const isBoss = !!piece.bossId;
  const paintPiece = piece;
  // The Grand Gambit wears his crest openly — unless Masquerade is learned:
  // then only his OWN commander (pov) still sees who he is.
  const showHero = !!piece.hero && (piece.color === pov || !(piece.abilities || []).includes("gambit_masquerade"));

  // Ability dots (right rail): sorted by tag for a stable column; once-spent
  // talents fade to ash so a glance tells you what is left in the tank.
  const abilityDots = (piece.abilities || [])
    .map((id) => ABILITIES[id]).filter(Boolean)
    .sort((x, y) => TAG_ORDER.indexOf(x.tag) - TAG_ORDER.indexOf(y.tag))
    .slice(0, 6)
    .map((ab) => ({ id: ab.id, color: (TAGS[ab.tag] || { color: T.gold }).color, spent: !!(ab.once && piece.used?.[ab.id]) }));

  // Crisp, modern: a short drop shadow for depth — no neon bloom. The risen
  /* v1.0.62: die Rang-Aura ist Geschichte - der Rang zeigt sich im BILD
     (paintedRoh waehlt gambit-t2..t6 nach piece.tier). */
  // POWER READS AS LIGHT: the mightier the piece, the brighter and shinier.
  // King > queen > masters-in-the-queen's-place > everyone else > pawns. The
  // king's portrait is painted far darker than the queen's (measured: median
  // 32 against her 58), so he needs a heavier hand to stand beside her. The
  // Gambit is a pawn — painted as dark as one — but he GLEAMS: a quiet sheen
  // even at tier one (gold for your own, cold steel for a foe's), beneath the
  // tier aura that grows with his rank.
  const isKing = !piece.hero && !isBoss && piece.kind === "K";
  const isQueen = !piece.hero && !isBoss && piece.kind === "Q";
  const isPawn = !piece.hero && !isBoss && piece.kind === "P";
  const royal = isKing || isQueen || isBoss;
  // Der Saum folgt der Silhouette: erste Stufe schmal und hell (die Kante),
  // die weiteren breiter und schwaecher (das Abklingen ins Violett). Die
  // EIGENEN glimmen nur leise golden, die Gegner tragen den Riss - und beim
  // Auswaehlen glimmt die Figur deutlich auf.
  // EINE KONTUR, KEIN NEBEL: zwei enge Schatten statt dreier weiter - das
  // Licht liegt AUF der Silhouette, frisst kein halbes Feld und kostet die
  // Haelfte an Rechenzeit.
  const gewaehlt = !!piece.selected;
  // v0.71.14 (Besitzer): DIE FIGUR DES LETZTEN ZUGES zuckt einmal auf und
  // glimmt langsam aus - Gegner im Riss-Violett, eigene im Gold. Nur DIESE
  // eine Figur, sonst wird der Schirm unruhig.
  const zuletzt = !!piece.justMoved;
  /* v1.0.11 (Besitzer): ALLE Figuren leuchten auf KOENIGS-Mass — eigene
     deutlich goldener, der Gegner heller und kraeftiger im Riss-Violett
     (184,146,255 statt 150,105,255). Der Koenig behaelt sein ROYAL_HALO
     obenauf und bleibt so die Spitze des Massstabs. */
  /* v1.0.50: DIE GEWAEHLTE SICHT AUF DEN GEGNER (gegnerstil.js). "farbig"
     ist der Alltag; "grau" entfaerbt die Figur, laesst aber den Riss
     violett; "getoent" macht auch den SCHIMMER grau - dort traegt die Figur
     stattdessen ihre Grundfarbe als aufsteigenden Verlauf. Der klassische
     Satz und die eigene Seite bleiben grundsaetzlich unberuehrt. */
  const sicht = (white || artStyle === "classic") ? "farbig" : gegnerStil();
  const gefahr = gefahrVon(piece.kind);   /* v1.0.60: Sockel-Leuchtstaerke */
  /* v1.0.66 (Besitzerwunsch): DIE GLUT GILT FUER BEIDE SEITEN. Bisher glomm
     nur der Gegner; die eigene Seite stand ohne Sockel da und war allein am
     Goldschein zu erkennen. Jetzt dasselbe Bauwerk in Gold - "dann ist da
     eine klare Unterscheidung". Der klassische Satz bleibt aussen vor:
     normales Schach sieht aus wie normales Schach. */
  const klassisch = artStyle === "classic";
  const ton = klassisch ? null : glutTon(white);
  // v0.71.14: alle Figuren minimal aufgehellt und kontrastreicher; die
  // Gegenseite traegt DIESELBE Kunst, nur eine Spur dunkler - die Trennung
  // leisten Goldschein (eigene) und Riss-Violett (Gegner).
  /* v1.0.62 (Besitzer): die EIGENE Seite und der getoente Blick tragen die
     ORIGINALFARBEN - kein brightness, kein contrast, nichts. Nur der graue
     Blick behaelt seine leichte Abdunklung als Teil seines Looks. */
  /* v1.0.66: keine Sonderabdunklung mehr - beide Fassungen zeigen die
     Originalfarben, siehe den Filterzweig weiter unten. */
  const tonung = "";
  /* ── v1.0.41: HIER LAG DAS RUCKELN. GEMESSEN, NICHT VERMUTET. ────────────
     Der klassische Satz bekam genau EINEN drop-shadow, jede andere Figur bis
     zu NEUN - Basisschatten, vierteiliger SIDE_GLOW, ROYAL_HALO, HERO_SHEEN,
     AURA. Jeder drop-shadow ist ein eigener Unschaerfe-Durchgang mit eigenem
     Zwischenpuffer, und beim Antippen laeuft scale(1.58), also muss die ganze
     Kette neu gerechnet werden - fuer alle 32 Figuren zugleich.

     A/B am Brett-Pruefstand (tools/messe-ruckeln2.mjs, 100 Bilder je Lauf,
     390x844, ohne Grafikbeschleunigung):
         wie es war                Median 1667 ms
         Schattenkette aus         Median   22 ms   →  75x
         nur EIN Schatten          Median   42 ms   →  40x
     Genau der Unterschied, den der Besitzer die ganze Zeit gesehen hat.

     Das war NICHT die Bildgroesse: v1.0.38 senkte sie von 576 auf 192 px und
     das Ruckeln blieb - der Aufwand haengt nicht am Bild, sondern an den
     Durchgaengen darueber.

     Die Regel jetzt: eine RUHENDE Figur traegt zwei Durchgaenge (ihr Schatten
     und ihr Seitensaum, damit Freund und Feind unterscheidbar bleiben). Die
     volle Pracht - Aura, Heldenglanz, Koenigshalo, breiter Saum - bekommt nur
     die Figur, die gerade AUSGEWAEHLT ist oder eben gezogen hat. Das ist auf
     einem Brett meist genau eine, nie mehr als zwei. Sichtbar ist der
     Unterschied dort, wo das Auge ohnehin hinsieht. */
  const hervorgehoben = gewaehlt || zuletzt || focus;
  /* v1.0.48 (Besitzerbefund): ZU HELL. v1.0.41 hat die Filterkette gekuerzt
     und dabei die STAERKE des Saums verloren. Vorher war er zustandsabhaengig
     gedimmt - eine ruhende eigene Figur trug 0.55, eine gegnerische 0.85; ich
     hatte beide auf 0.85/0.95 gesetzt. Das machte die eigene Seite deutlich
     lauter und drehte zugleich das Verhaeltnis um, in dem Gold und Violett
     zueinander standen. Beide Werte sind jetzt wieder die alten; die
     Sparsamkeit (ein Durchgang statt vier) bleibt. */
  /* v1.0.50 (Besitzerwunsch): der RISS-SAUM des Gegners noch eine Spur
     kraeftiger und breiter. Bewusst OHNE zusaetzlichen drop-shadow-Durchgang
     (v1.0.41-Lektion: jeder Durchgang ist ein eigener Unschaerfe-Lauf) -
     nur Radius 1.5 -> 2.4 und Deckung .85 -> .95. Die eigene Seite bleibt
     beim leisen Gold von v1.0.48. */
  /* v1.0.62 (Besitzer, Grossputz am Schimmer): "man braucht es nicht mehr
     in diesem Masse." Die eigene Seite traegt GAR KEINEN Saum mehr - nur
     ihren ehrlichen Schatten. Der Gegner behaelt einen HAUCH Riss-Violett
     (Deckung .95 -> .38), damit Freund und Feind unterscheidbar bleiben.
     Und die Auswahl-Pracht - vierteiliger Seitensaum, Aura, Heldenglanz,
     Koenigshalo - ist GESTRICHEN: "wenn man's anwaehlt ... besonders krass,
     eigentlich unnoetig." Der gewaehlte Zustand zeigt sich am Feldring und
     an der Vergroesserung, nicht an einem Lichtspektakel. Nebeneffekt: die
     teuerste Filterkette des Bretts (v1.0.41-Messung) ist damit Geschichte. */
  const SAUM_RUHIG = white
    ? ""
    : "drop-shadow(0 0 2.4px rgba(184,146,255,.38))";
  const glow = klassisch
    ? "drop-shadow(0 2px 3px rgba(0,0,0,.55))"     // nur ein ehrlicher Schatten
    : (tonung ? tonung + " " : "") + "drop-shadow(0 2px 3px rgba(0,0,0,.65))"
      + (SAUM_RUHIG ? " " + SAUM_RUHIG : "");
  // v0.71.1: klassische Figuren einen Hauch kleiner (Besitzer: "noch etwas zu gross")
  const pieceSize = isBoss ? "1.14em" /* v0.71.12: Bosse stehen groesser - der Waechter war kaum zu erkennen */
    /* v1.0.14 (Besitzer): KLASSIK WAECHST. 0.9em liess besonders den Bauern
       verloren auf seinem Feld stehen; der klassische Satz traegt keine
       Orben und keine Sterne, also darf er die Zelle fuellen. Der Bauer
       bekommt eine Extra-Stufe, weil seine Figur von Haus aus die
       niedrigste Silhouette hat. */
    /* v1.0.26 (Besitzer, zweite Runde): NOCH GROESSER. 1.02em liess dem
       klassischen Satz immer noch Luft am Feldrand, und der Bauer blieb
       verloren - seine Figur hat die niedrigste Silhouette des ganzen
       Spiels. Der Satz traegt weder Orben noch Sterne, er darf sein Feld
       wirklich ausfuellen; der Bauer bekommt weiterhin eine Extrastufe. */
    /* v1.0.34 (Besitzer, dritte Runde): "Bauern noch VIEL groesser, alle
       anderen minimal kleiner." Der Bauer traegt die niedrigste Silhouette
       des Satzes und verlor gegen die hohen Figuren jedes Mal; jetzt steht
       er hoeher als sie. Die uebrigen gehen eine Spur zurueck, damit die
       Reihe nicht gedraengt wirkt. */
    : klassisch ? (paintPiece.kind === "P" ? "1.46em" : "1.08em")
    : hpMode && piece.maxHp > 0 ? "0.99em" : "1.0em";

  // Resolve the painting up-front (if any) so we can level its base width. The
  // enemy's gallery is turned to steel; the risen Gambit wears his tier portrait.
  // The carved set only covers the six basic ranks; anything it has no figure
  // for (court, bosses, the risen Gambit) drops through to the gallery, so the
  // style switch never leaves a square empty.
  // v0.71.14 (Besitzer): der Leuchtstil ist fort - UEBERALL dieselben Figuren.
  /* ── v1.0.41 (Besitzerentscheid): EIN SATZ, KEINE WEICHE ────────────────
     Das Spiel trug zwei geschnitzte Saetze nebeneinander: den HAUPTSATZ (im
     Ordner "painted" - der Name ist historisch, die Bilder darin sind seit
     v1.0.39 aus archiv/bilder/figuren-hq geschnitten und damit geschnitzt)
     und einen aelteren ZWEITSATZ mit hell/dunkel-Paaren (Ordner "carved").
     Der Besitzer arbeitet ab jetzt nur noch mit dem Hauptsatz, also faellt
     die Weiche.

     Das ist nicht nur Aufraeumen, es kostete auch Leistung: der Zweitsatz
     hat KEINE 192-px-Kleinfassungen (carved/klein existiert nicht), also
     lieferte kleinFuerBrett() dort das grosse 461x576-Bild aufs 50-px-Feld
     zurueck - genau die neunfache Neuabtastung, die v1.0.38 eigentlich
     beseitigen sollte. Gemessen im Pruefstand: 461x576 auf 77x90 gezeigt.

     Der klassische Satz (Turnierfiguren) BLEIBT - er ist kein Stilwechsel,
     sondern gehoert zum klassischen Schach. Und artStyle="svg" bleibt
     ebenfalls: das sind die GEZEICHNETEN Silhouetten (PieceArt), die
     Prueflauf und Notfall-Darstellung tragen. Beim ersten Anlauf hatte ich
     sie mit abgeschnitten - test_ui.jsx hat es gefangen. */
  const painting = artStyle === "svg"
    ? null
    : artStyle === "classic"
    ? (klassikFor(paintPiece) || CLASSIC_PAINTED[paintPiece.kind] || paintedForPiece(paintPiece, aufsBrett))
    /* v1.0.49 (Besitzerentscheid): DER HELD IST VON ANFANG AN ZU SEHEN.
       Bis jetzt trug er das Prunkritter-Bild erst ab Rang II - der Gedanke
       war, dass das Erwachen ein Bruch sein soll. Der Besitzer hat den
       staerkeren Einwand: er ist die Figur, die auf der KARTE ohnehin
       durchgehend zu sehen ist. Wer er ist, muss vom ersten Zug an klar
       sein, sonst erzaehlt Brett und Karte Verschiedenes.
       Also traegt er sein goldenes Bild ab Rang I. Fuer die hoeheren Raenge
       fehlen die gelben Fassungen noch; bis sie da sind, greift der
       ||-Rueckfall auf dasselbe Bild, statt in den Prunkritter aus der
       anderen Bildwelt zu springen.
       ACHTUNG, HIER LAG EIN FEHLER: dieser Zweig gilt fuer JEDE Figur, die
       weder klassisch noch SVG ist - im ersten Anlauf trug damit das ganze
       Brett das Gambit-Bild, Bosse eingeschlossen. Die Bedingung muss den
       Helden ausdruecklich nennen. test_ui hat es gefangen. */
    /* v1.0.83 (Besitzer, zum wiederholten Mal: "in allen diesen Screens ist
       nie der aktualisierte Grand Gambit drin"): HIER STAND DER RIEGEL. Der
       Zweig griff paintedById("gambit") ab - das GRUNDBILD, Rang I - und kam
       damit paintedForPiece zuvor, das den Rang laengst richtig waehlt. Ein
       Rest aus v1.0.49, als die Rangbilder noch stilfremd waren und
       ausdruecklich unterdrueckt werden sollten; seit v1.0.62 sind sie da.
       Jetzt entscheidet allein paintedForPiece - und das liest piece.tier. */
    : paintedForPiece(paintPiece, aufsBrett);
  // every painting fitted to one box (uniform height) and dropped onto one
  // baseline; big pieces and the drawn SVG opt out. The carvings were already
  // cropped and levelled at build time, so they need no per-file fit.
  const fit = (painting && !big) ? paintedFitFor(paintPiece) : { h: 1, y: 0 };
  /* v1.0.72: die Sockelkante DIESER Figur - aus dem Speicher sofort, sonst
     einmal gemessen (Boss-Grossbilder big tragen keine Glut-Maske, dort
     bleibt der Fallback ungenutzt). */
  const [sockelKante, setSockelKante] = useState(
    () => (painting && sockelKanteAusCache(painting)) || KANTE_FALLBACK);
  /* v1.0.80: der Leerraum unter DIESER Figur - fuer die gemeinsame Fusslinie. */
  const [fussLinie, setFussLinie] = useState(
    () => (painting && fusslinieAusCache(painting)) ?? HAUSLINIE);
  /* v1.14.1: IM HP-GEFECHT ENDET DAS BILD AN DER SOCKELKANTE - der Teller
     bleibt weg, das Rohr uebernimmt seinen Platz (siehe sockelLinieEm). */
  /* v1.18.0: DAS BAND IM SOCKEL, auch auf dem Brett (Besitzervorlage "same
     indicator, real gameplay"). Der Teller wird nicht mehr abgeschnitten -
     er TRAEGT jetzt die Anzeige, wie in der Vorlage. Der Schnitt aus v1.14.1
     bleibt nur fuer Gemaelde ohne Sockelmessung. */
  /* ── v1.24.4 (Besitzer): DAS BAND STEHT IMMER ────────────────────────────
     "Die Baender sind hier unten gar nicht drin. Wir haben doch dieses graue
      Band, wenn noch gar nichts dargestellt ist."
     Richtig - bandDa verlangte hpMode, also trug eine Partie ohne Werte gar
     keinen Ring. Der Sockel ist aber das Erkennungszeichen der Figur, nicht
     nur eine Lebensanzeige: ohne Werte steht er grau da (die Fassung, die im
     Entwurf "ohne Werte" hiess), mit Werten rot fuer Leben und blau fuer
     Kraft. Die Gegnerseite wird vom Brett ohnehin gedunkelt, also liest sich
     ihr Grau von selbst dunkler als das eigene. */
  const werteAn = hpMode && piece.maxHp > 0;
  const bandDa = ROHR_STATT_PERLEN && !!painting && !klassisch && bandBekannt(paintedIdOf(painting));
  const schneide = ROHR_STATT_PERLEN && !!painting && !big && !klassisch && werteAn && !bandDa;
  const schnitt = schneide ? `inset(0 0 ${(sockelKante * 100).toFixed(2)}% 0)` : undefined;
  useEffect(() => {
    let lebt = true;
    if (painting && !big) {
      holeSockelKante(painting).then((k) => { if (lebt) setSockelKante(k); });
      holeFusslinie(painting).then((f) => { if (lebt) setFussLinie(f); });
    }
    return () => { lebt = false; };
  }, [painting, big]);

  return (
    <div style={{ position: "relative", width: "1em", height: "1em", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: big ? "center" : "flex-end",
      paddingBottom: big ? 0 : "0.015em",
      /* v1.0.14 (Besitzer, "die Figur ruckelt, als waeren es zwei Objekte"):
         GENAU DAS WAR ES. Der Flug zeichnet eine ZWEITE Figur ueber dem
         Brett, die Zelle blendet ihre eigene aus - und beide spielten beim
         Erscheinen "pop" (Sprung von 60 % auf 100 %). Man sah also beim
         Abflug einen Stauch-Ruck und beim Ankommen noch einen. Jetzt gilt:
         pop nur, wenn eine Figur wirklich NEU auf dem Brett erscheint
         (Verwandlung, Aufbau). Wer gerade geflogen ist, LANDET stattdessen -
         ein kurzes, gerichtetes Setzen aufs Feld statt eines Sprungs. */
      /* v1.0.67: DIE AUFSTELLUNG LEBT (Besitzer: "auch obwohl es statisch
         ist, trotzdem eine gewisse Dynamik"). Jede Figur atmet kaum merklich
         - transform-only, 4,6 s Takt, und der NEGATIVE Startversatz aus
         Figurenart und Rang laesst alle sofort, aber phasenversetzt atmen:
         kein synchrones Wippen, kein Wartezoegern. Haengt sich als weitere
         Animation an die bestehenden (Landung, Blitz), ueberschreibt nichts.
         Aus, wenn der Schalter aus ist, im Grossformat und im Flug. */
      /* v1.0.76 (Besitzerbefund: "sie zieht und hat dann so einen Sprung
         drin, als wuerde sie nicht sauber landen"): DAS ATMEN LAG AUF
         DERSELBEN EBENE WIE DIE LANDUNG. Beide animieren transform, und bei
         mehreren Animationen auf derselben Eigenschaft gewinnt die ZULETZT
         genannte - ggAtmen ueberschrieb also ggLandung und sprang beim
         Aufsetzen sofort auf seine (per negativem Versatz zufaellige)
         Phase. Deshalb ruckelte gerade der Springer, dessen Flug am
         laengsten dauert.
         Das Atmen wandert jetzt eine Ebene tiefer (siehe unten am
         Bildkasten) - Landung, Blitz und Pop bleiben hier allein auf
         transform, und die Bewegungen koennen sich nicht mehr ins Gehege
         kommen. */
      animation: fliegt ? "none"
        /* v1.0.96: die Federkurve hatte 1.5 als Ueberschwinger - zusammen mit
           dem alten -7%-Start ergab das den doppelten Ruck. Die Kurve ist
           jetzt ruhig (ease-out), das Federn steckt allein in den Keyframes. */
        : zuletzt ? `${white ? "ggGoldBlitz" : "ggRissBlitz"} 2.6s ease-out both, ggLandung .3s cubic-bezier(.22,.68,.32,1) both`
        /* ── KEIN POP AUF DEM BRETT MEHR (v1.4.9) ────────────────────────
           Vier Messungen haben hierher gefuehrt. Der Besitzer sah "beim
           Ziehen einen kurzen Versatz, manchmal" - gemessen war es kein
           Versatz der Position (0,1 px), sondern ein Sprung der GROESSE: die
           ankommende Figur startete bei scale(.6) und wuchs auf 1.

           Die Unterscheidung dafuer gibt es (zuletzt -> ggLandung statt pop),
           und die Zelle setzt sie auch richtig. Nur greift sie einen
           Rendering-Takt zu spaet: die Figur steht schon im Zielfeld, waehrend
           lastMove sie noch nicht erreicht hat. In diesem einen Takt startet
           pop - und der Rest springt zu, wenn die Landung uebernimmt.

           Statt an diesem Takt zu drehen, faellt pop AUF DEM BRETT ganz weg.
           Es war ohnehin die grobste Loesung: ein Sprung von 60 % auf 100 %
           fuer etwas, das entweder landet (dann gilt ggLandung) oder still
           erscheint (Aufbau, Verwandlung) - und dort ist ein sanftes
           Einblenden richtiger als ein Aufploppen. Ausserhalb des Bretts
           (Hofstaat, Aufstellung) bleibt pop, da erscheinen Figuren wirklich
           neu. */
        : aufsBrett ? "ggSanft .22s ease-out both"
        : "pop .18s ease",
      boxSizing: "border-box" }}>

      {/* the head may rise above the square: the art gets MORE than the tile.
          A big piece (the 2x2 dragon) fills its whole block, centred. The scale
          levels each figure's base to one width, anchored at the foot so the
          base stays planted on the square. */}
      {/* v1.1.9 (Besitzer: "du musst unten den Sockel noch sauber weiss faerben,
         und er muss auch ein bisschen weiter nach oben bewegt werden, weil er
         ist ein bisschen zu weit unten - du darfst ihn noch etwas kleiner
         machen, minimal"): der Sockel ist im Bild gefaerbt (Steingrau, gemessen
         139/139/138 statt 157/119/47 - die Standardmaske deckte nur 12 %, der
         Sockel reicht aber 22,4 % hoch). Hier stehen die beiden anderen
         Punkte: 1,48 -> 1,42 em (minimal kleiner) und ein Stueck nach oben. */}
      <div style={{ position: "relative", zIndex: 1, width: big ? "1.42em" : pieceSize, height: big ? "1.42em" : "calc(" + pieceSize + " * 1.16)", filter: glow, flex: "0 0 auto",
        /* v1.0.76: HIER atmet die Figur - eine Ebene unter Landung und Pop,
           damit sich zwei transform-Animationen nie mehr ueberschreiben.
           Waehrend des Fluges und im Zug danach ruht es zusaetzlich
           (zuletzt), damit das Aufsetzen die volle Aufmerksamkeit hat. */
        ...(animAn() && !big && !fliegt && !zuletzt && artStyle !== "classic"
          ? { animation: `ggAtmen 4.6s ease-in-out ${-(((piece.kind.charCodeAt(0) * 7 + lvl * 3) % 9) * 0.53).toFixed(2)}s infinite` }
          : null),
        marginTop: big ? "-0.09em" : "-0.16em",   // v1.1.9: der Drache sass zu tief
        /* v1.0.57 (Besitzerbefund am BRETT: "Koenig zu weit links, Bishop zu
           weit rechts"): Der waagerechte Ausgleich stand hier zwar seit jeher
           im Kommentar - aber PAINTED_FIT.x ist bei JEDER Figur 0. Es wurde
           also nie etwas ausgeglichen; die Figuren standen so schief, wie sie
           im Bild sitzen. Jetzt nimmt auch das Brett den SOCKEL-Versatz, die
           gleiche Zahl wie Hofstaat und Aufstellung: Bishop +9.0 %,
           Koenig -3.0 %. Weiterhin mal fit.h, weil das Skalieren den Versatz
           sonst nach aussen traegt. */
        /* v1.0.80 (Besitzer: "die Figuren sind nicht perfekt ausgemittelt
           von der Hoehe, die muessen alle gleich hoch sein"): ALLE FUESSE AUF
           EINE LINIE. Die Gemaelde tragen unterschiedlich viel Leerraum unter
           dem Sockel - gemessen streut er von 2,1 % (Barde) bis 6,8 %
           (Haendler) der Bildhoehe. Da alle mit derselben Hoehe ins Feld
           gesetzt werden, schwebt der Haendler damit fast 5 % ueber der Linie
           des Barden. Der Ausgleich zieht die Abweichung von der Hauslinie
           (3,1 %) ab, mit der Bildhoehe (fit.h) skaliert, weil der Leerraum
           mitwaechst. Die gepflegten GROESSEN bleiben unberuehrt: eine Dame
           darf groesser sein als ein Bauer - sie soll nur auf derselben Linie
           stehen. Ohne Messung (noch nicht geladen) ist der Ausgleich null,
           also genau der Stand von vorher. */
        /* ── v1.24.5c: WARUM DIE VERWANDLUNG NIE ANKAM ─────────────────────
           Besitzer: "Finde jetzt raus, wie du die Figuren verschiebst - und es
           muss immer auch in Kombination mit der Animation passieren."

           GEMESSEN, mit einem fest eingetragenen Hebebetrag als Probe: keine
           Bewegung, kein Pixel. Und dann gelesen: DIESES Element traegt die
           Atmen-Animation ggAtmen (oben in derselben style-Liste), und die
           animiert `transform`. Eine laufende CSS-Animation auf `transform`
           UEBERSCHREIBT die Inline-Eigenschaft `transform` vollstaendig,
           solange sie laeuft - und sie laeuft endlos. Deshalb war jede
           Skalierung und jeder Versatz hier seit jeher wirkungslos: die
           Handtabelle PAINTED_FIT, die gemessene Anpassung, die Hebung, die
           Mitte der Dame. Die Figuren standen immer so, wie sie im Bild
           sitzen, plus Atmen. Der Kommentar von v1.0.76 ahnte das Problem
           ("damit sich zwei transform-Animationen nie mehr ueberschreiben"),
           legte aber nur die Sprung-Animationen auf eine andere Ebene - die
           Anpassung blieb hier, unter dem Atmen begraben.

           LOESUNG: die EINZELNEN Verwandlungseigenschaften `translate` und
           `scale` statt `transform`. Sie sind eigene CSS-Eigenschaften, eine
           Animation auf `transform` laesst sie unangetastet, und der Browser
           setzt beides zusammen (translate, dann scale, dann transform). So
           atmet die Figur UND steht dabei richtig. */
        ...(() => {
          const ausgleich = (big || FIT_GEMESSEN) ? 0 : (fussLinie - HAUSLINIE) * fit.h * 1.16;
          const y = (fit.y || 0) + ausgleich - BRETT_HEBUNG;
          const x = fit.x || 0;
          /* gemessene Anpassung liefert y in PROZENT der Elementhoehe, die
             Handtabelle in em - beide Einheiten sauber getrennt */
          const yEinheit = fit.yProzent ? "%" : "em";
          return { translate: `${(x * 100).toFixed(3)}% ${y.toFixed(3)}${yEinheit}`, scale: `${fit.h}`, transformOrigin: "50% 100%" };
        })() }}>
        {/* v1.0.70 (Besitzer): DER LEBENSTRANK LAEUFT DURCH DIE FIGUR. Ein
            roter Heilglanz wandert einmal von unten nach oben - MASKIERT auf
            das eigene Gemaelde (WebkitMaskImage: die Bilddatei selbst), nicht
            als Fleck ueber dem Feld. Der Span liegt im selben Wrapper wie das
            Bild und erbt dessen fit-Transform, die Maske nutzt dieselbe
            Ausrichtung wie objectFit/objectPosition - Glanz und Figur sind
            deckungsgleich. key=effekt.id startet jeden Einsatz neu. */}
        {painting && effekt && effekt.art === "trank" && animAn() && (
          <span key={effekt.id} aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden",
            pointerEvents: "none", zIndex: 4,
            WebkitMaskImage: `url(${painting})`, maskImage: `url(${painting})`,
            WebkitMaskSize: "contain", maskSize: "contain",
            WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
            WebkitMaskPosition: big ? "center" : "center bottom", maskPosition: big ? "center" : "center bottom" }}>
            <span style={{ position: "absolute", left: 0, right: 0, top: "-15%", bottom: "-15%",
              background: "linear-gradient(0deg, rgba(255,60,60,0) 0%, rgba(255,80,70,.55) 35%, rgba(255,190,160,.95) 50%, rgba(255,80,70,.55) 65%, rgba(255,60,60,0) 100%)",
              animation: "ggTrankLauf 1.05s ease-in-out both" }} />
          </span>)}
        {painting
          ? <img src={painting} alt="" draggable={false} decoding="async" style={{ width: "100%", height: "100%",
              clipPath: schnitt, WebkitClipPath: schnitt,
              // the gallery hangs in a dim hall — lift the paintings a step:
              // your golden court shines brighter, the steel foe a touch too
              objectFit: "contain", objectPosition: big ? "center" : "center bottom",
              // A CARVING BRINGS ITS OWN COLOUR. The navy team and the cream
              // team are two separate cuts of stone (tools/carve-light.py), so
              // neither the gold lift nor the steel filter may touch them —
              // both would repaint the inlaid gold. Only the rank gets a
              // whisper of light, so kings and queens still read first.
              filter: klassisch
                // der klassische Satz bringt seine beiden Farben schon mit -
                // kein Umfaerben, nur ein Hauch Licht fuer die Grossen
                ? (isKing ? "brightness(1.08)" : isQueen ? "brightness(1.04)" : "none")
                : white
                /* v1.0.62 (Besitzer, dritter Anlauf und der letzte): DIE EIGENE
                   SEITE TRAEGT DIE ORIGINALFARBEN. Punkt. Jede Aufhellung
                   stammte aus der Zeit vor den HQ-Neuschnitten und wurde
                   seither nur verringert statt entfernt - "insbesondere der
                   Koenig" stand immer noch zu hell. Die Vorlagen sind gut;
                   der Filter hat ihnen nichts mehr zu sagen. */
                ? "none"
                /* v1.0.66: DIE GEGNERFIGUR TRAEGT IHRE ORIGINALFARBEN - in
                   BEIDEN Fassungen. Bis v1.0.65 stand hier noch die alte
                   Dreiteilung: "grau" entfaerbte die Figur, "farbig" legte
                   ENEMY_FILTER und Helligkeitsschuebe auf. Der Besitzer hat
                   die Graustufen abgeschafft ("die fallen jetzt eh weg"), und
                   die verbliebene Wahl betrifft ausdruecklich nur die GLUT am
                   Sockel, nicht die Figur darueber. Was die Seiten trennt,
                   ist also allein das Licht am Boden - lila gegen gold, oder
                   schwarz gegen weiss. */
                /* v1.0.76 (Besitzer: "wir muessen die gegnerische Mannschaft
                   trotzdem noch etwas entfaerben Richtung Graustufen und
                   dunkler machen, da man sonst nicht sofort den Unterschied
                   erkennt"). v1.0.66 hatte den alten ENEMY_FILTER ganz
                   entfernt, weil die Trennung allein die Sockelglut tragen
                   sollte - am Geraet reicht das nicht, beide Seiten zeigen ja
                   dasselbe Gemaelde. Jetzt traegt die Gegenseite wieder eine
                   MASSVOLLE Entfaerbung (halbe Saettigung) und ist spuerbar
                   dunkler; die eigene Seite bleibt unangetastet in ihren
                   Originalfarben. Kein Grauschleier wie frueher - die Figur
                   bleibt erkennbar, sie tritt nur zurueck. */
                /* v1.22.2 (Besitzer): "gib den Gegnern wieder mehr Farbe - nur
                   ein Hauch von Graustufen, man muss sie klar sehen". Vorher
                   halbe Entfaerbung und ein Viertel dunkler; jetzt ein Fuenftel
                   Grau und kaum dunkler. Die Trennung tragen Sockelband und
                   Riss-Violett. */
                : "grayscale(0.22) saturate(0.9) brightness(0.92)",
              userSelect: "none", pointerEvents: "none" }} />
          : <PieceArt kind={piece.kind} fill={fill} rim={rim} rimW={rimW} detail={detail} accent={accent} size="100%" level={showLevel ? lvl : 1} art={piece.art} bossId={piece.bossId} hero={showHero} />}
        {/* v1.0.50: DIE GRUNDFARBE STEIGT AUF. Nur im getoenten Stil: eine
            zweite, deckungsgleiche Kopie des Bildes, per sepia+hue auf die
            Grundfarbe der Figurenart gedreht und mit einer LINEAREN
            Verlaufsmaske von unten eingeblendet. Linear-Verlaeufe sind fuer
            den Grafikkern trivial - die teuren Figurmasken aus der
            Ruckel-Geschichte (v1.0.37) braucht es dafuer nicht. */}
        {/* v1.0.60 (Besitzerwunsch): DER SOCKEL GLUEHT LILA - in BEIDEN
            Gegnerstilen. Nicht mehr die halbe Figur toenen: die Lila-Kopie
            wird per Verlaufsmaske auf die untersten ~22 % beschraenkt (dort
            sitzt der Sockel bei jeder Figur) und krachend gesaettigt, dazu
            ein weicher Lichtschein hinter dem Fuss. Gefahrenstaffel bleibt:
            je gefaehrlicher, desto heller glueht es (gegnerstil.js). Linearer
            Verlauf + radialer Schein sind fuer den Grafikkern trivial - die
            teuren Figurmasken aus der Ruckel-Geschichte (v1.0.37) braucht es
            nicht. */}
        {painting && ton && (() => {
          /* v1.0.71 (Besitzerbefund: "das Schwarz hat irgendeinen Fehler
             drin - nicht nur der Sockel ist gefaerbt, so ein komischer
             Verlauf"): GENAU. Zwei Schichten liefen bei Schwarz/Weiss mit,
             die dort nichts verloren haben - der radiale SCHEIN hinter dem
             Fuss (78 % Feldbreite) und der BODENSCHLEIER ueber die VOLLE
             Feldbreite (bei Schwarz 0,62 Deckung: ein dunkler Balken uebers
             Feld). Beide gehoeren zur farbigen Fassung, wo Licht die
             Geschichte traegt. Schwarz/Weiss will das Gegenteil: NUR der
             Sockel traegt die Farbe - die maskierte Glutkopie allein, kein
             Schein, kein Schleier. */
          const nurSockel = ton === "schwarz" || ton === "weiss";
          return (<>
          {/* v1.0.62 (Besitzer): der Lichtschein hinter dem Fuss ist fast
              ganz fort - "man braucht es nicht mehr in diesem Masse". Was
              bleibt, ist ein Hauch: schmaler, flacher, ein Viertel der alten
              Deckung, nur damit die Glut einen Boden hat.
              v1.0.66: im Ton der jeweiligen Seite. */}
          {!nurSockel && !schneide && <span aria-hidden style={{
            position: "absolute", left: "50%", bottom: "-1%", width: "78%", height: "16%",
            transform: "translateX(-50%)", borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(ellipse 50% 46% at 50% 58%, rgba(${GLUT_SCHEIN[ton][0]},${(0.12 + 0.10 * gefahr).toFixed(2)}) 0%, rgba(${GLUT_SCHEIN[ton][1]},${(0.08 + 0.08 * gefahr).toFixed(2)}) 46%, rgba(${GLUT_SCHEIN[ton][1]},0) 72%)`,
            filter: "blur(1.5px)" }} />}
          <img src={painting} alt="" aria-hidden draggable={false} decoding="async" style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            clipPath: schnitt, WebkitClipPath: schnitt,
            objectFit: "contain", objectPosition: big ? "center" : "center bottom",
            /* v1.0.66 (Besitzerbefund "zu hell"): DIE GLUT STEHT JETZT AUF DEM
               KOPF - im Sinne des Besitzers. Bisher lag ihr Maximum ganz
               UNTEN (0,96 bei 5 %) und verlosch nach oben: die Figur sass in
               ihrem hellsten Punkt, der Fuss leuchtete greller als der Sockel
               darueber. Gewuenscht ist das Gegenteil: "von mehr Dunkel,
               Schwarz starten und dann nach oben hin zum Sockel grell werden,
               aber nicht hoeher machen."
               Also wandert der Gipfel an den SOCKELRAND (13 %) und der Fuss
               wird dunkel gehalten (0,18 am Boden). Die Obergrenze bleibt
               unangetastet bei 19 % - die Glut wird nicht hoeher, nur anders
               verteilt. Darunter liegt zusaetzlich ein schwarzer Schleier
               (siehe unten), damit der Boden wirklich dunkel ANFAENGT und die
               Glut aus dem Schatten aufsteigt. */
            filter: glutFilter(ton, gefahr),
            WebkitMaskImage: sockelVerlauf(sockelKante, nurSockel),
            maskImage: sockelVerlauf(sockelKante, nurSockel),
            userSelect: "none", pointerEvents: "none" }} />
          {bandDa && (() => { const { leben, kraft } = rohrAnteile(piece);
            return <SockelBand paintedId={paintedIdOf(painting)} leben={werteAn ? leben : 0} kraft={werteAn ? kraft : 0}
              grau={!werteAn} hell={!!white} ausrichtung="unten" id={`sbb-${piece.charId || piece.bossId || "x"}`} />; })()}
          {/* v1.0.66: DER SCHATTEN, AUS DEM SIE AUFSTEIGT. Ein schmaler
              schwarzer Schleier ueber den untersten Prozenten - er nimmt dem
              Fuss die Helligkeit, ohne die Glut zu senken. Im weissen Ton
              faellt er schwaecher aus, sonst frisst er das Licht. */}
          {!nurSockel && !schneide && <span aria-hidden style={{
            position: "absolute", left: 0, right: 0, bottom: 0, height: "13%",
            pointerEvents: "none", borderRadius: "0 0 4px 4px",
            background: `linear-gradient(0deg, rgba(0,0,0,${ton === "weiss" ? 0.42 : 0.62}) 0%, rgba(0,0,0,${ton === "weiss" ? 0.18 : 0.28}) 45%, rgba(0,0,0,0) 100%)` }} />}
        </>);
        })()}
      </div>

      {stufenStern > 0 && <span key={stufenStern} aria-hidden style={{
        position: "absolute", inset: "-12%", display: "grid", placeItems: "center",
        pointerEvents: "none", zIndex: 5 }}>
        <span style={{ fontSize: "0.62em", color: T.gold,
          textShadow: "0 0 10px rgba(233,207,138,.95), 0 0 22px rgba(233,207,138,.6)",
          animation: "ggStufenStern 1.05s ease-out forwards" }}>✦</span>
      </span>}
      {/* the twin gauges: LIFE bubbles on the left flank, ENERGY bubbles on the
          right — same jewel language, only the cold blue tells them apart.
          Level, strike and every richer detail live in the tap-to-inspect sheet. */}
      {big && hpMode && piece.maxHp > 0 && <StatTriad piece={piece} focus={focus} shrink={0.98 / 1.48} />}


      {/* v1.0.77 (Besitzer: "unter dem Grand Gambit sind so blaue Punkte,
          ich weiss nicht, woher die kommen - bitte entfernen"). Es waren
          keine Stufenpunkte, sondern die SCHILD-Perlen des Schach-Modus:
          eine blaue Kugel je Schildpunkt, unten rechts an der Figur. Weil
          der Gambit seine Schilde beim Aufsteigen bekommt, erschienen sie
          scheinbar "von den Stufen".
          Sie sind fort. Der Schild geht dabei nicht verloren: er steht
          weiterhin im Figurenblatt, in der Nahansicht (Antippen) und wirkt
          unveraendert im Kampf - nur das Brett bleibt ruhig. Im HP-Modus
          zeigt ohnehin das Perlenpaar links/rechts Leben und Kraft, das
          davon unberuehrt bleibt. */}
    </div>
  );
}
