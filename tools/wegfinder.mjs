// Sucht den Weg vom Start bis auf ein Brett und protokolliert jeden Schritt.
import { chromium } from "playwright-core";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(process.env.ZIEL || "https://gambitrise.com/", { waitUntil: "load" });
await page.waitForTimeout(3000);

async function lage(marke) {
  const d = await page.evaluate(() => {
    const knoepfe = [...document.querySelectorAll("button")]
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 34))
      .filter(Boolean);
    const bilder = [...document.querySelectorAll("img")].filter((i) => i.getBoundingClientRect().width > 6).length;
    return { knoepfe: [...new Set(knoepfe)].slice(0, 22), bilder,
      text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 160) };
  });
  console.log(`\n[${marke}] Bilder=${d.bilder}`);
  console.log("  Text:", d.text);
  console.log("  Knoepfe:", JSON.stringify(d.knoepfe));
  return d;
}
async function tippe(text) {
  const l = page.getByText(text, { exact: false }).first();
  if (await l.count()) { await l.click({ timeout: 4000, force: true }).catch(() => {}); await page.waitForTimeout(1100); return true; }
  return false;
}
await lage("Start");
for (const t of ["Als Gast", "Gast", "Los geht", "Weiter", "Verstanden", "Neuer Spielstand", "Neu"]) {
  if (await tippe(t)) await lage("nach: " + t);
}
await browser.close();
