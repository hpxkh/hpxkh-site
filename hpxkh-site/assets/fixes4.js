/* 第三批小調整。

   為什麼又開一個檔（fixes.js → fixes2.js → fixes3.js → 這裡）：
   推檔時必須整份重送，檔案越大越慢也越容易出錯
   （payload 約 67 KB 就會被截斷）。fixes.js 四萬多字早就不能再動，
   所以新的東西一律開新檔，各自管一件事：
     fixes.js   版面與結構（大宗，已凍結）
     fixes2.js  第二批版面調整
     fixes3.js  乾淨網址的前端路由
     fixes4.js  這裡

   這一批做的事：
   1. 關於我們 → 里程碑：改讀 copy.js 的 TX.mile 重畫，補上九屆大聚

   文字與資料一律放 assets/copy.js，這裡只處理版面與行為。
   改完記得把 functions/[[path]].js 的 VER 換掉。 */
(function () {
  var TX = window.HPXKH_TX || {};

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 里程碑。
     index.html 裡原本有一份寫死的 MILE，只有七條，缺了「大聚」這條主線。
     那個檔 214 KB 改不動，所以這裡直接用 TX.mile 把 #mile 整個重畫，
     標籤結構跟原本一模一樣（<li><time><b><span>），CSS 完全沿用，
     連捲動進場動畫（.mile.rv）也照舊。

     什麼時候跑：index.html 的行內程式先填好舊的七條，這裡再覆蓋。
     兩者都在 DOMContentLoaded 之前／之後各自完成，不會互相打架。 */
  function mileList() {
    var ol = document.getElementById('mile');
    var M = TX.mile;
    if (!ol || !M || !M.length) return;

    ol.innerHTML = M.map(function (m) {
      return '<li' + (m.c ? ' class="' + esc(m.c) + '"' : '') + '>' +
        '<time>' + esc(m.d) + '</time>' +
        '<b>' + esc(m.t) + '</b>' +
        (m.s ? '<span>' + esc(m.s) + '</span>' : '') +
        '</li>';
    }).join('');

    /* 進場動畫是用 IntersectionObserver 逐項加 .in 的（見 index.html 的 .rv）。
       我們把 <li> 全部換掉之後，原本被觀察的那幾個節點已經不存在，
       新的這幾個不會被加上 .in，整串就會停在 opacity:0 看不見。
       這裡不重接觀察器（那是 index.html 的私有邏輯），
       直接把這一串標記成已進場即可 —— 里程碑本來就在分頁裡，
       點開分頁時通常已經在畫面上了。 */
    if (ol.classList.contains('rv')) {
      ol.classList.add('in');
      var li = ol.children, i;
      for (i = 0; i < li.length; i++) li[i].classList.add('in');
    }
  }

  function run() {
    mileList();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
