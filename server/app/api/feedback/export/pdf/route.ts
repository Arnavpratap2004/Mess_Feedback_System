import PDFDocument from 'pdfkit';
import { file, json } from '@/lib/cors.ts';
import { requireAdmin } from '@/lib/auth.ts';
import { findFeedback } from '@/lib/feedback.ts';
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

    const filters = parsed.data;
    const feedbackData = await findFeedback(filters);

    // There is no response stream to pipe into here, so buffer the document
    // and send it in one piece.
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const rendered = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    doc.fontSize(20).text('Mess Feedback Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(14).text('Filter Criteria:', { underline: true });
    doc.fontSize(12);

    if (filters.student_reg_no) doc.text(`Student Reg No: ${filters.student_reg_no}`);
    if (filters.mess_name) doc.text(`Mess Name: ${filters.mess_name}`);
    if (filters.block_name) doc.text(`Block Name: ${filters.block_name}`);
    if (filters.start_date) doc.text(`From Date: ${filters.start_date}`);
    if (filters.end_date) doc.text(`To Date: ${filters.end_date}`);

    if (Object.keys(filters).length === 0) {
      doc.text('No filters applied - Showing all feedback');
    }

    doc.moveDown();
    doc.text(`Total Feedback Entries: ${feedbackData.length}`);
    doc.moveDown();

    if (feedbackData.length > 0) {
      const columns = [
        { title: 'Reg No', width: 70 },
        { title: 'Name', width: 100 },
        { title: 'Mess', width: 80 },
        { title: 'Category', width: 80 },
        { title: 'Date', width: 90 },
      ];

      const drawHeader = (top: number) => {
        let x = 50;
        doc.font('Helvetica-Bold');
        for (const column of columns) {
          doc.text(column.title, x, top);
          x += column.width;
        }
        doc.font('Helvetica');
      };

      const tableTop = doc.y + 20;
      drawHeader(tableTop);

      let y = tableTop + 20;

      for (const item of feedbackData) {
        if (y > doc.page.height - 50) {
          doc.addPage();
          y = 50;
          drawHeader(y);
          y += 20;
        }

        const cells = [
          item.student_reg_no ?? '',
          item.student_name ?? '',
          item.mess_name ?? '',
          item.category ?? '',
          item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'N/A',
        ];

        let x = 50;
        cells.forEach((value, index) => {
          doc.text(value, x, y, { width: columns[index].width });
          x += columns[index].width;
        });

        y += 20;
      }
    } else {
      doc.text('No feedback entries found matching the criteria.');
    }

    doc.end();

    return file(request, await rendered, 'application/pdf', 'feedback-report.pdf');
  } catch (error) {
    console.error('PDF Export Error:', error);
    return json(request, { message: 'Error generating PDF', error: (error as Error).message }, 500);
  }
}
