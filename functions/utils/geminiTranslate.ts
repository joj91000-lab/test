/**
 * Server-only Gemini translation helpers for Cloudflare Pages Functions / Workers.
 * GEMINI_API_KEY must come from env / Cloudflare secrets — never from the client.
 */

export type GeminiEnv = {
  GEMINI_API_KEY?: string;
};

const MODEL = 'gemini-2.0-flash';

function extractJsonArray(text: string): string[] | null {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v));
  } catch {
    // fall through — model sometimes wraps JSON in fences / prose
  }
  const match = trimmed.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v));
  } catch {
    return null;
  }
  return null;
}

/** Lightweight offline fallback when Gemini is unavailable. */
export function fallbackTranslate(text: string, kind: 'title' | 'summary'): string {
  if (!text) return '';
  if (kind === 'title') return `【科技要聞】${text}`;
  return text;
}

async function geminiTranslateBatch(
  apiKey: string,
  texts: string[],
  kind: 'title' | 'summary'
): Promise<string[] | null> {
  if (texts.length === 0) return [];

  const label = kind === 'title' ? 'headlines' : 'summaries';
  const prompt = [
    `You are a professional tech-news translator.`,
    `Translate each English ${label} into fluent Traditional Chinese (Taiwan, zh-TW).`,
    `Keep proper nouns (company/product names) recognizable.`,
    `Return ONLY a JSON array of strings with the same length and order as the input.`,
    `Input:`,
    JSON.stringify(texts)
  ].join('\n');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!res.ok) {
    console.error('Gemini translate failed', res.status, await res.text().catch(() => ''));
    return null;
  }

  const payload = await res.json() as any;
  const raw =
    payload?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || '').join('') || '';
  const arr = extractJsonArray(raw);
  if (!arr || arr.length !== texts.length) {
    console.error('Gemini translate returned unexpected shape', raw?.slice?.(0, 200));
    return null;
  }
  return arr;
}

/**
 * Translate many strings with Gemini (chunked). Falls back per-item when key missing or API fails.
 */
export async function translateTexts(
  env: GeminiEnv | undefined,
  texts: string[],
  kind: 'title' | 'summary'
): Promise<string[]> {
  const apiKey = env?.GEMINI_API_KEY?.trim();
  const maxLen = kind === 'title' ? 400 : 1200;
  const capped = texts.map((t) => String(t || '').slice(0, maxLen)).slice(0, 80);
  if (!apiKey) {
    return capped.map((t) => fallbackTranslate(t, kind));
  }

  const out = new Array<string>(capped.length);
  const chunkSize = 12;

  for (let i = 0; i < capped.length; i += chunkSize) {
    const slice = capped.slice(i, i + chunkSize);
    try {
      const translated = await geminiTranslateBatch(apiKey, slice, kind);
      if (translated) {
        for (let j = 0; j < slice.length; j++) out[i + j] = translated[j] || fallbackTranslate(slice[j], kind);
      } else {
        for (let j = 0; j < slice.length; j++) out[i + j] = fallbackTranslate(slice[j], kind);
      }
    } catch (err) {
      console.error('Gemini batch error', err);
      for (let j = 0; j < slice.length; j++) out[i + j] = fallbackTranslate(slice[j], kind);
    }
  }

  return out;
}

/** Attach titleZh / summaryZh (and related titleZh) using Gemini on the server. */
export async function enrichArticlesWithZh<T extends {
  title: string;
  summary?: string;
  titleZh?: string;
  summaryZh?: string;
  relatedStories?: Array<{ title: string; titleZh?: string }>;
}>(env: GeminiEnv | undefined, articles: T[]): Promise<T[]> {
  if (articles.length === 0) return articles;

  // Cap work per request so a large RSS fan-out cannot unbounded-spend Gemini.
  const limited = articles.slice(0, 80);
  const titles = limited.map((a) => a.title);
  const summaries = limited.map((a) => a.summary || a.title);
  const relatedTitles: string[] = [];
  const relatedIndex: Array<{ articleIdx: number; relatedIdx: number }> = [];

  limited.forEach((a, articleIdx) => {
    (a.relatedStories || []).slice(0, 4).forEach((r, relatedIdx) => {
      relatedTitles.push(r.title);
      relatedIndex.push({ articleIdx, relatedIdx });
    });
  });

  const [titleZhList, summaryZhList, relatedZhList] = await Promise.all([
    translateTexts(env, titles, 'title'),
    translateTexts(env, summaries, 'summary'),
    translateTexts(env, relatedTitles, 'title')
  ]);

  return limited.map((article, i) => {
    const relatedStories = (article.relatedStories || []).slice(0, 4).map((r, relatedIdx) => {
      const flatIdx = relatedIndex.findIndex(
        (x) => x.articleIdx === i && x.relatedIdx === relatedIdx
      );
      return {
        ...r,
        titleZh: r.titleZh || (flatIdx >= 0 ? relatedZhList[flatIdx] : fallbackTranslate(r.title, 'title'))
      };
    });

    return {
      ...article,
      titleZh: article.titleZh || titleZhList[i],
      summaryZh: article.summaryZh || summaryZhList[i],
      relatedStories
    };
  });
}
