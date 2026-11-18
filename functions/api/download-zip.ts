// Cloudflare Pages Function for /api/download-zip
// Source zip packaging is not available on Pages; return a non-OK status
// so browsers with download= do not save a misnamed JSON file.

export async function onRequestGet() {
  return new Response(JSON.stringify({
    success: false,
    message: '在 Cloudflare Pages 雲端環境中，請直接透過專案 Git Repository 或 AI Studio 介面下載完整 ZIP 原始碼包。',
    tip: '若需要本地端離線壓縮檔，請在本地執行 npm run dev 並確認 ALLOW_ZIP_DOWNLOAD=true 後再點擊下載 ZIP。'
  }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
