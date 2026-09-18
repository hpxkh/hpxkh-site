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

  /* 外部連結（與 index.html 的 L 相同，集中在這裡方便對照） */
  var L = {
    intro: 'https://hpxkh.pse.is/hpxkh_intro',
    start: 'https://hpxkh.pse.is/hpxkh_start',
    place: 'https://hpxkh.pse.is/hpxkh_Place',
    books: 'https://hpxkh.pse.is/hpxkh_books',
    fb: 'https://www.facebook.com/hpxkaohsiung',
    group: 'https://www.facebook.com/groups/KaohsiungHPX',
    night: 'https://reurl.cc/GpVY1A'
  };

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

    // 社團書聚：三種呈現合成一頁之後的開場句
    meetupsLede: '同一批資料的三種看法：先看整體讀了哪些領域，再往下查某一本書，或某一場活動。',

    /* 新人指引：先當一次參加者的路徑。
       n 是圖示代號（對應 index.html 的 IMG["s01"]…），留空就不放圖。
       前三步是照著實際會發生的順序：認識 → 申請 → 進社團 → 挑一場參加；
       地點與歷年清單屬於「要用到再查」的資料，粉專與宵夜團則是社團外的聯繫管道，
       都不放在必經步驟裡。 */
    steps: [
      { eye: 'Step 1 / 3', st: '先認識我們', sd: '花十分鐘，知道這個社團在做什麼、怎麼運作，然後完成入社。', items: [
        { n: '01', h: '認識 HPX', d: '社團的理念與歷程，我們的起點與價值。', u: L.intro },
        { n: '', h: '填寫加入社團申請', d: '填完會產生一份自我介紹，等一下貼到臉書社團的入社提問就好。', u: '#/docs' },
        { n: '02', h: '加入 Facebook 社團', d: '書友日常交流的主要空間，公告與報名都在這裡，管理員審核通常 1～3 天。', u: L.group }
      ] },
      { eye: 'Step 2 / 3', st: '參加第一場社團活動', sd: '不用等人邀請，挑一場有興趣的，直接報名就好。', items: [
        { n: '03', h: '如何開始一場書聚', d: '新手必看，一次掌握書聚的流程與核心。', u: L.start },
        { n: '05', h: '高雄讀書會行事曆', d: '每月活動行程，挑一場時間對得上的。', u: '#/calendar' },
        { n: '', h: '向主揪報名或問旁聽', d: '在社團的徵人貼文下留言「+1」，或私訊主揪詢問旁聽名額，實際依貼文說明為準。', u: L.group }
      ] },
      { eye: 'Step 3 / 3', st: '要用到再查的資料', sd: '不是必看，但常常會回頭找的兩份清單。', items: [
        { n: '04', h: '常辦書聚地點', d: '社團常用的場地整理，之後自己開團也用得到。', u: L.place },
        { n: '06', h: '歷年活動清單索引', d: '歷年書聚、新人聚、輕鬆聚與講座都在這裡。', u: L.books }
      ] },
      { eye: 'More', st: '社團之外，也在這裡', sd: '不是步驟，是另外兩個找得到我們的地方。', items: [
        { n: '07', h: '粉絲專頁 書香南國', d: '追蹤「書香南國—HPX 高雄讀書會」，掌握最新活動資訊。', u: L.fb },
        { n: '08', h: 'HPX 高雄宵夜團', d: '聚會後的延長賽，在輕鬆氛圍中認識更多書友。', u: L.night }
      ] }
    ],

    /* 我想開書聚：開團前後會用到的。
       行事曆不放在這裡——場次之後會從社團貼文自動帶進行事曆，主揪不必另外登記；
       社團外貼文申請是廣告與非社團活動在用的，跟辦書聚無關，留在文件表單頁即可。 */
    hostKit: [
      { eye: 'Before', st: '開書聚之前', sd: '先把書、夥伴和場地準備好。', items: [
        { n: '03', h: '如何開始一場書聚', d: '官方簡報，一次掌握開團的流程與核心。', u: L.start },
        { n: '04', h: '常辦書聚地點', d: '社團常用的場地整理，含費用與低消。', u: '#/venues' },
        { n: '06', h: '歷年活動清單索引', d: '看看別人讀過什麼、怎麼安排，避免重複。', u: L.books }
      ] },
      { eye: 'During & After', st: '進行與結束', sd: '開始之後的維持，以及結束時可以做的事。你的場次會從社團貼文帶進行事曆，不必另外登記。', items: [
        { n: '', h: '結束後在社團發一篇分享', d: '寫下這一團讀了什麼、聊出什麼。沒跟到的書友也看得到，下一團更好揪。', u: L.group },
        { n: '', h: '書聚徽章申請', d: '選配的小彩蛋，不是每團都要。書聚完成後，由主揪為成員申請。', u: '#/docs' }
      ] }
    ],

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
