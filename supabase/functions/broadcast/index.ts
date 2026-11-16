// Supabase Edge Function: بث إشعارات فورية + تذكير السلة بعد 24 ساعة.
// نشر:  supabase functions deploy broadcast --no-verify-jwt
// Secrets (Project Settings > Edge Functions > Secrets أو بالأمر supabase secrets set):
//   VAPID_PUBLIC, VAPID_PRIVATE, ADMIN_UID, CRON_SECRET (SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY موجودين تلقائياً)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "cart" ? "cart" : "broadcast";

    // التحقق: المشرف (توكن دخوله) أو مفتاح الكرون (لتذكير السلة فقط)
    const cron = Deno.env.get("CRON_SECRET");
    const byCron = !!cron && req.headers.get("x-cron") === cron && mode === "cart";
    let byAdmin = false;
    if (!byCron) {
      const token = (req.headers.get("Authorization") || "").replace("Bearer ", "");
      const { data } = await admin.auth.getUser(token);
      byAdmin = !!data?.user && data.user.id === Deno.env.get("ADMIN_UID");
    }
    if (!byCron && !byAdmin) return json({ error: "غير مصرح" }, 401);

    webpush.setVapidDetails("mailto:admin@yala-eg.vercel.app", Deno.env.get("VAPID_PUBLIC")!, Deno.env.get("VAPID_PRIVATE")!);

    let q = admin.from("push_subs").select("id,endpoint,p256dh,auth").limit(5000);
    let payload: Record<string, string>;
    if (mode === "cart") {
      q = q.lt("cart_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()).eq("cart_reminded", false);
      payload = { title: "🛒 سلتك لسه مستنياك في yala-eg!", body: "كمل طلبك بسرعة والحق العروض قبل ما تخلص", url: "./#/" };
    } else {
      if (!body.title) return json({ error: "العنوان مطلوب" }, 400);
      payload = { title: String(body.title), body: String(body.body || ""), url: String(body.url || "./") };
    }
    const { data: subs, error } = await q;
    if (error) return json({ error: error.message }, 500);

    let sent = 0, failed = 0; const gone: number[] = [], done: number[] = [];
    await Promise.all((subs || []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload));
        sent++; done.push(s.id);
      } catch (e) {
        failed++; if (e?.statusCode === 404 || e?.statusCode === 410) gone.push(s.id);
      }
    }));
    if (gone.length) await admin.from("push_subs").delete().in("id", gone);
    if (mode === "cart" && done.length) await admin.from("push_subs").update({ cart_reminded: true }).in("id", done);
    return json({ sent, failed, removed: gone.length });
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});
