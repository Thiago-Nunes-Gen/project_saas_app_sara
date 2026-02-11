-- ============================================================
-- CORREÇÃO URGENTE - Tabelas de cache precisam de INSERT/UPDATE
-- Execute este SQL no Supabase
-- ============================================================

-- saas_finance_monthly_cache
DROP POLICY IF EXISTS "Users can insert own monthly cache" ON saas_finance_monthly_cache;
DROP POLICY IF EXISTS "Users can update own monthly cache" ON saas_finance_monthly_cache;
DROP POLICY IF EXISTS "Users can delete own monthly cache" ON saas_finance_monthly_cache;

CREATE POLICY "Users can insert own monthly cache" ON saas_finance_monthly_cache
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can update own monthly cache" ON saas_finance_monthly_cache
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can delete own monthly cache" ON saas_finance_monthly_cache
    FOR DELETE USING (client_id = get_current_client_id());

-- saas_finance_context (também pode precisar)
DROP POLICY IF EXISTS "Users can insert own finance context" ON saas_finance_context;
DROP POLICY IF EXISTS "Users can update own finance context" ON saas_finance_context;
DROP POLICY IF EXISTS "Users can delete own finance context" ON saas_finance_context;

CREATE POLICY "Users can insert own finance context" ON saas_finance_context
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can update own finance context" ON saas_finance_context
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can delete own finance context" ON saas_finance_context
    FOR DELETE USING (client_id = get_current_client_id());

-- saas_finance_recent_context (também pode precisar)
DROP POLICY IF EXISTS "Users can insert own recent context" ON saas_finance_recent_context;
DROP POLICY IF EXISTS "Users can update own recent context" ON saas_finance_recent_context;
DROP POLICY IF EXISTS "Users can delete own recent context" ON saas_finance_recent_context;

CREATE POLICY "Users can insert own recent context" ON saas_finance_recent_context
    FOR INSERT WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can update own recent context" ON saas_finance_recent_context
    FOR UPDATE USING (client_id = get_current_client_id())
    WITH CHECK (client_id = get_current_client_id());

CREATE POLICY "Users can delete own recent context" ON saas_finance_recent_context
    FOR DELETE USING (client_id = get_current_client_id());

-- saas_activity_log (pode precisar de INSERT)
DROP POLICY IF EXISTS "Users can insert own activity log" ON saas_activity_log;

CREATE POLICY "Users can insert own activity log" ON saas_activity_log
    FOR INSERT WITH CHECK (client_id = get_current_client_id());
