'use client'

import { Pin, Archive, Trash2, Edit2, RotateCcw } from 'lucide-react'
import { NOTE_COLORS, NOTE_FONTS, NOTE_SIZES } from './constants'

interface NoteCardProps {
    note: any
    onEdit: () => void
    onPin: () => void
    onArchive: () => void
    onDelete: () => void
    onRestore?: () => void
}

export function NoteCard({ note, onEdit, onPin, onArchive, onDelete, onRestore }: NoteCardProps) {
    // Find color definition to get border class
    const colorDef = NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0]

    // Font and Size classes
    const fontClass = note.font_family || 'font-sans'
    const sizeClass = note.font_size || 'text-base'

    const isArchived = note.is_archived

    return (
        <div
            className={`group relative rounded-xl border ${colorDef.border} p-4 transition-all duration-200 hover:shadow-md break-inside-avoid mb-4`}
            style={{ backgroundColor: note.color }}
        >
            {/* Title */}
            {(note.title) && (
                <h3 className={`font-semibold text-gray-900 mb-2 ${fontClass} text-lg leading-tight`}>
                    {note.title}
                </h3>
            )}

            {/* Content */}
            {(note.content) && (
                <div
                    className={`text-gray-800 whitespace-pre-wrap ${fontClass} ${sizeClass} leading-relaxed`}
                >
                    {note.content}
                </div>
            )}

            {/* Hover Actions Overlay (Pin) - Only for Active Notes */}
            {!isArchived && (
                <div className={`absolute top-2 right-2 flex gap-1 transition-opacity z-20 ${note.is_pinned ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPin(); }}
                        className={`p-1.5 rounded-full hover:bg-black/10 ${note.is_pinned ? 'text-gray-900 bg-black/5' : 'text-gray-500'
                            }`}
                        title={note.is_pinned ? "Desafixar" : "Fixar no topo"}
                    >
                        <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-current' : ''}`} />
                    </button>
                </div>
            )}

            {/* Footer Actions (appears on hover) */}
            <div className="mt-4 pt-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity border-t border-black/5 relative z-20">
                <div className="text-xs text-black/40 font-medium">
                    {new Date(note.updated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>

                <div className="flex gap-1">
                    {!isArchived ? (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1.5 rounded text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                title="Editar"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onArchive(); }}
                                className="p-1.5 rounded text-gray-600 hover:bg-black/10 hover:text-gray-900"
                                title="Arquivar"
                            >
                                <Archive className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-1.5 rounded text-gray-600 hover:bg-red-100 hover:text-red-600"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onRestore && onRestore(); }}
                                className="p-1.5 rounded text-gray-600 hover:bg-green-100 hover:text-green-600"
                                title="Restaurar Nota"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-1.5 rounded text-gray-600 hover:bg-red-100 hover:text-red-600"
                                title="Excluir Permanentemente"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Click overlay to edit (Active Only) */}
            {!isArchived && (
                <div
                    className="absolute inset-0 z-10 cursor-pointer"
                    onClick={onEdit}
                    title="Clique para editar"
                />
            )}
        </div>
    )
}
