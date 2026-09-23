#!/usr/bin/env node
// Ein-Befehl-Deploy: baut das Spiel und pusht dist/ in das (öffentliche)
// Site-Repo, das GitHub Pages ausliefert. Läuft lokal UND aus dem Claude-Chat.
//
//   GH_TOKEN=…  SITE_REPO=deinname/grand-gambit-site  npm run deploy:site
//   optional: SITE_BRANCH (default main), SITE_CNAME (eigene Domain)
//
// Sicherheit: Der Token kommt ausschließlich aus der Umgebung, wird nie
// geloggt und landet nicht in der Git-History (push-URL nur im RAM).
import { execSync } from "child_process";
import { mkdtempSync, writeFileSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const token = process.env.GH_TOKEN || "";
const repo = process.env.SITE_REPO || "";
const branch = process.env.SITE_BRANCH || "main";
const cname = process.env.SITE_CNAME || "";
if (!token || !repo.includes("/")) {
  console.error("Nutzung: GH_TOKEN=… SITE_REPO=user/repo [SITE_BRANCH=main] [SITE_CNAME=domain] npm run deploy:site");
  process.exit(1);
}
const sh = (cmd, opts = {}) => execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], ...opts }).toString().trim();

// 1) frischer Build (pre-hook erzeugt vorher die SVG-Art)
console.log("① build …");
execSync("npm run build", { stdio: "inherit" });

// 2) dist als eigenständigen Commit ins Site-Repo pushen (History bleibt flach)
const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const work = mkdtempSync(join(tmpdir(), "gg-deploy-"));
sh(`git init -q -b ${branch}`, { cwd: work });
sh(`git -C ${work} config user.email "deploy@grand-gambit"`);
sh(`git -C ${work} config user.name "Gambit Deploy"`);
execSync(`cp -r dist/. ${work}/`);
writeFileSync(join(work, ".nojekyll"), "");                 // Pages: assets/_-Ordner nicht filtern
if (cname) writeFileSync(join(work, "CNAME"), cname + "\n");
sh(`git -C ${work} add -A`);
sh(`git -C ${work} commit -q -m "deploy v${version} — ${new Date().toISOString()}"`);
console.log("② push …");
const url = `https://x-access-token:${token}@github.com/${repo}.git`;
execSync(`git -C ${work} push -q --force "${url}" ${branch}`, { stdio: ["ignore", "inherit", "inherit"] });

// 3) Pages aktivieren/prüfen (idempotent) — Quelle: branch root
const api = (method, path, body) => sh(
  `curl -s -o /tmp/gg-api.json -w "%{http_code}" -X ${method} ` +
  `-H "Authorization: Bearer ${token}" -H "User-Agent: gg-deploy" ` +
  `-H "Accept: application/vnd.github+json" ` +
  (body ? `-d '${JSON.stringify(body)}' ` : "") +
  `https://api.github.com/repos/${repo}${path}`);
let code = api("GET", "/pages");
if (code === "404") code = api("POST", "/pages", { source: { branch, path: "/" } });
const info = existsSync("/tmp/gg-api.json") ? JSON.parse(readFileSync("/tmp/gg-api.json", "utf8") || "{}") : {};
const liveUrl = cname ? `https://${cname}/` : (info.html_url || `https://${repo.split("/")[0]}.github.io/${repo.split("/")[1]}/`);
console.log(`③ live (nach ~30–90 s): ${liveUrl}   [v${version}]`);
