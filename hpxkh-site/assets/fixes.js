/* 前端小調整。等 index.html 整理過後可以併回原始碼。
   1. 頁尾與聯繫頁卡片的「高雄讀會」錯字（少一個「書」字）
   2. 社團書聚：把「我們讀些什麼」併進「歷年書聚書單」
   3. 加入社團申請：補回舊 Google 表單上有、網站表單漏掉的題目
   4. 關於我們：H·P·X 的字義併進「社團介紹」，分頁改名「適不適合你」
   5. 新人指引：拿掉 Part 01／02，改小標記；兩段說明重寫
   6. 首頁與新人指引補上「加入社團申請」的入口
   7. 文案替換表（COPY）：要改哪一句就加一列 */
(function () {
  /* 要改的句子加在這裡：[原句, 新句]。整站文字節點一次換掉。 */
  var COPY = [
    ['分成兩條路線：先當參加者，或直接開一場自己的書聚。選一個開始就好。',
     '兩條路都可以走：先當參加者，或自己發起一場書聚。選一個方向開始就好。']
  ];

  /* 新人指引兩個分頁的開場說明（key 是該區塊的 h3） */
  var START_TX = {
    '先當一次參加者':
      '先挑一場有興趣的書聚，旁聽或正式參加都可以。什麼都不用準備，下面是三個階段、八個步驟。',
    '我想開書聚':
      '沒參加過書聚也可以直接發起，已經參加過幾次、想自己揪一團當然更好——只要你是社員，都能辦一場。下面是完整流程和會用到的表單。'
  };

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

  function copy() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var n, i;
    while ((n = w.nextNode())) {
      for (i = 0; i < COPY.length; i++) {
        if (n.nodeValue.indexOf(COPY[i][0]) !== -1) {
          n.nodeValue = n.nodeValue.split(COPY[i][0]).join(COPY[i][1]);
        }
      }
    }
  }

  /* 新人指引：兩個分頁是「二選一」，不是先後順序，
     標成 Part 01 / Part 02 反而像是要照順序做完。
     改成一個小橘色菱形標記，整段往左靠齊標題。 */
  function tidyStart() {
    var parts = document.querySelectorAll('[data-pg="start"] .part');
    if (!parts.length || document.getElementById('startTidy')) return;

    var s = document.createElement('style');
    s.id = 'startTidy';
    s.textContent =
      '[data-pg="start"] .part{gap:12px;align-items:flex-start}' +
      '[data-pg="start"] .part__k{display:none}' +
      '[data-pg="start"] .part__m{flex:0 0 auto;width:9px;height:9px;border-radius:2px;' +
        'background:var(--orange,#EF8200);transform:rotate(45deg);' +
        'margin-top:calc(clamp(18px,2.3vw,23px) * .5 - 4px)}' +
      '[data-pg="start"] .part__t p{max-width:60ch;text-wrap:pretty}' +
      '.start__join{margin-top:14px;font-size:13px;line-height:1.9;color:var(--ink-3,#918B81)}' +
      '.start__join a{color:var(--orange,#EF8200)}';
    document.head.appendChild(s);

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
    if (top && !top.querySelector('[data-join-note]')) {
      var p = document.createElement('p');
      p.className = 'start__join';
      p.setAttribute('data-join-note', '');
      p.innerHTML = '還沒加入社團嗎？先到「<a href="#/docs">加入社團申請</a>」' +
        '填一份自我介紹，送出後再回來看這一頁。';
      top.appendChild(p);
    }
  }

  /* 社團書聚：「我們讀些什麼」（領域分布）與「歷年書聚書單」講的是同一件事，
     分成兩個分頁反而要來回切。把分布圖移到書單上方，合成一頁。 */
  function mergeBooks() {
    var tab2 = document.getElementById('mt-2');
    var p2 = document.getElementById('mt-p2');
    var p3 = document.getElementById('mt-p3');
    var tab3 = document.getElementById('mt-3');
    if (!tab2 || !p2 || !p3) return;

    var sec = p2.querySelector('section');
    if (sec) {
      var h = sec.querySelector('.blk__h h3');
      if (h) h.textContent = '讀過的書：領域分布';
      p3.insertBefore(sec, p3.firstChild);
    }
    p2.parentNode.removeChild(p2);
    tab2.parentNode.removeChild(tab2);
    if (tab3) tab3.textContent = '我們讀些什麼';
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
    if (p1.querySelector('.hpxr')) return;        // 已經處理過，不重複

    var secs = p2.querySelectorAll('section');
    var meaning = null, i;
    for (i = 0; i < secs.length; i++) {
      if (secs[i].querySelector('.hpxr')) { meaning = secs[i]; break; }
    }
    if (meaning) {
      var first = p1.querySelector('section');    // 開場三段（intro2）
      if (first && first.nextSibling) p1.insertBefore(meaning, first.nextSibling);
      else p1.appendChild(meaning);
    }

    // 剩下的「我們是什麼、不是什麼」：分頁名與說明句改寫
    if (tab2) tab2.textContent = '適不適合你';
    var rest = p2.querySelector('.blk__h');
    if (rest) {
      var p = rest.querySelector('p');
      if (p) p.textContent = '兩邊都先說清楚，你比較好判斷要不要來。';
    }
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
    fix(document.querySelector('footer'));
    fix(document.getElementById('contactCards'));
    copy();
    tidyStart();
    joinCtas();
    mergeBooks();
    mergeAbout();
    upgradeJoinForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
