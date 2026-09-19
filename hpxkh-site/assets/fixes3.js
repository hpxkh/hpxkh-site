/* 乾淨網址：把 #/xxx 換成 /xxx。

   為什麼要改：
   原本全站是 hash 路由 —— https://www.hpxkh.com/#/docs
   # 後面的東西瀏覽器「不會」送給伺服器，伺服器看到的永遠是 /。
   結果十一個頁面對搜尋引擎來說只有一個網址、一組標題、一段描述、一張分享縮圖，
   內容再完整也只能擠在同一個網址底下互相搶排名；
   分享到 FB／LINE 時，不管分享哪一頁，預覽卡都長一樣。

   改成 https://www.hpxkh.com/docs 之後，每一頁有自己的網址、
   自己的 <title>、描述與 og 卡片、自己的 canonical，也進得了 sitemap.xml。

   伺服器那一半在 functions/[[path]].js（依路徑塞 meta）。
   這個檔負責前端這一半：
     · 把站內所有 #/xxx 連結改寫成 /xxx（含後來才產生的連結）
     · 點連結時用 History API 換頁，不整頁重載
     · 舊的 #/xxx 網址（已經散在 FB、LINE 上的）自動換成新網址

   為什麼不直接改 index.html 裡的 route()：
   那支函式只認 location.hash，而 index.html 是 214KB 的單一大檔，
   每次改動都得整份重送，風險太高。這裡另外寫一份等價的 render()。
   兩邊不會打架 —— 沒有人再去動 hash，hashchange 就不會觸發，
   route() 在首次載入之後不會再跑。

   為什麼又另開一個檔（fixes.js → fixes2.js → 這裡）：
   推檔時必須整份重送，檔案越大越容易出事。fixes.js 四萬多字已經不能再動，
   fixes2.js 也到一萬七，所以路由自己一個檔。

   載入順序：排在 fixes2.js 之後（fixes.js 的申請表卡片要先建好）。
   改完記得把 functions/[[path]].js 的 VER 換掉。 */
