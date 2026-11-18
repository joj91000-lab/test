// Cloudflare Pages Function for POST /api/comments/:id/upvote
// In-memory upvote echo for edge (no durable store); keeps UI from 404ing.

export async function onRequestPost({ params }: { params: { id?: string } }) {
  const id = params?.id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing comment id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  return new Response(JSON.stringify({
    success: true,
    data: {
      id,
      upvotes: 1
    }
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
