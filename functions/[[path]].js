/**
 * 全站邊緣改寫（取代原本只管首頁的 functions/index.js）。
 *
 * ── 為什麼要改掉網址裡的 # ──
 * 原本全站是 hash 路由：https://www.hpxkh.com/#/docs
 * # 後面的東西瀏覽器「不會」送給伺服器，伺服器看到的永遠是 /。
 * 結果是：整個網站對搜尋引擎來說只有一個網址、一組標題、一段描述、一張分享縮圖。
 * 十一個頁面的內容再完整，也只能擠在同一個網址底下互相搶排名。
 * 分享到 FB／LINE 時也一樣 —— 不管分享哪一頁，預覽卡都長一樣。
 *
 * 改成真正的路徑之後：
 *   https://www.hpxkh.com/docs   https://www.hpxkh.com/faq   …
 * 每一頁有自己的網址、自己的 <title>、自己的描述與 og 卡片、自己的 canonical，
 * 也進得了 sitemap.xml。搜尋結果會分開收錄，分享出去的預覽也各自正確。
 *
 * ── 這支程式在邊緣做的事 ──
 *   1. 依路徑塞入 charset / viewport / 網站圖示
 *   2. 依路徑改寫 <title>，並補上 description、canonical、og:*、twitter:*
 *   3. 行事曆頁：舊的 Google Calendar 說明區換成 <div id="calMount">、修正標題、
 *      改寫開場說明、移除舊的訂閱區塊（已整併進月曆下方卡片）
 *   4. 掛上 assets/copy.js、calendar.js、fixes.js、fixes2.js、fixes3.js、fixes4.js
 *   5. 不認得的路徑：照樣回單頁 HTML，但狀態碼給 404（不做軟性 404）
 *
 * 真正把畫面切到對應頁面的是前端：assets/fixes3.js。
 *
 * ── 關於 VIEWPORT ──
 * index.html 原本沒有這一行。沒有它，手機瀏覽器會拿一個 980px 的假寬度
 * 渲染頁面再整頁縮小，原始碼裡寫好的手機版樣式全部不會被觸發，
 * 每一個為桌機設的 max-width 在手機上都會變成右邊一大片空白。
 *
 * ── 載入順序 ──
 * copy.js 必須排在 fixes.js 之前：文案與步驟資料（window.HPXKH_TX）由 copy.js 提供。
 * fixes2.js 排在 fixes.js 之後：它是第二批版面調整，需要蓋過前面的規則。
 * fixes3.js 排在後面：路由要等前面的卡片與表單都建好。
 * fixes4.js 最後：第三批小調整（里程碑、新人指引卡片切齊…）。
 *
 * ── 關於 VER ──
 * 本網域的 Cloudflare「Browser Cache TTL」設為 4 小時，會把靜態檔的
 * max-age 一律拉到 14400，_headers 只能拉長不能縮短。因此改用版本化網址：
 * 每次改動 copy.js / calendar.js / fixes.js / fixes2.js / fixes3.js / fixes4.js / favicon.svg 後把 VER 改掉。
 */
const VER = '20260919t';

const SITE = 'https://www.hpxkh.com';
const OGIMG = SITE + '/assets/heroMain.webp';
const BRAND = 'HPX 高雄讀書會';

/* 路徑 → 頁面。key 要和 index.html 裡 .pg[data-pg] 的值一致，
   標題與描述要和 assets/fixes3.js 的 TITLE 表一字不差
   （前端換頁時會用同一份，兩邊不一致會在載入後被蓋掉）。 */
const PAGES = {
  '/': {
    k: 'home',
    t: BRAND + '｜高雄的共讀社群',
    d: 'HPX 高雄讀書會成立於 2017 年，是高雄以「書」為核心的社群。書聚、新人小聚、輕鬆聚、TALK 講座，各行各業的書友一起看書、想書、說書。',
  },
  '/about': {
    k: 'about',
    t: '關於我們｜' + BRAND,
    d: 'H·P·X 是什麼意思、社團怎麼運作、歷年里程碑，以及我們不是什麼。認識 HPX 高雄讀書會的第一站。',
  },
  '/start': {
    k: 'start',
    t: '新人指引｜' + BRAND,
    d: '第一次來 HPX 高雄讀書會？從填寫加入社團申請、自我介紹，到參加第一場書聚，一步一步帶你完成。',
  },
  '/meetups': {
    k: 'meetups',
    t: '社團書聚｜' + BRAND,
    d: '書聚、新人小聚、輕鬆聚、月讀 R4A、TALK 講座、大聚、職人分享會⋯⋯九種聚會形式，以及歷年讀過的書與所有場次。',
  },
  '/calendar': {
    k: 'calendar',
    t: '行事曆｜' + BRAND,
    d: '每月書聚、講座與活動行程一次看完，可以往前往後翻，也可以訂閱到自己的日曆。',
  },
  '/docs': {
    k: 'docs',
    t: '申請與文件｜' + BRAND,
    d: '加入社團申請、書聚徽章申請、許願池、推薦場地與合作提案，所有表單都在這一頁。',
  },
  '/faq': {
    k: 'faq',
    t: '常見問題｜' + BRAND,
    d: '加入社團、參加書聚、各種聚會形式、我想開一場書聚 —— 四十個最常被問到的問題，依主題分四區。',
  },
  '/gallery': {
    k: 'gallery',
    t: '活動花絮｜' + BRAND,
    d: '歷年書聚、講座與社團活動的現場紀錄。',
  },
  '/rules': {
    k: 'rules',
    t: '社團版規｜' + BRAND,
    d: 'HPX 高雄讀書會社團版規共十條：貢獻、出席、旁聽、發文與尊重書友的規範。加入前請務必詳閱。',
  },
  '/venues': {
    k: 'venues',
    t: '常辦書聚地點｜' + BRAND,
    d: '社團常辦書聚的場地整理，含地址、費用、低消、人數與包廂資訊。',
  },
  '/contact': {
    k: 'contact',
    t: '聯繫我們｜' + BRAND,
    d: '臉書社團、粉絲專頁、宵夜團與其他聯繫管道。有問題想問，從這裡找我們。',
  },
};

