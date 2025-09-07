import express from 'express';
import { testConnection } from '../database/index.js';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  const dbHealthy = await testConnection();
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    details: {
      app_name: process.env.APP_NAME || 'Cal AI Backend',
      ai_provider: process.env.AI_PROVIDER || 'anthropic',
      debug_mode: process.env.NODE_ENV === 'development',
      database: dbHealthy ? 'connected' : 'disconnected'
    }
  });
});

// Database health check
router.get('/db', async (req, res) => {
  const isHealthy = await testConnection();
  
  if (isHealthy) {
    res.json({
      status: 'healthy',
      message: 'Database connection is active'
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      message: 'Database connection failed'
    });
  }
});

export default router;