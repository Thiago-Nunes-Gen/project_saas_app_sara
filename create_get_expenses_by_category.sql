-- Função RPC para buscar despesas por categoria (Mês Atual)
CREATE OR REPLACE FUNCTION get_expenses_by_category()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id uuid;
    current_date_start date := date_trunc('month', current_date);
    current_date_end date := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
    result jsonb;
BEGIN
    -- 1. Descobre o client_id do usuário logado
    SELECT id INTO v_client_id
    FROM saas_clients
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado ou sem cliente vinculado';
    END IF;

    -- 2. Agrupa por categoria e soma
    SELECT json_agg(t) INTO result
    FROM (
        SELECT 
            category, 
            SUM(amount) as value
        FROM saas_finance_transactions
        WHERE client_id = v_client_id 
        AND type = 'expense' 
        AND date >= current_date_start 
        AND date <= current_date_end
        GROUP BY category
    ) t;

    -- Retorna array vazio se não houver dados
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
