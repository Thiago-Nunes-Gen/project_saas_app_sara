'use client'

import { useState, useRef, useEffect } from 'react'
import {
    Plus,
    Image as ImageIcon,
    Mic,
    RotateCcw,
    Palette,
    Type,
    Check,
    X,
    Pin,
    Smile
} from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { NOTE_COLORS, NOTE_FONTS, NOTE_SIZES } from './constants'

const EMOJIS = [
    '📝', '✅', '⭐', '🎯', '💡', '🔥', '❤️', '💰',
    '📅', '🏠', '🚗', '✈️', '🎓', '💼', '🛒', '🎉',
    '⚠️', '❌', '✨', '👍', '👎', '🤔', '😀', '🎵',
    '📌', '🔖', '📋', '📊', '💻', '📱', '🔔', '⏰',
    '→', '←', '↑', '↓', '•', '◦', '▪', '▸'
]

interface NoteInputProps {
    onSave: (note: any) => void
}

export function NoteInput({ onSave }: NoteInputProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isPinned, setIsPinned] = useState(false)

    // Customization State
    const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0])
    const [selectedFont, setSelectedFont] = useState(NOTE_FONTS[0])
    const [selectedSize, setSelectedSize] = useState(NOTE_SIZES[1]) // Medium default

    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showFontPicker, setShowFontPicker] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const contentRef = useRef<HTMLTextAreaElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Voice Recognition Hook
    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasSupport,
        error: voiceError
    } = useSpeechRecognition({
        onResult: (text) => {
            // Appends text to current content
            setContent(prev => {
                const spacing = prev.length > 0 && !prev.endsWith(' ') ? ' ' : ''
                const newText = prev + spacing + text
                return newText.length <= 3000 ? newText : prev
            })
        }
    })

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isExpanded) {
                    handlePost()
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isExpanded, title, content, selectedColor, selectedFont, selectedSize, isPinned])

    // Auto-resize textarea
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = 'auto'
            contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
        }
    }, [content, isExpanded])

    // ... imports
    const MAX_CHARS = 3000

    // ... inside component
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (text.length <= MAX_CHARS) {
            setContent(text)
        }
    }

    // ... inside component
    const handlePost = () => {
        if (title.trim() || content.trim()) {
            onSave({
                title,
                content,
                color: selectedColor.value,
                is_pinned: isPinned,
                font_family: selectedFont.value,
                font_size: selectedSize.value,
                is_archived: false
            })
            resetForm()
        }
    }

    const handleCancel = () => {
        resetForm()
    }

    const resetForm = () => {
        setIsExpanded(false)
        setTitle('')
        setContent('')
        setIsPinned(false)
        setSelectedColor(NOTE_COLORS[0])
        setSelectedFont(NOTE_FONTS[0])
        setSelectedSize(NOTE_SIZES[1])
        setShowColorPicker(false)
        setShowFontPicker(false)
        setShowEmojiPicker(false)
        if (isListening) stopListening()
    }

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening()
        } else {
            startListening()
        }
    }

    const insertEmoji = (emoji: string) => {
        if (content.length + emoji.length <= MAX_CHARS) {
            setContent(prev => prev + emoji)
        }
        setShowEmojiPicker(false)
    }

    // ... inside render
    return (
        <div
            ref={containerRef}
            className={`relative w-full max-w-2xl mx-auto rounded-xl border transition-all duration-300 ${isExpanded ? 'shadow-lg ring-1 ring-gray-200' : 'shadow-sm hover:shadow-md'
                }`}
            style={{ backgroundColor: selectedColor.value }}
        >
            {/* Close Button (Top Right) */}
            {isExpanded && (
                <button
                    onClick={handleCancel}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-black/5 transition-colors z-10 text-gray-400 hover:text-gray-600"
                    title="Cancelar"
                >
                    <X className="w-5 h-5" />
                </button>
            )}

            {/* Input Area */}
            {/* ... (input and textarea remain same) ... */}
            <div
                className="p-4 cursor-text"
                onClick={() => setIsExpanded(true)}
            >
                {isExpanded && (
                    <input
                        type="text"
                        placeholder="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full bg-transparent border-none text-gray-900 placeholder-gray-500 font-semibold mb-2 focus:ring-0 focus:outline-none outline-none text-lg ${!isExpanded && 'hidden'
                            }`}
                        maxLength={100}
                    />
                )}

                <textarea
                    ref={contentRef}
                    value={content}
                    onChange={handleContentChange}
                    placeholder={isExpanded ? "Criar uma nota..." : "Criar uma nota..."}
                    className={`w-full bg-transparent border-none text-gray-800 placeholder-gray-500 resize-none focus:ring-0 focus:outline-none outline-none ${selectedFont.value
                        } ${selectedSize.value}`}
                    rows={1}
                />

                {isExpanded && (
                    <div className="text-right text-xs text-gray-400 mt-1">
                        {content.length}/{MAX_CHARS}
                    </div>
                )}

                {!isExpanded && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400">
                        <Check className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Expanded Controls */}
            {isExpanded && (
                <div className="flex items-center justify-between px-4 pb-3 pt-1 border-t border-black/5">
                    {/* Actions Left */}
                    <div className="flex items-center gap-1">
                        {/* ... (Voice, Color, Font, Emoji buttons remain same, render logic kept implicitly by React diff if not changed below but safer to include context if replacing huge chunk. I will replace just the container logic or entire expanded controls if needed. Actually let's be precise with replacement chunk) */}
                        {/* Voice Dictation */}
                        <div className="relative group">
                            <button
                                onClick={handleVoiceToggle}
                                className={`p-2 rounded-full hover:bg-black/5 transition-colors relative ${isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-gray-600'
                                    }`}
                                title="Ditado por Voz"
                            >
                                <Mic className="w-4 h-4" />
                            </button>
                            {/* Voice Tooltip */}
                            <div className="absolute top-full left-0 mt-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                {isListening ? "Ouvindo... Fale agora!" : "O áudio é processado pelo navegador."}
                            </div>
                        </div>

                        {/* Color Picker */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowColorPicker(!showColorPicker)
                                    setShowFontPicker(false)
                                    setShowEmojiPicker(false)
                                }}
                                className="p-2 rounded-full hover:bg-black/5 text-gray-600 transition-colors"
                                title="Cor de fundo"
                            >
                                <Palette className="w-4 h-4" />
                            </button>

                            {showColorPicker && (
                                <div
                                    className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 flex gap-1 flex-wrap w-64 z-50"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {NOTE_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => {
                                                setSelectedColor(color)
                                                setShowColorPicker(false)
                                            }}
                                            className={`w-6 h-6 rounded-full border ${color.border} hover:scale-110 transition-transform ${selectedColor.value === color.value ? 'ring-2 ring-gray-400' : ''
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Typography Picker */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowFontPicker(!showFontPicker)
                                    setShowColorPicker(false)
                                    setShowEmojiPicker(false)
                                }}
                                className="p-2 rounded-full hover:bg-black/5 text-gray-600 transition-colors"
                                title="Tipografia"
                            >
                                <Type className="w-4 h-4" />
                            </button>

                            {showFontPicker && (
                                <div
                                    className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-xl border border-gray-100 w-56 z-50 flex flex-col gap-3"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* Font Families */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Fonte</h4>
                                        <div className="grid grid-cols-1 gap-1">
                                            {NOTE_FONTS.map(font => (
                                                <button
                                                    key={font.value}
                                                    onClick={() => setSelectedFont(font) /* Keep open for Size selection */}
                                                    className={`px-2 py-1 text-left text-sm rounded hover:bg-gray-50 ${font.value} ${selectedFont.value === font.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                                        }`}
                                                >
                                                    {font.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Font Sizes */}
                                    <div className="border-t border-gray-100 pt-2">
                                        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Tamanho</h4>
                                        <div className="flex gap-2">
                                            {NOTE_SIZES.map(size => (
                                                <button
                                                    key={size.value}
                                                    onClick={() => { setSelectedSize(size); setShowFontPicker(false); }}
                                                    className={`flex-1 py-1 text-xs rounded hover:bg-gray-50 border ${selectedSize.value === size.value
                                                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-medium'
                                                        : 'border-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {size.name[0]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Emoji Picker */}
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowEmojiPicker(!showEmojiPicker)
                                    setShowColorPicker(false)
                                    setShowFontPicker(false)
                                }}
                                className="p-2 rounded-full hover:bg-black/5 text-gray-600 transition-colors"
                                title="Inserir Emoji"
                            >
                                <Smile className="w-4 h-4" />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute top-full left-0 mt-2 z-50 bg-white p-2 rounded-xl shadow-xl w-64 border border-gray-100 grid grid-cols-6 gap-1 h-48 overflow-y-auto custom-scrollbar">
                                    {EMOJIS.map(e => (
                                        <button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:bg-gray-100 p-1 rounded transition-colors">
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions Right - Pin & Post */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsPinned(!isPinned)}
                            className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isPinned ? 'text-gray-900 bg-black/5' : 'text-gray-400'
                                }`}
                            title={isPinned ? "Desafixar nota" : "Fixar nota"}
                        >
                            <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                        </button>

                        <button
                            onClick={handlePost}
                            disabled={!content.trim() && !title.trim()}
                            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            Postar Nota
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
