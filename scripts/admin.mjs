#!/usr/bin/env node
// Gambit — Admin-Konsole für den Spielserver.
//
//   ADMIN_TOKEN=… node scripts/admin.mjs <ws-url> <befehl> [arg]
//
// Befehle:
//   stats                 Spieler / online / Matches / Backups / Cloud-Punkte
//   list                  Server-Backups auflisten
//   backup                sofort einen Backup-Punkt erzeugen
//   pull <datei>          Backup herunterladen (→ ./<datei>)
//   restore <datei> --yes Server-Daten aus Backup wiederherstellen (Vorsicht!)
//
// Sicherheit: Der Token kommt NUR aus der Umgebungsvariable (taucht nie in
// der Shell-History als Argument auf). Server-seitig gilt: SHA-256 +
// timing-sicherer Vergleich, 5 Fehlversuche → 15 Minuten IP-Sperre,
// Admin ist komplett deaktiviert, solange kein Token (≥ 24 Zeichen) gesetzt ist.
import WebSocket from "ws";
import { writeFileSync } from "fs";

const [url, cmd, arg] = process.argv.slice(2);
const token = process.env.ADMIN_TOKEN || "";
if (!url || !cmd) { console.log("Nutzung: ADMIN_TOKEN=… node scripts/admin.mjs <ws-url> <stats|list|backup|pull|restore> [datei] [--yes]"); process.exit(1); }
if (token.length < 24) { console.error("ADMIN_TOKEN fehlt oder ist zu kurz (mind. 24 Zeichen)."); process.exit(1); }
if (cmd === "restore" && !process.argv.includes("--yes")) {
  console.error(`SICHERHEITSABFRAGE: 'restore ${arg}' überschreibt die LIVE-Daten des Servers.`);
  console.error("Wenn du sicher bist, hänge --yes an. (Vorher wird automatisch ein Backup-Punkt erzeugt.)");
  process.exit(1);
}

const map = { stats: "stats", list: "list", backup: "backupNow", pull: "pull", restore: "restore" };
const ws = new WebSocket(url);
const bail = (m) => { console.error(m); process.exit(1); };
setTimeout(() => bail("Zeitüberschreitung — Server erreichbar? URL korrekt (ws:// bzw. wss://)?"), 8000).unref?.();

ws.on("open", () => ws.send(JSON.stringify({ t: "admin", token, cmd: map[cmd] || cmd, file: arg })));
ws.on("message", (raw) => {
  const m = JSON.parse(raw);
  if (m.t === "error") bail("Server: " + m.error + (m.error === "denied" ? "  (falscher Token?)" : ""));
  if (m.t !== "admin") return;
  if (m.cmd === "stats") console.log(`Spieler ${m.players} · online ${m.online} · Matches ${m.matches} · Backups ${m.backups} · Cloud-Punkte ${m.vaultSnapshots}`);
  else if (m.cmd === "list") { for (const b of m.backups) console.log(`${b.file}  ${(b.size / 1024).toFixed(1)} KB`); if (!m.backups.length) console.log("(noch keine Backups)"); }
  else if (m.cmd === "backupNow") console.log(m.created ? "Backup erzeugt: " + m.created : "Keine Änderungen seit dem letzten Backup.");
  else if (m.cmd === "pull") { writeFileSync(m.file, m.data); console.log("Gespeichert: ./" + m.file); }
  else if (m.cmd === "restore") console.log(`WIEDERHERGESTELLT: ${m.restored} — ${m.players} Spieler im Datenbestand.`);
  ws.close(); process.exit(0);
});
ws.on("error", (e) => bail("Verbindung fehlgeschlagen: " + e.message));
