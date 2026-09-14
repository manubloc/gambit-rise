/* ══════════════════════════════════════════════════════════════════════════
   DAS LEBENSROEHRCHEN  (v1.3.0)

   Ein gekruemmtes Glasroehrchen unter jeder Figur, das ZWEI Werte in EINEM
   Bauteil zeigt - und damit die siebzig Zahlenperlen ersetzt, die der
   Besitzer auf seinem Brett gezaehlt hat ("Ein Screen wie hier ist schon
   ueberladen").

   WAS ES ZEIGT, und das ist der Kern der Idee des Besitzers:
     - ROT von links  = Leben
     - BLAU von rechts = Staerke
     - dazwischen dunkles Glas = was zur vollen Ausbaustufe noch fehlt
   Das VERHAELTNIS der beiden zeigt das PROFIL der Figur, die GESAMTFUELLUNG
   ihre Stufe. Ein Koenig traegt viel Rot und wenig Blau, ein Attentaeter
   umgekehrt; auf Stufe 1 ist fast alles dunkel, auf Stufe 20 treffen sich
   beide in der Mitte. So sieht man am Brett, wen man vor sich hat, ohne eine
   einzige Zahl zu lesen.

   WARUM SVG UND NICHT CSS: das Roehrchen ist GEKRUEMMT - es nimmt die
   Woelbung des Figurensockels auf. Ein div mit border-radius kann sich nicht
   biegen; dafuer braucht es Pfade. Alles andere (Verlaeufe, Glanz, Schatten)
   liegt in <defs> und kostet nichts.

   DIE MASSE stammen aus einer langen Bildstrecke mit dem Besitzer und stehen
   unten als Konstanten - jede einzeln begruendet.
   ══════════════════════════════════════════════════════════════════════════ */

import React from "react";

/* ── Masse, alle relativ zur Zellbreite ───────────────────────────────────
   BREITE: 112 % der GEMESSENEN Sockelbreite. Nicht der Zelle - die Sockel
   sind je Figur verschieden breit (Dame 93 %, Springer 83 %), und ein festes
   Mass passt deshalb immer nur einer. */
export const ROHR_BREITE_VOM_SOCKEL = 1.12;
/* GERECHNET STATT GESCHAETZT: die Bildstrecke mit dem Besitzer lief auf
   150-px-Zellen, dort waren 14 px genau richtig - das sind 9,2 %. Auf dem
   Telefon ist eine Zelle aber nur 38 bis 48 px breit, und 9,2 % davon sind
   3,5 bis 4,4 px. Auf so wenig Hoehe traegt die Glasoptik nicht: Reif, Glanz
   und Bodenreflex haetten je unter einem Pixel. Deshalb steht hier ein
   groesserer Anteil - die WIRKUNG der Vorlage zaehlt, nicht ihre Zahl. */
export const ROHR_HOEHE_VON_ZELLE = 0.17;
/* GEMESSEN AM GERENDERTEN SVG: 0,29 war zu viel - die Enden standen hoch und
   das Rohr sah aus wie eine Banane. In der Bildstrecke sank die Mitte um 4 px
   bei 14 px Hoehe, also knapp ein Drittel - aber dort ueber die volle BREITE
   verteilt, waehrend die Q-Kurve hier steiler ansetzt. 0,17 trifft die
   Wirkung der Vorlage. */
export const ROHR_KRUEMMUNG = 0.17;          // Anteil der Rohrhoehe, um die die Mitte sinkt
export const ROHR_HEBUNG = 1.00;             // Rohrhoehen ueber dem Figurenfuss
export const REIF_DICKE = 0.06;              // Anteil der Rohrhoehe
export const PERLE_VON_ROHR = 0.80;          // Durchmesser
export const PERLE_TIEFE = 0.28;             // Mitte bei 28 % der Rohrhoehe -> halb eingetaucht

/* Anthrazit (Besitzerwahl): der Reif tritt zurueck, damit Rot und Blau
   vorne stehen. Sieben Zonen, damit das Metall gewoelbt wirkt statt flach. */
const REIF = [
  [0.00, "#d8d6e8"], [0.12, "#a8a4c2"], [0.28, "#75708f"],
  [0.46, "#494463"], [0.62, "#28243c"], [0.78, "#635d84"], [1.00, "#15111f"],
];

