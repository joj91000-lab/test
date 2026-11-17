// Cloudflare Pages Function for /api/comments

export async function onRequestGet({ request }: { request: Request }) {
  const url = new URL(request.url);
  const newsId = url.searchParams.get('newsId');

  // Return empty list or defaults; clients store/merge local comments in localStorage
  return new Response(JSON.stringify({
    success: true,
    data: []
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

export async function onRequestPost({ request }: { request: Request }) {
  try {
    const body = await request.json() as any;
    const { newsId, author, content } = body || {};

    if (!newsId || !content || !content.trim()) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const colors = ['#0284c7', '#7c3aed', '#059669', '#d97706', '#e11d48', '#2563eb'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      newsId,
      author: (author && author.trim()) || '熱心科技讀者',
      avatarBg: randomColor,
      content: content.trim(),
      createdAt: '剛剛',
      timestamp: Date.now(),
      upvotes: 1
    };

    return new Response(JSON.stringify({
      success: true,
      data: newComment
    }), {
      status: 201,
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
