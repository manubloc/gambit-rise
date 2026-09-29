import { SPERR_ARTEN } from "../../../core/index.js";
// ── DIE SPERREN, IN BILDERN ─────────────────────────────────────────────────
// Die Mechanik gibt es seit v0.90 (core/rules/sperren.js), gezeichnet wurde
// sie nie: sperren.js hing allein an transitions.js, in der Oberflaeche kam
// sie nicht vor. Eine Regel, die niemand sieht, ist keine Regel - hier sind
// die Bilder dazu.
//
// stadium(sperre) liefert genau drei Worte, und genau drei Bilder gibt es je
// Art: "heil" | "angeschlagen" | "truemmer".
//
// ZWEI MASSE JE BILD. Die 192-px-Fassung geht aufs Brett (dasselbe Mass wie
// die Figuren seit v1.0.38 - eine Sperre steht auf einem 50-px-Feld, alles
// Groessere ist verschenkte Rechenzeit). Die 576er ist fuers Blatt und die
// Schaukammer, wo man sie gross ansieht.
//
// TRUEMMER SIND ANDERS. Die beiden aufrechten Zustaende stehen wie eine Figur
// auf der Grundkante. Die Truemmer LIEGEN, breit und flach, und sie sind kein
// Dauerzustand: sie zeigen sich kurz und verblassen dann unter der Figur, die
// darueber zieht. Wer sie festhaelt, verdeckt das Brett.
import mauerHeil from "../assets/sperren/mauer-heil.webp";
import mauerRiss from "../assets/sperren/mauer-riss.webp";
import mauerSchutt from "../assets/sperren/mauer-schutt.webp";
import mauerHeilG from "../assets/sperren/mauer-heil@gross.webp";
import mauerRissG from "../assets/sperren/mauer-riss@gross.webp";
import mauerSchuttG from "../assets/sperren/mauer-schutt@gross.webp";
/* v1.0.89: ZAUN UND BOLLWERK HABEN IHRE GEMAELDE (Besitzer, 11.9.2026 -
   geschnitzt, freigestellt, im Hausstil). Der Zaun braucht nur zwei
   Zustaende, weil er einen Schlag haelt: heil und Truemmer. Das Bollwerk
   traegt VIER - der Besitzer hat eine Stufe mehr geliefert, als das Spiel
   kannte; stadium() nutzt sie jetzt bei hp 1. */
import zaunHeil from "../assets/sperren/zaun-heil.webp";
import zaunSchutt from "../assets/sperren/zaun-schutt.webp";
import zaunHeilG from "../assets/sperren/zaun-heil@gross.webp";
import zaunSchuttG from "../assets/sperren/zaun-schutt@gross.webp";
import bergHeil from "../assets/sperren/bergfried-heil.webp";
import bergRiss from "../assets/sperren/bergfried-riss.webp";
import bergRiss2 from "../assets/sperren/bergfried-riss2.webp";
import bergSchutt from "../assets/sperren/bergfried-schutt.webp";
import bergHeilG from "../assets/sperren/bergfried-heil@gross.webp";
import bergRissG from "../assets/sperren/bergfried-riss@gross.webp";
import bergRiss2G from "../assets/sperren/bergfried-riss2@gross.webp";
import bergSchuttG from "../assets/sperren/bergfried-schutt@gross.webp";

/* Je Art die drei Zustaende. Fehlt eine Art noch (Zaun, Bollwerk), steht sie
   hier ausdruecklich als null - dann weiss der Aufrufer, dass das Bild fehlt,
   statt still nichts zu zeichnen. */
export const SPERR_BILDER = {
  mauer:     { heil: mauerHeil, angeschlagen: mauerRiss, truemmer: mauerSchutt },
  /* der Zaun haelt EINEN Schlag - "angeschlagen" kommt bei ihm nie vor,
     deshalb traegt er es nicht (und fehlt damit auch nicht). */
  zaun:      { heil: zaunHeil, truemmer: zaunSchutt },
  bergfried: { heil: bergHeil, angeschlagen: bergRiss, schwer: bergRiss2, truemmer: bergSchutt },
};

export const SPERR_BILDER_GROSS = {
  mauer:     { heil: mauerHeilG, angeschlagen: mauerRissG, truemmer: mauerSchuttG },
  zaun:      { heil: zaunHeilG, truemmer: zaunSchuttG },
  bergfried: { heil: bergHeilG, angeschlagen: bergRissG, schwer: bergRiss2G, truemmer: bergSchuttG },
};

/** Das Bild fuer eine Sperre in ihrem Zustand - oder null, wenn die Art noch
 *  keine Bilder hat. */
export function sperrBild(art, zustand, gross = false) {
  const satz = (gross ? SPERR_BILDER_GROSS : SPERR_BILDER)[art];
  return (satz && satz[zustand]) || null;
}

/* Die drei Zustaende, in der Reihenfolge, in der eine Sperre sie durchlaeuft. */
/* v1.0.89: JE ART IHRE EIGENEN ZUSTAENDE - aus den Trefferpunkten abgeleitet,
   nicht abgeschrieben. Ein Zaun (1 Schlag) hat kein Schadensbild, ein
   Bollwerk (3) hat zwei. Eine feste Dreierliste meldete den fertigen Zaun
   sonst als unvollstaendig - genau die Art Fehler, die die Kammer schon
   einmal in die Irre fuehrte. */
