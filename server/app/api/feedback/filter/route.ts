import { json } from '@/lib/cors.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { findFeedback, getStats, toStatisticsPayload } from '@/lib/feedback.ts';
import { feedbackFilterSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function GET(request: Request) {
  try {
    const admin = requireAdmin(request);

    if (admin instanceof Response) {
      return admin;
    }

    const query = Object.fromEntries(new URL(request.url).searchParams);
    const parsed = feedbackFilterSchema.safeParse(query);

    if (!parsed.success) {
      return json(request, { message: formatIssues(parsed.error) }, 400);
    }

    const [feedbackList, stats] = await Promise.all([findFeedback(parsed.data), getStats()]);

    return json(request, {
      statistics: toStatisticsPayload(stats),
      filteredCount: feedbackList.length,
      feedbackList,
    });
  } catch (error) {
    console.error('Filter feedback error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
