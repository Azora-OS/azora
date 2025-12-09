import { NextRequest, NextResponse } from 'next/server';
import { ElaraAIService, ElaraContext, ElaraMessage } from '@/lib/services/elara-integration';
import { getKnowledgeOcean } from '@/lib/services/knowledge-ocean-client';
import { getAIFamilyService, AgentPersonality } from '@/lib/services/ai-family-client';
import { ConstitutionalValidator } from '@/lib/services/constitutional-ai';

/**
 * Elara AI Chat API
 * 
 * Provides AI-powered responses with:
 * - Constitutional AI validation
 * - Knowledge Ocean context enhancement
 * - Multi-agent collaboration
 */

interface ChatRequest {
    message: string;
    agent?: AgentPersonality;
    context?: {
        roomType?: string;
        currentFile?: string;
        currentLanguage?: string;
        codeContext?: string;
    };
    history?: ElaraMessage[];
    useKnowledge?: boolean;
}

/**
 * POST /api/elara/chat
 * Send a message to Elara (or another AI Family agent)
 */
export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { message, agent = 'elara', context = {}, history = [], useKnowledge = true } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Constitutional AI pre-check on user input
        const validator = ConstitutionalValidator.getInstance();
        const inputValidation = await validator.validateContent(message, context.roomType || 'general');

        if (!inputValidation.approved && inputValidation.score < 0.3) {
            return NextResponse.json({
                success: false,
                response: {
                    message: "I can't help with that request as it conflicts with our community guidelines.",
                    validated: false,
                    validationScore: inputValidation.score,
                    concerns: inputValidation.concerns
                }
            });
        }

        // Get knowledge context if enabled
        let knowledgeContext = '';
        if (useKnowledge) {
            try {
                const knowledgeOcean = getKnowledgeOcean();
                knowledgeContext = await knowledgeOcean.getContext(message, 1000);
            } catch (e) {
                console.log('[Elara API] Knowledge Ocean unavailable');
            }
        }

        // Build Elara context
        const elaraContext: ElaraContext = {
            userId: 'anonymous', // Would come from session
            sessionId: `session-${Date.now()}`,
            roomType: (context.roomType as ElaraContext['roomType']) || 'code-chamber',
            currentFile: context.currentFile,
            currentLanguage: context.currentLanguage,
            codeContext: context.codeContext,
            conversationHistory: history,
        };

        // Enhance message with knowledge context
        const enhancedMessage = knowledgeContext
            ? `${message}\n\n[Context from Knowledge Base]:\n${knowledgeContext}`
            : message;

        // Get response from appropriate agent
        let response;

        if (agent === 'elara') {
            const elara = ElaraAIService.getInstance();
            response = await elara.chat(enhancedMessage, elaraContext);
        } else {
            // Use AI Family Service for other agents
            const aiFamily = getAIFamilyService();
            const familyResponse = await aiFamily.chat({
                agent,
                message: enhancedMessage,
                context: {
                    roomType: context.roomType,
                    currentCode: context.codeContext,
                    language: context.currentLanguage,
                    history: history.map(m => ({ role: m.role, content: m.content }))
                }
            });

            response = {
                message: familyResponse.response,
                suggestions: familyResponse.suggestions,
                codeBlocks: familyResponse.codeBlocks,
                validated: true,
                validationScore: 1.0
            };
        }

        return NextResponse.json({
            success: true,
            agent: agent,
            response
        });

    } catch (error) {
        console.error('[Elara API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * GET /api/elara/chat
 * Get available agents and capabilities
 */
export async function GET() {
    const elara = ElaraAIService.getInstance();
    const aiFamily = getAIFamilyService();

    return NextResponse.json({
        service: 'Elara AI Chat',
        version: '1.0.0',
        capabilities: elara.getCapabilities(),
        agents: aiFamily.getAgentProfiles(),
        endpoints: {
            chat: 'POST /api/elara/chat',
            generate: 'POST /api/elara/generate',
            review: 'POST /api/elara/review',
            debug: 'POST /api/elara/debug'
        }
    });
}
