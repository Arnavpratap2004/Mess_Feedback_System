import { json } from '@/lib/cors.ts';
import { requireAuth } from '@/lib/auth.ts';
import { getPrisma } from '@/lib/prisma.ts';
import { feedbackSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function POST(request: Request) {
  try {
    const user = requireAuth(request);

    if (user instanceof Response) {
      return user;
    }

    const parsed = feedbackSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return json(
        request,
        {
          message: 'Missing required fields',
          details: formatIssues(parsed.error),
          required:
            'student_reg_no, student_name, block_name, room_number, mess_name, mess_type, category, feedback',
        },
        400
      );
    }

    // A student may only file feedback under their own registration number;
    // the old version took whatever the request body claimed.
    const data =
      user.type === 'student' && user.reg_no
        ? { ...parsed.data, student_reg_no: user.reg_no, student_name: user.name }
        : parsed.data;

    const prisma = await getPrisma();
    const feedback = await prisma.feedback.create({ data });

    return json(request, { message: 'Feedback submitted successfully', feedback }, 201);
  } catch (error) {
    // Foreign key violation: no student row with that registration number.
    if ((error as { code?: string }).code === 'P2003') {
      return json(
        request,
        {
          message: 'Unknown student registration number',
          details: 'Register the student before submitting feedback for them.',
        },
        400
      );
    }

    console.error('Feedback submission error:', error);
    return json(
      request,
      { message: 'Server error during feedback submission', error: (error as Error).message },
      500
    );
  }
}
