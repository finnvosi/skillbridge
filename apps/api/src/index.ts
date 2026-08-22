import dotenv from 'dotenv';

// Load environment variables FIRST so appConfig picks up correct port/JWT values
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { appConfig } from '@skillbridge/config';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import projectsRoutes from './routes/projects.routes';
import certificatesRoutes from './routes/certificates.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import studentsRoutes from './routes/students.routes';
import workerRoutes from './routes/worker.routes';


// Initialize Express app
const app = express();

// Trust the proxy hop (Next.js dev rewrite / reverse proxy) so rate-limit can
// read X-Forwarded-For instead of throwing ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
// `1` = trust the single proxy immediately in front of us.
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
// CORS: echo the caller's origin. The web portal calls the API with
// credentials:'include', and the browser forbids `Access-Control-Allow-Origin: *`
// in that case — so we reflect the actual request origin for browser requests
// and fall back to the configured origin for origin-less (server) calls.
app.use(
  cors({
    origin: (origin, cb) => {
      cb(null, origin || appConfig.corsOrigin);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: appConfig.rateLimit.windowMs,
  max: appConfig.rateLimit.max,
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/certificates', certificatesRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/students', studentsRoutes);
app.use('/api/v1/worker', workerRoutes);


// API info endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'SkillBridge API v1',
    status: 'running',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      projects: '/api/v1/projects',
    },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server — only when running as a long-lived process (local dev / container).
// On Vercel the default export `app` is used as the serverless handler, so we must
// NOT call app.listen there (it would try to bind a port that doesn't exist).
const PORT = appConfig.port;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SkillBridge API server running on port ${PORT}`);
    console.log(`📊 Environment: ${appConfig.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📖 API docs: http://localhost:${PORT}/api/v1`);
  });
}

export default app;
