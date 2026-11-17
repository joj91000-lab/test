import { NewsItem, NewsComment, NewsSource } from '../types/news';
import { SEED_NEWS, INITIAL_COMMENTS } from '../data/seedNews';
import { TOP_10_SOURCES } from '../data/sources';
import { translateTitle, translateSummary, getEditorialPreviewImage } from '../utils/translator';

const LIKES_STORAGE_KEY = 'techpulse_liked_ids';
const USER_COMMENTS_STORAGE_KEY = 'techpulse_user_comments';
const USER_ID_STORAGE_KEY = 'techpulse_user_id';

function getUserId(): string {
  let uid = localStorage.getItem(USER_ID_STORAGE_KEY) || localStorage.getItem('techmeme_user_id');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(USER_ID_STORAGE_KEY, uid);
  }
  return uid;
}

function getStoredLikes(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY) || localStorage.getItem('techmeme_liked_ids');
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {
    console.error('Error parsing stored likes', e);
  }
  return new Set();
}

function saveStoredLikes(likes: Set<string>) {
  localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(likes)));
}

function getStoredComments(): NewsComment[] {
  try {
    const raw = localStorage.getItem(USER_COMMENTS_STORAGE_KEY) || localStorage.getItem('techmeme_user_comments');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error parsing stored comments', e);
  }
  return [];
}

function saveStoredComments(comments: NewsComment[]) {
  localStorage.setItem(USER_COMMENTS_STORAGE_KEY, JSON.stringify(comments));
}

export async function fetchNewsArticles(forceRefresh = false): Promise<NewsItem[]> {
  const userLikes = getStoredLikes();
  const localComments = getStoredComments();

  const enrichWithZh = (item: any): NewsItem => {
    const itemLocalComments = localComments.filter(c => c.newsId === item.id);
    const isLiked = userLikes.has(item.id);
    const titleZh = item.titleZh || translateTitle(item.title);
    const summaryZh = item.summaryZh || translateSummary(item.summary);
    const imageUrl = item.imageUrl || getEditorialPreviewImage(item.category || 'General', item.title, item.sourceName);
    const relatedStories = item.relatedStories?.map((r: any) => ({
      ...r,
      titleZh: r.titleZh || translateTitle(r.title)
    }));
    const timestamp = typeof item.timestamp === 'number' && item.timestamp > 0
      ? item.timestamp
      : (item.pubDate || item.publishedAt ? Date.parse(item.pubDate || item.publishedAt) : Date.now());
    const pubDate = item.pubDate || item.publishedAt || new Date(timestamp).toUTCString();
    const timeAgo = item.timeAgo || item.relativeTime || '';

    return {
      ...item,
      titleZh,
      summaryZh,
      imageUrl,
      relatedStories,
      pubDate,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
      timeAgo,
      isLiked,
      commentsCount: (item.commentsCount || 0) + itemLocalComments.length
    };
  };

  try {
    const res = await fetch(`/api/news${forceRefresh ? '?refresh=true' : ''}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        let combined = [...json.data];
        if (combined.length < 5) {
          combined = [...combined, ...SEED_NEWS.filter(s => !combined.some(c => c.title === s.title))];
        }

        return combined.map(enrichWithZh);
      }
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to seed news:', err);
  }

  // Fallback to rich curated SEED_NEWS with Chinese translations
  return SEED_NEWS.map(enrichWithZh);
}

export async function fetchSources(): Promise<NewsSource[]> {
  try {
    const res = await fetch('/api/sources');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Could not fetch sources from API, using default list:', err);
  }
  return TOP_10_SOURCES;
}

function commentDedupeKey(c: NewsComment): string {
  return `${c.newsId}|${c.author.trim().toLowerCase()}|${c.content.trim()}`;
}

function mergeComments(...groups: NewsComment[][]): NewsComment[] {
  const byId = new Map<string, NewsComment>();
  const byContent = new Map<string, string>();

  for (const group of groups) {
    for (const comment of group) {
      const contentKey = commentDedupeKey(comment);
      const existingId = byContent.get(contentKey);
      if (existingId && existingId !== comment.id) {
        // Prefer non-temp server ids over c_local_* duplicates
        if (comment.id.startsWith('c_local_') && !existingId.startsWith('c_local_')) {
          continue;
        }
        byId.delete(existingId);
      }
      byId.set(comment.id, comment);
      byContent.set(contentKey, comment.id);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.timestamp - a.timestamp);
}

export async function fetchCommentsForNews(newsId: string): Promise<NewsComment[]> {
  const localStored = getStoredComments().filter(c => c.newsId === newsId);
  const initial = INITIAL_COMMENTS.filter(c => c.newsId === newsId);

  try {
    const res = await fetch(`/api/comments?newsId=${encodeURIComponent(newsId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return mergeComments(json.data, localStored);
      }
    }
  } catch (err) {
    console.warn('Could not fetch comments from API:', err);
  }

  return mergeComments(initial, localStored);
}

export async function postComment(newsId: string, author: string, content: string): Promise<NewsComment> {
  const localList = getStoredComments();
  const colors = ['#0284c7', '#7c3aed', '#059669', '#d97706', '#e11d48', '#2563eb'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const tempComment: NewsComment = {
    id: `c_local_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    newsId,
    author: author.trim() || 'Tech Reader',
    avatarBg: randomColor,
    content: content.trim(),
    createdAt: 'Just now',
    timestamp: Date.now(),
    upvotes: 1
  };

  localList.unshift(tempComment);
  saveStoredComments(localList);

  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, author, content })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const withoutTemp = localList.filter(c => c.id !== tempComment.id);
        withoutTemp.unshift(json.data);
        saveStoredComments(withoutTemp);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API post comment failed, saved locally:', err);
  }

  return tempComment;
}

export async function toggleLikeNews(newsId: string, willBeLiked: boolean): Promise<{ likesCountChange: number; isLiked: boolean }> {
  const likes = getStoredLikes();
  if (willBeLiked) {
    likes.add(newsId);
  } else {
    likes.delete(newsId);
  }
  saveStoredLikes(likes);

  const uid = getUserId();
  try {
    fetch('/api/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsId, userId: uid, liked: willBeLiked })
    }).catch(e => console.warn('Background like sync warning', e));
  } catch (err) {
    // ignore
  }

  return {
    likesCountChange: willBeLiked ? 1 : -1,
    isLiked: willBeLiked
  };
}
