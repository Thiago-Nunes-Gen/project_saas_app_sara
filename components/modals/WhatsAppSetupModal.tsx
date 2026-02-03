'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, X, Loader2, MessageCircle, Check } from 'lucide-react'

interface WhatsAppSetupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function WhatsAppSetupModal({ isOpen, onClose, onSuccess }: WhatsAppSetupModalProps) {
  const router = useRouter()
  const [ddd, setDdd] = useState('')
  const [numero, setNumero] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  if (!isOpen) return null

  // Formata o número enquanto digita
  const formatNumero = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const limited = cleaned.slice(0, 9)
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
      onSuccess?.()
    } catch (err) {
      setError('Erro ao conectar. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (success) {
      router.refresh()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 animate-fade-in-up">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {success ? (
            // Success state
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                WhatsApp Conectado!
              </h2>

              <p className="text-gray-600 mb-6">
                Agora você pode conversar com a SARA pelo WhatsApp.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Número conectado:</p>
                <p className="text-lg font-semibold text-gray-900">
                  +{whatsappNumber.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 ($2) $3-$4')}
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://wa.me/5516997515087?text=Ol%C3%A1%20SARA!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Abrir WhatsApp
                </a>

                <button
                  onClick={handleClose}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            // Form state
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-7 h-7 text-green-600" />
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Configure seu WhatsApp
                </h2>

                <p className="text-gray-600 text-sm">
                  Conecte seu número para usar a SARA pelo WhatsApp e aproveitar todos os recursos.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seu número de WhatsApp
                  </label>
                  <div className="flex gap-2">
                    {/* País */}
                    <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-100 rounded-lg text-gray-600 text-sm">
                      <span>🇧🇷</span>
                      <span className="font-medium">+55</span>
                    </div>

                    {/* DDD */}
                    <input
                      type="tel"
                      value={ddd}
                      onChange={handleDddChange}
                      placeholder="DDD"
                      className="input w-16 text-center text-sm"
                      maxLength={2}
                      disabled={loading}
                    />

                    {/* Número */}
                    <input
                      type="tel"
                      value={numero}
                      onChange={handleNumeroChange}
                      placeholder="99999-9999"
                      className="input flex-1 text-sm"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Preview */}
                {ddd && numero && (
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-1">Número:</p>
                    <p className="font-medium text-gray-900">
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

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Configurar depois
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
