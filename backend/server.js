const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize database
const db = require('./config/oracle');
db.initialize();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/members', require('./routes/members'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/payments', require('./routes/payments'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.executeQuery('SELECT SYSDATE as now FROM DUAL');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        currentTime: result.rows[0].NOW
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
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        test: 'GET /api/auth/test'
      },
      members: {
        test: 'GET /api/members/test',
        active: 'GET /api/members/active',
        register: 'POST /api/members/register',
        search: 'GET /api/members/search?q=term',
        getById: 'GET /api/members/:id'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Open http://localhost:${PORT} in your browser`);
});