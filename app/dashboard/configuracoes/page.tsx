'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import { useRouter } from 'next/navigation'
import {
  User,
  Phone,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Loader2,
  Check,
  AlertCircle,
  Zap,
  XCircle,
  ArrowRight,
  MapPin,
  Key,
  Trash2,
  X,
  Frown,
  MessageSquare,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface PlanLimits {
  max_reminders: number
  max_lists: number
  max_transactions_month: number
  max_documents: number
  max_web_searches_month: number
  max_appointments_month: number
}

// Limites padrão do plano FREE (Sincronizado com DB)
const DEFAULT_FREE_LIMITS: PlanLimits = {
  max_reminders: 5,
  max_lists: 2,
  max_transactions_month: 5,
  max_appointments_month: 3,
  max_documents: 0,
  max_web_searches_month: 2
}

// Lista de estados brasileiros
const ESTADOS_BR = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' }
]

// Mapeamento de timezone por estado
const TIMEZONE_MAP: Record<string, string> = {
  'AC': 'America/Rio_Branco',
  'AM': 'America/Manaus',
  'RR': 'America/Boa_Vista',
  'RO': 'America/Porto_Velho',
  'MT': 'America/Cuiaba',
  'MS': 'America/Campo_Grande',
  // Demais estados usam São Paulo (UTC-3)
}

function getTimezoneByUF(uf: string): string {
  return TIMEZONE_MAP[uf] || 'America/Sao_Paulo'
}

interface Cidade {
  id: number
  nome: string
}

