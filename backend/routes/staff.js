const express = require('express');
const router = express.Router();
const { executeQuery, oracledb } = require('../config/oracle');
const bcrypt = require('bcryptjs');

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

// Create new staff
router.post('/', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      phone,
      email,
      role,
      username,
      password,
      salary,
      status = 'ACTIVE'
    } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !phone || !role || !username) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, phone, role, and username are required'
      });
    }
    
    // Hash password if provided
    let password_hash = null;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }
    
    // Insert new staff
    const result = await executeQuery(
      `INSERT INTO staff (
        first_name, last_name, phone, email, role, 
        username, password_hash, salary, status, hire_date
      ) VALUES (
        :first_name, :last_name, :phone, :email, :role,
        :username, :password_hash, :salary, :status, SYSDATE
      )`,
      {
        first_name,
        last_name,
        phone,
        email: email || null,
        role,
        username,
        password_hash: password_hash,
        salary: salary ? parseFloat(salary) : null,
        status
      }
    );
    
    // Get the new staff ID
    const idResult = await executeQuery('SELECT MAX(staff_id) as staff_id FROM staff');
    const staffId = idResult.rows[0].STAFF_ID;
    
    res.status(201).json({
      success: true,
      message: 'Staff created successfully',
      data: {
        staff_id: staffId,
        first_name,
        last_name,
        username
      }
    });
    
  } catch (error) {
    console.error('Staff creation error:', error);
    
    // Handle duplicate username
    if (error.message.includes('ORA-00001') || error.message.includes('unique constraint')) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create staff: ' + error.message
    });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    const {
      first_name,
      last_name,
      phone,
      email,
      role,
      username,
      password,
      salary,
      status
    } = req.body;
    
    // Check if staff exists
    const checkResult = await executeQuery(
      'SELECT staff_id FROM staff WHERE staff_id = :id',
      [staffId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found'
      });
    }
    
    // Build dynamic update query
    let updateFields = [];
    let binds = { staff_id: staffId };
    
    if (first_name !== undefined) {
      updateFields.push('first_name = :first_name');
      binds.first_name = first_name;
    }
    if (last_name !== undefined) {
      updateFields.push('last_name = :last_name');
      binds.last_name = last_name;
    }
    if (phone !== undefined) {
      updateFields.push('phone = :phone');
      binds.phone = phone;
    }
    if (email !== undefined) {
      updateFields.push('email = :email');
      binds.email = email || null;
    }
    if (role !== undefined) {
      updateFields.push('role = :role');
      binds.role = role;
    }
    if (username !== undefined) {
      updateFields.push('username = :username');
      binds.username = username;
    }
    if (password !== undefined && password.trim() !== '') {
      const password_hash = await bcrypt.hash(password, 10);
      updateFields.push('password_hash = :password_hash');
      binds.password_hash = password_hash;
    }
    if (salary !== undefined) {
      updateFields.push('salary = :salary');
      binds.salary = salary ? parseFloat(salary) : null;
    }
    if (status !== undefined) {
      updateFields.push('status = :status');
      binds.status = status;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const sql = `UPDATE staff SET ${updateFields.join(', ')} WHERE staff_id = :staff_id`;
    
    await executeQuery(sql, binds);
    
    res.json({
      success: true,
      message: 'Staff updated successfully'
    });
    
  } catch (error) {
    console.error('Staff update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update staff: ' + error.message
    });
  }
});

