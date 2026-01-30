'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import {
  Search,
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  Folder,
  ChevronDown,
  Trash2
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Document {
  id: string
  titulo: string | null
  conteudo: string | null
  categoria: string | null
  fonte: string | null
  file_type: string | null
  created_at: string
  updated_at: string
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('saas_documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setDocuments(data)
    }
    setLoading(false)
  }

  async function deleteDocument(id: string) {
    if (!confirm('Tem certeza que deseja excluir este documento?')) return

    const supabase = createClient()
    await supabase
      .from('saas_documents')
      .delete()
      .eq('id', id)

    fetchDocuments()
  }

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="w-6 h-6" />
    if (fileType.includes('image')) return <FileImage className="w-6 h-6" />
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="w-6 h-6" />
    return <File className="w-6 h-6" />
  }

  // Get unique categories (filtrando nulls)
  const categories = Array.from(new Set(documents.map(d => d.categoria).filter((c): c is string => c !== null && c !== '')))

  const filteredDocuments = documents.filter(doc => {
    const titulo = doc.titulo || ''
    const conteudo = doc.conteudo || ''
    const matchesSearch = titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conteudo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || doc.categoria === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
          <p className="text-gray-500">{documents.length} documentos enviados</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-100 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Envio de documentos via WhatsApp</h3>
            <p className="text-sm text-blue-700">
              Para enviar novos documentos, mande o arquivo pelo WhatsApp para a SARA.
              Ela irá processar e armazenar automaticamente para consulta.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="input appearance-none pr-10 min-w-[180px]"
            >
              <option value="">Todas categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Documents */}
      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Folder className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum documento encontrado
          </h3>
          <p className="text-gray-500">
            Envie documentos pelo WhatsApp para a SARA
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Documento</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoria</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fonte</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        {getFileIcon(doc.file_type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.titulo || 'Sem título'}</p>
                        <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                          {doc.conteudo ? `${doc.conteudo.substring(0, 100)}...` : 'Sem conteúdo'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {doc.categoria ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {doc.categoria}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">{doc.fonte || 'WhatsApp'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-500">
                      {format(parseISO(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
