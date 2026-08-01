import bcrypt from 'bcryptjs';
import { json } from '@/lib/cors.ts';
import { getPrisma } from '@/lib/prisma.ts';
import { studentRegisterSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function POST(request: Request) {
  try {
    const parsed = studentRegisterSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return json(request, { message: formatIssues(parsed.error) }, 400);
    }

    const { reg_no, student_name, password } = parsed.data;
    const prisma = await getPrisma();

    if (await prisma.student.findUnique({ where: { reg_no } })) {
      return json(request, { message: 'Student already registered' }, 400);
    }

    const student = await prisma.student.create({
      data: {
        reg_no,
        student_name,
        student_password: await bcrypt.hash(password, 10),
      },
      select: { id: true, reg_no: true, student_name: true },
    });

    return json(request, { message: 'Student registered successfully', student }, 201);
  } catch (error) {
    console.error('Student registration error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
