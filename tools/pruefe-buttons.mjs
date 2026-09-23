// Wacht ueber EINE Regel, die der Besitzer nie wieder brechen sehen will:
// Knoepfe tragen DUENNE Konturen (hoechstens 1px) und KEINE plastischen
// Innenkanten. Kein 3D-Rahmen, kein eingelassener Schein, keine Doppelkontur -
// weder auf goldenen noch auf dunklen Knoepfen.
//
//   node tools/pruefe-buttons.mjs      -> "== KNOEPFE SAUBER ==" oder Fundliste
//
// Geprueft wird der Quelltext, weil dort die Stile stehen; jeder <button ...>
// samt seines style={{...}} wird gelesen, dazu die zentralen Bausteine.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const dateien = [];
(function sammle(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) { if (e !== "node_modules") sammle(p); }
    else if (/\.(jsx|js)$/.test(e)) dateien.push(p);
  }
})("src");

const funde = [];

// Innenkanten, die Plastik erzeugen: "inset ... 0 rgba(hell)" als Lichtkante
// oder "inset 0 0 0 Npx" als zweite Kontur. Ein reiner Innenschatten zur
// Tiefe (z.B. auf Brettfeldern) ist erlaubt - Knoepfe aber tragen gar keinen.
const istLichtkante = (s) => /inset\s+[-\d.]+(px)?\s+[-\d.]+(px)?\s+[-\d.]+(px)?(\s+[-\d.]+(px)?)?\s+(rgba\(\s*(1[5-9][0-9]|2[0-9][0-9])|#[def])/i.test(s);
const istZweitkontur = (s) => /inset\s+0\s+0\s+0\s+[\d.]+px/.test(s);

for (const f of dateien) {
  const txt = readFileSync(f, "utf8");
  const zeilen = txt.split("\n");

  // 1) Jeder <button ...> mit seinem Stilblock (bis zum schliessenden >)
  let i = 0;
  while ((i = txt.indexOf("<button", i)) !== -1) {
    let e = i, tiefe = 0;
    for (; e < txt.length; e++) {
      const c = txt[e];
      if (c === "{") tiefe++;
      else if (c === "}") tiefe--;
      else if (c === ">" && tiefe === 0) break;
    }
    const block = txt.slice(i, e);
    const nr = txt.slice(0, i).split("\n").length;
    const dick = block.match(/border(?:Width)?:\s*`?([2-9](?:\.\d+)?)px/);
    if (dick) funde.push(`${f}:${nr} Knopf mit ${dick[1]}px-Kontur`);
    if (istLichtkante(block)) funde.push(`${f}:${nr} Knopf mit plastischer Innen-Lichtkante`);
    if (istZweitkontur(block)) funde.push(`${f}:${nr} Knopf mit zweiter Kontur (inset 0 0 0 Npx)`);
    i = e;
  }

  // 2) Die zentralen Bausteine (Button/Chip/Pill) - dort wirkt ein Fehler ueberall
  zeilen.forEach((z, k) => {
    if (!/(primary|ghost|danger|subtle|chip|pill|Btn)\s*:/i.test(z)) return;
    if (istLichtkante(z)) funde.push(`${f}:${k + 1} Knopf-Baustein mit plastischer Innen-Lichtkante`);
    const d = z.match(/border(?:Width)?:\s*`?([2-9](?:\.\d+)?)px/);
    if (d) funde.push(`${f}:${k + 1} Knopf-Baustein mit ${d[1]}px-Kontur`);
  });
}

// v0.38.4: EINE WORTMARKE. Login und Spielstaende zeigten verschiedene
// Schriften - das darf nie wieder auseinanderlaufen.
{
  const L = readFileSync("src/app/ui/screens/LoginScreen.jsx", "utf8");
  /* v1.43.0: die Wortmarke ist ein SVG (WortmarkeRise) und steht an DREI
     Stellen gleich: Anmeldeschirm, Vorlader und der feste Ladeschirm in
     index.html. Geprueft wird, dass keine der drei ausschert. */
  const V = readFileSync("src/app/ui/Vorlader.jsx", "utf8");
  const H = readFileSync("index.html", "utf8");
  if (!L.includes("<WortmarkeRise")) funde.push("Wortmarke im Login nicht gefunden");
  if (!V.includes("<WortmarkeRise")) funde.push("Wortmarke im Vorlader nicht gefunden");
  if (!/aria-label="Gambit Rise"/.test(H)) funde.push("Wortmarke im festen Ladeschirm nicht gefunden");
  if (!/ggRiseZug/.test(H) || !/ggRiseZug/.test(readFileSync("src/app/ui/theme.js", "utf8")))
    funde.push("das gezeichnete Rise fehlt in einem der beiden Ladeschirme");
}


// v0.39.2: Die Schaufensterseite muss die WIRKLICHEN Zahlen nennen - sie
// sprach noch von "zehn Ligen" und 26 Helden, obwohl es zwoelf Kapitel und
// 27 Helden sind. Und die Rechtstexte muessen abdecken, was der Code tut.
{
  const land = readFileSync("public/landing.html", "utf8");
  if (/\bLigen?\b|zehn Ligen/.test(land)) funde.push("Landingpage nennt noch Ligen statt Kapitel");
  if (/26 Helden/.test(land)) funde.push("Landingpage nennt eine veraltete Heldenzahl");
  const dat = readFileSync("public/privacy.html", "utf8");
  const nut = readFileSync("public/terms.html", "utf8");
  const pushImCode = readFileSync("src/app/ui/screens/OnlineScreen.jsx", "utf8").includes("pushManager");
  if (pushImCode && !/Push-Endpunkt|Benachrichtigung/.test(dat))
    funde.push("Push laeuft im Code, fehlt aber in der Datenschutzerklaerung");
  if (!/Faires Spiel|Fair/.test(nut)) funde.push("Nutzungsbedingungen ohne Fair-Play-Regel fuer den Mehrspieler-Betrieb");
  for (const [name, txt] of [["Datenschutz", dat], ["Nutzungsbedingungen", nut]]) {
    const nrs = [...txt.matchAll(/<h2>(\d+)\. /g)].map((m) => +m[1]);
    for (let i = 0; i < nrs.length; i++) if (nrs[i] !== i + 1) { funde.push(`${name}: Nummerierung springt bei ${nrs[i]}`); break; }
  }
}


// v0.39.6: Segmented liest o.value - wer Optionen mit o.id uebergibt, baut
// einen Schalter, der sich NICHT umstellen laesst (so geschehen bei
// Sichtbarkeit und Startverbindung).
for (const f of dateien) {
  const txt = readFileSync(f, "utf8");
  if (/<Segmented/.test(txt) && /options=\{\[\{ id:/.test(txt))
    funde.push(`${f}: Segmented mit o.id statt o.value - der Schalter laesst sich nicht umstellen`);
}


// v0.40: Der Soundtrack braucht einen Lader - esbuild kennt .mp3 nicht von
// selbst und bricht mit --log-level=silent STILL ab, wodurch ganze Suiten
// unbemerkt ausfallen (genau so geschehen beim Einbau).
{
  const pkg = readFileSync("package.json", "utf8");
  const audioImport = /\.mp3"/.test(readFileSync("src/app/ui/Soundtrack.jsx", "utf8"));
  for (const m of pkg.matchAll(/"(\w+)": "([^"]*esbuild[^"]*)"/g)) {
    if (audioImport && /--loader:\.webp/.test(m[2]) && !/--loader:\.mp3/.test(m[2]))
      funde.push(`package.json: Skript \"${m[1]}\" hat keinen mp3-Lader - esbuild bricht dort still ab`);
  }
}

if (funde.length) {
  console.log("KNOPF-BEFUNDE:\n" + funde.map((f) => "  - " + f).join("\n"));
  process.exit(1);
}
console.log("== KNOEPFE SAUBER ==");
