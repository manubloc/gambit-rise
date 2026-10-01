/* ── DIE INHALTSRICHTLINIE (CSP) — v1.90.19, Audit A57 ────────────────────
   Bis v1.90.18 trug die Seite keine Content-Security-Policy. Das Audit
   empfahl, sie zuerst als `Report-Only` auszuliefern: der Browser meldet
   dann, was er blockieren WUERDE, blockiert aber nichts. Diese Datei rechnet
   die Richtlinie aus - an EINER Stelle, damit Bau und Proben dieselbe
   benutzen:

     tools/seite-bauen.mjs   schreibt sie als Report-Only in dist/_headers
                             (Cloudflare liest die Datei beim Ausliefern)
     drive3.mjs,             schicken sie beim lokalen Ausliefern SCHARF mit
     pruefe-navigation.mjs   (Content-Security-Policy). Jede Verletzung ist
                             dann ein Konsolenfehler, und beide Proben werten
                             Konsolenfehler als Absturz. So faellt eine
                             Richtlinie, die das Spiel braeche, schon vor dem
                             Push auf - nicht erst beim Spieler.

   GEMESSEN am 1.10.2026 an gambitrise.com/spielen/ (Claude in Chrome,
   performance.getEntriesByType + Live-Bundle):
     - Skripte: das eigene Buendel, EIN Inline-Skript (Ladeschirm/Fehlerfang
       in index.html), dazu 9 Modul-Skripte von cdn.jsdelivr.net (Supabase,
       seit v1.90.18 auf 2.117.2 angeheftet).
     - Verbindungen: die Halle (wss:// und https://duell.gambitrise.com) und
       das Supabase-Projekt. Sonst nur die eigene Herkunft (210 Abrufe).
     - Bilder, Klang, Schriften: alle von der eigenen Herkunft, dazu data:
       und blob: (Bilder im Code, Dateien zum Speichern). Klang kommt zum Teil
       als data:-Adresse per fetch() - siehe connect-src.
     - kein eval, kein new Function, keine Inline-Ereignisattribute,
       keine iframes; Inline-STILE ja (23 style-Attribute in index.html, 38 in
       der Landingpage, dazu React) - darum style-src 'unsafe-inline'.
     - Landingpage: zwei Inline-Skripte, Play-Abzeichen von play.google.com.

   Inline-Skripte werden NICHT pauschal erlaubt ('unsafe-inline'), sondern
   ueber ihren sha256-Hash - gerechnet aus der gebauten Datei, also immer
   passend. type="application/ld+json" ist kein Skript, sondern Daten, und
   faellt nicht unter die Richtlinie. */
import { createHash } from "node:crypto";

/** sha256-Quellen aller AUSFUEHRBAREN Inline-Skripte einer HTML-Seite */
export function inlineHashes(html) {
  const aus = [];
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const attr = m[1] || "";
    if (/\ssrc\s*=/.test(attr)) continue;
    const typ = (attr.match(/\stype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (typ && !/^(text\/javascript|module|application\/javascript)$/i.test(typ)) continue;
    aus.push(`'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`);
  }
  return [...new Set(aus)];
}

function supabaseHerkunft() {
  const url = process.env.VITE_SUPABASE_URL;
  try { if (url) { const h = new URL(url).host; return [`https://${h}`, `wss://${h}`]; } } catch {}
  return ["https://*.supabase.co", "wss://*.supabase.co"];
}

const zeile = (r) => Object.entries(r).map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k)).join("; ");

/** Richtlinie der App unter /spielen/ */
export function appRichtlinie(html) {
  return zeile({
    "default-src": ["'self'"],
    "script-src": ["'self'", ...inlineHashes(html), "https://cdn.jsdelivr.net"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "media-src": ["'self'", "data:", "blob:"],
    /* data: und blob: GEMESSEN, nicht geraten: die erste Fahrt von drive3 mit
       scharfer Richtlinie meldete 16x "Refused to connect to 'data:video/webm…'".
       Vite legt kleine Klangdateien als data:-Adresse ins Buendel, und der
       Klang laedt sie per fetch() - das zaehlt als Verbindung. Live in den
       Abruflisten des Browsers sieht man das nicht. */
    "connect-src": ["'self'", "data:", "blob:", "https://duell.gambitrise.com", "wss://duell.gambitrise.com",
      ...supabaseHerkunft(), "https://cdn.jsdelivr.net"],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  });
}

/** Richtlinie der Schaufenster-Seiten an der Wurzel (Landing, Datenschutz …) */
export function seitenRichtlinie(...htmls) {
  return zeile({
    "default-src": ["'self'"],
    "script-src": ["'self'", ...new Set(htmls.flatMap(inlineHashes))],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https://play.google.com"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  });
}

/** Die Seiten an der Wurzel, fuer die seitenRichtlinie gilt (Cloudflare-Pfade) */
export const SEITEN = ["/", "/index.html", "/landing", "/landing.html", "/privacy", "/privacy.html",
  "/terms", "/terms.html", "/konto-loeschen", "/konto-loeschen.html"];
