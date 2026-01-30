'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import { 
  Plus, 
  Search,
  Pin,
  Trash2,
  Archive,
  StickyNote,
  Smile
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Note {
  id: string
  title: string
  content: string | null
  color: string
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

const COLORS = [
  { name: 'Branco', value: '#FFFFFF' },
  { name: 'Amarelo', value: '#FEF3C7' },
  { name: 'Verde', value: '#D1FAE5' },
  { name: 'Azul', value: '#DBEAFE' },
  { name: 'Rosa', value: '#FCE7F3' },
  { name: 'Roxo', value: '#EDE9FE' },
]

const EMOJIS = [
  '📝', '✅', '⭐', '🎯', '💡', '🔥', '❤️', '💰',
  '📅', '🏠', '🚗', '✈️', '🎓', '💼', '🛒', '🎉',
  '⚠️', '❌', '✨', '👍', '👎', '🤔', '😀', '🎵',
  '📌', '🔖', '📋', '📊', '💻', '📱', '🔔', '⏰',
  '→', '←', '↑', '↓', '•', '◦', '▪', '▸'
]

export default function NotasPage() {
  const { client } = useClient()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showArchived, setShowArchived] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  useEffect(() => {
    if (client?.id) {
      fetchNotes()
    }
  }, [showArchived, client?.id])

  async function fetchNotes() {
    setLoading(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('saas_client_notes')
      .select('*')
      .eq('is_archived', showArchived)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setNotes(data)
    }
    setLoading(false)
  }

  async function createNote() {
    if (!client?.id) {
      alert('Erro: cliente não identificado')
      return
    }

    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('saas_client_notes')
      .insert({
        client_id: client.id,
        title: 'Nova nota',
        content: '',
        color: '#FFFFFF',
        is_pinned: false,
        is_archived: false
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar nota:', error)
      alert('Erro ao criar nota: ' + error.message)
      return
    }

    if (data) {
      setNotes([data, ...notes])
      setEditingNote(data)
    }
  }

  async function updateNote(note: Note) {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('saas_client_notes')
      .update({
        title: note.title,
        content: note.content,
        color: note.color,
        is_pinned: note.is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id)

    if (error) {
      console.error('Erro ao atualizar nota:', error)
      return
    }

    setNotes(notes.map(n => n.id === note.id ? note : n))
    setEditingNote(null)
  }

  async function togglePin(noteId: string) {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    const supabase = createClient()
    await supabase
      .from('saas_client_notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', noteId)

    fetchNotes()
  }

  async function archiveNote(noteId: string) {
    const supabase = createClient()
    await supabase
      .from('saas_client_notes')
      .update({ is_archived: true })
      .eq('id', noteId)
    
    fetchNotes()
  }

  async function deleteNote(noteId: string) {
    if (!confirm('Tem certeza que deseja excluir esta nota?')) return
    
    const supabase = createClient()
    await supabase
      .from('saas_client_notes')
      .delete()
      .eq('id', noteId)
    
    fetchNotes()
  }

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const otherNotes = filteredNotes.filter(n => !n.is_pinned)

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notas</h1>
          <p className="text-gray-500">{notes.length} {showArchived ? 'arquivadas' : 'notas'}</p>
        </div>
        <button onClick={createNote} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Nota
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
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

      {/* Notes Grid */}
      {loading ? (
        <div className="card flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <StickyNote className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma nota {showArchived ? 'arquivada' : 'encontrada'}
          </h3>
          <p className="text-gray-500 mb-6">
            {showArchived ? 'Notas arquivadas aparecerão aqui' : 'Crie sua primeira nota'}
          </p>
          {!showArchived && (
            <button onClick={createNote} className="btn-primary">
              Criar nota
            </button>
          )}
        </div>
      ) : (
        <>
          {pinnedNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 mb-4 flex items-center gap-2">
                <Pin className="w-4 h-4" />
                Fixadas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note}
                    onEdit={() => setEditingNote(note)}
                    onPin={() => togglePin(note.id)}
                    onArchive={() => archiveNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {otherNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-medium text-gray-500 mb-4">Outras</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard 
                    key={note.id} 
                    note={note}
                    onEdit={() => setEditingNote(note)}
                    onPin={() => togglePin(note.id)}
                    onArchive={() => archiveNote(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          onSave={updateNote}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  )
}

function NoteCard({ note, onEdit, onPin, onArchive, onDelete }: { 
  note: Note
  onEdit: () => void
  onPin: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  return (
    <div 
      className="rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group"
      style={{ backgroundColor: note.color }}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-1">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className={`p-1.5 hover:bg-white/50 rounded ${note.is_pinned ? 'text-blue-500' : 'text-gray-400'}`}
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {note.content && (
        <p className="text-sm text-gray-600 line-clamp-4 mb-3 whitespace-pre-wrap">{note.content}</p>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {format(parseISO(note.updated_at), "dd/MM/yyyy", { locale: ptBR })}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="p-1.5 hover:bg-white/50 rounded text-gray-400 hover:text-gray-600"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 hover:bg-white/50 rounded text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function EditNoteModal({ note, onSave, onClose }: { 
  note: Note
  onSave: (note: Note) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '')
  const [color, setColor] = useState(note.color)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [cursorTarget, setCursorTarget] = useState<'title' | 'content'>('content')
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  const handleSave = () => {
    onSave({ ...note, title, content, color })
  }

  const insertEmoji = (emoji: string) => {
    if (cursorTarget === 'title') {
      const input = titleRef.current
      if (input) {
        const start = input.selectionStart || title.length
        const newTitle = title.slice(0, start) + emoji + title.slice(start)
        setTitle(newTitle)
      }
    } else {
      const textarea = contentRef.current
      if (textarea) {
        const start = textarea.selectionStart || content.length
        const newContent = content.slice(0, start) + emoji + content.slice(start)
        setContent(newContent)
      }
    }
    setShowEmojiPicker(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl"
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setCursorTarget('title')}
              className="flex-1 text-xl font-medium text-gray-900 bg-transparent border-none focus:outline-none"
              placeholder="Título"
              spellCheck="true"
              lang="pt-BR"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-white/50 rounded-lg text-gray-500 hover:text-gray-700"
              title="Inserir emoji"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200 shadow-lg">
              <p className="text-xs text-gray-500 mb-2">Clique para inserir:</p>
              <div className="grid grid-cols-8 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setCursorTarget('content')}
            className="w-full h-48 text-gray-700 bg-transparent border-none focus:outline-none resize-none"
            placeholder="Escreva sua nota..."
            spellCheck="true"
            lang="pt-BR"
          />
        </div>
        
        <div className="border-t border-gray-200 p-4 flex items-center justify-between">
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c.value ? 'border-gray-400 scale-110' : 'border-gray-200'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary text-sm">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary text-sm">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
