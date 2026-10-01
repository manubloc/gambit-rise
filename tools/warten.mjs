/* ── WARTEN AUF ZUSTAENDE, NICHT AUF UHRZEITEN (v1.90.19, Audit A72) ─────
   Die Browser-Proben schliefen fest: drive3 an 13 Stellen, die
   Navigationsprobe an 39 (Audit: 17,9 s und 33,6 s je Lauf). Eine feste
   Schlafzeit ist doppelt schlecht: ist die App schneller, wartet die Probe
   umsonst; ist sie langsamer (kalter Rechner, CI), klickt die Probe ins
   Leere und meldet einen Fehler, den es nicht gibt. Und eine langsamer
   gewordene App faellt nie auf, solange sie unter der Schlafzeit bleibt.

   Zwei Werkzeuge, beide werfen NIE - ein Ablauf ist hier kein Fehler, die
   Messungen danach melden, was fehlt (genau wie vorher nach dem Schlaf):

   bis(fn, arg, max)   wartet, bis `fn` im Browser wahr ist (alle 100 ms
                       geprueft), hoechstens `max` ms. Liefert true/false.
                       Fuer Uebergaenge mit klarem Ziel: "das Brett steht",
                       "der Schliessknopf ist da".

   ruhe(max, still)    wartet, bis das DOM `still` ms lang unveraendert
                       bleibt (MutationObserver), hoechstens `max` ms. Fuer
                       Uebergaenge ohne eindeutiges Zielmerkmal. Mit `max` =
                       der alten Schlafzeit ist die Probe nie langsamer als
                       vorher, nur schneller, wo die App fertig ist.

   Eine Falle, gemessen beim Umbau: ruhe() allein reicht NICHT vor einem
   Klick auf etwas, das erst noch erscheint. Ein Schirm, der auf Bilder
   wartet (artReady, bis 3 s), steht in der Zwischenzeit still - ruhe() kehrt
   dann zurueck, bevor der Knopf da ist. Vor jedem Klick auf ein NEUES
   Element darum bis(), nicht ruhe(). */

export function wartenAuf(page) {
  const bis = (fn, arg = null, max = 8000) =>
    page.waitForFunction(fn, arg, { timeout: max, polling: 100 }).then(() => true, () => false);

  const ruhe = (max = 3000, still = 300) => page.evaluate(([max, still]) => new Promise((fertig) => {
    let t = null;
    const ende = () => { clearTimeout(t); clearTimeout(deckel); mo.disconnect(); };
    const deckel = setTimeout(() => { ende(); fertig(false); }, max);
    const mo = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => { ende(); fertig(true); }, still);
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    t = setTimeout(() => { ende(); fertig(true); }, still);
  }), [max, still]).catch(() => false);

  /* Haeufige Ziele, einmal formuliert. Laufen im Browser. */
  const knopfDa = (muster, max = 5000) => bis((m) => {
    const re = new RegExp(m, "i");
    return [...document.querySelectorAll("button")]
      .some((b) => b.getBoundingClientRect().width > 0 && re.test(b.textContent || ""));
  }, muster, max);

  const knopfWeg = (muster, max = 5000) => bis((m) => {
    const re = new RegExp(m, "i");
    return ![...document.querySelectorAll("button")]
      .some((b) => b.getBoundingClientRect().width > 0 && re.test(b.textContent || ""));
  }, muster, max);

  /* Das Brett steht: mindestens 16 gleich grosse quadratische Felder, und
     jedes Figurenbild darauf ist geladen (sonst misst man leere Felder). */
  const brettDa = (max = 8000) => bis(() => {
    const alle = [...document.querySelectorAll("div")].filter((d) => {
      const r = d.getBoundingClientRect();
      return r.width > 28 && r.width < 90 && Math.abs(r.width - r.height) < 4;
    });
    if (alle.length < 16) return false;
    const k = Math.min(...alle.map((d) => d.getBoundingClientRect().width));
    const f = alle.filter((d) => Math.abs(d.getBoundingClientRect().width - k) < 2);
    if (f.length < 16) return false;
    const bilder = f.flatMap((d) => [...d.querySelectorAll("img")]);
    return f.some((d) => d.querySelector("img,svg")) && bilder.every((i) => i.complete);
  }, null, max);

  /* Die App hat gebootet: der Ladeschirm #gg-boot ist ersetzt und es gibt
     etwas zu druecken. */
  const appDa = (max = 12000) => bis(() => !document.getElementById("gg-boot")
    && document.querySelectorAll("button").length > 0, null, max);

  return { bis, ruhe, knopfDa, knopfWeg, brettDa, appDa };
}
