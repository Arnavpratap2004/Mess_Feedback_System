import Admin from '../models/admin.js';
import Student from '../models/student.js';
import bcrypt from 'bcrypt'; // For password hashing

class AuthController {
  // Admin Registration
  static async registerAdmin(req, res) {
    try {
      const { employee_id, admin_name, password } = req.body;

      // Validate required fields
      if (!employee_id || !admin_name || !password) {
        return res.status(400).json({ message: 'All fields are required: employee_id, admin_name, password' });
      }

      // Check if admin already exists
      const existingAdmin = await Admin.findByEmployeeId(employee_id);
      if (existingAdmin) {
        return res.status(400).json({ message: 'Admin already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new admin
      const newAdmin = await Admin.create({
        employee_id,
        admin_name,
        admin_password: hashedPassword
      });

      res.status(201).json({ message: 'Admin registered successfully', admin: newAdmin });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Student Registration
  static async registerStudent(req, res) {
    try {
      const { reg_no, student_name, password } = req.body;

      // Validate required fields
      if (!reg_no || !student_name || !password) {
        return res.status(400).json({ message: 'All fields are required: reg_no, student_name, password' });
      }

      // Check if student already exists
      const existingStudent = await Student.findByRegNo(reg_no);
      if (existingStudent) {
        return res.status(400).json({ message: 'Student already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new student
      const newStudent = await Student.create({
        reg_no,
        student_name,
        student_password: hashedPassword
      });

      res.status(201).json({ message: 'Student registered successfully', student: newStudent });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Admin Login
  static async adminLogin(req, res) {
    try {
      console.log('Admin login attempt with body:', req.body);
      const { employee_id, password } = req.body;
      
      // Validate required fields
      if (!employee_id || !password) {
        return res.status(400).json({ message: 'All fields are required: employee_id, password' });
      }
      
      const admin = await Admin.findByEmployeeId(employee_id);
      console.log('Admin found:', admin ? 'Yes' : 'No');
      
      if (!admin) {
        return res.status(401).json({ message: 'Invalid credentials - admin not found' });
      }
      
      const passwordMatch = await bcrypt.compare(password, admin.admin_password);
      console.log('Password match:', passwordMatch ? 'Yes' : 'No');
      
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials - password mismatch' });
      }

      // Create session with admin data
      req.session.user = {
        id: admin.id,
        type: 'admin',
        employee_id: admin.employee_id,
        name: admin.admin_name
      };
      
      // Force session save to ensure it's stored before responding
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Session error', error: err.message });
        }
        
        console.log('Admin session created successfully:', req.session.user);
        res.json({ 
          message: 'Admin logged in successfully', 
          user: req.session.user,
          sessionID: req.sessionID
        });
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Student Login
  static async studentLogin(req, res) {
    try {
      const { reg_no, password } = req.body;
      
      // Validate required fields
      if (!reg_no || !password) {
        return res.status(400).json({ message: 'All fields are required: reg_no, password' });
      }
      
      const student = await Student.findByRegNo(reg_no);
      if (!student || !(await bcrypt.compare(password, student.student_password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      req.session.user = {
        id: student.id,
        type: 'student',
        reg_no: student.reg_no,
        name: student.student_name
      };
      res.json({ message: 'Student logged in successfully', user: req.session.user });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Logout (common for both admin and student)
  static async logout(req, res) {
    try {
      if (!req.session) {
        return res.status(400).json({ message: 'No active session' });
      }
      
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Check authentication status
  static async checkAuth(req, res) {
    try {
      if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
      } else {
        res.json({ isAuthenticated: false });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

export default AuthController;