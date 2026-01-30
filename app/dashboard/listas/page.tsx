'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { 
  Plus, 
  Search,
  CheckSquare,
  Square,
  Trash2,
  Archive,
  ListTodo
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

// Interface padrão WhatsApp
interface ListItem {
  texto: string
  feito: boolean
  adicionado_em: string
}

interface List {
  id: string
  title: string
  items: ListItem[]
  is_archived: boolean
  created_at: string
  updated_at: string
}

export default function ListasPage() {
  const [lists, setLists] = useState<List[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLists()
  }, [showArchived])

  async function fetchLists() {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('saas_lists')
      .select('*')
      .eq('is_archived', showArchived)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      // Normaliza todos os itens para formato WhatsApp
      const normalizedLists = data.map(list => ({
        ...list,
        items: normalizeItems(list.items)
      }))
      setLists(normalizedLists)
    }
    setLoading(false)
  }

  // Converte itens para formato padrão WhatsApp
  function normalizeItems(items: any[]): ListItem[] {
    if (!Array.isArray(items)) return []
    
    return items.map(item => ({
      texto: item.texto || item.text || '',
      feito: item.feito ?? item.checked ?? false,
      adicionado_em: item.adicionado_em || item.created_at || new Date().toISOString()
    }))
  }

  async function toggleItem(listId: string, itemIndex: number) {
    const list = lists.find(l => l.id === listId)
    if (!list || !list.items) return

    // Atualiza o item no formato WhatsApp
    const updatedItems = list.items.map((item, idx) => {
      if (idx !== itemIndex) return item
      return { ...item, feito: !item.feito }
    })

    // Atualiza localmente primeiro (resposta instantânea)
    setLists(lists.map(l => 
      l.id === listId ? { ...l, items: updatedItems } : l
    ))

    // Depois salva no banco
    const supabase = createClient()
    await supabase
      .from('saas_lists')
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq('id', listId)
  }

  async function archiveList(listId: string) {
    const supabase = createClient()
    await supabase
      .from('saas_lists')
      .update({ is_archived: true })
      .eq('id', listId)
    
    fetchLists()
  }

  async function deleteList(listId: string) {
    if (!confirm('Tem certeza que deseja excluir esta lista?')) return
    
    const supabase = createClient()
    await supabase
      .from('saas_lists')
      .delete()
      .eq('id', listId)
    
    fetchLists()
  }

  const filteredLists = lists.filter(list =>
    list.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProgress = (items: ListItem[]) => {
    if (!items || items.length === 0) return 0
    const checked = items.filter(item => item.feito).length
    return Math.round((checked / items.length) * 100)
  }

  const getCheckedCount = (items: ListItem[]) => {
    if (!items) return 0
    return items.filter(item => item.feito).length
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Listas</h1>
          <p className="text-gray-500">{filteredLists.length} {showArchived ? 'arquivadas' : 'ativas'}</p>
        </div>
        <Link href="/dashboard/listas/nova" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Lista
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar listas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
            spellCheck="true"
            lang="pt-BR"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowArchived(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !showArchived 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Ativas
          </button>
          <button 
            onClick={() => setShowArchived(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showArchived 
                ? 'bg-gray-500 text-white' 
                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            Arquivadas
          </button>
        </div>
      </div>

      {/* Lists as Cards */}
      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredLists.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma lista {showArchived ? 'arquivada' : 'encontrada'}
          </h3>
          <p className="text-gray-500 mb-6">
            {showArchived ? 'Listas arquivadas aparecerão aqui' : 'Crie sua primeira lista para organizar suas tarefas'}
          </p>
          {!showArchived && (
            <Link href="/dashboard/listas/nova" className="btn-primary">
              Criar lista
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLists.map((list) => {
            const items = list.items || []
            const checkedCount = getCheckedCount(items)
            const totalCount = items.length
            const progress = getProgress(items)
            
            return (
              <div key={list.id} className="card hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{list.title}</h3>
                    <p className="text-sm text-gray-500">
                      {checkedCount} de {totalCount} concluídos
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!showArchived && (
                      <button 
                        onClick={() => archiveList(list.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                        title="Arquivar"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteList(list.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Items */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">Lista vazia</p>
                  ) : (
                    items.map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => toggleItem(list.id, index)}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
                      >
                        {item.feito ? (
                          <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                        )}
                        <span className={`text-sm flex-1 ${
                          item.feito ? 'text-gray-400 line-through' : 'text-gray-700'
                        }`}>
                          {item.texto}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Atualizada em {format(parseISO(list.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
