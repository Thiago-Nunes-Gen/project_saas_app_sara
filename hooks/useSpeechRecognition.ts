import { useState, useEffect, useCallback } from 'react'

export interface UseSpeechRecognitionProps {
    onResult?: (text: string) => void
    onEnd?: () => void
}

export function useSpeechRecognition({ onResult, onEnd }: UseSpeechRecognitionProps = {}) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition()
                recognitionInstance.continuous = false
                recognitionInstance.interimResults = true
                recognitionInstance.lang = 'pt-BR'
                setRecognition(recognitionInstance)
            } else {
                setError('Navegador não suporta reconhecimento de voz.')
            }
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                setTranscript('')
                setError(null)
                recognition.start()
                setIsListening(true)
            } catch (err) {
                console.error(err)
            }
        }
    }, [recognition, isListening])

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop()
            setIsListening(false)
        }
    }, [recognition, isListening])

    useEffect(() => {
        if (!recognition) return

        recognition.onresult = (event: any) => {
            let finalTranscript = ''
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                } else {
                    interimTranscript += event.results[i][0].transcript
                }
            }

            const currentText = finalTranscript || interimTranscript
            setTranscript(currentText)

            if (finalTranscript && onResult) {
                onResult(finalTranscript)
            }
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error)
            setError(event.error)
            setIsListening(false)
        }

        recognition.onend = () => {
            setIsListening(false)
            if (onEnd) onEnd()
        }
    }, [recognition, onResult, onEnd])

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        hasSupport: !!recognition,
        error
    }
}
