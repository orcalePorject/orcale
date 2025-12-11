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
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Staff login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find staff by username
    const staff = await Staff.findByUsername(username);
    
    if (!staff) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await Staff.verifyPassword(staff, password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(staff);

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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
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