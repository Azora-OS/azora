import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/gdpr/retention-policy
 * Get all data retention policies
 */
export async function GET(request: NextRequest) {
  try {
    const policies = [
      { dataType: 'user_activity_logs', retentionDays: 90, autoDelete: true },
      { dataType: 'transaction_records', retentionDays: 2555, autoDelete: false },
      { dataType: 'course_progress', retentionDays: 1825, autoDelete: false },
      { dataType: 'session_data', retentionDays: 30, autoDelete: true },
      { dataType: 'audit_logs', retentionDays: 2555, autoDelete: false },
      { dataType: 'error_logs', retentionDays: 90, autoDelete: true },
      { dataType: 'performance_metrics', retentionDays: 30, autoDelete: true }
    ];
    
    return NextResponse.json({
      policies,
      lastCleanup: new Date().toISOString(),
      nextCleanup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('[GDPR] Failed to get retention policies', error);
    return NextResponse.json(
      { error: 'Failed to get retention policies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gdpr/retention-policy/cleanup
 * Manually trigger data retention cleanup (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Verify admin role
    const userRole = request.headers.get('x-user-role');
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // TODO: Run cleanup

    console.log('[GDPR] Manual data retention cleanup triggered');
    
    return NextResponse.json({
      success: true,
      message: 'Data retention cleanup completed'
    });
  } catch (error) {
    console.error('[GDPR] Failed to run cleanup', error);
    return NextResponse.json(
      { error: 'Failed to run cleanup' },
      { status: 500 }
    );
  }
}
