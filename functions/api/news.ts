// Cloudflare Pages Function for /api/news
// Aligns payload shape with the Express server + UI (NewsItem).
// Traditional Chinese fields are filled server-side via Gemini (GEMINI_API_KEY secret).

import { enrichArticlesWithZh, type GeminiEnv } from '../utils/geminiTranslate';

const RSS_SOURCES = [
  { id: 'techcrunch', name: 'TechCrunch', domain: 'techcrunch.com', url: 'https://techcrunch.com/feed/' },
  { id: 'theverge', name: 'The Verge', domain: 'theverge.com', url: 'https://www.theverge.com/rss/index.xml' },
  { id: 'wired', name: 'WIRED', domain: 'wired.com', url: 'https://www.wired.com/feed/rss' },
  { id: 'arstechnica', name: 'Ars Technica', domain: 'arstechnica.com', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { id: 'engadget', name: 'Engadget', domain: 'engadget.com', url: 'https://www.engadget.com/rss.xml' },
  { id: '9to5mac', name: '9to5Mac', domain: '9to5mac.com', url: 'https://9to5mac.com/feed/' },
  { id: 'venturebeat', name: 'VentureBeat', domain: 'venturebeat.com', url: 'https://venturebeat.com/category/ai/feed/' },
  { id: 'zdnet', name: 'ZDNET', domain: 'zdnet.com', url: 'https://www.zdnet.com/news/rss.xml' },
  { id: 'mittech', name: 'MIT Tech Review', domain: 'technologyreview.com', url: 'https://www.technologyreview.com/feed/' },
  { id: 'gizmodo', name: 'Gizmodo', domain: 'gizmodo.com', url: 'https://gizmodo.com/feed' }
];

function cleanXml(text: string): string {
  if (!text) return '';
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' '
  };
  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
      if (entity[0] === '#') {
        const code = entity[1] === 'x' || entity[1] === 'X'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : match;
      }
      return named[entity] ?? match;
    })
    .trim();
}

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function stableId(sourceId: string, title: string, link: string): string {
  return `${sourceId}-${stableHash(`${sourceId}|${link || title}`).toString(36)}`;
}

function stableCount(id: string, min: number, range: number): number {
  return min + (stableHash(id) % range);
}

function formatRelativeTime(timestamp: number): string {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function categorizeArticle(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  if (text.match(/ai|artificial intelligence|llm|chatgpt|openai|anthropic|gemini|deepseek|claude|copilot|machine learning|gpu|h100|b200|reasoning/i)) {
    return 'AI';
  }
  if (text.match(/iphone|ipad|ios|android|pixel|galaxy|samsung|smartphone|mobile|app store|qualcomm|snapdragon/i)) {
    return 'Mobile';
  }
  if (text.match(/antitrust|doj|ftc|court|monopoly|regulation|eu act|congress|lawsuit|policy/i)) {
    return 'Policy';
  }
  if (text.match(/apple|google|microsoft|amazon|meta|alphabet|big tech/i) && text.match(/earnings|stock|ceo|product|platform/i)) {
    return 'Big Tech';
  }
  if (text.match(/chip|semiconductor|tsmc|nvidia|intel|amd|arm|processor|hardware|display|macbook|laptop|wearable|headset|quest|vision pro/i)) {
    return 'Hardware';
  }
  if (text.match(/startup|venture|funding|seed|series a|yc|y combinator|valuation|ipo|acquisition|founder/i)) {
    return 'Startups';
  }
  if (text.match(/security|hack|zero-day|vulnerability|ransomware|malware|cyber|breach|cve|patch/i)) {
    return 'Cybersecurity';
  }
  return 'General';
}

function parseItems(xmlText: string, source: (typeof RSS_SOURCES)[number]) {
  const items: any[] = [];
  const itemMatches = xmlText.match(/<(?:item|entry)[\s>][\s\S]*?<\/(?:item|entry)>/gi) || [];

  for (const [idx, itemXml] of itemMatches.slice(0, 10).entries()) {
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i) || itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = itemXml.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i);
    const dateMatch = itemXml.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);
    const authorMatch = itemXml.match(/<(?:dc:creator|author|name)[^>]*>([\s\S]*?)<\/(?:dc:creator|author|name)>/i);
    const imgMatch = itemXml.match(/<img[^>]+src=["'](https?:\/\/[^"'\s>]+)["']/i) ||
                     itemXml.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url=["'](https?:\/\/[^"'\s>]+)["']/i);

    const title = cleanXml(titleMatch ? titleMatch[1] : '');
    const link = linkMatch ? (linkMatch[1] || linkMatch[0]).replace(/<[^>]+>/g, '').trim() : `https://${source.domain}`;
    const summary = cleanXml(descMatch ? descMatch[1] : '').slice(0, 340);
    const imageUrl = imgMatch ? imgMatch[1] : undefined;
    const rawDate = dateMatch ? cleanXml(dateMatch[1]) : '';
    const timestamp = (rawDate && !Number.isNaN(Date.parse(rawDate)) ? Date.parse(rawDate) : NaN)
      || (Date.now() - idx * 14 * 60 * 1000);

    if (title && title.length > 5) {
      const id = stableId(source.id, title, link);
      items.push({
        id,
        title,
        link,
        summary: summary || title,
        sourceId: source.id,
        sourceName: source.name,
        sourceDomain: source.domain,
        author: cleanXml(authorMatch ? authorMatch[1] : '') || source.name,
        pubDate: new Date(timestamp).toUTCString(),
        timeAgo: formatRelativeTime(timestamp),
        timestamp,
        category: categorizeArticle(title, summary),
        likesCount: stableCount(id, 15, 40),
        commentsCount: stableCount(`${id}-c`, 0, 9),
        imageUrl
      });
    }
  }
  return items;
}

