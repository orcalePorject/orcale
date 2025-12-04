
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


select * from member;

create TABLE membership (
    plan_id NUMBER GENERATED ALWAYS as IDENTITY primary key,
    plan_code VARCHAR2(20) unique not NULL,
    plan_desc VARCHAR2(200),
    duration_days NUMBER not NULL,
    price NUMBER not null ,
    is_active CHAR(1) default 'y' not null ,
    CONSTRAINT check_is_active CHECK (is_active in ('y','n'))
)

create table member_subscriptions (
    sub_id NUMBER primary key,
    m_id NUMBER ,
    plan_code VARCHAR2(20) ,
    start_date DATE not NULL,
    end_date DATE not NULL,
    CONSTRAINT fk_membership_in_member_subscriptions foreign key(plan_code) references membership(plan_code),
    CONSTRAINT fk_member_in_member_subscriptions foreign key(m_id) references member(m_id)
)

create table trainers (
    t_id number primary key,
    t_name varchar2(50),    
    t_access varchar2(50),
    t_spec varchar2(100),
    t_salary number
);

insert into  trainers values(1,'shafaq','6:00 - 8:00 PM','strienght trainer',19000);
insert into  trainers values(2,'khalid','5:00 - 7:00 AM','strienght trainer',17000);

select * from TRAINERS;


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

create table equipment (
    e_id number primary key,
    e_name varchar2(50),
    e_quantity varchar2(50),
    e_function varchar2(100)
);