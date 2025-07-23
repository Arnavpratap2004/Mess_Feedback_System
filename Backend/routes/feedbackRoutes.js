import express from 'express';
import FeedbackController from '../controller/feedbackController.js';

const router = express.Router();

const isAuthenticated = (req, res, next) => {
  // Check for session authentication first
  if (req.session && req.session.user) {
    return next();
  }
  
  // Fallback to header-based authentication
  const userId = req.headers['x-user-id'];
  const userType = req.headers['x-user-type'];
  
  if (userId && userType) {
    // Create a session user from headers
    req.session.user = {
      id: userId,
      type: userType
    };
    console.log('Authentication via headers successful');
    return next();
  }
  
  // No authentication found
  return res.status(401).json({ 
    message: 'Unauthorized. Please login first.',
    details: 'Your session may have expired or you are not logged in.' 
  });
};

const isAdmin = (req, res, next) => {
  // Check for session-based admin authentication
  if (req.session && req.session.user && req.session.user.type === 'admin') {
    return next();
  }
  
  // Check for header-based admin authentication
  const userId = req.headers['x-user-id'];
  const userType = req.headers['x-user-type'];
  
  if (userId && userType === 'admin') {
    // Create a session if using header auth
    req.session.user = {
      id: userId,
      type: 'admin'
    };
    console.log('Admin authentication via headers successful');
    return next();
  }
  
  // No admin authentication found
  return res.status(403).json({ 
    message: 'Access denied. Admin privileges required.',
    details: 'You must be logged in as an administrator to access this resource.'
  });
};

// Protected routes with authentication
router.post('/submit', isAuthenticated, FeedbackController.submitFeedback);

// Admin-only routes
router.get('/filter', isAuthenticated, isAdmin, FeedbackController.getFilteredFeedback);
router.get('/admin/all', isAuthenticated, isAdmin, FeedbackController.getAllFeedback);
router.get('/export/pdf', isAuthenticated, isAdmin, FeedbackController.exportToPDF);
router.get('/export/excel', isAuthenticated, isAdmin, FeedbackController.exportToExcel);

// Make sure this route is AFTER the more specific routes to avoid conflicts
router.get('/:id', isAuthenticated, FeedbackController.getFeedbackById);

export default router; 