export default function ConfiguracoesPage() {
  const router = useRouter()
  const { client, loading: clientLoading, refetch } = useClient()
  const [activeTab, setActiveTab] = useState('perfil')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [planLimits, setPlanLimits] = useState<PlanLimits>(DEFAULT_FREE_LIMITS)

  // Profile form
  const [name, setName] = useState('')
  const [apelido, setApelido] = useState('')
  const [email, setEmail] = useState('')
  const [uf, setUf] = useState('')
  const [cidade, setCidade] = useState('')
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [loadingCidades, setLoadingCidades] = useState(false)
  const [showCidadeDropdown, setShowCidadeDropdown] = useState(false)
  const [cidadeFiltrada, setCidadeFiltrada] = useState<Cidade[]>([])

  // Preferences
  const [morningSummary, setMorningSummary] = useState(true)

  // WhatsApp
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  // Cancelamento
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Segurança
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)

  useEffect(() => {
    if (client) {
      setName(client.name || '')
      setApelido(client.apelido || '')
      setEmail(client.email || '')
      setUf(client.uf || '')
      setCidade(client.cidade || '')
      setMorningSummary(client.morning_summary_enabled ?? true)
    }
  }, [client])

  // Buscar cidades quando UF mudar
  useEffect(() => {
    async function fetchCidades() {
      if (!uf) {
        setCidades([])
        return
      }

      setLoadingCidades(true)
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        )
        const data = await response.json()
        setCidades(data)
        setCidadeFiltrada(data)
      } catch (err) {
        console.error('Erro ao buscar cidades:', err)
        setCidades([])
      } finally {
        setLoadingCidades(false)
      }
    }

    fetchCidades()
  }, [uf])

  // Filtrar cidades conforme digitação
  useEffect(() => {
    if (!cidade) {
      setCidadeFiltrada(cidades)
      return
    }

    const filtradas = cidades.filter(c =>
      c.nome.toLowerCase().includes(cidade.toLowerCase())
    )
    setCidadeFiltrada(filtradas)
  }, [cidade, cidades])

  // Busca os limites do plano atual
  useEffect(() => {
    async function fetchPlanLimits() {
      if (!client?.plan) {
        setPlanLimits(DEFAULT_FREE_LIMITS)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('saas_plans')
        .select('max_reminders, max_lists, max_transactions_month, max_documents, max_web_searches_month, max_appointments_month')
        .eq('id', client.plan) // CORRIGIDO: Busca pelo ID (ex: 'free') e não pelo nome
        .single()

      if (!error && data) {
        setPlanLimits(data)
      } else {
        setPlanLimits(DEFAULT_FREE_LIMITS)
      }
    }

    if (!clientLoading) {
      fetchPlanLimits()
    }
  }, [client?.plan, clientLoading])

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const timezone = getTimezoneByUF(uf)

      const { error } = await supabase
        .from('saas_clients')
        .update({
          name,
          apelido,
          uf,
          cidade,
          timezone,
          updated_at: new Date().toISOString()
        })
        .eq('id', client?.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      refetch()
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' })
    } finally {
      setSaving(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('saas_clients')
        .update({
          morning_summary_enabled: morningSummary,
          updated_at: new Date().toISOString()
        })
        .eq('id', client?.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Preferências atualizadas!' })
      refetch()
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar preferências' })
    } finally {
      setSaving(false)
    }
  }

  const disconnectWhatsApp = async () => {
    setDisconnecting(true)
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('saas_clients')
        .update({
          whatsapp_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', client?.id)

      if (error) throw error

      setShowDisconnectConfirm(false)
      // Redirecionar para página de configurar WhatsApp
      router.push('/dashboard/configurar-whatsapp')
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao desconectar WhatsApp' })
    } finally {
      setDisconnecting(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!client?.email) {
      setMessage({ type: 'error', text: 'Email não encontrado' })
      return
    }

    setSendingPasswordReset(true)
    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(client.email, {
        redirectTo: `${window.location.origin}/auth/nova-senha`,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Email de redefinição enviado! Verifique sua caixa de entrada.' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao enviar email de redefinição' })
    } finally {
      setSendingPasswordReset(false)
    }
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const supabase = createClient()

      // Registrar cancelamento
      const { error: cancelError } = await supabase
        .from('saas_cancelamentos')
        .insert({
          client_id: client?.id,
          auth_user_id: client?.auth_user_id,
          nome: client?.name || '',
          email: client?.email || '',
          ultimo_plano: client?.plan || 'free',
          observation: cancelReason.trim() || 'Não informado'
        })

      if (cancelError) {
        console.error('Erro ao registrar cancelamento:', cancelError)
      }

      // Atualizar status do cliente para cancelado
      const { error } = await supabase
        .from('saas_clients')
        .update({
          plan: 'free',
          status: 'cancelled',
          asaas_subscription_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', client?.id)

      if (error) throw error

      setShowCancelModal(false)
      setMessage({ type: 'success', text: 'Assinatura cancelada. Você foi movido para o plano Free.' })
      refetch()
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao cancelar assinatura' })
    } finally {
      setCancelling(false)
    }
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'plano', label: 'Plano', icon: CreditCard },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'ajuda', label: 'Ajuda', icon: AlertCircle }, // Usando AlertCircle como ícone de ajuda (ou HelpCircle se disponível)
  ]

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Configurações</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
              {message.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {message.text}
            </div>
          )}

          {/* Perfil Tab */}
          {activeTab === 'perfil' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Informações do Perfil</h2>

              <div className="space-y-5">
                <div>
                  <label className="label">Nome completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Apelido (como a SARA vai te chamar)</label>
                  <input
                    type="text"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    className="input"
                    placeholder="Ex: Thiago"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Para alterar o email, entre em contato: suporte@iagenes.com.br
                  </p>
                </div>

                {/* Estado e Cidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Estado</label>
                    <select
                      value={uf}
                      onChange={(e) => {
                        setUf(e.target.value)
                        setCidade('')
                      }}
                      className="input"
                    >
                      <option value="">Selecione o estado</option>
                      {ESTADOS_BR.map((estado) => (
                        <option key={estado.uf} value={estado.uf}>
                          {estado.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative">
                    <label className="label">Cidade</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        onFocus={() => setShowCidadeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCidadeDropdown(false), 200)}
                        className="input pr-8"
                        placeholder={uf ? "Digite a cidade" : "Selecione o estado primeiro"}
                        disabled={!uf || loadingCidades}
                      />
                      {loadingCidades && (
                        <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                      )}
                      <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {showCidadeDropdown && cidadeFiltrada.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {cidadeFiltrada.slice(0, 20).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setCidade(c.nome)
                              setShowCidadeDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-gray-700"
                          >
                            {c.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {uf && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Timezone: {getTimezoneByUF(uf)}
                  </p>
                )}

                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">WhatsApp</h2>

              {client?.whatsapp_id ? (
                <>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">WhatsApp conectado</p>
                        <p className="text-sm text-green-700">
                          +{client.whatsapp_id.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 $2 $3-$4')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botão Desconectar */}
                  <div className="mt-6">
                    {!showDisconnectConfirm ? (
                      <button
                        onClick={() => setShowDisconnectConfirm(true)}
                        className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Desconectar WhatsApp
                      </button>
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-medium text-amber-900">Atenção!</p>
                            <p className="text-sm text-amber-700 mt-1">
                              Ao trocar de número, você <strong>perderá o histórico de conversas</strong> do número antigo.
                              Deseja continuar?
                            </p>
                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={disconnectWhatsApp}
                                disabled={disconnecting}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2"
                              >
                                {disconnecting ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Sim, desconectar
                              </button>
                              <button
                                onClick={() => setShowDisconnectConfirm(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">WhatsApp não vinculado</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Conecte seu WhatsApp para conversar com a SARA.
                      </p>
                      <Link
                        href="/dashboard/configurar-whatsapp"
                        className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                      >
                        <Phone className="w-4 h-4" />
                        Conectar WhatsApp
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notificações Tab */}
          {activeTab === 'notificacoes' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Notificações</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Resumo matinal</p>
                    <p className="text-sm text-gray-500">Receber resumo diário de lembretes e finanças</p>
                  </div>
                  <button
                    onClick={() => setMorningSummary(!morningSummary)}
                    className={`w-12 h-7 rounded-full transition-colors ${morningSummary ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${morningSummary ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar preferências'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Plano Tab */}
          {activeTab === 'plano' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Seu Plano</h2>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Plano atual</p>
                    <p className="text-2xl font-bold text-blue-900 uppercase">{client?.plan || 'Free'}</p>
                  </div>
                  <CreditCard className="w-10 h-10 text-blue-400" />
                </div>
              </div>

              {/* Botões de Ação do Plano */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/dashboard/planos"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  <Zap className="w-5 h-5" />
                  {client?.plan === 'enterprise' ? 'Ver Planos' : 'Fazer Upgrade'}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {client?.plan && client.plan !== 'free' && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    Cancelar Assinatura
                  </button>
                )}
              </div>

              <h3 className="font-medium text-gray-900 mb-4">Uso do plano</h3>
              <div className="space-y-4">
                <UsageBar
                  label="Lembretes"
                  used={client?.reminders_count || 0}
                  max={planLimits.max_reminders}
                />
                <UsageBar
                  label="Transações/mês"
                  used={client?.transactions_month || 0}
                  max={planLimits.max_transactions_month}
                />
                <UsageBar
                  label="Documentos"
                  used={client?.documents_count || 0}
                  max={planLimits.max_documents}
                />
                <UsageBar
                  label="Pesquisas IA/mês"
                  used={client?.web_searches_month || 0}
                  max={planLimits.max_web_searches_month}
                />
                <UsageBar
                  label="Agendamentos/mês"
                  used={client?.appointments_month || 0}
                  max={planLimits.max_appointments_month}
                />
              </div>

              {/* Mensagem para plano FREE */}
              {client?.plan === 'free' && (
                <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Você está em um <strong>plano FREE</strong>. Para conhecer e assinar um plano,{' '}
                    <Link href="/dashboard/planos" className="text-blue-600 hover:underline font-medium">
                      clique aqui
                    </Link>{' '}
                    ou no botão UPGRADE acima. Para excluir sua conta, vá até{' '}
                    <button
                      onClick={() => setActiveTab('seguranca')}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Configurações → Segurança
                    </button>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Segurança Tab */}
          {activeTab === 'seguranca' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Segurança</h2>

              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Alterar senha</p>
                      <p className="text-sm text-gray-500">Atualize sua senha de acesso</p>
                    </div>
                    <button
                      onClick={handlePasswordReset}
                      disabled={sendingPasswordReset}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      {sendingPasswordReset ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      {sendingPasswordReset ? 'Enviando...' : 'Alterar'}
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Excluir conta</p>
                      <p className="text-sm text-red-700">Isso irá apagar todos os seus dados</p>
                    </div>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ajuda / Documentação Tab */}
          {activeTab === 'ajuda' && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Manual de Uso SARA</h2>

              <div className="space-y-8">
                {/* 1. Introdução */}
                <section>
                  <p className="text-gray-600 leading-relaxed">
                    Olá! Eu sou a <strong>SARA</strong>, sua assistente pessoal inteligente. Meu objetivo é organizar sua vida, gerenciar seus compromissos, lembrar das suas tarefas importantes e cuidar das suas finanças.
                  </p>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Onde você pode me usar?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>📱 <strong>WhatsApp:</strong> Para o dia a dia, áudios e conversas rápidas na rua.</li>
                      <li>💬 <strong>Chat do Portal:</strong> Mesma inteligência do Zap, mas no computador.</li>
                      <li>🖥️ <strong>Painel do Portal:</strong> Para ver gráficos, relatórios e organizar tudo visualmente.</li>
                    </ul>
                  </div>
                </section>

                {/* 2. Comandos Mágicos */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    ⚡ Comandos Rápidos
                  </h3>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Comando</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">O que faz</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        <tr>
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">#ajuda</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Mostra a lista do que eu posso fazer.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">#meuplano</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Mostra detalhes da sua assinatura.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm font-mono text-blue-600">#meuuso</td>
                          <td className="px-4 py-3 text-sm text-gray-600">Exibe quanto você já usou do limite mensal.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 3. Módulos */}
                <section>
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    🛠️ O que eu sei fazer?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Lembretes */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <Bell className="w-5 h-5" />
                        <h4 className="font-medium">Lembretes</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Para não esquecer de nada.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Me lembre de tomar remédio amanhã às 14h"<br />
                        "Lembrete: pagar conta dia 15"
                      </div>
                    </div>

                    {/* Agenda */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <User className="w-5 h-5" /> {/* Usando User como ícone genérico de agenda se Calendar não estiver importado */}
                        <h4 className="font-medium">Agenda</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Compromissos com hora marcada.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Reunião com João quinta das 14h às 15h"<br />
                        "Agendar dentista amanhã 10h"
                      </div>
                    </div>

                    {/* Financeiro */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-green-600">
                        <CreditCard className="w-5 h-5" />
                        <h4 className="font-medium">Financeiro</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Controle de gastos e ganhos.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Gastei 50 no almoço"<br />
                        "Recebi 200 de freela"<br />
                        "Quanto gastei esse mês?"
                      </div>
                    </div>

                    {/* Listas */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-amber-600">
                        <Check className="w-5 h-5" />
                        <h4 className="font-medium">Listas</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Tarefas, compras, ideias.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Cria lista de compras"<br />
                        "Adiciona leite na lista de compras"
                      </div>
                    </div>

                    {/* Central de Memória (Histórico) */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-indigo-600">
                        <MessageSquare className="w-5 h-5" />
                        <h4 className="font-medium">Central de Memória</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Seu histórico completo de conversas.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Pesquise por algo que falamos mês passado"<br />
                        "Filtre por finanças ou lembretes"<br />
                        "Revise tudo que a SARA já fez"
                      </div>
                    </div>

                    {/* Meus Documentos (Base de Conhecimento) */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-cyan-600">
                        <FileText className="w-5 h-5" />
                        <h4 className="font-medium">Meus Documentos</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2"><strong>Aumente a inteligência da SARA.</strong> Envie PDFs ou manuais para ela guardar e aprender. (Por enquanto só no WhatsApp)</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Envie: Manual da TV"<br />
                        "Depois pergunte: Como sintonizar canais?"<br />
                        "A SARA usa esse conhecimento extra quando você precisar."
                      </div>
                    </div>

                    {/* Pesquisas na Internet */}
                    <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-200 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-teal-600">
                        <MapPin className="w-5 h-5" />
                        <h4 className="font-medium">Internet</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Precisa de informações atuais? Eu busco na web para você.</p>
                      <div className="text-xs bg-white p-2 rounded border border-gray-200 text-gray-500 italic">
                        "Pesquise o preço do iPhone 15"<br />
                        "Como está o trânsito na Paulista?"<br />
                        "Busque eventos em SP hoje"
                      </div>
                    </div>

                  </div>
                </section>

                {/* 4. Dicas */}
                <section className="bg-amber-50 border border-amber-100 rounded-lg p-5">
                  <h3 className="text-base font-semibold text-amber-900 mb-3 flex items-center gap-2">
                    💡 Dicas de Ouro
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-800">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span><strong>Seja direto:</strong> "Lembrete amanhã 9h pagar boleto" funciona melhor que frases longas.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span><strong>Áudios funcionam:</strong> Pode mandar áudio no WhatsApp que eu entendo tudo!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span><strong>Errou? Corrija:</strong> Se falou o valor errado, é só dizer "Na verdade foi 30 reais" logo em seguida.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span><strong>Use o Portal:</strong> Para ver gráficos bonitos e organizar a semana, o painel aqui é o melhor lugar.</span>
                    </li>
                  </ul>
                </section>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Frown className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Puxa, que pena!</h3>
              <p className="text-gray-500 mt-1">Ficamos tristes em ver você ir 😢</p>
            </div>

            <div className="mb-6">
              <label className="label">Quer nos contar o motivo do cancelamento? (opcional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="input min-h-[100px] resize-none"
                placeholder="Conte-nos o que podemos melhorar..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                Cancelar Assinatura
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90"
              >
                Continuar com a SARA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsageBar({ label, used, max }: { label: string, used: number, max: number }) {
  const isUnlimited = max === -1 || max >= 999999
  const percentage = isUnlimited ? 0 : (max > 0 ? Math.min((used / max) * 100, 100) : 0)
  const isHigh = !isUnlimited && max > 0 && percentage > 80
  const isDisabled = max === 0 && !isUnlimited

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
        <span className={`text-sm font-medium ${isDisabled ? 'text-gray-400' : isHigh ? 'text-amber-600' : 'text-gray-900'}`}>
          {isDisabled ? 'Não disponível' : `${used} / ${isUnlimited ? 'Ilimitado' : max}`}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${isDisabled ? 'bg-gray-300' : isHigh ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: isDisabled ? '100%' : `${percentage}%` }}
        />
      </div>
    </div>
  )
}
