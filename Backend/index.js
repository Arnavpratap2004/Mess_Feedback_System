import express from 'express';
import connectDB from './db/index.js';
import session from 'express-session';
import AuthRoutes from './routes/authRoutes.js';
import FeedbackRoutes from './routes/feedbackRoutes.js';
import cors from 'cors';

const PORT = process.env.PORT || 8080;

const app = express();

// Configure CORS to be more permissive during development
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-User-ID', 'X-User-Type']
}));

app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); 

// Session configuration with more reliable settings
app.use(session({
    secret: 'QWERTY',
    resave: true,
    saveUninitialized: true,
    cookie: { 
      secure: false, // set to true if using HTTPS
      sameSite: 'lax', // Most compatible setting
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
}));

// Basic route for API status check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Initialize DB connection
(async () => {
  try {
    await connectDB();
    
    // Register routes
    app.use('/auth', AuthRoutes);
    app.use('/feedback', FeedbackRoutes);
    
    // Basic route for testing
    app.get('/test', (req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'API is running correctly',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });
    
    // Log server startup
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Test API connection at http://localhost:${PORT}/test`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});