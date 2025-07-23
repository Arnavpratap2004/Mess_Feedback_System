import connectDB from "../db/index.js";

class Admin {
  // Create a new admin
  static async create({ admin_name, employee_id, admin_password }) {
    try {
      // Validate required parameters
      if (admin_name === undefined || employee_id === undefined || admin_password === undefined) {
        throw new Error('Missing required fields: admin_name, employee_id, admin_password must be provided');
      }
      
      const pool = await connectDB();
      const [result] = await pool.execute(
        'INSERT INTO admins (admin_name, employee_id, admin_password) VALUES (?, ?, ?)',
        [admin_name, employee_id, admin_password]
      );
      return { id: result.insertId, admin_name, employee_id };
    } catch (err) {
      throw err;
    }
  }

  // Find admin by employee ID
  static async findByEmployeeId(employee_id) {
    try {
      // Validate required parameter
      if (employee_id === undefined) {
        throw new Error('Employee ID must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM admins WHERE employee_id = ?', [employee_id]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }

  // Find admin by ID
  static async findById(id) {
    try {
      // Validate required parameter
      if (id === undefined) {
        throw new Error('Admin ID must be provided');
      }
      
      const pool = await connectDB();
      const [rows] = await pool.execute('SELECT * FROM admins WHERE id = ?', [id]);
      return rows[0] || null;
    } catch (err) {
      throw err;
    }
  }
}

export default Admin;