
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
select * from classes;
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

-- member
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Rahim','Sultani', DATE '1995-02-12','0700123456','rahims@gmail.com','Kabul, Karte 3',1);
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Maryam','Naseeri',DATE '1999-11-20','0799456123','maryamn@gmail.com','Kabul, Shahr-e-Naw',2);
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Jawad','Ahmadi',DATE '1990-03-05','0789001122','jawada@gmail.com','Kabul, Makrorayan 2',1);

INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Hamid','Rashidi',DATE '1988-09-11','0700654321','hamidr@gmail.com','Mazar, Karte Ariana',2);
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Sajjad','Fahimi',DATE '1997-12-22','0799876543','sajjadf@gmail.com','Kabul, Kart-e-Parwan',1);

INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Omid','Sangin',DATE '1996-10-01','0799001122','omids@gmail.com','Kabul, Darulaman',2);
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Haseeb','Qaderi',DATE '1994-07-14','0700554433','haseebq@gmail.com','Herat, Injil',2);
INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
VALUES
('Neda','Karim',DATE '2002-01-25','0789012344','nedakarim@gmail.com','Mazar, Dehdadi',1);

-- membership 
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('BASIC_MONTH', 'Basic monthly membership', 30, 800, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('FULL_MONTH', 'Full access monthly membership', 30, 1200, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('QUARTER_BASIC', 'Quarterly basic membership', 90, 2100, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('HALF_YEAR', 'Half-year full membership', 180, 6000, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('ANNUAL_BASIC', 'Annual basic plan', 365, 11000, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('VIP_MONTH', 'VIP monthly membership with all facilities', 30, 2000, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('STUDENT_MONTH', 'Discounted monthly plan for students', 30, 600, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('WEEKEND_PLAN', 'Access on weekends only', 30, 500, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('YOGA_PLAN', 'Yoga and wellness monthly', 30, 700, 'y');
INSERT INTO membership (plan_code, plan_desc, duration_days, price, is_active) VALUES
('CROSSFIT_PLAN', 'CrossFit training monthly', 30, 900, 'y');

-- member_subscriptions
INSERT INTO member_subscriptions (m_id, plan_code, start_date, end_date)
VALUES (13, 'QUARTER_BASIC', SYSDATE - 25, SYSDATE + 5);
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(14, 'QUARTER_BASIC', DATE '2025-10-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(15, 'HALF_YEAR', DATE '2025-07-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(16, 'ANNUAL_BASIC', DATE '2025-01-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(17, 'VIP_MONTH', DATE '2025-12-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(18, 'STUDENT_MONTH', DATE '2025-12-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(19, 'WEEKEND_PLAN', DATE '2025-12-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(20, 'YOGA_PLAN', DATE '2025-12-01', DATE '2025-12-31');
INSERT INTO member_subscriptions ( m_id, plan_code, start_date, end_date) VALUES
(17, 'YOGA_PLAN', DATE '2025-12-01', DATE '2025-12-8');
delete from member_subscriptions where m_id=13;
commit;
-- Insert staff
INSERT INTO staff ( first_name,last_name, phone, email, role, username, password_hash, salary) VALUES
('Ahmad','Hamedi', '0799433222', 'admin@email.com', 'ADMIN', 'admin', 'admin123', 50000);

INSERT INTO staff ( first_name,last_name, phone, email, role, username, password_hash, salary) VALUES
( 'Asif','Mohammadi', '0791781674', 'reception@email.com', 'RECEPTION', 'reception', 'recep123', 30000);

INSERT INTO staff ( first_name,last_name, phone, email, role, username, password_hash, salary) VALUES
( 'Ali','Azizi', '0791733674', null, 'CLEANER', null, null, 3000);

INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Reza','Qasemi','0799010101','rqasemi@gmail.com','ADMIN','reza_admin','rez123',51000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Yama','Payman','0799009900','yamapayman@gmail.com','RECEPTION','yama_rec','yama123',26000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Esmat','Latifi','0799008800','esmatlatifi@gmail.com','CLEANER',NULL,NULL,7500);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Shabnam','Karimi','0799007700','shabnamkarimi@gmail.com','MANAGER','sh_kari','shab123',47000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Farhad','Nouri','0799006600','farhadnoori@gmail.com','ADMIN','farhad_admin','far123',48000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Bilal','Hosseini','0799005500','bilah@gmail.com','CLEANER',NULL,NULL,8000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Sahar','Rahimi','0799004400','sahar.@gmail.com','RECEPTION','sahar_rec','sahar123',28000);
INSERT INTO staff (first_name, last_name, phone, email, role, username, password_hash, salary)
VALUES 
('Fawad','Sediqi','0799003300','fsediqi@yahoo.com','MANAGER','fawad_mgr','mgr123',45000);

-- trainers

INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Murtaza','Karimi','0799550011','m.karimi@gmail.com','Bodybuilding',500);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Tamana','Rahmani','0799550022','t.rahmani@gmail.com','Yoga',400);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Farid','Latifi','0799550033','farid.latifi@yahoo.com','CrossFit',550);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Shakila','Nawabi','0799550044','sh.nawabi@gmail.com','Zumba',450);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Haroon','Qaderi','0799550055','h.qaderi@gmail.com','Strength Training',600);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Wahid','Sakhi','0799550066','wahid.sakhi@gmail.com','Cardio',350);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Nargis','Faizi','0799550077','n.faizi@gmail.com','Pilates',480);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Yasin','Ahmadzai','0799550088','yasin.ah@gmail.com','Kickboxing',550);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Bilquis','Hashimi','0799550099','b.hashimi@gmail.com','Aerobics',400);
INSERT INTO trainers (first_name, last_name, phone, email, specialization, hourly_rate)
VALUES
('Sami','Rohani','0799550100','s.rohani@gmail.com','Martial Arts',650);

-- payments

INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(13,800,'Monthly Basic Fee',2);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(14,1200,'Monthly Full Fee',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(15,2100,'Quarter Basic Payment',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(16,800,'Monthly Renewal',2);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(17,6000,'Half Year Payment',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(18,2000,'VIP Monthly',15);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(19,11000,'Annual Basic Plan',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(20,1200,'Monthly Full Access',2);

-- lockers
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L001',19,'OCCUPIED','K001',DATE'2025-01-01',DATE'2025-02-01',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L002',18,'OCCUPIED','K002',DATE'2025-01-05',DATE'2025-02-05',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L003',NULL,'AVAILABLE',NULL,NULL,NULL,0);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L004',13,'OCCUPIED','K004',DATE'2025-01-10',DATE'2025-02-10',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L005',14,'OCCUPIED','K005',DATE'2025-01-12',DATE'2025-02-12',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L006',NULL,'AVAILABLE',NULL,NULL,NULL,0);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L007',15,'OCCUPIED','K007',DATE'2025-01-20',DATE'2025-02-20',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L008',16,'OCCUPIED','K008',DATE'2025-01-15',DATE'2025-02-15',200);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L009',NULL,'AVAILABLE',NULL,NULL,NULL,0);
INSERT INTO lockers (locker_number, member_id, status, key_number, start_date, end_date, deposit)
VALUES
('L010',17,'OCCUPIED','K010',DATE'2025-01-18',DATE'2025-02-18',200);

-- equipment

INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Treadmill A', 'CARDIO', DATE'2023-05-01', 45000, 'AVAILABLE','Hall A');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Treadmill B', 'CARDIO', DATE'2023-06-11', 46000, 'AVAILABLE','Hall A');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Bench Press', 'STRENGTH', DATE'2022-11-15', 25000, 'IN_USE','Gym Floor');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Squat Rack', 'STRENGTH', DATE'2023-01-20', 30000, 'AVAILABLE','Gym Floor');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Dumbbell Set 1', 'FREE_WEIGHTS', DATE'2023-02-18', 15000, 'AVAILABLE','Weights Area');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Dumbbell Set 2', 'FREE_WEIGHTS', DATE'2023-03-10', 16000,'AVAILABLE','Weights Area');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Elliptical Machine', 'CARDIO', DATE'2023-04-14', 32000,'MAINTENANCE','Workshop');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Leg Press Machine', 'STRENGTH', DATE'2022-10-22', 38000,'IN_USE','Gym Floor');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Rowing Machine', 'CARDIO', DATE'2023-01-30', 35000,'AVAILABLE','Hall B');
INSERT INTO equipment (equipment_name, category, purchase_date, price, status, location)
VALUES
('Pull-up Bar', 'STRENGTH', DATE'2022-12-12', 8000,'AVAILABLE','Gym Floor');



-- Member Attendance

INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE), 13, 1);
INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE), 14, 0);
INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE), 15, 1);
INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE)-1, 15, 1);
INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE)-1, 16, 1);
INSERT INTO member_attendance (att_date, member_id, is_present) VALUES
(TRUNC(SYSDATE)-2, 17, 0);

