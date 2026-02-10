'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, MessageCircle, Loader2, Phone, Sparkles, ArrowRight, Mic, MicOff, Volume2, VolumeX, Settings, Check, AlertCircle } from 'lucide-react'
import { FormattedMessage } from '@/lib/formatMessage'
import { useClient } from '@/hooks/useClient'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'

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
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const [avatarError, setAvatarError] = useState(false)
    const [demoStep, setDemoStep] = useState(0)
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const [autoSendCountdown, setAutoSendCountdown] = useState<number | null>(null)
    const autoSendTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Hooks de Voz
    const { speak, cancel: stopSpeaking, isSpeaking, voices, selectedVoice, changeVoice } = useSpeechSynthesis()

    // Função chamada quando a SARA termina de falar ou quando usuario cancela
    const handleVoiceResult = (text: string) => {
        setInput(text)
    }

    const {
        startListening,
        stopListening,
        isListening,
        transcript,
        hasSupport: hasMicSupport
    } = useSpeechRecognition({
        onResult: handleVoiceResult
    })

    // Sincroniza o texto falado com o input em tempo real
    useEffect(() => {
        if (isListening && transcript) {
            setInput(transcript)
            // Se estiver ouvindo, cancela qualquer countdown anterior
            if (autoSendCountdown !== null) {
                setAutoSendCountdown(null)
                if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
            }
        }
    }, [transcript, isListening])

    // Detecta fim da fala para iniciar auto-envio
    useEffect(() => {
        if (!isListening && input.trim().length > 0 && !sending) {
            // Usuário parou de falar e tem texto -> Inicia countdown
            // Pequeno delay para garantir que não foi um "stop" acidental ou pausa breve
            setAutoSendCountdown(5)
        }
    }, [isListening]) // Removido input das dependências para evitar trigger ao digitar, apenas ao parar de ouvir

    // Gerencia o Countdown
    useEffect(() => {
        if (autoSendCountdown === null) return

        if (autoSendCountdown > 0) {
            autoSendTimerRef.current = setTimeout(() => {
                setAutoSendCountdown(prev => (prev !== null ? prev - 1 : null))
            }, 1000)
        } else if (autoSendCountdown === 0) {
            // Tempo esgotou -> Enviar
            sendMessage()
            setAutoSendCountdown(null)
        }

        return () => {
            if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
        }
    }, [autoSendCountdown])

    // Cancela auto-envio se usuário digitar algo
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
        if (autoSendCountdown !== null) {
            setAutoSendCountdown(null)
            if (autoSendTimerRef.current) clearTimeout(autoSendTimerRef.current)
        }
    }

    // Verifica se tem WhatsApp vinculado
    const hasWhatsApp = client?.whatsapp_id

    // Scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Foca no input ao abrir
    useEffect(() => {
        if (isOpen && !isSettingsOpen) {
            inputRef.current?.focus()
        }
    }, [isOpen, isSettingsOpen])

    const sendMessage = async () => {
        if (!input.trim() || sending) return

        stopListening()
        if (autoSendCountdown !== null) setAutoSendCountdown(null)

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
            const replyText = data.response || data.error || 'Erro ao obter resposta'

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: replyText,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])

            if (isVoiceEnabled) {
                speak(replyText)
            }

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

    const toggleListening = () => {
        if (isListening) {
            stopListening()
        } else {
            stopSpeaking()
            startListening()
        }
    }

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

            if (isVoiceEnabled) {
                speak(demo.answer)
            }
        }, 1000)
    }

    // Estados do Tutorial
    const [showTutorial, setShowTutorial] = useState(false)
    const [tutorialStep, setTutorialStep] = useState(0)

    useEffect(() => {
        // Verifica se já viu o tutorial
        const tutorialSeen = localStorage.getItem('sara_chat_tutorial_seen')
        if (!tutorialSeen && isOpen) {
            // Pequeno delay para garantir que a UI carregou
            setTimeout(() => setShowTutorial(true), 500)
        }
    }, [isOpen])

    const handleNextStep = () => {
        if (tutorialStep < 3) {
            setTutorialStep(prev => prev + 1)
        } else {
            // Fim do tutorial
            setShowTutorial(false)
            localStorage.setItem('sara_chat_tutorial_seen', 'true')
        }
    }

    const TutorialOverlay = () => {
        if (!showTutorial) return null

        return (
            <div className="absolute inset-0 z-[60] pointer-events-none">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity duration-500" />

                {/* Step 0: Welcome */}
                {tutorialStep === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-auto animate-fade-in">
                        <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-2xl max-w-xs text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                            <h3 className="text-xl font-bold mb-2 text-purple-700">Novidade! 🎙️</h3>
                            <p className="text-sm text-slate-600 mb-6">
                                A SARA agora tem voz! Fale e ouça suas respostas.
                                <br />Vou te mostrar como funciona rapidinho.
                            </p>
                            <button
                                onClick={handleNextStep}
                                className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors w-full"
                            >
                                Vamos lá!
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 1: Mic (Bottom Left) */}
                {tutorialStep === 1 && (
                    <div className="absolute bottom-20 left-4 pointer-events-auto animate-fade-in z-[70]">
                        <div className="relative">
                            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45 translate-y-1/2" />
                            <div className="bg-white text-slate-900 p-4 rounded-xl shadow-xl w-64 relative">
                                <h4 className="font-bold text-purple-700 mb-1 flex items-center gap-2">
                                    <Mic size={16} /> Fale com a SARA
                                </h4>
                                <p className="text-xs text-slate-600 mb-3">
                                    Toque no microfone para enviar mensagens de voz em vez de digitar.
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        className="text-xs font-bold text-purple-600 hover:text-purple-800"
                                    >
                                        Próximo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Settings (Top Right) */}
                {tutorialStep === 2 && (
                    <div className="absolute top-16 right-12 pointer-events-auto animate-fade-in z-[70]">
                        <div className="relative">
                            <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 -translate-y-1/2" />
                            <div className="bg-white text-slate-900 p-4 rounded-xl shadow-xl w-64 relative">
                                <h4 className="font-bold text-purple-700 mb-1 flex items-center gap-2">
                                    <Settings size={16} /> Personalize com atenção
                                </h4>
                                <p className="text-xs text-slate-600 mb-3">
                                    A voz da SARA depende do seu dispositivo (celular ou PC). Por isso, ela pode soar diferente em cada lugar! 📱💻
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        className="text-xs font-bold text-purple-600 hover:text-purple-800"
                                    >
                                        Próximo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Volume (Top Right 2) */}
                {tutorialStep === 3 && (
                    <div className="absolute top-16 right-20 pointer-events-auto animate-fade-in z-[70]">
                        <div className="relative">
                            <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 -translate-y-1/2" />
                            <div className="bg-white text-slate-900 p-4 rounded-xl shadow-xl w-64 relative">
                                <h4 className="font-bold text-purple-700 mb-1 flex items-center gap-2">
                                    <Volume2 size={16} /> Controle de Voz
                                </h4>
                                <p className="text-xs text-slate-600 mb-3">
                                    Prefere silêncio? Ative ou desative a fala da SARA a qualquer momento.
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleNextStep}
                                        className="bg-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700"
                                    >
                                        Entendi!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Filtra apenas vozes em PT-BR para exibir nas configurações
    const availableVoices = voices.filter(v => v.lang.includes('pt-BR') || v.lang.includes('pt_BR'))

    const renderSettings = () => (
        <div className="absolute inset-x-0 bottom-0 top-[72px] bg-slate-900 z-20 flex flex-col animate-fade-in">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-white font-medium flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    Configuração de Voz
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-2">
                    <p className="text-sm text-slate-400">Escolha a voz da SARA:</p>
                    {availableVoices.length === 0 ? (
                        <p className="text-xs text-yellow-500">Nenhuma voz em Português encontrada no seu dispositivo.</p>
                    ) : (
                        <div className="space-y-2">
                            {availableVoices.map(voice => (
                                <button
                                    key={voice.voiceURI}
                                    onClick={() => {
                                        changeVoice(voice)
                                        speak("Olá! Esta é a minha nova voz. O que achou?")
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedVoice?.voiceURI === voice.voiceURI
                                        ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                        }`}
                                >
                                    <span className="text-sm text-left truncate pr-2">{voice.name}</span>
                                    {selectedVoice?.voiceURI === voice.voiceURI && (
                                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-purple-400 mt-1" />
                        <div>
                            <p className="text-sm text-white font-medium mb-1">Por que a voz muda?</p>
                            <p className="text-xs text-slate-400">
                                A SARA usa as vozes instaladas no seu aparelho.
                                No iPhone ela pode ter uma voz, no Windows outra.
                                Isso garante que ela funcione rápido e sem travar! 🚀
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    const ChatHeader = () => (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between z-30 relative shrink-0">
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
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        SARA
                        {isSpeaking && <span className="animate-pulse text-[10px] bg-white/20 px-1.5 rounded">Falando...</span>}
                    </h3>
                    <p className="text-white/70 text-xs">
                        {isListening ? 'Ouvindo você...' : isSettingsOpen ? 'Configurações' : 'Sua assistente pessoal'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => {
                        stopSpeaking()
                        setIsVoiceEnabled(!isVoiceEnabled)
                    }}
                    className={`p-2 rounded-lg transition-colors ${!isVoiceEnabled ? 'text-white/50' : 'text-white hover:bg-white/10'}`}
                    title={isVoiceEnabled ? "Desativar voz" : "Ativar voz"}
                >
                    {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
                <button
                    onClick={() => {
                        setIsSettingsOpen(!isSettingsOpen)
                        stopSpeaking()
                    }}
                    className={`p-2 rounded-lg transition-colors ${isSettingsOpen ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    title="Configurações de Voz"
                >
                    <Settings size={20} />
                </button>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-white/70 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    )

    const renderDemoChat = () => (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-96 h-full md:h-[550px] bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border-0 md:border border-slate-700">
            <ChatHeader />
            <TutorialOverlay />

            {isSettingsOpen ? renderSettings() : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="space-y-4">
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
                </>
            )}
        </div>
    )

    const renderFullChat = () => (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 w-full md:w-96 h-full md:h-[500px] bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border-0 md:border border-slate-700">
            <ChatHeader />
            <TutorialOverlay />

            {isSettingsOpen ? renderSettings() : (
                <>
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

                    <div className="p-4 border-t border-slate-700">
                        <div className="flex gap-2">
                            {hasMicSupport && (
                                <button
                                    onClick={toggleListening}
                                    className={`p-3 rounded-xl transition-all duration-300 flex items-center justify-center ${isListening
                                        ? 'bg-red-500 text-white animate-pulse'
                                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                    title="Falar com a SARA"
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyPress}
                                placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
                                disabled={sending}
                                className="flex-1 bg-slate-800 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                            />

                            {/* Auto-send Countdown Overlay */}
                            {autoSendCountdown !== null && (
                                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-800/90 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 border border-slate-700 shadow-xl backdrop-blur-sm animate-bounce-short">
                                    <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                    Enviando em {autoSendCountdown}s...
                                    <button
                                        onClick={() => setAutoSendCountdown(null)}
                                        className="ml-2 text-slate-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={sendMessage}
                                disabled={sending || !input.trim()}
                                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )

    if (clientLoading) return null

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-[70px] md:bottom-6 right-4 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 z-40 ${isOpen ? 'hidden' : ''}`}
            >
                <MessageCircle size={22} />
            </button>

            {isOpen && (hasWhatsApp ? renderFullChat() : renderDemoChat())}
        </>
    )
}

