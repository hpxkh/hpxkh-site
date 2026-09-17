# HPX 高雄讀書會 官方網站

書香南國—HPX 高雄讀書會（Happy People Cross）的官方網站原始碼。

- 網址：https://hpxkh.com
- 社團：https://www.facebook.com/groups/KaohsiungHPX
- 粉專：https://www.facebook.com/hpxkaohsiung

## 結構

```
index.html     整站（HTML + CSS + JS 全部在這一個檔案）
assets/        圖片資產（WebP）
robots.txt
```

靜態網站，沒有建置步驟。修改 `index.html` 後 push 即自動部署。

## 部署

Cloudflare Pages，連接本倉庫 main 分支。
Build command：留空　Output directory：`/`

## 待辦

- [ ] 場次總表、書單改由 Google 試算表同步（目前寫死在 index.html）
- [ ] 常辦書聚地點改為網頁正文（目前外連試算表）
- [ ] hash 路由改靜態路由，補 sitemap 與結構化資料
- [ ] 行事曆改為內嵌
- [ ] 入社、場地登記表接上 Google 表單
