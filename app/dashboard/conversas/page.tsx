'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import {
  Search,
  MessageSquare,
  User,
  Bot,
  ChevronDown,
  TrendingUp,
  Target,
  Lightbulb,
  Wallet,
  Calendar,
  List,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  X
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FormattedMessage } from '@/lib/formatMessage'

// Dicas expandidas para rotação
const DICAS_POOL = [
  { icon: TrendingUp, color: 'from-emerald-500 to-teal-500', title: 'Dica Financeira', text: 'Revise seus gastos recorrentes e cancele assinaturas que não usa. Pequenos valores somam!' },
  { icon: Target, color: 'from-purple-500 to-indigo-500', title: 'Produtividade', text: 'Use a técnica Pomodoro: 25min focado + 5min de pausa. Sua concentração agradece!' },
  { icon: Lightbulb, color: 'from-amber-500 to-orange-500', title: 'Anti-Procrastinação', text: 'Comece pelo mais difícil. O resto do dia fica mais leve!' },
  { icon: Wallet, color: 'from-blue-500 to-cyan-500', title: 'Economia', text: 'Sempre pague a fatura total do cartão. Juros rotativos são os vilões!' },
  { icon: List, color: 'from-pink-500 to-rose-500', title: 'Organização', text: 'Faça a lista de compras antes de sair. Evita esquecimentos e gastos extras.' },
  { icon: Clock, color: 'from-violet-500 to-purple-500', title: 'Gestão de Tempo', text: 'Agende suas tarefas mais importantes para o horário que você tem mais energia.' },
  { icon: CheckCircle2, color: 'from-green-500 to-emerald-600', title: 'Hábito', text: 'Comece pequeno. Ler 5 páginas por dia é melhor que não ler nada.' },
  { icon: TrendingUp, color: 'from-orange-500 to-red-500', title: 'Reserva', text: 'Tente guardar pelo menos 10% do que ganha para emergências.' },
  { icon: Lightbulb, color: 'from-indigo-500 to-blue-600', title: 'Foco', text: 'Desative notificações do celular enquanto trabalha. Seu cérebro agradece.' },
]

interface ChatMessage {
  id: number
  role: string
  content: string
  created_at: string
}

