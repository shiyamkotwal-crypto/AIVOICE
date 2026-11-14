import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import { isSupabaseConfigured } from './config/supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin in production)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'VoiceBridge AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    gemini_configured: Boolean(
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' &&
      process.env.GEMINI_API_KEY.trim() !== ''
    ),
    supabase_configured: isSupabaseConfigured,
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', chatRoutes);

// Static client bundle serving in production mode
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`📦 Serving production frontend build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for React Router
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// 404 Handler for API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`
======================================================
  🎙️ VoiceBridge AI Backend Relay Operational
  🌐 Port: http://localhost:${PORT}
  🤖 Gemini Model: gemini-3.8-flash (with local fallback)
  📦 Database Mode: ${isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Persistent Engine (Supabase Schema)'}
  🚀 Mode: ${process.env.NODE_ENV || 'development'}
======================================================
  `);
});

export default app;
