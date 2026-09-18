/* 前端小調整。等 index.html 整理過後可以併回原始碼。
   1. 頁尾與聯繫頁卡片的「高雄讀會」錯字（少一個「書」字）
   2. 社團書聚：把「我們讀些什麼」併進「歷年書聚書單」
   3. 加入社團申請：補回舊 Google 表單上有、網站表單漏掉的題目 */
(function () {
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
    mergeBooks();
    upgradeJoinForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
