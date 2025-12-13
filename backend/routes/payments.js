const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Process payment
router.post('/process', async (req, res) => {
  try {
    const { member_id, amount, description, received_by } = req.body;
    
    if (!member_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Member ID and amount are required'
      });
    }
    
    // Check if member exists
    const memberCheck = await executeQuery(
      'SELECT m_id, f_name, l_name, status FROM member WHERE m_id = :member_id',
      [member_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Insert payment
    const paymentResult = await executeQuery(
      `INSERT INTO payments (member_id, amount, description, received_by, payment_date)
       VALUES (:member_id, :amount, :description, :received_by, SYSDATE)
       RETURNING payment_id INTO :payment_id`,
      {
        member_id,
        amount,
        description: description || 'Membership Fee',
        received_by: received_by || 1,
        payment_id: { type: 'NUMBER', dir: 'OUT' }
      }
    );
    
    const paymentId = paymentResult.outBinds.payment_id[0];
    
    // Update member status to ACTIVE if payment is successful
    if (amount > 0) {
      await executeQuery(
        'UPDATE member SET status = \'ACTIVE\' WHERE m_id = :member_id AND status = \'INACTIVE\'',
        [member_id]
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: paymentId,
        member_id,
        amount,
        date: new Date().toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment: ' + error.message
    });
  }
});

// Get member payments
router.get('/member/:member_id', async (req, res) => {
  try {
    const memberId = req.params.member_id;
    
    const result = await executeQuery(
      `SELECT 
        p.payment_id,
        p.member_id,
        p.amount,
        p.description,
        TO_CHAR(p.payment_date, 'YYYY-MM-DD') as payment_date,
        p.status,
        s.first_name || ' ' || s.last_name as received_by_name
       FROM payments p
       LEFT JOIN staff s ON p.received_by = s.staff_id
       WHERE p.member_id = :member_id
       ORDER BY p.payment_date DESC`,
      [memberId]
    );
    
    // Calculate totals
    const totalPaid = result.rows.reduce((sum, row) => sum + (parseFloat(row.AMOUNT) || 0), 0);
    
    res.json({
      success: true,
      count: result.rows.length,
      totalPaid,
      data: result.rows
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

// Get all payments (with filters)
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date, member_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let binds = {};
    
    if (start_date && end_date) {
      whereClause += ' AND p.payment_date BETWEEN TO_DATE(:start_date, \'YYYY-MM-DD\') AND TO_DATE(:end_date, \'YYYY-MM-DD\')';
      binds.start_date = start_date;
      binds.end_date = end_date;
    }
    
    if (member_id) {
      whereClause += ' AND p.member_id = :member_id';
      binds.member_id = member_id;
    }
    
    const result = await executeQuery(
      `SELECT 
        p.payment_id,
        p.member_id,
        m.f_name || ' ' || m.l_name as member_name,
        p.amount,
        p.description,
        TO_CHAR(p.payment_date, 'YYYY-MM-DD') as payment_date,
        p.status,
        s.first_name || ' ' || s.last_name as received_by_name
       FROM payments p
       JOIN member m ON p.member_id = m.m_id
       LEFT JOIN staff s ON p.received_by = s.staff_id
       ${whereClause}
       ORDER BY p.payment_date DESC`,
      binds
    );
    
    // Calculate totals
    const totalRevenue = result.rows.reduce((sum, row) => sum + (parseFloat(row.AMOUNT) || 0), 0);
    
    res.json({
      success: true,
      count: result.rows.length,
      totalRevenue,
      data: result.rows
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
});

module.exports = router;