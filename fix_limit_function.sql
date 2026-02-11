-- =============================================
-- CORREÇÃO DE BUG: Limite de Agendamentos (V3)
-- =============================================
-- Problema: A função anterior comparava o NOME do plano (ex: 'Plano Gratuito') 
--           com o ID do plano no cliente (ex: 'free').
-- Solução:  Alterado o JOIN para usar p.id = c.plan.
-- Impacto:  Aplica-se a TODOS os planos (Free, Starter, Pro, Enterprise).
--           O Enterprise (limit -1) continua ilimitado.
--           O Free (limit 3) agora será bloqueado corretamente.

-- 1. Recriar a função com a lógica corrigida
CREATE OR REPLACE FUNCTION check_appointments_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Busca contagem atual e limite do plano
  SELECT 
    c.appointments_month,
    p.max_appointments_month
  INTO current_count, max_allowed
  FROM saas_clients c
  -- JOIN CORRIGIDO: usa ID em vez de NAME para garantir o match correto
  JOIN saas_plans p ON p.id = c.plan
  WHERE c.id = NEW.client_id;

  -- Se limite é -1 (ilimitado), permite a inserção
  IF max_allowed = -1 THEN
    RETURN NEW;
  END IF;

  -- Se atingiu ou ultrapassou o limite, bloqueia
  -- Usa COALESCE para evitar erros com NULL
  IF COALESCE(current_count, 0) >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'Limite de agendamentos atingido (% de %)', current_count, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. (Opcional) Tentar rodar um teste simples (comentado para segurança)
-- DO $$
-- BEGIN
--   -- Tenta inserir um agendamento fictício para validar (somente se necessário)
--   -- INSERT INTO saas_appointments ...
-- END $$;
