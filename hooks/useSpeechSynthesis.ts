import { useState, useEffect, useCallback } from 'react'

export function useSpeechSynthesis() {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices()
                setVoices(availableVoices)

                // Tenta recuperar do localStorage
                const savedVoiceURI = localStorage.getItem('sara_voice_uri')
                if (savedVoiceURI) {
                    const savedVoice = availableVoices.find(v => v.voiceURI === savedVoiceURI)
                    if (savedVoice) {
                        setSelectedVoice(savedVoice)
                        return
                    }
                }

                // Fallback: Tenta encontrar uma voz feminina em PT-BR
                const ptVoice = availableVoices.find(v =>
                    v.lang.includes('pt-BR') && (v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Francisca'))
                ) || availableVoices.find(v => v.lang.includes('pt-BR'))

                if (ptVoice) {
                    setSelectedVoice(ptVoice)
                }
            }

            loadVoices()

            // Alguns navegadores carregam as vozes assincronamente
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    const changeVoice = (voice: SpeechSynthesisVoice) => {
        setSelectedVoice(voice)
        localStorage.setItem('sara_voice_uri', voice.voiceURI)
    }

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return

        // Limpa falas anteriores
        window.speechSynthesis.cancel()

        // 1. Remove Emojis (Regex para faixas unicode de emojis)
        const textWithoutEmojis = text
            .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
            // Remove markdown básico (* e #) para não ler "asterisco"
            .replace(/[*_#]/g, '')
            // Remove sequências repetidas de caracteres técnicos (ex: =====, -----)
            .replace(/([=\-_*~.]{3,})/g, '')
            .trim()

        if (!textWithoutEmojis) return

        const utterance = new SpeechSynthesisUtterance(textWithoutEmojis)
        utterance.lang = 'pt-BR'

        if (selectedVoice) {
            utterance.voice = selectedVoice
        }

        // Ajustes finos para parecer mais natural
        utterance.rate = 1.1 // Um pouco mais rápido
        utterance.pitch = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }, [selectedVoice])

    const cancel = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }, [])

    return {
        speak,
        cancel,
        isSpeaking,
        voices,
        selectedVoice,
        changeVoice,
        hasSupport: typeof window !== 'undefined' && !!window.speechSynthesis
    }
}
