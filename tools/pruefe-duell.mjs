/* ── DAS ONLINE-DUELL, VON BEIDEN SEITEN GEFAHREN (Audit A73) ─────────────
   Audit A73: "Kein Test faehrt den Online-Client der App durch ein Duell."
   test_worker.mjs prueft die Halle mit handgeschriebenen Nachrichten,
   drive3 und pruefe-navigation oeffnen den Online-Schirm nur - die Halle
   ist aus der Sandkiste nicht erreichbar, also kam dort nie ein welcome an.
   Zwischen beiden lag das Protokoll selbst, und das prueft niemand: ein
   umbenanntes Feld (youAre, matchId, oppArmy, hash ...) oder ein neuer
   Nachrichtentyp auf nur EINER Seite bleibt in jeder Suite gruen und bricht
   live das Duell. Der Worker "gg-hall" deployt mit jedem Push auf main,
   genau wie die Seite - eine Abweichung ist also sofort bei allen Spielern.

   WAS SIE FAEHRT: zwei getrennte Browser-Kontexte (zwei Spieler, zwei
   Speicher) auf dem GEBAUTEN dist/. Beide legen ein lokales Konto an,
   waehlen ihren Hallennamen, verbinden, gehen im Modus "Klassisch" in die
   Zufalls-Warteschlange und bekommen ein Brett. Weiss zieht e2-e4 per
   Klick auf die Brettfelder, Schwarz sieht den Bauern auf e4 und antwortet
   e7-e5, Weiss sieht ihn. Dann gibt Schwarz auf (mit der Rueckfrage), Weiss
   sieht "Gewonnen!", beide sehen ihre Wertung. Zum Schluss verlangen beide
   Revanche, und die Halle muss eine neue Partie mit getauschten Farben
   aufstellen, die beide Bretter frisch zeigen.

   DIE HALLE IST ECHT, DAS NETZ NICHT: `HallCore` aus worker/src/logic.mjs
   mit `memoryStore()` (wie test_worker.mjs) laeuft in DIESEM Prozess.
   Playwrights `routeWebSocket` faengt wss://duell.gambitrise.com/ws ab und
   verdrahtet es wie die Durable-Object-Huelle in worker/src/index.mjs:
     - der Sitz (clientId) wird VOR dem hello gesetzt, damit das welcome
       schon zugestellt werden kann; ein abgewiesenes hello gibt ihn zurueck,
     - `handle` bekommt die ALTE Kennung (null vor dem hello),
     - wirft `handle`, geht {t:"error", error} an genau diese Verbindung,
     - `send(id)` trifft die ERSTE offene Verbindung mit dieser Kennung,
     - beim Schliessen ruft sie `close(id)` nur, wenn keine andere offene
       Verbindung dieselbe Kennung traegt.
   Nicht nachgebaut: Winterschlaf, Alarme (Gnadenfrist-Besen), Web Push.
   Die HTTP-Wege der Halle (/health, /name-frei, /design, /report) werden
   ebenfalls hier beantwortet, wie index.mjs es tut - ein /report ist ein
   Absturzbericht der App und zaehlt als Befund.

   AUFRUF: node tools/pruefe-duell.mjs
     WURZEL=/tmp/rr/dist node tools/pruefe-duell.mjs   (anderer Bau)
     ZEIGEN=1  ... schreibt jede Hallen-Nachricht mit
   Braucht dist/ mit der APP an der Wurzel (npx vite build oder
   npm run build:app) - nach `npm run build` liegt dort die Landingpage.
   Und lokale Konten: traegt der Bau VITE_SUPABASE_*, geht "Konto erstellen"
   zur Wolke, und die Probe bleibt schon beim Einstieg stehen.

   GEGEN v1.90.17 GEFAHREN (1.10.2026, ~11 s): der Duellweg selbst ist
   gruen - Zug hin, Zug zurueck, Aufgabe, Wertung, Revanche. Rot sind zwei
   ECHTE Fehler, die erst mit einer antwortenden Halle sichtbar werden:
     1. Die Kachel "Online-Duell" im Hub reicht ihr Klick-Ereignis an
        onOnline(gid) weiter (App.jsx, Card: onClick={onGo}). Das Ereignis
        landet in oeffneDaily.current, und beim welcome schickt die Lobby
        {t:"daily:open", gameId:<Ereignis>} - JSON.stringify scheitert am
        Kreis ueber `view` (Window): pageerror "Converting circular
        structure to JSON". Weil net.web.js die Zuhoerer in einer Schleife
        ohne try ruft, sterben damit auch alle SPAETEREN welcome-Zuhoerer:
        Rangliste und Tresorliste werden nie angefragt, und ein
        Push-Schluessel aus dem welcome wuerde nie uebernommen (er steht im
        selben Zuhoerer hinter der Absturzstelle).
     2. "Verbinden" (OnlineScreen: onClick={connect}) reicht sein Ereignis
        als `force` durch - das Zustimmungsfenster "Online-Modus verbinden?"
        wird uebersprungen, obwohl notices.online fehlt. privacy.html §5
        verspricht die Uebertragung "erst ... nach gesondertem Hinweis".
   BEIDE BEHOBEN IN v1.90.18 (App.jsx Card: onClick={() => onGo?.()},
   OnlineScreen: onClick={() => connect()} und `force === true`, dazu faengt
   net.web.js einen werfenden Zuhoerer ab): 34/34 gruen, ~8 s. Gegen den
   Bau v1.90.17 bleibt die Probe rot mit genau diesen fuenf Zeilen.
   GEGENPROBE: drei Mutanten der Halle (youAre -> seite im Match-Paket,
   hash -> pruef im cmd, "oppResign" umbenannt) - jeder faellt mit einer
   eigenen Zeile, die das Feld nennt. Das ist der Fall, fuer den es die
   Probe gibt.

   MESSFALLEN, UNTERWEGS GEFUNDEN:
   - Das EINRICHTUNGSBLATT (Name, Brettfiguren, Staerke; fixed, zIndex 60)
     blieb in der ersten Fassung offen, und nichts fiel auf: innerText liest
     den Hub HINTER dem Blatt, also galt "Online-Duell" als sichtbar, und
     die DOM-Klicks (b.click()) trafen die Kachel und die Lobby-Knoepfe
     darunter. Erst der echte Zeigerklick aufs Brett scheiterte - "<button>
     Detailreich</button> ... intercepts pointer events". Darum: Auftakt
     schliessen, bis zweimal hintereinander keiner mehr steht, und die
     Kachel mit echtem Zeigerklick oeffnen.
   - Der Mitschnitt spreizte die Nachricht erst in seinen Eintrag
     ({richtung, seite, ...msg}). Der Mutant "youAre -> seite" ueberschrieb
     damit die Seitenkennung, und die Probe meldete "kein match-Paket",
     obwohl beide eines bekommen hatten. Jetzt bleibt die Nachricht
     ungespreizt (msg).
   - Ob die Zustimmung gefragt wurde, sieht man NICHT an der Oberflaeche -
     sie zeigt danach brav "Verbunden". Gemessen wird an der Halle: kam
     ein hello, bevor "Zustimmen & verbinden" gedrueckt war? Ebenso die
     Folgen von Befund 1: eine leere Rangliste sieht aus wie "noch niemand
     da" - die Halle sieht, dass nie gefragt wurde.
   - Der Stack von Befund 1 endet in WebSocket._apiSendToPage /
     __pwWebSocketDispatch. Das ist Playwrights Zusteller, nicht die
     Ursache - die steht darueber (Object.send in net.web.js, aufgerufen
     aus dem welcome-Zuhoerer des OnlineScreen).
   - routeWebSocket muss VOR dem ersten goto stehen. Ohne connectToServer
     oeffnet Playwright die Verbindung selbst: onopen feuert, und die App
     schickt ihr hello sofort.
   - Wer Weiss ist, wirft die Halle per Math.random (startMatch) - in den
     Laeufen war es mal A, mal B. Die Probe liest `youAre` aus dem
     Match-Paket an der Halle und nimmt nie an, dass Seite A Weiss sei.
   - Feldkennung: [data-zelle] = Reihe*8 + Linie, a1 = 0 - also e2 = 12,
     e4 = 28, e7 = 52, e5 = 36. Schwarz sieht das Brett gedreht (links oben
     steht Zelle 7 = h1, bei Weiss 56 = a8).
   - "Aufgeben" steht zweimal im Schirm: der Kopfknopf oeffnet die
     Rueckfrage ("Aufgeben?" mit "Weiterspielen" / "⚑ Aufgeben"),
     bestaetigt wird nur mit dem ⚑.                                        */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { HallCore, memoryStore } from "../worker/src/logic.mjs";

