/* v1.61.0: DIE ALTE DOMAIN LEITET DAUERHAFT UM (Besitzer 24.9.: "diese alte
   Domain, das ist mir total egal ... richte das bitte gerne so ein").
   grandgambit.win und www.grandgambit.win antworten mit 301 auf denselben
   Pfad unter gambitrise.com - Suchmaschinen uebernehmen damit die neue
   Adresse. Alle anderen Hosts laufen unveraendert durch.
   ── v1.90.11 (Audit A26): WOFUER SIE LAEUFT, STEHT JETZT IN EINER
   ERLAUBNISLISTE. Bis v1.90.10 stand in _routes.json `include: ["/*"]` mit
   einer Ausnahmeliste fuer die Bilderordner. Durch die Funktion liefen damit
   auch sw.js, workbox-*.js, version.json, manifest.webmanifest - und jeder
   Abgleich des Dienstarbeiters, alle 60 Sekunden je offenem Tab, rund 1440
   am Tag. Zwei Folgen, beide gemessen im Audit vom 27.9.:

   (1) DER FESTGEFAHRENE DIENSTARBEITER. Die Spezifikation holt sw.js mit
       redirect mode "error". Ein 301 ist fuer sie kein Umweg, sondern ein
       GESCHEITERTER Abgleich: die alte Registrierung bleibt stehen. Wer vor
       v1.61.0 auf grandgambit.win installiert hat - darunter das Testhandy
       des Besitzers -, bekam so nie wieder eine neue Fassung. Jetzt ist
       /sw.js ausdruecklich ausgenommen und wird normal ausgeliefert.
   (2) DAS KONTINGENT. Pages-Funktionen zaehlen auf die 100.000 Aufrufe am
       Tag des freien Tarifs. Rund 70 dauerhaft offene Tabs fuellen es allein
       mit dem Abgleich - fuer eine Funktion, die auf gambitrise.com
       ueberhaupt nichts zu tun hat.

   Eine Erlaubnisliste statt einer Ausnahmeliste: was in _routes.json nicht
   ausdruecklich dasteht, laeuft an dieser Funktion vorbei. Aufgeraeumt ist
   sie damit noch nicht - sauber waere eine Redirect Rule in der Cloudflare-
   Zone und diese Datei geloescht; das braucht einen Griff im Dashboard. */
const ALT = new Set(["grandgambit.win", "www.grandgambit.win"]);

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (ALT.has(url.hostname)) {
    url.protocol = "https:";
    url.hostname = "gambitrise.com";
    url.port = "";
    return Response.redirect(url.toString(), 301);
  }
  return ctx.next();
}
