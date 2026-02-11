const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Tenta ler variáveis de ambiente do .env.local se existir, senão assume que o user já tem configurado ou falha
// Como estou rodando num ambiente onde npm run dev roda, as vars devem estar acessíveis ou em .env.local

// Função para carregar .env.local manualmente (simples)
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    }
} catch (e) {
    console.log('Erro ao ler .env.local, tentando usar process.env existente');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Usando ANON key deve permitir update se as policies permitirem, 
// MAS saas_plans geralmente é restrito. 
// O ideal seria SERVICE_ROLE_KEY, mas não tenho acesso fácil a ela sem ler o .env.
// Vou tentar ler a service role key do .env.local se estiver lá.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || (!supabaseKey && !supabaseServiceKey)) {
    console.error('ERRO: Variáveis de ambiente SUPABASE_URL e CHAVE não encontradas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

const plansUpdates = [
    {
        id: 'free',
        features: JSON.stringify([
            "10 lembretes ativos",
            "3 listas com 8 itens cada",
            "15 transações/mês",
            "3 agendamentos/mês",
            "Pesquisas Web",
            "Acesso ao Portal",
            "Ideal para experimentar"
        ])
    },
    {
        id: 'starter',
        features: JSON.stringify([
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
        ])
    },
    {
        id: 'pro',
        features: JSON.stringify([
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
        ])
    },
    {
        id: 'enterprise',
        features: JSON.stringify([
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
        ])
    }
];

async function updatePlans() {
    console.log('Iniciando atualização dos planos...');

    for (const plan of plansUpdates) {
        const { error } = await supabase
            .from('saas_plans')
            .update({ features: plan.features })
            .eq('id', plan.id);

        if (error) {
            console.error(`Erro ao atualizar plano ${plan.id}:`, error);
        } else {
            console.log(`Plano ${plan.id} atualizado com sucesso!`);
        }
    }
}

updatePlans();