-- Staff Attendance 

INSERT INTO staff_attendance (att_date, staff_id, is_present) VALUES
(TRUNC(SYSDATE), 15, 1);
INSERT INTO staff_attendance (att_date, staff_id, is_present) VALUES
(TRUNC(SYSDATE), 16, 1);
INSERT INTO staff_attendance (att_date, staff_id, is_present) VALUES
(TRUNC(SYSDATE), 17, 0);
INSERT INTO staff_attendance (att_date, staff_id, is_present) VALUES
(TRUNC(SYSDATE)-1, 4, 1);
INSERT INTO staff_attendance (att_date, staff_id, is_present) VALUES
(TRUNC(SYSDATE)-2, 16, 0);

-- Trainer Attendance 

INSERT INTO trainer_attendance (att_date, trainer_id, is_present) VALUES
(TRUNC(SYSDATE), 11, 1);
INSERT INTO trainer_attendance (att_date, trainer_id, is_present) VALUES
(TRUNC(SYSDATE), 12, 0);
INSERT INTO trainer_attendance (att_date, trainer_id, is_present) VALUES
(TRUNC(SYSDATE)-1, 11, 1);
INSERT INTO trainer_attendance (att_date, trainer_id, is_present) VALUES
(TRUNC(SYSDATE)-1, 12, 1);
INSERT INTO trainer_attendance (att_date, trainer_id, is_present) VALUES
(TRUNC(SYSDATE)-2, 11, 0);


commit;




COMMIT;

-- Verify the user was created
SELECT 
    staff_id,
    first_name || ' ' || last_name as full_name,
    username,
    role,
    status
FROM staff 
WHERE username = 'admin';