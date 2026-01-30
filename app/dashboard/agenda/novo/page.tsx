'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppointments } from '@/hooks/useAppointments'
import { useClient } from '@/hooks/useClient'
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, Bell } from 'lucide-react'
import Link from 'next/link'

export default function NovoCompromissoPage() {
    const router = useRouter()
    const { client } = useClient()
    const { addAppointment } = useAppointments()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [location, setLocation] = useState('')
    const [date, setDate] = useState('')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('10:00')
    const [priority, setPriority] = useState<'baixa' | 'media' | 'alta'>('media')
    const [notifyBefore, setNotifyBefore] = useState(30)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Define data de hoje e horário atual + 5 minutos como padrão
    useEffect(() => {
        const now = new Date()
        setDate(now.toISOString().split('T')[0])

        // Horário de início: próxima hora cheia
        const nextHour = new Date(now)
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0)
        const startH = nextHour.getHours().toString().padStart(2, '0')
        setStartTime(`${startH}:00`)

        // Horário de fim: 1 hora depois
        const endHour = new Date(nextHour)
        endHour.setHours(endHour.getHours() + 1)
        const endH = endHour.getHours().toString().padStart(2, '0')
        setEndTime(`${endH}:00`)
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
            const startAt = new Date(`${date}T${startTime}:00`)
            const endAt = new Date(`${date}T${endTime}:00`)

            await addAppointment({
                title: title.trim(),
                description: description.trim() || undefined,
                location: location.trim() || undefined,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                priority,
                notify_before: notifyBefore
            })

            router.push('/dashboard/agenda')
        } catch (err: any) {
            setError(err.message || 'Erro ao criar compromisso')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in max-w-2xl">
            <Link href="/dashboard/agenda" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
                <ArrowLeft className="w-4 h-4" />
                Voltar para agenda
            </Link>

            <h1 className="text-2xl font-semibold text-gray-900 mb-8">Novo Compromisso</h1>

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
                        className="input min-h-[80px] resize-none"
                        disabled={loading}
                    />
                </div>

                {/* Location */}
                <div className="mb-6">
                    <label htmlFor="location" className="label flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Local (opcional)
                    </label>
                    <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ex: Av. Paulista, 1000"
                        className="input"
                        disabled={loading}
                    />
                </div>

                {/* Date */}
                <div className="mb-6">
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

                {/* Time */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="startTime" className="label flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Início
                        </label>
                        <input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="input"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="endTime" className="label">Término</label>
                        <input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
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

                {/* Notify Before */}
                <div className="mb-6">
                    <label className="label flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificar antes
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {[15, 30, 60, 120].map(minutes => (
                            <button
                                key={minutes}
                                type="button"
                                onClick={() => setNotifyBefore(minutes)}
                                className={`p-2 rounded-lg border text-sm font-medium transition-all ${notifyBefore === minutes
                                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {minutes < 60 ? `${minutes} min` : `${minutes / 60}h`}
                            </button>
                        ))}
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
                            'Criar Compromisso'
                        )}
                    </button>
                    <Link href="/dashboard/agenda" className="btn-secondary">
                        Cancelar
                    </Link>
                </div>
            </form>
        </div>
    )
}
