'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
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
  ExternalLink
} from 'lucide-react'

export default function ConfiguracoesPage() {
  const { client, loading: clientLoading, refetch } = useClient()
  const [activeTab, setActiveTab] = useState('perfil')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Profile form
  const [name, setName] = useState('')
  const [apelido, setApelido] = useState('')
  const [email, setEmail] = useState('')

  // Preferences
  const [morningSummary, setMorningSummary] = useState(true)
  const [botName, setBotName] = useState('SARA')

  useEffect(() => {
    if (client) {
      setName(client.name || '')
      setApelido(client.apelido || '')
      setEmail(client.email || '')
      setMorningSummary(client.morning_summary_enabled ?? true)
      setBotName(client.bot_name || 'SARA')
    }
  }, [client])

  const saveProfile = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('saas_clients')
        .update({
          name,
          apelido,
          email,
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
          bot_name: botName,
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

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'whatsapp', label: 'WhatsApp', icon: Phone },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'plano', label: 'Plano', icon: CreditCard },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
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
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                  />
                </div>

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
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">WhatsApp conectado</p>
                      <p className="text-sm text-green-700">
                        +{client.whatsapp_id.replace('@s.whatsapp.net', '').replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 $2 $3-$4')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-900">WhatsApp não vinculado</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Para vincular, envie uma mensagem para a SARA no WhatsApp dizendo "vincular portal" 
                        e siga as instruções.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Personalização</h3>
                <div>
                  <label className="label">Nome do assistente</label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="input"
                    placeholder="SARA"
                  />
                  <p className="text-sm text-gray-500 mt-1">Como você quer chamar sua assistente</p>
                </div>

                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="btn-primary mt-4 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
              </div>
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
                    className={`w-12 h-7 rounded-full transition-colors ${
                      morningSummary ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      morningSummary ? 'translate-x-6' : 'translate-x-1'
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

              <h3 className="font-medium text-gray-900 mb-4">Uso do plano</h3>
              <div className="space-y-4">
                <UsageBar 
                  label="Lembretes" 
                  used={client?.reminders_count || 0} 
                  max={client?.max_reminders || 50} 
                />
                <UsageBar 
                  label="Transações/mês" 
                  used={client?.transactions_month || 0} 
                  max={client?.max_transactions_month || 200} 
                />
                <UsageBar 
                  label="Documentos" 
                  used={client?.documents_count || 0} 
                  max={client?.max_documents || 50} 
                />
                <UsageBar 
                  label="Pesquisas IA/mês" 
                  used={client?.web_searches_month || 0} 
                  max={client?.max_web_searches_month || 10} 
                />
              </div>
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
                    <button className="btn-secondary text-sm">
                      Alterar
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sessões ativas</p>
                      <p className="text-sm text-gray-500">Gerencie seus dispositivos conectados</p>
                    </div>
                    <button className="btn-secondary text-sm">
                      Ver sessões
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-900">Excluir conta</p>
                      <p className="text-sm text-red-700">Isso irá apagar todos os seus dados</p>
                    </div>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function UsageBar({ label, used, max }: { label: string, used: number, max: number }) {
  const percentage = Math.min((used / max) * 100, 100)
  const isHigh = percentage > 80
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`text-sm font-medium ${isHigh ? 'text-amber-600' : 'text-gray-900'}`}>
          {used} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${isHigh ? 'bg-amber-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
