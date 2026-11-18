# TechPulse / TechStream · Cloudflare Pages 部署（專案名：`techstream-ai`）

本專案以 **Cloudflare Pages** 部署靜態前端（`dist/`）與 `functions/api/` 邊緣函式。  
**Gemini API Key 只放在 Cloudflare Secrets / 伺服器環境變數，絕不放進前端 bundle。**

---

## 建立 Pages 專案 `techstream-ai`

### 方式一：Dashboard + Git（推薦）

1. 推送本倉庫至 GitHub。
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 專案名稱設為：**`techstream-ai`**。
4. Build settings：
   - Framework preset：`Vite`
   - Build command：`npm run build`
   - Build output directory：`dist`
   - Environment variable：`NODE_VERSION` = `22`
5. **Save and Deploy**。

### 方式二：Wrangler CLI

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name=techstream-ai
```

非互動環境需設定 `CLOUDFLARE_API_TOKEN`（以及建議設定 `CLOUDFLARE_ACCOUNT_ID`）。

---

## 設定 Gemini Secret（必要）

Gemini 只在後端呼叫（`functions/api/news.ts` / `server.ts` → `functions/utils/geminiTranslate.ts`），**前端永不持有 key**。

在 Cloudflare 為 **Production**（以及 Preview，若需要）新增密鑰變數：

- **Name**：`GEMINI_API_KEY`
- **Type**：Secret（Pages → Settings → Variables and Secrets）

Dashboard：`Workers & Pages` → `techstream-ai` → **Settings** → **Variables and Secrets** → **Add** → Secret。

或 CLI：

```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name=techstream-ai
```

設好後務必 **Redeploy**，讓 Pages Functions 讀到 secret。

本機開發：

```bash
cp .env.example .env
# 編輯 .env 填入 GEMINI_API_KEY（勿提交）
npm run dev
```

Pages Functions 只在 `/api/news` 內部使用此密鑰做繁中翻譯（無公開 translate proxy）；前端只消費已翻譯欄位，不會看到 key。

---

## 法律與合規摘要

- 品牌：TechPulse（科技脈動）
- 僅彙整公開 RSS 摘要並標註原文來源與連結
- 無 key 的外部圖時使用前端程序化 SVG 預覽圖
