/**
 * PRICING API ENDPOINT
 * 
 * Secure pricing with rate limiting, fraud detection, and caching
 */

import { NextRequest, NextResponse } from 'next/server';
import { secureGetPricingForUser } from '@/services/azora-pricing/pricing-engine-secure';

export const runtime = 'edge'; // Use edge runtime for global deployment

export async function GET(request: NextRequest) {
  try {
    // Extract request info
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    const couponCode = request.nextUrl.searchParams.get('coupon') || undefined;
    
    // Get pricing with full security
    const pricing = await secureGetPricingForUser(ip, userAgent, couponCode);
    
    // Build response with rate limit headers
    const response = NextResponse.json(pricing);
    
    if (pricing.rateLimit) {
      response.headers.set('X-RateLimit-Remaining', pricing.rateLimit.remaining.toString());
      response.headers.set('X-RateLimit-Reset', pricing.rateLimit.resetIn.toString());
    }
    
    // Cache for 1 minute
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    
    return response;
  } catch (error: any) {
    console.error('Pricing API error:', error);
    
    // Handle rate limiting
    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60'
          }
        }
      );
    }
    
    // Handle fraud/blocking
    if (error.message.includes('blocked') || error.message.includes('suspicious')) {
      return NextResponse.json(
        { error: 'Request blocked. Please contact support if you believe this is an error.' },
        { status: 403 }
      );
    }
    
    // Handle emergency controls
    if (error.message.includes('unavailable')) {
      return NextResponse.json(
        { error: error.message },
        { status: 503 }
      );
    }
    
    // Generic error
    return NextResponse.json(
      { error: 'Failed to fetch pricing. Please try again.' },
      { status: 500 }
    );
  }
}
