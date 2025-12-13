const express = require('express');
const router = express.Router();

// Import controller functions directly (simpler)
const { executeQuery } = require('../config/oracle');

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Members API is working',
    timestamp: new Date().toISOString()
  });
});

// Get all members (with status filter)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let binds = {};
    
    if (status) {
      whereClause += ' AND m.status = :status';
      binds.status = status;
    }
    
    if (search && search.trim().length >= 2) {
      whereClause += ` AND (UPPER(m.f_name) LIKE UPPER(:search) 
                         OR UPPER(m.l_name) LIKE UPPER(:search)
                         OR m.phone LIKE :search)`;
      binds.search = `%${search.trim()}%`;
    }
    
    const result = await executeQuery(
      `SELECT 
        m.m_id, 
        m.f_name, 
        m.l_name, 
        m.phone, 
        m.email,
        m.address,
        TO_CHAR(m.dob, 'YYYY-MM-DD') as dob,
        TO_CHAR(m.join_date, 'YYYY-MM-DD') as join_date,
        m.status,
        s.first_name || ' ' || s.last_name as created_by_name,
        ms.plan_code,
        TO_CHAR(ms.end_date, 'YYYY-MM-DD') as subscription_end
       FROM member m
       LEFT JOIN staff s ON m.created_by = s.staff_id
       LEFT JOIN (
         SELECT m_id, plan_code, end_date 
         FROM member_subscriptions 
         WHERE end_date = (SELECT MAX(end_date) FROM member_subscriptions ms2 WHERE ms2.m_id = member_subscriptions.m_id)
       ) ms ON m.m_id = ms.m_id
       ${whereClause}
       ORDER BY m.m_id DESC`,
      binds
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching all members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
});
// Get all active members
router.get('/active', async (req, res) => {
  try {
    console.log('Fetching active members...');
    
    const result = await executeQuery(
      "SELECT m_id, f_name, l_name, phone, email, status, TO_CHAR(join_date, 'YYYY-MM-DD') as join_date FROM member WHERE status = 'ACTIVE' ORDER BY m_id"
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
});

// Register new member
router.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration request:', req.body);
    
    const { f_name, l_name, phone, email, address, plan_code, created_by } = req.body;
    
    // Basic validation
    if (!f_name || !phone) {
      return res.status(400).json({
        success: false,
        error: 'First name and phone are required'
      });
    }
    
    // Insert member
    await executeQuery(
      "INSERT INTO member (f_name, l_name, phone, email, address, created_by, status, join_date) VALUES (:f_name, :l_name, :phone, :email, :address, :created_by, 'ACTIVE', SYSDATE)",
      {
        f_name: f_name.trim(),
        l_name: (l_name || '').trim() || null,
        phone: phone.trim(),
        email: (email || '').trim() || null,
        address: (address || '').trim() || null,
        created_by: created_by || 1
      }
    );
    
    // Get the new member ID
    const idResult = await executeQuery('SELECT MAX(m_id) as new_id FROM member');
    const memberId = idResult.rows[0].NEW_ID;
    
    // Create subscription (if plan_code provided)
    if (plan_code) {
      try {
        const planResult = await executeQuery(
          'SELECT duration_days FROM membership WHERE plan_code = :plan_code AND is_active = \'y\'',
          [plan_code]
        );
        
        if (planResult.rows.length > 0) {
          const duration = planResult.rows[0].DURATION_DAYS;
          await executeQuery(
            "INSERT INTO member_subscriptions (m_id, plan_code, start_date, end_date) VALUES (:m_id, :plan_code, SYSDATE, SYSDATE + :duration)",
            { m_id: memberId, plan_code, duration }
          );
        }
      } catch (planError) {
        console.log('⚠️ Subscription creation skipped:', planError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: {
        memberId,
        name: `${f_name} ${l_name || ''}`.trim(),
        phone
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle duplicate phone
    if (error.message.includes('ORA-00001')) {
      return res.status(400).json({
        success: false,
        error: 'This phone number is already registered'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    
    const result = await executeQuery(
      "SELECT m_id, f_name, l_name, phone, email, address, status, TO_CHAR(join_date, 'YYYY-MM-DD') as join_date FROM member WHERE m_id = :id",
      [memberId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member'
    });
  }
});

// Search members
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Enter at least 2 characters'
      });
    }
    
    const searchTerm = q.trim();
    const result = await executeQuery(
      "SELECT m_id, f_name || ' ' || COALESCE(l_name, '') as full_name, phone, email, status FROM member WHERE UPPER(f_name) LIKE UPPER(:term) OR UPPER(l_name) LIKE UPPER(:term) OR phone LIKE :term ORDER BY f_name",
      { term: `%${searchTerm}%` }
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
});

module.exports = router;