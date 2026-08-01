import express from 'express';
import session from 'express-session';
import AuthRoutes from './routes/authRoutes.js';
import FeedbackRoutes from './routes/feedbackRoutes.js';
import cors from 'cors';

const PORT = process.env.PORT || 8080;

// On Vercel the app runs as a serverless function, so there is no port to bind
// and cookies are sent cross-site from the frontend's domain.
const isServerless = Boolean(process.env.VERCEL);

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

// Session configuration with more reliable settings.
// Note: the default MemoryStore does not survive between serverless invocations,
// so on Vercel every request re-derives the user from the X-User-ID /
// X-User-Type headers (see the isAuthenticated middleware in the routes).
app.use(session({
    secret: process.env.SESSION_SECRET || 'QWERTY',
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: isServerless, // HTTPS only once deployed
      sameSite: isServerless ? 'none' : 'lax', // 'none' is required for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true
    }
}));

// Basic route for API status check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const testHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running correctly',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

// Register routes. The database pool is created lazily on the first query,
// so there is nothing to await before the app can serve requests.
//
// Everything is mounted twice: once at the original paths, and once under
// /api. The deployed Next.js backend serves /api/..., so the frontend asks for
// /api/auth/... — mounting both lets this server stand in for it locally
// without touching script.js.
for (const prefix of ['', '/api']) {
  app.use(`${prefix}/auth`, AuthRoutes);
  app.use(`${prefix}/feedback`, FeedbackRoutes);
  app.get(`${prefix}/test`, testHandler);
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (!isServerless) {
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
}

export default app;
