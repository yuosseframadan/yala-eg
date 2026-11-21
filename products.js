window.SUPABASE_URL = "https://rsujrvuepaymnreojywf.supabase.co";
window.SUPABASE_KEY = "sb_publishable_ujSZ_okHds1JfYWlZ1fvQw_ulMLkytV";
window.IK_URL = "https://ik.imagekit.io/wz76qvc4n";
window.MAIN_WA = "201092377837";
window.VAPID_PUBLIC = "BIt41-YMObscOIXgaHsGv_obGhGxnB5HsWqMdetrE-CwiMQzZMHaShxn_mGO9nQ3hHEtUV_6DFK2ivp1N3WWbOI";
window.COMMISSION = .05;
window.FIREBASE_CONFIG = { apiKey: "", authDomain: "", projectId: "", appId: "" };
window.AREAS = ["المساكن", "الشرق", "الغرب", "شارع بورسعيد", "المدينة الصناعية", "شارع صلاح دعدور", "شارع السوق", "المقابر"];
window.PLANS = {
  p0: { n: "الباقة التجريبية (لمرة واحدة فقط)", max: 15, fee: 0, rate: .10 },
  p1: { n: "الباقة الأساسية", max: 25, fee: 500, rate: .05 },
  p2: { n: "الباقة المتوسطة", max: 40, fee: 750, rate: .05 },
  p3: { n: "الباقة المتقدمة", max: 60, fee: 1200, rate: .05 },
  p4: { n: "الباقة المفتوحة VIP", max: Infinity, fee: 1500, rate: .05 }
};
window.SPECIAL_RATE = .04;
window.devHash = async () => {
  try {
    let id = localStorage.getItem("yala_dev");
    if (!id) { id = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("yala_dev", id); }
    const raw = [id, navigator.userAgent, navigator.language, screen.width + "x" + screen.height, screen.colorDepth, new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0].join("|");
    const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(h), b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  } catch (e) { return null; }
};
window.busy = async (btn, fn) => {
  if (!btn || btn.dataset.busy === "1") return;
  btn.dataset.busy = "1"; btn.disabled = true;
  try { return await fn(); } finally { setTimeout(() => { btn.dataset.busy = "0"; btn.disabled = false; }, 800); }
};
window.planRate = plan => (PLANS[plan] ? PLANS[plan].rate : COMMISSION);
window.itemRate = (it, plan) => (it && it.rate != null ? +it.rate : planRate(plan));

window.sb = null;
try { if (window.supabase) window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { flowType: "pkce" } }); } catch (x) { console.warn("Supabase init failed", x); }

window.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
// اسم ملف بس (honey.jpg) بيتركّب على ImageKit، ورابط كامل من أي موقع بيتستخدم زي ما هو
window.imgSrc = u => /^(https?:|data:|images\/)/.test(u) ? u : IK_URL + "/" + String(u).replace(/^\/+/, "");
window.waNum = p => { const d = String(p || "").replace(/\D/g, ""); return d.startsWith("0") ? "20" + d.slice(1) : d; };

