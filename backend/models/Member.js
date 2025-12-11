const { executeQuery, executeMany } = require('../config/oracle');

class Member {
  // Register new member
  static async register(memberData) {
    const sql = `
      INSERT INTO member (
        f_name, l_name, dob, phone, email, address, created_by, status
      ) VALUES (
        :f_name, :l_name, TO_DATE(:dob, 'YYYY-MM-DD'), :phone, :email, 
        :address, :created_by, 'INACTIVE'
      )
      RETURNING m_id INTO :m_id
    `;
    
    const binds = {
      ...memberData,
      m_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    
    const result = await executeQuery(sql, binds);
    return result.outBinds.m_id[0];
  }

  // Get all active members
  static async getActiveMembers() {
    const sql = `
      SELECT 
        m.m_id, 
        m.f_name, 
        m.l_name, 
        m.phone, 
        m.email,
        m.address,
        TO_CHAR(m.dob, 'YYYY-MM-DD') as dob,
        TO_CHAR(m.join_date, 'YYYY-MM-DD') as join_date,
        m.status,
        s.first_name || ' ' || s.last_name as created_by_name
      FROM member m
      LEFT JOIN staff s ON m.created_by = s.staff_id
      WHERE m.status = 'ACTIVE'
      ORDER BY m.m_id
    `;
    
    const result = await executeQuery(sql);
    return result.rows;
  }

  // Get member by ID
  static async getById(memberId) {
    const sql = `
      SELECT 
        m.*,
        TO_CHAR(m.dob, 'YYYY-MM-DD') as dob,
        TO_CHAR(m.join_date, 'YYYY-MM-DD') as join_date,
        TO_CHAR(m.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
        s.first_name || ' ' || s.last_name as created_by_name
      FROM member m
      LEFT JOIN staff s ON m.created_by = s.staff_id
      WHERE m.m_id = :memberId
    `;
    
    const result = await executeQuery(sql, [memberId]);
    return result.rows[0];
  }

  // Update member status
  static async updateStatus(memberId, status) {
    const sql = `
      UPDATE member 
      SET status = :status 
      WHERE m_id = :memberId
    `;
    
    await executeQuery(sql, { memberId, status });
    return true;
  }

  // Search members
  static async search(searchTerm) {
    const sql = `
      SELECT 
        m_id, 
        f_name || ' ' || l_name as full_name,
        phone,
        email,
        status
      FROM member
      WHERE UPPER(f_name) LIKE UPPER(:searchTerm) 
         OR UPPER(l_name) LIKE UPPER(:searchTerm)
         OR phone LIKE :searchTerm
         OR UPPER(email) LIKE UPPER(:searchTerm)
      ORDER BY f_name
    `;
    
    const result = await executeQuery(sql, { searchTerm: `%${searchTerm}%` });
    return result.rows;
  }
}

module.exports = Member;