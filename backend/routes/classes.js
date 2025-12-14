const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/oracle');

// Get all classes
router.get('/', async (req, res) => {
  try {
    const { is_active, trainer_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let binds = {};
    
    if (is_active) {
      whereClause += ' AND c.is_active = :is_active';
      binds.is_active = is_active;
    }
    
    if (trainer_id) {
      whereClause += ' AND c.trainer_id = :trainer_id';
      binds.trainer_id = trainer_id;
    }
    
    const result = await executeQuery(
      `SELECT 
        c.class_id,
        c.class_name,
        c.trainer_id,
        t.first_name || ' ' || t.last_name as trainer_name,
        c.description,
        c.max_capacity,
        c.duration,
        c.is_active,
        COUNT(cb.member_id) as current_bookings,
        TO_CHAR(c.class_id) as class_code
       FROM classes c
       LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
       LEFT JOIN class_bookings cb ON c.class_id = cb.class_id 
         AND cb.booking_date = TRUNC(SYSDATE)
         AND cb.status IN ('BOOKED', 'ATTENDED')
       ${whereClause}
       GROUP BY 
         c.class_id, c.class_name, c.trainer_id, 
         t.first_name, t.last_name, c.description,
         c.max_capacity, c.duration, c.is_active
       ORDER BY c.class_name`,
      binds
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch classes'
    });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    
    const result = await executeQuery(
      `SELECT 
        c.*,
        t.first_name || ' ' || t.last_name as trainer_name,
        t.phone as trainer_phone,
        t.email as trainer_email,
        (SELECT COUNT(*) FROM class_bookings cb 
         WHERE cb.class_id = c.class_id 
         AND cb.booking_date = TRUNC(SYSDATE)
         AND cb.status IN ('BOOKED', 'ATTENDED')) as today_bookings
       FROM classes c
       LEFT JOIN trainers t ON c.trainer_id = t.trainer_id
       WHERE c.class_id = :id`,
      [classId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    // Get upcoming bookings for this class
    const bookingsResult = await executeQuery(
      `SELECT 
        cb.member_id,
        m.f_name || ' ' || m.l_name as member_name,
        TO_CHAR(cb.booking_date, 'YYYY-MM-DD') as booking_date,
        TO_CHAR(cb.start_time, 'HH24:MI') as start_time,
        TO_CHAR(cb.end_time, 'HH24:MI') as end_time,
        cb.status
       FROM class_bookings cb
       JOIN member m ON cb.member_id = m.m_id
       WHERE cb.class_id = :class_id
       AND cb.booking_date >= TRUNC(SYSDATE)
       ORDER BY cb.booking_date, cb.start_time`,
      [classId]
    );
    
    res.json({
      success: true,
      data: {
        ...result.rows[0],
        bookings: bookingsResult.rows
      }
    });
  } catch (error) {
    console.error('Class fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch class details'
    });
  }
});

// Create new class
router.post('/', async (req, res) => {
  try {
    const {
      class_name,
      trainer_id,
      description,
      max_capacity = 20,
      duration = 60,
      is_active = 'Y'
    } = req.body;
    
    if (!class_name || !trainer_id) {
      return res.status(400).json({
        success: false,
        error: 'Class name and trainer ID are required'
      });
    }
    
    // Check if trainer exists
    const trainerCheck = await executeQuery(
      'SELECT trainer_id FROM trainers WHERE trainer_id = :trainer_id AND status = \'ACTIVE\'',
      [trainer_id]
    );
    
    if (trainerCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Trainer not found or inactive'
      });
    }
    
    const result = await executeQuery(
      `INSERT INTO classes (
        class_name, trainer_id, description, 
        max_capacity, duration, is_active
      ) VALUES (
        :class_name, :trainer_id, :description,
        :max_capacity, :duration, :is_active
      )`,
      {
        class_name,
        trainer_id: parseInt(trainer_id),
        description: description || null,
        max_capacity: parseInt(max_capacity),
        duration: parseInt(duration),
        is_active
      }
    );
    
    // Get the new class ID
    const idResult = await executeQuery('SELECT MAX(class_id) as class_id FROM classes');
    const classId = idResult.rows[0].CLASS_ID;
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: {
        class_id: classId,
        class_name,
        trainer_id
      }
    });
  } catch (error) {
    console.error('Class creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create class: ' + error.message
    });
  }
});

