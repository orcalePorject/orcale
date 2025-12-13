const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Mark attendance for today
router.post('/mark', async (req, res) => {
  try {
    const { member_id, is_present = 1 } = req.body;
    
    if (!member_id) {
      return res.status(400).json({
        success: false,
        error: 'Member ID is required'
      });
    }
    
    // Check if member exists
    const memberCheck = await executeQuery(
      'SELECT m_id, f_name, l_name FROM member WHERE m_id = :member_id',
      [member_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Mark attendance (upsert - insert or update)
    await executeQuery(
      `MERGE INTO member_attendance ma
       USING (SELECT :att_date as att_date, :member_id as member_id FROM DUAL) src
       ON (ma.att_date = src.att_date AND ma.member_id = src.member_id)
       WHEN MATCHED THEN
         UPDATE SET ma.is_present = :is_present
       WHEN NOT MATCHED THEN
         INSERT (att_date, member_id, is_present)
         VALUES (src.att_date, src.member_id, :is_present)`,
      {
        att_date: new Date().toISOString().split('T')[0],
        member_id,
        is_present: is_present ? 1 : 0
      }
    );
    
    const member = memberCheck.rows[0];
    res.json({
      success: true,
      message: `Attendance marked for ${member.F_NAME} ${member.L_NAME}`,
      data: {
        member_id,
        is_present,
        date: new Date().toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('Attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance: ' + error.message
    });
  }
});

// Get today's attendance
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await executeQuery(
      `SELECT 
        ma.member_id,
        m.f_name,
        m.l_name,
        m.phone,
        ma.is_present,
        TO_CHAR(ma.att_date, 'YYYY-MM-DD') as att_date
       FROM member_attendance ma
       JOIN member m ON ma.member_id = m.m_id
       WHERE ma.att_date = TO_DATE(:today, 'YYYY-MM-DD')
       ORDER BY m.f_name`,
      { today }
    );
    
    res.json({
      success: true,
      date: today,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance'
    });
  }
});

// Get attendance report for a date range
router.get('/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    const result = await executeQuery(
      `SELECT 
        TO_CHAR(ma.att_date, 'YYYY-MM-DD') as att_date,
        COUNT(*) as total_members,
        SUM(ma.is_present) as present_count,
        COUNT(*) - SUM(ma.is_present) as absent_count,
        ROUND(SUM(ma.is_present) * 100 / COUNT(*), 2) as attendance_rate
       FROM member_attendance ma
       WHERE ma.att_date BETWEEN TO_DATE(:start_date, 'YYYY-MM-DD') 
                          AND TO_DATE(:end_date, 'YYYY-MM-DD')
       GROUP BY ma.att_date
       ORDER BY ma.att_date DESC`,
      { start_date, end_date }
    );
    
    res.json({
      success: true,
      start_date,
      end_date,
      data: result.rows
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

module.exports = router;