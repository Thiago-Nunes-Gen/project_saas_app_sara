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

    // Guarda apenas o número limpo (sem @s.whatsapp.net)
    // O sufixo @s.whatsapp.net é adicionado apenas quando necessário para API do WhatsApp
    const whatsapp_id = cleanNumber

    // Verifica se já existe um cliente com este auth_user_id
    const { data: existingClient, error: checkError } = await supabase
      .from('saas_clients')
      .select('id, whatsapp_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Erro ao verificar cliente existente:', checkError)
      return NextResponse.json(
        { error: 'Erro ao verificar conta' },
        { status: 500 }
      )
    }

    // Verifica se este número de WhatsApp já está em uso por outro usuário
    const { data: duplicateWhatsApp } = await supabase
      .from('saas_clients')
      .select('id')
      .eq('whatsapp_id', whatsapp_id)
      .neq('auth_user_id', user.id)
      .maybeSingle()

    if (duplicateWhatsApp) {
      return NextResponse.json(
        { error: 'Este número de WhatsApp já está vinculado a outra conta' },
        { status: 409 }
      )
    }

    console.log('[API whatsapp/connect] existingClient:', existingClient)
    console.log('[API whatsapp/connect] user.id:', user.id)
    console.log('[API whatsapp/connect] whatsapp_id:', whatsapp_id)

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
      console.log('[API whatsapp/connect] Criando novo cliente...')

      const insertData = {
        auth_user_id: user.id,
        whatsapp_id: whatsapp_id,
        email: user.email,
        name: user.user_metadata?.name || user.user_metadata?.full_name || 'Usuário',
        status: 'active',
        plan: 'free'
      }

      console.log('[API whatsapp/connect] Insert data:', insertData)

      const { data: newClient, error: insertError } = await supabase
        .from('saas_clients')
        .insert(insertData)
        .select('id')
        .single()

      if (insertError) {
        console.error('[API whatsapp/connect] Erro ao criar cliente:', insertError)
        return NextResponse.json(
          { error: `Erro ao criar conta: ${insertError.message}` },
          { status: 500 }
        )
      }

      console.log('[API whatsapp/connect] Cliente criado:', newClient)

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
