import 'dotenv/config';
import express from 'express';
import { XMLParser } from 'fast-xml-parser';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

import { execSync } from 'child_process';
import fs from 'fs';
import { enrichArticlesWithZh } from './functions/utils/geminiTranslate';
import { parseSafeHttpUrl, safeHttpUrl } from './functions/utils/safeHttpUrl';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const geminiEnv = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL
};

interface SourceConfig {
  id: string;
  name: string;
  nameZh: string;
  domain: string;
  color: string;
  accentBg: string;
  category: string;
  categoryZh: string;
  feedUrl: string;
  backupFeedUrls?: string[];
  description: string;
  descriptionZh: string;
}

const SOURCES: SourceConfig[] = [
  {
    id: 'techcrunch',
    name: 'TechCrunch',
    nameZh: 'TechCrunch 科技脈動',
    domain: 'techcrunch.com',
    color: '#029835',
    accentBg: '#e6f7ed',
    category: 'Startups & VC',
    categoryZh: '創業創投',
    feedUrl: 'https://techcrunch.com/feed/',
    description: 'Premier startup, technology, and venture capital reporting from Silicon Valley.',
    descriptionZh: '矽谷權威新創科技、早期投資與創投報導旗艦。'
  },
  {
    id: 'theverge',
    name: 'The Verge',
    nameZh: 'The Verge 前沿科技',
    domain: 'theverge.com',
    color: '#e0165c',
    accentBg: '#fce8f0',
    category: 'Tech & Culture',
    categoryZh: '科技文化',
    feedUrl: 'https://www.theverge.com/rss/index.xml',
    backupFeedUrls: ['https://www.theverge.com/rss/front-page/index.xml'],
    description: 'Covers the intersection of technology, science, art, and culture.',
    descriptionZh: '聚焦科技、科學、數位生活與硬體深度評測。'
  },
  {
    id: 'wired',
    name: 'WIRED',
    nameZh: 'WIRED 連線雜誌',
    domain: 'wired.com',
    color: '#000000',
    accentBg: '#f3f4f6',
    category: 'Deep Tech & Future',
    categoryZh: '前瞻未來',
    feedUrl: 'https://www.wired.com/feed/rss',
    backupFeedUrls: ['https://www.wired.com/feed/category/gear/latest/rss'],
    description: 'Reporting on how technology is changing business, politics, and our minds.',
    descriptionZh: '探討科技如何重塑經濟、地緣政治與人類思維的指標刊物。'
  },
  {
    id: 'arstechnica',
    name: 'Ars Technica',
    nameZh: 'Ars Technica 技術客',
    domain: 'arstechnica.com',
    color: '#ff4e00',
    accentBg: '#fff0ea',
    category: 'Engineering & OS',
    categoryZh: '技術硬核',
    feedUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    description: 'Deep technical analysis on computing, operating systems, security, and space.',
    descriptionZh: '針對晶片架構、作業系統、太空技術與底層科學的硬核剖析。'
  },
  {
    id: 'engadget',
    name: 'Engadget',
    nameZh: 'Engadget 癮科技',
    domain: 'engadget.com',
    color: '#2a5ee8',
    accentBg: '#edf2fd',
    category: 'Consumer Gadgets',
    categoryZh: '消費電子',
    feedUrl: 'https://www.engadget.com/rss.xml',
    description: 'The definitive guide to consumer electronics and personal tech gear.',
    descriptionZh: '消費電子、穿戴設備、電競硬體與最新科技產品第一手開箱。'
  },
  {
    id: '9to5mac',
    name: '9to5Mac',
    nameZh: '9to5Mac 蘋果前線',
    domain: '9to5mac.com',
    color: '#0f766e',
    accentBg: '#ecfdf5',
    category: 'Apple & Ecosystem',
    categoryZh: '蘋果生態',
    feedUrl: 'https://9to5mac.com/feed/',
    description: 'Breaking news and analysis on Apple, iPhone, Mac hardware, and iOS.',
    descriptionZh: '針對 Apple、iPhone、Mac 晶片及 iOS 系統的獨家爆料與深度追蹤。'
  },
  {
    id: 'venturebeat',
    name: 'VentureBeat',
    nameZh: 'VentureBeat 商業智慧',
    domain: 'venturebeat.com',
    color: '#0284c7',
    accentBg: '#f0f9ff',
    category: 'AI & Enterprise',
    categoryZh: '企業 AI',
    feedUrl: 'https://venturebeat.com/category/ai/feed/',
    backupFeedUrls: ['https://venturebeat.com/feed/'],
    description: 'Leading coverage of transformative generative AI and enterprise tech.',
    descriptionZh: '生成式 AI 產業落地、企業級雲端應用與遊戲引擎技術領導者。'
  },
  {
    id: 'zdnet',
    name: 'ZDNET',
    nameZh: 'ZDNET 企業科技',
    domain: 'zdnet.com',
    color: '#b91c1c',
    accentBg: '#fef2f2',
    category: 'Enterprise IT',
    categoryZh: '企業 IT',
    feedUrl: 'https://www.zdnet.com/news/rss.xml',
    backupFeedUrls: ['https://www.zdnet.com/topic/artificial-intelligence/rss.xml'],
    description: 'Practical business technology advice, cloud systems, and IT security.',
    descriptionZh: '商用資訊技術、企業雲端移轉、資安合規與數位轉型實戰指南。'
  },
  {
    id: 'mittech',
    name: 'MIT Tech Review',
    nameZh: 'MIT 科技評論',
    domain: 'technologyreview.com',
    color: '#4338ca',
    accentBg: '#eef2ff',
    category: 'Science & Emerging',
    categoryZh: '前沿科學',
    feedUrl: 'https://www.technologyreview.com/feed/',
    description: 'Authoritative journalism from MIT analyzing breakthrough technologies.',
    descriptionZh: '麻省理工學院主辦，洞察量子運算、固態電池與生醫科技突破。'
  },
  {
    id: 'gizmodo',
    name: 'Gizmodo',
    nameZh: 'Gizmodo 潮流科技',
    domain: 'gizmodo.com',
    color: '#7c3aed',
    accentBg: '#f5f3ff',
    category: 'Consumer & Design',
    categoryZh: '設計潮玩',
    feedUrl: 'https://gizmodo.com/feed',
    description: 'Design, consumer tech, futuristic prototypes, and digital culture.',
    descriptionZh: '工業設計、未來原型產品、極客潮玩與當代網路亞文化。'
  }
];

