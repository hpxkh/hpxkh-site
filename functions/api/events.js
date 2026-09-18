/**
 * /api/events — 讀取社團公開 Google 行事曆，轉成精簡 JSON 回給前端。
 * 上游 .ics 在邊緣快取 30 分鐘，所以 Google 端更新後最多 30 分鐘內反映。
 */
const ICS = 'https://calendar.google.com/calendar/ical/kaohsiunghpx%40gmail.com/public/basic.ics';
const MAX_RECUR = 60;
/** 不對外顯示的內部行程（標題含這些字就略過） */
const HIDE = ['任勞任怨'];

function unfold(text) {
  return text.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').replace(/\r\n/g, '\n');
}

function unescape_(v) {
  return v.replace(/\\n/gi, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\').trim();
}

/** 20260922 或 20260922T190000 → {ymd:'2026-09-22', hm:'19:00'|null} */
function parseDT(raw) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/.exec(raw.trim());
  if (!m) return null;
  return {
    ymd: `${m[1]}-${m[2]}-${m[3]}`,
    hm: m[4] ? `${m[4]}:${m[5]}` : null,
    date: Date.UTC(+m[1], +m[2] - 1, +m[3]),
  };
}

function addMonths(ms, n) {
  const d = new Date(ms);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.getTime();
}

function toYmd(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** 展開簡單的重複規則（DAILY / WEEKLY / MONTHLY / YEARLY，支援 UNTIL、COUNT） */
function expand(startMs, rrule) {
  const p = {};
  rrule.split(';').forEach(kv => {
    const i = kv.indexOf('=');
    if (i > 0) p[kv.slice(0, i).toUpperCase()] = kv.slice(i + 1);
  });
  const freq = p.FREQ;
  if (!freq) return [startMs];
  const interval = Math.max(1, parseInt(p.INTERVAL || '1', 10));
  const untilDT = p.UNTIL ? parseDT(p.UNTIL) : null;
  const until = untilDT ? untilDT.date : null;
  const count = p.COUNT ? parseInt(p.COUNT, 10) : null;
  const horizon = Date.now() + 1000 * 60 * 60 * 24 * 550;

  const out = [];
  let cur = startMs;
  for (let i = 0; i < MAX_RECUR; i++) {
    if (until !== null && cur > until) break;
    if (count !== null && out.length >= count) break;
    if (cur > horizon) break;
    out.push(cur);
    if (freq === 'DAILY') cur += 86400000 * interval;
    else if (freq === 'WEEKLY') cur += 604800000 * interval;
    else if (freq === 'MONTHLY') cur = addMonths(cur, interval);
    else if (freq === 'YEARLY') cur = addMonths(cur, 12 * interval);
    else break;
  }
  return out.length ? out : [startMs];
}

function parse(ics) {
  const blocks = unfold(ics).split('BEGIN:VEVENT').slice(1);
  const seen = new Set();
  const events = [];

  for (const b of blocks) {
    if (/^STATUS:CANCELLED$/m.test(b)) continue;
    const ds = /^DTSTART[^:\n]*:(.+)$/m.exec(b);
    const su = /^SUMMARY:(.*)$/m.exec(b);
    if (!ds || !su) continue;
    const st = parseDT(ds[1]);
    if (!st) continue;

    let title = unescape_(su[1]);
    let host = '';
    const hm = /[（(]\s*(?:主辦人|主辦|主揪|導讀人|導讀)\s*[:：]\s*([^）)]*)[）)]/.exec(title);
    if (hm) {
      host = hm[1].trim();
      title = title.slice(0, hm.index).trim();
    }
    if (title.startsWith('【') && title.endsWith('】')) title = title.slice(1, -1).trim();
    if (!title) continue;
    if (HIDE.some(function (k) { return title.indexOf(k) !== -1; })) continue;

    const rr = /^RRULE:(.+)$/m.exec(b);
    const stamps = rr ? expand(st.date, rr[1]) : [st.date];

    for (const ms of stamps) {
      const d = toYmd(ms);
      const key = d + '|' + title;
      if (seen.has(key)) continue;
      seen.add(key);
      const e = { d, t: title };
      if (host) e.h = host;
      if (st.hm) e.s = st.hm;
      events.push(e);
    }
  }
  events.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return events;
}

export async function onRequestGet() {
  try {
    const up = await fetch(ICS, {
      headers: { 'user-agent': 'hpxkh-site' },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    if (!up.ok) throw new Error('upstream ' + up.status);
    const events = parse(await up.text());
    return new Response(JSON.stringify({ ok: true, generated: new Date().toISOString(), events }), {
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err && err.message || err) }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
}
