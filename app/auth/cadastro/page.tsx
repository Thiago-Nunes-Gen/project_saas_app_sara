'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

export default function CadastroPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Validação de senha
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  }
  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Este email já está cadastrado')
        } else {
          setError(authError.message)
        }
        return
      }

      if (data.user) {
        // Busca os limites do plano FREE
        const { data: freePlan } = await supabase
          .from('saas_plans')
          .select('max_reminders, max_lists, max_list_items, max_transactions_month, max_rag_queries_month, max_documents, max_web_searches_month')
          .ilike('name', 'free')
          .single()

        // Valores padrão do plano FREE (caso a busca falhe)
        const defaultFreeLimits = {
          max_reminders: 10,
          max_lists: 3,
          max_list_items: 10,
          max_transactions_month: 15,
          max_rag_queries_month: 5,
          max_documents: 0,
          max_web_searches_month: 2
        }

        const planLimits = freePlan || defaultFreeLimits

        // Cria o registro em saas_clients com os limites corretos do plano FREE
        const { error: clientError } = await supabase
          .from('saas_clients')
          .insert({
            auth_user_id: data.user.id,
            email: email,
            name: name,
            status: 'pending_whatsapp',
            plan: 'free',
            max_reminders: planLimits.max_reminders,
            max_lists: planLimits.max_lists,
            max_list_items: planLimits.max_list_items,
            max_transactions_month: planLimits.max_transactions_month,
            max_rag_queries_month: planLimits.max_rag_queries_month,
            max_documents: planLimits.max_documents,
            max_web_searches_month: planLimits.max_web_searches_month,
            lgpd_accepted_at: new Date().toISOString()
          })

        if (clientError) {
          console.error('Erro ao criar cliente:', clientError)
          // Não bloqueia o fluxo, pois o importante é o usuário ter sido criado
        }

        setSuccess(true)
      }
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
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-sara-text mb-2">Quase lá!</h1>
        <p className="text-sara-muted mb-6">
          Enviamos um link de confirmação para <strong>{email}</strong>.
          Clique no link para ativar sua conta.
        </p>
        <p className="text-sm text-sara-light">
          Não recebeu o email? Verifique sua pasta de spam ou{' '}
          <button
            onClick={() => setSuccess(false)}
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            tente novamente
          </button>
        </p>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-sara-text mb-2">Criar sua conta</h1>
        <p className="text-sara-muted">
          Comece a usar a SARA gratuitamente
        </p>
      </div>

      <form onSubmit={handleSignUp} className="space-y-5">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="label">Nome completo</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="input"
            required
            disabled={loading}
          />
        </div>

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

          {/* Password Requirements */}
          {password && (
            <div className="mt-3 space-y-1.5">
              <div className={`flex items-center gap-2 text-xs ${passwordChecks.length ? 'text-green-600' : 'text-sara-light'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.length ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {passwordChecks.length && <Check className="w-3 h-3" />}
                </div>
                Mínimo 8 caracteres
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordChecks.uppercase ? 'text-green-600' : 'text-sara-light'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.uppercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {passwordChecks.uppercase && <Check className="w-3 h-3" />}
                </div>
                Uma letra maiúscula
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordChecks.lowercase ? 'text-green-600' : 'text-sara-light'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.lowercase ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {passwordChecks.lowercase && <Check className="w-3 h-3" />}
                </div>
                Uma letra minúscula
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordChecks.number ? 'text-green-600' : 'text-sara-light'}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.number ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {passwordChecks.number && <Check className="w-3 h-3" />}
                </div>
                Um número
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirmar senha</label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className={`input ${confirmPassword && password !== confirmPassword ? 'input-error' : ''}`}
            required
            disabled={loading}
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 mt-0.5 rounded border-sara-border text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-sm text-sara-muted">
            Concordo com os{' '}
            <Link href="/termos" className="text-primary-500 hover:text-primary-600">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-primary-500 hover:text-primary-600">Política de Privacidade</Link>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid || password !== confirmPassword}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar conta'
          )}
        </button>
      </form>

      <p className="text-center mt-8 text-sm text-sara-muted">
        Já tem uma conta?{' '}
        <Link href="/auth/login" className="text-primary-500 hover:text-primary-600 font-medium">
          Fazer login
        </Link>
      </p>
    </div>
  )
}
