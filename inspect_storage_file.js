
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Carrega variáveis de ambiente manualmente ou via dotenv se existir
try {
    require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (e) {
    console.log('Dotenv não encontrado, tentando ler variáveis do processo...');
}

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Variáveis de ambiente ausentes!');
    // Tenta ler do arquivo .env.local diretamente se dotenv falhar
    try {
        const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
        const lines = envFile.split('\n');
        let url, key;
        for (const line of lines) {
            if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
            if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
        }
        if (url && key) {
            console.log('Variáveis lidas manualmente do arquivo .env.local');
            // Usa as variáveis lidas
            inspectFile(createClient(url, key));
        } else {
            process.exit(1);
        }
    } catch (err) {
        console.error('Erro fatal: Não foi possível ler as variáveis de ambiente.', err);
        process.exit(1);
    }
} else {
    inspectFile(createClient(supabaseUrl, supabaseServiceKey));
}

async function inspectFile(supabase) {
    console.log('--- Iniciando Inspeção de Arquivo (JS Mode) ---');

    // 1. Listar arquivos na raiz para pegar um exemplo real
    const { data: files, error: listErr } = await supabase.storage
        .from('relatorios')
        .list('', { limit: 5, search: 'relatorio_' });

    if (listErr) {
        console.error('Erro ao listar:', listErr);
        return;
    }

    if (!files || files.length === 0) {
        console.error('Nenhum arquivo encontrado na raiz do bucket.');
        return;
    }

    // Pega o arquivo mais recente
    const targetFile = files.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    console.log(`Verificando arquivo mais recente: ${targetFile.name} (${targetFile.metadata?.mimetype})`);

    // 2. Baixar o arquivo
    const { data: fileData, error: downloadErr } = await supabase.storage
        .from('relatorios')
        .download(targetFile.name);

    if (downloadErr) {
        console.error('Erro ao baixar:', downloadErr);
        return;
    }

    // 3. Ler os primeiros bytes (Magic Bytes)
    const buffer = await fileData.arrayBuffer();
    // Node.js < 11 TextDecoder might be missing inside some environments, using Buffer
    const header = Buffer.from(buffer).slice(0, 100).toString('utf8');

    console.log('\n--- CAÇA AOS BYTES ---');
    console.log('Tamanho total:', buffer.byteLength, 'bytes');
    console.log('Primeiros 100 chars:', header);
    console.log('----------------------\n');

    if (header.includes('%PDF')) {
        console.log('✅ É um PDF válido!');
    } else if (header.trim().startsWith('{') || header.trim().startsWith('[')) {
        console.log('⚠️ ALERTA: Isso parece um JSON, não um PDF!');
        console.log('Conteúdo provável:', header);
    } else {
        console.log('❓ Formato desconhecido/corrompido.');
    }
}
