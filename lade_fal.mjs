/* Alle Bilder der fal-Historie herunterladen - nach /tmp, nichts ins Repo. */
import fs from "node:fs";
const d = JSON.parse(fs.readFileSync("/tmp/fal_historie.json", "utf8"));
let ok = 0, fehl = 0;
for (const [i, b] of d.bilder.entries()) {
  /* 91 der 186 Eintraege haben keinen Zeitstempel - der Dateiname der Quelle
     traegt bei vielen dafuer die Figur im Klartext (…_r-pawn.webp). */
  const zeit = (b.zeit || "ohne-zeit").slice(0, 19).replace(/[:T]/g, "-");
  const name = String(i).padStart(3, "0") + "_" + zeit + "_" + b.url.split("/").pop();
  const ziel = "/tmp/fal/" + name;
  if (fs.existsSync(ziel)) { ok++; continue; }
  try {
    const a = await fetch(b.url);
    if (!a.ok) { fehl++; continue; }
    fs.writeFileSync(ziel, Buffer.from(await a.arrayBuffer()));
    ok++;
  } catch { fehl++; }
}
console.log("geladen:", ok, "| fehlgeschlagen:", fehl);
