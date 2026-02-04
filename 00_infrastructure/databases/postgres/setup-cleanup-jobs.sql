-- ============================================
-- SETUP AUTOMATIC DATA CLEANUP JOBS
-- Requires pg_cron extension
-- ============================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- AUTH_DB CLEANUP JOBS
-- ============================================

-- Очистка событий аутентификации старше 180 дней (ежедневно в 2:00 AM)
SELECT cron.schedule(
  'cleanup-auth-events',
  '0 2 * * *',
  $$DELETE FROM auth_events WHERE created_at < NOW() - INTERVAL '180 days'$$
);

-- Очистка истекших токенов (ежедневно в 3:00 AM)
SELECT cron.schedule(
  'cleanup-expired-tokens',
  '0 3 * * *',
  $$
    DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = TRUE;
    DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE;
    DELETE FROM email_verification_tokens WHERE expires_at < NOW() OR verified_at IS NOT NULL;
  $$
);

-- Очистка отозванных сессий старше 30 дней (ежедневно в 4:00 AM)
SELECT cron.schedule(
  'cleanup-revoked-sessions',
  '0 4 * * *',
  $$DELETE FROM sessions WHERE revoked = TRUE AND revoked_at < NOW() - INTERVAL '30 days'$$
);

-- ============================================
-- USER_DB CLEANUP JOBS
-- ============================================

-- Очистка outbox_events старше 90 дней (ежедневно в 2:30 AM)
SELECT cron.schedule(
  'cleanup-user-outbox',
  '30 2 * * *',
  $$DELETE FROM outbox_events WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- Очистка аудит-логов старше 365 дней (ежедневно в 5:00 AM)
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 5 * * *',
  $$DELETE FROM user_audit_logs WHERE created_at < NOW() - INTERVAL '365 days'$$
);

-- Очистка уведомлений старше 90 дней для неактивных пользователей (ежедневно в 6:00 AM)
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 6 * * *',
  $$
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '90 days' 
    AND status IN ('read', 'archived')
  $$
);

-- ============================================
-- MONITORING JOBS
-- ============================================

-- Ежедневная статистика размера таблиц (каждый понедельник в 8:00 AM)
SELECT cron.schedule(
  'weekly-table-size-report',
  '0 8 * * 1',
  $$
    INSERT INTO monitoring_table_sizes (table_name, row_count, size_bytes, captured_at)
    SELECT 
      table_name,
      (xpath('/row/cnt/text()', query_to_xml(format('SELECT COUNT(*) as cnt FROM %I', table_name), false, true, '')))[1]::text::int AS row_count,
      pg_total_relation_size(table_name::regclass) AS size_bytes,
      NOW() AS captured_at
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  $$
);

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Automatic cleanup jobs scheduled';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Jobs created:';
  RAISE NOTICE '  - cleanup-auth-events (180 days)';
  RAISE NOTICE '  - cleanup-expired-tokens (daily)';
  RAISE NOTICE '  - cleanup-revoked-sessions (30 days)';
  RAISE NOTICE '  - cleanup-user-outbox (90 days)';
  RAISE NOTICE '  - cleanup-audit-logs (365 days)';
  RAISE NOTICE '  - cleanup-old-notifications (90 days)';
  RAISE NOTICE '============================================';
END $$;