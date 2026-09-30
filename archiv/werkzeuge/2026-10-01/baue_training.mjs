/* Entwurf: der Teil des Figurenblatts, WO MAN TRAINIERT - die Fähigkeiten
   aufgeklappt, auf der Kulisse, in der Sprache der neuen Kacheln. Kein Spielcode. */
import fs from "node:fs"; import path from "node:path";
const b64 = (p, t) => `data:${t};base64,${fs.readFileSync(p).toString("base64")}`;
const FAM = { schritt:["#123c2a","#0a2418","#6fe0a8","#c8f5dd"], sprung:["#12314e","#0a1d30","#6fc2f0","#cfeaff"],
  schlag:["#4a1420","#2c0a12","#f07a8a","#ffd9de"], riss:["#321a5e","#1d0e3a","#a78bfa","#e6dcff"],
  leben:["#0f3d33","#08241e","#5ad4b0","#c8f7e8"] };
let nr = 0;
const zeichen = (fam, inner, size = 26) => { const [g,t,r,st] = FAM[fam]; const id = "t"+(++nr);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block;flex:0 0 auto"><defs><radialGradient id="${id}" cx="50%" cy="32%" r="75%"><stop offset="0%" stop-color="${g}"/><stop offset="100%" stop-color="${t}"/></radialGradient></defs><circle cx="12" cy="12" r="11" fill="url(#${id})"/><circle cx="12" cy="12" r="11" fill="none" stroke="${r}" stroke-width="1" opacity=".85"/><g fill="none" stroke="${st}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" color="${st}">${inner}</g></svg>`; };
const AB = {
  longleap: ["sprung", `<path d="M5 16c2-7 12-7 14 0"/><path d="M16.6 13.4L19 16l-3.4.6"/><path d="M8 17h1M11 17h1"/>`],
  outrider: ["schritt", `<path d="M7 17l4-4 2 2 4-6"/><path d="M14 9h3v3"/>`],
  teleport: ["riss", `<circle cx="8" cy="12" r="2.6"/><circle cx="16.5" cy="9" r="1.7" opacity=".7"/><path d="M11 11l3-1.4" stroke-dasharray="1.6 1.8"/>`],
};
/* das Zugbild der FÄHIGKEIT: Grundzüge blass, was sie hinzufügt in ihrer Farbe */
const sprung = new Set(["1,2","2,1","2,-1","1,-2","-1,-2","-2,-1","-2,1","-1,2"]);
const neu = new Set(["1,3","3,1","3,-1","1,-3","-1,-3","-3,-1","-3,1","-1,3"]);
let gitter = "";
for (let r = 3; r >= -3; r--) for (let f = -3; f <= 3; f++) {
  const ich = !f && !r, s = sprung.has(`${f},${r}`), n = neu.has(`${f},${r}`);
  const hell = (f + r + 100) % 2 === 0;
  const stil = ich ? "background:linear-gradient(160deg,#e7c877,#b1863c);box-shadow:0 0 5px rgba(231,200,119,.7)"
    : n ? "background:#6fc2f0d8;box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)"
    : s ? "background:rgba(233,197,63,.28)" : hell ? "background:rgba(255,255,255,.05)" : "background:rgba(255,255,255,.02)";
  gitter += `<i style="${stil}"></i>`;
}
const eck = `<svg viewBox="0 0 16 16" width="10" height="10"><path d="M1.5 9.5V5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 5A3.5 3.5 0 0 1 5 1.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M5 1.5H9.5" fill="none" stroke="#e9cf8a" stroke-width=".85" stroke-linecap="round"/><path d="M1.5 12.5c0 1.6 1 2.4 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><path d="M12.5 1.5c1.6 0 2.4 1 2.4 2.4" fill="none" stroke="#e9cf8a" stroke-width="1" stroke-linecap="round" opacity=".8"/><circle cx="4.6" cy="4.6" r="1.05" fill="#e9cf8a"/></svg>`;
const ecken = [[0,"top:2px;left:2px"],[90,"top:2px;right:2px"],[180,"bottom:2px;right:2px"],[270,"bottom:2px;left:2px"]]
  .map(([d,pos]) => `<div style="position:absolute;${pos};transform:rotate(${d}deg);z-index:-1;line-height:0;opacity:.85">${eck}</div>`).join("");

const HTML = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:"Cormorant";src:url(FONT) format("woff2");font-weight:500;font-style:italic}
:root{--gold:#e9cf8a;--ink:#f0e9d8;--dim:#a9a48e;--faint:#837e6f;--linie:#2f2450;--riss:#a78bfa;--rissHell:#c4b5fd}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#07050c;padding:26px;font-family:system-ui,sans-serif;color:var(--ink)}
.marke{font:600 12px/1.4 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);margin-bottom:9px}
.marke small{display:block;letter-spacing:0;text-transform:none;font-weight:400;color:var(--faint);font-size:11px;margin-top:3px}
.blatt{width:370px;border-radius:20px;border:1px solid var(--riss);overflow:hidden;
  box-shadow:0 18px 50px rgba(0,0,0,.6),0 0 26px rgba(139,92,246,.45);
  background:radial-gradient(130% 110% at 50% -10%,rgba(124,58,237,.26) 0%,rgba(26,16,44,.97) 46%,rgba(8,5,14,.99) 100%)}
.rumpf{padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}
.buehne{position:relative;isolation:isolate;border-radius:14px;overflow:hidden;padding:11px 12px 12px;
  border:1px solid rgba(233,207,138,.26);background:linear-gradient(180deg,rgba(20,13,36,.9),rgba(10,7,19,.96))}
.buehne .kul{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%;opacity:.66;z-index:-2}
.buehne .sch{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(8,5,14,.62) 0%,rgba(8,5,14,.34) 50%,rgba(8,5,14,.64) 100%)}
.titel{font:600 10px/1 Georgia,serif;letter-spacing:.14em;text-transform:uppercase;color:#c9b26a;margin-bottom:9px;
  display:flex;align-items:center;gap:7px;text-shadow:0 1px 5px rgba(0,0,0,.9)}
