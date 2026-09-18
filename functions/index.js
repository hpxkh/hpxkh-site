/**
 * 首頁（/）邊緣改寫。
 *
 * index.html 目前仍是單一大檔，直接編輯成本很高，因此在 Cloudflare 邊緣
 * 以 HTMLRewriter 做幾件小事：
 *   1. 行事曆頁：舊的 Google Calendar 說明區換成 <div id="calMount">
 *   2. 行事曆頁：修正標題錯字、改寫開場說明
 *   3. 行事曆頁：移除舊的「訂閱到自己的日曆」區塊（已整併進月曆下方的卡片）
 *   4. 補上網站圖示，並掛上 assets/calendar.js 與 assets/fixes.js
 *
 * 之後若 tools/build.py 已把這些寫進 index.html，對應選擇器就不會命中，
 * 而 calendar.js 本身有防重入保護，重複掛載不會有副作用。
 *
 * ── 關於 VER ──
 * 本網域的 Cloudflare「Browser Cache TTL」設為 4 小時，會把靜態檔的
 * max-age 一律拉到 14400，_headers 只能拉長不能縮短。因此改用版本化網址：
 * 每次改動 calendar.js / fixes.js / favicon.svg 後把 VER 改掉，
 * 瀏覽器就會視為新檔案立刻重新下載。首頁本身不被快取，所以新版本號會馬上送達。
 */
const VER = '20260918d';

const MOUNT = '<div id="calMount"><p style="color:#918B81;font-size:13px">讀取行事曆中…</p></div>';
const SCRIPTS = '<script src="/assets/calendar.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes.js?v=' + VER + '"></script>';
const ICON = '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=' + VER + '">';
const LEDE = '每月書聚與活動都在下面的月曆上，可以往前往後翻。同一個活動固定一種顏色，同一天有多場也分得出來。';

export async function onRequestGet(context) {
  const res = await context.next();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  let nthP = 0;
  let nthSec = 0;

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.before(ICON, { html: true });
      },
    })
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
        nthP += 1;
        // 第一句是提問（top__q），保留；第二段才是要換掉的說明
        if (nthP === 2) el.setInnerContent(LEDE);
      },
    })
    .on('[data-pg="calendar"] section.blk', {
      element(el) {
        nthSec += 1;
        // 第一段是月曆本體；第二段是舊的訂閱說明，內容已整併進月曆下方卡片
        if (nthSec === 2) el.remove();
      },
    })
    .on('footer', {
      element(el) {
        el.after(SCRIPTS, { html: true });
      },
    })
    .transform(res);
}
