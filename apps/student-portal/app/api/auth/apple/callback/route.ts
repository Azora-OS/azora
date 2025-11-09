import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, user } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
    }

    // Forward to auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    const response = await fetch(`${authServiceUrl}/auth/apple/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, user }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Apple callback API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}