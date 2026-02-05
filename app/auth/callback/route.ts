import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se for fluxo de recovery, redireciona para página de nova senha
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/auth/nova-senha`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se houver erro no fluxo de recovery, mostra mensagem apropriada
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/nova-senha?error=link_expired`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`)
}
