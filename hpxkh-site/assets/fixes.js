/* 小修正：頁尾與聯繫頁的卡片由 JS 產生，內文寫成「高雄讀會行事曆」，少一個「書」字。
   等 index.html 重新整理過後可以移除這支檔案。 */
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
  function run() {
    fix(document.querySelector('footer'));
    fix(document.getElementById('contactCards'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
