const { executeQuery } = require('../config/oracle');
const bcrypt = require('bcryptjs');

class Staff {
  // Find staff by username
  static async findByUsername(username) {
    console.log(`📊 [Staff.findByUsername] Querying for: ${username}`);
    
    const sql = `
      SELECT 
        staff_id as "staff_id",
        first_name as "first_name",
        last_name as "last_name",
        username as "username",
        password_hash as "password_hash",
        role as "role",
        status as "status"
      FROM staff 
      WHERE username = :username AND status = 'ACTIVE'
    `;
    
    try {
      const result = await executeQuery(sql, [username]);
      console.log(`📊 [Staff.findByUsername] Found ${result.rows.length} users`);
      
      if (result.rows.length > 0) {
        const staff = result.rows[0];
        console.log(`📊 [Staff.findByUsername] User details:`, {
          id: staff.staff_id,
          username: staff.username,
          hashPresent: !!staff.password_hash,
          hashLength: staff.password_hash ? staff.password_hash.length : 0
        });
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ [Staff.findByUsername] Error:', error.message);
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(staff, password) {
    console.log(`🔐 [Staff.verifyPassword] Starting verification`);
    console.log(`🔐 Password to check: "${password}"`);
    console.log(`🔐 Stored hash: ${staff.password_hash}`);
    
    if (!staff || !staff.password_hash) {
      console.log('❌ [Staff.verifyPassword] No staff or hash');
      return false;
    }
    
    try {
      console.log(`🔐 [Staff.verifyPassword] Calling bcrypt.compare()`);
      const isValid = await bcrypt.compare(password, staff.password_hash);
      console.log(`🔐 [Staff.verifyPassword] bcrypt.compare result: ${isValid}`);
      return isValid;
    } catch (error) {
      console.error('❌ [Staff.verifyPassword] Bcrypt error:', error.message);
      console.error('Error stack:', error.stack);
      return false;
    }
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }
}

module.exports = Staff;