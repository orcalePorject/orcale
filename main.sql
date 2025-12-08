
create table member (
    m_id number GENERATED ALWAYS as IDENTITY primary key,
    f_name varchar2(50) not null,
    l_name varchar2(50),
    dob date,
    phone varchar2(15) not null,
    email varchar2(100),
    address VARCHAR2(150),
    join_date date default sysdate not null,
    status varchar2(20) default 'ACTIVE' NOT NULL,
    created_at TIMESTAMP default CURRENT_timeStamp,

    CONSTRAINT chk_states CHECK (status in ('ACTIVE','INACTIVE','SUSPENDED','EXPIRED'))
);
alter table member add created_by NUMBER;
alter table member add CONSTRAINT sttaf_in_mem_fk FOREIGN key(created_by) REFERENCES staff(staff_id);

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

select * from member;

-- membership_plans
create TABLE membership (
    plan_id NUMBER GENERATED ALWAYS as IDENTITY primary key,
    plan_code VARCHAR2(20) unique not NULL,
    plan_desc VARCHAR2(200),
    duration_days NUMBER not NULL,
    price NUMBER not null ,
    is_active CHAR(1) default 'y' not null ,
    CONSTRAINT check_is_active CHECK (is_active in ('y','n'))
)
-- member_subscription
create table member_subscriptions (
    sub_id NUMBER primary key,
    m_id NUMBER ,
    plan_code VARCHAR2(20) ,
    start_date DATE not NULL,
    end_date DATE not NULL,
    CONSTRAINT fk_membership_in_member_subscriptions foreign key(plan_code) references membership(plan_code),
    CONSTRAINT fk_member_in_member_subscriptions foreign key(m_id) references member(m_id)
)




-- sequence for staff
CREATE SEQUENCE seq_staff_id START WITH 1 INCREMENT BY 1;

