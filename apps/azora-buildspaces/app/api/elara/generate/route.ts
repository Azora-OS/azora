import { NextRequest, NextResponse } from 'next/server';
import { ElaraAIService, ElaraContext } from '@/lib/services/elara-integration';

/**
 * Elara Code Generation API
 * 
 * Generates production-ready code with:
 * - Best practices
 * - Error handling
 * - Clear documentation
 */

interface GenerateRequest {
    prompt: string;
    language: string;
    context?: {
        roomType?: string;
        currentFile?: string;
        codeContext?: string;
    };
}

/**
 * POST /api/elara/generate
 * Generate code from a description
 */
export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { prompt, language, context = {} } = body;

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!language) {
            return NextResponse.json({ error: 'Language is required' }, { status: 400 });
        }

        const elaraContext: ElaraContext = {
            userId: 'anonymous',
            sessionId: `session-${Date.now()}`,
            roomType: (context.roomType as ElaraContext['roomType']) || 'code-chamber',
            currentFile: context.currentFile,
            currentLanguage: language,
            codeContext: context.codeContext,
            conversationHistory: [],
        };

        const elara = ElaraAIService.getInstance();
        const response = await elara.generateCode(prompt, language, elaraContext);

        return NextResponse.json({
            success: true,
            language,
            response
        });

    } catch (error) {
        console.error('[Elara Generate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate code', details: String(error) },
            { status: 500 }
        );
    }
}
