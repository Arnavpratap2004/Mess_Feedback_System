import bcrypt from 'bcryptjs';
import { json } from '@/lib/cors.ts';
import { getPrisma } from '@/lib/prisma.ts';
import { adminRegisterSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function POST(request: Request) {
  try {
    const parsed = adminRegisterSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return json(request, { message: formatIssues(parsed.error) }, 400);
    }

    const { employee_id, admin_name, password } = parsed.data;
    const prisma = await getPrisma();

    if (await prisma.admin.findUnique({ where: { employee_id } })) {
      return json(request, { message: 'Admin already registered' }, 400);
    }

    const admin = await prisma.admin.create({
      data: {
        employee_id,
        admin_name,
        admin_password: await bcrypt.hash(password, 10),
      },
      select: { id: true, employee_id: true, admin_name: true },
    });

    return json(request, { message: 'Admin registered successfully', admin }, 201);
  } catch (error) {
    console.error('Admin registration error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
