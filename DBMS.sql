BEGIN
    -- 1. JOB: به‌روزرسانی خودکار وضعیت اعضا (هر روز ساعت ۲ بامداد)
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'AUTO_UPDATE_MEMBER_STATUS',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'BEGIN
            UPDATE member m
            SET status = ''INACTIVE''
            WHERE m.status = ''ACTIVE''
            AND NOT EXISTS (
                SELECT 1 FROM member_subscriptions ms
                WHERE ms.m_id = m.m_id
                AND ms.end_date >= SYSDATE
            );
            COMMIT;
        END;',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=DAILY; BYHOUR=2; BYMINUTE=0',
        enabled         => TRUE,
        comments        => 'Auto update member status daily at 2 AM'
    );
    
    -- 2. JOB: پاک‌سازی لاگ‌های قدیمی (هر ماه)
    DBMS_SCHEDULER.CREATE_JOB (
        job_name        => 'CLEAN_OLD_AUDIT_LOGS',
        job_type        => 'PLSQL_BLOCK',
        job_action      => 'BEGIN
            DELETE FROM payment_audit_log
            WHERE changed_date < ADD_MONTHS(SYSDATE, -6); -- حذف لاگ‌های قدیمی‌تر از ۶ ماه
            COMMIT;
        END;',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=MONTHLY; BYMONTHDAY=1; BYHOUR=3',
        enabled         => TRUE,
        comments        => 'Clean old audit logs monthly'
    );
    
    DBMS_OUTPUT.PUT_LINE('DBMS_SCHEDULER jobs created successfully.');
END;
/
