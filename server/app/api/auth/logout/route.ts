import { json } from '@/lib/cors.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

/**
 * Tokens are stateless, so logging out just means the client discards its
 * token. This endpoint exists so the frontend's logout flow keeps working.
 */
export function POST(request: Request) {
  return json(request, { message: 'Logged out successfully' });
}
