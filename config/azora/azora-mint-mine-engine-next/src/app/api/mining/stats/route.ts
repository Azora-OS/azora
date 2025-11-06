/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
import { NextResponse } from 'next/server';

// Backend API URL - configure this for your server
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4300';

export async function GET() {
    try {
        // Proxy the request to the backend mining engine
        const backendResponse = await fetch(`${BACKEND_API_URL}/api/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!backendResponse.ok) {
            // Return mock data if backend is not available
            return NextResponse.json({
                mining: {
                    total_mined_usd: 0.0,
                    total_azr_minted: 0.0,
                    active_sessions: 0,
                    avg_hashrate: 42.0
                },
                transactions: {
                    pending_txs: 0,
                    confirmed_txs: 0
                },
                prices: {},
                last_update: new Date().toISOString(),
                status: 'backend_unavailable'
            });
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch mining stats' },
            { status: 500 }
        );
    }
}

