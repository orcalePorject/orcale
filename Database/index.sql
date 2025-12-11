CREATE INDEX idx_member_name ON member(f_name, l_name);
CREATE INDEX idx_subscription_dates ON member_subscriptions(start_date, end_date);
CREATE INDEX idx_payment_member_date ON payments(member_id, payment_date DESC);
CREATE INDEX idx_booking_class_date ON class_bookings(class_id, booking_date DESC);
CREATE INDEX idx_equipment_status_loc ON equipment(status, location);