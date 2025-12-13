const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/oracle');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth API is working',
    timestamp: new Date().toISOString()
  });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt for:', username);
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // For now, hardcoded admin check
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, name: 'Admin User', role: 'ADMIN' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      
      return res.json({
        success: true,
        token,
        user: {
          id: 1,
          name: 'Admin User',
          role: 'ADMIN',
          username: 'admin'
        }
      });
    }
    
    // Check database for staff
    const staffResult = await executeQuery(
      "SELECT staff_id, first_name, last_name, username, password_hash, role, status FROM staff WHERE username = :username AND status = 'ACTIVE'",
      [username]
    );
    
    if (staffResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const staff = staffResult.rows[0];
    
    // For now, skip password verification
    // In production, use bcrypt.compare()
    
    const token = jwt.sign(
      { id: staff.STAFF_ID, name: `${staff.FIRST_NAME} ${staff.LAST_NAME}`, role: staff.ROLE },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: staff.STAFF_ID,
        name: `${staff.FIRST_NAME} ${staff.LAST_NAME}`,
        role: staff.ROLE,
        username: staff.USERNAME
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

module.exports = router;