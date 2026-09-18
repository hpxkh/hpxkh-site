/* 行事曆頁：向 /api/events 取得社團公開行事曆，繪製可翻月的月曆。
   取不到資料時退回內嵌 Google 月曆，不會開天窗。 */
(function () {
  var MOUNT = 'calMount';
  var API = '/api/events';
  var EMBED = 'https://calendar.google.com/calendar/embed?src=kaohsiunghpx%40gmail.com' +
    '&ctz=Asia%2FTaipei&mode=MONTH&showTitle=0&showPrint=0&showTabs=0' +
    '&showCalendars=0&showTz=0&wkst=2&bgcolor=%23ffffff';
  var SUB = 'https://calendar.google.com/calendar/u/0/r?cid=kaohsiunghpx@gmail.com';
  var WD = ['一', '二', '三', '四', '五', '六', '日'];

  var css = '' +
    '.cal{--cal-line:var(--hair,#E6E1D9);--cal-ink:var(--ink,#2B2823);--cal-dim:var(--ink-3,#918B81);--cal-bg:var(--cream,#F7F4EF);--cal-key:var(--orange,#EF8200)}' +
    '.cal__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}' +
    '.cal__ttl{font-family:var(--serif,Georgia,serif);font-size:clamp(20px,2.6vw,26px);letter-spacing:.02em;color:var(--cal-ink);margin:0}' +
    '.cal__nav{display:flex;gap:8px}' +
    '.cal__b{font:inherit;font-size:13px;letter-spacing:.04em;cursor:pointer;background:transparent;color:var(--cal-ink);' +
      'border:1px solid var(--cal-line);border-radius:999px;padding:7px 14px;line-height:1;transition:.15s}' +
    '.cal__b:hover{border-color:var(--cal-ink)}' +
    '.cal__b[disabled]{opacity:.35;cursor:default}' +
    '.cal__grid{display:grid;grid-template-columns:repeat(7,1fr);border-top:1px solid var(--cal-line);border-left:1px solid var(--cal-line)}' +
    '.cal__wd{padding:8px 6px;text-align:center;font-size:11.5px;letter-spacing:.1em;color:var(--cal-dim);' +
      'border-right:1px solid var(--cal-line);border-bottom:1px solid var(--cal-line);background:var(--cal-bg)}' +
    '.cal__c{min-height:104px;padding:6px 7px;border-right:1px solid var(--cal-line);border-bottom:1px solid var(--cal-line);' +
      'display:flex;flex-direction:column;gap:4px;overflow:hidden}' +
    '.cal__c--out{background:#FCFBF9}' +
    '.cal__n{font-family:var(--serif,Georgia,serif);font-size:14px;color:var(--cal-dim);line-height:1}' +
    '.cal__c--out .cal__n{opacity:.45}' +
    '.cal__c--today .cal__n{color:#fff;background:var(--cal-key);border-radius:999px;' +
      'width:21px;height:21px;display:grid;place-items:center;font-size:12px}' +
    '.cal__e{font-size:11.5px;line-height:1.35;color:var(--cal-ink);background:var(--cal-bg);' +
      'border-left:2px solid var(--cal-key);padding:3px 5px;overflow:hidden;text-overflow:ellipsis;' +
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.cal__more{font-size:11px;color:var(--cal-dim)}' +
    '.cal__list{list-style:none;margin:20px 0 0;padding:0;border-top:1px solid var(--cal-line)}' +
    '.cal__li{display:grid;grid-template-columns:auto 1fr auto;align-items:baseline;gap:4px 16px;' +
      'padding:13px 2px;border-bottom:1px solid var(--cal-line)}' +
    '.cal__d{display:flex;align-items:baseline;gap:8px;white-space:nowrap}' +
    '.cal__md{font-family:var(--serif,Georgia,serif);font-size:18px;color:var(--cal-ink)}' +
    '.cal__wdx{font-size:12px;color:var(--cal-dim)}' +
    '.cal__t{color:var(--cal-ink);line-height:1.6}' +
    '.cal__h{font-size:12.5px;color:var(--cal-dim);white-space:nowrap}' +
    '.cal__note{margin-top:12px;font-size:12.5px;color:var(--cal-dim)}' +
    '.cal__empty{padding:22px 2px;color:var(--cal-dim);font-size:13.5px;border-bottom:1px solid var(--cal-line)}' +
    '.cal__fb{border:1px solid var(--cal-line);background:#fff;height:min(78vh,720px);overflow:hidden}' +
    '.cal__fb iframe{width:100%;height:100%;display:block;border:0}' +
    '@media (max-width:760px){' +
      '.cal__c{min-height:62px;padding:4px 4px;gap:2px}' +
      '.cal__e{font-size:0;line-height:0;padding:0;height:5px;border-left:0;background:var(--cal-key);border-radius:999px;width:5px;-webkit-line-clamp:1}' +
      '.cal__more{display:none}' +
      '.cal__li{grid-template-columns:auto 1fr;gap:2px 12px}' +
      '.cal__h{grid-column:2;justify-self:start}' +
    '}';

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ymd(y, m, d) {
    return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  var host, events = null, cur = new Date(), failed = false;

  function byMonth(y, m) {
    var pre = y + '-' + String(m + 1).padStart(2, '0');
    return events.filter(function (e) { return e.d.indexOf(pre) === 0; });
  }

  function render() {
    if (failed) {
      // 讀取失敗：保留伺服器產生的靜態清單，只在下方補上 Google 月曆
      var fb = document.createElement('div');
      fb.innerHTML = '<div class="cal__fb"><iframe title="HPX 高雄讀書會行事曆" loading="lazy" src="' +
        EMBED + '"></iframe></div>' +
        '<p class="cal__note">目前改以 Google 月曆顯示。' +
        '<a href="' + SUB + '" target="_blank" rel="noopener">訂閱到自己的日曆 →</a></p>';
      host.appendChild(fb);
      return;
    }
    var y = cur.getFullYear(), m = cur.getMonth();
    var now = new Date(), todayStr = ymd(now.getFullYear(), now.getMonth(), now.getDate());
    var first = new Date(y, m, 1);
    var lead = (first.getDay() + 6) % 7;           // 週一為一週之始
    var days = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var mine = byMonth(y, m);

    var cells = '';
    var total = Math.ceil((lead + days) / 7) * 7;
    for (var i = 0; i < total; i++) {
      var dn, out = false, key = null;
      if (i < lead) { dn = prevDays - lead + 1 + i; out = true; }
      else if (i < lead + days) { dn = i - lead + 1; key = ymd(y, m, dn); }
      else { dn = i - lead - days + 1; out = true; }

      var evs = key ? mine.filter(function (e) { return e.d === key; }) : [];
      var body = evs.slice(0, 2).map(function (e) {
        return '<span class="cal__e" title="' + esc(e.t) + '">' + esc(e.t) + '</span>';
      }).join('');
      if (evs.length > 2) body += '<span class="cal__more">+' + (evs.length - 2) + '</span>';

      cells += '<div class="cal__c' + (out ? ' cal__c--out' : '') +
        (key === todayStr ? ' cal__c--today' : '') + '">' +
        '<span class="cal__n">' + dn + '</span>' + body + '</div>';
    }

    var list = mine.map(function (e) {
      var p = e.d.split('-');
      var dt = new Date(+p[0], +p[1] - 1, +p[2]);
      return '<li class="cal__li">' +
        '<time class="cal__d" datetime="' + e.d + '">' +
        '<span class="cal__md">' + (+p[1]) + '/' + (+p[2]) + '</span>' +
        '<span class="cal__wdx">週' + WD[(dt.getDay() + 6) % 7] + (e.s ? ' ' + e.s : '') + '</span></time>' +
        '<span class="cal__t">' + esc(e.t) + '</span>' +
        (e.h ? '<span class="cal__h">' + esc(e.h) + '</span>' : '') + '</li>';
    }).join('');
    if (!list) list = '<li class="cal__empty">這個月沒有已排定的活動。</li>';

    host.innerHTML =
      '<div class="cal__bar">' +
        '<h3 class="cal__ttl">' + y + ' 年 ' + (m + 1) + ' 月</h3>' +
        '<div class="cal__nav">' +
          '<button class="cal__b" type="button" data-go="-1" aria-label="上個月">←</button>' +
          '<button class="cal__b" type="button" data-go="0">本月</button>' +
          '<button class="cal__b" type="button" data-go="1" aria-label="下個月">→</button>' +
        '</div>' +
      '</div>' +
      '<div class="cal__grid" role="grid">' +
        WD.map(function (w) { return '<div class="cal__wd">' + w + '</div>'; }).join('') +
        cells +
      '</div>' +
      '<ul class="cal__list">' + list + '</ul>' +
      '<p class="cal__note">資料直接讀取社團 Google 行事曆。' +
      '<a href="' + SUB + '" target="_blank" rel="noopener">訂閱到自己的日曆 →</a></p>';

    host.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = +b.dataset.go;
        if (g === 0) cur = new Date();
        else cur = new Date(cur.getFullYear(), cur.getMonth() + g, 1);
        render();
      });
    });
  }

  function start() {
    host = document.getElementById(MOUNT);
    if (!host) return;
    host.className = 'cal';
    var s = document.createElement('style');
    s.textContent = css;
    document.head.appendChild(s);
    // 這裡刻意不清空：靜態清單先留著，成功取得資料後才整段換掉
    fetch(API, { headers: { accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (j) {
        if (!j || !j.ok || !Array.isArray(j.events)) throw new Error('bad payload');
        events = j.events;
        render();
      })
      .catch(function () { failed = true; render(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
