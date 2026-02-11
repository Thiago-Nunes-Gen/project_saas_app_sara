-- 1. Listar todas as tabelas e se RLS está ATIVO ou NÃO
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM
    pg_tables
WHERE
    schemaname = 'public'
ORDER BY
    tablename;

-- 2. Listar todas as Políticas (Policies) existentes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
ORDER BY
    tablename, policyname;
