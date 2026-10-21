# 升学雷达 · 经济金融硕博

在线访问：https://Dreamer-156.github.io/finance-pathfinder/

国内外经济金融相关项目按院校堆叠，硕士、博士分开筛选。展示学费、计费周期、资助条件、就业方向和官方依据。资料年份不等于目标入学年份。

## 个人记录

无需登录。路线、收藏和人民币费用核算保存在当前浏览器的 localStorage，不提交到 GitHub。不同设备、浏览器和本机网站互不自动同步；清除浏览器数据会清除这些记录。可在“升学路线 → 个人记录备份”导出 JSON，在另一设备手动导入；导入会预览合并结果，保留当前收藏和同项目费用，并保存导入前备份供恢复。仓库不含本机 SQLite 或个人记录。

## 官网检查

GitHub Pages 是静态托管。每次发布工作流在独立进程中检查官方来源，失败、访问受限和待复核状态按实际结果显示。页面上的刷新读取最近发布的检查快照，不会实时跨域抓取官网。没有定时扫描。

更新：在 Actions → Deploy graduate radar to GitHub Pages → Run workflow 手动重新检查并发布，或提交 main 分支。

## 本地构建

需要 Node.js 24+。运行 npm ci、npm test、npm run typecheck、npm run check:pages-sources、npm run build:pages。产物位于 pages-dist/，可部署在仓库子路径。

学费采用官方资料的币种与计费周期。竞争性奖助不自动抵扣个人费用，2030 届招生和资助以当年公告及书面录取资助信为准。
