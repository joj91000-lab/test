# TechPulse 科技脈動 · Cloudflare 部署指南

本專案已全面優化 **Cloudflare Pages** 與 **Cloudflare Workers** 邊緣架構，提供無伺服器、全域 CDN 快取及零冷啟動運行。

---

## 方式一：透過 Cloudflare Pages 控制台（最推薦、支援 Git 自動持續交付）

1. 將本專案程式碼上傳或推送至您的 **GitHub** 或 **GitLab** 倉庫。
2. 登入 [Cloudflare Dashboard](https://dash.cloudflare.com/)，點擊左側選單的 **Workers & Pages** -> **Create application** -> 選擇 **Pages**。
3. 點擊 **Connect to Git** 並選取您的專案儲存庫。
4. 設定建置參數（Build Settings）：
   - **Framework preset**：`Vite`
   - **Build command（建置指令）**：`npm run build`
   - **Build output directory（建置輸出目錄）**：`dist`
   - **Node.js Version**：建議設定環境變數 `NODE_VERSION` 為 `20` 或 `22`
5. 點擊 **Save and Deploy**。
6. Cloudflare Pages 會自動編譯前端靜態資產，並將 `functions/api/` 中的無伺服器函式部署至 Cloudflare 全球邊緣網路（Edge Network），即可獲得專屬的 `*.pages.dev` 網址！

---

## 方式二：透過 Wrangler 命令列（CLI 一鍵發布）

若您習慣使用終端機，可直接在本地端執行發布：

1. 先編譯靜態產物：
   ```bash
   npm run build
   ```

2. 透過 Wrangler 部署至 Cloudflare Pages：
   ```bash
   npx wrangler pages deploy dist --project-name=techpulse-app
   ```

3. 依照終端機提示登入 Cloudflare 帳號，數秒內即可上線完成。

---

## ⚖️ 法律與著作權合規保證（Legal & IP Compliance）

1. **原創商標名稱**：
   - 品牌名稱採用 **TechPulse（科技脈動）**，無侵犯任何第三方商標（如 Techmeme 等）之法律風險。
2. **公開 RSS 合理使用（Fair Use）原則**：
   - 僅索引公開 XML/RSS 摘要資訊（非全文侵權搬運）。
   - 每則報導均提供清楚的原文媒體標註（TechCrunch, The Verge, WIRED...）與直連官方文章出處之 Canonical Link。
   - 所有標題與摘要繁體中文翻譯均為獨立教育導讀性衍生，符合資訊彙整與引用規範。
3. **圖片資產合法性**：
   - 無外部圖片的新聞均由前端即時向量程式碼（Procedural SVG）動態繪製，100% 自研原創無版權負擔。
   - 外部 RSS 圖片設定 `referrerPolicy="no-referrer"` 並標註原創作者及來源媒體，遵循引用規範。
