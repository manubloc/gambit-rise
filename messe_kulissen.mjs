import { execSync } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright-core";
import { createRequire } from "node:module";
const require0 = createRequire(import.meta.url);

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".webm": "video/webm", ".mp3": "audio/mpeg" };
const srv = createServer(async (req, res) => {
  const p = req.url.split("?")[0];
  const rel = p === "/" ? "index.html" : p.slice(1);
  try {
    const b = await readFile(join("dist", rel));
    res.writeHead(200, { "content-type": MIME[extname(rel)] || "application/octet-stream" });
    res.end(b);
  } catch {
    const b = await readFile("dist/index.html");
    res.writeHead(200, { "content-type": "text/html" }); res.end(b);
  }
});
await new Promise((r) => srv.listen(0, r));
const port = srv.address().port;

/* Chromium selber suchen statt eine Ordnernummer festzuschreiben, die genau
   einem Container gehoerte (v1.0.64). */
const chromePfad = process.env.GG_CHROME || (() => {
  try {
    const { readdirSync, existsSync } = require0("node:fs");
    const w = "/opt/pw-browsers";
    if (!existsSync(w)) return null;
    for (const o of readdirSync(w).filter((d) => /^chromium-\d+$/.test(d))
      .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))) {
      const p = join(w, o, "chrome-linux", "chrome");
      if (existsSync(p)) return p;
    }
  } catch {}
  return null;
})();
const browser = await chromium.launch({ ...(chromePfad ? { executablePath: chromePfad } : {}), args: ["--no-sandbox"] });
const ctx = await browser.newContext({ serviceWorkers: "block", viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0, 200)));
page.on("console", (m) => { if (m.type() === "error" && !/duell\.grandgambit|ERR_TUNNEL|ERR_FAILED/.test(m.text())) fehler.push(m.text().slice(0, 160)); });

const klick = async (muster) => page.evaluate((m) => {
  const b = [...document.querySelectorAll("button")].find((x) => new RegExp(m).test(x.textContent));
  if (b) { b.click(); return true; } return false;
}, muster);
const wegKlicken = async () => { for (let n = 0; n < 8; n++) {
  const hit = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      ["Los geht's", "Verstanden", "Weiter"].includes(x.textContent.trim()));
    if (b) { b.click(); return true; } return false; });
  if (!hit) return; await page.waitForTimeout(700);
} };


/* ── LIVE-MESSUNG DER KULISSEN (v1.14.0) ──────────────────────────────────────
   SSR zeigt das Verzeichnis nicht (es wartet auf seine Gemaelde), also wird
   hier im echten Chromium gemessen: traegt jede Kachel im Hofstaat das Bild
   ihres Bundes / Grossmeisters / ihrer Gruppe - sichtbar, mit Breite? */
import { BUENDE } from "./src/content/buende.js";
import { CHARACTER_LIST, BOSSES } from "./src/content/index.js";
import { MEISTER_KULISSE, MONSTER_GRUPPE } from "./src/app/ui/kulissen.js";

await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await klick("Erstellen");
await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("kulisse@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen");
await page.waitForTimeout(2500);
await klick("Neuer Spielstand");
await page.waitForTimeout(2500);
await wegKlicken();

const alleChars = CHARACTER_LIST.map((c) => c.id);
const alleKinds = [...new Set(CHARACTER_LIST.map((c) => c.kind))];
const alleBosse = (Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES)).map((b) => b.id);
await page.evaluate(({ chars, kinds, bosse }) => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.gold = 9000; p.sp = 60;
    p.unlocked = chars;
    p.pieces = p.pieces || {}; p.pieces.abilities = { ...(p.pieces.abilities || {}), amazon: ["ranged_shot", "teleport"], knight: ["knight_longleap", "knight_outrider"],
      /* v1.23.6: die Dame mit ALLEN zehn - nur so laesst sich die Fuenfergrenze
         und die Ziffer dahinter ueberhaupt messen. */
      queen: ["queen_knightleap", "ranged_shot", "teleport", "lifesteal", "ranged_volley", "bulwark", "regen", "blast", "pull", "chain"] };
    p.codex = p.codex || {}; p.codex.met = [...kinds, ...bosse.map((b) => "X:" + b)];
    p.campaign = p.campaign || {}; p.campaign.bribedBosses = bosse.slice(0, 12);   /* die Haelfte bleibt "begegnet" - fuer die Graustufen-Messung */
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    if (k === "gambit:u::profile" || /^gambit:u::save:/.test(k)) {
      try { const o = JSON.parse(localStorage.getItem(k));
        if (o && typeof o === "object" && "gold" in o) localStorage.setItem(k, patch(localStorage.getItem(k)));
      } catch {}
    }
  }
}, { chars: alleChars, kinds: alleKinds, bosse: alleBosse });
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2200);
await klick("Weiterspielen");
await page.waitForTimeout(2500);
await wegKlicken();
await klick("^Lager$");
await page.waitForTimeout(1500);
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].filter((x) => x.textContent.trim() === "Figuren");
  (b[b.length - 1] || b[0])?.click();
});
await page.waitForTimeout(2500);
await wegKlicken();   /* die Vorstellung des Hofstaats wegklicken, sonst verdeckt sie das Bild */
await page.waitForTimeout(600);

