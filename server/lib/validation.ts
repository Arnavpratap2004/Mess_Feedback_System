import { z } from 'zod';

/**
 * The MySQL schema enforced these as ENUM columns. Postgres columns are plain
 * varchars now, so the allowed values are checked here instead.
 */
export const MESS_TYPES = ['Veg', 'Non-Veg', 'Special', 'Night'] as const;
export const CATEGORIES = ['Quality', 'Quantity', 'Hygiene', 'Mess Timing', 'Others'] as const;

// The feedback form's radio buttons send "Night mess" and "Mess timing", which
// never matched the old ENUM — those submissions failed on insert. The values
// in index.html are fixed, and these aliases keep any older client working.
const MESS_TYPE_ALIASES: Record<string, (typeof MESS_TYPES)[number]> = {
  'night mess': 'Night',
  night: 'Night',
  veg: 'Veg',
  'non-veg': 'Non-Veg',
  'non veg': 'Non-Veg',
  nonveg: 'Non-Veg',
  special: 'Special',
};

const CATEGORY_ALIASES: Record<string, (typeof CATEGORIES)[number]> = {
  'mess timing': 'Mess Timing',
  timing: 'Mess Timing',
  quality: 'Quality',
  quantity: 'Quantity',
  hygiene: 'Hygiene',
  others: 'Others',
  other: 'Others',
};

const messType = z
  .string()
  .transform((value) => MESS_TYPE_ALIASES[value.trim().toLowerCase()] ?? value.trim())
  .pipe(z.enum(MESS_TYPES));

const category = z
  .string()
  .transform((value) => CATEGORY_ALIASES[value.trim().toLowerCase()] ?? value.trim())
  .pipe(z.enum(CATEGORIES));

const required = (field: string) => z.string({ error: `${field} is required` }).trim().min(1, `${field} is required`);

export const adminRegisterSchema = z.object({
  employee_id: required('employee_id').max(20),
  admin_name: required('admin_name').max(100),
  password: z.string().min(6, 'password must be at least 6 characters'),
});

export const adminLoginSchema = z.object({
  employee_id: required('employee_id'),
  password: required('password'),
});

export const studentRegisterSchema = z.object({
  reg_no: required('reg_no').max(20),
  student_name: required('student_name').max(100),
  password: z.string().min(6, 'password must be at least 6 characters'),
});

export const studentLoginSchema = z.object({
  reg_no: required('reg_no'),
  password: required('password'),
});

export const feedbackSchema = z.object({
  student_reg_no: required('student_reg_no').max(20),
  student_name: required('student_name').max(100),
  block_name: required('block_name').max(50),
  room_number: required('room_number').max(20),
  mess_name: required('mess_name').max(100),
  mess_type: messType,
  category,
  feedback: required('feedback'),
  comments: z.string().nullish().transform((value) => value?.trim() || null),
  proof_path: z.string().max(255).nullish().transform((value) => value?.trim() || null),
});

export const feedbackFilterSchema = z.object({
  student_reg_no: z.string().trim().min(1).optional(),
  mess_name: z.string().trim().min(1).optional(),
  block_name: z.string().trim().min(1).optional(),
  start_date: z.string().trim().min(1).optional(),
  end_date: z.string().trim().min(1).optional(),
});

/** Flattens a Zod error into the single-line message shape the frontend shows. */
export function formatIssues(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(', ');
}
