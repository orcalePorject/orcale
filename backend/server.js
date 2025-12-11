const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database connection
const db = require('./config/oracle');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
db.initialize();

// Routes
app.use('/api/members', require('./routes/members'));
app.use('/api/auth', require('./routes/auth'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.executeQuery('SELECT SYSDATE as current_time FROM DUAL');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        currentTime: result.rows[0].CURRENT_TIME
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: error.message
      }
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏋️‍♂️ Gym Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile'
      },
      members: {
        active: 'GET /api/members/active',
        register: 'POST /api/members/register',
        search: 'GET /api/members/search?q=search_term',
        getById: 'GET /api/members/:id'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing connections...');
  await db.closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing connections...');
  await db.closePool();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
  console.log('📊 Health check: http://localhost:${PORT}/api/health');
});