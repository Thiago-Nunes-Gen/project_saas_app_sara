-- Atualização das features dos planos conforme solicitado
-- Formato: JSONB Array de strings

-- Plano GRATUITO
UPDATE saas_plans
SET features = '[
  "10 lembretes ativos",
  "3 listas com 8 itens cada",
  "15 transações/mês",
  "3 agendamentos/mês",
  "Pesquisas Web",
  "Acesso ao Portal",
  "Ideal para experimentar"
]'::jsonb
WHERE id = 'free';

-- Plano STARTER
UPDATE saas_plans
SET features = '[
  "50 lembretes ativos",
  "10 listas com 50 itens",
  "60 transações/mês",
  "10 agendamentos/mês",
  "10 pesquisas web/mês",
  "Documentos (RAG)",
  "Consultas (RAG)",
  "Acesso ao Portal",
  "Relatórios PDF",
  "Ideal para o dia a dia"
]'::jsonb
WHERE id = 'starter';

-- Plano PROFISSIONAL (PRO)
UPDATE saas_plans
SET features = '[
  "100 lembretes ativos",
  "50 listas com 100 itens",
  "150 transações/mês",
  "40 agendamentos/mês",
  "25 pesquisas web/mês",
  "Documentos (RAG)",
  "Consultas (RAG)",
  "Acesso ao Portal",
  "Relatórios PDF",
  "Ideal para nível médio de tarefas"
]'::jsonb
WHERE id = 'pro';

-- Plano ENTERPRISE
UPDATE saas_plans
SET features = '[
  "Lembretes ilimitados",
  "Listas ilimitadas",
  "Transações ilimitadas",
  "Agendamentos ilimitados",
  "50 pesquisas web/mês",
  "Documentos (RAG)",
  "Consultas (RAG)",
  "Acesso ao Portal",
  "Relatórios PDF",
  "Suporte Prioritário",
  "Ideal para alto volume de tarefas"
]'::jsonb
WHERE id = 'enterprise';
