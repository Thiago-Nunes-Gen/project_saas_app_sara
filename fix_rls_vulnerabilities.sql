-- ============================================================
-- SARA - Correção de Vulnerabilidades RLS (v2)
-- Data: 06/02/2026
-- ============================================================
-- INSTRUÇÕES:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Teste o portal e WhatsApp após cada seção
-- 3. Se algo quebrar, use os comandos de ROLLBACK no final
-- ============================================================

-- ============================================================
-- PARTE 1: Corrigir saas_appointments (policies quebradas)
-- ============================================================
DROP POLICY IF EXISTS "Users can delete own appointments" ON saas_appointments;
DROP POLICY IF EXISTS "Users can insert own appointments" ON saas_appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON saas_appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON saas_appointments;

CREATE POLICY "Users can view own appointments" ON saas_appointments
    FOR SELECT USING (client_id = get_current_client_id());

CREATE POLICY "Users can insert own appointments" ON saas_appointments
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can update own appointments" ON saas_appointments
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can delete own appointments" ON saas_appointments
    FOR DELETE USING (client_id = get_current_client_id());

-- ============================================================
-- PARTE 2: Ativar RLS nas tabelas críticas
-- ============================================================

-- 2.1 saas_chat_messages (CRÍTICO)
ALTER TABLE saas_chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own chat messages" ON saas_chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON saas_chat_messages;

CREATE POLICY "Users can view own chat messages" ON saas_chat_messages
    FOR SELECT USING (client_id = get_current_client_id());

CREATE POLICY "Users can insert own chat messages" ON saas_chat_messages
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

-- 2.2 saas_n8n_chat_histories (CRÍTICO)
ALTER TABLE saas_n8n_chat_histories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own n8n chat history" ON saas_n8n_chat_histories;
DROP POLICY IF EXISTS "Users can view own chat history" ON saas_n8n_chat_histories;

CREATE POLICY "Users can view own n8n chat history" ON saas_n8n_chat_histories
    FOR SELECT USING (client_id = get_current_client_id());

-- 2.3 saas_client_sessions (CRÍTICO)
ALTER TABLE saas_client_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own sessions" ON saas_client_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON saas_client_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON saas_client_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON saas_client_sessions;

CREATE POLICY "Users can view own sessions" ON saas_client_sessions
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON saas_client_sessions
    FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON saas_client_sessions
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can delete own sessions" ON saas_client_sessions
    FOR DELETE USING (auth_user_id = auth.uid());

-- 2.4 saas_verification_codes (CRÍTICO)
ALTER TABLE saas_verification_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own verification codes" ON saas_verification_codes;
DROP POLICY IF EXISTS "Users can insert own verification codes" ON saas_verification_codes;
DROP POLICY IF EXISTS "Users can delete own verification codes" ON saas_verification_codes;

CREATE POLICY "Users can view own verification codes" ON saas_verification_codes
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert own verification codes" ON saas_verification_codes
    FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Users can delete own verification codes" ON saas_verification_codes
    FOR DELETE USING (auth_user_id = auth.uid());

-- ============================================================
-- PARTE 3: Tabelas de risco médio
-- ============================================================

-- 3.1 saas_activity_log
ALTER TABLE saas_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own activity log" ON saas_activity_log;

CREATE POLICY "Users can view own activity log" ON saas_activity_log
    FOR SELECT USING (client_id = get_current_client_id());

-- 3.2 saas_client_category_preferences
ALTER TABLE saas_client_category_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own category preferences" ON saas_client_category_preferences;
DROP POLICY IF EXISTS "Users can update own category preferences" ON saas_client_category_preferences;
DROP POLICY IF EXISTS "Users can insert own category preferences" ON saas_client_category_preferences;

CREATE POLICY "Users can view own category preferences" ON saas_client_category_preferences
    FOR SELECT USING (client_id = get_current_client_id());

CREATE POLICY "Users can update own category preferences" ON saas_client_category_preferences
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can insert own category preferences" ON saas_client_category_preferences
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

-- 3.3 saas_client_preferences
ALTER TABLE saas_client_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own preferences" ON saas_client_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON saas_client_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON saas_client_preferences;

CREATE POLICY "Users can view own preferences" ON saas_client_preferences
    FOR SELECT USING (client_id = get_current_client_id());

CREATE POLICY "Users can update own preferences" ON saas_client_preferences
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can insert own preferences" ON saas_client_preferences
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

-- 3.4 saas_finance_context
ALTER TABLE saas_finance_context ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own finance context" ON saas_finance_context;

CREATE POLICY "Users can view own finance context" ON saas_finance_context
    FOR SELECT USING (client_id = get_current_client_id());

-- 3.5 saas_finance_monthly_cache
ALTER TABLE saas_finance_monthly_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own monthly cache" ON saas_finance_monthly_cache;

CREATE POLICY "Users can view own monthly cache" ON saas_finance_monthly_cache
    FOR SELECT USING (client_id = get_current_client_id());

-- 3.6 saas_finance_recent_context
ALTER TABLE saas_finance_recent_context ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own recent context" ON saas_finance_recent_context;

CREATE POLICY "Users can view own recent context" ON saas_finance_recent_context
    FOR SELECT USING (client_id = get_current_client_id());

-- 3.7 saas_security_logs
ALTER TABLE saas_security_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own security logs" ON saas_security_logs;

CREATE POLICY "Users can view own security logs" ON saas_security_logs
    FOR SELECT USING (client_id = get_current_client_id());

-- ============================================================
-- VERIFICAÇÃO - Execute após o script
-- ============================================================
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
