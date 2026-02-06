'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import {
  Check,
  Star,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  description: string
  price_monthly: number
  features: string[]
  is_active: boolean
  max_reminders: number
  max_lists: number
  max_transactions_month: number
  max_documents: number
  max_web_searches_month: number
  max_appointments_month: number
}

const planIcons: Record<string, any> = {
  free: Star,
  starter: Zap,
  pro: Crown,
  enterprise: Building2
}

const planColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  free: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600' },
  starter: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-600' },
  pro: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', badge: 'bg-purple-100 text-purple-600' },
  enterprise: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-600' }
}

export default function PlanosPage() {
  const router = useRouter()
  const { client } = useClient()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPlans() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('saas_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (!error && data) {
        // Parse features JSON string to array
        const parsedPlans = data.map(plan => ({
          ...plan,
          features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
        }))
        setPlans(parsedPlans)
      }
      setLoading(false)
    }
    fetchPlans()
  }, [])

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      // Free plan - no checkout needed
      return
    }
    // Redirect to checkout page
    router.push(`/dashboard/checkout?plano=${planId}`)
  }

  const currentPlanId = client?.plan?.toLowerCase() || 'free'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Escolha o plano ideal para você
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Comece grátis e faça upgrade conforme suas necessidades.
          Todos os planos incluem acesso à SARA pelo WhatsApp e Portal.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {plans.map((plan) => {
          const Icon = planIcons[plan.id] || Star
          const colors = planColors[plan.id] || planColors.free
          const isCurrentPlan = currentPlanId === plan.id
          const isPro = plan.id === 'pro'

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 ${isPro ? 'border-purple-500 shadow-lg shadow-purple-100' : colors.border
                } bg-white overflow-hidden flex flex-col`}
            >
              {/* Popular Badge */}
              {isPro && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  MAIS POPULAR
                </div>
              )}

              {/* Header */}
              <div className={`p-6 ${colors.bg}`}>
                <div className={`w-12 h-12 rounded-xl ${colors.badge} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1 min-h-[40px]">{plan.description}</p>

                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price_monthly)}
                  </span>
                  {plan.price_monthly > 0 && (
                    <span className="text-gray-500 text-sm">/mês</span>
                  )}
                </div>
              </div>


              {/* Features */}
              <div className="p-6 flex-1">
                <ul className="space-y-3">
                  {/* Agendamentos - adicionado manualmente */}
                  <li className="flex items-start gap-2">
                    <Check className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                    <span className="text-sm text-gray-600">
                      {plan.max_appointments_month === -1
                        ? 'Agendamentos ilimitados'
                        : `${plan.max_appointments_month} agendamentos/mês`}
                    </span>
                  </li>
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed"
                  >
                    Plano Atual
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isPro
                      ? 'bg-purple-500 text-white hover:bg-purple-600'
                      : plan.id === 'free'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                  >
                    {plan.id === 'free' ? 'Começar Grátis' : 'Assinar Agora'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ / Help */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Duvidas sobre qual plano escolher?
        </h2>
        <p className="text-gray-500 mb-6">
          Converse com a SARA pelo WhatsApp e ela te ajuda a escolher o melhor plano!
        </p>
        <a
          href="https://wa.me/5516992706593?text=Ol%C3%A1%20SARA!%20Preciso%20de%20ajuda%20para%20escolher%20um%20plano."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Falar com SARA
        </a>
      </div>

      {/* Comparison Table */}
      <div className="mt-12 overflow-x-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Comparativo de Planos</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 text-sm font-medium text-gray-500">Recurso</th>
              {plans.map(plan => (
                <th key={plan.id} className="text-center py-4 px-4 text-sm font-medium text-gray-900">
                  {plan.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Lembretes ativos</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_reminders === -1 ? 'Ilimitado' : plan.max_reminders}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Listas</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_lists === -1 ? 'Ilimitado' : plan.max_lists}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Transações/mês</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_transactions_month === -1 ? 'Ilimitado' : plan.max_transactions_month}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Documentos na base</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_documents === -1 ? 'Ilimitado' : plan.max_documents}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Pesquisas web/mês</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_web_searches_month === -1 ? 'Ilimitado' : plan.max_web_searches_month}
                </td>
              ))}
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-4 px-4 text-sm text-gray-600">Agendamentos/mês</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm text-gray-900">
                  {plan.max_appointments_month === -1 ? 'Ilimitado' : plan.max_appointments_month}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-4 px-4 text-sm text-gray-600">Preço</td>
              {plans.map(plan => (
                <td key={plan.id} className="text-center py-4 px-4 text-sm font-semibold text-gray-900">
                  {formatPrice(plan.price_monthly)}
                  {plan.price_monthly > 0 && <span className="font-normal text-gray-500">/mês</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
