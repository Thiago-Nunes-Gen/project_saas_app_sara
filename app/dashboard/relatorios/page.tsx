'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'
import { useClient } from '@/hooks/useClient'
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  ListTodo,
  Bell,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  X,
  Lock
} from 'lucide-react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface GeneratedReport {
  id: string
  type: string
  period_start: string
  period_end: string
  file_url: string
  file_type: string
  status: string
  created_at: string
  insights_summary: string | null
}

type ReportType = 'financeiro_completo' | 'listas_pendentes' | 'lembretes'
type PeriodType = 'mes_atual' | 'mes_anterior' | 'trimestre' | 'semestre' | 'ano' | 'personalizado'

export default function RelatoriosPage() {
  const { client } = useClient()
  const [selectedType, setSelectedType] = useState<ReportType | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('mes_atual')
  const [customDateStart, setCustomDateStart] = useState('')
  const [customDateEnd, setCustomDateEnd] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Carrega relatórios já gerados
  useEffect(() => {
    if (client?.id) {
      fetchGeneratedReports()
    }
  }, [client?.id])

  async function fetchGeneratedReports() {
    setLoadingReports(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('saas_reports')
      .select('*')
      .eq('client_id', client?.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!error && data) {
      setGeneratedReports(data)
    }
    setLoadingReports(false)
  }

  // Calcula datas do período
  function getPeriodDates(period: PeriodType): { start: string; end: string } {
    const now = new Date()

    switch (period) {
      case 'mes_atual':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        }
      case 'mes_anterior':
        const lastMonth = subMonths(now, 1)
        return {
          start: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
          end: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
        }
      case 'trimestre':
        return {
          start: format(subMonths(now, 3), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        }
      case 'semestre':
        return {
          start: format(subMonths(now, 6), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        }
      case 'ano':
        return {
          start: format(subMonths(now, 12), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd')
        }
      case 'personalizado':
        return {
          start: customDateStart,
          end: customDateEnd
        }
      default:
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd')
        }
    }
  }

  // Gera relatório
  async function handleGenerateReport() {
    if (!selectedType) {
      setError('Selecione um tipo de relatório')
      return
    }

    // Check plan restriction
    if (client?.plan === 'free') {
      setShowUpgradeModal(true)
      return
    }

    if (selectedPeriod === 'personalizado' && (!customDateStart || !customDateEnd)) {
      setError('Selecione as datas do período personalizado')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)

    const dates = getPeriodDates(selectedPeriod)

    try {
      // Chama o webhook do n8n
      const response = await fetch('https://master-n8n.0wtkoy.easypanel.host/webhook/sara-relatorios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: client?.id,
          whatsapp_id: client?.whatsapp_id,
          report_type: selectedType,
          period_start: dates.start,
          period_end: dates.end,
          file_format: 'pdf', // Forçado para PDF
          client_name: client?.name || client?.apelido || 'Cliente'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }

      const result = await response.json()

      if (result.success) {
        setSuccess('Relatório gerado com sucesso! Verifique abaixo para download.')
        fetchGeneratedReports() // Atualiza lista
        setSelectedType(null) // Limpa seleção
      } else {
        throw new Error(result.error || 'Erro ao gerar relatório')
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório. Tente novamente.')
    } finally {
      setGenerating(false)
    }
  }

  // Baixa relatório: solicita signed URL ao backend (server-side) e abre em nova aba
  async function handleDownload(reportId: string) {
    try {
      setDownloadingId(reportId)
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const res = await fetch(`/api/reports/${reportId}/download`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Erro ao gerar link' }))
        throw new Error(err.error || 'Erro ao gerar link')
      }

      const { url } = await res.json()
      if (!url) throw new Error('URL inválida')
      window.open(url, '_blank')
    } catch (err: any) {
      setError(err.message || 'Erro ao baixar relatório')
    } finally {
      setDownloadingId(null)
    }
  }

  const reportTypes = [
    {
      id: 'financeiro_completo' as ReportType,
      title: 'Financeiro Completo',
      description: 'Receitas + Despesas + Análise da SARA',
      icon: DollarSign,
      color: 'blue',
      features: ['Todas as transações', 'Gráficos por categoria', 'Análise de gastos', 'Dicas personalizadas']
    },
    {
      id: 'listas_pendentes' as ReportType,
      title: 'Listas Pendentes',
      description: 'Itens em aberto organizados',
      icon: ListTodo,
      color: 'purple',
      features: ['Todas as listas ativas', 'Itens pendentes', 'Progresso', 'Sugestões']
    },
    {
      id: 'lembretes' as ReportType,
      title: 'Lembretes',
      description: 'Agenda do período + cumprimento',
      icon: Bell,
      color: 'amber',
      features: ['Lembretes do período', 'Taxa de cumprimento', 'Atrasados', 'Próximos']
    }
  ]

  const periods = [
    { id: 'mes_atual' as PeriodType, label: 'Mês Atual' },
    { id: 'mes_anterior' as PeriodType, label: 'Mês Anterior' },
    { id: 'trimestre' as PeriodType, label: 'Últimos 3 meses' },
    { id: 'semestre' as PeriodType, label: 'Últimos 6 meses' },
    { id: 'ano' as PeriodType, label: 'Último ano' },
    { id: 'personalizado' as PeriodType, label: 'Personalizado' }
  ]

  const getColorClasses = (color: string, selected: boolean) => {
    const colors: Record<string, { bg: string; border: string; icon: string }> = {
      blue: {
        bg: selected ? 'bg-blue-50' : 'bg-white',
        border: selected ? 'border-blue-500' : 'border-gray-200',
        icon: 'bg-blue-100 text-blue-600'
      },
      purple: {
        bg: selected ? 'bg-purple-50' : 'bg-white',
        border: selected ? 'border-purple-500' : 'border-gray-200',
        icon: 'bg-purple-100 text-purple-600'
      },
      amber: {
        bg: selected ? 'bg-amber-50' : 'bg-white',
        border: selected ? 'border-amber-500' : 'border-gray-200',
        icon: 'bg-amber-100 text-amber-600'
      }
    }
    return colors[color] || colors.blue
  }

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'financeiro_completo': 'Financeiro Completo',
      'listas_pendentes': 'Listas Pendentes',
      'lembretes': 'Lembretes'
    }
    return labels[type] || type
  }

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Gere relatórios personalizados com análises da SARA</p>
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Info Card - SARA Insights */}
      <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">Relatórios com Inteligência Artificial</h3>
            <p className="text-white/80 text-sm">
              A SARA analisa seus dados e inclui insights personalizados em cada relatório:
              onde estão os maiores gastos, dicas de economia, alertas importantes e muito mais!
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal - Seleção */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipo de Relatório */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Escolha o tipo de relatório</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => {
                const Icon = type.icon
                const colors = getColorClasses(type.color, selectedType === type.id)

                return (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.icon}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{type.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{type.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {type.features.slice(0, 2).map((feature, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Período */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Selecione o período</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedPeriod === period.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Datas personalizadas */}
            {selectedPeriod === 'personalizado' && (
              <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="label">Data Início</label>
                  <input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Data Fim</label>
                  <input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botão Gerar */}
          <button
            onClick={handleGenerateReport}
            disabled={!selectedType || generating}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Gerando relatório...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Gerar Relatório com Análise da SARA
              </>
            )}
          </button>
        </div>

        {/* Coluna Lateral - Relatórios Gerados */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Relatórios Gerados</h2>
              <span className="text-sm text-gray-500">{generatedReports.length} disponíveis</span>
            </div>

            {loadingReports ? (
              <div className="flex justify-center py-8">
                <div className="spinner" />
              </div>
            ) : generatedReports.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">Nenhum relatório gerado ainda</p>
                <p className="text-gray-400 text-xs mt-1">Seus relatórios aparecerão aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generatedReports.map((report) => (
                  <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {getReportTypeLabel(report.type)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(report.period_start), 'dd/MM/yy', { locale: ptBR })} - {format(new Date(report.period_end), 'dd/MM/yy', { locale: ptBR })}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Gerado em {format(new Date(report.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Baixar"
                        disabled={downloadingId === report.id}
                      >
                        {downloadingId === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Preview do insight */}
                    {report.insights_summary && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                        <span className="font-medium">💡 Insight:</span> {report.insights_summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dica */}
          <div className="card bg-amber-50 border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-amber-900">Dica</h4>
                <p className="text-xs text-amber-700 mt-1">
                  Os relatórios são exclusivos do Portal. A SARA no WhatsApp não tem acesso a eles,
                  garantindo sua privacidade financeira.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Upgrade Modal */}
      {
        showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Desbloqueie os Relatórios
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Os relatórios completos com análise de IA estão disponíveis a partir do plano <strong>Starter</strong>.
                  Faça o upgrade para ter insights valiosos sobre suas finanças e produtividade!
                </p>

                <div className="space-y-3">
                  <Link
                    href="/dashboard/planos"
                    className="block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  >
                    Ver Planos e Preços
                  </Link>

                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="block w-full py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    Continuar no Grátis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}