export default function ConversasPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [limit, setLimit] = useState(50)

  const [activeFilter, setActiveFilter] = useState('all')

  // Estado inicial consistente para evitar erro de hidratação (SSR vs Client)
  const [dicasDoDia, setDicasDoDia] = useState(DICAS_POOL.slice(0, 3))

  // Embaralha as dicas apenas no cliente (após a montagem)
  useEffect(() => {
    const shuffled = [...DICAS_POOL].sort(() => 0.5 - Math.random())
    setDicasDoDia(shuffled.slice(0, 3))
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [limit])

  async function fetchMessages() {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('saas_chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (!error && data) {
      setMessages(data)
    }
    setLoading(false)
  }

  // Classifica a mensagem baseada no conteúdo (Simples e Seguro - Client Side)
  const getMessageType = (content: string) => {
    const lower = content.toLowerCase()
    if (lower.includes('gastei') || lower.includes('compra') || lower.includes('paguei') || lower.includes('saldo') || lower.includes('fatura') || lower.includes('r$')) return 'finance'
    if (lower.includes('lembra') || lower.includes('agendar') || lower.includes('avisar') || lower.includes('reunião')) return 'reminders'
    if (lower.includes('lista') || lower.includes('comprar') || lower.includes('tarefa') || lower.includes('mercado')) return 'lists'
    return 'general'
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    const msgType = getMessageType(msg.content)

    if (activeFilter === 'all') return matchesSearch
    return matchesSearch && msgType === activeFilter
  })

  // Group messages by date
  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = format(parseISO(message.created_at), 'yyyy-MM-dd')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, ChatMessage[]>)

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Hoje'
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Ontem'
    }
    return format(date, "dd 'de' MMMM", { locale: ptBR })
  }

  const filters = [
    { id: 'all', label: 'Todas', icon: MessageSquare },
    { id: 'finance', label: 'Finanças', icon: DollarSign },
    { id: 'reminders', label: 'Lembretes', icon: Calendar },
    { id: 'lists', label: 'Listas', icon: List },
  ]

  return (
    <div className="animate-fade-in max-w-5xl mx-auto pb-10">
      {/* Header & Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-600" />
          Central de Memória
        </h1>
        <p className="text-gray-500 mt-1">
          Explore seu histórico e encontre informações importantes.
        </p>
      </div>

      {/* Mural da SARA (Dinâmico) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {dicasDoDia.map((dica, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${dica.color} rounded-xl p-4 text-white shadow-lg transform transition-all hover:-translate-y-1 hover:shadow-xl cursor-default animate-fade-in`}>
            <div className="flex items-center gap-2 mb-2">
              <dica.icon className="w-5 h-5 opacity-90" />
              <span className="font-bold text-sm tracking-wide uppercase opacity-90">{dica.title}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">{dica.text}</p>
          </div>
        ))}
      </div>

      {/* Controls: Search & Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 sticky top-4 z-20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por palavras-chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills (Layout Fixed: Wrap on desktop, clean scroll on mobile) */}
          <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar justify-start md:justify-end">
            {filters.map(filter => {
              const Icon = filter.icon
              const isActive = activeFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive
                    ? 'bg-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-400 animate-pulse">Carregando suas memórias...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Filter className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nada encontrado
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Tente mudar o filtro ou buscar por outro termo.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setActiveFilter('all') }}
            className="mt-6 text-purple-600 font-medium hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-12 relative before:absolute before:left-8 md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-purple-200 before:via-gray-200 before:to-transparent before:-translate-x-1/2 z-0">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="relative z-10">
              {/* Date Header */}
              <div className="flex justify-start md:justify-center mb-8 pl-16 md:pl-0">
                <div className="bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-600 shadow-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  {formatDateHeader(date + 'T00:00:00')}
                </div>
              </div>

              <div className="space-y-8">
                {msgs.reverse().map((message) => {
                  const type = getMessageType(message.content)
                  const isUser = message.role === 'user'

                  // Icon Selection Logic
                  let TypeIcon = MessageSquare
                  let iconColor = 'bg-gray-100 text-gray-500'

                  if (type === 'finance') { TypeIcon = DollarSign; iconColor = 'bg-green-100 text-green-600' }
                  if (type === 'reminders') { TypeIcon = Calendar; iconColor = 'bg-blue-100 text-blue-600' }
                  if (type === 'lists') { TypeIcon = List; iconColor = 'bg-orange-100 text-orange-600' }
                  if (!isUser) { TypeIcon = Bot; iconColor = 'bg-purple-100 text-purple-600' }

                  return (
                    <div key={message.id} className="relative group">
                      {/* Desktop Layout: User Right, Bot Left */}
                      <div className={`flex flex-col md:flex-row items-start md:items-center gap-4 ${isUser ? 'md:flex-row-reverse' : ''} px-4 md:px-0`}>

                        {/* Time (Desktop Side) */}
                        <div className={`hidden md:block w-1/2 text-xs text-gray-400 ${isUser ? 'text-left pl-8' : 'text-right pr-8'}`}>
                          {format(parseISO(message.created_at), 'HH:mm')}
                        </div>

                        {/* Center Icon (Absolute) */}
                        <div className="absolute left-8 md:left-1/2 top-0 -translate-x-1/2 w-10 h-10 bg-white rounded-full border-4 border-gray-50 flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110">
                          <TypeIcon className={`w-5 h-5 ${iconColor.split(' ')[1]}`} />
                        </div>

                        {/* Message Card */}
                        <div className={`w-full md:w-[calc(50%-40px)] ml-12 md:ml-0 ${isUser ? 'md:pr-12' : 'md:pl-12'}`}>
                          <div className={`p-4 rounded-2xl shadow-sm border transition-shadow hover:shadow-md ${isUser
                            ? 'bg-white border-purple-100 rounded-tl-sm'
                            : 'bg-white border-gray-100 rounded-tr-sm'
                            }`}>
                            {/* Mobile Time Header */}
                            <div className="flex md:hidden items-center justify-between mb-2 pb-2 border-b border-dashed border-gray-100">
                              <span className={`text-xs font-bold uppercase tracking-wider ${isUser ? 'text-purple-600' : 'text-gray-500'}`}>
                                {isUser ? 'Você' : 'SARA'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(parseISO(message.created_at), 'HH:mm')}
                              </span>
                            </div>

                            {/* Content */}
                            <div className={`text-sm leading-relaxed ${isUser ? 'text-gray-700' : 'text-gray-600'}`}>
                              {message.role === 'assistant' ? (
                                <FormattedMessage content={message.content} />
                              ) : (
                                <span className="whitespace-pre-wrap">{message.content}</span>
                              )}
                            </div>

                            {/* Actions (Hover) */}
                            {/* <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                              <button className="text-xs font-medium text-purple-600 hover:bg-purple-50 px-2 py-1 rounded">
                                Copiar
                              </button>
                            </div> */}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {messages.length >= limit && (
        <div className="text-center mt-12">
          <button
            onClick={() => setLimit(limit + 50)}
            className="group bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:border-purple-200 hover:text-purple-600 transition-all flex items-center gap-2 mx-auto font-medium"
          >
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
            Ver memórias mais antigas
          </button>
        </div>
      )}
    </div>
  )
}
