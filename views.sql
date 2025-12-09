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
COMMIT;



