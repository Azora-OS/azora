/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

export async function GET() {
    try {
        // Check backend health
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Short timeout for health checks
            signal: AbortSignal.timeout(5000),
        });

        if (backendResponse.ok) {
            const data = await backendResponse.json();
            return NextResponse.json({
                ...data,
                frontend_status: 'healthy',
                deployment_type: 'vercel'
            });
        } else {
            // Backend not available
            return NextResponse.json({
                overall_status: 'frontend_only',
                frontend_status: 'healthy',
                backend_status: 'unavailable',
                deployment_type: 'vercel',
                message: 'Running in frontend-only mode - backend services not connected'
            });
        }
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({
            overall_status: 'frontend_only',
            frontend_status: 'healthy',
            backend_status: 'unavailable',
            deployment_type: 'vercel',
            message: 'Running in frontend-only mode - backend services not connected'
        });
    }
}

