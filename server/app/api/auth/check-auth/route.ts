import { json } from '@/lib/cors.ts';
import { getUser } from '@/lib/auth.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export function GET(request: Request) {
  const user = getUser(request);

  return user
    ? json(request, { isAuthenticated: true, user })
    : json(request, { isAuthenticated: false });
}
