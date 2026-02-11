-- =============================================
-- SCRIPT DE CORREÇÃO TOTAL: Limites e Contadores (SARA SaaS)
-- =============================================
-- 1. Corrige o bug do JOIN nos agendamentos.
-- 2. Cria gatilhos (triggers) que faltavam para Transações, Lembretes e Listas.
-- 3. Recalcula os contadores atuais de todos os clientes para corrigir dados defasados.

-- =============================================
-- 1. AGENDAMENTOS (Correção Bug)
-- =============================================
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
  JOIN saas_plans p ON p.id = c.plan -- JOIN CORRIGIDO (ID vs ID)
  WHERE c.id = NEW.client_id;

  IF max_allowed = -1 THEN RETURN NEW; END IF;

  IF COALESCE(current_count, 0) >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'Limite de agendamentos atingido (% de %)', current_count, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 2. TRANSAÇÕES FINANCEIRAS (Novos Triggers)
-- =============================================
-- 2.1 Função para bloquear se exceder limite
CREATE OR REPLACE FUNCTION check_transactions_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT c.transactions_month, p.max_transactions_month
  INTO current_count, max_allowed
  FROM saas_clients c
  JOIN saas_plans p ON p.id = c.plan
  WHERE c.id = NEW.client_id;

  IF max_allowed = -1 THEN RETURN NEW; END IF;
  
  -- Bloqueia se atingiu limite
  IF COALESCE(current_count, 0) >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'Limite de transações mensais atingido (% de %)', current_count, max_allowed;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Função para incrementar contador
CREATE OR REPLACE FUNCTION increment_transactions_month()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE saas_clients 
  SET transactions_month = COALESCE(transactions_month, 0) + 1,
      updated_at = NOW()
  WHERE id = NEW.client_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.3 Aplicar Triggers na tabela (Drop se existir para evitar erro)
DROP TRIGGER IF EXISTS trg_check_limits ON saas_finance_transactions;
CREATE TRIGGER trg_check_limits 
BEFORE INSERT ON saas_finance_transactions 
FOR EACH ROW EXECUTE FUNCTION check_transactions_limit();

DROP TRIGGER IF EXISTS trg_increment_count ON saas_finance_transactions;
CREATE TRIGGER trg_increment_count 
AFTER INSERT ON saas_finance_transactions 
FOR EACH ROW EXECUTE FUNCTION increment_transactions_month();

-- =============================================
-- 3. LEMBRETES (Novos Triggers - Contagem de ATIVOS)
-- =============================================
-- 3.1 Função para bloquear
CREATE OR REPLACE FUNCTION check_reminders_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT c.reminders_count, p.max_reminders
  INTO current_count, max_allowed
  FROM saas_clients c
  JOIN saas_plans p ON p.id = c.plan
  WHERE c.id = NEW.client_id;

  IF max_allowed = -1 THEN RETURN NEW; END IF;
  
  IF COALESCE(current_count, 0) >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'Limite de lembretes ativos atingido (% de %)', current_count, max_allowed;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Função para manter contagem sincronizada (Insert/Delete/Update)
CREATE OR REPLACE FUNCTION update_reminders_count()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
BEGIN
  v_client_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.client_id ELSE NEW.client_id END;
  
  UPDATE saas_clients
  SET reminders_count = (
    SELECT COUNT(*) FROM saas_reminders 
    WHERE client_id = v_client_id 
    AND status = 'pending' -- Considera apenas pendentes/ativos
  ),
  updated_at = NOW()
  WHERE id = v_client_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3.3 Aplicar Triggers
DROP TRIGGER IF EXISTS trg_check_limits ON saas_reminders;
CREATE TRIGGER trg_check_limits 
BEFORE INSERT ON saas_reminders 
FOR EACH ROW EXECUTE FUNCTION check_reminders_limit();

DROP TRIGGER IF EXISTS trg_update_count ON saas_reminders;
CREATE TRIGGER trg_update_count 
AFTER INSERT OR UPDATE OR DELETE ON saas_reminders 
FOR EACH ROW EXECUTE FUNCTION update_reminders_count();

-- =============================================
-- 4. LISTAS (Novos Triggers - Contagem de ATIVAS)
-- =============================================
-- 4.1 Função para bloquear
CREATE OR REPLACE FUNCTION check_lists_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT c.lists_count, p.max_lists
  INTO current_count, max_allowed
  FROM saas_clients c
  JOIN saas_plans p ON p.id = c.plan
  WHERE c.id = NEW.client_id;

  IF max_allowed = -1 THEN RETURN NEW; END IF;
  
  IF COALESCE(current_count, 0) >= COALESCE(max_allowed, 0) THEN
    RAISE EXCEPTION 'Limite de listas atingido (% de %)', current_count, max_allowed;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Função para manter contagem
CREATE OR REPLACE FUNCTION update_lists_count()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
BEGIN
  v_client_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.client_id ELSE NEW.client_id END;

  UPDATE saas_clients
  SET lists_count = (
    SELECT COUNT(*) FROM saas_lists 
    WHERE client_id = v_client_id 
    AND is_archived = false -- Considera apenas listas ativas
  ),
  updated_at = NOW()
  WHERE id = v_client_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4.3 Aplicar Triggers
DROP TRIGGER IF EXISTS trg_check_limits ON saas_lists;
CREATE TRIGGER trg_check_limits 
BEFORE INSERT ON saas_lists 
FOR EACH ROW EXECUTE FUNCTION check_lists_limit();

DROP TRIGGER IF EXISTS trg_update_count ON saas_lists;
CREATE TRIGGER trg_update_count 
AFTER INSERT OR UPDATE OR DELETE ON saas_lists 
FOR EACH ROW EXECUTE FUNCTION update_lists_count();

-- =============================================
-- 5. RECALCULAR DADOS EXISTENTES (Obrigatório para corrigir estado atual)
-- =============================================
DO $$
BEGIN
  RAISE NOTICE 'Recalculando contadores de todos os clientes...';
  
  UPDATE saas_clients c
  SET 
    -- 1. Transações do mês atual
    transactions_month = (
      SELECT COUNT(*) FROM saas_finance_transactions t 
      WHERE t.client_id = c.id 
      AND t.date >= DATE_TRUNC('month', CURRENT_DATE)
      AND t.date < DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')
    ),
    -- 2. Lembretes ativos (pending)
    reminders_count = (
      SELECT COUNT(*) FROM saas_reminders r 
      WHERE r.client_id = c.id 
      AND r.status = 'pending'
    ),
    -- 3. Listas ativas (não arquivadas)
    lists_count = (
      SELECT COUNT(*) FROM saas_lists l 
      WHERE l.client_id = c.id 
      AND l.is_archived = false
    );
END $$;
