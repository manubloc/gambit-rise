/* v1.61.0: DIE ALTE DOMAIN LEITET DAUERHAFT UM (Besitzer 24.9.: "diese alte
   Domain, das ist mir total egal ... richte das bitte gerne so ein").
   grandgambit.win und www.grandgambit.win antworten mit 301 auf denselben
   Pfad unter gambitrise.com - Suchmaschinen uebernehmen damit die neue
   Adresse. Alle anderen Hosts laufen unveraendert durch.
   _routes.json haelt die Funktion von Bildern, Schriften und Skripten fern:
   sie springt nur bei Seitenaufrufen an, damit das freie Kontingent nicht
   von jedem Asset belastet wird. */
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
