'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, ArrowLeft, Check, Loader2, MessageCircle, AlertCircle } from 'lucide-react'

export default function ConfigurarWhatsAppPage() {
  const router = useRouter()
  const [ddd, setDdd] = useState('')
  const [numero, setNumero] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Formata o número enquanto digita
  const formatNumero = (value: string) => {
    // Remove tudo que não é número
    const cleaned = value.replace(/\D/g, '')

    // Limita a 9 dígitos
    const limited = cleaned.slice(0, 9)

    // Aplica máscara: 99999-9999
    if (limited.length > 5) {
      return `${limited.slice(0, 5)}-${limited.slice(5)}`
    }
    return limited
  }

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumero(formatNumero(e.target.value))
  }

  const handleDddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2)
    setDdd(cleaned)
  }

  // Valida se o número está completo
  const isValidNumber = ddd.length === 2 && numero.replace(/\D/g, '').length === 9

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isValidNumber) {
      setError('Por favor, preencha o número completo')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fullNumber = `55${ddd}${numero.replace(/\D/g, '')}`

      const response = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsapp_number: fullNumber }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao conectar WhatsApp')
        return
      }

      setWhatsappNumber(fullNumber)
      setSuccess(true)
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            WhatsApp Conectado!
          </h1>

          <p className="text-gray-600 mb-6">
            Seu número foi vinculado com sucesso. Agora você pode conversar com a SARA pelo WhatsApp!
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-2">Seu número conectado:</p>
            <p className="text-lg font-semibold text-gray-900">
              +{whatsappNumber.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4')}
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="https://wa.me/5516992706593?text=Ol%C3%A1%20SARA!"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Abrir WhatsApp
            </a>

            <Link
              href="/dashboard"
              className="block w-full py-3 text-center text-gray-600 hover:text-gray-900 font-medium"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurar WhatsApp</h1>
          <p className="text-gray-500">Conecte seu número para usar a SARA</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Por que conectar o WhatsApp?
              </h3>
              <p className="text-sm text-blue-700">
                Com o WhatsApp conectado, você pode conversar com a SARA a qualquer momento,
                criar lembretes, registrar gastos, fazer anotações e muito mais - tudo pelo chat!
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Seu número de WhatsApp</label>
              <div className="flex gap-3">
                {/* País (fixo Brasil) */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                  <span className="text-lg">🇧🇷</span>
                  <span className="font-medium">+55</span>
                </div>

                {/* DDD */}
                <input
                  type="tel"
                  value={ddd}
                  onChange={handleDddChange}
                  placeholder="DDD"
                  className="input w-20 text-center"
                  maxLength={2}
                  disabled={loading}
                />

                {/* Número */}
                <input
                  type="tel"
                  value={numero}
                  onChange={handleNumeroChange}
                  placeholder="99999-9999"
                  className="input flex-1"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Digite seu número com DDD, sem o zero inicial
              </p>
            </div>

            {/* Preview */}
            {ddd && numero && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Número que será conectado:</p>
                <p className="text-lg font-medium text-gray-900">
                  +55 ({ddd}) {numero}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValidNumber}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5" />
                  Conectar WhatsApp
                </>
              )}
            </button>
          </form>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Após conectar, envie uma mensagem para a SARA pelo WhatsApp para começar a usar.
        </p>
      </div>
    </div>
  )
}
