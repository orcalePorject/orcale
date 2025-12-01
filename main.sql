
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

create table staff(
    s_id number primary key,
    s_name varchar2(50),
    s_add varchar2(100),
    s_phone varchar2(15),
    s_email varchar2(50),
    s_salary number,
    s_job varchar2(50)
);

create table equipment (
    e_id number primary key,
    e_name varchar2(50),
    e_quantity varchar2(50),
    e_function varchar2(100)
);