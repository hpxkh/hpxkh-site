/* 第三批小調整。

   為什麼又開一個檔（fixes.js → fixes2.js → fixes3.js → 這裡）：
   推檔時必須整份重送，檔案越大越慢也越容易出錯
   （payload 約 67 KB 就會被截斷）。fixes.js 四萬多字早就不能再動，
   所以新的東西一律開新檔，各自管一件事：
     fixes.js   版面與結構（大宗，已凍結）
     fixes2.js  第二批版面調整
     fixes3.js  乾淨網址的前端路由
     fixes4.js  這裡

   這一批做的事：
   1. 關於我們 → 里程碑：改讀 copy.js 的 TX.mile 重畫，補上九屆大聚
   2. 新人指引的四個區塊：卡片少的那格，尾巴不要留一塊空白
   3. 活動花絮下架：拿掉頁尾選單那條連結
   4. 常見問題：每一題前面補上編號（四區各自從 01 開始）

   文字與資料一律放 assets/copy.js，這裡只處理版面與行為。
   改完記得把 functions/[[path]].js 的 VER 換掉。 */
(function () {
  var TX = window.HPXKH_TX || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function css() {
    if (document.getElementById('hpxkhFix4Css')) return;
    var s = document.createElement('style');
    s.id = 'hpxkhFix4Css';
    s.textContent =
      /* ── 新人指引：卡片少的那一格，尾巴不要空一塊 ──
         四個區塊（先認識我們／參加第一場／要用到再查／社團之外）在桌機是用
         grid subgrid 綁在一起的，所以「卡片區」(.step__b) 四格一律等高。
         卡片數不一樣時，少的那格就會在最後一張卡下面留一大塊白
         （例：Step 3 只有 2 張卡 165px，框卻被撐到 271px，尾巴空 106px）。
         讓卡片把多出來的高度平分掉，最後一張卡的底線就和隔壁欄切齊。
         只加 flex-grow，不動 flex-basis／flex-shrink，所以：
           · 卡片剛好填滿的那幾格（剩餘空間 0）完全不受影響
           · 手機版一欄時本來就沒有多餘高度，也不受影響
           · 「剛加入可以做什麼」那格的 .step__b 被 fixes.js 改成 grid，
             grid 項目不吃 flex-grow，同樣不受影響
         實測 1440／1200／900／700／393 五種寬度、三個分頁，尾巴空白都歸零。 */
      '.step__b>a{flex-grow:1}' +
      /* ── 常見問題的題號 ──
         summary 本來就是 flex（gap:14px），題號當成第一個項目塞進去就好。
         寬度用固定 px 而不是 em：答案那段 <p> 要靠同一個變數縮排，
         但兩者字級不同，用 em 會對不齊。
         560px 以下不縮排答案，免得手機上白白吃掉一截寬度。 */
      '.faq{--faqn:28px}' +
      '.faqn{flex:0 0 var(--faqn);font-family:var(--display);font-size:12.5px;' +
        'letter-spacing:.14em;color:var(--muted,#918B81);padding-top:4px;' +
        'font-weight:600;transition:color .15s}' +
      '.faq details[open] summary .faqn{color:var(--orange,#EF8200)}' +
      '@media (min-width:560px){.faq p{padding-left:calc(20px + var(--faqn) + 14px)}}';
    document.head.appendChild(s);
  }

  /* ── 活動花絮下架 ──
     頁面本體（index.html 的 .pg[data-pg="gallery"]）沒有刪，只是不再有入口：
       · 這裡把頁尾選單那條 <li> 拿掉
       · fixes3.js 的 PAGES／TITLE 拿掉 gallery，站內路由不再認這個路徑
       · functions/[[path]].js 的 PAGES 拿掉 /gallery，直接回 404 + noindex
       · sitemap.xml 拿掉那一行
     要復活就把上面四處加回去，index.html 完全不用動。
     用 querySelectorAll 同時比對新舊兩種寫法：fixes3.js 會把 #/gallery
     改寫成 /gallery，但萬一載入順序變了，兩種都抓得到。 */
  function dropGallery() {
    var as = document.querySelectorAll(
      'a[href="/gallery"],a[href="#/gallery"],a[href="/#/gallery"]');
    for (var i = 0; i < as.length; i++) {
      var el = (as[i].closest && as[i].closest('li')) || as[i];
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }

  /* ── 常見問題：每一題補上編號 ──
     四區（加入社團／參加書聚／聚會形式／開一場書聚）各自從 01 重新數，
     因為它們是四個分頁，連號反而讓人以為漏看了前面幾題。
     題目文字在 index.html 的 FAQG 裡，這裡只加編號這個裝飾，
     真的要改題目還是去改資料。
     加過就不再加（檢查 .faqn），避免重跑時變成兩層編號。 */
  function faqNums() {
    var lists = document.querySelectorAll('#faqPanels .faq');
    for (var i = 0; i < lists.length; i++) {
      var ds = lists[i].children, n = 0, j;
      for (j = 0; j < ds.length; j++) {
        if (ds[j].tagName !== 'DETAILS') continue;
        n += 1;
        var sm = ds[j].querySelector('summary');
        if (!sm || sm.querySelector('.faqn')) continue;
        var tag = document.createElement('span');
        tag.className = 'faqn';
        tag.setAttribute('aria-hidden', 'true');   // 讀螢幕軟體念題目就好，不用念編號
        tag.textContent = (n < 10 ? '0' : '') + n;
        sm.insertBefore(tag, sm.firstChild);
      }
    }
  }

  /* 里程碑。
     index.html 裡原本有一份寫死的 MILE，只有七條，缺了「大聚」這條主線。
     那個檔 214 KB 改不動，所以這裡直接用 TX.mile 把 #mile 整個重畫，
     標籤結構跟原本一模一樣（<li><time><b><span>），CSS 完全沿用，
     連捲動進場動畫（.mile.rv）也照舊。

     什麼時候跑：index.html 的行內程式先填好舊的七條，這裡再覆蓋。
     兩者都在 DOMContentLoaded 之前／之後各自完成，不會互相打架。 */
  function mileList() {
    var ol = document.getElementById('mile');
    var M = TX.mile;
    if (!ol || !M || !M.length) return;

    ol.innerHTML = M.map(function (m) {
      return '<li' + (m.c ? ' class="' + esc(m.c) + '"' : '') + '>' +
        '<time>' + esc(m.d) + '</time>' +
        '<b>' + esc(m.t) + '</b>' +
        (m.s ? '<span>' + esc(m.s) + '</span>' : '') +
        '</li>';
    }).join('');

    /* 進場動畫是用 IntersectionObserver 逐項加 .in 的（見 index.html 的 .rv）。
       我們把 <li> 全部換掉之後，原本被觀察的那幾個節點已經不存在，
       新的這幾個不會被加上 .in，整串就會停在 opacity:0 看不見。
       這裡不重接觀察器（那是 index.html 的私有邏輯），
       直接把這一串標記成已進場即可 —— 里程碑本來就在分頁裡，
       點開分頁時通常已經在畫面上了。 */
    if (ol.classList.contains('rv')) {
      ol.classList.add('in');
      var li = ol.children, i;
      for (i = 0; i < li.length; i++) li[i].classList.add('in');
    }
  }

  function run() {
    css();
    dropGallery();
    faqNums();
    mileList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
