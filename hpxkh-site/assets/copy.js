/* 文案替換表。
   index.html 目前是單一大檔，直接編輯成本高，所以改字集中在這裡：
   一列一句 [原句, 新句]，載入後把整站文字節點換過一次。
   之後 index.html 整理過，這些可以逐句併回原始碼，這個檔案就能刪掉。 */
(function () {
  var COPY = [
    // 新人指引：開場
    ['分成兩條路線：先當參加者，或直接開一場自己的書聚。選一個開始就好。',
     '兩條路都可以走：先當參加者，或自己發起一場書聚。選一個方向開始就好。'],

    // 我們是什麼：規律學習（補上主題聚／活動多為單場）
    ['每個書聚至少 4 次，正式成員出席率至少 7 成。有結構，才走得遠。',
     '每個書聚至少 4 次，正式成員出席率至少 7 成；主題聚與各式活動則多半是 1～2 次的單場。有結構，才走得遠。'],

    // 我們是什麼：不是限定一個主題（原本清一色是工作領域，讀起來太硬）
    ['軟體開發、設計、財商管理、專案企劃、人際關係、創業⋯⋯什麼領域都有人在讀。',
     '心理學、哲學、人際關係、財商、企劃與設計、創業、工具書⋯⋯什麼領域都有人在讀。']
  ];

  function run() {
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