const NOTFOUND = {
  k: 'home',
  t: '找不到這個頁面｜' + BRAND,
  d: '這個網址不存在，或是已經換過位置。',
};

const HEAD =
  '<meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=' + VER + '">';

const SCRIPTS =
  '<script src="/assets/copy.js?v=' + VER + '"></script>' +
  '<script src="/assets/calendar.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes2.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes3.js?v=' + VER + '"></script>' +
  '<script src="/assets/fixes4.js?v=' + VER + '"></script>';

// 顏色那一句拿掉：月曆上看一眼就知道，不用先用文字說明
const LEDE = '每月書聚與活動都在下面的月曆上，可以往前往後翻。';

function attr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function meta(page, canonical) {
  const t = attr(page.t);
  const d = attr(page.d);
  return '<meta name="description" content="' + d + '">' +
    '<link rel="canonical" href="' + attr(canonical) + '">' +
    '<meta property="og:type" content="website">' +
    '<meta property="og:site_name" content="' + attr(BRAND) + '">' +
    '<meta property="og:locale" content="zh_TW">' +
    '<meta property="og:url" content="' + attr(canonical) + '">' +
    '<meta property="og:title" content="' + t + '">' +
    '<meta property="og:description" content="' + d + '">' +
    '<meta property="og:image" content="' + OGIMG + '">' +
    '<meta name="twitter:card" content="summary_large_image">' +
    '<meta name="twitter:title" content="' + t + '">' +
    '<meta name="twitter:description" content="' + d + '">' +
    '<meta name="twitter:image" content="' + OGIMG + '">';
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  // 結尾的斜線一律忽略：/docs 和 /docs/ 視為同一頁，canonical 統一成沒有斜線的那個
  let path = url.pathname.replace(/\/+$/, '');
  if (path === '' || path === '/index.html') path = '/';

  const page = PAGES[path];
  const isPage = !!page;

  let res = await context.next();
  let ct = res.headers.get('content-type') || '';

  /* Cloudflare Pages 對「不存在的檔案」會自動回單頁的 index.html，
     所以 /docs 這種路徑通常直接就拿得到 HTML。
     萬一哪天這個行為變了，這裡再自己去抓一次 index.html 當備援。 */
  if (isPage && (res.status >= 400 || !ct.includes('text/html'))) {
    try {
      const a = await context.env.ASSETS.fetch(new URL('/index.html', url).toString());
      if (a && a.ok) { res = new Response(a.body, a); ct = res.headers.get('content-type') || ''; }
    } catch (e) { /* 抓不到就維持原本的回應 */ }
  }

  if (!ct.includes('text/html')) return res;

  const P = page || NOTFOUND;
  const canonical = SITE + (path === '/' ? '/' : path);

  let nthP = 0;
  let nthSec = 0;

  const out = new HTMLRewriter()
    .on('title', {
      element(el) {
        el.before(HEAD, { html: true });
        el.setInnerContent(P.t);
        el.after(meta(P, canonical), { html: true });
      },
    })
    .on('div.embed', {
      element(el) { el.replace('<div id="calMount"><p style="color:#918B81;font-size:13px">讀取行事曆中…</p></div>', { html: true }); },
    })
    .on('[data-pg="calendar"] .top h2', {
      element(el) { el.setInnerContent('高雄讀書會行事曆'); },
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
      element(el) { el.after(SCRIPTS, { html: true }); },
    })
    .transform(res);

  // 不認得的路徑：內容照樣給（不會變成空白頁），但狀態碼誠實回 404
  if (!isPage) {
    const h = new Headers(out.headers);
    h.set('x-robots-tag', 'noindex');
    return new Response(out.body, { status: 404, headers: h });
  }
  return out;
}
