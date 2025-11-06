import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4300';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        if (!action) {
            return NextResponse.json(
                { error: 'Action parameter required' },
                { status: 400 }
            );
        }

        // Proxy the control request to the backend
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/control/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!backendResponse.ok) {
            // Return success for demo purposes if backend is not available
            return NextResponse.json({
                message: `Mining ${action.replace('-', ' ')} command sent (backend not available)`,
                status: 'demo_mode'
            });
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Control API Error:', error);
        return NextResponse.json(
            { error: 'Failed to execute mining control command' },
            { status: 500 }
        );
    }
}

