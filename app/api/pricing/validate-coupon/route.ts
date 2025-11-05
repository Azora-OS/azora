/**
 * COUPON VALIDATION API
 */

import { NextRequest, NextResponse } from 'next/server';
import { applyCouponCode } from '@/services/azora-pricing/admin-controls';
import { detectUserLocation } from '@/services/azora-pricing/pricing-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponCode } = body;
    
    if (!couponCode || typeof couponCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }
    
    // Get user location
    const location = await detectUserLocation();
    
    // Validate coupon
    const result = applyCouponCode(
      couponCode.toUpperCase(),
      location.countryCode,
      'TIER_1' // Default tier for validation
    );
    
    return NextResponse.json({
      valid: result.valid,
      discountPercent: result.discountPercent,
      message: result.message
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
