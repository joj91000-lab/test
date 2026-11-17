import React, { useState, useEffect } from 'react';
import { NewsItem, NewsComment } from '../types/news';
import { fetchCommentsForNews, postComment } from '../services/newsService';
import { X, ExternalLink, Heart, MessageSquare, ThumbsUp, Send, Share2, Check, ArrowUpRight } from 'lucide-react';

interface ArticleModalProps {
  item: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string, willLike: boolean) => void;
  onCommentAdded?: (newsId: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  item,
  isOpen,
  onClose,
  onLike,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('techpulse_author_name') || localStorage.getItem('techmeme_author_name') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setLoadingComments(true);
      fetchCommentsForNews(item.id)
        .then(res => {
          setComments(res);
          setLoadingComments(false);
        })
        .catch(() => setLoadingComments(false));
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const author = authorName.trim() || '熱心科技讀者';
    localStorage.setItem('techpulse_author_name', author);

    try {
      const added = await postComment(item.id, author, newComment);
      setComments(prev => [added, ...prev]);
      setNewComment('');
      onCommentAdded?.(item.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = (id: string) => {
    setComments(prev =>
      prev.map(c => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c))
    );
    fetch(`/api/comments/${id}/upvote`, { method: 'POST' }).catch(() => {});
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(item.link || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden border border-stone-200 my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* 頂部資訊欄 */}
        <div className="px-6 py-4 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">{item.sourceName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{item.timeAgo}</span>
            <span aria-hidden="true">·</span>
            <span className="text-stone-500 font-medium">{item.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 rounded transition-colors cursor-pointer"
              title="複製連結"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/50 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 報導內容主體 */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* 原文標題 */}
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            {item.title}
          </h1>

          {/* 中文標題翻譯（放在標題下方） */}
          {item.titleZh && (
            <h2 className="font-sans text-lg sm:text-xl font-bold text-blue-950 mt-2 leading-snug">
              {item.titleZh}
            </h2>
          )}

          {item.author && (
            <p className="text-xs text-stone-500 mt-2.5 font-medium">
              由 {item.sourceName} 記者 {item.author} 撰稿發布
            </p>
          )}

          {/* 焦點大預覽圖 */}
          {item.imageUrl && (
            <div className="mt-4 w-full aspect-[16/9] max-h-72 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 225"><rect width="400" height="225" fill="%231e293b"/><text x="200" y="115" text-anchor="middle" fill="%2338bdf8" font-size="16" font-family="sans-serif" font-weight="bold">${encodeURIComponent(item.sourceName)}</text></svg>`;
                }}
              />
            </div>
          )}

          {/* 摘要與中文摘要翻譯 */}
          <div className="mt-6 text-stone-800 text-sm sm:text-base leading-relaxed space-y-4">
            <div className="border-b border-stone-100 pb-4 space-y-2">
              <p className="font-serif text-base text-stone-700 leading-relaxed">
                {item.summary}
              </p>
              {item.summaryZh && (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-stone-900 text-sm leading-relaxed">
                  <span className="font-bold text-xs bg-stone-200 px-1.5 py-0.5 rounded mr-1.5">中文摘要</span>
                  {item.summaryZh}
                </div>
              )}
            </div>

            {item.contentSnippet && (
              <p className="text-stone-700 leading-relaxed text-sm">
                {item.contentSnippet}
              </p>
            )}
          </div>

          {/* 互動操作列 */}
          <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onLike(item.id, !item.isLiked)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer ${
                  item.isLiked
                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span className="font-mono tabular-nums">{item.likesCount}</span>
                <span>個讚</span>
              </button>

              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-stone-400" />
                <span className="font-mono tabular-nums">{comments.length}</span>
                <span>則討論</span>
              </span>
            </div>

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors shadow-xs"
            >
              <span>前往 {item.sourceName} 閱讀完整報導</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* 延伸報導 */}
          {item.relatedStories && item.relatedStories.length > 0 && (
            <div className="mt-8 p-4 bg-stone-50 rounded-lg border border-stone-200/80">
              <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
                各報延伸視角與追蹤報導
              </h3>
              <ul className="space-y-2 text-xs">
                {item.relatedStories.map((rel, idx) => (
                  <li key={idx} className="flex flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-stone-900 shrink-0">{rel.sourceName}:</span>
                        <a
                          href={rel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-700 hover:text-blue-700 hover:underline line-clamp-1 inline-flex items-center gap-0.5 font-medium"
                        >
                          <span>{rel.title}</span>
                          <ArrowUpRight className="w-3 h-3 text-stone-400 shrink-0 inline" />
                        </a>
                      </div>
                      <span className="text-stone-400 font-mono tabular-nums text-[11px] shrink-0">
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

          {/* 內嵌留言討論區 */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
              <span>讀者觀點深度交流</span>
              <span className="text-xs font-mono font-normal text-stone-500">({comments.length} 則)</span>
            </h3>

            {/* 發表留言表單 */}
            <form onSubmit={handlePostComment} className="mb-6 p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="您的暱稱或職稱（例如：工程師、投資人、科技愛好者）"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>
              <textarea
                rows={2}
                placeholder="針對此新聞發表您的洞察與評論…"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded p-2.5 focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-md transition-colors cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? '送出中…' : '發表評論'}</span>
                </button>
              </div>
            </form>

            {/* 留言清單 */}
            {loadingComments ? (
              <p className="text-xs text-stone-400 py-4 text-center">載入討論內容中…</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">目前尚無評論，歡迎在上方留下您的第一手觀點！</p>
            ) : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="p-3 bg-white rounded border border-stone-100 hover:border-stone-200 transition-colors">
                    <div className="flex items-center justify-between gap-2 text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: c.avatarBg || '#0284c7' }}
                        >
                          {c.author.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-semibold text-stone-900">{c.author}</span>
                        <span className="text-stone-400 font-mono text-[11px]">{c.createdAt}</span>
                      </div>
                      <button
                        onClick={() => handleUpvote(c.id)}
                        className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded border border-stone-200 cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3 text-stone-400" />
                        <span className="font-mono tabular-nums">{c.upvotes}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 pl-7">{c.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
