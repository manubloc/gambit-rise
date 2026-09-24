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

   DAS PASSWORT ist ein Riegel, keine Sicherheit: wer die Seite liest, findet
   den Weg daran vorbei. Es haelt Neugierige ab, mehr soll es nicht.        */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

const DIST = "dist";
const SPIEL = join(DIST, "spielen");
const PASSWORT = process.env.GAMBIT_ZUGANG || "rise2026";   // beim Bau setzbar: GAMBIT_ZUGANG=... npm run build
const HASH = createHash("sha256").update(PASSWORT).digest("hex");

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

/* 3. der Riegel vor der App */
const riegel = `<script>(function(){try{
  /* v1.45.1: AUS DER ANDROID-APP KOMMT MAN OHNE PASSWORT HEREIN. Die TWA
     oeffnet die Seite mit dem Verweis "android-app://<Paket>" - daran
     erkennen wir sie. Sonst haetten Store-Pruefer (und spaeter jeder
     Spieler) eine Passwortabfrage vor dem Spiel, und Google lehnt ab. Der
     Riegel bleibt fuer den offenen Browser. */
  if (document.referrer.indexOf("android-app://com.gambitrise.app") === 0) {
    localStorage.setItem("gambit:zugang", "${HASH}"); return;
  }
  if (localStorage.getItem("gambit:zugang") === "${HASH}") return;
  var p = prompt("Gambit Rise — Entwicklerzugang\\n\\nPasswort:");
  if (p === null) { location.replace("/"); return; }
  var enc = new TextEncoder().encode(p);
  crypto.subtle.digest("SHA-256", enc).then(function(b){
    var h = Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,"0");}).join("");
    if (h === "${HASH}") { localStorage.setItem("gambit:zugang", h); location.reload(); }
    else { alert("Falsches Passwort."); location.replace("/"); }
  });
  document.documentElement.style.visibility = "hidden";
}catch(e){}})();</script>`;
const app = join(SPIEL, "index.html");
const html = readFileSync(app, "utf8");
writeFileSync(app, html.replace("<head>", "<head>\n" + riegel));

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

console.log(`Seite gebaut: / = Landingpage, /spielen/ = App (Riegel aktiv, Passwort aus GAMBIT_ZUGANG)`);
