import { NextRequest, NextResponse } from 'next/server';
import { AgentFactory } from '../../../services/agent-factory';

/**
 * AI Chat API Route
 * 
 * Handles chat requests to AI agents in BuildSpaces.
 * Routes to appropriate agent based on request.
 * 
 * POST /api/ai/chat
 * Body: { agent: string, message: string, context: object }
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { agent: agentName, message, context = {} } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get the appropriate agent
        const agent = AgentFactory.getAgent(agentName || 'elara');

        // Send message to agent
        const response = await agent.sendMessage(message, {
            ...context,
            roomType: context.roomType,
            projectId: context.projectId,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error('[AI Chat API] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process chat request',
                from: 'system',
                response: 'I apologize, but I encountered an error. Please try again.'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/chat
 * Returns available agents for the current room
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomType = searchParams.get('roomType') || 'code-chamber';

        const agents = AgentFactory.getAgentsForRoom(roomType);
        const agentList = agents.map(agent => ({
            name: agent.name,
            role: agent.role,
        }));

        return NextResponse.json({
            roomType,
            agents: agentList,
            availableAgents: AgentFactory.listAgents(),
        });
    } catch (error) {
        console.error('[AI Chat API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get agents' },
            { status: 500 }
        );
    }
}
