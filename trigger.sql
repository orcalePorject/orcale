CREATE OR REPLACE TRIGGER trg_prevent_duplicate_booking
BEFORE INSERT ON class_bookings
FOR EACH ROW
DECLARE
    v_existing_booking NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_existing_booking
    FROM class_bookings
    WHERE member_id = :NEW.member_id
    AND class_id = :NEW.class_id
    AND booking_date = :NEW.booking_date
    AND status IN ('BOOKED', 'ATTENDED');
    
    IF v_existing_booking > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 
            'Member already has a booking for this class on selected date');
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_payment_audit
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW
DECLARE
    v_operation VARCHAR2(10);
BEGIN
    IF INSERTING THEN
        v_operation := 'INSERT';
        INSERT INTO payment_audit_log VALUES (
            :NEW.payment_id, :NEW.member_id, :NEW.amount, 
            :NEW.payment_date, v_operation, USER, SYSDATE
        );
    ELSIF UPDATING THEN
        v_operation := 'UPDATE';
        INSERT INTO payment_audit_log VALUES (
            :NEW.payment_id, :NEW.member_id, :NEW.amount, 
            :NEW.payment_date, v_operation, USER, SYSDATE
        );
    ELSIF DELETING THEN
        v_operation := 'DELETE';
        INSERT INTO payment_audit_log VALUES (
            :OLD.payment_id, :OLD.member_id, :OLD.amount, 
            :OLD.payment_date, v_operation, USER, SYSDATE
        );
    END IF;
END;
/