/* Gemessen: jedes Kulissenbild mit Name, Breite und ob es geladen ist. */
const gemessen = await page.evaluate(() => [...document.querySelectorAll("img[data-kulisse]")].map((i) => {
  const r = i.getBoundingClientRect();
  return { name: i.dataset.kulisse, w: Math.round(r.width), h: Math.round(r.height),
    geladen: i.complete && i.naturalWidth > 0, deckung: getComputedStyle(i).opacity };
}));
const nachName = {};
for (const g of gemessen) (nachName[g.name] = nachName[g.name] || []).push(g);

let passed = 0, failed = 0;
const ok = (n, c) => { if (c) { passed++; console.log(`  ok  - ${n}`); } else { failed++; console.log(`  FAIL - ${n}`); } };
const soll = [
  ...Object.keys(BUENDE).map((b) => [`bund-${b}`, BUENDE[b].figuren.length]),
  ...Object.values(MEISTER_KULISSE).map((m) => [m, 1]),
  ...[...new Set(Object.values(MONSTER_GRUPPE))].map((g) => [`monster-${g}`, Object.values(MONSTER_GRUPPE).filter((x) => x === g).length]),
  ["drache", 1], ["figur-bauer", 1], ["figur-gambit", 1],
];
console.log(`\n== KULISSEN IM LEBENDEN HOFSTAAT (${gemessen.length} Bilder gefunden) ==`);
for (const [name, n] of soll) {
  const da = nachName[name] || [];
  const sichtbar = da.filter((g) => g.w > 40 && g.h > 40 && g.geladen);
  ok(`${name}: ${n} Kachel(n) erwartet, ${da.length} gefunden, ${sichtbar.length} sichtbar und geladen`, da.length === n && sichtbar.length === n);
}
/* ── v1.15.1: KOPFZEILE, STUFE, GRAUSTUFEN, FARBTON ───────────────────────── */
const kopf = await page.evaluate(() => {
  /* gleiche Bauhoehe: der Stufenkreis (oder sein Platzhalter) steht in jeder
     Kachel gleich weit unter der Oberkante, und das Rohr sitzt auf seiner Hoehe */
  const kacheln = [...document.querySelectorAll("[data-kopf]")].map((k) => {
    const t = k.parentElement.getBoundingClientRect().top;
    const st = k.lastElementChild.getBoundingClientRect();
    const rohr = k.querySelector("[data-gg=\"rohr-koerper\"]");
    const rm = rohr ? rohr.getBoundingClientRect() : null;
    return Math.round((st.top - t) * 10) / 10 + (rm ? "|" + Math.round(((rm.top + rm.height / 2) - (st.top + st.height / 2)) * 10) / 10 : "");
  });
  const stufen = [...document.querySelectorAll("[data-stufe]")].map((el) => {
    const c = el.getBoundingClientRect();
    const r = document.createRange(); r.selectNodeContents(el);
    const g = r.getBoundingClientRect();
    /* die Glyphenbox ist die Zeilenbox; die Ziffer selbst sitzt in Georgia
       optisch ein wenig ueber der Mitte der Zeilenbox - gemessen wird die
       Zeilenbox, das ist die ehrliche Groesse, die CSS hergibt */
    return { dx: (g.left + g.width / 2) - (c.left + c.width / 2), dy: (g.top + g.height / 2) - (c.top + c.height / 2) };
  });
  const grau = [...document.querySelectorAll("img[data-kulisse][data-grau=\"1\"]")].map((i) => getComputedStyle(i).filter);
  const farbig = [...document.querySelectorAll("img[data-kulisse][data-grau=\"0\"]")].map((i) => getComputedStyle(i).filter);
  const toene = [...document.querySelectorAll("[data-kulisse-ton]")].length;
  const meisterMitRohr = [...document.querySelectorAll("img[data-kulisse^=\"meister-\"], img[data-kulisse^=\"monster-\"]")]
    .map((i) => !!i.parentElement.querySelector("svg[data-gg=\"sockelband\"]")).filter(Boolean).length;
  /* v1.23.9: sind die Baender jetzt UEBERALL gleich hoch? Gemessen wird die
     gezeichnete Hoehe des Goldrands in Bildschirmpixeln, je Kachel. */
  const bandHoehen = [...document.querySelectorAll("svg[data-gg=\"sockelband\"]")].map((sv) => {
    const wer = sv.parentElement?.querySelector("img")?.currentSrc?.split("/").pop() || "?";
    const teile = [...sv.querySelectorAll("path")];
    if (!teile.length) return null;
    const oben = Math.min(...teile.map((t) => t.getBoundingClientRect().top));
    const unten = Math.max(...teile.map((t) => t.getBoundingClientRect().bottom));
    return { wer, h: Math.round((unten - oben) * 10) / 10 };
  }).filter((x) => x && x.h > 0);
  const baender = [...document.querySelectorAll("svg[data-gg=\"sockelband\"]")].map((sv) => {
    /* das Band muss auf dem Bild liegen: derselbe Kasten wie sein Bild */
    const img = sv.parentElement.querySelector("img"); const a = sv.getBoundingClientRect(), b = img.getBoundingClientRect();
    return Math.max(Math.abs(a.left - b.left), Math.abs(a.top - b.top), Math.abs(a.width - b.width), Math.abs(a.height - b.height));
  });
  /* v1.20.1: die Bodenlinie jeder Figur, relativ zur Unterkante ihrer Kachel */
  const boden = [...document.querySelectorAll("[data-boden]")].map((w) => {
    const sv = w.querySelector("svg[data-gg=\"sockelband\"]"); if (!sv) return null;
    const vb = sv.viewBox.baseVal; const r = sv.getBoundingClientRect();
    /* v1.23.9: die Bodenkante ist NICHT mehr der unterste Punkt des Bandes -
       das Band haengt seit der Parallelverschiebung bei jeder Figur anders
       tief darunter (Besitzer: "man sieht die Unterkante des Sockels nie").
       Gemessen wird deshalb die gemalte Bodenlinie selbst, die das Band als
       data-bodenlinie mitbringt. */
    const bl = Number(sv.getAttribute("data-bodenlinie"));
    const yPx = r.top + bl / vb.height * r.height;
    const kachel = w.closest("[data-kopf]")?.parentElement || w.parentElement;
    return Math.round((kachel.getBoundingClientRect().bottom - yPx) * 10) / 10;
  }).filter((v) => v !== null);
  /* v1.20.2: die Namenszeile sitzt in jeder Kachel gleich weit unter der Oberkante */
  const namen = [...document.querySelectorAll("[data-kopf]")].map((k) => {
    const kachel = k.parentElement; const n = [...kachel.querySelectorAll(".gg-quill")].pop();
    return n ? Math.round(n.getBoundingClientRect().top - kachel.getBoundingClientRect().top) : null;
  }).filter((v) => v !== null);
  const talente = document.querySelectorAll("[data-kopf] [data-talent]").length;
  /* v1.23.0: gleiche Tellerbreite - der Goldfuss jedes Bandes hat auf dem Schirm dieselbe Breite */
  const teller = [...document.querySelectorAll("svg[data-gg=\"sockelband\"]")].map((sv) => {
    const p = sv.querySelector("path"); const bb = p.getBBox(); const vb = sv.viewBox.baseVal; const r = sv.getBoundingClientRect();
    const skala = r.width / vb.width;   /* getBoundingClientRect enthaelt die Skalierung schon */
    return Math.round(bb.width * skala * 10) / 10;
  });
  const abz = [...document.querySelectorAll("svg[data-abzeichen]")].map((a) => { const k = a.closest("[data-kopf]").parentElement; const ra = a.getBoundingClientRect(), rk = k.getBoundingClientRect();
    return [Math.round((ra.top - rk.top) * 10) / 10, Math.round((rk.right - ra.right) * 10) / 10]; });
  const meister = document.querySelectorAll("img[data-kulisse^=\"meister-\"]").length;
  /* v1.23.2: Figurenhoehe - Scheitel des Bildes ueber der Bodenkante, auf dem Schirm */
  const hoehen = [...document.querySelectorAll("[data-boden]")].map((w) => {
    const img = w.querySelector("img"); if (!img) return null; const r = img.getBoundingClientRect();
    const sv = w.querySelector("svg[data-gg=\"sockelband\"]"); if (!sv) return null; const vb = sv.viewBox.baseVal; const sr = sv.getBoundingClientRect();
    const p = sv.querySelector("path"); const bb = p.getBBox(); const bodenPx = sr.top + (bb.y + bb.height) / vb.height * sr.height;
    const st = getComputedStyle(w).getPropertyValue("--skala"); return Math.round((bodenPx - r.top) * 10) / 10;   /* r.top ist der Kastenrand, nicht der Scheitel - reicht als Vergleichsmass, da alle Bilder oben Luft haben */
  }).filter((v) => v !== null);
  /* v1.23.3: die Verzierung steht nur noch UNTEN, zwei je Kachel. Gemessen
     wird die Zahl, die Ebene (muss hinter allem liegen) und die Symmetrie:
     der Abstand nach links unten muss dem nach rechts unten gleichen. */
  const eckKnoten = [...document.querySelectorAll("[data-ecke]")];
  const ecken = eckKnoten.length;
  const eckEbenen = [...new Set(eckKnoten.map((e) => getComputedStyle(e).zIndex))];
  const eckOben = eckKnoten.filter((e) => !/^unten-/.test(e.getAttribute("data-ecke"))).length;
  /* v1.23.4: Abstand jeder der vier Ecken zu ihren beiden Raendern - muss je
     Ecke gleich sein (symmetrisch) und ueber alle Ecken derselbe Wert. */
  const eckAbstand = eckKnoten.map((e) => {
    const k = e.parentElement.getBoundingClientRect(), r = e.getBoundingClientRect();
    const wo = e.getAttribute("data-ecke");
    const dy = /^oben-/.test(wo) ? r.top - k.top : k.bottom - r.bottom;
    const dx = /-links$/.test(wo) ? r.left - k.left : k.right - r.right;
    return [Math.round(dx * 10) / 10, Math.round(dy * 10) / 10];
  });
  /* v1.23.4 (Besitzerforderung): die Verzierung darf Abzeichen und Talente
     NIE beruehren. Gemessen wird der Abstand der Kaesten, nicht geschaetzt. */
  /* GEMESSEN BEIM SCHREIBEN: der Kasten des Eck-SVG ist 14x14, gezeichnet wird
     darin aber nur ein duenner Winkel am Rand - der Kasten ueberlappt das
     Abzeichen, die TINTE nicht. Geprueft wird deshalb die Tinte: die Kaesten
     der gezeichneten Pfade und des Punktes, die die CSS-Drehung schon
     enthalten. */
  const ueberschnitt = [];
  for (const e of eckKnoten) {
    const kachel = e.parentElement;
    const nachbarn = [...kachel.querySelectorAll("svg[data-abzeichen], [data-talent]")].map((n) => n.getBoundingClientRect());
    for (const stueck of e.querySelectorAll("path, circle")) {
      const r = stueck.getBoundingClientRect();
      for (const q of nachbarn) {
        const ux = Math.min(r.right, q.right) - Math.max(r.left, q.left);
        const uy = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
        if (ux > 0 && uy > 0) ueberschnitt.push([e.getAttribute("data-ecke"), Math.round(ux * 10) / 10, Math.round(uy * 10) / 10]);
      }
    }
  }
  /* nur das ERSTE Talentzeichen je Kachel - das zweite haengt darunter und
     hat mit der Ecke nichts zu tun. */
  const talentZahl = [...document.querySelectorAll("[data-talentspalte]")].map((sp) => sp.querySelectorAll("[data-talent]").length);
  const spalten = [...document.querySelectorAll("[data-talentspalte]")].map((sp) => {
    /* GEMESSEN BEIM SCHREIBEN: die Spalte haengt in der KOPFZEILE, nicht
       direkt in der Kachel - sp.parentElement gab den Kopf, und der Name lag
       ausserhalb. Die Kachel ist eine Ebene hoeher. */
    const kachel = sp.closest("[data-kopf]").parentElement; const k = kachel.getBoundingClientRect();
    const zeichen = sp.querySelectorAll("[data-talent]").length;
    const mehrK = sp.querySelector("[data-talentmehr]");
    const kinder = [...sp.children].map((c) => c.getBoundingClientRect());
    const name = [...kachel.children].filter((c) => (c.textContent || "").trim().length > 1).pop();
    return { zeichen, mehr: mehrK ? Number(mehrK.getAttribute("data-talentmehr")) : null,
      unterkante: kinder.length ? Math.round((kinder[kinder.length - 1].bottom - k.top) * 10) / 10 : 0,
      nameOben: name ? Math.round((name.getBoundingClientRect().top - k.top) * 10) / 10 : 999 };
  });
  const talentLage = [...document.querySelectorAll("[data-kopf]")].map((kopf) => {
    const t = kopf.querySelector("[data-talent]"); if (!t) return null;
    const k = kopf.parentElement.getBoundingClientRect(), r = t.getBoundingClientRect();
    return [Math.round((r.top - k.top) * 10) / 10, Math.round((r.left - k.left) * 10) / 10];
  }).filter(Boolean);
  const zifferToene = [...new Set([...document.querySelectorAll("text[data-ziffer]")].map((t) => t.getAttribute("data-ziffer")))];
  const eckSym = [];
  /* GEMESSEN BEIM SCHREIBEN: offsetParent gibt es an einem SVG-Element NICHT
     (es ist eine HTMLElement-Eigenschaft) - die Schleife lief ins Leere und
     die Probe meldete 0 Kacheln. Die Kachel ist der direkte Elternknoten. */
  for (const li of document.querySelectorAll('[data-ecke="unten-links"]')) {
    const kachel = li.parentElement; if (!kachel) continue;
    const re = kachel.querySelector('[data-ecke="unten-rechts"]'); if (!re) continue;
    const k = kachel.getBoundingClientRect(), a = li.getBoundingClientRect(), b = re.getBoundingClientRect();
    eckSym.push({ l: Math.round((a.left - k.left) * 10) / 10, r: Math.round((k.right - b.right) * 10) / 10,
      ul: Math.round((k.bottom - a.bottom) * 10) / 10, ur: Math.round((k.bottom - b.bottom) * 10) / 10 });
  }
  return { kacheln, stufen, grau, farbig, toene, meisterMitRohr, baender, boden, namen, talente, teller, abz, meister, hoehen, ecken, eckEbenen, eckOben, eckSym, eckAbstand, ueberschnitt, zifferToene, talentLage, talentZahl, spalten, bandHoehen };
});
const kopfH = [...new Set(kopf.kacheln.map((h) => String(h).split("|")[0]))];
const rohrVersatz = kopf.kacheln.map((h) => String(h).split("|")[1]).filter((x) => x !== undefined).map(Number);
ok(`die Stufe steht in jeder Kachel gleich hoch (${kopf.kacheln.length} Kacheln, ${kopfH.join("/")} px unter der Kante)`, kopf.kacheln.length >= 50 && kopfH.length === 1);
/* v1.17.0: das Band sitzt im Sockel - das Rohr in der Kopfzeile gibt es nur
   noch fuer Figuren ohne Sockelmessung; die Kopfzeilenprobe misst nur noch die Stufe */
