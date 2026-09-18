/* 前端版面調整。等 index.html 整理過後可以併回原始碼。
   1. 頁尾與聯繫頁卡片的「高雄讀會」錯字（少一個「書」字）
   2. 社團書聚：領域分布／歷年書單／歷年場次合成一個分頁，用三顆按鈕切換
   3. 表單：加入社團申請補題目、居住縣市改下拉、推薦場地改版、徽章補說明與欄位
   4. 關於我們：H·P·X 的字義併進「社團介紹」，分頁改名「適不適合你」
   5. 新人指引：多一個「剛加入可以做什麼」分頁；拿掉 Part 01／02；路徑依 copy.js 重繪
   6. 首頁與新人指引補上「加入社團申請」的入口
   7. H·P·X 區塊改成緊湊三行，2.0 用橘色標註
   8. 九種聚會形式排成 3×3
   9. 全站段落寬度改用 em（原本用 ch，對中文來說太窄）
  10. 文件表單分成兩排：書友常用／店家、單位與其他社群
  11. 步驟區塊的欄數配合實際張數，不再固定三欄

   ★ 只是要改文字或調動步驟順序的話，不要動這個檔案 —— 改 assets/copy.js 就好。 */
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
         改用 em：1em 剛好等於一個中文字，數字就是每行的字數。 */
      '.top p{max-width:42em}' +
      '.blk__h p{max-width:44em}' +
      '.prose{max-width:42em}' +
      '.sec-lede{max-width:44em}' +
      '.band p{max-width:46em}' +
      '.band2__t p{max-width:52em}' +
      '.embed p{max-width:40em}' +
      '.appform__h p{max-width:54em}' +
      '.part__t p{max-width:46em}' +
      '.step__d{max-width:46em}' +
      '.end__p{max-width:38em}' +
      '.cal__foot p{max-width:46em}' +
      '.hpx2__n{max-width:54em}' +
      /* ── 步驟卡片的欄數 ──
         原始碼固定三欄，但每個區塊的張數不一樣：
         四張會排成 3+1、兩張會空掉一欄、一張更是只佔三分之一。
         依張數指定欄數，右邊就不會開天窗。 */
      '@media (min-width:900px){' +
        '#stepPath{grid-template-columns:repeat(2,minmax(0,1fr))}' +   /* 四張 → 2×2 */
        '#hostKit{grid-template-columns:repeat(2,minmax(0,1fr))}' +    /* 兩張 → 並排 */
        '#startCan{grid-template-columns:1fr}' +                       /* 一張 → 滿版 */
        '#startCan .step{grid-row:auto;display:flex}' +
      '}' +
      '@media (min-width:760px){' +
        '#startCan .step__b{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}' +
        '#startCan .step__b a{border-bottom:1px solid var(--hair)}' +
        '#startCan .step__b a:nth-child(odd){border-right:1px solid var(--hair)}' +
        '#startCan .step__b a:nth-last-child(-n+2){border-bottom:0}' +
      '}' +
      /* 勾選框：原本的勾勾用固定 px 定位，會偏一點。改成置中計算。 */
      '.chk input:checked::after{left:50%;top:50%;width:4px;height:8px;' +
        'transform:translate(-50%,-60%) rotate(45deg)}' +
      '@media (min-width:900px){.chks{grid-template-columns:repeat(4,minmax(0,1fr))}}' +
      /* 文件表單：兩排分類 */
      '.dgrp + .dgrp{margin-top:20px}' +
      '.dgrp__k{font-size:11.5px;letter-spacing:.14em;color:var(--ink-3,#918B81);margin-bottom:9px}' +
      /* 新人指引 */
      '[data-pg="start"] .part{gap:12px;align-items:flex-start}' +
      '[data-pg="start"] .part__k{display:none}' +
      '[data-pg="start"] .part__m{flex:0 0 auto;width:9px;height:9px;border-radius:2px;' +
        'background:var(--orange,#EF8200);transform:rotate(45deg);' +
        'margin-top:calc(clamp(18px,2.3vw,23px) * .5 - 4px)}' +
      '.start__join{margin-top:14px;font-size:13px;line-height:1.9;color:var(--ink-3,#918B81)}' +
      '.start__join a{color:var(--orange,#EF8200)}' +
      /* 社團書聚：三個檢視 */
      '.mtv{margin-top:14px}' +
      '.mtv__s{padding-top:clamp(18px,2.4vw,26px)!important}' +
      /* 九種聚會形式：固定 3×3，不要被 auto-fit 排成 4+4+1 */
      '@media (min-width:620px){#typeCards{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
      '@media (min-width:900px){#typeCards{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    document.head.appendChild(s);
  }

  /* 重繪 #stepPath / #hostKit / #startCan。
     標籤與 class 沿用 index.html 原本的 .step 樣式，只換內容與分組。 */
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
          '<p>' + esc(x.d) + '</p></span>' +
          '<span class="go" aria-hidden="true">→</span></a>';
      }).join('');
      return '<section class="step">' +
        '<div class="step__h"><span class="step__eye">' + esc(g.eye || '') + '</span>' +
        '<h3>' + esc(g.st) + '</h3></div>' +
        '<p class="step__d">' + esc(g.sd) + '</p>' +
        '<div class="step__b">' + body + '</div></section>';
    }).join('');
  }

  /* H·P·X：原本一個字母就佔掉一整排、右半邊大片留白，
     下面 1.0／2.0 又用三段長文再解釋一次顏色的意思。
     改成一行一個字母：字母 → 英文字 → 中文說明 → 2.0 的字（橘色）。
     桌機用 display:contents 讓三行共用同一組欄位，四欄一起靠左對齊，
     多出來的空間留在最右邊，不會在中間開一個洞。 */
  function compactHpx() {
    var old = document.querySelector('.hpxr');
    if (!old || document.getElementById('hpx2css')) return;

    var s = document.createElement('style');
    s.id = 'hpx2css';
    s.textContent =
      '.hpx2{border-top:1px solid var(--hair)}' +
      '.hpx2__r{display:grid;grid-template-columns:1.6em auto minmax(0,1fr);align-items:baseline;' +
        'gap:3px clamp(12px,1.8vw,20px);padding:clamp(11px,1.5vw,15px) 0;border-bottom:1px solid var(--hair)}' +
      '.hpx2__l{font-family:var(--display);font-size:clamp(24px,3vw,32px);line-height:1;color:var(--ink)}' +
      '.hpx2__w{font-family:var(--display);font-size:clamp(16px,1.9vw,20px);font-weight:600;letter-spacing:.06em}' +
      '.hpx2__d{font-size:13px;color:var(--ink-2);letter-spacing:.04em}' +
      '.hpx2__x{grid-column:2/-1;font-family:var(--display);font-size:13.5px;letter-spacing:.06em;' +
        'color:var(--orange)}' +
      '.hpx2__n{margin-top:16px;font-size:13px;line-height:2;color:var(--ink-2);text-wrap:pretty}' +
      '.hpx2__n + .hpx2__n{margin-top:6px}' +
      '.hpx2__n em{font-style:normal;color:var(--orange)}' +
      '@media (min-width:760px){' +
        '.hpx2{display:grid;grid-template-columns:1.6em auto auto minmax(0,1fr);' +
          'align-items:baseline;column-gap:clamp(14px,2vw,26px)}' +
        '.hpx2__r{display:contents}' +
        '.hpx2__r > *{padding:clamp(11px,1.5vw,15px) 0;border-bottom:1px solid var(--hair)}' +
        '.hpx2__x{grid-column:auto;white-space:nowrap}' +
      '}';
    document.head.appendChild(s);

    var rows = old.querySelectorAll('.hpxr__i'), html = '', i;
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var l = r.querySelector('.hpxr__l');
      var w = r.querySelector('.hpxr__b b');
      var d = r.querySelector('.hpxr__d');
      var xs = r.querySelectorAll('.hpxr__x span');
      var words = [], j;
      for (j = 0; j < xs.length; j++) words.push(xs[j].textContent.trim());
      html += '<div class="hpx2__r">' +
        '<span class="hpx2__l">' + esc(l ? l.textContent.trim() : '') + '</span>' +
        '<b class="hpx2__w">' + esc(w ? w.textContent.trim() : '') + '</b>' +
        '<span class="hpx2__d">' + esc(d ? d.textContent.trim() : '') + '</span>' +
        '<span class="hpx2__x">' + esc(words.join('・')) + '</span>' +
        '</div>';
    }

    var box = document.createElement('div');
    box.className = 'hpx2';
    box.innerHTML = html;
    old.parentNode.replaceChild(box, old);

    var note = document.querySelector('.hpx__note');
    if (note && TX.hpxNote) {
      note.className = '';
      note.innerHTML = TX.hpxNote;
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
  }

  /* 新人指引再加一個分頁排在最前面：剛加入可以做什麼。
     index.html 的分頁腳本在載入時就把按鈕抓成快照，之後新增的按鈕不在裡面，
     所以這顆按鈕的開關要自己接：按自己 → 顯示自己並關掉別人；
     按別人 → 原本的腳本會處理它自己，這裡只要把自己關掉。 */
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
    mine();     // 預設停在這一頁
  }

  /* 「加入社團申請」表單本身留在文件表單頁（那裡是大家回頭找表單的地方），
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

    var top = document.querySelector('[data-pg="start"] .top');
    if (top && !top.querySelector('[data-join-note]') && TX.startJoin) {
      var p = document.createElement('p');
      p.className = 'start__join';
      p.setAttribute('data-join-note', '');
      p.innerHTML = TX.startJoin;
      top.appendChild(p);
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
     而不是要再點一個分頁。搬完之後原分頁只剩「我們是什麼、不是什麼」，
     那一頁的作用是幫人判斷適不適合自己，分頁名也一併改成這件事。 */
  function mergeAbout() {
    var p1 = document.getElementById('ab-p1');
    var p2 = document.getElementById('ab-p2');
    var tab2 = document.getElementById('ab-2');
    if (!p1 || !p2) return;
    if (p1.querySelector('.hpxr, .hpx2')) return;   // 已經處理過，不重複

    var secs = p2.querySelectorAll('section');
    var meaning = null, i;
    for (i = 0; i < secs.length; i++) {
      if (secs[i].querySelector('.hpxr, .hpx2')) { meaning = secs[i]; break; }
    }
    if (meaning) {
      var first = p1.querySelector('section');    // 開場三段（intro2）
      if (first && first.nextSibling) p1.insertBefore(meaning, first.nextSibling);
      else p1.appendChild(meaning);
    }

    // 剩下的「我們是什麼、不是什麼」：分頁名與說明句改寫
    if (tab2 && TX.aboutTab) tab2.textContent = TX.aboutTab;
    var rest = p2.querySelector('.blk__h');
    if (rest && TX.aboutVsLede) {
      var p = rest.querySelector('p');
      if (p) p.textContent = TX.aboutVsLede;
    }
  }

  /* 文件表單：六個項目性質差很多，排成一列看起來是平的。
     分成兩排：上排是書友自己會用到的，下排是店家、單位或其他社群會用到的。
     按鈕節點直接搬過去，原本綁好的分頁切換照常運作。 */
  function regroupDocs() {
    var bar = document.querySelector('[data-pg="docs"] .tabs[data-tabs]');
    if (!bar || document.getElementById('docsGrpB')) return;
    var G = TX.docsGroups || {};
    var host = bar.parentNode;

    function group(id, label, ids) {
      var wrap = document.createElement('div');
      wrap.className = 'dgrp';
      if (id) wrap.id = id;
      wrap.innerHTML = '<p class="dgrp__k">' + esc(label || '') + '</p>';
      var row = document.createElement('div');
      row.className = 'tabs';
      row.setAttribute('role', 'tablist');
      wrap.appendChild(row);
      host.insertBefore(wrap, bar);
      ids.forEach(function (tid) {
        var t = document.getElementById(tid);
        if (t) row.appendChild(t);
      });
    }

    group('', G.a || '書友常用', ['tab-join', 'tab-badge', 'tab-files']);
    group('docsGrpB', G.b || '店家、單位與其他社群', ['tab-venue', 'tab-collab', 'tab-post']);
    bar.parentNode.removeChild(bar);
  }

  /* 表單內容調整（欄位與說明都定義在 copy.js） */
  function reworkForms() {
    if (typeof FORMS === 'undefined' || typeof buildForm !== 'function') return;
    var F = TX.forms || {}, i;

    // 加入社團申請：居住縣市改下拉、審核天數
    if (FORMS.join) {
      if (F.joinIntro) FORMS.join.intro = F.joinIntro;
      if (F.joinArea) {
        for (i = 0; i < FORMS.join.fields.length; i++) {
          if (FORMS.join.fields[i].k === 'area') FORMS.join.fields[i] = F.joinArea;
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

    // 書聚徽章申請：說明與「是否已張貼貼文」
    if (FORMS.badge) {
      if (F.badgeIntro) FORMS.badge.intro = F.badgeIntro;
      if (F.badgePost) {
        var B = FORMS.badge.fields, has = false, at = B.length;
        for (i = 0; i < B.length; i++) {
          if (B[i].k === F.badgePost.k) has = true;
          if (B[i].k === 'local_email_badge') at = i;
        }
        if (!has) B.splice(at, 0, F.badgePost);
      }
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
    compactHpx();
    mergeMeetups();
    mergeAbout();
    regroupDocs();
    upgradeJoinForm();
    reworkForms();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