// Update class
router.put('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    const {
      class_name,
      trainer_id,
      description,
      max_capacity,
      duration,
      is_active
    } = req.body;
    
    // Check if class exists
    const checkResult = await executeQuery(
      'SELECT class_id FROM classes WHERE class_id = :id',
      [classId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    // Build dynamic update query
    let updateFields = [];
    let binds = { class_id: classId };
    
    if (class_name !== undefined) {
      updateFields.push('class_name = :class_name');
      binds.class_name = class_name;
    }
    if (trainer_id !== undefined) {
      // Verify trainer exists
      const trainerCheck = await executeQuery(
        'SELECT trainer_id FROM trainers WHERE trainer_id = :trainer_id',
        [trainer_id]
      );
      
      if (trainerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Trainer not found'
        });
      }
      
      updateFields.push('trainer_id = :trainer_id');
      binds.trainer_id = parseInt(trainer_id);
    }
    if (description !== undefined) {
      updateFields.push('description = :description');
      binds.description = description || null;
    }
    if (max_capacity !== undefined) {
      updateFields.push('max_capacity = :max_capacity');
      binds.max_capacity = parseInt(max_capacity);
    }
    if (duration !== undefined) {
      updateFields.push('duration = :duration');
      binds.duration = parseInt(duration);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = :is_active');
      binds.is_active = is_active;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    const sql = `UPDATE classes SET ${updateFields.join(', ')} WHERE class_id = :class_id`;
    
    await executeQuery(sql, binds);
    
    res.json({
      success: true,
      message: 'Class updated successfully'
    });
  } catch (error) {
    console.error('Class update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update class: ' + error.message
    });
  }
});

