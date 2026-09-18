#!/usr/bin/env python3
"""
hpxkh-site 建置腳本（由 GitHub Actions 執行，可重複執行）

1. 把 index.html 內嵌的 <style> / <script> 拆成 assets/ 底下的獨立檔案
2. 產生行事曆頁：靜態的近期場次清單（SEO / 無 JavaScript 用）＋ 互動月曆掛載點
3. 補齊 <head> 必要標籤

沒有變動時不寫入任何檔案。
"""
import re, os, sys, html, datetime, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hpxkh-site')
ROOT = os.path.normpath(ROOT)
INDEX = os.path.join(ROOT, 'index.html')
ASSETS = os.path.join(ROOT, 'assets')

ICS = 'https://calendar.google.com/calendar/ical/kaohsiunghpx%40gmail.com/public/basic.ics'

BEGIN = '<!-- CAL:BEGIN 由 tools/build.py 自動產生，請勿手動編輯 -->'
END = '<!-- CAL:END -->'

EXTRA_CSS = '''
/* ══ 行事曆頁：靜態清單 ══ */
.up{list-style:none;margin:0;padding:0;border-top:1px solid var(--hair)}
.up__i{display:grid;grid-template-columns:auto 1fr auto;align-items:baseline;gap:4px 16px;
  padding:14px 2px;border-bottom:1px solid var(--hair)}
.up__d{display:flex;align-items:baseline;gap:8px;white-space:nowrap}
.up__md{font-family:var(--serif);font-size:19px;letter-spacing:.02em;color:var(--ink)}
.up__wd{font-size:12px;color:var(--ink-3);letter-spacing:.06em}
.up__t{color:var(--ink);line-height:1.6;text-wrap:pretty}
.up__h{font-size:12.5px;color:var(--ink-3);white-space:nowrap}
.up__note{margin-top:12px;font-size:12.5px;color:var(--ink-3)}
.calwrap{position:relative;border:1px solid var(--hair);background:#fff;
  height:min(78vh,720px);overflow:hidden}
.calwrap iframe{width:100%;height:100%;display:block}
@media (max-width:640px){
  .up__i{grid-template-columns:auto 1fr;gap:2px 12px}
  .up__h{grid-column:2;justify-self:start}
  .calwrap{height:min(120vw,560px)}
}
'''


def fetch_events():
    req = urllib.request.Request(ICS, headers={'User-Agent': 'hpxkh-site-build'})
    raw = urllib.request.urlopen(req, timeout=30).read().decode('utf-8')
    raw = raw.replace('\r\n ', '').replace('\r\n', '\n')
    today = datetime.date.today()
    out = []
    for blk in raw.split('BEGIN:VEVENT')[1:]:
        m = re.search(r'DTSTART[^:]*:(\d{8})', blk)
        s = re.search(r'SUMMARY:(.*)', blk)
        if not m or not s:
            continue
        d = datetime.datetime.strptime(m.group(1), '%Y%m%d').date()
        if d < today:
            continue
        title = s.group(1).strip().replace('\\,', ',').replace('\\;', ';').replace('\\n', ' ')
        host = ''
        hm = re.search(r'[（(]\s*(?:主辦人|主辦|主揪|導讀人|導讀)\s*[:：]\s*(.*?)\s*[）)]', title)
        if hm:
            host = hm.group(1).strip()
            title = title[:hm.start()].strip()
        if title.startswith('【') and title.endswith('】'):
            title = title[1:-1]
        out.append((d, title, host))
    return sorted(set(out))[:12]


def calendar_block(events):
    """靜態的近期場次清單（給搜尋引擎與未啟用 JavaScript 的訪客）。
    assets/calendar.js 載入成功後會把 #calMount 換成可翻月的互動月曆。"""
    wd = '一二三四五六日'
    rows = []
    for d, title, host in events:
        rows.append(
            '        <li class="up__i">'
            f'<time class="up__d" datetime="{d.isoformat()}">'
            f'<span class="up__md">{d.month}/{d.day}</span>'
            f'<span class="up__wd">週{wd[d.weekday()]}</span></time>'
            f'<span class="up__t">{html.escape(title)}</span>'
            + (f'<span class="up__h">{html.escape(host)}</span>' if host else '')
            + '</li>')
    body = '\n'.join(rows) if rows else '        <li class="up__i"><span class="up__t">近期尚無已排定的活動。</span></li>'
    stamp = datetime.date.today().isoformat()
    return f"""{BEGIN}
  <section class="blk pad">
    <div id="calMount">
      <div class="blk__h"><h3>近期場次</h3><p>接下來已經排定的活動。</p></div>
      <ul class="up">
{body}
      </ul>
      <p class="up__note">靜態清單更新於 {stamp}。
        <a href="https://hpxkh.pse.is/hpxkh_calendar" target="_blank" rel="noopener">開啟完整行事曆 →</a></p>
    </div>
  </section>
  <section class="blk pad">
    <div class="blk__h"><h3>訂閱到自己的日曆</h3><p>在月曆右下角點「＋ Google 日曆」，之後社團新增的活動就會自動同步，不必每次回來查。</p></div>
  </section>
{END}"""


