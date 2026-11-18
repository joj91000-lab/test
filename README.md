# TechPulse（科技脈動）

Aggregated tech news UI with Cloudflare Pages Functions (`functions/api/`) and a local Express + Vite server for development.

## Local

```bash
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

## Production build

```bash
npm run build
```

Output: `dist/` (Pages static assets). Edge APIs live under `functions/api/`.

## Cloudflare Pages deploy (`techstream-ai`)

See [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md).

Gemini translations run in Pages Functions / Express via `GEMINI_API_KEY` (Cloudflare Secret or local `.env`). The browser never receives the key.

```bash
npm run build
npx wrangler pages deploy dist --project-name=techstream-ai
npx wrangler pages secret put GEMINI_API_KEY --project-name=techstream-ai
```

Non-interactive CI needs `CLOUDFLARE_API_TOKEN` (and optionally `CLOUDFLARE_ACCOUNT_ID`).