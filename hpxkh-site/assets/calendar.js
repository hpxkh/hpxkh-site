/* 行事曆頁：向 /api/events 取得社團公開行事曆，繪製可翻月的月曆。
   取不到資料時退回內嵌 Google 月曆，不會開天窗。 */
(function () {
  if (window.__hpxkhCal) return;
  window.__hpxkhCal = 1;
  var MOUNT = 'calMount';
  var API = '/api/events';
  var EMBED = 'https://calendar.google.com/calendar/embed?src=kaohsiunghpx%40gmail.com' +
    '&ctz=Asia%2FTaipei&mode=MONTH&showTitle=0&showPrint=0&showTabs=0' +
    '&showCalendars=0&showTz=0&wkst=2&bgcolor=%23ffffff';
  var SUB = 'https://calendar.google.com/calendar/u/0/r?cid=kaohsiunghpx@gmail.com';
  var WD = ['一', '二', '三', '四', '五', '六', '日'];
  // 同一個活動名稱固定同一色；六色全配對通過色盲與一般視覺的分離度檢驗
  var PAL = ['#2a78d6', '#EF8200', '#1baf7a', '#4a3aa7', '#b0447a', '#5e7d00'];

  var css = '' +
    '.cal{--cal-line:var(--hair,#E6E1D9);--cal-ink:var(--ink,#2B2823);--cal-dim:var(--ink-3,#918B81);--cal-bg:var(--cream,#F7F4EF);--cal-key:var(--orange,#EF8200)}' +
    '.cal__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}' +
    '.cal__ttl{font-family:var(--serif,Georgia,serif);font-size:clamp(20px,2.6vw,26px);letter-spacing:.02em;color:var(--cal-ink);margin:0}' +
    '.cal__nav{display:flex;align-items:center;gap:10px}' +
    '.cal__b{font:inherit;font-size:13px;letter-spacing:.04em;cursor:pointer;background:transparent;color:var(--cal-ink);' +
      'border:1px solid var(--cal-line);border-radius:999px;padding:8px 16px;line-height:1;transition:.15s}' +
    '.cal__b:hover{border-color:var(--cal-ink)}' +
    '.cal__pair{display:inline-flex}' +
    '.cal__a{display:grid;place-items:center;width:34px;height:32px;cursor:pointer;background:transparent;' +
      'border:1px solid var(--cal-line);color:var(--cal-ink);padding:0;transition:.15s}' +
    '.cal__a:first-child{border-radius:999px 0 0 999px}' +
    '.cal__a:last-child{border-radius:0 999px 999px 0;margin-left:-1px}' +
    '.cal__a:hover{border-color:var(--cal-ink);background:var(--cal-bg);z-index:1}' +
    '.cal__a svg{width:7px;height:12px;display:block}' +
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
      'border-left:3px solid var(--cal-key);padding:3px 5px 3px 6px;overflow:hidden;text-overflow:ellipsis;' +
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}' +
    '.cal__cont{color:var(--cal-dim);margin-right:3px}' +
    '.cal__more{font-size:11px;color:var(--cal-dim)}' +
    '.cal__foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px;margin-top:16px}' +
    '.cal__subb{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;letter-spacing:.04em;text-decoration:none;' +
      'color:#fff;background:var(--cal-key);border:1px solid var(--cal-key);border-radius:999px;padding:10px 20px;transition:.15s}' +
    '.cal__subb:hover{filter:brightness(1.06)}' +
    '.cal__note{font-size:12.5px;color:var(--cal-dim);margin:0}' +
    '.cal__fb{border:1px solid var(--cal-line);background:#fff;height:min(78vh,720px);overflow:hidden}' +
    '.cal__fb iframe{width:100%;height:100%;display:block;border:0}' +
    '@media (max-width:760px){' +
      '.cal__bar{flex-direction:row;align-items:center;gap:10px}' +
      '.cal__ttl{font-size:19px}' +
      '.cal__b{padding:7px 12px;font-size:12.5px}' +
      '.cal__a{width:30px;height:29px}' +
      '.cal__c{min-height:76px;padding:3px 3px;gap:2px}' +
      '.cal__n{font-size:12px}' +
      '.cal__c--today .cal__n{width:18px;height:18px;font-size:11px}' +
      '.cal__e{font-size:8.5px;line-height:1.25;padding:2px 3px 2px 4px;border-left-width:3px;-webkit-line-clamp:3}' +
      '.cal__more{font-size:9px}' +
      '.cal__foot{flex-direction:column;align-items:stretch}' +
      '.cal__subb{justify-content:center}' +
    '}';

  function slotOf(t) {
    var h = 2166136261;
    for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h % PAL.length;
  }
  /* 整月一次配色：
     - 同一個活動名稱，整個月都是同一色
     - 會在同一天出現的活動，保證不同色
     先用名稱雜湊決定偏好色（讓顏色盡量穩定），再避開同日夥伴已用的顏色。 */
  function colorMap(list) {
    var titles = [], seen = {}, mates = {};
    list.forEach(function (e) {
      if (!seen[e.t]) { seen[e.t] = 1; titles.push(e.t); mates[e.t] = {}; }
    });
    var byDay = {};
    list.forEach(function (e) { (byDay[e.d] = byDay[e.d] || []).push(e.t); });
    Object.keys(byDay).forEach(function (d) {
      var g = byDay[d];
      g.forEach(function (a) {
        g.forEach(function (b) { if (a !== b) mates[a][b] = 1; });
      });
    });
    titles.sort();
    var map = {}, usedInMonth = {};
    titles.forEach(function (t) {
      var taken = {};
      Object.keys(mates[t]).forEach(function (n) { if (map[n]) taken[map[n]] = 1; });
      var start = slotOf(t), pick = null, fallback = null;
      for (var k = 0; k < PAL.length; k++) {
        var c = PAL[(start + k) % PAL.length];
        if (taken[c]) continue;
        if (fallback === null) fallback = c;      // 同日不衝突即可用
        if (!usedInMonth[c]) { pick = c; break; } // 本月還沒用過，優先
      }
      map[t] = pick || fallback || PAL[start];
      usedInMonth[map[t]] = 1;
    });
    return map;
  }

  function tint(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function CHEV(left) {
    return '<svg viewBox="0 0 7 12" fill="none" aria-hidden="true">' +
      '<path d="' + (left ? 'M6 1 L1 6 L6 11' : 'M1 1 L6 6 L1 11') + '" ' +
      'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function FOOT(note) {
    return '<div class="cal__foot">' +
      '<a class="cal__subb" href="' + SUB + '" target="_blank" rel="noopener">＋ 訂閱到自己的日曆</a>' +
      '<span class="cal__note">' + note + '</span></div>';
  }

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
      // 讀取失敗時退回 Google 內嵌月曆，畫面不會開天窗
      host.innerHTML = '<div class="cal__fb"><iframe title="HPX 高雄讀書會行事曆" loading="lazy" src="' +
        EMBED + '"></iframe></div>' + FOOT('目前改以 Google 月曆顯示。');
      return;
    }
    var y = cur.getFullYear(), m = cur.getMonth();
    var now = new Date(), todayStr = ymd(now.getFullYear(), now.getMonth(), now.getDate());
    var first = new Date(y, m, 1);
    var lead = (first.getDay() + 6) % 7;           // 週一為一週之始
    var days = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();
    var mine = byMonth(y, m);
    var cmap = colorMap(mine);

    var cells = '';
    var total = Math.ceil((lead + days) / 7) * 7;
    for (var i = 0; i < total; i++) {
      var dn, out = false, key = null;
      if (i < lead) { dn = prevDays - lead + 1 + i; out = true; }
      else if (i < lead + days) { dn = i - lead + 1; key = ymd(y, m, dn); }
      else { dn = i - lead - days + 1; out = true; }

      var evs = key ? mine.filter(function (e) { return e.d === key; }) : [];
      var body = evs.slice(0, 2).map(function (e) {
        var c = cmap[e.t] || PAL[0];
        var cont = e.n && e.i > 1;   // 跨日活動的第二天之後
        return '<span class="cal__e" style="border-left-color:' + c + ';background:' + tint(c, '.10') + '"' +
          ' title="' + esc(e.t) + (e.h ? '（' + esc(e.h) + '）' : '') +
          (e.n ? '　第 ' + e.i + ' 天／共 ' + e.n + ' 天' : '') + '">' +
          (cont ? '<span class="cal__cont">↳</span>' : '') + esc(e.t) + '</span>';
      }).join('');
      if (evs.length > 2) body += '<span class="cal__more">+' + (evs.length - 2) + '</span>';

      cells += '<div class="cal__c' + (out ? ' cal__c--out' : '') +
        (key === todayStr ? ' cal__c--today' : '') + '">' +
        '<span class="cal__n">' + dn + '</span>' + body + '</div>';
    }

    host.innerHTML =
      '<div class="cal__bar">' +
        '<h3 class="cal__ttl">' + y + ' 年 ' + (m + 1) + ' 月</h3>' +
        '<div class="cal__nav">' +
          '<button class="cal__b" type="button" data-go="0">今天</button>' +
          '<div class="cal__pair">' +
            '<button class="cal__a" type="button" data-go="-1" aria-label="上個月">' + CHEV(1) + '</button>' +
            '<button class="cal__a" type="button" data-go="1" aria-label="下個月">' + CHEV(0) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cal__grid" role="grid">' +
        WD.map(function (w) { return '<div class="cal__wd">' + w + '</div>'; }).join('') +
        cells +
      '</div>' +
      FOOT('直接讀取社團 Google 行事曆，社團那邊一更新這裡就會跟著變。');

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