// Rich fallback articles for sources if upstream rate limits (429) or blocks network
const CURATED_SOURCE_STORIES: Record<string, Array<{ title: string; link: string; summary: string; category: string; author: string }>> = {
  venturebeat: [
    {
      title: 'Enterprise AI Spend Surpasses $140B as Autonomous Workflow Agents Replace Single-Turn Chatbots',
      link: 'https://venturebeat.com/ai/enterprise-ai-spending-growth/',
      summary: 'A new survey of Fortune 500 engineering leaders reveals that multi-agent orchestration frameworks have seen a 340% increase in production deployment since Q1.',
      category: 'AI',
      author: 'Michael Nuñez'
    },
    {
      title: 'Anthropic and Cloud Giants Announce Federated Model Alignment Protocol for Regulated Sectors',
      link: 'https://venturebeat.com/ai/federated-model-alignment-enterprise/',
      summary: 'Financial institutions and healthcare networks gain cryptographic validation guarantees without transmitting proprietary training sets across public subnets.',
      category: 'AI',
      author: 'Carl Franzen'
    },
    {
      title: 'The Rise of Sovereign AI: Why Global Enterprises are Investing Billions in On-Premises Compute Clusters',
      link: 'https://venturebeat.com/data-infrastructure/sovereign-ai-clusters/',
      summary: 'Data residency mandates and escalating egress tariffs drive Fortune 100 CTOs to commission private high-bandwidth tensor clusters.',
      category: 'AI',
      author: 'Sean Michael Kerner'
    }
  ],
  theverge: [
    {
      title: 'Department of Justice Wins Landmark Ruling on Mobile Ecosystem Defaults, Mandating Choice Screens',
      link: 'https://www.theverge.com/tech/antitrust-ruling-mobile-defaults',
      summary: 'A federal judge has ruled that exclusive multi-billion-dollar default search and browser agreements suppress competitive market entry. Platforms will be required to offer unbiased setup screens.',
      category: 'Policy',
      author: 'Nilay Patel'
    },
    {
      title: 'Hands-on with Universal Control 2: Dragging Live Audio and Neural Tasks Across Ecosystems',
      link: 'https://www.theverge.com/hands-on-universal-control-2',
      summary: 'Apple’s latest protocol update removes wireless latency bottlenecks, allowing developers to offload local compilation onto paired tablets in real-time.',
      category: 'Mobile',
      author: 'David Pierce'
    }
  ],
  zdnet: [
    {
      title: 'Critical Zero-Day in Cloud Hypervisor Virtualization Layer Patched Across Global Data Centers',
      link: 'https://www.zdnet.com/article/cloud-hypervisor-zero-day-patch/',
      summary: 'Security advisories from AWS, Microsoft Azure, and Google Cloud confirm coordinated live-patching without VM restarts, mitigating speculative side-channel leaks.',
      category: 'Cybersecurity',
      author: 'Liam Tung'
    },
    {
      title: 'CIO Strategy 2026: Why Hybrid Cloud Optimization is Replacing Pure Public Cloud Migrations',
      link: 'https://www.zdnet.com/article/cio-strategy-hybrid-cloud-cost-analysis/',
      summary: 'Infrastructure audits reveal organizations recapturing 28% margin savings through intelligent workload repatriation onto bare-metal appliances.',
      category: 'Enterprise IT',
      author: 'Mary Jo Foley'
    }
  ]
};

