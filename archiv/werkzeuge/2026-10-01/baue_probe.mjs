/* Das neue Stationsfenster auf das ECHTE Kartenfoto legen - um zu sehen, ob
   ein dunkles Fenster ueber der hellen Landkarte trägt. */
import fs from "node:fs"; import path from "node:path";
const html = fs.readFileSync("/mnt/user-data/outputs/entwurf-stationsfenster.html", "utf8")
  /* nur das zweite Blatt (Bannerhoehe), ohne Seitenrand und ohne Marken */
  .replace(/body\{[^}]*\}/, "body{background:transparent;margin:0;padding:0;font-family:system-ui,sans-serif;color:#f0e9d8}")
  .replace(/<div class="marke">[\s\S]*?<\/div>\n?/g, "")
  .replace(/\.reihen\{[^}]*\}/, ".reihen{display:block}");
fs.writeFileSync("/tmp/nur_fenster.html", html);
const { chromium } = await import("playwright-core");
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
const p = await (await b.newContext({ viewport: { width: 358, height: 900 }, deviceScaleFactor: 1 })).newPage();
await p.goto("file://" + "/tmp/nur_fenster.html", { waitUntil: "load" });
await p.waitForTimeout(500);
const blaetter = await p.$$(".blatt");
await blaetter[0].screenshot({ path: "/tmp/fenster_A.png", omitBackground: true });
await blaetter[1].screenshot({ path: "/tmp/fenster_B.png", omitBackground: true });
await b.close();
console.log("Fenster gerendert");