ok(`kein Rohr mehr in der Kopfzeile, wo ein Sockelband ist (${rohrVersatz.length} Rohre)`, rohrVersatz.length === 0);
const maxDx = Math.max(...kopf.stufen.map((s) => Math.abs(s.dx))), maxDy = Math.max(...kopf.stufen.map((s) => Math.abs(s.dy)));
ok(`die Stufenziffer sitzt mittig im Kreis (${kopf.stufen.length} gemessen, max. Versatz ${maxDx.toFixed(2)}/${maxDy.toFixed(2)} px)`, kopf.stufen.length > 0 && maxDx <= 1 && maxDy <= 1);
ok(`was noch nicht zu einem gehoert, steht in Graustufen (${kopf.grau.length} grau, ${kopf.farbig.length} farbig)`, kopf.grau.length > 0 && kopf.grau.every((f) => /grayscale/.test(f)) && kopf.farbig.every((f) => f === "none"));
ok(`Monster tragen einen Farbschleier im eigenen Ton (${kopf.toene})`, kopf.toene >= 12);
ok(`Grossmeister und Monster tragen das Sockelband wie alle anderen (${kopf.meisterMitRohr})`, kopf.meisterMitRohr >= 25);
/* v1.23.9 (Besitzer): "alle Sockel sollen nach unten hin die gleiche Hoehe
   haben". Weil die Skalierung jeden Teller auf dieselbe Breite zieht, muessen
   die Baender dann auch gleich hoch GEZEICHNET sein. */
{
  const h = kopf.bandHoehen.map((x) => x.h);
  const kl = Math.min(...h), gr = Math.max(...h);
  const sortiert = [...kopf.bandHoehen].sort((a, b) => a.h - b.h);
  console.log("   niedrigste:", sortiert.slice(0, 3).map((x) => `${x.wer} ${x.h}`).join(" | "));
  console.log("   hoechste:  ", sortiert.slice(-3).map((x) => `${x.wer} ${x.h}`).join(" | "));
  ok(`alle Sockelbaender sind gleich hoch (${h.length} gemessen, ${kl.toFixed(1)} bis ${gr.toFixed(1)} px, Spanne ${(gr - kl).toFixed(1)})`,
    /* GEMESSEN: mit der Massstabsdivision liegt die Spanne bei 4,1 px um
       einen Mittelwert von knapp 20 - vorher waren es 7,6. Der Rest kommt aus
       der Rundung der Bandhoehe auf ganze Bildpixel und der Kappung von
       sockelSkalierung bei 0,55 fuer die breitesten Teller (Hetzer rx 249).
       4,5 px ist deshalb die ehrliche Schranke, nicht 0. */
    h.length >= 30 && gr - kl <= 4.5);
}
ok(`jedes Sockelband liegt deckungsgleich auf seinem Bild (${kopf.baender.length} Baender, max. ${Math.max(...kopf.baender).toFixed(2)} px Abweichung)`, kopf.baender.length >= 30 && kopf.baender.every((d) => d <= 0.5));
{
  const b = kopf.boden; const mn = Math.min(...b), mx = Math.max(...b);
  ok(`alle Figuren stehen auf derselben Bodenlinie (${b.length} gemessen, ${mn}-${mx} px ueber der Kachelkante, Spanne ${(mx - mn).toFixed(1)} px)`, b.length >= 30 && mx - mn <= 2.5);
}
{
  const n = [...new Set(kopf.namen)];
  ok(`die Namenszeile sitzt in jeder Kachel gleich hoch (${kopf.namen.length} Kacheln, ${n.join("/")} px unter der Kante)`, kopf.namen.length >= 50 && n.length === 1);
  ok(`- auch wenn Talente in der Spalte haengen (${kopf.talente} Talentzeichen im Hofstaat)`, kopf.talente >= 2);
}
{
  const t = kopf.teller.filter((w) => w > 0); const mn = Math.min(...t), mx = Math.max(...t);
  ok(`alle Teller sind gleich breit (${t.length} gemessen, ${mn}-${mx} px, Spanne ${(mx - mn).toFixed(1)} px; Drache ausgenommen)`, t.length >= 30 && (mx - mn) <= 14);
  const o = [...new Set(kopf.abz.map((x) => x[0]))], r = [...new Set(kopf.abz.map((x) => x[1]))];
  ok(`das Abzeichen hat ueberall denselben Abstand nach oben und rechts (${o.join("/")} / ${r.join("/")} px)`, o.length === 1 && r.length === 1 && Math.abs(o[0] - r[0]) <= 1);
  /* v1.23.4: und die Talentspalte sitzt spiegelbildlich dazu - 10 von oben,
     10 von links (vorher 11/8, nicht einmal zu sich selbst symmetrisch). */
  const to = [...new Set(kopf.talentLage.map((x) => x[0]))], tl = [...new Set(kopf.talentLage.map((x) => x[1]))];
  ok(`die Talente sitzen spiegelbildlich zum Abzeichen (${to.join("/")} oben / ${tl.join("/")} links)`,
    to.length === 1 && tl.length === 1 && Math.abs(to[0] - tl[0]) <= 0.6 && Math.abs(to[0] - o[0]) <= 0.6);
}
/* v1.23.4 (Besitzer): die Verzierung steht wieder in ALLEN VIER Ecken, liegt
   hinter allem, haelt zu jedem Rand denselben Abstand und beruehrt weder das
   Stufen-Abzeichen noch die Talente. */
