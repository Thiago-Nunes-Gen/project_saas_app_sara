'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-browser'

export interface Appointment {
    id: number
    client_id: string
    title: string
    description?: string
    location?: string
    start_at: string
    end_at: string
    all_day: boolean
    notify_before: number
    priority: 'baixa' | 'media' | 'alta'
    status: 'scheduled' | 'completed' | 'cancelled'
    color: string
    created_at: string
}

export interface CalendarEvent {
    id: number
    type: 'appointment' | 'reminder'
    title: string
    description?: string
    location?: string
    start: string
    end: string
    priority: string
    status: string
    color: string
}

interface UseAppointmentsOptions {
    status?: 'scheduled' | 'completed' | 'cancelled'
    limit?: number
}

export function useAppointments(options: UseAppointmentsOptions = {}) {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { status = 'scheduled', limit = 50 } = options

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            let query = supabase
                .from('saas_appointments')
                .select('*')
                .order('start_at', { ascending: true })
                .limit(limit)

            if (status) {
                query = query.eq('status', status)
            }

            const { data, error: queryError } = await query

            if (queryError) {
                setError('Erro ao carregar compromissos')
                console.error(queryError)
            } else {
                setAppointments(data || [])
            }
        } catch (err) {
            setError('Erro inesperado')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [status, limit])

    useEffect(() => {
        fetchAppointments()
    }, [fetchAppointments])

    const addAppointment = async (appointment: {
        title: string
        description?: string
        location?: string
        start_at: string
        end_at: string
        all_day?: boolean
        notify_before?: number
        priority?: 'baixa' | 'media' | 'alta'
    }) => {
        // Validação: Bloqueia compromissos no passado
        const startDate = new Date(appointment.start_at)
        const now = new Date()
        now.setMinutes(now.getMinutes() - 5)

        if (startDate < now) {
            throw new Error('Não é possível criar compromissos para datas no passado.')
        }

        // Validação: Fim deve ser após início
        const endDate = new Date(appointment.end_at)
        if (endDate <= startDate) {
            throw new Error('O horário de término deve ser após o início.')
        }

        const supabase = createClient()

        // Busca o client_id do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            throw new Error('Usuário não autenticado.')
        }

        const { data: clientData } = await supabase
            .from('saas_clients')
            .select('id')
            .eq('auth_user_id', user.id)
            .single()

        if (!clientData?.id) {
            throw new Error('Cliente não encontrado.')
        }

        // Verifica conflitos com outros compromissos
        const { data: conflicts } = await supabase
            .from('saas_appointments')
            .select('id, title, start_at, end_at')
            .eq('status', 'scheduled')
            .eq('client_id', clientData.id)
            .lt('start_at', appointment.end_at)
            .gt('end_at', appointment.start_at)

        if (conflicts && conflicts.length > 0) {
            throw new Error(`Já existe um compromisso nesse horário: "${conflicts[0].title}"`)
        }

        const { data, error } = await supabase
            .from('saas_appointments')
            .insert({
                ...appointment,
                client_id: clientData.id,
                status: 'scheduled',
                priority: appointment.priority || 'media',
                notify_before: appointment.notify_before || 30,
                color: appointment.priority === 'alta' ? '#EF4444' : '#3B82F6'
            })
            .select()
            .single()

        if (!error && data) {
            await fetchAppointments()
            return data
        }

        throw error
    }

    const updateAppointment = async (id: number, updates: Partial<Appointment>) => {
        // Validação: Bloqueia edição para datas no passado
        if (updates.start_at) {
            const startDate = new Date(updates.start_at)
            const now = new Date()
            now.setMinutes(now.getMinutes() - 5)

            if (startDate < now) {
                throw new Error('Não é possível alterar para uma data no passado.')
            }
        }

        const supabase = createClient()

        const { error } = await supabase
            .from('saas_appointments')
            .update(updates)
            .eq('id', id)

        if (!error) {
            await fetchAppointments()
        }

        return !error
    }

    const completeAppointment = async (id: number) => {
        return updateAppointment(id, {
            status: 'completed',
            completed_at: new Date().toISOString()
        } as any)
    }

    const cancelAppointment = async (id: number) => {
        return updateAppointment(id, {
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
        } as any)
    }

    const deleteAppointment = async (id: number) => {
        const supabase = createClient()

        const { error } = await supabase
            .from('saas_appointments')
            .delete()
            .eq('id', id)

        if (!error) {
            await fetchAppointments()
        }

        return !error
    }

    // Separar por período
    const today = appointments.filter(a => {
        const date = new Date(a.start_at)
        const now = new Date()
        return date.toDateString() === now.toDateString()
    })

    const upcoming = appointments.filter(a => {
        const date = new Date(a.start_at)
        const now = new Date()
        return date > now && date.toDateString() !== now.toDateString()
    })

    return {
        appointments,
        today,
        upcoming,
        loading,
        error,
        refetch: fetchAppointments,
        addAppointment,
        updateAppointment,
        completeAppointment,
        cancelAppointment,
        deleteAppointment
    }
}

// Hook para buscar eventos do calendário (compromissos + lembretes)
export function useCalendarEvents(year: number, month: number) {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true)
            const supabase = createClient()

            const startDate = new Date(year, month - 1, 1)
            const endDate = new Date(year, month, 0)

            // Busca compromissos
            const { data: appointments, error: appError } = await supabase
                .from('saas_appointments')
                .select('*')
                .gte('start_at', startDate.toISOString())
                .lte('start_at', endDate.toISOString())
                .order('start_at')

            // Busca lembretes
            const { data: reminders, error: remError } = await supabase
                .from('saas_reminders')
                .select('*')
                .gte('remind_at', startDate.toISOString())
                .lte('remind_at', endDate.toISOString())
                .order('remind_at')

            if (appError || remError) {
                setError('Erro ao carregar eventos')
                console.error(appError || remError)
                return
            }

            const calendarEvents: CalendarEvent[] = [
                // Mapeia compromissos
                ...(appointments || []).map(a => ({
                    id: a.id,
                    type: 'appointment' as const,
                    title: a.title,
                    description: a.description,
                    location: a.location,
                    start: a.start_at,
                    end: a.end_at,
                    priority: a.priority,
                    status: a.status,
                    color: a.priority === 'alta' ? '#EF4444' : '#3B82F6'
                })),
                // Mapeia lembretes
                ...(reminders || []).map(r => ({
                    id: r.id,
                    type: 'reminder' as const,
                    title: r.title,
                    description: r.description,
                    location: undefined,
                    start: r.remind_at,
                    end: r.remind_at,
                    priority: r.priority,
                    status: r.status,
                    color: '#F59E0B'
                }))
            ]

            setEvents(calendarEvents.sort((a, b) =>
                new Date(a.start).getTime() - new Date(b.start).getTime()
            ))
        } catch (err) {
            setError('Erro inesperado')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [year, month])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    // Agrupa eventos por dia
    const eventsByDay = events.reduce((acc, event) => {
        const day = new Date(event.start).getDate()
        if (!acc[day]) acc[day] = []
        acc[day].push(event)
        return acc
    }, {} as Record<number, CalendarEvent[]>)

    return {
        events,
        eventsByDay,
        loading,
        error,
        refetch: fetchEvents
    }
}
