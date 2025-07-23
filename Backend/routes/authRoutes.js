import express from 'express';
import AuthController from '../controller/authController.js';

const router = express.Router();

// Admin routes
router.post('/admin/login', AuthController.adminLogin);
router.post('/admin/register', AuthController.registerAdmin);

// Student routes
router.post('/student/login', AuthController.studentLogin);
router.post('/student/register', AuthController.registerStudent);
// Common routes
router.post('/logout', AuthController.logout);

router.get('/check-auth', (req, res) => {
  // Check for existing session
  if (req.session && req.session.user) {
    return res.json({ 
      isAuthenticated: true, 
      user: req.session.user,
      sessionID: req.sessionID 
    });
  }
  
  // If no session but headers contain auth info, restore the session
  const userId = req.headers['x-user-id'];
  const userType = req.headers['x-user-type'];
  
  if (userId && userType) {
    // Restore session from headers
    req.session.user = {
      id: userId,
      type: userType
    };
    
    console.log('Session restored from headers:', req.session.user);
    
    return res.json({ 
      isAuthenticated: true, 
      user: req.session.user,
      sessionID: req.sessionID,
      restored: true
    });
  }
  
  // No session and no restoration possible
  return res.json({ 
    isAuthenticated: false,
    sessionID: req.sessionID || 'No session' 
  });
});

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Example of protected route
router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.session.user });
});

export default router;