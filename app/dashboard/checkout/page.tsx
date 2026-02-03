'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useClient } from '@/hooks/useClient'
import {
  ArrowLeft,
  CreditCard,
  User,
  Mail,
  MapPin,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Shield,
  Zap,
  Crown,
  Building2
} from 'lucide-react'

interface Plan {
  id: string
  name: string
  price_monthly: number
  description: string
}

const planIcons: Record<string, any> = {
  starter: Zap,
  pro: Crown,
  enterprise: Building2
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get('plano') || 'starter'
  const { client, loading: clientLoading } = useClient()

  // Plan info
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

  // Form data
  const [nome, setNome] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [cep, setCep] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  // State
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load plan info
  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch(`/api/plans/${planId}`)
        if (res.ok) {
          const data = await res.json()
          setPlan(data)
        }
      } catch (err) {
        console.error('Erro ao carregar plano:', err)
      } finally {
        setLoadingPlan(false)
      }
    }
    loadPlan()
  }, [planId])

  // Pre-fill from client data
  useEffect(() => {
    if (client) {
      setNome(client.name || '')
      setEmail(client.email || client.billing_email || '')
      if (client.billing_cpf) setCpfCnpj(client.billing_cpf)
      if (client.billing_cep) setCep(client.billing_cep)
      if (client.billing_endereco) setEndereco(client.billing_endereco)
      if (client.billing_numero) setNumero(client.billing_numero)
      if (client.billing_bairro) setBairro(client.billing_bairro)
      if (client.billing_cidade) setCidade(client.billing_cidade)
      if (client.billing_estado) setEstado(client.billing_estado)
    }
  }, [client])

  // Format CPF/CNPJ
  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 11) {
      // CPF: 000.000.000-00
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      // CNPJ: 00.000.000/0000-00
      return cleaned
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
  }

  // Format CEP
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8)
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
    }
    return cleaned
  }

  // Lookup CEP via ViaCEP
  const lookupCep = async (cepValue: string) => {
    const cleaned = cepValue.replace(/\D/g, '')
    if (cleaned.length !== 8) return

    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`)
      const data = await res.json()

      if (!data.erro) {
        setEndereco(data.logradouro || '')
        setBairro(data.bairro || '')
        setCidade(data.localidade || '')
        setEstado(data.uf || '')
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err)
    } finally {
      setLoadingCep(false)
    }
  }

  // Validate form
  const isValidForm = () => {
    const cpfCnpjClean = cpfCnpj.replace(/\D/g, '')
    return (
      nome.trim().length >= 3 &&
      (cpfCnpjClean.length === 11 || cpfCnpjClean.length === 14) &&
      email.includes('@') &&
      cep.replace(/\D/g, '').length === 8 &&
      endereco.trim().length > 0 &&
      numero.trim().length > 0 &&
      bairro.trim().length > 0 &&
      cidade.trim().length > 0 &&
      estado.trim().length === 2
    )
  }

  // Submit checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidForm()) {
      setError('Por favor, preencha todos os campos corretamente.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano_id: planId,
          billing: {
            nome: nome.trim(),
            cpf_cnpj: cpfCnpj.replace(/\D/g, ''),
            email: email.trim(),
            cep: cep.replace(/\D/g, ''),
            endereco: endereco.trim(),
            numero: numero.trim(),
            bairro: bairro.trim(),
            cidade: cidade.trim(),
            estado: estado.trim().toUpperCase()
          }
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar checkout')
      }

      // Redirect to payment page
      if (data.payment_url) {
        window.location.href = data.payment_url
      } else {
        router.push('/dashboard/planos?success=1')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar checkout. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const Icon = planIcons[planId] || Zap

  if (loadingPlan || clientLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/planos"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Assinatura</h1>
          <p className="text-gray-500">Complete seus dados para assinar o plano</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Plan Summary */}
        <div className="md:col-span-1">
          <div className="card sticky top-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Plano selecionado</p>
                <p className="font-bold text-gray-900 uppercase">{plan?.name || planId}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-gray-600">Valor mensal</span>
                <span className="text-2xl font-bold text-gray-900">
                  {plan ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price_monthly) : '...'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Cobranca mensal recorrente</p>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-start gap-2">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">Pagamento Seguro</p>
                <p className="text-xs text-green-600">Processado pelo Asaas com criptografia SSL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Dados Pessoais */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Dados Pessoais
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="label">Nome completo *</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="input"
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="label">CPF ou CNPJ *</label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(formatCpfCnpj(e.target.value))}
                    className="input"
                    placeholder="000.000.000-00"
                    maxLength={18}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {cpfCnpj.replace(/\D/g, '').length <= 11 ? 'CPF' : 'CNPJ'} para emissao da nota fiscal
                  </p>
                </div>

                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Endereco */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Endereco de Cobranca
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="label">CEP *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => {
                          const formatted = formatCep(e.target.value)
                          setCep(formatted)
                          if (formatted.replace(/\D/g, '').length === 8) {
                            lookupCep(formatted)
                          }
                        }}
                        className="input"
                        placeholder="00000-000"
                        maxLength={9}
                        required
                      />
                      {loadingCep && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="label">Endereco *</label>
                    <input
                      type="text"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="input"
                      placeholder="Rua, Avenida..."
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Numero *</label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      className="input"
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Bairro *</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="input"
                    placeholder="Bairro"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="label">Cidade *</label>
                    <input
                      type="text"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="input"
                      placeholder="Cidade"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Estado *</label>
                    <input
                      type="text"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                      className="input"
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isValidForm()}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Ir para Pagamento
                </>
              )}
            </button>

            <p className="text-xs text-center text-gray-500 mt-4">
              Ao continuar, voce concorda com os{' '}
              <Link href="/termos" className="text-blue-500 hover:underline">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-blue-500 hover:underline">
                Politica de Privacidade
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner w-8 h-8" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
