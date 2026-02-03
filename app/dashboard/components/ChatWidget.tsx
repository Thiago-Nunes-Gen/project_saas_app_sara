'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, Loader2, Phone, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { FormattedMessage } from '@/lib/formatMessage'
import { useClient } from '@/hooks/useClient'

// URL da foto da SARA no Supabase Storage (bucket público)
const SARA_AVATAR_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Imagens%20Sara/sara_avatar.png`

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

// Mensagens de demonstração para usuários sem WhatsApp
const DEMO_MESSAGES = [
    {
        question: "O que você pode fazer?",
        answer: "Posso te ajudar com várias coisas! 📱\n\n• Gerenciar seus **lembretes** e compromissos\n• Controlar suas **finanças** pessoais\n• Criar e organizar **listas** de tarefas\n• Guardar **documentos** importantes\n• Fazer **pesquisas** na web\n\nE o melhor: tudo pelo WhatsApp! 🚀"
    },
    {
        question: "Como funciona?",
        answer: "É super simples! Depois de vincular seu WhatsApp:\n\n1️⃣ Me envie uma mensagem como \"Lembra de pagar a conta amanhã\"\n2️⃣ Eu entendo e crio o lembrete automaticamente\n3️⃣ No horário certo, te aviso pelo WhatsApp!\n\nSem apps extras, sem complicação. Tudo na conversa! 💬"
    }
]

export default function ChatWidget() {
    const { client, loading: clientLoading } = useClient()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [avatarError, setAvatarError] = useState(false)
    const [demoStep, setDemoStep] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Verifica se tem WhatsApp vinculado
    const hasWhatsApp = client?.whatsapp_id

    // Scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Foca no input ao abrir
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen])

    const sendMessage = async () => {
        if (!input.trim() || sending) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setSending(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            })

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response || data.error || 'Erro ao obter resposta',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])

        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Desculpe, tive um problema. Tente novamente!',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setSending(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    // Função para simular conversa demo
    const handleDemoQuestion = (questionIndex: number) => {
        const demo = DEMO_MESSAGES[questionIndex]
        if (!demo) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: demo.question,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setSending(true)

        // Simula delay da resposta
        setTimeout(() => {
            const assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: demo.answer,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMsg])
            setSending(false)
            setDemoStep(questionIndex + 1)
        }, 1000)
    }

    // Renderiza o chat sem WhatsApp (versão demo)
    const renderDemoChat = () => (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-96 h-full md:h-[550px] bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border-0 md:border border-slate-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                        {avatarError ? (
                            <span className="text-lg">🤖</span>
                        ) : (
                            <img
                                src={SARA_AVATAR_URL}
                                alt="SARA"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">SARA</h3>
                        <p className="text-white/70 text-xs">Demonstração</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="space-y-4">
                        {/* Mensagem de boas-vindas */}
                        <div className="flex justify-start">
                            <div className="max-w-[85%] p-4 rounded-2xl bg-slate-700 text-slate-100 rounded-bl-md">
                                <p className="text-sm mb-3">
                                    👋 Olá! Eu sou a <strong>SARA</strong>, sua assistente pessoal.
                                </p>
                                <p className="text-sm text-slate-300">
                                    Para usar todas as minhas funcionalidades, vincule seu WhatsApp.
                                    Mas primeiro, que tal conhecer o que posso fazer?
                                </p>
                            </div>
                        </div>

                        {/* Botões de demonstração */}
                        <div className="flex flex-col gap-2 pl-2">
                            <button
                                onClick={() => handleDemoQuestion(0)}
                                className="flex items-center gap-2 text-left text-sm bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-colors"
                            >
                                <Sparkles size={16} />
                                O que você pode fazer?
                            </button>
                            <button
                                onClick={() => handleDemoQuestion(1)}
                                className="flex items-center gap-2 text-left text-sm bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-colors"
                            >
                                <MessageCircle size={16} />
                                Como funciona?
                            </button>
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-md'
                                : 'bg-slate-700 text-slate-100 rounded-bl-md'
                                }`}
                        >
                            <div className="text-sm">
                                {msg.role === 'assistant' ? (
                                    <FormattedMessage content={msg.content} />
                                ) : (
                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-md">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        </div>
                    </div>
                )}

                {/* Mostra mais perguntas após resposta */}
                {demoStep > 0 && demoStep < DEMO_MESSAGES.length && !sending && (
                    <div className="flex flex-col gap-2 pl-2">
                        <button
                            onClick={() => handleDemoQuestion(demoStep)}
                            className="flex items-center gap-2 text-left text-sm bg-purple-600/20 text-purple-300 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-colors"
                        >
                            <MessageCircle size={16} />
                            {DEMO_MESSAGES[demoStep].question}
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* CTA para vincular WhatsApp */}
            <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-white mb-1">
                                Vincule seu WhatsApp
                            </p>
                            <p className="text-xs text-slate-400 mb-3">
                                Para usar a SARA de verdade, conecte seu número.
                            </p>
                            <a
                                href="/dashboard/configurar-whatsapp"
                                className="inline-flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300"
                            >
                                Conectar agora
                                <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    // Renderiza o chat completo (com WhatsApp)
    const renderFullChat = () => (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-96 h-full md:h-[500px] bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border-0 md:border border-slate-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center">
                        {avatarError ? (
                            <span className="text-lg">🤖</span>
                        ) : (
                            <img
                                src={SARA_AVATAR_URL}
                                alt="SARA"
                                className="w-full h-full object-cover"
                                onError={() => setAvatarError(true)}
                            />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">SARA</h3>
                        <p className="text-white/70 text-xs">Sua assistente pessoal</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        <p className="text-lg mb-2">👋 Olá!</p>
                        <p className="text-sm">Como posso te ajudar hoje?</p>
                    </div>
                )}

                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-md'
                                : 'bg-slate-700 text-slate-100 rounded-bl-md'
                                }`}
                        >
                            <div className="text-sm">
                                {msg.role === 'assistant' ? (
                                    <FormattedMessage content={msg.content} />
                                ) : (
                                    <span className="whitespace-pre-wrap">{msg.content}</span>
                                )}
                            </div>
                            <p className="text-xs opacity-50 mt-1">
                                {msg.timestamp.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="flex justify-start">
                        <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-md">
                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        disabled={sending}
                        className="flex-1 bg-slate-800 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={sending || !input.trim()}
                        className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    )

    // Não mostra nada enquanto carrega
    if (clientLoading) return null

    return (
        <>
            {/* Botão flutuante - ajustado para bottom nav no mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-40 ${isOpen ? 'hidden' : ''}`}
            >
                <MessageCircle size={22} />
            </button>

            {/* Chat Window - versão demo ou completa */}
            {isOpen && (hasWhatsApp ? renderFullChat() : renderDemoChat())}
        </>
    )
}
