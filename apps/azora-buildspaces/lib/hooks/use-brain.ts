"use client"

import { useState } from 'react'

interface UseBrainReturn {
    isLoading: boolean
    response: string | null
    askAgent: (message: string, context?: Record<string, unknown>) => Promise<void>
}

export function useBrain(): UseBrainReturn {
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState<string | null>(null)

    const askAgent = async (message: string, context: Record<string, unknown> = {}) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, context })
            })

            const data = await res.json()
            if (data.success) {
                setResponse(data.response)
            } else {
                console.error("Agent error:", data.error)
                setResponse("I'm having trouble thinking right now.")
            }
        } catch (error) {
            console.error("Network error:", error)
            setResponse("I can't reach the server.")
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        response,
        askAgent
    }
}
