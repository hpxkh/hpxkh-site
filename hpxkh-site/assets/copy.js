/* 網站文案集中在這個檔案。
   index.html 目前是單一大檔，直接編輯成本高，所以要改字都改這裡；
   版面與結構的調整在 assets/fixes.js。
   這支必須在 fixes.js 之前載入（functions/index.js 已排好順序）。

   改完記得把 functions/index.js 的 VER 換掉，瀏覽器才會立刻拿到新版。 */
(function () {
  /* ── 1. 整句替換：[原句, 新句]，載入後掃過整站文字節點 ── */
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

  /* ── 2. fixes.js 會用到的文字 ── */
  window.HPXKH_TX = {
    // 新人指引兩個區塊的說明（key 是該區塊的標題）
    start: {
      '先當一次參加者':
        '先挑一場有興趣的書聚，正式參加或旁聽都可以。下面的三個階段、八個步驟，會帶你更快上手。',
      '我想開書聚':
        '沒參加過書聚也可以直接發起，已經參加過幾次、想自己揪一團當然更好——只要你是社員，都能辦一場。下面是完整流程和會用到的表單。'
    },

    // 新人指引開頭，給還沒入社的人
    startJoin: '還沒加入社團嗎？先到「<a href="#/docs">加入社團申請</a>」' +
      '填一份自我介紹，送出後再回來看這一頁。',

    // 關於我們：原本的「為什麼是 HPX」分頁，搬走字義之後只剩比較表
    aboutTab: '適不適合你',
    aboutVsLede: '兩邊都先說清楚，你比較好判斷要不要來。',

    // H·P·X 三行下方的說明（顏色本身就是 1.0／2.0 的圖例）
    hpxNote:
      '<p class="hpx2__n">深色的字是 <b>HPX 1.0（2009 起）</b>：Happy People Cross——' +
      '一群人因為一本書相遇，開心地交會。<em>橘色的字</em>是 <b>HPX 2.0（2020 起）</b>' +
      '在原本三個字上再長出來的一層：不只交流，也把讀到的東西變成計畫、練習與連結。</p>' +
      '<p class="hpx2__n">不論哪一個版本，<strong>X 都是交會</strong>：Planner、Prototyper、Producer、' +
      'Project Manager、Product Manager、Programmer、Professor、Person、People、Player⋯⋯' +
      '全部都是 P，全部在這裡交叉。</p>'
  };

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
