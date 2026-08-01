import { json } from '@/lib/cors.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export function GET(request: Request) {
  return json(request, {
    status: 'success',
    message: 'API is running correctly',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
}
