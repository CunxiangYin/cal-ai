import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

// Import routes
import healthRoutes from '../src/routes/health.js';
import mealRoutes from '../src/routes/meal.js';
import chatRoutes from '../src/routes/chat.js';

// Import database
import { initDatabase } from '../src/database/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
let dbInitialized = false;
async function ensureDatabase() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

// Middleware to ensure database is initialized
app.use(async (req, res, next) => {
  await ensureDatabase();
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', mealRoutes);
app.use('/api', chatRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    name: process.env.APP_NAME || 'Cal AI Backend',
    version: process.env.APP_VERSION || '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Export for Vercel
export default app;