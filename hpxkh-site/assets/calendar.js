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
    '.cal__bar{display:flex;align-items:center;justify-content:center;margin-bottom:16px}' +
    '.cal__nav{display:inline-flex;align-items:stretch}' +
    '.cal__a{display:grid;place-items:center;width:38px;cursor:pointer;background:transparent;' +
      'border:1px solid var(--cal-line);color:var(--cal-ink);padding:0;transition:.15s}' +
    '.cal__a:first-child{border-radius:999px 0 0 999px}' +
    '.cal__a:last-child{border-radius:0 999px 999px 0}' +
    '.cal__a:hover{background:var(--cal-bg)}' +
    '.cal__a svg{width:8px;height:13px;display:block}' +
    '.cal__mo{font-family:var(--serif,Georgia,serif);font-size:clamp(15px,1.6vw,17px);letter-spacing:.06em;' +
      'color:var(--cal-ink);cursor:pointer;background:transparent;border:1px solid var(--cal-line);' +
      'border-left:0;border-right:0;padding:9px 18px;line-height:1.25;white-space:nowrap;transition:.15s}' +
    '.cal__mo:hover{background:var(--cal-bg)}' +
    '.cal__mo[aria-expanded="true"]{background:var(--cal-bg)}' +
    '.cal__wrap{position:relative;display:inline-block}' +
    '.cal__pick{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);z-index:20;' +
      'width:min(300px,86vw);background:#fff;border:1px solid var(--cal-line);border-radius:14px;' +
      'box-shadow:0 12px 32px rgb(43 40 35 / .13);padding:14px}' +
    '.cal__pyr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}' +
    '.cal__pyr strong{font-family:var(--serif,Georgia,serif);font-size:16px;letter-spacing:.06em;font-weight:500}' +
    '.cal__ya{width:30px;height:30px;display:grid;place-items:center;cursor:pointer;background:transparent;' +
      'border:1px solid var(--cal-line);border-radius:999px;color:var(--cal-ink);padding:0;transition:.15s}' +
    '.cal__ya:hover:not([disabled]){background:var(--cal-bg)}' +
    '.cal__ya[disabled]{opacity:.3;cursor:default}' +
    '.cal__ya svg{width:6px;height:11px;display:block}' +
    '.cal__pms{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}' +
    '.cal__pm{font:inherit;font-size:13px;cursor:pointer;background:transparent;color:var(--cal-ink);' +
      'border:1px solid transparent;border-radius:8px;padding:9px 0;transition:.12s}' +
    '.cal__pm:hover{background:var(--cal-bg)}' +
    '.cal__pm--on{background:var(--cal-key);border-color:var(--cal-key);color:#fff}' +
    '.cal__pm--has::after{content:"";display:block;width:4px;height:4px;border-radius:999px;' +
      'background:var(--cal-key);margin:3px auto 0}' +
    '.cal__pm--on.cal__pm--has::after{background:#fff}' +
    '.cal__ptoday{width:100%;margin-top:10px;font:inherit;font-size:12.5px;cursor:pointer;' +
      'background:transparent;border:1px solid var(--cal-line);border-radius:999px;padding:8px;' +
      'color:var(--cal-ink);transition:.15s}' +
    '.cal__ptoday:hover{background:var(--cal-bg)}' +
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
    '.cal__foot{display:flex;align-items:center;justify-content:space-between;gap:18px 28px;margin-top:22px;' +
      'padding:20px 24px;border:1px solid var(--cal-line);background:var(--cal-bg)}' +
    '.cal__foot h4{margin:0 0 6px;font-size:15px;letter-spacing:.02em;color:var(--cal-ink)}' +
    '.cal__foot p{margin:0;font-size:13px;line-height:1.75;color:var(--cal-dim);max-width:46em;text-wrap:pretty}' +
    '.cal__subb{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;font-size:13.5px;' +
      'letter-spacing:.04em;text-decoration:none;white-space:nowrap;' +
      'color:#fff;background:var(--cal-key);border:1px solid var(--cal-key);border-radius:999px;padding:12px 24px;transition:.15s}' +
    '.cal__subb:hover{filter:brightness(1.06)}' +
    '.cal__fb{border:1px solid var(--cal-line);background:#fff;height:min(78vh,720px);overflow:hidden}' +
    '.cal__fb iframe{width:100%;height:100%;display:block;border:0}' +
    '@media (max-width:760px){' +
      '.cal__mo{font-size:14.5px;padding:8px 14px}' +
      '.cal__a{width:36px}' +
      '.cal__c{min-height:76px;padding:3px 3px;gap:2px}' +
      '.cal__n{font-size:12px}' +
      '.cal__c--today .cal__n{width:18px;height:18px;font-size:11px}' +
      '.cal__e{font-size:8.5px;line-height:1.25;padding:2px 3px 2px 4px;border-left-width:3px;-webkit-line-clamp:3}' +
      '.cal__more{font-size:9px}' +
      '.cal__foot{flex-direction:column;align-items:stretch;gap:16px;padding:18px}' +
      '.cal__subb{width:100%}' +
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
      '<div><h4>訂閱到自己的日曆</h4><p>' + note + '</p></div>' +
      '<a class="cal__subb" href="' + SUB + '" target="_blank" rel="noopener">＋ 加入我的日曆</a>' +
      '</div>';
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
  var picking = false, pickYear = null, outside = null;

  function byMonth(y, m) {
    var pre = y + '-' + String(m + 1).padStart(2, '0');
    return events.filter(function (e) { return e.d.indexOf(pre) === 0; });
  }

  function yearRange() {
    var lo = 9999, hi = 0;
    (events || []).forEach(function (e) {
      var y = +e.d.slice(0, 4);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    });
    var now = new Date().getFullYear();
    if (lo > hi) { lo = now; hi = now; }
    return [Math.min(lo, now), Math.max(hi, now)];
  }

  function monthsWithEvents(y) {
    var set = {};
    (events || []).forEach(function (e) {
      if (+e.d.slice(0, 4) === y) set[+e.d.slice(5, 7)] = 1;
    });
    return set;
  }

  function picker() {
    var r = yearRange(), y = pickYear, has = monthsWithEvents(y);
    var now = new Date();
    var cells = '';
    for (var m = 1; m <= 12; m++) {
      var on = (y === cur.getFullYear() && m === cur.getMonth() + 1);
      cells += '<button class="cal__pm' + (on ? ' cal__pm--on' : '') +
        (has[m] ? ' cal__pm--has' : '') + '" type="button" data-m="' + m + '">' + m + ' 月</button>';
    }
    return '<div class="cal__pick" role="dialog" aria-label="選擇月份">' +
      '<div class="cal__pyr">' +
        '<button class="cal__ya" type="button" data-y="-1" aria-label="前一年"' +
          (y <= r[0] ? ' disabled' : '') + '>' + CHEV(1) + '</button>' +
        '<strong>' + y + ' 年</strong>' +
        '<button class="cal__ya" type="button" data-y="1" aria-label="後一年"' +
          (y >= r[1] ? ' disabled' : '') + '>' + CHEV(0) + '</button>' +
      '</div>' +
      '<div class="cal__pms">' + cells + '</div>' +
      '<button class="cal__ptoday" type="button" data-today>回到本月（' +
        now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月）</button>' +
    '</div>';
  }

  function closePicker() {
    if (!picking) return;
    picking = false;
    render();
  }

  function render() {
    if (failed) {
      // 讀取失敗時退回 Google 內嵌月曆，畫面不會開天窗
      host.innerHTML = '<div class="cal__fb"><iframe title="HPX 高雄讀書會行事曆" loading="lazy" src="' +
        EMBED + '"></iframe></div>' +
        FOOT('目前改以 Google 內嵌月曆顯示。加入之後，社團新增或異動的場次都會自動出現在你的 Google 日曆。');
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
        '<div class="cal__wrap">' +
          '<div class="cal__nav">' +
            '<button class="cal__a" type="button" data-go="-1" aria-label="上個月">' + CHEV(1) + '</button>' +
            '<button class="cal__mo" type="button" data-pick title="選擇月份"' +
              ' aria-haspopup="dialog" aria-expanded="' + (picking ? 'true' : 'false') + '">' +
              y + ' 年 ' + (m + 1) + ' 月</button>' +
            '<button class="cal__a" type="button" data-go="1" aria-label="下個月">' + CHEV(0) + '</button>' +
          '</div>' +
          (picking ? picker() : '') +
        '</div>' +
      '</div>' +
      '<div class="cal__grid" role="grid">' +
        WD.map(function (w) { return '<div class="cal__wd">' + w + '</div>'; }).join('') +
        cells +
      '</div>' +
      FOOT('加入之後，社團新增或異動的場次都會自動出現在你的 Google 日曆，不必再回來查。本頁的資料直接讀取社團行事曆，社團那邊一更新這裡就跟著變。');

    host.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        picking = false;
        cur = new Date(cur.getFullYear(), cur.getMonth() + (+b.dataset.go), 1);
        render();
      });
    });

    var mo = host.querySelector('[data-pick]');
    if (mo) mo.addEventListener('click', function (ev) {
      ev.stopPropagation();
      picking = !picking;
      if (picking) pickYear = cur.getFullYear();
      render();
    });

    var pick = host.querySelector('.cal__pick');
    if (pick) {
      pick.addEventListener('click', function (ev) { ev.stopPropagation(); });
      pick.querySelectorAll('[data-y]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (b.disabled) return;
          pickYear += (+b.dataset.y);
          render();
        });
      });
      pick.querySelectorAll('[data-m]').forEach(function (b) {
        b.addEventListener('click', function () {
          cur = new Date(pickYear, (+b.dataset.m) - 1, 1);
          picking = false;
          render();
        });
      });
      var td = pick.querySelector('[data-today]');
      if (td) td.addEventListener('click', function () {
        cur = new Date();
        picking = false;
        render();
      });
    }

    if (!outside) {
      outside = function (ev) {
        if (!picking) return;
        if (host.contains(ev.target) && ev.target.closest('.cal__wrap')) return;
        closePicker();
      };
      document.addEventListener('click', outside);
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') closePicker();
      });
    }
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
