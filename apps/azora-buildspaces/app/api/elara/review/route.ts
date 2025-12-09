import { NextRequest, NextResponse } from 'next/server';
import { ElaraAIService, ElaraContext } from '@/lib/services/elara-integration';

/**
 * Elara Code Review API
 * 
 * Reviews code for:
 * - Quality and best practices
 * - Potential bugs
 * - Performance issues
 * - Security concerns
 */

interface ReviewRequest {
    code: string;
    language: string;
    context?: {
        roomType?: string;
        currentFile?: string;
    };
}

/**
 * POST /api/elara/review
 * Review code and get feedback
 */
export async function POST(request: NextRequest) {
    try {
        const body: ReviewRequest = await request.json();
        const { code, language, context = {} } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
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
            codeContext: code,
            conversationHistory: [],
        };

        const elara = ElaraAIService.getInstance();
        const response = await elara.reviewCode(code, language, elaraContext);

        return NextResponse.json({
            success: true,
            language,
            response
        });

    } catch (error) {
        console.error('[Elara Review] Error:', error);
        return NextResponse.json(
            { error: 'Failed to review code', details: String(error) },
            { status: 500 }
        );
    }
}