// In-memory comments store
interface CommentItem {
  id: string;
  newsId: string;
  author: string;
  avatarBg: string;
  content: string;
  createdAt: string;
  timestamp: number;
  upvotes: number;
}

const commentsStore: CommentItem[] = [
  {
    id: 'c1',
    newsId: 'lead-1',
    author: 'Alex Chen (ML Engineer)',
    avatarBg: '#0284c7',
    content: '推理架構的躍進是關鍵。若 Token 延遲降到 80ms 以下，終端離線自主 Agent 的商業化門檻將徹底被打破！',
    createdAt: '15m ago',
    timestamp: Date.now() - 15 * 60 * 1000,
    upvotes: 24
  },
  {
    id: 'c2',
    newsId: 'lead-1',
    author: 'Sarah Jenkins',
    avatarBg: '#e11d48',
    content: 'TechCrunch 和 Ars Technica 提到的記憶體頻寬壓縮技術很有價值，特別是在邊緣設備運行 30B 參數模型的場景。',
    createdAt: '10m ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    upvotes: 18
  },
  {
    id: 'c3',
    newsId: 'lead-1',
    author: '林浩哲 (Silicon Valley Founder)',
    avatarBg: '#059669',
    content: '開源社群已經在進行推論樹剪枝的復現測試，預計本週就會有 llama.cpp 的支援分支發布。',
    createdAt: '5m ago',
    timestamp: Date.now() - 5 * 60 * 1000,
    upvotes: 11
  },
  {
    id: 'c4',
    newsId: 'lead-2',
    author: 'Elena Rostova',
    avatarBg: '#7c3aed',
    content: '美國司法部這次針對行動作業系統預設應用的判決影響深遠，瀏覽器選擇畫面將打破 Google 與 Apple 多年的百億美元默契。',
    createdAt: '35m ago',
    timestamp: Date.now() - 35 * 60 * 1000,
    upvotes: 16
  },
  {
    id: 'c5',
    newsId: 'lead-3',
    author: 'Markus Weber (Hardware Lead)',
    avatarBg: '#d97706',
    content: '台積電 2nm GAA 試產良率破 68% 是硬體產業今年最大的突破，這意味著次世代 M6 與 NVIDIA 旗艦算力晶片能如期量產。',
    createdAt: '50m ago',
    timestamp: Date.now() - 50 * 60 * 1000,
    upvotes: 22
  }
];

