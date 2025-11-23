
create table member (
    m_id number primary key,
    f_name varchar2(50),
    fa_name varchar2(50),
    dob date,
    phone varchar2(15),
    join_date date,
    status varchar2(20)
);

select * from member;

create table trainers (
    t_id number primary key,
    t_name varchar2(50),    
    t_access varchar2(50),
    t_spec varchar2(100),
    t_salary number
);

create table staff(
    s_id number primary key,
    s_name varchar2(50),
    s_add varchar2(100),
    s_phone varchar2(15),
    s_email varchar2(50),
    s_salary number,
    s_job varchar2(50)
);