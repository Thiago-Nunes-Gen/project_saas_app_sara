-- Criar tabela para registrar cancelamentos de assinaturas
-- Execute este script no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.saas_cancelamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  auth_user_id uuid,
  nome text NOT NULL,
  email text,
  ultimo_plano text NOT NULL,
  observation text DEFAULT 'Não informado',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT saas_cancelamentos_pkey PRIMARY KEY (id),
  CONSTRAINT saas_cancelamentos_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.saas_clients(id)
);

-- Criar índice para consultas por data
CREATE INDEX IF NOT EXISTS idx_saas_cancelamentos_created_at ON public.saas_cancelamentos(created_at DESC);

-- Criar índice para consultas por plano
CREATE INDEX IF NOT EXISTS idx_saas_cancelamentos_ultimo_plano ON public.saas_cancelamentos(ultimo_plano);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.saas_cancelamentos ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admins podem ler cancelamentos
CREATE POLICY "Admins can read cancelamentos"
  ON public.saas_cancelamentos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Clientes podem inserir seus próprios cancelamentos
CREATE POLICY "Clients can insert own cancelamentos"
  ON public.saas_cancelamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.saas_clients WHERE auth_user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.saas_cancelamentos IS 'Registro histórico de cancelamentos de assinaturas';