const T0 = Date.now();
const WURZEL = process.env.WURZEL || "dist";
const ZEIGEN = !!process.env.ZEIGEN;
if (!existsSync(join(WURZEL, "index.html"))) {
  console.error(`${WURZEL}/index.html fehlt - erst 'npx vite build' laufen lassen`);
  process.exit(1);
}

let pass = 0, fail = 0;
const ok = (name, cond, beleg = "") => {
  if (cond) { pass++; console.log("  ok  -", name); }
  else { fail++; console.log(" FAIL -", name + (beleg ? `  [${beleg}]` : "")); }
  return !!cond;
};

// ── statischer Server fuer den Bau (wie pruefe-navigation) ─────────────────
const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webm": "video/webm",
  ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".woff": "font/woff",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon", ".txt": "text/plain",
};
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  try {
    const f = join(WURZEL, p === "/" ? "index.html" : p.slice(1));
    const b = await readFile(f);
    res.writeHead(200, { "content-type": MIME[extname(f)] || "application/octet-stream" });
    res.end(b);
  } catch {
    try {
      const b = await readFile(join(WURZEL, "index.html"));
      res.writeHead(200, { "content-type": "text/html" }); res.end(b);
    } catch { res.writeHead(404); res.end(); }
  }
});
await new Promise((r) => srv.listen(0, r));
const START = `http://127.0.0.1:${srv.address().port}/`;

