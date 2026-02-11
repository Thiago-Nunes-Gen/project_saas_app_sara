-- FUNÇÃO DE LIMPEZA GERAL
-- Esta função deleta TUDO relacionado a um client_id, na ordem correta para não dar erro.
-- USE COM CUIDADO!

CREATE OR REPLACE FUNCTION delete_client_force(p_client_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Deleta dados dependentes (Filhos/Netos)
    DELETE FROM saas_finance_transactions WHERE client_id = p_client_id;
    DELETE FROM saas_finance_context WHERE client_id = p_client_id;
    DELETE FROM saas_finance_monthly_cache WHERE client_id = p_client_id;
    DELETE FROM saas_finance_recent_context WHERE client_id = p_client_id;
    
    DELETE FROM saas_reminders WHERE client_id = p_client_id;
    DELETE FROM saas_appointments WHERE client_id = p_client_id;
    DELETE FROM saas_lists WHERE client_id = p_client_id;
    
    DELETE FROM saas_chat_messages WHERE client_id = p_client_id;
    DELETE FROM saas_n8n_chat_histories WHERE client_id = p_client_id;
    
    DELETE FROM saas_activity_log WHERE client_id = p_client_id;
    DELETE FROM saas_security_logs WHERE client_id = p_client_id;
    DELETE FROM saas_client_sessions WHERE client_id = p_client_id;
    
    DELETE FROM saas_client_preferences WHERE client_id = p_client_id;
    DELETE FROM saas_client_category_preferences WHERE client_id = p_client_id;
    DELETE FROM saas_reports WHERE client_id = p_client_id;
    DELETE FROM saas_documents WHERE whatsapp_id IN (SELECT whatsapp_id FROM saas_clients WHERE id = p_client_id);

    -- 2. Finalmente, deleta o Pai (Cliente)
    DELETE FROM saas_clients WHERE id = p_client_id;
END;
$$;

-- COMO USAR (Exemplo):
-- SELECT delete_client_force('COLE_O_UUID_AQUI');

-- === RODAR ESSAS LINHAS ABAIXO PARA LIMPAR OS SEUS CLIENTES ===
SELECT delete_client_force('4a0cb4ba-3723-4a09-b898-10e4d21a0fc2');
SELECT delete_client_force('919da6f0-02e6-474c-adc7-483b02fb8146');

