// Cloudflare Pages Function for /api/download-zip fallback

export async function onRequestGet({ request }: { request: Request }) {
  return new Response(JSON.stringify({
    message: '在 Cloudflare Pages 雲端環境中，請直接透過專案 Git Repository 或 AI Studio 介面下載完整 ZIP 原始碼包。',
    tip: '若需要本地端離線壓縮檔，請在本地執行 npm run dev 即可在頂部點擊下載 ZIP。'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
