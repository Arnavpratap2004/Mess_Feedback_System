import bcrypt from 'bcryptjs';
import { json } from '@/lib/cors.ts';
import { signToken, type AuthUser } from '@/lib/auth.ts';
import { getPrisma } from '@/lib/prisma.ts';
import { adminLoginSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

export async function POST(request: Request) {
  try {
    const parsed = adminLoginSchema.safeParse(await request.json().catch(() => ({})));

    if (!parsed.success) {
      return json(request, { message: formatIssues(parsed.error) }, 400);
    }

    const prisma = await getPrisma();
    const admin = await prisma.admin.findUnique({
      where: { employee_id: parsed.data.employee_id },
    });

    // Compare against a dummy hash when the admin is missing so that a wrong
    // employee_id and a wrong password take the same amount of time.
    const hash = admin?.admin_password ?? '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi';
    const passwordMatch = await bcrypt.compare(parsed.data.password, hash);

    if (!admin || !passwordMatch) {
      return json(request, { message: 'Invalid credentials' }, 401);
    }

    const user: AuthUser = {
      id: admin.id,
      type: 'admin',
      employee_id: admin.employee_id,
      name: admin.admin_name,
    };

    return json(request, {
      message: 'Admin logged in successfully',
      user,
      token: signToken(user),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return json(request, { message: 'Server error', error: (error as Error).message }, 500);
  }
}
