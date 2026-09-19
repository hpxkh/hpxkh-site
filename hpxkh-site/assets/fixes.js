/* 前端版面調整。等 index.html 整理過後可以併回原始碼。
   1. 頁尾與聯繫頁卡片的「高雄讀會」錯字（少一個「書」字）
   2. 社團書聚：領域分布／歷年書單／歷年場次合成一個分頁，用三顆按鈕切換
   3. 表單：加入社團申請補題目與可複選、居住縣市改下拉、推薦場地改版、徽章補說明與欄位
   4. 關於我們：H·P·X 改成三張並排卡片，併進「社團介紹」；分頁改名「適不適合你」；
      里程碑頁移除「未來展望」
   5. 新人指引：多一個「剛加入可以做什麼」分頁；拿掉 Part 01／02；路徑依 copy.js 重繪
   6. 首頁與新人指引補上「加入社團申請」的入口；首頁那顆「歷年場次」直接跳到對的檢視
   7. 九種聚會形式排成 3×3
   8. 全站段落寬度改用 em（原本用 ch，對中文來說太窄）
   9. 申請與文件：七張表改成「先選表、再填表」的卡片清單（兩類），並新增「許願池」；
      站內指向某一張表的連結會直接開那一張
  10. 步驟區塊的欄數配合實際張數，不再固定三欄
  11. 開書聚：書聚的精神移到四個階段前面，流程內容在 copy.js
  12. 常見問題頁尾補一句話，導向私訊粉專（刻意不放表單）
  13. 收掉每一頁分頁列上下的大片空白
  14. 統一每一頁版頭（.top）的高度，細線與分頁按鈕一律對齊
  15. 關於我們：H·P·X 那一段加底色，跟上下兩段的社團介紹分開

   ★ 只是要改文字或調動步驟順序的話，不要動這個檔案 —— 改 assets/copy.js 就好。
     卡片說明想標重點，就在 copy.js 用 dHtml 取代 d，可用 <b>、<span class="k">（橘色）、
     <span class="r">（另起一段、上面加一條細線）。 */