// ── DIE HALLE: HallCore im Probenprozess, verdrahtet wie worker/src/index.mjs
/* `verbindungen` spielt ctx.getWebSockets(): in Annahme-Reihenfolge, und
   gezaehlt werden nur OFFENE. `att` ist das, was die Huelle per
   serializeAttachment an der Verbindung haelt. */
const verbindungen = [];
/* Mitschnitt: { richtung: "an"|"von", seite, msg } - die Nachricht bleibt
   UNGESPREIZT, sonst ueberschreibt ein Protokollfeld namens `seite` die
   Seitenkennung (so geschehen beim Mutationstest youAre -> seite). */
const protokoll = [];
const berichte = [];             // POST /report der App - Absturzberichte
const hall = new HallCore({
  store: memoryStore(),
  send: (id, obj) => {
    const v = verbindungen.find((x) => x.offen && x.att.id === id);   // Hall.wsFor
    if (!v) return;
    protokoll.push({ richtung: "an", seite: v.seite, msg: obj });
    if (ZEIGEN) console.log(`      Halle -> ${v.seite}: ${JSON.stringify(obj).slice(0, 150)}`);
    try { v.route.send(JSON.stringify(obj)); } catch { /* wie deliver(): still */ }
  },
  adminToken: "",
  notify: () => {},
});
const hallRoute = (seite) => (route) => {
  const v = { route, seite, offen: true, att: { id: null, ip: "probe-" + seite, ipHash: null, herkunft: {} } };
  verbindungen.push(v);
  route.onMessage((raw) => {                                    // Hall.webSocketMessage
    let msg; try { msg = JSON.parse(String(raw)); } catch { return; }
    if (!msg || typeof msg !== "object") return;
    protokoll.push({ richtung: "von", seite, msg });
    if (ZEIGEN) console.log(`      ${seite} -> Halle: ${JSON.stringify(msg).slice(0, 150)}`);
    const att = v.att;
    const preSeat = msg.t === "hello" && msg.id && att.id !== msg.id;
    if (preSeat) v.att = { ...att, id: msg.id };
    if (msg.t === "hello") msg.__herkunft = { ...(att.herkunft || {}), ipHash: att.ipHash || null };
    try {
      const id = hall.handle(att.id, msg, att.ip || "?");
      if (id && id !== att.id) v.att = { ...att, id };
    } catch (e) {
      if (preSeat) v.att = att;   // ein abgewiesenes hello nimmt den Sitz nicht
      const fehler = { t: "error", error: String((e && e.message) || e) };
      protokoll.push({ richtung: "an", seite, msg: fehler });
      try { route.send(JSON.stringify(fehler)); } catch {}
    }
  });
  route.onClose(() => {                                          // Hall.webSocketClose
    v.offen = false;
    const id = v.att.id;
    if (id && !verbindungen.some((o) => o !== v && o.offen && o.att.id === id)) hall.close(id);
  });
};
/* Die HTTP-Wege der Halle, so wie index.mjs sie beantwortet. */
const hallHttp = (seite) => async (route) => {
  const req = route.request();
  const url = new URL(req.url());
  const cors = { "access-control-allow-origin": "*", "content-type": "application/json" };
  const json = (obj, status = 200) => route.fulfill({ status, headers: cors, body: JSON.stringify(obj) });
  if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors, body: "" });
  if (url.pathname === "/health") return json({ ok: true, online: hall.online.size, version: "probe" });
  if (url.pathname === "/name-frei") return json({ frei: !hall.nameVergeben(url.searchParams.get("n") || "", url.searchParams.get("id") || null) });
  if (url.pathname === "/design" && req.method() === "GET") return json({ design: hall.store.kvGet("design") });
  if (url.pathname === "/report" && req.method() === "POST") {
    let b = {}; try { b = JSON.parse(req.postData() || "{}"); } catch {}
    berichte.push({ seite, kind: b.kind, message: String(b.message || "").slice(0, 160) });
    return json({ ok: true });
  }
  return route.fulfill({ status: 404, headers: cors, body: "{}" });
};

