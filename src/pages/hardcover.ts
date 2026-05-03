import type { APIRoute } from 'astro';
import { fetchUserBooks } from '../lib/hardcover';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? '12');
    const offset = Number(url.searchParams.get('offset') ?? '0');
    const filter = (url.searchParams.get('filter') ?? 'all') as any;

    const result = await fetchUserBooks(limit, offset, filter);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ books: [], total: 0, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