(function () {
  var TX = window.HPXKH_TX || {};          // 文字與步驟資料都放在 copy.js
  var START_TX = TX.start || {};
  var IMGS = (typeof IMG !== 'undefined') ? IMG : {};

  function fix(root) {
    if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeValue.indexOf('高雄讀會') !== -1) {
        n.nodeValue = n.nodeValue.replace(/高雄讀會/g, '高雄讀書會');
      }
    }
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 共用樣式（一次注入） */
  function css() {
    if (document.getElementById('hpxkhFixCss')) return;
    var s = document.createElement('style');
    s.id = 'hpxkhFixCss';
    s.textContent =
      /* ── 段落寬度 ──
         原始碼用 ch 當上限（60ch、66ch…）。ch 是數字「0」的寬度，
         中文字大約是它的兩倍，所以 60ch 實際只排得下 30 個中文字，
         段落排到容器四成就斷行，右邊空一大片。
         改用 em：1em 剛好等於一個中文字，數字就是每行的字數。
         注意：有底色的元素不能設 max-width，底色會跟著縮一半（例如 .step__d），
         那種要用 padding-right 控制行長。 */
      '.top p{max-width:42em}' +
      '.blk__h p{max-width:44em}' +
      '.prose{max-width:42em}' +
      '.sec-lede{max-width:44em}' +
      '.band p{max-width:46em}' +
      '.band2__t p{max-width:52em}' +
      '.embed p{max-width:40em}' +
      '.appform__h p{max-width:54em}' +
      '.part__t p{max-width:46em}' +
      '.end__p{max-width:38em}' +
      '.cal__foot p{max-width:46em}' +
      '#startCan .step__d{padding-right:clamp(20px,22vw,320px)}' +
      /* ── 版頭高度統一 ──
         每頁版頭的結構都一樣（浮水印 → 標題 → 問句 → 一段開場），
         只有開場那段的行數不同（1～3 行），所以每頁的細線與下面那排
         分頁按鈕都落在不同高度，一頁一頁切過去會上下跳。
         兩件事一起做：開場文字統一寫成「桌機 2 行、手機 3 行」以內（見 copy.js），
         再給版頭一個下限高度，字少的頁面自動補空白，細線一律對齊。
         ★ 改開場文案時要顧到這個長度（約 35～50 個中文字），太長會把版頭撐高。 */
      '.pg > .top{min-height:clamp(237px,6.2vw + 213px,292px);box-sizing:border-box}' +
      '.pg > .top p [data-join-note] a{color:var(--orange-dk);' +
        'text-decoration:underline;text-underline-offset:3px}' +
      /* ── 分頁列上下的空白 ──
         每一頁都是：.top（說明文字）→ 細線 → 一段空白 → 分頁按鈕 → 又一段空白 → 內容。
         上下各 32～52px 的留白讓那條細線孤零零地浮在中間，按鈕也像漂著。
         把按鈕收到細線下方，讓細線變成「標頭結束」的分隔，下面再留足夠的呼吸。 */
      '.pg > .top{padding-bottom:clamp(18px,2.2vw,24px)}' +
      '.pg > .top + .pad{padding-top:clamp(16px,1.9vw,20px)!important}' +
      '.pg > .top + .blk{padding-top:clamp(22px,2.6vw,28px)}' +
      '.pg > .top + .pad .tabs{margin-bottom:0}' +
      /* ── 步驟卡片的欄數 ── */
      '@media (min-width:900px){' +
        '#stepPath{grid-template-columns:repeat(2,minmax(0,1fr))}' +   /* 四張 → 2×2 */
        '#hostKit{grid-template-columns:repeat(2,minmax(0,1fr))}' +    /* 兩張 → 並排 */
        '#startCan{grid-template-columns:1fr}' +                       /* 一張 → 滿版 */
        '#startCan .step{grid-row:auto;display:flex}' +
      '}' +
      '@media (min-width:760px){' +
        '#startCan .step__b{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:1fr}' +
        '#startCan .step__b a{border-bottom:1px solid var(--hair)}' +
        '#startCan .step__b a:nth-child(odd){border-right:1px solid var(--hair)}' +
        '#startCan .step__b a:nth-last-child(-n+2){border-bottom:0}' +
      '}' +
      /* 卡片說明裡的重點標示 */
      '.step__b .k{color:var(--orange,#EF8200);font-weight:500}' +
      '.step__b .r{display:block;margin-top:8px;padding-top:8px;border-top:1px solid var(--hair)}' +
      /* 勾選框：原本的勾勾用固定 px 定位，會偏一點。改成置中計算。 */
      '.chk input:checked::after{left:50%;top:50%;width:4px;height:8px;' +
        'transform:translate(-50%,-60%) rotate(45deg)}' +
      '@media (min-width:900px){.chks{grid-template-columns:repeat(4,minmax(0,1fr))}}' +
      /* ── 申請與文件：七張表的入口 ──
         原本是七顆並排的分頁按鈕。問題有兩個：
         (1) 七個標籤擠成一排，「合作提案」「社團外貼文申請」光看名字
             不知道是不是給自己填的，要點開才知道；
         (2) 按鈕緊貼著下面的表單，看起來像黏在一起。
         改成「先選表，再填表」：進來先看到七張卡片，每張有一句話說明誰適合填，
         點了才展開那一張表，上面留一條「← 全部表單」可以回來。 */
      '.dmnu__g + .dmnu__g{margin-top:clamp(24px,3vw,32px)}' +
      '.dmnu__k{font-size:11.5px;letter-spacing:.14em;color:var(--muted,#918B81);margin:0 0 10px}' +
      '.dmnu__b{display:grid;grid-template-columns:1fr;gap:10px}' +
      '@media (min-width:820px){.dmnu__b{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '.dcard{display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;' +
        'padding:clamp(15px,1.8vw,19px) clamp(16px,1.9vw,20px);' +
        'border:1px solid var(--hair);background:transparent;cursor:pointer;' +
        'font:inherit;color:inherit;transition:background .15s,border-color .15s}' +
      '.dcard:hover{background:var(--cream);border-color:var(--muted,#918B81)}' +
      '.dcard__t{flex:1 1 auto;min-width:0}' +
      '.dcard__h{display:block;font-size:15.5px;font-weight:600;line-height:1.5;color:var(--ink)}' +
      '.dcard__d{margin:5px 0 0;font-size:13px;line-height:1.85;color:var(--ink-2)}' +
      '.dcard__g{flex:0 0 auto;margin-top:3px;color:var(--orange,#EF8200);font-size:15px}' +
      /* 回到清單那一條，同時也是表單與上方之間的呼吸 */
      '.dback{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;' +
        'margin-bottom:clamp(16px,2vw,22px);padding-bottom:clamp(12px,1.6vw,16px);' +
        'border-bottom:1px solid var(--hair)}' +
      '.dback__b{border:0;background:transparent;padding:0;font:inherit;font-size:13px;' +
        'color:var(--orange,#EF8200);cursor:pointer}' +
      '.dback__b:hover{text-decoration:underline}' +
      '.dback__t{font-size:13px;color:var(--muted,#918B81)}' +
      /* 常見問題頁尾的一句話 */
      '.faq__ask{font-size:13px;line-height:2;color:var(--ink-3,#918B81);max-width:46em;' +
        'padding-top:clamp(18px,2.4vw,26px);border-top:1px solid var(--hair);margin:0}' +
      '.faq__ask a{color:var(--orange,#EF8200)}' +
      /* 新人指引 */
      '[data-pg="start"] .part{gap:12px;align-items:flex-start}' +
      '[data-pg="start"] .part__k{display:none}' +
      '[data-pg="start"] .part__m{flex:0 0 auto;width:9px;height:9px;border-radius:2px;' +
        'background:var(--orange,#EF8200);transform:rotate(45deg);' +
        'margin-top:calc(clamp(18px,2.3vw,23px) * .5 - 4px)}' +
      '.spirit--top{margin-bottom:clamp(20px,2.6vw,28px)}' +
      /* 社團書聚：三個檢視 */
      '.mtv{margin-top:14px}' +
      '.mtv__s{padding-top:clamp(18px,2.4vw,26px)!important}' +
      /* 九種聚會形式：固定 3×3，不要被 auto-fit 排成 4+4+1 */
      '@media (min-width:620px){#typeCards{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media (min-width:900px){#typeCards{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  /* 重繪 #stepPath / #hostKit / #startCan。
     標籤與 class 沿用 index.html 原本的 .step 樣式，只換內容與分組。
     說明文字用 d（純文字）或 dHtml（可標重點）。 */
  function renderSteps(id, groups) {
    var mount = document.getElementById(id);
    if (!mount || !groups || !groups.length) return;
    mount.innerHTML = groups.map(function (g) {
      var body = (g.items || []).map(function (x) {
        var ext = x.u.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener"';
        var src = x.n ? (IMGS['s' + x.n] || '') : '';
        var ic = src
          ? '<span class="step__ic"><img src="' + esc(src) + '" alt="" loading="lazy"></span>'
          : '<span class="step__ic"></span>';   // 沒有圖示也保留位置，維持對齊
        return '<a href="' + esc(x.u) + '"' + ext + '>' + ic +
          '<span class="step__tx"><span class="step__t">' +
          '<span class="step__n">' + esc(x.n || '') + '</span>' +
          '<h4>' + esc(x.h) + '</h4></span>' +
          '<p>' + (x.dHtml || esc(x.d)) + '</p></span>' +
          '<span class="go" aria-hidden="true">→</span></a>';
      }).join('');
      return '<section class="step">' +
        '<div class="step__h"><span class="step__eye">' + esc(g.eye || '') + '</span>' +
        '<h3>' + esc(g.st) + '</h3></div>' +
        '<p class="step__d">' + esc(g.sd) + '</p>' +
        '<div class="step__b">' + body + '</div></section>';
    }).join('');
  }

  /* 開一場書聚的流程（#flow2）。階段與細項都在 copy.js。
     「書聚的精神」原本排在流程後面，但它是這整段的前提——
     先講清楚不是來上課、每個人都要有貢獻，後面的四個階段才站得住，
     所以把它移到流程前面。 */
  function renderFlow() {
    var m = document.getElementById('flow2');
    if (!m) return;

    var sp = document.querySelector('[data-pg="start"] .spirit');
    if (sp && !sp.classList.contains('spirit--top')) {
      sp.classList.add('spirit--top');
      m.parentNode.insertBefore(sp, m);
    }

    if (!TX.flow || !TX.flow.length) return;
    m.innerHTML = TX.flow.map(function (f) {
      return '<div class="flow__s"><span class="flow__n">' + esc(f.n) + '</span>' +
        '<h4>' + esc(f.h) + '</h4><ul>' +
        (f.i || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
        '</ul></div>';
    }).join('');
  }

  /* H·P·X：三個字母排成三張並排的卡片。
     每張卡由上而下是：大字母 → 1.0 的英文字 → 中文說明 →（分隔線）→「2.0」小標 → 橘色的字。
     三張等高、2.0 那一段靠底對齊，所以分隔線在三張卡上會連成一條水平線。
     整段另外加一層米色底（.hpxband），跟上下兩段的社團介紹分開。 */
  function hpxCards() {
    var old = document.querySelector('.hpxr');
    if (!old || document.getElementById('hpx3css')) return;

    var s = document.createElement('style');
    s.id = 'hpx3css';
    s.textContent =
      '.hpx3{display:grid;grid-template-columns:1fr;' +
        'border-top:1px solid var(--hair);border-left:1px solid var(--hair)}' +
      '.hpx3__c{display:flex;flex-direction:column;padding:clamp(20px,2.6vw,28px) clamp(18px,2.2vw,24px);' +
        'border-right:1px solid var(--hair);border-bottom:1px solid var(--hair)}' +
      '.hpx3__l{font-family:var(--display);font-size:clamp(38px,4.6vw,54px);line-height:1;' +
        'color:var(--ink);margin-bottom:clamp(10px,1.4vw,14px)}' +
      '.hpx3__w{font-family:var(--display);font-size:clamp(19px,2.2vw,23px);font-weight:600;' +
        'letter-spacing:.06em;margin:0;color:var(--ink)}' +
      '.hpx3__d{font-size:13px;line-height:1.85;color:var(--ink-2);margin:6px 0 0}' +
      '.hpx3__t{margin:clamp(16px,2vw,22px) 0 0;padding-top:clamp(12px,1.6vw,16px);' +
        'border-top:1px solid var(--hair);font-family:var(--display);font-size:11px;' +
        'letter-spacing:.22em;color:var(--orange)}' +
      '.hpx3__x{margin:5px 0 0;font-family:var(--display);font-size:15px;letter-spacing:.05em;' +
        'line-height:1.75;color:var(--orange)}' +
      '.hpx3__p{margin-top:clamp(14px,1.8vw,18px);font-size:12.5px;line-height:2;' +
        'color:var(--muted);max-width:54em;text-wrap:pretty}' +
      '.hpx2__n{margin-top:10px;font-size:13px;line-height:2;color:var(--ink-2);' +
        'max-width:52em;text-wrap:pretty}' +
      '.hpx2__n + .hpx2__n{margin-top:6px}' +
      '.hpx2__n em{font-style:normal;color:var(--orange)}' +
      /* 這一段（H·P·X 是什麼意思）換一個底色，跟上下兩段的社團介紹分開，
         讀者一眼就知道這是獨立的一塊。卡片改成白底，浮在米色上。 */
      '.hpxband{background:var(--cream);border-top:1px solid var(--hair);' +
        'border-bottom:1px solid var(--hair)}' +
      '.hpxband .hpx3__c{background:var(--sheet)}' +
      '@media (min-width:760px){' +
        '.hpx3{grid-template-columns:repeat(3,minmax(0,1fr))}' +
        '.hpx3__t{margin-top:auto}' +      /* 三張卡的分隔線連成一條 */
      '}';
    document.head.appendChild(s);

    var rows = old.querySelectorAll('.hpxr__i'), cards = '', note = '', i;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var l = r.querySelector('.hpxr__l');
      var w = r.querySelector('.hpxr__b b');
      var d = r.querySelector('.hpxr__d');
      var xs = r.querySelectorAll('.hpxr__x span');
      var words = [], j;
      for (j = 0; j < xs.length; j++) words.push(xs[j].textContent.trim());
      var letter = l ? l.textContent.trim() : '';
      var extra = (TX.hpxExtra || {})[letter] || '';
      if (extra) note += '<p class="hpx3__p">' + esc(extra) + '</p>';
      cards += '<div class="hpx3__c">' +
        '<span class="hpx3__l">' + esc(letter) + '</span>' +
        '<p class="hpx3__w">' + esc(w ? w.textContent.trim() : '') + '</p>' +
        '<p class="hpx3__d">' + esc(d ? d.textContent.trim() : '') + '</p>' +
        '<p class="hpx3__t">2.0</p>' +
        '<p class="hpx3__x">' + esc(words.join('・')) + '</p>' +
        '</div>';
    }

    var sec = old.closest ? old.closest('section') : null;
    if (sec) sec.className += ' hpxband';

    var box = document.createElement('div');
    box.innerHTML = '<div class="hpx3">' + cards + '</div>' + note;
    var frag = document.createDocumentFragment();
    while (box.firstChild) frag.appendChild(box.firstChild);
    old.parentNode.replaceChild(frag, old);

    var nt = document.querySelector('.hpx__note');
    if (nt && TX.hpxNote) {
      nt.className = '';
      nt.innerHTML = TX.hpxNote;
    }
  }

  /* 里程碑頁的「未來展望」（經營中／展望兩排標籤）整段移除。 */
  function dropFuture() {
    var p4 = document.getElementById('ab-p4');
    if (!p4) return;
    var secs = p4.querySelectorAll('section'), i;
    for (i = 0; i < secs.length; i++) {
      if (secs[i].querySelector('#now, #future')) secs[i].parentNode.removeChild(secs[i]);
    }
  }

  /* 新人指引：兩個分頁是「二選一」，不是先後順序，
     標成 Part 01 / Part 02 反而像是要照順序做完。
     改成一個小橘色菱形標記，整段往左靠齊標題。 */
  function tidyStart() {
    var parts = document.querySelectorAll('[data-pg="start"] .part');
    if (!parts.length) return;

    for (var i = 0; i < parts.length; i++) {
      var k = parts[i].querySelector('.part__k');
      if (k) k.parentNode.removeChild(k);
      if (!parts[i].querySelector('.part__m')) {
        var m = document.createElement('span');
        m.className = 'part__m';
        m.setAttribute('aria-hidden', 'true');
        parts[i].insertBefore(m, parts[i].firstChild);
      }
      var h = parts[i].querySelector('h3');
      var p = parts[i].querySelector('p');
      if (h && p) {
        var tx = START_TX[h.textContent.trim()];
        if (tx) {
          p.textContent = tx;
          p.classList.remove('part__p1');     // 原本設了 nowrap，新文字較長
        }
      }
    }

    renderSteps('stepPath', TX.steps);
    renderSteps('hostKit', TX.hostKit);
    renderFlow();
  }

  /* 自己接一顆新分頁按鈕。
     index.html 的分頁腳本在載入時就把按鈕抓成快照，之後新增的按鈕不在裡面：
     按自己 → 顯示自己並關掉別人；按別人 → 原本的腳本會處理它自己，這裡只關掉自己。 */
  function wireTab(btn, pane, tabsEl, openNow) {
    var all = tabsEl.querySelectorAll('.tab'), others = [], i;
    for (i = 0; i < all.length; i++) if (all[i] !== btn) others.push(all[i]);

    function mine() {
      pane.hidden = false;
      btn.setAttribute('aria-selected', 'true');
      for (var j = 0; j < others.length; j++) {
        others[j].setAttribute('aria-selected', 'false');
        var pn = document.getElementById(others[j].getAttribute('aria-controls'));
        if (pn) pn.hidden = true;
      }
    }
    btn.addEventListener('click', mine);
    for (i = 0; i < others.length; i++) {
      others[i].addEventListener('click', function () {
        pane.hidden = true;
        btn.setAttribute('aria-selected', 'false');
      });
    }
    if (openNow) mine(); else pane.hidden = true;
  }

  /* 新人指引：最前面加一個「剛加入可以做什麼」 */
  function addStartOverview() {
    var tabsEl = document.querySelector('[data-pg="start"] .tabs[data-tabs]');
    var p1 = document.getElementById('sg-p1');
    if (!tabsEl || !p1 || document.getElementById('sg-p0') || !TX.can) return;

    var pane = document.createElement('div');
    pane.id = 'sg-p0';
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', 'sg-0');
    pane.innerHTML = '<section class="blk pad"><div class="steps" id="startCan"></div></section>';
    p1.parentNode.insertBefore(pane, p1);

    var btn = document.createElement('button');
    btn.className = 'tab';
    btn.type = 'button';
    btn.id = 'sg-0';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'sg-p0');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = TX.canTab || '剛加入可以做什麼';
    tabsEl.insertBefore(btn, tabsEl.firstChild);

    renderSteps('startCan', TX.can);
    wireTab(btn, pane, tabsEl, true);       // 預設停在這一頁
  }

  /* 申請與文件：多一個「許願池」。
     只收願望（網站功能、想辦的活動、想讀的主題），不收問題與糾紛——
     那類仍然走私訊粉專。沒有 Email 欄位是刻意的：不留聯絡方式，
     就不會產生「我填了你要回我」的期待。 */
  function addWishForm() {
    var bar = document.querySelector('[data-pg="docs"] .tabs[data-tabs]');
    var host = document.getElementById('formJoin');
    var spec = (TX.forms || {}).wish;
    if (!bar || !host || !spec || document.getElementById('tab-wish')) return;
    if (typeof buildForm !== 'function') return;

    var pane = document.createElement('div');
    pane.className = 'appform';
    pane.id = 'formWish';
    pane.setAttribute('role', 'tabpanel');
    pane.setAttribute('aria-labelledby', 'tab-wish');
    pane.hidden = true;
    host.parentNode.appendChild(pane);

    var btn = document.createElement('button');
    btn.className = 'tab';
    btn.type = 'button';
    btn.id = 'tab-wish';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', 'formWish');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = TX.wishTab || '許願池';
    bar.appendChild(btn);

    buildForm(pane, spec);
    wireTab(btn, pane, bar, false);
  }

  /* 常見問題頁尾：一句話，不是表單。
     管理群是志工、沒有輪值人力，表單會讓人期待「一定有人回」，
     也會把人際糾紛這類最耗神的訊息引進來。既有的私訊管道沒有這個問題。 */
  function faqNote() {
    var wrap = document.getElementById('faqPanels');
    if (!wrap || !TX.faqNote || document.getElementById('faqAsk')) return;
    var sec = document.createElement('section');
    sec.className = 'blk pad';
    sec.id = 'faqAsk';
    sec.style.paddingTop = '0';
    sec.innerHTML = '<p class="faq__ask">' + TX.faqNote + '</p>';
    wrap.parentNode.insertBefore(sec, wrap.nextSibling);
  }

  /* 「加入社團申請」表單本身留在申請與文件頁（那裡是大家回頭找表單的地方），
     但入口要放在會產生念頭的位置：
       - 首頁主視覺：多一顆次要按鈕，還沒入社的人不必先找選單
       - 新人指引開頭：這頁預設你已經入社，所以補一句給還沒入社的人 */
  function joinCtas() {
    var cta = document.querySelector('[data-pg="home"] .lead__cta');
    if (cta && !cta.querySelector('[data-join-cta]')) {
      var a = document.createElement('a');
      a.className = 'btn btn--line';
      a.href = '#/docs';
      a.textContent = '加入社團申請';
      a.setAttribute('data-join-cta', '');
      cta.appendChild(a);
    }

    /* 這句接在開場那一段的後面（同一個 <p>），不另起一段：
       每頁版頭都只有一段開場，高度才對得起來。 */
    var top = document.querySelector('[data-pg="start"] .top');
    if (top && !top.querySelector('[data-join-note]') && TX.startJoin) {
      var ps = top.querySelectorAll('p');
      var lede = ps[ps.length - 1];
      if (lede) {
        var sp = document.createElement('span');
        sp.setAttribute('data-join-note', '');
        sp.innerHTML = '　' + TX.startJoin;
        lede.appendChild(sp);
      }
    }
  }

  /* 首頁那顆「看完整介紹與歷年場次」原本只到社團書聚的第一個分頁（九種聚會形式），
     但按鈕講的是歷年場次。改成點下去直接切到「我們讀些什麼 → 歷年場次」。 */
  function wireHomeLink() {
    var as = document.querySelectorAll('[data-pg="home"] a[href="#/meetups"]');
    for (var i = 0; i < as.length; i++) {
      if (as[i].textContent.indexOf('歷年場次') === -1) continue;
      as[i].addEventListener('click', function () {
        setTimeout(function () {
          var t = document.getElementById('mt-2');
          if (t) t.click();
          var c = document.querySelectorAll('#mtViews .chip');
          if (c.length > 2) c[2].click();
        }, 60);
      });
    }
  }

  /* 社團書聚：「我們讀些什麼」（領域分布）、「歷年書聚書單」、「歷年場次」
     其實是同一批資料的三種看法，分成三個分頁要來回切換。
     合成一個分頁，上面放三顆按鈕切換呈現方式。 */
  function mergeMeetups() {
    var p2 = document.getElementById('mt-p2');
    var p3 = document.getElementById('mt-p3');
    var p4 = document.getElementById('mt-p4');
    if (!p2 || !p3 || !p4 || document.getElementById('mtViews')) return;

    var s2 = p2.querySelector('section');
    var s3 = p3.querySelector('section');
    var s4 = p4.querySelector('section');

    var head = document.createElement('section');
    head.className = 'blk pad';
    head.style.paddingBottom = '0';
    head.innerHTML =
      '<div class="blk__h"><h3>我們讀些什麼</h3>' +
      '<p>' + esc(TX.meetupsLede || '') + '</p></div>' +
      '<div class="chips mtv" id="mtViews" role="group" aria-label="呈現方式">' +
      '<button class="chip" type="button" aria-pressed="true">領域分布</button>' +
      '<button class="chip" type="button" aria-pressed="false">歷年書單</button>' +
      '<button class="chip" type="button" aria-pressed="false">歷年場次</button>' +
      '</div>';
    p2.insertBefore(head, p2.firstChild);

    if (s3) p2.appendChild(s3);
    if (s4) p2.appendChild(s4);

    // 每個檢視自己的標題留著當小標；分布那一段改名，才不會跟分頁名重複
    if (s2) {
      var h = s2.querySelector('.blk__h h3');
      if (h) h.textContent = '讀過的書：領域分布';
    }

    var views = [s2, s3, s4].filter(Boolean);
    var btns = head.querySelectorAll('.chip');
    views.forEach(function (v) { v.classList.add('mtv__s'); });

    function show(i) {
      views.forEach(function (v, k) { v.hidden = (k !== i); });
      for (var b = 0; b < btns.length; b++) {
        btns[b].setAttribute('aria-pressed', b === i ? 'true' : 'false');
      }
    }
    for (var b = 0; b < btns.length; b++) {
      (function (k) {
        btns[k].addEventListener('click', function () { show(k); });
      })(b);
    }
    show(0);

    p3.parentNode.removeChild(p3);
    p4.parentNode.removeChild(p4);
    ['mt-3', 'mt-4'].forEach(function (id) {
      var t = document.getElementById(id);
      if (t) t.parentNode.removeChild(t);
    });
  }

  /* 關於我們：「HPX 三個字母是什麼意思」其實是社團介紹的一部分，
     讀者看完開場三段正想問「所以 HPX 是什麼」，答案就應該接在那裡，
     而不是要再點一個分頁。搬完之後原分頁只剩「我們是什麼、不是什麼」。 */
  function mergeAbout() {
    var p1 = document.getElementById('ab-p1');
    var p2 = document.getElementById('ab-p2');
    var tab2 = document.getElementById('ab-2');
    if (!p1 || !p2) return;
    if (p1.querySelector('.hpxr, .hpx3')) return;   // 已經處理過，不重複

    var secs = p2.querySelectorAll('section');
    var meaning = null, i;
    for (i = 0; i < secs.length; i++) {
      if (secs[i].querySelector('.hpxr, .hpx3')) { meaning = secs[i]; break; }
    }
    if (meaning) {
      var first = p1.querySelector('section');    // 開場三段（intro2）
      if (first && first.nextSibling) p1.insertBefore(meaning, first.nextSibling);
      else p1.appendChild(meaning);
    }

    if (tab2 && TX.aboutTab) tab2.textContent = TX.aboutTab;
    var rest = p2.querySelector('.blk__h');
    if (rest && TX.aboutVsLede) {
      var p = rest.querySelector('p');
      if (p) p.textContent = TX.aboutVsLede;
    }
  }

  /* 申請與文件：七張表分兩類，先選表再填表。
     原本的分頁按鈕列留在 DOM 裡（只是隱藏），切換仍由它負責——
     卡片被按下時是去 click 對應的那顆按鈕，所以原本綁好的邏輯完全不用改。
     卡片標題直接讀按鈕上的字，改名字只要改按鈕；說明文字在 copy.js 的 docsMenu。 */
  function docsMenu() {
    var bar = document.querySelector('[data-pg="docs"] .tabs[data-tabs]');
    var M = TX.docsMenu;
    if (!bar || !M || document.getElementById('docsMenu')) return;

    var pad = bar.parentNode;
    bar.style.display = 'none';

    var menu = document.createElement('div');
    menu.className = 'dmenu';
    menu.id = 'docsMenu';

    var back = document.createElement('div');
    back.className = 'dback';
    back.innerHTML = '<button class="dback__b" type="button">← ' +
      esc(M.back || '全部表單') + '</button><span class="dback__t"></span>';

    function showMenu() {
      var ps = pad.querySelectorAll('.appform'), i;
      for (i = 0; i < ps.length; i++) ps[i].hidden = true;
      menu.hidden = false;
      back.hidden = true;
    }
    function openTab(id) {
      var t = document.getElementById(id);
      if (!t) return;
      t.click();                                   // 交給原本的分頁邏輯
      menu.hidden = true;
      back.hidden = false;
      back.querySelector('.dback__t').textContent = t.textContent.trim();
    }
    back.querySelector('.dback__b').addEventListener('click', showMenu);

    (M.groups || []).forEach(function (g) {
      var box = document.createElement('div');
      box.className = 'dmnu__g';
      box.innerHTML = '<p class="dmnu__k">' + esc(g.k) + '</p><div class="dmnu__b"></div>';
      var body = box.querySelector('.dmnu__b');
      (g.items || []).forEach(function (it) {
        var t = document.getElementById(it.id);
        if (!t) return;
        var b = document.createElement('button');
        b.className = 'dcard';
        b.type = 'button';
        b.innerHTML = '<span class="dcard__t">' +
          '<span class="dcard__h">' + esc(t.textContent.trim()) + '</span>' +
          '<p class="dcard__d">' + esc(it.d) + '</p></span>' +
          '<span class="dcard__g" aria-hidden="true">→</span>';
        b.addEventListener('click', function () { openTab(it.id); });
        body.appendChild(b);
      });
      menu.appendChild(box);
    });

    pad.insertBefore(menu, bar.nextSibling);
    pad.insertBefore(back, menu.nextSibling);
    showMenu();

    /* 站內有些連結指的就是某一張表（首頁與新人指引的「加入社團申請」、
       開書聚那張「書聚徽章申請」）。這種連結點下去應該直接開那張表，
       不要再讓人從清單裡找一次。比對方式：連結文字裡有沒有某顆分頁按鈕的名稱。

       另外要處理一個狀況：這一頁是單頁式的，離開再回來時 DOM 還停在上次的樣子。
       所以每次切回 #/docs 都要重設——有指定表單就開那一張，沒有就回到清單。
       （之前的 bug：先點開「合作提案」，回首頁再按「加入社團申請」，
         進來看到的還是合作提案。） */
    var pending = null;

    window.addEventListener('hashchange', function () {
      if (location.hash.indexOf('#/docs') !== 0) return;
      setTimeout(function () {
        if (pending) { openTab(pending); pending = null; }
        else showMenu();
      }, 40);
    });

    function whichTab(tx) {
      var hit = null;
      (M.groups || []).forEach(function (g) {
        (g.items || []).forEach(function (it) {
          var t = document.getElementById(it.id);
          if (t && tx.indexOf(t.textContent.trim()) !== -1) hit = it.id;
        });
      });
      return hit;
    }

    /* 用事件委派而不是逐一綁定：有些連結是後面才產生的
       （常見問題頁尾那句就是），逐一綁定會漏掉。 */
    document.addEventListener('click', function (e) {
      var el = e.target;
      var a = (el && el.closest) ? el.closest('a[href="#/docs"]') : null;
      if (!a) return;
      var hit = whichTab(a.textContent.trim());
      if (!hit) return;
      // 已經在這一頁就不會有 hashchange，直接開
      if (location.hash.indexOf('#/docs') === 0) openTab(hit);
      else pending = hit;
    });
  }

  /* 表單內容調整（欄位與說明都定義在 copy.js） */
  function reworkForms() {
    if (typeof FORMS === 'undefined' || typeof buildForm !== 'function') return;
    var F = TX.forms || {}, i;

    // 加入社團申請：居住縣市改下拉、審核天數、聚會形式改可複選
    if (FORMS.join) {
      if (F.joinIntro) FORMS.join.intro = F.joinIntro;
      for (i = 0; i < FORMS.join.fields.length; i++) {
        var fd = FORMS.join.fields[i];
        if (fd.k === 'area' && F.joinArea) FORMS.join.fields[i] = F.joinArea;
        // 想參加哪幾種聚會本來就不會只有一種，單選會逼人二選一
        if (fd.k === 'kind' && fd.t === 'select') {
          fd.t = 'checks';
          fd.wide = true;
          fd.l = '最想參加的聚會形式（可複選）';
          fd.opts = (fd.opts || []).filter(function (o) { return o !== '還在觀望，先看看'; });
          fd.hint = '可以複選，也可以都不選——還在觀望就先跳過這題。';
        }
      }
    }

    // 書聚場地登記 → 推薦場地
    if (FORMS.venue && F.venue) {
      FORMS.venue.title = F.venue.title;
      FORMS.venue.intro = F.venue.intro;
      if (F.venue.go) FORMS.venue.go = F.venue.go;
      FORMS.venue.fields = F.venue.fields;
      var tv = document.getElementById('tab-venue');
      if (tv && F.venue.tab) tv.textContent = F.venue.tab;
    }

    // 書聚徽章申請：說明、出席率門檻、Email 用途、是否已張貼貼文
    if (FORMS.badge) {
      if (F.badgeIntro) FORMS.badge.intro = F.badgeIntro;
      var B = FORMS.badge.fields, hasPost = false, at = B.length;
      for (i = 0; i < B.length; i++) {
        if (F.badgePost && B[i].k === F.badgePost.k) hasPost = true;
        if (B[i].k === 'local_email_badge') at = i;
        if (B[i].l === '申請徽章總數' && F.badgeCountHint) B[i].hint = F.badgeCountHint;
        if (B[i].l === 'Email' && F.badgeEmailHint) B[i].hint = F.badgeEmailHint;
      }
      if (F.badgePost && !hasPost) B.splice(at, 0, F.badgePost);
    }

    [['formJoin', 'join'], ['formVenue', 'venue'], ['formBadge', 'badge']].forEach(function (pair) {
      var m = document.getElementById(pair[0]);
      if (m && FORMS[pair[1]]) buildForm(m, FORMS[pair[1]]);
    });
  }

  /* 加入社團申請：補回舊 Google 表單上有、網站表單漏掉的題目。
     欄位定義與重建都靠 FORMS / buildForm 這兩個全域，改完重建一次即可。 */
  function upgradeJoinForm() {
    if (typeof FORMS === 'undefined' || typeof buildForm !== 'function') return;
    var spec = FORMS.join;
    var mount = document.getElementById('formJoin');
    if (!spec || !mount || !spec.fields) return;
    var F = spec.fields;
    var i, has = false;
    for (i = 0; i < F.length; i++) if (F[i].k === 'books') has = true;
    if (has) return;                       // 已經處理過，不重複

    function idx(k) { for (var n = 0; n < F.length; n++) if (F[n].k === k) return n; return -1; }

    // 1. 職業／產業：舊表單是必填
    var j = idx('job');
    if (j > -1) {
      F[j].req = true;
      F[j].ph = '例：產品企劃、設計、教育、工程師、行政';
    }

    // 2. 推薦人：舊表單問「推薦人，或如何得知本社團」
    var f = idx('from');
    if (f > -1) F.splice(f + 1, 0, {
      k: 'ref', l: '推薦人', t: 'text',
      ph: '選填。如果是朋友介紹，請填他的 FB 名稱'
    });

    // 3. 有興趣的書籍或作者：舊表單必填，且是自由填寫
    var t = idx('topic');
    var books = {
      k: 'books', l: '有興趣的書籍或作者', t: 'textarea', wide: true, req: true,
      ph: '例：《原子習慣》、《被討厭的勇氣》，或某位作者',
      hint: '也可以寫你想找人一起讀的書。這題管理員會看，寫具體一點更容易通過審核。'
    };
    if (t > -1) F.splice(t + 1, 0, books); else F.push(books);

    // 4. 有興趣擔任主講嗎（舊表單的選填題）
    F.push({
      k: 'speak', l: '有興趣擔任主講或分享經驗嗎？', t: 'textarea', wide: true,
      ph: '選填。若有，簡單寫下你想分享的主題。',
      hint: '我們會視主題性質，安排在未來的社群活動中。'
    });

    buildForm(mount, spec);
  }

  function run() {
    css();
    fix(document.querySelector('footer'));
    fix(document.getElementById('contactCards'));
    tidyStart();
    addStartOverview();
    joinCtas();
    hpxCards();
    dropFuture();
    mergeMeetups();
    wireHomeLink();
    mergeAbout();
    addWishForm();
    upgradeJoinForm();
    reworkForms();
    docsMenu();            // 要在 reworkForms 之後：分頁按鈕的名字那時才定案
    faqNote();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
