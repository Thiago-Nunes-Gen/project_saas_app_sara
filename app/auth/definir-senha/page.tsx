'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

function DefinirSenhaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function validateToken() {
      const supabase = createClient()

      // Verifica se há sessão ativa (usuário veio do link mágico)
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setTokenValid(true)
        setUserEmail(session.user.email || '')

        // Verifica se o usuário já tem conta vinculada
        const { data: client } = await supabase
          .from('saas_clients')
          .select('id, auth_user_id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!client) {
          // Precisa vincular o auth_user_id ao cliente existente
          // Obtém client_id do parâmetro da URL (enviado pelo bot do WhatsApp)
          const clientIdParam = searchParams.get('client_id')

          let existingClient = null

          // Prioridade 1: Busca pelo client_id passado no link (mais confiável)
          if (clientIdParam) {
            const { data: clientById } = await supabase
              .from('saas_clients')
              .select('id, whatsapp_id')
              .eq('id', clientIdParam)
              .is('auth_user_id', null) // Apenas se ainda não vinculado
              .single()

            if (clientById) {
              existingClient = clientById
              console.log('[Portal] Vinculando por client_id:', clientIdParam)
            }
          }

          // Prioridade 2: Fallback - busca pelo email (compatibilidade)
          if (!existingClient && session.user.email) {
            const { data: clientByEmail } = await supabase
              .from('saas_clients')
              .select('id, whatsapp_id')
              .eq('email', session.user.email)
              .is('auth_user_id', null) // Apenas se ainda não vinculado
              .single()

            if (clientByEmail) {
              existingClient = clientByEmail
              console.log('[Portal] Vinculando por email:', session.user.email)
            }
          }

          if (existingClient) {
            // Vincula o auth_user_id ao cliente do WhatsApp
            const { error: updateError } = await supabase
              .from('saas_clients')
              .update({ auth_user_id: session.user.id })
              .eq('id', existingClient.id)

            if (updateError) {
              console.error('[Portal] Erro ao vincular conta:', updateError)
            } else {
              console.log('[Portal] WhatsApp vinculado com sucesso! whatsapp_id:', existingClient.whatsapp_id)
            }
          } else {
            console.warn('[Portal] Nenhum cliente encontrado para vincular. client_id:', clientIdParam, 'email:', session.user.email)
          }
        }
      } else {
        setTokenValid(false)
        setError('Link inválido ou expirado. Solicite um novo link pelo WhatsApp.')
      }

      setValidatingToken(false)
    }

    validateToken()
  }, [searchParams])

  const validatePassword = (pwd: string) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
    }
    return checks
  }

  const passwordChecks = validatePassword(password)
  const isPasswordValid = Object.values(passwordChecks).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos mínimos')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Atualiza a senha do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      setSuccess(true)

      // Redireciona para o dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Erro ao definir senha')
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-genesis-purple-dark/5 to-genesis-blue-light/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-500">Validando seu acesso...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-genesis-purple-dark/5 to-genesis-blue-light/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link Inválido</h1>
            <p className="text-gray-500 mb-6">
              Este link expirou ou já foi utilizado. Solicite um novo link de acesso pelo WhatsApp.
            </p>
            <a
              href="https://wa.me/5516992706593?text=Preciso de um novo link para acessar o portal"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              Solicitar novo link
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-genesis-purple-dark/5 to-genesis-blue-light/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Senha Definida!</h1>
            <p className="text-gray-500 mb-4">
              Sua conta está pronta. Redirecionando para o portal...
            </p>
            <div className="spinner w-6 h-6 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-genesis-purple-dark/5 to-genesis-blue-light/10 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo ao Portal SARA!</h1>
            <p className="text-gray-500 mt-2">Defina uma senha para acessar sua conta</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {userEmail && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Email:</strong> {userEmail}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="label">Nova Senha</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pr-10"
                    placeholder="Digite sua senha"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="mt-3 space-y-1">
                  <PasswordCheck check={passwordChecks.length} text="Mínimo 8 caracteres" />
                  <PasswordCheck check={passwordChecks.uppercase} text="Uma letra maiúscula" />
                  <PasswordCheck check={passwordChecks.lowercase} text="Uma letra minúscula" />
                  <PasswordCheck check={passwordChecks.number} text="Um número" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Confirmar Senha</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Confirme sua senha"
                  disabled={loading}
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || password !== confirmPassword}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Definir Senha e Acessar'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Precisa de ajuda?{' '}
            <a
              href="https://wa.me/5516992706593"
              target="_blank"
              rel="noopener noreferrer"
              className="text-genesis-blue hover:underline"
            >
              Fale com a SARA
            </a>
          </p>
        </div>
      </div>

      {/* Desenvolvido por Gênesis */}
      <div className="p-4 flex items-center justify-center gap-2 opacity-60">
        <span className="text-xs text-gray-500">Desenvolvido por</span>
        <img
          src="https://vkohkliecwxxruceocxo.supabase.co/storage/v1/object/public/Imagens%20Sara/logo_genesis.png"
          alt="Gênesis I.A."
          className="h-4 w-auto"
        />
      </div>
    </div>
  )
}

function PasswordCheck({ check, text }: { check: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${check ? 'text-green-600' : 'text-gray-400'}`}>
      {check ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
      )}
      {text}
    </div>
  )
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-genesis-purple-dark/5 to-genesis-blue-light/10 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    }>
      <DefinirSenhaContent />
    </Suspense>
  )
}