.titel b{margin-left:auto;font:600 10px/1 Georgia,serif;letter-spacing:.06em;color:var(--dim)}
.liste{display:flex;flex-direction:column;gap:7px}
.zeile{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:11px;
  background:rgba(12,8,22,.72);border:1px solid var(--linie)}
.zeile .t{flex:1;min-width:0}
.zeile .t b{display:block;font:700 12.5px/1.25 system-ui,sans-serif;color:var(--ink)}
.zeile .t span{display:block;font-size:10px;color:var(--faint);margin-top:2px}
.zeile .w{font:600 10.5px/1 Georgia,serif;letter-spacing:.06em;color:var(--dim);white-space:nowrap}
.zeile.hat{border-color:rgba(90,212,176,.4)}
.zeile.verhuellt{border-style:dashed;opacity:.62}
.auf{border-radius:13px;border:1px solid rgba(111,194,240,.45);overflow:hidden;
  background:linear-gradient(180deg,rgba(18,49,78,.5),rgba(10,7,19,.8))}
.auf .kopf{display:flex;align-items:center;gap:10px;padding:10px 11px 8px}
.auf .kopf .t b{display:block;font:700 13.5px/1.2 system-ui,sans-serif;color:#cfeaff}
.auf .kopf .t span{display:block;font:600 9.5px/1 Georgia,serif;letter-spacing:.13em;text-transform:uppercase;color:#6fc2f0;margin-top:4px}
.auf .satz{padding:0 11px;font:italic 12px/1.45 Georgia,serif;color:#cec7ab}
.auf .unten{display:flex;gap:11px;padding:10px 11px 11px;align-items:flex-end}
.gitter{display:grid;grid-template-columns:repeat(7,1fr);gap:1.5px;padding:4px;border-radius:8px;width:112px;flex:0 0 auto;
  background:rgba(8,12,22,.6);border:1px solid rgba(255,255,255,.07)}
.gitter i{aspect-ratio:1;border-radius:3px;display:block}
.tat{flex:1;display:flex;flex-direction:column;gap:7px}
.legende{font:italic 9.5px/1.35 Georgia,serif;color:#8a856f}
.lern{padding:11px 14px;border-radius:11px;text-align:center;font:800 13px/1 system-ui,sans-serif;
  background:linear-gradient(172deg,rgba(40,24,72,.97),rgba(14,9,28,.99));color:var(--rissHell);
  border:1px solid var(--riss);box-shadow:0 0 12px rgba(139,92,246,.4);text-shadow:0 0 8px rgba(196,181,253,.8)}
.vergessen{font:400 11.5px/1 system-ui,sans-serif;color:var(--dim);text-decoration:underline;padding-top:3px}
</style>
<div class="marke">C · wo man trainiert — die Fähigkeiten im neuen Gewand
  <small>Der ganze Abschnitt steht auf der Kulisse, mit den Eckverzierungen. Die aufgeklappte Sprosse trägt ihr eigenes Zugbild.</small></div>
<div class="blatt"><div class="rumpf">
  <div class="buehne">
    <img class="kul" src="KUL" alt=""><div class="sch"></div>${ecken}
    <div class="titel">Fähigkeiten <b>2 von 5 · 12 ✧ übrig</b></div>
    <div class="liste">
      <div class="zeile hat">IC_outrider<div class="t"><b>Vorreiter</b><span>Erlernt · Stufe 5</span></div><div class="w" style="color:#5ad4b0">✓</div></div>
      <div class="auf">
        <div class="kopf">IC_longleap<div class="t"><b>Weitsprung</b><span>Sprung · Stufe 3</span></div><div class="w" style="color:#e9cf8a;font-weight:700">4 ✧</div></div>
        <div class="satz">„Zusätzliche, weitere Springer-Sprünge — er setzt über zwei Reihen statt über eine.“</div>
        <div class="unten">
          <div class="gitter">GITTER</div>
          <div class="tat">
            <div class="legende">Blau: was diese Fähigkeit hinzufügt · Blass: die Grundzüge</div>
            <div class="lern">Freischalten · 4 ✧</div>
          </div>
        </div>
      </div>
      <div class="zeile">IC_teleport<div class="t"><b>Blinzeln</b><span>Riss · Teleportiert 1× in die Nähe.</span></div><div class="w">Stufe 6</div></div>
      <div class="zeile verhuellt"><div class="t" style="font:600 11px/1 Georgia,serif;letter-spacing:.06em;color:#a9a28a">SCHLOSS Stufe 8 · noch verhüllt</div></div>
      <div class="zeile verhuellt"><div class="t" style="font:600 11px/1 Georgia,serif;letter-spacing:.06em;color:#a9a28a">SCHLOSS Stufe 9 · noch verhüllt</div></div>
    </div>
    <div class="vergessen">↺ Vergessen · 1 Trank im Lager</div>
  </div>
</div></div>`;

let html = HTML.replaceAll("FONT", b64("public/fonts/cormorant-500i.woff2", "font/woff2"))
  .replaceAll("KUL", b64("src/app/ui/assets/kulissen/bund-geleit.webp", "image/webp"))
  .replaceAll("GITTER", gitter)
  .replaceAll("SCHLOSS", `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a9a28a" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;margin-right:5px"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`);
for (const [k, [f, g]] of Object.entries(AB)) while (html.includes("IC_" + k)) html = html.replace("IC_" + k, zeichen(f, g, 26));
fs.writeFileSync("/mnt/user-data/outputs/entwurf-training.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 430, height: 700 }, deviceScaleFactor: 3 })).newPage();
await p.goto("file://" + path.resolve("/mnt/user-data/outputs/entwurf-training.html"), { waitUntil: "load" });
await p.waitForTimeout(500);
await p.screenshot({ path: "/mnt/user-data/outputs/entwurf-training.png", fullPage: true });
await b.close();
