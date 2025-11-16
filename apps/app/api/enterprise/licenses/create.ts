/**
 * POST /api/enterprise/licenses/create
 * Create a new enterprise license (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnterpriseLicenseService } from '@/services/enterprise/license-service';
import { logger } from '@/services/shared/logging';
import { ErrorHandler } from '@/services/payment/error-handler';

interface CreateLicenseRequest {
  organizationName: string;
  organizationEmail: string;
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
  maxUsers: number;
  maxCourses?: number;
  maxApiCalls?: number;
  startDate: string;
  expiryDate: string;
  autoRenew?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const adminUserId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!adminUserId || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body: CreateLicenseRequest = await request.json();

    // Validate required fields
    if (!body.organizationName || !body.organizationEmail || !body.tier || !body.maxUsers || !body.startDate || !body.expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationName, organizationEmail, tier, maxUsers, startDate, expiryDate' },
        { status: 400 }
      );
    }

    logger.info('Creating enterprise license', { adminUserId, organizationName: body.organizationName });

    const licenseService = new EnterpriseLicenseService();
    const license = await licenseService.createLicense({
      organizationName: body.organizationName,
      organizationEmail: body.organizationEmail,
      tier: body.tier,
      maxUsers: body.maxUsers,
      maxCourses: body.maxCourses,
      maxApiCalls: body.maxApiCalls,
      startDate: new Date(body.startDate),
      expiryDate: new Date(body.expiryDate),
      autoRenew: body.autoRenew,
    });

    logger.info('Enterprise license created successfully', { licenseId: license.id });

    return NextResponse.json(
      {
        success: true,
        license,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create enterprise license', { error });
    const errorResponse = ErrorHandler.handle(error);
    return NextResponse.json(errorResponse, { status: 400 });
  }
}
