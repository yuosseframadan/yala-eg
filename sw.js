const CACHE = "yala-eg-v4";
const SHELL = ["./", "index.html", "logo.png", "icon-192.png", "icon-512.png", "manifest.json", "products.js"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || u.pathname.endsWith("admin.html")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window"}).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./")));
});
self.addEventListener("periodicsync", e => {
  if (e.tag === "yala-remind") e.waitUntil(self.registration.showNotification("🛍️ وحشتنا في yala-eg", { body: "في عروض ومنتجات جديدة، تعالى شوفها", icon: "icon-192.png", dir: "rtl", lang: "ar" }));
});
