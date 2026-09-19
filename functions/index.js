/**
 * 首頁（/）邊緣改寫。
 *
 * index.html 目前仍是單一大檔，直接編輯成本很高，因此在 Cloudflare 邊緣
 * 以 HTMLRewriter 做幾件小事：
 *   1. 行事曆頁：舊的 Google Calendar 說明區換成 <div id="calMount">
 *   2. 行事曆頁：修正標題錯字、改寫開場說明
 *   3. 行事曆頁：移除舊的「訂閱到自己的日曆」區塊（已整併進月曆下方的卡片）
 *   4. 補上 viewport 與網站圖示，並掛上 assets/copy.js、calendar.js、fixes.js 與 fixes2.js
 *
 * ── 關於 VIEWPORT ──
 * index.html 原本沒有這一行。沒有它，手機瀏覽器會拿一個 980px 的假寬度
 * 渲染頁面再整頁縮小，所以看起來就是「桌機版被縮小」，
 * 原始碼裡寫好的手機版樣式（@media max-width:820px、漢堡選單…）全部不會被觸發，
 * 每一個為桌機設的 max-width 在手機上都會變成右邊一大片空白。
 * 補上之後手機就會走真正的手機介面。
 *
 * ── 載入順序 ──
 * copy.js 必須排在 fixes.js 之前：文案與步驟資料（window.HPXKH_TX）由 copy.js 提供。
 * fixes2.js 排在 fixes.js 之後：它是第二批版面調整，需要蓋過前面的規則。
 *
 * ── 關於 VER ──
 * 本網域的 Cloudflare「Browser Cache TTL」設為 4 小時，會把靜態檔的
 * max-age 一律拉到 14400，_headers 只能拉長不能縮短。因此改用版本化網址：
 * 每次改動 copy.js / calendar.js / fixes.js / fixes2.js / favicon.svg 後把 VER 改掉，
 * 瀏覽器就會視為新檔案立刻重新下載。首頁本身不被快取，所以新版本號會馬上送達。
 */
const VER = '20260919p';

const VIEWPORT = '<meta name="viewport" content="width=device-width, initial-scale=1">';
const MOUNT = '<div id="calMount"><p style="color:#918B81;font-size:13px">讀取行事曆中…</p></div>';
const SCRIPTS = '<script src="/assets/copy.js?v=' + VER + '"></script>' +
  '<script src="/assets/calendar.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes2.js?v=' + VER + '"></script>';
const ICON = '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=' + VER + '">';
// 顏色那一句拿掉：月曆上看一眼就知道，不用先用文字說明
const LEDE = '每月書聚與活動都在下面的月曆上，可以往前往後翻。';

export async function onRequestGet(context) {
  const res = await context.next();
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return res;

  let nthP = 0;
  let nthSec = 0;

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.before(VIEWPORT + ICON, { html: true });
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
