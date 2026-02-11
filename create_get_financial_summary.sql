-- Função RPC para buscar resumo financeiro (Mês Atual vs Mês Anterior)
-- ATUALIZADA: Identifica o cliente automaticamente pelo usuário logado (Mais Seguro)
CREATE OR REPLACE FUNCTION get_financial_summary()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_id uuid;
    
    -- Datas
    current_date_start date := date_trunc('month', current_date);
    current_date_end date := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
    last_month_start date := date_trunc('month', current_date - interval '1 month');
    last_month_end date := (date_trunc('month', current_date) - interval '1 day')::date;
    
    -- Valores
    cur_income numeric := 0;
    cur_expense numeric := 0;
    last_income numeric := 0;
    last_expense numeric := 0;
BEGIN
    -- 1. Descobre o client_id do usuário logado (Segurança Total)
    SELECT id INTO v_client_id
    FROM saas_clients
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    -- Se não encontrar cliente (ex: não logado), retorna nulo ou erro
    IF v_client_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado ou sem cliente vinculado';
    END IF;

    -- Mês Atual
    SELECT COALESCE(SUM(amount), 0) INTO cur_income
    FROM saas_finance_transactions
    WHERE client_id = v_client_id 
    AND type = 'income' 
    AND date >= current_date_start AND date <= current_date_end;

    SELECT COALESCE(SUM(amount), 0) INTO cur_expense
    FROM saas_finance_transactions
    WHERE client_id = v_client_id 
    AND type = 'expense' 
    AND date >= current_date_start AND date <= current_date_end;

    -- Mês Anterior
    SELECT COALESCE(SUM(amount), 0) INTO last_income
    FROM saas_finance_transactions
    WHERE client_id = v_client_id 
    AND type = 'income' 
    AND date >= last_month_start AND date <= last_month_end;

    SELECT COALESCE(SUM(amount), 0) INTO last_expense
    FROM saas_finance_transactions
    WHERE client_id = v_client_id 
    AND type = 'expense' 
    AND date >= last_month_start AND date <= last_month_end;

    -- Retorna JSON estruturado
    RETURN json_build_object(
        'current_month', json_build_object(
            'income', cur_income,
            'expense', cur_expense,
            'balance', cur_income - cur_expense
        ),
        'last_month', json_build_object(
            'income', last_income,
            'expense', last_expense,
            'balance', last_income - last_expense
        )
    );
END;
$$;
