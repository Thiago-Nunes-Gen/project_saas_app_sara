'use client'

import { useState } from 'react'
import { useReminders } from '@/hooks/useReminders'
import { 
  Plus, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  MoreHorizontal,
  Bell
} from 'lucide-react'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export default function LembretesPage() {
  const [filter, setFilter] = useState<'pending' | 'completed' | 'cancelled'>('pending')
  const { reminders, loading, completeReminder, cancelReminder } = useReminders({ status: filter })

  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return `Hoje às ${format(date, 'HH:mm')}`
    if (isTomorrow(date)) return `Amanhã às ${format(date, 'HH:mm')}`
    return format(date, "dd 'de' MMMM, HH:mm", { locale: ptBR })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-500 bg-red-50'
      case 'media': return 'text-amber-500 bg-amber-50'
      default: return 'text-green-500 bg-green-50'
    }
  }

  const getStatusIcon = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isPast(date)) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (isToday(date)) return <Clock className="w-4 h-4 text-amber-500" />
    return <Calendar className="w-4 h-4 text-primary-500" />
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-sara-text">Lembretes</h1>
          <p className="text-sara-muted">{reminders.length} {filter === 'pending' ? 'pendentes' : filter === 'completed' ? 'concluídos' : 'cancelados'}</p>
        </div>
        <Link href="/dashboard/lembretes/novo" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Lembrete
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === 'pending' 
              ? 'bg-primary-500 text-white' 
              : 'bg-white border border-sara-border text-sara-muted hover:bg-gray-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          Pendentes
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === 'completed' 
              ? 'bg-green-500 text-white' 
              : 'bg-white border border-sara-border text-sara-muted hover:bg-gray-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Concluídos
        </button>
        <button 
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            filter === 'cancelled' 
              ? 'bg-gray-500 text-white' 
              : 'bg-white border border-sara-border text-sara-muted hover:bg-gray-50'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Cancelados
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-sara-light" />
            </div>
            <h3 className="text-lg font-medium text-sara-text mb-2">
              Nenhum lembrete {filter === 'pending' ? 'pendente' : filter === 'completed' ? 'concluído' : 'cancelado'}
            </h3>
            <p className="text-sara-muted mb-6">
              {filter === 'pending' ? 'Crie um novo lembrete para começar' : 'Os lembretes aparecerão aqui'}
            </p>
            {filter === 'pending' && (
              <Link href="/dashboard/lembretes/novo" className="btn-primary">
                Criar lembrete
              </Link>
            )}
          </div>
        ) : (
          reminders.map((reminder) => (
            <div key={reminder.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getStatusIcon(reminder.remind_at)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-sara-text mb-1">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-sm text-sara-muted mb-3">{reminder.description}</p>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm text-sara-muted flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(reminder.remind_at)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority === 'alta' ? 'Prioridade Alta' : reminder.priority === 'media' ? 'Prioridade Média' : 'Prioridade Baixa'}
                      </span>
                      {reminder.type !== 'unico' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-600 font-medium">
                          {reminder.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {filter === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => completeReminder(reminder.id)}
                      className="p-2 hover:bg-green-50 rounded-lg text-sara-light hover:text-green-600 transition-colors"
                      title="Marcar como concluído"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => cancelReminder(reminder.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-sara-light hover:text-red-500 transition-colors"
                      title="Cancelar"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
