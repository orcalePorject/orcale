const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Get all staff
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let whereClause = '';
    let binds = {};
    
    if (status) {
      whereClause = 'WHERE status = :status';
      binds.status = status;
    }
    
const result = await executeQuery(
  `SELECT 
    staff_id,
    first_name,
    last_name,
    phone,
    email,
    role,
    username,
    TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date,
    salary,
    status,
    TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
   FROM staff 
   ${whereClause}
   ORDER BY first_name`,
  binds
);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff'
    });
  }
});

// Get staff by ID
router.get('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    
    const result = await executeQuery(
      `SELECT 
        staff_id,
        first_name,
        last_name,
        phone,
        email,
        role,
        username,
        TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date,
        salary,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
       FROM staff 
       WHERE staff_id = :id`,
      [staffId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff details'
    });
  }
});

// Get staff attendance
router.get('/:id/attendance', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { month, year } = req.query;
    
    let whereClause = 'WHERE staff_id = :staff_id';
    let binds = { staff_id: staffId };
    
    if (month && year) {
      whereClause += ` AND EXTRACT(MONTH FROM att_date) = :month AND EXTRACT(YEAR FROM att_date) = :year`;
      binds.month = parseInt(month);
      binds.year = parseInt(year);
    }
    
    const result = await executeQuery(
      `SELECT 
        TO_CHAR(att_date, 'YYYY-MM-DD') as att_date,
        is_present
       FROM staff_attendance 
       ${whereClause}
       ORDER BY att_date DESC`,
      binds
    );
    
    // Calculate stats
    const totalDays = result.rows.length;
    const presentDays = result.rows.filter(r => r.IS_PRESENT === 1).length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    
    res.json({
      success: true,
      data: result.rows,
      stats: {
        totalDays,
        presentDays,
        absentDays: totalDays - presentDays,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      }
    });
  } catch (error) {
    console.error('Staff attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch staff attendance'
    });
  }
});

module.exports = router;