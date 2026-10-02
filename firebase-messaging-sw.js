// Service worker: notificaciones en segundo plano (FCM) + caché para abrir sin conexión.
importScripts("./config.js");
const CFG = self.APP_CONFIG;
const CACHE = "adp-v3";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./main.js",
  "./config.js",
  "./manifest.webmanifest",
  "./assets/edificio.jpg",
  "./assets/plano-A.png",
  "./assets/plano-B.png",
  "./assets/plano-C.png",
  "./icons/icon-192.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Mismo origen: red primero y, si no hay conexión, lo guardado.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});

// Tocar la notificación abre (o enfoca) la app.
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.FCM_MSG?.fcmOptions?.link || self.registration.scope;
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => {
      const w = ws.find((w) => w.url.startsWith(self.registration.scope));
      return w ? w.focus() : clients.openWindow(url);
    })
  );
});

// FCM: los mensajes con "notification" (los de la consola) se muestran solos.
if (!CFG.demo) {
  importScripts(
    `https://www.gstatic.com/firebasejs/${CFG.firebaseSdk}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${CFG.firebaseSdk}/firebase-messaging-compat.js`
  );
  firebase.initializeApp(CFG.firebase);
  firebase.messaging();
}
