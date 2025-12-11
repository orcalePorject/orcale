<<<<<<< HEAD
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
=======
>>>>>>> 81cfb4cb27fcef74a1fda0e819ec4569ddc86922
