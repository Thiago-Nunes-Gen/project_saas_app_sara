'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Star, Send, CheckCircle, MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FeedbackPage() {
    const router = useRouter()
    const [score, setScore] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async () => {
        if (score === null) return

        setSending(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            // Busca o client_id
            const { data: client } = await supabase
                .from('saas_clients')
                .select('id')
                .eq('auth_user_id', user?.id)
                .single()

            if (client) {
                await supabase.from('saas_feedback').insert({
                    client_id: client.id,
                    score,
                    comment: comment.trim() || null,
                    created_at: new Date().toISOString()
                })
            }

            setSent(true)
            setTimeout(() => router.push('/dashboard'), 2500)
        } catch (error) {
            console.error('Erro ao enviar feedback:', error)
        } finally {
            setSending(false)
        }
    }

    if (sent) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="card text-center py-16">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Obrigado pelo seu feedback!</h1>
                    <p className="text-gray-500">Sua opinião é muito importante para nós.</p>
                </div>
            </div>
        )
    }

    const getScoreLabel = (s: number) => {
        if (s <= 6) return { text: 'Precisamos melhorar', color: 'text-red-500' }
        if (s <= 8) return { text: 'Bom, mas pode melhorar', color: 'text-yellow-500' }
        return { text: 'Excelente!', color: 'text-green-500' }
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Como está sua experiência?</h1>
                <p className="text-gray-500">Avalie de 0 a 10 sua satisfação com a SARA</p>
            </div>

            <div className="card">
                {/* NPS Scale */}
                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-700 mb-4 text-center">
                        Qual a probabilidade de recomendar a SARA para um amigo?
                    </p>

                    <div className="flex justify-center gap-2 flex-wrap">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                                key={num}
                                onClick={() => setScore(num)}
                                className={`w-12 h-12 rounded-xl font-semibold text-lg transition-all duration-200 ${score === num
                                        ? num <= 6
                                            ? 'bg-red-500 text-white scale-110 shadow-lg'
                                            : num <= 8
                                                ? 'bg-yellow-500 text-white scale-110 shadow-lg'
                                                : 'bg-green-500 text-white scale-110 shadow-lg'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {num}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                        <span>Nada provável</span>
                        <span>Muito provável</span>
                    </div>

                    {score !== null && (
                        <p className={`text-center mt-4 font-medium ${getScoreLabel(score).color}`}>
                            {getScoreLabel(score).text}
                        </p>
                    )}
                </div>

                {/* Comment */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quer deixar algum comentário? (opcional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Conte-nos mais sobre sua experiência..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={score === null || sending}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <>
                            <div className="spinner w-5 h-5" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Enviar Feedback
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
