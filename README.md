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

## Cloudflare Pages deploy

See [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md).

CLI (requires Cloudflare auth):

```bash
npm run build
npx wrangler pages deploy dist --project-name=techpulse-app
```

In non-interactive environments set `CLOUDFLARE_API_TOKEN` (and optionally `CLOUDFLARE_ACCOUNT_ID`).
