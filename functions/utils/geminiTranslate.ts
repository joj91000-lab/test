/**
 * Server-only Gemini translation helpers for Cloudflare Pages Functions / Workers.
 * GEMINI_API_KEY must come from env / Cloudflare secrets — never from the client.
 */

export type GeminiEnv = {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
};

// gemini-2.0-flash is shut down; prefer current Flash-Lite for high-volume translation.
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

function resolveModel(env?: GeminiEnv): string {
  return (env?.GEMINI_MODEL || DEFAULT_MODEL).trim();
}

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

async function geminiTranslateBatch(
  apiKey: string,
  model: string,
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        // Avoid deprecated sampling params on Gemini 3.x Flash family.
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
 * Translate many strings with Gemini (chunked).
 * Returns null per item when the key is missing or the API fails, so the client
 * dictionary translator can run instead of a weak server-side English prefix.
 */
export async function translateTexts(
  env: GeminiEnv | undefined,
  texts: string[],
  kind: 'title' | 'summary'
): Promise<Array<string | null>> {
  const apiKey = env?.GEMINI_API_KEY?.trim();
  const maxLen = kind === 'title' ? 400 : 1200;
  const capped = texts.map((t) => String(t || '').slice(0, maxLen)).slice(0, 80);
  if (!apiKey) {
    return capped.map(() => null);
  }

  const model = resolveModel(env);
  const out = new Array<string | null>(capped.length);
  const chunkSize = 12;

  for (let i = 0; i < capped.length; i += chunkSize) {
    const slice = capped.slice(i, i + chunkSize);
    try {
      const translated = await geminiTranslateBatch(apiKey, model, slice, kind);
      if (translated) {
        for (let j = 0; j < slice.length; j++) out[i + j] = translated[j] || null;
      } else {
        for (let j = 0; j < slice.length; j++) out[i + j] = null;
      }
    } catch (err) {
      console.error('Gemini batch error', err);
      for (let j = 0; j < slice.length; j++) out[i + j] = null;
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

  // No key → leave zh fields unset so the browser dictionary fallback can run.
  if (!env?.GEMINI_API_KEY?.trim()) {
    return articles;
  }

  // Translate only the first N items to bound Gemini spend, but always return
  // the full article list so source tabs / river / totals stay complete.
  const TRANSLATE_LIMIT = 80;
  const toTranslate = articles.slice(0, TRANSLATE_LIMIT);
  const titles = toTranslate.map((a) => a.title);
  const summaries = toTranslate.map((a) => a.summary || a.title);
  const relatedTitles: string[] = [];
  const relatedIndex: Array<{ articleIdx: number; relatedIdx: number }> = [];

  toTranslate.forEach((a, articleIdx) => {
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

  return articles.map((article, i) => {
    if (i >= TRANSLATE_LIMIT) {
      return article;
    }

    const relatedStories = (article.relatedStories || []).slice(0, 4).map((r, relatedIdx) => {
      const flatIdx = relatedIndex.findIndex(
        (x) => x.articleIdx === i && x.relatedIdx === relatedIdx
      );
      const relatedZh =
        r.titleZh || (flatIdx >= 0 ? relatedZhList[flatIdx] || undefined : undefined);
      return relatedZh ? { ...r, titleZh: relatedZh } : { ...r };
    });

    const titleZh = article.titleZh || titleZhList[i] || undefined;
    const summaryZh = article.summaryZh || summaryZhList[i] || undefined;

    return {
      ...article,
      ...(titleZh ? { titleZh } : {}),
      ...(summaryZh ? { summaryZh } : {}),
      relatedStories
    };
  });
}
