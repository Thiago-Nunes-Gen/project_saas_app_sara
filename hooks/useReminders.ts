'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Reminder } from '@/types'

interface UseRemindersOptions {
  status?: 'pending' | 'sent' | 'completed' | 'cancelled'
  limit?: number
}

export function useReminders(options: UseRemindersOptions = {}) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { status = 'pending', limit = 50 } = options

  useEffect(() => {
    fetchReminders()
  }, [status, limit])

  async function fetchReminders() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('saas_reminders')
        .select('*')
        .order('remind_at', { ascending: true })
        .limit(limit)

      if (status) {
        if (status === 'completed') {
          // Inclui 'sent' (enviado/avisado) na aba de concluídos para histórico
          query = query.in('status', ['completed', 'sent', 'avisado'])
        } else if (status === 'cancelled') {
          // Preveni variacoes de escrita
          query = query.in('status', ['cancelled', 'cancelado'])
        } else {
          query = query.eq('status', status)
        }
      }

      const { data, error: queryError } = await query

      if (queryError) {
        setError('Erro ao carregar lembretes')
        console.error(queryError)
      } else {
        setReminders(data || [])
      }
    } catch (err) {
      setError('Erro inesperado')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const addReminder = async (reminder: {
    title: string
    description?: string
    remind_at: string
    priority?: 'baixa' | 'media' | 'alta'
    type?: 'unico' | 'diario' | 'semanal' | 'mensal'
  }) => {
    // ✅ Validação: Bloqueia lembretes no passado (margem de 5 min)
    const reminderDate = new Date(reminder.remind_at)
    const now = new Date()
    now.setMinutes(now.getMinutes() - 5) // 5 minutos de margem

    if (reminderDate < now) {
      throw new Error('Não é possível criar lembretes para datas no passado. Por favor, escolha uma data/hora futura.')
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from('saas_reminders')
      .insert({
        ...reminder,
        status: 'pending',
        priority: reminder.priority || 'media',
        type: reminder.type || 'unico'
      })
      .select()
      .single()

    if (!error && data) {
      await fetchReminders()
      return data
    }

    throw error
  }

  const updateReminder = async (id: number, updates: Partial<Reminder>) => {
    // ✅ Validação: Bloqueia edição para datas no passado
    if (updates.remind_at) {
      const reminderDate = new Date(updates.remind_at)
      const now = new Date()
      now.setMinutes(now.getMinutes() - 5) // 5 minutos de margem

      if (reminderDate < now) {
        throw new Error('Não é possível alterar para uma data no passado. Por favor, escolha uma data/hora futura.')
      }
    }

    const supabase = createClient()

    const { error } = await supabase
      .from('saas_reminders')
      .update(updates)
      .eq('id', id)

    if (!error) {
      await fetchReminders()
    }

    return !error
  }

  const completeReminder = async (id: number) => {
    return updateReminder(id, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  const cancelReminder = async (id: number) => {
    return updateReminder(id, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
  }

  const deleteReminder = async (id: number) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('saas_reminders')
      .delete()
      .eq('id', id)

    if (!error) {
      await fetchReminders()
    }

    return !error
  }

  // Separar por urgência
  const overdue = reminders.filter(r => new Date(r.remind_at) < new Date())
  const today = reminders.filter(r => {
    const reminderDate = new Date(r.remind_at)
    const now = new Date()
    return reminderDate >= now &&
      reminderDate.toDateString() === now.toDateString()
  })
  const upcoming = reminders.filter(r => {
    const reminderDate = new Date(r.remind_at)
    const now = new Date()
    return reminderDate > now &&
      reminderDate.toDateString() !== now.toDateString()
  })

  return {
    reminders,
    overdue,
    today,
    upcoming,
    loading,
    error,
    refetch: fetchReminders,
    addReminder,
    updateReminder,
    completeReminder,
    cancelReminder,
    deleteReminder
  }
}
