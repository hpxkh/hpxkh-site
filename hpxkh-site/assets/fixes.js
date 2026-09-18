/* 前端小調整。等 index.html 整理過後可以併回原始碼。
   1. 頁尾與聯繫頁卡片的「高雄讀會」錯字（少一個「書」字）
   2. 社團書聚：把「我們讀些什麼」併進「歷年書聚書單」 */
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

  function run() {
    fix(document.querySelector('footer'));
    fix(document.getElementById('contactCards'));
    mergeBooks();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
