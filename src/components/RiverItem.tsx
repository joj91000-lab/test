import React from 'react';
import { NewsItem } from '../types/news';
import { Heart, MessageSquare, ArrowUpRight } from 'lucide-react';

interface RiverItemProps {
  item: NewsItem;
  onLike: (id: string, willLike: boolean) => void;
  onOpenComments: (item: NewsItem) => void;
  onOpenPreview: (item: NewsItem) => void;
}

export const RiverItem: React.FC<RiverItemProps> = ({
  item,
  onLike,
  onOpenComments,
  onOpenPreview
}) => {
  return (
    <div className="py-3.5 px-3.5 hover:bg-stone-50 transition-colors border-b border-stone-200/70 group text-xs">
      <div className="flex items-start justify-between gap-3">
        {/* River Item Thumbnail */}
        {item.imageUrl && (
          <div
            onClick={() => onOpenPreview(item)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0 border border-stone-200 bg-stone-100 cursor-pointer group-hover:opacity-95 transition-all mt-0.5"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231e293b"/><text x="50" y="55" text-anchor="middle" fill="%2338bdf8" font-size="10" font-family="sans-serif">TECH</text></svg>`;
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* Metadata line */}
          <div className="flex items-center gap-1.5 text-stone-500 mb-1">
            <span className="font-semibold text-stone-800">{item.sourceName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-stone-400">{item.timeAgo}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-medium">{item.category}</span>
          </div>

          {/* 英文原標題 */}
          <h3
            onClick={() => onOpenPreview(item)}
            className="font-serif text-sm font-semibold text-stone-900 group-hover:text-blue-800 transition-colors leading-snug cursor-pointer hover:underline line-clamp-2"
          >
            {item.title}
          </h3>

          {/* 中文標題翻譯（位於標題正下方） */}
          {item.titleZh && (
            <p
              onClick={() => onOpenPreview(item)}
              className="text-xs text-stone-800 font-medium cursor-pointer hover:underline line-clamp-2 mt-0.5 leading-snug"
            >
              {item.titleZh}
            </p>
          )}

          {/* 摘要與中文摘要翻譯 */}
          {item.summary && (
            <div className="mt-1.5 space-y-1">
              <p className="text-stone-500 line-clamp-2 text-[11px] leading-relaxed">
                {item.summary}
              </p>
              {item.summaryZh && (
                <p className="text-stone-700 line-clamp-2 text-[11px] leading-relaxed bg-stone-100/80 px-2 py-1 rounded border border-stone-200/50">
                  <span className="font-semibold mr-1 text-[10px] bg-stone-200 px-1 py-0.2 rounded">中譯</span>
                  {item.summaryZh}
                </p>
              )}
            </div>
          )}

          {/* 延伸報導 */}
          {item.relatedStories && item.relatedStories.length > 0 && (
            <div className="mt-2 text-[11px] text-stone-500">
              <span className="font-medium text-stone-700">
                +{item.relatedStories.length} 家媒體延伸報導：
              </span>{' '}
              {item.relatedStories.map((r, i) => (
                <span key={i} className="text-stone-600">
                  {r.sourceName}{i < (item.relatedStories?.length ?? 1) - 1 ? '、' : ''}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 右側操作按鈕 */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(item.id, !item.isLiked);
            }}
            className={`flex items-center gap-1 p-1 rounded hover:bg-stone-100 transition-colors cursor-pointer ${
              item.isLiked ? 'text-rose-600 font-semibold' : 'text-stone-400 hover:text-stone-600'
            }`}
            title={item.isLiked ? '取消按讚' : '按讚'}
          >
            <Heart className={`w-3.5 h-3.5 ${item.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span className="font-mono text-[11px] tabular-nums">{item.likesCount}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments(item);
            }}
            className="flex items-center gap-1 p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-blue-700 transition-colors cursor-pointer"
            title="留言討論"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] tabular-nums">{item.commentsCount}</span>
          </button>

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-stone-400 hover:text-stone-800 transition-colors"
            title="前往原始報導"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
