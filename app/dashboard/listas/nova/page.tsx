'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import { ArrowLeft, Plus, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function NovaListaPage() {
  const router = useRouter()
  const { client } = useClient()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState<string[]>([''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addItem = () => {
    setItems([...items, ''])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index] = value
    setItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const filteredItems = items.filter(item => item.trim() !== '')
    
    if (!title.trim()) {
      setError('Digite um título para a lista')
      setLoading(false)
      return
    }

    if (filteredItems.length === 0) {
      setError('Adicione pelo menos um item')
      setLoading(false)
      return
    }

    if (!client?.id) {
      setError('Erro: cliente não identificado')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Formato padrão WhatsApp (texto/feito/adicionado_em)
      const formattedItems = filteredItems.map((texto) => ({
        texto: texto.trim(),
        feito: false,
        adicionado_em: new Date().toISOString()
      }))

      const { error: insertError } = await supabase
        .from('saas_lists')
        .insert({
          client_id: client.id,
          title: title.trim(),
          items: formattedItems,
          is_archived: false
        })

      if (insertError) {
        console.error('Erro ao criar lista:', insertError)
        throw insertError
      }

      router.push('/dashboard/listas')
    } catch (err: any) {
      setError(err.message || 'Erro ao criar lista')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <Link href="/dashboard/listas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar para listas
      </Link>

      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Nova Lista</h1>

      <form onSubmit={handleSubmit} className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="title" className="label">Título da Lista</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Compras do mês"
            className="input"
            disabled={loading}
            spellCheck="true"
            lang="pt-BR"
          />
        </div>

        <div className="mb-6">
          <label className="label">Itens</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder={`Item ${index + 1}`}
                  className="input flex-1"
                  disabled={loading}
                  spellCheck="true"
                  lang="pt-BR"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-3 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar item
          </button>
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
              'Criar Lista'
            )}
          </button>
          <Link href="/dashboard/listas" className="btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