ok(`jede Kachel traegt vier Eckverzierungen (${kopf.ecken} gemessen, davon ${kopf.eckOben} oben)`,
  kopf.ecken >= 52 * 4 && kopf.eckOben === kopf.ecken / 2);
ok(`die Verzierung liegt hinter allen Elementen (z ${kopf.eckEbenen.join("/")})`, kopf.eckEbenen.length === 1 && kopf.eckEbenen[0] === "-1");
{
  const a = kopf.eckAbstand;
  const schief = Math.max(...a.map(([dx, dy]) => Math.abs(dx - dy)));
  const werte = [...new Set(a.flat())];
  ok(`jede Ecke haelt zu beiden Raendern denselben Abstand (${a.length} Ecken, ${werte.join("/")} px, max. Schiefe ${schief.toFixed(1)} px)`,
    a.length >= 52 * 4 && schief <= 0.6 && werte.length === 1);
}
if (kopf.ueberschnitt.length) console.log('   Ueberschneidungen (Ecke, dx, dy):', JSON.stringify(kopf.ueberschnitt.slice(0, 6)));
/* v1.23.6: die Kachel zeigt hoechstens fuenf Zeichen; wer mehr hat, traegt
   statt der ueberzaehligen eine Ziffer. */
{
  const sp = kopf.spalten;
  /* v1.23.6: der Besitzer hat sich nach dem Bildblatt fuer VIER entschieden. */
  const zuviel = sp.filter((x) => x.zeichen > 4);
  const falscheZiffer = sp.filter((x) => x.mehr !== null && x.zeichen !== 4);
  ok(`keine Kachel zeigt mehr als vier Zeichen (${sp.length} Spalten, groesste ${Math.max(0, ...sp.map((x) => x.zeichen))})`, sp.length > 0 && zuviel.length === 0);
  ok(`wo mehr da ist, steht die Ziffer (${sp.filter((x) => x.mehr !== null).length} Kacheln mit Ziffer)`, falscheZiffer.length === 0);
  const unten = sp.map((x) => x.unterkante);
  ok(`die Spalte bleibt ueber dem Namen (tiefste Unterkante ${Math.max(0, ...unten).toFixed(1)} px, Name bei ${sp[0] ? sp[0].nameOben.toFixed(1) : "-"})`,
    sp.length > 0 && unten.every((u, i) => u <= sp[i].nameOben));
}
ok(`die Verzierung beruehrt weder Abzeichen noch Talente (${kopf.ueberschnitt.length} Ueberschneidungen)`, kopf.ueberschnitt.length === 0);
{
  const s = kopf.eckSym;
  const dxMax = Math.max(...s.map((e) => Math.abs(e.l - e.r)));
  const dyMax = Math.max(...s.map((e) => Math.abs(e.ul - e.ur)));
  ok(`links und rechts gleich weit vom Rand (${s.length} Kacheln, max. Unterschied ${dxMax.toFixed(1)} px seitlich, ${dyMax.toFixed(1)} px nach unten)`,
    s.length >= 52 && dxMax <= 0.6 && dyMax <= 0.6);
}
/* v1.23.4: und die Ziffer traegt einen Hauch der Figurenfarbe - keine zwei
   Figuren mit verschiedener Farbe duerfen dieselbe Ziffernfarbe haben. */