window.friendly = t => {
  t = String(t == null ? "" : t);
  if (/row-level security|permission denied/i.test(t)) return "مفيش صلاحية للعملية دي. لو انت المالك سجّل خروج وادخل تاني";
  if (/profiles_phone/i.test(t)) return "رقم الموبايل ده مستخدم في حساب تاني";
  if (/already (been )?registered|already exists|duplicate key/i.test(t)) return "البيانات دي مسجّلة قبل كده";
  if (/failed to fetch|networkerror|load failed/i.test(t)) return "مشكلة في الاتصال، جرّب تاني";
  if (/[\u0600-\u06FF]/.test(t)) return t;
  console.error(t);
  return "حصلت مشكلة، حاول تاني";
};
window.edge = async (name, body, token) => {
  try {
    const h = { "Content-Type": "application/json", apikey: SUPABASE_KEY };
    if (token) h.Authorization = "Bearer " + token;
    const r = await fetch(SUPABASE_URL + "/functions/v1/" + name, { method: "POST", headers: h, body: JSON.stringify(body) });
    if (r.status === 404) return { missing: true };
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data: j, error: r.ok ? null : (j.error || "حصلت مشكلة، حاول تاني") };
  } catch (x) { return { missing: true }; }
};
window.signIn = async (sb, id, password) => {
  const r = await edge("login", { id, password });
  if (!r.missing) {
    if (!r.ok) return { error: r.error };
    const { data, error } = await sb.auth.setSession({ access_token: r.data.access_token, refresh_token: r.data.refresh_token });
    return error || !data.user ? { error: "بيانات الدخول غلط" } : { user: data.user };
  }
  if (!id.includes("@")) {
    const q = await sb.rpc("login_email", { p: id });
    if (q.error || !q.data) return { error: "بيانات الدخول غلط" };
    id = q.data;
  }
  const { data, error } = await sb.auth.signInWithPassword({ email: id, password });
  return error ? { error: "بيانات الدخول غلط" } : { user: data.user };
};
window.IC = {
  bike: '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  checkc: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  box: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  cash: '<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  warn: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>',
  note: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  mega: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  print: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
  tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  cup: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9z"/>',
  timer: '<circle cx="12" cy="14" r="8"/><path d="M12 10v4l2 2"/><path d="M9 2h6"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  list: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  dl: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  store: '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>'
};
window.EMO = { "🛵": "bike", "✔": "check", "✅": "checkc", "⏳": "clock", "🛒": "cart", "🔔": "bell", "📦": "box", "🛍": "bag", "💵": "cash", "📍": "pin", "⚠": "warn", "❌": "xc", "✕": "x", "🚚": "truck", "⭐": "star", "📝": "note", "📞": "phone", "❤": "heart", "💛": "heart", "🔄": "refresh", "🔍": "search", "🔥": "flame", "🗑": "trash", "📣": "mega", "📄": "file", "🖨": "print", "☰": "menu", "🔗": "link", "💬": "chat", "⛔": "ban", "🏷": "tag", "✏": "edit", "🏠": "home", "ℹ": "info", "🏆": "cup", "✨": "spark", "⏱": "timer", "👤": "user", "📋": "list", "🔒": "lock", "📲": "dl", "🏪": "store" };
(function () {
  const ANY = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{2604}\u{2607}-\u{27BF}\u{2B50}\u{2B06}\u{2139}\u{23F1}\u{23F3}\u{2705}\u{274C}\u{2728}\u{2764}\u{2715}\u{2630}\u{2714}][\uFE0F]?/gu;
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, OPTION: 1, SELECT: 1, TITLE: 1 };
  const mk = n => { const e = document.createElement("span"); e.className = "ico"; e.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + IC[n] + "</svg>"; return e; };
  function text(n) {
    const t = n.nodeValue;
    if (!t || !ANY.test(t)) { ANY.lastIndex = 0; return; }
    ANY.lastIndex = 0;
    const p = n.parentNode; if (!p || SKIP[p.nodeName]) return;
    const f = document.createDocumentFragment(); let last = 0, m;
    while ((m = ANY.exec(t))) {
      if (m.index > last) f.appendChild(document.createTextNode(t.slice(last, m.index)));
      const k = m[0].replace(/\uFE0F/g, ""), name = EMO[k];
      if (name) f.appendChild(mk(name));
      last = m.index + m[0].length;
      if (t[last] === " " && !name) last++;
    }
    if (last < t.length) f.appendChild(document.createTextNode(t.slice(last)));
    p.replaceChild(f, n);
  }
  function walk(root) {
    if (root.nodeType === 3) return text(root);
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [];
    while (w.nextNode()) a.push(w.currentNode);
    a.forEach(text);
  }
  function go() {
    walk(document.body);
    new MutationObserver(ms => ms.forEach(m => { if (m.type === "characterData") text(m.target); else m.addedNodes.forEach(walk); }))
      .observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  if (document.body) go(); else addEventListener("DOMContentLoaded", go);
})();

