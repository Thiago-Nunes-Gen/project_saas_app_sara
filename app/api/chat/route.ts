import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit'

// URL do webhook n8n - configure no .env
const N8N_WEBHOOK_URL = process.env.N8N_PORTAL_CHAT_WEBHOOK_URL || ''

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

    // Rate limiting: 20 mensagens por minuto por usuário
    const rateLimit = checkRateLimit(`chat:${user.id}`, RATE_LIMITS.chat)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas mensagens. Aguarde um momento antes de enviar novamente.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.resetIn) } }
      )
    }

    // Busca client_id do usuário logado
    const { data: client, error: clientError } = await supabase
      .from('saas_clients')
      .select('id, whatsapp_id')
      .eq('auth_user_id', user.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      )
    }

    // Pega a mensagem do body
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      )
    }

    // Verifica se webhook está configurado
    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'Webhook não configurado' },
        { status: 500 }
      )
    }

    // Chama webhook do n8n
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET || '',
      },
      body: JSON.stringify({
        client_id: client.id,
        message: message.trim(),
        source: 'portal'
      })
    })

    if (!n8nResponse.ok) {
      console.error('Erro n8n:', n8nResponse.status, await n8nResponse.text())
      return NextResponse.json(
        { error: 'Erro ao processar mensagem' },
        { status: 502 }
      )
    }

    const data = await n8nResponse.json()

    return NextResponse.json({
      success: true,
      response: data.response || data.output || 'Resposta recebida',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro API chat:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
