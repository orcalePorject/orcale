const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff');

// Generate JWT token
const generateToken = (staff) => {
  return jwt.sign(
    {
      id: staff.staff_id,
      name: `${staff.first_name} ${staff.last_name}`,
      role: staff.role
    },
    process.env.JWT_SECRET || 'your_fallback_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Staff login
const login = async (req, res) => {
  try {
    console.log('\n🔐 ========== LOGIN ATTEMPT ==========');
    console.log('📝 Request body:', JSON.stringify(req.body));
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    console.log(`🔍 Looking for staff: ${username}`);
    
    // TEMPORARY: Hardcoded admin check for testing
    if (username === 'admin' && password === 'admin123') {
      console.log('✅ TEMPORARY: Using hardcoded admin check');
      
      const token = jwt.sign(
        { id: 1, name: 'Admin User', role: 'ADMIN' },
        process.env.JWT_SECRET || 'temp-secret-123',
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
    
    // Original code for database lookup
    const staff = await Staff.findByUsername(username);
    
    if (!staff) {
      console.log('❌ Staff not found in database');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('✅ Staff found:', {
      id: staff.staff_id,
      username: staff.username,
      name: `${staff.first_name} ${staff.last_name}`,
      role: staff.role,
      status: staff.status
    });

    console.log(`🔑 Verifying password for ${username}...`);
    
    // Verify password
    const isValidPassword = await Staff.verifyPassword(staff, password);
    
    if (!isValidPassword) {
      console.log('❌ Password verification failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log('✅ Password verified successfully!');
    
    // Generate token
    const token = generateToken(staff);
    console.log('✅ JWT token generated');
    
    console.log('🎉 Login successful!');
    console.log('====================================\n');

    res.json({
      success: true,
      token,
      user: {
        id: staff.staff_id,
        name: `${staff.first_name} ${staff.last_name}`,
        role: staff.role,
        username: staff.username
      }
    });
    
  } catch (error) {
    console.error('🔥 LOGIN ERROR:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Test login endpoint (optional)
const testLogin = async (req, res) => {
  res.json({
    success: true,
    message: 'Auth test endpoint working',
    timestamp: new Date().toISOString()
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const staff = await Staff.getById(req.user.id);
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: staff
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// Export functions
module.exports = {
  login,
  testLogin,
  getProfile
};