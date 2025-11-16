import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/gdpr/data-export
 * Export all user data in machine-readable format (GDPR Right to Data Portability)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Fetch from database
    const userData = {
      user: {
        id: userId,
        email: 'user@example.com',
        name: 'User Name',
        role: 'STUDENT',
        createdAt: new Date()
      },
      enrollments: [],
      payments: [],
      wallets: [],
      assessments: [],
      chatSessions: [],
      consentRecords: []
    };
    
    // Return as JSON file download
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${userId}-${new Date().toISOString()}.json"`
      }
    });
  } catch (error) {
    console.error('[GDPR] Failed to export user data', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}
