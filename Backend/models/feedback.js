import connectDB from "../db/index.js";

class Feedback {
  // Create a new feedback entry
  static async create({
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
  }) {
    try {
      // Validate required parameters
      if (!student_reg_no || !student_name || !block_name || !room_number || 
          !mess_name || !mess_type || !category || !feedback) {
        throw new Error('Missing required fields for feedback submission');
      }

      const pool = await connectDB();
      const [result] = await pool.execute(
        `INSERT INTO feedback (
          student_reg_no, student_name, block_name, room_number, mess_name, 
          mess_type, category, feedback, comments, proof_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student_reg_no,
          student_name,
          block_name,
          room_number,
          mess_name,
          mess_type,
          category,
          feedback,
          comments || null, // Optional field
          proof_path || null // Optional field
        ]
      );
      return { id: result.insertId, student_reg_no, student_name, feedback };
    } catch (err) {
      throw err;
    }
  }

  // Find feedback by ID
  static async findById(id) {
    try {
      if (!id) {
        throw new Error('Feedback ID must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM feedback WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  // Get all feedback for a student by registration number
  static async findByStudentRegNo(student_reg_no) {
    try {
      if (!student_reg_no) {
        throw new Error('Student registration number must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM feedback WHERE student_reg_no = ?', [student_reg_no]);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Get all feedback entries (e.g., for admin view)
  static async getAll() {
    try {
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM feedback ORDER BY submitted_at DESC');
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Get filtered feedback based on various parameters
  static async getFilteredFeedback({
    student_reg_no = null,
    mess_name = null,
    block_name = null,
    start_date = null,
    end_date = null
  }) {
    try {
      const pool = await connectDB();
      
      // Build dynamic query and parameters
      let query = 'SELECT * FROM feedback WHERE 1=1';
      const params = [];
      
      // Add filters if provided
      if (student_reg_no) {
        query += ' AND student_reg_no = ?';
        params.push(student_reg_no);
      }
      
      if (mess_name) {
        query += ' AND mess_name = ?';
        params.push(mess_name);
      }
      
      if (block_name) {
        query += ' AND block_name = ?';
        params.push(block_name);
      }
      
      if (start_date) {
        query += ' AND submitted_at >= ?';
        params.push(start_date);
      }
      
      if (end_date) {
        query += ' AND submitted_at <= ?';
        params.push(end_date);
      }
      
      // Add order by clause
      query += ' ORDER BY submitted_at DESC';
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (err) {
      throw err;
    }
  }

  // Get total count of all feedback
  static async getTotalCount() {
    try {
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT COUNT(*) as total FROM feedback');
      return rows[0].total;
    } catch (err) {
      throw err;
    }
  }

  // Get count of feedback received this week
  static async getWeeklyCount() {
    try {
      const pool = await connectDB();
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as weeklyTotal FROM feedback WHERE submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)'
      );
      return rows[0].weeklyTotal;
    } catch (err) {
      throw err;
    }
  }

  // Get count of feedback received this month
  static async getMonthlyCount() {
    try {
      const pool = await connectDB();
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as monthlyTotal FROM feedback WHERE MONTH(submitted_at) = MONTH(CURRENT_DATE()) AND YEAR(submitted_at) = YEAR(CURRENT_DATE())'
      );
      return rows[0].monthlyTotal;
    } catch (err) {
      throw err;
    }
  }

  // Get all feedback statistics at once
  static async getFeedbackStats() {
    try {
      const pool = await connectDB();
      const [rows] = await pool.execute(`
        SELECT 
          (SELECT COUNT(*) FROM feedback) as totalCount,
          (SELECT COUNT(*) FROM feedback WHERE submitted_at >= DATE_SUB(CURRENT_DATE(), INTERVAL WEEKDAY(CURRENT_DATE()) DAY)) as weeklyCount,
          (SELECT COUNT(*) FROM feedback WHERE MONTH(submitted_at) = MONTH(CURRENT_DATE()) AND YEAR(submitted_at) = YEAR(CURRENT_DATE())) as monthlyCount
      `);
      return rows[0];
    } catch (err) {
      throw err;
    }
  }
}

export default Feedback;