// ── zwei Spieler, zwei Kontexte ───────────────────────────────────────────
/* Wie pruefe-navigation: was aus der Sandkiste nicht erreichbar ist
   (Supabase, CDN), darf still fehlschlagen. Die Halle selbst antwortet hier
   immer - ein Ladefehler auf IHRER Adresse ist also kein erwarteter mehr.
   Der Text "Failed to load resource" nennt keine Adresse; die steht in
   message.location().url. */
const ERWARTET_OFFLINE = (t, wo) =>
  /^Failed to load resource: net::ERR_(FAILED|TUNNEL_CONNECTION_FAILED|NAME_NOT_RESOLVED|CONNECTION_REFUSED)/.test(t)
  && !/duell\.gambitrise\.com/.test(wo || "");

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const befunde = [];
const spieler = async (seite) => {
  const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 420, height: 900 } });
  await ctx.routeWebSocket(/^wss?:\/\/duell\.gambitrise\.com\//, hallRoute(seite));
  await ctx.route(/^https?:\/\/duell\.gambitrise\.com\//, hallHttp(seite));
  const page = await ctx.newPage();
  const S = { seite, ctx, page, schritt: "Start" };
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    const wo = (m.location() && m.location().url) || "";
    if (!ERWARTET_OFFLINE(t, wo)) befunde.push(`[${seite} · ${S.schritt}] Konsolenfehler: ${t.slice(0, 200)}${wo ? " @ " + wo.slice(0, 80) : ""}`);
  });
  page.on("pageerror", (e) => befunde.push(`[${seite} · ${S.schritt}] Seitenfehler: ${String(e.message || e).replace(/\s+/g, " ").slice(0, 200)}`));
  return S;
};

