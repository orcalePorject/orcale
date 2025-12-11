-- register member

CREATE OR REPLACE PROCEDURE sp_register_member(
    p_f_name      VARCHAR2,
    p_l_name      VARCHAR2,
    p_dob         DATE,
    p_phone       VARCHAR2,
    p_email       VARCHAR2,
    p_address     VARCHAR2,
    p_plan_code   VARCHAR2,
    p_created_by  NUMBER
) IS
    v_member_id NUMBER;
    v_duration_days NUMBER;
BEGIN
    -- وارد کردن اطلاعات عضو
    INSERT INTO member (f_name, l_name, dob, phone, email, address, created_by)
    VALUES (p_f_name, p_l_name, p_dob, p_phone, p_email, p_address, p_created_by)
    RETURNING m_id INTO v_member_id;
    
    -- ایجاد اشتراک
    SELECT duration_days INTO v_duration_days
    FROM membership WHERE plan_code = p_plan_code;
    
    INSERT INTO member_subscriptions (m_id, plan_code, start_date, end_date)
    VALUES (v_member_id, p_plan_code, SYSDATE, SYSDATE + v_duration_days);
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('Member registered successfully. ID: ' || v_member_id);
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
        RAISE;
END;
/

BEGIN
 SP_REGISTER_MEMBER('Maner','Ahmadi',Date '2004-09-12','0799776554','maner@gmail.com','Mazer sharif,3 street','VIP_MONTH',15);
 END;
/
BEGIN
 SP_REGISTER_MEMBER('alI','Ahmadi',Date '2002-09-12','0799776554','maner@gmail.com','Mazer sharif,3 street','VIP_MONTH',15);
 END;
/


-- record attendance
CREATE OR REPLACE PROCEDURE sp_record_attendance(
    p_person_id   NUMBER,
    p_person_type VARCHAR2, -- 'MEMBER', 'STAFF', 'TRAINER'
    p_is_present  NUMBER, -- 0,1
    p_att_date    DATE DEFAULT SYSDATE
) IS
BEGIN
    IF p_person_type = 'MEMBER' THEN
        INSERT INTO member_attendance (att_date, member_id, is_present)
        VALUES (TRUNC(p_att_date), p_person_id, p_is_present);
        
    ELSIF p_person_type = 'STAFF' THEN
        INSERT INTO staff_attendance (att_date, staff_id, is_present)
        VALUES (TRUNC(p_att_date), p_person_id, p_is_present);
        
    ELSIF p_person_type = 'TRAINER' THEN
        INSERT INTO trainer_attendance (att_date, trainer_id, is_present)
        VALUES (TRUNC(p_att_date), p_person_id, p_is_present);
    END IF;
    
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Attendance recorded successfully.');
EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        DBMS_OUTPUT.PUT_LINE('Attendance already recorded for this date.');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/
BEGIN 
    sp_record_attendance(18,'MEMBER',1);
end;

SELECT * from MEMBER_ATTENDANCE;

-- process payment
CREATE OR REPLACE PROCEDURE sp_process_payment(
    p_member_id    NUMBER,
    p_amount       NUMBER,
    p_description  VARCHAR2,
    p_received_by  NUMBER
) IS
    v_payment_id NUMBER;
BEGIN
    INSERT INTO payments (member_id, amount, description, received_by)
    VALUES (p_member_id, p_amount, p_description, p_received_by)
    RETURNING payment_id INTO v_payment_id;
    
    DBMS_OUTPUT.PUT_LINE('Payment processed successfully. Payment ID: ' || v_payment_id);
    
    UPDATE member
    SET status = 'ACTIVE'
    WHERE m_id = p_member_id
    AND status = 'INACTIVE';
    
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

BEGIN
    sp_process_payment(
        p_member_id   => 25,
        p_amount      => 500,
        p_description => 'VIP Membership Fee',
        p_received_by => 1
    );
END;
/
BEGIN
    sp_process_payment(
        p_member_id   => 26,
        p_amount      => 500,
        p_description => 'VIP Membership Fee',
        p_received_by => 1
    );
END;
/
SELECT * from MEMBER;