--  staff table
CREATE TABLE staff (
    staff_id      NUMBER DEFAULT seq_staff_id.NEXTVAL CONSTRAINT staf_pk PRIMARY KEY,
    first_name     VARCHAR2(100) NOT NULL,
    last_name     VARCHAR2(100) NOT NULL,
    phone         VARCHAR2(15) NOT NULL,
    email         VARCHAR2(100),
    role      VARCHAR2(50) NOT NULL CONSTRAINT staff_chk_role CHECK (role IN ('ADMIN', 'RECEPTION', 'CLEANER', 'MANAGER')),
    username      VARCHAR2(50) UNIQUE,
    password_hash VARCHAR2(200) ,
    hire_date     DATE DEFAULT SYSDATE,
    salary        NUMBER(10,2),
    status        VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ON_LEAVE')),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE staff
MODIFY  username VARCHAR2(100);
ALTER TABLE staff
MODIFY  password_hash VARCHAR2(100);



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
-- ('Yama','Payman','0799009900','yamapayman@gmail.com','RECEPTION','yama_rec','yama123',26000);
-- ('Esmat','Latifi','0799008800','esmatlatifi@gmail.com','CLEANER',NULL,NULL,7500);
-- ('Shabnam','Karimi','0799007700','shabnamkarimi@gmail.com','MANAGER','sh_kari','shab123',47000);
-- ('Farhad','Nouri','0799006600','farhadnoori@gmail.com','ADMIN','farhad_admin','far123',48000);
-- ('Bilal','Hosseini','0799005500','bilah@gmail.com','CLEANER',NULL,NULL,8000);
-- ('Sahar','Rahimi','0799004400','sahar.@gmail.com','RECEPTION','sahar_rec','sahar123',28000);
-- ('Fawad','Sediqi','0799003300','fsediqi@yahoo.com','MANAGER','fawad_mgr','mgr123',45000);


select * from staff;


CREATE SEQUENCE seq_trainer_id START WITH 1 INCREMENT BY 1;
--  trainers
CREATE TABLE trainers (
    trainer_id     NUMBER DEFAULT seq_trainer_id.NEXTVAL PRIMARY KEY,
    first_name      VARCHAR2(100) NOT NULL,
    last_name      VARCHAR2(100) NOT NULL,
    phone          VARCHAR2(15) NOT NULL,
    email          VARCHAR2(100),
    specialization VARCHAR2(200),
    hire_date      DATE DEFAULT SYSDATE,
    hourly_rate    NUMBER(10,2),
    status         VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);
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


-- create attendance tables 

CREATE TABLE member_attendance (
    att_date    DATE DEFAULT TRUNC(SYSDATE),
    member_id   NUMBER NOT NULL,
    is_present  NUMBER(1) DEFAULT 0,
    CONSTRAINT mem_in_att_fk FOREIGN key(member_id) REFERENCES member(m_id),
     CONSTRAINT m_att_chk check (is_present in (0,1)),
   CONSTRAINT m_att_pk PRIMARY KEY (att_date, member_id)
);


CREATE TABLE staff_attendance (
    att_date    DATE DEFAULT TRUNC(SYSDATE),
    staff_id    NUMBER NOT NULL,
    is_present  NUMBER(1) DEFAULT 0,

    CONSTRAINT sttaf_in_att_fk FOREIGN key(staff_id) REFERENCES staff(staff_id),
    CONSTRAINT s_att_chk check (is_present in (0,1)),
    CONSTRAINT s_att_pk PRIMARY KEY (att_date, staff_id)
);


CREATE TABLE trainer_attendance (
    att_date    DATE DEFAULT TRUNC(SYSDATE),
    trainer_id  NUMBER NOT NULL,
    is_present  NUMBER(1) DEFAULT 0,
    
    CONSTRAINT t_in_att_fk FOREIGN key(trainer_id) REFERENCES trainers(trainer_id),
    CONSTRAINT t_att_chk check (is_present in (0,1)),
    CONSTRAINT t_att_pk PRIMARY KEY (att_date, trainer_id)
);

CREATE SEQUENCE seq_payment_id START WITH 1 INCREMENT BY 1;
--  payments
CREATE TABLE payments (
    payment_id   NUMBER DEFAULT seq_payment_id.NEXTVAL PRIMARY KEY,
    member_id    NUMBER,
    amount       NUMBER(10,2) NOT NULL,
    payment_date DATE DEFAULT SYSDATE,
    description  VARCHAR2(200),
    received_by  NUMBER,
    status       char(1) DEFAULT 'y',
    CONSTRAINT chk_in_payments CHECK (status IN ('y','n')),
    CONSTRAINT mem_in_payment_fk FOREIGN key(member_id) REFERENCES member(m_id),
    CONSTRAINT sttaf_in_payments_fk FOREIGN key(received_by) REFERENCES staff(staff_id)
);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(1,800,'Monthly Basic Fee',2);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(2,1200,'Monthly Full Fee',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(3,2100,'Quarter Basic Payment',3);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(4,800,'Monthly Renewal',2);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(5,6000,'Half Year Payment',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(6,2000,'VIP Monthly',3);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(7,11000,'Annual Basic Plan',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(8,1200,'Monthly Full Access',2);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(9,15000,'Annual Full Access',1);
INSERT INTO payments (member_id, amount, description, received_by)
VALUES
(10,800,'Monthly Basic Fee',3);


CREATE SEQUENCE seq_class_id START WITH 1 INCREMENT BY 1;

-- classes
CREATE TABLE classes (
    class_id      NUMBER DEFAULT seq_class_id.NEXTVAL PRIMARY KEY,
    class_name    VARCHAR2(100) NOT NULL,
    trainer_id    NUMBER,
    description   VARCHAR2(200),
    max_capacity  NUMBER DEFAULT 20,
    duration      NUMBER DEFAULT 60, -- minutes
    is_active     CHAR(1) DEFAULT 'Y',
    CONSTRAINT chk_in_classes CHECK (is_active IN ('Y', 'N')),
    CONSTRAINT t_in_classes_fk FOREIGN key(trainer_id) REFERENCES trainers(trainer_id)
);

CREATE SEQUENCE seq_booking_id START WITH 1 INCREMENT BY 1;
-- class_bookings
CREATE TABLE class_bookings (
    class_id     NUMBER,
    member_id    NUMBER,
    booking_date DATE NOT NULL,
    start_time   TIMESTAMP NOT NULL,
    end_time     TIMESTAMP NOT NULL,
    status       VARCHAR2(20) DEFAULT 'BOOKED', 
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_inbooking_class primary key (class_id,member_id,booking_date),
    CONSTRAINT chk_in_class_booking CHECK (status IN ('BOOKED', 'ATTENDED', 'CANCELLED', 'NO_SHOW'))
);


CREATE SEQUENCE seq_equipment_id START WITH 1 INCREMENT BY 1;
--  equipment
CREATE TABLE equipment (
    equipment_id   NUMBER DEFAULT seq_equipment_id.NEXTVAL PRIMARY KEY,
    equipment_name VARCHAR2(100) NOT NULL,
    category       VARCHAR2(50) ,
    CONSTRAINT chk_in_equipment_category CHECK (category IN ('CARDIO', 'STRENGTH', 'FREE_WEIGHTS')),
    purchase_date  DATE,
    price          NUMBER(10,2),
    status         VARCHAR2(20) DEFAULT 'AVAILABLE',
    CONSTRAINT chk_in_equipment_status CHECK (status IN ('AVAILABLE', 'IN_USE', 'MAINTENANCE')),
    location       VARCHAR2(50),
    last_check     DATE
);



CREATE SEQUENCE seq_locker_id START WITH 1 INCREMENT BY 1;

--  lockers
CREATE TABLE lockers (
    locker_id     NUMBER DEFAULT seq_locker_id.NEXTVAL PRIMARY KEY,
    locker_number VARCHAR2(10) UNIQUE NOT NULL,
    member_id     NUMBER ,
    status        VARCHAR2(20) DEFAULT 'AVAILABLE',
    CONSTRAINT CHK_IN_LOCKER_STATUS CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE','RESERVED')),
    key_number    VARCHAR2(20),
    start_date    DATE,
    end_date      DATE,
    deposit       NUMBER(10,2) DEFAULT 0,
     CONSTRAINT mem_in_locker_fk FOREIGN key(member_id) REFERENCES member(m_id)
    
);



