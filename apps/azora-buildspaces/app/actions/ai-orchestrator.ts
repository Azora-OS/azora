'use server'

// import { AzoraSDK } from '@azora/sdk'

// Initialize SDK (assuming it handles env vars internally or we pass them)
// const sdk = new AzoraSDK({
//     apiKey: process.env.AZORA_API_KEY || 'mock-key', // TODO: Real key
//     endpoint: process.env.AZORA_API_ENDPOINT || 'http://localhost:3014'
// })

export async function chat(message: string, context: any) {
    try {
        console.log('AI Orchestrator received:', message)

        // TODO: Use real SDK call when available/verified
        // const response = await sdk.ai.chat({ message, context })

        // For now, implementing a basic "Echo" + Logic to prove connectivity
        // This replaces the client-side mock

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 800))

        if (message.toLowerCase().includes('hello')) {
            return "Hello! I am Elara, your AI architect. How can I help you build today?"
        }

        if (message.toLowerCase().includes('create file')) {
            return "I can help with that. Please specify the filename and content."
        }

        return `I processed your request: "${message}". \n\nContext: ${context?.activeFile ? `Working on ${context.activeFile}` : 'No active file'}.`

    } catch (error) {
        console.error('AI Orchestrator Error:', error)
        return "I encountered an error processing your request."
    }
}
