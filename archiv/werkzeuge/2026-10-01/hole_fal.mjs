/* Die fal-Auftragshistorie seitenweise abholen und alle Bildadressen sammeln.
   Nur ein Werkzeug - es schreibt nach /tmp, nichts ins Repo. */
const KEY = process.env.FAL_KEY;
const kopf = { Authorization: "Key " + KEY };
const von = "2026-06-01T00:00:00Z", bis = "2026-09-19T00:00:00Z";
let alle = [];
for (let seite = 1; seite <= 40; seite++) {
  const u = `https://rest.alpha.fal.ai/requests/?start_time=${von}&end_time=${bis}&page=${seite}&size=50`;
  const a = await fetch(u, { headers: kopf });
  if (!a.ok) { console.log("Seite", seite, "->", a.status); break; }
  const d = await a.json();
  const it = d.items || [];
  alle = alle.concat(it);
  if (it.length < 50) break;
}
console.log("Auftraege gesamt:", alle.length);
const bilder = [];
for (const r of alle) {
  const roh = JSON.stringify(r);
  for (const m of roh.matchAll(/https:\/\/[\w.\-]*fal\.media\/[^"\\]+/g)) bilder.push({ url: m[0], zeit: r.queued_at, app: r.app_name || r.application || "" });
}
const eind = [...new Map(bilder.map((b) => [b.url, b])).values()];
console.log("Bildadressen in der Historie:", eind.length);
const apps = {}; for (const r of alle) { const a = r.app_name || r.application || "?"; apps[a] = (apps[a] || 0) + 1; }
console.log("Modelle:", JSON.stringify(apps).slice(0, 300));
require_fs: {
  const fs = await import("node:fs");
  fs.writeFileSync("/tmp/fal_historie.json", JSON.stringify({ auftraege: alle.length, bilder: eind }, null, 1));
}
console.log("erste fuenf:", eind.slice(0, 5).map((b) => b.url.split("/").pop()).join(" "));
