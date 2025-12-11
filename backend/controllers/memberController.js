const Member = require('../models/Member');
const Membership = require('../models/Membership');

// Test endpoint
exports.testEndpoint = async (req, res) => {
  res.json({
    success: true,
    message: 'Member API is working',
    timestamp: new Date().toISOString()
  });
};

// Get all active members
exports.getActiveMembers = async (req, res) => {
  try {
    const members = await Member.getActiveMembers();
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch members'
    });
  }
};

// Register new member
exports.registerMember = async (req, res) => {
  try {
    const {
      f_name, l_name, dob, phone, email, address,
      plan_code, created_by
    } = req.body;

    // Validate required fields
    if (!f_name || !phone || !plan_code) {
      return res.status(400).json({
        success: false,
        error: 'First name, phone, and plan code are required'
      });
    }

    // Check if plan exists
    const plan = await Membership.getByCode(plan_code);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid membership plan'
      });
    }

    // Register member
    const memberId = await Member.register({
      f_name, l_name, dob, phone, email, address, created_by
    });

    // Create subscription
    const { executeQuery } = require('../config/oracle');
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + plan.duration_days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    await executeQuery(
      `INSERT INTO member_subscriptions (m_id, plan_code, start_date, end_date)
       VALUES (:m_id, :plan_code, TO_DATE(:start_date, 'YYYY-MM-DD'), 
               TO_DATE(:end_date, 'YYYY-MM-DD'))`,
      { m_id: memberId, plan_code, start_date: startDate, end_date: endDate }
    );

    res.status(201).json({
      success: true,
      message: 'Member registered successfully',
      data: {
        memberId,
        name: `${f_name} ${l_name}`,
        phone,
        plan: plan.plan_desc,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
};

// Get member by ID
exports.getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await Member.getById(memberId);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    // Get member's subscriptions
    const { executeQuery } = require('../config/oracle');
    const subscriptions = await executeQuery(
      `SELECT 
        s.sub_id,
        s.plan_code,
        m.plan_desc,
        TO_CHAR(s.start_date, 'YYYY-MM-DD') as start_date,
        TO_CHAR(s.end_date, 'YYYY-MM-DD') as end_date,
        CASE 
          WHEN s.end_date < SYSDATE THEN 'EXPIRED'
          WHEN s.end_date - SYSDATE <= 7 THEN 'EXPIRING_SOON'
          ELSE 'ACTIVE'
        END as subscription_status
       FROM member_subscriptions s
       JOIN membership m ON s.plan_code = m.plan_code
       WHERE s.m_id = :memberId
       ORDER BY s.start_date DESC`,
      [memberId]
    );

    res.json({
      success: true,
      data: {
        ...member,
        subscriptions: subscriptions.rows
      }
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member details'
    });
  }
};

// Search members
exports.searchMembers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Enter at least 2 characters to search'
      });
    }

    const members = await Member.search(q.trim());
    
    res.json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed'
    });
  }
};