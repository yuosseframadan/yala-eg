// ===== إعدادات Supabase =====
// الصق هنا رابط مشروعك الكامل: Supabase > Project Settings > API > Project URL
// شكله: https://xxxxxxxxxxxx.supabase.co  (الرابط اللي بعتّه كان ناقص الجزء الأول)
window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
// المفتاح ده (Publishable) آمن يتحط في الموقع طالما RLS مفعّل. ممنوع تحط مفتاح secret هنا أبداً.
window.SUPABASE_KEY = "sb_publishable_ujSZ_okHds1JfYWlZ1fvQw_ulMLkytV";

window.sb = null;
try {
  if (window.supabase && !/YOUR-PROJECT/.test(window.SUPABASE_URL))
    window.sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
} catch (e) { console.warn("Supabase init failed", e); }

// تحويل صف من جدول products لشكل المنتج اللي الموقع بيستخدمه
window.mapRow = r => ({
  id: r.id, name: r.name, price: +r.price,
  oldPrice: r.old_price ? +r.old_price : null,
  stock: r.stock, cat: r.cat,
  seller: r.seller || r.merchant_name || "",
  img: r.image_url, desc: r.desc || "", offerEnd: r.offer_end
});

// جلب المنتجات (async). لو Supabase لسه مش مظبوط بيرجع منتجات تجريبية محلية.
window.loadProducts = async () => {
  if (!window.sb) { console.warn("Supabase مش مظبوط، بيتعرض منتجات تجريبية"); return LOCAL_PRODUCTS; }
  const { data, error } = await window.sb.from("products").select("*").order("id", { ascending: false });
  if (error) throw error;
  return data.map(window.mapRow);
};

// ===== منتجات تجريبية محلية (بتظهر بس لو Supabase مش مظبوط) =====
const _d = n => new Date(Date.now() + 864e5 * n).toISOString();
const LOCAL_PRODUCTS = [
  {id:1,name:"عسل أبيض 1 كجم",price:180,oldPrice:220,cat:"بقالة",seller:"نحل بلطيم",img:"images/honey.svg",desc:"عسل طبيعي 100% من مناحل بلطيم.",offerEnd:_d(3)},
  {id:2,name:"زيت زيتون بكر 500 مل",price:130,cat:"بقالة",seller:"نحل بلطيم",img:"images/olive.svg",desc:"زيت زيتون بكر معصور على البارد."},
  {id:3,name:"كوب حراري 500 مل",price:95,oldPrice:120,cat:"أدوات منزلية",seller:"بيت الهنا",img:"images/mug.svg",desc:"بيحافظ على السخونة 8 ساعات.",offerEnd:_d(2)},
  {id:4,name:"سماعة بلوتوث",price:250,cat:"إلكترونيات",seller:"تك ستور",img:"images/headphones.svg",desc:"صوت نقي وبطارية تكمل يوم كامل."}
];
