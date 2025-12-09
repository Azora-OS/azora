"use client"

import { useState, useEffect, useCallback } from 'react'

interface UseVoiceReturn {
    isListening: boolean
    transcript: string
    startListening: () => void
    stopListening: () => void
    resetTranscript: () => void
    isSupported: boolean
}

export function useVoice(): UseVoiceReturn {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition) {
            setIsSupported(true)
            const recognitionInstance = new (window as any).webkitSpeechRecognition()
            recognitionInstance.continuous = true
            recognitionInstance.interimResults = true
            recognitionInstance.lang = 'en-US'

            recognitionInstance.onresult = (event: any) => {
                // let currentTranscript = ''
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPart = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        setTranscript((prev) => prev + transcriptPart + ' ')
                    } else {
                        // currentTranscript += transcriptPart
                    }
                }
            }

            recognitionInstance.onend = () => {
                setIsListening(false)
            }

            setRecognition(recognitionInstance)
        }
    }, [])

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start()
                setIsListening(true)
            } catch (error) {
                console.error("Voice recognition start error:", error)
            }
        }
    }, [recognition, isListening])

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop()
            setIsListening(false)
        }
    }, [recognition, isListening])

    const resetTranscript = useCallback(() => {
        setTranscript('')
    }, [])

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported
    }
}
