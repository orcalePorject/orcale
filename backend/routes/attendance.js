const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Mark attendance for today - FIXED DATE FORMAT
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
      [parseInt(member_id)]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    // Get current date in proper format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayFormatted = `${year}-${month}-${day}`;
    
    // First try to update if attendance already exists for today
    try {
      const updateResult = await executeQuery(
        `UPDATE member_attendance 
         SET is_present = :is_present 
         WHERE member_id = :member_id 
         AND att_date = TRUNC(SYSDATE)`,
        {
          member_id: parseInt(member_id),
          is_present: is_present ? 1 : 0
        }
      );
      
      // If no rows were updated, insert new record
      if (updateResult.rowsAffected === 0) {
        await executeQuery(
          `INSERT INTO member_attendance (att_date, member_id, is_present)
           VALUES (TRUNC(SYSDATE), :member_id, :is_present)`,
          {
            member_id: parseInt(member_id),
            is_present: is_present ? 1 : 0
          }
        );
      }
    } catch (error) {
      // Fallback to MERGE approach
      await executeQuery(
        `MERGE INTO member_attendance ma
         USING (SELECT :member_id as member_id, :is_present as is_present FROM DUAL) src
         ON (ma.att_date = TRUNC(SYSDATE) AND ma.member_id = src.member_id)
         WHEN MATCHED THEN
           UPDATE SET ma.is_present = src.is_present
         WHEN NOT MATCHED THEN
           INSERT (att_date, member_id, is_present)
           VALUES (TRUNC(SYSDATE), src.member_id, src.is_present)`,
        {
          member_id: parseInt(member_id),
          is_present: is_present ? 1 : 0
        }
      );
    }
    
    const member = memberCheck.rows[0];
    res.json({
      success: true,
      message: `Attendance marked for ${member.F_NAME} ${member.L_NAME}`,
      data: {
        member_id,
        is_present: is_present ? 1 : 0,
        date: todayFormatted
      }
    });
    
  } catch (error) {
    console.error('Attendance error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance: ' + error.message
    });
  }
});

// Get today's attendance - FIXED DATE FORMAT
router.get('/today', async (req, res) => {
  try {
    // Use TRUNC(SYSDATE) instead of TO_DATE for consistency
    const result = await executeQuery(
      `SELECT 
        ma.member_id as "MEMBER_ID",
        m.f_name as "F_NAME",
        m.l_name as "L_NAME",
        m.phone as "PHONE",
        ma.is_present as "IS_PRESENT",
        TO_CHAR(ma.att_date, 'YYYY-MM-DD') as "ATT_DATE"
       FROM member_attendance ma
       JOIN member m ON ma.member_id = m.m_id
       WHERE ma.att_date = TRUNC(SYSDATE)
       ORDER BY m.f_name`
    );
    
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    res.json({
      success: true,
      date: todayFormatted,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Attendance fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance: ' + error.message
    });
  }
});

// Get attendance report for a date range - FIXED DATE FORMAT
router.get('/report', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }
    
    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
      return res.status(400).json({
        success: false,
        error: 'Date must be in YYYY-MM-DD format'
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
      { 
        start_date: start_date,
        end_date: end_date 
      }
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
      error: 'Failed to generate report: ' + error.message
    });
  }
});

module.exports = router;