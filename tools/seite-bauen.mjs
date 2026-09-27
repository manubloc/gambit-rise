/* ── v1.42.0: DIE SEITE NACH DEM BAU UMSTELLEN ─────────────────────────────
   Besitzer (23.9.2026): "Ich möchte, dass es früher oder später nur nutzbar
   wird über den Playstore und man es erstmal nicht mehr als Browsergame hat.
   Also eine Verlinkung auf der Landingpage zum Playstore, und das Browsergame
   verstecken wir erstmal unter einer anderen Seite, evtl. auch mit einem
   Passwort, damit ich schön weiter mit dir entwickeln kann."

   Also:
     /            die Landingpage (Schaufenster, Verweis auf den Play Store)
     /spielen/    die App - komplett, mit allem, was sie braucht
     /landing     bleibt als alte Adresse bestehen

   WARUM UMZIEHEN STATT UMSCHREIBEN: der Build nutzt relative Pfade
   (base "./"), deshalb funktioniert die App in JEDEM Ordner, solange sie
   vollstaendig dort liegt. Der Dienstarbeiter (sw.js) zieht mit und bekommt
   damit den Wirkungsbereich /spielen/ - er kann der Landingpage nicht mehr
   dazwischenfunken. Fuer Besucher, die den ALTEN Dienstarbeiter mit Bereich
   "/" noch im Browser haben, legt dieser Schritt an der Wurzel ein sw.js ab,
   das sich selbst abmeldet und seine Zwischenspeicher raeumt.

   DAS PASSWORT war ein Riegel, keine Sicherheit: wer die Seite liest, findet
   den Weg daran vorbei. Seit v1.88.0 gibt es ihn nicht mehr (Schritt 3).   */
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const SPIEL = join(DIST, "spielen");
/* GAMBIT_ZUGANG (das Passwort des Riegels bis v1.87.0) wird nicht mehr
   gelesen - siehe Schritt 3. */

/* was die Landingpage an der Wurzel braucht */
const AN_DIE_WURZEL = ["landing", "og.png", "og.jpg", "favicon.ico", "favicon.svg", "icons", "fonts",
  "terms.html", "privacy.html", "site.webmanifest", "_routes.json", "impressum.html", "_headers", ".well-known", "robots.txt", "sitemap.xml"];

if (!existsSync(join(DIST, "index.html"))) {
  console.error("dist/index.html fehlt - erst 'vite build' laufen lassen"); process.exit(1);
}
if (existsSync(SPIEL)) rmSync(SPIEL, { recursive: true, force: true });
mkdirSync(SPIEL, { recursive: true });

/* 1. ALLES in den Unterordner - die App bleibt vollstaendig beieinander */
for (const name of readdirSync(DIST)) {
  if (name === "spielen") continue;
  renameSync(join(DIST, name), join(SPIEL, name));
}

/* 2. was das Schaufenster braucht, zurueck an die Wurzel */
for (const name of AN_DIE_WURZEL) {
  const q = join(SPIEL, name);
  if (existsSync(q)) cpSync(q, join(DIST, name), { recursive: true });
}
if (existsSync(join(SPIEL, "landing.html"))) {
  cpSync(join(SPIEL, "landing.html"), join(DIST, "index.html"));      // Landingpage ist die Startseite
  cpSync(join(SPIEL, "landing.html"), join(DIST, "landing.html"));    // alte Adresse bleibt
}

/* 3. KEIN RIEGEL MEHR VOR DER APP (v1.88.0, Besitzer 27.9.2026):
   "wenn ich den Entwicklerzugang nehme, dann fehlt ja das Anmeldefenster, mit
   dem ich mich anmelden kann ... jetzt ist das komplett gesperrt ... ich
   moechte bei Entwicklerzugang einfach Zugriff auf die App bekommen und mich
   dann einfach anmelden koennen, mit meinem Account, als Admin."

   Was der Riegel von v1.42.0 tat: ein prompt() mit Passwort vor der App. Was
   der Besitzer sah: keine Anmeldemaske - denn prompt() ist auf dem Handy in
   einer installierten Seite (standalone) und in manchen WebViews stumm und
   liefert sofort null; dann sprang der Riegel mit location.replace("/")
   zurueck auf die Landingpage. Wer die Seite so oeffnet, war ausgesperrt,
   ohne je ein Fenster gesehen zu haben. Ein Riegel, der den Besitzer
   aussperrt und Neugierige nur mit einem Klartext-Hash im Quelltext abhaelt,
   ist kein Riegel - er ist fort. Die Anmeldung der App ist die Tuer.

   Die TWA-Erkennung ueber document.referrer ("android-app://...") entfaellt
   damit ebenso; sie war nur der Ausweg fuer die Store-Pruefer an eben diesem
   Riegel vorbei (design/PWABUILDER.md, Abschnitte 7 und 9 - beide damit
   gegenstandslos). Ein frueher gesetztes localStorage "gambit:zugang" stoert
   nicht und wird nicht mehr gelesen. */

/* 4. der alte Dienstarbeiter an der Wurzel meldet sich ab */
writeFileSync(join(DIST, "sw.js"), `/* v1.42.0: die App wohnt jetzt unter /spielen/ - dieser Dienstarbeiter
   raeumt nur noch auf, damit die Startseite nicht aus einem alten
   Zwischenspeicher bedient wird. */
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll()) c.navigate(c.url);
  })());
});
`);

console.log(`Seite gebaut: / = Landingpage, /spielen/ = App (ohne Riegel seit v1.88.0 - die Anmeldung der App ist die Tuer)`);
