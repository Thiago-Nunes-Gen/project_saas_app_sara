import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// n8n Webhook URL para checkout
const N8N_CHECKOUT_WEBHOOK_URL = process.env.N8N_CHECKOUT_WEBHOOK_URL

interface BillingData {
  nome: string
  cpf_cnpj: string
  email: string
  cep: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
}

interface CheckoutRequest {
  plano_id: string
  billing: BillingData
}

export async function POST(request: NextRequest) {
  try {
    // Check n8n webhook config
    if (!N8N_CHECKOUT_WEBHOOK_URL) {
      console.error('N8N_CHECKOUT_WEBHOOK_URL não configurada')
      return NextResponse.json(
        { error: 'Configuração de checkout não disponível' },
        { status: 500 }
      )
    }

    // Create supabase client for auth
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: CheckoutRequest = await request.json()
    const { plano_id, billing } = body

    // Validate required fields
    if (!plano_id || !billing) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Get client record
    const { data: client, error: clientError } = await supabaseAdmin
      .from('saas_clients')
      .select('id, whatsapp_id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    if (clientError) {
      console.error('Erro ao buscar cliente:', clientError)
      return NextResponse.json(
        { error: 'Erro ao buscar dados do cliente' },
        { status: 500 }
      )
    }

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado. Configure seu WhatsApp primeiro.' },
        { status: 404 }
      )
    }

    // Call n8n webhook for checkout processing
    const n8nResponse = await fetch(N8N_CHECKOUT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: client.id,
        whatsapp_id: client.whatsapp_id,
        plano_id: plano_id,
        billing: {
          nome: billing.nome.trim(),
          cpf_cnpj: billing.cpf_cnpj,
          email: billing.email.trim(),
          cep: billing.cep,
          endereco: billing.endereco.trim(),
          numero: billing.numero.trim(),
          bairro: billing.bairro.trim(),
          cidade: billing.cidade.trim(),
          estado: billing.estado.trim().toUpperCase()
        }
      })
    })

    if (!n8nResponse.ok) {
      const errorData = await n8nResponse.json().catch(() => ({}))
      console.error('Erro n8n checkout:', errorData)
      return NextResponse.json(
        { error: errorData.error || 'Erro ao processar checkout' },
        { status: n8nResponse.status }
      )
    }

    const result = await n8nResponse.json()

    return NextResponse.json({
      success: true,
      subscription_id: result.subscription_id,
      payment_url: result.payment_url,
      plano: result.plano
    })

  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
