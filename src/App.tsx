/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { NewsItem, NewsSource, ViewMode, CategoryFilter, SortOption } from './types/news';
import { fetchNewsArticles, fetchSources, toggleLikeNews } from './services/newsService';
import { Navbar } from './components/Navbar';
import { TechPulseHeader } from './components/TechmemeHeader';
import { FilterBar } from './components/FilterBar';
import { StoryCard } from './components/StoryCard';
import { RiverItem } from './components/RiverItem';
import { CommentDrawer } from './components/CommentDrawer';
import { ArticleModal } from './components/ArticleModal';
import { SourcesDirectory } from './components/SourcesDirectory';
import { TechPulseSidebar } from './components/TechmemeSidebar';
import { SourceTabView } from './components/SourceTabView';
import { Radio, RefreshCw, ArrowUp, Newspaper, LayoutGrid } from 'lucide-react';

export default function App() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 預設為 Tab View 分頁列表（依個別新聞來源呈現列表）
  const [currentView, setCurrentView] = useState<ViewMode>('tabs');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [tabSourceId, setTabSourceId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('salience');

  // 模態視窗與抽屜狀態
  const [activeCommentItem, setActiveCommentItem] = useState<NewsItem | null>(null);
  const [activePreviewItem, setActivePreviewItem] = useState<NewsItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('剛剛');

  // 初始化載入新聞與來源清單
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (force = false) => {
    if (force) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [fetchedArticles, fetchedSources] = await Promise.all([
        fetchNewsArticles(force),
        fetchSources()
      ]);
      setArticles(fetchedArticles);
      setSources(fetchedSources);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load news data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // 各媒體新聞篇數統計
  const articleCountsBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach(a => {
      counts[a.sourceId] = (counts[a.sourceId] || 0) + 1;
    });
    return counts;
  }, [articles]);

  // 聚合頁面過濾與排序邏輯
  const filteredArticles = useMemo(() => {
    return articles
      .filter(item => {
        if (selectedSource !== 'all' && item.sourceId !== selectedSource) {
          return false;
        }
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q) || (item.titleZh || '').toLowerCase().includes(q);
          const matchSummary = item.summary.toLowerCase().includes(q) || (item.summaryZh || '').toLowerCase().includes(q);
          const matchSource = item.sourceName.toLowerCase().includes(q);
          const matchAuthor = (item.author || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSummary && !matchSource && !matchAuthor) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return b.timestamp - a.timestamp;
        if (sortBy === 'most-liked') return b.likesCount - a.likesCount;
        if (sortBy === 'most-discussed') return b.commentsCount - a.commentsCount;
        if (a.isLeadStory && !b.isLeadStory) return -1;
        if (!a.isLeadStory && b.isLeadStory) return 1;
        return b.timestamp - a.timestamp;
      });
  }, [articles, selectedSource, selectedCategory, searchQuery, sortBy]);

  // 聚合頁頭條與一般報導切分
  const { leadStories, restStories } = useMemo(() => {
    const leads = filteredArticles.filter(a => a.isLeadStory || (a.relatedStories && a.relatedStories.length > 0));
    const leadSlice = leads.slice(0, 5);
    // Related coverage stays in the feed for source tabs, but hide those
    // links from the frontpage secondary list to avoid duplicating the lead cluster.
    const relatedLinks = new Set(
      leadSlice.flatMap(a => (a.relatedStories || []).map(r => r.link))
    );
    const rest = filteredArticles.filter(
      a => !leadSlice.includes(a) && !relatedLinks.has(a.link)
    );
    return { leadStories: leadSlice, restStories: rest };
  }, [filteredArticles]);

  // 按讚操作處理
  const handleLike = async (id: string, willLike: boolean) => {
    setArticles(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isLiked: willLike,
            likesCount: Math.max(0, item.likesCount + (willLike ? 1 : -1))
          };
        }
        return item;
      })
    );

    if (activeCommentItem && activeCommentItem.id === id) {
      setActiveCommentItem(prev =>
        prev
          ? {
              ...prev,
              isLiked: willLike,
              likesCount: Math.max(0, prev.likesCount + (willLike ? 1 : -1))
            }
          : null
      );
    }
    if (activePreviewItem && activePreviewItem.id === id) {
      setActivePreviewItem(prev =>
        prev
          ? {
              ...prev,
              isLiked: willLike,
              likesCount: Math.max(0, prev.likesCount + (willLike ? 1 : -1))
            }
          : null
      );
    }

    await toggleLikeNews(id, willLike);
  };

  const handleOpenComments = (item: NewsItem) => {
    setActiveCommentItem(item);
  };

  const handleOpenPreview = (item: NewsItem) => {
    setActivePreviewItem(item);
  };

  const handleCommentAdded = (newsId: string) => {
    setArticles(prev =>
      prev.map(item => {
        if (item.id === newsId) {
          return {
            ...item,
            commentsCount: item.commentsCount + 1
          };
        }
        return item;
      })
    );
  };

  const handleSelectSource = (sourceId: string, switchToTabs = false) => {
    if (sourceId === 'all') {
      setSelectedSource('all');
      setTabSourceId('all');
      if (switchToTabs) {
        setCurrentView('tabs');
      }
    } else {
      setSelectedSource(sourceId);
      setTabSourceId(sourceId);
      if (switchToTabs || currentView === 'sources') {
        setCurrentView('tabs');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fcfbf9] text-stone-900 flex flex-col font-sans selection:bg-stone-900 selection:text-white">
      {/* 頂部導航列（純中文） */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        totalArticles={articles.length}
      />

      {/* TechPulse 報頭 */}
      <TechPulseHeader
        lastUpdated={lastUpdated}
        selectedSource={currentView === 'tabs' ? tabSourceId : selectedSource}
        onSelectSource={(id) => handleSelectSource(id, true)}
      />

      {/* 分類與搜尋篩選欄（在聚合頁與新聞河流展示） */}
      {(currentView === 'frontpage' || currentView === 'river') && (
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filteredCount={filteredArticles.length}
        />
      )}

      {/* 主要內容展示區 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-stone-400 animate-spin mx-auto mb-3" />
            <p className="text-sm font-serif text-stone-600">
              正在即時連線抓取美國十大頂尖科技刊物 RSS 訂閱源，並進行智慧雙語分譯…
            </p>
          </div>
        ) : currentView === 'tabs' ? (
          /* 核心功能：個別新聞來源 Tab View，每個 Tab 內放專屬新聞列表 */
          <SourceTabView
            sources={sources}
            articles={articles}
            activeSourceId={tabSourceId}
            onSelectSource={(id) => {
              setTabSourceId(id);
              setSelectedSource(id);
            }}
            onLike={handleLike}
            onOpenComments={handleOpenComments}
            onOpenPreview={handleOpenPreview}
          />
        ) : currentView === 'sources' ? (
          /* 美國十大媒體檔案目錄頁 */
          <SourcesDirectory
            sources={sources}
            articleCountsBySource={articleCountsBySource}
            onSelectSource={(id) => handleSelectSource(id, true)}
          />
        ) : currentView === 'river' ? (
          /* 即時新聞河（倒序新聞流） */
          <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-stone-700" />
                <h2 className="text-sm font-semibold text-stone-900">
                  即時新聞河流 ({filteredArticles.length} 則報導)
                </h2>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                倒序即時發布流 · 標題與摘要附繁體中文翻譯
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {filteredArticles.length === 0 ? (
                <div className="py-16 text-center text-xs text-stone-400">
                  沒有符合目前篩選條件的新聞。
                </div>
              ) : (
                filteredArticles.map(item => (
                  <RiverItem
                    key={item.id}
                    item={item}
                    onLike={handleLike}
                    onOpenComments={handleOpenComments}
                    onOpenPreview={handleOpenPreview}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          /* Techmeme 雙欄叢集首頁 */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 左側 8 欄：焦點頭條群組與各報延伸報導 */}
              <div className="lg:col-span-8 space-y-6">
                {(selectedSource !== 'all' || searchQuery) && (
                  <div className="bg-stone-100 border border-stone-200 px-4 py-2 rounded-md flex items-center justify-between text-xs text-stone-700">
                    <span>
                      目前顯示 {filteredArticles.length} 則報導
                      {selectedSource !== 'all' && (
                        <> 來源：<strong className="text-stone-900">{sources.find(s => s.id === selectedSource)?.name}</strong></>
                      )}
                      {searchQuery && <> 符合關鍵字 "{searchQuery}"</>}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSource('all');
                        setSearchQuery('');
                      }}
                      className="font-medium text-stone-900 hover:underline cursor-pointer"
                    >
                      清除篩選
                    </button>
                  </div>
                )}

                {/* 頭條群組 */}
                <section aria-label="焦點頭條群組">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-stone-900 mb-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">
                      焦點頭條群組與各報延伸報導
                    </h2>
                    <span className="text-xs text-stone-500 font-mono">
                      TechPulse 智慧分群指數
                    </span>
                  </div>

                  {leadStories.length === 0 ? (
                    <div className="p-8 text-center bg-white border border-stone-200 rounded-lg text-xs text-stone-500">
                      未找到符合條件的焦點報導。
                    </div>
                  ) : (
                    leadStories.map((item, idx) => (
                      <StoryCard
                        key={item.id}
                        item={item}
                        isLead={idx === 0}
                        onLike={handleLike}
                        onOpenComments={handleOpenComments}
                        onOpenPreview={handleOpenPreview}
                        onFilterSource={(id) => handleSelectSource(id, true)}
                      />
                    ))
                  )}
                </section>

                {/* 更多全美重磅報導 */}
                {restStories.length > 0 && (
                  <section aria-label="更多全美重磅速報" className="pt-6">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-300 mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                        全美更多科技重磅速報
                      </h3>
                      <span className="text-xs text-stone-400 font-mono">
                        共 {restStories.length} 篇報導
                      </span>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-lg px-4 sm:px-5 divide-y divide-stone-100 shadow-xs">
                      {restStories.map(item => (
                        <StoryCard
                          key={item.id}
                          item={item}
                          isLead={false}
                          onLike={handleLike}
                          onOpenComments={handleOpenComments}
                          onOpenPreview={handleOpenPreview}
                          onFilterSource={(id) => handleSelectSource(id, true)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* 右側 4 欄：即時快訊河流與熱門榜單 */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="p-3.5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-stone-700" />
                      <span>即時快訊河流</span>
                    </span>
                    <button
                      onClick={() => setCurrentView('river')}
                      className="text-[11px] text-blue-700 hover:underline font-medium cursor-pointer"
                    >
                      查看全部 →
                    </button>
                  </div>
                  <div className="divide-y divide-stone-100 max-h-[580px] overflow-y-auto">
                    {articles.slice(0, 8).map(item => (
                      <RiverItem
                        key={`river-${item.id}`}
                        item={item}
                        onLike={handleLike}
                        onOpenComments={handleOpenComments}
                        onOpenPreview={handleOpenPreview}
                      />
                    ))}
                  </div>
                </div>

                <TechPulseSidebar
                  sources={sources}
                  articles={articles}
                  articleCountsBySource={articleCountsBySource}
                  onSelectSource={(id) => handleSelectSource(id, true)}
                  onOpenPreview={handleOpenPreview}
                  onOpenComments={handleOpenComments}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 留言討論抽屜 */}
      <CommentDrawer
        newsItem={activeCommentItem}
        isOpen={Boolean(activeCommentItem)}
        onClose={() => setActiveCommentItem(null)}
        onLike={handleLike}
        onCommentAdded={handleCommentAdded}
      />

      {/* 深度閱讀與討論視窗 */}
      <ArticleModal
        item={activePreviewItem}
        isOpen={Boolean(activePreviewItem)}
        onClose={() => setActivePreviewItem(null)}
        onLike={handleLike}
        onCommentAdded={handleCommentAdded}
      />

      {/* 頁尾與完整法律合規 / 合理使用免責聲明 */}
      <footer className="mt-16 border-t border-stone-200 bg-white py-10 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-stone-900 text-sm tracking-tight">TECH<span className="text-blue-700">PULSE</span></span>
              <span className="font-serif font-bold text-stone-900 text-sm">科技脈動</span>
              <span aria-hidden="true">·</span>
              <span>全美十大科技媒體 RSS 即時聚合與中英對照讀者社群</span>
            </div>
            <div className="flex items-center gap-4 text-stone-600">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloudflare Ready
              </span>
              <button
                onClick={() => {
                  setSelectedSource('all');
                  setSelectedCategory('All');
                  setCurrentView('tabs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-stone-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>回到頂部</span>
              </button>
            </div>
          </div>

          {/* 法律與著作權合規聲明區塊 */}
          <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 space-y-2 leading-relaxed">
            <div className="font-semibold text-stone-800 flex items-center gap-1.5">
              <span>⚖️ 法律合規、合理使用（Fair Use）與智慧財產權宣告</span>
            </div>
            <p>
              1. <strong>資訊來源與著作權屬</strong>：TechPulse（科技脈動）為開放式科技新聞聚合瀏覽器。本站所引述之所有新聞標題、官方 RSS 摘要、作者署名及原文縮圖，其著作權與商標權均分別歸屬各原創出版媒體（TechCrunch、The Verge、WIRED、Ars Technica、Engadget、9to5Mac、VentureBeat、ZDNET、MIT Technology Review、Gizmodo）及其所屬機構所有。
            </p>
            <p>
              2. <strong>合理使用與公益導讀</strong>：本站依據著作權法之合理使用（Fair Use）原則，僅對公開之 RSS Feed 進行摘錄導讀與繁體中文教學對照，每則新聞均附帶明確的原文出處來源與直達原始網站之超連結（Canonical Link），本站不存儲亦不複製全文內容。
            </p>
            <p>
              3. <strong>商標無涉宣告</strong>：本站為獨立原創平台，與各新聞媒體無任何商業附屬或代理關係。所有媒體標誌與名稱僅用於客觀辨識報導出處之引用。
            </p>
            <p>
              4. <strong>權利人聯絡與下架處理</strong>：若任何版權所有方或內容出版者對內容之索引呈現有疑慮，或希望移除特定文章之摘要索引，請隨時通知，我們將於第一時間積極配合下架或調整顯示設定。
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
            <p>
              合規架構：純靜態 Vite + Cloudflare Pages Functions 雙模式支援，無伺服器邊緣快取與安全通訊。
            </p>
            <p>
              © {new Date().getFullYear()} TechPulse 科技脈動. 保留原創平台架構權利。各報導版權歸原出版機構所有。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
