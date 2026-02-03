'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Client } from '@/types'

export function useClient() {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClient() {
      try {
        const supabase = createClient()
        
        // Pega o usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setError('Usuário não autenticado')
          setLoading(false)
          return
        }

        // Busca dados do cliente vinculado
        // Usa maybeSingle() pois pode não existir registro (usuário novo)
        const { data, error: clientError } = await supabase
          .from('saas_clients')
          .select('*')
          .eq('auth_user_id', user.id)
          .maybeSingle()

        if (clientError) {
          // Erro real de banco de dados
          setError('Erro ao carregar dados do cliente')
          console.error('[useClient] Erro:', clientError)
        } else {
          // data será null se não existir registro (normal para usuário novo)
          // data terá o objeto se existir
          setClient(data)
          console.log('[useClient] Client:', data)
        }
      } catch (err) {
        setError('Erro inesperado')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [])

  const refetch = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('saas_clients')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle()

      setClient(data) // data será null se não existir
    }
    setLoading(false)
  }

  return { client, loading, error, refetch }
}