ok(`die Ziffern tragen den Ton ihrer Figur (${kopf.zifferToene.length} verschiedene Ziffernfarben)`, kopf.zifferToene.length >= 6);
/* ── DER HINTERGRUND MUSS WIRKLICH ZU SEHEN SEIN (v1.23.5) ────────────────
   Besitzerbefund, mehrfach: "Du hast es immer noch nicht geschafft, diesen
   Hintergrund im Hauptmenue sichtbar zu machen." Er hatte jedes Mal recht,
   und keine Probe hat es je gemerkt - weil alle nur GEPRUEFT haben, ob die
   Ebene im Baum liegt und ihr Bild geladen ist. Beides stimmte. Gemalt wurde
   trotzdem nichts.
   Diese Probe fotografiert dasselbe Stueck Schirm zweimal, einmal mit und
   einmal ohne die Ebene, und vergleicht die Pixel. Nur das kann die Frage
   beantworten, die der Besitzer stellt: SIEHT man ihn? */
{
  const marken = await page.evaluate(() => {
    const riss = document.querySelector("[data-riss]");
    const hg = [...document.querySelectorAll("div")].find((d) => { const s = getComputedStyle(d);
      return s.position === "fixed" && s.zIndex === "-1" && d.getBoundingClientRect().width > 300; });
    const bild = hg && hg.querySelector("img");
    if (riss) riss.setAttribute("data-probe-riss", "1");
    if (bild) bild.setAttribute("data-probe-hg", "1");
    return { riss: !!riss, bild: !!bild, bodyGrund: getComputedStyle(document.body).backgroundColor };
  });
  ok(`der Grund haengt am HTML, nicht am body (body: ${marken.bodyGrund})`, /^rgba\([^)]*,\s*0\)$|^transparent$/.test(marken.bodyGrund));
  const feld = { x: 0, y: 420, width: 390, height: 420 };
  /* Verglichen wird mit Pillow - dieselbe Werkbank, die auch die Bilder im
     Archiv vermisst (die CI installiert Pillow vor npm test). pngjs ist
     nicht im Baum, und fuer zwei Fotos lohnt keine neue Abhaengigkeit. */
  for (const [marke, name] of [["data-probe-hg", "das Kapitelbild"], ["data-probe-riss", "der Rissboden"]]) {
    const daIst = marke === "data-probe-hg" ? marken.bild : marken.riss;
    if (!daIst) { ok(`${name} liegt im Baum`, false); continue; }
    await page.screenshot({ path: "/tmp/gg_hg_mit.png", clip: feld });
    await page.evaluate((m) => { document.querySelector(`[${m}]`).style.visibility = "hidden"; }, marke);
    await page.waitForTimeout(160);
    await page.screenshot({ path: "/tmp/gg_hg_ohne.png", clip: feld });
    await page.evaluate((m) => { document.querySelector(`[${m}]`).style.visibility = ""; }, marke);
    await page.waitForTimeout(120);
    const zeile = execSync("python3 -c \"from PIL import Image, ImageChops; a=Image.open('/tmp/gg_hg_mit.png').convert('RGB'); b=Image.open('/tmp/gg_hg_ohne.png').convert('RGB'); d=ImageChops.difference(a,b); px=list(d.getdata()); print(max(max(p) for p in px), sum(1 for p in px if max(p)>3))\"",
      { encoding: "utf8" }).trim();
    const [max, flaeche] = zeile.split(/\s+/).map(Number);
    ok(`${name} malt wirklich Pixel (groesster Unterschied ${max}, ${flaeche} Pixel)`, max >= 12 && flaeche >= 2000);
  }
}
const deckungen = [...new Set(gemessen.map((g) => g.deckung))];
ok(`die Kulisse ist deutlich zu sehen, aber nicht ueber der Figur (Deckung ${deckungen.join("/")})`, deckungen.every((d) => Number(d) >= 0.5 && Number(d) < 1));
const masse = gemessen[0] ? `${gemessen[0].w}x${gemessen[0].h}` : "-";
console.log(`  (Kachelmass der ersten Kulisse: ${masse} px)`);
await page.screenshot({ path: "/mnt/user-data/outputs/hofstaat-kulissen.png", fullPage: false });
await page.evaluate(() => document.querySelector('img[data-kulisse="meister-hetzer"]')?.scrollIntoView({ block: "center" }));
await page.waitForTimeout(400);
await page.screenshot({ path: "/mnt/user-data/outputs/hofstaat-kulissen-2.png", fullPage: false });
/* ── v1.23.6: DER SCHIMMER TRAEGT DIE FARBE DER FIGUR ─────────────────────
   Besitzer: "es ist ja immer so ein Schimmer hinter den Figuren - nimm dafuer
   bitte auch die Farbe, die du fuer das Emblem holst." Geprueft wird am
   geoeffneten Blatt: der Schein darf nicht mehr bei allen derselbe sein. */
{
  const toene = [];
  for (const name of ["Springer", "König", "Dame"]) {
    await page.evaluate((n) => {
      const k = [...document.querySelectorAll("[data-kopf]")].map((x) => x.parentElement)
        .find((x) => (x.textContent || "").includes(n));
      if (k) { k.scrollIntoView({ block: "center" }); k.click(); }
    }, name);
    await page.waitForTimeout(900);
    const f = await page.evaluate(() => {
      /* v1.24.2: der Schimmer sitzt im Blatt jetzt auf dem KASTEN um Bild und
         Band (damit das Band mitleuchtet), nicht mehr auf dem Bild selbst -
         gemessen wird deshalb der naechste Traeger des Filters. */
      const traeger = (i) => /drop-shadow/.test(getComputedStyle(i).filter) ? i : (i.parentElement && /drop-shadow/.test(getComputedStyle(i.parentElement).filter) ? i.parentElement : null);
      const bilder = [...document.querySelectorAll("img")].map(traeger).filter(Boolean);
      const gross = bilder.map((i) => ({ b: i.getBoundingClientRect().width, f: getComputedStyle(i).filter }))
        .filter((x) => x.b > 90).sort((a, b) => b.b - a.b)[0];
      return gross ? gross.f.match(/rgba?\([^)]+\)/)?.[0] || gross.f.slice(0, 40) : null;
    });
    if (f) toene.push(`${name}:${f}`);
    await page.keyboard.press("Escape");
    await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "close"); if (x) x.click(); });
    await page.waitForTimeout(500);
  }
  const eindeutig = [...new Set(toene.map((t) => t.split(":")[1]))];
  ok(`der Schimmer traegt die Farbe der Figur (${toene.join(" · ") || "nichts gemessen"})`, toene.length >= 2 && eindeutig.length >= 2);
}
console.log(`\nRESULT: ${passed} passed, ${failed} failed`);
if (fehler.length) console.log("SEITENFEHLER:", fehler);
await browser.close(); srv.close();
if (failed || fehler.length) process.exit(1);
