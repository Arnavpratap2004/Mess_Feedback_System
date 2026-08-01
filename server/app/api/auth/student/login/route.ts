import bcrypt from 'bcryptjs';
import { json } from '@/lib/cors.ts';
import { signToken, type AuthUser } from '@/lib/auth.ts';
import { getPrisma } from '@/lib/prisma.ts';
import { studentLoginSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function POST(request: Request) {
  try {
    const parsed = studentLoginSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return json(request, { message: formatIssues(parsed.error) }, 400);
    }

    const prisma = await getPrisma();
    const student = await prisma.student.findUnique({
      where: { reg_no: parsed.data.reg_no },
    });

    const hash =
      student?.student_password ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
    const passwordMatch = await bcrypt.compare(parsed.data.password, hash);

    if (!student || !passwordMatch) {
      return json(request, { message: 'Invalid credentials' }, 401);
    }

    const user: AuthUser = {
      id: student.id,
      type: 'student',
      reg_no: student.reg_no,
      name: student.student_name,
    };

    return json(request, {
      message: 'Student logged in successfully',
      user,
      token: signToken(user),
    });
  } catch (error) {
    console.error('Student login error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
