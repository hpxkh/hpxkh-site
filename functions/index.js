/**
 * 首頁（/）邊緣改寫。
 *
 * index.html 目前仍是單一大檔，直接編輯成本很高，因此在 Cloudflare 邊緣
 * 以 HTMLRewriter 做兩件事：
 *   1. 把行事曆頁裡舊的 Google Calendar 說明區換成 <div id="calMount">
 *   2. 在頁尾之後掛上 assets/calendar.js
 *
 * 之後若 tools/build.py 已把這兩者寫進 index.html，第 1 條選擇器就不會命中，
 * 而 calendar.js 本身有防重入保護，重複掛載不會有副作用。
 */
const MOUNT = '<div id="calMount"><p style="color:#918B81;font-size:13px">讀取行事曆中…</p></div>';
const SCRIPT = '<script src="/assets/calendar.js"></script>';

export async function onRequestGet(context) {
  const res = await context.next();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  return new HTMLRewriter()
    .on('div.embed', {
      element(el) {
        el.replace(MOUNT, { html: true });
      },
    })
    .on('footer', {
      element(el) {
        el.after(SCRIPT, { html: true });
      },
    })
    .transform(res);
}
