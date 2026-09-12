// App-wide configuration.
// SERVER_URL is the multiplayer endpoint the app connects to automatically —
// set this to your hosted server (see README-ONLINE.md) before shipping.
// Until it is set, the Online screen shows a friendly setup note instead of
// asking players to type addresses.
export const SERVER_URL = "wss://duell.grandgambit.win/ws"; // neutral custom domain (Cloudflare Worker gg-hall)
// The same Hall serves the error-report endpoints over HTTPS (POST /report,
// GET /reports). Derived from SERVER_URL so there's a single source of truth.
export const HALL_HTTP = SERVER_URL.replace(/^wss:/, "https:").replace(/^ws:/, "http:").replace(/\/ws$/, "");
export const APP_VERSION = "2.0";

// Cloud accounts (Supabase) whose e-mail addresses get admin powers.
export const ADMIN_EMAILS = [];             // e.g. ["you@example.com"]

// ── The house design ────────────────────────────────────────────────────────
// "classic" is the deep-navy night with the original paintings; "carved" is
// the painted-stone livery of the new piece set. This ships to EVERY player —
// changing it here and deploying restyles the whole app for everyone — and once
// the Hall worker is deployed, the admin can flip it LIVE for all players from
// the profile workbench (the app asks the Hall on boot and caches the answer).
export const APP_DESIGN = "carved";

/* ── FREIE FASSUNG ODER VOLLE (v1.1.10, Besitzerauftrag) ───────────────────
   "Wir haben spaeter eine Free-Version, die geht nur bis Kapitel drei, und
   die Pro-Version geht bis Kapitel zwoelf. Ich wuerde dich bitten, das auch
   schon gedanklich im Hintergrund zu behalten - so dass wir auf jeden Fall
   spaeter zwei Varianten des Spiels ausliefern koennen. Das ist schon auch
   wichtig, dass das von der Architektur weiterhin geht."

   HIER IST DER SCHALTER, und er ist absichtlich EINE Zahl. Das Haus fragt
   nirgends "bin ich die freie Fassung?", sondern nur "wie weit reicht die
   Reise?" - so bleibt die Trennung ein Wert und wird keine Verzweigung, die
   sich durch den Baum zieht. Die Kampagne liefert zwoelf Kapitel; was
   darueber hinausgeht, wird von letztesKapitel() gedeckelt.

   Zum Ausliefern der freien Fassung genuegt es, diese Zahl auf 3 zu setzen
   (oder beim Bauen VITE_MAX_KAPITEL=3 zu uebergeben) - kein zweiter Zweig,
   kein zweiter Baum, keine Abweichung, die man pflegen muesste. */
export const MAX_KAPITEL = Number(
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_MAX_KAPITEL) || 12
) || 12;
export const istFreieFassung = () => MAX_KAPITEL < 12;
