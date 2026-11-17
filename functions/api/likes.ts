// Cloudflare Pages Function for /api/likes

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json() as any;
    const { newsId, liked } = body || {};
    
    if (!newsId) {
      return new Response(JSON.stringify({ success: false, error: 'Missing newsId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In serverless Cloudflare Workers, state is mirrored client-side in localStorage
    return new Response(JSON.stringify({
      success: true,
      newsId,
      liked: Boolean(liked),
      message: 'Like state updated'
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
