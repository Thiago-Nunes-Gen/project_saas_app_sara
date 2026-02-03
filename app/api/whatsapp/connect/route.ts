import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cookies in Server Components
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Handle cookies in Server Components
            }
          },
        },
      }
    )

    // Verifica autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Pega o número do WhatsApp do body
    const body = await request.json()
    const { whatsapp_number } = body

    if (!whatsapp_number || typeof whatsapp_number !== 'string') {
      return NextResponse.json(
        { error: 'Número de WhatsApp é obrigatório' },
        { status: 400 }
      )
    }

    // Valida formato do número (deve ser 55 + DDD + 9 dígitos = 13 dígitos)
    const cleanNumber = whatsapp_number.replace(/\D/g, '')
    if (cleanNumber.length !== 13 || !cleanNumber.startsWith('55')) {
      return NextResponse.json(
        { error: 'Número de WhatsApp inválido. Use o formato: 55 + DDD + número' },
        { status: 400 }
      )
    }

    // Formata o whatsapp_id no padrão do WhatsApp
    const whatsapp_id = `${cleanNumber}@s.whatsapp.net`

    // Verifica se já existe um cliente com este auth_user_id
    const { data: existingClient, error: checkError } = await supabase
      .from('saas_clients')
      .select('id, whatsapp_id')
      .eq('auth_user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar cliente existente:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar conta' },
        { status: 500 }
      )
    }

    // Verifica se este número de WhatsApp já está em uso por outro usuário
    const { data: duplicateWhatsApp, error: duplicateError } = await supabase
      .from('saas_clients')
      .select('id')
      .eq('whatsapp_id', whatsapp_id)
      .neq('auth_user_id', user.id)
      .single()

    if (duplicateWhatsApp) {
      return NextResponse.json(
        { error: 'Este número de WhatsApp já está vinculado a outra conta' },
        { status: 409 }
      )
    }

    if (existingClient) {
      // Atualiza o cliente existente com o WhatsApp
      const { error: updateError } = await supabase
        .from('saas_clients')
        .update({
          whatsapp_id: whatsapp_id,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingClient.id)

      if (updateError) {
        console.error('Erro ao atualizar cliente:', updateError)
        return NextResponse.json(
          { error: 'Erro ao vincular WhatsApp' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'WhatsApp vinculado com sucesso!',
        whatsapp_id: whatsapp_id,
        client_id: existingClient.id
      })
    } else {
      // Cria novo cliente
      const { data: newClient, error: insertError } = await supabase
        .from('saas_clients')
        .insert({
          auth_user_id: user.id,
          whatsapp_id: whatsapp_id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
          status: 'active',
          plan: 'free',
          // Limites padrão do plano free
          max_reminders: 50,
          max_lists: 10,
          max_list_items: 50,
          max_transactions_month: 200,
          max_rag_queries_month: 50,
          max_documents: 50,
          max_web_searches_month: 10,
          // Contadores zerados
          reminders_count: 0,
          lists_count: 0,
          transactions_month: 0,
          rag_queries_month: 0,
          documents_count: 0,
          web_searches_month: 0,
          // Configurações padrão
          timezone: 'America/Sao_Paulo',
          bot_name: 'SARA',
          bot_personality: 'amigável e prestativa',
          morning_summary_enabled: true,
          onboarding_completed: true,
          onboarding_step: 'completed'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Erro ao criar cliente:', insertError)
        return NextResponse.json(
          { error: 'Erro ao criar conta' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'WhatsApp vinculado com sucesso!',
        whatsapp_id: whatsapp_id,
        client_id: newClient.id
      })
    }
  } catch (error) {
    console.error('Erro API whatsapp/connect:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
