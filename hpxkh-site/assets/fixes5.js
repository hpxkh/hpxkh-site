/* 第四批小調整。

   為什麼又開一個檔：推檔時必須整份重送，檔案越大越慢也越容易出錯，
   所以新的東西一律開新檔，各自管一件事（fixes.js 版面與結構／fixes2.js 第二批／
   fixes3.js 乾淨網址路由／fixes4.js 第三批／這裡）。

   這一批做的事：
   1. 加入社團申請的「我已詳細閱讀社團版規」旁邊，加一個可以就地展開的版規全文
   2. 加入社團申請補一題：要不要收社團活動與資訊的 Email

   文字與資料一律放 assets/copy.js，這裡只處理版面與行為。
   改完記得把 functions/[[path]].js 的 VER 換掉。 */
(function () {
  var TX = window.HPXKH_TX || {};

  /* ── 要不要收社團活動的 Email ──
     表單本來就問了 Email（必填），但沒問過可不可以拿來寄信。
     年度大聚、講座這類一年幾封的通知，寄之前先問一聲比較妥當，
     也讓不想收信的人有地方講。題目放在 Email 那一題後面，問的是什麼一看就懂。

     用下拉而不是勾選框：送出時的整理邏輯會跳過空白欄位（index.html 的
     `const v=fval(c).trim(); if(!v) return;`），勾選框沒勾就整題消失，
     管理員看不出是「不要」還是「沒看到」。下拉一定會留下一行答案。
     第一個選項故意留白：這是「要不要寄信給你」的同意，不該有預設答案，
     留白＋必填＝兩個答案都得自己選，沒選會被擋下來並提示。

     ★ 文案本來該放 copy.js，但那個檔 29 KB，每次重送都有打錯字的風險，
       所以先放這裡。下次真的要動 copy.js 時再一起搬過去。 */
  var JOIN_MAIL = {
    k: 'mailok',
    l: '要不要收社團活動與資訊的 Email',
    t: 'select',
    req: true,
    opts: ['', '可以，請寄給我', '不用，謝謝'],   // 第一個留白＝還沒選
    hint: '大聚、講座與社團重要公告會寄到上面那個信箱，一年幾封而已，' +
      '之後想取消隨時可以跟管理團隊說。日常的書聚揪團還是在臉書社團與 LINE，不會另外寄信。'
  };

  function joinMail() {
    if (typeof FORMS === 'undefined' || typeof buildForm !== 'function') return;
    var spec = FORMS.join;
    var mount = document.getElementById('formJoin');
    if (!spec || !spec.fields || !mount) return;

    var at = -1, i;
    for (i = 0; i < spec.fields.length; i++) {
      if (spec.fields[i].k === JOIN_MAIL.k) return;   // 已經有了，不重複
      if (spec.fields[i].k === 'email') at = i;
    }
    if (at < 0) return;                               // 沒有 Email 那一題就不問

    spec.fields.splice(at + 1, 0, JOIN_MAIL);
    if (TX.forms && TX.forms.joinIntro) spec.intro = TX.forms.joinIntro;
    buildForm(mount, spec);                           // 欄位有變，整張表重建
  }

  /* ── 勾同意的地方，就地把版規讀完 ──
     原本只有一行「請務必先閱讀社團版規」加一條會開新分頁的連結。
     表單填到一半被帶去另一頁，多數人就直接勾了不看。
     這裡在勾選框上面塞一個可以展開的區塊，版規十條原文就在裡面，
     展開讀完再勾，不用離開這張表。原本那條連結留著（想開新分頁的人還是能開）。

     版規全文不另外寫一份：直接複製版規頁（#rulesGrid／#rulesGrid2）那十條。
     這樣以後改版規只要改一個地方，這裡會跟著變。
     複製過來要清掉互動用的東西：
       · fixes2.js 把每條的 <ul> 收起來了（hidden），這裡要打開
       · 標題那一列被設成 role="button"，複製品沒有事件處理器，要拿掉
       · 箭頭 .rulex__g 是給那個開關用的，這裡不需要
       · id 不能重複，整份清掉 */

  function css() {
    if (document.getElementById('hpxkhFix5Css')) return;
    var s = document.createElement('style');
    s.id = 'hpxkhFix5Css';
    s.textContent =
      '.rulefold{margin:0 0 12px;border:1px solid var(--hair,#E6E1D8);background:#fff}' +
      '.rulefold>summary{list-style:none;cursor:pointer;padding:11px 14px;' +
        'display:flex;align-items:center;gap:10px;font-size:14px;color:var(--ink,#241F1A)}' +
      '.rulefold>summary::-webkit-details-marker{display:none}' +
      '.rulefold>summary::after{content:"＋";margin-left:auto;color:var(--orange,#EF8200);' +
        'font-size:15px;line-height:1}' +
      '.rulefold[open]>summary::after{content:"－"}' +
      '.rulefold[open]>summary{border-bottom:1px solid var(--hair,#E6E1D8)}' +
      '.rulefold__b{max-height:min(52vh,420px);overflow:auto;padding:4px 14px 14px;' +
        '-webkit-overflow-scrolling:touch}' +
      /* 複製過來的十條：不要版規頁那種兩欄卡片，這裡是表單裡的一段文字 */
      '.rulefold__b .rulex{border:0;padding:14px 0 0;margin:0}' +
      '.rulefold__b .rulex+.rulex{border-top:1px solid var(--hair,#E6E1D8)}' +
      '.rulefold__b .rulex__h{cursor:default;font-size:14px}' +
      '.rulefold__b ul{margin:6px 0 10px}' +
      '.rulefold__b li{font-size:13.5px;line-height:1.75}';
    document.head.appendChild(s);
  }

  function rulesCopy() {
    var src = document.getElementById('rulesGrid') || document.getElementById('rulesGrid2');
    if (!src || !src.querySelectorAll('.rulex').length) return null;

    var box = src.cloneNode(true);
    box.removeAttribute('id');
    box.removeAttribute('data-fold');
    box.className = 'rulefold__b';

    var i, el;
    var ids = box.querySelectorAll('[id]');
    for (i = 0; i < ids.length; i++) ids[i].removeAttribute('id');

    var ul = box.querySelectorAll('ul');
    for (i = 0; i < ul.length; i++) ul[i].hidden = false;

    var hd = box.querySelectorAll('.rulex__h');
    for (i = 0; i < hd.length; i++) {
      hd[i].removeAttribute('role');
      hd[i].removeAttribute('tabindex');
      hd[i].removeAttribute('aria-expanded');
    }

    var ar = box.querySelectorAll('.rulex__g');
    for (i = 0; i < ar.length; i++) { el = ar[i]; if (el.parentNode) el.parentNode.removeChild(el); }

    return box;
  }

  function mount() {
    var gs = document.querySelectorAll('.chks[data-k="agree"]'), i;
    for (i = 0; i < gs.length; i++) {
      var g = gs[i];
      var fld = g.parentNode;
      if (!fld || fld.querySelector('.rulefold')) continue;
      var body = rulesCopy();
      if (!body) return;                       // 版規還沒進 DOM，等下一次
      var d = document.createElement('details');
      d.className = 'rulefold';
      var sm = document.createElement('summary');
      sm.textContent = '在這裡直接讀社團版規（共十條）';
      d.appendChild(sm);
      d.appendChild(body);
      fld.insertBefore(d, g);
    }
  }

  function run() {
    css();
    joinMail();        // 先重建表單，再掛版規（順序反過來會被重建洗掉）
    mount();
    /* 申請與文件那幾張表是點開才建的，之後才會出現新的勾選框；
       用 MutationObserver 補上，mount() 本身有防重複。 */
    if (!window.MutationObserver) return;
    var t = null;
    new MutationObserver(function () {
      if (t) return;
      t = setTimeout(function () { t = null; mount(); }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
