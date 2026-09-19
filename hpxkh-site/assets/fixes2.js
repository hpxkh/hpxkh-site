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

   文字一律放 assets/copy.js，這裡只處理版面與行為。
   改完記得把 functions/index.js 的 VER 換掉。 */
(function () {
  var TX = window.HPXKH_TX || {};

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
      '.rules + .faqtog,.faqtog{display:flex;justify-content:flex-end;margin:0 0 10px}';
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

    function sync() {
      var open = !nav.hidden;
      sc.classList.toggle('navsc--on', open);
      document.body.classList.toggle('navopen', open);
    }
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['hidden'] });
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

  function run() {
    css();
    navScrim();
    rulesFold();
    joinAgreement();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
