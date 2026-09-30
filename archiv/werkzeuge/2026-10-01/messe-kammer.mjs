import { chromium } from "playwright-core";
import { createRequire } from "node:module";
const require0 = createRequire(import.meta.url);
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".png":"image/png",".json":"application/json",".jpg":"image/jpeg",".woff2":"font/woff2",".mp3":"audio/mpeg",".webm":"audio/webm",".svg":"image/svg+xml",".ico":"image/x-icon"};
const srv=createServer((q,r)=>{let p=join("dist",decodeURIComponent(q.url.split("?")[0]));if(p.endsWith("/"))p+="index.html";if(!existsSync(p))p=join("dist","index.html");try{r.writeHead(200,{"Content-Type":MIME[extname(p)]||"application/octet-stream"});r.end(readFileSync(p));}catch{r.writeHead(404);r.end();}});
await new Promise(r=>srv.listen(0,r)); const port=srv.address().port;
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
const b=await chromium.launch({ ...(chromePfad ? { executablePath: chromePfad } : {}), args:["--no-sandbox"] });
const pg=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2})).newPage();
const fehler=[]; pg.on("pageerror",e=>fehler.push(String(e).slice(0,120)));
await pg.goto(`http://127.0.0.1:${port}/`,{waitUntil:"networkidle"});
const klick = async (muster) => pg.evaluate((m) => {
  const b = [...document.querySelectorAll("button")].find((x) => new RegExp(m).test(x.textContent));
  if (b) { b.click(); return true; } return false;
}, muster);
const wegKlicken = async () => { for (let n = 0; n < 8; n++) {
  const hit = await pg.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      ["Los geht's", "Verstanden", "Weiter"].includes(x.textContent.trim()));
    if (b) { b.click(); return true; } return false; });
  if (!hit) return; await pg.waitForTimeout(700);
} };

await pg.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await pg.waitForTimeout(1200);
await klick("Erstellen");
await pg.waitForTimeout(700);
await pg.locator("input[type=email]").fill("messer@probe.local");
await pg.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen");
await pg.waitForTimeout(2500);
await klick("Neuer Spielstand");
await pg.waitForTimeout(2500);
await wegKlicken();

await pg.evaluate(() => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.gold = 9000; p.sp = 60;
    p.unlocked = ["gambit", "pawn", "knight", "bishop", "rook", "queen", "king"];
    /* v1.0.84-Messung: der Gambit auf Rang II (Level 15) - zeigt der Hofstaat
       dann wirklich gambit-t2? Das ist die Frage, die dreimal "behoben"
       wurde, ohne je am lebenden DOM geprueft zu werden. */
    p.pieces = p.pieces || {}; p.pieces.levels = p.pieces.levels || {};
    p.pieces.levels.gambit = 15;
    p.cleared = p.cleared || {};
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    if (k === "gambit:u::profile" || /^gambit:u::save:/.test(k)) {
      try { const o = JSON.parse(localStorage.getItem(k));
        if (o && typeof o === "object" && "gold" in o) localStorage.setItem(k, patch(localStorage.getItem(k)));
      } catch {}
    }
  }
});

await pg.waitForTimeout(1200);
// zum Profil/Schatzkammer
// Wo steckt die Schatzkammer? Alle Reiter absuchen.
for (const reiter of ["LAGER","PROFIL","FIGUREN","SPIELEN"]) {
  await pg.evaluate((r)=>{const b=[...document.querySelectorAll("button")].find(x=>new RegExp(r,"i").test(x.textContent||""));b&&b.click();}, reiter);
  await pg.waitForTimeout(1200);
  const da = await pg.evaluate(()=>/Schatzkammer|Ruhmestaten|Taten/i.test(document.body.innerText));
  if (da) { console.log("Schatzkammer erreichbar ueber:", reiter); break; }
  const knopf = await pg.evaluate(()=>{
    const b=[...document.querySelectorAll("button,div,a")].find(x=>/Schatzkammer|Ruhmestaten/i.test((x.textContent||"").slice(0,40)));
    if(b){b.click();return true;} return false;});
  if (knopf) { await pg.waitForTimeout(1600); console.log("ueber Knopf in:", reiter); break; }
}
await pg.waitForTimeout(1200);
const m=await pg.evaluate(()=>{
  const grid=[...document.querySelectorAll("div")].find(d=>{const st=getComputedStyle(d);return st.display==="grid"&&/repeat\(2/.test(d.getAttribute("style")||"");});
  if(!grid) return {gefunden:false, text:document.body.innerText.slice(0,160)};
  const k=[...grid.children].map(c=>{const r=c.getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height),ueber:Math.round(Math.max(0,r.right-390))};});
  return {gefunden:true, kacheln:k.length, breiten:[...new Set(k.map(x=>x.w))], ueberlauf:Math.max(0,...k.map(x=>x.ueber)), hoehen:[...new Set(k.map(x=>x.h))].slice(0,4)};
});
console.log("Schatzkammer:", JSON.stringify(m));
console.log(fehler.length?("FEHLER: "+fehler.join(" | ")):"keine Seitenfehler");
await b.close(); srv.close();
