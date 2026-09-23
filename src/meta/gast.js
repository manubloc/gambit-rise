/* ── v1.46.0: DER GASTZUGANG (Besitzerentscheid 23.9.2026) ─────────────────
   „Machen wir es mit Gastzugang, aber der sollte einfach einen gefreezten
   Stand haben ohne Online und lokale Spiele. Einfach Kapitel 1 mit 3 extra
   Figuren und 4 spielbaren Leveln."

   Der Gast ist ein Schaufenster, kein halbes Spiel:
     * Kapitel I, VIER Stationen - danach ist Schluss.
     * DREI Sonderfiguren liegen bereit, damit man sieht, worum es geht,
       und die hintere Reihe steht offen, sonst koennte man sie gar nicht
       aufstellen.
     * Kein Online (das haengt ohnehin am Konto), kein Schnelles Spiel.
     * EINGEFROREN: jeder Gast-Einstieg raeumt den alten Gast-Stand ab
       (accounts.js, loginGuest) und beginnt wieder hier. Fortschritt bleibt
       nicht - wer sein Reich behalten will, legt ein Konto an.

   Das ist zugleich der Weg, auf dem Google die App pruefen kann: kein Konto,
   kein Passwort, sofort spielbar.                                          */
import { defaultProfile } from "./profile.js";

/** Die vier Stationen, die ein Gast spielen darf (Hauptstrang, Kapitel I). */
export const GAST_STATIONEN = ["L01s00", "L01s01", "L01s03", "L01s04"];

/** Die drei Figuren, die ein Gast mitbekommt - eine schnelle, eine harte,
 *  eine listige, damit die Bandbreite sichtbar wird. */
export const GAST_FIGUREN = ["hawk", "captain", "mage"];

/** Ist dieser Stand ein Gaststand? */
export const istGast = (profile) => !!profile?.gast;

/** Darf der Gast diese Station betreten? */
export const gastDarf = (id) => GAST_STATIONEN.includes(id);

/** Der eingefrorene Startstand des Gastes. */
export function gastProfil() {
  const p = defaultProfile();
  return {
    ...p,
    gast: true,
    name: "Gast",
    sp: 6,                                   // genug, um eine Faehigkeit zu lernen
    campaign: { ...(p.campaign || {}), league: 1, cleared: [], unlocked: [...GAST_FIGUREN] },
  };
}
