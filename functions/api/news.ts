// Cloudflare Pages Function for /api/news
// Operates on Cloudflare Edge runtime with automatic global distribution

const RSS_SOURCES = [
  { id: 'techcrunch', name: 'TechCrunch', domain: 'techcrunch.com', url: 'https://techcrunch.com/feed/', category: 'Startups & VC' },
  { id: 'theverge', name: 'The Verge', domain: 'theverge.com', url: 'https://www.theverge.com/rss/index.xml', category: 'Consumer Tech' },
  { id: 'wired', name: 'WIRED', domain: 'wired.com', url: 'https://www.wired.com/feed/rss', category: 'Culture & Policy' },
  { id: 'arstechnica', name: 'Ars Technica', domain: 'arstechnica.com', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Deep Tech & Science' },
  { id: 'engadget', name: 'Engadget', domain: 'engadget.com', url: 'https://www.engadget.com/rss.xml', category: 'Gadgets & Audio' },
  { id: '9to5mac', name: '9to5Mac', domain: '9to5mac.com', url: 'https://9to5mac.com/feed/', category: 'Apple Ecosystem' },
  { id: 'venturebeat', name: 'VentureBeat', domain: 'venturebeat.com', url: 'https://venturebeat.com/category/ai/feed/', category: 'Enterprise AI' },
  { id: 'zdnet', name: 'ZDNET', domain: 'zdnet.com', url: 'https://www.zdnet.com/news/rss.xml', category: 'Enterprise IT' },
  { id: 'mittech', name: 'MIT Tech Review', domain: 'technologyreview.com', url: 'https://www.technologyreview.com/feed/', category: 'Science & Emerging' },
  { id: 'gizmodo', name: 'Gizmodo', domain: 'gizmodo.com', url: 'https://gizmodo.com/feed', category: 'Consumer & Design' }
];

function cleanXml(text: string): string {
  if (!text) return '';
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

function parseItems(xmlText: string, source: any) {
  const items: any[] = [];
  const itemMatches = xmlText.match(/<(?:item|entry)[\s>][\s\S]*?<\/(?:item|entry)>/gi) || [];

  for (const itemXml of itemMatches.slice(0, 10)) {
    const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link[^>]*href=["']([^"']+)["']/i) || itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const descMatch = itemXml.match(/<(?:description|summary|content)[^>]*>([\s\S]*?)<\/(?:description|summary|content)>/i);
    const dateMatch = itemXml.match(/<(?:pubDate|published|updated)[^>]*>([\s\S]*?)<\/(?:pubDate|published|updated)>/i);
    const imgMatch = itemXml.match(/<img[^>]+src=["'](https?:\/\/[^"'\s>]+)["']/i) ||
                     itemXml.match(/<(?:media:content|media:thumbnail|enclosure)[^>]+url=["'](https?:\/\/[^"'\s>]+)["']/i);

    const title = cleanXml(titleMatch ? titleMatch[1] : '');
    const link = linkMatch ? (linkMatch[1] || linkMatch[0]).replace(/<[^>]+>/g, '').trim() : `https://${source.domain}`;
    const summary = cleanXml(descMatch ? descMatch[1] : '').slice(0, 260);
    const imageUrl = imgMatch ? imgMatch[1] : undefined;

    if (title && title.length > 5) {
      items.push({
        id: `${source.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title,
        link,
        summary: summary || title,
        sourceId: source.id,
        sourceName: source.name,
        sourceDomain: source.domain,
        author: source.name,
        publishedAt: dateMatch ? dateMatch[1].trim() : '近期發布',
        relativeTime: '即時快訊',
        timestamp: Date.now(),
        category: source.category,
        likesCount: 15 + Math.floor(Math.random() * 25),
        commentsCount: 2 + Math.floor(Math.random() * 8),
        isHot: Math.random() > 0.65,
        salienceScore: 70 + Math.floor(Math.random() * 30),
        imageUrl
      });
    }
  }
  return items;
}

export async function onRequestGet({ request }: { request: Request }) {
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
    } catch {}
    return [];
  });

  const results = await Promise.allSettled(fetchPromises);
  const allArticles: any[] = [];
  results.forEach(res => {
    if (res.status === 'fulfilled' && res.value.length > 0) {
      allArticles.push(...res.value);
    }
  });

  return new Response(JSON.stringify({
    success: true,
    data: allArticles,
    total: allArticles.length,
    cached: false,
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=180'
    }
  });
}
