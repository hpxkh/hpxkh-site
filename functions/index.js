/**
 * 首頁（/）邊緣改寫。
 *
 * index.html 目前仍是單一大檔，直接編輯成本很高，因此在 Cloudflare 邊緣
 * 以 HTMLRewriter 做幾件小事：
 *   1. 行事曆頁：舊的 Google Calendar 說明區換成 <div id="calMount">
 *   2. 行事曆頁：修正標題錯字、改寫開場說明
 *   3. 頁尾之後掛上 assets/calendar.js 與 assets/fixes.js
 *
 * 之後若 tools/build.py 已把這些寫進 index.html，對應選擇器就不會命中，
 * 而 calendar.js 本身有防重入保護，重複掛載不會有副作用。
 */
const MOUNT = '<div id="calMount"><p style="color:#918B81;font-size:13px">讀取行事曆中…</p></div>';
const SCRIPTS = '<script src="/assets/calendar.js"></script>' +
  '<script src="/assets/fixes.js"></script>';
const LEDE = '每月書聚與活動都在下面的月曆上，可以往前往後翻。' +
  '按「訂閱到自己的日曆」之後，社團新增的場次會自動出現在你的 Google 日曆裡，不必回來查。';

export async function onRequestGet(context) {
  const res = await context.next();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  let nth = 0;

  return new HTMLRewriter()
    .on('div.embed', {
      element(el) {
        el.replace(MOUNT, { html: true });
      },
    })
    .on('[data-pg="calendar"] .top h2', {
      element(el) {
        el.setInnerContent('高雄讀書會行事曆');
      },
    })
    .on('[data-pg="calendar"] .top p', {
      element(el) {
        nth += 1;
        // 第一句是提問（top__q），保留；第二段才是要換掉的說明
        if (nth === 2) el.setInnerContent(LEDE);
      },
    })
    .on('footer', {
      element(el) {
        el.after(SCRIPTS, { html: true });
      },
    })
    .transform(res);
}
