import React, { useState, useEffect } from 'react';
import { NewsItem, NewsComment } from '../types/news';
import { fetchCommentsForNews, postComment } from '../services/newsService';
import { X, Send, Heart, MessageSquare, ThumbsUp, ExternalLink, User } from 'lucide-react';

interface CommentDrawerProps {
  newsItem: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string, willLike: boolean) => void;
  onCommentAdded?: (newsId: string) => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  newsItem,
  isOpen,
  onClose,
  onLike,
  onCommentAdded
}) => {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [authorName, setAuthorName] = useState(() => localStorage.getItem('techpulse_author_name') || localStorage.getItem('techmeme_author_name') || '');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (newsItem && isOpen) {
      setLoading(true);
      fetchCommentsForNews(newsItem.id)
        .then(data => {
          setComments(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [newsItem, isOpen]);

  if (!isOpen || !newsItem) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const finalAuthor = authorName.trim() || '熱心科技讀者';
    localStorage.setItem('techpulse_author_name', finalAuthor);

    try {
      const newComment = await postComment(newsItem.id, finalAuthor, content);
      setComments(prev => [newComment, ...prev]);
      setContent('');
      onCommentAdded?.(newsItem.id);
    } catch (err) {
      console.error('Failed to post comment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = (commentId: string) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          return { ...c, upvotes: c.upvotes + 1 };
        }
        return c;
      })
    );

    fetch(`/api/comments/${commentId}/upvote`, { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-200 ease-out"
        onClick={e => e.stopPropagation()}
      >
        {/* 抽屜頂部標題與資訊 */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#fdfbf7] flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
              <span className="font-semibold text-stone-900">{newsItem.sourceName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{newsItem.timeAgo}</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500 font-medium">{newsItem.category}</span>
            </div>
            {/* 英文原標題 */}
            <h2 className="font-serif text-base font-bold text-stone-900 leading-snug line-clamp-2">
              {newsItem.title}
            </h2>
            {/* 中文標題翻譯（置於標題正下方） */}
            {newsItem.titleZh && (
              <p className="font-sans text-xs sm:text-sm font-semibold text-blue-950 mt-1 leading-snug line-clamp-2">
                {newsItem.titleZh}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs">
              <a
                href={newsItem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
              >
                <span>閱讀完整原文</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <button
                onClick={() => onLike(newsItem.id, !newsItem.isLiked)}
                className={`inline-flex items-center gap-1 font-medium cursor-pointer ${
                  newsItem.isLiked ? 'text-rose-600' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${newsItem.isLiked ? 'fill-rose-600' : ''}`} />
                <span className="font-mono tabular-nums">{newsItem.likesCount}</span>
                <span>個讚</span>
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 留言清單 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-stone-100">
          <div className="flex items-center justify-between pb-3 text-xs font-medium text-stone-600">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-stone-400" />
              <span>社群觀點討論 ({comments.length})</span>
            </span>
            <span className="text-stone-400">即時交流思考</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              正在載入留言…
            </div>
          ) : comments.length === 0 ? (
            <div className="py-16 text-center">
              <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-stone-700">目前尚無留言</p>
              <p className="text-xs text-stone-400 mt-1">
                成為第一位針對此重大科技新聞留下觀點的讀者！
              </p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} className="py-4 first:pt-2">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                      style={{ backgroundColor: c.avatarBg || '#0284c7' }}
                    >
                      {c.author.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-stone-900">{c.author}</span>
                    <span aria-hidden="true" className="text-stone-300 text-xs">·</span>
                    <span className="text-[11px] text-stone-400 font-mono tabular-nums">{c.createdAt}</span>
                  </div>
                  <button
                    onClick={() => handleUpvote(c.id)}
                    className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded border border-stone-200 transition-colors cursor-pointer"
                    title="推文同感"
                  >
                    <ThumbsUp className="w-3 h-3 text-stone-400 hover:text-stone-800" />
                    <span className="font-mono tabular-nums">{c.upvotes}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed pl-8">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 發表留言輸入框 */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 bg-stone-50/70">
          <div className="mb-2 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="您的暱稱或身份（例如：Alex、前端工程師、科技投資人）"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              className="text-xs bg-white border border-stone-200 rounded px-2.5 py-1 text-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-900 flex-1 placeholder:text-stone-400"
            />
          </div>
          <div className="relative">
            <textarea
              rows={3}
              placeholder="針對這篇科技報導分享您的分析、業界內幕或觀點…"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full text-xs sm:text-sm bg-white border border-stone-200 rounded-md p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 placeholder:text-stone-400 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-stone-400">
                參與理性、深度的科技新聞思辨
              </span>
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-md transition-colors shadow-xs cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmitting ? '送出中…' : '發表留言'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
