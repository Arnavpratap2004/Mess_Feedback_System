import { json } from '@/lib/cors.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { findFeedback, getStats, toStatisticsPayload } from '@/lib/feedback.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);

    if (admin instanceof Response) {
      return admin;
    }

    const [feedbackList, stats] = await Promise.all([findFeedback({}), getStats()]);

    return json(request, {
      statistics: toStatisticsPayload(stats),
      count: feedbackList.length,
      feedbackList,
    });
  } catch (error) {
    console.error('Fetch all feedback error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
