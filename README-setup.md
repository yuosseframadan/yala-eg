# yala-eg — خطوات التشغيل (بالترتيب)

## 1) قاعدة البيانات
- Supabase > SQL Editor > الصق `supabase-schema.sql` كله > Run (آمن لو اتشغّل أكتر من مرة).
- بيمسح جدول merchants لو كان بنسخة uuid القديمة، وبيرحّل أسماء الباقات القديمة للباقات p1..p4.

## 2) إعدادات Authentication
- Sign In / Providers: فعّل **Allow new users to sign up** وقفل **Confirm email** (عشان لوحتك تنشئ حسابات البائعين والطيارين).
- حساب المشرف (UID: 57961390-b0f4-4721-9b55-acaa81c946fa) لازم يكون موجود في Authentication > Users.

## 3) الرفع
- ارفع كل الملفات على GitHub (Vercel هينشر تلقائي). افتح بعدها:
  - `/admin.html` المالك · `/brand.html` البائع · `/rider.html` الطيار.

## 4) الإشعارات الفورية (اختياري، بيحتاج Supabase CLI)
```
supabase secrets set VAPID_PUBLIC=<المفتاح العام اللي في products.js> VAPID_PRIVATE=<المفتاح الخاص> ADMIN_UID=57961390-b0f4-4721-9b55-acaa81c946fa CRON_SECRET=<أي كلمة سرية طويلة>
supabase functions deploy broadcast --no-verify-jwt
```
- المفتاح الخاص سر: متحطوش في أي ملف في الموقع.
- من غير الخطوة دي: البث بيظهر جوه الموقع للزوار (جرس الإشعارات) بس مش إشعار فوري على الموبايل.

## 5) تذكير السلة بعد 24 ساعة وهو مقفول (اختياري)
فعّل الإضافتين pg_cron و pg_net من Database > Extensions، وبعدها شغّل:
```sql
select cron.schedule('yala-cart-reminders','0 * * * *',$$
  select net.http_post(url:='https://rsujrvuepaymnreojywf.supabase.co/functions/v1/broadcast',
    headers:=jsonb_build_object('Content-Type','application/json','x-cron','<نفس CRON_SECRET>'),
    body:='{"mode":"cart"}'::jsonb) $$);
```
