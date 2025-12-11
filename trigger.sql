CREATE OR REPLACE TRIGGER trg_update_member_status
AFTER INSERT OR UPDATE ON member_subscriptions
FOR EACH ROW
BEGIN
    IF :NEW.end_date < SYSDATE THEN
        DECLARE
            v_active_sub_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_active_sub_count
            FROM member_subscriptions
            WHERE m_id = :NEW.m_id
            AND end_date >= SYSDATE;
            
            IF v_active_sub_count = 0 THEN
                UPDATE member
                SET status = 'INACTIVE'
                WHERE m_id = :NEW.m_id;
            END IF;
        END;
    END IF;
END;
/