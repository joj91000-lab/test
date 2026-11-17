// POST /api/translate — server-side Gemini translation (key from Cloudflare secrets / env)
import { enrichArticlesWithZh, translateTexts, type GeminiEnv } from '../utils/geminiTranslate';

export async function onRequestPost(context: { request: Request; env: GeminiEnv }) {
  const { request, env } = context;

  if (!env?.GEMINI_API_KEY) {
    return new Response(JSON.stringify({
      success: false,
      error: 'GEMINI_API_KEY is not configured on the server'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  try {
    const body = await request.json() as any;
    const kind = body?.kind === 'summary' ? 'summary' : 'title';

    if (Array.isArray(body?.texts)) {
      const texts = body.texts.map((t: unknown) => String(t || '')).slice(0, 40);
      const data = await translateTexts(env, texts, kind);
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    if (Array.isArray(body?.articles)) {
      const data = await enrichArticlesWithZh(env, body.articles.slice(0, 40));
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Provide { texts: string[], kind? } or { articles: [...] }'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'translate failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }
}
