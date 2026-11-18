import React, { useState, useMemo } from 'react';
import { NewsItem, NewsSource, SortOption } from '../types/news';
import { StoryCard } from './StoryCard';
import { ExternalLink, Rss, Check, Search, SlidersHorizontal, Sparkles, Newspaper, Layers } from 'lucide-react';

interface SourceTabViewProps {
  sources: NewsSource[];
  articles: NewsItem[];
  activeSourceId: string;
  onSelectSource: (sourceId: string) => void;
  onLike: (id: string, willLike: boolean) => void;
  onOpenComments: (item: NewsItem) => void;
  onOpenPreview: (item: NewsItem) => void;
}

export const SourceTabView: React.FC<SourceTabViewProps> = ({
  sources,
  articles,
  activeSourceId,
  onSelectSource,
  onLike,
  onOpenComments,
  onOpenPreview
}) => {
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [internalSearch, setInternalSearch] = useState('');
  const [internalSort, setInternalSort] = useState<SortOption>('latest');

  // If activeSourceId is 'all', show all sources aggregated; otherwise show the specific source
  const isAll = activeSourceId === 'all';
  const currentSource = useMemo(() => {
    return sources.find(s => s.id === activeSourceId) || sources[0];
  }, [sources, activeSourceId]);

  // Article count by source
  const countsBySource = useMemo(() => {
    const map: Record<string, number> = {};
    articles.forEach(a => {
      map[a.sourceId] = (map[a.sourceId] || 0) + 1;
    });
    return map;
  }, [articles]);

  // Filtered articles for current tab
  const tabArticles = useMemo(() => {
    let list = isAll ? [...articles] : articles.filter(a => a.sourceId === currentSource?.id);

    if (internalSearch.trim()) {
      const q = internalSearch.toLowerCase();
      list = list.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          (a.titleZh || '').toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          (a.summaryZh || '').toLowerCase().includes(q) ||
          (a.author || '').toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      if (internalSort === 'latest') return b.timestamp - a.timestamp;
      if (internalSort === 'most-liked') return b.likesCount - a.likesCount;
      if (internalSort === 'most-discussed') return b.commentsCount - a.commentsCount;
      return b.timestamp - a.timestamp;
    });
  }, [articles, isAll, currentSource, internalSearch, internalSort]);

  const handleCopyFeed = (feedUrl: string) => {
    navigator.clipboard?.writeText(feedUrl);
    setCopiedFeed(feedUrl);
    setTimeout(() => setCopiedFeed(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 媒體分頁導航標籤欄（10 大媒體 Tab View） */}
      <div className="bg-white border border-stone-200 rounded-xl p-2.5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 px-1 text-xs text-stone-500">
          <div className="flex items-center gap-1.5 font-medium text-stone-700">
            <Layers className="w-4 h-4 text-stone-600" />
            <span>點擊分頁標籤切換個別媒體專屬新聞列表：</span>
          </div>
          <span className="font-mono text-stone-400 hidden sm:inline">10 大美國頂尖科技 RSS 訂閱源</span>
        </div>

        {/* 橫向捲動分頁標籤按鈕 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* 全部媒體總覽分頁 */}
          <button
            onClick={() => {
              onSelectSource('all');
              setInternalSearch('');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              isAll
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>全部媒體聚合</span>
            <span
              className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                isAll ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}
            >
              {articles.length}
            </span>
          </button>

          {/* 十大媒體個別分頁 */}
          {sources.map(source => {
            const isActive = !isAll && currentSource?.id === source.id;
            const count = countsBySource[source.id] || 0;

            return (
              <button
                key={source.id}
                onClick={() => {
                  onSelectSource(source.id);
                  setInternalSearch('');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span className="font-semibold">{source.nameZh.split(' ')[0]}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 當前分頁媒體刊頭資訊卡片 */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div className="flex items-start gap-3">
            <div
              className="w-4 h-4 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: isAll ? '#1c1917' : currentSource?.color }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  {isAll ? '美國十大科技網站聚合新聞列表' : currentSource?.nameZh || currentSource?.name}
                </h2>
                {!isAll && currentSource && (
                  <>
                    <span className="text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-medium">
                      {currentSource.categoryZh}
                    </span>
                    <a
                      href={`https://${currentSource.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-400 hover:text-stone-800 inline-flex items-center gap-1 font-mono"
                    >
                      <span>{currentSource.domain}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed max-w-3xl">
                {isAll
                  ? '將 TechCrunch、The Verge、WIRED 等 10 大美媒的新聞一次呈現，每篇新聞均提供英文原文與精準中文翻譯，並可按讚與發表討論。'
                  : currentSource?.descriptionZh || currentSource?.description}
              </p>
            </div>
          </div>

          {!isAll && currentSource && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopyFeed(currentSource.feedUrl)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                title="複製該報 RSS 訂閱源"
              >
                {copiedFeed === currentSource.feedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">已複製 Feed</span>
                  </>
                ) : (
                  <>
                    <Rss className="w-3.5 h-3.5 text-amber-600" />
                    <span>複製 RSS 網址</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* 搜尋與排序工具列 */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isAll ? '搜尋全部新聞標題、中譯或關鍵字…' : `搜尋 ${currentSource?.name} 的報導與中文翻譯…`}
              value={internalSearch}
              onChange={e => setInternalSearch(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 focus:bg-white text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 font-mono tabular-nums">
              共 {tabArticles.length} 則報導
            </span>
            <div className="relative">
              <select
                value={internalSort}
                onChange={e => setInternalSort(e.target.value as SortOption)}
                className="appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md pl-3 pr-7 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
              >
                <option value="latest">最新發佈時間</option>
                <option value="most-liked">最多人按讚</option>
                <option value="most-discussed">最多人留言討論</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 個別媒體分頁新聞列表 */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs divide-y divide-stone-100">
        <div className="pb-3 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-stone-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              {isAll ? '全部媒體報導列表' : `${currentSource?.name} 專屬新聞列表`}
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            雙語對照 · 標題與摘要附繁體中文翻譯
          </span>
        </div>

        {tabArticles.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            該分頁目前無符合搜尋條件的新聞報導。
          </div>
        ) : (
          tabArticles.map((item, idx) => (
            <StoryCard
              key={item.id}
              item={item}
              isLead={idx === 0}
              onLike={onLike}
              onOpenComments={onOpenComments}
              onOpenPreview={onOpenPreview}
              onFilterSource={onSelectSource}
            />
          ))
        )}
      </div>
    </div>
  );
};
