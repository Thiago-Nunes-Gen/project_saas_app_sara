'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/nova-senha`,
      })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Ocorreu um erro inesperado')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-sara-text mb-2">Email enviado!</h1>
        <p className="text-sara-muted mb-6">
          Se existe uma conta com o email <strong>{email}</strong>,
          você receberá um link para redefinir sua senha.
        </p>
        <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-sara-muted hover:text-sara-text mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-sara-text mb-2">Esqueceu a senha?</h1>
        <p className="text-sara-muted">Digite seu email e enviaremos um link para redefinir sua senha.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="input"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </button>
      </form>
    </div>
  )
}
