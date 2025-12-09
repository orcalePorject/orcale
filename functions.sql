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
SELECT F_NAME,m_id,fn_check_member_status(m_id) from MEMBER;