// Delete staff (soft delete - change status to INACTIVE)
//  Update DELETE endpoint
// routes/staff.js - FIXED DELETE endpoint
router.delete('/:id', async (req, res) => {
  try {
    const staffId = req.params.id;
    
    console.log('Deleting staff ID:', staffId);
    
    // Check if staff exists and get current status
    const checkResult = await executeQuery(
      'SELECT staff_id, first_name, last_name, status FROM staff WHERE staff_id = :id',
      [staffId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found'
      });
    }
    
    const staff = checkResult.rows[0];
    const currentStatus = staff.STATUS;
    
    // Check if staff is referenced in payments table
    const paymentCheck = await executeQuery(
      'SELECT COUNT(*) as payment_count FROM payments WHERE received_by = :id',
      [staffId]
    );
    
    const paymentCount = paymentCheck.rows[0].PAYMENT_COUNT;
    
    // If staff has payments, check if we can set them to NULL
    if (paymentCount > 0) {
      // Try to update payments to set received_by to NULL
      try {
        await executeQuery(
          'UPDATE payments SET received_by = NULL WHERE received_by = :id',
          [staffId]
        );
        console.log(`Updated ${paymentCount} payments to remove staff reference`);
      } catch (updateError) {
        console.error('Failed to update payments:', updateError.message);
        return res.status(400).json({
          success: false,
          error: `Cannot delete staff. This staff member has processed ${paymentCount} payment(s) and cannot be removed from payment records.`
        });
      }
    }
    
    // Check if staff is referenced in member table (created_by)
    const memberCheck = await executeQuery(
      'SELECT COUNT(*) as member_count FROM member WHERE created_by = :id',
      [staffId]
    );
    
    const memberCount = memberCheck.rows[0].MEMBER_COUNT;
    
    if (memberCount > 0) {
      // Set created_by to NULL for members
      await executeQuery(
        'UPDATE member SET created_by = NULL WHERE created_by = :id',
        [staffId]
      );
      console.log(`Updated ${memberCount} members to remove staff reference`);
    }
    
    // Delete attendance records
    await executeQuery(
      'DELETE FROM staff_attendance WHERE staff_id = :id',
      [staffId]
    );
    
    // Now delete the staff member
    const deleteResult = await executeQuery(
      'DELETE FROM staff WHERE staff_id = :id',
      [staffId]
    );
    
    if (deleteResult.rowsAffected === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete staff from database'
      });
    }
    
    console.log('Staff deleted successfully:', staffId);
    
    res.json({
      success: true,
      message: `Staff member ${staff.FIRST_NAME} ${staff.LAST_NAME} deleted successfully`,
      data: {
        staff_id: staffId,
        name: `${staff.FIRST_NAME} ${staff.LAST_NAME}`,
        previous_status: currentStatus,
        payments_updated: paymentCount,
        members_updated: memberCount
      }
    });
    
  } catch (error) {
    console.error('Staff delete error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle foreign key constraint errors more gracefully
    if (error.message.includes('ORA-02292') || error.message.includes('integrity constraint')) {
      // Fallback to soft delete
      try {
        const staffId = req.params.id;
        await executeQuery(
          'UPDATE staff SET status = \'INACTIVE\' WHERE staff_id = :id',
          [staffId]
        );
        
        return res.json({
          success: true,
          message: 'Staff could not be deleted due to database constraints. Marked as INACTIVE instead.',
          data: {
            action: 'marked_inactive',
            staff_id: staffId
          }
        });
      } catch (softDeleteError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to delete or deactivate staff: ' + softDeleteError.message
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete staff: ' + error.message
    });
  }
});

// Mark staff attendance
router.post('/:id/attendance', async (req, res) => {
  try {
    const staffId = req.params.id;
    const { is_present = 1 } = req.body;
    
    // Check if staff exists
    const checkResult = await executeQuery(
      'SELECT staff_id, first_name, last_name FROM staff WHERE staff_id = :id',
      [staffId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Staff not found'
      });
    }
    
    // Mark attendance using MERGE
    await executeQuery(
      `MERGE INTO staff_attendance sa
       USING (SELECT :staff_id as staff_id, :is_present as is_present FROM DUAL) src
       ON (sa.att_date = TRUNC(SYSDATE) AND sa.staff_id = src.staff_id)
       WHEN MATCHED THEN
         UPDATE SET sa.is_present = src.is_present
       WHEN NOT MATCHED THEN
         INSERT (att_date, staff_id, is_present)
         VALUES (TRUNC(SYSDATE), src.staff_id, src.is_present)`,
      {
        staff_id: parseInt(staffId),
        is_present: is_present ? 1 : 0
      }
    );
    
    const staff = checkResult.rows[0];
    res.json({
      success: true,
      message: `Attendance marked for ${staff.FIRST_NAME} ${staff.LAST_NAME}`,
      data: {
        staff_id: staffId,
        is_present: is_present ? 1 : 0,
        date: new Date().toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    console.error('Staff attendance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark attendance: ' + error.message
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

