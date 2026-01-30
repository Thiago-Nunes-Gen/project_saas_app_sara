'use client'

import { useState, useEffect } from 'react'
import { useClient } from '@/hooks/useClient'
import { useTransactions, useMonthlyStats } from '@/hooks/useTransactions'
import { useReminders } from '@/hooks/useReminders'
import { createClient } from '@/lib/supabase-browser'
import {
  ArrowUpRight,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Upload,
  FileText,
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  ListTodo,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { format, isToday, isTomorrow, parseISO, isBefore, addHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface PendingList {
  id: string
  title: string
  items: any[]
  updated_at: string
}

export default function DashboardPage() {
  const { client, loading: clientLoading } = useClient()
  const { stats, loading: statsLoading } = useMonthlyStats()
  const { transactions, loading: transactionsLoading } = useTransactions({ limit: 5 })
  const { reminders, loading: remindersLoading } = useReminders({ status: 'pending', limit: 20 })
  const [hideValues, setHideValues] = useState(false)
  const [pendingLists, setPendingLists] = useState<PendingList[]>([])
  const [listsLoading, setListsLoading] = useState(true)

  // Busca listas pendentes
  useEffect(() => {
    async function fetchPendingLists() {
      const supabase = createClient()
      const { data } = await supabase
        .from('saas_lists')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(10)

      if (data) {
        // Filtra listas que têm itens não concluídos
        const listsWithPending = data.filter(list => {
          if (!Array.isArray(list.items)) return false
          return list.items.some((item: any) => {
            const isChecked = item.checked ?? item.feito ?? false
            return !isChecked
          })
        })
        setPendingLists(listsWithPending.slice(0, 3))
      }
      setListsLoading(false)
    }
    fetchPendingLists()
  }, [])

  // Saudação baseada no horário
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const formatCurrency = (value: number) => {
    if (hideValues) return 'R$ •••••'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatReminderDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) {
      return `Hoje, ${format(date, 'HH:mm')}`
    }
    if (isTomorrow(date)) {
      return `Amanhã, ${format(date, 'HH:mm')}`
    }
    return format(date, "dd/MM, HH:mm")
  }

  // Filtra lembretes do dia
  const todayReminders = reminders.filter(r => {
    const reminderDate = parseISO(r.remind_at)
    return isToday(reminderDate)
  })

  // Ordena por: urgentes primeiro, depois por horário mais próximo
  const sortedTodayReminders = [...todayReminders].sort((a, b) => {
    // Urgentes primeiro
    if (a.priority === 'alta' && b.priority !== 'alta') return -1
    if (b.priority === 'alta' && a.priority !== 'alta') return 1
    // Depois por horário
    return new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
  }).slice(0, 3)

  // Conta itens pendentes em uma lista
  const getPendingCount = (items: any[]) => {
    if (!Array.isArray(items)) return 0
    return items.filter(item => !(item.checked ?? item.feito ?? false)).length
  }

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR })
  const dayOfWeek = format(new Date(), 'EEEE', { locale: ptBR })
  const fullDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  if (clientLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Mobile Date Card - Aparece primeiro no celular */}
      <div className="md:hidden card mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 capitalize leading-tight">{dayOfWeek}</p>
            <p className="text-xs text-gray-500">{fullDate}</p>
          </div>
        </div>
      </div>

      {/* Greeting - Adaptado para Mobile/Desktop */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-normal text-gray-900">
          <span className="hidden md:inline">{getGreeting()}, </span>
          <span className="md:hidden">Olá, </span>
          {client?.apelido || client?.name?.split(' ')[0] || 'Usuário'}.
          <span className="font-semibold block md:inline md:ml-1 mt-1 md:mt-0">É bom te ver!</span>
        </h1>
      </div>

      <div className="md:hidden grid grid-cols-2 gap-3 mb-6">
        <Link href="/dashboard/lembretes" className="p-3 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-700">Novo Lembrete</span>
        </Link>
        <Link href="/dashboard/financeiro" className="p-3 bg-white rounded-xl border border-gray-100 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium text-gray-700">Nova Transação</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Column */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="card animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Resumo Financeiro</h2>
                <p className="text-sm text-gray-400 capitalize">{currentMonth}</p>
              </div>
              <button
                onClick={() => setHideValues(!hideValues)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
              >
                {hideValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-green-50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Receitas
                </div>
                <p className="text-2xl font-semibold text-green-600">
                  {statsLoading ? '...' : formatCurrency(stats?.total_income || 0)}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-red-50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  Despesas
                </div>
                <p className="text-2xl font-semibold text-red-600">
                  {statsLoading ? '...' : formatCurrency(stats?.total_expense || 0)}
                </p>
              </div>

              <div className="p-5 rounded-xl bg-blue-50">
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <DollarSign className="w-4 h-4" />
                  Saldo
                </div>
                <p className="text-2xl font-semibold text-blue-600">
                  {statsLoading ? '...' : formatCurrency(stats?.balance || 0)}
                </p>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Últimas Transações</h3>
              <Link href="/dashboard/financeiro" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Ver todas →
              </Link>
            </div>

            <div className="space-y-1">
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhuma transação encontrada</p>
              ) : (
                transactions.slice(0, 4).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'income'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}>
                        {transaction.type === 'income'
                          ? <TrendingUp className="w-5 h-5" />
                          : <TrendingDown className="w-5 h-5" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-xs text-gray-400">
                          {transaction.category} • {format(parseISO(transaction.date), 'dd/MM')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lembretes */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Seus Lembretes</h2>
                <p className="text-sm text-gray-400">{reminders.length} pendentes</p>
              </div>
              <Link href="/dashboard/lembretes" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Ver todos →
              </Link>
            </div>

            {remindersLoading ? (
              <div className="flex justify-center py-8">
                <div className="spinner" />
              </div>
            ) : reminders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-9 h-9 text-gray-400" />
                  </div>
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-[3px] border-white">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Tudo em dia!</h3>
                <p className="text-sm text-gray-400">Não há lembretes pendentes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.slice(0, 4).map((reminder) => (
                  <Link
                    key={reminder.id}
                    href="/dashboard/lembretes"
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{reminder.title}</h4>
                      {reminder.description && (
                        <p className="text-sm text-gray-400 line-clamp-1">{reminder.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatReminderDate(reminder.remind_at)}
                        </div>
                        {reminder.priority === 'alta' && (
                          <div className="flex items-center gap-1 text-xs text-amber-500 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Urgente
                          </div>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Informações do Plano */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Seu Plano</h2>
                <p className="text-sm text-gray-400 uppercase">{client?.plan || 'Free'}</p>
              </div>
              <Link href="/dashboard/configuracoes" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                Gerenciar →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Lembretes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {client?.reminders_count || 0} / {client?.max_reminders || 50}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Transações/mês</p>
                <p className="text-lg font-semibold text-gray-900">
                  {client?.transactions_month || 0} / {client?.max_transactions_month || 200}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Documentos</p>
                <p className="text-lg font-semibold text-gray-900">
                  {client?.documents_count || 0} / {client?.max_documents || 50}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Pesquisas IA</p>
                <p className="text-lg font-semibold text-gray-900">
                  {client?.web_searches_month || 0} / {client?.max_web_searches_month || 10}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Agenda do Dia - Melhorada */}
          <div className="card animate-fade-in-up md:block hidden" style={{ animationDelay: '0.1s' }}>
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900">{getGreeting()}!</p>
              <p className="text-sm text-gray-500 capitalize">{dayOfWeek}</p>
              <p className="text-sm text-gray-400">{fullDate}</p>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Lembretes de Hoje
              </h4>

              {remindersLoading ? (
                <div className="flex justify-center py-4">
                  <div className="spinner w-5 h-5" />
                </div>
              ) : sortedTodayReminders.length === 0 ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Nenhum lembrete para hoje</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedTodayReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`flex gap-3 p-3 rounded-lg ${reminder.priority === 'alta' ? 'bg-red-50 border border-red-100' : 'bg-gray-50'
                        }`}
                    >
                      <span className={`text-xs font-semibold min-w-[45px] ${reminder.priority === 'alta' ? 'text-red-600' : 'text-blue-500'
                        }`}>
                        {format(parseISO(reminder.remind_at), 'HH:mm')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{reminder.title}</h5>
                          {reminder.priority === 'alta' && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {todayReminders.length > 3 && (
                    <Link
                      href="/dashboard/lembretes"
                      className="flex items-center justify-center gap-1 p-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                    >
                      Ver todos ({todayReminders.length})
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Listas Pendentes */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Listas Pendentes
              </h4>

              {listsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="spinner w-5 h-5" />
                </div>
              ) : pendingLists.length === 0 ? (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Todas as listas concluídas!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingLists.map((list) => (
                    <Link
                      key={list.id}
                      href="/dashboard/listas"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{list.title}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                        {getPendingCount(list.items)} pendentes
                      </span>
                    </Link>
                  ))}

                  <Link
                    href="/dashboard/listas"
                    className="flex items-center justify-center gap-1 p-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Ver todas
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Acesso Rápido */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/financeiro/nova" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <Plus className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Nova Transação</span>
              </Link>
              <Link href="/dashboard/lembretes/novo" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <Clock className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Novo Lembrete</span>
              </Link>
              <Link href="/dashboard/listas/nova" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <FileText className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Nova Lista</span>
              </Link>
              <Link href="/dashboard/documentos" className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                <Upload className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-blue-600">Documentos</span>
              </Link>
            </div>
          </div>

          {/* WhatsApp Status */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">WhatsApp Vinculado</h3>
            <div className={`flex items-center gap-3 p-3 rounded-lg ${client?.whatsapp_id ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${client?.whatsapp_id ? 'bg-green-500' : 'bg-amber-500'}`}>
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                {client?.whatsapp_id ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      +{client.whatsapp_id.replace('@s.whatsapp.net', '').replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 $2 $3-$4')}
                    </p>
                    <p className="text-xs text-green-600">● Conectado</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">Não vinculado</p>
                    <Link href="/dashboard/configuracoes" className="text-xs text-amber-600 hover:underline">
                      Vincular agora →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
