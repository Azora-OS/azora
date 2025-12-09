import { NextResponse } from 'next/server';
import { ThembaAgent } from '@azora/shared-ai';
import { AgenticContext } from '@azora/shared-ai';

// Initialize the agent
const agent = new ThembaAgent();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, context } = body;

        // Construct the Agentic Context
        const agentContext: AgenticContext = {
            userId: 'user-default', // TODO: Get from session
            sessionId: 'session-default',
            environment: 'web',
            timestamp: Date.now(),
            metadata: {
                lastMessage: message,
                ...context
            },
            requiresDeepReasoning: false
        };

        // Run the agentic loop
        // For this simple chat interaction, we might want a direct "chat" method on the agent,
        // but sticking to the "pattern -> reason -> act" loop is more "agentic".
        // However, BaseAgent doesn't have a direct "chat" method exposed in the interface.
        // We'll simulate a pattern detection of "user-request" manually here for the chat.

        const pattern = {
            id: 'chat-interaction',
            type: 'opportunity',
            confidence: 1,
            indicators: [message],
            detectedAt: Date.now(),
            severity: 'low'
        };

        // Ask the agent to reason about this input
        const reasoning = await agent.reason(pattern as any, agentContext);

        // Return the reasoning and proposed action
        return NextResponse.json({
            success: true,
            response: reasoning.finalDecision.reasoning, // The "thought" or message
            action: reasoning.finalDecision,
            agent: agent.name
        });

    } catch (error) {
        console.error('Agent Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process agent request' },
            { status: 500 }
        );
    }
}
