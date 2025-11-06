import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationSlug = searchParams.get('org') || 'acme';

    const authToken = process.env.SENTRY_AUTH_TOKEN || '1a2b3c';

    const response = await fetch(`https://sentry.io/api/0/organizations/${organizationSlug}/projects/`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sentry API error: ${response.status} ${response.statusText}`);
    }

    const projects = await response.json();

    return NextResponse.json({
      success: true,
      organization: organizationSlug,
      projects,
    });
  } catch (error) {
    console.error('Sentry projects API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Sentry projects' },
      { status: 500 }
    );
  }
}

