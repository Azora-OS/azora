/**
 * POST /api/enterprise/licenses/activate
 * Activate an enterprise license
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseLicenseService } from '@/services/enterprise/license-service';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface ActivateLicenseRequest {
  licenseKey: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ActivateLicenseRequest = await request.json();

    // Validate required fields
    if (!body.licenseKey) {
      return NextResponse.json(
        { error: 'Missing required field: licenseKey' },
        { status: 400 }
      );
    }

    logger.info('Activating enterprise license', { userId, licenseKey: body.licenseKey });

    const licenseService = new EnterpriseLicenseService();
    const license = await licenseService.activateLicense(body.licenseKey);

    logger.info('Enterprise license activated successfully', { licenseId: license.id });

    return NextResponse.json(
      {
        success: true,
        license,
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to activate enterprise license', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
