const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Get all trainers
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
        trainer_id,
        first_name,
        last_name,
        phone,
        email,
        specialization,
        TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date,
        hourly_rate,
        status
       FROM trainers 
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
    console.error('Trainers fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trainers'
    });
  }
});

module.exports = router;