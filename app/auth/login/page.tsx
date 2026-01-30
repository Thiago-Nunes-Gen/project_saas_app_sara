'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-sara-text mb-2">Bem-vindo de volta!</h1>
        <p className="text-sara-muted">Entre na sua conta para continuar</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div>
          <label htmlFor="password" className="label">Senha</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pr-12"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sara-light hover:text-sara-muted"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-sara-border text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-sara-muted">Lembrar de mim</span>
          </label>
          <Link href="/auth/recuperar-senha" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Esqueci a senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-sara-muted">
        Não tem uma conta?{' '}
        <Link href="/auth/cadastro" className="text-primary-500 hover:text-primary-600 font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
