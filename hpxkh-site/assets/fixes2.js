/* 前端版面調整（第二批）。

   為什麼分成兩個檔：assets/fixes.js 已經四萬多字，每次改動都得整份重送，
   又慢又容易出錯。新增的東西改放這裡，載入順序排在 fixes.js 之後，
   所以這裡的樣式會蓋過前面同名的規則（選擇器權重相同時，後面的贏）。

   這一批做的事：
   1. 關掉 text-wrap:balance —— 右邊那一大片空白的主因之一
   2. 手機選單打開時在後面壓一層遮罩，並鎖住背景捲動
   3. 社團版規十條改成點開才看內容，上面一顆「全部展開／全部收合」
   4. 加入社團申請最後補一題「已閱讀並同意社團版規」（必填）
   5. 幾段自己佔整欄卻只排到一半的文字，行長放寬
   6. 首頁網站導覽改成脈絡圖：先分四類，分類底下才是頁面（尚未啟用）
   7. H·P·X 在手機改成「大字母在左、字在右」，不再直直排下來

   文字一律放 assets/copy.js，這裡只處理版面與行為。
   改完記得把 functions/index.js 的 VER 換掉。 */
(function () {
  var TX = window.HPXKH_TX || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function css() {
    if (document.getElementById('hpxkhFix2Css')) return;
    var s = document.createElement('style');
    s.id = 'hpxkhFix2Css';
    s.textContent =
      /* ── 右邊那一大片空白 ──
         原始碼在標題與段落上用了 text-wrap: balance / pretty。
         這兩個值是為英文設計的：balance 會把一段字平均分到每一行，
         讓排版看起來均衡——但中文沒有字間空格，平均分的結果就是
         每一行都只排到一半，右邊空一大塊（兩行的標題可能只用掉六成寬度）。
         全站轉回正常換行：排滿一行再換下一行。
         ★ 之後不要再在中文頁面上用 text-wrap:balance。 */
      'h1,h2,h3,h4,h5,h6,p,li,dd,dt,figcaption,blockquote,' +
        'span,em,b,strong,small,label,button,a{text-wrap:wrap}' +
      /* 這個右側留白只能在桌機做：手機上 22vw 等於把快四成的寬度留給空白。 */
      '#startCan .step__d{padding-right:0}' +
      '@media (min-width:760px){#startCan .step__d{padding-right:clamp(20px,14vw,320px)}}' +
      /* 這兩段都是自己佔整欄，行長再拉寬一點才不會右邊空一半 */
      '.faq__ask{max-width:58em}' +
      '.stats__lead{max-width:32em}' +
      /* ── 手機選單的遮罩 ──
         選單是直接疊在頁面上的，下半部的內容還是滿色滿字，
         還會被選單底部切到一半，看起來像破掉。
         打開時在後面壓一層深色遮罩：焦點回到選單，
         點遮罩（或按 Esc）就關起來，背景也不會跟著捲。 */
      '.navsc{position:fixed;inset:0;z-index:55;background:rgba(28,25,22,.5);' +
        '-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);' +
        'opacity:0;pointer-events:none;transition:opacity .18s ease}' +
      '.navsc--on{opacity:1;pointer-events:auto}' +
      'body.navopen{overflow:hidden}' +
      '@media (prefers-reduced-motion:reduce){.navsc{transition:none}}' +
      '@media (min-width:821px){.navsc{display:none}}' +
      /* ── 社團版規：改成點開才看內容 ──
         十條規範一次全攤開有兩百多行，要找某一條得一直捲。
         收起來之後整頁就是十個標題，想看哪一條點哪一條。 */
      '.rulex__h{cursor:pointer;user-select:none}' +
      '.rulex__h:hover h4{color:var(--orange,#EF8200)}' +
      '.rulex__g{margin-left:auto;flex:0 0 auto;color:var(--orange,#EF8200);font-size:14px;' +
        'transition:transform .15s}' +
      '.rulex__h[aria-expanded="true"] .rulex__g{transform:rotate(90deg)}' +
      '.rulex__h[aria-expanded="false"]{margin-bottom:0}' +
      '.rulex ul[hidden]{display:none}' +
      '.rulex__h:focus-visible{outline:2px solid var(--orange,#EF8200);outline-offset:3px}' +
      /* 版規那一顆「全部展開／全部收合」沿用常見問題的樣式；
         fixes.js 已經定義過 .faqtog，這裡只補版規頁沒有它時的保險。 */
      '.rules + .faqtog,.faqtog{display:flex;justify-content:flex-end;margin:0 0 10px}' +
      /* ── H·P·X：手機改成橫的 ──
         桌機是三欄並排，照簡報。但手機只有一欄，
         三組字直排下來會拉得很長，右邊又整片空著。
         改成：大字母靠左、字排在它右邊，三組就往上收，
         寬度也用滿了。700px 以上不動，還是簡報那一頁的三欄。 */
      '@media (max-width:699px){' +
        '.hpx3{gap:clamp(20px,5vw,30px)}' +
        '.hpx3__c{display:grid;grid-template-columns:2.1em minmax(0,1fr);' +
          'column-gap:clamp(14px,4.5vw,22px);align-items:start;padding-right:0}' +
        '.hpx3__l{grid-column:1;grid-row:1/3;margin-bottom:0;font-size:clamp(38px,11vw,52px)}' +
        '.hpx3__w{grid-column:2;grid-row:1}' +
        '.hpx3__x{grid-column:2;grid-row:2;margin-top:2px}' +
      '}' +
      /* ── 首頁網站導覽：脈絡圖 ──
         不是七張平鋪的卡，而是一棵樹：上面一條主幹（社團），
         分四個枝（你現在想做什麼），每個枝下面才是頁面。
         線都是用 border 畫的，沒有圖也沒有 SVG，手機上自動疊成一直行。 */
      '#siteTree{--tw:1px;--tc:var(--hair)}' +
      '.stree__root{display:flex;align-items:center;gap:12px;margin:0 0 6px}' +
      '.stree__root b{font-family:var(--display);font-size:clamp(15px,1.7vw,18px);' +
        'letter-spacing:.06em;color:var(--ink);white-space:nowrap}' +
      '.stree__root i{flex:1 1 auto;height:var(--tw);background:var(--tc);display:block}' +
      '.stree__root s{flex:0 0 auto;width:7px;height:7px;background:var(--orange,#EF8200);' +
        'transform:rotate(45deg);text-decoration:none}' +
      '.stree{display:grid;grid-template-columns:1fr;gap:0}' +
      '.stree__b{position:relative;padding:18px 0 4px 18px;border-left:var(--tw) solid var(--tc)}' +
      '.stree__b:last-of-type{border-left-color:transparent}' +
      '.stree__k{position:relative;margin:0 0 10px;font-size:12px;letter-spacing:.12em;' +
        'color:var(--muted,#918B81)}' +
      '.stree__k::before{content:"";position:absolute;left:-18px;top:.7em;' +
        'width:14px;height:var(--tw);background:var(--tc)}' +
      '.stree__b:last-of-type>.stree__k::after{content:"";position:absolute;left:-19px;top:0;' +
        'width:var(--tw);height:.7em;background:var(--tc)}' +
      '.stree__i{display:grid;grid-template-columns:1fr;gap:8px}' +
      '.tcard{display:block;position:relative;padding:13px 15px;' +
        'border:1px solid var(--hair);background:var(--sheet);' +
        'transition:background .15s,border-color .15s,transform .15s}' +
      'a.tcard:hover{background:var(--cream);border-color:var(--orange,#EF8200);transform:translateX(2px)}' +
      '.tcard b{display:block;font-size:15px;font-weight:600;color:var(--ink)}' +
      '.tcard p{margin:4px 0 0;font-size:12.5px;line-height:1.75;color:var(--ink-2)}' +
      '.tcard em{position:absolute;right:13px;top:13px;font-style:normal;' +
        'color:var(--orange,#EF8200);font-size:14px}' +
      '.tcard--soon{border-style:dashed;background:transparent}' +
      '.tcard--soon b,.tcard--soon p{color:var(--muted,#918B81)}' +
      '.tcard--soon em{font-size:10.5px;letter-spacing:.12em;color:var(--muted,#918B81);top:15px}' +
      '.stree__soon{margin-top:14px;padding-top:16px;border-top:var(--tw) dashed var(--tc)}' +
      '.stree__soon .stree__k::before,.stree__soon .stree__k::after{display:none}' +
      '@media (min-width:700px){' +
        '.stree__soon .stree__i{grid-template-columns:repeat(3,minmax(0,1fr))}' +
      '}' +
      /* 桌機：四個枝並排，每個枝從上方的主幹垂下來一條線。 */
      '@media (min-width:900px){' +
        '.stree{grid-template-columns:repeat(4,minmax(0,1fr));gap:0 clamp(16px,2vw,26px)}' +
        '.stree__b{padding:26px 0 0;border-left:0}' +
        '.stree__b::before{content:"";position:absolute;left:0;top:0;' +
          'width:var(--tw);height:22px;background:var(--tc)}' +
        '.stree__k::before,.stree__b:last-of-type>.stree__k::after{display:none}' +
        '.stree__k{padding-left:12px}' +
        '.stree__soon{grid-column:1/-1}' +
        '.stree__soon::before{display:none}' +
      '}';

    document.head.appendChild(s);
  }

  /* 手機選單打開時，在它後面壓一層遮罩。
     開關還是交給原本那顆「選單」按鈕，這裡只跟著它的狀態走：
     用 MutationObserver 盯 #nav 的 hidden，不碰原本的邏輯。 */
  function navScrim() {
    var nav = document.getElementById('nav');
    var btn = document.getElementById('navbtn');
    if (!nav || !btn || document.querySelector('.navsc')) return;

    var sc = document.createElement('div');
    sc.className = 'navsc';
    sc.setAttribute('aria-hidden', 'true');
    document.body.appendChild(sc);

    function close() { if (!nav.hidden) btn.click(); }
    sc.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    /* ★ 必須先確認「現在是不是抽屜式選單」。
       桌機的 #nav 是一直顯示的橫向選單，永遠不是 hidden；
       若只看 !nav.hidden 就會把它當成「選單打開」，
       連帶把 body 鎖成 overflow:hidden——整個網站在桌機就捲不動了。
       漢堡按鈕只在 820px 以下顯示，用它当作判斷依據最準。 */
    function isDrawer() {
      return getComputedStyle(btn).display !== 'none';
    }
    function sync() {
      var open = isDrawer() && !nav.hidden;
      sc.classList.toggle('navsc--on', open);
      document.body.classList.toggle('navopen', open);
    }
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['hidden'] });
    addEventListener('resize', sync);   // 轉橫第、視窗縮放時重算
    sync();
  }

  /* 社團版規：十條改成一條一條點開。
     兩個地方都有同一份版規（關於我們的分頁、以及獨立的版規頁），一起處理。
     標題那一列本身就是開關，上面再放一顆「全部展開／全部收合」。 */
  function rulesFold() {
    var grids = [document.getElementById('rulesGrid'), document.getElementById('rulesGrid2')];
    grids.forEach(function (grid) {
      if (!grid || grid.getAttribute('data-fold')) return;
      var items = grid.querySelectorAll('.rulex');
      if (!items.length) return;
      grid.setAttribute('data-fold', '1');

      var heads = [];
      for (var i = 0; i < items.length; i++) {
        (function (art) {
          var head = art.querySelector('.rulex__h');
          var list = art.querySelector('ul');
          if (!head || !list) return;
          var g = document.createElement('span');
          g.className = 'rulex__g';
          g.setAttribute('aria-hidden', 'true');
          g.textContent = '→';
          head.appendChild(g);
          head.setAttribute('role', 'button');
          head.setAttribute('tabindex', '0');
          function set(open) {
            list.hidden = !open;
            head.setAttribute('aria-expanded', open ? 'true' : 'false');
          }
          head.addEventListener('click', function () {
            set(head.getAttribute('aria-expanded') !== 'true');
            label();
          });
          // 鍵盤也要能開關（空白鍵預設會捲動頁面，要擋掉）
          head.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            set(head.getAttribute('aria-expanded') !== 'true');
            label();
          });
          set(false);                       // 預設全部收起
          heads.push({ h: head, s: set });
        })(items[i]);
      }
      if (!heads.length) return;

      var bar = document.createElement('div');
      bar.className = 'faqtog';
      var btn = document.createElement('button');
      btn.type = 'button';
      bar.appendChild(btn);
      grid.parentNode.insertBefore(bar, grid);

      function allOpen() {
        for (var j = 0; j < heads.length; j++) {
          if (heads[j].h.getAttribute('aria-expanded') !== 'true') return false;
        }
        return true;
      }
      function label() {
        btn.textContent = allOpen() ? (TX.faqFold || '全部收合')
                                    : (TX.faqOpen || '全部展開');
      }
      btn.addEventListener('click', function () {
        var open = !allOpen();
        for (var j = 0; j < heads.length; j++) heads[j].s(open);
        label();
      });
      label();
    });
  }

  /* 加入社團申請：最後補一題版規同意。
     入社前看過版規對雙方都好，所以做成必填的勾選；
     表單開頭的說明也寫了「填寫並送出即視同同意」，兩邊互相呼應。
     欄位內容在 copy.js 的 forms.joinAgree。
     fixes.js 那邊已經把表單建好了，所以這裡補完欄位要再重建一次。 */
  function joinAgreement() {
    if (typeof FORMS === 'undefined' || typeof buildForm !== 'function') return;
    var spec = FORMS.join;
    var mount = document.getElementById('formJoin');
    var A = (TX.forms || {}).joinAgree;
    if (!spec || !spec.fields || !mount || !A) return;
    for (var i = 0; i < spec.fields.length; i++) {
      if (spec.fields[i].k === A.k) return;        // 已經有了，不重複
    }
    spec.fields.push(A);                            // 一定排在最後一題
    if (TX.forms && TX.forms.joinIntro) spec.intro = TX.forms.joinIntro;
    buildForm(mount, spec);
  }

  /* 首頁網站導覽改成脈絡圖。
     fixes.js 裡的 homeMap() 已經放了一個 #siteMap，這裡把它換掉：
     先分四類（你現在想做什麼），分類底下才是頁面，
     分類本身就回答了「我現在該點哪一個」。內容在 copy.js 的 siteTree。 */
  function siteTree() {
    var M = TX.siteTree;
    var old = document.getElementById('siteMap');
    if (!M || document.getElementById('siteTree')) return;
    var home = document.querySelector('[data-pg="home"]');
    if (!home) return;

    function card(it, soon) {
      var head = '<b>' + esc(it.h) + '</b><p>' + esc(it.d) + '</p>' +
        '<em aria-hidden="true">' + (soon ? esc(M.soon.k || '籌備中') : '→') + '</em>';
      if (soon || !it.u) return '<div class="tcard tcard--soon">' + head + '</div>';
      var ext = it.u.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener"';
      return '<a class="tcard" href="' + esc(it.u) + '"' + ext + '>' + head + '</a>';
    }
    function branch(g, soon) {
      return '<div class="stree__b' + (soon ? ' stree__soon' : '') + '">' +
        '<p class="stree__k">' + esc(g.k) + '</p><div class="stree__i">' +
        (g.items || []).map(function (it) { return card(it, soon); }).join('') +
        '</div></div>';
    }

    var sec = document.createElement('section');
    sec.className = 'sec pad';
    sec.id = 'siteTree';
    sec.innerHTML =
      '<div class="blk__h"><h3>' + esc(M.title || '網站導覽') + '</h3>' +
      '<p>' + esc(M.lede || '') + '</p></div>' +
      '<div class="stree__root"><s aria-hidden="true"></s><b>' + esc(M.root || '') + '</b>' +
      '<i aria-hidden="true"></i></div>' +
      '<div class="stree">' +
      (M.branches || []).map(function (g) { return branch(g, false); }).join('') +
      (M.soon ? branch(M.soon, true) : '') +
      '</div>';

    if (old && old.parentNode) old.parentNode.replaceChild(sec, old);
    else {
      var kids = home.children, secs = [], k;
      for (k = 0; k < kids.length; k++) if (kids[k].tagName === 'SECTION') secs.push(kids[k]);
      var last = secs[secs.length - 1];
      if (last) home.insertBefore(sec, last); else home.appendChild(sec);
    }
  }

  function run() {
    css();
    navScrim();
    rulesFold();
    joinAgreement();
    // siteTree();   ← 網站導覽的脈絡圖，確認版型後把這行的註解拿掉就上線
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
