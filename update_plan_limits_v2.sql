-- Atualização de Limites e Features dos Planos (V2)

-- ==========================================
-- PLANO GRATUITO (free)
-- ==========================================
UPDATE saas_plans
SET 
  -- Limites Técnicos
  max_reminders = 5,
  max_lists = 2,
  max_list_items = 8,
  max_transactions_month = 5,
  max_appointments_month = 3,
  max_web_searches_month = 2,
  max_documents = 0,
  max_rag_queries_month = 0,
  
  -- Descrição Visual (Features)
  features = '[
    "5 Lembretes ativos",
    "2 Listas (8 itens cada)",
    "5 Transações/mês",
    "3 Agendamentos/mês",
    "2 Pesquisas Web",
    "Acesso ao Portal",
    "Sem acesso a Documentos/RAG"
  ]'::jsonb
WHERE id = 'free';

-- ==========================================
-- PLANO STARTER (starter)
-- ==========================================
UPDATE saas_plans
SET 
  -- Limites Técnicos
  max_reminders = 15,
  max_lists = 6,
  max_list_items = 10,
  max_transactions_month = 12,
  max_appointments_month = 8,
  max_web_searches_month = 6,
  max_documents = 2,
  max_rag_queries_month = 10,
  
  -- Descrição Visual (Features)
  features = '[
    "15 Lembretes ativos",
    "6 Listas (10 itens cada)",
    "12 Transações/mês",
    "8 Agendamentos/mês",
    "6 Pesquisas Web",
    "2 Documentos (RAG)",
    "10 Consultas RAG/mês",
    "Acesso ao Portal",
    "Relatórios PDF"
  ]'::jsonb
WHERE id = 'starter';

-- ==========================================
-- PLANO PROFISSIONAL (pro)
-- ==========================================
UPDATE saas_plans
SET 
  -- Limites Técnicos
  max_reminders = 30,
  max_lists = 12,
  max_list_items = 15,
  max_transactions_month = 24,
  max_appointments_month = 20,
  max_web_searches_month = 12,
  max_documents = 4,
  max_rag_queries_month = 15,
  
  -- Descrição Visual (Features)
  features = '[
    "30 Lembretes ativos",
    "12 Listas (15 itens cada)",
    "24 Transações/mês",
    "20 Agendamentos/mês",
    "12 Pesquisas Web",
    "4 Documentos (RAG)",
    "15 Consultas RAG/mês",
    "Acesso ao Portal",
    "Relatórios PDF"
  ]'::jsonb
WHERE id = 'pro';

-- ==========================================
-- PLANO ENTERPRISE (enterprise)
-- ==========================================
UPDATE saas_plans
SET 
  -- Limites Técnicos
  max_reminders = 999999, -- Ilimitado
  max_lists = 50,
  max_list_items = 25,
  max_transactions_month = 999999, -- Ilimitado
  max_appointments_month = 200,
  max_web_searches_month = 25,
  max_documents = 7,
  max_rag_queries_month = 30,
  
  -- Descrição Visual (Features)
  features = '[
    "Lembretes Ilimitados",
    "50 Listas (25 itens cada)",
    "Transações Ilimitadas",
    "200 Agendamentos/mês",
    "25 Pesquisas Web",
    "7 Documentos (RAG)",
    "30 Consultas RAG/mês",
    "Acesso ao Portal",
    "Relatórios PDF",
    "Suporte Prioritário"
  ]'::jsonb
WHERE id = 'enterprise';