def main():
    src = open(INDEX, encoding='utf-8').read()
    before = src
    os.makedirs(ASSETS, exist_ok=True)
    written = []

    # ---- 1. 拆出 CSS ----
    sty = re.search(r'<style>(.*?)</style>', src, re.S)
    if sty:
        css = sty.group(1)
        if '.calwrap' not in css:
            css += EXTRA_CSS
        open(os.path.join(ASSETS, 'app.css'), 'w', encoding='utf-8').write(css)
        written.append('assets/app.css')
        src = src.replace(sty.group(0), '<link rel="stylesheet" href="assets/app.css">', 1)

    # ---- 2. 拆出 JS（依原始順序切段，不調動任何一行）----
    scr = re.search(r'<script>(.*?)</script>', src, re.S)
    if scr:
        js = scr.group(1)
        decls = [m.start() for m in re.finditer(r'(?m)^(?:const|let|var|function|async function)\s', js)]
        if len(decls) >= 4:
            sess = [p for p in decls if js[p:p + 11].startswith('const SESS')]
            cuts = []
            if sess:
                i = decls.index(sess[0])
                cuts = [sess[0], decls[i + 1]]
                tail = decls[i + 1]
            else:
                tail = decls[0]
            mid = min(decls, key=lambda p: abs(p - (tail + (len(js) - tail) // 2)))
            cuts.append(mid)
            cuts = sorted(set(c for c in cuts if 0 < c < len(js)))
            parts, prev = [], 0
            for c in cuts:
                parts.append(js[prev:c]); prev = c
            parts.append(js[prev:])
            assert ''.join(parts) == js, 'JS 切段不一致，中止'
            names = ['assets/app-1.js', 'assets/data-sess.js', 'assets/app-2.js', 'assets/app-3.js'][:len(parts)]
            for n, body in zip(names, parts):
                open(os.path.join(ROOT, n), 'w', encoding='utf-8').write(body)
                written.append(n)
            src = src.replace(scr.group(0),
                              '\n'.join('<script src="%s"></script>' % n for n in names), 1)

    # ---- 3. 行事曆頁 ----
    block = calendar_block(fetch_events())
    if BEGIN in src:
        src = re.sub(re.escape(BEGIN) + r'.*?' + re.escape(END), lambda m: block, src, flags=re.S)
    else:
        start = src.find('  <section class="blk pad">\n    <div class="embed">\n      <p class="eyebrow">Google Calendar</p>')
        if start == -1:
            print('!! 找不到行事曆區塊，略過這一步', file=sys.stderr)
        else:
            end = src.index('</div>\n\n<!-- 文件表單 -->', start)
            src = src[:start] + block + '\n' + src[end:]

    # ---- 3b. 掛上互動月曆 ----
    if 'assets/calendar.js' not in src:
        src = src.replace('</body>', '<script src="assets/calendar.js"></script>\n</body>', 1) \
            if '</body>' in src else src + '\n<script src="assets/calendar.js"></script>\n'

    # ---- 4. head ----
    head = ''
    if 'charset' not in src[:400]:
        head += '<meta charset="utf-8">\n'
    if 'viewport' not in src[:1200]:
        head += '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
    if 'favicon.svg' not in src:
        head += '<link rel="icon" type="image/svg+xml" href="favicon.svg">\n'
    src = head + src

    if src != before:
        open(INDEX, 'w', encoding='utf-8').write(src)
        written.append('index.html')
    print('更新：' + (', '.join(written) if written else '無'))


if __name__ == '__main__':
    main()
