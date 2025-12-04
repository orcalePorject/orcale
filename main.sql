
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