const { executeQuery } = require('../config/oracle');
const bcrypt = require('bcryptjs');

class Staff {
  // Find staff by username
  static async findByUsername(username) {
    const sql = `
      SELECT 
        staff_id,
        first_name,
        last_name,
        username,
        password_hash,
        role,
        status,
        TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date
      FROM staff 
      WHERE username = :username AND status = 'ACTIVE'
    `;
    
    const result = await executeQuery(sql, [username]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(staff, password) {
    return await bcrypt.compare(password, staff.password_hash);
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Get staff by ID
  static async getById(staffId) {
    const sql = `
      SELECT 
        staff_id,
        first_name,
        last_name,
        role,
        status
      FROM staff 
      WHERE staff_id = :staffId
    `;
    
    const result = await executeQuery(sql, [staffId]);
    return result.rows[0];
  }
}

module.exports = Staff;