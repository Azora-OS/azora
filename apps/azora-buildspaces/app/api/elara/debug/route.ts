import { NextRequest, NextResponse } from 'next/server';
import { ElaraAIService, ElaraContext } from '@/lib/services/elara-integration';

/**
 * Elara Debug API
 * 
 * Helps debug code by:
 * - Analyzing error messages
 * - Identifying root causes
 * - Providing fixes
 * - Explaining the issue
 */

interface DebugRequest {
    code: string;
    error: string;
    language: string;
    context?: {
        roomType?: string;
        currentFile?: string;
    };
}

/**
 * POST /api/elara/debug
 * Debug code with an error message
 */
export async function POST(request: NextRequest) {
    try {
        const body: DebugRequest = await request.json();
        const { code, error, language, context = {} } = body;

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        if (!error) {
            return NextResponse.json({ error: 'Error message is required' }, { status: 400 });
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
        const response = await elara.debugCode(code, error, language, elaraContext);

        return NextResponse.json({
            success: true,
            language,
            response
        });

    } catch (error) {
        console.error('[Elara Debug] Error:', error);
        return NextResponse.json(
            { error: 'Failed to debug code', details: String(error) },
            { status: 500 }
        );
    }
}
