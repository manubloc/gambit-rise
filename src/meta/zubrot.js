/* ── v1.91.0: DAS ZUBROT - WAS FIGUREN UND BUENDE NEBEN DEM KAMPF VERDIENEN ───
   Besitzer 6.10.: "Fokus eher auf nicht so stark kampflastigen Figuren" - der
   Bettler, der "bei jedem Zug ein bisschen Gold verdient, das man behaelt, auch
   wenn man verliert". Daraus sind vier Faehigkeiten und zwei Buende geworden,
   die am Brett NICHTS aendern und allein hier ausgezahlt werden. Eine Stelle,
   rein gerechnet, damit Banner, Probe und Balance dieselbe Zahl sehen.

     almosen  (Bettler)            1 Gold je eigenem Zug, Deckel 8/12/16 mal
                                   Kapitelstaffel. Bleibt bei Niederlage und Remis.
                                   GEMESSEN: mit dem ersten Deckel (20 fest) haette
                                   der Bettler in Kapitel I das Gold fast verdoppelt
                                   (Stationen dort zahlen im Schnitt 21) und waere
                                   in Kapitel X belanglos gewesen (im Schnitt 160).
                                   Mit der Staffel sind es durchweg 20-40 %.
     zins     (Bankier)            +10/20/30 % auf das Siegergold.
     zehnt    (Steuereintreiber)   +4/8/12 Gold je Sieg, mal Kapitelstaffel.
     studium  (Gelehrter)          +15/30/45 % Erfahrung der Partie.
     Bund dorf                     2 Gold je eigenem Bauern, der noch steht.
     Bund kontor                   +25 % auf das Siegergold.

   WER AUFGIBT, BEKOMMT NICHTS - dieselbe Regel wie fuer alles andere
   (rewards.js). Sonst waere "zwanzig Zuege ziehen, aufgeben" der schnellste
   Weg zu Gold.
   NUR, WAS GELERNT IST: gezaehlt wird die Faehigkeit an der Figur im Heer
   (spec.abilities), ihre Stufe aus spec.stufen. Eine Figur auf der Bank
   verdient nichts - das ist der Aufstellungszwang, den der Besitzer will. */
export const ALMOSEN_DECKEL = [8, 12, 16];
export const ZINS_ANTEIL = [0.10, 0.20, 0.30];
export const ZEHNT_GOLD = [4, 8, 12];
export const STUDIUM_ANTEIL = [0.15, 0.30, 0.45];
export const DORF_GOLD_JE_BAUER = 2;
export const KONTOR_ANTEIL = 0.25;
/** Die Kapitelstaffel von Zehnt und Almosen: I-III einfach, IV-VI doppelt, VII-IX dreifach, X-XII vierfach. */
export const zehntStaffel = (liga) => 1 + Math.floor(((Math.max(1, liga || 1) - 1) % 12) / 3);

const stufeIm = (heer, ab) => {
  let st = 0;
  for (const sp of [...(heer?.back || []), heer?.pawn, heer?.hero]) {
    if (!sp || !(sp.abilities || []).includes(ab)) continue;
    st = Math.max(st, Math.max(1, Math.min(3, (sp.stufen && sp.stufen[ab]) || 1)));
  }
  return st;   // 0 = niemand im Heer kann es
};

/**
 * @param {object} a  heer (das gespielte Spielerheer), buende (Liste der eigenen
 *   wachen Buende), eigeneZuege, bauernUebrig, result ("win"|"draw"|"loss"),
 *   resigned, gold (Siegergold der Station, vor jedem Aufschlag), liga
 * @returns {{almosen:number,zins:number,zehnt:number,dorf:number,kontor:number,gold:number,xpAnteil:number}}
 */
export function zubrot(a = {}) {
  const leer = { almosen: 0, zins: 0, zehnt: 0, dorf: 0, kontor: 0, gold: 0, xpAnteil: 0 };
  if (a.resigned) return leer;
  const sieg = a.result === "win";
  const buende = new Set(a.buende || []);
  const basis = sieg ? Math.max(0, a.gold || 0) : 0;
  const sA = stufeIm(a.heer, "almosen"), sZ = stufeIm(a.heer, "zins"), sT = stufeIm(a.heer, "zehnt"), sS = stufeIm(a.heer, "studium");
  const aus = { ...leer };
  if (sA) aus.almosen = Math.min(ALMOSEN_DECKEL[sA - 1] * zehntStaffel(a.liga), Math.max(0, a.eigeneZuege || 0));
  if (sZ && basis) aus.zins = Math.round(basis * ZINS_ANTEIL[sZ - 1]);
  if (sT && sieg) aus.zehnt = ZEHNT_GOLD[sT - 1] * zehntStaffel(a.liga);
  if (buende.has("dorf")) aus.dorf = DORF_GOLD_JE_BAUER * Math.max(0, a.bauernUebrig || 0);
  if (buende.has("kontor") && basis) aus.kontor = Math.round(basis * KONTOR_ANTEIL);
  if (sS) aus.xpAnteil = STUDIUM_ANTEIL[sS - 1];
  aus.gold = aus.almosen + aus.zins + aus.zehnt + aus.dorf + aus.kontor;
  return aus;
}
