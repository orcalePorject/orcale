-- Create tables if they don't exist (for testing)

-- Member table
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE member (
        m_id NUMBER GENERATED ALWAYS as IDENTITY primary key,
        f_name varchar2(50) not null,
        l_name varchar2(50),
        dob date,
        phone varchar2(15) not null,
        email varchar2(100),
        address VARCHAR2(150),
        join_date date default sysdate not null,
        status varchar2(20) default ''INACTIVE'' NOT NULL,
        created_at TIMESTAMP default CURRENT_TIMESTAMP,
        created_by NUMBER,
        CONSTRAINT chk_states CHECK (status in (''ACTIVE'',''INACTIVE'',''SUSPENDED'',''EXPIRED''))
    )';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- Membership table
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE membership (
        plan_id NUMBER GENERATED ALWAYS as IDENTITY primary key,
        plan_code VARCHAR2(20) unique not NULL,
        plan_desc VARCHAR2(200),
        duration_days NUMBER not NULL,
        price NUMBER not null ,
        is_active CHAR(1) default ''y'' not null ,
        CONSTRAINT check_is_active CHECK (is_active in (''y'',''n''))
    )';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- Insert sample membership plans
INSERT INTO membership (plan_code, plan_desc, duration_days, price) 
VALUES ('VIP_MONTH', 'VIP Monthly Membership', 30, 50000);

INSERT INTO membership (plan_code, plan_desc, duration_days, price) 
VALUES ('VIP_YEAR', 'VIP Yearly Membership', 365, 500000);

INSERT INTO membership (plan_code, plan_desc, duration_days, price) 
VALUES ('BASIC_MONTH', 'Basic Monthly Membership', 30, 25000);

COMMIT;

-- Member subscriptions table
BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE member_subscriptions (
        sub_id NUMBER GENERATED ALWAYS as IDENTITY primary key,
        m_id NUMBER ,
        plan_code VARCHAR2(20) ,
        start_date DATE not NULL,
        end_date DATE not NULL,
        CONSTRAINT fk_membership_in_member_subscriptions foreign key(plan_code) references membership(plan_code),
        CONSTRAINT fk_member_in_member_subscriptions foreign key(m_id) references member(m_id)
    )';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- Staff table
BEGIN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE seq_staff_id START WITH 1 INCREMENT BY 1';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'CREATE TABLE staff (
        staff_id      NUMBER DEFAULT seq_staff_id.NEXTVAL PRIMARY KEY,
        first_name     VARCHAR2(100) NOT NULL,
        last_name     VARCHAR2(100) NOT NULL,
        phone         VARCHAR2(15) NOT NULL,
        email         VARCHAR2(100),
        role      VARCHAR2(50) NOT NULL CHECK (role IN (''ADMIN'', ''RECEPTION'', ''CLEANER'', ''MANAGER'')),
        username      VARCHAR2(100) UNIQUE,
        password_hash VARCHAR2(100) ,
        hire_date     DATE DEFAULT SYSDATE,
        salary        NUMBER(10,2),
        status        VARCHAR2(20) DEFAULT ''ACTIVE'' CHECK (status IN (''ACTIVE'', ''INACTIVE'', ''ON_LEAVE'')),
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
            RAISE;
        END IF;
END;
/

-- Insert default admin user (password: admin123)
INSERT INTO staff (
    first_name, last_name, phone, email, role, username, password_hash
) VALUES (
    'Admin', 'User', '1234567890', 'admin@gym.com', 'ADMIN', 'admin',
    '$2a$10$YourHashedPasswordHere' -- Use bcrypt hash of 'admin123'
);

COMMIT;

-- Add foreign key constraint for member.created_by
BEGIN
    EXECUTE IMMEDIATE 'ALTER TABLE member ADD CONSTRAINT sttaf_in_mem_fk FOREIGN key(created_by) REFERENCES staff(staff_id)';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -2275 AND SQLCODE != -1442 THEN
            RAISE;
        END IF;
END;
/