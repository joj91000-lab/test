import React from 'react';
import { ViewMode } from '../types/news';
import { RefreshCw, Newspaper, Radio, Globe, LayoutGrid, Download } from 'lucide-react';

interface NavbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalArticles: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onRefresh,
  isRefreshing,
  totalArticles
}) => {
  const handleDownloadZip = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      const res = await fetch('/api/download-zip');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || contentType.includes('application/json')) {
        const payload = contentType.includes('application/json') ? await res.json().catch(() => null) : null;
        window.alert(
          payload?.message ||
            '目前環境無法產生 ZIP。請改從 Git 倉庫下載，或在本機以 ALLOW_ZIP_DOWNLOAD=true 執行 npm run dev。'
        );
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'techpulse-app.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert('下載 ZIP 失敗，請稍後再試或改從 Git 倉庫取得原始碼。');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-15">
          {/* Zone 1: 品牌字標 */}
          <button
            onClick={() => onViewChange('tabs')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-heading font-extrabold text-2xl tracking-tighter text-stone-900 group-hover:text-blue-700 transition-colors whitespace-nowrap shrink-0">
              TECH<span className="text-blue-700">PULSE</span>
              <span className="text-xs font-serif font-normal italic text-stone-500 ml-1.5 hidden sm:inline">
                科技脈動
              </span>
            </span>
          </button>

          {/* Zone 2: 4 個單行中文導航標籤 */}
          <nav className="flex items-center gap-4 sm:gap-7 text-sm font-medium text-stone-600">
            <button
              onClick={() => onViewChange('tabs')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'tabs'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-0.5'
                  : 'hover:text-stone-950'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-stone-500" />
              <span>各媒體 Tab 分頁</span>
            </button>
            <button
              onClick={() => onViewChange('frontpage')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'frontpage'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-0.5'
                  : 'hover:text-stone-950'
              }`}
            >
              <Newspaper className="w-4 h-4 text-stone-500" />
              <span>首頁聚合叢集</span>
            </button>
            <button
              onClick={() => onViewChange('river')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'river'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-0.5'
                  : 'hover:text-stone-950'
              }`}
            >
              <Radio className="w-4 h-4 text-stone-500" />
              <span>即時新聞河</span>
              <span className="text-xs text-stone-600 font-mono tabular-nums bg-stone-100 px-1.5 py-0.2 rounded">
                {totalArticles}
              </span>
            </button>
            <button
              onClick={() => onViewChange('sources')}
              className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'sources'
                  ? 'text-stone-950 font-semibold border-b-2 border-stone-900 -mb-0.5'
                  : 'hover:text-stone-950'
              }`}
            >
              <Globe className="w-4 h-4 text-stone-500" />
              <span>美國十大媒體</span>
            </button>
          </nav>

          {/* Zone 3: 下載 ZIP 與 重新整理 RSS 操作 */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-md transition-all shadow-xs whitespace-nowrap cursor-pointer"
              title="下載完整專案源碼 ZIP 壓縮檔"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">下載 ZIP</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-md transition-all shadow-sm active:scale-98 whitespace-nowrap cursor-pointer"
              title="即時抓取最新 RSS 數據"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? '抓取中…' : '重新整理'}
              </span>
              <span className="sm:hidden">{isRefreshing ? '…' : '更新'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
