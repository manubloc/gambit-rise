// GAMBIT — the knock on the closed door.
//
// Loaded into the generated service worker via workbox `importScripts`
// (see vite.config.js), so the update pipeline — precache manifest,
// skipWaiting, the stuck-update kick in main.jsx — stays untouched.
//
// The Hall encrypts a tiny JSON {title, body, tag, url}; a payload-less push
// (the "bare wake-up" the Hall falls back to on broken keys) still shows a
// stock line, because a subscribed browser MUST show something user-visible.

self.addEventListener("push", (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch { /* bare wake-up */ }
  const title = d.title || "Gambit";
  const body = d.body || "Du bist am Zug. / Your move.";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    tag: d.tag || "gg-daily",          // one live notification per game — a newer nudge replaces the old
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    data: { url: d.url || "./" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "./";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
    for (const w of wins) { if ("focus" in w) return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
