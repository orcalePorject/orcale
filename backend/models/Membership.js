const { executeQuery } = require('../config/oracle');

class Membership {
  // Get all active membership plans
  static async getAll() {
    const sql = `
      SELECT 
        plan_code,
        plan_desc,
        duration_days,
        price,
        is_active
      FROM membership
      WHERE is_active = 'y'
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
}

module.exports = Membership;