CREATE OR REPLACE VIEW v_active_members AS
SELECT 
    m.m_id,
    m.f_name || ' ' || m.l_name AS full_name,
    m.phone,
    m.email,
    m.join_date,
    mp.plan_code,
    mp.plan_desc,
    ms.start_date,
    ms.end_date,
    CASE 
        WHEN ms.end_date < SYSDATE THEN 'EXPIRED'
        WHEN ms.end_date - SYSDATE <= 7 THEN 'EXPIRING_SOON'
        ELSE 'ACTIVE'
    END AS subscription_status,
    s.first_name || ' ' || s.last_name AS created_by_name
FROM member m
JOIN member_subscriptions ms ON m.m_id = ms.m_id
JOIN membership mp ON ms.plan_code = mp.plan_code
LEFT JOIN staff s ON m.created_by = s.staff_id
WHERE m.status = 'ACTIVE'
AND ms.end_date >= SYSDATE
ORDER BY ms.end_date;
/
-- check any one expried or soon make for this trgger
select * from v_active_members;

-- view daily attendance
CREATE OR REPLACE VIEW v_daily_attendance_summary AS
SELECT 
    att_date,
    'MEMBER' AS person_type,
    COUNT(*) AS total_people,
    SUM(is_present) AS present_count,
    COUNT(*) - SUM(is_present) AS absent_count,
    ROUND(SUM(is_present) * 100 / COUNT(*), 2) AS attendance_rate
FROM member_attendance
WHERE att_date = TRUNC(SYSDATE)
GROUP BY att_date

UNION ALL

SELECT 
    att_date,
    'STAFF' AS person_type,
    COUNT(*) AS total_people,
    SUM(is_present) AS present_count,
    COUNT(*) - SUM(is_present) AS absent_count,
    ROUND(SUM(is_present) * 100 / COUNT(*), 2) AS attendance_rate
FROM staff_attendance
WHERE att_date = TRUNC(SYSDATE)
GROUP BY att_date

UNION ALL

SELECT 
    att_date,
    'TRAINER' AS person_type,
    COUNT(*) AS total_people,
    SUM(is_present) AS present_count,
    COUNT(*) - SUM(is_present) AS absent_count,
    ROUND(SUM(is_present) * 100 / COUNT(*), 2) AS attendance_rate
FROM trainer_attendance
WHERE att_date = TRUNC(SYSDATE)
GROUP BY att_date;
/

CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT 
    TO_CHAR(payment_date, 'YYYY-MM') AS revenue_month,
    COUNT(*) AS transaction_count,
    SUM(amount) AS total_revenue,
    AVG(amount) AS avg_transaction,
    MIN(payment_date) AS first_payment,
    MAX(payment_date) AS last_payment
FROM payments
WHERE payment_date >= ADD_MONTHS(SYSDATE, -12)
GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
ORDER BY revenue_month DESC;
/
select * from V_DAILY_ATTENDANCE_SUMMARY;

COMMIT;



