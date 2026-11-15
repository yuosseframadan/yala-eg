// ===== إعدادات المتجر (كل الصفحات بتقرا من هنا) =====
window.SUPABASE_URL = "https://rsujrvuepaymnreojywf.supabase.co";
window.SUPABASE_KEY = "sb_publishable_ujSZ_okHds1JfYWlZ1fvQw_ulMLkytV"; // آمن في الموقع طالما RLS شغال. ممنوع مفتاح secret هنا.
window.ADMIN_UID = "57961390-b0f4-4721-9b55-acaa81c946fa";
window.IK_URL = "https://ik.imagekit.io/wz76qvc4n";
window.MAIN_WA = "201092377837";
window.PLANS = {
  commission: { n: "باقة العمولة", max: 15, fee: 0, rate: .05 },
  silver: { n: "الفضية", max: 35, fee: 500, rate: 0 },
  gold: { n: "الذهبية", max: 50, fee: 750, rate: 0 },
  business: { n: "باقة الأعمال", max: 100, fee: 1000, rate: 0 },
  unlimited: { n: "المفتوحة", max: Infinity, fee: 2000, rate: .075 }
};

window.sb = null;
try { if (window.supabase) window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (x) { console.warn("Supabase init failed", x); }

window.esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => "&#" + c.charCodeAt(0) + ";");
// اسم ملف بس (honey.jpg) بيتركّب على ImageKit، ورابط كامل من أي موقع بيتستخدم زي ما هو
window.imgSrc = u => /^(https?:|data:|images\/)/.test(u) ? u : IK_URL + "/" + String(u).replace(/^\/+/, "");
window.waNum = p => { const d = String(p || "").replace(/\D/g, ""); return d.startsWith("0") ? "20" + d.slice(1) : d; };

const COLS = "id,name,price,old_price,stock,cat,seller,merchant_name,image_url,extra_images,desc,offer_end,is_digital,merchant_id,merchant_phone";
window.mapRow = r => {
  const imgs = [r.image_url, ...(r.extra_images || [])].filter(Boolean);
  return { id: r.id, name: r.name, price: +r.price, oldPrice: r.old_price ? +r.old_price : null, stock: r.stock, cat: r.cat || "",
    seller: r.merchant_name || r.seller || "yala-eg", img: imgs[0] || "", imgs, desc: r.desc || "", offerEnd: r.offer_end,
    digital: !!r.is_digital, mid: r.merchant_id, mphone: r.merchant_phone };
};
window.loadProducts = async () => {
  if (!window.sb) throw new Error("Supabase غير متصل");
  const { data, error } = await window.sb.from("products").select(COLS).order("id", { ascending: false });
  if (error) throw error;
  return data.map(window.mapRow);
};

// ===== أدوات مشتركة للوحة المشرف وصفحة البائع =====
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
<label class="ck"><input type="checkbox" id="p_dig"> منتج رقمي (كتاب، كورس، ملف...) بدون شحن</label>
<div id="p_digw" hidden><label>رابط المنتج الرقمي (بيتبعت للمشتري ومش بيظهر للزباين)</label><input id="p_durl" dir="ltr"></div>
<div class="row" style="margin-top:8px"><button class="btn">حفظ</button><button type="button" class="btn s" id="p_cl">مسح / إلغاء التعديل</button></div></form>`;
  },
  bind() {
    const $ = id => document.getElementById(id);
    $("p_dig").onchange = () => $("p_digw").hidden = !$("p_dig").checked;
    $("p_img").oninput = () => {
      const v = $("p_img").value.trim(), i = $("p_prev"); if (!v) { i.hidden = true; return }
      i.hidden = false; i.className = "prev"; i.onerror = () => { i.className = "prev bad" }; i.src = imgSrc(v);
    };
  },
  merchantsSel(ms) { const s = document.getElementById("p_mid"); if (s) s.innerHTML = '<option value="">— منتجاتي (yala-eg) —</option>' + ms.map(m => `<option value="${m.id}">${esc(m.name)}</option>`).join(""); },
  fill(r, durl) {
    const $ = id => document.getElementById(id), set = (id, v) => { const x = $(id); if (x) x.value = v == null ? "" : v };
    set("p_name", r.name); set("p_cat", r.cat); set("p_price", r.price); set("p_old", r.old_price); set("p_stock", r.stock);
    let v = ""; if (r.offer_end) { const d = new Date(r.offer_end); v = new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16) } set("p_end", v);
    set("p_img", r.image_url); set("p_more", (r.extra_images || []).join("\n")); set("p_desc", r.desc);
    set("p_mid", r.merchant_id || ""); set("p_mname", r.merchant_id ? "" : r.merchant_name);
    $("p_dig").checked = !!r.is_digital; $("p_digw").hidden = !r.is_digital; set("p_durl", durl);
    $("p_img").oninput();
  },
  read(admin) {
    const g = id => { const x = document.getElementById(id); return x ? x.value.trim() : "" };
    const r = { name: g("p_name"), cat: g("p_cat") || null, price: +g("p_price"), old_price: g("p_old") ? +g("p_old") : null,
      stock: parseInt(g("p_stock"), 10) || 0, offer_end: g("p_end") ? new Date(g("p_end")).toISOString() : null,
      image_url: g("p_img") || null, extra_images: g("p_more").split(/\n+/).map(s => s.trim()).filter(Boolean),
      desc: g("p_desc") || null, is_digital: document.getElementById("p_dig").checked };
    if (r.old_price != null && r.old_price <= r.price) return { err: "السعر قبل الخصم لازم يكون أكبر من السعر الحالي" };
    if (admin) { const m = g("p_mid"), n = g("p_mname"); r.merchant_id = m ? +m : null; r.merchant_name = m ? null : (n || null); r.seller = r.merchant_name; }
    return { row: r, durl: g("p_durl") };
  },
  async save(sb, editId, row, durl) {
    const { data, error } = await (editId ? sb.from("products").update(row).eq("id", editId) : sb.from("products").insert(row)).select("id");
    if (error) return { err: error.message };
    if (!data || !data.length) return { err: "ما اتحفظش: مفيش صلاحية" };
    if (row.is_digital && durl) await sb.from("digital_links").upsert({ product_id: data[0].id, url: durl });
    else await sb.from("digital_links").delete().eq("product_id", data[0].id);
    return { id: data[0].id };
  },
  rows(rows, admin) {
    return rows.map(r => `<tr><td><img class="th" src="${r.image_url ? esc(imgSrc(r.image_url)) : PF.ph}" onerror="this.style.visibility='hidden'" alt=""></td>
<td>${r.is_digital ? "📥 " : ""}${esc(r.name)}<small class="mu">${esc(r.cat || "")}</small></td>
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
