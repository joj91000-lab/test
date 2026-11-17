import React from 'react';
import { NewsItem, NewsSource } from '../types/news';
import { Flame, MessageSquare } from 'lucide-react';

interface TechmemeSidebarProps {
  sources: NewsSource[];
  articles: NewsItem[];
  articleCountsBySource: Record<string, number>;
  onSelectSource: (sourceId: string) => void;
  onOpenPreview: (item: NewsItem) => void;
  onOpenComments: (item: NewsItem) => void;
}

export const TechmemeSidebar: React.FC<TechmemeSidebarProps> = ({
  sources,
  articles,
  articleCountsBySource,
  onSelectSource,
  onOpenPreview,
  onOpenComments
}) => {
  // 找出互動度最高的 5 則焦點新聞
  const trendingStories = [...articles]
    .sort((a, b) => (b.likesCount + b.commentsCount * 2) - (a.likesCount + a.commentsCount * 2))
    .slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* 熱門討論排行榜 */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2.5 mb-3">
          <Flame className="w-4 h-4 text-amber-600" />
          <span>熱門科技討論排行榜</span>
        </div>
        <ul className="space-y-3.5">
          {trendingStories.map((story, idx) => (
            <li key={story.id} className="text-xs group">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-stone-400 text-[11px] font-semibold w-4 shrink-0">
                  0{idx + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <h4
                    onClick={() => onOpenPreview(story)}
                    className="font-serif font-medium text-stone-900 group-hover:text-blue-700 cursor-pointer line-clamp-1 leading-snug hover:underline"
                  >
                    {story.title}
                  </h4>
                  {story.titleZh && (
                    <p
                      onClick={() => onOpenPreview(story)}
                      className="text-xs text-stone-800 font-medium cursor-pointer hover:underline line-clamp-1 mt-0.5"
                    >
                      {story.titleZh}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                    <span className="font-semibold text-stone-800">{story.sourceName}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      onClick={() => onOpenComments(story)}
                      className="hover:text-blue-700 flex items-center gap-0.5 cursor-pointer text-stone-600"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>{story.commentsCount} 則留言</span>
                    </button>
                    <span aria-hidden="true">·</span>
                    <span>{story.likesCount} 個讚</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 十大美媒發稿即時榜 */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2.5 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">
            十大美媒即時發稿榜
          </span>
          <span className="text-[11px] font-mono text-stone-400">已連線</span>
        </div>
        <div className="space-y-1.5">
          {sources.map(source => {
            const count = articleCountsBySource[source.id] || 0;
            return (
              <button
                key={source.id}
                onClick={() => onSelectSource(source.id)}
                className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-stone-50 text-xs transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="font-medium text-stone-800 group-hover:text-blue-700 truncate">
                    {source.nameZh || source.name}
                  </span>
                </div>
                <span className="font-mono tabular-nums text-stone-500 group-hover:text-stone-900 text-[11px]">
                  {count} 則
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 關於 TechPulse 聚合模式與合規聲明 */}
      <div className="bg-[#fcfbf9] border border-stone-200 rounded-xl p-4 text-xs text-stone-600 shadow-xs space-y-2.5">
        <h4 className="font-serif font-bold text-stone-900 text-sm">
          關於 TechPulse 雙語情報
        </h4>
        <p className="leading-relaxed text-stone-600">
          本站採用智慧新聞叢集（Story Cluster）架構，專為全球華語創業者、工程師與決策者設計，提供中英雙語對照導讀，第一時間掌握前沿科技脈動。
        </p>
        <div className="p-2.5 bg-stone-100/70 rounded-lg text-[11px] text-stone-500 leading-normal border border-stone-200/60">
          <span className="font-semibold text-stone-700 block mb-0.5">⚖️ 合理使用與版權聲明</span>
          本平台僅索引公開 RSS 提供學術導讀與簡短摘要，所有文章標題、著作權均屬原媒體所有，均直接鏈接至原創發布頁面。
        </div>
        <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 font-mono">
          <span>全天候開源 RSS 聚合</span>
          <span>Cloudflare 邊緣就緒</span>
        </div>
      </div>
    </aside>
  );
};

export const TechPulseSidebar = TechmemeSidebar;
