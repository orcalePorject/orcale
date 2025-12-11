-- function for checking
CREATE OR REPLACE FUNCTION fn_check_member_status(
    p_member_id NUMBER
) RETURN VARCHAR2 IS
    v_status VARCHAR2(50);
    v_expiry_date DATE;
BEGIN
--   check member 
    BEGIN
        SELECT status INTO v_status
        FROM member WHERE m_id = p_member_id;
        
        IF v_status != 'ACTIVE' THEN
            RETURN 'MEMBER_NOT_ACTIVE';
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'MEMBER_NOT_FOUND';
    END;
    
        -- check sub is active
    BEGIN
        SELECT MAX(end_date) INTO v_expiry_date
        FROM member_subscriptions
        WHERE m_id = p_member_id
        AND end_date >= SYSDATE;
        
        IF v_expiry_date IS NULL THEN
            RETURN 'NO_ACTIVE_SUBSCRIPTION';
        ELSIF v_expiry_date - SYSDATE <= 7 THEN
            RETURN 'SUBSCRIPTION_EXPIRING_SOON';
        ELSE
            RETURN 'ACTIVE_SUBSCRIPTION_UNTIL_' || TO_CHAR(v_expiry_date, 'DD-MON-YYYY');
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN 'NO_SUBSCRIPTION_FOUND';
    END;
END;
/

-- calculate age

CREATE OR REPLACE FUNCTION fn_calculate_age(
    p_dob DATE
) RETURN NUMBER IS
BEGIN
    RETURN TRUNC(MONTHS_BETWEEN(SYSDATE, p_dob) / 12);
END;
/
SELECT F_NAME,m_id,fn_calculate_age(dob) as age from MEMBER;

-- check class cpacity
CREATE OR REPLACE FUNCTION fn_check_class_capacity(
    p_class_id NUMBER,
    p_date DATE DEFAULT SYSDATE
) RETURN VARCHAR2 IS
    v_current_bookings NUMBER;
    v_max_capacity NUMBER;
BEGIN
    SELECT max_capacity INTO v_max_capacity
    FROM classes WHERE class_id = p_class_id;
    
    SELECT COUNT(*) INTO v_current_bookings
    FROM class_bookings
    WHERE class_id = p_class_id
    AND booking_date = TRUNC(p_date)
    AND status IN ('BOOKED', 'ATTENDED');
    
    IF v_current_bookings >= v_max_capacity THEN
        RETURN 'FULL';
    ELSIF v_current_bookings >= v_max_capacity * 0.8 THEN
        RETURN 'ALMOST_FULL';
    ELSE
        RETURN 'AVAILABLE';
    END IF;
END;
/

SELECT class_name,fn_check_class_capacity(class_id) as status from CLASSES;