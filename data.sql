
-- insert data classses
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Morning Yoga', 11, 'Yoga class to start your day', 20, 60, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Evening Zumba', 12, 'High-energy Zumba class', 25, 60, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Strength Training', 14, 'Build muscle strength', 15, 90, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Cardio Blast', 15, 'High intensity cardio session', 20, 45, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Pilates Core', 16, 'Pilates for core strength', 20, 50, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Kickboxing Basics', 17, 'Kickboxing techniques', 15, 60, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Bodybuilding Advanced', 18, 'Advanced bodybuilding program', 10, 90, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Martial Arts', 19, 'Learn martial arts', 15, 60, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('CrossFit Challenge', 20, 'High-intensity CrossFit class', 20, 60, 'Y');
INSERT INTO classes (class_name, trainer_id, description, max_capacity, duration, is_active) VALUES
('Functional Training', 20, 'Functional movement and fitness', 20, 60, 'Y');

-- class_bookings 
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(1, 11, DATE '2025-12-09', TIMESTAMP '2025-12-09 07:00:00', TIMESTAMP '2025-12-09 08:00:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(2, 12, DATE '2025-12-09', TIMESTAMP '2025-12-09 18:00:00', TIMESTAMP '2025-12-09 19:00:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(3, 13, DATE '2025-12-09', TIMESTAMP '2025-12-09 17:00:00', TIMESTAMP '2025-12-09 18:30:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(4, 14, DATE '2025-12-09', TIMESTAMP '2025-12-09 16:00:00', TIMESTAMP '2025-12-09 16:45:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(5, 51, DATE '2025-12-09', TIMESTAMP '2025-12-09 08:00:00', TIMESTAMP '2025-12-09 08:50:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(6, 16, DATE '2025-12-09', TIMESTAMP '2025-12-09 18:00:00', TIMESTAMP '2025-12-09 19:00:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(7, 17, DATE '2025-12-09', TIMESTAMP '2025-12-09 06:00:00', TIMESTAMP '2025-12-09 07:30:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(8, 18, DATE '2025-12-09', TIMESTAMP '2025-12-09 19:00:00', TIMESTAMP '2025-12-09 20:00:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(9, 19, DATE '2025-12-09', TIMESTAMP '2025-12-09 17:30:00', TIMESTAMP '2025-12-09 18:30:00', 'BOOKED');
INSERT INTO class_bookings (class_id, member_id, booking_date, start_time, end_time, status) VALUES
(10, 20, DATE '2025-12-09', TIMESTAMP '2025-12-09 15:00:00', TIMESTAMP '2025-12-09 16:00:00', 'BOOKED');
