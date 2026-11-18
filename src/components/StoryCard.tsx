import React, { useState } from 'react';
import { NewsItem } from '../types/news';
import { Heart, MessageSquare, ExternalLink, Share2, Check, ArrowUpRight } from 'lucide-react';

interface StoryCardProps {
  item: NewsItem;
  isLead?: boolean;
  onLike: (id: string, willLike: boolean) => void;
  onOpenComments: (item: NewsItem) => void;
  onOpenPreview: (item: NewsItem) => void;
  onFilterSource?: (sourceId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  item,
  isLead = false,
  onLike,
  onOpenComments,
  onOpenPreview,
  onFilterSource
}) => {
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiking(true);
    onLike(item.id, !item.isLiked);
    setTimeout(() => setIsLiking(false), 300);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(item.link || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`border-b border-stone-200/90 py-5 transition-colors group ${
        isLead ? 'bg-[#faf8f4]/60 p-4 sm:p-5 rounded-lg border border-stone-200 shadow-xs my-3' : 'hover:bg-stone-50/50'
      }`}
    >
      {/* 媒體發佈資訊與分類 */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 mb-2">
        <button
          onClick={() => onFilterSource?.(item.sourceId)}
          className="font-semibold text-stone-800 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block bg-stone-700" />
          <span>{item.sourceName}</span>
        </button>
        {item.author && (
          <>
            <span aria-hidden="true">·</span>
            <span>記者 {item.author}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span className="font-mono tabular-nums">{item.timeAgo}</span>
        <span aria-hidden="true">·</span>
        <span className="text-stone-500 font-medium">{item.category}</span>
        {isLead && (
          <>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-medium">焦點頭條</span>
          </>
        )}
      </div>

      {/* 主標題與摘要（左側圖文排版 + 右側新聞預覽圖） */}
      <div className="flex flex-col-reverse sm:flex-row items-start justify-between gap-4 mt-1">
        <div className="flex-1 min-w-0">
          {/* 標題與中文翻譯（放置在英文標題正下方） */}
          <div className="group/title cursor-pointer" onClick={() => onOpenPreview(item)}>
            <h2
              className={`font-serif tracking-tight text-stone-900 group-hover/title:text-blue-800 transition-colors leading-snug ${
                isLead ? 'text-xl sm:text-2xl font-bold' : 'text-base sm:text-lg font-semibold'
              }`}
            >
              <span className="hover:underline">{item.title}</span>
            </h2>
            {item.titleZh && (
              <p
                className={`font-sans text-stone-800 font-semibold mt-1 leading-snug ${
                  isLead ? 'text-base sm:text-lg text-blue-950' : 'text-sm sm:text-base text-stone-800'
                }`}
              >
                <span className="hover:underline">{item.titleZh}</span>
              </p>
            )}
          </div>

          {/* 摘要與中文摘要翻譯（放置在英文摘要正下方） */}
          {item.summary && (
            <div className="mt-2.5 space-y-1.5 max-w-4xl text-xs sm:text-sm leading-relaxed">
              <p className="text-stone-600 font-sans">
                {item.summary}
              </p>
              {item.summaryZh && (
                <p className="text-stone-800 bg-[#f4f2ec]/80 p-2.5 rounded border border-stone-200/70 leading-relaxed font-sans">
                  <span className="font-semibold text-stone-900 mr-1.5 text-[11px] bg-stone-200/80 px-1.5 py-0.5 rounded">
                    中文摘要
                  </span>
                  {item.summaryZh}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 新聞預覽圖 */}
        {item.imageUrl && (
          <div
            onClick={() => onOpenPreview(item)}
            className="w-full sm:w-44 md:w-52 aspect-[16/10] sm:aspect-[4/3] rounded-lg overflow-hidden shrink-0 border border-stone-200/80 bg-stone-100 shadow-xs cursor-pointer group-hover:opacity-95 transition-all self-stretch sm:self-start"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                // If external image fails to load, gracefully fallback to inline editorial SVG
                (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 200 140"><rect width="200" height="140" fill="%231e293b"/><text x="100" y="70" text-anchor="middle" fill="%2338bdf8" font-size="12" font-family="sans-serif" font-weight="bold">${encodeURIComponent(item.sourceName)}</text><text x="100" y="90" text-anchor="middle" fill="%2394a3b8" font-size="10" font-family="sans-serif">TECH DISPATCH</text></svg>`;
              }}
            />
          </div>
        )}
      </div>

      {/* 智慧延伸報導叢集 */}
      {item.relatedStories && item.relatedStories.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-stone-200/70 text-xs bg-stone-50/80 p-2.5 rounded-md">
          <div className="font-sans font-medium text-stone-700 mb-1.5 flex items-center gap-1">
            <span className="text-stone-500 font-semibold">各報延伸報導視角：</span>
          </div>
          <ul className="space-y-2 pl-2 border-l border-stone-300">
            {item.relatedStories.map((rel, idx) => (
              <li key={idx} className="flex flex-col gap-0.5 text-stone-700">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-semibold text-stone-900 shrink-0">{rel.sourceName}:</span>
                  <a
                    href={rel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-700 hover:underline line-clamp-1 inline-flex items-center gap-0.5 font-medium"
                  >
                    <span>{rel.title}</span>
                    <ArrowUpRight className="w-3 h-3 text-stone-400 shrink-0 inline" />
                  </a>
                  <span className="text-stone-400 text-[11px] font-mono shrink-0 ml-auto hidden sm:inline">
                    {rel.timeAgo}
                  </span>
                </div>
                {rel.titleZh && (
                  <p className="text-[11px] text-stone-600 pl-1">
                    ↳ {rel.titleZh}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 社群熱議 */}
      {item.discussions && item.discussions.length > 0 && (
        <div className="mt-2 text-xs flex flex-wrap items-center gap-2 text-stone-600">
          <span className="text-stone-500 font-medium">社群討論：</span>
          {item.discussions.map((disc, idx) => (
            <a
              key={idx}
              href={disc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-stone-700 hover:text-blue-700 hover:underline bg-white px-2 py-0.5 rounded border border-stone-200 text-[11px]"
            >
              <span className="font-medium">{disc.platform}</span>
              {disc.commentsCount && (
                <span className="text-stone-400 font-mono">({disc.commentsCount} 則討論)</span>
              )}
              {disc.handle && (
                <span className="text-stone-400">{disc.handle}</span>
              )}
            </a>
          ))}
        </div>
      )}

      {/* 互動操作工具列：按讚、留言、速覽、分享、原文 */}
      <div className="flex items-center justify-between mt-3.5 pt-2 text-xs text-stone-600">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 按讚按鈕 */}
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-stone-100 transition-colors cursor-pointer group/like ${
              item.isLiked ? 'text-rose-600 font-semibold bg-rose-50/60' : 'text-stone-600'
            }`}
            title={item.isLiked ? '取消按讚' : '為新聞按讚'}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                item.isLiked ? 'fill-rose-600 text-rose-600 scale-110' : 'text-stone-500 group-hover/like:text-rose-500'
              } ${isLiking ? 'scale-125' : ''}`}
            />
            <span className="font-mono tabular-nums">{item.likesCount}</span>
            <span>{item.isLiked ? '已按讚' : '按讚'}</span>
          </button>

          {/* 留言按鈕 */}
          <button
            onClick={() => onOpenComments(item)}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-stone-100 transition-colors text-stone-600 hover:text-blue-700 cursor-pointer"
            title="查看或發表評論"
          >
            <MessageSquare className="w-4 h-4 text-stone-500" />
            <span className="font-mono tabular-nums">{item.commentsCount}</span>
            <span>則留言</span>
          </button>

          {/* 閱讀速覽 */}
          <button
            onClick={() => onOpenPreview(item)}
            className="flex items-center gap-1 py-1 px-2 rounded hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <span>速覽與討論</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* 分享連結 */}
          <button
            onClick={handleShareClick}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors cursor-pointer"
            title="複製新聞連結"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* 原文連結 */}
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-stone-500 hover:text-stone-900 text-xs py-1 px-2 rounded hover:bg-stone-100 transition-colors"
            title={`前往 ${item.sourceName} 閱讀原文`}
          >
            <span>{item.sourceName}</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      </div>
    </article>
  );
};
