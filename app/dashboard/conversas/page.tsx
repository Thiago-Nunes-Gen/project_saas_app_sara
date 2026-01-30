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
  Lightbulb
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FormattedMessage } from '@/lib/formatMessage'

// Dicas rotativas
const DICAS = [
  { icon: TrendingUp, color: 'from-emerald-500 to-teal-500', title: 'Dica Financeira', text: 'Revise seus gastos recorrentes e cancele assinaturas que não usa. Pequenos valores somam!' },
  { icon: Target, color: 'from-purple-500 to-indigo-500', title: 'Produtividade', text: 'Use a técnica Pomodoro: 25min focado + 5min de pausa. Sua concentração agradece!' },
  { icon: Lightbulb, color: 'from-amber-500 to-orange-500', title: 'Anti-Procrastinação', text: 'Comece pelo mais difícil. O resto do dia fica mais leve!' },
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

  const filteredMessages = messages.filter(msg =>
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Conversas</h1>
          <p className="text-gray-500">Histórico de conversas com a SARA</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar nas conversas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Cards de Dicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {DICAS.map((dica, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${dica.color} rounded-xl p-4 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <dica.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{dica.title}</span>
            </div>
            <p className="text-sm text-white/90">{dica.text}</p>
          </div>
        ))}
      </div>

      {/* Messages */}
      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma conversa encontrada
          </h3>
          <p className="text-gray-500">
            Suas conversas com a SARA aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="sticky top-0 bg-[#FAFAFA] py-2 z-10">
                <span className="text-sm font-medium text-gray-500">
                  {formatDateHeader(date + 'T00:00:00')}
                </span>
              </div>
              <div className="card space-y-4">
                {msgs.reverse().map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-purple-100 text-purple-600'
                      }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block p-3 rounded-xl max-w-[80%] ${message.role === 'user'
                        ? 'bg-blue-500 text-white text-left'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        <div className="text-sm">
                          {message.role === 'assistant' ? (
                            <FormattedMessage content={message.content} />
                          ) : (
                            <span className="whitespace-pre-wrap">{message.content}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(parseISO(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Load More */}
          {messages.length >= limit && (
            <div className="text-center">
              <button
                onClick={() => setLimit(limit + 50)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Carregar mais
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
