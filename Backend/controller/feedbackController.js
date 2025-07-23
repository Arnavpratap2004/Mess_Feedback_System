import Feedback from '../models/feedback.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

class FeedbackController {
  // Submit a new feedback
  static async submitFeedback(req, res) {
    try {
      // Log authentication status for debugging
      console.log('Submitting feedback with session user:', req.session.user);
      
      const { 
        student_reg_no, 
        student_name, 
        block_name, 
        room_number, 
        mess_name, 
        mess_type, 
        category, 
        feedback, 
        comments,
        proof_path
      } = req.body;

      // Validate required fields
      if (!student_reg_no || !student_name || !block_name || !room_number || 
          !mess_name || !mess_type || !category || !feedback) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: 'student_reg_no, student_name, block_name, room_number, mess_name, mess_type, category, feedback'
        });
      }

      // Create new feedback
      const newFeedback = await Feedback.create({
        student_reg_no,
        student_name,
        block_name,
        room_number,
        mess_name,
        mess_type,
        category,
        feedback,
        comments,
        proof_path
      });

      res.status(201).json({ 
        message: 'Feedback submitted successfully', 
        feedback: newFeedback 
      });
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ 
        message: 'Server error during feedback submission', 
        error: error.message,
        stack: process.env.NODE_ENV === 'production' ? null : error.stack
      });
    }
  }

  // Get feedback by ID
  static async getFeedbackById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ message: 'Feedback ID is required' });
      }
      
      const feedback = await Feedback.findById(id);
      
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' });
      }
      
      res.json({ feedback });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all feedback for a student
  static async getStudentFeedback(req, res) {
    try {
      const { reg_no } = req.params;
      
      if (!reg_no) {
        return res.status(400).json({ message: 'Student registration number is required' });
      }
      
      const feedbackList = await Feedback.findByStudentRegNo(reg_no);
      res.json({ feedbackList });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all feedback (for admin)
  static async getAllFeedback(req, res) {
    try {
      // Check if user is admin
      if (!req.session.user || req.session.user.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // Get feedback and statistics in parallel for better performance
      const [allFeedback, stats] = await Promise.all([
        Feedback.getAll(),
        Feedback.getFeedbackStats()
      ]);
      
      res.json({ 
        statistics: {
          totalFeedbacks: stats.totalCount,
          weeklyFeedbacks: stats.weeklyCount,
          monthlyFeedbacks: stats.monthlyCount
        },
        count: allFeedback.length,
        feedbackList: allFeedback 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get filtered feedback (for admin)
  static async getFilteredFeedback(req, res) {
    try {
      // Check if user is admin
      if (!req.session.user || req.session.user.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      
      // Extract filter parameters from query
      const { 
        student_reg_no, 
        mess_name, 
        block_name, 
        start_date, 
        end_date 
      } = req.query;
      
      // Format dates if provided
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : null;
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] + ' 23:59:59' : null;
      
      // Get filtered feedback and statistics in parallel
      const [filteredFeedback, stats] = await Promise.all([
        Feedback.getFilteredFeedback({
          student_reg_no,
          mess_name,
          block_name,
          start_date: formattedStartDate,
          end_date: formattedEndDate
        }),
        Feedback.getFeedbackStats()
      ]);
      
      res.json({ 
        statistics: {
          totalFeedbacks: stats.totalCount,
          weeklyFeedbacks: stats.weeklyCount,
          monthlyFeedbacks: stats.monthlyCount
        },
        filteredCount: filteredFeedback.length,
        feedbackList: filteredFeedback 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Export feedback as PDF
  static async exportToPDF(req, res) {
    try {
      console.log('PDF export requested by user:', req.session.user);
      
      // Check if user is admin
      if (!req.session.user || req.session.user.type !== 'admin') {
        console.log('PDF export access denied - user is not admin:', req.session.user);
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.',
          details: 'You must be logged in as an administrator to export data.'
        });
      }

      // Get feedback data (use the same filter logic as in getFilteredFeedback)
      const { 
        student_reg_no, 
        mess_name, 
        block_name, 
        start_date, 
        end_date 
      } = req.query;
      
      console.log('PDF export with filters:', { student_reg_no, mess_name, block_name, start_date, end_date });
      
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : null;
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] + ' 23:59:59' : null;
      
      const feedbackData = await Feedback.getFilteredFeedback({
        student_reg_no,
        mess_name,
        block_name,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });
      
      console.log(`PDF export - found ${feedbackData.length} records`);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=feedback-report.pdf');
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add report title
      doc.fontSize(20).text('Mess Feedback Report', { align: 'center' });
      doc.moveDown();
      
      // Add generated date
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
      doc.moveDown();
      
      // Add filter information if any
      doc.fontSize(14).text('Filter Criteria:', { underline: true });
      doc.fontSize(12);
      
      if (student_reg_no) doc.text(`Student Reg No: ${student_reg_no}`);
      if (mess_name) doc.text(`Mess Name: ${mess_name}`);
      if (block_name) doc.text(`Block Name: ${block_name}`);
      if (start_date) doc.text(`From Date: ${start_date}`);
      if (end_date) doc.text(`To Date: ${end_date}`);
      
      if (!student_reg_no && !mess_name && !block_name && !start_date && !end_date) {
        doc.text('No filters applied - Showing all feedback');
      }
      
      doc.moveDown();
      
      // Add total count
      doc.text(`Total Feedback Entries: ${feedbackData.length}`);
      doc.moveDown();
      
      // Start table
      if (feedbackData.length > 0) {
        // Column definitions
        const tableTop = doc.y + 20;
        const columns = [
          { title: 'Reg No', width: 70 },
          { title: 'Name', width: 100 },
          { title: 'Mess', width: 80 },
          { title: 'Category', width: 80 },
          { title: 'Date', width: 90 }
        ];
        
        // Draw table header
        let x = 50;
        doc.font('Helvetica-Bold');
        columns.forEach(column => {
          doc.text(column.title, x, tableTop);
          x += column.width;
        });
        
        // Draw table rows
        let y = tableTop + 20;
        doc.font('Helvetica');
        
        feedbackData.forEach((item, i) => {
          // Add a new page if we're about to overflow
          if (y > doc.page.height - 50) {
            doc.addPage();
            y = 50;
            
            // Redraw header on new page
            x = 50;
            doc.font('Helvetica-Bold');
            columns.forEach(column => {
              doc.text(column.title, x, y);
              x += column.width;
            });
            doc.font('Helvetica');
            y += 20;
          }
          
          x = 50;
          
          // Format date
          const submittedDate = item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : 'N/A';
          
          // Draw cells
          doc.text(item.student_reg_no || '', x, y, { width: columns[0].width });
          x += columns[0].width;
          
          doc.text(item.student_name || '', x, y, { width: columns[1].width });
          x += columns[1].width;
          
          doc.text(item.mess_name || '', x, y, { width: columns[2].width });
          x += columns[2].width;
          
          doc.text(item.category || '', x, y, { width: columns[3].width });
          x += columns[3].width;
          
          doc.text(submittedDate, x, y, { width: columns[4].width });
          
          y += 20;
        });
      } else {
        doc.text('No feedback entries found matching the criteria.');
      }
      
      // Finalize the PDF and end the stream
      doc.end();
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      res.status(500).json({ message: 'Error generating PDF', error: error.message });
    }
  }

  // Export feedback as Excel
  static async exportToExcel(req, res) {
    try {
      console.log('Excel export requested by user:', req.session.user);
      
      // Check if user is admin
      if (!req.session.user || req.session.user.type !== 'admin') {
        console.log('Excel export access denied - user is not admin:', req.session.user);
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.',
          details: 'You must be logged in as an administrator to export data.'
        });
      }

      // Get feedback data (use the same filter logic as in getFilteredFeedback)
      const { 
        student_reg_no, 
        mess_name, 
        block_name, 
        start_date, 
        end_date 
      } = req.query;
      
      console.log('Excel export with filters:', { student_reg_no, mess_name, block_name, start_date, end_date });
      
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : null;
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] + ' 23:59:59' : null;
      
      const feedbackData = await Feedback.getFilteredFeedback({
        student_reg_no,
        mess_name,
        block_name,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });
      
      console.log(`Excel export - found ${feedbackData.length} records`);

      // Create a new Excel workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Mess Feedback System';
      workbook.created = new Date();
      
      const worksheet = workbook.addWorksheet('Feedback Data');
      
      // Define columns
      worksheet.columns = [
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
        { header: 'Submitted At', key: 'submitted_at', width: 20 }
      ];
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      
      // Add filter criteria to the top of the sheet
      const filterRow = worksheet.addRow(['Filter Criteria:']);
      filterRow.font = { bold: true, size: 14 };
      
      // Add filter information
      if (student_reg_no) worksheet.addRow(['Student Reg No:', student_reg_no]);
      if (mess_name) worksheet.addRow(['Mess Name:', mess_name]);
      if (block_name) worksheet.addRow(['Block Name:', block_name]);
      if (start_date) worksheet.addRow(['Start Date:', start_date]);
      if (end_date) worksheet.addRow(['End Date:', end_date]);
      
      if (!student_reg_no && !mess_name && !block_name && !start_date && !end_date) {
        worksheet.addRow(['No filters applied - Showing all feedback']);
      }
      
      worksheet.addRow(['Total Records:', feedbackData.length]);
      worksheet.addRow(['Generated On:', new Date().toLocaleString()]);
      
      // Add empty row before data
      worksheet.addRow([]);
      
      // Add the header row again (since we added filter info at the top)
      const headerRow = worksheet.addRow(worksheet.columns.map(col => col.header));
      headerRow.font = { bold: true };
      
      // Add data rows
      feedbackData.forEach(item => {
        const rowData = {
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
          submitted_at: item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'N/A'
        };
        
        worksheet.addRow(rowData);
      });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=feedback-report.xlsx');
      
      // Write to response
      await workbook.xlsx.write(res);
      
      // End the response
      res.end();
      
    } catch (error) {
      console.error('Excel Export Error:', error);
      res.status(500).json({ message: 'Error generating Excel file', error: error.message });
    }
  }
}

export default FeedbackController; 