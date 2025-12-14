const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Test endpoint
router.get('/test', async (req, res) => {
  res.json({
    success: true,
    message: 'Membership API is working',
    timestamp: new Date().toISOString()
  });
});

// Get all membership plans
router.get('/', async (req, res) => {
  try {
    const { is_active } = req.query;
    
    let whereClause = '';
    let binds = {};
    
    if (is_active) {
      whereClause = 'WHERE is_active = :is_active';
      binds.is_active = is_active;
    }
    
    const result = await executeQuery(
      `SELECT 
        plan_id,
        plan_code,
        plan_desc,
        duration_days,
        price,
        is_active
       FROM membership 
       ${whereClause}
       ORDER BY plan_code`,
      binds
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Plans fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plans'
    });
  }
});

// Get plan by code
router.get('/:plan_code', async (req, res) => {
  try {
    const planCode = req.params.plan_code;
    
    const result = await executeQuery(
      `SELECT 
        plan_id,
        plan_code,
        plan_desc,
        duration_days,
        price,
        is_active
       FROM membership WHERE plan_code = :plan_code`,
      [planCode]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Plan fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan'
    });
  }
});

// Create new plan
router.post('/', async (req, res) => {
  try {
    const { plan_code, plan_desc, duration_days, price, is_active = 'y' } = req.body;
    
    console.log('Creating plan with data:', req.body);
    
    // Validation
    if (!plan_code || !duration_days || !price) {
      return res.status(400).json({
        success: false,
        error: 'Plan code, duration, and price are required'
      });
    }
    
    // Check if plan code already exists
    const checkResult = await executeQuery(
      'SELECT plan_code FROM membership WHERE plan_code = :plan_code',
      [plan_code]
    );
    
    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Plan code already exists'
      });
    }
    
    // Insert new plan
    const sql = `
      INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active)
      VALUES (:plan_code, :plan_desc, :duration_days, :price, :is_active)
    `;
    
    await executeQuery(sql, {
      plan_code: plan_code.toUpperCase(),
      plan_desc: plan_desc || null,
      duration_days: parseInt(duration_days),
      price: parseFloat(price),
      is_active: is_active
    });
    
    // Get the newly created plan
    const newPlanResult = await executeQuery(
      'SELECT * FROM membership WHERE plan_code = :plan_code',
      [plan_code]
    );
    
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      data: newPlanResult.rows[0]
    });
    
  } catch (error) {
    console.error('Plan creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create plan: ' + error.message
    });
  }
});

// Update plan status (activate/deactivate)
router.put('/:plan_code/status', async (req, res) => {
  try {
    const planCode = req.params.plan_code;
    const { is_active } = req.body;
    
    console.log(`Updating plan ${planCode} status to ${is_active}`);
    
    if (!is_active || !['y', 'n'].includes(is_active)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status (y/n) is required'
      });
    }
    
    // Check if plan exists
    const checkResult = await executeQuery(
      'SELECT plan_code FROM membership WHERE plan_code = :plan_code',
      [planCode]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    // Update plan status
    await executeQuery(
      'UPDATE membership SET is_active = :is_active WHERE plan_code = :plan_code',
      { plan_code: planCode, is_active: is_active }
    );
    
    res.json({
      success: true,
      message: `Plan ${is_active === 'y' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Plan status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan status'
    });
  }
});

// Update plan details
router.put('/:plan_code', async (req, res) => {
  try {
    const planCode = req.params.plan_code;
    const { plan_desc, duration_days, price } = req.body;
    
    console.log(`Updating plan ${planCode} with data:`, req.body);
    
    // Check if plan exists
    const checkResult = await executeQuery(
      'SELECT plan_code FROM membership WHERE plan_code = :plan_code',
      [planCode]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    const updates = [];
    const binds = { plan_code: planCode };
    
    if (plan_desc !== undefined) {
      updates.push('plan_desc = :plan_desc');
      binds.plan_desc = plan_desc;
    }
    
    if (duration_days !== undefined) {
      updates.push('duration_days = :duration_days');
      binds.duration_days = parseInt(duration_days);
    }
    
    if (price !== undefined) {
      updates.push('price = :price');
      binds.price = parseFloat(price);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const sql = `UPDATE membership SET ${updates.join(', ')} WHERE plan_code = :plan_code`;
    
    console.log('SQL:', sql);
    console.log('Binds:', binds);
    
    await executeQuery(sql, binds);
    
    // Get updated plan
    const updatedPlan = await executeQuery(
      'SELECT * FROM membership WHERE plan_code = :plan_code',
      [planCode]
    );
    
    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: updatedPlan.rows[0]
    });
  } catch (error) {
    console.error('Plan update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update plan: ' + error.message
    });
  }
});

// Delete plan
router.delete('/:plan_code', async (req, res) => {
  try {
    const planCode = req.params.plan_code;
    
    console.log(`Deleting plan: ${planCode}`);
    
    // Check if plan exists
    const checkResult = await executeQuery(
      'SELECT plan_code FROM membership WHERE plan_code = :plan_code',
      [planCode]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }
    
    // Check if plan is being used
    const usageCheck = await executeQuery(
      'SELECT COUNT(*) as usage_count FROM member_subscriptions WHERE plan_code = :plan_code',
      [planCode]
    );
    
    if (parseInt(usageCheck.rows[0].USAGE_COUNT) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete plan that is being used by members'
      });
    }
    
    // Delete plan
    await executeQuery(
      'DELETE FROM membership WHERE plan_code = :plan_code',
      [planCode]
    );
    
    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Plan deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete plan: ' + error.message
    });
  }
});

// Get plan subscribers count
router.get('/:plan_code/subscribers', async (req, res) => {
  try {
    const planCode = req.params.plan_code;
    
    const result = await executeQuery(
      `SELECT COUNT(*) as subscriber_count 
       FROM member_subscriptions 
       WHERE plan_code = :plan_code 
       AND end_date >= SYSDATE`,
      [planCode]
    );
    
    res.json({
      success: true,
      count: parseInt(result.rows[0].SUBSCRIBER_COUNT) || 0
    });
  } catch (error) {
    console.error('Subscribers count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subscribers count'
    });
  }
});

module.exports = router;