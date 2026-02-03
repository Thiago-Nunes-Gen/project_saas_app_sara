import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Asaas API config
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY

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
    // Check Asaas config
    if (!ASAAS_API_KEY) {
      console.error('ASAAS_API_KEY não configurada')
      return NextResponse.json(
        { error: 'Configuração de pagamento não disponível' },
        { status: 500 }
      )
    }

    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies })
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

    // Get plan info
    const { data: plan, error: planError } = await supabaseAdmin
      .from('saas_plans')
      .select('id, name, price_monthly')
      .eq('id', plano_id)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    // Get client record
    const { data: client, error: clientError } = await supabaseAdmin
      .from('saas_clients')
      .select('id, asaas_customer_id, whatsapp_id')
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

    // Update billing info in saas_clients
    const { error: updateError } = await supabaseAdmin
      .from('saas_clients')
      .update({
        name: billing.nome,
        billing_email: billing.email,
        billing_cpf: billing.cpf_cnpj,
        billing_cep: billing.cep,
        billing_endereco: billing.endereco,
        billing_numero: billing.numero,
        billing_bairro: billing.bairro,
        billing_cidade: billing.cidade,
        billing_estado: billing.estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', client.id)

    if (updateError) {
      console.error('Erro ao atualizar dados de cobrança:', updateError)
    }

    let asaasCustomerId = client.asaas_customer_id

    // Create or update Asaas customer
    if (!asaasCustomerId) {
      // Create new customer
      const customerResponse = await fetch(`${ASAAS_API_URL}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ASAAS_API_KEY
        },
        body: JSON.stringify({
          name: billing.nome,
          cpfCnpj: billing.cpf_cnpj,
          email: billing.email,
          mobilePhone: client.whatsapp_id,
          postalCode: billing.cep,
          address: billing.endereco,
          addressNumber: billing.numero,
          province: billing.bairro,
          externalReference: client.id,
          notificationDisabled: false
        })
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        console.error('Erro Asaas ao criar customer:', errorData)
        return NextResponse.json(
          { error: errorData.errors?.[0]?.description || 'Erro ao criar conta de pagamento' },
          { status: 400 }
        )
      }

      const customerData = await customerResponse.json()
      asaasCustomerId = customerData.id

      // Save customer ID
      await supabaseAdmin
        .from('saas_clients')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', client.id)
    }

    // Create subscription
    const today = new Date().toISOString().split('T')[0]

    const subscriptionResponse = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED', // Permite escolher na hora do pagamento
        value: plan.price_monthly,
        nextDueDate: today,
        cycle: 'MONTHLY',
        description: `SARA - Plano ${plan.name}`,
        externalReference: plan.id
      })
    })

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json()
      console.error('Erro Asaas ao criar assinatura:', errorData)
      return NextResponse.json(
        { error: errorData.errors?.[0]?.description || 'Erro ao criar assinatura' },
        { status: 400 }
      )
    }

    const subscriptionData = await subscriptionResponse.json()

    // Save subscription ID
    await supabaseAdmin
      .from('saas_clients')
      .update({
        asaas_subscription_id: subscriptionData.id,
        subscription_flow_plan: plan.id
      })
      .eq('id', client.id)

    // Get payment link for first payment
    const paymentsResponse = await fetch(
      `${ASAAS_API_URL}/payments?subscription=${subscriptionData.id}&status=PENDING`,
      {
        headers: {
          'access_token': ASAAS_API_KEY
        }
      }
    )

    let paymentUrl = null
    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json()
      if (paymentsData.data && paymentsData.data.length > 0) {
        paymentUrl = paymentsData.data[0].invoiceUrl
      }
    }

    return NextResponse.json({
      success: true,
      subscription_id: subscriptionData.id,
      payment_url: paymentUrl || `https://www.asaas.com/c/${subscriptionData.id}`
    })

  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
