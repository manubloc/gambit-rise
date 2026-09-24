/* ── v1.47.0: DIE SCHRANKE - GRATIS BIS KAPITEL III ───────────────────────
   Besitzerentscheid 22.9.2026: "Gratis bis Kapitel III." Und 23.9.: zwei
   Fassungen im Play Store - die kostenlose bis Kapitel III, daneben die
   Vollfassung.

   EINE Stelle entscheidet, wie weit ein Stand reicht:
     * Gratis: Kapitel I bis III vollstaendig. Kapitel IV bleibt SICHTBAR und
       verschlossen - man sieht, dass die Reise weitergeht.
     * Vollfassung: alles offen.
     * Der Gast hat seine eigene, engere Grenze (gast.js) und bleibt davon
       unberuehrt - er kommt ohnehin nur an vier Stationen.

   WIE ein Stand zur Vollfassung wird, entscheidet nicht dieses Modul: es
   liest allein `profile.voll`. Gesetzt wird das von aussen - heute von Hand
   fuer Proben, spaeter durch die Bezahl-App (eigene Paketkennung) oder einen
   Kauf in der App. So bleibt der Kern frei von Store-Wissen.              */

/** Bis zu diesem Kapitel spielt man ohne Bezahlung. */
export const GRATIS_BIS_LIGA = 3;

/** Traegt dieser Stand die Vollfassung? */
export const istVoll = (profile) => !!profile?.voll;

/** Liegt dieses Kapitel hinter der Schranke? */
export const hinterSchranke = (profile, league) =>
  !istVoll(profile) && (league || 1) > GRATIS_BIS_LIGA;

/** Das erste Kapitel, das die Vollfassung braucht. */
export const ERSTES_VOLL_KAPITEL = GRATIS_BIS_LIGA + 1;