export const SPERR_ZUSTAENDE = ["heil", "angeschlagen", "schwer", "truemmer"];
export function zustaendeVon(art) {
  const hp = SPERR_ARTEN[art]?.hp || 1;
  if (hp <= 1) return ["heil", "truemmer"];
  if (hp === 2) return ["heil", "angeschlagen", "truemmer"];
  return ["heil", "angeschlagen", "schwer", "truemmer"];
}

/** WAS NOCH FEHLT, RECHNET SICH SELBST AUS.
 *
 *  Seit v1.0.63 kann man Zaun und Bollwerk kaufen, ohne dass ein Gemaelde
 *  dazu existiert - auf dem Brett springt die Ersatzzeichnung ein. Damit die
 *  Luecke nicht nur im Spiel steht, sondern auch dort sichtbar wird, wo der
 *  Besitzer seine Bilder verwaltet, holt die Schaukammer diese Liste.
 *
 *  Sie wird NICHT von Hand gepflegt: sie faellt aus den Nullen oben heraus.
 *  Eine zweite, abgeschriebene Liste waere am Tag des ersten neuen Bildes
 *  falsch und niemandem faellt es auf - genau der Fehler, der die Kammer
 *  schon einmal 382 Bilder in den Sammelreiter schieben liess.
 */
export function fehlendeSperrBilder() {
  const fehlt = [];
  for (const art of Object.keys(SPERR_BILDER))
    for (const zustand of zustaendeVon(art))
      if (!SPERR_BILDER[art] || !SPERR_BILDER[art][zustand]) fehlt.push({ art, zustand });
  return fehlt;
}


/* WIE GROSS DARF WAS WERDEN. `hoehe` und `breite` spannen den Kasten auf, in
   dem das Bild Platz findet; MITTIG sitzt es seit v1.90.7 immer (SperrGlyph
   zentriert den Kasten und das Bild darin).

   Das Feld `unten` ist am 29.9.2026 GEFALLEN. Es hat zuletzt nichts mehr
   getan, was man wollte: aus "zwei Prozent ueber dem Boden" war beim Umbau
   auf die Mitte "zwei Prozent ueber die Mitte" geworden - also eine
   Verschiebung nach OBEN, obwohl der Name das Gegenteil sagt. Gemessen
   verschob es die Mauer um knapp einen Pixel, waehrend der eigentliche
   Versatz von 23 % woanders sass (flex-end im Glyph). Ein Regler, der das
   Falsche tut und dabei fast nichts bewirkt, kostet nur Verwirrung.
   Wer die Truemmer wieder tiefer legen will, nimmt dafuer besser `hoehe`
   und eine ehrlich benannte Verschiebung. */
export const SPERR_SITZ = {
  heil:         { hoehe: 0.96, breite: 1.02 },
  angeschlagen: { hoehe: 0.94, breite: 1.04 },
  truemmer:     { hoehe: 0.42, breite: 1.14 },
};

/* ── DIE FUSSLINIE (Besitzer, 29.9.2026) ─────────────────────────
   "Das Bollwerk kann auch noch etwas nach oben, mindestens so hoch wie auch
   z. B. die Figuren an ihrem untersten Punkt."

   GEMESSEN (tools/pruefe-sperrsitz.mjs, 96-px-Feld, Silhouette gegen Weiss,
   ohne Schlagschatten): die Figuren enden mit dem Fuss bei 91,7 % (Bauer)
   bis 93,8 % (Koenig, Turm) der Feldhoehe. Mauer (76 %) und Zaun (79 %)
   liegen darueber, der Bergfried aber bei 96,9 % - er ragte also gut drei
   Prozent TIEFER als jede Figur und wirkte daneben wie abgesackt.

   Warum nur er: er ist die einzige hohe Sperre (210x181, fast quadratisch).
   Mittig im Feld fuellt er es fast ganz, und "fast ganz" endet tiefer als
   eine Figur, die oben Luft laesst. Mauer und Zaun sind flach, die kommen
   dem Rand gar nicht nahe.

   Der Wert hebt das Bild in Prozent der FELDHOEHE aus der Mitte nach oben.
   Er ist gemessen, nicht geschaetzt: 5,6 % bringt den TIEFSTEN der vier
   Bergfried-Zustaende ("angeschlagen", 210x186 - das hoechste der Bilder)
   genau auf die Fusslinie; die anderen drei stehen dann leicht darueber.
   Auf einen Wert je Zustand wurde verzichtet - vier Regler, die man einzeln
   nachziehen muss, gehen beim naechsten neuen Bild auseinander. Ein Wert je
   ART, ausgelegt auf den ungeguenstigsten Zustand, haelt die Zusage
   "mindestens so hoch wie die Figuren" fuer alle vier.

   NACHGEMESSEN WIRD IMMER: tools/pruefe-sperrsitz.mjs fotografiert jede
   Sperre und jede Figur einzeln und rechnet die Fusslinie aus dem, was
   wirklich auf dem Schirm steht. Kommt neue Kunst dazu, faellt es dort auf
   und nicht erst dem Besitzer. */
export const SPERR_HEBUNG = {
  bergfried: 0.056,
};
