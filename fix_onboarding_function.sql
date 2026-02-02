-- ========================================
-- FIX: Adicionar client_id no retorno da função saas_onboarding_flow
-- ========================================
-- PROBLEMA: A função não estava retornando client_id em todas as ações
-- SOLUÇÃO: Adicionar 'client_id' em todos os jsonb_build_object
-- ========================================

CREATE OR REPLACE FUNCTION saas_onboarding_flow(
  p_whatsapp_id text,
  p_acao text,
  p_valor text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_client_id uuid;
  v_step text;
  v_name text;
  v_apelido text;
  v_subscription_step text;
  v_subscription_plan text;
  v_result jsonb;
BEGIN

  -- Buscar cliente existente
  SELECT
    id,
    onboarding_step,
    name,
    apelido,
    subscription_flow_step,
    subscription_flow_plan
  INTO
    v_client_id,
    v_step,
    v_name,
    v_apelido,
    v_subscription_step,
    v_subscription_plan
  FROM saas_clients
  WHERE whatsapp_id = p_whatsapp_id;

  -- ========================================
  -- AÇÃO: verificar_status
  -- ========================================
  IF p_acao = 'verificar_status' THEN
    IF v_client_id IS NULL THEN
      -- Novo usuário - começa em 'welcome'
      INSERT INTO saas_clients (whatsapp_id, name, status, plan, onboarding_step)
      VALUES (p_whatsapp_id, 'Novo Usuário', 'trial', 'free', 'welcome')
      RETURNING id, onboarding_step INTO v_client_id, v_step;

      RETURN jsonb_build_object(
        'status', 'novo_usuario',
        'step', 'welcome',
        'client_id', v_client_id,
        'msg', 'Usuário criado, mostrando boas-vindas'
      );
    ELSE
      -- Usuário existente
      RETURN jsonb_build_object(
        'status', CASE WHEN v_step = 'completed' THEN 'ativo' ELSE 'onboarding' END,
        'step', v_step,
        'client_id', v_client_id,
        'name', v_name,
        'apelido', v_apelido,
        'subscription_flow_step', v_subscription_step,
        'subscription_flow_plan', v_subscription_plan,
        'msg', CASE WHEN v_step = 'completed' THEN 'Usuário ativo' ELSE 'Onboarding em andamento' END
      );
    END IF;
  END IF;

  -- ========================================
  -- AÇÃO: avancar_para_lgpd (após welcome)
  -- ========================================
  IF p_acao = 'avancar_para_lgpd' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    UPDATE saas_clients
    SET onboarding_step = 'lgpd',
        updated_at = NOW()
    WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'lgpd',
      'client_id', v_client_id,
      'msg', 'Avançou para etapa de LGPD'
    );
  END IF;

  -- ========================================
  -- AÇÃO: aceitar_lgpd
  -- ========================================
  IF p_acao = 'aceitar_lgpd' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    UPDATE saas_clients
    SET lgpd_accepted_at = NOW(),
        onboarding_step = 'name',
        updated_at = NOW()
    WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'name',
      'client_id', v_client_id,
      'msg', 'LGPD aceita com sucesso'
    );
  END IF;

  -- ========================================
  -- AÇÃO: avancar_welcome (mantida para compatibilidade)
  -- ========================================
  IF p_acao = 'avancar_welcome' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    UPDATE saas_clients
    SET onboarding_step = 'name',
        updated_at = NOW()
    WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'name',
      'client_id', v_client_id,
      'msg', 'Avançou para etapa de nome'
    );
  END IF;

  -- ========================================
  -- AÇÃO: salvar_nome
  -- ========================================
  IF p_acao = 'salvar_nome' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    IF p_valor IS NULL OR trim(p_valor) = '' THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Nome não informado');
    END IF;

    UPDATE saas_clients
    SET name = trim(p_valor),
        onboarding_step = 'apelido',
        updated_at = NOW()
    WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'apelido',
      'client_id', v_client_id,
      'name', trim(p_valor),
      'msg', 'Nome salvo com sucesso'
    );
  END IF;

  -- ========================================
  -- AÇÃO: salvar_apelido
  -- ========================================
  IF p_acao = 'salvar_apelido' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    -- Se não informar apelido, usa primeiro nome
    IF p_valor IS NULL OR trim(p_valor) = '' OR lower(trim(p_valor)) IN ('não', 'nao', 'n', 'pular', 'nenhum') THEN
      SELECT split_part(name, ' ', 1) INTO p_valor FROM saas_clients WHERE id = v_client_id;
    END IF;

    UPDATE saas_clients
    SET apelido = trim(p_valor),
        onboarding_step = 'cidade',
        updated_at = NOW()
    WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'cidade',
      'client_id', v_client_id,
      'apelido', trim(p_valor),
      'msg', 'Apelido salvo com sucesso'
    );
  END IF;

  -- ========================================
  -- AÇÃO: salvar_cidade
  -- ========================================
  IF p_acao = 'salvar_cidade' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    -- Extrai cidade e UF se informado no formato "Cidade - UF" ou "Cidade/UF"
    DECLARE
      v_cidade text;
      v_uf text := NULL;
      v_input text := trim(p_valor);
    BEGIN
      -- Tenta extrair UF se tiver separador
      IF v_input ~ '[-/,]\s*[A-Za-z]{2}\s*$' THEN
        v_uf := upper(trim(substring(v_input from '[-/,]\s*([A-Za-z]{2})\s*$')));
        v_cidade := trim(regexp_replace(v_input, '[-/,]\s*[A-Za-z]{2}\s*$', ''));
      ELSE
        v_cidade := v_input;
      END IF;

      -- Capitaliza a cidade
      v_cidade := initcap(v_cidade);

      UPDATE saas_clients
      SET cidade = v_cidade,
          uf = COALESCE(v_uf, uf),
          onboarding_step = 'plans',
          updated_at = NOW()
      WHERE id = v_client_id;

      RETURN jsonb_build_object(
        'status', 'sucesso',
        'step', 'plans',
        'client_id', v_client_id,
        'cidade', v_cidade,
        'uf', v_uf,
        'msg', 'Cidade salva com sucesso'
      );
    END;
  END IF;

  -- ========================================
  -- AÇÃO: finalizar_onboarding
  -- ========================================
  IF p_acao = 'finalizar_onboarding' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    UPDATE saas_clients
    SET onboarding_step = 'completed',
        first_interaction_at = COALESCE(first_interaction_at, NOW()),
        trial_ends_at = NOW() + INTERVAL '7 days',
        updated_at = NOW()
    WHERE id = v_client_id;

    SELECT name, apelido INTO v_name, v_apelido
    FROM saas_clients WHERE id = v_client_id;

    RETURN jsonb_build_object(
      'status', 'sucesso',
      'step', 'completed',
      'client_id', v_client_id,
      'name', v_name,
      'apelido', v_apelido,
      'trial_days', 7,
      'msg', 'Onboarding finalizado com sucesso!'
    );
  END IF;

  -- ========================================
  -- AÇÃO: obter_dados_cliente
  -- ========================================
  IF p_acao = 'obter_dados_cliente' THEN
    IF v_client_id IS NULL THEN
      RETURN jsonb_build_object('status', 'erro', 'msg', 'Usuário não encontrado');
    END IF;

    SELECT jsonb_build_object(
      'status', 'sucesso',
      'client_id', id,
      'name', name,
      'apelido', apelido,
      'whatsapp_id', whatsapp_id,
      'plan', plan,
      'status', status,
      'timezone', timezone,
      'cidade', cidade,
      'uf', uf,
      'bot_name', bot_name,
      'bot_personality', bot_personality,
      'onboarding_step', onboarding_step,
      'trial_ends_at', trial_ends_at,
      'max_reminders', max_reminders,
      'max_lists', max_lists,
      'max_transactions_month', max_transactions_month,
      'subscription_flow_step', subscription_flow_step,
      'subscription_flow_plan', subscription_flow_plan
    ) INTO v_result
    FROM saas_clients
    WHERE id = v_client_id;

    RETURN v_result;
  END IF;

  -- Ação não reconhecida
  RETURN jsonb_build_object(
    'status', 'erro',
    'msg', 'Ação não reconhecida: ' || p_acao
  );

END;
$$;

-- ========================================
-- TESTE: Verificar se a função está retornando client_id
-- ========================================
-- Descomente a linha abaixo para testar (substitua o whatsapp_id)
-- SELECT saas_onboarding_flow('5516997515087', 'obter_dados_cliente', NULL);
