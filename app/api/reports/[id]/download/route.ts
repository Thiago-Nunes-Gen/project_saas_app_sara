import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Busca as variáveis de ambiente necessárias e remove espaços extras
const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// Verifica se as vars de ambiente essenciais estão presentes
if (!supabaseUrl || !supabaseServiceKey) {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  throw new Error(`Variáveis de ambiente ausentes: ${missing.join(', ')}`);
}

// Inicializa client admin usando variáveis de ambiente (NÃO expor estas variáveis no frontend)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verifica usuário a partir do token
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error('[Download API] Erro de Auth:', userErr);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const uid = userData.user.id;
    const isAdmin = !!userData.user.user_metadata?.isAdmin;
    console.log('[Download API] Usuário autenticado:', uid, 'Admin:', isAdmin);

    // Busca o cliente vinculado ao usuário auth para obter o client_id correto
    const { data: clientData, error: clientErr } = await supabaseAdmin
      .from('saas_clients')
      .select('id')
      .eq('auth_user_id', uid)
      .single();

    if (clientErr || !clientData) {
      console.error('[Download API] Cliente não encontrado para auth_id:', uid, clientErr);
      return NextResponse.json({ error: 'Perfil de cliente não encontrado' }, { status: 404 });
    }

    const clientId = clientData.id;
    console.log('[Download API] Client ID localizado:', clientId);

    // Busca o relatório
    const { data: report, error: reportErr } = await supabaseAdmin
      .from('saas_reports')
      .select('id, client_id, file_key, is_public, file_url')
      .eq('id', params.id)
      .maybeSingle();

    if (reportErr) {
      console.error('[Download API] Erro ao buscar relatório:', reportErr);
      return NextResponse.json({ error: reportErr.message }, { status: 500 });
    }
    if (!report) {
      console.warn('[Download API] Relatório não encontrado ID:', params.id);
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.log('[Download API] Relatório encontrado:', report.id, 'Proprietário:', report.client_id);

    // Checagem de propriedade real (compara Client ID com Client ID)
    if (report.client_id !== clientId && !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Se público, retorna a URL direta
    if (report.is_public && report.file_url) return NextResponse.json({ url: report.file_url });

    // Normaliza file_key: remove prefixo de bucket se existir (ex: 'relatorios/relatorio.pdf')
    let fileKey = report.file_key as string | undefined;
    if (!fileKey) return NextResponse.json({ error: 'file_key ausente no registro' }, { status: 500 });
    fileKey = fileKey.replace(/^\/?relatorios\//, '');

    // Gera signed URL (tempo em segundos)
    console.log('[Download API] Gerando signed URL para:', fileKey);
    const { data: signed, error: signedErr } = await supabaseAdmin
      .storage
      .from('relatorios')
      .createSignedUrl(fileKey, 60);

    if (signedErr) {
      console.log('[Download API] Erro original no Storage:', signedErr.message);

      // SMART FALLBACK: Tenta encontrar o arquivo correto listando o bucket
      // Isso resolve problemas de:
      // 1. Arquivos na raiz vs Subpasta
      // 2. Nomes diferentes (relatorio_123 vs relatorio_full_123)
      // 3. Timestamps com ligeira variação (Date.now() executado em momentos diferentes)

      if (signedErr.message === 'Object not found' || signedErr.message?.includes('not found')) {
        console.log('[Download API] Iniciando recuperação inteligente de arquivo...');

        // Extrai o timestamp esperado do nome do arquivo original (assumindo formato ..._1769xyz.pdf)
        // Pega a sequência de dígitos logo antes do .pdf
        const timestampMatch = fileKey.match(/_(\d+)\.pdf$/);
        const expectedTs = timestampMatch ? parseInt(timestampMatch[1]) : 0;

        if (expectedTs > 0) {
          // Lista arquivos na raiz (assumindo que o erro de pasta já foi descartado)
          const { data: files, error: listErr } = await supabaseAdmin
            .storage
            .from('relatorios')
            .list('', {
              limit: 100,
              search: 'relatorio_' // Filtra para reduzir carga
            });

          if (!listErr && files && files.length > 0) {
            // Procura o arquivo com timestamp mais próximo (limite de 2 segundos de diferença)
            let bestMatch = null;
            let minDiff = 2000; // 2 segundos

            for (const file of files) {
              const match = file.name.match(/_(\d+)\.pdf$/);
              if (match) {
                const fileTs = parseInt(match[1]);
                const diff = Math.abs(fileTs - expectedTs);

                if (diff < minDiff) {
                  minDiff = diff;
                  bestMatch = file.name;
                }
              }
            }

            if (bestMatch) {
              console.log(`[Download API] Arquivo recuperado! Original: ${fileKey} | Encontrado: ${bestMatch} (Diff: ${minDiff}ms)`);

              const { data: smartSigned, error: smartErr } = await supabaseAdmin
                .storage
                .from('relatorios')
                .createSignedUrl(bestMatch, 60);

              if (!smartErr && smartSigned) {
                const anySmart: any = smartSigned;
                const smartUrl = anySmart?.signedUrl ?? anySmart?.signedURL ?? anySmart;
                if (smartUrl) return NextResponse.json({ url: smartUrl });
              }
            } else {
              console.warn('[Download API] Nenhum arquivo compatível encontrado na varredura.');
            }
          } else {
            console.error('[Download API] Erro ao listar arquivos para recuperação:', listErr);
          }
        }
      }

      console.error('[Download API] Falha final no Storage:', signedErr);
      return NextResponse.json({ error: 'Arquivo não encontrado no servidor' }, { status: 404 });
    }
    // Tipagem flexível pois a resposta pode variar: usa cast para evitar erro de compilação
    console.log('[Download API] Dados do signed original:', signed);
    const anySigned: any = signed;
    const url = anySigned?.signedUrl ?? anySigned?.signedURL ?? anySigned;
    console.log('[Download API] URL extraída (Original):', url);
    if (!url) {
      console.error('[Download API] Falha ao extrair URL de:', signed);
      return NextResponse.json({ error: 'Não foi possível gerar signed URL' }, { status: 500 });
    }
    return NextResponse.json({ url });
  } catch (err: any) {
    console.error('[Download API] Erro Crítico:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
