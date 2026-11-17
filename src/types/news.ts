export interface NewsSource {
  id: string;
  name: string;
  nameZh: string;
  domain: string;
  color: string;
  accentBg: string;
  category: string;
  categoryZh: string;
  feedUrl: string;
  description: string;
  descriptionZh: string;
  articleCount?: number;
}

export interface NewsComment {
  id: string;
  newsId: string;
  author: string;
  avatarBg: string;
  content: string;
  createdAt: string;
  timestamp: number;
  upvotes: number;
}

export interface RelatedCoverage {
  title: string;
  titleZh?: string;
  link: string;
  sourceName: string;
  sourceDomain: string;
  timeAgo: string;
}

export interface NewsDiscussion {
  platform: 'HackerNews' | 'X/Twitter' | 'Reddit' | 'Substack';
  author: string;
  handle?: string;
  snippet: string;
  snippetZh?: string;
  url: string;
  commentsCount?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  titleZh?: string;
  link: string;
  sourceId: string;
  sourceName: string;
  sourceDomain: string;
  pubDate: string;
  timestamp: number;
  timeAgo: string;
  summary: string;
  summaryZh?: string;
  contentSnippet?: string;
  contentSnippetZh?: string;
  imageUrl?: string;
  category: 'AI' | 'Mobile' | 'Big Tech' | 'Hardware' | 'Policy' | 'Startups' | 'Cybersecurity' | 'General';
  author?: string;
  likesCount: number;
  isLiked?: boolean;
  commentsCount: number;
  isLeadStory?: boolean;
  relatedStories?: RelatedCoverage[];
  discussions?: NewsDiscussion[];
}

export type ViewMode = 'tabs' | 'frontpage' | 'river' | 'sources';
export type CategoryFilter = 'All' | 'AI' | 'Mobile' | 'Big Tech' | 'Hardware' | 'Policy' | 'Startups' | 'Cybersecurity';
export type SortOption = 'salience' | 'latest' | 'most-liked' | 'most-discussed';
