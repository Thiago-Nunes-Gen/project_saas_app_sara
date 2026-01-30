'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import { ArrowLeft, Loader2, Calendar, Clock, Bell } from 'lucide-react'
import Link from 'next/link'

export default function NovoLembretePage() {
  const router = useRouter()
  const { client } = useClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media')
  const [type, setType] = useState<'unico' | 'diario' | 'semanal' | 'mensal'>('unico')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Define data de hoje e horário atual + 5 minutos como padrão
  useEffect(() => {
    const now = new Date()

    // Data de hoje
    setDate(now.toISOString().split('T')[0])

    // Horário atual + 5 minutos
    now.setMinutes(now.getMinutes() + 5)
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    setTime(`${hours}:${minutes}`)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title.trim()) {
      setError('Digite um título')
      setLoading(false)
      return
    }

    if (!date) {
      setError('Selecione uma data')
      setLoading(false)
      return
    }

    if (!client?.id) {
      setError('Erro: cliente não identificado. Tente recarregar a página.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const remindAt = new Date(`${date}T${time}:00`)

      // ✅ Validação: Bloqueia lembretes no passado (margem de 5 min)
      const now = new Date()
      now.setMinutes(now.getMinutes() - 5)

      if (remindAt < now) {
        setError('Não é possível criar lembretes para datas no passado. Por favor, escolha uma data/hora futura.')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('saas_reminders')
        .insert({
          client_id: client.id,
          title: title.trim(),
          description: description.trim() || null,
          remind_at: remindAt.toISOString(),
          priority,
          type,
          status: 'pending'
        })

      if (insertError) {
        console.error('Erro ao criar lembrete:', insertError)
        throw insertError
      }

      router.push('/dashboard/lembretes')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar lembrete')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <Link href="/dashboard/lembretes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar para lembretes
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Novo Lembrete</h1>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="label">Título</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Reunião com cliente"
            className="input"
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="label">Descrição (opcional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Adicione mais detalhes..."
            className="input min-h-[100px] resize-none"
            disabled={loading}
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="date" className="label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="time" className="label flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="input"
              disabled={loading}
            />
          </div>
        </div>

        {/* Priority */}
        <div className="mb-6">
          <label className="label">Prioridade</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPriority('baixa')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${priority === 'baixa'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Baixa
            </button>
            <button
              type="button"
              onClick={() => setPriority('media')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${priority === 'media'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Média
            </button>
            <button
              type="button"
              onClick={() => setPriority('alta')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${priority === 'alta'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Alta
            </button>
          </div>
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="label flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Repetição
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setType('unico')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${type === 'unico'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Único
            </button>
            <button
              type="button"
              onClick={() => setType('diario')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${type === 'diario'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Diário
            </button>
            <button
              type="button"
              onClick={() => setType('semanal')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${type === 'semanal'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setType('mensal')}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${type === 'mensal'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              Mensal
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Lembrete'
            )}
          </button>
          <Link href="/dashboard/lembretes" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
