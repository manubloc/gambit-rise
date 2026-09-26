// Wacht ueber EINE Regel, die der Besitzer nie wieder brechen sehen will:
// Knoepfe tragen DUENNE Konturen (hoechstens 1px) und KEINE plastischen
// Innenkanten. Kein 3D-Rahmen, kein eingelassener Schein, keine Doppelkontur -
// weder auf goldenen noch auf dunklen Knoepfen.
//
//   node tools/pruefe-buttons.mjs      -> "== KNOEPFE SAUBER ==" oder Fundliste
//
// Geprueft wird der Quelltext, weil dort die Stile stehen; jeder <button ...>
// samt seines style={{...}} wird gelesen, dazu die zentralen Bausteine.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
  const V = readFileSync("src/app/ui/Vorlader.jsx", "utf8");
  const H = readFileSync("index.html", "utf8");
  const LP = readFileSync("public/landing.html", "utf8");
  /* v1.77.0 (Besitzer): das Logo ist jetzt ein geliefertes BILD. Es steht an
     ZWEI Stellen - Anmeldeschirm und Landingpage - und ueberall dasselbe.
     Der Ladeschirm zeigt nur das kreisende Siegel, ohne Schriftzug: dort war
     beides zusammen zu viel. Geprueft wird genau das. */
  if (!L.includes('src={wortmarkeBild}')) funde.push("das Logo fehlt im Anmeldeschirm");
  if (!LP.includes('class="wortmarke" src="/landing/wortmarke.webp"')) funde.push("das Logo fehlt auf der Landingpage");
  if (V.includes("WortmarkeRise") || V.includes("wortmarkeBild")) funde.push("der Vorlader traegt einen Schriftzug - dort gehoert nur das Siegel hin");
  if (/aria-label="Gambit Rise"/.test(H) || H.includes("<!--WORTMARKE-->")) funde.push("der feste Ladeschirm traegt einen Schriftzug");
  for (const [datei, pfad] of [["Landingpage", "public/landing/wortmarke.webp"], ["App", "src/app/ui/assets/wortmarke.webp"]])
    if (!existsSync(pfad)) funde.push(`das Logobild fuer die ${datei} fehlt (${pfad})`);

  /* v1.78.0 (Besitzer): der erste Schirm der Landingpage ist bildschirm-
     fuellend - Hallengrund mit den Schachfeldern, Logo, darunter die
     Figurenreihe auf der Unterkante. Alle drei Stuecke muessen da sein, und
     jedes Figurenbild muss wirklich im Baum liegen: ein fehlendes Bild faellt
     sonst erst live auf, weil die Reihe einfach eine Luecke bekommt. */
  if (!/min-height:100svh/.test(LP)) funde.push("der erste Schirm der Landingpage ist nicht mehr bildschirmfuellend");
  if (!LP.includes('class="halle"')) funde.push("der Hallengrund mit den Schachfeldern fehlt auf der Landingpage");
  if (!LP.includes('class="hofreihe"')) funde.push("die Figurenreihe fehlt auf dem ersten Schirm der Landingpage");
  for (const m of LP.matchAll(/src="\/landing\/(held-[a-z0-9-]+\.webp)"/g))
    if (!existsSync("public/landing/" + m[1])) funde.push(`Figurenbild fehlt: public/landing/${m[1]}`);
  if (!existsSync("public/landing/menue-boden.webp")) funde.push("public/landing/menue-boden.webp fehlt");
}

/* v1.79.0 (Besitzerbefund aus einem Bildschirmfoto): "Er ist NICHT deine
   E-Mail und laesst sich jederzeit im Profil aendern." - die deutschen
   Spieltexte trugen die Behelfsschreibung ae/oe/ue statt echter Umlaute.
   Das faellt nur dem auf, der es liest, und stand seit Monaten im ersten
   Schirm, den ein neuer Spieler sieht. Ab jetzt faellt es HIER auf.
   Geprueft werden nur ZEICHENKETTEN: Kommentare und Bezeichner duerfen
   weiter ASCII bleiben, das ist im Haus so vereinbart. */
{
  const BEHELF = ["aendern","aenderbar","geaendert","Anfaenger","anfuegen","Bestaetigung",
    "Einfuegen","endgueltig","Endgueltig","frueher","geloescht","geoeffnet","Geraet","Geraete",
    "Haelfte","kuenftig","laesst","loeschen","Loeschen","loescht","Loescht","pruefen",
    "rueckgaengig","spaeter","Spielstaende","Spielstaenden","Staerke","staerker","wuenschst",
    "wuerfle","moechte","koennen","muessen","waehlen","naechste","moeglich","noetig"];
  const RE = new RegExp("\\b(" + BEHELF.join("|") + ")\\b");
  for (const f of ["src/app/i18n/strings.js", "src/content/lehren.js", "src/content/abilities.js",
                   "src/content/characters.js", "src/content/bosses.js"]) {
    const txt = readFileSync(f, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
    for (const m of txt.matchAll(/"((?:[^"\\\n]|\\.)*)"/g))
      if (RE.test(m[1])) { funde.push(`${f}: deutscher Text ohne Umlaut - "${m[1].slice(0, 60)}"`); break; }
  }

  /* Und die Kapitelzahl: die Texte sprachen von "elf Kapitel", die Kampagne
     liefert zwoelf. Wer die Zahl aendert, muss die Texte mitziehen. */
  const cfg = readFileSync("src/app/config.js", "utf8");
  const max = Number((cfg.match(/VITE_MAX_KAPITEL\) \|\| (\d+)/) || [])[1] || 0);
  if (max !== 12) funde.push("MAX_KAPITEL ist nicht mehr 12 - die Texte unten pruefen");
  for (const f of ["src/app/i18n/strings.js", "src/content/lehren.js"]) {
    const t = readFileSync(f, "utf8");
    if (/\belf Kapitel\b|\beleven chapters\b/.test(t))
      funde.push(`${f}: nennt elf Kapitel, die Kampagne hat zwoelf`);
  }
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
