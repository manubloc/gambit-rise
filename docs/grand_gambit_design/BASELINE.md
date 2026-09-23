# Baseline — vor jeder Änderung (Phase 0)

- Datum: 2026-07-29, 07:24 UTC
- Ursprünglicher Branch: `main`
- Baseline-Commit: `1aaa021` (v0.41.2) — identisch mit `origin/main` und mit Produktion (`gambitrise.com/version.json` → 0.41.2)
- Working Tree: sauber, keine uncommitted/untracked Änderungen
- Sicherung: Branch `backup/pre-design-system-v1-20260729-0724` (zeigt auf `1aaa021`)
- Arbeits-Branch: `feature/design-system-v1`
- Werkzeuge: Node v22.22.2, npm 10.9.7, Vite 5.4.21, React 18, Playwright-core + Chromium 1194 (Sandkasten)
- Build: `npm run build` (Vite + PWA-Precache, dist ≈ 39 MB) — **grün**
- Einzeldatei-Build: `npm run build:single` — grün
- Tests: `npm test` → **761 grün, 0 rot, 18 Suiten** (Summenprüfung über RESULT-Zeilen)
- Boot: `node test_boot.mjs` → 3/3 · Fahrt: `node drive3.mjs` → `== KEINE FEHLER ==`
- Bestehende bekannte Fehler vor der Migration: keine offenen Testfehler; offene Produkt-Punkte stehen in `design/UEBERGABE-2026-07-29.md` (Händler, Sprachknopf-Meldung, Online-Rauswurf u. a.) und werden der Migration nicht zugerechnet.
- Baseline-Screenshots: `screenshots/before/` — 12 Stationen × 2 Viewports (320×690, 390×844) + `live-login.png` von gambitrise.com.

## Deploy-Regel dieser Arbeit
Cloudflare Pages baut **nur `main`**. Diese Arbeit wird ausschließlich auf `feature/design-system-v1` committet und gepusht → **kein Deploy, keine Live-Änderung.** `main` bleibt unangetastet auf `1aaa021`.