(function () {
  var PAGES = ['home', 'about', 'start', 'meetups', 'calendar', 'docs',
    'faq', 'rules', 'venues', 'contact'];   // gallery（活動花絮）已下架

  /* ★ 這份標題表必須和 functions/[[path]].js 的 PAGES 一字不差。
     伺服器先寫好 <title>，這裡換頁時會再寫一次；不一致的話
     進站後標題會被這裡蓋掉，搜尋結果和實際看到的就對不上。 */
  var B = 'HPX 高雄讀書會';
  var TITLE = {
    home: B + '｜高雄的共讀社群',
    about: '關於我們｜' + B,
    start: '新人指引｜' + B,
    meetups: '社團書聚｜' + B,
    calendar: '行事曆｜' + B,
    docs: '申請與文件｜' + B,
    faq: '常見問題｜' + B,
    rules: '社團版規｜' + B,
    venues: '常辦書聚地點｜' + B,
    contact: '聯繫我們｜' + B
  };

  /* 進站時 index.html 的 route() 只看 hash，會先把首頁顯示出來，
     下面的 render() 才把畫面換成網址指的那一頁。兩件事之間，
     瀏覽器有機會先畫出一格首頁。所以深層網址先把內容藏起來，換好頁再放出來。
     萬一 JS 出錯，1.5 秒後也會自己放出來，絕不會留下一片白。 */
  function unguard() {
    var s = document.getElementById('hpxkhRouteGuard');
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }
  (function guard() {
    var p = location.pathname || '/';
    if (p === '/' || p === '/index.html' || !document.head) return;
    var s = document.createElement('style');
    s.id = 'hpxkhRouteGuard';
    s.textContent = '.pg{visibility:hidden}';
    document.head.appendChild(s);
    setTimeout(unguard, 1500);
  })();

  /* 任何一段 href → 頁面代號；不是站內頁面就回 null（那就別攔它）。
     吃得下：#/docs、/#/docs、/docs、/docs/、https://www.hpxkh.com/#/docs */
  function keyOf(raw) {
    if (raw === null || raw === undefined) return null;
    var s = String(raw).trim();
    if (!s || s === '#' || s === '/#') return null;          // 佔位用的 # 不要動
    if (/^(mailto:|tel:|javascript:)/i.test(s)) return null;
    if (/^(https?:)?\/\//i.test(s)) {
      var m = s.match(/^(?:https?:)?\/\/([^/?#]+)([/?#].*)?$/i);
      if (!m) return null;
      var host = m[1].toLowerCase().replace(/^www\./, '');
      if (host !== String(location.hostname).toLowerCase().replace(/^www\./, '')) return null;
      s = m[2] || '/';
    }
    s = s.replace(/^\/?#\/?/, '');            // "#/docs"、"/#/docs" → "docs"
    s = s.replace(/^\//, '').replace(/\/+$/, '');
    if (s === '' || s === 'index.html') return 'home';
    if (s.indexOf('/') !== -1 || s.indexOf('?') !== -1 || s.indexOf('#') !== -1) return null;
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i] === s) return s;
    return null;
  }

  function pathOf(k) { return k === 'home' ? '/' : '/' + k; }
  function curKey() { return keyOf(location.pathname) || 'home'; }

  /* 等同於 index.html 裡的 route()，只是改看路徑而不是 hash */
  function render(k, top) {
    var pgs = document.querySelectorAll('.pg'), i;
    for (i = 0; i < pgs.length; i++) pgs[i].hidden = (pgs[i].getAttribute('data-pg') !== k);
    document.title = TITLE[k] || TITLE.home;
    var as = document.querySelectorAll('#nav a[href]');
    for (i = 0; i < as.length; i++) {
      if (keyOf(as[i].getAttribute('href')) === k) as[i].setAttribute('aria-current', 'page');
      else as[i].removeAttribute('aria-current');
    }
    if (typeof syncNav === 'function') syncNav(false);
    if (top) window.scrollTo({ top: 0, behavior: 'instant' });
    unguard();
  }

  /* 把還寫著 #/xxx 的連結改成 /xxx。
     只看含 # 的 href，已經是路徑的不必動，外部連結也不會被碰到。 */
  function linkFix(root) {
    var as = (root || document).querySelectorAll('a[href*="#"]'), i, k;
    for (i = 0; i < as.length; i++) {
      k = keyOf(as[i].getAttribute('href'));
      if (k) as[i].setAttribute('href', pathOf(k));
    }
  }

  /* 站內有些連結指的就是申請與文件頁的某一張表
     （首頁的「加入社團申請」、開書聚的「書聚徽章申請」、常見問題頁尾的「許願池」）。
     fixes.js 原本靠 hashchange 判斷「切到 #/docs 了」才展開那張表，
     現在沒有 hash 了，改由這裡在換頁後直接點那張卡片。 */
  var pend = null;
  function docsDeep(k) {
    if (k !== 'docs') { pend = null; return; }
    var want = pend; pend = null;
    setTimeout(function () {
      var cards = document.querySelectorAll('.dcard'), i, h, t, hit = null;
      if (want) {
        for (i = 0; i < cards.length; i++) {
          h = cards[i].querySelector('.dcard__h');
          t = h ? h.textContent.trim() : '';
          if (t && want.indexOf(t) !== -1) { hit = cards[i]; break; }
        }
      }
      var op = document.querySelector('.dcard[aria-expanded="true"]');
      if (hit) { if (hit !== op) hit.click(); }   // openTab 會先把別的收起來
      else if (op) op.click();                   // 沒指定就全部收起，清單完整顯示
    }, 50);
  }

  function go(k) {
    var p = pathOf(k);
    if (location.pathname !== p || location.hash) {
      try { history.pushState({ hpx: k }, '', p); } catch (e) { location.href = p; return; }
    }
    render(k, true);
    docsDeep(k);
  }

  function router() {
    // 舊網址（FB／LINE 上已經散出去的 #/xxx）換成新網址，不重新載入
    if (/^#\/?./.test(location.hash)) {
      var lk = keyOf(location.hash);
      if (lk) { try { history.replaceState({ hpx: lk }, '', pathOf(lk)); } catch (e) {} }
    }
    render(curKey(), false);
    linkFix();

    // 表單、卡片等等是後面才產生的，這些連結也要一起換掉
    if (window.MutationObserver) {
      var tid = 0;
      new MutationObserver(function () {
        if (tid) return;
        tid = setTimeout(function () { tid = 0; linkFix(); }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var k = keyOf(a.getAttribute('href'));
      if (!k) return;
      pend = (k === 'docs') ? (a.textContent || '').trim() : null;
      e.preventDefault();
      go(k);
    });

    window.addEventListener('popstate', function () { render(curKey(), false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', router);
  else router();
})();