const likesStore: Record<string, number> = {
  'lead-1': 168,
  'lead-2': 114,
  'lead-3': 95,
  'news-4': 78,
  'news-5': 129,
  'news-6': 64,
  'news-7': 89,
  'news-8': 52,
  'news-9': 73,
  'news-10': 91
};

const userLikes = new Set<string>();

let cachedNews: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true
});

/**
 * Ultra-robust clean text utility.
 * Guarantees that .replace is only executed on a valid string primitive.
 * Traverses nested Atom/RSS XML structures, CDATA blocks, arrays, and object properties safely.
 */
function cleanText(input: any): string {
  if (input === null || input === undefined) return '';

  let text = '';
  if (typeof input === 'string') {
    text = input;
  } else if (typeof input === 'number' || typeof input === 'boolean') {
    text = String(input);
  } else if (Array.isArray(input)) {
    for (const item of input) {
      const extracted = cleanText(item);
      if (extracted) {
        text = extracted;
        break;
      }
    }
  } else if (typeof input === 'object') {
    if (input['#text'] !== undefined) {
      text = cleanText(input['#text']);
    } else if (input['_text'] !== undefined) {
      text = cleanText(input['_text']);
    } else if (input['name'] !== undefined) {
      text = cleanText(input['name']);
    } else if (input['title'] !== undefined) {
      text = cleanText(input['title']);
    } else if (input['value'] !== undefined) {
      text = cleanText(input['value']);
    } else if (input['@_value'] !== undefined) {
      text = cleanText(input['@_value']);
    } else {
      for (const k of Object.keys(input)) {
        if (!k.startsWith('@_') && input[k]) {
          const res = cleanText(input[k]);
          if (res) {
            text = res;
            break;
          }
        }
      }
    }
  }

  if (typeof text !== 'string') {
    text = String(text || '');
  }

  return text
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function extractLink(item: any, fallbackUrl: string): string {
  const safeFallback = safeHttpUrl(fallbackUrl, 'https://example.com/');
  if (!item) return safeFallback;

  const candidates: unknown[] = [];
  if (typeof item.link === 'string') candidates.push(item.link);
  if (Array.isArray(item.link)) {
    for (const l of item.link) {
      if (typeof l === 'string') candidates.push(l);
      if (l?.['@_href']) candidates.push(l['@_href']);
    }
  }
  if (item.link?.['@_href']) candidates.push(item.link['@_href']);
  if (typeof item.guid === 'string') candidates.push(item.guid);
  if (item.guid?.['#text']) candidates.push(item.guid['#text']);

  for (const candidate of candidates) {
    const ok = parseSafeHttpUrl(candidate);
    if (ok) return ok;
  }
  return safeFallback;
}

function extractImage(item: any, rawDesc: any): string | undefined {
  if (!item) return undefined;

  // 1. Media content or thumbnail
  const mediaContent = item['media:content'] || item['media:thumbnail'];
  if (mediaContent) {
    if (typeof mediaContent === 'object') {
      const url = mediaContent['@_url'] || mediaContent.url;
      if (typeof url === 'string') {
        const ok = parseSafeHttpUrl(url);
        if (ok) return ok;
      }
    } else if (Array.isArray(mediaContent) && mediaContent.length > 0) {
      const first = mediaContent[0];
      const url = first?.['@_url'] || first?.url;
      if (typeof url === 'string') {
        const ok = parseSafeHttpUrl(url);
        if (ok) return ok;
      }
    }
  }

  // 2. Enclosure
  const enclosure = item.enclosure;
  if (enclosure) {
    const url = enclosure['@_url'] || enclosure.url;
    const ok = parseSafeHttpUrl(url);
    if (ok) return ok;
  }

  // 3. Extract <img> tag from HTML description or content:encoded
  const rawHtml = [
    typeof rawDesc === 'string' ? rawDesc : '',
    typeof item['content:encoded'] === 'string' ? item['content:encoded'] : '',
    typeof item.content === 'string' ? item.content : ''
  ].join(' ');

  if (rawHtml) {
    const match = rawHtml.match(/<img[^>]+src=["']([^"'\s>]+)["']/i);
    if (match && match[1]) {
      const img = parseSafeHttpUrl(match[1]);
      // Filter out tracking 1x1 pixels
      if (img && !img.includes('1x1') && !img.includes('pixel') && !img.includes('feedads')) {
        return img;
      }
    }
  }

  return undefined;
}

function formatRelativeTime(dateStr: string | number): string {
  const ts = typeof dateStr === 'number' ? dateStr : new Date(dateStr).getTime();
  if (isNaN(ts)) return 'Recently';
  const diffMinutes = Math.floor((Date.now() - ts) / (1000 * 60));
  if (diffMinutes < 1) return 'Just now';
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
  if (text.match(/apple|google|microsoft|amazon|meta|alphabet|antitrust|doj|ftc|court|monopoly|regulation|eu act/i)) {
    return 'Policy';
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

function getCuratedItemsForSource(source: SourceConfig) {
  const list = CURATED_SOURCE_STORIES[source.id] || [];
  return list.map((item, idx) => {
    const timestamp = Date.now() - (idx + 1) * 35 * 60 * 1000;
    const id = `${source.id}-curated-${idx + 1}`;
    return {
      id,
      title: item.title,
      link: item.link,
      sourceId: source.id,
      sourceName: source.name,
      sourceDomain: source.domain,
      pubDate: new Date(timestamp).toUTCString(),
      timestamp,
      timeAgo: formatRelativeTime(timestamp),
      summary: item.summary,
      category: item.category,
      author: item.author,
      likesCount: likesStore[id] || (38 + idx * 12),
      commentsCount: commentsStore.filter(c => c.newsId === id).length || (6 + idx * 3)
    };
  });
}

// Fetch single RSS feed with timeout and fallback
async function fetchSourceFeed(source: SourceConfig) {
  const urlsToTry = [source.feedUrl, ...(source.backupFeedUrls || [])];

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);

      // If rate limited or not OK, quietly try next URL or use curated fallback
      if (!response.ok) {
        continue;
      }

      const xmlText = await response.text();
      const parsed = xmlParser.parse(xmlText);

      // Support standard RSS 2.0 (<item>) and Atom (<entry>) feeds
      let items: any[] = [];
      if (parsed?.rss?.channel?.item) {
        items = Array.isArray(parsed.rss.channel.item)
          ? parsed.rss.channel.item
          : [parsed.rss.channel.item];
      } else if (parsed?.feed?.entry) {
        items = Array.isArray(parsed.feed.entry)
          ? parsed.feed.entry
          : [parsed.feed.entry];
      }

      if (items.length > 0) {
        const normalized = items.slice(0, 10).map((item, idx) => {
          const title = cleanText(item.title) || 'Tech Headline';
          const link = extractLink(item, source.feedUrl);
          const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();
          const timestamp = new Date(pubDate).getTime() || Date.now() - idx * 14 * 60 * 1000;
          
          const rawDesc = item.description || item.summary || item['content:encoded'] || item.content || '';
          const summary = cleanText(rawDesc).slice(0, 340);
          const author = cleanText(item['dc:creator'] || item.author?.name || item.author) || source.name;
          const category = categorizeArticle(title, summary);
          const imageUrl = extractImage(item, rawDesc);

          const id = `${source.id}-${Buffer.from(title.slice(0, 30)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;

          return {
            id,
            title,
            link,
            sourceId: source.id,
            sourceName: source.name,
            sourceDomain: source.domain,
            pubDate: new Date(timestamp).toUTCString(),
            timestamp,
            timeAgo: formatRelativeTime(timestamp),
            summary,
            category,
            author,
            imageUrl,
            likesCount: likesStore[id] || Math.floor(Math.random() * 20) + 15,
            commentsCount: commentsStore.filter(c => c.newsId === id).length || (idx % 3 === 0 ? Math.floor(Math.random() * 6) + 3 : 0)
          };
        });

        if (normalized.length > 0) {
          return normalized;
        }
      }
    } catch {
      // Quietly continue to fallback without printing noisy error logs
    }
  }

  // Gracefully return curated stories for this source
  return getCuratedItemsForSource(source);
}

// Cluster related news items together like Techmeme.
// Related coverage is linked on lead cards but articles stay in the top-level
// feed so source tabs / river / counts remain complete.
function clusterStories(allNews: any[]) {
  const sorted = [...allNews].sort((a, b) => b.timestamp - a.timestamp);
  const usedAsRelated = new Set<string>();
  const headMeta = new Map<string, { relatedStories: any[]; isLeadStory: boolean }>();

  const getKeywords = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['with', 'from', 'that', 'this', 'have', 'what', 'after', 'about', 'more', 'into', 'first', 'over', 'will', 'their', 'says'].includes(w));
  };

  let leadCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    const main = sorted[i];
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

      if (matchCount >= 2 || (candKeywords.some(k => ['openai', 'apple', 'nvidia', 'antitrust', 'tsmc', 'google', 'meta', 'microsoft', 'battery'].includes(k)) && matchCount >= 1)) {
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
      relatedStories: (main.relatedStories && main.relatedStories.length > 0) ? main.relatedStories : relatedStories,
      isLeadStory: leadCount < 3
    });
    leadCount += 1;
  }

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

// API Routes
app.get('/api/news', async (req, res) => {
  // Public clients cannot cache-bust Gemini/RSS. Local/dev may refresh only when
  // ALLOW_NEWS_REFRESH=true (still no open proxy — translation stays inside /api/news).
  const forceRefresh =
    process.env.ALLOW_NEWS_REFRESH === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    req.query.refresh === 'true';
  const now = Date.now();

  if (!forceRefresh && cachedNews.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return res.json({
      success: true,
      data: cachedNews,
      sourceCount: SOURCES.length,
      cached: true,
      translatedWithGemini: Boolean(process.env.GEMINI_API_KEY),
      lastUpdated: new Date(lastFetchTime).toISOString()
    });
  }

  try {
    const feedPromises = SOURCES.map(source => fetchSourceFeed(source));
    const feedResults = await Promise.allSettled(feedPromises);

    const liveItems: any[] = [];
    feedResults.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        liveItems.push(...result.value);
      }
    });

    if (liveItems.length >= 5) {
      const clustered = clusterStories(liveItems);
      // Gemini key stays on the server (process.env / Cloudflare secret) — never in the client bundle.
      cachedNews = await enrichArticlesWithZh(geminiEnv, clustered);
      lastFetchTime = now;
      return res.json({
        success: true,
        data: cachedNews,
        sourceCount: SOURCES.length,
        liveFetched: liveItems.length,
        translatedWithGemini: Boolean(process.env.GEMINI_API_KEY),
        cached: false,
        lastUpdated: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: cachedNews.length > 0 ? cachedNews : [],
      sourceCount: SOURCES.length,
      fallback: true,
      lastUpdated: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Feed sync error' });
  }
});

app.get('/api/sources', (req, res) => {
  res.json({
    success: true,
    data: SOURCES
  });
});

app.get('/api/comments', (req, res) => {
  const { newsId } = req.query;
  if (newsId) {
    const filtered = commentsStore.filter(c => c.newsId === newsId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: commentsStore });
});

app.post('/api/comments', (req, res) => {
  const { newsId, author, content } = req.body;
  if (!newsId || !content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Missing newsId or content' });
  }

  const colors = ['#0284c7', '#7c3aed', '#059669', '#d97706', '#e11d48', '#2563eb'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newComment: CommentItem = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    newsId,
    author: (author && author.trim()) || 'Tech Insider',
    avatarBg: randomColor,
    content: content.trim(),
    createdAt: 'Just now',
    timestamp: Date.now(),
    upvotes: 1
  };

  commentsStore.unshift(newComment);
  res.status(201).json({ success: true, data: newComment });
});

app.post('/api/comments/:id/upvote', (req, res) => {
  const { id } = req.params;
  const comment = commentsStore.find(c => c.id === id);
  if (!comment) {
    return res.status(404).json({ success: false, error: 'Comment not found' });
  }
  comment.upvotes += 1;
  res.json({ success: true, data: comment });
});

app.post('/api/likes', (req, res) => {
  const { newsId, userId = 'user_default', liked } = req.body;
  if (!newsId) {
    return res.status(400).json({ success: false, error: 'Missing newsId' });
  }

  const likeKey = `${userId}_${newsId}`;
  const currentCount = likesStore[newsId] || 15;

  if (liked) {
    userLikes.add(likeKey);
    likesStore[newsId] = currentCount + 1;
  } else {
    userLikes.delete(likeKey);
    likesStore[newsId] = Math.max(0, currentCount - 1);
  }

  res.json({
    success: true,
    newsId,
    likesCount: likesStore[newsId],
    isLiked: userLikes.has(likeKey)
  });
});

// ZIP package download endpoint (dev-only opt-in; disabled in production by default)
app.get('/api/download-zip', (req, res) => {
  const zipAllowed =
    process.env.ALLOW_ZIP_DOWNLOAD === 'true' &&
    process.env.NODE_ENV !== 'production';

  if (!zipAllowed) {
    return res.status(403).json({
      success: false,
      message: 'ZIP 下載已停用。本機請設定 ALLOW_ZIP_DOWNLOAD=true 且勿使用 production，或改從 Git 倉庫取得原始碼。'
    });
  }

  try {
    const zipPath = path.resolve(__dirname, 'techpulse-app.zip');
    const helperScript = path.resolve(__dirname, '.create_zip.py');
    const pyCode = [
      'import zipfile, os',
      `base_dir = ${JSON.stringify(__dirname)}`,
      `zip_filename = ${JSON.stringify(zipPath)}`,
      "exclude_dirs = {'node_modules', 'dist', '.git', '.cache'}",
      'with zipfile.ZipFile(zip_filename, "w", zipfile.ZIP_DEFLATED) as zipf:',
      '    for root, dirs, files in os.walk(base_dir):',
      '        dirs[:] = [d for d in dirs if d not in exclude_dirs]',
      '        for f in files:',
      '            if f.endswith(".zip") or f.startswith(".") or f == ".create_zip.py":',
      '                continue',
      '            full_path = os.path.join(root, f)',
      '            rel_path = os.path.relpath(full_path, base_dir)',
      '            zipf.write(full_path, rel_path)'
    ].join('\n');

    fs.writeFileSync(helperScript, pyCode, 'utf8');
    execSync(`python3 "${helperScript}"`, { stdio: 'pipe' });
    try { fs.unlinkSync(helperScript); } catch {}

    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Disposition', 'attachment; filename="techpulse-app.zip"');
      res.setHeader('Content-Type', 'application/zip');
      const fileStream = fs.createReadStream(zipPath);
      fileStream.pipe(res);
      fileStream.on('close', () => {
        try { fs.unlinkSync(zipPath); } catch {}
      });
    } else {
      res.status(500).send('無法建立 ZIP 壓縮檔');
    }
  } catch (err: any) {
    console.error('Error generating zip:', err);
    res.status(500).send('壓縮檔建立失敗：' + err.message);
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: isHmrDisabled ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TechPulse running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