let zaehler = 0;

/**
 * @param {number} lebenAnteil  0..1 - wie weit Rot von links reicht
 * @param {number} kraftAnteil  0..1 - wie weit Blau von rechts reicht
 * @param {boolean} talentBereit - zeigt die violette Perle
 * @param {number} breite  Breite des Rohrs in px
 * @param {number} hoehe   Hoehe des Rohrs in px
 */
export default function LebensRohr({
  lebenAnteil = 1, kraftAnteil = 0, talentBereit = false,
  breite = 44, hoehe = 8, className = "", style = null,
  /* ── GERADE IST DIE REGEL, GEKRUEMMT DIE AUSNAHME (v1.3.1) ─────────────
     Besitzerentscheid: "Bitte die Roehrchen immer das gerade nehmen im
     normalen Menue. Nur im Spiel selbst das gekruemmte."

     Das ist auch technisch die richtige Voreinstellung: die Kruemmung hat
     genau EINEN Grund - sie nimmt die Woelbung des Figurensockels auf. Den
     Sockel gibt es nur am Brett. Auf jeder Karte, in jedem Fenster, in jeder
     Liste waere sie bloss Zierde und macht das Rohr unruhig.

     Wer das gekruemmte Rohr will, sagt es ausdruecklich (kruemmung={ROHR_KRUEMMUNG}).
     So bekommt jede neue Verwendungsstelle die schlichte Fassung, ohne dass
     jemand daran denken muss. */
  kruemmung = 0,
}) {
  const id = React.useMemo(() => "lr" + (++zaehler), []);
  /* ── DAS ROHR WAECHST MIT DER ZELLE (v1.5.1, Besitzerbefund) ─────────────
     "Die HP-Roehrchen im Spiel sind ja viel zu klein. Die musst du auf die
     Groesse des Sockels anpassen, ich moechte den Sockel nicht mehr sehen,
     und die muss viel hoeher sein."

     GEMESSEN UND GERECHNET: die Aufrufstelle uebergab feste Pixel, gerechnet
     mit EM_PX = 40 - also 23 px Breite, immer, egal wie gross die Zelle ist.
     Auf einem Brett mit 128-px-Zellen sind das 18 % statt der vereinbarten
     58 %; das Rohr muesste 2,6-mal so breit sein.

     Der Fehler war die Einheit. Das SVG rechnet intern weiter in seinen
     eigenen Koordinaten (viewBox), aber die AUSSENGROESSE steht jetzt in em -
     und 1 em ist am Brett genau die Zellbreite. So passt es auf jedem Geraet
     und in jeder Brettgroesse, ohne dass jemand eine Zahl nachfuehrt. */
  const inEm = typeof breite === "string" && breite.endsWith("em");
  const B = inEm ? 100 : Math.max(12, Math.round(breite));
  const H = inEm ? Math.round(100 * (parseFloat(hoehe) / parseFloat(breite))) : Math.max(4, Math.round(hoehe));
  const r = H / 2;
  const senk = H * kruemmung;
  /* GELERNT BEIM VERGLEICH MIT DER BILDSTRECKE: dort waren es 11 % der
     Hoehe, aber bei achtfacher Ueberabtastung - die Kante verlief weich und
     wirkte halb so dick. Ein sauberer SVG-Pfad hat keine Weichzeichnung, also
     traegt derselbe Zahlenwert hier doppelt auf. 6 % trifft die WIRKUNG der
     Vorlage, nicht ihre Zahl. */
  const rand = Math.max(0.5, H * REIF_DICKE);
  const pd = H * PERLE_VON_ROHR;               // Perlendurchmesser
  const schein = pd * 2.1;    // v1.3.0: traegt weiter
  /* DIE ZEICHENFLAECHE IST IMMER GLEICH HOCH (Besitzerbefund: "bei Stufe 12
     hast du das Roehrchen zu hoch, gleicher Abstand bitte wie bei 13").

     Der Fehler war subtil und haette das ganze Brett getroffen: die Perle
     braucht Platz UEBER dem Rohr, also war das SVG bei einer Figur MIT Talent
     hoeher als bei einer ohne. Weil beide unten buendig sitzen, rutschte das
     Rohr ohne Perle nach oben - zwei Figuren nebeneinander trugen ihr Rohr auf
     verschiedener Hoehe. Jetzt wird der Platz IMMER reserviert, ob die Perle
     da ist oder nicht. */
  const padOben = Math.ceil(pd * 2.1 / 2 + 2);
  const VB_W = B + 2 * rand + 8;
  const VB_H = H + 2 * rand + senk + padOben + 6;
  const x0 = rand + 4, y0 = padOben + rand;

  /* DER GEKRUEMMTE ROHRPFAD. Ober- und Unterkante sind quadratische Kurven,
     die in der Mitte um `senk` absacken; die Enden sind Halbrundungen.

     GELERNT BEIM ERSTEN ANLAUF: den Innenpfad durch SKALIEREN des Aussenpfads
     zu erzeugen war falsch - eine Skalierung verschiebt auch die Rundungen,
     der Reif verschwand und das Glas sass daneben. Beide Pfade werden jetzt
     EINZELN gerechnet, mit eigenem Mass und eigenem Radius. */
  const bahn = (px, py, pb, ph) => {
    const rr = ph / 2, xa = px, xb = px + pb, ya = py, yb = py + ph;
    const my = senk * 2;
    return `M ${xa + rr} ${ya}
            Q ${xa + pb / 2} ${ya + my} ${xb - rr} ${ya}
            A ${rr} ${rr} 0 0 1 ${xb - rr} ${yb}
            Q ${xa + pb / 2} ${yb + my} ${xa + rr} ${yb}
            A ${rr} ${rr} 0 0 1 ${xa + rr} ${ya} Z`;
  };
  /* Der GLANZ folgt derselben Kurve wie das Rohr. Er sitzt weiter innen und
     ist flacher, sinkt in der Mitte aber um dasselbe Mass - sonst schwebt ein
     gerader Streifen ueber einer gebogenen Roehre. */
  const glanzBahn = (px, py, pb, ph) => {
    const rr = ph / 2, xa = px, xb = px + pb, ya = py, yb = py + ph;
    const my = senk * 2;
    return `M ${xa + rr} ${ya}
            Q ${xa + pb / 2} ${ya + my} ${xb - rr} ${ya}
            A ${rr} ${rr} 0 0 1 ${xb - rr} ${yb}
            Q ${xa + pb / 2} ${yb + my} ${xa + rr} ${yb}
            A ${rr} ${rr} 0 0 1 ${xa + rr} ${ya} Z`;
  };
  const rohrPfad = bahn(x0, y0, B, H);
  const innenPfad = bahn(x0 + rand, y0 + rand, B - 2 * rand, H - 2 * rand);
  const rotBreite = Math.max(H * 0.55, B * Math.max(0, Math.min(1, lebenAnteil)));
  const blauBreite = Math.max(H * 0.55, B * Math.max(0, Math.min(1, kraftAnteil)));
  const perleX = x0 + B / 2;
  const perleY = y0 + H * PERLE_TIEFE + senk * 0.55;

  return (
    <svg className={className}
      width={inEm ? breite : VB_W} height={inEm ? `calc(${breite} * ${VB_H / VB_W})` : VB_H}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      style={{ display: "block", pointerEvents: "none", overflow: "visible", ...(style || {}) }}
      aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${id}reif`} x1="0" y1="0" x2="0" y2="1">
          {REIF.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        {/* leeres Glas: hell oben, tief in der Mitte, Bodenreflex unten -
            man schaut hinein statt auf eine schwarze Flaeche */}
        <linearGradient id={`${id}glas`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4e5c" /><stop offset="0.18" stopColor="#282c3a" />
          <stop offset="0.42" stopColor="#161926" /><stop offset="0.72" stopColor="#1a1d2c" />
          <stop offset="1" stopColor="#303444" />
        </linearGradient>
        {/* FLUESSIGKEIT: helle Oberflaeche, satter Kern, dunkler Grund */}
        <linearGradient id={`${id}rot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffa6b0" /><stop offset="0.16" stopColor="#f4707f" />
          <stop offset="0.40" stopColor="#e83448" /><stop offset="0.72" stopColor="#a01526" />
          <stop offset="1" stopColor="#7a0c1c" />
        </linearGradient>
        <linearGradient id={`${id}blau`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a0ceff" /><stop offset="0.16" stopColor="#5aa0f0" />
          <stop offset="0.40" stopColor="#1e6ee8" /><stop offset="0.72" stopColor="#0d3f92" />
          <stop offset="1" stopColor="#082874" />
        </linearGradient>
        {/* v1.3.0: die Perle LEUCHTET staerker (Besitzerwunsch) - hellerer
            Kern, spaeterer Abfall ins Dunkle, und ein Schein, der weiter
            traegt. Das Violett bleibt gesaettigt, es wird nicht blasser. */}
        <radialGradient id={`${id}perle`} cx="0.36" cy="0.28" r="0.82">
          <stop offset="0" stopColor="#e2ccff" /><stop offset="0.22" stopColor="#b98cff" />
          <stop offset="0.52" stopColor="#8b45f5" /><stop offset="0.82" stopColor="#5b21b6" />
          <stop offset="1" stopColor="#3b0f7a" />
        </radialGradient>
        <radialGradient id={`${id}schein`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#c4b5fd" stopOpacity="0.92" />
          <stop offset="0.34" stopColor="#a78bfa" stopOpacity="0.52" />
          <stop offset="0.66" stopColor="#7c3aed" stopOpacity="0.22" />
          <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}schatten`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#04020a" stopOpacity="0.72" />
          <stop offset="0.6" stopColor="#04020a" stopOpacity="0.34" />
          <stop offset="1" stopColor="#04020a" stopOpacity="0" />
        </radialGradient>
        {/* die Fuellungen werden AM ROHR beschnitten: aussen folgen sie der
            Rundung, innen stehen sie senkrecht - so sieht Fluessigkeit aus */}
        <clipPath id={`${id}innen`}><path d={innenPfad} /></clipPath>
      </defs>

      {/* Schatten: verschluckt den Sockelrand, faengt die Unterschiede
          zwischen den Figuren ab */}
      <ellipse cx={x0 + B / 2} cy={y0 + H + senk * 0.7} rx={B * 0.56} ry={H * 0.85}
        fill={`url(#${id}schatten)`} />

      {/* der Reif ist der AEUSSERE Pfad - das Glas liegt als eigener,
          kleinerer Pfad darin, sodass ringsum der Metallrand stehen bleibt */}
      <path d={rohrPfad} fill={`url(#${id}reif)`} />
      <g clipPath={`url(#${id}innen)`}>
        <path d={innenPfad} fill={`url(#${id}glas)`} />
        {/* Fluessigkeiten - rechteckig, vom Rohr beschnitten */}
        <rect x={x0} y={y0 - 1} width={rotBreite} height={H + senk * 2 + 2} fill={`url(#${id}rot)`} />
        <rect x={x0 + B - blauBreite} y={y0 - 1} width={blauBreite} height={H + senk * 2 + 2}
          fill={`url(#${id}blau)`} />
        {/* DER GLANZ NIMMT DIE RUNDUNG AUF (Besitzerbefund). Vorher lag hier
            ein gerades Rechteck ueber einem gebogenen Rohr - das sah aus wie
            ein aufgeklebter Streifen. Jetzt ist es ein eigener Pfad mit
            DERSELBEN Q-Kurve wie Rohrober- und -unterkante, nur schmaler und
            weiter innen. Er sackt in der Mitte genauso ab wie das Glas
            darunter, also liegt er wirklich AUF der Woelbung. */}
        <path d={glanzBahn(x0 + r * 0.55, y0 + H * 0.13, B - r * 1.1, H * 0.19)}
          fill="#ffffff" opacity="0.60" />
        {/* Bodenreflex, ebenfalls gekruemmt */}
        <path d={glanzBahn(x0 + r, y0 + H * 0.73, B - 2 * r, H * 0.12)}
          fill="#fff3f8" opacity="0.32" />
      </g>

      {talentBereit && (
        <>
          <circle cx={perleX} cy={perleY} r={schein / 2} fill={`url(#${id}schein)`} />
          <circle cx={perleX} cy={perleY} r={pd / 2 + rand} fill={`url(#${id}reif)`} />
          <circle cx={perleX} cy={perleY} r={pd / 2} fill={`url(#${id}perle)`} />
          <ellipse cx={perleX - pd * 0.15} cy={perleY - pd * 0.19} rx={pd * 0.23} ry={pd * 0.15}
            fill="#ffffff" opacity="0.94" />
        </>
      )}
    </svg>
  );
}