const warte = async (bed, ms = 8000) => {
  const bis = Date.now() + ms;
  while (Date.now() < bis) {
    try { if (await bed()) return true; } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  try { return !!(await bed()); } catch { return false; }
};
const klick = (page, muster) => page.evaluate((m) => {
  const re = new RegExp(m, "i");
  const b = [...document.querySelectorAll("button")]
    .filter((x) => x.getBoundingClientRect().width > 0 && !x.disabled)
    .find((x) => re.test((x.textContent || "").trim()));
  if (b) { b.click(); return (b.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40); }
  return null;
}, muster);
const text = (page) => page.evaluate(() => document.body.innerText || "");
const von = (seite, t) => protokoll.filter((m) => m.richtung === "von" && m.seite === seite && m.msg.t === t).map((m) => m.msg);
const an = (seite, t) => protokoll.filter((m) => m.richtung === "an" && m.seite === seite && m.msg.t === t).map((m) => m.msg);

/* Eine Brettzelle, gelesen am lebenden DOM: welches Figurenbild steht dort,
   und traegt sie die Zielmarke (atmend oder - bei ruhiger Darstellung -
   nur im Goldton)? */
const zelle = (page, i) => page.evaluate((n) => {
  const z = document.querySelector(`[data-zelle="${n}"]`);
  if (!z) return null;
  const img = [...z.querySelectorAll("img")].map((x) => (x.currentSrc || x.src).split("/").pop());
  const ziel = [...z.querySelectorAll("div")].some((d) => /ggZielAtem|233,\s*207,\s*138|244,\s*90,\s*90/.test(d.getAttribute("style") || ""));
  return { figur: img.find((s) => /^(pawn|rook|knight|bishop|queen|king)/.test(s)) || null, ziel };
}, i);
const ersteZelle = (page) => page.evaluate(() => {
  const z = document.querySelector("[data-zelle]");
  return z ? Number(z.getAttribute("data-zelle")) : null;
});

/* Ein Zug per Klick auf die Brettfelder - echte Zeigerereignisse
   (page.click), damit auch eine Schicht auffaellt, die das Brett verdeckt. */
async function ziehe(S, von_, nach) {
  try { await S.page.click(`[data-zelle="${von_}"]`, { timeout: 5000 }); }
  catch (e) { return `Feld ${von_} nicht anklickbar: ${klickGrund(e)}`; }
  if (!(await warte(async () => (await zelle(S.page, nach))?.ziel, 3000))) return `nach Auswahl von ${von_} ist ${nach} nicht als Ziel markiert`;
  try { await S.page.click(`[data-zelle="${nach}"]`, { timeout: 5000 }); }
  catch (e) { return `Zielfeld ${nach} nicht anklickbar: ${klickGrund(e)}`; }
  return null;
}
/* Aus dem Aufruf-Log von Playwright die Zeile, die sagt, WER den Klick
   abfaengt - die erste Zeile ("Timeout 5000ms exceeded") sagt nichts. */
const klickGrund = (e) => {
  const zeilen = String(e.message).split("\n");
  return (zeilen.find((z) => /intercepts pointer events/.test(z)) || zeilen[0]).replace(/\x1b\[[0-9;]*m/g, "").trim().slice(0, 110);
};

// Wachhund: haengt ein Schritt, soll trotzdem eine RESULT-Zeile kommen
const wachhund = setTimeout(() => {
  ok("die Probe endet im Zeitlimit (150 s)", false, "haengt nach " + Math.round((Date.now() - T0) / 1000) + " s");
  console.log(`RESULT pruefe-duell: ${pass} passed, ${fail} failed`);
  process.exit(1);
}, 150000);

let A, B;
try {
  A = await spieler("A"); B = await spieler("B");

  // ── 1. Einstieg: lokales Konto, Auftakt, Online-Schirm, Hallenname ────────
  const einstieg = async (S) => {
    S.schritt = "Einstieg";
    await S.page.goto(START, { waitUntil: "load" });
    if (!(await warte(async () => await klick(S.page, "Erstellen"), 15000))) return "Knopf 'Erstellen' fehlt";
    await S.page.waitForTimeout(400);
    try {
      await S.page.locator("input[type=email]").fill(`duell-${S.seite.toLowerCase()}${Date.now()}@probe.local`);
      await S.page.locator("input[type=password]").fill("Probe12345!");
    } catch { return "Anmeldeformular nicht ausfuellbar"; }
    await klick(S.page, "^Konto erstellen$");
    /* Auftaktfenster per DOM-Klick schliessen (CLAUDE.md) - und zwar ALLE:
       Datenschutz, dann das Einrichtungsblatt (Name, Brettfiguren, Staerke).
       Erst wenn zweimal hintereinander keines mehr steht, gilt der Hub.
       Siehe Kopf: der Hubtext allein beweist nichts. */
    let ruhig = 0;
    const imHub = await warte(async () => {
      /* Brettfiguren ausdruecklich "Detailreich": zelle() liest die gemalten
         Figurenbilder (pawn-hell/pawn-dunkel). Aendert sich die Vorgabe des
         Blatts, bleibt die Probe trotzdem auf ihrem Messweg. */
      await klick(S.page, "^Detailreich$");
      if (await klick(S.page, "^Los geht|^Verstanden$|^Beginnen")) { ruhig = 0; return false; }
      ruhig = /Online-Duell/.test(await text(S.page)) ? ruhig + 1 : 0;
      if (ruhig < 2) { await S.page.waitForTimeout(350); return false; }
      return true;
    }, 20000);
    if (!imHub) return "Hub mit der Kachel 'Online-Duell' erscheint nicht";
    S.schritt = "Online-Schirm";
    /* Die Kachel mit ECHTEM Zeigerklick: liegt noch ein Blatt darueber,
       faellt es hier auf und nicht erst am Brett. */
    try { await S.page.getByRole("button", { name: /^Online-Duell/ }).first().click({ timeout: 5000 }); }
    catch (e) { return "Kachel 'Online-Duell' nicht klickbar: " + klickGrund(e); }
    /* Hallenname (online.tagSet): beim ersten Besuch Pflicht */
    if (!(await warte(async () => await klick(S.page, "^So soll man mich nennen$"), 8000))) return "Namenswahl 'So soll man mich nennen' erscheint nicht";
    if (!(await warte(async () => /^Verbinden$/m.test(await S.page.evaluate(() => [...document.querySelectorAll("button")].map((b) => b.textContent.trim()).join("\n"))), 6000)))
      return "Knopf 'Verbinden' erscheint nicht";
    return null;
  };
  const [eA, eB] = await Promise.all([einstieg(A), einstieg(B)]);
  ok("Seite A: Konto, Hub, Online-Schirm, Hallenname", !eA, eA);
  ok("Seite B: Konto, Hub, Online-Schirm, Hallenname", !eB, eB);
  if (eA || eB) throw new Error("Einstieg gescheitert");

  // ── 2. Verbinden - erst nach der Zustimmung ───────────────────────────────
  const verbinde = async (S) => {
    S.schritt = "Verbinden";
    await klick(S.page, "^Verbinden$");
    /* Das Zustimmungsfenster steht, BEVOR etwas an die Halle geht
       (privacy.html §5: "nach gesondertem Hinweis im Spiel"). */
    const gefragt = await warte(async () => /Online-Modus verbinden\?/.test(await text(S.page)), 2500);
    const helloVorher = von(S.seite, "hello").length;
    if (gefragt) await klick(S.page, "^Zustimmen & verbinden$");
    const da = await warte(async () => an(S.seite, "welcome").length > 0 && /Spiel starten/.test(await text(S.page)), 10000);
    return { gefragt, helloVorher, da };
  };
  const [vA, vB] = await Promise.all([verbinde(A), verbinde(B)]);
  for (const [S, v] of [[A, vA], [B, vB]]) {
    ok(`Seite ${S.seite}: 'Verbinden' fragt zuerst nach der Zustimmung - kein hello vor 'Zustimmen'`,
      v.gefragt && v.helloVorher === 0,
      v.gefragt ? `${v.helloVorher} hello schon vor der Zustimmung` : `kein Zustimmungsfenster, ${v.helloVorher} hello ging ohne Zustimmung an die Halle`);
    ok(`Seite ${S.seite}: hello -> welcome, die Lobby steht ("Spiel starten")`, v.da);
  }
  if (!vA.da || !vB.da) throw new Error("keine Verbindung");
  await Promise.all([A, B].map((S) => S.page.waitForTimeout(600)));
  /* Die Lobby fragt nach dem welcome Rangliste und Tresor an
     (OnlineScreen: zwei eigene welcome-Zuhoerer). Stirbt ein frueherer
     Zuhoerer an einer Ausnahme, kommen diese Anfragen nie an. */
  for (const S of [A, B]) {
    const fehlt = ["leaderboard", "vaultList"].filter((t) => !von(S.seite, t).length);
    ok(`Seite ${S.seite}: nach dem welcome fragt die Lobby Rangliste und Tresor an`, !fehlt.length, "nie angefragt: " + fehlt.join(", "));
  }

  // ── 3. Zufalls-Warteschlange im Modus Klassisch -> ein Brett fuer beide ───
  for (const S of [A, B]) { S.schritt = "Warteschlange"; await klick(S.page, "^Klassisch$"); }
  await A.page.waitForTimeout(300);
  for (const S of [A, B]) await klick(S.page, "^Spiel starten$");
  const gepaart = await warte(() => an("A", "match").length && an("B", "match").length, 8000);
  const mA = an("A", "match")[0], mB = an("B", "match")[0];
  const qA = von("A", "queue")[0], qB = von("B", "queue")[0];
  ok("beide stehen im Modus 'classic' in der Warteschlange", qA?.mode === "classic" && qB?.mode === "classic" && qA?.maps?.[0] === "classic",
    `A: ${qA?.mode}/${qA?.maps}, B: ${qB?.mode}/${qB?.maps}`);
  ok("die Halle paart beide zu EINER Partie mit Gegenfarben (match an beide)",
    gepaart && mA.matchId === mB.matchId && mA.youAre !== mB.youAre && mA.rules === "chess",
    gepaart ? JSON.stringify({ A: mA.youAre, B: mB.youAre, rules: mA.rules }) : "kein match-Paket");
  if (!gepaart) throw new Error("keine Paarung");
  const W = mA.youAre === "w" ? A : B, S_ = W === A ? B : A;   // Weiss, Schwarz
  const matchId = mA.matchId;
  console.log(`      (Weiss ist Seite ${W.seite}, Schwarz Seite ${S_.seite}, Partie ${matchId})`);
  for (const S of [A, B]) S.schritt = "Brett";
  const bretter = await Promise.all([W, S_].map((S) => warte(async () => (await zelle(S.page, 12))?.figur?.startsWith("pawn"), 10000)));
  ok("beide bekommen ein Brett (Bauer auf e2 bei Weiss UND bei Schwarz)", bretter[0] && bretter[1]);
  if (!bretter[0] || !bretter[1]) throw new Error("kein Brett");
  const [ecW, ecS] = [await ersteZelle(W.page), await ersteZelle(S_.page)];
  ok("jede Seite sieht das Brett von ihrer Farbe (Weiss oben links a8, Schwarz h1)", ecW === 56 && ecS === 7, `Weiss ${ecW}, Schwarz ${ecS}`);
  ok("Weiss liest 'Du bist am Zug', Schwarz 'Gegner ist am Zug'",
    await warte(async () => /Du bist am Zug/.test(await text(W.page)) && /Gegner ist am Zug/.test(await text(S_.page)), 3000));

  // ── 4. Weiss zieht e2-e4, Schwarz sieht ihn; Schwarz antwortet e7-e5 ─────
  W.schritt = "Zug e2-e4";
  const z1 = await ziehe(W, 12, 28);
  ok("Weiss zieht e2-e4 per Klick auf die Brettfelder", !z1, z1);
  const cmd1 = await warte(() => an(S_.seite, "cmd").length >= 1, 5000) ? an(S_.seite, "cmd")[0] : null;
  ok("der Zug geht als cmd mit matchId, Nummer und Pruefwert ueber die Halle",
    cmd1 && cmd1.matchId === matchId && cmd1.n === 1 && typeof cmd1.hash === "string" && cmd1.hash.length > 0 && cmd1.cmd?.move?.from === 12 && cmd1.cmd?.move?.to === 28,
    cmd1 ? JSON.stringify({ matchId: cmd1.matchId, n: cmd1.n, hash: cmd1.hash, from: cmd1.cmd?.move?.from, to: cmd1.cmd?.move?.to }) : "kein cmd bei Schwarz");
  S_.schritt = "Zug e2-e4 empfangen";
  const sieht1 = await warte(async () => (await zelle(S_.page, 28))?.figur?.startsWith("pawn-hell") && !(await zelle(S_.page, 12))?.figur, 5000);
  ok("Schwarz sieht den weissen Bauern auf e4 (und e2 leer)", sieht1, JSON.stringify({ e2: await zelle(S_.page, 12), e4: await zelle(S_.page, 28) }));
  ok("Schwarz ist danach am Zug", await warte(async () => /Du bist am Zug/.test(await text(S_.page)), 3000));

  const z2 = await ziehe(S_, 52, 36);
  ok("Schwarz antwortet e7-e5 per Klick", !z2, z2);
  W.schritt = "Zug e7-e5 empfangen";
  const sieht2 = await warte(async () => (await zelle(W.page, 36))?.figur?.startsWith("pawn-dunkel") && !(await zelle(W.page, 52))?.figur, 5000);
  ok("Weiss sieht den schwarzen Bauern auf e5", sieht2, JSON.stringify({ e7: await zelle(W.page, 52), e5: await zelle(W.page, 36) }));
  ok("die Halle hat zwei Zuege weitergereicht (matches[id].n = 2)", hall.matches[matchId]?.n === 2, "n = " + hall.matches[matchId]?.n);
  const [tW, tS] = [await text(W.page), await text(S_.page)];
  ok("kein 'Desync!' auf beiden Brettern (die Pruefwerte stimmen ueberein)", !/Desync!/.test(tW) && !/Desync!/.test(tS));

  // ── 5. Schwarz gibt auf (mit Rueckfrage), Weiss sieht den Sieg ────────────
  S_.schritt = "Aufgeben";
  const auf1 = await klick(S_.page, "^Aufgeben$");
  const frage = await warte(async () => /Aufgeben\?/.test(await text(S_.page)), 3000);
  ok("'Aufgeben' fragt zurueck ('Aufgeben?')", auf1 && frage);
  await klick(S_.page, "^⚑ Aufgeben$");
  ok("die Aufgabe geht als resign an die Halle, Weiss bekommt oppResign",
    await warte(() => von(S_.seite, "resign").length && an(W.seite, "oppResign").length, 5000));
  W.schritt = "Ergebnis"; S_.schritt = "Ergebnis";
  const sieg = await warte(async () => /Gewonnen!/.test(await text(W.page)), 5000);
  ok("Weiss sieht das Sieg-Banner 'Gewonnen!' (Grund: Aufgegeben)", sieg && /Aufgegeben/i.test(await text(W.page)));
  ok("Schwarz sieht 'Verloren'", await warte(async () => /Verloren/.test(await text(S_.page)), 5000));
  const wert = await warte(async () => /Wertung 1016 \(\+16\)/.test(await text(W.page)) && /Wertung 984 \(-16\)/.test(await text(S_.page)), 5000);
  ok("beide sehen ihre neue Wertung (1016 / +16 und 984 / -16)", wert);
  const idW = verbindungen.find((v) => v.seite === W.seite)?.att.id, idS = verbindungen.find((v) => v.seite === S_.seite)?.att.id;
  ok("die Halle hat abgerechnet: Partie beendet, Wertungen gespeichert",
    !hall.matches[matchId] && !!hall.finished[matchId] && hall.player(idW)?.rating === 1016 && hall.player(idS)?.rating === 984,
    JSON.stringify({ laeuft: !!hall.matches[matchId], fertig: !!hall.finished[matchId], w: hall.player(idW)?.rating, s: hall.player(idS)?.rating }));

  // ── 6. Revanche: beide wollen, die Halle tauscht die Farben ───────────────
  W.schritt = "Revanche"; S_.schritt = "Revanche";
  await klick(W.page, "Revanche");
  ok("Schwarz sieht das Angebot 'Gegner möchte Revanche!'", await warte(async () => /Gegner möchte Revanche!/.test(await text(S_.page)), 4000));
  await klick(S_.page, "Revanche");
  const neu = await warte(() => an(W.seite, "match").length >= 2 && an(S_.seite, "match").length >= 2, 5000);
  const r1 = an(W.seite, "match")[1], r2 = an(S_.seite, "match")[1];
  ok("die Revanche ist eine NEUE Partie mit getauschten Farben",
    neu && r1.matchId !== matchId && r1.matchId === r2.matchId && r1.youAre === "b" && r2.youAre === "w",
    neu ? JSON.stringify({ id: r1.matchId, alterWeiss: r1.youAre, alterSchwarz: r2.youAre }) : "kein zweites match-Paket");
  const frisch = await warte(async () => {
    for (const S of [W, S_]) {
      if (!(await zelle(S.page, 12))?.figur?.startsWith("pawn-hell") || (await zelle(S.page, 28))?.figur) return false;
      if (/Gewonnen!|Verloren/.test(await text(S.page))) return false;
    }
    return true;
  }, 6000);
  ok("beide Bretter stehen frisch (Bauer wieder auf e2, kein Banner mehr)", frisch,
    JSON.stringify({ W_e2: await zelle(W.page, 12), W_e4: await zelle(W.page, 28), S_e2: await zelle(S_.page, 12) }));
  ok("jetzt sieht der alte Schwarze das Brett als Weiss (a8 oben links)", (await ersteZelle(S_.page)) === 56 && (await ersteZelle(W.page)) === 7,
    `alter Schwarzer ${await ersteZelle(S_.page)}, alter Weisser ${await ersteZelle(W.page)}`);
} catch (e) {
  if (!/Einstieg gescheitert|keine Verbindung|keine Paarung|kein Brett/.test(String(e.message))) ok("die Probe laeuft ohne Ausnahme durch", false, String(e.stack || e).split("\n").slice(0, 2).join(" | "));
  else console.log(`      (abgebrochen: ${e.message})`);
}

// ── Protokoll- und Konsolenbefunde ─────────────────────────────────────────
const abgewiesen = protokoll.filter((m) => m.richtung === "an" && m.msg.t === "error");
ok("die Halle hat keine Nachricht der App abgewiesen ({t:'error'})", !abgewiesen.length,
  abgewiesen.map((m) => `${m.seite}: ${m.msg.error}`).join("; "));
ok("kein Absturzbericht der App an die Halle (POST /report)", !berichte.length,
  berichte.map((b) => `${b.seite}: ${b.kind} ${b.message}`).join("; "));
ok("keine Konsolen- oder Seitenfehler auf beiden Seiten", !befunde.length, `${befunde.length} Befunde`);
for (const b of [...new Set(befunde)].slice(0, 8)) console.log("        " + b);

clearTimeout(wachhund);
await browser.close().catch(() => {});
srv.close();
console.log(`      Laufzeit ${Math.round((Date.now() - T0) / 1000)} s, ${protokoll.length} Hallen-Nachrichten`);
console.log(`RESULT pruefe-duell: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
