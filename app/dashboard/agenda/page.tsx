'use client'

import { useState } from 'react'
import { useCalendarEvents, CalendarEvent, useAppointments } from '@/hooks/useAppointments'
import { useReminders } from '@/hooks/useReminders'
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Bell,
    CheckCircle2,
    XCircle,
    Pencil,
    X,
    Save
} from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AgendaPage() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        location: '',
        start: '',
        end: ''
    })

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    const { events, eventsByDay, loading, refetch: refetchEvents } = useCalendarEvents(year, month)
    const { completeReminder, cancelReminder, refetch: refetchReminders, updateReminder } = useReminders()
    const { completeAppointment, cancelAppointment, updateAppointment } = useAppointments()

    // Handler para ações nos eventos
    const handleComplete = async (event: CalendarEvent) => {
        if (event.type === 'reminder') {
            await completeReminder(event.id)
            refetchReminders()
        } else {
            await completeAppointment(event.id)
        }
        refetchEvents()
    }

    const handleCancel = async (event: CalendarEvent) => {
        if (event.type === 'reminder') {
            await cancelReminder(event.id)
            refetchReminders()
        } else {
            await cancelAppointment(event.id)
        }
        refetchEvents()
    }

    // Handler para abrir modal de edição
    const openEditModal = (event: CalendarEvent) => {
        setEditingEvent(event)
        setEditForm({
            title: event.title,
            description: event.description || '',
            location: event.location || '',
            start: format(parseISO(event.start), "yyyy-MM-dd'T'HH:mm"),
            end: format(parseISO(event.end), "yyyy-MM-dd'T'HH:mm")
        })
    }

    // Handler para salvar edição
    const handleSaveEdit = async () => {
        if (!editingEvent) return

        try {
            if (editingEvent.type === 'appointment') {
                await updateAppointment(editingEvent.id, {
                    title: editForm.title,
                    description: editForm.description,
                    location: editForm.location,
                    start_at: new Date(editForm.start).toISOString(),
                    end_at: new Date(editForm.end).toISOString()
                })
            } else {
                await updateReminder(editingEvent.id, {
                    title: editForm.title,
                    description: editForm.description,
                    remind_at: new Date(editForm.start).toISOString()
                })
                refetchReminders()
            }
            refetchEvents()
            setEditingEvent(null)
        } catch (err) {
            console.error('Erro ao salvar:', err)
        }
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Preenche dias para começar na segunda-feira
    const startDay = monthStart.getDay()
    const prefixDays = startDay === 0 ? 6 : startDay - 1 // Ajusta para segunda = 0

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month, 1))
    }

    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    // Filtra apenas eventos abertos para as bolinhas
    const getEventsForDay = (day: number): CalendarEvent[] => {
        const dayEvents = eventsByDay[day] || []
        // Só mostra eventos abertos nas bolinhas
        return dayEvents.filter(e => e.status === 'scheduled' || e.status === 'pending')
    }

    const selectedDayEvents = selectedDate
        ? events.filter(e => isSameDay(parseISO(e.start), selectedDate))
        : []

    const formatEventTime = (dateStr: string) => {
        return format(parseISO(dateStr), 'HH:mm')
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'alta': return 'bg-red-100 text-red-700 border-red-200'
            case 'media': return 'bg-amber-100 text-amber-700 border-amber-200'
            default: return 'bg-green-100 text-green-700 border-green-200'
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-sara-text">Agenda</h1>
                    <p className="text-sara-muted">
                        {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-medium text-sara-muted hover:text-sara-text border border-sara-border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hoje
                    </button>
                    <Link href="/dashboard/agenda/novo" className="btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Novo Compromisso
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendário */}
                <div className="lg:col-span-2 card">
                    {/* Navegação do mês */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-sara-muted" />
                        </button>
                        <h2 className="text-lg font-semibold text-sara-text">
                            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-sara-muted" />
                        </button>
                    </div>

                    {/* Dias da semana */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-sara-muted py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid do calendário */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Dias vazios antes do início do mês */}
                        {Array.from({ length: prefixDays }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square p-1" />
                        ))}

                        {/* Dias do mês */}
                        {days.map(day => {
                            const dayNumber = day.getDate()
                            const dayEvents = getEventsForDay(dayNumber)
                            const isSelected = selectedDate && isSameDay(day, selectedDate)
                            const appointments = dayEvents.filter(e => e.type === 'appointment')
                            const reminders = dayEvents.filter(e => e.type === 'reminder')
                            const hasAppointments = appointments.length > 0
                            const hasReminders = reminders.length > 0

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        aspect-square p-1 rounded-lg text-sm font-medium transition-all relative
                                        ${isToday(day) ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}
                                        ${isSelected && !isToday(day) ? 'bg-primary-100 text-primary-700' : ''}
                                        ${!isSelected && !isToday(day) ? 'hover:bg-gray-100 text-sara-text' : ''}
                                    `}
                                >
                                    <span className="block">{dayNumber}</span>

                                    {/* Indicadores de eventos com hover preview individual */}
                                    {(hasAppointments || hasReminders) && (
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                                            {hasAppointments && (
                                                <div className="relative group/appointments">
                                                    <span className={`
                                                        w-2.5 h-2.5 rounded-full block cursor-pointer
                                                        transition-transform duration-200 group-hover/appointments:scale-150
                                                        ${isToday(day) ? 'bg-white' : 'bg-blue-500'}
                                                    `} />
                                                    {/* Tooltip Preview - Compromissos */}
                                                    <div className="
                                                        absolute bottom-full left-1/2 -translate-x-1/2 mb-3
                                                        opacity-0 group-hover/appointments:opacity-100 pointer-events-none
                                                        transition-all duration-300 ease-out
                                                        scale-75 group-hover/appointments:scale-100
                                                        z-50
                                                    ">
                                                        <div className="bg-blue-600 text-white text-xs rounded-lg p-2.5 shadow-xl min-w-[160px] max-w-[220px]">
                                                            <div className="font-semibold mb-1.5 flex items-center gap-1.5 text-sm">
                                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                                {appointments.length} Compromisso{appointments.length > 1 ? 's' : ''}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {appointments.slice(0, 3).map(a => (
                                                                    <div key={a.id} className="truncate text-blue-100">
                                                                        • {format(parseISO(a.start), 'HH:mm')} {a.title}
                                                                    </div>
                                                                ))}
                                                                {appointments.length > 3 && (
                                                                    <div className="text-blue-200 italic">+{appointments.length - 3} mais</div>
                                                                )}
                                                            </div>
                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-blue-600" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {hasReminders && (
                                                <div className="relative group/reminders">
                                                    <span className={`
                                                        w-2.5 h-2.5 rounded-full block cursor-pointer
                                                        transition-transform duration-200 group-hover/reminders:scale-150
                                                        ${isToday(day) ? 'bg-white' : 'bg-amber-500'}
                                                    `} />
                                                    {/* Tooltip Preview - Lembretes */}
                                                    <div className="
                                                        absolute bottom-full left-1/2 -translate-x-1/2 mb-3
                                                        opacity-0 group-hover/reminders:opacity-100 pointer-events-none
                                                        transition-all duration-300 ease-out
                                                        scale-75 group-hover/reminders:scale-100
                                                        z-50
                                                    ">
                                                        <div className="bg-amber-500 text-white text-xs rounded-lg p-2.5 shadow-xl min-w-[160px] max-w-[220px]">
                                                            <div className="font-semibold mb-1.5 flex items-center gap-1.5 text-sm">
                                                                <Bell className="w-3.5 h-3.5" />
                                                                {reminders.length} Lembrete{reminders.length > 1 ? 's' : ''}
                                                            </div>
                                                            <div className="space-y-1">
                                                                {reminders.slice(0, 3).map(r => (
                                                                    <div key={r.id} className="truncate text-amber-100">
                                                                        • {format(parseISO(r.start), 'HH:mm')} {r.title}
                                                                    </div>
                                                                ))}
                                                                {reminders.length > 3 && (
                                                                    <div className="text-amber-200 italic">+{reminders.length - 3} mais</div>
                                                                )}
                                                            </div>
                                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-amber-500" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Legenda */}
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-sara-border">
                        <div className="flex items-center gap-2 text-sm text-sara-muted">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            Compromisso
                        </div>
                        <div className="flex items-center gap-2 text-sm text-sara-muted">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            Lembrete
                        </div>
                    </div>
                </div>

                {/* Painel lateral - Eventos do dia selecionado */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-sara-text mb-4 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary-500" />
                        {selectedDate
                            ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
                            : 'Selecione um dia'
                        }
                    </h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="spinner" />
                        </div>
                    ) : selectedDayEvents.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon className="w-6 h-6 text-sara-light" />
                            </div>
                            <p className="text-sara-muted text-sm">Nenhum evento neste dia</p>
                            <Link
                                href="/dashboard/agenda/novo"
                                className="text-primary-500 hover:text-primary-600 text-sm font-medium mt-2 inline-block"
                            >
                                + Adicionar compromisso
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayEvents.map(event => {
                                // Determina as cores baseado no status
                                const getCardStyles = () => {
                                    if (event.status === 'completed') {
                                        return 'bg-green-50 border-green-500 opacity-75'
                                    }
                                    if (event.status === 'cancelled') {
                                        return 'bg-red-50 border-red-500 opacity-75'
                                    }
                                    return event.type === 'appointment'
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-amber-50 border-amber-500'
                                }

                                return (
                                    <div
                                        key={`${event.type}-${event.id}`}
                                        className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-sm ${getCardStyles()}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {event.status === 'completed' ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    ) : event.status === 'cancelled' ? (
                                                        <XCircle className="w-4 h-4 text-red-600" />
                                                    ) : event.type === 'appointment' ? (
                                                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <Bell className="w-4 h-4 text-amber-600" />
                                                    )}
                                                    <span className={`text-xs font-medium uppercase ${event.status === 'completed' ? 'text-green-600' :
                                                        event.status === 'cancelled' ? 'text-red-600' :
                                                            'text-gray-500'
                                                        }`}>
                                                        {event.status === 'completed' ? 'Concluído' :
                                                            event.status === 'cancelled' ? 'Cancelado' :
                                                                event.type === 'appointment' ? 'Compromisso' : 'Lembrete'}
                                                    </span>
                                                </div>

                                                <h4 className={`font-medium ${event.status === 'completed' || event.status === 'cancelled'
                                                    ? 'line-through text-gray-500'
                                                    : 'text-sara-text'
                                                    }`}>
                                                    {event.title}
                                                </h4>

                                                {event.description && (
                                                    <p className="text-sm text-sara-muted mt-1">{event.description}</p>
                                                )}

                                                <div className="flex items-center gap-3 mt-2 text-sm text-sara-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatEventTime(event.start)}
                                                        {event.type === 'appointment' && event.end !== event.start && (
                                                            <> - {formatEventTime(event.end)}</>
                                                        )}
                                                    </span>

                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(event.priority)}`}>
                                                    {event.priority === 'alta' ? 'Alta' : event.priority === 'media' ? 'Média' : 'Baixa'}
                                                </span>
                                            </div>

                                            {event.status === 'scheduled' || event.status === 'pending' ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => openEditModal(event)}
                                                        className="p-1.5 hover:bg-blue-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleComplete(event)}
                                                        className="p-1.5 hover:bg-green-100 rounded text-gray-400 hover:text-green-600 transition-colors"
                                                        title="Concluir"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(event)}
                                                        className="p-1.5 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Edição */}
            {editingEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 animate-scale-in">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-sara-text flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-primary-500" />
                                Editar {editingEvent.type === 'appointment' ? 'Compromisso' : 'Lembrete'}
                            </h3>
                            <button
                                onClick={() => setEditingEvent(null)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            {editingEvent.type === 'appointment' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                                    <input
                                        type="text"
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingEvent.type === 'appointment' ? 'Início' : 'Data/Hora'}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.start}
                                        onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                {editingEvent.type === 'appointment' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                                        <input
                                            type="datetime-local"
                                            value={editForm.end}
                                            onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 border-t border-gray-200">
                            <button
                                onClick={() => setEditingEvent(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
