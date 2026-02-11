-- Função RPC para buscar fluxo diário (Receitas x Despesas) do Mês Atual
CREATE OR REPLACE FUNCTION get_daily_financial_flow()
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

    -- 2. Agrupa por dia e soma receitas e despesas
    SELECT json_agg(t ORDER BY day ASC) INTO result
    FROM (
        SELECT 
            to_char(date, 'DD') as day, -- Retorna o dia (01, 02, etc)
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM saas_finance_transactions
        WHERE client_id = v_client_id 
        AND date >= current_date_start 
        AND date <= current_date_end
        GROUP BY date
    ) t;

    -- Retorna array vazio se não houver dados
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