function clusterStories(allNews: any[]) {
  const sorted = [...allNews].sort((a, b) => b.timestamp - a.timestamp);
  const usedAsRelated = new Set<string>();
  const headMeta = new Map<string, { relatedStories: any[]; isLeadStory: boolean }>();

  const getKeywords = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'what', 'after', 'about', 'more', 'into', 'first', 'over', 'will', 'their', 'says'].includes(w));

  let leadCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const main = sorted[i];
    // Related coverage stays in the top-level feed for source tabs / river,
    // but should not become a second cluster head.
    if (usedAsRelated.has(main.id)) continue;

    const mainKeywords = new Set(getKeywords(main.title));
    const relatedStories: any[] = [];

    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      if (usedAsRelated.has(candidate.id) || candidate.sourceId === main.sourceId) continue;

      const candKeywords = getKeywords(candidate.title);
      let matchCount = 0;
      for (const kw of candKeywords) {
        if (mainKeywords.has(kw)) matchCount++;
      }

      if (
        matchCount >= 2 ||
        (candKeywords.some(k => ['openai', 'apple', 'nvidia', 'antitrust', 'tsmc', 'google', 'meta', 'microsoft', 'battery'].includes(k)) &&
          matchCount >= 1)
      ) {
        relatedStories.push({
          id: candidate.id,
          title: candidate.title,
          link: candidate.link,
          sourceName: candidate.sourceName,
          sourceDomain: candidate.sourceDomain,
          timeAgo: candidate.timeAgo
        });
        usedAsRelated.add(candidate.id);
        if (relatedStories.length >= 4) break;
      }
    }

    headMeta.set(main.id, {
      relatedStories,
      isLeadStory: leadCount < 3
    });
    leadCount += 1;
  }

  // Keep every article so source tabs / counts / river are complete.
  return sorted.map((article) => {
    const meta = headMeta.get(article.id);
    if (meta) {
      return {
        ...article,
        relatedStories: meta.relatedStories,
        isLeadStory: meta.isLeadStory,
        isClusteredRelated: false
      };
    }
    return {
      ...article,
      relatedStories: article.relatedStories || [],
      isLeadStory: false,
      isClusteredRelated: usedAsRelated.has(article.id)
    };
  });
}

const NEWS_TTL_MS = 180_000;
let newsCache: { at: number; body: string; etag: string } | null = null;
type NewsPayload = { body: string; etag: string; cacheable: boolean };
/** Coalesce concurrent cold misses inside one isolate so Gemini is not fan-out amplified. */
let newsInflight: Promise<NewsPayload> | null = null;
/** Cloudflare Workers Cache API (`caches.default`) is missing from DOM lib typings. */
const edgeCaches = caches as unknown as { default: Cache };

function newsHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    // Path-only CDN key: query strings are ignored by this handler.
    'Cache-Control': 'public, max-age=180, s-maxage=180',
    'CDN-Cache-Control': 'public, max-age=180',
    'Cloudflare-CDN-Cache-Control': 'public, max-age=180',
    ...extra
  };
}

/** Stable cache key that drops ?refresh= and other query params. */
function pathOnlyCacheRequest(request: Request): Request {
  const url = new URL(request.url);
  url.search = '';
  url.hash = '';
  return new Request(url.toString(), { method: 'GET' });
}

async function buildNewsPayload(env: GeminiEnv & { GEMINI_MODEL?: string }) {
  const fetchPromises = RSS_SOURCES.map(async (src) => {
    try {
      const resp = await fetch(src.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TechPulseBot/1.0; +https://techpulse.app)'
        }
      });
      if (resp.ok) {
        const text = await resp.text();
        return parseItems(text, src);
      }
    } catch {
      // Ignore per-source failures; other feeds may still succeed.
    }
    return [];
  });

  const results = await Promise.allSettled(fetchPromises);
  const allArticles: any[] = [];
  results.forEach(res => {
    if (res.status === 'fulfilled' && res.value.length > 0) {
      allArticles.push(...res.value);
    }
  });

  const clustered = clusterStories(allArticles);
  // Gemini runs only on the edge/server — API key never ships to the browser.
  const data = await enrichArticlesWithZh(env, clustered);
  // Never poison shared/isolate cache with empty RSS misses — let the next request retry.
  const cacheable = data.length >= 5;

  const body = JSON.stringify({
    success: true,
    data,
    total: data.length,
    translatedWithGemini: Boolean(env?.GEMINI_API_KEY),
    cached: false,
    timestamp: new Date().toISOString()
  });
  const etag = `"news-${stableHash(body).toString(36)}"`;
  return { body, etag, cacheable };
}

export async function onRequestGet(context: {
  request: Request;
  env: GeminiEnv & { GEMINI_MODEL?: string };
  waitUntil?: (promise: Promise<unknown>) => void;
}) {
  const { request, env, waitUntil } = context;
  // Intentionally ignore request URL query (?refresh=…) — public cache-busting burns Gemini quota.
  const cacheKey = pathOnlyCacheRequest(request);

  try {
    const cached = await edgeCaches.default.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-News-Cache', 'CDN-HIT');
      return new Response(cached.body, { status: cached.status, headers });
    }
  } catch {
    // caches.default may be unavailable in some local runtimes; fall through.
  }

  const now = Date.now();
  if (newsCache && now - newsCache.at < NEWS_TTL_MS) {
    return new Response(newsCache.body, {
      headers: newsHeaders({
        ETag: newsCache.etag,
        'X-News-Cache': 'HIT'
      })
    });
  }

  if (!newsInflight) {
    newsInflight = buildNewsPayload(env)
      .then((payload) => {
        if (payload.cacheable) {
          newsCache = { at: Date.now(), body: payload.body, etag: payload.etag };
        }
        return payload;
      })
      .finally(() => {
        newsInflight = null;
      });
  }

  const payload = await newsInflight;
  const response = new Response(payload.body, {
    headers: newsHeaders({
      ETag: payload.etag,
      'X-News-Cache': payload.cacheable ? 'MISS' : 'BYPASS-EMPTY',
      // Empty payloads must not be stored by intermediary caches.
      ...(payload.cacheable
        ? {}
        : {
            'Cache-Control': 'no-store',
            'CDN-Cache-Control': 'no-store',
            'Cloudflare-CDN-Cache-Control': 'no-store'
          })
    })
  });

  if (payload.cacheable) {
    try {
      const put = edgeCaches.default.put(cacheKey, response.clone());
      if (typeof waitUntil === 'function') waitUntil(put);
      else await put;
    } catch {
      // Ignore cache put failures; response is still returned.
    }
  }

  return response;
}
