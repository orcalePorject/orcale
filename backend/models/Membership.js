const { executeQuery } = require('../config/oracle');

class Membership {
  // Get all membership plans
  static async getAll() {
    const sql = `
      SELECT 
        plan_code,
        plan_desc,
        duration_days,
        price,
        is_active
      FROM membership
      ORDER BY price
    `;
    
    const result = await executeQuery(sql);
    return result.rows;
  }

  // Get plan by code
  static async getByCode(planCode) {
    const sql = `
      SELECT * FROM membership 
      WHERE plan_code = :planCode
    `;
    
    const result = await executeQuery(sql, [planCode]);
    return result.rows[0];
  }

  // Create new plan
  static async create(planData) {
    const sql = `
      INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active)
      VALUES (:plan_code, :plan_desc, :duration_days, :price, :is_active)
    `;
    
    const result = await executeQuery(sql, {
      plan_code: planData.plan_code,
      plan_desc: planData.plan_desc || null,
      duration_days: parseInt(planData.duration_days),
      price: parseFloat(planData.price),
      is_active: planData.is_active || 'y'
    });
    
    return result;
  }

  // Update plan status
  static async updateStatus(planCode, isActive) {
    const sql = `
      UPDATE membership 
      SET is_active = :is_active 
      WHERE plan_code = :plan_code
    `;
    
    const result = await executeQuery(sql, {
      plan_code: planCode,
      is_active: isActive
    });
    
    return result;
  }

  // Delete plan
  static async delete(planCode) {
    const sql = `
      DELETE FROM membership 
      WHERE plan_code = :plan_code
    `;
    
    const result = await executeQuery(sql, [planCode]);
    return result;
  }
}

module.exports = Membership;