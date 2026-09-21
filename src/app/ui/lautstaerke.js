/* ── DIE LAUTSTAERKE BLEIBT (v1.26.2) ────────────────────────────────────────
   Besitzer: "Merk dir endlich mal pro Profil die Sound- und Musiklautstaerke."

   GEMESSEN, warum sie verloren ging: der Regler schrieb musikLaut und
   klangLaut korrekt ins Profil, Musik und Klang lasen sie auch korrekt. Aber
   ein Profil liegt an ZWEI Orten - einmal als `profile`, einmal im Spielstand
   unter `save:<Konto>:<Stand>`. Beim Laden und beim Wechseln schreibt der
   Spielstand sein eigenes Profil zurueck, und dort standen die Lautstaerken
   nie. Gesetzt 35 % Musik und 60 % Klang, neu geladen: beide weg.

   Die Lautstaerke gehoert aber nicht zum Spielstand - man will sie nicht je
   Stand anders, sondern einmal fuer sich. Also liegt sie jetzt in einem
   eigenen, kleinen Eintrag, den kein Spielstandwechsel ueberschreibt. Das
   Profilfeld bleibt als Rueckfall fuer alte Staende bestehen. */
const SCHLUESSEL = "gambit:laut:v1";

export function ladeLaut() {
  try {
    const roh = typeof localStorage !== "undefined" ? localStorage.getItem(SCHLUESSEL) : null;
    const w = roh ? JSON.parse(roh) : {};
    return {
      musik: typeof w.musik === "number" ? Math.max(0, Math.min(1, w.musik)) : null,
      klang: typeof w.klang === "number" ? Math.max(0, Math.min(1, w.klang)) : null,
    };
  } catch { return { musik: null, klang: null }; }
}

export function merkeLaut(art, wert) {
  try {
    const alt = ladeLaut();
    const neu = { musik: alt.musik, klang: alt.klang, [art]: Math.max(0, Math.min(1, Number(wert) || 0)) };
    localStorage.setItem(SCHLUESSEL, JSON.stringify(neu));
  } catch { /* kein Speicher - dann gilt eben das Profilfeld */ }
}

/* Was gerade gilt: der gemerkte Wert, sonst das Profil, sonst voll. */
export function lautVon(profile, art) {
  const g = ladeLaut()[art];
  if (typeof g === "number") return g;
  const feld = art === "musik" ? profile?.musikLaut : profile?.klangLaut;
  return typeof feld === "number" ? feld : 1;
}
