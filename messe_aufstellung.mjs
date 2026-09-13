// Misst die Figurenwahl in der Aufstellung: erscheint die Wischreihe, sind die
// Karten da, laesst sich waagerecht scrollen?
import { chromium } from "playwright-core";
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { extname, join } from "node:path";
const MIME = { ".html":"text/html",".js":"text/javascript",".css":"text/css",".webp":"image/webp",".png":"image/png",".json":"application/json",".jpg":"image/jpeg",".svg":"image/svg+xml",".ico":"image/x-icon",".webm":"audio/webm",".mp3":"audio/mpeg",".woff2":"font/woff2" };
const srv = createServer((q,r)=>{ let p=join("dist", decodeURIComponent(q.url.split("?")[0])); if(!existsSync(p)||p.endsWith("/")) p=join("dist","index.html");
  try { r.writeHead(200,{"Content-Type":MIME[extname(p)]||"application/octet-stream"}); r.end(readFileSync(p)); } catch { r.writeHead(404); r.end(); } });
await new Promise(r=>srv.listen(0,r));
const port = srv.address().port;
const b = await chromium.launch({ executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox"] });
const page = await b.newPage({ viewport:{width:412,height:915} });
const fehler = [];
page.on("pageerror", (e) => fehler.push(String(e).slice(0,140)));
const klick = async (w) => page.evaluate((x)=>{ const q=[...document.querySelectorAll("button")].find(t=>(t.textContent||"").includes(x)); if(q){q.click();return true;} return false; }, w);
/* Der Navigationsreiter unten traegt GENAU sein Wort - "Die Akademie" traegt
   "Regeln, Figuren..." in der Beschreibung und wurde sonst zuerst getroffen. */
const reiter = async (w) => page.evaluate((x)=>{ const q=[...document.querySelectorAll("button")].filter(t=>(t.textContent||"").trim()===x); if(q.length){q[q.length-1].click();return true;} return false; }, w);
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil:"networkidle" });
await page.waitForTimeout(1300);
await klick("Erstellen"); await page.waitForTimeout(700);
await page.locator("input[type=email]").fill("auf@probe.local");
await page.locator("input[type=password]").fill("Probe12345!");
await klick("Konto erstellen"); await page.waitForTimeout(2600);
await klick("Neuer Spielstand"); await page.waitForTimeout(2600);
for (let i=0;i<8;i++){ const w=await page.evaluate(()=>{const q=[...document.querySelectorAll("button")].find(t=>/Weiter|Los geht|Überspringen|Skip|Verstanden|Beginnen/i.test(t.textContent||"")); if(!q)return false; q.click(); return true;}); if(!w)break; await page.waitForTimeout(600); }
const knoepfe = await page.evaluate(()=>[...document.querySelectorAll("button")].map(b=>(b.textContent||"").trim().slice(0,22)).filter(Boolean));
console.log("Knoepfe:", JSON.stringify(knoepfe.slice(0,14)));
/* Die Hinterreihe ist gesperrt, bis man die erste Figur gewonnen hat - ein
   frisches Profil kann sie gar nicht antippen. Also freischalten wie in
   messe_hofstaat, sonst misst man nur die Sperre. */
await page.evaluate(() => {
  const patch = (roh) => {
    const p = JSON.parse(roh);
    p.gold = 9000; p.sp = 60;
    p.unlocked = ["gambit","pawn","knight","bishop","rook","queen","king","hawk","amazon","archbishop","chancellor"];
    p.cleared = p.cleared || {};
    return JSON.stringify(p);
  };
  for (const k of Object.keys(localStorage)) {
    try { const o = JSON.parse(localStorage.getItem(k));
      if (o && typeof o === "object" && "gold" in o) localStorage.setItem(k, patch(localStorage.getItem(k)));
    } catch {}
  }
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2400);
/* nach dem Neustart steht die Spielstandwahl - wieder hineingehen */
await klick("Spielstand 1"); await page.waitForTimeout(2200);
for (let i=0;i<6;i++){ const w=await page.evaluate(()=>{const q=[...document.querySelectorAll("button")].find(t=>/Weiter|Los geht|Verstanden|Beginnen/i.test(t.textContent||"")); if(!q)return false; q.click(); return true;}); if(!w)break; await page.waitForTimeout(600); }
await reiter("Figuren"); await page.waitForTimeout(1700);
const k2 = await page.evaluate(()=>[...document.querySelectorAll("button")].map(b=>(b.textContent||"").trim().slice(0,18)).filter(Boolean).slice(0,12));
console.log("im Figuren-Tab:", JSON.stringify(k2));
await klick("Verstanden"); await page.waitForTimeout(900);
await reiter("Aufstellung"); await page.waitForTimeout(1800);
await klick("Verstanden"); await page.waitForTimeout(800);
const vorher = await page.evaluate(()=>({ text: document.body.innerText.slice(0,110).replace(/\n/g," | ") }));
console.log("Bildschirm:", vorher.text);
// einen Platz der Hinterreihe antippen
const getippt = await page.evaluate(async () => {
  const kand = [...document.querySelectorAll("div,button")].filter(d=>{
    const r=d.getBoundingClientRect();
    return r.width>30 && r.width<120 && r.height>30 && r.height<140 && d.querySelector("img,svg");
  });
  if (!kand.length) return 0;
  /* die Plaetze der HINTERREIHE liegen oben im Brettbild - die Bauernreihe
     darunter ist fest. Wir tippen mehrere durch, bis sich etwas oeffnet. */
  for (const d of kand.slice(0, 12)) {
    d.click(); await new Promise(r=>setTimeout(r,600));
    const auf = [...document.querySelectorAll("div")].some(x=>{
      const s=getComputedStyle(x); return s.overflowX==="auto" && s.display==="flex" && x.children.length>2; });
    if (auf) return "Reihe offen nach Klick auf Kandidat "+kand.indexOf(d);
  }
  return "keine Reihe nach 12 Versuchen ("+kand.length+" Kandidaten)";
});
console.log("antippbare Plaetze:", getippt);
const reihe = await page.evaluate(()=>{
  /* v1.2.1: passt ALLES auf die Karte? Wir messen, ob der Inhalt die Karte
     ueberragt - genau das war der Befund ("mach es so, dass schon alles von
     der Karte drauf passt"). */
  const r = [...document.querySelectorAll("div")].find(d=>{
    const s=getComputedStyle(d);
    return s.overflowX==="auto" && s.display==="flex" && d.children.length>2;
  });
  if (!r) return { da:false };
  const k=[...r.children].map(c=>{const q=c.getBoundingClientRect(); return {w:Math.round(q.width),h:Math.round(q.height)};});
  const erste = r.children[0];
  const innen = erste ? [...erste.children].reduce((a,c)=>a+c.getBoundingClientRect().height,0) : 0;
  const aussen = erste ? erste.getBoundingClientRect().height : 0;
  return { da:true, karten:k.length, scrollBreite:r.scrollWidth, sichtbar:Math.round(r.getBoundingClientRect().width),
    karte:k[0], inhalt:Math.round(innen), rahmen:Math.round(aussen), passt: innen <= aussen + 2 };
});
console.log("Wischreihe:", JSON.stringify(reihe));
console.log(fehler.length? "SEITENFEHLER: "+fehler.join(" | ") : "keine Seitenfehler");
await b.close(); srv.close();
