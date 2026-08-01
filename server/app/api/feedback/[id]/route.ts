import { json } from '@/lib/cors.ts';
import { requireAuth } from '@/lib/auth.ts';
import { getPrisma } from '@/lib/prisma.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = requireAuth(request);

    if (user instanceof Response) {
      return user;
    }

    const { id } = await context.params;
    const feedbackId = Number(id);

    if (!Number.isInteger(feedbackId) || feedbackId < 1) {
      return json(request, { message: 'Feedback ID must be a positive integer' }, 400);
    }

    const prisma = await getPrisma();
    const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });

    if (!feedback) {
      return json(request, { message: 'Feedback not found' }, 404);
    }

    // Students may only read their own submissions; admins see everything.
    if (user.type !== 'admin' && feedback.student_reg_no !== user.reg_no) {
      return json(request, { message: 'Access denied' }, 403);
    }

    return json(request, { feedback });
  } catch (error) {
    console.error('Fetch feedback by id error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
