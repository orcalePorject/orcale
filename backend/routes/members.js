const express = require('express');
const router = express.Router();
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

// SEARCH MEMBERS - ADD THIS ENDPOINT
// routes/members.js - Update search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    console.log('🔍 Search query received:', q);
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Enter at least 2 characters to search'
      });
    }

    const searchTerm = `%${q.trim()}%`; // Don't convert to uppercase
    
    console.log('🔍 Searching for term:', searchTerm);
    
    // Test if there are any members in the database
    const testQuery = await executeQuery(
      'SELECT COUNT(*) as total_count FROM member'
    );
    console.log('📊 Total members in database:', testQuery.rows[0].TOTAL_COUNT);
    
    // Try a simpler search query first
    const result = await executeQuery(
      `SELECT 
        m_id,
        f_name,
        l_name,
        phone,
        email,
        status,
        f_name || ' ' || l_name as full_name
       FROM member
       WHERE (f_name LIKE :searchTerm 
          OR l_name LIKE :searchTerm
          OR phone LIKE :searchTerm
          OR email LIKE :searchTerm)
       AND status = 'ACTIVE'
       ORDER BY f_name`,
      { searchTerm: searchTerm }
    );
    
    console.log('🔍 Simple search results found:', result.rows.length);
    
    // If no results with simple search, try case-insensitive
    if (result.rows.length === 0) {
      console.log('🔍 Trying case-insensitive search...');
      const caseInsensitiveResult = await executeQuery(
        `SELECT 
          m_id,
          f_name,
          l_name,
          phone,
          email,
          status,
          f_name || ' ' || l_name as full_name
         FROM member
         WHERE (UPPER(f_name) LIKE UPPER(:searchTerm) 
            OR UPPER(l_name) LIKE UPPER(:searchTerm)
            OR phone LIKE :searchTerm
            OR UPPER(email) LIKE UPPER(:searchTerm))
         AND status = 'ACTIVE'
         ORDER BY f_name`,
        { searchTerm: searchTerm }
      );
      
      console.log('🔍 Case-insensitive results:', caseInsensitiveResult.rows.length);
      
      return res.json({
        success: true,
        count: caseInsensitiveResult.rows.length,
        data: caseInsensitiveResult.rows
      });
    }
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
    
  } catch (error) {
    console.error('❌ Search error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed: ' + error.message
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

// Update member
router.put('/:id', async (req, res) => {
  try {
    const memberId = req.params.id;
    const {
      f_name,
      l_name,
      dob,
      phone,
      email,
      address,
      status
    } = req.body;
    
    // Check if member exists
    const checkResult = await executeQuery(
      'SELECT m_id FROM member WHERE m_id = :id',
      [memberId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Build dynamic update query
    let updateFields = [];
    let binds = { member_id: memberId };
    
    if (f_name !== undefined) {
      updateFields.push('f_name = :f_name');
      binds.f_name = f_name;
    }
    if (l_name !== undefined) {
      updateFields.push('l_name = :l_name');
      binds.l_name = l_name;
    }
    if (dob !== undefined) {
      if (dob === null || dob === '') {
        updateFields.push('dob = NULL');
      } else {
        updateFields.push('dob = TO_DATE(:dob, \'YYYY-MM-DD\')');
        binds.dob = dob;
      }
    }
    if (phone !== undefined) {
      updateFields.push('phone = :phone');
      binds.phone = phone;
    }
    if (email !== undefined) {
      updateFields.push('email = :email');
      binds.email = email || null;
    }
    if (address !== undefined) {
      updateFields.push('address = :address');
      binds.address = address || null;
    }
    if (status !== undefined) {
      updateFields.push('status = :status');
      binds.status = status;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const sql = `UPDATE member SET ${updateFields.join(', ')} WHERE m_id = :member_id`;
    
    await executeQuery(sql, binds);
    
    res.json({
      success: true,
      message: 'Member updated successfully'
    });
    
  } catch (error) {
    console.error('Member update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update member: ' + error.message
    });
  }
});

// Add debug endpoint to routes/members.js
router.get('/debug/all', async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT 
        m_id,
        f_name,
        l_name,
        phone,
        email,
        status
       FROM member
       ORDER BY m_id`
    );
    
    console.log('📊 All members in database:', result.rows);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug failed: ' + error.message
    });
  }
});
module.exports = router;