const COLS = "id,name,price,old_price,stock,cat,seller,merchant_name,image_url,extra_images,desc,offer_end,merchant_id,merchant_phone,created_at";
window.mapRow = r => {
  const imgs = [r.image_url, ...(r.extra_images || [])].filter(Boolean);
  return { id: r.id, name: r.name, price: +r.price, oldPrice: r.old_price ? +r.old_price : null, stock: r.stock, cat: r.cat || "",
    seller: r.merchant_name || r.seller || "yala-eg", img: imgs[0] || "", imgs, desc: r.desc || "", offerEnd: r.offer_end,
    mid: r.merchant_id, mphone: r.merchant_phone, created: r.created_at };
};
window.loadProducts = async () => {
  if (!window.sb) throw new Error("Supabase غير متصل");
  const { data, error } = await window.sb.from("products").select(COLS).order("id", { ascending: false });
  if (error) throw error;
  return data.map(window.mapRow);
};
window.upd = async (sb, id, patch) => {
  const { data, error } = await sb.from("products").update(patch).eq("id", id).select("id");
  return error ? error.message : (data && data.length ? "" : "مفيش صلاحية");
};
window.PF = {
  ph: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  html(admin) {
    return `<form id="pf"><div class="g">
<div><label>اسم المنتج *</label><input id="p_name" required></div>
<div><label>التصنيف</label><input id="p_cat"></div>
<div><label>السعر الحالي *</label><input id="p_price" type="number" min="0" step="any" required></div>
<div><label>السعر قبل الخصم (لو في خصم)</label><input id="p_old" type="number" min="0" step="any"></div>
<div><label>الكمية *</label><input id="p_stock" type="number" min="0" step="1" required value="1"></div>
<div><label>نهاية العرض (اختياري)</label><input id="p_end" type="datetime-local"></div>
${admin ? `<div><label>التاجر</label><select id="p_mid"></select></div><div><label>أو اسم تاجر يدوي</label><input id="p_mname"></div>` : ""}
</div>
<label>رابط الصورة الأساسية (من أي موقع أو ImageKit)</label><input id="p_img" dir="ltr" placeholder="https://... أو honey.jpg"><img id="p_prev" class="prev" alt="" hidden>
<label>صور إضافية (رابط في كل سطر)</label><textarea id="p_more" rows="2" dir="ltr"></textarea>
<label>الوصف</label><textarea id="p_desc" rows="3"></textarea>
<div class="row" style="margin-top:8px"><button class="btn">حفظ</button><button type="button" class="btn s" id="p_cl">مسح / إلغاء التعديل</button></div></form>`;
  },
  bind() {
    const $ = id => document.getElementById(id);
    $("p_img").oninput = () => {
      const v = $("p_img").value.trim(), i = $("p_prev"); if (!v) { i.hidden = true; return }
      i.hidden = false; i.className = "prev"; i.onerror = () => { i.className = "prev bad" }; i.src = imgSrc(v);
    };
  },
  merchantsSel(ms) { const s = document.getElementById("p_mid"); if (s) s.innerHTML = '<option value="">— منتجاتي (yala-eg) —</option>' + ms.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join(""); },
  fill(r) {
    const $ = id => document.getElementById(id), set = (id, v) => { const x = $(id); if (x) x.value = v == null ? "" : v };
    set("p_name", r.name); set("p_cat", r.cat); set("p_price", r.price); set("p_old", r.old_price); set("p_stock", r.stock);
    let v = ""; if (r.offer_end) { const d = new Date(r.offer_end); v = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) } set("p_end", v);
    set("p_img", r.image_url); set("p_more", (r.extra_images || []).join("\n")); set("p_desc", r.desc);
    set("p_mid", r.merchant_id || ""); set("p_mname", r.merchant_id ? "" : r.merchant_name);
    $("p_img").oninput();
  },
  read(admin) {
    const g = id => { const x = document.getElementById(id); return x ? x.value.trim() : "" };
    const r = { name: g("p_name"), cat: g("p_cat") || null, price: +g("p_price"), old_price: g("p_old") ? +g("p_old") : null,
      stock: parseInt(g("p_stock"), 10) || 0, offer_end: g("p_end") ? new Date(g("p_end")).toISOString() : null,
      image_url: g("p_img") || null, extra_images: g("p_more").split(/\n+/).map(s => s.trim()).filter(Boolean),
      desc: g("p_desc") || null };
    if (r.old_price != null && r.old_price <= r.price) return { err: "السعر قبل الخصم لازم يكون أكبر من السعر الحالي" };
    if (admin) { const m = g("p_mid"), n = g("p_mname"); r.merchant_id = m ? +m : null; r.merchant_name = m ? null : (n || null); r.seller = r.merchant_name; }
    return { row: r };
  },
  async save(sb, editId, row) {
    const { data, error } = await (editId ? sb.from("products").update(row).eq("id", editId) : sb.from("products").insert(row)).select("id");
    if (error) return { err: error.message };
    if (!data || !data.length) return { err: "ما اتحفظش: مفيش صلاحية" };
    return { id: data[0].id };
  },
  rows(rows, admin) {
    return rows.map(r => `<tr><td><img class="th" src="${r.image_url ? esc(imgSrc(r.image_url)) : PF.ph}" onerror="this.style.visibility='hidden'" alt=""></td>
<td>${esc(r.name)}<small class="mu">${esc(r.cat || "")}</small></td>
<td>${r.old_price ? `<s class="mu">${r.old_price}</s> ` : ""}<b>${r.price}</b></td>
<td><span class="qt"><button data-a="dec" data-id="${r.id}">−</button><span class="pill${r.stock <= 0 ? " z" : ""}">${r.stock <= 0 ? "نفد" : r.stock}</span><button data-a="inc" data-id="${r.id}">+</button></span></td>
${admin ? `<td>${esc(r.merchant_name || "—")}</td>` : ""}
<td class="act"><button class="btn s sm" data-a="edit" data-id="${r.id}">تعديل</button><button class="btn s sm" data-a="price" data-id="${r.id}">سعر</button><button class="btn s sm" data-a="disc" data-id="${r.id}">${r.old_price ? "إلغاء خصم" : "خصم"}</button><button class="btn d sm" data-a="del" data-id="${r.id}">حذف</button></td></tr>`).join("");
  },
  onTable(sb, rows, reload, edit, msg) {
    return async ev => {
      const b = ev.target.closest("[data-a]"); if (!b) return;
      const id = +b.dataset.id, r = rows().find(x => x.id === id), a = b.dataset.a; let err = "";
      if (!r) return;
      if (a === "edit") return edit(r);
      if (a === "inc" || a === "dec") err = await upd(sb, id, { stock: Math.max(0, r.stock + (a === "inc" ? 1 : -1)) });
      else if (a === "price") { const p = parseFloat(prompt("السعر الجديد", r.price)); if (!(p >= 0)) return; err = await upd(sb, id, { price: p }); }
      else if (a === "disc") {
        if (r.old_price) err = await upd(sb, id, { price: r.old_price, old_price: null });
        else { const p = parseFloat(prompt("نسبة الخصم %", "10")); if (!(p > 0 && p < 100)) return; err = await upd(sb, id, { old_price: r.price, price: Math.round(r.price * (100 - p)) / 100 }); }
      } else if (a === "del") {
        if (!confirm("حذف المنتج نهائياً من قاعدة البيانات؟")) return;
        const { data, error } = await sb.from("products").delete().eq("id", id).select("id"); err = error ? error.message : (data && data.length ? "" : "مفيش صلاحية");
      }
      err ? msg(err) : reload();
    };
  }
};

