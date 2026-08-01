import ExcelJS from 'exceljs';
import { file, json } from '@/lib/cors.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { findFeedback } from '@/lib/feedback.ts';
import { feedbackFilterSchema, formatIssues } from '@/lib/validation.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export { preflight as OPTIONS } from '@/lib/cors.ts';

const COLUMNS = [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Student Reg No', key: 'student_reg_no', width: 15 },
  { header: 'Student Name', key: 'student_name', width: 20 },
  { header: 'Block Name', key: 'block_name', width: 15 },
  { header: 'Room Number', key: 'room_number', width: 15 },
  { header: 'Mess Name', key: 'mess_name', width: 15 },
  { header: 'Mess Type', key: 'mess_type', width: 15 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'Feedback', key: 'feedback', width: 30 },
  { header: 'Comments', key: 'comments', width: 30 },
  { header: 'Submitted At', key: 'submitted_at', width: 20 },
];

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

    const filters = parsed.data;
    const feedbackData = await findFeedback(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Mess Feedback System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Feedback Data');
    worksheet.columns = COLUMNS;
    worksheet.getRow(1).font = { bold: true };

    const filterRow = worksheet.addRow(['Filter Criteria:']);
    filterRow.font = { bold: true, size: 14 };

    if (filters.student_reg_no) worksheet.addRow(['Student Reg No:', filters.student_reg_no]);
    if (filters.mess_name) worksheet.addRow(['Mess Name:', filters.mess_name]);
    if (filters.block_name) worksheet.addRow(['Block Name:', filters.block_name]);
    if (filters.start_date) worksheet.addRow(['Start Date:', filters.start_date]);
    if (filters.end_date) worksheet.addRow(['End Date:', filters.end_date]);

    if (Object.keys(filters).length === 0) {
      worksheet.addRow(['No filters applied - Showing all feedback']);
    }

    worksheet.addRow(['Total Records:', feedbackData.length]);
    worksheet.addRow(['Generated On:', new Date().toLocaleString()]);
    worksheet.addRow([]);

    const headerRow = worksheet.addRow(COLUMNS.map((column) => column.header));
    headerRow.font = { bold: true };

    for (const item of feedbackData) {
      worksheet.addRow({
        id: item.id,
        student_reg_no: item.student_reg_no,
        student_name: item.student_name,
        block_name: item.block_name,
        room_number: item.room_number,
        mess_name: item.mess_name,
        mess_type: item.mess_type,
        category: item.category,
        feedback: item.feedback,
        comments: item.comments,
        submitted_at: item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'N/A',
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return file(
      request,
      new Uint8Array(buffer as ArrayBuffer),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'feedback-report.xlsx'
    );
  } catch (error) {
    console.error('Excel Export Error:', error);
    return json(
      request,
      { message: 'Error generating Excel file', error: (error as Error).message },
      500
    );
  }
}
