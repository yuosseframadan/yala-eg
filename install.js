(function () {
  var KEY = "yala_installed";
  if (matchMedia("(display-mode: standalone)").matches || navigator.standalone === true) { try { localStorage.setItem(KEY, "1"); } catch (e) { } return; }
  try { if (localStorage.getItem(KEY) === "1") return; } catch (e) { }
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var dp = null, bar;
  var css = document.createElement("style");
  css.textContent = "#yinst{position:fixed;left:0;right:0;bottom:0;z-index:70;background:#1d1915;border-top:2px solid #e8650a;padding:10px 14px calc(10px + env(safe-area-inset-bottom,0px));font-family:'IBM Plex Sans Arabic',Tahoma,Arial,sans-serif;color:#f3ede6;direction:rtl;box-shadow:0 -6px 24px rgba(0,0,0,.5)}" +
    "#yinst .r{display:flex;align-items:center;gap:10px}#yinst img{width:40px;height:40px;border-radius:6px}#yinst b{flex:1;font-size:15px;line-height:1.4}" +
    "#yinst button{font:700 14px 'IBM Plex Sans Arabic',Tahoma,sans-serif;border-radius:6px;padding:8px 16px;cursor:pointer;border:2px solid #e8650a;background:#e8650a;color:#111}#yinst button.x{background:none;border:0;color:#a99f94;font-size:20px;padding:4px 8px}" +
    "#yinst .st{background:#0f0d0b;border:1px solid #352e27;border-radius:6px;padding:10px 14px;margin-top:10px;font-size:14px;color:#cfcfcf;max-height:55vh;overflow:auto}#yinst .st ol{padding-inline-start:20px;margin:4px 0}" +
    "#yinst .st li{margin:8px 0}#yinst .st svg{width:22px;height:22px;vertical-align:middle;color:#e8650a;margin:0 4px}#yinst .en{direction:ltr;text-align:left;border-top:1px dashed #352e27;margin-top:8px;padding-top:6px}" +
    "body.yi{padding-bottom:84px!important}body.yi #toast{bottom:100px!important}";
  document.head.appendChild(css);
  var SH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M8 7l4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/></svg>';
  var AD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
  function show() {
    if (bar || document.getElementById("yinst")) return;
    bar = document.createElement("div"); bar.id = "yinst";
    bar.innerHTML = '<div class="r"><img src="icon-192.png" alt=""><b>ثبّت التطبيق على موبايلك<br><small style="font-weight:400;color:#a99f94">Install the app on your phone</small></b><button id="yi-go">' + (ios ? "إزاي؟ / How?" : "تثبيت / Install") + '</button><button class="x" id="yi-x" aria-label="إغلاق">✕</button></div>' +
      (ios ? '<div class="st" id="yi-st" hidden><b>على الآيفون (Safari):</b><ol><li>افتح الموقع من متصفح <b>Safari</b>.</li><li>دوس على زر المشاركة ' + SH + ' (المربع اللي فيه سهم لفوق) في أسفل الشاشة.</li><li>انزل لتحت واختار ' + AD + ' <b>«إضافة إلى الشاشة الرئيسية»</b>.</li><li>دوس <b>«إضافة»</b> وهتلاقي التطبيق على الشاشة.</li></ol>' +
        '<div style="margin-top:8px"><a href="#" id="yi-done" style="color:#e8650a;font-size:13px">أنا مثبّت التطبيق بالفعل / I already installed it</a></div><div class="en"><b>On iPhone (Safari):</b><ol><li>Open this site in <b>Safari</b>.</li><li>Tap the Share button ' + SH + ' (square with an up arrow) at the bottom.</li><li>Scroll down and tap ' + AD + ' <b>“Add to Home Screen”</b>.</li><li>Tap <b>“Add”</b>.</li></ol></div></div>' : "");
    document.body.appendChild(bar); document.body.classList.add("yi");
    document.getElementById("yi-x").onclick = function () { bar.remove(); document.body.classList.remove("yi"); };
    var dn = document.getElementById("yi-done"); if (dn) dn.onclick = function (e) { e.preventDefault(); try { localStorage.setItem(KEY, "1"); } catch (x) { } bar.remove(); document.body.classList.remove("yi"); };
    document.getElementById("yi-go").onclick = function () {
      if (ios) { var s = document.getElementById("yi-st"); s.hidden = !s.hidden; return; }
      if (!dp) return; dp.prompt(); dp.userChoice.then(function () { dp = null; if (bar) bar.remove(); document.body.classList.remove("yi"); });
    };
  }
  addEventListener("appinstalled", function () { try { localStorage.setItem(KEY, "1"); } catch (e) { } if (bar) bar.remove(); document.body.classList.remove("yi"); });
  if (ios) { if (document.body) show(); else addEventListener("DOMContentLoaded", show); }
  else addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); dp = e; if (document.body) show(); else addEventListener("DOMContentLoaded", show); });
})();