window.u8 = b => { const p = "=".repeat((4 - b.length % 4) % 4), r = atob((b + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
// الأوردر بيتسجل ويتخصم من المخزون فوراً → البائع يضغط "جاهز للتسليم" → ينزل للطيار → أخذ/استلام/تسليم.
// الإلغاء والتعديل: البائع بيطلب والمالك هو اللي يأكد. البيع بيتحسب لما الطيار يسلّم (ومش ملغي).
window.RIDER_RATE = .15;
window.fm = n => Math.round(n * 100) / 100;
window.starsTxt = (a, c) => a ? "⭐ " + a + (c ? " (" + c + ")" : "") : "";
window.Conf = { sold: i => !!i.delivered && !i.cancelled };
window.fetchAll = async build => { // بيجيب كل الصفوف (سوبابيز بيرجع 1000 بس في الطلب الواحد)
  let out = [], from = 0;
  for (;;) { const { data, error } = await build().range(from, from + 999); if (error) return { data: out, error }; out = out.concat(data || []); if (!data || data.length < 1000) break; from += 1000; }
  return { data: out, error: null };
};
window.periodRange = k => { // الأسبوع بيبدأ السبت
  const n = new Date(), d0 = new Date(n.getFullYear(), n.getMonth(), n.getDate()), ws = new Date(d0); ws.setDate(d0.getDate() - (d0.getDay() + 1) % 7);
  if (k === "week") return [ws, new Date(ws.getTime() + 7 * 864e5)];
  if (k === "lastweek") return [new Date(ws.getTime() - 7 * 864e5), ws];
  if (k === "month") return [new Date(n.getFullYear(), n.getMonth(), 1), new Date(n.getFullYear(), n.getMonth() + 1, 1)];
  return [new Date(0), new Date(8.64e15)];
};
window.inR = (t, r) => !!t && new Date(t) >= r[0] && new Date(t) < r[1];
window.monthBounds = (y, m) => [new Date(y, m, 1), new Date(y, m + 1, 1)];
window.monthNames = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
window.monthSel = () => { const n = new Date(); return `<select id="rp_m" style="width:auto;display:inline-block">${monthNames.map((x, i) => `<option value="${i}"${i === n.getMonth() ? " selected" : ""}>${x}</option>`).join("")}</select> <select id="rp_y" style="width:auto;display:inline-block">${[0, 1, 2].map(k => `<option>${n.getFullYear() - k}</option>`).join("")}</select>`; };
window.aggItems = arr => { const m = {}; arr.forEach(i => { const k = i.name + "|" + i.price, x = m[k] = m[k] || { name: i.name, price: +i.price, qty: 0 }; x.qty += i.qty; }); return Object.values(m); };
window.printHtml = html => { const p = document.getElementById("printArea"); p.innerHTML = html; setTimeout(() => window.print(), 50); };

// أزرار دورة الأوردر (بتتشارك في الصفحتين). كل زرار عليه data-c ونوع العملية
window.Act = {
  async click(ev, sb, reload, msg) {
    const b = ev.target.closest("[data-c]"); if (!b) return false;
    const d = b.dataset, c = d.c, oid = +d.oid, id = +d.id, v = d.v === "1"; let r;
    if (c === "ready") r = await sb.rpc("mark_ready", { p_oid: oid, p_val: v });
    else if (c === "cxl") { if (v && !confirm("تأكيد: لم يتم الأوردر؟ هيتبعت طلب إلغاء للمالك ومتتخصمش من حسابك إلا بموافقته.")) return true; r = await sb.rpc("request_cancel", { p_oid: oid, p_val: v }); }
    else if (c === "chg") { const q = prompt("الكمية الجديدة (0 = شيل الصنف). لازم المالك يوافق عليها.", ""); if (q === null || q === "") return true; r = await sb.rpc("request_item_change", { p_id: id, p_qty: parseInt(q, 10) }); }
    else if (c === "rchg") r = await sb.rpc("resolve_item_change", { p_id: id, p_approve: v });
    else if (c === "rcxl") { if (v && !confirm("تأكيد إلغاء الأوردر؟ هيرجّع المخزون ويتشال من الطيار ومبيتحسبش على البائع ولا الطيار.")) return true; r = await sb.rpc("resolve_cancel", { p_oid: oid, p_approve: v }); }
    else if (c === "acx") { if (!confirm("إلغاء الأوردر نهائياً؟")) return true; r = await sb.rpc("admin_cancel_order", { p_oid: oid, p_restock: confirm("نرجّع الكمية للمخزون؟ (OK = أيوه)") }); }
    else if (c === "fdel") { if (!confirm("تسليم الأوردر يدوي بدون كود العميل؟")) return true; r = await sb.rpc("admin_force_deliver", { p_oid: oid }); }
    else if (c === "rpin") r = await sb.rpc("admin_reset_pin", { p_oid: oid });
    else if (c === "adj") {
      const q = prompt("الكمية الجديدة (0 = شيل الصنف). الحالية: " + d.q, d.q); if (q === null) return true;
      const p = prompt("سعر القطعة الجديد. الحالي: " + d.p, d.p); if (p === null) return true;
      r = await sb.rpc("adjust_item", { p_id: id, p_qty: parseInt(q, 10), p_price: parseFloat(p) });
    } else if (c === "ship") { const x = parseFloat((document.getElementById("sh" + oid) || {}).value); if (!(x >= 0)) { msg("اكتب سعر التوصيل"); return true; } r = await sb.rpc("set_shipping", { p_oid: oid, p_ship: x }); }
    else return false;
    r && r.error ? msg(r.error.message) : (msg("تم"), reload());
    return true;
  }
};
// حفظ نسخة من بيانات اللوحة على الجهاز (عشان متضيعش وتظهر فوراً)
window.snap = { get: k => { try { return JSON.parse(localStorage.getItem("snap_" + k)) } catch (x) { return null } }, set: (k, v) => { try { localStorage.setItem("snap_" + k, JSON.stringify(v)) } catch (x) { } } };
