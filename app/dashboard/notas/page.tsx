'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useClient } from '@/hooks/useClient'
import {
  Search,
  StickyNote,
  Smile,
  Palette,
  Type,
  Mic,
  X
} from 'lucide-react'
import { NoteInput } from './_components/NoteInput'
import { NoteCard } from './_components/NoteCard'
import { NOTE_COLORS, NOTE_FONTS, NOTE_SIZES } from './_components/constants'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'

interface Note {
  id: string
  title: string
  content: string | null
  color: string
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
  font_family?: string
  font_size?: string
}

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

  function sortNotes(notesToSort: Note[]) {
    return [...notesToSort].sort((a, b) => {
      if (a.is_pinned === b.is_pinned) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
      return a.is_pinned ? -1 : 1
    })
  }

  async function handleCreateNote(noteData: any) {
    if (!client?.id) return

    const supabase = createClient()

    // Optimistic UI update could go here, but for simplicity we wait for DB
    const { data, error } = await supabase
      .from('saas_client_notes')
      .insert({
        client_id: client.id,
        title: noteData.title,
        content: noteData.content,
        color: noteData.color,
        is_pinned: noteData.is_pinned,
        is_archived: false,
        font_family: noteData.font_family,
        font_size: noteData.font_size
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar nota:', error)
      alert('Erro ao criar nota. Verifique se executou o script de migração para novas colunas.')
      return
    }

    if (data) {
      setNotes(prev => sortNotes([data, ...prev]))
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
        font_family: note.font_family,
        font_size: note.font_size,
        updated_at: new Date().toISOString()
      })
      .eq('id', note.id)

    if (error) {
      console.error('Erro ao atualizar nota:', error)
      return
    }

    setNotes(prev => sortNotes(prev.map(n => n.id === note.id ? note : n)))
    setEditingNote(null)
  }

  async function togglePin(noteId: string) {
    const note = notes.find(n => n.id === noteId)
    if (!note) return

    // Optimistic toggle - DO NOT update date to keep original position
    const updatedNote = { ...note, is_pinned: !note.is_pinned }

    setNotes(prev => sortNotes(prev.map(n => n.id === noteId ? updatedNote : n)))

    const supabase = createClient()
    await supabase.from('saas_client_notes').update({ is_pinned: updatedNote.is_pinned }).eq('id', noteId)
    // No fetchNotes() needed as we handled it optimistically and sorted
  }

  async function archiveNote(noteId: string) {
    const supabase = createClient()
    // Optimistic
    setNotes(prev => prev.filter(n => n.id !== noteId)) // Remove from current view (Active)

    await supabase.from('saas_client_notes').update({ is_archived: true }).eq('id', noteId)
    // No fetch needed if optimistic removal works for the view
    // If viewing archived, we might want to refresh, but usually archive moves items OUT of active view.
    fetchNotes()
  }

  async function restoreNote(noteId: string) {
    const supabase = createClient()
    setNotes(prev => prev.filter(n => n.id !== noteId)) // Remove from current view (Archived)

    await supabase.from('saas_client_notes').update({ is_archived: false }).eq('id', noteId)
    fetchNotes()
  }

  async function deleteNote(noteId: string) {
    if (!confirm('Tem certeza que deseja deletar permanentemente? Esta ação não pode ser desfeita.')) return

    setNotes(prev => prev.filter(n => n.id !== noteId)) // Optimistic remove

    const supabase = createClient()
    await supabase.from('saas_client_notes').delete().eq('id', noteId)
    // fetchNotes() not strictly needed if optimistic works
  }

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20">
      {/* Header & Quick Add */}
      <div className="flex flex-col items-center mb-8 gap-6">
        <h1 className="text-2xl font-semibold text-gray-900 self-start">
          {showArchived ? 'Arquivo' : 'Notas'}
        </h1>

        {!showArchived && (
          <div className="w-full max-w-2xl z-20">
            <NoteInput onSave={handleCreateNote} />
          </div>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between sticky top-4 z-10 bg-sara-bg/95 backdrop-blur-sm py-2">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar suas ideias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border-none shadow-sm bg-white focus:ring-2 focus:ring-primary-500 transition-shadow"
          />
        </div>

        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
          <button
            onClick={() => setShowArchived(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!showArchived
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Ativas
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${showArchived
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            Arquivadas
          </button>
        </div>
      </div>

      {/* Notes Masonry Layout */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <StickyNote className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            {showArchived ? 'Nada no arquivo' : 'Nenhuma nota encontrada'}
          </h3>
          <p className="text-gray-500 mt-2">
            {showArchived ? 'Notas arquivadas aparecerão aqui.' : 'Suas ideias incríveis vão aparecer aqui.'}
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 mx-auto">
          {filteredNotes.map((note) => (
            <div key={note.id} className="break-inside-avoid">
              <NoteCard
                note={note}
                onEdit={() => !note.is_archived && setEditingNote(note)}
                onPin={() => togglePin(note.id)}
                onArchive={() => archiveNote(note.id)}
                onRestore={() => restoreNote(note.id)}
                onDelete={() => deleteNote(note.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Improved Edit Modal */}
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

function EditNoteModal({ note, onSave, onClose }: {
  note: Note
  onSave: (note: Note) => void
  onClose: () => void
}) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content || '')
  // Defaults if missing
  const [color, setColor] = useState(note.color)
  const [fontFamily, setFontFamily] = useState(note.font_family || 'font-sans')
  const [fontSize, setFontSize] = useState(note.font_size || 'text-base')

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const MAX_CHARS = 3000

  // Voice Hook for modal
  const {
    isListening,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onResult: (text) => {
      setContent(prev => {
        const newText = prev + (prev ? ' ' : '') + text
        return newText.length <= MAX_CHARS ? newText : prev
      })
    }
  })

  const closeMenus = () => {
    setShowFontPicker(false)
    setShowColorPicker(false)
    setShowEmojiPicker(false)
  }

  const handleSave = () => {
    onSave({ ...note, title, content, color, font_family: fontFamily, font_size: fontSize })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= MAX_CHARS) {
      setContent(text)
    }
  }

  const insertEmoji = (emoji: string) => {
    // Simple append to title (if focused) or content
    // Since we don't track focus rigorously here, we'll append to cursor if possible or end of content
    if (document.activeElement === titleRef.current) {
      if (title.length + emoji.length <= 100) setTitle(prev => prev + emoji)
    } else {
      if (content.length + emoji.length <= MAX_CHARS) setContent(prev => prev + emoji)
    }
    setShowEmojiPicker(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col transition-all bg-white"
        onClick={(e) => { e.stopPropagation(); closeMenus(); }}
      >
        {/* Top Toolbar ("Word-like") */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50/95 backdrop-blur shrink-0">
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Fonts */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowFontPicker(!showFontPicker); setShowColorPicker(false); setShowEmojiPicker(false); }}
                className="px-3 py-2 hover:bg-gray-200 rounded-lg text-gray-700 flex items-center gap-2 text-sm font-medium transition-colors border border-transparent hover:border-gray-200"
                title="Fonte e Tamanho"
              >
                <Type className="w-4 h-4" />
                <span className="hidden sm:inline">Texto</span>
              </button>
              {showFontPicker && (
                <div
                  className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl z-50 w-64 flex flex-col gap-2 border border-gray-100 animate-fade-in-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="grid gap-1">
                    {NOTE_FONTS.map(f => (
                      <button
                        key={f.value}
                        onClick={() => { setFontFamily(f.value); setShowFontPicker(false); }}
                        className={`text-left text-sm p-2 rounded hover:bg-gray-100 ${f.value} ${fontFamily === f.value ? 'text-blue-600 bg-blue-50 font-medium' : ''}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                  <div className="border-t pt-2 flex gap-1">
                    {NOTE_SIZES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => { setFontSize(s.value); setShowFontPicker(false); }}
                        className={`flex-1 text-center text-xs p-2 border rounded hover:bg-gray-50 ${fontSize === s.value ? 'border-blue-500 text-blue-600 font-medium' : 'border-gray-200'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />

            {/* Colors */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowColorPicker(!showColorPicker); setShowFontPicker(false); setShowEmojiPicker(false); }}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors border border-transparent hover:border-gray-200"
                title="Cor da nota"
              >
                <Palette className="w-4 h-4" />
              </button>
              {showColorPicker && (
                <div
                  className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl z-50 w-64 flex flex-wrap gap-1.5 border border-gray-100 animate-fade-in-up"
                  onClick={(e) => e.stopPropagation()}
                >
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => { setColor(c.value); setShowColorPicker(false); }}
                      className={`w-7 h-7 rounded-full border ${c.border} hover:scale-110 shadow-sm transition-transform`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Emoji */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); setShowColorPicker(false); setShowFontPicker(false); }}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors border border-transparent hover:border-gray-200"
                title="Inserir Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojiPicker && (
                <div
                  className="absolute top-full left-0 mt-2 z-50 bg-white p-2 rounded-xl shadow-xl w-72 border border-gray-100 grid grid-cols-8 gap-1 h-56 overflow-y-auto animate-fade-in-up custom-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:bg-gray-100 p-1.5 rounded transition-colors">
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1 hidden sm:block" />

            {/* Mic */}
            <button
              onClick={(e) => { e.stopPropagation(); isListening ? stopListening() : startListening(); }}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 border ${isListening ? 'border-red-200 text-red-600 bg-red-50 animate-pulse' : 'border-transparent text-gray-700 hover:bg-gray-200 hover:border-gray-200'}`}
              title="Ditado"
            >
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{isListening ? 'Ouvindo...' : 'Ditar'}</span>
            </button>

          </div>

          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors ml-4" title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div
          className="flex-1 overflow-y-auto p-8 transition-colors duration-300"
          style={{ backgroundColor: color }}
        >
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className={`w-full bg-transparent border-none text-2xl font-bold text-gray-900 placeholder-gray-500/50 mb-4 focus:ring-0 px-0 outline-none ${fontFamily}`}
            placeholder="Título"
          />
          <textarea
            value={content}
            onChange={handleContentChange}
            className={`w-full h-full min-h-[300px] bg-transparent border-none text-gray-800 placeholder-gray-500/50 resize-none focus:ring-0 px-0 outline-none leading-relaxed ${fontFamily} ${fontSize}`}
            placeholder="Digite suas ideias..."
          />
        </div>

        {/* Footer Info & Save */}
        <div className="p-3 border-t border-gray-100 bg-white flex justify-between items-center text-xs text-gray-500">

          <div className="flex gap-4">
            <span>{content.length}/{MAX_CHARS} caracteres</span>
            {note.updated_at && (
              <span>Editado em: {new Date(note.updated_at).toLocaleDateString('pt-BR')}</span>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-200 transform hover:-translate-y-0.5 transition-all">Salvar Alterações</button>
          </div>
        </div>
      </div>
    </div>
  )
}
