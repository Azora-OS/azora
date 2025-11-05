import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authToken = process.env.SENTRY_AUTH_TOKEN || '1a2b3c';

    const response = await fetch('https://sentry.io/api/0/organizations/', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
    }

    const organizations = await response.json();

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error('Sentry organizations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sentry organizations' },
      { status: 500 }
    );
  }
}

