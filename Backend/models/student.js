import connectDB from "../db/index.js";

class Student {
  // Create a new student
  static async create({ student_name, reg_no, student_password }) {
    try {
      // Validate required parameters
      if (student_name === undefined || reg_no === undefined || student_password === undefined) {
        throw new Error('Missing required fields: student_name, reg_no, student_password must be provided');
      }
      
      const pool = await connectDB();
      const [result] = await pool.execute(
        'INSERT INTO students (student_name, reg_no, student_password) VALUES (?, ?, ?)',
        [student_name, reg_no, student_password]
      );
      return { id: result.insertId, student_name, reg_no };
    } catch (err) {
      throw err;
    }
  }

  // Find student by registration number
  static async findByRegNo(reg_no) {
    try {
      // Validate required parameter
      if (reg_no === undefined) {
        throw new Error('Registration number must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM students WHERE reg_no = ?', [reg_no]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  // Find student by ID
  static async findById(id) {
    try {
      // Validate required parameter
      if (id === undefined) {
        throw new Error('Student ID must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM students WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }
}

export default Student;