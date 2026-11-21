const CACHE = "yala-eg-v6";
const SHELL = ["./", "index.html", "logo.png", "icon-192.png", "icon-512.png", "manifest.json", "products.js", "install.js"];
const NOTE = { icon: "icon-192.png", badge: "icon-192.png", dir: "rtl", lang: "ar" };

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "yala-state").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || /\/(admin|brand|rider)\.html$/.test(u.pathname)) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data.json(); } catch (x) { d = { title: "yala-eg", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "yala-eg", { ...NOTE, body: d.body || "", data: { url: d.url || "./" } }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ("focus" in c) { if ("navigate" in c) c.navigate(url).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});

self.addEventListener("periodicsync", e => {
  if (e.tag === "yala-remind") {
    e.waitUntil(self.registration.showNotification("وحشتنا في yala-eg", { ...NOTE, body: "في عروض ومنتجات جديدة، تعالى شوفها", data: { url: "./#/" } }));
  } else if (e.tag === "yala-cart") {
    e.waitUntil((async () => {
      const c = await caches.open("yala-state"), r = await c.match("state"); if (!r) return;
      const s = await r.json();
      if (s.has && s.cartAt && Date.now() - s.cartAt >= 864e5 && !s.notified) {
        await self.registration.showNotification("سلتك لسه مستنياك في yala-eg", { ...NOTE, body: "كمل طلبك بسرعة والحق العروض قبل ما تخلص", data: { url: "./#/" } });
        s.notified = 1; await c.put("state", new Response(JSON.stringify(s)));
      }
    })());
  }
});
