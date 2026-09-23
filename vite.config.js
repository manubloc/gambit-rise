import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
const GG_VERSION = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")).version;
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import pkg from "./package.json";

// base: "./" makes the build portable (Cloudflare/GitHub Pages, itch.io,
// any subfolder, TWA/Capacitor wrapper).
export default defineConfig({
  // ONE define block. There used to be two `define:` keys in this object —
  // the second silently replaced the first (last key wins in a JS object
  // literal), so __GG_VERSION__ never reached the build and the Login and
  // Saves screens showed "vdev" in production.
  define: {
    __GG_VERSION__: JSON.stringify(GG_VERSION),
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  /* v1.0.36 (Leistungsmessung): DIE INLINE-GRENZE LAG BEI 400 KB. Alles
     darunter wanderte als base64 ins JS-Buendel - gemessen 1,71 MB in 58
     Dateien, also 61 % des Buendels, darunter drei JPEGs von zusammen 1 MB.
     Das kostet doppelt: base64 traegt ein Drittel Ballast, UND der Browser
     muss die ganze Fracht parsen, ehe die erste Zeile Programm laeuft; die
     Bilder liegen dann im JS statt im Bildspeicher und lassen sich nicht
     einzeln zwischenspeichern.
     Jetzt 4 KB, die uebliche Grenze: winzige Symbole bleiben eingebettet
     (ein eigener Abruf kostete mehr, als er spart), alles andere wird eine
     Datei, die parallel und cachebar geladen wird. Der Einzeldatei-Bau
     (build:single) ist davon unberuehrt - der packt mit esbuild und eigenen
     dataurl-Ladern, nicht ueber diese Regel. */
  build: { assetsInlineLimit: (file, content) => file.endsWith(".webp") ? false : content.length < 4 * 1024 },
  base: "./",
  plugins: [
    react(),
    // version.json next to the bundle: the deployed truth. The profile
    // fetches it with cache "no-store" and compares against __APP_VERSION__ —
    // that is the version check that tells stale service-worker builds apart
    // from a deploy that never happened. Not precached (json is outside the
    // workbox glob), so it can never lie from the cache.
    {
      name: "gg-version-json",
      apply: "build",
      generateBundle() {
        this.emitFile({ type: "asset", fileName: "version.json",
          source: JSON.stringify({ version: pkg.version, builtAt: new Date().toISOString() }) });
      },
    },
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // registration lives in main.jsx (update loop + auto-reload)
      includeAssets: ["favicon.ico", "favicon.svg", "og.png", "landing.html", "privacy.html", "terms.html", "robots.txt"],
      manifest: {
        name: "Gambit Rise",
        short_name: "Gambit Rise",
        description: "Schach, das Charaktere erhebt — ein Taktik-Abenteuer. Chess that levels up.",
        lang: "de",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        /* v1.0.12 (Vorlader): das Hauptbuendel traegt jetzt auch die kleinen
           UI-Bilder inline und liegt ueber den 2 MiB Workbox-Standard - der
           Service Worker soll es trotzdem vorhalten, genau darum geht es. */
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        // WEBP is deliberately NOT precached: during a deploy an asset can be
        // referenced by the fresh JS bundle a moment before its own file has
        // finished uploading — the host then answers with the SPA fallback
        // page, status 200, and Workbox would store that HTML under the
        // image's URL. The picture is then permanently broken for that visitor
        // (it "loads" but never decodes). Images are cached at runtime instead,
        // and ONLY when the response really is an image.
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,woff2}"],
        globIgnores: ["**/painted-*"], skipWaiting: true, clientsClaim: true,
        // web push lives in its own small file, pulled into the generated sw.
        // Its hash sits in the precache manifest, so editing it rolls a normal
        // sw update — the stuck-update escape in main.jsx keeps working.
        importScripts: ["push-sw.js"],
        runtimeCaching: [{
          urlPattern: ({ request, url }) => request.destination === "image" || /\.webp$/.test(url.pathname),
          handler: "CacheFirst",
          options: {
            cacheName: "gg-images",
            expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 60 },
            cacheableResponse: { statuses: [200] },
            plugins: [{
              // the guard: an HTML fallback never enters the image cache
              cacheWillUpdate: async ({ response }) => {
                const ct = response.headers.get("content-type") || "";
                return ct.startsWith("image/") ? response : null;
              },
            }],
          },
        }],
      },
    }),
  ],
});