// Delete class (soft delete - set is_active to 'N')
router.delete('/:id', async (req, res) => {
  try {
    const classId = req.params.id;
    
    // Check if class exists
    const checkResult = await executeQuery(
      'SELECT class_id, class_name FROM classes WHERE class_id = :id',
      [classId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    const classData = checkResult.rows[0];
    
    // Check if there are upcoming bookings
    const bookingsCheck = await executeQuery(
      `SELECT COUNT(*) as upcoming_bookings FROM class_bookings 
       WHERE class_id = :class_id 
       AND booking_date >= TRUNC(SYSDATE)
       AND status IN ('BOOKED', 'ATTENDED')`,
      [classId]
    );
    
    const upcomingBookings = bookingsCheck.rows[0].UPCOMING_BOOKINGS;
    
    if (upcomingBookings > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete class. There are ${upcomingBookings} upcoming bookings. Cancel them first or mark class as inactive.`
      });
    }
    
    // Soft delete - set is_active to 'N'
    await executeQuery(
      'UPDATE classes SET is_active = \'N\' WHERE class_id = :id',
      [classId]
    );
    
    res.json({
      success: true,
      message: `Class "${classData.CLASS_NAME}" marked as inactive`,
      data: {
        class_id: classId,
        class_name: classData.CLASS_NAME
      }
    });
  } catch (error) {
    console.error('Class delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete class: ' + error.message
    });
  }
});

// Book a class for a member
router.post('/:id/book', async (req, res) => {
  try {
    const classId = req.params.id;
    const { member_id, booking_date, start_time, end_time } = req.body;
    
    if (!member_id || !booking_date || !start_time) {
      return res.status(400).json({
        success: false,
        error: 'Member ID, booking date, and start time are required'
      });
    }
    
    // Check if class exists and is active
    const classCheck = await executeQuery(
      'SELECT class_id, class_name, max_capacity, is_active FROM classes WHERE class_id = :class_id',
      [classId]
    );
    
    if (classCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Class not found'
      });
    }
    
    const classData = classCheck.rows[0];
    
    if (classData.IS_ACTIVE !== 'Y') {
      return res.status(400).json({
        success: false,
        error: 'Class is not active'
      });
    }
    
    // Check if member exists and is active
    const memberCheck = await executeQuery(
      'SELECT m_id, f_name, l_name, status FROM member WHERE m_id = :member_id',
      [member_id]
    );
    
    if (memberCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }
    
    const member = memberCheck.rows[0];
    
    if (member.STATUS !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Member is not active'
      });
    }
    
    // Check class capacity for the date
    const capacityCheck = await executeQuery(
      `SELECT COUNT(*) as booked_count FROM class_bookings 
       WHERE class_id = :class_id 
       AND booking_date = TO_DATE(:booking_date, 'YYYY-MM-DD')
       AND status IN ('BOOKED', 'ATTENDED')`,
      {
        class_id: classId,
        booking_date: booking_date
      }
    );
    
    const bookedCount = capacityCheck.rows[0].BOOKED_COUNT;
    
    if (bookedCount >= classData.MAX_CAPACITY) {
      return res.status(400).json({
        success: false,
        error: `Class is full. Maximum capacity: ${classData.MAX_CAPACITY}`
      });
    }
    
    // Check if member already booked for this date
    const existingBookingCheck = await executeQuery(
      `SELECT COUNT(*) as existing_booking FROM class_bookings 
       WHERE class_id = :class_id 
       AND member_id = :member_id
       AND booking_date = TO_DATE(:booking_date, 'YYYY-MM-DD')
       AND status IN ('BOOKED', 'ATTENDED')`,
      {
        class_id: classId,
        member_id: member_id,
        booking_date: booking_date
      }
    );
    
    if (existingBookingCheck.rows[0].EXISTING_BOOKING > 0) {
      return res.status(400).json({
        success: false,
        error: 'Member already has a booking for this class on selected date'
      });
    }
    
    // Create booking
    await executeQuery(
      `INSERT INTO class_bookings (
        class_id, member_id, booking_date, 
        start_time, end_time, status
      ) VALUES (
        :class_id, :member_id, TO_DATE(:booking_date, 'YYYY-MM-DD'),
        TO_TIMESTAMP(:start_time, 'YYYY-MM-DD HH24:MI:SS'),
        TO_TIMESTAMP(:end_time, 'YYYY-MM-DD HH24:MI:SS'),
        'BOOKED'
      )`,
      {
        class_id: classId,
        member_id: member_id,
        booking_date: booking_date,
        start_time: `${booking_date} ${start_time}:00`,
        end_time: end_time ? `${booking_date} ${end_time}:00` : `${booking_date} ${start_time}:00`
      }
    );
    
    res.status(201).json({
      success: true,
      message: `Booking created for ${member.F_NAME} ${member.L_NAME}`,
      data: {
        class_id: classId,
        class_name: classData.CLASS_NAME,
        member_id: member_id,
        member_name: `${member.F_NAME} ${member.L_NAME}`,
        booking_date: booking_date,
        start_time: start_time
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    
    // Handle duplicate booking error (from trigger)
    if (error.message.includes('ORA-20001')) {
      return res.status(400).json({
        success: false,
        error: error.message.replace('ORA-20001: ', '')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create booking: ' + error.message
    });
  }
});

// Get class bookings
router.get('/:id/bookings', async (req, res) => {
  try {
    const classId = req.params.id;
    const { date } = req.query;
    
    let whereClause = 'WHERE cb.class_id = :class_id';
    let binds = { class_id: classId };
    
    if (date) {
      whereClause += ' AND cb.booking_date = TO_DATE(:date, \'YYYY-MM-DD\')';
      binds.date = date;
    } else {
      whereClause += ' AND cb.booking_date >= TRUNC(SYSDATE)';
    }
    
    const result = await executeQuery(
      `SELECT 
        cb.booking_id,
        cb.member_id,
        m.f_name || ' ' || m.l_name as member_name,
        m.phone as member_phone,
        TO_CHAR(cb.booking_date, 'YYYY-MM-DD') as booking_date,
        TO_CHAR(cb.start_time, 'HH24:MI') as start_time,
        TO_CHAR(cb.end_time, 'HH24:MI') as end_time,
        cb.status,
        TO_CHAR(cb.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
       FROM class_bookings cb
       JOIN member m ON cb.member_id = m.m_id
       ${whereClause}
       ORDER BY cb.booking_date, cb.start_time`,
      binds
    );
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Bookings fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

module.exports = router;