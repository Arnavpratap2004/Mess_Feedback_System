/**
 * Ports the rows from the original MySQL dump (Backend/sql/tables.sql) into
 * Postgres. Password hashes are copied across unchanged — bcrypt hashes are
 * portable, so everyone's existing password still works.
 *
 * Safe to run more than once: every row is upserted by its unique key.
 *
 * Run with:  npm run seed
 */
import { PrismaClient } from '../generated/prisma/client.ts';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is not set. Create server/.env from .env.example first.');
}

const prisma = url.startsWith('prisma+postgres://')
  ? new PrismaClient({ accelerateUrl: url })
  : new PrismaClient({
      adapter: new (await import('@prisma/adapter-pg')).PrismaPg({ connectionString: url }),
    });

// The dump's timestamps were written by a MySQL server running in IST.
const IST = '+05:30';
const at = (value: string) => new Date(`${value.replace(' ', 'T')}${IST}`);

const admins = [
  { id: 1, admin_name: 'admin', employee_id: 'Emp101', admin_password: '$2b$10$t2..29DUyVnzXoBQOz0dpuAu7vOW2tom1JDvVnZyD8QWG5t02wLri' },
  { id: 2, admin_name: 'Admin2', employee_id: 'Emp102', admin_password: '$2b$10$HWedxkuISu./Co9hOtQkie.G8hdGNj.QlmAXqRCyU7PmbZJHiypE6' },
];

const students = [
  { id: 1, student_name: 'Sarthak Verma', reg_no: '23BCE2354', student_password: '$2b$10$2tpJ9QNrx0AHsWHco81XM.OwMLT1ajSbG7Bv3UmU3M92/CJbGEsNu' },
  { id: 2, student_name: 'Arnav Pratap', reg_no: '23BCE0891', student_password: '$2b$10$uThjO6E5UdEk.GL./Xi2Tuwlz1Hh6p492AhMWfUVAFfDpXkJrJKnG' },
  { id: 3, student_name: 'Abhigyan Prakhar', reg_no: '23BCE0233', student_password: '$2b$10$5P7.07bGrZo8eLGDLhPTgOzGUqjtE/1EwJFCnBEqcHzT9TBr0Li8.' },
  { id: 4, student_name: 'Raghav Seth', reg_no: '23BIT0254', student_password: '$2b$10$zInnNUek4VmA4seAbXjjGuHyFh2yPJ4gCjm8EQ759YLO45rsMc4Uq' },
  { id: 5, student_name: 'Student2', reg_no: '23BCE0000', student_password: '$2b$10$6q85FaXItXAvPDhfSbr5GOAF0w/FBtT0Ui0I2gWs.u/lNcUeaM/KC' },
];

const feedbacks = [
  { id: 1, student_reg_no: '23BCE2354', student_name: 'Sarthak Verma', block_name: 'L', room_number: '606', mess_name: 'L-Special', mess_type: 'Special', category: 'Quality', feedback: 'Quality is very poor', comments: 'The food is tasteless and the quality is not upto the mark', proof_path: 'https://qph.cf2.quoracdn.net/main-qimg-cb93d6e1cfd45e3cc4e556dde3ffdda5-lq', submitted_at: at('2025-04-02 11:24:27') },
  { id: 2, student_reg_no: '23BCE0891', student_name: 'Arnav Pratap', block_name: 'K', room_number: '123', mess_name: 'K- Non Veg', mess_type: 'Non-Veg', category: 'Quantity', feedback: 'Quantity is very less', comments: 'The food is in very less quantity, even if I ask for more they refuse', proof_path: null, submitted_at: at('2025-04-02 11:33:27') },
  { id: 3, student_reg_no: '23BCE0233', student_name: 'Abhigyan Prakhar', block_name: 'L', room_number: '606', mess_name: 'L-Veg', mess_type: 'Veg', category: 'Hygiene', feedback: 'Maintain cleanliness in mess', comments: 'found hair in food', proof_path: null, submitted_at: at('2025-04-02 13:01:19') },
  { id: 4, student_reg_no: '23BIT0254', student_name: 'Raghav Seth', block_name: 'Q', room_number: '1109', mess_name: 'Q-Veg', mess_type: 'Veg', category: 'Others', feedback: 'Behaviour must be proper', comments: 'Very rude staff', proof_path: null, submitted_at: at('2025-04-02 13:04:23') },
  { id: 5, student_reg_no: '23BCE2354', student_name: 'Sarthak Verma', block_name: 'L', room_number: '606', mess_name: 'L-Paid', mess_type: 'Special', category: 'Quantity', feedback: 'Quantity is very less', comments: 'Quantity is very less', proof_path: null, submitted_at: at('2025-04-02 13:20:08') },
];

async function main() {
  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { employee_id: admin.employee_id },
      update: {},
      create: admin,
    });
  }

  for (const student of students) {
    await prisma.student.upsert({
      where: { reg_no: student.reg_no },
      update: {},
      create: student,
    });
  }

  for (const feedback of feedbacks) {
    await prisma.feedback.upsert({
      where: { id: feedback.id },
      update: {},
      create: feedback,
    });
  }

  // The rows above carry explicit ids, which leaves each table's identity
  // sequence behind. Without this the next insert would collide on the primary key.
  for (const table of ['admins', 'students', 'feedback']) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
    );
  }

  console.log(
    `Seeded ${admins.length} admins, ${students.length} students, ${feedbacks.length} feedback entries.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
